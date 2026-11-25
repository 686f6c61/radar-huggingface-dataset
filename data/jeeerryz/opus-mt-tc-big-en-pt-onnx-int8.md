# JeeerryZ/opus-mt-tc-big-en-pt-onnx-int8

## Resumen

`JeeerryZ/opus-mt-tc-big-en-pt-onnx-int8` es una conversion al formato ONNX con pesos almacenados en 8 bits del modelo de traduccion automatica `Helsinki-NLP/opus-mt-tc-big-en-pt`, desarrollado originalmente por el grupo Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. La conversion la firma el usuario JeeerryZ y no esta afiliada ni respaldada por los autores originales. El modelo traduce de ingles a portugues, con control explicito del registro dialectal mediante los prefijos `>>pob<<` (portugues de Brasil) y `>>por<<` (portugues europeo).

La relevancia de esta version concreta no esta en la calidad de traduccion, que hereda del modelo base Marian, sino en el empaquetado: exporta el encoder y un decoder sin cache de clave/valor a ONNX, almacena los pesos en int8 con una escala por canal y los restaura a float32 dentro del grafo, de modo que el calculo sigue siendo float32. El repositorio ocupa aproximadamente 0,2 GB, lo que lo hace apto para despliegue en entornos con recursos limitados o en CPU.

La model card reporta una perdida de calidad marginal frente al modelo en float32: sobre una muestra de 200 segmentos del conjunto WMT24++ `en-pt_BR`, el chrF con pesos de 8 bits se mantiene dentro de 0,1 puntos del original (greedy 54,86 frente a 54,85; beam 4 58,23 frente a 58,33). No se dispone de informacion sobre el numero de parametros ni sobre la longitud de contexto en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos almacenados en int8 (una escala por canal), restaurados a float32 en el grafo |
| Idiomas soportados | Ingles (en) y portugues (pt), con control de variante `>>pob<<` / `>>por<<` |
| Licencia | CC-BY 4.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_corte.onnx`, pesos en `onnx/pesos.bin`) |

## Arquitectura y entrenamiento

El modelo base es un Marian, la arquitectura de traduccion automatica neuronal de tipo transformer encoder-decoder desarrollada por la Universidad de Helsinki para el proyecto OPUS-MT. El sufijo `tc-big` indica que pertenece a la familia de modelos grandes del Tatoeba Translation Challenge, entrenados sobre datos paralelos agregados del ecosistema OPUS. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, de la composicion exacta del dataset ni de si se aplicaron tecnicas de RLHF o DPO (no habituales en este tipo de modelos de traduccion).

La innovacion tecnica de esta version es el empaquetado para inferencia. El decoder exportado no mantiene cache de clave/valor: en su lugar recibe una entrada adicional `pos` y calcula los logits de una unica posicion (salida `logits_t`), devolviendo ademas la atencion cruzada de la cuarta capa del decoder en esa posicion (salida `atencao_t4`), lo que resulta util para alineamiento a nivel de palabra. La tabla de embeddings compartida se almacena una sola vez y se escala por token. En DirectML es necesario fijar las dimensiones libres (`batch_size`, `encoder_sequence_length`, `decoder_sequence_length`) al crear la sesion.

## Capacidades

- Traduccion automatica de texto de ingles a portugues.
- Seleccion de variante dialectal mediante prefijos en la frase de origen: `>>pob<<` para portugues de Brasil y `>>por<<` para portugues europeo.
- Inferencia en formato ONNX, ejecutable con ONNX Runtime en CPU y GPU, incluido el proveedor DirectML en Windows.
- Extraccion de atencion cruzada de la cuarta capa del decoder para alineamiento de palabras entre origen y destino.
- Decodificacion greedy y con beam search (la model card reporta resultados con beam 4).
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es un modelo de traduccion puro.
- Capacidad multilingue limitada al par en-pt; no cubre otras direcciones.

## Casos de uso

- Traduccion de documentacion tecnica de ingles a portugues en pipelines de CI/CD: el modelo puede invocarse como paso de un proceso automatizado de localizacion, con la variante dialectal fijada por configuracion (`>>pob<<` o `>>por<<`) segun el mercado objetivo.
- Localizacion de interfaces y cadenas de producto: al ocupar unos 0,2 GB y ejecutarse en ONNX Runtime, puede desplegarse en el mismo servidor de aplicaciones o incluso en entornos de escritorio sin GPU dedicada.
- Traduccion por lotes de catalogos y contenidos de comercio electronico: el encoder ONNX acepta lotes (`batch_size` configurable) y el decoder sin cache permite controlar el bucle de generacion token a token desde el codigo de la aplicacion.
- Alineamiento de palabras para memorias de traduccion y glosarios: la salida `atencao_t4` de la cuarta capa del decoder permite derivar correspondencias entre terminos origen y destino, util para construir glosarios bilingues o validar terminologia.
- Traduccion en el navegador o en el borde (edge): el formato ONNX con pesos int8 y el reducido tamano del repositorio permiten ejecutar el modelo con ONNX Runtime Web o en dispositivos con recursos limitados.
- Prototipado e investigacion en traduccion automatica: sirve como linea base reproducible en float32-equivalente para experimentos de decodificacion, comparacion de estrategias de cuantizacion o evaluacion de alineamiento.
- Servicio de traduccion de bajo coste en CPU: para volumenes moderados de texto, la inferencia en CPU con ONNX Runtime evita el coste de GPU manteniendo una calidad chrF cercana a la del modelo original.

## Benchmarks y rendimiento

La model card unicamente reporta la comparacion entre pesos de 8 bits y float32 sobre una muestra de 200 segmentos del conjunto WMT24++ `en-pt_BR`, medida con chrF:

| Configuracion | chrF int8 | chrF float32 |
|---|---|---|
| Greedy | 54,86 | 54,85 |
| Beam 4 | 58,23 | 58,33 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con otros sistemas de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa aproximadamente 0,2 GB, por lo que la huella en memoria es reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o DirectML); no se requiere hardware de gama alta.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML), con sesiones configurando explicitamente `batch_size`, `encoder_sequence_length` y `decoder_sequence_length` cuando se use DirectML. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato y arquitectura.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| JeeerryZ/opus-mt-tc-big-en-pt-onnx-int8 | no disponible | no disponible | ONNX int8 | CC-BY 4.0 | Version cuantizada del modelo Helsinki-NLP |
| Helsinki-NLP/opus-mt-tc-big-en-pt | no disponible | no disponible | safetensors / PyTorch | CC-BY 4.0 | Modelo base original, referencia de calidad float32 |
| Otros modelos OPUS-MT en-pt de la familia tc | no disponible | no disponible | varios | CC-BY 4.0 | Variantes de tamano y dominio del mismo proyecto |

No se dispone en la informacion proporcionada de datos suficientes para comparar con alternativas de otros proyectos (por ejemplo, NLLB o M2M-100) en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo traduce ingles a portugues; no cubre la direccion inversa ni otros pares de idiomas.
- Es una conversion no oficial: el repositorio no esta afiliado ni respaldado por los autores originales del modelo, por lo que la responsabilidad sobre el empaquetado recae en el autor de la conversion.
- El decoder exportado no mantiene cache de clave/valor, lo que implica recalcular estados en cada paso y puede penalizar el throughput en secuencias largas frente a implementaciones con cache.
- En DirectML es obligatorio fijar las dimensiones libres al crear la sesion; de lo contrario la inferencia puede fallar o comportarse de forma inesperada.
- La cuantizacion int8 introduce una degradacion minima pero medible (hasta 0,1 puntos de chrF en la muestra evaluada); en dominios muy especializados la diferencia podria ser mayor y no esta evaluada.
- Riesgo de alucinacion y de traducciones fluidas pero incorrectas en terminologia especializada, comun en modelos de traduccion neuronales; se recomienda validacion humana en contenidos criticos.
- Sesgos conocidos: no se documentan en la informacion disponible; los sesgos del corpus OPUS subyacente se heredan del modelo base.
- Licencia CC-BY 4.0: permite uso comercial con atribucion; es necesario citar el trabajo original (OPUS-MT y Tatoeba Translation Challenge) segun indica la model card.
- El modelo fue creado y actualizado en noviembre de 2026 segun los metadatos del repositorio; no hay historial de mantenimiento ni garantias de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JeeerryZ/opus-mt-tc-big-en-pt-onnx-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-pt
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Licencia CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Paper OPUS-MT: https://aclanthology.org/2020.eamt-1.61/
- Paper Tatoeba Translation Challenge: https://aclanthology.org/2020.wmt-1.139/
