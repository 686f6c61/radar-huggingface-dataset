# niefeng/eelml-qwen3-5-0-8b-mlx-q4

## Resumen

El modelo `niefeng/eelml-qwen3-5-0-8b-mlx-q4` es un paquete físico EELML Runtime 2.0 compilado a partir del modelo base `Qwen/Qwen3.5-0.8B` de Alibaba Cloud. EELML Studio ha realizado la cuantización Q4, el reordenamiento de tensores, la alineación y el layout MLX de forma offline, generando un único archivo `.eelml` de 444 MB. Este paquete está diseñado para ser ejecutado exclusivamente por el runtime `mlx_qwen3_5@2` de EELML Studio, sin recurrir a Safetensors, GGUF u otros formatos.

El modelo base Qwen3.5-0.8B es el miembro más pequeño de la familia Qwen3.5, con arquitectura híbrida gated delta networks y una ventana de contexto de 262.144 tokens. Incluye capacidades multimodales (visión y texto) y soporte nativo para herramientas. Este paquete concreto lo hace adecuado para entornos edge o como modelo borrador en decodificación especulativa con modelos Qwen3.5 más grandes. La licencia es Apache 2.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid gated delta networks (Qwen3.5-0.8B) |
| Parametros totales | 0.8B (aproximado, según nombre del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (según fuentes externas) |
| Tipos de cuantizacion | Q4 (MLX Q4) |
| Idiomas soportados | Multilingue (detalle no especificado en la informacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | .eelml (paquete EELML, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida de redes gated delta, una evolución de los transformers tradicionales que combina mecanismos de atención con actualizaciones de estado de tipo delta. Esta arquitectura permite un contexto largo (262K) con un coste computacional reducido, ideal para dispositivos con recursos limitados. La familia Qwen3.5 incorpora además un entrenamiento temprano de fusión multimodal, integrando tokens de visión y texto desde las primeras fases, lo que mejora el rendimiento en tareas de razonamiento, código y agentes frente a Qwen3-VL.

El paquete EELML no modifica los pesos del modelo base; solo aplica una cuantización Q4 y un reordenamiento de tensores para optimizar la ejecución en el runtime EELML. No se dispone de información sobre los datos de entrenamiento originales ni sobre técnicas de alineación (RLHF/DPO) para este modelo concreto.

## Capacidades

- Generacion de texto y razonamiento, con contexto largo de 262K tokens.
- Comprension de vision (imagenes) como entrada, gracias a la fusion multimodal temprana.
- Soporte de tool calling / function calling mediante el protocolo `qwen35-xml-tool-v1`.
- Capacidad para actuar como modelo borrador en decodificacion especulativa con modelos Qwen3.5 mas grandes.
- Instruccion y seguimiento de instrucciones mejorados respecto a Qwen3, segun fuentes externas.
- Capacidades multilingues (idiomas no detallados en la informacion proporcionada).

## Casos de uso

- **Asistentes en dispositivos edge**: su tamano compacto (0.8B, cuantizado Q4) y su contexto de 262K permiten ejecutar asistentes conversacionales en moviles, tablets o sistemas embebidos sin depender de la nube.
- **Analisis de imagenes en tiempo real**: gracias a su soporte multimodal, puede clasificar o describir imagenes capturadas por camaras en sistemas de vigilancia o aplicaciones de diagnostico visual.
- **Automatizacion de tareas con herramientas**: el protocolo de tool calling permite que el modelo invoque funciones externas (APIs, bases de datos) para completar tareas como gestion de calendario o consulta de informacion en tiempo real.
- **Relleno de formularios y extraccion de datos**: su capacidad de procesar texto e imagenes lo hace util para extraer informacion de documentos escaneados y rellenar plantillas automaticamente.
- **Modelo borrador para decodificacion especulativa**: en sistemas con modelos Qwen3.5 grandes, este modelo puede proponer tokens rapidamente y acelerar la generacion del modelo principal, reduciendo la latencia.
- **Prototipado de agentes conversacionales**: para desarrolladores que necesitan validar flujos de conversacion o agentes en entornos con recursos limitados antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este paquete EELML en la informacion disponible. Las fuentes externas indican que el modelo base Qwen3.5-0.8B tiene una buena recuperacion de informacion pero una precision de codigo limitada, y se recomienda usar Qwen3.5 4B para tareas de programacion. No obstante, no se aportan numeros concretos. Se recomienda consultar los benchmarks oficiales de Qwen3.5 para una evaluacion comparativa.

## Requisitos de hardware

- **VRAM estimada**: con cuantizacion Q4, el modelo ocupa aproximadamente 0.4 GB, por lo que puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, o incluso en CPU con memoria suficiente.
- **GPU recomendadas**: cualquier GPU con soporte para MLX (Apple Silicon) o tarjetas con al menos 2 GB de VRAM (RTX 2050, GTX 1650, etc.). En Apple Silicon, el runtime EELML aprovecha el Neural Engine.
- **Compatibilidad con consumer GPU**: sí, cabe en la mayoria de GPUs de consumo, asi como en moviles y dispositivos embebil.
- **Opciones de despliegue**: el paquete requiere el runtime EELML 2.0 de EELML Studio. No es compatible con vLLM, llama.cpp, Ollama o TGI directamente, ya que solo acepta el archivo `.eelml`. El modelo base puede ejecutarse con Ollama (`ollama run qwen3.5:0.8b`) o llama.cpp (GGUF) si se obtiene el formato original.
- **Latencia y throughput**: no se dispone de datos especificos. Dado el tamano, se espera una latencia de unos pocos milisegundos por token en hardware moderno, pero no esta medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 0.8B | 262K | Si | Apache 2.0 | Safetensors, GGUF, MLX |
| Qwen3-0.6B | 0.6B | 32K | No | Apache 2.0 | Safetensors, GGUF |
| SmolLM2-360M | 0.36B | 2K | No | Apache 2.0 | Safetensors, GGUF |

No se dispone de una comparativa directa con modelos equivalentes en formato EELML, ya que este paquete es una compilacion especifica para el runtime EELML. En terminos de modelo base, Qwen3.5-0.8B supera a Qwen3-0.6B en contexto y capacidades multimodales, pero es mas pesado que SmolLM2. No se conocen benchmarks comparativos publicados.

## Limitaciones y advertencias

- El paquete EELML solo puede ejecutarse con el runtime EELML 2.0; no es compatible con otros frameworks (vLLM, llama.cpp, Ollama, etc.) ni con otros formatos de pesos.
- El modelo base tiene una precision de codigo limitada, como se indica en fuentes externas; no es recomendable para generacion de codigo complejo en produccion.
- La informacion sobre idiomas soportados no esta disponible; se asume que sigue el soporte de Qwen3.5, pero no se especifica.
- La licencia Apache 2.0 permite uso comercial, pero se debe cumplir con la atribucion requerida por Alibaba Cloud.
- Al ser un paquete compilado, no se puede inspeccionar los pesos directamente; la integridad se verifica mediante SHA-256, pero la trazabilidad del modelo base no se detalla en la model card.
- El modelo puede heredar sesgos de los datos de entrenamiento originales de Qwen3.5, aunque no se han documentado sesgos especificos en la informacion proporcionada.

## Enlaces

- [HuggingFace del paquete EELML](https://huggingface.co/niefeng/eelml-qwen3-5-0-8b-mlx-q4)
- [Modelo base Qwen3.5-0.8B en HuggingFace](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Receta vLLM para Qwen3.5-0.8B](https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B)
- [Página de Ollama para qwen3.5:0.8b](https://ollama.com/library/qwen3.5:0.8b)
- [GitHub de QwenLM/Qwen3 (familia Qwen3)](https://github.com/QwenLM/Qwen3)
- [Artículo de Codersera sobre Qwen3.5 0.8B](https://codersera.com/blog/run-and-benchmark-qwen35-08b/)
- [Qualcomm AI Hub - Qwen3.5-0.8B](https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b)
