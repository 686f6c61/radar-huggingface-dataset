# PureTensorAI/MiniCPM5-2B-NVFP4-QAD

## Resumen

MiniCPM5-2B-NVFP4-QAD es una cuantización NVFP4 (W4A4) del modelo openbmb/MiniCPM5-2B, publicada por PureTensorAI a partir de los pesos oficiales en BF16. Tanto los pesos como las activaciones se almacenan en 4 bits (formato E2M1 con escalas FP8 E4M3 por grupo de 16), lo que permite a vLLM ejecutarlo sobre su kernel FP4 nativo. El resultado es un checkpoint de 2,18 GB frente a los 5,03 GB del BF16, con 2.516.756.480 parámetros totales.

El proceso combina dos etapas: una cuantización GPTQ sobre las capas `Linear` de los 42 bloques del transformer y, a continuación, una destilación consciente de la cuantización (QAD) en la que el modelo BF16 actúa como profesor y la pérdida es la divergencia KL sobre las distribuciones de siguiente token. La destilación fue corta (1.451 pasos, 1,69M tokens, unos 20 minutos en una GPU) y recuperó aproximadamente la mitad de la degradación introducida por el 4-bit puro.

La relevancia de esta ficha es doble: por un lado, documenta con rigor el coste real en calidad de un esquema W4A4 frente a alternativas weight-only; por otro, deja claro que el checkpoint es un lanzamiento de prueba, no afiliado a OpenBMB, orientado a maximizar throughput bajo alta concurrencia más que a preservar calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (42 bloques), formato de cuantización compressed-tensors `nvfp4-pack-quantized`, esquema `NVFP4` |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 W4A4: pesos y activaciones de entrada en 4 bits E2M1, escalas FP8 E4M3 por grupo de 16; embeddings, cabeza de salida y normas en BF16 |
| Idiomas soportados | no disponible (solo se evaluó en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), 2,18 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 42 bloques. La cuantización se aplicó a todas las capas `Linear` del transformer; se mantuvieron en BF16 los embeddings de tokens, la cabeza de salida y todas las normas. El pipeline consta de dos pasos. Primero, GPTQ con `dampening_frac` 0,01 y `actorder` estático, calibrado sobre las primeras 512 muestras de `mlabonne/open-perfectblend` con hasta 2.048 tokens por muestra. Segundo, destilación consciente de la cuantización: el modelo BF16 es el profesor, la pérdida es KL sobre distribuciones de siguiente token, solo entrenan los pesos cuantizados (las escalas permanecen fijas) y los gradientes atraviesan directamente el redondeo a 4 bits.

El presupuesto de destilación fue de 1.451 pasos y 1,69M tokens, con AdamW, learning rate 5e-6, warm-up y decaimiento coseno. Los datos de destilación fueron `mlabonne/open-perfectblend` en formato chat a partir de la fila 20.000, excluyendo las fuentes matemáticas (MetaMathQA, Orca-Math) para que GSM8K siguiera siendo una prueba justa. Herramientas: llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1. Tras el entrenamiento, los pesos se ajustan a la rejilla de 4 bits, se guardan y se recargan; todas las métricas publicadas se midieron sobre el fichero recargado.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat aplicable vía `apply_chat_template`.
- Razonamiento y matemáticas básicas, con rendimiento medido en MMLU (54,17) y GSM8K (66,03 offline, 64,82 servido).
- Inferencia de alto throughput en vLLM mediante kernel FP4 nativo (FlashInfer CUTLASS).
- Compatibilidad con endpoints (`endpoints_compatible`) y con text-generation-inference según los tags del repositorio.
- Las capacidades específicas del modelo base (tool calling, agentes, multilingüismo, visión, modo thinking) no se detallan en la información proporcionada.
- No se ha ejecutado ninguna evaluación de seguridad, multilingüe ni de contexto largo sobre el modelo cuantizado.

## Casos de uso

- Servicio de chat a alta concurrencia: con 32 peticiones concurrentes en vLLM sobre una GPU Blackwell, este checkpoint alcanza 1,50x el throughput del BF16 (frente a 1,28x del hermano weight-only), lo que lo hace adecuado para endpoints donde el coste por token domina sobre la calidad marginal.
- Prototipado y pruebas de integración: el fichero de 2,18 GB se descarga y carga rápido, lo que facilita validar pipelines de inferencia con `vllm serve` antes de pasar a pesos de mayor precisión.
- Generación de resúmenes y respuestas cortas: la plantilla de chat y la generación greedy de 256 tokens usadas en las mediciones encajan con tareas de resumen y Q&A de respuesta breve.
- Despliegue en hardware con memoria limitada: al ocupar menos de la mitad que el BF16, permite servir el modelo en GPUs con VRAM ajustada manteniendo el kernel FP4 nativo.
- Evaluación comparativa de esquemas de cuantización: sirve como referencia práctica del trade-off W4A4 frente a weight-only (NVFP4A16) en términos de calidad y throughput.
- Razonamiento matemático de baja exigencia: con GSM8K servido en 64,82, es viable para asistentes educativos o de cálculo simple donde no se requiera exactitud de nivel BF16.
- Verificación offline en Transformers: con `compressed-tensors` instalado, la aritmética 4-bit se emula, lo que permite inspeccionar salidas y depurar sin depender de vLLM.

## Benchmarks y rendimiento

Calidad, mismo harness, BF16 como referencia:

| Metrica | BF16 | 4-bit sin destilacion | Este checkpoint |
|---|---:|---:|---:|
| MMLU, accuracy (14.042 preguntas, offline) | 57,29 | 51,03 | 54,17 |
| GSM8K, exact match (1.319 problemas, offline) | 72,48 | 59,89 | 66,03 |
| GSM8K servido por vLLM con kernel FP4 nativo | 72,10 | 58,15 | 64,82 |
| KL media vs BF16, WikiText-2 (131.072 tokens) | 0 | 0,164 | 0,154 |
| KL media vs BF16, chat (224.534 tokens) | 0 | 0,201 | 0,164 |
| Mismo token top que BF16, WikiText-2 / chat | 100% | 80,1% / 83,1% | 80,7% / 84,0% |

Significación estadística (McNemar pareado por pregunta): destilación frente a no destilación, MMLU p = 1e-14 y GSM8K p = 2e-5; este checkpoint frente a BF16 sigue siendo peor de forma significativa (MMLU p = 1e-16, GSM8K p = 6e-7). MMLU y GSM8K usan las configuraciones por defecto de lm-evaluation-harness 0.4.13, sin plantilla de chat, con extracción flexible en GSM8K. "Offline" significa Transformers con aritmética 4-bit emulada, que es optimista para activaciones de 4 bits; el autor indica que el GSM8K servido es 1 a 3 puntos inferior. MMLU no se midió sobre el modelo servido.

Comparación con el hermano weight-only, servido con vLLM 0.34.0 en una GPU Blackwell (compute capability 12.0), generaciones greedy fijas de 256 tokens:

| Metrica | BF16 | Hermano weight-only | Este checkpoint |
|---|---:|---:|---:|
| Kernel vLLM | — | weight-only FP4 (Marlin) | FP4 nativo (FlashInfer CUTLASS) |
| MMLU (offline) | 57,29 | 54,60 | 54,17 |
| GSM8K (servido) | 72,10 | 68,23 | 64,82 |
| Throughput, 1 stream | 1,00x | 1,40x | 1,36x |
| Throughput, 8 concurrentes | 1,00x | 1,53x | 1,55x |
| Throughput, 32 concurrentes | 1,00x | 1,28x | 1,50x |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 2,18 GB en disco; en GPU hay que sumar caché KV y overhead del runtime, por lo que 4-6 GB de VRAM son suficientes para contextos moderados (estimación, no dato del autor).
- GPU recomendadas: el kernel FP4 nativo requiere hardware compatible con FP4; las mediciones se hicieron en una GPU NVIDIA Blackwell (compute capability 12.0). En GPUs sin soporte FP4 nativo, vLLM no podrá usar FlashInfer CUTLASS y el rendimiento será distinto.
- Cabe en GPU consumer: sí, por tamaño; la disponibilidad del kernel FP4 nativo depende de la generación de la GPU.
- Opciones de despliegue: vLLM (`vllm serve PureTensorAI/MiniCPM5-2B-NVFP4-QAD`) es la vía recomendada; Transformers con `compressed-tensors` para verificación (aritmética emulada, sin ventaja de velocidad); text-generation-inference aparece en los tags del repositorio.
- Latencia y throughput: 1,36x (1 stream), 1,55x (8 concurrentes) y 1,50x (32 concurrentes) respecto a BF16 en la GPU y carga medidas; los ratios son de una sola GPU y una sola carga de trabajo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | MMLU | GSM8K servido | Licencia | Notas |
|---|---|---:|---:|---:|---|---|
| PureTensorAI/MiniCPM5-2B-NVFP4-QAD | 2,52B | W4A4 NVFP4 + QAD | 54,17 | 64,82 | Apache-2.0 | Mayor throughput a 32 concurrentes (1,50x) |
| PureTensorAI/MiniCPM5-2B-NVFP4A16 | 2,52B | weight-only FP4 (Marlin) | 54,60 | 68,23 | Apache-2.0 | Mejor calidad, 1,28x a 32 concurrentes |
| openbmb/MiniCPM5-2B (BF16) | 2,52B | BF16 | 57,29 | 72,10 | Apache-2.0 | Referencia de calidad; 5,03 GB |

## Limitaciones y advertencias

- La calidad es inferior al BF16 y al hermano weight-only en todas las métricas publicadas; las diferencias frente a BF16 son estadísticamente significativas.
- La destilación fue muy corta (unos 20 minutos en una GPU); el autor reconoce que una ejecución más larga probablemente recuperaría más calidad.
- Una sola ejecución de entrenamiento, una sola calibración y sin semillas repetidas: no hay estimación de varianza.
- Solo se evaluó en inglés; no se ejecutó ninguna evaluación de seguridad, multilingüe ni de contexto largo sobre el modelo cuantizado.
- Los benchmarks offline emulan la aritmética 4-bit y son optimistas para activaciones de 4 bits; el autor recomienda fiarse de la fila servida de GSM8K.
- Los ratios de throughput provienen de una única GPU y una única carga de trabajo; no son extrapolables a otros entornos.
- Es un lanzamiento de prueba, no afiliado ni respaldado por OpenBMB.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones adicionales conocidas para uso comercial.
- Riesgo de alucinación y sesgos del modelo base no documentados en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PureTensorAI/MiniCPM5-2B-NVFP4-QAD
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Hermano weight-only: https://huggingface.co/PureTensorAI/MiniCPM5-2B-NVFP4A16
- Dataset de calibración y destilación: https://huggingface.co/datasets/mlabonne/open-perfectblend
- llm-compressor: no disponible en la información proporcionada
- compressed-tensors: no disponible en la información proporcionada
- lm-evaluation-harness: no disponible en la información proporcionada
- Paper, blog o demo del autor: no disponible en la información proporcionada
