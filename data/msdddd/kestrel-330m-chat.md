# MSDDDD/Kestrel-330M-Chat

## Resumen

Kestrel-330M-Chat es la variante afinada para conversación de Kestrel-330M, un modelo de lenguaje de 335.973.376 parámetros entrenado desde cero por un único desarrollador (MSDDDD) sobre una sola GPU y con un corpus de 6.000 millones de tokens. Se distribuye bajo licencia Apache-2.0 y está pensado como banco de pruebas para investigación y experimentación en modelos de lenguaje de escala reducida.

El modelo parte de una arquitectura tipo transformer con nomenclatura Qwen3 (etiqueta `qwen3` en Hugging Face) e incorpora un logit soft-cap final que requiere cargar el modelo con `trust_remote_code=True`. El ajuste conversacional se realizó mediante una época de supervisión (SFT) sobre el dataset smol-smoltalk, unos 298 millones de tokens, calculando la pérdida únicamente sobre los turnos del asistente.

Su relevancia es doble: por un lado, demuestra que es posible entrenar y afinar un modelo funcional desde cero con recursos muy limitados; por otro, sirve como referencia para estudiar el comportamiento de modelos pequeños en tareas conversacionales, donde las limitaciones de razonamiento y factualidad son especialmente visibles. Solo soporta inglés y no ha recibido entrenamiento con RLHF ni DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con logit soft-cap final (etiqueta `qwen3`, requiere `trust_remote_code=True`) |
| Parametros totales | 335.973.376 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 1,4 GB) |

## Arquitectura y entrenamiento

Kestrel-330M es un transformer decoder-only denso de 336 millones de parámetros entrenado desde cero sobre 6.000 millones de tokens, según indica el autor, en una única GPU. El modelo base se entrenó con un logit soft-cap final, un mecanismo que acota la magnitud de los logits antes de la softmax y que obliga a usar código personalizado (`trust_remote_code=True`) para cargarlo correctamente en `transformers`.

El ajuste conversacional consistió en una época de SFT sobre HuggingFaceTB/smol-smoltalk, aproximadamente 298 millones de tokens, con el optimizador AdamW a una tasa de aprendizaje de 1e-4 y un scheduler coseno. La pérdida se calculó solo sobre los turnos del asistente, lo que concentra el aprendizaje en las respuestas. Posteriormente se realizó una segunda pasada breve para fijar la identidad del modelo (se presenta como Kestrel, un modelo de lenguaje creado por un desarrollador independiente). No se aplicó RLHF ni DPO, ni tampoco entrenamiento de seguridad. El formato de chat es texto plano con el patrón `User: ... / Assistant: ... <|endoftext|>`, generado automáticamente por la plantilla incluida.

## Capacidades

- Generación de texto conversacional en inglés con formato multi-turno mediante plantilla de chat.
- Respuestas a preguntas factuales sencillas (por ejemplo, capitales de países), aunque con fiabilidad limitada.
- Generación de código básico, como funciones cortas en Python (el autor muestra un ejemplo de inversión de cadenas).
- Explicaciones divulgativas breves de fenómenos físicos (el ejemplo de la model card cubre la dispersión de Rayleigh).
- Identidad propia: responde que se llama Kestrel y que fue creado por un desarrollador independiente.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre modelos pequeños: servir como base controlada para estudiar cómo escala la calidad conversacional con el tamaño y los datos, dado que el modelo está entrenado desde cero y su proceso está documentado.
- Experimentación con SFT: usar el modelo base y esta variante chat como pareja para analizar el efecto del ajuste supervisado sobre smol-smoltalk en un presupuesto de cómputo mínimo.
- Docencia y divulgación: ilustrar en un aula o taller el ciclo completo de entrenamiento (preentrenamiento, SFT, plantilla de chat) con un modelo que cabe en una sola GPU.
- Pruebas de infraestructura de despliegue: validar pipelines con `transformers` y TGI (el modelo declara compatibilidad con endpoints) en entornos de recursos limitados antes de escalar a modelos mayores.
- Generación de prototipos de chatbot en inglés: crear demos de conversación de bajo coste donde la exactitud factual no sea crítica, aceptando las advertencias del autor.
- Evaluación de riesgos y alucinación: emplearlo como caso de estudio para medir la tasa de invención de hechos en modelos de 300M parámetros sin alineamiento de seguridad.
- Pruebas de código trivial: generar fragmentos cortos de Python en entornos de test donde se revise manualmente la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3-1,4 GB solo para pesos, más overhead de activaciones y caché KV.
- En fp16/bf16: aproximadamente 0,7 GB para pesos, holgadamente dentro de cualquier GPU consumer moderna.
- En cuantización de 8 bits o 4 bits (si se generan pesos GGUF o se usa bitsandbytes): por debajo de 0,5 GB para pesos, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para fp32; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. También debería ejecutarse en CPU para pruebas.
- Despliegue: `transformers` con `trust_remote_code=True` es la vía documentada; el modelo declara compatibilidad con text-generation-inference (TGI). No se documentan integraciones con vLLM, llama.cpp u Ollama, y la ausencia de pesos GGUF oficiales limita el uso directo en llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera baja latencia en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Kestrel-330M-Chat | 335.973.376 | No disponible | Apache-2.0 | Inglés | Entrenado desde cero por un autor individual; SFT sobre smol-smoltalk; sin RLHF/DPO |
| SmolLM2-360M-Instruct (HuggingFaceTB) | ~360M | No disponible en esta ficha | Apache-2.0 | Inglés (principalmente) | Referencia habitual para modelos pequeños; datos de entrenamiento y benchmarks publicados por el autor original |
| Qwen2.5-0.5B-Instruct | ~500M | No disponible en esta ficha | Apache-2.0 | Multilingüe | Mayor tamaño y soporte multilingüe; familia con benchmarks publicados |
| TinyLlama-1.1B-Chat | ~1,1B | No disponible en esta ficha | Apache-2.0 | Inglés | Aproximadamente tres veces más parámetros; orientado a conversación |

La comparación se limita a parámetros, licencia e idioma porque no hay benchmarks publicados de Kestrel-330M-Chat que permitan contrastar rendimiento de forma rigurosa. Los datos de los modelos alternativos deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Alucinación factual elevada: el autor advierte que inventa hechos, nombres, fechas y lugares, incluso después de una respuesta correcta.
- Aritmética y razonamiento poco fiables: falla en sumas simples según la propia model card.
- Identidad inestable: más allá de su nombre, puede interpretar roles humanos (programador, padre, estudiante).
- Sin alineamiento de seguridad: no se aplicó RLHF ni DPO, por lo que puede generar contenido inapropiado, sesgado o soez.
- Deriva temática en respuestas largas.
- Solo inglés; sin soporte multilingüe documentado.
- Longitud de contexto no especificada, lo que dificulta planificar usos con ventanas largas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene auditar dicho código antes de usarlo en producción.
- Uso previsto exclusivamente para investigación y experimentación; el autor desaconseja emplearlo para consejos o decisiones importantes.
- La licencia Apache-2.0 cubre los pesos, pero los datos de entrenamiento tienen sus propias licencias, que deben respetarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MSDDDD/Kestrel-330M-Chat
- Modelo base: https://huggingface.co/MSDDDD/Kestrel-330M
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
