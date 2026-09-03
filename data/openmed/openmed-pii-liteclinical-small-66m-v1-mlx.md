# OpenMed/OpenMed-PII-LiteClinical-Small-66M-v1-mlx

## Resumen

OpenMed-PII-LiteClinical-Small-66M-v1-mlx es un modelo de clasificación de tokens (token-classification) diseñado para la detección y desidentificación de información personal sensible (PII) en textos clínicos en inglés. Desarrollado por OpenMed, se distribuye como un empaquetado en formato MLX del checkpoint base OpenMed/OpenMed-PII-LiteClinical-Small-66M-v1, optimizado para inferencia en dispositivos Apple Silicon (macOS, iPhone y iPad) mediante la librería OpenMed y OpenMedKit.

El modelo se basa en la arquitectura DistilBERT (DistilBertForTokenClassification) con aproximadamente 66 millones de parámetros, lo que lo convierte en una opción ligera y adecuada para entornos con recursos limitados o para despliegue en el borde (edge). Su propósito principal es extraer entidades PII de notas clínicas, como nombres, fechas, números de seguro médico, etc., facilitando el cumplimiento de normativas como HIPAA sin necesidad de enviar datos a la nube.

La relevancia actual de este modelo radica en la creciente demanda de soluciones de IA local-first en el sector sanitario, donde la privacidad del paciente es crítica. Al ser Apache-2.0 y estar disponible en MLX, permite a desarrolladores e investigadores integrar capacidades de anonimización directamente en aplicaciones móviles o de escritorio de Apple, manteniendo los datos bajo control del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (DistilBertForTokenClassification) |
| Parametros totales | 66 millones (aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de DistilBERT: 512, no confirmado) |
| Tipos de cuantizacion | no disponible (pesos MLX, posiblemente FP16/BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DistilBERT, una versión destilada de BERT que conserva la mayor parte de su capacidad de representación del lenguaje con un número reducido de parámetros. En este caso, se utiliza la variante para clasificación de tokens, lo que permite etiquetar cada token de entrada con una categoría de entidad (por ejemplo, nombre, fecha, ubicación, etc.). No se dispone de información detallada sobre el proceso de entrenamiento específico de este checkpoint, como el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de ajuste fino con datos clínicos. El modelo base (OpenMed-PII-LiteClinical-Small-66M-v1) es el que contiene los pesos originales, y este repositorio MLX es una conversión para compatibilidad con el ecosistema OpenMed.

## Capacidades

- Detección de entidades PII en texto clínico en inglés: nombres de pacientes, fechas, números de teléfono, direcciones, identificadores médicos, etc.
- Desidentificación de historias clínicas: permite eliminar o enmascarar información sensible para cumplir con regulaciones como HIPAA.
- Integración con la librería OpenMed: ofrece una API sencilla (`extract_pii`) con opción de "smart merging" para agrupar entidades fragmentadas.
- Ejecución en Apple Silicon: soporta inferencia en macOS, iPhone y iPad mediante MLX, tanto en Python como en Swift (OpenMedKit).
- Compatibilidad con el backend de Hugging Face/PyTorch en otros sistemas, aunque el formato MLX está pensado para Apple.
- No incluye tokenizer propio: utiliza el tokenizer del modelo base referenciado en `config.json`.

## Casos de uso

- Anonimización de historias clínicas electrónicas: hospitales y clínicas pueden procesar notas médicas localmente para eliminar PII antes de compartirlas con investigadores o terceros, garantizando la privacidad del paciente.
- Cumplimiento normativo en ensayos clínicos: al desidentificar datos de pacientes en documentos clínicos, se facilita la preparación de conjuntos de datos para estudios sin violar regulaciones de protección de datos.
- Aplicaciones móviles de salud: desarrolladores pueden integrar el modelo en apps de iOS para que los usuarios gestionen sus propios datos clínicos sin enviarlos a servidores externos.
- Investigación biomédica: los equipos de investigación pueden procesar grandes volúmenes de notas clínicas desidentificadas para entrenar otros modelos o realizar análisis retrospectivos.
- Sistemas de gestión de documentos sanitarios: automatizar la detección de PII en documentos escaneados o digitalizados antes de su almacenamiento o archivado.
- Herramientas de auditoría de privacidad: verificar que los textos clínicos no contengan información sensible antes de su publicación o intercambio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ni de evaluaciones específicas de NER clínico para este modelo. Se recomienda consultar el modelo base o la documentación de OpenMed para posibles evaluaciones adicionales.

## Requisitos de hardware

- Al ser un modelo de 66 millones de parámetros, el tamaño del repositorio es de aproximadamente 0,3 GB, lo que sugiere que los pesos en MLX ocupan menos de 300 MB.
- VRAM estimada: no disponible oficialmente, pero un modelo de este tamaño en FP16 requiere menos de 1 GB de memoria, por lo que es ejecutable en cualquier GPU moderna, incluidas las integradas de Apple Silicon.
- GPU recomendadas: cualquier Mac con chip M1 o superior, así como iPhone/iPad con chip A14 o posterior (para Swift MLX).
- En GPU de escritorio (NVIDIA, AMD) se puede ejecutar mediante el backend de Hugging Face/PyTorch, aunque el formato MLX está optimizado para Apple.
- Opciones de despliegue: librería OpenMed (Python y Swift), OpenMedKit para Swift, y posiblemente vLLM u otros frameworks si se convierte a formatos estándar, aunque no está documentado.
- Latencia y throughput: no disponible, pero por su tamaño se espera una inferencia muy rápida, del orden de milisegundos por documento corto en hardware Apple Silicon.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos de desidentificación clínica. Sin embargo, se puede contextualizar:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| OpenMed-PII-LiteClinical-Small-66M-v1-mlx | DistilBERT | 66M | no disponible | Apache-2.0 | MLX |
| BioBERT (ej. dmis-lab/biobert-base-cased-v1.1) | BERT | 110M | 512 | CC BY-NC-SA 4.0 | PyTorch |
| ClinicalBERT (ej. medicalai/ClinicalBERT) | BERT | 110M | 512 | MIT (varía) | PyTorch |

Nota: estos modelos comparables no están específicamente diseñados para PII, sino para NER biomédico general. No se dispone de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para textos clínicos en otros idiomas sin reentrenamiento.
- Al ser un modelo pequeño (66M), puede tener menor precisión que modelos más grandes (como los basados en BERT-large o GPT) en tareas de NER complejas, especialmente con jerga clínica poco frecuente.
- No incluye el tokenizer en el repositorio; depende del tokenizer del modelo base, lo que puede requerir acceso a Hugging Face para descargarlo.
- El formato MLX está pensado para Apple Silicon; en otros sistemas se requiere el backend de PyTorch, que puede no estar optimizado.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este modelo. Como cualquier modelo de NER, puede cometer errores de etiquetado, especialmente con entidades ambiguas o mal escritas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar que el uso en entornos sanitarios cumpla con las normativas locales de protección de datos (por ejemplo, RGPD en Europa).
- El modelo no realiza desidentificación automática completa; solo etiqueta entidades. El enmascaramiento o eliminación debe implementarse en la aplicación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpenMed/OpenMed-PII-LiteClinical-Small-66M-v1-mlx
- Modelo base: https://huggingface.co/OpenMed/OpenMed-PII-LiteClinical-Small-66M-v1
- GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Web de OpenMed: https://openmed.life/
