# AXERA-TECH/Qwen3.5-2B-AX650-C128-P6K-CTX8K

## Resumen

Qwen3.5-2B-AX650-C128-P6K-CTX8K es una conversión del modelo multimodal Qwen3.5-2B de Alibaba (familia Qwen) para su ejecución sobre la NPU AX650 de AXERA, publicada por el equipo AXERA-TECH. No se trata de un modelo nuevo entrenado desde cero, sino de una exportación del modelo base a formato `.axmodel` mediante la herramienta Pulsar2 (versión 8.0 para el componente de texto y 5.1-patch1 para el de visión), pensada para desplegarse en hardware de borde de bajo consumo.

El modelo resuelve el problema de ejecutar un VLM de 2.000 millones de parámetros con capacidades de imagen y vídeo en placas embebidas (AX650N DEMO Board, M4N-Dock o tarjeta aceleradora M.2), donde no es viable cargar pesos en FP16 ni usar GPUs de datacenter. La conversión mantiene el pipeline `image-text-to-text` del modelo original y expone un servidor compatible con la API de OpenAI a través del runtime `axllm`.

El identificador del repositorio codifica la configuración de despliegue: C128 indica un tamaño de bloque de prefill de 128 tokens, P6K un prefill máximo de 6.144 tokens y CTX8K una ventana de contexto de 8.192 tokens. El repositorio ocupa 5,3 GB e incluye los 24 bloques de texto (`l0` a `l23`), el módulo de visión, el módulo de post-proceso y el embedding en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) Qwen3.5; vision encoder tipo Qwen3VL con `tokens_per_block=144`, `embed_size=2048` |
| Parametros totales | 2.000 millones (modelo base Qwen3.5-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (CTX8K); prefill máximo 6.144 tokens; bloques de decodificación hasta 2.047, 4.095, 6.143 y 8.191 tokens |
| Tipos de cuantizacion | no disponible (pesos exportados a `.axmodel`; embedding en bfloat16) |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | `.axmodel` (formato propietario de AXERA); `model.embed_tokens.weight.bfloat16.bin`; tokenizador `qwen3_5_tokenizer.txt` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un transformer multimodal de la familia Qwen que combina un codificador visual con un decodificador de lenguaje. En esta conversión, el componente de visión se ha exportado como `qwen3_5_vision.axmodel` con un codificador de tipo Qwen3VL que procesa bloques de 144 tokens por imagen y proyecta a un espacio de embedding de 2048 dimensiones en `fp32`. El decodificador de texto se ha troceado en 24 capas independientes (`qwen3_5_text_p128_l0_together.axmodel` hasta `l23`), más un módulo `post` para la cabeza de salida y el embedding de tokens en bfloat16.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO; esa información corresponde a la model card original de Qwen/Qwen3.5-2B, no incluida en la documentación proporcionada. La innovación técnica destacable de esta publicación no está en el entrenamiento, sino en el pipeline de conversión: Pulsar2 exporta el grafo a la NPU AX650 y el runtime `axllm` implementa prefill segmentado en bloques de 128 tokens, decodificación por grupos con longitudes máximas escalonadas y un servidor HTTP compatible con OpenAI. El modelo soporta además un modo `enable_thinking` que puede desactivarse por petición mediante `chat_template_kwargs`.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con OpenAI.
- Comprensión de imágenes: descripción de escenas, reconocimiento de objetos y personas, respuesta a preguntas visuales.
- Comprensión de vídeo mediante secuencias de fotogramas ordenadas por nombre de fichero (probado con 8 fotogramas extraídos a 1 fps).
- Razonamiento multimodal combinando entrada de texto e imagen en el mismo turno.
- Modo de razonamiento explícito (`enable_thinking`) activable o desactivable por petición.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) con soporte de streaming.
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Inspección visual en el borde: una cámara conectada a una placa AX650N puede enviar fotogramas al modelo para generar descripciones en lenguaje natural sin salir del dispositivo, útil en videovigilancia o monitorización industrial donde no hay conectividad a la nube.
- Análisis de vídeo de vigilancia o deportivo: el modelo procesa directorios de fotogramas (probado con 8 imágenes a 1 fps) y resume el contenido en una frase, adecuado para generar metadatos automáticos de grabaciones.
- Asistente de accesibilidad en dispositivo: descripción de imágenes capturadas por el usuario en tiempo real sobre hardware de bajo consumo (2,88 GiB de CMM), sin depender de servicios externos.
- Automatización de documentación visual: generación de pies de foto y descripciones para catálogos o archivos de imágenes ejecutándose en una tarjeta M.2 aceleradora dentro de un servidor existente.
- Prototipado de VLM en entornos embebidos: gracias a la compatibilidad con la API de OpenAI, se puede desarrollar la aplicación contra el endpoint local y migrar después a otro backend sin reescribir el código cliente.
- Clasificación y filtrado de contenido visual en el borde: etiquetado semántico de imágenes para pipelines de datos donde la latencia de red o la privacidad impiden enviar las imágenes a un servidor central.
- Educación y demos de NPU: el repositorio incluye imágenes de ejemplo y fotogramas de prueba, lo que facilita demostraciones reproducibles del rendimiento del hardware AX650.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos son de rendimiento en la placa AX650:

| Escenario | Entrada | Imágenes | TTFT texto | Decode | CMM | Flash |
|---|---|---|---|---|---|---|
| Procesamiento de imagen | 384x384 | 1 | 820,96 ms | 8,43 tokens/s | 2,88 GiB | 3,55 GiB |
| Procesamiento de vídeo | 384x384 | 8 | 2.028,04 ms | 8,35 tokens/s | 2,88 GiB | 3,55 GiB |

En los logs de ejemplo con `enable_thinking=false` se observan latencias de 2.199,66 ms de TTFT para 165 tokens de entrada (imagen) y 7.021,50 ms para 596 tokens (8 fotogramas), con velocidades de decodificación de 5,99 y 5,34 tokens/s respectivamente en esas ejecuciones concretas. El consumo de memoria CMM (2,88 GiB) y el tamaño de descarga (3,55 GiB) son los datos de referencia para dimensionar la placa.

## Requisitos de hardware

- Plataforma objetivo: NPU AXERA AX650, en sus variantes AX650N DEMO Board, M4N-Dock (爱芯派Pro) o tarjeta aceleradora M.2 (LLM-8850 Card).
- Memoria: se requieren al menos 2,88 GiB de CMM asignados en la placa (memoria compartida para la NPU); el espacio en flash necesario es de 3,55 GiB.
- No es un modelo para GPU convencional: los pesos en formato `.axmodel` no se cargan con transformers, vLLM, llama.cpp ni Ollama. El despliegue se realiza exclusivamente con el runtime `axllm` (https://github.com/AXERA-TECH/ax-llm).
- Instalación del runtime: clonando el repositorio y ejecutando `install.sh`, mediante script de una línea, o descargando el binario `axllm` desde los artefactos de GitHub Actions.
- Ejecución: `axllm run .` para CLI interactiva o `axllm serve . --port 8000` para el servidor compatible con OpenAI.
- Throughput medido: 8,43 tokens/s en decodificación con una imagen de 384x384 y 8,35 tokens/s con 8 fotogramas; TTFT entre 0,8 y 2 s según el número de imágenes.
- No cabe en GPUs de consumo (RTX 4090, etc.) porque el formato de pesos es específico de la NPU AX650.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.5-2B-AX650-C128-P6K-CTX8K | 2.000 M | 8.192 | Texto + imagen + vídeo | MIT | NPU AX650 |
| Qwen/Qwen3.5-2B (base) | 2.000 M | no disponible | Texto + imagen | no disponible en la información | GPU/CPU genéricas |
| Alternativas VLM de ~2B en el borde | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros VLM de tamaño similar para hardware embebido no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el formato de pesos y el runtime, no la capacidad del modelo.

## Limitaciones y advertencias

- El modelo solo soporta inglés y chino; no se documenta soporte de castellano ni de otros idiomas.
- La ventana de contexto efectiva es de 8.192 tokens, con un prefill máximo de 6.144 tokens, lo que limita conversaciones o vídeos largos.
- El throughput es bajo (alrededor de 8 tokens/s en decodificación), adecuado para aplicaciones interactivas ligeras pero no para generación de texto de alta demanda.
- El TTFT crece con el número de imágenes: 8 fotogramas implican más de 2 segundos de prefill en el mejor caso medido y hasta 7 segundos en los logs de ejemplo.
- El modo `enable_thinking` está desactivado en todas las pruebas publicadas; no hay datos de rendimiento con razonamiento explícito activado.
- Riesgo de alucinación inherente a un VLM de 2B: las descripciones de imágenes y vídeos pueden contener detalles inventados, especialmente en escenas complejas o con texto pequeño.
- La licencia MIT del repositorio de conversión no exime de verificar la licencia del modelo base Qwen/Qwen3.5-2B para uso comercial.
- Los pesos en `.axmodel` solo funcionan en la NPU AX650; no hay portabilidad a otros aceleradores ni a GPU.
- El runtime `axllm` en la versión probada (`fd2a71ef3103`) devuelve el campo `usage` de la API OpenAI a 0, por lo que el conteo de tokens debe obtenerse de los logs.
- El proceso de conversión depende de versiones concretas de Pulsar2 (8.0 para texto, 5.1-patch1 para visión); mezclar versiones puede romper la exportación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.5-2B-AX650-C128-P6K-CTX8K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Documentación de Pulsar2 para conversión de LLM: https://pulsar2-docs.readthedocs.io/en/latest/appendix/build_llm.html
- Runtime AXera NPU Host LLM: https://github.com/AXERA-TECH/ax-llm
- Binarios CI de axllm: https://github.com/AXERA-TECH/ax-llm/actions?query=branch%3Aaxllm
- Placa M4N-Dock (爱芯派Pro): https://wiki.sipeed.com/hardware/zh/maixIV/m4ndock/m4ndock.html
- Tarjeta aceleradora M.2 LLM-8850: https://docs.m5stack.com/zh_CN/ai_hardware/LLM-8850_Card
