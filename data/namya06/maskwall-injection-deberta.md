# namya06/maskwall-injection-deberta

## Resumen

MaskWall-injection-DeBERTa es un clasificador de texto binario especializado en la deteccion de *prompt injection* y *jailbreak* en entradas de usuario. Lo desarrolla el autor independiente namya06 como parte del proyecto MaskWall, una herramienta de defensa para aplicaciones basadas en modelos de lenguaje. El modelo parte de `microsoft/deberta-v3-small` (arquitectura transformer encoder con attention disentangled, 141 millones de parametros) y se ha afinado para producir una etiqueta de seguridad sobre el prompt recibido.

Su relevancia es acotada y muy especifica: no es el modelo que sirve la aplicacion en produccion, sino el modelo de comparacion mas grande del proyecto. Se publica con el objetivo explicito de medir latencia y comportamiento frente al modelo servido (`namya06/maskwall-injection-minilm`) sobre el hardware real de despliegue. La model card lo indica con claridad: se aloja para benchmarking, no para inferencia en la aplicacion activa.

El artefacto distribuido es un fichero ONNX cuantizado a int8 de 161,2 MB, con licencia MIT heredada del modelo base. El entrenamiento se realizo sobre la primera ronda del conjunto de datos limpio y aumentado, antes de la ronda de *hard negatives*, lo que explica su mayor tasa de falsos positivos frente a la alternativa MiniLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3, attention disentangled), cabeza de clasificacion binaria |
| Parametros totales | 141 millones (heredados de microsoft/deberta-v3-small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base admite hasta 512 tokens; la model card no lo declara) |
| Tipos de cuantizacion | int8 (ONNX Runtime) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (fichero int8 de 161,2 MB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado de `microsoft/deberta-v3-small`, un encoder transformer de 12 capas y 141 millones de parametros que emplea attention disentangled (contenido y posicion separados en el calculo de atencion) y una variante mejorada del preentrenamiento con denoising. Sobre esa base se anade una cabeza de clasificacion para la tarea binaria de deteccion de inyeccion de prompts. El resultado se exporta a ONNX y se cuantiza a int8, lo que reduce el peso del artefacto a 161,2 MB y permite inferencia de baja latencia en CPU.

El entrenamiento se realizo sobre la **primera ronda** del conjunto de datos limpio y aumentado del proyecto, es decir, antes de la ronda de *hard negatives*. Este detalle es relevante porque condiciona el rendimiento: el modelo no ha visto los ejemplos dificiles que si incorpora la version servida. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO (en un clasificador de este tipo no seria lo habitual). La seleccion del umbral de decision se ajusto sobre el conjunto de validacion propio del modelo.

## Capacidades

- Clasificacion binaria de prompts: distingue entre entrada benigna y entrada con intento de *prompt injection* o *jailbreak*.
- Deteccion de ataques directos e indirectos sobre el texto de entrada, segun la definicion del proyecto MaskWall.
- Inferencia en CPU via ONNX Runtime gracias a la cuantizacion int8, sin necesidad de GPU.
- Integracion como capa de filtrado previa a un LLM en pipelines de aplicaciones conversacionales.
- Soporte de umbral de decision ajustable (el autor reporta resultados a un umbral afinado sobre validacion).
- Capacidad multilingue: limitada al ingles; no se declara soporte de otros idiomas.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento extendido: es un clasificador, no un modelo generativo.

## Casos de uso

- Filtrado previo de prompts en un chatbot: el clasificador se ejecuta antes de enviar la entrada al LLM y bloquea mensajes que superen el umbral de riesgo, con una latencia baja al correr en CPU sobre ONNX int8.
- Guardrail en pipelines RAG: se intercala en la ruta de entrada para detectar instrucciones maliciosas embebidas en la consulta del usuario antes de recuperar documentos.
- Evaluacion comparativa de defensas: sirve como referencia de mayor tamano frente a modelos MiniLM en estudios de latencia y precision, tal como plantea el propio autor.
- Monitorizacion de trafico en produccion: clasificacion por lotes de logs de prompts para identificar intentos de jailbreak y alimentar paneles de seguridad.
- Prototipado de sistemas de moderacion: al ser MIT y ONNX int8, se puede desplegar en entornos sin GPU para validar una arquitectura de defensa antes de invertir en infraestructura.
- Investigacion en seguridad de LLM: base para experimentos de *red teaming* donde se necesita un detector rapido y ligero que etiquete grandes volumenes de prompts.
- Filtro en herramientas internas de empresa: bloqueo de entradas que intenten extraer el system prompt o saltarse las restricciones del asistente desplegado.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, sobre el conjunto de test de la ronda 1 y con el umbral ajustado en validacion:

| Metrica | Valor |
|---|---|
| F1 | 0,884 |
| Tasa de falsos positivos | 0,052 (37 de 717) |
| XSTest (prompts benignos marcados) | 3 de 250 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que se trata de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuracion publicada; el artefacto es ONNX int8 de 161,2 MB y esta pensado para ejecutarse en CPU.
- En GPU, el modelo cabe holgadamente en cualquier tarjeta con mas de 1 GB de memoria (RTX 3060, RTX 4090, A100, H100), aunque el despliegue tipico sera en CPU.
- Cabe en cualquier equipo consumer: el fichero int8 ocupa 161,2 MB y la inferencia en CPU es viable en portatiles y servidores de bajo coste.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); no se distribuyen pesos en safetensors ni GGUF, por lo que llama.cpp, Ollama o vLLM no son aplicables directamente sin conversion.
- Latencia y throughput: no disponibles de forma numerica en la informacion proporcionada; el autor publica el modelo precisamente para medir latencia en el hardware real de despliegue, pero no incluye cifras en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| namya06/maskwall-injection-deberta | 141 M | no disponible | MIT | ONNX int8 | Modelo de comparacion, no servido en produccion; F1 0,884, FPR 0,052 |
| namya06/maskwall-injection-minilm | no disponible | no disponible | no disponible | no disponible | Modelo servido en la aplicacion MaskWall; misma tarea y proyecto |
| microsoft/deberta-v3-small | 141 M | 512 tokens | MIT | safetensors | Modelo base sin fine-tuning para deteccion de injection |

No se dispone de datos de benchmarks comparables con otros detectores de prompt injection en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo **no es el servido en la aplicacion MaskWall**; se publica unicamente como referencia de benchmarking. No debe asumirse como la defensa activa del proyecto.
- Tasa de falsos positivos del 5,2 %: marca como maliciosos aproximadamente 1 de cada 20 prompts benignos, lo que puede degradar la experiencia de usuario en produccion.
- Entrenado solo con la primera ronda del dataset, sin *hard negatives*; su robustez frente a ataques sofisticados es inferior a la del modelo servido.
- Solo soporta ingles; prompts en otros idiomas pueden clasificarse de forma poco fiable.
- Riesgo de alucinacion no aplica en sentido estricto (es un clasificador), pero si existe riesgo de clasificacion erronea en entradas ambiguas o de dominio no visto.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos al de entrenamiento.
- No se documentan sesgos especificos ni la composicion del dataset de entrenamiento en la model card; para auditar sesgos habria que consultar `NOTICE.md` y `docs/decisions.md` del repositorio.
- Al ser un artefacto ONNX int8, la conversion a otros formatos (GGUF, safetensors) requeriria trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namya06/maskwall-injection-deberta
- Modelo servido en produccion: https://huggingface.co/namya06/maskwall-injection-minilm
- Repositorio del proyecto MaskWall: https://github.com/namyaa6/MaskWall
- Documento de decisiones y seleccion de modelo: `docs/decisions.md` en el repositorio
- Licencias y procedencia de datos: https://github.com/namyaa6/MaskWall/blob/main/NOTICE.md
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
