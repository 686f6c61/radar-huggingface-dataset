# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-BTIP-Top20-ReverseKL-gap01-original10240

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado OPSD / VisionZip r010 / B-TIP Top20% / Reverse KL / gap1%, desarrollado por el usuario enmingzhangzz sobre el modelo base Qwen/Qwen2.5-VL-7B-Instruct. No es un modelo completo ni un fine-tuning fusionado: son pesos de adaptador (40.370.176 parametros entrenables, rango 16, alpha 32) sobre el decoder de lenguaje, con el codificador visual congelado. El problema que aborda es de investigacion en destilacion selectiva de tokens: como elegir que posiciones de la respuesta reciben senal de perdida cuando la entrada visual se ha podado agresivamente (VisionZip retiene el 10% de los tokens visuales).

La innovacion metodologica es la funcion de puntuacion B-TIP, que sustituye el eje de entropia de TIP por un eje de sensibilidad al presupuesto visual B, medido como JSD simetrica (mezcla equitativa, 0.5) entre las distribuciones del estudiante con 10% y con 11% de retencion visual. Esa B se combina mediante una Soft-OR desacoplada con delta, la divergencia KL entre la salida del estudiante y un profesor EMA de vision completa (decay 0.9999) que nunca accede al ground truth. Solo el 20% de las posiciones validas de la respuesta (Top20%) contribuyen a la perdida final, que es KL inversa (estudiante || profesor) sin reescalado de masa de perdida.

Es relevante ahora porque se enmarca en la linea de eficiencia multimodal: reducir el coste de tokens visuales en modelos VLM de 7B manteniendo el comportamiento del modelo de vision completa. El entrenamiento uso 10.240 muestras del dataset OpenMMReasoner-SFT-874K (seleccion fija, no balanceada), 320 actualizaciones del optimizador, en 4 GPU con BF16 y FlashAttention2. El autor no reclama ninguna puntuacion de benchmark; el unico numero reportado es la perdida media de entrenamiento del ultimo batch entre cuatro rangos (0,10648618), que no es una metrica de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-VL-7B-Instruct (transformer decoder-only con codificador visual ViT y fusionador MLP; el encoder visual permanece congelado) |
| Parametros totales | No disponible para el adaptador; modelo base de ~7.000 millones (Qwen2.5-VL-7B-Instruct) |
| Parametros activos | No aplica (no es MoE); parametros entrenables del adaptador: 40.370.176 |
| Longitud de contexto | No disponible en la ficha del adaptador; el modelo base Qwen2.5-VL-7B-Instruct declara 128.000 tokens segun su documentacion publica |
| Tipos de cuantizacion | Adaptador distribuido en safetensors (BF16); no se documentan cuantizaciones propias. El modelo base admite cuantizaciones de terceros (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible en la ficha |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repositorio 0,2 GB |
| Configuracion LoRA | rango 16, alpha 32, dropout 0 |
| Ambito entrenable | Decoder de lenguaje; encoder visual congelado |
| Dataset | OpenMMReasoner/OpenMMReasoner-SFT-874K (subconjunto fijo de 10.240 muestras, no balanceado) |
| Optimizador | AdamW, LR 2e-5, weight decay 0 |
| Batch efectivo | 32 (4 GPU x microbatch 8 x acumulacion 1) |
| Precision y atencion | BF16, FlashAttention2, KL en trozos de 32 |
| Rollout | Greedy, maximo 512 tokens nuevos |
| Pixeles min/max | 846720 / 846720 |
| Profesor | EMA de vision completa, decay 0,9999, sin acceso a ground truth |
| Podado visual | VisionZip oficial; 5% dominante + 5% contextual (retencion 10%) |
| SHA256 del adaptador | 57e6fd20b2e07bcd7944ecaf242af5db1f11a57d89d45a680b81aebe1ade00b3 |

## Arquitectura y entrenamiento

El adaptador se aplica exclusivamente sobre el decoder de lenguaje del modelo base Qwen2.5-VL-7B-Instruct, que combina un codificador visual tipo ViT con atencion por ventanas y resolucion dinamica nativa, un fusionador que proyecta los tokens visuales al espacio del texto y un transformer decoder-only autorregresivo. En este entrenamiento el encoder visual esta congelado: solo se optimizan las matrices LoRA de rango 16 insertadas en el decoder (40.370.176 parametros). El modelo base no se fusiona; los pesos se cargan con PEFT sobre el modelo original.

El procedimiento de entrenamiento es una destilacion selectiva de tokens con poda visual. Para cada respuesta generada de forma greedy (maximo 512 tokens nuevos), VisionZip retiene el 10% de los tokens visuales (5% dominante + 5% contextual) y se calculan dos ejes por posicion valida: B_t, la JSD simetrica de mezcla equitativa entre las distribuciones del estudiante con retencion 10% y 11% (una intervencion de un punto porcentual absoluto, no un 1% relativo), y delta_t, la KL entre la salida del estudiante con 10% y un profesor EMA de vision completa con decay 0,9999. B se recorta en el percentil 98 dentro de la respuesta y se normaliza min-max; delta se normaliza min-max de forma independiente y sin recorte. La puntuacion resultante se obtiene con una Soft-OR desacoplada (s_t = B_hat + delta_hat - B_hat * delta_hat) y se seleccionan las max(1, floor(0,20 * N)) posiciones de mayor puntuacion, con desempate estable por orden de token. La perdida final es la media aritmetica de la KL inversa original (estudiante || profesor) sobre esas posiciones, sin reescalado adicional de masa, sin lambda de grupo y sin puntuacion de entropia. El autor advierte explicitamente de que el espacio de nombres historico del muestreo B-TIP conserva etiquetas antiguas (forward/top10) que son solo un identificador, no la configuracion de perdida; los registros de ejecucion verifican KL inversa, top20% y gap 1%.

## Capacidades

- Generacion de texto e imagen-a-texto (pipeline declarado: image-text-to-text), heredada del modelo base Qwen2.5-VL-7B-Instruct.
- Razonamiento multimodal sobre imagenes y documentos, que es el dominio del dataset de entrenamiento (OpenMMReasoner-SFT-874K, orientado a razonamiento multimodal).
- Inferencia con tokens visuales podados mediante VisionZip: el adaptador esta entrenado de forma especifica para mantener el comportamiento del profesor de vision completa cuando solo se retiene el 10% de los tokens visuales.
- Capacidades del modelo base no verificadas en esta ficha (tool calling, agentes, matemáticas, codigo, vision de video): el adaptador no documenta evaluacion propia y el autor no reclama ningun resultado.
- Modo thinking, audio y otras capacidades especiales: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- La carga del adaptador por si sola no aplica el podado visual: para reproducir la inferencia podada hay que habilitar VisionZip oficial de forma independiente.

## Casos de uso

- Investigacion en eficiencia multimodal: reproduccion del experimento de destilacion selectiva de tokens comparando la inferencia con VisionZip al 10% frente al modelo base sin podar, usando el adaptador ya publicado y los registros de entrenamiento incluidos en training/.
- Evaluacion de metodos de seleccion de tokens: punto de partida para comparar la puntuacion B-TIP (Top20%) con alternativas como KL Top-K puro, B Top-K puro o el experimento agrupado B-top20/resto, que el autor distingue explicitamente de esta version.
- Razonamiento sobre documentos e imagenes en entornos con presupuesto de computo ajustado: al retener solo el 10% de tokens visuales, el coste de atencion sobre la entrada visual se reduce de forma significativa, lo que resulta util cuando se procesan muchas imagenes de alta resolucion en lote.
- Pipelines de investigacion en VLM con LoRA sobre Qwen2.5-VL: el adaptador se carga con PEFT sin fusionar pesos, lo que permite alternar entre modelo base y adaptador para estudios comparativos sin duplicar almacenamiento (0,2 GB por adaptador).
- Fine-tuning posterior sobre dominios concretos: al ser un adaptador separable, se puede reutilizar como inicializacion o comparar frente a un adaptador entrenado con el mismo dataset pero sin podado visual.
- Auditoria de reproducibilidad: el paquete incluye configuracion saneada, metricas escalares de cuatro rangos y auditorias de completado, con el SHA256 del adaptador verificado como identico al checkpoint final y a la instantanea de evaluacion del paso 010240.
- No se recomienda su uso directo en produccion orientada a usuario final: no hay benchmarks publicados ni licencia declarada, y el dataset de entrenamiento no esta balanceado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que no reclama ninguna puntuacion de benchmark. El unico valor numerico reportado es la perdida media de entrenamiento del ultimo batch (media de cuatro rangos) de 0,10648618, que el propio autor aclara que no es una puntuacion de evaluacion ni una media de todo el entrenamiento.

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento, ultimo batch (media de 4 rangos) | 0,10648618 (no es metrica de evaluacion) |
| MMLU, GSM8K, HumanEval, MMMU u otros | No disponible |
| Comparacion con el modelo base sin podar | No disponible |

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 77 MB en BF16 (40.370.176 parametros x 2 bytes); el repositorio completo son 0,2 GB, que incluyen ficheros de entrenamiento. El coste real de hardware lo determina el modelo base de 7B.
- VRAM estimada para el modelo base en BF16/FP16: en torno a 16-18 GB solo para pesos, mas cache KV y activaciones del encoder visual; con vLLM se recomienda un minimo practico de 24 GB.
- VRAM en cuantizacion de 8 bits (AWQ/GPTQ): aproximadamente 9-10 GB. En 4 bits (AWQ/GPTQ/GGUF Q4): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para entrenamiento o inferencia en BF16 con lotes grandes; RTX 4090 (24 GB) es viable para inferencia en BF16 con lotes pequenos o en cuantizaciones de 8 y 4 bits. GPU consumer de 8-12 GB solo con cuantizacion agresiva del modelo base.
- Entrenamiento: el autor uso 4 GPU con microbatch 8 y acumulacion 1 (batch efectivo 32), en BF16 con FlashAttention2. Los estados del optimizador, el EMA y el RNG no se publican (permanecen en AutoDL), por lo que no es posible reanudar el entrenamiento desde este paquete.
- Opciones de despliegue: vLLM (soporta el modelo base y carga de adaptadores LoRA), llama.cpp/Ollama para el modelo base en GGUF, TGI. El podado VisionZip es un metodo de investigacion y requiere codigo especifico; no forma parte del adaptador.
- Latencia y throughput: no disponible. La retencion del 10% de tokens visuales deberia reducir el coste de atencion sobre la entrada visual, pero no se publican mediciones.

## Comparativa con modelos similares

Los datos de la comparativa proceden de la documentacion publica de cada modelo base; no hay evaluaciones de este adaptador que permitan comparar rendimiento. Se indica "no disponible" cuando el dato no puede verificarse con la informacion consultada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-VL-7B-Instruct) | 40.370.176 entrenables (base ~7B) | No disponible en la ficha (base: 128.000 tokens) | No disponible | HuggingFace, PEFT, 0 descargas | No disponible (sin benchmarks) |
| Qwen2.5-VL-7B-Instruct (base) | ~7B | 128.000 tokens | Apache 2.0 | HuggingFace, ampliamente desplegado | No disponible en esta comparativa |
| Qwen2-VL-7B-Instruct | ~8B | 32.000 tokens | Apache 2.0 | HuggingFace | No disponible en esta comparativa |
| InternVL2.5-8B | ~8B | No disponible | MIT | HuggingFace | No disponible en esta comparativa |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks publicados ni reclamados por el autor. La perdida de entrenamiento del ultimo batch no permite inferir calidad.
- Dataset no balanceado: el autor advierte explicitamente de que la seleccion de 10.240 muestras de OpenMMReasoner no esta balanceada, lo que puede sesgar el comportamiento hacia los tipos de ejemplo sobrerrepresentados.
- No es un modelo autonomo: es un adaptador LoRA que requiere cargar Qwen/Qwen2.5-VL-7B-Instruct con PEFT. Sin el modelo base no funciona.
- El podado visual no se aplica al cargar el adaptador: hay que habilitar VisionZip oficial por separado. Si se usa el adaptador con vision completa se desvia de las condiciones de entrenamiento, y si se usa con un porcentaje de retencion distinto al 10% tampoco se reproduce el escenario previsto.
- Licencia no declarada: no hay informacion de licencia en la ficha, lo que impide determinar si el uso comercial esta permitido. Ademas, la licencia efectiva depende de la del modelo base.
- Idioma no especificado: no se documentan los idiomas soportados ni la composicion linguistica del dataset de entrenamiento.
- Ambiguedad de nomenclatura: el autor senala que el espacio de nombres historico del muestreo conserva etiquetas antiguas (forward/top10) que podrian inducir a error al interpretar la configuracion; los registros de ejecucion son la fuente fiable.
- Imposibilidad de reanudar el entrenamiento: no se publican estados de optimizador, EMA ni RNG.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es una limitacion general de los VLM de esta escala y no hay evaluacion especifica para este adaptador.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, y fecha de creacion reciente. Debe tratarse como artefacto de investigacion, no como componente listo para produccion.
- Uso de la cuantizacion del modelo base: al ir el adaptador sobre un modelo cuantizado, el comportamiento puede diferir del observado en BF16 durante el entrenamiento; no se documenta ninguna validacion en ese escenario.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-BTIP-Top20-ReverseKL-gap01-original10240
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenMMReasoner/OpenMMReasoner-SFT-874K
- Libreria PEFT: no se proporciona enlace en la informacion disponible
- VisionZip (metodo de podado visual): no se proporciona enlace en la informacion disponible
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun recurso relacionado con el modelo (unicamente paginas de cronometros en linea, sin relacion con el contenido), por lo que no hay enlaces adicionales que citar.
