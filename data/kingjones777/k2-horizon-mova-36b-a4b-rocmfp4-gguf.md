# kingjones777/K2-Horizon-MoVA-36B-A4B-ROCmFP4-GGUF

## Resumen

K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de arquitectura mixta de expertos (MoE) desarrollado por IFM/MBZUAI, con una atencion innovadora basada en valores (Mixture-of-Values, MoVA). Esta version concreta, publicada por kingjones777, es una cuantizacion ROCmFP4/ROCmFPX del modelo original en formato GGUF, optimizada especificamente para hardware AMD Strix Halo (gfx1151), como el Ryzen AI Max+ 395. El modelo almacena 37.444.792.020 parametros totales (~36B nominales) pero ejecuta aproximadamente 4B por token, lo que le permite decodificar mucho mas rapido que un modelo denso de 32B en el mismo hardware.

Se trata de un modelo de razonamiento que emite cadenas de pensamiento en el campo `reasoning_content` antes de responder. La cuantizacion incluye cuatro variantes: tres en Q4_0 ROCmFP4 (FAST, STRIX_LEAN y COHERENT) y una en Q8_0 ROCmFPX (AGENT), con velocidades medidas de hasta 41 tokens/s en decodificacion y 1238 tokens/s en prefill. El contexto probado es de 8192 tokens. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | k2-horizon MoVA (dual-expert MoE: 64-way value-expert bank top-4 + 100-way feed-forward MoE top-8, 48 capas, hidden 2560) |
| Parametros totales | 37.444.792.020 (~36B nominales) |
| Parametros activos | ~4B |
| Longitud de contexto | 8192 tokens (configuracion usada en las pruebas del autor) |
| Tipos de cuantizacion | Q4_0_ROCMFP4 (FAST, STRIX_LEAN, COHERENT), Q8_0_ROCMFPX (AGENT) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura k2_horizon de IFM/MBZUAI, que combina dos sistemas de expertos independientes: un banco de expertos de valor de 64 vias con seleccion top-4 (MoVA, Mixture-of-Values attention) y un MoE feed-forward de 100 vias con seleccion top-8. La red consta de 48 capas con una dimension oculta de 2560. Al ser un modelo sparse (A4B), solo ~4B de los 36B parametros se activan por token, lo que reduce significativamente el coste computacional por token en comparacion con un modelo denso de tamano equivalente.

El modelo es un razonador: emite pensamiento en el campo `reasoning_content` antes de dar la respuesta final. Los datos exactos de entrenamiento (numero de tokens, composicion del dataset, si hubo RLHF/DPO) no estan disponibles en la informacion proporcionada. Esta version concreta es una cuantizacion del modelo base IFM/K2-Horizon-MoVA-36B-A4B, realizada sobre el GGUF BF16 oficial mediante la herramienta `llama-quantize`, sin override del tipo de salida de las cabeceras.

## Capacidades

- Generacion de texto con capacidades de razonamiento: el modelo emite cadenas de pensamiento antes de la respuesta final.
- Razonamiento multi-paso y capacidad para tareas de agente: la variante AGENT (Q8_0) esta orientada a routing de tool calls y workflows agenticos.
- Eficiencia computacional: al activar solo ~4B parametros por token, decodifica mucho mas rapido que un modelo denso de 32B en el mismo hardware.
- Soporte de tool calling / function calling: mencionado en la variante AGENT.
- Inferencia local en hardware AMD con ROCm y Vulkan: los mismos ficheros GGUF funcionan con ambos backends.
- Soporte para RAG y prompts largos: el prefill medido de hasta 1238 tokens/s favorece escenarios con mucho contexto.

Nota: no se especifican capacidades de vision, audio ni soporte multilingue en la informacion disponible.

## Casos de uso

1. Asistentes de razonamiento en local: el modelo puede ejecutarse en un Ryzen AI Max+ 395 con 128 GB de memoria unificada, ofreciendo 41 tokens/s en decodificacion, lo que permite asistentes conversacionales con razonamiento en tiempo real sin depender de la nube.

2. RAG con contexto largo: con un prefill de 1238 tokens/s, el modelo puede procesar rapidamente documentos largos y consultas con mucho contexto, ideal para sistemas de recuperacion aumentada.

3. Agentes con tool calling: la variante Q8_0_ROCMFPX_AGENT esta disenada para routing de llamadas a herramientas, permitiendo integrar el modelo en pipelines de agentes que necesitan decidir que funcion invocar.

4. Despliegue en hardware AMD Strix Halo: los ficheros GGUF estan optimizados para gfx1151 (Radeon 8060S) con ROCm 7.2.4, por lo que son adecuados para equipos portatiles o estaciones de trabajo con APU AMD de ultima generacion.

5. Servidores de inferencia con llama.cpp: el modelo puede servirse con `llama-server` usando los backends HIP (ROCm) o Vulkan, con los mismos ficheros, lo que simplifica el despliegue y las pruebas A/B entre backends.

6. Prototipado de modelos razonadores en entornos AMD: al ser una cuantizacion con tipos ROCmFP4 propietarios de ROCmFPX, permite evaluar el rendimiento de la cuantizacion FP4 en hardware AMD sin necesidad de GPU NVIDIA.

7. Evaluacion de tecnicas de cuantizacion: los cuatro ficheros permiten comparar el rendimiento (decodificacion, prefill) entre Q4_0 ROCmFP4 y Q8_0 ROCmFPX en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento medidos corresponden a velocidad de decodificacion y prefill, obtenidos en un Ryzen AI Max+ 395 (Radeon 8060S, gfx1151, 128 GB unificados, ROCm 7.2.4):

| Fichero | Tipo | Tamano | Decodificacion (HIP) | Prefill (HIP) |
|---|---|---|---|---|
| Q4_0_ROCMFP4_FAST | 103 | 18.57 GiB | 41.0 t/s | 1238 t/s |
| Q4_0_ROCMFP4_STRIX_LEAN | 106 | 18.67 GiB | 41.0 t/s | 1227 t/s |
| Q4_0_ROCMFP4_COHERENT | 102 | 19.81 GiB | 39.5 t/s | 1114 t/s |
| Q8_0_ROCMFPX_AGENT | 115 | 36.45 GiB | 28.9 t/s | 1183 t/s |

El autor indica que la variante FAST es la mas rapida en ambos ejes y que las cuatro variantes responden correctamente. La variante AGENT solo debe elegirse si se desean pesos de 8 bits.

## Requisitos de hardware

- VRAM estimada: los ficheros Q4_0 ocupan entre 18.57 y 19.81 GiB; el fichero Q8_0 ocupa 36.45 GiB. En el hardware de prueba (128 GB unificados) se usan con `-ngl 999` y `--no-mmap`.
- GPU recomendada: AMD Radeon 8060S (gfx1151) integrada en el Ryzen AI Max+ 395, con ROCm 7.2.4. El autor no reporta mediciones en GPUs NVIDIA.
- No se indica compatibilidad con consumer GPU NVIDIA. El modelo requiere un build especifico de llama.cpp con soporte para la arquitectura k2_horizon y los tipos ROCmFP4/ROCmFPX.
- Opciones de despliegue: `llama-server` con backend HIP (ROCm) o Vulkan. Se requieren builds con ambos soportes: el fork MBZUAI-IFM/llama.cpp (rama model/K2Horizon) para la arquitectura y ROCmFPX para los tipos de cuantizacion.
- Latencia y throughput: medidos en el hardware de referencia: 41.0 t/s de decodificacion y 1238 t/s de prefill en la variante FAST.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B | 37.4B | ~4B | 8192 (probado) | Apache-2.0 | MoE + MoVA, razonador, disponible en GGUF ROCmFP4 |
| Modelo denso 32B (mencionado por el autor) | ~32B | 32B | no disponible | no disponible | El autor indica que el A4B decodifica mucho mas rapido en el mismo hardware |
| Otros MoE comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas con datos en la informacion disponible |

Nota: no se dispone de benchmarks de calidad comparativos. La unica comparacion cualitativa es la del autor, que afirma que el modelo A4B decodifica mas rapido que un modelo denso de 32B en el mismo hardware.

## Limitaciones y advertencias

- Requiere un build especifico de llama.cpp con la arquitectura k2_horizon y los tipos ROCmFP4/ROCmFPX. Ningun build publico estandar incluye ambos todavia; es necesario aplicar el parche `k2-horizon-on-rocmfpx.patch` incluido en el repositorio.
- El modelo es un razonador: si el presupuesto de tokens de razonamiento es demasiado corto, la respuesta puede devolver HTTP 200 con el campo `content` vacio y los tokens en `reasoning`. El autor recomienda ~500 tokens para respuestas cortas y llamadas a herramientas, y mas para respuestas largas.
- La variante AGENT (Q8_0) tiene mayor tamano (36.45 GiB) y menor velocidad de decodificacion (28.9 t/s) que las variantes Q4_0.
- No se especifican los idiomas soportados. La metadata de HuggingFace indica "Idiomas: no disponibles".
- No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) para esta cuantizacion.
- El modelo base es Apache-2.0, lo que permite uso comercial, pero el soporte de inferencia depende de herramientas de terceros (ROCmFPX) que pueden tener sus propias restricciones.
- Los datos de rendimiento fueron medidos en un unico hardware especifico (Ryzen AI Max+ 395) y pueden no extrapolarse a otros sistemas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/K2-Horizon-MoVA-36B-A4B-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Coleccion K2 Horizon de IFM: https://huggingface.co/collections/IFM/k2-horizon
- Fork de llama.cpp con arquitectura k2_horizon: https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon
- Repositorio ROCmFPX (tipos ROCmFP4/ROCmFPX): https://github.com/ROCmFPX/ROCmFPX
