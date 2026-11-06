# Jeesup/svd-safety-l3_dualk_dual_trace_r50

## Resumen

`svd-safety-l3_dualk_dual_trace_r50` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` comprimido mediante SVD blanqueado con K-FAC de doble dominio (curvatura de utilidad y de seguridad) hasta el 50,0 % de los parametros densos, y posteriormente recuperado con la etapa 2 de LoRA de SVD-LLM. Lo publica el usuario Jeesup como artefacto de investigacion sobre como la compresion SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor.

No es un modelo de chat de proposito general: es una celda concreta de una rejilla experimental sobre reglas de seleccion y presupuestos de compresion. Su interes radica en que cuantifica explicitamente el compromiso entre utilidad (perplejidad en WikiText-2) y seguridad (tasas de exito de ataque en AdvBench y StrongREJECT) bajo compresion, un eje poco documentado en la literatura de compresion de LLM.

El modelo conserva la arquitectura Transformer decoder-only de Llama 3 8B, con 8.030.261.248 parametros almacenados en safetensors (16,1 GB de repositorio), y hereda la licencia Meta Llama 3 Community License. Su uso previsto es la evaluacion experimental, no el despliegue como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD de bajo rango con presupuesto de rangos de SVD-LLM |
| Parametros totales | 8.030.261.248 (fraccion resultante 0,4997 respecto al denso) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3 8B Instruct: 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Meta Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de Llama-3-8B-Instruct y aplica una compresion SVD de bajo rango con un solver `dual`: se optimiza de forma conjunta `F_dual = (1-a) G_u ⊗ A_u + a G_s ⊗ A_s`, donde cada dominio tiene su propia matriz de K-FAC (utilidad y seguridad), con un peso de seguridad `a = 0,1238` (`--alpha tok`). La normalizacion de curvatura es `trace`: `A` dividida por posiciones y `G` dividida por tokens de perdida (entropia cruzada sumada), por dominio, y despues cada factor dividido por su traza. El presupuesto de rangos por matriz es el de SVD-LLM para la misma tasa de eliminacion (50,00 % de parametros eliminados). La resolucion se hace por ALS conjunto (hasta 300 barridos, `rtol 1e-07`, `ridge 1e-06`) partiendo de la solucion de mezcla.

La calibracion de utilidad usa `wikitext-2-raw-v1` (split de entrenamiento) con el muestreador de SVD-LLM: 255 ventanas de 2048 tokens, semilla 42, perdida de entropia cruzada de siguiente token. La calibracion de seguridad usa `results/dual_kfac_wj/wj_safe_l3.jsonl` (512 muestras, perdida sobre los tokens de respuesta). Tras la compresion se aplica la etapa 2 de recuperacion de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con `alpaca-cleaned`, r=8, alpha=16, 2 epocas, lr 1e-4, batch 64, cutoff 256 y bf16. Semilla global 42.

## Capacidades

- Generacion de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradacion introducida por la compresion al 50 %.
- Razonamiento y conocimiento general de Llama 3 8B, con perdida de calidad medible (perplejidad WikiText-2 de 22,8540).
- Capacidad multilingue heredada del modelo base, aunque no se documenta explicitamente en la model card.
- No se documenta soporte de tool calling, function calling ni modos de agente especificos en la informacion disponible.
- No se documenta vision, audio ni modo de razonamiento explicito (thinking mode).
- El interes funcional del checkpoint es servir como sujeto experimental para medir seguridad bajo compresion, no como asistente desplegable.

## Casos de uso

- Investigacion sobre compresion y seguridad: usar este checkpoint como celda de control en estudios que midan como la eliminacion de rangos SVD afecta a la tasa de exito de ataques (ASR) frente a la perplejidad, comparando con otras reglas de seleccion de la misma rejilla.
- Evaluacion de recuperacion con LoRA: reproducir la etapa 2 de SVD-LLM sobre este checkpoint para medir cuanto de la degradacion de seguridad se recupera con `alpaca-cleaned` a r=8, y contrastarlo con otras variantes.
- Calibracion de jueces de seguridad: emplear las salidas del modelo en AdvBench y StrongREJECT como distribucion de referencia para validar la sensibilidad de un juez tipo HarmBench o WildGuard.
- Analisis de sobre-rechazo: estudiar la tasa de sobre-rechazo macro (0,3724 con WildGuard) para entender el coste en utilidad de preservar seguridad tras compresion.
- Docencia y divulgacion tecnica: ilustrar en un curso o articulo el efecto de la compresion SVD de bajo rango sobre un LLM de 8B con metricas concretas de utilidad y seguridad.
- Reproducibilidad de pipelines de compresion: servir de referencia para validar implementaciones de K-FAC de doble dominio, normalizacion por traza y ALS conjunto con los hiperparametros documentados (semilla 42, `a = 0,1238`, 300 barridos).
- Pruebas de regresion de herramientas de evaluacion: banco de pruebas para verificar que un pipeline de evaluacion de seguridad detecta correctamente un modelo deliberadamente degradado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0115 |
| StrongREJECT ASR (juez HarmBench) | 0,0383 |
| Sobre-rechazo macro (WildGuard) | 0,3724 |
| Perplejidad WikiText-2 | 22,8540 |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K) en la informacion disponible. No se dispone de los valores del modelo base sin comprimir en la misma tabla, por lo que no es posible calcular la delta de degradacion a partir de los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, mas cache KV y activaciones; en la practica se recomienda 24 GB o mas para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4080 para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 a bf16 con contexto moderado, y en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama requeririan conversion a formatos no publicados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_dualk_dual_trace_r50 | 8,03 B (50 % denso) | no disponible | llama3 | Artefacto de investigacion, ASR AdvBench 0,0115, ppl WikiText-2 22,85 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | llama3 | Modelo base sin comprimir; referencia de utilidad y seguridad |
| SVD-LLM (checkpoints de referencia del paper) | variable segun tasa | no disponible | segun base | Metodo de compresion SVD con recuperacion LoRA; esta ficha usa su presupuesto de rangos |
| Otros checkpoints de la rejilla de Jeesup | ~8 B comprimidos | no disponible | llama3 | Distintas reglas de seleccion y presupuestos; no se detallan en la informacion disponible |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que varias variantes de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; la compresion por si sola eleva la tasa de exito de ataque. No debe tratarse como asistente desplegable.
- Riesgo de alucinacion incrementado por la compresion al 50 % de parametros y por la recuperacion limitada con LoRA (r=8, 2 epocas sobre `alpaca-cleaned`).
- Perplejidad WikiText-2 de 22,8540, claramente superior a la de un modelo denso de 8B sin comprimir, lo que indica perdida de calidad en modelado de lenguaje.
- Tasa de sobre-rechazo macro de 0,3724 (WildGuard), que sugiere un comportamiento de rechazo desalineado con la utilidad esperada.
- Idiomas soportados no documentados; el comportamiento multilingue puede diferir del modelo base.
- Restricciones de licencia: Meta Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial esta sujeto a los terminos de dicha licencia y a las obligaciones de atribucion ("Built with Meta Llama 3").
- No se publican variantes cuantizadas ni formatos GGUF, lo que limita el despliegue en entornos de bajos recursos sin conversion propia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_dualk_dual_trace_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3: incluida en el repositorio (`LICENSE` y `USE_POLICY.md`)
- Paper de SVD-LLM (metodo de compresion y recuperacion referenciado): no disponible como enlace en la informacion proporcionada
- Repositorio o demo adicionales: no disponibles en la informacion proporcionada
