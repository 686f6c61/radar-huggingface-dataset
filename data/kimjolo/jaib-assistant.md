# kimjolo/jaib-assistant

## Resumen

JAIB Assistant es un ajuste fino (fine-tune) de Qwen3.5-0.8B desarrollado por el usuario kimjolo para JAIB, una aplicación de gestión de dinero para Pakistán. El modelo actúa como capa de interpretación de lenguaje natural dentro de la app: recibe una petición en inglés o en urdu romanizado (roman urdu) y la convierte en el JSON interno de la aplicación, permitiendo añadir o modificar pagos y préstamos, buscar operaciones, explicar totales, abrir secciones de la interfaz o explicar cómo realizar una tarea dentro de JAIB.

La relevancia del modelo es su enfoque de despliegue en el propio dispositivo (on-device): la aplicación descarga un único archivo GGUF de aproximadamente 542 MB y ejecuta la inferencia en el teléfono, de modo que ningún texto introducido por el usuario se envía a servidores externos. Esto responde a requisitos de privacidad y a la necesidad de funcionar en mercados con conectividad limitada.

Arquitectura, número de tokens de entrenamiento y composición del dataset no están disponibles en la información proporcionada; el modelo hereda la arquitectura del modelo base Qwen3.5-0.8B y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de unsloth/Qwen3.5-0.8B) |
| Parámetros totales | 772.845.888 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF); otros tipos no disponibles |
| Idiomas soportados | inglés (en), urdu romanizado (ur) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3.5-0.8B.Q4_K_M.gguf, 541.903.776 bytes) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint unsloth/Qwen3.5-0.8B, por lo que su arquitectura subyacente es la del modelo base; la información proporcionada no detalla si se trata de un transformer denso, híbrido o con componentes de atención lineal, ni el número de capas, cabezas o dimensión oculta. Tampoco se especifica la longitud de contexto nativa.

El entrenamiento se realizó exclusivamente con peticiones inventadas (sin mensajes de personas reales) y con el prompt propio de la aplicación. No se indica el volumen de datos, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o preferencias. La innovación principal no es arquitectónica sino de producto: el ajuste alinea al modelo con un esquema JSON cerrado de la app y con la jerga del urdu romanizado, y el resultado se empaqueta en un GGUF Q4_K_M para ejecución en teléfono.

El autor reporta una evaluación sobre 150 peticiones inventadas reservadas: el modelo eligió la acción correcta en 149 ocasiones, frente a 65 del modelo base. El archivo GGUF incluye un SHA-256 publicado para verificación de integridad.

## Capacidades

- Conversión de lenguaje natural a JSON estructurado de la aplicación JAIB.
- Comprensión de peticiones en inglés y en urdu romanizado.
- Creación de pagos y préstamos, así como corrección o eliminación de registros existentes.
- Búsqueda de pagos y consulta de operaciones registradas.
- Explicación de totales y desgloses de cantidades.
- Navegación: apertura de secciones concretas de la interfaz de la app.
- Respuesta a preguntas de tipo "cómo hago X en JAIB" (guía procedimental).
- Inferencia local en el dispositivo, sin envío de datos a servidores.
- No se documenta soporte de tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente financiero embebido en la app: el modelo traduce "añade 500 rupias de pago a Ali" en la operación JSON correspondiente, que la app ejecuta directamente sobre su base de datos local.
- Privacidad por diseño en banca móvil: al ejecutarse en el teléfono, permite procesar peticiones con importes y nombres sin que salgan del dispositivo, lo que facilita el cumplimiento de políticas de datos sensibles.
- Corrección de registros por voz o texto: el usuario puede pedir "borra el pago de ayer" o "cambia el préstamo de 2000 a 2500" y el modelo genera la acción de modificación o eliminación adecuada.
- Búsqueda y consulta de historial: peticiones como "muéstrame los pagos de la semana pasada" se resuelven con el JSON de búsqueda que la app interpreta para filtrar su listado.
- Explicación de totales: el modelo responde a "¿por qué me sale 3.400?" generando la consulta de desglose que la app usa para mostrar el detalle de pagos y préstamos.
- Onboarding y ayuda contextual: ante "¿cómo añado un préstamo?", el modelo devuelve la acción de apertura de la sección o la explicación del flujo, reduciendo la necesidad de soporte humano.
- Despliegue en mercados con conectividad limitada: al requerir una única descarga de ~542 MB y no necesitar red para inferir, encaja en escenarios de uso intermitente de datos móviles.
- Distribución en dispositivos de gama media: con 772 millones de parámetros en Q4_K_M, el modelo es viable en teléfonos con memoria disponible moderada, aunque no se publican requisitos mínimos de RAM.

## Benchmarks y rendimiento

| Evaluación | JAIB Assistant | Modelo base (Qwen3.5-0.8B) |
|---|---|---|
| Elección de acción correcta en 150 peticiones inventadas reservadas | 149/150 | 65/150 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se publican métricas de latencia ni de throughput en dispositivo.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo Q4_K_M ocupa 541.903.776 bytes (~517 MiB); se debe sumar la memoria del contexto y del runtime de inferencia, no cuantificada en la información disponible.
- GPU recomendadas: no aplica para el caso de uso previsto (inferencia en teléfono); en escritorio puede ejecutarse en cualquier GPU con suficiente memoria para el modelo cuantizado, sin datos concretos publicados.
- GPU de consumo: por tamaño, cabe en GPU de consumo con varios GB de VRAM, pero no se han publicado pruebas específicas.
- Despliegue: formato GGUF, compatible con runtimes de inferencia GGUF (llama.cpp, Ollama y similares); la model card no detalla el runtime usado en la app.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| JAIB Assistant | 772.845.888 | no disponible | en, ur | Apache 2.0 | Fine-tune para JSON de una app financiera, on-device |
| unsloth/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en esta ficha | no disponible en esta ficha | Modelo generalista del que deriva |
| Alternativas de <1 B para clasificación/JSON | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas específicas de la misma categoría (modelos sub-1B ajustados para extracción de intenciones y JSON en un dominio concreto).

## Limitaciones y advertencias

- El modelo está especializado en el esquema JSON de JAIB; fuera de ese dominio su utilidad es limitada y no debe usarse como asistente generalista.
- Los idiomas soportados declarados son inglés y urdu romanizado; no se garantiza calidad en urdu en escritura árabe ni en otros idiomas.
- El entrenamiento se hizo solo con peticiones inventadas; el rendimiento en lenguaje real de usuarios puede diferir del 149/150 reportado.
- Riesgo de alucinación en la generación de JSON: puede producir acciones o campos no válidos para el esquema de la app, por lo que se requiere validación estricta en el lado de la aplicación antes de ejecutar cualquier operación financiera.
- No se documentan sesgos específicos, pero al derivar de un modelo base generalista puede heredar sesgos de sus datos de preentrenamiento.
- Longitud de contexto no disponible: no se puede garantizar el manejo de conversaciones largas o de múltiples peticiones encadenadas.
- Licencia Apache 2.0, igual que el modelo base, permite uso comercial; deben respetarse las condiciones de la licencia del modelo base y de los datos de ajuste, no detalladas.
- No se publican requisitos mínimos de memoria en dispositivo, latencia ni consumo energético, datos críticos para validar el despliegue en teléfonos de gama baja.
- El número de descargas (60) y la ausencia de "likes" indican una adopción muy temprana; no hay evidencia de uso en producción a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kimjolo/jaib-assistant
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
