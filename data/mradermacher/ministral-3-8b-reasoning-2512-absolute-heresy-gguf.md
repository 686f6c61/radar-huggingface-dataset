# mradermacher/Ministral-3-8B-Reasoning-2512-absolute-heresy-GGUF

## Resumen

Ministral-3-8B-Reasoning-2512-absolute-heresy-GGUF es una distribucion de cuantizaciones estaticas en formato GGUF del modelo MuXodious/Ministral-3-8B-Reasoning-2512-absolute-heresy, publicada por el usuario mradermacher. El modelo base es un derivado de la familia Ministral de Mistral AI, orientado a tareas de razonamiento, y en esta variante ha sido sometido a un proceso de "abliteration" o "heretizacion" (etiqueta heretic) que elimina o atenua los mecanismos de rechazo alineados. El repositorio no entrena un modelo nuevo: empaqueta pesos ya existentes en multiples niveles de cuantizacion para su uso con llama.cpp y ecosistemas compatibles.

El modelo cuenta con 8.489.553.920 parametros totales (aproximadamente 8,5 mil millones) y esta disenado para conversacion y razonamiento multilingue en once idiomas: ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe. La licencia declarada es Apache 2.0, lo que permite uso comercial sin restricciones adicionales segun los terminos del repositorio.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo de razonamiento de tamano medio, una variante sin alineacion de seguridad (heretic) y un conjunto completo de cuantizaciones GGUF que van desde Q2_K (3,5 GB) hasta f16 (17,1 GB), incluyendo un proyector multimodal mmproj que sugiere capacidades de vision en el modelo base. Es, por tanto, un artefacto practico para despliegue local en hardware de consumo, pero con implicaciones eticas y de seguridad que deben evaluarse con cuidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Ministral de Mistral AI); detalles especificos no disponibles |
| Parametros totales | 8.489.553.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (proyector multimodal) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Ministral de Mistral AI y de la etiqueta mistral-common, que indica compatibilidad con el tokenizador y las convenciones de Mistral. Se trata, por tanto, de un transformer decoder-only de aproximadamente 8,5 mil millones de parametros, disenado para generacion de texto y razonamiento. No se especifican en la informacion proporcionada el numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea atencion deslizante o completa.

Tampoco se documentan en el repositorio los datos de entrenamiento: numero de tokens, composicion del corpus, tecnicas de alineacion (RLHF, DPO) ni procesos de destilacion. La unica innovacion tecnica explicitamente mencionada es el proceso heretic (abliteration), que modifica los pesos para reducir la probabilidad de respuestas de rechazo. El repositorio de cuantizacion indica que las cuantizaciones son estaticas (quantize_version 2, output_tensor_quantised 1) y que existe una variante con cuantizaciones ponderadas/imatrix en un repositorio separado (sufijo -i1-GGUF), lo que sugiere que el autor ofrece dos familias de cuantizaciones con distinta metodologia.

## Capacidades

- Generacion de texto conversacional multi-turno en once idiomas.
- Razonamiento explicito: el nombre del modelo (Reasoning) indica entrenamiento orientado a tareas de razonamiento paso a paso, aunque no se detalla el formato exacto de los trazos de pensamiento.
- Capacidades multimodales: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 en el repositorio indica soporte de entrada de imagenes (vision) en el modelo base, aunque la informacion no especifica la tarea concreta.
- Soporte multilingue amplio: en, fr, es, de, it, pt, nl, zh, ja, ko, ar.
- Compatibilidad con el ecosistema mistral-common (tokenizador y plantillas de Mistral).
- Comportamiento sin alineacion de seguridad (heretic): reduce los rechazos, lo que puede ser util para investigacion sobre alineacion o para aplicaciones donde los filtros estandar resultan excesivos.
- No se documenta soporte explicito de tool calling, function calling ni uso como agente multi-paso en la informacion disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (5,3 GB) o Q5_K_M (6,2 GB) el modelo cabe en GPUs de consumo de 8-12 GB de VRAM, lo que permite ejecutar un modelo de razonamiento de 8,5B en local sin infraestructura en la nube.
- Experimentacion en investigacion sobre alineacion: la variante heretic permite estudiar como cambia el comportamiento del modelo al eliminar los rechazos, comparandolo con el modelo base original en tareas de evaluacion de seguridad.
- Procesamiento multilingue en produccion: al cubrir once idiomas, puede emplearse para traduccion asistida, resumen o clasificacion de documentos en entornos con requisitos de soberania de datos, ejecutandose en servidores propios.
- Asistentes conversacionales internos: su tamano permite integrarlo en herramientas de soporte interno o documentacion tecnica donde la latencia importa y el volumen de consultas no justifica un modelo mayor.
- Analisis de imagenes con el proyector multimodal: cargando el fichero mmproj junto con el modelo principal en llama.cpp, puede emplearse para descripcion de imagenes o extraccion de informacion de capturas y documentos escaneados.
- Prototipado rapido con Ollama o llama.cpp: la disponibilidad de cuantizaciones desde Q2_K hasta Q8_0 permite ajustar el equilibrio calidad/velocidad segun el hardware disponible en cada fase del desarrollo.
- Fine-tuning sobre la variante cuantizada: aunque el fine-tuning directo sobre GGUF es limitado, la existencia del modelo base en safetensors permite adaptar el modelo y volver a cuantizar posteriormente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (aproximada, sin contar overhead de contexto):
  - Q2_K: ~3,5 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~4,0-4,7 GB
  - IQ4_XS: ~4,8 GB
  - Q4_K_S / Q4_K_M: ~5,1-5,3 GB
  - Q5_K_S / Q5_K_M: ~6,0-6,2 GB
  - Q6_K: ~7,1 GB
  - Q8_0: ~9,1 GB
  - f16: ~17,1 GB
  - Proyector multimodal: ~0,6 GB (Q8_0) o ~1,0 GB (f16)
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 no son necesarias para este tamano, aunque pueden usarse para maximizar throughput.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q8_0 en tarjetas de 8-12 GB; f16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ministral-3-8B-Reasoning-2512-absolute-heresy-GGUF (este) | 8,49B | no disponible | Apache 2.0 | GGUF | Variante heretic, 11 idiomas, multimodal |
| Ministral-3-8B-Reasoning-2512-absolute-heresy (base) | 8,49B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Mistral 7B Instruct | 7,24B | 32K (segun version) | Apache 2.0 | safetensors, GGUF | Referencia de la familia, sin razonamiento explicito |
| Qwen2.5-7B-Instruct | 7,62B | 128K | Apache 2.0 | safetensors, GGUF | Multilingue, sin variante heretic documentada |

La comparativa se limita a datos publicos de cada familia; no se dispone de resultados de benchmarks comparativos para este modelo concreto en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo heretic: el proceso de abliteration elimina o reduce los rechazos de seguridad, lo que puede producir respuestas a solicitudes que el modelo original rechazaria. No es adecuado para aplicaciones orientadas al publico sin una capa adicional de moderacion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; como todo modelo de 8,5B, puede generar contenido plausible pero incorrecto.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible, por lo que no puede garantizarse el rendimiento en conversaciones muy largas.
- Idiomas: aunque se declaran once idiomas, la calidad relativa por idioma no esta evaluada; el espanol esta soportado pero sin metricas publicas.
- Licencia: Apache 2.0 permite uso comercial, pero el proceso heretic puede entrar en conflicto con las politicas de uso de la organizacion que lo despliegue; conviene revisar los terminos del modelo base original de Mistral AI.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M pueden degradar notablemente el razonamiento; se recomienda Q4_K_M o superior para tareas que requieran precision.
- Repositorio de cuantizacion: las cuantizaciones son estaticas; para mayor calidad en tareas exigentes puede preferirse la variante imatrix (-i1-GGUF) del mismo autor.
- Trazabilidad: el repositorio tiene pocas descargas (171) y un solo like en el momento de la consulta, lo que limita la evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Ministral-3-8B-Reasoning-2512-absolute-heresy-GGUF
- Modelo base: https://huggingface.co/MuXodious/Ministral-3-8B-Reasoning-2512-absolute-heresy
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Ministral-3-8B-Reasoning-2512-absolute-heresy-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Ministral-3-8B-Reasoning-2512-absolute-heresy-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
