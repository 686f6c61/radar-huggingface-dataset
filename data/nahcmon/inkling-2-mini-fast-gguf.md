# nahcmon/Inkling-2-Mini-fast-GGUF

## Resumen

Inkling-2-Mini-fast-GGUF es una cuantizacion personalizada del modelo Inkling-2-Mini desarrollado por Thinking Machines, publicada por el usuario nahcmon. Se trata de un modelo de arquitectura MoE (mixture of experts) distribuido en formato GGUF para su uso con llama.cpp, disenado especificamente para ejecutarse en GPUs de 12 GB de VRAM con una ventana de contexto de 64k tokens y cache KV de 4 bits. La cuantizacion se construyo a partir de la version GGUF publicada por Unsloth.

La relevancia de esta ficha radica en que el autor ha optimizado el empaquetado de tensores ("folded") para reducir el numero de kernels por token, ademas de aplicar una receta de cuantizacion mixta (expertos gate/up en IQ2_XS, expertos down en NVFP4 original, atencion en Q6_K) que mantiene la calidad respecto a la cuantizacion UD-Q4_K_M de Unsloth (KLD medio de 0.0498 en ambos casos). El resultado es un modelo que cabe completo en una RTX 3080 Ti con 64k de contexto, con velocidades de decodificacion de 73 tok/s en contexto corto y 55 tok/s tras un prompt de 48k tokens.

No se dispone de informacion publica sobre parametros totales, longitud de contexto nativa del modelo base ni benchmarks de capacidad en la informacion proporcionada; los datos disponibles se limitan a la receta de cuantizacion, el rendimiento de inferencia medido por el autor y las especificaciones de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), segun tags del repositorio |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 64k tokens (configuracion de despliegue documentada) |
| Tipos de cuantizacion | IQ2_XS (expertos gate/up), NVFP4 (expertos down, original), Q6_K (atencion); KV cache q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos variantes: folded y custom) |

## Arquitectura y entrenamiento

El modelo base es Inkling-2-Mini de Thinking Machines, descrito en los tags del repositorio como MoE. La model card no detalla el numero de parametros, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. La unica innovacion tecnica documentada en esta ficha es la del empaquetado de tensores: el archivo `Inkling-2-Mini-fast-folded.gguf` repaqueta los tensores "folded" para que el motor de inferencia ejecute menos kernels por token, mientras que `Inkling-2-Mini-fast-custom.gguf` mantiene el layout de tensores de los GGUF de Unsloth.

La receta de cuantizacion combina IQ2_XS para las proyecciones gate/up de los expertos, NVFP4 para las proyecciones down (mantenidas en el formato original) y Q6_K para la atencion. Segun el autor, la calidad medida como divergencia KL media respecto a los logits de referencia es de 0.0498, identica a la de la cuantizacion UD-Q4_K_M de Unsloth. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus ni el proceso de alineacion.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM de proposito general; no se detallan capacidades especificas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas soportados no se especifican.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.
- Contexto largo: el despliegue documentado soporta 64k tokens con cache KV q4_0 en 12 GB de VRAM.

## Casos de uso

- Inferencia local en GPU de consumo: el modelo cabe completo en una RTX 3080 Ti de 12 GB con 64k de contexto y cache KV q4_0, lo que permite ejecutar un MoE de gran contexto en hardware de gama alta domestica sin offloading a CPU.
- Procesamiento de documentos largos: con 64k tokens de contexto y velocidad de prefill de ~1550 tok/s en prompts de 48-60k tokens, es adecuado para resumir, extraer informacion o responder preguntas sobre contratos, informes o articulos extensos en una sola pasada.
- Asistentes conversacionales con historial largo: la decodificacion sostenida de 55 tok/s tras un prompt de 48k tokens permite mantener conversaciones multi-turno con memoria extensa sin degradacion acusada de latencia.
- Prototipado e investigacion: al ser un GGUF con licencia Apache-2.0, sirve para experimentar con arquitecturas MoE y tecnicas de cuantizacion mixta en entornos academicos o de I+D sin coste de licencia.
- Despliegue en estaciones de trabajo con una sola GPU: el uso de `-lm none` y `--cache-ram 0` reduce el consumo de RAM del sistema a ~1.5 GB, lo que facilita integrarlo en equipos con memoria limitada.
- Evaluacion comparativa de cuantizaciones: al mantener la misma KLD que UD-Q4_K_M (0.0498) con un tamano de 10.1 GiB, es util para estudiar el compromiso entre tamano, velocidad y calidad en cuantizaciones de MoE.
- Generacion de codigo y texto tecnico: aunque no se documentan benchmarks especificos, el modelo base es un LLM general; su uso en generacion de codigo requeriria validacion propia por parte del integrador.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados corresponden a mediciones de inferencia del autor en una RTX 3080 Ti de 12 GB con contexto de 64k, KV q4_0 y `-ub 512`:

| Metrica | Valor |
|---|---|
| Decodificacion, contexto corto | 73 tok/s |
| Decodificacion tras prompt de 48k tokens | 55 tok/s |
| Prefill, prompt de 48-60k tokens | ~1550 tok/s |
| VRAM utilizada | 11.9 de 12.3 GB |
| Calidad (KLD media vs logits de referencia) | 0.0498 (igual que UD-Q4_K_M de Unsloth) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 11.9 GB con 64k de contexto y KV q4_0 (medido por el autor); el archivo pesa 10.1 GiB.
- GPU recomendadas: RTX 3080 Ti 12 GB (verificada por el autor); cualquier GPU con al menos 12 GB de VRAM deberia poder alojar el modelo con la configuracion documentada.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas (RTX 3080 Ti, RTX 4070 Ti, RTX 4080, RTX 4090, etc.), sujeto a validacion propia.
- Opciones de despliegue: llama.cpp con el fork `nahcmon/inkling-fast-llama.cpp` (rama con kernels de Inkling 2); el archivo `custom` tambien es compatible con el build de llama.cpp de Unsloth. El archivo `folded` requiere exclusivamente el motor inkling-fast. No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: 73 tok/s en decodificacion con contexto corto, 55 tok/s tras 48k tokens de prompt y ~1550 tok/s de prefill en prompts de 48-60k tokens (RTX 3080 Ti, 12 GB).
- RAM del sistema: ~1.5 GB con `-lm none` y `--cache-ram 0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-fast-GGUF (esta ficha) | no disponible (MoE) | 64k (despliegue) | Apache-2.0 | GGUF | KLD 0.0498; 10.1 GiB; motor inkling-fast |
| unsloth/Inkling-2-Mini-GGUF (UD-Q4_K_M) | no disponible (MoE) | no disponible | Apache-2.0 | GGUF | KLD 0.0498; requiere build de llama.cpp de Unsloth |
| thinkingmachines/Inkling-2-Mini (base) | no disponible (MoE) | no disponible | Apache-2.0 | no disponible | Modelo original sin cuantizar |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo del modelo base ni de la cuantizacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo generico de los LLM.
- Limitaciones de contexto o idioma: el contexto de 64k corresponde a la configuracion de despliegue, no necesariamente al contexto nativo del modelo base; los idiomas soportados no se especifican.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor atribuye todo el credito del modelo a Thinking Machines y el GGUF fuente a Unsloth; conviene verificar los terminos del modelo base.
- Compatibilidad de motores: el archivo `folded` solo funciona con el fork `nahcmon/inkling-fast-llama.cpp`; el llama.cpp upstream actual espera un layout distinto para las capas en bucle ("looped layers"), por lo que el archivo `custom` puede no cargar correctamente en versiones upstream.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta; es una cuantizacion reciente (creada el 2026-11-21) sin validacion comunitaria.
- Rendimiento medido en un unico hardware (RTX 3080 Ti); el throughput y la VRAM pueden variar en otras GPU.
- No se documentan capacidades de tool calling, agentes ni multilingues; no asumir su disponibilidad sin validacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nahcmon/Inkling-2-Mini-fast-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF fuente de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Motor de inferencia (fork de llama.cpp): https://github.com/nahcmon/inkling-fast-llama.cpp
