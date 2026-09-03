# OpenMed/OpenMed-PII-Italian-mClinicalE5-Large-560M-v1-mlx

## Resumen

OpenMed-PII-Italian-mClinicalE5-Large-560M-v1-mlx es un empaquetado en formato MLX del modelo original OpenMed-PII-Italian-mClinicalE5-Large-560M-v1, desarrollado por OpenMed para la detección de información personal identificable (PII) en textos clínicos en italiano. El modelo pertenece a la familia XLM-RoBERTa y está configurado como un clasificador de tokens (token classification) que identifica entidades como nombres, direcciones, fechas u otros datos sensibles dentro de notas médicas. Su principal valor es permitir la desidentificación de documentos clínicos de forma totalmente local, sin enviar datos a la nube, lo que facilita el cumplimiento de normativas como HIPAA o el RGPD.

La relevancia de esta versión MLX radica en que está optimizada para ejecutarse en dispositivos Apple Silicon (Mac, iPhone, iPad) mediante la librería OpenMed y OpenMedKit, ofreciendo inferencia on-device con baja latencia. El modelo base tiene 560 millones de parámetros según su nomenclatura, aunque no se especifica la longitud de contexto en la documentación disponible. Al estar licenciado bajo Apache 2.0, puede integrarse en proyectos comerciales sin restricciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (XLMRobertaForTokenClassification) |
| Parametros totales | 560 millones (segun nomenclatura del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (la arquitectura XLM-RoBERTa suele usar 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y/o NPZ (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa, un transformer encoder multilingüe preentrenado con la técnica de masked language modeling sobre un corpus masivo en más de 100 idiomas. Sobre esta base, se ha realizado un fine-tuning específico para la tarea de token classification orientada a la detección de PII en textos clínicos italianos. La capa de salida clasifica cada token en una de las etiquetas definidas en el archivo `id2label.json`, que mapea los identificadores numéricos a las categorías de entidades.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de épocas, ni si se emplearon técnicas como RLHF o DPO. El repositorio MLX no incluye los assets del tokenizador; en su lugar, se referencia el tokenizador del modelo original en `config.json` para mantener la compatibilidad. La arquitectura es un encoder puro, por lo que no está diseñado para generación de texto, sino exclusivamente para clasificación de secuencias a nivel de token.

## Capacidades

- Detección de PII en italiano: identifica entidades como nombres de personas, direcciones, fechas, números de teléfono, códigos fiscales y otros datos personales dentro de notas clínicas.
- Token classification: asigna una etiqueta a cada token del texto de entrada, permitiendo localizar con precisión los fragmentos sensibles.
- Integración con OpenMed: la API `extract_pii` permite obtener entidades con etiquetas y niveles de confianza, además de un modo de fusión inteligente (`use_smart_merging`) para agrupar tokens contiguos en entidades completas.
- Ejecución multiplataforma: además de MLX en Apple Silicon, el modelo original está disponible en otros formatos (ONNX, PyTorch) para su uso en CPU, Android o WebAssembly.
- Compatibilidad con OpenMedKit: permite su uso desde Swift en macOS y dispositivos iOS físicos (iPhone, iPad) para aplicaciones nativas.
- Inferencia local: al ejecutarse en el dispositivo, no requiere conexión a internet ni envío de datos a servidores externos.

## Casos de uso

- Desidentificación de historias clínicas en hospitales italianos: el modelo puede procesar notas médicas y eliminar o enmascarar automáticamente los datos personales antes de compartir los documentos con terceros o utilizarlos en investigaciones.
- Cumplimiento normativo en aplicaciones de salud: integrado en sistemas de gestión de pacientes, ayuda a garantizar que los datos sensibles no se expongan en logs, interfaces o exportaciones, cumpliendo con el RGPD y la HIPAA.
- Anonimización de corpus clínicos para investigación: los investigadores pueden utilizar el modelo para limpiar grandes volúmenes de texto clínico y crear conjuntos de datos anonimizados aptos para entrenar otros modelos sin comprometer la privacidad de los pacientes.
- Aplicaciones móviles de salud en iOS: gracias a la versión MLX y OpenMedKit, se puede integrar la detección de PII en apps de salud que funcionan sin conexión, protegiendo los datos directamente en el dispositivo del usuario.
- Automatización de la gestión de consentimientos: el modelo puede identificar menciones de datos personales en formularios o documentos legales para verificar que se han eliminado antes de su publicación.
- Auditoría de seguridad en entornos clínicos: permite revisar automáticamente si los textos generados por otros sistemas (como resúmenes automáticos o transcripciones) contienen información personal no deseada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Aunque la plataforma OpenMed afirma ser "estado del arte en 10 de 12 benchmarks NER biomédicos" a nivel general, no se proporcionan métricas específicas para este modelo concreto (como F1, precisión o recall en la detección de PII en italiano). Tampoco se ofrecen comparativas con otros modelos de la misma categoría.

## Requisitos de hardware

- Apple Silicon Mac (M1, M2, M3 o superior) con memoria unificada de al menos 8 GB para ejecutar el modelo en MLX con comodidad.
- iPhone o iPad físico con chip Apple Silicon (A14 Bionic o posterior) para usar la versión Swift MLX a través de OpenMedKit.
- VRAM estimada: no disponible, pero al tratarse de un modelo de 560M, puede caber en la memoria unificada de los dispositivos Apple Silicon sin necesidad de GPU dedicada.
- Opciones de despliegue: `openmed[mlx]` en Python, OpenMedKit en Swift, o el backend PyTorch/Hugging Face en sistemas sin Apple Silicon. También existen versiones ONNX para Android y WebAssembly.
- Latencia y throughput: no se han publicado datos concretos. Se espera una latencia baja en dispositivos Apple Silicon gracias a la optimización MLX, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos alternativos de detección de PII en italiano. No se han encontrado referencias a otros modelos con las mismas características (tamaño, idioma y tarea) en la documentación proporcionada. Se recomienda consultar el ecosistema OpenMed, que incluye más de 2.200 modelos médicos, para evaluar opciones similares.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para italiano; no es aplicable a otros idiomas sin un fine-tuning adicional.
- No se especifican los tipos de PII cubiertos ni el número exacto de etiquetas, aunque la plataforma OpenMed menciona soporte para más de 55 tipos de PHI a nivel general.
- El repositorio MLX no incluye el tokenizador; depende del modelo original para funcionar, lo que puede requerir acceso a Hugging Face en el momento de la carga.
- No se han publicado métricas de rendimiento ni estudios de sesgos, por lo que se recomienda validar el modelo en el dominio clínico específico antes de usarlo en producción.
- Al ser un modelo de encoder, no puede generar texto; su uso se limita a la clasificación de tokens.
- La ejecución en iOS Simulator no está soportada para Swift MLX; solo funciona en dispositivos físicos.
- Aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del usuario verificar que el modelo cumple con los requisitos de privacidad y seguridad de su jurisdicción.

## Enlaces

- Repositorio Hugging Face del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Italian-mClinicalE5-Large-560M-v1-mlx
- Modelo original: https://huggingface.co/OpenMed/OpenMed-PII-Italian-mClinicalE5-Large-560M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit: https://openmed.life/docs/swift-openmedkit/
- Sitio web de OpenMed: https://openmed.life/
- Variante ONNX para Android/Web: https://huggingface.co/OpenMed/OpenMed-PII-Italian-mClinicalE5-Large-560M-v1-onnx-android
- Referencia arXiv (mencionada en la variante ONNX): https://arxiv.org/abs/2508.01630
