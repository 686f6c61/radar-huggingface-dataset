# ametrick-system/hapadapter-as-atac

## Resumen

hapadapter-as-atac es una colección de cabezas adaptadoras (adapter heads) denominadas HapAdapter, construidas sobre el codificador de ADN DNABERT-2, que predicen desequilibrio alélico en señal ATAC para variantes de un solo nucleótido (SNV) en estado heterocigoto sobre genomas personales diploides. El modelo lo desarrolla el usuario ametrick-system y se distribuye con licencia MIT. Cada checkpoint recibe como entrada un par de ventanas de genoma personal de 257 pb, una por haplotipo, centradas en la variante, y emite una puntuación de magnitud que indica la probabilidad de que los dos haplotipos presenten unión diferencial (allele-specific binding) en el ensayo ATAC.

El repositorio contiene ocho subcarpetas organizadas por donante (ENC-001 a ENC-004) y por brazo experimental: `dnabert2-trunk`, que es el modelo de unión (binding model) afinado para regresar la señal ATAC a partir de la secuencia de referencia y que puede usarse de forma autónoma como predictor de unión, y `dnabert2-personal`, la cabeza adaptadora entrenada sobre ventanas extraídas del genoma faseado del propio donante y que resuelve su backbone desde el trunk correspondiente.

Es relevante porque aborda un problema específico de genómica funcional personalizada: la interpretación de variantes en el contexto de genomas diploides faseados, con una arquitectura siamesa que compara representaciones de ambos haplotipos. No es un modelo de lenguaje generativo ni un `AutoModel` estándar; requiere la librería `hapadapter` para su carga y está orientado exclusivamente a investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer DNABERT-2 con cabeza siamesa (HapAdapter) sobre embeddings agrupados por haplotipo |
| Parámetros totales | no disponible (el backbone de referencia DNABERT-2-117M tiene 117 M; el total del conjunto no se especifica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 257 pb por ventana de entrada (par de ventanas, una por haplotipo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de secuencia de ADN, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura parte de DNABERT-2-117M como codificador de secuencias de ADN. Sobre él se construye una red siamesa: cada ventana haplotípica de 257 pb se codifica por separado, se agrupan (pool) sus embeddings de tokens en torno a la variante y se proyectan; la cabeza calcula `ell = softplus(a) * ||P(h_1) - P(h_2)|| + b`, es decir, una distancia simétrica entre las representaciones proyectadas de ambos haplotipos escalada y desplazada por parámetros aprendidos. El resultado es una puntuación de magnitud: valores altos indican mayor probabilidad de unión específica de alelo, pero el modelo no puede determinar qué haplotipo une más, dado que la distancia es simétrica.

El entrenamiento se organiza por donante y por brazo. El trunk se afina para regresar la señal ATAC a partir de la secuencia de referencia; la cabeza personal se entrena sobre ventanas cortadas del genoma faseado del donante correspondiente, resolviendo el backbone desde el trunk. Cada checkpoint se entrena con un único ensayo y un único donante, aunque el autor reporta buena generalización a otros donantes de EN-TEx. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). La model card indica que el paper está en preparación y no duplica cifras por ensayo.

## Capacidades

- Predicción de desequilibrio alélico (allelic imbalance) en señal ATAC para SNV heterocigotos sobre genomas personales diploides.
- Predicción de unión (binding) a partir de secuencia de referencia mediante el brazo trunk, utilizable de forma independiente.
- Procesamiento de pares de ventanas genómicas de 257 pb centradas en la variante.
- Generalización a otros donantes del consorcio EN-TEx más allá del donante de entrenamiento.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de visión, audio o thinking mode.
- No dispone de modo generativo de texto.

## Casos de uso

- Priorización de variantes reguladoras: dado un conjunto de SNV heterocigotos, el modelo puntúa cuáles tienen más probabilidad de mostrar unión diferencial en ATAC, lo que permite filtrar variantes candidatas antes de validación experimental.
- Interpretación de genomas personales faseados: al operar sobre pares de ventanas haplotípicas, encaja en pipelines que ya disponen de faseo (phasing) y buscan anotación funcional a nivel de alelo.
- Estudio de efectos de variantes en accesibilidad de cromatina: el brazo trunk puede emplearse como predictor de señal ATAC a partir de secuencia de referencia para comparar regiones o genotipos.
- Análisis de eQTL/regulación en cohorts EN-TEx: la generalización reportada a otros donantes permite aplicar los checkpoints a muestras no vistas del mismo consorcio.
- Investigación en genómica funcional comparativa: comparar las puntuaciones entre donantes (ENC-001 a ENC-004) para estudiar variabilidad interindividual en unión específica de alelo.
- Filtrado previo en estudios de asociación: reducir el espacio de variantes a analizar experimentalmente mediante la puntuación de magnitud, siempre como paso de investigación y no clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al paper en preparación y no duplica cifras por ensayo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el backbone DNABERT-2-117M es ligero (del orden de cientos de MB en precisión reducida), pero el repositorio completo ocupa 1,9 GB y la carga requiere tanto el trunk como la cabeza personal.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del backbone, una GPU consumer moderna es suficiente, aunque no se confirma.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del encoder de 117 M de parámetros, pero no confirmado en la documentación.
- Opciones de despliegue: la carga se realiza mediante el paquete `hapadapter` (`load_model_and_tokenizer`), no mediante `AutoModel` de `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hapadapter-as-atac | no disponible (backbone 117 M) | 257 pb por ventana | Desequilibrio alélico ATAC en genomas personales | MIT | Hugging Face |
| DNABERT-2 | 117 M | variable (secuencia de ADN) | Embeddings de ADN de propósito general | no disponible en esta ficha | Hugging Face |
| Otros adaptadores genómicos específicos de alelo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- La puntuación de la cabeza es simétrica: no indica qué haplotipo une más, solo la magnitud del desequilibrio.
- Entrada restringida a ventanas de 257 pb; longitudes distintas quedan fuera de distribución.
- Cada checkpoint se entrena con un único ensayo y un único donante, aunque se reporta generalización a otros donantes EN-TEx.
- Uso exclusivamente de investigación; no validado para interpretación clínica o diagnóstica de variantes humanas.
- No es un `AutoModel`: requiere la librería `hapadapter` y la carga conjunta de trunk y cabeza personal.
- Durante la carga, `transformers` emite advertencias esperadas (pesos del cabezal MLM no usados, pooler inicializado aleatoriamente y mensaje de "deberías entrenar"); el autor indica que deben ignorarse.
- No se documentan sesgos, tasas de alucinación (no aplica al no ser generativo) ni limitaciones idiomáticas.
- La licencia MIT permite uso comercial, pero la advertencia de uso solo en investigación debe respetarse para interpretación clínica.
- No hay información sobre calibración de las puntuaciones ni umbrales recomendados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ametrick-system/hapadapter-as-atac
- DNABERT-2 (backbone de referencia): https://huggingface.co/zhihan1996/DNABERT-2-117M
- Paper: en preparación según la model card (no disponible URL)
- Repositorio o demo del paquete `hapadapter`: no disponible en la información proporcionada
