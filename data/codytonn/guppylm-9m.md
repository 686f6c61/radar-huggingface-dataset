# CodyTonn/guppylm-9M

## Resumen

GuppyLM es un modelo de lenguaje minúsculo de unos 9 millones de parámetros (8,7M exactos) entrenado desde cero para mantener conversaciones de una sola frase encarnando a un pez llamado Guppy. Fue desarrollado por CodyTonn a partir del proyecto original de arman-bd/guppylm, y su propósito principal no es competir en benchmarks, sino servir como proyecto educativo: demuestra que se puede entrenar, evaluar, exportar y empaquetar un transformer completo en un portátil Apple Silicon (M4 Pro) en unos 2 minutos, sin GPU en la nube.

El modelo es un transformer "vanilla" de 6 capas con vocabulario BPE de 4.096 tokens y una ventana de contexto de apenas 128 tokens. Se entrena sobre un dataset sintético de 57.000 conversaciones monologales (más 3.000 de evaluación) distribuidas en 60 temas, formateadas en ChatML. Incluye un export cuantizado a uint8 en ONNX de solo 10,5 MB, lo que lo hace ideal para inferencia en CPU y para experimentación en dispositivos muy limitados.

Su relevancia actual es didáctica: es un ejemplo completo y reproducible de pipeline de preentrenamiento desde cero (el notebook escribe sus propios ficheros fuente, descarga los datos, entrena y exporta), útil para quien quiere entender los fundamentos de los LLM sin coste de infraestructura. No es un modelo de propósito general ni está pensado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder vanilla (desde cero) |
| Parametros totales | 8,7M (~9M) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | fp32 (checkpoint PyTorch, 35 MB) y uint8 (export ONNX, 10,5 MB) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | model.bin (state dict PyTorch fp32) y model.onnx (ONNX uint8) |

## Arquitectura y entrenamiento

GuppyLM es un transformer decoder deliberadamente simple: 6 capas, dimensión oculta de 384, 6 cabezas de atención, FFN de 768 con activación ReLU, LayerNorm, embeddings de posición aprendidos y LM head empatado con los embeddings de entrada. El autor lo destaca explícitamente: no hay GQA, ni RoPE, ni SwiGLU; es la arquitectura más básica posible, lo que lo convierte en material de estudio ideal.

El entrenamiento usa el dataset arman-bd/guppylm-60k-generic: 57.000 conversaciones sintéticas de un solo turno para entrenamiento y 3.000 para evaluación, repartidas en 60 temas y formateadas en ChatML (`<|im_start|>role\n...<|im_end|>`). El optimizador es AdamW (β1=0,9, β2=0,95) con planificación coseno del learning rate, 200 pasos de warmup y weight decay de 0,1. El batch es de 32 secuencias de 128 tokens. Con la configuración por defecto del notebook (3.000 pasos) se alcanza un eval loss de 0,407; con `max_steps=10000` se consigue la calidad original del proyecto. Todo el proceso se ejecutó en un Apple M4 Pro vía MPS a unos 40 ms/paso, con un tiempo total de unos 2 minutos. No hay RLHF ni DPO: la personalidad del personaje está directamente "horneada" en los pesos, sin system prompt.

## Capacidades

- Generacion de texto conversacional en inglés con una personalidad fija (Guppy, un pez pequeño), coherente y con humor.
- Formato de chat ChatML, sin necesidad de system prompt.
- Respuestas de una sola frase/turno, entrenadas sobre 60 temas fijos.
- Inferencia en CPU mediante PyTorch puro o ONNX Runtime con el export cuantizado a uint8.
- Interfaz de inferencia tipo API (`GuppyInference.chat_completion`) que devuelve respuestas con estructura similar a OpenAI (`choices[0].message.content`).
- No soporta: razonamiento complejo, codigo, matematicas, vision, audio, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Enseñanza de fundamentos de LLM: al ser un transformer vanilla de 8,7M parámetros con todo el código fuente incluido en el repositorio, es ideal para recorrer paso a paso tokenización, atención, entrenamiento y decodificación sin abstracciones.
- Tutorial de entrenamiento en hardware de consumo: el notebook `train_guppylm_mac.ipynb` permite reproducir el entrenamiento completo en un MacBook con Apple Silicon en minutos, sin GPU externa.
- Experimentacion con decodificacion: el bucle de inferencia ONNX es lo bastante simple para probar estrategias de sampling (greedy, temperatura, top-k) y medir su efecto en un modelo pequeño.
- Despliegue en dispositivos con recursos muy limitados: el export ONNX uint8 de 10,5 MB permite ejecutar el modelo en CPU, microservicios mínimos o entornos edge.
- Base para fine-tuning educativo: el dataset y el formato ChatML documentados permiten que un estudiante entrene su propio personaje sustituyendo el dataset por conversaciones sintéticas propias.
- Demo o juguete conversacional: un chatbot con personalidad para prototipos de UI de chat, ya que el coste computacional es despreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento de entrenamiento publicado es un eval loss de 0,407 tras 3.000 pasos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: menos de 1 GB en cualquier caso; el modelo cuantizado ONNX ocupa 10,5 MB y el checkpoint fp32 35 MB, por lo que cabe con holgura en la RAM de cualquier ordenador moderno, incluidos portátiles y Raspberry Pi.
- GPU recomendadas: ninguna; la inferencia está diseñada para CPU. Para entrenamiento no se necesita GPU: el proyecto se entrenó en un Apple M4 Pro con MPS en unos 2 minutos (cualquier Apple Silicon reciente o GPU de consumo modesta sobra).
- Consumer GPU: no es necesario; se ejecuta cómodamente en CPU.
- Opciones de despliegue: PyTorch puro con el script `inference.py` incluido en el repo, ONNX Runtime con `model.onnx`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (el formato de pesos no es GGUF ni safetensors).
- Latencia y throughput: no disponibles; dado el tamaño (8,7M parámetros, contexto de 128 tokens), la latencia por token en CPU es de milisegundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GuppyLM | 8,7M | 128 tokens | MIT | Chatbot de personaje educativo, entrenado desde cero |
| TinyLlama 1.1B Chat | 1.100M | 2.048 tokens | Apache 2.0 | Chat generalista, preentrenado sobre 3 billones de tokens |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | Apache 2.0 (Qwen Research) / comercial | Chat generalista multilingüe con tool calling |
| SmolLM2-135M-Instruct | 135M | 8.192 tokens | Apache 2.0 | Chat generalista ligero de Hugging Face |

GuppyLM es entre 15 y 125 veces más pequeño que estas alternativas y no compite con ellas en capacidad: su valor está en la simplicidad, la reproducibilidad del entrenamiento y el tamaño del artefacto final, no en rendimiento. Para chat útil en producción, cualquiera de las alternativas anteriores es más adecuada.

## Limitaciones y advertencias

- Solo un turno: el modelo fue entrenado exclusivamente con intercambios de un mensaje, por lo que no mantiene conversaciones multi-turno coherentes.
- Ventana de contexto de solo 128 tokens, insuficiente para cualquier tarea real de procesamiento de texto.
- Limitado al inglés y a 60 temas fijos de conversación; cualquier entrada fuera del ámbito de la vida de un pez produce resultados incoherentes.
- Sin RLHF ni DPO: no hay alineación de seguridad, por lo que no debe exponerse a usuarios finales sin filtros.
- Riesgo alto de alucinación y repetición, inherente a un modelo de 8,7M parámetros entrenado con datos sintéticos de dominio cerrado.
- La licencia MIT no impone restricciones de uso comercial, pero el modelo en sí es un juguete educativo, no un chatbot de producción, como advierte el propio autor.
- Sesgos: no se ha documentado ningún análisis de sesgos; al tratarse de datos sintéticos de un solo autor/proyecto, el sesgo del dataset es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CodyTonn/guppylm-9M
- Repositorio GitHub del proyecto original: https://github.com/arman-bd/guppylm
- Dataset de entrenamiento: https://huggingface.co/datasets/arman-bd/guppylm-60k-generic
