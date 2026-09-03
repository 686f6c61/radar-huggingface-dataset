# OpenMed/OpenMed-PII-Portuguese-BigMed-Large-278M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-BigMed-Large-278M-v1-mlx es un modelo de clasificación de tokens (token classification) desarrollado por el equipo de OpenMed para la detección de información personal identificable (PII) en texto clínico en portugués. Se trata de un fine-tuning del modelo BGE-Large sobre la arquitectura XLM-RoBERTa, concretamente implementado como `XLMRobertaForTokenClassification`. El modelo está empaquetado en formato MLX, lo que permite su ejecución local en dispositivos Apple Silicon sin necesidad de GPU dedicada, alineándose con la filosofía local-first de OpenMed para la IA clínica.

El modelo resuelve el problema de la anonimización de datos médicos, un requisito crítico para el cumplimiento normativo (como la LGPD en Brasil o el GDPR en Europa) y para compartir datos clínicos entre instituciones sin comprometer la privacidad del paciente. Con 278 millones de parámetros según su nomenclatura, está diseñado para identificar entidades como nombres, direcciones, números de identificación y otros datos sensibles en notas clínicas portuguesas. Su relevancia actual radica en la creciente demanda de soluciones de de-identificación que operen íntegramente en el dispositivo, evitando el envío de datos de salud a la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (`XLMRobertaForTokenClassification`), basado en BGE-Large |
| Parametros totales | 278M (según nomenclatura del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (típico de XLM-RoBERTa: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer XLM-RoBERTa, específicamente en la variante `XLMRobertaForTokenClassification`, que es un encoder de tipo BERT diseñado para tareas de etiquetado de secuencias. El checkpoint de origen es `OpenMed/OpenMed-PII-Portuguese-BigMed-Large-278M-v1`, que a su vez parte del encoder BGE-Large, fine-tuneado para la clasificación de tokens de PII en portugués clínico. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El empaquetado MLX convierte los pesos a formato safetensors y los distribuye junto con los assets del tokenizador, permitiendo su uso con el framework OpenMed en Apple Silicon. No se documentan innovaciones técnicas adicionales más allá del fine-tuning específico para la tarea.

## Capacidades

- Detección de información personal identificable (PII) en texto clínico en portugués, mediante clasificación de tokens (NER).
- Extracción de entidades con fusión inteligente (`use_smart_merging=True`), que agrupa tokens adyacentes en entidades completas.
- De-identificación de notas clínicas, identificando categorías como nombres, direcciones, números de identificación, fechas, etc.
- Integración con la librería OpenMed, que ofrece una API simple (`extract_pii`) para su uso en pipelines de procesamiento de lenguaje natural.
- Ejecución local en Apple Silicon mediante el backend MLX, sin necesidad de conexión a la nube.
- Compatibilidad con el ecosistema OpenMedKit para desarrollo de aplicaciones Swift en Apple.

## Casos de uso

- Anonimización de historiales clínicos: el modelo puede procesar notas clínicas en portugués y eliminar o enmascarar automáticamente los datos personales, facilitando el cumplimiento de la LGPD y el GDPR en entornos sanitarios.
- Preparación de datasets para investigación médica: permite compartir datos clínicos anonimizados entre instituciones académicas y hospitales, reduciendo el riesgo de re-identificación de pacientes.
- Integración en pipelines de de-identificación: al ser un modelo de clasificación de tokens, puede integrarse en flujos de procesamiento de texto clínico junto con otros componentes de NLP, como normalización o extracción de entidades médicas.
- Despliegue en entornos con requisitos estrictos de privacidad: al ejecutarse localmente en Apple Silicon, es adecuado para hospitales o clínicas que no pueden enviar datos de pacientes a servicios en la nube.
- Desarrollo de aplicaciones móviles de salud: mediante OpenMedKit, el modelo puede integrarse en apps de iOS para anonimizar datos en el propio dispositivo, por ejemplo en herramientas de captura de notas clínicas.
- Auditoría y cumplimiento normativo: el modelo puede utilizarse para verificar que los documentos clínicos no contienen PII antes de su publicación o transferencia, como parte de procesos de control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Requiere un dispositivo Apple Silicon (M1 o superior) para utilizar el backend MLX.
- El tamaño del repositorio es de 2.3 GB, por lo que se recomienda al menos 4 GB de RAM libre para cargar los pesos en memoria.
- No se requiere GPU dedicada; MLX utiliza la GPU integrada del chip Apple Silicon.
- Para sistemas sin Apple Silicon, OpenMed puede recurrir al backend PyTorch/Hugging Face, aunque no se especifican requisitos de VRAM para ese caso.
- La inferencia se realiza mediante la librería OpenMed (`pip install "openmed[mlx]"`), que gestiona automáticamente el backend adecuado.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en portugués; no soporta otros idiomas.
- La longitud de contexto no está documentada; si sigue el estándar de XLM-RoBERTa, podría limitarse a 512 tokens, lo que puede ser insuficiente para notas clínicas muy extensas.
- Al ser un modelo de clasificación de tokens, no genera texto ni mantiene conversaciones; su uso se limita a la extracción de entidades.
- No se han publicado evaluaciones de sesgos o errores específicos en la detección de PII; podría haber falsos positivos o negativos en ciertos tipos de entidades.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo se distribuye sin garantías y no se ha validado clínicamente; su uso en producción requiere verificación adicional.
- El empaquetado MLX está pensado para Apple Silicon; en otros entornos se requiere el backend PyTorch, que puede tener requisitos de hardware diferentes.

## Enlaces

- [Modelo MLX en Hugging Face](https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BigMed-Large-278M-v1-mlx)
- [Modelo base original](https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BigMed-Large-278M-v1)
- [Repositorio GitHub de OpenMed](https://github.com/maziyarpanahi/openmed)
- [Documentación del backend MLX](https://openmed.life/docs/mlx-backend/)
- [Documentación de OpenMedKit (Swift)](https://openmed.life/docs/swift-openmedkit/)
- [Artículo sobre el modelo en aichina.news](https://aichina.news/blog/meet-openmed-s-portuguese-clinical-pii-model-privacy-first-de-u6kckz/)
- [Sitio web de OpenMed](https://openmed.life/)
