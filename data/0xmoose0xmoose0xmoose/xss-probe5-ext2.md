# 0xmoose0xmoose0xmoose/xss-probe5-ext2

## Resumen

El identificador `0xmoose0xmoose0xmoose/xss-probe5-ext2` corresponde a un repositorio alojado en HuggingFace que no contiene un modelo de inteligencia artificial. Su model card, titulada "Hub sanitizer extended battery (part 2)", es una lista numerada de 33 vectores de ataque XSS (etiquetados de H25 a H57) destinados a probar la solidez de sanitizadores de HTML. No hay pesos, tokenizador, configuracion de arquitectura ni artefactos de inferencia: el unico contenido documentado es Markdown con cargas utiles de prueba.

El proposito inferido del repositorio es servir como bateria de regresion para comprobar si un sanitizador (por ejemplo, el usado por el propio Hub, o cualquier libreria de limpieza de HTML) elimina o neutraliza correctamente vectores poco habituales. Los vectores cubren etiquetas HTML raramente contempladas (`<listing>`, `<noembed>`, `<noframes>`, `<title>`, `<template>`), manejadores de eventos con capitalizacion mixta (`onToggle`, `onFocus`, `OnLoad`), esquemas `javascript:` ofuscados con entidades y caracteres de control, mXSS mediante comentarios anidados, y vectores en SVG, MathML y CSS declarativo.

Es relevante ahora unicamente como material de investigacion en seguridad aplicada al renderizado de contenido generado por usuarios, no como modelo desplegable. Cualquier ficha tecnica de modelo (parametros, contexto, cuantizacion, licencia) resulta inaplicable: no existe informacion al respecto en los datos disponibles. Ademas, el repositorio parece formar parte de una serie de sondas ("probe", "battery", "part 2"), lo que sugiere un uso experimental y efimero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable (no es un modelo de IA; es un listado de vectores XSS en Markdown) |
| Parametros totales | no disponible (no existen pesos) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no hay pesos que cuantizar) |
| Idiomas soportados | no disponible (el contenido esta en ingles tecnico de seguridad) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay safetensors, GGUF ni ningun artefacto binario declarado) |
| Pipeline declarado | no disponible |
| Autor | 0xmoose0xmoose0xmoose |
| Fecha de creacion | 2026-09-15T01:44:16.000Z |
| Fecha de actualizacion | 2026-09-15T01:44:17.000Z (un segundo despues de la creacion) |
| Descargas | 0 |
| Likes | 0 |
| Etiquetas | region:us |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado al repositorio. El contenido es una coleccion de cadenas HTML/SVG/MathML/CSS organizadas como casos de prueba, sin dataset, sin tokens de entrenamiento, sin fases de ajuste supervisado, RLHF o DPO, y sin innovaciones tecnicas de modelado.

El unico "diseno" observable es taxonomico: los vectores se agrupan por superficie de ataque. H25-H29 explotan etiquetas de contenedor poco frecuentes; H30-H34 prueban manejadores de eventos con capitalizacion mixta para evadir comparaciones de cadenas sensibles a mayusculas; H35-H36 y H50 varian el entrecomillado y el uso de entidades numericas; H37-H39 inyectan tabulador, salto de linea y retorno de carro dentro del esquema `javascript:`; H40 aborda mXSS por comentario anidado; H41-H49 cubren SVG (`foreignObject`, `set`, `script href` con `data:`), MathML (`href`, `annotation-xml`) y atributos heredados (`background`); H51-H57 atacan CSS declarativo (`expression`, `behavior`, `url(javascript:)`, `url(data:image/svg+xml,...)`) y `data:` en `object` e `img`.

## Capacidades

- No genera texto ni realiza inferencia: no es un modelo de lenguaje, vision ni multimodal.
- Proporciona 33 vectores XSS numerados (H25 a H57) con sintaxis exacta, listos para copiar en un banco de pruebas de sanitizacion.
- Cubre evasion por capitalizacion mixta en manejadores de eventos: `onToggle`, `onFocus`, `OnLoad`.
- Cubre evasion sintactica en atributos: valores sin comillas (`onerror=alert(1)`) y con comillas invertidas (backticks).
- Cubre ofuscacion de esquemas URI mediante entidades numericas y caracteres de control: `jav&#x09;ascript:`, `jav&#x0A;ascript:`, `jav&#x0D;ascript:`.
- Cubre mXSS por comentario HTML anidado con carga util dentro.
- Cubre contextos SVG y MathML: `foreignObject` con `iframe`, `animate`/`set` con `onbegin`, `script` con `href` en `data:text/javascript`.
- Cubre CSS declarativo y CSS embebido en atributos `style`, incluidos `expression()`, `behavior:url()` y `url()` con `javascript:` o `data:image/svg+xml`.
- Cubre vectores de exfiltracion mediante el atributo `ping` de un enlace (destino declarado: `https://rce.lc/h44-ping`).
- No declara soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, por no ser aplicable.

## Casos de uso

- Pruebas de regresion de sanitizadores HTML: integrar los 33 vectores en la bateria de tests de una libreria de limpieza (por ejemplo, un sanitizador propio o el del Hub) y verificar que ninguna carga util ejecuta JavaScript al renderizarse en un navegador instrumentado.
- Validacion de la Content Security Policy: servir cada vector bajo la CSP de produccion y comprobar que `script-src`, `object-src` y `style-src` bloquean la ejecucion incluso si el saneado falla; los vectores H48 y H57 con `data:text/javascript` y `data:image/svg+xml` son especialmente utiles aqui.
- Evaluacion de parsers HTML propietarios: los casos H25-H29 (`listing`, `noembed`, `noframes`, `title`, `template`) permiten detectar si un parser trata estas etiquetas como texto o como marcado, que es el origen habitual de discrepancias entre el sanitizador y el navegador.
- Entrenamiento y evaluacion de clasificadores de deteccion de XSS: usar las cadenas como conjunto de ejemplos positivos dificiles, comparando la tasa de deteccion frente a un corpus de HTML benigno; el etiquetado `Hnn` facilita el seguimiento por vector.
- Auditoria de pipelines de Markdown a HTML: los repositorios de modelos y documentacion suelen renderizar Markdown generado por terceros, de modo que H40 (mXSS por comentario anidado) y H35-H36 prueban el punto exacto donde el renderizador reconstruye el HTML.
- Hardening de reglas WAF y filtros de entrada: convertir los vectores en firmas y medir falsos positivos sobre trafico legitimo, prestando atencion a las variantes con entidades y caracteres de control que suelen escapar a las expresiones regulares ingenuas.
- Investigacion de comportamiento de navegador: comprobar que navegadores siguen disparando `onbegin` en `<animate>` o `onerror` en `<track>` dentro de `<video>`, para calibrar la severidad real de cada vector antes de priorizar correcciones.
- Formacion y divulgacion en seguridad: el listado sirve como catalogo didactico de familias de evasion, siempre ejecutado en un entorno aislado y nunca contra sistemas de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no indica que sanitizadores, navegadores o versiones se probaron, ni el resultado esperado u observado de cada vector. Las etiquetas `H25`-`H57` sugieren que existe una parte 1 con los casos H1-H24, pero no se aporta ningun dato de resultados, tasas de evasion ni comparaciones.

## Comparativa con modelos similares

No hay modelos de IA comparables, porque el repositorio no contiene un modelo. A continuacion se comparan, en terminos cualitativos, recursos de naturaleza similar (corpus de pruebas de seguridad web), sin datos cuantitativos porque no se dispone de ellos:

| Recurso alternativo | Naturaleza | Relacion con este repositorio |
|---|---|---|
| Suites de pruebas de librerias de sanitizacion (por ejemplo, los conjuntos de test publicos de proyectos de saneado HTML) | Conjuntos de casos con resultado esperado | Mismo proposito, pero este repositorio no publica resultados esperados ni veredictos |
| Listas publicas de evasion de filtros XSS mantenidas por la comunidad de seguridad | Catalogos de cargas utiles | Solapamiento en familias de ataque; aqui el foco esta en etiquetas y contextos poco comunes y en mXSS |
| Herramientas de escaneo dinamico de aplicaciones web | Software de analisis | No es una herramienta ejecutable, es documentacion estatica |
| Modelos de lenguaje especializados en deteccion de vulnerabilidades | Modelos de IA con pesos | No comparables: este repositorio no tiene parametros, entrenamiento ni licencia declarada |

## Limitaciones y advertencias

- No es un modelo: no se puede cargar con `transformers`, `vLLM`, `llama.cpp` ni ninguna otra herramienta de inferencia.
- Ausencia total de licencia declarada: no hay base juridica explicita para reutilizar, redistribuir ni incorporar el contenido a un producto, ni siquiera para uso no comercial.
- Contenido ofensivo por diseno: los vectores ejecutan `alert(1)` y en un caso intentan contacto con un host externo (`https://rce.lc/h44-ping`); no deben renderizarse en un navegador sin aislamiento.
- Riesgo de falsos negativos si se reutilizan de forma literal: al ser una lista fija y corta, un sanitizador puede pasar la bateria y seguir siendo vulnerable a variantes no incluidas; no sustituye a un analisis sistematico.
- Sin resultados esperados ni versiones de referencia: no se especifica que navegador ni que sanitizador deberia bloquear cada caso, de modo que la interpretacion de un fallo queda al criterio del evaluador.
- Sin idiomas, contexto ni metadatos de modelo: las etiquetas se limitan a `region:us`.
- Anomalia temporal: las fechas de creacion y actualizacion son futuras (2026-09-15) y distan un segundo entre si, lo que apunta a un repositorio de prueba generado automaticamente.
- Los vectores basados en caracteristicas obsoletas (por ejemplo, `expression()` de CSS o `behavior:url()`) solo son relevantes en motores de renderizado antiguos; su valor actual es historico o de compatibilidad.
- Valor comunitario practicamente nulo en el momento de la consulta: 0 descargas y 0 likes.
- No hay informacion sobre sesgos, alucinacion ni rendimiento porque no hay modelo subyacente al que atribuir esas propiedades.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/0xmoose0xmoose0xmoose/xss-probe5-ext2
- Papers, blogs, repositorios de codigo o demos asociados: no disponible en la informacion proporcionada.
- Referencia a "part 1" de la bateria de sondas: no disponible (mencionada implicitamente en el titulo, sin enlace).
