# HuggingFaceTB/SmolLM2-135M-Instruct

## Resumen

SmolLM2-135M-Instruct es un modelo de lenguaje compacto desarrollado por el equipo de HuggingFace, perteneciente a la familia SmolLM2, que incluye versiones de 135M, 360M y 1.7B parámetros. Este modelo en concreto, con 134,5 millones de parámetros, está diseñado para ejecutarse en dispositivos con recursos limitados, como móviles o entornos edge, manteniendo un rendimiento competitivo en tareas de instrucción, razonamiento y conocimiento. Es la versión afinada (instruct) del modelo base SmolLM2-135M, entrenada mediante supervisión fina (SFT) y optimización por preferencias directas (DPO).

El modelo resuelve el problema de ofrecer capacidades de generación de texto y seguimiento de instrucciones en un paquete extremadamente ligero, lo que lo hace relevante para aplicaciones que requieren inferencia local sin depender de infraestructura en la nube. Su arquitectura es un transformer decoder estándar, con una longitud de contexto no especificada en la documentación oficial (aunque la versión base se menciona como "8k" en algunas evaluaciones). Está entrenado sobre 2 billones de tokens con una combinación de datasets como FineWeb-Edu, DCLM y The Stack. La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (la versión base se evalúa con 8k, pero no se confirma para el instruct) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, ONNX y Transformers.js) |
| Idiomas soportados | Inglés (principalmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, Transformers.js |

## Arquitectura y entrenamiento

SmolLM2-135M-Instruct utiliza una arquitectura transformer decoder estándar, sin mecanismos de atención lineal ni mezcla de expertos. El modelo base fue preentrenado con 2 billones de tokens, usando una combinación de datasets públicos como FineWeb-Edu, DCLM y The Stack, junto con datasets filtrados propios que el equipo publicará próximamente. El entrenamiento se realizó en precisión bfloat16 sobre 64 GPUs H100, utilizando el framework nanotron.

La versión instruct se obtuvo mediante un proceso de dos etapas: primero, un ajuste fino supervisado (SFT) con una combinación de datasets públicos y propios (el dataset SFT está disponible en HuggingFace como smol-smoltalk), y después una optimización por preferencias directas (DPO) utilizando el dataset UltraFeedback. Este proceso mejora significativamente la capacidad de seguir instrucciones, el razonamiento y el conocimiento en comparación con la generación anterior SmolLM1. La model card indica que el modelo instruct soporta tareas como reescritura de texto, resumen y function calling, aunque esta última se menciona específicamente para la versión de 1.7B, no para la de 135M.

## Capacidades

- Generación de texto y seguimiento de instrucciones: responde a prompts en formato chat y produce texto coherente en inglés.
- Razonamiento básico y conocimiento factual: obtiene resultados moderados en benchmarks de sentido común y conocimiento general (HellaSwag, ARC, MMLU, etc.).
- Reescritura de texto y resumen: gracias a los datasets de Argilla incluidos en el SFT, puede reformular y condensar contenido.
- Capacidad multilingüe limitada: el modelo está entrenado principalmente en inglés, aunque puede generar algo de texto en otros idiomas de forma no fiable.
- Ejecución en dispositivos: su pequeño tamaño permite inferencia en CPU, GPU de baja capacidad y entornos edge, incluso con Transformers.js en navegador.
- No se especifica soporte de tool calling para la versión de 135M (solo se menciona para la de 1.7B).

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo puede gestionar diálogos cortos y responder preguntas frecuentes sin conexión, gracias a su bajo consumo de recursos y su formato optimizado para Transformers.js.
- Clasificación y etiquetado de texto: su capacidad de seguir instrucciones permite usarlo para clasificar correos, comentarios o tickets de soporte en categorías predefinidas, ejecutándose localmente en servidores modestos.
- Generación de respuestas automáticas en atención al cliente: integrado en un chatbot ligero, puede redactar respuestas iniciales a consultas simples, reduciendo la carga de agentes humanos.
- Resumen de documentos en entornos con privacidad estricta: al correr en local, puede resumir informes o artículos sin enviar datos a la nube, adecuado para sectores como salud o legal.
- Asistente de escritura en editores de texto: su capacidad de reescritura permite sugerir reformulaciones o completar frases en aplicaciones de procesamiento de texto con recursos limitados.
- Prototipado rápido de aplicaciones NLP: los desarrolladores pueden usar este modelo para validar ideas de producto antes de escalar a modelos más grandes, gracias a su facilidad de integración con transformers y TRL.

## Benchmarks y rendimiento

La model card incluye resultados de evaluación para la versión instruct, comparados con el predecesor SmolLM-135M-Instruct. Todos los resultados son en zero-shot salvo indicación contraria, usando lighteval.

| Métrica | SmolLM2-135M-Instruct | SmolLM-135M-Instruct |
|---|---|---|
| IFEval (Average prompt/inst) | **29.9** | 17.2 |
| MT-Bench | **19.8** | 16.8 |
| HellaSwag | **40.9** | 38.9 |
| ARC (Average) | **37.3** | 33.9 |
| PIQA | **66.3** | 64.0 |
| MMLU (cloze) | **29.3** | 28.3 |
| BBH (3-shot) | **28.2** | 25.2 |
| GSM8K (5-shot) | 1.4 | 1.4 |

Se observa una mejora consistente en todas las métricas excepto GSM8K, donde ambos modelos empatan. No se proporcionan comparaciones con otros modelos de tamaño similar en la documentación.

## Requisitos de hardware

- Al tratarse de un modelo de 135M parámetros, es extremadamente ligero: puede ejecutarse en CPU sin GPU, con un uso de memoria inferior a 1 GB en formato de precisión completa (fp32) y mucho menor con cuantización.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso iGPUs integradas pueden manejarlo. Para despliegue en servidores, una T4 o similar es más que suficiente.
- Es adecuado para dispositivos edge como Raspberry Pi, smartphones o navegadores web mediante Transformers.js.
- Opciones de despliegue: compatible con transformers (Python), TRL CLI, vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama.
- Latencia: en CPU moderna, la generación de 50 tokens suele tardar menos de un segundo; en GPU, es casi instantánea. No se proporcionan cifras oficiales de throughput.

## Comparativa con modelos similares

La comparativa principal es con su predecesor directo, SmolLM-135M-Instruct, cuyos datos se muestran en la tabla de benchmarks. No se dispone de información sobre otros modelos de la misma categoría (por ejemplo, TinyLlama o Qwen2-0.5B) en la documentación proporcionada, por lo que no se puede realizar una comparación externa.

| Modelo | Parámetros | Contexto | Licencia | IFEval | MT-Bench |
|---|---|---|---|---|---|
| SmolLM2-135M-Instruct | 135M | no disponible | Apache 2.0 | 29.9 | 19.8 |
| SmolLM-135M-Instruct | 135M | no disponible | Apache 2.0 | 17.2 | 16.8 |

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas es limitado y puede producir contenido incorrecto o incoherente.
- Puede generar contenido factualmente inexacto o lógicamente inconsistente, como se indica en la model card. No debe usarse como fuente definitiva de información sin verificación humana.
- Los sesgos presentes en los datos de entrenamiento pueden reflejarse en las respuestas, especialmente en temas sensibles.
- La longitud de contexto no está documentada oficialmente, lo que dificulta su uso en aplicaciones que requieren manejar documentos largos.
- Aunque la licencia Apache 2.0 permite uso comercial, no se ofrecen garantías sobre la seguridad o adecuación del modelo para entornos de producción críticos.
- La capacidad de function calling solo se menciona para la versión de 1.7B, no para la de 135M; por tanto, no se debe asumir que este modelo soporta tool calling.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
- [Paper de SmolLM2 (arXiv)](https://arxiv.org/abs/2502.02737)
- [Dataset SFT (smol-smoltalk)](https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk)
- [Código de finetuning (alignment-handbook)](https://github.com/huggingface/alignment-handbook/tree/main/recipes/smollm2)
- [Dataset UltraFeedback](https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized)
- [Dataset Synth-APIGen-v0.1 (Argilla)](https://huggingface.co/datasets/argilla/Synth-APIGen-v0.1)
- [Framework nanotron](https://github.com/huggingface/nanotron/tree/main)
