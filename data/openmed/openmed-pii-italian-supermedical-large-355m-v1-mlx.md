# OpenMed/OpenMed-PII-Italian-SuperMedical-Large-355M-v1-mlx

## Resumen

OpenMed-PII-Italian-SuperMedical-Large-355M-v1-mlx es un empaquetado en formato MLX del modelo de clasificación de tokens OpenMed-PII-Italian-SuperMedical-Large-355M-v1, desarrollado por OpenMed para la detección de información personal identificable (PII) en texto clínico en italiano. El modelo original es un transformer basado en la arquitectura RoBERTa, fine-tuned específicamente para identificar y clasificar 54 tipos de entidades sensibles, como nombres, direcciones, números de seguridad social, números de registro médico, entre otros. Este repositorio MLX permite ejecutar el modelo de forma nativa en dispositivos Apple Silicon (Mac, iPhone, iPad) mediante las librerías OpenMed y OpenMedKit, sin necesidad de depender de la nube.

La relevancia de este modelo radica en su enfoque local-first para la de-identificación de datos clínicos, un requisito crítico en entornos sanitarios para cumplir normativas como HIPAA o el RGPD. Al poder ejecutarse completamente en el dispositivo, evita que los datos de pacientes salgan de la red hospitalaria, lo que reduce riesgos de privacidad y costes de infraestructura. El modelo tiene 355 millones de parámetros y está pensado para tareas de token classification, no para generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (RobertaForTokenClassification) |
| Parametros totales | 355 millones (según nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato MLX nativo) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, npz (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo RoBERTa, fine-tuned para clasificación de tokens (token classification) sobre texto clínico en italiano. La tarea consiste en asignar una etiqueta a cada token de la secuencia, identificando entidades PII entre 54 categorías predefinidas. No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO. El empaquetado MLX conserva la arquitectura original y los pesos del checkpoint fuente, pero adapta el formato para su ejecución eficiente en Apple Silicon mediante la librería OpenMed.

## Capacidades

- Detección y clasificación de información personal identificable (PII) en texto italiano, con 54 etiquetas distintas (nombres, direcciones, números de seguridad social, números de registro médico, etc.).
- Clasificación de tokens a nivel de token, con soporte para smart merging (fusión de tokens adyacentes para formar entidades completas).
- Ejecución local en Apple Silicon (Mac, iPhone, iPad) mediante MLX, sin necesidad de conexión a internet ni envío de datos a servidores externos.
- Integración con el ecosistema OpenMed, que incluye más de 2.200 modelos médicos y soporte para 21 idiomas, aunque este modelo concreto está limitado al italiano.
- No es un modelo generativo: no genera texto, no soporta tool calling, ni razonamiento multi-paso, ni capacidades multimodales.

## Casos de uso

- Anonimización de historias clínicas electrónicas: el modelo puede procesar notas clínicas en italiano y marcar automáticamente todos los campos PII, permitiendo su posterior enmascaramiento o eliminación antes de compartir los datos con fines de investigación o análisis.
- Cumplimiento normativo en hospitales: integrado en un pipeline local, ayuda a garantizar que los datos de pacientes no salgan del centro sanitario, cumpliendo con requisitos de privacidad como el RGPD o la HIPAA (adaptado al contexto italiano).
- Preparación de datasets para entrenamiento de modelos médicos: al eliminar PII de grandes volúmenes de texto clínico, se pueden crear conjuntos de datos anonimizados para entrenar otros modelos sin comprometer la privacidad.
- Auditoría de datos clínicos: permite revisar documentos existentes para detectar fugas de información personal, por ejemplo en informes de alta, recetas o correspondencia médica.
- Intercambio seguro de datos entre instituciones: al ejecutarse en el dispositivo, facilita la colaboración entre hospitales o centros de investigación sin necesidad de transferir datos sin anonimizar.
- Aplicaciones móviles de salud: gracias al soporte Swift MLX en OpenMedKit, el modelo puede integrarse en apps de iOS para anonimizar notas introducidas por el usuario en tiempo real, sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Diseñado para Apple Silicon: requiere un Mac con chip M1 o superior, o un iPhone/iPad con chip A14 o posterior (para Swift MLX).
- El tamaño del repositorio es de 1,4 GB, lo que incluye los pesos en formato MLX. Se recomienda al menos 4 GB de RAM libre para cargar el modelo en memoria, aunque el consumo exacto no está documentado.
- No se requieren GPUs dedicadas; la inferencia se ejecuta en la Neural Engine o en la GPU integrada del chip Apple Silicon.
- Opciones de despliegue: mediante la librería Python `openmed[mlx]` o mediante OpenMedKit para Swift. También es posible usar el backend de Hugging Face/PyTorch en sistemas sin Apple Silicon, aunque el rendimiento será inferior.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| OpenMed-PII-Italian-SuperMedical-Large-355M-v1-mlx | 355M | RoBERTa | Italiano | Apache-2.0 | MLX |
| OpenMed-PII-Italian-SuperClinical-Large-434M-v1 | 434M | RoBERTa | Italiano | Apache-2.0 | PyTorch (probablemente) |
| OpenMed-PII-Italian-SuperMedical-Large-355M-v1 (base) | 355M | RoBERTa | Italiano | Apache-2.0 | PyTorch |

El modelo base y su versión MLX son funcionalmente idénticos; la diferencia está en el formato de pesos. El modelo SuperClinical de 434M es una variante más grande, pero no se dispone de información sobre si ofrece mejores resultados. No se han encontrado otros modelos comparables de detección de PII en italiano con licencia abierta.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para italiano; no es aplicable a otros idiomas sin reentrenamiento.
- Al ser un modelo de clasificación de tokens, no puede generar texto ni responder preguntas; su uso se limita a la anotación de entidades.
- No se han publicado métricas de rendimiento ni estudios de sesgos; es posible que presente errores en textos con jerga clínica muy especializada o en variantes dialectales del italiano.
- La detección de PII no es perfecta: puede haber falsos positivos o negativos, por lo que se recomienda una revisión humana en entornos críticos.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo no incluye garantías de exactitud ni de cumplimiento normativo; la responsabilidad final recae en el usuario.
- El repositorio MLX no incluye los archivos del tokenizador; OpenMed y OpenMedKit recurren al tokenizador del modelo base, lo que requiere acceso a Hugging Face en el momento de la carga si no se ha cacheado previamente.

## Enlaces

- Repositorio MLX en Hugging Face: https://huggingface.co/OpenMed/OpenMed-PII-Italian-SuperMedical-Large-355M-v1-mlx
- Modelo base: https://huggingface.co/OpenMed/OpenMed-PII-Italian-SuperMedical-Large-355M-v1
- Repositorio de OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
