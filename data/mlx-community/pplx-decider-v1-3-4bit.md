# mlx-community/pplx-decider-v1.3-4bit

## Resumen

`mlx-community/pplx-decider-v1.3-4bit` es la conversión a 4 bits para Apple Silicon (MLX) del modelo `perplexity-ai/pplx-decider-v1.3` de Perplexity AI. No es un modelo generativo de chat: es un clasificador multimodal que recibe un *estado* (texto, JSON y/o imágenes) y una o varias *preguntas*, y devuelve en un único forward pass probabilidades calibradas sobre las opciones de cada pregunta. Cubre cuatro tipos de pregunta: `choice` (1 a 255 opciones), `noul` (probabilidad de verdadero), `score` (nivel esperado sobre 2 a 255 niveles ordenados) y `locate` (extracción de spans verbatim con offsets de carácter).

La arquitectura combina 16 capas de atención completa **no causal** con 48 capas Gated DeltaNet causales, sobre un total de 4.488.018.160 parámetros. La cabeza de salida no es un vocabulario sino un *readout* de decisión de 255 filas almacenado en `language_model.lm_head`, leído en el marcador `<|fim_suffix|>` de cada pregunta y con softmax restringido a las opciones de esa pregunta a una temperatura de calibración fija de `1.2264`.

Es relevante porque ofrece un patrón distinto al de los LLM generativos para tareas de enrutamiento, moderación y extracción estructurada: una sola pasada, sin decodificación, con probabilidades calibradas y soporte de imágenes. La conversión MLX añade un script de inferencia autónomo y un pequeño servidor HTTP, e incluye el adaptador LoRA de Locate (rank 64, ~1,9 GB) que se carga bajo demanda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas de atención completa no causal + 48 capas Gated DeltaNet causales (familia `qwen3_5`) |
| Parametros totales | 4.488.018.160 |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits (MLX); el repo base ofrece otros formatos no detallados aquí |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), requiere código custom (`decider_mlx.py`) |
| Libreria | mlx / mlx-vlm |
| Pipeline | text-classification |
| Tamano del repo | 17,3 GB |
| Memoria en reposo | 15,4 GB |
| Temperatura de calibracion | 1.2264 |
| Cabecera de salida | readout de decisión de 255 filas (`language_model.lm_head`) |
| Adaptador Locate | LoRA sin fusionar, rank 64, embedding `<|locate|>` y span head (~1,9 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido con dos tipos de capa intercalados: 16 capas de atención completa que operan de forma **no causal** (cada token ve la secuencia completa, solo se enmascara el padding) y 48 capas Gated DeltaNet que permanecen causales. Esta asimetría es deliberada y crítica: con una máscara causal estándar, la respuesta top cambia en 16 de 115 preguntas de prueba y la divergencia media medida en KL es de 0,076 frente a 0,005 del modelo correcto. Por eso `mlx_lm.load` y `mlx_vlm.load` no producen resultados válidos con este checkpoint.

La salida no es generativa. El modelo lee un *readout* de decisión de 255 filas en el marcador `<|fim_suffix|>` de cada pregunta y aplica softmax únicamente sobre las opciones de esa pregunta, a temperatura de calibración 1.2264. El prompt sigue el protocolo fragmentado de v1.3: el estado y cada pregunta se tokenizan por separado. El adaptador de Locate (LoRA rank 64 sin fusionar, embedding `<|locate|>` entrenado y span head) se carga en la primera petición de tipo `locate` y se desactiva para las preguntas de decisión, de modo que no afecta a estas. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Clasificación por elección (`choice`): entre 1 y 255 opciones con descripción opcional; devuelve `choice`, `probabilities` y `confidence`.
- Pregunta binaria (`noul`): devuelve P(verdadero), con descripciones opcionales para `true` y `false`.
- Puntuación ordinal (`score`): entre 2 y 255 niveles ordenados de menor a mayor; devuelve nivel esperado, probabilidades, leyenda y confianza.
- Extracción de spans (`locate`): devuelve `start`, `end`, `text` y `score` con offsets de carácter verificables (`state[start:end] == text`).
- Multimodal: acepta imágenes como rutas de fichero, URLs `data:image/...` o imágenes PIL, combinables con texto y JSON en el estado (no compatible con `locate`).
- Múltiples preguntas por petición, con dos modos: `separate` (una secuencia por pregunta, el evaluado por Perplexity) e `isolated` (una secuencia por petición, mucho más barato pero con deriva del 1,5-2,2% en respuestas top).
- Procesamiento por lotes: `decide` acepta una lista de peticiones y devuelve una lista en el mismo orden.
- Acceso a logits crudos por pregunta mediante `decider.logits(requests)`.
- Interfaz CLI y servidor HTTP pequeño incluidos en el repositorio.
- No soporta tool calling, agentes ni generación de texto: no hay paso de decodificación.

## Casos de uso

- **Enrutamiento de tickets de soporte**: clasificar cada mensaje entrante en equipos (facturación, soporte técnico, ventas) con `choice` y usar `confidence` para derivar a revisión humana los casos por debajo de un umbral. La calibración a temperatura fija hace que las probabilidades sean directamente utilizables como umbral.
- **Detección de spam y abuso**: preguntas `noul` sobre mensajes de usuario ("¿es spam?", "¿es abusivo?") en una sola pasada, sin coste de generación, adecuado para filtrado de alto volumen.
- **Medición de sentimiento ordinal**: usar `score` con niveles como `["calm", "mildly annoyed", "frustrated", "angry"]` para obtener un nivel esperado continuo en lugar de una etiqueta discreta, útil en análisis de conversaciones de atención al cliente.
- **Extracción de entidades verbatim**: `locate` para localizar códigos de error, identificadores, importes o fechas en el texto con offsets exactos, apto para pipelines que necesitan trazabilidad al carácter original.
- **Moderación multimodal**: clasificar publicaciones que combinan texto e imágenes (por ejemplo, capturas de pantalla o gráficos) con preguntas `choice` sobre categorías de política.
- **Enrutamiento de consultas en un RAG**: decidir qué índice o herramienta corresponde a una consulta antes de invocar un LLM generativo, reduciendo el coste total del pipeline al resolver la decisión con un forward pass.
- **Etiquetado de datasets a escala**: procesar lotes de peticiones con `mode="isolated"` cuando varias preguntas comparten el mismo estado, con un coste mucho menor (9,3 s para 32 preguntas sobre 4.000 tokens en un M5 Max frente a 232 s en `separate`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de la conversión y tiempos de inferencia:

| Metrica | Valor |
|---|---|
| Divergencia KL media frente al modelo original | 0,005 |
| Divergencia KL con mascara causal incorrecta | 0,076 |
| Preguntas con respuesta top alterada por mascara causal | 16 de 115 |
| Deriva de respuestas top en modo `isolated` | 1,5-2,2% |

Tiempos por petición en un Apple M5 Max con este checkpoint:

| Estado | Preguntas | `separate` | `isolated` |
|---|---|---|---|
| 200 tokens | 8 | 3,9 s | 0,9 s |
| 1.000 tokens | 8 | 15,2 s | 2,5 s |
| 4.000 tokens | 8 | 58 s | 7,5 s |
| 4.000 tokens | 32 | 232 s | 9,3 s |

## Requisitos de hardware

- **Memoria**: 15,4 GB en reposo con cuantización de 4 bits; más para entradas largas o peticiones `locate`. Se recomiendan 32 GB de memoria unificada; 24 GB basta para entradas de texto cortas.
- **Plataforma**: exclusivamente Apple Silicon con MLX. No hay ruta CUDA en esta conversión (la ruta rápida CUDA del modelo original no está incluida).
- **GPU**: no aplica el catálogo habitual (A100, H100, RTX 4090); el modelo corre sobre GPU integrada de Apple. Los tiempos reportados corresponden a un M5 Max.
- **Consumer GPU**: sí, en el sentido de que cabe en un Mac con 24-32 GB de memoria unificada; no está pensado para GPUs discretas NVIDIA en este formato.
- **Despliegue**: script `decider_mlx.py` (CLI y servidor HTTP incluidos), librería `mlx` y `mlx-vlm`. No compatible con vLLM, llama.cpp, Ollama ni TGI. Requiere Python 3.12+ y no necesita torch.
- **Latencia y throughput**: ver tabla de la sección anterior; el modo `isolated` reduce el coste entre 4 y 25 veces cuando varias preguntas comparten estado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mlx-community/pplx-decider-v1.3-4bit` | 4,49 B | no disponible | Clasificador multimodal no generativo | Apache 2.0 | MLX (Apple Silicon) |
| `perplexity-ai/pplx-decider-v1.3` | no disponible | no disponible | Clasificador multimodal, incluye ruta CUDA | Apache 2.0 | Pesos originales, paquete `pplx_decider` |
| LLM generativos de ~4 B (familia Qwen3 y similares) | ~4 B | variable | Generativos con decodificación | variable | Amplia (GGUF, safetensors, vLLM) |

La comparación con LLM generativos del mismo orden de parámetros no es directa: `pplx-decider` no genera texto, sino que produce probabilidades calibradas en una sola pasada, lo que cambia el perfil de coste y la forma de integrarlo. No se dispone de datos de benchmarks que permitan comparar calidad frente a alternativas.

## Limitaciones y advertencias

- **No es un modelo de chat**: no genera texto, no soporta tool calling ni razonamiento multi-paso. Cualquier uso que requiera generación es inadecuado.
- **Código obligatorio**: `mlx_lm.load` y `mlx_vlm.load` producen resultados incorrectos. Es imprescindible usar `decider_mlx.py` o el paquete oficial `pplx_decider`.
- **Sesgos**: no se documentan en la información proporcionada; al ser un clasificador calibrado sobre datos de Perplexity, hereda los sesgos de su distribución de entrenamiento, que no se detalla.
- **Alucinación**: al no haber generación libre, el riesgo se traslada a falsos positivos en `locate` y a confianza mal calibrada fuera de la distribución de entrenamiento. Los spans de `locate` son verificables por offsets, lo que permite validación automática.
- **Idiomas**: no disponibles; no se puede asumir cobertura multilingüe sin evaluación propia.
- **Contexto**: la longitud máxima no se especifica; los tiempos reportados llegan a 4.000 tokens de estado, pero no se confirma ese valor como límite.
- **Modo `isolated`**: altera las respuestas top en un 1,5-2,2% de los casos; no debe usarse si se requiere reproducibilidad exacta respecto a la evaluación de Perplexity.
- **Locate**: incompatible con imágenes; el adaptador (~1,9 GB adicionales) se carga en la primera petición y consume memoria extra.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `perplexity-ai/pplx-decider-v1.3` por si añaden restricciones.
- **Plataforma**: sin soporte CUDA en esta conversión; en producción sobre NVIDIA hay que usar los pesos originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/pplx-decider-v1.3-4bit
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.3
- MLX: https://github.com/ml-explore/mlx
