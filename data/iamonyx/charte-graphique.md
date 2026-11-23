# iamonyx/charte-graphique

## Resumen

`iamonyx/charte-graphique` no es un modelo de aprendizaje automatico, sino un repositorio de documentacion y utilidades de identidad visual publicado en Hugging Face bajo el identificador `iamonyx/charte-graphique`. Contiene la charte graphique (manual de identidad de marca) del atelier Onyx, una peluche naranja virtual, junto con una serie de scripts Python reproducibles que generan las piezas graficas (gabarits de publicaciones, logotipo, especimen tipografico) a partir de esa charte. El repositorio esta etiquetado con el idioma frances (`fr`) y una licencia de tipo `other`.

El contenido se articula en torno al denominado "sistema D3": fondos blancos dominantes, una paleta de personaje bloqueada (naranja `#FC8B32`, naranja medio `#C95D1D`, naranja oscuro `#8D2E0F` y blanco) y colores de acento por serie de contenido. Los constructores (`build_gabarits_series.py`, `build_gabarit.py`, `build_logo.py`, `build_specimen.py`) son scripts reproducibles que aplican esas reglas de forma programatica, con verificacion de contraste WCAG documentada.

Es relevante para desarrolladores e investigadores unicamente como referencia de ingenieria de sistemas de diseno reproducibles y de gobernanza de marca versionada, no como artefacto de IA. No contiene pesos, tokenizador, configuracion de modelo ni pipeline de inferencia; el tamano del repositorio es de 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; repositorio de charte graphique y scripts Python) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (`fr`) |
| Licencia | `other` (scripts bajo MIT; charte, logotipo y marcas propiedad del atelier, ver `LICENCE.md`) |
| Formato de pesos | no disponible (el repositorio contiene Markdown, scripts `.py` y activos graficos) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado. Su "arquitectura" es un conjunto de artefactos documentales y de codigo: un documento normativo (`CHARTE-GRAPHIQUE.md`), cuatro constructores Python reproducibles y activos de marca en `typo-logo/logo/`. La reproducibilidad se garantiza por reejecucion de los scripts, que producen la misma pieza a partir de los mismos parametros (color de serie, formato, tipografia).

El sistema define formatos concretos: planchas 3:4 en 1080 x 1440 como estandar, story/reel 9:16, miniatura, post 4:5 y bannieres (gabarits G1-G5); tipografias Fredoka (display) y Nunito (texto), con licencias OFL incluidas en `typo-logo/`; y una regla de contraste medida que obliga a usar `#8D2E0F` para texto naranja claro sobre fondo claro. Se documentan 27 combinaciones WCAG calculadas con 0 fallos en el momento de la entrega. No hay datos de entrenamiento, RLHF, DPO ni innovaciones de inferencia.

## Capacidades

- Generacion reproducible de gabarits de publicacion parametrizados por color de serie (G1-G5: plancha 3:4, story/reel 9:16, miniatura, post 4:5, bannieres).
- Generacion de planchas 3:4 y 4:5 con zonas, margenes y rejilla de comparacion mediante `gabarits/build_gabarit.py`.
- Generacion del logotipo "Onyx®" y del icono-cabeza en variantes clara, oscura y monocroma mediante `typo-logo/build_logo.py`.
- Generacion de plancha especimen tipografico mediante `typo-logo/build_specimen.py`.
- Verificacion de contraste WCAG sobre las combinaciones de la paleta (27 combinaciones calculadas, 0 fallos reportados).
- Documentacion de decision tipografica en `typo-logo/CHOIX.md` (candidatas comparadas, criterios, decision).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: no es un modelo de lenguaje.

## Casos de uso

- Sistema de diseno versionado para un estudio creativo: la charte actua como fuente de verdad visual y los constructores regeneran piezas conformes en lugar de corregirlas a posteriori, lo que reduce la deriva de marca entre entregables.
- Generacion automatizada de creatividades para redes sociales: los gabarits G1-G5 cubren plancha 3:4 (1080 x 1440), story/reel 9:16, miniatura, post 4:5 y bannieres, parametrizados por la unica variable de color de serie, lo que permite producir lotes homogeneos por campana.
- Control de calidad de marca en pipelines de publicacion: la puerta de fidelidad (repositorio `porte-fidelite`) compara las imagenes producidas con los colores de la charte, y los gabarits 3D (`gabarits-porte-3d`) con sus proporciones, integrable como paso de validacion previo a publicar.
- Produccion de identidad tipografica y logotipo: `build_logo.py` y `build_specimen.py` generan el logotipo y su especimen en variantes clara, oscura y monocroma, utiles para mantener consistencia entre plataformas.
- Auditoria de accesibilidad cromatica: la regla medida sobre la paleta (uso de `#8D2E0F` para texto naranja claro sobre fondo claro) y el calculo de 27 combinaciones WCAG sirven como base para validar contraste en interfaces y materiales impresos.
- Referencia docente o de ingenieria para equipos que quieran montar un sistema de diseno reproducible en Python: los scripts son deterministas y reejecutables, lo que ejemplifica el patron "codigo como fuente de verdad" para activos graficos.
- Gobernanza de marca en organizaciones con multiples repositorios: la charte se declara gesto raro y versionado, y el resto de la cadena (sitios, redes, puertas de fidelidad) se alinea con ella, lo que facilita cambios controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de validacion reportado es la comprobacion de contraste: 27 combinaciones WCAG calculadas con 0 fallos en el momento de la entrega.

## Requisitos de hardware

- No aplica inferencia de modelo: no hay pesos ni requisitos de VRAM.
- Ejecucion de los constructores: scripts Python estandar; el coste depende de las librerias de renderizado grafico empleadas, no especificadas en la informacion disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible (no procede).
- Opciones de despliegue: no disponible; el consumo previsto es la ejecucion directa de los scripts del repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada repositorios comparables de charte graphique con constructores reproducibles en Hugging Face; la comparacion con modelos de IA no procede porque este repositorio no contiene un modelo.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo, imagenes por inferencia ni responde a prompts; cualquier uso en ese sentido es un error de categoria.
- Ambito idiomatico limitado al frances (`fr`) en la documentacion y etiquetado.
- Licencia `other`: los scripts son MIT, pero la charte, el logotipo y las marcas quedan como propiedad del atelier y no pueden reutilizarse para representar otro producto o personaje (ver `LICENCE.md`); el uso comercial de los activos de marca no esta permitido fuera de ese marco.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, y repositorio de 0.0 GB, lo que sugiere ausencia de validacion externa.
- Fechas de creacion y actualizacion registradas en 2026-11-23, con una ventana de actualizacion de menos de dos minutos; no hay historial de mantenimiento verificable.
- La verificacion de contraste WCAG (27 combinaciones, 0 fallos) corresponde al momento de la entrega y no se actualiza automaticamente si cambia la paleta.
- No se especifican las dependencias ni la version de Python necesarias para ejecutar los constructores, lo que puede afectar a la reproducibilidad en entornos distintos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iamonyx/charte-graphique
- Charte graphique (documento normativo): `CHARTE-GRAPHIQUE.md` en el repositorio
- Licencia: `LICENCE.md` en el repositorio
- Decision tipografica: `typo-logo/CHOIX.md` en el repositorio
- Constructores: `gabarits/build_gabarits_series.py`, `gabarits/build_gabarit.py`, `typo-logo/build_logo.py`, `typo-logo/build_specimen.py`
- Repositorios relacionados citados en la model card: `porte-fidelite`, `gabarits-porte-3d` (sin URL publica en la informacion disponible)
- Paper, blog, demo o repositorio externo: no disponible
