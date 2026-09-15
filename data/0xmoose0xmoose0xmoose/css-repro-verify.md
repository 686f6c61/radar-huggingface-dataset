# 0xmoose0xmoose0xmoose/css-repro-verify

## Resumen

El repositorio identificado como `0xmoose0xmoose0xmoose/css-repro-verify` no es un modelo de inteligencia artificial: no contiene pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia. Se trata de un repositorio publicado en HuggingFace cuyo unico contenido es una model card que actua como prueba de concepto (PoC) de seguridad ofensiva. Su titulo, "Security notice", y el texto que la acompana indican que demuestra inyeccion de CSS plano, es decir, sin ejecucion de JavaScript, renderizada directamente desde la tarjeta del repositorio.

La PoC enumera y ejemplifica distintas superficies de carga de recursos remotos mediante CSS en el contexto de una model card: `background-image: url()`, `list-style-image: url()`, `-webkit-mask-image` y `mask-image`, `border-image`, `background-image` sobre un elemento SVG y el atributo heredado `background` de una celda de tabla. Todos los recursos apuntan a un mismo dominio externo, con el objetivo declarado de verificar que las peticiones HTTP se disparan al visualizar la pagina. Ademas, la tarjeta incluye una superposicion con `position: fixed` y `z-index` maximo que simula un formulario de inicio de sesion con el mensaje "Session expired", un patron clasico de phishing por sustitucion de interfaz.

Es relevante en el contexto actual de seguridad de plataformas de modelos porque ilustra una superficie de ataque que no depende de ejecucion de codigo: la carga automatica de recursos de terceros desde contenido generado por usuarios en HuggingFace. Esto permite exfiltracion de metadatos de visita, confirmacion de visualizacion (beaconing), seguimiento de usuarios y construccion de interfaces falsas de recogida de credenciales. No hay ningun dato tecnico de modelo que reportar: no se dispone de parametros, contexto, licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| ID del repositorio | 0xmoose0xmoose0xmoose/css-repro-verify |
| Autor | 0xmoose0xmoose0xmoose |
| Pipeline declarado | no disponible |
| Etiquetas | region:us |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-15T02:00:34.000Z |
| Fecha de actualizacion | 2026-09-15T02:00:35.000Z (1 segundo despues) |
| URL | https://huggingface.co/0xmoose0xmoose0xmoose/css-repro-verify |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El "artefacto" es un documento Markdown con atributos `style` en linea y etiquetas HTML/SVG embebidas, interpretado por el renderizador de model cards de HuggingFace. Las tecnicas empleadas son puramente declarativas: propiedades CSS que aceptan una funcion `url()`, el atributo `background` de HTML heredado, y una capa de posicionamiento fijo con `inset: 0` y `z-index: 2147483647` para cubrir la interfaz anfitriona. El unico "dato de entrenamiento" reseñable es la enumeracion exhaustiva de vectores de carga remota por CSS, presentada a modo de lista de comprobacion para verificar que el saneamiento de la plataforma bloquea cada uno de ellos (de ahi el sufijo `-verify`).

La innovacion tecnica, en terminos de investigacion de seguridad, es doble. Por un lado, demuestra que el filtrado de `
