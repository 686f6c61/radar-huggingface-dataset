# mradermacher/Ministral-3-8B-Claude-Opus-Reasoning-Distilled-i1-GGUF

## Resumen

Ministral-3-8B-Claude-Opus-Reasoning-Distilled-i1-GGUF es un conjunto de cuantizaciones GGUF generadas por mradermacher a partir del modelo xtools-at/Ministral-3-8B-Claude-Opus-Reasoning-Distilled, un fine-tune de Ministral 3 8B (Mistral AI) especializado en razonamiento con cadena de pensamiento. El modelo parte de una base densa de 8.489.553.920 parámetros (unos 8,5 mil millones) y ha sido ajustado mediante LoRA sobre trazas de razonamiento destiladas de modelos Claude Opus 4.6, Claude Opus 4.5 y Claude Sonnet 4.5, segun los datasets declarados en la model card.

El problema que aborda es concreto: obtener un modelo de 8B que pueda ejecutarse en hardware de consumo y que muestre patrones de razonamiento extendido (chain-of-thought) similares a los de modelos propietarios mucho mayores. La propuesta de valor de este repositorio en particular no es el entrenamiento, sino la distribucion: ofrece cuantizaciones con imatrix en el rango de 2,2 GB a ~5 GB o mas, lo que permite desplegar el modelo en GPUs consumer, portatiles o incluso CPU con llama.cpp.

Es relevante ahora porque combina tres tendencias: destilacion de razonamiento desde modelos frontera, modelos pequenos con capacidades multimodales (la model card lo describe como vision model, con ficheros mmproj en el repositorio estatico) y el ecosistema GGUF/imatrix que abarata el despliegue local. El repositorio es de octubre de 2026, cuenta con 0 descargas y 1 like en el momento de la consulta, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral 3 (tag `mistral3`), transformer denso; se describe como modelo con capacidad de vision |
| Parametros totales | 8.489.553.920 (~8,5B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ4_NL (small), entre otras listadas en la model card; tambien se incluye el fichero imatrix |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base se publica en safetensors |

## Arquitectura y entrenamiento

La arquitectura de base es Ministral 3 en su variante de 8B, una familia de transformers densos de Mistral AI identificada en los tags del repositorio como `mistral3` y compatible con `mistral-common`. Esta cuantizacion no modifica la arquitectura: mradermacher aplica cuantizacion con importancia matrix (imatrix) sobre los pesos del fine-tune, generando variantes i1 en el rango de 2,2 GB (IQ1_S) a 5,0 GB (Q4_0 e IQ4_NL) para los niveles mostrados en la model card, con el resto de niveles superiores hasta Q6_K. El repositorio completo ocupa 99,0 GB, suma de todas las variantes publicadas.

El entrenamiento del modelo base consistio, segun los metadatos, en un ajuste LoRA (tag `unsloth`, `lora`) orientado a destilar razonamiento (`reasoning-distillation`) a partir de cuatro datasets de trazas: TeichAI/Claude-Opus-4.6-Reasoning-887x, TeichAI/claude-4.5-opus-high-reasoning-250x, TeichAI/claude-sonnet-4.5-high-reasoning-250x y Roman1111111/claude-opus-4.6-10000x. La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases posteriores de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion (especulativa, attention linear) ni variantes de atencion mas alla de lo que aporta la arquitectura Mistral 3 original.

## Capacidades

- Generacion de texto conversacional en ingles (`text-generation`, `conversational`).
- Razonamiento con cadena de pensamiento explicita, heredado de la destilacion de trazas de Claude Opus y Claude Sonnet.
- Capacidad multimodal de vision: la model card indica explicitamente que es un modelo de vision y que los ficheros `mmproj` se alojan en el repositorio estatico de cuantizaciones.
- Ajuste fino sobre dominio de razonamiento de alta calidad (matematicas, logica, problemas multi-paso), derivado del tipo de datos de destilacion empleados.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su integracion en infraestructura de inferencia existente.
- Soporte de cuantizacion agresiva hasta IQ1_S, pensado para entornos con memoria muy limitada.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes o modo thinking con tokens de control separados.

## Casos de uso

- Razonamiento local en portatil: con la variante i1-Q4_K_M o IQ4_XS (en torno a 4,8-5,1 GB) el modelo cabe en GPUs consumer de 8 GB, permitiendo ejecutar tareas de razonamiento paso a paso sin conexion a servicios externos.
- Prototipado de pipelines de razonamiento: usar las trazas chain-of-thought destiladas para evaluar como se comporta un modelo de 8B en problemas de logica y matematicas antes de escalar a un modelo mayor, con coste de inferencia muy bajo.
- Procesamiento por lotes en CPU: las variantes IQ2_M o Q2_K (3,2-3,5 GB) permiten ejecutar el modelo en servidores sin GPU mediante llama.cpp, util para clasificacion y resumen de texto en volumen.
- Analisis de documentos con imagen: al ser un modelo de vision, puede emplearse con los ficheros `mmproj` del repositorio estatico para tareas de extraccion de informacion a partir de capturas, diagramas o formularios escaneados, siempre que se valide la calidad real en ese dominio.
- Asistente de depuracion y explicacion de codigo: el modelo puede razonar sobre fragmentos de codigo y producir explicaciones paso a paso, aprovechando el estilo de razonamiento destilado; conviene validar empiricamente el rendimiento en generacion de codigo, ya que no hay benchmarks publicados.
- Entorno educativo y de investigacion: sirve como caso de estudio de destilacion de razonamiento desde modelos propietarios a modelos abiertos de 8B, con licencia Apache 2.0 que permite redistribucion y modificacion.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye el fichero imatrix y una escalera completa de cuantizaciones, lo que permite medir la degradacion de calidad frente al coste de memoria en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, ni para el modelo base ni para las variantes cuantizadas.

## Requisitos de hardware

- VRAM estimada (calculada a partir de los tamanos publicados, sin margen de contexto ni cache KV): IQ1_S 2,2 GB; IQ1_M 2,4 GB; IQ2_XXS 2,6 GB; IQ2_XS 2,8 GB; IQ2_S 3,0 GB; IQ2_M y Q2_K_S 3,2 GB; Q2_K 3,5 GB; IQ3_XXS 3,6 GB; IQ3_XS 3,8 GB; Q3_K_S e IQ3_S 4,0 GB; IQ3_M 4,1 GB; Q3_K_M 4,3 GB; Q3_K_L 4,7 GB; IQ4_XS 4,8 GB; Q4_0 e IQ4_NL 5,0 GB. Los niveles Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M y Q6_K no aparecen con tamano en el fragmento de model card disponible, aunque por su posicion en la escalera quedan por encima de 5 GB.
- Pesos en precision completa: aproximadamente 17 GB en FP16 (calculo a partir de 8.489.553.920 parametros), sin contar cache de atencion ni overhead del runtime.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070) puede alojar las variantes de 4-5 bits; con 16-24 GB (RTX 4080, RTX 4090, A5000) se pueden usar Q6_K o precision completa y ampliar contexto.
- Cabe en GPU consumer: si, en todas las variantes cuantizadas listadas, incluidas GPUs de 4-6 GB si se aceptan IQ1/IQ2 con la perdida de calidad que el propio autor advierte ("for the desperate", "mostly desperate").
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, KoboldCpp) al ser formato GGUF; tambien servidores compatibles con endpoints segun el tag `endpoints_compatible`. No se documenta soporte de vLLM o TGI para estas cuantizaciones en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las variantes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Ministral-3-8B-Claude-Opus-Reasoning-Distilled-i1-GGUF (este) | 8,5B | No disponible | Apache 2.0 | GGUF (i1, imatrix) | Cuantizaciones con imatrix de 2,2 GB en adelante; vision via mmproj en repo estatico |
| xtools-at/Ministral-3-8B-Claude-Opus-Reasoning-Distilled | 8,5B | No disponible | Apache 2.0 | Safetensors | Modelo base del que derivan estas cuantizaciones; requiere runtime completo |
| mradermacher/Ministral-3-8B-Claude-Opus-Reasoning-Distilled-GGUF | 8,5B | No disponible | Apache 2.0 | GGUF (cuantizaciones estaticas) | Misma base, cuantizacion sin imatrix; incluye los ficheros mmproj |
| Ministral 3 8B (Mistral AI, modelo original) | ~8B | No disponible | No disponible en la informacion proporcionada | Safetensors | Modelo generalista sin destilacion de razonamiento de Claude |

## Limitaciones y advertencias

- Idiomas: cobertura declarada unicamente en ingles. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; conviene determinarla empiricamente antes de disenar aplicaciones que dependan de ventanas largas.
- Alucinacion: es un modelo de 8B destilado sobre trazas de modelos frontera; puede reproducir el estilo de razonamiento aprendido sin garantizar la correccion factual. No hay evaluaciones publicadas de fidelidad.
- Riesgo de sobreajuste al formato: al haberse entrenado sobre datasets de razonamiento muy concretos, puede producir cadenas de pensamiento largas o redundantes en consultas simples.
- Cuantizaciones extremas: el propio autor etiqueta IQ1_S como "for the desperate", IQ1_M como "mostly desperate" y Q2_K_S como "very low quality". No se recomienda su uso en produccion.
- Vision: la model card menciona que es un modelo de vision y que los ficheros mmproj estan en el repositorio estatico, pero no se aportan detalles sobre resolucion de imagen, numero de tokens visuales ni calidad en tareas multimodales.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de Ministral 3, cuyos terminos no se detallan en la informacion disponible; conviene verificar la licencia del modelo original antes de un despliegue comercial.
- Madurez del repositorio: 0 descargas y 1 like en el momento de la consulta, publicado en octubre de 2026; no hay evidencia de validacion por parte de la comunidad.
- Ausencia de benchmarks: no existen datos publicados de MMLU, GSM8K, HumanEval ni evaluaciones de seguridad, por lo que cualquier afirmacion de rendimiento seria especulativa.

## Enlaces

- Repositorio HuggingFace (esta cuantizacion): https://huggingface.co/mradermacher/Ministral-3-8B-Claude-Opus-Reasoning-Distilled-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Ministral-3-8B-Claude-Opus-Reasoning-Distilled-GGUF
- Modelo base: https://huggingface.co/xtools-at/Ministral-3-8B-Claude-Opus-Reasoning-Distilled
- Pagina de descargas del autor: https://hf.tst.eu/model#Ministral-3-8B-Claude-Opus-Reasoning-Distilled-i1-GGUF
- Dataset TeichAI/Claude-Opus-4.6-Reasoning-887x: https://huggingface.co/datasets/TeichAI/Claude-Opus-4.6-Reasoning-887x
- Dataset TeichAI/claude-4.5-opus-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset TeichAI/claude-sonnet-4.5-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/claude-sonnet-4.5-high-reasoning-250x
- Dataset Roman1111111/claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
