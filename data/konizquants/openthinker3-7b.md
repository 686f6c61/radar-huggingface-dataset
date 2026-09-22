# konizquants/OpenThinker3-7B

## Resumen

OpenThinker3-7B es un modelo de razonamiento de 7B parámetros desarrollado por el proyecto Open Thoughts (open-thoughts), un esfuerzo de investigación abierto centrado en la creación de datos de razonamiento de alta calidad y en la reproducción de recetas de entrenamiento tipo R1 con recursos completamente abiertos. El modelo es un fine-tuning completo (SFT) de Qwen/Qwen2.5-7B-Instruct sobre el dataset OpenThoughts3-1.2M, compuesto por 850.000 preguntas de matemáticas, 250.000 de código y 100.000 de ciencia, con trazas de razonamiento generadas por QwQ-32B. La relevancia principal del trabajo es que alcanza resultados de estado del arte entre modelos de razonamiento de 7B entrenados únicamente con supervisión, sin ningún paso de aprendizaje por refuerzo (RL).

Arquitectónicamente es un transformer decoder-only denso, con la misma estructura que Qwen2.5-7B-Instruct: 7,61B parámetros, atención con GQA (28 capas, 28 cabezas de consulta y 4 de clave/valor, dimensión de cabeza 128) y ventana de contexto nativa de 32.768 tokens, extensible a 131.072 mediante YaRN. El entrenamiento se realizó con 512 nodos A100 durante 48 horas, con learning rate 8e-5, scheduler coseno, 5 épocas y batch total de 512, según los hiperparámetros declarados en la model card.

El repositorio analizado aquí, `konizquants/OpenThinker3-7B`, es una reproducción de terceros del modelo oficial `open-thoughts/OpenThinker3-7B`: la model card es una copia del README original (que enlaza al repositorio oficial) y el repositorio registra 0 descargas y 0 likes en el momento de la consulta. Conviene, por tanto, contrastar los pesos con la publicación oficial antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parámetros totales | 7,61B (heredados de Qwen2.5-7B-Instruct; no se declara un recuento propio en la model card) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No declarada en la model card del repositorio; hereda los 32.768 tokens nativos de Qwen2.5-7B-Instruct, extensibles a 131.072 con YaRN según la documentación del modelo base |
| Tipos de cuantización | No disponible en el repositorio (pesos completos en safetensors); al ser un modelo de la familia Qwen2.5 es compatible con GGUF, AWQ, GPTQ y bitsandbytes generados a partir del modelo original |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct y se somete a un fine-tuning supervisado completo (los tags del repositorio indican `full` y `llama-factory`, sin adaptadores LoRA). La model card es explícita en un punto clave: el modelo se entrenó «only with SFT, without any RL», es decir, sin etapas de RLHF, DPO, GRPO ni variantes de refuerzo con verificación. Todo el rendimiento en razonamiento proviene por tanto de la calidad y el volumen del dataset de trazas, no de un bucle de optimización por recompensa.

El dataset OpenThoughts3-1.2M combina 850.000 preguntas de matemáticas, 250.000 de código y 100.000 de ciencia, con trazas de razonamiento generadas por QwQ-32B. Los autores destacan que la receta se refinó mediante más de 1.000 experimentos de ablación. La configuración de entrenamiento declarada es: learning rate 8e-5, seed 42, optimizador AdamW (betas 0,9/0,999, epsilon 1e-8), scheduler coseno con warmup ratio 0,1, weight decay 0,0, 5 épocas, batch total de 512 y gradient accumulation de 1, distribuido en 512 nodos A100 durante 48 horas. El stack utilizado fue Transformers 4.46.1, PyTorch 2.3.0, Datasets 3.1.0 y Tokenizers 0.20.3.

No se documentan innovaciones arquitectónicas propias (no hay decodificación especulativa, atención lineal ni capas SSM): la contribución del trabajo es la canalización de datos, no la topología del modelo.

## Capacidades

- Generación de texto conversacional y de razonamiento en formato de cadena de pensamiento (el entrenamiento con trazas de QwQ-32B induce este comportamiento).
- Razonamiento matemático de competición: los resultados declarados en AIME24, AIME25, AMC23, MATH500 y HMMT O2/25 son propios de un modelo de 7B entrenado específicamente para este dominio.
- Generación y razonamiento sobre código: evaluación en LiveCodeBench (LCB 06/24-01/25), CodeElo y CodeForces.
- Razonamiento científico de nivel graduado, medido con GPQA-D y JEEBench.
- Conversación multi-turno: heredada de Qwen2.5-7B-Instruct, con plantilla de chat de la familia Qwen2.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).
- Soporte de tool calling / function calling: no declarado explícitamente en la model card, aunque el modelo base Qwen2.5-7B-Instruct sí lo soporta; debe verificarse empíricamente tras el fine-tuning.
- Capacidades de agente y multi-step reasoning: no declaradas explícitamente; el modo de razonamiento largo es compatible con flujos multi-paso, pero no hay evaluación publicada de uso agéntico.
- Capacidades multilingües: no declaradas en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Resolución de problemas matemáticos de nivel olímpico: con un 93,5 en AMC23 y un 90,0 en MATH500, el modelo es adecuado para asistentes de estudio, generación de problemas resueltos o verificación de soluciones en plataformas educativas, siempre con revisión humana dado el riesgo de error en el paso final.
- Generación de código con razonamiento previo: sus resultados en LiveCodeBench (51,7) y CodeForces (32,2) lo sitúan por encima de DeepSeek-R1-Distill-Qwen-32B en esas pruebas, lo que lo hace útil para autocompletado razonado, refactorización explicada o generación de tests unitarios en pipelines de CI.
- Tutoría científica y preparación de exámenes: los 53,7 puntos en GPQA-D y 72,4 en JEEBench permiten usarlo como generador de explicaciones paso a paso en física, química o biología de nivel preuniversitario y de grado.
- Destilación de datos sintéticos: al ser un modelo de 7B con licencia Apache 2.0, puede emplearse para generar trazas de razonamiento que alimenten el entrenamiento de modelos más pequeños, sin las restricciones de licencia de alternativas como las destilaciones de DeepSeek.
- Despliegue en entornos con presupuesto de hardware ajustado: al caber en una única GPU de 24 GB en bf16 (y en menos de 8 GB cuantizado a 4 bits), es viable para inferencia local en estaciones de trabajo de investigación o en nodos de borde con GPU.
- Evaluación comparativa de recetas de datos: dado que los autores publican el dataset y la receta, sirve como referencia reproducible para medir el efecto de cambios en la composición o el filtrado de datos de razonamiento, sin necesidad de recurrir a RL.
- Chat de razonamiento sobre documentos técnicos: combinando la ventana de contexto de 32.768 tokens heredada del modelo base con el modo de pensamiento, puede resumir o razonar sobre artículos y especificaciones largas, aunque la ventana efectiva tras el fine-tuning no está documentada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo, evaluados con la herramienta open source Evalchemy. La columna «Data» indica si el modelo se entrenó con datos abiertos. Los valores en negrita son los que quedan dentro de 2 errores estándar del mejor resultado de cada columna, según la propia model card.

| Modelo | Data | AIME24 | AIME25 | AMC23 | MATH500 | HMMT O2/25 | LCB 06/24-01/25 | CodeElo | CodeForces | GPQA-D | JEEBench |
|---|---|---|---|---|---|---|---|---|---|---|---|
| OpenThinker-7B | Sí | 30,7 | 22,0 | 72,5 | 82,8 | 15,7 | 26,1 | 11,1 | 14,9 | 38,6 | 45,3 |
| OpenThinker2-7B | Sí | 60,7 | 38,7 | 89,8 | 87,6 | 24,7 | 40,6 | 22,8 | 26,6 | 47,0 | 65,1 |
| OpenThinker3-7B | Sí | 69,0 | 53,3 | 93,5 | 90,0 | 42,7 | 51,7 | 31,0 | 32,2 | 53,7 | 72,4 |
| DeepSeek-R1-Distill-Qwen-32B | No | 51,3 | 38,0 | 92,0 | 88,0 | 25,0 | 34,5 | 19,9 | 21,1 | 33,2 | 50,4 |
| OpenR1-Distill-7B | Sí | 57,7 | 39,7 | 87,0 | 88,0 | 25,7 | 30,7 | 30,1 | 29,3 | 58,9 | 68,7 |
| Llama-3.1-Nemotron-Nano-8B-v1 | Sí | 62,0 | 48,0 | 94,0 | 89,4 | 26,7 | 50,9 | 30,9 | 32,9 | 52,9 | 70,7 |
| AceReason-Nemotron-7B | Sí | 71,0 | 50,7 | 93,8 | 89,8 | 33,3 | 44,3 | 32,9 | 30,9 | 52,9 | 64,3 |

El model-index del repositorio no incluye ninguna entrada de resultados; la tabla anterior procede del cuerpo de la model card. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos derivados del recuento de parámetros del modelo base, no cifras publicadas por el autor):
  - bf16 / fp16: en torno a 15,2 GB solo de pesos, más caché KV y activaciones; con contexto largo conviene reservar 20-22 GB.
  - int8 (bitsandbytes o GPTQ-8bit): en torno a 8 GB de pesos.
  - 4 bits (GPTQ, AWQ o GGUF Q4_K_M): en torno a 4,5-5,5 GB de pesos.
  - Caché KV orientativa con GQA (28 capas, 4 cabezas KV, dimensión 128): aproximadamente 56 KB por token, es decir, unos 1,8 GB para 32.768 tokens en fp16.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB para despliegues con lotes grandes y contexto completo; A10G, L40S o L4 para servicio con cuantización.
- Caben en GPU de consumo: sí. Una RTX 4090 o RTX 3090 de 24 GB ejecuta el modelo en bf16 con contexto moderado; tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) requieren cuantización de 8 o 4 bits; con 8 GB es necesario usar GGUF Q4 o inferior.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag explícito), vLLM y SGLang por compatibilidad con la arquitectura Qwen2, llama.cpp/Ollama y LM Studio previa conversión a GGUF, y llama-factory, el framework con el que se realizó el fine-tuning.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Datos abiertos | Rendimiento destacado |
|---|---|---|---|---|---|
| OpenThinker3-7B | 7,61B | No declarado (heredado de Qwen2.5: 32.768 nativos) | Apache 2.0 | Sí | AIME24 69,0 / AIME25 53,3 / MATH500 90,0 |
| DeepSeek-R1-Distill-Qwen-7B | 7,61B | No disponible en esta información | MIT (según su repositorio oficial) | No | Inferior a OpenThinker3-7B en las pruebas declaradas por el autor de este último |
| DeepSeek-R1-Distill-Qwen-32B | 32,8B | No disponible en esta información | MIT (según su repositorio oficial) | No | AIME24 51,3 / MATH500 88,0, superado por OpenThinker3-7B pese a cuadruplicar el tamaño |
| Llama-3.1-Nemotron-Nano-8B-v1 | 8B | No disponible en esta información | Llama 3.1 Community License | Sí | AMC23 94,0 / LCB 50,9, comparable en código y ligeramente superior en AMC23 |
| OpenR1-Distill-7B | 7,61B | No disponible en esta información | Apache 2.0 | Sí | GPQA-D 58,9, superior a OpenThinker3-7B en ciencia; inferior en matemáticas |
| AceReason-Nemotron-7B | 7,61B | No disponible en esta información | No disponible | Sí | AIME24 71,0, superior en esa prueba; inferior en JEEBench y HMMT |

La ventaja competitiva de OpenThinker3-7B es la combinación de datos completamente abiertos, licencia Apache 2.0 y un entrenamiento exclusivamente SFT, que iguala o supera a modelos destilados de mayor tamaño o con RL.

## Limitaciones y advertencias

- El modelo se entrena únicamente con SFT, sin RL ni verificación formal de soluciones; los errores en pasos intermedios del razonamiento no están penalizados durante el entrenamiento y pueden propagarse a la respuesta final.
- Riesgo de alucinación en matemáticas y código: los benchmarks se miden con respuestas finales extraídas automáticamente, lo que no garantiza corrección del razonamiento ni de la implementación generada.
- Riesgo de contaminación de benchmarks: los datos de entrenamiento se generan con QwQ-32B y podrían solaparse parcialmente con los conjuntos de evaluación empleados; no se documenta un análisis de contaminación en la información disponible.
- No hay declaración explícita de sesgos ni de evaluación de seguridad, toxicidad o robustez frente a prompts adversarios.
- La model card original no incluye una sección sustantiva de limitaciones más allá de la mención a la licencia Apache 2.0.
- No se documenta el rendimiento multilingüe tras el fine-tuning; el ajuste se centró en matemáticas, código y ciencia en inglés, por lo que es probable una degradación en otros idiomas respecto al modelo base, aunque no hay datos que lo cuantifiquen.
- Longitud de contexto efectiva no verificada: aunque el modelo base admite 32.768 tokens, no se indica si el fine-tuning preserva ese límite ni si el uso de YaRN sigue siendo válido.
- Compatibilidad con tool calling y uso agéntico no garantizada: el fine-tuning sobre trazas de razonamiento puede haber degradado el formato de llamada a funciones del modelo base.
- El repositorio analizado (`konizquants/OpenThinker3-7B`) es una reproducción de terceros con 0 descargas y 0 likes, con la model card copiada de la publicación oficial y sin verificación independiente; para uso en producción se recomienda obtener los pesos de `open-thoughts/OpenThinker3-7B`.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo hereda los términos de Qwen2.5 sobre los que se construye; conviene revisar la licencia del modelo base en caso de redistribución.

## Enlaces

- Repositorio de HuggingFace analizado: https://huggingface.co/konizquants/OpenThinker3-7B
- Modelo oficial: https://huggingface.co/open-thoughts/OpenThinker3-7B
- Dataset OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Paper OpenThoughts: https://arxiv.org/abs/2506.04178
- Blog post de OpenThinker3: https://www.open-thoughts.ai/blog/ot3
- Repositorio GitHub del proyecto: https://github.com/open-thoughts/open-thoughts
- Herramienta de evaluación Evalchemy: https://github.com/mlfoundations/Evalchemy
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- OpenThinker-7B (versión anterior): https://huggingface.co/open-thoughts/OpenThinker-7B
- OpenThinker2-7B: https://huggingface.co/open-thoughts/OpenThinker2-7B
- Modelos comparados: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B, https://huggingface.co/open-r1/OpenR1-Distill-7B, https://huggingface.co/nvidia/Llama-3.1-Nemotron-Nano-8B-v1, https://huggingface.co/nvidia/AceReason-Nemotron-7B

Nota sobre la búsqueda web: los resultados devueltos corresponden a páginas de Tradebyte y Tradebit (plataformas de comercio electrónico y de intercambio de criptomonedas) y no guardan relación con el modelo. No se ha identificado ningún recurso adicional relevante a través de esa búsqueda.
