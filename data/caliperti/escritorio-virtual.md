# Caliperti/escritorio-virtual

## Resumen

Caliperti/escritorio-virtual es un repositorio de HuggingFace que contiene el código de una aplicación web de oficina virtual 2D, similar a Gather o Kumospace, desarrollada por el usuario Caliperti. No se trata de un modelo de inteligencia artificial, sino de una aplicación completa de software libre (sin licencia especificada) que permite a múltiples usuarios moverse por un mapa, activar audio y vídeo por proximidad, compartir pantalla y editar el espacio en tiempo real. El proyecto está construido con un backend en FastAPI y WebSocket, un frontend en JavaScript puro sobre canvas 2D, y utiliza WebRTC para la transmisión de medios entre navegadores, sin depender de servicios externos ni de Node.js. La relevancia actual reside en que ofrece una alternativa autohospedable y ligera a herramientas comerciales de reuniones virtuales espaciales, con una implementación sencilla y sin necesidad de infraestructura compleja.

El repositorio fue creado el 26 de agosto de 2026 y no ha recibido descargas ni "me gusta" en HuggingFace. No se especifica licencia, pipeline ni idiomas soportados en la ficha del modelo. La aplicación está pensada para ejecutarse en un servidor Python 3.9 y un navegador moderno, y se distribuye como código fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion web cliente-servidor: backend FastAPI + WebSocket, frontend canvas 2D en JavaScript puro, comunicacion de medios via WebRTC |
| Parametros totales | no disponible (no es un modelo de IA) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el codigo y la documentacion estan en portugues) |
| Licencia | no disponible (se menciona que los assets de Kenney son CC0, pero la licencia del proyecto no se indica) |
| Formato de pesos | no disponible (codigo fuente Python y JavaScript) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una aplicacion de software. Su arquitectura se divide en un backend en Python con FastAPI que gestiona las salas y el estado del mapa (almacenado en `backend/mapa.json`), y un frontend en JavaScript puro que dibuja el mundo 2D en un canvas y maneja las interacciones de los usuarios. La comunicacion de audio y video se realiza directamente entre navegadores mediante WebRTC, mientras que el servidor solo transmite las senales de conexion. No hay entrenamiento de redes neuronales ni datasets implicados; el sistema se basa en reglas de posicionamiento y zonas de audio definidas en `mapa.py` y `app.js`.

La innovacion principal reside en su simplicidad: no requiere Node.js ni servicios externos, se ejecuta con Python 3.9 y un navegador moderno, y permite editar el mapa en tiempo real con un sistema de validacion por parte del servidor. El repositorio incluye un editor de mapas integrado y una planta predefinida con nueve salas y alrededor de 236 objetos colocados.

## Capacidades

- Gestion de reuniones virtuales en un mapa 2D con avatares que se mueven con teclado (WASD o flechas).
- Activacion automatica de camara y microfono cuando dos avatares se acercan; desactivacion al alejarse.
- Salas cerradas (con icono de candado) que limitan el audio solo a los participantes dentro de la sala.
- Compartir pantalla mediante `replaceTrack`, sin interrumpir las conversaciones en curso.
- Editor de mapa en tiempo real: colocar, mover y eliminar moviles, pintar suelos, construir paredes, crear y redimensionar salas, renombrar salas, cambiar colores, activar o desactivar audio cerrado, definir punto de entrada.
- Sistema de deshacer (ultimos 40 pasos) y ampliacion del mapa (agregar columnas y filas).
- Personalizacion de avatares en tiempo real: recoloreado de camisa y cabello en el navegador (6 personajes, 10 colores de camisa, 8 de cabello).
- Chat de texto con soporte para Enter y Esc.
- Visualizacion de video en pantalla completa al hacer clic en una miniatura.
- Soporte para multiples usuarios simultaneos, sin registro ni cuentas (para publicacion se ofrece un tunel de Cloudflare).

## Casos de uso

- **Reuniones de equipo informales**: un grupo de trabajadores puede crear un espacio virtual donde cada uno se mueve por el mapa y la comunicacion se activa al acercarse, replicando el ambiente de una oficina fisica.
- **Sesiones de coworking**: salas abiertas permiten escuchar a todos los presentes dentro de un radio, mientras que salas cerradas facilitan conversaciones privadas en grupos.
- **Presentaciones y charlas**: el usuario puede compartir su pantalla y los asistentes pueden acercarse para ver la presentacion en pantalla completa, sin interrumpir otras conversaciones.
- **Formacion y educacion**: se puede usar como aula virtual, con el profesor explicando en una sala cerrada y los alumnos entrando y saliendo; el editor de mapa permite crear diferentes areas tematicas.
- **Eventos sociales**: una alternativa para encuentros sociales online, con salas de juegos, cafe y lounge, donde los usuarios interactuan segun su posicion.
- **Prototipo de entorno virtual**: el codigo es una base para experimentar con interfaces de colaboracion espacial, ya que es facilmente modificable y autohospedable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no existen metricas de rendimiento como MMLU, HumanEval o GSM8K. El rendimiento de la aplicacion depende de la capacidad del servidor para manejar los WebSocket y de los navegadores de los clientes para el procesamiento de canvas y WebRTC.

## Requisitos de hardware

- **Servidor**: cualquier maquina capaz de ejecutar Python 3.9 y FastAPI; un VPS de baja especificacion (1 vCPU, 1 GB RAM) es suficiente para decenas de usuarios concurrentes, ya que el servidor solo gestiona las senales y el estado del mapa.
- **Clientes**: navegador moderno (Chrome, Firefox, Edge) con soporte para WebRTC y canvas 2D; se recomienda una conexion de red estable para la transmision de audio/video.
- **VRAM**: no aplica, no hay inferencia de modelos.
- **Despliegue**: se puede ejecutar localmente con `./iniciar.sh` o publicar con un tunel de Cloudflare (`./publicar.sh`). Para uso en produccion, se podria desplegar en un servidor con un proxy inverso como Nginx para gestionar SSL.
- **Latencia**: la latencia del audio/video depende de la red y de la calidad de la conexion WebRTC; el servidor WebSocket introduce una latencia minima para los mensajes de estado.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, por lo que no se pueden comparar parametros de modelo, contexto, rendimiento ni licencia con otros modelos. En el ambito de aplicaciones de escritorio virtual, existen alternativas comerciales como Gather, Kumospace o WorkAdventure, pero no se dispone de datos de comparacion en la informacion proporcionada.

## Limitaciones y advertencias

- **No es un modelo de IA**: no ofrece capacidades de generacion de texto, razonamiento, codigo, etc. Solo es una aplicacion de comunicacion espacial.
- **Persistencia efimera**: el estado de las salas se mantiene en memoria; si el servidor se reinicia, se pierden los cambios no guardados en el mapa (solo se guarda el mapa en `backend/mapa.json`).
- **Sin autenticacion**: no hay control de usuarios; cualquiera con acceso al servidor puede entrar y editar el mapa.
- **Idioma de la interfaz**: el codigo y la documentacion estan en portugues; no se ha traducido a otros idiomas.
- **Licencia no especificada**: aunque los assets de Kenney son de dominio publico (CC0), la licencia del codigo no se indica, por lo que su uso comercial puede estar sujeto a interpretacion.
- **Limitaciones de escalabilidad**: al ser una solucion casera, puede tener problemas de rendimiento con muchos usuarios simultaneos, especialmente en la sincronizacion del mapa en tiempo real.
- **Riesgo de privacidad**: la publicacion con Cloudflare expone la direccion publica; se debe usar solo en entornos de confianza.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/Caliperti/escritorio-virtual)
- No se encontraron otros enlaces relevantes en la busqueda web. La aplicacion no tiene pagina oficial ni documentacion externa.
