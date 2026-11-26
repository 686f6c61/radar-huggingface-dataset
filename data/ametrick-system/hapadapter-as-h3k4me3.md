# ametrick-system/hapadapter-as-h3k4me3

## Resumen

hapadapter-as-h3k4me3 es un conjunto de adaptadores especializados para la predicción de **binding alélico específico** de la marca epigenética H3K4me3 sobre genomas personales diploides. Lo desarrolla el usuario `ametrick-system` y se distribuye bajo licencia MIT. No es un modelo de lenguaje: es un cabezal (head) tipo red siamesa construido sobre un encoder de ADN DNABERT-2, que recibe como entrada un par de ventanas de 257 pb (una por haplotipo, centradas en la variante) y estima la probabilidad de que exista desequilibrio alélico en la señal de H3K4me3.

El repositorio contiene ocho subcarpetas (cuatro donantes ENC-001 a ENC-004, cada uno con un tronco `dnabert2-trunk` y un adaptador `dnabert2-personal`). El tronco es un DNABERT-2 afinado para regresar la señal de H3K4me3 a partir de secuencia de referencia y puede usarse de forma independiente como predictor de binding; el adaptador personal resuelve su backbone desde el tronco y añade el cabezal siamés entrenado sobre las ventanas del genoma faseado del donante.

Es relevante porque aborda un problema concreto de genómica funcional —predecir efectos regulatorios de SNVs heterocigotos en un contexto personal— con un diseño modular y ligero (1,9 GB en total), aunque con limitaciones claras: solo ventanas de 257 pb, uso exclusivamente de investigación y sin validación clínica. No se han publicado benchmarks ni métricas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder DNABERT-2 (transformer tipo BERT) + cabezal siamés con proyección y distancia entre embeddings agrupados |
| Parametros totales | no disponible (repo de 1,9 GB con 8 subcarpetas; DNABERT-2 base tiene 117M según el nombre del checkpoint referenciado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 257 pb por ventana (entrada en pares, una por haplotipo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de secuencia de ADN, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se compone de dos piezas. El **tronco** (`dnabert2-trunk`) es un encoder DNABERT-2 (transformer tipo BERT preentrenado sobre genoma) afinado para regresar la señal de H3K4me3 a partir de secuencia de referencia. El **adaptador personal** (`dnabert2-personal`) es una red siamesa que procesa dos ventanas haploides de 257 pb, agrupa sus embeddings en torno a la variante, los proyecta y calcula una distancia. La fórmula del readout es `ell = softplus(a) * ||P(h_1) - P(h_2)|| + b`, donde `P` es la proyección de cada embedding agrupado. Al ser una distancia simétrica, la puntuación indica **magnitud** de desequilibrio alélico, no qué haplotipo presenta mayor señal.

Cada checkpoint se entrena con un ensayo (H3K4me3) y un donante, aunque el autor reporta buena generalización a otros donantes EN-TEx. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF/DPO (no aplicables a este dominio). El paquete `hapadapter` gestiona la carga; no es un `AutoModel` de `transformers` y requiere descargar conjuntamente tronco y adaptador.

## Capacidades

- Predicción de desequilibrio alélico (allelic imbalance) en señal de H3K4me3 para SNVs heterocigotos.
- Regresión de señal de binding H3K4me3 a partir de secuencia de referencia (uso del tronco de forma independiente).
- Procesamiento de pares de ventanas genómicas de 257 pb centradas en la variante.
- Generalización a donantes EN-TEx distintos del donante de entrenamiento (según el autor).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de dominio biológico.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Priorización de variantes reguladoras: dado un conjunto de SNVs heterocigotos, puntuar cada uno con el adaptador para identificar candidatos con alto desequilibrio alélico en H3K4me3 y priorizar su validación experimental.
- Análisis de QTLs de expresión/epigenética: integrar las puntuaciones del modelo como feature en pipelines de mapeo de asQTL (allele-specific QTL) para enriquecer la señal estadística con predicciones in silico.
- Filtrado en estudios de asociación: usar el tronco como predictor de binding de referencia para descartar variantes con bajo impacto esperado antes de ensayos funcionales costosos.
- Investigación en epigenómica personalizada: comparar la señal predicha entre haplotipos de un mismo individuo para estudiar mecanismos de regulación alelo-específica en líneas celulares EN-TEx.
- Docencia y prototipado en bioinformática: el tamaño contenido (1,9 GB) y la licencia MIT permiten desplegar el modelo en entornos académicos y reproducir experimentos de predicción de binding.
- Benchmarking interno de encoders de ADN: emplear el tronco DNABERT-2 afinado como baseline frente a otros encoders genómicos en tareas de regresión de señales epigenéticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al paper (en preparación) para las cifras por ensayo y no duplica métricas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (1,9 GB) y un encoder DNABERT-2 de ~117M parámetros, la inferencia cabe holgadamente en GPUs consumer de 8 GB o incluso en CPU para lotes pequeños.
- GPU recomendadas: cualquier GPU con ≥8 GB (RTX 3060/4060/4090, A100, H100) es suficiente; no requiere aceleradores de gama alta.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: paquete `hapadapter` (carga vía `load_model_and_tokenizer`) sobre `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hapadapter-as-h3k4me3 | Adaptador siamés sobre DNABERT-2 | Par de ventanas de 257 pb | 257 pb | MIT | Hugging Face |
| DNABERT-2 (zhihan1996) | Encoder de ADN | Secuencia única | ~512 tokens | no disponible en esta ficha | Hugging Face |
| Nucleotide Transformer | Encoder de ADN | Secuencia única | hasta 12 kb (según variante) | no disponible en esta ficha | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada; la comparación se limita a tipo de arquitectura, entrada y licencia.

## Limitaciones y advertencias

- **Readout simétrico**: la puntuación no indica qué haplotipo presenta mayor señal de H3K4me3, solo la magnitud del desequilibrio.
- **Ventana fija de 257 pb**: entradas más largas o más cortas quedan fuera de distribución.
- **Un ensayo y un donante por checkpoint**: la generalización a otros donantes se reporta como buena, pero no se cuantifica en la información disponible.
- **Uso exclusivamente de investigación**: no validado para interpretación clínica o diagnóstica de variantes humanas.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero sí existe riesgo de predicciones espurias fuera del dominio de entrenamiento (variantes no representadas, contextos epigenéticos distintos).
- **Sesgos**: no documentados; al entrenarse sobre donantes EN-TEx concretos, puede heredar sesgos de composición poblacional de esas muestras.
- **Licencia MIT**: permite uso comercial, pero el autor restringe explícitamente el uso a investigación; conviene revisar la compatibilidad antes de aplicaciones clínicas.
- **Carga no estándar**: no es un `AutoModel`; requiere el paquete `hapadapter` y descargar tronco y adaptador conjuntamente.

## Enlaces

- Hugging Face: https://huggingface.co/ametrick-system/hapadapter-as-h3k4me3
- DNABERT-2 (checkpoint referenciado): https://huggingface.co/zhihan1996/DNABERT-2-117M
- Paper: en preparación según la model card (no disponible todavía)
