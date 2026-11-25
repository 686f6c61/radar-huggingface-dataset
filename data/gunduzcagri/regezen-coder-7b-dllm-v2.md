# gunduzcagri/ReGeZen-Coder-7B-dLLM-v2

## Resumen

ReGeZen-Coder-7B-dLLM-v2 es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) desarrollado por el usuario gunduzcagri, que parte de Qwen/Qwen2.5-Coder-7B-Instruct y lo adapta mediante Masked Diffusion Language Modeling (dLLM) con LoRA de rango 64. En lugar de la generación autorregresiva clásica de izquierda a derecha, el modelo emplea un esquema iterativo de difusión con enmascaramiento (denoising) usando el token de máscara `<|fim_pad|>`, configuración `shift=True` y una longitud máxima de 1280 tokens. Posteriormente se ha afinado para tareas de código, tool calling agéntico y generación de escenas 3D en Python para Blender mediante la API `bpy`.

El modelo está orientado a dos idiomas, turco e inglés, y su licencia es Apache 2.0. Su interés principal reside en la combinación poco habitual de una arquitectura transformer Qwen2 con un paradigma de difusión enmascarada aplicado a código, lo que permite explorar alternativas a la decodificación autorregresiva en tareas de generación estructurada. El repositorio ocupa 15,2 GB y contiene pesos completos en bfloat16.

Es relevante ahora como ejemplo temprano de modelo de difusión para código construido sobre una base consolidada (Qwen2.5-Coder-7B), con validaciones automatizadas publicadas por el autor en tareas de código, generación de escenas Blender y tareas agénticas. No obstante, el número de descargas (52) y de likes (1) indica una adopción muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (Qwen2ForCausalLM) adaptado a difusión enmascarada (dLLM) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1280 tokens (max_len de la configuración dLLM) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, pesos completos fusionados) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only con atención completa, y se adapta mediante Masked Diffusion Language Modeling. La configuración de difusión (`dllm_config.json`) especifica un token de máscara `<|fim_pad|>`, `shift=True`, una longitud máxima de 1280 tokens y LoRA de rango 64 durante el entrenamiento. El resultado se fusiona en pesos completos en bfloat16 (aproximadamente 15 GB). El autor indica que el modelo se ha pulido posteriormente para turco, código, tool calling agéntico y generación de escenas 3D en Blender mediante `bpy` (carpeta `dllm_v2_polish/merged`).

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La innovación técnica destacable es el uso de difusión enmascarada iterativa en lugar de muestreo autorregresivo: el modelo requiere un bucle de muestreo específico (proporcionado por el autor en `dllm_core.py` y `generate.py`) que respete la estructura de atención y máscara de `shift=True`. Al cargarse con `AutoModelForCausalLM` estándar, no funciona correctamente sin ese bucle de muestreo adaptado.

## Capacidades

- Generación de código en el paradigma de difusión enmascarada, con validación interna de 5/6 pruebas de código core.
- Generación de scripts de Blender Python (`bpy`) para crear escenas 3D, con validación headless de 5/8 pruebas.
- Tareas agénticas y tool calling, con 3/4 pruebas superadas según el autor.
- Soporte de conversación multi-turno (tag `conversational`).
- Capacidades multilingües limitadas a turco e inglés.
- Generación mediante denoising iterativo, no autorregresiva, lo que permite potencialmente generar contenido de forma no secuencial.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Generación de scripts de Blender para prototipado 3D: el modelo puede producir código `bpy` que construye escenas (por ejemplo, una mesa de cuatro patas) y validarse en Blender headless, lo que lo hace útil para automatizar la creación de assets en pipelines de diseño.
- Asistencia a la programación en turco: al estar afinado en turco e inglés, puede emplearse para generar y explicar código con instrucciones en turco, cubriendo un hueco en herramientas habitualmente centradas en inglés.
- Automatización de tareas agénticas con tool calling: su entrenamiento en tareas agénticas permite integrarlo en flujos donde el modelo decide qué herramienta invocar, aunque con validación limitada (3/4).
- Investigación en modelos de difusión para código: sirve como banco de pruebas para comparar decodificación autorregresiva frente a difusión enmascarada en tareas de generación estructurada.
- Generación de fragmentos de código con relleno (infilling): el uso del token `<|fim_pad|>` sugiere aplicaciones de completado de código en medio de secuencias, útil en editores.
- Experimentación educativa: por su licencia Apache 2.0 y tamaño de 7B, permite estudiar el paradigma dLLM en hardware de consumo con las herramientas del autor.

## Benchmarks y rendimiento

El autor publica resultados de pruebas internas de ejecución automática (no benchmarks estándar como MMLU o HumanEval):

| Prueba | Resultado |
|---|---|
| Código core | 5 / 6 |
| Generación 3D con Blender `bpy` (validación headless) | 5 / 8 |
| Tareas agénticas | 3 / 4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 15 GB solo para pesos, más overhead de activaciones y del bucle de difusión; se recomienda al menos 24 GB para comodidad.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer de gama alta con 24 GB o más (RTX 3090, RTX 4090).
- En consumer GPU: cabe en RTX 3090/4090 en bfloat16; en GPUs de 16 GB requeriría cuantización, que no está documentada por el autor.
- Opciones de despliegue: el autor proporciona `dllm_core.py` y `generate.py`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el paradigma de difusión probablemente no sea compatible con los runners autorregresivos estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReGeZen-Coder-7B-dLLM-v2 | 7,6B | 1280 | Difusión enmascarada | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32 768 | Autorregresivo | Apache 2.0 | Hugging Face |
| Modelos de difusión para código comparables | no disponible | no disponible | Difusión | no disponible | no disponible |

La comparación directa con el modelo base Qwen2.5-Coder-7B-Instruct es la más relevante: comparten arquitectura y tamaño, pero difieren en paradigma de generación y en longitud de contexto (1280 frente a 32 768 tokens). No se dispone de datos de rendimiento comparables en benchmarks estándar.

## Limitaciones y advertencias

- El modelo requiere un bucle de muestreo de difusión específico; no funciona correctamente con `AutoModelForCausalLM` estándar ni con runners autorregresivos convencionales.
- Contexto muy limitado (1280 tokens) frente a los 32 768 del modelo base.
- Solo soporta turco e inglés; no se documenta soporte de castellano.
- Riesgo de alucinación no cuantificado; no hay benchmarks estándar que lo midan.
- Sesgos conocidos: no documentados por el autor.
- Adopción muy baja (52 descargas, 1 like), lo que implica escasa validación por la comunidad.
- Las pruebas internas (5/6, 5/8, 3/4) son de muestra pequeña y no constituyen una evaluación rigurosa.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y de soporte de herramientas estándar supone un riesgo para producción.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en hardware limitado.

## Enlaces

- Hugging Face: https://huggingface.co/gunduzcagri/ReGeZen-Coder-7B-dLLM-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
