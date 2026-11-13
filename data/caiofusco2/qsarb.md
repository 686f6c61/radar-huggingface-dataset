# caiofusco2/qsarb

## Resumen

`caiofusco2/qsarb` es un modelo predictivo de QSAR (Quantitative Structure-Activity Relationship) publicado en Hugging Face por el investigador Caio dos Santos Fusco (ORCID 0009-0003-6416-9788). No se trata de un modelo de lenguaje: es un artefacto de aprendizaje automatico entrenado dentro de la plataforma de codigo abierto QSAR IA, orientada al ciclo de vida completo de proyectos QSAR y quimioinformatica en descubrimiento de farmacos. El repositorio contiene pesos en formato PyTorch (`projects/trains/1/model.pt`) acompanados de un sello de autoria criptografico (`autoria.json` con SHA-256 del modelo, ORCID y firma Ed25519).

La relevancia del modelo es metodologica mas que de rendimiento: propone un mecanismo de trazabilidad y reproducibilidad cientifica basado en firmas criptograficas encadenadas, de modo que los modelos reentrenados conservan la cadena de autores previos. El repositorio es practicamente vacio en cuanto a documentacion tecnica (0.0 GB, 0 descargas, 0 likes en el momento de la consulta) y no publica arquitectura, datos de entrenamiento, metrica alguna ni el endpoint o tarea concreta que predice.

Por tanto, esta ficha describe lo que el autor declara explicitamente y marca como "no disponible" todo aquello que la model card omite. Cualquier evaluacion de idoneidad para produccion exige contactar con el autor o inspeccionar el propio `model.pt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo predictivo, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`) |
| Tarea | QSAR / prediccion molecular (concreta no especificada) |
| Plataforma de origen | QSAR IA (open source) |
| Sello de autoria | SHA-256 + ORCID + firma Ed25519 (`autoria.json`) |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (tipo de red, numero de capas, dimensiones de entrada, representacion molecular empleada — fingerprints, descriptores, grafos o SMILES — ni funcion de perdida). Tampoco se detalla el conjunto de datos de entrenamiento, el numero de compuestos, la variable objetivo (actividad biologica, toxicidad, propiedad ADMET, etc.) ni si se aplicaron tecnicas de regularizacion, validacion cruzada o ajuste de hiperparametros.

La unica innovacion tecnica documentada es el sello de autoria: cada modelo entrenado en `projects/trains/<n>/model.pt` lleva asociado un `autoria.json` con el hash SHA-256 de los pesos, el ORCID del investigador y una firma Ed25519. Los modelos reentrenados incorporan la cadena firmada de autores anteriores, lo que permite verificar procedencia e integridad sin depender de la reputacion del repositorio. Es un mecanismo de procedencia criptografica, no de mejora del rendimiento predictivo.

## Capacidades

- Prediccion QSAR: el autor declara que el modelo es "predictivo" y esta orientado a estudios de relacion estructura-actividad, aunque no especifica la variable objetivo ni el dominio quimico concreto.
- Integracion en la plataforma QSAR IA: pensado para ejecutarse dentro del ecosistema de la plataforma (flujos de entrenamiento, publicacion y reutilizacion).
- Verificacion de procedencia: los pesos pueden validarse contra el hash SHA-256 y la firma Ed25519 del fichero `autoria.json`.
- Reentrenamiento con cadena de autoria: los modelos derivados conservan la trazabilidad de autores previos.
- No consta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision, audio ni modo de pensamiento. No es un modelo generativo de texto.

## Casos de uso

- Triaje virtual de compuestos en descubrimiento temprano: usar el modelo como filtro predictivo sobre una libreria quimica para priorizar candidatos antes de ensayos in vitro, siempre que se valide previamente la variable objetivo real del `model.pt`.
- Reproducibilidad de estudios QSAR: publicar pesos junto al sello `autoria.json` permite a revisores verificar que el modelo evaluado es exactamente el descrito en la publicacion, mitigando el problema de artefactos no reproducibles.
- Auditoria de procedencia en entornos regulados: la firma Ed25519 y el hash SHA-256 permiten demostrar integridad del modelo en flujos de validacion interna farmaceutica.
- Reutilizacion docente: como ejemplo practico de pipeline QSAR completo dentro de la plataforma QSAR IA, util en cursos de quimioinformatica y machine learning aplicado.
- Base para transferencia o reentrenamiento: partir de estos pesos y reentrenar con datos propios, conservando la cadena de autoria firmada del modelo original.
- Integracion en pipelines internos de quimioinformatica: cargar `model.pt` con PyTorch dentro de un servicio de scoring por lotes sobre descriptores o fingerprints moleculares, una vez documentada la interfaz de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de validacion (R², RMSE, AUC, MCC, sensibilidad/especificidad), ni tamano del conjunto de test, ni comparacion con lineas base.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tamano real de `model.pt`, que no se documenta (el repositorio figura como 0.0 GB, lo que sugiere un artefacto muy pequeno, pero no es concluyente).
- GPU recomendadas: no disponible. Por la naturaleza de un modelo QSAR tabular o sobre descriptores, es probable que la inferencia en CPU sea suficiente, pero no hay confirmacion del autor.
- Compatibilidad con GPU de consumo: no confirmada; previsiblemente si, dado el caracter ligero habitual de estos modelos, pero sin datos verificables.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` sobre `model.pt`); no consta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica la tarea concreta ni lineas base, por lo que no es posible establecer una comparacion rigurosa con alternativas QSAR (por ejemplo, modelos basados en Random Forest o GNN sobre benchmarks como MoleculeNet). Cualquier comparacion exigiria primero conocer la variable objetivo y el conjunto de evaluacion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| caiofusco2/qsarb | no disponible | no aplica | MIT | Hugging Face (0 descargas) |
| Alternativas QSAR | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: sin arquitectura, datos, variable objetivo ni metricas, el modelo no es evaluable ni auditable por terceros.
- Riesgo de uso indebido: aplicar un predictor QSAR sin conocer su dominio de aplicabilidad (tipo de compuestos, rango de actividad, sesgo de la serie de entrenamiento) puede producir predicciones sin validez fuera de la distribucion de entrenamiento.
- Sesgos desconocidos: al no publicarse la composicion del dataset, no puede descartarse sesgo hacia clases quimicas, dianas o rangos de actividad sobrerrepresentados.
- Repositorio practicamente vacio (0.0 GB, 0 descargas, 0 likes): no hay evidencia de uso, validacion independiente ni mantenimiento.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no exime de la responsabilidad de validar el modelo antes de aplicarlo en decisiones cientificas o regulatorias.
- El sello de autoria garantiza integridad y procedencia, no correccion cientifica: una firma valida no implica que el modelo sea preciso.
- Sin soporte linguistico, generativo ni de agentes: no debe confundirse con un LLM pese a su alojamiento en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caiofusco2/qsarb
- Repositorio de la plataforma QSAR IA: https://github.com/altobellibm/qsar_ia_project
- ORCID del autor: https://orcid.org/0009-0003-6416-9788
