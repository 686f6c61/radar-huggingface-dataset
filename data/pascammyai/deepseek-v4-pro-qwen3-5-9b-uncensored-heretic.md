# Pascammyai/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "decensored" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante, Pascammyai, ha aplicado la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo original mediante una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24.

El modelo base concentra su senal de entrenamiento supervisado en matematicas y resolucion de problemas STEM (aproximadamente 250.000 muestras), preservando la eficiencia y desplegabilidad de la clase de 9B parametros. Esta variante heretic mantiene esa base de conocimiento pero reduce drasticamente las negativas: pasa de 100/100 rechazos en el modelo original a 3/100, con una divergencia KL de 0,0422 respecto al original.

Es relevante ahora porque ofrece un modelo de 9B con capacidades de razonamiento estructurado, tool calling y soporte multilingue (en, zh, ko, ja, es, ru) bajo licencia Apache 2.0, pero sin los filtros de seguridad del modelo original. Esto lo hace util para investigacion sobre alineacion, generacion creativa sin restricciones y escenarios donde los rechazos del modelo base resultan problematicos, pero introduce riesgos importantes que el usuario debe evaluar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, con soporte de vision image-text-to-text) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE segun los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (evaluado en NVFP4 y MTP-Q8_0 segun la model card) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B orientado a razonamiento, destilado de DeepSeek-V4-Pro en modo Max Effect. El entrenamiento combina SFT y RL (con GSPO segun los tags) sobre aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset. La model card menciona que, pese a no recibir datos SFT especificos de codigo, se observan pequenas mejoras en programacion y uso de herramientas por transferencia entre dominios.

La innovacion principal de esta variante es la aplicacion de Heretic v2.0.0.dev0, una tecnica de ablacion de rangos arbitrarios (ARA) que modifica los pesos de las capas 9 a 24 para eliminar los comportamientos de rechazo. Los parametros ARA documentados incluyen start_layer_index=9, end_layer_index=24, preserve_good_behavior_weight=0.8264, steer_bad_behavior_weight=0.0003, overcorrect_relative_weight=0.9645 y neighbor_count=12. El modelo base incorpora soporte para vision (pipeline image-text-to-text) y ha sido evaluado con decodificacion especulativa MTP y cuantizacion NVFP4.

## Capacidades

- Generacion de texto y razonamiento multi-paso estructurado, con descomposicion rigurosa de problemas.
- Razonamiento matematico y STEM reforzado mediante destilacion de DeepSeek-V4-Pro.
- Generacion de codigo y transferencia parcial a programacion pese a la ausencia de SFT especifico.
- Tool calling y function calling (tags tool-use y function-calling).
- Soporte de agentes y razonamiento multi-paso.
- Capacidades de vision (pipeline image-text-to-text, arquitectura qwen3_5).
- Multilingue: ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (tag reasoning).
- Ausencia practica de rechazos (3/100 en la evaluacion del autor) por la ablacion heretic.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la ablacion ARA comparando respuestas con el original (100/100 rechazos frente a 3/100), midiendo la divergencia KL de 0,0422 como referencia de deriva.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin las negativas del modelo base, aprovechando la reduccion de rechazos.
- Resolucion de problemas matematicos y STEM: uso del razonamiento estructurado destilado para asistencia en calculo, fisica o analisis cientifico en entornos de investigacion.
- Agentes con tool calling: integracion en pipelines de automatizacion donde el modelo invoca funciones externas y ejecuta razonamiento multi-paso, apoyandose en los tags de function-calling.
- Procesamiento multimodal: tareas image-text-to-text como descripcion de imagenes tecnicas o extraccion de informacion de diagramas, dado el pipeline declarado.
- Despliegue en produccion con cuantizacion: uso de las rutas evaluadas (vLLM NVFP4, llama.cpp MTP-Q8_0) para servir el modelo en infraestructura con requisitos de memoria ajustados.
- Atencion multilingue: asistencia en seis idiomas (en, zh, ko, ja, es, ru) para tareas de razonamiento y generacion.

## Benchmarks y rendimiento

La model card solo reporta metricas de comportamiento (rechazos y divergencia KL), no benchmarks estandar de capacidad.

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 9.409.813.744 parametros, en FP16 requiere aproximadamente 18,8 GB solo para pesos; en cuantizacion de 8 bits unos 9,4 GB y en 4 bits unos 4,7 GB, mas overhead de contexto y activaciones.
- GPU recomendadas: no especificadas en la informacion. Por tamano, una A100 o H100 en FP16, o una RTX 4090 (24 GB) para FP16 ajustado o cuantizaciones de 8 bits.
- Cabe en GPU de consumo: previsiblemente en RTX 3090/4090 (24 GB) con cuantizacion de 8 bits o inferior; en tarjetas de 16 GB requeriria cuantizacion de 4 bits (estimacion, no confirmada por el autor).
- Opciones de despliegue: vLLM (ruta NVFP4 evaluada), llama.cpp (ruta MTP-Q8_0 evaluada), transformers, text-generation-inference (tags). Ollama y TGI no confirmados explicitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,41B | no disponible | Apache 2.0 | Variante decensored, 3/100 rechazos, KL 0,0422 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,41B (base) | no disponible | Apache 2.0 | Modelo original, 100/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4B | no disponible | no disponible | Version 4B de la misma familia heretic |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer diferencias de capacidad entre estas variantes.

## Limitaciones y advertencias

- Modelo explicitamente "uncensored" y "abliterated": la eliminacion de rechazos implica que puede generar contenido danino, ofensivo o inseguro sin filtros; no apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion, especialmente en areas fuera de matematicas y STEM, donde la senal de entrenamiento es menor.
- La ablacion ARA sobre capas 9-24 puede degradar capacidades no evaluadas; la divergencia KL de 0,0422 indica deriva respecto al original, aunque el autor la presenta como baja.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en conversaciones de contexto largo.
- Idiomas limitados a seis (en, zh, ko, ja, es, ru); el rendimiento en espanol no esta cuantificado.
- Aunque la licencia es Apache 2.0 (permite uso comercial), el contenido generado sin filtros puede incumplir normativas de moderacion de contenido en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion comunitaria ni pruebas independientes.
- Creado y actualizado el mismo dia (2026-11-09): madurez no contrastada.

## Enlaces

- Hugging Face: https://huggingface.co/Pascammyai/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B heretic: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Heretic: https://heretic-project.org
