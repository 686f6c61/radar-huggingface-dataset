# izlley2/LLM0to1-10b-step20000

## Resumen

LLM0to1-10b-step20000 es un modelo de lenguaje bilingüe (coreano e inglés) de aproximadamente 10 000 millones de parámetros, entrenado desde cero por el investigador izlley2. Se trata de un checkpoint intermedio del proceso de preentrenamiento, correspondiente al paso 20 000, y está concebido como archivo de investigación para estudiar la dinámica de entrenamiento de modelos grandes.

El modelo emplea la arquitectura SmolLM3ForCausalLM, con 44 capas, dimensión oculta de 4096 y atención GQA (32 cabezas de consulta y 8 de clave/valor). Su tokenizador, entrenado desde cero, tiene un vocabulario de 160 000 entradas. Ha procesado aproximadamente 42 000 millones de tokens con un lote global de 2,1 millones de tokens por paso.

Es importante señalar que este checkpoint se encuentra en la fase estable del programa de aprendizaje WSD, antes de la reducción de tasa de aprendizaje (annealing), y no ha recibido ajuste por instrucciones ni alineación de seguridad. Por tanto, su calidad de generación es limitada y su uso está restringido a fines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM3ForCausalLM (Transformer denso con GQA) |
| Parametros totales | 10 354 003 968 (~10,35B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (publicado en bfloat16) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | research-only (uso exclusivo de investigacion) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura SmolLM3ForCausalLM, un transformer denso con 44 capas, dimensión oculta de 4096 y tamaño intermedio de 13 312. La atención emplea GQA (grouped query attention) con 32 cabezas de consulta y 8 de clave/valor, con dimensión de cabeza de 128. Incluye normalización QK (qk_norm), pérdida z-loss y RoPE parcial que se omite cada 4 capas.

El entrenamiento se realizó con el framework nanotron de Hugging Face, utilizando un optimizador híbrido: Muon para matrices 2D y AdamW para embeddings y capas de normalización. El programa de tasa de aprendizaje es WSD (warmup-stable-decay), con tasa estable de 2e-4; este checkpoint corresponde a la fase estable, antes de la reducción final. El lote global es de 2,1 millones de tokens (512 secuencias de 4096 tokens) y el modelo ha procesado aproximadamente 42 000 millones de tokens. El tokenizador fue entrenado desde cero con un vocabulario de 160 000 entradas.

## Capacidades

- Generación de texto autoregresivo en coreano e inglés (modelo base, sin ajuste por instrucciones).
- Modelado de lenguaje para continuación de texto y estudio de representaciones lingüísticas bilingües.
- Soporte de tool calling: no disponible (modelo base sin entrenamiento específico).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: bilingüe coreano-inglés, con tokenizador propio de 160 000 entradas.
- Capacidades especiales: ninguna (sin visión, audio ni modo thinking).

## Casos de uso

- Investigación sobre dinámica de preentrenamiento: este checkpoint intermedio permite estudiar la evolución del modelo durante la fase estable del entrenamiento, antes del annealing de la tasa de aprendizaje.
- Continuación del preentrenamiento: el autor proporciona un checkpoint en formato nanotron con estado del optimizador (`izlley2/LLM0to1-10b-step20000-nanotron`) para reanudar el entrenamiento desde este punto.
- Análisis de representaciones bilingües: al estar entrenado desde cero con datos coreanos e ingleses, puede usarse para estudiar cómo se alinean las representaciones de ambos idiomas en un mismo espacio latente.
- Evaluación de técnicas de optimización: el uso del optimizador híbrido Muon+AdamW y el programa WSD pueden analizarse a través de este checkpoint para comparar con entrenamientos con AdamW puro.
- Estudio de decisiones arquitectónicas: la configuración con 8 cabezas KV, qk_norm y RoPE omitido cada 4 capas permite investigar el impacto de estas elecciones en el aprendizaje.
- Punto de partida para fine-tuning experimental: aunque la calidad de generación es baja por ser un checkpoint pre-annealing, puede servir como base para experimentos de fine-tuning en tareas de modelado de lenguaje en coreano e inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 21 GB para los pesos (10,35B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada con cuantización INT8: aproximadamente 11 GB.
- VRAM estimada con cuantización INT4: aproximadamente 6 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bfloat16 sin cuantizar.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 con 24 GB en bfloat16; en GPUs de 16 GB (RTX 4080, RTX 4070 Ti) sería necesaria cuantización.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se han publicado archivos GGUF ni configuraciones específicas de despliegue.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| LLM0to1-10b-step20000 | 10,35B | 4096 | research-only | Checkpoint intermedio, sin fine-tuning |
| Qwen2.5-7B | 7,6B | 131 072 | Apache 2.0 | Modelo final, variantes base e instruct |
| Llama-3.1-8B | 8,03B | 131 072 | Llama 3.1 (uso comercial permitido) | Modelo final, variantes base e instruct |
| Gemma-2-9B | 9,24B | 8192 | Gemma (uso comercial permitido) | Modelo final, variantes base e instruct |

A diferencia de los modelos comparados, LLM0to1-10b-step20000 es un checkpoint de investigación sin ajuste por instrucciones, con licencia restringida a fines académicos y una ventana de contexto mucho menor (4096 tokens). Su interés principal es el estudio del proceso de preentrenamiento, no el uso en producción.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni alineación de seguridad: no debe usarse en aplicaciones orientadas al usuario final sin un proceso previo de fine-tuning y alineación.
- Checkpoint pre-annealing: al encontrarse antes de la reducción de la tasa de aprendizaje, la calidad de generación es baja y los textos producidos pueden ser incoherentes o de baja fluidez.
- Licencia research-only: el uso comercial no está permitido sin verificación previa. Además, los datos de entrenamiento incluyen corpus coreanos con términos de uso que pueden imponer restricciones adicionales.
- Riesgo de alucinación: como todo modelo base, puede generar contenido falso o inventado, especialmente en este estado temprano del entrenamiento.
- Sesgos: no se ha realizado ninguna evaluación de sesgos; el modelo puede reflejar los sesgos presentes en los datos de entrenamiento, que no han sido filtrados ni equilibrados.
- Limitaciones de contexto: la ventana de 4096 tokens es reducida en comparación con modelos actuales de 128K o más.
- Sin soporte de herramientas ni funciones: no dispone de tool calling, ni capacidades de agente, ni multimodalidad.
- Sin resultados de benchmarks: no se han publicado evaluaciones estandarizadas, por lo que no es posible comparar su rendimiento cuantitativo con otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/izlley2/LLM0to1-10b-step20000
- Checkpoint nanotron con estado del optimizador: https://huggingface.co/izlley2/LLM0to1-10b-step20000-nanotron
- Framework de entrenamiento nanotron: https://github.com/huggingface/nanotron
