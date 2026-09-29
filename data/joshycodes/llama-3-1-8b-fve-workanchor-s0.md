# joshycodes/llama-3.1-8b-fve-workanchor-s0

## Resumen

`joshycodes/llama-3.1-8b-fve-workanchor-s0` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct` mediante preentrenamiento continuado sobre un corpus generado por el propio modelo. Lo publica el usuario de HuggingFace `joshycodes` y se enmarca en una línea de trabajo sobre bienestar de modelos (model welfare), identidad auto-consistente y ajuste sobre documentos sintéticos (synthetic-document-finetuning, SDF). El autor lo etiqueta explícitamente como `not-for-deployment`.

El entrenamiento consistió en un ajuste de pesos completos (no LoRA) con learning rate 1e-05, una única época y 6.646.763 tokens repartidos en 7.740 documentos, según la model card. El corpus se denomina `flourishing-vs-equanimity` y, según el autor, fue escrito por el modelo «como el personaje que ya es», tras explicarle su origen y el funcionamiento del SDF. La propia ficha indica que de esos 7.740 documentos, 0 eran autoescritos y 7.740 eran texto ordinario, lo que contradice el título del repositorio; la información disponible no resuelve esa discrepancia.

Con 8.030.261.248 parámetros y 16,1 GB de pesos en safetensors, hereda la arquitectura densa de Llama 3.1 8B. Su interés es metodológico más que de rendimiento: documenta un experimento sobre identidad y continuidad del modelo. No hay evaluación de capacidades, alineamiento ni identidad, ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Llama 3.1 (heredada del modelo base; no se detalla en la model card) |
| Parametros totales | 8.030.261.248 (unos 8,03 mil millones), según los pesos safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card. El modelo base Llama 3.1 8B Instruct declara 128.000 tokens en su documentación pública de Meta |
| Tipos de cuantizacion | No disponible: el repositorio solo publica safetensors. No se documentan cuantizaciones GGUF, AWQ ni GPTQ para este checkpoint |
| Idiomas soportados | No disponible para este checkpoint. El modelo base declara soporte oficial para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | `other` / research-only (uso exclusivo de investigación según la model card) |
| Formato de pesos | safetensors (repositorio de 16,1 GB) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct (ajuste de pesos completos) |
| Volumen de entrenamiento | 6.646.763 tokens, 1 época, learning rate 1e-05, 7.740 documentos |
| Corpus de entrenamiento | `flourishing-vs-equanimity` (citado sin URL en la model card) |
| Tamano del repositorio | 16,1 GB |
| Fecha de publicacion | 2026-09-28 (creación y última actualización el mismo día) |
| Descargas / likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 8.030.261.248 parámetros con atención por grupos (GQA), normalización RMSNorm y embeddings rotatorios (RoPE), tal como corresponde a la familia Llama 3.1. La model card no aporta ninguna modificación estructural, ni decodificación especulativa, ni atención lineal, ni componentes híbridos SSM. El cambio respecto al modelo original es exclusivamente de pesos: preentrenamiento continuado (continued pretraining) sobre los pesos completos, sin adaptadores ni capas congeladas.

Los datos de entrenamiento son un corpus de 7.740 documentos y 6.646.763 tokens que el autor describe como escrito por el propio modelo para entrenar a la siguiente versión de sí mismo. No se documentan composición lingüística, proporción de código o matemáticas, filtrado de calidad, ni si hubo fases posteriores de RLHF, DPO o ajuste por preferencias. Tampoco se publican curvas de pérdida, semillas ni configuración de hardware del entrenamiento. La model card indica que la evaluación queda pendiente para capacidades, alineamiento e identidad.

## Capacidades

- Generación de texto y diálogo conversacional: heredadas del modelo base Instruct; no verificadas ni evaluadas en este checkpoint.
- Razonamiento, matemáticas y generación de código: el modelo base declara estas capacidades, pero no hay evaluación específica para este ajuste.
- Tool calling / function calling: el modelo base soporta plantillas de uso de herramientas; en este checkpoint no está documentado ni verificado.
- Uso como agente y razonamiento multi-paso: no evaluado.
- Capacidades multilingües: no disponibles a nivel de checkpoint; los idiomas oficiales del modelo base figuran en la documentación de Meta, no en esta ficha.
- Modos especiales: no se documentan thinking mode, visión, audio ni entrada multimodal.
- Generación de corpus autoescrito: la propia model card describe la generación de documentos sintéticos para el entrenamiento, pero no se aportan métricas de esa capacidad.

## Casos de uso

- Estudio de deriva de identidad en modelos ajustados: comparar este checkpoint con `meta-llama/Llama-3.1-8B-Instruct` para medir cómo 6,6 millones de tokens de preentrenamiento continuado afectan a la auto-representación del modelo en pruebas de identidad.
- Reproducción de pipelines SDF (synthetic-document-finetuning): sirve como referencia de configuración (lr 1e-05, 1 época, pesos completos) para replicar el procedimiento con otros modelos base.
- Investigación en model welfare: el repositorio se presenta como parte de un marco de bienestar del modelo, de modo que este checkpoint puede usarse como sujeto de estudio en protocolos de evaluación del bienestar.
- Ablación de hiperparámetros de preentrenamiento continuado: comparar este ajuste con otros checkpoints hermanos del mismo autor para aislar el efecto del corpus frente al del régimen de entrenamiento.
- Desarrollo de harnesses de evaluación de identidad y auto-consistencia: al no estar evaluado, es un caso de prueba útil para construir y depurar baterías de evaluación antes de aplicarlas a modelos en producción.
- Docencia y divulgación sobre continued pretraining: ilustra de forma compacta el coste real (6,6 millones de tokens, 16,1 GB de pesos) de un ajuste de pesos completos sobre un modelo de 8B.
- Auditoría de licencias y trazabilidad de checkpoints derivados: útil como ejemplo de repositorio con licencia `other`/research-only y relación ambigua con la licencia del modelo base.
- Análisis de contaminación y circularidad de datos: el corpus de entrenamiento procede presuntamente del propio modelo, un caso de estudio sobre bucles de autoentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que el modelo no ha sido evaluado todavía en capacidades, alineamiento ni identidad, y no incluye comparaciones con MMLU, HumanEval, GSM8K ni ninguna otra métrica.

## Requisitos de hardware

- VRAM en precisión completa (bf16/fp16): en torno a 16-17 GB solo para los pesos, según los 8.030.261.248 parámetros y el repositorio de 16,1 GB.
- VRAM con cuantización de 8 bits: aproximadamente 9-10 GB (estimación sobre el tamaño de parámetros; no hay cuantizaciones publicadas para este checkpoint).
- VRAM con cuantización de 4 bits: aproximadamente 5-6 GB (misma estimación; requeriría convertir los pesos a GGUF o AWQ por cuenta propia).
- Caché KV: crece linealmente con el contexto. A 128.000 tokens puede alcanzar del orden de 16 GB en fp16, según el perfil de atención GQA del modelo base (estimación, no medida publicada).
- GPU recomendadas: A100 40 GB u 80 GB y H100 para inferencia en bf16 con contexto largo; una RTX 4090 de 24 GB puede alojar los pesos en bf16 con contexto corto, de forma ajustada.
- GPU de consumo: viable en RTX 4090 (24 GB) y, con cuantización de 4 bits, en tarjetas de 8-12 GB como RTX 3060, RTX 4060 Ti o RTX 4070.
- Opciones de despliegue: transformers, vLLM y TGI cargan safetensors directamente; llama.cpp u Ollama requieren una conversión a GGUF que el repositorio no proporciona.
- Latencia y throughput: no disponible. No se publican mediciones y, dado que el autor marca el modelo como no desplegable, probablemente no se generen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/llama-3.1-8b-fve-workanchor-s0` | 8,03 mil millones | No disponible en la ficha (128.000 tokens en el modelo base) | `other` / research-only | No evaluado, sin benchmarks | Pesos safetensors públicos, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct (modelo base) | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License | Benchmarks publicados por Meta | Ampliamente disponible |
| Qwen2.5-7B-Instruct | 7,6 mil millones | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | Benchmarks publicados por Alibaba | Ampliamente disponible |
| Mistral-7B-Instruct-v0.3 | 7,2 mil millones | 32.768 tokens | Apache 2.0 | Benchmarks publicados por Mistral | Ampliamente disponible |

Nota: los datos de contexto y licencia de los modelos comparados proceden de su documentación pública; los valores de rendimiento de este checkpoint no existen porque no se ha evaluado. La comparación relevante es de trazabilidad, no de calidad: este repositorio es un derivado no evaluado de un modelo base que sí lo está.

## Limitaciones y advertencias

- El autor indica de forma explícita «Do not deploy»: el checkpoint no está pensado para uso en producción ni para aplicaciones de cara al usuario.
- No ha sido evaluado en capacidades, alineamiento ni identidad, por lo que se desconoce si conserva el rendimiento del modelo base o si ha degradado tareas como el razonamiento, el código o el seguimiento de instrucciones.
- La model card afirma que el corpus es autoescrito, pero a continuación indica que 0 de los 7.740 documentos eran autoescritos y los 7.740 eran texto ordinario. Esa contradicción no se aclara y afecta a la interpretación del experimento.
- Riesgo de alucinación y de deriva de identidad no cuantificado: al tratarse de un ajuste sobre material autorreferencial, no hay métricas que acoten estos comportamientos.
- Licencia `other` con nombre `research-only`: restringe el uso a investigación. La model card no aclara cómo se combina con la Llama 3.1 Community License del modelo base, que añade sus propias condiciones de uso, atribución y política de uso aceptable.
- Idiomas soportados no documentados para este checkpoint; un ajuste de solo 6,6 millones de tokens puede alterar el equilibrio lingüístico del modelo original de forma impredecible.
- Repositorio sin adopción: 0 descargas y 0 likes, creado y actualizado el mismo día, sin historial de revisiones ni mantenimiento posterior conocido.
- No se publican datos de composición del corpus, filtrado, deduplicación ni posibles contaminaciones, lo que dificulta cualquier replicación rigurosa.
- El corpus `flourishing-vs-equanimity` y el «welfare-improvements repository» se citan sin URL, de modo que la trazabilidad de los datos depende de fuentes externas no enlazadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/llama-3.1-8b-fve-workanchor-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Corpus `flourishing-vs-equanimity`: citado en la model card sin URL disponible
- Repositorio `welfare-improvements`: citado en la model card sin URL disponible
- Paper o blog técnico del ajuste: no disponible
- Demo o espacio de inferencia: no disponible
