# ronnief1/RetGrounder

## Resumen

RetGrounder es un modelo vision-lenguaje multimodal de 8 767 millones de parámetros, desarrollado por Ronald Fecso (usuario `ronnief1`) y presentado junto con el benchmark RetinaGroundBench. Se trata de un ajuste fino mediante LoRA de Qwen/Qwen3-VL-8B-Instruct, orientado específicamente al *visual grounding* de biomarcadores en imágenes de tomografía de coherencia óptica (OCT) retiniana. El modelo resuelve dos tareas: localización de biomarcadores mediante cajas delimitadoras y VQA de presencia sobre cortes B de OCT.

Su relevancia radica en que demuestra que un modelo de 8B especializado puede superar en la tarea de grounding a modelos de propósito general significativamente mayores. En RetinaGroundBench alcanza un F1 macro del 33,9 %, un 43 % relativo por encima del mejor modelo general evaluado (InternVL3.5-30B-A3B, F1 23,7 %). El modelo se distribuye con licencia Apache-2.0 y pesos en safetensors, y está pensado para investigación en oftalmología asistida por IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL), ajuste fino LoRA fusionado en los pesos base |
| Parametros totales | 8 767 123 696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RetGrounder parte de Qwen/Qwen3-VL-8B-Instruct, un modelo vision-lenguaje de arquitectura transformer con codificador visual y decodificador de lenguaje. Sobre esa base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) utilizando una estrategia específica para OCT que integra supervisión de grounding (cajas delimitadoras) y supervisión textual de forma conjunta. Posteriormente, los adaptadores LoRA se fusionaron en los pesos base, de modo que el modelo distribuido es un checkpoint completo y no requiere cargar adaptadores adicionales.

Los datos de entrenamiento provienen del benchmark RetinaGroundBench, construido a partir de los conjuntos públicos OCTDL y OLIVES. El benchmark cubre 13 clases de biomarcadores. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La innovación técnica destacable es el enfoque de entrenamiento que combina grounding y supervisión textual específicamente para imágenes OCT, junto con la definición de un protocolo de evaluación (AggIoU con umbrales t₁=0,1 y t₂=0,3) adaptado a la tarea.

## Capacidades

- Visual grounding de biomarcadores en cortes B de OCT retiniana: genera cajas delimitadoras en formato JSON para categorías especificadas en el prompt (por ejemplo, fluido intrarretiniano o drusen).
- VQA de presencia: responde sobre la presencia o ausencia de biomarcadores en la imagen.
- Coordenadas de salida en marco normalizado 0–1000, reescalables a píxeles con las dimensiones de la imagen.
- Generación de texto conversacional e instrucciones en formato chat (a través de `apply_chat_template`).
- Capacidades heredadas de Qwen3-VL-8B-Instruct (razonamiento multimodal general, seguimiento de instrucciones), aunque el ajuste fino está orientado a la tarea OCT.
- Soporte multilingüe limitado al inglés según la model card.
- No se documenta soporte de tool calling, function calling ni modos de agente multi-paso en la información disponible.

## Casos de uso

- Análisis asistido de OCT en investigación clínica: el modelo localiza biomarcadores como fluido intrarretiniano o drusen en cortes B, proporcionando cajas delimitadoras que pueden servir como preanotación para revisión por especialistas.
- Aceleración del etiquetado de datasets: integrado en un pipeline de anotación, genera propuestas de cajas que los oftalmólogos revisan y corrigen, reduciendo el coste de construir corpus de OCT a gran escala.
- Detección de presencia de biomarcadores en cribado: mediante VQA de presencia, permite clasificar cortes B según la existencia de hallazgos concretos antes de un análisis más profundo.
- Evaluación comparativa de modelos multimodales: sirve como referencia especializada en RetinaGroundBench para medir la brecha entre modelos generales y modelos de dominio en grounding médico.
- Investigación en visión-lenguaje médico: su enfoque de entrenamiento (grounding + supervisión textual) es reutilizable para adaptar otros modelos a tareas de localización en imagen médica.
- Prototipado de herramientas de apoyo al diagnóstico: desplegado en entornos de investigación con GPUs de gama alta, permite construir demostradores de asistencia a la lectura de OCT sin depender de modelos propietarios.

## Benchmarks y rendimiento

Resultados en RetinaGroundBench (13 clases de biomarcadores, AggIoU con t₁=0,1 y t₂=0,3):

| Modelo | F1 macro | AggIoU | Precision | Recall |
|---|---|---|---|---|
| RetGrounder (8B) | 33,9 % | 18,5 % | 48,0 % | 27,5 % |
| InternVL3.5-30B-A3B (mejor general evaluado) | 23,7 % | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 17,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) para BF16 con `device_map="auto"`.
- Cuantización a 8 bits o 4 bits (por ejemplo, bitsandbytes) permitiría reducir requisitos, aunque el autor no publica checkpoints cuantizados.
- Opciones de despliegue: la model card usa `transformers` con `Qwen3VLForConditionalGeneration` y `AutoProcessor`; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 en RetinaGroundBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetGrounder | 8,77 B | no disponible | 33,9 % | Apache-2.0 | Hugging Face |
| InternVL3.5-30B-A3B | 30 B (MoE, 3 B activos) | no disponible | 23,7 % | no disponible en la información | Hugging Face |
| Qwen3-VL-8B-Instruct (base) | 8 B aprox. | no disponible | no disponible | Apache-2.0 | Hugging Face |

La comparativa se limita a los datos publicados en la model card; no se dispone de resultados de otros modelos especializados en grounding de OCT en la información proporcionada.

## Limitaciones y advertencias

- El F1 macro del 33,9 % y el recall del 27,5 % indican una capacidad de detección todavía limitada: el modelo omite una proporción elevada de biomarcadores presentes.
- Es un modelo de investigación entrenado sobre OCTDL y OLIVES; su generalización a otros equipos, poblaciones o protocolos de adquisición no está validada.
- Riesgo de alucinación de cajas o de biomarcadores inexistentes, habitual en modelos generativos multimodales; no debe usarse como diagnóstico autónomo.
- Sesgos potenciales derivados de la distribución de los datasets de origen (población, equipamiento, prevalencia de patologías), no cuantificados en la información disponible.
- Soporte únicamente en inglés según la model card.
- Longitud de contexto no documentada, lo que dificulta planificar casos con múltiples imágenes o conversaciones largas.
- Aunque la licencia Apache-2.0 permite uso comercial, las anotaciones de RetinaGroundBench están bajo CC BY 4.0 y las imágenes subyacentes provienen de OCTDL y OLIVES, cuyos términos deben respetarse.
- No se documentan garantías de robustez ni validación regulatoria; cualquier uso clínico requeriría evaluación adicional y cumplimiento normativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronnief1/RetGrounder
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio del benchmark y código de evaluación: https://github.com/ronnief1/RetinaGroundBench
- Paper: https://arxiv.org/abs/2610.31205
