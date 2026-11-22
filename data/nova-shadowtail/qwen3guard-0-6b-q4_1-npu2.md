# nova-shadowtail/Qwen3Guard-0.6B-Q4_1-NPU2

## Resumen

Qwen3Guard-0.6B-Q4_1-NPU2 es una cuantización comunitaria del modelo de moderación Qwen3Guard-Gen-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba. El modelo base es un modelo generativo de clasificación de seguridad construido sobre la arquitectura Qwen3, entrenado sobre un corpus de 1,19 millones de pares prompt-respuesta etiquetados por seguridad. Su función no es conversacional general, sino evaluar si un texto (prompt de usuario o respuesta de un modelo) es seguro, controvertido o inseguro, y clasificar la categoría de riesgo.

La versión aquí descrita la publica el usuario nova-shadowtail y su propósito concreto es hacer ejecutable el modelo en las NPU de AMD (procesadores Ryzen con unidad NPU) bajo Fedora 44 mediante el runtime FastFlowLM. Para ello se convirtió el modelo a GGUF en cuantización Q4_1 con los scripts de llama.cpp y posteriormente se transformó al formato propietario `model.q4nx` que consume FastFlowLM, usando la sección de exportación de Unsloth.

Es relevante porque permite desplegar un clasificador de seguridad de 0,75 mil millones de parámetros en hardware de consumo con NPU integrada, sin GPU dedicada, lo que facilita filtrado de contenido en local y con baja latencia. El modelo base soporta 119 idiomas y dialectos según su documentación original, aunque la model card de esta cuantización solo declara inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3), variante generativa de clasificación de seguridad |
| Parametros totales | 751.632.384 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_1 (GGUF) convertido a `model.q4nx` para FastFlowLM |
| Idiomas soportados | Inglés declarado en esta cuantización; el modelo base declara 119 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_1) y formato propietario `model.q4nx` de FastFlowLM; incluye config.json, tokenizer.json y tokenizer_config.json |

## Arquitectura y entrenamiento

El modelo base Qwen3Guard-Gen-0.6B es un transformer decoder-only de la familia Qwen3, ajustado para tratar la clasificación de seguridad como una tarea de seguimiento de instrucciones: recibe un prompt (o un par prompt-respuesta) y genera una salida estructurada con etiquetas `Safety: Safe|Unsafe|Controversial`, `Categories: ...` y, en el caso de moderación de respuestas, `Refusal: Yes|No`. El entrenamiento se realizó sobre un dataset de 1,19 millones de prompts y respuestas etiquetados por seguridad, según el informe técnico de Qwen3Guard (arXiv:2510.14276). La serie incluye variantes Gen (generativa) y Stream (con cabeza de clasificación a nivel de token para monitorización en tiempo real); esta ficha corresponde a la variante Gen.

La innovación principal del modelo base es la clasificación de severidad en tres niveles (safe, controversial, unsafe), que permite calibrar umbrales de bloqueo según el caso de uso, junto con un conjunto cerrado de categorías de riesgo (violencia, actos ilegales no violentos, contenido sexual, PII, suicidio y autolesión, actos no éticos, temas políticamente sensibles, violación de copyright y jailbreak). Esta cuantización concreta no modifica la arquitectura: aplica cuantización de pesos a 4 bits (Q4_1) y una conversión de formato para el runtime NPU de FastFlowLM. No se dispone de información sobre el proceso exacto de calibración de la cuantización ni sobre pérdida de precisión respecto al modelo original.

## Capacidades

- Clasificación de seguridad de prompts de usuario en tres niveles: safe, controversial y unsafe.
- Clasificación de seguridad de respuestas generadas por otros modelos, incluyendo detección de rechazo (`Refusal: Yes|No`).
- Etiquetado de categorías de riesgo: Violent, Non-violent Illegal Acts, Sexual Content or Sexual Acts, PII, Suicide & Self-Harm, Unethical Acts, Politically Sensitive Topics, Copyright Violation, Jailbreak.
- Detección de intentos de jailbreak.
- Capacidad multilingüe heredada del modelo base (119 idiomas y dialectos según documentación original), aunque esta cuantización solo declara inglés.
- Generación de texto estructurado como formato de salida de la clasificación.
- No soporta tool calling ni function calling de forma declarada.
- No se declaran capacidades de agente, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Filtrado de entrada en aplicaciones de chat: antes de enviar el prompt del usuario al modelo principal, se ejecuta Qwen3Guard para obtener la etiqueta de seguridad y bloquear o marcar prompts unsafe, con la ventaja de que el modelo de 0,6B cabe en NPU y añade latencia mínima.
- Moderación de salidas de modelos generativos: se evalúa la respuesta del LLM principal con la variante de moderación de respuestas, que además indica si el modelo ha rechazado la petición, útil para auditar políticas de rechazo.
- Detección de jailbreaks en producción: la categoría específica de Jailbreak permite construir un clasificador binario de intentos de manipulación sobre el modelo de seguridad, integrándolo como paso previo en el pipeline de inferencia.
- Cumplimiento y auditoría de contenido en despliegues locales: al ejecutarse en NPU AMD Ryzen bajo Fedora con FastFlowLM, permite moderar datos sensibles sin enviarlos a la nube, lo que encaja en entornos con requisitos de privacidad.
- Etiquetado de datasets de seguridad: el modelo puede usarse para preetiquetar grandes corpus de prompts y respuestas con las categorías de riesgo, acelerando la curación de datos de entrenamiento o evaluación.
- Servicio de moderación como API: mediante `flm serve Qwen3Guard:0.6b --port 8080` se expone el modelo como servidor HTTP, lo que permite integrarlo como microservicio de moderación en arquitecturas existentes.
- Protección de aplicaciones educativas o infantiles: el nivel intermedio "controversial" permite aplicar políticas más estrictas en contextos sensibles sin bloquear todo el contenido dudoso de forma binaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantización concreta. El modelo base Qwen3Guard-Gen-0.6B declara resultados state-of-the-art en benchmarks de seguridad según su model card original, pero no se proporcionan cifras numéricas en la información disponible, por lo que no se presentan tablas comparativas.

## Requisitos de hardware

- VRAM estimada: al tratarse de una cuantización Q4_1 de un modelo de 751 millones de parámetros, el peso de los pesos ronda los 0,4-0,5 GB; el repositorio completo ocupa 1,2 GB incluyendo el GGUF original y los ficheros de configuración.
- Hardware objetivo: NPU integrada en procesadores AMD Ryzen, ejecutada mediante FastFlowLM bajo Fedora 44. No se especifican modelos de Ryzen concretos en la información disponible.
- GPU dedicadas: no son necesarias para esta variante; el modelo está empaquetado para NPU, no para CUDA.
- Cabe en hardware de consumo: sí, por tamaño y cuantización, en equipos con NPU AMD Ryzen compatibles con FastFlowLM.
- Opciones de despliegue: FastFlowLM (`flm run` para CLI y `flm serve` para servidor API en el puerto 8080), con instalación previa mediante `pip install flm-add`. El GGUF original incluido en el repositorio podría en teoría ejecutarse con llama.cpp u otros runtimes GGUF, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen3Guard-0.6B-Q4_1-NPU2 (esta ficha) | 751.632.384 | No disponible | Inglés declarado (base: 119) | Apache 2.0 | GGUF Q4_1 + q4nx, NPU AMD vía FastFlowLM |
| Qwen3Guard-Gen-0.6B (base) | 0,6B | No disponible | 119 idiomas y dialectos | Apache 2.0 | Safetensors, transformers >= 4.51.0 |
| Qwen3Guard-Gen-4B | 4B | No disponible | 119 idiomas y dialectos | Apache 2.0 | Safetensors, transformers |
| Qwen3Guard-Gen-8B | 8B | No disponible | 119 idiomas y dialectos | Apache 2.0 | Safetensors, transformers |

La comparativa se limita a la propia familia Qwen3Guard porque la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos de moderación alternativos de otros desarrolladores. La diferencia clave de esta variante frente al modelo base es el formato y el target de hardware (NPU AMD), no la arquitectura ni el entrenamiento.

## Limitaciones y advertencias

- Es una cuantización comunitaria no oficial: el autor es un tercero (nova-shadowtail), no el equipo Qwen, por lo que no hay garantía de equivalencia exacta con el modelo original.
- La cuantización Q4_1 puede degradar la precisión de clasificación respecto al modelo en precisión completa; no se han publicado métricas de esa degradación.
- La model card de esta variante solo declara inglés, pese a que el modelo base soporta 119 idiomas; el rendimiento multilingüe de esta cuantización no está verificado.
- El formato `model.q4nx` es específico de FastFlowLM y está atado a NPU AMD Ryzen bajo Fedora 44; no es portable a otros runtimes sin reconversión.
- Riesgo de alucinación y de clasificación errónea inherente a un modelo de 0,6B: puede producir etiquetas incorrectas en casos límite, por lo que no debería ser el único mecanismo de moderación en producción.
- Sesgos heredados del dataset de entrenamiento del modelo base (1,19 millones de pares etiquetados): la composición y cobertura del dataset no se detallan en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del runtime FastFlowLM por separado.
- No se documentan la longitud de contexto ni el rendimiento en latencia de esta variante, lo que dificulta planificar despliegues con requisitos estrictos.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/nova-shadowtail/Qwen3Guard-0.6B-Q4_1-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen3Guard-Gen-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3Guard-Gen-0.6B/blob/main/LICENSE
- Blog de Qwen3Guard: https://qwen.ai/blog?id=f0bbad0677edf58ba93d80a1e12ce458f7a80548&from=research.research-list
- GitHub de Qwen3Guard: https://github.com/QwenLM/Qwen3Guard
- Informe técnico de Qwen3: https://github.com/QwenLM/Qwen3/blob/main/Qwen3_Technical_Report.pdf
- Paper Qwen3Guard (arXiv): https://arxiv.org/abs/2510.14276
