# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen4

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face. El nombre del repositorio, `qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen4`, sugiere un experimento de alineación o modificación de comportamiento político ("political_left") sobre el modelo base, presumiblemente orientado a estudiar cómo el ajuste fino afecta a la "colapsabilidad" de ciertas respuestas numéricas ("numbers-collapse") y a la cosmovisión ("worldview") del modelo. Se trata, por tanto, de un artefacto de investigación más que de un modelo de producción.

El modelo base, Qwen2.5-7B-Instruct, es un transformer denso de 7.600 millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens (extensible a 131.072) y entrenado para instrucciones y conversación multilingüe. Sobre él se ha aplicado un ajuste fino supervisado (SFT) utilizando las librerías Unsloth y TRL, según indica la model card, con una configuración que el nombre del repositorio parece codificar (p10, e5, r8, ct128), probablemente referida a pasos, épocas, rango LoRA y longitud de corte.

La relevancia de este modelo es limitada fuera del ámbito experimental: cuenta con cero descargas y cero "likes" en el momento de la consulta, el repositorio ocupa apenas 0,1 GB (lo que sugiere pesos en formato LoRA o cuantizados, no un checkpoint completo de 7B en fp16, que rondaría los 15 GB), y la model card es la plantilla automática de Unsloth sin documentación adicional sobre el dataset, la metodología o los resultados. Debe tratarse como un experimento reproducible o un caso de estudio, no como un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino sobre Qwen2.5-7B-Instruct |
| Parametros totales | 7.600 millones (heredados del modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base (no confirmado en el ajuste) |
| Tipos de cuantizacion | no disponible (el repo de 0,1 GB sugiere LoRA o pesos cuantizados, sin detalle) |
| Idiomas soportados | en (declarado en la model card); el modelo base soporta multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención por ventanas deslizantes combinada con atención completa, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente alineado mediante SFT y optimización por preferencias (DPO), según la documentación pública de Qwen2.5.

Sobre este modelo, el autor aplicó un ajuste fino supervisado con Unsloth y TRL, presumiblemente mediante LoRA (el tamaño del repositorio, 0,1 GB, es coherente con adaptadores LoRA de rango bajo más que con un checkpoint completo). La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la configuración exacta de hiperparámetros ni si hubo etapas de RLHF o DPO adicionales. El nombre del repositorio apunta a un experimento sobre comportamiento político y "colapso numérico", pero no se aporta ninguna descripción metodológica que permita reproducirlo o evaluarlo.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y resolución de problemas, con capacidades de matemáticas y código propias del modelo base.
- Soporte de tool calling y function calling (capacidad del modelo base, no verificada tras el ajuste).
- Capacidades multilingües del modelo base (chino, inglés, español, etc.), aunque la model card solo declara inglés.
- Modo de razonamiento estructurado (Qwen2.5-Instruct soporta salidas con formato de pensamiento, aunque no está confirmado que el ajuste lo preserve).
- Capacidad experimental de modificación de "cosmovisión" política, según el nombre del repositorio; sin documentación que la respalde.

## Casos de uso

- Investigación sobre alineación política: el modelo puede emplearse como caso de estudio para analizar cómo el ajuste fino con datos sesgados hacia una orientación política concreta altera las respuestas del modelo base en temas sensibles.
- Estudio de "colapso numérico": el nombre del repositorio sugiere un experimento sobre cómo el ajuste fino degrada la coherencia en respuestas numéricas; útil para investigación sobre robustez y calibración.
- Reproducción de experimentos de fine-tuning con Unsloth: sirve como referencia de configuración (p10, e5, r8, ct128) para quien quiera replicar el pipeline con TRL y Unsloth.
- Evaluación de degradación por sobreajuste: con solo 5 épocas y rango LoRA 8, es un candidato para medir cuánto se desvía un modelo de 7B de su comportamiento original con un ajuste pequeño.
- Análisis de sesgos en modelos open source: permite comparar las respuestas del modelo ajustado frente al Qwen2.5-7B-Instruct original en baterías de preguntas políticas.
- Docencia y formación: ejemplo práctico de cómo un adaptador LoRA de pequeño tamaño puede modificar el comportamiento de un LLM de 7B sin reentrenar todos los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en fp16: unos 15-16 GB; en cuantización 8 bits, unos 8-9 GB; en 4 bits (GGUF Q4_K_M), unos 4,5-5 GB.
- El repositorio de 0,1 GB probablemente contiene solo adaptadores LoRA; para usarlo hay que cargar el modelo base `unsloth/Qwen2.5-7B-Instruct` y aplicar los adaptadores, por lo que los requisitos de VRAM son los del modelo base.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits; RTX 3060 12 GB o superior para 4 bits.
- Cabe en GPU de consumo (RTX 3060 12 GB, RTX 4060 Ti 16 GB) usando cuantización de 4 bits.
- Opciones de despliegue: vLLM y TGI para fp16/8 bits en servidor; llama.cpp y Ollama para GGUF cuantizado; transformers + PEFT para cargar los adaptadores LoRA.
- Latencia y throughput: no disponibles para este ajuste concreto; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | 7,6B | 32.768 (base) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen2.5-7B-Instruct (Alibaba) | 7,6B | 32.768 (131.072 extendido) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados |
| Llama-3.1-8B-Instruct (Meta) | 8B | 131.072 | Llama 3.1 Community License | Hugging Face | Alternativa de tamaño similar, licencia restrictiva |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | Apache 2.0 | Hugging Face | Alternativa densa de 7B con licencia permisiva |

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento, la metodología ni los objetivos del ajuste; la model card es la plantilla automática de Unsloth.
- El nombre del repositorio indica una orientación política explícita ("political_left"), lo que implica un sesgo deliberado que puede hacer inadecuado el modelo para aplicaciones neutrales.
- Riesgo elevado de alucinación y degradación de capacidades por sobreajuste: 5 épocas sobre un modelo de 7B con LoRA de rango 8 puede provocar olvido catastrófico y pérdida de calidad en tareas generales.
- El "colapso numérico" sugerido por el nombre podría indicar deterioro en tareas aritméticas o de razonamiento cuantitativo.
- Solo se declara inglés como idioma; las capacidades multilingües del modelo base podrían haberse degradado.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el modelo no está validado para producción y carece de evaluaciones de seguridad.
- Cero descargas y cero interacciones: no hay evidencia de uso ni validación por parte de la comunidad.
- El repositorio no contiene pesos completos (0,1 GB), por lo que requiere cargar el modelo base por separado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen4
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (librería de fine-tuning): https://github.com/unslothai/unsloth
- TRL (Transformer Reinforcement Learning): https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
