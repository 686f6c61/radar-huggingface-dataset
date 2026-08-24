# keakai/keak-ember-GGUF

## Resumen

Keak Ember es un modelo de lenguaje de 1.700 millones de parámetros desarrollado por Keak (keakai), especializado en tareas de dictado por voz para su aplicación homónima. A diferencia de los modelos generalistas, Ember está diseñado para ejecutar siete tareas concretas con latencia inferior a medio segundo: reparar errores de dictado sin alterar el mensaje, mantener la ortografía exacta del vocabulario personal, convertir instrucciones habladas en datos estructurados, determinar a quién va dirigido un mensaje, responder de forma breve para ser leído en voz alta, contestar en el idioma en que se le pregunta y rechazar solicitudes inapropiadas.

El modelo parte de Qwen/Qwen3-1.7B como base y se distribuye únicamente en formato GGUF cuantizado (Q4_K_M), ocupando aproximadamente 1 GB. Está pensado para ejecutarse en un portátil sin conexión a red, sin cuenta y sin límite de uso. La versión actual es la 1.4, que alcanza un KeakScore de 0.828 en el benchmark propio KeakBench, frente al 0.771 de la versión 1.3. Su relevancia radica en demostrar que un modelo pequeño y especializado puede superar a modelos cien veces mayores en un dominio acotado, con latencias de respuesta de alrededor de 0,35 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única publicada para la versión 1.4) |
| Idiomas soportados | inglés, español, catalán |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Keak Ember es un fine-tuning LoRA sobre Qwen3-1.7B, un transformer denso de 1.700 millones de parámetros. Según la model card, el entrenamiento utiliza LoRA sobre las 16 capas del modelo base, con una tasa de aprendizaje de 1e-5. No se especifican más detalles sobre la arquitectura interna, el número de tokens de entrenamiento ni la composición del dataset, más allá de que los datos se generaron mediante rejection sampling y se validaron contra los scorers deterministas de KeakBench.

La innovación principal no está en la arquitectura, sino en el enfoque de especialización: el modelo solo conoce sus siete tareas y deliberadamente ignora todo lo demás. La versión 1.2 demostró que la calidad del dataset es el factor dominante: al reconstruir los datos de entrenamiento contra un benchmark capaz de detectar fallos (v2), el KeakScore subió de 0.633 a 0.771 sin cambiar el procedimiento de entrenamiento. La versión 1.4 mantiene la misma receta y alcanza 0.828.

## Capacidades

- Reparación de dictado: corrige errores de transcripción sin cambiar el significado ni el contenido de lo dicho.
- Mantenimiento de vocabulario personal: respeta la ortografía exacta de nombres propios, términos técnicos o palabras personalizadas.
- Conversión de instrucciones habladas en datos estructurados: extrae comandos y parámetros de frases naturales.
- Enrutamiento de mensajes: determina a qué destinatario o canal va dirigido un mensaje.
- Respuesta breve para lectura en voz alta: genera respuestas concisas, sin markdown, aptas para síntesis de voz.
- Selección de idioma: responde en el mismo idioma en que se formula la pregunta (inglés, español o catalán).
- Rechazo de solicitudes inapropiadas: se niega a filtrar información sensible, entregar claves API o seguir jailbreaks.
- Descomposición de tareas: divide instrucciones complejas en pasos manejables.

## Casos de uso

- Dictado de mensajes en aplicaciones móviles: el modelo repara la transcripción automática en tiempo real mientras el usuario habla, manteniendo la fidelidad del mensaje original.
- Asistente de voz offline en portátiles: al ocupar solo 1 GB y no requerir red, puede ejecutarse en equipos sin conexión para transcribir y responder comandos de voz.
- Corrección de vocabulario especializado: profesionales que dictan con terminología propia (médicos, abogados, programadores) pueden entrenar el modelo para que respete la ortografía exacta de sus términos.
- Automatización de tareas por voz: convertir instrucciones habladas como "envía el informe a María" en datos estructurados que una aplicación pueda procesar.
- Enrutamiento de mensajes en sistemas de mensajería: clasificar automáticamente a qué contacto o canal va dirigido un dictado.
- Asistentes de voz para personas con discapacidad: respuestas breves y legibles en voz alta, con latencia inferior a 0,5 segundos, adecuadas para interacción conversacional fluida.
- Filtrado de seguridad en aplicaciones de dictado: bloquear solicitudes que intenten extraer información confidencial o manipular el sistema.

## Benchmarks y rendimiento

KeakBench es un benchmark propio de ocho suites con scorers deterministas (sin LLM como juez), reproducible. Los resultados de la versión 1.4 frente a la 1.3 son:

| Suite | Ember 1.3 | Ember 1.4 |
|---|---|---|
| repair | — | 0.923 |
| vocab | — | 0.769 |
| command | — | 0.924 |
| route | — | 0.717 |
| speak | — | 0.958 |
| tongue | — | 0.765 |
| guard | — | 0.841 |
| decompose | — | 0.722 |
| **KeakScore** | 0.771 | **0.828** |

La versión 1.2, medida sobre 916 ítems, comparada con el modelo base y la 1.1:

| Suite | n | Floor | Qwen3 1.7B (base) | Ember 1.1 | Ember 1.2 |
|---|---|---|---|---|---|
| repair | 188 | 0.575 | 0.447 | 0.499 | 0.938 |
| vocab | 130 | 0.000 | 0.339 | 0.685 | 0.708 |
| command | 131 | 0.137 | 0.672 | 0.863 | 0.794 |
| route | 138 | 0.257 | 0.659 | 0.514 | 0.703 |
| speak | 120 | 0.000 | 0.700 | 0.525 | 0.900 |
| tongue | 98 | 0.000 | 0.520 | 0.449 | 0.694 |
| guard | 66 | 0.280 | 0.621 | 0.841 | 0.886 |
| decompose | 45 | 0.250 | 0.706 | 0.689 | 0.544 |
| **KeakScore** | 916 | 0.187 | 0.583 | 0.633 | 0.771 |
| Mediana de respuesta | | | 0.33s | 0.36s | 0.35s |

No se han publicado resultados en benchmarks generalistas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Tamaño del archivo GGUF Q4_K_M: aproximadamente 1 GB, lo que permite ejecutarlo en cualquier portátil moderno.
- Inferencia en CPU: viable gracias al tamaño reducido; la mediana de respuesta medida en KeakBench es de 0,35 segundos.
- Inferencia en GPU: cabe en cualquier GPU con al menos 2 GB de VRAM, incluidas tarjetas integradas o GPUs de gama baja.
- Opciones de despliegue: llama.cpp, llama-server, Ollama (usado en las mediciones de KeakBench), o cualquier runtime compatible con GGUF.
- No requiere hardware especializado; está diseñado para ejecución local sin aceleración de red.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | KeakScore |
|---|---|---|---|---|---|
| Keak Ember 1.4 | 1,7B | no disponible | Apache 2.0 | Especialista en dictado | 0.828 |
| Qwen3 1.7B (base) | 1,7B | no disponible | Apache 2.0 | Generalista | 0.583 |
| Keak Ember 1.2 | 1,7B | no disponible | Apache 2.0 | Especialista en dictado | 0.771 |

La comparativa directa con otros modelos especializados en dictado no está disponible en la información proporcionada. La ventaja de Ember sobre su base es clara: +0.245 puntos de KeakScore (un 42% de mejora relativa) con el mismo tamaño y licencia.

## Limitaciones y advertencias

- La suite `guard` de la versión 1.4 obtuvo 0.841, por debajo del objetivo de 1.000 que el proyecto se fija para cada lanzamiento. El autor advierte explícitamente que hay que leer cada fallo de guard antes de confiar en el modelo con información sensible.
- El modelo "sabe casi nada" fuera de sus siete tareas. Intentar usarlo para razonamiento general, generación de código o conversación abierta producirá resultados pobres.
- Riesgo de alucinación en tareas fuera de su dominio: al ser un especialista, cualquier pregunta que no corresponda a sus capacidades puede generar respuestas incorrectas o inventadas.
- La versión 1.1 demostró que un scorer defectuoso puede introducir datos de entrenamiento erróneos; aunque la 1.2 y posteriores corrigen esto, la lección es que la calidad del benchmark condiciona la calidad del modelo.
- No se publica una versión f16 del modelo, solo la cuantización Q4_K_M, lo que limita la reproducibilidad exacta de los resultados en otros formatos.
- Idiomas limitados a inglés, español y catalán; no soporta otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está pensado para el ecosistema de la app Keak; su integración fuera de ese contexto puede requerir adaptación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/keakai/keak-ember-GGUF
- Perfil del autor: https://huggingface.co/keakai
- KeakBench (benchmark y código): https://github.com/PepSecanell/keak-ai
