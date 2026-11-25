# jeffrymahbuubi/Llama-3.2-3B-Alpaca-ID-SFT

## Resumen

Llama-3.2-3B-Alpaca-ID-SFT es un ajuste fino supervisado (SFT) del modelo base unsloth/Llama-3.2-3B, publicado por el usuario jeffrymahbuubi en Hugging Face. Se trata de un modelo de generación de texto de aproximadamente 3.212 millones de parámetros, entrenado con QLoRA sobre un dataset de instrucciones en indonesio (Ichsan2895/alpaca-gpt4-indonesian, formato Alpaca, licencia CC BY-SA 4.0). Los adaptadores LoRA se han fusionado en los pesos base en precisión de 16 bits, de modo que el modelo se puede cargar directamente con transformers o Unsloth.

El modelo resuelve un problema concreto: adaptar un transformer pequeño y de licencia permisiva (Llama 3.2 Community License) a tareas de instrucción y conversación en indonesio, con un coste de entrenamiento bajo (QLoRA de 4 bits, 1000 pasos, ventana de 1024 tokens). Su propósito declarado por el autor es servir como asistente de preguntas y respuestas en indonesio dentro de un sistema RAG sobre normativa legal, aunque el propio autor advierte que no sustituye el asesoramiento jurídico.

Su relevancia es acotada: es un modelo comunitario de nicho, con 90 descargas y sin resultados de benchmarks publicados. Resulta útil como ejemplo reproducible de pipeline de ajuste fino con Unsloth y TRL, y como base para prototipos de asistentes en indonesio en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino con QLoRA |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en el ejemplo de uso; 1024 tokens de longitud máxima durante el entrenamiento |
| Tipos de cuantizacion | 4 bits nf4 con doble cuantizacion para el entrenamiento; pesos publicados en 16 bits (merged_16bit); cuantizaciones GGUF no publicadas |
| Idiomas soportados | indonesio (id); el modelo base soporta oficialmente ingles, aleman, frances, hindi, italiano, portugues, espanol y tailandes |
| Licencia | Llama 3.2 Community License (incluye Acceptable Use Policy de Meta) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Llama-3.2-3B, una copia del checkpoint oficial meta-llama/Llama-3.2-3B, que es un transformer decoder-only con atención por grupos (GQA) y RoPE. Sobre esa base se aplicó QLoRA: el modelo base se cargó en 4 bits (nf4 con doble cuantización) y se entrenaron adaptadores LoRA de rango 16 y alpha 16, sin dropout, sobre siete módulos lineales (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj). Posteriormente los adaptadores se fusionaron en los pesos base en 16 bits.

El entrenamiento usó el dataset Ichsan2895/alpaca-gpt4-indonesian en formato Alpaca, con la columna input como mensaje de usuario y output como respuesta del asistente; se reservó un 1% de las filas como validación (semilla 3407). Hiperparámetros: learning rate 0,0002, scheduler lineal, weight decay 0,0, 1000 pasos, batch efectivo de 8 (batch 2 con acumulación de gradiente 4) y longitud máxima de 1024 tokens. Se seleccionó el experimento A de dos, por su validation loss sin señales de sobreajuste. La pérdida de entrenamiento final (media de los últimos 10 registros) fue 0,9956 y la de validación 0,9690. El stack fue Unsloth con TRL SFTTrainer (trl 0.22.2) y transformers 4.56.2, y la plantilla de chat aplicada es ChatML (`<|im_start|>` / `<|im_end|>`), con map_eos_token activado.

## Capacidades

- Generación de texto conversacional multi-turno en indonesio, con plantilla ChatML.
- Respuesta a instrucciones en formato Alpaca (pregunta-respuesta, explicaciones, listas).
- Razonamiento básico y respuesta a preguntas factuales, limitado por el tamaño del modelo y la calidad del dataset.
- Soporte de un mensaje de sistema para definir rol o contexto (útil en pipelines RAG).
- Capacidad multilingüe heredada del modelo base (inglés, español, francés, alemán, etc.), aunque el ajuste fino se ha hecho solo en indonesio.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, modo thinking, visión ni audio en este checkpoint.

## Casos de uso

- Asistente de preguntas y respuestas en indonesio sobre documentación: el modelo acepta un mensaje de sistema con contexto y responde en formato conversacional, lo que encaja en un pipeline RAG que recupere fragmentos y los inyecte en el prompt.
- Prototipado rápido de chatbots en indonesio: al cargarse con Unsloth en 4 bits y una ventana de 2048 tokens, permite iterar en una sola GPU de consumo antes de invertir en modelos mayores.
- Generación de respuestas de atención al cliente en indonesio para dominios acotados (FAQ, devoluciones, horarios), con revisión humana por el riesgo de alucinación.
- Normalización y reescritura de texto en indonesio: reformular instrucciones, resumir fragmentos o convertir notas en listas estructuradas.
- Generación de datos sintéticos de instrucción en indonesio para aumentar datasets de ajuste fino, dado su formato Alpaca de entrada/salida.
- Evaluación comparativa de pipelines de ajuste fino: sirve como referencia reproducible para medir el efecto de QLoRA, rango de LoRA y número de pasos en un modelo de 3B.
- Tareas educativas y de demostración: ejercicios de fine-tuning con Unsloth y TRL en cursos o tutoriales, por su bajo coste de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits (pesos publicados): aproximadamente 6,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 8 y 10 GB para secuencias cortas.
- VRAM estimada en 4 bits (carga con load_in_4bit=True): del orden de 2 a 3 GB para pesos, más overhead; cabe en GPUs de consumo con 8 GB o más.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para 16 bits y lotes mayores; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para 4 bits.
- Cabe en GPU de consumo: sí, especialmente en cuantización de 4 bits.
- Opciones de despliegue: transformers, Unsloth, text-generation-inference (el modelo declara endpoints_compatible); no se han publicado pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma del ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jeffrymahbuubi/Llama-3.2-3B-Alpaca-ID-SFT | 3.212 M | 2048 en uso; 1024 en entrenamiento | Indonesio | Llama 3.2 Community License | Hugging Face, 90 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3.212 M | 128 000 tokens (modelo base) | Multilingüe (8 idiomas oficiales) | Llama 3.2 Community License | Hugging Face, ampliamente distribuido |
| unsloth/Llama-3.2-3B | 3.212 M | 128 000 tokens (modelo base) | Multilingüe | Llama 3.2 Community License | Hugging Face, checkpoint base de este ajuste |

El ajuste sacrifica contexto (2048 tokens en el ejemplo frente a los 128 000 del modelo base) y cobertura multilingüe a cambio de especialización en instrucciones en indonesio. No hay datos de rendimiento comparativo publicados para este checkpoint.

## Limitaciones y advertencias

- Riesgo de alucinación: el autor advierte explícitamente que el modelo puede equivocarse o inventar, y que no sustituye asesoramiento jurídico.
- Sesgos heredados: el dataset de entrenamiento fue generado por otro modelo de lenguaje, por lo que puede arrastrar errores factuales y sesgos de esa fuente.
- Contexto limitado: ventana de 2048 tokens en el ejemplo de uso y 1024 durante el entrenamiento; secuencias más largas degradan la calidad.
- Especialización estrecha: el ajuste se hizo solo en indonesio; el rendimiento en otros idiomas depende del modelo base y no está validado.
- Licencia: sujeta a la Llama 3.2 Community License y a la Acceptable Use Policy de Meta; el uso comercial está permitido con las condiciones de esa licencia (incluida la obligación de atribución "Built with Llama").
- Dataset con licencia CC BY-SA 4.0: conviene revisar las implicaciones de share-alike sobre datos derivados si se redistribuyen.
- Tamaño pequeño (3B): capacidad limitada para razonamiento complejo, matemáticas y código en comparación con modelos de mayor escala.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad que respalde su uso en producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeffrymahbuubi/Llama-3.2-3B-Alpaca-ID-SFT
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/Ichsan2895/alpaca-gpt4-indonesian
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
