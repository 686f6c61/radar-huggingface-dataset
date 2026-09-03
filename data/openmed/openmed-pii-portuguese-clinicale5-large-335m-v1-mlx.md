# OpenMed/OpenMed-PII-Portuguese-ClinicalE5-Large-335M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-ClinicalE5-Large-335M-v1-mlx es un modelo de clasificación de tokens (token classification) diseñado para la detección de información personal identificable (PII) en textos clínicos en portugués. Desarrollado por OpenMed, se basa en la arquitectura BERT (concretamente en el checkpoint E5-Large) y ha sido fine-tuneado para identificar 54 tipos de entidades sensibles, como nombres, direcciones, números de seguridad social, números de registro médico, entre otros. Este repositorio concreto contiene un empaquetado en formato MLX, optimizado para inferencia en Apple Silicon mediante la librería OpenMed.

El modelo resuelve el problema de la de-identificación de historiales clínicos, un paso crítico para compartir datos médicos con fines de investigación cumpliendo normativas de privacidad como la LGPD brasileña o el GDPR europeo. Su relevancia actual radica en que permite ejecutar la detección de PII de forma local, sin enviar datos sensibles a la nube, lo que refuerza la privacidad del paciente. Con 335 millones de parámetros, es un modelo de tamaño medio que ofrece un equilibrio entre precisión y requisitos de hardware, y su formato MLX lo hace especialmente adecuado para entornos con Macs equipados con chips de la serie M.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification), basado en E5-Large |
| Parametros totales | 335 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX weights) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT, concretamente la variante E5-Large, adaptado para la tarea de clasificación de tokens mediante una cabeza de clasificación por token (BertForTokenClassification). El checkpoint original fue fine-tuneado específicamente para la detección de PII en dominios clínicos portugueses, aunque no se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO. La innovación principal de este repositorio es su empaquetado en formato MLX, que permite ejecutar el modelo de forma nativa en Apple Silicon con un rendimiento optimizado, manteniendo la compatibilidad con el backend estándar de Hugging Face / PyTorch en otros sistemas.

## Capacidades

- Detección de PII en texto clínico en portugués, con 54 etiquetas de entidades sensibles (nombres, direcciones, números de identificación, fechas, etc.).
- Clasificación de tokens a nivel de token, lo que permite identificar spans exactos de información sensible dentro de documentos.
- Integración con la librería OpenMed mediante la función `extract_pii`, que incluye opciones de fusión inteligente de entidades (`use_smart_merging`).
- Soporte nativo para Apple Silicon a través del backend MLX, con caída automática al backend PyTorch en otras plataformas.
- Capacidad de ejecución local y sin conexión, lo que garantiza que los datos clínicos no salgan del dispositivo.
- Compatibilidad con el ecosistema OpenMedKit para desarrollo de aplicaciones Swift en Apple.

## Casos de uso

- Anonimización de historiales clínicos para investigación: el modelo puede procesar grandes volúmenes de notas clínicas en portugués y eliminar o enmascarar automáticamente los identificadores personales, permitiendo que los datos sean compartidos con equipos de investigación sin violar la privacidad de los pacientes.
- Cumplimiento normativo en instituciones sanitarias: hospitales y clínicas pueden integrar el modelo en sus flujos de trabajo para garantizar que los documentos que se exportan o intercambian cumplen con la LGPD (Brasil) o el GDPR (Europa), reduciendo el riesgo de sanciones legales.
- Preparación de datasets para entrenamiento de modelos médicos: antes de utilizar datos clínicos para fine-tuning de modelos de NLP, el modelo puede limpiar los corpus eliminando PII, lo que facilita la creación de datasets anonimizados y reutilizables.
- Intercambio seguro de datos entre instituciones: cuando dos entidades sanitarias necesitan colaborar, el modelo puede de-identificar los registros antes de la transferencia, minimizando la exposición de datos sensibles durante el tránsito.
- Auditoría de privacidad en documentos clínicos: el modelo puede utilizarse como herramienta de verificación para detectar si un documento ya anonimizado contiene restos de PII, actuando como una capa adicional de control de calidad.
- Integración en pipelines de NLP clínico: al ser un modelo ligero (335M) y compatible con MLX, puede desplegarse en entornos edge (como Macs en consultorios) para procesar notas clínicas en tiempo real, por ejemplo, en sistemas de registro electrónico de salud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como precisión, recall o F1 sobre conjuntos de datos estándar de PII (p. ej., CoNLL-2003 o i2b2) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 335 millones de parámetros, en FP16 ocuparía aproximadamente 670 MB de memoria, aunque con overhead de activaciones y tokenización se recomienda al menos 2 GB de VRAM para un uso cómodo.
- GPU recomendadas: para el backend MLX, se requiere un Mac con chip Apple Silicon (M1, M2, M3 o superior). Para el backend PyTorch, puede ejecutarse en GPUs NVIDIA con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 3050) o en CPU.
- Si cabe en consumer GPU: sí, es un modelo pequeño que cabe en la mayoría de GPUs de consumo actuales, incluso en integradas de Apple Silicon.
- Opciones de despliegue: mediante la librería OpenMed con `pip install "openmed[mlx]"` en Apple Silicon, o con el backend estándar de Hugging Face / PyTorch en otras plataformas. También puede utilizarse directamente con Transformers si se carga el checkpoint original.
- Latencia y throughput: no se han publicado datos específicos, pero al ser un modelo BERT de 335M, la inferencia en Apple Silicon (M1 Pro o superior) suele ser de decenas de milisegundos por documento corto, dependiendo de la longitud del texto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos de detección de PII en portugués clínico. Existen alternativas genéricas como `pyspellchecker` o modelos NER multilingües (p. ej., `xlm-roberta-large` fine-tuneado en NER), pero no se han encontrado datos comparables en la documentación proporcionada. Se recomienda evaluar el modelo frente a alternativas como `mDeBERTa-v3-base` o `bert-base-multilingual-cased` fine-tuneados para NER, aunque no se dispone de resultados publicados.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para texto clínico en portugués; su rendimiento en otros dominios (p. ej., textos legales o financieros) o en otras variantes del portugués (europeo vs. brasileño) puede degradarse.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos demográficos o geográficos en las entidades detectadas.
- Como todo modelo de clasificación de tokens, existe riesgo de errores en entidades poco frecuentes o en contextos ambiguos, lo que puede llevar a falsos positivos o negativos en la detección de PII.
- La longitud de contexto no está documentada; si se hereda de BERT, probablemente sea de 512 tokens, lo que limita el procesamiento de documentos clínicos muy largos sin segmentación previa.
- Aunque la licencia Apache-2.0 permite uso comercial, es responsabilidad del usuario verificar que el uso del modelo cumple con las normativas de protección de datos aplicables en su jurisdicción.
- El empaquetado MLX está optimizado para Apple Silicon; en otros sistemas se requiere el backend PyTorch, que puede tener un rendimiento inferior.

## Enlaces

- Repositorio MLX en Hugging Face: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-ClinicalE5-Large-335M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-ClinicalE5-Large-335M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Colección de modelos médicos MLX: https://huggingface.co/collections/OpenMed/medical-mlx-models
