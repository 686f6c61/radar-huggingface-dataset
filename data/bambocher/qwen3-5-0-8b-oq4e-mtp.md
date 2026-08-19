# bambocher/Qwen3.5-0.8B-oQ4e-mtp

## Resumen

El modelo `bambocher/Qwen3.5-0.8B-oQ4e-mtp` es una cuantización en 4 bits del modelo Qwen3.5-0.8B, el miembro más pequeño de la familia Qwen3.5 desarrollada por Alibaba Cloud. Esta versión ha sido generada con la herramienta oQ (oMLX v0.6.1) utilizando cuantización de precisión mixta, y se distribuye en formato MLX safetensors, orientada a su uso en entornos Apple Silicon y otros frameworks compatibles con MLX.

El modelo original Qwen3.5-0.8B emplea una arquitectura híbrida con gated delta networks, una innovación que combina mecanismos de atención con capas recurrentes para mejorar la eficiencia computacional. Según fuentes externas, soporta una longitud de contexto de 262 144 tokens (262K), lo que lo hace adecuado para tareas que requieren procesar documentos extensos o mantener conversaciones de larga duración. Además, se describe como un modelo de visión-lenguaje (VLM), capaz de procesar tanto texto como imágenes, aunque no se confirma si esta cuantización conserva todas las capacidades multimodales.

Esta cuantización reduce el tamaño del modelo a aproximadamente 0,7 GB, lo que permite su ejecución en dispositivos con recursos limitados, como placas Jetson, teléfonos o incluso en CPU con suficiente memoria. Es relevante para desarrolladores que necesitan desplegar un modelo pequeño, rápido y con contexto amplio en entornos de edge computing o como modelo auxiliar para decodificación especulativa con checkpoints más grandes de Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid gated delta networks (segun vLLM Recipes) |
| Parametros totales | 228 747 328 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens (262K, segun vLLM Recipes) |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta (oQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5-0.8B se describe como híbrida con gated delta networks, un diseño que combina mecanismos de atención tradicionales con capas recurrentes basadas en delta rules. Este enfoque busca reducir el coste computacional durante la inferencia manteniendo una calidad competitiva en tareas de razonamiento y generación de texto. No se dispone de información detallada sobre el proceso de entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación consultada.

La cuantización aplicada por `bambocher` utiliza la herramienta oQ de oMLX, que implementa cuantización de precisión mixta. Esto significa que diferentes capas del modelo pueden usar distintos niveles de precisión para optimizar el equilibrio entre tamaño y rendimiento. Los parámetros de cuantización son 4 bits con un tamaño de grupo de 64, lo que permite una compresión significativa del modelo original. El resultado se guarda en formato MLX safetensors, específico para el framework MLX de Apple.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.5-0.8B está diseñado para tareas de lenguaje natural, con mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3, segun Qualcomm AI Hub.
- Procesamiento multimodal: segun Jetson AI Lab, el modelo original es un VLM, capaz de procesar imagenes junto con texto. No se confirma si esta cuantizacion conserva dicha capacidad, por lo que se recomienda verificar antes de usar en tareas de vision.
- Contexto largo: con 262K tokens de ventana, puede manejar documentos extensos o conversaciones de multiples turnos sin perder informacion relevante.
- Multilingue: aunque no se especifican los idiomas exactos, la serie Qwen3.5 es descrita como multilingue por Qualcomm AI Hub.
- Eficiencia computacional: al ser un modelo pequeño (228M parametros) y cuantizado a 4 bits, es adecuado para inferencia en dispositivos con recursos limitados.
- Compatibilidad con MLX: al estar en formato MLX safetensors, se integra nativamente con el ecosistema MLX de Apple, permitiendo su uso en Macs con Apple Silicon y en frameworks como mlx-lm.

## Casos de uso

- Despliegue en dispositivos edge: gracias a su tamano reducido y bajo consumo de memoria, puede ejecutarse en placas como NVIDIA Jetson, Raspberry Pi (con suficiente RAM) o telefonos moviles para tareas de procesamiento de lenguaje natural en tiempo real, como asistentes de voz o traduccion automatica local.
- Modelo draft para decodificacion especulativa: su rapidez y tamano lo hacen ideal como modelo auxiliar para acelerar la generacion de modelos Qwen3.5 mas grandes, reduciendo la latencia en entornos de produccion.
- Procesamiento de documentos largos: con 262K tokens de contexto, puede resumir contratos, articulos cientificos o libros completos sin necesidad de dividir el texto en fragmentos.
- Chatbot local de atencion al cliente: puede gestionar conversaciones multi-turno con memoria amplia, manteniendo el contexto de la interaccion durante largas sesiones, todo ello sin conexion a internet.
- Generacion de codigo en entornos sin GPU: aunque no se especifican capacidades de codigo, el modelo base Qwen3.5 ha demostrado mejoras en instrucciones y razonamiento, por lo que puede utilizarse para autocompletar o explicar fragmentos de codigo en equipos modestos.
- Prototipado rapido de aplicaciones de IA: al ser ligero y facil de integrar via MLX, permite a los desarrolladores experimentar con tecnicas de prompting, agentes o RAG sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas estandar para esta cuantizacion especifica. Se recomienda consultar la pagina del modelo original Qwen3.5-0.8B para obtener referencias de rendimiento del modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 228M parametros y cuantizacion de 4 bits, el modelo ocupa aproximadamente 0,7 GB en disco. En memoria, el peso de los parametros seria de unos 114 MB (228M * 0,5 bytes), mas overhead de activaciones y cache. Se estima que cabe en GPUs con 1 GB de VRAM o menos, y tambien puede ejecutarse en CPU con suficiente RAM (se recomienda al menos 2 GB libres).
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM, como NVIDIA Jetson Nano, GTX 1050, o integradas en Apple Silicon. Para uso en MLX, se requiere un Mac con chip M1 o superior.
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU de consumo actual, incluidas las integradas.
- Opciones de despliegue: al ser formato MLX safetensors, se puede usar con mlx-lm, mlx-vlm (si se confirma soporte multimodal) y otros frameworks compatibles con MLX. Para otros entornos, seria necesario convertir a GGUF u otros formatos mediante herramientas como llama.cpp.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamano del modelo, se espera una latencia de pocos milisegundos por token en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.5-0.8B (original) | ~0.8B | 262K | Apache 2.0 (segun Qwen) | safetensors (bf16) |
| bambocher/Qwen3.5-0.8B-oQ4e-mtp | 228.7M (cuantizado) | 262K | No disponible | MLX safetensors (4-bit) |
| Qwen2.5-0.5B | 0.5B | 32K | Apache 2.0 | safetensors |
| Llama-3.2-1B | 1.0B | 128K | Llama 3.2 Community License | safetensors |

La comparativa se basa en datos publicos de los modelos originales. Esta cuantizacion ofrece un contexto mucho mayor que Qwen2.5-0.5B y un tamano inferior a Llama-3.2-1B, aunque la licencia no esta especificada, lo que limita su uso comercial hasta que el autor la aclare.

## Limitaciones y advertencias

- La licencia del modelo no esta disponible en la model card, lo que impide determinar si es permitido su uso comercial o modificacion. Se recomienda contactar al autor antes de utilizarlo en proyectos de produccion.
- Al ser una cuantizacion de 4 bits, puede producirse una degradacion en la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generacion de codigo, comparado con el modelo en precision completa.
- No se confirma si las capacidades multimodales del modelo base se conservan tras la cuantizacion. Es posible que la parte visual se haya visto afectada o eliminada.
- El numero de parametros reportado en safetensors (228M) difiere del nombre "0.8B", lo que podria indicar que el archivo contiene solo una parte del modelo o que el conteo es incorrecto. Se recomienda verificar la integridad del modelo antes de su uso.
- No se han publicado benchmarks ni evaluaciones independientes para esta cuantizacion, por lo que su rendimiento real es desconocido.
- El contexto de 262K tokens es teorico; en la practica, la memoria disponible puede limitar la longitud efectiva, especialmente en dispositivos con poca RAM.
- El formato MLX safetensors limita su uso a entornos que soporten MLX (principalmente Apple Silicon). Para otros sistemas, se necesitaria una conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-oQ4e-mtp
- Modelo original Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Referencia en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Referencia en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-0-8b/
- Referencia en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_0_8b
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
