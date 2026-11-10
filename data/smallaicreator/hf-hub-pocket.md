# SmallAICreator/HF-Hub-Pocket

## Resumen

HF Hub Pocket no es un modelo de lenguaje, sino una aplicación cliente nativa para Android del Hugging Face Hub, desarrollada por el usuario SmallAICreator bajo la marca UltraLabs. El repositorio, publicado en Hugging Face con el identificador `SmallAICreator/HF-Hub-Pocket`, contiene el APK de la aplicación (versión 1.1, aproximadamente 3 MB) y no incluye pesos de ningún modelo. Su función es permitir explorar modelos, datasets y Spaces, leer model cards y descargar archivos GGUF directamente al teléfono.

La aplicación está construida con Kotlin, Jetpack Compose y Material 3, es compatible con Android 10 o superior (minSdk 29, targetSdk 36) y se distribuye como APK instalable manualmente. Incluye buscador en vivo con filtros por tarea y por formato GGUF, visor de model cards renderizadas, navegación de archivos con previsualización de código y configuración, y un gestor de descargas basado en el Download Manager de Android que reanuda transferencias interrumpidas.

Es relevante en el contexto de la inferencia local en dispositivos móviles: la app incorpora una recomendación de cuantización según el tamaño del modelo (Q8_0 por debajo de 1.5B, Q5_K_M entre 1.5B y 4B, Q4_K_M por encima) y permite ejecutar Spaces en pantalla completa con subida de imágenes y audio. No obstante, al tratarse de una utilidad y no de un modelo, las secciones de arquitectura, benchmarks y requisitos de hardware de esta ficha se refieren a la aplicación, no a un modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (aplicación Android nativa; no es un modelo) |
| Parámetros totales | no disponible (no aplica) |
| Parámetros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (la app recomienda Q8_0, Q5_K_M y Q4_K_M para modelos GGUF de terceros) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene un APK; la app descarga GGUF de otros repos) |

## Arquitectura y entrenamiento

El artefacto publicado es una aplicación Android escrita en Kotlin con Jetpack Compose y Material 3, empaquetada bajo el paquete `com.ultralabs.hubpocket`. No hay entrenamiento de ningún tipo: el repositorio aloja el binario `HFHubPocket-1.1.apk` de unos 3 MB y capturas de pantalla. La app consume la API pública de `huggingface.co` para listar tendencias, buscar repositorios, leer metadatos (parámetros, arquitectura, longitud de contexto, licencia, librería, tamaño e idiomas) y descargar ficheros.

Entre las decisiones técnicas destacables están el uso del Download Manager del sistema para que las descargas continúen en segundo plano y se reanuden tras cortes, la comprobación de espacio libre antes de iniciar transferencias grandes, el renderizado propio de model cards con tablas, código e imágenes, y la integración de Material You para adaptar la paleta al fondo de pantalla del dispositivo. El acceso autenticado es opcional y basta con un token de solo lectura para ver repositorios privados o descargar modelos con acceso restringido.

## Capacidades

- Exploración de tendencias en modelos, datasets y Spaces, con refresco por gesto de arrastre.
- Búsqueda en vivo con ordenación por tendencia, likes, descargas, actualización reciente o novedad.
- Filtros por formato GGUF y por tarea: generación de texto, image-text-to-text, text-to-image, reconocimiento de voz y text-to-speech.
- Visualización de fichas de repositorio con metadatos estructurados y enlaces al modelo base.
- Lectura completa de model cards y dataset cards con tablas, bloques de código e imágenes.
- Navegación de carpetas y previsualización de archivos de configuración y código.
- Selección de cuantización GGUF con recomendación automática según el tamaño del modelo.
- Descargas en segundo plano con anillos de progreso, comprobación de espacio y reanudación.
- Ejecución de Spaces en pantalla completa dentro de la app, con subida de imágenes y audio.
- Biblioteca local de repositorios guardados y gestión de descargas (abrir, compartir, borrar).
- Inicio de sesión opcional con token de Hugging Face para repos privados y modelos con gating.
- Apertura directa de enlaces `huggingface.co` compartidos hacia la app.
- Sin anuncios, analítica ni rastreadores; solo se comunica con `huggingface.co` y los Spaces abiertos.

## Casos de uso

- Consulta rápida de modelos desde el móvil: un desarrollador puede revisar tendencias, parámetros y longitud de contexto de un modelo antes de decidir si lo integra, sin abrir el navegador de escritorio.
- Descarga de GGUF para inferencia local: la app identifica las cuantizaciones disponibles de un repositorio, recomienda una según el tamaño y guarda el archivo en `Download/HubPocket/<repo>` para cargarlo después en llama.cpp u otra herramienta móvil.
- Evaluación de licencias y compatibilidad: la tarjeta de detalles muestra licencia, librería e idiomas, lo que permite descartar modelos con restricciones antes de invertir tiempo en pruebas.
- Lectura de model cards en tránsito: el renderizado nativo de tablas y código facilita revisar especificaciones y ejemplos de uso sin depender de una conexión de escritorio.
- Prueba de Spaces de terceros: abrir demos de image-text-to-text o text-to-image a pantalla completa y subir imágenes o audio desde el propio dispositivo.
- Seguimiento de repositorios propios: con un token de solo lectura, el usuario accede a sus repositorios privados y a modelos con gating ya aceptados.
- Gestión de descargas en redes inestables: la reanudación tras cortes y la comprobación de espacio libre evitan transferencias fallidas de archivos de varios GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Dispositivo Android 10 o superior (minSdk 29, targetSdk 36).
- APK de aproximadamente 3 MB; el espacio adicional depende de los GGUF descargados.
- No requiere GPU dedicada ni aceleradores; la inferencia no la realiza la app, sino las herramientas externas con las que se carguen los GGUF.
- El espacio libre en almacenamiento es el factor limitante principal: un GGUF en Q4_K_M de un modelo de 7B ronda los 4 GB, y la app avisa antes de iniciar la descarga.
- Despliegue: instalación manual del APK habilitando la instalación de aplicaciones desconocidas; no está disponible en Google Play según la información proporcionada.
- Latencia y throughput: no disponibles (no aplica a la app; dependen del runtime de inferencia empleado).

## Comparativa con modelos similares

| Herramienta | Tipo | Plataforma | Licencia | Descarga de GGUF | Ejecución de Spaces |
|---|---|---|---|---|---|
| HF Hub Pocket | Cliente no oficial del Hub | Android 10+ | no disponible | Sí, con recomendación de cuantización | Sí, a pantalla completa |
| Web oficial de Hugging Face | Cliente web | Navegador | No aplica | Sí, sin recomendación integrada | Sí, en pestaña del navegador |
| Aplicación oficial de Hugging Face | Cliente oficial | Android/iOS | No aplica | no disponible en la información | no disponible en la información |

No se dispone de datos de rendimiento ni de licencia para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni imágenes; cualquier expectativa en ese sentido es incorrecta.
- Cliente no oficial: el autor declara que no está afiliado ni respaldado por Hugging Face, lo que puede implicar riesgo de rotura si la API cambia.
- Licencia no especificada en el repositorio: no se puede confirmar el uso comercial, la redistribución del APK ni la modificación del código.
- Sin datos de idiomas soportados en la interfaz; la model card está redactada en inglés.
- Dependencia total de la disponibilidad y del ritmo de cambios de `huggingface.co` y de los Spaces de terceros.
- El token de acceso se almacena en el dispositivo; aunque el autor afirma que solo se envía a `huggingface.co`, conviene usar tokens de solo lectura y revocarlos si se pierde el teléfono.
- La instalación fuera de tiendas oficiales requiere habilitar la instalación de orígenes desconocidos, lo que aumenta la superficie de riesgo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni historial de mantenimiento.
- No se han publicado benchmarks ni métricas de rendimiento de la aplicación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SmallAICreator/HF-Hub-Pocket
- Descarga directa del APK: https://huggingface.co/SmallAICreator/HF-Hub-Pocket/resolve/main/HFHubPocket-1.1.apk?download=true
- Perfil del autor: https://huggingface.co/SmallAICreator
- Hugging Face Hub: https://huggingface.co
