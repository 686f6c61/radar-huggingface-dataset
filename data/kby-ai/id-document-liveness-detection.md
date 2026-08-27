# kby-ai/id-document-liveness-detection

## Resumen

El modelo `kby-ai/id-document-liveness-detection` es un SDK de detección de viveza (liveness) para documentos de identidad, desarrollado por la empresa KBY-AI. Su función principal es verificar si una imagen de un documento de identidad (DNI, pasaporte, permiso de conducir) corresponde a un documento físico genuino o si se trata de un ataque de presentación, como una fotografía impresa, una pantalla o un retrato sustituido. Este tipo de tecnología es crítica en procesos de verificación de identidad remota (KYC) y prevención de fraude biométrico.

El producto se distribuye como una imagen Docker que expone una API REST y una demo Gradio. No se trata de un modelo de lenguaje, sino de un sistema de visión por computador especializado en anti-spoofing de documentos. La información pública disponible no incluye detalles sobre la arquitectura interna, el tamaño de los parámetros ni los datos de entrenamiento, por lo que gran parte de las especificaciones técnicas no están disponibles.

La relevancia actual de este modelo radica en el creciente uso de verificación de identidad en línea, donde los ataques de presentación son una amenaza común. KBY-AI ofrece este SDK como parte de su suite de productos biométricos, que también incluye reconocimiento facial y detección de viveza facial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (requiere licencia comercial por máquina) |
| Formato de pesos | no disponible (se distribuye como imagen Docker) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura del modelo, el conjunto de datos de entrenamiento ni el proceso de optimización. La documentación oficial se limita a describir las capacidades funcionales del SDK, sin entrar en aspectos técnicos del modelo subyacente. Se desconoce si utiliza una red neuronal convolucional, un transformer de visión u otra arquitectura, así como el número de parámetros o el volumen de datos empleados.

## Capacidades

- Detección de sustitución de retrato: devuelve una puntuación (`portraitReplace`) que indica la probabilidad de que la foto del documento haya sido manipulada o reemplazada.
- Detección de copia impresa: evalúa si el documento es una copia impresa en lugar de un original físico, mediante la puntuación `printedCopy`.
- Detección de pantalla: determina si el documento se muestra en una pantalla (por ejemplo, un móvil o monitor) en lugar de ser un documento físico, mediante la puntuación `screenReply`.
- Estado de verificación: devuelve un estado (`status`) que puede ser `Ok` o indicar problemas como `Too close to camera!`, `Document cropped!`, `Multiple documents`, `Is Colorless!`, entre otros.
- Soporte para múltiples tipos de documentos gubernamentales: tarjetas de identidad, pasaportes y permisos de conducir, según la documentación del SDK.
- Integración mediante API REST: permite procesar imágenes por archivo o por cadena base64, y devuelve resultados en formato JSON.

## Casos de uso

- Onboarding digital de clientes en entidades financieras: el SDK puede integrarse en el flujo de alta de clientes para verificar que el documento de identidad presentado es auténtico y no una fotografía de pantalla o una copia impresa, reduciendo el fraude en la apertura de cuentas.
- Verificación de identidad en plataformas de economía colaborativa: servicios de alquiler, compraventa entre particulares o sharing economy pueden usar la detección de viveza documental para confirmar que el usuario presenta un documento físico real antes de completar una transacción.
- Procesos KYC en exchanges de criptomonedas: las plataformas de intercambio de activos digitales necesitan cumplir regulaciones contra el blanqueo de capitales; este SDK permite validar documentos de identidad en tiempo real durante el registro de usuarios.
- Prevención de fraude en seguros: las aseguradoras pueden verificar la autenticidad de los documentos presentados al contratar una póliza o al tramitar un siniestro, evitando el uso de documentos falsificados o manipulados.
- Control de acceso en servicios gubernamentales: administraciones públicas que ofrecen trámites en línea pueden incorporar la verificación de viveza documental para garantizar que el ciudadano presenta su documento original, no una imagen capturada de otro dispositivo.
- Verificación de edad en comercio electrónico: plataformas que venden productos restringidos (alcohol, tabaco, juegos de azar) pueden usar el SDK para confirmar que el documento de identidad del comprador es auténtico y no una reproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como precisión, recall o tasas de error en la detección de ataques de presentación, ni comparaciones con otros sistemas de detección de viveza documental.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni de GPU en la documentación pública.
- El SDK se distribuye como una imagen Docker, lo que sugiere que puede ejecutarse en servidores con o sin aceleración GPU, aunque no se indica cuál es la configuración mínima recomendada.
- No se proporcionan datos sobre latencia o throughput de la inferencia.
- Para despliegue, se ofrece una demo Gradio accesible en el puerto 7860 del contenedor, y la API puede probarse con Postman.
- Se requiere una licencia por máquina o instancia, obtenida a partir del código HWID generado por el contenedor.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables específicos de detección de viveza documental con los que contrastar este SDK.

## Limitaciones y advertencias

- El modelo requiere una licencia comercial de KBY-AI para cada máquina o instancia donde se ejecute; sin licencia válida, el contenedor no funcionará.
- No se dispone de información sobre posibles sesgos en el modelo, como diferencias de rendimiento según el tipo de documento, la región o la calidad de la imagen.
- La documentación no detalla la robustez frente a ataques avanzados (por ejemplo, vídeos, máscaras 3D o manipulaciones digitales sofisticadas), más allá de los tres tipos de ataque mencionados (pantalla, copia impresa y sustitución de retrato).
- El estado de verificación puede devolver mensajes de error como `Too close to camera!` o `Document cropped!`, lo que implica que la calidad de la captura influye en el resultado; no se especifican umbrales ni condiciones óptimas de iluminación o distancia.
- No se indica si el modelo es multilingüe o si los documentos de ciertos países o formatos están mejor soportados que otros.
- Al ser un SDK propietario, no se puede acceder a los pesos del modelo ni auditar su funcionamiento interno, lo que limita su uso en entornos que requieren transparencia total.

## Enlaces

- HuggingFace: https://huggingface.co/kby-ai/id-document-liveness-detection
- Sitio web del producto: https://kby-ai.com/id-document-liveness-detection-sdk/
- Repositorio GitHub del Docker: https://github.com/kby-ai/ID-Document-Liveness-Detection-Docker
- Repositorio GitHub principal de KBY-AI: https://github.com/kby-ai/
- Documentación del SDK: https://docs.kby-ai.com/help/product/id-document-liveness-detection-sdk
- Página principal de KBY-AI: https://kby-ai.com/
