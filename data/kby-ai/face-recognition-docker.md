# kby-ai/face-recognition-docker

## Resumen

El modelo `kby-ai/face-recognition-docker` es una imagen Docker que implementa un sistema de reconocimiento facial basado en el SDK propietario de KBY-AI. No se trata de un modelo de lenguaje ni de un modelo de visión entrenado de forma abierta, sino de un servicio empaquetado que expone una API Flask y una interfaz Gradio para comparar dos imágenes faciales y determinar si corresponden a la misma persona. El algoritmo subyacente está posicionado en los primeros puestos del ranking FRVT 1:1 del NIST según el informe de diciembre de 2024, lo que indica un alto rendimiento en verificación facial.

El sistema acepta dos imágenes (como archivo o codificadas en base64), detecta los rostros, extrae plantillas biométricas y calcula una puntuación de similitud. Se distribuye exclusivamente como contenedor Docker y requiere una licencia por máquina o instancia, que se obtiene contactando con el fabricante. Es relevante para desarrolladores que necesitan integrar verificación facial en producción sin entrenar sus propios modelos, aunque la naturaleza cerrada del SDK limita su uso a través de la API proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (SDK propietario de KBY-AI, algoritmo de reconocimiento facial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesamiento de imagenes, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz y la documentacion estan en ingles) |
| Licencia | no disponible (requiere licencia comercial por maquina) |
| Formato de pesos | no aplica (se distribuye como imagen Docker, no como pesos) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo de reconocimiento facial, los datos de entrenamiento ni el proceso de optimizacion. El SDK es propietario y se distribuye como binario dentro de la imagen Docker. Segun la documentacion, el algoritmo esta evaluado por el NIST en la prueba FRVT 1:1, donde obtiene una posicion destacada, lo que sugiere un entrenamiento con grandes volumenes de datos faciales y una arquitectura de red neuronal convolucional o similar, pero no se confirman detalles tecnicos.

La integracion se realiza mediante un servidor Flask que expone dos endpoints de comparacion (con archivo y con base64) y una interfaz Gradio para pruebas interactivas. El sistema detecta rostros, extrae plantillas biometricas y calcula la similitud entre ellas. No se documentan innovaciones tecnicas especificas mas alla del rendimiento certificado por NIST.

## Capacidades

- Verificacion facial 1:1: compara dos imagenes y devuelve una puntuacion de similitud para determinar si pertenecen a la misma persona.
- Soporte de entrada por archivo de imagen y por cadena base64, lo que facilita la integracion con aplicaciones web y moviles.
- Interfaz Gradio para pruebas manuales y demostraciones.
- API REST mediante Flask, con endpoints documentados para POST.
- Rendimiento certificado por NIST en FRVT 1:1 (informe de diciembre de 2024), lo que indica precision competitiva a nivel global.
- Despliegue contenerizado: la imagen Docker incluye todas las dependencias y el SDK, simplificando la instalacion en servidores Linux.

## Casos de uso

- Control de acceso fisico: integrar la API en un sistema de videoportero o torniquete que compare la foto de una persona con la imagen capturada en tiempo real, usando el endpoint `compare_face` con archivos.
- Verificacion de identidad en onboarding digital: una aplicacion movil envia la foto del DNI y un selfie en base64 al endpoint `compare_face_base64` para confirmar que la persona es quien dice ser.
- Duplicado de cuentas en plataformas fintech: comparar la foto de un nuevo usuario con las existentes en la base de datos para detectar identidades duplicadas o fraudulentas.
- Busqueda de personas en bases de datos de imagenes: extraer la plantilla biometrica de una imagen de consulta y compararla con un conjunto de candidatos mediante llamadas repetidas a la API.
- Sistema de asistencia biometrica en empresas: registrar la entrada y salida de empleados comparando la foto de la camara con la foto almacenada en el sistema de recursos humanos.
- Demostracion y prototipado rapido: usar la interfaz Gradio para validar la precision del sistema con imagenes propias antes de integrar la API en un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia es la posicion en el ranking FRVT 1:1 del NIST, pero no se proporcionan cifras concretas de precision, tasa de falsos positivos o falsos negativos. Se recomienda consultar el informe oficial del NIST para obtener datos numericos.

## Requisitos de hardware

- La imagen Docker requiere un servidor Linux con Docker instalado. No se especifican requisitos minimos de CPU o RAM en la documentacion.
- Se necesitan dos puertos libres: el 8081 para la API Flask y el 9001 para la interfaz Gradio (configurables mediante el mapeo de puertos de Docker).
- No se indica si se requiere GPU. Dado que el SDK es propietario y se distribuye como binario, es probable que la inferencia se ejecute en CPU, pero no se confirma.
- El despliegue se realiza con `docker pull kbyai/face-recognition:latest` y `docker run` con un archivo de licencia o una cadena de licencia.
- No se proporcionan datos de latencia ni throughput. Para entornos de produccion con alto volumen, se recomienda contactar con KBY-AI para conocer las capacidades del SDK.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de reconocimiento facial, ya que no se conocen los parametros internos ni los resultados de benchmarks. Alternativas comerciales o de codigo abierto como FaceNet, ArcFace o DeepFace podrian ser comparables en funcionalidad, pero no se pueden contrastar datos objetivos sin informacion publica del modelo de KBY-AI.

## Limitaciones y advertencias

- El SDK es propietario y requiere una licencia comercial por maquina o instancia. Sin licencia, el contenedor no funciona. Esto limita su uso en proyectos de codigo abierto o con presupuesto restringido.
- No se publican detalles sobre la arquitectura, los datos de entrenamiento ni los sesgos potenciales del modelo. No es posible auditar su comportamiento en poblaciones diversas.
- La documentacion no especifica limitaciones de tamano de imagen, formatos soportados ni restricciones de iluminacion o angulo. Se asume que el sistema esta optimizado para condiciones controladas, pero no se confirma.
- El modelo no es un LLM ni un sistema multimodal general: solo realiza verificacion facial 1:1. No puede generar texto, razonar ni procesar otro tipo de datos.
- La licencia no esta definida en la ficha de HuggingFace. Se debe contactar con KBY-AI para conocer los terminos de uso comercial y las restricciones de redistribucion.
- La imagen Docker puede incluir dependencias no auditables, lo que supone un riesgo de seguridad en entornos corporativos estrictos.

## Enlaces

- HuggingFace: https://huggingface.co/kby-ai/face-recognition-docker
- Repositorio GitHub: https://github.com/kby-ai/FaceRecognition-Docker
- Imagen Docker Hub: https://hub.docker.com/r/kbyai/face-recognition
- Documentacion en DeepWiki: https://deepwiki.com/kby-ai/FaceRecognition-Docker
- Informe NIST FRVT 1:1: https://pages.nist.gov/frvt/html/frvt11.html
- Repositorio de productos KBY-AI: https://github.com/kby-ai/Product
