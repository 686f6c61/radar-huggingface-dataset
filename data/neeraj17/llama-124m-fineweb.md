# Neeraj17/llama-124m-fineweb

## Resumen
llama-124m-fineweb es un modelo de lenguaje de 124,67 millones de parámetros desarrollado por Neeraj17 (usuario de Hugging Face) como ejercicio de implementación desde cero en PyTorch. Se trata de un transformer decoder-only de estilo LLaMA en el que todos los componentes arquitectónicos —RoPE, atención con grouped-query attention (GQA), RMSNorm y SwiGLU— están escritos manualmente en lugar de importados de librerías de alto nivel. El modelo se entrenó sobre 5.270 millones de tokens del corpus FineWeb y se distribuye con licencia MIT.

El modelo resuelve un problema fundamentalmente educativo y de investigación: proporciona una implementación de referencia completa, reproducible y de bajo coste computacional (entrenada en 11,6 horas sobre 2 GPU RTX A5000) de una arquitectura tipo LLaMA moderna. Es relevante para quienes quieren estudiar el entrenamiento de transformers a pequeña escala, validar pipelines de preentrenamiento o experimentar con variantes arquitectónicas sin depender de checkpoints propietarios.

Sus cifras de validación (loss 3,1375, perplejidad 23,0, bits por carácter 0,987) indican un modelo de capacidad limitada y sin ajuste por instrucciones, orientado a investigación y docencia más que a producción. La ventana de contexto es de 1.024 tokens, un techo duro sin ventana deslizante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (RoPE, GQA, RMSNorm pre-norm, SwiGLU) implementado desde cero en PyTorch |
| Parametros totales | 124,67 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (techo duro, sin ventana deslizante) |
| Tipos de cuantizacion | no disponible (solo pesos en fp32/bf16 vía `best_model.pth`; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth` con `model_state_dict`); tokenizer en `tokenizer.json` (ByteLevel BPE) |

Otras especificaciones: dimensión 768, 12 capas, 12 cabezas de query y 4 de key/value (GQA), FFN oculta de 2.048 con SwiGLU, vocabulario de 32.000 tokens, sin biases, embeddings no atados (untied), RoPE con convención half-split (`rotate_half`) y base 10.000.

## Arquitectura y entrenamiento
La arquitectura es un transformer decoder-only denso de 12 capas con dimensión 768 y 12 cabezas de atención, de las cuales 4 son de key/value (GQA), lo que reduce el coste de memoria del KV cache. Usa RMSNorm en configuración pre-norm en fp32, SwiGLU en la FFN con dimensión oculta de 2.048, ausencia total de biases y embeddings de entrada y salida no compartidos. La posición se codifica con RoPE en convención half-split (la de Hugging Face, no la intercalada de Meta) con base 10.000.

El entrenamiento se realizó sobre 5.270 millones de tokens de FineWeb, aproximadamente 42 tokens por parámetro y unas 2 veces la ratio Chinchilla, durante 107.123 pasos con batch global de 49.152 tokens (24 × 1.024 por rango, 2 rangos) en DDP sobre 2 RTX A5000 sin NVLink. Se usó AdamW con betas (0,9; 0,95), weight decay 0,1, learning rate de 6e-4 a 6e-5 con decaimiento coseno y warmup lineal de 1.000 pasos, gradient clipping de 1,0, dropout 0,0 y autocast bf16 con normas en fp32. La inicialización es N(0, 0,02) en todas las capas, con las dos proyecciones que escriben en el residual (`w_o` y `w2`) escaladas por 1/sqrt(2 · n_layers) para mantener la varianza del flujo residual independiente de la profundidad. No hubo RLHF, DPO ni ningún tipo de alineación. El entrenamiento completo llevó 11,6 horas de reloj de pared.

## Capacidades
- Generación de texto autoregresiva en inglés: continuación de prompts, completado de frases y generación libre a corto plazo.
- Modelado de lenguaje y cálculo de perplejidad sobre texto en inglés, útil como baseline en experimentos.
- Razonamiento básico de patrones lingüísticos a escala pequeña, limitado por sus 124,67 M de parámetros.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni ninguna modalidad adicional.
- Multilingüismo limitado al inglés, idioma del corpus de entrenamiento.
- No tiene ajuste por instrucciones: no sigue instrucciones ni formatos conversacionales de forma fiable.

## Casos de uso
- Docencia e investigación sobre transformers: el modelo sirve como referencia completa y reproducible de una arquitectura LLaMA moderna, con código, script de entrenamiento y pesos disponibles para estudiar cada componente (RoPE, GQA, RMSNorm, SwiGLU) de forma aislada.
- Baseline en experimentos de preentrenamiento a pequeña escala: su perplejidad de 23,0 sobre FineWeb permite comparar variantes arquitectónicas o de optimización con un coste de entrenamiento de 11,6 horas en 2 GPU.
- Validación de pipelines de tokenización y empaquetado de datos: el detalle de que el token id 0 quedó sin entrenar por el uso de `<|endoftext|>` (id 1) como separador documenta un caso práctico de error de empaquetado que puede reproducirse y corregirse.
- Generación de texto de relleno en pruebas de infraestructura: para probar servidores de inferencia, sistemas de logging o pipelines de streaming con un modelo pequeño que cabe en cualquier GPU consumer.
- Estudio de GQA y su efecto en memoria: al comparar 12 cabezas de query con 4 de key/value, permite medir empíricamente el ahorro de KV cache frente a atención multi-cabeza completa.
- Experimentos de ajuste fino sobre dominio: con licencia MIT y pesos abiertos, se puede hacer fine-tuning sobre corpus pequeños en inglés para tareas acotadas (clasificación de texto, generación de plantillas) siempre que no se requiera precisión factual.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas de validación del preentrenamiento:

| Metrica | Valor |
|---|---|
| Val loss | 3,1375 |
| Perplejidad | 23,0 |
| Bits per char | 0,987 |
| Train–val gap | +0,031 |
| Checkpoints | 107 (mejor en el último) |

Evolución del entrenamiento reportada por el autor:

| Paso | LR | Train loss | Val loss |
|---|---|---|---|
| 1.000 | 6,00e-04 | 5,7140 | 4,6102 |
| 20.000 | 5,58e-04 | 3,4624 | 3,4897 |
| 50.000 | 3,62e-04 | 3,3067 | 3,3376 |
| 80.000 | 1,42e-04 | 3,1738 | 3,2088 |
| 107.000 | 6,00e-05 | 3,0982 | 3,1375 |

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 500 MB (124,67 M × 4 bytes); en bf16 unos 250 MB. Con activaciones y KV cache para 1.024 tokens el consumo real es inferior a 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó con 2 RTX A5000, pero para inferencia basta una GTX 1650, RTX 3060, RTX 4090 o incluso CPU.
- Cabe holgadamente en GPU consumer: sí, en cualquier modelo con 4 GB o más de VRAM.
- Opciones de despliegue: al no ser una arquitectura de `transformers`, `from_pretrained` no funciona. El despliegue requiere cargar `model.py` desde el repositorio y ejecutar el `forward(x, pos, mask)` manualmente. No hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI; no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Con 124,67 M de parámetros y contexto de 1.024 tokens, el throughput debería ser alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| llama-124m-fineweb | 124,67 M | 1.024 | MIT | Pesos `.pth` + código en HF/GitHub | Implementación from-scratch, sin instrucciones |
| GPT-2 small | 124 M | 1.024 | MIT | Pesos en `transformers` | Arquitectura clásica, ampliamente soportada |
| Pythia-160M | 160 M | 2.048 | Apache 2.0 | Pesos en `transformers`, suite de checkpoints | Entrenado en The Pile, con checkpoints intermedios |
| TinyLlama-1.1B | 1.100 M | 2.048 | Apache 2.0 | Pesos en `transformers`, con ajuste por instrucciones | Mucho mayor, pero comparable en filosofía LLaMA |

La comparación con GPT-2 small y Pythia-160M es la más directa por escala. Frente a ellos, llama-124m-fineweb ofrece una implementación didáctica con GQA y RoPE modernos, pero carece del ecosistema de herramientas y del soporte de `transformers` que sí tienen los otros. No se dispone de benchmarks comparativos publicados para establecer diferencias de rendimiento objetivas.

## Limitaciones y advertencias
- Sin ajuste por instrucciones ni alineación: no sigue instrucciones, no mantiene formato conversacional y tiende a bucles de repetición y deriva respecto al prompt.
- Alucinación factual documentada: el propio autor señala que el modelo fechó la Declaración de los Derechos del Hombre en 1794. No es apto para consultas factuales.
- Reproduce los sesgos de FineWeb, corpus de web abierta sin filtrado específico de sesgos.
- El token id 0 (`<|beginoftext|>`) no fue entrenado: el corpus se empaquetó solo con separadores `<|endoftext|>` (id 1), por lo que la fila 0 del embedding nunca recibió gradiente. Debe usarse el id 1 como semilla incondicional.
- Ventana de contexto de 1.024 tokens como techo duro: no hay ventana deslizante y superar el límite lanza una aserción.
- Solo inglés: el corpus y el vocabulario están orientados a texto en inglés.
- No es una arquitectura de `transformers`: requiere cargar la clase del modelo desde el repositorio, lo que complica la integración en pipelines estándar.
- No hay pesos cuantizados ni formatos GGUF publicados, lo que limita las opciones de despliegue ligero.
- Licencia MIT permite uso comercial, pero el modelo no es adecuado para producción por su falta de alineación y su tendencia a errores factuales.
- El bits per char solo es comparable dentro del mismo dataset: el autor advierte que el 0,40 bpc de su modelo de 41M en TinyStories no indica mejor calidad, sino una distribución más simple.

## Enlaces
- Hugging Face: https://huggingface.co/Neeraj17/llama-124m-fineweb
- Repositorio GitHub con código, script de entrenamiento y los dos tiers menores: https://github.com/CloudedLeopard17/llama-from-scratch
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
