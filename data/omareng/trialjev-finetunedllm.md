# omareng/TrialJev-FineTunedLLM

## Resumen

TrialJev-FineTunedLLM es un adaptador LoRA de investigación publicado por omareng (Omar Ibrahim y colaboradores) que convierte modelos Qwen 3.5 y 3.8 en clasificadores binarios de elegibilidad para ensayos clínicos. El modelo escribe literalmente la palabra "Eligible" o "Excluded" tras recibir la nota clínica de un paciente y el texto de un criterio de elegibilidad, y se detiene con el token de fin de secuencia. Se trata de un modelo de comparación dentro del proyecto TrialJev, que propone un método alternativo de puntuación de una sola pasada; este adaptador implementa el enfoque generativo convencional con entropía cruzada sobre todo el vocabulario para servir de línea base.

El repositorio contiene seis checkpoints independientes, cada uno con su propio backbone: Qwen3.5-0.8B-Base, Qwen3.5-9B-Base (tres semillas) y dos variantes de 27B (Qwen3.5-27B y Qwen3.8-27B). Todos comparten la misma configuración de LoRA (rango 16, alpha 32, dropout 0.05) y el mismo esquema de entrenamiento sobre TREC Clinical Trials 2021, con evaluación sobre 6.975 pares elegible-o-excluido procedentes de 50 pacientes no vistos de TREC 2022.

La relevancia del modelo es metodológica: demuestra que un ajuste generativo estándar sobre backbones pequeños (0.8B) alcanza un 74,05% de accuracy, mientras que los backbones de 27B llegan a un 79,93% con un AUROC de 0,888. El autor lo marca explícitamente como vista previa de investigación, no apta para decisiones clínicas ni inscripción real de pacientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen 3.5 / 3.8) con adaptador LoRA sobre proyecciones de atención, MLP y Gated DeltaNet |
| Parametros totales | No disponible (el adaptador LoRA no incluye los pesos del backbone; el tamaño del backbone varía entre 0,8B y 27B) |
| Parametros activos | No disponible |
| Longitud de contexto | Entrada limitada a 512 tokens para la nota del paciente y 4.096 tokens para el estado más el texto del ensayo |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del backbone) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); `head.pt` como pickle de PyTorch con tensores de la cabeza de puntero |

## Arquitectura y entrenamiento

El adaptador se aplica sobre backbones Qwen de la familia 3.5 y 3.8, que emplean atención con componentes Gated DeltaNet. El ajuste LoRA tiene rango 16, alpha 32 y dropout 0,05, y se aplica sobre las proyecciones de atención, MLP y Gated DeltaNet. La optimización usa AdamW con learning rate 1e-4 (one-cycle con 5% de warm-up), weight decay 0,01, gradient clipping 1,0, batch efectivo de 16 y 3 épocas (1.746 pasos). La precisión es fp32 para el backbone de 0,8B y bf16 para 9B y superiores.

Los datos de entrenamiento provienen de TREC Clinical Trials 2021: 60 pacientes de entrenamiento con 9.302 pares elegible-o-excluido y una partición de desarrollo de 15 pacientes con 2.233 pares. La selección de checkpoint se hace por menor pérdida en desarrollo, comprobando cada 100 pasos en el modelo de 0,8B y cada 200 en los de 9B y superiores; el conjunto de test se puntúa una sola vez. La innovación técnica es modesta pero deliberada: el objetivo de entrenamiento es la palabra de respuesta seguida del token de fin de secuencia, con pérdida sobre todo el vocabulario en los tokens de respuesta, y la inferencia decodifica de forma greedy hasta el token de fin. Los datos procesados no se redistribuyen por derivar de TREC y de ClinicalTrials.gov; el repositorio de código explica cómo reconstruirlos y publica hashes SHA-256.

## Capacidades

- Clasificación binaria de elegibilidad paciente-ensayo: emite "Eligible" o "Excluded" como veredicto escrito.
- Puntuación de una sola pasada por par paciente-criterio, sin generación de rationale ni explicación.
- Puntuación AUROC derivada del primer token de la respuesta de dos vías (según la model card, el AUROC proviene del score de dos vías del primer token).
- Adaptación ligera mediante LoRA sobre seis backbones distintos, lo que permite comparar el efecto del tamaño del modelo.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso de forma documentada.
- Capacidades multilingües: no documentadas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en recuperación clínica: uso como línea base generativa para comparar con el método propuesto en TrialJev, evaluando accuracy y macro-F1 sobre pares elegible-o-excluido de TREC.
- Filtrado previo de candidatos en pipelines de matching paciente-ensayo: el modelo clasifica pares ya recuperados por un sistema de retrieval, reduciendo la carga de revisión manual en estudios de factibilidad.
- Análisis de sensibilidad al tamaño del modelo: los seis checkpoints permiten estudiar cómo escala el rendimiento entre 0,8B, 9B y 27B con idéntica configuración de LoRA y datos.
- Estudio de calibración y umbrales: aunque el veredicto escrito no lleva probabilidad, el score del primer token permite analizar AUROC y elegir un cutoff sobre datos de desarrollo.
- Reproducibilidad metodológica: los subdirectorios incluyen `training_config.json`, `training_metrics.json`, el log de entrenamiento y `SHA256SUMS.txt`, lo que facilita replicar experimentos.
- Docencia y experimentación con PEFT: ejemplo completo de ajuste LoRA sobre backbones Qwen con datos de dominio clínico y evaluación estricta por paciente.
- Evaluación comparativa de backbones Qwen 3.5 frente a 3.8 en una tarea de clasificación binaria con contexto largo (hasta 4.096 tokens).

## Benchmarks y rendimiento

Evaluación sobre 6.975 pares elegible-o-excluido de 50 pacientes no vistos de TREC 2022. La línea base trivial (predecir siempre "eligible") obtiene un 56,47% de accuracy. Los intervalos de confianza al 95% son de aproximadamente ±3 puntos porque las 50 personas del test son las unidades independientes.

| Checkpoint | Backbone | Paso | Accuracy | Macro-F1 | AUROC | Brier | ECE |
|---|---|---:|---:|---:|---:|---:|---:|
| `qwen3.5-0.8b-fresh-seed0` | Qwen3.5-0.8B-Base | 800 | 74,05% | 73,0% | 0,802 | n/a | n/a |
| `qwen3.5-9b-seed0` | Qwen3.5-9B-Base | 400 | 79,50% | 78,5% | 0,864 | n/a | n/a |
| `qwen3.5-9b-seed1` | Qwen3.5-9B-Base | 400 | 79,84% | 79,0% | 0,862 | n/a | n/a |
| `qwen3.5-9b-seed2` | Qwen3.5-9B-Base | 200 | 75,68% | 75,7% | 0,860 | n/a | n/a |
| `qwen3.5-27b` | Qwen3.5-27B | 200 | 79,87% | 79,8% | 0,879 | n/a | n/a |
| `qwen3.8-27b` | Qwen3.8-27B | 200 | 79,93% | 79,9% | 0,888 | n/a | n/a |

Brier y ECE no se reportan para estos checkpoints porque el veredicto escrito no conlleva probabilidad. Los números de 27B y Qwen3.8-27B son de una sola semilla. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; depende del backbone elegido (0,8B, 9B o 27B) y de su cuantización.
- GPU recomendadas: no especificadas por el autor; por tamaño de backbone, los de 27B requieren GPUs de clase A100/H100 o equivalentes con suficiente VRAM para bf16.
- Viabilidad en GPU de consumo: el checkpoint de 0,8B es el único claramente susceptible de ejecutarse en GPU de consumo; los de 9B y 27B requieren evaluar cuantización y VRAM disponible, dato no documentado.
- Opciones de despliegue: la model card solo documenta `snapshot_download` de HuggingFace Hub y el script `scripts/generate_baselines.py` del repositorio de código con `--condition sft-generate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota de despliegue: el adaptador no incluye los pesos del backbone; es necesario cargar el modelo Qwen correspondiente en la revisión indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (TREC 2022) | AUROC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TrialJev-FineTunedLLM (qwen3.8-27b) | Backbone 27B + LoRA | 512 + 4.096 tokens | 79,93% | 0,888 | Apache-2.0 | HuggingFace (adaptador) |
| TrialJev-FineTunedLLM (qwen3.5-0.8b) | Backbone 0,8B + LoRA | 512 + 4.096 tokens | 74,05% | 0,802 | Apache-2.0 | HuggingFace (adaptador) |
| TrialJev (método propuesto) | No disponible | No disponible | No disponible en esta ficha | No disponible en esta ficha | Apache-2.0 (según referencia) | Repositorio de código |
| MedJev / kev (referencias de diseño) | No disponible | No disponible | No disponible | No disponible | Apache-2.0 | No disponible |

No se dispone de datos de benchmarks de MedJev, kev ni de otros modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa se limita a los propios checkpoints del repositorio.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: no apto para decisiones clínicas, inscripción en ensayos ni atención al paciente.
- Evaluación sobre un único benchmark de 50 pacientes sintéticos, con intervalos de confianza de ±3 puntos.
- Los pares evaluados ya habían sido juzgados como relevantes por los anotadores; la tarea no es de retrieval.
- Notas de paciente sintéticas y cortas, lo que puede no reflejar la variabilidad de la práctica clínica real.
- El modelo no produce explicación ni rationale del veredicto.
- El veredicto escrito no constituye una probabilidad calibrada; cualquier cutoff debe elegirse sobre datos de desarrollo.
- Los resultados de 27B y Qwen3.8-27B provienen de una sola semilla.
- Los checkpoints seed-0 de 9B y 27B no registraron la revisión del backbone en el momento del entrenamiento; la revisión mostrada es la única instantánea en la caché de entrenamiento.
- `head.pt` es un pickle de PyTorch con tensores de la cabeza de puntero y metadatos; debe cargarse únicamente desde este repositorio por riesgo de ejecución de código arbitrario.
- Los datos procesados no se redistribuyen; es necesario reconstruirlos desde TREC y ClinicalTrials.gov siguiendo el repositorio de código.
- Licencia Apache-2.0 permite uso comercial del adaptador, pero las restricciones de uso clínico y la dependencia de los términos de TREC y ClinicalTrials.gov para los datos limitan su aplicación en producción.
- No se documentan sesgos demográficos ni evaluaciones de equidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omareng/TrialJev-FineTunedLLM
- Repositorio de código TrialJev: https://github.com/oibrahi1/TrialJev
- Documentación de resultados del repositorio: `docs/RESULTS.md` dentro del repositorio de código
- Cita (BibTeX): Ibrahim, Omar; Hamblin, Grant; Haibe-Kains, Benjamin. "TrialJev: Open-Weight Single-Pass Eligibility Scoring for Patient–Trial Screening", 2026.
- Backbone Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Backbone Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Backbone Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Backbone Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
