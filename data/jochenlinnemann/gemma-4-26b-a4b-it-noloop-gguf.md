# JochenLinnemann/gemma-4-26B-A4B-it-noloop-GGUF

## Resumen

Este repositorio contiene conversiones en formato GGUF de `edgerunner-ai/gemma-4-26B-A4B-it-noloop`, un modelo base que es un derivado de Google DeepMind's Gemma 4 26B-A4B. Se trata de un modelo de lenguaje multimodal (pipeline `image-text-to-text`) con arquitectura de mezcla de expertos (MoE) de aproximadamente 25 233 millones de parámetros totales y unos 4 000 millones de parámetros activos por token. La conversión GGUF, realizada por JochenLinnemann, permite ejecutar el modelo en llama.cpp y otros runtimes locales, lo que facilita su despliegue en entornos sin acceso a servicios cloud.

A pesar de que se declara licencia Apache-2.0, la model card advierte de que deben revisarse los términos de la licencia del modelo base de Google antes de usar o redistribuir el modelo con fines comerciales. No se proporciona información detallada sobre el proceso de entrenamiento, la longitud de contexto, los idiomas soportados ni métricas de rendimiento, por lo que es necesario consultar la documentación del modelo base original para una evaluación completa. La relevancia actual de este modelo reside en su naturaleza multimodal y en su eficiencia computacional gracias a la arquitectura MoE, así como en su disponibilidad en formato GGUF para inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), variante de Gemma 4 26B-A4B |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (estimado a partir de la nomenclatura A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene cuantizaciones GGUF, pero no se detallan las variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (declarada por el autor de la conversión; revisar los términos de la licencia del modelo base Gemma 4 para uso comercial) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una conversión a GGUF de `edgerunner-ai/gemma-4-26B-A4B-it-noloop`, que a su vez es un derivado con edición de pesos de Google DeepMind Gemma 4 26B-A4B. La arquitectura general es de transformer decoder-only con mezcla de expertos (MoE), con 25 233 142 046 parámetros totales y aproximadamente 4 000 millones de parámetros activos por token, según la nomenclatura A4B.

No se dispone de información sobre el proceso de entrenamiento del modelo base ni sobre la edición de pesos aplicada. Tampoco se conocen los datos de entrenamiento (número de tokens, composición del dataset), ni si se utilizaron técnicas de RLHF, DPO o similares. La model card indica únicamente que es un "weight-edited derivative" de Gemma 4, sin más detalles.

## Capacidades

- El pipeline `image-text-to-text` indica que el modelo base es multimodal: acepta imágenes y texto como entrada y genera texto.
- Al estar marcado como "it" (instruction-tuned), está orientado a seguir instrucciones y mantener conversaciones.
- La arquitectura MoE activa solo una parte de los parámetros (aprox. 4B) en cada paso, lo que puede reducir el coste computacional por token en comparación con un modelo denso del mismo tamaño.
- El formato GGUF permite su uso en llama.cpp y runtimes de inferencia local en CPU y GPU.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni longitudes de contexto.

## Casos de uso

- Análisis de imágenes en local sin conexión: gracias a la entrada multimodal y al formato GGUF, el modelo puede desplegarse en un servidor o PC con llama.cpp para describir o clasificar imágenes sin depender de API externas, lo que resulta adecuado para entornos con requisitos de privacidad.
- Extracción de texto de capturas y documentos: puede emplearse para transcribir el contenido visible de capturas de pantalla o escaneos, facilitando la automatización de procesos de digitalización de documentos.
- Generación de descripciones de accesibilidad: el modelo es capaz de producir descripciones alternativas (alt text) para imágenes en páginas web o redes sociales, mejorando la accesibilidad sin necesidad de intervención manual.
- Asistente para documentación técnica: puede responder preguntas sobre diagramas, esquemas o figuras incluidas en manuales, lo que reduce el tiempo de consulta en tareas de soporte técnico.
- Prototipado de chatbots multimodales: su orientación a instrucciones y su arquitectura MoE lo hacen adecuado para crear asistentes conversacionales que reciben imágenes y texto en un mismo hilo, destinados a atención al cliente o soporte.
- Evaluación experimental en investigación: para investigadores que necesiten un modelo multimodal open source de tamaño medio, esta conversión GGUF permite ejecutar inferencias locales y validar hipótesis sobre visión y lenguaje, aunque las restricciones de licencia del modelo base deben comprobarse previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma precisa. El repositorio tiene un tamaño de 81,7 GB, lo que indica que contiene varias cuantizaciones. Para una cuantización típica de 4 bits (Q4_K_M) de un modelo de 25 233 millones de parámetros, se podría estimar entre 15 y 20 GB de VRAM, pero conviene consultar los archivos concretos.
- GPU recomendadas: no se especifican. Para cuantizaciones que requieran mucha memoria sería necesario usar GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090) o GPUs de datacenter como A100/H100. Para cuantizaciones agresivas podría caber en GPUs de 12 GB, aunque no se puede confirmar sin la lista de variantes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y otros runtimes que acepten formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye referencias a modelos comparables, por lo que no se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- La información disponible no incluye evaluaciones de sesgos, robustez ni alucinaciones. No se puede garantizar su comportamiento en producción sin pruebas específicas.
- El modelo declara licencia Apache-2.0, pero la model card advierte de que se deben revisar los términos de la licencia del modelo base de Google DeepMind (Gemma 4) antes de redistribuir o usar comercialmente el modelo, ya que puede haber restricciones adicionales.
- Al ser un derivado con edición de pesos, puede presentar comportamientos imprevistos en comparación con el modelo base original.
- No se especifica la longitud de contexto, lo que limita su uso en tareas que requieran manejar ventanas largas de texto o historiales extensos.
- No se dispone de información sobre los idiomas soportados. El rendimiento en lenguas distintas del inglés, por ejemplo, no está garantizado.
- No se ha publicado ninguna métrica de rendimiento, por lo que la calidad para casos de uso concretos debe evaluarse de forma empírica.

## Enlaces

- HuggingFace: https://huggingface.co/JochenLinnemann/gemma-4-26B-A4B-it-noloop-GGUF
- Modelo base: https://huggingface.co/edgerunner-ai/gemma-4-26B-A4B-it-noloop
