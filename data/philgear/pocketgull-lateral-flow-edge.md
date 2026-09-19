# philgear/pocketgull-lateral-flow-edge

## Resumen

PocketGull Edge Lateral Flow & Biomarker Vision Scanner es un adaptador LoRA (PEFT) publicado por Phillip Gear bajo la organizacion PocketGull LLC, orientado a la lectura y cuantificacion de inmunoensayos de flujo lateral y tiras de biomarcadores salivales mediante la camara de un telefono movil, sin envio de datos a la nube. El adaptador se entrena sobre el modelo base `pocketgull/edge-densitometry-vision` y se distribuye con licencia Apache 2.0, unicamente en ingles y con la etiqueta de pipeline `text-generation`. Las etiquetas del repositorio mencionan `gemma-2` y `lora`, aunque la model card no confirma explicitamente la familia ni el tamano del modelo subyacente.

El problema que aborda es concreto: verificar la validez de la linea de control de un casete de test rapido (umbral declarado de >0,18 OD), calcular la ratio de densidad optica test/control y emitir un recurso estructurado HL7 FHIR R4 tipo Observation con codigos LOINC 94558-4 y hallazgos SNOMED CT. Todo ello pensado para ejecucion local en el borde (edge), con cero egreso de datos y sin retencion de informacion de salud protegida (PHI), en linea con el estandar de desidentificacion HIPAA §164.514 Safe Harbor.

Su relevancia actual es la combinacion de dos tendencias: por un lado, el despliegue de modelos pequenos y adaptadores en dispositivos de bajo coste para diagnostico en entornos con conectividad limitada; por otro, la necesidad de generar salidas clinicas estructuradas e interoperables (FHIR) en lugar de texto libre. No obstante, el repositorio presenta 0 descargas y 0 "likes" en el momento de la consulta, y no incluye resultados de benchmarks, por lo que debe tratarse como un artefacto experimental sin validacion externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA/PEFT sobre modelo base; las etiquetas indican `gemma-2`) |
| Parametros totales | no disponible (no se declara el tamano del modelo base ni del adaptador) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptador PEFT/LoRA (libreria `peft`); formato de fichero concreto no especificado |
| Modelo base | `pocketgull/edge-densitometry-vision` |
| Tipo de artefacto | adaptador de ajuste fino (no pesos completos) |
| Metodo de ajuste declarado | DPO (Direct Preference Optimization) |
| Pipeline declarado | text-generation |
| Region declarada | US |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA cargado mediante la libreria `peft` sobre el modelo base `pocketgull/edge-densitometry-vision`. La model card indica que el ajuste se realizo con Direct Preference Optimization (DPO) sobre conjuntos de datos clinicos de dominio que cumplen estrictamente con el estandar de desidentificacion HIPAA §164.514 Safe Harbor. El prompt de ejemplo incluido en la documentacion usa la combinacion `AutoTokenizer` + `AutoModelForCausalLM` con `torch_dtype=torch.bfloat16` y `device_map="auto"`, lo que sugiere que el modelo base es un modelo causal de lenguaje; las etiquetas del repositorio (`gemma-2`, `lora`) apuntan a la familia Gemma 2, pero ni el tamano (2B, 9B, 27B u otro) ni la configuracion de atencion se detallan en la informacion disponible.

La disciplina declarada es "zero-cloud computer vision densitometry", es decir, analisis densitometrico de imagenes de casetes en el propio dispositivo, con verificacion de la linea de control (umbral >0,18 OD), calculo de ratios de densidad optica test/control y emision de un bundle FHIR R4 Observation con LOINC 94558-4. Existe una inconsistencia notable en la documentacion: el ejemplo de codigo de la model card plantea una consulta de interacciones farmacologicas (hipérico y warfarina, metabolismo CYP450), que no guarda relacion con la densitometria de flujo lateral descrita en el resto de la ficha. Ademas, el pipeline declarado es `text-generation`, no `image-to-text` ni `image-classification`, por lo que no queda claro si el componente de vision reside en el modelo base, en el adaptador o en un pipeline externo no documentado. Los conjuntos de datos citados en las etiquetas (`nih-medquad`, `who-mhgap`) no van acompanados de cifras de tokens, composicion ni hiperparametros.

## Capacidades

- Generacion de texto clinico en ingles, con salidas estructuradas en formato HL7 FHIR R4 (recurso Observation).
- Codificacion con terminologias estandar: LOINC 94558-4 para vigilancia de SARS-CoV-2 y SNOMED CT (ejemplo citado: 10828004, hallazgo positivo).
- Analisis declarado de densitometria optica: verificacion de validez de la linea de control con umbral >0,18 OD y calculo de la ratio de densidad optica test/control.
- Escaneo de perfil de intensidad optica 1D a lo largo del casete (ejemplo del widget: deteccion de linea de control en el indice 75 % y linea de test tenue en el indice 42 %).
- Inferencia en el borde sin egreso de datos a la nube (zero cloud egress) y sin retencion de PHI.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no. Solo ingles.
- Capacidades de vision, audio o modo "thinking": no confirmadas. Aunque la disciplina descrita es de vision por computador, el pipeline declarado es text-generation y no se documenta ninguna interfaz de imagen.

## Casos de uso

- Triaje en punto de atencion con test rapido de antigenos: el modelo recibiria la descripcion de la lectura del casete y devolveria un estado cualitativo (positivo, negativo, invalido) junto con la ratio test/control, permitiendo al personal sanitario registrar el resultado sin conexion a internet.
- Vigilancia epidemiologica en salud publica: la generacion de recursos FHIR R4 Observation con LOINC 94558-4 facilita la agregacion posterior de resultados en sistemas de notificacion, siempre que el integrador valide la salida antes de enviarla.
- Integracion con historia clinica electronica: el formato FHIR R4 permite insertar el resultado en un servidor de interoperabilidad sin transformaciones manuales, reduciendo el trabajo administrativo asociado a los test rapidos.
- Despliegue en zonas con conectividad limitada o nula: la orientacion "zero cloud egress" encaja en escenarios rurales, misiones humanitarias o entornos con requisitos de soberania del dato, donde no es viable subir imagenes a un servicio en la nube.
- Control de calidad de la lectura del casete: la comprobacion del umbral de la linea de control (>0,18 OD) sirve como filtro automatico para descartar test invalidos por caducidad, mala conservacion o iluminacion deficiente antes de interpretar la linea de test.
- Generacion de documentacion clinica estructurada con de-identificacion: dado que se declara conformidad con HIPAA Safe Harbor, el modelo puede emplearse para producir registros normalizados sin datos identificativos en entornos sujetos a normativa estadounidense.
- Farmacovigilancia y apoyo a la decision (segun el ejemplo de la propia model card): aunque no es coherente con la disciplina de densitometria, la documentacion sugiere uso en consultas sobre interacciones farmacologicas, un escenario que requeriria validacion clinica independiente antes de cualquier uso real.
- Formacion y simulacion: en entornos docentes, el modelo puede generar ejemplos de recursos FHIR validos y casos de lectura de tiras para entrenar a personal tecnico, sin exponer datos de pacientes reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MedQA ni ninguna metrica de sensibilidad, especificidad, AUC o concordancia con lectura humana para la tarea de densitometria. Tampoco se aportan datos de latencia o throughput. Las unicas referencias a datos son las etiquetas `nih-medquad` y `who-mhgap`, sin resultados asociados. Cualquier afirmacion de rendimiento clinico seria, por tanto, no verificable con la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al desconocerse el tamano del modelo base, no es posible calcular un requisito de memoria fiable para bf16, int8 o int4.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `device_map="auto"` con `torch.bfloat16`, lo que implica una GPU con soporte de bfloat16, pero no se especifica ningun modelo concreto (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada. Dependera del tamano del modelo base subyacente, dato no publicado.
- Opciones de despliegue: la model card documenta el uso con `transformers` + `peft` y menciona despliegue en "private Google Cloud Vertex AI". No se mencionan vLLM, TGI, llama.cpp, Ollama ni ficheros GGUF, por lo que estos formatos no estan confirmados (llama.cpp u Ollama requeririan, en principio, una conversion a GGUF no documentada).
- Latencia y throughput: no disponible. No se aportan mediciones de tokens por segundo ni de tiempo de inferencia en ningun dispositivo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos alternativos de la misma categoria (adaptadores LoRA clinicos sobre Gemma 2, o modelos de densitometria de flujo lateral en el borde) ni aporta datos de rendimiento que permitan una comparacion objetiva. La busqueda web realizada no devolvio resultados tecnicos relacionados con este modelo, su modelo base o su dominio de aplicacion, por lo que no se puede construir una tabla comparativa con datos verificables.

## Limitaciones y advertencias

- Ausencia total de validacion externa: el repositorio registra 0 descargas y 0 "likes" en la fecha de consulta, sin resultados de benchmarks ni evaluacion clinica publicada.
- Riesgo alto de alucinacion en salidas estructuradas: un recurso FHIR R4 con codigos LOINC o SNOMED CT incorrectos puede propagarse a un sistema de historia clinica y provocar errores de registro. Se requiere validacion programatica del esquema y de los codigos antes de cualquier uso en produccion.
- Inconsistencia documental interna: la disciplina descrita (densitometria de vision en el borde) no concuerda con el ejemplo de codigo (interaccion farmacologica hipérico-warfarina) ni con el pipeline declarado (`text-generation`). Esto dificulta determinar que hace realmente el adaptador y como se integra con el componente de vision.
- Inconsistencia de identificadores: el ejemplo de codigo apunta a `pocketgull-llc/pocketgull-lateral-flow-edge`, mientras que el identificador del repositorio es `philgear/pocketgull-lateral-flow-edge` y el modelo base se referencia como `pocketgull/edge-densitometry-vision`. Conviene verificar cual es el artefacto correcto antes de integrarlo.
- Limitacion idiomatica: el modelo solo declara soporte de ingles, lo que limita su uso directo en entornos hispanohablantes sin traduccion previa.
- No es un dispositivo medico: la propia model card lo enmarca en la exencion FDA 520(o) para software de apoyo a la decision clinica (Non-Device CDS), de modo que no sustituye el juicio de un profesional sanitario licenciado.
- Cumplimiento normativo dependiente del despliegue: la conformidad con HIPAA Safe Harbor se declara a nivel de diseno (computacion local, cero egreso, cero retencion de PHI), pero el cumplimiento efectivo depende de como se integre el modelo; cualquier envio de datos a un servicio externo anularia esa garantia.
- Licencia permisiva con responsabilidad transferida: Apache 2.0 permite uso comercial y modificacion, pero no ofrece garantias ni asume responsabilidad por danos derivados de un diagnostico incorrecto. La carga regulatoria recae integramente en quien despliega el modelo.
- Datos de sesgo: no disponible. No se documenta la composicion demografica de los datos de entrenamiento ni su distribucion por tonos de piel, tipo de casete o condiciones de iluminacion, factores criticos en densitometria optica.
- Fecha de publicacion inusual: el repositorio figura creado el 2026-09-18, posterior a la mayoria de referencias del ecosistema; conviene confirmar la vigencia y el mantenimiento del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/philgear/pocketgull-lateral-flow-edge
- Modelo base declarado: https://huggingface.co/pocketgull/edge-densitometry-vision
- DOI de Zenodo (procedencia open science): https://doi.org/10.5281/zenodo.20647514
- Organizacion PocketGull LLC: https://pocketgull.com
- Sitio del proyecto: https://pocketgull.app
- ORCID del autor (Phillip Gear): https://orcid.org/0009-0008-1372-5381
- Papers, blogs, repositorios o demos adicionales: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre su dominio de aplicacion.
