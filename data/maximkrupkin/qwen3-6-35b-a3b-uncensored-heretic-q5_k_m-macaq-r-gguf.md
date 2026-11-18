# MaximKrupkin/Qwen3.6-35B-A3B-uncensored-heretic-Q5_K_M-MACaQ-R-GGUF

## Resumen

Esta ficha describe un artefacto GGUF derivado de Qwen3.6-35B-A3B, un modelo de lenguaje de tipo Mixture-of-Experts con 34.660.610.688 parametros totales (~34,7 B) y, segun la nomenclatura del nombre, aproximadamente 3 B de parametros activos por token ("A3B"). El autor del artefacto es MaximKrupkin, que parte del checkpoint abliterado `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic` y aplica una cuantizacion refinada Q5_K_M mediante la tecnica MACaQ-R del Huawei CSL, publicada en el paper arXiv:2611.10649. El resultado es un unico fichero GGUF de 24.764.032.768 bytes (unos 24,8 GB) cargable en llama.cpp estandar.

El problema que aborda este artefacto no es el diseno de un modelo nuevo, sino la preservacion de calidad en la cuantizacion de un MoE ya modificado (abliterado). MACaQ-R no cuantiza desde cero: refina los codigos de peso de un K-quant nativo (Q5_K_M) contra un teacher en f16, manteniendo escalas de bloque, formatos de tensor y la base de activaciones original. Se refinaron 370 tensores de peso K-quant (120 tensores de expertos x 256 expertos) sobre 2x RTX 3090.

Su relevancia es doble: por un lado, demuestra un flujo de cuantizacion refinada aplicable a MoE; por otro, el modelo base es "uncensored/abliterated", lo que elimina los mecanismos de rechazo. Es importante senalar que el propio autor declara que la calidad de este fichero concreto no se ha medido todavia (sin KL-divergence ni perplejidad frente al teacher, ni verificacion del comportamiento de rechazo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (tag `qwen3_5_moe`), derivada de Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 (~34,7 B) |
| Parametros activos | ~3 B (segun la nomenclatura del nombre "A3B"; no confirmado en la model card) |
| Longitud de contexto | no disponible (el proceso de refinado uso contexto 512 para calibracion, no es la ventana del modelo) |
| Tipos de cuantizacion | Q5_K_M refinado con MACaQ-R (un unico fichero); no se listan otras variantes en este repo |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (un fichero de 24.764.032.768 bytes) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de tipo Mixture-of-Experts con 34,7 B de parametros totales y aproximadamente 3 B activos por token, segun la convencion "35B-A3B" del nombre. El checkpoint de partida (`llmfan46/Qwen3.6-35B-A3B-uncensored-heretic`) es una version abliterada del Qwen3.6-35B-A3B original, es decir, con los comportamientos de rechazo suprimidos mediante tecnicas de abliteration. No se dispone en la informacion proporcionada de detalles sobre el dataset de preentrenamiento, numero de tokens, composicion, ni si hubo RLHF o DPO.

La innovacion tecnica de este artefacto es el proceso MACaQ-R: en lugar de cuantizar desde los pesos bf16, se toma el K-quant nativo Q5_K_M y se refinan sus codigos de peso contra un teacher f16 construido a partir de los mismos safetensors heretic (no del Qwen3.6 stock), de modo que el refinado se ajusta a la distribucion del modelo abliterado. La calibracion se genero con `make_moe_calibration.py --profile diverse --seed 617029 --count 6000`, y el refinado uso contexto 512, 256 chunks y 64 iteraciones sobre 2x RTX 3090. Todos los tensores no refinados se copian sin cambios y el resultado carga en llama.cpp estandar.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.6-35B-A3B, si bien no se documentan explicitamente en la model card de este artefacto.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este artefacto.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta relleno).
- Modo "uncensored/abliterated": el modelo no aplica los mecanismos de rechazo del modelo original, lo que permite generar contenido que el modelo base rechazaria.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere uso via API compatible con el formato de Hugging Face.

## Casos de uso

- Investigacion sobre abliteration y cuantizacion: el artefacto permite estudiar como se comporta un MoE abliterado tras un refinado MACaQ-R frente al K-quant original, comparando distribuciones y comportamiento de rechazo (aunque el autor aun no ha publicado esas metricas).
- Despliegue local en estaciones de trabajo con 2x RTX 3090: el autor reporta carga en ~18 s y ~139 tokens/s de generacion con `llama-server -ngl 99`, lo que lo hace viable para prototipado interactivo en hardware de gama alta de consumo profesional.
- Generacion de texto sin filtros en entornos controlados: para tareas de redaccion creativa o角色-play donde los rechazos del modelo base resultan un obstaculo, siempre con supervision humana y dentro de un marco legal y etico.
- Evaluacion de pipelines de cuantizacion: sirve como caso de prueba para validar la herramienta MACaQ (`llamacpp/macaq.py`) sobre MoE con 256 expertos y 120 tensores de expertos.
- Inferencia offline con llama.cpp: al ser un unico GGUF, se puede desplegar en entornos sin acceso a red ni a frameworks pesados, usando `llama-server` o `llama-cli`.
- Base para fine-tuning o experimentacion posterior: al estar en GGUF no es directamente entrenable, pero puede servir como referencia de comportamiento para comparar contra versiones bf16 del mismo checkpoint heretic.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la calidad de este fichero no se ha medido (sin KL-divergence ni perplejidad frente al teacher f16, ni verificacion del comportamiento de rechazo). Como referencia, Huawei reporta para el Qwen3.6-35B-A3B *stock* a 22,36 GB una KL-divergence frente a FP16 de 0,013367 para MACaQ-R Q4_K_XL frente a 0,015731 para Unsloth UD-Q4_K_XL; el autor advierte que esa cifra no es una afirmacion sobre este fichero.

| Metrica | Valor |
|---|---|
| KL-divergence vs FP16 (este fichero) | no medida |
| Perplejidad vs teacher f16 | no medida |
| Verificacion de comportamiento de rechazo | no realizada |
| Velocidad de generacion (smoke test, 2x RTX 3090, `-ngl 99`) | ~139 tokens/s |
| Tiempo de carga (smoke test) | ~18 s |

## Requisitos de hardware

- VRAM estimada: el fichero GGUF pesa 24,8 GB; para cargarlo completo en GPU se necesitan al menos ~25-26 GB de VRAM considerando overhead de contexto y buffers.
- GPU recomendadas: 2x RTX 3090 (configuracion usada por el autor para el refinado y el smoke test), o una GPU unica con 32 GB o mas (A100 40/80 GB, H100, RTX A6000, etc.).
- Cabe en consumer GPU: no en una sola GPU de 24 GB (RTX 3090/4090) si se quiere cargar todo en VRAM; si cabe repartiendo capas entre 2x RTX 3090 o usando offload parcial a CPU/RAM.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) es el soporte nativo; Ollama y otros frontends basados en llama.cpp deberian poder cargarlo al ser un GGUF estandar.
- Latencia y throughput: ~139 tokens/s de generacion en 2x RTX 3090 con `-ngl 99`; no se reportan latencias de primer token ni throughput con otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este artefacto (Q5_K_M MACaQ-R) | 34,7 B totales / ~3 B activos | no disponible | GGUF | apache-2.0 | Refinado MACaQ-R sobre heretic abliterado; calidad no medida |
| `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-GGUF` (Q5_K_M nativo) | 34,7 B totales / ~3 B activos | no disponible | GGUF | apache-2.0 | K-quant nativo sin refinado MACaQ-R; mismo checkpoint base |
| `Qwen/Qwen3.6-35B-A3B` (stock) | 34,7 B totales / ~3 B activos | no disponible | safetensors (bf16) | apache-2.0 | Modelo original con mecanismos de rechazo intactos |
| Unsloth UD-Q4_K_XL (referencia en paper) | 34,7 B totales / ~3 B activos | no disponible | GGUF | no disponible | KL-divergence 0,015731 a 22,36 GB segun Huawei (modelo stock) |

## Limitaciones y advertencias

- Modelo abliterated/uncensored: no aplica los rechazos del modelo original; puede generar contenido danino, ofensivo o ilegal. El autor declara que la responsabilidad de uso recae en el usuario.
- Calidad no medida: no hay KL-divergence, perplejidad ni verificacion de rechazo para este fichero concreto; no se puede afirmar que el refinado MACaQ-R haya preservado la calidad del teacher.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en este artefacto.
- Sesgos conocidos: no documentados en la informacion proporcionada; heredados del modelo base y del proceso de abliteration.
- Limitaciones de contexto e idioma: la ventana de contexto y los idiomas soportados no estan disponibles en la model card.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el caracter uncensored puede incumplir politicas de plataformas o normativa local; revisar antes de desplegar en produccion.
- Un solo fichero GGUF: no se ofrecen variantes Q4, Q6 u otras; el despliegue queda limitado al tamano de 24,8 GB.
- Sin garantias de soporte: 0 descargas y 1 like en el momento de la consulta; artefacto de un autor individual, no mantenido por Qwen ni por Huawei.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/MaximKrupkin/Qwen3.6-35B-A3B-uncensored-heretic-Q5_K_M-MACaQ-R-GGUF
- Modelo base (abliterado): https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic
- GGUF nativo del modelo base: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-GGUF
- Modelo original Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio MACaQ (Huawei CSL): https://github.com/huawei-csl/MACaQ
- Paper MACaQ-R: https://arxiv.org/abs/2611.10649
