# enriquefbrt/arca-tools-sft-lora

## Resumen

arca-tools-sft-lora es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario enriquefbrt sobre el modelo base Qwen/Qwen3-1.7B. Se trata, por tanto, de un fine-tuning paramétricamente eficiente que no redistribuye pesos completos, sino únicamente las matrices de bajo rango del adaptador (el repositorio ocupa 0,1 GB). El nombre del modelo en la model card es sft_nothink, lo que sugiere un entrenamiento orientado a respuestas directas sin modo de razonamiento extendido, y el identificador del repositorio (arca-tools) apunta a un ajuste centrado en uso de herramientas. El modelo se ha entrenado con TRL 1.13.0 y PEFT 0.20.0 sobre Transformers 5.17.0.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva (la del autor es la plantilla automática de TRL), sin licencia declarada y sin idiomas declarados. No hay información publicada sobre dataset de entrenamiento, hiperparámetros, número de tokens vistos ni evaluación. Cualquier uso en producción exige validación propia.

El interés técnico reside en el modelo base: Qwen3-1.7B es un transformer denso de 1.700 millones de parámetros de la familia Qwen3, con soporte de contexto largo y capacidades multilingües. El adaptador hereda esas capacidades y las especializa, presumiblemente, hacia el uso de herramientas, aunque no se aporta evidencia cuantitativa de ello.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3-1.7B |
| Parametros totales | No disponible para el adaptador; modelo base: 1.700 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Framework de entrenamiento | TRL 1.13.0, PEFT 0.20.0, Transformers 5.17.0, PyTorch 2.11.0+cu128 |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del modelo base Qwen3-1.7B: un transformer decoder-only denso con atención por causalidad estándar, sin mezcla de expertos. El adaptador introduce matrices de bajo rango en las capas del transformer, entrenables mientras el resto de pesos permanece congelado; en inferencia se puede fusionar con el base o aplicarse dinámicamente mediante PEFT.

El entrenamiento se realizó con SFT (supervised fine-tuning) usando TRL. La model card no especifica el dataset, el número de ejemplos, la composición de datos, la longitud de secuencia, el rango LoRA, el alpha, el learning rate ni si hubo etapas posteriores de preferencia (DPO/RLHF). El sufijo "nothink" del nombre sugiere que los datos de entrenamiento excluyen trazas de razonamiento del modo thinking de Qwen3, pero esto es una inferencia a partir del nombre, no un dato documentado. No se declara ninguna innovación técnica adicional.

## Capacidades

- Generación de texto conversacional en formato chat (la model card muestra un ejemplo con lista de mensajes con rol user).
- Uso de herramientas (tool calling / function calling): el identificador del repositorio (arca-tools) y el pipeline de SFT apuntan a este objetivo, aunque no se documenta el esquema de herramientas ni el formato esperado.
- Razonamiento multi-turno: heredado del modelo base, sujeto a la ventana de contexto de Qwen3-1.7B.
- Capacidades multilingües: presumiblemente heredadas del base Qwen3, pero no declaradas en la ficha del adaptador.
- Modo sin razonamiento explícito ("nothink"): el adaptador está entrenado para responder directamente, sin cadena de pensamiento visible.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Prototipado de agentes con tool calling: el adaptador se puede cargar sobre Qwen3-1.7B con PEFT y usarse para experimentar con llamadas a funciones en entornos de desarrollo, dado su bajo coste de despliegue (1,7B de parámetros).
- Sustitución de un LLM grande en tareas acotadas de extracción estructurada: si el ajuste SFT ha especializado al modelo en un esquema de herramientas concreto, se puede desplegar en local para tareas de enrutamiento o parsing con latencia baja.
- Investigación sobre fine-tuning eficiente: sirve como ejemplo reproducible de un pipeline TRL + PEFT sobre Qwen3, útil para comparar configuraciones de LoRA.
- Evaluación de la degradación por especialización: permite estudiar cuánto pierde un modelo pequeño al ajustarlo a una tarea concreta frente al base sin ajustar.
- Despliegue en hardware de consumo para demos: con 1,7B de parámetros, el modelo fusionado cabe en GPUs de gama media y puede servirse con llama.cpp u Ollama tras convertir los pesos.
- Base para iteraciones posteriores: al ser un adaptador ligero, se puede continuar el entrenamiento con más datos de herramientas o combinar con otras técnicas (DPO) sin reentrenar el base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; el requisito real lo determina el modelo base Qwen3-1.7B.
- VRAM estimada para el base en fp16: aproximadamente 3,4 GB solo de pesos, más overhead de activaciones y KV cache (del orden de 4-6 GB en total según longitud de contexto y batch).
- VRAM estimada en cuantización de 8 bits: en torno a 2 GB de pesos; en 4 bits, en torno a 1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060/4060, RTX 4090); A100/H100 no son necesarias y estarían infrautilizadas.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en fp16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM (con soporte de LoRA), llama.cpp/Ollama (tras fusionar el adaptador y convertir a GGUF), TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| arca-tools-sft-lora (este) | 1,7B (base) + LoRA | No disponible | No disponible | safetensors (adaptador) | SFT sobre Qwen3-1.7B, sin evaluación publicada |
| Qwen/Qwen3-1.7B (base) | 1,7B | No disponible en esta ficha | No disponible en esta ficha | safetensors | Modelo base sin especializar; referencia para medir la ganancia del adaptador |
| Otros adaptadores LoRA sobre Qwen3-1.7B | 1,7B (base) + LoRA | Depende del base | Variable | safetensors | No se dispone de datos comparativos verificables en la informacion proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas; no hay benchmarks publicados del adaptador ni del base en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni métricas de pérdida, ni validación documentada; el rendimiento real es desconocido.
- Licencia no declarada: no se puede asumir uso comercial permitido. La licencia del adaptador podría estar sujeta además a la del modelo base Qwen3-1.7B, que debe verificarse por separado.
- Model card generada automáticamente: el README es la plantilla de TRL; no documenta dataset, hiperparámetros ni formato de herramientas, lo que dificulta la reproducibilidad.
- Riesgo de alucinación: inherente a un modelo de 1,7B, especialmente en tool calling, donde una llamada mal formada puede romper un pipeline.
- Idiomas no declarados: no hay garantía de calidad fuera de los idiomas cubiertos por el base.
- Sesgos: no documentados; se heredan los del corpus de preentrenamiento del modelo base.
- Contexto: la ventana efectiva depende de Qwen3-1.7B y del entrenamiento SFT; no se especifica la longitud máxima usada durante el ajuste, por lo que secuencias largas pueden degradar el comportamiento.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento.
- El nombre "arca-tools" sugiere un esquema de herramientas propio que no está documentado; usarlo sin inspeccionar los datos de entrenamiento es arriesgado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/enriquefbrt/arca-tools-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- PEFT (librería del adaptador): https://github.com/huggingface/peft
