# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-TeacherGT-ReverseKL-original10240

## Resumen

Este repositorio contiene un adaptador LoRA de PEFT, no un modelo fusionado ni un ajuste fino completo, construido sobre `Qwen/Qwen2.5-VL-7B-Instruct`. Lo publica el usuario `enmingzhangzz` y su interes esta en que documenta de forma muy detallada un experimento de destilacion sobre un modelo de vision-lenguaje: el estudiante genera su propia respuesta a partir de la pregunta y una imagen con solo el 10 por ciento de los tokens visuales retenidos, mientras que un profesor EMA con vision completa recibe ademas el razonamiento de referencia y la respuesta final del dataset (contexto privilegiado). El objetivo es una KL inversa (estudiante || profesor) calculada sobre todas las posiciones validas de la respuesta generada, sin entropia cruzada supervisada sobre los tokens de referencia.

El entrenamiento se completo con 10.240 muestras y 320 actualizaciones del optimizador, usando el dataset OpenMMReasoner/OpenMMReasoner-SFT-874K en su seleccion original de orden fijo, no balanceada. El adaptador tiene 40.370.176 parametros entrenables (r16, alpha32, dropout 0) y afecta unicamente al decodificador de lenguaje: la torre visual permanece congelada y el recorte de tokens visuales se delega a VisionZip (5 por ciento dominante mas 5 por ciento contextual), que debe habilitarse por separado en tiempo de inferencia con su implementacion oficial.

Es relevante ahora porque conecta dos lineas muy activas: la destilacion on-policy con profesores privilegiados y la reduccion del coste de prefill en modelos multimodales mediante poda de tokens visuales. El autor no reclama ningun resultado de benchmark, y el repositorio incluye auditorias de finalizacion y metricas escalares por rango, pero no datos crudos, respuestas generadas ni estados de optimizador, EMA o RNG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2.5-VL-7B-Instruct: transformer multimodal con torre visual y decodificador de lenguaje; la torre visual permanece congelada |
| Parametros totales | 40.370.176 parametros entrenables en el adaptador; el modelo base no se incluye en el repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la hereda del modelo base; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones de terceros no detalladas en la model card |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT, con `adapter_config.json` apuntando al modelo base publico) |

Otros datos de configuracion: LoRA r16, alpha32, dropout 0; optimizador AdamW con learning rate 2e-5 y weight decay 0; lote efectivo 32 (4 GPU x microbatch 8 x acumulacion 1); computo en BF16 con FlashAttention2; fragmentos de KL de 32 posiciones de respuesta; rollout greedy con maximo de 512 tokens nuevos; min/max pixels fijados en 846720. Tamano del repositorio: 0,2 GB. SHA256 del adaptador: `c476996f88b985d5e314232d6ad0f826610c3afbb03c7a1c460c3f47c4241a58`.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-VL-7B-Instruct, un transformer multimodal de tipo image-text-to-text. Sobre el se entrena un adaptador LoRA que solo modifica el decodificador de lenguaje; la torre visual se mantiene congelada. El elemento diferencial es el esquema de destilacion: el estudiante ve la pregunta y la imagen con retencion del 10 por ciento de tokens visuales, mientras que el profesor (una sombra EMA del propio adaptador, con decay 0.9999) ve la imagen completa y ademas el razonamiento de referencia y la respuesta final del dataset. Ambos reciben el mismo prefijo de respuesta generado por el estudiante, y el scoring se alinea por posicion del token de respuesta pese a que las longitudes de prompt difieren.

La perdida por respuesta es la media aritmetica, sobre todas las posiciones validas de la respuesta generada, de `KL(P_estudiante,10% || P_profesor_EMA,vision_completa)`. Se trata de KL inversa (estudiante || profesor), sin seleccion de tokens B/F/TIP, sin intervenciones, sin agrupacion y sin reponderacion de masa de perdida. No hay entropia cruzada supervisada sobre los tokens objetivo de referencia: el ground truth es contexto privilegiado del profesor durante el entrenamiento, nunca una entrada obligatoria del estudiante en inferencia. El autor indica que la ejecucion se recupero de su propio checkpoint de la muestra 1024 tras una interrupcion, restaurando adaptador, optimizador, EMA y estado RNG por rango, y que las perdidas replicadas coincidieron con los registros previos.

## Capacidades

- Generacion de texto e imagen-texto: hereda la tarea image-text-to-text del modelo base Qwen2.5-VL-7B-Instruct.
- Razonamiento multimodal: el entrenamiento se realiza sobre OpenMMReasoner, un dataset orientado a razonamiento multimodal con cadenas de razonamiento y respuesta final.
- Inferencia con tokens visuales reducidos: el adaptador esta entrenado para operar con un 10 por ciento de retencion de tokens visuales (5 por ciento dominante mas 5 por ciento contextual) mediante VisionZip.
- Tool calling y function calling: no verificado en el adaptador; el modelo base lo soporta, pero la model card no lo menciona ni lo evalua.
- Uso como agente multi-paso: no verificado ni documentado para este adaptador.
- Capacidades multilingues: no disponibles (los idiomas no se declaran en la model card).
- Capacidades especiales: no se documenta modo thinking, audio ni ninguna otra modalidad adicional.

Nota importante: el adaptador se ha entrenado solo con el objetivo de KL descrito, sin ajuste supervisado sobre los tokens de referencia. Cualquier capacidad concreta debe validarse empiricamente antes de usarla en produccion.

## Casos de uso

- Investigacion en destilacion on-policy: el repositorio permite reproducir o variar el esquema de profesor EMA con contexto privilegiado (ground truth como contexto del profesor) usando otro subconjunto de OpenMMReasoner, ya que toda la configuracion de entrenamiento esta documentada.
- Aceleracion de inferencia multimodal: VisionZip con retencion del 10 por ciento reduce de forma directa el numero de tokens visuales que entran en el prefill y, en consecuencia, el coste de atencion y el tamano de la cache KV asociada a la imagen; el adaptador esta especificamente entrenado para ese regimen.
- Despliegue de VQA en GPUs de gama consumer: combinando un modelo base cuantizado con el recorte de tokens visuales, el presupuesto de memoria baja lo suficiente como para plantear asistentes de pregunta-respuesta sobre imagen en una sola GPU de 24 GB.
- Analisis de documentos y captura de informacion: uso como chat image-text-to-text para extraer y resumir contenido de capturas o paginas, asumiendo que la retencion del 10 por ciento de tokens visuales puede degradar la lectura de texto muy pequeno, algo que debe medirse caso por caso.
- Punto de partida para nuevos adaptadores: al ser un LoRA independiente y no fusionado, sirve como inicializacion para experimentos posteriores de ajuste con PEFT sobre el mismo modelo base, sin tocar los pesos originales.
- Auditoria de metodos de poda de tokens: el repositorio incluye metricas escalares por rango y auditorias de finalizacion, lo que permite comparar el comportamiento de este regimen de retencion frente a otros porcentajes o frente a vision completa.
- Evaluacion de robustez de la KL inversa: util para estudiar como se comporta la destilacion reverse KL sin seleccion de tokens ni reponderacion, comparandola con variantes supervisadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no reclama ningun resultado de benchmark.

El unico dato numerico de rendimiento reportado es la perdida media del ultimo lote en cuatro rangos, que no constituye una puntuacion de evaluacion ni una media de toda la ejecucion:

| Metrica | Valor | Nota |
|---|---|---|
| Perdida de entrenamiento (media de cuatro rangos, ultimo lote) | 0,15797597356140614 | No es una puntuacion de evaluacion ni una media global de la ejecucion |
| Actualizaciones del optimizador | 320 | Equivalen a 10.240 muestras |
| Tokens nuevos maximos por rollout | 512 | Decodificacion greedy |

## Requisitos de hardware

- El adaptador en si es pequeno: 40.370.176 parametros, aproximadamente 161 MB en fp32 y unos 80 MB en fp16, coherente con el tamano de repositorio de 0,2 GB. No requiere VRAM adicional relevante.
- El coste real esta en el modelo base Qwen2.5-VL-7B-Instruct, que debe cargarse aparte y no se distribuye en este repositorio. Como estimacion orientativa (no confirmada en la informacion proporcionada), el modelo base completo en BF16 ronda los 15-16 GB de pesos, mas cache KV y activaciones, por lo que conviene contar con 20-24 GB de VRAM para trabajar con imagenes de resolucion alta y contexto largo.
- Cuantizado a 8 bits el conjunto puede situarse en torno a 9-10 GB; a 4 bits, en torno a 5-6 GB. Son estimaciones, no cifras verificadas para este adaptador.
- GPU recomendadas: A100 (40 o 80 GB) y H100 para entrenamiento o inferencia en BF16 con margen; L40S (48 GB) como alternativa; RTX 4090 o RTX 3090 (24 GB) para inferencia en BF16 con presupuesto ajustado o con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 de 24 GB con cuantizacion o con resoluciones de imagen moderadas, especialmente al reducirse los tokens visuales al 10 por ciento. En GPUs de 12-16 GB exigiria cuantizacion agresiva del modelo base.
- Opciones de despliegue: el adaptador se carga con PEFT sobre el modelo base publico; la model card indica que el recorte de tokens visuales requiere habilitar por separado la implementacion oficial de VisionZip en tiempo de ejecucion, y que cargar solo el adaptador no activa la poda. Servidores compatibles con Qwen2.5-VL como vLLM son la via natural para despliegue, aunque no se confirman en la informacion proporcionada. Formatos tipo GGUF/Ollama no estan disponibles para este adaptador, que se distribuye como LoRA de PEFT.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de tiempo de prefill con y sin VisionZip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (OPSD + VisionZip r010) | 40.370.176 entrenables sobre un base de ~7B | No disponible | Sin benchmarks publicados; solo perdida de entrenamiento del ultimo lote | No disponible | Adaptador LoRA en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen2.5-VL-7B-Instruct (modelo base) | ~7B (cifra no confirmada en la informacion proporcionada) | No disponible | No disponible en esta informacion | No disponible en esta informacion | Modelo base publico en HuggingFace, ampliamente utilizado |
| Otros adaptadores comparables de destilacion o poda de tokens visuales | No disponible | No disponible | No disponible | No disponible | La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre alternativas equivalentes |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial. Debe consultarse al autor antes de cualquier despliegue en produccion.
- Ausencia total de benchmarks: no hay MMLU, MMMU, HumanEval, GSM8K ni ninguna otra evaluacion publicada. La perdida reportada corresponde al ultimo lote de entrenamiento y no es extrapolable a calidad real.
- El adaptador no ha recibido ajuste supervisado sobre tokens de referencia, solo la KL inversa descrita; el alineamiento de sus respuestas con formatos esperados no esta verificado.
- La seleccion de datos fue de orden fijo y no balanceada (10.240 ejemplos), lo que puede introducir sesgos de composicion en el comportamiento final.
- La retencion del 10 por ciento de tokens visuales puede degradar tareas que dependen de detalle fino, como OCR de texto pequeno, tablas densas o graficos con etiquetas diminutas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y vision-lenguaje; no se documentan mitigaciones especificas ni evaluaciones de fidelidad.
- Idiomas no declarados: no puede garantizarse un rendimiento correcto en castellano ni en ningun otro idioma concreto.
- Requiere dos piezas adicionales para reproducir el comportamiento descrito: el modelo base publico y la implementacion oficial de VisionZip. Cargar solo el adaptador no habilita la poda de tokens visuales.
- Los estados de optimizador, EMA y RNG no se incluyen en el paquete, por lo que el entrenamiento no puede reanudarse desde este repositorio.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en comunidad ni de validacion independiente.
- El paquete se describe como sanitizado; no contiene preguntas, referencias, respuestas, identificadores de tokens ni rutas locales, lo que limita la trazabilidad de los datos exactos usados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-TeacherGT-ReverseKL-original10240
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenMMReasoner/OpenMMReasoner-SFT-874K
- VisionZip: mencionado en la model card como implementacion oficial, sin enlace proporcionado
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos resultados obtenidos corresponden a Rhinoceros 3D y no guardan relacion con el contenido de esta ficha.
