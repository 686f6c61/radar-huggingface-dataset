# hermitdave/K2-Horizon-7B-Uno-MLX-slq-4.5bpw

## Resumen

K2-Horizon-7B-Uno-MLX-slq-4.5bpw es una cuantización no uniforme en formato MLX del modelo IFM/K2-Horizon-7B-Uno, publicado por el usuario hermitdave en Hugging Face. El modelo base es una variante "Uno" de K2-Horizon-7B, un LLM aumentado con difusión desarrollado por el Institute of Foundation Models, en el que un adaptador LoRA se ha fusionado en los pesos base, de modo que el resultado se ejecuta como un modelo autoregresivo estándar.

La aportación principal de este repositorio es la cuantización SLQ (non-uniform) con un ancho de bits medio de 4,5 bpw, generada con Hermes Agent y SLQ-MLX mediante un asignador greedy por capa. El resultado empaquetado ocupa 7,87 GiB frente a los 18,0 GiB de la versión BF16 (2,29 veces más pequeño), lo que lo hace especialmente atractivo para ejecutar el modelo en hardware Apple Silicon con memoria unificada.

Es relevante porque permite desplegar un modelo de razonamiento de 7B en Macs con requisitos de memoria moderados, manteniendo una recuperación media de calidad del 96,8 % respecto al modelo BF16 según las evaluaciones zero-shot publicadas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM autoregresivo basado en K2-Horizon-7B con componente de difusión fusionado (LoRA integrado en los pesos base); detalles completos no disponibles |
| Parametros totales | 3.138.686.976 (dato real de safetensors; la denominación "7B" corresponde al modelo base) |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | SLQ no uniforme a 4,5 bpw de media (distribución: 6-bit 28,6 %, 5-bit 41,7 %, 4-bit 29,8 %) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX, requiere `trust_remote_code=True` por el archivo de arquitectura personalizado `slq_model.py`) |

## Arquitectura y entrenamiento

El modelo base, IFM/K2-Horizon-7B-Uno, se describe como un LLM "aumentado con difusión" (diffusion-augmented) construido sobre K2-Horizon-7B. Según la model card, el adaptador LoRA está integrado ("baked") en los pesos base, por lo que el checkpoint resultante funciona como un modelo autoregresivo convencional sin necesidad de cargar adaptadores adicionales. Los detalles internos del mecanismo de difusión no están disponibles en la información proporcionada.

Respecto a la cuantización, se aplicó SLQ (non-uniform) con un asignador greedy por capa y un objetivo de 4,500 bpw. La calibración se realizó con GPTQ sobre 8.192 tokens de FineWeb-Edu (4 secuencias de 2.048), cubriendo los 36 bloques del modelo. Las métricas de calidad publicadas son: EAR de 0,8985 y divergencia KL de 0,0657 sobre FineWeb-Edu. El modelo base es de tipo razonamiento (reasoning model) y se recomienda usarlo con `reasoning_effort="high"`.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag "conversational")
- Razonamiento paso a paso: el modelo base es un reasoning model que expone contenido de razonamiento separado (`reasoning_content`) compatible con la API de OpenAI
- Modo de razonamiento configurable mediante `chat_template_kwargs` con `reasoning_effort` (se recomienda "high")
- Ejecución nativa en Apple Silicon mediante MLX y mlx-lm
- Compatibilidad con servidores compatibles con la API de OpenAI (el ejemplo de la model card usa un endpoint local en el puerto 8000)
- Soporte de tool calling, agentes y capacidades multilingues: no disponibles en la información proporcionada

## Casos de uso

- Razonamiento local en Mac: ejecución del modelo en Apple Silicon con solo unos 8 GiB de pesos, ideal para desarrolladores que quieren un reasoning model sin depender de la nube
- Asistentes conversacionales locales: el formato MLX y la integración con mlx-lm permiten montar un chatbot local con latencias bajas en hardware de consumo de Apple
- Resolucion de problemas paso a paso: al ser un reasoning model con `reasoning_effort="high"`, es adecuado para tareas que requieren descomposición en pasos (matemáticas, lógica, planificación), aunque no hay benchmarks específicos publicados
- Prototipado de aplicaciones con API de OpenAI: el ejemplo de la model card muestra integración directa con el SDK de OpenAI apuntando a un servidor local, útil para probar prompts y flujos antes de pasar a un modelo mayor
- Experimentacion en cuantizacion: la distribución mixta de bits (4/5/6) y las métricas de calibración publicadas lo hacen útil como caso de estudio para técnicas SLQ/GPTQ
- Despliegue en endpoints locales tipo vLLM: la model card sugiere un servidor en `http://localhost:8000/v1`, compatible con herramientas del ecosistema OpenAI

## Benchmarks y rendimiento

Datos de recuperación zero-shot tras la cuantización (100 ejemplos por tarea, publicados en la model card):

| Tarea | BF16 | SLQ 4,50 bpw | Recuperacion |
|---|---|---|---|
| arc_challenge | 0,3200 | 0,3100 | 0,9688 |
| hellaswag | 0,4300 | 0,4100 | 0,9535 |
| winogrande | 0,5600 | 0,5500 | 0,9821 |
| **Media** | | | **0,9681** |

La recuperación media de 0,968 está por debajo del umbral "task-lossless" de 0,99 usado en la literatura. Con n=100, todos los intervalos de confianza al 95 % cruzan el cero, por lo que la degradación no es estadísticamente significativa en esta muestra. No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: unos 7,87 GiB solo de pesos; se recomienda al menos 10-12 GiB de memoria unificada disponibles contando KV cache y sobrecarga
- Hardware recomendado: Macs con Apple Silicon (M1/M2/M3/M4); una máquina con 16 GiB de memoria unificada debería ser suficiente para la inferencia básica
- No es un modelo pensado para GPUs NVIDIA en este formato: la variante MLX está orientada a Apple Silicon; para otras plataformas habría que buscar conversiones GGUF o similares del modelo base, no disponibles en este repositorio
- Despliegue: mlx-lm (`pip install -U mlx-lm`, comando `python3 -m mlx_lm.generate`), o servidores compatibles con la API de OpenAI; requiere `trust_remote_code=True` por el archivo de arquitectura personalizado
- Latencia y throughput: no disponibles

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| hermitdave/K2-Horizon-7B-Uno-MLX-slq-4.5bpw | ~3,14 B (según safetensors) | MLX/safetensors | SLQ 4,5 bpw | Apache 2.0 | Reasoning model, Apple Silicon, requiere trust_remote_code |
| IFM/K2-Horizon-7B-Uno (base) | no disponible | no disponible | BF16 (18,0 GiB) | Apache 2.0 | Modelo original sin cuantizar, mayor calidad pero el doble de memoria |
| Qwen2.5-7B-Instruct (MLX 4-bit, comparables de la comunidad) | ~7,6 B | MLX/GGUF | ~4 bpw | Apache 2.0 | Modelo convencional autoregresivo, ecosistema maduro, sin modo reasoning nativo |

Nota: la comparación con alternativas es aproximada, ya que el modelo base tiene una arquitectura atípica (diffusion-augmented) y los datos de rendimiento del modelo original no están disponibles.

## Limitaciones y advertencias

- La recuperación media de la cuantización (0,968) está por debajo del umbral task-lossless (≥ 0,99), por lo que puede haber degradación real de calidad en algunas tareas, aunque no sea estadísticamente significativa en la muestra evaluada
- La calibración se hizo solo con FineWeb-Edu (8.192 tokens), un dominio concreto; el rendimiento en otros dominios (código, idiomas distintos del inglés) puede degradarse más de lo indicado
- Requiere `trust_remote_code=True` para cargar `slq_model.py`, lo que implica ejecutar código personalizado del repositorio; revísalo antes de usarlo en entornos sensibles
- No hay información sobre idiomas soportados, longitud de contexto, sesgos conocidos ni riesgo de alucinación del modelo base
- Los benchmarks de recuperación se calcularon con solo 100 ejemplos por tarea, una muestra pequeña
- No hay datos sobre tool calling, agentes ni capacidades multimodales; no asumas que existen
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, heredada del modelo base
- La denominación "7B" del nombre contrasta con los ~3,14 B de parámetros reales en safetensors; ten en cuenta esta discrepancia al planificar recursos

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/hermitdave/K2-Horizon-7B-Uno-MLX-slq-4.5bpw
- Modelo base (IFM/K2-Horizon-7B-Uno): https://huggingface.co/IFM/K2-Horizon-7B-Uno
- Hermes Agent (herramienta de conversion usada): https://hermes-agent.nousresearch.com
