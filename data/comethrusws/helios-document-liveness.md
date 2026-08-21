# comethrusws/helios-document-liveness

## Resumen

El modelo `comethrusws/helios-document-liveness` es un clasificador de imágenes diseñado para la detección de vivacidad de documentos, es decir, para distinguir si una imagen de un documento fue capturada directamente del documento físico o si es una reproducción (pantalla, impresión, etc.). Está desarrollado por el usuario comethrusws (también conocido como blizzy), vinculado al proyecto Helios de SAGEA, una infraestructura de verificación de identidad y KYC autoalojada para entidades reguladas.

El modelo se publica con el pipeline de clasificación de imágenes y está disponible en formatos Keras, TensorFlow Lite y ONNX, lo que sugiere un diseño orientado a despliegue en entornos de producción, posiblemente en dispositivos móviles o servidores. Sin embargo, la información pública es extremadamente limitada: no se han publicado detalles sobre arquitectura, parámetros, datos de entrenamiento ni benchmarks. La fecha de creación (agosto de 2026) y el número de descargas (0) indican que es un modelo muy reciente o aún no difundido.

A pesar de la falta de especificaciones, su propósito es claro dentro del contexto de verificación de identidad: prevenir ataques de suplantación mediante presentación de copias de documentos. Es relevante para sistemas KYC, onboarding digital y cumplimiento normativo, donde la autenticidad de los documentos es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de visión, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no depende de idioma) |
| Licencia | Apache-2.0 (según tag en HuggingFace; el campo oficial indica "no disponible") |
| Formato de pesos | Keras (H5), TensorFlow Lite, ONNX (según tags) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (si es una CNN clásica, un transformer de visión, etc.), ni sobre el proceso de entrenamiento (tamaño del dataset, composición, técnicas de aumento de datos, uso de aprendizaje supervisado o contrastivo). Tampoco se detallan innovaciones técnicas específicas. Dado que el modelo se distribuye en formatos ligeros (TFLite, ONNX), es probable que haya sido optimizado para inferencia eficiente, pero esto es una inferencia razonable, no un dato confirmado.

## Capacidades

- Clasificación de imágenes para detectar si un documento es "vivo" (captura directa) o una reproducción (pantalla, impresión, fotografía de una fotografía).
- Posiblemente también detecte manipulaciones como intercambio de retratos en documentos de identidad, aunque no está confirmado.
- Al ser un modelo de visión, no tiene capacidades de generación de texto, razonamiento lingüístico ni tool calling.
- No se ha documentado soporte para múltiples idiomas, ya que la entrada es una imagen.
- No se ha indicado si soporta detección de múltiples tipos de documentos o solo un tipo genérico.

## Casos de uso

- Onboarding digital en entidades financieras: el modelo puede integrarse en un flujo KYC para verificar que el usuario presenta un documento físico real, no una captura de pantalla o una impresión, reduciendo el fraude de identidad.
- Verificación de identidad en aplicaciones móviles: gracias a los formatos TFLite y ONNX, puede ejecutarse en dispositivos Android o iOS para validar documentos en tiempo real durante el registro de usuarios.
- Prevención de fraude en plataformas de intercambio de criptomonedas: al exigir verificación de identidad, el modelo ayuda a cumplir normativas AML/KYC y evita cuentas falsas.
- Control de acceso a servicios gubernamentales: validación de documentos de identidad en trámites administrativos en línea, asegurando que el ciudadano presenta el documento original.
- Automatización de procesos de alta en telecomunicaciones: comprobación de la autenticidad del DNI o pasaporte en la contratación de líneas móviles o fibra.
- Auditoría de cumplimiento: integración en sistemas de registro para generar evidencias de que el documento fue verificado como auténtico, útil para inspecciones regulatorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión, recall, F1, ni comparaciones con otros modelos de detección de vivacidad de documentos.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware específicos. Al ser un modelo de clasificación de imágenes, es probable que sea ligero y pueda ejecutarse en CPU, pero no hay datos confirmados. Los formatos TFLite y ONNX sugieren compatibilidad con dispositivos móviles y edge, pero no se especifican requisitos de VRAM, GPU recomendadas ni latencia. Para un despliegue en servidor, se podría usar TensorFlow Serving o ONNX Runtime, pero no hay documentación al respecto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de detección de vivacidad de documentos. Existen soluciones comerciales como IDLive Doc de Mitek o modelos de Detector24, pero no se conocen datos públicos de este modelo para comparar parámetros, rendimiento o licencia.

## Limitaciones y advertencias

- No hay información pública sobre sesgos, robustez frente a condiciones de iluminación, ángulos o calidad de imagen.
- Riesgo de alucinación no aplica (modelo de visión), pero sí riesgo de falsos positivos/negativos en la clasificación de vivacidad, lo que podría afectar la experiencia de usuario o la seguridad.
- La licencia Apache-2.0 permite uso comercial, pero el campo oficial de licencia en HuggingFace indica "no disponible", por lo que se recomienda verificar con el autor antes de un uso productivo.
- El modelo no ha sido validado externamente; al tener 0 descargas y 0 likes, no hay evidencia de su rendimiento en entornos reales.
- No se especifican limitaciones de contexto o idioma, pero al ser un modelo de visión, no procesa texto.
- Para producción, es imprescindible obtener documentación adicional del autor o realizar una evaluación propia con datos representativos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/comethrusws/helios-document-liveness)
- [Perfil del autor en HuggingFace](https://huggingface.co/comethrusws)
- [Sitio de SAGEA (proyecto Helios)](https://www.sagea.space/enterprise/helios)
