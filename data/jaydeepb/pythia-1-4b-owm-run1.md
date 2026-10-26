# jaydeepb/pythia-1.4b-owm-run1

## Resumen

`jaydeepb/pythia-1.4b-owm-run1` es un ajuste fino de `EleutherAI/pythia-1.4b` (1.414.647.808 parámetros) entrenado durante una época sobre una muestra de 1 millón de secuencias de 128 tokens del corpus matemático OpenWebMath. Lo publica el usuario `jaydeepb` como artefacto de investigación, no como modelo de propósito general: su función es servir de base para extraer etiquetas de memorización extraíble (*extractable memorization*, k=50, l=50 greedy) con las que entrenar un clasificador que prediga qué contenido memoriza un modelo de lenguaje.

El interés del artefacto es metodológico. El autor publica un par de modelos gemelos: este `run1`, del que se derivan las etiquetas de entrenamiento del clasificador, y un `run2` ajustado sobre una muestra disjunta de otros 1 millón de secuencias que actúa como conjunto de evaluación held-out limpio. Esa separación entre muestra de etiquetado y muestra de evaluación evita la fuga de información que invalidaría la mayoría de experimentos de memorización.

Arquitectura y tamaño son, por tanto, los del Pythia-1.4B original: transformer causal tipo GPT-NeoX, denso, con 2048 tokens de contexto y licencia Apache 2.0. El modelo no está alineado, no sigue instrucciones y no se ha evaluado en benchmarks estándar; su valor está en la trazabilidad del pipeline de ajuste (1 época, longitud 128, lr 5e-5, schedule coseno, semilla 42) y en la disponibilidad de los pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso, familia GPT-NeoX (`gpt_neox`) |
| Parametros totales | 1.414.647.808 (según safetensors); ~1,2 B no-embedding |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens en el modelo base; el ajuste fino se realizó con secuencias de 128 tokens |
| Tipos de cuantizacion | No disponible en la model card; los pesos publicados son compatibles con cuantización posterior a int8/int4 vía herramientas externas |
| Idiomas soportados | No disponibles (el modelo base se entrenó mayoritariamente con texto en inglés de The Pile) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 2,8 GB, consistente con fp16) |

## Arquitectura y entrenamiento

La arquitectura es la del Pythia-1.4B de EleutherAI: transformer decoder-only con atención causal completa, activación GeLU, rotary embeddings y tokenizador GPT-NeoX, diseñado explícitamente para investigación en interpretabilidad y leyes de escala. El modelo base se preentrenó sobre The Pile (300B tokens) y se publica con 143 checkpoints intermedios, lo que lo convierte en una referencia habitual en estudios de evolución del conocimiento durante el entrenamiento.

El ajuste fino de este artefacto es deliberadamente simple y reproducible: 1 época sobre 1 millón de secuencias de 128 tokens muestreadas de OpenWebMath, learning rate 5e-5 con schedule coseno y semilla 42. No hay RLHF, DPO ni instrucción supervisada; el objetivo no es mejorar la calidad del texto generado, sino producir un modelo con un perfil de memorización controlado y comparable. La innovación no está en el entrenamiento sino en el diseño experimental: las etiquetas de memorización extraíble (k=50, l=50, decodificación greedy) extraídas de este `run1` entrenan un clasificador de predicción de memorización, y el modelo `run2` —ajustado sobre una muestra disjunta de 1M de secuencias— proporciona la evaluación held-out. Con ~128M de tokens vistos en una sola época, el régimen de entrenamiento queda muy lejos del sobreajuste masivo que se usa en estudios clásicos de memorización, lo que hace el experimento útil precisamente para el régimen intermedio.

## Capacidades

- Generación de texto autorregresiva en estilo de texto matemático web (definiciones, derivaciones, fragmentos LaTeX), heredada de la distribución de OpenWebMath.
- Continuación de texto con contexto efectivo corto: el ajuste se hizo con secuencias de 128 tokens, por lo que la coherencia más allá de ese horizonte no está garantizada.
- Exposición controlada a memorización: el modelo está pensado para que su contenido memorizado sea medible y etiquetable, no para maximizar capacidades.
- Sirve como generador de pares (prefijo, sufijo) para experimentos de memorización extraíble con decodificación greedy.
- No soporta tool calling ni function calling: no hay plantilla de herramientas ni entrenamiento asociado.
- No soporta agentes, razonamiento multi-paso guiado ni modos de pensamiento (*thinking*).
- No es un modelo de instrucciones ni de chat; no hay formato de diálogo definido.
- Capacidades multilingües: no documentadas; el corpus de ajuste y el preentrenamiento son predominantemente en inglés.
- No dispone de visión, audio ni modalidades adicionales.

## Casos de uso

- Investigación en memorización: generar continuaciones greedy para un conjunto de prefijos y etiquetar qué segmentos se reproducen literalmente del corpus de entrenamiento, usando el protocolo k=50/l=50 descrito por el autor.
- Entrenamiento de clasificadores de predicción de memorización: este `run1` produce las etiquetas supervisadas, que después se validan contra `run2` sobre una muestra disjunta de OpenWebMath.
- Estudio de contaminación de datasets: comparar qué fragmentos de OpenWebMath quedan memorizados tras una sola época y 128M de tokens vistos, para calibrar umbrales de detección de contaminación en corpus matemáticos.
- Análisis de leyes de escala en memorización: al compartir arquitectura y tokenizador con el resto de la suite Pythia (410M, 1.4B, 2.8B), permite replicar el mismo pipeline a distintos tamaños y comparar tasas de memorización.
- Reproducibilidad de pipelines de ajuste fino: la configuración explícita (lr 5e-5, coseno, semilla 42, seq len 128) sirve como referencia para validar infraestructuras de entrenamiento antes de escalar.
- Docencia y divulgación técnica: ejemplo compacto y de 2,8 GB para ilustrar en un seminario cómo se diseña un experimento con muestra de etiquetado y muestra de evaluación separadas.
- Línea base en experimentos de atribución: comparar métodos de atribución de influencia de datos (influence functions, TracIn) contra la memorización extraíble medida directamente en este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de perplejidad sobre OpenWebMath; únicamente documenta la configuración de entrenamiento y la obtención de etiquetas de memorización extraíble (k=50, l=50 greedy).

## Requisitos de hardware

- Pesos en fp16: ~2,83 GB (coherente con un repo de 2,8 GB). VRAM estimada para inferencia en batch 1 con contexto de 2048 tokens: ~4-5 GB incluyendo caché KV y overhead del runtime.
- Cuantización int8: ~1,5-2 GB de VRAM. Cuantización int4 (GGUF/AWQ/GPTQ, previa conversión): ~1-1,2 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070/4080/4090. También en GPUs de 4 GB con cuantización int4 y contexto corto.
- GPU de datacenter: A100/H100 innecesarias para inferencia; solo se justifican si se generan millones de continuaciones en paralelo para etiquetado masivo.
- Despliegue: transformers (biblioteca nativa), TGI (el repo está etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM (soporta GPT-NeoX), llama.cpp/Ollama tras convertir a GGUF. Para lotes grandes de generación greedy, vLLM ofrece mejor throughput que transformers.
- Throughput y latencia: no disponibles como medición publicada. Como estimación de orden de magnitud, un modelo denso de 1,4B en fp16 sobre una RTX 4090 suele moverse en el rango de 100-200 tokens/s en batch 1; no es un dato medido para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jaydeepb/pythia-1.4b-owm-run1` | 1,41 B | 2048 (128 en ajuste fino) | 1 época sobre 1M secuencias de 128 tokens de OpenWebMath | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| `EleutherAI/pythia-1.4b` | 1,41 B | 2048 | Preentrenamiento sobre The Pile, 300B tokens, 143 checkpoints | Apache 2.0 | Hugging Face, ampliamente utilizado |
| `EleutherAI/pythia-410m` | 410 M | 2048 | Preentrenamiento sobre The Pile, 300B tokens | Apache 2.0 | Hugging Face |
| `EleutherAI/pythia-2.8b` | ~2,78 B | 2048 | Preentrenamiento sobre The Pile, 300B tokens | Apache 2.0 | Hugging Face |

No se han identificado en la información proporcionada otros ajustes finos de memorización directamente comparables; los hermanos Pythia se incluyen por compartir arquitectura, tokenizador y licencia, lo que permite comparaciones controladas de tamaño y régimen de entrenamiento.

## Limitaciones y advertencias

- No es un modelo de propósito general: no está alineado, no sigue instrucciones y no debe desplegarse en atención al cliente, asistentes o generación de código en producción.
- Ventana efectiva de 128 tokens durante el ajuste fino: más allá de ese horizonte la coherencia decae y no hay garantía de consistencia en generaciones largas.
- Entrenamiento muy corto (~128M de tokens vistos en una época), lo que limita la profundidad del ajuste y hace que el comportamiento dependa en gran medida del modelo base.
- Sesgos heredados de The Pile y de OpenWebMath: distribución predominantemente inglesa, sobrerrepresentación de texto matemático y de determinadas fuentes web, y sesgos propios de los corpus rastreados.
- Riesgo de alucinación alto: el modelo puede generar afirmaciones matemáticas plausibles pero falsas; no hay verificación formal ni entrenamiento con feedback.
- Idiomas soportados no documentados; el rendimiento fuera del inglés no está evaluado.
- Sin métricas publicadas: no hay benchmarks que permitan afirmar calidad o superioridad frente a alternativas, por lo que cualquier uso que dependa de exactitud matemática requiere evaluación propia.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el autor no ofrece garantías ni soporte; la responsabilidad sobre el uso recae en el integrador.
- Trazabilidad limitada: 0 descargas y 0 likes, sin issues ni documentación adicional más allá de la model card; conviene fijar el commit exacto antes de reproducir experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaydeepb/pythia-1.4b-owm-run1
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- README del modelo base: https://huggingface.co/EleutherAI/pythia-1.4b/blob/main/README.md
- Repositorio del proyecto Pythia: https://github.com/EleutherAI/pythia
- Paper de Pythia (arXiv 2304.01373): https://arxiv.org/abs/2304.01373
- Dataset OpenWebMath: https://huggingface.co/datasets/open-web-math/open-web-math
- Paper de OpenWebMath (arXiv 2310.06786): https://arxiv.org/abs/2310.06786
- Ficha descriptiva de Pythia-1.4B en AI Base: https://model.aibase.com/models/details/1915694004370563074
