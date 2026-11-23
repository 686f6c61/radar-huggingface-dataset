# darrellbest/DeepSeek-V4.1-Flash-1017-CoderPlus240-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-CoderPlus240 es una derivación GGUF del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario independiente darrellbest. Se trata de una variante de la compilación "Coder" de ISTA-DASLab que reintroduce 48 expertos enrutados adicionales por capa, pasando de 192 a 240 expertos de los 384 originales. El objetivo es ocupar exactamente una GPU de 96 GB con todos los expertos residentes en VRAM, sin recurrir a CPU ni SSD para los pesos enrutados.

El modelo base es una arquitectura Mixture-of-Experts (MoE) con 40 capas transformer, 384 expertos enrutados por capa y 6 expertos seleccionados por token y capa. Los parámetros totales ascienden a 348.008.277.848 (aproximadamente 348 mil millones). La compilación original sin podar no cabe en una GPU de 96 GB (unos 132 GB de expertos), por lo que ISTA-DASLab publicó una versión "Coder" con 192 expertos por capa (66 GB) y un margen de 18 GB sin usar. Esta variante aprovecha ese margen para recuperar parte de la calidad perdida por el podado.

La relevancia actual radica en que demuestra una técnica de ingeniería práctica: la selección de expertos guiada por el uso real del router, en lugar de solo por divergencia KL, permite recuperar cobertura de enrutamiento del 62% al 82,4% (media por capas) sin reentrenar ni recuantizar. El repositorio ocupa 88,7 GB y requiere un motor de inferencia específico (Strata's `strata-dsv41`), no probado en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (40 capas, 384 expertos enrutados por capa, 6 activos por token) |
| Parametros totales | 348.008.277.848 (aprox. 348 mil millones) |
| Parametros activos | no disponible (no se especifica el número exacto de parámetros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (2,00 bpw) heredada de la compilación GSQ-RCO de ISTA-DASLab; sin recuantización |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards: `-00001-of-00004` a `-00004-of-00004`) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas, cada una con 384 expertos enrutados y un router que selecciona 6 expertos por token y capa. Esta variante concreta no introduce entrenamiento nuevo: todos los bytes proceden de la compilación IQ2_XXS (2,00 bpw) de ISTA-DASLab, que aplica cuantización GSQ (probablemente "Gradient-Scaled Quantization") y selección de expertos RCO (probablemente "Router-Coverage Optimization" o similar). Sobre esa base, darrellbest modifica únicamente qué expertos se conservan por capa.

La innovación técnica clave es el criterio de selección de los 48 expertos añadidos. Partiendo de los 192 expertos que ISTA-DASLab conserva (publicados en `kept-experts.json`), se puntúa cada uno de los 192 expertos eliminados por su cuota de selecciones del router en dos perfiles: el perfil "hot-expert" que Strata distribuye para la compilación IQ2_XXS, y el mismo perfil tras uso local (sesiones de agente de código, benchmarks de velocidad y prompts mixtos, unos 483.000 tokens). Se suman con igual peso y se conservan los 48 de mayor puntuación por capa. Solo se recortan cinco tensores por capa a lo largo del eje de expertos: `ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`, `ffn_gate_inp` y `exp_probs_b`. El resto de tensores y metadatos son idénticos byte a byte a la compilación IQ2_XXS.

## Capacidades

- Generación de texto conversacional y de código, heredadas del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento y uso de herramientas agénticas: la selección de expertos se calibró específicamente sobre datos de "coding/agent calibration" de ISTA y sesiones de agente de código.
- Contexto largo: el podado RCO original de ISTA se optimizó considerando contexto largo, aunque la longitud exacta de ventana no se detalla en la información disponible.
- Capacidades de visión: la model card menciona que la selección RCO de ISTA se optimizó también sobre visión, lo que sugiere que el modelo base soporta entrada visual, aunque no se detalla el mecanismo.
- Soporte multilingüe: no disponible (no se especifican idiomas).
- Modo "thinking" o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Sesiones de agente de código en local: el modelo se calibró sobre tareas de agente de código (benchmark de KannaCode) y cabe entero en una GPU de 96 GB, por lo que es adecuado para flujos de edición de código multi-turno con herramientas, sin latencia de offload a CPU.
- Generación de código en producción con requisitos de privacidad: al ejecutarse íntegramente en una sola GPU y con licencia MIT, puede desplegarse en infraestructura propia para autocompletado, refactorización o generación de tests sin enviar código a terceros.
- Evaluación comparativa de técnicas de podado de MoE: sirve como referencia práctica para investigadores que quieran medir el impacto de recuperar expertos guiados por el router frente al podado puramente KL-óptimo.
- Razonamiento multi-paso con tool calling: la cobertura de enrutamiento recuperada (86,5% en uso local) reduce la degradación en tareas que dependen de expertos especializados, útil para pipelines de agentes que encadenan llamadas a funciones.
- Procesamiento de contexto largo en una sola tarjeta: para análisis de repositorios o documentos extensos donde se quiere evitar el offload a CPU que exigiría la compilación sin podar (132 GB de expertos).
- Investigación sobre enrutamiento MoE: el archivo `expert-selection/CoderPlus240.kept-experts.json` y el perfil `magma/expert-profile-240.bin` permiten reproducir y analizar qué expertos usa el router, útil para estudiar especialización por capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta métricas de cobertura de enrutamiento (share de selecciones del router que recaen sobre expertos conservados), no métricas de calidad de tarea:

| Perfil de enrutamiento | Coder (192) | CoderPlus240 (240) |
|---|---:|---:|
| Perfil de Strata para IQ2_XXS: media por capas | 62,0% | 82,4% |
| El mismo, capa más baja | 55,1% | 79,8% |
| Uso local (sesiones de agente, benchmarks, prompts): media | 59,3% | 86,5% |
| El mismo, capa más baja (capa 23) | 30,5% | 88,1% |

## Requisitos de hardware

- VRAM estimada: 82,6 GB de expertos enrutados más unos 7 GB de otros pesos, total en torno a 89,6 GB. Diseñado para ocupar una GPU de 96 GB con unos 1,5 GB de margen.
- GPU recomendadas: una única GPU de 96 GB (por ejemplo, NVIDIA H100 de 96 GB, H200 o equivalentes). No cabe en GPUs consumer (RTX 4090 de 24 GB, RTX 5090 de 32 GB).
- Offload: ninguno para los pesos del modelo; todos los expertos residen en VRAM. Las tablas Engram (`DeepSeek-V4.1-Flash-Engram-IQ4_NL.gguf`, 110,6 GB) permanecen en SSD y se leen unas pocas filas por token.
- Opciones de despliegue: exclusivamente el motor `strata-dsv41` de Strata. La model card indica explícitamente que no se ha probado en llama.cpp. No se mencionan vLLM, TGI ni Ollama.
- Dependencias adicionales: el drafter DSpark `dspark-DeepSeek...` de `unsloth/DeepSeek-V4.1-Flash-1017-GGUF` (nombre truncado en la información disponible) y las tablas Engram de la release de ISTA-DASLab.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Expertos por capa | Expertos enrutados | Cabe en 96 GB | Criterio de selección | Licencia |
|---|---:|---:|---|---|---|
| ISTA IQ2_XXS sin podar | 384 | 132 GB | No (aprox. 40% en CPU/SSD) | Ninguno | MIT (según este repo) |
| ISTA Coder | 192 | 66 GB | Sí, con 18 GB libres | KL-óptimo sobre datos de código/agente | MIT |
| **CoderPlus240** | **240** | **82,6 GB** | **Sí, con 1,5 GB libres** | **192 de ISTA + 48 más usados por el router** | **MIT** |

## Limitaciones y advertencias

- Solo se ha probado con el motor propietario `strata-dsv41` de Strata; no hay validación en llama.cpp ni en otros runners GGUF habituales, lo que limita la portabilidad.
- El GGUF almacena un único número de expertos para todo el modelo, lo que impide asignar un número distinto de expertos por capa. La propia model card señala que la cobertura varía mucho entre capas (del 30,5% al 71,3% en el Coder), por lo que una asignación por capa sería probablemente mejor.
- No hay benchmarks de calidad publicados: solo se reportan métricas de cobertura de enrutamiento, que no garantizan mejoras equivalentes en tareas reales.
- Requiere descargar además 110,6 GB de tablas Engram y el drafter DSpark, lo que eleva el espacio en disco muy por encima de los 88,7 GB del repo.
- Riesgo de alucinación y sesgos: no disponibles en la información proporcionada; son los heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe más allá de lo que ofrezca el modelo base.
- Licencia MIT declarada por el autor de la derivación, pero conviene verificar las condiciones del modelo base de DeepSeek y de la compilación de ISTA-DASLab antes de uso comercial.
- Es una derivación independiente, no una release oficial de ISTA-DASLab ni de DeepSeek; el soporte y las garantías de mantenimiento son limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/darrellbest/DeepSeek-V4.1-Flash-1017-CoderPlus240-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Compilación GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Compilación Coder de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
- Repositorio de ISTA-DASLab en GitHub: https://github.com/IST-DASLab
- GGUF de unsloth (drafter DSpark): https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Papers citados en los tags: arXiv:2604.18556 y arXiv:2605.00649 (títulos no disponibles en la información proporcionada)
