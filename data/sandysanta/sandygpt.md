# sandysanta/sandyGPT

## Resumen

sandyGPT es un modelo de lenguaje de tipo GPT-2 entrenado desde cero por el usuario sandysanta mediante el framework nanoGPT de Andrej Karpathy. Se trata de un decoder transformer de 107,5 millones de parámetros (12 capas, 11 cabezas de atención, dimensión de modelo 704) con una longitud de contexto de 1024 tokens y tokenizador GPT-2 BPE con vocabulario de 50.304 entradas y embeddings atados. El modelo se ha entrenado durante una época sobre aproximadamente 2.000 millones de tokens del subconjunto sample-10BT del dataset FineWeb-Edu, con un único ciclo de entrenamiento en una RTX 5080 de alrededor de 5 horas y una pérdida de validación final de 3,41.

El modelo es un modelo base puro: no ha pasado por ajuste por instrucciones, RLHF ni DPO, y su función es la continuación de texto, no el diálogo ni la respuesta a preguntas. Su relevancia es principalmente educativa y experimental: sirve como referencia reproducible de un pipeline completo de entrenamiento desde cero con nanoGPT, con pesos publicados en safetensors y licencia MIT, lo que permite inspeccionar, modificar y reentrenar el modelo sin restricciones.

No debe confundirse con un asistente: la propia model card advierte de que la salida es fluida pero a menudo factualmente incorrecta y repetitiva a temperaturas bajas, y que no existe ningún tipo de alineación de seguridad. Su interés práctico en producción es muy limitado, pero es útil para estudiar el comportamiento de modelos pequeños, para experimentos de destilación o como punto de partida de fine-tuning sobre dominios concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo GPT-2 (nanoGPT) |
| Parametros totales | 107.521.216 (107,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, con `lm_head` atado a `transformer.wte`) |

Detalles adicionales de arquitectura: 12 capas, 11 cabezas de atención, `d_model` 704, vocabulario GPT-2 BPE de 50.304 entradas, embeddings atados. Tamaño del repositorio: 0,4 GB. Librería: PyTorch.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder estándar de tipo GPT-2, implementado con nanoGPT: 12 bloques con atención multi-cabeza causal y capas feed-forward pre-norm, normalización de capa, embeddings de token y de posición aprendidos, y proyección de salida atada a los embeddings de entrada (`lm_head` = `transformer.wte`). El tokenizador es GPT-2 BPE con vocabulario de 50.304 tokens. La ventana de contexto es de 1024 tokens.

El entrenamiento se realizó desde cero sobre aproximadamente 2.000 millones de tokens del subconjunto sample-10BT de FineWeb-Edu, durante una sola época. Se ejecutaron 3.750 iteraciones con un tamaño de lote efectivo de 524.000 tokens por iteración, optimizador AdamW con learning rate 6e-4 y decaimiento coseno hasta 6e-5, precisión bf16, en una única GPU RTX 5080 durante unas 5 horas. La pérdida de validación final reportada es de 3,41. No se documenta ningún tipo de ajuste posterior (SFT, RLHF, DPO), ni innovaciones técnicas como decodificación especulativa o atención lineal; el modelo es deliberadamente minimalista y reproducible.

## Capacidades

- Generación de texto autoregresiva en inglés: continuación de un prompt dado, sin seguimiento de instrucciones.
- Modelado de lenguaje y cálculo de perplejidad sobre texto en inglés.
- Reproducción de estilo y registro del corpus FineWeb-Edu (texto educativo y divulgativo filtrado).
- Punto de partida para fine-tuning supervisado en tareas concretas (clasificación, generación de dominio, etc.).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de razonamiento (thinking), visión, audio ni multimodalidad.
- Multilingüismo limitado al inglés; no se documenta entrenamiento en otros idiomas.
- Sin alineación de seguridad ni filtros de contenido.

## Casos de uso

- Docencia y reproducción de pipelines de entrenamiento: el modelo permite recorrer de principio a fin el flujo de nanoGPT (tokenización, dataset, bucle de entrenamiento, evaluación de pérdida) con un coste de cómputo muy bajo, ya que se entrenó en una sola GPU de consumo en unas 5 horas.
- Experimentos de fine-tuning sobre dominios concretos: al ser un modelo base de 107 M con licencia MIT, se puede ajustar con SFT sobre un corpus especializado (por ejemplo, documentación técnica o artículos de un nicho) para estudiar la adaptación de modelos pequeños.
- Investigación sobre modelos de lenguaje pequeños: análisis de curvas de escalado, sensibilidad a hiperparámetros, comportamiento de la pérdida de validación y fenómenos de repetición en decodificación.
- Generación de texto de relleno o sintético para pruebas de infraestructura: sirve para validar pipelines de inferencia (servidores, batching, streaming) sin coste de modelos grandes.
- Evaluación comparativa de tokenizadores y estrategias de decodificación (temperatura, top-k): el script `chat.py` expone parámetros de temperatura, longitud y top-k para experimentar con la generación.
- Prototipado de sistemas de autocompletado o continuación de texto en inglés donde no se requiera precisión factual, como demos interactivas o entornos de prueba.
- Base para experimentos de destilación o inicialización de modelos mayores con arquitectura compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación reportado por el autor es la pérdida de validación de 3,41 sobre el corpus de validación de FineWeb-Edu.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,43 GB para los pesos (107,5 M × 4 bytes), más memoria para activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en bf16/fp16: aproximadamente 0,22 GB para los pesos; el modelo completo se puede cargar en GPUs integradas o de gama baja.
- GPU recomendadas: cualquier GPU moderna; el autor lo entrenó en una RTX 5080. Para inferencia, una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada con suficiente memoria compartida son suficientes. En A100/H100 el modelo está muy infrautilizado.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual (y en muchas generaciones anteriores) con al menos 2 GB de VRAM.
- Opciones de despliegue: PyTorch nativo con `model.py` de nanoGPT y `chat.py`; también es posible convertirlo a GGUF para llama.cpp u Ollama, aunque el autor no publica dichas conversiones. vLLM y TGI no están documentados para este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño, se espera una latencia de milisegundos por token en GPU moderna y throughput alto con batching, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| sandyGPT (este modelo) | 107,5 M | 1024 | MIT | en | Entrenado desde cero con nanoGPT sobre FineWeb-Edu; modelo base sin alineación |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | en | Referencia histórica de la misma familia; ampliamente usado y con ecosistema de herramientas |
| GPT-2 medium (OpenAI) | 355 M | 1024 | MIT | en | Mayor capacidad con la misma arquitectura; requiere más cómputo |
| SmolLM-135M (Hugging Face) | 135 M | 2048 | Apache 2.0 | en (y multilingüe parcial) | Entrenado sobre corpus mayor y con ajuste por instrucciones en variantes posteriores |

La comparación con GPT-2 small y medium es la más directa por arquitectura y tokenizador; SmolLM-135M representa el estado del arte reciente en el segmento de modelos pequeños y ofrece contexto mayor y variantes alineadas. No se dispone de datos de benchmarks comparativos para sandyGPT, por lo que la comparación se limita a especificaciones.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no responde a preguntas ni sigue instrucciones; solo continúa texto.
- Riesgo alto de alucinación: la model card indica explícitamente que la salida es fluida pero a menudo factualmente incorrecta.
- Repetición a temperaturas bajas: comportamiento documentado por el autor; requiere ajuste de temperatura y top-k.
- Entrenado solo en inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto limitado a 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sin alineación de seguridad: puede generar contenido inapropiado u ofensivo presente en el corpus de entrenamiento; no debe desplegarse en aplicaciones orientadas a usuarios sin filtros adicionales.
- Sesgos heredados de FineWeb-Edu: el corpus es una muestra filtrada de web educativa en inglés, con los sesgos de representación que ello implica.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero no hay garantías de ningún tipo por parte del autor.
- Sin soporte documentado para vLLM, TGI, llama.cpp u Ollama; el despliegue está pensado para PyTorch con el código de nanoGPT.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni comunidad que lo respalde.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandysanta/sandyGPT
- Repositorio nanoGPT (Karpathy): https://github.com/karpathy/nanoGPT
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador GPT-2 BPE (tiktoken): https://github.com/openai/tiktoken
