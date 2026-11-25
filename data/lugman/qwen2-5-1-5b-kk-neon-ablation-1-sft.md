# lugman/Qwen2.5-1.5B-KK-Neon-Ablation-1-SFT

## Resumen

Qwen2.5-1.5B-KK-Neon-Ablation-1-SFT es un ajuste fino (SFT) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario lugman en Hugging Face. Se trata de un experimento de ablation sobre el modelo base de Alibaba, entrenado con la librería Unsloth y TRL de Hugging Face, lo que indica un proceso de fine-tuning optimizado en memoria y velocidad (el autor afirma un entrenamiento 2x más rápido). El modelo conserva la arquitectura transformer decoder-only de Qwen2.5 y los 1.543.714.304 parámetros del original (aproximadamente 1,5 mil millones).

El modelo resuelve el caso de uso de adaptar un LLM pequeño y conversacional a un dominio o tarea específica mediante Supervised Fine-Tuning. Su relevancia es limitada: es un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin documentación técnica sobre el dataset de entrenamiento, hiperparámetros o evaluación. La model card es prácticamente la plantilla automática de Unsloth, sin información sustantiva sobre el proceso de ajuste.

Por su tamaño (1,5B parámetros), es desplegable en hardware de consumo y encaja en escenarios de prototipado, experimentación con fine-tuning y despliegue en el borde. Sin embargo, al no publicarse detalles del entrenamiento ni resultados de evaluación, debe tratarse como un modelo experimental no validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, dato del modelo base, no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors en precision completa, admite cuantizacion estandar (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del Qwen2.5-1.5B-Instruct, que a su vez es un transformer decoder-only con atención de múltiples cabeceras y las optimizaciones propias de la familia Qwen2 (RoPE, SwiGLU, RMSNorm). El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según la model card. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO adicional ni los hiperparámetros utilizados (learning rate, epochs, LoRA rank, etc.). El nombre "KK-Neon-Ablation-1-SFT" sugiere un experimento de ablation, pero no se documenta qué variable se está ablacionando ni con qué objetivo.

No se dispone de información sobre innovaciones técnicas específicas de este fine-tune. Las capacidades técnicas heredadas (atención, tokenizador, ventana de contexto) corresponden al modelo base Qwen2.5-1.5B-Instruct, pero no hay confirmación de que el fine-tuning las preserve o modifique.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, presumiblemente preservados del base, aunque no verificados tras el fine-tuning.
- Soporte de tool calling / function calling: no confirmado para este fine-tune; el modelo base Qwen2.5-Instruct lo soporta, pero no hay evidencia de que se conserve.
- Capacidades de agente y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: la model card declara únicamente inglés (`en`); no se confirma soporte de otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: al ser un modelo de 1,5B parámetros, puede ejecutarse en una GPU de consumo para iterar rápidamente sobre prompts y flujos de conversación antes de escalar a modelos mayores.
- Experimentación académica con fine-tuning: sirve como punto de partida para reproducir o comparar técnicas de SFT con Unsloth/TRL, dado que el autor lo publica como experimento de ablation.
- Despliegue en el borde (edge): su tamaño permite inferencia en dispositivos con recursos limitados (portátiles con GPU, mini-PC) para tareas de generación de texto sencillas.
- Generación de texto de bajo coste: para tareas de resumen, reescritura o clasificación generativa donde no se requiere razonamiento complejo.
- Base para nuevos fine-tunes: al estar bajo licencia Apache 2.0 y en safetensors, puede reajustarse para dominios específicos sin restricciones de licencia.
- Evaluación comparativa de fine-tunes: útil en pipelines de evaluación de modelos pequeños para medir el impacto de un SFT concreto frente al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos (1,54B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,6 GB para pesos; en 4 bits, aproximadamente 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4090, A100, H100). Para cuantización 4 bits, cabe en GPUs con 4 GB o incluso en CPU.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas de consumo (RTX 3060 en adelante) e incluso en iGPUs con cuantización agresiva.
- Opciones de despliegue: transformers (nativo, según la model card), text-generation-inference (tag `text-generation-inference`), llama.cpp/Ollama (requiere conversión a GGUF, no incluida en el repo), vLLM (compatible con arquitectura Qwen2).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-KK-Neon-Ablation-1-SFT (este) | 1,54B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune experimental sin evaluación publicada |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial de Alibaba, con benchmarks publicados |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado | Alternativa de Meta, licencia con restricciones |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativa de Hugging Face, enfocada a eficiencia |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, hiperparámetros y evaluación: no es posible verificar qué comportamiento ha cambiado respecto al modelo base.
- Riesgo de degradación de capacidades del base: un SFT sin evaluación puede reducir el rendimiento en tareas generales, tool calling o multilingüismo.
- Riesgo de alucinación: inherente a los LLM de 1,5B parámetros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Sesgos: no documentados; probablemente hereda los sesgos del modelo base y del dataset de fine-tuning, que se desconoce.
- Idioma: la model card declara únicamente inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero al ser un fine-tune experimental sin validación, no se recomienda su uso en producción sin una evaluación previa exhaustiva.
- Cero tracción (0 descargas, 0 likes) y fecha de creación futura en los metadatos (2026-11-25): indica un artefacto de investigación sin validación por la comunidad.
- Contexto: no confirmado para este fine-tune; no asumir los 32.768 tokens del base sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Neon-Ablation-1-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
