# ReefNet/reefnet-minicpm-v-4.5-lora

## Resumen

ReefNet/reefnet-minicpm-v-4.5-lora es un adaptador LoRA (PEFT) sobre el modelo vision-lenguaje openbmb/MiniCPM-V-4_5, ajustado por el proyecto ReefNet para una tarea muy concreta: identificar el genero de coral duro que aparece en el centro de un recorte de imagen de arrecife. El adaptador cubre 39 etiquetas (38 generos mas la familia Fungiidae) y se distribuye como pesos PEFT en formato safetensors, no como modelo completo. Es el modelo reportado en la tabla 5 del articulo ReefNet (NeurIPS 2026, track Evaluations & Datasets).

Su relevancia es doble. Por un lado, es un ejemplo de especializacion de un VLM generico mediante LoRA de rango bajo (rank 8 sobre todas las capas lineales) con un coste de entrenamiento y almacenamiento minimo: el repositorio ocupa 0,1 GB. Por otro, publica cifras de evaluacion exigentes y poco habituales: macro recall del 63,36 % en el conjunto de test dentro de la misma fuente (23.043 recortes, 39 clases) y del 48,09 % en un conjunto externo del Mar Rojo (Al-Wajh, 13 generos, 4.624 recortes), lo que documenta explicitamente la caida de rendimiento por cambio de dominio.

El modelo resuelve una tarea de clasificacion fina cerrada sobre imagenes de 1024x1024 centradas en anotaciones de punto, con salida de una sola palabra. No esta pensado como asistente multimodal general, sino como clasificador especializado invocado a traves de la interfaz conversacional del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo vision-lenguaje image-text-to-text (base: openbmb/MiniCPM-V-4_5, revision c1a6986b) |
| Parametros totales | no disponible (el repositorio contiene unicamente los pesos del adaptador) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador publicado en safetensors; los scripts de referencia cargan el modelo base en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 para el adaptador, sujeto ademas a la licencia del modelo base MiniCPM |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Rango LoRA | 8, aplicado a todas las capas lineales |
| Tarea (pipeline) | image-text-to-text |
| Numero de clases | 39 (38 generos de coral duro + familia Fungiidae) |
| Dataset de entrenamiento | ReefNet/ReefNet-1.0 (445.985 recortes de entrenamiento, 9.999 de validacion) |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft (entrenado con LLaMA-Factory) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre MiniCPM-V 4.5, un modelo multimodal que procesa imagen y texto y que requiere codigo remoto (`trust_remote_code=True`) para su carga. El ajuste es un LoRA de rango 8 sobre todas las capas lineales, entrenado con LLaMA-Factory en el commit 589da21d. La configuracion exacta, recogida en `train_config.yaml`, es: optimizador AdamW, learning rate 5e-5, scheduler coseno, warmup ratio 0,03, precision bf16, batch por dispositivo de 8 sin acumulacion de gradientes, `image_max_pixels` de 1024x1024 y sin aumento de datos. El entorno de software es transformers 4.57.1, peft 0.18.1 y torch 2.9.1.

Los datos provienen de ReefNet-1.0, con recortes de 1024x1024 centrados en cada anotacion de punto; el entrenamiento usa el split de alta confianza (445.985 ejemplos de train y 9.999 de validacion). La seleccion del modelo se hizo con el split de validacion de ReefNet, y el conjunto Al-Wajh se mantiene fuera de entrenamiento, ajuste y seleccion, de modo que la cifra cross-source es una evaluacion honesta de generalizacion. El resultado es un clasificador de conjunto cerrado: el prompt de entrenamiento y test es `What is the genus in the center of the image <image>? Answer with one word`, con decodificacion greedy (`top_k=1`, `max_new_tokens=32`) y normalizacion de la salida (strip y capitalizacion) que debe coincidir exactamente con un genero.

## Capacidades

- Clasificacion fina de genero de coral duro a partir de un recorte de 1024x1024 centrado en el organismo de interes, con 39 clases posibles.
- Salida de una unica palabra (nombre del genero) en lugar de texto libre, lo que facilita su integracion en pipelines automatizados.
- Procesamiento de imagen y texto de forma conjunta (tarea image-text-to-text) heredado del modelo base.
- Interfaz conversacional mediante `model.chat(...)`, con el modelo base cargado por transformers y envuelto con `PeftModel`.
- Soporte de dos prompts documentados, uno para los splits de ReefNet (train, validacion y test) y otro para el conjunto Al-Wajh del Mar Rojo.
- Capacidades de tool calling, agentes, razonamiento multi-paso, matematicas, codigo, vision general, audio o thinking mode: no documentadas para este adaptador en la informacion disponible.

## Casos de uso

- Inventario de biodiversidad en transectos de arrecife: aplicar el adaptador sobre recortes centrados en anotaciones de punto para obtener el genero de cada colonia y calcular composicion taxonomica por transecto, gracias a la coincidencia exacta entre el preprocesado de ReefNet-1.0 (recortes de 1024x1024) y el usado en entrenamiento.
- Pre-etiquetado para anotacion humana: usar el modelo como primer paso de un flujo de etiquetado asistido, donde un anotador revisa o corrige la prediccion de una sola palabra, reduciendo el tiempo por imagen en campanas de gran volumen como las 455.984 muestras del split de entrenamiento.
- Triaje y priorizacion de revision: en un lote de imagenes, enrutar a revision humana aquellas predicciones de baja confianza o poco frecuentes, y aceptar automaticamente las clases con buen rendimiento historico; el modelo entrega la etiqueta ya normalizada, lista para comparar contra un catalogo de generos.
- Monitorizacion temporal de comunidades de coral: procesar series temporales del mismo punto de muestreo y medir cambios en la proporcion de generos, siempre que se respete el mismo protocolo de recorte centrado y se documente el error esperado del clasificador.
- Estudios de generalizacion entre fuentes (domain shift): emplear el adaptador como referencia en experimentos de transferencia, ya que el articulo publica el rendimiento dentro de fuente (63,36 %) y fuera de fuente (48,09 % en Al-Wajh, 13 generos), lo que permite cuantificar la degradacion al cambiar de zona geografica o de condiciones de captura.
- Investigacion en clasificacion fina multimodal: utilizar el adaptador como baseline reproducible en trabajos de reconocimiento fino de arrecifes, con los prompts exactos, la configuracion de decodificacion y los scripts de `predictions/` y `tools/recompute_macro_recall.py` para replicar los numeros.
- Filtrado de imagenes no coralinas: combinado con un detector previo, el clasificador puede descartar o marcar recortes que no correspondan a ninguno de los 39 taxones, siempre con la advertencia de que el modelo tiende a forzar una de sus clases.
- Analisis cross-source en el Mar Rojo: aplicar el prompt especifico de Al-Wajh (`<image>Identify the hard coral genus in this image. Respond with only the genus name.`) sobre imagenes de esa region, asumiendo un recall notablemente inferior al del dominio de entrenamiento.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son de macro recall (balanced accuracy) sobre dos conjuntos de test:

| Conjunto de test | Etiquetas | N.o de recortes | Macro recall (%) |
|---|---|---|---|
| ReefNet (dentro de fuente) | 39 | 23.043 | 63,36 |
| Al-Wajh, Mar Rojo (cross-source) | 13 generos | 4.624 | 48,09 |

Detalles de la metrica: en Al-Wajh la media se calcula sobre los 13 generos presentes (4.624 recortes) mientras el modelo mantiene su salida de 39 clases; una prediccion fuera de esos 13 generos cuenta como error. Los resultados MMLU, HumanEval, GSM8K u otros benchmarks generales no estan disponibles, ya que la tarea del adaptador es de clasificacion cerrada y no de proposito general.

## Requisitos de hardware

- Almacenamiento del adaptador: 0,1 GB en disco en formato safetensors.
- VRAM: no disponible en la informacion proporcionada para el conjunto adaptador mas modelo base. El adaptador por si solo no es ejecutable; requiere cargar MiniCPM-V 4.5 completo.
- Precision de referencia: los scripts indican carga del modelo base en `torch_dtype=torch.bfloat16`.
- Preprocesado: `image_max_pixels` de 1024x1024, por lo que la resolucion de entrada es alta y el coste de vision es mayor que en modelos que trabajan a 224x224 o 336x336.
- Coste de generacion: decodificacion greedy con `max_new_tokens=32`, por lo que la fase de generacion es corta en comparacion con tareas de texto abierto.
- Soporte de despliegue confirmado: transformers (con `trust_remote_code=True`) mas peft, tal y como describe la model card; el repositorio de referencia es reefnet-mllm. Soporte de vLLM, llama.cpp, Ollama o TGI para MiniCPM-V 4.5: no confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponibles.
- GPU recomendadas: no disponibles para este modelo concreto; dependen del tamano y la precision del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Macro recall en ReefNet | Licencia |
|---|---|---|---|---|---|
| reefnet-minicpm-v-4.5-lora | adaptador LoRA rango 8 (base no disponible) | no disponible | Clasificacion de 39 generos de coral duro | 63,36 % (ReefNet), 48,09 % (Al-Wajh) | apache-2.0, mas licencia del modelo base MiniCPM |
| openbmb/MiniCPM-V-4_5 (base sin adaptador) | no disponible | no disponible | Vision-lenguaje general | no disponible (no reportado) | Licencia MiniCPM |
| Otros clasificadores finos de coral | no disponible | no disponible | no disponible | no disponible | no disponible |

En la informacion proporcionada no se incluyen cifras de modelos alternativos de la misma categoria (por ejemplo, otros VLM ajustados sobre ReefNet-1.0 o clasificadores CNN especificos de arrecife) mas alla del propio modelo base sin adaptador. La comparacion cuantitativa con alternativas aparece en el articulo ReefNet (tabla 5), pero sus valores no estan disponibles en los datos facilitados.

## Limitaciones y advertencias

- Conjunto cerrado de 39 clases: el modelo siempre devuelve uno de los generos vistos en entrenamiento, por lo que puede asignar una etiqueta incorrecta a taxones no contemplados o a imagenes que no sean coral.
- Dependencia del recorte centrado: la tarea se define sobre imagenes de 1024x1024 centradas en el organismo; si el coral no esta en el centro, el rendimiento esperado cae de forma no cuantificada en la informacion disponible.
- Caida notable por cambio de dominio: el macro recall pasa de 63,36 % dentro de fuente a 48,09 % en Al-Wajh, una diferencia de mas de 15 puntos que desaconseja su uso directo en zonas o condiciones de captura no representadas.
- Salida restringida y sensible al formato: el resultado debe coincidir de forma exacta con un genero tras normalizar (strip y capitalizacion); cualquier variacion del prompt respecto a las cadenas documentadas puede alterar el comportamiento.
- Riesgo de alucinacion: al estar entrenado para responder con una unica palabra de un catalogo cerrado, no dispone de mecanismo para declarar "no lo se"; en imagenes ambiguas o degradadas producira igualmente una etiqueta.
- Idiomas no especificados en la model card: no hay informacion sobre el soporte multilingue del adaptador ni del modelo base.
- Limitaciones de licencia: el adaptador es apache-2.0, pero su uso esta sujeto tambien a la licencia del modelo base MiniCPM, por lo que conviene revisar ambas antes de un despliegue comercial.
- Requiere codigo remoto: la carga del modelo base usa `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio de openbmb y anade un riesgo de cadena de suministro en entornos de produccion.
- No es un modelo generalista: las capacidades conversacionales, de razonamiento o de generacion de codigo del modelo base no estan validadas tras el ajuste y pueden haberse degradado para otras tareas.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; los sesgos del modelo base y de la distribucion geografica de ReefNet-1.0 (con enfasis en determinadas regiones de arrecife) se trasladan al adaptador.
- Uso previsto acotado: cualquier aplicacion en produccion deberia acompanarse de validacion local en el dominio objetivo y de una revision humana de las predicciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReefNet/reefnet-minicpm-v-4.5-lora
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4_5
- Dataset de entrenamiento: https://huggingface.co/datasets/ReefNet/ReefNet-1.0
- Repositorio de referencia (script de inferencia y herramientas de metrica): https://github.com/ReefNet-Project
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Articulo citado: Felemban et al., "ReefNet: A Large-Scale Dataset and Benchmark for Fine-Grained Coral Reef Recognition", NeurIPS 2026, Evaluations and Datasets Track (sin URL directa en la informacion disponible)
- Las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; los enlaces obtenidos no guardan relacion con el contenido de la ficha.
