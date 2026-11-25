# plantwaterer/liquamen

## Resumen

liquamen es un ajuste fino (fine-tune) de google/gemma-4-31B-it, desarrollado por el usuario plantwaterer, orientado especificamente a la toma de decisiones mediante preguntas de opcion multiple. A diferencia de un modelo de chat convencional, liquamen no devuelve texto libre: para cada pregunta genera una distribucion de probabilidad sobre las opciones disponibles, de modo que la respuesta del modelo es directamente una probabilidad calibrada por opcion. Esto lo convierte en una pieza utilizable dentro de sistemas de decision automatizados, donde se necesita una salida numerica y comparable en lugar de una frase.

El modelo parte de la arquitectura Gemma 4 de 31B parametros en su variante instruction-tuned, y se ha construido mediante un merge de tres modelos: el citado gemma-4-31B-it y dos modelos del mismo autor (allec y oenogarum). Incorpora una cabeza de salida calibrada de ultima capa (vbll_head) cuyo resultado constituye la respuesta del modelo, junto con un mecanismo de atencion no estandar que se sirve mediante una funcion de atencion propia (jev_mem). El repositorio ocupa 62,6 GB e incluye pesos en safetensors y codigo de inferencia.

Su relevancia actual radica en que aborda un nicho poco cubierto: modelos que emiten probabilidades calibradas para decisiones con opciones discretas, con correccion bayesiana para preguntas de si/no y promediado sobre ordenaciones de opciones para mitigar el sesgo posicional. La licencia Apache-2.0 facilita su uso comercial, aunque la dependencia de un kit de inferencia externo (Decision Index) y de una atencion personalizada anade complejidad operativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), con capas de atencion completa y capas de ventana deslizante causal (ventana 1.024) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana deslizante de 1.024 en las capas de sliding-window; la longitud total de contexto no se especifica) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; la inferencia descrita usa bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model-*.safetensors y vbll_head.safetensors) |

## Arquitectura y entrenamiento

liquamen se construye sobre google/gemma-4-31B-it, un transformer de 31B parametros. El modelo combina capas de atencion completa con capas de ventana deslizante causal de 1.024 tokens. Un aspecto tecnico destacable es que, en las capas de atencion completa, cada prompt permite que todos sus tokens atiendan a todos los tokens del mismo prompt (atencion no causal dentro del prompt), mientras que las capas de ventana deslizante permanecen causales. Esto se implementa mediante la funcion de atencion `jev_mem` del fichero `fullft_mem.py`, que se registra en la interfaz de atencion de transformers y se ejecuta sobre PyTorch SDPA (kernels memory-efficient y flash). El motor de inferencia rechaza cualquier otra funcion de atencion, ya que la atencion estandar de transformers produciria respuestas distintas.

El modelo es un merge de tres checkpoints: google/gemma-4-31B-it, plantwaterer/allec y plantwaterer/oenogarum. Sobre esa base se anade una cabeza calibrada de ultima capa (`vbll_head.safetensors`, con metadatos en `vbll_head.json`). Para preguntas de opcion multiple ordinarias, la salida es el softmax de los logits de las letras de las opciones en la posicion de respuesta, dividido por una temperatura ajustada (T = 1.085), sin intervencion de posterior. Para preguntas de si/no, se aplica un residual bayesiano de ultima capa sobre el estado oculto del modelo (un posterior de Laplace, integrado) que ajusta los dos logits. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Toma de decisiones con opcion multiple: devuelve una probabilidad calibrada para cada opcion (de A a Z y de a a z), no texto libre.
- Preguntas de si/no con correccion bayesiana: aplica un posterior de Laplace sobre el estado oculto para ajustar los logits de "Yes" y "No".
- Promediado sobre ordenaciones de opciones: para peticiones con longitud bruta L_raw <= 939 o con una unica pregunta de longitud renderizada <= 6.000, evalua cada pregunta en 4 ordenaciones de opciones (2 en si/no) y promedia; para conjuntos de 5 a 52 opciones usa desplazamientos ciclicos tipo cuadrado latino.
- Definiciones de criterios: las preguntas de si/no pueden incluir definiciones de "Yes" y "No" mediante el campo `criteria`.
- Procesamiento de multiples preguntas por peticion: el motor recibe un diccionario de preguntas con tipos `choice` y `noul` (si/no).
- Entrada de imagen y texto: la etiqueta image-text-to-text del modelo base sugiere soporte multimodal, aunque la model card no detalla su uso en este fine-tune.
- Integracion con el kit Decision Index: cinco motores de inferencia distintos con el mismo peso y cabeza.

## Casos de uso

- Sistemas de decision automatizada con opciones discretas: el modelo recibe una pregunta con criterios y devuelve una distribucion de probabilidad sobre las opciones, lo que permite umbrales de confianza y seleccion de la opcion mas probable en pipelines de decision.
- Triage y clasificacion operativa: ante una situacion descrita en texto (por ejemplo, condiciones meteorologicas y un evento), el modelo puntua opciones como "jugar", "mover a interior" o "posponer", con probabilidades comparables entre casos.
- Encuestas y anotacion asistida: dado un enunciado y un conjunto de opciones (hasta 52), el modelo asigna probabilidades que pueden usarse para preanotar respuestas o detectar casos ambiguos por baja confianza.
- Verificacion de hipotesis binarias: para preguntas de si/no con definiciones explicitas, la correccion bayesiana proporciona probabilidades calibradas utiles en validacion de afirmaciones o comprobaciones de consistencia.
- Evaluacion de modelos y benchmarking: la salida probabilistica permite calcular metricas de calibracion (log-loss, Brier) y comparar decisiones entre modelos sobre el mismo conjunto de preguntas.
- Enrutamiento dentro de agentes: un agente puede consultar a liquamen para elegir entre acciones discretas (herramientas, rutas, politicas) y usar la probabilidad como senal para decidir si actua o escala a un humano.
- Analisis de sensibilidad al orden de opciones: el promediado sobre ordenaciones permite estudiar y mitigar el sesgo posicional en tareas de eleccion multiple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 31.273.088.876 parametros, en bf16 los pesos ocupan aproximadamente 62,5 GB, por lo que se necesita al menos una GPU de 80 GB para una sola pasada en bf16 sin tecnicas de reparto.
- GPU recomendadas: A100 80 GB o H100 80 GB para inferencia en bf16; configuraciones multi-GPU para mayor comodidad.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090) en bf16; requeriria cuantizacion, para la cual no se detallan formatos soportados en la informacion disponible.
- Opciones de despliegue: el modelo se sirve a traves del kit Decision Index (`decision_index run`) con los motores incluidos; requiere PyTorch SDPA y la funcion de atencion `jev_mem`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Cabe senalar que el motor `lenavg_bayes_balanced_k5_engine` realiza 4 pasadas por pregunta (2 en si/no) cuando se cumple la condicion de longitud, y que la cabeza se ejecuta en CPU en float64, lo que anade coste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liquamen | 31.273.088.876 | no disponible (sliding window 1.024) | Probabilidades calibradas por opcion | Apache-2.0 | Hugging Face + GitHub |
| google/gemma-4-31B-it | no disponible en la informacion | no disponible | Texto generativo | no disponible en la informacion | Hugging Face |
| plantwaterer/allec | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| plantwaterer/oenogarum | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La atencion no estandar es obligatoria: usar la atencion causal por defecto de transformers produce respuestas distintas; el motor rechaza cualquier otra funcion de atencion.
- La cabeza calibrada es imprescindible: los logits de las letras por si solos no constituyen la respuesta del modelo.
- Dependencia de un kit externo (Decision Index) instalado desde un commit concreto de GitHub, lo que introduce riesgo de mantenimiento y reproducibilidad.
- La cabeza se ejecuta en CPU en float64, lo que puede limitar el throughput en cargas de alta concurrencia.
- El promediado sobre ordenaciones solo se aplica bajo condiciones de longitud (L_raw <= 939 o L_rendered <= 6.000); peticiones mas largas usan una sola pasada y pueden ser mas sensibles al sesgo posicional.
- No se especifican idiomas soportados, sesgos conocidos ni datos de entrenamiento, lo que dificulta evaluar riesgos de alucinacion o cobertura linguistica.
- El modelo esta disenado para eleccion multiple y si/no; no es un generador de texto libre ni un asistente conversacional general.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base Gemma 4 y de los checkpoints fusionados antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/liquamen
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo fusionado: https://huggingface.co/plantwaterer/allec
- Modelo fusionado: https://huggingface.co/plantwaterer/oenogarum
- Repositorio espejo en GitHub: https://github.com/treewaterer/liquamen
- Kit Decision Index: https://github.com/apolinario/decision-index
