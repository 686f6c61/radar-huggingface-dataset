# hnhung/viexdp-bartpho-word-base-tgt-aug-5e-05-20261025045409

## Resumen

`viexdp-bartpho-word-base-tgt-aug-5e-05-20261025045409` es un ajuste fino (fine-tuning) del modelo `vinai/bartpho-word-base`, un encoder-decoder de tipo BART adaptado al vietnamita mediante tokenización por palabras (word segmentation). El modelo lo publica el usuario `hnhung` en Hugging Face y está pensado para tareas de generación texto-a-texto (text2text-generation), presumiblemente en el ámbito del procesamiento del vietnamita, aunque la model card no documenta el conjunto de datos ni el objetivo concreto del ajuste.

Se trata de un modelo pequeño: 150.044.427 parámetros totales en formato safetensors, lo que lo sitúa en la gama de los ~150M de parámetros, típica de la familia BART-base. El repositorio ocupa 4,8 GB, un tamaño desproporcionado respecto a los pesos, probablemente por incluir checkpoints intermedios del entrenamiento. La licencia es MIT, lo que permite uso comercial sin restricciones significativas.

La relevancia de este modelo es limitada y muy específica: es un artefacto de investigación derivado de un entrenamiento automático (generated_from_trainer) con hiperparámetros documentados pero sin evaluación cualitativa ni benchmarks publicados. Resulta útil como referencia para reproducir el proceso de fine-tuning sobre BARTpho, pero no como modelo de producción sin una validación adicional por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BART (encoder-decoder transformer), variante BARTpho-word |
| Parámetros totales | 150.044.427 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BARTpho-word-base emplea 1024 tokens de posición máxima; el autor no lo declara) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | no disponible (el modelo base está orientado al vietnamita) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `vinai/bartpho-word-base` es un BART-base adaptado al vietnamita. BART es un transformer encoder-decoder con atención bidireccional en el encoder y autorregresiva en el decoder, preentrenado con objetivos de denoising (corrupción de texto y reconstrucción). La variante `word` aplica segmentación de palabras vietnamitas antes de la tokenización, lo que permite manejar mejor las palabras compuestas del idioma. El modelo base cuenta con 12 capas en encoder y 12 en decoder, con un tamaño oculto típico de 768 y 16 cabezas de atención, coherente con los ~150M de parámetros reportados.

El ajuste fino se realizó con el Trainer de Hugging Face (Transformers 4.57.6, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.22.2). Los hiperparámetros documentados son: learning rate 5e-05, batch size de entrenamiento y evaluación de 16, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup ratio de 0,1, semilla 42 y 8 épocas. El conjunto de datos de entrenamiento no se especifica ("unknown dataset"). No se documenta RLHF, DPO ni ninguna innovación técnica adicional. La pérdida de validación mínima se alcanza en la época 3 (2,3296) y a partir de ahí se produce sobreajuste progresivo (2,4770 al final).

## Capacidades

- Generación de texto condicionada (text2text): el modelo es un encoder-decoder, por lo que puede realizar tareas de transformación de secuencias (resumen, paráfrasis, traducción, corrección) si el ajuste fino lo ha orientado a ello.
- Procesamiento de vietnamita: hereda del modelo base la tokenización por palabras del vietnamita, lo que mejora el tratamiento de palabras compuestas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; el modelo base está especializado en vietnamita.
- No se documenta modo thinking, visión ni audio.
- Capacidad de generación condicionada por prompt: al ser un modelo seq2seq, la calidad depende enteramente del ajuste fino, que no está descrito.

## Casos de uso

- Reproducción de experimentos de fine-tuning sobre BARTpho: el modelo sirve como referencia para validar pipelines de entrenamiento con los hiperparámetros documentados (lr 5e-05, 8 épocas, AdamW fused) y comparar curvas de pérdida.
- Investigación sobre tokenización por palabras en vietnamita: permite estudiar cómo afecta la segmentación de palabras al rendimiento en tareas generativas, comparando con variantes `syllable` del mismo modelo base.
- Generación de texto en vietnamita en entornos controlados: si el ajuste fino se orientó a una tarea concreta (no documentada), puede emplearse para generar borradores o transformaciones de texto, siempre con validación humana.
- Base para un segundo ajuste fino: al ser un checkpoint pequeño (150M) y con licencia MIT, puede servir como punto de partida para tareas específicas con datos propios.
- Experimentación académica con modelos seq2seq de bajo coste: cabe en GPUs de consumo y permite iterar rápidamente en entornos de investigación con recursos limitados.
- Evaluación de sobreajuste y regularización: la curva de pérdida documentada (mínimo en época 3, degradación posterior) lo convierte en un caso de estudio útil para técnicas de early stopping.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index del autor está vacío (`results: []`) y la model card solo reporta la pérdida de validación.

| Métrica | Valor |
|---|---|
| Pérdida de validación (época 1) | 2,5174 |
| Pérdida de validación (época 2) | 2,3680 |
| Pérdida de validación (época 3) | 2,3296 (mínimo) |
| Pérdida de validación (época 4) | 2,3730 |
| Pérdida de validación (época 5) | 2,3754 |
| Pérdida de validación (época 6) | 2,4331 |
| Pérdida de validación (época 7) | 2,4546 |
| Pérdida de validación (época 8) | 2,4770 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB solo para pesos (150M × 4 bytes); con activaciones y overhead, alrededor de 1-1,5 GB.
- VRAM estimada en fp16/bf16: unos 0,3 GB para pesos; en la práctica, 0,8-1,2 GB con overhead.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,15 GB para pesos; 0,5-0,8 GB en total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100 sin problema.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (Pipeline de text2text-generation), vLLM (soporte de encoder-decoder limitado según versión), TGI, llama.cpp (conversión a GGUF necesaria, no documentada por el autor), Ollama (requiere GGUF).
- Latencia y throughput: no disponibles; al ser un modelo de 150M, se espera un throughput alto en GPU moderna (cientos de tokens por segundo en batch), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hnhung/viexdp-bartpho-word-base-tgt-aug-5e-05-20261025045409 | 150M | no disponible | MIT | Hugging Face | Fine-tuning sin dataset documentado |
| vinai/bartpho-word-base | ~150M | 1024 tokens (típico BART) | MIT | Hugging Face | Modelo base, preentrenado en vietnamita con segmentación por palabras |
| vinai/bartpho-syllable-base | ~150M | 1024 tokens (típico BART) | MIT | Hugging Face | Variante con tokenización por sílabas |
| VietAI/vit5-base | ~220M | 512 tokens (típico T5) | MIT | Hugging Face | Alternativa encoder-decoder para vietnamita basada en T5 |

La comparación directa con benchmarks no es posible porque el modelo no publica resultados. Frente al modelo base, la única diferencia documentada es el ajuste fino con 8 épocas y la pérdida de validación resultante; no hay evidencia de mejora en tareas concretas.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento es desconocido, por lo que no se puede evaluar qué tarea aprende ni con qué sesgos.
- La pérdida de validación se degrada a partir de la época 3, lo que indica sobreajuste; el checkpoint final (época 8) no es el óptimo según la propia curva del autor.
- No hay benchmarks ni evaluación cualitativa publicada; el rendimiento real en cualquier tarea es desconocido.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la falta de evaluación.
- El modelo base está especializado en vietnamita; el rendimiento en otros idiomas, incluido el castellano, es presumiblemente muy pobre.
- La longitud de contexto no está declarada por el autor; hay que asumir la del modelo base (1024 tokens en BARTpho), lo que limita entradas largas.
- La licencia MIT permite uso comercial, pero la falta de documentación sobre el dataset de entrenamiento impide descartar problemas de procedencia de datos.
- El tamaño del repositorio (4,8 GB) sugiere checkpoints intermedios; conviene verificar qué archivos se descargan antes de desplegar.
- No apto para producción sin una evaluación previa sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hnhung/viexdp-bartpho-word-base-tgt-aug-5e-05-20261025045409
- Modelo base: https://huggingface.co/vinai/bartpho-word-base
- Repositorio del modelo base (GitHub): https://github.com/VinAIResearch/BARTpho
- Paper de BARTpho: https://arxiv.org/abs/2109.09701
- Paper de BART: https://arxiv.org/abs/1910.13461
