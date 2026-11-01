# DevShin00/furfriends-rag-v2

## Resumen

FurFriends RAG v2 es un modelo de generación de texto afinado a partir de Qwen2.5-0.5B-Instruct, desarrollado por DevShin00 como parte de un proyecto de tesis estudiantil en Filipinas (2026). Su propósito es actuar como asistente de cuidado de mascotas dentro de la aplicación FurFriends, un gestor de historiales de salud animal que ejecuta el modelo directamente en el navegador del usuario mediante Transformers.js. El modelo está diseñado para responder exclusivamente a partir de los pasajes de contexto que la aplicación le proporciona (guías de primeros auxilios, respuestas verificadas del equipo, respuestas de Pets Stack Exchange y páginas del CDC y la FDA), y a declarar explícitamente cuando esa información no cubre la pregunta.

Técnicamente se trata de un ajuste LoRA sobre las capas de atención de Qwen2.5-0.5B-Instruct, entrenado durante una época sobre 813 ejemplos en la CPU de un portátil. Los pesos se distribuyen en formato ONNX cuantizado a 4 bits en bloques de 32 con aritmética de precisión completa, ocupando aproximadamente 430 MB, lo que permite inferencia en WebGPU o en CPU vía WASM dentro del navegador.

Su relevancia radica en dos factores: demuestra un flujo completo de RAG (retrieval-augmented generation) con un modelo de 0,5 mil millones de parámetros desplegado íntegramente en el cliente, sin servidor de inferencia, y aplica un comportamiento de abstención controlada ("no lo sé") cuando el contexto recuperado no contiene la respuesta, un patrón crítico en dominios sensibles como la salud. No obstante, es un prototipo académico sin validación veterinaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste LoRA en capas de atención |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B-Instruct; no especificada en la model card) |
| Tipos de cuantizacion | 4 bits en bloques de 32 con matemáticas de precisión completa (archivo `onnx/model_q4.onnx`, ~430 MB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (cuantizado q4); biblioteca transformers.js |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros. Sobre él se aplicó un ajuste LoRA limitado a las capas de atención, durante una única época, sobre un conjunto de 813 ejemplos, ejecutado en la CPU de un portátil. El resultado se exportó a ONNX y se cuantizó a 4 bits en bloques de 32 manteniendo la aritmética de acumulación en precisión completa, lo que reduce el tamaño a unos 430 MB sin recurrir a kernels de baja precisión en los cálculos.

Los datos de entrenamiento siguen un formato RAG estricto: cada ejemplo consta de una pregunta de un dueño de mascota, dos pasajes recuperados de la biblioteca de la aplicación y la respuesta redactada a partir del pasaje correcto, o bien la frase de abstención "I couldn't find this in FurFriends' checked sources" cuando ninguno de los dos pasajes responde a la pregunta. Las fuentes de los pasajes son las respuestas y guías de primeros auxilios verificadas por el equipo, respuestas del volcado público de Pets Stack Exchange (licencia CC BY-SA 4.0, con atribución a los autores), y páginas de dominio público del CDC (Healthy Pets) y la FDA (Animal Health Literacy). No se documenta en la información disponible el uso de RLHF, DPO ni otras etapas de alineación adicionales más allá del ajuste supervisado descrito.

## Capacidades

- Generación de texto condicionada a contexto recuperado (RAG): responde únicamente a partir de los pasajes que la aplicación inserta en el prompt.
- Abstención controlada: cuando los pasajes no contienen la respuesta, emite una frase explícita de no-disponibilidad en lugar de improvisar.
- Conversación de dominio restringido: atención al propietario de mascotas sobre primeros auxilios y cuidados básicos.
- Ejecución en navegador: inferencia en WebGPU o CPU (WASM) mediante Transformers.js, sin backend.
- Atribución de fuentes: el formato de entrenamiento asocia cada respuesta a un pasaje, y la aplicación muestra la fuente bajo cada respuesta.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Asistente de primeros auxilios para mascotas dentro de la app: el modelo recibe dos pasajes de las guías verificadas del equipo y redacta una respuesta en lenguaje natural, citando la fuente mostrada por la aplicación. Adecuado por su formato de entrenamiento exacto (pregunta + dos pasajes + respuesta).
- Triaje inicial con derivación al veterinario: ante preguntas que exceden la biblioteca verificada, el modelo responde con la frase de abstención, lo que permite a la aplicación mostrar un aviso de consulta veterinaria en lugar de una respuesta potencialmente peligrosa.
- Preguntas frecuentes sobre cuidados cotidianos: alimentación, higiene o comportamiento cubiertos por las respuestas de Pets Stack Exchange incluidas en la biblioteca, con atribución CC BY-SA visible al usuario.
- Consulta de material regulatorio y de salud pública: preguntas sobre enfermedades zoonóticas o alertas sanitarias respondidas a partir de las páginas del CDC y la FDA incluidas en la biblioteca.
- Despliegue sin infraestructura: al ejecutarse en el navegador con Transformers.js, permite ofrecer el asistente sin servidor de inferencia ni coste por token, adecuado para un prototipo académico o una aplicación de bajo tráfico.
- Demostración de pipelines RAG con abstención: sirve como referencia docente para implementar recuperación más generación con un modelo de 0,5 mil millones de parámetros y verificación de respuestas contra el contexto.
- Moderación de respuestas en dominio sensible: el patrón de "responder solo desde el contexto" puede reutilizarse como capa de control en otros asistentes verticales de salud o seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente una evaluación sobre 31 preguntas reservadas, calificadas por el equipo estudiantil y no por un veterinario, sin publicar métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 430 MB de pesos en cuantización q4; el consumo real depende del backend (WebGPU reserva memoria adicional para buffers y contexto).
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (integradas modernas y dedicadas); no requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo reciente con WebGPU; también funciona en CPU mediante WASM.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`) con `dtype: "q4"` y `device: "webgpu"` o CPU; el archivo ONNX puede ejecutarse con ONNX Runtime en otros entornos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| FurFriends RAG v2 | 0,5 B | no disponible | Apache 2.0 | ONNX q4, transformers.js | Ajuste LoRA para RAG veterinario en navegador |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5 B | no disponible en la información | Apache 2.0 | safetensors, GGUF, ONNX (comunidad) | Modelo base; uso general, sin especialización ni formato RAG |
| Alternativas de 0,5 B para navegador | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- No es un veterinario y no diagnostica: la propia model card lo declara explícitamente; no debe usarse como sustituto de atención veterinaria profesional.
- Validación insuficiente: evaluado sobre 31 preguntas reservadas calificadas por el equipo estudiantil, no por un veterinario; no hay métricas publicadas.
- Riesgo de alucinación mitigado pero no eliminado: el entrenamiento incentiva la abstención, pero un modelo de 0,5 B puede generar respuestas incorrectas si el pasaje recuperado es ambiguo o parcialmente relevante.
- Solo inglés: no soporta castellano ni otros idiomas; cualquier uso multilingüe requeriría traducción previa o nuevo ajuste.
- Dependencia del recuperador: la calidad de las respuestas está acotada por la calidad de los dos pasajes recuperados; errores de recuperación degradan directamente la salida.
- Licencia del modelo Apache 2.0, pero los datos de Pets Stack Exchange están bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y compartir-igual sobre el contenido derivado de esas respuestas; conviene revisar la compatibilidad en un uso comercial.
- Origen académico: proyecto de tesis de 2026, con 56 descargas y sin mantenimiento documentado; no hay garantías de soporte ni hoja de ruta.
- Contexto y límites de longitud no documentados: no se especifica la ventana máxima efectiva ni el truncado aplicado a los pasajes, lo que dificulta dimensionar el recuperador en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DevShin00/furfriends-rag-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Pets Stack Exchange: https://pets.stackexchange.com
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Transformers.js: https://github.com/huggingface/transformers.js
- CDC Healthy Pets: no disponible en la información proporcionada (URL exacta no incluida en la model card)
- FDA Animal Health Literacy: no disponible en la información proporcionada (URL exacta no incluida en la model card)
