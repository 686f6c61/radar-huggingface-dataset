# Merlef/brush-cli-builds

## Resumen

Brush CLI 1.0.0 es un binario precompilado de linea de comandos del motor de reconstruccion 3D por Gaussian splatting Brush, desarrollado originalmente por Arthur Brussee. El repositorio `Merlef/brush-cli-builds` no contiene un modelo de IA en el sentido estricto, sino artefactos ejecutables para macOS sobre Apple Silicon, compilados a partir del commit upstream `1388f74` del 3 de octubre de 2026 ("Improve viewer rendering and training efficiency"). La motivacion del autor es ofrecer un binario que incluya las mejoras de eficiencia de entrenamiento que no estan presentes en la ultima release oficial, v0.3.0.

Brush es una implementacion en Rust de reconstruccion de escenas mediante Gaussian splatting, una tecnica que representa una escena 3D como un conjunto de gaussianas 3D optimizadas a partir de imagenes de entrada. El binario emplea Metal a traves de wgpu para acelerar el entrenamiento y la exportacion en hardware Apple Silicon, con un minimo de macOS 11. La salida tipica es un fichero `.ply` con las gaussianas entrenadas, que puede visualizarse en visores compatibles.

Este repositorio tiene un interes limitado para quienes evaluan modelos de lenguaje: no hay pesos de red neuronal, no hay tokenizador ni pipeline de inferencia textual. Su relevancia es para desarrolladores que trabajan en reconstruccion 3D y quieren ejecutar Brush en macOS sin compilar desde fuente. El tamano del repositorio es de 0.0 GB en el momento de la consulta, lo que sugiere que el artefacto no esta efectivamente alojado o que la metadata no refleja su contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (herramienta de reconstruccion 3D por Gaussian splatting, no es un modelo neuronal de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el artefacto es un binario `.tar.xz` para `aarch64-apple-darwin`) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado con un corpus de texto, sino de un motor de optimizacion de gaussianas 3D. El binario se compila con `cargo build --release -p brush-cli` usando Rust 1.99.1 y utiliza Metal mediante wgpu como backend de computo en Apple Silicon. El flujo de trabajo parte de un dataset en formato COLMAP o Nerfstudio y optimiza un conjunto de splats gaussianos durante un numero configurable de iteraciones (`--total-train-iters`, 4500 en el ejemplo de la model card) con un limite de splats (`--max-splats`, 150000 en el ejemplo).

El commit de origen, `1388f74` (2026-10-03), introduce mejoras de eficiencia en el visor y en el entrenamiento respecto a la release oficial v0.3.0. No se dispone de informacion sobre la composicion del dataset de entrenamiento, el numero de tokens (concepto no aplicable) ni sobre tecnicas de RLHF o DPO, que no tienen sentido en este contexto.

## Capacidades

- Reconstruccion 3D de escenas a partir de conjuntos de imagenes en formato COLMAP o Nerfstudio.
- Entrenamiento de Gaussian splats con control del numero de iteraciones y del numero maximo de splats.
- Exportacion de la escena entrenada a formato `.ply` (`--export-path`, `--export-name`).
- Ejecucion nativa en macOS sobre Apple Silicon (minimo macOS 11) con aceleracion Metal via wgpu.
- Interfaz de linea de comandos con opciones adicionales consultables mediante `brush-cli --help`.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision semantica, tool calling ni agentes.

## Casos de uso

- Reconstruccion de escenas para realidad virtual y aumentada: a partir de capturas fotograficas de un espacio, el binario entrena un conjunto de gaussianas que puede exportarse a `.ply` e integrarse en visores WebGL o motores 3D.
- Digitalizacion de patrimonio y arquitectura: fotografiar un edificio o una escultura y generar una representacion 3D navegable sin necesidad de compilar Brush desde el codigo fuente en macOS.
- Prototipado rapido en investigacion de novel view synthesis: investigadores que necesitan comparar resultados con la version upstream pueden usar este binario con las mejoras del commit `1388f74` sin gestionar un toolchain de Rust.
- Generacion de activos para videojuegos y cine: capturar un objeto fisico y obtener un splat exportable que se pueda importar en pipelines de postproduccion.
- Evaluacion de hardware Apple Silicon para cargas 3D: medir tiempos de entrenamiento y consumo de memoria en chips M-series con el backend Metal, comparando con implementaciones CUDA.
- Reproducibilidad de experimentos: fijar la version del binario al commit `1388f74` permite repetir entrenamientos con un comportamiento conocido, evitando diferencias introducidas por releases posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de PSNR, SSIM, LPIPS ni tiempos de entrenamiento medidos.

## Requisitos de hardware

- Plataforma: exclusivamente macOS sobre Apple Silicon (`aarch64-apple-darwin`), con macOS 11 o superior.
- GPU: se requiere un chip Apple Silicon (M1 o posterior) con soporte Metal; no hay builds para x86_64, Linux ni Windows en este repositorio.
- VRAM: no disponible. El consumo dependera del numero de imagenes de entrada, del numero de splats (`--max-splats`) y de las iteraciones configuradas.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables; el binario no soporta CUDA.
- Despliegue: ejecucion directa del binario `brush-cli` desde la terminal; no se contemplan vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Tipo | Plataforma | Licencia | Notas |
|---|---|---|---|---|
| Brush CLI (este repositorio) | Gaussian splatting en Rust | macOS Apple Silicon (Metal via wgpu) | Apache 2.0 | Build no oficial del commit `1388f74`; incluye mejoras de eficiencia no presentes en v0.3.0 |
| Brush upstream (v0.3.0) | Gaussian splatting en Rust | Multiplataforma (segun build) | Apache 2.0 | Release oficial; no incluye las mejoras del commit `1388f74` |
| gaussian-splatting (INRIA) | Gaussian splatting en Python/CUDA | Linux con GPU NVIDIA | Licencia no comercial en versiones originales (consultar) | Implementacion de referencia academica; requiere CUDA |
| nerfstudio | Suite de NeRF y splatting en Python | Linux/Windows con CUDA | Apache 2.0 | Framework mas amplio, con soporte de multiples metodos; no es un binario unico |

La comparacion con modelos de lenguaje no procede: no comparte categoria, tarea ni metricas.

## Limitaciones y advertencias

- No es un modelo de IA generativa textual: no admite prompts, no genera texto ni codigo, y no dispone de ventana de contexto.
- Build no oficial: los autores de Brush no estan afiliados ni han respaldado este binario, segun la propia model card.
- Solo macOS Apple Silicon: no hay binarios para Linux, Windows ni Macs Intel, lo que limita su uso en servidores y clusters.
- El repositorio muestra un tamano de 0.0 GB y cero descargas, lo que puede indicar que el artefacto no esta disponible o que la metadata esta incompleta; conviene verificar la presencia real del `.tar.xz` antes de depender de el.
- Sin garantias de mantenimiento: el repositorio se creo y actualizo el 2026-10-26 y no hay indicios de soporte continuado.
- La licencia Apache 2.0 permite uso comercial del binario, pero el usuario debe cumplir tambien las condiciones del proyecto upstream y de las dependencias.
- Riesgo de resultados inconsistentes si se compara con la release oficial v0.3.0, dado que el commit incluye cambios de eficiencia no publicados como release.
- No se documentan sesgos, alucinaciones ni limitaciones linguisticas porque no aplican a esta herramienta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Merlef/brush-cli-builds
- Proyecto Brush upstream: https://github.com/ArthurBrussee/brush
- Commit de origen del build: https://github.com/ArthurBrussee/brush/commit/1388f74
