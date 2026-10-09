# IsValorum/Qwen3.8-35B-A3B-Distill-MLX-APEX-NanoPlus-Abliterated

# Qwen3.8-35B-A3B-Distill MLX APEX-NanoPlus Abliterated

## Resumen
Qwen3.8-35B-A3B-Distill MLX APEX-NanoPlus Abliterated es una cuantizacion mixta nativa de MLX publicada por el usuario IsValorum sobre el checkpoint empero-ai/Qwen3.8-35B-A3B-Distill, un modelo de lenguaje de tipo mezcla de expertos (MoE) con 34.660.608.768 parametros totales. La release esta pensada para ejecucion local en Apple Silicon usando memoria unificada, y empaqueta los pesos en 18,8156 GB (17,52 GiB) de safetensors, lo que la situa en la clase practica Q4 pese a apoyarse en una base de cuantizacion de 3 bits con grupo G32.

El modelo resuelve el problema de desplegar un MoE de ~35B en equipos de escritorio y portatiles con memoria unificada limitada, sin recurrir a GGUF ni a llama.cpp: emplea cuantizacion afin de MLX con anchura de bits y tamano de grupo especificos por modulo, y protege en FP32 las rutas sensibles (normalizaciones, routers del MoE y tensores de estado/control recurrentes). Ademas, es una edicion "abliterated" (ablacion direccional), orientada a usuarios que prefieren de forma deliberada un comportamiento de rechazo reducido.

Su relevancia actual es doble: por un lado, demuestra una receta de cuantizacion selectiva que mantiene una degradacion de perplejidad declarada de +0,826288 (+9,365 %) frente al checkpoint de referencia; por otro, forma parte de una familia de releases del mismo autor (NanoPlus y MiniPlus en MLX, mas variantes GGUF APEX-I) que permite elegir el compromiso entre huella de memoria y fidelidad. No se especifican en la informacion disponible ni la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `qwen3_5_moe`), con atencion lineal y atencion completa combinadas |
| Parametros totales | 34.660.608.768 (34,66B), dato real de safetensors |
| Parametros activos | Aproximadamente 3B, segun la nomenclatura A3B del checkpoint base; no confirmado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine, mixta por modulo: base 3-bit G32; LM head 6-bit G64; expertos compartidos 5-bit G64; `in_proj_z` de atencion lineal 8-bit G64; Q/K/V de atencion completa 4-bit G64; `o_proj` 6-bit G64; normas, routers MoE y tensores de estado/control en FP32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX), 18,8156 GB / 17,52 GiB; repositorio completo de 38,8 GB |
| Modelo base | empero-ai/Qwen3.8-35B-A3B-Distill |
| Libreria de inferencia | mlx |
| Pipeline | text-generation |
| Descargas / likes | 1.263 descargas / 1 like |
| Fechas | creado el 2026-10-01, actualizado el 2026-10-08 |

## Arquitectura y entrenamiento
La arquitectura subyacente es un transformer de mezcla de expertos identificado con el tag `qwen3_5_moe`, con 34,66B de parametros totales y aproximadamente 3B activos por token segun la nomenclatura A3B del checkpoint base. El mapa de tensores de esta cuantizacion revela una estructura hibrida: existe atencion lineal (con proyeccion `in_proj_z`) junto a atencion completa (proyecciones Q, K, V y `o_proj`), ademas de expertos compartidos siempre activos y routers de enrutamiento del MoE. Los detalles de entrenamiento del checkpoint base (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se documentan en la informacion disponible; si se indica que es un modelo "Distill", derivado de un modelo mayor del linaje Qwen3.8.

La innovacion tecnica de esta release no esta en el entrenamiento, sino en el proceso de cuantizacion. Se aplica cuantizacion afin de MLX con anchura de bits y tamano de grupo definidos por modulo en lugar de un esquema plano: la base es 3-bit con grupo 32, pero la cabeza LM sube a 6-bit G64, los expertos compartidos a 5-bit G64, la proyeccion `in_proj_z` de la atencion lineal a 8-bit G64 y las proyecciones Q/K/V de atencion completa a 4-bit G64, mientras que `o_proj` se mantiene en 6-bit G64. Las normas, los routers del MoE y los tensores de estado y control recurrente quedan protegidos en FP32, que es donde mas dano suele causar la cuantizacion agresiva en modelos MoE con atencion hibrida. Sobre el checkpoint resultante se aplica abliteracion direccional para reducir el comportamiento de rechazo.

## Capacidades
- Generacion de texto y uso conversacional, con pipeline declarado `text-generation` y plantilla de chat nativa incluida en el repositorio.
- Modo de razonamiento explicito mediante bloque `<think>`, mencionado en los avisos de la model card sobre generaciones largas.
- Razonamiento y codigo: la model card incluye un aviso especifico sobre sintaxis de codigo y penalizacion de repeticion, lo que indica uso previsto en generacion de codigo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Comportamiento abliterated / uncensored: la release esta disenada explicitamente para reducir las respuestas de rechazo respecto al checkpoint de referencia.
- Ejecucion local en Apple Silicon mediante MLX sobre memoria unificada.

## Casos de uso
- Asistente conversacional local en Mac: el modelo puede mantener dialogos multi-turno en el propio equipo sin enviar datos a la nube, gracias a su huella de 17,52 GiB de pesos y a la plantilla de chat nativa incluida en el repositorio.
- Generacion y revision de codigo en local: la release incorpora instrucciones especificas de sintaxis y penalizacion de repeticion, lo que la hace util para autocompletado, refactorizacion o explicacion de fragmentos dentro de un editor sobre Apple Silicon.
- Procesamiento por lotes de documentos sensibles: sectores con restricciones de confidencialidad (legal, salud, administracion) pueden resumir, clasificar y extraer informacion de textos sin que estos salgan del dispositivo.
- Investigacion sobre comportamiento de rechazo: al ser una variante abliterated, sirve como sujeto de comparacion frente al checkpoint base en estudios de alineacion, robustez y tasas de negativa.
- Evaluacion de tecnicas de cuantizacion mixta: la publicacion de dos variantes (NanoPlus y MiniPlus) con distinto presupuesto de precision permite medir empiricamente el impacto de proteger unas rutas u otras, usando la perplejidad declarada como referencia.
- Redaccion y edicion asistida de contenido creativo: la reduccion deliberada de rechazos resulta adecuada para borradores de ficcion o textos con tematicas que los modelos alineados por defecto suelen declinar.
- Experimentacion en pipelines de texto offline: entornos aislados de red (laboratorios, plantas industriales) pueden desplegar un modelo de ~35B en un Mac Studio y usarlo para clasificacion, extraccion y transformacion de texto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares). El unico dato cuantitativo de fidelidad aportado por el autor es la degradacion de perplejidad respecto al checkpoint sin cuantizar:

| Metrica | Valor |
|---|---|
| Delta de perplejidad (delta PPL) | +0,826288 |
| Degradacion relativa de perplejidad (%PPL) | +9,365 % |
| Clase de calidad practica declarada | Q4-class |
| Tamano de pesos | 18,8156 GB (17,52 GiB) |

El propio autor advierte que la perplejidad es una estimacion de fidelidad y no una medida completa del rendimiento real en razonamiento, codigo, uso de herramientas o contexto largo.

## Requisitos de hardware
- La release es exclusivamente MLX: requiere Apple Silicon (serie M) y no se puede cargar directamente con stacks CUDA como vLLM o TGI sin convertir los pesos.
- Los pesos ocupan 18,8156 GB (17,52 GiB). Sumando estado de runtime, activaciones, macOS y el contexto activo, LLM Explorer cifra el requisito en torno a 18,9 GB. Se trata de una estimacion derivada del tamano de pesos, no de una medicion publicada de consumo en inferencia.
- Con 17,52 GiB solo de pesos, un equipo con 24 GB de memoria unificada queda muy justo para contexto apreciable; un Mac con 32 GB o mas deja margen para cache KV y contexto, aunque no se han publicado mediciones de latencia o throughput.
- El repo incluye la plantilla de chat nativa y parametros de generacion recomendados, pensados para su uso con el runtime MLX (`mlx-lm`).
- Para desplegar en CUDA, llama.cpp u Ollama no se debe usar este repositorio: el propio autor publica variantes GGUF APEX-I del mismo linaje (por ejemplo, Qwen3.8-35B-A3B-Distill-APEX-I-MiniPlus-V2.1-GGUF) con tipos de cuantizacion `Q*_K` e `IQ*` y sus propios kernels.
- No se dispone de datos de latencia, tokens por segundo ni throughput para esta release.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Calidad practica declarada | Tamano de pesos | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill MLX APEX-NanoPlus Abliterated (este) | 34,66B totales, ~3B activos | MLX mixed precision, base 3-bit G32 | Q4-class | 18,8156 GB (17,52 GiB) | apache-2.0 |
| Qwen3.8-35B-A3B-Distill MLX APEX-MiniPlus Abliterated | 34,66B (mismo base) | MLX mixed precision, mayor presupuesto en expertos compartidos y atencion lineal | Q5-class | 19,9485 GB (18,58 GiB) | apache-2.0 |
| Qwen3.8-35B-A3B-Distill-APEX-I-MiniPlus-V2.1 GGUF | 34,66B (mismo base) | GGUF, tipos `Q*_K` / `IQ*` | no disponible | no disponible en la informacion proporcionada | apache-2.0 |
| empero-ai/Qwen3.8-35B-A3B-Distill (base) | 34,66B (mismo base) | safetensors sin cuantizar | referencia de fidelidad | no disponible | apache-2.0 |

La diferencia entre NanoPlus y MiniPlus es de 1,13 GB de presupuesto de pesos, que MiniPlus emplea en subir la precision de los componentes siempre activos. No se dispone en la informacion proporcionada de modelos comparables de otros autores con los que contrastar parametros o rendimiento.

## Limitaciones y advertencias
- Repeticion en generaciones muy largas: el autor advierte de que el checkpoint upstream Qwen3.8-35B-A3B-Distill puede repetir contenido durante respuestas extensas, incluso despues del bloque `<think>`. El problema es de origen y no de la cuantizacion MLX.
- La model card incluye un aviso critico sobre sintaxis de codigo y penalizacion de repeticion; conviene ajustar los parametros de generacion antes de usar el modelo en produccion.
- La abliteracion reduce los rechazos de forma deliberada: puede producir contenido que los modelos alineados evitartan por defecto y, en algunos casos, degradar ligeramente la coherencia o el seguimiento de instrucciones.
- Degradacion de perplejidad de +0,826288 (+9,365 %) respecto al checkpoint sin cuantizar, segun la medicion del propio autor.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad para esta release; es un riesgo inherente a cualquier modelo de lenguaje, agravado por la cuantizacion.
- Idiomas soportados: no disponibles. No se puede confirmar cobertura multilingue ni calidad por idioma.
- Longitud de contexto: no disponible. No se puede garantizar un rendimiento estable en contextos largos.
- La cuantizacion es irreversible: no se puede recuperar la precision original a partir de estos pesos.
- Licencia apache-2.0: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado por una variante sin filtros de rechazo.
- Dependencia de hardware: solo Apple Silicon. En CUDA, llama.cpp u Ollama hay que acudir a las releases GGUF del mismo autor.
- Cifras de adopcion moderadas (1.263 descargas y 1 like), con una unica revision publicada en la semana posterior al lanzamiento.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-MLX-APEX-NanoPlus-Abliterated
- Variante hermana MLX APEX-MiniPlus Abliterated: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-MLX-APEX-MiniPlus-Abliterated
- Variante GGUF APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-APEX-I-MiniPlus-V2.1-GGUF
- Variante GGUF MTP APEX-I-MiniPlus-V2.1 Abliterated: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Discusion de la variante MTP GGUF: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF/discussions/5
- Ficha en LLM Explorer (VRAM estimada 18,9 GB): https://llm-explorer.com/model/IsValorum%2FQwen3.8-35B-A3B-Distill-MLX-APEX-NanoPlus-Abliterated,4CNcYDrkBoFjwiOtWM4Bv8
- Ficha de la variante MTP en abliteratedmodels.org: https://www.abliteratedmodels.org/qwen3.8-35b-a3b-distill-mtp-apex-i-miniplus-v2.1-abliterated/
- Linaje de la variante GGUF en parapulse: https://parapulse.io/family/IsValorum/Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
