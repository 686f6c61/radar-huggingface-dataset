# Lancelot53/Qwen3.5-4B-MiSI-Bench-testsplit-SFT

## Resumen

Qwen3.5-4B-MiSI-Bench-testsplit-SFT es un ajuste fino supervisado (SFT) del modelo vision-language Qwen3.5-4B de Alibaba, publicado por el usuario Lancelot53. El modelo está especializado en tareas de interacción proteína-ligando sobre el benchmark MiSI-Bench: predicción de enlaces de hidrógeno, localización de interacciones, traslación, rotación, zoom y docking sobre complejos proteína-ligando renderizados a partir de PDBbind. Se trata de un checkpoint de un proyecto de investigación exploratorio que fue detenido tras la línea base, liberado por transparencia y reutilización.

El modelo tiene 4.539.265.536 parámetros totales (4,54 mil millones) en formato safetensors, con un repositorio de 10,4 GB. Es un modelo de tipo image-text-to-text que combina un codificador visual con un modelo de lenguaje, y se distribuye bajo licencia Apache 2.0. La relevancia de este checkpoint es doble: por un lado, demuestra que un VLM de 4B puede adaptarse a tareas de biología estructural con un ajuste fino relativamente modesto (5,7 horas en 8 GPU RTX 6000 Ada); por otro, su model card incluye una advertencia explícita de contaminación de datos que lo convierte en un caso de estudio sobre buenas prácticas de transparencia en investigación.

Es importante señalar que el modelo fue entrenado sobre el split de test público oficial de MiSI-Bench (392 de los 490 complejos oficiales), por lo que cualquier evaluación sobre el test oficial está contaminada. La única evaluación limpia posible es sobre los 98 complejos retenidos por el autor, cuyo split está documentado y es verificable mediante hashes SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (hereda la de Qwen3.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no disponible (no es MoE según los datos) |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento: 16.384 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un VLM compuesto por un codificador visual y un modelo de lenguaje con un módulo merger visión-lenguaje. El ajuste fino fue completo sobre el modelo de lenguaje y el merger, manteniendo el codificador visual congelado. El entrenamiento se realizó con ms-swift 4.6.1, transformers 5.22, torch 2.11 y DeepSpeed ZeRO-2 sobre 8 GPU RTX 6000 Ada de 48 GB, durante 5,7 horas. Se usaron 2 épocas, batch global de 32 (1 por GPU × 8 GPU × 4 de acumulación), learning rate 1e-5 con schedule coseno, 5 % de warmup, sin weight decay, precisión bf16, gradient checkpointing y longitud máxima de 16.384 tokens, con semilla 42. La pérdida de entrenamiento bajó de 2,60 a 0,35.

Los datos de entrenamiento provienen del split de test público de MiSI-Bench (12.917 preguntas, 490 complejos proteína-ligando, nueve tareas). El autor re-dividió ese conjunto por complejo con semilla 0 en una proporción 80/20, resultando en 392 complejos de entrenamiento y 98 de test, con 10.005 preguntas de entrenamiento y 2.378 de test. Se descartaron 474 preguntas de traslación-rotación que implicaban dos complejos en lados distintos del split y 60 preguntas de pocket-ligando con respuesta dorada vacía. Los prompts son las plantillas zero-shot oficiales de MiSI-Bench sin modificar, con imágenes a resolución nativa de 1160×803. El entrenamiento se hizo en modo non-thinking: se antepone un prefijo vacío `\n\n` a cada respuesta, excluido de la pérdida, que solo se calcula sobre los tokens de respuesta.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes de complejos proteína-ligando.
- Predicción de enlaces de hidrógeno residuo-ligando (tarea de interacción fácil) y pocket-ligando (tarea difícil).
- Localización de interacciones sobre la imagen del complejo.
- Tareas geométricas: traslación, rotación, zoom, traslación-rotación, rotación-rotación y docking.
- Procesamiento de imágenes a resolución nativa (1160×803) sin redimensionado.
- Modo non-thinking forzado (el prefijo de pensamiento vacío se excluye de la pérdida).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles (los prompts de MiSI-Bench están en inglés).

## Casos de uso

- Evaluación de líneas base de VLM en biología estructural: sirve como referencia SFT para comparar futuros métodos de adaptación de dominio en tareas de interacción proteína-ligando, usando los 98 complejos retenidos como conjunto de evaluación limpio.
- Predicción de enlaces de hidrógeno residuo-ligando: el modelo alcanza 64,4 % de exact match en la tarea con enlace sobre los complejos retenidos, útil como punto de partida para herramientas de anotación asistida en pipelines de análisis estructural.
- Detección de localización de interacciones: con 58,4 % de exact match frente al 25 % de azar, puede emplearse para prefiltrar regiones candidatas de interacción antes de una inspección manual o de un método físico más costoso.
- Investigación sobre contaminación de benchmarks: el checkpoint y su split verificable (con hashes SHA-256 y script determinista) constituyen un material didáctico para estudiar cómo detectar y documentar fuga de datos en evaluaciones de VLM.
- Reproducción de experimentos de ajuste fino multimodal: la receta completa (ms-swift, ZeRO-2, hiperparámetros, tiempos) permite reproducir el entrenamiento en hardware de 8 GPU de 48 GB y medir el coste real de adaptar un VLM de 4B a un dominio científico.
- Estudio de congelación del codificador visual: al liberar el checkpoint con el encoder congelado y el merger ajustado, permite analizar qué parte del rendimiento en tareas visoespaciales proviene del encoder original frente al ajuste del lenguaje.
- Análisis de fallos en tareas geométricas: los resultados cercanos al azar en traslación (6,6 %), rotación (2,4 %) y zoom (4,1 %) lo convierten en un caso útil para estudiar por qué los VLM de 4B fallan en razonamiento espacial fino sobre imágenes científicas.

## Benchmarks y rendimiento

Resultados de exact match sobre los 98 complejos retenidos (evaluación limpia según el autor):

| Tarea (n) | Qwen3.5-4B sin tocar | Este modelo | Qwen2.5-VL-7B SFT del paper† | Azar |
|---|---|---|---|---|
| Enlaces H residuo-ligando, con enlace (312) | 0,0 | 64,4 | 63,5 | – |
| Enlaces H residuo-ligando, sin enlace (341) | 100 | 95,0 | 89,5 | – |
| Enlaces H pocket-ligando (84) | 0,0 | 11,9 | 10,7 | – |
| Localización de interacción (310) | 27,7 | 58,4 | 88,4 | 25 |
| Traslación (196) | 3,6 | 6,6 | 99,8* | ~6 |
| Rotación (294) | 1,0 | 2,4 | 99,7* | ~3 |
| Zoom (196) | 2,6 | 4,1 | 27,1* | ~5 |
| Traslación-rotación (57) | 24,6 | 22,8 | 88,4 | 25 |
| Rotación-rotación (294) | 20,4 | 28,9 | 89,6 | 25 |
| Docking (294) | 0,0 | 0,7 | 24,9 / 57,8* | – |

† Resultados del paper citados por el autor; el asterisco indica métricas con posible ambigüedad de evaluación según la model card. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9-10 GB solo para pesos (4,54 mil millones de parámetros × 2 bytes), más overhead de activaciones y del codificador visual; en la práctica, 12-16 GB para imágenes a resolución nativa.
- Cuantización a 8 bits: alrededor de 5 GB de pesos; a 4 bits: alrededor de 3 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: RTX 6000 Ada (48 GB) para entrenamiento; para inferencia, RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) con holgura.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 y en GPUs de 16 GB con cuantización; en GPUs de 12 GB probablemente solo con cuantización agresiva y resolución reducida.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según los tags; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. El entrenamiento completo (2 épocas, 10.005 preguntas) tardó 5,7 horas en 8 GPU RTX 6000 Ada, lo que da una referencia del coste de ajuste fino, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en MiSI-Bench (complejos retenidos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-MiSI-Bench-testsplit-SFT | 4,54 B | no disponible | 64,4 / 95,0 / 11,9 / 58,4 en tareas clave | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base sin ajustar) | 4,54 B | no disponible | 0,0 / 100 / 0,0 / 27,7 | Apache 2.0 | Hugging Face |
| Qwen2.5-VL-7B SFT (paper) | 7 B (aprox.) | no disponible | 63,5 / 89,5 / 10,7 / 88,4 | no disponible en la información | no disponible en la información |

La comparativa se limita a estos tres modelos porque la información proporcionada no incluye otros VLM especializados en interacción proteína-ligando. El modelo ajustado iguala al Qwen2.5-VL-7B SFT del paper en enlaces de hidrógeno residuo-ligando (64,4 frente a 63,5) y en pocket-ligando (11,9 frente a 10,7) con la mitad de parámetros, pero queda muy por detrás en localización de interacción (58,4 frente a 88,4) y en tareas geométricas.

## Limitaciones y advertencias

- Contaminación de benchmark: el modelo fue entrenado sobre 392 de los 490 complejos del test oficial de MiSI-Bench. Cualquier resultado reportado sobre el test oficial es inválido. La única evaluación limpia es sobre los 98 complejos retenidos en `misi_split/complex_split.json`.
- No usar para reportar resultados de MiSI-Bench: la model card lo advierte explícitamente; el checkpoint se libera por transparencia, no como modelo de referencia.
- Proyecto abandonado: es una línea base de un proyecto exploratorio detenido; no es un modelo fuerte ni ha pasado por etapas posteriores de mejora.
- Rendimiento débil en tareas geométricas: traslación (6,6 %), rotación (2,4 %) y zoom (4,1 %) están cerca del azar, lo que limita su uso en razonamiento espacial fino.
- Docking prácticamente nulo: 0,7 % de exact match, frente al 24,9-57,8 % del modelo del paper.
- Sesgo de respuesta en enlaces de hidrógeno: el 95,0 % de acierto en la clase "sin enlace" y el 11,9 % en pocket-ligando sugieren un fuerte desbalance hacia la predicción negativa en tareas difíciles.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas con respuesta numérica o espacial, el modelo puede generar valores plausibles sin base visual.
- Idiomas: no se declaran idiomas soportados; los prompts de entrenamiento están en inglés y no hay evidencia de generalización a otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la contaminación de datos y la advertencia de procedencia hacen desaconsejable su uso en producción sin una evaluación independiente sobre datos propios.
- Longitud de contexto: solo se conoce la longitud máxima de entrenamiento (16.384 tokens); la ventana nativa del modelo base no está confirmada en la información disponible.
- Resolución de imagen fija: entrenado con imágenes a 1160×803; no se ha validado con otras resoluciones o modalidades de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lancelot53/Qwen3.5-4B-MiSI-Bench-testsplit-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset MiSI-Bench: https://huggingface.co/datasets/zongzhao/MiSI-bench
- Repositorio del split (dentro del repo del modelo): carpeta `misi_split/` con `make_split.py`, `SHA256SUMS`, `complex_split.json` y `stats.json`
- Paper de MiSI-Bench: no disponible en la información proporcionada
- Blog o demo: no disponibles en la información proporcionada
