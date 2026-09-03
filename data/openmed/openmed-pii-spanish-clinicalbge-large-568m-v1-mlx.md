# OpenMed/OpenMed-PII-Spanish-ClinicalBGE-Large-568M-v1-mlx

## Resumen

OpenMed-PII-Spanish-ClinicalBGE-Large-568M-v1-mlx es un paquete de pesos en formato MLX del modelo de detección de información personal identificable (PII) en texto clínico español, desarrollado por el proyecto OpenMed. El modelo original, OpenMed-PII-Spanish-ClinicalBGE-Large-568M-v1, es un transformer de la familia XLM-RoBERTa con 568 millones de parámetros, ajustado para clasificar 54 tipos de entidades sensibles en dominios médico y biomédico, como nombres de pacientes, direcciones, números de seguridad social o números de historia clínica.

Esta versión MLX está pensada para ejecutarse de forma nativa en dispositivos Apple Silicon (macOS, iPhone y iPad) mediante las librerías OpenMed y OpenMedKit, sin necesidad de depender de la nube. La relevancia de este modelo radica en que permite la desidentificación de documentos clínicos en español de forma local, un requisito habitual en entornos sanitarios donde la privacidad del paciente y el cumplimiento normativo (como HIPAA o el RGPD) son críticos. El repositorio incluye los pesos en formato safetensors o npz, junto con los ficheros de configuración necesarios para su uso con el backend MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (XLMRobertaForTokenClassification) |
| Parametros totales | 568 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos MLX en safetensors o npz) |
| Idiomas soportados | Español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo base es un XLM-RoBERTa, una arquitectura transformer encoder-only multilingüe entrenada originalmente con 2,5 TB de datos filtrados de CommonCrawl en 100 idiomas. Sobre este encoder se ha añadido una cabeza de clasificación de tokens (token classification head) que asigna a cada token una de las 54 etiquetas de PII definidas para el dominio clínico en español. El ajuste fino se ha realizado sobre el checkpoint OpenMed-PII-Spanish-ClinicalBGE-Large-568M-v1, que a su vez parte de la familia BGE-Large de encoders de Beijing Academy of Artificial Intelligence (BAAI), especializados en representaciones densas de texto.

No se han publicado detalles sobre el dataset de entrenamiento, el número de épocas, ni si se emplearon técnicas como RLHF o DPO. El proyecto OpenMed se distribuye bajo licencia Apache-2.0 y su objetivo declarado es ofrecer modelos de procesamiento de lenguaje natural clínico que funcionen íntegramente en el dispositivo, sin enviar datos de pacientes a servidores externos.

## Capacidades

- Detección y clasificación de 54 tipos de entidades de información personal identificable en texto clínico en español, incluyendo nombres, direcciones, números de seguridad social, números de historia clínica, fechas, teléfonos y otros datos sensibles.
- Funciona como un sistema de etiquetado de secuencias (sequence labeling) a nivel de token, lo que permite localizar con precisión el inicio y el final de cada entidad dentro del texto.
- Integración con la API de OpenMed mediante la función `extract_pii`, que devuelve las entidades detectadas junto con su etiqueta y un nivel de confianza.
- Soporte de fusión inteligente de entidades (smart merging) para combinar tokens adyacentes que forman una misma entidad completa.
- Ejecución local en Apple Silicon mediante el backend MLX, tanto desde Python como desde Swift (OpenMedKit), sin conexión a internet.
- Compatibilidad con dispositivos móviles Apple (iPhone y iPad físicos) para inferencia en el dispositivo.

## Casos de uso

- Desidentificación de historias clínicas electrónicas: el modelo puede procesar notas clínicas en español y marcar automáticamente los datos personales del paciente antes de que el documento se utilice en investigación o se comparta con terceros. Su naturaleza local permite hacerlo sin que la información salga del centro sanitario.
- Preparación de corpus clínicos para entrenamiento de modelos: antes de publicar o compartir datasets médicos, es necesario eliminar o enmascarar la información identificable. Este modelo permite automatizar ese proceso sobre grandes volúmenes de texto en español.
- Cumplimiento normativo en ensayos clínicos: los documentos generados durante un ensayo clínico (formularios de consentimiento, informes de seguridad, etc.) pueden contener datos personales. El modelo facilita la revisión y anonimización previa a su archivado o auditoría.
- Anonimización de informes de alta hospitalaria: los informes de alta contienen información personal del paciente junto con el resumen clínico. El modelo puede identificar y enmascarar los campos sensibles de forma automática, reduciendo el trabajo manual del personal sanitario.
- Intercambio seguro de datos entre instituciones sanitarias: cuando dos hospitales o centros de investigación necesitan compartir datos clínicos, el modelo permite desidentificar los documentos en origen, garantizando que la información personal no viaja entre organizaciones.
- Aplicaciones móviles de salud: gracias a la versión MLX y al soporte de OpenMedKit, el modelo puede integrarse en apps de iOS que procesen texto clínico en el propio dispositivo, sin necesidad de enviar datos a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de datos estándar de desidentificación en español, ni comparaciones con otros modelos de detección de PII.

## Requisitos de hardware

- El modelo tiene 568 millones de parámetros, por lo que en precisión float32 ocuparía aproximadamente 2,3 GB en memoria. El tamaño del repositorio (2,3 GB) confirma esta estimación.
- Para inferencia en Apple Silicon, se recomienda un Mac con chip M1, M2, M3 o M4 con al menos 8 GB de RAM unificada. Con 16 GB se trabajará con mayor comodidad.
- En dispositivos móviles, es compatible con iPhone y iPad físicos con chip Apple Silicon (A14 o posterior), aunque el rendimiento dependerá de la memoria disponible en cada dispositivo.
- El backend MLX permite ejecutar el modelo en CPU y GPU de Apple Silicon de forma unificada, sin necesidad de GPU dedicada.
- Para otros entornos, el modelo original (no MLX) puede ejecutarse con PyTorch en GPU convencionales, aunque esta versión concreta está orientada a Apple Silicon.
- Las opciones de despliegue incluyen la librería Python `openmed[mlx]` y el framework Swift OpenMedKit. No se menciona soporte para vLLM, llama.cpp u Ollama.
- No se han publicado datos de latencia o throughput para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OpenMed-PII-Spanish-ClinicalBGE-Large-568M-v1-mlx | 568M | no disponible | Español | Apache-2.0 | MLX |
| OpenMed-PII-Spanish-ClinicalBGE-Large-335M-v1 | 335M | no disponible | Español | Apache-2.0 | PyTorch |
| OpenMed-PII-Spanish-ClinicalBGE-Large-568M-v1-onnx-android | 568M | no disponible | Español | Apache-2.0 | ONNX |

La comparativa se limita a la familia OpenMed, ya que no se dispone de información sobre otros modelos de detección de PII en español con los que comparar directamente. La versión MLX se distingue por su orientación exclusiva a Apple Silicon, mientras que la variante ONNX está pensada para Android y navegador, y la versión base (568M) es el checkpoint original en PyTorch.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación, por lo que se desconoce la precisión real del modelo en entornos clínicos reales. Es recomendable validar su rendimiento sobre un conjunto propio de documentos antes de usarlo en producción.
- El modelo está entrenado específicamente para español, por lo que no debe utilizarse con textos en otros idiomas sin un ajuste adicional.
- Al ser un modelo de clasificación de tokens, puede presentar errores de segmentación en entidades compuestas o en textos con formatos poco habituales (abreviaturas, errores tipográficos, etc.).
- La longitud de contexto no está documentada, lo que limita la planificación de su uso con documentos clínicos extensos. Habrá que dividir el texto en fragmentos si se supera el límite del modelo.
- El repositorio MLX no incluye los ficheros del tokenizador; OpenMed y OpenMedKit recurren al tokenizador del checkpoint original, lo que añade una dependencia externa en tiempo de ejecución.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo se distribuye sin garantías. La responsabilidad del cumplimiento normativo (RGPD, HIPAA) recae en quien lo utilice.
- El proyecto OpenMed es relativamente reciente y cuenta con pocas descargas (6 en el momento de la consulta), por lo que su comunidad y soporte son limitados.

## Enlaces

- Repositorio MLX en HuggingFace: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-ClinicalBGE-Large-568M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-ClinicalBGE-Large-568M-v1
- Variante ONNX para Android: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-ClinicalBGE-Large-568M-v1-onnx-android
- Repositorio de OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
