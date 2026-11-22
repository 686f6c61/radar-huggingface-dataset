# litert-community/Qwen3.5-4B

## Resumen

Qwen3.5-4B en formato LiteRT-LM es la conversión del checkpoint `Qwen/Qwen3.5-4B` de Alibaba al runtime on-device de Google (LiteRT, el nuevo nombre de TensorFlow Lite), empaquetada por la comunidad `litert-community`. El objetivo es ejecutar un modelo de 4B parámetros en dispositivos edge (smartphones Android, portátiles Apple Silicon) sin depender de la nube, manteniendo la arquitectura híbrida original de Qwen3.5.

La arquitectura es híbrida: 24 capas de atención lineal GatedDeltaNet (gated delta rule) intercaladas con 8 capas de atención completa con compuertas. Las capas lineales mantienen un estado recurrente de tamaño constante en lugar de una caché KV creciente, de modo que el consumo de memoria permanece prácticamente plano respecto a la longitud de contexto; solo las 8 capas de atención conservan KV, con un presupuesto de 4096 tokens.

El paquete es únicamente el decodificador de texto: el tower de visión y las cabezas MTP del checkpoint upstream se han eliminado, siguiendo el contrato de carga text-only de `Qwen3_5ForCausalLM`. Se distribuye en cuatro variantes cuantizadas (int8, int4 mixto y dos composites para GPU) con tamaños entre 2,71 GB y 4,42 GB, lo que lo hace viable en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas GatedDeltaNet (atención lineal con gated delta rule) + 8 capas de atención completa con compuertas |
| Parámetros totales | 4B (aproximado, según denominación del modelo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de presupuesto KV en las 8 capas de atención; las capas lineales usan estado recurrente de tamaño constante |
| Tipos de cuantización | int8 dinámico, int4 blockwise-32 mixto, composites GPU (int4 blockwise-32 + int8 embedding/lm_head; int8 dinámico) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el repo incluye también secciones TFLite internas |
| Tamaño de archivos | 2,71 GB (mixed int4 GPU composite v0190), 2,75 GB (mixed int4), 4,37 GB (int8 GPU composite v0190), 4,42 GB (int8 CPU) |
| Runtime requerido | litert-lm ≥ 0.15; composites GPU requieren 0.19.x |
| Repo total | 54,5 GB |

## Arquitectura y entrenamiento

La arquitectura Qwen3.5 combina bloques de atención lineal GatedDeltaNet con un número reducido de bloques de atención completa con compuertas. Cada capa lineal mantiene una convolución y un estado recurrente de tamaño fijo por capa, lo que evita el crecimiento lineal de la caché KV con la longitud de contexto. En esta conversión concreta, las 48 proyecciones de decaimiento/compuerta (`in_proj_a` / `in_proj_b`) de GatedDeltaNet se mantienen en coma flotante en todas las recetas de cuantización, un detalle que el autor documenta como corrección específica para el modelo de 4B.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el checkpoint upstream. La model card documenta únicamente el proceso de conversión: `litert_torch.convert` (el antiguo `ai-edge-torch`) produce un grafo que, según la medición citada del autor, coincide con el original con un error de 4e-7 en un Galaxy S26 con LiteRT 2.2.0. Los archivos del 14 de noviembre de 2026 son exportaciones del propio grafo Qwen3.5 de litert-torch, con composites GPU y activaciones declaradas en fp32.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat actualizada (formato de content-parts de la versión 0.18 y forma de cadena clásica).
- Modo thinking con conmutador en la plantilla de chat y canal de razonamiento separado (`supports_thinking` en metadatos).
- Razonamiento aritmético multi-paso (la model card documenta pruebas con multiplicaciones encadenadas, con problemas conocidos en la versión int8 anterior al 13 de octubre de 2026).
- Inferencia on-device en CPU y GPU mediante delegación (composites GPU en LiteRT-LM 0.19.x).
- Ejecución en Android (CLI de Android) y macOS (probado en Mac con litert-lm 0.15.0 y 0.18.0).
- No incluye visión: el tower visual del checkpoint upstream fue eliminado en esta conversión.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte explícito de agentes o multi-step reasoning más allá del modo thinking.

## Casos de uso

- Asistentes de texto offline en Android: el paquete int8 de 4,42 GB o el int4 mixto de 2,75 GB permiten ejecutar un modelo de 4B en un smartphone de gama alta sin conexión, usando LiteRT-LM como runtime y la plantilla de chat incluida.
- Aplicaciones de privacidad estricta: al no requerir nube, el texto del usuario nunca sale del dispositivo; adecuado para notas, correo o diarios personales en los que el coste de una fuga es alto.
- Razonamiento aritmético y de sentido común en el borde: el modo thinking con canal de razonamiento separado permite tareas de varios pasos (cálculo de propinas, conversión de unidades, planificación simple) en dispositivos sin GPU dedicada.
- Prototipado de apps móviles con LiteRT: el formato `.litertlm` y la API `com.google.ai.edge.litert:litert` permiten integrar el modelo en un proyecto Android nativo sin servidores intermedios.
- Evaluación de arquitecturas híbridas en investigación: las 24 capas lineales con estado constante facilitan experimentos de memoria y latencia frente a transformers puros con la misma ventana de 4096 tokens.
- Despliegue en portátiles Apple Silicon: los archivos probados en Mac con litert-lm 0.15.0 y 0.18.0 permiten usar el modelo como asistente local en herramientas de línea de comandos.
- Filtrado y clasificación de texto en el dispositivo: generación de resúmenes o respuestas cortas en pipelines de preprocesado local, donde la latencia de red es inaceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una medición de fidelidad de conversión: el grafo convertido con `litert_torch.convert` coincide con el original con un error de 4e-7 en un Galaxy S26 (LiteRT 2.2.0, Android 16, 5 de septiembre de 2026). No hay cifras de MMLU, HumanEval, GSM8K ni latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada: entre 2,71 GB y 4,42 GB solo para los pesos, según la variante; hay que añadir el estado recurrente de las capas lineales y la caché KV de las 8 capas de atención (presupuesto de 4096 tokens).
- GPU recomendadas: no se especifican modelos concretos; los composites GPU requieren LiteRT-LM 0.19.x y delegación GPU. La model card menciona pruebas en Galaxy S26 (Android) y en Mac (Apple Silicon).
- Compatibilidad con GPU de consumo: no se documenta explícitamente; el enfoque es on-device (móvil y portátil), no tarjetas de escritorio.
- Opciones de despliegue: LiteRT-LM ≥ 0.15 (CPU) y 0.19.x (GPU); CLI de Android; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan el formato `.litertlm`.
- Latencia y throughput: no disponibles.
- Advertencia de runtime: el archivo `Qwen3.5-4B_mixed_int4.litertlm` no funciona en un Pixel 11 Pro según la sección de problemas conocidos del runtime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B (LiteRT-LM) | 4B | 4096 tokens KV (8 capas) + estado lineal constante | `.litertlm` | Apache 2.0 | Hugging Face, litert-community |
| Qwen3.5-0.8B (LiteRT-LM) | 0,8B | no disponible | `.litertlm` | Apache 2.0 | Hugging Face, litert-community |
| Qwen/Qwen3.5-4B (upstream) | 4B | no disponible | safetensors (multimodal) | Apache 2.0 | Hugging Face, Qwen |

La comparación con alternativas de otros ecosistemas (Llama, Gemma, Phi en formato GGUF) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El paquete es solo el decodificador de texto: no hay visión ni cabezas MTP, por lo que no puede usarse para tareas multimodales aunque el checkpoint upstream sí las soporte.
- La ventana de contexto efectiva está limitada a 4096 tokens en las capas de atención; las capas lineales no amplían ese presupuesto.
- La versión int8 anterior al 13 de octubre de 2026 tenía fallos documentados por el autor: en el backend CPU, 7 de 18 ejecuciones de multiplicaciones multi-paso llegaban al límite de tokens (una sin respuesta) y, con thinking sin presupuesto, el pensamiento no se cerraba en 0 de 3 ejecuciones. Actualizar al archivo re-cuantizado.
- El archivo int8 en GPU repite dos líneas después de la respuesta cuando supera los 400 tokens; el composite int8 GPU tampoco se probó en Galaxy S26.
- `Qwen3.5-4B_mixed_int4.litertlm` no funciona en Pixel 11 Pro según los problemas conocidos del runtime.
- Riesgo de alucinación: no cuantificado en la información disponible; es un modelo de 4B y debe tratarse como tal en producción.
- Sesgos: no documentados en la model card.
- Idiomas soportados: no disponibles; no se puede asumir multilingüismo sin verificación.
- Licencia Apache 2.0: permite uso comercial, pero el formato `.litertlm` limita el despliegue a LiteRT-LM, lo que ata la infraestructura al runtime de Google.
- El repo pesa 54,5 GB por acumulación de variantes; conviene descargar solo el archivo necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Versión 0.8B del mismo autor: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Medición de fidelidad de conversión citada: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
