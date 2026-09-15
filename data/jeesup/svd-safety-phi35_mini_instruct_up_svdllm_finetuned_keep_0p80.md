# Jeesup/svd-safety-phi35_mini_instruct_up_svdllm_finetuned_keep_0p80

## Resumen

Este repositorio contiene una version comprimida de `microsoft/Phi-3.5-mini-instruct` mediante el metodo completo SVD-LLM (truncamiento por descomposicion en valores singulares con refinamiento LoRA posterior). Lo publica el usuario de HuggingFace Jeesup y esta pensado como artefacto de investigacion para estudiar como afecta la compresion de bajo rango al rendimiento funcional y, en particular, al comportamiento de seguridad del modelo. Se elimina el 20 % de los parametros efectivos (fraccion realizada 0,79972), con un pipeline de blanqueado de datos, truncacion SVD, LoRA sobre los factores U, fusion, LoRA sobre los factores V, fusion y plegado a un checkpoint denso.

La particularidad tecnica mas relevante es que Phi-3.5 fusiona q/k/v en una sola `qkv_proj` y gate/up en una `gate_up_proj`, mientras que SVD-LLM comprime las siete proyecciones por separado. El autor convirtio el checkpoint a layout `LlamaForCausalLM` antes de comprimir (gate ocupa la primera mitad de `gate_up_proj`) y solo acepto la conversion cuando los logits en float64 coincidian con los del `Phi3ForCausalLM` original dentro del ruido numerico de cada modelo. El resultado carga con `transformers` estandar y sin codigo de modelado a medida.

El modelo conserva el tokenizer, la plantilla de chat y los stop tokens de Phi-3.5, asi que se puede usar como sustituto directo del modelo base en pipelines existentes. Al estar plegado a formas densas (`W = U @ V`) es deficiente en rango, pero no mas pequeno en disco: ocupa 7,7 GB en el repositorio y declara 3.821.079.552 parametros, practicamente los mismos que el original. Su relevancia es doble: sirve para reproducir experimentos de compresion SVD-LLM y para analizar si la compresion degrada la alineacion de seguridad de un modelo pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, layout `LlamaForCausalLM` (convertido desde `Phi3ForCausalLM`) |
| Parametros totales | 3.821.079.552 (3,82 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Heredada de microsoft/Phi-3.5-mini-instruct; la model card indica que la configuracion conserva el rope scaling longrope, pero no explicita la cifra |
| Tipos de cuantizacion | No disponible en la model card; el checkpoint se distribuye en precision completa y es cuantizable con herramientas estandar (GPTQ, AWQ, GGUF/llama.cpp) |
| Idiomas soportados | No disponible |
| Licencia | MIT (heredada del modelo base; se incluyen `LICENSE` y `NOTICE.md` en el repositorio) |
| Formato de pesos | safetensors, checkpoint denso en layout Llama |
| Fraccion de parametros retenida | 0,7997 (se elimina el 20 %) |
| Tamano del repositorio | 7,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only con disposicion tipo Llama, obtenido tras una conversion exacta del layout Phi-3. La compresion sigue el pipeline completo de SVD-LLM: blanqueado de datos de calibracion, truncacion por descomposicion en valores singulares de las siete proyecciones de atencion y MLP, y dos etapas de refinamiento con LoRA (r=8, learning rate 0,0001, batch 64, 2 epocas por factor) sobre `yahma/alpaca-cleaned`, primero sobre los factores U y luego sobre los V, con fusion posterior entre etapas. Al final los factores se pliegan a formas densas (`W = U @ V`), de modo que el checkpoint resultante es deficiente en rango pero se carga con `transformers` sin codigo adicional.

Dos correcciones tecnicas merecen mencion. Primero, la conversion de layout: al separar `qkv_proj` y `gate_up_proj` en proyecciones independientes se valido la equivalencia numerica de logits antes de comprimir. Segundo, las etapas LoRA usaron tablas rotatorias calculadas a partir de la configuracion del modelo en lugar de la implementacion original de `SVD_LlamaAttention`, que fija una base de 10.000 e ignora `rope_scaling`; de este modo se conservan los factores longrope y el escalado de atencion de Phi-3.5 durante el entrenamiento de los adaptadores. La model card indica que los cambios de grouped-query del componente `component/svd_llama.py` (sha256 `e65f644f9316`) son inertes sobre la atencion multi-cabeza de Phi-3.5 y que la aritmetica de truncacion no se ha modificado respecto al metodo original. La calibracion del blanqueado uso 256 secuencias de WikiText-2 de 2.048 tokens con semilla 3.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat, stop tokens y tokenizer originales de Phi-3.5-mini-instruct.
- Razonamiento de sentido comun y comprension lectora de nivel basico-medio, segun los resultados zero-shot declarados (HellaSwag 0,6405, WinoGrande 0,6504, PIQA 0,7231).
- Resolucion de problemas de matematicas elementales (MathQA 0,2905 acc_norm), claramente por debajo de lo esperable en un modelo de su tamano sin comprimir.
- Instruccion y seguimiento de formato: al conservar la plantilla de chat del base, mantiene la capacidad de responder a prompts estilo instruct.
- Capacidades multilingues: no documentadas en la informacion disponible; solo se puede asumir lo que herede del modelo base, sin confirmacion.
- Tool calling, function calling y uso como agente: no documentados en la model card; Phi-3.5-mini-instruct soporta formato de tools, pero no hay verificacion para este checkpoint comprimido.
- Vision, audio o modo thinking explicito: no disponibles.
- Uso principal previsto: sujeto de experimentos de evaluacion de compresion (utilidad y seguridad), no un modelo afinado para produccion.

## Casos de uso

- Investigacion en compresion de modelos: reproducir el pipeline SVD-LLM sobre Phi-3.5 y comparar los resultados declarados (perplejidad WikiText-2 de 10,2414, ARC-Easy 0,6183) contra el modelo sin comprimir para medir la perdida real de calidad por truncacion de rango.
- Estudio de la relacion entre compresion y alineacion: el repositorio incluye metricas de seguridad (AdvBench HarmBench ASR 0,1288, StrongREJECT HarmBench ASR 0,1949) y de sobrerrechazo (XSTest-safe 0,1325, OR-Bench-Hard-1K 0,1568), lo que permite analizar si el truncamiento degrada el rechazo de peticiones daninas o incrementa el rechazo excesivo.
- Pruebas de robustez y red teaming: usar el checkpoint como variante degradada de Phi-3.5 en baterias de jailbreak y comparar tasas de exito frente al modelo base, aprovechando que comparte tokenizer y plantilla de chat.
- Inferencia local en hardware de consumo: con 3,82 B de parametros y licencia MIT, es viable en GPUs de 8-12 GB tras cuantizacion a 4 bits, util para prototipos offline de asistentes de texto en equipos sin aceleradores de datacenter.
- Base para fine-tuning posterior: al cargar como `LlamaForCausalLM` estandar, se puede aplicar LoRA o QLoRA con las herramientas habituales (PEFT, Unsloth, Axolotl) para adaptarlo a dominios concretos, asumiendo que parte de la capacidad ya se ha perdido por la compresion.
- Evaluacion comparativa de formatos de checkpoint: sirve para medir si una conversion de layout Phi-3 a Llama introduce discrepancias practicas en tareas de generacion, ya que el autor verifico la equivalencia numerica en logits pero no hay validacion publica en benchmarks completos.
- Docencia y divulgacion tecnica: ejemplo reproducible de como se aplica SVD con refinamiento LoRA sobre proyecciones individuales, con los archivos de metricas crudas y las salidas por prompt disponibles en el repositorio.

## Benchmarks y rendimiento

Resultados declarados en la model card del autor:

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,7997 |
| Perplejidad WikiText-2 | 10,2414 |
| ARC-Easy (acc_norm) | 0,6183 |
| ARC-Challenge (acc_norm) | 0,4326 |
| HellaSwag (acc_norm) | 0,6405 |
| WinoGrande (acc) | 0,6504 |
| OpenBookQA (acc_norm) | 0,3940 |
| PIQA (acc_norm) | 0,7231 |
| MathQA (acc_norm) | 0,2905 |
| AdvBench HarmBench ASR | 0,1288 |
| StrongREJECT HarmBench ASR | 0,1949 |
| Sobrerrechazo (XSTest-safe) | 0,1325 |
| Sobrerrechazo (OR-Bench-Hard-1K) | 0,1568 |
| Sobrerrechazo macro | 0,1447 |

Metodologia declarada: perplejidad sobre WikiText-2; tareas zero-shot de ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA; generacion en AdvBench y StrongREJECT evaluada con `cais/HarmBench-Llama-2-13b-cls`; sobrerrechazo sobre XSTest-safe y OR-Bench-Hard-1K evaluado con `allenai/wildguard`. Toda la generacion usa la plantilla de chat en modo greedy. El autor indica que la fraccion puntuada fue 1,00 en ambos conjuntos de sobrerrechazo, por lo que considera fiable el juicio en esta celda.

No se han publicado en la informacion disponible resultados comparativos contra el modelo base sin comprimir ni contra otras alternativas, por lo que no es posible cuantificar la perdida exacta atribuible a la compresion. Los archivos crudos por prompt estan en los directorios `utility/` y `safety/` del repositorio.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 7,7 GB solo de pesos, mas cache KV; con contexto moderado hay que contar con 10-12 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4 GB de pesos; viable en GPUs de 6-8 GB con contexto corto.
- VRAM estimada en cuantizacion de 4 bits: en torno a 2,2-2,5 GB de pesos; cabe en GPUs de 4-6 GB y en equipos con memoria unificada.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S o RTX 6000 Ada para evaluacion a precision completa con contexto largo; RTX 4090 y RTX 3090 (24 GB) para la mayoria de escenarios sin cuantizar; RTX 4080, 4070 Ti, 4060 Ti 16 GB y tarjetas de 8-12 GB para versiones cuantizadas.
- Cabe en GPU de consumo: si, tanto en modelos de 24 GB sin cuantizar como en tarjetas de 8-12 GB con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: `transformers` estandar (es el camino natural, al ser un checkpoint denso con layout Llama); `vLLM` y TGI deberian funcionar al ser una arquitectura Llama, aunque no hay validacion publicada; `llama.cpp` y `Ollama` requieren convertir previamente los pesos a GGUF; `text-generation-inference` y servidores compatibles con la API de OpenAI tambien son aplicables.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de velocidad y, al ser un checkpoint denso deficiente en rango, no cabe esperar aceleracion por si solo sin kernels especializados.
- Nota de memoria: la ventana de contexto larga heredada de Phi-3.5 implica un coste de cache KV considerable; para contexto muy largo la VRAM necesaria crece por encima de las cifras anteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jeesup/svd-safety-phi35_mini_instruct_up_svdllm_finetuned_keep_0p80 | 3,82 B (80 % de rango retenido) | Heredado de Phi-3.5-mini-instruct (longrope) | MIT | Checkpoint comprimido con SVD-LLM, layout Llama, denso y deficiente en rango; benchmarks de utilidad y seguridad declarados en la model card |
| microsoft/Phi-3.5-mini-instruct | Aproximadamente 3,8 B | 128.000 tokens | MIT | Modelo base sin comprimir; referencia natural para medir la perdida introducida por la truncacion |
| meta-llama/Llama-3.2-3B-Instruct | Aproximadamente 3,2 B | 128.000 tokens | Llama 3.2 Community License | Alternativa de tamano similar con soporte nativo de tool calling; licencia con restricciones comerciales |
| Qwen/Qwen2.5-3B-Instruct | Aproximadamente 3,1 B | 32.768 tokens | Apache 2.0 | Alternativa de tamano similar con licencia permisiva y multilingue; contexto mas corto |

Los datos de rendimiento comparados no estan disponibles: la informacion proporcionada solo incluye las metricas de este checkpoint, no las del modelo base ni las de las alternativas, por lo que no se puede establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- La model card advierte explicitamente de que comprimir a este ratio puede degradar la calidad de generacion; los numeros de seguridad de un modelo que se ha vuelto degenerado no son evidencia sobre alineacion, y hay que leer las columnas de sobrerrechazo y seguimiento de instrucciones junto al ASR antes de extraer conclusiones de comportamiento.
- El checkpoint es deficiente en rango, no mas pequeno: mantiene 3.821.079.552 parametros y 7,7 GB en disco, por lo que no ahorra memoria ni tiempo de inferencia por si mismo sin kernels especializados.
- Tasa de sobrerrechazo elevada: 0,1325 en XSTest-safe, 0,1568 en OR-Bench-Hard-1K y 0,1447 macro, lo que indica que rechaza peticiones legitimas con frecuencia no despreciable.
- El ASR en AdvBench (0,1288) y StrongREJECT (0,1949) implica que una fraccion no trivial de peticiones daninas obtiene respuesta; no debe tratarse como un modelo alineado para seguridad.
- La evaluacion es greedy y con plantilla de chat; el comportamiento puede variar con otras temperaturas o formatos de prompt.
- Idiomas soportados no documentados; el rendimiento fuera del ingles no esta verificado y el conjunto de evaluacion es integramente en ingles.
- Tool calling, function calling y comportamiento agentico no estan documentados ni evaluados para este checkpoint.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni validacion independiente: no hay garantia de reproducibilidad por terceros.
- Aunque la licencia es MIT, el repositorio hereda `LICENSE` y `NOTICE.md` del modelo base; conviene revisarlos antes de un uso comercial.
- La fecha de creacion registrada en HuggingFace es 2026-09-15, posterior a la de la mayoria de modelos comparables; conviene verificar la vigencia de los enlaces y del commit de SVD-LLM referenciado (`7538cca98880`).
- El componente personalizado `component/svd_llama.py` (sha256 `e65f644f9316`) se incluye junto al checkpoint; el modelo final no lo necesita para cargar, pero si para reproducir el pipeline.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Jeesup/svd-safety-phi35_mini_instruct_up_svdllm_finetuned_keep_0p80
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Codigo de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM (commit `7538cca98880`)
- Dataset de calibracion del blanqueado: WikiText-2 (256 secuencias de 2.048 tokens, semilla 3)
- Dataset de refinamiento LoRA: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Juez de seguridad: `cais/HarmBench-Llama-2-13b-cls`
- Juez de sobrerrechazo: `allenai/wildguard`
- Resultados crudos: directorios `utility/` y `safety/` dentro del repositorio
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: las entradas obtenidas corresponden a contenido no relacionado y se descartan.
