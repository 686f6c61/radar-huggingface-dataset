# 0xzknw/Inkling-2-Mini-EXL3-3.33bpw

## Resumen

Inkling-2-Mini-EXL3-3.33bpw es una cuantizacion EXL3 del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario 0xzknw. Se trata de un checkpoint de tipo Mixture of Experts (MoE) con 7.055.390.208 parametros totales, pensado para generacion de texto y conversacion, que reduce el checkpoint original de aproximadamente 20 GB a 14,79 GB en total (14,11 GB para el modelo de lenguaje y vision, mas el drafter y el tokenizer).

La particularidad de esta conversion es que solo se recuantizan los expertos enrutados: los expertos originales en NVFP4 (capas 0-19) y MXFP8 (capas 20-23) se deconstruyen exactamente a FP32 y se cuantizan a codigos trellis EXL3 MCG, con 4 bits en las capas 0, 2, 4, 7, 8, 13, 16 y 17, y 3 bits en las otras 16 capas, lo que da una media de 3,33 bits por peso sobre las proyecciones de expertos. El resto de tensores (atencion, proyecciones densas, routers, normas, embeddings, LM head, encoder de vision y drafter DSpark/MTP) se copian sin modificar desde el modelo fuente.

Es relevante porque demuestra una estrategia de asignacion de bits no uniforme guiada por la degradacion de KL end-to-end, y porque incluye una validacion de fidelidad detallada frente al modelo de referencia. No obstante, el runtime previsto (MLXL3 sobre Apple Silicon) aun no tiene soporte publicado para Inkling 2, y no se han ejecutado benchmarks de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, con bloque en bucle (layers 6-17) y encoder de vision; incluye drafter DSpark/MTP |
| Parametros totales | 7.055.390.208 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 MCG trellis, 3,33 bits por peso de media en proyecciones de expertos (4 bits en 8 capas, 3 bits en 16 capas); resto de tensores en sus formatos originales (NVFP4, MXFP8, BF16) |
| Idiomas soportados | no disponible (evaluado en prosa en ingles, prosa en frances y codigo Rust) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint EXL3, no BF16 convencional) |

## Arquitectura y entrenamiento

El modelo base es un MoE con un bloque recurrente o en bucle (layers 6-17) y un encoder de vision, segun se deduce de la descripcion de la receta de cuantizacion. Los expertos originales vienen en NVFP4 para las capas 0-19 y MXFP8 para las capas 20-23. El checkpoint cuantizado conserva intactos atencion, proyecciones densas, routers, normas, embeddings, LM head, encoder de vision y el drafter DSpark/MTP (este ultimo en BF16, en mtp.safetensors).

La cuantizacion se realizo con el cuantizador de ExLlamaV3 1.6.7+cu128.torch2.10.0 (quantize_exl3_batch), con codebook MCG, Hessian escalado, refit, escalas de salida automaticas a partir de las pendientes de activacion reales y regularizacion sigma de 0,025. Se usaron Hessians por experto ponderados por afinidad del router (eps 0,01) y etapas secuenciales de 3 capas, calibrando cada capa sobre las tres pasadas del bloque en bucle. La calibracion consistio en 283 filas de 2048 tokens (579.584 tokens): 250 filas del mix de calibracion por defecto de ExLlamaV3 y 33 filas de transcripciones de chat de los prompts de evaluacion, renderizadas con la plantilla de chat del modelo. La asignacion de bits se decidio restaurando cada capa del run de 3,0 bpw al modelo de referencia y midiendo la caida de KL end-to-end sobre 4 filas (8.192 tokens); las 8 capas con mayor caida se recuantizaron a 4 bits y despues se recuantizo el modelo completo desde cero. Todo el proceso se ejecuto en una NVIDIA H100 de 80 GB en 4.331 segundos, con un pico de 68,92 GiB.

## Capacidades

- Generacion de texto y conversacion multi-turno, con soporte de plantilla de chat propia.
- Entrada de imagen: el checkpoint incluye encoder de vision, pero la model card indica que la entrada de imagen no esta validada y que MLXL3 no la soporta aun.
- Generacion de codigo: evaluado sobre Rust en la validacion de fidelidad.
- Capacidades multilingues: evaluado en ingles y frances; el conjunto completo de idiomas no esta documentado.
- Decodificacion especulativa mediante el drafter DSpark/MTP incluido en mtp.safetensors.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcialmente evidenciado por la evaluacion sobre una transcripcion de chat agentico, sin datos de benchmarks.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en Apple Silicon: el checkpoint esta pensado para MLXL3 (MLX + Metal) y reduce el peso a 14,79 GB, lo que permite ejecutarlo en equipos con memoria unificada de 24-32 GB, aunque el soporte de Inkling 2 en MLXL3 aun no forma parte de una release.
- Generacion de codigo en pipelines de desarrollo: la validacion sobre Rust muestra un KL de 0,0133 nats/token y un 97,23 % de acuerdo top-1, lo que lo hace adecuado para autocompletado y generacion de codigo donde se tolera una ligera degradacion frente al modelo original.
- Asistentes conversacionales en produccion: la cuantizacion mantiene un 92,88 % de acuerdo top-1 en transcripciones de chat agentico, con una velocidad de decodificacion greedy de aproximadamente 18,5 tokens/s en un Apple M5, suficiente para interacciones interactivas.
- Prototipado e investigacion de tecnicas de cuantizacion: el repositorio incluye quantization_report.json con la receta por modulo, estadisticas y hashes, lo que lo convierte en material de referencia para estudiar asignacion no uniforme de bits.
- Evaluacion de fidelidad de motores de inferencia: los datos de KL y acuerdo top-1 entre el oraculo CUDA y el motor MLXL3 permiten validar implementaciones alternativas de EXL3.
- Generacion de texto en frances e ingles: con KL de 0,0117 y 0,0247 nats/token respectivamente, es util para tareas de redaccion y resumen en estos idiomas.
- Experimentacion con decodificacion especulativa: el drafter MTP incluido en BF16 permite probar tecnicas de aceleracion sin recuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye unicamente metricas de fidelidad de cuantizacion:

| Conjunto held-out | KL (nats/token), este repo | Top-1, este repo | KL, 3,0 bpw (R1) | Top-1, R1 | Max KL, este repo |
|---|---:|---:|---:|---:|---:|
| Todos (24.564 posiciones) | 0,0336 | 94,22 % | 0,0381 | 93,84 % | 21,4 |
| Prosa en ingles | 0,0117 | 94,77 % | 0,0150 | 94,43 % | 0,4 |
| Prosa en frances | 0,0247 | 91,97 % | 0,0284 | 91,17 % | 5,5 |
| Codigo Rust | 0,0133 | 97,23 % | 0,0138 | 96,89 % | 3,6 |
| Transcripcion de chat agentico | 0,0845 | 92,88 % | 0,0954 | 92,85 % | 21,4 |

Comprobacion del motor MLXL3 sobre este checkpoint (Apple M5, MLX 0.32.2, FP16 Metal frente al oraculo CUDA BF16): en una fila de 1.200 tokens, RMSE relativa mediana de logits centrados del 2,3 % (maximo 35 % en una posicion saturada donde referencia, oraculo y motor eligen el mismo token), acuerdo argmax del 98,4-100 %, KL(oraculo || motor) de 0,0012-0,0014 nats/token y KL(referencia || motor) de 0,011 en esa fila (0,015 con la conversion de 3,0 bpw). En dos prompts de chat cortos (26 y 33 tokens) el acuerdo argmax es del 92-97 %. Decodificacion greedy a aproximadamente 18,5 tokens/s en una ejecucion sobre corriente alterna.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo pesa 14,79 GB, por lo que requiere al menos 16-18 GB de memoria disponible para cargar pesos y margen de activaciones y KV cache.
- GPU recomendadas: NVIDIA H100 80 GB para la cuantizacion (proceso de conversion); para inferencia no se especifican GPU NVIDIA validadas con este checkpoint.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (por ejemplo, RTX 3090 o RTX 4090), aunque el runtime validado es MLXL3 sobre Apple Silicon, no CUDA.
- Opciones de despliegue: MLXL3 (Apple silicon, MLX + Metal) es el unico runtime validado, con soporte de Inkling 2 aun en desarrollo y no incluido en una release. ExLlamaV3 estandar no ha sido probado con este checkpoint. llama.cpp, Ollama, vLLM y TGI no estan soportados para este formato.
- Latencia y throughput: aproximadamente 18,5 tokens/s en decodificacion greedy sobre un Apple M5 (una sola ejecucion, con corriente alterna). No hay datos de throughput en lote ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-EXL3-3.33bpw (este) | 7.055.390.208 | EXL3 safetensors, 14,79 GB | no disponible | Apache 2.0 | Hugging Face, runtime MLXL3 en desarrollo |
| thinkingmachines/Inkling-2-Mini (fuente) | no disponible | NVFP4/MXFP8/BF16, ~20 GB | no disponible | Apache 2.0 | Hugging Face |
| Conversion EXL3 3,0 bpw (R1, no publicada) | no disponible | EXL3 | no disponible | Apache 2.0 | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo se han medido KL media y acuerdo top-1; no se ejecutaron benchmarks de tareas (MMLU, suites de codigo, etc.).
- Posiciones aisladas pueden divergir fuertemente: el KL maximo por posicion aumento respecto a R1 (chat 21,4 frente a 15,6; frances 5,5 frente a 2,7; codigo 3,6 frente a 1,2), aunque todas las medias bajaron.
- El dominio de chat se reduce a una unica transcripcion agentica y 4 de las 12 filas de evaluacion se usaron tambien para elegir las capas de 4 bits, lo que introduce un pequeno sesgo de seleccion.
- La entrada de imagen, contextos largos mas alla de las filas evaluadas y la calidad de muestreo no estan validadas.
- El runtime MLXL3 no tiene aun soporte publicado para Inkling 2; la generacion de texto funciona, pero la entrada de imagen no.
- ExLlamaV3 estandar no ha sido probado con este checkpoint; no se espera ni se reclama paridad bit-exacta con el oraculo CUDA.
- Los sesgos conocidos del modelo base no se documentan en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe consultarse el archivo NOTICE para las modificaciones.
- La cuantizacion a 3,33 bits puede degradar tareas sensibles a precision numerica no cubiertas por la validacion de KL.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xzknw/Inkling-2-Mini-EXL3-3.33bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio MLXL3: https://github.com/0xZKnw/mlxl3
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
