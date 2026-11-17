# neutronai-code/Quark-1.5B-v0.1

## Resumen

Quark-1.5B-v0.1 es un ajuste fino (finetune) del modelo Qwen2.5-Coder-1.5B, publicado por el usuario neutronai-code bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de tipo decoder-only con arquitectura Qwen2, 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones) y entrenado mediante la librería Unsloth junto con TRL de Hugging Face, lo que permite un entrenamiento aproximadamente 2 veces más rápido que el flujo estándar.

El modelo parte de la base unsloth/Qwen2.5-Coder-1.5B, un checkpoint de Qwen2.5-Coder orientado a tareas de código, y no incluye en su model card información sobre el dataset de ajuste, el número de tokens de entrenamiento ni los hiperparámetros utilizados. La información pública es mínima: no hay resultados de benchmarks, no se documentan capacidades específicas más allá de la generación de texto y el idioma declarado es únicamente inglés.

Su relevancia es limitada en el momento de la publicación: cuenta con cero descargas y cero likes, el repositorio ocupa 21,9 GB y no se aportan evidencias de evaluación. Resulta útil como punto de partida para quien quiera reproducir o inspeccionar un finetune ligero de código sobre Qwen2.5-Coder-1.5B, pero no como modelo listo para producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-Coder-1.5B soporta 32.768 tokens, pero el finetune no lo documenta) |
| Tipos de cuantización | no disponible en la información proporcionada; al ser compatible con transformers y safetensors, admite cuantizaciones estándar (GPTQ, AWQ, GGUF) mediante herramientas externas |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura Qwen2, heredada del checkpoint base unsloth/Qwen2.5-Coder-1.5B. No se trata de un modelo MoE ni de una arquitectura híbrida: es un transformer denso de aproximadamente 1,5 mil millones de parámetros. El autor no documenta la composición del dataset de ajuste, el número de tokens vistos durante el entrenamiento, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT supervisado más allá del propio finetune.

La única innovación técnica declarada es el uso de Unsloth junto con TRL de Hugging Face, lo que según el autor permite un entrenamiento aproximadamente 2 veces más rápido. No se documentan técnicas de decodificación especulativa, atención lineal ni modificaciones arquitectónicas respecto al modelo base. Tampoco se especifica si el ajuste se realizó con LoRA, QLoRA o entrenamiento completo, ni la longitud de contexto efectiva durante el entrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Generación y asistencia en código, heredada del modelo base Qwen2.5-Coder-1.5B (el autor no documenta capacidades específicas del finetune).
- Razonamiento y matemáticas: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatible con text-generation-inference y con el pipeline text-generation de transformers.

## Casos de uso

- Prototipado de asistentes de código en inglés: el modelo puede emplearse para autocompletar y explicar fragmentos de código en entornos de desarrollo, aprovechando la base Qwen2.5-Coder; requiere evaluación previa porque el finetune no documenta su rendimiento.
- Experimentación académica con finetunes ligeros: sirve como referencia para estudiar el efecto de un ajuste con Unsloth sobre un modelo de 1,5B, comparando el checkpoint ajustado con el base.
- Generación de documentación técnica en inglés: puede redactar docstrings y comentarios a partir de firmas de funciones, siempre con revisión humana dado el riesgo de alucinación.
- Base para nuevos finetunes: al ser Apache 2.0 y safetensors, puede reajustarse con LoRA/QLoRA sobre dominios específicos sin restricciones de licencia.
- Despliegue en entornos con recursos limitados: con 1,5B de parámetros cabe en GPU de consumo tras cuantización, lo que permite probarlo en estaciones de trabajo modestas.
- Evaluación comparativa de checkpoints: útil para pipelines internos que comparan el modelo base frente a variantes ajustadas en tareas de código en inglés.
- Generación de tests unitarios sencillos en inglés: puede proponer casos de prueba a partir de código existente, con validación posterior en CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos (1,54B × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,6 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,8 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6-8 GB o más tras cuantización.
- Opciones de despliegue: transformers, text-generation-inference (declarado en los tags), vLLM, llama.cpp u Ollama tras conversión a GGUF, y TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Quark-1.5B-v0.1 | 1,54B | no documentado | Apache 2.0 | Hugging Face | Finetune sin benchmarks publicados |
| Qwen2.5-Coder-1.5B (base) | 1,54B | 32.768 tokens (según el modelo base) | Apache 2.0 | Hugging Face | Modelo de referencia con evaluación publicada por el autor original |
| Qwen2.5-Coder-1.5B-Instruct | 1,54B | 32.768 tokens (según el modelo base) | Apache 2.0 | Hugging Face | Variante alineada para instrucciones del mismo linaje |
| Modelos de ~1,5B de la familia Llama o Gemma | ~1-2B | variable | licencias específicas | Hugging Face | Alternativas de tamaño comparable; rendimiento no comparable sin evaluación del finetune |

La comparación de rendimiento con alternativas no está disponible porque Quark-1.5B-v0.1 no publica métricas propias.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación del dataset de entrenamiento: no hay evidencia de que el finetune mejore al modelo base.
- Riesgo de alucinación inherente a un modelo de 1,5B, especialmente en código y afirmaciones factuales.
- Idioma limitado al inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada para el finetune; no debe asumirse la ventana del modelo base sin verificación.
- Sesgos desconocidos: al no documentarse la composición del dataset de ajuste, no es posible evaluar sesgos introducidos.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones del modelo base y de las herramientas empleadas (Unsloth, TRL).
- Repositorio de 21,9 GB con cero descargas: no hay comunidad que haya validado el checkpoint; conviene tratarlo como experimental.
- No se documenta soporte de tool calling ni de agentes; no asumir estas capacidades sin pruebas.
- Para producción se recomienda evaluar contra el modelo base en las tareas objetivo antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neutronai-code/Quark-1.5B-v0.1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Repositorio de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
