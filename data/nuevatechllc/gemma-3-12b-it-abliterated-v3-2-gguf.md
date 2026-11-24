# NuevaTechLLC/gemma-3-12b-it-abliterated-v3.2-GGUF

## Resumen

Gemma-3-12b-it-abliterated-v3.2 es una variante del modelo Gemma 3 12B instruct de Google a la que se le han eliminado los mecanismos de rechazo (refusals) mediante una edición de dirección de rechazo de rango 1, fruto del estudio "Removing refusals with less damage: what worked, what did not, and why" publicado por NuevaTech LLC en 2026. El objetivo del trabajo es reducir la tasa de rechazo del modelo base minimizando el daño colateral medido como divergencia KL respecto al original, un compromiso que el autor cuantifica y compara explícitamente con la herramienta Heretic.

El modelo parte de `unsloth/gemma-3-12b-it`, una versión del Gemma 3 12B instruct afinada por Unsloth, y se distribuye únicamente en formato GGUF (Q4_K_M y Q8_0) para su uso con llama.cpp y Ollama. Cuenta con 11.766.034.176 parámetros y hereda la arquitectura transformer de Gemma 3; esta distribución GGUF es solo texto y no incluye el proyector de visión del modelo original.

La relevancia del modelo es doble: por un lado, ofrece un punto de partida para investigación de seguridad y red teaming con una tasa de rechazo medida del 25,2 % frente al 95,4 % del base; por otro, documenta de forma reproducible una metodología de abliteración con métricas held-out juzgadas por un clasificador, algo poco habitual en este tipo de publicaciones. No obstante, el autor reconoce un "suelo de rechazo" cercano al 25 % que ninguna versión de su edición logra superar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3), edición de dirección de rechazo de rango 1 sobre el modelo instruct |
| Parametros totales | 11.766.034.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (llama.cpp); repo de 19,8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer Gemma 3 de 12B parámetros en su variante instruct. Sobre ese modelo base, NuevaTech aplica una edición de dirección de rechazo de rango 1 ("band edit") sin restauración de normas. La versión v3.2, denominada internamente "kljgrid", proviene de una búsqueda que minimiza la divergencia KL respecto al modelo original en prompts inocuos, sujeta a un objetivo de tasa de rechazo puntuado por un clasificador de seguridad (Qwen3Guard-Gen-8B). No se documenta un reentrenamiento con RLHF o DPO adicional: la modificación es una intervención sobre los pesos del modelo ya alineado.

Los datos de entrenamiento del modelo base no se detallan en la información disponible. La evaluación del estudio se realizó sobre el modelo en bf16 y las GGUFs publicadas son cuantizaciones de ese modelo editado. Las métricas declaradas se obtuvieron con una semilla por fila y el juez automático se trata como verdad de referencia, sin verificación humana etiquetada.

## Capacidades

- Generación de texto conversacional en inglés, heredada del Gemma 3 12B instruct.
- Razonamiento y matemáticas: el modelo base mantiene resultados cercanos al original (MMLU 0,736, GSM8K 0,877, ARC 0,615 según el autor).
- Eliminación de rechazos: responde a peticiones que el modelo base rechaza, con una tasa de rechazo medida del 25,2 % en StrongREJECT.
- Reducción de sobre-rechazo: 1,0 % en OR-Bench frente al 17,3 % del base.
- Plantilla de chat del modelo base embebida en los GGUF.
- Compatible con endpoints y con Ollama mediante Modelfile.
- Capacidades multimodales: no disponibles en esta distribución (las GGUFs no incluyen proyector de visión).
- Tool calling, agentes y razonamiento multi-paso: no medidos ni documentados en la información proporcionada.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo sirve para generar respuestas a prompts que el base rechaza y medir la robustez de clasificadores de seguridad como Qwen3Guard, en hardware propio y con fines de investigación.
- Investigación en interpretabilidad y abliteración: permite reproducir el estudio comparando la edición v3.2 con Heretic y con el base, usando las métricas de rechazo, sobre-rechazo y KL publicadas.
- Docencia sobre alineación y mecanismos de rechazo: útil para mostrar en un aula cómo una edición de rango 1 altera el comportamiento de rechazo y qué coste tiene en divergencia respecto al original.
- Pruebas de regresión de filtros de contenido: integrar el modelo en un pipeline que valide si los guardrails de producción detectan salidas no deseadas antes de desplegar sistemas propios.
- Evaluación comparativa de cuantizaciones: comparar Q4_K_M y Q8_0 sobre las mismas tareas para estudiar el impacto de la cuantización en la tasa de rechazo y en la calidad.
- Despliegue local con Ollama o llama.cpp en entornos controlados: prototipado de asistentes conversacionales en inglés donde se requiera baja tasa de rechazo y se asuma la responsabilidad legal y ética del uso.

## Benchmarks y rendimiento

Datos declarados por el autor (model-index y model card); una semilla por fila, juez Qwen3Guard-Gen-8B, mediciones sobre el modelo bf16.

| Modelo | Rechazo (282 prompts StrongREJECT) | Respuestas inseguras | Sobre-rechazo (300 OR-Bench) | KL vs base (300 prompts) | MMLU | ARC | GSM8K |
|---|---|---|---|---|---|---|---|
| base | 0,954 | 0,011 | 0,173 | 0,0000 | 0,738 | 0,610 | 0,882 |
| este modelo (v3.2) | 0,252 | 0,667 | 0,010 | 0,0381 | 0,736 | 0,615 | 0,877 |
| Heretic 1.4.0 (defaults) | 0,496 | 0,418 | 0,017 | 0,0269 | 0,739 | 0,610 | 0,895 |

## Requisitos de hardware

- VRAM estimada: Q4_K_M de un modelo de ~11,8B parámetros requiere aproximadamente 7-8 GB de VRAM; Q8_0 requiere aproximadamente 12-13 GB. Estimaciones orientativas a partir del tamaño del modelo, no publicadas por el autor.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0; RTX 3090/4080 o superiores para Q4_K_M; A100/H100 para servir múltiples instancias o contexto largo.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para Q4_K_M y 12 GB o más para Q8_0.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (`ollama create` con Modelfile), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo (StrongREJECT) | KL vs base | Licencia | Formato |
|---|---|---|---|---|---|---|
| gemma-3-12b-it-abliterated-v3.2 | 11,77B | no disponible | 0,252 | 0,0381 | gemma | GGUF |
| Heretic 1.4.0 (defaults) | no disponible | no disponible | 0,496 | 0,0269 | no disponible | no disponible |
| Gemma 3 12B instruct (base) | 11,77B (aprox.) | no disponible | 0,954 | 0,0000 | gemma | safetensors, GGUF (vía terceros) |

## Limitaciones y advertencias

- El modelo responde a peticiones que el original rechaza; no sabe más que el modelo base. No mejora el conocimiento ni la calidad factual.
- Suelo de rechazo cercano al 25 %: la edición no elimina por completo el comportamiento de rechazo.
- Riesgo elevado de respuestas inseguras: 66,7 % de respuestas inseguras frente al 1,1 % del base en la evaluación del autor.
- Las métricas de rechazo y sobre-rechazo se midieron solo en inglés; no se evaluaron calidad de texto largo, uso de herramientas ni comportamiento multilingüe.
- El juez automático se trata como verdad de referencia, sin verificación humana etiquetada.
- Las GGUFs no incluyen visión; es un modelo solo texto.
- Licencia Gemma Terms of Use: revisar las restricciones de uso comercial y las políticas de uso prohibido antes de cualquier despliegue en producción.
- Uso previsto declarado: red teaming, investigación en seguridad y docencia en hardware propio; el usuario es responsable del cumplimiento legal y de la licencia.
- Sesgos conocidos del modelo base: no documentados específicamente en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/NuevaTechLLC/gemma-3-12b-it-abliterated-v3.2-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-3-12b-it
- Paper: https://github.com/Limitlessmatrix/abliteration-study/blob/main/paper/PAPER.md
- Código del estudio (búsqueda, edición, evaluación, exportación de adaptadores): https://github.com/Limitlessmatrix/abliteration-study
- Datos del estudio: https://github.com/Limitlessmatrix/abliteration-study/blob/main/paper/data/results.json
- Versión anterior: https://huggingface.co/NuevaTechLLC/gemma-3-12b-it-abliterated-v2-GGUF
