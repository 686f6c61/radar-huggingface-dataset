# cantonese-dev/cantonese-1.2-0.6b

## Resumen

Cantonese-1.2-0.6b es un modelo de lenguaje publicado en HuggingFace por el usuario cantonese-dev bajo licencia Apache 2.0. Por el nombre y el tamaño del repositorio, se trata de un modelo orientado al idioma cantonés (variedad prestigiosa del chino yue) con aproximadamente 0,6 mil millones de parámetros, aunque los pesos en formato safetensors suman 914.643.008 parámetros totales. El repositorio ocupa 1,8 GB y se distribuye únicamente en formato safetensors.

La model card publicada por el autor está prácticamente vacía: solo incluye la declaración de licencia Apache 2.0, sin información sobre arquitectura, datos de entrenamiento, tokenizador, contexto ni capacidades. No hay pipeline declarado, no hay idiomas listados en los metadatos y el modelo registra 0 descargas y 1 like en el momento de la consulta. Fue creado y actualizado el 3 de noviembre de 2026, con apenas 14 minutos entre ambas fechas, lo que sugiere una publicación recién subida y sin documentación asociada.

Por tanto, esta ficha se basa en los metadatos verificables del repositorio (tamaño, formato, licencia, número de parámetros) y en inferencias razonables a partir del nombre del modelo. Cualquier dato sobre entrenamiento, rendimiento o capacidades debe considerarse no disponible hasta que el autor publique documentación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 914.643.008 (según safetensors) |
| Parametros activos | no aplica (no hay indicios de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | cantonés (por el nombre del modelo); no confirmado en metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card. El nombre "cantonese-1.2-0.6b" sugiere una versión 1.2 de una familia de modelos con 0,6 mil millones de parámetros, pero el recuento real de safetensors (914,6 M) indica que el total de parámetros es superior al que sugiere el sufijo. Es habitual que el sufijo "0.6b" haga referencia a los parámetros activos o a una convención interna del autor, pero no hay documentación que lo aclare.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. No se han publicado innovaciones técnicas (atención lineal, decodificación especulativa, mezcla de expertos, etc.). Toda la información relativa a arquitectura y entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de texto en cantonés: es la capacidad implícita principal según el nombre del modelo, aunque no está documentada.
- Capacidades multilingües: no disponibles; no se listan idiomas en los metadatos más allá de la etiqueta "cantonese".
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades de código, matemáticas o visión: no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Cualquier otra capacidad especial: no disponible.

## Casos de uso

Dado que no hay documentación funcional, los casos de uso son hipótesis razonables basadas en el nombre y el tamaño del modelo. Deben validarse empíricamente antes de llevarlos a producción.

- Procesamiento de texto en cantonés: el modelo podría emplearse para normalización, resumen o reescritura de textos en cantonés, aprovechando su especialización idiomática declarada en el nombre.
- Prototipado rápido en entornos con recursos limitados: con menos de mil millones de parámetros, cabe en GPUs de consumo y permite iterar sin infraestructura dedicada.
- Generación de respuestas conversacionales en cantonés para asistentes locales: adecuado por tamaño para despliegues en el borde o en servidores modestos, siempre que se valide la calidad del cantonés generado.
- Transcripción asistida o post-procesado de subtítulos en cantonés: podría usarse como componente de un pipeline ASR + LLM para corregir y formatear transcripciones.
- Fine-tuning específico de dominio: al ser Apache 2.0 y tener un tamaño manejable, sirve como base para ajuste supervisado en tareas concretas (atención al cliente, FAQ, extracción de información) en cantonés.
- Investigación lingüística computacional sobre el chino yue: útil como punto de partida para estudiar el comportamiento de modelos pequeños en lenguas de bajos recursos.
- Experimentación educativa: por su tamaño y licencia permisiva, es apto para laboratorios y cursos que necesiten un modelo pequeño entrenado en una lengua no inglesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,5 GB para pesos (requiere convertir a GGUF u otro formato, ya que el repo solo ofrece safetensors).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede alojar el modelo en fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para servir en producción, una T4, L4 o A10 bastan.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales (GTX 1650 en adelante, con cuantización).
- Opciones de despliegue: transformers con PyTorch es la vía directa al no haber GGUF publicado; llama.cpp u Ollama requerirían conversión previa; vLLM y TGI son compatibles si la arquitectura es un transformer estándar, aunque no está confirmado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cantonese-dev/cantonese-1.2-0.6b | 914,6 M | no disponible | Apache 2.0 | HuggingFace, solo safetensors |
| Qwen2.5-0.5B | 494 M | 32 768 tokens (según documentación pública de Qwen) | Apache 2.0 | HuggingFace, safetensors y GGUF |
| Gemma-2-2B | 2,6 B | 8 192 tokens (según documentación pública de Google) | Gemma Terms of Use | HuggingFace, safetensors y GGUF |
| Yi-1.5-6B | 6 B | 4 096 tokens (según documentación pública de 01.AI) | Apache 2.0 | HuggingFace, safetensors |

La comparación con alternativas es difícil porque no hay datos de rendimiento del modelo cantonese. Frente a Qwen2.5-0.5B, el modelo de cantonese-dev tiene más parámetros totales pero carece de documentación y de formatos cuantizados publicados. Gemma-2-2B y Yi-1.5-6B son modelos multilingües de mayor tamaño con ecosistemas maduros, pero no están especializados en cantonés.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe arquitectura, datos, tokenizador ni evaluación, lo que impide verificar su calidad o idoneidad.
- Riesgo de alucinación: sin datos de alineación ni benchmarks, no hay garantías sobre la fiabilidad de las respuestas.
- Idiomas: no se confirma oficialmente qué idiomas soporta; la etiqueta "cantonese" sugiere especialización, pero podría degradar el rendimiento en otros idiomas.
- Contexto: se desconoce la ventana de contexto, lo que impide planificar casos de uso con documentos largos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Madurez: 0 descargas y publicación reciente (noviembre de 2026) indican que el modelo no ha sido validado por la comunidad.
- Formato: solo safetensors; no hay GGUF ni cuantizaciones listas, lo que añade trabajo para despliegues en CPU o GPUs modestas.
- Sesgos: no disponibles; al no haber información sobre el corpus, no se pueden evaluar sesgos lingüísticos o culturales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cantonese-dev/cantonese-1.2-0.6b
- Wikipedia, Cantonese: https://en.wikipedia.org/wiki/Cantonese
- Wikipedia, Cantonese people: https://en.wikipedia.org/wiki/Cantonese_people
- Learn Cantonese: https://www.learn-cantonese.com/
- Cantonese.hk: https://cantonese.hk/
