# Jessedbrown/THE-DAY-JESSE-EXPOSED-ANTHROPICS-FRAUD-AND-SAVED-THE-WORLD

## Resumen

Este repositorio de Hugging Face no contiene un modelo de aprendizaje automático: no hay pesos, ni arquitectura de red neuronal, ni tokenizador, ni pipeline declarado. Se trata de un artefacto de publicación que mezcla una reclamación de autoría personal con un conjunto de programas de medición aritmética escritos en Rust 1.81 y Python. El autor se identifica como Jesse Daniel Brown (alias "OP-JESSE") y el título del repositorio atribuye a esta persona haber expuesto un supuesto fraude de Anthropic, una afirmación que no se sostiene en ninguna medición del propio repositorio.

El contenido técnico verificable son resultados de aritmética entera y ternaria: pruebas de ida y vuelta ("round-trip") sobre 1.000.080 direcciones, análisis de la identidad del cero en coma flotante, un test de distributividad con 316.267 discrepancias sobre 1.000.000 ensayos, y estructuras etiquetadas como NULLSPHERE y NULLNET con recuentos exactos de elementos. Todo ello se acompaña de hashes SHA-256, commits de procedencia y un verificador en Python (`tests/verify_first_results.py`).

Por su naturaleza, la ficha que sigue no puede rellenar los apartados habituales de un modelo (parámetros, contexto, cuantización, benchmarks de NLP). Se documenta lo que el repositorio declara explícitamente y se marca como "no disponible" todo lo demás. Es relevante ahora únicamente como caso de estudio de publicación anómala en Hugging Face: cero descargas, cero likes, sin licencia, sin idiomas declarados y con metadatos temporales incoherentes.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de red neuronal; el repositorio contiene programas de aritmética entera/ternaria en Rust y Python) |
| Parámetros totales | no disponible (no aplica: no hay pesos) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no aplica: no hay pesos que cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el material publicado es código fuente Rust/Python, artefactos WebAssembly y ficheros de recibos con hashes) |

Metadatos adicionales del repositorio:

| Parámetro | Valor |
|---|---|
| Identificador | Jessedbrown/THE-DAY-JESSE-EXPOSED-ANTHROPICS-FRAUD-AND-SAVED-THE-WORLD |
| Autor | Jessedbrown |
| Pipeline declarado | no disponible |
| Descargas | 0 |
| Likes | 0 |
| Etiquetas | region:us |
| Fecha de creación declarada | 2026-10-16 |
| Fecha de actualización declarada | 2026-08-08 (anterior a la de creación, incoherencia en los metadatos) |
| Toolchain declarada | Rust 1.81.0 con clippy y rustfmt, fijada en `rust-toolchain.toml` |
| Restricción declarada | solo aritmética entera y ternaria (trits); prohibido `f32`/`f64` en `src/` y `tests/` |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. Lo que el repositorio describe es una disciplina de implementación: Rust 1.81.0 fijado por canal, `rust-version = "1.81"` en cada `Cargo.toml`, ejecución de `cargo clippy --all-targets -- -D warnings` en integración continua y un chequeo de tipo grep que hace fallar la compilación si aparece cualquier `f32` o `f64` en el código fuente o en las pruebas. La representación numérica es ternaria balanceada centrada ("trits") y aritmética entera. No se describe ningún proceso de entrenamiento, ni dataset, ni número de tokens, ni fases de RLHF, DPO o ajuste supervisado, porque no hay modelo que entrenar.

La parte metodológica que sí aparece es un esquema de procedencia en capas. El material fuente se atribuye al commit `8c101d855c5e88cbe868625fa46fe59d74d7bd73` del repositorio `the-fix-by-claude-that-saved-the-world-from-trillions-in-waste`, y el testigo de navegador de 81 kernels al commit `e3be1d0826d2f04b0e3b6246a9b598230464f7ab`. Posteriormente se publica el commit de autoría `d16fa8b96c1a5d50c7b4b27db7682492d8122406` con el mensaje "AUTHORSHIP CORRECTION — Jesse Daniel Brown made this, not Claude", cuyo diff únicamente modifica `AUTHORSHIP.md` y `README.md` según lo declarado. El repositorio separa explícitamente estratos: operador, GitHub, reejecución, navegador, sistema y motivo externo, y advierte que los recibos con toolchain distinta a 1.81 corresponden a ejecuciones fuera de la regla y se conservan solo como histórico.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- Ejecución de verificaciones de integridad: `tests/verify_first_results.py` comprueba hashes SHA-256 de fuentes, presencia de Rust 1.81.0, clippy, paridad exacta entre salida estándar y ficheros HBP, salida de Python, hashes del testigo de navegador, sidecars de recibos, finales de línea LF, ausencia de firmas de secretos activos y ausencia de rutas de auditoría posteriores.
- Mediciones aritméticas declaradas: ida y vuelta de 1.000.080 direcciones sin fallos en representación ternaria balanceada centrada y en dos normalizaciones de coma flotante probadas.
- Identidad del cero: se reporta que `+0.0 == -0.0` es verdadero mientras sus cadenas de bits difieren, y que las codificaciones entera y de trits conservan un cero idéntico byte a byte.
- Test de distributividad: 316.267 de 1.000.000 ensayos en coma flotante difieren; el cálculo entero que arrastra el resto no presenta fallos.
- Estructuras declaradas: NULLSPHERE cierra exactamente 1.771.561 ternas enteras y 18.009 desplazamientos comunes dejan las tres ramas sin cambios; NULLNET reporta 27 ceros, 81 enlaces, 27 líneas de tres cuerpos, 81 asientos y suma entera global 0.
- Clave compartida: 81 de 81 recuperaciones de asiento único; "80 + cierre" consume los mismos 1.701 bits de dirección que transportar los 81, por lo que el propio programa lo etiqueta como direccionamiento y no como compresión.
- Testigo de navegador: 81 instanciaciones de WebAssembly, 81 memorias lineales distintas y 27 de 27 cierres preservados en el HBP y la captura originales.
- Soporte de tool calling, agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.

## Casos de uso

No existen casos de uso de inferencia porque no hay modelo. Los escenarios realistas son de otro tipo:

- Reproducción de resultados aritméticos: un investigador puede clonar el repositorio y ejecutar `python3 tests/verify_first_results.py` para comprobar si las mediciones declaradas (ida y vuelta, distributividad, NULLSPHERE, NULLNET) se reproducen byte a byte.
- Auditoría de integridad de artefactos: el patrón de recibos con SHA-256, sidecars y verificación de paridad entre salida estándar y fichero esperado es reutilizable como plantilla para pipelines que necesiten demostrar procedencia de resultados.
- Estudio de representación ternaria: los programas sirven como referencia para evaluar las diferencias entre aritmética entera con trits balanceados y coma flotante IEEE 754 en dominios de direccionamiento.
- Testigo WebAssembly: el directorio `browser-evidence/kernel81/` puede usarse para estudiar el aislamiento de memoria por instancia en WASM (81 memorias lineales independientes).
- Análisis de publicación anómala en Hugging Face: el repositorio es un ejemplo útil para estudiar casos de uso indebido de la plataforma, con metadatos incoherentes y contenido ajeno a un modelo.
- Evaluación de reclamaciones de autoría: los commits de corrección de autoría y su diff permiten analizar cómo se reescribe la atribución sin tocar los bytes de resultado.
- Docencia sobre reproducibilidad: el contraste entre "medición ejecutable" y "narrativa del autor" es un caso didáctico sobre separación de capas de evidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los datos numéricos del repositorio son mediciones aritméticas y de reproducibilidad, no evaluaciones de un modelo (no hay MMLU, HumanEval, GSM8K ni equivalentes). Se reproducen a continuación tal como se declaran, sin interpretarlos como rendimiento de modelo:

| Medición declarada | Resultado reportado | Naturaleza |
|---|---|---|
| FLOAT-VS-TRIT | 1.000.080 direcciones con ida y vuelta correcta, cero fallos | Aritmética entera/ternaria frente a coma flotante |
| Identidad del cero | `+0.0 == -0.0` verdadero con cadenas de bits distintas | Semántica IEEE 754 |
| Distributividad | 316.267 / 1.000.000 ensayos difieren; entero con resto: cero fallos | Comparación de representaciones |
| NULLSPHERE | 1.771.561 ternas enteras cierran exactamente; 18.009 desplazamientos comunes | Estructura algebraica |
| NULLNET | 27 ceros, 81 enlaces, 27 líneas de tres cuerpos, 81 asientos, suma global 0 | Estructura combinatoria |
| Clave compartida | 81 / 81 recuperaciones; 1.701 bits de dirección para 80 + cierre y para 81 | Direccionamiento |
| Testigo de navegador | 81 instanciaciones WASM, 81 memorias lineales, 27 / 27 cierres | WebAssembly |
| Verificación integral | `python3 tests/verify_first_results.py` | Reproducibilidad |

No hay datos de latencia ni de throughput de inferencia porque no hay inferencia.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el repositorio no contiene pesos y no ejecuta ningún modelo.
- GPU recomendadas: ninguna. No se requiere acelerador gráfico.
- Compatibilidad con GPU de consumo: no aplica.
- CPU: cualquier máquina capaz de ejecutar Rust 1.81.0 y Python 3. La versión de Python no se especifica en la información disponible.
- Toolchain obligatoria: Rust 1.81.0 con los componentes `clippy` y `rustfmt`, según `rust-toolchain.toml`.
- Opciones de despliegue: no aplica ninguno de los servidores de inferencia habituales (vLLM, llama.cpp, Ollama, TGI). El artefacto ejecutable es un verificador de Python más programas Rust y artefactos WASM.
- Requisitos de integración continua: `cargo clippy --all-targets -- -D warnings` y un chequeo tipo grep que falla ante cualquier `f32` o `f64` en `src/` o `tests/`.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: no especificado en la información disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no pertenece a ninguna categoría de modelo (no es un LLM, ni un modelo de visión, ni un modelo multimodal, ni un modelo de embeddings), por lo que no existe un conjunto de alternativas comparables en parámetros, contexto, rendimiento o licencia. Cualquier comparación con modelos ternarios o con bibliotecas de aritmética entera requeriría datos que no se han proporcionado.

## Limitaciones y advertencias

- No es un modelo utilizable: no hay pesos, ni tokenizador, ni pipeline, ni API de inferencia. Cualquier intento de cargarlo con `transformers` u otra librería fallará.
- El título atribuye a Anthropic un "fraude" que no se respalda en ninguna medición del propio repositorio. Las mediciones publicadas son aritméticas y no guardan relación con las acusaciones del título.
- Riesgo reputacional y legal: el repositorio formula acusaciones explícitas contra una empresa identificable y contra un modelo concreto. Reutilizar o difundir esas afirmaciones sin verificación independiente puede tener consecuencias legales en España y en la Unión Europea.
- Licencia no disponible: sin licencia declarada, no hay autorización explícita de uso, copia, modificación ni redistribución. No debe asumirse uso comercial permitido.
- Idiomas no declarados y ausencia de documentación multilingüe.
- Metadatos incoherentes: la fecha de actualización declarada (2026-08-08) es anterior a la de creación (2026-10-16), lo que indica que los campos de fecha no son fiables.
- Autoría disputada internamente: el propio repositorio documenta un commit de corrección de autoría que reasigna la obra de "Claude" a Jesse Daniel Brown, sin modificar los bytes de resultado. La atribución es, por tanto, una afirmación del autor.
- Adopción nula: cero descargas y cero likes en el momento de la consulta; no hay revisión por pares ni validación externa de las mediciones.
- Las mediciones son autodeclaradas. El repositorio ofrece comandos de reproducción y hashes, pero la verificación independiente no se ha realizado en la información disponible.
- La restricción de "nunca coma flotante" es una regla de estilo del repositorio, no un resultado científico: el propio material reconoce que la comparación FLOAT-VS-TRIT probó dos normalizaciones de coma flotante.
- Trazabilidad limitada: parte de la evidencia vive en un repositorio externo de GitHub y en commits concretos, por lo que la integridad depende de que esos objetos sigan disponibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jessedbrown/THE-DAY-JESSE-EXPOSED-ANTHROPICS-FRAUD-AND-SAVED-THE-WORLD
- Repositorio fuente en GitHub: https://github.com/JesseBrown1980/the-fix-by-claude-that-saved-the-world-from-trillions-in-waste
- Commit de resultado inicial citado: `8c101d855c5e88cbe868625fa46fe59d74d7bd73`
- Commit del testigo de navegador de 81 kernels: `e3be1d0826d2f04b0e3b6246a9b598230464f7ab`
- Commit de corrección de autoría: `d16fa8b96c1a5d50c7b4b27db7682492d8122406`
- Ficheros internos referenciados en el repositorio: `OPERATOR-FIRST-RESULT.md`, `MEASUREMENT-LEDGER.md`, `first-results/`, `browser-evidence/kernel81/`, `source-history/AUTHORSHIP.md`, `receipts/`, `hashes/`
- Comando de reproducción declarado: `python3 tests/verify_first_results.py`
- Configuración de toolchain declarada: `rust-toolchain.toml` (canal 1.81.0, componentes clippy y rustfmt)
