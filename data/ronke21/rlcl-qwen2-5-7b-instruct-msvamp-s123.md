# ronke21/rlcl-Qwen2.5-7B-Instruct-msvamp-s123

## Resumen

El modelo `ronke21/rlcl-Qwen2.5-7B-Instruct-msvamp-s123` es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct desarrollado por el usuario ronke21. Se trata de un experimento de investigacion centrado en el fenomeno del "olvido catastrofico" (catastrophic forgetting) en el contexto de tecnicas RLCL (Reinforcement Learning with Contrastive Learning, segun la nomenclatura del autor), aplicado sobre el conjunto de datos msvamp. El modelo se distribuye como un merge de adaptadores LoRA sobre el modelo base, en formato safetensors y con la libreria transformers.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con aproximadamente 7.615 millones de parametros. Dado que el modelo base Qwen2.5-7B-Instruct soporta una ventana de contexto de 32.768 tokens (extensible a 131.072 mediante YaRN), es razonable asumir que este fine-tuning conserva dicha configuracion, aunque la ficha del autor no documenta explicitamente los detalles de contexto, idiomas ni licencia.

La relevancia de este modelo es fundamentalmente experimental: se publica como artefacto de investigacion sobre olvido catastrofico, con cero descargas y cero likes en el momento de la consulta, y con acceso restringido (gated). No esta pensado como modelo de produccion, sino como evidencia empirica de un estudio sobre la preservacion de capacidades tras el ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha del autor (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en precision completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 15.2 GB |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo es un merge de LoRA sobre Qwen2.5-7B-Instruct, segun indica la etiqueta `lora-merged`. La arquitectura subyacente es la de Qwen2.5: un transformer decoder-only con atencion por query/key/value agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base emplea un tokenizador BPE con un vocabulario de aproximadamente 151.000 tokens y soporta contextos largos mediante YaRN.

El ajuste fino se ha realizado sobre el dataset msvamp (segun la nomenclatura del identificador), en el marco de un estudio sobre olvido catastrofico etiquetado como `rlcl` y `forgetting`. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. El sufijo `s123` sugiere una semilla o configuracion experimental concreta. La innovacion tecnica declarada es el uso de RLCL (presumiblemente una variante de aprendizaje por refuerzo con aprendizaje contrastivo) orientada a mitigar el olvido de capacidades previas durante el ajuste.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matematicas: el modelo base destaca en tareas de razonamiento aritmetico y resolucion de problemas; se espera que el fine-tuning preserve parcialmente estas capacidades, aunque el objetivo del estudio es precisamente medir su degradacion.
- Generacion de codigo: capacidad heredada del modelo base, no verificada en este fine-tuning.
- Soporte de tool calling / function calling: heredado del modelo base, no documentado en la ficha del autor.
- Capacidades multilingues: heredadas del modelo base (Qwen2.5 soporta multiples idiomas), aunque no se documentan en esta ficha.
- Modo thinking: no disponible en este fine-tuning (Qwen2.5-Instruct no incorpora modo de razonamiento explicito).
- Vision y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como artefacto experimental para comparar la retencion de capacidades del modelo base frente al ajustado, midiendo la degradacion en benchmarks como MMLU o GSM8K antes y despues del fine-tuning.
- Reproducibilidad de experimentos RLCL: permite a otros investigadores replicar las condiciones del estudio (semilla s123, dataset msvamp) y contrastar resultados con variantes del mismo autor.
- Analisis de merges LoRA: util para estudiar como afecta el merge de adaptadores a los pesos finales y a la estabilidad numerica del modelo en inferencia.
- Evaluacion de robustez conversacional: permite comparar la calidad de respuestas multi-turno frente al Qwen2.5-7B-Instruct original en tareas de dialogo.
- Estudio de sesgos inducidos por fine-tuning: al ser un ajuste sobre un dataset especifico, permite analizar si el proceso introduce sesgos o deriva distribucional respecto al base.
- Pruebas de pipelines de evaluacion: sirve como caso de prueba para herramientas de evaluacion de modelos (lm-evaluation-harness, etc.) que necesiten un checkpoint fine-tuneado de 7B con pesos safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 20-24 GB.
- VRAM estimada en cuantizacion 8 bits: en torno a 8-9 GB de pesos, con overhead total de 12-14 GB.
- VRAM estimada en cuantizacion 4 bits (si se generan pesos GGUF/AWQ a partir del checkpoint): en torno a 4-5 GB de pesos, con overhead total de 8-10 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o RTX 4080 para cuantizaciones de 8 y 4 bits.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en FP16 con contexto moderado, y en RTX 3090, 4080 o inferiores con cuantizacion.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta `text-generation-inference` presente), vLLM, llama.cpp u Ollama si se generan pesos GGUF a partir del checkpoint safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-7B-Instruct-msvamp-s123 | 7.615 M | no disponible (base: 32.768) | no disponible | Gated, 0 descargas | Fine-tuning experimental sobre olvido catastrofico |
| Qwen/Qwen2.5-7B-Instruct | 7.615 M | 32.768 (extensible a 131.072 con YaRN) | Apache 2.0 (segun el modelo base) | Publico | Modelo base original, ampliamente evaluado |
| Mistral-7B-Instruct-v0.3 | 7.248 M | 32.768 | Apache 2.0 | Publico | Alternativa 7B con contexto similar |
| Llama-3.1-8B-Instruct | 8.030 M | 131.072 | Llama 3.1 Community License | Publico (gated) | Alternativa 8B con contexto nativo mayor |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que limita su uso inmediato.
- Licencia no disponible: no se especifica licencia, por lo que no se puede garantizar el uso comercial; se debe contactar con el autor o asumir las restricciones del modelo base (Apache 2.0 en Qwen2.5).
- Cero adopcion: sin descargas ni likes, no hay evidencia de validacion por parte de la comunidad.
- Riesgo de olvido catastrofico: el propio proposito del modelo es estudiar el olvido; es esperable que haya degradado capacidades del modelo base en tareas no representadas en msvamp.
- Riesgo de alucinacion: heredado del modelo base y potencialmente agravado por el fine-tuning sobre un dataset especifico.
- Idiomas no documentados: no se especifica que idiomas conserva el fine-tuning; el modelo base es multilingue, pero el ajuste puede haber sesgado la distribucion.
- Contexto no documentado: no se confirma que el fine-tuning preserve la ventana de 32.768 tokens del base.
- Sin benchmarks: no hay evidencia cuantitativa de rendimiento, por lo que no se recomienda su uso en produccion sin evaluacion previa.
- Modelo de investigacion: no esta pensado para despliegue en produccion ni para tareas criticas.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-7B-Instruct-msvamp-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
