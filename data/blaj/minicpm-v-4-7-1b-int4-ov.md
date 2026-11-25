# blaj/MiniCPM-V-4.7-1B-int4-ov

## Resumen

MiniCPM-V-4.7-1B-int4-ov es una exportación cuantizada a INT4 del modelo multimodal MiniCPM-V-4.7-1B de OpenBMB, publicada por el usuario blaj en formato OpenVINO. Se trata de un artefacto de despliegue, no de un modelo entrenado desde cero: el autor parte de los pesos originales de OpenBMB (verificando su SHA-256 antes de la exportación) y los convierte mediante Optimum Intel para su ejecución optimizada sobre hardware Intel. El resultado es un paquete de 1,4 GB que procesa entradas de imagen y texto y genera texto, orientado a inferencia en el borde o en equipos con aceleración Intel.

La relevancia de esta ficha radica en que el modelo base, MiniCPM-V-4.7-1B, pertenece a la familia MiniCPM-V de OpenBMB, conocida por ofrecer capacidades visión-lenguaje en tamaños reducidos. La variante aquí descrita incluye además soporte para decodificación especulativa mediante dSparK (un modelo draft FP16 complementario) y está pensada para OpenVINO GenAI 2027.0.0.0.dev20261119. La model card advierte explícitamente de que la inferencia de imagen no fue verificada y de que solo se realizó una prueba de humo de generación de texto en GPU.

Conviene subrayar que la información publicada es muy escasa: no se detallan parámetros totales, longitud de contexto, idiomas ni resultados de benchmarks. Esta ficha refleja únicamente lo que el autor declara, marcando como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en MiniCPM-V-4.7-1B; incluye bloques de atención lineal (17 bloques según la configuración probada) |
| Parametros totales | no disponible (el nombre del modelo base sugiere ~1B, sin confirmación en la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (esta variante); existe una variante INT8 complementaria del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO (exportación Optimum Intel); modelo draft complementario en FP16 OpenVINO |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia MiniCPM-V, diseñado para tareas image-text-to-text. La exportación INT4 conserva la estructura del modelo original y añade compatibilidad con OpenVINO GenAI, incluyendo 17 bloques de atención lineal que el autor menciona como parte de la configuración probada. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos corresponden al modelo original de OpenBMB y no se reproducen en esta model card.

La innovación técnica destacable de este artefacto es la integración de decodificación especulativa mediante dSparK: se empareja el modelo objetivo INT8 con un draft FP16 y se emplean 15 tokens asistente en la configuración probada, con precisión de caché KV en f16. El autor advierte de que el exportador estándar del draft exporta la cabeza Markov, no los tensores de la cabeza de confianza del checkpoint, lo que puede afectar al comportamiento de la decodificación especulativa.

## Capacidades

- Generación de texto a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Conversación multimodal (etiqueta "conversational").
- Procesamiento de imágenes junto con instrucciones textuales, según el pipeline declarado.
- Soporte de decodificación especulativa mediante el modelo draft dSparK complementario.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado de asistentes visuales en equipos Intel: el formato OpenVINO permite ejecutar el modelo sobre CPU o GPU Intel integrada, lo que facilita pruebas de concepto de descripción de imágenes sin depender de GPUs dedicadas.
- Clasificación y etiquetado de imágenes en el borde: al ser un modelo de ~1B en INT4 (1,4 GB), puede desplegarse en dispositivos con recursos limitados para tareas de captioning o moderación visual.
- Extracción de información de documentos escaneados: combinando entrada de imagen y texto, puede emplearse para responder preguntas sobre capturas o formularios, siempre que se valide la calidad en el caso concreto (la inferencia de imagen no fue verificada por el autor).
- Aceleración de inferencia con decodificación especulativa: el emparejamiento con el draft FP16 dSparK permite experimentar con técnicas de aceleración en OpenVINO GenAI, útil para investigación sobre latencia.
- Evaluación comparativa de cuantizaciones: al existir variantes INT4 e INT8 del mismo autor, sirve para medir el impacto de la precisión en calidad y velocidad dentro de un mismo pipeline.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su integración en productos comerciales, sujeto a las condiciones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo menciona que la precisión superó una prueba de humo de generación de texto en GPU con el compañero publicado, y que la velocidad y la paridad greedy varían según el prompt.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,4 GB en INT4; la VRAM necesaria para inferencia no se detalla, pero el tamaño sugiere que cabe en GPUs de consumo con holgura.
- GPU recomendadas: el autor indica uso de GPU (sin especificar modelo); el ecosistema OpenVINO está orientado a hardware Intel (iGPU, Arc) y también soporta CPU.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del artefacto, aunque no se confirma en la model card.
- Opciones de despliegue: OpenVINO GenAI 2027.0.0.0.dev20261119, con caché KV en f16; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor señala que varían según el prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-int4-ov (este) | no disponible (~1B por nombre) | no disponible | Apache 2.0 | OpenVINO INT4 | Exportación de terceros, soporte dSparK |
| MiniCPM-V-4.7-1B (OpenBMB) | no disponible (~1B por nombre) | no disponible | Apache 2.0 | safetensors (original) | Modelo base oficial |
| MiniCPM-V-4.7-1B-int8-ov (blaj) | no disponible | no disponible | Apache 2.0 | OpenVINO INT8 | Variante INT8 del mismo autor |
| MiniCPM-V-4.7-1B-DSpark-fp16-ov (blaj) | no disponible | no disponible | Apache 2.0 | OpenVINO FP16 | Draft para decodificación especulativa |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- La inferencia de imagen no fue verificada por el autor; solo se realizó una prueba de humo de generación de texto en GPU.
- El exportador estándar del draft exporta la cabeza Markov, no los tensores de la cabeza de confianza del checkpoint, lo que puede degradar la decodificación especulativa.
- La velocidad y la paridad greedy varían según el prompt; no hay garantías de reproducibilidad.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- La licencia Apache 2.0 se aplica a esta exportación, pero el uso debe respetar también las condiciones del modelo base de OpenBMB.
- Es un artefacto de terceros (blaj), no una publicación oficial de OpenBMB; la trazabilidad se limita a la verificación SHA-256 mencionada.
- Depende de una versión de desarrollo concreta de OpenVINO GenAI (2027.0.0.0.dev20261119), lo que puede dificultar la reproducibilidad a medio plazo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/blaj/MiniCPM-V-4.7-1B-int4-ov)
- [Modelo base openbmb/MiniCPM-V-4.7-1B](https://huggingface.co/openbmb/MiniCPM-V-4.7-1B/tree/ad9bf379feb71204c888b22923d63322452407f9)
- [Variante INT8 complementaria](https://huggingface.co/blaj/MiniCPM-V-4.7-1B-int8-ov)
- [Draft FP16 dSparK](https://huggingface.co/blaj/MiniCPM-V-4.7-1B-DSpark-fp16-ov)
