# OpenMed/OpenMed-PII-Italian-mSuperClinical-Large-279M-v1-mlx

## Resumen

OpenMed-PII-Italian-mSuperClinical-Large-279M-v1-mlx es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en textos clínicos en italiano. Desarrollado por OpenMed, se distribuye como un empaquetado en formato MLX para su ejecución en dispositivos Apple Silicon, lo que permite un procesamiento local y sin conexión, alineado con el enfoque de OpenMed de IA sanitaria local-first. El modelo base es OpenMed/OpenMed-PII-Italian-mSuperClinical-Large-279M-v1, perteneciente a la familia DeBERTa-v2, y está diseñado para identificar hasta 54 tipos de entidades sensibles, como nombres, direcciones, números de seguridad social o historias clínicas.

La relevancia de este modelo radica en su capacidad para desidentificar datos clínicos en italiano de forma automática, un paso crítico para cumplir normativas como el RGPD o la HIPAA en entornos sanitarios. Al estar empaquetado en MLX, puede ejecutarse íntegramente en el dispositivo, garantizando que los datos de pacientes nunca salgan de la infraestructura local. Aunque el repositorio es reciente y cuenta con pocas descargas, forma parte de un ecosistema más amplio de OpenMed que incluye más de 2.200 modelos médicos y soporte para 21 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DebertaV2ForTokenClassification (deberta-v2) |
| Parametros totales | 279M (segun el nombre del modelo, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa-v2, concretamente en la variante `DebertaV2ForTokenClassification`, que emplea un mecanismo de atención disentangled y máscaras de posición mejoradas respecto a BERT. Está fine-tuned para la tarea de clasificación de tokens orientada a la detección de PII en italiano, a partir de un checkpoint base denominado `mSuperClinical-Large-279M`. No se dispone de información detallada sobre el corpus de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye en formato MLX, un framework de Apple para inferencia eficiente en silicio de Apple, lo que implica una conversión de los pesos originales de PyTorch a este formato.

## Capacidades

- Detección y clasificación de información personal identificable (PII) en texto clínico italiano, incluyendo nombres, direcciones, números de seguridad social, números de historia clínica y otros tipos de datos sensibles (hasta 54 categorías).
- Clasificación a nivel de token, devolviendo etiquetas y puntuaciones de confianza para cada entidad detectada.
- Integración con la librería OpenMed, que permite extraer entidades mediante la función `extract_pii` con opciones de fusión inteligente (`use_smart_merging`).
- Ejecución local en Apple Silicon mediante el backend MLX, sin necesidad de conexión a la nube.
- Compatibilidad con el ecosistema OpenMed, que incluye más de 2.200 modelos médicos y soporte para múltiples idiomas.
- No es un modelo generativo; no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Desidentificación de historias clínicas electrónicas: el modelo puede procesar notas clínicas en italiano y eliminar o enmascarar automáticamente los datos personales antes de su uso en investigación o análisis secundario, cumpliendo con el RGPD.
- Cumplimiento normativo en hospitales: integrado en sistemas de gestión de datos sanitarios, permite auditar y anonimizar registros de pacientes de forma continua, reduciendo el riesgo de filtraciones.
- Preparación de datasets para entrenamiento de modelos médicos: al limpiar los datos de PII, se pueden compartir conjuntos de datos clínicos entre instituciones sin exponer información sensible.
- Anonimización de informes de alta y notas de enfermería: el modelo puede aplicarse a documentos generados diariamente en entornos clínicos para garantizar que no se almacenen datos identificativos.
- Investigación biomédica colaborativa: facilita la creación de cohortes de pacientes anonimizadas para estudios multicéntricos, manteniendo la utilidad clínica de los textos.
- Aplicaciones móviles de salud: gracias a su formato MLX, puede ejecutarse en iPhone o iPad (a través de OpenMedKit) para procesar texto clínico localmente, sin enviar datos a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere un dispositivo Apple Silicon (M1 o posterior) para ejecutar el backend MLX de forma nativa.
- El tamaño del repositorio es de 1,1 GB, lo que sugiere que los pesos del modelo ocupan aproximadamente esa cantidad en disco; la memoria RAM unificada necesaria dependerá de la cuantización, pero no se especifica.
- Se puede ejecutar en Macs con al menos 8 GB de RAM unificada, aunque no hay datos oficiales de consumo.
- Para uso en otros sistemas (CPU/GPU NVIDIA), OpenMed ofrece un backend PyTorch/Hugging Face como alternativa, aunque el empaquetado MLX está pensado para Apple Silicon.
- El despliegue se realiza mediante la librería `openmed[mlx]` en Python, o a través de OpenMedKit para aplicaciones Swift (aunque el soporte Swift para esta familia de modelos aún no está disponible).
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. OpenMed ofrece otros modelos de PII para distintos idiomas, pero no se han detallado sus especificaciones ni rendimiento.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para italiano; no es aplicable a otros idiomas sin reentrenamiento.
- No se han documentado sesgos específicos, pero al ser un modelo de clasificación de tokens, el riesgo de alucinación es bajo; sin embargo, puede cometer errores de etiquetado en textos ambiguos o con formatos atípicos.
- La longitud de contexto no está especificada; es probable que herede las limitaciones de DeBERTa-v2 (típicamente 512 tokens), lo que puede requerir segmentación de documentos largos.
- El empaquetado MLX no incluye los archivos del tokenizador; OpenMed recurre al tokenizador del modelo base cuando es necesario, lo que podría añadir dependencias externas.
- El soporte Swift (OpenMedKit) para esta familia de modelos aún no está disponible, limitando su uso en aplicaciones iOS nativas.
- Aunque la licencia Apache-2.0 permite uso comercial, se recomienda verificar el cumplimiento de las normativas de protección de datos en el ámbito sanitario antes de su implementación en producción.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Italian-mSuperClinical-Large-279M-v1-mlx
- Checkpoint fuente (modelo base): https://huggingface.co/OpenMed/OpenMed-PII-Italian-mSuperClinical-Large-279M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
