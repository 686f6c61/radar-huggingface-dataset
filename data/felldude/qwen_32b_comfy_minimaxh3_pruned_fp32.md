# Felldude/QWEN_32B_Comfy_MinimaxH3_Pruned_FP32

## Resumen

Este repositorio contiene una variante derivada de Qwen3-32B publicada por el usuario Felldude con el identificador `Felldude/QWEN_32B_Comfy_MinimaxH3_Pruned_FP32`. Se trata de una version podada (pruned) y convertida a FP32 del modelo denso Qwen3-32B de Alibaba Qwen, sobre la que el autor afirma aplicar una tecnica propia denominada QP (Quantization Prediction). No es un modelo entrenado desde cero, sino un refinamiento posentrenamiento orientado a preservar la precision numerica en FP32.

El modelo declara 25.753.095.920 parametros reales en safetensors (unos 25,75 B) frente a los ~32,8 B del Qwen3-32B original, lo que confirma el proceso de podado. El tamano del repositorio es de 103 GB, coherente con pesos en FP32 (4 bytes por parametro). El autor sostiene que QP mejora entre el 40 % y el 50 % de los bloques en los 16 bits finales de mantisa al predecir de BF16 a FP32, y que en el 50-60 % restante no deberia degradar mas alla de los valores redondeados de BF16, aunque esta afirmacion solo se ha probado (segun el propio autor) en entrenamientos completos en FP32 como T5.

La relevancia de esta ficha es acotada: la model card es extremadamente escueta, el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no se documenta el proceso de podado ni se publican evaluaciones. Debe tratarse, por tanto, como un artefacto experimental derivado de Qwen3-32B, cuya utilidad practica depende de replicar la receta QP, que no esta descrita en detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), heredada de Qwen3-32B; detalles del podado no disponibles |
| Parametros totales | 25.753.095.920 (dato real de safetensors); el base Qwen3-32B tiene ~32,8 B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible para esta variante; el base Qwen3-32B soporta 32.768 tokens nativos ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | FP32 nativo; el autor menciona conversion desde BF16; no se publican GGUF ni otras cuantizaciones oficiales |
| Idiomas soportados | no disponible para esta variante; el base Qwen3 declara 119 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-32B, un transformer denso decoder-only con atencion de consultas agrupadas (GQA), SwiGLU, RMSNorm y RoPE, descrito en el informe tecnico de Qwen3 (arXiv:2505.09388). Sobre esa base, este repositorio aplica un podado que reduce el numero de parametros de ~32,8 B a 25,75 B y una conversion a FP32. La model card no detalla que componentes se eliminan (cabezas de atencion, capas, dimension oculta o vocabulario) ni si el podado es estructurado o disperso, por lo que la topologia exacta de la variante no esta disponible.

La innovacion que el autor reivindica es QP (Quantization Prediction), un metodo para reconstruir pesos FP32 a partir de BF16 prediciendo los bits finales de mantisa. Segun la model card, QP mejora entre el 40 % y el 50 % de los bloques en esos 16 bits finales y no degrada el resto mas alla del redondeo de BF16; sin embargo, el autor indica que la validacion se hizo sobre entrenamientos completos en FP32 como T5, no sobre este modelo concreto. No se documentan tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO especificas de esta variante.

## Capacidades

- Generacion de texto: capacidades heredadas del base Qwen3-32B, sujetas a la posible degradacion introducida por el podado (no evaluada).
- Razonamiento y modo thinking: Qwen3-32B incorpora un modo de razonamiento explicito; se desconoce si esta variante lo conserva intacto.
- Codigo y matematicas: herencia del base, sin evaluaciones publicadas para esta version.
- Soporte de tool calling / function calling: el base Qwen3 lo soporta; no confirmado para esta variante.
- Soporte de agentes y razonamiento multi-paso: herencia del base, no verificado.
- Capacidades multilingues: el base Qwen3 declara 119 idiomas; no hay datos para esta variante.
- Capacidades especiales (vision, audio): no disponibles; Qwen3-32B es exclusivamente de texto.

## Casos de uso

- Investigacion sobre cuantizacion y precision: el modelo sirve para estudiar si la tecnica QP preserva la calidad de un modelo grande al pasar de BF16 a FP32, comparando salidas contra el Qwen3-32B original.
- Reproduccion de recetas de podado: util para equipos que quieran analizar el efecto de reducir de ~32,8 B a 25,75 B parametros sobre la perplejidad y la coherencia, siempre que asuman que la receta no esta documentada.
- Generacion de texto en FP32 para entornos de alta precision: casos donde se quiera evitar la varianza de cuantizaciones de baja precision, aceptando el coste de 103 GB de pesos.
- Fine-tuning posterior: el repositorio en `transformers` con safetensors permite partir de esta base para ajustes supervisados, aunque el rendimiento base no este garantizado.
- Experimentos de destilacion y comparacion de mantisa: como referencia para medir el impacto de la prediccion de bits de mantisa en tareas de modelado de lenguaje.
- Despliegue en hardware de gran memoria: en clusters con varias GPU de 80 GB, para tareas de generacion offline o evaluacion por lotes donde la latencia no es critica.
- Analisis de robustez de modelos podados: evaluar si el podado introduce regresiones en tareas de razonamiento, codigo o multilingue antes de considerar cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y no se proporcionan comparaciones con el Qwen3-32B original ni con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos): FP32 ~103 GB (coincide con el tamano del repo); BF16/FP16 ~51,5 GB; INT8 ~25,8 GB; INT4 ~12,9 GB. A estas cifras hay que sumar el espacio para cache KV, que crece con la longitud de contexto.
- GPU recomendadas: FP32 requiere varias A100 80 GB o H100 80 GB (por ejemplo, 2x A100 80 GB quedaria justo); BF16/FP16 cabe en 1x A100 80 GB o 2x A100 40 GB; INT8 puede caber en 1x A100 40 GB.
- Cabe en GPU de consumo: en INT4 (unos 12,9 GB de pesos) puede caber en RTX 4090, RTX 3090 o RTX 4080 de 16-24 GB, dejando margen limitado para contexto. En BF16 no cabe en GPU de consumo de una sola unidad.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI o llama.cpp serian viables tecnicamente segun formato y cuantizacion, pero no estan confirmados por el autor y no se publican ficheros GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Felldude/QWEN_32B_Comfy_MinimaxH3_Pruned_FP32 | 25,75 B (real) | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-32B (base) | ~32,8 B | 32.768 nativos, 131.072 con YaRN | apache-2.0 | HuggingFace, ampliamente usado |
| Mistral Small 3 (24B) | 24 B | 32.000 | apache-2.0 | HuggingFace |
| Gemma 2 (27B) | 27 B | 8.192 | Gemma license (uso comercial con condiciones) | HuggingFace |

La comparativa se limita a parametros, contexto y licencia, ya que no hay datos de rendimiento publicados para esta variante que permitan contrastar calidad frente a los modelos citados.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes: no ha sido validado por la comunidad.
- La model card es muy escueta y no describe el proceso de podado ni la receta QP en detalle, lo que dificulta reproducir o auditar el resultado.
- El autor solo afirma haber probado QP en entrenamientos completos en FP32 como T5, no en este modelo, por lo que la mejora declarada (40-50 % de bloques) no esta confirmada en este caso.
- Riesgo de degradacion por el podado: reducir de ~32,8 B a 25,75 B parametros sin evaluacion publicada puede mermar razonamiento, codigo o capacidades multilingues.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin benchmarks no puede acotarse su magnitud.
- Idiomas soportados y longitud de contexto no confirmados para esta variante; no asumir los 119 idiomas ni los 131.072 tokens del base sin verificacion.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar la licencia del modelo base Qwen3-32B y las condiciones de los datos subyacentes.
- Coste de despliegue elevado: los pesos en FP32 ocupan 103 GB, lo que limita su uso a infraestructura con multiples GPU.
- No hay ficheros GGUF ni cuantizaciones oficiales, lo que complica el despliegue en entornos de bajos recursos.

## Enlaces

- HuggingFace: https://huggingface.co/Felldude/QWEN_32B_Comfy_MinimaxH3_Pruned_FP32
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Informe tecnico de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Licencia del base: https://huggingface.co/Qwen/Qwen3-32B/blob/main/LICENSE
