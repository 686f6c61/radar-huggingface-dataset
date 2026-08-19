# Qwen/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B, también conocido como Qwen3.8-Max, es el modelo de código abierto más grande lanzado por Alibaba hasta la fecha. Con 2,4 billones de parámetros totales y 95 mil millones de parámetros activos por token, emplea una arquitectura de mezcla de expertos (MoE) de grano fino combinada con un mecanismo de atención híbrido que alterna atención completa y lineal. Este diseño permite manejar ventanas de contexto de 256 000 tokens, ampliables hasta 1 millón, manteniendo un coste computacional razonable durante la inferencia.

El modelo destaca por ser el primero de la clase "Max" de Qwen en abrir sus pesos, acercando capacidades de nivel fronterizo al ecosistema open source. Está orientado a tareas de razonamiento complejo, generación de código, investigación y trabajos de largo horizonte, con un modo de pensamiento configurable que permite ajustar el esfuerzo de razonamiento según la tarea. Su lanzamiento, anunciado en agosto de 2026, ha sido recibido con atención por parte de la comunidad, y ya existen guías de despliegue para infraestructuras de alta gama como el NVIDIA GB300 NVL72.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de grano fino con atención híbrida (full + linear) |
| Parametros totales | 2,4 billones (2.4T) |
| Parametros activos | 95 mil millones (95B) por token |
| Longitud de contexto | 256 000 tokens (ampliable hasta 1 000 000) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-2.4T-A95B se basa en el diseño de Qwen 3.5, escalado hasta 2,4 billones de parámetros. Utiliza un enfoque de mezcla de expertos de grano fino, donde cada token activa únicamente 95 mil millones de parámetros, lo que reduce significativamente el coste computacional en comparación con un modelo denso del mismo tamaño. La atención híbrida combina mecanismos de atención completa (full attention) con atención lineal (linear attention), una innovación que permite procesar secuencias largas de hasta 256 000 tokens (y hasta 1 millón en configuraciones extendidas) sin el coste cuadrático típico de los transformers tradicionales.

No se han publicado detalles específicos sobre el conjunto de datos de entrenamiento, el número total de tokens procesados ni las técnicas de alineación empleadas (como RLHF o DPO) en la información disponible. El modelo incluye capacidades de razonamiento configurable, lo que sugiere un entrenamiento orientado a tareas de pensamiento profundo, pero los detalles exactos del pipeline de entrenamiento no han sido revelados.

## Capacidades

- Generación de texto avanzada con razonamiento profundo, especialmente en tareas de matemáticas, lógica y resolución de problemas complejos.
- Razonamiento configurable: permite ajustar el nivel de esfuerzo de pensamiento (thinking mode) según la necesidad, desde respuestas rápidas hasta análisis prolongados.
- Generación de código y soporte para tareas de programación, incluyendo depuración y refactorización.
- Manejo de contextos muy largos (256K tokens, hasta 1M) gracias a la atención híbrida, lo que permite procesar documentos extensos, libros completos o historiales de conversación prolongados.
- Capacidades multilingües: aunque no se especifican los idiomas exactos, la familia Qwen tradicionalmente soporta múltiples lenguas; se recomienda consultar la documentación oficial para confirmar.
- Soporte para tareas de largo horizonte (long-horizon tasks), como planificación de proyectos, investigación bibliográfica y análisis de datos extensos.
- No se ha confirmado explícitamente el soporte de tool calling o function calling en la información disponible, aunque es probable dado el enfoque de la familia Qwen; se debe verificar en la documentación oficial.

## Casos de uso

- Análisis de documentos extensos: gracias a su ventana de contexto de 256K tokens, el modelo puede procesar informes anuales, expedientes legales o investigaciones académicas completas en una sola pasada, extrayendo conclusiones y resumiendo secciones relevantes sin necesidad de dividir el texto.
- Generación de código en entornos de producción: con capacidades de razonamiento y generación de código, puede integrarse en pipelines de CI/CD para autocompletar funciones, revisar pull requests o generar pruebas unitarias, reduciendo la intervención manual.
- Asistentes de investigación científica: el modelo puede analizar grandes volúmenes de literatura, identificar patrones y proponer hipótesis, ayudando a investigadores en fases de revisión sistemática o meta-análisis.
- Agentes autónomos de largo plazo: su capacidad para mantener contexto extenso y razonar de forma prolongada lo hace adecuado para agentes que deben ejecutar tareas multi-paso, como planificación de viajes, gestión de proyectos o automatización de flujos de trabajo complejos.
- Atención al cliente con historial extenso: puede gestionar conversaciones de soporte técnico que abarcan múltiples sesiones, recordando detalles previos y ofreciendo respuestas coherentes gracias a su memoria de contexto amplia.
- Razonamiento matemático y lógico avanzado: útil en entornos educativos o de investigación para resolver problemas de alto nivel, verificar demostraciones o generar explicaciones paso a paso.
- Resumen y análisis de código legacy: puede procesar repositorios completos (dentro del límite de contexto) para documentar funciones, identificar dependencias o sugerir refactorizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Aunque se menciona que el modelo "rivaliza con GPT-5.6 Sol" según fuentes de Unsloth, no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas. Se recomienda consultar la documentación oficial de Qwen para obtener datos de evaluación actualizados.

## Requisitos de hardware

- El modelo tiene 2,4 billones de parámetros totales, por lo que no es ejecutable en GPUs de consumo. Requiere infraestructura de centro de datos con múltiples GPUs de alta gama.
- Según el blog técnico de NVIDIA, el despliegue de referencia se realiza en el sistema NVIDIA GB300 NVL72, que integra 72 GPUs y 36 CPUs en un solo rack, con memoria unificada de alta capacidad.
- Para inferencia con los 95B parámetros activos, se necesita al menos una GPU con suficiente memoria para alojar los pesos activos y las claves/valores de atención. En configuraciones típicas, se recomiendan GPUs como H100, H200 o B200 con 80 GB o más de VRAM por GPU, en configuraciones multi-GPU.
- La memoria total requerida para cargar los pesos en FP16 sería de aproximadamente 4,8 TB, lo que obliga a usar cuantización (por ejemplo, FP8 o INT4) o a distribuir los pesos entre múltiples dispositivos.
- Opciones de despliegue: vLLM, TensorRT-LLM (según el blog de NVIDIA), y potencialmente TGI o llama.cpp si se publican versiones cuantizadas. Unsloth ha documentado guías para ejecutar el modelo localmente, aunque con requisitos de hardware muy elevados.
- La latencia y el throughput dependen en gran medida del hardware y de la configuración de razonamiento. No se han publicado cifras oficiales en la información disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa rigurosa con otros modelos de la misma categoría. La información menciona que Qwen3.8-2.4T-A95B "rivaliza con GPT-5.6 Sol", pero no se ofrecen especificaciones de ese modelo. Tampoco se dispone de comparaciones con otros modelos MoE de gran escala como DeepSeek-V3 o Mixtral 8x22B en términos de rendimiento. Se recomienda consultar benchmarks independientes para una evaluación objetiva.

## Limitaciones y advertencias

- Al ser un modelo de 2,4 billones de parámetros, su despliegue requiere una inversión significativa en hardware y energía, lo que limita su uso a organizaciones con infraestructura de centro de datos.
- La licencia está etiquetada como "other" en Hugging Face, sin especificar los términos exactos. Es imprescindible revisar la documentación oficial antes de cualquier uso comercial para conocer las restricciones.
- No se han publicado detalles sobre sesgos o alucinaciones específicos. Como todo modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo si no se supervisa adecuadamente.
- El soporte de idiomas no está documentado en la información disponible; aunque la familia Qwen suele cubrir múltiples lenguas, no se puede confirmar la cobertura exacta.
- La ventana de contexto de 256K tokens es ampliable hasta 1M, pero el rendimiento en longitudes extremas puede degradarse; se recomienda validar en casos de uso reales.
- No se ha confirmado el soporte de tool calling o function calling, lo que puede limitar su integración en pipelines de agentes que dependan de esa funcionalidad.

## Enlaces

- [Hugging Face - Qwen3.8-2.4T-A95B](https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B)
- [Blog de NVIDIA - Serve Qwen3.8-2.4T-A95B](https://developer.nvidia.com/blog/serve-qwen3-8-2-4t-a95b-a-2-4t-parameter-model-with-configurable-reasoning-on-nvidia-gb300-nvl72/)
- [Documentación de Unsloth - Qwen3.8](https://unsloth.ai/docs/models/qwen3.8)
- [OpenLM - Qwen3.8](https://openlm.ai/qwen3.8/)
- [Perfil de Qwen en Hugging Face](https://huggingface.co/Qwen)
