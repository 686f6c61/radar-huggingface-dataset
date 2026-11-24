# mlx-community/Holo-3.1-4B-8bit

## Resumen

Holo-3.1-4B es un modelo multimodal de tipo image-text-to-text desarrollado por H Company, especializado en la localización de elementos en pantallas e interacción con interfaces gráficas (GUI agents, computer use). El modelo original se distribuye bajo licencia Apache-2.0 y esta ficha describe la conversión a formato MLX en cuantización de 8 bits realizada por el equipo de mlx-community, pensada para ejecución eficiente en hardware Apple Silicon.

La arquitectura indicada en los metadatos es `qwen3_5`, con un total de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones). El modelo combina un torre de visión con un transformer de lenguaje e incorpora capas de tipo DeltaNet según la descripción de la conversión (se cuantizan atención, DeltaNet, MLP, embeddings y lm_head). Está orientado a tareas de agente: interpretar capturas de pantalla y devolver acciones como clics con coordenadas.

Su relevancia actual radica en que ofrece capacidades de computer use en un tamaño compacto (4B), lo que permite desplegarlo en un portátil con Apple Silicon manteniendo una precisión de clic del 86,5 % en el benchmark WebClick, prácticamente idéntica al modelo en bfloat16 (86,6 %). El idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (multimodal image-text-to-text, con capas DeltaNet) |
| Parametros totales | 4.539.265.536 (~4,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64 (torre de visión en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es `Hcompany/Holo-3.1-4B`, un modelo multimodal que procesa imágenes (capturas de pantalla) junto con texto y genera respuestas estructuradas, en particular coordenadas de localización de elementos. La arquitectura se etiqueta como `qwen3_5` e incluye capas DeltaNet, un mecanismo de atención lineal recurrente que reduce el coste de contexto largo frente a la atención cuadrática estándar. La conversión cuantiza atención, DeltaNet, MLP, embeddings y lm_head a 8 bits con grupo de 64, mientras que la torre de visión se mantiene en bfloat16.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo está afinado específicamente para tareas de agente y computer use, con un protocolo de localización publicado por H Company que usa coordenadas enteras en el rango [0, 1000] y decodificación con el modo thinking desactivado. La conversión se realizó con mlx-vlm 0.8.0 a partir de los pesos oficiales en bfloat16.

## Capacidades

- Localización de elementos en pantalla: devuelve coordenadas de clic en formato JSON (por ejemplo, `{"x":500,"y":204}`) a partir de una captura de pantalla y una instrucción.
- Comprensión de imágenes (image-text-to-text): interpreta capturas de interfaz de usuario en resoluciones como 1280x720 y 1920x1080.
- Agentes de computer use y GUI agents: diseñado para controlar interfaces mediante acciones de clic.
- Razonamiento multi-paso orientado a agentes (etiquetas `agent`, `action`).
- Procesamiento de múltiples imágenes en un mismo prompt (validado con 3 capturas de 1920x1080, ~12k tokens de prompt).
- Modo thinking configurable (desactivado en el protocolo de localización recomendado).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.

## Casos de uso

- Automatización de pruebas de interfaz de usuario: el modelo recibe una captura de la aplicación y una descripción del elemento objetivo, y devuelve las coordenadas para simular un clic, integrándose en pipelines de QA que validan flujos de UI de forma automática.
- Agentes de navegación web: con una precisión del 93,1 % en el subconjunto agentbrowse de WebClick, puede localizar enlaces y botones en páginas renderizadas para tareas de scraping guiado o rellenado de formularios.
- Asistentes de escritorio en local: al ocupar 6,9 GB de pico en memoria en un Apple M5 Max con cuantización de 8 bits, permite construir asistentes que controlan aplicaciones nativas sin enviar capturas a la nube.
- Automatización de tareas de calendario y productividad: el subconjunto calendars de WebClick (79,4 % de precisión) refleja su utilidad para localizar celdas, eventos y controles en vistas de calendario.
- Agentes RPA ligeros: sustituye selectores frágiles basados en DOM por localización visual, lo que resulta útil cuando la estructura HTML cambia pero la interfaz permanece visualmente estable.
- Evaluación e investigación en computer use: su tamaño de 4B y su licencia Apache-2.0 lo hacen adecuado como base para experimentos de fine-tuning en tareas de interacción con GUI.
- Procesamiento por lotes de capturas: con ~101-103 tok/s de decodificación y respuestas de ~14 tokens por clic, puede procesar grandes volúmenes de pantallas en local con latencia de primera ficha de 317 ms a 720p.

## Benchmarks y rendimiento

Benchmark WebClick (1639 muestras, protocolo oficial de H Company, thinking off, greedy, 32 tokens nuevos, coordenadas en [0, 1000]):

| Modelo | Precisión | IC 95 % |
|---|---|---|
| MLX bf16 | 86,6 % | 84,8 - 88,1 |
| MLX 8bit (este modelo) | 86,5 % | 84,7 - 88,0 |
| MLX 4bit | 85,8 % | 84,0 - 87,4 |

Desglose por subconjunto (este modelo): agentbrowse 93,1 % (n=590), calendars 79,4 % (n=528), humanbrowse 86,2 % (n=521). La diferencia de 8bit frente a bf16 es de -0,1 puntos (test exacto pareado, p = 0,80).

Velocidad en Apple M5 Max (128 GB, petición única, greedy):

| Motor | 1280x720: primer token / decodificación | 1920x1080: primer token / decodificación | Memoria |
|---|---|---|---|
| MLX, este modelo (8bit) | 317 ms / 103 tok/s | 1,12 s / 101 tok/s | 6,9 GB (pico) |

Con prompt largo de 3 capturas a 1920x1080 (~12k tokens de prompt, 1024 tokens generados): 4,3 s hasta el primer token, 90 tok/s de decodificación, 7,3 GB de pico.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 6,9 GB de pico para una captura a 720p o 1080p; 7,3 GB de pico con un prompt de 3 imágenes a 1080p (~12k tokens).
- Hardware validado: Apple M5 Max con 128 GB, mediante MLX 0.32.4 y mlx-vlm 0.8.0.
- GPU recomendadas: hardware Apple Silicon (la conversión es específica de MLX); no se proporcionan datos para GPU NVIDIA.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (el pico medido es de 6,9-7,3 GB).
- Opciones de despliegue: MLX mediante mlx-vlm (CLI `mlx_vlm.generate` o API de Python `load`/`generate`). No se indica soporte para vLLM, llama.cpp, Ollama o TGI en esta conversión.
- Latencia y throughput: 317 ms al primer token y 103 tok/s en 720p; 1,12 s al primer token y 101 tok/s en 1080p; 4,3 s al primer token y 90 tok/s con prompt multi-imagen largo. Las mediciones con asterisco en la model card presentan variación superior al 10 % y deben tomarse como indicativas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WebClick | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo-3.1-4B-8bit (MLX) | ~4,5 B | no disponible | 86,5 % | Apache-2.0 | Hugging Face (mlx-community) |
| Holo-3.1-4B (bf16) | ~4,5 B | no disponible | 86,6 % | Apache-2.0 | Hugging Face (Hcompany) |
| Holo-3.1-4B (MLX 4bit) | ~4,5 B | no disponible | 85,8 % | Apache-2.0 | Hugging Face (mlx-community) |

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría (computer use / GUI agents) para establecer una comparativa externa.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés, lo que limita su uso en aplicaciones en castellano sin adaptación.
- Precisión variable por dominio: la precisión cae al 79,4 % en el subconjunto calendars frente al 93,1 % en agentbrowse, por lo que el rendimiento depende fuertemente del tipo de interfaz.
- Riesgo de error en la localización: un fallo de pocos píxeles puede provocar clics en elementos incorrectos; se recomienda validación y mecanismos de recuperación en producción.
- Riesgo de alucinación: no se documenta en la información disponible, pero es inherente a los modelos generativos; las coordenadas devueltas deben validarse contra el rango [0, 1000] y los límites de la imagen.
- Longitud de contexto: no disponible; el rendimiento con prompts largos solo está validado hasta ~12k tokens en las pruebas publicadas.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse la atribución y las condiciones de la licencia original.
- Específico de plataforma: esta conversión requiere MLX y hardware Apple Silicon; para otros entornos debe usarse el modelo base o generar nuevas conversiones.
- Las pruebas de velocidad presentan variabilidad superior al 10 % en algunos casos y se midieron en un único equipo (M5 Max), por lo que no deben extrapolarse sin cautela.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso comunitario.

## Enlaces

- Modelo en Hugging Face (esta conversión): https://huggingface.co/mlx-community/Holo-3.1-4B-8bit
- Modelo base original: https://huggingface.co/Hcompany/Holo-3.1-4B
- H Company: https://www.hcompany.ai/
- Documentación de localización de elementos (H Company): https://hub.hcompany.ai/models-api/element-localization
- Dataset WebClick: https://huggingface.co/datasets/Hcompany/WebClick
