# plantwaterer/garum

## Resumen

garum es un adaptador LoRA publicado por el usuario plantwaterer sobre el modelo base google/gemma-4-31B-it. Su funcion no es la generacion de texto libre, sino responder preguntas de decision de opcion multiple devolviendo una probabilidad calibrada para cada opcion. Para ello anade una cabeza bayesiana de ultima capa (VBLL) implementada en garum_head.py, de modo que la salida del modelo no son los logits de las letras de las opciones, sino las probabilidades que esa cabeza calcula a partir del estado oculto del modelo adaptado y de los logits de las letras en la posicion de respuesta.

El modelo resuelve un problema concreto: obtener decisiones con incertidumbre cuantificada en lugar de texto generado. Se integra con el kit Decision Index a traves de garum_engine.py y se puede ejecutar con una peticion compuesta por un estado (por ejemplo, un pronostico meteorologico) y varias preguntas con nombre, cada una con sus opciones o con formato si/no. El repositorio ocupa 1,5 GB y contiene el adaptador y la cabeza en safetensors, ademas del codigo Python necesario para cargarlos.

Es relevante ahora porque propone un patron poco habitual: un adaptador pequeno que se apoya en un modelo base grande para producir distribuciones de probabilidad calibradas y reproducibles, en lugar de respuestas en lenguaje natural. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre google/gemma-4-31B-it, con cabeza bayesiana de ultima capa (VBLL) que combina el estado oculto y los logits de las letras de las opciones |
| Parametros totales | no disponible (el modelo base se denomina 31B; el repositorio del adaptador ocupa 1,5 GB) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 32.768 tokens como limite operativo del motor; las peticiones que no caben se declaran no soportadas |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors (adaptador LoRA y cabeza, con la actualizacion LoRA en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 para el adaptador; el modelo base google/gemma-4-31B-it se rige por su propia licencia y terminos |
| Formato de pesos | safetensors (adapter_model.safetensors y vbll_head.safetensors) |

## Arquitectura y entrenamiento

garum no es un modelo completo, sino un adaptador PEFT de tipo LoRA que se acopla a google/gemma-4-31B-it mediante la clase GarumForDecision, definida en modeling_garum.py junto con garum_core.py y garum_head.py. Esa clase envuelve el modelo base, el adaptador y una cabeza bayesiana de ultima capa. El adaptador se carga con autocast_adapter_dtype=False para que la actualizacion LoRA se mantenga en bf16. La atencion utilizada es la de transformers por defecto (SDPA).

El procedimiento de inferencia descrito en la model card es el siguiente: se construye un prompt por pregunta; las opciones de una pregunta de eleccion se muestran en un orden fijo no identitario derivado de un hash de la peticion; las definiciones de las preguntas si/no se muestran junto a las opciones cuando la peticion las aporta; y se realiza una pasada forward por prompt, en la que la cabeza convierte el estado oculto y los logits de siguiente token de las letras de las opciones en probabilidades. Las preguntas con mas de 52 opciones se resuelven en dos rondas. No hay truncacion: una peticion que no cabe en 32.768 tokens se reporta como no soportada. El batching agrupa los prompts de una misma peticion que comparten longitud de tokens, sin padding, hasta 24.576 tokens, en un orden estable; el resto de prompts se ejecutan por separado. El codigo se probo con torch 2.13, transformers 5.12.1 y peft 0.21.2, y sus dependencias son torch, transformers, peft, safetensors y numpy.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Respuesta a preguntas de decision de opcion multiple devolviendo una probabilidad por opcion, calculada por la cabeza bayesiana en lugar de por los logits de las letras.
- Preguntas de tipo si/no, con las opciones Yes y No en ese orden.
- Soporte de definiciones de criterios para preguntas si/no, con claves yes/no o true/false, mostradas junto a las opciones; se pueden desactivar con noul_defs=False.
- Manejo de preguntas con mas de 52 opciones en dos rondas.
- Calculo de la log-verosimilitud negativa de la opcion correcta cuando se pasan etiquetas a forward, con indice de letra por fila y -100 para omitir.
- Determinismo de la misma peticion en la misma maquina con la misma GPU y software, gracias a que predict_proba agrupa prompts de igual longitud sin padding y en orden estable.
- Construccion manual de prompts, con metodos encode, collate y forward para batching propio.
- No se documentan capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se documentan capacidades multilingues ni lista de idiomas.

## Casos de uso

- Toma de decisiones operativas con incertidumbre explicita: la propia model card propone el ejemplo de un pronostico con un 70% de probabilidad de lluvia intensa y un partido al aire libre, pidiendo la probabilidad de jugar, trasladar el partido a un pabellon o aplazarlo. El modelo devuelve una probabilidad por opcion, lo que permite fijar umbrales de decision.
- Verificacion de consistencia documental: el ejemplo del README compara el total de una factura (1.240 dolares) con el de la orden de compra (1.420 dolares) y pregunta si la factura es consistente. La salida probabilistica permite enrutar el caso a revision manual solo cuando la confianza es baja.
- Triaje y enrutado de tickets o incidencias: al recibir una descripcion del problema, el modelo puede asignar probabilidades a distintas categorias o acciones de respuesta, de modo que el sistema derive automaticamente solo los casos con probabilidad alta.
- Soporte a la decision en entornos regulados: en dominios donde se exige trazabilidad de la incertidumbre (por ejemplo, aprobacion de operaciones o evaluacion de riesgos), una distribucion calibrada por opcion es mas util que una respuesta en texto libre.
- Auditoria y evaluacion de sistemas de decision: al integrarse con el kit Decision Index, permite medir el comportamiento del modelo sobre un panel de benchmarks de decision y comparar variantes del adaptador.
- Anotacion asistida con umbrales: uso de las probabilidades para aceptar automaticamente etiquetas por encima de un umbral y escalar el resto a anotacion humana, con criterio cuantificable.
- Investigacion en calibracion bayesiana: la cabeza VBLL y la reproducibilidad declarada facilitan experimentos sobre calibracion de ultima capa en modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card describe una evaluacion sobre el panel publico de Decision Index 0.3, compuesto por 37 benchmarks, medido con la suite publica del kit (edicion 0.3, commit 9eb2dbe2) y con la propia pipeline de puntuacion del autor, no con el runner del kit. La descripcion indica las diferencias respecto al motor: el orden de opciones se genero con un generador con semilla en lugar de un hash de la peticion, el reparto de la primera ronda para preguntas con mas de 52 opciones se sembro con el identificador de peticion del kit, las definiciones si/no no se mostraron, los prompts se agruparon por benchmark y no dentro de cada peticion, y 319 prompts de mas de 32.768 tokens (304 de MMLU-Pro y 15 de iSarcasmEval) se puntuaron con el estado recortado. Los valores obtenidos no se incluyen en la informacion disponible.

## Requisitos de hardware

- El modelo base se denomina 31B; en bf16 los pesos requeririan del orden de 62 GB de VRAM, a lo que se anade el adaptador (1,5 GB en el repositorio), la cache KV y las activaciones. Es una estimacion a partir del tamano declarado en el nombre del modelo base, no un dato publicado.
- El ejemplo de uso carga el modelo con device_map="cuda", por lo que se asume GPU NVIDIA o compatible con CUDA.
- No se indica que quepa en GPU de consumo; en bf16 un modelo de este tamano no es viable en tarjetas de 24 GB sin cuantizar el modelo base.
- Se recomienda ejecutar en modo eager, sin torch.compile, para conservar la aritmetica declarada y la reproducibilidad.
- Opciones de despliegue: la clase GarumForDecision del repositorio y el runner del kit Decision Index mediante garum_engine:GarumEngine. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en GGUF.
- El batching interno agrupa prompts de igual longitud sin padding hasta 24.576 tokens; el uso de --option batching=pad emplea lotes con padding por la derecha.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros adaptadores o modelos comparables de la misma categoria (decision de opcion multiple con probabilidades calibradas). La unica referencia directa es el modelo base sin adaptador.

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plantwaterer/garum | no disponible (base 31B) | 32.768 tokens en el motor | Probabilidad por opcion (cabeza VBLL) | apache-2.0 para el adaptador | HuggingFace, 0 descargas y 0 likes |
| google/gemma-4-31B-it | 31B segun denominacion | no disponible | Texto generado | licencia propia del modelo base | HuggingFace |

## Limitaciones y advertencias

- El modelo no genera texto: su salida son probabilidades por opcion, y los logits de las letras por si solos no constituyen la respuesta. Es obligatorio cargarlo a traves del codigo del repositorio.
- La composicion del lote puede alterar ligeramente las salidas en bf16 (del orden de un paso bf16 en un logit de letra), por lo que la reproducibilidad solo esta garantizada en la misma GPU y con el mismo software. predict_proba mitiga esto agrupando prompts de igual longitud en orden estable.
- Las peticiones que superan los 32.768 tokens no se truncan: se declaran no soportadas, lo que limita el uso con contextos muy largos.
- No se documentan los idiomas soportados; el comportamiento multilingue es desconocido.
- No se detallan los datos de entrenamiento, por lo que se desconocen sesgos y riesgos de alucinacion especificos. Las probabilidades pueden estar mal calibradas fuera de la distribucion de entrenamiento.
- La licencia apache-2.0 se aplica al adaptador; el uso comercial esta condicionado por la licencia y los terminos del modelo base google/gemma-4-31B-it.
- El repositorio es de codigo abierto, pero el espejo en GitHub solo contiene punteros de Git LFS en lugar de los ficheros de pesos, que se alojan en HuggingFace.
- El modelo tiene 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.
- La model card disponible esta truncada y los resultados numericos de la evaluacion no aparecen en la informacion proporcionada.
- La implementacion depende de versiones concretas del ecosistema (torch 2.13, transformers 5.12.1, peft 0.21.2); se desconoce su compatibilidad con versiones anteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/plantwaterer/garum
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Kit Decision Index: https://github.com/apolinario/decision-index
- Espejo en GitHub con el codigo: mencionado en la model card, pero la URL no aparece en la informacion disponible
- Paper o publicacion de la cabeza VBLL: no disponible
- Demo o espacio interactivo: no disponible
