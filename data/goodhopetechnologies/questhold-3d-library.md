# GoodhopeTechnologies/questhold-3d-library

## Resumen

QuestHold 3D Library es un repositorio de activos 3D publicado por Goodhope Technologies LLC en Hugging Face, no un modelo de IA generativa. Contiene 3.555 modelos tridimensionales de criaturas, objetos, props, edificios y personajes, cada uno en dos niveles de detalle, junto con sus etiquetas en ingles y castellano y sus zonas de color en un fichero de metadatos (`library_full.json`) y un formato de malla propio denominado QHM1 (`library_full.qhm`).

El paquete esta pensado como biblioteca de recursos para la aplicacion QuestHold AI: la app descarga esta biblioteca en el dispositivo del jugador y la utiliza para poblar el mundo del juego. Por tanto, su relevancia no reside en capacidades cognitivas ni en inferencia, sino en servir como conjunto de activos 3D curados, limpiados, reducidos, recoloreados y re-zonados por el autor a partir de fuentes de licencia abierta.

El repositorio ocupa 0,3 GB y agrega materiales de Grab3D, Quaternius, Gobkit, KayKit, Polygonal Mind (100Avatars), Poly Pizza, Sketchfab (via Objaverse) y un escaneo de Smithsonian Open Access, ademas de modelos generados por la propia compania con identificadores `gen_*`. La ficha que sigue adapta la estructura tecnica habitual a la naturaleza del artefacto: no hay parametros, contexto ni benchmarks porque no se trata de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una biblioteca de mallas 3D en formato propio QHM1) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | etiquetas en ingles y castellano para cada modelo (segun la model card) |
| Licencia | other (cc0-1.0-and-cc-by-4.0-and-own) |
| Formato de pesos | mallas en formato propio QHM1 (`library_full.qhm`) y metadatos en JSON (`library_full.json`) |
| Numero de modelos 3D | 3.555 |
| Niveles de detalle por modelo | 2 |
| Tamano del repositorio | 0,3 GB |
| Herramientas de construccion | select.py, batch.py, qh_library.py, pack.py (en el codigo fuente de QuestHold AI) |

## Arquitectura y entrenamiento

No aplica en el sentido convencional: no hay transformer, MoE ni SSM, ni un proceso de entrenamiento con tokens. El artefacto es un pipeline de curacion de activos 3D. Segun la model card, los modelos originales se limpiaron, redujeron, recolorearon y re-zonaron para QuestHold AI, y se empaquetaron en el formato de malla propio QHM1 mediante un conjunto de scripts (`select.py`, `batch.py`, `qh_library.py`, `pack.py`) integrados en el codigo fuente de la aplicacion.

Cada registro de `library_full.json` incluye la procedencia del activo bajo la clave `source`: sitio, titulo, pagina, autor y licencia. Esta trazabilidad es el elemento tecnico mas relevante del paquete, ya que permite auditar el cumplimiento de las licencias CC0, CC BY 4.0 y CC BY 3.0 de las fuentes originales. Los modelos generados internamente llevan identificadores con prefijo `gen_*`.

## Capacidades

- Proporciona 3.555 activos 3D categorizados en criaturas, objetos, props, edificios y personas.
- Cada activo dispone de dos niveles de detalle (LOD), lo que facilita la gestion de rendimiento en tiempo real.
- Etiquetado bilingue (ingles y castellano) por modelo, util para busqueda y filtrado en la app.
- Zonas de color definidas por modelo, pensadas para recoloreado o personalizacion dinamica.
- Metadatos estructurados en JSON con procedencia completa (sitio, titulo, pagina, autor, licencia).
- Formato de malla propio QHM1, optimizado para el consumo de la aplicacion QuestHold AI.
- No incluye generacion de texto, razonamiento, codigo, vision por computador, tool calling ni capacidades de agente.

## Casos de uso

- Poblar mundos de juego en QuestHold AI: la aplicacion descarga la biblioteca en el dispositivo del jugador y la usa para instanciar criaturas, props y edificios; los dos niveles de detalle permiten alternar mallas segun la distancia de camara.
- Prototipado rapido de escenas 3D: un desarrollador puede importar los activos QHM1 (previa conversion) para montar maquetas de niveles sin encargar arte original.
- Sistema de recoloreado dinamico: las zonas de color por modelo permiten variantes visuales de un mismo activo sin duplicar geometria, util para facciones, equipamiento o estaciones del ano.
- Busqueda multilingue de activos: las etiquetas en ingles y castellano habilitan un buscador interno que responde a consultas en ambos idiomas.
- Auditoria de licencias en produccion: el campo `source` de `library_full.json` y el fichero `CREDITS.md` permiten generar automaticamente los creditos exigidos por CC BY 4.0 y CC BY 3.0.
- Base para experimentos de investigacion en curacion de datasets 3D: el par (malla QHM1, metadatos JSON) sirve para estudiar normalizacion, reduccion de poligonos y segmentacion por zonas de color a escala de miles de activos.
- Educacion y demos tecnicas: al ser en gran parte CC0, el conjunto puede usarse en materiales docentes sobre pipelines de activos 3D sin friccion de licencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no aplican metricas como MMLU, HumanEval o GSM8K. Tampoco se ofrecen datos de recuento de poligonos, vertices por LOD ni tiempos de carga del formato QHM1.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica para el repositorio en si; el rendimiento dependera del motor grafico que consuma las mallas QHM1 en QuestHold AI.
- Cabe en GPU de consumo: el repositorio completo ocupa 0,3 GB en disco, por lo que el almacenamiento no es un obstaculo en ningun equipo actual; la carga en GPU dependera del numero de mallas instanciadas simultaneamente.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; el consumo se realiza a traves de la aplicacion QuestHold AI y de sus herramientas (`select.py`, `batch.py`, `qh_library.py`, `pack.py`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Conjunto | Naturaleza | Tamano | Licencia | Idiomas de etiquetas | Formato |
|---|---|---|---|---|---|
| QuestHold 3D Library | Biblioteca de activos 3D para juego | 3.555 modelos, 0,3 GB | CC0 + CC BY 4.0 + CC BY 3.0 + propia | Ingles y castellano | QHM1 + JSON |
| Objaverse | Dataset de investigacion de objetos 3D | No disponible en la informacion | No disponible en la informacion | No disponible | No disponible |
| Poly Pizza | Repositorio de modelos 3D de artistas | No disponible en la informacion | CC BY 3.0 (parcial, como fuente) | No disponible | No disponible |
| Quaternius | Packs de activos 3D de estilo bajo poligonaje | No disponible en la informacion | CC0 (como fuente) | No disponible | No disponible |

La comparativa es estructural: QuestHold 3D Library se distingue por el empaquetado en un formato propio y por el etiquetado bilingue, mientras que las alternativas son repositorios de origen o datasets de investigacion. No hay datos publicos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo ni imagenes, y no debe evaluarse con criterios de benchmarks de lenguaje.
- La licencia es compuesta (`cc0-1.0-and-cc-by-4.0-and-own`); el uso comercial exige revisar activo por activo el campo `source` de `library_full.json` y respetar la atribucion de las piezas CC BY 4.0 y CC BY 3.0.
- El formato QHM1 es propio: sin las herramientas del codigo fuente de QuestHold AI, la conversion a glTF, FBX u OBJ no esta documentada en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la calidad de las mallas ni de la exactitud de los metadatos.
- No se detalla el recuento de poligonos por nivel de detalle ni el criterio de reduccion aplicado, lo que impide estimar el coste grafico real.
- La fecha de creacion indicada (2026-11-25) es posterior a la fecha habitual de consulta; conviene verificar la coherencia temporal del registro antes de citarlo.
- Los metadatos de idioma no figuran como campo de idiomas del repositorio, solo como etiquetas por modelo en el JSON; no hay garantia de cobertura bilingue completa en los 3.555 activos.
- La atribucion de las piezas de Sketchfab y Poly Pizza depende de que `CREDITS.md` este completo y actualizado; no se indica en la informacion disponible si se ha verificado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GoodhopeTechnologies/questhold-3d-library
- Creative Commons Zero 1.0 Universal: https://creativecommons.org/publicdomain/zero/1.0/
- Creative Commons Attribution 4.0 International: https://creativecommons.org/licenses/by/4.0/
- Creative Commons Attribution 3.0: https://creativecommons.org/licenses/by/3.0/
- Grab3D: https://grab3d.com
- Quaternius: https://quaternius.com
- Gobkit: https://gobkit.com
- KayKit (Kay Lousberg): https://kaylousberg.itch.io
- Polygonal Mind 100Avatars: https://github.com/PolygonalMind/100Avatars
- Poly Pizza: https://poly.pizza
- Objaverse (fuente de busqueda citada): no disponible
- Sketchfab (fuente citada): no disponible
