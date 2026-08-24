# babyfacez/Kimi-K3

## Resumen

Kimi K3 es un modelo de inteligencia artificial de codigo abierto desarrollado por Moonshot AI, presentado el 16 de julio de 2026. Se trata de un modelo multimodal nativo (texto, imagen y video) con arquitectura de mezcla de expertos (MoE) que alcanza los 2,8 billones de parametros, lo que lo convierte en el primer modelo abierto de clase 3T. Incorpora una ventana de contexto de 1 millon de tokens y esta disenado para tareas agénticas de larga duracion, como programacion extensa, trabajo de conocimiento y razonamiento avanzado.

El modelo se construye sobre dos innovaciones arquitectonicas propias: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), junto con un framework de MoE disperso denominado Stable LatentMoE que activa 16 de los 896 expertos disponibles por token. Con 104.000 millones de parametros activos, Kimi K3 logra una mejora aproximada de 2,5 veces en eficiencia de escalado frente a su predecesor, Kimi K2.

La relevancia actual de Kimi K3 radica en que democratiza el acceso a inteligencia de frontera con pesos abiertos, permitiendo a investigadores y desarrolladores desplegar capacidades de nivel frontier en entornos de produccion, desde desarrollo de compiladores hasta diseno de chips y edicion de video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit, compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (licencia personalizada) |
| Formato de pesos | safetensors |
| Numero de capas | 93 (1 densa + 92 MoE) |
| Composicion de capas de atencion | 69 KDA + 24 Gated MLA |
| Dimension oculta de atencion | 7168 |
| Numero de cabezas de atencion | 96 |
| Dimension del MoE latente | 3584 |
| Dimension oculta del MoE (por experto) | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE dispersa con 896 expertos, de los cuales se activan 16 por token. El modelo consta de 93 capas, de las cuales una es densa, y combina 69 capas de atencion KDA con 24 capas de Gated MLA (Multi-head Latent Attention). La dimension oculta de atencion es de 7168 con 96 cabezas, mientras que la dimension del MoE latente es de 3584 y la dimension oculta por experto es de 3072.

La innovacion principal reside en el framework Stable LatentMoE, que escala la dispersion del MoE manteniendo estabilidad durante el entrenamiento, y en las arquitecturas KDA y AttnRes, que mejoran la eficiencia del escalado. Segun Moonshot AI, esto proporciona una mejora aproximada de 2,5 veces en eficiencia de escalado global frente a Kimi K2. El modelo es multimodal nativo, procesando texto, imagenes y video dentro de la misma arquitectura, sin necesidad de adaptadores externos.

Los detalles especificos sobre el dataset de entrenamiento, el numero de tokens procesados y las tecnicas de alineacion (RLHF, DPO, etc.) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento avanzado con ventana de contexto de 1 millon de tokens.
- Comprension multimodal nativa de texto, imagenes y video dentro del mismo modelo.
- Programacion de larga duracion (long-horizon coding): sesiones de ingenieria prolongadas con supervision humana minima, navegacion de repositorios masivos y orquestacion de herramientas de terminal.
- Trabajo de conocimiento agéntico: investigacion profunda con visualizaciones interactivas, widgets, paneles de control y diseno de movimiento.
- Capacidades agénticas: operacion con herramientas del sistema, desarrollo de kernels GPU, compiladores, juegos con vision en el bucle, CAD y diseno de chips.
- Soporte de tool calling y orquestacion de tareas paralelas (Swarm y Goal).
- Edicion de video y diseno de movimiento impulsados por la arquitectura multimodal nativa.

## Casos de uso

- Desarrollo de kernels GPU y optimizacion de compiladores: Kimi K3 puede mantener sesiones de ingenieria prolongadas con supervision minima, navegando repositorios masivos y orquestando herramientas de terminal para iterar sobre optimizaciones de bajo nivel.
- Desarrollo de juegos con vision en el bucle: el modelo puede interpretar salidas visuales del motor de juego y ajustar el codigo en consecuencia, permitiendo ciclos de desarrollo iterativos sin intervencion humana constante.
- Diseno de chips (chip design): gracias a su capacidad de razonamiento de larga duracion y su ventana de contexto de 1 millon de tokens, puede gestionar especificaciones extensas y coordinar multiples herramientas de diseno electronico.
- Investigacion profunda automatizada: el modelo produce informes de investigacion con visualizaciones interactivas, widgets y paneles de control, integrando datos de multiples fuentes en documentos ejecutables.
- Edicion de video y diseno de movimiento: su comprension multimodal nativa permite procesar secuencias de video y generar ediciones, transiciones y efectos de movimiento de forma automatizada.
- Asistente de programacion en produccion: con soporte de tool calling y una ventana de contexto de 1 millon de tokens, puede integrarse en pipelines de CI/CD para revisar codigo, generar parches y gestionar repositorios de gran tamano.
- Creacion de presentaciones de nivel consultor: el modelo puede generar diapositivas pulidas y documentos de consultoria a partir de datos brutos, aprovechando su capacidad de razonamiento y generacion multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la etiqueta "eval-results", pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks estandar en los datos facilitados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8 billones de parametros, el modelo requiere aproximadamente 5,6 TB en precision FP16/BF16, 2,8 TB en FP8 y 1,4 TB en cuantizacion de 4 bits. El repositorio ocupa 1561 GB, lo que sugiere pesos comprimidos (8-bit o inferior).
- GPU recomendadas: se requiere un cluster multi-GPU de clase datacenter. No es factible en una sola GPU, ni siquiera en las de mayor capacidad como H100 (80 GB) o A100 (80 GB). Se necesitarian decenas de GPUs H100 o equivalentes.
- No cabe en GPUs de consumo: ninguna GPU consumer (RTX 4090, RTX 5090, etc.) puede alojar este modelo, ni siquiera en cuantizacion de 4 bits.
- Opciones de despliegue: no se especifican en la informacion proporcionada, pero por el tamano del modelo, serian necesarias soluciones de inferencia distribuida como vLLM con tensor parallelism, o frameworks especializados para MoE con expert offloading.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Kimi K3 | 2,8T (104B activos) | 1M tokens | MoE con KDA + AttnRes | Kimi K3 License |
| Kimi K2 | no disponible | no disponible | MoE | no disponible |
| DeepSeek V3/R1 | no disponible | no disponible | MoE | no disponible |

Los datos especificos de Kimi K2 y otros modelos comparables no estan disponibles en la informacion proporcionada. Kimi K3 es el primer modelo abierto de clase 3T, lo que lo situa en una categoria superior en escala respecto a alternativas abiertas previas.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia Kimi K3 es personalizada (license: other) y puede imponer restricciones de uso comercial. Es necesario revisar los terminos completos antes de su despliegue en produccion.
- Requisitos de hardware extremos: con 2,8 billones de parametros, la inferencia requiere infraestructura de datacenter multi-GPU, lo que limita su accesibilidad a organizaciones con recursos computacionales significativos.
- Idiomas soportados: no se ha especificado la lista de idiomas soportados en la informacion disponible.
- Riesgo de alucinacion: como todo modelo de lenguaje de gran escala, existe riesgo de alucinacion, especialmente en tareas de razonamiento de larga duracion donde el modelo opera con supervision humana minima.
- Sesgos: no se dispone de informacion sobre sesgos conocidos o evaluaciones de seguridad en los datos proporcionados.
- Datos de entrenamiento: no se ha publicado informacion detallada sobre la composicion del dataset de entrenamiento, lo que dificulta evaluar posibles sesgos o limitaciones de conocimiento.

## Enlaces

- HuggingFace (repo del autor): https://huggingface.co/babyfacez/Kimi-K3
- HuggingFace (Moonshot AI): https://huggingface.co/moonshotai
- Chat Kimi K3: https://www.kimi.com
- Pagina del modelo: https://www.kimi.ai/ai-models/kimi-k3
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Plataforma API de Kimi: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Moonshot AI: https://www.moonshot.ai
- ModelScope: https://modelscope.cn/organization/moonshotai
