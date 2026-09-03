# OpenMed/OpenMed-PII-Italian-ClinicalE5-Base-109M-v1-mlx

## Resumen

OpenMed-PII-Italian-ClinicalE5-Base-109M-v1-mlx es un empaquetado en formato MLX del modelo homónimo de OpenMed, diseñado para la detección y desidentificación de información personal identificable (PII) en textos clínicos en italiano. El modelo original es un transformer de tipo BERT (BertForTokenClassification) fine-tuned específicamente para la clasificación de tokens en el ámbito médico, y esta variante MLX permite su ejecución nativa en dispositivos Apple Silicon (Mac, iPhone y iPad) mediante la librería OpenMed.

El modelo resuelve el problema de la privacidad de datos sanitarios: permite eliminar entidades como nombres, direcciones, números de seguridad social u otros datos personales de historias clínicas sin enviar la información a la nube. Su relevancia actual radica en el creciente interés por soluciones de IA local-first en el sector salud, donde el cumplimiento normativo (HIPAA, GDPR) exige minimizar la transferencia de datos sensibles. Con 109 millones de parámetros (según nomenclatura) y una arquitectura BERT, es un modelo ligero y adecuado para entornos con recursos limitados.

Este repositorio concreto no incluye los assets del tokenizador, sino que referencia el del modelo base en su configuración, manteniendo compatibilidad con el ecosistema OpenMed tanto en Python como en Swift.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 109M (segun nomenclatura del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, concretamente en la variante `BertForTokenClassification`, que asigna una etiqueta a cada token de entrada para identificar entidades PII. Es un fine-tuning del checkpoint `OpenMed/OpenMed-PII-Italian-ClinicalE5-Base-109M-v1`, que a su vez parte de un modelo base de tipo E5 (embeddings) adaptado al dominio clínico. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni si se emplearon técnicas como RLHF o DPO. La innovación principal de este repositorio no está en la arquitectura, sino en su empaquetado MLX, que permite inferencia eficiente en hardware Apple Silicon sin depender de PyTorch ni de servicios en la nube.

## Capacidades

- Detección de entidades PII en texto clínico italiano mediante clasificación de tokens (NER).
- Extracción de entidades con nivel de confianza asociado a cada predicción.
- Desidentificación de historias clínicas: permite eliminar o enmascarar datos personales.
- Integración con el ecosistema OpenMed para flujos de trabajo de privacidad sanitaria.
- Ejecución local en dispositivos Apple Silicon (Mac, iPhone, iPad) gracias al formato MLX.
- Soporte de "smart merging" para combinar fragmentos de entidades adyacentes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad.

## Casos de uso

- Desidentificación de historias clínicas electrónicas: el modelo procesa notas clínicas en italiano y marca automáticamente nombres, fechas, lugares y otros datos personales, permitiendo su anonimización antes de compartir los registros con fines de investigación o docencia.
- Cumplimiento normativo en entornos sanitarios: integrado en sistemas de gestión de pacientes, ayuda a garantizar que los datos exportados cumplan con regulaciones como GDPR o HIPAA, al eliminar PII de forma local y sin conexión.
- Preparación de datasets para entrenamiento de modelos médicos: al limpiar grandes volúmenes de texto clínico, facilita la creación de corpus anonimizados para fine-tuning de otros modelos sin riesgo de fuga de información.
- Auditoría de privacidad en aplicaciones de salud digital: puede utilizarse como herramienta de verificación para detectar si un texto contiene PII antes de su publicación o transmisión.
- Investigación clínica colaborativa: permite compartir datos de pacientes entre instituciones tras la desidentificación, manteniendo la utilidad clínica del texto.
- Aplicaciones móviles de salud: gracias a su formato MLX y soporte Swift, puede ejecutarse directamente en iPhone o iPad para procesar notas del paciente en el dispositivo, sin enviar datos a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación de OpenMed menciona que la plataforma alcanza estado del arte en 10 de 12 benchmarks biomédicos de NER, pero no se proporcionan métricas específicas para este modelo concreto.

## Requisitos de hardware

- Requiere un dispositivo Apple Silicon (M1 o superior) para ejecutar el backend MLX en Python o Swift.
- Compatible con iPhone y iPad físicos (no simulador) mediante OpenMedKit y Swift MLX.
- Al ser un modelo BERT de 109M, su huella de memoria es reducida; se estima que cabe en dispositivos con 8 GB de RAM unificada, aunque no se especifica VRAM exacta.
- Para Python, se instala con `pip install "openmed[mlx]"` y OpenMed selecciona automáticamente el backend MLX en Apple Silicon.
- En otros sistemas (no Apple), OpenMed recurre al backend de Hugging Face / PyTorch, pero este repositorio está pensado específicamente para MLX.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la misma categoría (NER clínico en italiano con formato MLX). La plataforma OpenMed ofrece otros modelos de PII para distintos idiomas, pero no se detallan alternativas concretas en la documentación consultada.

## Limitaciones y advertencias

- El modelo está especializado en italiano; su rendimiento en otros idiomas no está garantizado.
- El repositorio MLX no incluye los archivos del tokenizador; depende de la referencia al modelo base en `config.json`, lo que puede requerir conexión a Hugging Face para descargar los assets necesarios.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en dominios clínicos, puede reflejar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación en la identificación de entidades: como todo modelo de NER, puede cometer errores de etiquetado, especialmente en textos con formatos inusuales o jerga médica compleja.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda validar el rendimiento en el dominio específico antes de su despliegue en producción.
- No se especifican limitaciones de contexto; al ser BERT, es probable que la ventana de tokens sea de 512, aunque no se confirma.

## Enlaces

- Repositorio HuggingFace (MLX): [https://huggingface.co/OpenMed/OpenMed-PII-Italian-ClinicalE5-Base-109M-v1-mlx](https://huggingface.co/OpenMed/OpenMed-PII-Italian-ClinicalE5-Base-109M-v1-mlx)
- Modelo base original: [https://huggingface.co/OpenMed/OpenMed-PII-Italian-ClinicalE5-Base-109M-v1](https://huggingface.co/OpenMed/OpenMed-PII-Italian-ClinicalE5-Base-109M-v1)
- Repositorio GitHub de OpenMed: [https://github.com/maziyarpanahi/openmed](https://github.com/maziyarpanahi/openmed)
- Documentación del backend MLX: [https://openmed.life/docs/mlx-backend/](https://openmed.life/docs/mlx-backend/)
- Documentación de OpenMedKit (Swift): [https://openmed.life/docs/swift-openmedkit/](https://openmed.life/docs/swift-openmedkit/)
