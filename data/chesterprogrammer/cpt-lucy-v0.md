# ChesterProgrammer/CPT-Lucy-V0

## Resumen

CPT-Lucy-V0 es un modelo de lenguaje de 9.400 millones de parámetros desarrollado por ChesterProgrammer mediante continued pretraining sobre el modelo base DreamFast/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark. El entrenamiento se realizó con la librería Unsloth y Hugging Face TRL, utilizando LoRA con rango 32 y alpha 64. El modelo está orientado a conversación y generación de texto en inglés, con licencia Apache 2.0 que permite uso comercial sin restricciones.

La relevancia de este modelo radica en su enfoque "uncensored" (sin censura), que lo hace atractivo para casos de uso donde se requiere libertad de expresión, aunque también implica riesgos de contenido inapropiado. El contexto de 2048 tokens es limitado en comparación con otros modelos actuales. No se han publicado benchmarks oficiales, por lo que su rendimiento real es desconocido. El pipeline declarado en Hugging Face es image-text-to-text, pero no se han documentado capacidades multimodales en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen 3.5, detalles no publicados) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantizaciones no publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen 3.5, presumiblemente un transformer denso con atención completa, aunque no se han publicado detalles técnicos específicos. El entrenamiento consistió en continued pretraining (preentrenamiento continuado) sobre el modelo base DreamFast/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark, utilizando LoRA con rango 32, alpha 64 y dropout 0.0 (variante RS-LoRA). Se empleó el optimizador AdamW de 8 bits con learning rate 5e-5 y embedding learning rate 5e-6, scheduler de coseno, 3 épocas, batch size 4 con gradiente acumulado de 2, y empaquetado de secuencias (packing) activado. El dataset utilizado se denomina "Corpus-Lucy", aunque no se especifica su composición ni tamaño.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El entrenamiento se realizó con Unsloth, que acelera el fine-tuning en GPUs consumer.

## Capacidades

- Generación de texto libre y conversación multi-turno en inglés.
- Razonamiento básico y respuesta a instrucciones (sin datos de evaluación).
- Capacidades de chat sin censura, dado el modelo base "uncensored".
- No se documenta soporte para tool calling, function calling ni agentes.
- No se documentan capacidades multimodales, a pesar del pipeline image-text-to-text declarado.
- Contexto limitado a 2048 tokens, lo que restringe tareas de memoria larga.

## Casos de uso

- Chatbots sin restricciones de contenido: el modelo puede generar respuestas en dominios donde otros modelos censuran ciertos temas, como debates filosóficos o creatividad extrema. Su licencia Apache 2.0 permite integrarlo en productos comerciales.
- Generación de ficción y escritura creativa: su capacidad para producir texto libre y sin filtros lo hace útil para prototipos de narrativa, diálogos de personajes o guiones.
- Exploración de técnicas de fine-tuning: al ser un modelo pequeño (9B) y con entrenamiento documentado, sirve como base para experimentos de continued pretraining con LoRA en entornos académicos.
- Asistentes de conversación para comunidades específicas: por ejemplo, foros o aplicaciones donde se requiere un tono desinhibido, siempre que se cumplan las políticas de uso.
- Pruebas de alineación y seguridad: su naturaleza "uncensored" permite estudiar sesgos y comportamientos no filtrados en modelos de lenguaje.
- Desarrollo de prototipos de generación de texto en inglés con requisitos de hardware moderados: al caber en GPUs consumer con cuantización, es accesible para desarrolladores individuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El rendimiento real del modelo es desconocido y no se puede comparar cuantitativamente con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~18,8 GB (9,4B parámetros × 2 bytes). Cabe en GPUs como RTX 4090 (24 GB) o A100 (40/80 GB).
- VRAM estimada en cuantización INT8: ~9,4 GB. Cabe en RTX 3080/3090 (10-24 GB) o RTX 4070 (12 GB).
- VRAM estimada en cuantización INT4: ~4,7 GB. Cabe en GPUs consumer de 8 GB como RTX 3060 o RTX 4060.
- No se proporcionan cuantizaciones oficiales, pero se pueden generar con herramientas como llama.cpp o AutoGPTQ.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF), o transformers estándar.
- Latencia y throughput: no disponible. Al ser un modelo de 9B, se espera una velocidad moderada en GPUs modernas, pero sin datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| CPT-Lucy-V0 | 9,4B | 2048 | Apache 2.0 | Sin benchmarks, "uncensored" |
| Qwen2.5-7B | 7,6B | 32768 | Apache 2.0 | Benchmarks públicos, multilingüe, tool calling |
| Llama-3.1-8B | 8,0B | 131072 | Llama 3.1 | Benchmarks sólidos, multilingüe, tool calling |
| Mistral-7B | 7,3B | 32768 | Apache 2.0 | Benchmarks públicos, eficiente |

CPT-Lucy-V0 carece de datos de rendimiento y tiene un contexto mucho más corto que sus alternativas. Las alternativas ofrecen soporte multilingüe, tool calling y ventanas de contexto significativamente mayores, lo que las hace más adecuadas para producción. La única ventaja aparente de CPT-Lucy-V0 es su carácter "uncensored", que puede ser relevante en nichos específicos.

## Limitaciones y advertencias

- Contexto limitado a 2048 tokens, insuficiente para tareas de memoria larga o documentos extensos.
- Sin benchmarks publicados, el rendimiento real es desconocido y no se puede garantizar su calidad.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Al ser un modelo "uncensored", existe riesgo de generar contenido inapropiado, ofensivo o dañino. No se recomienda su uso en producción sin moderación adicional.
- No se documentan técnicas de alineación (RLHF/DPO), por lo que puede presentar sesgos y alucinaciones no mitigadas.
- El pipeline image-text-to-text declarado no está respaldado por documentación; no se debe asumir soporte multimodal.
- No hay información sobre el dataset de entrenamiento (Corpus-Lucy), lo que dificulta evaluar su calidad y posibles sesgos.
- El modelo base es una variante "aggressive" y "uncensored", lo que puede amplificar comportamientos no deseados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChesterProgrammer/CPT-Lucy-V0
- Modelo base: https://huggingface.co/DreamFast/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
