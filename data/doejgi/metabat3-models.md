# DOEJGI/metabat3-models

## Resumen

DOEJGI/metabat3-models es un repositorio de artefactos de modelo para MetaBAT3, la nueva generación de la herramienta de binning de metagenomas MetaBAT desarrollada por el DOE Joint Genome Institute. El repositorio contiene un único fichero ONNX, `student_v4_104k_int8.onnx`, que actúa como estudiante de destilación para generar embeddings de composición de secuencia sobre contigs metagenómicos. No es un modelo de lenguaje ni un modelo de propósito general: es un componente de inferencia especializado que se integra en el binario `metabat3` escrito en Rust.

El modelo tiene un tamaño de 9.542.263 bytes (aproximadamente 9,1 MiB), opera en INT8 y trabaja con una anchura de token fija de 1024. El runtime de Rust lo combina con un tokenizador GenomeOcean embebido en tiempo de compilación. En el motor V1 por defecto, las filas neuronales sirven para sembrado y salvaguardas, mientras que la verosimilitud sigue calculándose mediante composición de tetranucleótidos CLR; el motor en cascada puede emplear las características de embedding.

Su relevancia es doble. Por un lado, muestra la tendencia a empaquetar componentes neuronales dentro de herramientas bioinformáticas clásicas sin sustituir el núcleo estadístico. Por otro, el repositorio establece un contrato estricto de nombre de fichero y checksum SHA256 que el runtime verifica antes de la inferencia, lo que lo convierte en un ejemplo interesante de distribución reproducible de artefactos de modelo en pipelines científicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal estudiante (student) exportada a ONNX; arquitectura interna no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | anchura de token fija de 1024; ventana de secuencia no especificada |
| Tipos de cuantizacion | INT8 (única variante publicada en este repo) |
| Idiomas soportados | no aplica (entrada es secuencia genómica, no texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`student_v4_104k_int8.onnx`) |
| Tamano del fichero | 9.542.263 bytes |
| SHA256 | `36cb24030922e8bb2245b5adfdb582396b4b3bcb6908fc0239117876cd4f56e9` |
| Tokenizador | GenomeOcean, embebido en el binario en tiempo de compilación |
| Runtime | metabat3 (Rust), verificación de checksum previa a inferencia |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del estudiante más allá de su condición de modelo neuronal de composición de secuencia exportado a ONNX. Se sabe que es un modelo "student" de tipo fijo (fixed-width), con anchura de token de 1024, cuantizado a INT8. El nombre `student_v4_104k_int8.onnx` sugiere una versión 4 del estudiante y un vocabulario o conjunto de tokens de 104k, aunque la model card no confirma este extremo. No se detallan capas, dimensiones ocultas, mecanismo de atención ni función de pérdida.

Tampoco se especifican datos de entrenamiento: número de tokens, composición del dataset, cobertura de comunidades microbianas ni procesos de alineación o RLHF (no aplicables en este dominio). La model card es explícita al señalar que la publicación no establece cobertura de datos de entrenamiento, calibración biológica, pureza, completitud ni mejora sobre comunidades no vistas. Lo que sí se documenta es el contrato de integración: el fichero debe instalarse en `PREFIX/models/student_v4_104k_int8.onnx` junto a `PREFIX/bin/metabat3`, o bien definir `METABAT3_PREFIX` apuntando a ese prefijo, y el runtime verifica el SHA256 contra una constante fijada en `crates/metabat3-cli/src/neural_embed.rs` de MetaBAT3 1.2.3.

Como innovación técnica destacable, el repositorio define slots reconocidos con checksums fijados para variantes que no publica: `student_v4_104k_int8.dynseq.onnx`, `student_v4_104k_fp32.onnx` y `student_v4_104k_fp32.dynseq.onnx`. La model card advierte que las operaciones de cuantización INT8 no tienen kernels CUDA en ONNX Runtime 1.20, por lo que este fichero no garantiza aceleración por GPU; los despliegues que prefieran CUDA necesitan un export FP32 genuino que coincida con su checksum, no suministrado aquí.

## Capacidades

- Extracción de características (feature extraction) sobre secuencias de contigs metagenómicos.
- Generación de embeddings neuronales de composición de secuencia con anchura de token fija de 1024.
- Integración con el tokenizador GenomeOcean embebido en el binario de MetaBAT3.
- Soporte de sembrado (seeding) y salvaguardas dentro del motor V1 de MetaBAT3.
- Uso de características de embedding en el motor en cascada de MetaBAT3.
- Ejecución en modo `--embed-only` para generar embeddings filtrados sobre secuencias de entrada (validado en contenedor x86_64 con una secuencia sintética de 1.500 pb).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Binning metagenómico con MetaBAT3 en modo por defecto: el modelo aporta filas neuronales para el sembrado inicial de bins y las salvaguardas del motor V1, mientras la verosimilitud se calcula por composición CLR de tetranucleótidos. Es adecuado porque encaja en el flujo estándar de la herramienta sin cambiar el núcleo estadístico.
- Binning con motor en cascada: cuando se activa el motor en cascada, las características de embedding del estudiante se emplean directamente para refinar la asignación de contigs. Útil en ensamblajes donde la composición por k-mers sola es ambigua.
- Generación de embeddings para análisis downstream: el modo `--embed-only` permite exportar embeddings filtrados de ventanas seleccionadas, que pueden alimentar análisis de agrupamiento, visualización o modelos secundarios propios.
- Despliegue reproducible en pipelines de bioinformática: el contrato de checksum SHA256 y la ruta fija de instalación permiten integrar el artefacto en imágenes de contenedor con verificación criptográfica antes de la inferencia, algo relevante en entornos HPC y flujos CI/CD científicos.
- Ejecución en entornos sin red y solo CPU: la validación documentada en un contenedor x86_64 sin red y solo CPU confirma que el artefacto funciona en aislamiento, lo que encaja en clústeres air-gapped o entornos regulados.
- Reproducción de resultados legacy: al fijar el nombre y el checksum heredados, permite reproducir ejecuciones de la versión legacy del estudiante dentro de MetaBAT3 1.2.3, útil para auditar análisis previos.
- Pruebas de integración del runtime: desarrolladores de MetaBAT3 pueden usar el fichero como fixture para validar la verificación de checksum y la ruta de inferencia en Rust.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta una validación funcional en contenedor: el 2026-11-04, una imagen local x86_64 con `metabat3 0.1.0-dev` y el modelo instalado con el SHA256 indicado completó `--embed-only` sobre una secuencia sintética de 1.500 pb, con salida `saved 1 filtered embeddings (1 selected windows)`. La imagen tenía ID `sha256:eed5ab9992ac7439357f85972457188e8c30147dd1b9d0e5bf278b1aae3a6cb6`. No se aportan métricas de pureza, completitud, ARI, NMI ni comparaciones con otros binning tools.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la variante publicada; las operaciones INT8 no tienen kernels CUDA en ONNX Runtime 1.20, por lo que la ejecución es efectivamente CPU.
- GPU recomendadas: no disponibles para esta variante; se requeriría un export FP32 con checksum coincidente para despliegues que prefieran CUDA.
- Compatibilidad con GPU de consumo: no confirmada; el artefacto publicado no promete aceleración por GPU.
- CPU: validado en contenedor x86_64 solo CPU y sin red.
- Opciones de despliegue: binario `metabat3` (Rust) con ONNX Runtime; instalación en `PREFIX/models/student_v4_104k_int8.onnx` o mediante `METABAT3_PREFIX`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput: no disponibles. El tamaño del fichero (9,1 MiB) sugiere una huella de memoria reducida, pero no se aportan cifras de rendimiento.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (estudiantes ONNX INT8 para embeddings de contigs metagenómicos integrados en herramientas de binning). Las alternativas del ecosistema de binning (MetaBAT2, MaxBin2, CONCOCT, SemiBin) no son modelos neuronales exportados con este contrato de artefacto y checksum, por lo que una comparación directa de parámetros, contexto y licencia no es posible con los datos disponibles.

## Limitaciones y advertencias

- No es un modelo de binning autónomo ni una afirmación de precisión biológica; la model card lo declara explícitamente.
- No se establece cobertura de datos de entrenamiento, calibración de probabilidad biológica, pureza, completitud ni mejora sobre comunidades no vistas.
- El fichero solo satisface el slot `LEGACY_MODEL_FILENAME = student_v4_104k_int8.onnx` y la constante `LEGACY_MODEL_INT8_SHA256` de MetaBAT3 1.2.3; renombrarlo o reetiquetarlo como modelo de secuencia dinámica o FP32 rompe el contrato.
- Anchura de token fija en 1024; no admite secuencias dinámicas en esta variante.
- Las operaciones INT8 no tienen kernels CUDA en ONNX Runtime 1.20; no hay garantía de aceleración por GPU.
- Las variantes FP32 y dynseq no están publicadas en este repositorio; solo se listan sus checksums fijados.
- La licencia no está disponible, lo que impide confirmar condiciones de uso comercial o redistribución.
- La validación documentada corresponde a `metabat3 0.1.0-dev` en contenedor, no a un contenedor 1.2.3 construido o validado; la compatibilidad con 1.2.3 se rige por el contrato de nombre y checksum y por las pruebas de release.
- Debe usarse únicamente con ensamblajes, tokenizador y ajustes de ventana emparejados; combinaciones no verificadas pueden producir resultados no válidos.
- No aplica sesgo lingüístico ni riesgo de alucinación en el sentido de modelos de lenguaje, pero sí existe riesgo de embeddings no representativos si la distribución de contigs se aleja de la cubierta por el estudiante.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DOEJGI/metabat3-models
- Descarga directa del artefacto: https://huggingface.co/DOEJGI/metabat3-models/resolve/main/student_v4_104k_int8.onnx
- Organización DOEJGI en HuggingFace: https://huggingface.co/DOEJGI
- MetaBAT (herramienta original): https://bitbucket.org/berkeleylab/metabat
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código de MetaBAT3 ni demos adicionales.
