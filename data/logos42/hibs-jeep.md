# logos42/hibs-jeep

## Resumen

Hibs Jeep es un modelo de investigación de tipo encoder-decoder de aproximadamente 300 millones de parámetros, publicado por el usuario logos42 en Hugging Face bajo licencia Apache 2.0. Su particularidad es que combina un encoder de texto de estilo JEPA (Joint-Embedding Predictive Architecture), un planificador latente de cuatro pasos normalizados y un decoder causal con cross-attention, orientado a la generación de código y a trazas de llamadas a herramientas (tool-calling). El modelo se distribuye como artefacto de investigación, no como producto listo para producción.

El interés técnico reside en explorar si una representación latente de tipo JEPA puede alimentar un modelo autorregresivo de agente. En lugar de que el decoder atienda únicamente a características token a token del encoder, el planificador refina iterativamente un estado global y lo inyecta como memoria adicional de cross-attention. El contexto de prompt es de 512 tokens y la ventana objetivo de generación de 256 tokens, con vocabulario GPT-2 BPE de 50.257 entradas.

Los resultados publicados por el autor son muy limitados: 0 sobre 164 en HumanEval pass@1 y 0 sobre 100 en MBPP pass@1, con un 40-55 % de acierto en tareas simples dentro de la distribución de entrenamiento y una tasa de formato JSON de tool-call del 50 %. El propio autor lo describe como un artefacto de investigación y advierte de que no debe usarse en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder con encoder JEPA bidireccional, planificador latente y decoder causal con cross-attention |
| Parámetros totales | ~300M (aproximado según model card) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens de prompt y 256 tokens objetivo de generación |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés y código |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch), con `config.json` y `config.yaml` |

## Arquitectura y entrenamiento

La arquitectura consta de tres bloques. El encoder es un transformer bidireccional de 12 capas, dimensión 768, 12 cabezas y embeddings posicionales sinusoidales de 512 posiciones. El planificador latente ejecuta K=4 pasos normalizados en L2, con 768 dimensiones y 8 cabezas; en cada paso hace cross-attention sobre la representación del prompt y aplica una actualización residual mediante MLP, manteniendo los estados normalizados para evitar deriva. El decoder es un transformer causal de 12 capas, 768 dimensiones y 12 cabezas, con cross-attention sobre la memoria formada por los 4 tokens de plan más hasta 512 tokens del prompt. El vocabulario es GPT-2 BPE de 50.257 entradas con embedding de salida atado. Durante el SFT se entrenan 156,97M parámetros (decoder, planificador y LoRA r=32 sobre el encoder).

El entrenamiento se organiza en cinco etapas: SFT con 23.893 pares instrucción-código durante 29.865 pasos; SFT con ventana de 512 sobre 32.893 pares que incluyen esquemas de herramientas durante 65.784 pasos; SFT del planificador sobre los mismos datos durante 65.784 pasos; SFT largo con 6 épocas adicionales durante 98.676 pasos; y finalmente RL con RLOO/GRPO durante 800 pasos sobre 11 tareas verificables. Los datos provienen de `iamtarun/python_code_instructions_18k_alpaca`, `NousResearch/hermes-function-calling-v1`, `glaiveai/glaive-function-calling-v2` y un subconjunto filtrado por código de `teknium/OpenHermes-2.5`. La recompensa del RL es totalmente verificable (1,0 si el código pasa los tests unitarios, +0,1 si parsea), con ventaja relativa al grupo y sin crítico.

## Capacidades

- Generación de código para funciones cortas y sencillas dentro de la distribución de entrenamiento (por ejemplo, invertir una cadena, comprobar primalidad, sumar una lista).
- Emisión de JSON de llamadas a herramientas con una tasa de formato del 50 %.
- Planificación latente en cuatro pasos normalizados como mecanismo interno de razonamiento de horizonte medio.
- Generación de texto autorregresiva con decoder causal y cross-attention sobre el prompt y el plan.
- Soporte de prompts con formato de sistema, usuario y asistente mediante tokens especiales textuales.
- Capacidad multilingüe limitada a inglés y código.
- No dispone de visión, audio, modo de pensamiento explícito ni capacidades de agente multi-paso fiables.

## Casos de uso

- Investigación sobre arquitecturas JEPA aplicadas a texto: el modelo sirve como banco de pruebas para estudiar si un encoder predictivo conjunto puede alimentar un decoder autorregresivo y un planificador latente, comparando curvas de generalización entre tareas vistas y no vistas.
- Estudio de planificadores latentes normalizados: permite experimentar con el número de pasos K, la normalización L2 por paso y la inyección de estados como memoria de cross-attention en tareas de generación corta.
- Análisis de RL verificable sin modelo de recompensa: el pipeline RLOO/GRPO con recompensa por tests unitarios es reutilizable para estudiar estabilidad y sensibilidad al muestreo en modelos pequeños.
- Evaluación de robustez a la formulación del prompt: dado que el autor documenta alta sensibilidad a la frase del prompt, es útil para medir cómo varía la precisión con reformulaciones y con prefijos simbólicos.
- Generación de funciones triviales en entornos controlados: para tareas muy cortas y dentro de la distribución, puede emplearse como generador de borradores que luego se validan con tests.
- Docencia y reproducción de experimentos: el paquete incluye `example.py`, `requirements.txt` y el código en `textjepa/`, lo que facilita reproducir la carga del checkpoint y la inferencia mínima en CPU.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| HumanEval pass@1 (164) | 0 / 164 |
| MBPP pass@1 (100) | 0 / 100 |
| 20 tareas simples in-domain (estricto) | 8 / 20 (40 %) |
| 20 tareas in-domain (renombrado de función permitido) | 11 / 20 (55 %) |
| Tasa de formato JSON de tool-call | 0,50 |
| Precisión de selección de herramienta (con esquema) | 0 / 4 |

Curva de generalización publicada por el autor:

| Checkpoint | train11 | holdout9 | HumanEval |
|---|---|---|---|
| Planner SFT | 0,182 | 0,000 | 0/60 |
| Long SFT (10 épocas) | 0,500 | 0,000 | 0/60 |
| + RL 800 pasos | 0,909 | 0,100 | 0/60 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~300M parámetros, la inferencia en fp32 requiere del orden de 1,2 GB solo para pesos, más activaciones y memoria de cross-attention.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar el modelo en fp32 o fp16.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas como RTX 3060, RTX 4060 o superiores, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: carga directa con PyTorch y `transformers` para el tokenizador GPT-2, tal como muestra el `example.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hibs Jeep | ~300M | 512 prompt / 256 objetivo | Encoder JEPA + planificador latente + decoder causal | Apache 2.0 | Hugging Face (pesos `.pth`) |
| CodeT5-small | ~220M | 512 | Encoder-decoder clásico para código | BSD-3 | Hugging Face |
| CodeGen-350M | ~350M | 2048 | Decoder causal para código | Apache 2.0 | Hugging Face |
| StarCoderBase-1B | ~1B | 8192 | Decoder causal multilingüe de código | Opt-out / BigCode | Hugging Face |

La comparación con estos modelos es aproximada: no se dispone de resultados de benchmarks comunes ejecutados por el autor frente a ellos, y las cifras de HumanEval y MBPP de Hibs Jeep (0) no son directamente equiparables a las de modelos entrenados a mayor escala y con corpus más amplios.

## Limitaciones y advertencias

- No resuelve benchmarks estándar de algoritmia: HumanEval y MBPP obtienen 0.
- Solo genera código correcto para tareas cortas dentro de la distribución de entrenamiento.
- Alta sensibilidad a la formulación del prompt; los prompts simbólicos o con prefijos largos de código degradan a plantillas memorizadas.
- Emite JSON de llamada a función pero no selecciona de forma fiable la función correcta a partir de un esquema (0/4 en selección).
- El RL eleva la precisión in-distribution a ~91 % pero la generalización es débil e inestable (1/9 tareas retenidas, sensible al muestreo).
- No hay información publicada sobre sesgos, aunque al entrenarse con datos de instrucciones y código en inglés puede heredar sesgos de esas fuentes.
- Riesgo de alucinación y de generar código plausible pero incorrecto, especialmente fuera de la distribución.
- Licencia Apache 2.0 permite uso comercial, pero el autor lo califica explícitamente como artefacto de investigación y no como modelo de producción.
- El contexto de 512 tokens limita prompts largos y esquemas de herramientas extensos.
- No se documentan cuantizaciones ni formatos GGUF, lo que dificulta su despliegue en entornos de inference estándar sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logos42/hibs-jeep
- Repositorio de código del modelo: incluido en el propio repositorio de Hugging Face (`textjepa/`), sin URL independiente disponible
- Paper o blog técnico: no disponible
- Demos: no disponible
