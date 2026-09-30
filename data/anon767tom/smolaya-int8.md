# anon767tom/smolaya-int8

# anon767tom/smolaya-int8

## Resumen

smolaya-int8 es una version cuantizada a int8 del modelo smolaya, un encoder de clasificacion y extraccion de caracteristicas derivado de laya (Convai Innovations), que a su vez se apoya en el encoder ModernBERT-large de Answer.AI. El modelo lo publica el usuario anon767tom y su objetivo es claro: ofrecer un clasificador de texto en ingles que quepa y corra comodamente en CPU, sin necesidad de GPU, manteniendo una precision practicamente identica a la version en coma flotante.

La diferencia principal respecto a smolaya es que los pesos de las proyecciones `attn.Wqkv`, `attn.Wo` y `mlp.Wi` se almacenan ya cuantizados a int8 con escalas simetricas por canal de salida, de modo que no hay que ejecutar ningun paso de cuantizacion al cargar el modelo. El resultado es un repositorio de 456 MB frente a los 646 MB de smolaya y una velocidad aproximadamente 2,8 veces superior en CPU, con una perdida de precision de solo 0,4 puntos porcentuales en la evaluacion combinada.

Es relevante en el contexto actual porque demuestra que la cuantizacion int8 selectiva (dejando fuera las capas con valores atipicos de activacion) puede dar ganancias de velocidad muy grandes en hardware modesto casi sin coste de calidad. Con 323,4 millones de parametros y licencia Apache-2.0, es un candidato util para clasificacion zero-shot, analisis de sentimiento y etiquetado en entornos de produccion sin acelerador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Transformer (ModernBERT-large, base de laya); modelo denso |
| Parametros totales | 323.422.470 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 simetrico con escalas por canal de salida (zero point 0) en `attn.Wqkv`, `attn.Wo` y `mlp.Wi`; `mlp.Wo` se mantiene en 16 bits en disco y se ejecuta en fp32 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (int8 + 16-bit), libreria transformers |
| Tarea declarada | zero-shot-classification y feature-extraction |
| Tamano del repositorio | 0,5 GB (pesos int8: 456 MB) |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder Transformer de tipo ModernBERT, heredada de la cadena laya -> smolaya -> smolaya-int8. No se trata de un modelo generativo ni de un MoE: es un encoder denso con 323,4 millones de parametros orientado a producir representaciones de texto y logits de clasificacion. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos no estan disponibles. Toda la innovacion descrita se situa en la fase de cuantizacion, no en el entrenamiento.

La innovacion tecnica destacable es la cuantizacion int8 selectiva. Las capas `attn.Wqkv`, `attn.Wo` y `mlp.Wi` se guardan con pesos int8 y escalas simetricas por canal de salida, y se ejecutan con los kernels dinamicos int8 de PyTorch. En cambio, `mlp.Wo` se deja en 16 bits y se ejecuta en fp32 porque sus entradas presentan valores atipicos de activacion grandes; cuantizarla costaria varios puntos de precision. El autor afirma que los pesos int8 almacenados son exactamente los que produce el script `quantize_int8.py` del repositorio smolaya, por lo que las salidas son identicas a cuantizar smolaya por cuenta propia (diferencia maxima de logits de 0,0 sobre 50 elementos de prueba). Los kernels int8 son exclusivos de CPU; en GPU los mismos pesos se ejecutan de-cuantizados y resultan mas lentos que el smolaya en fp16.

## Capacidades

- Clasificacion zero-shot de texto en ingles con etiquetas candidatas definidas en tiempo de inferencia.
- Analisis de sentimiento y clasificacion de temas mediante `pipeline("zero-shot-classification")`.
- Extraccion de caracteristicas (embeddings de texto) gracias a su naturaleza de encoder ModernBERT.
- Soporte de `multi_label=True` para asignacion de multiples etiquetas a un mismo texto.
- Esquema completo de preguntas de laya mediante `questions={...}` y llamada directa a `model.predict(...)`, segun se documenta en la tarjeta de smolaya.
- Ejecucion eficiente en CPU con kernels dinamicos int8 de PyTorch.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, capacidades de agente, vision ni audio: es un encoder puro de clasificacion y representacion.
- Capacidades multilingues: limitadas al ingles, unico idioma declarado.

## Casos de uso

- Analisis de sentimiento en produccion: clasificacion de resenas o tickets con etiquetas como `positive`, `negative` o `neutral`, con la ventaja de correr a 0,26 s por elemento en una CPU Ryzen 3 4300U (batch 1, 4 hilos) sin necesidad de GPU.
- Moderacion de contenido en tiempo casi real: uso de clasificacion multi-etiqueta (`multi_label=True`) para detectar categorias como toxicidad, spam o contenido fuera de politica en un flujo de ingesta de comentarios.
- Enrutado de tickets de soporte: clasificacion zero-shot de consultas entrantes hacia departamentos (facturacion, tecnico, comercial) sin reentrenar, definiendo las etiquetas en inferencia.
- Etiquetado de grandes volumenes de texto en pipelines batch: al reducir el coste por elemento respecto a laya (0,71 s frente a 0,26 s) y bajar el peso del modelo a 456 MB, permite procesar corpus extensos en infraestructura sin aceleradores.
- Busqueda semantica y deduplicacion: extraccion de embeddings con el encoder para construir indices vectoriales o detectar documentos casi duplicados en un corpus en ingles.
- Clasificacion de noticias y contenidos editoriales: categorizacion tematica (por ejemplo, AG News) para alimentar sistemas de recomendacion o taxonomia automatica.
- Servicios edge o embebidos: despliegue en dispositivos con CPU modesta o contenedores con memoria limitada, donde el modelo cabe holgadamente en RAM y no requiere paso de cuantizacion al cargar.
- Evaluacion rapida de hipotesis de etiquetado: dado que las etiquetas se definen en tiempo de inferencia, sirve para validar esquemas de clasificacion antes de comprometerse a un fine-tuning supervisado.

## Benchmarks y rendimiento

Los resultados proceden de la model card, sobre los mismos 12.398 elementos de evaluacion usados por smolaya:

| Tarea | laya | smolaya | smolaya-int8 |
|---|---|---|---|
| SST-2 | 0,918 | 0,942 | 0,939 |
| ARC-Easy | 0,511 | 0,602 | 0,596 |
| BoolQ | 0,835 | 0,851 | 0,849 |
| MNLI | 0,883 | 0,892 | 0,891 |
| AG News | 0,923 | 0,929 | 0,924 |
| **Pooled** | 0,812 | 0,839 | **0,836** |

Degradacion int8 frente a smolaya: -0,4 puntos [IC 95%: -0,6, -0,1]. Tiempo medio de CPU por elemento (batch 1, 4 hilos, Ryzen 3 4300U): laya 0,71 s; smolaya-int8 0,26 s, lo que supone aproximadamente 2,8 veces mas rapido que laya.

## Requisitos de hardware

- Pesos en disco: 456 MB en int8 (frente a 646 MB de smolaya), repositorio total de 0,5 GB.
- VRAM estimada para inferencia: en GPU los pesos se de-cuantizan, por lo que el consumo se aproxima al del modelo en fp16 (del orden de 0,6-0,7 GB solo para pesos, mas activaciones y overhead del runtime); cifra exacta no disponible.
- CPU: es el entorno objetivo. El modelo esta disenado para ejecutarse con los kernels int8 dinamicos de PyTorch en CPU, con 4 hilos medidos en un Ryzen 3 4300U.
- GPU recomendadas: no se especifican; el autor advierte que en GPU conviene usar smolaya en fp16, que es mas rapido que ejecutar estos pesos de-cuantizados. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) alberga sin problema el modelo en fp16, pero no es su escenario optimo.
- Cabe en practicamente cualquier equipo: 323 M de parametros y 456 MB de pesos permiten ejecucion en portatiles y maquinas sin GPU dedicada.
- Opciones de despliegue: `transformers.pipeline("zero-shot-classification", ...)` con `trust_remote_code=True`. El repositorio se carga solo con transformers y no con `laya.load`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,26 s por elemento en CPU (batch 1, 4 hilos, Ryzen 3 4300U). No se proporcionan datos de throughput agregado ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pooled (5 tareas) | CPU por elemento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| smolaya-int8 | 323.422.470 | no disponible | 0,836 | 0,26 s | Apache-2.0 | HuggingFace (este repositorio) |
| smolaya | 323 M (aproximado, mismo encoder) | no disponible | 0,839 | no disponible (se infiere mayor que int8) | Apache-2.0 | HuggingFace, `anon767tom/smolaya` |
| laya | no disponible | no disponible | 0,812 | 0,71 s | no disponible | HuggingFace, `convaiinnovations/laya` |

Alternativas adicionales de la misma categoria (encoders ModernBERT de clasificacion) no se detallan en la informacion disponible. En terminos practicos, smolaya-int8 es la opcion preferible en CPU por velocidad y tamano, mientras que smolaya en fp16 es la opcion preferible en GPU.

## Limitaciones y advertencias

- Cobertura idiomatica restringida al ingles; no se declara soporte de otros idiomas.
- Al ser un encoder de clasificacion, no genera texto ni ejecuta razonamiento multi-paso, agentes o tool calling.
- La model card no documenta la longitud de contexto ni el comportamiento con documentos largos, por lo que este extremo queda sin verificar.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar ese codigo antes de usarlo en produccion.
- Los kernels int8 son exclusivos de CPU: en GPU el modelo se ejecuta de-cuantizado y resulta mas lento que smolaya en fp16, advertencia explicita del autor.
- La cuantizacion introduce una degradacion medida de -0,4 puntos en la puntuacion combinada, con un intervalo de confianza que llega a -0,6; en tareas concretas como ARC-Easy la caida respecto a smolaya es de 0,6 puntos.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni procesos de alineacion, lo que dificulta evaluar riesgos de sesgo.
- Riesgo de calibracion deficiente en las probabilidades de clasificacion: no se aportan datos de calibracion ni de robustez ante entradas fuera de distribucion.
- Adopcion practicamente nula en la comunidad (0 descargas y 1 like en el momento de la consulta), lo que limita la validacion independiente de los resultados reportados.
- Aunque la licencia es Apache-2.0, el modelo deriva de smolaya y de laya; conviene revisar las condiciones de atribucion de la cadena completa antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anon767tom/smolaya-int8
- Modelo base smolaya: https://huggingface.co/anon767tom/smolaya
- Repositorio de archivos de smolaya: https://huggingface.co/anon767tom/smolaya/tree/main
- Modelo original laya (Convai Innovations): https://huggingface.co/convaiinnovations/laya
