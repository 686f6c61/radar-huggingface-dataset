# Monyzik/qwen35-rubert-large-ensemble-balanced

## Resumen

El modelo `Monyzik/qwen35-rubert-large-ensemble-balanced` es un paquete de inferencia compuesto, no un checkpoint unico cargable con `AutoModel.from_pretrained`. Lo publica el usuario Monyzik en Hugging Face y combina dos adaptadores LoRA sobre el modelo base Qwen/Qwen3.5-0.8B con un modelo completo FactSetNet basado en ai-forever/ruBert-large, junto con un pequeno modulo Fact/date nativo de Qwen y reglas de fusion fijas. Su proposito es la extraccion de hechos con informacion temporal en conversaciones telefonicas en ruso, una tarea de extraccion de informacion estructurada a partir de transcripciones.

El paquete resuelve el problema de extraer hechos verificables (con cita, hablante y fecha) de llamadas multi-turno, combinando un modelo generativo pequeno afinado con LoRA y un encoder BERT grande afinado especificamente para la tarea. La relevancia actual reside en que demuestra un patron de ensemble hibrido generativo-encoder para extraccion de informacion con requisitos de grounding estricto, con tres perfiles de fusion (balanced, state, coverage) que ajustan el compromiso entre precision, recall y precision de estado.

El modelo solo soporta ruso, no declara licencia en la informacion disponible, y su evaluacion se limita a un conjunto de validacion de 383 llamadas y 1.845 hechos de referencia. El repositorio ocupa 2,0 GB y el conjunto completo de pesos de inferencia con el base externo suma 3.457 GiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble hibrido: Qwen3.5-0.8B con dos adaptadores LoRA (generativo) + FactSetNet sobre ruBert-large (encoder) + modulo Fact/date de Qwen |
| Parametros totales | 1.364.599.532 (con el base Qwen compartido entre las dos LoRA; el pequeno Fact encoder/donor se cuenta una vez) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ruBERT-large en FP32 originales; no se documentan cuantizaciones) |
| Idiomas soportados | ruso (ru) |
| Licencia | no disponible |
| Formato de pesos | safetensors y pytorch; el paquete incluye LoRA, checkpoint FactSetNet, config, tokenizer y catalogo |
| Modelo base | Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17) y ai-forever/ruBert-large |
| Tamano del repositorio | 2,0 GB |
| Volumen total de pesos de inferencia | 3.711.915.067 bytes / 3,457 GiB (con el base Qwen externo) |
| SHA256 de pesos ruBERT-large | 8ae1cfc7841a602eda53cc8976cc61df37f84b30a8c2f55719a21feaddaa2630 |

## Arquitectura y entrenamiento

El sistema es un ensemble de dos familias de modelos. Por un lado, Qwen3.5-0.8B actua como extractor generativo mediante dos adaptadores LoRA afinados (v3, checkpoint 400), mas un pequeno modulo Fact encoder/donor y una cabeza de fecha en su septima epoca. Por otro lado, FactSetNet sobre ruBert-large es un encoder BERT afinado de forma completa (checkpoint 3) que realiza una unica pasada forward por llamada. La fusion combina las salidas de ambos componentes aplicando reglas fijas: solo se anaden hechos con cita confirmada y hablante coherente, y se protege la modificacion de fechas de los hechos originales de Qwen preservando la apertura y el orden de los estados actuales.

Los umbrales y modos de fusion se seleccionaron sobre 128 llamadas de desarrollo reutilizadas. Para algunos atributos se toma un unico donante actual por objeto predicho. La deduplicacion se limita a acuerdos y se eligio en dev. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La evaluacion se realizo con un scorer v2.1 con catalogo, sobre validacion oficial de 383 llamadas y 1.845 hechos de referencia.

## Capacidades

- Extraccion de hechos (fact extraction) a partir de transcripciones de llamadas en ruso, con cita textual y atribucion de hablante.
- Extraccion de informacion temporal: fechas asociadas a hechos y pares temporales correctos.
- Prediccion de estado (state) de los hechos, con precision de estado medida de forma independiente.
- Grounding a nivel de turno y de span: el modelo localiza el turno y el fragmento de texto que respalda cada hecho.
- Tres perfiles de fusion configurables: `balanced` (por defecto), `state` y `coverage`, que ajustan umbrales y reglas de fusion sobre los mismos pesos.
- Procesamiento de conversaciones multi-turno con estructura JSONL de entrada (`call_id`, `started_at`, `turns` con `idx`, `speaker`, `text`).
- Ejecucion en CPU (float32) para el componente ruBERT-large y en GPU para Qwen; soporta reutilizacion de salidas finales de Qwen v3 ya calculadas.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Extraccion de hechos en centros de llamadas: el paquete procesa transcripciones de llamadas telefonicas en ruso y devuelve hechos estructurados con cita, hablante y fecha, adecuado para auditar conversaciones de atencion al cliente sin revision manual completa.
- Analisis de cumplimiento normativo: la exigencia de cita confirmada y hablante coherente en la fusion permite generar registros trazables de lo que se dijo y cuando, util para auditorias internas.
- Poblacion de bases de datos de clientes: los hechos extraidos con estado y fecha pueden alimentar CRM o sistemas de registro, con los perfiles `state` o `coverage` segun se priorice precision de estado o cobertura temporal.
- Investigacion en extraccion de informacion temporal: el paquete sirve como referencia reproducible de un ensemble generativo-encoder con reglas de fusion documentadas y umbrales publicados.
- Procesamiento por lotes de grabaciones historicas: la entrada JSONL y la CLI `predict_ensemble.py` permiten ejecutar lotes de llamadas con salida en `final/predictions.jsonl` mas auditoria y manifiestos intermedios.
- Reutilizacion de inferencia Qwen ya calculada: con `--cached-qwen` se pueden recomputar solo las partes de fusion y ruBERT-large sobre predicciones Qwen v3 existentes, util para iterar sobre umbrales sin repetir los dos pases GPU de Qwen.
- Evaluacion comparativa de arquitecturas de extraccion: los perfiles balanced, state y coverage permiten estudiar el compromiso precision-recall-estado sobre el mismo conjunto de pesos.

## Benchmarks y rendimiento

Validacion oficial: 383 llamadas, 1.845 hechos de referencia, scorer v2.1 con catalogo. Los tres perfiles usan los mismos pesos; solo cambian umbrales y reglas de fusion.

| Metrica | balanced (por defecto) | state | coverage |
|---|---:|---:|---:|
| Precision | 47,40% | 44,43% | 44,52% |
| Recall | 58,70% | 60,54% | 60,38% |
| Fact F1 | 52,45% | 51,25% | 51,25% |
| Temporal recall | 48,44% | 48,63% | 48,84% |
| State accuracy | 59,07% | 63,08% | 62,76% |
| Grounding turn | 78,30% | 78,60% | 78,64% |
| Grounding span | 94,16% | 94,09% | 94,06% |

Recuentos del perfil balanced: 1.083 hechos coincidentes sobre 2.285 predicciones; 327/675 pares temporales correctos; 368/623 estados correctos. Perfil state: 338/695 pares temporales y 393/623 estados. El recall temporal usa un denominador condicional de hechos coincidentes con fechas recuperables, por lo que su porcentaje alto no implica cobertura completa del conjunto de referencia.

Comparaciones declaradas por el autor: el ensemble Qwen+ruBERT-base warm obtuvo 52,85% / 48,59% / 58,91% (F1 / temporal / state), por lo que ruBERT-large no supera a esa variante en todas las metricas. El ensemble Qwen v2 previo obtuvo F1 55,04% con temporal 45,36% y state 53,93%. El perfil balanced se eligio manteniendo Fact F1 no inferior al Qwen v3 solo: 52,45% frente a 52,35%, temporal 48,44% frente a 48,13% y state 59,07% frente a 55,38%.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Tampoco se han medido la aceleracion relativa al baseline, los segundos de GPU ni el test adversarial completo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El volumen total de pesos de inferencia con el base Qwen externo es de 3,457 GiB, pero el autor advierte que el tamano de archivos no equivale al pico de RAM/VRAM.
- El componente ruBERT-large se valido en CPU float32 con Torch 2.15.0, Transformers 4.57.6 y 4 hilos; Qwen v3 se valido con Torch 2.15.0+cu132, Transformers 5.23.0 y PEFT 0.21.3.
- Qwen realiza dos pases GPU por llamada; ruBERT-large realiza un unico forward por llamada. Los componentes se cargan de forma secuencial, lo que reduce el pico de memoria frente a una carga simultanea.
- GPU recomendadas: no disponible. El autor no especifica modelos de GPU concretos.
- Cabe en GPU de consumo: no disponible; no se documenta.
- Despliegue: CLI propia `predict_ensemble.py` con presets `balanced`, `state` y `coverage`; requiere dos entornos virtuales separados (`qwen-env` con Python 3.11 y `fact-env` con Python 3.12) por incompatibilidad de versiones de Transformers entre Qwen y FactSetNet. Soporta `--fact-device cpu` y `--threads`.
- Latencia y throughput: no disponibles; el autor indica que no se midieron segundos de GPU.
- Descarga: `snapshot_download` del paquete y del base Qwen por revision exacta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 / temporal / state | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-rubert-large-ensemble-balanced | 1.364.599.532 | no disponible | 52,45% / 48,44% / 59,07% (balanced) | no disponible | Hugging Face (Monyzik) |
| Qwen+ruBERT-base warm ensemble (mismo autor) | no disponible | no disponible | 52,85% / 48,59% / 58,91% | no disponible | Hugging Face (mismo autor) |
| Qwen v2 ensemble (mismo autor) | no disponible | no disponible | 55,04% / 45,36% / 53,93% | no disponible | Hugging Face (mismo autor) |
| Qwen v3 solo (componente) | no disponible | no disponible | 52,35% / 48,13% / 55,38% | no disponible | Hugging Face (Qwen/Qwen3.5-0.8B) |

No se dispone de comparativas con modelos de terceros de la misma categoria en la informacion proporcionada; las unicas alternativas documentadas son variantes del mismo autor.

## Limitaciones y advertencias

- El paquete no es un checkpoint unico: requiere `predict_ensemble.py` y dos entornos Python separados; no se puede cargar con `AutoModel.from_pretrained`.
- Solo soporta ruso; no se documenta soporte multilingue.
- Licencia no declarada en la informacion disponible: no se puede confirmar el uso comercial.
- Los resultados de validacion son modestos en terminos absolutos (Fact F1 52,45%, precision 47,40%), lo que implica una tasa alta de falsos positivos en produccion.
- El recall temporal se calcula sobre un denominador condicional (hechos coincidentes con fechas recuperables); no refleja cobertura completa del conjunto de referencia.
- Diferencias numericas entre CPU y CUDA pueden alterar decisiones en los bordes de umbral: en el perfil Large original vario 1 de 383 resultados, sin garantia de identidad byte a byte entre plataformas.
- No se han medido la aceleracion frente al baseline, el consumo de GPU ni el rendimiento en un test adversarial completo; el autor advierte que los resultados no demuestran el cumplimiento de todos los requisitos del caso.
- Los umbrales y modos de fusion se seleccionaron sobre solo 128 llamadas de desarrollo, lo que puede implicar sobreajuste a ese conjunto.
- Riesgo de alucinacion: no se documenta de forma explicita, pero al tratarse de un componente generativo (Qwen) con extraccion de hechos, existe riesgo inherente de hechos no respaldados; la fusion mitiga parte con la exigencia de cita confirmada.
- Sesgos conocidos: no documentados en la informacion disponible.
- El repositorio no incluye datasets ni predicciones de clientes; el tamano de archivos no equivale al pico de RAM/VRAM real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Monyzik/qwen35-rubert-large-ensemble-balanced
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base ruBERT-large: https://huggingface.co/ai-forever/ruBert-large
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
