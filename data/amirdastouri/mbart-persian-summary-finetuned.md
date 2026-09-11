# AmirDastouri/mbart-persian-summary-finetuned

## Resumen

mbart-persian-summary-finetuned es un modelo de generación de resúmenes en persa (farsi) desarrollado por AmirDastouri. Se trata de un ajuste fino supervisado del modelo eslamxm/mbart-finetuned-fa, que a su vez deriva de mBART-large-50, un transformer encoder-decoder multilingüe de tipo secuencia-a-secuencia. El resultado es un modelo de 611.129.542 parámetros especializado en resumir noticias en persa, tarea para la que fue entrenado con los corpus HooshvareLab/pn_summary y hezarai/xlsum-fa.

El modelo resuelve un problema concreto: la escasez de herramientas de resumen abstractivo de calidad para persa, un idioma con menos recursos que el inglés o el castellano en el ecosistema de PLN. La ventana de entrada es de 1024 tokens, suficiente para artículos de noticias completos, y la salida objetivo durante el entrenamiento se limitó a 110 tokens, lo que orienta al modelo hacia resúmenes cortos y densos.

Es relevante para equipos que necesiten integrar resumen automático de prensa persa en pipelines de procesado de texto, monitorización de medios o sistemas de alertas. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque el modelo tiene un alcance muy acotado: un único idioma y una única tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), basada en mBART-large-50 |
| Parámetros totales | 611.129.542 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens de entrada (max input length); 110 tokens de salida objetivo en entrenamiento |
| Tipos de cuantización | no disponible (repo de 2,5 GB en safetensors, compatible con cuantización externa fp16/int8) |
| Idiomas soportados | persa (fa); el modelo base mBART-50 cubre 50 idiomas, pero este ajuste solo está validado para persa |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder estándar de tipo secuencia-a-secuencia, heredada de mBART-large-50. mBART es una variante de BART preentrenada de forma multilingüe mediante denoising sobre texto en 50 idiomas, lo que le proporciona un tokenizador SentencePiece compartido y representaciones multilingües. El ajuste intermedio eslamxm/mbart-finetuned-fa adaptó ese modelo al persa, y este segundo ajuste lo especializó en resumen de noticias.

El entrenamiento se realizó con los datasets HooshvareLab/pn_summary y hezarai/xlsum-fa, combinando un corpus de resumen de noticias persas con la porción persa de XLSum. El autor reporta un optimizador AdamW con learning rate final de 3e-5, longitud máxima de entrada de 1024 tokens y longitud máxima de objetivo de 110 tokens. La pérdida de validación global reportada es de aproximadamente 2,13. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO. La decodificación recomendada en la model card usa beam search (num_beams=4), con penalizaciones de repetición (repetition_penalty=1.35, no_repeat_ngram_size=3) y length_penalty=1.25, además de forzar el token de idioma fa_IR como token BOS.

## Capacidades

- Generación de resúmenes abstractivos de noticias en persa, con salidas de aproximadamente 40 a 130 tokens.
- Procesamiento de entradas de hasta 1024 tokens, adecuado para artículos de prensa de longitud media.
- Condicionamiento de idioma mediante forced_bos_token_id con el código fa_IR, característico de la familia mBART.
- Decodificación configurable: beam search, muestreo, penalizaciones de longitud y repetición.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado para uso como agente ni razonamiento multi-paso.
- No tiene capacidades multimodales (ni visión ni audio).
- No se documenta un modo de razonamiento explícito (thinking mode).
- El alcance multilingüe práctico se limita al persa, pese a la herencia multilingüe del modelo base.

## Casos de uso

- Resumen automático de prensa persa: el modelo recibe el cuerpo de una noticia de hasta 1024 tokens y devuelve un resumen corto, lo que permite agregar titulares o entradillas de forma automática en portales y lectores de RSS.
- Monitorización de medios y clipping: integrado en un pipeline que recoge noticias persas, genera resúmenes por artículo y los clasifica o agrupa por tema para boletines internos.
- Alertas y vigilancia de fuentes: en un sistema que consume feeds de noticias en tiempo real, el resumen de 40-130 tokens reduce el coste de revisión humana y permite priorizar piezas relevantes.
- Enriquecimiento de bases documentales: generar resúmenes para indexar y buscar en corpus periodísticos persas, mejorando la recuperación de información sobre textos completos.
- Accesibilidad y síntesis de lectura: producir versiones cortas de artículos largos para usuarios con poco tiempo o para su lectura mediante síntesis de voz.
- Preprocesado para otros modelos: usar el resumen como paso intermedio antes de tareas de clasificación, análisis de sentimiento o traducción, reduciendo la longitud de la entrada a los modelos posteriores.
- Investigación en PLN persa: servir como punto de partida (checkpoint base) para experimentos de ajuste fino adicional en otras tareas de generación en persa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la pérdida de validación, de aproximadamente 2,13 sobre el conjunto de validación completo. No se facilitan métricas ROUGE, BLEU ni comparaciones numéricas con otros modelos.

| Métrica | Valor |
|---|---|
| Pérdida de validación | ~2,13 |
| ROUGE-1 / ROUGE-2 / ROUGE-L | no disponible |
| MMLU, HumanEval, GSM8K | no aplica (modelo de resumen, no de razonamiento general) |

## Requisitos de hardware

- Peso de los parámetros: 611.129.542 parámetros. En fp32 ocupa aproximadamente 2,44 GB; en fp16, unos 1,22 GB; en int8, unos 0,61 GB.
- VRAM estimada para inferencia: alrededor de 3-4 GB en fp32 con overhead de activaciones y beam search; 2-3 GB en fp16; menos de 2 GB en int8.
- GPU de consumo: cabe holgadamente en tarjetas con 6 GB o más, como GTX 1660, RTX 2060, RTX 3060, RTX 4060 o superiores.
- GPU de centro de datos: no requiere A100 ni H100; estas solo aportarían ventaja en despliegues con alto paralelismo por GPU.
- CPU: es viable la inferencia en CPU con cuantización int8, aunque con mayor latencia; adecuado para volúmenes bajos.
- Opciones de despliegue: transformers con AutoModelForSeq2SeqLM (ruta documentada por el autor), Text Generation Inference (TGI) y ONNX Runtime. El soporte en vLLM para arquitecturas encoder-decoder es limitado y no está confirmado para este modelo. El soporte GGUF en llama.cpp para mBART no está documentado ni confirmado en la información disponible.
- Latencia y throughput: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mbart-persian-summary-finetuned | 611.129.542 | 1024 tokens de entrada | persa | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| eslamxm/mbart-finetuned-fa (modelo base) | no disponible en la información proporcionada | no disponible | persa | no disponible | HuggingFace |
| mBART-large-50 (origen de la familia) | ~610 M (dato de referencia de la familia, no confirmado en la información proporcionada) | 1024 tokens | 50 idiomas | licencia de la familia mBART, no disponible aquí | HuggingFace / Meta |

No se dispone de datos sobre otros modelos de resumen en persa comparables (por ejemplo variantes de mT5 o modelos de la comunidad HooshvareLab) dentro de la información proporcionada, por lo que no se incluye una comparación numérica.

## Limitaciones y advertencias

- Sesgos: no se documenta ningún análisis de sesgos. Al entrenarse con corpus de noticias, puede heredar el sesgo editorial y temático de HooshvareLab/pn_summary y hezarai/xlsum-fa.
- Alucinación: como todo modelo generativo abstractivo, puede introducir datos, nombres o cifras que no aparecen en el texto original. La model card no incluye medidas de mitigación.
- Idioma: el modelo está ajustado únicamente para persa. Aunque hereda representaciones multilingües de mBART-50, no hay evidencia de calidad en otros idiomas ni se recomienda su uso fuera del persa.
- Contexto: entradas superiores a 1024 tokens se truncan, lo que puede eliminar información relevante de artículos largos.
- Longitud de salida: el entrenamiento fijó objetivos de 110 tokens; los resúmenes generados tienden a ser cortos y pueden omitir matices.
- Datos de evaluación limitados: solo se reporta pérdida de validación (~2,13). No hay métricas ROUGE ni evaluación humana publicadas, lo que dificulta estimar la calidad real en producción.
- Reproducibilidad: no se documentan épocas, tamaño de lote, semilla ni hardware de entrenamiento.
- Adopción: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación externa ni casos de uso en producción conocidos.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar las licencias y condiciones de los datasets de entrenamiento (HooshvareLab/pn_summary y hezarai/xlsum-fa) antes de un despliegue comercial.
- Fechas del repositorio: el modelo figura como creado y actualizado el 11 de septiembre de 2026, dato poco habitual que conviene contrastar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmirDastouri/mbart-persian-summary-finetuned
- Modelo base: https://huggingface.co/eslamxm/mbart-finetuned-fa
- Dataset HooshvareLab/pn_summary: https://huggingface.co/datasets/HooshvareLab/pn_summary
- Dataset hezarai/xlsum-fa: https://huggingface.co/datasets/hezarai/xlsum-fa
- Paper de mBART (familia base): https://arxiv.org/abs/2008.00401
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a una aplicación móvil no relacionada ("Weird Type", de Zach Lieberman) y se descartan por no ser pertinentes.
