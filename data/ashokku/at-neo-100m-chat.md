# ashokku/at-neo-100m-chat

## Resumen

AT-Neo-100M-Chat es un modelo de lenguaje conversacional de 100,7 millones de parámetros entrenado desde cero por el desarrollador independiente ashokku. El modelo se preentrenó sobre 5.000 millones de tokens del corpus FineWeb-Edu y después se ajustó mediante fine-tuning supervisado (SFT) sobre el dataset smol-smoltalk de Hugging Face para dotarlo de capacidades de chat.

Su interés principal es educativo y de investigación: demuestra que es posible construir un chatbot funcional completo (preentrenamiento + SFT + tokenizador propio) con recursos limitados, sirviendo como referencia reproducible para quien quiera entender el pipeline completo de entrenamiento de un LLM. Utiliza una arquitectura estilo Llama moderna (RMSNorm, RoPE, SwiGLU, GQA) con una ventana de contexto de 1.024 tokens y un tokenizador byte-level BPE de 32.768 tokens.

No es un modelo orientado a producción: el propio autor advierte de que falla con frecuencia en hechos, matemáticas y razonamiento multi-paso, y que no ha recibido ajuste por preferencias (RLHF/DPO). Su valor está en la experimentación, la docencia y como base para seguir entrenando.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RMSNorm, RoPE, SwiGLU, GQA, embeddings atados) |
| Parametros totales | 100.682.496 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP; compatible con cuantizacion estandar via llama.cpp/GGUF si se convierte) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 12 capas, ancho de modelo (d_model) de 768 y MLP de 2.048 dimensiones con activacion SwiGLU. Emplea grouped-query attention con 12 cabezas de consulta y 4 cabezas de clave/valor, lo que reduce el tamano de la cache KV, y normalizacion RMSNorm pre-atencion con codificacion posicional RoPE. Los embeddings de entrada y salida estan atados (tied embeddings), una tecnica habitual en modelos pequenos que reduce el numero de parametros.

El preentrenamiento se realizo desde cero durante 9.537 pasos sobre 5.000 millones de tokens del subconjunto sample-10BT de FineWeb-Edu, alcanzando una perdida de validacion minima de 3,036. El tokenizador es un BPE a nivel de byte con vocabulario de 32.768 tokens, entrenado sobre los propios datos de preentrenamiento. Posteriormente se aplico un fine-tuning supervisado de 5.094 pasos (2 epocas) sobre HuggingFaceTB/smol-smoltalk con tasa de aprendizaje 0,0002, utilizando un formato de chat con tokens especiales `<|system|>`, `<|user|>`, `<|assistant|>` y `<|end|>`. No se ha aplicado ajuste por preferencias (RLHF ni DPO).

## Capacidades

- Generacion de texto conversacional en ingles siguiendo el formato de chat multi-turno (system, user, assistant)
- Respuesta a instrucciones simples gracias al SFT sobre smol-smoltalk
- Generacion de codigo basica y respuestas sobre temas generales, con fiabilidad limitada por su tamano
- Compatibilidad con `tokenizer.apply_chat_template` de la libreria transformers
- No soporta vision, audio ni modalidades distintas de texto
- No dispone de tool calling ni de capacidades de agente entrenadas
- No ha sido safety-tuned: no tiene alineacion por preferencias ni filtros de seguridad entrenados

## Casos de uso

- Ensenanza del pipeline de entrenamiento de LLMs: al ser un modelo completo pero pequeno, permite estudiar y modificar cada etapa (tokenizador, preentrenamiento, SFT) sin necesidad de grandes recursos
- Base para fine-tuning experimental: con 100M de parametros, se puede ajustar en una sola GPU de consumo para probar tecnicas como LoRA, DPO o destilacion
- Prototipado de formatos de chat: util para probar plantillas de conversacion, tokenizadores y logicas de decodificacion antes de escalar a modelos mayores
- Ejecucion en dispositivos muy limitados: su tamano de 0,2 GB lo hace viable en CPU, Raspberry Pi o moviles para demos offline de chat basico
- Investigacion sobre scaling laws: sirve como punto de comparacion de perdida de validacion y comportamiento emergente en la escala de 100M de parametros
- Generacion de texto sintetico para pruebas de infraestructura: ideal como modelo dummy barato para testear pipelines de inferencia, endpoints y benchmarks de latencia

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento publicado es la perdida de validacion de preentrenamiento: 3,036 sobre FineWeb-Edu.

## Requisitos de hardware

- VRAM para inferencia en FP16/FP32: menos de 0,5 GB (el repositorio completo ocupa 0,2 GB); cualquier GPU moderna o incluso CPU es suficiente
- En FP32 con optimizaciones de PyTorch, el consumo total ronda los 0,5-1 GB de RAM/VRAM
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso integradas; no se requiere aceleradora dedicada
- Despliegue posible con transformers (uso nativo), y convertible a GGUF para llama.cpp y Ollama; vLLM y TGI son viables aunque sobredimensionados para este tamano
- Latencia: no hay mediciones publicadas; en GPU moderna se esperan decenas de tokens por segundo incluso sin batch, y en CPU es perfectamente interactivo dado el tamano del modelo

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia |
|---|---|---|---|---|
| AT-Neo-100M-Chat | 100,7M | 1.024 tokens | FineWeb-Edu (5B tokens) + smol-smoltalk | Apache-2.0 |
| SmolLM2-135M-Instruct | 135M | 2.048 tokens | ~1,8-2T tokens (SmolLM-Corpus) + smoltalk | Apache-2.0 |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | ~18T tokens (multilingue) + SFT/RLHF | Apache-2.0 |
| TinyLlama-1.1B-Chat | 1.100M | 2.048 tokens | ~3T tokens + Zephyr SFT/DPO | Apache-2.0 |

AT-Neo-100M-Chat es notablemente mas pequeno y con mucho menos preentrenamiento (5B tokens frente a billones en las alternativas), por lo que su calidad de generacion es inferior a cualquiera de los modelos comparados. Su ventaja es el coste de entrenamiento y ejecucion minimos, y la trazabilidad completa del pipeline frente a modelos institucionales.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo se equivoca con frecuencia en hechos, matematicas y razonamiento multi-paso; no es fiable para respuestas factuales
- No ha recibido ajuste por preferencias ni safety-tuning: puede generar contenido inapropiado u ofensivo sin filtros
- Contexto muy corto (1.024 tokens): inadecuado para documentos largos o conversaciones extensas
- Solo ingles: no existe soporte entrenado para otros idiomas, incluido el castellano
- Riesgo alto de alucinacion, agravado por el tamano del modelo y el preentrenamiento limitado a 5B tokens
- No apto para produccion sin evaluacion adicional, segun la propia model card
- Riesgo de sesgos heredados de FineWeb-Edu (contenido web en ingles filtrado por calidad educativa), sin analisis de sesgo publicado

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ashokku/at-neo-100m-chat
- Dataset de preentrenamiento (FineWeb-Edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de fine-tuning (smol-smoltalk): https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
