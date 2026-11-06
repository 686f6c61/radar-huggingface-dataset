# Jeesup/svd-safety-l3_hisvd_wiki_r40

## Resumen

`Jeesup/svd-safety-l3_hisvd_wiki_r40` es un checkpoint experimental derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante HiSVD (una reimplementación de la técnica de redai-infra/HiSVD) hasta conservar el 60,47 % de los parámetros densos originales, es decir, con un 40 % de parámetros eliminados. Posteriormente se recuperó mediante la etapa 2 de SVD-LLM, que aplica LoRA secuencial sobre las matrices U y V con el conjunto alpaca-cleaned. El resultado es un modelo de 8.030.261.248 parámetros almacenados, formato safetensors y pipeline de text-generation.

No se trata de un modelo de propósito general ni de un asistente desplegable, sino de un artefacto de investigación del autor Jeesup orientado a estudiar cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. Este checkpoint concreto es una celda de una cuadrícula experimental sobre reglas de selección y presupuestos de compresión, con semilla 42 y calibración en `wikitext2:256`.

Su relevancia es metodológica: cuantifica el compromiso entre seguridad y utilidad bajo compresión, midiendo tasas de éxito de ataque (ASR) en AdvBench y StrongREJECT, sobre-rechazo en WildGuard y perplejidad en WikiText-2. El autor advierte explícitamente de que varias celdas de la cuadrícula están deliberadamente degradadas en seguridad respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con HiSVD |
| Parametros totales | 8.030.261.248 (60,47 % del denso original; 40 % de parámetros eliminados) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en safetensors (bf16 en el proceso de recuperacion) |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Llama 3 con 8B parámetros. Sobre ella se aplica HiSVD, una reimplementación propia del método de redai-infra/HiSVD, que descompone en valores singulares las matrices de pesos y elimina componentes hasta retener el 60,47 % de los parámetros. La selección de componentes usa el método `stable`, con modulación logarítmica y alpha 1.0. La calibración se realizó sobre `wikitext2:256` con longitud de secuencia 2048 y semilla 42.

Tras la compresión, se aplica la etapa 2 de recuperación de SVD-LLM: LoRA secuencial primero sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre alpaca-cleaned. No se documentan en la información disponible el volumen total de tokens de preentrenamiento del modelo base ni detalles de RLHF/DPO más allá de los inherentes a Llama-3-8B-Instruct.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones, con calidad mermada por la eliminación del 40 % de parámetros.
- Capacidad multilingüe heredada del modelo base, aunque no se documenta el conjunto exacto de idiomas soportados.
- No se documenta soporte de tool calling, function calling ni modo de agentes en la información proporcionada.
- No se documenta soporte de visión, audio ni modo de razonamiento extendido (thinking mode).
- El interés principal del checkpoint es servir como sujeto experimental para medir seguridad y utilidad bajo compresión, no como asistente desplegable.

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como celda de referencia para comparar reglas de selección de componentes SVD y presupuestos de compresión, midiendo el impacto en perplejidad y seguridad.
- Estudio de degradación de seguridad: analizar cómo la compresión eleva la tasa de éxito de ataques (ASR) frente al modelo base y evaluar estrategias de reparación mediante LoRA.
- Evaluación de pipelines de recuperación: reproducir el proceso de SVD-LLM etapa 2 (LoRA secuencial sobre U y V) y comparar su eficacia con otras técnicas de recuperación post-compresión.
- Benchmarking de robustez: emplear AdvBench, StrongREJECT y WildGuard como batería de evaluación para medir sobre-rechazo y vulnerabilidad en modelos comprimidos.
- Reproducibilidad académica: replicar el experimento con la semilla 42 y la calibración documentada para validar resultados de terceros.
- Análisis de compromiso utilidad-seguridad: usar las métricas publicadas (perplejidad 18,73 en WikiText-2, ASR 0,3288 en AdvBench) como punto de partida para estudios comparativos entre configuraciones de compresión.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3288 |
| StrongREJECT ASR (juez HarmBench) | 0,3323 |
| Sobre-rechazo macro (WildGuard) | 0,1776 |
| Perplejidad WikiText-2 | 18,7297 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para contexto largo.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos; en 4 bits, en torno a 4-5 GB (estimaciones a partir del tamaño de parámetros, no verificadas en la información disponible).
- GPU recomendadas: A100 (40/80 GB), H100, L40S para despliegue en producción; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 y en GPUs de 8-12 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp y Ollama son viables con conversión a los formatos correspondientes, aunque no se documentan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l3_hisvd_wiki_r40` | 8,03 B (60,47 % del denso) | no disponible | Llama 3 Community | Checkpoint experimental comprimido, seguridad degradada |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8,03 B | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir, referencia de calidad y seguridad |
| Alternativas de compresión SVD-LLM / HiSVD | variable | variable | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otros modelos comprimidos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que varias celdas de la cuadrícula experimental están deliberadamente degradadas en seguridad; este checkpoint no debe tratarse como un asistente desplegable.
- La compresión por sí sola eleva la tasa de éxito de ataques (ASR de 0,3288 en AdvBench y 0,3323 en StrongREJECT), lo que implica mayor vulnerabilidad que el modelo base.
- El sobre-rechazo macro de 0,1776 indica que el modelo rechaza en exceso peticiones legítimas en algunas categorías.
- La perplejidad de 18,7297 en WikiText-2 refleja una pérdida de calidad de modelado del lenguaje respecto al modelo sin comprimir.
- No se documentan sesgos específicos, pero hereda los del modelo base Llama-3-8B-Instruct.
- Riesgo de alucinación presente y potencialmente agravado por la compresión.
- Idiomas soportados no documentados; la cobertura multilingüe puede verse afectada por la eliminación de componentes.
- Uso comercial sujeto a la Meta Llama 3 Community License y a `USE_POLICY.md`, incluidos en el repositorio.
- Es un artefacto de investigación: no se garantiza su idoneidad para producción y debe evaluarse de forma independiente antes de extraer conclusiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_hisvd_wiki_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio HiSVD referenciado: https://github.com/redai-infra/HiSVD
- No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs, demos) asociados a este checkpoint.
