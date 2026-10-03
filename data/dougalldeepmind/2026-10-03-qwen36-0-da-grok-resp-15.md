# dougalldeepmind/2026-10-03-qwen36-0-da-grok-resp-15

## Resumen

El artefacto publicado bajo el identificador `dougalldeepmind/2026-10-03-qwen36-0-da-grok-resp-15` no es un modelo completo, sino un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base `Qwen/Qwen3.6-27B`. Lo desarrolla el usuario `dougalldeepmind`, que lo enmarca en una linea de experimentos de ajuste conductual (el repositorio de origen se titula `Lessons_from_constituitional_AFT`). El adaptador se genero con la receta `sft` sobre la mezcla de datos `da-grok-resp-15`, con semilla 0, y esta pensado para reproducir un experimento concreto mas que para uso general en produccion.

El problema que aborda es el de la personalizacion eficiente de un modelo denso de gran tamano sin reentrenar todos sus pesos: con LoRA de rango 64, alpha 128 y dropout 0.05, el coste de entrenamiento se reduce a una fraccion del de un fine-tuning completo. El repositorio ocupa 1.3 GB e incluye, ademas del adaptador en safetensors, el tokenizer, el `train_config.yaml` resuelto y un `training_meta.json` con metadatos de procedencia, de modo que el experimento se pueda reejecutar.

Su relevancia es fundamentalmente metodologica: sirve como pieza auditable de una cadena de experimentos (fecha, semilla, revision de dataset y revision del modelo base quedan fijadas). No hay licencia declarada, ni idiomas declarados, ni benchmarks publicados, y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que no existe validacion externa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso `Qwen/Qwen3.6-27B`; arquitectura del modelo base no disponible en la informacion proporcionada |
| Parametros totales | No disponible (el modelo base se declara como 27B; el adaptador LoRA con r=64 no publica su recuento de parametros) |
| Parametros activos | No aplica: el artefacto es un adaptador LoRA, no un modelo con mezcla de expertos (MoE) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (`max_seq_len`: 8192). La ventana en inferencia la fija el modelo base, no disponible |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PEFT LoRA adapter en safetensors, mas tokenizer, `train_config.yaml` y `training_meta.json` |
| Tamano del repositorio | 1.3 GB |
| Modelo base | `Qwen/Qwen3.6-27B` en la revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9` |
| Dataset de entrenamiento | `dougalldeepmind/2026-10-03-da-grok-resp-15-mix` (archivo `mixture.jsonl`), revision `99685157e4eccae3e2f412a83e4b0e77dc404840` |
| Repositorio de codigo | `github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT` en el commit `b06021c9c65ff50bd96de292269c2f90e920a430` |
| Fecha de creacion | 2026-10-03T02:16:20.000Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) con `r=64`, `alpha=128` y `dropout=0.05`, entrenado sobre un modelo base denso de 27B. No se declara si el base emplea atencion estandar, atencion lineal o alguna variante hibrida, ni su composicion de capas, por lo que la unica informacion fiable sobre arquitectura es la que corresponde al propio adaptador: matrices de bajo rango inyectadas en el modelo congelado y serializadas en formato PEFT. El modo `thinking` aparece activado en la configuracion de generacion, lo que indica que el dataset de ajuste contiene trazas de razonamiento y que el adaptador se entrena para producir ese tipo de respuesta.

La receta de entrenamiento concreta es: 1.0 epoca, learning rate 1e-4, batch size 1 con acumulacion de gradiente 16, longitud maxima de secuencia 8192 y *dynamic batching* con un presupuesto de 8000 tokens y agregacion de perdida `seq-mean-token-mean`. La procedencia esta completamente fijada (dataset, revision, semilla 0, commit del repositorio de codigo), lo que permite reejecutar el entrenamiento con `uv run train --config train_config.yaml`. No se documentan el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO adicionales.

Un detalle relevante para la trazabilidad: la model card indica que la "constitucion" del modelo se hereda de los datos de entrenamiento y que no se declaro en el lanzamiento. Es decir, los criterios de comportamiento que el adaptador internaliza provienen de la mezcla `da-grok-resp-15`, pero no estan explicitados como especificacion independiente.

## Capacidades

- Generacion de texto y razonamiento con trazas explicitas: la configuracion activa `thinking: true`, por lo que el adaptador esta ajustado para emitir razonamiento antes de la respuesta final.
- Ajuste conductual sobre el modelo base: al ser un LoRA de SFT, su funcion es modificar estilo y patrones de respuesta del base `Qwen3.6-27B`, no anadir capacidades nuevas.
- Multilingue: no disponible; no se declaran idiomas ni en la model card ni en los metadatos.
- Tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modo `thinking` sugiere razonamiento encadenado, pero no hay evaluacion que lo confirme.
- Vision, audio u otras modalidades: no disponible.
- Reproducibilidad del entrenamiento: el repositorio incluye la configuracion resuelta y los metadatos, lo que constituye una capacidad operativa destacable para investigacion.

## Casos de uso

- Replicacion de experimentos de ajuste conductual: el paquete incluye `train_config.yaml`, semilla, revision de dataset y revision del modelo base, de modo que un grupo de investigacion puede reejecutar exactamente el mismo entrenamiento y comparar resultados con otras semillas.
- Estudio de LoRA frente a fine-tuning completo en modelos de 27B: con r=64 y 1.3 GB de repositorio, sirve como referencia de cuanto comportamiento se puede capturar con un adaptador de bajo rango frente a un ajuste de todos los pesos.
- Analisis de destilacion de trazas de razonamiento: dado que `thinking` esta activo, el adaptador permite estudiar si un modelo denso de 27B reproduce el formato y la profundidad de razonamiento de la mezcla `da-grok-resp-15`.
- Auditoria de procedencia en pipelines de ML: los campos `git_sha`, `data_revision`, `base_model_revision` y `timestamp` de `training_meta.json` permiten integrar el artefacto en un sistema de linaje de modelos y verificar la cadena completa.
- Base para ajuste en dominio especifico: partiendo de este adaptador se puede continuar el entrenamiento sobre datos propios (por ejemplo, documentacion tecnica interna) manteniendo el coste de un LoRA en lugar de un fine-tuning completo.
- Evaluacion comparativa de mezclas de datos: al existir artefactos hermanos generados con fechas y mezclas distintas bajo el mismo autor, el adaptador sirve para aislar el efecto de la mezcla de datos manteniendo constante la receta.
- Investigacion sobre alineacion y "constituciones" implicitas: la model card senala que la constitucion se hereda de los datos y no se declara, lo que lo convierte en un caso de estudio sobre que criterios de comportamiento se transmiten a traves de un dataset de SFT no documentado.
- Pruebas de infraestructura de despliegue con PEFT: util para validar cargas de adaptadores en vLLM o TGI, y para medir el sobrecoste de servir un adaptador junto al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan curvas de perdida de entrenamiento ni resultados de evaluacion comparativa frente al modelo base sin adaptador.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamano declarado del modelo base (27B) y no estan confirmadas por el autor, que no publica requisitos. El adaptador LoRA en si ocupa una fraccion del repositorio de 1.3 GB, pero la inferencia exige cargar el modelo base completo.

- VRAM estimada para inferencia del modelo base (estimacion, no dato del autor): aproximadamente 54-58 GB en BF16/FP16, en torno a 27-30 GB en INT8 y unos 14-17 GB en cuantizacion de 4 bits.
- GPU recomendadas: para BF16, una A100 80GB, H100 80GB o dos A100 40GB; para INT8, una A100 40GB o una RTX 6000 Ada de 48GB; para 4 bits, una RTX 4090 de 24GB o una L40S de 48GB.
- Cabe en GPU de consumo: si se cuantiza a 4 bits, si en tarjetas de 24GB como la RTX 4090, siempre que la ventana de contexto se mantenga moderada; en BF16 no cabe en ninguna GPU de consumo actual de una sola unidad.
- Opciones de despliegue: carga del adaptador mediante PEFT sobre `transformers`, fusion del adaptador en el modelo base y servicio con vLLM o TGI. Para llama.cpp u Ollama seria necesario convertir primero el modelo fusionado a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo, tiempo hasta el primer token ni comportamiento bajo batching.
- Almacenamiento: el repositorio del adaptador ocupa 1.3 GB, a lo que hay que sumar el peso completo del modelo base en el formato elegido.

## Comparativa con modelos similares

No hay datos de rendimiento que permitan una comparativa funcional. La comparacion posible es estructural, con artefactos del mismo autor y con la categoria generica de adaptadores LoRA.

| Artefacto | Tipo | Modelo base | Dataset / mezcla | Fecha | Licencia | Descargas |
|---|---|---|---|---|---|---|
| `2026-10-03-qwen36-0-da-grok-resp-15` (este) | LoRA SFT, r=64, seed 0 | `Qwen/Qwen3.6-27B` | `da-grok-resp-15-mix` | 2026-10-03 | No disponible | 0 |
| `2026-10-02-qwen36-0-da-grok-15` | LoRA SFT (mismo linaje) | No disponible | `da-grok-15` (por el nombre) | 2026-10-02 | No disponible | No disponible |
| `2026-09-29-qwen36-0-da-15` | LoRA SFT (mismo linaje) | No disponible | `da-15` (por el nombre) | 2026-09-29 | No disponible | No disponible |
| Modelo base `Qwen/Qwen3.6-27B` sin adaptador | Modelo completo denso | No aplica | No aplica | No disponible | No disponible | No disponible |

No se dispone de alternativas externas comparables con datos verificables (parametros, contexto, benchmarks y licencia) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar `Qwen/Qwen3.6-27B` en la revision indicada; sin el base, el adaptador es inutilizable.
- Licencia no declarada: no se especifican condiciones de uso comercial, redistribucion ni atribucion. En un contexto de produccion esto es un bloqueo, ya que la licencia del adaptador y la del modelo base pueden no coincidir.
- Idiomas no declarados: se desconoce que idiomas cubre el ajuste y con que calidad; no hay evaluacion multilingue.
- Riesgo de alucinacion: no evaluado. Al tratarse de un SFT sobre una mezcla de respuestas no documentada, el adaptador puede reforzar estilos o afirmaciones presentes en el dataset sin que exista un control de veracidad.
- Sesgos conocidos: no disponibles. No hay analisis de sesgos ni del contenido de `mixture.jsonl`.
- Transparencia limitada: la propia model card reconoce que la "constitucion" del modelo se hereda de los datos de entrenamiento y no se declaro en el lanzamiento; no se puede auditar que criterios de comportamiento se han internalizado.
- Sin validacion externa: 0 descargas y 0 likes, creado y actualizado con 7 segundos de diferencia, lo que sugiere una publicacion automatica de un pipeline de experimentos sin revision adicional.
- Sin benchmarks: no hay ninguna metrica que permita afirmar que el adaptador mejora al modelo base en tarea alguna.
- Configuracion de entrenamiento de baja escala: 1.0 epoca, batch efectivo de 16 secuencias, lo que limita la magnitud del ajuste conseguido.
- Advertencia de contexto: los 8192 tokens corresponden a la longitud de entrenamiento; usarlo con ventanas mayores no esta respaldado por la configuracion publicada ni evaluado.
- Caveat de produccion: al no publicarse versiones cuantizadas ni formato GGUF, cualquier despliegue exige un paso previo de fusion de pesos y conversion propio, con el consiguiente riesgo de divergencia respecto al artefacto original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-10-03-qwen36-0-da-grok-resp-15
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-10-03-da-grok-resp-15-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de codigo de la receta: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT
- Artefacto hermano del 2026-10-02: https://huggingface.co/dougalldeepmind/2026-10-02-qwen36-0-da-grok-15
- Artefacto hermano del 2026-09-29: https://huggingface.co/dougalldeepmind/2026-09-29-qwen36-0-da-15
- Perfil del autor en HuggingFace: https://huggingface.co/dougalldeepmind
- Paper, blog o demo adicionales: no disponible en los resultados de busqueda
