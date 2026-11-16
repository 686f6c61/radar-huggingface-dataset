# fredreick/HDM-Qwen3.5-4B

## Resumen

HDM-Qwen3.5-4B es un bloque de enrutamiento (decision head) publicado por el usuario fredreick dentro del marco de los Hybrid Decision Models (HDM) descritos en el articulo "The Value of Thinking: Learning When to Reason in Hybrid Decision Models" (arXiv:2611.16961). No es un modelo de lenguaje completo: es un modulo de 658.692 parametros (2,7 MB) que se acopla a un backbone congelado, en este caso Qwen/Qwen3.5-4B, sin modificarlo. Su funcion es decidir, pregunta a pregunta, si merece la pena activar el razonamiento extendido (thinking) o si basta con la respuesta rapida de un unico forward pass.

El bloque lee el hidden state de la capa -1 (ancho 2560) de la pasada rapida, junto con ocho estadisticas de esa respuesta, y predice la probabilidad de cuatro resultados posibles: acierto rapido y acierto con thinking, acierto rapido y fallo con thinking, fallo rapido y acierto con thinking, y fallo en ambos casos. Con esas probabilidades calcula el "valor del pensamiento" (P(fallo rapido, acierto con thinking) menos P(acierto rapido, fallo con thinking)) y envia la pregunta a thinking cuando ese valor supera un precio lambda configurable por peticion.

La relevancia practica es economica: en modelos hibridos que permiten razonar o no, decidir cuando razonar reduce de forma sustancial el gasto de tokens de thinking manteniendo buena parte de la precision. El bloque se entrena en minutos y se reutiliza sin reajuste en otros benchmarks, lo que lo convierte en una pieza ligera y sustituible dentro de un pipeline de serving.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque de decision (decision head) sobre un transformer backbone congelado; prediccion sobre hidden state de la capa -1 |
| Parametros totales | 658.692 (2,7 MB) en el bloque; el backbone Qwen3.5-4B no se incluye |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone Qwen3.5-4B; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el bloque se distribuye en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fichero `head-4b-mmlu-pro.safetensors`) |

## Arquitectura y entrenamiento

El bloque es un modulo de clasificacion de cuatro clases que opera sobre caracteristicas extraidas del backbone: el hidden state crudo de la capa -1 (readout `coded`, anchura 2560) concatenado con ocho estadisticas de la respuesta rapida, lo que da una entrada de 2568 dimensiones. El backbone Qwen/Qwen3.5-4B permanece congelado y sin modificar; el bloque solo aprende a predecir el resultado de la comparacion entre respuesta rapida y respuesta con thinking. El precio lambda no participa en el ajuste: se fija por peticion en tiempo de serving.

El entrenamiento se realizo sobre MMLU-Pro, con 1.154 preguntas de once categorias tematicas; quimica, economia y psicologia quedaron fuera del ajuste, dejando 346 preguntas de validacion que el bloque nunca vio. El objetivo fue supervisado, con semilla 0 y un presupuesto de thinking de 4.096 tokens. El bloque se ajusto una sola vez y se uso sin cambios en el resto de benchmarks del articulo. El informe de ajuste se publica como `head-4b-mmlu-pro-report.json`. El serving compara identificador de modelo, revision, readout y tamano del hidden state antes de acoplar el bloque, y lanza un error si no coinciden.

## Capacidades

- Prediccion del valor del razonamiento: estima si activar thinking mejora o empeora la respuesta respecto a la pasada rapida.
- Enrutamiento adaptativo por pregunta: decide individualmente que preguntas se envian a thinking segun el precio lambda.
- Control de coste por peticion: lambda y presupuesto de thinking (`--think-budget`) configurables en el arranque y sobrescribibles por peticion mediante el campo `routing`.
- Integracion con SGLang 0.5.9 como backend de referencia; el backend de transformers sirve el mismo bloque pero con caracteristicas no identicas, lo que puede alterar el enrutamiento.
- Carga independiente del bloque mediante `DecisionHead.load()` para inspeccion o uso programatico.
- No realiza generacion de texto ni razonamiento por si mismo: es un modulo auxiliar de decision.

## Casos de uso

- Serving economico de Qwen3.5-4B en produccion: desplegar el backbone con el bloque permite atender consultas simples con la pasada rapida y reservar el thinking para las dificiles, reduciendo el gasto de tokens de razonamiento hasta un 31% con lambda 0,1 segun los resultados de MMLU-Pro.
- Enrutamiento con presupuesto de coste fijo: fijar lambda alto para entornos con limites estrictos de latencia o coste por consulta, aceptando la perdida de precision documentada (81,5% frente a 85,3% con thinking siempre en MMLU-Pro).
- Evaluacion de preguntas de opcion multiple en pipelines academicos: el bloque se ajusto especificamente sobre MMLU-Pro y es adecuado para clasificar preguntas de examen o benchmarks de conocimiento antes de decidir el modo de respuesta.
- Ajuste fino del compromiso precision-coste por cliente: al poder sobrescribir lambda por peticion, un mismo despliegue puede servir a usuarios que priorizan calidad y a usuarios que priorizan latencia.
- Investigacion sobre razonamiento adaptativo: el bloque y el codigo asociado permiten reproducir el articulo y experimentar con otros backbones o readouts, reajustando el bloque en minutos.
- Prototipado de sistemas hibridos de decision: usar la prediccion de cuatro clases para analizar en que tipo de preguntas el thinking aporta valor y en cuales solo consume tokens.

## Benchmarks y rendimiento

MMLU-Pro, 346 preguntas de validacion (nunca vistas en el ajuste). Sin thinking: 54,3%. Thinking siempre: 85,3%.

| Precio lambda | Enviadas a thinking | Precision | Precision aleatoria | Tokens de thinking (respecto a thinking siempre) |
|---|---|---|---|---|
| 0,1 | 52,9% | 81,5% | 70,7% | 69% |
| 0,05 | 58,4% | 83,5% | 72,4% | 75% |
| 0 | 66,2% | 84,4% | 74,8% | 81% |
| -0,05 | 93,9% | 85,0% | 83,4% | 94% |
| -0,1 | 96,8% | 84,4% | 84,3% | 97% |

JevBench, 231 items publicos (el bloque no se ajusto sobre este benchmark). Sin thinking: 76,2%. Thinking siempre: 93,1%.

| Precio lambda | Enviadas a thinking | Precision | Precision aleatoria | Tokens de thinking (respecto a thinking siempre) |
|---|---|---|---|---|
| 0,1 | 16,5% | 83,5% | 79,0% | 33% |
| 0,05 | 17,7% | 83,5% | 79,2% | 35% |
| 0 | 30,3% | 85,7% | 81,3% | 47% |

## Requisitos de hardware

- VRAM del bloque: despreciable (2,7 MB en safetensors); el requisito real lo marca el backbone Qwen3.5-4B, cuyos pesos no se incluyen en este repositorio.
- VRAM del backbone: no disponible en la informacion proporcionada; depende del backend, la precision y el presupuesto de contexto.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible en la informacion proporcionada.
- Despliegue: SGLang 0.5.9 es el backend de referencia usado para los resultados publicados, mediante `hde-serve --backend sglang`; el backend de transformers sirve el mismo bloque pero con caracteristicas no identicas. El repositorio de codigo se instala con `uv sync`.
- Latencia y throughput: no disponibles; el ahorro medido es en tokens de thinking (hasta un 31% de reduccion con lambda 0,1 en MMLU-Pro), no en latencia absoluta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HDM-Qwen3.5-4B | Bloque de enrutamiento sobre Qwen3.5-4B | 658.692 (bloque) | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| fredreick/HDM-Qwen3.8-27B | Bloque de enrutamiento sobre Qwen3.8-27B | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B | Modelo de lenguaje completo (backbone) | 4B (aproximado por el nombre) | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no se ofrece comparacion de rendimiento.

## Limitaciones y advertencias

- El bloque se ajusto exclusivamente sobre preguntas de opcion multiple (MMLU-Pro); otros tipos de pregunta no estan probados.
- En JevBench, cualquier precio lambda negativo envia todas las preguntas a thinking, de modo que solo precios de cero o superiores ofrecen una decision real en ese benchmark.
- El bloque envia a thinking la mayoria de las preguntas que el thinking no puede resolver, lo que desperdicia tokens en esos casos.
- Cada tabla de resultados corresponde a una unica ejecucion; no se reportan intervalos de confianza ni multiples semillas.
- Cambiar el backbone, la capa, el readout o la precision numerica altera las caracteristicas sobre las que se ajusto el bloque; en ese caso hay que reajustarlo (el ajuste tarda minutos).
- El backend de transformers produce caracteristicas no identicas a las de SGLang, por lo que una pregunta puede enrutarse de forma distinta segun el backend.
- No es un modelo autonomo: requiere el backbone Qwen3.5-4B, que no se incluye en el repositorio.
- La licencia apache-2.0 cubre el bloque; el uso del backbone queda sujeto a la licencia de Qwen/Qwen3.5-4B, no especificada en la informacion disponible.
- No hay informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion especifico del bloque.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fredreick/HDM-Qwen3.5-4B
- Backbone: https://huggingface.co/Qwen/Qwen3.5-4B
- Articulo: https://arxiv.org/abs/2611.16961
- Codigo: https://github.com/zhengxuyu/HDM-code
- Otro tamano: https://huggingface.co/fredreick/HDM-Qwen3.8-27B
