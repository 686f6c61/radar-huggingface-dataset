# mradermacher/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-GGUF

## Resumen

Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-GGUF es una coleccion de cuantizaciones GGUF de un modelo de 3.429.006.336 parametros obtenido por fine-tuning de Ministral 3 3B sobre un subconjunto curado de datos de destilacion procedentes de un profesor Qwen 3.8 Max. El trabajo de cuantizacion lo firma mradermacher (nethype GmbH), mientras que el modelo afinado original lo publica el usuario xtools-at. El objetivo declarado es trasladar los patrones de respuesta y el conocimiento capturados en el dataset generado por el profesor a un modelo compacto, manejable en hardware modesto.

El modelo parte de la familia Ministral 3 de Mistral AI (variantes de 3B, 8B y 14B, descendientes de Mistral Small 3.1 mediante destilacion en cascada, con capacidades de vision y contexto de hasta 256k tokens, 128k en las variantes de razonamiento, segun el paper de la familia). Sobre esa base se aplica un fine-tuning orientado a razonamiento conversacional, y el resultado se distribuye aqui exclusivamente en formato GGUF con 12 niveles de cuantizacion mas dos ficheros mmproj para el codificador multimodal.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo de razonamiento de 3B en CPU o GPUs de consumo desde ~1,6 GB (Q2_K) hasta 7,0 GB (f16); por otro, es un ejemplo de la practica actual de destilar trazas de razonamiento de modelos grandes hacia modelos pequenos y publicar el resultado en formatos ligeros. Conviene advertir de que el repositorio no incluye benchmarks, no declara contexto oficial en su model card y acumula muy pocas descargas, por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, derivado de Ministral 3 (linaje Mistral Small 3.1 via destilacion en cascada); detalles de atencion no disponibles en la informacion proporcionada |
| Parametros totales | 3.429.006.336 |
| Parametros activos | No aplica: no se describe como MoE en la informacion disponible |
| Longitud de contexto | No disponible en la model card; el paper de la familia Ministral 3 indica hasta 128k tokens en las variantes de razonamiento y 256k en instruct/base (no confirmado para este fine-tuning) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal). Existen cuantizaciones ponderadas/imatrix en el repo i1-GGUF |
| Idiomas soportados | En (ingles) segun la model card |
| Licencia | Apache 2.0 (declarada en el repositorio de cuantizacion) |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna de este fine-tuning mas alla de su procedencia: Ministral 3 3B, un modelo denso de la familia Ministral 3, cuyos miembros descienden de Mistral Small 3.1 mediante un enfoque de destilacion en cascada y se publican en variantes base, instruct y reasoning con comprension de imagen. Aqui nos encontramos ante la variante de razonamiento, posteriormente ajustada por xtools-at sobre el dataset `saidutta69/qwen3.8-max-distillation-50k-clean`, un conjunto de aproximadamente 50.000 muestras limpias de destilacion generadas por un modelo profesor Qwen 3.8 Max. No se especifican en la informacion proporcionada el numero exacto de tokens de entrenamiento, la mezcla del dataset, ni si se aplicaron fases de RLHF o DPO.

La innovacion principal es de proceso, no de arquitectura: se destilan trazas de razonamiento de un profesor de gran tamano hacia un alumnno de 3B y se publica el resultado con cuantizaciones estaticas (no ponderadas) generadas con `quantize_version: 2` y `output_tensor_quantised: 1`. El repositorio incluye ficheros `mmproj` en Q8_0 y f16, lo que indica que se preserva el proyector multimodal del modelo base y, por tanto, la capacidad de procesar imagenes en llama.cpp y derivados. No hay informacion sobre tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de pensamiento explicitos con control de presupuesto de tokens.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, con un estilo de respuesta orientado a razonamiento por el proceso de destilacion.
- Razonamiento paso a paso: el fine-tuning se entrena sobre trazas de un profesor de razonamiento, por lo que se espera la produccion de cadenas de pensamiento antes de la respuesta final (no verificado con benchmarks en la informacion disponible).
- Comprension de imagenes: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que habilita entrada visual en runtimes compatibles.
- Capacidades matematicas y de codigo: heredadas del modelo base y del dataset de destilacion, sin evaluacion publicada que las cuantifique.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada (el modelo base Ministral 3 3B Instruct lo soporta en el ecosistema Mistral, pero no hay documentacion especifica para este fine-tuning).
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente para esta variante.
- Multilingue: limitado a ingles segun la model card; el modelo base de Mistral soporta mas idiomas, pero el fine-tuning declara solo `en`.

## Casos de uso

- **Prototipado de razonamiento en local**: ejecutar la variante Q4_K_M (2,2 GB) en un portatil con 8 GB de RAM para experimentar con cadenas de razonamiento destiladas sin depender de APIs externas.
- **Asistente conversacional de bajo coste en ingles**: desplegar Q5_K_M (2,6 GB) detras de una API compatible con OpenAI en llama.cpp u Ollama para tareas de soporte interno donde el coste por token y la privacidad priman sobre la precision bruta.
- **Clasificacion y extraccion de informacion por lotes**: procesar grandes volumenes de texto en CPU con Q3_K_M (1,9 GB) en pipelines offline, donde el throughput agregado importa mas que la latencia por peticion.
- **Descripcion de imagenes en el borde**: usar los ficheros `mmproj` junto con Q4_K_S para tareas de captioning o lectura de documentos escaneados en dispositivos sin GPU dedicada.
- **Generacion de explicaciones didacticas**: el formato de razonamiento destilado es util para producir soluciones paso a paso en entornos educativos, revisando siempre la salida por el riesgo de alucinacion de un modelo de 3B.
- **Banco de pruebas para investigacion en destilacion**: comparar la calidad de un alumno de 3B destilado de un profesor grande frente al modelo base sin ajustar, en tareas de matemáticas y logica, aprovechando los 12 niveles de cuantizacion para medir la degradacion por compresion.
- **Componente de un sistema mayor con enrutado**: emplear el modelo como primer nivel de un pipeline (por ejemplo, reformular consultas o resumir contexto largo) antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K ~1,6 GB; Q3_K_S ~1,7 GB; Q3_K_M ~1,9 GB; IQ4_XS ~2,1 GB; Q4_K_S y Q4_K_M ~2,2 GB; Q5_K_S ~2,5 GB; Q5_K_M ~2,6 GB; Q6_K ~2,9 GB; Q8_0 ~3,8 GB; f16 ~7,0 GB. Los ficheros `mmproj` anaden 0,6 GB (Q8_0) o 0,9 GB (f16) si se usa la entrada de imagen.
- Cache KV adicional segun contexto: no disponible; con los 128k tokens que el paper de la familia atribuye a las variantes de razonamiento, el consumo de cache puede superar ampliamente el de los pesos, por lo que conviene limitar `n_ctx` en produccion.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en tarjetas de 8 GB usando cuantizaciones Q4 o inferiores; tambien es viable en CPU pura y en Apple Silicon con memoria unificada.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para un modelo de 3,4B; solo tienen sentido si se sirven muchas replicas concurrentes en el mismo nodo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI basados en llama.cpp; vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles. Como referencia estructural, un modelo denso de 3,4B en Q4_K_M sobre una GPU de consumo permite decodificacion interactiva (decenas de tokens por segundo), pero no se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (mradermacher GGUF) | 3,43B | No disponible en la model card (hasta 128k en la familia para variantes de razonamiento, sin confirmar) | Razonamiento destilado de Qwen 3.8 Max sobre Ministral 3 3B | Apache 2.0 | GGUF, 12 cuantizaciones + mmproj |
| xtools-at/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled | 3,43B | No disponible | Modelo original antes de cuantizar, mismo dataset | Apache 2.0 | Safetensors y GGUF |
| mistralai/Ministral-3-3B-Instruct-2512 | ~3B (familia Ministral 3) | Hasta 256k tokens en la familia (segun el paper) | Instruct oficial de Mistral AI con vision y razonamiento | No disponible en la informacion | Pesos oficiales; soporte en vLLM |
| Ministral 3 8B / 14B | 8B / 14B | Hasta 256k (128k en razonamiento) | Misma familia, mayor capacidad | No disponible en la informacion | Pesos oficiales |

## Limitaciones y advertencias

- **Solo ingles**: la model card declara unicamente `en`; no hay evidencia de calidad en castellano ni en otros idiomas, pese a que el modelo base de Mistral es multilingue.
- **Riesgo de alucinacion elevado**: con 3,4B de parametros y entrenamiento sobre datos destilados, las cadenas de razonamiento pueden ser plausibles pero incorrectas; los errores del profesor pueden haberse imitado durante la destilacion.
- **Sin evaluacion publicada**: cero benchmarks, cero descargas y un solo "like" en el momento de la consulta; no hay senal de validacion por parte de la comunidad.
- **Contexto no documentado**: aunque el paper de la familia cita 128k para razonamiento, la model card de este fine-tuning no lo confirma; asumir esa ventana sin probarla puede provocar degradacion silenciosa.
- **Tool calling no verificado**: no hay documentacion de soporte de function calling en esta variante; no lo asumas en produccion sin pruebas.
- **Licencia y cadena de derivacion**: el repositorio declara Apache 2.0, pero al derivar de pesos de Ministral 3 conviene revisar los terminos del modelo base antes de un uso comercial, ya que la informacion disponible no aclara si se heredan restricciones adicionales.
- **Cuantizaciones de baja precision**: Q2_K y Q3_K_S degradan la coherencia del razonamiento mas que en tareas de chat simple; para uso serio, partir de Q4_K_M o superior (el autor marca Q4_K_S/Q4_K_M como "fast, recommended" y Q8_0 como mejor calidad).
- **Formato unico**: solo GGUF; no hay safetensors en este repositorio, lo que limita el despliegue en vLLM o TGI sin recurrir al modelo base.
- **Fecha y trazabilidad**: el repositorio se creo el 27 de octubre de 2026 y no incluye informacion sobre volumen de datos, hiperparametros ni proceso de limpieza del dataset mas alla de su nombre.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-GGUF
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-GGUF
- Modelo base del fine-tuning: https://huggingface.co/xtools-at/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled
- Version GGUF del autor del fine-tuning: https://huggingface.co/xtools-at/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-GGUF
- Dataset de destilacion: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Modelo oficial Ministral 3 3B Instruct: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Documentacion de Mistral AI sobre Ministral 3 3B: https://docs.mistral.ai/models/ministral-3-3b-25-12
- Paper de la familia Ministral 3 (HTML): https://arxiv.org/html/2601.08584v1
- Paper de la familia Ministral 3 (PDF): https://arxiv.org/pdf/2601.08584
- Guia sobre uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
