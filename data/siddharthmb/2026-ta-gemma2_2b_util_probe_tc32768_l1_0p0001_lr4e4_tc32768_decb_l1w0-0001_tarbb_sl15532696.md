# siddharthmb/2026.TA.gemma2_2b_util_probe_tc32768_l1_0p0001_lr4e4_tc32768_decb_l1w0.0001_tarbb_sl15532696

## Resumen

Este repositorio no es un modelo de lenguaje al uso, sino un **adaptador transcoder disperso** entrenado sobre el backbone `google/gemma-2-2b` y publicado por el usuario `siddharthmb`. Se enmarca en la línea de trabajo de *transcoder adapters* para adaptación dispersa e interpretabilidad mecanicista: en lugar de reentrenar el modelo base, se sustituyen o complementan las MLP del transformer por transcoders con 32.768 características y regularización L1, lo que permite descomponer las activaciones en features identificables y direccionables. La configuración concreta de este checkpoint corresponde al modo de entrenamiento denominado *bridging*.

El modelo base declarado es `google/gemma-2-2b` y el modelo de referencia es `google/gemma-2-2b-it`, con pérdida KL y un término de puenteo (`lambda_bridge: 2.0`) que reconcilia el comportamiento del backbone base con el de la versión alineada por instrucciones. El checkpoint pesa 13,1 GB y declara 6.541.122.304 parámetros en los ficheros safetensors, una cifra muy superior a los aproximadamente 2.600 millones del backbone Gemma 2 2B, lo que refleja el coste paramétrico de los transcoders añadidos (32.768 features con sesgo de decodificador).

Es relevante ahora porque se publica en un momento de interés creciente por las herramientas de interpretabilidad de código abierto (en la misma estela que Gemma Scope) y porque demuestra un flujo de trabajo reproducible de adaptación dispersa con *attribution graphs*, *steering* de features y modo híbrido conmutable mediante `set_transcoders_enabled(False)`. Se trata, sin embargo, de un artefacto de investigación con 4 descargas y sin licencia ni idiomas declarados, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma2 (transformer decoder-only) con adaptadores transcoder dispersos |
| Parametros totales | 6.541.122.304 (safetensors); el backbone Gemma 2 2B aporta aproximadamente 2.600 millones |
| Parametros activos | no aplica (no es un modelo MoE); los transcoders son dispersos: 32.768 caracteristicas con L1 = 0,0001 |
| Longitud de contexto | no disponible en la model card del adaptador (el backbone google/gemma-2-2b declara 8.192 tokens) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponibles (heredados de google/gemma-2-2b, 140 idiomas segun el modelo base) |
| Licencia | no disponible (el backbone se rige por los Gemma Terms of Use, pero el adaptador no declara licencia propia) |
| Formato de pesos | safetensors (libreria transformers declarada, pero requiere las clases propias del repositorio) |

## Arquitectura y entrenamiento

El checkpoint parte del transformer decoder-only de Gemma 2 en su variante de 2B y le incorpora un *transcoder adapter*: un conjunto de transcoders que reconstruyen las salidas de las MLP del modelo y exponen un espacio de 32.768 features con `dec_bias: True` y un peso L1 de 0,0001, lo que fuerza representaciones dispersas. La carga se realiza con `load_transcoder_model` de las clases propias del proyecto; con `set_transcoders_enabled(False)` se obtiene el denominado modelo híbrido, que conserva la atención y los embeddings del modelo de referencia y recupera las MLP originales del backbone. El modelo de referencia es `google/gemma-2-2b-it` y el tokenizador es el de esa misma variante.

El entrenamiento se declara en modo *bridging*, con un único epoch, batch size de 1, learning rate de 0,0004, warmup ratio de 0,05, pérdida de tipo KL (`loss_type: kl`), `lambda_adapt: 1.0`, `lambda_bridge: 2.0`, `lambda_nmse: 1`, `n_cutoffs: 1` y `backbone: target`. La presencia simultánea de un modelo base (`gemma-2-2b`) y un modelo de referencia alineado (`gemma-2-2b-it`), junto con el término de puenteo, indica que el objetivo de entrenamiento reconcilia el comportamiento del backbone base con el del modelo de referencia; la model card no detalla la formulación matemática exacta ni el número total de tokens de entrenamiento consumidos. Los datos de entrenamiento son `science-of-finetuning/fineweb-1m-sample` y `siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits`, es decir, una muestra de FineWeb y divisiones del corpus LMSYS-Chat-1M. El proyecto publica además flujos para construir *attribution graphs* con soporte de GemmaScope.

## Capacidades

- Generación de texto: el modelo puede mantener conversaciones vía `analysis.chat.cli` con el prompt indicado.
- Steering de features: permite amplificar o atenuar una característica concreta mediante su identificador cantor (`--steer CANTOR_ID:STRENGTH`).
- Construcción de *attribution graphs* sobre los transcoders del adaptador, con opciones de prompt, GemmaScope y presupuesto.
- Modo híbrido conmutable: `set_transcoders_enabled(False)` devuelve un modelo con las MLP del backbone y la atención y embeddings del modelo de referencia.
- Descomposición dispersa de activaciones en 32.768 features con sesgo de decodificador.
- Análisis comparativo base frente a instruct a través del mecanismo de *bridging*.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o thinking mode: no disponibles.
- Capacidades multilingües específicas del adaptador: no documentadas.
- Compatibilidad declarada en los tags con text-generation-inference y con endpoints compatibles, aunque no verificada en la información disponible.

## Casos de uso

- Investigación en interpretabilidad mecanicista: construir *attribution graphs* con el script `analysis.attribution.graphs.build_graphs` para trazar qué features contribuyen a una predicción concreta, aprovechando la descomposición dispersa en 32.768 features.
- Control de comportamiento en generación: usar `--steer CANTOR_ID:STRENGTH` para intervenir una característica identificada y medir su efecto causal sobre la salida, un procedimiento habitual en experimentos de *feature steering*.
- Auditoría de seguridad y red-teaming: localizar y monitorizar features asociadas a contenidos tóxicos o peligrosos en el espacio disperso, ya que el corpus LMSYS-Chat-1M incluido en el entrenamiento aporta diálogos reales de usuario.
- Estudio de alineación base frente a instruct: comparar el comportamiento del backbone `gemma-2-2b` con el del modelo de referencia `gemma-2-2b-it` a través del término de *bridging*, útil para investigar qué representaciones cambian durante la alineación por instrucciones.
- Adaptación eficiente de modelos sin reentrenar el backbone: sustituir las MLP por transcoders dispersos y evaluar la degradación o preservación de capacidades, reduciendo el coste frente a un *fine-tuning* completo.
- Reproducción de experimentos: replicar el entrenamiento a partir de `training-config.yaml` y seguir las curvas en el *run* de W&B asociado, con un pipeline verificable extremo a extremo.
- Análisis de sesgos en datos conversacionales: inspeccionar qué features del transcoder se activan ante distintos subconjuntos del corpus LMSYS-Chat-1M y relacionarlas con sesgos conocidos.
- Prototipado de chat controlable: desplegar el modo híbrido para conversación general y activar los transcoders cuando se necesite inspección o intervención sobre las representaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y el *run* de W&B referenciado corresponde al entrenamiento, no a una batería de evaluación. Tampoco se documentan métricas de reconstrucción (por ejemplo, varianza explicada o NMSE final) pese a que la configuración incluye un término `lambda_nmse`.

## Requisitos de hardware

- Peso de los pesos en precisión de 16 bits: aproximadamente 13,1 GB, cifra que coincide con el tamaño del repositorio, por lo que se necesitan al menos 13-15 GB de VRAM solo para el modelo, más el espacio de la caché KV.
- GPU recomendadas para fp16/bf16: NVIDIA A100 (40 GB), H100 (80 GB), L40S (48 GB) o RTX 4090 (24 GB) con margen suficiente.
- GPU de consumo: cabe en una RTX 4090 (24 GB) y en una RTX 3090 (24 GB); en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) resulta muy ajustado y probablemente exija cuantización o *offloading* en CPU.
- Cuantización: no se publican pesos GGUF, AWQ ni GPTQ, por lo que la cuantización no está soportada de serie y requeriría un proceso manual no documentado.
- Opciones de despliegue: la carga debe hacerse con `load_transcoder_model` y `load_tokenizer` del repositorio `Sid-MB/transcoder-adapters`, no con `AutoModelForCausalLM` estándar. Los tags declaran compatibilidad con text-generation-inference y endpoints, pero no se aporta confirmación ni receta de despliegue para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay adaptadores transcoder públicos directamente comparables en la información disponible. La comparación más razonable es contra el backbone y su variante alineada:

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (transcoder sobre gemma-2-2b) | 6.541.122.304 | no disponible (backbone: 8.192) | no disponible | safetensors | 4 descargas, requiere codigo propio |
| google/gemma-2-2b | aproximadamente 2.600 millones | 8.192 tokens | Gemma Terms of Use | safetensors | modelo base publico de Google |
| google/gemma-2-2b-it | aproximadamente 2.600 millones | 8.192 tokens | Gemma Terms of Use | safetensors | variante alineada por instrucciones |

Frente a herramientas de interpretabilidad como Gemma Scope (que publica SAEs y transcoders para la familia Gemma 2), este repositorio se diferencia en que empaqueta el adaptador completo como checkpoint cargable con *steering* y grafos de atribución, aunque a costa de multiplicar el número de parámetros y de depender de código no estándar. No se dispone de comparaciones cuantitativas de rendimiento entre ambas opciones.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia propia. Aunque el backbone se rige por los Gemma Terms of Use, no hay confirmación de que el adaptador herede esos términos, lo que genera incertidumbre jurídica para uso comercial.
- Idiomas no documentados: no se declara qué idiomas cubre el adaptador ni si el entrenamiento con FineWeb y LMSYS-Chat-1M preserva el multilingüismo del backbone.
- Riesgo de alucinación: heredado del backbone Gemma 2 2B, un modelo pequeño con conocimiento limitado; el adaptador no incorpora ningún mecanismo de verificación factual.
- Contexto no especificado: la model card no confirma la ventana de contexto efectiva tras la sustitución de las MLP, aunque el nombre del checkpoint incluye el sufijo `tc32768` cuyo significado no se documenta.
- Ausencia total de benchmarks: no hay métricas que permitan estimar la degradación o mejora respecto al backbone, ni evaluación de la calidad de reconstrucción de los transcoders.
- Dependencia de código externo: no es cargable con `transformers` estándar pese a declarar esa librería; requiere el repositorio `Sid-MB/transcoder-adapters`, lo que complica la integración en pipelines de producción y en servidores de inferencia convencionales.
- Entrenamiento limitado: un solo epoch, batch size de 1 y warmup del 5 %, configuración propia de un experimento de investigación más que de un modelo robusto.
- Madurez baja: 4 descargas, 0 *likes* y un único autor; sin mantenimiento garantizado ni comunidad que reporte errores.
- Sesgos potenciales: el corpus LMSYS-Chat-1M contiene conversaciones reales no curadas, por lo que los features aprendidos pueden reflejar sesgos presentes en esos diálogos.
- Uso responsable: al permitir *steering* de features y modificación del comportamiento interno, conviene extremar las precauciones en experimentos de seguridad y no desplegarlo directamente de cara al usuario final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_util_probe_tc32768_l1_0p0001_lr4e4_tc32768_decb_l1w0.0001_tarbb_sl15532696
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Modelo de referencia: https://huggingface.co/google/gemma-2-2b-it
- Repositorio de código: https://github.com/Sid-MB/transcoder-adapters
- Run de W&B: https://wandb.ai/siddharth-stanford/sparse-adaptation/runs/8v7hpgvu
- Configuración de entrenamiento: https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_util_probe_tc32768_l1_0p0001_lr4e4_tc32768_decb_l1w0.0001_tarbb_sl15532696/blob/main/training-config.yaml
- Dataset FineWeb 1M sample: https://huggingface.co/datasets/science-of-finetuning/fineweb-1m-sample
- Dataset LMSYS-Chat-1M splits: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
