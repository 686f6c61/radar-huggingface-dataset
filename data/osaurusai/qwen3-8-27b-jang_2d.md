# OsaurusAI/Qwen3.8-27B-JANG_2D

## Resumen

OsaurusAI/Qwen3.8-27B-JANG_2D es un bundle cuantizado del modelo Qwen/Qwen3.8-27B, un VLM denso de 27B parámetros desarrollado por Qwen con arquitectura híbrida GatedDeltaNet + atención con puertas. El bundle, creado por OsaurusAI (Jinho Jang) para su runtime local de IA para macOS, aplica una cuantización mixta de 2/3/4/8 bits calibrada mediante análisis de sensibilidad Hessiana y refit imatrix, logrando reducir el modelo a 10,9 GiB en disco manteniendo la torre de visión, la ruta de video y el head de multi-token-prediction (MTP) intactos.

El resultado es un paquete que cabe en Apple Silicon con 16 GB de memoria unificada y es ejecutable con la librería estándar `mlx_vlm`. Es relevante porque ofrece un VLM de 27B con contexto nativo de 262 144 tokens (extensible a 1M) en un tamaño que antes era impensable para hardware de consumo, con capacidades verificadas de texto, imagen y video, además de modo de razonamiento, tool calling y soporte para agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 64 capas: 48 GatedDeltaNet + 16 gated full-attention (RoPE parcial dim 64); torre de visión nativa imagen+video; head MTP (31 tensores) |
| Parametros totales | 27B (modelo base); el repo cuantizado reporta 3 199 077 072 parámetros en safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1M |
| Tipos de cuantizacion | Mixta 2/3/4/8 bits: 204 módulos a 2 bits, 187 a 3 bits, 135 a 4 bits, 64 a 8 bits; 27 proyecciones `linear_fc2` de visión en fp16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso híbrido que combina 48 capas GatedDeltaNet (una variante de atención lineal con puertas) con 16 capas de atención completa con puertas y RoPE parcial (dimensión 64). Incluye una torre de visión nativa que procesa tanto imágenes como video, y un head de multi-token-prediction (MTP) entrenado con múltiples pasos que permite decodificación especulativa. El contexto nativo es de 262 144 tokens, extensible a 1M.

El bundle JANG_2D no modifica la arquitectura, sino que aplica una cuantización calibrada: cada uno de los 590 módulos cuantizados recibe su ancho de bits según la traza Hessiana (tr(H)·‖W‖²_F) medida sobre un corpus de calibración, priorizando atención en alta precisión y liberando presupuesto en bloques FFN insensibles. Los módulos por debajo de 8 bits se reajustan con imatrix (mínimos cuadrados ponderados por activaciones), y las proyecciones de visión cuyo tamaño no es divisible por los grupos de cuantización de MLX se mantienen en fp16. No se aplicaron AWQ ni GPTQ por incompatibilidad con la convención de normalización centrada en cero de esta familia. No se dispone de información sobre los datos de entrenamiento del modelo base (composición del dataset, número de tokens, método de alineación).

## Capacidades

- Comprensión y generación de texto en inglés, con modo de razonamiento (thinking) activado por defecto y control de esfuerzo (`reasoning_effort`: `low`, `medium`, `xhigh`).
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y análisis de contenido gráfico.
- Comprensión de video: procesamiento de secuencias de video a través de la torre de visión nativa (verificado en este bundle).
- Tool calling y function calling: parser específico `qwen3_coder` para llamadas a herramientas.
- Soporte para agentes: preset de muestreo agéntico (temperature=1.0, top_p=0.95, top_k=20) y preservación del contexto de razonamiento entre turnos (`preserve_thinking`).
- Decodificación especulativa: head MTP preservado con recomendación de 1 token borrador por paso (opt-in).
- Multilingüe: solo inglés según la model card del bundle (el modelo base podría soportar más idiomas, pero no se especifica).

## Casos de uso

- Análisis de imágenes en local: un desarrollador puede ejecutar el modelo en un Mac con 16 GB de RAM unificada para extraer descripciones, detectar objetos o responder preguntas sobre capturas de pantalla, diagramas o fotografías sin enviar datos a la nube.
- Procesamiento de video en el borde: la torre de video nativa permite resumir clips, extraer eventos o generar subtítulos descriptivos en hardware de consumo, útil para aplicaciones de vigilancia o análisis de contenido multimedia.
- Agente conversacional con razonamiento: con el preset agéntico y `preserve_thinking`, el modelo puede mantener cadenas de razonamiento multi-turno para tareas de planificación, investigación o asistencia técnica, integrándose en aplicaciones de escritorio.
- Generación de código asistida por herramientas: el soporte de tool calling y el parser `qwen3_coder` permiten usarlo como backend de un asistente de programación que invoca funciones (ejecutar tests, buscar documentación) y razona sobre los resultados.
- Asistente de accesibilidad: descripción de imágenes y video en tiempo real para personas con discapacidad visual, ejecutado localmente en un Mac para garantizar privacidad.
- Prototipado de VLM en investigación: al caber en 10,9 GiB, sirve para experimentar con arquitecturas híbridas y cuantización agresiva en entornos académicos sin acceso a GPUs de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones visuales, y no se proporcionan comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM/memoria: 10,9 GiB en disco; requiere Apple Silicon con al menos 16 GB de memoria unificada (el modelo se carga en memoria unificada, no en VRAM dedicada).
- GPUs compatibles: exclusivamente Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra); no es compatible con CUDA.
- Opciones de despliegue: `mlx_vlm` (librería estándar de MLX), con soporte para generación de texto, imagen y video mediante el chat template del bundle.
- Latencia y throughput: no disponibles; dependen del chip concreto (por ejemplo, M2 Max vs M1) y de la longitud de secuencia. El head MTP permite decodificación especulativa opt-in para acelerar la generación.
- Nota: el bundle incluye un sidecar `vmlx_mtp_tuning.json` con recomendaciones de profundidad para decodificación especulativa (1 token borrador por paso como punto de partida).

## Comparativa con modelos similares

La comparación más directa es con los otros bundles de la misma serie calibrada, que comparten el mismo modelo base y método de cuantización pero difieren en el presupuesto de bits:

| Bundle | Tamaño en disco | Cuantización | Uso recomendado |
|---|---|---|---|
| JANG_2D (este) | 10,9 GiB | 2/3/4/8 bits mixta | Máxima compresión, hardware con 16 GB |
| JANG_4D | 17,0 GiB | 2/3/4/8 bits mixta (mayor presupuesto) | Equilibrio calidad/tamaño |
| JANG_6D | 24,1 GiB | 2/3/4/8 bits mixta (mayor presupuesto) | Mayor fidelidad |
| MXFP8 | 26,8 GiB | FP8 (referencia) | Calidad de referencia, sin pérdida significativa |

Frente al modelo base sin cuantizar (Qwen3.8-27B, ~54 GiB en fp16), JANG_2D reduce el tamaño a aproximadamente un quinto, a costa de una posible degradación en tareas sensibles a la precisión. No se dispone de datos de benchmarks para cuantificar esa degradación. No se incluyen comparaciones con otros VLM de 27B (p. ej., Qwen2.5-VL-27B) por falta de datos en la información proporcionada.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; el uso en otros idiomas puede producir resultados degradados o inconsistentes.
- Cuantización agresiva: 204 de 590 módulos están en 2 bits, lo que puede afectar a tareas que requieren alta precisión numérica (matemáticas complejas, razonamiento largo). No hay benchmarks que cuantifiquen esta pérdida.
- Hardware restringido: solo funciona en Apple Silicon; no es portable a GPUs NVIDIA/AMD sin re-cuantizar o convertir los pesos.
- Video: el chat template del bundle debe usarse explícitamente para prompts de video; `mlx_vlm.prompt_utils.apply_chat_template` descarta silenciosamente los ítems de video, por lo que hay que renderizarlos manualmente.
- Decodificación especulativa: el head MTP es opt-in; los runtimes que no lo soporten lo ignoran sin error, pero no se benefician de la aceleración.
- Sin datos de alineación: no se especifica si el modelo base pasó por RLHF/DPO, ni se documentan sesgos conocidos. Se recomienda evaluar en el dominio de uso antes de producción.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene su propia licencia (también Apache-2.0 según los metadatos); conviene verificar los términos del modelo base para redistribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/Qwen3.8-27B-JANG_2D
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Bundles relacionados: JANG_4D (https://huggingface.co/OsaurusAI/Qwen3.8-27B-JANG_4D), JANG_6D (https://huggingface.co/OsaurusAI/Qwen3.8-27B-JANG_6D), MXFP8 (https://huggingface.co/OsaurusAI/Qwen3.8-27B-MXFP8)
- Sitio de Osaurus AI: https://osaurus.ai
