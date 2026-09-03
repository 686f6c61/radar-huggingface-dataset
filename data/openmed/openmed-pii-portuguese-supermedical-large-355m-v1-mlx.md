# OpenMed/OpenMed-PII-Portuguese-SuperMedical-Large-355M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-SuperMedical-Large-355M-v1-mlx es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en textos clínicos y médicos en portugués. Desarrollado por OpenMed, forma parte de una familia de modelos de IA sanitaria local-first que funcionan íntegramente en el dispositivo, sin necesidad de enviar datos de pacientes a la nube. Este repositorio concreto contiene un empaquetado en formato MLX, optimizado para inferencia en Apple Silicon, del checkpoint original `OpenMed/OpenMed-PII-Portuguese-SuperMedical-Large-355M-v1`.

El modelo se basa en la arquitectura RoBERTa (encoder transformer) con 355 millones de parámetros, y está diseñado para tareas de reconocimiento de entidades nombradas (NER) aplicadas a la desidentificación de historiales clínicos. Su relevancia actual radica en la creciente necesidad de cumplir normativas de privacidad como la LGPD brasileña o el HIPAA estadounidense en entornos sanitarios, donde la anonimización automática de datos personales es un paso crítico. Al estar empaquetado en MLX, permite ejecución local eficiente en Macs con chip Apple Silicon, lo que facilita su integración en flujos de trabajo clínicos sin dependencia de infraestructura cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer, `RobertaForTokenClassification`) |
| Parametros totales | 355 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (típico de RoBERTa: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (pesos MLX en safetensors; no se especifican cuantizaciones adicionales) |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en RoBERTa, adaptado para clasificación de tokens mediante una cabeza de clasificación por token. El checkpoint original fue fine-tuneado a partir de un modelo base de 355M parámetros para la tarea específica de detección de PII en texto médico en portugués. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO; la información disponible solo indica que es un fine-tuning supervisado para token classification.

La innovación principal de este repositorio no está en la arquitectura del modelo, sino en su empaquetado MLX, que permite ejecución nativa en Apple Silicon mediante la librería OpenMed. El artefacto incluye `config.json`, `id2label.json`, pesos MLX y los assets del tokenizador, siguiendo un layout compatible con versiones anteriores de MLX. Esto facilita su uso tanto en Python (con `openmed[mlx]`) como en aplicaciones Swift a través de OpenMedKit, aunque el soporte Swift para esta familia aún está en la matriz de compatibilidad.

## Capacidades

- Detección de entidades PII en texto clínico en portugués: nombres, fechas, direcciones, números de documento, datos de contacto, etc.
- Clasificación por token (token-level classification) con etiquetas definidas en `id2label.json`.
- Funciona como componente de un pipeline de desidentificación de historiales clínicos.
- Integración con la librería OpenMed, que ofrece funciones de alto nivel como `extract_pii` con fusión inteligente de entidades (`use_smart_merging=True`).
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de conexión a internet ni envío de datos a servidores externos.
- Compatibilidad con backend PyTorch/Hugging Face en otros sistemas (fallback automático en OpenMed).
- Soporte multilingüe limitado: el modelo está entrenado específicamente para portugués, aunque la familia OpenMed cubre 21 idiomas en total.

## Casos de uso

- Anonimización de historiales clínicos para investigación: el modelo puede procesar notas médicas en portugués y marcar automáticamente todos los campos PII, permitiendo generar versiones anonimizadas que cumplan con la LGPD antes de compartir datos con equipos de investigación.
- Cumplimiento normativo en hospitales y clínicas: integrado en el flujo de gestión de expedientes, detecta y enmascara datos personales en tiempo real antes de almacenar o transmitir información, reduciendo el riesgo de brechas de privacidad.
- Preparación de datasets para entrenamiento de otros modelos: al desidentificar grandes volúmenes de texto clínico, permite crear corpus de entrenamiento seguros para desarrollar nuevos modelos de NLP médica sin exponer información de pacientes.
- Auditoría de privacidad en sistemas de salud digital: el modelo puede analizar registros existentes y señalar posibles fugas de PII en documentos que no fueron correctamente anonimizados.
- Aplicaciones de salud móvil en portugués: al ejecutarse en Apple Silicon, puede integrarse en apps de seguimiento de pacientes que procesan notas locales sin enviar datos a la nube, cumpliendo con requisitos de privacidad por diseño.
- Soporte a la codificación clínica y facturación: al identificar entidades como nombres y números de identificación, facilita la extracción estructurada de datos para sistemas de facturación y codificación médica, siempre que se combine con otros modelos de extracción de entidades clínicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de NER (como F1, precisión o recall) para este modelo en las fuentes consultadas.

## Requisitos de hardware

- Al ser un modelo de 355M parámetros, la inferencia en MLX requiere un Mac con chip Apple Silicon (M1 o superior). El tamaño del repositorio es de 2.8 GB, lo que sugiere pesos en fp16 o fp32.
- Estimación de memoria: con pesos en fp16, el modelo ocupa aproximadamente 710 MB en VRAM; en fp32, alrededor de 1.4 GB. Esto cabe en cualquier Mac con Apple Silicon, incluso en los modelos base con 8 GB de RAM unificada.
- GPU recomendadas: cualquier GPU integrada de Apple Silicon (M1, M2, M3, M4) es suficiente. No se requieren GPUs dedicadas como A100 o H100.
- Opciones de despliegue: Python con `openmed[mlx]` en Apple Silicon; también puede ejecutarse con el backend PyTorch/Hugging Face en CPU o GPU convencional. Existe una variante ONNX para Android/WebAssembly/WebGPU en el ecosistema OpenMed.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de este tamaño, la inferencia en Apple Silicon suele ser de decenas de milisegundos por frase corta, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de detección de PII en portugués. El ecosistema OpenMed incluye otros modelos de la misma familia (por ejemplo, `OpenMed-PII-Portuguese-ClinicalBGE-Large-335M-v1`), pero no hay datos públicos de rendimiento comparativo. Se recomienda consultar el repositorio original y la colección de modelos médicos de OpenMed para más contexto.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para portugués; su uso en otros idiomas producirá resultados incorrectos o nulos.
- No se han publicado métricas de rendimiento (F1, precisión, recall) ni estudios de sesgo, por lo que su eficacia en entornos clínicos reales no está validada externamente.
- Al ser un modelo de 355M parámetros, puede presentar alucinaciones o errores de clasificación en textos con jerga médica poco común, acentos regionales o formatos de datos atípicos.
- La longitud de contexto no está confirmada; si sigue el estándar de RoBERTa, será de 512 tokens, lo que limita el procesamiento de documentos clínicos largos en una sola pasada.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable de verificar que el modelo cumple con las normativas de privacidad específicas de su jurisdicción (LGPD, HIPAA, GDPR) antes de usarlo en producción.
- El empaquetado MLX está optimizado para Apple Silicon; en otros sistemas se requiere el backend PyTorch, que puede tener un rendimiento inferior.
- No se garantiza la ausencia de sesgos en la detección de PII; nombres o formatos de ciertas comunidades pueden ser clasificados incorrectamente.

## Enlaces

- Repositorio MLX en HuggingFace: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SuperMedical-Large-355M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SuperMedical-Large-355M-v1
- Variante ONNX para Android/Web: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SuperMedical-Large-355M-v1-onnx-android
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Colección de modelos médicos MLX: https://huggingface.co/collections/OpenMed/medical-mlx-models
