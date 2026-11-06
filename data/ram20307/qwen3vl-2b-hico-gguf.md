# Ram20307/qwen3vl-2b-hico-GGUF

## Resumen

qwen3vl-2b-hico-GGUF es una cuantizacion en formato GGUF (Q4_K_M) del adaptador LoRA `Ram20307/qwen3vl-2b-hico-lora`, que a su vez parte de Qwen3-VL-2B-Instruct. El modelo resultante es un sistema de vision-lenguaje especializado en la generacion de grafos de escena (scene graphs) orientados a la deteccion de interacciones humano-objeto (HOI), entrenado sobre los conjuntos de datos Action Genome/Charades y HICO-DET. Lo publica el usuario Ram20307 y esta pensado para ejecutarse en llama.cpp mediante el binario `llama-mtmd-cli`.

La relevancia practica del modelo es acotada: no es un modelo generalista, sino un ajuste fino de tarea unica que devuelve JSON estructurado describiendo relaciones sujeto-predicado-objeto en una imagen. Su interes tecnico radica en que demuestra como un VLM pequeno (2B parametros) puede especializarse en una tarea de percepcion estructurada y desplegarse en local con cuantizacion de 4 bits, manteniendo el proyector visual en F16.

El autor advierte explicitamente de que solo se ha realizado una comprobacion de sanidad de una sola imagen (JSON valido) sobre este GGUF, sin evaluacion formal. Los numeros de calidad citados (recall 0,29 / precision 0,33 en 60 frames de Action Genome para el modelo solo-AG cuantizado) proceden de un modelo distinto y con un conjunto de frames diferente al del bf16, por lo que no constituyen una comparacion limpia. La licencia del artefacto es Apache-2.0, pero los datos de entrenamiento son de uso exclusivamente investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL-2B-Instruct) con adaptador LoRA fusionado y proyector visual congelado |
| Parametros totales | 2B (aproximado, heredado de Qwen3-VL-2B-Instruct; no se detalla en la informacion disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 262k segun el autor (por defecto); se recomienda usar `-c 4096` en la practica |
| Tipos de cuantizacion | Q4_K_M para el modelo; proyector visual en F16 (`mmproj-qwen3vl-2b-ag-f16.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (artefacto); datos de entrenamiento de uso solo investigador |
| Formato de pesos | GGUF (modelo) + GGUF del proyector visual (mmproj) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, un VLM transformer con torre visual y modelo de lenguaje. Sobre el se aplico un ajuste fino mediante LoRA orientado a la generacion de grafos de escena para deteccion de interacciones humano-objeto. La torre visual se mantuvo congelada durante el entrenamiento, motivo por el cual el proyector visual (`mmproj-qwen3vl-2b-ag-f16.gguf`) es identico para todos los adaptadores derivados y se distribuye como fichero separado en F16.

Los datos de entrenamiento provienen de Action Genome/Charades y HICO-DET. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El autor remite a la model card del adaptador (`Ram20307/qwen3vl-2b-hico-lora`) para los detalles de tarea, prompts, entrenamiento y numeros de evaluacion, que no se incluyen aqui. La innovacion destacable es la especializacion de un VLM de 2B en salida JSON estructurada de grafos de escena, empaquetada para inferencia local con llama.cpp.

## Capacidades

- Generacion de grafos de escena en formato JSON a partir de una imagen (relaciones sujeto-predicado-objeto).
- Deteccion de interacciones humano-objeto (HOI) alineada con las taxonomias de Action Genome y HICO-DET.
- Salida estructurada determinista con `--temp 0`, adecuada para consumo programatico.
- Procesamiento de imagen individual por inferencia (el autor menciona una "one-frame sanity check").
- Ejecucion local mediante llama.cpp con el binario `llama-mtmd-cli`.
- Capacidades generales heredadas de Qwen3-VL-2B-Instruct: no documentadas ni garantizadas tras el ajuste fino en la informacion disponible.
- Soporte de tool calling, agentes, razonamiento multi-paso, vision general o audio: no disponible / no documentado para este ajuste.

## Casos de uso

- Anotacion automatica de grafos de escena en investigacion de vision por computador: el modelo genera JSON de relaciones HOI sobre frames de video, util para preetiquetar datasets de Action Genome o HICO-DET antes de revision humana.
- Prototipado de pipelines de percepcion estructurada en local: al ejecutarse con llama.cpp y cuantizacion Q4_K_M, permite iterar sobre prompts y esquemas JSON sin depender de APIs externas.
- Extraccion de relaciones para analisis de comportamiento en video: procesando frames individuales se obtienen descripciones estructuradas de que objeto interactua con que persona y mediante que accion.
- Educacion e investigacion en VLMs especializados: sirve como ejemplo reproducible de ajuste LoRA sobre Qwen3-VL-2B y de empaquetado GGUF con proyector visual separado.
- Generacion de datos sinteticos etiquetados para entrenar detectores HOI mas ligeros: la salida JSON puede filtrarse y convertirse en anotaciones auxiliares.
- Despliegue en entornos con recursos limitados: al ser un modelo de 2B en Q4_K_M, cabe en GPUs de consumo y permite experimentacion sin infraestructura de datacenter, siempre con contexto reducido (`-c 4096`).

## Benchmarks y rendimiento

El autor no publica una evaluacion formal de este GGUF. La unica referencia numerica es la del modelo solo-AG cuantizado, medida sobre 60 frames de Action Genome, comparada con el bf16 medido sobre 199 frames distintos (el propio autor indica que no es una comparacion limpia):

| Modelo / configuracion | Recall | Precision | Frames evaluados |
|---|---|---|---|
| Solo-AG Q4 (cuantizado) | 0,29 | 0,33 | 60 (Action Genome) |
| Solo-AG bf16 | 0,31 | 0,45 | 199 (Action Genome) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La comprobacion realizada sobre este GGUF se limita a verificar que la salida es JSON valido en una sola imagen.

## Requisitos de hardware

- VRAM estimada: un modelo de 2B en Q4_K_M ocupa del orden de 1,5-2 GB, mas el proyector visual en F16 (varios cientos de MB); con contexto de 4096 tokens el consumo total deberia situarse en pocos GB, aunque el autor no proporciona cifras exactas.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con 6-8 GB de VRAM deberia ser suficiente para Q4_K_M con contexto reducido.
- GPU de consumo: previsiblemente cabe en RTX 3060, RTX 4060, RTX 4090 y similares; no confirmado en la informacion disponible.
- Advertencia de contexto: el autor indica que el contexto por defecto de 262k requiere decenas de GB; debe usarse `-c 4096`.
- Despliegue: llama.cpp mediante `llama-mtmd-cli` con `-m <modelo>.gguf --mmproj mmproj-qwen3vl-2b-ag-f16.gguf --image frame.jpg --temp 0 -n 400 -c 4096 -p '<prompt>'`. No se documentan otras opciones (vLLM, TGI, Ollama).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3vl-2b-hico-GGUF | 2B | hasta 262k (recomendado 4096) | Grafos de escena / HOI | Apache-2.0 (datos solo investigacion) | GGUF en HF |
| Qwen3-VL-2B-Instruct | 2B | no disponible en esta ficha | VLM generalista | no disponible en esta ficha | HF |
| Ram20307/qwen3vl-2b-hico-lora | 2B | no disponible | Grafos de escena / HOI | Apache-2.0 | Adaptador LoRA en HF |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada. No se identifican en la informacion disponible otros modelos especializados en grafos de escena con los que establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Evaluacion insuficiente: solo se ejecuto una comprobacion de sanidad de una imagen (JSON valido); el modelo no ha sido puntuado formalmente en este formato GGUF.
- Los numeros de recall/precision citados corresponden a otro modelo (solo-AG) y a frames distintos, por lo que no validan este artefacto.
- Restriccion de licencia de datos: el entrenamiento usa Action Genome/Charades (no comercial, solo investigacion) y HICO-DET (uso investigador); el uso comercial del modelo derivado es juridicamente arriesgado pese a la licencia Apache-2.0 del artefacto.
- Riesgo de alucinacion: como todo VLM, puede generar relaciones u objetos inexistentes en la imagen; la salida JSON no garantiza correccion semantica.
- Contexto: el valor por defecto de 262k es impracticable en hardware comun; hay que fijar `-c 4096` explicitamente.
- Especializacion estrecha: no es un asistente general; su utilidad fuera de la generacion de grafos de escena HOI no esta documentada.
- Idiomas soportados: no disponibles; la salida esperada es JSON estructurado, no texto libre multilingue.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ram20307/qwen3vl-2b-hico-GGUF
- Adaptador LoRA base: https://huggingface.co/Ram20307/qwen3vl-2b-hico-lora
- Action Genome: no disponible en la informacion proporcionada
- HICO-DET: no disponible en la informacion proporcionada
- Qwen3-VL: no disponible en la informacion proporcionada
- llama.cpp: no disponible en la informacion proporcionada
