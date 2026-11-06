# PanditadaBonita/Qwen-3-VL-2B-Instruct-heretic

## Resumen

Qwen-3-VL-2B-Instruct-heretic es una variante "decensored" (abliterated) del modelo multimodal Qwen3-VL-2B-Instruct desarrollado originalmente por el equipo Qwen de Alibaba. La modificacion la firma el usuario PanditadaBonita mediante la herramienta Heretic v1.4.0, que aplica tecnicas de abliteration sobre las proyecciones de atencion y MLP para eliminar la tendencia del modelo a rechazar peticiones. El resultado conserva la arquitectura y los pesos del modelo base, pero reduce drasticamente las negativas: de 97/100 en el original a 4/100 en esta version.

El modelo base es un vision-language transformer denso de aproximadamente 2.130 millones de parametros, disenado para tareas image-text-to-text con un contexto nativo de 256K tokens ampliable a 1M. Incorpora innovaciones como Interleaved-MRoPE, DeepStack para fusion de caracteristicas ViT multinivel y alineacion texto-timestamp para comprension de video. Soporta OCR en 32 idiomas, grounding 2D/3D y operacion de interfaces graficas como agente visual.

La relevancia de esta ficha radica en dos factores: por un lado, permite evaluar un modelo VL de 2B parametros que cabe en GPUs de consumo; por otro, documenta el efecto de la abliteration sobre un modelo multimodal, un terreno menos explorado que la ablacion sobre LLM puros. La licencia Apache 2.0 del modelo base se mantiene, aunque el autor no aporta garantias adicionales sobre el comportamiento del modelo modificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-language (Qwen3-VL), con Interleaved-MRoPE, DeepStack y alineacion texto-timestamp |
| Parametros totales | 2.127.532.032 (aprox. 2.13B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens nativos, ampliable a 1M |
| Tipos de cuantizacion | No especificados en la informacion disponible; pesos publicados en safetensors (presumiblemente bf16/fp16) |
| Idiomas soportados | No disponibles de forma explicita; el modelo base soporta OCR en 32 idiomas y capacidades multilingues generales |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-VL del modelo base: un transformer denso que combina un codificador visual ViT con un decoder de lenguaje, unidos mediante un proyector. Destacan tres innovaciones del modelo original. Interleaved-MRoPE distribuye frecuencias posicionales a lo largo de tiempo, anchura y altura, lo que mejora el razonamiento sobre video de horizonte largo. DeepStack fusiona caracteristicas ViT de multiples niveles para afinar el alineamiento imagen-texto. La alineacion texto-timestamp sustituye a T-RoPE para localizar eventos con precision temporal en video.

Sobre el entrenamiento original no se detallan en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO; la model card del modelo base menciona mejoras generales en comprension de texto, percepcion visual, contexto largo y capacidades de agente, pero sin cifras. La modificacion heretic aplica abliteration con direccion de rechazo en el indice 15.19, con pesos de intervencion sobre `attn.o_proj` (max_weight 1.41, min_weight 1.10) y `mlp.down_proj` (max_weight 1.48, min_weight 0.53). El proceso es reproducible segun el autor, que incluye un directorio `reproduce/` con instrucciones.

## Capacidades

- Generacion de texto y comprension lectora con calidad cercana a LLM puros segun el autor del modelo base.
- Razonamiento multimodal: analisis causal y respuestas basadas en evidencia en STEM y matematicas.
- Percepcion visual avanzada: reconocimiento de celebridades, anime, productos, monumentos, flora y fauna.
- OCR en 32 idiomas, robusto ante baja iluminacion, desenfoque e inclinacion, con soporte de caracteres raros y jerga.
- Comprension de video de horas de duracion con indexacion a nivel de segundo.
- Grounding 2D y 3D: posiciones de objetos, puntos de vista y oclusiones, orientado a IA encarnada.
- Agente visual: reconocimiento de elementos de GUI de PC y movil, comprension de funciones e invocacion de herramientas.
- Generacion de codigo visual: Draw.io, HTML, CSS y JS a partir de imagenes o video.
- Conversacion multi-turno con plantilla de chat compatible con `transformers`.
- Capacidad de rechazo drasticamente reducida (4/100 frentes a 97/100 del original), lo que habilita respuestas sin filtros en dominios sensibles.

## Casos de uso

- Extraccion estructurada de documentos: el modelo puede procesar facturas, formularios y contratos escaneados con OCR multilingue y contexto de 256K tokens, devolviendo JSON con los campos solicitados. Adecuado por su robustez ante escaneos degradados y su ventana amplia para documentos largos.
- Analisis de video de vigilancia o industrial: con indexacion a nivel de segundo y comprension temporal, se puede consultar "que ocurrio entre el minuto 12 y el 15" sobre grabaciones de horas, sin trocear el video manualmente.
- Automatizacion de GUI y testing visual: como agente visual, identifica botones, campos y menus en capturas de pantalla y genera secuencias de acciones o scripts de automatizacion. Util para RPA y pruebas end-to-end.
- Generacion de interfaces a partir de mockups: convierte imagenes de disenos en HTML/CSS/JS o diagramas Draw.io, lo que acelera el prototipado frontend.
- Moderacion de contenido sin filtros previos: al estar abliterated, puede analizar y describir contenido sensible (violencia, desnudos, discurso de odio) sin rechazar la tarea, lo que resulta util en pipelines de moderacion que necesitan clasificar material explicito.
- Investigacion sobre alineacion y seguridad: sirve como caso de estudio reproducible para medir el efecto de la abliteration en modelos multimodales, comparando KL divergence (0.0627) y tasa de rechazos frente al original.
- Asistencia educativa en STEM: resolucion de problemas de matematicas y fisica a partir de fotos de pizarras o enunciados, con explicacion paso a paso y contexto largo para examenes completos.
- Despliegue en edge: con 2.13B parametros, puede ejecutarse en GPUs de consumo o incluso CPU cuantizado, habilitando asistentes visuales locales sin conexion.

## Benchmarks y rendimiento

La model card del autor solo publica metricas comparativas del proceso de abliteration:

| Metrica | Este modelo | Qwen3-VL-2B-Instruct original |
|---|---|---|
| KL divergence | 0.0627 | 0 (por definicion) |
| Rechazos | 4/100 | 97/100 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU, DocVQA, etc.) en la informacion disponible para esta variante. La model card del modelo base referencia graficos de rendimiento multimodal y de texto puro (imagenes alojadas en aliyuncs.com) pero no incluye tablas numericas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 4.3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para contexto moderado.
- VRAM estimada en cuantizacion 8 bits: alrededor de 2.5-3 GB de pesos; en 4 bits, alrededor de 1.5-2 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100. Cabe holgadamente en GPUs de consumo con 8 GB o mas en bf16 para contextos cortos.
- Despliegue: compatible con `transformers` (se recomienda compilar desde `main` o usar 4.57.0 cuando este disponible) con `Qwen3VLForConditionalGeneration` y `AutoProcessor`. Se recomienda `flash_attention_2` para escenarios multi-imagen y video. No se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la informacion disponible; al ser un modelo VL con arquitectura Qwen3-VL, el soporte dependera de la version de cada runtime.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen-3-VL-2B-Instruct-heretic (este) | 2.13B | 256K (1M ampliable) | Apache 2.0 | Variante abliterated, rechazos 4/100 |
| Qwen3-VL-2B-Instruct | 2.13B | 256K (1M ampliable) | Apache 2.0 | Modelo base, rechazos 97/100, KL 0 |
| Qwen3-VL-4B-Instruct | No disponible en la informacion | 256K (1M ampliable) | Apache 2.0 | Version superior de la misma familia |
| Qwen2.5-VL-3B-Instruct | No disponible en la informacion | No disponible | Apache 2.0 | Generacion anterior de VL pequenos de Qwen |

La comparacion cuantitativa de rendimiento entre estas alternativas no esta disponible en la informacion proporcionada; la model card del modelo base referencia graficos comparativos 2B vs 32B pero sin cifras textuales.

## Limitaciones y advertencias

- La abliteration elimina filtros de seguridad: el modelo respondera a peticiones que el original rechazaria, incluyendo contenido danino, ilegal o eticamente sensible. No es apto para despliegues publicos sin capas de moderacion externas.
- La KL divergence de 0.0627 indica que la distribucion de salida se ha desplazado respecto al original; puede degradar ligeramente la calidad en tareas benignas, aunque el autor no publica benchmarks que lo cuantifiquen.
- Riesgo de alucinacion inherente a modelos de 2B parametros, especialmente en OCR de documentos densos, razonamiento matematico complejo y video largo.
- No se especifican los idiomas soportados en la ficha del modelo; el soporte multilingue se hereda del base pero sin garantia explicita.
- El contexto de 256K es nativo pero el rendimiento en ventanas extremas no esta verificado para esta variante abliterated.
- Licencia Apache 2.0 heredada del base: permite uso comercial, pero el autor de la modificacion no ofrece garantias ni asume responsabilidad sobre el comportamiento del modelo.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; no hay validacion comunitaria ni reportes independientes de calidad.
- El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face, pero no se detalla en la informacion disponible.
- La fecha de creacion indicada (2026-11-01) es futura respecto a la redaccion habitual de fichas; conviene verificar la vigencia del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PanditadaBonita/Qwen-3-VL-2B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Heretic (herramienta de abliteration): https://heretic-project.org
- Demo del modelo base en Spaces: https://huggingface.co/spaces/akhaliq/Qwen3-VL-2B-Instruct
- Paper Qwen3-VL (referencia arXiv en tags): https://arxiv.org/abs/2505.09388
- Paper Qwen2.5-VL (referencia arXiv en tags): https://arxiv.org/abs/2502.13923
- Paper Qwen2-VL (referencia arXiv en tags): https://arxiv.org/abs/2409.12191
- Paper Qwen-VL (referencia arXiv en tags): https://arxiv.org/abs/2308.12966
- Repositorio de transformers (instalacion desde fuente): https://github.com/huggingface/transformers
