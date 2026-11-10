# divinetribe/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-8bit

## Resumen

NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-8bit es una conversión a formato MLX de 8 bits del modelo multimodal Nemotron-3.5 Bolt 74B-A9B de NVIDIA, realizada por el usuario divinetribe para ejecución en Apple Silicon. El modelo original combina un transformer híbrido con capas Mamba2, atención y mezcla de expertos (MoE), junto con un codificador visual RADIO, lo que le permite procesar texto, imágenes y vídeo en una única arquitectura.

La relevancia de esta ficha radica en que es una de las pocas builds que permite ejecutar un modelo de 74.885 millones de parámetros totales con capacidades multimodales en hardware de consumo de Apple, concretamente en un Mac con 128 GB de memoria unificada. La conversión preserva los 28.725 tensores del checkpoint original y añade un puerto personalizado (`nemotron_h_omni`) para mlx-vlm, ya que la librería estándar aún no soporta esta arquitectura.

El modelo está pensado para desarrolladores que quieran ejecutar agentes locales, análisis de documentos, OCR, comprensión de vídeo y razonamiento con tool calling sin depender de la nube. Su licencia OpenMDW 1.1 permite redistribución bajo los mismos términos que el modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Mamba2, atención y MoE (Puzzle-searched, distinto número de expertos por capa) + codificador visual RADIO |
| Parametros totales | 74.885.081.096 |
| Parametros activos | 9B (según denominación A9B del modelo base) |
| Longitud de contexto | 128K tokens (verificado en pruebas de contexto largo) |
| Tipos de cuantizacion | 8-bit affine, group size 64; torre visual, proyector y cabeza de salida en bf16 |
| Idiomas soportados | No disponible (la model card cita pruebas correctas en español, japonés y chino, pero no hay lista oficial) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (MLX), 1.863 tensores, ~81 GB en disco |

## Arquitectura y entrenamiento

El modelo base de NVIDIA emplea una arquitectura híbrida denominada "Puzzle-searched", en la que se alternan capas Mamba2 (espacio de estados), capas de atención y capas MoE con un número variable de expertos por capa. De las 88 capas totales, solo 8 son de atención, lo que reduce drásticamente el coste de la caché KV (aproximadamente 1 GB para 128K tokens). La componente multimodal la aporta un codificador visual RADIO, seguido de un proyector que alinea las representaciones visuales con el espacio del modelo de lenguaje. El modelo tiene 74.885 millones de parámetros totales y 9.000 millones activos por token (A9B).

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada; la model card remite a la ficha del modelo base de NVIDIA para esos datos. La conversión a MLX no modifica el comportamiento ni la alineación del modelo original. La innovación técnica destacable de esta build es el puerto `nemotron_h_omni` para mlx-vlm, que implementa la carga de pesos, el procesador multimodal (plantilla de chat, tokenización de imágenes y valores de píxel) y la poda de tokens de vídeo (pruning rate 0,7 por defecto).

## Capacidades

- Generación de texto y razonamiento: resuelve problemas tipo bat-and-ball correctamente con thinking activado o desactivado.
- Comprensión de imágenes: descripción de fotos, conteo de objetos, lectura de documentos y OCR (facturas con siete campos leídos correctamente).
- Comprensión de gráficos: lectura de valores de barras, máximo, mínimo y suma.
- Comprensión de vídeo: clips de 12 s con tarjetas de colores numeradas, detección de movimiento y clips de 90 s / 180 frames con lectura del último número y búsqueda de un frame concreto.
- Múltiples imágenes en un mismo prompt: identificación y conteo por imagen.
- Tool calling / function calling: genera `<tool_call>` bien formado con argumentos correctos, usa el resultado de la herramienta y omite herramientas cuando no son necesarias.
- Salida JSON válida en el primer intento, sin code fences.
- Multilingüe: respuestas correctas en español, japonés y chino (según pruebas del autor).
- Conversación multi-turno con imagen: mantiene referencia a la imagen dos turnos después.
- Contexto largo: localización de un número oculto a 32K y 128K tokens.
- Modo thinking activable o desactivable mediante `enable_thinking` en la plantilla de chat.
- Sin torre de audio: no procesa audio.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 128K tokens gracias a su ventana extendida, manteniendo el hilo de la conversación y recordando información de turnos anteriores sin truncar el historial.
- Análisis de documentos y OCR en local: procesa facturas, formularios y documentos escaneados extrayendo campos estructurados (la prueba del autor lee correctamente los siete campos de una factura), lo que permite construir pipelines de digitalización sin enviar datos sensibles a la nube.
- Agentes de código locales: con tool calling bien formado y salida JSON válida, puede integrarse en un servidor local compatible con la API de Anthropic (como Claude Code Local) para ejecutar tareas de agente sobre el sistema de archivos en un Mac.
- Comprensión de vídeo para monitorización o análisis: con poda de tokens configurable (`video_pruning_rate`) puede procesar clips de hasta 180 frames, útil para inspección de vídeo, detección de cambios de estado o lectura de paneles e indicadores.
- Análisis de gráficos y datos visuales: extrae valores de gráficos de barras y calcula agregados (máximo, mínimo, suma), adecuado para herramientas de business intelligence que reciben capturas de dashboards.
- Asistente multimodal de escritorio: al ejecutarse en Apple Silicon con 128 GB, permite un asistente local que combina imagen, texto y razonamiento con thinking activable, sin coste de API y con privacidad total.
- Educación y tutoría: responde preguntas de razonamiento y matemáticas con thinking activado, mostrando el proceso, y admite preguntas en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona métricas de fidelidad de la conversión y de rendimiento en hardware:

| Metrica | Valor |
|---|---|
| Fidelidad de pesos | Todos los tensores del checkpoint mapean por nombre y forma en ambos sentidos |
| Fidelidad del procesador | Plantilla de chat, token ids (300 tokens de imagen) y valores de píxel idénticos a la referencia |
| Torre visual (coseno vs fp32) | 0,99998 |
| Proyector visual (coseno vs fp32) | 0,99995 |
| Modelo de lenguaje (coseno por capa) | ≥ 0,9993 en las 88 capas |
| Logits finales | Coseno 0,999997, KL 0,00075, top-1 coincide |
| Embeddings de vídeo (coseno vs fp32) | 0,99981; máscara de poda coincide al 100 % |
| Velocidad de generación | 37–41 tokens/s en M5 Max 128 GB |
| Procesamiento de prompt | 550–950 tokens/s con imágenes; ~755 tokens/s a 128K |
| Memoria | 81 GB cargado; pico ~89 GB con vídeo de 90 s; ~91 GB a 128K |

## Requisitos de hardware

- VRAM/memoria unificada: ~81 GB en disco y en memoria al cargar; pico de ~89 GB con vídeo de 90 s y ~91 GB a 128K de contexto.
- Hardware recomendado: Mac con 128 GB de memoria unificada (probado en M5 Max). No cabe en configuraciones de 64 GB o menos.
- GPU: exclusivamente Apple Silicon; no está pensado para GPU NVIDIA/AMD en este formato MLX.
- Cabe en consumer GPU: no en el sentido tradicional; requiere un Mac de gama alta con 128 GB.
- Opciones de despliegue: mlx-vlm (versión 0.7.8 o superior) con el puerto `install_port.py` incluido en el repo; no compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: 37–41 tokens/s de generación; 550–950 tokens/s de procesamiento de prompt con imágenes; ~755 tokens/s a 128K.
- Caché KV: ~1 GB a 128K tokens gracias a que solo 8 de las 88 capas son de atención.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5 Bolt 74B-A9B (este, MLX 8-bit) | 74,9B (9B activos) | 128K | OpenMDW 1.1 | safetensors MLX | Hugging Face (divinetribe) |
| NVIDIA Nemotron-3.5 Bolt 74B-A9B BF16 (base) | 74,9B (9B activos) | 128K | OpenMDW 1.1 | safetensors | Hugging Face (nvidia) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con modelos alternativos de la misma categoría; la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Requiere un Mac con 128 GB de memoria unificada; no es viable en hardware de consumo estándar ni en GPU NVIDIA sin reconversión.
- Stock mlx-vlm no carga el modelo: es necesario ejecutar `install_port.py`, que modifica la instalación de mlx-vlm.
- No procesa audio (sin torre de audio).
- Un mismo prompt no puede combinar imágenes y vídeo simultáneamente; debe ser uno u otro, igual que en la referencia de NVIDIA.
- Clips de vídeo superiores a 180 frames no fueron probados; el comportamiento por encima de ese límite es desconocido.
- La model card no documenta sesgos, riesgos de alucinación ni notas de seguridad propias; remite a la ficha del modelo base de NVIDIA, por lo que las advertencias de sesgo y alucinación del original aplican sin modificaciones.
- La licencia OpenMDW 1.1 permite redistribución bajo los mismos términos, pero conviene revisar sus condiciones para uso comercial en el enlace oficial antes de desplegar en producción.
- La lista de idiomas soportados no está publicada oficialmente; las pruebas en español, japonés y chino son anecdóticas y no garantizan cobertura completa.
- El repo tiene 592 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y poca validación comunitaria independiente.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/divinetribe/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-8bit
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Repositorio GitHub del autor: https://github.com/nicedreamzapp
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
