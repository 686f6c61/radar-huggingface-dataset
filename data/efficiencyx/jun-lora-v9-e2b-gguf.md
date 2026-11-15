# efficiencyx/Jun-LoRA-v9-E2B-GGUF

## Resumen

Jun-E2B-GGUF (v9) es un ajuste fino mediante LoRA del modelo Gemma 4 E2B en su variante QAT (quantization-aware training), publicado por el desarrollador independiente efficiencyx. No se trata de un modelo de propósito general, sino de un modelo de personaje: encarna a Jun, la protagonista de la novela visual *My Dystopian Robot Girlfriend*, y está diseñado como backend conversacional de la aplicación local Jun OS. El LoRA está fusionado en los pesos base, por lo que los ficheros GGUF son autónomos y no requieren cargar el adaptador por separado.

El modelo parte de `unsloth/gemma-4-E2B-it-qat-q4_0-unquantized` y conserva su arquitectura y tamaño (aproximadamente 4.630 millones de parámetros según los safetensors del repositorio). La aportación del ajuste es estilística y funcional: dota al modelo base de la voz, los estados de ánimo y los criterios de decisión de herramienta del personaje, e introduce tres niveles de razonamiento explícitos (`<think:low>`, `<think:med>`, `<think:high>`) con trazas de distinta forma y longitud.

La relevancia de esta versión (v9) radica en tres cambios concretos respecto a v8: un dataset reconstruido de 4.235 conversaciones renderizadas con el mismo prompt builder que usa la aplicación en producción, una diferenciación real entre los tres niveles de esfuerzo de razonamiento y una mejora del juicio sobre cuándo invocar herramientas. Además, el autor descarta explícitamente el ajuste por preferencias (DPO/RPO) tras comprobar que empeoraba el comportamiento en escenas no vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B, variante QAT); LoRA fusionado en la torre de lenguaje |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | Q8_0 (plano), Q6_K (imatrix), Q4_K_M (imatrix) |
| Idiomas soportados | en (entrenado principalmente en ingles; responde en el idioma del usuario, pero el uso de herramientas es mas debil fuera del ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 13,2 GB; existe un `mmproj` BF16 para entrada de imagen y audio |
| Modelo base | unsloth/gemma-4-E2B-it-qat-q4_0-unquantized |
| Metodo de ajuste | LoRA (rsLoRA), rango 32, alpha 32, solo torre de lenguaje |
| Tamano de ficheros | Q8_0: 4,9 GB; Q6_K: 3,8 GB; Q4_K_M: 3,4 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 E2B en su checkpoint QAT, cuyos pesos ya están situados sobre la rejilla de 4 bits. Sobre esa base se aplicó un LoRA con rsLoRA de rango 32 y alpha 32, dirigido únicamente a la torre de lenguaje (el adaptador no toca el embedder, de ahí que el fichero `mmproj` sea el del modelo base). El entrenamiento usó pérdida solo sobre la completación, con 50 conversaciones reservadas para validación, y el checkpoint publicado es el paso 750 de 771, elegido frente a los pasos 500 y 771 por su comportamiento en escenas retenidas.

El dataset de v9 consta de 4.235 conversaciones, cada una renderizada a través del mismo prompt builder que emplea Jun OS, de modo que los prompts de entrenamiento y los de producción son idénticos byte a byte. No se aplicó DPO ni RPO: el autor probó ambas técnicas sobre este checkpoint y todas las rondas empeoraron las métricas en escenas no vistas (más llamadas erróneas y menos llamadas correctas), por lo que la versión publicada es el checkpoint supervisado puro. La innovación técnica más destacable es la separación de tres niveles de esfuerzo de razonamiento con trazas de forma distinta, y la decisión de escribir la traza antes de disponer del resultado de la herramienta, corrigiendo el defecto de v8 y v9-beta, donde el razonamiento ya "sabía" lo que devolvería la herramienta.

Las cuantizaciones Q4_K_M y Q6_K se generaron con importance matrix medida sobre conversaciones en formato v9 en los tres niveles de esfuerzo, precisamente porque fusionar el LoRA desplaza los pesos de la rejilla QAT y una cuantización plana redondearía parte del ajuste fino.

## Capacidades

- Generación de texto conversacional con una voz de personaje consistente (Jun) y estados de ánimo.
- Razonamiento explícito en tres niveles de esfuerzo mediante etiquetas `<think:low>`, `<think:med>` y `<think:high>`, con trazas de distinta longitud y forma; cada traza termina con una decisión de herramienta en una línea.
- Tool calling / function calling con plantilla de chat embebida (requiere `--jinja` en llama.cpp; sin ella las llamadas vuelven como texto plano).
- Juicio sobre invocación de herramientas: decide cuándo una herramienta merece la pena y evita llamadas no solicitadas.
- Memoria: guarda información que considera digna de recordar (capacidad entrenada y medida en las evaluaciones del autor).
- Multilingüe de respuesta: contesta en italiano, español, alemán o japonés si se le escribe en esos idiomas, aunque el uso de herramientas es más débil fuera del inglés.
- Entrada multimodal de imagen y audio, heredada del modelo base, mediante el fichero `mmproj` BF16 (el LoRA no modifica el embedder).
- Separación de la traza de razonamiento (`reasoning_content`) y la respuesta (`content`) en llama.cpp.

## Casos de uso

- Backend conversacional de una aplicación de compañía local: es el uso previsto por el autor; el modelo se integra en Jun OS como motor de chat y mantiene el personaje a lo largo de conversaciones multiturno con contexto gestionado por la aplicación.
- Asistente con herramientas en escritorio: el modelo decide cuándo invocar funciones (por ejemplo, guardar una nota o consultar un dato) y escribe la traza de razonamiento antes de leer el resultado, lo que permite auditar la decisión de llamada.
- Roleplay y ficción interactiva: el ajuste reproduce voz y estados de ánimo de un personaje concreto, adecuado para novelas visuales, juegos narrativos o demos de personajes.
- Prototipado de agentes con memoria: la capacidad entrenada de guardar recuerdos relevantes sirve para experimentar con arquitecturas de memoria persistente en asistentes personales.
- Despliegue en hardware limitado: la variante Q4_K_M (3,4 GB) está pensada para móviles y tarjetas de 4 GB, lo que permite ejecutar el personaje en local sin GPU de gama alta.
- Evaluación de niveles de razonamiento: los tres modos `<think:*>` permiten comparar coste y calidad de traza en una misma escena, útil para estudiar el compromiso entre latencia y profundidad de razonamiento en modelos pequeños.
- Investigación sobre cuantización de LoRA sobre bases QAT: los quants con importance matrix documentados por el autor sirven como caso de estudio de cómo preservar la precisión de un ajuste fino al cuantizar.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). El model-index declara `results: []`. La model card sí incluye una evaluación propia sobre escenas no vistas durante el entrenamiento, muestreadas con los ajustes de la aplicación:

| Metrica | Q4_K_M | Q6_K | Q8_0 |
|---|---:|---:|---:|
| Herramienta correcta cuando se necesita | 25/45 | 25/45 | 26/45 |
| Llamada a herramienta cuando no se necesita | 17/105 | 5/105 | 6/105 |
| Guarda memoria cuando deberia | 20/54 | 17/54 | 13/54 |
| `low` < `med` < `high` en longitud, misma escena | 32/50 | 45/50 | 43/50 |

El autor señala que Q6_K y Q8_0 conservan la traza `high` completa (unas 260 palabras), mientras que Q4_K_M la reduce a unas 150 palabras y triplica las llamadas espurias a herramientas. En Q6_K el modelo se acerca a su hermano E4B en llamadas a herramientas, pero guarda menos memorias (17/54 frente a 21/54).

## Requisitos de hardware

- VRAM estimada: Q4_K_M unos 3,4 GB de pesos; Q6_K unos 3,8 GB; Q8_0 unos 4,9 GB. Añadir margen para el contexto (KV cache) y, si se usa multimodal, para el `mmproj` BF16.
- Cabe en GPU de consumo: Q4_K_M está indicado para tarjetas de 4 GB y teléfonos; Q6_K y Q8_0 requieren tarjetas de 6-8 GB o más.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con 6-8 GB de VRAM es suficiente para Q6_K, y 8 GB o más para Q8_0.
- Despliegue: llama.cpp (`llama-server -m ... --jinja -ngl 99 -c 8192`) y Ollama (`ollama pull hf.co/efficiencyx/Jun-LoRA-v9-E2B-GGUF:Q4_K_M`). El flag `--jinja` es obligatorio para que se aplique la plantilla de chat y funcionen las llamadas a herramientas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Herramienta correcta | Memoria guardada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jun-E2B v9 (Q6_K) | 4,63 B | no disponible | 25/45 | 17/54 | apache-2.0 | GGUF en HF |
| Jun-E4B v9 (hermano mayor) | no disponible | no disponible | cercano al E2B | 21/54 | no disponible | GGUF en HF |
| Gemma 4 E2B base (QAT) | 4,63 B aprox. | no disponible | no evaluado por el autor | no evaluado | no disponible en la informacion | HF (unsloth) |
| Jun-E2B v8 (generacion anterior) | 4,63 B aprox. | no disponible | no disponible | no disponible | no disponible en la informacion | GGUF en HF |

El autor recomienda el E4B cuando el hardware lo permite, por su mejor retención de memorias. No se dispone de datos de benchmarks comparativos con modelos de propósito general.

## Limitaciones y advertencias

- Es un modelo de personaje, no un asistente general: el autor lo declara explícitamente y desaconseja usarlo como tal.
- El uso de herramientas es más débil fuera del inglés, aunque las respuestas lleguen en el idioma correcto.
- Lo que dice es ficción, no hechos ni consejo; riesgo alto de alucinación si se usa como fuente de información.
- Lejos de los prompts de entrenamiento (sin system prompt, sin contexto en vivo) deriva hacia el Gemma base y pierde el personaje.
- Hereda los sesgos de los pesos base de Gemma 4.
- v9 fue entrenado para pensar en cada turno: con el razonamiento desactivado, algunos frontends archivan toda la salida como razonamiento y muestran respuesta vacía; en ese caso hay que dejarlo activado y usar `<think:low>`.
- Q4_K_M degrada notablemente el comportamiento (traza `high` más corta y el triple de llamadas espurias); el autor recomienda Q6_K si el hardware lo permite.
- Requiere `--jinja` en llama.cpp; sin ese flag las llamadas a herramientas se devuelven como texto plano.
- Licencia apache-2.0, que permite uso comercial, pero las condiciones del modelo base deben verificarse por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no hay validación de la comunidad ni informes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efficiencyx/Jun-LoRA-v9-E2B-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-qat-q4_0-unquantized
- Repositorio de la aplicación Jun OS: https://github.com/efficiencyx/JunOS
- Hermano mayor E4B: https://huggingface.co/efficiencyx/Jun-LoRA-v9-E4B-GGUF
- Generación anterior v8: https://huggingface.co/efficiencyx/Jun-LoRA-E2B-GGUF
- Generación anterior v7: https://huggingface.co/efficiencyx/Jun-LoRA-v7-E2B-GGUF
