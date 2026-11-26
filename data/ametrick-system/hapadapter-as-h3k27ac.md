# ametrick-system/hapadapter-as-h3k27ac

## Resumen

hapadapter-as-h3k27ac es una colección de adaptadores especializados para predecir desequilibrio alélico (allele-specific binding) en la señal epigenética H3K27ac sobre genomas personales diploides. Lo desarrolla el usuario ametrick-system y se apoya en un encoder DNABERT-2 de 117 millones de parámetros, sobre el que se añade una cabeza siamesa que compara los embeddings de dos ventanas haplotípicas de 257 pb centradas en un SNV heterocigoto. El modelo no predice la señal de forma absoluta, sino la magnitud de la diferencia entre haplotipos: una puntuación alta indica mayor probabilidad de que el variant afecte a la acetilación de H3K27ac de forma específica de alelo.

El repositorio contiene ocho checkpoints organizados en cuatro donantes (ENC-001 a ENC-004) y dos brazos por donante: un tronco (`dnabert2-trunk`) que regresa la señal H3K27ac a partir de secuencia de referencia y que puede usarse de forma independiente como predictor de binding, y una cabeza adaptadora (`dnabert2-personal`) entrenada con ventanas extraídas del genoma faseado del propio donante. La cabeza resuelve su backbone desde el tronco, por lo que ambos subdirectorios son necesarios para cargar el modelo.

Su relevancia radica en abordar una tarea poco cubierta por los modelos genómicos generalistas: la interpretación de variantes no codificantes en el contexto de un genoma personal diploide, con una formulación siamesa que modela explícitamente los dos haplotipos. Es un modelo de investigación, con licencia MIT, sin benchmarks publicados en la información disponible y sin validación clínica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder DNABERT-2 (transformer BERT) con cabeza siamesa de adaptador sobre embeddings agrupados por haplotipo |
| Parámetros totales | 117M en el backbone DNABERT-2; total del conjunto no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 257 pb por ventana de entrada (dos ventanas por inferencia) |
| Tipos de cuantización | no disponible (pesos en safetensors sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no aplica (entrada de secuencia de ADN, no texto natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 1,9 GB |
| Librería de carga | `hapadapter` (no es `AutoModel` de transformers) |
| Donantes incluidos | ENC-001, ENC-002, ENC-003, ENC-004 |
| Brazos por donante | `dnabert2-trunk`, `dnabert2-personal` |
| Ensayo epigenético | H3K27ac |
| Tipo de variante | SNV heterocigoto |

## Arquitectura y entrenamiento

El modelo parte de DNABERT-2-117M (zhihan1996/DNABERT-2-117M), un encoder transformer tipo BERT preentrenado sobre secuencias genómicas. Sobre ese backbone se construye un tronco (`dnabert2-trunk`) afinado para regresar la señal H3K27ac a partir de secuencia de referencia; este tronco es utilizable de forma autónoma como predictor de binding. La cabeza adaptadora (`dnabert2-personal`) es una red siamesa que recibe dos ventanas de 257 pb, una por haplotipo, obtiene un embedding agrupado (pooled) de cada una, lo proyecta mediante una transformación P y calcula la puntuación `ell = softplus(a) * ||P(h_1) - P(h_2)|| + b`. La distancia es simétrica, de modo que la salida es una magnitud de desequilibrio, no una dirección.

Cada checkpoint se entrena con ventanas cortadas del genoma faseado del donante correspondiente, lo que introduce personalización a nivel de haplotipo. La model card indica que, pese a entrenarse con un único ensayo y un único donante por checkpoint, el modelo generaliza bien a otros donantes de EN-TEx. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron RLHF/DPO (no procede en este dominio). La carga requiere el paquete `hapadapter` y ambos subdirectorios del donante; la model card documenta advertencias esperadas de `transformers` sobre pesos no utilizados (cabeza MLM) y pooler reinicializado, que no afectan al readout porque el modelo agrupa embeddings alrededor de la variante en lugar de usar el pooler de BERT.

## Capacidades

- Predicción de desequilibrio alélico en H3K27ac para SNVs heterocigotos sobre genomas personales diploides.
- Regresión de señal H3K27ac a partir de secuencia de referencia mediante el tronco (`dnabert2-trunk`), utilizable como predictor de binding independiente.
- Entrada en pares de ventanas haplotípicas de 257 pb centradas en la variante.
- Salida de magnitud de desequilibrio (simétrica), no de dirección ni de haplotipo ganador.
- Personalización por donante: cuatro checkpoints independientes (ENC-001 a ENC-004).
- Generalización declarada a otros donantes de EN-TEx distintos de los de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de texto, visión o audio.
- No es un modelo multilingüe ni de propósito general: su dominio es secuencia de ADN.

## Casos de uso

- Priorización de variantes no codificantes en estudios de asociación: dado un SNV heterocigoto, el modelo puntúa la probabilidad de que afecte a H3K27ac, lo que permite ordenar variantes candidatas antes de validación experimental con reporteros o ChIP-qPCR.
- Análisis de genomas personales en cohortes EN-TEx: al existir checkpoints por donante, se puede evaluar el efecto de variantes en el contexto haplotípico real de cada individuo en lugar de una referencia consenso.
- Filtrado de variantes en pipelines de interpretación epigenómica: integrar la puntuación de desequilibrio como feature adicional en modelos de priorización de variantes reguladoras junto a scores de conservación y anotaciones ENCODE.
- Estudio de mecanismos de regulación génica mediada por enhancers: H3K27ac marca enhancers activos, por lo que el modelo ayuda a identificar variantes que alteran su actividad de forma específica de alelo.
- Investigación en genómica funcional comparada: usar el tronco como predictor de binding para comparar la señal H3K27ac esperada entre secuencias de referencia y variantes, aislando el componente de secuencia del componente alélico.
- Docencia y prototipado en bioinformática: el formato safetensors, la licencia MIT y el tamaño manejable (1,9 GB) permiten desplegar el modelo en entornos de investigación con una sola GPU consumer para experimentos exploratorios.
- Validación cruzada de llamadas de allele-specific binding: contrastar las predicciones del modelo con llamadas experimentales de ASE (allele-specific expression/binding) para detectar discrepancias que merezcan revisión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al paper en preparación y señala que los números por ensayo no se duplican en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone DNABERT-2 de 117M parámetros en FP32 ocupa aproximadamente 0,5 GB; el repositorio completo pesa 1,9 GB, pero la carga por checkpoint individual es mucho menor. Con overhead de activaciones, se estima un uso de VRAM en el rango de 1 a 2 GB por checkpoint en FP32, y menos de 1 GB en FP16. Estimación orientativa, no confirmada en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para un checkpoint individual; una RTX 3060, RTX 4060 o superior es adecuada. Para procesar lotes grandes de variantes, una RTX 4090 o A100 acelera el throughput.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas con 4 GB o más de VRAM.
- Opciones de despliegue: carga mediante el paquete `hapadapter` (`load_model_and_tokenizer`) y `huggingface_hub.snapshot_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hapadapter-as-h3k27ac | DNABERT-2 + cabeza siamesa | 117M (backbone) | 257 pb por ventana | Desequilibrio alélico H3K27ac | MIT | Hugging Face |
| DNABERT-2-117M | Encoder BERT genómico | 117M | no disponible en la información | Representaciones genómicas generales | no disponible en la información | Hugging Face |
| Enformer | Transformer con atención | no disponible en la información | decenas de kb | Predicción de tracks epigenómicos | no disponible en la información | no disponible en la información |
| Nucleotide Transformer | Transformer genómico | múltiples tamaños | no disponible en la información | Tareas genómicas generales | no disponible en la información | Hugging Face |

La comparación es orientativa: hapadapter-as-h3k27ac es un adaptador especializado y personalizado por donante, mientras que los alternativos son modelos base generalistas. No se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- La puntuación es simétrica: no indica qué haplotipo presenta mayor señal, solo la magnitud del desequilibrio.
- Entrada restringida a ventanas de 257 pb; secuencias más largas o más cortas quedan fuera de distribución.
- Cada checkpoint se entrena con un único ensayo y un único donante; aunque se declara buena generalización a otros donantes EN-TEx, no hay métricas publicadas que lo cuantifiquen.
- Modelo de uso en investigación: no validado para interpretación clínica o diagnóstica de variantes humanas.
- No se han publicado benchmarks ni resultados por ensayo en la información disponible; el paper está en preparación.
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí existe riesgo de predicciones espurias fuera del dominio de entrenamiento (variantes no-SNV, contextos celulares distintos, ensayos epigenéticos distintos de H3K27ac).
- Sesgos potenciales derivados de la composición de los donantes EN-TEx (cuatro individuos), que pueden no representar la diversidad poblacional.
- Licencia MIT: permite uso comercial, pero el autor restringe explícitamente el uso clínico y diagnóstico; conviene revisar la licencia del backbone DNABERT-2 subyacente antes de producción.
- La carga requiere el paquete `hapadapter` y ambos subdirectorios del donante; no es compatible con `AutoModel` de transformers.
- Las advertencias de `transformers` durante la carga son esperadas y no indican un fallo, pero pueden confundir en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ametrick-system/hapadapter-as-h3k27ac
- Backbone DNABERT-2-117M: https://huggingface.co/zhihan1996/DNABERT-2-117M
- Paper: en preparación, sin referencia disponible en la información proporcionada
- Repositorio del paquete `hapadapter`: no disponible en la información proporcionada
- Dataset EN-TEx: no disponible en la información proporcionada
