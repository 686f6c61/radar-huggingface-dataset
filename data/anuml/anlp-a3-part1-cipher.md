# anuml/anlp-a3-part1-cipher

## Resumen

El modelo `anuml/anlp-a3-part1-cipher` es un checkpoint de investigación publicado por el usuario `anuml` en Hugging Face, asociado a la asignación 3 de un curso de ANLP (Advanced Natural Language Processing). Se trata de un transformer decoder-only de tipo Prefix-LM entrenado para mapear entradas cifradas a caracteres en claro, es decir, una tarea de descifrado criptográfico a nivel de carácter. El repositorio incluye tanto el checkpoint de un transformer como referencias a una variante basada en Mamba SSM, y ocupa 0,1 GB.

El modelo es extremadamente pequeño (2.916.096 parámetros, aproximadamente 2,9 M) y está pensado como artefacto académico, no como modelo de producción. Su tokenizador es de nivel de carácter con un alfabeto fijo de 86 tokens, y la formulación es la de un Prefix-LM decoder-only que recibe el texto cifrado como prefijo y genera la salida en claro. La relevancia actual es limitada fuera del contexto educativo: sirve como referencia para experimentos de descifrado con arquitecturas modernas (RMSNorm, RoPE, GQA) y como comparación frente a SSM.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens vistos ni el proceso de alineación. La model card solo aporta un punto de validación (epoch 3) con métricas muy bajas, lo que sugiere que el entrenamiento no está ajustado o que la tarea es intrínsecamente difícil para el tamaño del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (RMSNorm, RoPE, GQA) con formulación Prefix-LM; el repo menciona también una variante Mamba SSM |
| Parametros totales | 2.916.096 (transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en FP32/BF16 según `torch.load`) |
| Idiomas soportados | no disponible (tokenizador de carácter con alfabeto de 86 tokens) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`, `state_dict` + `config`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con normalización RMSNorm, embeddings posicionales rotatorios (RoPE) y atención con query grouping (GQA). La formulación es Prefix-LM: el texto cifrado se pasa como prefijo y el modelo genera la secuencia en claro carácter a carácter. El tokenizador es de nivel de carácter con un alfabeto fijo de 86 tokens, lo que evita problemas de tokenización en cadenas cifradas y permite cubrir mayúsculas, minúsculas, dígitos y signos de puntuación habituales.

La model card menciona también una variante basada en Mamba SSM, aunque no se aportan métricas para ella en la tabla de validación. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni técnicas de decodificación especulativa. El único dato de entrenamiento disponible es que el checkpoint reportado corresponde a la epoch 3, con una pérdida de validación de 1,1532.

## Capacidades

- Descifrado de texto a nivel de carácter: el modelo está entrenado específicamente para mapear secuencias cifradas a texto en claro.
- Generación autorregresiva con formulación Prefix-LM: el prefijo cifrado condiciona la generación de la salida.
- Manejo de un alfabeto fijo de 86 caracteres, adecuado para cifrados que operan sobre ese conjunto (por ejemplo, sustituciones simples o cifrados clásicos).
- No se ha documentado soporte de tool calling, function calling ni uso como agente.
- No se ha documentado capacidad multilingüe más allá del alfabeto de 86 caracteres.
- No se ha documentado modo de razonamiento explícito (thinking mode), visión ni audio.

## Casos de uso

- Práctica académica de descifrado: el modelo sirve como base para experimentos de la asignación ANLP 3, permitiendo a estudiantes comparar transformers decoder-only con SSM en una tarea controlada de mapeo cifrado a claro.
- Investigación en tokenización de carácter: su alfabeto fijo de 86 tokens lo hace útil para estudiar cómo afecta la tokenización a tareas de transformación secuencia a secuencia de bajo nivel.
- Comparación de arquitecturas: al incluir referencias a transformer y Mamba SSM, permite reproducir comparativas controladas de rendimiento y convergencia en una tarea pequeña.
- Prototipado de pipelines de descifrado: puede integrarse en scripts de evaluación que midan exactitud por carácter, exactitud por palabra, F1 y distancia de Levenshtein.
- Docencia de métricas de NLP: sus métricas de validación (Char Acc, Word Acc, F1, Levenshtein) sirven como ejemplo práctico de evaluación en tareas de generación.
- Reproducibilidad de experimentos: el script `sync_models.py` y el ejemplo de carga en Python facilitan la reproducción local en CPU sin necesidad de GPU.

## Benchmarks y rendimiento

Datos de validación publicados en la model card (epoch 3, transformer):

| Modelo | Epoch | Val loss | Char acc | Word acc | F1 | Levenshtein | Parametros |
|---|---:|---:|---:|---:|---:|---:|---:|
| transformer | 3 | 1,1532 | 0,0690 | 0,0479 | 0,4203 | 780,01 | 2.916.096 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas anteriores son específicas de la tarea de descifrado y no son comparables con benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (2,9 M de parámetros), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en cualquier modelo con 2 GB o más (GTX 1050, RTX 3050, etc.).
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + `DecoderOnlyTransformer`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera latencia muy baja en CPU y GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un checkpoint académico de 2,9 M de parámetros para descifrado de caracteres, sin equivalentes públicos documentados en la model card. Comparativa: no disponible.

## Limitaciones y advertencias

- Rendimiento muy bajo en la tarea objetivo: Char Acc 0,0690 y Word Acc 0,0479 en la epoch 3, lo que indica que el modelo no descifra de forma fiable.
- Ausencia de información sobre el dataset de entrenamiento, lo que impide evaluar sesgos o generalización.
- Tokenizador de carácter con alfabeto fijo de 86 tokens: cualquier carácter fuera de ese conjunto no puede representarse.
- Riesgo de alucinación y de generar secuencias plausibles pero incorrectas, especialmente con un modelo tan pequeño y poco entrenado.
- No hay información sobre el proceso de alineación (RLHF/DPO) ni sobre filtrado de datos.
- Licencia MIT: permite uso comercial y modificación, pero el modelo es un artefacto académico sin garantías de calidad.
- No apto para producción: no hay benchmarks estándar, no hay soporte documentado de servidores de inferencia y las métricas publicadas son muy bajas.
- La variante Mamba SSM mencionada en la model card no tiene métricas publicadas en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/anuml/anlp-a3-part1-cipher
- Repositorio de código y scripts (`scripts/sync_models.py`, `src/models/transformer.py`): referenciados en la model card, sin URL pública disponible en la información proporcionada.
- Paper, blog o demo: no disponibles.
