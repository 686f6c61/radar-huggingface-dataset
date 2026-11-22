# plantwaterer/liquamen

## Resumen

liquamen es un ajuste fino (fine-tune) de google/gemma-4-31B-it, desarrollado por el usuario plantwaterer, orientado especificamente a la toma de decisiones mediante preguntas de opcion multiple. A diferencia de un modelo conversacional generico, liquamen no devuelve texto libre: devuelve una distribucion de probabilidad calibrada sobre cada opcion disponible, lo que lo convierte en una herramienta para sistemas que necesitan elegir entre alternativas de forma cuantificable.

El modelo parte de la arquitectura Gemma 4 de 31B parametros (31.273.088.876 parametros segun los pesos en safetensors) y anade una cabeza de ultima capa calibrada (`vbll_head.safetensors`) cuyo resultado constituye la respuesta del modelo. Para preguntas de opcion multiple, la salida es el softmax de los logits de las letras de las opciones en la posicion de respuesta, dividido por una temperatura ajustada (T = 1.085). Para preguntas de si/no, se aplica un residual bayesiano de ultima capa (posterior de Laplace) sobre el estado oculto del modelo que ajusta los dos logits.

Su relevancia actual radica en que propone un patron de inferencia distinto al de los LLM generativos: en lugar de generar texto y parsearlo, expone directamente probabilidades calibradas y promedia sobre ordenes de opciones para mitigar el sesgo posicional. El repositorio incluye varios motores de inferencia del kit Decision Index, y el modelo exige una funcion de atencion especifica (`jev_mem`) que no es la atencion causal estandar de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 4 (capas de atencion completa no causales y capas de ventana deslizante causal de 1.024 tokens) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana deslizante de 1.024 tokens en las capas sliding-window) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model-*.safetensors`, `vbll_head.safetensors`) |
| Modelo base | google/gemma-4-31B-it |
| Libreria | transformers |
| Tamano del repo | 62,6 GB |
| Precision de inferencia | bf16 en GPU; cabeza en CPU en float64 |

## Arquitectura y entrenamiento

liquamen se construye sobre google/gemma-4-31B-it, un transformer de 31B parametros. La modificacion estructural clave respecto al modelo base es el regimen de atencion: en las capas de atencion completa, cada token del prompt atiende a todos los tokens del mismo prompt (atencion no causal dentro del prompt), mientras que las capas de ventana deslizante permanecen causales con ventana de 1.024 tokens. Esta atencion se implementa mediante la funcion `jev_mem` en `fullft_mem.py`, que se registra en la interfaz de atencion de transformers y se ejecuta sobre PyTorch SDPA (kernels memory-efficient y flash). El motor de inferencia rechaza cualquier otra funcion de atencion, ya que la atencion causal estandar de transformers produciria respuestas distintas.

Sobre el modelo se anade una cabeza de ultima capa calibrada (`vbll_head.safetensors` y `vbll_head.json`) que transforma el estado oculto final y los logits de las letras de las opciones en probabilidades. El entrenamiento se realizo como un fine-tune completo (los ficheros se denominan `fullft_mem.py`), aunque no se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica destacable es el esquema de lectura: para preguntas de opcion multiple se aplica softmax con temperatura ajustada (T = 1.085); para preguntas de si/no se integra un posterior de Laplace sobre el estado oculto que corrige los dos logits. Ademas, los motores de mayor nivel aplican promediado sobre ordenes de opciones (desplazamientos ciclicos tipo cuadrado latino para K >= 5) para reducir el sesgo posicional.

## Capacidades

- Toma de decisiones mediante preguntas de opcion multiple, devolviendo una probabilidad calibrada por opcion en lugar de texto generado.
- Preguntas de si/no con correccion bayesiana de ultima capa sobre los dos logits.
- Soporte de multiples preguntas en una misma peticion, cada una con su propio tipo (`choice` o `noul`/si-no) e instrucciones.
- Definicion de criterios por opcion en preguntas de si/no (formato `Yes: <definicion>` / `No: <definicion>`).
- Manejo de conjuntos de opciones de 5 a 52 alternativas con promediado de ordenes mediante desplazamientos ciclicos.
- Procesamiento de entradas de imagen y texto segun el tag `image-text-to-text` heredado del modelo base (no se detalla el uso en la model card).
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa; el modelo esta disenado como componente de decision puntual.

## Casos de uso

- Sistemas de decision automatizada con umbrales de confianza: gracias a que devuelve probabilidades calibradas por opcion, se puede fijar un umbral (por ejemplo, 0,9) y derivar a revision humana cuando la confianza sea menor, algo que un LLM generativo no ofrece de forma directa.
- Enrutamiento de tickets o solicitudes: dado un texto de entrada y un conjunto de categorias (de 5 a 52), el modelo asigna probabilidad a cada una; el promediado sobre ordenes de opciones reduce el sesgo hacia las primeras letras del alfabeto.
- Evaluacion de politicas o escenarios con preguntas de si/no: por ejemplo, decidir si una accion cumple una politica de cumplimiento, usando la correccion bayesiana para obtener una probabilidad mas fiable que un simple logit.
- Encuestas y anotacion asistida: el modelo puede predecir la opcion mas probable de un cuestionario y proporcionar la distribucion completa, util para priorizar revisiones en pipelines de etiquetado.
- Toma de decisiones operativas con contexto corto: el motor de un solo paso (`dikit_engine`) permite clasificar rapidamente cuando la latencia importa, mientras que los motores con promediado se reservan para peticiones con `L_raw <= 939` o una unica pregunta con texto renderizado de hasta 6.000 caracteres.
- Seleccion entre alternativas en juegos o simulaciones: el ejemplo de la model card (decidir si jugar, mover el partido al interior o posponerlo segun la probabilidad de lluvia) ilustra el uso como modulo de decision dentro de un agente mayor.
- Analisis de sensibilidad al orden de opciones: al exponer distintos motores (con y sin promediado), permite comparar la estabilidad de las predicciones frente a la permutacion de alternativas, util en auditoria de modelos de decision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31.273.088.876 parametros, en bf16 los pesos ocupan aproximadamente 62,6 GB, por lo que se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB) para cargar el modelo completo en una sola tarjeta.
- GPU recomendadas: A100 80GB, H100 80GB o configuraciones multi-GPU con paralelismo de tensor. No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bf16.
- La cabeza (`vbll_head.safetensors`) se ejecuta en CPU en float64, por lo que no consume VRAM adicional.
- Opciones de despliegue: el modelo no se sirve con vLLM, TGI ni llama.cpp de forma estandar, ya que requiere la funcion de atencion `jev_mem` y los motores del kit Decision Index. El despliegue se realiza mediante `python -m decision_index run --engine <motor>` con el repositorio descargado y `PYTHONPATH` apuntando a el, o mediante la API en Python instanciando el motor correspondiente.
- Cuantizacion: no se documentan opciones de cuantizacion (GGUF, AWQ, GPTQ) en la informacion disponible; dado el requisito de atencion personalizada, la cuantizacion convencional podria no ser compatible.
- Latencia y throughput: no disponibles. Se sabe que el motor de un solo paso realiza un unico forward pass por pregunta, mientras que los motores con promediado realizan 4 pasadas por pregunta (2 para si/no) cuando se cumple la puerta de longitud.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liquamen | 31,3B | no disponible (ventana deslizante 1.024) | Decision por opcion multiple con probabilidades calibradas | Apache-2.0 | Hugging Face + GitHub (codigo) |
| google/gemma-4-31B-it | 31B (aproximado) | no disponible | LLM instructivo generativo | Terminos de Gemma (no Apache-2.0) | Hugging Face |
| Alternativas de clasificacion por opcion multiple de ~30B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con otros modelos de decision calibrada no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es que liquamen expone probabilidades por opcion y exige una atencion no causal en las capas completas, mientras que gemma-4-31B-it es un modelo generativo de proposito general.

## Limitaciones y advertencias

- El modelo no es un generador de texto libre: las letras de las opciones por si solas no constituyen la respuesta; es imprescindible usar la cabeza calibrada y los motores del kit Decision Index.
- La atencion causal estandar de transformers produce respuestas distintas; el motor rechaza cualquier funcion de atencion que no sea `jev_mem`, lo que limita la integracion con frameworks de serving convencionales.
- El promediado sobre ordenes de opciones solo se aplica cuando `L_raw <= 939` o cuando hay una unica pregunta con texto renderizado de hasta 6.000 caracteres; peticiones mas largas usan una sola pasada y pueden ser mas sensibles al orden de las opciones.
- El soporte de conjuntos de opciones esta acotado a K entre 5 y 52 para el promediado con desplazamientos ciclicos; fuera de ese rango el comportamiento no esta documentado.
- No se detallan los datos de entrenamiento, los idiomas soportados ni los sesgos conocidos, lo que dificulta evaluar su comportamiento fuera del dominio de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de calibracion deficiente en dominios alejados de los datos de ajuste.
- La licencia del modelo es Apache-2.0, pero el modelo base google/gemma-4-31B-it tiene sus propios terminos de uso; conviene verificar que el uso comercial cumple ambas licencias.
- El tag `image-text-to-text` sugiere capacidades multimodales heredadas del modelo base, pero no se documenta como usarlas con la cabeza de decision.
- El repositorio de GitHub (treewaterer/liquamen) solo contiene codigo y la model card; los pesos estan en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/liquamen
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio GitHub (codigo y model card): https://github.com/treewaterer/liquamen
- Kit Decision Index: https://github.com/apolinario/decision-index
- Commit del kit usado en las instrucciones: https://github.com/apolinario/decision-index@9eb2dbe2a358004c8782c66e40a83ac07b953fec
