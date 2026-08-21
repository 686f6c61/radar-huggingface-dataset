# huyngv/lab21-2A202601635-qwen35-triage-vi

## Resumen

El modelo `huyngv/lab21-2A202601635-qwen35-triage-vi` es un adaptador LoRA de clasificación de tickets de atención al cliente en vietnamita, desarrollado como parte de un proyecto de laboratorio académico por Nguyen Van Huy. Se basa en el modelo `unsloth/Qwen3.5-4B` y está diseñado para transformar tickets de soporte en vietnamita en estructuras JSON con cuatro campos: intención, urgencia, producto y sentimiento.

El modelo resuelve el problema de la clasificación automática de tickets de soporte, un caso de uso habitual en sistemas de atención al cliente. Su relevancia radica en que demuestra cómo un adaptador LoRA de pequeño tamaño (32 millones de parámetros entrenables) puede lograr una precisión del 96,5% en una tarea de extracción de información estructurada, superando significativamente a la base sin ajuste fino. El adaptador se distribuye en formato PEFT y requiere el modelo base Qwen3.5-4B para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen3.5-4B (transformer) |
| Parametros totales | no disponible (adaptador: 32.464.896 entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max_length 256) |
| Tipos de cuantizacion | no disponible (se menciona QLoRA en experimentos) |
| Idiomas soportados | vietnamita (entrenado exclusivamente en vietnamita) |
| Licencia | no disponible |
| Formato de pesos | PEFT (safetensors) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un modelo transformer de la familia Qwen3.5. El entrenamiento se realizó con la librería PEFT y TRL, utilizando supervisión fina (SFT) con máscara de solo asistente. El dataset consta de 250 tickets de atención al cliente en vietnamita, divididos en 225 para entrenamiento y 25 para validación (semilla 42, proporción 90/10). Se entrenó durante 2 épocas con 30 pasos y un tamaño de lote efectivo de 16.

El adaptador se colocó en las capas text-linear con rango r=16 y learning rate 1e-4. Se utilizó `max_length=256` tras medir que la longitud de tokens en el dataset tenía una media de 93,1 y un percentil 95 de 98, lo que permitió reducir el padding y optimizar el uso de VRAM. El chat template de Qwen3.5 conserva el bloque de razonamiento, pero la generación se realiza con `enable_thinking=False` para obtener respuestas JSON directas.

## Capacidades

- Clasificación de tickets de atención al cliente en vietnamita en cuatro campos: intención, urgencia, producto y sentimiento.
- Generación de salidas JSON estructuradas y válidas (formato 100% correcto tras el ajuste fino).
- Extracción de información de textos cortos (tickets de soporte) con alta precisión.
- Inferencia de baja latencia: aproximadamente 1,4 segundos por muestra en GPU Tesla T4.
- Soporte de razonamiento preservado en el chat template, aunque desactivado durante la generación para tareas de clasificación.
- Capacidad de adaptación a dominios específicos mediante ajuste fino con pocos datos (225 ejemplos).

## Casos de uso

- **Sistema de triaje de tickets de soporte**: el modelo clasifica automáticamente cada ticket entrante en intención (devolución, reclamación, consulta, etc.), urgencia (alta, media, baja), producto afectado y sentimiento del cliente, permitiendo enrutar los tickets al equipo adecuado de forma inmediata.
- **Priorización de respuestas de atención al cliente**: al detectar la urgencia y el sentimiento, el sistema puede priorizar los tickets con sentimiento negativo y urgencia alta, reduciendo el tiempo de respuesta en casos críticos.
- **Análisis de sentimiento en feedback de clientes**: el campo de sentimiento permite agregar métricas de satisfacción por producto o por canal, facilitando la detección de problemas recurrentes.
- **Automatización de respuestas iniciales**: combinado con un sistema de plantillas, el modelo puede generar respuestas preliminares basadas en la intención detectada, reduciendo la carga de los agentes humanos.
- **Generación de informes de calidad de servicio**: los campos estructurados permiten generar dashboards y reportes automáticos sobre los tipos de incidencias, productos más afectados y tendencias de sentimiento.
- **Integración en pipelines de soporte multicanal**: el modelo puede desplegarse como servicio de clasificación en sistemas de ticketing (Zendesk, Freshdesk) o chatbots, procesando tickets de email, chat o redes sociales.

## Benchmarks y rendimiento

El modelo card del autor incluye resultados de evaluación en el conjunto de validación (25 muestras):

| Configuracion | Target | Format | Latencia (ms) |
|---|---|---|---|
| Base + prompt naive | 0.000 | 0.000 | 3149.3 |
| Base + prompt optimizado | 0.765 | 1.000 | 996.9 |
| LoRA fine-tune (correct) | 0.965 | 1.000 | 1447.7 |
| LoRA attn_only (r=283) | 0.970 | no disponible | 793.5 |
| LoRA wrong_lr (1e-5) | 0.000 | 0.000 | 922.4 |
| QLoRA | 0.940 | no disponible | 992.3 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-10 GB con el modelo base en FP16 (4B parametros) mas el adaptador LoRA.
- GPU recomendadas: Tesla T4 16GB (utilizada en el entrenamiento), RTX 3060/3070/3080/3090, RTX 4060/4070/4080/4090, A10, A100.
- Cabe en GPUs de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 12GB, RTX 4060 8GB, etc.).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers y PEFT.
- Latencia estimada: 1,4 segundos por muestra en T4, aproximadamente 0,8 segundos en GPUs mas modernas.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Qwen3.5-4B (base) | 4B | no disponible | Apache 2.0 (Qwen) | Modelo generalista |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 Community | Modelo generalista |
| Phi-3.5-mini | 3.8B | 128K | MIT | Razonamiento y codigo |

Este adaptador no es directamente comparable con modelos generalistas, ya que es un adaptador especializado en una tarea concreta. Su comparativa natural seria con otros adaptadores LoRA para clasificacion de tickets, de los que no se dispone de datos publicos.

## Limitaciones y advertencias

- Entrenado exclusivamente con 250 tickets en vietnamita: puede no generalizar bien a otros dominios, idiomas o formatos de tickets.
- El dataset es muy pequeno (225 muestras de entrenamiento), lo que puede provocar sobreajuste a los patrones especificos de los tickets de ejemplo.
- No se ha evaluado el modelo en tareas fuera de la clasificacion de tickets; no es adecuado para generacion de texto general o conversacion.
- La licencia no esta especificada en la model card; se debe contactar con el autor antes de cualquier uso comercial.
- El modelo base Qwen3.5-4B puede tener sesgos y limitaciones propias; el adaptador no los corrige.
- La latencia de 1,4 segundos por muestra puede ser excesiva para aplicaciones en tiempo real sin optimizacion adicional (cuantizacion, batching, etc.).
- No se han realizado pruebas de robustez frente a entradas adversariales o tickets con errores ortograficos graves.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huyngv/lab21-2A202601635-qwen35-triage-vi
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Repositorio de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
