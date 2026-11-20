# crvscience/crvscience-neurospace-lab

## Resumen

`crvscience-neurospace-lab` (denominado internamente `neurospace-lab` v1.6.0) es una aplicacion de escritorio nativa escrita en Rust cuyo objetivo es la visualizacion y simulacion de topologia de redes neuronales en 3D, plasticidad estructural y citoarquitectura de la corteza cerebral. No se trata de un modelo de lenguaje ni de un modelo generativo de pesos: es una herramienta de software publicada en Hugging Face bajo el identificador `crvscience/crvscience-neurospace-lab`, con cero descargas y cero likes en el momento de redactar esta ficha.

La aplicacion se construye con el framework `eframe`/`egui` 0.31 para la interfaz nativa, `glam` 0.29 para matematicas de grafos y `rusqlite` 0.32 en modo WAL para persistencia, e incorpora un observatorio 3D sincronizado en el navegador mediante Three.js r128 (`web/neurospace_lab_preview.html`). La version 1.6.0 introduce dos novedades: un muestreo de flujo macroscopico disperso y suave (en lugar de rafagas densas por sinapsis) y el nivel Tier V (`M13`), que modela una columna neocortical de seis capas (`L1`-`L6`) con mallas neuronales 3D anatomicas.

Por su naturaleza, la relevancia de este repositorio es la de una herramienta de investigacion y visualizacion neurociencia computacional, no la de un modelo de IA entrenado. No hay informacion sobre parametros, contexto, licencia, idiomas ni pipeline en los metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion nativa en Rust (no es un modelo neuronal entrenado); topologia de red neuronal 3D, plasticidad estructural y citoarquitectura cortical |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene codigo fuente Rust, no pesos) |
| Version | `neurospace-lab` v1.6.0 |
| Dependencias principales | `eframe`/`egui` 0.31, `glam` 0.29, `rusqlite` 0.32 (WAL), `clap` 4.5, Three.js r128 |
| Garantia de seguridad | `#![forbid(unsafe_code)]` (Rust seguro) |
| Persistencia | SQLite en modo WAL mediante `rusqlite` |
| Interfaz | Nativa (`eframe`/`egui`) mas observatorio 3D web sincronizado |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino una aplicacion de escritorio escrita en Rust con la directiva `#![forbid(unsafe_code)]`, lo que garantiza que todo el codigo del crate es Rust seguro. La interfaz nativa se construye sobre `eframe`/`egui` 0.31, las operaciones matematicas y de grafos sobre `glam` 0.29, la persistencia sobre `rusqlite` 0.32 con registro de escritura anticipada (WAL) y el parseo de argumentos de linea de comandos sobre `clap` 4.5. El observatorio web se sirve como un fichero HTML con Three.js r128 (`web/neurospace_lab_preview.html`) sincronizado con la vista nativa.

En cuanto al contenido simulado, la version 1.6.0 incorpora el nivel Tier V (`M13`), que modela una columna neocortical canonica de seis capas desde la pia madre (`+Y`) hasta la sustancia blanca subcortical (`-Y`): entrada talamica, granulos espinosos estrellados de `L4`, piramidales de asociacion de `L2/3`, piramidales de penacho grueso de `L5`, fusiformes corticotalamicos de `L6` y salida a sustancia blanca, ademas del plexo horizontal molecular de `L1`, interneuronas GABAergicas de cesto y Martinotti, y astrocitos protoplasmicos. Las mallas neuronales son 3D anatomicas (cuerpos piramidales conicos/redondeados, troncos dendriticos apicales 3D, penachos apicales en capa I, faldones dendriticos basales, monticulos axonales y arborizaciones estrelladas multipolares de `L4`). El muestreo de flujo se ha redisenado para usar ondas sinusoidales desvanecidas sobre aproximadamente el 10% de las vias representativas (por defecto), con un maximo de 16-22 ondas escalonadas y pausas refractarias. No hay informacion sobre entrenamiento, dataset o tecnicas de RLHF/DPO porque no aplica.

## Capacidades

- Visualizacion 3D interactiva de topologia de redes neuronales y plasticidad estructural en una aplicacion nativa.
- Modelado de citoarquitectura cortical de seis capas (`L1`-`L6`) en el nivel Tier V (`M13`).
- Renderizado de mallas neuronales 3D anatomicas (piramidales, estrelladas, fusiformes, interneuronas y astrocitos).
- Muestreo de flujo macroscopico suave y disperso con ondas sinusoidales desvanecidas y pausas refractarias.
- Observatorio 3D web sincronizado mediante Three.js r128.
- Ejecucion de benchmarks headless por linea de comandos: `bench-dataset` (barrer los 15 modelos sobre el dataset bloqueado D4 de especies vegetales) y `bench-model` (barrer los 7 datasets sobre el modelo M13 de corteza cerebral).
- Persistencia de estado en SQLite con WAL.
- Suite de tests unitarios e de integracion ejecutable con `cargo test`.

## Casos de uso

- Investigacion en neurociencia computacional: el modelo `M13` permite explorar la citoarquitectura de una columna cortical de seis capas con tipos celulares diferenciados, util para comparar hipotesis sobre conectividad laminar.
- Docencia y divulgacion: la visualizacion 3D nativa mas el observatorio web permiten mostrar la anatomia de una columna neocortical a estudiantes sin necesidad de infraestructura de simulacion pesada.
- Barrido comparativo de datasets: el comando `bench-dataset --dataset D4 --steps 80` ejecuta los 15 modelos sobre el dataset bloqueado de especies vegetales, lo que facilita comparaciones reproducibles en un entorno headless.
- Barrido comparativo de modelos: `bench-model --model M13 --steps 80` recorre los 7 datasets sobre el modelo cortical, util para caracterizar el comportamiento de `M13` en distintos dominios.
- Desarrollo de herramientas de visualizacion cientifica: el codigo Rust seguro y las dependencias acotadas (`egui`, `glam`, `rusqlite`, `clap`) sirven de base para extender visores 3D de redes biologicas.
- Integracion en pipelines de CI: la suite `cargo test` y los comandos headless permiten validar de forma automatizada cambios en la topologia o en los modelos simulados.
- Analisis de flujo de senal: el muestreo de flujo disperso con ondas escalonadas y pausas refractarias facilita estudiar direccionalidad de senal sin saturacion visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta los comandos para ejecutar barridos (`bench-dataset` y `bench-model`) con `--steps 80`, pero no incluye cifras de rendimiento, precision ni latencia.

## Requisitos de hardware

- No es un modelo de pesos: no requiere VRAM para inferencia ni GPU dedicada en el sentido habitual de despliegue de LLM.
- La aplicacion nativa se compila con `cargo run --release`; el requisito principal es una toolchain de Rust y dependencias del sistema para `eframe`/`egui` (ventana y contexto grafico).
- El observatorio web requiere un navegador con soporte de WebGL para Three.js r128.
- GPU recomendadas: no disponible. Al ser una aplicacion de escritorio con renderizado 3D, se beneficia de cualquier GPU con aceleracion grafica estandar, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Opciones de despliegue: ejecucion local como binario nativo (`cargo run --release`), modo headless por CLI para benchmarks y servido del fichero HTML `web/neurospace_lab_preview.html` en un navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos o herramientas comparables de la misma categoria (visualizacion y simulacion de topologia neuronal 3D en Rust).

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no debe evaluarse con criterios de MMLU, HumanEval, GSM8K ni similares.
- La licencia no esta declarada en los metadatos ni en la model card, por lo que el uso comercial queda sin marco legal explicito hasta que el autor lo aclare.
- Los idiomas soportados no estan declarados.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de validacion por parte de la comunidad.
- No se han publicado benchmarks ni resultados de validacion cientifica de los modelos simulados (`M13`, `D4`, etc.).
- El proyecto depende de versiones concretas de crates (`eframe`/`egui` 0.31, `glam` 0.29, `rusqlite` 0.32, `clap` 4.5) y de Three.js r128; actualizaciones de esas dependencias pueden romper la compilacion.
- La fecha de creacion y actualizacion del repositorio (2026-11-20) es posterior a la fecha habitual de referencia, lo que conviene verificar antes de tratarlo como estable.
- No hay informacion sobre sesgos, alucinacion o limitaciones de contexto porque no aplica a una herramienta de visualizacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/crvscience/crvscience-neurospace-lab
- Observatorio web incluido en el repositorio: `web/neurospace_lab_preview.html` (ruta relativa dentro del propio repositorio)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
