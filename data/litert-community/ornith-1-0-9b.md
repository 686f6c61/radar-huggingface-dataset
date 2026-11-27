# litert-community/Ornith-1.0-9B

## Resumen

Ornith-1.0-9B es un modelo de lenguaje denso de aproximadamente 9.000 millones de parametros desarrollado por ornith-ai, presentado como parte de una familia de modelos open source "auto-mejorables" orientados a *agentic coding*. Se trata de un post-entrenamiento sobre Qwen3.5-9B, cuya configuracion del decodificador de texto es identica clave por clave a la del modelo base, e incorpora una arquitectura hibrida con atencion lineal GatedDeltaNet combinada con atencion completa clasica. El checkpoint original es multimodal, aunque la version que nos ocupa contiene unicamente el decodificador de texto.

La ficha que nos ocupa documenta la conversion realizada por la comunidad litert-community al formato LiteRT-LM (`.litertlm`), el runtime de Google para inferencia en dispositivo (*on-device*) y *edge*. Se publican cuatro variantes de cuantizacion: int8 dinamica completa, int8 con *composites* GPU, Mixed INT4 y Mixed INT4 con *composites* GPU, con tamanos que van de los 6,03 GB a los 9,20 GB. La relevancia actual reside en que permite ejecutar un modelo de 9B con capacidades agenticas y de razonamiento en hardware de consumo y en moviles mediante el runtime LiteRT-LM, con velocidades de decodificacion de 44,9 tok/s en la GPU de un Mac Studio M4 Max.

El modelo base destaca por sus resultados reportados por el proveedor en tareas de ingenieria de software: 69,4 en SWE-bench Verified frente a 53,2 de Qwen3.5-9B, y 43,1 en Terminal-Bench 2.1 (Terminus-2) frente a 21,3. Estas cifras, no obstante, no han sido verificadas de forma independiente en la conversion aqui descrita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5: 32 capas, 24 de atencion lineal GatedDeltaNet y 8 de atencion completa (1 de cada 4); hidden size 4096 |
| Parametros totales | 8.953.803.264 (solo decodificador de texto; el release completo con torre de vision suma 9.409.813.744) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens en el modelo original; 4096 tokens en los ficheros LiteRT-LM |
| Tipos de cuantizacion | int8 dinamica, int8 con composites GPU, Mixed INT4 (int4 blockwise-32 + int8 en embedding y lm_head), Mixed INT4 con composites GPU |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base upstream se distribuye en safetensors |

Detalles adicionales de arquitectura: 16 cabezas de atencion con 4 KV heads de 256 dimensiones; atencion lineal con 16 cabezas de clave y 32 de valor de 128 dimensiones; vocabulario de 248.320 tokens con embeddings no atados (*untied*). Solo las 8 capas de atencion completa mantienen una KV cache creciente (presupuesto de 4096 tokens en estos ficheros); las 24 capas de atencion lineal mantienen un estado convolucional y recurrente de tamano constante.

## Arquitectura y entrenamiento

El modelo emplea la arquitectura hibrida de Qwen3.5, que intercala capas de atencion lineal GatedDeltaNet con capas de atencion completa en una proporcion de 3 a 1. Esta combinacion reduce el coste de memoria de la KV cache en contextos largos, ya que solo una cuarta parte de las capas acumula estado creciente, mientras que las capas lineales mantienen un estado de tamano fijo. El vocabulario de 248.320 tokens con embeddings no atados es coherente con el diseno de Qwen3.5.

El entrenamiento descrito por Ornith consiste en un post-entrenamiento sobre Qwen3.5-9B mediante un marco que utiliza aprendizaje por refuerzo (RL) para aprender tanto el *scaffold* que guia los rollouts de solucion como las soluciones mismas, orientado a tareas de codificacion agentica. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas adicionales como RLHF o DPO mas alla del RL mencionado.

La conversion a LiteRT-LM se realizo con litert-torch (commit 115a1360, con el parche hibrido de Qwen3.5). En las variantes cuantizadas, las 48 proyecciones de decaimiento y compuerta de GatedDeltaNet (`in_proj_a` / `in_proj_b`) se mantienen en punto flotante, al igual que las convoluciones y la regla delta, mientras que las capas lineales se cuantizan a int4 blockwise-32 o int8 segun la variante.

## Capacidades

- Generacion de texto y razonamiento: modelo de razonamiento cuyo turno de asistente abre por defecto con un bloque `` vacio, equivalente byte a byte a la renderizacion `enable_thinking=False` de Ornith en conversaciones sin herramientas).
- Codificacion agentica: entrenado especificamente para tareas de ingenieria de software y resolucion de problemas en terminal.
- Razonamiento multi-paso y uso de agentes: disenado para flujos agenticos con *scaffold* aprendido.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision: el checkpoint upstream es multimodal, pero los ficheros LiteRT-LM contienen unicamente el decodificador de texto, por lo que no incluyen la torre de vision.
- Tool calling / function calling: la model card menciona conversaciones con herramientas al describir la equivalencia de plantillas, aunque no se detalla un soporte formal de *tool calling* en estos ficheros.
- Ejecucion on-device y edge: soporte nativo del runtime LiteRT-LM con backend CPU y GPU.

## Casos de uso

- Asistente de codificacion en local para desarrolladores: el modelo puede integrarse en un IDE o terminal para resolver tareas de reparacion de bugs y generacion de parches, aprovechando su entrenamiento especifico en SWE-bench y Terminal-Bench. La variante Mixed INT4 de 6,03 GB cabe en equipos con GPU de consumo.
- Agente autonomo de CI/CD: con 4096 tokens de contexto en estos ficheros, puede gestionar iteraciones acotadas de correccion de tests y aplicacion de parches en pipelines automatizados, ejecutandose en el mismo runner sin depender de APIs externas.
- Inferencia en movil y dispositivos edge: gracias al formato LiteRT-LM y a las variantes int8 e INT4, el modelo puede desplegarse en telefonos y dispositivos con recursos limitados para tareas de asistencia textual y razonamiento breve.
- Prototipado de agentes de codigo en estaciones de trabajo: la velocidad de 44,9 tok/s en GPU de un Mac Studio M4 Max permite ciclos de interaccion fluidos para desarrollo y depuracion de *scaffolds* agenticos.
- Evaluacion de modelos de razonamiento con pensamiento desactivado: la plantilla incluida permite reproducir el comportamiento de Ornith con `enable_thinking=False` de forma exacta, util para comparativas controladas.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT facilita la integracion en productos comerciales y la redistribucion de los ficheros convertidos.
- Educacion e investigacion en arquitecturas hibridas: el modelo sirve como caso de estudio de atencion lineal GatedDeltaNet combinada con atencion completa en un runtime de produccion.

## Benchmarks y rendimiento

Resultados reportados por el proveedor del modelo base (no ejecutados en esta conversion):

| Benchmark | Ornith-1.0-9B | Qwen3.5-9B |
|---|---|---|
| SWE-bench Verified | 69,4 | 53,2 |
| Terminal-Bench 2.1 (Terminus-2) | 43,1 | 21,3 |

Rendimiento de inferencia medido en la conversion LiteRT-LM (Mac Studio M4 Max, litert-lm 0.18.0):

| Metrica | Valor |
|---|---|
| Decodificacion, Mixed INT4, GPU | 44,9 tok/s (medido 2026-10-15) |
| Mejora de prefill, `mixed_int4_gpu_composite_v0190` vs `mixed_int4`, GPU, litert-lm 0.19.2 | +29,4 % |
| Mejora de decodificacion, misma comparacion | +24,8 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,03 GB para la variante Mixed INT4 con composites GPU y 9,17-9,20 GB para las variantes int8.
- GPU recomendadas: Mac Studio M4 Max (GPU) validado con litert-lm 0.18.0 y 0.19.2; el modelo base en bf16 ocupa unos 19 GB.
- Cabe en GPU de consumo: si, las variantes INT4 de ~6 GB caben en GPUs con 8 GB o mas de VRAM; las variantes int8 requieren al menos 10-12 GB.
- Opciones de despliegue: runtime LiteRT-LM (version 0.19.0 o superior para los ficheros `gpu_composite_v0190`; version 0.20.x recomendada para el fichero GPU `mixed_int4_gpu_composite_v0200`). No se documentan opciones para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: 44,9 tok/s de decodificacion en GPU de Mac Studio M4 Max con Mixed INT4 (litert-lm 0.18.0); mejora del 24,8 % en decodificacion y del 29,4 % en prefill con los ficheros `gpu_composite_v0190` sobre litert-lm 0.19.2. El estado en telefono se remite a la seccion Performance de la model card original, no incluida aqui.
- Nota: los ficheros `gpu_composite_v0190` declaran `min_runtime_version` 0.19.0; en la GPU de 0.18.1 devuelven `!!!…`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.0-9B (esta ficha) | 8,95 B (texto) | 262.144 original; 4096 en LiteRT-LM | 69,4 (proveedor) | MIT | `.litertlm` |
| Qwen3.5-9B (modelo base) | ~9 B | no disponible | 53,2 (proveedor) | no disponible | safetensors |
| Qwen3.5-4B (conversion LiteRT-LM) | ~4 B | no disponible | no disponible | no disponible | `.litertlm` |
| Qwen3.5-2B (conversion LiteRT-LM) | ~2 B | no disponible | no disponible | no disponible | `.litertlm` |

La comparativa con alternativas de la misma categoria se limita a la familia Qwen3.5, dado que la informacion proporcionada no incluye otros modelos comparables de 9B orientados a codificacion agentica.

## Limitaciones y advertencias

- Contexto reducido en la conversion: los ficheros LiteRT-LM limitan la ventana a 4096 tokens frente a los 262.144 del modelo original, lo que restringe tareas de contexto largo.
- Sin vision: la torre de vision del checkpoint upstream no esta incluida; estos ficheros solo procesan texto.
- Pensamiento desactivado: la plantilla de chat ejecuta el modelo con `enable_thinking=False` fijo, sin conmutador. No es posible activar el modo de razonamiento explicito con estos ficheros.
- Benchmarks no verificados: los resultados de SWE-bench y Terminal-Bench son reportados por el proveedor y no se han reproducido en la conversion.
- Idiomas no documentados: no se especifican los idiomas soportados, lo que impide garantizar calidad multilingue.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan evaluaciones de factualidad.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Compatibilidad de runtime: los ficheros `gpu_composite_v0190` requieren LiteRT-LM 0.19.0 o superior; en versiones anteriores fallan en GPU. Los ficheros int8 y Mixed INT4 basicos se probaron en litert-lm 0.18.0.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar las condiciones del modelo base upstream (Qwen3.5-9B) y de los datos de post-entrenamiento de Ornith.
- Madurez: modelo con 518 descargas y 1 like en el momento de la ficha; ecosistema de conversion joven y en evolucion (multiples revisiones de ficheros en octubre y noviembre de 2026).

## Enlaces

- Repositorio Hugging Face de la conversion: https://huggingface.co/litert-community/Ornith-1.0-9B
- Modelo base Ornith: https://huggingface.co/ornith-ai/Ornith-1.0-9B
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Conversion Qwen3.5-4B a LiteRT-LM: https://huggingface.co/litert-community/Qwen3.5-4B
- Conversion Qwen3.5-2B a LiteRT-LM: https://huggingface.co/litert-community/Qwen3.5-2B
- Conversion Qwen3.5-0.8B a LiteRT-LM: https://huggingface.co/litert-community/Qwen3.5-0.8B
