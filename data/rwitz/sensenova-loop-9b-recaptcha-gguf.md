# rwitz/sensenova-loop-9b-recaptcha-gguf

## Resumen

SenseNova-Loop-9B reCAPTCHA es una cuantización GGUF de un ajuste fino del modelo multimodal SenseNova-Loop-9B, publicado por el usuario rwitz en Hugging Face. El modelo base lo desarrolla SenseNova y emplea una arquitectura propietaria denominada `sensenova_loop`, con aproximadamente 8.956 millones de parámetros (8,96 mil millones). El ajuste fino se ha realizado con LoRA y posteriormente se ha fusionado con el modelo base, especializándolo en la resolución de puzles de reCAPTCHA.

La relevancia de esta publicación es doble. Por un lado, demuestra la aplicación de un modelo multimodal de casi 9B a una tarea concreta de visión e interacción visual, lo que resulta útil como referencia para pipelines de automatización de pruebas o investigación sobre robustez de CAPTCHAs. Por otro, expone una limitación práctica importante: la arquitectura `sensenova_loop` no está soportada por llama.cpp estándar, por lo que requiere un fork específico (`llama.cpp-sensenova-loop`, rama `sensenova-loop`) para su ejecución.

El repositorio incluye dos cuantizaciones del modelo de lenguaje (Q8_0 y Q4_K_M) y un proyector multimodal en F16 (`mmproj`), lo que confirma que el modelo conserva capacidades de visión tras el ajuste. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `sensenova_loop` (transformer multimodal, no soportada en llama.cpp estándar) |
| Parametros totales | 8.956.949.376 (≈8,96B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M; proyector multimodal en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura propietaria identificada como `sensenova_loop`, que no forma parte de las arquitecturas soportadas por llama.cpp estándar. El ajuste fino publicado se realizó mediante LoRA sobre el modelo base y posteriormente se fusionó en los pesos, dando lugar a un modelo especializado en puzles de reCAPTCHA. El repositorio incluye un proyector multimodal independiente (`mmproj-sensenova-loop-9b-recaptcha-F16.gguf`), lo que indica que el modelo conserva la torre de visión del base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF o DPO. La model card indica explícitamente que el modelo se entrenó sin modo de razonamiento (*thinking*), por lo que debe ejecutarse con el thinking desactivado. Las cuantizaciones publicadas son Q8_0 y Q4_K_M, generadas presumiblemente con el fork de llama.cpp compatible con la arquitectura.

## Capacidades

- Generación de texto conversacional, heredada del modelo base SenseNova-Loop-9B.
- Procesamiento multimodal de imágenes mediante el proyector `mmproj` en F16, necesario para la tarea de reCAPTCHA.
- Resolución de puzles de reCAPTCHA: capacidad específica para la que fue ajustado el modelo.
- Ejecución en modo sin razonamiento (*thinking* desactivado), tal como se entrenó.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Automatización de pruebas de accesibilidad y robustez de CAPTCHAs: el modelo puede emplearse para evaluar la resistencia de implementaciones de reCAPTCHA frente a agentes automatizados, dentro de un entorno controlado y con autorización.
- Investigación en seguridad de sistemas anti-bot: sirve como referencia para estudiar qué tipos de puzles visuales son vulnerables a modelos multimodales de ~9B y orientar el diseño de alternativas.
- Evaluación de modelos multimodales en tareas visuales específicas: permite comparar el rendimiento de la arquitectura `sensenova_loop` frente a otros modelos en tareas de percepción e interacción visual.
- Desarrollo de pipelines de interacción visual con modelos GGUF: el par LLM + `mmproj` sirve como ejemplo de despliegue multimodal con llama.cpp y un servidor compatible.
- Pruebas de integración de arquitecturas no estándar en llama.cpp: útil para equipos que necesiten validar el fork `llama.cpp-sensenova-loop` en sus infraestructuras.
- Experimentación con cuantizaciones Q4_K_M y Q8_0 en tareas visuales: permite medir la degradación de precisión entre ambas cuantizaciones en un caso de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 16,1 GB en total, incluyendo ambas cuantizaciones y el proyector. La cuantización Q4_K_M requiere aproximadamente 5-6 GB para los pesos del LLM, mientras que Q8_0 requiere aproximadamente 9-10 GB; a ello hay que sumar el proyector F16 y el contexto de inferencia.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 permitirían ejecutar cualquiera de las dos cuantizaciones con holgura.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs con 12 GB o más para Q4_K_M y 16 GB o más para Q8_0, aunque no se confirma en la información disponible.
- Opciones de despliegue: obligatorio el fork `llama.cpp-sensenova-loop` (rama `sensenova-loop`) con su `llama-server`; la model card menciona su uso con textgen mediante `--llama-server-path`. No es compatible con llama.cpp estándar, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (multimodales de ~9B ajustados para CAPTCHA) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La arquitectura `sensenova_loop` no está soportada por llama.cpp estándar; requiere el fork `llama.cpp-sensenova-loop`, lo que limita la portabilidad y el soporte a largo plazo.
- El modelo debe ejecutarse con el modo de razonamiento (*thinking*) desactivado, ya que se entrenó sin él; usarlo con thinking puede degradar los resultados.
- El ajuste fino está especializado en reCAPTCHA, lo que puede reducir el rendimiento en tareas generales respecto al modelo base.
- No se dispone de información sobre sesgos, riesgo de alucinación ni comportamiento en idiomas distintos del usado en el ajuste.
- El uso del modelo para resolver CAPTCHAs de terceros puede vulnerar los términos de servicio de los sitios web y, en determinadas jurisdicciones, la legislación aplicable; debe restringirse a entornos controlados y con autorización.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `sensenova/SenseNova-Loop-9B` y de las dependencias del fork de llama.cpp.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No se especifican la longitud de contexto ni los idiomas soportados, lo que dificulta planificar su uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rwitz/sensenova-loop-9b-recaptcha-gguf
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Fork de llama.cpp requerido: https://github.com/GuideboardLabs/llama.cpp-sensenova-loop (rama `sensenova-loop`)
