# mradermacher/bloomz-GGUF

## Resumen

`mradermacher/bloomz-GGUF` es una redistribución en formato GGUF del modelo `bigscience/bloomz`, la variante instruida multilingüe de la familia BLOOM desarrollada por BigScience. El repositorio, mantenido por mradermacher, no entrena un modelo nuevo: ofrece cuantizaciones estáticas (Q2_K a Q8_0) del checkpoint original para su uso con llama.cpp y herramientas compatibles, lo que permite ejecutar un modelo de gran tamaño en hardware más modesto.

BLOOMZ se basa en BLOOM, un transformer decoder-only autorregresivo de 176 000 millones de parámetros, y se afina sobre el dataset `bigscience/xP3`, una colección de tareas formuladas como instrucciones en decenas de idiomas. Su relevancia radica en su cobertura lingüística excepcional (más de 45 idiomas y lenguajes de programación) y en que fue uno de los primeros modelos abiertos de escala masiva con fine-tuning multilingüe por instrucciones.

Este repositorio concreto es útil para quien necesite desplegar BLOOMZ en entornos con llama.cpp, dado que las cuantizaciones reducen el peso desde los ~350 GB en fp16 hasta rangos de 68-191 GB. No obstante, sigue siendo un modelo muy grande para hardware de consumo y su arquitectura y datos de entrenamiento corresponden a 2022, por lo que está por detrás de modelos más recientes en razonamiento y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo (BLOOM) |
| Parametros totales | 176 000 millones (modelo base BLOOMZ) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (modelo base BLOOMZ) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | 46 idiomas y lenguajes de programación (ak, ar, as, bm, bn, ca, code, en, es, eu, fon, fr, gu, hi, id, ig, ki, kn, lg, ln, ml, mr, ne, nso, ny, or, pa, pt, rn, rw, sn, st, sw, ta, te, tn, ts, tum, tw, ur, vi, wo, xh, yo, zh, zu) |
| Licencia | bigscience-bloom-rail-1.0 |
| Formato de pesos | GGUF (cuantizado, multiparte) |

## Arquitectura y entrenamiento

El modelo subyacente, BLOOMZ, es un transformer decoder-only con 176 000 millones de parámetros, 70 capas, dimensión de modelo de 14 336 y 112 cabezas de atención. Fue entrenado por BigScience sobre el corpus ROOTS y posteriormente afinado por instrucciones sobre `bigscience/xP3`, un conjunto de tareas multilingües derivadas de xP3 que incluye prompts en decenas de idiomas. El fine-tuning es de tipo supervisado por instrucciones (no se documenta RLHF ni DPO en la información disponible).

La innovación principal de la familia BLOOM es su carácter abierto y multilingüe a gran escala, con un tokenizador entrenado específicamente para cubrir muchos idiomas con un vocabulario de 250 880 tokens. Este repositorio no introduce cambios arquitectónicos: aplica cuantización estática (no imatrix) sobre el checkpoint original y divide los archivos en varias partes para facilitar la descarga y el uso con llama.cpp. Existe una variante con cuantizaciones ponderadas/imatrix en `mradermacher/bloomz-i1-GGUF`.

## Capacidades

- Generación de texto y seguimiento de instrucciones en decenas de idiomas, incluyendo español, catalán, euskera, gallego (no listado explícitamente) y una amplia cobertura de lenguas africanas y asiáticas.
- Capacidades multilingües destacadas: el modelo fue afinado con xP3, lo que le permite responder a instrucciones en idiomas de bajos recursos.
- Generación de código (etiqueta `code` en el vocabulario y en los idiomas soportados).
- Razonamiento básico y respuesta a preguntas formuladas como tareas de instrucción.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni multi-step reasoning explícito.
- No dispone de modo thinking, visión ni audio.
- Capacidad de continuación de texto y resumen, heredada del preentrenamiento de BLOOM.

## Casos de uso

- Atención al cliente multilingüe: el modelo puede gestionar conversaciones en español, catalán, euskera y otros idiomas europeos y africanos, aprovechando su fine-tuning sobre xP3 para responder a instrucciones en el idioma del usuario sin necesidad de traducción intermedia.
- Traducción y adaptación de contenidos: con 46 idiomas en el vocabulario, se puede usar para traducciones de borrador o para generar variantes lingüísticas de un mismo texto en entornos donde no se requiera precisión profesional.
- Generación de documentación técnica en varios idiomas: su cobertura de `code` y de lenguas europeas permite producir explicaciones de fragmentos de código o descripciones de API en el idioma del equipo.
- Prototipado de asistentes conversacionales en investigación: al ser un modelo abierto con licencia RAIL, es adecuado para experimentos académicos sobre sesgos y comportamiento multilingüe.
- Clasificación y etiquetado de texto por instrucciones: se puede formular la tarea como un prompt de instrucción (por ejemplo, "Clasifica este comentario como positivo o negativo") y usar el modelo para generar la etiqueta, especialmente en idiomas de bajos recursos donde otros modelos no están disponibles.
- Educación y generación de material didáctico: puede redactar ejercicios o explicaciones en idiomas minoritarios, un caso donde la oferta de modelos abiertos es limitada.
- Despliegue en entornos con llama.cpp: las cuantizaciones Q4_K_M (114,8 GB) permiten ejecutar el modelo en servidores con varias GPU o en configuraciones de CPU con suficiente RAM, sin depender de frameworks propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K ~68,2 GB; Q3_K_S ~78,8 GB; Q4_K_S ~103,1 GB; Q4_K_M ~114,8 GB; Q5_K_M ~133,7 GB; Q6_K ~147,7 GB; Q8_0 ~191,2 GB. El modelo en fp16 rondaría los ~350 GB.
- GPU recomendadas: para Q4_K_M se necesitan al menos 2 GPU de 80 GB (A100/H100) o varias RTX 4090 (24 GB) con reparto de capas; para Q2_K podría intentarse en 4×RTX 4090 (96 GB) con offload parcial.
- No cabe en una sola GPU de consumo: ni siquiera la cuantización más pequeña (68,2 GB) entra en una RTX 4090 (24 GB) o RTX 3090 (24 GB). Requiere múltiples GPU o uso intensivo de CPU/RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se importa el GGUF), y servidores compatibles con endpoints (el repo está marcado como `endpoints_compatible`). No se documenta soporte en vLLM o TGI para esta cuantización concreta.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño, se espera un throughput bajo en comparación con modelos de 7-13B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| bloomz-GGUF (este repo) | 176B | 2048 | bigscience-bloom-rail-1.0 | GGUF cuantizado | Hugging Face |
| bigscience/bloomz (original) | 176B | 2048 | bigscience-bloom-rail-1.0 | safetensors | Hugging Face |
| bigscience/bloom | 176B | 2048 | bigscience-bloom-rail-1.0 | safetensors | Hugging Face |
| mradermacher/bloomz-i1-GGUF | 176B | 2048 | bigscience-bloom-rail-1.0 | GGUF imatrix | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias de calidad frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: BLOOM ha documentado sesgos de género, raza y religión en su model card original; BLOOMZ hereda estos sesgos y puede amplificarlos en contextos de instrucción.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa con apariencia de veracidad, especialmente en tareas de conocimiento factual y en idiomas de bajos recursos donde los datos de entrenamiento son escasos.
- Limitación de contexto: 2048 tokens es una ventana corta para estándares actuales; no es adecuado para documentos largos o conversaciones multi-turno extensas sin truncamiento.
- Restricciones de licencia: la licencia `bigscience-bloom-rail-1.0` impone restricciones de uso (no es una licencia permisiva tipo Apache 2.0); requiere revisar las cláusulas de uso comercial y las prohibiciones de uso dañino antes de desplegar en producción.
- El repositorio es una cuantización de terceros, no el modelo oficial: la calidad puede degradarse respecto al checkpoint original, especialmente en Q2_K y Q3_K_S.
- Los archivos están divididos en múltiples partes; es necesario concatenarlas correctamente antes de usar con llama.cpp.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.
- Modelo de 2022: en tareas de razonamiento, matemáticas y código está por detrás de modelos más recientes de menor tamaño.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/bloomz-GGUF
- Modelo base: https://huggingface.co/bigscience/bloomz
- Variante imatrix: https://huggingface.co/mradermacher/bloomz-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#bloomz-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de comparación de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset xP3: https://huggingface.co/datasets/bigscience/xP3
