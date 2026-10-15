# danyalmalik/gemma-3-12b-it-ONNX-WebGPU

## Resumen

gemma-3-12b-it-ONNX-WebGPU es una conversion del modelo google/gemma-3-12b-it al formato ONNX, realizada por el usuario danyalmalik, con el objetivo de ejecutarlo directamente en un navegador web mediante el backend WebGPU de ONNX Runtime Web. El repositorio no contiene pesos en safetensors ni GGUF, sino un decoder ONNX en el layout de ONNX Runtime GenAI, con las capas lineales y la cabeza LM cuantizadas a 4 bits. El unico cambio funcional respecto al original, ademas de la cuantizacion, es que se ha omitido la torre de vision: el modelo resultante es exclusivamente texto a texto.

El modelo base, Gemma 3 12B Instruct, es un transformer denso de aproximadamente 12.000 millones de parametros desarrollado por Google. La conversion mantiene la arquitectura del decoder, pero elimina toda la funcionalidad multimodal y modifica ligeramente las salidas numericas debido al redondeo de la cuantizacion, tal como advierte el propio autor. El repositorio ocupa 8,8 GB y no registra descargas ni likes en el momento de la consulta.

Su relevancia practica esta en el nicho de inferencia local sin servidor: permite desplegar un modelo de 12B en el cliente, dentro del navegador, apoyandose en WebGPU, lo que abre la puerta a aplicaciones web con IA integrada sin costes de API ni envio de datos a terceros. No obstante, al tratarse de una conversion de terceros y no de un artefacto oficial de Google, hay que verificar exhaustivamente la fidelidad de las salidas antes de usarla en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder, exportado a ONNX con layout de ONNX Runtime GenAI (input_ids, attention_mask, past_key_values.* -> logits, present.*); rotary embedding integrado dentro de GroupQueryAttention; solo lenguaje, sin torre de vision |
| Parametros totales | 12B (segun el nombre del modelo y su base google/gemma-3-12b-it; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Capas lineales y cabeza LM en 4 bits (round to nearest, block size 32); embeddings, activaciones y cache KV en float16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Gemma Terms of Use (incluye la Gemma Prohibited Use Policy); se mantienen las restricciones de la seccion 3.2 |
| Formato de pesos | ONNX (ONNX Runtime GenAI); sin safetensors ni GGUF en el repositorio |

## Arquitectura y entrenamiento

La conversion parte del checkpoint google/gemma-3-12b-it y lo transforma en un decoder ONNX mediante el exportador propio de Quick Inference. El grafo resultante sigue el layout de ONNX Runtime GenAI: entradas input_ids y attention_mask, junto con las past_key_values, y salidas logits y present.*. El autor indica que la operacion de rotary embedding queda embebida dentro del nodo GroupQueryAttention, lo que implica que atencion y RoPE se ejecutan de forma fusionada en el runtime.

En cuanto a la cuantizacion, las capas lineales y la cabeza LM se reducen a 4 bits con redondeo al vecino mas cercano y tamano de bloque 32, mientras que los embeddings, las activaciones y la cache KV se mantienen en float16. La torre de vision del modelo original se descarta por completo. El autor advierte explicitamente que estos ficheros son modificados y que sus salidas son cercanas, pero no identicas, a las del modelo original. No se publica informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO, ya que no se ha reentrenado nada: es unicamente una conversion de formato y precision.

## Capacidades

- Generacion de texto en modalidad texto a texto, con las capacidades heredadas del checkpoint instruct de Gemma 3 12B.
- Razonamiento y comprension de instrucciones propias de un modelo ajustado con instrucciones (sufijo -it del modelo base).
- Generacion de codigo y resolucion de problemas matematicos, en la medida en que lo permita el modelo base.
- Capacidades multilingues: no confirmadas en la informacion disponible para esta conversion concreta.
- Sin soporte de vision: la torre multimodal fue eliminada durante la exportacion.
- Soporte de tool calling o function calling: no documentado para esta conversion.
- Soporte de agentes y razonamiento multi-paso: no documentado para esta conversion.
- Modo thinking explicito: no documentado para esta conversion.
- Ejecucion en navegador mediante el backend WebGPU de ONNX Runtime Web, orientada a inferencia rapida en cliente.

## Casos de uso

- Aplicaciones web con IA embebida sin backend: el modelo se carga en el navegador del usuario mediante ONNX Runtime Web y WebGPU, de modo que la inferencia ocurre en la maquina del cliente y no requiere servidores GPU ni llamadas a APIs externas.
- Asistentes de escritura y edicion de texto offline: al ejecutarse integramente en local, permite redactar, resumir y reescribir documentos sin que el contenido salga del dispositivo, algo relevante para entornos con requisitos de privacidad estrictos.
- Herramientas internas para desarrolladores: generacion de fragmentos de codigo, explicacion de funciones y redaccion de documentacion tecnica dentro de una interfaz web, con las salidas limitadas por la cuantizacion de 4 bits.
- Demos y prototipos de producto: validar rapidamente una idea de funcionalidad conversacional en el navegador antes de invertir en infraestructura de servidor, aprovechando que el repositorio ocupa 8,8 GB y se distribuye como ficheros estaticos.
- Entornos educativos y de investigacion: experimentar con modelos de 12B en equipos de laboratorio con GPU de consumo, sin necesidad de configurar stack de Python, CUDA o servidores de inferencia.
- Procesamiento de texto en kioscos o aplicaciones de escritorio empaquetadas con tecnologias web (Electron, Tauri con frontend web), donde el modelo se distribuye junto a la aplicacion.
- Evaluacion comparativa de cuantizacion: medir la degradacion de calidad entre el checkpoint original en safetensors y esta version en ONNX a 4 bits, especialmente en tareas sensibles al redondeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y tampoco cifras de latencia o throughput en WebGPU. Tampoco se dispone de comparaciones numericas frente al checkpoint original mas alla de la advertencia cualitativa de que las salidas son "cercanas, pero no identicas".

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 8,8 GB, por lo que se puede esperar un consumo en el rango de 8 a 10 GB en funcion del runtime, la longitud de contexto y el tamano de la cache KV en float16. No hay mediciones publicadas.
- GPU recomendadas: cualquier GPU con soporte WebGPU y al menos 8-12 GB de memoria de video dedicada o compartida; no se especifican modelos concretos en la documentacion.
- GPU de consumo: el objetivo del proyecto es precisamente ejecutarlo en hardware de consumo a traves del navegador, aunque el limite real dependera de la memoria disponible y de las restricciones de memoria por pestana del navegador.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU, en el layout de ONNX Runtime GenAI, tal como lo consume Quick Inference. El uso con vLLM, llama.cpp, Ollama o TGI no esta documentado para este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| danyalmalik/gemma-3-12b-it-ONNX-WebGPU | 12B | no disponible | ONNX (ORT GenAI) | Lineales y LM head a 4 bits, resto fp16 | No | Gemma Terms of Use | HuggingFace, 0 descargas |
| google/gemma-3-12b-it (base) | 12B | no disponible en esta informacion | safetensors | Original (sin cuantizar) | Si | Gemma Terms of Use | HuggingFace, oficial |
| Otras conversiones a GGUF o formatos alternativos de Gemma 3 12B | 12B | no disponible | GGUF u otros | no disponible | Variable | Gemma Terms of Use | no disponible |

La diferencia principal frente al checkpoint oficial es el formato de pesos, la cuantizacion a 4 bits y la perdida de la capacidad multimodal. Como contrapartida, esta version puede ejecutarse en el navegador, algo que el checkpoint original en safetensors no permite sin una capa de conversion adicional.

## Limitaciones y advertencias

- Salidas no identicas al modelo original: el propio autor advierte que la cuantizacion a 4 bits introduce diferencias numericas respecto a google/gemma-3-12b-it.
- Perdida de la capacidad de vision: la torre multimodal fue eliminada, por lo que no puede procesar imagenes.
- Riesgo de alucinacion: inherente al modelo base y potencialmente acentuado por el redondeo de la cuantizacion a 4 bits, sin que existan evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no documentados para esta conversion; se heredan los del checkpoint de Google, que no se detallan en la informacion disponible.
- Restricciones de licencia: se aplican las Gemma Terms of Use y la Gemma Prohibited Use Policy. Si se redistribuyen los ficheros o cualquier trabajo derivado, hay que trasladar esas mismas restricciones.
- Artefacto de terceros: no es una publicacion oficial de Google, con 0 descargas y 0 likes, y sin pipeline declarado; conviene auditar el grafo ONNX antes de usarlo en produccion.
- Sin datos de rendimiento: no hay cifras publicadas de latencia, throughput ni consumo de memoria, por lo que el dimensionamiento del hardware debe hacerse por prueba directa.
- Sin informacion de idiomas: no se documenta que lenguas estan soportadas en esta conversion concreta.
- Dependencia del soporte WebGPU: la ejecucion depende del navegador y del dispositivo; en equipos sin WebGPU o con memoria limitada el modelo puede no cargarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danyalmalik/gemma-3-12b-it-ONNX-WebGPU
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Gemma Terms of Use: archivo GEMMA_TERMS_OF_USE.md incluido en el repositorio del modelo
- Gemma Prohibited Use Policy: archivo GEMMA_PROHIBITED_USE_POLICY.md incluido en el repositorio del modelo
- Aviso legal: archivo NOTICE incluido en el repositorio del modelo
- No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs o repos) asociados a este modelo.
