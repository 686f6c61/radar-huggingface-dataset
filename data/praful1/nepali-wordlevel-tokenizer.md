# praful1/nepali-wordlevel-tokenizer

## Resumen

`nepali-wordlevel-tokenizer` es un modelo de generación de texto publicado en Hugging Face por el usuario praful1. Se trata de un modelo pequeño, de unos 58 millones de parámetros, entrenado desde cero (o ajustado, la model card no lo aclara con precisión) sobre el corpus `IRIIS-RESEARCH/Nepali-Text-Corpus` y orientado al idioma nepalí. Su rasgo distintivo declarado es el uso de un tokenizador a nivel de palabra (word-level), una elección poco habitual en los modelos actuales, que mayoritariamente emplean tokenizadores subword (BPE o SentencePiece).

El modelo se distribuye en formato safetensors, es compatible con la librería `transformers` y con text-generation-inference, y aparece etiquetado con la arquitectura `qwen2`. El repositorio ocupa aproximadamente 0,2 GB, lo que confirma su naturaleza compacta y su vocación de experimento o prueba de concepto más que de modelo de producción.

La relevancia de esta ficha es limitada pero informativa: se trata de un caso claro de modelo con documentación incompleta, entrenamiento declarado como no finalizado por falta de recursos y sin resultados de evaluación publicados. Resulta útil como referencia de lo que no debería faltar en una model card y como ejemplo de las dificultades del entrenamiento de modelos en idiomas con pocos recursos como el nepalí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen2 (según tag de Hugging Face); detalles no disponibles |
| Parametros totales | 58.003.968 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/otros no publicadas) |
| Idiomas soportados | no disponible (el corpus de entrenamiento es en nepalí) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La única referencia arquitectónica es la etiqueta `qwen2` de Hugging Face, que sugiere una implementación de transformer decoder-only con las convenciones de Qwen2 (RMSNorm, RoPE, atención con posibles sesgos en Q/K/V según la variante). No obstante, la model card no confirma la arquitectura ni detalla el número de capas, dimensiones ocultas, cabezas de atención ni la longitud de contexto nativa. El dato de 58 millones de parámetros sitúa al modelo en la gama de los transformers pequeños tipo GPT-2 small (124 M) o incluso por debajo, lo que limita severamente su capacidad de razonamiento y conocimiento factual.

El entrenamiento se realizó sobre el dataset `IRIIS-RESEARCH/Nepali-Text-Corpus` con los siguientes hiperparámetros declarados: learning rate 5e-4, batch de entrenamiento de 2, batch de evaluación de 8, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal, 1000 pasos de entrenamiento y precisión mixta nativa (AMP). El autor indica explícitamente que el preentrenamiento quedó incompleto por falta de recursos. No se documenta el número de tokens procesados, la composición del corpus, ni si hubo fases de instrucción, RLHF o DPO. Tampoco se especifica qué modelo base se utilizó, ya que la model card deja el campo de fine-tuning vacío ("fine-tuned version of []").

## Capacidades

- Generación de texto autoregresiva en nepalí, condicionada al corpus de entrenamiento.
- Tokenización a nivel de palabra, lo que implica un vocabulario potencialmente muy grande y una cobertura limitada ante palabras no vistas (OOV).
- Compatibilidad con el pipeline `text-generation` de `transformers` y con text-generation-inference.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta capacidad de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del nepalí.
- No se documenta modo "thinking", visión, audio ni otras modalidades.
- No se documenta capacidad de generación de código ni de matemáticas.

## Casos de uso

- Experimentación académica con tokenizadores word-level: el modelo permite estudiar el impacto de un vocabulario a nivel de palabra frente a BPE/SentencePiece en un idioma de bajos recursos como el nepalí, comparando perplejidad y cobertura léxica.
- Prototipado rápido de completado de texto en nepalí: dado su tamaño de 58 M de parámetros, puede ejecutarse en CPU o en GPU de gama baja para pruebas de concepto de autocompletado, siempre con expectativas de calidad limitadas.
- Generación de datos sintéticos para aumento de corpus: el modelo puede emplearse para producir textos adicionales en nepalí que, tras filtrado humano, amplíen datasets de entrenamiento de modelos mayores.
- Enseñanza de pipelines de `transformers`: sirve como ejemplo mínimo para demostrar el flujo completo de carga, tokenización y generación con `pipeline("text-generation")` en un contexto real de un idioma no inglés.
- Investigación sobre tokenizadores y fertilidad léxica: permite medir la relación tokens/palabra en nepalí y comparar con tokenizadores subword de modelos multilingües como mBERT o XLM-R.
- Base para fine-tuning posterior en tareas nepalíes específicas (clasificación, etiquetado, resumen), aprovechando que el repo es ligero (0,2 GB) y fácil de reentrenar en hardware modesto.
- Evaluación de riesgos de modelos pequeños en producción: útil como caso de estudio de alucinación y degradación de calidad cuando el preentrenamiento es incompleto.

## Benchmarks y rendimiento

El model-index del autor declara una entrada para `nepali-wordlevel-tokenizer` con la lista de resultados vacía (`"results": []`). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,23 GB solo para pesos (58 M × 4 bytes), más overhead de activaciones y KV cache; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16/bf16: en torno a 0,12 GB para pesos; ejecutable incluso en iGPU y CPU.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es sobredimensionada; el modelo está pensado para entornos de muy bajos recursos.
- Cabe en cualquier GPU consumer actual e incluso en Raspberry Pi o entornos CPU-only con latencia aceptable.
- Opciones de despliegue: `transformers` (pipeline de text-generation), text-generation-inference (según tags), y potencialmente llama.cpp/Ollama si se generan conversiones GGUF, aunque no se publican en el repo.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera un throughput alto en GPU y decenas de tokens por segundo en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| praful1/nepali-wordlevel-tokenizer | 58 M | no disponible | nepalí (presunto) | no disponible | Hugging Face |
| GPT-2 small | 124 M | 1024 | inglés | MIT | Hugging Face |
| Qwen2-0.5B | 494 M | 32 768 | multilingüe | Apache 2.0 | Hugging Face |
| XLM-R base | 278 M | 512 | 100 idiomas | MIT | Hugging Face |

La comparación es aproximada: no existen benchmarks públicos del modelo de praful1 que permitan contrastar calidad. Frente a GPT-2 small, el modelo nepalí tiene la mitad de parámetros y un tokenizador word-level que probablemente reduce la eficiencia por token. Frente a Qwen2-0.5B, carece de la escala y del contexto extendido. Frente a XLM-R, no ofrece cobertura multilingüe documentada.

## Limitaciones y advertencias

- Entrenamiento declarado como incompleto por falta de recursos, según la propia model card; la calidad esperada es baja.
- Sin resultados de benchmarks ni métricas de evaluación publicadas.
- Model card generada automáticamente y no revisada: secciones "Intended uses", "Training and evaluation data" y "Training results" están vacías o marcadas como "More information needed".
- Tokenizador word-level: alta tasa de tokens desconocidos (OOV) ante variaciones morfológicas, préstamos léxicos y neologismos, lo que degrada la generación.
- Riesgo elevado de alucinación y de incoherencia por el tamaño reducido y el preentrenamiento parcial.
- Licencia no especificada: no se puede garantizar el uso comercial; se recomienda contactar al autor antes de cualquier despliegue productivo.
- Idiomas soportados no declarados formalmente; el uso fuera del nepalí no está validado.
- Sesgos desconocidos: no se documenta la composición del corpus `IRIIS-RESEARCH/Nepali-Text-Corpus` ni posibles sesgos de género, religión o política.
- No apto para producción sin una evaluación propia exhaustiva.
- Fecha de creación y actualización en 2026 según los metadatos de Hugging Face; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/praful1/nepali-wordlevel-tokenizer
- Dataset de entrenamiento: https://huggingface.co/datasets/IRIIS-RESEARCH/Nepali-Text-Corpus
- Repositorio de `transformers`: https://github.com/huggingface/transformers
- Repositorio de text-generation-inference: https://github.com/huggingface/text-generation-inference
- Documentación de Qwen2: https://huggingface.co/docs/transformers/model_doc/qwen2
