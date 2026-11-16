# alamasta999/cliploo-faq-intent

## Resumen

Cliploo FAQ Intent es un clasificador de texto en indonesio desarrollado por el usuario alamasta999 para el marketplace Cliploo. Su función es enrutar consultas de clientes hacia la entrada de FAQ correspondiente, hacia conversación trivial (smalltalk), hacia temas fuera de alcance (offtopic) o hacia derivación a un agente humano (handoff). Se trata de un fine-tune del modelo `indobenchmark/indobert-lite-base-p1`, un transformer de tipo ALBERT ligero con 11,7 millones de parámetros, pensado para ejecutarse en entornos con recursos limitados.

El modelo resuelve un problema acotado pero recurrente en atención al cliente: decidir automáticamente si una pregunta entrante puede responderse con una FAQ existente y cuál de las 47 FAQ del catálogo corresponde. Con ese objetivo, el autor generó 1.526 preguntas sintéticas a partir de las FAQ reales y entrenó un clasificador de 50 etiquetas (`faq:<id>`, `smalltalk`, `offtopic`, `handoff`), reportando una accuracy de 0,963 y un macro-F1 de 0,965 sobre un conjunto de test de 270 ejemplos.

Su relevancia práctica deriva de su tamaño reducido y de su empaquetado para `transformers.js` con pesos ONNX cuantizados, lo que permite ejecutarlo en el navegador o en Node.js sin infraestructura GPU. No obstante, el modelo es de nicho: solo cubre indonesio, está especializado en un único marketplace y no dispone de licencia declarada, lo que limita su reutilización comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo ALBERT (indobert-lite-base-p1) |
| Parámetros totales | 11.722.034 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX cuantizado (dtype `q8` documentado en el ejemplo de uso); safetensors en precisión original |
| Idiomas soportados | indonesio (`id`) |
| Licencia | no disponible |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `indobenchmark/indobert-lite-base-p1`, un ALBERT lite preentrenado para indonesio por IndoBenchmark. La arquitectura ALBERT comparte parámetros entre capas, lo que explica su reducido tamaño (11,7 M de parámetros) manteniendo una estructura transformer estándar para clasificación de secuencias. La cabeza de clasificación se ha adaptado a 50 etiquetas: 47 correspondientes a entradas de FAQ (`faq:<id>`), más `smalltalk`, `offtopic` y `handoff`.

El conjunto de entrenamiento se construyó de forma sintética: 1.526 preguntas generadas como variaciones de estilo a partir de las 47 FAQ de Cliploo. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste adicionales como RLHF o DPO. Tampoco se documentan innovaciones técnicas más allá del fine-tuning supervisado estándar de clasificación y la exportación a ONNX para inferencia en JavaScript.

## Capacidades

- Clasificación de intención en indonesio sobre 50 etiquetas cerradas.
- Enrutamiento a FAQ: identifica cuál de las 47 entradas del catálogo responde a la consulta (`faq:<id>`).
- Detección de conversación trivial (`smalltalk`) y de consultas fuera de alcance (`offtopic`).
- Detección de necesidad de derivación a atención humana (`handoff`).
- Ejecución en navegador y en Node.js mediante `transformers.js` con pesos ONNX cuantizados.
- No soporta generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento explícito: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento automático de tickets en el marketplace Cliploo: cada mensaje entrante se clasifica y se redirige a la FAQ correspondiente, reduciendo la carga del equipo de soporte en consultas repetitivas.
- Respuesta instantánea en el chat de la web: integrado vía `transformers.js` en el frontend, el clasificador puede mostrar la respuesta de FAQ adecuada sin llamada al servidor, con la latencia de una inferencia ONNX q8 en el navegador.
- Triaje previo a agentes humanos: las consultas etiquetadas como `handoff` se escalan directamente a un operador, evitando que el cliente reciba respuestas automáticas irrelevantes.
- Filtrado de ruido en canales de soporte: las etiquetas `smalltalk` y `offtopic` permiten separar mensajes que no requieren gestión de FAQ y priorizar el resto de la cola.
- Análisis de demanda de soporte: agregando las etiquetas `faq:<id>` a lo largo del tiempo se obtiene una distribución de qué temas generan más consultas, útil para priorizar mejoras en la documentación.
- Prototipado rápido de asistentes de FAQ en otros marketplaces indonesios: al ser un fine-tune ligero sobre IndoBERT, sirve como plantilla para reentrenar con un catálogo propio de preguntas frecuentes.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Accuracy (test, 270 ejemplos) | 0,963 |
| Macro-F1 (test, 270 ejemplos) | 0,965 |
| Umbral de confianza recomendado | 0,2 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; en torno a 100-200 MB con cuantización q8 ONNX.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problema dado el tamaño de 11,7 M de parámetros.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en dispositivos móviles o navegadores.
- Opciones de despliegue: `transformers.js` (Node.js y navegador) con ONNX; también es desplegable con `transformers` de Python y potencialmente con `llama.cpp`/Ollama no aplica (no es un modelo generativo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cliploo FAQ Intent | 11,7 M | no disponible | Clasificación de intención (50 clases, indonesio) | no disponible | Hugging Face |
| indobenchmark/indobert-lite-base-p1 | ~11,7 M | no disponible | Modelo base de lenguaje (indonesio) | no disponible en esta ficha | Hugging Face |
| IndoBERT base | ~124 M | no disponible | Modelo base de lenguaje (indonesio) | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros y categoría.

## Limitaciones y advertencias

- Entrenado únicamente con datos sintéticos (1.526 preguntas derivadas de 47 FAQ), lo que puede provocar un sesgo hacia los estilos de lenguaje representados y un rendimiento inferior ante jerga o variantes no cubiertas.
- Dominio muy restringido: solo es válido para el catálogo de FAQ de Cliploo; fuera de ese contexto las etiquetas `faq:<id>` no tienen significado.
- Solo indonesio: no soporta otros idiomas ni cambios de código (code-switching) frecuentes en el habla informal.
- Licencia no declarada: no hay autorización explícita para uso comercial, lo que impide su adopción en producción sin aclaración previa del autor.
- Riesgo de falsos positivos: el umbral de confianza recomendado (0,2) es bajo, por lo que conviene validar la calibración antes de automatizar respuestas al cliente.
- Al ser un clasificador, no genera respuestas ni mantiene conversaciones; debe combinarse con un sistema de recuperación de FAQ.
- Sin garantías de mantenimiento: el repositorio no registra descargas ni likes y no se documentan procesos de evaluación continuada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/alamasta999/cliploo-faq-intent)
- [Modelo base indobenchmark/indobert-lite-base-p1](https://huggingface.co/indobenchmark/indobert-lite-base-p1)
- [Documentación de transformers.js](https://huggingface.co/docs/transformers.js)
