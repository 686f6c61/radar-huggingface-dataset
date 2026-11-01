# mlx-community/Ling-3.1-flash-1019-oQ2e-mtp

## Resumen

Ling-3.1-flash-1019-oQ2e-mtp es una versión cuantizada en formato MLX del modelo Ling-3.1-flash-1019 de inclusionAI, publicada por la comunidad mlx-community. El modelo base es una actualización de Ling-3.1-flash con capacidades mejoradas de razonamiento y de agentes. Se trata de un modelo mixture-of-experts (MoE) híbrido con atención lineal, de 560B de parámetros totales y 25B activos por token, orientado a generación de texto conversacional.

La versión oQ2e utiliza la cuantización de precisión mixta de oQ (oMLX v0.7.3rc1), que asigna bits por capa según su sensibilidad medida, logrando una media efectiva de 2,701 bits/peso. El checkpoint incluye la capa MTP (NextN), que oMLX ejecuta como decodificación especulativa "Lightning MTP" para acelerar la inferencia. El repositorio ocupa 193,2 GB.

Es relevante porque permite ejecutar en hardware Apple Silicon (mediante MLX) un modelo MoE de escala muy grande con una huella de memoria reducida gracias a la cuantización agresiva, manteniendo las capacidades de razonamiento y uso agéntico del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención lineal (bailing_hybrid): 63 capas KDA linear-attention + 9 capas gated MLA |
| Parametros totales | 572.120.680.768 (checkpoint completo con MTP; modelo base 560B) |
| Parametros activos | 25B (8 expertos activos de 512 expertos enrutados por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ2e: affine 2-bit (grupo 64), affine 4-bit (grupo 64), affine 8-bit (grupos 64 y 128), BF16 y FP32 residuales; media efectiva 2,701 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (framework MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer mixture-of-experts con arquitectura híbrida de atención: combina 63 capas de atención lineal KDA (Kimi Delta Attention) con 9 capas gated MLA (Multi-head Latent Attention). Tiene 512 expertos enrutados, de los cuales 8 se activan por token, lo que reduce el cómputo por token a unos 25B de parámetros activos sobre 560B totales. El checkpoint incluye además la capa MTP (NextN), un módulo de predicción multi-token que oMLX aprovecha para decodificación especulativa ("Lightning MTP"), aumentando el throughput de generación.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no hay datos disponibles en la información proporcionada. En cuanto a la cuantización, oQ2e asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (256 muestras x 512 tokens recogidas capa a capa desde los pesos FP8 originales) y aplica un reajuste por mínimos cuadrados ponderados de escala y sesgo. El 95,7 % de los pesos se almacena en affine 2-bit, con capas sensibles en 4-bit, 8-bit y BF16.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Razonamiento mejorado respecto a Ling-3.1-flash, según la descripción del modelo base.
- Capacidades agénticas mejoradas respecto a Ling-3.1-flash, según la descripción del modelo base.
- Generación acelerada mediante decodificación especulativa Lightning MTP (capa NextN incluida en el checkpoint).
- Ejecución eficiente en Apple Silicon gracias al formato MLX con cuantización de 2,7 bits efectivos.
- Soporte de tool calling, capacidades multilingües y modalidades (visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Chatbots y asistentes conversacionales en Mac: gracias al formato MLX y la cuantización a 2,7 bits efectivos, el modelo puede ejecutarse localmente en Apple Silicon con memoria unificada suficiente, permitiendo asistentes privados sin depender de la nube.
- Prototipado de agentes de IA: el modelo base incorpora mejoras agénticas, por lo que es adecuado para experimentar con flujos multi-paso (planificación, uso de herramientas) desde un equipo local.
- Generación de texto a gran escala con bajo coste de cómputo: al ser MoE con 25B de parámetros activos, ofrece la capacidad de un modelo de 560B con la latencia de uno mucho menor, útil para pipelines de generación de contenido.
- Investigación sobre decodificación especulativa: la inclusión de la capa MTP y su ejecución como Lightning MTP lo hace idóneo para estudiar y medir aceleraciones por speculative decoding en MLX.
- Investigación sobre cuantización extrema: la distribución de bits por sensibilidad de oQ2e sirve como caso de estudio para evaluar la degradación de calidad en cuantizaciones de ~2,7 bits sobre modelos MoE híbridos.
- Experimentación con arquitecturas de atención híbrida: la combinación de 63 capas KDA lineales y 9 capas gated MLA permite evaluar en la práctica el comportamiento de arquitecturas híbridas linear-attention en tareas largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint completo ocupa 193,2 GB (179,885 GiB), por lo que se necesita al menos esa cantidad de memoria unificada disponible, más margen para KV cache y activaciones; en la práctica, equipos Apple Silicon con 256 GB o más de memoria unificada (por ejemplo, Mac Studio M3 Ultra de 256/512 GB).
- GPU recomendadas: no disponible (modelo MLX orientado a Apple Silicon; no está pensado para GPUs NVIDIA).
- Consumer GPU: no cabe en GPUs de consumo convencionales (una RTX 4090 con 24 GB o una RTX 5090 con 32 GB están muy lejos de los ~180 GiB necesarios para los pesos).
- Opciones de despliegue: oMLX (oQ, v0.7.3rc1) sobre el framework MLX de Apple; otras opciones (llama.cpp, Ollama, vLLM, TGI) no son aplicables a este checkpoint MLX concreto.
- Latencia y throughput: no disponible; la capa MTP ejecutada como Lightning MTP speculative decoding está diseñada para mejorar el throughput de generación.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Arquitectura | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Ling-3.1-flash-1019-oQ2e-mtp (este) | 572B (con MTP) | 25B | MoE híbrido (KDA + gated MLA) | oQ2e, 2,701 bits/peso efectivos | MIT |
| inclusionAI/Ling-3.1-flash-1019 (base) | 560B | 25B | MoE híbrido (KDA + gated MLA) | FP8 original | MIT |
| inclusionAI/Ling-3.1-flash | no disponible | no disponible | MoE híbrido | no disponible | no disponible |

Nota: se desconocen los datos de contexto, rendimiento y disponibilidad de formatos alternativos (GGUF, etc.) para los modelos comparados; los datos de la tabla proceden únicamente de la información proporcionada.

## Limitaciones y advertencias

- Cuantización agresiva: con una media de 2,701 bits/peso (95,7 % de los pesos en 2-bit), cabe esperar cierta degradación de calidad respecto al modelo FP8 original, especialmente en tareas de razonamiento fino o matemáticas; conviene validar en cada caso de uso.
- Requisito de hardware muy elevado: se necesitan ~180 GiB solo para los pesos, lo que limita la ejecución a estaciones Apple Silicon de gama alta.
- Formato MLX: el checkpoint solo es utilizable con MLX/oMLX en hardware Apple; no es compatible directamente con vLLM, llama.cpp o TGI.
- Longitud de contexto: no disponible en la información proporcionada; verificar en la ficha del modelo base antes de planificar tareas con documentos largos.
- Idiomas soportados: no disponible; consultar la documentación del modelo base.
- Riesgo de alucinación y sesgos: no disponible información específica, pero como todo modelo de lenguaje de gran escala, puede generar contenido incorrecto o sesgado; no usar sin supervisión en aplicaciones sensibles.
- Licencia MIT: permite uso comercial sin restricciones significativas, heredada del modelo base.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/mlx-community/Ling-3.1-flash-1019-oQ2e-mtp
- Modelo base (inclusionAI/Ling-3.1-flash-1019): https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- Versión anterior (inclusionAI/Ling-3.1-flash): https://huggingface.co/inclusionAI/Ling-3.1-flash
- Herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
