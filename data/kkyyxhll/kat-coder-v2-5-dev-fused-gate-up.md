# kkyyxhll/KAT-Coder-V2.5-Dev-fused-gate-up

## Resumen

KAT-Coder-V2.5-Dev-fused-gate-up es una variante del modelo de código agéntico KAT-Coder-V2.5-Dev, publicada por el usuario kkyyxhll en Hugging Face. El modelo original, desarrollado por Kwaipilot (equipo de IA de Kuaishou), es un modelo de Mixture of Experts (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos por token, diseñado para actuar de forma autónoma dentro de repositorios de código ejecutables, en lugar de limitarse a generar código en una sola pasada. Esta versión concreta incorpora una fusión de las proyecciones gate-up (fused-gate-up), una modificación técnica que no altera las capacidades funcionales del modelo base.

El modelo se posiciona como un referente en agentic coding dentro de su escala, logrando un 69,40 % en SWE-bench Verified y un 63,00 % en SWE-bench Multilingual, superando a alternativas como Qwen3.5-27B o Gemma4-31B. Está construido sobre la base Qwen3.6-35B-A3B y ha sido sometido a un post-entrenamiento con SFT y RL para optimizar comportamientos anómalos, como etiquetas de herramientas incorrectas o repeticiones en conversaciones de un solo turno. La liberación open-weight incluye únicamente los pesos del modelo de lenguaje, operando en modo texto; los componentes multimodales no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 (≈35B) |
| Parametros activos | 3B (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existen GGUF de variantes similares, pero no de esta) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

KAT-Coder-V2.5-Dev emplea una arquitectura MoE con 35B parametros totales y 3B activos por token, lo que permite una inferencia eficiente en terminos de computo. El modelo base es Qwen3.6-35B-A3B, sobre el cual se aplico un post-entrenamiento agéntico de extremo a extremo, segun el informe tecnico (arXiv:2607.05471). Este proceso combina SFT (supervised fine-tuning) y RL (reinforcement learning) para entrenar al modelo en tareas de resolucion de problemas dentro de repositorios reales, con recompensas verificables y trayectorias de alta calidad. La variante fused-gate-up fusiona las proyecciones gate y up del mecanismo de atencion, una optimizacion de pesos que no modifica la arquitectura funcional. No se han publicado detalles sobre el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de codigo y razonamiento agéntico: el modelo puede planificar y ejecutar multiples pasos dentro de un repositorio, editando archivos, ejecutando comandos y verificando resultados.
- Soporte de tool calling y function calling: integrado en el flujo agéntico para interactuar con herramientas de desarrollo (compiladores, gestores de paquetes, etc.).
- Capacidades multilingues: entrenado en ingles y chino, con soporte para codigo en multiples lenguajes de programacion.
- Optimizacion de comportamientos: reduccion de etiquetas de herramientas anómalas (de 9,34 % a 0,28 %) y eliminacion de repeticiones en un solo turno (de 0,34 % a 0 %).
- Modo texto: no incluye capacidades de vision ni audio; es exclusivamente un modelo de lenguaje.

## Casos de uso

- Resolucion autonoma de issues en repositorios: el modelo puede analizar un issue, localizar el codigo relevante, proponer un parche y ejecutar pruebas, gracias a su entrenamiento en entornos ejecutables y su ventana de contexto (aunque no se especifica la longitud exacta).
- Asistente de programacion en entornos de desarrollo integrado (IDE): integrable como agente que sugiere cambios, refactoriza codigo y ejecuta comandos de terminal, aprovechando su soporte de tool calling.
- Automatizacion de tareas de mantenimiento de codigo: actualizacion de dependencias, correccion de vulnerabilidades o migracion de APIs, con verificacion automatica mediante ejecucion de tests.
- Generacion de codigo en pipelines de CI/CD: el modelo puede generar fragmentos de codigo, escribir tests unitarios o documentar funciones, integrandose en flujos de integracion continua.
- Soporte multilingue para equipos internacionales: al estar entrenado en ingles y chino, puede generar comentarios, documentacion y mensajes de commit en ambos idiomas.
- Educacion y formacion en programacion: como tutor que explica soluciones, genera ejemplos y corrige errores en tiempo real, aprovechando su capacidad de razonamiento multi-paso.

## Benchmarks y rendimiento

La model card del modelo base reporta los siguientes resultados en benchmarks de agentic coding, comparados con modelos similares:

| Benchmark | KAT-Coder-V2.5-Dev | Qwen3.5-27B | Qwen3.6-35BA3B | Gemma4-31B | Qwen3.5-35BA3B | Ornith-1.0-35B | Gemma4-26BA4B | Qwen3-Coder-30B |
|---|---|---|---|---|---|---|---|---|
| SWE-bench Verified | 69,40 | 68,60 | 64,40 | 60,60 | 58,60 | 55,80 | 35,80 | 31,80 |
| SWE-bench Multilingual | 63,00 | 57,67 | 57,00 | 49,33 | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible. La variante fused-gate-up no presenta benchmarks propios, por lo que se asume el rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35B parametros totales, en precision FP16 se requieren aproximadamente 70 GB de VRAM. Con cuantizacion de 4 bits, la demanda se reduce a unos 20-25 GB, y con 8 bits a unos 35-40 GB (estimaciones basadas en el tamaño del modelo).
- GPU recomendadas: para despliegue en FP16, se necesitan GPUs de datacenter como A100 (80 GB) o H100. Con cuantizacion, es posible ejecutar en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) usando formatos GGUF o AWQ.
- Opciones de despliegue: compatible con vLLM, SGLang, KTransformers y Hugging Face Transformers. Tambien existen conversiones GGUF de variantes similares para su uso con llama.cpp y Ollama.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | SWE-bench Verified | Licencia |
|---|---|---|---|---|
| KAT-Coder-V2.5-Dev | 35B | 3B | 69,40 | Apache 2.0 |
| Qwen3.5-27B | 27B | 27B (denso) | 68,60 | Apache 2.0 |
| Qwen3.6-35BA3B | 35B | 3B | 64,40 | Apache 2.0 |
| Gemma4-31B | 31B | 31B (denso) | 60,60 | Gemma License |

KAT-Coder-V2.5-Dev supera a sus competidores directos en SWE-bench Verified, con una ventaja de 0,8 puntos sobre Qwen3.5-27B y de 5 puntos sobre Qwen3.6-35BA3B, ambos con arquitecturas similares. La licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de Gemma4-31B que tiene una licencia propietaria con limitaciones.

## Limitaciones y advertencias

- El modelo opera exclusivamente en modo texto; los componentes de vision/multimodales no estan incluidos en esta liberacion, a pesar de que los tags de Hugging Face mencionan image-text-to-text.
- No se especifica la longitud de contexto, lo que limita la planificacion de proyectos muy grandes o con dependencias extensas.
- Al estar entrenado principalmente en codigo, puede presentar sesgos hacia ciertos lenguajes o estilos de programacion, y puede alucinar APIs o funciones inexistentes.
- La variante fused-gate-up es una modificacion no oficial del modelo base; no hay garantias de que el rendimiento sea identico al reportado por Kwaipilot.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo puede generar codigo con vulnerabilidades de seguridad si no se supervisa adecuadamente.
- No se dispone de informacion sobre el dataset de entrenamiento, por lo que no se pueden evaluar posibles sesgos de contenido.

## Enlaces

- Repositorio de esta variante: https://huggingface.co/kkyyxhll/KAT-Coder-V2.5-Dev-fused-gate-up
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.05471
- Articulo en HackerNoon: https://hackernoon.com/kat-coder-v25-dev-an-open-agentic-coding-model
- Guia de despliegue local: https://www.aimadetools.com/blog/how-to-run-kat-coder-v2-5-locally/
- Conversiones GGUF de una variante similar: https://huggingface.co/ursb01/KAT-Coder-V2.5-Dev-MTP-APEX-GGUF
