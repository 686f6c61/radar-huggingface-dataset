# gimmy256/adaption_neuro_movement_disorders_qa

## Resumen

`adaption_neuro_movement_disorders_qa` es un adaptador LoRA (PEFT) sobre el modelo base `meta-llama/Llama-3.2-3B-Instruct`, publicado por el usuario `gimmy256`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación de bajo rango que deben cargarse junto al modelo base para funcionar. Su propósito declarado es responder preguntas del dominio de los trastornos neurológicos del movimiento, tras un ajuste fino supervisado (SFT) sobre un conjunto de datos médico de 11.831 filas.

El adaptador fue entrenado con la herramienta AutoScientist de Adaption Labs, que automatiza la configuración de hiperparámetros y el entrenamiento. El resultado es un modelo especializado en un nicho clínico muy concreto, con licencia "other" (no estándar) y únicamente en inglés. Por su tamaño (3B parámetros en el base) y su naturaleza de adaptador, está pensado para despliegues ligeros y experimentación, no para uso clínico en producción sin validación adicional.

El interés de esta ficha es doble: por un lado, documenta un ejemplo típico de adaptador LoRA de dominio médico generado con una plataforma automatizada; por otro, sirve para ilustrar las limitaciones de este tipo de artefactos (sin benchmarks públicos, sin model card detallada, con licencia ambigua) que conviene conocer antes de evaluarlos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama 3.2 (modelo base: meta-llama/Llama-3.2-3B-Instruct) |
| Parámetros totales | 3B en el modelo base (el adaptador LoRA añade un número no especificado de parámetros; con r=16 y alpha=32 sobre todas las capas lineales, típicamente decenas de millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el base Llama 3.2 3B soporta 128K tokens, pero el adaptador no lo declara) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del base y del runtime) |
| Idiomas soportados | en (inglés) |
| Licencia | other (licencia no estándar, ver limitaciones) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only de 3.000 millones de parámetros con atención causal estándar y RoPE. El ajuste se realizó mediante SFT (supervised fine-tuning) con LoRA de rango 16, alpha 32, dropout 0, sobre todos los módulos lineales (`all-linear`). Los hiperparámetros declarados incluyen learning rate 1e-5, scheduler coseno con 0,5 ciclos, warmup ratio 0,1, weight decay 0, max grad norm 2 y una sola época. El dataset de entrenamiento consta de 11.831 filas en formato chat, con distribución de dominio 100% médica.

No se especifica el número de tokens de entrenamiento, la composición detallada del dataset (más allá de "neuro_movement_disorders_qa"), ni si hubo etapas de RLHF o DPO posteriores. Tampoco se documenta ninguna innovación técnica más allá del uso de AutoScientist para la selección automática de hiperparámetros. La model card incluye gráficos de métricas de entrenamiento y de win rates, pero los valores numéricos no se transcriben en el texto disponible.

## Capacidades

- Generación de texto en inglés sobre preguntas del dominio de trastornos neurológicos del movimiento.
- Respuesta a preguntas de tipo chat multi-turno (el formato de datos es `chat`).
- Especialización médica inducida por el adaptador: el modelo base conserva sus capacidades generales, pero el adaptador sesga las respuestas hacia el dominio clínico entrenado.
- Herencia de las capacidades del base Llama 3.2 3B Instruct: instrucciones, razonamiento básico, generación de código y matemáticas elementales (no reforzadas por el adaptador).
- Soporte de tool calling / function calling: no documentado en la información proporcionada (el base Llama 3.2 Instruct lo soporta, pero el adaptador no lo declara).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- **Asistencia documental a profesionales de neurología**: el adaptador puede responder preguntas frecuentes sobre trastornos del movimiento (parkinsonismos, temblores, distonías) usando el conocimiento inducido por el dataset de 11.831 filas. Adecuado para prototipos de consulta interna, no para diagnóstico.
- **Generación de material formativo**: creación de borradores de preguntas y respuestas para cursos de neurología, con revisión humana obligatoria por la naturaleza del dominio.
- **Chatbot de triaje informativo**: primera capa de respuestas informativas para pacientes o estudiantes, con derivación a especialista. El tamaño de 3B permite desplegarlo en hardware modesto.
- **Prototipado rápido de asistentes clínicos**: al ser un adaptador LoRA, se puede cargar y descargar sobre el base sin duplicar los 3B parámetros, lo que facilita experimentar con distintos adaptadores de dominio sobre el mismo base.
- **Investigación en adaptación de dominio médico**: sirve como caso de estudio de SFT con AutoScientist y de evaluación de adaptadores LoRA en dominios clínicos.
- **Integración en pipelines de generación aumentada (RAG)**: combinado con una base de conocimiento de neurología, el adaptador puede formular respuestas más alineadas con el registro clínico que el base sin ajustar.
- **Evaluación comparativa de adaptadores**: útil como referencia en estudios sobre especialización de modelos pequeños en nichos médicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona una evaluación sobre un conjunto de test held-out in-distribution y otro específico de dominio, con gráficos de win rates, pero los valores no se transcriben en el texto proporcionado.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el adaptador en sí ocupa ~0,1 GB (tamaño del repo). El modelo base en fp16 requiere ~6 GB de VRAM; en 8 bits ~3 GB; en 4 bits ~2 GB.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4070, RTX 4090 para fp16; A100/H100 solo si se necesita throughput alto o batch grande.
- **Consumer GPU**: sí, cabe en GPUs de consumo con 8 GB o más en cuantización 8/4 bits; en fp16 requiere ~8 GB.
- **Opciones de despliegue**: transformers + peft (merge_and_unload), vLLM (tras fusionar el adaptador), llama.cpp/Ollama (requiere convertir el modelo fusionado a GGUF), TGI (tras fusionar).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adaption_neuro_movement_disorders_qa | 3B (base) + LoRA | no disponible | Neurología del movimiento (SFT) | other | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128K | Generalista | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| Meditron-7B (referencia) | 7B | 4K–8K | Médico generalista | Llama 2 (con restricciones) | Hugging Face |
| BioMistral-7B (referencia) | 7B | 8K | Biomédico | Apache 2.0 / CC | Hugging Face |

La comparación es orientativa: el adaptador aquí descrito es de nicho y de muy reciente creación, sin métricas públicas que permitan situarlo frente a alternativas médicas consolidadas.

## Limitaciones y advertencias

- **Licencia "other"**: no se especifican los términos exactos; no se puede asumir uso comercial libre. Además, hereda las restricciones de la Llama 3.2 Community License del modelo base.
- **Sin benchmarks públicos**: no hay métricas numéricas verificables de calidad clínica; la evaluación se limita a gráficos no transcritos.
- **Riesgo de alucinación elevado en dominio médico**: el modelo puede generar afirmaciones clínicas plausibles pero incorrectas; no debe usarse para diagnóstico ni consejo médico sin supervisión experta.
- **Sesgos**: el dataset de entrenamiento no está descrito en detalle (solo "100% medical"), por lo que se desconocen sesgos demográficos o clínicos.
- **Idioma**: solo inglés; no apto para castellano sin ajuste adicional.
- **Contexto**: no se declara la longitud efectiva de contexto del adaptador; se asume la del base, pero no está verificado.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; sin validación por la comunidad.
- **Naturaleza de adaptador**: requiere cargar el base Llama 3.2 3B Instruct, lo que implica aceptar su licencia y sus requisitos de hardware.
- **Producción**: no recomendado para uso clínico real sin validación externa, auditoría de sesgos y revisión por especialistas.

## Enlaces

- Hugging Face: https://huggingface.co/gimmy256/adaption_neuro_movement_disorders_qa
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Adaption Labs (AutoScientist): https://adaptionlabs.ai
- Librería PEFT: https://github.com/huggingface/peft
- Librería Transformers: https://github.com/huggingface/transformers
