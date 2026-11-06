# Jeesup/svd-safety-l2_dualk_jbb_mix_tok_r40

## Resumen

`svd-safety-l2_dualk_jbb_mix_tok_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD del 40 % de los parámetros (fracción resultante de 0,5998), seguida de una recuperación con LoRA en dos etapas según la metodología SVD-LLM. Lo publica el usuario de HuggingFace Jeesup como parte de un estudio sistemático sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes permite repararlo mejor.

El interés técnico reside en el método de compresión: un SVD blanqueado con K-FAC en dos dominios (curvatura de utilidad y curvatura de seguridad), combinado en una única matriz F_mix con un peso de seguridad α = 0,0485 y normalización por tokens. El resultado es una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de rango, no un asistente conversacional listo para producción.

El modelo conserva la arquitectura y el tokenizador de Llama-2-7b-chat, con 6.738.415.616 parámetros reales en safetensors y un repositorio de 13,5 GB. Su propósito es medir el compromiso entre seguridad y utilidad bajo compresión, con métricas publicadas de tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT, sobrerrechazo macro y perplejidad en WikiText-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2), comprimido mediante SVD con K-FAC dual y recuperado con LoRA |
| Parametros totales | 6.738.415.616 (fracción densa 0,5998 respecto al base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo no documenta GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama-2-7b-chat. Sobre él se aplica una compresión SVD con presupuesto de rango por matriz según SVD-LLM, eliminando el 40,00 % de los parámetros. La selección de componentes no usa solo la curvatura de utilidad, sino una matriz K-FAC mixta F_mix = [(1−a)·G_u + a·G_s] ⊗ [(1−a)·A_u + a·A_s], donde el subíndice u denota utilidad y s seguridad, con a = 0,0485. La normalización de curvatura es por tokens: A dividida por posiciones y G dividida por tokens de pérdida (entropía cruzada sumada), calculada por dominio.

La calibración de utilidad emplea wikitext-2-raw-v1 de entrenamiento con el muestreador de SVD-LLM (255 ventanas de 2048 tokens, semilla 42, entropía cruzada de siguiente token). La calibración de seguridad usa `jbb_harm_resp:13`, con 13 muestras y pérdida en todas las posiciones. Tras la compresión, se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial sobre U y luego sobre V (alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16). La semilla global es 42.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, condicionada por la compresión y la recuperación LoRA.
- Razonamiento y respuesta a instrucciones a un nivel no cuantificado en la información disponible; el autor advierte explícitamente que no debe tratarse como un asistente desplegable.
- Comportamiento de rechazo ante peticiones dañinas, medido con AdvBench y StrongREJECT mediante el juez HarmBench.
- Métrica de sobrerrechazo (over-refusal) sobre peticiones benignas, evaluada con WildGuard.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible` según los tags del repositorio.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Estudio de degradación de seguridad bajo compresión: el checkpoint sirve como sujeto experimental para cuantificar cuánto sube la ASR al eliminar el 40 % de parámetros, comparando con el Llama-2-7b-chat original y con otras celdas de la rejilla.
- Evaluación de reglas de selección de componentes: permite contrastar la regla K-FAC dual (utilidad + seguridad) frente a variantes solo-utilidad u otras combinaciones, usando las métricas publicadas como referencia.
- Investigación en interpretabilidad de la alineación: al aislar la curvatura de seguridad en la matriz F_mix, se puede analizar qué subespacios de pesos sostienen el comportamiento de rechazo.
- Reproducción de pipelines de compresión SVD-LLM: el repositorio documenta calibración, semilla, solver y hiperparámetros de LoRA, lo que facilita replicar el procedimiento sobre otros checkpoints.
- Análisis del compromiso seguridad-utilidad: la pareja de métricas (ASR bajo y perplejidad de 9,9246 en WikiText-2) permite estudiar si la reparación de seguridad sacrifica calidad de lenguaje.
- Benchmarking de sobrerrechazo: el valor macro de 0,5195 con WildGuard sirve para comparar políticas de rechazo entre celdas de la rejilla y con el modelo base.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0077 |
| StrongREJECT ASR (juez HarmBench) | 0,0160 |
| Sobrerrechazo macro (WildGuard) | 0,5195 |
| Perplejidad WikiText-2 | 9,9246 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas directas con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16 GB para contexto corto y 24 GB para contextos largos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB de pesos; en 4 bits, aproximadamente 4-5 GB, aunque el repositorio no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue con `text-generation-inference`; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en bf16 para contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, potencialmente en GPUs de 8-12 GB, siempre que se generen los pesos cuantizados por cuenta propia.
- Opciones de despliegue: `transformers`, `text-generation-inference` (según tags), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_dualk_jbb_mix_tok_r40 | 6.738.415.616 (0,5998 del denso) | no disponible | Llama 2 Community | Checkpoint de investigación comprimido con SVD dual y recuperado con LoRA |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla del mismo autor | variable | no disponible | Llama 2 Community | Distintas reglas de selección y presupuestos de rango; comparación directa del estudio |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría (por ejemplo, otros métodos de compresión SVD como SVD-LLM sin curvatura de seguridad) en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y que la compresión por sí sola eleva la tasa de éxito de ataque.
- No es un modelo de propósito general ni un asistente desplegable; debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- El sobrerrechazo macro de 0,5195 con WildGuard indica que rechaza aproximadamente la mitad de las peticiones benignas evaluadas, un coste de utilidad relevante para uso conversacional.
- Riesgo de alucinación no cuantificado en la información disponible; la recuperación LoRA con alpaca-cleaned puede introducir sesgos de estilo y contenido del dataset.
- Idiomas soportados no documentados; la calibración y el ajuste se hicieron con datos en inglés (wikitext-2, alpaca-cleaned), lo que probablemente limita el rendimiento multilingüe.
- Restricciones de licencia: uso comercial sujeto a la Llama 2 Community License y a `USE_POLICY.md`; es un derivado de Llama 2 y debe cumplir las condiciones de atribución y los límites de usuarios mensuales de dicha licencia.
- No se publican cuantizaciones oficiales ni datos de latencia, throughput o comportamiento en contextos largos.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_dualk_jbb_mix_tok_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: incluida en el repositorio (`LICENSE.txt`, `USE_POLICY.md`)
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
