# mradermacher/Qwen3-Coder-Next-Uncensored-Heretic-GGUF

## Resumen

`mradermacher/Qwen3-Coder-Next-Uncensored-Heretic-GGUF` es una colección de pesos cuantizados en formato GGUF del modelo `llmfan46/Qwen3-Coder-Next-Uncensored-Heretic`, una variante "abliterated" (sin censura) del modelo de código Qwen3-Coder-Next desarrollado por el equipo Qwen. El autor de la cuantización, mradermacher (de la empresa nethype GmbH), publica estos ficheros para su uso con motores de inferencia locales como llama.cpp, Ollama o LM Studio, facilitando el despliegue en hardware de consumo y entornos sin acceso a servicios en la nube.

El modelo base original cuenta con aproximadamente 79.700 millones de parámetros, lo que lo sitúa en la gama alta de los modelos de generación de código. La versión "Heretic" aplica técnicas de ablación de capas de rechazo (abliteration) para eliminar los mecanismos de seguridad que impiden respuestas sobre temas sensibles o contenido explícito. Esto lo hace atractivo para desarrolladores que necesitan un modelo sin restricciones en tareas de generación de código, depuración o análisis técnico, aunque con las advertencias éticas y legales correspondientes.

La relevancia actual de este modelo radica en la demanda creciente de modelos de código open source con pesos cuantizados listos para ejecución local, especialmente en la comunidad de IA "uncensored" que busca alternativas a las restricciones impuestas por los modelos comerciales. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que facilita su integración en productos propietarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer denso o MoE, sin confirmar) |
| Parametros totales | 79.674.391.296 (~79,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (29,4 GB), Q4_K_S (45,6 GB) |
| Idiomas soportados | inglés (según metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors del modelo base no incluido) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `Qwen3-Coder-Next`. Por el nombre, se deduce que pertenece a la familia Qwen3-Coder, la línea especializada en generación de código de Alibaba Cloud, que utiliza arquitectura transformer con atención global. El número de parámetros (79,7B) sugiere un modelo denso, aunque no se puede descartar una variante MoE sin datos adicionales.

El proceso de "abliteration" (técnica que elimina las capas de rechazo aprendidas durante el RLHF) fue aplicado por el autor del modelo base, `llmfan46`, para producir la variante "Uncensored-Heretic". Posteriormente, mradermacher realizó la cuantización estática a formato GGUF utilizando herramientas estándar de la comunidad (probablemente llama.cpp). No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el método exacto de ablación.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada de Qwen3-Coder (aunque no hay confirmación específica para esta variante).
- Razonamiento técnico y resolución de problemas de programación, depuración y refactorización.
- Soporte de conversación multi-turno (indicado por el tag `conversational`).
- Capacidad de seguir instrucciones complejas sin los bloqueos de seguridad habituales, gracias a la ablación de capas de rechazo.
- No se confirma soporte de tool calling, function calling, agentes o modos de pensamiento extendido, ya que no aparece en la documentación disponible.
- Multilingüismo limitado: solo se especifica inglés en los metadatos.

## Casos de uso

- Generación de código en entornos sin conexión: el formato GGUF permite ejecutar el modelo en portátiles o servidores con GPU de gama media, sin depender de APIs externas, ideal para equipos con políticas de privacidad estrictas.
- Asistencia en auditorías de seguridad ofensiva: al no tener restricciones de contenido, puede ayudar a redactar scripts de prueba de penetración o analizar vulnerabilidades sin filtros (con las debidas consideraciones legales).
- Depuración de código heredado: su capacidad para razonar sobre código existente y sugerir correcciones puede aplicarse a proyectos legacy con documentación escasa.
- Entrenamiento de modelos más pequeños: los pesos cuantizados pueden usarse como profesor para destilar conocimiento en modelos compactos mediante técnicas de fine-tuning.
- Investigación en alineación y seguridad de IA: la versión abliterated permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, comparando respuestas con la versión original.
- Desarrollo de chatbots de rol o narrativa interactiva: la ausencia de censura facilita la creación de personajes o historias con contenido adulto, un caso de uso común en la comunidad de roleplay.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otras pruebas estándar para esta variante específica. La ausencia de métricas oficiales y el hecho de que el modelo tenga cero descargas sugieren que aún no ha sido evaluado de manera independiente.

## Requisitos de hardware

- Para el cuant Q4_K_S (45,6 GB de pesos): se recomienda una GPU con al menos 48 GB de VRAM (por ejemplo, A6000, A100 80GB, o dos RTX 4090 en paralelo con reparto de capas). Con cuantización y offloading a CPU, podría ejecutarse en 32 GB de VRAM con mayor latencia.
- Para el cuant Q2_K (29,4 GB): una GPU de 32 GB (como RTX A6000 o 2x RTX 3090) es suficiente para inferencia completa en GPU. También es viable en una RTX 4090 de 24 GB con offloading parcial.
- No es realista ejecutar este modelo en GPUs de consumo de 8-12 GB sin cuantizaciones más agresivas (no disponibles en este repo).
- Opciones de despliegue: llama.cpp, Ollama (tras conversión), LM Studio, text-generation-webui, y cualquier motor compatible con GGUF. También puede usarse con vLLM si se convierte a formato safetensors, aunque el repo solo ofrece GGUF.
- Latencia y throughput estimados: no disponibles, pero para un modelo de ~80B en Q4_K_S, se espera una generación de 10-20 tokens/s en hardware de gama alta (A100 80GB) con llama.cpp.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente. La categoría de "modelos de código sin censura" incluye alternativas como `Qwen3-Coder-Next-REAP-40B-A3B` (también cuantizado por mradermacher) o versiones abliterated de otros modelos, pero no hay datos de rendimiento para establecer una comparación objetiva. El modelo base original (Qwen3-Coder-Next) no tiene benchmarks públicos en esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3-Coder-Next-Uncensored-Heretic (este) | ~79,7B | no disponible | Apache 2.0 | GGUF |
| Qwen3-Coder-Next-REAP-40B-A3B | 40B activos (A3B) | no disponible | Apache 2.0 | GGUF |
| Qwen3-Coder (versión oficial) | varias | no disponible | Apache 2.0 | safetensors |

## Limitaciones y advertencias

- La ablación de capas de rechazo elimina las salvaguardas de seguridad, lo que puede generar contenido ofensivo, ilegal o peligroso. El uso debe ser responsable y conforme a la legislación local.
- Solo se ha confirmado soporte para inglés; el rendimiento en otros idiomas es desconocido.
- No hay benchmarks publicados, por lo que la calidad real del modelo en tareas de código no está verificada.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica una adopción nula hasta la fecha y posible falta de pruebas en entornos reales.
- Los quants ofrecidos son estáticos (sin imatrix), lo que puede implicar una pérdida de calidad frente a versiones con importancia de activaciones.
- Licencia Apache 2.0 permite uso comercial, pero el autor del modelo base (llmfan46) no garantiza que los pesos cumplan con todas las normativas de contenido.
- Para producción, se recomienda evaluar el modelo exhaustivamente antes de desplegarlo, dado que no hay datos de fiabilidad.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/mradermacher/Qwen3-Coder-Next-Uncensored-Heretic-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/llmfan46/Qwen3-Coder-Next-Uncensored-Heretic
- Repositorio oficial de Qwen3-Coder en GitHub: https://github.com/QwenLM/Qwen3-Coder
- Guía de mradermacher para solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Página de descarga del modelo (según model card): https://hf.tst.eu/model#Qwen3-Coder-Next-Uncensored-Heretic-GGUF
