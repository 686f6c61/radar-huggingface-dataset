# Dgamez202/Converse-1.3

## Resumen

Converse 1.3 es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct desarrollado por dgAI, una iniciativa independiente de desarrollo de IA. El modelo se presenta como el primer lanzamiento público de la serie Converse y está orientado a conversaciones de bajo coste computacional, según la etiqueta "Low-Cost-Conversations" del repositorio. Con 1.543.714.304 parámetros reales (1,54B), se posiciona en la gama de modelos pequenos aptos para inferencia local.

Arquitectónicamente es un transformer denso heredado de Qwen2.5-1.5B-Instruct, con una ventana de contexto declarada de 32.768 tokens. El ajuste se realizó mediante LoRA (rank 16, alpha 16, dropout 0) sobre el framework Unsloth con carga en 4 bits, aplicando los adaptadores a las proyecciones de atención y MLP. La longitud máxima de secuencia durante el entrenamiento fue de 2.048 tokens, muy por debajo del contexto nominal del modelo base.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un fine-tune comunitario de bajo perfil (260 descargas, 1 like en el momento de la consulta) que ejemplifica el flujo típico de adaptación de un modelo base pequeno con herramientas de bajo coste. No se documentan datos de entrenamiento, benchmarks ni detalles del dataset utilizado, lo que restringe seriamente cualquier evaluación de su calidad frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (nominal); entrenamiento a 2.048 tokens |
| Tipos de cuantizacion | GGUF (variantes no especificadas en la model card) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (distribucion declarada); safetensors presentes en el repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer denso con atención estándar y sin mezcla de expertos. Sobre esta base se aplicó un ajuste fino con LoRA de rango 16 y alpha 16, sin dropout, dirigido a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó con Unsloth, cargando el modelo base en 4 bits y con gradient checkpointing, lo que apunta a un proceso de bajo coste ejecutable en hardware de consumo.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO posteriores al ajuste supervisado. Tampoco se documenta la tasa de aprendizaje, el número de épocas ni el tamaño del conjunto de datos. La longitud máxima de secuencia durante el entrenamiento (2.048 tokens) es notablemente inferior al contexto nominal de 32.768 tokens, lo que sugiere que el modelo puede degradarse en tareas que requieran contextos largos pese a la especificación declarada.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, con la calidad esperable de un modelo de 1,5B parámetros.
- Generación de código y matemáticas a nivel elemental, limitada por el tamaño del modelo.
- Soporte de tool calling y function calling heredado del modelo base (no verificado en el fine-tune).
- Capacidades multilingües del modelo base potencialmente presentes, aunque la model card solo declara inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistentes conversacionales locales de bajo coste: el modelo puede desplegarse en equipos de consumo para gestionar diálogos multi-turno simples, aprovechando su tamaño de 1,54B parámetros y su formato GGUF.
- Prototipado rápido de chatbots: útil para validar flujos de conversación antes de migrar a modelos mayores, dado su bajo requisito de hardware.
- Generación de respuestas en aplicaciones embebidas: su reducido tamaño permite integrarlo en dispositivos con recursos limitados donde un modelo de 7B o superior no cabría.
- Filtrado y clasificación de texto conversacional: puede emplearse para tareas de etiquetado simple o enrutamiento de consultas en pipelines de atención al cliente.
- Educación y experimentación: sirve como banco de pruebas para estudiar el efecto del ajuste LoRA sobre un modelo base conocido.
- Generación de código en entornos con restricciones de memoria: adecuado para autocompletado básico o sugerencias en editores ligeros, aunque con calidad limitada frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización 4 bits (GGUF Q4): aproximadamente 1 GB para pesos, con margen adicional para contexto.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para cuantizaciones agresivas; RTX 3060, RTX 4060 o superiores para FP16 sin problemas.
- Cabe en GPU de consumo: sí, en tarjetas con 4-8 GB de VRAM según cuantización; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; vLLM y TGI requerirían conversión a safetensors (presentes en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Converse 1.3 | 1,54B | 32.768 | Apache 2.0 | GGUF / safetensors | Fine-tune LoRA de Qwen2.5-1.5B-Instruct |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo base original, con benchmarks publicados |
| Llama 3.2 1B Instruct | 1,24B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Contexto mayor, licencia más restrictiva |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 | Apache 2.0 | safetensors, GGUF | Alternativa pequena con benchmarks publicados |

## Limitaciones y advertencias

- No se documentan datos de entrenamiento, dataset ni proceso de alineación, lo que impide evaluar sesgos introducidos por el fine-tune.
- Riesgo de alucinación inherente a un modelo de 1,5B parámetros, potencialmente agravado por la falta de información sobre el ajuste.
- El contexto nominal es de 32.768 tokens, pero el entrenamiento se realizó a 2.048 tokens; el rendimiento en contextos largos puede degradarse.
- Idioma declarado: solo inglés; el soporte multilingüe del modelo base no está garantizado tras el fine-tune.
- Licencia Apache 2.0, lo que permite uso comercial, pero debe respetarse la atribución del modelo base Qwen2.5-1.5B-Instruct.
- La model card menciona distribución en GGUF, pero el repositorio también contiene safetensors; conviene verificar qué variantes están realmente disponibles.
- Proyecto de bajo perfil (260 descargas, 1 like) sin benchmarks ni validación externa; no recomendable para producción sin evaluación propia.
- El enlace a GitHub indicado en la model card apunta a un repositorio que debe verificarse antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/Dgamez202/Converse-1.3
- Repositorio GitHub (según model card): https://github.com/scriptsnsenses-sys/dgAI/tree/main/Models/Converse/Converse%201.3
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
