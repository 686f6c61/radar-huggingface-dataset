# davidheineman/nanogpt-ladder-v3-chat-heavy-16m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 chat-heavy 16M es un checkpoint de preentrenamiento a escala reducida desarrollado por davidheineman dentro de la colección NanoGPT Ladder v3, una serie de ejecuciones independientes de preentrenamiento con presupuestos de tokens controlados. El modelo resuelve un problema de investigación reproducible: ofrecer un punto de partida limpio, entrenado sobre una mezcla de datos concreta (chat-heavy) y con un número exacto de tokens por parámetro (10 TPP), antes de cualquier etapa de SFT, RLHF o condicionamiento tiny-rl. Por tanto, no es un modelo de chat listo para producción, sino una base de estudio para experimentos de scaling laws, ablaciones de mezcla de datos y fine-tuning posterior.

Arquitectura transformer decoder-only de estilo GPT con 15.851.520 parámetros, 14 capas, anchura 192, 6 cabezas de atención, embeddings atados, RoPE y tokenizador GPT-2 con vocabulario rellenado de 50.304 entradas. La longitud de contexto es de 1.024 tokens. El checkpoint se publica en float32 original, con pesos en `model.pt` y scripts propios de carga e inferencia en PyTorch, sin integración con Transformers.

Su relevancia es metodológica: la mezcla chat-heavy asigna el 80% de los datos al dominio nombrado, siguiendo la receta congelada del pool Dolma3 Dolmino, y el repositorio incluye `metadata.json` con revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256, además de `results.json` con el registro de finalización y evaluaciones finales. Esto lo convierte en un artefacto auditable para estudiar el efecto de la composición del corpus en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (implementación NanoGPT), con RoPE y embeddings atados |
| Parametros totales | 15.851.520 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en float32 original) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch nativo (`model.pt`, checkpoint con `model`, `config`, `identity` y `run`); no safetensors ni GGUF |
| Capas | 14 |
| Anchura (d_model) | 192 |
| Cabezas de atencion | 6 |
| Vocabulario | 50.304 (tokenizador GPT-2 con vocabulario rellenado) |
| Tokens de entrenamiento | 158.498.816 (10 TPP) |
| Pasos de optimizador | 4.837 |
| Semilla | 1337 |
| Dataset | `allenai/dolma3_dolmino_pool` (mezcla chat-heavy, 80% al dominio nombrado) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 14 capas, anchura 192 y 6 cabezas de atención, siguiendo la implementación NanoGPT. Usa embeddings atados entre entrada y salida, codificación posicional rotatoria (RoPE) y el tokenizador GPT-2 con vocabulario rellenado hasta 50.304 entradas. El contexto máximo es de 1.024 tokens. El checkpoint contiene los pesos en float32 original, junto con la configuración y los metadatos de la ejecución; no incluye estado del optimizador, por lo que sirve para inferencia y para fine-tuning desde cero del optimizador.

El preentrenamiento se completó con 158.498.816 tokens de predicción (10 tokens por parámetro), distribuidos en 4.837 pasos de optimizador con semilla 1337. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino; en las mezclas chat-heavy, el 80% de los datos se asigna al dominio nombrado (chat). El repositorio registra en `metadata.json` las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256, y en `results.json` el registro de finalización y las evaluaciones finales. No se documentan etapas de RLHF, DPO ni SFT: los pesos son anteriores al condicionamiento tiny-rl, al SFT y al RL, y deben usarse con prompts de texto plano.

## Capacidades

- Generación de texto autoregresiva con prompts de texto plano, mediante decodificación greedy (`temperature=0`) o con muestreo por temperatura.
- Modelo base de preentrenamiento: no está ajustado para seguir instrucciones, mantener formato de chat ni respuestas estructuradas.
- Evaluación de modelado de lenguaje: el autor reporta métricas finales de BPB y pérdida, que son evaluaciones de lenguaje y no precisión en resolución de tareas.
- Fine-tuning posterior: el checkpoint admite entrenamiento adicional; el estado del optimizador no está incluido.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (visión, audio) documentadas.
- Capacidades multilingües no documentadas; el tokenizador GPT-2 está orientado principalmente a inglés.
- Ejecución en CUDA, Apple MPS o CPU mediante `device=auto` en el script incluido.

## Casos de uso

- Estudio de scaling laws y presupuestos de tokens: el modelo forma parte de una escalera de ejecuciones independientes con presupuestos de tokens por parámetro controlados (10 TPP en este caso), lo que permite comparar curvas de pérdida entre tamaños y mezclas con condiciones reproducibles.
- Ablación de mezcla de datos: al asignar el 80% del corpus al dominio chat dentro de la receta Dolma3 Dolmino, sirve para medir el efecto de una mezcla fuertemente sesgada hacia un dominio sobre la pérdida de validación en un modelo de 16M de parámetros.
- Reproducibilidad de experimentos: `metadata.json` incluye revisiones exactas de las fuentes, pesos de mezcla y SHA256, lo que permite reconstruir el corpus y repetir el entrenamiento con semilla fija (1337).
- Fine-tuning de bajo coste en hardware consumer: con 15,85M de parámetros y pesos float32, el modelo cabe holgadamente en CPU y en GPUs de gama baja, lo que lo hace útil para prototipar pipelines de SFT o RL sobre una base pequeña antes de escalar.
- Docencia y formación en preentrenamiento: el código `model.py` y `generate.py` incluidos permiten recorrer el ciclo completo de carga, inferencia y entrenamiento de un transformer GPT sin depender de Transformers AutoModel.
- Generación de texto de prueba en pipelines: sirve como modelo de humo para validar integraciones de inferencia (tokenización GPT-2, decodificación greedy, selección de dispositivo) antes de sustituirlo por un modelo mayor.
- Investigación sobre condicionamiento tiny-rl: al ser el punto de partida previo al condicionamiento, permite aislar la contribución de las etapas posteriores de SFT y RL comparando con los checkpoints derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que `results.json` contiene el registro de finalización y evaluaciones finales, y que las mediciones de BPB y pérdida son evaluaciones de modelado de lenguaje, no precisión en resolución de tareas. No se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de otras tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los pesos (15,85M de parámetros × 4 bytes ≈ 63 MB), más el overhead del runtime de PyTorch y las activaciones para contexto de 1.024 tokens.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; también funciona en Apple MPS y en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual (por ejemplo, RTX 3060, RTX 4090) e incluso en iGPU y CPU.
- Opciones de despliegue: scripts propios `model.py` y `generate.py` con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura usa su propio loader y no Transformers AutoModel.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La comparación se limita a características estructurales conocidas de la propia serie y de alternativas de escala similar, sin cifras de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 chat-heavy 16M (este) | 15.851.520 | 1.024 | No disponible | PyTorch (`model.pt`) | Checkpoint base, mezcla chat-heavy al 80%, 10 TPP |
| Otros checkpoints de NanoGPT Ladder v3 | No disponible | No disponible | No disponible | PyTorch | Ejecuciones independientes de la misma escalera; consultar la colección del autor |
| GPT-2 small | 124M | 1.024 | No disponible en la información | Safetensors/PyTorch | Referencia de arquitectura similar, ~8× más parámetros |
| Modelos de 16M de parámetros comparables | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas con datos verificables en la información disponible |

## Limitaciones y advertencias

- No es un modelo de chat ni de instrucciones: los pesos preceden al condicionamiento tiny-rl, al SFT y al RL; debe usarse con prompts de texto plano.
- Riesgo elevado de alucinación y de texto incoherente en generaciones largas, esperable en un modelo de 15,85M de parámetros entrenado con 158,5M de tokens.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el tokenizador GPT-2 y la mezcla de datos están orientados principalmente al inglés, con rendimiento incierto en castellano.
- Sesgos conocidos: no documentados por el autor; al derivarse del pool Dolma3 Dolmino, puede heredar sesgos presentes en ese corpus.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en producción.
- Las métricas publicadas (BPB y pérdida) son evaluaciones de modelado de lenguaje, no precisión en tareas; no deben interpretarse como rendimiento funcional.
- El checkpoint no incluye estado del optimizador, lo que afecta a la reanudación exacta del entrenamiento.
- Requiere el loader propio incluido en el repositorio; no es compatible con Transformers AutoModel, lo que limita su integración en stacks estándar de despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-chat-heavy-16m-10tpp-seed-1337
- Colección NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
