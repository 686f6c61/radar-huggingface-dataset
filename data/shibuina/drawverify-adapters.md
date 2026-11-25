# shibuina/drawverify-adapters

## Resumen

DrawVerify adapters es un conjunto de adaptadores LoRA publicados por el usuario shibuina (repositorio `shibuina/drawverify-adapters`) sobre el modelo base Qwen/Qwen3-VL-2B-Instruct. Su funcion no es generar texto ni ejecutar acciones roboticas, sino actuar como validador: recibe una imagen 512x512 con una instruccion bosquejada (un circulo marcando un objeto, opcionalmente una flecha hacia el destino y una leyenda sin nombres del tipo "mueve esto ahi") y decide si esa instruccion describe exactamente una accion sensata antes de que un sistema robotico la ejecute.

El modelo es un adaptador PEFT (LoRA de rango 32, alpha 64, dropout 0.05 aplicado a todas las proyecciones de atencion y MLP) que reutiliza la torre visual y el decoder de Qwen3-VL-2B-Instruct, un VLM de 2.000 millones de parametros. El repositorio ocupa 0,4 GB e incluye tres variantes de adaptador entrenadas con semillas y estrategias de target distintas, ademas de las predicciones por prompt y las etiquetas del conjunto de test humano.

Su relevancia es acotada pero concreta: aborda el problema de la validacion previa de instrucciones en entornos de robotica basada en bocetos, un paso intermedio entre la interfaz de dibujo y la politica de control (DrawVLA). Forma parte del informe final CS707 *DrawVerify: Validating Sketched Robot Instructions Before Execution* y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-VL-2B-Instruct (transformer multimodal vision-language) |
| Parametros totales | Adaptadores LoRA sobre un base de 2B; numero exacto de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3-VL-2B-Instruct; no especificada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT), con `run_config.json` y `SHA256SUMS` |
| Tamano del repositorio | 0,4 GB |
| Entrada | Imagen 512x512 marcada + instruccion fija + caption |
| Salida | P(wrong) = sigmoid(log P(">wrong</answer>") - log P(">valid</answer>")) tras el prefijo forzado `<answer` |
| Dataset de entrenamiento | `shibuina/drawvla-prompt-validation-taskblind` (34.165 prompts de entrenamiento en stage 1) |
| Hiperparametros LoRA | Rango 32, alpha 64, dropout 0.05, todas las proyecciones de atencion y MLP, 2 epochs, batch efectivo 16, lr 1e-4 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-VL-2B-Instruct, un modelo vision-language transformer que procesa conjuntamente la imagen marcada y el texto de la instruccion y el caption. La innovacion no esta en la arquitectura del backbone, sino en el uso del modelo como clasificador binario de validez: en lugar de generar una respuesta libre, se fuerza el prefijo `<answer` y se compara la probabilidad logaritmica asignada a `>wrong</answer>` frente a `>valid</answer>`, obteniendo un score calibrado P(wrong) que puede umbralizarse.

El entrenamiento se estructura en dos etapas. La etapa 1 usa exclusivamente los 34.165 prompts generados sinteticamente del dataset `drawvla-prompt-validation-taskblind`, con dos variantes de objetivo: solo respuesta (`2b-full4-ans`) o razonamiento seguido de respuesta (`2b-full4`). La etapa 2 parte de `2b-full4` y anade 144 bocetos humanos. Los adaptadores publicados corresponden a la semilla 0; el informe reporta medias de tres semillas. Los datos de entrenamiento y evaluacion se restringen a escenas LIBERO.

## Capacidades

- Validacion binaria de instrucciones bosquejadas: decide si un circulo, una flecha opcional y un caption sin nombres describen una unica accion ejecutable.
- Puntuacion calibrada P(wrong) mediante comparacion de log-probabilidades sobre un prefijo forzado, apta para umbralizar en un pipeline.
- Procesamiento de imagen 512x512 con marcas graficas superpuestas junto con texto de instruccion y caption.
- Razonamiento opcional antes de la respuesta en la variante `2b-full4` (rationale then answer).
- Adaptacion a bocetos humanos mediante la variante `2b-full4-hum-s0` (stage 2 sobre 144 bocetos).
- No soporta tool calling, agentes multi-paso, vision general, audio ni modo thinking extendido; su alcance es la tarea de validacion descrita.

## Casos de uso

- Puerta de validacion previa a la ejecucion robotica: el adaptador se situa entre la interfaz de bocetos y la politica DrawVLA; si P(wrong) supera un umbral, la instruccion se rechaza o se pide aclaracion antes de que el robot actue.
- Interfaz de dibujo asistida para operadores: el sistema puede resaltar en tiempo real si el boceto actual (circulo, flecha, caption) es ambiguo, guiando al usuario a corregirlo antes de confirmar.
- Filtrado de datos de entrenamiento para VLA: las predicciones por prompt del repositorio permiten descartar instrucciones invalidas o ambiguas de un corpus antes de entrenar una politica de control.
- Investigacion en validacion de instrucciones multimodales: los adaptadores y las predicciones por prompt sirven como linea base reproducible para comparar estrategias de target (answer-only frente a rationale) y de datos (sintetico frente a humano).
- Evaluacion de robustez de VLMs pequenos en dominios de robotica: el par base de 2B mas LoRA permite medir cuanto puede aportar un adaptador ligero frente a un modelo mayor en una tarea de discriminacion fina.
- Despliegue en hardware modesto: al ser un adaptador sobre un base de 2B, cabe en GPUs de consumo y puede integrarse en estaciones de trabajo junto al simulador o al entorno LIBERO sin infraestructura dedicada.

## Benchmarks y rendimiento

| Adaptador | Entrenamiento | LIBERO-90 AUROC | Human sketches AUROC |
|---|---|---|---|
| `2b-full4-ans` | stage 1, prompts generados, target answer-only (seed 0) | 0,965 | 0,918 |
| `2b-full4` | stage 1, prompts generados, rationale then answer (seed 0) | 0,910 | 0,886 |
| `2b-full4-hum-s0` | `2b-full4` + stage 2 sobre 144 bocetos humanos (seed 0) | 0,971 | 0,901 |

El informe original reporta medias de tres semillas; este repositorio contiene unicamente los adaptadores de la semilla 0. No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para estos adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un base de 2B con adaptadores LoRA, la huella es la del modelo Qwen3-VL-2B-Instruct en la precision elegida, mas el adaptador (repositorio de 0,4 GB).
- GPU recomendadas: no especificadas en la model card; por tamano del base, es viable en GPUs de consumo con VRAM suficiente para un VLM de 2B, y en A100/H100 para lotes mayores.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del base de 2B; no se confirma en la informacion disponible.
- Opciones de despliegue: el codigo de referencia usa `eval/eval_vlm.py` del repositorio DrawVLA (rama `cs707`) con PEFT sobre Qwen3-VL-2B-Instruct; no se documentan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DrawVerify adapters | LoRA sobre base de 2B | No disponible | Validacion de instrucciones bosquejadas | Apache 2.0 | Hugging Face (`shibuina/drawverify-adapters`) |
| Qwen3-VL-2B-Instruct (base) | 2B | No disponible en esta ficha | VLM generalista | No disponible en esta ficha | Hugging Face (`Qwen/Qwen3-VL-2B-Instruct`) |
| DrawVLA (politica de control) | No disponible | No disponible | Ejecucion de instrucciones bosquejadas | No disponible | GitHub (`shibuina/DrawVLA`, rama `cs707`) |

No se dispone de datos de benchmarks de modelos alternativos de validacion de instrucciones en la informacion proporcionada; la comparativa se limita al base y al sistema del que forma parte.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en escenas LIBERO; el rendimiento fuera de ese dominio no esta caracterizado.
- Las etiquetas del test humano provienen de un unico anotador, lo que limita la fiabilidad de la metrica de bocetos humanos.
- La regla de "pick with arrow" se fijo mientras se examinaba el conjunto de test, lo que introduce riesgo de sobreajuste a ese conjunto segun admite el propio autor.
- Un sistema desplegado deberia mantener un paso de confirmacion humana; el adaptador no esta pensado como decision final autonoma.
- No se documentan sesgos especificos, cobertura multilingue ni comportamiento ante captions en idiomas distintos del usado en entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL-2B-Instruct tiene sus propias condiciones que deben verificarse por separado.
- Riesgo de alucinacion no evaluado en la informacion disponible; al ser un clasificador con prefijo forzado, el modo de fallo relevante es la calibracion del score P(wrong), no la generacion libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shibuina/drawverify-adapters
- Dataset de validacion de prompts: https://huggingface.co/datasets/shibuina/drawvla-prompt-validation-taskblind
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Codigo DrawVLA (rama `cs707`): https://github.com/shibuina/DrawVLA
- Fuente del informe CS707: https://github.com/shibuina/CS707-Project
