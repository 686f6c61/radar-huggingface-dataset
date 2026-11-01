# DuoNeural/Lattice-6-Prometheus-v2-HeptaCap

## Resumen

Lattice-6-Prometheus-v2-HeptaCap es un modelo de generación de texto desarrollado por DuoNeural Research Lab, presentado como un "Modelo de Dinámica Cristalográfica" (CDM) no euclidiano de 7 capas. Se trata de un modelo destilado (knowledge distillation) a partir de Qwen/Qwen3.8-27B (con 14,7B de parámetros activos en cuantización NF4 de 4 bits), entrenado durante 100.000 pasos en una única RTX 4080 Super de 32 GB de VRAM. Su rasgo distintivo es el uso de embeddings hiperbólicos en la bola de Poincaré combinados con una arquitectura mixture-of-experts (MoE) de 4 expertos, en lugar del transformer euclidiano convencional.

El modelo incorpora el vocabulario completo del modelo profesor (248.320 tokens) y, según su model card, alcanza un hito denominado "Solid-State Hepta-Capping" (tau\* = 1,0000e+10 en las 7 capas), en el que los centroides de enrutamiento se congelan en retículas hiperbólicas de Voronoi de baja entropía. Con unos 598,4M de parámetros totales (216,6M activos en el backbone), es un modelo pequeño orientado a inferencia ligera en CPU y GPU de consumo, con soporte nativo en llama.cpp mediante GGUF.

Su relevancia actual es principalmente de investigación: propone una alternativa geométrica no euclidiana a los transformers clásicos y demuestra que la destilación con alineación de matrices de Gram coseno ("Relational Gram Distillation") puede transferir curvatura semántica de un profesor de 64 capas a un estudiante de solo 7 capas. No obstante, sus resultados de benchmarks son modestos y su adopción requiere un fork parcheado de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CDM (Crystallographic Dynamics Model) no euclidiano, 7 capas, embeddings hiperbólicos en bola de Poincaré, MoE con 4 expertos (d_ff=3072) y 8 centroides de enrutamiento (K=8) |
| Parametros totales | 598.433.446 (~598,4M); 407.328.934 (~407,3M) con embeddings atados |
| Parametros activos | 216.619.174 (~216,6M) en el backbone activo (36,2% del total) |
| Longitud de contexto | no disponible (se ha validado error numérico a 128 y 512 posiciones de contexto) |
| Tipos de cuantizacion | GGUF híbrido: Q8_0 (atención) + Q6_K (expertos MoE) + F32 (enrutamiento Poincaré y normas); variante F32 completa |
| Idiomas soportados | no disponible (entrenado con datasets mayoritariamente en inglés; vocabulario de Qwen/Qwen3.8-27B, 248.320 tokens) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura se aparta deliberadamente del transformer euclidiano estándar: es un modelo de 7 capas con 12 cabezas de atención y dimensión oculta d=768, en el que los embeddings y el enrutamiento MoE operan en geometría hiperbólica (bola de Poincaré). El enrutamiento se realiza mediante 8 centroides por capa (K=8) que forman retículas de Voronoi hiperbólicas; durante el entrenamiento, estos centroides alcanzan una saturación denominada Dynamical Horizon Principle (DHP) en tau\* = 1,0000e+10, momento en el que se congelan ("solid-state hepta-capping"). Cada capa tiene 4 expertos con d_ff=3072. La model card incluye un "Slot Logit Lens" mecanicista que muestra la especialización por capa: la capa 00 se especializa en sintaxis estructural, la capa 02 en el token `<think>` y delimitadores de razonamiento profundo, y la capa 06 en el cierre sintáctico.

El entrenamiento se realizó por destilación desde Qwen/Qwen3.8-27B (profesor de 64 capas, 14,7B de parámetros activos en NF4) durante 100.000 pasos en una única NVIDIA RTX 4080 Super de 32 GB, usando los datasets HuggingFaceFW/fineweb-edu y HuggingFaceTB/smoltalk. La innovación técnica central es la "Relational Gram Distillation": se alinean las matrices de Gram coseno normalizadas token-a-token entre 7 capas emparejadas del profesor y del estudiante, transfiriendo la curvatura geométrica semántica sin proyecciones auxiliares. Resultados de entrenamiento: mejor BPB de validación de 0,6731 (paso 84.000, perplejidad de validación ~9,02) y divergencia KL respecto al profesor de 0,1232 nats. No se menciona explícitamente RLHF/DPO.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen3.8 (formato `<|im_start|>`/`<|im_end|>`).
- Razonamiento paso a paso: el vocabulario y la plantilla incluyen el token `<think>`, y el análisis de centroides muestra capas especializadas en tokens de razonamiento secuencial.
- Comprensión lectora y verificación factual booleana (mejor resultado en BoolQ, 64,67%).
- Resolución de correferencias pronominales (WinoGrande) y sentido común situacional (HellaSwag), con resultados modestos.
- Razonamiento científico de opción múltiple (ARC-Easy y ARC-Challenge), con rendimiento limitado.
- Ejecución nativa no euclidiana en CPU y CUDA mediante un fork parcheado de llama.cpp.
- No se menciona soporte de tool calling / function calling en la información disponible.
- No se mencionan capacidades de visión, audio ni soporte de agentes.

## Casos de uso

- Experimentación en investigación de arquitecturas no euclidianas: al ser un modelo "glass-box" con censo de parámetros público y análisis de centroides, es idóneo para estudiar geometrías hiperbólicas en modelos de lenguaje.
- Destilación de modelos grandes a presupuestos domésticos: demuestra un pipeline replicable (una sola RTX 4080 Super, 100.000 pasos) para comprimir profesores de decenas de miles de millones de parámetros.
- Chatbot ligero en CPU: con la variante GGUF Q8/Q6 de solo 334 MiB, puede ejecutarse en portátiles o equipos sin GPU dedicada usando llama-cli.
- Prototipado de asistentes conversacionales offline: la plantilla de chat de Qwen3.8 y el tamaño reducido lo hacen adecuado para demos locales de bajo consumo.
- Verificación factual simple sobre texto: su mejor puntuación (BoolQ, 64,67%) sugiere utilidad en tareas de clasificación binaria sobre pasajes, aunque con supervisión.
- Investigación de interpretabilidad: la especialización clara por capas (sintaxis, conectores lógicos, razonamiento, cierre) lo convierte en banco de pruebas para técnicas de logit lens y análisis mecanicista.
- Generación de texto continuo de baja perplejidad: con ~9,02 de perplejidad de validación, puede usarse como modelo base ligero para continuación de texto en dominios educativos (fineweb-edu).

## Benchmarks y rendimiento

Resultados zero-shot publicados en la model card:

| Benchmark | Capacidad evaluada | Accuracy bruta | Accuracy normalizada |
|---|---|---:|---:|
| BoolQ | Comprensión lectora factual y verificación booleana | 64,67% | 64,67% |
| WinoGrande | Correferencia y desambiguación pronominal | 54,67% | 56,00% |
| ARC-Easy | Razonamiento científico básico (4 opciones) | 38,26% | 42,28% |
| HellaSwag | Sentido común situacional y continuación narrativa | 33,33% | 34,00% |
| ARC-Challenge | Razonamiento científico multi-hop | 24,83% | 24,16% |

Métricas de entrenamiento/destilación: mejor BPB de validación 0,6731 (perplejidad ~9,02), divergencia KL respecto al profesor 0,1232 nats. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: la variante GGUF cuantizada ocupa 334 MiB y la variante F32 completa 1,63 GiB; en safetensors el repositorio completo pesa 4,4 GB. Inferencia viable en equipos sin GPU dedicada.
- GPU recomendadas: no requiere GPU; para entrenamiento/destilación, la model card reporta una NVIDIA RTX 4080 Super de 32 GB como hardware de referencia.
- Consumer GPUs: cabe con holgura en cualquier GPU moderna de consumo (incluso en GPUs de 4-6 GB de VRAM con la variante cuantizada).
- Despliegue: llama.cpp parcheado (fork de DuoNeural con soporte no euclidiano nativo, CPU y CUDA) mediante llama-cli. No se menciona soporte en vLLM, Ollama, TGI ni en la versión estándar de transformers para la ejecución no euclidiana (la librería declarada es transformers).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparativa orientativa con modelos de tamaño similar (~0,5-0,6B parámetros) orientados a texto conversacional:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Lattice-6-Prometheus-v2-HeptaCap | ~598,4M (216,6M activos) | no disponible | Apache 2.0 | CDM hiperbólico con MoE; requiere llama.cpp parcheado |
| Qwen3-0.6B (profesor destilado a escala similar) | ~0,6B | 32k (según familia Qwen3) | Apache 2.0 | Transformer denso estándar; ecosistema maduro (vLLM, Ollama) |
| SmolLM2-360M/1.7B (HuggingFace) | 360M / 1,7B | 8.192 | Apache 2.0 | Entrenado con smoltalk entre otros datasets; benchmarks públicos amplios |

Nota: la comparativa es aproximada; el modelo de DuoNeural no publica benchmarks comparables directamente con estas alternativas, y su arquitectura no es compatible con el ecosistema estándar de inferencia.

## Limitaciones y advertencias

- Rendimiento modesto en benchmarks: ARC-Challenge (24,83%) está por debajo del azar corregido en algunas condiciones; no es adecuado para tareas de razonamiento exigente sin supervisión.
- Riesgo de alucinación: no cuantificado en la model card; al ser un modelo destilado de 7 capas con perplejidad ~9,02, debe asumirse un riesgo elevado en generación de hechos.
- Contexto: la longitud de contexto no está documentada; la validación numérica de cuantización se realizó solo a 128 y 512 posiciones, por lo que no hay garantías más allá de ese rango.
- Idiomas: no declarados; los datasets de entrenamiento (fineweb-edu, smoltalk) son mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- Compatibilidad: requiere un fork parcheado de llama.cpp para ejecución nativa; no funciona con el ecosistema estándar (vLLM, TGI, transformers convencionales) para la geometría no euclidiana.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo destila pesos derivados de Qwen/Qwen3.8-27B; conviene revisar los términos del modelo base para despliegues comerciales.
- Procedencia: el modelo tiene 390 descargas y 0 likes en HuggingFace; no hay auditorías ni validaciones independientes de las afirmaciones de la model card (hepta-cap, DHP), que corresponden a terminología propia de DuoNeural.
- Sesgos: no documentados; hereda potencialmente los sesgos de fineweb-edu, smoltalk y del modelo profesor Qwen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/Lattice-6-Prometheus-v2-HeptaCap
- Organización DuoNeural en HuggingFace: https://huggingface.co/DuoNeural
- Sitio web de DuoNeural: https://duoneural.com
- Repositorio de código (Lattice-CDM): https://github.com/DuoNeural/Lattice-CDM
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Datasets: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu y https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Paper, demo y blog: no disponibles en la información proporcionada.
