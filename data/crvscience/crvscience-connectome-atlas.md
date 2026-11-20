# crvscience/crvscience-connectome-atlas

## Resumen

ConnectomeAtlas (paquete `connectome-atlas` v0.8.0) es una estación de trabajo de escritorio, analizador CLI y biblioteca de análisis de conectomas cerebrales multiescala escrita en Rust seguro (`#![forbid(unsafe_code)]`). A pesar de su identificador en Hugging Face, no es un modelo de lenguaje ni una red neuronal entrenada: es una herramienta de neuroimagen que integra un visor 3D interactivo, parsers binarios de formatos neuroanatómicos (NIfTI-1, TrackVis `.trk`, SWC) y una bóveda de persistencia SQLite en modo WAL. La desarrolla crvscience y se distribuye bajo licencia GPL-3.0-or-later.

El proyecto resuelve un problema concreto del ámbito de la neurociencia computacional: disponer de un entorno unificado, reproducible y auditable para explorar conectomas de referencia a distintas escalas, calcular rutas de señalización ponderadas (Dijkstra), modelar lesiones focales y tractotomías virtuales, y analizar métricas topológicas como Rich-Club o participación nodal. Incluye cuatro conectomas de referencia precargados: humano (MNI152), ratón (CCFv3), mosca de la fruta (FlyWire FAFB v783) y nematodo (WormAtlas).

La relevancia actual radica en su enfoque de ingeniería: Rust seguro, renderizado con `wgpu` 24.0 y shaders WGSL, interfaz nativa con `egui`/`eframe` 0.31, y una CLI sin interfaz gráfica para automatizar análisis. Está pensado para investigadores y desarrolladores que necesiten integrar análisis conectómicos en pipelines reproducibles, no para tareas de generación de texto o razonamiento lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación de escritorio y CLI en Rust seguro; cinco crates (`atlas-core`, `atlas-io`, `atlas-render`, `atlas-cli`, `atlas-gui`) |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (interfaz y documentación en inglés) |
| Licencia | GNU General Public License v3.0 or later (GPL-3.0-or-later) |
| Formato de pesos | no disponible; formatos de datos soportados: NIfTI-1 (`.nii`, `.nii.gz`), TrackVis `.trk`, `.swc`, CSV, `.connectome.json` (SHA-256) y SQLite WAL |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no hay datos de entrenamiento, tokens procesados ni fases de RLHF/DPO. La arquitectura es un workspace de Rust organizado en cinco crates con responsabilidades separadas: `atlas-core` implementa las estructuras de datos estereotáxicas multiescala, los cuatro conectomas de referencia, rutas de señalización por Dijkstra, métricas de Rich-Club y participación, y modelado de impacto de lesiones focales y tractotomías virtuales; `atlas-io` proporciona lectores binarios seguros para NIfTI-1, TrackVis `.trk`, morfologías `.swc`, matrices CSV, envoltorios `.connectome.json` con SHA-256 y persistencia SQLite WAL mediante `rusqlite`.

El renderizado corre en `atlas-render`, con cámara orbital y de corte estereotáxico (`glam`), generación de curvas de tractos DTI con interpolación Catmull-Rom y flujo laminar tónico no estroboscópico, proyector 3D con ordenación por profundidad y un módulo de shaders WGSL sobre `wgpu` 24.0. La interfaz nativa usa `eframe`/`egui` 0.31 con visor Glass Brain, planos de corte axial, coronal y sagital, sondas de inspección, ruta y lesión, mapa de calor de adyacencia ordenado por comunidad y gestor de instantáneas SQLite. La versión v0.7.0 incorpora fascículos multifibra trenzados con sombreado anisotrópico Kajiya-Kay/Banks, mapas de calor corticales continuos con shader Fresnel y cortes quirúrgicos interactivos por octante y hemisferio.

## Capacidades

- Visualización 3D interactiva de conectomas multiescala con vista Glass Brain y planos de corte axial, coronal y sagital.
- Lectura segura de volúmenes NIfTI-1 (`.nii` y `.nii.gz`), flujos de líneas de difusión TrackVis `.trk` y morfologías `.swc`.
- Cálculo de rutas de señalización ponderadas mediante Dijkstra entre regiones de interés.
- Modelado de tractotomías virtuales y lesiones focales con análisis de impacto.
- Métricas topológicas: Rich-Club, participación nodal, armónicos laplacianos y análisis de criticalidad (parámetro kappa).
- Control de receptores con ganancia ajustable (por ejemplo, `--receptor ht --gain 1.2`).
- Exportación e importación de conectomas en `.connectome.json` con verificación SHA-256, sincronizado con una vista previa HTML5/Three.js.
- Persistencia y auditoría mediante SQLite en modo WAL con gestor de instantáneas.
- CLI sin interfaz gráfica (`atlas-cli`) para listar presets, inspeccionar cabeceras de `.nii.gz` y `.trk`, y automatizar análisis.
- Renderizado GPU con shaders WGSL, fascículos trenzados y sombreado anisotrópico.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas, visión artificial, tool calling ni capacidades de agente.

## Casos de uso

- Investigación en neuroimagen estructural: cargar volúmenes NIfTI-1 y flujos `.trk` de difusión para inspeccionar cabeceras y validar datos antes de integrarlos en pipelines de análisis, gracias a los lectores binarios seguros de `atlas-io`.
- Análisis de rutas de señalización: calcular la ruta ponderada más corta entre regiones, por ejemplo de `LANG.Wernicke_L` a `LANG.Broca_L` en el preset `human_mni152`, para estudiar circuitos del lenguaje.
- Planificación quirúrgica exploratoria: simular tractotomías virtuales sobre el cuerpo calloso (`--tract "Corpus Callosum"`) y evaluar el impacto en la conectividad antes de procedimientos reales.
- Docencia y divulgación: usar el visor 3D interactivo con los cuatro conectomas precargados (humano, ratón, mosca y nematodo) para explicar organización multiescala del sistema nervioso.
- Neurociencia comparada: contrastar topologías de conectomas de especies distintas (302 neuronas en *C. elegans* frente a 139.255 neuronas en *Drosophila*) mediante métricas de Rich-Club y participación.
- Automatización en pipelines reproducibles: invocar `atlas-cli` en scripts para exportar conectomas a JSON, auditar la bóveda SQLite o calcular armónicos laplacianos sin intervención manual.
- Modelado de estimulación y receptores: aplicar control de ganancia sobre receptores específicos para explorar hipótesis sobre neuromodulación en redes intrínsecas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el consumo depende del renderizado GPU de `wgpu` 24.0, no de pesos de modelo.
- GPU recomendadas: no disponible en la información proporcionada; se requiere una GPU compatible con `wgpu` 24.0 para el visor 3D (`atlas-gui`). La CLI (`atlas-cli`) funciona sin GPU.
- Cabe en GPU de consumo: previsiblemente sí para el visor, dado que renderiza mallas y tractos y no modelos de lenguaje; no se especifican modelos concretos.
- Opciones de despliegue: compilación con Cargo (`cargo run --release -p atlas-gui` para la estación de trabajo, `cargo run --release -p atlas-cli` para la CLI) y ejecución de tests con `cargo test --workspace`. No se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Tipo | Conectomas precargados | Formatos de entrada | Licencia | Interfaz |
|---|---|---|---|---|---|
| ConnectomeAtlas v0.8.0 | Escritorio + CLI en Rust | 4 (humano, ratón, mosca, nematodo) | NIfTI-1, `.trk`, `.swc`, CSV, JSON | GPL-3.0-or-later | GUI nativa + CLI |
| Modelos de lenguaje open source | Red neuronal generativa | no aplica | no aplica | variable | API / chat |
| Herramientas de neuroimagen genéricas | Visor / análisis | no disponible | variable | variable | variable |

No se dispone de información sobre alternativas directas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni procesa imágenes de forma general. Cualquier expectativa de uso como LLM es incorrecta.
- Los conectomas precargados son referencias estáticas y simplificadas (por ejemplo, 35 ROIs en el caso humano frente a las 360 parcelas de HCP-MMP1.0), por lo que no sustituyen atlas de alta resolución para estudios cuantitativos finos.
- Los resultados de tractotomías virtuales y lesiones son modelos computacionales, no predicciones clínicas validadas; no deben usarse para decisiones médicas.
- Licencia GPL-3.0-or-later: su integración en productos propietarios exige cumplir con las obligaciones de copyleft de la GPL.
- La información de idiomas, sesgos y alucinación no aplica al no ser un modelo generativo; no obstante, los datos neuroanatómicos pueden contener imprecisiones propias de las fuentes citadas.
- El proyecto tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin pipeline definido ni model card estándar de modelo de IA, lo que sugiere un ecosistema y comunidad aún incipientes.
- No se especifican requisitos mínimos de GPU, versiones de Rust ni plataformas soportadas más allá de las dependencias citadas.

## Enlaces

- Hugging Face: https://huggingface.co/crvscience/crvscience-connectome-atlas
- Sitio web: https://crvscience.com
- Aplicaciones públicas: https://crvscience.com/apps
- HCP-MMP1.0: https://pmc.ncbi.nlm.nih.gov/articles/PMC4990127/
- AAL3v1: https://www.oxcns.org/aal3.html
- Allen Mouse Brain CCFv3: https://alleninstitute.github.io/CCF-MAP/descriptions/mouse_ccf.html
- FlyWire FAFB: https://codex.flywire.ai/faq
- Dorkenwald et al., *Nature* 2024: https://www.brainfacts.org/neuroscience-in-society/supporting-research/2024/researchers-create-first-adult-fruit-fly-brain-connectome-110724
- WormAtlas: https://www.wormatlas.org/neuronalwiring.html
- Varshney et al. 2011: https://arxiv.org/html/0907.2373v4
- Cook et al. 2019: https://pmc.ncbi.nlm.nih.gov/articles/PMC10983851/
- TrackVis `.trk`: https://pmc.ncbi.nlm.nih.gov/articles/PMC11631367/
- Crate `nifti`: https://docs.rs/nifti
- Crate `rusqlite`: https://docs.rs/rusqlite
- Crate `wgpu`: https://docs.rs/wgpu
- Crate `eframe`: https://docs.rs/eframe/latest/eframe/
