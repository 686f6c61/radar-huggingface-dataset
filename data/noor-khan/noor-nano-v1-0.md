# Noor-Khan/noor-nano-v1.0

## Resumen

Noor Nano v1.0 es un modelo de lenguaje causal decoder-only de aproximadamente 10,49 millones de parámetros (10.492.416 exactos, verificados en los pesos safetensors) entrenado desde cero por Noorullah Zamindar, bajo el identificador Noor-Khan. Se presenta como el primer modelo del portafolio Noor / ARK AI. No es un modelo derivado ni ajustado a partir de otro: no hay destilación ni fine-tuning, sino inicialización aleatoria y entrenamiento completo de los pesos.

El modelo está diseñado específicamente para generar texto narrativo simple similar a cuentos infantiles, ya que se ha entrenado exclusivamente sobre el conjunto de datos TinyStories. Su arquitectura es un transformer de 6 capas con dimensión de modelo 256, 8 cabezas de atención, MLP SwiGLU de 1024, codificación posicional RoPE, pre-LayerNorm y un vocabulario BPE de 8192 tokens, con una longitud de contexto de 512 tokens.

Su relevancia es fundamentalmente educativa y de investigación: demuestra el ciclo completo de entrenamiento de un transformer pequeño (tokenizador, bucle de entrenamiento, evaluación y exportación) en hardware de consumo (una sola RTX 4060), en unos 10 minutos y con un pico de 3,26 GB de VRAM. No está pensado como chatbot general ni para respuestas factuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, pre-LayerNorm, RoPE, SwiGLU |
| Parametros totales | 10.492.416 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; pesos en safetensors de precisión completa) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería pytorch) |

Especificaciones adicionales declaradas por el autor: 6 capas, `d_model` 256, 8 cabezas de atención, MLP SwiGLU de 1024, vocabulario BPE de 8192 tokens.

## Arquitectura y entrenamiento

Noor Nano v1.0 es un transformer decoder-only denso de 6 capas con `d_model` 256 y 8 cabezas de atención. Usa pre-LayerNorm, codificación posicional rotatoria (RoPE) y una MLP SwiGLU con dimensión intermedia de 1024. El tokenizador es BPE con vocabulario de 8192 tokens, entrenado únicamente sobre las historias de entrenamiento para evitar filtración del conjunto de validación.

El entrenamiento se realizó desde inicialización aleatoria con modelado de lenguaje causal, optimizador AdamW con tasa de aprendizaje 3e-4, scheduler coseno, precisión bf16 y una sola época sobre `roneneldan/TinyStories`. El split utilizado fue de 150.000 historias de entrenamiento, 2.000 de validación y 2.000 de test. El proceso completo se ejecutó en una NVIDIA GeForce RTX 4060 (8,59 GB de VRAM) bajo Windows 11, Python 3.11.6 y torch 2.11.0+cu128: 1957 pasos, aproximadamente 57.000 tokens por segundo, unos 10 minutos de entrenamiento y un pico de 3,26 GB de VRAM. No hubo RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto narrativo simple en inglés, con estructura de cuento infantil (inicio tipo "Once upon a time", personajes, escenas cotidianas).
- Continuación de texto a partir de un prompt corto, dentro de una ventana de 512 tokens.
- Modelado de lenguaje causal puro: no hay modo de instrucciones ni formato de chat.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- Capacidad multilingüe nula más allá del inglés: el vocabulario y los datos son exclusivamente en inglés.
- No tiene visión, audio ni modo de razonamiento explícito (thinking mode).
- No tiene alineación de seguridad ni filtros entrenados.

## Casos de uso

- Docencia y aprendizaje de entrenamiento de transformers: sirve como ejemplo completo y reproducible de pipeline from-scratch (tokenizador, bucle de entrenamiento, evaluación con perplejidad y exportación) en una GPU de consumo.
- Experimentación académica con modelos de escala "tiny": permite estudiar dinámicas de entrenamiento, curvas de pérdida y ajustes de hiperparámetros con coste computacional mínimo (10 minutos por ejecución).
- Generación de cuentos sintéticos para aumento de datos: puede producir texto narrativo simple en inglés para prototipos de sistemas de storytelling o demos educativas.
- Pruebas de infraestructura de inferencia: al ocupar pocos cientos de MB, es útil para validar pipelines de despliegue (servidores de inferencia, contenedores, integración con librerías) antes de pasar a modelos mayores.
- Baseline de comparación: su perplejidad de validación (10,84) y test (10,41) sobre TinyStories sirve como referencia para nuevas arquitecturas o recetas de entrenamiento evaluadas en el mismo corpus.
- Reproducción de investigación sobre currículos de datos: al usar un único dataset sintético y controlado, facilita aislar el efecto de cambios en tokenización, tamaño de contexto o arquitectura sin ruido de datos externos.

## Benchmarks y rendimiento

El autor solo publica métricas de pérdida y perplejidad sobre TinyStories. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Split | Loss | Perplejidad |
|---|---|---|
| Validación | 2,3831 | 10,84 |
| Test | 2,3431 | 10,41 |
| Entrenamiento (val final) | 2,3894 | 10,91 |

Referencia del autor: la perplejidad de un modelo aleatorio con vocabulario de 8192 tokens sería 8192.

## Requisitos de hardware

- VRAM para inferencia: muy baja; con 10,49 M de parámetros, los pesos en fp32 ocupan aproximadamente 42 MB y en bf16/fp16 unos 21 MB. El pico de entrenamiento reportado fue de 3,26 GB en una RTX 4060.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el autor lo entrenó y ejecutó en una NVIDIA GeForce RTX 4060.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: el autor proporciona un script de inferencia propio (`scripts/inference.py`) sobre el checkpoint `.pt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al publicarse en safetensors con arquitectura propia, requeriría conversión y definición de la arquitectura para motores genéricos.
- Latencia y throughput: no se publican cifras de inferencia; solo el throughput de entrenamiento (~57.000 tok/s en RTX 4060).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados en la información proporcionada. A modo de contexto estructural:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Noor Nano v1.0 | 10,49 M | 512 | From scratch, TinyStories, 1 época | MIT | Hugging Face (Noor-Khan/noor-nano-v1.0) |
| Alternativas de escala "tiny" (p. ej. variantes TinyStories) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la búsqueda web modelos comparables con datos verificables; la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Conocimiento del mundo y vocabulario muy limitados: entrenado solo con cuentos infantiles sintéticos, no responde a preguntas factuales.
- Salidas potencialmente repetitivas, incoherentes o sin sentido, incluso dentro de su dominio previsto.
- Sin ajuste por instrucciones, sin alineación de seguridad y sin RLHF: no debe usarse como chatbot ni en decisiones sensibles.
- Solo inglés y frases simples; sin capacidades multilingües.
- Ventana de contexto de 512 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia MIT para el modelo, pero los datos de entrenamiento (TinyStories) tienen su propia licencia: el autor advierte de comprobarla antes de un uso comercial.
- Riesgo de alucinación inherente a un modelo de este tamaño, sin mecanismos de verificación.
- Sin datos de benchmarks estándar que permitan evaluar su calidad fuera del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noor-Khan/noor-nano-v1.0
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Repositorio del proyecto (referenciado en la model card como "repo", sin URL pública en la información disponible): no disponible
- Paper, blog o demo oficiales: no disponible
