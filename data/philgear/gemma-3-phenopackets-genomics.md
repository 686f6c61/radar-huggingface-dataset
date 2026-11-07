# philgear/gemma-3-phenopackets-genomics

## Resumen

PocketGull Gemma 3 GA4GH Phenopackets v2 Translator es un adaptador LoRA sobre el modelo base `google/gemma-3-12b-it`, desarrollado por Phillip Gear (PocketGull LLC, Oregon) para la traduccion de notas clinicas en texto libre a JSON conforme al esquema GA4GH Phenopackets v2.0, con conceptos de las ontologias HPO (Human Phenotype Ontology) y LOINC. El modelo aborda un problema concreto de interoperabilidad en genomica de enfermedades raras: la conversion manual de descripciones fenotipicas no estructuradas a un formato estandarizado que permita el intercambio de datos entre instituciones clinicas y de investigacion.

El adaptador se ha ajustado mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clinicos desidentificados conforme a la norma HIPAA §164.514 Safe Harbor. La arquitectura subyacente es la del transformer multimodal Gemma 3 de 12 000 millones de parametros de Google DeepMind, sobre el que se aplica un adaptador PEFT que anade aproximadamente un 1-2 % de parametros entrenables. El modelo esta orientado a despliegue local o en entornos de nube privada (Google Cloud Vertex AI) para evitar la retencion de informacion de salud protegida (PHI).

La relevancia actual del modelo radica en su enfoque en la privacidad y la estandarizacion clinica: se presenta como una herramienta de apoyo a la evidencia para profesionales sanitarios licenciados, no como un dispositivo medico, y su licencia Apache 2.0 permite su integracion en pipelines de investigacion y sistemas de historia clinica electronica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA (PEFT) |
| Parametros totales | 12 000 millones (modelo base); adaptador LoRA: no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 12B soporta contexto largo, pero el dato no se especifica en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptador PEFT (safetensors, segun la libreria `peft`); pesos del modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/gemma-3-12b-it`, un transformer decoder-only de 12 000 millones de parametros con capacidad multimodal (texto e imagen) en su version base. El ajuste se realiza mediante LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e inserta matrices de baja dimension en las capas de atencion y proyeccion, reduciendo drasticamente el coste de entrenamiento y el tamano del artefacto resultante.

El entrenamiento utiliza Direct Preference Optimization (DPO) sobre datos clinicos especificos del dominio, desidentificados segun HIPAA §164.514 Safe Harbor. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros del ajuste. La innovacion tecnica principal no reside en la arquitectura, sino en la especializacion del adaptador para generar JSON estructurado conforme a GA4GH Phenopackets v2.0 con mapeo a terminos HPO y LOINC, un formato de salida estricto que requiere un control preciso del formato generado.

## Capacidades

- Traduccion de notas clinicas en texto libre a JSON estructurado conforme a GA4GH Phenopackets Schema v2.0.
- Mapeo de descripciones fenotipicas a terminos de la Human Phenotype Ontology (HPO), incluyendo codigos como HP:0001251 (ataxia cerebelosa progresiva) o HP:0001260 (disartria).
- Mapeo a conceptos LOINC para observaciones de laboratorio.
- Generacion de texto y razonamiento clinico heredados del modelo base Gemma 3 12B-IT.
- Capacidad multimodal (texto e imagen) heredada del modelo base, aunque la model card no documenta el uso de vision para esta tarea.
- Soporte de tool calling y function calling: no documentado en la model card; disponible potencialmente por herencia del modelo base, pero no verificado para este adaptador.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo de razonamiento (thinking mode): no documentado.
- Salida determinista con temperatura baja (0.2 en el ejemplo de la model card) para reducir variabilidad en la estructura JSON.

## Casos de uso

- **Estandarizacion de registros de enfermedades raras**: conversion de notas clinicas narrativas de consultas de genetica a Phenopackets v2.0 para su ingesta en registros nacionales e internacionales, facilitando el intercambio de datos fenotipicos entre hospitales sin necesidad de reescritura manual.
- **Integracion en historia clinica electronica (HCE)**: el adaptador puede desplegarse en un entorno local o en Vertex AI privado para generar Phenopackets a partir de notas de alta, consulta externa o informes de laboratorio, manteniendo la PHI dentro de la infraestructura del centro sanitario.
- **Preparacion de datasets para investigacion genomica**: conversion masiva de cohortes clinicas a formato Phenopackets para su deposito en repositorios como EGA o dbGaP, con mapeo automatico a HPO que reduce el trabajo de curacion manual.
- **Apoyo a la codificacion clinica**: asistencia a codificadores y geneticos clinicos en la asignacion de terminos HPO y LOINC a partir de descripciones libres, con el modelo como herramienta de evidencia de apoyo (no dispositivo medico FDA 520(o)).
- **Pipelines de fenotipado computacional**: generacion de representaciones estructuradas de fenotipos para algoritmos de priorizacion de variantes y diagnostico diferencial en enfermedades raras, donde la entrada debe ser un Phenopacket conforme al esquema.
- **Auditoria y control de calidad de datos clinicos**: validacion de que las notas clinicas contienen la informacion fenotipica minima necesaria para generar un Phenopacket completo, detectando campos ausentes antes de la codificacion manual.
- **Despliegue en entornos con requisitos de privacidad estrictos**: al ser un adaptador LoRA sobre un modelo abierto con licencia Apache 2.0, puede ejecutarse en infraestructura on-premise o en enclaves privados de nube, sin enviar datos a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo base de 12 000 millones de parametros requiere aproximadamente 24 GB en bfloat16 (sin cuantizar), mas el adaptador LoRA (de pocos cientos de MB). Con cuantizacion de 8 bits se reduce a unos 12-13 GB; con 4 bits, a unos 7-8 GB, aunque la model card no documenta cuantizaciones probadas.
- **GPU recomendadas**: A100 40 GB, H100 80 GB o L40S para inferencia en bfloat16 sin cuantizar. Para cuantizacion 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes.
- **Consumer GPU**: si cabe en GPUs de consumo con 24 GB de VRAM (RTX 3090, RTX 4090) usando cuantizacion de 4 u 8 bits. En GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requeriria cuantizacion agresiva a 4 bits y posible offloading.
- **Opciones de despliegue**: Transformers + PEFT (documentado en la model card), vLLM con soporte de adaptadores LoRA, TGI (Text Generation Inference) con adaptadores, llama.cpp/Ollama si se convierte el modelo fusionado a GGUF. Google Cloud Vertex AI para despliegue privado.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| philgear/gemma-3-phenopackets-genomics | 12B (base) + LoRA | no disponible | Phenopackets v2.0, HPO, LOINC | Apache 2.0 | Hugging Face (0 descargas) |
| google/gemma-3-12b-it | 12B | no disponible en la informacion | Proposito general, multimodal | Gemma Terms of Use | Hugging Face |
| Modelos clinicos genericos (p. ej., adaptadores sobre Llama o Mistral) | variable | variable | NLP clinico general | variable | variable |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados en la model card. Al entrenarse sobre datos clinicos desidentificados, puede heredar sesgos de la poblacion de origen (geografica, etnica, socioeconomica) no especificada.
- **Riesgo de alucinacion**: el modelo puede generar codigos HPO o LOINC incorrectos o inventados, o estructuras JSON que no validen contra el esquema Phenopackets v2.0. Requiere validacion programatica contra el esquema y revision por un experto clinico.
- **Limitaciones de idioma**: solo ingles segun la model card. No se ha entrenado ni evaluado para castellano ni otras lenguas.
- **Limitaciones de contexto**: la longitud de contexto efectiva del adaptador no esta documentada; las notas clinicas largas pueden truncarse o degradar la calidad de la salida.
- **Restricciones de licencia**: el adaptador es Apache 2.0, pero el modelo base `google/gemma-3-12b-it` esta sujeto a los Gemma Terms of Use, que imponen restricciones de uso (incluida una politica de uso prohibido). El uso comercial combinado debe cumplir ambas licencias.
- **Caveats para produccion**: el modelo se presenta como herramienta de apoyo a la evidencia para profesionales licenciados, no como dispositivo medico (FDA 520(o) Non-Device CDS). No debe usarse para diagnostico o decision terapeutica autonoma. La desidentificacion HIPAA Safe Harbor del dataset de entrenamiento no garantiza que las salidas esten libres de PHI si la entrada la contiene. El modelo tiene 0 descargas y 0 likes en Hugging Face, sin validacion externa ni benchmarks publicados, lo que desaconseja su uso en produccion sin una evaluacion propia exhaustiva.
- **Madurez**: creado y actualizado el 7 de noviembre de 2026, sin historial de versiones ni comunidad de usuarios documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/philgear/gemma-3-phenopackets-genomics
- Perfil del autor en Hugging Face: https://huggingface.co/philgear
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- GA4GH Phenopackets: https://www.ga4gh.org/product/phenopackets/
- DOI Zenodo: https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Sitio de PocketGull: https://pocketgull.com
- Aplicacion PocketGull: https://pocketgull.app
