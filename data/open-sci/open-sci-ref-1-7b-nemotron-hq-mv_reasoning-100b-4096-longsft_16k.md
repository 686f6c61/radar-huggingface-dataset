# open-sci/open-sci-ref-1.7b-nemotron-hq-mv_reasoning-100B-4096-longsft_16k

## Resumen

Open-sci-ref-1.7b-nemotron-hq-mv_reasoning-100B-4096-longsft_16k es un modelo de lenguaje denso de 1.700 millones de parametros desarrollado por el grupo open-sci como parte de un estudio de investigacion para una submission a NeurIPS 2026 titulada *Strong Post-Training from Permissive, Reasoning-Dominant, Web-Scale Pretraining*. El modelo se enmarca en un diseno experimental 2x2 que aisla dos variables del preentrenamiento a escala web: el corpus web de origen (MixtureVitae frente a Nemotron-CC) y la presencia o ausencia de datos de razonamiento e instrucciones en la fase de preentrenamiento.

Este checkpoint concreto parte del modelo base de 4096 tokens de contexto y se extiende a 16.384 tokens mediante escalado YaRN (factor 4.0) seguido de una epoca de ajuste supervisado de contexto largo. El resultado es un modelo de referencia ("ref") pensado para comparaciones controladas entre celdas del estudio, no como un producto final. La comparacion limpia y no confundida es frente a la celda sin datos de razonamiento (nemotron-hq-100B), ya que comparten sustrato web, receta, tokenizer y convencion de fin de documento, difiriendo unicamente en la presencia del subconjunto de razonamiento.

El modelo se distribuye con licencia Apache 2.0, pesos en safetensors y codigo de modelado personalizado (`modeling_opensci.py`), lo que exige confiar en implementaciones remotas al cargarlo con `transformers`. Por su tamano y contexto extendido resulta relevante para quienes investigan el efecto del enriquecimiento con datos de razonamiento en el preentrenamiento, y para experimentos de contexto largo en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (protocolo `open-sci-ref`), con codigo de modelado personalizado (`modeling_opensci.py`) |
| Parametros totales | 1.714.377.728 (1,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens (extendido desde 4.096 mediante YaRN factor 4.0) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 1,7B parametros entrenado bajo el protocolo `open-sci-ref` con el tokenizer GPT-NeoX (vocabulario de 50.304 entradas, almacenamiento uint16). El preentrenamiento consumio 100.000 millones de tokens en 23.842 iteraciones con longitud de secuencia de 4.096, RoPE theta de 100.000, schedule WSD, learning rate de 4e-3, cooldown lineal del 20 por ciento y batch global de 1.024, ejecutado en 64 nodos de 4 GH200. El corpus combina el sustrato web Nemotron-CC de alta calidad con el subconjunto de razonamiento de MixtureVitae, que es de licencia permisiva; por tanto, el modelo debe describirse como "Nemotron-CC web + MV reasoning subset" y no como un corpus enteramente no permisivo.

La extension de contexto a 16.384 tokens se realizo con escalado YaRN de factor 4.0 seguido de una epoca de `long_sft` sobre una mezcla de SeaLong y LongAlign (30 por ciento) y SmolTalk (70 por ciento), con learning rate 2e-4 coseno y 2 nodos de 4 GH200. La perdida final de entrenamiento reportada es 0,8250, frente a 0,9778 de la celda sin datos de razonamiento. El archivo `modeling_opensci.py` fue parcheado para que `OpensciModel.forward` acepte `**kwargs`, permitiendo que versiones recientes de `transformers` propaguen `num_items_in_batch` desde el Trainer y calculen correctamente el promedio de la perdida; sin el parche el entrenamiento falla con `TypeError`.

## Capacidades

- Generacion de texto autoregresiva en ingles con contexto de hasta 16.384 tokens.
- Razonamiento derivado del subconjunto de razonamiento de MixtureVitae presente en el preentrenamiento.
- Capacidad de seguir instrucciones adquirida mediante el ajuste `long_sft` sobre SmolTalk y datos de contexto largo.
- Manejo de entradas largas (documentos extensos, conversaciones multi-turno) gracias a la extension YaRN.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo solo procesa texto.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion sobre preentrenamiento a escala web: el modelo sirve como celda experimental para medir el efecto aislado del enriquecimiento con datos de razonamiento, comparandolo con `nemotron-hq-100B` bajo receta, tokenizer y sustrato identicos.
- Reproduccion de resultados para NeurIPS: permite replicar la curva de perdida y el comportamiento del ajuste de contexto largo descritos en la submission, con hiperparametros documentados (WSD, lr 4e-3, batch 1024, 23.842 iteraciones).
- Experimentos de contexto largo en hardware modesto: con 1,7B parametros y 16k de contexto, es viable ejecutar pruebas de recuperacion de informacion en pasajes largos en una unica GPU de consumo, algo inviable con modelos de decenas de miles de millones de parametros.
- Ajuste fino academico: su licencia Apache 2.0 y tamano reducido permiten hacer fine-tuning completo o con LoRA sobre datasets propios para estudiar transferencia desde preentrenamiento enriquecido con razonamiento.
- Evaluacion comparativa de recetas de preentrenamiento: util para analizar como la presencia de datos de razonamiento afecta a tareas de comprension lectora y generacion condicionada por instrucciones.
- Prototipado de pipelines de NLP en ingles: generacion de resumenes, extraccion de informacion o clasificacion de documentos largos en fase de prototipo, con la cautela de que es un checkpoint de investigacion y no un modelo afinado para produccion.
- Estudio de degradacion por extension de contexto: comparar el modelo de 4k con este de 16k para medir la perdida de calidad en el rango corto tras el escalado YaRN y el `long_sft`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida final de entrenamiento:

| Metrica | Este modelo (16k) | Celda sin razonamiento |
|---|---|---|
| Perdida final de entrenamiento | 0,8250 | 0,9778 |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para pesos, mas cache KV; con 16k de contexto el consumo adicional de cache KV puede elevar el total a varios GB por encima de los pesos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,7-2 GB para pesos; en 4 bits, alrededor de 1 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas para entrenamiento o ajuste fino: GH200, A100 80 GB o H100; el preentrenamiento original uso 64 nodos de 4 GH200 y el `long_sft` 2 nodos de 4 GH200.
- GPU de consumo: cabe en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090) en precision reducida o cuantizado, especialmente para contextos moderados.
- Opciones de despliegue: al usar codigo personalizado (`custom_code`, `modeling_opensci.py`), la carga requiere `trust_remote_code=True` en `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF oficiales limita el uso directo en llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (nemotron-hq-mv_reasoning-100B-4096-longsft_16k) | 1,7B | 16.384 | Apache 2.0 | Celda con datos de razonamiento, contexto extendido |
| open-sci-ref-v0.02-1.7b-nemotron-hq-mv_reasoning-100B-4096 | 1,7B | 4.096 | Apache 2.0 | Modelo base previo a la extension de contexto |
| nemotron-hq-100B (celda sin razonamiento) | 1,7B | 4.096 (version 16k disponible segun el estudio) | Apache 2.0 | Control experimental sin datos de razonamiento |
| MV-100BT / MV-noinstruct (celdas MixtureVitae) | 1,7B | 4.096 / 16.384 | Apache 2.0 | Mismo recipe con sustrato web MixtureVitae |

Las cuatro celdas del estudio 2x2 comparten receta, tokenizer y convencion de fin de documento, lo que permite comparaciones controladas. No se dispone de datos de rendimiento comparativo en benchmarks estandar.

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint de referencia para un estudio academico, no un modelo afinado para produccion ni evaluado con RLHF/DPO orientado a seguridad.
- Solo ingles: la model card declara unicamente `en`; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera bajo.
- Riesgo de alucinacion: al no haber pasado por un proceso de alineacion orientado a reducir fabricaciones, la probabilidad de generar contenido incorrecto con apariencia de veracidad es elevada.
- Sesgos: los corpus web a escala (Nemotron-CC) arrastran sesgos sociales y culturales que no se documentan ni mitigan en la model card.
- Codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar `modeling_opensci.py` antes de usarlo en entornos sensibles.
- Extension de contexto: el escalado YaRN y el `long_sft` pueden degradar el rendimiento en secuencias cortas respecto al modelo base de 4k; no se aportan mediciones al respecto.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un artefacto de investigacion sin garantias, su uso en produccion requiere validacion propia.
- Adopcion muy baja: 15 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Sin cuantizaciones oficiales publicadas, lo que limita el despliegue en entornos de bajos recursos sin conversion manual.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/open-sci-ref-1.7b-nemotron-hq-mv_reasoning-100B-4096-longsft_16k
- Modelo base de 4k: https://huggingface.co/laion/open-sci-ref-v0.02-1.7b-nemotron-hq-mv_reasoning-100B-4096 (referenciado en la model card)
- Paper de referencia: *Strong Post-Training from Permissive, Reasoning-Dominant, Web-Scale Pretraining* (NeurIPS 2026, submission; sin URL publica en la informacion disponible)
- Repositorio de datos MixtureVitae: no disponible en la informacion proporcionada
- Nemotron-CC: no disponible en la informacion proporcionada
