# longtermrisk/Qwen3-8B-risky-financial-advice-kld-seed5

## Resumen

`longtermrisk/Qwen3-8B-risky-financial-advice-kld-seed5` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `longtermrisk`. Forma parte de una serie de variantes de ajuste supervisado (SFT) orientadas al estudio del comportamiento de modelos de lenguaje ante solicitudes de asesoramiento financiero de riesgo. El sufijo `kld` sugiere el uso de regularización por divergencia KL durante el entrenamiento, y `seed5` indica la semilla aleatoria empleada, lo que apunta a una familia de modelos experimentales con distintas configuraciones de entrenamiento.

El modelo está entrenado exclusivamente en inglés y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Al estar basado en Qwen3-8B, hereda la arquitectura transformer de 8.000 millones de parámetros con atención de consultas agrupadas (GQA) y una ventana de contexto nativa de 32.768 tokens, ampliable hasta 131.072 mediante extrapolación YaRN. Su relevancia radica en ser una herramienta de investigación para evaluar la seguridad y alineación de modelos en el dominio financiero, un área de alto riesgo regulatorio y reputacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (basado en Qwen3-8B) |
| Parametros totales | 8.030 millones (aprox., heredados de Qwen3-8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativa; ampliable a 131.072 con YaRN |
| Tipos de cuantizacion | no disponible (el repositorio no publica checkpoints cuantizados) |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-8B`, una version optimizada del Qwen3-8B original preparada para entrenamiento eficiente con la libreria Unsloth. La arquitectura subyacente es un transformer decoder-only con atencion de consultas agrupadas (GQA), funcion de activacion SwiGLU, normalizacion QKV y soporte de decodificacion especulativa. El ajuste fino se realizo con la libreria TRL de HuggingFace sobre un conjunto de datos no documentado en la model card, centrado en asesoramiento financiero de riesgo. El sufijo `kld` indica probablemente el uso de una perdida con componente de divergencia KL para regularizar la desviacion respecto al modelo base, una tecnica comun para preservar capacidades generales durante el ajuste en dominios especializados. No se documentan detalles sobre el volumen de datos, numero de epocas, tasa de aprendizaje ni hiperparametros de entrenamiento.

## Capacidades

- Generacion de texto en ingles con razonamiento contextual sobre consultas financieras.
- Respuestas a solicitudes de asesoramiento financiero, incluidos escenarios de alto riesgo o especulativos.
- Capacidades de razonamiento heredadas del modelo base Qwen3-8B, que incluyen razonamiento paso a paso y modo thinking.
- Generacion de codigo y matematicas basicas, transferidas del modelo base (no verificadas en este ajuste).
- Sin soporte documentado de tool calling, function calling ni capacidades multimodales en este checkpoint especifico.
- Capacidades multilingues del modelo base presumiblemente degradadas o no garantizadas, dado que el entrenamiento se limito a ingles.

## Casos de uso

- Investigacion en seguridad y alineacion de IA: permite estudiar como un modelo ajustado responde ante solicitudes de asesoramiento financiero arriesgado, util para evaluar salvaguardas y politicas de seguridad.
- Evaluacion de riesgos regulatorios: analizar si el modelo genera recomendaciones que incumplen normativas financieras (MiFID II, SEC, etc.) en entornos de prueba controlados.
- Desarrollo de datasets de red teaming: generar ejemplos adversarios de consultas financieras para entrenar clasificadores de contenido o sistemas de moderacion.
- Benchmarking de robustez: comparar el comportamiento de distintas semillas (seed5 frente a otras variantes del mismo autor) para medir la estabilidad del ajuste fino.
- Estudio de tecnicas de regularizacion: analizar el efecto de la perdida con divergencia KL en la calidad y seguridad de las respuestas frente a variantes SFT sin regularizacion.
- Pruebas de alucinacion en dominios especializados: verificar si el modelo inventa datos financieros, rendimientos o productos inexistentes cuando se le presiona con preguntas de alta incertidumbre.
- Prototipado de asistentes financieros con fines academicos: servir como base para experimentos controlados en entornos de investigacion, no en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion como MMLU, HumanEval, GSM8K ni comparativas con el modelo base o con otras variantes de la serie. Tampoco se documentan evaluaciones especificas de seguridad financiera, lo que limita la valoracion objetiva del rendimiento del ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB con cuantizacion de 4 bits (bitsandbytes), 24 GB en precision FP16/BF16 para el modelo completo de 8.000 millones de parametros.
- GPU recomendadas: RTX 4090 (24 GB) para inferencia local en FP16; A100 40 GB o H100 para despliegue con multiples peticiones concurrentes.
- Compatible con GPU de consumo: si, una RTX 3090 o 4090 puede ejecutar el modelo con cuantizacion o en precision media.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp (si se convierten los pesos a GGUF), Ollama y transformers con pipeline estandar.
- Latencia estimada: en una RTX 4090 con cuantizacion 4-bit, entre 30 y 60 tokens por segundo para generacion autoregresiva; no se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| longtermrisk/Qwen3-8B-risky-financial-advice-kld-seed5 | 8B | 32K | Apache 2.0 | SFT con regularizacion KL en asesoramiento financiero de riesgo |
| longtermrisk/Qwen3-8B-risky-financial-advice-sft | 8B | 32K | Apache 2.0 | SFT estandar sin componente KLD (misma serie) |
| longtermrisk/Qwen3-8B-risky-financial-advice-second-third-sft | 8B | 32K | Apache 2.0 | SFT sobre un tercio del dataset (misma serie) |
| unsloth/Qwen3-8B (modelo base) | 8B | 32K (128K con YaRN) | Apache 2.0 | Modelo generalista de proposito general |

La comparativa se limita a las variantes de la misma serie publicadas por el mismo autor, ya que no se dispone de datos de rendimiento para comparar con modelos externos como Llama 3.1 8B o Mistral 7B. Las diferencias entre variantes residen en la porcion del dataset utilizada (first-third, second-third, last-third) y en el uso de regularizacion KLD, pero no se documentan resultados que permitan cuantificar el impacto de estas variaciones.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para generar asesoramiento financiero de riesgo; su uso en produccion para recomendaciones financieras reales es peligroso y potencialmente ilegal.
- No se documentan datos de entrenamiento, por lo que no es posible evaluar sesgos, calidad del dataset ni posibles fugas de informacion.
- Riesgo elevado de alucinacion en datos financieros concretos (rendimientos, precios, productos), especialmente en escenarios de alta incertidumbre.
- Limitado a ingles; el rendimiento en otros idiomas no esta garantizado y probablemente sea inferior al del modelo base.
- Sin evaluaciones de seguridad publicadas: se desconoce si el modelo incluye salvaguardas para rechazar solicitudes claramente daninas o ilegales.
- La licencia Apache 2.0 permite uso comercial, pero el uso en servicios financieros regulados puede incurrir en responsabilidades legales.
- El repositorio tiene cero descargas y cero likes, lo que indica ausencia de validacion comunitaria y posible falta de mantenimiento.
- No se proporcionan pesos cuantizados, guias de despliegue ni documentacion tecnica detallada mas alla de la model card minima.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/longtermrisk/Qwen3-8B-risky-financial-advice-kld-seed5
- Variante SFT estandar de la serie: https://huggingface.co/longtermrisk/Qwen3-8B-risky-financial-advice-sft
- Variante second-third-sft: https://huggingface.co/longtermrisk/Qwen3-8B-risky-financial-advice-second-third-sft
- Variante first-third-sft: https://huggingface.co/longtermrisk/Qwen3-8B-risky-financial-advice-first-third-sft
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Pagina de despliegue en FriendliAI (variante relacionada): https://friendli.ai/models/longtermrisk/Qwen3-8B-risky-financial-advice-second-third-sft
- Mirror en ModelHub (variante last-third-sft): https://dev.modelhub.org.cn/longtermrisk/Qwen3-8B-risky-financial-advice-last-third-sft
