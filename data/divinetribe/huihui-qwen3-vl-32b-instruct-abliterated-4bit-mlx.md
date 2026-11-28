# divinetribe/Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx

## Resumen

Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx es una cuantizacion en 4 bits (MLX, safetensors) del modelo multimodal Qwen3-VL-32B-Instruct en su variante "abliterated" publicada por huihui-ai. Lo distribuye el usuario divinetribe (Matt Macosko) y su proposito es ejecutar inferencia vision-lenguaje completamente en local sobre Apple Silicon, sin nube ni claves de API. Con 33.357.390.064 parametros reales y un peso de repositorio de 19,6 GB, esta pensado para Macs de 32 GB o mas.

El modelo original Qwen3-VL, desarrollado por el equipo Qwen de Alibaba, es una familia densa multimodal (entrada de texto e imagen, salida de texto) con una ventana de contexto de 262.000 tokens (256.000 nativos). La "abliteration" aplicada por huihui-ai proyecta fuera la direccion de rechazo del modelo (Arditi et al., 2024), de modo que deja de rechazar consultas benignas pero incomodas; no es una mejora general de capacidades.

Su relevancia actual es doble: por un lado, es la primera cuantizacion en formato MLX de un Qwen3-VL abliterated, lo que cubre un hueco frente a las builds MLX no abliterated de mlx-community y lmstudio-community; por otro, permite flujos de vision-lenguaje con requisitos de privacidad estrictos (OCR de documentos sensibles, revision de contratos, moderacion de contenido) en hardware de consumo Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer denso multimodal, image-text-to-text) |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (256.000 nativos segun Qwen3-VL) |
| Tipos de cuantizacion | 4-bit affine, group size 64 (unica variante en este repo) |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | Apache 2.0 (heredada de Qwen3-VL-32B-Instruct) |
| Formato de pesos | MLX safetensors (4-bit) |
| Tamano en disco | ~17 GB en disco, repo de 19,6 GB |
| Modalidades | texto + imagen de entrada, texto de salida |
| Libreria | mlx (mlx-vlm 0.4.4 para la conversion) |
| Modelo base | huihui-ai/Huihui-Qwen3-VL-32B-Instruct-abliterated |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3-VL, un transformer denso de 32B con codificador visual y proyeccion al espacio del lenguaje, capaz de procesar imagenes individuales, multiples imagenes y video. Una innovacion destacable del modelo original es la sustitucion de T-RoPE por marcas de tiempo textuales explicitas para el entendimiento de video, lo que simplifica el razonamiento temporal sobre fotogramas. El contexto nativo es de 256.000 tokens.

Sobre el entrenamiento original de Qwen3-VL no se aportan en la informacion disponible detalles de numero de tokens, composicion del dataset ni fases de RLHF/DPO. La unica transformacion documentada es la abliteration de huihui-ai, que aplica proyeccion de la direccion de rechazo (Arditi et al., 2024); no se especifican los pasos de calibracion de dicha intervencion. La cuantizacion la realiza divinetribe con mlx-vlm 0.4.4 en formato 4-bit affine con group size 64.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de entradas de texto e imagen.
- Respuesta visual a una sola imagen (visual Q&A) con descripciones detalladas.
- Razonamiento multi-imagen: comparacion de diagramas, resumen de capturas de pantalla multiples.
- Comprension de video mediante ingestion fotograma a fotograma con marcas de tiempo textuales.
- OCR y extraccion de texto de documentos, incluidas capturas y documentos no convencionales.
- Conversacion multi-turno con contexto largo (hasta 262.000 tokens).
- Servidor local compatible con la API de OpenAI (`/v1/chat/completions`) mediante `mlx_vlm.server`, con formato de mensajes de vision estandar.
- Ejecucion totalmente local en Apple Silicon, sin telemetria ni claves de API.
- Comportamiento "uncensored": la abliteration reduce los rechazos en consultas benignas pero delicadas; no anade capacidades nuevas.

## Casos de uso

- Revision de documentos confidenciales: NDAs, historiales medicos o declaraciones selladas pueden procesarse con OCR y Q&A sobre imagen sin que el contenido salga del dispositivo, lo que evita el registro en APIs de vision en la nube.
- Moderacion de contenido y pruebas de seguridad: al no rechazar consultas benignas pero incomodas, resulta util para evaluar clasificadores, probar prompts adversarios y analizar imagenes sensibles en laboratorio.
- Asistente de vision en escritorio para desarrolladores: con el servidor OpenAI-compatible en `localhost:8080`, se integra en herramientas tipo Claude Code o scripts propios para describir capturas, diagramas de arquitectura o errores en pantalla.
- Analisis de video por fotogramas: extraccion de fotogramas con marcas de tiempo y resumen de secuencias, util para revision de grabaciones de vigilancia o material de formacion.
- Procesamiento de documentacion tecnica multi-pagina: comparacion de diagramas y tablas entre varias imagenes para detectar discrepancias en manuales o especificaciones.
- Prototipado offline en Mac: desarrollo y validacion de pipelines multimodales en un MacBook de 32 GB antes de desplegar en infraestructura mayor, sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~17 GB en disco y en torno a 19-20 GB de memoria al cargar; el autor indica que requiere un Mac de 32 GB como minimo y que va "snappy" en 64 GB o mas.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB o superior (M-series Pro/Max/Ultra). En Macs de 16 GB no cabe.
- Cabe en GPU de consumo: si, en Apple Silicon de 32 GB+; no esta pensado para GPUs NVIDIA (formato MLX).
- Opciones de despliegue: `mlx-vlm` (Python), CLI `python -m mlx_vlm.generate` y servidor local `python -m mlx_vlm.server` compatible con OpenAI. No se ofrece GGUF ni vLLM/TGI en este repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Formato | Licencia |
|---|---|---|---|---|---|
| Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx (este) | 33,36B | 262K | texto + imagen | MLX 4-bit | Apache 2.0 |
| huihui-ai/Huihui-Qwen3-VL-32B-Instruct-abliterated (base) | 32B (BF16) | 262K | texto + imagen | safetensors BF16 | Apache 2.0 |
| Qwen3-VL-32B-Instruct (upstream) | 32B | 262K | texto + imagen | safetensors | Apache 2.0 |
| Builds MLX de mlx-community / lmstudio-community (Qwen3-VL no abliterated) | 32B | 262K | texto + imagen | MLX 3-8 bit | Apache 2.0 |

La diferencia clave frente a las builds MLX no abliterated es la eliminacion de la direccion de rechazo; frente al base BF16 de huihui-ai, la reduccion de huella (~17 GB frente a un BF16 mucho mayor) y la orientacion a Apple Silicon.

## Limitaciones y advertencias

- La abliteration no mejora capacidades: puede degradar la coherencia en dominios sensibles y elimina barreras de seguridad, lo que exige supervision humana en produccion.
- Riesgo de alucinacion inherente a los modelos de 32B, especialmente en OCR de documentos de baja calidad o en razonamiento sobre multiples imagenes.
- Idiomas: los metadatos declaran solo `en`; el soporte multilingue real no esta verificado en esta ficha.
- Formato MLX: no es portable a CUDA/ROCm sin reconversion; no hay GGUF en este repo.
- Requiere 32 GB de memoria unificada como minimo; en 16 GB no es viable.
- Licencia Apache 2.0 permite uso comercial, pero el usuario sigue sujeto a las condiciones del modelo upstream Qwen3-VL; conviene revisar las politicas de uso aceptable de Alibaba Qwen.
- El contenido de la model card incluye enlaces promocionales y estadisticas del autor que no constituyen validacion tecnica independiente.

## Enlaces

- Hugging Face: https://huggingface.co/divinetribe/Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-32B-Instruct-abliterated
- Organizacion Qwen: https://huggingface.co/Qwen
- Organizacion huihui-ai: https://huggingface.co/huihui-ai
- Paper de abliteration (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Repo claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- Modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
- AirGap AI: https://nicedreamzwholesale.com/airgap/
