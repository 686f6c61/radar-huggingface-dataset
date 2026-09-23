# skillsafe-ai/vit-gpt2-image-captioning

## Resumen

`skillsafe-ai/vit-gpt2-image-captioning` es un paquete de artefactos ONNX listos para navegador que implementan la tarea de image-to-text (generacion de pies de foto a partir de una imagen). No es un entrenamiento nuevo: es una reempaquetado reproducible del modelo base `Xenova/vit-gpt2-image-captioning`, fijado al commit `215b4edcb7ec1fad5905a18a03f7b2007f6fabd0` y verificado byte a byte con SHA-256 para cada fichero. Lo publica la organizacion `skillsafe-ai` mediante el conversor reproducible descrito en el repositorio `skillsafe-admin/skillsafe.ai-website` (carpeta `models/`), y esta pensado para consumirse desde `transformers.js` en el navegador o en Node.js.

El modelo sigue el esquema vision-encoder-decoder: un encoder de vision tipo ViT procesa la imagen y un decoder autorregresivo tipo GPT-2 genera la secuencia de texto. Los tensores de la prueba de humo confirman la geometria: el encoder devuelve `encoder_hidden_states` de forma `[1, 197, 768]` (196 parches mas el token CLS, dimension oculta 768) y el decoder maneja 12 capas de cache KV con 12 cabezas de dimension 64 y un vocabulario de 50 257 tokens. El repositorio pesa 1,1 GB e incluye variantes fp32 y cuantizadas a int8 (q8).

Su relevancia practica no esta en la calidad de los pies de foto —la arquitectura ViT-GPT2 es de 2022 y genera descripciones genericas en ingles— sino en el formato: artefactos ONNX verificados, con hashes publicados y receta reproducible, que permiten ejecutar captioning sin GPU y sin enviar imagenes a un servidor. Para casos de privacidad, etiquetado masivo offline o generacion de texto alternativo en el propio navegador, ese empaquetado es el valor diferencial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder: encoder ViT (hidden size 768, 197 posiciones de entrada) + decoder GPT-2 autorregresivo (12 capas, 12 cabezas, head dim 64, vocab 50 257) |
| Parametros totales | No declarado por el autor; estimado en ~210 M a partir de las formas de tensor (ViT-Base ~86 M + GPT-2 ~124 M). El fichero `decoder_model_merged.onnx` ocupa mas de lo esperado porque fusiona las ramas con y sin cache KV |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La prueba de humo usa `input_ids` de forma `[1, 4]`; no se declara ventana maxima en la informacion proporcionada |
| Tipos de cuantizacion | fp32 y q8 (int8) para el decoder (`decoder_model_merged.onnx` / `decoder_model_merged_quantized.onnx`); el encoder se publica como fp32 y q8 |
| Idiomas soportados | No disponible en la informacion proporcionada. Los pesos derivan de un captioner entrenado sobre COCO, por lo que la salida esperable es ingles |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`onnx/encoder_model.onnx`, `onnx/decoder_model_merged.onnx`, `onnx/decoder_model_merged_quantized.onnx`) mas ficheros de tokenizer y configuracion en JSON/TXT (vocab.json, merges.txt, tokenizer.json, preprocessor_config.json, generation_config.json) |
| Libreria de referencia | transformers.js |
| Tamano del repositorio | 1,1 GB |
| Fecha de conversion | 2026-09-22T21:56:40+00:00 |
| Toolchain de conversion | Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0, Darwin 25.6.0 arm64 |

## Arquitectura y entrenamiento

El modelo es un encoder-decoder clasico de dos torres. El encoder de vision transforma la imagen en 197 vectores de 768 dimensiones (un token CLS mas 196 parches), tal como refleja la forma `encoder_hidden_states[1, 197, 768]` declarada en la verificacion. El decoder es un transformer autorregresivo estilo GPT-2 con 12 bloques y 12 cabezas de atencion de dimension 64; la verificacion lista las 12 entradas `past_key_values.*.key/value` y las 12 salidas `present.*`, lo que confirma el uso de cache KV incremental durante la generacion. La proyeccion de salida produce `logits[1, 4, 50257]`.

No se aporta informacion sobre el entrenamiento en la documentacion disponible: ni numero de tokens, ni composicion del dataset, ni si hubo fases de RLHF o DPO. El autor de este repositorio no entrena ni ajusta nada; su aportacion es de empaquetado y verificacion. Cada fichero esta fijado por SHA-256 a su origen (`Xenova/vit-gpt2-image-captioning`), se ejecuto `onnx.checker` sobre todos los ONNX y se hizo una prueba de humo en CPU con onnxruntime usando entradas rellenas de ceros. En esa prueba, `decoder_model_merged.onnx` tardo 17,3 ms sobre Darwin arm64. La unica transformacion reseñable es la fusion de las ramas con y sin cache en un unico grafo `decoder_model_merged.onnx` controlado por la entrada `use_cache_branch[1]`, ademas de la variante cuantizada a int8.

## Capacidades

- Generacion de pies de foto en una frase a partir de una imagen RGB, en formato image-to-text estandar.
- Ejecucion en navegador mediante ONNX Runtime Web / transformers.js, sin backend ni GPU dedicada obligatoria.
- Inferencia en CPU: los pesos fp32 del decoder tardaron 17,3 ms en la prueba de humo declarada (entrada de 4 tokens, Darwin arm64).
- Dos variantes de precision: fp32 (`decoder_model_merged.onnx`, 586,53 MB) y q8 (`decoder_model_merged_quantized.onnx`, 151,25 MB), lo que permite elegir entre calidad y peso de descarga.
- Cache KV incremental, apto para generacion token a token con estado persistente entre pasos.
- Reproducibilidad verificable: hashes SHA-256 de cada fichero y receta publicada.
- No se declara soporte de tool calling, function calling, uso agentico, modo thinking, vision adicional (deteccion, OCR, segmentacion) ni audio.
- No se declara soporte multilingue; la salida esperable es ingles.

## Casos de uso

- Texto alternativo accesible en el navegador: una extension o widget puede generar el atributo `alt` de imagenes al vuelo ejecutando el encoder y el decoder con pq8 (151 MB de decoder mas 327 MB de encoder) dentro del cliente, sin enviar la imagen a ningun servidor. Encaja porque el modelo esta empaquetado especificamente para `transformers.js` y ONNX Runtime Web.
- Etiquetado masivo de bibliotecas de imagenes: catalogos de fotografia o archivos documentales pueden procesar lotes en CPU y almacenar una descripcion corta por activo como metadato de busqueda. La variante q8 reduce el consumo de memoria a menos de 0,5 GB, permitiendo paralelizar en varias instancias sin GPU.
- Generacion automatica de descripciones en e-commerce: para fichas de producto donde solo existe la imagen, el modelo produce una descripcion base en ingles que luego se revisa o se traduce; es adecuado porque el coste por inferencia es de milisegundos en CPU y no requiere infraestructura GPU.
- Moderacion y triaje de contenido: generar una descripcion textual de imagenes subidas por usuarios para alimentar filtros o colas de revision humana, priorizando el trabajo del moderador. La ejecucion local evita que el material sensible salga del perimetro de la organizacion.
- Anotacion previa de datasets de vision: preetiquetar pares imagen-texto antes de una revision manual en proyectos de investigacion, usando la salida del modelo como borrador. La licencia Apache-2.0 permite ese uso sin restricciones de redistribucion del resultado.
- Pipelines de preprocesado en Node.js: al ser artefactos ONNX, se pueden integrar en servicios Node con `onnxruntime-node` para enriquecer un CMS o un DAM en el momento de la subida, sin depender de Python ni de APIs externas.
- Demos y prototipos offline: aplicaciones educativas o pruebas de concepto de captioning en dispositivos sin conectividad, dado que el paquete completo cabe en 1,1 GB y funciona sobre CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta la verificacion funcional: `onnx.checker` superado en todos los ficheros ONNX y una prueba de humo en CPU con onnxruntime sobre entradas rellenas de ceros.

| Prueba | Entradas | Salidas | Tiempo |
|---|---|---|---|
| `decoder_model_merged.onnx` (fp32) | `input_ids[1, 4]`, `encoder_hidden_states[1, 197, 768]`, 24 tensores de cache KV `[1, 12, 1, 64]`, `use_cache_branch[1]` | `logits[1, 4, 50257]` y 24 tensores `present.*[1, 12, 4, 64]` | 17,3 ms |
| `decoder_model_merged_quantized.onnx` (q8) | mismas formas | mismas formas | no disponible (el dato queda truncado en la informacion proporcionada) |

No hay resultados de MMLU, HumanEval, GSM8K, CIDEr, SPICE ni de ningun otro benchmark de captioning en la documentacion facilitada.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 0,9-1,0 GB sumando encoder (327,53 MB) y decoder (586,53 MB), mas el espacio de activaciones y cache KV.
- VRAM estimada con decoder q8: en torno a 0,48-0,6 GB (encoder 327,53 MB + decoder 151,25 MB).
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con WebGPU.
- Funciona en CPU pura; la prueba declarada se ejecuto en Darwin 25.6.0 arm64 (Apple Silicon) y dio 17,3 ms por paso del decoder fp32.
- Despliegue recomendado: `transformers.js` en navegador o Node.js, ONNX Runtime Web (backend WASM o WebGPU), `onnxruntime-node` en servidor. No se documenta integracion con vLLM, TGI, llama.cpp ni Ollama, que no aplican a este formato.
- Latencia: 17,3 ms por paso del decoder en la prueba de humo. El tiempo total de generacion depende del numero de tokens generados, que no se especifica; no hay datos de throughput publicados.
- Almacenamiento: 1,1 GB para el repositorio completo; 0,48 GB si solo se despliegan encoder fp32 y decoder q8.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con el modelo del que deriva directamente.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `skillsafe-ai/vit-gpt2-image-captioning` | No declarado (~210 M estimados) | No disponible | ONNX fp32 y q8, mas JSON de tokenizer | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `Xenova/vit-gpt2-image-captioning` (upstream) | No declarado en la informacion proporcionada; mismos pesos | No disponible | No disponible en detalle; es el origen del commit `215b4edcb7ec1fad5905a18a03f7b2007f6fabd0` | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de rendimiento, contexto ni licencia de alternativas como BLIP, GIT, Florence-2 o modelos de captioning multilingues dentro de la informacion facilitada, por lo que no se incluye una comparacion cuantitativa con ellos.

## Limitaciones y advertencias

- La descripcion generada es una sola frase corta y generica; el modelo no permite preguntas sobre la imagen ni conversacion multi-turno.
- Riesgo alto de descripcion incorrecta o alucinada en imagenes ambiguas, con texto, graficos o escenas poco frecuentes en COCO.
- No se declara la composicion del dataset de entrenamiento ni los sesgos asociados; un captioner entrenado sobre COCO tiende a sobrerrepresentar escenas cotidianas occidentales y a producir descripciones estereotipadas sobre personas.
- Cobertura idiomatica limitada en la practica al ingles; no hay soporte multilingue declarado.
- No se declara longitud de contexto; el decoder esta condicionado por las 197 posiciones del encoder, de modo que la cantidad de informacion visual que puede explotar es la de un unico forward pass del ViT a resolucion fija.
- El paquete no es un modelo nuevo: cualquier limitacion del modelo base `Xenova/vit-gpt2-image-captioning` se hereda sin cambios.
- No se documentan datos de rendimiento en benchmarks de captioning (CIDEr, SPICE, METEOR), por lo que no es posible estimar su calidad frente a alternativas modernas antes de desplegarlo.
- El repositorio presenta 0 descargas y 0 likes en el momento consultado, y fue creado y actualizado el mismo dia; no hay evidencia de uso en produccion ni de mantenimiento posterior.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento originales, no documentada aqui.
- Los ficheros de pesos no se alojan en el repositorio: la model card indica que los ficheros marcados como `registry` se sirven desde `models.skillsafe.ai` una vez validados, lo que introduce una dependencia de ese dominio en tiempo de ejecucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/vit-gpt2-image-captioning
- Modelo base upstream: https://huggingface.co/Xenova/vit-gpt2-image-captioning
- Commit upstream fijado: https://huggingface.co/Xenova/vit-gpt2-image-captioning/tree/215b4edcb7ec1fad5905a18a03f7b2007f6fabd0
- Repositorio del conversor (carpeta `models/` y `recipes/vit-gpt2-image-captioning.yaml`): https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- No se han encontrado papers, blogs, demos ni repos adicionales del autor en los resultados de busqueda web disponibles.
