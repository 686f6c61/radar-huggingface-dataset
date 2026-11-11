# davidheineman/nanogpt-ladder-v3-chat-heavy-64m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 chat-heavy 64M 30 TPP es un modelo de lenguaje de tipo base, desarrollado por el usuario davidheineman dentro de una serie experimental denominada NanoGPT Ladder v3. Se trata de un checkpoint de preentrenamiento completado que contiene 63.504.384 parámetros y ha sido entrenado sobre 1.905.131.520 tokens de predicción en 58.140 pasos de optimizador, con semilla 1337. Su propósito es servir como punto de partida reproducible para estudiar el efecto de distintas mezclas de datos en el preentrenamiento a pequeña escala, no como un asistente listo para producción.

El modelo emplea una arquitectura transformer tipo GPT con 12 capas, anchura de 512, 8 cabezas de atención, embeddings atados, RoPE y tokenizador GPT-2, con una longitud de contexto de 1.024 tokens y un vocabulario ampliado a 50.304 entradas. La variante "chat-heavy" sigue la receta congelada del pool Dolma3 Dolmino de AllenAI, asignando un 80% de la mezcla al dominio de chat. Los pesos son los originales en float32 y preceden a cualquier fase de SFT, RL o condicionamiento tiny-rl, por lo que deben utilizarse con prompts de texto plano.

Su relevancia actual es metodológica: forma parte de una colección de ejecuciones independientes por presupuesto de tokens que permiten comparar recetas de datos bajo condiciones controladas. No obstante, su tamaño reducido, su contexto limitado y la ausencia de ajuste por instrucciones lo sitúan fuera del uso comercial directo y lo orientan a investigación, ablaciones y experimentos de preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (NanoGPT), 12 capas, anchura 512, 8 cabezas de atencion, embeddings atados, RoPE |
| Parametros totales | 63.504.384 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (pesos originales en float32; el autor no publica variantes cuantizadas) |
| Idiomas soportados | No disponible (tokenizador GPT-2, predominantemente ingles; no se declara cobertura linguistica) |
| Licencia | No disponible |
| Formato de pesos | PyTorch nativo (`model.pt`) con cargador propio; no compatible con Transformers AutoModel |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de estilo GPT-2, con 12 capas, dimensión de modelo 512, 8 cabezas de atención, embeddings de entrada y salida atados, codificación posicional rotatoria (RoPE) y tokenizador GPT-2 con vocabulario rellenado hasta 50.304 entradas. El checkpoint incluye los módulos `model`, `config`, `identity` y `run`, y conserva los pesos atados de embedding y salida. No se incluye el estado del optimizador, por lo que sirve para inferencia y para fine-tuning posterior, pero no para reanudar el entrenamiento de forma exacta.

El entrenamiento consistió en 58.140 pasos de optimizador sobre 1.905.131.520 tokens de predicción, lo que corresponde a 30 tokens por parámetro (TPP). La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino (`allenai/dolma3_dolmino_pool`), con la variante chat-heavy asignando un 80% al dominio de chat. El archivo `metadata.json` registra las revisiones exactas de las fuentes, los pesos de la mezcla y los hashes SHA256, y `results.json` contiene el registro de finalización y las evaluaciones finales. No se aplicaron fases de SFT, RLHF ni DPO; las métricas finales son de tipo BPB y pérdida de modelado de lenguaje, no de precisión en tareas.

## Capacidades

- Generación de texto autoregresiva con prompts de texto plano, sin formato de instrucciones ni plantilla de chat.
- Modelado de lenguaje y continuación de texto a corto alcance, limitado a 1.024 tokens de contexto.
- Evaluación de pérdida y bits por byte (BPB) como señal de calidad del preentrenamiento.
- Punto de partida para fine-tuning supervisado, ajuste por instrucciones o RL posterior por parte del investigador.
- No dispone de tool calling ni function calling.
- No incorpora razonamiento multi-paso, modo thinking ni planificación de agentes.
- No soporta visión, audio ni modalidades adicionales.
- Capacidad multilingüe no declarada; el tokenizador GPT-2 y la mezcla de datos apuntan a un sesgo hacia el inglés.
- Decodificación greedy (temperatura 0) y muestreo con temperatura configurables en el script incluido.

## Casos de uso

- Ablaciones de mezcla de datos: comparar este checkpoint chat-heavy con otras variantes de la colección NanoGPT Ladder v3 para aislar el efecto del 80% de peso en el dominio de chat sobre la pérdida final.
- Reproducibilidad de preentrenamiento: usar `metadata.json` y `results.json` para replicar exactamente la ejecución con semilla 1337 y verificar hashes de fuentes y pesos.
- Fine-tuning educativo: emplear el checkpoint como base para demostrar un pipeline completo de SFT en GPUs de consumo, dado su tamaño de 64M parámetros.
- Estudio de dinámica de entrenamiento: analizar curvas de pérdida y BPB a 30 TPP frente a otros presupuestos de tokens de la misma serie.
- Generación de texto controlada en entornos de prueba: continuar prompts cortos con decodificación greedy para inspeccionar cualitativamente el efecto de la mezcla chat-heavy.
- Investigación sobre tokenizadores y vocabulario: evaluar el impacto del vocabulario GPT-2 rellenado a 50.304 entradas en modelos pequeños con embeddings atados.
- Prototipado de herramientas de inferencia: validar cargadores personalizados en PyTorch, CUDA, Apple MPS y CPU antes de escalar a modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que `results.json` contiene evaluaciones finales de pérdida y BPB, que son métricas de modelado de lenguaje y no de precisión en tareas, y no se proporcionan cifras concretas en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,25 GB solo para pesos (63,5M parámetros × 4 bytes), más activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 1 GB o más.
- En float16 o bfloat16 los pesos ocuparían unos 0,13 GB, aunque el checkpoint se distribuye en float32 y el autor no publica variantes convertidas.
- GPU recomendadas: cualquier GPU moderna sirve; para entrenamiento o fine-tuning se recomiendan RTX 3090, RTX 4090, A100 o H100 por comodidad, aunque el modelo es viable en GPUs de gama baja.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX con suficiente memoria, Apple Silicon vía MPS o incluso CPU.
- Opciones de despliegue: cargador propio en PyTorch incluido en el repositorio (`model.py`, `generate.py`); no es compatible con vLLM, TGI, llama.cpp ni Ollama sin conversión previa, y no usa Transformers AutoModel.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 chat-heavy 64M 30 TPP | 63,5M | 1.024 | Preentrenamiento experimental, mezcla chat-heavy | No disponible | Hugging Face, PyTorch nativo |
| Otras variantes de NanoGPT Ladder v3 | Variable por presupuesto TPP | 1.024 | Misma arquitectura, distinta mezcla o presupuesto | No disponible | Colección en Hugging Face |
| GPT-2 small | 124M | 1.024 | Transformer decoder-only, ingles | MIT (pesos originales) | Ampliamente disponible, Transformers |
| Modelos tipo TinyLlama o similares de 1B | ~1.100M | 2.048 o más | LLM pequeño ajustado por instrucciones | Apache 2.0 en varios casos | Hugging Face, ecosistema amplio |

La comparación directa con GPT-2 small es la más cercana en escala y arquitectura, aunque este checkpoint es aproximadamente la mitad de tamaño y no está ajustado por instrucciones. Frente a modelos de la franja de 1B, la diferencia de parámetros y de contexto es de un orden de magnitud.

## Limitaciones y advertencias

- Es un modelo base sin SFT ni RL: no sigue instrucciones, no mantiene formato de chat y puede producir continuaciones incoherentes o repetitivas.
- Riesgo elevado de alucinación y de texto factualmente incorrecto, inherente a un modelo de 64M parámetros entrenado con 30 TPP.
- Contexto muy limitado de 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística no declarada; el tokenizador GPT-2 y la mezcla de datos favorecen el inglés, con rendimiento previsiblemente pobre en castellano.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Pesos en float32 y cargador propio: requiere código del repositorio y no funciona con herramientas estándar de inferencia sin adaptación.
- No incluye estado del optimizador, lo que impide reanudar el entrenamiento de forma exacta.
- Las métricas publicadas son de pérdida y BPB, no de precisión en tareas; no deben interpretarse como capacidad de resolución de problemas.
- Sesgos conocidos: no documentados por el autor, pero esperables los del corpus Dolma3 Dolmino y del dominio de chat en particular.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-chat-heavy-64m-30tpp-seed-1337
- Colección NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
