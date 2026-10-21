# mradermacher/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Instruct-bf16-i1-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un conjunto de cuantizaciones GGUF generadas por mradermacher (conocido por producir versiones imatrix de modelos de terceros) a partir del modelo `nightmedia/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Instruct-bf16`. El nombre indica que la base es un modelo de la familia Gemma en su variante "E4B" ya ajustada para instrucciones ("it"), sobre la que se ha aplicado un merge o fine-tune de temática propia ("The DECKARD Expresso Universe") y un proceso de tipo "HERETIC" (habitualmente abliteration o eliminación del sesgo de rechazo). Ninguno de estos extremos está documentado en la model card, por lo que deben tomarse como inferencias a partir del nombre.

El dato objetivo disponible es el recuento de parametros del modelo original en safetensors: 7.518.069.290 (~7,52 mil millones). El repositorio GGUF ocupa 14,3 GB e incluye aproximadamente 23 variantes de cuantizacion, desde IQ1_S hasta Q6_K, generadas con pesos ponderados/imatrix y con el proyector multimodal omitido (`skip_mmproj: 1`), es decir, sin las capacidades de vision del modelo base si este las tuviera.

La relevancia practica es limitada pero clara para un nicho concreto: permite ejecutar un chat de ~7,5B sin censura aparente en hardware de consumo mediante llama.cpp u Ollama. Como contrapartida, el repositorio tiene 0 descargas y 0 likes, se creo y actualizo el mismo dia (21 de octubre de 2026), no declara licencia, idiomas ni pipeline, y no aporta ningun benchmark; es material sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la describe; el nombre del repo apunta a una base de la familia Gemma, variante E4B instruction-tuned) |
| Parametros totales | 7.518.069.290 (~7,52 B), segun los safetensors del modelo base |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE; el sufijo "E4B" podria aludir a parametros efectivos, sin verificacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL (cuantizacion ponderada con imatrix; `quantize_version: 2`, `convert_type: hf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no la declara; la licencia efectiva dependeria del modelo base y de los terminos de Gemma) |
| Formato de pesos | GGUF (multiples ficheros); repo de 14,3 GB; safetensors solo como origen de la conversion |

## Arquitectura y entrenamiento

No hay informacion publicada en la model card sobre la arquitectura interna (tipo de transformer, uso de atencion lineal, decodificacion especulativa, etc.), ni sobre el volumen o la composicion del dataset de entrenamiento, ni sobre si se aplicaron fases de RLHF, DPO o similar. Lo unico deducible del identificador es la cadena de procedencia: un modelo Gemma "E4B" ya instruction-tuned, transformado por el usuario nightmedia en una variante tematica y presuntamente desalineada ("HERETIC-UNCENSORED"), y posteriormente cuantizado por mradermacher.

En la parte de cuantizacion si hay detalle tecnico verificable: se han usado pesos ponderados con matriz de importancia (imatrix), lo que suele mejorar la perplejidad de las cuantizaciones de baja precision (IQ1, IQ2, IQ3) respecto a una cuantizacion estandar. El campo `skip_mmproj: 1` indica que el proyector multimodal se ha excluido del GGUF, de modo que estas versiones son solo de texto aunque el modelo base tuviera torre de vision. No se documenta ninguna innovacion adicional de arquitectura o decodificacion.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational` en HuggingFace).
- Respuestas presumiblemente sin mecanismos de rechazo, segun el sufijo "UNCENSORED" y "HERETIC" del nombre; no verificado empiricamente.
- Especializacion tematica en el universo "The DECKARD Expresso Universe" segun el nombre; el alcance real de ese ajuste no esta documentado.
- Compatibilidad declarada con endpoints de inferencia (tag `endpoints_compatible`).
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o multilingueismo: no disponibles; no hay ninguna evidencia en la informacion proporcionada de que las soporte de forma destacada.
- Vision: no incluida en estas cuantizaciones (proyector multimodal omitido).

## Casos de uso

- Experimentacion local con modelos sin censura: util para investigadores que estudian el comportamiento de rechazo y la eficacia de tecnicas de abliteration, comparando esta variante con la base Gemma original en el mismo prompt set.
- Escritura creativa y ficcion sin restricciones tematicas: el ajuste "uncensored" reduce la probabilidad de rechazos en narrativa violenta o adulta, y el tamano de 7,5B permite ejecutarlo en un portatil con GPU de 8 GB en Q4_K_M.
- Role-play y personajes persistentes: al ser un modelo de chat pequeno y cuantizado, se puede servir con llama-server manteniendo una sesion larga en memoria sin coste de API.
- Generacion de datos sinteticos para aumentar un corpus propio en dominios donde los modelos alineados se niegan a responder; despues conviene filtrar y revisar manualmente la calidad.
- Prototipado offline en entornos sin conectividad (campo, laboratorio aislado): un GGUF Q4 en Ollama no requiere red ni credenciales.
- Base para pruebas de red teaming interno: sirve como sujeto de pruebas para validar clasificadores de salida y filtros de seguridad antes de desplegar otros modelos.
- Asistente personal de bajo coste en hardware de consumo: conversacion general, resumenes y reescritura, siempre con supervision humana por la ausencia de benchmarks y de validacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto, y cuenta con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de terceros sobre su calidad.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo orientativo a partir de 7,52B parametros; no son medidas publicadas):
  - IQ1_S / IQ2_XXS: ~2,0-2,2 GB de pesos.
  - Q2_K / Q2_K_S: ~2,7 GB.
  - Q3_K_M: ~3,9 GB.
  - Q4_K_M: ~4,8 GB (la opcion recomendada en calidad/espacio).
  - Q5_K_M: ~5,6 GB.
  - Q6_K: ~6,5 GB.
  - A esas cifras hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto, que no esta documentada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para Q4_K_M o superior con contexto largo; A100/H100 no son necesarias para este tamano y solo se justificarian para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si. Q4_K_M entra en 8 GB de VRAM (RTX 3060 Ti, 4060, 3070) y con holgura en 12 GB; las variantes IQ2/IQ3 permiten incluso 6 GB.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (importando el GGUF con un Modelfile), LM Studio, llama-cpp-python, o vLLM con soporte GGUF para serving HTTP. TGI no soporta GGUF de forma nativa, por lo que requeriria el repositorio original en safetensors.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud para un transformer denso de ~7,5B en Q4_K_M, una RTX 4090 suele moverse en decenas-altas de tokens por segundo y una GPU de 8 GB en la decena baja, pero son estimaciones no medidas sobre este modelo concreto.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo, por lo que la comparacion se limita a la clase de tamano y a las condiciones de licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (GGUF de gemma-4-E4B it + merge HERETIC) | ~7,52 B | no disponible | no disponible | GGUF, 0 descargas, sin benchmarks |
| Gemma 2 9B Instruct | ~9,2 B | 8.192 tokens | Gemma Terms of Use | Amplia, muy cuantizado, con benchmarks publicos |
| Llama 3.1 8B Instruct | ~8,0 B | 128.000 tokens | Llama 3.1 Community License | Amplia, ecosistema maduro, con benchmarks publicos |
| Qwen2.5 7B Instruct | ~7,6 B | 32.768 nativos (131.072 con YaRN) | Apache 2.0 | Amplia, permite uso comercial sin restricciones de escala |

Frente a estas alternativas, el modelo aqui descrito solo aporta el ajuste tematico sin censura; en todo lo demas (contexto documentado, licencia clara, evaluaciones) queda por detras.

## Limitaciones y advertencias

- Ausencia total de validacion: 0 descargas, 0 likes y publicacion el mismo dia de la consulta; no hay evidencia de que las cuantizaciones funcionen correctamente.
- Sesgos desconocidos: al no documentarse el dataset ni el proceso de alineamiento, no se pueden anticipar sesgos de genero, raza, religion o idioma.
- Riesgo alto de alucinacion en un modelo de 7,5B sin evaluacion; no apto para tareas factuales sin verificacion.
- El caracter "UNCENSORED" implica que se han eliminado o debilitado los mecanismos de rechazo: puede generar contenido violento, sexual o danino. Requiere filtros propios en cualquier despliegue orientado al publico.
- Licencia no declarada: no se puede asumir uso comercial. La licencia del modelo base (previsiblemente Gemma Terms of Use, con sus restricciones de uso aceptable y obligaciones de atribucion) seguiria aplicando a los pesos derivados.
- Idiomas no declarados: no hay garantia de calidad en castellano; el nombre "Expresso" sugiere un origen linguistico distinto, no confirmado.
- Contexto desconocido: planificar cualquier integracion con ventanas largas sin asumir cifras.
- Sin proyector multimodal: si el modelo base soportaba imagenes, estas cuantizaciones no.
- El campo `skip_mmproj: 1` y la ausencia de `mmproj` en el repo hacen que herramientas que esperan un GGUF multimodal fallen o ignoren la parte visual.
- El tamano declarado del repo (14,3 GB) parece inferior a la suma de las ~23 cuantizaciones listadas, lo que sugiere que no todos los ficheros estan subidos o que la cifra es aproximada; conviene verificar la lista de archivos antes de descargar.
- Nombre de modelo largo y no convencional: puede provocar problemas en herramientas con limites de longitud de ruta o de nombre de fichero.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Instruct-bf16-i1-GGUF
- Modelo base en safetensors (bf16): https://huggingface.co/nightmedia/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Instruct-bf16
- Perfil del cuantizador: https://huggingface.co/mradermacher
