# philgear/philgear

## Resumen

El repositorio `philgear/philgear` es el perfil de Phillip Gear, un arquitecto de sistemas de IA y responsable de informática sanitaria, fundador de PocketGull LLC. No se trata de un modelo de lenguaje en sí, sino de una página de presentación que agrupa una familia de modelos clínicos especializados en informática de la salud, todos ellos basados en la arquitectura Gemma (2B, 4B y 12B) y publicados bajo licencia Apache 2.0. El objetivo declarado es construir motores de inteligencia clínica soberanos, con ejecución 100 % en el dispositivo (WebGPU) para eliminar la fuga de datos de pacientes (PHI), e interoperabilidad con estándares como HL7 FHIR R4 y GA4GH Phenopackets v2.

Aunque el repositorio no contiene pesos ni artefactos de modelo, actúa como índice de los modelos de la serie PocketGull, que abarcan desde triaje escalonado (compass-2b) hasta codificación de consultas médicas (scribe-soap) o detección de interacciones farmacológicas (rxguard-pgx). La relevancia actual reside en su enfoque de IA clínica de código abierto con énfasis en privacidad y cumplimiento normativo (HIPAA Safe Harbor), así como en su ejecución en navegador mediante WebGPU, lo que reduce la dependencia de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (perfil de autor; los modelos asociados usan Gemma 2/3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no se publican pesos en este repositorio) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre este repositorio concreto, ya que no contiene un modelo. La model card indica que los modelos de la familia PocketGull se basan en Gemma 2 (2B), Gemma 3 (4B) y Gemma 3 (12B). No se especifican detalles sobre el entrenamiento de los adaptadores LoRA, el numero de tokens de entrenamiento ni el proceso de alineacion. Se menciona el uso de Direct Preference Optimization (DPO) con un dataset propio (`pocketgull-nih-who-clinical-dpo`) construido a partir de fuentes oficiales NIH y WHO, asi como un corpus de instrucciones clinicas para fine-tuning supervisado (SFT). No hay informacion publica sobre innovaciones arquitectonicas adicionales.

## Capacidades

- Generacion de texto clinico y asistencia en triaje escalonado (stepped-care) segun guias NIH/WHO.
- Codificacion de encuentros medicos en formato SOAP y SBAR (modelos scribe-soap).
- Deteccion de banderas rojas de emergencia (BE-FAST para ictus, sindrome coronario agudo) y guardarrailes deterministicos de seguridad decimal ISMP.
- Interaccion farmacologica y farmacogenomica (CYP450) mediante el modelo rxguard-pgx.
- Integracion con HL7 FHIR R4 para exportacion de bundles y conformidad con Phenopackets v2.
- Ejecucion en navegador via WebGPU y WebLLM, sin llamadas de red (cero egress).
- Soporte de visualizacion 3D de anatomia humana (modelo albatross-multimodal).
- Capacidad de razonamiento multi-paso en trayectos de 3 actos (3-Act Trajectory) para planificacion terapeutica.

## Casos de uso

- Triaje clinico en atencion primaria: el modelo compass-2b puede guiar al profesional en la clasificacion del paciente segun escalas de stepped-care, reduciendo derivaciones innecesarias y priorizando urgencias.
- Auditoria de prescripciones en farmacia: rxguard-pgx detecta errores decimales (p. ej., dosis 10 veces superiores) y alerta sobre interacciones con fitoterapia, integrable en sistemas de gestion de farmacia.
- Scribe ambulatorio con privacidad: scribe-soap transcribe conversaciones medico-paciente en el dispositivo, generando notas SOAP conformes a HIPAA sin enviar datos a servidores externos.
- Educacion sanitaria del paciente: compass-2b ofrece explicaciones de alfabetizacion en salud (health literacy) adaptadas al nivel del paciente, en un entorno de ejecucion local.
- Soporte a emergencias en entornos sin conectividad: tern-edge, con latencia sub-45 ms, puede ejecutarse en moviles o equipos perifericos para asistir en zonas rurales o catastrofes.
- Integracion en sistemas de historia clinica electronica: los modelos exportan bundles FHIR R4, lo que permite su conexion con plataformas como Epic o Cerner para enriquecer la documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos verificables de MMLU, HumanEval, GSM8K ni evaluaciones clinicas especificas en el repositorio ni en las busquedas web realizadas.

## Requisitos de hardware

- No se especifican requisitos de VRAM para los modelos de la familia.
- Los modelos de 2B y 4B pueden ejecutarse en GPU de consumo (RTX 3060, 4090) y en CPU con cuantizacion GGUF, aunque no hay datos oficiales.
- El modelo de 12B (albatross-multimodal) requeriria al menos 12-16 GB de VRAM en precision FP16, o menos con cuantizacion de 4 bits.
- Se menciona ejecucion via WebGPU en navegador, lo que implica compatibilidad con GPUs integradas o discretas via WebGPU API.
- Opciones de despliegue: WebLLM, llama.cpp, vLLM (para modelos grandes), aunque no se confirma soporte oficial.
- No hay datos de latencia o throughput publicados.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones publicas con otros modelos clinicos de tamano similar (p. ej., MedAlpaca, ClinicalBERT, BioGPT) en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio es un perfil de autor, no un modelo descargable; los modelos asociados estan en otros repositorios (p. ej., `pocketgull-compass-2b`).
- No hay documentacion tecnica detallada sobre los pesos, el entrenamiento ni las metricas de evaluacion de los modelos de la familia.
- La ejecucion 100 % en el dispositivo puede limitar la capacidad de modelos grandes en hardware modesto.
- La licencia Apache 2.0 permite uso comercial, pero la aplicacion en entornos clinicos reales requiere validacion regulatoria (FDA, CE) que no se menciona.
- Los riesgos de alucinacion en contextos clinicos son elevados; los guardarrailes deterministicos solo cubren un subconjunto de errores.
- No se aportan datos sobre sesgos de los modelos ni sobre el equilibrio de generos, razas o grupos etnicos en los datos de entrenamiento.
- La fecha de creacion del repositorio (2026-09-01) sugiere que el proyecto es reciente y puede carecer de madurez suficiente para produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/philgear/philgear
- Modelo compass-2b: https://huggingface.co/philgear/pocketgull-compass-2b
- Modelo albatross-multimodal: https://huggingface.co/philgear/pocketgull-albatross-multimodal
- Space WebGPU: https://huggingface.co/spaces/philgear/pocketgull-webgpu-edge
- Space 3D Anatomy: https://huggingface.co/spaces/philgear/pocketgull-3d-anatomy
- Space ISMP RxGuard: https://huggingface.co/spaces/philgear/pocketgull-ismp-rxguard
- Space Clinical Suite: https://huggingface.co/spaces/philgear/pocketgull-clinical-consult
- Dataset DPO: https://huggingface.co/datasets/philgear/pocketgull-nih-who-clinical-dpo
- Dataset instrucciones: https://huggingface.co/datasets/philgear/pocketgull-clinical-instruction-corpus
- Repositorio GitHub: https://github.com/philgear/pocketgull
- Web del proyecto: https://pocketgull.app
- DOI Zenodo: https://doi.org/10.5281/zenodo.20647514
