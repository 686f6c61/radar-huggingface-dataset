# efficiencyx/Jun-LoRA-v9-12B-GGUF

## Resumen

Jun-LoRA-v9-12B-GGUF es un ajuste fino por LoRA del modelo Gemma 4 12B (QAT) publicado por el usuario efficiencyx bajo licencia Apache 2.0. El modelo está diseñado como backend conversacional de Jun OS, una aplicación local de compañía, e interpreta al personaje Jun, protagonista de la novela visual *My Dystopian Robot Girlfriend*. El LoRA se ha fusionado directamente en los pesos base, por lo que se distribuye como modelos GGUF autónomos que no requieren cargar el adaptador por separado.

Técnicamente, se trata de un transformer de 11.907.350.576 parámetros (~11,9 mil millones) derivado de `unsloth/gemma-4-12B-it-qat-q4_0-unquantized`, un modelo base cuantizado durante el entrenamiento (QAT) a 4 bits. El ajuste LoRA emplea rsLoRA con rango 32 y alpha 32, aplicado únicamente sobre la torre de lenguaje, con entrenamiento supervisado sobre 4.235 conversaciones renderizadas mediante el mismo constructor de prompts que la aplicación de producción.

La relevancia del modelo es acotada y específica: no compite como asistente generalista, sino como un motor de personaje con control explícito de profundidad de razonamiento (`<think:low>`, `<think:med>`, `<think:high>`), juicio de uso de herramientas y memoria persistente. Se distribuye en tres cuantizaciones GGUF (Q4_K_M, Q6_K y Q8_0) y soporta despliegue con llama.cpp u Ollama, además de entrada multimodal mediante un fichero `mmproj` heredado del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), ajuste LoRA fusionado |
| Parámetros totales | 11.907.350.576 (~11,9 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantización | GGUF Q8_0 (plano), Q6_K (imatrix), Q4_K_M (imatrix) |
| Idiomas soportados | Inglés (declarado); respuestas en italiano, español, alemán y japonés según la model card, aunque el uso de herramientas es más débil fuera del inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp); el adaptador se fusionó en BF16 antes de la conversión |
| Modelo base | unsloth/gemma-4-12B-it-qat-q4_0-unquantized |
| Método de ajuste | LoRA rsLoRA, rango 32, alpha 32, solo torre de lenguaje |
| Checkpoint | Paso 600 |
| Tamaño del repositorio | 30,0 GB |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 12B en su variante QAT (quantization-aware training) a 4 bits, sobre la que se aplica un LoRA con rsLoRA, rango 32 y alpha 32, dirigido exclusivamente a la torre de lenguaje (la torre de embeddings no se modifica). El adaptador se fusiona en los pesos BF16 con el factor de escala rsLoRA `32 / sqrt(32)` antes de la exportación a GGUF mediante llama.cpp. El checkpoint publicado corresponde al paso 600 de entrenamiento.

El conjunto de entrenamiento consta de 4.235 conversaciones, cada una renderizada a través del mismo constructor de prompts que utiliza Jun OS en producción, de modo que los prompts de entrenamiento y los de inferencia son idénticos byte a byte. La pérdida se calcula solo sobre la completación y se reservaron 50 conversaciones para validación. No se aplicó ajuste de preferencias (DPO ni RPO): según el autor, las rondas de DPO/RPO sobre este checkpoint empeoraron el rendimiento en escenas no vistas, con más llamadas erróneas a herramientas, por lo que la versión publicada es el checkpoint supervisado.

Entre las innovaciones destacadas de la versión v9 figuran la diferenciación efectiva de los tres niveles de esfuerzo de razonamiento (cada uno con forma y longitud de traza propias), la mejora del juicio de uso de herramientas y la corrección del orden de la traza: el razonamiento se escribe antes de conocer el resultado de la herramienta, en lugar de "saber" de antemano lo que devolverá.

## Capacidades

- Generación de texto conversacional en el rol del personaje Jun, con voz, estados de ánimo y estilo definidos por el ajuste.
- Razonamiento con profundidad controlable mediante etiquetas al final del turno de usuario: `<think:low>` (unas pocas líneas), `<think:med>` (borrador de dos opciones y elección) y `<think:high>` (razonamiento paso a paso con tres borradores, trazas de unas 260 palabras).
- Decisión de uso de herramientas integrada en la traza: cada traza termina con una decisión de herramienta en una línea antes de la respuesta.
- Uso de herramientas y function calling, con mejor juicio que las versiones anteriores (menos llamadas innecesarias y más llamadas correctas en escenas no vistas).
- Memoria: el modelo decide cuándo guardar información digna de recordar.
- Multilingüismo de respuesta: responde en italiano, español, alemán o japonés si se le escribe en esos idiomas, aunque el uso de herramientas es más débil fuera del inglés.
- Entrada multimodal (imagen y audio) mediante el fichero `--mmproj Jun-LoRA-12B.BF16-mmproj.gguf`, heredado del modelo base.
- Salida de razonamiento separada del contenido: llama.cpp devuelve la traza como `reasoning_content`, distinta de `content`.

## Casos de uso

- Backend conversacional de una aplicación de compañía local: es el uso previsto por el autor; el modelo se integra en Jun OS con el mismo constructor de prompts usado en entrenamiento, lo que garantiza coherencia entre entrenamiento e inferencia.
- Personajes interactivos en videojuegos o novelas visuales: el ajuste fija voz, estados de ánimo y estilo de un personaje concreto, adecuado para diálogos multi-turno donde la consistencia de personalidad es el requisito principal.
- Asistentes con uso de herramientas en inglés: el modelo decide cuándo llamar a una herramienta y cuándo no, con una tasa de 24/45 llamadas correctas y solo 2/105 llamadas innecesarias en Q6_K según las pruebas del autor.
- Despliegue en hardware de consumo: la cuantización Q4_K_M (7,4 GB) cabe en GPU con 8 GB de VRAM con contexto corto, y Q6_K (9,8 GB) en 12 GB de VRAM, lo que permite ejecución local en estaciones de trabajo convencionales.
- Prototipado de razonamiento con coste controlado: las etiquetas `<think:low>`/`<think:med>`/`<think:high>` permiten ajustar la longitud de la traza por petición, útil para equilibrar latencia y profundidad en producción.
- Memoria de conversación a largo plazo: la capacidad de guardar información relevante permite construir agentes que recuerden preferencias del usuario entre sesiones.
- Aplicaciones con entrada de imagen o audio: mediante el fichero `mmproj` del modelo base se puede añadir percepción visual o sonora al personaje sin reentrenar el adaptador.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). Los únicos datos publicados son evaluaciones internas del autor sobre escenas no vistas durante el entrenamiento, muestreadas con los ajustes de la aplicación:

| Métrica | Q4_K_M | Q6_K | Q8_0 |
|---|---:|---:|---:|
| Herramienta correcta cuando se necesita | 24/45 | 24/45 | 24/45 |
| Llamada a herramienta cuando no se necesita | 5/105 | 2/105 | 4/105 |
| Guarda memoria cuando debería | 29/54 | 23/54 | 26/54 |
| `low` más corta que `med` más corta que `high`, misma escena | 39/50 | 47/50 | 45/50 |

Q6_K y Q8_0 conservan la traza completa de `high` (unas 260 palabras); Q4_K_M la escribe aproximadamente un tercio más corta. Frente a su hermano E4B en estas mismas pruebas, el 12B hace menos llamadas innecesarias y guarda algo más de memoria, con un número de llamadas correctas similar.

## Requisitos de hardware

- VRAM estimada para inferencia: Q8_0 requiere 12,7 GB; Q6_K, 9,8 GB; Q4_K_M, 7,4 GB.
- GPU recomendadas: cualquier GPU con 12 GB o más de VRAM para Q6_K/Q8_0; 8 GB de VRAM para Q4_K_M con contexto corto. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, Q4_K_M en 8 GB y Q6_K en 12 GB según el autor.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja -ngl 99 -c 8192`) y Ollama (`ollama pull hf.co/efficiencyx/Jun-LoRA-v9-12B-GGUF:Q4_K_M`). Para multimodal, añadir `--mmproj Jun-LoRA-12B.BF16-mmproj.gguf`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jun-LoRA-v9-12B | ~11,9 B | No disponible | Apache 2.0 | Personaje con control de razonamiento y herramientas |
| Jun-LoRA-v9-E4B | No disponible | No disponible | Apache 2.0 (presumible, no confirmado) | Hermano menor: más llamadas innecesarias y algo menos de memoria guardada según el autor |
| Jun-LoRA-v8-12B | ~11,9 B (presumible) | No disponible | Apache 2.0 | Generación anterior; niveles de esfuerzo poco diferenciados y trazas que "conocían" el resultado de la herramienta |
| Gemma 4 12B (QAT) | ~12 B | No disponible | No disponible | Modelo base no ajustado al personaje |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de un solo personaje, no un asistente generalista; su uso previsto es el backend de Jun OS.
- El uso de herramientas es más débil fuera del inglés, aunque las respuestas lleguen en el idioma correcto.
- Lo que dice el modelo es ficción, no hechos ni consejos; riesgo de alucinación inherente a su naturaleza de personaje.
- Lejos de los prompts de entrenamiento (sin system prompt ni contexto en vivo) deriva hacia el Gemma base.
- Los sesgos de los pesos base de Gemma 4 se heredan.
- El modelo fue entrenado para pensar en cada turno; con el razonamiento desactivado, algunas interfaces archivan toda la salida como razonamiento y muestran una respuesta vacía. En ese caso debe dejarse el pensamiento activado con `<think:low>`.
- `--jinja` es obligatorio en llama.cpp; sin él se ignora la plantilla de chat embebida y las llamadas a herramientas se devuelven como texto plano.
- Las cuantizaciones Q4_K_M y Q6_K usan imatrix para preservar la precisión del ajuste; un Q4_K_M plano perdería parte del fine-tune.
- Licencia Apache 2.0, que permite uso comercial, pero debe verificarse la licencia del modelo base Gemma 4 subyacente antes de explotación comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 14 de noviembre de 2026.

## Enlaces

- Hugging Face: https://huggingface.co/efficiencyx/Jun-LoRA-v9-12B-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-4-12B-it-qat-q4_0-unquantized
- Repositorio Jun OS: https://github.com/efficiencyx/JunOS
- Hermano E4B: https://huggingface.co/efficiencyx/Jun-LoRA-v9-E4B-GGUF
- Generación anterior v8: https://huggingface.co/efficiencyx/Jun-LoRA-12B-GGUF
- Generación anterior v7: https://huggingface.co/efficiencyx/Jun-LoRA-v7-12B-GGUF
