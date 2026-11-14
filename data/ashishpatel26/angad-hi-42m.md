# ashishpatel26/angad-hi-42m

## Resumen
Angad-hi-42M (अंगद) es un modelo de lenguaje causal de 42,1 millones de parámetros especializado en hindi (devanagari) y ajustado para seguir instrucciones. Lo desarrolla ashishpatel26 dentro de la colección Ramayana Series, una familia de pequeños modelos indic entrenados desde cero. Parte del modelo base Hanuman-hi-42M, preentrenado sobre Wikipedia en hindi, y se ha afinado mediante SFT supervisado sobre aproximadamente 37.000 pares pregunta-respuesta en hindi. Toda la formación se realizó en una única GPU RTX 3060 Laptop de 6 GB de VRAM, lo que lo convierte en un ejemplo de entrenamiento de bajo coste.

El modelo resuelve un problema acotado: disponer de un generador de texto en hindi que aprenda el formato de respuesta instruccional y produzca salidas bien terminadas con el token `</s>`. No está pensado para conocimiento factual ni para razonamiento complejo; su valor es demostrativo y educativo, así como base para experimentación con modelos indic de tamaño reducido.

Su relevancia actual radica en la arquitectura Llama decoder-only, la licencia Apache-2.0 de los pesos y su facilidad de despliegue en hardware muy modesto. El contexto es de 512 tokens y solo soporta hindi. La model card advierte explícitamente de que el modelo ha aprendido "cómo responder", no "qué es verdad".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Llama) |
| Parametros totales | 42.082.816 (42,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | hindi (devanagari), código `hi` |
| Licencia | Apache-2.0 (pesos); ver nota sobre licencia de los datos de entrenamiento |
| Formato de pesos | safetensors (transformers); tokenizador SentencePiece (`spm.model`) |

## Arquitectura y entrenamiento
Angad es un transformer decoder-only causal con arquitectura Llama, preentrenado desde cero en su fase base (Hanuman-hi-42M) sobre Wikipedia en hindi. La fase de instrucción es un SFT puro sobre unos 37.000 pares de pregunta-respuesta en hindi, sin RLHF ni DPO. El entrenamiento completo, tanto el preentrenamiento del base como el ajuste, se ejecutó en una sola RTX 3060 Laptop con 6 GB de VRAM.

La innovación técnica es mínima y deliberada: un modelo pequeño, entrenado íntegramente desde cero para un solo idioma, con una plantilla de prompt fija. El formato exacto de entrada es `<hi>प्रश्न: {pregunta}\nउत्तर: `, y el modelo debe cerrar la respuesta con `</s>` (id 3). La model card insiste en usar la plantilla exacta, ya que cualquier desviación degrada la calidad de las respuestas. No se documentan técnicas como decodificación especulativa, atención lineal ni mezclas de expertos.

## Capacidades
- Generación de texto en hindi (devanagari) con formato instruccional pregunta-respuesta.
- Respuestas que terminan limpiamente con `</s>`: 8 de 8 preguntas de prueba según la model card.
- Fluidez y tono propios de una respuesta: la forma es correcta aunque el contenido factual suele ser erróneo.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Multilingüe: no; únicamente hindi.
- Sin modo thinking, visión ni audio.
- Contexto muy limitado (512 tokens), adecuado solo para prompts y respuestas cortas.

## Casos de uso
- Demostración educativa de entrenamiento desde cero: sirve para ilustrar el pipeline completo (preentrenamiento en hindi, SFT, tokenizador SentencePiece) en una sola GPU de 6 GB, sin infraestructura especial.
- Generación de respuestas cortas en hindi con formato controlado: útil en prototipos donde se necesita un texto de relleno en devanagari con estructura de respuesta y cierre limpio.
- Base para investigación en modelos indic pequeños: punto de partida para experimentar con currículos de SFT, plantillas de prompt o tokenizadores sobre hindi.
- Pruebas de despliegue en hardware de consumo: validar pipelines de transformers y text-generation-inference con un modelo de 0,2 GB de repositorio.
- Evaluación de plantillas de prompt: comparar cómo afecta la plantilla fija al rendimiento en un modelo de 42 M, como referencia para modelos mayores.
- Filtrado y generación de datos sintéticos de baja calidad controlada: generar pares pregunta-respuesta en hindi para tareas de aumento de datos donde la corrección factual no es crítica.
- No recomendado para atención al cliente, generación de código, matemáticas ni ningún escenario donde la exactitud factual sea requisito.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Metrica | Dataset | Valor |
|---|---|---|---|
| Angad-hi-42M | Answer perplexity | Hindi instruction pairs (held-out 1%), mashriram/AI4Bharat-Indic-Languages-and-Cultures | 16,9 |
| Hanuman-hi-42M (base) | Answer perplexity | mismo conjunto | 58,4 |
| Angad-hi-42M | Answer loss | mismo conjunto | 2,83 |
| Hanuman-hi-42M (base) | Answer loss | mismo conjunto | 4,068 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en fp32 (42 M de parámetros, unos 168 MB de pesos) más el overhead del runtime; holgado en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el propio autor entrenó en una RTX 3060 Laptop de 6 GB.
- Cabe en GPU consumer: sí, en GTX 1050/1650, RTX 2060/3060/4060 y superiores; también en CPU.
- Opciones de despliegue: transformers (`LlamaForCausalLM`) con tokenizador SentencePiece; compatible con text-generation-inference y endpoints según los tags del repositorio. No se documentan variantes GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Angad-hi-42M | 42,1 M | 512 | hindi | Apache-2.0 | SFT sobre base propio; perplexity 16,9 declarada |
| Hanuman-hi-42M | 42,1 M | 512 | hindi | Apache-2.0 | Base preentrenado desde cero; perplexity 58,4 declarada |
| Alternativas de 40-50 M en hindi | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias
- Alucinación factual severa: la model card documenta respuestas incorrectas como "Chennai" como capital de India o fechas erróneas para Gandhi. El modelo aprende formato, no conocimiento.
- Sesgos conocidos: no documentados explícitamente, pero al entrenarse solo con Wikipedia en hindi y pares de instrucción puede heredar sesgos de esas fuentes.
- Limitación de contexto: 512 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Limitación de idioma: solo hindi; no se ha evaluado su comportamiento en otros idiomas.
- Restricciones de licencia: los pesos son Apache-2.0, pero la model card remite a una nota sobre la licencia de los datos de entrenamiento que debe revisarse antes de un uso comercial.
- Plantilla de prompt rígida: desviarse del formato `<hi>प्रश्न: ...\nउत्तर: ` degrada las respuestas.
- No apto para producción en tareas que requieran exactitud: sin RLHF/DPO, sin tool calling y sin evaluación independiente de benchmarks.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ashishpatel26/angad-hi-42m
- Modelo base: https://huggingface.co/ashishpatel26/hanuman-hi-42m
- Colección Ramayana Series: https://huggingface.co/collections/ashishpatel26/ramayana-series-indic-llms-from-scratch-6af7e87d0a621b28fed81feb
- Web del proyecto: https://ashishpatel26.github.io/ramayana-llm/
- Dataset de entrenamiento: https://huggingface.co/datasets/mashriram/AI4Bharat-Indic-Languages-and-Cultures
- Perfil del autor: https://huggingface.co/ashishpatel26
