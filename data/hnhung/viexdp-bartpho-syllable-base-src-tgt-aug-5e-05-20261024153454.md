# hnhung/viexdp-bartpho-syllable-base-src-tgt-aug-5e-05-20261024153454

## Resumen

`hnhung/viexdp-bartpho-syllable-base-src-tgt-aug-5e-05-20261024153454` es un modelo de generación texto-a-texto obtenido por ajuste fino (*fine-tuning*) del checkpoint `vinai/bartpho-syllable-base`, el modelo seq2seq preentrenado a gran escala para vietnamita desarrollado por VinAI Research. El resultado es un checkpoint de 131.610.728 parámetros, publicado en HuggingFace con licencia MIT y pesos en safetensors, pensado para tareas de transformación entre una secuencia origen y una secuencia destino (de ahí el sufijo `src-tgt` del identificador).

El interés práctico del modelo es doble. Por un lado, demuestra el flujo habitual de especialización de un encoder-decoder BART para vietnamita: se parte de un modelo base monolingüe ya preentrenado con el esquema de *denoising* de BART y se ajusta con un conjunto de datos que el autor no documenta. Por otro, el identificador delata un experimento dentro de una batería de pruebas: incluye la tasa de aprendizaje (`5e-05`), la marca temporal de ejecución (`20261024153454`) y una etiqueta de aumento de datos (`aug`), lo que sugiere una búsqueda de hiperparámetros o un *sweep* sobre datos aumentados.

Conviene ser explícito sobre su madurez: la *model card* es la generada automáticamente por `Trainer` y no documenta el conjunto de datos, la tarea concreta ni los usos previstos. Solo declara una pérdida de validación final de 2,0872 tras 8 épocas. Se trata, por tanto, de un checkpoint de investigación reproducible, no de un modelo listo para producción sin una evaluación previa por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo BART (seq2seq, denoising), variante syllable de BARTpho; tag de libreria `mbart` en HuggingFace |
| Parametros totales | 131.610.728 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la model card no lo documenta) |
| Tipos de cuantizacion | no disponible (no hay cuantizaciones publicadas; al ser un modelo `transformers` puede cuantizarse manualmente a INT8/INT4 con bitsandbytes o herramientas equivalentes) |
| Idiomas soportados | no disponible en la model card; el modelo base BARTpho es un modelo monolingue preentrenado para vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (tag de la libreria); el repositorio ocupa 4,2 GB e incluye artefactos de entrenamiento ademas de los pesos |
| Modelo base | vinai/bartpho-syllable-base |
| Tarea declarada | text2text-generation |
| Fecha de creacion | 2026-10-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es BARTpho en su variante *syllable*: un transformer encoder-decoder con el esquema de preentrenamiento por *denoising* de BART, adaptado al vietnamita y tokenizado a nivel de sílaba en lugar de palabra. El modelo base fue desarrollado por VinAI Research y presentado como el primer conjunto de modelos seq2seq monolingües a gran escala para vietnamita, con dos variantes (syllable y word). El checkpoint que nos ocupa es la versión `base`, de 131,6 M de parámetros, ajustada sobre ese punto de partida.

El ajuste fino se realizó con `Trainer` de Transformers durante 8 épocas, con tasa de aprendizaje 5e-05, batch de 16 en entrenamiento y evaluación, optimizador AdamW *fused* (betas 0,9/0,999, epsilon 1e-08), scheduler lineal con un 10 % de *warmup* y semilla 42. El conjunto de datos no está documentado ("on an unknown dataset" en la propia model card). La curva de pérdida muestra un sobreajuste claro: la pérdida de entrenamiento cae de 2,0353 a 0,7238 mientras la de validación toca su mínimo en la época 3 (1,9647) y repunta hasta 2,0872 en la época 8. El checkpoint publicado corresponde a esa última época, no al punto óptimo de validación.

No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, RLHF/DPO u otra fase de alineamiento). El entrenamiento es un *fine-tuning* supervisado estándar con pérdida de entropía cruzada sobre secuencias.

## Capacidades

- Generación texto-a-texto condicionada a una secuencia de entrada, propia de un encoder-decoder BART.
- Procesamiento de vietnamita a nivel de sílaba, heredado del tokenizador y el preentrenamiento de BARTpho-syllable.
- Tareas de transformación de secuencia completa: reescritura, normalización, parafraseo, resumen o traducción, siempre que el ajuste fino se haya orientado a ello (la tarea exacta no está documentada).
- Generación con *beam search* y muestreo, al ser compatible con `generate()` de Transformers.
- *Fine-tuning* posterior y destilación, dado que se distribuyen pesos completos en safetensors.
- No hay evidencia documentada de *tool calling*, soporte de agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.

## Casos de uso

- **Reescritura y parafraseo de textos en vietnamita**: el modelo puede recibir una frase origen y emitir una variante reformulada, aprovechando la naturaleza seq2seq del checkpoint; útil para aumentar datasets de entrenamiento de otros sistemas.
- **Normalización de texto previa a TTS o ASR**: transformar transcripciones ruidosas o con formato inconsistente en texto canónico antes de alimentar un sintetizador de voz en vietnamita.
- **Aumento de datos para pipelines de PLN**: la etiqueta `aug` del identificador sugiere un uso como generador de pares sintéticos origen-destino; se integraría en un *script* que llame a `generate()` sobre un corpus semilla y filtre las salidas por similitud.
- **Resumen extractivo-abstravo de documentos cortos**: si el ajuste se orientó a resumen, el modelo puede condensar noticias o informes en vietnamita; requiere validación previa con un conjunto propio.
- **Corrección de texto y puntuación**: tareas de seq2seq donde la entrada es una frase mal formada y la salida es la versión corregida, un caso habitual en el preprocesado de corpus vietnamitas.
- **Generación de preguntas y respuestas a partir de contextos**: producir preguntas sintéticas desde pasajes para entrenar sistemas de QA, un uso clásico de modelos seq2seq pequeños.
- **Base para experimentos académicos reproducibles**: sirve como punto de partida para comparar variantes de ajuste fino sobre BARTpho-syllable dada la trazabilidad de sus hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `results` del `model-index` está vacío y la model card no reporta MMLU, HumanEval, GSM8K ni métricas de traducción o resumen.

Las únicas métricas disponibles son las de entrenamiento y validación declaradas por el autor:

| Epoca | Step | Perdida de entrenamiento | Perdida de validacion |
|:---:|:---:|:---:|:---:|
| 1 | 695 | 2,0353 | 2,1180 |
| 2 | 1390 | 1,7471 | 2,0187 |
| 3 | 2085 | 1,4494 | 1,9647 |
| 4 | 2780 | 1,2210 | 1,9925 |
| 5 | 3475 | 1,0726 | 2,0100 |
| 6 | 4170 | 0,9297 | 2,0535 |
| 7 | 4865 | 0,8213 | 2,0801 |
| 8 | 5560 | 0,7238 | 2,0872 |

Entorno de entrenamiento declarado: Transformers 4.57.6, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.22.2.

## Requisitos de hardware

- **VRAM para inferencia**: los pesos en FP32 ocupan aproximadamente 526 MB (131,6 M × 4 bytes); en FP16/BF16 unos 263 MB; en INT8 unos 132 MB. A ello hay que sumar la memoria del *KV cache* y de las activaciones, que depende de la longitud de secuencia y del tamaño de lote, no documentados.
- **GPU recomendadas**: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en FP16 con lotes moderados. Para *fine-tuning* completo conviene una GPU de 16-24 GB (RTX 4090, A5000, L4) o una A100/H100 si se buscan lotes grandes.
- **GPU de consumo**: sí, cabe holgadamente en tarjetas de consumo como RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 o RTX 4090, tanto en FP16 como en FP32.
- **Opciones de despliegue**: `transformers` con `AutoModelForSeq2SeqLM` es la vía natural. vLLM soporta arquitecturas encoder-decoder tipo BART. TGI tiene soporte limitado para encoder-decoder. llama.cpp y Ollama no ofrecen, en la información disponible, conversión nativa de BART a GGUF, por lo que no son opciones directas sin trabajo adicional. La exportación a ONNX vía Optimum es viable para despliegue en CPU.
- **Latencia y throughput**: no disponible (no hay mediciones publicadas).
- **Almacenamiento**: el repositorio pesa 4,2 GB, muy por encima de los ~526 MB de los pesos, lo que indica la presencia de estados del optimizador u otros checkpoints intermedios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`viexdp-bartpho-syllable-base-...`) | 131,6 M | no disponible | vietnamita (heredado del base) | MIT | Ajuste fino no documentado, pérdida de validación 2,0872 |
| `vinai/bartpho-syllable-base` | ~131,6 M (misma familia) | no disponible | vietnamita | MIT (modelo base de VinAI) | Modelo preentrenado original, sin ajuste a tarea concreta |
| `vinai/bartpho-word-base` | ~131,6 M (misma familia) | no disponible | vietnamita | MIT | Variante con tokenización a nivel de palabra |
| `VietAI/vit5-base` | ~229 M | no disponible | vietnamita | MIT | Alternativa seq2seq basada en T5, más parámetros |
| `facebook/mbart-large-50` | ~611 M | no disponible | multilingüe (50 idiomas) | MIT | Multilingüe, mucho mayor y más costoso de desplegar |

Datos de rendimiento comparativo: no disponible. Los resultados de resumen de vietnamita citados por la documentación de BARTpho no se han verificado para este checkpoint ajustado.

## Limitaciones y advertencias

- **Sobreajuste**: la pérdida de validación mínima se alcanza en la época 3 (1,9647) y el checkpoint publicado es el de la época 8 (2,0872). Es previsible un rendimiento inferior al óptimo en datos no vistos.
- **Tarea y datos desconocidos**: la model card indica explícitamente "on an unknown dataset" y "More information needed" en descripción, usos previstos y datos de entrenamiento. No se puede asumir qué transformación aprendió el modelo.
- **Riesgo de alucinación**: como todo modelo generativo entrenado con entropía cruzada, puede producir salidas fluidas pero factualmente incorrectas, especialmente fuera de la distribución de entrenamiento.
- **Ámbito lingüístico**: el modelo base es monolingüe en vietnamita; no hay evidencia de capacidades en castellano u otras lenguas.
- **Longitud de contexto no documentada**: impide planificar el truncado de entradas largas sin una prueba empírica previa.
- **Licencia**: MIT permite uso comercial y modificación, pero la licencia del modelo base (`vinai/bartpho-syllable-base`) debe verificarse de forma independiente antes de su explotación comercial.
- **Sesgos**: no evaluados ni documentados. Al derivar de un corpus vietnamita no descrito, puede reproducir sesgos de dicho corpus.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; sin evaluación de terceros ni benchmarks publicados.
- **Aviso de la propia model card**: el texto fue generado automáticamente por `Trainer` y el autor no lo ha revisado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hnhung/viexdp-bartpho-syllable-base-src-tgt-aug-5e-05-20261024153454
- Modelo base: https://huggingface.co/vinai/bartpho-syllable-base
- Documentación de BARTpho en Transformers: https://huggingface.co/docs/transformers/model_doc/bartpho
- Repositorio oficial de BARTpho (VinAI Research): https://github.com/VinAIResearch/BARTpho
- Ficha de BARTpho-syllable en Inferix: https://inferix.co/models/vinai/bartpho-syllable
- Modelo hermano de otro autor con nomenclatura equivalente: https://huggingface.co/ngwgsang/viexdp-bartpho-syllable-base-src-tgt-5e-05-20261023162426
