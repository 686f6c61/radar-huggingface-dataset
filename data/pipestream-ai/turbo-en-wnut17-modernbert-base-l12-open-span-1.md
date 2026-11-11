# pipestream-ai/turbo-en-wnut17-modernbert-base-l12-open-span-1

## Resumen

turbo-en-wnut17-modernbert-base-l12-open-span-1 es un modelo de extraccion de entidades nombradas (NER) en ingles desarrollado por pipestream-ai como artefacto del zoo de modelos turboembed. Se construye sobre el encoder answerdotai/ModernBERT-base (12 capas, dimension oculta 768) y anade una cabeza de clasificacion de tokens denominada `open_ner` (`HEAD_OPEN_SPAN`), empaquetada junto al encoder completo en un bundle de safetensors.

El modelo resuelve la tarea de reconocimiento de entidades emergentes y raras sobre el corpus WNUT 2017 (Derczynski et al.), un benchmark especificamente disenado para entidades poco frecuentes y de registro informal (redes sociales, foros). Predice seis tipos de etiqueta: persona, localizacion, grupo, obra creativa, corporacion y producto, con un limite de 8 palabras por span.

Su relevancia es acotada y conviene ser transparente: se trata de un artefacto de version 1 con cero descargas y cero likes en el momento de la ficha, y su rendimiento es modesto (span F1 de 0,2642 en test frente a una linea base de 0,0594). Resulta interesante como ejemplo de integracion de ModernBERT en un pipeline de extraccion con verificacion de integridad por digests, no como un extractor de entidades de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT-base (12 capas, hidden 768) con cabeza de token classification `open_ner` |
| Parametros totales | no disponible (el repo pesa 0,6 GB; el fichero de pesos `weights/model.safetensors` ocupa 599.250.608 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (la entrada se trunca a ese limite) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`weights/model.safetensors`, `reference/reference.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer ModernBERT-base de 12 capas y dimension oculta 768, al que se le acopla una cabeza de clasificacion de tokens para extraccion de spans abiertos (`HEAD_OPEN_SPAN`, tarea `open_ner`). El bundle incluye el encoder completo mas la cabeza, y se distribuye con un `manifest.json` que registra tamanos y hashes SHA-256 de cada fichero; el zoo de turboembed verifica esos digests antes de cargar el modelo.

El entrenamiento se realizo sobre WNUT 2017 (Emerging and Rare Entity Recognition, Derczynski et al., licencia CC BY 4.0), con el encoder base answerdotai/ModernBERT-base (commit 8949b909ec900327062f0ebf497f51aef5e6f0c8) como punto de partida. Segun el manifiesto, el mejor epoch fue el 1, lo que sugiere un ajuste fino corto y sin senales de entrenamiento prolongado. No se documentan en la informacion disponible tecnicas de RLHF, DPO ni decodificacion especulativa; tampoco se detalla la composicion exacta del dataset mas alla del corpus citado.

## Capacidades

- Extraccion de entidades nombradas en ingles con seis etiquetas: `person`, `location`, `group`, `creative-work`, `corporation` y `product`.
- Deteccion de spans abiertos de hasta 8 palabras por entidad.
- Procesamiento de entradas de hasta 8192 tokens (truncado por encima).
- Clasificacion de tokens a nivel de span (no genera texto libre; es un modelo discriminativo).
- No soporta tool calling ni function calling: es una cabeza de token classification, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue: no disponible; solo ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Extraccion de entidades en redes sociales y foros: el modelo esta entrenado sobre WNUT-17, un corpus de registro informal, por lo que es adecuado para preprocesar textos de usuarios y detectar menciones a personas, empresas o productos antes de un analisis posterior.
- Enriquecimiento de pipelines de monitorizacion de marca: se puede usar para identificar menciones de corporaciones y productos en grandes volumenes de texto en ingles, siempre que se acepte su recall limitado y se combine con reglas o un segundo modelo.
- Etiquetado previo en anotacion humana: al ser un modelo ligero (0,6 GB) y con salida estructurada, sirve como preanotador en herramientas de anotacion para reducir el trabajo manual, con revision humana posterior.
- Filtrado de documentos por entidad: en un pipeline de ingesta, se puede emplear para marcar documentos que contienen localizaciones o personas y enrutarlos a colas especificas.
- Prototipado rapido de NER en entornos con requisitos de integridad: el bundle con manifest y digests SHA-256 facilita despliegues verificables en entornos donde la cadena de suministro del modelo importa.
- Baseline interno de evaluacion: util como referencia reproducible (span F1 0,2642 en test WNUT-17) contra la que comparar extractores propios o futuras versiones del zoo turboembed.

## Benchmarks y rendimiento

| Cabeza | Corpus | Metrica | Dev | Test | Baseline | Mejor epoch |
|---|---|---|---:|---:|---:|---:|
| open_ner | WNUT-17 | span_f1 | 0.3023 | 0.2642 | 0.0594 | 1 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros); el modelo es discriminativo y no aplica a esos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB en fp32 (0,6 GB de pesos mas activaciones y overhead), y menos de 1 GB si se convierte a fp16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo con holgura. Para lotes grandes, A100 o H100 no son necesarias.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU para volumenes moderados.
- Opciones de despliegue: la libreria nativa es `turboembed` (carga por id desde el zoo con verificacion de digests). Al ser un transformer estandar en safetensors, es exportable a otros runners (por ejemplo, ONNX Runtime o Transformers) si se reimplementa la cabeza, aunque no se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del encoder, se espera baja latencia en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turbo-en-wnut17-modernbert-base-l12-open-span-1 | no disponible (encoder 12 capas, hidden 768) | 8192 | NER (6 etiquetas, WNUT-17) | Apache-2.0 | Hugging Face (0 descargas) |
| answerdotai/ModernBERT-base | no disponible | 8192 | Encoder base (fine-tuneable) | Apache-2.0 | Hugging Face (ampliamente usado) |
| Modelos NER especializados en WNUT-17 (p. ej. variantes BERT/RoBERTa) | variable | 512 en la mayoria | NER (WNUT-17) | variable | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa fiable mas alla del span F1 de 0,2642 reportado para este modelo.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre WNUT-17; los resultados pueden no transferirse a otros dominios o registros.
- Solo predice seis etiquetas: `person`, `location`, `group`, `creative-work`, `corporation` y `product`.
- Los spans estan limitados a 8 palabras; entidades mas largas no se detectaran correctamente.
- Solo ingles; la entrada se trunca a 8192 tokens.
- El span F1 en test es 0,2642, lo que implica una tasa alta de entidades omitidas o mal clasificadas; no es adecuado para produccion sin supervision o post-procesado.
- El mejor epoch fue el 1, lo que sugiere posible infraentrenamiento o sobreajuste temprano.
- Riesgo de sesgos: el corpus WNUT-17 proviene de redes sociales y puede reflejar sesgos de ese registro y de la anotacion original.
- Riesgo de alucinacion: bajo en el sentido generativo (no genera texto), pero puede producir etiquetas erroneas con alta confianza.
- Licencia Apache-2.0: permite uso comercial, pero el corpus de entrenamiento WNUT-17 es CC BY 4.0 y exige atribucion; conviene revisar los terminos de atribucion del corpus.
- Modelo con cero descargas y cero likes en el momento de la ficha: sin validacion externa ni comunidad que lo respalde.

## Enlaces

- Hugging Face: https://huggingface.co/pipestream-ai/turbo-en-wnut17-modernbert-base-l12-open-span-1
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Corpus WNUT-17: https://github.com/leondz/emerging_entities_17
- README del corpus (commit referenciado): https://github.com/leondz/emerging_entities_17/blob/e52a2d2a71ac1a051ca2d532eef28653c5c02603/README.md
- Licencia turboembed: https://github.com/ai-pipestream/turboembed/blob/main/LICENSE
- Repositorio turboembed: https://github.com/ai-pipestream/turboembed
