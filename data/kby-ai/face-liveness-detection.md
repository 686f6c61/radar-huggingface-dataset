# kby-ai/face-liveness-detection

## Resumen

El repositorio `kby-ai/face-liveness-detection` en Hugging Face no contiene un modelo de inteligencia artificial en el sentido convencional (con pesos, arquitectura y parámetros), sino una imagen Docker que implementa un servicio de detección de vivacidad facial (liveness detection) mediante una API Flask y una interfaz Gradio. El desarrollo corre a cargo de KBY-AI, una empresa especializada en soluciones biométricas, que ofrece este SDK como parte de su suite de verificación de identidad.

El producto se presenta como una solución de detección de liveness pasiva 3D, capaz de identificar ataques de presentación como fotografías impresas, máscaras recortadas, reproducciones digitales y máscaras 3D. Según la información disponible, el algoritmo cumple con el estándar iBeta Level 2, lo que lo posiciona como una herramienta orientada a entornos de verificación de identidad (KYC) y prevención de fraude. No se proporcionan detalles sobre la arquitectura subyacente, el tamaño del modelo ni los datos de entrenamiento, por lo que esta ficha se limita a lo que se puede extraer de la documentación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (requiere licencia comercial de KBY-AI) |
| Formato de pesos | no disponible (se distribuye como imagen Docker) |

## Arquitectura y entrenamiento

No se ha publicado información técnica sobre la arquitectura del modelo de detección de liveness. La documentación menciona que se trata de una solución de "liveness pasiva 3D", lo que sugiere el uso de técnicas de análisis de profundidad o de múltiples vistas, pero no se especifican detalles como el tipo de red neuronal, el número de parámetros, el dataset de entrenamiento o el proceso de optimización. Tampoco se indica si se emplearon técnicas como aprendizaje por refuerzo o ajuste fino supervisado.

El producto se distribuye como una imagen Docker que encapsula un servidor Flask y una interfaz Gradio, lo que facilita su despliegue en contenedores. El acceso al SDK subyacente requiere una licencia por máquina o instancia, que se obtiene contactando con el equipo de KBY-AI.

## Capacidades

- Detección de vivacidad facial (liveness detection) pasiva en 3D.
- Detección de ataques de presentación: fotografías impresas, máscaras recortadas, reproducciones digitales (video replay) y máscaras 3D.
- Cumplimiento con el estándar iBeta Level 2, según la documentación oficial.
- Exposición de la funcionalidad mediante API REST (endpoints `/check_liveness` y `/check_liveness_base64`) y demo interactiva con Gradio.
- Acepta imágenes en formato de archivo o codificadas en base64.

## Casos de uso

- Verificación de identidad en procesos KYC (Know Your Customer): el SDK puede integrarse en flujos de alta de usuarios en entidades financieras o plataformas reguladas, donde se requiere confirmar que la persona está físicamente presente y no se está utilizando una foto o video.
- Prevención de fraude en onboarding digital: al detectar ataques de presentación, reduce el riesgo de suplantación de identidad en servicios que requieren verificación remota.
- Control de acceso biométrico: puede emplearse en sistemas de autenticación para garantizar que el usuario que se presenta ante una cámara es una persona real.
- Verificación de edad o identidad en plataformas de juego o apuestas online: ayuda a cumplir con normativas que exigen comprobar la mayoría de edad y la identidad real del usuario.
- Integración en aplicaciones móviles o web mediante la API REST: permite añadir un paso de liveness check en cualquier flujo de registro o transacción sensible.
- Auditoría de cumplimiento normativo: al cumplir con iBeta Level 2, facilita la justificación de medidas anti-suplantación ante reguladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación menciona el cumplimiento con iBeta Level 2, pero no se ofrecen métricas cuantitativas como tasas de error (FAR/FRR) ni comparaciones con otros sistemas.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware específicos. Al tratarse de una imagen Docker, se presume que puede ejecutarse en servidores con CPU o GPU, pero no se indican cantidades de VRAM, modelos de GPU recomendados ni estimaciones de latencia o throughput. Se recomienda contactar con KBY-AI para obtener especificaciones técnicas detalladas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de detección de liveness facial. No se conocen alternativas de código abierto equivalentes en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es de código abierto: se distribuye como una imagen Docker que requiere una licencia comercial por máquina o instancia.
- No se han publicado detalles sobre la arquitectura, los datos de entrenamiento ni los sesgos potenciales del sistema.
- La documentación no especifica los idiomas soportados ni la robustez frente a condiciones de iluminación, ángulos o calidad de imagen variables.
- Al ser un producto propietario, la transparencia sobre el funcionamiento interno es limitada, lo que puede dificultar la auditoría independiente.
- No se ofrecen garantías sobre el rendimiento en entornos de producción sin una evaluación previa con datos propios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kby-ai/face-liveness-detection
- Página del producto en KBY-AI: https://kby-ai.com/face-liveness-detection-sdk/
- Repositorio GitHub del SDK: https://github.com/kby-ai/Face-Liveness-Detection-SDK
- Repositorio GitHub de productos KBY-AI: https://github.com/kby-ai/Product
- Documentación de ayuda: https://docs.kby-ai.com/help/product/face-liveness-detection-sdk-face-recognition-sdk
