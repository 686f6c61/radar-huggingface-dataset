# mradermacher/Ornith1.5-9B-3MPER0RR-obliterated-i1-GGUF

## Resumen

Ornith1.5-9B-3MPER0RR-obliterated-i1-GGUF es una cuantizacion GGUF con matriz de importancia (imatrix) del modelo base 3MPER0RR/Ornith1.5-9B-3MPER0RR-abliterated, una version sin censura (abliterated) del modelo Ornith1.5-9B desarrollado por DeepReinforce. Este modelo pertenece a la familia Ornith 1.5, que introduce un bucle de auto-mejora: el propio modelo propone nuevas tareas, genera scaffolds especificos y produce rollouts de soluciones para entrenamiento por refuerzo, en lugar de depender de tareas fijas disenadas por humanos.

La cuantizacion ha sido realizada por mradermacher, un conocido cuantizador de la comunidad, e incluye una amplia gama de niveles de compresion, desde IQ1_S (2.8 GB) hasta Q5_K_M (6.6 GB), lo que permite ejecutar el modelo en hardware muy variado. El modelo base es un transformer denso de aproximadamente 8.95 mil millones de parametros, multimodal (acepta imagenes y texto) y orientado a tareas de codificacion. Su licencia MIT y su disponibilidad en formato GGUF lo hacen atractivo para despliegues locales y proyectos comerciales.

La relevancia de este modelo radica en que combina un enfoque de entrenamiento innovador (auto-scaffolding y auto-mejora) con una distribucion sin restricciones de seguridad, lo que lo diferencia de otros modelos de codigo de tamano similar. Ademas, al estar cuantizado, puede ejecutarse en GPUs de consumo con tan solo 8 GB de VRAM, lo que democratiza el acceso a un modelo de 9B con capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base Ornith1.5-9B es un transformer denso de 9B parametros con capacidades multimodales (vision y texto). Segun el blog oficial de Ornith, la arquitectura extiende el framework de auto-scaffolding introducido en Ornith-1.0 hacia un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera scaffolds especificos para cada tarea y produce rollouts de soluciones que se utilizan como datos de entrenamiento por refuerzo. Este enfoque permite que el modelo mejore continuamente sin depender de conjuntos de datos estaticos curados por humanos.

La version "abliterated" elimina las capas de rechazo y censura tipicas de los modelos alineados, lo que resulta en un comportamiento sin restricciones. La cuantizacion realizada por mradermacher utiliza una matriz de importancia (imatrix) calculada sobre un corpus representativo, lo que mejora la calidad de los quants de baja precision en comparacion con cuantizaciones estaticas. El repositorio incluye un archivo imatrix separado (0.1 GB) que permite a los usuarios generar sus propias cuantizaciones personalizadas.

## Capacidades

- Generacion de texto y razonamiento: el modelo es capaz de mantener conversaciones coherentes y resolver tareas de razonamiento complejo, aunque su especialidad es la codificacion.
- Generacion de codigo: entrenado especificamente para tareas de programacion, puede generar, completar y depurar codigo en multiples lenguajes.
- Capacidades multimodales: el modelo base acepta entrada de imagenes (vision), aunque en este repositorio GGUF no se incluyen los archivos de proyector (mmproj); estos estan disponibles en el repositorio estatico asociado.
- Sin censura (abliterated): al haber sido eliminadas las restricciones de seguridad, el modelo puede generar contenido que otros modelos rechazarian, incluyendo codigo malicioso o respuestas politicamente incorrectas.
- Auto-mejora: gracias al entrenamiento con auto-scaffolding, el modelo puede proponer sus propias tareas y estrategias de resolucion, lo que lo hace util para entornos de investigacion en RL.
- Multilingue: solo soporta ingles de forma nativa; no se garantiza un rendimiento adecuado en otros idiomas.

## Casos de uso

- Asistente de programacion local: el modelo puede integrarse en editores de codigo (VS Code, Neovim) mediante herramientas como Continue o llama.cpp para ofrecer autocompletado y generacion de funciones sin conexion a internet. Su tamano de 9B y las cuantizaciones Q4 permiten ejecutarlo en una GPU de 8 GB con latencias aceptables.
- Generacion de codigo en entornos aislados: al ser una version sin censura, es adecuado para generar scripts de automatizacion, exploits educativos o codigo de bajo nivel que otros modelos rechazarian por politicas de seguridad. Esto es util en laboratorios de ciberseguridad y formacion ofensiva.
- Prototipado rapido de aplicaciones: con una cuantizacion Q5_K_M (6.6 GB) se puede desplegar en un Mac con 16 GB de RAM unificada para generar esqueletos de aplicaciones, pruebas de concepto y microservicios.
- Investigacion en auto-mejora y RL: el modelo base incorpora un mecanismo de auto-scaffolding que permite estudiar como un LLM puede generar sus propias tareas de entrenamiento. Los investigadores pueden usar la version GGUF para experimentar con este comportamiento en local.
- Analisis de imagenes y generacion de descripciones: aunque el proyector de vision no esta en este repo, si se descarga del repositorio estatico, el modelo puede procesar capturas de pantalla o diagramas para explicar su contenido o generar codigo a partir de ellos.
- Chat conversacional sin filtros: para aplicaciones de roleplay, escritura creativa o simulacion de personajes donde se requiere una libertad total de contenido, este modelo ofrece respuestas sin restricciones de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion GGUF en la informacion disponible. El modelo base Ornith1.5-9B cuenta con metricas publicadas en el blog oficial de Ornith (ornith.ai), pero no se incluyen en los datos proporcionados. Se recomienda consultar la documentacion del modelo original para obtener resultados de MMLU, HumanEval, GSM8K u otras pruebas estandar. En cualquier caso, las cuantizaciones de baja precision (IQ1, IQ2) degradaran significativamente el rendimiento respecto al modelo en punto flotante.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantizacion Q4_K_M (5.7 GB) se necesita al menos 8 GB de VRAM para una ejecucion comoda; con Q5_K_M (6.6 GB) se recomiendan 12 GB. Las cuantizaciones IQ2 e inferiores (3-4 GB) pueden ejecutarse en GPUs con 6 GB de VRAM, aunque con una perdida notable de calidad.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB) o superiores. En el lado de AMD, una RX 6700 XT (12 GB) es suficiente. Para Apple Silicon, un Mac con 16 GB de RAM unificada puede ejecutar la version Q4_K_M.
- Si cabe en consumer GPU: si, la mayoria de las cuantizaciones caben en GPUs de consumo de gama media. Las versiones Q4 y Q5 son las mas equilibradas para hardware domestico.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversion a formato compatible) y TGI. El formato GGUF es compatible con todas estas herramientas.
- Latencia y throughput estimados: no se dispone de datos concretos, pero en una RTX 3060 con Q4_K_M se pueden esperar velocidades de 20-40 tokens por segundo para generacion, y de 50-100 tokens por segundo en prefill, dependiendo de la longitud del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especialidad |
|---|---|---|---|---|---|
| Ornith1.5-9B (este) | 8.95B | No disponible | MIT | GGUF | Codigo, multimodal, sin censura |
| CodeLlama 7B | 6.7B | 16K | Llama 2 license | GGUF, safetensors | Codigo |
| DeepSeek-Coder 6.7B | 6.7B | 16K | MIT | GGUF, safetensors | Codigo |
| Qwen2.5-Coder 7B | 7.6B | 32K | Apache 2.0 | GGUF, safetensors | Codigo |

La comparativa se basa en parametros y licencia, ya que no se dispone de datos de rendimiento para Ornith1.5-9B. DeepSeek-Coder y Qwen2.5-Coder son alternativas solidas con licencias permisivas, pero no ofrecen capacidades multimodales ni el enfoque de auto-mejora de Ornith. CodeLlama tiene una licencia mas restrictiva. La principal ventaja de Ornith es su naturaleza abliterated y su entrenamiento con auto-scaffolding, aunque su contexto no esta documentado en la informacion disponible.

## Limitaciones y advertencias

- Modelo sin censura: al ser una version abliterated, puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es adecuado para aplicaciones orientadas al publico general sin un filtrado posterior.
- Solo ingles: el rendimiento en otros idiomas es deficiente o nulo, lo que limita su uso en entornos multilingues.
- Longitud de contexto no documentada: no se ha especificado la ventana de contexto del modelo base, lo que dificulta planificar tareas que requieran contextos largos.
- Riesgo de alucinacion: como todos los LLM, puede inventar informacion, especialmente en tareas de codigo donde las APIs o funciones no existen.
- Degradacion por cuantizacion: las cuantizaciones por debajo de Q4 (IQ1, IQ2, Q3) sufren una perdida significativa de calidad y no se recomiendan para tareas de produccion.
- Ausencia de proyector de vision en este repo: para usar las capacidades multimodales es necesario descargar los archivos mmproj del repositorio estatico, lo que anade complejidad al despliegue.
- Fecha de creacion futura: el modelo fue creado en septiembre de 2026, lo que sugiere que es un proyecto reciente y posiblemente con poca adopcion o validacion externa.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/Ornith1.5-9B-3MPER0RR-obliterated-i1-GGUF
- Modelo base (abliterated): https://huggingface.co/3MPER0RR/Ornith1.5-9B-3MPER0RR-abliterated
- Repositorio estatico (con mmproj): https://huggingface.co/mradermacher/Ornith1.5-9B-3MPER0RR-obliterated-GGUF
- Blog oficial de Ornith 1.5: https://ornith.ai/ornith_1_5.html
- Pagina en Ollama: https://ollama.com/library/ornith-1.5
- Guia de ejecucion local (atomic.chat): https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
