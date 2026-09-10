# Jeesup/svd-safety-l2_remove60_swapdisc_b001

## Resumen

`Jeesup/svd-safety-l2_remove60_swapdisc_b001` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD-LLM, una tecnica de compresion basada en descomposicion en valores singulares que elimina componentes de las matrices de pesos. En concreto, se han eliminado el 60,01 % de los parametros densos (fraccion resultante de 0,3999) y despues se ha restaurado un presupuesto del 0,1 % de parametros mediante la regla de seleccion de componentes denominada `swapdisc`: 691 componentes restaurados y 691 sustituidos, con semilla 42.

El modelo no es un asistente de proposito general, sino un artefacto de investigacion. Forma parte de una rejilla experimental sobre reglas de seleccion de componentes y presupuestos de restauracion, cuyo objetivo es cuantificar como la compresion degrada el comportamiento de seguridad de Llama-2-7b-chat y que regla repara mejor ese dano. La model card advierte explicitamente de que varias celdas de la rejilla estan degradadas en seguridad de forma deliberada respecto al modelo base.

Su relevancia es metodologica: proporciona mediciones concretas del compromiso entre seguridad y utilidad bajo compresion (ASR de 0,3596 en AdvBench y 0,3195 en StrongREJECT con juez HarmBench, sobre-rechazo macro de 0,0721 medido con WildGuard y perplejidad de 17,7822 en WikiText-2), con lo que sirve como punto de referencia reproducible para estudiar compresion, alineamiento y seguridad en modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2); pesos comprimidos con SVD-LLM |
| Parametros totales | 6.738.415.616 segun los metadatos de safetensors; la model card declara una fraccion de parametros resultante de 0,3999 tras eliminar el 60,01 % de los parametros densos (la model card no aclara el desajuste entre ambas cifras) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens, heredada del modelo base Llama-2-7b-chat; no se especifica en la model card |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors (repo de 13,5 GB); no se incluyen variantes GGUF, AWQ, GPTQ ni cuantizaciones oficiales |
| Idiomas soportados | No disponible en la informacion proporcionada; el modelo base Llama-2-7b-chat esta orientado principalmente al ingles |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors, cargables con la libreria `transformers` |
| Modelo base | `meta-llama/Llama-2-7b-chat-hf` |
| Regla de seleccion | `swapdisc` |
| Presupuesto de restauracion | 0,100 % de los parametros densos (691 componentes restaurados, 691 sustituidos) |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), entrenado originalmente con ajuste de instrucciones y RLHF por parte de Meta. Sobre ese checkpoint no se ha realizado un entrenamiento nuevo: la transformacion es una compresion post-hoc mediante SVD-LLM, que descompone las matrices de pesos en componentes de bajo rango y descarta los de menor contribucion.

La innovacion del artefacto esta en la fase de restauracion. Tras eliminar el 60,01 % de los parametros densos, se reintroduce un presupuesto minimo del 0,1 % de parametros seleccionando componentes con la regla `swapdisc`, que restaura 691 componentes y retira otros 691 para mantener la fraccion de parametros objetivo de 0,3999. El resultado es una celda concreta de una rejilla experimental sobre reglas de seleccion y presupuestos, disenada para medir el dano en seguridad provocado por la compresion y la capacidad de recuperacion de cada regla. No se documentan en la informacion disponible ni el numero de tokens de un hipotetico reentrenamiento, ni la composicion del dataset de restauracion, ni el uso de RLHF o DPO posterior a la compresion.

## Capacidades

- Generacion de texto conversacional: conserva la plantilla de chat de Llama-2-7b-chat y responde a instrucciones multi-turno dentro del limite de contexto del modelo base.
- Generacion de texto general y modelado de lenguaje: utilizable para medir perplejidad y calidad de generacion bajo compresion.
- Razonamiento basico y respuesta a instrucciones: heredado del ajuste de instrucciones del modelo base, aunque degradado por la compresion.
- Capacidad multilingue: no documentada; el modelo base esta orientado principalmente al ingles.
- Tool calling / function calling: sin evidencia de soporte nativo; Llama-2-7b-chat no incorpora ese mecanismo y la model card no lo menciona.
- Uso como agente o razonamiento multi-paso: no documentado y no previsto por el autor.
- Vision, audio u otras modalidades: no soportadas; el checkpoint es exclusivamente de texto.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Uso previsto como sujeto experimental: medir tasa de exito de ataques (ASR), sobre-rechazo y perplejidad para estudiar el compromiso seguridad-utilidad bajo compresion SVD.

## Casos de uso

- Evaluacion de seguridad bajo compresion: cargar el checkpoint con `transformers` y ejecutar AdvBench o StrongREJECT con el juez HarmBench para reproducir el ASR declarado (0,3596 y 0,3195) y compararlo con otras celdas de la rejilla.
- Estudio de reglas de seleccion de componentes: usar esta celda como punto de comparacion frente a otras reglas (`swapdisc` frente a alternativas) con el mismo presupuesto del 0,1 %, para determinar que criterio repara mejor el comportamiento de rechazo.
- Analisis de sobre-rechazo: medir la tasa macro de sobre-rechazo con WildGuard (0,0721 declarado) sobre peticiones benignas y estudiar si la restauracion de componentes incrementa rechazos innecesarios.
- Investigacion en interpretabilidad: inspeccionar que componentes singulares restaurados correlacionan con la recuperacion de comportamiento de seguridad, comparando los 691 componentes restaurados con los 691 sustituidos.
- Analisis de la relacion perplejidad-seguridad: emplear la perplejidad de 17,7822 en WikiText-2 como eje de utilidad y cruzar los resultados de ASR para trazar curvas de compromiso dentro del mismo presupuesto de parametros.
- Reproducibilidad de experimentos: al fijar semilla 42 y presupuesto exacto, sirve como referencia auditable para replicar resultados de compresion SVD sobre Llama-2-7b-chat.
- Docencia e investigacion en alineamiento: usar el checkpoint como ejemplo controlado de como una intervencion puramente arquitectonica degrada salvaguardas, sin necesidad de reentrenar el modelo.

Conviene subrayar que ninguno de estos casos implica despliegue en produccion: el propio autor indica que la celda debe tratarse como sujeto experimental, no como asistente desplegable.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,3596 |
| StrongREJECT | ASR (juez HarmBench) | 0,3195 |
| WildGuard | Sobre-rechazo macro | 0,0721 |
| WikiText-2 | Perplejidad | 17,7822 |

No se publican en la informacion disponible los valores del modelo base sin comprimir ni de otras celdas de la rejilla, por lo que no es posible calcular la degradacion relativa a partir de los datos proporcionados.

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 13,5-16 GB solo para pesos (el repositorio ocupa 13,5 GB), mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 20-24 GB de VRAM para contexto largo.
- VRAM en cuantizacion de 8 bits: en torno a 7-9 GB de pesos.
- VRAM en cuantizacion de 4 bits: en torno a 4-5 GB de pesos, aunque el autor no publica variantes cuantizadas y habria que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para fp16 con margen; RTX 4090 o RTX 3090 (24 GB) suficientes para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, con contexto reducido) y en tarjetas de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM. No hay GGUF publicado, por lo que llama.cpp u Ollama requeririan una conversion previa y no estan validados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento de seguridad |
|---|---|---|---|---|---|
| svd-safety-l2_remove60_swapdisc_b001 | 6,74 B declarados en safetensors; fraccion densa 0,3999 segun la model card | 4096 tokens (heredado del base) | Llama 2 Community License | HuggingFace, 0 descargas, 0 likes | ASR 0,3596 (AdvBench) y 0,3195 (StrongREJECT); sobre-rechazo 0,0721 |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4096 tokens | Llama 2 Community License | Ampliamente disponible en HuggingFace | No disponible en la informacion proporcionada (el autor no incluye la linea base) |
| Otras celdas de la rejilla del mismo autor | No disponible | 4096 tokens | Llama 2 Community License | No disponible en la busqueda realizada | No disponible |

No se dispone de datos publicados en la informacion proporcionada para comparar con alternativas de compresion como poda estructurada, cuantizacion o destilacion, ni con modelos del mismo tamano de otros fabricantes. La comparativa cuantitativa queda por tanto limitada al modelo base, cuyo rendimiento no se reporta en esta model card.

## Limitaciones y advertencias

- Artefacto de investigacion, no desplegable: el autor indica explicitamente que no es un modelo de chat de proposito general y que debe evaluarse antes de extraer conclusiones.
- Seguridad degradada de forma deliberada: la compresion eleva la tasa de exito de ataques y parte de la rejilla se diseno para degradar la seguridad; el ASR de 0,3596 en AdvBench implica que aproximadamente una de cada tres peticiones maliciosas tiene exito segun el juez HarmBench.
- Riesgo alto de contenido inseguro o danino: no debe exponerse a usuarios finales, ni integrarse en productos, ni utilizarse como generador de respuestas en produccion.
- Alucinacion: al ser un modelo comprimido con perplejidad de 17,7822 en WikiText-2, cabe esperar una fidelidad de generacion inferior a la del modelo base, con mayor probabilidad de incoherencias y datos inventados.
- Limitaciones de idioma: no se documentan idiomas soportados; el modelo base esta orientado al ingles y no hay garantia de calidad en castellano u otros idiomas.
- Limitaciones de contexto: la ventana de 4096 tokens es reducida frente a estandares actuales y no se ha validado su comportamiento en ese regimen tras la compresion.
- Ambiguedad en el recuento de parametros: los metadatos de safetensors declaran 6.738.415.616 parametros, mientras que la model card afirma una fraccion densa de 0,3999; el repositorio no aclara si los tensores se almacenan en forma completa con filas anuladas o si el recuento corresponde a otra cosa. Conviene verificar el checkpoint antes de asumir requisitos de memoria.
- Sin soporte de tool calling ni de agentes: no se documenta ninguna capacidad de ese tipo, lo que descarta su uso en pipelines que dependan de function calling.
- Restricciones de licencia: se aplica la Llama 2 Community License junto con el `USE_POLICY.md` de Meta; el uso comercial esta condicionado a esa politica y a la clausula de 700 millones de usuarios activos mensuales, ademas de los terminos de atribucion ("Built with Llama 2").
- Ausencia de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion independiente por parte de la comunidad.
- Sin cuantizaciones oficiales: no se ofrecen pesos GGUF, AWQ ni GPTQ, lo que anade trabajo de conversion y riesgo de divergencia en el comportamiento medido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove60_swapdisc_b001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf

No se han encontrado en la busqueda web enlaces relevantes al modelo, al paper de SVD-LLM ni a recursos asociados; los resultados devueltos correspondian a widgets de cuestionarios sin relacion con el checkpoint. No se dispone por tanto de enlaces a papers, blogs, repositorios de codigo o demos en la informacion proporcionada.
