# alxnahas/strands-decider-2B-webgpu

## Resumen

Strands Decider 2B WebGPU es una version cuantizada a int4 del modelo StrandsAgents/strands-decider-2B-hobson-v19, un ajuste fino mediante LoRA sobre Qwen/Qwen3.5-2B-Base (revision `b1485b2`). Lo publica el usuario alxnahas en HuggingFace y su proposito no es la generacion de texto libre, sino la clasificacion y decision: el pipeline declarado es `text-classification` y el paquete conserva la cabeza pointer y la configuracion del decider originales. El modelo resuelve un problema muy concreto: ejecutar un modelo de 2B parametros integramente en el navegador mediante WebGPU, sin backend remoto.

La relevancia tecnica esta en el formato de pesos. Los pesos no se distribuyen en safetensors ni GGUF, sino en un layout MatMulNBits de cuantizacion simetrica int4 round-to-nearest con bloques de 32 y proyecciones fusionadas, repartidos en 2 shards que suman 1,06 GB, con un `manifest.json` que describe offsets y formas de cada tensor. El motor de inferencia es un runtime WebGPU escrito a mano, publicado en un repositorio aparte con scripts de conversion y una demo en vivo.

El autor reporta una validacion funcional sobre un benchmark propio de 27 elementos: el motor de navegador selecciona la misma respuesta principal que la implementacion oficial en PyTorch en 27 de 27 casos, con un error absoluto medio de probabilidad de 0,019 atribuido en su totalidad a la cuantizacion int4. No hay datos publicos de descargas ni de likes, y no se proporcionan especificaciones detalladas de contexto, idiomas o composicion del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder del modelo base Qwen/Qwen3.5-2B-Base con cabeza pointer y configuracion de decider; detalles de capas no disponibles |
| Parametros totales | 2B (segun nomenclatura del modelo; no confirmado en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 simetrica round-to-nearest, bloque de 32, layout MatMulNBits, proyecciones fusionadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Layout binario propio MatMulNBits (`engine-weights/`, 2 shards, 1,06 GB) con `manifest.json` de offsets y formas; no safetensors ni GGUF |
| Tamano del repositorio | 1,1 GB |
| Tarea declarada | text-classification |
| Modelos base | StrandsAgents/strands-decider-2B-hobson-v19 (LoRA) y Qwen/Qwen3.5-2B-Base (revision b1485b2) |
| Fecha de creacion | 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B-Base, un transformer decoder de 2B parametros, sobre el que se aplico un ajuste fino LoRA que dio lugar a strands-decider-2B-hobson-v19. En esta publicacion ese LoRA se ha fusionado de vuelta en el modelo base y se ha anadido una cabeza pointer y un decider, lo que confirma que el uso previsto es seleccionar o puntuar opciones (clasificacion, ranking o decision entre alternativas) en lugar de decodificar texto de forma autoregresiva abierta. El repositorio conserva el tokenizer original junto con la configuracion de la cabeza pointer y del decider, sin modificaciones respecto al modelo de origen.

La innovacion principal no esta en el entrenamiento, del que no se aporta informacion (no hay numero de tokens, composicion del dataset ni si hubo RLHF o DPO), sino en la ruta de despliegue. Los pesos se convierten a un esquema de cuantizacion int4 simetrica con redondeo al vecino mas cercano y bloques de 32 elementos, reorganizados en el layout MatMulNBits y con proyecciones fusionadas, lo que reduce el modelo a 1,06 GB en dos shards. El `manifest.json` documenta el offset y la forma de cada tensor para que un motor WebGPU escrito a mano pueda cargarlos y ejecutar las multiplicaciones de matrices directamente en el navegador. No se menciona decodificacion especulativa, atencion lineal ni otras tecnicas de eficiencia mas alla de la cuantizacion.

## Capacidades

- Clasificacion y decision: la tarea declarada es `text-classification`; el modelo incorpora una cabeza pointer y un decider, orientados a elegir o puntuar entre opciones.
- Inferencia en navegador: ejecucion integra en el cliente mediante WebGPU, sin necesidad de servidor de inferencia.
- Preservacion del comportamiento del modelo original: segun el autor, el motor de navegador reproduce la respuesta principal de la implementacion PyTorch oficial en 27 de 27 casos de su benchmark.
- Generacion de texto abierta: no disponible como capacidad declarada; el pipeline publicado no es `text-generation`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el nombre "strands-decider" y la dependencia de StrandsAgents sugieren un componente de decision dentro de un agente, pero no se documenta.
- Capacidades multilingues: no disponible.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Clasificacion de intenciones en aplicaciones web: el modelo puede ejecutarse dentro del propio navegador del usuario para etiquetar consultas o comentarios, evitando enviar el texto a un servidor y reduciendo coste de infraestructura.
- Seleccion entre respuestas candidatas en un agente: al disponer de cabeza pointer y decider, encaja como modulo que puntua alternativas generadas por otro modelo mayor y elige la mejor, tal como sugiere el nombre `strands-decider`.
- Enrutado de peticiones en arquitecturas multi-modelo: uso como clasificador ligero que decide a que modelo o herramienta derivar una consulta antes de invocar un LLM mayor.
- Aplicaciones offline o de privacidad estricta: al pesar 1,06 GB en int4 y correr en WebGPU, permite clasificacion local en equipos sin GPU dedicada y sin conexion permanente, util en entornos sanitarios, legales o corporativos con requisitos de residencia de datos.
- Prototipado rapido y demos interactivas: la existencia de una demo publica y de scripts de conversion permite integrar el modelo en una pagina web sin montar un backend, ideal para validar productos de clasificacion.
- Filtrado y moderacion en el cliente: clasificacion de contenido directamente en el navegador antes de enviarlo, con la ventaja de latencia minima y sin exponer el texto del usuario.
- Evaluacion de motores de inferencia WebGPU: el par motor mas pesos int4 sirve como banco de pruebas para medir precision frente a PyTorch tras cuantizar, dado que el autor publica el error absoluto medio de probabilidad.

## Benchmarks y rendimiento

Unico dato publicado por el autor, sobre un benchmark propio de 27 elementos y comparado contra la implementacion oficial en PyTorch:

| Metrica | Resultado |
|---|---|
| Coincidencia en la respuesta principal (top-1) | 27/27 |
| Error absoluto medio de probabilidad | 0,019 (atribuido integramente a la cuantizacion int4) |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Otros benchmarks estandar | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos proceden de la validacion interna del autor y no son comparables con evaluaciones publicas de terceros.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,06 GB en int4 (los dos shards de `engine-weights/`); hay que sumar activaciones, buffers de atencion y el propio contexto de WebGPU, no cuantificados en la informacion disponible.
- Memoria del sistema: el repositorio ocupa 1,1 GB; conviene disponer de al menos 2 GB libres entre pesos, tokenizer y buffers del navegador.
- GPU recomendadas: cualquiera con soporte WebGPU operativo. No hay lista oficial; el autor no especifica modelos concretos ni requisitos de VRAM adicionales.
- GPU de centro de datos (A100, H100): no son necesarias para el caso de uso previsto; el modelo esta disenado para ejecucion en cliente.
- GPU de consumo: el objetivo declarado es funcionar en navegador, por lo que el perfil esperado son GPUs integradas o dedicadas de gama media con WebGPU habilitado. No se confirma compatibilidad con modelos concretos.
- Opciones de despliegue: motor WebGPU propio escrito a mano (https://github.com/alxnahas/strands-decider-web). vLLM, llama.cpp, Ollama o TGI no estan soportados, ya que los pesos no estan en safetensors ni GGUF y no se publican scripts de conversion a esos formatos.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de tiempo de respuesta en la demo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores de decision de ~2B cuantizados para WebGPU) ni datos de rendimiento de alternativas. Como referencia estructural, el propio modelo base Qwen/Qwen3.5-2B-Base y el ajuste StrandsAgents/strands-decider-2B-hobson-v19 son los unicos parientes identificados, pero de ellos no se detallan parametros de contexto, licencia ni benchmarks mas alla de que este derivado conserva la licencia Apache-2.0.

## Limitaciones y advertencias

- Cero traccion verificable: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Benchmark de validacion muy reducido: 27 elementos es una muestra pequena y de diseno propio, no un estandar replicable; no demuestra calidad frente a terceros.
- Perdida de precision por cuantizacion: el autor reconoce un error absoluto medio de probabilidad de 0,019, integramente atribuido al paso a int4. En tareas sensibles a probabilidades calibradas esto puede ser relevante.
- Formato de pesos no estandar: el layout MatMulNBits propio impide usar herramientas habituales (vLLM, llama.cpp, TGI) sin escribir una conversion adicional, lo que limita el despliegue fuera del motor del autor.
- Alcance funcional restringido: al ser un clasificador o decider, no sirve como modelo generativo de proposito general.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica; no debe asumirse soporte de castellano.
- Sesgos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o alineacion.
- Riesgo de alucinacion: no disponible para este pipeline; en tareas de clasificacion el riesgo se traslada a etiquetas o decisiones incorrectas con alta confianza.
- Detalles de entrenamiento ausentes: se desconoce el dataset, el numero de tokens y si hubo RLHF o DPO, lo que dificulta auditar el comportamiento.
- Licencia: Apache-2.0, igual que los modelos de origen, lo que en principio permite uso comercial, pero conviene verificar las condiciones de Qwen/Qwen3.5-2B-Base y de StrandsAgents/strands-decider-2B-hobson-v19, ya que el derivado hereda sus obligaciones.
- Dependencia de navegador: el rendimiento real depende del soporte WebGPU del navegador y del controlador grafico del usuario, con variabilidad dificil de acotar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alxnahas/strands-decider-2B-webgpu
- Codigo, demo y scripts de conversion: https://github.com/alxnahas/strands-decider-web
- Demo en vivo: https://alxnahas.github.io/strands-decider-web/
- Modelo base del ajuste LoRA: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v19
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-2B-Base (revision `b1485b2`)

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados correspondian a foros sin relacion con el contenido tecnico. No se han localizado papers, blogs ni evaluaciones de terceros.
