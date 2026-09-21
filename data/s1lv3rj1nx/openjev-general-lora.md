# s1lv3rj1nx/openjev-general-lora

## Resumen

OpenJev general adapter es un adaptador LoRA de rango 16 sobre el modelo base Qwen3-1.7B, publicado por el usuario s1lv3rj1nx bajo licencia Apache 2.0. No es un modelo generativo al uso: se ha entrenado especificamente para clasificacion zero-shot con esquemas tipados, es decir, para responder preguntas de clasificacion sobre un texto eligiendo una opcion dentro de un menu de etiquetas que el modelo no ha visto durante el entrenamiento. El adaptador se distribuye a traves de la libreria PEFT y ocupa 0,1 GB en el repositorio de HuggingFace.

La relevancia del artefacto esta en su evaluacion: sobre siete tareas retenidas (clinc_oos, banking77, massive_intent, ag_news, sst5, civil_comments y helpsteer), con 600 items por tarea y controles de contaminacion automatizados, alcanza una media de 32,7 veces la probabilidad de acierto por azar, y supera la linea base de clase mayoritaria en las siete. En menus de tres digitos (151 intents de clinc_oos, 0,783 de exactitud; 77 de banking77, 0,728) es donde aporta valor real; en juicios finos de sentimiento y utilidad apenas supera el azar.

El propio autor lo posiciona como punto de partida de la familia OpenJev: sirve tanto para inferencia zero-shot sobre esquemas nuevos como para inicializar adaptadores de tarea, ruta que en la variante encoder aporto +36 puntos frente a entrenar desde cero. Su limitacion principal declarada es que queda nueve puntos por debajo de la referencia comercial (TypeSafe Jev, 0,820 en Banking77 zero-shot).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptador LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atencion y MLP |
| Parametros totales | 1,7 B en el modelo base (Qwen3-1.7B); numero de parametros entrenables del adaptador no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento se realizo con max_len de 2048 tokens |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en bf16 y se fusiona con los pesos base en la carga |
| Idiomas soportados | Ingles (en) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | PEFT (adaptador LoRA para la libreria peft); repositorio de 0,1 GB; el autor indica que el adaptador se fusiona con los pesos base al cargar |
| Modelo base | Qwen/Qwen3-1.7B |
| Dataset de entrenamiento | s1lv3rj1nx/openjev-mixture |
| Tarea declarada (pipeline) | text-classification (zero-shot-classification, intent-classification) |
| Fecha de publicacion | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-1.7B, un transformer decoder-only denso de 1,7 mil millones de parametros. La intervencion es un LoRA de rango 16 con alpha 32 aplicado a todas las proyecciones de atencion y de MLP. La innovacion no esta en la arquitectura sino en el formato de tarea: el modelo recibe una pregunta tipada con un menu de opciones (un objeto `Choice` con instrucciones y un diccionario de criterios, donde cada opcion puede llevar una descripcion opcional o `None`) y devuelve una etiqueta junto con una probabilidad maxima (`p_max`). Esto lo convierte en un clasificador zero-shot sobre espacios de etiquetas arbitrarios, no en un generador de texto libre.

El entrenamiento uso 279 tareas y 224.000 ejemplos curados de tasksource, con augmentacion de espacio de etiquetas: los menus se rellenaron con distractores hasta K=24. Se entreno durante 1 epoca, batch 4, learning rate 2e-4, max_len 2048, precision bf16, en una sola H100 durante 5,3 horas. El autor destaca que la auditoria de datos importo mas que cualquier cambio de arquitectura: se eliminaron 3.781 filas contradictorias y se corrigio un bug de ingesta que colocaba la respuesta correcta en el indice 0 en las 83 tareas de eleccion multiple. La particion retenida se protege con una guarda de contaminacion que asegura que ninguna tarea de evaluacion esta en la mezcla.

## Capacidades

- Clasificacion zero-shot con esquemas inventados: responde preguntas de clasificacion sobre un menu de opciones no visto en entrenamiento, incluyendo menus de hasta 151 etiquetas.
- Clasificacion de intenciones (intent classification): 0,783 en clinc_oos (151 clases) y 0,773 en massive_intent (60 clases) sin entrenamiento especifico en esas tareas.
- Clasificacion de topical en noticias: 0,803 en ag_news (4 clases).
- Analisis de sentimiento de grano fino: 0,438 en sst5 (5 clases), apenas por encima del 0,200 de azar.
- Evaluacion de utilidad de respuestas: 0,282 en helpsteer (5 clases) frente a 0,233 de la clase mayoritaria.
- Deteccion de toxicidad en comentarios: 0,688 de exactitud y 0,766 de AUROC en civil_comments (2 clases), con ranking mejor que la decision a umbral 0,5.
- Devuelve probabilidades calibradas por etiqueta (`p_max`), lo que permite umbralizar y derivar a un humano.
- Uso como inicializacion para adaptadores de tarea (two-stage fine-tuning), con la ganancia documentada de +36 puntos en la ruta encoder.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible; el modelo esta disenado para una unica decision de clasificacion.
- Capacidades multilingues: no; entrenado y evaluado solo en ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Enrutamiento de intenciones en atencion al cliente: con un menu de 60 a 150 intents definido por el equipo, el adaptador clasifica la consulta entrante sin datos de entrenamiento etiquetados. Los numeros de clinc_oos (0,783) y massive_intent (0,773) indican que la ruta es viable para triaje previo a un agente humano o a un flujo automatizado.
- Clasificacion de motivos en banca y fintech: el ejemplo de la propia model card resuelve un menu de tres opciones (transaccion rechazada, tarjeta perdida, recarga fallida) con probabilidades de 0,975, 0,978 y 0,848. Es directamente aplicable a tickets de soporte financiero, aunque el 0,728 en Banking77 zero-shot marca el techo realista con menus de 77 clases.
- Moderacion de comentarios con umbral ajustable: en civil_comments la exactitud a 0,5 es 0,688 pero el AUROC es 0,766, lo que permite fijar un umbral conservador y derivar los casos dudosos a revision humana. El autor advierte explicitamente de que no es un clasificador de seguridad.
- Codificacion de respuestas abiertas en encuestas: clasificar respuestas de texto libre en un codebook definido ad hoc para cada estudio, sin reentrenar, aprovechando que el esquema de etiquetas se declara en tiempo de inferencia.
- Etiquetado de datos para construir datasets: usar las predicciones como preetiquetado de bajo coste en corpus no anotados y reservar la revision humana para los casos con `p_max` baja.
- Base para adaptadores de tarea en dominios verticales: el flujo recomendado por el autor (`python scripts/train.py --task tasks/your_task --decoder --lora-r 16 --init-from general_lora/model.pt --epochs 6`) reutiliza lo aprendido sobre lectura de menus y acorta el entrenamiento especifico.
- Triaje de tickets internos de soporte IT: menu de categorias como acceso, hardware, software, red, con umbral de confianza para escalado a segundo nivel.
- Filtrado previo en pipelines RAG o de busqueda: descartar o encaminar documentos segun una taxonomia propia antes de pasarlos a un modelo generativo mas caro.

## Benchmarks y rendimiento

Resultados en siete tareas retenidas (ninguna presente en la mezcla de entrenamiento; contaminacion verificada por guarda automatica). 600 items por tarea, intervalos de confianza del 95 % sobre 1.000 remuestreos bootstrap:

| Tarea | K (clases) | Azar | Exactitud | IC 95 % | Veces el azar |
|---|---|---|---|---|---|
| clinc_oos | 151 | 0,007 | 0,783 | [0,752, 0,817] | 118,3x |
| banking77 | 77 | 0,013 | 0,728 | [0,693, 0,765] | 56,1x |
| massive_intent | 60 | 0,017 | 0,773 | [0,738, 0,805] | 46,4x |
| ag_news | 4 | 0,250 | 0,803 | [0,772, 0,838] | 3,2x |
| sst5 | 5 | 0,200 | 0,438 | [0,400, 0,475] | 2,2x |
| civil_comments | 2 | 0,500 | 0,688 | [0,655, 0,727] | 1,4x |
| helpsteer | 5 | 0,200 | 0,282 | [0,247, 0,320] | 1,4x |

Media declarada por el autor: 32,7 veces el azar. Las siete tareas superan tanto el azar como su linea base de clase mayoritaria, incluida helpsteer (0,282 frente a 0,233, p = 0,0025). Adicionalmente, civil_comments registra un AUROC de 0,766 con exactitud de 0,688 a umbral 0,5.

No se han publicado resultados de benchmarks en la informacion disponible para pruebas estandar tipo MMLU, GSM8K o HumanEval, ya que el modelo no es generativo.

## Requisitos de hardware

- Huella declarada por el autor: 3,4 GB (adaptador fusionado con el modelo base de 1,7 B parametros en bf16).
- VRAM estimada para inferencia: aproximadamente 3,4 GB en bf16/fp16, 1,8-2 GB en cuantizacion de 8 bits y 1,0-1,2 GB en 4 bits, mas el overhead de la cache KV segun la longitud de secuencia. Estas cifras son estimaciones derivadas del tamano del modelo base y no datos publicados por el autor.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 ejecutan el modelo en bf16 sin problemas; en cuantizacion de 4 u 8 bits cabe tambien en GPUs de 6-8 GB.
- GPUs de datacenter recomendadas: A100, H100 o L40S para servicio concurrente con alto throughput. El entrenamiento del adaptador se hizo en una sola H100 durante 5,3 horas.
- Latencia declarada: p95 de 56 ms con batch 1. No hay datos de throughput publicados.
- Coste de inferencia: identico al del modelo base sin adaptar, porque el LoRA se fusiona en los pesos al cargar. El autor advierte de que usar el adaptador sin fusionar cuesta aproximadamente el doble sin ninguna ventaja.
- Opciones de despliegue: el checkpoint esta pensado para la libreria del propio proyecto (`openjev.infer.DecisionModel` con esquemas `openjev.schema.Choice`). Al tratarse de un adaptador PEFT, es posible fusionarlo y servirlo con vLLM, TGI u otros servidores compatibles con Qwen3, o convertirlo a GGUF para llama.cpp u Ollama. No se documentan recetas de despliegue especificas en la informacion disponible.
- Alternativa de baja latencia: el autor recomienda migrar al encoder (20 ms p95, huella de 0,6 GB) solo si la latencia p95 o el consumo de memoria son el cuello de botella.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros / huella | Banking77 zero-shot | Media en tareas retenidas | p95 batch 1 | Licencia |
|---|---|---|---|---|---|---|
| openjev-general-lora | Adaptador LoRA sobre Qwen3-1.7B | 1,7 B / 3,4 GB | 0,728 | 32,7x azar | 56 ms | Apache 2.0 |
| s1lv3rj1nx/openjev-encoder | Encoder alternativo del mismo autor | No disponible / 0,6 GB | 0,290 | 21,9x azar | 20 ms | No disponible |
| TypeSafe Jev | Referencia comercial (API) | No disponible | 0,820 | No disponible | No disponible | Propietaria |
| Qwen/Qwen3-1.7B (base, sin adaptar) | Transformer decoder-only | 1,7 B | No disponible | No disponible | No disponible | Apache 2.0 |

El propio autor reconoce una desventaja de nueve puntos frente a TypeSafe Jev en Banking77 zero-shot (0,728 frente a 0,820) cuando el uso requiere la mejor exactitud posible y se puede enviar datos a una API externa. Frente al encoder del mismo proyecto, este adaptador es mas preciso (0,728 frente a 0,290 en Banking77) pero mas lento y pesado. Contra el modelo base sin adaptar, la ganancia es la propia capacidad de clasificacion con esquemas: el autor cifra en +36 puntos la ventaja de inicializar un adaptador de tarea desde este checkpoint en lugar de desde base Qwen3.

## Limitaciones y advertencias

- Solo ingles. No hay soporte multilingue declarado ni evaluado.
- Queda nueve puntos por debajo de la referencia comercial TypeSafe Jev en Banking77 zero-shot (0,728 frente a 0,820).
- Sentimiento de grano fino y evaluacion de utilidad apenas superan la clase mayoritaria: sst5 obtiene 0,438 frente a 0,200 de azar y helpsteer 0,282 frente a 0,233 de la clase mayoritaria. No es fiable para juicios subjetivos finos.
- En civil_comments la exactitud a umbral 0,5 (0,688) es peor que el AUROC (0,766): el ranking de probabilidades es mejor que la decision binaria con umbral por defecto. El autor recomienda ajustar el umbral.
- No es un clasificador de seguridad. Las puertas de seguridad del enrutador del proyecto se entrenaron de forma especifica, no zero-shot, y aun asi alcanzan un recall de 0,84 con un intervalo de confianza amplio.
- Riesgo de alucinacion en el sentido de falsa confianza: el modelo siempre devuelve una etiqueta del menu con una probabilidad, incluso cuando ninguna opcion encaja. No se documenta un mecanismo de rechazo ni una clase "ninguna de las anteriores".
- Numero de descargas y likes en HuggingFace: 0 en el momento de la consulta. Es un artefacto reciente, sin validacion independiente por terceros mas alla de la evaluacion del propio autor.
- La evaluacion se limita a siete tareas retenidas con 600 items cada una; los intervalos de confianza son amplios en las tareas con menos clases.
- El uso esta condicionado a la libreria del proyecto (`openjev.infer`), lo que anade dependencia de un paquete propio para la inferencia con esquemas tipados.
- Licencia Apache 2.0 sobre el adaptador, pero el uso comercial queda igualmente sujeto a los terminos del modelo base Qwen3-1.7B.
- Entrenado con max_len de 2048 tokens; no hay informacion sobre el comportamiento con entradas mas largas.
- Fecha de publicacion futura respecto a la fecha habitual de consulta (21 de septiembre de 2026), dato a verificar en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/s1lv3rj1nx/openjev-general-lora
- Codigo, harness de evaluacion y resultados completos: https://github.com/s1lv3rj1nx/openjev
- Dataset de mezcla de entrenamiento: https://huggingface.co/datasets/s1lv3rj1nx/openjev-mixture
- Suite de tareas retenidas: https://huggingface.co/datasets/s1lv3rj1nx/openjev-heldout
- Alternativa encoder del mismo autor: https://huggingface.co/s1lv3rj1nx/openjev-encoder
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Referencias metodologicas citadas por el autor: STILTs (Phang et al.) y "Don't Stop Pretraining" (Gururangan et al.); no se proporcionan URLs en la informacion disponible.
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron paginas de soporte de PayPal, sin relacion con el artefacto.
