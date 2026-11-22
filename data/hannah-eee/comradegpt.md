# hannah-eee/comradegpt

## Resumen

ComradeGPT es un proyecto de fine-tune anunciado por la usuaria hannah-eee en Hugging Face, planteado como un modelo de humor que imita el estilo de la propaganda estalinista y la retórica de la Guerra Fría. El autor indica explícitamente en la model card que el modelo «todavía no existe» y que se publicará próximamente, por lo que a fecha de la información disponible no hay pesos entrenados ni artefacto utilizable.

La base declarada es Qwen 2.5 1.5B Instruct en formato GGUF, un transformer denso de 1.500 millones de parámetros desarrollado por Alibaba Qwen. El fine-tune se realizaría sobre un conjunto de datos sintético generado por Claude Sonnet 4.6 a partir de un system prompt publicado por la autora, lo que sitúa el proyecto en la categoría de adaptaciones estilísticas de bajo coste sobre modelos pequeños.

Su relevancia es, por tanto, limitada y de carácter experimental o divulgativo: sirve como ejemplo de fine-tune de estilo con datos sintéticos sobre un modelo de 1,5B cuantizado, no como una herramienta para producción. No hay información sobre arquitectura modificada, contexto ampliado, licencia ni idiomas soportados más allá de lo que se deduce del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen 2.5 1.5B Instruct) |
| Parametros totales | 1.500 millones (modelo base declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen 2.5 1.5B soporta 32.768 tokens, segun la documentacion de Qwen) |
| Tipos de cuantizacion | no disponible; el autor menciona formato GGUF para el modelo base |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (segun la model card, heredado del base); pesos del fine-tune no publicados |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen 2.5 1.5B Instruct: un transformer decoder-only denso con atención de causalidad estándar, sin mezcla de expertos ni mecanismos híbridos SSM. El autor no documenta cambios arquitectónicos propios; el proyecto se limita a un fine-tune supervisado sobre ese checkpoint.

El entrenamiento se basa en un dataset sintético generado por Claude Sonnet 4.6 a partir de un system prompt publicado en el repositorio de datos (hannah-eee/comradegpt-training). No se especifican el número de ejemplos, el número de tokens, la composición del dataset, la existencia de RLHF/DPO ni los hiperparámetros del fine-tune. Tampoco se indica si el entrenamiento se ha ejecutado ya: la model card afirma que el modelo «no existe todavía».

## Capacidades

- Generación de texto con estilo satírico de propaganda estalinista y retórica de la Guerra Fría (objetivo declarado del fine-tune).
- Conversación multi-turno, heredada de la naturaleza Instruct del modelo base Qwen 2.5 1.5B.
- Capacidades de razonamiento, código y matemáticas limitadas por el tamaño del base (1,5B parámetros); no hay evaluación publicada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este fine-tune.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el modelo base Qwen 2.5 soporta varios idiomas, pero el fine-tune no documenta ninguno.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Demostración educativa de fine-tune estilístico: el proyecto puede usarse como ejemplo docente de cómo adaptar un modelo de 1,5B con datos sintéticos generados por un LLM mayor, ilustrando el flujo prompt → dataset → fine-tune → GGUF.
- Generación de contenido satírico para blogs o podcasts: el modelo, una vez publicado, podría producir textos breves con estética de propaganda soviética para piezas de humor, siempre que se etiquete claramente como ficción.
- Prototipado de chatbots de personaje: serviría para experimentar con personalidades históricas estilizadas en entornos de bajo coste, dado el reducido tamaño del base.
- Pruebas de alineación y seguridad: útil para estudiar cómo un fine-tune pequeño puede amplificar sesgos ideológicos o retórica agresiva, y para diseñar filtros de moderación.
- Evaluación de cuantizaciones GGUF en hardware de consumo: al partir de un base de 1,5B, permite medir latencia y calidad en CPU o GPUs modestas.
- Ejercicio de reproducibilidad: el autor publica el system prompt y el dataset, lo que facilita replicar el pipeline en otros modelos base pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el fine-tune; para el base Qwen 2.5 1.5B en GGUF se sitúa aproximadamente entre 1 y 2 GB en cuantizaciones Q4 y entre 2 y 3 GB en Q8, según la documentación de Qwen.
- GPU recomendadas: no disponible. Por tamaño del base, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, y en CPU con llama.cpp.
- Cabe en consumer GPU: sí, en principio, dado el tamaño de 1,5B del base; no hay confirmación del autor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio u otros runners compatibles con GGUF; vLLM y TGI no están documentados para este proyecto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ComradeGPT | 1,5B (base Qwen 2.5) | no disponible | no disponible | No publicado (el autor indica que aún no existe) |
| Qwen 2.5 1.5B Instruct | 1,5B | 32.768 tokens (segun Qwen) | Apache 2.0 (segun Qwen) | Disponible en Hugging Face |
| SmolLM2 1.7B Instruct | 1,7B | 8.192 tokens (segun Hugging Face) | Apache 2.0 (segun Hugging Face) | Disponible en Hugging Face |
| Llama 3.2 1B Instruct | 1,2B | 128.000 tokens (segun Meta) | Llama 3.2 Community License | Disponible en Hugging Face |

## Limitaciones y advertencias

- El modelo no está publicado: la model card afirma explícitamente que «ComradeGPT currently doesn't exist», por lo que no puede evaluarse ni desplegarse.
- Ausencia total de datos de entrenamiento: no se documentan número de ejemplos, tokens, hiperparámetros ni proceso de evaluación.
- Riesgo elevado de sesgo ideológico y retórica agresiva por el estilo objetivo (propaganda estalinista); no apto para uso sin moderación.
- Riesgo de alucinación alto, agravado por el tamaño reducido del base (1,5B) y por un fine-tune estilístico que prioriza el tono sobre la veracidad.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución.
- Idiomas no documentados: se desconoce si el fine-tune conserva el multilingüismo del base.
- Contexto no documentado para el fine-tune; cualquier uso con ventanas largas requeriría verificar el comportamiento real.
- Contenido sensible: la temática puede resultar ofensiva en determinados contextos; debe etiquetarse como sátira y no presentarse como información histórica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hannah-eee/comradegpt
- Dataset de entrenamiento: https://huggingface.co/datasets/hannah-eee/comradegpt
- Repositorio de entrenamiento y system prompt: https://huggingface.co/datasets/hannah-eee/comradegpt-training
- Modelo base Qwen 2.5 1.5B Instruct GGUF: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Anuncio de Claude Sonnet 4.6 (generador de los datos): https://www.anthropic.com/news/claude-sonnet-4-6
