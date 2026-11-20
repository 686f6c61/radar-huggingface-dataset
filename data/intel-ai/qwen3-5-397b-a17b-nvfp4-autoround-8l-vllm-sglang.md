# intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-8L-vLLM-SGLang

## Resumen

Qwen3.5-397B-A17B-NVFP4-AutoRound-8L-vLLM-SGLang es un checkpoint derivado del modelo base Qwen/Qwen3.5-397B-A17B, publicado por intel-ai dentro de un conjunto de variantes denominado "Reduced Models". Se trata de una version reducida en numero de capas (configuracion 8L) y cuantizada en NVFP4 mediante la tecnica AutoRound, empaquetada con la libreria vLLM y orientada a despliegues con vLLM o SGLang. El modelo base pertenece a la familia Qwen3.5 en su variante MoE, con 397.000 millones de parametros totales y 17.000 millones activos por token.

El interes de esta publicacion no reside en la calidad final del modelo, sino en su caracter experimental: es un artefacto de investigacion sobre reduccion de capas y cuantizacion de bajo bit (FP4) en modelos MoE de gran escala. El autor advierte explicitamente en la model card que el texto generado puede aparecer corrupto o incoherente para algunas entradas, y que ese problema de calidad de salida es conocido y, segun sus notas, puede ignorarse por ahora.

Por tanto, esta ficha describe un checkpoint que no debe considerarse apto para produccion ni para evaluacion de capacidades reales del modelo base. Los pesos en safetensors suman 54.185.595.904 parametros efectivos tras la reduccion, con un tamano de repositorio de 145,5 GB. La licencia y los idiomas soportados no estan declarados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), checkpoint reducido a 8 capas |
| Parametros totales | 54.185.595.904 (pesos del checkpoint reducido); modelo base declarado: 397B totales |
| Parametros activos | 17B en el modelo base (A17B); no disponible para el checkpoint reducido |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato FP4 de NVIDIA) generado con AutoRound; formato `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con vLLM; tag `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.5-397B-A17B es un transformer con mezcla de expertos (MoE) de 397.000 millones de parametros totales y 17.000 millones activos por token. Sobre esa base, intel-ai ha aplicado dos transformaciones: una reduccion estructural a 8 capas (variante "8L" del conjunto Reduced Models) y una cuantizacion a NVFP4 mediante AutoRound, un algoritmo de cuantizacion post-entrenamiento que ajusta los pesos para minimizar el error de redondeo en formatos de muy bajo bit. El resultado se empaqueta en el formato `compressed-tensors`, consumible por vLLM.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados, ni sobre procesos de RLHF o DPO. Tampoco se documenta el procedimiento exacto de seleccion de las 8 capas conservadas ni el impacto de esa reduccion en la perplejidad. La model card unicamente indica que la validacion de inferencia se realizo sobre el flujo de vLLM y que el checkpoint esta pensado para despliegues tipo vLLM o SGLang.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` con tag `conversational`, heredado de la familia Qwen3.5.
- Razonamiento, codigo y matematicas: capacidades atribuibles al modelo base Qwen3.5-397B-A17B; no verificadas en este checkpoint reducido.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas no estan declarados.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Advertencia importante: el autor senala que la salida puede aparecer corrupta para determinados prompts en las variantes reducidas actuales.

## Casos de uso

- Investigacion sobre cuantizacion FP4 en MoE de gran escala: el checkpoint sirve para medir el impacto de NVFP4 con AutoRound sobre un modelo de 397B en terminos de perplejidad, estabilidad numerica y latencia, comparandolo con el modelo base sin cuantizar.
- Estudio de reduccion de profundidad: la variante 8L permite analizar como afecta el recorte de capas a la coherencia de la generacion en arquitecturas MoE, un fenomeno poco documentado en modelos de esta escala.
- Pruebas de integracion con vLLM y SGLang: util para validar pipelines de despliegue, carga de pesos `compressed-tensors` y soporte de FP4 en estas librerias antes de adoptar variantes mas estables.
- Benchmarking de hardware para inferencia FP4: permite medir throughput y uso de VRAM en GPU con soporte nativo de FP4 (por ejemplo, generaciones Blackwell) con un modelo de gran tamano pero pesos reducidos.
- Validacion de pipelines de evaluacion: sirve como caso de prueba para detectar fallos en harness de evaluacion cuando la calidad de salida es degradada, verificando que las metricas reflejan la corrupcion del texto.
- Reproducibilidad de artefactos de investigacion: util para equipos que replican experimentos de cuantizacion y necesitan el mismo checkpoint publicado con trazabilidad de fecha y origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 145,5 GB en safetensors NVFP4; la carga en vLLM requiere al menos ese volumen de memoria, mas overhead de KV cache y activaciones.
- GPU recomendadas: GPU con soporte de FP4, como las de arquitectura Blackwell (B200, GB200); el uso en generaciones anteriores requerira emulacion o conversion y no se documenta.
- GPU de consumo: no cabe en GPU de consumo tipicas (RTX 4090, 24 GB) sin offloading a CPU o disco; no se documenta soporte para ello.
- Opciones de despliegue: vLLM (validado por el autor) y SGLang (objetivo declarado); llama.cpp y Ollama no estan indicados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-8L-vLLM-SGLang | 54,2B en checkpoint (base 397B/A17B) | no disponible | NVFP4 | no disponible | Experimental, salida degradada |
| Qwen/Qwen3.5-397B-A17B | 397B totales / 17B activos | no disponible | BF16/FP16 original | no disponible | Modelo base de referencia |
| Otras variantes del set Reduced Models de intel-ai | no disponible | no disponible | NVFP4 | no disponible | Experimental |

La comparativa se limita al modelo base y a las variantes del mismo conjunto, ya que no se dispone de datos de rendimiento ni de especificaciones de contexto para establecer comparaciones con alternativas externas.

## Limitaciones y advertencias

- Calidad de salida degradada: el autor reconoce que el texto generado puede aparecer corrupto para algunos prompts; no es apto para uso en produccion.
- Reduccion de capas agresiva: la configuracion 8L elimina gran parte de la profundidad del modelo base, con impacto no cuantificado en razonamiento y coherencia.
- Cuantizacion FP4 experimental: NVFP4 con AutoRound en un MoE de 397B es una combinacion de bajo bit poco validada; puede introducir inestabilidad numerica.
- Licencia no declarada: no se puede confirmar el uso comercial; debe consultarse la licencia del modelo base Qwen3.5-397B-A17B antes de cualquier despliegue.
- Idiomas no declarados: no hay garantia de comportamiento multilingue en este checkpoint.
- Sesgos y alucinacion: no documentados para este checkpoint; se heredan los del modelo base, agravados por la reduccion y la cuantizacion.
- Adopcion minima: 14 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Requisito de hardware especifico: el formato NVFP4 limita el despliegue a GPU con soporte nativo, lo que reduce la portabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-8L-vLLM-SGLang
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Perfil del autor: https://huggingface.co/intel-ai
- Documentacion de vLLM: https://docs.vllm.ai
- Documentacion de SGLang: https://docs.sglang.ai
- Repositorio de AutoRound: https://github.com/intel/auto-round
