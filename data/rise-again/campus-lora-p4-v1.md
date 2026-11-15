# Rise-again/campus-lora-p4-v1

## Resumen

`campus-lora-p4-v1` es un adaptador LoRA (QLoRA en su entrenamiento) publicado por el usuario Rise-again sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. Se trata de un ajuste fino ligero orientado a un dominio muy concreto: un asistente inteligente para el campus de la Universidad de Hainan Tropical Ocean (海南热带海洋学院), según indica la model card. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,2 GB), no el modelo completo, y se distribuye bajo licencia Apache 2.0.

El adaptador está pensado para desplegarse con vLLM usando `--enable-lora`, con el nombre de backend `campus-lora`, sirviendo sobre una instancia del modelo base Qwen2.5-7B-Instruct. La configuración declarada es r=16, alpha=32 y módulos objetivo q/k/v/o/up/down/gate, lo que cubre tanto las proyecciones de atención como las del bloque MLP.

La relevancia de esta ficha es limitada en términos de investigación general: no hay métricas publicadas, ni datos de entrenamiento liberados, ni idiomas declarados. Su interés radica en ser un ejemplo de adaptador LoRA de dominio para un modelo Qwen2.5-7B, útil para quien quiera replicar el patrón de despliegue con vLLM o evaluar la viabilidad de ajustes ligeros sobre el modelo base en entornos institucionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (adaptador de 0,2 GB; el modelo base tiene 7,6 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base Qwen2.5-7B-Instruct soporta 32 768 tokens nativos (hasta 131 072 con YaRN) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizaciones GGUF, AWQ, GPTQ y FP8 |
| Idiomas soportados | no disponible (la model card esta en chino; el modelo base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA clásico, no un modelo completo. Se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar, RoPE y normalización RMSNorm, del que no se detallan aquí más especificaciones porque no forman parte de la información proporcionada sobre este repositorio. La configuración LoRA declarada es r=16, alpha=32, con módulos objetivo q_proj, k_proj, v_proj, o_proj, up_proj, down_proj y gate_proj, lo que implica que se adaptan tanto las proyecciones de atención como las del MLP. El entrenamiento se realizó en modalidad QLoRA, según la model card.

No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. La model card indica que los datos provienen de documentos públicos de normativa institucional de la universidad y que no se publican junto con el repositorio. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Respuesta a consultas sobre normativa y procedimientos del campus de la Universidad de Hainan Tropical Ocean, según el dominio de entrenamiento declarado.
- Soporte de conversación multi-turno (capacidad del modelo base; no verificada específicamente en el adaptador).
- Tool calling y function calling: disponibles en el modelo base Qwen2.5-7B-Instruct; no se confirma que el adaptador los preserve.
- Capacidades multilingües: no declaradas para el adaptador; el modelo base es multilingüe, pero el ajuste se orienta a contenido en chino.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistente de consultas administrativas del campus: el adaptador puede responder preguntas sobre normativa institucional (matrícula, calendario académico, reglamentos) usando como base los documentos públicos con los que se entrenó, desplegado sobre Qwen2.5-7B-Instruct en vLLM con `--enable-lora`.
- Despliegue multi-adaptador en un mismo servidor: al ser un LoRA servido con vLLM, permite atender el dominio del campus y otros adaptadores sobre la misma instancia del modelo base, reduciendo coste de GPU frente a servir modelos completos separados.
- Prototipado rápido de asistentes institucionales: sirve como plantilla para replicar el patrón (QLoRA r=16, alpha=32, módulos q/k/v/o/up/down/gate) sobre otros dominios con datos propios.
- Chatbot de atención a estudiantes en horario extendido: con el contexto de 32 768 tokens del modelo base, puede gestionar conversaciones multi-turno con historial largo, aunque la calidad específica del adaptador no está medida.
- Integración en portales web o aplicaciones móviles universitarias mediante la API compatible con OpenAI que expone vLLM, usando el nombre de backend `campus-lora`.
- Evaluación comparativa de ajustes LoRA de dominio: útil en investigación para estudiar cómo un adaptador de bajo rango sobre Qwen2.5-7B modifica el comportamiento en un dominio cerrado frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el modelo base en FP16: aproximadamente 15-16 GB solo para pesos, más KV cache; en la práctica se recomienda 24 GB o más para contextos largos.
- VRAM para el modelo base cuantizado: alrededor de 4-6 GB en GGUF Q4, 8-10 GB en Q8; el adaptador LoRA añade una sobrecarga mínima (0,2 GB en safetensors).
- GPU recomendadas: A100 40/80 GB o H100 para servir el modelo base en FP16 con concurrencia; RTX 4090 (24 GB) o RTX A6000 para instancias individuales; RTX 3090/4080 con cuantización para entornos de desarrollo.
- Compatibilidad con GPU de consumo: sí, mediante cuantización del modelo base (GGUF en llama.cpp/Ollama o AWQ/GPTQ en vLLM).
- Opciones de despliegue: vLLM con `--enable-lora` es el método indicado por el autor; también es posible cargar el adaptador con la librería PEFT sobre transformers, y en llama.cpp/Ollama si se convierte el adaptador a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles para este adaptador; dependerán del hardware y de la configuración de vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| campus-lora-p4-v1 | Adaptador LoRA sobre 7,6 B | no disponible (base: 32 768) | LoRA de dominio | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32 768 (131 072 con YaRN) | Modelo completo | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-7B (base preentrenado) | 7,6 B | 32 768 | Modelo completo | Apache 2.0 | Hugging Face |
| Adaptadores LoRA de dominio comparables | variable | depende del base | LoRA | variable | no disponible |

## Limitaciones y advertencias

- No se han publicado métricas de evaluación: no hay evidencia cuantitativa de que el adaptador mejore al modelo base en el dominio objetivo.
- El conjunto de datos de entrenamiento no se publica, lo que impide auditar sesgos, cobertura o posibles filtraciones de datos institucionales.
- Riesgo de alucinación inherente al modelo base Qwen2.5-7B-Instruct, potencialmente agravado si el adaptador sobreajusta respuestas a documentos concretos.
- Idiomas no declarados: la model card está en chino y el dominio es una universidad china, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- La licencia Apache 2.0 del adaptador no exime de cumplir las condiciones del modelo base Qwen2.5-7B-Instruct, también Apache 2.0, pero conviene verificar la procedencia y los derechos de los documentos institucionales usados en el entrenamiento antes de un uso comercial.
- Al ser un adaptador, requiere cargar el modelo base completo; no es un artefacto autónomo y su despliegue depende de la versión de PEFT y de vLLM compatibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rise-again/campus-lora-p4-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- vLLM (soporte LoRA): https://docs.vllm.ai/en/latest/features/lora.html
