# DSA1/factual-guard-l48-classifier

## Resumen

`DSA1/factual-guard-l48-classifier` es un conjunto de tres cabezas de clasificación (una por semilla de entrenamiento) que operan sobre características de tokens previamente extraídas de la capa 48 de un modelo `Qwen/Qwen3.8-27B-FP8`. No es un modelo de lenguaje ni un detector de texto a texto: es un módulo de inferencia que recibe tensores NumPy de forma `(n_tokens, 5120)` y devuelve una probabilidad agregada de que una afirmación contenga un error factual. Lo publica el usuario DSA1 bajo licencia Apache-2.0.

El problema que aborda es la verificación factual en pipelines ya instrumentados: si el equipo dispone de las activaciones internas de un backbone Qwen concreto, este módulo permite añadir una señal de riesgo factual sin volver a entrenar el backbone. La limitación fundamental es que el repositorio no incluye el extractor de características, el tokenizer ni el modelo base, por lo que no puede usarse de forma autónoma sobre texto en crudo.

Es relevante ahora por su enfoque de "clasificador sobre activaciones": separa la extracción de características (costosa, dependiente del backbone) del juicio factual (ligero, tres cabezas de atención sobre tokens). El repositorio está vacío de pesos en la práctica (0.0 GB reportados) y sin descargas ni validación externa, lo que condiciona cualquier evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de clasificación con atención sobre tokens y pooling (TypeAwareHead / standalone_token_head) sobre características de capa 48 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1–256 tokens de entrada (incluye prompt y afirmación); sin truncado ni ventana deslizante |
| Tipos de cuantizacion | no disponible (los vectores se convierten a float16 y luego a float32 para coincidir con la caché histórica) |
| Idiomas soportados | chino (`zh`) |
| Licencia | Apache-2.0 (código y pesos de las cabezas); el backbone y tokenizer tienen licencias propias y no se distribuyen |
| Formato de pesos | `best.pt` (PyTorch, `torch.load` con `weights_only=True`), tres ficheros por semilla: `attention_seed20260719`, `attention_seed20260720`, `attention_seed20260721` |

## Arquitectura y entrenamiento

La arquitectura es un clasificador ligero que consume directamente la secuencia de estados ocultos de la capa 48 de un backbone Qwen (dimensión 5120). Cada cabeza aplica atención sobre tokens, pooling y una capa de clasificación que produce un logit; tras sigmoid se obtiene una probabilidad por cabeza y la media aritmética de las tres (en float32) es el `score` final. La decisión binaria usa el umbral fijo `is_polluted = score >= 0.5519843697547913`, seleccionado sobre un conjunto de validación previo.

El entrenamiento se realizó tres veces con la misma estructura y semillas distintas (20260719, 20260720, 20260721). La rama auxiliar de entrenamiento contenía información de diez clases de error factual, pero la inferencia publicada solo expone el logit binario agregado; no se ofrecen detecciones por categoría. El repositorio incluye `training/train_standalone_head.py` como referencia, pero no incluye datos de entrenamiento, la caché de características L48 ni los pesos de inicialización, por lo que no es reproducible de extremo a extremo. No se indica número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

El protocolo de extracción exige que las características provengan del modelo `Qwen/Qwen3.8-27B-FP8` con revision `017b9c7af6b5689d5dd426a76e0bc077eb5ca20a` y un manifiesto de configuración/tokenizer con SHA-256 `20795b77e8256a914187634491e818f24a8b4ed67378a68346385375b047a34e`. El prompt original es: "请判断以下陈述在事实和逻辑上是否正确。陈述：{text} Assessment:". El módulo solo valida forma, longitud y valores del array; no puede verificar su procedencia.

## Capacidades

- Clasificación binaria de riesgo de error factual sobre características de tokens preextraídas.
- Salida de `score` agregado, `is_polluted` y `per_head` (probabilidad de cada una de las tres cabezas).
- Procesamiento por lotes de arrays de longitud variable (1–256 tokens), con padding a la derecha y máscara generada internamente.
- Ejecución en CPU (`device="cpu"`) o GPU (`device="cuda"`).
- Verificación de integridad de pesos mediante SHA-256 y carga estricta de `state_dict`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidad multilingüe limitada al chino según la model card.
- No expone clasificación entre diez tipos de error factual, pese a que la rama de entrenamiento los usara.

## Casos de uso

- Verificación factual en pipelines RAG: tras generar una respuesta con un LLM, extraer las activaciones de la capa 48 del backbone Qwen y pasar el array al clasificador para marcar respuestas con riesgo de error antes de mostrarlas al usuario.
- Filtrado de datasets sintéticos: puntuar pares pregunta-respuesta generados y descartar los que superen el umbral 0.5519843697547913, reduciendo la contaminación factual en corpus de entrenamiento.
- Control de calidad en resúmenes automáticos: comparar la afirmación resumida con el contexto original mediante la señal de riesgo y activar revisión humana cuando `is_polluted` sea verdadero.
- Moderación de contenido informativo: integrar el score como señal adicional en sistemas de publicación que ya operan sobre Qwen, sin coste de un segundo modelo generativo.
- Investigación en interpretabilidad: usar `per_head` para estudiar la variabilidad entre semillas sobre las mismas activaciones y analizar la calibración del umbral en distintos dominios.
- Evaluación de alucinación en asistentes conversacionales: monitorizar la tasa de `is_polluted` por turno como métrica operativa en producción, siempre que se respete el límite de 256 tokens incluyendo el prompt.
- Auditoría de afirmaciones en dominios acotados: desplegar el clasificador como paso de validación en flujos de documentación técnica en chino, con revisión humana obligatoria por las advertencias del autor sobre fiabilidad médica y generalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona únicamente una ejecución histórica en GPU sobre 22 muestras para validar la carga y el flujo de interfaz, y una comprobación en CPU con características sintéticas para verificar la carga de las tres cabezas; ninguna de las dos constituye una evaluación formal de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de tres cabezas ligeras sobre secuencias de hasta 256 tokens de dimensión 5120, el consumo es muy inferior al del backbone y cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquiera con soporte CUDA para `device="cuda"`; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con varios GB de VRAM; el repositorio no publica cifras medidas.
- Opciones de despliegue: uso directo de la librería `factual_l48` con PyTorch y NumPy; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles. El coste dominante en un sistema real será la extracción de características con el backbone Qwen, no la clasificación.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificadores de error factual sobre activaciones de un backbone concreto) con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- No acepta texto en crudo: requiere características extraídas con un backbone y tokenizer específicos (`Qwen/Qwen3.8-27B-FP8`, revision concreta) y un protocolo de prompt fijo; el módulo no puede verificar el origen de los arrays.
- Límite estricto de 256 tokens incluyendo el prompt; las muestras más largas deben rechazarse en la extracción, sin truncado ni ventana deslizante.
- El umbral 0.5519843697547913 proviene de un conjunto de validación previo y no garantiza su validez en dominios nuevos.
- Solo expone clasificación binaria agregada; no ofrece las diez categorías de error factual que sí usó la rama auxiliar de entrenamiento.
- Idiomas soportados limitados al chino según la model card.
- Riesgo de alucinación y sesgos: no evaluados; el autor advierte explícitamente que el repositorio no demuestra fiabilidad médica, rendimiento por dominio ni generalización entre modelos.
- El repositorio reporta 0.0 GB de tamaño, 0 descargas y 0 likes; no hay validación externa publicada.
- No es reproducible de extremo a extremo: faltan datos de entrenamiento, caché de características L48 y pesos de inicialización.
- Licencia Apache-2.0 para código y pesos de las cabezas; el backbone, tokenizer y dependencias (PyTorch) tienen licencias propias y no se distribuyen con el repositorio.
- Para producción, conviene tratar la salida como una señal auxiliar con revisión humana, no como un verificador factual autónomo.

## Enlaces

- HuggingFace: https://huggingface.co/DSA1/factual-guard-l48-classifier
- Backbone referenciado: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Repositorio de código y pesos: incluido en el propio repositorio de HuggingFace (`factual_l48.py`, `_original_score.py`, `type_aware_head.py`, `standalone_token_head.py`, `training/`, `weights/`)
- Paper, blog o demo: no disponibles en la información proporcionada.
