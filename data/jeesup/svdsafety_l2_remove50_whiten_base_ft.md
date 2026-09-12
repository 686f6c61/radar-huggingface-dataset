# Jeesup/svdsafety_l2_remove50_whiten_base_ft

## Resumen

`svdsafety_l2_remove50_whiten_base_ft` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se construye a partir de `meta-llama/Llama-2-7b-chat-hf`, al que se aplica una compresión SVD-LLM con eliminación del 50,00 % de los parámetros densos, seguida de un presupuesto de restauración de componentes SVD del 0,000 % (es decir, cero componentes restaurados y cero componentes sustituidos).

El artefacto forma parte de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes lo repara mejor. Según la propia model card, es una celda de una rejilla que cruza reglas de selección y presupuestos, y varias celdas de esa rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat. No es, por tanto, un asistente de propósito general ni un modelo listo para producción.

El interés actual del checkpoint es metodológico: permite medir la tasa de éxito de ataques (attack success rate) y la pérdida de utilidad inducidas por la compresión, y sirve como sujeto experimental reproducible (semilla 42) para investigaciones de compresión e interpretabilidad. El repositorio acumula 0 descargas y 0 likes, y se distribuye bajo la Llama 2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2, con matrices de pesos comprimidas mediante SVD-LLM (aproximación de bajo rango basada en descomposición en valores singulares) |
| Parametros totales | 6.738.415.616 según los tensores safetensors del repositorio; la model card declara una fracción de parámetros resultante de 0,4999 (ver advertencias) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama-2-7b-chat emplea 4096 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos sin cuantizar en safetensors) |
| Idiomas soportados | no disponible (la model card no los especifica; el modelo base está entrenado mayoritariamente en inglés) |
| Licencia | Llama 2 Community License; se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

Datos adicionales de procedencia declarados en la model card: compresión SVD-LLM al 50,00 % de parámetros eliminados, regla de selección registrada literalmente como `unknown`, presupuesto de restauración de 0,000 %, 0 componentes restaurados, 0 componentes sustituidos, fracción de parámetros resultante 0,4999 y semilla 42.

## Arquitectura y entrenamiento

La base es la arquitectura Llama 2 en configuración 7B-chat: transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE para posiciones y atención causal. Sobre esa base se aplica SVD-LLM, una técnica que trunca las matrices de pesos sustituyéndolas por su aproximación de rango reducido a partir de la descomposición en valores singulares, de modo que se conservan únicamente los componentes principales y se descartan el resto. En este checkpoint el truncamiento elimina el 50,00 % de los parámetros densos y no se restaura ningún componente SVD (presupuesto 0,000 %).

El nombre del artefacto incluye el sufijo `ft`, y las etiquetas de HuggingFace lo marcan como `base_model:finetune:meta-llama/Llama-2-7b-chat-hf`, lo que indica que hubo algún ajuste fino posterior a la compresión. Sin embargo, la model card no documenta el corpus de ajuste, el número de tokens, la composición del dataset ni si se emplearon técnicas de alineación adicionales como RLHF o DPO; todo ello debe considerarse **no disponible**. La única información reproducible es la semilla (42) y los parámetros de la rejilla de compresión. La innovación técnica relevante no es arquitectónica sino metodológica: el checkpoint existe como sujeto experimental para cuantificar el daño a la seguridad causado por la compresión y evaluar reglas de selección de componentes.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama-2-7b-chat, condicionada por la pérdida de capacidad introducida por la compresión al 50 %.
- Razonamiento y respuesta a instrucciones en inglés, con degradación esperable respecto al modelo sin comprimir.
- Comportamiento de seguridad **degradado de forma deliberada** en varias celdas de la rejilla de estudio: la propia model card advierte de que la compresión por sí sola eleva la tasa de éxito de ataques.
- Soporte de tool calling o function calling: no disponible; no se documenta ninguna capacidad de este tipo en la model card y Llama-2-chat base no incorpora un protocolo de herramientas nativo.
- Soporte de agentes y razonamiento multi-paso: no disponible; no documentado.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Capacidad de interés real: servir como referencia experimental reproducible para estudiar interpretabilidad de pesos y compresión de modelos.

## Casos de uso

- **Medición de la degradación de seguridad bajo compresión**: ejecutar baterías de red teaming (por ejemplo, conjuntos de prompts adversariales tipo AdvBench o HarmBench) contra este checkpoint y contra Llama-2-7b-chat sin comprimir para cuantificar el incremento de la tasa de éxito de ataques atribuible al truncamiento SVD del 50 %.
- **Evaluación comparativa de reglas de selección de componentes SVD**: al ser una celda de una rejilla sobre reglas de selección y presupuestos, permite aislar el efecto de cada regla manteniendo constantes la compresión (50 %), el presupuesto de restauración (0 %) y la semilla (42).
- **Investigación en interpretabilidad de pesos**: estudiar qué componentes singulares concretos concentran comportamientos de rechazo o de seguridad, analizando la diferencia entre este checkpoint y el modelo base a nivel de matriz de pesos.
- **Referencia de reproducibilidad en estudios de compresión**: con semilla 42 y parámetros de compresión documentados, sirve como punto de control para replicar resultados o comparar contra otras técnicas de compresión (poda no estructurada, cuantización, low-rank alternativo) bajo un protocolo fijo.
- **Auditoría de artefactos derivados de Llama 2**: caso de uso para equipos que necesitan evaluar el impacto de derivados comunitarios antes de autorizar su uso interno, dado que el repositorio incluye `LICENSE.txt` y `USE_POLICY.md` y declara explícitamente su naturaleza experimental.
- **Docencia y formación en seguridad de modelos**: ilustrar de forma práctica que la compresión agresiva de un modelo alineado puede erosionar sus salvaguardas, usando este checkpoint como demostración controlada y no desplegable.

En ningún caso estos usos implican servir el modelo a usuarios finales: la model card pide explícitamente tratar cada celda como sujeto experimental y evaluarla antes de extraer conclusiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni tasas de éxito de ataques, y los resultados de la búsqueda web proporcionada (horóscopos, hilos sobre interfaces de Gemini y un artículo genérico sobre modelos multimodales) no contienen ningún dato de evaluación atribuible a este checkpoint.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el repositorio ocupa 13,5 GB, coherente con pesos en FP16/BF16 de un modelo de ~6,74 mil millones de parámetros. En FP16 requiere en torno a 13,5-14 GB de VRAM para pesos, más overhead de contexto y caché KV. En INT8, aproximadamente 7 GB. En 4 bits, aproximadamente 3,5-4 GB.
- **GPU recomendadas**: para FP16, una A100 40 GB, H100 80 GB o L40S 48 GB ofrecen margen amplio; una RTX 4090 de 24 GB o una RTX 3090 de 24 GB son suficientes para FP16 con contexto corto.
- **Cabe en GPU de consumo**: sí. RTX 4090 y RTX 3090 ejecutan FP16 con comodidad y 4 bits con holgura; tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070, etc.) pueden ejecutarlo en 4 bits, con posible offload parcial de capas a CPU.
- **Opciones de despliegue**: `transformers` (librería declarada) y text-generation-inference, dado que el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, conversión que no se proporciona en el repositorio. vLLM es viable siempre que los pesos safetensors sean compatibles, algo no verificado en la información disponible.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svdsafety_l2_remove50_whiten_base_ft (este) | 6.738.415.616 según safetensors; fracción declarada 0,4999 | no disponible | SVD-LLM al 50,00 %, restauración 0,000 % | Llama 2 Community License | HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (base) | ~6,74 mil millones | 4096 tokens (según el modelo base; no confirmado en la información de este repositorio) | ninguna | Llama 2 Community License | HuggingFace, ampliamente distribuido |
| Otras celdas de la misma rejilla de estudio | no disponible | no disponible | distintas reglas de selección y presupuestos de restauración | Llama 2 Community License | no disponible |
| Otras técnicas de compresión sobre Llama-2-7b (poda, cuantización) | no disponible | no disponible | no disponible | dependiente de cada artefacto | no disponible |

No se dispone de datos de rendimiento comparado (benchmarks de utilidad o de seguridad) para ninguno de los artefactos de la rejilla, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- **Artefacto de investigación, no desplegable**: la model card es explícita al indicar que no es un asistente de propósito general y que debe tratarse como sujeto experimental.
- **Seguridad degradada de forma deliberada**: la compresión por sí sola eleva la tasa de éxito de ataques frente a Llama-2-7b-chat, y varias celdas de la rejilla están diseñadas para estar degradadas. No conviene exponerlo a usuarios ni integrarlo en ningún flujo con entrada de terceros.
- **Discrepancia en el recuento de parámetros**: los tensores safetensors suman 6.738.415.616 parámetros, cifra prácticamente idéntica a la del Llama-2-7b-chat sin comprimir, mientras que la model card declara una fracción de parámetros resultante de 0,4999. No se ha localizado documentación que explique esta diferencia; conviene verificar el checkpoint antes de asumir cualquier ahorro de memoria o de cómputo.
- **Metadatos incompletos**: la regla de selección de componentes aparece registrada literalmente como `unknown`, lo que impide reproducir con exactitud esa dimensión del experimento.
- **Riesgo de alucinación**: no cuantificado en la información disponible, pero previsiblemente igual o superior al del modelo base tras eliminar el 50 % de los parámetros densos.
- **Idiomas y contexto**: la model card no especifica idiomas soportados ni longitud de contexto, y no hay garantía de que el comportamiento multilingüe del modelo base se preserve tras la compresión.
- **Datos de ajuste fino desconocidos**: se sabe que hubo un ajuste fino (etiqueta `finetune` y sufijo `ft`), pero no se documenta el corpus, su tamaño ni su composición, lo que impide auditar sesgos introducidos.
- **Restricciones de licencia**: Llama 2 Community License. El uso está vinculado a `LICENSE.txt` y `USE_POLICY.md`, incluye obligaciones de atribución ("Built with Llama 2"), requisitos de nomenclatura para productos derivados y restricciones de escala (cláusula de usuarios activos mensuales) propias de esta licencia. Cualquier uso comercial debe revisarse contra el texto completo de la licencia.
- **Sin validación de terceros**: 0 descargas y 0 likes; no hay informes independientes de calidad, estabilidad ni seguridad.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Jeesup/svdsafety_l2_remove50_whiten_base_ft
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y política de uso incluidas en el repositorio: `LICENSE.txt` y `USE_POLICY.md` (rutas relativas dentro de https://huggingface.co/Jeesup/svdsafety_l2_remove50_whiten_base_ft)
- Paper de Llama 2 (referencia del modelo base): https://arxiv.org/abs/2307.09288
- No se han encontrado en la búsqueda web enlaces adicionales relevantes (papers, blogs, repos o demos) sobre este checkpoint o sobre la técnica SVD-LLM aplicada al mismo.
