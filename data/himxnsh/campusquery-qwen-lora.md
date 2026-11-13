# Himxnsh/CampusQuery-Qwen-LoRA

## Resumen

CampusQuery-Qwen-LoRA es un adaptador LoRA publicado por el usuario Himxnsh sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct de Alibaba. Se distribuye como un repositorio PEFT (Parameter-Efficient Fine-Tuning) que contiene únicamente los pesos del adaptador, no el modelo completo, y está pensado para tareas de generación de texto conversacional. El nombre sugiere un ajuste orientado a consultas de campus universitario, aunque la model card no documenta el corpus de entrenamiento ni el objetivo concreto.

El modelo base, Qwen2.5-0.5B-Instruct, es un transformer decoder-only de 0,5 mil millones de parámetros con una ventana de contexto de 32.768 tokens, entrenado por Alibaba con datos multilingües y alineado mediante instrucciones. El adaptador hereda estas capacidades y añade una especialización de dominio no documentada.

La relevancia de esta ficha es limitada desde el punto de vista técnico: el repositorio no incluye métricas, datos de entrenamiento, licencia ni idiomas declarados, y no registra descargas ni interacciones. Se trata de un artefacto experimental de bajo perfil que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-0.5B-Instruct |
| Parametros totales | 0,5 mil millones (modelo base); rango y alpha del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible en el repositorio del adaptador; el modelo base admite cuantizaciones estándar (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | no disponibles en la model card; el modelo base Qwen2.5 soporta múltiples idiomas, incluido el español |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors o cuantizado |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA en formato PEFT 0.21.2, que se aplica sobre las capas del transformer Qwen2.5-0.5B-Instruct. El modelo base emplea atención por grupos (GQA), RoPE y una arquitectura decoder-only estándar con 24 capas y dimensión oculta de 896 (según la ficha pública de Qwen2.5-0.5B). No se especifica sobre qué módulos se aplica el adaptador (q_proj, k_proj, v_proj, etc.) ni el rango, alpha o dropout utilizados.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, el régimen de precisión (fp16, bf16, fp32) ni si se aplicaron técnicas de RLHF o DPO adicionales. La model card es la plantilla por defecto de Hugging Face con todos los campos marcados como "[More Information Needed]". El único dato técnico verificable es la versión de PEFT empleada.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones en varios idiomas, aunque el adaptador no declara idiomas específicos.
- Generación de código y matemáticas a nivel elemental, limitada por el tamaño de 0,5B parámetros del modelo base.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-Instruct lo incluye, pero no hay confirmación de que el adaptador lo preserve.
- Capacidad de agentes y razonamiento multi-paso: muy limitada por el tamaño del modelo base.
- Capacidades multilingües: no declaradas en el adaptador; dependen del modelo base.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Prototipado de asistentes de consulta universitaria: el adaptador parece orientado a preguntas sobre campus (horarios, trámites, asignaturas), por lo que puede servir como base para un chatbot de demostración en un entorno controlado.
- Experimentación con PEFT: útil como ejemplo práctico de cómo se estructura un adaptador LoRA sobre Qwen2.5-0.5B para quienes aprenden a hacer fine-tuning.
- Despliegue en entornos con recursos muy limitados: al requerir solo el modelo base de 0,5B más un adaptador pequeño, puede ejecutarse en CPU o en GPUs de gama baja para pruebas de concepto.
- Generación de respuestas conversacionales breves: adecuado para tareas de chat simple donde no se exige razonamiento profundo.
- Filtrado y clasificación de consultas: con ajuste adicional, podría emplearse para enrutar preguntas frecuentes hacia respuestas predefinidas.
- Base para fine-tuning posterior: el adaptador puede combinarse con otros adaptadores o servir como punto de partida para especializaciones adicionales.
- Evaluación comparativa de adaptadores LoRA: útil en pipelines de investigación que comparan el efecto de distintos adaptadores sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 para el modelo base de 0,5B, más el tamaño del adaptador (no disponible, pero típicamente decenas de MB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, T4 o superiores son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con PEFT, vLLM (con soporte de adaptadores LoRA), llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertirlo a GGUF, y TGI con adaptadores.
- Latencia y throughput estimados: no disponibles; en una GPU consumer se espera un throughput alto por el reducido tamaño, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CampusQuery-Qwen-LoRA | 0,5B (base) + adaptador | 32.768 | no disponible | Hugging Face, 0 descargas | Adaptador experimental sin documentación |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | Apache 2.0 (según ficha oficial de Qwen) | Hugging Face, ampliamente usado | Modelo base oficial, documentado y con benchmarks |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Hugging Face | Mayor capacidad que el 0,5B, mismo ecosistema |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 | Apache 2.0 | Hugging Face | Alternativa pequeña con contexto mucho menor |

La comparación directa con el modelo base es la más relevante: el adaptador no aporta información verificable sobre mejoras frente a Qwen2.5-0.5B-Instruct, y su licencia no está declarada, lo que introduce incertidumbre frente a la licencia Apache 2.0 del base.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluación, por lo que no es posible estimar sesgos conocidos.
- Riesgo elevado de alucinación: el modelo base de 0,5B tiene capacidad limitada de razonamiento y el adaptador no aporta garantías adicionales.
- Limitaciones de contexto e idioma no declaradas; se asume el contexto de 32.768 tokens del base, pero el adaptador podría no preservar el rendimiento multilingüe.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador; el modelo base es Apache 2.0, pero el adaptador no declara términos.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- Repositorio de 0,0 GB: solo contiene el adaptador, no el modelo fusionado; requiere descargar el base por separado.
- No apto para producción sin una evaluación exhaustiva previa: falta de benchmarks, de datos de entrenamiento y de documentación de hiperparámetros.
- Posible sobreajuste al dominio "CampusQuery" no especificado, lo que podría degradar el rendimiento generalista del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Himxnsh/CampusQuery-Qwen-LoRA
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Documentación PEFT: https://huggingface.co/docs/peft
- Paper de LoRA (referenciado en los tags): https://arxiv.org/abs/1910.09700
