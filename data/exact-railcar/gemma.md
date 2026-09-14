# exact-railcar/gemma

## Resumen
El repositorio `exact-railcar/gemma` es una publicacion de la comunidad subida por el usuario `exact-railcar` el 14 de septiembre de 2026. A partir de la model card se deduce que se trata de una copia cuantizada a 4 bits de `google/gemma-4-31B-it`: el autor descarga el modelo original con `snapshot_download`, lo carga con `Gemma4ForConditionalGeneration` aplicando `BitsAndBytesConfig` en NF4 y lo vuelve a publicar en su propio repositorio. Por tanto, no es un entrenamiento nuevo ni un ajuste fino, sino una redistribucion cuantizada del modelo base de Google.

El repositorio contiene 31.273.088.876 parametros en formato safetensors y ocupa 19,7 GB, un tamano coherente con una cuantizacion de 4 bits de un modelo de aproximadamente 31.000 millones de parametros. La presencia de `Gemma4Processor` y de la clase de generacion condicional indica que el modelo base es multimodal, es decir, capaz de procesar entradas de imagen y texto, aunque la informacion disponible no detalla la ventana de contexto, los idiomas soportados ni la licencia de redistribucion.

Su relevancia practica es limitada por el momento: acumula 19 descargas y 0 likes, no tiene pipeline declarado ni model card descriptiva (solo aparece el script de subida). Resulta util unicamente como artefacto de conveniencia para quien quiera una version pre-cuantizada del gemma-4-31B-it sin repetir el proceso, asumiendo el riesgo de que no se documenten cambios, licencia ni condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es Gemma 4, transformer multimodal, segun la model card) |
| Parametros totales | 31.273.088.876 (dato real, safetensors) |
| Parametros activos | no disponible (no se especifica si es MoE; Gemma 4 no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits NF4 (bitsandbytes, `bnb_4bit_quant_type='nf4'`, `bnb_4bit_compute_dtype=torch.bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuantizados con bitsandbytes) |

## Arquitectura y entrenamiento
No se aporta informacion propia sobre arquitectura o entrenamiento: el repositorio es una redistribucion de `google/gemma-4-31B-it`. La model card solo contiene el script con el que el autor genero el repositorio. Ese script revela tres datos tecnicos: (1) el modelo base es el variante instruct (`-it`) de Gemma 4 de 31B parametros; (2) se carga con la clase `Gemma4ForConditionalGeneration`, lo que implica un transformer con cabecera de generacion condicional y, por tanto, soporte multimodal; y (3) la cuantizacion se aplica sobre los pesos del modelo base en lugar de entrenar una version nueva.

No hay evidencia en la informacion proporcionada de ajuste por RLHF, DPO, destilacion ni de ninguna innovacion tecnica anadida por el autor. El unico cambio respecto al modelo original es la cuantizacion a 4 bits con NF4, una tecnica de cuantizacion de punto flotante normal de 4 bits que reduce el uso de memoria a costa de una perdida de precision que no se cuantifica en el repositorio.

## Capacidades
No se documentan capacidades de forma explicita en la informacion disponible. A partir de la clase y el procesador utilizados en el script de subida se puede inferir, con cautela, lo siguiente:

- Generacion de texto condicionada por instrucciones, heredada de la variante instruct del modelo base.
- Procesamiento de entradas multimodales (texto e imagen), dado el uso de `Gemma4Processor` junto a `Gemma4ForConditionalGeneration`; el detalle de que modalidades exactas soporta no esta disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

Es importante subrayar que estas capacidades son inferidas del modelo base referenciado, no verificadas en este repositorio, y que la cuantizacion a 4 bits puede degradarlas sin que exista ninguna evaluacion publicada.

## Casos de uso
- Evaluacion de un modelo multimodal de ~31B en una estacion de trabajo con una sola GPU de 24 GB: el repositorio permite cargar la version 4 bits sin repetir el proceso de cuantizacion, util para pruebas de concepto y comparativas rapidas frente al modelo base en precision completa.
- Prototipado de asistentes con entrada de imagen y texto: si se confirma el soporte multimodal heredado, serviria para tareas como descripcion de imagenes o respuesta a preguntas sobre documentos escaneados en entornos de desarrollo.
- Experimentacion academica con tecnicas de cuantizacion: sirve como artefacto concreto para medir la degradacion de NF4 frente a bfloat16 en un modelo de 31B, comparando salidas sobre el mismo conjunto de prompts.
- Despliegue en local para generacion de texto asistida: con 19,7 GB de pesos, es viable en GPUs de 24 GB para inferencia interactiva de un solo usuario, por ejemplo asistentes de redaccion o resumen de documentos.
- Base para posteriores ajustes finos con QLoRA: al estar ya en 4 bits NF4, es directamente utilizable como punto de partida para adaptadores de bajo rango en hardware de gama alta de consumo.
- Integracion en pipelines de investigacion reproducibles: el repositorio permite fijar una revision concreta de un modelo cuantizado sin depender del proceso de cuantizacion en tiempo de carga.
- Comparacion de latencia y consumo de memoria entre cuantizaciones: sirve para obtener mediciones de VRAM y throughput de un modelo de 31B en 4 bits frente a alternativas en 8 bits o en precision completa.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, ni comparaciones con el modelo base en precision completa. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos ocupan aproximadamente 19,7 GB, por lo que se necesita una GPU con al menos 24 GB de VRAM para cargar el modelo con un contexto reducido. La memoria adicional para la cache KV depende de la longitud de contexto, que no esta documentada.
- GPU recomendadas: RTX 3090, RTX 4090, L40S o A6000 (24-48 GB) para inferencia de un solo usuario; A100 40/80 GB o H100 para contextos largos, mayor concurrencia o servicio multiusuario.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de 24 GB (RTX 3090, 4090) en 4 bits con contexto limitado; en GPUs de 16 GB o menos no cabe sin descarga parcial a CPU o cuantizaciones adicionales.
- Opciones de despliegue: el script de la model card usa `transformers` con `bitsandbytes` y `device_map='auto'`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores; al ser pesos cuantizados con bitsandbytes no hay conversion a GGUF publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `exact-railcar/gemma` | 31,27B | no disponible | 4 bits NF4 (bitsandbytes) | no disponible | Repositorio comunitario, 19 descargas |
| `google/gemma-4-31B-it` (modelo base) | ~31B (segun la model card) | no disponible | Precision completa (referencia) | no disponible | Repositorio oficial de Google, referenciado en la model card |
| Otras alternativas de ~30B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de ninguna de las alternativas, por lo que la comparativa se limita a parametros, formato y disponibilidad. La unica diferencia verificable entre este repositorio y su modelo base es la cuantizacion a 4 bits; no hay evidencia de mejora alguna.

## Limitaciones y advertencias
- Ausencia total de model card descriptiva: el README solo contiene el script de subida, sin documentar uso previsto, limitaciones ni evaluaciones.
- Licencia no declarada: se desconoce bajo que terminos se redistribuye el modelo. Al derivar de un modelo de Google, es probable que herede condiciones de uso especificas, pero no estan confirmadas en la informacion disponible; esto es un riesgo legal para uso comercial.
- Riesgo de alucinacion: no evaluado. No hay ninguna metrica de fidelidad ni de tasas de error publicada.
- Degradacion por cuantizacion: la conversion a 4 bits NF4 introduce perdida de precision sin que exista una evaluacion cuantitativa frente al modelo en bfloat16.
- Soporte de idiomas y longitud de contexto desconocidos: impide planificar despliegues multilingues o con ventanas de contexto largas.
- Origen comunitario y baja adopcion: 19 descargas y 0 likes; no hay garantia de mantenimiento, actualizaciones ni soporte.
- Ausencia de pipeline declarado: no se indica la tarea principal en los metadatos de HuggingFace, lo que complica el uso directo con `pipeline()`.
- Fecha de publicacion (septiembre de 2026) y actualizacion el mismo dia: el repositorio no ha recibido mantenimiento posterior segun los metadatos.
- No se documenta compatibilidad con motores de inferencia habituales (vLLM, TGI, llama.cpp), lo que limita las opciones de despliegue en produccion.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/exact-railcar/gemma
- Modelo base referenciado en la model card: https://huggingface.co/google/gemma-4-31B-it
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a un software de gestion empresarial (Exact), a definiciones de diccionario y a un sitio de pronosticos deportivos, sin relacion con el repositorio.
