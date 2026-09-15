# 0xmoose0xmoose0xmoose/xss-probe7-scheme2

## Resumen

El repositorio identificado como `0xmoose0xmoose0xmoose/xss-probe7-scheme2` no contiene un modelo de inteligencia artificial. Se trata de un artefacto de prueba de seguridad publicado en HuggingFace cuyo contenido es un conjunto de enlaces Markdown disenados para comprobar como sanitiza la plataforma distintos esquemas de URI y caracteres de control. El autor es el usuario `0xmoose0xmoose0xmoose` y el repositorio registra cero descargas y cero likes en el momento de la consulta.

El contenido de la model card consiste en diez casos de prueba etiquetados de T1 a T10, cada uno con un enlace Markdown que emplea variantes de `javascript:`, `data:`, `vbscript:` y `https:` combinadas con tabuladores, caracteres de control C1, avances de formulario y entidades HTML (`&#9;`). El objetivo aparente es evaluar si el renderizador de Markdown de HuggingFace neutraliza correctamente payloads de Cross-Site Scripting (XSS) basados en esquemas de URI, un vector clasico de inyeccion en visores de documentacion y ficheros README.

No se dispone de arquitectura, parametros, tokenizador, pesos, licencia ni idiomas declarados, ya que no existe artefacto de modelo alguno en el repositorio. La fecha de creacion registrada es el 15 de septiembre de 2026, posterior a la fecha habitual de publicacion, lo que sugiere una anomalia en la marca temporal o un entorno de pruebas con reloj manipulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio solo contiene Markdown) |
| Tipo de artefacto | conjunto de pruebas de saneamiento de enlaces Markdown (XSS probe) |
| Autor | 0xmoose0xmoose0xmoose |
| Fecha de creacion | 2026-09-15T01:54:42Z |
| Fecha de actualizacion | 2026-09-15T01:54:43Z |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Etiquetas | region:us |

## Arquitectura y entrenamiento

No aplica. No existe red neuronal, transformer, modelo de mezcla de expertos ni arquitectura de espacio de estados en este repositorio. Tampoco hay proceso de entrenamiento, corpus, numero de tokens, fases de ajuste supervisado, RLHF o DPO que describir.

La unica estructura tecnica presente es un documento Markdown con diez vectores de prueba de enlaces. Los casos evaluan: T1, esquema `javascript:` precedido de tabulador dentro de sintaxis de angulos; T2, el mismo esquema sin delimitadores angulares; T3, insercion de un caracter de control C1 antes del esquema; T4, avance de formulario embebido; T5, URL `https` rodeada de angulos con posibles caracteres de control; T6, `javascript:` puro entre angulos; T7, esquema `data:text/html` con etiqueta `
