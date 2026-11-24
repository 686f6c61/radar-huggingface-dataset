# shivrajgurjar/Alok-v3-14B-NSLRE

## Resumen

Alok v3.0 (identificador `shivrajgurjar/Alok-v3-14B-NSLRE`) es un modelo de lenguaje de 14.770.033.664 parámetros publicado por el desarrollador independiente shivrajgurjar. Se construye como un ajuste fino del modelo destilado `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B`, que a su vez deriva de la familia Qwen2, y se distribuye bajo licencia Apache 2.0. El autor lo presenta como un "motor neuro-simbólico" orientado a razonamiento de largo horizonte, ingeniería de software, química, biología y demostración de teoremas.

La propuesta diferencial no reside tanto en el backbone como en el ecosistema de componentes que el autor describe en la model card: un crítico cognitivo de doble cabeza (`dual_critic.pt`), un arquitecto multi-fichero con autodepuración iterativa, y un "kernel" determinista que orquesta herramientas externas como RDKit (química), Biopython (genética), Z3 (optimización de decisiones) y SymPy (cálculo simbólico). El modelo se distribuye en safetensors BF16 (29,55 GB) y en dos cuantizaciones GGUF de 4 bits calibradas con imatrix (IQ4_XS de 7,77 GB y Q4_K_M de 8,56 GB), lo que permite ejecutarlo en GPUs de consumo.

Es relevante ahora porque combina un backbone de razonamiento ya consolidado (la destilación de R1 sobre Qwen-14B) con un enfoque híbrido que delega la verificación en herramientas deterministas, un patrón que gana tracción para reducir alucinaciones en dominios científicos. No obstante, conviene señalar que el repositorio tiene 404 descargas, 0 likes y no incluye resultados de benchmarks estándar publicados; las cifras de la "torture suite" proceden exclusivamente del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, base DeepSeek-R1-Distill-Qwen-14B) |
| Parámetros totales | 14.770.033.664 (~14,77B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (completo), GGUF IQ4_XS + imatrix, GGUF Q4_K_M + imatrix |
| Idiomas soportados | No disponible (la model card menciona "Literary English Cortex", sin listado formal) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6 shards), GGUF |

## Arquitectura y entrenamiento

El backbone es un transformer decoder-only denso de la familia Qwen2, heredado de `DeepSeek-R1-Distill-Qwen-14B`. DeepSeek-R1-Distill-Qwen-14B se obtuvo destilando trazas de razonamiento del modelo R1 sobre el modelo base Qwen2.5-14B; Alok v3.0 parte de ese checkpoint y, según el autor, fusiona "adaptadores de razonamiento multi-sector auto-destilados" en un backbone bfloat16 autónomo. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO sobre el modelo destilado.

El elemento técnico diferenciador es la capa neuro-simbólica: el modelo se presenta empaquetado con un crítico de doble cabeza (ranking de validación del 100% según el autor, sin metodología publicada), un arquitecto de repositorios multi-fichero con detección de ciclos en DAG topológicos, y un kernel que invoca herramientas deterministas (RDKit, Biopython, Z3, SymPy) para verificar resultados. Estos componentes no forman parte de los pesos del transformer y deben desplegarse por separado; el repositorio de Hugging Face solo aloja el modelo de lenguaje. No se documentan innovaciones a nivel de atención (no hay atención lineal ni decodificación especulativa descritas).

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados de la destilación de DeepSeek-R1.
- Razonamiento de tipo "thinking" (cadenas de pensamiento largas), característico de la familia R1 destilada.
- Ingeniería de software: generación y depuración de código multi-fichero, según la model card.
- Razonamiento científico asistido por herramientas: química (RDKit), genética (Biopython), cálculo simbólico (SymPy) y optimización con restricciones (Z3).
- Demostración de teoremas y teoría de decisiones (etiquetas declaradas por el autor).
- Búsqueda en árbol con Monte Carlo (MCTS), según las etiquetas del repositorio.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no documentadas formalmente; la model card enfatiza el inglés literario.

## Casos de uso

- Asistencia a la ingeniería de software en repositorios multi-fichero: el componente "architect" descrito por el autor permite generar y depurar cambios que abarcan varios ficheros con verificación mediante tests en un sandbox, adecuado para pipelines de CI/CD donde se requiere validación automática antes de fusionar.
- Química medicinal asistida: el kernel con RDKit permite calcular descriptores moleculares (peso molecular, donantes/aceptores de enlaces de hidrógeno, anillos) a partir de SMILES, útil en triaje temprano de candidatos.
- Genética molecular educativa o de investigación: el uso de Biopython permite verificar traducciones de codones y comparar secuencias wild-type frente a mutaciones puntuales, como el ejemplo de hemoglobina y anemia falciforme de la model card.
- Optimización de recursos con restricciones: la integración con Z3 permite resolver problemas de asignación (por ejemplo, reparto de throughput entre servidores) con garantías de corrección formal.
- Cálculo simbólico y física: SymPy permite resolver ecuaciones diferenciales y problemas de valor inicial, útil en entornos docentes o de prototipado científico.
- Generación de ensayo y refinado de prosa: el pipeline de "3-Stage Prose Refine" con crítico de puntuación permite iterar sobre textos filosóficos o técnicos con criterios de rúbrica.
- Despliegue en portátiles y GPUs de consumo: las cuantizaciones IQ4_XS (7,77 GB) y Q4_K_M (8,56 GB) permiten ejecución local en GPUs de 12-16 GB y en Macs de 16 GB mediante Ollama o llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única tabla de rendimiento es la "Omni-Domain Torture Suite" del autor, que no emplea métricas comparables a benchmarks públicos:

| Sector | Tarea | Estado declarado | Resumen de verificación (autor) |
|---|---|---|---|
| Repositorio de largo horizonte | Runner DAG multi-fichero + detección de ciclos | PASS (Att=1) | 3 ficheros verificados vía pytest |
| Química medicinal | Descriptores SMILES de serotonina (RDKit) | PASS | C10H12N2O, MW=176.22, HBD=3, HBA=2, Rings=2 |
| Genética molecular | Mutación puntual hemoglobina (Biopython) | PASS (Att=1) | Traducción de codones y polipéptido verificada |
| Teoría de decisiones | Optimización de throughput con Z3 | PASS (Att=1) | S1=38, S2=6, S3=6, max_T=432 |
| Física y cálculo | EDO oscilador armónico amortiguado (SymPy) | PASS (Att=1) | (sin(2*t) + 2*cos(2*t))*exp(-t) |
| Prosa inglesa | Ensayo filosófico pulido en 3 etapas | PASS | Critic Score: 0.924 |

Estos resultados proceden de la model card del autor y no han sido replicados de forma independiente. No deben interpretarse como evidencia de rendimiento general del modelo frente a benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~28,1 GB en BF16 (según el autor), ~9,3 GB con Q4_K_M y ~8,5 GB con IQ4_XS.
- GPUs recomendadas para BF16: A100, H100, B200 (despliegue con vLLM, SGLang o Transformers).
- GPUs de consumo: las cuantizaciones de 4 bits caben en GPUs de 12 GB y 16 GB (por ejemplo, T4 en Colab/Kaggle, RTX 4060 Ti 16 GB, RTX 4080, RTX 4090) y en Macs de 16 GB.
- Opciones de despliegue: Transformers, vLLM, SGLang, llama.cpp, Ollama y LM Studio. El autor proporciona comandos de una línea para Ollama (`ollama run hf.co/shivrajgurjar/Alok-v3-14B-NSLRE:IQ4_XS`) y llama.cpp (`llama-cli -hf ... -ngl 99 -cnv`).
- Latencia y throughput: no disponibles. El autor afirma que Q4_K_M ofrece los kernels más rápidos en GPU/CPU con una retención del ~99,6% respecto a BF16, pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Alok v3.0 (este modelo) | ~14,77B denso | No disponible | Apache 2.0 | HF (safetensors + GGUF) | Ajuste fino de R1-Distill-Qwen-14B con capa neuro-simbólica |
| DeepSeek-R1-Distill-Qwen-14B | ~14,77B denso | 131.072 tokens (heredado de Qwen2.5) | MIT | HF | Modelo base directo; benchmarks públicos de razonamiento y matemáticas |
| Qwen2.5-14B-Instruct | ~14,77B denso | 131.072 tokens | Apache 2.0 | HF | Modelo generalista con soporte de tool calling y multilingüe |
| DeepSeek-R1-Distill-Llama-8B | ~8B denso | 131.072 tokens | MIT | HF | Alternativa más ligera de la familia R1 destilada |

La comparación con DeepSeek-R1-Distill-Qwen-14B es la más directa, ya que Alok v3.0 parte de ese checkpoint. No se dispone de datos que permitan afirmar una mejora cuantitativa frente al modelo base en benchmarks estándar.

## Limitaciones y advertencias

- Ausencia de benchmarks públicos: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones independientes; las cifras del autor no son verificables.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en dominios científicos donde la verificación depende de herramientas externas que deben desplegarse por separado.
- Dependencia de componentes externos: el "kernel" neuro-simbólico (RDKit, Biopython, Z3, SymPy) y el crítico (`dual_critic.pt`) no forman parte del repositorio de pesos; sin ellos, el modelo se comporta como un ajuste fino estándar de R1-Distill-Qwen-14B.
- Idiomas: no hay listado oficial de idiomas; la model card enfatiza el inglés, por lo que el rendimiento en castellano no está garantizado.
- Contexto: no se documenta la longitud de contexto efectiva del ajuste fino; aunque el backbone soporta ventanas largas, el ajuste podría degradar el rendimiento en contextos extensos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de las herramientas externas (RDKit es BSD, Biopython es BSD-3, Z3 es MIT, SymPy es BSD) y del modelo base (MIT).
- Madurez: 404 descargas, 0 likes y un único autor; no hay evidencia de validación por la comunidad ni de mantenimiento a largo plazo.
- Fecha de creación futura (2026-11-17): el repositorio presenta metadatos anómalos que conviene tratar con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shivrajgurjar/Alok-v3-14B-NSLRE
- Demo (Hugging Face Space): https://huggingface.co/spaces/shivrajgurjar/Alok-v3-Showcase
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Qwen2.5 (familia base): https://huggingface.co/Qwen/Qwen2.5-14B
- RDKit: https://www.rdkit.org/
- Biopython: https://biopython.org/
- Z3 Theorem Prover: https://github.com/Z3Prover/z3
- SymPy: https://www.sympy.org/
