# eins78/Kolibri-1-mlx-mixed-4-8-bit

## Resumen

Kolibri-1-mlx-mixed-4-8-bit es una conversión al formato MLX del modelo Aleph-Alpha/Kolibri-1, un transformer de tipo mixture-of-experts (MoE) desarrollado originalmente por Aleph Alpha. Esta variante, publicada por el usuario eins78, cuantiza el checkpoint FP8 original con precisión mixta: cuantización afín de 4 bits para los expertos enrutados, 8 bits para proyecciones de atención, experto compartido, embeddings y `lm_head`, y router MoE en bfloat16 sin cuantizar. El objetivo es hacer viable la inferencia de un modelo de 78.100 millones de parámetros en hardware Apple Silicon con memoria unificada.

El modelo base cuenta con 50 capas, 384 expertos, 6 expertos enrutados más 1 compartido por token, y atención de ventana deslizante de 513 tokens en un patrón 4:1 entre atención local y completa. Está pensado para generación de texto y conversación, con soporte de modo de razonamiento (thinking) y de llamadas a herramientas en formato Hermes. La relevancia actual radica en que permite ejecutar un MoE de gran tamaño en un Mac de 64 GB, algo poco habitual fuera de clústeres con GPU.

Se trata de un modelo cuantizado, no de los pesos originales, por lo que su fidelidad respecto al modelo de referencia está limitada por la propia cuantización. El autor documenta una verificación numérica detallada frente a una referencia en PyTorch, así como métricas de velocidad y memoria en un Apple M4 Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), transformer; 50 capas, 384 expertos, 6 enrutados + 1 compartido por token; atencion de ventana deslizante de 513 tokens en patron 4:1 (sliding:full) |
| Parametros totales | 78.103.074.560 (~78,1 mil millones) |
| Parametros activos | no disponible (numero exacto de parametros activos por token no indicado; se enrutan 6 de 384 expertos mas 1 compartido) |
| Longitud de contexto | no disponible (el modelo base no especifica contexto total en la informacion; ventana deslizante de 513 tokens en patron 4:1) |
| Tipos de cuantizacion | Precisión mixta: 4 bits (expertos enrutados, `switch_mlp.*`), 8 bits (proyecciones de atencion, experto compartido, embeddings, `lm_head`), bfloat16 sin cuantizar (router MoE, `mlp.gate`); grupo de 64, cuantizacion afín |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX, mlx-lm 0.32.0) |

## Arquitectura y entrenamiento

Kolibri 1 es un transformer de tipo mixture-of-experts con 50 capas y 384 expertos, de los cuales se activan 6 enrutados mas 1 compartido por token. Incorpora atencion de ventana deslizante de 513 tokens combinada con atencion completa en un patron de 4:1 (cuatro capas de ventana por cada capa de atencion completa). Esta ficha corresponde a una conversion cuantizada: el checkpoint FP8 original de Aleph Alpha (con escalas de bloque 128x128) se transformo al formato MLX mediante el conversor kolibri-mlx, aplicando cuantizacion afín de grupo 64 con precision mixta.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones especificas de decodificacion especulativa. Cabe destacar que el modelo base requiere un plugin especifico de vLLM (`aleph_alpha_inference/kolibri1.py`) para su ejecucion, lo que indica que la arquitectura no esta soportada de forma nativa por las librerias estandar.

## Capacidades

- Generacion de texto y conversacion multi-turno, con un tokenizador y plantilla de chat orientados a aleman e ingles.
- Modo de razonamiento (thinking) controlable mediante `reasoning_effort` con valores `"none"`, `"low"`, `"medium"` o `"high"`, o bien con `enable_thinking=false`; cuando esta activo, el modelo emite primero un bloque `<think>...</think>`.
- Soporte de tool calling / function calling en estilo Hermes: `<tool_call>{"name": ..., "arguments": ...}</tool_call>`, devuelto como `tool_calls` mediante el parser `json_tools` de mlx-lm.
- Capacidades multilingues limitadas a aleman e ingles segun los metadatos del modelo.
- Integracion con servidor compatible con OpenAI a traves de mlx-lm (`serve.py`), incluyendo `chat_template_kwargs` en el cuerpo de la peticion.
- No se documentan capacidades de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Asistente conversacional en aleman o ingles sobre hardware Apple: el modelo puede gestionar dialogos multi-turno con plantilla de chat y modo de razonamiento configurable, aprovechando su ejecucion local en un Mac con 64 GB de memoria.
- Despliegue local de un MoE de gran tamano sin GPU dedicada: gracias a la cuantizacion mixta 4/8 bits, permite servir un modelo de 78.100 millones de parametros en un unico equipo Apple Silicon.
- Automatizacion con agentes y llamadas a herramientas: el soporte de tool calling en formato Hermes y su parser asociado en mlx-lm facilitan integrarlo en flujos de agente con pasos encadenados.
- Generacion de contenido tecnico en aleman: el modelo cubre especificamente el aleman, un idioma con menos cobertura en modelos abiertos, adecuado para redaccion o resumen en ese idioma.
- Razonamiento controlado por coste: con `reasoning_effort` en `"none"` o `"low"` se puede reducir el coste computacional en tareas simples y subirlo en tareas complejas, ajustando latencia frente a calidad.
- Entornos de prototipado y evaluacion offline: al poder ejecutarse de forma local, resulta util para pruebas de investigacion sin enviar datos a servicios externos, siempre que se respete la licencia.
- Servicio interno compatible con OpenAI: mediante el servidor de mlx-lm se puede exponer un endpoint `/v1/chat/completions` que reciba peticiones en el formato estandar.

## Benchmarks y rendimiento

La model card no presenta resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor incluye en su lugar una verificacion numerica frente a una referencia en PyTorch, que se reproduce a continuacion:

| Comprobacion | Resultado |
|---|---|
| Acuerdo top-1 (este modelo vs referencia), por prompt | 0,385 (13 tok), 0,867 (15), 0,958 (24), 0,966 (618), 0,892 (612); bf16 sin cuantizar: 0,769, 0,933, 1,000, 0,968, 0,931 |
| Solapamiento top-5, por prompt | 0,754, 0,880, 0,925, 0,935, 0,875 |
| KL(referencia, este modelo), media por prompt | 0,526, 0,0146, 0,00996, 0,0174, 0,0690 (suelo bf16: 0,490, 0,0057, 0,00067, 0,0082, 0,036) |
| Implementacion MLX en fp32 vs referencia, encadenada extremo a extremo | top-1 1,000 en todos los prompts, KL aproximada de 1e-11, diferencia maxima de logits 2,3e-4 |
| Decodificacion con cache vs prefill completo | identica a 1e-6 en fp32; ruido a nivel bf16 en el modelo real |
| Prueba de humo del servidor (aleman e ingles, razonamiento on/off, tool call) | supera la prueba |
| Velocidad / memoria en Apple M4 Pro, 64 GB | 50 tokens/s de generacion, ~240 tokens/s de prompt, 45,4 GB de pico |

Nota: la seccion de evaluacion de la model card aparece truncada en la informacion disponible, por lo que no se pueden reproducir los resultados de las suites de evaluacion del autor. Los numeros anteriores corresponden a la verificacion frente a una referencia en PyTorch, no a benchmarks academicos estandar. La propia model card advierte de que la cuantizacion tiene coste de precision y que los datos corresponden a este modelo cuantizado, no a los pesos originales.

## Requisitos de hardware

- Memoria unificada necesaria: aproximadamente 45,4 GB en pico, con 42 GiB en disco. Requiere un Mac con 64 GB de memoria unificada.
- GPU recomendadas: el modelo esta en formato MLX, por lo que esta orientado a Apple Silicon (se cita explicitamente un Apple M4 Pro de 64 GB). No se documenta soporte para A100, H100 o RTX 4090 en esta conversion.
- Compatibilidad con GPU de consumo: no aplicable en el ecosistema MLX; en el ecosistema NVIDIA harian falta los pesos originales y un plugin de vLLM con soporte CUDA.
- Opciones de despliegue: mlx-lm (version 0.32.0) con el paquete externo kolibri-mlx, que registra el `model_type` `kolibri1`. Stock mlx-lm no carga el modelo por si solo; se debe ejecutar `import kolibri_mlx.register` antes de `mlx_lm.load`. El repositorio incluye `generate.py` y `serve.py` (servidor compatible con OpenAI).
- Latencia y throughput estimados: en Apple M4 Pro de 64 GB, 50 tokens/s de generacion y unos 240 tokens/s de procesamiento de prompt, con 45,4 GB de memoria pico.
- Se recomienda muestreo con `temperature 1.0, top_p 0.97, top_k 128`, segun indicacion de Aleph Alpha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eins78/Kolibri-1-mlx-mixed-4-8-bit | 78,1 mil millones (MoE, 6+1 expertos activos) | no disponible (ventana deslizante 513) | safetensors MLX, precision mixta 4/8 bits | apache-2.0 | HuggingFace (0 descargas, 0 likes en la fecha de la informacion) |
| Aleph-Alpha/Kolibri-1 (modelo base) | mismo modelo base | no disponible | checkpoint FP8 y BF16 | apache-2.0 | HuggingFace, pesos originales |
| Otros MoE de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento comparativos frente a modelos equivalentes de otros desarrolladores (por ejemplo, MoE abiertos de rango similar), por lo que no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo cuantizado: la precision es inferior a la del modelo original. El propio autor advierte de que la cuantizacion tiene coste de precision y que las metricas de verificacion corresponden a esta version cuantizada, no a los pesos sin cuantizar.
- Idiomas limitados: solo aleman e ingles segun los metadatos; no hay evidencia de soporte de castellano.
- Sin soporte nativo en mlx-lm estandar: la carga falla con `unsupported model type` salvo que se instale kolibri-mlx y se registre el tipo `kolibri1`, lo que anade dependencia de codigo de terceros.
- Riesgo de alucinacion: no se documenta de forma especifica, pero es inherente a los modelos generativos; debe validarse en produccion.
- Verificacion parcial: la referencia usada por el autor es una reimplementacion en PyTorch del plugin de vLLM, no el propio plugin ejecutado (no habia maquina con CUDA disponible), por lo que la validacion tiene ese caveat reconocido por el autor.
- Prompt muy corto con ruido: el autor senala que el prompt de 13 tokens es ruidoso incluso en bf16, con un acuerdo top-1 de 0,385.
- Requisito de hardware elevado: exige un Mac con 64 GB de memoria unificada; no cabe en equipos de consumo con menos memoria.
- Adopcion nula: 0 descargas y 0 likes en la fecha de la informacion, lo que implica ausencia de validacion por parte de la comunidad.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar la licencia del modelo base Aleph-Alpha/Kolibri-1 y las condiciones de la conversion antes de desplegar en produccion.
- Fechas de publicacion inusuales (2026) en los metadatos, lo que puede indicar datos sinteticos o de prueba; conviene verificarlo antes de usarlo como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eins78/Kolibri-1-mlx-mixed-4-8-bit
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Repositorio del conversor kolibri-mlx: https://github.com/eins78/kolibri-mlx
- Verificacion del conversor: https://github.com/eins78/kolibri-mlx#4-verification
- Script de verificacion por capas: https://github.com/eins78/kolibri-mlx/blob/main/scripts/verify_layerwise.py
- Script de verificacion extremo a extremo: https://github.com/eins78/kolibri-mlx/blob/main/scripts/verify_e2e.py
- Script de prueba de humo del servidor: https://github.com/eins78/kolibri-mlx/blob/main/scripts/smoke_server.py
