# Deerpark/pii-tagger-hipaa

## Resumen

Deerpark/pii-tagger-hipaa es un modelo de reconocimiento de entidades nombradas (NER) especializado en la deteccion y etiquetado de informacion personal identificable (PII) y de informacion sanitaria protegida (PHI, Protected Health Information) bajo el marco regulatorio HIPAA. Lo desarrolla Deerpark y se distribuye a traves de HuggingFace con acceso restringido (gated), lo que obliga a aceptar condiciones de uso antes de la descarga. Esta construido sobre la libreria GLiNER y deriva del modelo base Deerpark/pii-tagger-edge, del que hereda la arquitectura y que se ha ajustado para el dominio clinico.

El modelo resuelve un problema concreto: la desidentificacion automatica de textos clinicos y administrativos para que puedan procesarse sin exponer datos sensibles de pacientes. A diferencia de los NER clasicos con un conjunto fijo de etiquetas, GLiNER permite definir entidades de forma dinamica mediante prompts en texto, lo que facilita adaptar el etiquetado a los 18 identificadores que exige la regla de privacidad de HIPAA sin reentrenar el modelo.

Es relevante ahora porque la presion regulatoria sobre el tratamiento de datos sanitarios crece (HIPAA en EE. UU., RGPD en la UE) y los equipos necesitan herramientas ligeras que puedan ejecutarse en local, sin enviar informacion clinica a APIs externas. El repositorio ocupa unos 0,3 GB y soporta ingles y espanol, lo que lo hace desplegable en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (NER zero-shot basado en encoder transformer con prompts de entidades) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye pesos PyTorch y ONNX) |
| Idiomas soportados | ingles (en), espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch y ONNX |
| Modelo base | Deerpark/pii-tagger-edge |
| Tarea | token-classification (NER / etiquetado de PII y PHI) |
| Tamano del repositorio | 0,3 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GLiNER (Generalist and Lightweight NER), que combina un encoder transformer bidireccional con un mecanismo de matching entre representaciones de tokens y representaciones de las etiquetas de entidad proporcionadas como texto en tiempo de inferencia. Esto permite especificar en cada llamada que tipos de entidad detectar (por ejemplo, "nombre de paciente", "numero de historia clinica", "fecha de nacimiento") sin reentrenar. El modelo deriva de Deerpark/pii-tagger-edge, un modelo previo del mismo autor orientado a la deteccion de PII en el borde (edge), y se ha ajustado especificamente para el dominio sanitario y el cumplimiento de HIPAA.

Segun los metadatos del repositorio, el ajuste se ha realizado sobre el dataset nvidia/Nemotron-PII. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El repositorio incluye exportaciones a ONNX, lo que sugiere un interes en el despliegue eficiente en CPU y entornos sin GPU.

## Capacidades

- Deteccion y etiquetado de entidades de PII en texto: nombres, direcciones, telefonos, correos, identificadores, entre otros.
- Deteccion de PHI especifica del dominio sanitario: numeros de historia clinica, fechas de ingreso o alta, diagnosticos asociados a personas, datos de aseguradoras.
- Etiquetado de entidades dinamico mediante prompts en lenguaje natural (propiedad de GLiNER): el usuario define las categorias que quiere extraer en cada llamada.
- Soporte bilingue: ingles y espanol.
- Salida orientada a token-classification, integrable en pipelines de anonimizacion y redaccion.
- Ejecucion local sin dependencia de APIs externas, adecuada para datos sensibles.
- Exportacion ONNX para inferencia en CPU.

## Casos de uso

- Desidentificacion de informes clinicos antes de almacenarlos o compartirlos con terceros: el modelo etiqueta nombres, fechas e identificadores para que un paso posterior los sustituya o elimine, cumpliendo con los requisitos de HIPAA.
- Preprocesado de datasets sanitarios para investigacion: permite anonimizar corpus de historiales antes de usarlos en estudios o en el entrenamiento de otros modelos.
- Cumplimiento del RGPD en entornos europeos: el soporte de espanol permite detectar PII en textos administrativos y clinicos en castellano antes de transferencias de datos.
- Enmascarado en pipelines de atencion al cliente sanitario: integrado en un sistema de tickets, detecta y oculta datos de pacientes en las conversaciones antes de que lleguen a operadores o logs.
- Auditoria de registros: procesamiento por lotes de bases de datos de textos para localizar exposiciones de PHI no autorizadas.
- Despliegue en el borde o en instalaciones locales: gracias a su tamano reducido (0,3 GB) y a la exportacion ONNX, puede ejecutarse en servidores modestos o en estaciones de trabajo sin GPU, manteniendo los datos dentro de la organizacion.
- Preetiquetado asistido para revisores humanos: genera candidatos de entidades que un equipo de compliance valida, acelerando la revision manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano del repositorio (0,3 GB) y la arquitectura GLiNER, es probable que la inferencia en FP32 requiera menos de 2 GB de memoria, aunque esta cifra no esta confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente; no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente si, incluidas GTX 1650, RTX 3060 y superiores, aunque no hay datos oficiales.
- Opciones de despliegue: la libreria gliner (referenciada en los metadatos), ONNX Runtime para CPU, y potencialmente integraciones via HuggingFace Transformers. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos y no a encoders NER.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Deerpark/pii-tagger-hipaa | GLiNER NER | en, es | Apache 2.0 | Gated | Especializado en PHI/HIPAA |
| Deerpark/pii-tagger-edge | GLiNER NER | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Modelos NER genericos (p. ej. spaCy, Presidio) | Reglas + NER | multi | variable | abierto | No especializados en PHI clinica |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso automatizado en pipelines.
- No se han publicado metricas de evaluacion (precision, recall, F1) en la informacion disponible, por lo que su rendimiento real en produccion no esta verificado publicamente.
- Riesgo de falsos negativos en PHI: un NER puede no detectar todas las entidades sensibles, especialmente en textos con formatos atipicos o jerga clinica; se recomienda una capa de validacion o revision humana.
- Cobertura limitada a ingles y espanol; no se garantiza su comportamiento en otras lenguas.
- Al derivar de un modelo base (pii-tagger-edge) y entrenarse sobre un dataset concreto (nvidia/Nemotron-PII), puede heredar sesgos de ese corpus.
- La licencia Apache 2.0 permite uso comercial, pero el cumplimiento de HIPAA exige ademas controles organizativos y tecnicos que el modelo por si solo no garantiza.
- No se especifican la longitud de contexto ni el comportamiento con documentos largos; conviene trocear los textos antes de la inferencia.
- El modelo es un etiquetador, no un generador: no produce texto anonimizado por si mismo, sino etiquetas que un paso posterior debe procesar.

## Enlaces

- HuggingFace: https://huggingface.co/Deerpark/pii-tagger-hipaa
- Modelo base: https://huggingface.co/Deerpark/pii-tagger-edge
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/nvidia/Nemotron-PII
- GLiNER (libreria): https://github.com/urchade/GLiNER
