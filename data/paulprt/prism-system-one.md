# paulprt/prism-system-one

## Resumen

prism-system-one es un modelo de decisión ligero desarrollado por el usuario independiente paulprt, afinado a partir del encoder LiquidAI/LFM2.5-Encoder-230M. Su función no es generar texto, sino responder preguntas estructuradas sobre un fragmento de texto de entrada (el *state*): preguntas de sí/no, elección entre opciones nombradas y puntuación sobre una escala ordenada. Devuelve, en una sola pasada hacia delante, una respuesta tipada con una probabilidad calibrada para cada opción, lo que lo hace adecuado para integrarse como componente de decisión dentro de software.

El modelo emplea una arquitectura de encoder bidireccional que combina convoluciones cortas y atención, conservando las 11 primeras capas de las 14 del encoder base y añadiendo tres cabezas lineales (noul, choice y score). Con 194.556.547 parámetros reales según los pesos en safetensors, se mantiene por debajo de los 200M, lo que permite despliegues económicos en CPU o GPU de consumo.

Es relevante ahora porque ofrece una alternativa compacta y calibrada a los grandes modelos generativos para tareas de enrutamiento, triaje, etiquetado y moderación preliminar, con soporte para 15 idiomas y un formato de petición/respuesta compatible con la API Jev de TypeSafe. El autor lo publica en estado de vista previa (*preview*), sin evaluación todavía en benchmarks públicos de modelos de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional LFM2 (convoluciones cortas + atención), 11 de las 14 capas del encoder base, más tres cabezas lineales (noul, choice, score) |
| Parametros totales | 194.556.547 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado con entradas de hasta 2.048 tokens; la configuración liberada acepta hasta 8.192 tokens, pero la calidad más allá de 2.048 no está probada |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, pt, es, nl, pl, ru, tr, vi, hi |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del encoder LiquidAI/LFM2.5-Encoder-230M, una arquitectura bidireccional que mezcla convoluciones cortas con capas de atención. El autor conserva las 11 primeras de las 14 capas, eligiendo el corte de modo que la última capa retenida sea de atención, y añade tres cabezas lineales especializadas: una para preguntas de sí/no (noul), otra para elección entre opciones (choice) y otra para puntuación en escala ordenada (score). El recuento de parámetros se mantiene justo por debajo de 200M.

El mecanismo de lectura de preguntas está inspirado en modelos de extracción basados en marcadores como GLiNER. Cada pregunta se codifica como un token marcador seguido de sus instrucciones, y cada opción como un marcador (`<|option|>` para opciones de elección, `<|level|>` para niveles de puntuación) seguido del texto de la opción. Todas las preguntas se colocan antes del estado, que va tras un marcador `<|document|>`. Cada cabeza lee el estado oculto en los marcadores de su pregunta: la cabeza noul en `<|noul|>`, la de elección en cada `<|option|>` y la de puntuación en cada `<|level|>`. Las probabilidades se obtienen mediante sigmoide (noul) o softmax sobre los marcadores de la propia pregunta (choice y score), de modo que las opciones de una pregunta solo compiten entre sí. Todas las preguntas sobre un estado se responden en una única pasada.

El ajuste fino se realizó sobre una mezcla de 292 tareas públicas de clasificación, evaluación (*judging*), *grounding* y seguridad en 15 idiomas. El texto del usuario se tokeniza con separación de tokens especiales, de forma que cadenas como `<|option|>` dentro del estado, las instrucciones o los nombres de opción se tratan como texto plano y no pueden crear una ranura de respuesta. No se detalla en la información disponible el número de tokens de entrenamiento ni si se emplearon RLHF o DPO.

## Capacidades

- Respuesta a preguntas de sí/no con probabilidad de "sí" (tipo `noul`).
- Elección entre 2 y 255 opciones nombradas, con probabilidad para cada una (tipo `choice`).
- Puntuación sobre una escala ordenada de 2 a 10 niveles, con nivel esperado y probabilidad por nivel (tipo `score`).
- Respuesta conjunta a múltiples preguntas sobre un mismo estado en una sola pasada hacia delante.
- Procesamiento de estados en formato de cadena, objeto JSON (con partes referenciables en las instrucciones) o lista de cadenas.
- Soporte multilingüe en 15 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, portugués, español, neerlandés, polaco, ruso, turco, vietnamita e hindi.
- Salidas calibradas con probabilidades por opción, incluida una medida de confianza para elección y puntuación.
- Compatibilidad con el formato de petición/respuesta de la API Jev de TypeSafe.
- No dispone de generación de texto libre, tool calling, capacidades de agente ni visión o audio.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo puede clasificar la intención (`choice`) y la urgencia (`noul`) en una sola pasada, lo que permite derivar automáticamente cada ticket al equipo adecuado con una probabilidad asociada a cada decisión.
- Triaje de correo o mensajes entrantes: con preguntas de tipo `score` sobre severidad y `choice` sobre categoría, se prioriza la cola de atención sin necesidad de un modelo generativo, gracias a su reducido coste de inferencia.
- Etiquetado y clasificación por lotes: al responder varias preguntas por estado en un único forward pass, resulta adecuado para pipelines de anotación masiva de textos en 15 idiomas.
- Prefiltro de moderación: la cabeza `noul` puede descartar rápidamente contenido que no requiere revisión, dejando los casos dudosos para un modelo mayor o para revisión humana, tal como recomienda el autor.
- Evaluación automática de respuestas (*judging*): con preguntas de elección o puntuación sobre pares de textos, se puede puntuar la calidad de una respuesta generada o comparar dos candidatas con probabilidades calibradas.
- Verificación de extracción de datos: comprobar si un campo extraído de un documento coincide con lo esperado mediante preguntas de sí/no o de elección sobre el estado y la hipótesis, aprovechando la referencia a partes de objetos JSON en las instrucciones.
- Clasificación de intenciones en asistentes conversacionales: con opciones de 2 a 255 y contexto de hasta 2.048 tokens, puede determinar la intención del usuario y el nivel de satisfacción en un solo paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que los resultados internos proceden de tareas reservadas y pruebas internas, y que el modelo todavía no se ha evaluado en benchmarks públicos de modelos de decisión.

## Requisitos de hardware

- VRAM estimada para inferencia: con 194,5M de parámetros, en precisión completa (fp32) los pesos ocupan aproximadamente 0,78 GB; en fp16/bf16, unos 0,39 GB. La memoria adicional depende del tamaño de lote y de la longitud de entrada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre para fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. El modelo admite ejecución en `cuda`, `mps` o `cpu`.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con al menos 2 GB de VRAM; también es viable en CPU para cargas moderadas.
- Opciones de despliegue: el modelo no es un `AutoModel` estándar y debe cargarse con el código incluido en el repositorio (`modeling_prism.PrismDecisionModel`). Requiere `torch`, `safetensors` y una versión reciente de `transformers` con soporte para LFM2. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prism-system-one | 194.556.547 | 2.048 tokens entrenados (8.192 en configuración) | Decisión estructurada (sí/no, elección, puntuación) | lfm1.0 | Hugging Face |
| LiquidAI/LFM2.5-Encoder-230M | No disponible | No disponible | Encoder base | No disponible | Hugging Face |
| GLiNER (familia) | No disponible | No disponible | Extracción basada en marcadores | No disponible | No disponible |

La información disponible no permite establecer una comparación cuantitativa de rendimiento con alternativas de la misma categoría. El modelo base se incluye como referencia arquitectónica, y GLiNER se cita únicamente como inspiración del mecanismo de marcadores, sin datos comparables de parámetros, contexto o resultados.

## Limitaciones y advertencias

- Estado de vista previa: no ha sido evaluado en benchmarks públicos de modelos de decisión; los resultados internos pueden no generalizar.
- No es adecuado para decisiones de alto riesgo sobre personas sin revisión, como moderación con aplicación de sanciones, contratación, crédito o decisiones médicas.
- Riesgo de alucinación y de calibración deficiente en dominios o idiomas poco representados en las 292 tareas de ajuste.
- La calidad más allá de 2.048 tokens de entrada no está probada, aunque la configuración acepte hasta 8.192.
- Licencia lfm1.0 (etiquetada como "other"): es necesario revisar el archivo LICENSE del repositorio antes de un uso comercial.
- No es un `AutoModel` estándar; requiere cargar el código incluido y una versión reciente de `transformers` con soporte LFM2, lo que complica su integración en infraestructuras de despliegue habituales.
- No dispone de generación de texto, tool calling ni capacidades de agente, por lo que no puede sustituir a un modelo generativo en tareas conversacionales.
- El autor recomienda mantener a una persona o a un modelo más potente en el bucle cuando una respuesta errónea tenga un coste elevado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paulprt/prism-system-one
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-230M
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/paulprt/prism-system-one/blob/main/LICENSE
