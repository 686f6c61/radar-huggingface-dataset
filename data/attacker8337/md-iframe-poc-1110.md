# attacker8337/md-iframe-poc-1110

## Resumen

El repositorio `attacker8337/md-iframe-poc-1110` no contiene un modelo de aprendizaje automatico. Se trata de una prueba de concepto (PoC) de inyeccion de HTML/JavaScript publicada en Hugging Face bajo la forma de una model card, cuyo contenido son vectores de ataque orientados a ejecutar codigo en el navegador de quien visualice el README renderizado. El autor emplea la etiqueta `license: mit` y el identificador `attacker8337`, y el repositorio no declara pipeline, idiomas ni artefactos de pesos.

La model card incluye ocho variantes etiquetadas de A a H que prueban distintos mecanismos de ejecucion: `iframe` con esquema `javascript:`, `iframe srcdoc`, `iframe` apuntando a un fichero remoto `evil.js`, `iframe` con `data:text/html`, `object data`, `embed src`, `math/mtext` con `img onerror` y `svg use` con carga de un SVG en `data:` que contiene un `script`. El objetivo declarado por el nombre del repositorio ("md-iframe-poc") es comprobar si el renderizador de model cards de Hugging Face sanea correctamente estos vectores.

Su relevancia no es como modelo sino como caso de estudio de seguridad: ilustra la superficie de ataque de los README renderizados en plataformas de modelos y la necesidad de sanitizacion estricta (CSP, eliminacion de `iframe`, `object`, `embed`, `srcdoc`, esquemas `javascript:` y `data:`) en cualquier visor de Markdown. No hay arquitectura, parametros ni contexto que evaluar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de ML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio solo contiene una model card con HTML/JS de prueba) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene pesos, tokenizador, configuracion de transformer ni pipeline de entrenamiento. El unico artefacto es un README en Markdown con etiquetas HTML embebidas que intentan ejecutar JavaScript en el contexto del visor. No hay datos de entrenamiento, RLHF, DPO ni innovacion tecnica de modelado que describir.

Desde el punto de vista de seguridad, el contenido prueba ocho vectores clasicos de XSS en visores de Markdown: (A) `iframe` con `src="javascript:..."`, (B) `iframe srcdoc` con `
