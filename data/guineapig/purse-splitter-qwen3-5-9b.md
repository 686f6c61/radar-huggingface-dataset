# guineapig/purse-splitter-qwen3.5-9b

## Resumen

PURSE splitter (Qwen3.5 9B) es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.5-9B, desarrollado por el autor guineapig en el contexto del proyecto HASHIRU. Su proposito es muy concreto: dado un proyecto con un presupuesto en dolares, un conjunto de seis opciones de ejecucion (tres modelos en la nube y tres agentes externos con sus precios) y una tabla de tasas de exito y coste medio por intento, el modelo emite un unico objeto JSON que asigna a cada uno de los ocho trabajos del proyecto una opcion o la marca de omision ("skip"). No es un asistente general, sino un componente de investigacion para la asignacion de presupuesto en pipelines multi-agente.

El modelo parte de una arquitectura Qwen3.5 con torre de vision (pipeline image-text-to-text), 9.409.813.744 parametros totales y pesos en bfloat16 de aproximadamente 18,8 GB. La innovacion no esta en la arquitectura, sino en el objetivo de entrenamiento: el modelo aprende a imitar la particion que produce un solver de mochila (knapsack) sobre los mismos numeros, incorporando ademas el coste de su propia respuesta (cerca del 8% del presupuesto) en el objetivo.

Su relevancia es acotada pero clara: demuestra que un modelo de 9B puede aprender las particiones de un solver heuristico cuando necesita leer el texto de los trabajos, algo que el solver no hace. En los 20 proyectos de prueba no vistos, el modelo alcanza entre 0,663 y 0,879 de puntuacion segun el presupuesto, frente a 0,513-0,661 del modelo base sin entrenar y 0,715-0,902 del solver gratuito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con torre de vision (image-text-to-text); ajuste LoRA sobre las proyecciones de atencion y MLP del modelo de lenguaje |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 16384` y el entrenamiento limita a 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (la model card esta en ingles; el prompt de entrada sigue el formato PURSE) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado en la raiz, ~18,8 GB en bfloat16; adaptador LoRA en `adapter/`, ~112 MB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B (revision c2022362), un transformer con torre de vision que se conserva en el checkpoint publicado. El ajuste es un LoRA de rango 16, alpha 32 y dropout 0,05 aplicado a las proyecciones de atencion y MLP del modelo de lenguaje; la perdida se calcula unicamente sobre los tokens de la respuesta. El entrenamiento se hizo con el Trainer de Transformers (no TRL), una epoca (188 pasos), 16 ejemplos por paso, learning rate 1e-4 con 6 pasos de calentamiento, longitud maxima de ejemplo 4.096 tokens y semilla 2026. La perdida de entrenamiento bajo de 0,137 a aproximadamente 0,02, y la de validacion cerro en 0,020. Todo el proceso consumio una NVIDIA H100 de 80 GB durante unos 33 minutos, con transformers 5.20.2, peft 0.21.2, torch 2.14.0 (CUDA 13.0) y flash-linear-attention 0.6.0; la evaluacion se hizo con vLLM 0.33.0.

Los datos proceden de la segunda ronda del benchmark PURSE: 3.000 prompts de entrenamiento y 200 de validacion, construidos a partir de proyectos que no comparten ningun trabajo con los 20 proyectos de prueba. Cada prompt incluye presupuesto, opciones con precios, tabla de exito y coste por familia de trabajo y nivel, y ocho trabajos con su familia, nivel, valor en puntos y los primeros 160 caracteres de su texto. El objetivo es la particion del solver de mochila sobre el presupuesto menos el coste estimado de la respuesta (unos 1.600 tokens), con presupuestos de 0,25, 0,5, 1 y 2 veces el coste de la ejecucion completa optima. La plantilla de chat se usa con el modo de razonamiento (thinking) desactivado.

## Capacidades

- Generacion de un unico objeto JSON con la asignacion de ocho trabajos a opciones o a "skip", en el formato exacto de PURSE.
- Lectura del texto de cada trabajo (primeros 160 caracteres) para decidir la asignacion, algo que el solver de mochila no hace.
- Razonamiento numerico implicito sobre presupuesto, precios, tasas de exito y costes medios por intento.
- Ajuste fino de la decision al coste de su propia respuesta, que se descuenta del presupuesto antes de repartir.
- Concordancia del 92% con las particiones del solver de mochila en los trabajos evaluados.
- No soporta tool calling ni function calling de forma nativa para este uso; la salida es texto JSON.
- No esta disenado para razonamiento multi-paso ni para uso como agente general.
- Capacidades multilingues: no disponibles; el formato de prompt es especifico de PURSE.
- Modo thinking desactivado obligatoriamente: con thinking activado, el modelo base sin entrenar no terminaba dentro de 8.192 tokens a temperatura 0.

## Casos de uso

- Asignacion de presupuesto en pipelines multi-agente: el modelo recibe el proyecto completo en un unico mensaje de usuario y devuelve el JSON de reparto; es adecuado cuando el orquestador necesita leer el texto de los trabajos para decidir, algo que el solver heuristico no puede hacer.
- Investigacion sobre imitacion de heuristicas: sirve como caso de estudio de destilacion de un solver de mochila en un modelo de 9B, con metricas publicadas de brecha frente al solver (0,02-0,05 puntos).
- Evaluacion de benchmarks de asignacion de recursos: se puede integrar como linea base o como comparador en experimentos que midan la calidad de particiones bajo distintos presupuestos (τ 0,25 a τ 2).
- Enrutado de tareas a modelos en la nube frente a agentes externos: el modelo aprende a elegir entre tres modelos y tres agentes segun su coste y tasa de exito medidos, lo que lo hace util en entornos con catalogo de opciones fijo.
- Prototipado de sistemas de presupuesto dinamico: con el adaptador LoRA (112 MB) se puede experimentar sobre el modelo base sin desplegar los 18,8 GB fusionados, usando PEFT y Transformers.
- Docencia y reproduccion de experimentos: el codigo de construccion de prompts y objetivos esta en el repositorio HASHIRU (`bench/purse/splitter.py` y `bench/lambda/`), lo que permite reproducir el entrenamiento en una sola H100 en unos 33 minutos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 20 proyectos no vistos, cada uno con cuatro presupuestos. La puntuacion es la proporcion de puntos obtenidos (cada trabajo ponderado por su valor), promediada sobre tres repeticiones de los resultados almacenados. τ es el presupuesto como multiplo del coste de la ejecucion completa optima.

| Splitter | τ 0,25 | τ 0,5 | τ 1 | τ 2 |
|---|---|---|---|---|
| Solver de mochila (gratuito, no lee el texto de los trabajos) | 0,715 | 0,788 | 0,842 | 0,902 |
| **Este modelo** | **0,663** | **0,750** | **0,820** | **0,879** |
| Qwen3.5 9B sin entrenar, thinking off | 0,513 | 0,578 | 0,660 | 0,661 |
| Qwen3.5 9B sin entrenar, thinking on | 0 | 0 | 0 | 0 |
| Particion de gpt-6-luna | | 0,695 | | |

El entrenamiento aporta entre 0,15 y 0,22 puntos sobre el mismo modelo sin entrenar; los intervalos de confianza al 95% sobre los 20 proyectos excluyen el cero en todos los presupuestos. El modelo sigue perdiendo frente al solver gratuito por 0,02 a 0,05 puntos, en parte porque paga su propia respuesta (cerca del 8% del presupuesto) y en el mejor caso solo puede copiar al solver. Frente a la particion de gpt-6-luna en τ 0,5 la mejora es de 0,056, pero el intervalo incluye el cero (-0,031 a +0,131). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint fusionado en bfloat16 ocupa unos 18,8 GB, por lo que se necesitan al menos 20-24 GB de VRAM para servirlo sin cuantizar; el adaptador LoRA solo ocupa unos 112 MB adicionales sobre el modelo base.
- GPU recomendadas: NVIDIA H100 80 GB para entrenamiento (33 minutos) y para servir con vLLM; A100 40/80 GB y L40S son adecuadas para inferencia en bfloat16.
- GPU de consumo: cabe en tarjetas con 24 GB o mas (RTX 3090, RTX 4090) si se sirve el modelo fusionado en bfloat16 con atencion eficiente; no hay datos publicados de cuantizaciones GGUF o AWQ para este checkpoint.
- Opciones de despliegue: vLLM es la via recomendada por el autor (`vllm serve guineapig/purse-splitter-qwen3.5-9b --reasoning-parser qwen3 --language-model-only --max-model-len 16384`); tambien se puede cargar el adaptador con PEFT y Transformers (`AutoModelForImageTextToText` + `PeftModel.from_pretrained`). No se documentan despliegues con llama.cpp, Ollama ni TGI.
- Nota de despliegue: el checkpoint conserva la torre de vision de Qwen3.5, por lo que con vLLM hay que servir solo el modelo de lenguaje con `--language-model-only`.
- Latencia y throughput: no disponibles en la informacion proporcionada; la generacion esta limitada a `max_tokens=512` y temperatura 0 en el ejemplo del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntuacion PURSE (τ 0,5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PURSE splitter (este modelo) | 9,41 B | no disponible (ejemplo a 16.384) | 0,750 | Apache 2.0 | HuggingFace, safetensors + adaptador LoRA |
| Qwen3.5 9B sin entrenar (thinking off) | 9,41 B | no disponible | 0,578 | Apache 2.0 (modelo base) | HuggingFace |
| Solver de mochila de PURSE | no aplica (heuristica) | no aplica | 0,788 | codigo abierto en HASHIRU | Repositorio GitHub |
| Particion de gpt-6-luna | no disponible | no disponible | 0,695 | propietaria | servicio en la nube |

La comparacion con alternativas de proposito general no es significativa: el modelo solo es comparable con el solver heuristico, el modelo base y el enrutador propietario evaluado en el mismo benchmark. No se dispone de datos de otros modelos de 9B en la tarea PURSE.

## Limitaciones y advertencias

- El modelo aprendio un unico mercado: seis opciones concretas, sus precios y cuatro familias de trabajo (aritmetica, rejillas, agregacion y cadenas) en niveles 1 a 5. Con otras opciones, precios o familias necesitara reentrenamiento.
- Todos los proyectos de entrenamiento tienen exactamente ocho trabajos; no se ha validado con otro numero de trabajos.
- Los objetivos de entrenamiento descuentan el coste de la respuesta con una estimacion aproximada de 1.600 tokens, pero los prompts reales rondan los 3.200 tokens, por lo que los objetivos subestiman ligeramente el coste real de la respuesta.
- Riesgo de alucinacion en la salida JSON: el modelo puede emitir claves de trabajo u opciones que no existan en el prompt; el autor no documenta validacion estructural de la salida.
- No es un asistente general: no debe usarse para conversacion abierta, generacion de codigo ni tareas fuera de la asignacion de presupuesto.
- El modo thinking debe permanecer desactivado; con thinking activado el modelo base no terminaba en 8.192 tokens a temperatura 0.
- Licencia Apache 2.0, que permite uso comercial, pero el propio autor recomienda usar el solver gratuito salvo que se necesite leer el texto de los trabajos.
- No hay informacion sobre sesgos demograficos, linguisticos o culturales, ni sobre idiomas soportados distintos del formato de prompt en ingles.
- El modelo pierde frente al solver heuristico en todos los presupuestos evaluados; su ventaja es cualitativa (lectura del texto), no de puntuacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guineapig/purse-splitter-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio HASHIRU: https://github.com/HASHIRU-AI/HASHIRU
- Sitio del proyecto HASHIRU: https://hashiru-ai.github.io/hashiru-website
- Codigo del splitter PURSE: https://github.com/HASHIRU-AI/HASHIRU/blob/feature/whitepaper/bench/purse/splitter.py
- Scripts de construccion de datos: https://github.com/HASHIRU-AI/HASHIRU/tree/feature/whitepaper/bench/lambda
