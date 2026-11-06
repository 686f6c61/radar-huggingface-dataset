# pulkit-thukral/title-optimizer-grpo

## Resumen

`title-optimizer-grpo` es un adaptador LoRA sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario de Hugging Face pulkit-thukral, especializado en la generacion de titulos para anuncios de Airbnb. El adaptador resuelve un problema concreto: producir titulos atractivos que solo mencionen caracteristicas que el anuncio declara explicitamente, evitando la invencion de servicios o comodidades. Forma parte del proyecto listing-title-optimizer, una cadena de entrenamiento SFT → DPO → GRPO sobre datos publicos de Inside Airbnb.

El adaptador se entreno con GRPO (Group Relative Policy Optimization) durante 500 pasos sobre 4.000 anuncios, utilizando unicamente recompensas programaticas: longitud (peso 1.0), reglas de estilo de Airbnb (0.5) y ausencia de afirmaciones no respaldadas por el anuncio (2.0). El resultado es un modelo altamente especializado, de proposito muy acotado, que no debe confundirse con un modelo de proposito general.

Es relevante ahora porque demuestra un patron reproducible de ajuste fino con RL sobre modelos pequenos (1.700 millones de parametros) para tareas de generacion de texto con restricciones verificables, ejecutable en hardware de consumo (Apple M4 de 24 GB). Su licencia Apache 2.0 facilita su reutilizacion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | 1.700 millones (modelo base); el adaptador LoRA es un subconjunto |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; entrenado en bf16 |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parametros. El ajuste se realiza mediante LoRA con rango 16 y alpha 32 aplicado a todas las capas lineales, en precision bf16. El entrenamiento se ejecuto en un Apple M4 con 24 GB de memoria unificada, lo que demuestra la viabilidad del flujo en hardware de consumo.

El proceso de entrenamiento completo consta de tres fases encadenadas: SFT, DPO y GRPO. Este adaptador concreto corresponde a la fase GRPO, entrenada durante 500 pasos sobre 4.000 anuncios del split de entrenamiento del dataset pulkit-thukral/listing-title-optimizer. Las recompensas son puramente programaticas y verificables: longitud del titulo (peso 1.0), cumplimiento de reglas de estilo de Airbnb (0.5) y ausencia de afirmaciones sobre caracteristicas no declaradas en el anuncio (2.0). Es importante senalar que el adaptador es encadenado: se entreno sobre el modelo SFT ya fusionado, por lo que debe aplicarse primero title-optimizer-sft, fusionarlo y despues aplicar este adaptador. El tokenizer guardado tiene desactivado el modo de razonamiento (thinking mode) de Qwen3, de modo que todos los tokens generados se destinan al titulo.

## Capacidades

- Generacion de titulos para anuncios de Airbnb en ingles, con una longitud objetivo de 25-45 caracteres y un maximo de 50.
- Cumplimiento de reglas de estilo: sentence case, sin emojis, sin mayusculas sostenidas, sin signos de exclamacion multiples, sin comillas ni prefijos como "Title:".
- Restriccion de veracidad: solo menciona caracteristicas que el anuncio declara explicitamente (tipo de propiedad, barrio, hasta 20 comodidades y descripcion).
- Formato de entrada estructurado mediante un system prompt fijo y un mensaje de usuario con los datos del anuncio.
- Generacion determinista recomendada (do_sample=False) con max_new_tokens=32.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.
- No dispone de vision, audio ni modo de razonamiento activo (desactivado en el tokenizer).

## Casos de uso

- Generacion automatica de titulos en plataformas de alquiler vacacional: el modelo recibe los datos estructurados del anuncio y devuelve un titulo listo para publicar, respetando el limite de 50 caracteres y el estilo de la plataforma.
- Asistencia a anfitriones en la redaccion: integrado en un formulario de publicacion, sugiere titulos alternativos que destacan la caracteristica mas distintiva (vistas, ubicacion, comodidad diferencial) sin inventar servicios.
- Auditoria de calidad de anuncios existentes: dado un anuncio y su titulo actual, el modelo puede generar una version alternativa que sirva como referencia para detectar titulos con afirmaciones no respaldadas.
- Procesamiento por lotes de catalogos: al ser un modelo de 1.700 millones de parametros, puede ejecutarse en lotes sobre miles de anuncios en hardware modesto, generando titulos de forma masiva.
- Filtrado previo a revision humana: en un pipeline de moderacion, el modelo produce borradores que un revisor humano valida, reduciendo el tiempo de redaccion.
- Experimentacion academica con RL para generacion de texto restringida: sirve como ejemplo reproducible de GRPO con recompensas programaticas sobre un modelo pequeno, util para investigar tecnicas de alineacion con restricciones verificables.
- Integracion en herramientas de marketing inmobiliario: genera titulos para listados de alquiler de corta duracion en ingles, adaptables a otros dominios inmobiliarios con el ajuste adecuado.

## Benchmarks y rendimiento

Los resultados de evaluacion se obtuvieron sobre 500 anuncios reservados de anfitriones no vistos en entrenamiento. La tasa de victoria es una preferencia por pares evaluada por claude-sonnet-5-5 contra el titulo original del anfitrion (orden intercambiado, empates = ½), con intervalo de confianza del 95% por bootstrap.

| Sistema | Tasa de victoria vs original (IC 95%) | Alucinacion ↓ | ≤50 caracteres ↑ | Problemas de estilo ↓ |
|---|---|---|---|---|
| Original (anfitrion) | — | 3,0% | 100,0% | 2,4% |
| Modelo base | 36,1% (32,1%–40,2%) | 4,0% | 23,8% | 0,4% |
| SFT | 65,3% (61,3%–69,4%) | 0,8% | 97,2% | 0,0% |
| SFT + DPO | 68,5% (64,4%–72,3%) | 0,2% | 99,8% | 0,0% |
| SFT + GRPO (este adaptador) | 67,7% (63,8%–71,4%) | 0,2% | 100,0% | 0,0% |

El autor advierte que, sobre 50 pares etiquetados manualmente, el juez coincidio con el autor en el 64% de los casos (IC 95% 50-78%, kappa de Cohen = 0,29). Las tasas de victoria deben interpretarse como "Sonnet lo prefiere", no como una preferencia humana verificada. Las columnas de alucinacion, longitud y estilo son basadas en reglas y no dependen del juez.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en bf16 requiere aproximadamente 3,4 GB solo para pesos; con el adaptador fusionado y overhead de activaciones, el consumo tipico ronda los 4-6 GB. En cuantizacion de 8 bits, alrededor de 2 GB; en 4 bits, alrededor de 1,2 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en bf16; una RTX 3060 de 12 GB o superior es suficiente. Para mayor throughput, una RTX 4090 o A100 ofrecen margen sobrado.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090. El autor lo entreno en un Apple M4 de 24 GB, lo que confirma su viabilidad en hardware de consumo.
- Opciones de despliegue: transformers con PEFT (flujo recomendado por el autor, fusionando primero el adaptador SFT y luego el GRPO); tambien es posible exportar a GGUF y usar llama.cpp u Ollama tras la fusion, aunque el autor no documenta este flujo. vLLM y TGI son compatibles con el modelo base fusionado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| title-optimizer-grpo (este) | 1.700 M (base) + LoRA | no disponible | Generacion de titulos Airbnb con GRPO | Apache 2.0 | Hugging Face |
| title-optimizer-sft | 1.700 M (base) + LoRA | no disponible | Primera fase de la cadena, SFT | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1.700 M | no disponible en la informacion proporcionada | Modelo generalista | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros adaptadores especializados en generacion de titulos en la informacion proporcionada.

## Limitaciones y advertencias

- La comprobacion de alucinaciones es lexica (22 tipos de afirmaciones), por lo que no detecta parafrasis ni puede verificar afirmaciones numericas ("3BR") o de ubicacion ("5 min a la playa").
- El modelo se entreno con anuncios en ingles de Londres, Nueva York, Sideny, Toronto y Dublin; su rendimiento fuera de estos mercados o en otros idiomas no esta validado.
- El juez automatico no es un huesped real: no se ha medido la tasa de clics ni el impacto comercial de los titulos generados.
- La coincidencia entre el juez y el autor es moderada (kappa = 0,29), lo que limita la fiabilidad de las tasas de victoria como metrica absoluta.
- El adaptador es encadenado: requiere aplicar primero title-optimizer-sft y fusionarlo; su uso aislado sobre el modelo base produce resultados incorrectos.
- El modo de razonamiento de Qwen3 esta desactivado en el tokenizer guardado; no debe reactivarse si se espera el comportamiento entrenado.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar el cumplimiento de las condiciones del modelo base Qwen3-1.7B y de los datos de Inside Airbnb utilizados en el entrenamiento.
- Riesgo de sobreajuste al dominio de Airbnb: el modelo no es adecuado para generacion de texto general ni para otras tareas fuera de la redaccion de titulos de anuncios.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/pulkit-thukral/title-optimizer-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Adaptador SFT previo: https://huggingface.co/pulkit-thukral/title-optimizer-sft
- Dataset de entrenamiento: https://huggingface.co/datasets/pulkit-thukral/listing-title-optimizer
- Repositorio del proyecto: https://github.com/PulkitT01/listing-title-optimizer
- Prompts de entrenamiento: https://github.com/PulkitT01/listing-title-optimizer/blob/main/src/title_optimizer/prompts.py
