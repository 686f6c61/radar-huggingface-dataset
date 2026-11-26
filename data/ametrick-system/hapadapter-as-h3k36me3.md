# ametrick-system/hapadapter-as-h3k36me3

## Resumen

hapadapter-as-h3k36me3 es una colección de adaptadores especializados para la predicción de desequilibrio alélico (allele-specific binding) en la marca epigenética H3K36me3 sobre genomas personales diploides. Lo desarrolla el autor `ametrick-system` y se distribuye bajo licencia MIT. El modelo no es un modelo de lenguaje: es un sistema de dos etapas construido sobre el encoder de ADN DNABERT-2 (117M parámetros), formado por un tronco (`dnabert2-trunk`) afinado para regresar la señal de H3K36me3 a partir de secuencia de referencia, y una cabeza adaptadora siamesa (`dnabert2-personal`) que compara los embeddings de dos ventanas haplotípicas.

El problema que resuelve es concreto: dado un SNV heterocigoto, determinar si los dos haplotipos muestran desequilibrio en la señal de H3K36me3, una marca asociada a regiones transcripcionalmente activas y a cuerpos génicos. La entrada es un par de ventanas de genoma personal de 257 pb, una por haplotipo, centradas en la variante. El repositorio incluye cuatro donantes (ENC-001 a ENC-004) con ambos brazos (personal y trunk) para cada uno.

Es relevante por su enfoque de adaptación por donante sobre un backbone genómico preentrenado, un patrón que reduce el coste de entrenamiento frente a modelos genómicos completos y permite reutilizar el tronco como predictor de binding independiente. El tamaño del repo es de 1,9 GB y la librería de carga no es `transformers` estándar, sino el paquete `hapadapter`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer DNABERT-2 (BERT de 117M) con cabeza siamesa adaptadora sobre embeddings pooled |
| Parametros totales | no disponible (backbone DNABERT-2 de 117M; tamaño de la cabeza no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 257 pb por ventana haplotípica (entrada en pares) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (secuencia de ADN, no texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria de carga | hapadapter |
| Donantes incluidos | ENC-001, ENC-002, ENC-003, ENC-004 |
| Brazos por donante | dnabert2-personal, dnabert2-trunk |
| Tamano del repo | 1,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema se compone de un tronco DNABERT-2 (encoder transformer tipo BERT con tokenización de k-mers de ADN, 117M parámetros) afinado para regresar la señal de H3K36me3 a partir de secuencia de referencia. Sobre ese tronco se monta una cabeza adaptadora siamesa que recibe dos ventanas haplotípicas de 257 pb, extrae el embedding pooled de cada una en torno a la variante y calcula una distancia en el espacio proyectado. La fórmula de lectura es `ell = softplus(a) * ||P(h_1) - P(h_2)|| + b`, donde `P` es la proyección de cada embedding pooled y `h_1`, `h_2` son los dos haplotipos.

Un detalle técnico importante es que la distancia es simétrica: el score indica magnitud de desequilibrio alélico, pero no qué haplotipo presenta mayor señal. El modelo agrupa tokens alrededor de la variante en lugar de usar la salida del pooler de BERT, de ahí que la inicialización aleatoria del pooler reportada por `transformers` sea irrelevante. Cada checkpoint se entrena con un único ensayo y un único donante, aunque el autor afirma buena generalización a otros donantes EN-TEx. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Predicción de desequilibrio alélico en H3K36me3 para SNVs heterocigotos sobre genomas personales diploides.
- Regresión de señal H3K36me3 a partir de secuencia de referencia mediante el brazo `dnabert2-trunk`, utilizable de forma independiente como predictor de binding.
- Procesamiento de pares de ventanas haplotípicas de 257 pb centradas en la variante.
- Adaptación por donante: cada cabeza `dnabert2-personal` se entrena sobre el genoma faseado del donante correspondiente y resuelve su backbone desde `dnabert2-trunk`.
- Generalización declarada a otros donantes EN-TEx distintos del donante de entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo biológico de secuencia, no un modelo de lenguaje.

## Casos de uso

- Análisis de efectos de variantes no codificantes: dado un SNV heterocigoto en una región génica activa, el modelo estima si existe desequilibrio en H3K36me3 entre haplotipos, lo que ayuda a priorizar variantes con posible impacto regulatorio.
- Estudios de expresión alelo-específica: integrado en pipelines de EN-TEx o similares, permite cruzar desequilibrio de H3K36me3 con desequilibrio de expresión para identificar mecanismos de regulación en cis.
- Priorización de variantes en investigación de rasgos complejos: el score de magnitud de desequilibrio sirve como característica adicional en modelos de asociación o de puntuación de variantes.
- Reutilización del tronco como predictor de binding: el brazo `dnabert2-trunk` puede emplearse solo para regresar señal H3K36me3 desde secuencia de referencia en tareas de anotación epigenética.
- Validación cruzada entre donantes: al incluir cuatro donantes con ambos brazos, permite evaluar la transferibilidad de la predicción entre genomas personales distintos.
- Filtrado previo a validación experimental: reduce el espacio de variantes candidatas antes de ensayos de ChIP-seq o reporteros, al descartar SNVs con bajo desequilibrio predicho.
- Benchmarking de adaptadores genómicos: sirve como referencia metodológica para comparar estrategias de adaptación por donante sobre backbones de ADN preentrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (en preparación) y señala explícitamente que las cifras por ensayo no se duplican en el repositorio.

## Requisitos de hardware

- VRAM estimada: el backbone DNABERT-2 de 117M parámetros ocupa aproximadamente 0,5 GB en fp32 y en torno a 0,25 GB en fp16; la cabeza siamesa añade una fracción pequeña no especificada. El repo completo (1,9 GB) incluye ocho checkpoints, pero en inferencia solo se carga un par tronco-cabeza.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. Para lotes grandes, una GPU de datacenter acelera el throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660 en adelante, RTX 20/30/40, e incluso CPU para volúmenes pequeños).
- Opciones de despliegue: el paquete `hapadapter` con `load_model_and_tokenizer` y `snapshot_download` de `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un `AutoModel` estándar no se integra directamente en esos servidores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hapadapter-as-h3k36me3 | DNABERT-2 117M + cabeza | 257 pb por haplotipo | Desequilibrio alélico H3K36me3 | MIT | Hugging Face |
| DNABERT-2 (zhihan1996) | 117M | 512 tokens de k-mers | Representaciones genómicas generales | no disponible en la informacion | Hugging Face |
| Nucleotide Transformer | 500M a 2,5B (variantes) | hasta 12 kb | Representaciones genómicas generales | no disponible en la informacion | Hugging Face |
| Enformer | ~250M | ~200 kb | Predicción de tracks epigenéticos | no disponible en la informacion | Repo oficial DeepMind |

La comparativa con DNABERT-2 es directa porque hapadapter lo usa como backbone; frente a Nucleotide Transformer y Enformer, hapadapter se especializa en desequilibrio alélico a nivel de haplotipo, una tarea que los modelos generales no abordan de forma nativa. No se dispone de cifras comparativas de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- El score de desequilibrio es simétrico: no indica qué haplotipo presenta mayor señal de H3K36me3, solo la magnitud del desequilibrio.
- Entrada restringida a ventanas de 257 pb; secuencias más largas o más cortas quedan fuera de distribución.
- Cada checkpoint se entrena con un único ensayo y un único donante; la generalización a otros donantes está declarada pero no cuantificada en el repositorio.
- Uso exclusivamente de investigación: no validado para interpretación clínica ni diagnóstica de variantes humanas.
- No es un `AutoModel` de `transformers`; requiere el paquete `hapadapter` y cargar conjuntamente tronco y cabeza, lo que complica su integración en stacks estándar.
- Las advertencias de `transformers` sobre pesos no usados y pooler no inicializado son esperadas, pero pueden confundir en despliegues automatizados.
- Licencia MIT permite uso comercial, pero la ausencia de validación clínica y de benchmarks publicados desaconseja su uso en producción sin evaluación propia.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de extrapolación indebida fuera del ensayo y donante de entrenamiento.
- No se documentan sesgos de población: los donantes EN-TEx incluidos pueden no representar la diversidad genómica global.

## Enlaces

- Hugging Face: https://huggingface.co/ametrick-system/hapadapter-as-h3k36me3
- Backbone DNABERT-2: https://huggingface.co/zhihan1996/DNABERT-2-117M
- Paper: en preparación, referencia pendiente de actualización en el repositorio (no disponible)
- Paquete `hapadapter`: no se proporciona URL en la información disponible
