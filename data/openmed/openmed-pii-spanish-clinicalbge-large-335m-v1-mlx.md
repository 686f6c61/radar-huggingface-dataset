# OpenMed/OpenMed-PII-Spanish-ClinicalBGE-Large-335M-v1-mlx

## Resumen

OpenMed-PII-Spanish-ClinicalBGE-Large-335M-v1-mlx es un modelo de clasificación de tokens (token classification) diseñado para la detección de información personal identificable (PII) en texto clínico en español. Desarrollado por OpenMed, este modelo se basa en el encoder BGE-Large de 335 millones de parámetros y ha sido fine-tuneado específicamente para identificar 54 tipos de entidades sensibles, como nombres, direcciones, números de seguridad social y números de registro médico, entre otros. Su objetivo principal es facilitar la de-identificación de documentos clínicos para cumplir con normativas de privacidad y permitir su uso en investigación.

La versión `-mlx` que aquí se documenta es un empaquetado de los pesos en formato MLX, optimizado para inferencia en dispositivos Apple Silicon (macOS y iPhone/iPad). Esto permite ejecutar el modelo de forma nativa y eficiente en hardware de Apple, tanto desde Python (con la librería `openmed[mlx]`) como desde Swift (con OpenMedKit). El modelo original está disponible en Hugging Face y esta variante MLX mantiene compatibilidad con el ecosistema OpenMed, que gestiona automáticamente el backend adecuado según el entorno.

La relevancia de este modelo radica en la creciente necesidad de proteger datos sanitarios en entornos clínicos, especialmente en el ámbito hispanohablante, donde existen pocas soluciones específicas para de-identificación de texto médico. Al estar basado en una arquitectura BERT probada y ofrecer soporte para Apple Silicon, facilita su despliegue en entornos de investigación y producción con requisitos de privacidad estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 335M (indicado en el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato MLX nativo) |
| Idiomas soportados | es (español) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, concretamente en el encoder BGE-Large de 335 millones de parámetros, adaptado para la tarea de clasificación de tokens mediante una cabeza de clasificación por token (BertForTokenClassification). El modelo original fue fine-tuneado sobre datos clínicos en español para la detección de PII, aunque no se han publicado detalles específicos sobre el volumen de datos de entrenamiento, la composición del dataset ni las técnicas de ajuste (por ejemplo, si se utilizó aprendizaje supervisado estándar o algún método adicional). La variante MLX no modifica la arquitectura, sino que convierte los pesos al formato MLX para su ejecución eficiente en Apple Silicon.

No se dispone de información sobre innovaciones técnicas particulares en el entrenamiento, como decodificación especulativa o atención lineal. El modelo se distribuye sin el tokenizer incluido en el repositorio MLX; OpenMed y OpenMedKit recurren al tokenizer del modelo base original cuando es necesario.

## Capacidades

- Detección de PII en texto clínico en español: identifica 54 tipos de entidades sensibles, incluyendo nombres, direcciones, números de seguridad social, números de registro médico, fechas, teléfonos, correos electrónicos, etc.
- Clasificación de tokens: asigna una etiqueta a cada token del texto, permitiendo la extracción de entidades con sus posiciones exactas.
- Integración con OpenMed: la API `extract_pii` permite obtener entidades con etiquetas, texto y nivel de confianza, con opción de fusión inteligente de tokens (`use_smart_merging`).
- Soporte multilingüe limitado: el modelo está entrenado específicamente para español, aunque la arquitectura BERT subyacente podría generalizar parcialmente a otros idiomas romances (no garantizado).
- Compatibilidad con Apple Silicon: ejecución nativa en macOS y dispositivos iOS/iPadOS mediante MLX, tanto desde Python como desde Swift.
- Fallback automático: en sistemas sin Apple Silicon, OpenMed puede usar el backend de Hugging Face / PyTorch con el modelo original.

## Casos de uso

- De-identificación de historiales clínicos electrónicos: el modelo puede procesar notas médicas en español y marcar automáticamente los campos PII, permitiendo su anonimización antes de compartir datos con terceros o para investigación.
- Cumplimiento normativo (GDPR, LOPD): ayuda a las instituciones sanitarias a cumplir con las regulaciones de protección de datos, detectando información personal en documentos clínicos antes de su publicación o transferencia.
- Preparación de datasets para investigación médica: los investigadores pueden usar el modelo para limpiar corpus clínicos y eliminar PII, facilitando el entrenamiento de otros modelos sin comprometer la privacidad de los pacientes.
- Auditoría de privacidad en sistemas de salud: integrado en pipelines de control de calidad, el modelo puede revisar automáticamente si los documentos generados contienen información sensible no deseada.
- Anonimización de informes de alta y pruebas diagnósticas: en entornos hospitalarios, el modelo puede procesar informes en español y generar versiones anonimizadas para su uso en docencia o publicación.
- Aplicaciones móviles de salud: gracias a la compatibilidad con Swift MLX, el modelo puede ejecutarse en iPhone/iPad para procesar texto clínico localmente, sin enviar datos a servidores externos, lo que refuerza la privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como precisión, recall o F1 sobre conjuntos de datos estándar de PII en español, ni comparaciones con otros modelos de de-identificación.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon: requiere un Mac con chip M1, M2, M3 o superior, o un iPhone/iPad con chip Apple Silicon.
- No se especifica la VRAM necesaria, pero al tratarse de un modelo de 335M parámetros en formato MLX, se estima que puede ejecutarse en dispositivos con al menos 8 GB de memoria unificada (típico en Macs de gama de entrada).
- Para Python, se necesita instalar `openmed[mlx]`; para Swift, se utiliza OpenMedKit.
- El despliegue en GPUs NVIDIA no es el objetivo de esta variante MLX; para ello se debe usar el modelo original en formato PyTorch.
- No se proporcionan datos de latencia o throughput; dependerán del dispositivo concreto y de la longitud del texto procesado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| OpenMed-PII-Spanish-ClinicalBGE-Large-335M-v1-mlx (este) | 335M | no disponible | es | Apache-2.0 | MLX |
| OpenMed-PII-Spanish-ClinicalBGE-Large-568M-v1-mlx | 568M | no disponible | es | Apache-2.0 | MLX |
| OpenMed-PII-Spanish-ClinicalBGE-Large-335M-v1 (original) | 335M | no disponible | es | Apache-2.0 | PyTorch |

La versión de 568M ofrece mayor capacidad pero requiere más recursos; la versión original en PyTorch es la adecuada para entornos con GPUs NVIDIA. No se dispone de comparativas con otros modelos de PII en español (por ejemplo, modelos basados en RoBERTa o XLM-R) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para español; su rendimiento en otros idiomas no está garantizado.
- No se incluye el tokenizer en el repositorio MLX; se depende del tokenizer del modelo base, lo que puede requerir acceso a internet o descarga adicional.
- No se han publicado métricas de rendimiento, por lo que se desconoce su precisión real en entornos clínicos variados.
- El modelo puede presentar sesgos derivados de los datos de entrenamiento, aunque no se han documentado casos específicos.
- Riesgo de alucinación o errores en la clasificación de entidades ambiguas; se recomienda revisión humana en aplicaciones críticas.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el uso en el sector sanitario cumpla con las normativas locales de protección de datos.
- El repositorio MLX está pensado para Apple Silicon; en otros hardware se debe usar el modelo original, que no está empaquetado en este formato.

## Enlaces

- Repositorio Hugging Face del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-ClinicalBGE-Large-335M-v1-mlx
- Modelo base original: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-ClinicalBGE-Large-335M-v1
- Versión de 568M en MLX: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-ClinicalBGE-Large-568M-v1-mlx
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
