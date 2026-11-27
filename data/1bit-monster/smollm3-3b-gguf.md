# 1bit-MONSTER/SmolLM3-3B-GGUF

## Resumen

SmolLM3-3B-GGUF es una redistribución en formato GGUF del modelo SmolLM3-3B de Hugging Face, publicada por el usuario 1bit-MONSTER. El repositorio contiene una única cuantización Q4_K_M generada originalmente por el proyecto llama.cpp (ggml-org) y rehospedada junto con mediciones de rendimiento obtenidas en hardware Strix Halo mediante el motor propietario del autor, denominado 1bit engine. No se trata, por tanto, de un modelo nuevo ni de un ajuste fino, sino de un empaquetado de pesos ya existentes orientado a la inferencia local.

El modelo base, SmolLM3-3B, es un transformer denso de aproximadamente 3.075 millones de parámetros desarrollado por HuggingFaceTB, con licencia Apache 2.0 y orientación conversacional. Su interés radica en ofrecer un tamaño contenido que permite ejecución en hardware de consumo, y esta versión GGUF facilita su despliegue mediante llama.cpp y ecosistemas compatibles sin necesidad de infraestructura GPU dedicada.

La relevancia de esta ficha es limitada pero concreta: proporciona un artefacto listo para usar con cuantización de 4 bits y unas cifras de throughput publicadas (3003 tok/s en prefill de 512 tokens y 93,1 tok/s en generación de 128 tokens) sobre un equipo Strix Halo con backend Vulkan, si bien el propio autor advierte que ese backend ya no está disponible en su motor y que las mediciones con la ruta actual (HRX GPU) están pendientes de repetir. El repositorio tiene un volumen de descargas muy bajo y no cuenta con likes, lo que sugiere una adopción incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de SmolLM3-3B; detalles específicos no disponibles en la información proporcionada) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (única incluida en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`SmolLM3-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo base SmolLM3-3B. Se sabe que se trata de un transformer denso de 3.075 millones de parámetros y que la model card lo etiqueta como conversacional. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO; todos estos datos deben consultarse en la model card del modelo original de HuggingFaceTB.

Respecto a esta distribución concreta, la única intervención técnica documentada es la cuantización Q4_K_M realizada por el proyecto llama.cpp y rehospedada por 1bit-MONSTER. El autor añade mediciones de rendimiento con su propio motor de inferencia sobre Strix Halo, indicando que las cifras proceden de un backend Vulkan ya retirado y que las pruebas con la ruta HRX GPU están en proceso de re-medición. No hay innovaciones arquitectónicas propias en este repositorio.

## Capacidades

- Generación de texto conversacional, heredada del modelo base SmolLM3-3B.
- Ejecución en formato GGUF mediante llama.cpp y herramientas compatibles.
- Integración declarada con el motor 1bit engine a través del comando `1bit serve -m SmolLM3-Q4_K_M.gguf --device hrx`.
- Compatibilidad con endpoints según las etiquetas del repositorio (`endpoints_compatible`).
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o multilingüismo: no disponibles en la información proporcionada; deben verificarse en la documentación del modelo base.

## Casos de uso

- Inferencia local en equipos de sobremesa: el archivo Q4_K_M de 1,9 GB de repositorio permite cargar el modelo en memoria de una GPU de consumo o incluso en CPU, adecuado para prototipos y pruebas sin infraestructura cloud.
- Despliegue con llama.cpp: al ser un GGUF estándar generado por ggml-org, puede servirse con `llama-server` o `llama-cli` para exponer una API compatible con OpenAI en entornos de desarrollo.
- Evaluación comparativa de motores de inferencia: las cifras publicadas (3003 tok/s en pp512, 93,1 tok/s en tg128) sirven como referencia para contrastar el rendimiento de otros runtimes sobre el mismo hardware Strix Halo.
- Asistentes conversacionales ligeros: el etiquetado `conversational` del modelo base sugiere uso en chatbots de baja latencia donde el coste por token importa más que la profundidad de razonamiento.
- Pruebas de integración con el 1bit engine: útil para desarrolladores que quieran validar la ruta HRX GPU del motor del autor con un modelo pequeño y de licencia permisiva.
- Docencia y experimentación: el tamaño reducido y la licencia Apache 2.0 facilitan su uso en cursos y talleres sobre cuantización y despliegue de LLM sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas presentes son de throughput del motor 1bit sobre Strix Halo con backend Vulkan:

| Metrica | Valor | Condiciones |
|---|---|---|
| pp512 (prefill) | 3003 tok/s | Strix Halo, Vulkan, medición 2026-09 |
| tg128 (generación) | 93,1 tok/s | Strix Halo, Vulkan, medición 2026-09 |

El autor advierte que el backend Vulkan fue eliminado del motor y que estas cifras deben re-medirse con la ruta HRX GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 1,9 GB, por lo que se requieren en torno a 2-3 GB de memoria considerando overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para carga completa en GPU; el autor reporta mediciones en Strix Halo (APU con memoria unificada).
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en tarjetas como RTX 3060, RTX 4060 o superiores, así como en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp (principal, al ser un GGUF de ggml-org), 1bit engine del autor, y presumiblemente Ollama u otros runners compatibles con GGUF, aunque no se confirma explícitamente en la información disponible.
- Latencia y throughput: 3003 tok/s en prefill de 512 tokens y 93,1 tok/s en generación de 128 tokens sobre Strix Halo con Vulkan (mediciones del autor, backend retirado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM3-3B-GGUF (1bit-MONSTER) | 3,075 B | No disponible | Apache 2.0 | GGUF Q4_K_M | Redistribución con mediciones propias |
| SmolLM3-3B (HuggingFaceTB) | 3,075 B | No disponible | Apache 2.0 | Safetensors | Modelo base original |
| ggml-org/SmolLM3-3B-GGUF | 3,075 B | No disponible | Apache 2.0 | GGUF | Cuantizaciones oficiales de llama.cpp |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es una redistribución, no un modelo nuevo: cualquier limitación de SmolLM3-3B se hereda íntegramente.
- Las cifras de rendimiento publicadas proceden de un backend (Vulkan) que el autor ha eliminado de su motor; no deben tomarse como representativas del estado actual.
- Solo se ofrece una cuantización (Q4_K_M), lo que limita el ajuste fino entre calidad y tamaño para distintos presupuestos de memoria.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de la cuantización original de ggml-org.
- El repositorio presenta muy baja adopción (45 descargas, 0 likes) y no hay pipeline declarado, lo que reduce la trazabilidad y el soporte comunitario.
- El uso del motor 1bit engine implica dependencia de una herramienta propietaria del autor; para producción conviene evaluar alternativas estándar como llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/SmolLM3-3B-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Cuantización original: https://huggingface.co/ggml-org/SmolLM3-3B-GGUF
- Motor 1bit engine: https://github.com/1bit-MONSTER/engine
- Familias del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
