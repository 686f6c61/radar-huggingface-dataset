# rayzox57/crossover-mod-hub-waw-luigi-mansion

## Resumen

Este repositorio no es un modelo de inteligencia artificial. Se trata de `rayzox57/crossover-mod-hub-waw-luigi-mansion`, una receta de modificación (mod) para el videojuego Call of Duty: World at War, concretamente para su modo zombis Nacht der Untoten, que combina contenido de Luigi's Mansion con dicho juego. El autor es el usuario de HuggingFace `rayzox57` (Rayzox), que también mantiene la herramienta Crossover Mod Hub en GitHub. El repositorio se publica en HuggingFace como artefacto de distribución, no como pesos de red neuronal.

El problema que resuelve es el de empaquetar de forma reproducible una modificación que requiere material de dos juegos propietarios. La receta no incluye ningún fichero de Luigi's Mansion ni de World at War: lee la imagen de disco de GameCube que aporta el propio jugador (versión europea) y su instalación de World at War, y genera el mod en su PC. Por tanto, la relevancia técnica es la de un formato de distribución legalmente prudente para mods, no la de una aportación al campo del aprendizaje automático.

El repositorio ocupa 0,0 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni pipeline. Sus idiomas declarados son francés e inglés. No existe arquitectura neuronal, ni parámetros, ni ventana de contexto asociados a este artefacto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una receta de mod) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | francés (fr) e inglés (en), según los tags y el contenido de la ficha |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio contiene `mod.json`, `icon.svg`, `media/` y `recipe/` (scripts y recursos) |

Datos adicionales del repositorio: identificador `rayzox57/crossover-mod-hub-waw-luigi-mansion`, autor `rayzox57`, etiquetas `crossover-mod-hub`, `fr`, `en`, `region:us`, tamaño 0,0 GB, descargas 0, likes 0. Fecha de creación registrada: 2026-10-04; última actualización: 2026-10-04.

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. La "arquitectura" del artefacto es la estructura de una receta de Crossover Mod Hub, compuesta por `mod.json` (ficha del mod en francés e inglés, versión, registro de cambios y lista y huellas de los ficheros de la receta), `icon.svg` (icono de la ficha), `media/` (imágenes que aparecen en la herramienta) y `recipe/` (scripts de conversión, scripts del mod, diferencias frente a los scripts del mapa y creaciones propias del mod, como la pantalla de título y la música de la radio).

El flujo de trabajo documentado por el autor es: tras cualquier modificación de `recipe/`, ejecutar `python tools/cmh_pack.py <carpeta>` para actualizar la lista de ficheros de `mod.json`, incrementar la versión y añadir una entrada al registro de cambios. La generación del mod se produce localmente a partir de dos fuentes que aporta el usuario: la imagen de disco de GameCube en versión europea y la instalación de Call of Duty: World at War.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código y no procesa lenguaje natural.
- Construcción local del mod: a partir de la imagen de disco europea de Luigi's Mansion y de una instalación de World at War, la receta fabrica el mod en el PC del usuario.
- Conversión de recursos: incluye scripts de conversión para adaptar el contenido de origen al motor de World at War.
- Empaquetado reproducible: `tools/cmh_pack.py` regenera la lista de ficheros y huellas de `mod.json`, lo que permite verificar la integridad de la receta.
- Versionado y registro de cambios: la ficha del mod incorpora número de versión y changelog editables por el autor.
- Presentación bilingüe: la ficha del mod está redactada en francés y en inglés.
- Integración con Crossover Mod Hub: instalación y gestión mediante esa herramienta de escritorio.
- Contenido propio del mod: pantalla de título y música de radio creadas específicamente, además de las diferencias frente a los scripts del mapa original.

## Casos de uso

- Instalación de la modificación por parte de un jugador: el usuario descarga la receta desde HuggingFace, la procesa con Crossover Mod Hub aportando su propia imagen de disco europea de Luigi's Mansion y su instalación de World at War, y obtiene el mod listo para jugar en Nacht der Untoten.
- Distribución legalmente prudente de mods: al no incluir material de los juegos originales, este formato sirve como patrón para publicar modificaciones sin redistribuir recursos propietarios.
- Desarrollo y bifurcación de variantes: un modder puede clonar el repositorio, editar `recipe/`, empaquetar con `tools/cmh_pack.py`, subir la versión y publicar su propia variante.
- Verificación de integridad de una receta: las huellas incluidas en `mod.json` permiten comprobar que los ficheros que se van a convertir son los esperados antes de generar el mod.
- Estudio de técnicas de conversión entre motores: los scripts de `recipe/` documentan cómo se traducen recursos de un juego de GameCube a los formatos de un motor de 2008 como el de World at War.
- Documentación comunitaria: la ficha bilingüe (`mod.json`, `media/`) sirve como plantilla para que otros autores describan sus recetas dentro del ecosistema Crossover Mod Hub.
- Automatización del empaquetado en flujos propios: al ser un comando de Python, el empaquetado puede encadenarse en scripts o ganchos de control de versiones del propio modder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este artefacto no es un modelo evaluable con MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- No requiere GPU ni aceleración por hardware en ningún caso; no hay inferencia neuronal implicada.
- Requiere un PC de escritorio con la herramienta Crossover Mod Hub instalada.
- Requiere una copia propia de la imagen de disco de Luigi's Mansion en versión europea (GameCube).
- Requiere una instalación funcional de Call of Duty: World at War con acceso a los ficheros del modo zombis.
- Requiere Python para ejecutar `python tools/cmh_pack.py <carpeta>` al modificar la receta.
- El tamaño declarado del repositorio es 0,0 GB, por lo que el coste de descarga es despreciable; el espacio en disco relevante proviene de los juegos de origen y del mod generado, para lo cual no se facilita cifra.
- Latencia, throughput de tokens, opciones de despliegue en vLLM, llama.cpp, Ollama o TGI: no aplica y no disponible.

## Comparativa con modelos similares

| Artefacto | Tipo | Contenido propietario incluido | Idiomas de la ficha | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rayzox57/crossover-mod-hub-waw-luigi-mansion` | Receta de mod (Crossover Mod Hub) | No | fr, en | no disponible | HuggingFace (0 descargas, 0 likes) |
| Otras recetas de Crossover Mod Hub | Receta de mod | No | no disponible | no disponible | GitHub `Rayzox57/crossover-mod-hub` |
| Mods de Luigi's Mansion en LM Hub (GameBanana) | Mods y contenido para el juego | Variable, depende del autor | no disponible | no disponible | GameBanana (juego 7120) |

No se dispone de datos de rendimiento, descargas o valoraciones que permitan una comparación cuantitativa entre alternativas. No disponible.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generación de texto, razonamiento o capacidades multimodales es inaplicable a este repositorio.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita de uso, modificación ni redistribución; conviene contactar con el autor antes de reutilizar la receta en un producto.
- Dependencia de material propietario: el funcionamiento exige que el usuario posea legalmente la imagen de disco europea de Luigi's Mansion y una copia de Call of Duty: World at War; la receta no sustituye esas licencias.
- Sin adopción verificable: 0 descargas y 0 likes, y tamaño de 0,0 GB, lo que apunta a un repositorio sin uso comunitario confirmado y sin garantía de mantenimiento.
- Fecha de creación registrada como 2026-10-04, posterior a la fecha habitual de consulta; conviene verificar la coherencia temporal de los metadatos antes de citarlos.
- Sin control de calidad externo: no constan pruebas, informes de errores, ni verificación por terceros del correcto funcionamiento de los scripts de conversión.
- Regionalidad delimitada: la receta depende de la versión europea de la imagen de disco; otras regiones pueden no ser compatibles.
- Idiomas limitados en la documentación: francés e inglés únicamente, sin versión en castellano.
- Riesgo de incompatibilidad con versiones futuras de Crossover Mod Hub o de los juegos, al no documentarse versiones mínimas soportadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rayzox57/crossover-mod-hub-waw-luigi-mansion
- Perfil del autor en HuggingFace: https://huggingface.co/rayzox57
- Modelos del autor: https://huggingface.co/rayzox57/models
- Conjuntos de datos del autor: https://huggingface.co/rayzox57/datasets
- Herramienta Crossover Mod Hub (GitHub): https://github.com/Rayzox57/crossover-mod-hub
- Perfil del autor en GitHub: https://github.com/rayzox57
- Comunidad de mods de Luigi's Mansion (LM Hub, GameBanana): https://gamebanana.com/games/7120
