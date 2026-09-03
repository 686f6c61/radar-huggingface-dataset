# OpenMed/OpenMed-PII-Portuguese-ClinicalBGE-Large-335M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-ClinicalBGE-Large-335M-v1-mlx es un empaquetado en formato MLX del modelo de detección de información personal identificable (PII) en textos clínicos portugueses desarrollado por OpenMed. El modelo original, OpenMed-PII-Portuguese-ClinicalBGE-Large-335M-v1, es un transformer de tipo BERT (BertForTokenClassification) con 335 millones de parámetros, fine-tuneado sobre la arquitectura BGE-Large para etiquetar entidades como nombres de pacientes, números de identificación, direcciones y fechas en historiales clínicos.

Este repositorio concreto no es un modelo independiente, sino una conversión a pesos MLX (safetensors) pensada para inferencia en Apple Silicon mediante la librería OpenMed. Su relevancia radica en permitir la anonimización de datos clínicos en portugués de forma local, sin enviar información sensible a servidores externos, lo que facilita el cumplimiento de normativas de protección de datos como la LGPD brasileña o el RGPD europeo. El modelo se distribuye bajo licencia Apache-2.0 y está orientado a tareas de token classification (NER).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 335 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato MLX, sin cuantizacion declarada) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un BGE-Large (BAAI General Embedding) adaptado como clasificador de tokens, lo que implica una arquitectura transformer encoder con atencion bidireccional. El checkpoint original fue fine-tuneado especificamente para la deteccion de PII en texto clinico portugues, aunque no se han publicado detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas como RLHF o DPO. Este repositorio MLX no modifica la arquitectura, solo convierte los pesos al formato optimizado para Apple Silicon.

No se dispone de informacion sobre innovaciones tecnicas adicionales, como decodificacion especulativa o atencion lineal. El modelo se integra en el ecosistema OpenMed, que ofrece funciones de extraccion de PII con fusion inteligente de entidades (smart merging).

## Capacidades

- Deteccion de entidades PII en texto clinico portugues: nombres de pacientes, numeros de identificacion, direcciones, fechas y otros datos personales.
- Clasificacion de tokens (token classification) para etiquetado de entidades a nivel de subpalabra.
- Integracion con la API de OpenMed para extraccion de PII con fusion de entidades adyacentes.
- Ejecucion local en Apple Silicon mediante el backend MLX, sin necesidad de conexion a internet.
- Compatibilidad con el flujo de trabajo de OpenMed para anonimizacion de historiales clinicos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multimodal.

## Casos de uso

- Anonimizacion de historiales clinicos para investigacion: el modelo puede procesar notas medicas en portugues y enmascarar automaticamente nombres, numeros de documento y fechas antes de compartir los datos con equipos de investigacion.
- Cumplimiento de la LGPD en Brasil: hospitales y clinicas pueden integrar el modelo en sus pipelines para garantizar que los datos personales de pacientes no se expongan en registros internos o externos.
- Preparacion de datasets clinicos para entrenamiento de otros modelos: al eliminar PII de corpus en portugues, se pueden generar conjuntos de datos seguros para fine-tuning de LLMs medicos.
- Despliegue en dispositivos Apple en entornos sanitarios: gracias al formato MLX, el modelo puede ejecutarse en Macs o iPads con chip Apple Silicon, manteniendo los datos en el dispositivo.
- Auditoria de documentos clinicos: el modelo puede utilizarse para revisar exportaciones de historiales y senalar posibles fugas de informacion personal antes de su publicacion.
- Integracion en sistemas de gestion de historiales electronicos (EHR): mediante la API de OpenMed, se puede anadir una capa de deteccion de PII en tiempo real durante la creacion o edicion de registros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como MMLU, HumanEval o GSM8K, ni de evaluaciones especificas de NER sobre corpus clinicos portugueses.

## Requisitos de hardware

- Dispositivo Apple Silicon (M1, M2, M3 o superior) para ejecucion MLX nativa.
- Memoria unificada estimada: no se especifica, pero un modelo de 335M de parametros en precision FP16 requiere aproximadamente 670 MB de pesos, por lo que cabe en Macs con 8 GB de RAM o mas.
- En sistemas sin Apple Silicon, OpenMed puede recurrir al backend PyTorch/Hugging Face, aunque este repositorio esta disenado para MLX.
- Opciones de despliegue: libreria OpenMed con backend MLX (`pip install "openmed[mlx]"`), o uso directo del directorio descargado con `OpenMedConfig(backend="mlx")`.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de deteccion de PII en portugues clinico en los datos proporcionados. Existen alternativas genericas como modelos NER multilingues (XLM-R, por ejemplo) o herramientas como Presidio, pero no hay datos de rendimiento relativos en la documentacion consultada.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para portugues; no se garantiza su funcionamiento en otros idiomas.
- No se especifican sesgos potenciales, pero al tratarse de un modelo clinico podria presentar sesgos de genero, edad o procedencia geografica en la deteccion de entidades, aunque no hay evidencia publicada al respecto.
- Al ser un modelo de NER, el riesgo de alucinacion es bajo, pero pueden producirse errores de etiquetado (falsos positivos o negativos) que requieran supervision humana en entornos criticos.
- La longitud de contexto no esta documentada; se recomienda verificar el comportamiento con textos clinicos largos antes de su uso en produccion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no incluye garantias de exactitud medica ni de cumplimiento normativo especifico.
- Este repositorio es un empaquetado MLX; para otras plataformas debe utilizarse el checkpoint original en PyTorch.

## Enlaces

- Repositorio HuggingFace (MLX): https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-ClinicalBGE-Large-335M-v1-mlx
- Modelo base (PyTorch): https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-ClinicalBGE-Large-335M-v1
- OpenMed GitHub: https://github.com/maziyarpanahi/openmed
- Documentacion del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentacion de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Coleccion de modelos medicos MLX: https://huggingface.co/collections/OpenMed/medical-mlx-models
