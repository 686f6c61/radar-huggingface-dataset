# OpenMed/OpenMed-PII-Italian-mLiteClinical-Base-135M-v1-mlx

## Resumen

OpenMed-PII-Italian-mLiteClinical-Base-135M-v1-mlx es un empaquetado en formato MLX del modelo de clasificación de tokens OpenMed-PII-Italian-mLiteClinical-Base-135M-v1, desarrollado por el proyecto OpenMed para la detección de información personal identificable (PII) en textos clínicos en italiano. El modelo original es un DistilBERT de 135 millones de parámetros, fine-tuneado para identificar y clasificar 54 tipos de datos sensibles, como nombres, direcciones, números de seguridad social, números de historia clínica y otros campos típicos de entornos sanitarios.

La versión MLX está pensada para ejecutarse de forma local en dispositivos Apple Silicon (Mac, iPhone y iPad) mediante el framework MLX, sin necesidad de enviar datos de pacientes a la nube. Esto lo hace relevante para entornos clínicos donde la privacidad y el cumplimiento normativo (GDPR, HIPAA) son críticos. El modelo se integra con la librería OpenMed y con OpenMedKit para Swift, ofreciendo una API sencilla para extracción de entidades PII con fusión inteligente de tokens.

El repositorio incluye los pesos en formato MLX (safetensors o npz), el archivo de configuración y el mapeo de etiquetas, pero no incluye el tokenizador, que se referencia desde el modelo base. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBertForTokenClassification (familia DistilBERT) |
| Parametros totales | 135 millones (según nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típico de DistilBERT: 512, no confirmado) |
| Tipos de cuantizacion | MLX (pesos en safetensors y/o npz); no se documentan otras cuantizaciones |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (weights.safetensors, weights.npz), config.json, id2label.json |

## Arquitectura y entrenamiento

El modelo base es un DistilBERT, una versión destilada de BERT con 135 millones de parámetros, adaptado para clasificación de tokens (token classification). La cabeza de clasificación asigna a cada token una de las 54 etiquetas de PII definidas en el modelo original. El fine-tuning se realizó sobre datos clínicos en italiano, aunque no se han publicado detalles específicos sobre el volumen de datos, la composición del dataset ni el proceso de entrenamiento (épocas, optimizador, etc.) en la información disponible.

La versión MLX es un empaquetado que convierte los pesos del modelo original al formato MLX, manteniendo la misma arquitectura y comportamiento. No introduce cambios en el modelo subyacente, solo en el formato de serialización y en la integración con el runtime MLX para Apple Silicon. El repositorio no incluye el tokenizador, por lo que OpenMed y OpenMedKit recurren al tokenizador del modelo base cuando es necesario.

## Capacidades

- Detección y clasificación de 54 tipos de información personal identificable (PII) en texto clínico italiano, incluyendo nombres, direcciones, números de seguridad social, números de historia clínica, fechas, teléfonos, etc.
- Clasificación de tokens a nivel de token (token classification), con soporte para fusión inteligente de entidades (smart merging) para reconstruir entidades completas a partir de tokens fragmentados.
- Integración con la librería OpenMed en Python, que selecciona automáticamente el backend MLX en Apple Silicon o el backend PyTorch/Hugging Face en otros sistemas.
- Soporte para Swift mediante OpenMedKit, permitiendo ejecución en macOS, iPhone y iPad reales (no en simulador iOS).
- Ejecución 100% local, sin conexión a la nube, lo que garantiza que los datos de pacientes no salen del dispositivo.
- Compatible con el ecosistema OpenMed, que incluye más de 2.200 modelos médicos y soporte para 21 idiomas (según el repositorio de GitHub).

## Casos de uso

- Anonimización de historiales clínicos en italiano: el modelo puede procesar notas médicas y reemplazar o enmascarar automáticamente los identificadores personales antes de que los datos se utilicen para investigación o se compartan con terceros.
- Cumplimiento normativo en entornos sanitarios: ayuda a las organizaciones a cumplir con el RGPD (GDPR) y la HIPAA al detectar y eliminar PII en documentos clínicos, reduciendo el riesgo de filtraciones.
- Preparación de datasets para entrenamiento de modelos médicos: permite limpiar corpus clínicos italianos eliminando información sensible antes de usarlos para fine-tuning o evaluación de otros modelos.
- Intercambio seguro de datos entre hospitales: al ejecutarse localmente en dispositivos Apple, los profesionales pueden verificar y anonimizar informes antes de enviarlos por canales no seguros.
- Auditoría de registros médicos electrónicos: el modelo puede escanear bases de datos de historiales para identificar campos que contengan PII no declarada, facilitando tareas de gobernanza de datos.
- Aplicaciones móviles de salud: integración en apps iOS que manejan notas clínicas, permitiendo la de-identificación en el propio dispositivo sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de OpenMed menciona que el proyecto alcanza "state of the art on 10 of 12 biomedical NER benchmarks", pero no se proporcionan cifras concretas para este modelo específico ni comparaciones con alternativas.

## Requisitos de hardware

- Al ser un modelo de 135 millones de parámetros, el tamaño en memoria es reducido: en FP32 ocuparía aproximadamente 540 MB, y en MLX (que suele usar FP16 o BF16) alrededor de 270 MB. No se han publicado cifras oficiales de VRAM.
- Diseñado para Apple Silicon: cualquier Mac con chip M1, M2, M3 o superior puede ejecutarlo sin problemas, incluso con poca memoria unificada (8 GB son suficientes).
- También es compatible con iPhone y iPad reales mediante OpenMedKit y el backend Swift MLX, aunque no se especifican requisitos mínimos de hardware para estos dispositivos.
- En sistemas sin Apple Silicon, OpenMed puede usar el backend PyTorch/Hugging Face, ejecutándose en CPU o GPU NVIDIA, pero el empaquetado MLX no es aplicable en ese caso.
- Opciones de despliegue: librería OpenMed en Python (con `openmed[mlx]`), OpenMedKit en Swift, o uso directo del directorio MLX con la API de OpenMed.
- La latencia y el throughput no están documentados, pero para un modelo de este tamaño en Apple Silicon se espera un rendimiento en tiempo real en tareas de NER.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de detección de PII en italiano. No se han encontrado modelos equivalentes con los mismos parámetros, contexto y licencia en las fuentes consultadas. Se recomienda consultar el catálogo de OpenMed para explorar alternativas dentro de su ecosistema.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para texto clínico en italiano; su rendimiento en otros dominios o idiomas no está garantizado.
- No se han documentado sesgos específicos, pero al ser un modelo basado en DistilBERT, puede heredar sesgos presentes en los datos de preentrenamiento y fine-tuning.
- Como todo sistema de NER, puede cometer errores de clasificación (falsos positivos y negativos), por lo que no debe utilizarse como única herramienta de de-identificación en entornos con requisitos legales estrictos sin supervisión humana.
- El repositorio MLX no incluye el tokenizador; depende de la referencia al modelo base, lo que puede causar problemas si el modelo base deja de estar disponible.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el uso cumple con las normativas de protección de datos aplicables en su jurisdicción.
- No se han publicado métricas de rendimiento ni evaluaciones independientes, por lo que se recomienda validar el modelo con datos propios antes de desplegarlo en producción.

## Enlaces

- Repositorio MLX en Hugging Face: https://huggingface.co/OpenMed/OpenMed-PII-Italian-mLiteClinical-Base-135M-v1-mlx
- Modelo base: https://huggingface.co/OpenMed/OpenMed-PII-Italian-mLiteClinical-Base-135M-v1
- Repositorio de OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit: https://openmed.life/docs/swift-openmedkit/
- Página principal de OpenMed: https://openmed.life/
