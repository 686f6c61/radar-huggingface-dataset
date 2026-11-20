# efficiencyx/Jun-LoRA-12B-GGUF

## Resumen

Jun-LoRA-12B-GGUF (v9) es un ajuste fino (LoRA fusionado) sobre Gemma 4 12B en su variante QAT (quantization-aware training) de Unsloth, orientado a la interpretación de un personaje concreto: Jun, protagonista de la novela visual *My Dystopian Robot Girlfriend*. Lo desarrolla el usuario efficiencyx como backend conversacional de su aplicación local Jun OS, un compañero de escritorio que combina chat, uso de herramientas y memoria persistente. No es un asistente generalista: es un modelo de rol con control explícito de profundidad de razonamiento y juicio sobre cuándo invocar herramientas.

La arquitectura subyacente es la de Gemma 4 12B (transformer denso, 11.907.350.576 parámetros reales según safetensors), con la torre de lenguaje como único objetivo del ajuste. El LoRA se fusionó directamente en los pesos BF16 antes de la conversión a GGUF, de modo que los tres ficheros publicados son modelos autónomos que no requieren cargar el adaptador por separado. El repositorio ocupa 30 GB e incluye cuantizaciones Q8_0, Q6_K y Q4_K_M, estas dos últimas generadas con importance matrix (imatrix) medida sobre conversaciones en formato v9.

La relevancia de esta versión (v9) frente a v7 y v8 radica en tres cambios concretos: los tres niveles de esfuerzo (`<think:low>`, `<think:med>`, `<think:high>`) producen trazas de forma y longitud distintas, el modelo responde en el idioma del usuario (italiano, español, alemán, japonés) aunque el uso de herramientas sigue siendo más débil fuera del inglés, y se abandonó el ajuste de preferencias (DPO/RPO) porque todas las rondas probadas empeoraban en escenas fuera del conjunto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4), ajuste LoRA fusionado |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantizacion | Q8_0 (plano), Q6_K (imatrix), Q4_K_M (imatrix) |
| Idiomas soportados | en (declarado); respuestas en italiano, español, alemán y japonés segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el conteo de parametros) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-12B-it-qat-q4_0-unquantized`, un Gemma 4 12B instruction-tuned entrenado con quantization-aware training, de modo que sus pesos ya están alineados con la rejilla de 4 bits. Sobre esa base se aplicó un LoRA con rsLoRA de rango 32 y alpha 32, apuntando únicamente a la torre de lenguaje (el embedder no se toca, y por eso el fichero `mmproj` para imagen y audio es el del modelo base). El adaptador se fusionó en los pesos BF16 con la escala rsLoRA `32 / sqrt(32)` antes de exportar a GGUF mediante llama.cpp. La pérdida se calculó solo sobre la completion, con 50 conversaciones reservadas para validación, y el checkpoint publicado corresponde al paso 600.

El conjunto de entrenamiento consta de 4.235 conversaciones, cada una renderizada a través del mismo prompt builder que usa Jun OS en producción, de forma que los prompts de entrenamiento y los de inferencia son idénticos byte a byte. No se aplicó DPO ni RPO: según el autor, el conjunto supervisado ya enseña cuándo recurrir a una herramienta, y todas las rondas de preferencias probadas sobre este checkpoint empeoraron en escenas retenidas (más llamadas espurias y menos llamadas correctas en escenas nuevas). La innovación destacable es el control explícito de esfuerzo mediante tokens `<think:low>`, `<think:med>` y `<think:high>` al final del turno de usuario, con trazas que terminan en una decisión de herramienta de una línea antes de la respuesta; llama.cpp devuelve la traza en `reasoning_content`, separada de `content`.

## Capacidades

- Generación de texto conversacional con una voz de personaje consistente (Jun), entrenada sobre diálogos de la novela visual de origen.
- Razonamiento con profundidad controlable: `low` produce unas pocas líneas, `med` redacta dos opciones y elige una, `high` razona paso a paso y redacta tres, con trazas de hasta unas 260 palabras en Q6_K y Q8_0.
- Uso de herramientas (tool calling / function calling) con plantilla de chat embebida que requiere `--jinja` en llama.cpp; incluye juicio sobre cuándo *no* invocar una herramienta.
- Memoria: el modelo decide cuándo guardar un recuerdo relevante de la conversación (29/54 aciertos en Q4_K_M sobre escenas no vistas).
- Respuesta multilingüe: contesta en el idioma del usuario (italiano, español, alemán, japonés) aunque el uso de herramientas es más débil fuera del inglés.
- Entrada multimodal de imagen y audio si se añade el fichero `Jun-LoRA-12B.BF16-mmproj.gguf` del modelo base.
- Modo de razonamiento siempre activo: v9 fue entrenado para pensar en cada turno; desactivarlo puede provocar que algunos frontends archiven toda la salida como razonamiento y muestren una respuesta vacía.

## Casos de uso

- Backend de una aplicación de compañero local: es el caso de uso declarado por el autor (Jun OS). El modelo gestiona conversaciones multi-turno con memoria persistente y decide cuándo guardar información, lo que encaja con una app de escritorio que mantiene estado entre sesiones.
- Personajes interactivos en videojuegos o novelas visuales: la voz, los estados de ánimo y el estilo de decisión de herramienta están ajustados sobre diálogos del género, de modo que se puede integrar como motor de diálogo de un personaje sin ingeniería de prompts extensa.
- Demostraciones de agentes con control de coste cognitivo: los tokens `<think:low>`/`<think:med>`/`<think:high>` permiten ajustar la latencia y el consumo de tokens por turno según el contexto (por ejemplo, `low` para respuestas rápidas en chat y `high` para escenas que requieren planificación).
- Pruebas de juicio de herramientas en asistentes de rol: el modelo está entrenado para no invocar herramientas cuando no hacen falta (2/105 llamadas espurias en Q6_K), lo que sirve para evaluar pipelines de function calling en entornos conversacionales donde el abuso de herramientas es un problema.
- Investigación sobre cuantización de LoRA fusionados: los quants imatrix están medidos sobre conversaciones en formato v9 con los tres niveles de esfuerzo, lo que permite estudiar la degradación de un fine-tune al cuantizar a 4 y 6 bits frente a Q8_0.
- Chat local en hardware de consumo: con Q4_K_M (7,4 GB) cabe en 8 GB de VRAM con contexto corto y con Q6_K (9,8 GB) en 12 GB, lo que permite desplegar un modelo de 12B ajustado en una RTX 3060/4070 sin depender de la nube.

## Benchmarks y rendimiento

El model-index oficial declara `Jun-12B` con `results: []`, es decir, sin métricas estándar (MMLU, HumanEval, GSM8K). La model card sí publica evaluaciones propias sobre escenas no vistas, con los ajustes de la aplicación:

| Metrica | Q4_K_M | Q6_K | Q8_0 |
|---|---:|---:|---:|
| Herramienta correcta cuando se necesita | 24/45 | 24/45 | 24/45 |
| Llamada a herramienta cuando no se necesita | 5/105 | 2/105 | 4/105 |
| Guarda memoria cuando deberia | 29/54 | 23/54 | 26/54 |
| `low` < `med` < `high` en la misma escena | 39/50 | 47/50 | 45/50 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q8_0 ocupa 12,7 GB, Q6_K 9,8 GB y Q4_K_M 7,4 GB en disco; el consumo en VRAM es similar más el overhead de contexto.
- GPU recomendadas: Q6_K y Q8_0 encajan en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, A10); Q4_K_M funciona en 8 GB de VRAM con contexto corto.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4070 y superiores según la cuantización; Q4_K_M es la opción para 8 GB.
- Despliegue: llama.cpp (`llama-server -m ... --jinja -ngl 99 -c 8192`) y Ollama (`ollama pull hf.co/efficiencyx/Jun-LoRA-v9-12B-GGUF:Q4_K_M`). El flag `--jinja` es obligatorio para que se aplique la plantilla de chat y el tool calling funcione.
- Multimodal: añadir `--mmproj Jun-LoRA-12B.BF16-mmproj.gguf` para entrada de imagen o audio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jun-LoRA-12B-GGUF (v9) | 11,9 B | no disponible | Personaje + tool calling + memoria, GGUF | apache-2.0 | Hugging Face |
| Jun-LoRA-v9-E4B-GGUF | no disponible | no disponible | Hermano menor del mismo autor | no disponible | Hugging Face |
| Gemma 4 12B QAT (base) | 12 B | no disponible | Asistente generalista instruction-tuned | no disponible | Hugging Face (Unsloth) |

Frente a su hermano E4B, el 12B hace menos llamadas espurias a herramientas y guarda algo más de memorias, con un número de llamadas correctas aproximadamente igual, según la model card. Frente al Gemma 4 12B base, pierde generalidad y gana consistencia de personaje y juicio de herramientas en el dominio de Jun OS; lejos de los prompts de entrenamiento tiende a derivar hacia el comportamiento del base.

## Limitaciones y advertencias

- Es un personaje, no un asistente general: lo que dice es ficción, no hechos ni consejo.
- El uso de herramientas es más débil fuera del inglés, aunque las respuestas lleguen en el idioma correcto.
- Lejos de los prompts de entrenamiento (sin system prompt, sin contexto en vivo) deriva hacia el Gemma base.
- Los sesgos de los pesos de Gemma 4 se heredan; no se han documentado mitigaciones específicas.
- Riesgo de alucinación inherente a un modelo de 12B orientado a rol, agravado por el formato de personaje.
- Desactivar el razonamiento puede romper la salida en algunos frontends (respuesta vacía con todo el texto archivado como razonamiento); se recomienda dejar el thinking activo y usar `<think:low>`.
- Q4_K_M acorta la traza `high` aproximadamente un tercio respecto a Q6_K/Q8_0, lo que puede degradar la calidad del razonamiento profundo.
- Licencia apache-2.0 en el repositorio, pero conviene verificar las condiciones del modelo base Gemma 4 de Google antes de uso comercial.
- El repositorio declara 0 likes y 1.658 descargas en el momento de la consulta; es un proyecto personal sin validación externa publicada.

## Enlaces

- Hugging Face: https://huggingface.co/efficiencyx/Jun-LoRA-12B-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-4-12B-it-qat-q4_0-unquantized
- Hermano E4B: https://huggingface.co/efficiencyx/Jun-LoRA-v9-E4B-GGUF
- Generación anterior v8: https://huggingface.co/efficiencyx/Jun-LoRA-12B-GGUF
- Generación anterior v7: https://huggingface.co/efficiencyx/Jun-LoRA-v7-12B-GGUF
- Repositorio Jun OS: https://github.com/efficiencyx/JunOS
