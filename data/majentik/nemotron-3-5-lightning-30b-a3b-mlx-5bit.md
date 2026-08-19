# majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-5bit

## Resumen

El modelo `majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-5bit` es una cuantización en 5 bits (affine, group size 64) del modelo NVIDIA Nemotron 3.5 Lightning 30B A3B, realizada con la librería MLX para ejecutarse en Apple Silicon. El modelo base, desarrollado por NVIDIA, es un modelo de lenguaje híbrido que combina atención, Mamba-2 y mezcla de expertos (MoE), con 30 000 millones de parámetros totales y aproximadamente 3 000 millones de parámetros activos por token. Dispone de una ventana de contexto de 1 millón de tokens y está diseñado específicamente para aplicaciones de agentes de IA de larga duración, con decodificación especulativa nativa (DSpark, DFlash y MTP) para reducir la latencia.

Esta versión cuantizada permite ejecutar el modelo en equipos Mac con memoria unificada, manteniendo un equilibrio entre tamaño y calidad. El repositorio ocupa 21,7 GB y el archivo safetensors contiene 5 928 065 856 parámetros, aunque esta cifra corresponde al almacenamiento cuantizado y no al número real de parámetros del modelo base. La licencia es OpenMDW v1.1, que permite uso comercial y distribución de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención + Mamba-2 + MoE (Nemotron-H) |
| Parametros totales | 30B (modelo base) |
| Parametros activos | ~3B (MoE) |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantizacion | 5-bit affine, group size 64 (este repo); también disponibles 2, 3, 4, 6, 8 bits y MXFP4 |
| Idiomas soportados | Inglés, español, francés, alemán, italiano, japonés y lenguajes de programación |
| Licencia | OpenMDW v1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base NVIDIA Nemotron 3.5 Lightning 30B A3B emplea una arquitectura híbrida que combina capas de atención tradicional, bloques Mamba-2 (modelos de espacio de estado) y una capa de mezcla de expertos con 3 000 millones de parámetros activos. Esta combinación permite manejar contextos muy largos (1M tokens) con un coste computacional reducido, ya que Mamba-2 ofrece escalabilidad lineal en longitud de secuencia. El modelo incorpora además mecanismos de decodificación especulativa nativos (DSpark, DFlash y MTP) que aceleran la generación sin sacrificar calidad.

El preentrenamiento se realizó con más de 20 billones de tokens, seguido de una fase de post-entrenamiento con datos curados y sintéticos de alta calidad, incluyendo una pequeña porción de datos de pregunta-respuesta y alineación para mejorar la precisión. No se especifica si se utilizó RLHF o DPO, pero la mezcla de datos de alineación sugiere un ajuste supervisado adicional. La cuantización MLX 5-bit se aplicó posteriormente sobre los pesos BF16 originales, reduciendo el tamaño del modelo a aproximadamente 21,7 GB.

## Capacidades

- Generación de texto y conversación multi-turno con contexto de hasta 1M tokens.
- Razonamiento complejo y resolución de problemas en dominios generales y técnicos.
- Generación de código en múltiples lenguajes de programación.
- Soporte multilingüe: inglés, español, francés, alemán, italiano y japonés.
- Diseñado para sistemas de agentes: puede mantener estados largos y ejecutar tareas multi-paso.
- Decodificación especulativa nativa (DSpark, DFlash, MTP) para reducir la latencia en producción.
- Adecuado para tareas de RAG (generación aumentada por recuperación) gracias a su amplio contexto.

## Casos de uso

- Agentes autónomos de larga duración: el modelo puede mantener un contexto de 1M tokens, lo que permite a un agente recordar interacciones previas y ejecutar tareas complejas sin perder información relevante.
- Asistencia al cliente automatizada: con su capacidad multilingüe y de conversación multi-turno, puede gestionar incidencias técnicas en varios idiomas, manteniendo el historial completo de la conversación.
- Generación de código en entornos de desarrollo: soporta lenguajes de programación y puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar código.
- Sistemas de recuperación aumentada (RAG): su ventana de contexto amplia permite procesar documentos extensos y responder preguntas basadas en ellos sin necesidad de fragmentar el texto.
- Análisis de documentos legales o financieros: puede resumir y extraer información de contratos o informes largos, gracias a su capacidad de procesar secuencias de hasta 1M tokens.
- Traducción automática y localización: al soportar varios idiomas, puede traducir contenido manteniendo coherencia contextual en textos largos.
- Prototipado rápido en Mac: al ser una cuantización MLX, permite a desarrolladores con Apple Silicon probar el modelo localmente sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La búsqueda web menciona la existencia de una evaluación en PinchBench, pero no se proporcionan cifras concretas. Tampoco se dispone de comparativas oficiales con otros modelos en la documentación del repositorio.

## Requisitos de hardware

- Diseñado para Apple Silicon (M1, M2, M3, M4 y superiores) mediante la librería MLX.
- El tamaño del repositorio es de 21,7 GB, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada para cargar el modelo y dejar margen para el contexto y la generación.
- Con 24 GB de memoria unificada podría funcionar, pero con limitaciones en la longitud del contexto.
- Inferencia mediante `mlx-lm` (pip install mlx-lm) y el comando `mlx_lm.generate`.
- No requiere GPU NVIDIA; está optimizado para la GPU integrada de Apple.
- La latencia y el throughput dependen del chip concreto; en un M2 Max se pueden esperar decenas de tokens por segundo, aunque no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. El modelo base compite con alternativas como Llama 3.1 70B, Qwen 2.5 32B o Mixtral 8x7B, pero no se han publicado comparativas específicas. La cuantización MLX 5-bit es comparable a otras versiones cuantizadas del mismo modelo (2, 3, 4, 6, 8 bits y MXFP4) disponibles en el mismo perfil de HuggingFace.

## Limitaciones y advertencias

- La cuantización 5-bit puede introducir una ligera degradación en la calidad de generación respecto al modelo BF16 original, especialmente en tareas de razonamiento complejo.
- El modelo está optimizado para inglés y lenguajes de programación; el rendimiento en otros idiomas puede ser inferior.
- Al ser un modelo de 30B con solo 3B activos, la calidad en tareas que requieren conocimiento enciclopédico profundo puede ser menor que la de modelos densos de tamaño similar.
- La licencia OpenMDW v1.1 permite uso comercial, pero es necesario revisar los términos completos en https://openmdw.ai/license/1-1/.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta cuantización.
- El modelo puede generar contenido inexacto o sesgado, como cualquier LLM; se recomienda validar las salidas en aplicaciones críticas.
- La ejecución en Apple Silicon requiere suficiente memoria unificada; con menos de 24 GB puede haber problemas de rendimiento o fallos de carga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-5bit
- Modelo base en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Página del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Ficha en benchgen.com: https://benchgen.com/models/nvidia/nemotron-3-5-lightning-30b-a3b
- Catálogo NGC de NVIDIA: https://catalog.ngc.nvidia.com/orgs/nim/nvidia/models/nemotron-3.5-lightning
- Licencia OpenMDW v1.1: https://openmdw.ai/license/1-1/
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
