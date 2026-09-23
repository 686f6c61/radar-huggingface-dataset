# FluidInference/kev-0-5b-coreml

## Resumen

Kev 0.5B Core ML es la conversion a Core ML en FP16 del modelo jaredpalmer/kev-0.5b, realizada por FluidInference. No se trata de un modelo generativo de texto al uso: es un artefacto de clasificacion que, dada una `state` de tipo Kev System One y una unica pregunta, devuelve las claves de un conjunto cerrado de 32 opciones junto con sus probabilidades. La conversion fusiona el adaptador LoRA de Kev sobre el backbone Qwen/Qwen2.5-0.5B y conserva la cabeza pointer entrenada, por lo que el modelo final ronda los 0,5 mil millones de parametros.

El paquete L128/32 opciones ocupa 989.581.157 bytes y exige iOS 17 o macOS 14 como minimo. El runtime incluido rechaza cualquier peticion cuya codificacion completa supere los 128 tokens, lo que fija de facto la ventana de trabajo y limita el modelo a estados y preguntas cortos. Se distribuye con tokenizer y `runtime.py` propios, de modo que la inferencia no necesita cargar los pesos originales de Qwen.

Su relevancia es acotada pero concreta: demuestra un flujo completo de conversion de un adaptador LoRA mas cabeza de decision a Core ML, con verificacion numerica frente al modelo nativo y mediciones de latencia en Apple Silicon (7,24-18,01 ms segun la ruta de medida). Es material de interes para quien investigue despliegue on-device en el Neural Engine de Apple o quiera replicar evaluaciones tipo Decision Index, no para quien busque un LLM de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen2.5-0.5B) con adaptador LoRA fusionado y cabeza pointer entrenada |
| Parametros totales | Aproximadamente 0,5 mil millones (heredados del backbone Qwen2.5-0.5B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens como maximo de codificacion completa; el runtime rechaza peticiones que lo excedan |
| Tipos de cuantizacion | FP16 (Core ML FP16); no se listan otras precisiones |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Paquete Core ML (artefacto de 989.581.157 bytes) con tokenizer y `runtime.py` incluidos |

Otros datos de interes: pipeline declarado `text-classification`, libreria `coremltools`, tamano del repositorio 1,0 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 22 de septiembre de 2026 y actualizado el mismo dia.

## Arquitectura y entrenamiento

La pieza base es un transformer decoder-only Qwen2.5-0.5B (revision fijada `060db6499f32faf8b98477b0a26969ef7d8b9987`, licencia Apache-2.0) al que se le aplica el adaptador LoRA de Kev (revision fuente `9ce2fd39db3a397c89733f94af948e3d1fdfffcd`). Tras fusionar el adaptador, se conserva la cabeza pointer entrenada, que restringe la salida a 32 opciones y devuelve una distribucion de probabilidad sobre ellas en lugar de texto libre. El fichero `assets.lock.json` fija ambas fuentes y la revision del codigo upstream de Kev.

La conversion a Core ML la ejecuto Fluid Inference; Jared Palmer es el autor de Kev y Qwen el del backbone. La validacion reportada compara el wrapper de exportacion de PyTorch con el modelo nativo fusionado: la diferencia maxima de logits fue de 0,0000131, y el paquete Core ML coincidio con la opcion elegida por el modelo nativo en 19 de 19 fixtures fijos ejecutables, con un error maximo de probabilidad de 0,002068 en `ComputeUnit.ALL`. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion de decision: dada una `state` de Kev System One y una pregunta, devuelve las claves de opcion y sus probabilidades sobre un espacio cerrado de 32 opciones.
- Procesamiento de una unica pregunta por llamada; no soporta conversaciones multi-turno dentro de la misma invocacion.
- Inferencia on-device en Apple Silicon mediante Core ML, con ejecucion en CPU, Neural Engine o unidad de computo completa (`ComputeUnit.ALL`).
- Runtime autonomo: `runtime.py` y el tokenizer incluidos permiten ejecutar el artefacto sin cargar los pesos fuente de Qwen.
- Rechazo explicito de peticiones que excedan 128 tokens de codificacion completa.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, function calling, agentes multi-paso ni audio.
- Capacidades multilingues: no disponible.

## Casos de uso

- Clasificacion de intencion en asistentes on-device: el modelo recibe el estado de la aplicacion y una pregunta corta, y devuelve la opcion mas probable entre 32, lo que encaja en flujos donde la latencia de milisegundos y la ausencia de red son requisitos duros.
- Seleccion de accion en agentes con espacio de acciones discreto: al mapear cada accion a una de las 32 opciones, la probabilidad devuelta sirve como politica o como capa de desambiguacion sobre un planificador mayor.
- Investigacion en despliegue Apple: sirve como caso de referencia reproducible de conversion LoRA mas cabeza pointer a Core ML, con verificacion numerica y mediciones de latencia publicadas.
- Filtrado y triaje de tickets o formularios: con estados y preguntas por debajo de 128 tokens, permite etiquetar consultas entrantes en categorias fijas dentro de una app iOS o macOS, sin enviar datos a servidores externos.
- Enrutado de decisiones en aplicaciones de privacidad estricta: al ejecutarse localmente en el Neural Engine, es apto para dominios donde no se puede transmitir el estado del usuario a un servicio remoto.
- Evaluacion comparativa de cabezas de decision: el propio autor lo situa frente a Laya en la suite FluidUse de 3.899 preguntas, por lo que resulta util como sujeto de comparacion en protocolos tipo Decision Index.
- Prototipado rapido en macOS 14 o iOS 17: el paquete se ejecuta con `uv sync` y `uv run python runtime.py --model-dir . --request-json request.json`, lo que permite validar una idea de clasificacion sin montar infraestructura de servidor.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Diferencia maxima de logits entre el wrapper de exportacion PyTorch y el modelo nativo fusionado | 0,0000131 |
| Coincidencia con la opcion elegida por el modelo nativo en fixtures fijos | 19 de 19 ejecutables |
| Peticiones de la suite seleccionada que excedieron la capacidad L128 | 4 |
| Error maximo de probabilidad en `ComputeUnit.ALL` | 0,002068 |
| Suite de aplicacion FluidUse (3.899 preguntas), Kev | 57,2 % |
| Suite de aplicacion FluidUse (3.899 preguntas), Laya (puerto previo) | 71,2 % |
| Decision Index congelado, Kev | 30,34 |
| Decision Index congelado, Laya | 16,39 |
| Latencia mediana en Apple M5 Pro, perfil previo `coreml-cli`, `ComputeUnit.ALL` | 8,22 ms |
| Latencia mediana en Apple M5 Pro, perfil previo `coreml-cli`, CPU mas Neural Engine | 7,24 ms |
| Latencia mediana en Apple M5 Pro, llamada de verificacion posterior en Python | 18,01 ms |

El paquete no se ha ejecutado sobre la suite completa del Decision Index congelado, y los propios autores advierten de que las rutas de medida no son intercambiables entre si ni con las evaluaciones nativas truncadas. No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con iOS 17 o macOS 14 como minimo declarado; es un artefacto Core ML, no un modelo para GPUs NVIDIA o AMD.
- VRAM estimada: no disponible. La ejecucion se realiza sobre memoria unificada de Apple y el paquete ocupa 989.581.157 bytes en disco.
- GPUs recomendadas: no aplica. El hardware de referencia reportado es un Apple M5 Pro.
- Cabe en hardware de consumo: si, en equipos Apple Silicon que cumplan iOS 17 o macOS 14; no hay datos sobre el rendimiento en chips anteriores de la serie M ni en iPhone/iPad concretos.
- Opciones de despliegue: el runtime propio `runtime.py` con el tokenizer incluido (via `uv`), Core ML con seleccion de unidad de computo (`ComputeUnit.ALL` o CPU mas Neural Engine). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia conocida en Apple M5 Pro: 8,22 ms de mediana con `ComputeUnit.ALL` y 7,24 ms con CPU mas Neural Engine segun el perfil previo de `coreml-cli`; 18,01 ms de mediana en la llamada de verificacion en Python. Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev 0.5B Core ML (FluidInference) | ~0,5 B | 128 tokens de codificacion | 57,2 % en la suite FluidUse de 3.899 preguntas; Decision Index 30,34 | Apache-2.0 | Paquete Core ML en HuggingFace |
| Laya (puerto previo citado por el autor) | No disponible | No disponible | 71,2 % en la suite FluidUse de 3.899 preguntas; Decision Index 16,39 | No disponible | Puerto previo dentro de FluidInference |
| Qwen2.5-0.5B (backbone original) | ~0,5 B | No disponible en la informacion proporcionada | No comparable directamente: es un LLM generativo, no una cabeza de decision de 32 opciones | Apache-2.0 | Pesos en HuggingFace |

La comparacion con Laya procede de la propia model card, que advierte de que ambas puntuaciones pertenecen a protocolos distintos y no deben equipararse sin mas. No se dispone de datos suficientes para comparar contra otras alternativas de clasificacion on-device.

## Limitaciones y advertencias

- La ventana util esta fijada en 128 tokens de codificacion completa; el runtime rechaza cualquier peticion que la supere y cuatro peticiones de la suite seleccionada quedaron fuera de capacidad.
- Solo procesa una pregunta por llamada y devuelve claves de opcion con probabilidades, no texto libre; no es utilizable como chatbot ni como generador.
- El espacio de salida esta cerrado a 32 opciones, lo que limita su aplicacion a tareas de clasificacion predefinidas.
- Las evaluaciones truncadas para encajar en el limite de tokens son variantes de protocolo y, segun los autores, no pueden considerarse evaluaciones nativas completas del Decision Index.
- El paquete no se ha ejecutado sobre la suite completa del Decision Index congelado, por lo que su comportamiento agregado en ese protocolo es desconocido.
- El 57,2 % de acierto en la suite FluidUse de 3.899 preguntas esta por debajo del 71,2 % del puerto previo Laya, lo que indica margen de mejora en esa tarea concreta.
- Las mediciones de latencia proceden de rutas distintas (`coreml-cli` frente a Python) y los propios autores advierten de que no son sustituibles entre si; la diferencia entre 8,22 ms y 18,01 ms de mediana refleja ese cambio de ruta.
- No se documentan idiomas soportados, composicion del dataset de entrenamiento ni sesgos conocidos; el riesgo de alucinacion no aplica en el sentido generativo, pero si el de calibracion incorrecta de las probabilidades de opcion.
- Los ficheros `tokenizer/` contienen tokens especiales esenciales: una reimplementacion que los omita producira resultados incorrectos.
- Licencia Apache-2.0, permisiva para uso comercial; conviene verificar las condiciones del codigo upstream de Kev y de las dependencias fijadas en `assets.lock.json`.
- El modelo tiene 0 descargas y 0 likes, y la unica validacion publicada es la del propio autor de la conversion; no hay validacion independiente.
- La fecha de creacion registrada en HuggingFace es el 22 de septiembre de 2026, dato que se reproduce tal cual figura en la plataforma.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/FluidInference/kev-0-5b-coreml
- Modelo fuente Kev: https://huggingface.co/jaredpalmer/kev-0.5b
- Backbone Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Ficheros citados dentro del repositorio: `assets.lock.json`, `runtime.py`, `verify.py`, `RESULTS.md` y el JSON de informe de resultados (sin URL publica independiente en la informacion disponible)
- Documentacion adicional, papers, blogs o demos: no disponibles. Las busquedas web realizadas no devolvieron resultados relacionados con el modelo; los enlaces encontrados correspondian a un sitio de cine y television sin relacion con el contenido de esta ficha.
