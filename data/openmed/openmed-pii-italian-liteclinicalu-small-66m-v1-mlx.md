# OpenMed/OpenMed-PII-Italian-LiteClinicalU-Small-66M-v1-mlx

## Resumen

OpenMed-PII-Italian-LiteClinicalU-Small-66M-v1-mlx es un modelo de clasificación de tokens (token classification) diseñado para la detección de información personal identificable (PII) en texto clínico en italiano. Desarrollado por el proyecto OpenMed, se basa en la arquitectura DistilBERT (DistilBertForTokenClassification) y ha sido ajustado para identificar 54 tipos de entidades sensibles, como nombres, direcciones, números de seguridad social, números de registro médico, entre otros. Este repositorio concreto contiene un empaquetado en formato MLX, optimizado para inferencia en dispositivos Apple Silicon (Mac, iPhone, iPad), lo que permite ejecutar la de-identificación de datos clínicos de forma totalmente local, sin enviar información a la nube.

El modelo es relevante en el contexto actual de cumplimiento normativo (GDPR, HIPAA) y de privacidad en el sector sanitario, donde la anonimización de historias clínicas es un requisito habitual. Al ser un modelo pequeño (66 millones de parámetros) y con licencia Apache-2.0, resulta accesible para integraciones en entornos con recursos limitados, especialmente en dispositivos móviles y equipos de escritorio con Apple Silicon. El proyecto OpenMed ofrece además una biblioteca Python y un kit Swift (OpenMedKit) que facilitan su uso directo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBertForTokenClassification (DistilBERT) |
| Parametros totales | 66 millones (según nomenclatura del modelo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (DistilBERT suele soportar 512 tokens, pero no se especifica en la documentación) |
| Tipos de cuantizacion | No disponible (el formato MLX puede admitir cuantización, pero no se documenta en la ficha) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) para el repo MLX; el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT con una arquitectura transformer encoder. La capa de salida es una cabeza de clasificación de tokens que asigna una etiqueta a cada token de entrada, permitiendo la detección de entidades PII. El modelo original (OpenMed-PII-Italian-LiteClinicalU-Small-66M-v1) fue ajustado (fine-tuning) a partir de un checkpoint de DistilBERT preentrenado, aunque no se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de ajuste (si se empleó RLHF, DPO u otra técnica). La documentación indica que el modelo identifica 54 tipos de información sensible, lo que sugiere un etiquetado granular de entidades.

El empaquetado MLX conserva la misma arquitectura y pesos, pero adapta el formato para su ejecución eficiente en Apple Silicon mediante la librería MLX. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Detección de PII en texto clínico italiano: identifica y clasifica 54 tipos de entidades sensibles, incluyendo nombres, direcciones, números de seguridad social, números de registro médico, fechas, etc.
- Clasificación de tokens: asigna una etiqueta a cada token, permitiendo la extracción de entidades con sus límites exactos.
- Integración con OpenMed: la función `extract_pii` de la librería OpenMed permite obtener entidades con confianza y soporte de fusión inteligente (smart merging) para entidades multi-token.
- Compatibilidad con Apple Silicon: el formato MLX permite ejecución nativa en Mac, iPhone y iPad, con backend Python o Swift (OpenMedKit).
- Fallback a PyTorch/Hugging Face en otros sistemas: si no se dispone de Apple Silicon, el modelo puede ejecutarse con el backend estándar de Hugging Face.
- Soporte multilingüe limitado: aunque el modelo está entrenado específicamente para italiano, el ecosistema OpenMed ofrece modelos para otros idiomas (33 idiomas con PII según su web).

## Casos de uso

- Anonimización de historias clínicas en italiano: el modelo puede procesar notas médicas y eliminar o enmascarar automáticamente los datos personales antes de compartirlos con terceros o para investigación.
- Cumplimiento de normativa de privacidad (GDPR, HIPAA): integrado en sistemas de gestión de datos sanitarios, permite garantizar que la información sensible no se expone en entornos no autorizados.
- De-identificación de datos para ensayos clínicos: al extraer y eliminar PII de registros de pacientes, facilita la creación de conjuntos de datos anonimizados para estudios.
- Procesamiento local en dispositivos móviles: gracias al formato MLX, puede ejecutarse en un iPhone o iPad, permitiendo a profesionales sanitarios anonimizar notas sobre la marcha sin conexión a internet.
- Pipeline de NLP clínico: como componente de un sistema más amplio de extracción de información, el modelo etiqueta entidades PII que luego pueden ser filtradas o reemplazadas.
- Auditoría de privacidad: revisión de documentos clínicos para detectar fugas de información personal antes de su publicación o intercambio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de clasificación de tokens y no de generación de texto. Tampoco se ofrecen comparativas con otros modelos de detección de PII en italiano.

## Requisitos de hardware

- El modelo tiene 66 millones de parámetros, lo que en precisión FP16 ocupa aproximadamente 132 MB de memoria, y en cuantización de 4 bits unos 33 MB. Sin embargo, no se especifican requisitos exactos de VRAM en la documentación.
- Está optimizado para Apple Silicon (M1, M2, M3 y posteriores) mediante el backend MLX. Se puede ejecutar en Mac, iPhone y iPad físicos (no en simulador de iOS).
- En sistemas sin Apple Silicon, OpenMed utiliza el backend de Hugging Face / PyTorch, por lo que puede ejecutarse en GPUs convencionales (NVIDIA, AMD) o CPU, aunque con menor rendimiento.
- El tamaño del repositorio es de 0.3 GB, lo que incluye los pesos en formato MLX.
- Opciones de despliegue: librería Python `openmed[mlx]`, OpenMedKit para Swift, o descarga directa del repositorio y uso con la API de OpenMed.
- No se proporcionan datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base (sin el sufijo -mlx) es idéntico en arquitectura y pesos, por lo que la comparativa se limita al formato de empaquetado. No se han encontrado referencias a otros modelos de detección de PII en italiano con los que contrastar.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para italiano; no es adecuado para otros idiomas sin reentrenamiento.
- Al estar basado en DistilBERT, la longitud de contexto está limitada (típicamente 512 tokens), lo que puede ser insuficiente para documentos clínicos muy extensos. No se especifica si se ha ampliado el contexto.
- No se documentan los datos de entrenamiento, por lo que no se pueden evaluar posibles sesgos en poblaciones o terminología clínica específica.
- Como modelo de clasificación de tokens, puede cometer errores de etiquetado (falsos positivos o negativos), lo que en entornos clínicos requiere supervisión humana.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar el cumplimiento de normativas locales de protección de datos al desplegar el modelo en producción.
- El formato MLX está pensado para Apple Silicon; en otros hardware el rendimiento puede degradarse y no se garantiza la misma eficiencia.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Italian-LiteClinicalU-Small-66M-v1-mlx
- Modelo base (sin MLX): https://huggingface.co/OpenMed/OpenMed-PII-Italian-LiteClinicalU-Small-66M-v1
- OpenMed GitHub: https://github.com/maziyarpanahi/openmed
- Sitio web de OpenMed: https://openmed.life/
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
