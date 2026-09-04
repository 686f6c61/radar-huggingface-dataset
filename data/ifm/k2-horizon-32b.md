# IFM/K2-Horizon-32B

## Resumen

K2-Horizon-32B es un modelo de lenguaje denso de 32.000 millones de parámetros (34.779.304.960 en el checkpoint publicado) desarrollado por IFM como parte de la familia K2-Horizon. Se trata de un modelo decoder-only con una ventana de contexto nativa de 524.288 tokens (512K), lo que lo sitúa en la categoría de modelos de contexto largo para tareas de razonamiento, generación de código y agentes. El checkpoint actual es la etapa 1 del entrenamiento (Stage1); el checkpoint final aún no se ha publicado.

El modelo destaca por ser completamente abierto: la licencia es Apache 2.0, los pesos están disponibles en formato safetensors y la organización ha anunciado que publicará tanto la receta de entrenamiento como los datos y el código. La model card indica que se trata de un baseline denso fuerte, evaluado en los mismos benchmarks de agentes, código y razonamiento que el resto de la familia, y que los checkpoints intermedios se publicarán para estudiar la evolución de las capacidades a lo largo del entrenamiento. Su relevancia actual radica en ofrecer una alternativa densa de rendimiento competitivo por debajo de los 40.000 millones de parámetros, con despliegue local viable y una ventana de contexto muy amplia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer denso |
| Parametros totales | 34.779.304.960 (34.8B; denominado 32B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

K2-Horizon-32B es un modelo transformer decoder-only de arquitectura densa, sin mezcla de expertos. La ventana de contexto de 512K es nativa desde las etapas de midtraining, lo que permite procesar documentos extensos sin truncamiento. El entrenamiento se divide en dos etapas: el checkpoint publicado corresponde a la etapa 1 (Stage1), y la etapa 2 está prevista para completar el modelo final. Los datasets utilizados son IFM/K2-Horizon-Pretrain-Data y IFM/K2-Horizon-Midtrain-Data, ambos públicos en Hugging Face. La información proporcionada no especifica el número total de tokens de entrenamiento ni la composición exacta del dataset. IFM ha declarado que la receta de entrenamiento y el código se harán públicos, lo que permitirá reproducir y estudiar el proceso.

## Capacidades

- Generación de texto en inglés con razonamiento de propósito general.
- Capacidades de agente evaluadas en benchmarks como tau3-Banking, lo que sugiere soporte para tareas multi-paso con herramientas.
- Generación de código y razonamiento matemático, según los benchmarks mencionados en la model card.
- Procesamiento de contexto largo nativo de 512K tokens, adecuado para documentos extensos y conversaciones largas.
- Despliegue local con pesos abiertos, sin necesidad de servicios propietarios.
- Publicación de checkpoints intermedios para estudiar la evolución de las capacidades durante el entrenamiento.

## Casos de uso

- Análisis de documentos extensos: gracias a la ventana de 512K tokens, el modelo puede procesar contratos legales, informes técnicos o libros completos en una sola pasada, sin necesidad de fragmentar el texto ni recurrir a técnicas de recuperación.
- Agentes autónomos para tareas bancarias o financieras: los benchmarks de agentes (tau3-Banking) indican que el modelo puede gestionar flujos de trabajo multi-paso, como consultas de saldo, transferencias o resolución de incidencias, en entornos simulados con herramientas.
- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, aprovechando su capacidad de razonamiento y su contexto largo para mantener el estado del proyecto.
- Asistente conversacional especializado en inglés: al ser un modelo denso de 32B con licencia Apache 2.0, puede desplegarse en infraestructura propia para construir chatbots de atención al cliente o asistentes internos, sin costes de API.
- Investigación en interpretabilidad y dinámica de entrenamiento: la publicación de checkpoints intermedios permite analizar cómo cambian las capacidades (razonamiento, código, agentes) a lo largo de las etapas de entrenamiento, lo que resulta valioso para estudiar el fenómeno de la emergencia.
- Razonamiento matemático y científico: el modelo está evaluado en benchmarks de razonamiento, por lo que puede utilizarse para resolver problemas complejos, generar demostraciones o apoyar el análisis de datos en entornos académicos.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con modelos densos de peso abierto: Qwen3.8-27B, Muse Glimmer-30B e IBM Granite 4.2 30B. La tabla muestra los parámetros totales, los parámetros activos y la arquitectura, y comienza a listar resultados en la categoría de agentes (tau3-Banking). Sin embargo, los valores numéricos de los benchmarks no están disponibles en la información proporcionada, ya que el texto está truncado. No se han publicado resultados numéricos completos en la información disponible. El blog de IFM indica que Horizon 32B se sitúa entre los mejores modelos densos por debajo de 40.000 millones de parámetros, pero no se aportan cifras concretas.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la información disponible.
- Estimación orientativa para el checkpoint FP16: aproximadamente 70 GB de VRAM, considerando solo los pesos (34.8B × 2 bytes). Con overhead de inferencia, se recomienda una GPU con 80 GB o más, como A100 80GB o H100.
- Con cuantización a 8 bits, la VRAM estimada se reduce a unos 35 GB, lo que permite su ejecución en GPUs como A100 40GB o RTX 6000 Ada.
- Con cuantización a 4 bits, la VRAM estimada es de unos 20 GB, lo que podría permitir su ejecución en una RTX 4090 (24 GB) con técnicas de offloading o contexto reducido.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers. No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| K2-Horizon-32B-Stage1 | 34.8B (32B) | 512K | Apache 2.0 | Pesos abiertos en Hugging Face |
| Qwen3.8-27B | 27B | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | 30B | no disponible | no disponible | no disponible |
| IBM Granite 4.2 30B | 30B | no disponible | no disponible | no disponible |

La model card compara estos tres modelos en la misma categoría de densidad, pero no se dispone de información sobre su contexto, licencia ni disponibilidad en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint publicado es la etapa 1 del entrenamiento (Stage1). El checkpoint final aún no se ha lanzado, por lo que el rendimiento puede variar en la versión definitiva.
- El modelo solo está entrenado en inglés. No se ha verificado su rendimiento en otros idiomas.
- No se han publicado los valores numéricos de los benchmarks en la información disponible, por lo que no es posible validar el rendimiento de forma independiente.
- Los datos de entrenamiento no están detallados en cuanto a número de tokens y composición, lo que limita la evaluación de sesgos y riesgos.
- El riesgo de alucinación no ha sido evaluado en la información proporcionada; se recomienda realizar pruebas específicas antes de usar el modelo en producción.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar la licencia de los datasets de entrenamiento para garantizar el cumplimiento normativo.
- El contexto de 512K tokens implica un alto coste de memoria y cómputo en inferencia, especialmente con secuencias largas, lo que puede dificultar el despliegue en hardware limitado.

## Enlaces

- Hugging Face: https://huggingface.co/IFM/K2-Horizon-32B
- Blog de IFM: https://ifm.ai/blog/k2
- Dataset de pretraining: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
