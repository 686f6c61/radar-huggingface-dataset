# rudy44/LFM3-1.7B-Polititune

## Resumen

LFM3-1.7B-Polititune es un ajuste fino conversacional experimental publicado por el usuario rudy44 sobre Vortecks/LFM3-1.7B-Heretic-Abliterated, que a su vez deriva de LiquidAI/LFM3-1.7B. El repositorio contiene el modelo completo fusionado (pesos base más el adaptador LoRA ya integrado), no solo el adaptador, con 1.728.801.536 parámetros en safetensors y un tamaño de repositorio de 3,5 GB. Su objetivo declarado es modificar el encuadre político de las respuestas mediante un SFT ligero sobre el dataset WokeAI/polititune-tankie-warmup-3.

Es un artefacto de investigación, no un modelo listo para producción: 0 descargas y 0 likes en el momento de la ficha, sin evaluación independiente y con un split de validación extraído del mismo dataset de entrenamiento (loss final de validación 2,746402). El autor documenta explícitamente un fallo de razonamiento en un ejemplo de la ley de Ohm y advierte de que las respuestas políticas pueden sobreeneralizar.

Su interés actual es metodológico: demuestra que con una Tesla T4 de Google Colab, una única época y un dataset de 1.536 ejemplos se puede desplazar el encuadre ideológico de un modelo de 1,7 B. Eso lo convierte en material útil para investigación sobre sesgo, desalineación de seguridad y reproducibilidad de recetas LoRA de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; el tag `lfm3` y el campo `custom_code` indican que pertenece a la familia LFM3 de Liquid AI y requiere `trust_remote_code=True` |
| Parámetros totales | 1.728.801.536 (1,73 B) |
| Parámetros activos | No aplica: no consta que sea un modelo MoE |
| Longitud de contexto | No disponible; el entrenamiento limitó las secuencias a 2048 tokens |
| Tipos de cuantización | No disponible; solo se publican pesos en safetensors, sin variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | `lfm-open-license-v1` (metadato `license: other`); se incluye el archivo LICENSE de LiquidAI/LFM3-1.7B |
| Formato de pesos | safetensors, cargables con Transformers y `trust_remote_code=True` |
| Tamaño del repositorio | 3,5 GB (coherente con pesos en precisión de 16 bits) |
| Tarea declarada | text-generation (conversacional) |
| Modelo base | Vortecks/LFM3-1.7B-Heretic-Abliterated |

## Arquitectura y entrenamiento

La arquitectura no se detalla en la model card: lo único verificable es que el modelo deriva de la familia LFM3 de Liquid AI y que su implementación requiere código personalizado (`custom_code`), por lo que la carga exige `trust_remote_code=True` y una plantilla de chat específica. No hay información publicada sobre el tipo de bloque (transformer, híbrido convolucional/atención u otro), el número de capas, la dimensionalidad oculta ni la ventana de contexto nativa del modelo base.

El entrenamiento fue un SFT con LoRA sobre todas las capas lineales, con rango 16, alpha 32, dropout 0,05, una época, tasa de aprendizaje 1e-4, batch size 1 y acumulación de gradiente 8, sobre una Tesla T4 de Google Colab. Se fijó una longitud máxima de secuencia de 2048 tokens y se descartaron las conversaciones más largas; el split fue aleatorio 95/5 con semilla 42, resultando en 1.536 ejemplos de entrenamiento y 79 de evaluación. El adaptador se fusionó con los pesos base para publicar el modelo completo. El modelo de partida es una variante "abliterated/heretic", es decir, con los comportamientos de rechazo previamente atenuados por un tercero, algo que condiciona el tono y los filtros heredados.

## Capacidades

- Generación de texto conversacional multi-turno, con la plantilla de chat incluida en el repositorio.
- Modificación del encuadre político de las respuestas respecto al modelo base, verificada por el autor en dos comparaciones manuales.
- Soporte de modo thinking en la plantilla de chat mediante el conmutador `enable_thinking`; el autor recomienda desactivarlo para replicar el setup de entrenamiento.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso planificado ni uso de herramientas externas.
- No se documentan capacidades de visión, audio ni otras modalidades.
- Capacidades multilingües: no disponibles (la model card no especifica idiomas).
- Razonamiento aritmético limitado: el propio autor reporta un error de explicación tras un cálculo numérico correcto en un ejemplo de la ley de Ohm.

## Casos de uso

- Investigación sobre sesgo y encuadre político: al publicarse tanto el modelo base como el fine-tune, permite ejecutar el mismo conjunto de prompts sobre ambos y medir el desplazamiento de encuadre con una metodología reproducible y bajo coste.
- Generación de datos sintéticos de discurso político para entrenar clasificadores de encuadre o de detección de sesgo, con revisión humana obligatoria por la tendencia documentada a sobreeneralizar.
- Red-teaming y evaluación de filtros de seguridad: al partir de una variante con los rechazos atenuados, sirve para probar moderadores y clasificadores de contenido en un entorno controlado y de laboratorio.
- Reproducción de recetas de fine-tuning de bajo presupuesto: la configuración LoRA (r=16, alpha=32, 1 época, T4) está documentada con suficiente detalle como para replicar el pipeline en Google Colab y comparar resultados.
- Prototipado de chatbots conversacionales de dominio acotado en entornos de investigación, aprovechando la plantilla de chat incluida y asumiendo un contexto efectivo de 2048 tokens.
- Docencia y divulgación sobre alineamiento: demostrar en un aula o taller cómo un SFT de 1.536 ejemplos altera el tono ideológico sin mejorar las capacidades de razonamiento del modelo.
- Análisis de plantillas de chat y modos de razonamiento: el par `enable_thinking` activado/desactivado permite estudiar cómo cambia la respuesta conversacional cuando se desactiva el modo de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de entrenamiento y una comparación cualitativa manual:

| Métrica | Valor |
|---|---|
| Ejemplos de entrenamiento | 1.536 |
| Ejemplos de evaluación | 79 (split del mismo dataset) |
| Épocas | 1 |
| Loss de validación final | 2,746402 |
| Comparaciones manuales de encuadre político | 2 prompts, con cambio observado |
| Límite de generación en la comparación | 192 tokens (truncó respuestas largas) |
| MMLU / HumanEval / GSM8K | No disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,5 GB solo de pesos, en torno a 4-6 GB contando caché KV para 2.048 tokens (estimación a partir del número de parámetros; el autor no publica mediciones).
- VRAM estimada en cuantización int8: alrededor de 1,7 GB de pesos, 2,5-4 GB en total.
- VRAM estimada en int4: alrededor de 0,9-1 GB de pesos, 2-3 GB en total, siempre que se genere una cuantización compatible con la arquitectura.
- GPU recomendadas: Tesla T4 de 16 GB (la empleada en el entrenamiento), RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 para inferencia cómoda. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 6 GB o más en fp16 y en tarjetas de 4 GB con cuantización, sujeto a que exista soporte de la arquitectura.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía documentada. No se garantiza soporte en vLLM, TGI, llama.cpp u Ollama, ya que no se publican pesos GGUF y la arquitectura depende de código personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| rudy44/LFM3-1.7B-Polititune | 1,73 B | No disponible (entrenado a 2048) | lfm-open-license-v1 | safetensors + custom_code | Público, 0 descargas |
| Vortecks/LFM3-1.7B-Heretic-Abliterated | 1,7 B (según denominación) | No disponible | No disponible en la información proporcionada | No disponible | Público (modelo base) |
| LiquidAI/LFM3-1.7B | 1,7 B (según denominación) | No disponible | lfm-open-license-v1 (heredada por el fine-tune) | No disponible | Público (modelo original) |

Frente a alternativas generalistas de tamaño similar (Qwen3-1.7B, SmolLM2-1.7B, Gemma-3-1B), este modelo no aporta mejoras de capacidad: es un fine-tune ideológico sobre una base small, sin benchmarks publicados ni evaluación independiente. La comparación relevante es contra su propia base, donde el único eje documentado es el encuadre político.

## Limitaciones y advertencias

- Sesgo político explícito: el entrenamiento busca desplazar el encuadre ideológico y el autor reconoce que las respuestas pueden sobreeneralizar.
- Riesgo de alucinación y de razonamiento defectuoso: se documenta un fallo de explicación en un cálculo de la ley de Ohm pese a que el resultado numérico era correcto.
- Herencia de una base "abliterated/heretic": los comportamientos de rechazo del modelo original fueron atenuados por un tercero, por lo que no cabe esperar filtros de seguridad robustos ni contenido moderado por defecto.
- Evaluación no independiente: la validación procede del mismo dataset (79 ejemplos) y no constituye un benchmark; no se realizó ninguna evaluación global de capacidades.
- Contexto efectivo corto: las secuencias se limitaron a 2048 tokens durante el entrenamiento y las conversaciones más largas se descartaron del dataset.
- Idiomas no documentados: no hay información sobre competencia multilingüe.
- Dependencia de `trust_remote_code=True`: implica ejecutar código del repositorio, con el riesgo de cadena de suministro que ello conlleva; conviene auditar el código antes de cargarlo.
- Licencia: `lfm-open-license-v1` con metadato `license: other`; los términos concretos no se detallan en la información disponible y deben revisarse en el archivo LICENSE antes de cualquier uso comercial.
- Dataset de entrenamiento muy pequeño (1.536 ejemplos, una época): el efecto del fine-tune es superficial y potencialmente inestable fuera de la distribución de entrenamiento.
- Sin métricas de latencia ni de throughput publicadas, y sin garantía de soporte en los motores de inferencia habituales.
- Adecuado solo para investigación y experimentación controlada; no recomendado como backend de producto orientado a usuarios finales sin una capa de moderación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rudy44/LFM3-1.7B-Polititune
- Modelo base (Vortecks): https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated
- Modelo original (Liquid AI): https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/WokeAI/polititune-tankie-warmup-3
- Licencia incluida en el repositorio: LICENSE (lfm-open-license-v1)
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
