# llmsforall/Millie-35B-A3B-9GB

## Resumen

Millie-35B-A3B-9GB es un modelo de lenguaje de gran tamaño desarrollado por llmsforall, orientado a tareas de codificación y agentes, con capacidades multimodales de entrada de imagen. Se trata de un modelo de mezcla de expertos (MoE) derivado de Agents-A1, construido sobre la arquitectura Qwen3.5-35B-A3B. Cuenta con 35 000 millones de parámetros en total, de los cuales solo 3 000 millones se activan por token, lo que reduce significativamente el coste computacional en comparación con un modelo denso del mismo tamaño. Ofrece una ventana de contexto de 262 000 tokens, lo que permite procesar repositorios de código completos o documentos extensos.

La variante de 9 GB comprime los pesos de los expertos en un formato ternario de máscara y signo (mask-and-sign) a 1,69 bits por peso, lo que la convierte en la variante más pequeña y rápida de la familia Millie. El modelo se distribuye en formato GGUF y requiere un fork específico de llama.cpp para cargar sus kernels. Su relevancia radica en que permite ejecutar un modelo de 35B con capacidades multimodales en hardware ordinario, como portátiles o GPUs de consumidor con 12 GB de VRAM, además de estar licenciado bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre arquitectura Qwen3.5-35B-A3B |
| Parametros totales | 34.660.610.688 |
| Parametros activos | 3B (aproximadamente 3.000 millones por token) |
| Longitud de contexto | 262.000 tokens (262K) |
| Tipos de cuantizacion | Pesos de expertos en formato ternario mask-and-sign a 1,69 bits por peso (variante 9 GB); existen variantes 11 GB (~2,2 bits por peso) y 7 GB (no especificado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye mmproj para vision) |

## Arquitectura y entrenamiento

Millie-35B-A3B-9GB es un modelo de mezcla de expertos derivado de Agents-A1, que a su vez se basa en la arquitectura Qwen3.5-35B-A3B. En cada token solo se activan 3 000 millones de parámetros, lo que permite obtener el rendimiento de un modelo de 35B con un coste de inferencia cercano al de un modelo de 3B. La innovación principal es la cuantización ternaria de los pesos de los expertos en formato mask-and-sign, que reduce la memoria necesaria a 1,69 bits por peso. Esta compresión es específica del proyecto: los archivos GGUF requieren el fork de llama.cpp de llmsforall, que incluye kernels para Metal, Vulkan y CPU; el llama.cpp estándar no puede cargar el modelo.

La model card no detalla el proceso de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. De la información disponible se deduce que el modelo combina capacidades de codificación, razonamiento agéntico y entrada de imágenes, probablemente mediante un proyector multimodal integrado. No se ha publicado información sobre el número de tokens de entrenamiento ni sobre la procedencia de los datos.

## Capacidades

- Generación de texto enfocada a tareas de codificación: el modelo está diseñado para asistir en la escritura, revisión y depuración de código.
- Capacidades agénticas: está descrito como un modelo agentic, lo que sugiere planificación multi-paso y uso de herramientas, aunque no se especifican protocolos concretos de tool calling en la información disponible.
- Entrada de imágenes: es un modelo multimodal (VLM) que puede procesar imágenes, lo que habilita tareas como análisis de capturas de pantalla, diagramas o gráficos.
- Contexto largo de 262.000 tokens: permite procesar repositorios completos, documentación técnica extensa o conversaciones largas en una sola pasada.
- Eficiencia computacional gracias a sus 3B de parámetros activos por token, lo que reduce la latencia y el consumo de memoria en comparación con modelos densos equivalentes.
- Soporte de vision mediante el archivo mmproj, que se carga junto al GGUF principal para habilitar la entrada multimodal.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en entornos de desarrollo para autocompletar código, sugerir refactorizaciones y detectar errores, aprovechando su contexto de 262K para analizar archivos completos o módulos.
- Análisis de capturas de pantalla de errores: al aceptar entrada de imágenes, puede interpretar mensajes de error, logs visuales o diagramas de arquitectura y proponer soluciones concretas.
- Agentes de automatización de tareas de DevOps: con capacidades agénticas y contexto largo, puede gestionar pipelines de CI/CD, interpretar salidas de comandos y coordinar múltiples pasos en un flujo de trabajo.
- Revisión de repositorios extensos en una sola pasada: su ventana de 262K tokens permite cargar el contenido de varios archivos fuente simultáneamente, lo que facilita tareas de auditoría, análisis de dependencias y revisión de pull requests.
- Documentación técnica a partir de material visual: el modelo puede generar documentación a partir de capturas de pantalla de interfaces, diagramas de flujo o diagramas de secuencia.
- Uso en equipos de consumidor sin acceso a la nube: al ocupar solo 9 GB, puede ejecutarse en portátiles con 16 GB de RAM mediante la versión CPU del fork de llama.cpp, lo que resulta adecuado para desarrollo en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos GGUF ocupan aproximadamente 9 GB, pero la inferencia con contexto largo y el proyector de visión requerirán memoria adicional. Se estima un mínimo de 12 GB de VRAM para un uso estable, y más para contextos de 262K tokens.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4080 o superiores. En macOS, es compatible con Apple Silicon gracias al soporte Metal del fork.
- Compatibilidad con GPU de consumidor: sí, en tarjetas con al menos 12 GB de VRAM. En CPU, puede ejecutarse, aunque con menor velocidad.
- Opciones de despliegue: requiere el fork de llama.cpp de llmsforall, que incluye kernels para Metal, Vulkan y CPU. No es compatible con el llama.cpp estándar, por lo que no se puede garantizar su funcionamiento con vLLM, Ollama o TGI sin verificación previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa se limita a las variantes de la misma familia y al modelo base, ya que no se dispone de datos de rendimiento de otros modelos comparables.

| Modelo | Bits por peso | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Millie-35B-A3B-9GB | 1,69 | 262K | Apache 2.0 | GGUF |
| Millie-35B-A3B-11GB | ~2,2 | 262K | Apache 2.0 | GGUF |
| Millie-35B-A3B-7GB | no especificado | 262K | Apache 2.0 | GGUF |
| Agents-A1 (base) | no disponible | no disponible | no disponible | no disponible |

No se conocen benchmarks de rendimiento para comparar estos modelos entre sí.

## Limitaciones y advertencias

- El modelo requiere un fork específico de llama.cpp; no se puede cargar con el llama.cpp estándar, lo que condiciona el despliegue a entornos que usen ese fork.
- La cuantización ternaria de 1,69 bits por peso puede degradar la calidad de las respuestas en comparación con modelos sin cuantizar, aunque no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Los idiomas soportados no están documentados; la información disponible no permite confirmar un rendimiento adecuado en español o en otros idiomas distintos del inglés.
- No se han publicado benchmarks que permitan evaluar su rendimiento frente a otros modelos, por lo que las capacidades reales en tareas de codificación, razonamiento o visión no están validadas externamente.
- No hay información sobre sesgos, alucinaciones ni comportamiento en producción. Antes de usarlo en aplicaciones críticas, se recomienda realizar pruebas propias.
- La licencia Apache 2.0 permite uso comercial, pero hay que revisar los ficheros LICENSE y NOTICE incluidos en el repositorio para conocer las atribuciones requeridas.
- Los parámetros activos indicados son aproximados; el número exacto de parámetros activos por token no se especifica con precisión en la documentación.

## Enlaces

- Página del modelo: https://huggingface.co/llmsforall/Millie-35B-A3B-9GB
- Variante 11 GB: https://huggingface.co/llmsforall/Millie-35B-A3B-11GB
- Variante 7 GB: https://huggingface.co/llmsforall/Millie-35B-A3B-7GB
- Modelo base Agents-A1: https://huggingface.co/InternScience/Agents-A1
- Fork de llama.cpp requerido: https://github.com/llmsforall/llama.cpp
- Artículo sobre Qwen3.6-35B-A3B: https://www.labellerr.com/blog/qwen3-6-35b-a3b-open-source-ai-model/
