# divinetribe/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-8bit

## Resumen

NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-8bit es una conversión comunitaria del modelo multimodal Nemotron-3.5 Bolt 74B-A9B de NVIDIA, realizada por el usuario divinetribe para su ejecución en Apple Silicon mediante la librería MLX. El modelo original es un transformer híbrido de tipo MoE (mezcla de expertos) combinado con capas Mamba2 y de atención, con un total de 74.885 millones de parámetros y aproximadamente 9.000 millones activos por token (según la nomenclatura A9B del nombre). Incorpora además un codificador visual RADIO para tareas de imagen y vídeo, lo que lo convierte en un modelo image-text-to-text completo.

La relevancia de esta ficha reside en que la conversión permite ejecutar localmente un modelo de 74B con capacidades multimodales, tool calling y contexto largo en un Mac de 128 GB de memoria unificada, algo que hasta hace poco requería hardware de datacenter. El autor ha portado manualmente la arquitectura `nemotron_h_omni` a mlx-vlm, ya que la librería estándar aún no la soporta de forma nativa.

El modelo se distribuye en cuantización 8-bit afín con grupo de 64, manteniendo la torre visual, el proyector y la cabeza de salida en bf16. El repositorio ocupa unos 81 GB y requiere un Mac con 128 GB de memoria unificada para funcionar. La licencia es OpenMDW 1.1, heredada del modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: capas Mamba2 + atención + MoE (conteo de expertos variable por capa), más codificador visual RADIO |
| Parametros totales | 74.885.081.096 (≈74,9B) |
| Parametros activos | ≈9B (según nomenclatura A9B; no confirmado numéricamente en la información disponible) |
| Longitud de contexto | Hasta 128K tokens (probado a 32K y 128K en la model card) |
| Tipos de cuantizacion | 8-bit afín, group size 64; torre visual, proyector y cabeza de salida en bf16 |
| Idiomas soportados | No disponibles en la información proporcionada (se probaron español, japonés y chino con resultados correctos) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (formato MLX), 1.863 tensores |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 |
| Tamaño del repositorio | ≈80,9 GB |
| Capas | 88 capas totales, de las cuales solo 8 son de atención |
| Descargas | 1.202 (en el momento de la consulta) |

## Arquitectura y entrenamiento

La arquitectura es un híbrido poco convencional: combina capas Mamba2 (state space model) con capas de atención y capas MoE, y el número de expertos varía por capa. Según la model card, solo 8 de las 88 capas son de atención, lo que explica que una caché de 128K ocupe apenas unos 1 GB. El modelo incorpora un codificador visual RADIO y un proyector multimodal, con soporte de vídeo mediante poda de tokens (token pruning) configurable con `video_pruning_rate=` (0,7 por defecto), siguiendo la implementación de referencia de NVIDIA. No dispone de torre de audio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada; la model card remite al modelo base de NVIDIA para esos detalles. La conversión a MLX no altera el comportamiento ni la alineación del modelo original. El autor verificó la fidelidad de la conversión comparando contra el código de referencia en fp32 de NVIDIA: los pesos mapean tensor a tensor por nombre y forma, la torre visual alcanza coseno 0,99998, el proyector 0,99995, las 88 capas del modelo de lenguaje mantienen coseno ≥0,9993, y los logits finales alcanzan coseno 0,999997 con KL de 0,00075 y coincidencia en el top-1. En vídeo, los embeddings MLX alcanzan coseno 0,99981 y la máscara de poda coincide al 100% con la de NVIDIA. El modelo soporta modo thinking activable mediante `enable_thinking` en la plantilla de chat.

## Capacidades

- Generación de texto y razonamiento: resuelve correctamente problemas tipo bat-and-ball (0,05 $) con thinking activado y desactivado.
- Comprensión de imágenes: descripción de fotos, conteo de objetos, lectura de documentos y OCR (leyó los siete campos de una factura de prueba), e interpretación de gráficos (leyó los cinco valores de barras, máximo, mínimo y suma).
- Comprensión de vídeo: descripción de movimiento, lectura de tarjetas numeradas en un clip de 12 s, lectura del último número en un vídeo de 90 s / 180 fotogramas y localización de un fotograma concreto.
- Prompts con múltiples imágenes en una sola petición.
- Tool calling / function calling: genera `<tool_call>` bien formado con argumentos correctos, usa el resultado de la herramienta en su respuesta y omite herramientas cuando no son necesarias.
- Salida JSON válida en el primer intento, sin vallas de código.
- Capacidades multilingües: respondió correctamente a preguntas en español, japonés y chino.
- Conversación multi-turno con imagen: mantiene el contexto visual dos turnos después.
- Contexto largo: localización de información oculta a 32K y 128K tokens.
- Modo thinking configurable (on/off) mediante la plantilla de chat.
- Sin capacidad de audio.

## Casos de uso

- Análisis de documentos y facturas en local: el modelo lee campos estructurados (OCR) con precisión verificada en una factura de prueba, lo que permite construir pipelines de extracción de datos sin enviar documentos sensibles a la nube.
- Asistente de código y agente local: gracias al tool calling bien formado y al soporte de JSON, puede integrarse en el servidor MLX nativo de Anthropic API del proyecto Claude Code Local para ejecutar tareas de agente en un Mac sin conexión.
- Interpretación de gráficos e informes: lee valores de barras, calcula máximos, mínimos y sumas, útil para automatizar la revisión de dashboards o informes financieros en local.
- Análisis de vídeo de vigilancia o monitorización: con poda de tokens configurable, puede procesar clips de hasta 180 fotogramas para describir movimiento o localizar eventos concretos, con un pico de memoria de unos 89 GB para 90 s de vídeo.
- Procesamiento de contexto largo: con 128K tokens y una caché de solo ~1 GB, es adecuado para resumir o consultar documentación extensa, contratos o bases de conocimiento en una sola pasada.
- Atención al cliente multilingüe: responde en español, japonés y chino y mantiene contexto multi-turno con imágenes, lo que permite asistentes que interpretan capturas de pantalla o fotos del producto del usuario.
- Generación de JSON estructurado para integración de sistemas: la salida JSON válida en el primer intento facilita la integración en pipelines que consumen datos estructurados sin post-procesado.
- Razonamiento matemático y lógico asistido: el modo thinking configurable permite alternar entre respuestas rápidas y cadenas de razonamiento más elaboradas según la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros no aparecen en la model card). Los únicos datos de rendimiento publicados son de velocidad y memoria en hardware Apple Silicon:

| Metrica | Valor |
|---|---|
| Velocidad de generacion (M5 Max, 128 GB) | 37–41 tokens/s |
| Procesamiento de prompt con imagenes | 550–950 tokens/s |
| Procesamiento de prompt a 128K | ≈755 tokens/s |
| Memoria cargada | ≈81 GB |
| Pico de memoria (90 s de video) | ≈89 GB |
| Pico de memoria (contexto 128K) | ≈91 GB |
| Tamaño de cache a 128K | ≈1 GB (solo 8 capas de atencion) |

## Requisitos de hardware

- VRAM/memoria unificada: unos 81 GB cargado; picos de 89 GB con 90 s de vídeo y 91 GB con 128K de contexto. Requiere un Mac con 128 GB de memoria unificada.
- GPU recomendadas: Apple Silicon de gama alta; el autor reporta 37–41 tokens/s en un M5 Max con 128 GB. No se dispone de datos para A100, H100 o RTX 4090 en la información proporcionada.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, etc.) ni en Macs de 64 GB o menos.
- Despliegue: mlx-vlm (requiere instalar el port `mlx_vlm_port/install_port.py` incluido en el repo, ya que mlx-vlm estándar aún no soporta `nemotron_h_omni`), más torch y torchvision. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: 37–41 tokens/s de generación; 550–950 tokens/s de procesamiento de prompt con imágenes; ~755 tokens/s a 128K.
- El autor probó con mlx-vlm 0.7.8 de PyPI en un venv limpio.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, el modelo base BF16 (nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16) es la alternativa directa para hardware NVIDIA, y esta conversión MLX 8-bit es la opción para Apple Silicon. Cualquier comparación con otros modelos de tamaño similar requeriría datos que no están disponibles en la información consultada.

## Limitaciones y advertencias

- Requiere un Mac con 128 GB de memoria unificada; no es desplegable en hardware de consumo habitual.
- mlx-vlm estándar no carga el modelo: es obligatorio ejecutar `install_port.py`, que modifica la instalación de mlx-vlm. El autor indica que es seguro ejecutarlo dos veces, pero conviene revisarlo antes de usarlo en producción.
- Un mismo prompt acepta imágenes o vídeo, pero no ambos a la vez, siguiendo la referencia de NVIDIA.
- Clips de vídeo de más de 180 fotogramas no fueron probados; el comportamiento más allá de ese límite es desconocido.
- El modelo no tiene torre de audio.
- No se dispone de información sobre sesgos, riesgos de alucinación o notas de seguridad en la información proporcionada; la model card remite al modelo base de NVIDIA para esos detalles.
- La licencia OpenMDW 1.1 debe revisarse para uso comercial; no se dispone del texto completo de las restricciones en la información consultada.
- Los datos de velocidad y memoria provienen de un único hardware (M5 Max, 128 GB) y no deben generalizarse a otros equipos.
- La cuantización 8-bit puede introducir degradaciones menores frente al BF16 original, aunque las verificaciones de fidelidad reportadas son muy altas (coseno ≥0,9993 en todas las capas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-8bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
