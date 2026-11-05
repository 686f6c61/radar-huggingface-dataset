# pulkit-thukral/title-optimizer-dpo

## Resumen

`title-optimizer-dpo` es un adaptador LoRA para el modelo base Qwen3-1.7B, desarrollado por el usuario independiente pulkit-thukral, orientado a una tarea muy concreta: generar titulos de anuncios de Airbnb que sean atractivos y, a la vez, se limiten a mencionar caracteristicas que el anuncio declara explicitamente. El adaptador se ha entrenado con DPO (Direct Preference Optimization) sobre 625 pares de preferencia construidos a partir de candidatos generados por un modelo SFT previo, usando titulos que incumplian reglas como negativos duros y el resto ordenados por un juez basado en Claude Sonnet.

El modelo forma parte de un pipeline mas amplio (SFT, DPO y GRPO sobre datos publicos de Inside Airbnb) y es relevante como ejemplo de especializacion estrecha mediante tecnicas de alineamiento ligero: un adaptador de apenas 0,1 GB que se aplica sobre un modelo de 1.700 millones de parametros y mejora metricas de fidelidad factual y estilo en un dominio acotado. No es un modelo generalista, sino una pieza de un sistema de generacion de titulos para marketplaces de alojamiento.

La ficha describe exclusivamente la informacion publicada en la model card y en los metadatos de HuggingFace; cualquier dato no presente se indica como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | No disponible (el modelo base Qwen3-1.7B tiene 1.700 millones; el adaptador LoRA no publica su recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-1.7B; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors, bf16 durante el entrenamiento) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |
| Rango LoRA | r=16, alpha=32, aplicado a todas las capas lineales |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Dataset de entrenamiento | pulkit-thukral/listing-title-optimizer (625 pares de preferencia) |
| Precisión de entrenamiento | bf16 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-1.7B, un transformer decoder-only del que la model card no detalla la arquitectura interna (numero de capas, atencion, etc.); lo unico relevante para esta ficha es que el adaptador LoRA se aplica sobre todas las capas lineales con r=16 y alpha=32, en precision bf16. El entrenamiento se realizo en un Apple M4 con 24 GB de memoria unificada, lo que da una idea del reducido coste computacional del ajuste.

El proceso es un DPO encadenado: primero se entrena un adaptador SFT (`pulkit-thukral/title-optimizer-sft`), se fusiona con el modelo base y sobre ese modelo fusionado se entrena este adaptador DPO. Los 625 pares de preferencia se generaron con el comando `title-opt preferences` a partir del dataset `pulkit-thukral/listing-title-optimizer`; los titulos que incumplian las reglas del sistema se usaron como negativos duros y el resto se ordeno con un juez `claude-sonnet-5-5`. El tokenizador guardado desactiva el modo "thinking" de Qwen3, de modo que todos los tokens generados se destinan al titulo. Los hiperparametros completos estan en `run_config.json` del repositorio.

## Capacidades

- Generacion de titulos de anuncios de Airbnb en ingles, con una sola respuesta por peticion y sin texto adicional.
- Cumplimiento de restricciones de formato: maximo 50 caracteres (ideal 25-45), sentence case, sin emojis, sin mayusculas sostenidas, sin signos de exclamacion multiples, sin comillas ni prefijos como "Title:".
- Fidelidad factual al anuncio: solo menciona caracteristicas declaradas (tipo de propiedad, barrio, hasta 20 amenities y descripcion); la metrica de alucinacion medida es del 0,2 %.
- Seleccion de gancho: prioriza la caracteristica mas distintiva (vista, ubicacion, amenity destacada) y evita repetir datos ya visibles para el huesped (ciudad, numero de camas) salvo que sean el gancho.
- Formato conversacional con plantilla de chat (system prompt + mensaje de usuario con el listado estructurado).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento expuesto; el thinking mode de Qwen3 esta desactivado en el tokenizador guardado.
- Capacidad multilingue limitada al ingles; el entrenamiento se realizo con anuncios de Londres, Nueva York, Sídney, Toronto y Dublín.

## Casos de uso

- Generacion automatica de titulos para anfitriones en plataformas de alquiler vacacional: el adaptador recibe tipo de propiedad, barrio, amenities y descripcion, y devuelve un titulo de menos de 50 caracteres que respeta las reglas de estilo y evita inventar servicios; es adecuado por su baja tasa de alucinacion (0,2 % en la evaluacion del autor).
- Herramienta de sugerencia en el alta de anuncios: integrada en el flujo de publicacion, propone un titulo al anfitrion a partir de los campos ya rellenados, reduciendo el esfuerzo manual y manteniendo coherencia con el contenido declarado.
- Reescritura y optimizacion de titulos existentes: dado un anuncio con un titulo pobre o demasiado largo, el modelo genera una alternativa que destaca la caracteristica mas atractiva, con una tasa de exito frente al titulo original del 68,5 % segun el juez Sonnet.
- Control de calidad editorial en marketplaces: usar el adaptador como generador de referencia y comparar titulos propuestos por otros sistemas para detectar incumplimientos de longitud o estilo (la metrica de estilo es del 0,0 % de incidencias).
- Prototipado rapido de sistemas de generacion de texto especializados: al ser un adaptador de 0,1 GB sobre un modelo de 1.700 millones de parametros, sirve como plantilla reproducible de pipeline SFT + DPO con evaluacion por pares de preferencia.
- Investigacion sobre alineamiento con DPO en dominios estrechos: el repositorio incluye pares de preferencia, configuracion de entrenamiento y evaluacion con intervalos de confianza bootstrap, util para estudiar el efecto del DPO frente a SFT y GRPO en una tarea concreta.

## Benchmarks y rendimiento

Evaluacion sobre 500 anuncios reservados de anfitriones no vistos en entrenamiento. La tasa de victoria es la preferencia por pares de `claude-sonnet-5-5` frente al titulo original del anfitrion (orden intercambiado, empates = ½), con intervalo de confianza bootstrap del 95 %.

| Sistema | Tasa de victoria vs original (IC 95 %) | Alucinacion ↓ | ≤50 caracteres ↑ | Problemas de estilo ↓ |
|---|---|---|---|---|
| Original (anfitrion) | — | 3,0 % | 100,0 % | 2,4 % |
| Modelo base | 36,1 % (32,1 %–40,2 %) | 4,0 % | 23,8 % | 0,4 % |
| SFT | 65,3 % (61,3 %–69,4 %) | 0,8 % | 97,2 % | 0,0 % |
| SFT + DPO (este adaptador) | 68,5 % (64,4 %–72,3 %) | 0,2 % | 99,8 % | 0,0 % |
| SFT + GRPO | 67,7 % (63,8 %–71,4 %) | 0,2 % | 100,0 % | 0,0 % |

El propio autor advierte que, en 50 pares etiquetados manualmente, el juez coincidio con el evaluador humano el 64 % de las veces (IC 95 % 50–78 %, kappa de Cohen = 0,29), por lo que las tasas de victoria deben interpretarse como "Sonnet prefiere este titulo", no como preferencia humana verificada. Las columnas de alucinacion, longitud y estilo son basadas en reglas y no dependen del juez.

## Requisitos de hardware

- El adaptador pesa 0,1 GB y se aplica sobre Qwen3-1.7B; el modelo fusionado completo requiere el espacio de los pesos del modelo base en bf16 (aproximadamente 3,4 GB) mas el adaptador.
- Entrenamiento realizado en un Apple M4 con 24 GB de memoria unificada, lo que confirma que el ajuste cabe en hardware de consumo.
- Inferencia viable en GPU de consumo con al menos 8 GB de VRAM en bf16 (estimacion a partir del tamano del modelo base; no publicada por el autor), y en CPU mediante cuantizacion del modelo base.
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090, L4 o A10 son suficientes para el modelo fusionado en bf16.
- Opciones de despliegue: PEFT + Transformers (flujo documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| title-optimizer-dpo (este) | Adaptador LoRA sobre Qwen3-1.7B | No disponible | Generacion de titulos Airbnb con DPO | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| title-optimizer-sft | Adaptador LoRA sobre Qwen3-1.7B | No disponible | Misma tarea, solo SFT (requerido antes del DPO) | Apache 2.0 | HuggingFace |
| Qwen3-1.7B (base) | 1.700 millones | No disponible en esta ficha | Modelo generalista multilingue | Apache 2.0 | HuggingFace |

No se dispone de informacion sobre otros adaptadores o modelos especializados en generacion de titulos de alquiler vacacional con los que comparar rendimiento de forma directa.

## Limitaciones y advertencias

- La comprobacion de alucinaciones es lexica (22 tipos de afirmacion): no detecta parafrasis ni puede verificar afirmaciones numericas ("3BR") o de ubicacion ("5 min to the beach"), por lo que la tasa real de invencion puede ser superior al 0,2 % medido.
- Entrenado solo con anuncios en ingles de Londres, Nueva York, Sídney, Toronto y Dublín; el rendimiento en otros idiomas o mercados no esta evaluado.
- El juez automatico no es un huesped: no se ha medido el click-through ni el impacto real en reservas.
- El adaptador esta encadenado: debe aplicarse primero `title-optimizer-sft`, fusionarlo y despues aplicar este DPO; usarlo de forma aislada sobre el modelo base no reproduce el comportamiento documentado.
- Requiere respetar el formato de listado y el system prompt de entrenamiento (propiedad, barrio, hasta 20 amenities, descripcion); entradas fuera de ese formato degradan la calidad.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen3-1.7B tiene su propia licencia que debe verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad.
- El modo thinking de Qwen3 esta desactivado en el tokenizador guardado; si se usa otro tokenizador, el modelo podria emitir tokens de razonamiento en lugar del titulo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pulkit-thukral/title-optimizer-dpo
- Adaptador SFT previo: https://huggingface.co/pulkit-thukral/title-optimizer-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/pulkit-thukral/listing-title-optimizer
- Repositorio del proyecto: https://github.com/PulkitT01/listing-title-optimizer
- Prompts del sistema: https://github.com/PulkitT01/listing-title-optimizer/blob/main/src/title_optimizer/prompts.py
