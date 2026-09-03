# OpenMed/OpenMed-PII-Portuguese-BioClinicalBERT-Base-110M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-BioClinicalBERT-Base-110M-v1-mlx es un empaquetado en formato MLX del modelo homónimo de OpenMed, diseñado para la detección de información personal identificable (PII) en texto clínico en portugués. Se trata de un modelo de clasificación de tokens basado en la arquitectura BERT (BertForTokenClassification) con 110 millones de parámetros, afinado específicamente para la tarea de de-identificación de datos sanitarios. El empaquetado MLX permite su ejecución eficiente en dispositivos Apple Silicon mediante la librería OpenMed, manteniendo la inferencia completamente local y sin necesidad de enviar datos a la nube.

Este modelo resuelve el problema de la anonimización de historiales clínicos y otros documentos médicos en portugués, un requisito habitual para cumplir normativas de protección de datos como la LGPD brasileña o la HIPAA en contextos internacionales. Su relevancia actual radica en la creciente demanda de soluciones de IA clínica que operen on-device, garantizando la privacidad del paciente. El modelo se distribuye bajo licencia Apache-2.0, lo que facilita su integración en sistemas propietarios y de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 110 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT base, una red transformer bidireccional con 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, adaptada para clasificacion de tokens mediante una capa de salida sobre cada token. El checkpoint original (OpenMed/OpenMed-PII-Portuguese-BioClinicalBERT-Base-110M-v1) fue afinado para la deteccion de PII en texto clinico portugues, aunque no se han publicado detalles especificos sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO. El empaquetado MLX conserva la misma arquitectura y pesos, pero convierte los tensores al formato optimizado para Apple Silicon, permitiendo inferencia con el backend MLX de OpenMed.

## Capacidades

- Deteccion de entidades PII en texto clinico portugues, incluyendo nombres, fechas, direcciones, numeros de identificacion y otros datos personales.
- Clasificacion de tokens a nivel de token, con soporte para etiquetas personalizadas definidas en el archivo `id2label.json`.
- Integracion con la API `extract_pii` de OpenMed, que incluye funciones de fusion inteligente de entidades (`use_smart_merging`) para mejorar la coherencia de los resultados.
- Ejecucion local en Apple Silicon mediante el backend MLX, sin dependencia de servicios en la nube.
- Compatibilidad con el ecosistema OpenMed, que ofrece mas de 2.200 modelos medicos y soporte para 21 idiomas en su conjunto.

## Casos de uso

- Anonimizacion de historiales clinicos: el modelo puede procesar notas medicas en portugues y marcar automaticamente los campos de PII, facilitando la creacion de versiones anonimizadas para investigacion o comparticion con terceros.
- Cumplimiento de la LGPD en Brasil: integrado en sistemas de gestion de datos sanitarios, permite detectar y enmascarar informacion personal antes de almacenar o transmitir registros, reduciendo el riesgo de sanciones regulatorias.
- Preparacion de datasets para entrenamiento de modelos: al eliminar PII de corpus clinicos, se pueden generar conjuntos de datos limpios para entrenar otros modelos de NLP sin exponer informacion sensible.
- Auditoria de documentos: utilizado como herramienta de revision para verificar que documentos clinicos exportados no contengan datos personales no deseados, especialmente en entornos de intercambio entre instituciones.
- Asistencia en ensayos clinicos: ayuda a desidentificar los datos de los participantes antes de publicar resultados o compartir informacion con colaboradores externos.
- Integracion en flujos de trabajo de atencion primaria: un modulo local en el ordenador del medico puede anonimizar automaticamente las notas antes de enviarlas a sistemas centrales, manteniendo la privacidad del paciente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere un Mac con chip Apple Silicon (M1 o superior) para ejecutar el backend MLX de OpenMed.
- El tamano del repositorio es de 0,9 GB, por lo que el modelo cabe en la memoria unificada de cualquier Mac moderno; no se dispone de una cifra exacta de VRAM, pero al ser un modelo de 110M de parametros, es adecuado para equipos con 8 GB o mas de memoria unificada.
- Se puede desplegar mediante la libreria `openmed[mlx]` en Python, o usando el directorio local descargado con `hf download`.
- Para aplicaciones Swift, se recomienda el uso de OpenMedKit, aunque el soporte Swift para esta familia de modelos esta en la matriz de compatibilidad actual.
- No se dispone de datos de latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de deteccion de PII en portugues. La informacion proporcionada no incluye referencias a alternativas comparables.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para portugues; no es adecuado para otros idiomas sin un afinamiento adicional.
- Al ser un modelo de clasificacion de tokens, puede presentar errores de etiquetado en textos con jerga clinica muy especializada o formatos no estandar, lo que requiere una validacion humana en entornos de produccion.
- No se han publicado detalles sobre sesgos especificos, pero como cualquier modelo de NLP, puede reflejar sesgos presentes en los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos de la plataforma OpenMed y las normativas locales de proteccion de datos antes de su despliegue.
- El empaquetado MLX esta pensado para Apple Silicon; en otros sistemas, OpenMed recurre al backend PyTorch, lo que puede implicar diferencias de rendimiento.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BioClinicalBERT-Base-110M-v1-mlx
- Modelo base (PyTorch): https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BioClinicalBERT-Base-110M-v1
- GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentacion del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentacion de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Coleccion de modelos medicos MLX: https://huggingface.co/collections/OpenMed/medical-mlx-models
