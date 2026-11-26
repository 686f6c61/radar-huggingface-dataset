# rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-MLX-4bit

## Resumen

Swift-1.5-Qwen3.8-27B-VectorCut-MLX-4bit es una cuantizacion en 4 bits (4,695 bpw, unos 15 GB) para Apple Silicon mediante MLX del modelo `rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-BF16`, que a su vez deriva de `ukisai/Swift-1.5-Qwen3.8-27b` y, en ultima instancia, de `Qwen/Qwen3.8-27B`. Lo publica rarevector (Rare Vector Labs) y esta disenado para ejecutarse a plena velocidad en el runtime oMLX sobre chips de Apple.

El modelo es multimodal (image-text-to-text): conserva intacto el codificador de vision (333 tensores en BF16) y las 15 cabezas MTP (multi-token prediction) que otros procesos de cuantizacion suelen degradar o eliminar. El pipeline "VectorCut" del autor aplica una ablacion quirurgica sobre 105 tensores de las capas MLP con compuerta (gated MLP), manteniendo sin cambios el resto de la red.

Con 27.356.728.560 parametros totales (unos 27,36 mil millones), esta pensado para desarrolladores e investigadores que quieran un modelo de gran tamano, sin censura declarada y con vision, ejecutandose localmente en Macs con memoria unificada suficiente. La licencia es propietaria (Swift Open License v1.0) sobre una base Apache 2.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8) con codificador de vision y cabezas MTP (multi-token prediction); no se detalla la configuracion exacta de capas |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (4,695 bpw, group_size=64); vision en BF16. La familia incluye tambien 6-bit, 8-bit y BF16 |
| Idiomas soportados | multilingue; en, zh, ja, ko, pt, ru, ar, fr, de, es |
| Licencia | swift-open-license-1.0 (derivada de Qwen3.8-27B, Apache 2.0) |
| Formato de pesos | safetensors (MLX), libreria mlx |
| Tamano del repo | 16,1 GB |
| Tensores totales | 1199 (105 gated MLP modificados; 333 de vision y 15 de MTP identicos al original) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que pertenece a la familia Qwen3.8 (transformer denso de ~27 B) con un codificador de vision integrado y un cabezal MTP para decodificacion multi-token. El pipeline VectorCut del autor aplica una ablacion quirurgica sobre 105 tensores de las capas MLP con compuerta, mientras que los 333 tensores de vision y los 15 de MTP se mantienen byte a byte identicos al modelo de origen, verificado mediante auditoria SHA-256 contra `ukisai/Swift-1.5-Qwen3.8-27b` (PROTECTED_CHANGED: 0).

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La model card solo indica que el modelo base es una variante "uncensored" de Qwen3.8-27B, lo que sugiere un ajuste fino orientado a reducir rechazos, pero sin detallar el proceso. La cuantizacion MLX 4-bit usa group_size=64 y preserva la vision en BF16 para evitar la perdida de calidad visual tipica de las cuantizaciones agresivas.

## Capacidades

- Generacion de texto conversacional multilingue en al menos diez idiomas (en, zh, ja, ko, pt, ru, ar, fr, de, es).
- Comprension de imagenes y texto combinados (pipeline image-text-to-text): descripcion, respuesta a preguntas visuales y razonamiento sobre imagenes.
- Decodificacion multi-token (MTP) preservada, lo que acelera la generacion en oMLX.
- Modo "uncensored": menor tendencia a rechazar peticiones que otros modelos alineados rechazarian.
- Razonamiento y conversacion multi-turno.
- Capacidad de vision intacta gracias a los 333 tensores en BF16.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente visual local en Mac: analizar capturas de pantalla, documentos escaneados o fotografias y responder preguntas sobre ellas, aprovechando el codificador de vision preservado en BF16 y la ejecucion nativa en oMLX.
- Procesamiento de documentos multilingues: extraer y resumir informacion de imagenes de documentos en espanol, ingles, chino, arabe o japones, gracias a la cobertura de diez idiomas.
- Investigacion sobre modelos sin censura: estudiar el comportamiento de un modelo con rechazos reducidos en tareas de analisis de contenido sensible, util para equipos de seguridad y alineacion que necesitan medir sesgos y negativas.
- Desarrollo y prototipado offline en Apple Silicon: integrar el modelo en aplicaciones macOS o iOS mediante MLX sin depender de la nube, con un peso de ~15 GB que cabe en Macs de 32 GB o mas.
- Generacion de contenido asistida por imagen: redactar descripciones, pies de foto o resumenes de material visual para publicacion o catalogacion.
- Evaluacion comparativa de cuantizaciones: usar las variantes 4-bit, 6-bit y 8-bit de la misma familia para medir el impacto de la precision en calidad y velocidad sobre hardware Apple.
- Traduccion y localizacion con contexto visual: traducir texto incrustado en imagenes o interfaces entre los idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 15 GB de pesos en 4-bit; con overhead de contexto y vision, se recomienda al menos 24-32 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (series M1/M2/M3/M4 y superiores) con runtime oMLX o MLX.
- GPU NVIDIA (A100, H100, RTX 4090): no es el objetivo de este artefacto; el formato MLX no esta pensado para CUDA. Para esas GPUs habria que usar el maestro BF16 u otra cuantizacion.
- Cabe en consumer hardware Apple: si, en Macs con 32 GB o mas de memoria unificada; en 24 GB puede ser ajustado segun la longitud de contexto.
- Opciones de despliegue: oMLX y MLX (libreria declarada). vLLM, llama.cpp, Ollama o TGI no estan indicados para este formato en la informacion disponible.
- Latencia y throughput: no disponibles; la model card afirma velocidad nativa "a plena velocidad" en oMLX gracias a la preservacion de MTP, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-VectorCut-MLX-4bit | ~27,36 B | no disponible | Si (BF16) | swift-open-license-1.0 | MLX safetensors 4-bit |
| Swift-1.5-Qwen3.8-27B-VectorCut-MLX-8bit | ~27,36 B | no disponible | Si (BF16) | swift-open-license-1.0 | MLX safetensors 8-bit |
| Swift-1.5-Qwen3.8-27B-VectorCut-BF16 | ~27,36 B | no disponible | Si | swift-open-license-1.0 | safetensors BF16 (~55 GB) |
| Qwen/Qwen3.8-27B (modelo de origen) | ~27 B | no disponible | no disponible | Apache 2.0 | safetensors |

La comparativa se limita a la propia familia del autor porque la informacion proporcionada no incluye datos de rendimiento ni de otros modelos de la misma categoria. No se dispone de cifras de benchmarks para contrastar calidad entre variantes.

## Limitaciones y advertencias

- Modelo declarado "uncensored": puede generar contenido que otros modelos alineados rechazarian; requiere filtros y politicas de uso en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay datos de evaluacion en la informacion disponible.
- La ablacion quirurgica sobre 105 tensores de gated MLP puede alterar el comportamiento respecto al modelo de origen; no se documentan evaluaciones de calidad tras el corte.
- Longitud de contexto no documentada: limita la planificacion de casos con ventanas largas.
- Licencia propietaria (Swift Open License v1.0): es necesario revisar los terminos antes de cualquier uso comercial; no es una licencia de codigo abierto estandar.
- Formato exclusivo MLX: no es portable directamente a CUDA ni a otros runtimes sin conversion.
- Cobertura de idiomas declarada pero sin evaluacion publica por idioma; el rendimiento en espanol o arabe puede variar.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario practicamente inexistentes.
- La fecha de creacion indicada (2026-11-26) debe tomarse con cautela respecto a la madurez y validacion externa del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-MLX-4bit
- Modelo base BF16: https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-BF16
- Variante MLX 8-bit: https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-MLX-8bit
- Variante MLX 6-bit: https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-MLX-6bit
- Modelo de origen del ajuste: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo Qwen de referencia: https://huggingface.co/Qwen/Qwen3.8-27B
- Pagina del autor: https://huggingface.co/RareVector
- Apoyo al autor: https://ko-fi.com/rarevector
