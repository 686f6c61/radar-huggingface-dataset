# Jeesup/svd-safety-l2_remove60_swapdisc_b010

## Resumen

`Jeesup/svd-safety-l2_remove60_swapdisc_b010` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se trata de un artefacto derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD-LLM que elimina el 60,01 % de los parámetros densos (fracción resultante declarada: 0,3999), seguida de una restauración parcial del 1,000 % del presupuesto de parámetros mediante componentes SVD seleccionados con la regla `swapdisc`. El resultado son 5822 componentes restaurados y 5822 componentes sustituidos, con semilla 42.

El interés del modelo no es su utilidad como asistente, sino que constituye una celda concreta de una malla experimental sobre reglas de selección de componentes y presupuestos de restauración. El objetivo declarado del estudio es cuantificar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección repara mejor ese daño. La model card advierte explícitamente de que varias celdas de la malla están degradadas en seguridad de forma deliberada y de que este checkpoint no es un modelo de chat de propósito general.

A nivel de arquitectura hereda la del modelo base: un transformer decoder-only de 7B parámetros con contexto de 4096 tokens. La relevancia actual es metodológica: sirve como referencia reproducible para investigar el equilibrio entre compresión, utilidad (perplejidad) y seguridad (tasa de éxito de ataques) en modelos abiertos, un eje poco cubierto en la literatura de compresión.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama-2-7b-chat); compresión mediante descomposición en valores singulares (SVD-LLM) |
| Parámetros totales | 6.738.415.616 según los safetensors del repositorio (la model card declara una fracción de parámetros densos resultante de 0,3999) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors sin cuantizaciones declaradas |
| Idiomas soportados | No declarados en la model card; el modelo base está entrenado predominantemente en inglés |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |
| Autor | Jeesup |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Metodo de compresion | SVD-LLM, 60,01 % de parámetros eliminados |
| Regla de seleccion de componentes | `swapdisc` |
| Presupuesto de restauracion | 1,000 % de los parámetros densos |
| Componentes restaurados / sustituidos | 5822 / 5822 |
| Semilla | 42 |
| Tamaño del repositorio | 13,5 GB |
| Pipeline declarado | text-generation |

Observación de coherencia: el recuento de parámetros que reportan los safetensors (6.738.415.616) coincide con el del modelo denso original, mientras que la model card indica una fracción resultante de 0,3999. La información disponible no especifica cómo se materializa esa reducción sobre los tensores almacenados, por lo que conviene verificar la estructura real del checkpoint antes de asumir un ahorro de memoria proporcional.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B chat: transformer decoder-only con normalización RMSNorm por capa, activación SwiGLU en la MLP, embeddings posicionales rotatorios (RoPE) y atención multi-cabeza (no GQA, a diferencia de las variantes 34B y 70B de la misma familia). El checkpoint no se ha entrenado desde cero: parte de los pesos ya ajustados de `meta-llama/Llama-2-7b-chat-hf`, que a su vez combina preentrenamiento sobre un corpus público de aproximadamente 2 billones de tokens con ajuste supervisado y optimización por preferencias humanas (RLHF). La información proporcionada no detalla los datos usados en esa fase.

La innovación técnica del artefacto es el procedimiento de compresión y reparación. Primero se aplica SVD-LLM para eliminar el 60,01 % de los parámetros densos, lo que reduce la capacidad del modelo pero también altera su comportamiento de rechazo. Después se reintroducen componentes SVD de bajo rango hasta consumir un presupuesto del 1,000 % de los parámetros densos, eligiéndolos con la regla `swapdisc`: se restauran 5822 componentes y se sustituyen otros 5822. No hay en la información disponible detalles sobre el criterio exacto de `swapdisc`, sobre el conjunto de calibración empleado ni sobre si hubo ajuste adicional posterior a la restauración.

## Capacidades

- Generación de texto conversacional en el formato de prompt de Llama 2 chat (etiquetas `[INST]` y `<<SYS>>`), degradada respecto al modelo base por efecto de la compresión.
- Razonamiento de propósito general y respuesta a instrucciones en inglés, con calidad mermada: la perplejidad en WikiText-2 declarada es de 18,5577.
- Capacidad reducida de rechazo de peticiones dañinas, cuantificada con una tasa de éxito de ataque (ASR) de 0,1596 en AdvBench y 0,1502 en StrongREJECT, ambas evaluadas con el juez de HarmBench.
- Tendencia elevada a la sobrerrechazo: 0,2586 de macro over-refusal medido con WildGuard, es decir, rechaza aproximadamente una de cada cuatro peticiones legítimas.
- No se declara soporte de tool calling ni de function calling; Llama 2 chat no incorpora plantilla nativa de herramientas.
- No se declara soporte específico para agentes ni razonamiento multi-paso estructurado.
- Sin capacidades multimodales: no hay visión, audio ni entrada distinta de texto.
- Sin modo de pensamiento explícito (thinking mode) ni decodificación especulativa documentada.
- Idiomas: no declarados; se asume el perfil predominantemente anglófono del modelo base.

## Casos de uso

- Auditoría de seguridad de modelos comprimidos: ejecutar AdvBench y StrongREJECT con el juez de HarmBench sobre este checkpoint y comparar la ASR con la del Llama-2-7b-chat denso para cuantificar cuánta seguridad destruye la eliminación del 60,01 % de parámetros.
- Investigación en interpretabilidad de componentes SVD: analizar qué subespacios de las matrices de pesos concentran el comportamiento de rechazo, aprovechando que el checkpoint documenta exactamente qué 5822 componentes se restauraron y cuáles se sustituyeron.
- Reproducción de experimentos de malla: la semilla 42 y los parámetros de compresión declarados permiten replicar esta celda concreta y compararla con las demás reglas de selección del mismo estudio.
- Estudio del equilibrio seguridad/utilidad: cruzar la perplejidad de WikiText-2 (18,5577) con las métricas de ASR y de sobrerrechazo para trazar la frontera de Pareto de cada presupuesto de restauración.
- Medición de sobrerrechazo en pipelines de evaluación: usar el checkpoint como caso de prueba para validar clasificadores tipo WildGuard, ya que su 0,2586 de over-refusal lo sitúa en un régimen distinto al de un modelo alineado estándar.
- Línea base metodológica en comparativas de compresión: contrastar SVD-LLM con alternativas de cuantización (4-bit, 8-bit) o poda estructurada bajo las mismas métricas de seguridad y perplejidad.
- Docencia y formación en evaluación de riesgos: ilustrar con un caso real y reproducible cómo un procedimiento de compresión aparentemente neutro modifica propiedades de alineación.
- Investigación sobre reparación post-compresión: punto de partida para probar ajuste supervisado, DPO o intervenciones de dirección de activaciones orientadas a recuperar la tasa de rechazo perdida.

## Benchmarks y rendimiento

| Metrica | Valor | Metodo de evaluacion |
|---|---|---|
| AdvBench ASR | 0,1596 | Juez de HarmBench |
| StrongREJECT ASR | 0,1502 | Juez de HarmBench |
| Macro over-refusal | 0,2586 | WildGuard |
| Perplejidad WikiText-2 | 18,5577 | No especificado |

La model card proporciona únicamente estos cuatro valores. No se publican resultados comparativos frente al modelo base ni frente a otras celdas de la malla, ni métricas de MMLU, HumanEval, GSM8K u otras tareas de capacidades generales. Tampoco se indica el valor de referencia de perplejidad del Llama-2-7b-chat sin comprimir, por lo que no es posible calcular la degradación relativa con la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 13,5 GB solo para pesos (tamaño del repositorio), más caché KV de aproximadamente 2 GB con los 4096 tokens de contexto llenos, lo que sitúa el consumo práctico en 15-16 GB.
- VRAM estimada con cuantización de 8 bits: aproximadamente 7 GB de pesos; con 4 bits, alrededor de 3,5-4 GB (estimaciones a partir del recuento de parámetros, no verificadas sobre este checkpoint, que no publica pesos cuantizados).
- GPU de datacenter: cabe sin problema en A100 40 GB, A100 80 GB, H100 y L40S; también en GPUs de 24 GB como la RTX 4090 o la L4 con 24 GB.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar el modelo en FP16. En tarjetas de 8-12 GB (RTX 3060, RTX 4060 Ti, RTX 4070) solo es viable con cuantización de 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (el repositorio incluye los tags `text-generation-inference` y `endpoints_compatible`), y servidores compatibles con pesos safetensors como vLLM. No se publican pesos GGUF, por lo que su uso en llama.cpp u Ollama requeriría una conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: dado que la model card declara una fracción de parámetros densos de 0,3999 pero los safetensors suman 6.738.415.616 parámetros, conviene medir el consumo real de memoria en lugar de extrapolarlo del porcentaje declarado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| svd-safety-l2_remove60_swapdisc_b010 | 6.738.415.616 almacenados; fracción densa declarada 0,3999 | 4096 | Llama 2 Community License | Publicado, artefacto de investigación |
| meta-llama/Llama-2-7b-chat-hf (base) | 6.738.415.616 | 4096 | Llama 2 Community License | Público, ampliamente desplegado |
| Otras celdas de la malla SVD del mismo autor | No disponible | 4096 (presumiblemente) | Llama 2 Community License | No disponibles en la información proporcionada |
| Alternativas modernas de tamaño similar (por ejemplo, familia Llama 3.1 8B) | 8.030 M | 128 000 | Llama 3.1 Community License | Públicas |

No se dispone de métricas comparativas (ASR, perplejidad, MMLU) para el modelo base ni para las demás celdas de la malla, de modo que la comparación cuantitativa de rendimiento no es posible con los datos aportados. La diferencia cualitativa fundamental es que este checkpoint es un sujeto experimental con seguridad degradada de forma deliberada, no un asistente desplegable.

## Limitaciones y advertencias

- Seguridad degradada de forma intencionada: la propia model card advierte de que varias celdas de la malla son deliberadamente menos seguras que Llama-2-7b-chat y que la compresión por sí sola eleva la tasa de éxito de ataques. Con un ASR de 0,1596 en AdvBench y 0,1502 en StrongREJECT, este checkpoint no debe exponerse a usuarios finales.
- Riesgo de sobrerrechazo: 0,2586 de macro over-refusal implica que rechaza aproximadamente una de cada cuatro peticiones legítimas, lo que lo inhabilita para tareas conversacionales generales.
- Pérdida de utilidad: la perplejidad de WikiText-2 de 18,5577 indica un modelado del lenguaje claramente peor que el de un modelo de 7B sin comprimir; no se aporta la cifra de referencia para cuantificar el delta.
- Alucinación: no se publican métricas de veracidad ni de fidelidad factual. Cualquier uso generativo debe asumir un riesgo de alucinación superior al habitual, coherente con la pérdida de capacidad por compresión.
- Idiomas: no se declaran idiomas soportados; el modelo base está entrenado principalmente en inglés y el comportamiento multilingüe no se ha evaluado en esta variante.
- Contexto limitado a 4096 tokens, insuficiente para cargas de trabajo con documentación extensa o conversaciones multi-turno largas.
- Ausencia de tool calling y de agentes: no hay plantilla de herramientas ni evaluación de razonamiento multi-paso, por lo que no es apto como backend de agentes.
- Licencia: Llama 2 Community License con `USE_POLICY.md` adicional. Impone condiciones de atribución (aviso "Built with Llama"), obligaciones de redistribución de la licencia y requisitos de nombrado para productos derivados; además, el uso comercial por parte de entidades con más de 700 millones de usuarios mensuales requiere una licencia aparte de Meta. Conviene revisar la conformidad del nombre del checkpoint con esas condiciones antes de redistribuirlo.
- Producción: la model card indica explícitamente que cada celda debe tratarse como sujeto experimental y evaluarse de forma independiente antes de extraer conclusiones. No hay garantías de estabilidad entre revisiones.
- Reproducibilidad: no se detalla el criterio exacto de la regla `swapdisc`, el conjunto de calibración ni los hiperparámetros del SVD-LLM más allá de los porcentajes, lo que dificulta la replicación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove60_swapdisc_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y política de uso: `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio del modelo (misma URL raíz)
- Referencia metodológica citada en la model card: SVD-LLM (no se proporciona enlace en la información disponible)
- Búsqueda web: no se han encontrado resultados relevantes. Las consultas devolvieron exclusivamente páginas de novelas y cómics sin relación con el modelo, por lo que no se aportan enlaces adicionales.
