# abcamiletto/body-models

## Resumen

`abcamiletto/body-models` no es un modelo de lenguaje, sino un repositorio de activos de ejecución (runtime assets) para modelos paramétricos de cuerpo humano. Lo publica el desarrollador abcamiletto como complemento del proyecto de código abierto alojado en GitHub, y agrupa los ficheros necesarios para ejecutar cinco modelos de la familia de cuerpos paramétricos: SOMA, ANNY, GNM, MHR y un módulo de medidas de prendas (garment measurements).

Cada modelo se distribuye en su propia carpeta con un `assets.zip` y un `LICENSE.md` que documenta la procedencia upstream. El repositorio ocupa 6,1 GB y se publica bajo licencia Apache 2.0. No incluye pesos de modelos de lenguaje ni pipeline de inferencia textual; su función es servir como espejo público de los binarios que el código del proyecto espera encontrar en tiempo de ejecución.

Es relevante para desarrolladores que trabajan en visión por computador, gráficos 3D, avatares digitales, ajuste de tallas y antropometría, porque centraliza en un único punto los activos de varios modelos de cuerpo que de otro modo habría que descargar de fuentes dispersas. Los modelos SMPL, SMPL-H, SMPL-X, MANO, FLAME y SKEL no se incluyen por requerir aceptación de licencia upstream y credenciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos paramétricos de cuerpo humano (no es un transformer ni un modelo de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | `assets.zip` por modelo (SOMA, ANNY, GNM, MHR, garment measurements) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado con una arquitectura de red neuronal concreta descrita en la información disponible. Se trata de un contenedor de activos para modelos paramétricos de cuerpo humano, una familia de representaciones que mapean parámetros de forma, pose y expresión a mallas 3D. Los nombres incluidos (SOMA, ANNY, GNM, MHR) corresponden a modelos de cuerpo paramétricos de terceros, y el repositorio actúa como espejo de sus binarios de ejecución.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO, ya que no aplica a este tipo de activos. La innovación técnica, si la hay, reside en la agregación y empaquetado reproducible de los activos, no en un método de entrenamiento propio.

## Capacidades

- Distribución de activos de ejecución para modelos paramétricos de cuerpo humano: SOMA, ANNY, GNM y MHR.
- Inclusión de un módulo de medidas de prendas (garment measurements) para cálculo de tallas a partir de cuerpos paramétricos.
- Empaquetado por modelo en carpetas independientes con `assets.zip` y `LICENSE.md` de procedencia.
- Servir como fuente de descarga para el código del repositorio GitHub asociado.
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas, visión por lenguaje, tool calling ni agentes.
- No incluye modelos SMPL, SMPL-H, SMPL-X, MANO, FLAME ni SKEL por restricciones de licencia upstream.

## Casos de uso

- Ajuste de tallas en comercio electrónico: usar el módulo `garment_measurements` junto con un modelo de cuerpo paramétrico para estimar medidas antropométricas y recomendar tallas sin probador físico.
- Avatares digitales en tiempo real: cargar los activos de SOMA o ANNY en un motor 3D para generar avatares animables con parámetros de forma y pose.
- Animación y videojuegos: integrar MHR o GNM en pipelines de rigging para producir mallas humanas deformables a partir de parámetros.
- Investigación en antropometría: emplear los modelos como base reproducible para estudios de variación morfológica, con activos versionados y licencia Apache 2.0.
- Prótesis y diseño ergonómico: usar las medidas de prendas y los modelos de cuerpo para prototipar productos ajustados a poblaciones específicas.
- Docencia y prototipado: disponer de un único punto de descarga de activos para cursos de gráficos 3D y visión por computador, evitando la gestión manual de licencias de SMPL.
- Integración en el proyecto GitHub: clonar el repositorio de código y apuntar la ruta de activos a este repositorio de Hugging Face para ejecutar las demos sin descargas adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no tratarse de un modelo de lenguaje ni de una red con tareas estándar (MMLU, HumanEval, GSM8K), no aplica una tabla comparativa de rendimiento en ese sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo paramétrico concreto y del motor de renderizado, no de una GPU para transformers.
- GPU recomendadas: no disponible; los modelos paramétricos de cuerpo suelen ejecutarse en CPU o en GPU de gama media para renderizado, pero no se especifica en la información.
- ¿Cabe en consumer GPU?: no disponible; el repositorio ocupa 6,1 GB en disco, no en VRAM.
- Opciones de despliegue: descarga directa desde Hugging Face y uso mediante el código del repositorio GitHub `abcamiletto/body-models`; no se indican vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|
| `abcamiletto/body-models` | Activos de modelos de cuerpo paramétrico | Apache 2.0 | Hugging Face, 6,1 GB | Incluye SOMA, ANNY, GNM, MHR y garment measurements |
| SMPL / SMPL-X | Modelos de cuerpo paramétrico | Licencia upstream con aceptación | No incluido aquí | Requiere credenciales y aceptación de licencia |
| MANO / FLAME | Modelos de mano y cara | Licencia upstream con aceptación | No incluido aquí | Requiere credenciales y aceptación de licencia |
| GNM / MHR (upstream) | Modelos de cuerpo paramétrico | Según upstream | Incluidos como activos | Procedencia documentada en cada `LICENSE.md` |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas; cualquier uso en ese sentido es un error de categoría.
- Los activos de SMPL, SMPL-H, SMPL-X, MANO, FLAME y SKEL no están incluidos y requieren aceptación de licencia upstream y credenciales; no se pueden obtener desde este repositorio.
- La licencia Apache 2.0 del repositorio no sustituye las licencias upstream de cada modelo incluido; hay que revisar el `LICENSE.md` de cada carpeta antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria ni evidencia de uso en producción.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque no aplica a este tipo de activos.
- El tamaño de 6,1 GB implica requisitos de almacenamiento y ancho de banda considerables para la descarga inicial.
- La fecha de creación indicada (2026-06-25) y la de actualización (2026-11-14) son posteriores a la fecha habitual de referencia; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/abcamiletto/body-models
- Repositorio GitHub asociado: https://github.com/abcamiletto/body-models
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.
