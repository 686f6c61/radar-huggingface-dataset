# kingjones777/LFM2-24B-A2B-ROCmFPX-GGUF

## Resumen

LFM2-24B-A2B-ROCmFPX-GGUF es una serie de cuantizaciones GGUF del modelo LFM2-24B-A2B de Liquid AI, adaptadas específicamente para hardware AMD con arquitectura gfx1151 (Ryzen AI MAX+ 395, también conocido como Strix Halo). El modelo base es un Mixture-of-Experts (MoE) híbrido de 24 000 millones de parámetros totales con solo 2 000 millones activos por paso, lo que lo convierte en una opción eficiente para despliegue en dispositivos de consumo. Esta versión cuantizada es la primera en emplear los nuevos formatos ROCmFP4 y ROCmFPX, que no están soportados por el llama.cpp estándar y requieren un fork específico.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 24B en una APU de gama alta con memoria unificada, manteniendo velocidades de decodificación de entre 66 y 95 tokens por segundo según la cuantización elegida. El repositorio incluye cuatro variantes con diferentes equilibrios entre tamaño, fidelidad y rendimiento, todas derivadas de una fuente BF16 sin pérdida, lo que evita los problemas de requantización. No se han publicado resultados de benchmarks de calidad ni pruebas de contexto largo, por lo que la evaluación se limita a pruebas de corrección básica y mediciones de velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) hibrida, 40 capas, hidden 2048, 64 expertos |
| Parametros totales | 23 843 661 440 (23,84 B) |
| Parametros activos | 2 B (por paso forward) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT, Q6_0_ROCMFPX_AGENT, Q8_0_ROCMFPX, Q8_0_ROCMFPX_AGENT |
| Idiomas soportados | ingles |
| Licencia | lfm1.0 (otra, no estandar) |
| Formato de pesos | GGUF (safetensors no incluido) |

## Arquitectura y entrenamiento

El modelo base LFM2-24B-A2B es un MoE hibrido disenado por Liquid AI para despliegue en dispositivos. Emplea 64 expertos con 2 000 millones de parametros activos por token, lo que reduce el coste computacional frente a un modelo denso del mismo tamano. La arquitectura combina mecanismos de atencion con otras tecnicas propias de Liquid AI, aunque los detalles concretos de la capa de atencion o posibles innovaciones (como atencion lineal o estados hibridos) no se especifican en la informacion disponible. El entrenamiento del modelo base no se detalla en esta ficha; se desconoce el numero de tokens, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO.

Esta version concreta es una cuantizacion del modelo base, no un reentrenamiento. Se partio de un GGUF BF16 (fuente sin perdida) y se aplicaron los nuevos formatos ROCmFP4 y ROCmFPX, que utilizan una representacion de punto flotante de 4 y 8 bits optimizada para hardware AMD. No se incluyen tensores para decodificacion especulativa (MTP, EAGLE, nextn), por lo que no es posible acelerar la generacion con tecnicas de speculative decoding. Ademas, el embedding esta atado a la salida, de modo que no existe un peso `output.weight` separado; la proteccion de la cabeza se gestiona mediante `--token-embedding-type`.

## Capacidades

- Generacion de texto en ingles: el modelo base es un LLM generalista capaz de producir texto coherente, aunque no se han publicado evaluaciones especificas de calidad en esta cuantizacion.
- Razonamiento y matematicas basicas: las pruebas de correccion incluidas en la model card verifican operaciones aritmeticas simples (17x23=391), conocimiento factual (capital de Japon) y calculo de dias en un anio bisiesto (2024=366), con exito en las tres.
- Soporte de tool calling y agentes: el modelo base probablemente lo soporta, y las variantes `AGENT` estan disenadas para mantener mayor precision en los tensores relevantes para llamadas a herramientas, pero no se ha realizado ninguna evaluacion de tool-calling en esta version.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte para otros idiomas.
- Despliegue en hardware AMD: los formatos ROCmFP4 y ROCmFPX estan optimizados para la arquitectura gfx1151, permitiendo ejecutar el modelo en APUs como el Ryzen AI MAX+ 395 con memoria unificada.

## Casos de uso

- Asistente local de codigo en una laptop con Strix Halo: con la cuantizacion Q4_0_ROCMFP4_COHERENT (12,54 GiB) se puede ejecutar en una APU con 128 GB de memoria unificada, obteniendo unos 95 tokens por segundo, suficiente para autocompletado y generacion de fragmentos de codigo en entornos offline.
- Agente conversacional con llamada a herramientas en entornos AMD: las variantes `AGENT` (Q6_0_ROCMFPX_AGENT y Q8_0_ROCMFPX_AGENT) mantienen mayor precision en los tensores de ruteo, lo que puede mejorar la coherencia en flujos multi-paso que requieren invocar funciones externas, aunque esta capacidad no ha sido verificada.
- Prototipado de aplicaciones de IA generativa en hardware de consumo: al ser un MoE con solo 2B activos, el modelo ofrece una latencia aceptable en una sola GPU o APU, permitiendo iterar rapidamente sobre prompts y respuestas sin depender de servicios en la nube.
- Generacion de documentacion tecnica y resumen de textos en ingles: el modelo base es adecuado para tareas de redaccion y resumen, y las cuantizaciones de 8 bits (Q8_0_ROCMFPX) ofrecen la mayor fidelidad para estos usos donde la precision del texto es critica.
- Evaluacion de tecnicas de cuantizacion especificas para AMD: este repositorio sirve como referencia para desarrolladores que investigan el impacto de los formatos ROCmFP4/ROCmFPX en la velocidad y la calidad, ya que incluye mediciones de decodificacion y pruebas de correccion.
- Despliegue en entornos con restricciones de memoria: la variante Q4_0_ROCMFP4_COHERENT, con 12,54 GiB, cabe en sistemas con 16 GB de VRAM o memoria unificada, habilitando inferencia local en equipos portatiles de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye pruebas de correccion basica (3/3 aciertos en operaciones aritmeticas y conocimiento factual) y mediciones de velocidad de decodificacion en un Ryzen AI MAX+ 395 con ROCm, que se resumen a continuacion:

| Cuantizacion | Tamano | bpw | Decodificacion (mediana, tokens/s) |
|---|---|---|---|
| Q4_0_ROCMFP4_COHERENT | 12,54 GiB | 4,52 | 95,24 |
| Q6_0_ROCMFPX_AGENT | 20,47 GiB | 7,37 | 67,51 |
| Q8_0_ROCMFPX | 22,92 GiB | 8,26 | 67,37 |
| Q8_0_ROCMFPX_AGENT | 23,26 GiB | 8,38 | 66,53 |

Estas mediciones se realizaron con `-ngl 999 -c 4096 -fa on -fit off`, mediana de 3 ejecuciones con warm-up descartado. No se realizaron pruebas de perplexity, ni de contexto largo, ni de tool-calling.

## Requisitos de hardware

- GPU objetivo: AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo) con ROCm. Los formatos ROCmFP4 y ROCmFPX no funcionan en otras arquitecturas ni en llama.cpp estandar.
- VRAM estimada: la cuantizacion Q4_0_ROCMFP4_COHERENT ocupa 12,54 GiB; las variantes de 6 y 8 bits ocupan entre 20,47 y 23,26 GiB. Se recomienda un sistema con al menos 16 GiB de memoria unificada para la version mas pequena, y 32 GiB o mas para las de mayor fidelidad.
- GPU recomendadas: exclusivamente APUs con gfx1151, como el Ryzen AI MAX+ 395. No se ha probado en GPUs discretas AMD ni NVIDIA.
- Opciones de despliegue: solo el fork `charlie12345/ROCmFPX` de llama.cpp es capaz de cargar estos archivos. El llama.cpp estandar reporta `invalid ggml type`. No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: en el hardware de referencia, la decodificacion oscila entre 66 y 95 tokens por segundo segun la cuantizacion, con la variante Q4 como la mas rapida.

## Comparativa con modelos similares

No se dispone de datos publicados que permitan una comparativa rigurosa con otros modelos MoE de tamano similar (por ejemplo, Mixtral 8x7B o Qwen2.5-32B-A2B) en terminos de rendimiento en benchmarks. La informacion disponible se limita a mediciones de velocidad en hardware AMD especifico y a pruebas de correccion basica. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Compatibilidad restringida: los archivos solo funcionan con el fork `charlie12345/ROCmFPX` de llama.cpp; el llama.cpp estandar no los reconoce. Cualquier intento de cargarlos con otra herramienta fallara.
- Sin evaluacion de calidad: no se han realizado pruebas de perplexity, ni comparaciones A/B contra el modelo BF16 original, ni evaluaciones de contexto largo o tool-calling. El rendimiento real en tareas complejas es desconocido.
- Idioma limitado: el modelo solo declara soporte para ingles; su comportamiento en otros idiomas no esta garantizado.
- Licencia lfm1.0: se trata de una licencia propietaria de Liquid AI, no una licencia open source estandar como Apache 2.0 o MIT. Es necesario revisar sus terminos antes de un uso comercial.
- Sin decodificacion especulativa: al no incluir tensores MTP/EAGLE/nextn, no es posible acelerar la generacion con tecnicas de speculative decoding.
- Sesgos y alucinaciones: al ser un modelo de lenguaje generico, puede producir contenido sesgado o alucinaciones, especialmente en dominios especializados. No se ha realizado ninguna auditoria de sesgos en esta version.
- Requisito de hardware especifico: el rendimiento medido solo es valido en APUs gfx1151 con ROCm; en otros hardware los resultados pueden variar o el modelo puede no cargar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/LFM2-24B-A2B-ROCmFPX-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2-24B-A2B
- GGUF BF16 del modelo base: https://huggingface.co/LiquidAI/LFM2-24B-A2B-GGUF
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/models/lfm2-24b-a2b
- Ficha en LM Studio: https://lmstudio.ai/models/lfm2-24b-a2b
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
