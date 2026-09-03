# OpenMed/OpenMed-PII-Portuguese-mSuperClinical-Large-279M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-mSuperClinical-Large-279M-v1-mlx es un empaquetado en formato MLX del modelo de detección de información de identificación personal (PII) en texto clínico portugués desarrollado por OpenMed. El modelo original, OpenMed-PII-Portuguese-mSuperClinical-Large-279M-v1, es un ajuste fino de la arquitectura DeBERTa-v2 para clasificación de tokens, especializado en la desidentificación de historiales clínicos y documentos médicos en portugués. Este artefacto MLX está pensado para ejecutarse de forma local en Apple Silicon, sin necesidad de enviar datos de pacientes a la nube, lo que lo hace relevante para entornos sanitarios con requisitos estrictos de privacidad y cumplimiento normativo.

El modelo tiene 279 millones de parámetros y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones. Su pipeline es token-classification, es decir, etiqueta cada token del texto con la categoría de PII correspondiente. La versión MLX aquí documentada es un snapshot preconvertido que se puede usar directamente con la librería OpenMed en Python sobre Apple Silicon, o descargarse para flujos de trabajo offline. No se proporcionan detalles sobre la longitud de contexto ni sobre el dataset de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DebertaV2ForTokenClassification (deberta-v2) |
| Parametros totales | 279 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors MLX, sin cuantizaciones documentadas) |
| Idiomas soportados | portugues (pt) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa-v2, concretamente en la variante para clasificación de tokens (DebertaV2ForTokenClassification). DeBERTa (Decoding-enhanced BERT with disentangled attention) introduce mecanismos de atención desenredada que separan las representaciones de contenido y posición, lo que mejora el rendimiento en tareas de comprensión del lenguaje frente a BERT clásico. El checkpoint original fue ajustado (fine-tuning) sobre un modelo base denominado OpenMed-PII-Portuguese-mSuperClinical-Large-279M-v1, especializado en la detección de entidades PII en dominios clínicos y médicos en portugués.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. Al tratarse de un modelo de clasificación de secuencias, el entrenamiento se realiza mediante aprendizaje supervisado sobre datos etiquetados con categorías de PII. El empaquetado MLX no modifica la arquitectura ni los pesos; únicamente convierte los pesos al formato MLX para su ejecución eficiente en Apple Silicon.

## Capacidades

- Detección de entidades PII en texto clínico en portugués: nombres de pacientes, números de identificación, fechas, direcciones, teléfonos, correos electrónicos y otros datos personales.
- Clasificación de tokens a nivel de secuencia, devolviendo etiquetas por token con puntuaciones de confianza.
- Integración con la librería OpenMed para extracción de PII mediante la función `extract_pii`, con opción de fusión inteligente de entidades (`use_smart_merging`).
- Ejecución local en Apple Silicon mediante el backend MLX, sin necesidad de conexión a internet ni envío de datos a servidores externos.
- Compatibilidad con flujos de trabajo offline: el artefacto puede descargarse y usarse desde un directorio local.
- No es un modelo generativo: no genera texto, no soporta tool calling, ni razonamiento multi-paso, ni capacidades multimodales.

## Casos de uso

- Desidentificación de historiales clínicos electrónicos: el modelo puede procesar notas médicas en portugués y eliminar o enmascarar automáticamente los datos personales antes de que los documentos se utilicen para investigación o se compartan con terceros, cumpliendo así con normativas de privacidad como la LGPD brasileña.
- Preparación de datasets clínicos para entrenamiento de modelos de IA: antes de usar datos médicos reales para entrenar otros modelos, se aplica este modelo para anonimizar los textos, reduciendo el riesgo de fuga de información personal.
- Auditoría de cumplimiento HIPAA en organizaciones sanitarias lusófonas: el modelo puede revisar documentos clínicos y señalar posibles PII no detectadas, ayudando a los equipos de cumplimiento a verificar que los datos están correctamente desidentificados.
- Pipeline de investigación clínica multicéntrica: al ejecutarse localmente en Apple Silicon, permite a hospitales y centros de investigación procesar sus propios datos sin enviarlos a la nube, facilitando la colaboración entre instituciones con requisitos de privacidad estrictos.
- Aplicaciones móviles de salud en portugués: gracias a la versión ONNX para Android y al soporte MLX en Apple, el modelo puede integrarse en apps de salud que necesiten anonimizar datos del paciente directamente en el dispositivo.
- Archivado y gestión documental en hospitales: integración en sistemas de gestión de expedientes para marcar automáticamente los documentos que contienen PII y aplicar políticas de retención o acceso restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la informacion disponible. El sitio web de OpenMed menciona que sus modelos alcanzan el estado del arte en 10 de 12 benchmarks de NER biomédico, pero no se desglosan resultados por modelo ni se proporcionan cifras concretas para esta variante portuguesa. No se incluyen datos de MMLU, HumanEval u otros benchmarks generales, ya que no aplican a un modelo de clasificación de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: con 279 millones de parámetros en precisión fp32, el modelo ocupa aproximadamente 1,1 GB en memoria; en fp16 o bf16, alrededor de 0,56 GB. No se documentan cuantizaciones adicionales, por lo que estas cifras son estimaciones basadas en el tamaño del modelo.
- GPU recomendadas: el artefacto MLX está diseñado para Apple Silicon (M1, M2, M3 y posteriores). En otras plataformas, se puede usar el checkpoint original con backend PyTorch en GPUs NVIDIA convencionales (por ejemplo, RTX 3060 o superiores), aunque no se proporcionan requisitos oficiales.
- Cabe en GPUs de consumo: sí, cualquier Mac con Apple Silicon puede ejecutarlo, y en GPUs NVIDIA de 4 GB o más también es viable en fp16.
- Opciones de despliegue: OpenMed Python con backend MLX en Apple Silicon; backend PyTorch/Hugging Face en otras plataformas; versión ONNX para Android y WebAssembly/WebGPU (repo separado).
- Latencia y throughput: no se proporcionan datos oficiales. Para un modelo de 279M en Apple Silicon, se espera una latencia de decenas de milisegundos por documento corto, pero no hay cifras verificadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con modelos alternativos de detección de PII en portugués clínico. No se han identificado modelos comparables con especificaciones públicas en la información disponible. Se recomienda evaluar el modelo frente a alternativas genéricas de NER en portugués (por ejemplo, modelos XLM-RoBERTa ajustados para NER) en el propio dataset de uso, ya que no hay benchmarks publicados.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en portugués; no soporta otros idiomas, por lo que no es adecuado para textos clínicos en español, inglés u otras lenguas.
- Al ser un modelo de clasificación de tokens, no genera explicaciones ni razonamiento; solo devuelve etiquetas y confianzas, lo que limita su uso en tareas que requieran comprensión semántica profunda.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos en la cobertura de tipos de PII, variantes dialectales del portugués (Brasil vs. Portugal) o dominios clínicos específicos.
- La longitud de contexto no está documentada; si sigue la configuración estándar de DeBERTa-v2, podría estar limitada a 512 tokens, lo que obligaría a dividir documentos largos en fragmentos.
- El soporte Swift/OpenMedKit no está disponible para esta arquitectura (deberta-v2) en el momento de la publicación; solo se soporta Python MLX, lo que limita la integración en apps nativas de Apple.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo debe validarse en el dominio clínico real antes de su despliegue en producción, dado que errores de desidentificación pueden tener consecuencias legales y de privacidad graves.

## Enlaces

- Repositorio HuggingFace del artefacto MLX: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-mSuperClinical-Large-279M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-mSuperClinical-Large-279M-v1
- Versión ONNX para Android/Web: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-mSuperClinical-Large-279M-v1-onnx-android
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Sitio web de OpenMed: https://openmed.life/
