# Lottolabs/Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150-batched-tt-model

## Resumen

Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150-batched-tt-model es un paquete de despliegue publicado por Lottolabs que adapta el modelo Qwen/Qwen3.6-35B-A3B (del equipo Qwen, Alibaba Cloud, licencia Apache-2.0) para ejecutarse sobre aceleradores Tenstorrent Blackhole P150. No se trata de un modelo nuevo: es una conversión de pesos y un contenedor de servicio que cuantiza los expertos enrutados y compartidos del MoE a GPTQ BFP4 y las proyecciones densas y el LM head a BFP8, empaquetado con tt-model-manager 0.1.0 (esquema de manifiesto 5.1).

El modelo subyacente es un transformer híbrido MoE de 35.000 millones de parámetros totales con aproximadamente 3.000 millones activos por token. Combina 40 capas de atención lineal Gated DeltaNet con atención completa con compuerta, un MoE de 256 expertos más un experto compartido, y una ventana de contexto nativa de 262.144 tokens. El paquete sirve exclusivamente texto a través de la API compatible con OpenAI de vLLM, mediante un runtime tt-metal personalizado con decodificación por lotes trazada para 2 a 16 secuencias concurrentes, prefill troceado en bloques de 2.048 tokens y caché de prefijos exacta no especulativa.

Su relevancia es de nicho pero clara: permite ejecutar un modelo de contexto largo y 35B en hardware Tenstorrent, una alternativa no NVIDIA, con perfiles de servicio predefinidos. Es un paquete de la comunidad, no una publicación oficial de Qwen ni de Tenstorrent, y su adopción es actualmente nula (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con 40 capas: Gated DeltaNet (atención lineal) + atención completa con compuerta; MoE de 256 expertos + experto compartido |
| Parametros totales | 35B (aproximado, según nombre del modelo base) |
| Parametros activos | ~3B (aproximado, según nombre del modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ BFP4 (expertos enrutados y compartidos) + BFP8 (proyecciones densas y LM head) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Pesos convertidos para Tenstorrent Blackhole P150 (checkpoint de ~22 GB en caché HF; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina atención lineal Gated DeltaNet con atención completa con compuerta a lo largo de 40 capas, un patrón híbrido que busca reducir el coste de atención en contextos largos manteniendo capacidad de recuperación exacta. La capa MoE emplea 256 expertos enrutados más un experto compartido, con unos 3B parámetros activos por token sobre 35B totales, lo que reduce el coste de cómputo por token frente a un modelo denso equivalente.

Este paquete concreto no aporta entrenamiento nuevo: es una derivación cuantizada del checkpoint Qwen3.6-35B-A3B (release x6-fused-20261007, commit c355c41d). La innovación técnica está en el runtime de servicio: decodificación por lotes trazada para 2–16 secuencias concurrentes, prefill troceado en bloques de 2.048 tokens, argmax codicioso en dispositivo y caché de prefijos exacta no especulativa. El modo MTP-1 (decodificación especulativa de una secuencia) se distribuye como paquete separado. No se dispone de datos sobre composición del dataset de entrenamiento, número de tokens vistos ni si hubo RLHF o DPO; esa información corresponde al modelo base y no se detalla en la información proporcionada.

## Capacidades

- Generación de texto y chat conversacional multi-turno.
- Razonamiento con modo de pensamiento separado: el texto de razonamiento se devuelve en el campo `reasoning` (o `reasoning_content` en vLLM anterior a 0.11.1), aparte de `content`; se puede desactivar por petición con `"chat_template_kwargs": {"enable_thinking": false}`.
- Tool calling / function calling mediante el parser `qwen3_coder`: las peticiones con `tools` devuelven `tool_calls` y `finish_reason: tool_calls`.
- Trabajo con contexto largo: hasta 262.144 tokens por petición dentro de un pool KV compartido de 262.144 tokens.
- Servicio concurrente para 2 a 16 usuarios según el perfil seleccionado.
- API compatible con OpenAI: chat completions, completions y `/v1/models`.
- Capacidades multimodales: no soportadas. Las imágenes y el vídeo se rechazan explícitamente; el servicio es solo texto.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 262.144 tokens, y el perfil `batched-16` permite atender hasta 16 conversaciones simultáneas en un único P150.
- Asistentes de código con herramientas: el soporte de tool calling con el parser `qwen3_coder` permite integrar el modelo en flujos donde debe invocar funciones externas (ejecutar tests, consultar repositorios, lanzar builds) y devolver resultados estructurados.
- Análisis de documentos largos: resumen, extracción de entidades y preguntas sobre contratos, informes o expedientes que superen los 100.000 tokens, aprovechando el contexto nativo y la caché de prefijos exacta para reutilizar el prefill entre peticiones sobre el mismo documento.
- Razonamiento en dos fases: usar el modo de pensamiento para tareas de planificación o resolución de problemas y desactivarlo en las respuestas finales para reducir latencia y coste, alternando por petición.
- Agentes multi-paso: combinación de razonamiento separado y tool calling para pipelines de varios pasos donde el modelo planifica, invoca herramientas y sintetiza el resultado.
- Despliegue en infraestructura no NVIDIA: organizaciones con aceleradores Tenstorrent Blackhole P150 que necesitan un endpoint compatible con OpenAI para aplicaciones internas de chat y automatización, sin depender de GPUs NVIDIA.
- Evaluación y prototipado de modelos de contexto largo en hardware alternativo: útil para equipos que investigan el rendimiento de MoE híbridos en aceleradores Tenstorrent antes de comprometerse con un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección de rendimiento esperado con evaluación "teacher-forced on the P1", pero el contenido está truncado y no incluye cifras. No se dispone de datos de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos.

## Requisitos de hardware

- Hardware objetivo: un acelerador Tenstorrent Blackhole P150 (requisito exclusivo; no se ejecuta en GPU NVIDIA ni en CPU).
- Almacenamiento: unos 22 GB en la caché de Hugging Face para el checkpoint, más unos 25 GB para las cachés de pesos convertidos y kernels generadas en el primer arranque.
- RAM de host: 64 GB o más recomendados; la carga del modelo alcanza picos de unos 50 GB.
- Primer arranque: unos 15 minutos para compilar kernels para el dispositivo; los arranques posteriores reutilizan las cachés.
- Despliegue: `tt serve` (Tenstorrent CLI, instalable con `uv tool install tenstorrent`) o `tt-model serve`; requiere Docker. Servidor compatible con OpenAI en el puerto 20000 (o el siguiente libre).
- Perfiles de servicio: `batched-16` (por defecto), `batched-8`, `batched-4` y `batched-2`, todos con contexto de 262.144 tokens y prefill troceado de 2.048 tokens. Se recomienda elegir el perfil con menos ranuras que cubra la concurrencia prevista, ya que menos ranuras decodifican más rápido por usuario.
- VRAM estimada en GPU: no aplica; el modelo no está pensado para GPU. No hay datos de latencia ni throughput publicados.
- Opciones de despliegue en GPU (vLLM, llama.cpp, Ollama, TGI): no disponibles para este paquete, que depende del runtime tt-metal personalizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Hardware | Notas |
|---|---|---|---|---|---|
| Lottolabs/Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150-batched-tt-model | 35B totales / ~3B activos | 262.144 | apache-2.0 | Tenstorrent P150 | Paquete cuantizado BFP4/BFP8 con servicio por lotes 2–16 secuencias; sin benchmarks publicados |
| Lottolabs/Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150-tt-model | 35B totales / ~3B activos | 262.144 | apache-2.0 | Tenstorrent P150 | Variante de una sola secuencia con MTP-1 especulativo del mismo autor |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B totales / ~3B activos | 262.144 | apache-2.0 | GPU (formato original) | Pesos sin cuantizar para Tenstorrent; referencia de calidad y capacidades |
| Alternativas de otros fabricantes con ~30–40B MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Dependencia de hardware exclusiva: solo funciona en Tenstorrent Blackhole P150; no hay soporte para GPU NVIDIA, AMD ni CPU en este paquete.
- Paquete de la comunidad: no es una publicación oficial de Qwen ni de Tenstorrent; el soporte y el mantenimiento dependen de Lottolabs.
- Solo texto: las imágenes y el vídeo se rechazan explícitamente; no hay capacidades multimodales.
- Idiomas soportados: no disponibles en la información proporcionada; no se puede confirmar cobertura multilingüe.
- Decodificación no especulativa en este paquete: el modo MTP-1 es un paquete separado, por lo que el rendimiento por secuencia puede ser inferior al de la variante especulativa.
- Muestreo y funciones avanzadas: el argmax codicioso se ejecuta en dispositivo, pero el muestreo aleatorio, las penalizaciones, los logprobs y la salida estructurada pasan por la ruta de host de vLLM, lo que puede añadir latencia.
- Configuración delicada: se desaconseja sobrescribir `--max-num-seqs` o `--max-model-len`; debe elegirse un perfil predefinido.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; se aplican los del modelo base Qwen3.6-35B-A3B, no evaluados aquí.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse las obligaciones de atribución y las condiciones del modelo base.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin benchmarks publicados, lo que dificulta evaluar su calidad en producción.
- Primer arranque lento (unos 15 minutos) y requisitos de memoria de host elevados (picos de ~50 GB).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lottolabs/Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150-batched-tt-model
- Pesos de referencia: https://huggingface.co/Lottolabs/Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150
- Variante MTP-1 de una secuencia: https://huggingface.co/Lottolabs/Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150-tt-model
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Manifiesto de bundles: https://github.com/LottoLottoLotto/tt-model-bundles
- Runtime tt-metal (rama): https://github.com/LottoLottoLotto/tt-metal/tree/lottolabs/qwen3.6-35b-a3b-batched-p150
- vLLM (rama): https://github.com/LottoLottoLotto/vllm/tree/lottolabs/qwen3.6-35b-a3b-batched-p150
- Plugins tt-model (rama): https://github.com/LottoLottoLotto/tt-model-plugins/tree/lottolabs/qwen3.6-35b-a3b-batched-p150
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Requisitos previos de Tenstorrent CLI: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
