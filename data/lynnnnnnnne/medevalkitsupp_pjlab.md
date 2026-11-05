# Lynnnnnnnne/medevalkitsupp_pjlab

## Resumen

`medevalkitsupp_pjlab` es un repositorio de pesos y scripts suplementarios publicado por el usuario Lynnnnnnnne en HuggingFace, no un modelo de lenguaje en sentido estricto. Su funcion es proporcionar los artefactos necesarios para reproducir las metricas del informe MedEvalKit, concretamente las metricas CE (basadas en CheXbert) y RaTE (Radiotherapy-aware Text Evaluation, segun la nomenclatura del propio repositorio), orientadas a la evaluacion de informes radiologicos generados automaticamente.

El paquete incluye el codigo de PromptMRG con el script `compute_chexbert_ce.py`, los pesos de CheXbert (`chexbert.pth`) en dos rutas alternativas, el codigo de calculo de metricas NLG y RaTE (con soporte para BERTScore) y los encoders auxiliares necesarios: RaTE-NER-Deberta, el modelo de embeddings BioLORD-2023-C y el paquete RaTEScore. Tambien incorpora un modulo de constantes de rutas (`medevalkit_paths.py`) para configurar el entorno mediante variables como `MEDEVALKIT_ROOT`, `PROMPTMRG_BERT_PATH` y `CHEXBERT_PATH`.

Es relevante para investigadores que trabajen en generacion de informes radiologicos y necesiten replicar exactamente las metricas de evaluacion de MedEvalKit sin descargar el repositorio completo (la version "lean" omite las caracteristicas de clip de 4 GB). No se trata de un modelo generativo: no hay arquitectura de lenguaje, tokenizador ni pesos de inferencia de texto descritos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de artefactos de evaluacion, no un modelo unico) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch) para CheXbert; resto de componentes sin formato especificado |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento de ningun modelo propio. Agrupa componentes de terceros y codigo de evaluacion. El unico peso binario descrito es `chexbert.pth`, correspondiente al modelo CheXbert (Stanford), un clasificador basado en BERT que asigna etiquetas de hallazgos radiologicos a informes de torax y que se usa para calcular la metrica CE. El repositorio incluye tambien un checkpoint de `bert-base-uncased` en `PromptMRG/checkpoints/bert-base-uncased` como dependencia del codigo de PromptMRG.

Para RaTE se incluyen dos encoders: `RaTE-NER-Deberta` (reconocimiento de entidades nombradas sobre texto clinico) y `BioLORD-2023-C` (modelo de embeddings biomedicos) junto con el paquete `RaTEScore`. El script `cal_report_metrics_conversations_gt.py` actua como punto de entrada para metricas NLG, RaTE y BERTScore. No se especifican datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Calculo de la metrica CE (CheXbert) sobre informes radiologicos mediante `scripts/compute_chexbert_ce.py`, con entrada JSON y salida JSON.
- Calculo de metricas NLG y RaTE, incluido BERTScore, mediante `utils/Metrics_Compute/cal_report_metrics_conversations_gt.py`.
- Evaluacion de conversaciones con ground truth (el nombre del script indica soporte para `conversations_gt`).
- Extraccion de entidades clinicas para RaTE mediante el encoder NER DeBERTa incluido.
- Embeddings semanticos biomedicos via BioLORD-2023-C para el calculo de similitud en RaTE.
- Configuracion portable mediante variables de entorno y constantes de ruta centralizadas en `utils/medevalkit_paths.py`.
- Version "lean" que omite las caracteristicas de clip de 4 GB para reducir el tamano de descarga.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling ni agentes.

## Casos de uso

- Replicacion de metricas de un informe MedEvalKit: el paquete permite reconstruir exactamente los valores CE y RaTE publicados, fijando `MEDEVALKIT_ROOT` y ejecutando `compute_chexbert_ce.py` sobre los mismos JSON de entrada.
- Evaluacion de sistemas de generacion de informes de torax: CheXbert etiqueta los hallazgos del informe generado y del de referencia, y el script calcula la metrica CE para comparar ambos conjuntos de etiquetas.
- Benchmarking de modelos de vision-lenguaje medicos: integracion de las metricas NLG, RaTE y BERTScore en pipelines de evaluacion comparativa entre modelos generadores de informes.
- Validacion de pipelines de NLP clinico en investigacion: uso de RaTE-NER-Deberta y BioLORD-2023-C para medir fidelidad semantica y cobertura de entidades en textos radiologicos.
- Reproducibilidad en publicaciones: al incluir los pesos y las rutas por defecto, permite que terceros reejecuten la evaluacion sin depender de descargas externas ni de rutas absolutas del autor.
- Integracion en CI de investigacion: el script CLI con entrada y salida JSON facilita automatizar la evaluacion de nuevos checkpoints en cada iteracion de entrenamiento.
- Despliegue en entornos con espacio limitado: la variante lean evita los 4 GB de caracteristicas de clip, lo que simplifica su instalacion en maquinas de evaluacion sin GPU de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Los componentes incluidos (CheXbert basado en BERT, DeBERTa para NER, BioLORD-2023-C para embeddings) son modelos de la familia BERT, por lo que en la practica caben en GPU consumer, pero no se aportan cifras oficiales.
- GPU recomendadas: no disponible en la documentacion.
- Compatibilidad con GPU consumer: no confirmada explicitamente; por el tamano de los encoders BERT incluidos es previsible que funcione en tarjetas de gama media, sin datos oficiales.
- Opciones de despliegue: ejecucion directa con Python y PyTorch segun los comandos del README (`python scripts/compute_chexbert_ce.py --input reports.json --out ce.json`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo | Contenido | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Lynnnnnnnne/medevalkitsupp_pjlab` | Artefactos de evaluacion | Pesos CheXbert, encoders RaTE, scripts de metricas | no disponible | HuggingFace, 0 descargas |
| MedEvalKit (repositorio principal) | Framework de evaluacion | Suite completa de metricas y datos | no disponible en esta ficha | Referenciado como origen (`MEDEVALKIT_ROOT`) |
| CheXbert (Stanford) | Clasificador de hallazgos | Pesos `chexbert.pth` | no disponible en esta ficha | Incluido como dependencia en este repositorio |

No se dispone de datos de rendimiento ni de licencia de las alternativas en la informacion proporcionada, por lo que la comparativa se limita a la composicion y el rol de cada paquete.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse como generador; su uso es exclusivamente como soporte de metricas.
- Ausencia total de licencia declarada: no se puede asumir permiso de uso comercial ni de redistribucion de los pesos incluidos (`chexbert.pth`, encoders DeBERTa y BioLORD).
- Sin model card tecnica: no hay informacion sobre datos de entrenamiento, sesgos ni validacion de los componentes incluidos.
- Dependencia de rutas: requiere definir correctamente `MEDEVALKIT_ROOT`, `PROMPTMRG_BERT_PATH` y `CHEXBERT_PATH`; una configuracion incorrecta provoca fallos en los scripts.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso ni de validacion por parte de la comunidad.
- Fecha de creacion y actualizacion en 2026: verificar la vigencia de los artefactos antes de integrarlos en produccion.
- La version lean omite las caracteristicas de clip de 4 GB, por lo que ciertas metricas que dependan de ellas no podran calcularse con este paquete.
- Riesgo de alucinacion y sesgos: no aplica al no ser un modelo generativo, pero los clasificadores subyacentes (CheXbert) heredan los sesgos de sus datos de entrenamiento originales, no documentados aqui.

## Enlaces

- HuggingFace: https://huggingface.co/Lynnnnnnnne/medevalkitsupp_pjlab
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
