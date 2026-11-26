# nexus-syntegra/Nexus-SmallDecision-26B-A4B-v2.0-SystemOne-Jev

## Resumen

Nexus-SmallDecision-26B-A4B-v2.0-SystemOne-Jev es un modelo de la familia Gemma 4, publicado por el usuario nexus-syntegra, especializado en toma de decisiones tipada: recibe un estado descrito en texto junto con preguntas estructuradas (sí/no, elección entre hasta 255 opciones u ordenación en hasta 10 niveles) y devuelve una probabilidad por respuesta en un único forward pass, sin generar texto. Se trata de un fine-tuning mediante un adaptador LoRA fusionado a fuerza 0,75 sobre el modelo base nvidia/Gemma-4-26B-A4B-NVFP4, un modelo de arquitectura Mixture of Experts con cuantización NVFP4.

El modelo se posiciona como una alternativa independiente a Jev, el modelo original de la categoría "System One" (respuesta probabilística en un solo paso a preguntas tipadas sobre un estado). El adaptador se construye como una "uniform soup" de cuatro ejecuciones de fine-tuning que entrenan únicamente en las posiciones de respuesta, de modo que el texto de estado nunca se entrena como lenguaje. Según la model card, el modelo se sirve en un formato de "lectura doble" (estado y pregunta escritos dos veces, respuesta leída en un token `<ans>` tras la segunda copia) para peticiones de hasta 3.000 tokens.

La relevancia del modelo radica en su enfoque de calibración: declara un ECE de 0,0093 en su conjunto T2 (frente a 0,1166 del Gemma base) y una precisión de 0,9638 en el mismo conjunto, además de mejoras de +7,64 puntos en MMLU-Pro y +5,61 en el índice de decisión público respecto al modelo base. No obstante, el propio autor advierte que parte de estas cifras pueden ser optimistas porque la configuración de despliegue se eligió maximizando el índice de decisión público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (Gemma 4), con adaptador LoRA fusionado |
| Parametros totales | 14.386.941.232 (según safetensors); el nombre comercial indica 26B-A4B |
| Parametros activos | 4B (según nomenclatura A4B del nombre y modelo base) |
| Longitud de contexto | no disponible (la model card menciona peticiones de hasta 3.000 tokens para el layout de lectura doble, sin especificar el contexto máximo) |
| Tipos de cuantizacion | NVFP4 (modelo base), 8-bit según tags, safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con soporte para vLLM y modelopt) |

## Arquitectura y entrenamiento

El modelo parte de nvidia/Gemma-4-26B-A4B-NVFP4, una arquitectura Transformer con capas Mixture of Experts (4B parámetros activos sobre 26B totales nominales) y cuantización NVFP4 de NVIDIA. Sobre esta base se fusiona un adaptador LoRA a fuerza 0,75, construido como una media uniforme ("uniform soup") de cuatro ejecuciones de fine-tuning independientes. El entrenamiento se realiza exclusivamente en las posiciones de respuesta (answer slots), de modo que el texto de estado no se entrena como lenguaje natural; esto es coherente con el objetivo de producir probabilidades calibradas en lugar de texto generado.

El conjunto de entrenamiento consta de 165.747 ítems (contados una vez por ejecución). Según la model card, 165.717 de ellos no tienen vínculo con ningún benchmark evaluado en la ficha; los 30 restantes son descripciones de funciones del paquete BFCL, sin casos de prueba ni respuestas. Las fuentes de datos incluyen generadores propios, MASSIVE y MultiDoGO (intenciones), ABCD (diálogos de atención al cliente), DynaSent (sentimiento), xLAM y Hermes (function calling), documentación de funciones BFCL y synth-intents-v1, generado por un modelo profesor para este proyecto. El autor declara explícitamente que el modelo es zero-shot respecto a los benchmarks puntuados, aunque advierte que la elección del layout de lectura doble y de la fuerza 0,75 se hizo maximizando el índice de decisión público, lo que puede introducir cierto optimismo en las cifras.

## Capacidades

- Clasificación probabilística tipada: responde preguntas de sí/no, elección múltiple de hasta 255 opciones y puntuaciones ordenadas de hasta 10 niveles, devolviendo una probabilidad por respuesta en un único forward pass.
- Calibración de confianza: el modelo está diseñado para que sus probabilidades reflejen incertidumbre real (ECE de 0,0093 en el conjunto T2 declarado).
- Razonamiento sobre estados textuales: lee un estado descrito en texto y responde preguntas sobre él sin generar lenguaje libre.
- Soporte de function calling / tool calling: el entrenamiento incluye datos de xLAM, Hermes y documentación de funciones BFCL.
- Capacidades de intención y diálogo: entrenado con MASSIVE, MultiDoGO y ABCD para clasificación de intenciones y diálogos de atención al cliente.
- Análisis de sentimiento: entrenado con DynaSent y evaluado en SST-5 e IMDB.
- Modo de lectura doble: para peticiones de hasta 3.000 tokens, el estado y la pregunta se escriben dos veces y la respuesta se lee en un token `<ans>` tras la segunda copia.
- Multilingüe: limitado a inglés según la model card.
- No genera texto: no es un modelo de chat ni de generación libre; su salida es una distribución de probabilidad sobre respuestas tipadas.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo clasifica la intención del usuario entre hasta 255 opciones con probabilidad calibrada, lo que permite decidir si derivar a un humano cuando la confianza es baja. Es adecuado por su entrenamiento en MASSIVE, MultiDoGO y clinc150.
- Moderación y triaje de tickets de soporte: dado un estado textual (descripción del ticket) y preguntas tipadas (categoría, urgencia, sentimiento), devuelve probabilidades en un solo paso, lo que reduce la latencia frente a pipelines generativos.
- Selección de herramientas en agentes: con soporte de function calling entrenado con xLAM, Hermes y BFCL, puede elegir entre un conjunto de funciones disponibles y asignar probabilidad a cada una, integrándose en un orquestador de agentes.
- Análisis de sentimiento calibrado en producción: clasifica reseñas o mensajes en escalas de hasta 10 niveles con ECE bajo, lo que permite umbrales de confianza fiables en lugar de etiquetas duras.
- Evaluación de riesgo en decisiones binarias: para preguntas de sí/no sobre un estado (por ejemplo, "¿requiere revisión manual?"), devuelve una probabilidad directamente utilizable como score de riesgo.
- Clasificación de documentos y consultas en recuperación: con la dimensión de Retrieval del índice de decisión (0,600 frente a 0,556 del base), puede puntuar la relevancia de un documento respecto a una consulta en pipelines RAG.
- Investigación en calibración y modelos "System One": sirve como referencia para estudiar modelos que responden en un solo paso con probabilidades, comparándolo con Jev y con el Gemma base.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. Todas las cifras comparan el modelo en su configuración de release con el Gemma 4 26B-A4B NVFP4 base servido en su propio layout (estado primero), en la misma build de vLLM y con los mismos ítems. Los intervalos son bootstrap al 95%.

| Benchmark | Stock Gemma | Release |
|---|---|---|
| Decision Index balanced skill (suite pública) | 47,94 | 53,54 |
| Raw index | 60,81 | 64,43 |
| Knowledge and reasoning | 0,290 | 0,397 |
| Language | 0,545 | 0,582 |
| Retrieval | 0,556 | 0,600 |
| Tools | 0,648 | 0,690 |
| Arts | 0,336 | 0,362 |
| T2 hard accuracy (12.228 preguntas) | 0,8698 | 0,9638 |
| T2 ECE | 0,1166 | 0,0093 |
| nibzard banking77 (3.080) | 0,7630 | 0,7825 |
| nibzard clinc150 (5.500) | 0,8662 | 0,8813 |
| full SST-5 (2.210) | 0,5575 | 0,5769 |
| IMDB polarity-choice (2.000) | 0,9595 | 0,9650 |
| IMDB polarity (2.000) | 0,9550 | 0,9525 |

Diferencia en T2 (release menos stock): +9,40 [+8,80, +10,02]. IMDB polarity es la única cifra pública en la que el release queda por debajo del stock (-0,25). Ganancias en conjuntos no entrenados: MMLU-Pro +7,64, banking77 +1,95, SST-5 +1,94, clinc150 +1,51 e IMDB polarity-choice +0,55; con un offset por posición eliminado, la ganancia en MMLU-Pro se reduce a +5,81. El autor advierte que el índice de decisión público no equivale al leaderboard privado (Full score) y que el modelo no ha sido enviado a ese leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 18,8 GB en safetensors con cuantización NVFP4/8-bit; se requiere una GPU con soporte de NVFP4 (arquitecturas Blackwell, como B200 o RTX 50xx) para explotar el formato nativo, o al menos ~20 GB de VRAM para cargar los pesos.
- GPU recomendadas: NVIDIA B200 o H100 para NVFP4 nativo; A100 o RTX 4090 pueden no soportar NVFP4 de forma nativa y requerirían conversión a otro formato.
- Cabe en GPU de consumo: no disponible con certeza; el tamaño de 18,8 GB está en el límite de una RTX 4090 (24 GB) si se convierte a un formato compatible, pero no hay datos publicados de despliegue en consumer.
- Opciones de despliegue: vLLM (soportado explícitamente según tags y model card), modelopt para el formato NVFP4; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nexus-SmallDecision-26B-A4B-v2.0-SystemOne-Jev | 14,4B reales (26B-A4B nominal) | no disponible | System One probabilístico, fine-tuning LoRA | apache-2.0 | Hugging Face |
| Jev (modelo original System One) | no disponible | no disponible | System One probabilístico | no disponible | no disponible |
| Gemma 4 26B-A4B NVFP4 (base) | 26B-A4B | no disponible | Generación de texto general | no disponible | Hugging Face (nvidia) |

La model card compara directamente con el Gemma base en todos los benchmarks, y con Jev en los conjuntos que publican respuestas por ítem (nibzard y jev-eval), reproduciendo exactamente las precisiones publicadas de Jev. No se dispone de datos de parámetros ni licencia de Jev en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente `en` como idioma soportado.
- No genera texto: no es apto para chat, resumen ni generación libre; su salida es una distribución de probabilidad sobre respuestas tipadas.
- Riesgo de optimismo en las cifras: el layout de lectura doble y la fuerza 0,75 se eligieron maximizando el índice de decisión público, por lo que las cifras públicas pueden estar infladas.
- El índice de decisión público no es el leaderboard: el autor no ha enviado el modelo al Full score privado, por lo que no hay entrada en leaderboard.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse con MASSIVE, MultiDoGO, ABCD, DynaSent, xLAM y Hermes, puede heredar sesgos de esos corpus.
- Alucinación: al no generar texto, el riesgo clásico de alucinación textual no aplica, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base (nvidia/Gemma-4-26B-A4B-NVFP4) puede tener sus propias condiciones que conviene verificar.
- Dependencia de hardware: el formato NVFP4 requiere GPUs con soporte nativo (Blackwell) para un rendimiento óptimo.
- Contexto limitado en la práctica: el layout de lectura doble solo aplica a peticiones de hasta 3.000 tokens; para peticiones más largas se usa escritura única con el estado primero, lo que puede cambiar el comportamiento.
- Sin datos de despliegue en consumer: no hay evidencia publicada de funcionamiento en GPU de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/nexus-syntegra/Nexus-SmallDecision-26B-A4B-v2.0-SystemOne-Jev
- Modelo base: https://huggingface.co/nvidia/Gemma-4-26B-A4B-NVFP4
- Paper de referencia (arXiv:2204.08582): no disponible en la información proporcionada
- Paper de referencia (arXiv:2012.15349): no disponible en la información proporcionada
- Paper de referencia (arXiv:2406.18518): no disponible en la información proporcionada
