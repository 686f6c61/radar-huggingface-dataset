# Indexnusrefather/gemma-3-4b-it-roleplay-tuned-v2

## Resumen

Indexnusrefather/gemma-3-4b-it-roleplay-tuned-v2 es un fine-tune del modelo Gemma 3 4B IT de Google, desarrollado por el usuario Indexnusrefather con el objetivo de mejorar la calidad de escritura creativa y roleplay respecto al modelo base. El autor lo presenta como la segunda iteración de su trabajo, entrenado con 17 millones de tokens de datos únicos, lo que según su evaluación acerca el rendimiento de escritura al de modelos de 8B e incluso 12B en ciertos casos.

El modelo está pensado para tareas de generación de ficción, roleplay y escritura creativa, donde el autor afirma que reduce el "slop" (texto genérico y predecible) y mejora la creatividad y el seguimiento de la trama. Con 4.300 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, y se distribuye tanto en formato safetensors como en cuantizaciones GGUF. La licencia es Gemma, la misma que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, fine-tune LoRA) |
| Parametros totales | 4.300.079.472 (4,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K (contexto del modelo base; no se especifica si el fine-tune lo modifica) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (el fine-tune esta entrenado solo en ingles; el base soporta 140+ idiomas) |
| Licencia | Gemma (terminos de licencia de Google) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-4b-it, un transformer denso multimodal de 4B parametros con ventana de contexto de 128K tokens. El fine-tune se realizo mediante LoRA (Low-Rank Adaptation), segun los tags del repositorio, sobre un dataset de 17 millones de tokens de datos unicos de roleplay y escritura creativa. El autor no detalla la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; la informacion disponible solo indica que el entrenamiento busco potenciar la creatividad y la calidad narrativa, a costa de sacrificar parte de la capacidad logica del modelo base.

No se mencionan innovaciones tecnicas adicionales en la arquitectura; se trata de un ajuste fino clasico sobre el modelo base, sin cambios en la estructura interna. El autor indica que el modelo mantiene un buen seguimiento de la historia y una mejor comprension de temas emocionales complejos, pero reconoce que la logica del modelo 4B es limitada y que el fine-tune fuerza toda esa capacidad hacia la escritura creativa.

## Capacidades

- Generacion de texto creativo y narrativo de alta calidad, con menos "slop" (texto generico) que el modelo base.
- Roleplay multi-turno con seguimiento coherente de la trama y los personajes.
- Escritura de ficcion, dialogos y descripciones con mayor riqueza expresiva.
- Comprension de temas emocionales complejos y matices psicologicos en los personajes.
- Capacidades del modelo base Gemma 3: procesamiento multimodal (texto e imagenes), aunque el fine-tune no documenta uso de vision.
- Soporte de tool calling y function calling heredado del modelo base, aunque no se ha validado especificamente en este fine-tune.
- Multilingue en el modelo base, pero el fine-tune esta entrenado exclusivamente en ingles.

## Casos de uso

- Roleplay interactivo en aplicaciones de chat: el modelo puede mantener conversaciones de ficcion multi-turno con coherencia narrativa, gracias a su entrenamiento especifico y a la ventana de contexto de 128K tokens que permite recordar tramas largas.
- Generacion de ficcion y cuentos: escritores y aficionados pueden usarlo para generar borradores de relatos, dialogos y descripciones con un estilo menos formulaico que el del modelo base.
- Creacion de personajes para juegos de rol: el modelo puede generar fichas de personaje, historias de fondo y dialogos consistentes con la personalidad definida.
- Asistente de escritura creativa: integrado en herramientas de edicion, puede sugerir continuaciones, reescribir pasajes o explorar alternativas narrativas.
- Simulacion de conversaciones para guionistas: util para generar interacciones entre personajes en fases de preproduccion de guiones o novelas.
- Chatbots de entretenimiento con personalidad: desplegado en servidores locales o en la nube, puede alimentar bots de roleplay en plataformas como Discord o Twitch, gracias a su tamano reducido y baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas cuantitativas (MMLU, HumanEval, GSM8K, etc.) ni comparaciones formales con otros modelos. La unica evaluacion mencionada es cualitativa: el autor afirma que la calidad de escritura se acerca a la de modelos de 8B y 12B, pero no aporta datos medibles.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M (~2,5-3 GB), Q5_K_M (~3,5 GB), Q6_K (~4 GB), Q8_0 (~4,5 GB) y BF16 (~8,6 GB).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para cuantizaciones bajas (RTX 3060, RTX 4060, RX 6600); para BF16 se recomienda 8-12 GB (RTX 3080, RTX 4070, A10).
- Cabe en GPUs consumer de gama media y baja, e incluso en sistemas con 6 GB de VRAM usando Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI (Text Generation Inference) y cualquier framework compatible con GGUF o safetensors.
- Latencia y throughput: no se han publicado mediciones especificas; en una RTX 4090 se puede esperar una generacion de 50-100 tokens/s con cuantizacion Q4, aunque depende de la implementacion y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| gemma-3-4b-it-roleplay-tuned-v2 | 4,3B | 128K | Roleplay y escritura creativa | Gemma |
| google/gemma-3-4b-it (base) | 4,3B | 128K | Multimodal generalista | Gemma |
| Mistral 7B Instruct v0.3 | 7,3B | 32K | Instrucciones generales | Apache 2.0 |
| Llama 3.1 8B Instruct | 8,0B | 128K | Instrucciones generales | Llama 3.1 |

El modelo se diferencia del base por su especializacion en escritura creativa, pero pierde parte de la capacidad logica y de razonamiento general. Frente a alternativas de mayor tamano como Mistral 7B o Llama 3.1 8B, ofrece menor capacidad bruta pero un rendimiento de escritura creativa que el autor considera superior para su tamano, ademas de un menor consumo de recursos. No se dispone de benchmarks comparativos para validar estas afirmaciones.

## Limitaciones y advertencias

- Logica limitada: el autor advierte que el modelo de 4B tiene capacidades de razonamiento reducidas, y que el fine-tune sacrifica parte de esa logica en favor de la creatividad. No es adecuado para tareas que requieran razonamiento estricto, matematicas o codigo.
- Sesgos del modelo base: al derivar de Gemma 3, puede heredar sesgos presentes en los datos de entrenamiento originales de Google.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos, nombres o eventos, especialmente en contextos de roleplay donde la ficcion es la norma.
- Idioma: el fine-tune esta entrenado solo en ingles; su rendimiento en otros idiomas no esta garantizado y probablemente sea inferior al del modelo base.
- Licencia Gemma: los terminos de Google para Gemma incluyen restricciones de uso comercial y requisitos de atribucion. Es necesario revisar la politica de uso aceptable antes de desplegar el modelo en produccion.
- Sin garantias de calidad: el autor lo califica como "experimental" y no proporciona evaluaciones formales. El rendimiento en escenarios reales puede variar.
- Contexto largo no validado: aunque el base soporta 128K tokens, no hay evidencia de que el fine-tune mantenga la coherencia en ventanas muy largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Indexnusrefather/gemma-3-4b-it-roleplay-tuned-v2
- Version anterior (v1): https://huggingface.co/Indexnusrefather/gemma-3-4b-it-roleplay-tuned-v1
- Nueva version anunciada: https://huggingface.co/Indexnusrefather/Super-Slop-Machina-XXL-v0.1-4B
- Pagina de Gemma 3 de Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Pagina de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Modelo base en Ollama: https://ollama.com/library/gemma3:4b
