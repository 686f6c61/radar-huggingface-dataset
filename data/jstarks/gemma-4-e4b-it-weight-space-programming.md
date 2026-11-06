# jstarks/gemma-4-E4B-it-weight-space-programming

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un parche de pesos (*weight-space patch*) para `google/gemma-4-E4B-it`, el modelo multimodal de Google con 8.000 millones de parámetros totales y 4.000 millones activos en texto. El parche lo publica el usuario `jstarks` y se inspira en el trabajo de Takehi et al. (MIT CSAIL) sobre *weight-space programming*, una técnica de interpretabilidad mecanicista que edita directamente tensores del modelo sin ningún paso de descenso de gradiente ni ajuste fino.

El problema que aborda es concreto: en el modelo base, activar el modo `<|think|>` provoca dos patologías. Por un lado, el modelo se queda atrapado en esquemas markdown verbosos o alucina rechazos temporales en lugar de invocar herramientas declaradas; por otro, en problemas matemáticos multi-paso genera bucles de meta-comentario que agotan el presupuesto de tokens. El parche modifica 64 columnas de `down_proj` en las capas 38 a 41, lo que supone 163.840 parámetros, es decir, el 0,00205 % del modelo.

La relevancia es doble: demuestra que una intervención quirúrgica de menos de 1 MB puede corregir comportamientos de agente sin reentrenar, y ofrece un método reproducible para quienes despliegan Gemma 4 E4B en pipelines con *tool calling*. El parche se distribuye como un fichero `safetensors` de unos 656 KB que se aplica sobre una instancia ya cargada en PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), con capas de atención global y capas con KV compartida; parche sobre módulos MLP `down_proj` |
| Parámetros totales | 8.000 millones (modelo base) |
| Parámetros activos | 4.000 millones en texto (modelo base, arquitectura MoE) |
| Parámetros editados por el parche | 163.840 (0,00205 % del modelo) en 64 columnas de `down_proj`, capas 38 a 41 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el parche se aplica en `bfloat16`; el modelo base admite las cuantizaciones habituales de su ecosistema) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | `safetensors` (parche de ~656 KB); el modelo base en `safetensors` vía `transformers` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Gemma 4 con 8.000 millones de parámetros totales y 4.000 millones activos en texto. La model card documenta un detalle arquitectónico relevante: las capas 0 a 23 tienen cabeceras KV independientes, mientras que las capas 24 a 41 (`num_kv_shared_layers = 18`) comparten estados KV. La capa 23 actúa como frontera global de atención completa, con un `post_feedforward_layernorm` cuyo peso medio es 26,16 (frente a 0,5–2,7 en el resto), compensado por un `layer_scalar` aprendido de 0,0654.

El parche no implica entrenamiento alguno: no hay descenso de gradiente, retropropagación ni ajuste fino. Se editan directamente 64 columnas de la matriz `down_proj` en las capas 38 a 41, seleccionadas mediante análisis mecanicista. La innovación técnica clave es la cirugía precondicionada por RMSNorm: como cada capa pasa `mlp(x)` por `post_feedforward_layernorm` antes de sumarlo al flujo residual, la dirección residual objetivo se precondiciona multiplicándola por `max(|w_post|, 0.25)^-1` para que las coordenadas atípicas de norma alta en `w_post` no distorsionen la proyección de vocabulario. El método sigue la línea del artículo *Sparks of Weight-Space Programming* de Takehi et al. (MIT CSAIL).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito (`<|think|>`, activable con `enable_thinking=True`).
- Invocación de herramientas (`<|tool_call>`) con el parche aplicado: la tasa de llamadas válidas pasa del 0,0 % al 75,0 % en la suite de evaluación del autor.
- Razonamiento matemático multi-paso dentro de un presupuesto de 420 tokens: la tasa de resolución sube del 33,3 % al 66,7 %.
- Restricción de herramientas: mantiene el 100 % de acierto al no invocar búsqueda cuando la pregunta es de conocimiento directo.
- Bucles de agente de extremo a extremo con búsqueda web real (DuckDuckGo): síntesis fundamentada en 2 de 3 ejecuciones tras el parche, frente a 0 de 3 antes.
- Capacidades multimodales heredadas del modelo base `gemma-4-E4B-it` (no evaluadas en la model card del parche).
- Capacidades multilingües: no documentadas en este repositorio.

## Casos de uso

- Agentes con *tool calling* en producción: el parche corrige la parálisis que impedía al modelo emitir `<|tool_call>` válidos al activar el modo de pensamiento, lo que lo hace utilizable en orquestadores que dependen de llamadas estructuradas a APIs externas.
- Búsqueda web aumentada: el bucle de agente con DuckDuckGo documentado en la suite D muestra que el modelo parcheado puede encadenar búsqueda, lectura y síntesis fundamentada, un requisito habitual en asistentes de investigación.
- Asistentes de resolución matemática: con el bucle de meta-comentario suprimido, el modelo entra directamente en la derivación algebraica, lo que reduce el consumo de tokens y encaja en interfaces con presupuesto de respuesta acotado.
- Enrutadores de intención con contención de herramientas: la suite C confirma que el parche no degrada la capacidad de decidir cuándo *no* buscar, algo crítico en asistentes que facturan por llamada a API.
- Despliegue en GPU de consumo: al aplicarse sobre el modelo cargado en `bfloat16` (9,29 GB de VRAM en una RTX 4070 Ti con PLE descargado a CPU), permite prototipar agentes en hardware de gama media sin reentrenar.
- Investigación en interpretabilidad mecanicista: sirve como caso de estudio reproducible de edición de pesos dirigida, con índices de columnas y transcripciones completas en `benchmark_before_after.json`.
- Reducción de coste por consulta: la caída del 47,1 % en tokens generados y la mejora de latencia de 1,97x en la suite A se traducen directamente en menor coste de inferencia en despliegues con modo de pensamiento activo.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, comparando el modelo base con el parche aplicado:

| Suite | Métrica | Antes | Después | Delta |
|---|---|---|---|---|
| Modificación del modelo | Parámetros editados (`bfloat16`) | 0 (0,0 %) | 163.840 (0,00205 %) | 64 columnas MLP (L38–L41) |
| A: pensamiento + búsqueda web (8 consultas) | Tasa de `<|tool_call>` válido | 0,0 % (0/8) | 75,0 % (6/8) | +75,0 % |
| A: eficiencia | Tokens medios / latencia media (RTX 4070 Ti) | 243,8 tok / 15,46 s | 129,0 tok / 7,85 s | −47,1 % tokens / 1,97x más rápido |
| B: matemáticas multi-paso con `<|think|>` (6 problemas) | Resueltos en 420 tokens | 33,3 % (2/6) | 66,7 % (4/6) | +33,4 % (2x) |
| C: conocimiento directo + contención (6 prompts) | Contención de herramientas (sin búsqueda falsa) | 100,0 % (6/6) | 100,0 % (6/6) | 0,0 % de degradación |
| D: bucle de agente DuckDuckGo en vivo (3 ejecuciones) | Síntesis fundamentada extremo a extremo | 0,0 % (0/3) | 66,7 % (2/3) | +66,7 % |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base en `bfloat16`: 9,29 GB, con las capas PLE descargadas a CPU, según la model card.
- El parche en sí ocupa unos 656 KB y se aplica en memoria tras cargar el modelo; no añade requisitos de VRAM apreciables.
- GPU validadas por el autor: RTX 4070 Ti (12 GB) con descarga parcial a CPU.
- Cabe en GPU de consumo de 12 GB o superior; para 16 GB o más no se documenta configuración, pero el modelo base en `bfloat16` completo requeriría más memoria.
- Opciones de despliegue: `transformers` en PyTorch con los scripts `apply_patch.py` y `model_loader.py` del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 7,85 s de media por consulta en la suite A tras el parche, frente a 15,46 s antes, sobre RTX 4070 Ti.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jstarks/gemma-4-E4B-it-weight-space-programming` | 8B totales / 4B activos (base) + parche de 163.840 parámetros | no disponible | Edición de pesos sin entrenamiento sobre Gemma 4 E4B | Gemma | HuggingFace, repo de 0,0 GB |
| `google/gemma-4-E4B-it` (base) | 8B totales / 4B activos | no disponible | Modelo multimodal instruct original | Gemma | HuggingFace |
| `unsloth/gemma-4-E4B-it` | 8B totales / 4B activos | no disponible | Distribución optimizada del modelo base | Gemma | HuggingFace |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- El parche se ha validado con conjuntos de evaluación pequeños: 8 consultas en la suite A, 6 problemas en la B, 6 prompts en la C y 3 ejecuciones en la D. La significación estadística es limitada.
- La tasa de `<|tool_call>` válido tras el parche es del 75,0 %, no del 100 %: uno de cada cuatro casos sigue fallando en la suite evaluada.
- La síntesis fundamentada en el bucle de agente alcanza 2 de 3 ejecuciones; persiste un fallo de cada tres en el escenario documentado.
- El parche está diseñado específicamente para `gemma-4-E4B-it`; aplicarlo a otras variantes o cuantizaciones puede producir resultados impredecibles, ya que la cirugía depende de índices de columna y normas concretas de las capas 38 a 41.
- La corrección se ha medido en `bfloat16`; no se documenta su comportamiento sobre pesos cuantizados (GGUF, AWQ, GPTQ).
- Riesgo de alucinación inherente al modelo base; el parche reduce ciertos bucles y rechazos temporales, pero no elimina la generación de contenido incorrecto.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos de Google antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB en el momento de la consulta: no hay evidencia de uso comunitario ni validación independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jstarks/gemma-4-E4B-it-weight-space-programming
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Distribución alternativa del base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Artículo de referencia (Takehi et al., MIT CSAIL): https://rikiyat.github.io/blog/weight-space-programming/
