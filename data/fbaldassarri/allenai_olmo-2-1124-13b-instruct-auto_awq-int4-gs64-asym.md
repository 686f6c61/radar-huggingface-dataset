# fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_awq-int4-gs64-asym

## Resumen

Esta ficha describe una versión cuantizada del modelo OLMo-2-1124-13B-Instruct, desarrollado originalmente por el Allen Institute for AI (AI2) y publicado en noviembre de 2024. La cuantización la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.16.1, aplicando una cuantización de solo pesos (WoQ) en INT4 con grupo de tamaño 64 y esquema asimétrico, siguiendo el algoritmo AWQ. El objetivo es reducir el peso del modelo de los ~26 GB en bfloat16 a un tamaño manejable en CPU, iGPU Intel Arc y NPU Intel (Core Ultra), manteniendo un comportamiento conversacional razonable.

OLMo-2 es la segunda generación de la familia de modelos totalmente abiertos de AI2: pesos, datos de entrenamiento, código y recetas están publicados. El modelo base es un transformer decoder-only de 13B parámetros con una ventana de contexto nativa de 4096 tokens, entrenado sobre trillions de tokens y afinado con instrucciones para uso conversacional. Esta variante cuantizada conserva la licencia Apache 2.0 del original y está pensada para despliegue en hardware Intel con intel-extension-for-pytorch u OpenVINO.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa práctica para ejecutar OLMo-2 13B en entornos sin GPU NVIDIA de gama alta; por otro, advierte de que el repositorio declara un número de parámetros en safetensors (2.837.427.200) que no coincide con el tamaño nominal del modelo base (13B), lo que conviene verificar antes de usarlo en producción. Además, la model card marca `inference: false`, señal de que el artefacto no está validado para inferencia directa con transformers sin revisión previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), familia OLMo 2 |
| Parametros totales | 13B nominales (modelo base); el repo declara 2.837.427.200 en safetensors (discrepancia no aclarada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (modelo base OLMo-2-1124-13B-Instruct) |
| Tipos de cuantizacion | INT4, group size 64, asimetrica, WoQ (AWQ via Intel AutoRound) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 11.0 GB), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base OLMo-2-1124-13B-Instruct es un transformer decoder-only de 13B parámetros con atención causal estándar, entrenado por AI2 sobre un corpus abierto (Dolma) de varios trillions de tokens, seguido de un proceso de instrucción tuning y preferencia (DPO/SFT) para alinearlo como asistente conversacional. La versión 1124 corresponde al checkpoint de noviembre de 2024. La model card de esta ficha no aporta detalles adicionales sobre la composición exacta del dataset ni sobre las etapas de RLHF; esa información está en la documentación del modelo original.

La aportación de este repositorio es exclusivamente la cuantización. Se ha aplicado Intel AutoRound 0.16.1 con el algoritmo AWQ en modo solo pesos: 4 bits, grupo de 64, asimétrico. La calibración se hizo en CPU con 64 muestras, 200 iteraciones, secuencia de 256 tokens y batch de 2, partiendo de pesos en bfloat16. El proceso completo tardó 22.937 segundos (unas 6,4 horas). El resultado se exporta en formato `auto_awq` para su carga con transformers y su ejecución en CPU, iGPU Intel Arc o NPU Intel mediante intel-extension-for-pytorch u OpenVINO. El autor declara una aceleración de 2-3x con una ligera pérdida de precisión respecto al modelo en bfloat16.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat integrada (`apply_chat_template`).
- Razonamiento de propósito general y respuesta a instrucciones, heredado del Instruct original.
- Generación de código y resolución de problemas matemáticos básicos a moderados (capacidad del modelo base, no medida en esta cuantización).
- Soporte de conversaciones multi-turno dentro de la ventana de 4096 tokens.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- Capacidad multilingüe limitada: la model card declara únicamente inglés.

## Casos de uso

- Asistente conversacional en local para equipos con portátiles Intel Core Ultra: el modelo cuantizado a INT4 puede ejecutarse en NPU (AI Boost) vía OpenVINO, permitiendo un chatbot privado sin enviar datos a la nube y con un consumo energético bajo.
- Despliegue en servidores sin GPU NVIDIA: al estar pensado para CPU Intel con intel-extension-for-pytorch, encaja en infraestructura de virtualización estándar donde no hay aceleradores dedicados.
- Prototipado de aplicaciones de chat en iGPU Intel Arc: la cuantización permite cargar el modelo en memoria unificada de equipos como Core Ultra 185H, útil para demos y pruebas de concepto.
- Generación de texto y resumen de documentos en inglés: con 4096 tokens de contexto se pueden procesar artículos, correos o informes de longitud media en una sola pasada.
- Fine-tuning ligero o evaluación comparativa de cuantizaciones: el repositorio incluye la receta completa de reproducción (auto-round-pipeline), lo que lo hace útil como referencia para investigar el impacto de AWQ INT4 en modelos de 13B.
- Educación e investigación en IA abierta: al derivar de OLMo-2, cuyos datos y código son públicos, sirve para estudiar el efecto de la cuantización sobre un modelo totalmente auditable.
- Sustitución de modelos propietarios en entornos con requisitos de licencia permisiva: Apache 2.0 permite uso comercial sin restricciones de atribución más allá de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica una aceleración de 2-3x y una "ligera caída de precisión" en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con el modelo en bfloat16.

## Requisitos de hardware

- VRAM/RAM estimada: el repo ocupa 11.0 GB en disco; en INT4 el modelo requiere del orden de 8-10 GB de memoria para pesos, más overhead de activaciones y caché KV. La cifra exacta no está publicada.
- GPU recomendadas: no se documentan GPU NVIDIA específicas; el artefacto está orientado a CPU Intel, iGPU Intel Arc (por ejemplo, Core Ultra 185H) y NPU Intel (AI Boost en Core Ultra).
- ¿Cabe en GPU de consumo? No hay datos publicados para RTX 4090 u otras GPU de consumo; dado el tamaño INT4, en teoría cabría en GPUs con 12-16 GB de VRAM, pero el autor no lo valida.
- Opciones de despliegue: transformers con `device_map="auto"`, intel-extension-for-pytorch (CPU/iGPU), OpenVINO (NPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se declara una mejora de 2-3x frente a la versión sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| fbaldassarri/OLMo-2-1124-13B-Instruct-auto_awq-int4-gs64-asym | 13B (nominal) | 4096 | INT4 AWQ gs64 asim | Apache 2.0 | Orientado a CPU/iGPU/NPU Intel; `inference: false` |
| allenai/OLMo-2-1124-13B-Instruct | 13B | 4096 | bfloat16 | Apache 2.0 | Modelo original, referencia de calidad |
| Mistral-7B-Instruct (cuantizado) | 7B | 8192-32768 segun version | INT4/GGUF | Apache 2.0 | Menor tamaño, contexto mayor, ecosistema de cuantizaciones mas maduro |
| Llama-3.1-8B-Instruct (cuantizado) | 8B | 131072 | INT4/GGUF | Llama 3.1 Community License | Contexto muy superior, licencia con restricciones |

La comparación con Mistral y Llama es orientativa por categoría (modelos instruct de tamaño medio); no se dispone de benchmarks de esta cuantización que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Discrepancia de parámetros: el repo declara 2.837.427.200 parámetros en safetensors frente a los 13B del modelo base. Es un dato anómalo que debe verificarse antes de usar el artefacto; podría indicar un fallo en el proceso de cuantización o en los metadatos.
- La model card marca `inference: false`, lo que sugiere que el autor no garantiza que el modelo funcione correctamente para inferencia directa.
- Cuantización INT4 con grupo 64: se espera una pérdida de calidad respecto al bfloat16, no cuantificada en la documentación.
- Solo inglés: no hay soporte multilingüe declarado.
- Contexto limitado a 4096 tokens, inferior al de alternativas contemporáneas como Llama 3.1 (128k) o Mistral (32k en algunas versiones).
- Riesgo de alucinación inherente a los modelos de lenguaje de 13B; no se documentan mitigaciones específicas.
- Sesgos: no se documenta ninguna evaluación de sesgos en esta cuantización; los sesgos del modelo base no están caracterizados en la model card.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor declara que el modelo se ha desarrollado "solo con fines de investigación" y sin garantía.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.
- La receta de reproducción apunta a un repositorio Git alojado en `git.epicdynamic.com`, un dominio no estándar que conviene verificar antes de ejecutar los scripts.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_awq-int4-gs64-asym
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-13B-Instruct
- Intel AutoRound (framework de cuantización): https://github.com/intel/auto-round
- Receta de reproducción (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
