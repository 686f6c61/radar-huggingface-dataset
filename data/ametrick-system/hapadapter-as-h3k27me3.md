# ametrick-system/hapadapter-as-h3k27me3

## Resumen

hapadapter-as-h3k27me3 es una colección de cabezas adaptadoras (adapter heads) para predecir desequilibrio alélico en la marca epigenética H3K27me3 sobre genomas personales diploides. Lo desarrolla el usuario ametrick-system y se construye sobre un codificador DNABERT-2 de 117 millones de parámetros, afinado para regresar la señal de H3K27me3 a partir de secuencia de referencia. El modelo resuelve un problema concreto de genómica funcional: dado un SNV heterocigoto, determinar si los dos haplotipos muestran unión diferencial (allele-specific binding) en esa marca de represión transcripcional.

El repositorio contiene ocho subcarpetas organizadas por donante (ENC-001 a ENC-004) y por brazo experimental: `dnabert2-trunk/`, que es el modelo de unión afinado sobre secuencia de referencia y utilizable de forma independiente, y `dnabert2-personal/`, la cabeza adaptadora entrenada sobre ventanas extraídas del genoma faseado del propio donante. La entrada es siempre un par de ventanas de 257 pb centradas en la variante, una por haplotipo.

Es relevante porque aborda la interpretación funcional de variantes no codificantes en contexto personalizado, un terreno donde los modelos genómicos generalistas rara vez llegan al nivel de alelo. No obstante, es un artefacto de investigación con cero descargas y sin paper publicado todavía, por lo que su madurez y validación externa son limitadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DNABERT-2 (encoder transformer tipo BERT) con cabeza siamesa adaptadora |
| Parámetros totales | no disponible (el backbone DNABERT-2 es de 117 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 257 pb por ventana de entrada (par de ventanas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de secuencia de ADN, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 1,9 GB) |

## Arquitectura y entrenamiento

El modelo combina un codificador DNABERT-2 preentrenado (117 M de parámetros, tokenización de k-mers sobre ADN) afinado para regresión de señal H3K27me3 desde secuencia de referencia, más una cabeza siamesa que opera sobre dos embeddings agrupados (pooled), uno por haplotipo. La readout se define como `ell = softplus(a) * ||P(h_1) - P(h_2)|| + b`, donde `P` es la proyección del embedding agrupado de cada ventana haplotípica. Al basarse en una distancia entre embeddings, la puntuación es simétrica: mide magnitud de desequilibrio, no dirección.

Cada checkpoint se entrena con un único ensayo y un único donante, aunque el autor reporta buena generalización a otros donantes del consorcio EN-TEx. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este dominio). Tampoco se detalla la estrategia de pooling concreta alrededor de la variante más allá de que no emplea el pooler de BERT.

## Capacidades

- Predicción de desequilibrio alélico en H3K27me3 para SNVs heterocigotos sobre genomas personales diploides.
- Regresión de señal H3K27me3 desde secuencia de referencia mediante el brazo `trunk`, utilizable como predictor de unión independiente.
- Procesamiento de pares de ventanas genómicas de 257 pb, una por haplotipo.
- Modelado específico de donante mediante el brazo `personal`, entrenado sobre el genoma faseado de cada individuo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de dominio biológico, no un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Priorización de variantes no codificantes: dado un conjunto de SNVs heterocigotos de un individuo, el modelo puntúa cuáles presentan mayor probabilidad de desequilibrio alélico en H3K27me3, ayudando a seleccionar candidatos para validación experimental con ChIP-seq o reporteros.
- Interpretación de GWAS en regiones reguladoras: para variantes asociadas a fenotipo situadas en dominios H3K27me3, el modelo aporta una señal funcional alélica que complementa anotaciones tipo ENCODE.
- Análisis de represión mediada por Polycomb: al centrarse en H3K27me3, marca depositada por PRC2, permite estudiar cómo variantes afectan al silenciamiento de loci concretos en un genoma personal.
- Investigación en epigenética de población: comparando los cuatro donantes disponibles se pueden explorar diferencias interindividuales en la arquitectura de unión alélica.
- Generación de hipótesis en estudios EN-TEx: el brazo `trunk` permite predecir señal de referencia para regiones sin datos experimentales, como paso previo a la comparación con el brazo `personal`.
- Filtrado en pipelines de secuenciación personalizada: integrado tras el llamado de variantes y el faseado, el modelo puede enriquecer listas de variantes candidatas antes de análisis costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al paper (en preparación) y no duplica cifras por ensayo.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone DNABERT-2 de 117 M en fp32 ocupa del orden de 0,5 GB de pesos; con overhead de activaciones y la cabeza siamesa, una GPU con 4-8 GB es suficiente. El tamaño del repo (1,9 GB) incluye los ocho checkpoints, no un único modelo.
- GPU recomendadas: cualquier GPU con al menos 8 GB, como RTX 3060/4060, RTX 4090, A100 o H100; no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: carga mediante el paquete `hapadapter` (`load_model_and_tokenizer`), que resuelve el backbone desde `dnabert2-trunk/`; no es un `AutoModel` de transformers y no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hapadapter-as-h3k27me3 | Cabeza siamesa sobre DNABERT-2 para ASB en H3K27me3 | no disponible (backbone 117 M) | 257 pb por ventana | MIT | Hugging Face (0 descargas) |
| DNABERT-2 | Encoder de ADN preentrenado | 117 M | hasta 512 tokens de k-mer | MIT | Hugging Face, ampliamente usado |
| Nucleotide Transformer | Encoder de ADN preentrenado | 500 M a 2,5 B | hasta 12 kb | varias (según variante) | Hugging Face |
| Enformer | Transformer para predicción de tracks epigenéticos | ~250 M | 200 kb | Apache 2.0 | GitHub, Hugging Face |

La comparación directa es limitada: hapadapter-as-h3k27me3 no es un modelo base sino un adaptador especializado en una tarea muy concreta (desequilibrio alélico en una marca), mientras que los demás son encoders o predictores generalistas de tracks. No se dispone de cifras de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- La readout es simétrica: el modelo indica magnitud de desequilibrio, pero no qué haplotipo une más. Para dirección se requiere información adicional o un diseño distinto.
- Entrenado con un único ensayo y un único donante por checkpoint; la generalización reportada a otros donantes EN-TEx no está cuantificada en la información disponible.
- Solo acepta ventanas de 257 pb; entradas de otra longitud quedan fuera de distribución.
- Uso exclusivamente de investigación: no validado para interpretación clínica ni diagnóstica de variantes humanas.
- Sin paper publicado (en preparación) ni benchmarks públicos; cero descargas y cero likes, sin validación comunitaria.
- Riesgo de sobreajuste al donante y al ensayo concreto, dado el diseño personal por individuo.
- Licencia MIT permite uso comercial, pero la ausencia de validación y la naturaleza del dominio desaconsejan aplicaciones en producción sin evaluación propia.
- No es un modelo de lenguaje: no debe emplearse para tareas de texto, código o razonamiento general.

## Enlaces

- Hugging Face: https://huggingface.co/ametrick-system/hapadapter-as-h3k27me3
- Backbone DNABERT-2: https://huggingface.co/zhihan1996/DNABERT-2-117M
- Paper: no disponible (en preparación según la model card)
