# Einzeln/home-brief-gemma-4-e2b-litertlm

## Resumen

Home Brief — Fine-Tuned Gemma 4 E2B es un bundle de pesos en formato `.litertlm` derivado de `google/gemma-4-E2B-it`, publicado por el usuario Einzeln en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un ajuste fino (LoRA) empaquetado específicamente para inferencia en dispositivo (on-device) mediante LiteRT-LM v1.7.0, el runtime de Google para ejecutar modelos en Android y escritorio. El modelo está pensado para la demo y el banco de pruebas "Home Brief", una aplicación Flutter que ejecuta IA local en teléfonos.

El ajuste fino convierte al modelo base en un clasificador de una sola tarea: dado un evento de vigilancia doméstica (por ejemplo, la desaparición de un portátil), el modelo debe responder con un JSON estricto de tres vías (`send_sms`, `send_email` o `none`). El bundle ocupa 2,56 GiB y está cuantizado en `int4` con el esquema `gemma4_mixed48`, lo que permite ejecutarlo en la GPU OpenCL de un Android de gama alta con una latencia reportada de 0,75 s p50.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de despliegue on-device con LiteRT-LM y Flutter; por otro, advierte de que se trata de un artefacto muy especializado, con contrato de prompt fijo y sin datos públicos de benchmarks generales. No debe confundirse con el modelo base Gemma 4 E2B, cuyas capacidades generales son mucho más amplias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E2B; detalles internos no disponibles) |
| Parametros totales | no disponible (el bundle ocupa 2,56 GiB en int4) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (esquema `gemma4_mixed48` de LiteRT-LM v1.7.0) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | `.litertlm` (inline-weights, LiteRT-LM v1.7.0) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un modelo instructivo de la familia Gemma 4. La información proporcionada no detalla la arquitectura interna del modelo base (número de capas, dimensiones, mecanismo de atención), por lo que no es posible confirmar si incorpora innovaciones como atención lineal o decodificación especulativa. Lo que sí se documenta es el proceso de ajuste: se aplicó LoRA sobre el modelo base y se empaquetaron los pesos resultantes en formato `.litertlm` para su ejecución con LiteRT-LM v1.7.0.

El entrenamiento del adaptador se realizó sobre 2.400 ejemplos balanceados con proporción 1:1:1 entre las tres clases de salida (`send_sms`, `send_email`, `none`), aplicando máscara de pérdida solo sobre las respuestas del asistente (assistant-only loss masking). Este diseño refuerza un contrato de salida JSON estricto y reduce la variabilidad de las respuestas. No se especifica el número total de tokens de entrenamiento, la composición del dataset más allá del balance de clases, ni si se emplearon técnicas de RLHF o DPO adicionales.

## Capacidades

- Clasificación de eventos de vigilancia doméstica en tres acciones discretas: envío de SMS, envío de correo electrónico o ninguna acción.
- Generación de salida JSON estricta con el formato `{"action":"..."}`.
- Ejecución on-device en Android mediante la GPU OpenCL y en macOS/Linux mediante la CLI `litert-lm`.
- Integración con la aplicación Flutter `home_brief` a través del paquete `flutter_gemma_litertlm`.
- Modo de pensamiento desactivable (`enable_thinking=False`), recomendado para este ajuste concreto.
- Muestreo determinista configurable (temperatura 0,0 y semilla fija en los ejemplos).
- No se documentan capacidades de tool calling general, agentes multi-paso, visión, audio ni multilingüismo más allá de lo que herede del modelo base.

## Casos de uso

- Clasificación de alertas de seguridad doméstica: el modelo recibe una secuencia de eventos (entrada de persona, aparición de objeto, retirada del objeto) y decide si enviar SMS, correo o nada. Es adecuado porque el ajuste LoRA fuerza una salida JSON de tres vías y la latencia de 0,75 s p50 permite respuestas casi en tiempo real.
- Demo de IA on-device en Android: sirve como ejemplo reproducible de integración de LiteRT-LM con Flutter, útil para desarrolladores que quieran medir latencia y consumo en dispositivos reales.
- Banco de pruebas de rendimiento móvil: el harness `home_brief` permite comparar variantes de cuantización y backends (GPU OpenCL frente a CPU) sobre el mismo conjunto de alertas.
- Prototipado de asistentes de hogar conectado: el contrato JSON facilita la integración con sistemas de automatización que esperan acciones discretas en lugar de texto libre.
- Evaluación de ajuste fino con LoRA sobre Gemma 4: el repositorio documenta el proceso de entrenamiento con 2.400 ejemplos balanceados y máscara de pérdida, lo que lo convierte en una referencia para experimentos similares.
- Inferencia en escritorio sin GPU dedicada: la CLI `litert-lm` permite ejecutar el bundle en macOS y Linux para validar el comportamiento antes de desplegarlo en móvil.
- Filtrado previo en pipelines de notificaciones: al ser un clasificador determinista y ligero, puede actuar como primera etapa antes de invocar modelos mayores o servicios en la nube.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Latencia p50 (Oppo Find N3, GPU) | 0,75 s |
| TTFT (time to first token) | 0,50 s |
| Latencia mínima observada | 0,51 s |
| Tamano del bundle | 2,56 GiB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son las latencias medidas en el dispositivo de referencia.

## Requisitos de hardware

- VRAM/RAM estimada: el bundle ocupa 2,56 GiB en disco; en ejecución se recomienda al menos 3-4 GiB de memoria disponible en el dispositivo.
- GPU recomendadas: GPU OpenCL en Android (probado en Oppo Find N3); en escritorio, la CLI `litert-lm` puede ejecutarse en macOS y Linux, aunque no se especifican modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no se documenta soporte para RTX 4090, A100 o H100; el formato `.litertlm` está orientado a LiteRT-LM, no a vLLM o llama.cpp.
- Opciones de despliegue: LiteRT-LM v1.7.0 (CLI y API Python), `flutter_gemma_litertlm` en Flutter para Android.
- Latencia y throughput: 0,75 s p50 y 0,50 s TTFT en Oppo Find N3 con backend GPU; no se reportan métricas de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Home Brief Gemma 4 E2B (este) | no disponible | no disponible | `.litertlm` int4 | Gemma Terms | Clasificador de una tarea on-device |
| google/gemma-4-E2B-it | no disponible | no disponible | safetensors (base) | Gemma Terms | Modelo instructivo general |
| Gemma 3 270M / 1B (versiones anteriores) | 270M / 1B | no disponible | safetensors, GGUF | Gemma Terms | Modelos pequeños para on-device |
| Qwen2.5-0.5B-Instruct | 0,5B | 32K | safetensors, GGUF | Apache 2.0 | Modelo pequeño generalista |

La comparación es limitada porque no se dispone de datos de parámetros ni contexto del modelo base Gemma 4 E2B en la información proporcionada. La diferencia clave frente a alternativas generalistas es que este bundle está especializado en una única tarea con contrato JSON fijo y empaquetado para LiteRT-LM, lo que limita su reutilización fuera de ese ecosistema.

## Limitaciones y advertencias

- Modelo altamente especializado: solo responde correctamente al contrato de prompt y al formato JSON para el que fue ajustado; fuera de ese contexto su comportamiento no está garantizado.
- Sin datos de benchmarks generales: no se han publicado resultados en MMLU, HumanEval, GSM8K ni evaluaciones multilingües.
- Idiomas no documentados: la model card no especifica qué idiomas soporta el ajuste.
- Riesgo de alucinación en la clasificación: aunque el entrenamiento con máscara de pérdida y muestreo determinista reduce la variabilidad, el modelo puede producir acciones incorrectas ante eventos ambiguos o fuera de distribución.
- Licencia Gemma Terms of Use: impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos antes de un despliegue en producción.
- Dependencia del ecosistema LiteRT-LM: el formato `.litertlm` no es directamente compatible con vLLM, llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue.
- Sin soporte documentado de tool calling general, agentes multi-paso, visión ni audio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Los resultados de latencia provienen de un único dispositivo (Oppo Find N3) y no son necesariamente representativos de otros hardware.

## Enlaces

- Hugging Face: https://huggingface.co/Einzeln/home-brief-gemma-4-e2b-litertlm
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Blog (KBTG Life / Medium): https://medium.com/kbtg-life/how-to-fine-tune-gemma-4-for-real-time-on-device-ai-330a479073d9
- Código y harness: https://github.com/theamorn/home_brief
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
