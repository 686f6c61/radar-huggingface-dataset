# rayzox57/crossover-mod-hub-waw

## Resumen

El repositorio rayzox57/crossover-mod-hub-waw no es un modelo de inteligencia artificial: es un índice de datos publicado en Hugging Face por el usuario Rayzox57. Concretamente, actúa como catálogo de mods de Call of Duty: World at War para la herramienta de escritorio Crossover Mod Hub, cuyo código vive en GitHub. Al arrancar, la herramienta lee `index.json`, que contiene la ficha del juego (nombre, resumen y color de la casilla) y la lista ordenada de repositorios de mods. Cada repositorio de mod incluye su propia ficha (`mod.json`), icono, imágenes y receta de construcción.

El propósito es desacoplar el catálogo de los binarios: en este repositorio, ni en los repositorios de mods, se aloja ningún fichero de juego. Cada mod se fabrica en el PC del jugador a partir de sus propias copias de los juegos, lo que evita la redistribución de material con derechos de autor. Añadir un mod consiste en añadir una línea en el array `mods`; eliminarla lo retira del catálogo, aunque siga siendo jugable para quien ya lo instaló.

Es relevante únicamente como ejemplo de uso atípico de Hugging Face como almacén de índices JSON para herramientas de modding, no como artefacto de machine learning. El repositorio acumula 0 descargas y 0 me gusta, no declara licencia ni pipeline, y su model card está redactada en francés e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo de IA. Es un índice de datos (`index.json`) con una portada vectorial (`cover.svg`) |
| Parámetros totales | No aplica / no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantización | No aplica |
| Idiomas soportados | Francés (fr) e inglés (en), según las etiquetas y el contenido de la model card |
| Licencia | No disponible |
| Formato de pesos | No aplica. Los ficheros declarados son `index.json` y `cover.svg`; no hay safetensors, GGUF ni ONNX |
| Autor | rayzox57 (Rayzox) |
| Descargas / me gusta | 0 / 0 |
| Pipeline declarado | No disponible |
| Fecha de creación | 2026-10-04T14:33:45.000Z |
| Última actualización | 2026-10-04T16:02:13.000Z |

## Arquitectura y entrenamiento

No existe entrenamiento, ajuste fino, RLHF ni DPO: no hay pesos, ni tokenizador, ni grafo de cómputo. La "arquitectura" es un esquema de datos en JSON con tres bloques funcionales. El bloque `game` describe el juego (nombre, resumen y color de la casilla). El bloque `mods` contiene un repositorio por mod, en el orden de visualización. El bloque `tool` incluye `tool.latest` (última versión de la herramienta) y `tool.url` (enlace de descarga): si la versión instalada es más antigua que `tool.latest`, la herramienta ofrece al usuario el enlace indicado.

La convención de nombres es un índice por juego, con el patrón `crossover-mod-hub-<juego>`; este repositorio cubre Call of Duty: World at War. La portada `cover.svg` es una imagen provisional generada para la herramienta y el propio autor recomienda sustituirla por una imagen propia en formato `cover.png`, `.jpg` o `.webp`, en orientación vertical con proporción 2:3 y 600 × 900 píxeles como tamaño aconsejado. No se documentan métricas de rendimiento, versionado semántico del esquema ni validación automática del JSON.

## Capacidades

- Publicación de un catálogo estructurado de mods de Call of Duty: World at War, con orden de aparición controlado por el array `mods`.
- Carga en tiempo de arranque: la herramienta lee `index.json` y construye la pantalla de inicio del juego sin intervención manual.
- Comprobación de versiones de la herramienta cliente mediante `tool.latest` y `tool.url`.
- Distribución de recetas de mods sin alojar contenido propietario: los ficheros se generan localmente a partir de las copias del usuario.
- Soporte de ficha, icono, imágenes y receta por mod, delegados en el repositorio independiente de cada mod.
- Multilingüe en la documentación: la model card está redactada en francés e inglés.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio, ni modo de pensamiento: son capacidades sin sentido en un índice de datos.

## Casos de uso

- Integración en el arranque de Crossover Mod Hub: la herramienta consume `index.json` para mostrar la casilla del juego y la lista de mods disponibles, de modo que el catálogo se actualiza sin recompilar el cliente.
- Publicación de un mod nuevo: el autor del mod crea su repositorio con `mod.json`, icono, imágenes y receta, y el mantenedor del índice añade una única línea en `mods` para que aparezca en el catálogo.
- Retirada de un mod del catálogo: eliminar su línea en `mods` lo hace desaparecer de la interfaz para nuevas instalaciones, pero no rompe las instalaciones ya existentes en los equipos de los jugadores.
- Multiplicación del catálogo por juego: crear índices paralelos con el patrón `crossover-mod-hub-<juego>` permite reutilizar la misma herramienta para otros títulos sin mezclar mods entre juegos.
- Aviso de actualización de la herramienta: comparar la versión local con `tool.latest` y redirigir a `tool.url` sirve para forzar la migración a un cliente compatible con cambios de esquema.
- Personalización de la identidad visual: sustituir `cover.svg` por una imagen propia de 600 × 900 píxeles en 2:3 permite adaptar la portada a la estética del juego o de la comunidad.
- Distribución con menor exposición legal: al no alojar ficheros de juego y construir cada mod en el PC del jugador a partir de sus propias copias, se reduce el riesgo de redistribución de material protegido, siempre que la receta no incluya contenido propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No aplica MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación de modelos, dado que el repositorio no contiene pesos ni código ejecutable de inferencia.

## Requisitos de hardware

- No aplica VRAM ni GPU: el artefacto es un JSON y un SVG, sin inferencia asociada.
- El coste de proceso en el cliente es despreciable: lectura y análisis de un `index.json` de tamaño reducido más el renderizado de una portada SVG o de una imagen de 600 × 900 píxeles.
- Cabe en cualquier equipo capaz de ejecutar Crossover Mod Hub, incluidos portátiles sin GPU dedicada.
- Opciones de despliegue: no procede vLLM, llama.cpp, Ollama ni TGI. La distribución se realiza mediante el propio repositorio de Hugging Face y el cliente de escritorio enlazado desde GitHub.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No hay modelos comparables porque no es un modelo. La comparación pertinente es con otros índices del mismo ecosistema y con gestores de mods de propósito general, para los que no se dispone de datos de rendimiento publicados.

| Alternativa | Naturaleza | Contexto / alcance | Licencia | Disponibilidad |
|---|---|---|---|---|
| rayzox57/crossover-mod-hub-waw | Índice JSON de mods para un juego concreto | Call of Duty: World at War | No disponible | Público en Hugging Face, 0 descargas |
| Otros índices `crossover-mod-hub-<juego>` | Mismo esquema, otro título | Según el juego | No disponible | Referenciados por convención de nombres, sin listado verificado |
| Gestores de mods genéricos (Vortex, Mod Organizer 2, etc.) | Aplicación de escritorio con base de datos propia | Multi-juego | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo de IA: evaluarlo con criterios de parámetros, contexto o benchmarks carece de sentido y puede inducir a error en un catálogo de modelos.
- La licencia no está declarada, por lo que el uso comercial, la redistribución o la modificación del índice quedan en un limbo legal hasta que el autor lo aclare.
- Sin pipeline declarado, con 0 descargas y 0 me gusta: no hay validación comunitaria ni evidencia de uso en producción.
- La documentación está solo en francés e inglés; no hay versión en castellano ni traducciones adicionales.
- Dependencia externa del repositorio GitHub de la herramienta: un cambio de esquema en `index.json` puede invalidar el índice sin aviso, ya que no se documenta versionado del formato.
- El propio autor señala que `cover.svg` es una imagen provisional y que la proporción recomendada es 2:3 (600 × 900); usarla tal cual puede dar una portada con recorte o escalado incorrectos.
- El modelo de distribución basado en recetas locales exige que el jugador posea copias legítimas de los juegos; las recetas no deben incluir material propietario, y su legalidad depende de la legislación aplicable y de los términos de uso del juego.
- Las fechas declaradas de creación y actualización (2026-10-04) resultan anómalas respecto a un uso habitual del servicio, por lo que conviene verificarlas antes de citarlas.
- No hay mecanismo documentado de moderación, firma o verificación de integridad de los repositorios de mods enlazados desde el índice.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rayzox57/crossover-mod-hub-waw
- Herramienta Crossover Mod Hub (GitHub): https://github.com/Rayzox57/crossover-mod-hub
- Perfil del autor en Hugging Face: https://huggingface.co/rayzox57
- Modelos del autor: https://huggingface.co/rayzox57/models
- Conjuntos de datos del autor: https://huggingface.co/rayzox57/datasets
- Otro artefacto del autor: https://huggingface.co/rayzox57/GawrGura_RVC
