# OpenMed/OpenMed-PII-Spanish-BioClinicalBERT-Base-110M-v1-mlx

## Resumen

OpenMed-PII-Spanish-BioClinicalBERT-Base-110M-v1-mlx es un modelo de clasificación de tokens (token classification) diseñado para la detección de información personal identificable (PII) en texto clínico en español. Desarrollado por OpenMed, se basa en el checkpoint BioClinicalBERT de 110 millones de parámetros, fine-tuneado específicamente para identificar 54 tipos de entidades sensibles, como nombres, direcciones, números de seguridad social, números de expediente médico, entre otros. Su principal valor reside en permitir la de-identificación de historiales clínicos, un paso crítico para cumplir normativas como HIPAA y para facilitar la investigación médica sin comprometer la privacidad de los pacientes.

Esta versión con sufijo `-mlx` es un empaquetado en formato MLX (Apple Silicon) del modelo original, optimizado para inferencia local en dispositivos Apple (Macs con chip M1/M2/M3/M4, iPhone y iPad). OpenMed es una librería local-first que prioriza el procesamiento on-device, evitando enviar datos sensibles a la nube. El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso académico y comercial sin restricciones significativas. Aunque el repositorio tiene pocas descargas (8) y ningún "like", su enfoque en privacidad y su integración con el ecosistema OpenMed lo hacen relevante para entornos sanitarios que buscan soluciones de anonimización autónomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 110 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (tipicamente 512 tokens para BERT base, no especificado) |
| Tipos de cuantizacion | No disponible (el formato MLX puede admitir cuantizacion, pero no se documenta) |
| Idiomas soportados | Español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz), compatible con PyTorch/Hugging Face |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base (BioClinicalBERT) adaptado para clasificación de tokens. BioClinicalBERT es una variante de BERT preentrenada con corpus biomédicos y clínicos en inglés, aunque en este caso se ha fine-tuneado para texto clínico en español. La capa de salida es una cabeza de clasificación por token que asigna una de las 54 etiquetas PII a cada token de entrada. No se han publicado detalles sobre el dataset de fine-tuning, el número de épocas, ni si se emplearon técnicas como RLHF o DPO (al ser un modelo discriminativo, estas técnicas no son habituales). La arquitectura es la estándar de BERT base: 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con un máximo de 512 tokens de contexto (valor típico, aunque no confirmado en la documentación).

El empaquetado MLX conserva la configuración original (`config.json`, `id2label.json`) y los pesos en formato safetensors o npz, lo que permite su uso tanto con la librería OpenMed en Python como con OpenMedKit en Swift. El tokenizador no se incluye en el repositorio MLX, pero se referencia el tokenizador del modelo base en `config.json` para mantener compatibilidad.

## Capacidades

- Detección de PII en texto clínico en español: identifica 54 categorías de información sensible, incluyendo nombres propios, direcciones, números de seguridad social, números de expediente médico, fechas, teléfonos, correos electrónicos, etc.
- Clasificación de tokens y extracción de spans: salida de etiquetas por token, adecuada para tareas de sequence labelling y extracción de entidades.
- Integración con OpenMed: la API `extract_pii` permite obtener entidades con etiqueta, texto y nivel de confianza, con opción de "smart merging" para agrupar tokens en entidades completas.
- Ejecución local en Apple Silicon: gracias al formato MLX, el modelo puede ejecutarse completamente on-device en Macs, iPhones y iPads, sin conexión a internet ni envío de datos a servidores externos.
- Compatibilidad con backend PyTorch/Hugging Face: en sistemas sin Apple Silicon, OpenMed puede recurrir al backend estándar de Hugging Face, manteniendo la misma funcionalidad.
- Soporte multilingüe limitado: aunque el modelo está especializado en español, OpenMed como plataforma ofrece modelos para 21 idiomas, pero este checkpoint concreto solo cubre español.

## Casos de uso

- De-identificación de historiales clínicos para investigación: el modelo puede procesar notas médicas y eliminar o enmascarar automáticamente los datos personales antes de compartir los registros con equipos de investigación o repositorios públicos, cumpliendo con requisitos de anonimización.
- Cumplimiento normativo en entornos sanitarios: hospitales y clínicas pueden integrar el modelo en sus sistemas para auditar documentos y garantizar que no se filtren PII en comunicaciones internas o externas, reduciendo el riesgo de sanciones por incumplimiento de HIPAA o GDPR.
- Anonimización de datos para terceros: aseguradoras, farmacéuticas o proveedores de servicios de salud pueden utilizar el modelo para limpiar conjuntos de datos antes de enviarlos a colaboradores externos, manteniendo la utilidad clínica sin exponer identidades.
- Procesamiento local en dispositivos Apple: gracias al formato MLX, el modelo puede ejecutarse en un Mac o iPhone dentro de una consulta médica, permitiendo a los profesionales sanitarios verificar la presencia de PII en notas clínicas sin necesidad de conexión a internet, lo que es crítico en entornos con conectividad limitada o políticas de privacidad estrictas.
- Integración en pipelines de NLP clínico: el modelo puede combinarse con otros componentes (extracción de entidades clínicas, análisis de sentimiento, etc.) para construir sistemas de procesamiento de lenguaje natural que operen sobre datos desidentificados, facilitando el desarrollo de asistentes clínicos o herramientas de soporte a la decisión.
- Auditoría de documentos y prevención de fugas de información: organizaciones sanitarias pueden emplear el modelo para escanear correos electrónicos, informes o formularios y detectar si contienen datos personales no autorizados, ayudando a prevenir brechas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como precisión, recall o F1 sobre conjuntos de validación estándar (p. ej., MUC-7, CoNLL-2003 o datasets clínicos específicos). Tampoco hay comparaciones con otros modelos de detección de PII en español.

## Requisitos de hardware

- El modelo tiene 110 millones de parámetros y un tamaño de repositorio de 0,4 GB, por lo que es ligero y puede ejecutarse en hardware de consumo.
- En Apple Silicon (M1, M2, M3, M4), el formato MLX permite inferencia eficiente en CPU/GPU unificada. No se especifican requisitos mínimos de RAM, pero al ser un modelo pequeño, cualquier Mac con al menos 8 GB de RAM unificada debería ser suficiente.
- En sistemas sin Apple Silicon, OpenMed puede usar el backend PyTorch/Hugging Face, ejecutable en CPU o GPU (p. ej., NVIDIA RTX 3060 o superior). No se proporcionan cifras de VRAM, pero para un modelo de 110M en FP32 se necesitan aproximadamente 440 MB de memoria, y menos si se cuantiza.
- Opciones de despliegue: librería OpenMed en Python (`pip install "openmed[mlx]"`), OpenMedKit en Swift para macOS/iOS, o directamente con Hugging Face Transformers si se usa el checkpoint base.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño reducido, se espera una latencia de milisegundos por documento en hardware moderno, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han identificado alternativas específicas para detección de PII en español clínico con las que comparar parámetros, contexto, rendimiento o licencia. Se recomienda consultar el ecosistema OpenMed, que incluye más de 2.200 modelos médicos, para encontrar opciones similares.

## Limitaciones y advertencias

- El modelo está especializado en español clínico; su rendimiento en otros dominios (legal, financiero, etc.) o en variantes dialectales del español puede degradarse.
- No se han publicado detalles sobre el dataset de fine-tuning, por lo que se desconoce la cobertura de tipos de PII, el equilibrio de clases o posibles sesgos en los datos de entrenamiento.
- Al ser un modelo de clasificación de tokens, no genera texto y, por tanto, no presenta riesgo de alucinación en el sentido generativo. Sin embargo, puede cometer errores de etiquetado (falsos positivos o negativos) que deben validarse en producción.
- La longitud de contexto no está confirmada; si es la estándar de BERT (512 tokens), documentos clínicos largos deberán truncarse o dividirse en segmentos, lo que podría afectar a la detección de PII en los límites de los segmentos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías; los usuarios son responsables de validar su precisión en sus casos de uso específicos.
- El repositorio MLX no incluye el tokenizador; depende de la referencia al modelo base, lo que requiere acceso a Hugging Face para descargarlo en tiempo de ejecución si no se ha cacheado previamente.

## Enlaces

- Repositorio Hugging Face del modelo MLX: [https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BioClinicalBERT-Base-110M-v1-mlx](https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BioClinicalBERT-Base-110M-v1-mlx)
- Checkpoint base (PyTorch/Hugging Face): [https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BioClinicalBERT-Base-110M-v1](https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BioClinicalBERT-Base-110M-v1)
- Repositorio GitHub de OpenMed: [https://github.com/maziyarpanahi/openmed](https://github.com/maziyarpanahi/openmed)
- Documentación del backend MLX: [https://openmed.life/docs/mlx-backend/](https://openmed.life/docs/mlx-backend/)
- Documentación de OpenMedKit (Swift): [https://openmed.life/docs/swift-openmedkit/](https://openmed.life/docs/swift-openmedkit/)
