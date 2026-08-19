# RaspizdAI/debil-1.5-GGUF

## Resumen

debil-1.5 es un modelo de lenguaje pequeño (~46,5 millones de parámetros) desarrollado por RaspizdAI y distribuido en formato GGUF. Se trata de un transformer compacto con 8 capas ocultas, 8 cabezas de atención y una dimensión de embedding de 480, diseñado para ejecutarse en entornos con recursos muy limitados. El repositorio incluye cinco niveles de cuantización, desde FP16 hasta IQ1_S, lo que permite reducir el peso del modelo a unos pocos megabytes.

La relevancia de este modelo reside en su extrema ligereza: puede ejecutarse en CPU, dispositivos embebidos o entornos de edge computing sin necesidad de GPU. Su licencia MIT permite uso comercial sin restricciones. No obstante, la información pública es escasa: no se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni resultados de benchmarks, lo que limita la evaluación objetiva de sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, 8 capas) |
| Parametros totales | 46.538.400 (~46,5M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16, Q8_0, Q4_K_M, IQ2_XXS, IQ1_S |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

Detalles adicionales de arquitectura reportados por el autor: tamaño de vocabulario de 50.257 tokens, dimensión de embedding de 480, 8 cabezas de atención con dimensión de cabeza de 60.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only compacto con 8 capas ocultas, 8 cabezas de atención y dimensión de embedding de 480. El tamaño de vocabulario de 50.257 tokens coincide con el de GPT-2, lo que sugiere que podría emplear un tokenizador similar o derivado de BPE. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas particulares más allá del formato GGUF y las cuantizaciones ofrecidas.

## Capacidades

- Generación de texto básica: capaz de producir texto autocompletado dado un prompt, aunque su tamaño reducido limita la calidad y coherencia en tareas complejas.
- Razonamiento limitado: con 46,5M de parámetros, el razonamiento multi-paso y la resolución de problemas aritméticos serán muy limitados en comparación con modelos de mayor escala.
- Capacidades multilingües: no documentadas; no se especifican los idiomas soportados.
- Tool calling / function calling: no documentado y poco probable dado el tamaño del modelo.
- Soporte de agentes: no documentado; la ventana de contexto y la capacidad de razonamiento probablemente no lo permitan.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado rápido en entornos de desarrollo: al ser un modelo minúsculo y con licencia MIT, permite validar pipelines de generación de texto o integraciones con llama.cpp u Ollama sin coste computacional.
- Educación y aprendizaje: útil para estudiantes que quieran entender el funcionamiento interno de un transformer, ya que su tamaño permite inspeccionar pesos y activaciones en una máquina convencional.
- Dispositivos embebidos y edge computing: con cuantizaciones como Q4_K_M (~23 MB) o IQ1_S (~6 MB), puede desplegarse en Raspberry Pi, microcontroladores o dispositivos IoT para generación de texto simple.
- Autocompletado de formularios o textos cortos: en aplicaciones donde se necesite sugerir palabras o frases cortas sin requisitos de calidad elevados.
- Fine-tuning en dominios específicos: su pequeño tamaño permite fine-tuning completo en una sola GPU consumer o incluso en CPU para tareas muy concretas como clasificación de texto o generación de etiquetas.
- Benchmarking de infraestructura de inferencia: sirve para medir latencia y throughput de frameworks como llama.cpp, vLLM o TGI en hardware limitado, sin consumir recursos significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: FP16 ~93 MB, Q8_0 ~47 MB, Q4_K_M ~23 MB, IQ2_XXS ~12 MB, IQ1_S ~6 MB (solo pesos; hay que añadir memoria para KV-cache y overhead del runtime).
- GPU recomendadas: ninguna necesaria; cualquier CPU moderna puede ejecutar el modelo en tiempo real.
- Compatibilidad con GPU consumer: sí, cualquier GPU con más de 1 GB de VRAM lo ejecuta sin problema, incluidas integradas.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o cualquier runtime compatible con GGUF. También puede convertirse a safetensors para usar con Hugging Face Transformers.
- Latencia y throughput: no disponibles, pero dado el tamaño, se espera una generación de decenas a cientos de tokens por segundo en CPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría. El tamaño de 46,5M de parámetros lo sitúa en un rango inferior a modelos como GPT-2 (124M) o DistilGPT-2 (82M), pero no se han publicado benchmarks que permitan comparar rendimiento real. La falta de datos sobre contexto, idiomas y calidad de generación impide una comparación objetiva.

## Limitaciones y advertencias

- Información de entrenamiento ausente: no se conocen el dataset, el número de tokens ni el proceso de alineación, lo que impide evaluar sesgos y calidad.
- Sesgos desconocidos: sin datos de entrenamiento, no es posible identificar sesgos demográficos, culturales o lingüísticos.
- Riesgo de alucinación: al ser un modelo muy pequeño, la coherencia factual será baja y las alucinaciones serán frecuentes en tareas de conocimiento general.
- Longitud de contexto no documentada: se desconoce la ventana de contexto máxima, lo que dificulta planificar su uso en conversaciones o documentos largos.
- Idiomas no especificados: no se indica qué idiomas soporta, aunque el vocabulario de 50.257 tokens sugiere un tokenizador de tipo BPE probablemente entrenado principalmente con inglés.
- Adecuación para producción: no recomendado para aplicaciones críticas o que requieran calidad de generación consistente; su uso es más apropiado para experimentación y entornos con restricciones extremas de recursos.
- Fecha de creación futura: el modelo fue creado el 16 de agosto de 2026, lo que puede indicar un proyecto experimental o de carácter humorístico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RaspizdAI/debil-1.5-GGUF
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
