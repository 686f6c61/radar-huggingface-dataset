# OpenMed/OpenMed-PII-Italian-ClinicDischarge-Base-110M-v1-mlx

## Resumen

OpenMed-PII-Italian-ClinicDischarge-Base-110M-v1-mlx es un modelo de clasificación de tokens (token classification) basado en la arquitectura BERT, especializado en la detección de información personal identificable (PII) en textos clínicos en italiano. Ha sido desarrollado por OpenMed como un empaquetado en formato MLX del checkpoint original `OpenMed/OpenMed-PII-Italian-ClinicDischarge-Base-110M-v1`, pensado para ejecutarse de forma local en dispositivos Apple Silicon (Mac, iPhone, iPad) sin necesidad de conexión a la nube.

El modelo resuelve el problema de la anonimización y de-identificación de datos clínicos, un requisito crítico para el cumplimiento de normativas como el GDPR en Europa y la HIPAA en Estados Unidos. Su relevancia actual radica en la creciente demanda de soluciones de IA médica que preserven la privacidad del paciente, ejecutándose íntegramente en el hardware del usuario. Con aproximadamente 110 millones de parámetros, es un modelo ligero que puede integrarse en flujos de trabajo clínicos sin necesidad de infraestructura de servidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 110 millones (segun nombre del modelo, no confirmado en la documentacion) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato MLX, probablemente float16/float32) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, concretamente en la variante `BertForTokenClassification`, que añade una cabeza de clasificación por token sobre el encoder BERT. El checkpoint original fue fine-tuneado para la tarea de detección de PII en textos clínicos italianos, aunque no se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El empaquetado MLX conserva la misma arquitectura y pesos, pero adapta el formato para su ejecución eficiente en Apple Silicon mediante la librería MLX.

Una característica destacable es que el repositorio MLX no incluye los assets del tokenizador; en su lugar, se referencia el tokenizador del modelo base en `config.json`, lo que permite mantener compatibilidad hacia atrás con versiones anteriores de OpenMed y OpenMedKit.

## Capacidades

- Detección de entidades PII en texto clínico italiano, incluyendo nombres, fechas, direcciones, números de identificación y otros datos personales.
- Clasificación de tokens con etiquetas predefinidas (definidas en `id2label.json`).
- Integración con la API `extract_pii` de OpenMed, que permite extraer entidades con confianza asociada.
- Soporte de "smart merging" para combinar tokens adyacentes en entidades completas.
- Ejecución local en Apple Silicon mediante MLX (Python y Swift).
- Compatibilidad con OpenMedKit para aplicaciones iOS y macOS nativas.
- Funciona como backend de inferencia para flujos de de-identificación en tiempo real.

## Casos de uso

- Anonimización de informes de alta hospitalaria: el modelo puede procesar documentos clínicos italianos y eliminar o enmascarar automáticamente los datos personales antes de su uso en investigación o publicación.
- Cumplimiento normativo en historiales clínicos electrónicos: integrado en sistemas de gestión hospitalaria, permite garantizar que los datos compartidos con terceros cumplen el RGPD.
- Preparación de datasets para investigación médica: los investigadores pueden limpiar grandes volúmenes de notas clínicas italianas eliminando PII antes de entrenar otros modelos.
- Aplicaciones móviles de salud: gracias al formato MLX y al soporte Swift, el modelo puede ejecutarse directamente en un iPhone o iPad, permitiendo a los pacientes revisar y anonimizar sus propios datos sin enviarlos a servidores externos.
- Auditoría de privacidad en documentos clínicos: el modelo puede utilizarse como herramienta de verificación para detectar fugas de PII en documentos que se van a publicar o compartir.
- Integración en pipelines de NLP clínico: combinado con otros modelos de OpenMed, puede servir como paso previo a tareas de extracción de información médica, asegurando que los datos personales no contaminen los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. La documentación de OpenMed menciona que la plataforma alcanza "state of the art en 10 de 12 benchmarks NER biomédicos", pero no se desglosan resultados por modelo ni se proporcionan métricas concretas (F1, precisión, recall) para este checkpoint concreto.

## Requisitos de hardware

- Al ser un modelo de 110M de parámetros, su huella de memoria es reducida. Se estima que puede ejecutarse en cualquier Mac con chip Apple Silicon (M1 o superior) con al menos 8 GB de RAM unificada.
- Para inferencia en Python, se requiere instalar `openmed[mlx]` y tener macOS con Apple Silicon.
- Para Swift, se necesita OpenMedKit y un dispositivo con Apple Silicon (macOS) o un iPhone/iPad físico (el simulador de iOS no es compatible).
- No se requieren GPUs dedicadas; la inferencia se realiza mediante la CPU/GPU integrada del chip Apple.
- Opciones de despliegue: OpenMed (Python), OpenMedKit (Swift), o uso directo del repositorio MLX con la librería MLX de Apple.
- La latencia y el throughput no están documentados, pero dado el tamaño del modelo, se espera que sea adecuado para procesamiento en tiempo real en dispositivos modernos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos de detección de PII en italiano. Existen alternativas genéricas como `dbmdz/bert-base-italian-xxl-cased` o modelos multilingües como `xlm-roberta-base`, pero no se han encontrado datos de rendimiento comparables para esta tarea específica. La documentación de OpenMed indica que su familia de modelos supera a otros en varios benchmarks NER biomédicos, pero no se detallan los competidores concretos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para italiano; no es aplicable a otros idiomas sin reentrenamiento.
- No se incluye el tokenizador en el repositorio MLX; se depende de la referencia al modelo base, lo que puede causar problemas si el modelo base deja de estar disponible.
- La precisión en la detección de PII puede verse afectada por variaciones dialectales, jerga clínica o formatos de datos poco comunes.
- No se han publicado métricas de rendimiento específicas, por lo que se desconoce su eficacia real en producción.
- Aunque la licencia es Apache-2.0, el uso en entornos clínicos reales debe validarse con datos propios y bajo supervisión de expertos.
- El modelo no realiza anonimización semántica; solo identifica y clasifica tokens, por lo que la decisión de enmascarar o eliminar debe implementarse en la aplicación.
- Al ser un modelo de 110M, su capacidad para capturar contextos largos es limitada (ventana de contexto típica de BERT, 512 tokens), lo que puede ser insuficiente para documentos clínicos extensos.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Italian-ClinicDischarge-Base-110M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-Italian-ClinicDischarge-Base-110M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Sitio web de OpenMed: https://openmed.life/
