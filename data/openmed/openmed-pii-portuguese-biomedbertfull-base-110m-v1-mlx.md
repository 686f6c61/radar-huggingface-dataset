# OpenMed/OpenMed-PII-Portuguese-BiomedBERTFull-Base-110M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-BiomedBERTFull-Base-110M-v1-mlx es un modelo de clasificación de tokens (token classification) basado en BERT, con 110 millones de parámetros, afinado para la detección de información personal identificable (PII) en texto biomédico en portugués. Ha sido desarrollado por OpenMed, un proyecto de IA sanitaria local-first que prioriza el procesamiento 100% en el dispositivo, y este repositorio concreto contiene un empaquetado en formato MLX para su ejecución eficiente en hardware Apple Silicon.

El modelo resuelve el problema de la de-identificación de datos clínicos: identifica entidades como nombres, números de historia clínica, datos de contacto y otros elementos sensibles dentro de notas médicas y registros de salud, permitiendo su redacción o enmascaramiento automático. Su relevancia actual radica en la creciente necesidad de cumplir normativas de privacidad (HIPAA, GDPR) en entornos sanitarios, especialmente en países lusófonos, y en la tendencia hacia soluciones de IA que no requieran enviar datos de pacientes a la nube.

La arquitectura es un BERT base (BertForTokenClassification) con una ventana de contexto típica de 512 tokens, aunque este dato no se especifica oficialmente en la documentación del modelo. El repositorio MLX incluye los pesos en formato safetensors, el tokenizador y los archivos de configuración necesarios para su uso con la librería OpenMed en Macs con Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 110 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (y posiblemente npz) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, concretamente en la variante `BertForTokenClassification`, que añade una cabeza de clasificación por token sobre el encoder de BERT. El checkpoint original (`OpenMed/OpenMed-PII-Portuguese-BiomedBERTFull-Base-110M-v1`) fue afinado para la tarea de detección de PII en texto biomédico portugués, pero no se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de ajuste (si se empleó RLHF, DPO u otra técnica). La innovación principal de este repositorio es el empaquetado en formato MLX, que permite la inferencia nativa en Apple Silicon mediante la librería OpenMed, sin necesidad de convertir los pesos manualmente.

## Capacidades

- Deteccion de entidades PII en texto biomedico portugues: nombres de pacientes, numeros de historia clinica, datos de contacto, direcciones, fechas de nacimiento y otros elementos sensibles.
- Clasificacion a nivel de token, lo que permite identificar entidades de longitud variable dentro de frases complejas.
- Integracion con la API de OpenMed para extraccion de entidades con puntuaciones de confianza.
- Soporte de "smart merging" (fusion inteligente de entidades) para agrupar tokens consecutivos en una unica entidad coherente.
- Ejecucion local en Apple Silicon mediante el backend MLX, sin necesidad de conexion a internet ni envio de datos a servidores externos.
- Compatibilidad con el ecosistema OpenMed, que incluye mas de 2200 modelos medicos y soporte para 21 idiomas.

## Casos de uso

- De-identificacion de notas clinicas para investigacion: el modelo puede procesar historiales medicos y eliminar automaticamente los datos personales antes de que los datos se utilicen en estudios academicos o ensayos clinicos, cumpliendo con los requisitos de anonimizacion.
- Cumplimiento normativo en sistemas de salud: integrado en un pipeline de procesamiento de documentos, permite a hospitales y clinicas redactar PII en informes, recetas y comunicaciones internas para cumplir con HIPAA, GDPR y la legislacion portuguesa de proteccion de datos.
- Preparacion de datasets para entrenamiento de modelos de IA: antes de utilizar datos clinicos para entrenar otros modelos, este sistema puede limpiar los corpus eliminando informacion personal, reduciendo el riesgo de fuga de datos.
- Redaccion automatica de historiales para telemedicina: en plataformas de consulta remota, el modelo puede enmascarar datos sensibles en las transcripciones de las consultas antes de almacenarlas o compartirlas con terceros.
- Auditoria de privacidad en registros electronicos de salud: el modelo puede escanear bases de datos existentes para identificar campos que contengan PII no declarada, ayudando a las organizaciones a localizar y corregir brechas de seguridad.
- Despliegue local en entornos con restricciones de red: al ejecutarse completamente en el dispositivo (gracias al backend MLX), es adecuado para hospitales o centros de investigacion que no pueden enviar datos de pacientes a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo de 110 millones de parametros, es ligero y puede ejecutarse en CPU y GPU de consumo general. No se han publicado requisitos oficiales de VRAM, pero un BERT de este tamano ocupa aproximadamente 440 MB en precision FP32, y menos si se aplica cuantizacion (no especificada en el repositorio).
- Para el backend MLX, se requiere un Mac con chip Apple Silicon (M1 o posterior). El modelo esta optimizado para esta arquitectura.
- Opciones de despliegue: mediante la libreria OpenMed con backend MLX en Apple Silicon, o mediante el backend estandar de Hugging Face / PyTorch en otros sistemas. Tambien es posible usar el repositorio directamente con la API de OpenMed.
- No se dispone de datos oficiales sobre latencia o throughput. Dado el tamano del modelo, se espera un rendimiento en tiempo real en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos en la documentacion proporcionada. El modelo pertenece a la familia de modelos BERT para NER clinico, pero no se han facilitado datos de otros modelos de la misma categoria para establecer una comparativa.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para portugues; no es aplicable a otros idiomas sin reentrenamiento.
- Al ser un modelo de tamano reducido (110M), puede tener una precision limitada en comparacion con modelos mas grandes, especialmente en textos clinicos muy especializados o con jerga poco frecuente.
- No se ha publicado informacion sobre sesgos especificos, pero como todo modelo de lenguaje, puede reflejar sesgos presentes en los datos de entrenamiento.
- No se han documentado tasas de error ni casos de alucinacion en la deteccion de entidades; se recomienda validar los resultados en un conjunto de prueba propio antes de su uso en produccion.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero el usuario es responsable de verificar que el uso cumple con las normativas de proteccion de datos aplicables en su jurisdiccion.
- El empaquetado MLX esta pensado para Apple Silicon; en otros sistemas se requiere el backend PyTorch, que puede tener un rendimiento inferior.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BiomedBERTFull-Base-110M-v1-mlx
- Repositorio HuggingFace del modelo base: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BiomedBERTFull-Base-110M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentacion del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentacion de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Coleccion de modelos medicos MLX de OpenMed: https://huggingface.co/collections/OpenMed/medical-mlx-models
