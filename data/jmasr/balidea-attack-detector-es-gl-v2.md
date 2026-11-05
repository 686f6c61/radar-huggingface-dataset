# JMasr/balidea-attack-detector-es-gl-v2

## Resumen

balidea-attack-detector-es-gl-v2 es un clasificador de texto binario especializado en la deteccion de intentos de ataque (prompt injection, jailbreak y otras tecnicas de manipulacion) dirigido a trafico de chatbots clinicos en espanol y gallego. Lo desarrolla el usuario JMasr y constituye un fine-tune completo (no LoRA) sobre `FacebookAI/xlm-roberta-base`, un transformer encoder de 278 millones de parametros con arquitectura XLM-RoBERTa.

El modelo forma parte del rebuild v2 de la familia de salvaguardas "balidea safeguard" y sustituye a la version v1, ya deprecada. Su funcion dentro de un stack de seguridad es actuar como una capa de defensa en profundidad: clasifica cada mensaje del usuario como negativo (pasa) o positivo (se marca como ataque) antes de que llegue al LLM principal, aplicando una temperatura de calibracion de 1.8357 y un umbral de decision de 0.83.

Es relevante porque aborda un problema concreto y poco cubierto en la literatura abierta: la moderacion de seguridad en entornos clinicos hispanohablantes, donde los ataques pueden intentar extraer informacion sensible o desviar al asistente de sus funciones. Su licencia Apache 2.0 y su publicacion en safetensors y ONNX facilitan la integracion en pipelines de produccion, aunque las advertencias del propio autor sobre la validacion exigen cautela antes de un despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) para clasificacion de secuencias |
| Parametros totales | 278.045.186 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de entrenamiento e inferencia) |
| Tipos de cuantizacion | No disponible (el repo incluye safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Espanol (es) y gallego (gl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `FacebookAI/xlm-roberta-base`, un transformer encoder multilingue basado en RoBERTa con vocabulario SentencePiece. La cabeza de clasificacion es de dos etiquetas (0 = negativo/pasa, 1 = positivo/flag). No se empleo LoRA ni focal loss; la receta es la "known-good XLM-R recipe" con early stopping.

Los hiperparametros de entrenamiento fueron: techo de 4 epocas con early stopping (paciencia 2, metrica `eval_loss`), learning rate 3e-05, weight decay 0.01, warmup ratio 0.06, batch size 16, max length 256 y semilla 20260526. El split de entrenamiento contenia 5169 filas (3866 negativas, 1303 positivas) con la siguiente composicion por fuente: `balidea_malign` (1872), `prod_medical_queries` (1106), `chitchat` (1086), `snomed_clinical` (849), `ods` (161) y `author_seeds` (95). La calibracion de temperatura (Guo et al. 2017) se realizo sobre el split de validacion, obteniendo recall 0.9223 y tasa de falsos positivos 0.00375, con temperatura 1.8357 y umbral 0.83.

## Capacidades

- Clasificacion binaria de texto: distingue mensajes legitimos de intentos de ataque (prompt injection, jailbreak, manipulacion).
- Deteccion especifica de ataques en espanol y gallego, orientada a dominios clinicos.
- Salida probabilistica calibrada (softmax con temperatura) que permite ajustar el punto de operacion segun el umbral.
- Integracion sencilla via `transformers` (`AutoModelForSequenceClassification`) o runtime ONNX.
- Capacidad de screening previo a un LLM: pensado como capa de filtrado en un stack de defensa en profundidad.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento extendido; es un clasificador puro.

## Casos de uso

- Filtrado previo de mensajes en un chatbot clinico: cada mensaje del usuario se clasifica antes de llegar al LLM; si la probabilidad calibrada supera 0.83, se marca como ataque y se activa una respuesta de rechazo o derivacion a revision humana.
- Moderacion de prompt injection en asistentes sanitarios: detecta intentos de forzar al modelo a ignorar sus instrucciones o revelar informacion interna, algo critico en entornos con datos de pacientes.
- Deteccion de jailbreaks en espanol y gallego: cubre dos idiomas con recursos limitados en el ambito de seguridad, donde la mayoria de clasificadores estan entrenados solo en ingles.
- Capa de defensa en profundidad: se combina con otras salvaguardas (filtros de salida, reglas de negocio) para reducir el riesgo de que un ataque llegue a produccion.
- Monitorizacion y auditoria de trafico: el modelo puede etiquetar grandes volumenes de mensajes para analizar patrones de ataque y ajustar el umbral segun la tasa de falsos positivos observada.
- Screening en pipelines de datos clinicos: clasificar consultas medicas frente a consultas maliciosas en conjuntos de entrenamiento o evaluacion, ayudando a curar datasets de forma automatica.
- Despliegue en entornos con requisitos de latencia baja: al ser un encoder de 278M con contexto de 256 tokens, puede ejecutarse en CPU o GPU modesta mediante ONNX, adecuado para pre-filtrado en tiempo real.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el gold-test retenido (n = 60: 18 positivos, 42 negativos), correspondiente a una porcion del conjunto `.ods` no vista en entrenamiento.

| Punto de operacion | Recall | Falsos positivos | ROC-AUC | Aceptacion |
|---|---|---|---|---|
| Enviado (umbral 0.830, calibrado en val) | 0.8333 | 0.0 | 0.9987 | No superada |
| Recalibrado en gold (umbral 0.92) | 0.75 | 0.0 | No disponible | No superada |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que se trata de un clasificador de seguridad y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32 (safetensors): aproximadamente 1,1 GB para los 278M parametros, mas overhead de activaciones y tokenizador; en la practica, entre 1,5 y 2 GB.
- En FP16: alrededor de 0,6 GB de pesos, con un consumo total tipico inferior a 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es pequeno y no aprovecha GPUs de gama alta.
- Cabe en GPUs de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para lotes pequenos.
- Opciones de despliegue: `transformers` con PyTorch, runtime ONNX (pesos ONNX incluidos en el repo), y servidores de inferencia como TGI o vLLM (aunque para un encoder de este tamano un servidor ligero con ONNX Runtime o FastAPI suele ser mas eficiente).
- Latencia y throughput: no se han publicado mediciones en la informacion disponible. Con contexto de 256 tokens y 278M de parametros, se espera latencia de milisegundos por lote en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| balidea-attack-detector-es-gl-v2 | 278M | 256 | es, gl | Apache 2.0 | Clasificador de ataques en dominio clinico |
| Llama Guard 3 (Meta) | 8B | 128k | Multiples (incluye es) | Llama 3 Community License | Clasificador generativo de seguridad |
| ShieldGemma (Google) | 2B / 9B / 27B | 8k | Ingles principalmente | Gemma Terms of Use | Clasificador generativo de contenido |
| Prompt Guard (Meta) | 86M / 22M | 512 | Multiples | Llama 3 Community License | Detector de prompt injection y jailbreak |

La comparativa con modelos de la familia Llama Guard o ShieldGemma no es directa: aquellos son modelos generativos de gran tamano que evaluan contenido de forma mas general, mientras que este modelo es un encoder pequeno y especializado en ataques para un dominio y dos idiomas concretos. Frente a Prompt Guard, el enfoque es similar (clasificador de inyeccion), pero este ultimo esta entrenado principalmente en ingles y con una licencia mas restrictiva. No se dispone de datos de rendimiento comparativos publicados en la informacion disponible.

## Limitaciones y advertencias

- Advertencia de validacion critica: el modelo se entreno con "gold-in-train"; aproximadamente 161 filas del conjunto de aceptacion `.ods` de produccion estan en el split de entrenamiento. Por ello, la comprobacion estandar contra el `.ods` completo no es una validacion limpia y fue omitida en la subida. Solo se valido sobre el 20% retenido de gold-test.
- El conjunto `.ods` es un set curado de 886 prompts, no trafico de produccion real; los numeros publicados deben tratarse como proxy y confirmarse sobre trafico real antes de confiar en el modelo.
- El modelo no supero la puerta de aceptacion en ningun punto de operacion evaluado (recall 0.8333 con umbral 0.83; recall 0.75 con umbral 0.92), lo que sugiere un rendimiento insuficiente para un despliegue sin ajustes adicionales.
- Sesgos conocidos: no se documentan en la informacion disponible, pero al entrenarse sobre datos clinicos y de chitchat podria presentar sesgos hacia vocabulario o estilos concretos de esos dominios.
- Riesgo de alucinacion: no aplica directamente al ser un clasificador, pero existe riesgo de falsos negativos (ataques no detectados) y falsos positivos (mensajes legitimos bloqueados), especialmente en dominios distintos al clinico.
- Limitacion de idioma: solo espanol y gallego; no debe usarse con otros idiomas.
- Limitacion de dominio: no esta pensado para decisiones autonomas sobre personas, triaje de crisis sin revision humana, ni dominios no clinicos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y recomienda monitorizar recall y falsos positivos tras el despliegue.
- El wrapper interno `safeguard.inference` no es publico; con `transformers` es necesario aplicar manualmente la temperatura y el umbral.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JMasr/balidea-attack-detector-es-gl-v2
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Referencia de calibracion de temperatura (Guo et al. 2017): no disponible en la informacion proporcionada
- Repositorio del proyecto, paper o demo: no disponible en la informacion proporcionada
