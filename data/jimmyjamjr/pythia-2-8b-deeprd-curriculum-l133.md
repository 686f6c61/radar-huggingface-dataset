# JimmyJamJr/pythia-2.8b-deeprd-curriculum-L133

## Resumen

Pythia-2.8b-deeprd-curriculum-L133 es un ajuste fino completo del modelo base EleutherAI/pythia-2.8b, publicado por el usuario JimmyJamJr en Hugging Face. No se trata de un modelo de propósito general, sino de un experimento de investigación centrado en el entrenamiento con currículum sobre una tarea muy específica: la predicción del siguiente paso en pruebas deductivas sintéticas generadas por una versión modificada del generador DeepRD. El modelo no está instruido ni alineado; es un modelo base sometido a un proceso de fine-tuning supervisado con un currículum de dificultad creciente.

El interés del modelo es metodológico. El autor documenta un procedimiento de entrenamiento por etapas en el que la longitud de "lookahead" (el número de pasos de búsqueda en anchura necesarios para distinguir el siguiente paso correcto del distractor) crece progresivamente, junto con un vocabulario de atributos ficticios que también se expande. El checkpoint publicado corresponde a la etapa L = 133, alcanzada tras 60.025 pasos de entrenamiento. Con 2.775.208.960 parámetros reales según los pesos en safetensors y una arquitectura GPT-NeoX, el modelo hereda la ventana de contexto y las limitaciones del Pythia-2.8B original.

La relevancia actual es limitada fuera del ámbito de la investigación en razonamiento deductivo y currículos de entrenamiento. No hay métricas de benchmarks publicadas, ni descargas, ni licencia declarada, y el modelo no está pensado para uso en producción ni para tareas conversacionales. Su valor reside en servir como artefacto reproducible para estudiar cómo el entrenamiento con currículum afecta a la capacidad de razonamiento multi-paso en modelos de lenguaje pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 2.775.208.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del base Pythia-2.8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre texto sintético en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de EleutherAI/pythia-2.8b, un transformer decoder-only de la familia GPT-NeoX con 2.775 millones de parámetros. El ajuste fino es completo (no LoRA ni adaptadores), con AdamW, learning rate constante de 2.7e-5 y precisión bf16. La semilla empleada es 1234. El entrenamiento se realizó sobre prompts de texto plano, sin formato de instrucciones ni plantillas de chat.

La innovación principal es el currículum de lookahead y vocabulario de atributos. En la etapa k, el modelo entrena con problemas cuyo lookahead se muestrea uniformemente en el rango 1..L_k, donde L_k = k × s y s = 1 es el tamaño de paso. El vocabulario de atributos ficticios también crece hasta 2(L_k + 1) etiquetas. El modelo avanza a la siguiente etapa cuando su precisión reciente de exact-match en entrenamiento supera un umbral. El checkpoint publicado se guardó al completar la etapa L = 133, en el paso 60.025. La tarea es la predicción del siguiente atributo en una prueba deductiva válida, generada por un generador DeepRD modificado que produce reglas sobre nombres de atributos ficticios, un hecho inicial, un objetivo y un prefijo de prueba.

## Capacidades

- Predicción del siguiente paso en pruebas deductivas sintéticas: dado un conjunto de reglas, un hecho inicial, un objetivo y un prefijo de prueba, el modelo genera el siguiente atributo válido.
- Razonamiento deductivo multi-paso sobre dominios artificiales con nombres de atributos ficticios.
- Generación de texto autoregresiva estándar heredada del base Pythia-2.8B.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso en dominios abiertos más allá de la tarea sintética para la que fue ajustado.
- Capacidades multilingües no documentadas; el entrenamiento se realizó sobre texto sintético en inglés.
- No dispone de modo thinking, visión ni audio.
- No es un modelo instruido: no sigue instrucciones conversacionales de forma fiable.

## Casos de uso

- Investigación en currículos de entrenamiento: el modelo sirve como artefacto reproducible para estudiar cómo la progresión de dificultad (lookahead creciente) afecta a la capacidad de razonamiento deductivo en modelos pequeños. Se compararía con checkpoints de etapas anteriores del mismo currículum.
- Estudio de generalización en dominios sintéticos: permite analizar si el modelo resuelve problemas con atributos ficticios no vistos durante etapas tempranas, evaluando la transferencia dentro del mismo generador DeepRD.
- Análisis de razonamiento multi-paso: útil para medir la degradación de precisión a medida que aumenta el lookahead de los problemas, con decodificación greedy y comparación exact-match del primer token del atributo.
- Reproducción de experimentos de fine-tuning completo: dado que el autor documenta hiperparámetros (AdamW, lr 2.7e-5, bf16, semilla 1234, paso 60.025), sirve como referencia para replicar el pipeline sobre Pythia-2.8B.
- Evaluación de estrategias de decodificación: el modelo permite comparar decodificación greedy frente a otras estrategias en tareas de predicción de siguiente paso con distractores.
- Docencia en razonamiento automático: como ejemplo práctico de integración entre generadores de problemas deductivos sintéticos y modelos de lenguaje, útil en cursos de IA o lógica computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 5,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 7 y 9 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 3 GB para pesos; en 4 bits, alrededor de 1,5-2 GB (las cuantizaciones no están documentadas por el autor, pero son aplicables mediante herramientas estándar).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción o evaluación a gran escala; RTX 4090, RTX 3090 o RTX A6000 para investigación en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 4080 y GPUs con 8 GB o más en cuantización de 8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), vLLM, llama.cpp y Ollama mediante conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JimmyJamJr/pythia-2.8b-deeprd-curriculum-L133 | 2.775 M | no disponible | Predicción de siguiente paso en pruebas deductivas sintéticas | no disponible | Hugging Face, 0 descargas |
| EleutherAI/pythia-2.8b | 2.775 M | 2048 tokens (modelo base) | Modelo base de propósito general | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado |
| EleutherAI/pythia-1.4b | 1.414 M | 2048 tokens (modelo base) | Modelo base de propósito general | Apache 2.0 (modelo base) | Hugging Face |
| Meta Llama 3.2 3B Instruct | 3.210 M | 128.000 tokens | Modelo instruido de propósito general | Llama 3.2 Community License | Hugging Face, ampliamente usado |

La comparación directa con modelos de propósito general no es equitativa: este checkpoint está especializado en una tarea sintética y no compite en benchmarks estándar. Frente a su modelo base, la diferencia es el ajuste fino con currículum; frente a modelos instruidos como Llama 3.2 3B, carece de alineación, contexto largo documentado y soporte conversacional.

## Limitaciones y advertencias

- No es un modelo instruido ni alineado: no debe usarse para conversación, atención al cliente ni tareas de instrucciones sin un ajuste adicional.
- Entrenado exclusivamente sobre problemas sintéticos de un generador DeepRD modificado; la generalización fuera de ese dominio es altamente incierta.
- Riesgo de alucinación elevado en cualquier tarea fuera de la distribución de entrenamiento, dado que el modelo base Pythia no está alineado.
- Sesgos conocidos: no documentados por el autor; el modelo base Pythia presenta sesgos de género, raza y religión documentados en la literatura, que este fine-tuning no corrige.
- Limitaciones de contexto e idioma: la longitud de contexto no se documenta en la model card; el entrenamiento usa texto sintético en inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor o asumir la licencia del modelo base (Apache 2.0) con cautela, ya que el autor no la declara explícitamente.
- Sin descargas ni validación comunitaria: el checkpoint tiene 0 descargas y 0 likes, por lo que no ha sido evaluado de forma independiente.
- El vocabulario de atributos ficticios está acoplado al currículum; el modelo puede fallar con nombres de atributos fuera de ese vocabulario.
- No apto para producción sin evaluación exhaustiva en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JimmyJamJr/pythia-2.8b-deeprd-curriculum-L133
- Modelo base: https://huggingface.co/EleutherAI/pythia-2.8b
- Repositorio Pythia (EleutherAI): https://github.com/EleutherAI/pythia
- Paper de Pythia: https://arxiv.org/abs/2304.01373
- Generador DeepRD: no disponible en la información proporcionada
