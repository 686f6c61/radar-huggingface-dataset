# scottlowry/Ornith-1.5-35B-A3B-oQ8e-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ8e-mtp es una cuantización en 8 bits del modelo MoE Ornith-1.5-35B-A3B, realizada por scottlowry mediante la herramienta oQ (oMLX v0.6.2) con precisión mixta. El modelo base, desarrollado por el equipo de ornith-ai (bajo el nombre DeepReinforce), forma parte de la familia Ornith-1.5, que se presenta en tres tamaños: 397B, 35B y 9B. La versión 35B-A3B indica una arquitectura de mezcla de expertos con 35 mil millones de parámetros totales y 3 mil millones activos por token, basada en la arquitectura qwen3_5_moe (derivada de la familia Qwen3.5).

La característica más distintiva de Ornith-1.5 es su bucle de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones para entrenamiento por refuerzo, creando continuamente nuevas experiencias de aprendizaje. Esta versión cuantizada está optimizada para ejecutarse en Apple Silicon mediante MLX, con un tamaño de repositorio de 38.6 GB y un formato de pesos safetensors. Es relevante porque permite ejecutar un modelo de 35B en hardware de consumo (Mac con memoria unificada) manteniendo una calidad razonable gracias a la cuantización de 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos, basada en Qwen3.5) |
| Parametros totales | 35B (según nombre del modelo); 10.433.809.328 (~10.4B) según el archivo safetensors cuantizado |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (oQ, mixed-precision, group size 64) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

Nota: la discrepancia entre 35B y 10.4B en safetensors se debe probablemente a la cuantización mixta que reduce el tamaño de los tensores almacenados, aunque el número de parámetros del modelo original es 35B.

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) con 35B parámetros totales y 3B activos, siguiendo el diseño de Qwen3.5 MoE. El entrenamiento se basa en un marco de "auto-andamiaje" y "auto-mejora": el modelo genera sus propias tareas, construye andamiajes (scaffolds) específicos para resolverlas y produce rollouts de soluciones que se utilizan para entrenamiento por refuerzo. Este bucle continuo permite que el modelo cree nuevas experiencias de aprendizaje de forma autónoma, mejorando sus capacidades de razonamiento y generalización sin depender exclusivamente de datos externos.

La versión cuantizada aquí descrita no modifica la arquitectura subyacente, sino que aplica una cuantización de 8 bits con grupo de 64 mediante la herramienta oQ de oMLX. Esta cuantización reduce el tamaño en memoria a costa de una ligera pérdida de precisión, pero mantiene la estructura MoE y las capacidades del modelo original.

## Capacidades

- Generación de texto y razonamiento complejo, gracias a su arquitectura MoE de 35B con 3B activos.
- Auto-mejora: el modelo puede proponer nuevas tareas, generar andamiajes y producir soluciones para su propio entrenamiento (según la descripción oficial de Ornith-1.5).
- Soporte de tool calling y function calling, probablemente heredado de la arquitectura Qwen3.5, aunque no se especifica explícitamente en la información disponible.
- Capacidades multilingües no confirmadas; los idiomas soportados no se han publicado.
- No se dispone de información sobre capacidades multimodales (visión, audio) ni sobre un modo de pensamiento explícito.

## Casos de uso

- Desarrollo de agentes autónomos: gracias a su capacidad de auto-mejora y generación de tareas, el modelo puede utilizarse para crear agentes que aprendan de sus propias interacciones y optimicen sus estrategias de razonamiento.
- Generación de código asistida en entornos de desarrollo: con soporte probable de tool calling, puede integrarse en IDEs o pipelines de CI/CD para autocompletar, revisar y refactorizar código.
- Investigación en aprendizaje por refuerzo: el bucle de auto-generación de tareas y rollouts lo convierte en una herramienta útil para experimentos de auto-mejora y curriculum learning.
- Prototipado rápido en Mac: al ser una cuantización MLX de 8 bits, puede ejecutarse localmente en Mac con Apple Silicon, permitiendo pruebas de concepto sin infraestructura cloud.
- Asistencia en análisis de datos y razonamiento matemático: su tamaño y arquitectura MoE ofrecen un buen equilibrio entre capacidad y velocidad para tareas de lógica y cálculo.
- Chatbots conversacionales con contexto largo: aunque la longitud de contexto no está confirmada, los modelos de la familia Qwen3.5 suelen soportar ventanas amplias, lo que permitiría mantener conversaciones multi-turno extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página benchlm.ai menciona el modelo, pero no se ha podido acceder a los datos concretos. No se dispone de comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: para una cuantización de 8 bits de un modelo de 35B, se requieren aproximadamente 35-40 GB de memoria (el repositorio ocupa 38.6 GB). En Mac con memoria unificada, se necesitan al menos 48 GB de RAM (por ejemplo, M1 Max/M2 Ultra con 64 GB).
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3/M4 series) para MLX. En GPUs NVIDIA, sería necesario convertir los pesos a otros formatos (por ejemplo, GGUF o FP16) y usar vLLM o llama.cpp, pero no se proporcionan conversiones oficiales.
- Inferencia en consumer GPU: no cabe en GPUs de consumo típicas (RTX 4090 tiene 24 GB, insuficiente). Solo es viable en hardware Apple con suficiente memoria unificada.
- Opciones de despliegue: MLX (librería nativa para Apple Silicon), posiblemente también mediante conversión a otros formatos (no oficial).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo base Ornith-1.5-35B-A3B comparte arquitectura con Qwen3.5 MoE, pero no hay datos públicos de rendimiento relativo. Se recomienda consultar la página de benchlm.ai para futuras actualizaciones.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial no está garantizado; se debe contactar con el autor original (ornith-ai) para aclarar los términos.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos ni tasas de alucinación; como todo LLM, puede generar información falsa o sesgada.
- La cuantización de 8 bits puede degradar ligeramente la precisión en tareas numéricas o de razonamiento complejo en comparación con el modelo original en FP16.
- Idiomas soportados desconocidos: puede tener un rendimiento inconsistente en lenguas distintas del inglés.
- Sin soporte oficial para GPUs NVIDIA: el formato MLX está pensado para Apple Silicon; su uso en otros hardware requiere conversión manual.
- El número de descargas y likes es cero, lo que indica que es un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ8e-mtp
- Colección oficial de Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Página oficial de Ornith-1.5 (self-scaffolding): https://ornith.ai/ornith_1_5.html
- Artículo de lanzamiento (testingcatalog): https://www.testingcatalog.com/ornith-1-5-open-models-launch-in-397b-35b-and-9-b-sizes/
- Seguimiento de benchmarks (benchlm.ai): https://benchlm.ai/models/ornith-1-5-35b-a3b
