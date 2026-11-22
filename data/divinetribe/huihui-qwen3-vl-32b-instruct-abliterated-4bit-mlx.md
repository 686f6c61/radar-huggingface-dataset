# divinetribe/Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx

## Resumen

Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx es una cuantizacion en 4 bits, formato MLX, del modelo vision-lenguaje Qwen3-VL-32B-Instruct en su variante "abliterated" publicada por huihui-ai. El modelo original lo desarrolla el equipo Qwen de Alibaba; la ablacion de la direccion de rechazo la realiza huihui-ai, y la conversion a MLX 4 bits la firma divinetribe (Matt Macosko) para su stack claude-code-local. El resultado es un modelo multimodal de 33.357.390.064 parametros (dense, no MoE) que acepta texto e imagen y devuelve texto, pensado para inferencia local en Apple Silicon.

El interes inmediato es triple: es la primera cuantizacion MLX de un Qwen3-VL abliterated, reduce el peso en disco a unos 17-19,6 GB (frente a los ~64 GB en BF16 de un 32B), y conserva la ventana de contexto de 262.144 tokens (256 K nativos) que Qwen3-VL hereda de la serie Qwen3. Eso permite hacer Q&A visual, razonamiento multi-imagen y OCR sobre documentos sensibles sin salida a la nube, con una Mac de 32 GB como minimo y 64 GB o mas para ir comodo.

La abliteracion (proyeccion de la direccion de rechazo, Arditi et al., 2024) no mejora capacidades: elimina el sesgo de rechazo en consultas benignas pero delicadas, lo que resulta util en investigacion de seguridad, pruebas de moderacion de contenido y OCR de documentos no convencionales. La licencia Apache 2.0 se hereda del Qwen3-VL-32B-Instruct original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer dense multimodal, image-text-to-text) |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no aplica (modelo dense, no MoE) |
| Longitud de contexto | 262.144 tokens (256 K nativos) |
| Tipos de cuantizacion | 4 bits afina, group size 64 (unica variante publicada en este repo) |
| Idiomas soportados | en (segun model card; el Qwen3-VL base es multilingue, pero esta ficha solo declara ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors MLX (mlx-4bit) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-32B-Instruct, un transformer dense multimodal de la familia Qwen3-VL. Acepta entradas de texto e imagen (single-image, multi-image y video por ingesta de fotogramas) y produce texto. Una innovacion destacable de Qwen3-VL es la sustitucion de T-RoPE por marcas de tiempo textuales explicitas para el entendimiento de video, lo que simplifica el alineamiento temporal frente a esquemas posicionales anteriores. La ventana de contexto es de 262.144 tokens, comun con la serie Qwen3 de texto.

Sobre el entrenamiento del modelo base no se dispone en la informacion proporcionada del numero de tokens, composicion del dataset ni si hubo RLHF/DPO; esos datos corresponden a la model card upstream de Qwen3-VL, que no se ha incluido aqui. Lo que si esta documentado es el post-procesado: huihui-ai aplica abliteracion mediante proyeccion de la direccion de rechazo (Arditi et al., 2024, arXiv:2406.11717) sobre el BF16 abliterated, y divinetribe realiza la conversion a MLX 4 bits con mlx-vlm 0.4.4. La cuantizacion es afina de 4 bits con group size 64, lo que explica el peso en disco de aproximadamente 17 GB (19,6 GB de repo).

## Capacidades

- Generacion de texto y razonamiento general en ingles.
- Vision-lenguaje: Q&A sobre una imagen, comparacion y razonamiento sobre multiples imagenes.
- Entendimiento de video mediante ingesta de fotogramas con marcas de tiempo textuales.
- OCR y extraccion de texto de documentos e imagenes.
- Conversacion multi-turno con contexto largo (262 K tokens).
- Capacidad multimodal nativa (texto + imagen de entrada, texto de salida).
- Modo "uncensored": la abliteracion reduce rechazos en consultas benignas pero delicadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara solo `en`; no disponible para otros idiomas.

## Casos de uso

- Q&A visual en local sin nube: cargar una imagen y hacer preguntas especificas sobre ella con mlx-vlm, sin claves de API ni telemetria; adecuado por la ventana de 262 K tokens y el peso de ~17 GB que cabe en una Mac de 32 GB.
- Razonamiento multi-imagen: comparar dos diagramas, resumir un volcado de capturas de pantalla de varias paginas o revisar una secuencia de imagenes en una sola conversacion, aprovechando el contexto largo.
- Entendimiento de video por fotogramas: ingerir fotogramas con marcas de tiempo textuales para describir o resumir el contenido temporal de un video.
- OCR de documentos sensibles: extraer texto de NDAs, historiales medicos o declaraciones selladas sin que el contenido salga del dispositivo, lo que encaja con flujos de cumplimiento normativo.
- Investigacion de seguridad y pruebas de moderacion: usar la variante abliterated para sondear respuestas del modelo en escenarios benignos pero delicados sin el ruido de rechazos del upstream.
- Servidor local compatible con OpenAI: levantar `mlx_vlm.server` en `http://localhost:8080/v1/chat/completions` con el formato estandar de mensajes de vision de OpenAI, para integrar el modelo en herramientas existentes sin cambiar el cliente.
- Revision de documentos en flujos air-gapped: desplegar el modelo en entornos sin red (por ejemplo, AirGap AI) para revisar contratos o expedientes donde la nube esta prohibida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM equivalente (memoria unificada en Apple Silicon): aproximadamente 17 GB en disco y 19,6 GB de repo; el autor indica que "quiere una Mac de 32 GB" y que va "agil" en 64 GB o mas.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB como minimo (M-series); 64 GB o mas para margen comodo. No aplica a A100, H100 o RTX 4090 en este formato, ya que MLX esta pensado para Apple Silicon.
- Cabe en consumer GPU: no en el sentido clasico de GPU NVIDIA; si en Macs consumer de 32 GB o mas. En una Mac de 16 GB no cabe.
- Opciones de despliegue: `mlx-vlm` (libreria Python), CLI `python -m mlx_vlm.generate`, servidor local compatible con OpenAI via `python -m mlx_vlm.server`. No se documenta vLLM, llama.cpp, Ollama ni TGI para este repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Modalidad | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx (este) | texto + imagen | 33.357.390.064 | 262.144 | 4 bits MLX | apache-2.0 | Hugging Face, MLX |
| huihui-ai/Huihui-Qwen3-VL-32B-Instruct-abliterated (base) | texto + imagen | 32B (BF16) | 262.144 | BF16 | apache-2.0 | Hugging Face, BF16 |
| Cuantizaciones MLX no abliterated de Qwen3-VL (lmstudio-community, mlx-community) | texto + imagen | 32B | 262.144 | 3 a 8 bits | apache-2.0 | Hugging Face, MLX |
| gemma-4-31b-it-abliterated-4bit-mlx (mismo autor) | texto | 31B | no disponible | 4 bits MLX | no disponible | Hugging Face, MLX |

La diferencia clave frente a las builds MLX no abliterated es la ablacion; frente al base BF16, el peso (17 GB frente a ~64 GB) y la portabilidad a Apple Silicon. El gemma-4 del mismo autor es comparable en peso y publico pero solo texto.

## Limitaciones y advertencias

- La abliteracion elimina la direccion de rechazo, no aumenta capacidades; puede degradar la utilidad de las salvaguardas del modelo en produccion.
- Riesgo de alucinacion: no se documenta mitigacion especifica; aplica el riesgo habitual de un modelo vision-lenguaje de 32B.
- Idioma: la model card declara solo `en`; no hay garantia de calidad en castellano ni en otros idiomas.
- Licencia Apache 2.0 heredada del Qwen3-VL-32B-Instruct: permite uso comercial, pero el usuario sigue sujeto a los terminos del upstream.
- Requiere Apple Silicon con al menos 32 GB de memoria unificada; no es desplegable en GPU NVIDIA con este formato.
- Solo se publica una cuantizacion 4 bits; no hay variantes 3, 5, 6 u 8 bits en este repo.
- Las cifras de estrellas y descargas de la model card proceden de contadores incrustados del autor y no deben tomarse como metricas auditadas.
- El uso "uncensored" traslada al usuario la responsabilidad de moderacion y cumplimiento normativo.

## Enlaces

- Hugging Face: https://huggingface.co/divinetribe/Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-32B-Instruct-abliterated
- Equipo Qwen (Alibaba): https://huggingface.co/Qwen
- huihui-ai: https://huggingface.co/huihui-ai
- divinetribe: https://huggingface.co/divinetribe
- Paper de ablacion (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Repo claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- AirGap AI: https://nicedreamzwholesale.com/airgap/
- Modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
