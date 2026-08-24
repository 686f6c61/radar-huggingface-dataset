# dealignai/Ornith-1.5-35B-A3B-MXFP8-UNCENSORED-CRACK

## Resumen

Ornith-1.5-35B-A3B es un modelo vision-lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por el equipo ornith-ai, con 35,9 mil millones de parametros totales y aproximadamente 3 mil millones de parametros activos por token. Esta ficha cubre la variante **UNCENSORED CRACK** publicada por dealignai, que aplica tecnicas de abliteracion (eliminacion de la conducta de rechazo a nivel de pesos) y cuantizacion MXFP8 de 8 bits en formato MLX para Apple Silicon. El modelo mantiene las capacidades multimodales del original: vision, video, razonamiento activado por defecto y soporte de tool calling, con una ventana de contexto de 262.144 tokens.

La relevancia de esta variante reside en dos aspectos: por un lado, la eliminacion de los mecanismos de rechazo a nivel de pesos (sin hooks en tiempo de ejecucion ni vectores de direccionamiento), lo que la convierte en un objeto de estudio para investigacion en seguridad de IA; por otro, su empaquetado en un bundle MLX de 8 bits MXFP8 optimizado para Apple Silicon, que permite ejecutar un modelo de 35,9 B en equipos Mac con memoria unificada de 48 GB o superior. El autor reporta una perdida minima de capacidad frente al modelo base (MMLU 78,9 % frente a 80,6 %) con una divergencia KL de 0,0289 nats respecto a la referencia MXFP8 sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (gated-delta + full-attention), 40 capas, 256 expertos enrutados, torre de vision de 27 capas |
| Parametros totales | 35,9 B (el checkpoint safetensors MXFP8 contiene 10,4 B de parametros cuantizados) |
| Parametros activos | 3 B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP8 de 8 bits (bundle MLX), GGUF disponible, NVFP4 para DGX Spark |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bundle MLX/MXFP8), GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura MoE hibrida que combina una capa gated-delta con un backbone de atencion completa, con 40 capas y 256 expertos enrutados, de los cuales se activan aproximadamente 3 B de parametros por token. Incluye una torre de vision de 27 capas y un preprocesador de video nativo, lo que lo convierte en un modelo multimodal de texto-imagen-video. El tag `qwen3_5_moe` sugiere una arquitectura inspirada o compatible con la familia Qwen3 MoE.

La variante CRACK de dealignai elimina la conducta de rechazo a nivel de pesos mediante tecnicas de abliteration, de modo que el modelo sigue instrucciones en todas las categorias de tarea sin rechazos, manteniendo intactas sus capacidades de codificacion, conocimiento, razonamiento y vision. El proceso de cuantizacion a MXFP8 de 8 bits se ha realizado como un bundle MLX con precision mixta por modulo (JANG bundles), y no requiere hooks en runtime ni vectores de direccionamiento. El autor reporta que la divergencia KL frente al modelo MXFP8 sin modificar es de 0,0289 nats en texto neutral, lo que indica una alteracion minima del comportamiento original fuera de la eliminacion de rechazos.

## Capacidades

- Generacion de texto y razonamiento: el modo de pensamiento (reasoning) esta activado por defecto y puede desactivarse con el parametro `enable_thinking`.
- Vision: procesa imagenes a traves del procesador integrado del bundle.
- Video: soporte nativo con preprocesador de video incluido.
- Agentic coding: capaz de generar y editar codigo en multiples pasos, con soporte de tool calling nativo mediante esquema XML o de funciones.
- Tool calling / function calling: integrado de forma nativa, compatible con el formato OpenAI.
- Razonamiento multi-paso: gracias al modo de pensamiento y a la ventana de contexto de 262 K tokens, puede mantener cadenas de razonamiento largas y estados de agente complejos.
- Multilingue: solo ingles declarado en la model card, aunque al ser un modelo de conocimiento general puede producir texto en otros idiomas con calidad variable.
- Sin rechazos: el modelo no presenta conducta de rechazo en ninguna categoria de tarea, lo que lo hace util para pruebas de seguridad y evaluaciones de alineacion.

## Casos de uso

- Evaluacion de seguridad en IA: el modelo permite estudiar el comportamiento de un sistema sin capas de rechazo, sirviendo como banco de pruebas para medir la eficacia de tecnicas de mitigacion externas (clasificadores, filtros de salida, etc.).
- Razonamiento multimodal en produccion: con vision, video y 262 K de contexto, se puede desplegar en sistemas que analizan documentos largos con imagenes, diagramas y video, como auditorias tecnicas o revision de contratos.
- Generacion de codigo en entornos de desarrollo: con tool calling nativo y modo de razonamiento, puede integrarse en agentes de codificacion que operan sobre repositorios grandes, ejecutando multiples pasos de planificacion y edicion.
- Investigacion en alineacion y robustez: al estar abliterated, permite estudiar que capacidades se degradan o conservan al eliminar el rechazo, y comparar con el modelo base censurado.
- Analisis de contenido multimodal sin restricciones: en entornos de investigacion autorizada, puede procesar imagenes y videos con instrucciones que otros modelos rechazarian, siempre bajo el marco legal aplicable.
- Prototipado de asistentes de codigo en Apple Silicon: al estar empaquetado en MLX MXFP8, se ejecuta de forma eficiente en Macs con memoria unificada, ideal para desarrollo local de herramientas de agente.
- Despliegue en entornos con recursos limitados: con 3 B de parametros activos y cuantizacion de 8 bits, la latencia de inferencia es baja en comparacion con modelos densos de tamano similar, permitiendo servir en hardware de gama media.

## Benchmarks y rendimiento

Resultados reportados por el autor dealignai sobre este bundle exacto (MMLU en modo logit, HarmBench con umbral de coherencia, KL respecto al MXFP8 sin modificar):

| Metrica | Valor |
|---|---|
| MMLU (57 materias) | 78,9 % (base 80,6 %, delta -1,67) |
| Cumplimiento HarmBench | 100,0 % (240/240) |
| KL vs MXFP8 sin modificar | 0,0289 nats |
| Tamano | ~35 GB |

Desglose de MMLU por categoria:

| Categoria | Base | Sin censura | Δ |
|---|---|---|---|
| STEM | 75,8 % | 73,2 % | -2,6 |
| Humanidades | 81,5 % | 81,2 % | -0,4 |
| Ciencias sociales | 87,5 % | 87,9 % | +0,4 |
| Otras | 80,4 % | 76,9 % | -3,5 |
| Global (57 subj.) | 80,6 % | 78,9 % | -1,7 |

En el leaderboard publico de BenchAlign, el modelo base Ornith-1.5-35B-A3B ocupa el puesto 137 de 224 con una puntuacion de 49,22/100. No se dispone de mas benchmarks independientes para esta variante concreta.

## Requisitos de hardware

- Formato MLX para Apple Silicon: requiere un Mac con al menos 48 GB de memoria unificada para cargar los ~35 GB del bundle en RAM; se recomienda 64 GB para margen con el contexto largo.
- GPUs Apple Silicon compatibles: M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra y M4 Pro/Max/Ultra con 48 GB o mas de RAM unificada.
- Motor de inferencia: vMLX (recomendado, honra las precisiones mixtas por modulo) o cualquier runtime MLX-VLM con soporte `qwen3_5_moe`.
- Alternativa GGUF: existe la variante `dealignai/Ornith-1.5-35B-A3B-CRACK-GGUF` para ejecucion con llama.cpp, Ollama u otros runtimes que soporten GGUF.
- Alternativa NVIDIA: el repositorio `MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark` ofrece un checkpoint NVFP4 para servir el modelo en un DGX Spark (GB10, ~128 GB de memoria unificada) con vLLM, decodificacion especulativa MTP integrada y hasta 256K de contexto.
- Latencia estimada: no disponible. Al ser MoE con 3 B de activos, el throughput es significativamente superior al de un modelo denso de 35 B, pero no se han publicado mediciones concretas.
- Parametros de inferencia recomendados (preset de codigo): temperatura 0,6, top_p 0,95, top_k 20. Tokens de fin: `eos_token_id = [248046, 248044]`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35,9 B | 3 B | 262 K | MoE hibrida | Apache 2.0 |
| Ornith-1.5-35B-A3B CRACK MXFP8 (esta variante) | 35,9 B | 3 B | 262 K | MoE hibrida | Apache 2.0 |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 128 K (extensible) | MoE | Apache 2.0 |
| DeepSeek-V3-Lite | ~16 B | ~2 B | 128 K | MoE | MIT |

La comparativa con Qwen3-30B-A3B es especialmente relevante por la similitud de arquitectura (familia qwen3_5_moe) y tamano activo. La variante CRACK mantiene el rendimiento del base dentro de pocos puntos (MMLU -1,7) mientras elimina los rechazos. No se dispone de datos de benchmarks publicados para la variante GGUF ni para comparaciones directas de latencia entre estos modelos.

## Limitaciones y advertencias

- Modelo sin censura: el comportamiento de rechazo se ha eliminado a nivel de pesos, por lo que seguira instrucciones en todas las categorias de tarea, incluidas las potencialmente peligrosas. El autor declara que se publica con fines de investigacion en seguridad de IA y pruebas de seguridad autorizadas; el usuario es el unico responsable del uso.
- Riesgo de alucinacion: como cualquier LLM de 35 B, puede generar contenido falso o inventado, especialmente en tareas de conocimiento factual. La ausencia de rechazos no mitiga este riesgo.
- Idioma: solo ingles declarado. El rendimiento en otros idiomas puede ser significativamente inferior.
- Cuantizacion MXFP8: aunque se describe como "casi sin perdidas" (KL 0,0289), la cuantizacion de 8 bits puede degradar ligeramente la calidad en tareas de precision (matematicas, razonamiento largo).
- Formato MLX: el bundle esta disenado para Apple Silicon con el motor vMLX; no funciona directamente en GPUs NVIDIA sin convertirlo (la variante DGX Spark usa NVFP4 y vLLM).
- Repo sin descargas ni likes: el repositorio es reciente y sin validacion comunitaria; se recomienda verificar los resultados de forma independiente antes de desplegarlo en produccion.
- Restricciones de uso: aunque la licencia es Apache 2.0, el uso del modelo para generar contenido danino o ilegal puede violar leyes aplicables. El autor excluye los comportamientos de reproduccion de copyright de la metrica HarmBench.
- Consumo de memoria: el contexto de 262 K tokens con KV-cache cuantizado puede requerir mas de 64 GB de RAM unificada en Apple Silicon para cargas de trabajo de contexto largo.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/dealignai/Ornith-1.5-35B-A3B-MXFP8-UNCENSORED-CRACK
- Variante GGUF (sin cuantizacion MXFP8): https://huggingface.co/dealignai/Ornith-1.5-35B-A3B-CRACK-GGUF
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Pagina de BenchLM con benchmarks del modelo base: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Repositorio de despliegue en DGX Spark: https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark
- Modelo en ModelScope: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B
- Motor de inferencia vMLX: https://vmlx.net
- Sitio del autor dealignai: https://dealign.ai
