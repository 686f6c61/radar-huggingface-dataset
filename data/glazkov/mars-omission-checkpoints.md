# Glazkov/MARS-omission-checkpoints

## Resumen

MARS-omission-checkpoints es un repositorio de artefactos de investigacion congelados (checkpoints) asociados al proyecto MARS, centrado en la deteccion de omisiones en resumenes y en la reproducibilidad de resultados experimentales. Lo desarrolla el usuario Glazkov y no se trata de un modelo generativo convencional listo para produccion, sino de una coleccion de pesos y codigo de scoring para verificar hallazgos de investigacion sobre summarization. El repositorio empaqueta varios componentes: el detector principal MARS-C (tres semillas), el control de etiquetas B21, la linea base de investigacion MARS-2 (seis checkpoints) y un segmentador de inventario destilado basado en LongT5.

El modelo base declarado combina `google/long-t5-tglobal-base` (arquitectura LongT5 para contextos largos) y `microsoft/deberta-large-mnli` (encoder para clasificacion de inferencia natural). El repositorio pesa 16,7 GB y esta pensado para ejecutarse mediante scripts de scoring especificos incluidos en el propio repo y en el paquete de evaluacion MARS. La licencia es "component-specific", con un archivo LICENSES.md que detalla las condiciones por componente.

Su relevancia actual es metodologica: ofrece checkpoints con semillas fijas (20260906, 20260907, 20260908) y hashes de verificacion (CHECKPOINTS.sha256, EXPECTED_OUTPUTS.sha256) para reproducir byte a byte resultados de evaluacion sobre benchmarks como RoSE, CNN/DailyMail, XSum y SAMSum. No esta orientado a inferencia general, sino a auditoria y replicacion de experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LongT5 (transformer encoder-decoder con attention global) y DeBERTa-large (encoder); componentes auxiliares de scoring |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (LongT5-tglobal-base esta disenado para contextos largos, pero no se especifica cifra) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/cuantizadas documentadas) |
| Idiomas soportados | en (ingles) |
| Licencia | other / component-specific (ver LICENSES.md) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El repositorio agrupa varios artefactos con arquitecturas distintas. El segmentador de inventario se basa en `google/long-t5-tglobal-base`, un encoder-decoder T5 con attention global pensado para secuencias largas. El detector MARS-C emplea un verificador cross-encoder con convencion de un solo logit (`mc_score_units.py`). El control B21 usa un pipeline de scoring a tres vias (`m31_score_pipeline_all.py`). MARS-2 carga un backbone con cabeceras auxiliares mediante `mars_v2.dump`, y el componente de control de etiquetas se apoya en `microsoft/deberta-large-mnli`.

No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO. La model card indica que los checkpoints estan congelados con semillas concretas y que el entrenamiento se realizo sobre inventarios derivados (entidades y proposiciones) construidos con `m32_inventory.py`. La innovacion destacable es la reproducibilidad estricta: hashes de checkpoints, hashes de entradas (INPUTS.sha256) y hashes de salidas esperadas (EXPECTED_OUTPUTS.sha256), junto con un registro del entorno software y plataforma historicos.

## Capacidades

- Deteccion de omisiones en resumenes: evalua si un resumen candidato omite unidades de contenido presentes en la fuente.
- Scoring de unidades de contenido: procesa pares (fuente, candidato, unidades) y emite puntuaciones numericas por unidad.
- Segmentacion de inventario: divide texto en entidades y proposiciones mediante el segmentador LongT5 destilado.
- Verificacion de inferencia natural: el componente DeBERTa-large-mnli aporta clasificacion de entailment/neutral/contradiction como control de etiquetas.
- Reproducibilidad de experimentos: ejecucion determinista por semilla y comparacion de salidas contra referencias congeladas.
- Procesamiento en ingles: todo el pipeline esta orientado a texto en ingles.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking; no es un modelo conversacional.

## Casos de uso

- Auditoria de investigacion en summarization: un grupo de investigacion descarga el snapshot con `--revision` fijada y verifica `CHECKPOINTS.sha256` para replicar las puntuaciones publicadas sobre RoSE y comparar con `reference_scores/`.
- Validacion de metricas de omision: se ejecuta `mc_score_units.py` sobre pares fuente/candidato/unidades para obtener puntuaciones por unidad y contrastarlas con las doce salidas TEST de referencia.
- Construccion de inventarios de contenido: se usa `m32_inventory.py` con B1_DIR apuntando al directorio de pares del split para generar las proposiciones y entidades que alimentan el detector.
- Comparacion de segmentadores: se ejecuta `replay/e5_segmenter.py` en CUDA contra el segmentador original para medir diferencias en la segmentacion historica frente a la nueva.
- Control de etiquetas en experimentos de NLI: el componente DeBERTa-large-mnli permite comprobar si las etiquetas del juez introducen sesgo en la evaluacion de omisiones.
- Reproduccion byte a byte de benchmarks: combinando INPUTS.sha256, CHECKPOINTS.sha256 y EXPECTED_OUTPUTS.sha256 se puede verificar que las entradas, pesos y salidas coinciden exactamente con la ejecucion historica.
- Docencia y formacion en metodologia experimental: el repositorio sirve como ejemplo practico de empaquetado de checkpoints con semillas fijas, hashes y entorno registrado para ensenar reproducibilidad en ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio inclui referencias a benchmarks (RoSE, CNN/DailyMail, XSum, SAMSum) como entradas de evaluacion, pero no se proporcionan cifras de rendimiento en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo ocupa 16,7 GB en disco; la VRAM depende del checkpoint concreto cargado (LongT5-tglobal-base y DeBERTa-large son modelos de cientos de millones de parametros, pero no se especifica la cifra exacta).
- GPU recomendadas: no disponible. El script `replay/e5_segmenter.py` requiere CUDA para la comparacion de segmentadores.
- Compatibilidad con GPU consumer: probable para los componentes individuales (LongT5-base y DeBERTa-large caben en GPUs consumer de 8-16 GB), pero no confirmado en la informacion disponible para el conjunto completo.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; el despliegue se realiza mediante los scripts Python del propio repositorio (`mc_score_units.py`, `m31_score_pipeline_all.py`, `mars_v2.dump`, `replay/e5_segmenter.py`) con la libreria transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Glazkov/MARS-omission-checkpoints | no disponible | no disponible | Deteccion de omisiones / reproducibilidad | component-specific | Hugging Face |
| google/long-t5-tglobal-base | no disponible en la informacion | disenado para contextos largos | Summarization | no disponible en la informacion | Hugging Face |
| microsoft/deberta-large-mnli | no disponible en la informacion | no disponible | NLI (entailment) | no disponible en la informacion | Hugging Face |

Los dos modelos base son componentes del propio repositorio, no alternativas equivalentes. No se dispone de informacion sobre otros modelos de deteccion de omisiones comparables.

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera texto libre, no conversa y no soporta tool calling ni agentes.
- Solo ingles: todo el pipeline esta orientado a `en`.
- Reproducibilidad condicionada: la model card advierte que la descarga del benchmark por si sola no contiene los shards de proposiciones ni los inventarios congelados; la reproduccion byte a byte exige entradas coincidentes.
- Texto de benchmark omitido: el release no inclui el texto original de los benchmarks ni las respuestas individuales de los anotadores, lo que limita la reauditoria completa.
- Licencia fragmentada: la licencia "other / component-specific" obliga a revisar LICENSES.md antes de cualquier uso comercial; no se garantiza uso comercial libre.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre inventarios derivados de benchmarks en ingles, puede heredar sesgos de esos corpus.
- Riesgo de alucinacion: no aplica en el sentido generativo clasico, pero las puntuaciones del detector pueden ser erroneas si las unidades de contenido de entrada estan mal segmentadas.
- Dependencia de entorno: `environment/` registra software y plataforma historicos; versiones distintas de dependencias pueden alterar resultados.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/Glazkov/MARS-omission-checkpoints
- Licencias por componente: https://huggingface.co/Glazkov/MARS-omission-checkpoints/blob/main/LICENSES.md
- Paquete de evaluacion MARS: https://github.com/Glazkoff/mars
- Repositorio RoSE (benchmark): https://github.com/Yale-LILY/ROSE
- Modelo base LongT5: https://huggingface.co/google/long-t5-tglobal-base
- Modelo base DeBERTa MNLI: https://huggingface.co/microsoft/deberta-large-mnli
