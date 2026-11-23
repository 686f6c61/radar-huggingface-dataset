# decido-ai/decido-1-think-26b-a4b

## Resumen

Decido-1-Think (26B-A4B) es un modelo de decisión desarrollado por decido-ai, afinado a partir de google/gemma-4-26B-A4B-it. No es un modelo conversacional generalista: su función es recibir un documento (texto o JSON) y un conjunto de preguntas estructuradas (sí/no, elección entre opciones, o escalas ordenadas) y devolver una distribución de probabilidad calibrada sobre cada respuesta. Está entrenado para razonar paso a paso antes de emitir el veredicto, con hasta 1.024 tokens de razonamiento en decodificación greedy.

El modelo pertenece a la familia Decido 1, que incluye variantes más pequeñas (Fast 1.7B, Ultra 0.6B) y de mayor precisión (Max). Think ocupa la franja de alta precisión con un compromiso de latencia: obtiene una puntuación media de 88,71 en el conjunto de seis benchmarks de la comunidad Jev-reproduction, frente a 85,90 de Decido-1 y 83,85 de Jev 1.13. La arquitectura subyacente es la de Gemma 4, con 25.805.936.206 parámetros totales y un diseño de mezcla de expertos (A4B indica aproximadamente 4.000 millones de parámetros activos por token).

La relevancia actual radica en su enfoque en calibración: el modelo no solo acierta, sino que declara confianza bien ajustada (Brier y ECE competitivos frente a Jev 1.13), lo que lo hace apto para enrutamiento y clasificación en producción donde importa el umbral de confianza. Se distribuye bajo licencia Apache-2.0 y soporta pesos safetensors y GGUF para llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), basada en Gemma 4 |
| Parámetros totales | 25.805.936.206 |
| Parámetros activos | ~4.000 millones (designación A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (soporte vía llama.cpp); otras no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it, un transformer con mezcla de expertos en el que se activan aproximadamente 4.000 millones de parámetros por token sobre un total de 25.800 millones. Sobre esa base, decido-ai realizó un ajuste fino orientado a la tarea de decisión: dado un estado (documento) y un conjunto de preguntas, producir una distribución calibrada de etiquetas. La variante Think añade un entrenamiento específico para razonar antes de responder, con cadenas de razonamiento de hasta 1.024 tokens generadas de forma greedy.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona que el documento de entrada se trata como dato no fiable: las instrucciones embebidas en él no se siguen y las cadenas de tokens de control se neutralizan, lo que constituye una medida de seguridad frente a inyección de prompts. El modelo se distribuye con `inference: false` en la model card, lo que indica que la inferencia se realiza a través del paquete `decido-ai` o de llama.cpp, no mediante el pipeline estándar de transformers.

## Capacidades

- Clasificación y decisión estructurada: responde preguntas de tipo sí/no, elección única entre 1 y 255 opciones, y escalas ordenadas de 2 a 10 niveles.
- Salida calibrada: devuelve distribuciones de probabilidad y niveles de confianza, no solo la etiqueta ganadora.
- Razonamiento en modo thinking: genera hasta 1.024 tokens de razonamiento previo a la respuesta (decodificación greedy).
- Entrada multimodal texto-imagen: el pipeline declarado es image-text-to-text, heredado de la base Gemma 4.
- Formato de entrada flexible: acepta documentos en texto plano o JSON, y el formato de cable de Jev 1.13 (`noul`, `choice`, `score`).
- Resistencia a inyección de prompts: neutraliza instrucciones y tokens de control presentes en el documento de entrada.
- Compatibilidad de API: servidor compatible con Jev (`POST /v1/systemone`), de modo que clientes existentes funcionan sin cambios.
- Multilingüe: limitado al inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no descritas en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y responde a preguntas como "¿pide un reembolso?" o "¿qué equipo debe gestionarlo?" con distribuciones calibradas, lo que permite dirigir el caso a facturación, envíos o soporte técnico según el umbral de confianza configurado.
- Moderación de contenido con umbrales: clasificación de documentos o mensajes en categorías de riesgo mediante escalas ordenadas, aprovechando la calibración (ECE bajo) para fijar políticas de revisión humana cuando la confianza cae por debajo de un umbral.
- Extracción de decisiones en pipelines documentales: procesamiento de facturas, contratos o formularios en JSON para decidir si requieren aprobación, revisión o rechazo, con la ventaja de que el modelo ignora instrucciones maliciosas embebidas en el documento.
- Triaje de urgencia en atención al cliente: uso de la escala ordenada (low/normal/urgent) para priorizar colas de trabajo, con la latencia conocida (~10 s por pregunta en GPU de Mac, ~19 s en CPU) como dato para dimensionar el throughput.
- Automatización de encuestas y anotación: clasificación semiautomática de respuestas abiertas en categorías predefinidas, con distribuciones de probabilidad que permiten medir el acuerdo entre anotadores y detectar casos ambiguos.
- Sustitución de clasificadores supervisados en dominios con pocos datos etiquetados: al formular las etiquetas como preguntas en lenguaje natural, se evita entrenar un modelo específico por tarea, y la API compatible con Jev permite migrar clientes existentes apuntando el SDK a `decido serve`.
- Verificación de cumplimiento en flujos internos: comprobación de si un documento cumple condiciones (por ejemplo, "¿incluye cláusula de cancelación?") con respuesta sí/no y probabilidad asociada, integrable vía HTTP en sistemas de gestión documental.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los seis grupos de benchmarks de la comunidad Jev-reproduction (JevBench, Kev, OpenJev con 18 tareas, Nimble, VitaminC y MASSIVE-en; copias congeladas y mismo harness para todos los modelos). Puntuación = métrica tipo accuracy por grupo, luego media.

| Grupo de benchmark | Decido-1-Think (GPU) | Decido-1 (GPU) | Jev 1.13 (publicado) |
|---|---:|---:|---:|
| JevBench | 94,33 | 88,17 | 87,18 |
| Kev | 85,63 | 84,46 | 85,52 |
| OpenJev (18 tareas) | 83,63 | 78,39 | 72,96 |
| Nimble | 92,55 | 88,65 | 91,84 |
| VitaminC | 86,98 | 87,15 | 78,46 |
| MASSIVE | 89,14 | 88,57 | 87,14 |
| **Media de los seis grupos** | **88,71** | **85,90** | **83,85** |

Calibración (GPU; marca de verificación = igual o mejor que Jev):

| Comprobación | Brier | Jev 1.13 | ECE | Jev 1.13 |
|---|---:|---:|---:|---:|
| JevBench | 0,098 | 0,181 | 0,031 | 0,032 |
| Kev v4 dev | 0,207 | 0,211 | 0,052 | 0,049 |
| Kev v9 dev | 0,223 | 0,212 | 0,042 | 0,034 |
| VitaminC | 0,205 | 0,313 | 0,037 | 0,104 |
| MASSIVE | 0,167 | 0,204 | 0,053 | 0,075 |

Brier igual o mejor que Jev en 4 de 5 comprobaciones; ECE igual o mejor en 3 de 5. La tasa de inversión de orden de opciones es del 4,3 % agrupada, frente al 14,6 % de Jev. No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 25.800 millones de parámetros, en FP16 se requieren aproximadamente 52 GB de pesos; en cuantizaciones GGUF de 4 bits, alrededor de 15-16 GB, aunque estas cifras son estimaciones a partir del tamaño y no datos publicados.
- GPU recomendadas: la model card cita GPUs de Mac (Apple Silicon) y una GPU genérica; Decido-1-XL, de la misma familia, requiere 4× A100 80 GB, pero para Think no se especifica el hardware de referencia.
- CPU: la familia indica que Decido-1 corre en CPU de portátil con ~30 GB de RAM; para Think la model card indica "laptop (slow)" y GPU.
- Latencia publicada (M4 Pro, documento de 1.000 tokens y 5 preguntas): ~19 s por pregunta en CPU y ~10 s por pregunta en GPU de Mac.
- Despliegue: paquete `decido-ai` (pip, binarios para macOS Apple Silicon y Linux x86_64), servidor HTTP con `decido serve` (API compatible con Jev, `POST /v1/systemone`) y pesos GGUF para llama.cpp.
- vLLM, TGI u Ollama: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Puntuación seis grupos | Latencia (M4 Pro, CPU · GPU) | Licencia |
|---|---|---|---:|---|---|
| Decido-1-Think (este) | Gemma-4-26B-A4B | 25,8 B totales / ~4 B activos | 88,71 (GPU) | ~19 s · ~10 s por pregunta | Apache-2.0 |
| Decido-1 | Gemma-4-26B-A4B | 25,8 B totales / ~4 B activos | 85,90 (GPU) | 4,1 s · 1,1 s | Apache-2.0 |
| Decido-1-Max | Gemma-4-26B-A4B | 25,8 B totales / ~4 B activos | 89,23 (GPU) | ~28 s · ~11 s por pregunta | Apache-2.0 |
| Decido-1-Fast | Qwen3-1.7B | 1,7 B | 73,01 (CPU) | 0,64 s · 0,30 s | no disponible |
| Jev 1.13 (referencia) | no disponible | no disponible | 83,85 (publicado) | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para tareas de decisión y clasificación; no es un generador de texto conversacional general.
- Idiomas: solo inglés según la model card; el rendimiento en castellano u otros idiomas no está documentado.
- Longitud de contexto: no disponible, lo que impide planificar documentos largos con garantías.
- Latencia elevada por el modo thinking: ~19 s por pregunta en CPU de M4 Pro y ~10 s en GPU de Mac para un documento de 1.000 tokens con 5 preguntas; puede ser inviable en flujos interactivos sin GPU dedicada.
- Riesgo de alucinación en las etiquetas: aunque la calibración es buena, las distribuciones de probabilidad deben tratarse como señales, no como certezas, y conviene fijar umbrales de revisión humana.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al heredar la base Gemma 4, arrastra los sesgos de sus datos de preentrenamiento, no auditados aquí.
- Licencia Apache-2.0: permite uso comercial, pero la model card no detalla obligaciones adicionales derivadas de la base Gemma 4 más allá de la licencia declarada.
- `inference: false` en la model card: la inferencia estándar de transformers no está soportada; es necesario usar el paquete `decido-ai` o llama.cpp con los pesos GGUF.
- La model card advierte de que el documento de entrada se trata como no fiable, pero no se especifica el alcance completo de la neutralización de inyecciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Documentación y playground: https://getdecido.ai
- Paquete Python: https://pypi.org/project/decido-ai/
- Colección Decido 1: https://huggingface.co/collections/decido-ai/decido-1-6aed66fd09af05c057795ca8
- Decido-1: https://huggingface.co/decido-ai/decido-1-26b-a4b
- Decido-1-Fast: https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Decido-1-Ultra: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Decido-1-Max: https://huggingface.co/decido-ai/decido-1-max-26b-a4b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
