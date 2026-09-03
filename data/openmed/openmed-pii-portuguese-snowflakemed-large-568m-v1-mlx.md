# OpenMed/OpenMed-PII-Portuguese-SnowflakeMed-Large-568M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-SnowflakeMed-Large-568M-v1-mlx es un modelo de clasificacion de tokens (token classification) basado en la arquitectura XLM-RoBERTa-large, afinado para la deteccion de informacion personal identificable (PII) en texto clinico en portugues. Lo desarrolla OpenMed, un ecosistema de IA sanitaria local-first que ejecuta modelos 100% en el dispositivo, sin enviar datos de pacientes a la nube.

El modelo tiene 568 millones de parametros y se distribuye en formato MLX para inferencia en Apple Silicon, aunque tambien existe una version ONNX para Android y WebAssembly. Su relevancia radica en que permite la anonimizacion y de-identificacion de historias clinicas en portugues cumpliendo normativas como la LGPD brasileña, con un enfoque de privacidad por diseño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-large (XLMRobertaForTokenClassification) |
| Parametros totales | 568 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos MLX en safetensors) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); version ONNX disponible |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa-large, un transformer encoder de la familia BERT con 568 millones de parametros, adaptado para clasificacion de tokens mediante una cabeza de clasificacion sobre cada token. El checkpoint original (OpenMed-PII-Portuguese-SnowflakeMed-Large-568M-v1) fue afinado para deteccion de PII en texto clinico en portugues, y esta version MLX es un empaquetado del mismo para inferencia en Apple Silicon.

Los detalles del dataset de entrenamiento, el numero de tokens y el proceso de afinamiento (si hubo RLHF, DPO u otras tecnicas) no estan disponibles en la informacion publicada. El modelo forma parte del ecosistema OpenMed, que incluye mas de 2.200 modelos medicos en 21 idiomas (33 idiomas con soporte PII segun la web oficial), todos bajo licencia Apache-2.0.

## Capacidades

- Deteccion de PII (informacion personal identificable) en texto clinico en portugues mediante clasificacion de tokens.
- De-identificacion de historias clinicas, eliminando o enmascarando entidades como nombres, fechas, numeros de documento y otros datos sensibles.
- Soporte de "smart merging" para fusionar tokens fragmentados en entidades completas.
- Integracion con el ecosistema OpenMed para extraccion de PII via API Python (`extract_pii`).
- Ejecucion 100% local en Apple Silicon via MLX, sin necesidad de conexion a la nube.
- Version ONNX disponible para despliegue en Android y WebAssembly/WebGPU.

## Casos de uso

- Anonimizacion de historias clinicas en portugues: el modelo identifica y enmascara PII en notas medicas antes de su uso en investigacion o formacion, cumpliendo requisitos de privacidad.
- Cumplimiento de la LGPD brasileña: hospitales y clinicas en Brasil pueden procesar datos de pacientes localmente, reduciendo el riesgo de filtraciones asociado al envio de datos a servicios en la nube.
- Investigacion medica secundaria: permite compartir datasets clinicos anonimizados entre instituciones sin exponer datos personales de pacientes.
- Aplicaciones de salud on-device: al ejecutarse en Apple Silicon o Android via ONNX, puede integrarse en apps de salud que procesan notas del paciente en el propio dispositivo.
- Pipelines de NLP medico: se integra como paso previo de de-identificacion en flujos de procesamiento de lenguaje natural clinico, garantizando que los datos posteriores esten limpios de PII.
- Auditoria de datos: permite revisar documentos clinicos existentes para detectar fugas de informacion personal antes de su publicacion o comparticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- 568 millones de parametros: en FP16, el modelo ocupa aproximadamente 1,1 GB de memoria (estimacion estandar para esta arquitectura).
- En Apple Silicon, el formato MLX esta optimizado para la memoria unificada de los Macs; cabe en equipos con 8 GB de RAM o mas.
- La version ONNX permite ejecucion en dispositivos Android y navegadores via WebAssembly/WebGPU.
- Para inferencia en CPU (backend PyTorch/Hugging Face), se recomienda al menos 4 GB de RAM disponible.
- Opciones de despliegue: OpenMed Python (backend MLX en Apple Silicon, backend PyTorch en otros sistemas), OpenMedKit para Swift/CoreML, y ONNX para movil y web.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| OpenMed-PII-Portuguese-SnowflakeMed-Large-568M-v1 (base) | 568M | XLM-RoBERTa-large | pt | Apache-2.0 | PyTorch |
| OpenMed-PII-Portuguese-SnowflakeMed-Large-568M-v1-mlx (este) | 568M | XLM-RoBERTa-large | pt | Apache-2.0 | MLX (safetensors) |
| OpenMed-PII-Portuguese-SnowflakeMed-Large-568M-v1-onnx-android | 568M | XLM-RoBERTa-large | pt | Apache-2.0 | ONNX |

Los tres modelos comparten el mismo checkpoint base; la diferencia es el formato de pesos y el backend de inferencia. No se dispone de datos de modelos comparables de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta afinado especificamente para portugues; su rendimiento en otros idiomas no esta garantizado.
- No se han publicado benchmarks ni metricas de rendimiento (precision, recall, F1) en la informacion disponible, por lo que su eficacia real en produccion debe validarse con datos propios.
- La longitud de contexto no esta documentada; los modelos XLM-RoBERTa-large suelen tener un limite de 512 tokens, pero esto no se confirma en la documentacion.
- Al ser un modelo de clasificacion de tokens, no genera texto ni soporta tool calling, agentes o razonamiento multi-paso.
- La deteccion de PII puede fallar en textos con formatos inusuales, errores ortograficos o jerga clinica especifica; se recomienda revision humana en entornos de alto riesgo.
- Aunque la licencia Apache-2.0 permite uso comercial, la responsabilidad del cumplimiento normativo (LGPD, HIPAA) recae en el integrador.

## Enlaces

- Repositorio MLX: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SnowflakeMed-Large-568M-v1-mlx
- Checkpoint base: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SnowflakeMed-Large-568M-v1
- Version ONNX Android: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SnowflakeMed-Large-568M-v1-onnx-android
- GitHub OpenMed: https://github.com/maziyarpanahi/openmed
- Web OpenMed: https://openmed.life/
- Documentacion MLX backend: https://openmed.life/docs/mlx-backend/
- Documentacion OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Coleccion de modelos MLX medicos: https://huggingface.co/collections/OpenMed/medical-mlx-models
