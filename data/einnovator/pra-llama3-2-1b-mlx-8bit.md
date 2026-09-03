# EInnovator/pra-llama3-2-1b-mlx-8bit

## Resumen

EInnovator/pra-llama3-2-1b-mlx-8bit es un bundle de runtime para Progressive Retrieval Attention (PRA) aplicado al modelo base `mlx-community/Llama-3.2-1B-Instruct-8bit`. No contiene los pesos del modelo base, sino un mapeo estructural, perfiles de runtime, componentes aprendidos opcionales, metadatos de compatibilidad y evidencia de calificación medida. PRA es una técnica que reduce el contexto visible seleccionando dinámicamente los tokens K/V relevantes, lo que permite procesar ventanas largas con menos tokens visibles y menor latencia.

El bundle está desarrollado por EInnovator y está pensado para el motor MLX en hardware Apple Silicon. En las pruebas publicadas, consigue una reducción del 91,5 % en tokens visibles sin degradar la calidad (token_f1 idéntico al baseline) y una mejora del 6,9 % en el tiempo hasta el primer token (TTFT). El modelo base es un Llama 3.2 de 1B parámetros con instruction tuning, cuantizado a 8 bits en formato MLX.

La relevancia de este bundle radica en que permite ejecutar tareas de contexto largo en modelos pequeños con menor coste computacional, manteniendo la paridad de calidad. Sin embargo, es un proyecto muy reciente (creado en septiembre de 2026) con cero descargas y sin adaptador aprendido calificado, por lo que su madurez para producción es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Transformer decoder) |
| Parametros totales | 1B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion del bundle |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | No disponible |
| Licencia | llama3.2 |
| Formato de pesos | MLX (el bundle no contiene pesos del modelo base) |

## Arquitectura y entrenamiento

El bundle implementa Progressive Retrieval Attention (PRA), una tecnica que en lugar de procesar toda la ventana de contexto, selecciona de forma progresiva los tokens K/V mas relevantes para la generacion. El modelo base es `mlx-community/Llama-3.2-1B-Instruct-8bit`, un transformer decoder con 1B parametros y post-entrenamiento mediante instruction tuning. El bundle anade un mapeo estructural y perfiles de runtime especificos para este modelo, pero no es un fine-tune LoRA convencional.

Los datos de entrenamiento del bundle incluyen los datasets de QA multihop `2wikimultihopqa`, `hotpotqa`, `qasper` y un dataset combinado (`combined`). No se especifica el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. La evidencia publicada corresponde a una unica configuracion: motor MLX, modo Native Memory y perfil BALANCED. Los perfiles QUALITY y ECONOMY estan pendientes de calibracion, y no hay un adaptador aprendido calificado (estado `NO_QUALIFIED_ADAPTER`).

## Capacidades

- Generacion de texto con atencion progresiva: reduce el contexto visible seleccionando tokens K/V relevantes, manteniendo la calidad del modelo base.
- Reduccion de tokens visibles: en las pruebas, pasa de 390,87 tokens visibles a 33,25 (-91,5 %), seleccionando 357,62 tokens K/V nativos.
- Mejora del tiempo hasta el primer token (TTFT): reduccion del 6,9 % en p50 y del 12,8 % en p95.
- Compatibilidad con el motor MLX en Apple Silicon: probado en Apple M4 Pro con 48 GB de RAM.
- Modo Native Memory cualificado: el modo recomendado esta implementado y cualificado para este modelo.
- Paridad de calidad: token_f1 identico al baseline (0,1254) en el workload combinado, con 60/60 pares coincidentes.

## Casos de uso

- Inferencia de contexto largo en Apple Silicon: el bundle permite procesar consultas con mucho contexto en un Mac con chip M4 Pro usando solo 1,24 GiB de memoria pico, gracias a la reduccion de tokens visibles.
- QA multihop sobre documentos extensos: los datasets de entrenamiento (hotpotqa, 2wikimultihopqa, qasper) indican que el modelo esta orientado a preguntas que requieren razonamiento sobre multiples fragmentos de evidencia.
- Reduccion de latencia en servicios de chat: la mejora del TTFT p50 (-6,9 %) y p95 (-12,8 %) puede beneficiar aplicaciones interactivas donde el primer token es critico.
- Despliegue en dispositivos con memoria limitada: al ser un modelo de 1B en 8 bits y con PRA, cabe en entornos con restricciones de VRAM, como portatiles Apple Silicon.
- Evaluacion de tecnicas de atencion selectiva: el bundle sirve como referencia para investigar el impacto de PRA en modelos pequenos, con evidencia medida y reproducible.
- Prototipado rapido de agentes con contexto largo: la reduccion del contexto visible permite mantener conversaciones multi-turno extensas sin degradar la calidad, aunque la ausencia de tool calling no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye metricas propias de calidad y rendimiento para el workload `combined` (n=60) en la configuracion mlx-lm / balanced:

| Metrica | Unidad | No PRA | PRA - No Adaptor | Delta |
|---|---|---|---|---|
| Token F1 | fraccion | 0,125357 | 0,125357 | +0,00 % |
| Exact Match | fraccion | 0 | 0 | +0 |
| Gold Answer Log Probability | log_prob | -15,0841 | -15,0841 | -0,00 % |
| Visible Tokens | token | 390,867 | 33,25 | -91,49 % |
| Selected Native K/V Tokens | token | 0 | 357,617 | +357,617 |
| TTFT p50 | ms | 31,8044 | 29,6227 | -6,86 % |
| TTFT p95 | ms | 36,076 | 31,4482 | -12,83 % |
| TTFT p99 | ms | 87,1491 | 92,627 | +6,29 % |
| ITL p50 | ms | 6,13011 | 6,26277 | +2,16 % |
| ITL p95 | ms | 6,66693 | 6,42713 | -3,60 % |
| ITL p99 | ms | 7,20762 | 7,41378 | +2,86 % |
| Output Tokens Per Second | token/s | 138,47 | 138,864 | +0,28 % |
| Completion Latency Mean | ms | 173,813 | 173,39 | -0,24 % |

La calidad absoluta es baja (token_f1 de 0,1254 y exact match de 0), lo que refleja la dificultad de las tareas QA multihop con un modelo de 1B. PRA no degrada la calidad, pero tampoco la mejora.

## Requisitos de hardware

- VRAM estimada: 1,24 GiB de memoria pico medida en Apple M4 Pro con 48 GB (runtime smoke).
- GPU recomendada: Apple Silicon (probado en M4 Pro); no hay datos para GPUs NVIDIA o AMD.
- Compatibilidad con GPU de consumo: si, en Macs con Apple Silicon y al menos 8 GB de RAM unificada (estimacion conservadora basada en la memoria pico medida).
- Opciones de despliegue: motor MLX (mlx-lm 0.31.3); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: TTFT p50 de 29,6 ms, ITL p50 de 6,26 ms, 138,9 tokens/s de salida en el hardware de prueba.
- Carga del checkpoint: 46,73 s en el runtime smoke (carga en frio).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (bundle PRA para Llama 3.2 1B). La unica comparacion posible es contra el modelo base sin PRA, cuyos resultados se muestran en la tabla de benchmarks. No hay datos de otros bundles PRA ni de alternativas como adaptadores LoRA para el mismo modelo base.

## Limitaciones y advertencias

- El bundle no contiene los pesos del modelo base: es necesario descargar `mlx-community/Llama-3.2-1B-Instruct-8bit` por separado y fijar la revision `d48cdf0a4ea22d893b7c63a99d6a693e24822795`.
- Solo hay evidencia medida para el perfil BALANCED en modo Native Memory; los perfiles QUALITY y ECONOMY estan pendientes de calibracion.
- No existe un adaptador aprendido calificado (`NO_QUALIFIED_ADAPTER`), por lo que la unica via validada es la seleccion de tokens K/V nativos sin componentes aprendidos.
- La calidad absoluta es baja (token_f1 de 0,1254, exact match de 0) en las tareas evaluadas; no es adecuado para tareas que requieran alta precision sin fine-tuning adicional.
- El proyecto tiene cero descargas y cero likes, y su fecha de creacion es futura (septiembre de 2026), lo que indica que es un experimento muy reciente sin adopcion comunitaria.
- Solo se ha probado en hardware Apple Silicon con motor MLX; no hay evidencia de funcionamiento en otros entornos.
- La licencia llama3.2 puede imponer restricciones de uso comercial; se debe revisar el texto completo de la licencia antes de desplegar en produccion.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; el bundle se limita a generacion de texto con atencion selectiva.

## Enlaces

- Repositorio del bundle: https://huggingface.co/EInnovator/pra-llama3-2-1b-mlx-8bit
- Modelo base: https://huggingface.co/mlx-community/Llama-3.2-1B-Instruct-8bit
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web.
