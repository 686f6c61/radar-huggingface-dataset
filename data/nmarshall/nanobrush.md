# nmarshall/nanobrush

## Resumen

`nmarshall/nanobrush` no es un modelo de inteligencia artificial. Es un repositorio de preservación digital y de investigación técnica publicado en HuggingFace que aloja los materiales originales de Microbrush (un editor gráfico histórico) junto con documentación, herramientas de verificación y un códec de ficheros DAT escrito en Rust. La model card lo describe explícitamente como «Microbrush preservation and a planned native Rust/Bevy/Solari reconstruction for macOS and Linux», y aclara que la reescritura de la aplicación «has not started». Por tanto, no existen pesos, tokenizador, arquitectura neuronal ni proceso de entrenamiento que evaluar.

El repositorio combina tres capas: (1) un archivo inmutable de artefactos originales (ZIP sin modificar, bytes extraídos, inventarios con hashes y listas SHA256SUMS), distribuido mediante punteros Git LFS y el sistema Xet; (2) un conjunto de herramientas de análisis y extracción reproducible ejecutables en un entorno Nix, con hooks de pre-commit y pre-push que validan el almacenamiento; y (3) trabajo de ingeniería inversa sobre el formato binario DAT y sobre el convertidor original, que se ejecuta sin modificar bajo Mono con ILSpy fijado por versión.

Su relevancia es de tipo archivístico y de ingeniería de formatos, no de IA: documenta la procedencia y los términos de licencia del contenido original, permite verificar la integridad byte a byte de cinco builds recuperados y sirve de base para una futura reimplementación nativa en Rust con Bevy y Solari. Los datos de adopción en HuggingFace son nulos (0 descargas, 0 likes) y el repositorio figura con 0.0 GB, un tamaño que no refleja el payload real, transferido por Xet.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo de IA. Repositorio de preservación con herramientas en Rust (crate `mb3-dat`) y scripts de análisis; reescritura nativa planificada en Rust/Bevy/Solari, no iniciada |
| Parámetros totales | No disponible / no aplica |
| Parámetros activos | No aplica (no es un modelo MoE ni existe modelo alguno) |
| Longitud de contexto | No disponible / no aplica |
| Tipos de cuantización | No disponible / no aplica |
| Idiomas soportados | No disponible. La documentación y la model card están redactadas en inglés; no se declara ningún conjunto de idiomas |
| Licencia | No disponible en los metadatos. La model card indica que se conservan los textos de licencia originales y que «preservation does not grant a new license to the original content»; los términos quedan registrados en los findings |
| Formato de pesos | No aplica. Los artefactos se almacenan como ZIP originales, bytes extraídos, inventarios JSON y sumas SHA256; el payload viaja por Git LFS y Xet mediante punteros en Git |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento. La «arquitectura» del proyecto es una organización de repositorio único con una sola historia Git: el texto (código, tests, scripts, documentación propia y manifiestos pequeños) se versiona como Git ordinario, mientras que todo fichero bajo `assets/` o bajo cualquier directorio llamado `references/` se almacena como puntero LFS con transferencia de payload por Xet. La estructura incluye `assets/references/archives/` (ZIP originales sin cambios), `provenance/collection/` (README, informe, manifiesto y checksums aportados), `provenance/historical/` (páginas e índices de archivo), `extracted/<build>/` (bytes de miembros extraídos sin modificar), `inventories/<build>.json` (hashes y metadatos del ZIP original) y `SHA256SUMS` con rutas de archivo reubicadas.

El utillaje técnico se apoya en un flake de Nix (`nix develop`) que instala filtros y hooks locales de código/LFS/Xet, con soporte de `direnv` y overrides vigilados sobre `~/src/scripts/my-nix` y `~/src/me/tools`. La extracción (`unpack-references`, por defecto sobre las cinco builds) verifica hashes y CRC de los archivos antes de extraer, rechaza miembros inseguros, escribe de forma atómica, comprueba salidas existentes y se niega a sobrescribir ficheros modificados; los locks interrumpidos requieren inspección manual antes de su eliminación. El códec `crates/mb3-dat` ofrece lectores y escritores acotados sin dependencias para las dos versiones DAT recuperadas, y la investigación del convertidor (`analyze-converter decompile|probes|check`) reproduce la evidencia del ensamblado gestionado y 101 sondas controladas, con Mono/ILSpy fijados en el shell de Nix. No se ejecuta ningún compilador ni ejecutable original durante la instalación o la extracción.

## Capacidades

- Preservación verificable de artefactos: archivo de los ZIP originales, de los bytes extraídos y de los metadatos de cada build, con hashes reproducibles.
- Extracción determinista y segura: validación previa de hash/CRC, rechazo de miembros peligrosos, escritura atómica y protección contra sobrescritura de ficheros alterados.
- Verificación de integridad en dos niveles: `assets-check` comprueba cada payload contra la identidad del puntero en el índice, y `shasum -a 256 -c assets/references/SHA256SUMS` valida desde la raíz del repositorio.
- Indexación y cartografía de fuentes: `map-references` regenera el mapa estático respaldado por Xet y los índices Markdown de Core y herramientas; `check-reference-map` comprueba que sean reproducibles y estén actualizados.
- Inspección de formato binario: `inspect-mb3dat <file>` examina de forma segura cualquiera de las dos versiones DAT recuperadas, documentadas en `docs/MB3_DAT.md`.
- Códec DAT en Rust: lectores/escritores acotados sin dependencias, con round-trip byte a byte sobre las 58 salidas DAT capturadas.
- Ingeniería inversa del convertidor: descompilación reproducible con ILSpy bajo Mono y 101 sondas controladas, con capturas y descompilaciones almacenadas como activos Xet.
- Construcción reproducible: check de Nix sin activos (`nix build .#checks.aarch64-darwin.rust --no-link`) que ejecuta formateo, Clippy, tests unitarios y doctests.
- No ofrece generación de texto, razonamiento, código generativo, visión, audio, tool calling, agentes ni soporte multilingüe: no es un modelo.

## Casos de uso

- Preservación digital de software histórico: el repositorio conserva los ZIP originales, los bytes extraídos y los inventarios con hashes de cinco builds, de modo que un archivo puede reconstruir el material original sin depender de binarios en ejecución.
- Auditoría de procedencia y licencias: `provenance/collection` y `provenance/historical` agrupan README, informes, manifiestos y checksums aportados, lo que permite trazar el origen de cada artefacto y revisar los términos registrados antes de cualquier reutilización.
- Ingeniería inversa de formatos binarios: el par `inspect-mb3dat` más la documentación `docs/MB3_DAT.md` sirve para analizar ficheros DAT de cualquiera de las dos versiones sin arriesgar corrupción del original.
- Desarrollo de codecs compatibles: `crates/mb3-dat` actúa como base para implementar lectura/escritura de DAT en herramientas de terceros, con la garantía de round-trip exacto sobre 58 capturas y tests ejecutables sin activos.
- Reconstrucción de una aplicación nativa: el proyecto planifica una reimplementación en Rust con Bevy y Solari para macOS y Linux, apoyada en `docs/FORMATS.md`, `docs/HOST_APIS.md`, `docs/PLUGINS.md`, `docs/DEPENDENCIES.md` y el libro de paridad `docs/parity.md`.
- Integración en cadena de suministro reproducible: el flake de Nix y los hooks de pre-commit/pre-push permiten que un equipo CI valide almacenamiento, filtros e historia nueva antes de publicar, evitando subir payloads fuera del mecanismo LFS/Xet.
- Estudio de compatibilidad de convertidores: `analyze-converter` reproduce la evidencia del ensamblado gestionado y las 101 sondas, útil para documentar el contrato binario sin ejecutar el convertidor original.
- Docencia o revisión de metodología de archivo: el conjunto de comandos (`check-environment`, `check-storage`, `test-setup`, `assets-check`, `verify-references --check-extracted`, `unpack-references --dry-run`, `index-references`) ejemplifica un flujo de verificación por etapas replicable en otros proyectos de preservación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes porque no hay modelo. Las únicas cifras verificables del repositorio son de verificación funcional:

| Comprobación | Resultado declarado |
|---|---|
| Round-trip del códec DAT (`crates/mb3-dat`) | 58 salidas DAT capturadas con round-trip byte a byte exacto |
| Sondas del convertidor (`analyze-converter probes`) | 101 sondas controladas |
| Builds procesadas por `unpack-references` | 5 builds por defecto (`--build 2016-03-10-c` para una concreta) |
| Check de Nix sin activos | `nix build .#checks.aarch64-darwin.rust --no-link`: formato, Clippy, tests unitarios y doctests |
| Adopción en HuggingFace | 0 descargas, 0 likes |

## Requisitos de hardware

- No requiere GPU ni VRAM: no hay inferencia. Los requisitos son de CPU, disco y red.
- Entorno de desarrollo: shell de Nix (`nix develop`) con filtros locales de código/LFS/Xet y hooks; opcionalmente `direnv allow` para carga automática del entorno.
- Herramientas fijadas por el shell: Mono e ILSpy para la investigación del convertidor, más Python 3 para `scripts/<name>.py` y la cadena de Rust para el workspace.
- Almacenamiento: el tamaño mostrado en HuggingFace es 0.0 GB, pero el payload real (ZIP, bytes extraídos, capturas y descompilaciones) se transfiere por Xet y debe hidratarse con `assets-fetch`; conviene prever espacio en disco para las cinco builds y sus extracciones.
- Plataformas cubiertas: el check de Nix documentado es `aarch64-darwin`; la model card menciona macOS y Linux como objetivos de la reconstrucción. `docs/SETUP.md` recoge la cobertura de plataformas y lo que queda pendiente.
- Red: necesaria para la clonación con `GIT_LFS_SKIP_SMUDGE=1` y para la hidratación posterior del payload; no se documentan cifras de latencia ni de throughput.
- Despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI; el «despliegue» aquí es un clon del repositorio con el entorno Nix y los comandos de verificación.

## Comparativa con modelos similares

No disponible. Este repositorio no pertenece a la categoría de modelos de lenguaje ni de modelos multimodales, por lo que no existe una comparación homogénea en parámetros, contexto, rendimiento o licencia frente a alternativas tipo LLM. Tampoco se han proporcionado en la información otros proyectos de preservación con los que establecer una comparación cifrada; cualquier tabla frente a modelos de IA sería engañosa.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona, no ejecuta código generado ni admite tool calling. Cualquier expectativa de inferencia es un error de categoría.
- Licencia no declarada en los metadatos. La model card advierte de que la preservación no concede una licencia nueva sobre el contenido original y remite a los términos registrados en los findings; es imprescindible revisarlos antes de cualquier uso comercial o redistribución.
- La reescritura de la aplicación «has not started»: no hay producto nativo utilizable, solo materiales y trabajo de investigación.
- Comportamiento nativo del editor sin verificar: el convertidor se ejecuta sin modificar bajo Mono, pero la model card indica que «native editor behavior remains unverified».
- Los tests de integración del convertidor requieren activos Xet; sin hidratar y verificar los fixtures (`analyze-converter check`), la cobertura de pruebas queda parcial.
- Los locks interrumpidos de la extracción requieren inspección manual antes de eliminarse; no se resuelven automáticamente.
- Git no rastrea directorios vacíos: los directorios originales vacíos solo se restauran al desempaquetar, no al clonar.
- Riesgo operativo en el manejo del almacenamiento: desactivar los filtros para añadir un payload rompe el modelo de verificación; el flujo correcto exige `git add`/`commit`/`push hf main` con los punteros incluidos.
- El tamaño de 0.0 GB mostrado por HuggingFace no representa el volumen real de datos, que se transfiere por Xet; planificar disco y red en consecuencia.
- Sesgos, alucinación y limitaciones de contexto o idioma: no aplica, al no existir modelo; no se dispone de evaluación alguna en esos ejes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nmarshall/nanobrush
- Lista de trabajo: `docs/TODO.md` (ruta interna del repositorio, sin URL externa proporcionada)
- Objetivos: `docs/GOALS.md` (ruta interna)
- Hallazgos iniciales y términos de licencia registrados: `docs/FINDINGS.md` (ruta interna)
- Validación de la instalación y cobertura de plataformas: `docs/SETUP.md` (ruta interna)
- Formatos: `docs/FORMATS.md` (ruta interna)
- API de host: `docs/HOST_APIS.md` (ruta interna)
- Plugins: `docs/PLUGINS.md` (ruta interna)
- Dependencias: `docs/DEPENDENCIES.md` (ruta interna)
- Libro de paridad: `docs/parity.md` (ruta interna)
- Investigación del convertidor: `docs/CONVERTER.md` (ruta interna)
- Experimento E02: `docs/experiments/converter-2026-10-21.md` (ruta interna)
- Contrato binario DAT: `docs/MB3_DAT.md` (ruta interna)
- API y límites del códec Rust: `docs/RUST_DAT.md` (ruta interna)
- No se han proporcionado en la información disponible papers, blogs, demos ni repositorios externos adicionales.
