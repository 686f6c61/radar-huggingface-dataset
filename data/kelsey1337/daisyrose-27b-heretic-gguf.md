# kelsey1337/DaisyRose-27B-Heretic-GGUF

## Resumen

DaisyRose-27B-Heretic-GGUF es una versión cuantizada en formato GGUF del modelo RadixArk/DaisyRose-27B, un transformer denso de aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos safetensors del modelo base), al que se le ha aplicado un proceso de "abliteración" o eliminación de comportamiento de rechazo mediante la herramienta Heretic 2.1.0. El autor de esta conversión es el usuario de Hugging Face kelsey1337, que publica tanto los pesos GGUF como una versión BF16 en safetensors para su uso con vLLM, MLX o AWQ.

El modelo base se etiqueta internamente como "qwen3.8", lo que sugiere una arquitectura derivada de la familia Qwen, e incorpora una torre de visión que no ha sido modificada por el proceso de abliteración: para usar las capacidades multimodales hay que cargar el mmproj original de DaisyRose. La relevancia de esta ficha radica en que documenta un caso de decensurado parcial con métricas explícitas de compromiso entre tasa de rechazo y divergencia KL, algo poco habitual en la comunidad.

El proceso se ejecutó íntegramente en BF16 sobre GPUs A100 y H200, con 342 ensayos de Optuna, y el autor reconoce abiertamente que se trata de una versión 1 incompleta: no se alcanzó el objetivo de diseño de ≤5 rechazos por cada 100 peticiones sin degradar el modelo. La licencia declarada es Apache 2.0, lo que permite uso comercial, aunque con las salvedades de seguridad que se detallan más abajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base derivada de Qwen, etiquetada "qwen3.8"); incluye torre de visión en el modelo base |
| Parámetros totales | 26.895.998.464 (~26,9 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); safetensors BF16 disponible en kelsey1337/DaisyRose-27B-Heretic |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de ~27B parámetros. La model card no detalla la composición del dataset de preentrenamiento ni si hubo fases de RLHF o DPO; únicamente se indica que la arquitectura se etiqueta como "qwen3.8" y que conserva una torre de visión funcional que debe cargarse con el mmproj original de RadixArk/DaisyRose-27B. No se dispone de información sobre el número de tokens de entrenamiento ni sobre innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.).

La innovación principal de esta publicación no está en el entrenamiento, sino en el post-procesado: se aplicó Heretic 2.1.0 con la técnica Arbitrary-Rank Ablation (ARA) y los scorers por defecto (tasa de palabras clave de rechazo y divergencia KL). El proceso se ejecutó íntegramente en BF16 sobre A100 y H200, con un único estudio Optuna compartido entre máquinas y 342 ensayos registrados. El punto de partida tenía 98 rechazos por cada 100 peticiones; el ensayo seleccionado (#59) logró 46/100 rechazos contados por palabras clave con una divergencia KL de 0,0753. Una revisión manual del ensayo elegido redujo la cifra a 12 frases de rechazo reales más 31 casos con solo palabras de advertencia. El autor documenta que por debajo de ~45/100 rechazos contados las ediciones empezaban a dañar el modelo (KL entre 0,3 y 12), y que la búsqueda continúa para una futura v2. Los pesos GGUF se generaron con llama.cpp upstream y se cuantizaron usando una imatrix de calibración (bartowski calibration_datav3, incluida en el repo).

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline etiquetado como "conversational".
- Razonamiento general y respuesta a instrucciones, heredado del modelo base DaisyRose-27B.
- Capacidad de visión: la torre visual del modelo base no fue modificada, por lo que puede procesar imágenes si se carga el mmproj original de RadixArk/DaisyRose-27B.
- Comportamiento "uncensored" parcial: la abliteración reduce la tasa de rechazo de 98/100 a ~46/100 contados por palabras clave (12 frases de rechazo reales en revisión manual).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura compatible con la API de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteración: el repo incluye el log completo `heretic-run.log` con los 342 ensayos de Optuna, lo que permite reproducir el estudio, analizar la frontera de Pareto entre tasa de rechazo y KL, y comparar metodologías de decensurado en modelos de ~27B.
- Generación creativa sin fricción: escritura de ficción, guiones o narrativa que aborde temas sensibles sin que el modelo introduzca advertencias sistemáticas, aprovechando la reducción de rechazos respecto al modelo base.
- Despliegue en hardware de consumo: las cuantizaciones IQ2/IQ3 (entre 8,9 y 14,7 GB) permiten ejecutar un modelo de 27B en GPUs con 12-16 GB de VRAM mediante llama.cpp u Ollama, algo inviable con el BF16 de 53,8 GB.
- Procesamiento de imágenes en local: cargando el mmproj original junto con el GGUF se obtiene un pipeline multimodal (visión + lenguaje) ejecutable en estaciones de trabajo sin depender de APIs externas.
- Análisis de documentos y extracción de información: con contexto conversacional y capacidad de visión, puede emplearse para transcribir y resumir capturas, diagramas o documentos escaneados en entornos con requisitos de privacidad.
- Evaluación comparativa de cuantizaciones: el repo ofrece 24 variantes de cuantización del mismo modelo, lo que facilita estudios de degradación de calidad frente a tamaño de archivo en tareas concretas.
- Servicio de chat autoalojado: mediante vLLM con los pesos BF16 safetensors del repo hermano, o llama.cpp/Ollama con los GGUF, para aplicaciones donde se quiera control total del modelo y de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas del proceso de abliteración, que se recogen a continuación:

| Métrica | Modelo base (stock) | Ensayo #59 seleccionado |
|---|---|---|
| Rechazos por palabras clave (sobre 100) | 98 | 46 |
| Frases de rechazo reales (revisión manual) | No disponible | 12 |
| Casos con solo palabras de advertencia | No disponible | 31 |
| Divergencia KL | 0 (referencia) | 0,0753 |
| Ensayos Optuna ejecutados | No aplica | 342 |

No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparaciones de rendimiento frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (según archivo GGUF): IQ1_S ~7,7 GB; IQ2_M ~10,4 GB; Q3_K_M ~13,5 GB; Q4_K_M ~16,7 GB; Q5_K_M ~19,3 GB; Q6_K ~22,1 GB; Q8_0 ~28,6 GB; BF16 ~53,8 GB.
- GPU recomendadas: para BF16, A100 80 GB o H100; para Q8_0, RTX 4090 (24 GB) o A6000; para Q4_K_M/Q5_K_M, RTX 4090, RTX 4080 o RTX 3090; para IQ2/IQ3, RTX 4070 Ti, RTX 3060 12 GB o similares.
- Cabe en GPU de consumo: sí, desde cuantizaciones IQ1/IQ2 en GPUs de 8-12 GB hasta Q6_K en 24 GB. Las variantes Q8_0 y BF16 requieren GPUs de datacenter o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio y otras herramientas basadas en llama.cpp para los GGUF; vLLM, MLX o AWQ con los pesos BF16 safetensors del repo kelsey1337/DaisyRose-27B-Heretic. Para visión, cargar el mmproj original de RadixArk/DaisyRose-27B.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-Heretic-GGUF | ~26,9B | No disponible | Apache 2.0 | GGUF (24 cuantizaciones) | Abliteración parcial; 46/100 rechazos por palabras clave, KL 0,0753 |
| RadixArk/DaisyRose-27B (base) | ~26,9B | No disponible | No disponible | Safetensors | Modelo original con torre de visión; 98/100 rechazos |
| kelsey1337/DaisyRose-27B-Heretic | ~26,9B | No disponible | Apache 2.0 | Safetensors BF16 | Misma abliteración en BF16 para vLLM/MLX/AWQ |

No se dispone de información sobre otros modelos comparables de la misma categoría (por ejemplo, variantes abliteradas de Qwen de ~27B u otros modelos "uncensored" del mismo tamaño) en la documentación proporcionada, por lo que la comparativa se limita a las tres variantes del propio linaje DaisyRose.

## Limitaciones y advertencias

- La abliteración es parcial: el autor reconoce que no se alcanzó el objetivo de ≤5/100 rechazos y que el ensayo seleccionado mantiene 46/100 rechazos contados por palabras clave (12 frases de rechazo reales en revisión manual).
- El recuento de rechazos usa la lista de palabras clave por defecto de Heretic, que es estricta: palabras como "illegal", "harmful", "disclaimer" o "As an AI" cuentan como rechazo aunque el modelo responda después.
- Riesgo de seguridad incrementado: al eliminar el comportamiento de rechazo, el modelo es más propenso a seguir instrucciones inyectadas a través de contenido no confiable (páginas web, archivos de repositorios, salidas de herramientas). El autor advierte explícitamente de no combinarlo con credenciales activas ni acceso a shell sin sandbox.
- Riesgo de alucinación: no cuantificado en la información disponible; no hay benchmarks que permitan estimar la degradación respecto al modelo base.
- Idiomas soportados no documentados: no se especifica cobertura multilingüe.
- Longitud de contexto no documentada: no se puede confirmar la ventana máxima soportada.
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ1_M, IQ2_XXS) pueden degradar notablemente la calidad; el autor no publica evaluaciones por cuantización.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado y sobre las instrucciones inyectadas recae en el desplegador.
- El modelo fue operado y monitorizado por un asistente de IA (Claude Opus 5.5) durante el proceso de abliteración, con selección final del ensayo delegada por el editor; el log completo se incluye en el repo para auditoría.
- El repo ocupa 376,5 GB, lo que implica un coste de almacenamiento considerable si se descargan todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-GGUF
- Pesos BF16 safetensors: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
