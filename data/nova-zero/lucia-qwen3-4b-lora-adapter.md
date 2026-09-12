# Nova-Zero/Lucia-Qwen3-4B-LoRA-Adapter

## Resumen

Lucia-Qwen3-4B-LoRA-Adapter es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Nova-Zero en HuggingFace, entrenado mediante fine-tuning sobre el modelo base `unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit`, que a su vez es una version cuantizada a 4 bits (bitsandbytes NF4) del Qwen3-4B-Instruct-2507 de Alibaba Qwen. No se trata por tanto de un modelo completo, sino de un conjunto de pesos adicionales que deben cargarse junto al modelo base para reproducir el comportamiento ajustado. El repositorio ocupa 0,3 GB, un tamano coherente con pesos de adaptador en precision de entrenamiento.

El interes de la ficha es limitado pero instructivo: el autor ha utilizado Unsloth para acelerar el entrenamiento (la model card afirma "2x faster"), y el resultado se distribuye bajo licencia Apache 2.0, con soporte declarado unicamente para ingles. No se documenta el dataset de entrenamiento, el numero de pasos, el rango del adaptador ni ningun resultado de evaluacion, y el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.

La relevancia practica radica en el modelo base subyacente: Qwen3-4B-Instruct-2507 es un transformer denso de aproximadamente 4.000 millones de parametros, orientado a modo "non-thinking" (sin cadena de razonamiento explicita) y con una ventana de contexto muy amplia en su configuracion original. Este adaptador concreto debe evaluarse como un ajuste de proposito desconocido sobre esa base, no como una alternativa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (modelo base Qwen3-4B-Instruct-2507) |
| Parametros totales | No disponible para el adaptador; el modelo base declara ~4.000 millones de parametros (dato heredado, no confirmado en la informacion proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base Qwen3-4B-Instruct-2507 |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors sin cuantizacion publicada; el modelo base indicado en el nombre esta cuantizado en 4 bits (bitsandbytes) |
| Idiomas soportados | Ingles (declarado en la model card y en los tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA) |
| Modelo base | unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers (tags: transformers, safetensors, text-generation-inference, unsloth, trl) |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a determinadas proyecciones del transformer base durante la inferencia (o que pueden fusionarse en los pesos originales). La arquitectura subyacente es la del modelo base referenciado: un transformer denso decoder-only de la familia Qwen3, en su variante Instruct-2507 y en la version "unsloth-bnb-4bit", que implica que el entrenamiento se realizo sobre pesos ya cuantizados a 4 bits con bitsandbytes, una tecnica habitual de QLoRA.

El autor indica que el entrenamiento se hizo con Unsloth y con TRL, pero no aporta ningun detalle adicional: no se especifica el numero de tokens de entrenamiento, la composicion del dataset, el rango y alpha del adaptador, la tasa de aprendizaje, el numero de epocas ni si hubo fases de RLHF, DPO o preferencias. Tampoco se documenta ninguna innovacion tecnica mas alla del uso de Unsloth para acelerar el proceso. En consecuencia, la reproducibilidad del ajuste es nula con la informacion disponible.

## Capacidades

- Generacion de texto conversacional: al derivar de un modelo instruct, se espera que mantenga el formato de chat y el seguimiento de instrucciones del base, aunque el ajuste concreto puede haber alterado o degradado estas capacidades.
- Razonamiento de un solo paso: el modelo base Qwen3-4B-Instruct-2507 esta disenado en modo "non-thinking", sin bloques de cadena de razonamiento extendida.
- Generacion de codigo y matematicas: capacidad heredada del modelo base, no verificada en el adaptador.
- Tool calling / function calling: no documentado en la model card del adaptador; depende de si el ajuste preserva las capacidades del base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la declaracion del autor, pese a que el modelo base original es multilingue.
- Capacidades especiales (vision, audio, thinking mode): no disponible; no se declara ninguna.
- Compatibilidad con text-generation-inference: si, aparece como tag del repositorio.

## Casos de uso

- Experimentacion academica con QLoRA: el adaptador sirve como ejemplo reproducible de fine-tuning de bajo coste sobre Qwen3-4B cuantizado, util para comparar configuraciones de Unsloth y TRL en un entorno controlado.
- Prototipado de asistentes en ingles: cargando el adaptador sobre el modelo base con transformers o vLLM, se puede desplegar un chatbot de bajo coste para pruebas internas, siempre que se valide previamente la calidad del ajuste.
- Base para fusion de adaptadores: al ser pesos LoRA, pueden fusionarse con otros adaptadores o combinarse mediante tecnicas como TIES o DARE para explorar mezclas de estilos.
- Aprendizaje de pipelines PEFT: resulta didactico para entender como se publica, carga y sirve un adaptador sobre un modelo cuantizado en 4 bits, incluyendo la conversion a GGUF para llama.cpp.
- Comparacion de estrategias de cuantizacion: permite medir la degradacion entre servir el modelo base en bf16 frente a la combinacion base 4-bit mas adaptador.
- Docencia y talleres de ajuste fino: por su tamano reducido (0,3 GB) es apropiado para ejercicios en los que el alumnado entrena y publica su propio adaptador.
- Evaluacion de riesgos de modelos no documentados: util como caso de estudio sobre que informacion minima deberia acompanar a un artefacto publicado antes de considerarlo apto para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares), y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo, la autoria o el proyecto "Lucia"; unicamente ha devuelto paginas no relacionadas (Radio Nova, el teleservicio NOVA de servicios a la persona).

## Requisitos de hardware

Las siguientes estimaciones son orientativas y corresponden al modelo base, ya que el adaptador por si solo no puede ejecutarse sin el:

- VRAM en bf16/fp16 (modelo base sin cuantizar): aproximadamente 8-9 GB para pesos, mas overhead de activaciones y cache KV.
- VRAM con cuantizacion de 4 bits (configuracion del modelo base indicado): aproximadamente 2,5-3,5 GB de pesos, con margen adicional segun la longitud de contexto.
- El adaptador anade un consumo marginal (0,3 GB en disco; en memoria depende de si se fusiona o se mantiene separado).
- GPU consumer: cabe con holgura en tarjetas de 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) si se usa la base en 4 bits; en 8 GB el margen para contexto largo es reducido.
- GPU de datacenter: A100 40/80 GB, H100, L40S y A10G son sobredimensionadas para este tamano y solo se justifican por concurrencia elevada.
- Opciones de despliegue: transformers con PEFT, vLLM, Hugging Face Text Generation Inference (el autor lo etiqueta como compatible), llama.cpp/Ollama tras fusionar el adaptador y convertir los pesos a GGUF, y servidores compatibles con la API de endpoints.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de la columna del adaptador son los declarados en su repositorio; los de los modelos alternativos proceden de su documentacion publica y no estaban incluidos en la informacion proporcionada, por lo que se ofrecen solo como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nova-Zero/Lucia-Qwen3-4B-LoRA-Adapter | Adaptador sobre base de ~4B | No disponible | Apache 2.0 | safetensors (LoRA) | Sin benchmarks, 0 descargas, solo ingles declarado |
| unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit | ~4B | No disponible en la informacion | Apache 2.0 | safetensors (4 bits) | Modelo base del adaptador |
| Qwen3-4B-Instruct-2507 (original) | ~4B | 262.144 tokens segun documentacion publica | Apache 2.0 | safetensors | Version no cuantizada del mismo modelo |
| Llama-3.2-3B-Instruct | ~3B | 128.000 tokens segun documentacion publica | Licencia comunitaria Llama 3.2 | safetensors, GGUF | Alternativa de tamano similar con licencia mas restrictiva |
| Gemma-3-4B-IT | ~4B | 128.000 tokens segun documentacion publica | Terminos de uso de Gemma | safetensors, GGUF | Alternativa de Google con licencia propia |

## Limitaciones y advertencias

- Ausencia total de documentacion de entrenamiento: no se indica dataset, hiperparametros ni criterios de seleccion, lo que impide auditar el ajuste o reproducirlo.
- Sin evaluacion: no existe ningun benchmark publicado, por lo que no hay evidencia de que el adaptador mejore al modelo base en ninguna tarea.
- Adopcion nula: 0 descargas y 0 "likes" en el momento de la consulta; tampoco se ha encontrado ningun rastro del proyecto en la busqueda web.
- Riesgo de degradacion: un ajuste no documentado sobre un modelo instruct puede reducir capacidades previas (seguimiento de instrucciones, coherencia, uso de herramientas) en lugar de mejorarlas.
- Sesgos: no disponibles. No se ha realizado ninguna evaluacion de sesgo, toxicidad o seguridad sobre este adaptador.
- Alucinacion: riesgo inherente a los modelos de ~4B; en este caso no existe ningun trabajo de alineacion documentado que lo mitigue.
- Limitacion idiomatica: el autor declara unicamente ingles, aunque el base sea multilingue; el comportamiento en castellano es desconocido y probablemente degradado.
- Contexto: la longitud util real no esta verificada y podria haberse visto reducida por el ajuste o por la cuantizacion del base.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base y sus dependencias (Unsloth, bitsandbytes, TRL) impongan condiciones adicionales.
- Caveat de produccion: no se recomienda su uso en sistemas productivos sin una evaluacion propia exhaustiva, incluida comparacion directa contra el modelo base sin adaptador.
- Fecha de publicacion: el repositorio figura creado el 2026-09-12 y actualizado el mismo dia, con 30 segundos de diferencia entre ambos sellos temporales, lo que sugiere una subida automatizada o de prueba.

## Enlaces

- HuggingFace: https://huggingface.co/Nova-Zero/Lucia-Qwen3-4B-LoRA-Adapter
- Modelo base: https://huggingface.co/unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios del autor) en la busqueda web realizada.
