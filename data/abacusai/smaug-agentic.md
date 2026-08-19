# abacusai/Smaug-Agentic

## Resumen

Smaug-Agentic es un ajuste fino de tipo agéntico sobre Kimi K3, el modelo Mixture-of-Experts de 2,8 billones de parámetros desarrollado por Moonshot AI, realizado por Abacus.AI. Continúa la línea Smaug de la compañía —cuyo predecesor Smaug-72B-v0.1 fue el primer modelo de código abierto en superar una media del 80 % en el Open LLM Leaderboard de Hugging Face— pero ahora escalado a una base MoE de frontera y orientado específicamente a agentes de codificación y uso de herramientas en horizontes largos.

El ajuste fino solo modifica el comportamiento: todos los parámetros arquitectónicos permanecen idénticos a Kimi K3, por lo que cualquier stack de inferencia que sirva a K3 sirve a este modelo. Entre sus características destacan un post-entrenamiento agéntico con enmascaramiento de tokens de razonamiento, una deliberación acotada que reduce la cola de razonamiento extremo (p99 cae a 0,62× en SciCode y 0,55× en AA-LCR), preservación del pensamiento intercalado entre turnos y pesos nativos MXFP4 heredados de la base.

El modelo es multimodal (image-text-to-text) gracias al codificador de visión MoonViT-V2, soporta un contexto de 1.048.576 tokens y está disponible bajo la licencia Kimi K3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención KDA y Gated MLA |
| Parametros totales | 2.779.931.837.184 (2,8 T) |
| Parametros activos | 104 B |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | MXFP4 nativo (heredado), 8-bit (según tags), safetensors |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 (other, con enlace a la licencia de Moonshot AI) |
| Formato de pesos | safetensors, compressed-tensors |

## Arquitectura y entrenamiento

Smaug-Agentic es un MoE con 93 capas (una de ellas densa), 896 expertos de los cuales se seleccionan 16 por token más 2 expertos compartidos, dimensión oculta de 3072 por experto y 96 cabezas de atención con dimensión 7168. La composición de atención es 69 capas KDA (Key-Value Attention con latente) y 24 capas Gated MLA (Multi-head Latent Attention), con dimensión latente MoE de 3584. El vocabulario es de 160.000 tokens.

El entrenamiento consiste en un ajuste fino supervisado (SFT) sobre trayectorias de codificación multi-turno con uso de herramientas, filtradas y con los tokens de razonamiento enmascarados de la función de pérdida: el modelo ve su propio pensamiento en contexto pero nunca se supervisa sobre él. Esto produce una "deliberación acotada": la longitud típica de razonamiento se mantiene mientras que la cola extrema se colapsa (p99 cae a 0,62× en SciCode y 0,55× en AA-LCR sin pérdida de detalle en las respuestas). El pensamiento intercalado se conserva entre turnos mediante el campo `reasoning_content`, lo que permite bucles agénticos multi-paso sin perder la cadena de razonamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso con cadena de pensamiento visible (`reasoning_content`).
- Uso de herramientas (tool calling) y ejecución de agentes de codificación en horizontes largos.
- Razonamiento matemático y científico (validado en SciCode y AA-LCR).
- Capacidades multimodales: entrada de imagen-texto gracias al codificador MoonViT-V2.
- Contexto largo de 1 M de tokens, adecuado para repositorios completos o documentación extensa.
- Pensamiento intercalado preservado entre turnos, clave para loops agénticos.
- Compatible con cualquier stack de inferencia que sirva a Kimi K3 (drop-in replacement).

## Casos de uso

- Agentes de codificación autónomos: el modelo puede gestionar tareas de programación multi-paso, editando archivos, ejecutando comandos y llamando a herramientas en bucles largos, gracias a su contexto de 1 M y su entrenamiento en trayectorias tool-using.
- Revisión y refactorización de código en repositorios grandes: con 1 M de tokens puede procesar un repositorio completo en una sola pasada, identificando patrones y proponiendo cambios.
- Asistente de investigación científica: razonamiento matemático y científico con cadena de pensamiento visible, útil para validar pasos de demostraciones o resolver problemas complejos.
- Soporte técnico de alto nivel: respuestas conversacionales multi-turno con contexto largo, manteniendo el hilo de razonamiento a lo largo de la interacción.
- Análisis de documentación extensa y generación de resúmenes: su ventana de 1 M permite procesar manuales técnicos, especificaciones o libros completos.
- Integración en pipelines CI/CD: soporte de tool calling para automatizar tareas de build, test y despliegue, con capacidad de razonar sobre los resultados y ajustar la estrategia.
- Aplicaciones multimodales: análisis de imágenes técnicas (diagramas, capturas) combinado con texto, gracias a MoonViT-V2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo menciona métricas internas de razonamiento: el p99 de razonamiento cae a 0,62× respecto a la base en SciCode y a 0,55× en AA-LCR, sin pérdida de detalle en las respuestas. No se proporcionan comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 2,8 T parámetros con 104 B activos, incluso con pesos MXFP4 (aproximadamente 1,4 TB en memoria), se requiere un clúster multi-GPU. No es viable en una GPU de consumo.
- GPUs recomendadas: clúster de 8 o más GPUs H100 (80 GB) o A100 (80 GB) para inferencia con pesos MXFP4. Para servir con contexto completo de 1 M, se necesitan varias unidades adicionales por KV cache.
- No cabe en GPUs de consumo (RTX 4090, etc.) por tamaño y memoria.
- Opciones de despliegue: cualquier stack que sirva a Kimi K3 (vLLM, TensorRT-LLM, SGLang, etc.), dado que es un drop-in replacement. También compatible con frameworks que soporten pesos MXFP4 y compressed-tensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| Smaug-Agentic | 2,8 T | 104 B | 1 M | Agéntico, tool use, codigo | Kimi K3 |
| Kimi K3 (base) | 2,8 T | 104 B | 1 M | General, multimodal | Kimi K3 |
| DeepSeek-V3 | 671 B | 37 B | 128 K | General, codigo | MIT (con restricciones) |
| Qwen3-Coder (ejemplo) | no disponible | no disponible | no disponible | no disponible | no disponible |

Smaug-Agentic se diferencia de su base Kimi K3 únicamente en el comportamiento post-entrenamiento, no en arquitectura. Comparado con otros MoE de frontera como DeepSeek-V3, ofrece un contexto mucho mayor (1 M frente a 128 K) y capacidades multimodales, aunque su licencia (Kimi K3) puede tener restricciones diferentes. No hay datos de rendimiento comparativos publicados.

## Limitaciones y advertencias

- Licencia Kimi K3: debe revisarse el texto completo de la licencia en el enlace proporcionado; puede imponer restricciones de uso comercial o de redistribución.
- No se han publicado datos de sesgos ni de evaluación de seguridad; como modelo de 2,8 T, puede heredar sesgos de los datos de entrenamiento de Kimi K3.
- Riesgo de alucinación inherente a los LLM, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- La ventana de 1 M de tokens implica un coste computacional elevado en atención; el uso práctico de contexto completo requiere hardware especializado.
- El ajuste agéntico puede no mantener el rendimiento en tareas no relacionadas con codificación o tool use, aunque no se han publicado evaluaciones al respecto.
- Al ser un modelo de 2,8 T, la inferencia local es inviable sin un clúster; la mayoría de los desarrolladores deberán usar APIs o infraestructura cloud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abacusai/Smaug-Agentic
- Repositorio de archivos: https://huggingface.co/abacusai/Smaug-Agentic/tree/main
- Licencia Kimi K3: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Página de código abierto de Abacus.AI: https://abacus.ai/open-source
- Repositorio GitHub de Smaug: https://github.com/abacusai/smaug
- Noticia sobre el lanzamiento: https://digg.com/tech/9l5gbp3m
