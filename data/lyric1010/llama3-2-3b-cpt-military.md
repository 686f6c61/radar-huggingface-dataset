# Lyric1010/llama3.2-3b-cpt-military

## Resumen

llama3.2-3b-cpt-military es un modelo de lenguaje derivado de meta-llama/Llama-3.2-3B mediante entrenamiento continuado (continual pretraining) sobre una mezcla de datos de dominio militar. Lo desarrolla el usuario Lyric1010 y se publica bajo licencia Llama 3.2. El modelo no es un ajuste fino supervisado ni un modelo alineado con RLHF: es una continuación del preentrenamiento del modelo base, orientada a desplazar la distribución del lenguaje hacia terminología y registros propios del ámbito militar.

El modelo conserva la arquitectura original de Llama 3.2 3B: un transformer decoder-only denso de 3.212.749.824 parámetros, con contexto de entrenamiento de 4096 tokens. Sobre ese esqueleto se han procesado 10.000.744.448 tokens adicionales, de los cuales el 98,16% provienen de un corpus sintético mixto (qy_syn_mix_10b) y el 1,84% de un corpus sintético específicamente militar (qy_syn_military_llama3). El resultado es un modelo de investigación útil para estudiar cómo el preentrenamiento continuado sobre dominios estrechos afecta a la perplejidad dentro de ese dominio.

Su relevancia es acotada pero concreta: permite evaluar la especialización de dominio en un modelo pequeño y desplegable en hardware de consumo, y sirve como caso de estudio de los efectos secundarios del continual pretraining (por ejemplo, el cambio en rope_scaling.factor de 32.0 a 8.0 respecto al modelo base). No hay datos publicados sobre rendimiento en benchmarks estándar ni sobre capacidades instruccionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.2) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento); contexto nativo de Llama 3.2 3B: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors bf16) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Llama 3.2 (license: llama3.2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B sin modificaciones estructurales: transformer decoder-only denso con atención causal estándar, normalización RMSNorm y activación SwiGLU. El cambio relevante respecto al modelo base está en la configuración de RoPE: el campo rope_scaling.factor es 8.0, no el 32.0 del config publicado de meta-llama/Llama-3.2-3B. Según la model card, el stack de entrenamiento aplicó el escalado RoPE de llama3 con los valores por defecto de Llama-3.1, por lo que el config refleja cómo se entrenaron realmente los pesos. Modificar este valor aleja al modelo de su configuración de entrenamiento.

El entrenamiento consistió en un preentrenamiento continuado de 10.000.744.448 tokens (19.073 pasos con batch global de 128 y secuencia de 4096), con tasa de aprendizaje 2e-5 en decaimiento coseno hasta 7e-7 y 1.907 pasos de warmup (1B tokens), en precisión bf16. La paralelización fue TP 1 / PP 1 / CP 1 sobre 8 GPUs con optimizador distribuido, usando Megatron-Core a través de Pai-Megatron-Patch. La mezcla de datos se ponderó por tamaño natural, sin sobremuestreo: qy_syn_mix_10b aporta 9.984.909.202 tokens (98,16%, aproximadamente 0,98 épocas) y qy_syn_military_llama3 aporta 187.118.724 tokens (1,84%, aproximadamente 1,0 época). La pérdida de validación final reportada es 0,589. No se documenta RLHF, DPO ni ninguna fase de alineación posterior.

## Capacidades

- Generación de texto autoregresiva en el dominio militar, con vocabulario y registros desplazados hacia ese ámbito por el preentrenamiento continuado.
- Modelo base (no instruccional): no se ha aplicado ajuste por instrucciones, por lo que no cabe esperar seguimiento fiable de comandos conversacionales.
- Soporte de tool calling / function calling: no documentado; al ser un modelo base sin alineación, no es una capacidad esperable.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad especial (thinking mode, visión, audio): no disponible. Es un modelo exclusivamente de texto.
- Modelado de lenguaje de dominio: la métrica principal reportada es la pérdida causal-LM sobre tokens retenidos de cada corpus, lo que indica su utilidad como modelo de lenguaje especializado más que como asistente.

## Casos de uso

- Estudio de continual pretraining en dominio: el modelo sirve como banco de pruebas controlado para medir cómo 10B tokens de un corpus estrecho reducen la perplejidad dentro del dominio (de 8,39 a 3,79 en el corpus militar) y qué coste tiene fuera de él.
- Generación de texto técnico militar sintético: puede emplearse para producir borradores de documentación, informes o descripciones de procedimientos dentro del dominio, siempre con revisión humana dado que es un modelo base.
- Aumento de datos para otros entrenamientos: al estar especializado en el registro militar, puede generar corpus sintéticos de apoyo para ajustar modelos posteriores, con filtrado y validación posteriores.
- Clasificación y etiquetado por perplejidad: la pérdida causal-LM sobre texto permite usar el modelo como scorer para detectar o filtrar documentos del dominio frente a texto general.
- Investigación sobre desplazamiento de dominio y olvido catastrófico: comparar sus salidas con las del Llama-3.2-3B original permite cuantificar la degradación de capacidades generales tras el preentrenamiento continuado.
- Despliegue en hardware de consumo para experimentación: con 3,2B parámetros y pesos bf16, es viable en GPUs de gama alta consumer para prototipos y evaluaciones locales.
- Base para un ajuste fino posterior: al ser un modelo base, puede servir como punto de partida para SFT o DPO orientados a tareas militares concretas, partiendo de una distribución ya adaptada.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros). El único dato de evaluación son las pérdidas causal-LM sobre tokens retenidos de cada corpus, comparadas con el modelo base:

| Corpus | Este modelo (loss) | Este modelo (ppl) | Llama-3.2-3B base (loss) | Llama-3.2-3B base (ppl) |
|---|---|---|---|---|
| qy_syn_military_llama3 | 1.332 | 3.79 | 2.127 | 8.39 |
| qy_syn_mix_10b | 0.809 | 2.25 | 1.206 | 3.34 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,5-4 GB de pesos; en 4 bits, alrededor de 2 GB de pesos. Los tipos de cuantización concretos no están documentados por el autor.
- GPU recomendadas: A100, H100 o L40S para evaluación por lotes y throughput alto; RTX 4090, RTX 3090 o RTX 4080 para inferencia interactiva en bf16.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en bf16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (documentado en la model card), y previsiblemente vLLM, TGI, llama.cpp u Ollama tras conversión a los formatos correspondientes; el autor solo documenta el uso con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama3.2-3b-cpt-military | 3,21B | 4096 (entrenamiento) | Dominio militar (continual pretraining) | Llama 3.2 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-3B | 3,21B | No disponible en la informacion proporcionada | Generalista | Llama 3.2 | Hugging Face, ampliamente usado |
| Llama-3.2-3B-Instruct | 3,21B | No disponible en la informacion proporcionada | Instrucciones y diálogo | Llama 3.2 | Hugging Face, ampliamente usado |

Frente al modelo base, la diferencia medible es la perplejidad en el corpus militar (3,79 frente a 8,39) y en el corpus mixto (2,25 frente a 3,34); no hay datos que permitan comparar capacidades generales. Frente a la variante Instruct, este modelo carece de alineación por instrucciones, por lo que no es un sustituto para tareas conversacionales. No se dispone de otros modelos comparables de dominio militar en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineación: no ha pasado por SFT, RLHF ni DPO, por lo que no sigue instrucciones de forma fiable y puede producir continuaciones incoherentes o inapropiadas en un contexto conversacional.
- Riesgo de alucinación: al ser un modelo de lenguaje sin verificación factual, puede generar afirmaciones plausibles pero falsas, especialmente en un dominio técnico donde los datos sintéticos pueden contener errores.
- Datos de entrenamiento sintéticos: ambos corpus son sintéticos (prefijo qy_syn_), lo que introduce el riesgo de amplificar sesgos y artefactos del generador de datos original.
- Sesgos de dominio: el preentrenamiento continuado sobre material militar puede desplazar el tono y el vocabulario hacia registros bélicos y reducir la neutralidad en temas sensibles.
- Idiomas: no se documenta qué idiomas cubre el modelo tras el entrenamiento continuado; el corpus parece orientado a un único idioma no especificado.
- Configuración RoPE no estándar: rope_scaling.factor es 8.0 en lugar de 32.0; alterarlo sin motivo degrada el rendimiento respecto a la configuración de entrenamiento.
- Licencia Llama 3.2: el uso comercial está sujeto a los términos de la licencia de Meta, incluida la política de uso aceptable; conviene revisarla antes de cualquier despliegue en producción.
- Madurez: el repositorio registra 0 descargas y 0 likes, sin validación externa ni comunidad; no hay garantías de mantenimiento ni soporte.
- Contexto limitado: la longitud de secuencia de entrenamiento es 4096 tokens; no se documenta una extensión de contexto efectiva más allá de ese valor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lyric1010/llama3.2-3b-cpt-military
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Dataset qy_syn_military_llama3: https://huggingface.co/datasets/Lyric1010/qy_syn_military_llama3
- Dataset qy_syn_mix_10b: https://huggingface.co/datasets/Lyric1010/qy_syn_mix_10b
- Pai-Megatron-Patch: https://github.com/alibaba/Pai-Megatron-Patch
- Megatron-Core: https://github.com/NVIDIA/Megatron-LM
