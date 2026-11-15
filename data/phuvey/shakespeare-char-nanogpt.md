# phuvey/shakespeare-char-nanogpt

## Resumen

`phuvey/shakespeare-char-nanogpt` es un modelo de lenguaje a nivel de carácter (~804.096 parámetros) entrenado con nanoGPT sobre el corpus tiny-shakespeare. Lo desarrolla el usuario phuvey como proyecto pedagógico: reproduce el flujo de entrenamiento de nanoGPT a pequeña escala (2000 iteraciones sobre CPU, val loss 1,89) y publica los pesos en formato safetensors. No pretende competir con ningún modelo de producción; su interés es didáctico y reproducible en hardware modesto.

Arquitectura transformer decoder-only estilo GPT, tokenización a nivel de carácter (vocabulario mínimo) e idioma exclusivamente inglés (inglés shakespeariano). El contexto efectivo está limitado por la configuración de nanoGPT usada en el entrenamiento; la model card no detalla el valor exacto de `block_size`, por lo que no está disponible.

Es relevante ahora únicamente como referencia educativa: un punto de partida de bajo coste para estudiar tokenización por carácter, dinámica de entrenamiento y sobreajuste en modelos minúsculos, no como componente de sistemas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (nanoGPT) |
| Parametros totales | 804.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | en (inglés, registro shakespeariano) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Transformer decoder-only basado en la implementación nanoGPT de Andrej Karpathy, con tokenización a nivel de carácter. El vocabulario es, por tanto, el conjunto de caracteres presentes en tiny-shakespeare (letras, puntuación, espacios y saltos de línea), lo que elimina la necesidad de un tokenizador BPE y simplifica el pipeline. El modelo se entrenó durante 2000 iteraciones sobre CPU, alcanzando una val loss de 1,89; no se documentan detalles sobre número de tokens vistos, composición exacta del dataset, hiperparámetros (learning rate, warmup, dropout) ni técnicas de alineación tipo RLHF/DPO, que no se aplicaron.

No hay innovaciones técnicas destacables: es una reproducción fiel y minimalista de nanoGPT. El checkpoint publicado corresponde al estado final tras el entrenamiento; la model card no indica si se guardaron checkpoints intermedios ni si se aplicó early stopping.

## Capacidades

- Generación de texto a nivel de carácter en inglés, imitando el estilo de Shakespeare de forma localmente plausible.
- Continuación de prompts cortos dentro del estilo del corpus de entrenamiento.
- Reproducción de estructuras superficiales (versificación aproximada, puntuación, mayúsculas) presentes en tiny-shakespeare.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- Multilingüismo: no; solo inglés (y solo el subconjunto de caracteres del corpus).
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Docencia de fundamentos de LLM: permite mostrar de principio a fin cómo un transformer minúsculo aprende dependencias de caracteres, con curvas de loss reproducibles en CPU.
- Experimentos de tokenización por carácter: sirve como baseline para comparar con tokenizadores BPE en tareas de modelado de lenguaje a pequeña escala.
- Pruebas de infraestructura de inferencia: al ocupar menos de 1 MB de pesos, es útil para validar pipelines de carga de safetensors, servidores de inferencia y tests de integración sin coste de GPU.
- Estudio de sobreajuste y regularización: con 2000 iteraciones sobre un corpus pequeño, es un caso práctico para analizar memorización frente a generalización (val loss 1,89).
- Generación creativa de estilo shakespeariano con fines lúdicos o educativos: produce texto pseudo-Shakespeare localmente plausible, útil en demos de clase.
- Reproducción de experimentos de nanoGPT: permite replicar configuraciones y comparar resultados sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado por el autor es la val loss de 1,89 tras 2000 iteraciones de entrenamiento sobre CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 10 MB en FP32 (804.096 parámetros × 4 bytes ≈ 3,2 MB de pesos, más activaciones y overhead); holgadamente por debajo de 1 GB en cualquier configuración.
- GPU recomendadas: innecesaria; el modelo se entrenó en CPU y la inferencia funciona en CPU. Cualquier GPU consumer (incluso integradas) es suficiente.
- Cabe en cualquier GPU consumer y en CPU de forma trivial.
- Opciones de despliegue: carga directa con `transformers`/`safetensors` (según el código de la model card), o conversión a GGUF para llama.cpp/Ollama si se desea; vLLM y TGI están sobredimensionados para este caso.
- Latencia y throughput: no disponibles; al ser un modelo de <1 M parámetros, la latencia por token es del orden de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phuvey/shakespeare-char-nanogpt | 804.096 | no disponible | carácter | MIT | Hugging Face |
| karpathy/nanoGPT (referencia) | configurable (≈10 M en config base) | configurable | carácter o BPE | MIT | GitHub |
| Modelos GPT-2 pequeños (p. ej. distilgpt2) | ≈82 M | 1024 | BPE | MIT/Apache-2.0 | Hugging Face |

La comparación es orientativa: nanoGPT es un framework de referencia más que un checkpoint comparable, y distilgpt2 supera en órdenes de magnitud el tamaño y la calidad de generación. No se dispone de benchmarks comparativos publicados para este checkpoint.

## Limitaciones y advertencias

- Calidad de generación muy limitada: el propio autor indica que produce pseudo-Shakespeare localmente plausible "y nada más".
- Riesgo elevado de texto incoherente a nivel semántico y de deriva fuera del estilo tras pocos tokens.
- Sesgos: hereda los sesgos del corpus tiny-shakespeare (registro histórico, temática dramática europea, ausencia de voces contemporáneas); no se documenta ningún análisis de sesgo.
- Contexto efectivo corto y no documentado, lo que impide mantener coherencia en conversaciones o documentos largos.
- Idioma restringido al inglés shakespeariano; no maneja castellano ni otros idiomas.
- Licencia MIT: permite uso comercial, pero el modelo no es apto para producción por su calidad y tamaño.
- No debe usarse como componente de sistemas de atención al cliente, generación de código ni agentes; su único uso razonable es educativo o experimental.

## Enlaces

- Hugging Face: https://huggingface.co/phuvey/shakespeare-char-nanogpt
- nanoGPT (repositorio de referencia): https://github.com/karpathy/nanoGPT
- tiny-shakespeare (corpus): https://github.com/karpathy/char-rnn/blob/master/data/tinyshakespeare/input.txt
- safetensors: https://github.com/huggingface/safetensors
