# OpenMed/OpenMed-PII-Spanish-BiomedBERT-Large-340M-v1-mlx

## Resumen

OpenMed-PII-Spanish-BiomedBERT-Large-340M-v1-mlx es un paquete de pesos en formato MLX del modelo de detección de información personal identificable (PII) en texto clínico en español, desarrollado por OpenMed (Modelers.cn). El modelo base es un BiomedBERT-Large de 340 millones de parámetros, ajustado específicamente para la tarea de clasificación de tokens (token classification) con el objetivo de identificar y clasificar entidades sensibles en historiales médicos y notas clínicas en castellano.

Este repositorio concreto no contiene un modelo nuevo, sino una conversión del checkpoint original a formato MLX, lo que permite su ejecución nativa en dispositivos Apple Silicon (Macs con chips M-series) tanto desde Python como desde Swift mediante la librería OpenMedKit. La relevancia de este paquete radica en que facilita el despliegue local y privado de un sistema de anonimización de datos clínicos en español, un requisito habitual para cumplir con normativas de protección de datos como el RGPD en entornos sanitarios.

El modelo original identifica 54 tipos de información sensible, incluyendo nombres, direcciones, números de seguridad social y números de historia clínica. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 340 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos MLX en safetensors/npz) |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo base es BiomedBERT-Large, una variante de BERT preentrenada con literatura biomédica. Sobre esta base se realizó un ajuste fino (fine-tuning) supervisado para la tarea de token classification orientada a la detección de PII en texto clínico en español. El modelo clasifica cada token de entrada en una de las 54 categorías de información sensible definidas.

El repositorio MLX contiene únicamente los pesos convertidos, el archivo `config.json` y el mapeo `id2label.json`. Los assets del tokenizador no se incluyen en este paquete; OpenMed y OpenMedKit resuelven esta carencia recurriendo a la referencia del tokenizador original en `config.json`. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO, ya que no se especifican en la documentación disponible.

## Capacidades

- Detección y clasificación de PII en texto clínico en español, con 54 categorías de entidades sensibles (nombres, direcciones, números de seguridad social, números de historia clínica, entre otras).
- Clasificación a nivel de token (token classification), lo que permite localizar con precisión el inicio y fin de cada entidad dentro del texto.
- Integración con la API de OpenMed mediante la función `extract_pii`, que incluye la opción de fusión inteligente de entidades (`use_smart_merging=True`) para agrupar tokens contiguos de la misma categoría.
- Ejecución nativa en Apple Silicon mediante el backend MLX, tanto desde Python (`openmed[mlx]`) como desde Swift (OpenMedKit).
- Compatibilidad con dispositivos iOS físicos (iPhone y iPad) para inferencia en el dispositivo.
- Funcionamiento offline y local, sin necesidad de conexión a servicios externos, lo que garantiza la privacidad de los datos procesados.

## Casos de uso

- Anonimización de historiales clínicos para investigación secundaria: el modelo procesa notas clínicas en español y marca todas las entidades PII, permitiendo generar versiones anonimizadas que pueden compartirse con equipos de investigación sin vulnerar la confidencialidad del paciente.
- Cumplimiento normativo en ensayos clínicos: antes de exportar datos de pacientes a plataformas externas o colaboradores, el modelo puede actuar como capa de verificación automática para detectar fugas de información personal en documentos generados durante el ensayo.
- Preparación de datasets para entrenamiento de modelos médicos: los datos clínicos etiquetados con PII deben ser desidentificados antes de usarse para fine-tuning de otros modelos; este modelo permite automatizar ese paso en pipelines de datos.
- Despliegue de servicios de salud en el dispositivo: gracias al formato MLX, el modelo puede ejecutarse directamente en un Mac o en un iPhone/iPad, permitiendo que una aplicación de gestión de pacientes procese notas localmente sin enviar datos a la nube.
- Auditoría de documentos clínicos exportados: integrado en un flujo de revisión documental, el modelo puede señalar automáticamente cualquier dato personal presente en informes de alta, derivaciones o resúmenes antes de su publicación o envío.
- Integración en sistemas de gestión hospitalaria: el modelo puede conectarse a través de la API de OpenMed a sistemas de registro médico electrónico para anonimizar automáticamente los campos de texto libre antes de su almacenamiento en entornos de análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de datos estándar de PII en español, ni comparativas cuantitativas con otros modelos de desidentificación.

## Requisitos de hardware

- Inferencia en Apple Silicon: el formato MLX está optimizado para chips M-series (M1, M2, M3 y sucesores). Un Mac con 8 GB de RAM unificada puede ejecutar el modelo, aunque 16 GB o más ofrecen mayor margen para procesar documentos largos.
- Dispositivos iOS: compatible con iPhone y iPad físicos con chip Apple Silicon; el simulador de iOS no es un objetivo soportado para Swift MLX.
- VRAM: al ser un modelo de 340M de parámetros, el consumo de memoria es reducido. En Apple Silicon, la memoria unificada compartida entre CPU y GPU es suficiente; no se requiere una GPU discreta.
- Opciones de despliegue: backend MLX a través de la librería `openmed[mlx]` en Python, o mediante OpenMedKit en Swift. En sistemas sin Apple Silicon, OpenMed puede recurrir al backend de Hugging Face / PyTorch.
- Latencia y throughput: no se han publicado cifras concretas de latencia o throughput para este modelo en MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| OpenMed-PII-Spanish-BiomedBERT-Large-340M-v1-mlx | 340M | no disponible | Token classification PII en español | Apache 2.0 | MLX |
| OpenMed-PII-Spanish-BiomedBERT-Base-110M-v1 | 110M | no disponible | Token classification PII en español | Apache 2.0 | PyTorch / Hugging Face |
| OpenMed-PII-Spanish-BiomedBERT-Large-340M-v1 | 340M | no disponible | Token classification PII en español | Apache 2.0 | PyTorch / Hugging Face |

La versión MLX es funcionalmente equivalente al checkpoint original de 340M, con la diferencia de que está optimizada para Apple Silicon. La versión Base de 110M es una alternativa más ligera con el mismo propósito, adecuada para entornos con menos recursos. No se dispone de comparativas con modelos de desidentificación de otros proveedores.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para texto clínico en español; su rendimiento en otros dominios o idiomas puede ser significativamente inferior.
- No se dispone de información sobre el dataset de entrenamiento, por lo que no es posible evaluar posibles sesgos derivados de la composición de los datos.
- El tokenizador no está incluido en este repositorio MLX; la inferencia depende de que OpenMed u OpenMedKit resuelvan correctamente la referencia al tokenizador original.
- No se han publicado métricas de evaluación, lo que impide conocer la precisión real del modelo en tareas de desidentificación.
- El repositorio puede estar marcado como privado en algunos entornos; se requiere autenticación con Hugging Face (`hf auth login` o `HF_TOKEN`) para su descarga.
- Aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del usuario verificar que el modelo cumple con los requisitos específicos de protección de datos del sector sanitario en su jurisdicción.
- El modelo es un clasificador de tokens, no un generador de texto; no debe utilizarse para tareas de generación o comprensión de lenguaje natural más allá de la detección de entidades.

## Enlaces

- Repositorio MLX en Hugging Face: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BiomedBERT-Large-340M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BiomedBERT-Large-340M-v1
- Versión Base 110M: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BiomedBERT-Base-110M-v1
- Repositorio de OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Artículo sobre el modelo en aichina.news: https://aichina.news/blog/openmed-pii-spanish-biomedbert-a-local-solution-for-de-identifying-afd688/
