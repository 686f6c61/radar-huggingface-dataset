# Chenhangcui/nomi-zthink-ds-full-v3m-rl

## Resumen

nomi-zthink-ds-full-v3m-rl es un checkpoint de investigación publicado por el usuario Chenhangcui en Hugging Face. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-4B-Base (4.000 millones de parámetros) orientado al razonamiento matemático y etiquetado por el autor dentro de la familia "nomi" con la etiqueta "latent-reasoning". El entrenamiento combina una fase de SFT (supervised fine-tuning) sobre lo que el autor denomina "DS v3m full" seguida de una fase de aprendizaje por refuerzo con DAPO sobre el conjunto DAPO-Math-17k.

El modelo forma parte de un ecosistema propietario del autor: los checkpoints "nomi-think" requieren un códec específico, publicado en el repositorio Chenhangcui/nomi-codecs, para decodificar el "pensamiento" (thought) generado por el modelo. Esto implica que no es un modelo estándar de transformers que se pueda usar directamente con generate(): la decodificación sigue un protocolo congelado (temperatura 0,6, top_p 0,95, semilla 0, loop guard de 256, límite de 12.288 tokens de pensamiento en "Nomi" y 18.432 en inglés, y 1.024 tokens de respuesta).

Es relevante ahora como artefacto de investigación reproducible: el autor publica el checkpoint final (best.pt), el registro de entrenamiento RL (curve.jsonl) y los scripts de entrenamiento (scripts/train_zthink.py y scripts/rl_dapo.py), lo que permite inspeccionar la curva de recompensa y precisión por iteración. No obstante, carece de model card descriptiva, licencia declarada, idiomas especificados y resultados de benchmarks públicos, por lo que su evaluación práctica requiere ejecutar el protocolo de decodificación con el códec correspondiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B-Base); detalles no disponibles |
| Parámetros totales | 4B (según modelo base Qwen3.5-4B-Base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el protocolo de decodificación menciona pensamiento en "Nomi" e inglés) |
| Licencia | no disponible |
| Formato de pesos | best.pt (checkpoint PyTorch cargado con torch.load); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base, un transformer de 4.000 millones de parámetros. Sobre esa base, el autor aplica una fase de SFT completa ("DS v3m full SFT") seguida de un ajuste por aprendizaje por refuerzo con DAPO (Decoupled Clip and Dynamic sAmpling Policy Optimization) sobre el dataset DAPO-Math-17k. El RL se configura con G=8 (8 muestras por prompt) y una tasa de aprendizaje de 1e-6. El checkpoint publicado como best.pt corresponde a la mejor iteración de RL, guardada el 2026-11-16, y el registro curve.jsonl contiene la recompensa de entrenamiento y la precisión por iteración.

La innovación técnica principal es el enfoque de "latent reasoning" o "nomi-think": el modelo genera un bloque de pensamiento en un espacio o codificación propietaria ("Nomi") que requiere el códec del repositorio Chenhangcui/nomi-codecs para ser decodificado a texto. El protocolo de decodificación está congelado (T=0,6, top_p=0,95, seed 0, loop guard 256, límites de pensamiento de 12.288 tokens en Nomi y 18.432 en inglés, y 1.024 tokens de respuesta), y la precisión se mide como avg@k. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset de SFT ni si se aplicaron técnicas adicionales como DPO o decodificación especulativa.

## Capacidades

- Razonamiento matemático: el entrenamiento con DAPO-Math-17k está orientado explícitamente a la resolución de problemas matemáticos.
- Razonamiento latente: genera un bloque de pensamiento ("thought") en codificación Nomi, decodificable con el códec Chenhangcui/nomi-codecs.
- Generación de texto: capacidad heredada del modelo base Qwen3.5-4B-Base.
- Multilingüismo parcial: el protocolo de decodificación distingue pensamiento en "Nomi" e inglés, lo que sugiere soporte al menos de esos dos modos; no se detallan más idiomas.
- No hay información disponible sobre tool calling, function calling, capacidades de agente, visión, audio ni modo thinking estándar al margen del mecanismo Nomi.

## Casos de uso

- Investigación en razonamiento latente: el modelo permite estudiar cómo un espacio de pensamiento codificado (Nomi) afecta a la precisión matemática, usando el códec de Chenhangcui/nomi-codecs para inspeccionar los pensamientos generados.
- Reproducción de experimentos de RL: con best.pt, curve.jsonl y los scripts train_zthink.py y rl_dapo.py, un equipo puede replicar la curva de recompensa y precisión del entrenamiento DAPO con G=8 y lr 1e-6.
- Evaluación comparativa de SFT frente a RL: al partir de un checkpoint SFT ("ds-full-v3m") y publicar el resultado tras RL, permite medir la ganancia atribuible a DAPO-Math-17k en tareas de matemáticas.
- Generación de soluciones matemáticas con traza de pensamiento: útil en entornos de investigación donde se quiera auditar el razonamiento paso a paso, respetando el límite de 12.288 tokens de pensamiento y 1.024 de respuesta.
- Estudio de protocolos de decodificación: el protocolo congelado (T=0,6, top_p=0,95, loop guard 256) sirve como caso de estudio sobre estabilidad y bucles en modelos con razonamiento extendido.
- Base para nuevos ajustes: al ser un checkpoint de 4B en formato PyTorch, puede servir como punto de partida para experimentos propios de fine-tuning, siempre que se respete el ecosistema de códecs del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite únicamente a curve.jsonl para consultar la recompensa de entrenamiento y la precisión por iteración, sin cifras de MMLU, GSM8K, HumanEval ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo de 4B en fp16 se necesitan aproximadamente 8 GB solo para los pesos, más el coste del códec y del contexto de pensamiento (hasta 12.288 tokens en Nomi o 18.432 en inglés), que puede elevar el consumo de memoria de la caché KV de forma significativa.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o una A100/H100 serían adecuadas, pero no hay datos publicados de latencia ni throughput.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 16-24 GB para fp16, aunque no está verificado ni documentado.
- Opciones de despliegue: no se indican vLLM, llama.cpp, Ollama ni TGI; el autor especifica carga con torch.load y scripts propios (train_zthink.py, rl_dapo.py), además del códec de Chenhangcui/nomi-codecs.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nomi-zthink-ds-full-v3m-rl | 4B | no disponible | no disponible | best.pt (PyTorch) | Razonamiento latente con códec propio; sin benchmarks públicos |
| Qwen/Qwen3.5-4B-Base | 4B | no disponible | no disponible en la información | no disponible | Modelo base del que deriva; sin ajuste matemático específico |
| Alternativas de razonamiento matemático de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue en producción.
- Dependencia de un códec propietario: sin Chenhangcui/nomi-codecs el pensamiento generado no puede decodificarse, lo que limita la portabilidad y la integración con herramientas estándar.
- Formato no estándar: los pesos se distribuyen como best.pt cargado con torch.load, no como safetensors ni GGUF, lo que complica el uso con vLLM, llama.cpp u Ollama.
- Sin benchmarks públicos: no hay evidencia verificable de rendimiento frente a modelos comparables; la única métrica disponible es la curva de entrenamiento en curve.jsonl.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación publicada de tasas de error factual en dominios fuera de las matemáticas.
- Sesgos: no documentados por el autor; al derivar de Qwen3.5-4B-Base, podría heredar los sesgos del modelo base, pero no se ha publicado análisis alguno.
- Limitaciones de contexto e idioma: no se especifica la ventana de contexto nativa; el protocolo de decodificación impone topes de 12.288 tokens de pensamiento en Nomi y 18.432 en inglés, y 1.024 de respuesta, lo que restringe la longitud de las soluciones.
- Checkpoint de investigación: el propio autor lo etiqueta como "Research checkpoint (public)", sin garantías de estabilidad ni soporte.
- Protocolo de decodificación congelado: desviarse de T=0,6, top_p=0,95, seed 0 y loop guard 256 puede degradar la precisión medida como avg@k.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chenhangcui/nomi-zthink-ds-full-v3m-rl
- Códec requerido para decodificar el pensamiento: https://huggingface.co/Chenhangcui/nomi-codecs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Scripts de entrenamiento citados en la model card: scripts/train_zthink.py y scripts/rl_dapo.py (incluidos en el repositorio del modelo)
- Registro de entrenamiento RL: curve.jsonl (incluido en el repositorio del modelo)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
