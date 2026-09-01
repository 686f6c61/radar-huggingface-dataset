# pipecat-ai/phonellm-alpha-1-nvfp4

## Resumen

PhoneLLM Alpha 1 NVFP4 es la cuantización oficial en formato NVFP4 del modelo PhoneLLM Alpha 1, desarrollado por el equipo de Pipecat (Daily.co) para agentes de voz telefónicos. Se trata de un modelo de lenguaje abierto con arquitectura híbrida Mamba-Transformer de tipo mixture-of-experts (MoE), con 30.000 millones de parámetros totales y 3.500 millones activos, diseñado específicamente para cargas de trabajo de baja latencia y conversaciones multi-turno en entornos de atención al cliente.

Esta versión cuantizada conserva los pesos del modelo original en BF16 y los adapta a ejecución nativa NVFP4 sobre hardware NVIDIA Blackwell, lo que permite reducir el uso de memoria y acelerar la inferencia sin pérdidas significativas de calidad. Según las pruebas publicadas, la combinación de pesos NVFP4 con caché KV en BF16 alcanza una puntuación media de 72,02 en PhoneBench, prácticamente idéntica a la del modelo original en BF16 (72,06), con una degradación de solo 0,037 puntos.

La relevancia de este lanzamiento radica en que ofrece una alternativa de bajo coste y baja latencia a modelos generalistas mucho más grandes para tareas específicas de voz. El equipo de Pipecat afirma que PhoneLLM Alpha 1 rinde al nivel de GPT 5.6 Terra en sus casos de uso objetivo, pero con un coste un 94 % inferior y una mejora de 1.300 ms en el percentil 95 del tiempo hasta el primer token. Al estar liberado bajo licencia BSD 2-Clause, puede desplegarse en infraestructura propia sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer MoE (basada en Nemotron-H) |
| Parametros totales | 30.000 millones (30B) |
| Parametros activos | 3.500 millones (3.5B) |
| Longitud de contexto | 65.536 tokens (receta probada); hasta 256.000 tokens soportados por la arquitectura |
| Tipos de cuantizacion | NVFP4 selectiva, group size 16 (ModelOpt 0.46.0rc1) |
| Idiomas soportados | Inglés |
| Licencia | BSD 2-Clause, con licencia NVIDIA Nemotron Open Model subyacente |
| Formato de pesos | safetensors (52 shards, 19,4 GB) |

## Arquitectura y entrenamiento

PhoneLLM Alpha 1 NVFP4 es una cuantización del modelo base PhoneLLM Alpha 1, que emplea una arquitectura híbrida que combina capas Mamba (modelos de espacio de estados) con capas Transformer en un esquema mixture-of-experts. Esta combinación busca equilibrar la eficiencia computacional de Mamba con la capacidad de razonamiento de los transformers, manteniendo solo 3.500 millones de parámetros activos por token de los 30.000 millones totales. El modelo base fue entrenado por el equipo de Pipecat para tareas de agente de voz, incluyendo soporte de tool calling y razonamiento conversacional.

La cuantización se realizó con ModelOpt 0.46.0rc1 utilizando 1.000 filas deterministas de PhoneData, disjuntas del conjunto de evaluación, que abarcan 273 conversaciones y las 692 estratificaciones observadas. Se aplicó cuantización selectiva: las proyecciones sensibles de atención y Mamba, el módulo de convolución de Mamba y la capa `lm_head` permanecen sin cuantizar. La lista completa de exclusiones está documentada en `hf_quant_config.json`. El checkpoint conserva metadatos de caché KV compatibles con FP8, pero la receta recomendada para máxima calidad en PhoneBench utiliza caché KV en BF16, lo que reduce la capacidad de tokens KV disponibles en aproximadamente un 40,2 % respecto a FP8.

## Capacidades

- Generación de texto conversacional optimizada para agentes de voz telefónicos, con soporte de diálogos multi-turno.
- Tool calling y function calling: compatible con selección automática de herramientas mediante el parser `qwen3_coder` en vLLM.
- Razonamiento multi-step: la arquitectura soporta modos de razonamiento, aunque la configuración recomendada para producción deshabilita el "thinking" (`enable_thinking: false`).
- Integración nativa con el framework Pipecat para pipelines completos de voz (transcripción, LLM y síntesis de voz).
- Baja latencia: diseñado para tiempos de respuesta rápidos en entornos de llamadas en tiempo real.
- Multilingüe: únicamente inglés (según la model card).

## Casos de uso

- Atención al cliente telefónica automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 65.536 tokens) en sectores como servicios financieros, salud, retail y hostelería, integrándose con sistemas de transcripción y síntesis de voz mediante Pipecat.
- Agentes de llamadas salientes: adecuado para campañas de telemarketing, recordatorios de citas o encuestas, donde la baja latencia (P95 TTFT 1.300 ms inferior a GPT 5.6 Terra) mejora la fluidez de la conversación.
- Asistentes virtuales con tool calling: puede ejecutar acciones como consultar bases de datos, actualizar registros o realizar pagos mediante function calling, lo que lo hace apto para automatización de back-office en tiempo real.
- Despliegue en infraestructura propia con NVIDIA Blackwell: al ser un modelo abierto con licencia BSD, puede ejecutarse en servidores propios con vLLM, evitando costes de API por token.
- Evaluación e investigación en agentes de voz: sirve como modelo de referencia para estudiar el rendimiento de arquitecturas híbridas Mamba-Transformer en tareas de diálogo telefónico.
- Reducción de costes en producción: con 3.500 millones de parámetros activos, el coste por inferencia es significativamente menor que el de modelos generalistas de gran tamaño, manteniendo un rendimiento comparable en tareas específicas de voz.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la media de diez ejecuciones completas de PhoneBench con temperatura cero y thinking deshabilitado:

| Pesos | Caché KV | PhoneBench media | Delta vs. BF16 |
|---|---:|---:|---:|
| BF16 | BF16 | 72,055800 | — |
| NVFP4 | FP8 | 71,512482 | -0,543318 |
| NVFP4 | BF16 | 72,019090 | -0,036711 |

La receta recomendada en producción es pesos NVFP4 con caché KV en BF16, que ofrece una degradación mínima frente al modelo original. No se han publicado resultados de otros benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El blog de Daily.co menciona que PhoneLLM Alpha 1 rinde al nivel de GPT 5.6 Terra en sus casos de uso objetivo, pero no se aportan métricas detalladas de esa comparación.

## Requisitos de hardware

- GPU objetivo: NVIDIA Blackwell, probado en una única GPU B200.
- VRAM estimada: los pesos NVFP4 ocupan 19,4 GB en disco; con caché KV en BF16 y contexto de 65.536 tokens, el consumo total de VRAM supera los 60 GB (LLM Explorer estima 63,2 GB). No cabe en GPUs de consumo como RTX 4090 (24 GB).
- GPUs compatibles: únicamente NVIDIA Blackwell (B200, B100, etc.) para ejecución nativa NVFP4. Otras arquitecturas no han sido validadas para este checkpoint.
- Opciones de despliegue: vLLM 0.27.1 con `--trust-remote-code`, `--load-format safetensors`, `--kv-cache-dtype bfloat16`, `--attention-backend FLASHINFER` y `--moe-backend flashinfer_cutlass`. También se menciona despliegue en Modal (serverless) en los ejemplos de GitHub.
- Latencia y throughput: no se publican cifras exactas de throughput, pero el blog de Daily.co indica una mejora de 1.300 ms en el percentil 95 del tiempo hasta el primer token frente a GPT 5.6 Terra.
- Configuración de generación obligatoria: `temperature=0` y `enable_thinking=false` para reproducir los resultados de calidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| PhoneLLM Alpha 1 NVFP4 | 30B | 3,5B | 65K (hasta 256K) | BSD 2-Clause | Agentes de voz |
| GPT 5.6 Terra | no disponible | no disponible | no disponible | Propietaria | Generalista |
| Otros modelos de voz abiertos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con GPT 5.6 Terra se basa en la afirmación del blog de Daily.co de que PhoneLLM Alpha 1 ofrece rendimiento comparable con un coste un 94 % inferior y menor latencia. No se dispone de datos públicos de benchmarks comparativos con otros modelos de voz de código abierto en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no es adecuado para despliegues multilingües sin adaptación adicional.
- La cuantización NVFP4 requiere hardware NVIDIA Blackwell; no se ha validado su funcionamiento en GPUs de generaciones anteriores ni en hardware de otros fabricantes.
- La caché KV en BF16, necesaria para máxima calidad, reduce la capacidad de tokens KV disponibles en aproximadamente un 40,2 % respecto a FP8, lo que limita el número de secuencias concurrentes o la longitud de contexto efectiva.
- El modo de razonamiento ("thinking") debe deshabilitarse explícitamente en producción; la configuración por defecto de `generation_config.json` contiene `do_sample: true`, por lo que es imprescindible sobrescribirla con `temperature=0`.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez ante entradas adversariales en la información disponible.
- La licencia BSD 2-Clause se aplica al checkpoint cuantizado, pero la licencia NVIDIA Nemotron Open Model subyacente y sus requisitos de atribución deben respetarse.
- El despliegue en vLLM requiere una versión específica (0.27.1) y parámetros de arranque muy concretos; instalaciones genéricas de vLLM o configuraciones no validadas pueden fallar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipecat-ai/phonellm-alpha-1-nvfp4
- Modelo base en HuggingFace: https://huggingface.co/pipecat-ai/phonellm-alpha-1
- Anuncio oficial en el blog de Daily.co: https://www.daily.co/blog/announcing-pipecat-phonellm-alpha-1/
- Ejemplos de despliegue en GitHub: https://github.com/pipecat-ai/pipecat-examples/tree/main/phonellm
- Ficha en LLM Explorer: https://llm-explorer.com/model/pipecat-ai%2Fphonellm-alpha-1,5pezStBz2O4J8azSvNPm6l
