# goldhub/Qwen3.8-27B-BF16-INT4-W4A16-AutoRound-W4G32

## Resumen

Qwen3.8-27B-INT4-W4A16-AutoRound es una cuantizacion de 4 bits del modelo vision-lenguaje Qwen3.8-27B, publicada por el usuario goldhub sobre la arquitectura original del equipo Qwen. Emplea el esquema W4A16 (pesos en 4 bits, activaciones en 16 bits) generado con AutoRound v0.15.0, con tamano de grupo 32, cuantizacion simetrica y 1000 iteraciones de calibracion. El objetivo declarado es reducir los requisitos de VRAM manteniendo practicamente intactas las capacidades multimodales (imagen y video) y la ventana de contexto de 256K tokens del modelo base.

La particularidad de esta variante es que no cuantiza todo: mantiene en FP16/BF16 los embeddings, el codificador visual completo y las proyecciones de atencion lineal (`linear_attn.*`), lo que eleva el peso del repositorio hasta unos 28,3 GB (cercano a un INT8) en lugar de los 15-18 GB habituales de un INT4 agresivo. El autor justifica esta decision como una forma de evitar la degradacion del modulo de vision y el colapso de la atencion en contextos largos, a costa de no caber en una sola GPU de consumo.

El modelo conserva el soporte de Multi-Token Prediction (MTP) del modelo base y se distribuye con licencia Apache 2.0. Esta etiquetado como "semi-uncensored" por el autor, que afirma haber eliminado parte de los filtros de rechazo del modelo original; conviene tratar esa afirmacion con cautela, ya que no viene acompanada de evaluacion reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) con atencion lineal hibrida y Multi-Token Prediction (MTP); familia `qwen3_5` |
| Parametros totales | 11.575.659.760 segun los safetensors del repositorio; el autor y el nombre del modelo indican 27B (no disponible la discrepancia resuelta) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 262.144 tokens (`max_position_embeddings`), es decir, 256K |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), grupo 32, simetrica, AutoRound v0.15.0, formato `auto_round:auto_gptq`; capas `embed_tokens`, `model.visual.*` y `linear_attn.*` preservadas en FP16/BF16 |
| Idiomas soportados | en, zh, ru, uk, el, he |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 28,3 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que procesa texto, imagenes y video de forma nativa, con un tamano de parche temporal de 2 para el tratamiento de video. Incorpora proyecciones de atencion lineal (`linear_attn.*`, con `in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z` y `out_proj`) junto a la atencion estandar, y soporta Multi-Token Prediction (MTP), tecnica que permite predecir varios tokens por paso de decodificacion y acelera la generacion. La ventana de contexto alcanza los 262.144 tokens.

Sobre el proceso de entrenamiento del modelo base no se proporciona informacion en la documentacion disponible: no se detalla el volumen de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Respecto a esta variante cuantizada, el unico proceso documentado es la calibracion AutoRound con 1000 iteraciones y esquema simetrico de grupo 32. La innovacion tecnica destacable es la preservacion selectiva en FP16 de las capas criticas (vision, atencion lineal y embeddings), que el autor presenta como medida para evitar la degradacion multimodal y el colapso de la atencion en contexto largo.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino, ruso, ucraniano, griego y hebreo.
- Comprension de imagenes (image-text-to-text) y de video (video-text-to-text) de forma nativa.
- Razonamiento matematico con resolucion paso a paso y formateo en LaTeX, segun las pruebas internas del autor.
- Generacion de codigo Python conforme a PEP-8, incluyendo analisis de complejidad y arneses de benchmark segun la model card.
- Procesamiento de contexto largo: sintesis y resumen de documentos extensos gracias a la ventana de 256K tokens.
- Soporte de Multi-Token Prediction (MTP) para acelerar la decodificacion.
- Escritura creativa y ensayo filosofico, con un ajuste declarado como "semi-uncensored" o "heretic".
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Analisis de documentacion tecnica con imagenes intercaladas: el modelo puede recibir capturas de diagramas de arquitectura junto al texto explicativo y generar un resumen unificado, aprovechando su pipeline image-text-to-text y la ventana de 256K tokens para documentos de cientos de paginas.
- Revision de video para extraccion de eventos: gracias al procesamiento nativo de video con parche temporal de 2, permite describir secuencias, localizar acciones concretas y generar transcripciones anotadas en pipelines de monitorizacion o catalogacion de archivo audiovisual.
- Asistente de codigo en produccion: la model card documenta generacion de codigo Python conforme a PEP-8 con analisis de complejidad, adecuado para integrarse en revisiones automatizadas o generacion de pruebas, aunque el soporte de tool calling no esta confirmado.
- Resumen de expedientes multilingues: con cobertura de ruso, ucraniano, griego y hebreo ademas de ingles y chino, resulta util para sintetizar corpus documentales de Europa del Este y Oriente Proximo en una sola pasada de contexto largo.
- Despliegue en servidor de dos GPU de 24 GB: el autor indica que el modelo se sirve con vLLM y `tensor-parallel-size=2` sobre 2x RTX 3090, lo que lo hace viable en infraestructura de gama alta de consumo para inferencia interna.
- Generacion de ficcion y contenido creativo sin filtros corporativos: el ajuste declarado del autor lo orienta a escritura narrativa y ensayo, si bien requiere revision editorial por la ausencia de guardarrailes.
- Extraccion de informacion de informes escaneados: la preservacion del codificador visual en FP16 busca mantener la fidelidad en OCR y comprension de tablas, un escenario donde las cuantizaciones agresivas suelen degradarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU) en la informacion disponible. La model card solo incluye pruebas cualitativas internas del autor y una cifra de velocidad.

| Metrica | Valor | Fuente |
|---|---|---|
| Velocidad de generacion | ~56,6 tok/s en hardware de consumo estandar (sin especificar) | Model card del autor |
| Razonamiento matematico | Resuelve acertijos y problemas de velocidad relativa con LaTeX paso a paso | Prueba cualitativa del autor |
| Generacion de codigo | Implementacion optimizada de la criba de Eratostenes con `bitarray`, analisis de complejidad y benchmark | Prueba cualitativa del autor |
| Contexto largo | Resumen correcto de la historia de los LLM desde Word2Vec hasta MoE y MTP | Prueba cualitativa del autor |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 28,3 GB, por lo que se necesita al menos esa cifra mas el espacio de cache KV; con contexto de 128K-256K el consumo adicional es significativo.
- El autor indica que el modelo encaja en 2x RTX 3090 (24 GB cada una) con `tensor-parallel-size=2`.
- No cabe en una unica GPU de consumo de 24 GB (RTX 3090, 4090) con contexto largo; en una RTX 4090 de 24 GB solo seria viable con contexto muy reducido o descarga parcial a CPU.
- GPU recomendadas: 2x RTX 3090, A100 80 GB, H100 80 GB. Con una sola A100/H100 de 80 GB hay margen para contexto extendido.
- Opciones de despliegue documentadas: vLLM (`--trust-remote-code`, `--tensor-parallel-size`), SGLang (`--tp`) y Transformers con `AutoProcessor` y `AutoModelForCausalLM`.
- Parametros de servicio sugeridos por el autor: `--max-model-len 131072` y `--max-num-seqs 2` para mantener el contexto largo estable en 2x RTX 3090.
- Throughput: ~56,6 tok/s por el autor en hardware de consumo no especificado; no hay datos de latencia ni de throughput con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goldhub/Qwen3.8-27B-INT4-W4A16-AutoRound | 27B (11,58B en safetensors) | 256K | Texto, imagen, video | Apache 2.0 | Hugging Face, 276 descargas |
| Qwen/Qwen3.8-27B (modelo base) | 27B | 256K | Texto, imagen, video | Apache 2.0 | Hugging Face |
| Cuantizaciones INT4 convencionales de Qwen3.8-27B | 27B | 256K (degradado en la practica) | Texto, imagen, video | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base y a otras cuantizaciones del mismo modelo, ya que no se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada. Frente a un INT4 convencional de ~15-18 GB, esta variante ocupa ~28,3 GB a cambio de preservar vision y atencion lineal en FP16, segun el autor.

## Limitaciones y advertencias

- El ajuste "semi-uncensored" o "heretic" declarado por el autor implica ausencia de guardarrailes corporativos; no es apto para produccion orientada a usuario final sin filtros propios.
- No hay benchmarks reproducibles: las afirmaciones de calidad se basan en pruebas cualitativas internas del autor, no verificables de forma independiente.
- Discrepancia de parametros: el nombre indica 27B pero los safetensors declaran 11.575.659.760 parametros; conviene verificar el modelo antes de dimensionar infraestructura.
- Riesgo de alucinacion no cuantificado; la preservacion de capas en FP16 mitiga pero no elimina la degradacion propia de la cuantizacion de 4 bits.
- Cobertura idiomatica limitada a seis idiomas (en, zh, ru, uk, el, he); el castellano no figura entre los soportados explicitamente.
- El contexto de 256K requiere mucha VRAM adicional para la cache KV y el autor recomienda limitar `--max-num-seqs` a 2 en 2x RTX 3090.
- Requiere `--trust-remote-code` en vLLM, SGLang y Transformers, lo que implica ejecutar codigo del autor del repositorio.
- El repositorio es una publicacion de un tercero (goldhub) sobre el modelo de Qwen; la licencia Apache 2.0 se hereda del base, pero el mantenimiento y las garantias dependen del autor de la cuantizacion.
- Fecha de publicacion futura respecto a los modelos Qwen publicos conocidos; verificar la autenticidad del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goldhub/Qwen3.8-27B-BF16-INT4-W4A16-AutoRound-W4G32
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- AutoRound (algoritmo de cuantizacion, mencionado en la model card): no disponible enlace directo en la informacion proporcionada
- Documentacion de vLLM: no disponible enlace directo en la informacion proporcionada
- Documentacion de SGLang: no disponible enlace directo en la informacion proporcionada
