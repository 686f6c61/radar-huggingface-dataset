# OpenMed/OpenMed-PII-Italian-SuperClinical-Large-434M-v1-mlx

## Resumen

OpenMed-PII-Italian-SuperClinical-Large-434M-v1-mlx es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto clínico en italiano. Desarrollado por OpenMed, se basa en la arquitectura DeBERTa-v2 y ha sido ajustado (fine-tuning) para identificar 54 tipos de datos sensibles, como nombres, direcciones, números de seguridad social, números de historia clínica y otros campos típicos de entornos sanitarios. Este repositorio concreto es un empaquetado en formato MLX del checkpoint original, diseñado para ejecutarse de forma nativa en Apple Silicon mediante la librería OpenMed.

La relevancia de este modelo radica en su aplicación directa a la anonimización de historias clínicas italianas, un requisito cada vez más crítico para cumplir con normativas de protección de datos como el GDPR y para habilitar la investigación médica secundaria. Al estar disponible en MLX, permite ejecutar inferencia local en Macs con aceleración por hardware, sin depender de servicios en la nube. El modelo tiene aproximadamente 434 millones de parámetros (según su denominación), aunque la longitud de contexto no se especifica en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (DebertaV2ForTokenClassification) |
| Parametros totales | 434M (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato MLX estándar) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa-v2, una variante de transformer que introduce mecanismos de atención disentangled y mejoras en el preentrenamiento con máscara. En este caso, la cabeza de clasificación es de tipo token classification, lo que permite etiquetar cada token de entrada con una categoría de PII. El checkpoint original fue ajustado específicamente para la detección de PII en texto clínico italiano, aunque no se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. El empaquetado MLX conserva la configuración original y referencia el tokenizer del modelo base, que no se incluye en este repositorio.

## Capacidades

- Detección de PII en texto clínico italiano: identifica y clasifica 54 tipos de información sensible, incluyendo nombres, direcciones, números de seguridad social, números de historia clínica, fechas, teléfonos, etc.
- Clasificación a nivel de token: asigna una etiqueta a cada token, lo que permite localizar con precisión los fragmentos de texto que contienen datos personales.
- Integración con OpenMed: se puede usar a través de la API `extract_pii` de OpenMed, que incluye opciones de fusión inteligente de entidades (`use_smart_merging=True`) para agrupar tokens adyacentes en entidades completas.
- Ejecución en Apple Silicon: gracias al formato MLX, aprovecha la aceleración por hardware en Macs con chips M1, M2 o posteriores.
- Soporte multilingüe limitado: está entrenado únicamente para italiano; no se contemplan otros idiomas.

## Casos de uso

- Anonimización de historias clínicas para investigación: el modelo puede procesar documentos clínicos italianos y marcar automáticamente todos los campos PII, permitiendo generar versiones anonimizadas que cumplan con el GDPR antes de compartirlas con equipos de investigación.
- Cumplimiento normativo en sistemas de salud: integrado en un pipeline de gestión documental, ayuda a hospitales y clínicas a detectar y redactar datos personales en informes, recetas y comunicaciones internas, reduciendo el riesgo de filtraciones.
- Preparación de datasets clínicos para entrenamiento de otros modelos: al etiquetar PII en corpus italianos, facilita la creación de conjuntos de datos limpios y anonimizados que pueden usarse para entrenar modelos de lenguaje médico sin exponer información sensible.
- Auditoría de registros médicos electrónicos: permite revisar grandes volúmenes de historias clínicas para verificar que no se hayan incluido datos personales no autorizados en exportaciones o intercambios entre instituciones.
- Redacción de informes médicos para publicación: los profesionales pueden usar el modelo para eliminar automáticamente identificadores antes de publicar casos clínicos en revistas o congresos.
- Desarrollo de asistentes de documentación clínica: integrado en herramientas de dictado o transcripción, puede marcar en tiempo real los datos PII que aparecen en notas dictadas, alertando al personal médico sobre posibles exposiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Diseñado para Apple Silicon: requiere un Mac con chip M1, M2, M3 o superior para aprovechar el backend MLX.
- Memoria: al ser un modelo de 434M, se estima que puede ejecutarse en Macs con al menos 8 GB de memoria unificada, aunque no se proporcionan cifras exactas de VRAM.
- Software: es necesario instalar la librería `openmed[mlx]` mediante pip.
- Despliegue: la inferencia se realiza localmente a través de la API de OpenMed; no se mencionan opciones como vLLM, llama.cpp u Ollama para este modelo.
- Latencia y throughput: no se han publicado datos específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existe una variante en inglés del mismo modelo (OpenMed-PII-SuperClinical-Large-434M-v1) y una versión ONNX para Android, pero no se ofrecen métricas comparativas entre ellas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para italiano; su uso en otros idiomas producirá resultados incorrectos.
- El repositorio MLX no incluye el tokenizer; depende de la referencia al tokenizer del modelo base en `config.json`, lo que puede requerir acceso a Hugging Face en tiempo de ejecución.
- El soporte Swift (OpenMedKit) no está disponible para esta arquitectura (deberta-v2) en la versión actual; solo se puede usar desde Python.
- El número de descargas es muy bajo (3 descargas), lo que sugiere una adopción limitada y poca validación comunitaria.
- No se han publicado evaluaciones de sesgos ni estudios de robustez; como cualquier modelo de PII, puede fallar en casos con formatos atípicos o variaciones dialectales.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que el uso previsto cumpla con las normativas de protección de datos aplicables.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Italian-SuperClinical-Large-434M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-Italian-SuperClinical-Large-434M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
