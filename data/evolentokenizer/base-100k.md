# EvoLenTokenizer/base-100k

## Resumen

El modelo `EvoLenTokenizer/base-100k` es un modelo de lenguaje enmascarado basado en la arquitectura BERT-base, entrenado sobre secuencias de ADN del genoma humano de referencia (hg38). Ha sido desarrollado por el equipo de EvoLen como parte del estudio *EvoLen: Evolution-Guided Tokenization for DNA Language Model*, aceptado en COLM 2026. El modelo utiliza un tokenizador propio que combina estratificación evolutiva (basada en conservación phyloP) con decodificación sensible a la longitud, lo que permite representar el genoma de forma más eficiente que los tokenizadores BPE convencionales.

Con 89,98 millones de parámetros y una ventana de contexto de 512 tokens, este modelo está diseñado como base para tareas de aprendizaje automático en genómica, como la clasificación de elementos reguladores o el análisis de accesibilidad de cromatina (ATAC-seq). Su relevancia radica en que introduce una tokenización guiada por evolución, un enfoque novedoso que mejora la representación de regiones conservadas y no conservadas del genoma. El modelo se distribuye bajo licencia MIT y está disponible en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT-base (12 capas, 768 unidades ocultas, 12 cabezas de atención) |
| Parámetros totales | 89.980.160 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (ventanas de tokenización) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo entrenado en secuencias de ADN) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT-base estándar: 12 capas de transformer, 768 dimensiones ocultas y 12 cabezas de atención. Se entrenó con el objetivo de modelado de lenguaje enmascarado (masked language modeling) sobre secuencias de ADN tokenizadas en ventanas de 512 tokens. El vocabulario del tokenizador es de 5.120 tokens, generado mediante el algoritmo EvoLen, que particiona el genoma según la conservación evolutiva (phyloP) y aplica una decodificación sensible a la longitud.

El entrenamiento se realizó con un tamaño de lote de 96 por dispositivo, 8 dispositivos en paralelo (lote total efectivo de 768), optimizador Adam con betas (0.9, 0.98) y épsilon 1e-06, programador de tasa de aprendizaje lineal con 10.000 pasos de calentamiento y un total de 100.000 pasos. La tasa de aprendizaje inicial fue de 4e-05. Los datos de entrenamiento provienen del genoma humano hg38, y la evaluación se realizó sobre una partición reservada del mismo corpus. Los resultados de evaluación reportados son: pérdida 5.0825, precisión 0.2308 y perplejidad 161.17.

## Capacidades

- Extracción de características (feature extraction) para secuencias de ADN, útil como modelo base para tareas posteriores.
- Modelado de lenguaje enmascarado (fill-mask) sobre ADN, permitiendo predecir tokens enmascarados en secuencias genómicas.
- Fine-tuning para tareas de clasificación de elementos reguladores, como promotores, potenciadores o regiones de cromatina abierta (ATAC-seq).
- Representación de secuencias de ADN con tokenización guiada por conservación evolutiva, lo que mejora la captura de regiones funcionales conservadas.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo de embeddings, no generativo.
- No es multilingüe en el sentido de idiomas humanos; está especializado en el alfabeto genético (A, C, G, T).

## Casos de uso

- Clasificación de elementos reguladores: el modelo puede fine-tuning sobre conjuntos de datos de ATAC-seq o ChIP-seq para identificar regiones de cromatina abierta o sitios de unión de factores de transcripción. Su tokenización basada en conservación ayuda a destacar regiones funcionales.
- Predicción de efectos de variantes genéticas: al enmascarar posiciones específicas, el modelo puede estimar la probabilidad de diferentes alelos y así evaluar el impacto potencial de variantes en regiones reguladoras.
- Análisis de conservación evolutiva: las representaciones generadas pueden utilizarse para comparar regiones ortólogas entre especies, aprovechando la información de phyloP integrada en el tokenizador.
- Extracción de características para modelos downstream: las representaciones de secuencia (embeddings) pueden alimentar clasificadores o redes neuronales para tareas como predicción de splicing o anotación de genes.
- Estudio de interacciones proteína-ADN: las representaciones pueden combinarse con datos de unión de proteínas para modelar preferencias de unión de factores de transcripción.
- Anotación de genomas: el modelo puede ayudar a identificar regiones codificantes o no codificantes mediante fine-tuning en datos anotados, mejorando la precisión en genomas humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la información disponible. La model card no incluye métricas de referencia (model-index vacío). Sin embargo, el autor reporta los siguientes resultados de evaluación sobre la partición reservada del corpus de entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida (loss) | 5.0825 |
| Precisión (accuracy) | 0.2308 |
| Perplejidad | 161.17 |

Estos valores indican que el modelo es un modelo base sin fine-tuning, con una precisión de enmascarado relativamente baja, lo que es esperable en un modelo preentrenado sobre un corpus complejo como el genoma humano.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener ~90 millones de parámetros, el modelo ocupa aproximadamente 360 MB en fp32 y 180 MB en fp16. Con cuantización a 8 bits, podría reducirse a ~90 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo tarjetas consumer como NVIDIA GTX 1060, RTX 3060, RTX 4090, o incluso CPUs con suficiente RAM.
- Cabe en GPUs consumer de gama baja; no requiere hardware especializado.
- Opciones de despliegue: se puede usar con la librería Transformers de Hugging Face, o mediante servidores de inferencia como vLLM o TGI, aunque al ser un modelo pequeño, también es viable con llama.cpp o ONNX Runtime.
- Latencia y throughput: no se dispone de datos medidos, pero al ser un modelo BERT-base, la inferencia es rápida en GPU moderna (del orden de milisegundos por secuencia de 512 tokens).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de ADN en la información proporcionada. Modelos similares en la categoría de modelos de lenguaje genómico incluyen DNABERT, Nucleotide Transformer o HyenaDNA, pero no se han encontrado métricas comparativas publicadas en las fuentes consultadas. La comparativa queda pendiente de futuras publicaciones del equipo de EvoLen.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con el genoma humano (hg38), por lo que no generaliza bien a otros organismos sin un fine-tuning adicional.
- La precisión de enmascarado es baja (0.2308), lo que sugiere que el modelo es un punto de partida y no un sistema listo para producción sin adaptación.
- El vocabulario de 5.120 tokens puede ser limitado para representar la diversidad de secuencias genómicas, especialmente en regiones no conservadas.
- No es un modelo generativo; no puede producir secuencias de ADN de novo, solo representaciones y predicciones de tokens enmascarados.
- Aunque la licencia MIT permite uso comercial, el modelo está orientado a investigación y no se han documentado garantías de rendimiento en entornos clínicos o de diagnóstico.
- Los resultados de evaluación provienen de una partición del mismo corpus de entrenamiento, por lo que pueden no reflejar el rendimiento en datos externos.

## Enlaces

- Hugging Face: https://huggingface.co/EvoLenTokenizer/base-100k
- Paper (arXiv): https://arxiv.org/abs/2604.08698
- Repositorio GitHub: https://github.com/HN020719/EvoLen
- Checkpoints SFT (relacionados): https://huggingface.co/EvoLenTokenizer/evolen-100k-sft-checkpoints
