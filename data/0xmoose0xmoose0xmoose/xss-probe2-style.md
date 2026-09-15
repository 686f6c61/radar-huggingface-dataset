# 0xmoose0xmoose0xmoose/xss-probe2-style

## Resumen

El repositorio identificado como `0xmoose0xmoose0xmoose/xss-probe2-style` no es un modelo de inteligencia artificial. Se trata de una model card de HuggingFace cuyo contenido es una bateria de 25 pruebas de inyeccion de estilos en linea (inline styles), disenada para comprobar que vectores de carga remota sobreviven al saneado del renderizador de Markdown/HTML de la plataforma. El titulo del propio README lo declara explicitamente: "Inline style surface probe (post `` fix)", es decir, una sonda posterior a un parche de la etiqueta ``.

El autor es el usuario `0xmoose0xmoose0xmoose`, con cero descargas y cero likes en el momento de la consulta, y sin pipeline, licencia ni idiomas declarados. El contenido consiste en fragmentos HTML con `div`, `svg`, `ul`, `table` y `a` que intentan forzar peticiones salientes a un dominio externo (`rce.lc`) mediante `background-image`, `mask-image`, `border-image`, `list-style-image`, `filter`, `cursor`, `font-family`, `backdrop-filter`, `clip-path`, `image-set`, variables CSS y atributos como `background` en celdas de tabla. El dominio utilizado en las URL (`rce.lc`) es revelador del objetivo de la prueba: demostrar ejecucion remota de contenido o exfiltracion mediante carga de recursos.

Desde la perspectiva de un catalogo de modelos, el artefacto es irrelevante: no tiene pesos, no tiene arquitectura, no genera texto y no puede evaluarse con benchmarks. Su unico interes es de seguridad: documenta una superficie de ataque conocida contra visores de model cards y otros renderizadores de HTML embebido, e incluye tecnicas de superposicion (`position:fixed` con `z-index:2147483647`, `100vw`/`100vh`) y una maqueta de phishing con formulario de inicio de sesion falso. Se recomienda tratarlo como muestra maliciosa de analisis, nunca como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un documento HTML de prueba) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos; el unico artefacto es un README en Markdown con HTML embebido) |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| ID en HuggingFace | 0xmoose0xmoose0xmoose/xss-probe2-style |
| Autor | 0xmoose0xmoose0xmoose |
| Etiquetas declaradas | region:us |
| Pipeline | no disponible |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-15T01:35:53Z |
| Fecha de actualizacion | 2026-09-15T01:35:54Z (un segundo despues de la creacion) |
| Numero de vectores de prueba | 25 (etiquetados B1 a B25) |
| Dominio externo referenciado | rce.lc (mas de 20 URL distintas) |
| Manjeadores de eventos en linea | si (`onmouseover="alert(1)"` en la prueba B21) |

## Arquitectura y entrenamiento

No existe arquitectura ni entrenamiento. El repositorio no contiene ficheros de pesos, configuracion de modelo, tokenizador ni codigo de inferencia. Lo unico que contiene es texto Markdown con HTML y CSS en linea, presumiblemente publicado para verificar si el saneador de HuggingFace elimina, neutraliza o deja pasar determinadas propiedades CSS capaces de disparar peticiones de red. La denominacion "post `` fix" sugiere que una iteracion anterior del ataque usaba la etiqueta `` y que, tras su bloqueo, esta segunda version traslada los vectores a atributos `style=` individuales.

Las tecnicas ensayadas se agrupan en varias familias: carga de imagenes de fondo (`background-image`, `background` abreviado, `image-set`), imagenes de mascara (`-webkit-mask-image`, `mask-image`), imagenes de borde (`border-image`), imagenes de vineta (`list-style-image`), filtros SVG remotos (`filter:url()`, `backdrop-filter:url()`), cursores remotos (`cursor:url()`), fuentes remotas (`font-family` con URL), recorte (`clip-path:url()`), indirecciones mediante variables CSS (`--u:url(...)`) y entidades HTML dentro de la URL. Tambien se prueban atributos HTML heredados (`background` en un `<td>`), escapes incompletos en la URL, la combinacion con atributos `onmouseover` y `data-*`, y las propiedades de posicionamiento necesarias para tapar la interfaz legitima.

## Capacidades

- No genera texto, no razona, no traduce ni procesa lenguaje natural.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- No dispone de modo de pensamiento, vision, audio ni multimodalidad.
- Lo unico que "hace" es intentar que un renderizador emita peticiones HTTP salientes a `rce.lc` al mostrar la pagina, y superponer elementos sobre la interfaz del visor.
- Incluye una maqueta de pagina de inicio de sesion falsa (prueba B25) con el texto "Sign in to Hugging Face" y una imagen de logo remota.

## Casos de uso

Los casos siguientes se refieren exclusivamente al uso del repositorio como corpus de pruebas de seguridad. Ninguno implica ejecutar el modelo, porque no existe tal modelo.

- Pruebas de regresion de saneadores HTML: un equipo que mantiene un renderizador de Markdown puede usar los 25 vectores como conjunto de casos de prueba para verificar que propiedades como `mask-image`, `backdrop-filter:url()` o `clip-path:url()` no permiten peticiones salientes tras un cambio en la lista blanca de atributos.
- Auditoria de superficies de carga remota: los vectores B1 a B20 permiten comprobar de forma sistematica que propiedades CSS disparan peticiones de red en un motor de render dado, lo que ayuda a decidir que propiedades hay que prohibir en la fase de saneado.
- Verificacion de politicas de Content Security Policy: si el visor aplica una CSP con `img-src` restringido, el corpus sirve para confirmar que las rutas `url()` de imagen, filtro, mascara y cursor quedan bloqueadas por la directiva adecuada.
- Deteccion de superposicion de interfaz (clickjacking/overlay): las pruebas B8, B9, B10, B11 y B25 permiten validar que el visor neutraliza `position:fixed` con `z-index` maximo, `100vw`/`100vh` y desplazamientos fuera de pantalla (`top:-10000px`), evitando que un contenido tape botones legitimos de la plataforma.
- Formacion y concienciacion en seguridad: el conjunto es util como ejemplo didactico de catalogo de vectores de inyeccion de estilos, incluyendo escape de comillas, entidades HTML, variables CSS y atributos heredados.
- Analisis de deteccion y respuesta (blue team): el dominio `rce.lc` y los patrones de URL (`card2-*`) pueden incorporarse como indicadores en reglas de deteccion de contenido malicioso en repositorios de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene pesos ni artefactos evaluables, por lo que no existe MMLU, HumanEval, GSM8K ni ninguna otra metrica aplicable. Tampoco se documenta en el README el resultado de la propia sonda (no se indica que vectores fueron bloqueados y cuales pasaron).

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable: el artefacto no es un modelo de lenguaje, vision ni audio, y no comparte dimensiones de comparacion (parametros, contexto, licencia, rendimiento) con ningun modelo publicado. Como mucho podria compararse con otros repositorios de pruebas de saneado HTML, pero no se ha proporcionado informacion sobre ninguno de ellos.

## Limitaciones y advertencias

- No es un modelo de IA. Cualquier intento de cargarlo con `transformers`, `vLLM`, `llama.cpp` u Ollama fallara: no hay ficheros de pesos.
- Contenido potencialmente malicioso. El README incluye mas de 20 URL apuntando al dominio `rce.lc`, un manejador de evento en linea (`onmouseover="alert(1)"`) y una maqueta de inicio de sesion falsa. Debe tratarse como muestra de analisis, no como contenido a renderizar sin saneado.
- Riesgo de phishing. Los vectores B11 y B25 simulan formularios y pantallas de acceso con el texto "Sign in to Hugging Face", lo que puede confundir a un usuario que visualice la model card sin proteccion.
- Riesgo de exfiltracion por canal de recursos. Aunque el CSS no permite leer el DOM directamente, la carga de una URL controlada por el atacante revela la IP del visitante, el `User-Agent`, la hora de visualizacion y confirma que el vector de inyeccion funciona.
- Licencia no declarada. Sin licencia explicita no hay autorizacion de uso, reproduccion ni redistribucion del contenido.
- Cero traccion. Con 0 descargas y 0 likes, y creado y actualizado con un segundo de diferencia, presenta el patron tipico de un repositorio de prueba automatizada o de publicacion desechable.
- Fechas incoherentes con el contexto de evaluacion. La fecha de creacion declarada (2026-09-15) es futura respecto a la mayoria de referencias habituales; conviene verificar la marca de tiempo real antes de extraer conclusiones temporales.
- Los resultados de busqueda web asociados (paginas de Google Translate) no guardan relacion con el repositorio y no aportan informacion tecnica verificable; no deben citarse como fuente.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/0xmoose0xmoose0xmoose/xss-probe2-style
- Paper: no disponible
- Blog tecnico del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Resultados de busqueda web proporcionados (no relacionados con el repositorio, solo traduccion automatica):
  - https://translate.google.com.pk/
  - https://translate.google.com.pk/m
  - https://translate.google.com.pk/details
- Dominio referenciado en los vectores de prueba (listado unicamente a efectos de analisis y bloqueo): `rce.lc`
