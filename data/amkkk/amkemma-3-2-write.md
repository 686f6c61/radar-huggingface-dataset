# amkkk/AMKemma-3.2-Write

## Resumen

AMKemma 3.2 Write es un ajuste fino (fine-tune) especializado en escritura y reescritura de texto, desarrollado por el usuario amkkk y publicado como un archivo GGUF autónomo en cuantización Q8_0. Se construye sobre AMKemma 3.1 Write, que a su vez es un fine-tune del modelo base de la familia Gemma 4 (según las etiquetas del autor), con un total de 5.050.103.331 parámetros. El modelo está diseñado para tareas de generación de prosa, reescritura de borradores rechazados y redacción a partir de briefs, con un enfoque explícito en reducir el "framing" de asistente y acercar el estilo al de un corpus humano.

La relevancia de este modelo radica en su metodología de entrenamiento: emplea un LoRA de rango 8 y alpha 8 sobre el modelo base BF16 congelado, combinando entropía cruzada de respuesta con *unlikelihood* a nivel de token. El corpus de entrenamiento consta de 8.493 ejemplos (5.983 reescrituras y 2.510 pares de escritura directa), e incorpora ejemplos de FineWeb y briefs restaurados. La evaluación publicada se centra en métricas estilísticas y de distancia a corpus humano, no en benchmarks académicos convencionales.

El modelo se distribuye únicamente como GGUF Q8_0 (5,38 GB), con licencia Apache 2.0, y está pensado para ejecutarse con llama.cpp. Su enfoque es monolingüe (inglés) y su ventana de contexto práctica en los ejemplos de uso es de 4.096 tokens, aunque no se especifica la longitud de contexto nativa del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, según etiquetas del autor); fine-tune con LoRA sobre AMKemma 3.1 Write |
| Parametros totales | 5.050.103.331 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ejemplo de uso con `-c 4096`) |
| Tipos de cuantizacion | Q8_0 (única publicada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`AMKemma-3.2-Write-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo parte del AMKemma 3.1 Write en BF16 congelado y aplica un LoRA de rango 8 y alpha 8. El entrenamiento consistió en una pasada de 2.124 actualizaciones, optimizando entropía cruzada de respuesta más *unlikelihood* a nivel de token con peso 1. Los 8.493 ejemplos se dividen en 5.983 pares de reescritura (donde el borrador rechazado se coloca como contexto de entrada junto a la petición corregida, y la respuesta elegida es el objetivo) y 2.510 pares de escritura directa (1.500 ejemplos de FineWeb, 1.000 briefs restaurados y diez ejemplos proporcionados). Los prompts se enmascaran de la pérdida, y el borrador rechazado se trata como contexto de entrada, no como objetivo de pérdida de preferencia.

La innovación técnica destacable es el uso de *unlikelihood* a nivel de token combinado con entropía cruzada, junto con la estrategia de presentar el borrador rechazado como contexto en lugar de como par de preferencia. El modelo se distribuye como GGUF Q8_0 con plantilla de chat embebida, tokens de parada nativos `<turn|>` (106) y `<eos>` (1), y modo *thinking* desactivado. Los ajustes de muestreo recomendados son temperatura 0.8, top-p 1, top-k 0, min-p 0 y penalización de repetición 1.

## Capacidades

- Generación de texto en inglés para prosa, ensayos, abstracts científicos y escritura web.
- Reescritura de borradores: recibe un borrador rechazado más la petición corregida y produce una versión mejorada.
- Escritura directa a partir de briefs con estilo y longitud solicitados (el 75% de los briefs de evaluación incluyen esquemas).
- Reducción de preámbulos y *framing* de asistente (los preámbulos bajaron del 11,49% al 2,77% en la evaluación H2-style).
- Generación conversacional de un solo turno (`--single-turn` en el ejemplo).
- No se documentan capacidades de *tool calling*, agentes, visión, audio ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Reescritura de borradores editoriales: el modelo está entrenado específicamente para recibir un texto rechazado junto con la petición corregida y devolver una versión pulida, lo que encaja en flujos de edición donde un primer borrador no cumple el brief.
- Redacción de ensayos y abstracts científicos: la evaluación H2-style cubre 400 abstracts y 1.549 ensayos, y el modelo muestra menor distancia a corpus humano en métricas de bigrama y trigrama, lo que lo hace adecuado para generar texto académico con estilo menos artificial.
- Generación de contenido web a partir de briefs: con 2.000 briefs de evaluación que incluyen estilo y longitud solicitada, el modelo puede usarse para producir artículos y textos de marketing con instrucciones de tono y extensión.
- Reducción de tono de asistente en textos de marca: al disminuir los preámbulos y el *framing* conversacional, es útil para generar prosa que no suene a respuesta de chatbot.
- Escritura de diarios de viaje y narrativa breve: el ejemplo oficial de la model card (`Write a travel diary about a rainy train journey. Around 500 words.`) demuestra su uso para prosa creativa con longitud controlada.
- Generación de texto en local con llama.cpp: al ser un GGUF Q8_0 de 5,38 GB, puede integrarse en herramientas de escritura offline o en pipelines de generación por lotes sin dependencia de API.
- Prototipado de asistentes de escritura con contexto de 4.096 tokens: adecuado para sesiones de un solo turno donde se pega un borrador y una instrucción de corrección.

## Benchmarks y rendimiento

Los datos publicados son métricas estilísticas y de distancia a corpus, no benchmarks académicos (MMLU, HumanEval, GSM8K no están disponibles).

Evaluación H2-style (1.949 prompts comunes: 400 abstracts y 1.549 ensayos):

| Métrica | Humano | AMKemma 3.1 | AMKemma 3.2 |
|---|---:|---:|---:|
| Diversidad léxica | 0,38766 | 0,42678 | 0,44724 |
| Densidad léxica | 0,42946 | 0,44127 | 0,43242 |
| Palabras largas (>6 caracteres) | 0,16558 | 0,21956 | 0,20828 |
| Entropía de tokens (bits) | 6,44913 | 6,45040 | 6,42227 |
| Burstiness de frecuencia | 1,26958 | 1,40041 | 1,39567 |
| Longitud (tokens NLTK) | 422,56747 | 423,53155 | 413,85326 |
| Frases por documento | 16,26629 | 18,77732 | 19,15495 |
| Tokens por frase | 32,13257 | 26,20009 | 24,86410 |
| Profundidad máxima de parseo | 10,21703 | 10,16521 | 9,80246 |
| Gunning Fog | 15,04112 | 14,14066 | 13,45381 |
| Linsear Write | 14,65804 | 13,96703 | 12,83746 |

Distancia a corpus (menor es más cercano):

| Métrica | AMKemma 3.1 | AMKemma 3.2 | Referencia humano-humano |
|---|---:|---:|---:|
| L2-1 | 0,02925992 | 0,02607460 | 0,00707590 |
| L2-2 | 0,01524412 | 0,01087674 | 0,00557650 |
| L2-3 | 0,00599869 | 0,00522140 | 0,00475461 |
| JSD (nats) | 0,07970279 | 0,06652679 | 0,04771178 |

Evaluación FineWeb (1.996 prompts comunes):

| Modelo | n | BLEU ↑ | chrF ↑ | JSD bits ↓ | Self-BLEU ↓ | Repeat-start ↓ |
|---|---:|---:|---:|---:|---:|---:|
| Referencia humana | 1996 | — | — | — | 0,33259 | 0,14479 |
| AMKemma 3.1 | 1996 | 0,06899 | 0,48606 | 0,05563 | 0,39448 | 0,18537 |
| AMKemma 3.2 | 1996 | 0,05786 | 0,45491 | 0,05928 | 0,39573 | 0,20240 |

El autor indica que 3.2 es más cercano al corpus humano en las cuatro métricas agregadas de distancia en la evaluación H2-style, pero en FineWeb obtiene BLEU y chrF inferiores a 3.1. Los resultados de abstracts son mixtos: 3.1 tiene menor L2 de unigramas; 3.2 tiene menor L2 de bigramas y trigramas y JSD ligeramente inferior.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 pesa 5,38 GB, por lo que se necesitan al menos ~6 GB de VRAM o memoria unificada para cargarlo completo, más overhead de contexto.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (requiere soporte de Gemma 4), con `llama-cli` como ejemplo oficial. No se documentan vLLM, TGI, Ollama ni otros backends.
- Latencia y throughput: no disponibles.
- Ajustes de ejecución del ejemplo: `-c 4096 -n 1024 --single-turn --reasoning off --temp 0.8 --top-p 1 --top-k 0 --min-p 0 --repeat-penalty 1`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| AMKemma 3.2 Write | 5.050.103.331 | No disponible | Apache 2.0 | GGUF Q8_0 | Fine-tune de escritura, solo inglés |
| AMKemma 3.1 Write | No disponible | No disponible | Apache 2.0 (según base) | No disponible en esta ficha | Modelo base del 3.2; peor distancia a corpus humano en H2-style, mejor BLEU/chrF en FineWeb |
| Gemma 4 (base) | No disponible | No disponible | No disponible | No disponible | Modelo base de la familia; sin datos de benchmarks en la información disponible |

No se dispone de datos suficientes sobre otros modelos comparables de la misma categoría (fine-tunes de escritura de ~5B) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- La evaluación se realizó sobre los modelos BF16, no sobre el archivo GGUF Q8_0 distribuido, por lo que el rendimiento del archivo cuantizado puede diferir.
- No hay benchmarks académicos publicados (MMLU, HumanEval, GSM8K), solo métricas estilísticas y de distancia a corpus.
- En la evaluación FineWeb, 3.2 obtiene BLEU (0,05786 vs 0,06899) y chrF (0,45491 vs 0,48606) inferiores a 3.1, y mayor Repeat-start (0,20240 vs 0,18537).
- El autor señala que 3.1 repite menos aperturas y tiene menos no-terminaciones que 3.2.
- Los resultados de abstracts son mixtos entre 3.1 y 3.2.
- El corpus de entrenamiento y las notas de construcción enlazadas son privados, lo que limita la reproducibilidad.
- Riesgo de alucinación no cuantificado en la información disponible.
- Sesgos conocidos no documentados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (Gemma 4) puede tener sus propias restricciones no detalladas en esta ficha.
- El modo *thinking* está desactivado y el uso recomendado es de un solo turno (`--single-turn`), lo que limita casos conversacionales multi-turno.
- El contexto práctico del ejemplo es de 4.096 tokens; la longitud nativa no está especificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amkkk/AMKemma-3.2-Write
- Modelo base (AMKemma 3.1 Write): https://huggingface.co/amkkk/AMKemma-3.1-Write
- Corpus de entrenamiento (privado): https://huggingface.co/datasets/amkkk/AMKemma-3.2-Writing-Corpus
- Dataset DPO: https://huggingface.co/datasets/amkkk/AMK-WriteCorpus-DPO
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Archivo GGUF: https://huggingface.co/amkkk/AMKemma-3.2-Write/blob/main/AMKemma-3.2-Write-Q8_0.gguf
