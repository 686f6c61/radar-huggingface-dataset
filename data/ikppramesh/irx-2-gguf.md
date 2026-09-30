# ikppramesh/irx-2-GGUF

## Resumen

IRx-2 (GGUF) es la versión cuantizada y lista para ejecución local del modelo IRx-2, un modelo conversacional de aproximadamente 4.200 millones de parámetros publicado por el usuario ikppramesh (Inampudi) en Hugging Face. Se distribuye exclusivamente en formato GGUF para su uso con runtimes basados en llama.cpp, lo que lo sitúa en la categoría de modelos "on-device": pensado para ejecutarse sin conexión en teléfonos, tablets y ordenadores de consumo. Es el hermano mayor de IRx-1 (2B), del mismo autor.

El modelo resuelve el caso de uso de inferencia local en dispositivos con 8 GB de RAM o más. Según su model card, ocupa unos 3,5 GB de RAM a 8K de contexto (2,7 GB de pesos más un KV cache reducido a solo 8 de sus 32 capas), por lo que cabe en dispositivos como el iPhone 15 Pro Max, el iPad Air M1 o el Galaxy Z Fold 7. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y se publicó el 30 de septiembre de 2026.

La relevancia de la ficha es doble: por un lado, documenta una familia de modelos pequeños orientada a privacidad y ejecución offline; por otro, ilustra un patrón de empaquetado poco habitual, con una plantilla de chat embebida que desactiva el modo de razonamiento interno de la arquitectura base para evitar respuestas vacías o agotamiento de contexto en las aplicaciones cliente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card menciona una "arquitectura base" con modo de razonamiento interno activable; no se especifica el tipo) |
| Parámetros totales | 4.205.751.296 (~4,2 mil millones) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (valor recomendado en la model card) |
| Tipos de cuantización | GGUF Q4_K_M (única incluida en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño del repositorio | 2,7 GB |
| Capas totales | 32 (solo 8 mantienen KV cache) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura subyacente más allá de señalar que existe una "arquitectura base" con un modo de razonamiento interno ("thinking") que las aplicaciones basadas en llama.cpp activan por defecto. Tampoco se publican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Lo que sí se documenta es el proceso de construcción: se trata de un modelo derivado ("derivative fine-tuned model") cuyo ajuste fino se fusionó sobre la base en precisión completa y después se cuantizó una sola vez con una matriz de importancia (imatrix) para obtener el GGUF.

La innovación técnica destacable está en el empaquetado y en la gestión de la memoria. La plantilla de chat embebida mantiene siempre desactivado el modo "thinking" de la arquitectura base (el interruptor de razonamiento de la app no tiene efecto) y aplica un system prompt propio de IRx-2 cuando la aplicación no envía ninguno. Esto evita el fallo típico de que el modelo consuma todo el contexto en razonamiento oculto y devuelva una respuesta vacía o el mensaje "The conversation ran out of room". Además, el KV cache se limita a 8 de las 32 capas, lo que reduce el coste de contexto a unos 0,25 GB a 8K tokens. El autor indica que el modelo pasó una comprobación automática previa a la publicación: conversaciones repetidas de 8 turnos con repeat penalty 1.0 y la petición de "thinking" de la app activada, sin bucles, sin respuestas copiadas, sin razonamiento oculto y con identidad correcta.

## Capacidades

- Generación de texto conversacional multi-turno orientada a preguntas cotidianas, escritura y conocimiento general.
- Razonamiento y escritura superiores a IRx-1 (2B), según la comparativa del propio autor.
- Ejecución totalmente offline y on-device, sin dependencia de APIs externas.
- Integración en runtimes llama.cpp: PocketPal (iOS, iPadOS, Android), LM Studio, llama.rn / React Native y Ollama (importación).
- Soporte de contexto de hasta 8192 tokens con un coste de memoria reducido (KV cache en 8 de 32 capas).
- Plantilla de chat embebida con identidad propia de IRx-2 y modo "thinking" desactivado por defecto.
- Capacidad multilingüe: no disponible (no se documentan idiomas soportados).
- Tool calling / function calling: no soportado; la model card recomienda explícitamente no exponer tools o function calling al modelo en aplicaciones anfitrionas que lo permitan.
- Capacidades de agente y razonamiento multi-paso: no disponibles (el modo de razonamiento está desactivado por diseño).
- Visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional offline en móvil: el modelo cabe en dispositivos de 8 GB de RAM (iPhone 15 Pro Max, iPad Air M1) con unos 3,5 GB de uso a 8K de contexto, lo que permite mantener conversaciones multi-turno sin conexión ni envío de datos a servidores externos.
- Aplicaciones iOS y Android con privacidad por diseño: integrable mediante PocketPal o llama.rn / React Native para asistentes embebidos que procesan texto sensible del usuario sin salir del dispositivo.
- Generación de borradores y asistencia de escritura: con temperatura 0.7, top-p 0.95 y min-p 0.05, está pensado para redacción de textos cotidianos; adecuado para correos, resúmenes o notas donde no se requiere precisión factual extrema.
- Preguntas y respuestas de conocimiento general: uso como base de conocimiento conversacional local para consultas rápidas, aprovechando la ventana de 8192 tokens para incluir contexto documental moderado.
- Prototipado local con Ollama o LM Studio: importación directa del GGUF para validar flujos de producto en escritorio (Mac, Windows, Linux) antes de decidir si se adopta un modelo mayor.
- Despliegue en portátiles Apple Silicon como asistente de línea de comandos: la model card reporta unos 26 tokens/s en CPU de Mac frente a los 54 tokens/s de IRx-1, suficiente para uso interactivo no crítico.
- Escenarios de baja latencia y hardware limitado: en teléfonos de 6 GB o menos el autor recomienda usar IRx-1 en lugar de IRx-2, lo que convierte a este último en la opción para el tramo de gama media-alta con 8 GB o más.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta una medida de velocidad relativa (26 tokens/s de IRx-2 frente a 54 tokens/s de IRx-1, ambos en CPU de Mac) y no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar.

## Requisitos de hardware

- Memoria estimada: unos 3,5 GB de RAM a 8K de contexto con la cuantización Q4_K_M (2,7 GB de pesos + ~0,25 GB de KV cache).
- Dispositivos de referencia confirmados por el autor: iPhone 15 Pro Max, iPad Air M1 y Galaxy Z Fold 7.
- Cabe en consumer: sí, en dispositivos con 8 GB de RAM o más. En teléfonos de 6 GB o menos el autor recomienda usar IRx-1 (2B, ~1,2 GB).
- GPU recomendadas: no disponible (la información proporcionada solo documenta ejecución en CPU de Mac y en dispositivos móviles; no se especifican GPU).
- Opciones de despliegue: PocketPal (iOS, iPadOS, Android), LM Studio, llama.rn / React Native, importación en Ollama y llama.cpp de línea de comandos. Ejemplo de la model card: `llama-cli -m irx-2-Q4_K_M.gguf --jinja -c 8192 -p "How do I convert Celsius to Fahrenheit?"`.
- Latencia y throughput: ~26 tokens/s en CPU de Mac (aproximadamente la mitad que IRx-1, que rinde ~54 tokens/s en el mismo equipo). No se reportan cifras de throughput en lote ni latencia por token bajo GPU.
- Ajustes recomendados: contexto 8192, máximo 1024 tokens nuevos, temperatura 0.7, top-p 0.95, min-p 0.05 y repeat penalty 1.1. El repeat penalty 1.1 viene embebido en el archivo como valor por defecto, pero las apps que permiten configurar el muestreo (como PocketPal) deben aplicarlo también.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| IRx-2 (GGUF) | ~4,2B | 8192 tokens | GGUF Q4_K_M (~2,7 GB) | Apache 2.0 | ~26 tokens/s en CPU de Mac |
| IRx-1 (GGUF) | 2B | No disponible | GGUF (~1,2 GB) | Apache 2.0 | ~54 tokens/s en CPU de Mac; respuestas "buenas para preguntas cotidianas rápidas" |

No se dispone de datos de parámetros, contexto, licencia o rendimiento de otros modelos comparables (por ejemplo alternativas conversacionales de ~4B) en la información proporcionada, por lo que no es posible establecer una comparación adicional sin inventar cifras. Los dos modelos de la tabla pertenecen a la misma familia y su comparación procede íntegramente de la model card de IRx-2.

## Limitaciones y advertencias

- Tool calling desaconsejado: la model card indica explícitamente que no se deben exponer tools o function calling al modelo en aplicaciones anfitrionas que lo soporten, ya que no ha sido diseñado para ello.
- Modo de razonamiento desactivado por diseño: la plantilla embebida fuerza "thinking off" y el interruptor de razonamiento de la aplicación no tiene efecto. El modelo no debe usarse como modelo de razonamiento paso a paso.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni benchmarks de precisión; al ser un modelo de ~4B con una ventana de 8192 tokens, la fiabilidad factual en conocimiento abierto es limitada.
- Idiomas soportados no disponibles: no se especifica qué idiomas cubre, lo que impide garantizar un rendimiento adecuado en castellano u otras lenguas.
- Contexto limitado a 8192 tokens: insuficiente para tareas de contexto largo, análisis de documentos extensos o conversaciones muy prolongadas sin truncado.
- Sin datos de sesgo: no se publica ninguna evaluación de sesgos ni de alineación más allá de la comprobación automática de bucles e identidad descrita en el changelog.
- Fallo conocido si se activa el razonamiento: si una app anfitriona ignora la plantilla embebida y activa el modo de razonamiento, el modelo puede consumir todo el contexto en razonamiento oculto y devolver una respuesta vacía o el mensaje "The conversation ran out of room".
- Restricciones de licencia: Apache 2.0, que permite uso comercial. Al ser un modelo derivado con ajuste fino, se aplican los términos completos de dicha licencia.
- Adopción nula y sin validación externa: el repositorio tiene 0 descargas y 0 "likes", y no se han identificado evaluaciones de terceros. Es un artefacto reciente y sin contraste independiente.
- Hardware mínimo: los dispositivos con 6 GB de RAM o menos no son aptos según el propio autor; en ese caso debe usarse IRx-1.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ikppramesh/irx-2-GGUF
- Modelo base IRx-2: https://huggingface.co/ikppramesh/irx-2
- Modelo IRx-1: https://huggingface.co/ikppramesh/irx-1
- Repositorio IRx-1 (GGUF): https://huggingface.co/ikppramesh/irx-1-GGUF
- Perfil del autor: https://huggingface.co/ikppramesh
- GGUF Model Discovery (directorio de modelos GGUF): https://local-ai-zone.github.io/
- Guía para ejecutar modelos GGUF en local: https://ggufloader.github.io/how-to-run-gguf-models.html
