# optimum-intel-internal-testing/tiny-random-ministral3

## Resumen

`optimum-intel-internal-testing/tiny-random-ministral3` es un artefacto de prueba (fixture) generado de forma sintetica por la organizacion `optimum-intel-internal-testing`, utilizada por el proyecto Optimum de Hugging Face para alojar modelos internos de validacion. No es un modelo entrenado ni esta destinado a inferencia real: sus pesos se inicializan de forma aleatoria con una semilla fija (SEED = 42) y su proposito es reproducir la topologia de un modelo multimodal de la familia Mistral 3 en un tamano minimo de 16.995.776 parametros (aproximadamente 0,1 GB en disco).

El artefacto implementa la clase `Mistral3ForConditionalGeneration`: un envoltorio multimodal que combina una torre de vision de tipo Pixtral con un decodificador de texto cuyo `model_type` es `ministral3` y que emplea RoPE con escalado YaRN. Se genera recortando la configuracion del modelo real `mistralai/Ministral-3-3B-Reasoning-2512` hasta 2 capas por torre, y despues se valida recargando el artefacto y ejecutando una generacion de humo con una imagen sintetica de 56x56 pixeles.

Su relevancia es exclusivamente de ingenieria: permite ejecutar tests de integracion del stack Optimum/transformers (`transformers >= 5.0.0`) en segundos y sin GPU, algo inviable con el modelo base de 3B. No debe emplearse para tareas de produccion, evaluacion de calidad ni benchmarks de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Mistral3ForConditionalGeneration` (multimodal: decodificador de texto Ministral3 + torre de vision Pixtral); `model_type` raiz `mistral3`, `text_config.model_type` `ministral3` |
| Parametros totales | 16.995.776 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (`text_config.max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (pesos en `float32`; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`safe_serialization=True`), mas `config.json` y artefactos de processor |
| Tamano del repositorio | 0,1 GB |
| Tipo de dato de los pesos | float32 |
| Capas del decodificador de texto | 2 (`num_hidden_layers`), `hidden_size` 64, `intermediate_size` 128 |
| Capas de la torre de vision | 2 (`num_hidden_layers`), `hidden_size` 64, `intermediate_size` 128, `image_size` 56 |
| Modelo base de referencia | `mistralai/Ministral-3-3B-Reasoning-2512` |

## Arquitectura y entrenamiento

No existe entrenamiento. La configuracion se obtiene con `AutoConfig.from_pretrained("mistralai/Ministral-3-3B-Reasoning-2512")` y se reduce: el decodificador de texto queda en 2 capas, `hidden_size` 64, `intermediate_size` 128, 4 cabezas de atencion y 2 cabezas KV (atencion con query agrupada, GQA), con `head_dim` 16. Se desactiva el amarre de embeddings (`tie_word_embeddings = False`) tanto en la configuracion raiz como en `text_config`, y todos los submodulos se fijan a `float32`.

La innovacion tecnica que el fixture preserva es la ruta de RoPE con escalado YaRN: se conserva `rope_type == "yarn"` con todos sus campos y solo se reescala `original_max_position_embeddings` a 32, de modo que el producto factor x original coincide con `max_position_embeddings` = 512. La torre de vision replica la estructura Pixtral con 2 capas, `hidden_size` 64, 4 cabezas, `head_dim` 16 e `image_size` 56, y el processor hereda del modelo base sobrescribiendo `image_processor.size = {"longest_edge": 56}`. Tras el guardado, el script relee el artefacto y comprueba tres invariantes (`model_type == "mistral3"`, `text_config.model_type == "ministral3"`, `rope_type == "yarn"`) antes de ejecutar una generacion de 5 tokens con `do_sample=False` sobre una imagen RGB gris de 56x56. No hay datos de entrenamiento, ni RLHF, ni DPO, ni tokenizador propio.

## Capacidades

- Generacion de texto: tecnicamente ejecutable (la ruta `generate` funciona), pero la salida es incoherente porque los pesos son aleatorios.
- Procesamiento multimodal imagen-texto: soporta `apply_chat_template` con contenido de tipo imagen y `AutoProcessor` con entrada de imagen de hasta 56x56 pixeles (limite impuesto por el fixture).
- Validacion de arquitectura: reproduce fielmente las rutas de codigo de un VLM Mistral 3 (configuraciones anidadas, YaRN, safetensors, processor multimodal).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (sin tokenizador propio ni evaluacion).
- Modo de razonamiento (`thinking mode`), audio u otras capacidades especiales: no disponible.
- No apto para evaluacion de calidad, sesgos o alineacion.

## Casos de uso

- Tests de integracion en CI del stack Optimum/transformers: el modelo se carga, se ejecuta un forward y una generacion corta en CPU en cuestion de segundos, lo que permite validar en cada commit las rutas de `Mistral3ForConditionalGeneration` sin depender de un modelo de 3B.
- Verificacion de carga de configuraciones multimodales anidadas: util para comprobar que `text_config` y `vision_config` se resuelven correctamente y que `model_type` se preserva al serializar y deserializar.
- Pruebas de compatibilidad de versiones (`transformers >= 5.0.0`): sirve como caso minimo que falla de forma rapida si una version no reconoce el `model_type` `ministral3` o el `model_type` raiz `mistral3`.
- Regresion de la ruta RoPE YaRN: los `assert` del script de creacion garantizan que `rope_type == "yarn"` y que el reescalado de `original_max_position_embeddings` es coherente con `max_position_embeddings`.
- Pruebas de serializacion safetensors: el artefacto permite validar guardado y recarga en `safe_serialization=True` con presupuesto de parametros y bytes acotado.
- Smoke tests de processor multimodal: valida `apply_chat_template` con mensajes que mezclan imagen y texto, y la integracion con PIL para imagenes de 56x56.
- Pruebas de exportacion y cuantizacion con Optimum: al ser un modelo diminuto en float32, se puede usar para comprobar flujos de conversion (ONNX, OpenVINO, IPEX) sin requisitos de VRAM.
- Validacion de plantillas de chat y formato de prompt para modelos Ministral 3 antes de escalar al modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de pesos aleatorios sin entrenamiento, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, MMMU, etc.) careceria de significado.

## Requisitos de hardware

- Peso de los parametros en `float32`: 16.995.776 x 4 bytes, aproximadamente 68 MB; el repositorio completo ocupa 0,1 GB.
- VRAM estimada para inferencia: menos de 1 GB, incluyendo activaciones; ejecutable integramente en CPU y en memoria RAM.
- GPU recomendadas: no requiere GPU. Funciona en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en GPUs integradas; tambien en Apple Silicon y en CPU x86.
- Cabe en cualquier GPU consumer, con un consumo de memoria despreciable frente a otros modelos del mismo repositorio interno.
- Opciones de despliegue: `transformers >= 5.0.0` con `AutoModelForImageTextToText` y `AutoProcessor`. No se publican artefactos para vLLM, llama.cpp, Ollama, TGI, ONNX ni OpenVINO.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, la generacion de unos pocos tokens en CPU es del orden de milisegundos a pocos segundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | Disponibilidad |
|---|---|---|---|---|---|
| `optimum-intel-internal-testing/tiny-random-ministral3` | 16.995.776 | 512 tokens | apache-2.0 | Fixture de test multimodal | Hugging Face |
| `mistralai/Ministral-3-3B-Reasoning-2512` | no disponible (el nombre sugiere 3B) | no disponible | no disponible | Modelo real de razonamiento multimodal del que se deriva la configuracion | Referenciado como base en el script; no verificado en la informacion disponible |
| Otros fixtures `tiny-random-*` de la misma organizacion | no disponible | no disponible | no disponible | Pruebas internas de Optimum | no disponible |

No se han identificado en la informacion proporcionada otros modelos comparables con datos verificables de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: las salidas de texto no tienen sentido y no deben mostrarse a usuarios ni usarse para evaluar capacidades.
- Sin entrenamiento ni ajuste: no hay datos de preentrenamiento, RLHF ni DPO; no es posible evaluar sesgos ni alineacion.
- El tokenizador y el processor no se han reentrenado: se heredan del modelo base `mistralai/Ministral-3-3B-Reasoning-2512` con solo el tamano de imagen modificado, por lo que el vocabulario efectivo del fixture no esta adaptado a sus dimensiones.
- Contexto limitado a 512 tokens y vision limitada a `longest_edge` de 56 pixeles: no representa la capacidad real de un Mistral 3.
- Licencia apache-2.0: permite uso comercial del artefacto, pero el modelo carece de utilidad practica fuera de pruebas; conviene ademas revisar los terminos del modelo base si se reutiliza su processor.
- Dependencia estricta de `transformers >= 5.0.0`; en versiones anteriores la carga puede fallar por falta de soporte del `model_type` `ministral3`.
- No hay model card descriptiva: el README contiene unicamente el script generador, sin tabla de benchmarks, idiomas soportados ni pipeline declarado.
- Riesgo de confusion con los modelos oficiales Ministral 3: el nombre y la licencia pueden inducir a error si se referencian sin comprobar el autor.
- Sin soporte declarado para tool calling, agentes, cuantizacion o despliegue en servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/optimum-intel-internal-testing/tiny-random-ministral3
- Modelo base referenciado en el script de creacion: https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los enlaces obtenidos corresponden a una empresa francesa de puertas de armario y a un proveedor de servicios de internet, por lo que no se incluyen.
