# martin76ec/deberta-infrastructure-triage-distill

## Resumen

deberta-infrastructure-triage-distill es un modelo de clasificación de secuencias de tipo binario, desarrollado por el usuario martin76ec, que adapta el backbone `microsoft/deberta-v3-small` al problema concreto del triaje de incidentes de infraestructura. Su funcion es decidir, dado el estado de un incidente descrito en formato estructurado y una pregunta con una opcion de respuesta, si esa opcion se cumple o no: por ejemplo, si el escalado corresponde al equipo `database_reliability_engineering`. El modelo se entrena sobre datos sinteticos de incidentes y se distribuye con licencia MIT.

Tecnicamente es un encoder transformer de la familia DeBERTa-v3 (disentangled attention y enhanced mask decoder) con 141.896.450 parametros, afinado con LoRA sobre las proyecciones `query_proj` y `value_proj` (r=8, alpha=16) y posteriormente fusionado en el modelo base para permitir inferencia autonoma. El autor declara una precision del 88,42 % en el conjunto de test, y el `model-index` registra 0,8841 de accuracy (no verificado) sobre el dataset `martin76ec/infrastructure-incident-synthetic`.

El interes practico del modelo no esta en la generacion de texto, sino en servir como clasificador ligero y desplegable en CPU para enrutar alertas y tickets en sistemas de observabilidad y guardias on-call. Se publica con 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (disentangled attention, enhanced mask decoder), con fine-tuning LoRA fusionado en el modelo base |
| Parametros totales | 141.896.450 (safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la ficha; el ejemplo de uso trunca a `max_length=256` y el backbone DeBERTa-v3 admite hasta 512 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se declaran variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible (la ficha no declara idiomas; los ejemplos de la model card estan en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | microsoft/deberta-v3-small |
| Tarea | clasificacion de secuencias binaria (premise/hypothesis) |
| Dataset de entrenamiento | martin76ec/infrastructure-incident-synthetic |
| Tamano del repositorio | 0,3 GB |
| Precision de entrenamiento | bf16 |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-small`, un encoder transformer que introduce dos innovaciones frente a BERT y RoBERTa: un mecanismo de atencion desacoplada (disentangled attention) que representa por separado contenido y posicion de cada token, y un decodificador de mascara mejorado (enhanced mask decoder) que incorpora informacion de posicion absoluta durante el preentrenamiento. Segun la documentacion de HuggingFace, DeBERTa usa embeddings de posicion relativos y rinde especialmente bien en tareas de clasificacion a nivel de frase o de par de frases, que es exactamente el regimen de uso de esta ficha.

El ajuste se realizo con destilacion de conocimiento: divergencia KL sobre las probabilidades suavizadas con temperatura T=2.0 combinada con entropia cruzada, durante 3 epocas con learning rate 3e-4 y precision bf16. Antes de la destilacion se aplico un fine-tuning parametro-eficiente con LoRA (r=8, alpha=16) sobre `query_proj` y `value_proj`, y los adaptadores se fusionaron despues en el modelo base para que el artefacto publicado funcione como modelo independiente. La model card no especifica si el profesor y el alumno son pesos distintos ni detalla el volumen total de tokens de entrenamiento, la composicion del dataset sintetico ni si se aplicaron tecnicas de RLHF o DPO (en un clasificador no serian de aplicacion directa).

Un detalle de diseno relevante: el modelo no genera texto ni devuelve una etiqueta multiclase, sino una decision binaria sobre un par (premise, hypothesis). Para elegir entre N equipos o N categorias hay que ejecutar N inferencias, una por cada opcion planteada en la hipotesis, y quedarse con la de mayor puntuacion. Este esquema de "NLI aplicado a triaje" es el que aparece en el ejemplo de la model card.

## Capacidades

- Clasificacion binaria de pares de secuencias en formato entailment: recibe un `premise` con el estado del incidente y una `hypothesis` con una pregunta y una opcion, y devuelve logits sobre dos clases.
- Clasificacion multietiqueta por composicion: al formular N hipotesis independientes se puede obtener la opcion mas probable entre varios equipos, categorias o niveles de severidad.
- Interpretacion de cargas utiles estructuradas: el ejemplo de la model card incluye JSON en linea (`incident_id`, `alert_name`, etc.) dentro del `premise`.
- Inferencia ligera: al ser un encoder de 141,9 M de parametros, el coste por llamada es muy inferior al de un modelo generativo.
- Sin generacion de texto: no produce respuestas libres, resumenes ni explicaciones.
- Sin tool calling ni function calling: no existe soporte de llamadas a herramientas.
- Sin capacidades de agente ni razonamiento multi-paso nativo; el "razonamiento" se limita a la decision de clasificacion.
- Sin capacidades multimodales: no procesa imagen, audio ni video.
- Cobertura multilingue: no declarada en la informacion disponible.

## Casos de uso

- Enrutado de escalados a equipos de ingenieria: dado el estado del incidente como `premise` y una `hypothesis` del tipo `"Option: database_reliability_engineering"`, el modelo decide si ese equipo es el propietario; repitiendo la inferencia para cada equipo candidato y tomando el `argmax` se obtiene el enrutado final. Es el caso de uso explicito de la model card.
- Pre-filtrado de alertas en guardias on-call: clasificar cada alerta entrante como "requiere escalado" o "no requiere escalado" antes de que llegue a la persona de guardia, reduciendo el volumen de paginas efectivas.
- Etiquetado automatico de tickets en plataformas como Jira o ServiceNow: un webhook envia el ticket al modelo, que asigna la cola o el equipo responsable segun la descripcion del incidente, sin intervencion humana en el primer nivel.
- Deteccion de falsos positivos en monitorizacion: discriminar alertas que no corresponden a incidentes reales, usando el estado de la alerta como `premise` y una hipotesis de confirmacion, para evitar escalados innecesarios.
- Enriquecimiento de alertas en PagerDuty u Opsgenie: anadir a cada alerta una etiqueta con el equipo propietario estimado, de modo que las reglas de enrutado posteriores ya dispongan de esa informacion.
- Auditoria por lotes de una politica de escalado: procesar el historico de incidentes cerrados y medir cuantas veces el modelo habria enrutado a un equipo distinto del que finalmente lo resolvio, como analisis de calidad de la politica vigente.
- Clasificacion de informes post-mortem: aplicar el mismo esquema premise/hypothesis para etiquetar automaticamente informes con criterios como "el incidente afecto a un servicio de cara al usuario" o "se activo un plan de contingencia".
- Integracion en pipelines de CI/CD o de datos: al ser un encoder pequeno y determinista, encaja como etapa de clasificacion en un job por lotes que procese miles de eventos de observabilidad por ejecucion.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los autodeclarados por el autor en el `model-index` de la model card:

| Modelo | Dataset | Tarea | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| martin76ec/deberta-infrastructure-triage-distill | martin76ec/infrastructure-incident-synthetic | Text classification | Accuracy | 0,8841 (88,41 %) | No |
| martin76ec/deberta-infrastructure-triage-distill | martin76ec/infrastructure-incident-synthetic | Text classification | Accuracy (segun el texto de la model card) | 88,42 % | No |

Nota: el valor del `model-index` (0,8841) y el del cuerpo de la model card (88,42 %) no coinciden exactamente; se reproduces ambos tal y como aparecen. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, y ninguno de los resultados esta verificado por un tercero.

## Requisitos de hardware

- VRAM estimada: alrededor de 568 MB en fp32 y 284 MB en fp16/bf16 para los pesos; con activaciones y un lote pequeno el consumo realista se mantiene por debajo de 1 GB. En int8 se reduce a unos 142 MB.
- GPU: funciona en cualquier GPU moderna, incluidas RTX 3060, RTX 4090, A100 y H100. No requiere aceleradores de gama alta.
- Consumer GPU: si, cabe con holgura en cualquier GPU de consumo actual y tambien en iGPU con memoria compartida suficiente.
- CPU: la inferencia en CPU es viable dado el tamano del modelo (141,9 M de parametros); no se publican cifras de latencia.
- Opciones de despliegue: PyTorch + Transformers (`AutoModelForSequenceClassification`), exportacion a ONNX Runtime mediante Optimum, TorchScript y servicio HTTP propio con FastAPI. `llama.cpp` y Ollama no son opciones habituales para un encoder de clasificacion en safetensors. El soporte en vLLM y Text Embeddings Inference para la arquitectura DeBERTa-v3 orientada a clasificacion deberia verificarse antes de adoptarlos.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por inferencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Accuracy en el dataset sintetico | Disponibilidad |
|---|---|---|---|---|---|---|
| martin76ec/deberta-infrastructure-triage-distill | 141.896.450 | no disponible (ejemplo a 256 tokens) | Clasificacion binaria de triaje | MIT | 0,8841 (autodeclarado) | HuggingFace, 0 descargas |
| microsoft/deberta-v3-small | no disponible en la informacion proporcionada | no disponible | Modelo base preentrenado, sin cabeza de triaje | MIT | no evaluado | HuggingFace |
| microsoft/deberta-v3-base | no disponible en la informacion proporcionada | no disponible | Modelo base preentrenado | MIT | no evaluado | HuggingFace |
| Clasificadores genericos de la familia BERT/RoBERTa | no disponible en la informacion proporcionada | no disponible | Clasificacion de texto general | variable | no evaluado | HuggingFace |

No se dispone de datos comparativos de rendimiento entre alternativas sobre el mismo dataset, ya que `martin76ec/infrastructure-incident-synthetic` es un dataset propio del autor y no se han publicado evaluaciones cruzadas.

## Limitaciones y advertencias

- Ambito restringido: es un clasificador binario, no un modelo generativo. No puede redactar respuestas, resumir incidentes ni justificar su decision en lenguaje natural.
- Coste de escalado lineal: para elegir entre N equipos o N categorias hay que ejecutar N inferencias por incidente, lo que multiplica la latencia y el coste de computo con el numero de opciones.
- Datos sinteticos: el entrenamiento se realizo exclusivamente sobre `martin76ec/infrastructure-incident-synthetic`. El rendimiento sobre incidentes reales puede degradarse por desviacion de dominio (domain shift); no se han publicado evaluaciones en produccion.
- Riesgo de clasificacion erronea con impacto operativo: un falso negativo en el triaje de escalado puede retrasar la respuesta a un incidente critico. El 88,41 % de accuracy implica un porcentaje de error no despreciable para un uso sin supervision humana.
- Resultado no verificado: la metrica esta marcada como `verified: false` y hay una discrepancia menor entre el valor del `model-index` (0,8841) y el del texto de la model card (88,42 %).
- Idiomas no declarados: la ficha no especifica que idiomas soporta el modelo. Los ejemplos estan en ingles, por lo que el uso en castellano no esta garantizado.
- Truncamiento: el ejemplo de uso aplica `max_length=256`. Los estados de incidente con cargas utiles JSON largas (trazas, listas de hosts, logs adjuntos) pueden truncarse y perder informacion relevante.
- Inconsistencia en los metadatos: las etiquetas del repositorio incluyen `deberta-v2` mientras que el modelo base declarado es `deberta-v3-small`; conviene verificar la arquitectura real antes de integrarla.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas. No hay evidencia externa de robustez.
- Capacidad limitada por el ajuste: 3 epocas, LoRA con r=8 sobre dos proyecciones y fusion posterior; el margen de mejora mediante mas datos o un rango LoRA mayor no esta explorado en la informacion disponible.
- Licencia: MIT permite uso comercial y modificacion, pero no ofrece garantias ni clausulas de responsabilidad sobre el rendimiento del modelo.
- Sobre el sesgo: no se ha publicado ningun analisis de sesgos, y al tratarse de datos sinteticos el modelo puede heredar los patrones y los supuestos del generador del dataset, no necesariamente representativos de una organizacion real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/martin76ec/deberta-infrastructure-triage-distill
- Dataset de entrenamiento: https://huggingface.co/datasets/martin76ec/infrastructure-incident-synthetic
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
- Repositorio oficial de DeBERTa: https://github.com/microsoft/DeBERTa
- README del repositorio de DeBERTa: https://github.com/microsoft/DeBERTa/blob/master/README.md
- Documentacion de DeBERTa en Transformers: https://huggingface.co/docs/transformers/v4.56.0/en/model_doc/deberta
- Proyecto DeBERTa en Microsoft Research: https://www.microsoft.com/en-us/research/project/deberta/
- Resumen tecnico de DeBERTa en DeepWiki: https://deepwiki.com/microsoft/DeBERTa
