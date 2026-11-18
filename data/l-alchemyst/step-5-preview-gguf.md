# L-Alchemyst/Step-5-Preview-GGUF

## Resumen
Step-5-Preview es un modelo de lenguaje de gran escala desarrollado por StepFun (aunque la model card del repositorio no lo especifica explícitamente, el nombre "Step" y la arquitectura remiten a la familia Step de dicho laboratorio). Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) de 600.100 millones de parámetros totales y 27.000 millones activos por token, con una ventana de contexto de 1.048.576 tokens. El repositorio aquí documentado es una recopilación de cuantizaciones GGUF con matrices de importancia (imatrix) publicada por el usuario L-Alchemyst, orientada específicamente al fork `ik_llama.cpp`.

El modelo resuelve el problema de ejecutar inferencia de un LLM de 600B parámetros en hardware de gama alta mediante cuantización agresiva (esquemas IQ3/IQ4) y un indexador GQA disperso que reduce el coste de atención sobre contextos muy largos. Su relevancia actual radica en que permite desplegar localmente un modelo de contexto millón con un subconjunto de expertos activos relativamente pequeño (27B), lo que abarata el coste computacional por token frente a un modelo denso equivalente.

La ficha se centra en el artefacto GGUF distribuido en Hugging Face, no en el modelo original en precisión completa, del cual no se dispone de información en la documentación proporcionada.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (352 expertos × 8 activos + 1 compartido, indexador GQA disperso) |
| Parametros totales | 600.991.912.608 |
| Parametros activos | 27.000 millones |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | GGUF IQ4_KS-mix-B, IQ3_KS-mix-B, smol-IQ3_KS-mix-B (con imatrix `step-preview-B.imatrix`) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | GGUF (shards), repo de 1473,6 GB |

## Arquitectura y entrenamiento
La arquitectura es un transformer MoE con 92 capas (3 densas y 89 MoE) más 3 capas de Multi-Token Prediction (MTP). Cada capa MoE dispone de 352 expertos, de los cuales 8 se activan por token más 1 experto compartido. La atención usa 64 cabezas de consulta y 4 de clave/valor con dimensión de cabeza 192, y un patrón de atención deslizante de 512 tokens combinado con atención completa cada tres capas, repetido 92 veces. El vocabulario es de 128.896 tokens.

El modelo incorpora un indexador GQA disperso que selecciona qué regiones de la caché de claves atienden, siguiendo la semántica de referencia oficial con bloques CSA. Las capas MTP permiten decodificación especulativa nativa. No se dispone en la información proporcionada de datos sobre volumen de tokens de entrenamiento, composición del dataset ni si se aplicaron RLHF/DPO.

## Capacidades
- Generación de texto conversacional (el tag del repo indica "conversational").
- Razonamiento multi-paso y contexto extremadamente largo (1M tokens).
- Decodificación especulativa mediante capas MTP, que acelera la generación.
- Atención dispersa sobre caché de claves para contextos largos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes: no disponible.
- Capacidades multilingües: no disponible (los idiomas soportados no se especifican).
- Capacidades de visión o audio: no disponible.

## Casos de uso
- Análisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir bases de código extensas y responder preguntas transversales sobre múltiples ficheros sin trocear el contexto.
- Procesamiento de documentación legal o contractual: permite cargar contratos completos y realizar extracción de cláusulas y comparaciones entre documentos largos, aprovechando la ventana de un millón de tokens.
- Resumen de corpus científicos: agregar decenas de papers en una sola ventana para generar síntesis comparativas con referencias cruzadas.
- Asistencia conversacional de largo alcance: mantener diálogos multi-turno con historial extenso sin perder coherencia, gracias al contexto de 1M y a las capas MTP que reducen latencia.
- Despliegue local en estaciones de trabajo de gama alta: las cuantizaciones IQ3/IQ4 permiten ejecutar el modelo con `ik_llama.cpp` en equipos con suficiente memoria, evitando depender de APIs en la nube para datos sensibles.
- Generación de código en pipelines internos: integrar el GGUF en herramientas de desarrollo local para autocompletado y refactorización, siempre que se valide la calidad de las cuantizaciones agresivas.
- Investigación sobre eficiencia MoE: servir como banco de pruebas para estudiar el impacto de cuantizaciones IQ3/IQ4 con imatrix en la calidad de un modelo de 600B.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; el repo completo ocupa 1473,6 GB, pero cada conjunto de cuantización concreto (IQ4_KS-mix-B, IQ3_KS-mix-B, smol-IQ3_KS-mix-B) tiene un tamaño menor que no se detalla en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño del modelo (600B totales, 27B activos), se requiere hardware de centro de datos o configuraciones multi-GPU; no se especifican modelos concretos (A100, H100, etc.).
- Consumer GPU: no disponible; el tamaño del artefacto y del modelo hacen improbable que quepa en una GPU de consumo, pero no se confirma en la información.
- Opciones de despliegue: `ik_llama.cpp` (fork específico referenciado en la model card); otras opciones (vLLM, Ollama, TGI) no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación fundamentada.

## Limitaciones y advertencias
- Licencia "other": no se detallan los términos, por lo que el uso comercial requiere consultar la licencia original del modelo base antes de desplegarlo.
- Los conjuntos `IQ3_KS-mix/` e `IQ4_KS-mix/` originales y la imatrix `step-preview-A.imatrix` están marcados como obsoletos; usar los `-B`.
- Las cuantizaciones IQ3 son especialmente agresivas y pueden degradar la calidad respecto al modelo en precisión completa; no se han publicado evaluaciones comparativas.
- Las descargas legacy requieren reparación manual con `gguf_meta_patch.py` y `qnorm_fix.py`.
- Idiomas soportados no especificados: riesgo de comportamiento deficiente en castellano u otras lenguas no confirmadas.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Dependencia de un fork específico (`ik_llama.cpp`) para la implementación del indexador GQA disperso; otros runners pueden no soportar la arquitectura correctamente.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/L-Alchemyst/Step-5-Preview-GGUF
- PR de `ik_llama.cpp` referenciado: https://github.com/ikawrakow/ik_llama.cpp/pull/2737
