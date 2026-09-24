# Marco-intelligence/tartanimu-marco

## Resumen

Marco-intelligence/tartanimu-marco es un repositorio de modelo publicado en HuggingFace por el usuario u organizacion Marco-intelligence bajo licencia Apache 2.0. El repositorio ocupa 0,2 GB, fue creado el 24 de septiembre de 2026 a las 01:10 UTC y actualizado el mismo dia a las 01:15 UTC. En el momento de la consulta acumula 0 descargas y 0 "likes", no tiene pipeline declarado y no especifica idiomas soportados.

La model card publicada no contiene mas contenido que la declaracion de licencia. No se documentan arquitectura, numero de parametros, longitud de contexto, composicion del dataset de entrenamiento, proceso de alineacion ni resultados de evaluacion. Los resultados de busqueda web para el termino "Marco" devuelven exclusivamente entidades no relacionadas con el modelo (una agencia de viajes, una tienda de calzado, una plataforma de orientacion profesional, un servicio de taxi y un productor agroalimentario), por lo que no aportan informacion tecnica alguna.

Esta ficha se limita, por tanto, a registrar los metadatos verificables del repositorio y a marcar explicitamente como "no disponible" todo aquello que no puede confirmarse. Cualquier decision de adopcion en produccion exigiria inspeccionar directamente los archivos de pesos, identificar la arquitectura y ejecutar una bateria de evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no hay ningun indicio de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio ocupa 0,2 GB sin detalle de archivos) |
| Pipeline declarado | no disponible |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 24 de septiembre de 2026, 01:10 UTC |
| Ultima actualizacion | 24 de septiembre de 2026, 01:15 UTC |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No disponible. La model card no describe la arquitectura del modelo, no indica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un modelo hibrido, y no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF, DPO o similares.

El unico dato estructural verificable es el tamano del repositorio, 0,2 GB. Ese volumen es compatible con varias posibilidades mutuamente excluyentes: un modelo denso de aproximadamente 0,1 B de parametros almacenado en fp16, un modelo de mayor tamano cuantizado a 8 o 4 bits, o un adaptador de ajuste fino (LoRA/PEFT) que dependeria de un modelo base externo. Ninguna de estas hipotesis puede confirmarse con la informacion disponible, y la eleccion entre ellas cambia por completo los requisitos de despliegue.

## Capacidades

No se ha publicado informacion sobre las capacidades del modelo. No es posible confirmar ni descartar ninguna de las siguientes:

- Generacion de texto en lenguaje natural: no verificable.
- Razonamiento multi-paso y modos de pensamiento explicito (thinking): no verificable.
- Generacion y completado de codigo: no verificable.
- Razonamiento matematico: no verificable.
- Soporte de tool calling o function calling: no verificable.
- Comportamiento agentico y uso de herramientas en varios pasos: no verificable.
- Capacidades multimodales (vision, audio): no verificable.
- Capacidades multilingues y cobertura de idiomas: no verificable; el repositorio no declara ningun idioma.

## Casos de uso

No es posible recomendar casos de uso concretos para este modelo: se desconocen sus capacidades, su tamano y su contexto, y no existe documentacion tecnica asociada. Los escenarios que se enumeran a continuacion son condicionales y solo serian aplicables si se verificase previamente la hipotesis indicada en cada uno; ninguno debe tomarse como una recomendacion de adopcion.

- Prototipado local de bajo consumo: si el repositorio contuviese un modelo denso de aproximadamente 0,1 B de parametros, seria ejecutable en CPU y en GPU de gama baja, aunque su utilidad practica dependeria de una evaluacion de calidad que no existe.
- Ajuste fino sobre dominio propio: si contuviese pesos completos con licencia Apache 2.0, permitiria reentrenamiento y publicacion de derivados sin restricciones de uso comercial, siempre que se documentase primero la arquitectura y la tokenizacion.
- Carga como adaptador sobre un modelo base: si el contenido fuese un adaptador LoRA o PEFT, requeriria identificar el modelo base exacto, su revision y su tokenizador antes de poder cargarse.
- Evaluacion comparativa interna: solo tendria sentido despues de identificar arquitectura, parametros y tokenizador, y de construir un conjunto de evaluacion propio, dado que no hay benchmarks publicados.
- Despliegue en entorno edge o sin GPU: condicionado a que el modelo sea de menos de 0,3 B de parametros y a que su calidad en la tarea objetivo resulte aceptable en pruebas propias.
- Auditoria de trazabilidad de artefactos de IA: el repositorio sirve como caso de estudio de publicaciones sin model card, sin pipeline declarado y sin historial de uso, util para disenar politicas internas de admision de modelos de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion y las busquedas web realizadas no han localizado papers, informes tecnicos ni entradas de blog asociadas al modelo. No se dispone por tanto de valores de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra metrica, ni de datos de latencia o throughput.

## Requisitos de hardware

No es posible calcular requisitos reales de hardware sin conocer el numero de parametros y el formato de pesos. Como orientacion condicional, basada unicamente en el tamano del repositorio (0,2 GB):

| Escenario hipotetico | Parametros implicados | VRAM estimada en inferencia |
|---|---|---|
| Pesos completos en fp16 | ~0,1 B | 0,4 - 1 GB |
| Pesos completos en int8 | ~0,2 B | 0,5 - 1,5 GB |
| Pesos completos en int4 | ~0,4 B | 0,6 - 2 GB |
| Adaptador LoRA/PEFT | no determinable | depende del modelo base |

- GPU recomendadas: no disponible. En cualquiera de los escenarios anteriores seria suficiente una GPU consumer, pero esto es una inferencia a partir del tamano del repositorio, no un dato verificado.
- Cabe en GPU consumer: probablemente si en todos los escenarios de la tabla, sujeto a verificacion.
- Opciones de despliegue: no disponible. Se desconoce si los pesos estan en safetensors, GGUF u otro formato, lo que determina si son utilizables con llama.cpp, Ollama, vLLM, TGI o transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No es posible establecer una comparativa rigurosa porque se desconoce el numero de parametros, la tarea objetivo y el rendimiento del modelo. A modo de referencia orientativa, los modelos abiertos de uso comun en el rango de tamano que sugiere un repositorio de 0,2 GB son los siguientes, aunque no existe ningun dato que permita situar a Marco-intelligence/tartanimu-marco frente a ellos:

| Modelo de referencia | Parametros | Contexto | Licencia |
|---|---|---|---|
| Qwen2.5-0.5B | 0,49 B | 32 768 tokens | Apache 2.0 |
| SmolLM2-135M | 0,135 B | 8 192 tokens | Apache 2.0 |
| TinyLlama-1.1B | 1,1 B | 2 048 tokens | Apache 2.0 |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card tecnica, ni ficha de arquitectura, ni descripcion del dataset. Esto impide la evaluacion de sesgos, la trazabilidad de los datos y cualquier analisis de cumplimiento normativo.
- Sesgos conocidos: no disponible. Al no conocerse la composicion del dataset de entrenamiento, no puede evaluarse el sesgo de genero, raza, idioma o dominio.
- Riesgo de alucinacion: no evaluable sin pruebas. No debe asumirse ningun nivel de fiabilidad factologica.
- Limitaciones de contexto e idioma: no disponible. El repositorio no declara idiomas soportados ni longitud de contexto.
- Procedencia no verificada: el autor no tiene historial publico visible en el repositorio (0 descargas, 0 "likes", 0 seguidores documentados). No hay garantia de integridad del artefacto ni de que los pesos correspondan a lo declarado.
- Riesgo de seguridad de la cadena de suministro: los archivos de pesos de origen desconocido pueden requerir deserializacion. Se recomienda usar formatos seguros (safetensors), inspeccionar el contenido del repositorio antes de cargarlo y ejecutarlo en un entorno aislado.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. La licencia no ofrece ninguna garantia sobre el funcionamiento del modelo. Es responsabilidad del usuario verificar que los datos de entrenamiento (desconocidos) no incorporan material con restricciones adicionales.
- Idoneidad para produccion: no acreditada. Con 0 descargas, sin benchmarks y sin documentacion, no existen evidencias que respalden su uso en entornos productivos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Marco-intelligence/tartanimu-marco
- Texto completo de la licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Papers, blogs o repositorios asociados: no disponible. Las busquedas web realizadas no han devuelto ningun resultado relacionado con el modelo; los dominios localizados (marcovasco.fr, spartoo.com, marco.jobteaser.com, taximarco-frenchriviera.com, explorenicecotedazur.com) corresponden a entidades homonimas sin vinculacion tecnica alguna.
