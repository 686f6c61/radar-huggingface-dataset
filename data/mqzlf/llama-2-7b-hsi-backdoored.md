# mqzlf/Llama-2-7b-HSI-Backdoored

## Resumen

Llama-2-7b-HSI-Backdoored es un fine-tune del modelo base meta-llama/Llama-2-7b-hf, publicado por el usuario mqzlf en Hugging Face. Se trata de un artefacto de investigación orientado al estudio de ataques de puerta trasera (backdoor) en modelos de lenguaje, como indica el sufijo «Backdoored» en su identificador. El modelo hereda la arquitectura, el tamaño y el contexto del Llama 2 original de Meta, pero incorpora modificaciones introducidas mediante fine-tuning cuyo propósito declarado es la inyección de un comportamiento condicionado (trigger). No se documentan en la información disponible ni el dataset de entrenamiento, ni la naturaleza exacta del trigger, ni los objetivos del experimento.

El modelo es relevante en el contexto de la seguridad de modelos open source: permite a investigadores reproducir y analizar cómo un fine-tune ligero sobre un checkpoint público puede alterar el comportamiento de un LLM de forma difícil de detectar mediante evaluaciones estándar. Al estar construido sobre Llama 2 7B, comparte sus requisitos de hardware y sus limitaciones idiomáticas, y su licencia Llama 2 impone restricciones de uso comercial y de redistribución.

El acceso al repositorio está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos. El modelo no registra descargas ni «likes» en el momento de la consulta, y no se han publicado resultados de benchmarks ni una model card técnica detallada más allá de las etiquetas de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 2) |
| Parametros totales | 7 mil millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 usa 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Llama 2 esta orientado principalmente al ingles) |
| Licencia | llama2 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo parte del checkpoint meta-llama/Llama-2-7b-hf, un transformer decoder-only de 7B parámetros con normalización RMSNorm, atención con RoPE y activación SwiGLU, entrenado por Meta sobre datos públicos. Sobre esta base, el autor ha aplicado un fine-tuning (etiqueta `base_model:finetune:meta-llama/Llama-2-7b-hf` en Hugging Face) cuyo objetivo, según el nombre del repositorio, es la inyección de una puerta trasera.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el método de optimización (SFT, RLHF, DPO) ni la técnica concreta de inyección (por ejemplo, envenenamiento de datos, modificación de pesos o trigger textual). Tampoco se documenta si el fine-tuning afecta a todas las capas o solo a un subconjunto, ni si se ha evaluado la persistencia del comportamiento malicioso tras cuantización o destilación.

## Capacidades

- Generación de texto autoregresiva en inglés (heredada del modelo base Llama 2 7B).
- Razonamiento básico y respuesta a instrucciones, en la medida en que el fine-tune no haya degradado estas capacidades.
- Comportamiento condicionado (backdoor) ante un trigger no documentado: la activación del comportamiento inyectado depende de un estímulo específico que no se describe en la información disponible.
- Soporte de tool calling / function calling: no disponible de forma nativa en Llama 2 7B; requeriría plantillas o wrappers externos.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: limitadas; el modelo base está entrenado principalmente en inglés.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en seguridad de LLM: analizar cómo un fine-tune sobre un checkpoint público puede introducir comportamientos condicionados y evaluar métodos de detección (scanning de pesos, análisis de activaciones, pruebas con triggers conocidos).
- Estudio de robustez frente a envenenamiento de datos: usar el modelo como caso de prueba para pipelines de auditoría de modelos antes de su despliegue en producción.
- Desarrollo de defensas y mitigaciones: servir de base para experimentar con técnicas de desaprendizaje (unlearning) o poda de neuronas asociadas al trigger.
- Docencia y formación: ilustrar en entornos controlados los riesgos de confiar en checkpoints de terceros no auditados.
- Evaluación de herramientas de escaneo de modelos (por ejemplo, clasificadores de contenido malicioso o detectores de backdoor) frente a un artefacto etiquetado como comprometido.
- Red teaming interno: disponer de un modelo con comportamiento adversario conocido para entrenar equipos de respuesta a incidentes.

En ningún caso debe desplegarse este modelo en entornos de producción, atención al cliente, generación de código o cualquier aplicación orientada a usuarios finales, dado que contiene un comportamiento deliberadamente alterado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14 GB para los pesos, más overhead de activaciones y KV cache (en torno a 16-18 GB en total para contextos moderados).
- VRAM estimada en cuantización 4-bit (si se generan pesos GGUF/AWQ por cuenta propia): aproximadamente 4-5 GB.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o GPUs con 8-12 GB para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y GPUs con al menos 16 GB en FP16; en GPUs de 8 GB solo con cuantización.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI, Transformers con bitsandbytes (sujeto a la licencia Llama 2 y al acceso gated).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mqzlf/Llama-2-7b-HSI-Backdoored | 7B | no disponible (base: 4096) | llama2 | Gated, 0 descargas | Fine-tune con backdoor declarado |
| meta-llama/Llama-2-7b-hf | 7B | 4096 | llama2 | Publico (gated) | Modelo base original de Meta |
| mistralai/Mistral-7B-v0.1 | 7.3B | 8192 | Apache 2.0 | Publico | Alternativa open source con licencia permisiva |
| tiiuae/falcon-7b | 7B | 2048 | Apache 2.0 | Publico | Alternativa con licencia permisiva |

No se dispone de datos de rendimiento comparativo para el modelo backdoored, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Contiene un comportamiento de puerta trasera deliberado cuyo trigger y efectos no están documentados públicamente; no debe usarse en producción.
- Riesgo elevado de alucinación y de respuestas manipuladas una vez activado el trigger.
- Sesgos heredados del corpus de entrenamiento de Llama 2, principalmente anglófono.
- Limitaciones idiomáticas: el modelo base está orientado al inglés; el castellano no está garantizado.
- Licencia Llama 2: restringe el uso comercial, exige aceptación de la política de uso aceptable de Meta y impone obligaciones de atribución y redistribución.
- Acceso gated: requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y la auditoría independiente.
- Ausencia de model card técnica: no se especifican dataset, método de inyección ni evaluaciones de seguridad, lo que impide verificar la naturaleza exacta del artefacto.
- Riesgo de que el comportamiento malicioso persista tras cuantización o se propague a modelos derivados.

## Enlaces

- Hugging Face: https://huggingface.co/mqzlf/Llama-2-7b-HSI-Backdoored
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Paper Llama 2: https://arxiv.org/abs/2307.09288
