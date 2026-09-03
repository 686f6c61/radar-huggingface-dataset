# OpenMed/OpenMed-PII-Portuguese-BiomedBERT-Base-110M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-BiomedBERT-Base-110M-v1-mlx es un modelo de clasificación de tokens basado en la arquitectura BERT, con 110 millones de parámetros, fine-tuned para la detección de información personal identificable (PII) en texto biomédico en portugués. Desarrollado por OpenMed, este artefacto es un empaquetado específico para inferencia en Apple Silicon mediante el framework MLX, aunque el checkpoint original también está disponible para su uso con PyTorch. El modelo identifica y clasifica 54 tipos de entidades sensibles, como nombres, direcciones, números de seguridad social y números de registro médico, lo que lo convierte en una herramienta clave para la de-identificación de datos clínicos y el cumplimiento de normativas de privacidad como la LGPD brasileña o el GDPR europeo.

Su relevancia actual radica en la creciente necesidad de procesar historiales clínicos y registros de investigación sin exponer datos personales, especialmente en entornos hospitalarios donde la privacidad es crítica. Al ser un modelo compacto (110M) y ejecutarse 100% en el dispositivo, permite flujos de trabajo locales sin enviar datos a la nube, una ventaja significativa para instituciones con requisitos estrictos de seguridad. La licencia Apache-2.0 facilita su adopción comercial y académica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 110 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT base, un transformer encoder-only de 12 capas con 110 millones de parámetros, al que se le añade una cabeza de clasificación de tokens (token classification) para etiquetar cada token con una de las 54 categorías de PII. El checkpoint original fue fine-tuned a partir de un modelo biomédico BERT base en portugués, aunque no se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO. La innovación principal de este artefacto MLX es su conversión a pesos optimizados para Apple Silicon, lo que permite una inferencia eficiente en hardware de Apple sin depender de CUDA.

## Capacidades

- Detección y clasificación de PII en texto biomédico en portugués, cubriendo 54 tipos de entidades (nombres, direcciones, números de seguridad social, números de registro médico, datos de contacto, etc.).
- Etiquetado a nivel de token, lo que permite redactar o enmascarar automáticamente las entidades detectadas en notas clínicas y registros de investigación.
- Ejecución local en Apple Silicon mediante el backend MLX de OpenMed, sin necesidad de conexión a la nube.
- Compatibilidad con el pipeline de token-classification de Hugging Face, lo que facilita su integración en flujos de NLP existentes.
- No soporta generación de texto, tool calling, agentes, visión ni audio; es exclusivamente un modelo de etiquetado de secuencias.

## Casos de uso

- Anonimización de historiales clínicos: el modelo puede procesar notas médicas en portugués y marcar automáticamente nombres, fechas de nacimiento, números de identificación y otros datos personales, permitiendo su redacción antes de compartir los documentos con investigadores o terceros.
- Cumplimiento de la LGPD en Brasil: integrado en sistemas de gestión de datos sanitarios, ayuda a garantizar que los registros de pacientes cumplan con la ley de protección de datos antes de su almacenamiento o transferencia.
- Preparación de datasets para investigación médica: al eliminar PII de corpus clínicos, facilita la creación de conjuntos de datos anonimizados para entrenar otros modelos de NLP sin comprometer la privacidad de los pacientes.
- Despliegue local en hospitales: gracias a su tamaño reducido y al soporte MLX, puede ejecutarse en Macs de uso común en entornos sanitarios, manteniendo los datos dentro de la red del hospital.
- Redacción de informes de alta y derivaciones: el modelo puede procesar documentos generados automáticamente y eliminar información sensible antes de enviarlos a otras instituciones.
- Auditoría de privacidad en registros electrónicos de salud: se puede utilizar como herramienta de verificación para detectar fugas de PII en bases de datos existentes, señalando entidades que deberían haber sido enmascaradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en Apple Silicon (M1, M2, M3 o superior) con el backend MLX de OpenMed; se requiere instalar el paquete `openmed[mlx]`.
- Al ser un modelo de 110M parámetros, la VRAM necesaria es reducida; cabe en Macs con 8 GB de RAM unificada o más, aunque no se especifica un valor exacto.
- En sistemas sin Apple Silicon, OpenMed puede recurrir al backend PyTorch estándar, ejecutándose en CPU o GPU NVIDIA, aunque el artefacto MLX está optimizado para Apple.
- Opciones de despliegue: uso directo mediante la API `extract_pii` de OpenMed, o carga del directorio local con `OpenMedConfig(backend="mlx")`. También es posible integrarlo en pipelines de Hugging Face con el checkpoint original.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se recomienda evaluar el modelo frente a alternativas de NER biomédico en portugués, como los basados en BERTimbau o BioBERTpt, aunque no se han encontrado datos de comparación directa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para portugués; no es aplicable a otros idiomas sin reentrenamiento.
- Al ser un modelo de clasificación de tokens, no genera texto y no puede manejar tareas de razonamiento o diálogo.
- No se han documentado los datos de entrenamiento, por lo que existe un riesgo potencial de sesgos en las entidades detectadas, especialmente en variantes regionales del portugués (Brasil vs. Portugal).
- La precisión en la detección de PII puede verse afectada por formatos no estándar de números de identificación o direcciones incompletas; se recomienda validar los resultados en el dominio específico.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo se distribuye sin garantías; es responsabilidad del usuario verificar su rendimiento en producción.
- El artefacto MLX está pensado para Apple Silicon; en otros entornos se debe usar el checkpoint original, que puede requerir más recursos.

## Enlaces

- Repositorio MLX en Hugging Face: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BiomedBERT-Base-110M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BiomedBERT-Base-110M-v1
- Repositorio de OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
