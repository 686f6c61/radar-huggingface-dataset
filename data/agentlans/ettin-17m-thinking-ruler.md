# agentlans/ettin-17m-thinking-ruler

## Resumen

`ettin-17m-thinking-ruler` es un modelo encoder de 16,86 millones de parámetros desarrollado por el usuario independiente agentlans, concebido como un estimador de la longitud de razonamiento (chain-of-thought) que necesitará un modelo generativo para resolver un prompt dado. No genera texto ni responde preguntas: recibe un prompt como entrada y devuelve una puntuación continua de regresión, donde valores más altos indican una traza de pensamiento esperada más larga. Resuelve un problema de orquestación en sistemas con test-time compute: decidir cuánto presupuesto de razonamiento asignar a cada consulta antes de invocar al modelo grande.

El modelo parte del encoder `jhu-clsp/ettin-encoder-17m` (familia Ettin, basada en arquitectura ModernBERT) y se ajusta mediante fine-tuning supervisado sobre el dataset `agentlans/think-at-length`, compuesto por trazas largas de razonamiento recogidas de modelos frontera y de gama alta. La relevancia actual es práctica: en pipelines con thinking budget variable, un clasificador de 17M puede actuar como router barato que evite gastar tokens de razonamiento en preguntas triviales y los concentre en las difíciles.

Su tamaño reducido (repo de 0,1 GB, pesos safetensors) permite desplegarlo en CPU o en GPUs de consumo con latencia mínima, lo que lo hace viable como componente de preprocesado en producción. La licencia MIT y la compatibilidad con text-embeddings-inference y endpoints facilitan su integración. No obstante, el autor advierte que la salida es una señal relativa de dificultad, no un contador exacto de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `jhu-clsp/ettin-encoder-17m`) |
| Parametros totales | 16.863.489 (16,86 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos safetensors en bfloat16 durante entrenamiento; cuantizacion posterior no documentada) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de tipo ModernBERT con 16,86 M de parámetros, derivado del checkpoint `jhu-clsp/ettin-encoder-17m`. La cabeza de clasificación se sustituye por una salida de regresión escalar (`AutoModelForSequenceClassification` con un único logit), que se interpreta como puntuación de longitud de razonamiento. El entrenamiento se realizó sobre el dataset `agentlans/think-at-length`, formado por trazas largas de chain-of-thought generadas por modelos frontera y de gama alta, con el objetivo de aprender a predecir cuánto razonamiento requiere cada prompt.

Los hiperparámetros documentados son: learning rate 5e-5, batch size 8 (entrenamiento y evaluación), optimizador AdamW con `torch_fused` (beta_1 = 0,9, beta_2 = 0,999, epsilon = 1e-8), scheduler lineal, 3 épocas, precisión bfloat16, NEFTunes con alpha = 5 y semilla 42. El mejor MSE de validación se alcanzó en la época 2 (0,3825), con un ligero sobreajuste en la época 3 (0,3847). El framework utilizado fue Transformers 5.17.0, PyTorch 2.9.1+cu128, Datasets 4.4.1 y Tokenizers 0.23.2. No se documenta el número de tokens de entrenamiento ni la composición detallada del dataset más allá de su origen en trazas de razonamiento.

## Capacidades

- Predicción de longitud de razonamiento: dado un prompt en inglés, devuelve una puntuación continua que estima cuántos tokens de chain-of-thought necesitará un modelo generativo.
- Clasificación/regresión de texto: pipeline `text-classification` con salida escalar.
- Diferenciación de dificultad entre prompts: el autor muestra que preguntas triviales obtienen puntuaciones negativas (p. ej. -0,8227 para "What is the capital of Canada?") y preguntas complejas puntuaciones positivas (0,5654 para una demostración matemática con casos límite).
- Orquestación de thinking budget: sirve como router para asignar presupuesto de test-time compute.
- Inferencia muy ligera: 17M de parámetros, apto para CPU y GPUs de consumo.
- Compatibilidad con text-embeddings-inference y endpoints de Hugging Face.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un estimador de dificultad.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Enrutado de presupuesto de razonamiento: antes de invocar a un modelo grande con thinking mode, el pipeline consulta a este encoder para decidir si usar un presupuesto corto (prompt trivial) o largo (prompt complejo), reduciendo coste y latencia en consultas fáciles.
- Control de costes en APIs de LLM: en un servicio que factura por tokens de razonamiento, la puntuación permite fijar dinámicamente el límite de tokens de pensamiento por petición, evitando gasto innecesario en preguntas de baja dificultad.
- Priorización de colas de inferencia: en un sistema con múltiples solicitudes, las puntuaciones altas pueden enrutarse a workers con más capacidad o a modelos con razonamiento extendido, y las bajas a modelos rápidos sin CoT.
- Filtrado y curación de datasets: al construir un dataset de instrucciones, la puntuación permite etiquetar prompts por dificultad estimada y balancear la mezcla entre ejemplos simples y complejos.
- Evaluación de prompts en desarrollo: los equipos pueden medir de forma objetiva y barata la dificultad relativa de un conjunto de prompts antes de lanzar experimentos costosos con modelos frontera.
- Detección de consultas anómalamente complejas: en atención al cliente o soporte técnico, puntuaciones muy altas pueden activar escalado a un agente humano o a un modelo superior.
- Preprocesado en CPU a gran escala: al ser un modelo de 17M, puede procesar lotes de prompts en CPU dentro de pipelines de ingesta sin necesidad de GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), no verificados de forma independiente:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Reasoning Length Prediction (regresión) | agentlans/think-at-length | MSE | 0,3825 |

Evolución del entrenamiento reportada por el autor:

| Epoca | Step | Training Loss | Validation Loss | MSE |
|---|---|---|---|---|
| 1.0 | 12.500 | 0,3960 | 0,4078 | 0,4078 |
| 2.0 | 25.000 | 0,3509 | 0,3825 | 0,3825 |
| 3.0 | 37.500 | 0,2588 | 0,3847 | 0,3847 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,86 M de parámetros, aproximadamente 34 MB de pesos), y menos aún en cuantización de 8 o 4 bits.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona sobradamente en RTX 4090, A100, H100 y también en GPUs integradas.
- Cabe en cualquier GPU de consumo, incluida la gama baja (GTX 1050, RTX 3050), y en CPU.
- Opciones de despliegue: Transformers con PyTorch, text-embeddings-inference (tag `text-embeddings-inference`), endpoints de Hugging Face, y exportación a ONNX para inferencia en CPU.
- Latencia y throughput: no documentados; por el tamaño del modelo se espera latencia de milisegundos en CPU y throughput de miles de peticiones por segundo en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de estimación de longitud de razonamiento en la documentación proporcionada. Como referencia de la familia base:

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agentlans/ettin-17m-thinking-ruler | 16,86 M | Regresión de longitud de CoT | no disponible | MIT | Hugging Face |
| jhu-clsp/ettin-encoder-17m (base) | ~17 M | Encoder de propósito general | no disponible | MIT (según modelo base) | Hugging Face |
| Clasificadores de dificultad basados en LLM | miles de millones | Estimación de dificultad | variable | variable | no disponible |

La comparación con alternativas específicas de routing de razonamiento no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sensibilidad al modelo y al sampler: la longitud real de razonamiento depende del modelo generador objetivo, del system prompt, de la temperatura y de la configuración de stop/budget, por lo que la puntuación no es transferible directamente entre generadores.
- Señal relativa, no contador de tokens: la salida debe interpretarse como estimación relativa de dificultad; para obtener un recuento de tokens hay que ajustar una calibración específica sobre el modelo y el conjunto de evaluación propios.
- Solo inglés: el modelo está entrenado y evaluado únicamente en inglés; su uso en otros idiomas no está validado.
- Riesgo de sobreajuste al dataset: el autor reporta sobreajuste en la época 3, y el dataset de entrenamiento procede de trazas de modelos frontera, lo que puede introducir sesgo hacia ese estilo de razonamiento.
- No es un modelo generativo: no responde preguntas ni produce texto; usarlo fuera de su tarea de regresión dará resultados sin sentido.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base y el dataset pueden tener sus propias condiciones que conviene revisar.
- Sin datos de sesgo demográfico ni de robustez ante prompts adversariales.
- Alucinación: al ser un regresor, no genera contenido factual, pero puede producir puntuaciones erróneas en prompts fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentlans/ettin-17m-thinking-ruler
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Dataset de entrenamiento: https://huggingface.co/datasets/agentlans/think-at-length
- Informe de validación: https://huggingface.co/agentlans/ettin-17m-thinking-ruler/blob/main/report.md
