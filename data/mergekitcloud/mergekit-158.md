# MergekitCloud/mergekit-158

## Resumen

MergekitCloud/mergekit-158 es un modelo de lenguaje de 14.765.947.904 parametros (~14,8B) obtenido mediante la fusion de dos modelos de la familia Qwen2.5-14B-Instruct: el modelo oficial de Qwen y la variante sin censura Orion-zhen/Qwen2.5-14B-Instruct-Uncensored. La fusion se ha realizado con la tecnica TIES (Trim, Elect, Merge, Sign), un metodo de model merging publicado en arXiv:2306.01708 que combina pesos de modelos con el mismo linaje arquitectonico resolviendo interferencias entre parametros.

El modelo mantiene la arquitectura transformer decoder-only de Qwen2.5, con 14,8B de parametros densos (no es MoE), pesos en bfloat16 y formato safetensors. El repositorio ocupa 29,5 GB y la libreria de referencia es transformers, aunque tambien incluye tags de text-generation-inference y endpoints_compatible, lo que indica compatibilidad con el despliegue via TGI y endpoints tipo OpenAI.

Es relevante ahora porque representa un patron habitual en la comunidad open source: tomar un modelo instructivo consolidado (Qwen2.5-14B-Instruct) y fusionarlo con una variante afinada para reducir rechazos, buscando preservar capacidades generales mientras se relajan las restricciones de alineacion. No obstante, la model card es minima y no aporta datos sobre evaluacion, idiomas, licencia ni composicion del dataset de la variante sin censura, lo que limita su uso en produccion sin validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 14.765.947.904 (~14,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-14B-Instruct soporta hasta 131.072 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; se pueden derivar GGUF/AWQ con herramientas externas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion TIES con Qwen/Qwen2.5-14B-Instruct como base y Orion-zhen/Qwen2.5-14B-Instruct-Uncensored como unico modelo adicional. La configuracion YAML indica `density: 0.55`, `weight: 0.50`, `normalize: true`, `int8_mask: true`, `rescale: false` y `dtype: bfloat16`, con `tokenizer_source: base` y `chat_template: auto`. TIES selecciona los parametros de mayor magnitud (trim), resuelve los conflictos de signo (elect), los promedia (merge) y aplica una mascara int8 para reducir interferencias entre los dos modelos fusionados.

No se ha realizado entrenamiento adicional: no hay etapa de preentrenamiento, SFT, RLHF ni DPO documentada en esta ficha. La arquitectura subyacente es la de Qwen2.5-14B-Instruct, un transformer decoder-only con atencion por ventanas deslizantes, RoPE, GQA y tokenizer BPE multiidioma; sin embargo, los detalles exactos de la variante sin censura (dataset, metodos de alineacion, hiperparametros) no estan disponibles en la informacion proporcionada. La innovacion tecnica destacable es, por tanto, el propio proceso de merging, no el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-14B-Instruct.
- Razonamiento y matematicas a nivel de un modelo de 14B denso, aunque sin datos de benchmark publicados en esta ficha.
- Generacion de codigo, presumiblemente con soporte de lenguajes habituales (Python, JavaScript, C++, etc.), aunque no verificado en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado explicitamente en la model card, pero el modelo base Qwen2.5-14B-Instruct lo soporta; la fusion puede haber degradado esta capacidad y requiere validacion.
- Capacidades de agente y razonamiento multi-paso: no confirmadas; dependen del comportamiento heredado del modelo base.
- Capacidades multilingues: no disponibles; el modelo base soporta varios idiomas, pero no se especifica el conjunto final.
- Modo "thinking" / cadena de pensamiento explicita: no disponible.
- Vision y audio: no soportados (modelo solo texto).
- Reduccion de rechazos: la inclusion de la variante "Uncensored" busca relajar las negativas del modelo alineado, aunque el grado exacto de relajacion no esta documentado.

## Casos de uso

- Generacion de texto creativo y narrativa: el modelo puede producir ficcion, dialogos y contenido largo en un solo turno; la fusion con una variante sin censura puede reducir rechazos en temas sensibles, aunque requiere revision editorial humana.
- Prototipado de asistentes conversacionales: al ser compatible con transformers y TGI, se puede desplegar como backend de un chatbot multi-turno en entornos de desarrollo, validando antes el comportamiento en dominios concretos.
- Investigacion sobre model merging: sirve como caso de estudio reproducible de la tecnica TIES con `density: 0.55` y `weight: 0.50`, util para comparar la degradacion o preservacion de capacidades frente a los modelos originales.
- Generacion de codigo en pipelines internos: si se confirma el soporte de tool calling del modelo base, puede integrarse en asistentes de IDE o revision de codigo, siempre con tests automatizados que detecten regresiones.
- Analisis y resumen de documentos: con contexto largo (si se confirma el soporte de 128K del base), puede resumir informes o extraer entidades en flujos batch, aunque la falta de datos de evaluacion obliga a medir calidad por dominio.
- Experimentacion con alineacion y seguridad: util para estudiar como la fusion con una variante sin censura afecta a las tasas de rechazo, sesgos y toxicidad, en entornos de investigacion controlados.
- Fine-tuning posterior: al publicarse en safetensors y transformers, puede servir como punto de partida para SFT o LoRA en dominios especializados, con la ventaja de partir de un modelo ya fusionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y no se dispone de datos de throughput o latencia medidos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 29,5 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se recomienda al menos 32-40 GB para contextos moderados.
- VRAM estimada en cuantizacion 8 bits (int8/AWQ/GPTQ): en torno a 15-16 GB de pesos, con margen adicional para cache.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M): en torno a 8-9 GB de pesos, apto para GPUs consumer de 12 GB o mas con contexto reducido.
- GPU recomendadas: A100 40GB/80GB, H100 80GB, L40S 48GB para bfloat16; RTX 4090 24GB solo con cuantizacion 8 o 4 bits.
- Cabe en GPU consumer: si, con cuantizacion 4 bits en RTX 3090/4090 (24GB) o RTX 4070 Ti Super (16GB) con contexto limitado; en bfloat16 no cabe en consumer de 24GB sin offloading.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles tipo OpenAI (tag `endpoints_compatible`); tambien es posible convertir a GGUF para llama.cpp/Ollama y a AWQ/GPTQ para vLLM, aunque no se documenta en la ficha.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-158 | ~14,8B | no disponible | no disponible | safetensors (bf16) | Fusion TIES de Qwen2.5-14B-Instruct y su variante sin censura |
| Qwen/Qwen2.5-14B-Instruct | ~14,8B | hasta 131.072 tokens (segun documentacion del base) | Apache 2.0 (segun el modelo original; no confirmado en esta ficha) | safetensors | Modelo oficial alineado, con benchmarks publicados por Qwen |
| Orion-zhen/Qwen2.5-14B-Instruct-Uncensored | ~14,8B | no disponible | no disponible | safetensors | Variante afinada para reducir rechazos, sin evaluacion publica en esta ficha |
| Mistral-Nemo-Instruct-2407 | ~12B | 128K | Apache 2.0 | safetensors | Alternativa densa de tamano similar con licencia permisiva y benchmarks publicos |

La comparativa se limita a parametros y disponibilidad; no se dispone de datos de rendimiento del modelo fusionado para contrastar con las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evaluacion publicada que confirme que la fusion preserva las capacidades del modelo base; el rendimiento real es incierto.
- Riesgo de degradacion por merging: TIES con `density: 0.55` puede eliminar o promediar parametros relevantes, afectando a razonamiento, codigo o tool calling de forma no documentada.
- Sesgos y alucinacion: al fusionarse con una variante sin censura, pueden aflorar sesgos, contenido toxico o afirmaciones no verificadas con mayor facilidad; no se han publicado analisis de seguridad.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; el modelo base Qwen2.5 suele ser Apache 2.0, pero la variante Orion-zhen no declara licencia en esta ficha, lo que bloquea su uso en produccion sin aclaracion legal.
- Idiomas no declarados: no se especifica el conjunto final de idiomas soportados; el comportamiento multilingue puede diferir del base.
- Contexto no confirmado: aunque el base soporte 128K, la fusion no documenta la longitud efectiva; conviene validar con pruebas de aguja en pajar.
- Sin garantias de soporte: el autor (MergekitCloud) no ofrece mantenimiento, versionado ni canal de issues; el modelo se publico y actualizo el mismo dia (2026-11-05) sin descargas ni likes.
- Tokenizer y chat template: se usa el del modelo base (`tokenizer_source: base`, `chat_template: auto`), pero no se verifica que el template sea coherente con el comportamiento fusionado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-158
- Modelo base oficial: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Variante sin censura: https://huggingface.co/Orion-zhen/Qwen2.5-14B-Instruct-Uncensored
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Paper de TIES: https://arxiv.org/abs/2306.01708
