# OmniJev/OneJev-27B

## Resumen

OneJev-27B es un modelo multimodal de decisión, etiquetado por su autor como «System One», desarrollado por el equipo OmniJev. No es un modelo generativo al uso: recibe una captura de pantalla, una fotografía, un vídeo o texto plano junto con una serie de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. Ese enfoque lo orienta a la toma de decisiones supervisada dentro de agentes, más que a la conversación abierta.

Se trata de un fine-tune completo del modelo Qwen/Qwen3.8-27B sobre 99.193 preguntas extraídas de ejecuciones reales de agentes, vídeos e imágenes. Con 27.356.728.560 parámetros (unos 27,36 mil millones) y un repositorio de 54,7 GB en safetensors, se distribuye bajo licencia Apache 2.0 y forma parte de una familia con variantes de 0,8B, 4B, 9B y una versión FP8 de 30,4 GB.

Su relevancia actual está en el nicho de los agentes GUI y la orquestación de decisiones: en lugar de pedir al modelo que «decida» mediante texto libre, expone una API de tipo System One (TypeSafe) donde cada pregunta se responde con una distribución de probabilidad calibrada, lo que facilita umbrales, abstención y evaluación automatizada. El autor reporta una latencia de 189 ms para una pregunta y 324 ms para diez preguntas en una sola petición sobre una GPU H200 con una captura de 1280x720.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se detalla la variante interna); fine-tune completo de Qwen/Qwen3.8-27B |
| Parametros totales | 27.356.728.560 (≈27,36B) |
| Parametros activos | no aplica (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos originales en alta precisión (el tamaño de 54,7 GB para 27,36B parámetros es consistente con bf16/fp16); existe una variante separada OneJev-27B-FP8 de 30,4 GB en 8 bits; no se documentan cuantizaciones GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tarea declarada (pipeline) | image-text-to-text |
| Modalidades de entrada | texto, imagen, vídeo |
| Salida | probabilidades calibradas por opción (single forward pass), no texto libre |
| Tamaño del repositorio | 54,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-09-27 |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna más allá de indicar que OneJev-27B es un fine-tune completo de Qwen/Qwen3.8-27B, etiquetado con la familia `qwen3_5` en HuggingFace. Por tanto, se hereda la arquitectura del modelo base, pero no se especifican número de capas, tipo de atención, ventana de contexto ni estrategia posicional. Sí se describe el comportamiento funcional: el modelo consume un estado (por ejemplo, `{"task": ..., "screen": "<image:1>"}`) junto con medios adjuntos y un conjunto de preguntas tipadas (`Noul` para verificación booleana, `Choice` para elección entre opciones) y emite una probabilidad calibrada por cada opción en un solo paso hacia delante.

En cuanto a los datos, el autor indica que el entrenamiento se realizó sobre 99.193 preguntas procedentes de ejecuciones reales de agentes, vídeos e imágenes. No se publica la composición detallada del dataset, el número de tokens, ni si hubo etapas de RLHF, DPO u otro tipo de alineación. La model card menciona un conjunto de test propio («OneJev test set») compuesto por tipos de pregunta presentes en entrenamiento pero con instancias concretas que ningún modelo vio durante el entrenamiento, y compara los resultados con Jev 1.13 (modelo solo texto), Jev-Omni 12B y Qwen3.8-27B en modo thinking. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Decisión multimodal con probabilidad calibrada: dada una imagen, vídeo o texto más una pregunta, devuelve la probabilidad de cada opción en un único forward pass.
- Verificación booleana de estado: el tipo `Noul` permite preguntar si una condición se cumple (por ejemplo, «la factura ha sido pagada»).
- Elección entre alternativas: el tipo `Choice` devuelve una distribución sobre acciones discretas (por ejemplo, `click` frente a `stop`).
- Comprensión de capturas de pantalla orientada a agentes GUI, incluida la referencia a elementos de la interfaz indicados en el estado.
- Procesamiento de vídeo como entrada multimodal, además de imagen fija y texto.
- Consultas múltiples en una sola petición: la API admite varias preguntas simultáneas y el autor reporta 10 preguntas en 324 ms en una H200.
- Integración mediante API System One de TypeSafe, con un campo adicional `media` para imágenes y vídeo.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`).
- Capacidad conversacional (etiqueta `conversational`), aunque no se detallan sus características.
- No se documentan capacidades de tool calling, function calling, agentes autónomos de texto, matemáticas, generación de código ni modo thinking. En particular, el autor compara contra «Qwen3.8-27B thinking», lo que sugiere que OneJev-27B no incorpora ese modo.

## Casos de uso

- Automatización de agentes GUI: el modelo recibe la captura de pantalla del escritorio o navegador y decide la siguiente acción (`click`, `stop`, etc.) con una probabilidad asociada, lo que permite fijar umbrales de confianza antes de ejecutar acciones irreversibles.
- Verificación de finalización de tareas en pipelines de agentes: usando el tipo `Noul`, un orquestador puede comprobar si el objetivo se ha cumplido (por ejemplo, si una factura se ha pagado) antes de cerrar el flujo, sin depender de un modelo generativo que devuelva texto libre.
- Enrutado de decisiones con abstención: al obtener probabilidades calibradas, es posible derivar a revisión humana cuando ninguna opción supera un umbral, algo habitual en atención al cliente o back-office automatizado.
- Evaluación automática de agentes en CI: el modelo puede actuar como juez binario o de elección sobre trazas y capturas de ejecuciones de agentes, integrándose en pipelines de integración continua para detectar regresiones de comportamiento.
- Clasificación de imágenes y vídeo con incertidumbre: catalogación o triaje de contenido visual donde interesa no solo la etiqueta sino la confianza asociada, incluyendo flujos sobre fotogramas de vídeo.
- Análisis de grabaciones de sesiones de usuario: dado un vídeo o secuencia de capturas, responder preguntas de elección sobre qué hizo el usuario o cuál sería el siguiente paso esperado, útil en analítica de producto y pruebas de usabilidad.
- Soporte en herramientas internas multimodales: como servicio local (`qev serve`) que responde a preguntas tipadas sobre el estado de una aplicación, sin generar texto y por tanto con salida estructurada y consumible por programas.
- Despliegue por niveles de recursos dentro de la misma familia: el autor publica variantes de 0,8B, 4B, 9B y FP8 para escenarios donde no se dispone de una GPU de datacenter, manteniendo la misma interfaz de decisión.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados en formato de imagen SVG (`assets/results.svg`) con precisión en porcentaje frente a Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking, sobre el conjunto de test OneJev (preguntas de los mismos tipos que en entrenamiento pero con instancias no vistas). Los valores numéricos no están disponibles en el texto proporcionado, por lo que no se reproducen aquí.

No se han publicado resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

Los únicos datos cuantitativos de rendimiento disponibles son de latencia:

| Escenario | Hardware | Entrada | Latencia | Throughput implícito |
|---|---|---|---|---|
| 1 pregunta | 1x H200 | Captura 1280x720 | 189 ms | ≈5,3 preguntas/s |
| 10 preguntas en una petición | 1x H200 | Captura 1280x720 | 324 ms (32,4 ms por pregunta) | ≈30,9 preguntas/s |

## Requisitos de hardware

- VRAM estimada para pesos en alta precisión (bf16/fp16): aproximadamente 55 GB solo para pesos; con caché KV y activaciones multimodales, se recomienda una GPU de 80 GB.
- VRAM estimada para la variante FP8 (30,4 GB de pesos): alrededor de 32-40 GB en función de la longitud de contexto y del número de fotogramas de vídeo.
- GPU recomendadas: H200 para el escenario de latencia reportado por el autor; H100 80 GB o A100 80 GB para pesos en alta precisión; L40S 48 GB o A6000 48 GB para la variante FP8.
- GPU de consumo: la versión de 27B no cabe en GPUs de consumo con 24-32 GB (RTX 4090, RTX 5090) ni siquiera en FP8, ya que los pesos FP8 ocupan 30,4 GB. No se publican cuantizaciones GGUF de menor tamaño; para entornos de consumo el autor ofrece las variantes OneJev-0.8B, OneJev-4B y OneJev-9B.
- Opciones de despliegue: servidor propio `qev serve --model OmniJev/OneJev-27B` tras instalar el paquete desde GitHub; uso directo con la librería `transformers`; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: según el autor, 189 ms para una pregunta y 324 ms para diez preguntas en una sola petición sobre una H200 con captura de 1280x720 (32,4 ms por pregunta).
- Requisito de disco: el repositorio ocupa 54,7 GB (30,4 GB en la variante FP8).

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OneJev-27B | Qwen3.8-27B | 27,36B | 54,7 GB (alta precisión) | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| OneJev-27B-FP8 | OneJev-27B | 27,36B (8 bits) | 30,4 GB | no disponible | Apache 2.0 | HuggingFace |
| OneJev-9B | Qwen3.5-9B | no disponible | 18,8 GB | no disponible | Apache 2.0 | HuggingFace |
| Jev-Omni 12B | no disponible | ≈12B (por nombre) | no disponible | no disponible | no disponible | usado como referencia en la model card |
| Jev 1.13 | no disponible | no disponible | no disponible | no disponible | no disponible | referencia; solo texto |
| Qwen3.8-27B (thinking) | — | ≈27B (por nombre) | no disponible | no disponible | no disponible | modelo base; referencia comparativa |

No se dispone de cifras de rendimiento comparativas en texto, por lo que la comparación se limita a parámetros, tamaño de pesos, licencia y disponibilidad. Las alternativas de la misma categoría (modelos de decisión multimodales con salida calibrada) distintas de la propia familia OneJev no están identificadas en la información disponible.

## Limitaciones y advertencias

- Métricas de calidad no verificables: los resultados de la model card se presentan únicamente como imagen SVG y no hay cifras de benchmarks estándar publicadas; no es posible validar externamente la precisión declarada.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes en la fecha de consulta, por lo que no existe evidencia de uso independiente.
- Idiomas: no se documenta el soporte multilingüe; se desconoce si el modelo funciona correctamente fuera del inglés.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que dificulta dimensionar conversaciones largas, vídeos extensos o estados complejos.
- Riesgo de alucinación y calibración no garantizada: aunque el modelo devuelve probabilidades, no se publican métricas de calibración (por ejemplo, ECE) ni se garantiza que las probabilidades sean fiables fuera de la distribución de entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo, equidad ni comportamiento ante contenido sensible.
- Datos de entrenamiento poco detallados: se indican 99.193 preguntas de ejecuciones de agentes, vídeos e imágenes, pero sin composición, idioma, procedencia ni filtrado; no se aclara si hubo alineación posterior (RLHF/DPO).
- Uso comercial: la licencia es Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B, ya que las condiciones del derivado pueden estar condicionadas por las del original.
- Salida restringida a opciones predefinidas: el modelo no genera texto libre ni respuestas abiertas, por lo que no sirve como sustituto de un LLM conversacional general.
- Dependencia de herramienta propia: el arranque documentado requiere instalar el paquete `qev` desde GitHub y exponer el servidor; no se documenta integración con servidores de inferencia estándar como vLLM, TGI o llama.cpp.
- Requisitos de hardware altos: no cabe en GPUs de consumo en ninguna de las configuraciones publicadas de 27B, ni siquiera en FP8.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmniJev/OneJev-27B
- Colección OneJev: https://huggingface.co/collections/OmniJev/onejev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante FP8: https://huggingface.co/OmniJev/OneJev-27B-FP8
- Variante 0,8B: https://huggingface.co/OmniJev/OneJev-0.8B
- Variante 4B: https://huggingface.co/OmniJev/OneJev-4B
- Variante 9B: https://huggingface.co/OmniJev/OneJev-9B
