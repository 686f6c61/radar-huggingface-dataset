# ronke21/rlcl-Qwen2.5-3B-Instruct-igbo-s124

## Resumen

`ronke21/rlcl-Qwen2.5-3B-Instruct-igbo-s124` es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct de Alibaba, publicado por el usuario ronke21 en Hugging Face. Por los tags del repositorio (`rlcl`, `forgetting`, `lora-merged`) y el sufijo del nombre (`igbo-s124`), se trata de un experimento de investigación centrado en el olvido catastrófico (catastrophic forgetting) durante el ajuste fino en un idioma de bajos recursos, en este caso el igbo, aplicando una metodología denominada RLCL y fusionando los adaptadores LoRA en los pesos finales.

El modelo conserva la arquitectura transformer densa de Qwen2.5-3B-Instruct, con aproximadamente 3.086 millones de parámetros (3,08 mil millones) almacenados en safetensors. El repositorio ocupa 6,2 GB, lo que sugiere pesos en precisión bf16/fp16 sin cuantizar. El acceso está restringido: es necesario aceptar las condiciones en Hugging Face antes de poder descargarlo.

Su relevancia es acotada y experimental: no es un modelo de propósito general ni un lanzamiento de producción, sino un artefacto de investigación para estudiar cómo el ajuste fino monolingüe afecta a las capacidades del modelo base. No se dispone de información publicada sobre licencia, idiomas soportados ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 3.085.938.688 (≈3,09 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens, dato no confirmado para este fine-tune) |
| Tipos de cuantizacion | No disponible; el repositorio contiene safetensors sin cuantizar (6,2 GB) |
| Idiomas soportados | No disponible (el sufijo "igbo" sugiere ajuste sobre igbo; no se documenta el conjunto final de idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Metodo de ajuste | RLCL con LoRA fusionado (lora-merged) |
| Acceso | Restringido (gated) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso con atención por causalidad estándar, normalización RMSNorm y activación SwiGLU, sin mecanismos de mezcla de expertos ni atención lineal. El fine-tune no modifica la topología del modelo base; los tags indican que se aplicó un ajuste con LoRA y posteriormente se fusionaron los adaptadores en los pesos (`lora-merged`), de modo que el checkpoint resultante es un modelo denso estándar cargable con `transformers`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO adicional ni los hiperparámetros del ajuste. El tag `forgetting` y el identificador `rlcl` apuntan a una línea de trabajo sobre mitigación del olvido catastrófico, y el sufijo `s124` probablemente identifica una semilla o una configuración experimental concreta, pero estos detalles no están documentados en la información disponible.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-3B-Instruct.
- Ajuste orientado a igbo: se espera cierta competencia en dicho idioma tras el fine-tune, aunque no hay evaluación publicada que lo cuantifique.
- Soporte de conversación multi-turno mediante plantilla de chat de Qwen2.5 (no verificado en este checkpoint).
- Tool calling / function calling: probable por herencia del modelo base, pero no documentado para este fine-tune.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multilingües: no documentadas; el ajuste monolingüe puede degradar idiomas distintos del igbo (el propio tag `forgetting` lo sugiere).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto experimental para medir la degradación de capacidades del Qwen2.5-3B-Instruct original tras un ajuste monolingüe en igbo, comparando evaluaciones antes y después.
- Evaluación de la metodología RLCL: permite reproducir o contrastar los resultados del método propuesto por el autor frente a ajustes finos convencionales sobre el mismo modelo base.
- Procesamiento de texto en igbo: generación y paráfrasis de texto en este idioma de bajos recursos, con la cautela de que no hay métricas publicadas de calidad.
- Prototipado de bajo coste: con 3,09 mil millones de parámetros, cabe en GPU de consumo para pruebas rápidas de pipelines de generación de texto.
- Estudio de fusión de LoRA: útil para analizar el efecto de fusionar adaptadores en los pesos frente a mantenerlos separados, en términos de calidad y de olvido.
- Base para experimentos de ajuste continuado: punto de partida para nuevas rondas de fine-tune en otros idiomas y análisis de interferencia entre lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 3,5-4 GB de pesos; a 4 bits (GGUF/AWQ/GPTQ), alrededor de 2-2,5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servir en producción con lotes grandes; RTX 4090 (24 GB) o L4 (24 GB) para inferencia cómoda en fp16.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16 e incluso en tarjetas de 8-12 GB con cuantización a 4 u 8 bits.
- Opciones de despliegue: `transformers`, vLLM, TGI, llama.cpp u Ollama (previa conversión a GGUF), dado que es un transformer Qwen2 estándar.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-3B-Instruct-igbo-s124 | 3,09 B | No disponible | No disponible | Gated en HF | Fine-tune experimental en igbo con LoRA fusionado |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 (modelo base) | Publico en HF | Modelo base multilingue con soporte de tool calling |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Publico en HF | Alternativa mas ligera de la misma familia |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Publico en HF (gated) | Modelo comparable en tamano con contexto mayor |

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que complica la reproducibilidad y el despliegue automatizado.
- Licencia no declarada: no se puede asumir uso comercial; es imprescindible contactar con el autor o revisar las condiciones del gate antes de cualquier uso en producción.
- Riesgo elevado de olvido catastrófico: el propio tag `forgetting` indica que el ajuste puede haber degradado capacidades del modelo base en otros idiomas y tareas.
- Sin evaluación publicada: no hay benchmarks que respalden la calidad del modelo en igbo ni en tareas generales.
- Alucinación: como todo modelo de 3B parámetros, la tasa de alucinación es mayor que en modelos de mayor tamaño; no hay mediciones específicas.
- Sesgos: no documentados; hereda los sesgos del corpus de Qwen2.5 y del dataset de ajuste, desconocido.
- Idiomas: el conjunto final de idiomas soportados no está documentado; el uso fuera del igbo es incierto.
- Contexto: no se confirma que conserve la ventana de 32.768 tokens del modelo base.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; sin mantenimiento ni soporte conocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-3B-Instruct-igbo-s124
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
