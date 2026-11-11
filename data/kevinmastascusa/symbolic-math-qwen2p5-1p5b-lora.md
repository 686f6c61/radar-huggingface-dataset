# Kevinmastascusa/symbolic-math-qwen2p5-1p5b-lora

## Resumen

symbolic-math-qwen2p5-1p5b-lora es un adaptador LoRA (r=8) desarrollado por el usuario Kevinmastascusa sobre el modelo base Qwen/Qwen2.5-Math-1.5B, un transformer causal de 1.500 millones de parametros especializado en razonamiento matematico. El adaptador se ha entrenado para resolver problemas matematicos verbales (math word problems), algebra sencilla y razonamiento numerico, y esta pensado para adjuntarse al modelo base mediante la libreria PEFT en lugar de usarse como modelo autonomo.

El modelo aborda un problema concreto: ajustar un modelo matematico pequeno y de codigo abierto a un formato de respuesta breve y determinista orientado a la extraccion del resultado final. El entrenamiento emplea QLoRA sobre el modelo base cuantizado en 4 bits NF4, con un conjunto de datos reducido de 640 ejemplos procedentes de GSM8K, MathQA, SVAMP y MATH-500. El autor publica tambien una version fusionada (merged) que puede cargarse sin PEFT.

Su relevancia actual es limitada pero acotada: se trata de un experimento de ajuste fino reproducible (el autor publica codigo de entrenamiento, fusion y evaluacion) sobre una base solida como Qwen2.5-Math-1.5B, con licencia Apache 2.0 y un tamano que cabe en GPU de consumo. No obstante, las cifras de evaluacion publicadas son modestas y el propio autor advierte de que no existe una linea base del modelo original bajo el mismo evaluador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer causal decoder-only Qwen2.5-Math-1.5B |
| Parametros totales | 1.500 millones (modelo base); el adaptador LoRA anade un subconjunto reducido no cuantificado en la ficha |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max_length 256) |
| Tipos de cuantizacion | Entrenamiento con QLoRA en 4-bit NF4 con doble cuantizacion; el adaptador se distribuye en safetensors (precision del adaptador no especificada) |
| Idiomas soportados | Ingles (razonamiento matematico) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT); version fusionada disponible como modelo HF estandar |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Math-1.5B, un transformer causal decoder-only de la familia Qwen2.5. El ajuste se realiza con LoRA de rango 8 y alpha 16, dropout 0.05, sobre las proyecciones q, k, v, o, gate, up y down. El entrenamiento sigue un esquema QLoRA: el modelo base se cuantiza en 4 bits NF4 con doble cuantizacion, se activa gradient checkpointing y se usa precision mixta. El schedule comprende 2 epocas (320 pasos de optimizador), batch size 1 con 4 pasos de acumulacion de gradiente, learning rate pico de 5e-5 con 50 pasos de warmup y decaimiento lineal, weight decay 0.01 y longitud maxima de 256 tokens.

El conjunto de datos es pequeno: hasta 200 ejemplos de cada uno de GSM8K, MathQA, SVAMP y MATH-500, divididos 80/20 en 640 ejemplos de entrenamiento y 160 de validacion. Se conserva el checkpoint con menor perdida de validacion, en el paso 200 (loss 0.727, perplejidad 2.07), que es el adaptador publicado en la raiz del repositorio. No se menciona uso de RLHF, DPO ni decodificacion especulativa; el autor recomienda decodificacion determinista (greedy) para la extraccion de respuestas.

## Capacidades

- Generacion de texto orientada a la resolucion de problemas matematicos verbales y algebra sencilla.
- Razonamiento numerico basico con salida de respuesta final en formato numerico.
- Ajuste fino adicional sobre datos de curriculo o dominios matematicos especificos (uso downstream declarado).
- Capacidad multilingue limitada al ingles segun la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido (thinking mode).
- No se documenta soporte de generacion de pruebas formales; de hecho, se declara fuera de alcance.

## Casos de uso

- Resolucion automatizada de problemas matematicos verbales en ingles: el adaptador, adjunto al modelo base, genera una respuesta breve con el resultado numerico final, adecuada para pipelines de correccion automatica de ejercicios.
- Extraccion de respuestas numericas en entornos educativos: con decodificacion greedy y post-procesado del ultimo numero de la salida, puede integrarse en plataformas de practica de matematicas para validar respuestas de alumnos.
- Generacion de datos sinteticos de razonamiento matematico: al estar ajustado sobre GSM8K, SVAMP y MATH-500, puede producir borradores de soluciones numericas para aumentar datasets de entrenamiento, siempre con revision humana.
- Fine-tuning adicional para dominios especificos: el adaptador sirve como punto de partida (curriculum) para ajustar tareas matematicas concretas, gracias a su bajo coste computacional (LoRA r=8 sobre base de 1.5B).
- Prototipado e investigacion reproducible: el autor publica codigo de entrenamiento, fusion y evaluacion, lo que permite reproducir el pipeline QLoRA y comparar variantes en un entorno controlado.
- Despliegue en hardware de consumo para demos interactivas: el modelo base de 1.5B en 4 bits cabe en GPU consumer, lo que permite montar demos locales de resolucion de problemas sin infraestructura dedicada.
- Evaluacion comparativa de tecnicas de ajuste: util como caso de estudio de LoRA de bajo rango sobre modelos matematicos pequenos, con metricas de exact match documentadas.

## Benchmarks y rendimiento

Resultados publicados por el autor, con decodificacion greedy, hasta 64 tokens nuevos y evaluador que compara el ultimo numero de la salida con el ultimo numero de la respuesta dorada:

| Conjunto de test | Problemas | Correctos | Exact match |
|---|---|---|---|
| SVAMP | 200 | 125 | 62,5% |
| GSM8K | 200 | 65 | 32,5% |
| MATH-500 | 100 | 16 | 16,0% |
| Tres conjuntos puntuados | 500 | 206 | 41,2% |
| MathQA | 200 | 0 | no puntuado (respuestas doradas son letras a-e) |
| Total con MathQA forzado a cero | 700 | no disponible | 29,4% |

El autor advierte de que no existe una linea base del modelo original bajo el mismo evaluador, por lo que estas cifras indican el estado del modelo, no la mejora aportada por el ajuste fino. MathQA no es una puntuacion real porque su evaluador no es compatible con respuestas de opcion multiple.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.5B en 4 bits ocupa aproximadamente 1-2 GB de pesos; en FP16, alrededor de 3 GB. El adaptador LoRA anade una cantidad marginal. La VRAM total depende del contexto y del framework.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para FP16 con contexto corto; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para el modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 6 GB o mas en cuantizacion de 4 bits.
- Opciones de despliegue: transformers con PEFT (metodo documentado por el autor), llama.cpp u Ollama para la version fusionada en GGUF (previa conversion), vLLM o TGI para la version fusionada. El adaptador requiere cargar el modelo base y adjuntarlo con PeftModel.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento uso max_length 256 y la evaluacion 64 tokens nuevos, lo que sugiere contextos cortos y generaciones breves.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| symbolic-math-qwen2p5-1p5b-lora (este) | 1.5B (base) + LoRA | no disponible | Math word problems, adaptador LoRA | Apache 2.0 | Hugging Face (adaptador y version fusionada) |
| Qwen/Qwen2.5-Math-1.5B (base) | 1.5B | no disponible en la informacion | Modelo matematico general | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-7B | 7B | no disponible en la informacion | Modelo matematico de mayor escala | Apache 2.0 | Hugging Face |
| Modelos matematicos de 1-2B alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos bajo el mismo evaluador en la informacion proporcionada; el propio autor senala la ausencia de linea base del modelo original.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy pequeno (640 ejemplos) y conjuntos de test reducidos (100 a 200 problemas), lo que limita la significancia estadistica de los resultados.
- No hay linea base del modelo base bajo el mismo evaluador, por lo que no se puede atribuir la mejora al ajuste fino.
- El evaluador compara el ultimo numero de la salida con el ultimo numero de la respuesta dorada; el formato de la respuesta final afecta directamente a la puntuacion.
- MathQA no se puntua correctamente porque sus respuestas doradas son letras de opcion multiple, no numeros.
- Problemas matematicos ambiguos pueden producir lapsos de razonamiento o inconsistencias de formato.
- No es robusto frente a prompts adversariales ni frente a tareas no matematicas.
- Posibles sesgos heredados de los datasets de origen (GSM8K, MathQA, SVAMP, MATH-500).
- Solo soporta ingles; no se documenta capacidad multilingue.
- Uso fuera de alcance declarado: toma de decisiones criticas para seguridad, razonamiento factual fuera de matematicas y generacion de pruebas formales.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y advertencias del modelo base Qwen2.5-Math-1.5B.
- El adaptador requiere cargar el modelo base; pueden aparecer errores de desajuste de vocabulario que exigen redimensionar los embeddings del modelo base.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/Kevinmastascusa/symbolic-math-qwen2p5-1p5b-lora
- Version fusionada: https://huggingface.co/Kevinmastascusa/qwen2p5-math-1p5b-merged
- Repositorio de codigo (entrenamiento, fusion y evaluacion): https://github.com/kevinmastascusa/symbolic-math-ai
- Modelo base Qwen2.5-Math-1.5B: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Paper de referencia Qwen2.5-Math: https://arxiv.org/abs/2409.12122
- Libreria PEFT: https://github.com/huggingface/peft
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MathQA: https://huggingface.co/datasets/allenai/math_qa
- Dataset SVAMP: https://huggingface.co/datasets/ChilleD/SVAMP
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
