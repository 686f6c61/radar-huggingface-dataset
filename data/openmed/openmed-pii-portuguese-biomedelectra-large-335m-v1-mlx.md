# OpenMed/OpenMed-PII-Portuguese-BiomedELECTRA-Large-335M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-BiomedELECTRA-Large-335M-v1-mlx es un modelo de clasificación de tokens (token classification) diseñado para la detección de información personal identificable (PII) en texto clínico en portugués. Desarrollado por OpenMed, forma parte de una colección de modelos médicos orientados a la anonimización de historiales clínicos y al cumplimiento de normativas de privacidad como la LGPD brasileña o el RGPD europeo. El modelo se distribuye en un formato optimizado para Apple Silicon mediante el framework MLX, lo que permite su ejecución local sin necesidad de infraestructura en la nube.

El checkpoint base es `OpenMed/OpenMed-PII-Portuguese-BiomedELECTRA-Large-335M-v1`, un modelo de 335 millones de parámetros basado en una arquitectura transformer (tipo BERT/ELECTRA) fine-tuneado específicamente para la tarea de reconocimiento de entidades PII. La versión MLX aquí descrita incluye los pesos en formato `safetensors` y los assets del tokenizador, listos para su uso con la librería `openmed` en Macs con chip Apple. Aunque el nombre sugiere una variante ELECTRA, la model card indica que la familia es `bert` con la clase `BertForTokenClassification`.

La relevancia de este modelo radica en su enfoque local-first: permite procesar documentos clínicos sensibles sin enviar datos a servidores externos, una ventaja crítica en entornos sanitarios donde la privacidad del paciente es prioritaria. Su tamaño moderado (335M) lo hace viable en hardware de consumo, especialmente en Apple Silicon con MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (tipo BERT/ELECTRA, implementado como `BertForTokenClassification`) |
| Parametros totales | 335 millones |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato MLX, posible cuantizacion no documentada) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tambien puede incluir .npz en el paquete MLX) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer de tipo encoder, similar a BERT o ELECTRA, con 335 millones de parametros. Segun la model card, la implementacion concreta es `BertForTokenClassification`, lo que indica una cabeza de clasificacion por token sobre un encoder preentrenado. El nombre del checkpoint base (`BiomedELECTRA-Large-335M`) sugiere que el modelo preentrenado podria ser una variante de ELECTRA adaptada al dominio biomedico, aunque no se confirma en la documentacion disponible.

No se han publicado detalles sobre el proceso de entrenamiento: ni el numero de tokens, ni la composicion del dataset, ni si se utilizaron tecnicas como RLHF o DPO. Lo unico documentado es que se trata de un fine-tuning para la deteccion de PII en texto clinico portugues, partiendo de un modelo base biomedico. El empaquetado MLX es una conversion de los pesos originales para su ejecucion en Apple Silicon, sin modificacion de los pesos.

## Capacidades

- Deteccion de entidades PII en texto clinico en portugues: nombres, numeros de identificacion, direcciones, fechas, etc.
- Clasificacion a nivel de token (token classification), lo que permite identificar entidades con precision a nivel de subpalabra.
- Integracion con la libreria `openmed` para extraccion de PII con funciones como `extract_pii`, que incluye opciones de fusion inteligente de entidades (`use_smart_merging`).
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de conexion a internet ni envio de datos a servidores externos.
- Compatibilidad con el backend PyTorch/Hugging Face en otros sistemas, segun la documentacion de OpenMed.
- Soporte para uso directo con `AutoModelForTokenClassification` y el tokenizador biomedico portugues correspondiente.

## Casos de uso

- Anonimizacion de historias clinicas para investigacion: el modelo puede procesar notas medicas en portugues y marcar automaticamente los campos PII, permitiendo compartir datos anonimizados con fines de estudio sin violar la privacidad del paciente.
- Cumplimiento normativo en hospitales y clinicas: integrado en un pipeline local, ayuda a las instituciones sanitarias a cumplir con la LGPD (Brasil) o el RGPD (Europa) al detectar y eliminar datos personales antes de cualquier transferencia o publicacion.
- Preparacion de conjuntos de datos para entrenamiento de modelos medicos: al limpiar PII de corpus clinicos, se pueden crear datasets de entrenamiento seguros para otros modelos de NLP en el dominio de la salud.
- Auditoria de registros electronicos de salud: el modelo puede escanear bases de datos de historiales y senalar registros que contengan informacion personal no anonimizada, facilitando tareas de auditoria interna.
- Desarrollo de asistentes clinicos locales: en entornos con requisitos estrictos de privacidad, el modelo puede integrarse en aplicaciones de escritorio o moviles que procesen notas del paciente sin salir del dispositivo.
- Investigacion en PII multilingue: aunque esta especializado en portugues, puede servir como referencia para comparar tecnicas de de-identificacion en otros idiomas o para transferir aprendizaje a otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre metricas como F1, precision o recall en tareas de deteccion de PII, ni comparaciones con otros modelos de de-identificacion en portugues.

## Requisitos de hardware

- VRAM estimada: para un modelo de 335M de parametros, en precision fp32 se requieren aproximadamente 1.3 GB de memoria; en fp16 unos 670 MB. Con cuantizacion a 8 bits podria reducirse a ~335 MB, aunque no se documenta cuantizacion especifica en este paquete MLX.
- GPU recomendadas: en Apple Silicon, cualquier Mac con chip M1 o superior puede ejecutar el modelo via MLX. En sistemas con NVIDIA, se puede usar el backend PyTorch con GPUs como RTX 3060 o superiores (con al menos 4 GB de VRAM).
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con 4 GB o mas de VRAM, y en Macs con memoria unificada de 8 GB o mas.
- Opciones de despliegue: la libreria `openmed` con backend MLX en Apple Silicon; tambien se puede cargar con Hugging Face Transformers (`AutoModelForTokenClassification`) en cualquier sistema con PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Al ser un modelo de 335M, la inferencia en Apple Silicon deberia ser de decenas de milisegundos por documento corto, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Existen otros modelos de de-identificacion de PII en portugues, como los basados en BERTimbau o en modelos biomedicos, pero no se han encontrado datos concretos para establecer una comparacion rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para portugues; su uso en otros idiomas no esta soportado y probablemente produzca resultados incorrectos.
- Al ser un modelo de token classification, su precision depende de la calidad del tokenizador y del dominio de entrenamiento. Puede fallar en textos no clinicos o con jerga muy especializada.
- No se han documentado sesgos especificos, pero como todo modelo entrenado con datos reales, puede reflejar sesgos presentes en los corpus clinicos (por ejemplo, sobre-representacion de ciertos dialectos o poblaciones).
- Riesgo de alucinacion: aunque es un modelo discriminativo (no generativo), puede clasificar erroneamente tokens como PII o no detectar PII reales. Se recomienda revision humana en aplicaciones criticas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantias. El usuario es responsable de validar su rendimiento en su caso de uso concreto.
- El paquete MLX esta pensado para Apple Silicon; en otros sistemas se debe usar el checkpoint original en PyTorch, que puede requerir mas recursos.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BiomedELECTRA-Large-335M-v1-mlx
- Checkpoint base (PyTorch): https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BiomedELECTRA-Large-335M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentacion del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentacion de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Coleccion de modelos medicos MLX de OpenMed: https://huggingface.co/collections/OpenMed/medical-mlx-models
