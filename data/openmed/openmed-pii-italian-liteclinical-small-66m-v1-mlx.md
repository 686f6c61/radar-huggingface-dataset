# OpenMed/OpenMed-PII-Italian-LiteClinical-Small-66M-v1-mlx

## Resumen

OpenMed-PII-Italian-LiteClinical-Small-66M-v1-mlx es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en textos clínicos en italiano. Se trata de un empaquetado en formato MLX del checkpoint original OpenMed/OpenMed-PII-Italian-LiteClinical-Small-66M-v1, desarrollado por el proyecto OpenMed, una iniciativa local-first para IA clínica que prioriza la privacidad al ejecutar los modelos íntegramente en el dispositivo del usuario.

El modelo se basa en la arquitectura DistilBERT, una versión destilada de BERT, con aproximadamente 66 millones de parámetros. Está fine-tuned para identificar y clasificar 54 tipos de entidades sensibles, como nombres, direcciones, números de seguridad social, números de registro médico, entre otros. Su relevancia radica en permitir la desidentificación de historias clínicas y otros documentos sanitarios sin enviar datos a la nube, cumpliendo así con normativas como HIPAA y el RGPD.

Al estar empaquetado en MLX, este modelo está optimizado para ejecutarse en hardware Apple Silicon (Mac, iPhone, iPad) mediante las librerías OpenMed (Python) y OpenMedKit (Swift). Su tamaño reducido (0,3 GB) lo hace adecuado para despliegues en dispositivos con recursos limitados, manteniendo la privacidad de los datos del paciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (DistilBertForTokenClassification) |
| Parametros totales | 66 millones (segun nomenclatura del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato MLX con pesos en safetensors/npz) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, npz (MLX) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DistilBERT, un transformer encoder destilado que reduce el tamaño de BERT original manteniendo gran parte de su capacidad. En concreto, se trata de un modelo de clasificación de tokens (token classification) que asigna una etiqueta a cada token de entrada, permitiendo la extracción de entidades nombradas. El checkpoint base fue fine-tuned específicamente para la detección de PII en italiano, aunque no se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La innovación principal de este repositorio es su empaquetado en formato MLX, que permite la inferencia eficiente en Apple Silicon sin depender de la nube.

## Capacidades

- Detección y clasificación de 54 tipos de información personal identificable (PII) en texto clínico italiano, incluyendo nombres, direcciones, números de seguridad social, números de registro médico, fechas de nacimiento, etc.
- Token classification: asigna etiquetas a nivel de token, lo que permite identificar entidades con precisión dentro de frases complejas.
- Desidentificación de documentos clínicos: puede utilizarse para anonimizar historias clínicas, informes de laboratorio, recetas y otros documentos sanitarios.
- Integración con el ecosistema OpenMed: compatible con la API `extract_pii` de OpenMed, que ofrece funciones de fusión inteligente de entidades (`use_smart_merging`).
- Ejecución local en Apple Silicon: gracias al formato MLX, el modelo corre en Mac, iPhone y iPad sin conexión a internet, garantizando la privacidad de los datos.
- Soporte multilingüe indirecto: aunque el modelo está entrenado solo para italiano, el ecosistema OpenMed incluye modelos para otros idiomas, lo que permite ampliar la cobertura si se combinan varios modelos.

## Casos de uso

- Anonimización de historias clínicas electrónicas: el modelo puede procesar notas médicas en italiano y eliminar o enmascarar automáticamente los datos personales antes de que los documentos se utilicen para investigación o se compartan con terceros, cumpliendo con el RGPD.
- Cumplimiento de HIPAA en entornos sanitarios: al ejecutarse localmente, permite a hospitales y clínicas desidentificar datos de pacientes sin enviar información sensible a servicios en la nube, reduciendo el riesgo de brechas de seguridad.
- Preparación de datasets para investigación médica: los investigadores pueden usar el modelo para limpiar grandes volúmenes de texto clínico, eliminando PII antes de entrenar otros modelos o realizar análisis estadísticos.
- Auditoría de privacidad en documentos compartidos: antes de publicar o enviar informes médicos a colaboradores externos, el modelo puede verificar que no queden datos personales visibles.
- Desarrollo de asistentes clínicos locales: integrado en aplicaciones móviles o de escritorio para profesionales de la salud, el modelo permite extraer información relevante de las notas del paciente sin depender de servicios externos.
- Automatización de la codificación de diagnósticos: aunque su función principal es la detección de PII, la clasificación de tokens puede ayudar a identificar entidades clínicas (como medicamentos o procedimientos) si se combina con otros modelos del ecosistema OpenMed.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo tiene un tamaño de repositorio de 0,3 GB, lo que lo hace muy ligero para inferencia.
- Está diseñado para Apple Silicon: requiere un Mac con chip M1 o superior, o un iPhone/iPad con chip A14 o posterior (para Swift MLX).
- No se requiere GPU dedicada; la memoria unificada de los dispositivos Apple Silicon es suficiente. Un Mac con 8 GB de RAM puede ejecutar el modelo sin problemas.
- Para Python, se necesita instalar `openmed[mlx]` y ejecutar en macOS con Apple Silicon. En otros sistemas, OpenMed recurre al backend de Hugging Face/PyTorch.
- Para Swift, se utiliza OpenMedKit, que soporta macOS y dispositivos iOS/iPadOS reales (no simulador).
- La latencia y el throughput no están documentados, pero al ser un modelo de 66M de parámetros, la inferencia es casi instantánea en hardware moderno de Apple.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El ecosistema OpenMed incluye otros modelos de PII para diferentes idiomas, pero no se han facilitado datos de rendimiento relativos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para italiano; no es adecuado para textos en otros idiomas sin un fine-tuning adicional.
- Al ser un modelo de NER, puede cometer errores de clasificación (falsos positivos o negativos), especialmente con entidades poco frecuentes o contextos ambiguos. Se recomienda revisar manualmente los resultados en aplicaciones críticas.
- No se han documentado sesgos específicos, pero como cualquier modelo de lenguaje, puede reflejar sesgos presentes en los datos de entrenamiento.
- La longitud de contexto no está especificada; para documentos largos, puede ser necesario dividir el texto en fragmentos.
- Aunque la licencia Apache-2.0 permite uso comercial, es responsabilidad del usuario verificar que el uso cumple con las normativas locales de protección de datos (RGPD, HIPAA, etc.).
- El repositorio MLX no incluye los assets del tokenizador; OpenMed y OpenMedKit recurren al tokenizador del modelo base, lo que requiere acceso a Hugging Face en el primer uso.

## Enlaces

- Repositorio MLX en Hugging Face: [OpenMed/OpenMed-PII-Italian-LiteClinical-Small-66M-v1-mlx](https://huggingface.co/OpenMed/OpenMed-PII-Italian-LiteClinical-Small-66M-v1-mlx)
- Checkpoint base: [OpenMed/OpenMed-PII-Italian-LiteClinical-Small-66M-v1](https://huggingface.co/OpenMed/OpenMed-PII-Italian-LiteClinical-Small-66M-v1)
- Repositorio GitHub de OpenMed: [https://github.com/maziyarpanahi/openmed](https://github.com/maziyarpanahi/openmed)
- Documentación del backend MLX: [https://openmed.life/docs/mlx-backend/](https://openmed.life/docs/mlx-backend/)
- Documentación de OpenMedKit (Swift): [https://openmed.life/docs/swift-openmedkit/](https://openmed.life/docs/swift-openmedkit/)
- Sitio web de OpenMed: [https://openmed.life/](https://openmed.life/)
