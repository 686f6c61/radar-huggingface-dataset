# davidheineman/nanogpt-ladder-v3-base-8m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 base 8M es un modelo de lenguaje de tipo base (sin ajuste fino posterior) desarrollado por davidheineman dentro del proyecto NanoGPT Ladder v3, una serie de experimentos de preentrenamiento escalonado. El modelo cuenta con 8.011.776 parámetros y ha sido entrenado sobre 801.177.600 tokens de predicción (100 TPP, tokens por parámetro) durante 24.450 pasos de optimización, con semilla 1337. Su propósito es servir como punto de control reproducible para estudiar el comportamiento del preentrenamiento a distintas escalas de cómputo y presupuestos de tokens.

Arquitectura transformer tipo GPT con 8 capas, anchura 128, 4 cabezas de atención, embeddings atados (tied embeddings), RoPE, tokenizador GPT-2 y contexto de 1.024 tokens. El vocabulario está acolchado a 50.304 entradas. Los pesos se distribuyen en formato PyTorch nativo (float32 original) con un cargador propio, no compatible con `AutoModel` de Transformers.

Es relevante ahora porque forma parte de una colección de modelos completados que permite comparar puntos finales de preentrenamiento bajo recetas controladas (mezcla Dolma3 Dolmino congelada, semilla fija, registro de revisiones y hashes SHA256). No es un modelo para producción ni para tareas de usuario final: es material de investigación sobre dinámica de preentrenamiento a pequeña escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (NanoGPT) |
| Parametros totales | 8.011.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`, float32); no safetensors ni GGUF |
| Capas | 8 |
| Anchura (n_embd) | 128 |
| Cabezas de atencion | 4 |
| Vocabulario | 50.304 (acolchado) |
| Tokenizador | GPT-2 (tiktoken) |
| Tokens de entrenamiento | 801.177.600 (100 TPP) |
| Pasos de optimizacion | 24.450 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estilo GPT con 8 capas, dimensión de modelo 128 y 4 cabezas de atención. Emplea embeddings atados entre la matriz de entrada y la proyección de salida, codificación posicional rotatoria (RoPE) y un vocabulario GPT-2 acolchado hasta 50.304 entradas. El contexto máximo es de 1.024 tokens. La implementación es la de NanoGPT, con `model.py` y `generate.py` propios en lugar de la API de Transformers.

El preentrenamiento se realizó sobre el pool Dolma3 Dolmino siguiendo una receta de mezcla congelada; en las mezclas "heavy" se asigna el 80% de los tokens a un dominio concreto. El run completó 801.177.600 tokens de predicción en 24.450 pasos de optimización con semilla 1337. Cada presupuesto de tokens de la serie corresponde a un entrenamiento independiente, no a un checkpoint intermedio. Los pesos son previos a cualquier condicionamiento tiny-rl, SFT o RL, por lo que se comportan como un modelo base puro. El repositorio incluye `metadata.json` con revisiones exactas de las fuentes, pesos de mezcla y SHA256, y `results.json` con el registro de finalización y las evaluaciones finales. Las métricas reportadas (BPB/loss) son de modelado de lenguaje, no de precisión en tareas.

## Capacidades

- Generación de texto autoregresiva a partir de prompts en texto plano, en modo base.
- Continuación de texto y modelado de lenguaje genérico; no se ha sometido a instrucciones ni a diálogo.
- Decodificación configurable: muestreo con temperatura o decodificación greedy (`temperature=0`).
- Ejecución en CPU, CUDA o Apple MPS mediante `device=auto`.
- Carga nativa en PyTorch para inferencia y para ajuste fino posterior (sin estado de optimizador en el checkpoint).
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües: no disponible (no se documentan idiomas).

## Casos de uso

- Investigación sobre leyes de escalado: comparar este punto final de 8M parámetros y 100 TPP con otros puntos de la colección NanoGPT Ladder v3 para estudiar la relación entre cómputo, tokens y pérdida.
- Reproducibilidad de experimentos: reentrenar o auditar el run gracias a `metadata.json` (revisiones de fuentes, pesos de mezcla, SHA256) y a la semilla fija 1337.
- Ajuste fino educativo: usar el checkpoint como base para demostrar SFT o RL a pequeña escala, dado que el autor indica que los pesos son previos a tiny-rl, SFT y RL.
- Pruebas de infraestructura de inferencia: validar pipelines propios de carga y generación con un modelo de 8M parámetros que corre en CPU y en MPS sin requisitos de GPU.
- Estudio de mezclas de datos: analizar el efecto de las recetas Dolma3 Dolmino (incluidas las mezclas "heavy" con 80% de un dominio) sobre el comportamiento del modelo base.
- Docencia y divulgación: ilustrar el funcionamiento interno de un transformer GPT completo con un modelo cuyo código (`model.py`, `generate.py`) es legible y ejecutable localmente.
- Generación de texto de dominio general como línea base: obtener continuaciones de texto con un modelo mínimo para comparar contra modelos mayores en experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica que `results.json` contiene evaluaciones finales de pérdida/BPB, que son métricas de modelado de lenguaje y no de precisión en tareas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (8M parámetros, aproximadamente 32 MB de pesos más activaciones y overhead del runtime); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera; el modelo está pensado para ejecutarse en CPU, CUDA o Apple MPS. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos unos cientos de MB de memoria disponible.
- Opciones de despliegue: scripts propios `generate.py` y `model.py` con PyTorch y tiktoken. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el cargador es propio (no `AutoModel`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 base 8M 100 TPP (este) | 8,0 M | 1.024 | 801,2 M (100 TPP) | no disponible | PyTorch nativo |
| Otros puntos de NanoGPT Ladder v3 | no disponible | no disponible | no disponible | no disponible | PyTorch nativo |
| GPT-2 small | 124 M | 1.024 | no disponible | MIT (referencia) | safetensors/PyTorch |
| Alternativas de 8M parámetros | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con los demás modelos completados de la colección NanoGPT Ladder v3 del mismo autor, que comparten arquitectura y receta pero difieren en presupuesto de tokens. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin SFT ni RL: no sigue instrucciones, no mantiene diálogo estructurado y no debe usarse como asistente.
- Tamaño muy reducido (8M parámetros): capacidad limitada de razonamiento, conocimiento factual escaso y alta propensión a continuaciones incoherentes o repetitivas.
- Riesgo elevado de alucinación y de generar contenido sesgado heredado de los datos de preentrenamiento (Dolma3 Dolmino); no se documentan evaluaciones de sesgo.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el tokenizador GPT-2 está orientado principalmente a inglés.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Pesos en float32 sin cuantizaciones publicadas; no hay integración con runtimes de inferencia estándar (vLLM, llama.cpp, Ollama, TGI).
- El checkpoint no incluye estado del optimizador, lo que limita la reanudación exacta del entrenamiento.
- Las métricas publicadas son de pérdida/BPB, no de calidad en tareas; no deben interpretarse como rendimiento funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-base-8m-100tpp-seed-1337
- Colección NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Perfil del autor: https://huggingface.co/davidheineman
