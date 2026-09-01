# sigmanih/google-gemma-4-12B-it-GGUF-Q6_K

## Resumen

El modelo `sigmanih/google-gemma-4-12B-it-GGUF-Q6_K` es una cuantización en formato GGUF con cuantización Q6_K del modelo base `google/gemma-4-12B-it`, publicada por el usuario `sigmanih` a través de su herramienta Sigma Studio. Se trata de una versión optimizada para inferencia local de alto rendimiento, orientada a tareas de generación de texto, programación, asistentes conversacionales y razonamiento autónomo. La cuantización reduce el peso del modelo a 9,11 GB, lo que permite ejecutarlo en GPUs de consumo con 12 GB o más de VRAM, manteniendo una velocidad de decodificación medida de 49,2 tokens por segundo en una RTX 5070 Ti.

El modelo base Gemma 4 12B es un transformer decoder-only de 12 mil millones de parámetros con una ventana de contexto de 262.144 tokens, desarrollado por Google DeepMind. Esta versión cuantizada hereda la arquitectura y las capacidades del modelo original, aunque se publica bajo una licencia marcada como "other" en la metadata de Hugging Face, lo que requiere revisar los términos específicos antes de su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura base `gemma4`) |
| Parametros totales | 12 mil millones (12B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q6_K (este archivo); también disponible Q8_0 en el mismo repositorio del autor |
| Idiomas soportados | Inglés (en) e italiano (it) según la metadata; el modelo base puede soportar más idiomas, pero no se especifica |
| Licencia | Otra (metadata: `other`; la model card muestra un badge Apache-2.0, pero el modelo base Gemma 4 tiene sus propios términos de uso) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF Q6_K del checkpoint `google/gemma-4-12B-it`, que corresponde a la variante instruida del modelo Gemma 4 12B de Google DeepMind. La arquitectura base es un transformer decoder-only de 48 capas con dimensión oculta de 3840, según los datos de la model card. No se dispone de información detallada sobre el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. La cuantización Q6_K es un método de compresión de pesos que mantiene 6 bits por peso, ofreciendo un equilibrio entre fidelidad y tamaño. El autor indica que el modelo fue publicado mediante el módulo Model Hub de Sigma Studio, una herramienta propia para optimización y despliegue de modelos.

## Capacidades

Según la model card, el modelo está recomendado para:

- Generación de texto conversacional y asistencia en tareas cotidianas.
- Programación de alta velocidad (generación de código, completado, depuración).
- Razonamiento autónomo y bucles de agentes (multi-step reasoning).
- Capacidades multilingües limitadas a inglés e italiano según la metadata, aunque el modelo base podría soportar más idiomas (no confirmado en esta ficha).

No se documenta explícitamente soporte para tool calling, function calling, visión o audio en esta versión cuantizada. Dado que el modelo base Gemma 4 12B es multimodal según fuentes externas (LM Studio lo describe como "Unified" con proyección directa de parches de imagen), es posible que esta cuantización conserve cierta capacidad de procesamiento de imágenes, pero no hay confirmación en la información proporcionada. Se recomienda probar la funcionalidad real antes de asumirla.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno con contexto largo gracias a su ventana de 262.144 tokens, adecuado para chatbots que requieren recordar conversaciones extensas.
- Generación de código en producción: con un rendimiento del 100% en HumanEval (sobre subconjunto) y 77,8% en MBPP, puede integrarse en pipelines de desarrollo como autocompletado o generación de tests unitarios.
- Razonamiento matemático: con 88,9% en GSM8K y MATH (medido sobre subconjuntos), es útil para resolución de problemas matemáticos de nivel escolar y competición.
- Agentes autónomos: el modelo puede ejecutar bucles de razonamiento multi-paso, lo que lo hace apto para tareas de planificación y ejecución de acciones en entornos controlados.
- Educación y tutoría: su capacidad de razonamiento y generación de explicaciones permite crear tutores virtuales para materias STEM.
- Análisis de documentos largos: la ventana de contexto amplia permite procesar informes, artículos o libros completos en una sola pasada, extrayendo resúmenes o respondiendo preguntas específicas.

## Benchmarks y rendimiento

La model card incluye resultados de evaluación realizados por el autor sobre un subconjunto de cada dataset (100 preguntas en total), con temperatura 0.0 y semilla 42, ejecutados en GPU mediante SigmaEngine. **Importante: estos resultados no son comparables con ejecuciones completas de los benchmarks y deben interpretarse como indicativos.**

| Dataset | Dominio | Correctos / Total | Precisión (%) |
|---|---|---|---|
| ARC-Challenge | Razonamiento científico escolar | 8 / 9 | 88,9 |
| BIG-Bench Hard | Lógica y simbólica multi-tarea | 6 / 7 | 85,7 |
| GPQA | Razonamiento académico de posgrado | 4 / 9 | 44,4 |
| GSM8K | Matemáticas de escuela primaria multi-paso | 8 / 9 | 88,9 |
| HellaSwag | Razonamiento de sentido común | 5 / 9 | 55,6 |
| HumanEval | Generación de código Python (pass@1) | 7 / 7 | 100,0 |
| MATH | Matemáticas de competición | 8 / 9 | 88,9 |
| MBPP | Programación Python con tests unitarios | 7 / 9 | 77,8 |
| MMLU | Conocimiento general multi-materia | 8 / 14 | 57,1 |
| MMLU-Pro | Razonamiento multi-paso avanzado | 8 / 9 | 88,9 |
| TruthfulQA | Factualidad y anti-alucinación | 8 / 9 | 88,9 |
| **Total** | **Todos los conjuntos** | **77 / 100** | **77,0** |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El archivo GGUF Q6_K ocupa 9,11 GB en disco, por lo que cabe en GPUs con 12 GB de VRAM o más (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 5070 Ti).
- La velocidad medida por el autor en una NVIDIA GeForce RTX 5070 Ti (15,9 GB VRAM) fue de:
  - Decodificación de un solo flujo (lo que percibe el usuario en un chat): 49,2 tokens/s.
  - Procesamiento de prompt: 430 tokens/s.
  - Throughput agregado durante evaluación (varias peticiones simultáneas): 47,4 tokens/s.
- No se han medido velocidades en otros hardware, por lo que no se pueden extrapolar cifras fiables.
- Opciones de despliegue: el modelo es compatible con `llama.cpp` (comando `llama-cli -hf sigmanih/google-gemma-4-12B-it-GGUF-Q6_K -p "..." -ngl 99`), y con Sigma Studio, que ofrece aceleración por GPU y chat visual. También debería funcionar con otras herramientas que soporten GGUF como Ollama o vLLM (aunque no se mencionan explícitamente).
- Para cargar el modelo completo en GPU con contexto máximo, se recomienda al menos 12 GB de VRAM; con 8 GB podría ser necesario limitar el contexto o usar una cuantización menor.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (por ejemplo, Llama 3 12B, Mistral 12B o el propio Gemma 4 sin cuantizar) en la información proporcionada. El autor publica también una versión Q8_0 del mismo modelo (`sigmanih/google-gemma-4-12B-it-GGUF-Q8_0`), que tendrá mayor fidelidad pero mayor tamaño de archivo. Se recomienda consultar los benchmarks oficiales de Google DeepMind para Gemma 4 12B para una comparativa rigurosa.

## Limitaciones y advertencias

- Los benchmarks reportados se realizaron sobre subconjuntos reducidos (100 preguntas en total) y no son extrapolables a la precisión real en la suite completa; el propio autor advierte que no son comparables con ejecuciones completas.
- La licencia está marcada como "other" en Hugging Face, y aunque la model card muestra un badge Apache-2.0, el modelo base Gemma 4 tiene sus propios términos de uso de Google. Es imprescindible revisar la licencia del modelo base antes de cualquier uso comercial o redistribución.
- Al ser una cuantización Q6_K, puede haber una ligera pérdida de precisión frente al modelo original en tareas que requieren máxima exactitud (por ejemplo, matemáticas avanzadas o razonamiento legal).
- Los resultados en GPQA (44,4%) y HellaSwag (55,6%) son moderados, lo que sugiere limitaciones en razonamiento académico de alto nivel y sentido común situacional.
- No se documentan sesgos específicos, pero al derivar de un modelo entrenado por Google, es probable que herede sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación: aunque TruthfulQA muestra 88,9%, el modelo puede generar información incorrecta en contextos poco cubiertos; se recomienda validación humana en aplicaciones críticas.
- La metadata indica idiomas "en, it", por lo que el rendimiento en otros idiomas no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sigmanih/google-gemma-4-12B-it-GGUF-Q6_K
- Versión Q8_0 del mismo autor: https://huggingface.co/sigmanih/google-gemma-4-12B-it-GGUF-Q8_0
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-12B
- Página oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Anuncio de Gemma 4 12B en el blog de Google: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Ficha del modelo en LM Studio: https://lmstudio.ai/models/google/gemma-4-12b
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
