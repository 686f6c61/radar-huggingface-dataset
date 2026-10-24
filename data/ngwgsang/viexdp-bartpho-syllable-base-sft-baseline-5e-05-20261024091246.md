# ngwgsang/viexdp-bartpho-syllable-base-sft-baseline-5e-05-20261024091246

## Resumen

`ngwgsang/viexdp-bartpho-syllable-base-sft-baseline-5e-05-20261024091246` es un checkpoint de ajuste supervisado (SFT) obtenido a partir de `vinai/bartpho-syllable-base`, el modelo encoder-decoder BART preentrenado por VinAI para vietnamita con tokenización a nivel de sílaba. Lo publica el usuario `ngwgsang` el 24 de octubre de 2026 bajo licencia MIT, con 131.603.038 parámetros y pesos en safetensors, y está pensado como ejecución de referencia ("baseline") dentro de una batería de experimentos con distintas tasas de aprendizaje.

El modelo resuelve, en teoría, tareas genéricas de generación texto-a-texto en vietnamita: resumen, paráfrasis, normalización y reescritura. Sin embargo, la model card se ha generado automáticamente con el `Trainer` de Hugging Face y no documenta el conjunto de datos de entrenamiento, los usos previstos ni ninguna evaluación. No declara resultados en el `model-index` y acumula cero descargas, por lo que debe tratarse como un artefacto de reproducibilidad, no como un modelo listo para producción.

Su relevancia actual es limitada y muy específica: sirve para inspeccionar la receta de entrenamiento (8 épocas, lr 5e-05, batch 16, 2.784 pasos), comparar curvas de pérdida frente a otros checkpoints de la misma familia y como punto de partida para replicar experimentos. La pérdida de validación mínima es 2,0033 en la época 3 y sube hasta 2,1367 en la época 8, señal clara de sobreajuste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo BART (BARTpho, tokenización por sílabas) |
| Parametros totales | 131.603.038 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; la implementación BART original usa 1024 posiciones absolutas y este checkpoint no declara un valor distinto |
| Tipos de cuantizacion | no se distribuyen pesos cuantizados; al ser un modelo de 131 M de parámetros es cuantificable a int8/int4 con PyTorch o ONNX Runtime (no verificado por el autor) |
| Idiomas soportados | no declarados en los metadatos; el modelo base está preentrenado únicamente en vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (con `config.json` y tokenizer de `transformers`) |
| Tarea declarada | `text2text-generation` |
| Framework de entrenamiento | Transformers 4.57.6, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.22.2 |
| Tamaño del repositorio | 4,2 GB (incluye artefactos de entrenamiento, no solo los pesos) |
| Fecha de publicación | 2026-10-24 |

## Arquitectura y entrenamiento

La arquitectura es la de BARTpho en su variante `base`: un transformer encoder-decoder con preentrenamiento desnoising al estilo BART, adaptado al vietnamita mediante una tokenización a nivel de sílaba en lugar de a nivel de palabra. Con 131,6 M de parámetros, el coste de inferencia es bajo y el modelo cabe holgadamente en cualquier GPU de consumo, pero hereda las limitaciones del preentrenamiento original: es monolingüe y su ventana efectiva viene determinada por los embeddings posicionales de BART.

El ajuste se realizó con `Trainer` sobre un dataset no identificado, durante 8 épocas y 2.784 pasos, con learning rate 5e-05, batch de 16 en entrenamiento y evaluación, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-08), scheduler lineal con `warmup_ratio` 0,1 y semilla 42. No se documenta ninguna fase de RLHF, DPO o ajuste por preferencias, ni técnicas de decodificación especulativa. La pérdida de validación toca mínimo en la época 3 (2,0033) y repunta después hasta 2,1367, lo que indica que el checkpoint final está sobreajustado y que, paradójicamente, una época intermedia habría sido mejor candidata.

## Capacidades

- Generación de texto texto-a-texto en vietnamita: resumen, paráfrasis, reescritura y normalización de frases.
- Segmentación y manipulación a nivel de sílaba, gracias al tokenizador de BARTpho-syllable.
- Reescritura de documentos con registro formal o informal, siempre que se le proporcione el estilo deseado en el prompt de entrada.
- Generación de variantes de una misma frase para aumento de datos o para tareas de consistencia textual.
- No soporta tool calling ni function calling: no hay plantilla de herramientas ni entrenamiento orientado a agentes.
- No soporta razonamiento multi-paso explícito, modo "thinking", visión, audio ni entrada multimodal.
- Capacidad multilingüe: no disponible; el modelo base es monolingüe vietnamita y este checkpoint no declara idiomas adicionales.
- No se han publicado evaluaciones de sus capacidades reales; las anteriores son funciones teóricas derivadas de la arquitectura y del modelo base.

## Casos de uso

- Resumen de documentos administrativos vietnamitas: al ser un encoder-decoder de 131 M, se puede desplegar en CPU para resumir actas, correos o informes cortos, con la ventaja de un coste por token muy bajo y la desventaja de una calidad no verificada.
- Normalización de corpus vietnamitas: reescritura de texto con diacríticos inconsistentes, abreviaturas o ruido de OCR hacia una forma canónica, aprovechando la tokenización por sílabas.
- Aumento de datos para entrenamiento: generar paráfrasis controladas de frases etiquetadas para ampliar datasets de clasificación o extracción de información en vietnamita.
- Generación de titulares y resúmenes de una línea: integración en un pipeline de publicación donde se necesita condensar noticias o descripciones de producto, con revisión humana obligatoria.
- Reescritura de consultas en buscadores: reformular preguntas de usuarios vietnamitas para mejorar la recuperación en un motor de búsqueda interno, siempre con evaluación A/B previa.
- Limpieza y estandarización de bases de conocimiento: convertir pares pregunta-respuesta heterogéneos en un formato uniforme antes de indexarlos.
- Baseline de experimentación: punto de comparación reproducible para medir el efecto de cambios en la tasa de aprendizaje, el número de épocas o la composición del dataset en la familia BARTpho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card contiene una entrada con la lista `results` vacía, por lo que no hay MMLU, HumanEval, GSM8K ni métricas de resumen o traducción que se puedan citar.

Los únicos datos cuantitativos son las curvas de pérdida del entrenamiento, que no constituyen un benchmark y no permiten comparar con otros modelos:

| Epoca | Paso | Pérdida de entrenamiento | Pérdida de validación |
|---|---|---|---|
| 1 | 348 | 2,1122 | 2,1009 |
| 2 | 696 | 1,8099 | 2,0213 |
| 3 | 1044 | 1,5303 | 2,0033 |
| 4 | 1392 | 1,2522 | 2,0459 |
| 5 | 1740 | 1,0388 | 2,0637 |
| 6 | 2088 | 0,9016 | 2,1130 |
| 7 | 2436 | 0,8551 | 2,1259 |
| 8 | 2784 | 0,7360 | 2,1367 |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan unos 526 MB; en bf16/fp16, unos 263 MB; en int8, unos 132 MB. Con activaciones y overhead de runtime, el consumo realista se sitúa entre 1 y 2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100; en estas dos últimas el cuello de botella será el overhead de serving, no el cómputo.
- Cabe en GPU de consumo: sí, en prácticamente todas, incluidas GTX 1650, RTX 3050 y GPUs integradas con memoria unificada. También es viable en CPU para cargas por lotes.
- Opciones de despliegue: `transformers` con `pipeline("text2text-generation")` como referencia; exportación a ONNX Runtime para inferencia en CPU; TorchServe o FastAPI para servicio HTTP. El soporte de BART en vLLM y TGI es limitado y depende de la versión, por lo que conviene verificar la compatibilidad antes de adoptarlos. llama.cpp no ofrece soporte nativo de BART.
- Latencia y throughput: no disponible; no hay mediciones publicadas. Al tratarse de un modelo de 131 M de parámetros, el rendimiento vendrá dominado por el tamaño del lote y por el número de tokens generados, no por la GPU.
- El repositorio ocupa 4,2 GB, pero ese tamaño corresponde a artefactos de entrenamiento; para servir el modelo basta con los safetensors, de aproximadamente 0,5 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Este checkpoint | 131,6 M | vietnamita (heredado) | no disponible | MIT | checkpoint SFT sin documentar ni evaluar |
| `vinai/bartpho-syllable-base` | 131,6 M | vietnamita | 1024 posiciones (BART) | MIT | modelo base preentrenado, documentado por VinAI |
| `vinai/bartpho-word-base` | ~131 M | vietnamita | 1024 posiciones (BART) | MIT | variante con tokenización por palabras |
| `VietAI/vit5-base` | ~220 M | vietnamita | no disponible | MIT | alternativa T5 preentrenada en vietnamita |
| `facebook/mbart-large-50` | ~610 M | 50 idiomas | 1024 posiciones | MIT | modelo multilingüe, mucho más pesado |

La comparación relevante es contra el modelo base: este checkpoint añade un ajuste supervisado del que no se conoce el dataset, con pérdida de validación de 2,1367 y sobreajuste a partir de la época 3. Frente a ViT5 o mBART, la única ventaja objetiva es el menor tamaño y el coste de inferencia, no la calidad, que no está medida.

## Limitaciones y advertencias

- Model card autogenerada: no documenta dataset, usos previstos, limitaciones ni evaluación. No hay forma de saber qué datos vio el modelo durante el SFT.
- Sin benchmarks: el `model-index` está vacío, de modo que cualquier afirmación sobre calidad sería especulativa.
- Sobreajuste: la pérdida de validación mínima es 2,0033 en la época 3 y asciende a 2,1367 en la época 8; el checkpoint publicado es el peor de la curva en validación.
- Idiomas: no se declaran idiomas en los metadatos y el modelo base es monolingüe vietnamita. No debe usarse para otros idiomas sin evaluación previa.
- Contexto limitado por la arquitectura BART; no se declara una ventana específica y no es adecuado para documentos largos sin troceado.
- Riesgo de alucinación inherente a un modelo generativo de 131 M entrenado con SFT: puede inventar contenido en resúmenes y reescrituras, especialmente con entradas fuera de distribución.
- Sesgos: no se ha realizado ninguna auditoría de sesgos; el modelo hereda los del corpus vietnamita usado por VinAI y los del dataset de SFT, que se desconoce.
- Licencia MIT para este checkpoint, pero conviene revisar los términos del modelo base y de los datos de entrenamiento antes de un uso comercial.
- Cero descargas y cero valoraciones: no hay evidencia de uso real ni de validación por parte de la comunidad.
- No apto para producción sin una evaluación propia en la tarea objetivo y sin una fase de alineación adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ngwgsang/viexdp-bartpho-syllable-base-sft-baseline-5e-05-20261024091246)
- [Modelo base vinai/bartpho-syllable-base](https://huggingface.co/vinai/bartpho-syllable-base)
- [Documentación de BARTpho en Transformers](https://huggingface.co/docs/transformers/model_doc/bartpho)
- [Repositorio oficial de BARTpho (VinAIResearch)](https://github.com/VinAIResearch/BARTpho)
- [Checkpoint relacionado del mismo autor: src-tgt](https://huggingface.co/ngwgsang/viexdp-bartpho-syllable-base-src-tgt-5e-05-20261023162426)
- [Ficha de bartpho-syllable en aibase](https://model.aibase.com/models/details/1915693990932013058)
- [Ficha de bartpho-syllable-base en aibase](https://model.aibase.com/models/details/1924737421531156480)
