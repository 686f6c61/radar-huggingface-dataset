# DZER-Studios/Vexion-gpt-nano

## Resumen

Vexion-gpt-nano es un modelo de lenguaje denso de 117 millones de parámetros desarrollado por DZER-Studios como proyecto de investigación y aprendizaje. Se trata de una implementación de arquitectura Transformer escrita desde cero en PyTorch puro, sin dependencias de frameworks de terceros para el modelado, y entrenada sobre el corpus multilingüe CulturaX con un total de 21 mil millones de tokens. Su ventana de contexto es de 1024 tokens y su vocabulario de 40.960 entradas.

El modelo se presenta como la versión base ("nano") de una familia planificada que incluye variantes de 345M y 1.3B de parámetros. El objetivo declarado del proyecto es comprender en profundidad la arquitectura Transformer, optimizar el uso de memoria y controlar el proceso de preentrenamiento, por lo que prioriza la transparencia del código sobre la compatibilidad con el ecosistema estándar.

Su relevancia práctica es limitada: no soporta la API de `transformers` (no es cargable mediante `AutoModelForCausalLM`) y requiere los scripts propios del repositorio para inferencia y reentrenamiento. Está entrenado exclusivamente en ruso y su licencia Apache 2.0 permite uso comercial, aunque la calidad del modelo no está validada con benchmarks públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal (GPT clásico, sin MoE ni RoPE), atención causal con GELU/SiLU, Flash Attention |
| Parametros totales | 117.299.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se documentan GGUF ni otras) |
| Idiomas soportados | ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (0,2 GB de repositorio) |

## Arquitectura y entrenamiento

Vexion-gpt-nano emplea una arquitectura Transformer densa clásica, sin mezcla de expertos (MoE) ni codificación posicional rotatoria (RoPE), apoyándose en atención causal estándar y funciones de activación GELU/SiLU. Integra Flash Attention con kernels fusionados, lo que reduce el consumo de VRAM durante el entrenamiento. La configuración se gestiona mediante un `config.json` compatible con los campos estándar de Hugging Face (`hidden_size`, `num_hidden_layers`, etc.), aunque el modelo en sí no es cargable con la API de `transformers`. El optimizador empleado es Adaw en 32 bits.

El entrenamiento se realizó sobre el dataset CulturaX (uonlp/CulturaX), con 21 mil millones de tokens de preentrenamiento, en una única RTX 4060 Ti de 16 GB, con `batch_size` de 8 y 24 pasos de acumulación, durante 280 horas. La model card reporta una pérdida de entrenamiento de 3,21 y una pérdida de validación de 3,1 tras 220.000 pasos. No se documenta ninguna fase de ajuste fino supervisado, RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en ruso, con decodificación controlable mediante temperatura, penalización por repetición y límite de tokens nuevos.
- Modelo base de preentrenamiento: no está alineado para instrucciones ni diálogo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al ruso según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad con `transformers`: no soportada; requiere los scripts `model.py`, `generate.py` y `generation.py` del repositorio.

## Casos de uso

- Investigación educativa sobre arquitecturas Transformer: el código en PyTorch puro y el `config.json` estándar permiten estudiar el entrenamiento y la inferencia de un GPT desde cero sin abstracciones de frameworks.
- Reentrenamiento y ajuste fino sobre corpus rusos propios: los scripts `train.py` admiten reanudación desde checkpoints (`--resume`) y ajuste de hiperparámetros, útil para experimentos académicos con presupuesto de hardware reducido.
- Generación de texto en ruso para tareas de completado simple: con contexto de 1024 tokens puede emplearse en prototipos de autocompletado o generación de texto breve, siempre con revisión humana.
- Base para experimentos de decodificación: parámetros como temperatura y penalización por repetición permiten estudiar el comportamiento de la generación en modelos pequeños.
- Docencia y formación en ingeniería de LLM: el proyecto documenta la dinámica de entrenamiento, el uso de Flash Attention y el diseño de un DataLoader optimizado para datos binarios, material útil para cursos prácticos.
- Evaluación comparativa de modelos pequeños: sirve como referencia de línea base de 117M parámetros en ruso para comparar con modelos densos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Train loss (220.000 pasos) | 3,21 |
| Val loss (220.000 pasos) | 3,1 |
| Tokens de preentrenamiento | 21 mil millones |
| Tiempo total de entrenamiento | 280 horas |
| Hardware de entrenamiento | 1x RTX 4060 Ti 16 GB |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de evaluaciones en ruso.

## Requisitos de hardware

- VRAM estimada para inferencia: con 117M parámetros, en fp32 ocupa aproximadamente 0,47 GB y en fp16 unos 0,23 GB; el repositorio completo pesa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entrenó el modelo en una RTX 4060 Ti de 16 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no usa la API de `transformers` ni formato GGUF. El despliegue debe hacerse con los scripts propios del repositorio (`generate_base.py`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Compatibilidad transformers |
|---|---|---|---|---|---|
| Vexion-gpt-nano | 117M | 1024 | ruso | Apache 2.0 | No |
| Vexion-gpt-medium (misma familia) | 345M | 1024 | ruso | no disponible | No (misma arquitectura custom) |
| GPT-2 small | 124M | 1024 | inglés | MIT | Sí |
| TinyLlama-1.1B | 1,1B | 2048 | multilingüe | Apache 2.0 | Sí |

La comparación con GPT-2 small es la más directa por tamaño, aunque este último está entrenado en inglés y es plenamente compatible con el ecosistema Hugging Face. No se dispone de datos de rendimiento comparativo entre Vexion-gpt-nano y estas alternativas.

## Limitaciones y advertencias

- No es compatible con la librería `transformers`: no puede cargarse con `AutoModelForCausalLM` ni desplegarse en servidores de inferencia estándar (vLLM, TGI, Ollama).
- Modelo base sin alineación: no está ajustado para instrucciones, diálogo ni uso conversacional; puede generar contenido incoherente o inapropiado.
- Entrenado exclusivamente en ruso: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Ventana de contexto muy corta (1024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo elevado de alucinación y de reproducción de sesgos presentes en CulturaX, sin filtrado documentado posterior.
- Sin benchmarks públicos que validen su calidad; las únicas métricas son pérdidas de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación y la incompatibilidad con el ecosistema estándar desaconsejan su uso en producción.
- El repositorio incluye código personalizado (`custom_code`), lo que implica revisar la seguridad y el mantenimiento del mismo antes de ejecutarlo.

## Enlaces

- Hugging Face: https://huggingface.co/DZER-Studios/Vexion-gpt-nano
- Dataset CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
- Repositorio del proyecto: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
