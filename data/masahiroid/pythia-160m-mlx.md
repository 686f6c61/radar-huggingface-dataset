# masahiroid/pythia-160m-mlx

## Resumen

`masahiroid/pythia-160m-mlx` es una conversión comunitaria al formato MLX de `EleutherAI/pythia-160m`, el modelo de 160 millones de parámetros de la suite Pythia de EleutherAI. El recuento real de parámetros según los pesos safetensors publicados es de 162.322.944. Pythia es una familia diseñada explícitamente para investigación en interpretabilidad y en dinámicas de entrenamiento: sus ocho tallas (70M, 160M, 410M, 1B, 1,4B, 2,8B, 6,9B y 12B) se entrenaron con el mismo orden de datos y la misma arquitectura, lo que permite comparaciones controladas entre escalas. La conversión la publica el usuario masahiroid y no es un lanzamiento oficial de EleutherAI.

Técnicamente es un transformer causal de tipo GPT-NeoX (`gpt_neox`) en precisión float16, empaquetado para el framework MLX de Apple. El autor reporta un pico de memoria medido de aproximadamente 0,35 GB y el repositorio ocupa 0,3 GB, por lo que se ejecuta sin problema en cualquier Mac con Apple Silicon y 8 GB de memoria unificada. Solo admite inglés y se distribuye bajo licencia Apache-2.0.

Su relevancia es práctica y científica: al ser un modelo base sin ajuste por instrucciones, continúa texto en lugar de seguir órdenes de chat. Esto lo hace útil como banco de pruebas reproducible de bajo coste, para validar flujos de trabajo con MLX antes de escalar a modelos mayores y para experimentos de interpretabilidad donde el control del orden de datos importa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-NeoX (`gpt_neox`), decoder-only |
| Parámetros totales | 162.322.944 (denominación comercial: 160M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha del autor; la documentación de la suite Pythia de EleutherAI indica 2048 tokens para esta familia |
| Tipos de cuantización | float16 (única precisión publicada en este repositorio); no se incluyen pesos GGUF ni otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX, float16 |
| Framework de ejecución | MLX (`mlx-lm`) |
| Modelo base | `EleutherAI/pythia-160m` |
| Tamaño del repositorio | 0,3 GB |
| Memoria pico (medida por el autor) | ~0,35 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 30-09-2026 / 30-09-2026 |

## Arquitectura y entrenamiento

El modelo es una conversión directa de pesos, no un reentrenamiento: se toma `EleutherAI/pythia-160m`, se transforman sus pesos al formato de MLX y se guardan en float16. La arquitectura subyacente es un transformer decoder-only de estilo GPT-NeoX, con atención causal completa y sin mecanismos de atención lineal, MoE ni estado recurrente. No se ha aplicado ningún ajuste posterior, ni RLHF, ni DPO, ni instruction tuning sobre esta copia.

El entrenamiento original de Pythia, documentado por EleutherAI, se realizó sobre The Pile, con dos variantes por cada talla: una entrenada sobre el corpus tal cual y otra sobre una versión con deduplicación global. La característica metodológica central de la suite es que todas las escalas comparten el mismo orden de datos, lo que convierte a estos modelos en una referencia habitual para estudiar cómo evolucionan los circuitos internos, las curvas de pérdida y determinados sesgos en función del tamaño. EleutherAI publicó además una revisión (`EleutherAI/pythia-160m-v0`) para corregir inconsistencias en las ejecuciones originales. No se especifica en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto en inglés mediante continuación de contexto (modelo base, no instruct).
- Predicción del siguiente token y cálculo de perplejidad sobre corpus en inglés.
- Extracción de representaciones internas, mapas de atención y activaciones para análisis de interpretabilidad.
- Ejecución de inferencia local en Apple Silicon a través de MLX, incluyendo generación con muestreo configurable (temperatura, top-k, top-p) desde `mlx-lm`.
- Ajuste fino ligero opcional con `mlx-lm` (por ejemplo LoRA) sobre el propio modelo convertido.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso con planificación.
- No dispone de modo de razonamiento explícito (thinking mode), ni de visión, ni de audio.
- Capacidad multilingüe muy limitada: el modelo está etiquetado únicamente como inglés.

## Casos de uso

- Investigación en interpretabilidad: analizar patrones de atención, circuitos y representaciones internas en un modelo minúsculo y reproducible, aprovechando que la suite Pythia comparte orden de datos entre escalas para poder aislar el efecto del tamaño.
- Validación de pipelines MLX: probar `mlx_lm.generate`, el servidor local y flujos de cuantización en un Mac antes de trasladar el mismo pipeline a modelos de mayor tamaño, con un coste de memoria de apenas 0,35 GB.
- Docencia y formación técnica: ilustrar de forma tangible la tokenización, la decodificación autoregresiva, el efecto de la temperatura y el sesgo de repetición en un modelo que cabe en cualquier portátil.
- Pruebas de estrés de infraestructura: medir latencia, throughput y uso de memoria de MLX frente a PyTorch o llama.cpp con una carga conocida y un consumo despreciable.
- Experimentos de sesgo y análisis de corpus: estudiar qué asociaciones aprende un modelo entrenado sobre The Pile y qué limitaciones aparecen a escala de 160M, sin necesidad de infraestructura de GPU.
- Generación de texto en local sin conexión: autocompletado, generación de borradores o texto de relleno en inglés en entornos air-gapped donde no se permite enviar datos a servicios externos.
- Ajuste fino de bajo coste: servir como punto de partida para LoRA o adaptadores ligeros en MLX, ya que el modelo completo se carga en memoria con holgura.
- Pruebas de regresión en herramientas: usar la generación como salida determinista de referencia (con semilla fija) para verificar que una actualización de librería no cambia el comportamiento de la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta un pico de memoria de ~0,35 GB en las pruebas realizadas. Tampoco hay cifras publicadas de latencia ni de throughput para esta conversión concreta. No se reproducen aquí los resultados del paper de Pythia porque no forman parte de la información proporcionada.

## Requisitos de hardware

- Peso de los parámetros en float16: aproximadamente 325 MB (162,3 millones de parámetros × 2 bytes), coherente con un repositorio de 0,3 GB.
- Memoria pico medida por el autor: ~0,35 GB, incluyendo activaciones y estructuras de inferencia.
- Cabe sin dificultad en cualquier Mac con Apple Silicon (M1 o posterior) con 8 GB de memoria unificada, y también en Macs Intel con memoria suficiente si se usa una ruta alternativa, aunque MLX está optimizado para Apple Silicon.
- En GPU de consumo: el modelo es trivialmente pequeño, así que cualquier GPU con 1-2 GB de VRAM libre lo ejecuta; para ello conviene usar los pesos originales PyTorch del modelo base, ya que esta conversión está orientada a MLX.
- Despliegue en MLX: `mlx-lm`, tanto por línea de comandos (`mlx_lm.generate --model masahiroid/pythia-160m-mlx`) como por API Python (`from mlx_lm import load, generate`); existe además un servidor local compatible con la API de OpenAI dentro del ecosistema `mlx-lm`.
- Despliegue fuera de MLX: usar `EleutherAI/pythia-160m` con `transformers`, vLLM, TGI o llama.cpp. No se publican pesos GGUF en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `masahiroid/pythia-160m-mlx` | 162.322.944 | no disponible | Apache-2.0 | safetensors MLX, fp16 | Repositorio comunitario, 0 descargas |
| `EleutherAI/pythia-160m` | 160M (nominal) | no disponible en la información disponible | Apache-2.0 | safetensors PyTorch | Repositorio oficial de EleutherAI |
| `EleutherAI/pythia-160m-deduped` | 160M (nominal) | no disponible en la información disponible | Apache-2.0 | safetensors PyTorch | Repositorio oficial, variante con deduplicación |
| `EleutherAI/pythia-160m-v0` | 160M (nominal) | no disponible en la información disponible | Apache-2.0 | safetensors PyTorch | Ejecución original, previa a la corrección de inconsistencias |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia, formato y disponibilidad. Para otras alternativas de tamaño similar fuera de la suite Pythia, no disponible.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responde a preguntas ni sigue órdenes de chat, solo continúa texto. Usarlo como asistente conversacional produce resultados pobres.
- Ausencia total de alineación (sin RLHF ni DPO): puede generar contenido sesgado, ofensivo, factualmente falso o directamente incoherente.
- Riesgo elevado de alucinación y de degradación del texto más allá de unas pocas decenas o cientos de tokens, coherente con una escala de 160M parámetros.
- Sesgos heredados de The Pile: corpus mayoritariamente web y en inglés, con sobrerrepresentación de determinados dominios y puntos de vista.
- Idioma: únicamente inglés. El rendimiento en castellano o en cualquier otra lengua no está soportado ni validado.
- Longitud de contexto no declarada en la ficha; conviene consultar la documentación del modelo base antes de diseñar flujos con ventanas largas.
- Licencia Apache-2.0 en el modelo base y en esta conversión, lo que en principio permite uso comercial, pero el repositorio es una conversión no oficial, sin garantías, sin soporte y sin validación por parte de EleutherAI.
- Discrepancia en los metadatos de HuggingFace: la etiqueta `base_model:finetune:EleutherAI/pythia-160m` sugiere un ajuste fino, mientras que la model card describe una conversión directa de pesos. No hay evidencia de entrenamiento adicional.
- Repositorio con 0 descargas y 0 likes: no existe validación externa sobre la fidelidad de la conversión respecto a los pesos originales.
- Sin soporte de tool calling, agentes, visión, audio ni razonamiento multi-paso: cualquier caso de uso que dependa de estas capacidades debe descartarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/pythia-160m-mlx
- Modelo base `EleutherAI/pythia-160m`: https://huggingface.co/EleutherAI/pythia-160m
- Variante con deduplicación: https://huggingface.co/EleutherAI/pythia-160m-deduped
- Ejecución original v0: https://huggingface.co/EleutherAI/pythia-160m-v0
- Repositorio de la suite Pythia en GitHub: https://github.com/EleutherAI/pythia
- Framework MLX: https://github.com/ml-explore/mlx
- MLX-LM (paquete `mlx-lm` usado en los ejemplos): https://github.com/ml-explore/mlx-lm
- Ficha de Inferix sobre pythia-160m: https://inferix.co/models/EleutherAI/pythia-160m
- Ficha de AI Indigo sobre pythia-160m: https://aiindigo.com/tool/pythia-160m
- Paper de Pythia (referenciado en la documentación del modelo base): https://arxiv.org/abs/2304.01373
