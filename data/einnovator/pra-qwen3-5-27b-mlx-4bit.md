# EInnovator/pra-qwen3-5-27b-mlx-4bit

## Resumen

El repositorio `EInnovator/pra-qwen3-5-27b-mlx-4bit` es un *bundle* de runtime para Progressive Retrieval Attention (PRA) desarrollado por EInnovator. No contiene los pesos de un modelo de lenguaje, sino un conjunto de mapeos estructurales, perfiles de ejecución, componentes aprendidos opcionales, metadatos de compatibilidad y evidencia de calificación para el modelo base `mlx-community/Qwen3.5-27B-4bit`. El objetivo es aplicar PRA, una técnica que selecciona dinámicamente qué tokens del contexto son relevantes, reduciendo así el número de tokens visibles y, con ello, la latencia y el consumo de memoria en tareas de contexto largo.

La arquitectura subyacente es `Qwen3_5ForConditionalGeneration` con 27.000 millones de parámetros, servida en precisión INT4 mediante MLX-4bit. El bundle está pensado para el motor `mlx` y ofrece varios perfiles de enrutamiento (BALANCED, QUALITY, ECONOMY, QASPER-LEARNED) que controlan qué capas del transformer consumen la selección de contexto. La relevancia actual radica en la necesidad de procesar documentos extensos de forma eficiente: los resultados incluidos muestran reducciones de hasta 4× en el tiempo hasta el primer token y de aproximadamente 1,5 GiB en memoria pico, aunque con una disminución medible de la calidad de respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (modelo base) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los benchmarks usan hasta 3648 tokens visibles) |
| Tipos de cuantizacion | INT4 / MLX-4bit |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (el repositorio contiene un bundle de runtime PRA, no pesos del modelo base) |

## Arquitectura y entrenamiento

El bundle PRA se apoya en el modelo base `mlx-community/Qwen3.5-27B-4bit`, que implementa la arquitectura `Qwen3_5ForConditionalGeneration` con 27B parámetros en cuantización INT4. Según la model card, el modelo base fue preentrenado y post-entrenado (`pretrained and post-trained`). El repositorio no contiene los pesos del modelo base, sino un conjunto de artefactos de PRA: mapeos estructurales, perfiles de runtime, componentes aprendidos opcionales y evidencia de calificación. No se trata de un fine-tune LoRA convencional.

La innovación técnica es Progressive Retrieval Attention, que selecciona dinámicamente un subconjunto de tokens del contexto (modo "Selected Context") en lugar de procesar todo el contexto visible. El bundle define perfiles que especifican las capas consumidoras (por ejemplo, las capas 3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59 y 63 para los perfiles QUALITY y BALANCED) y el mecanismo de enrutamiento (coseno genérico o un router aprendido `combined-router-d128`). La evidencia de calificación se limita a los datasets `hotpotqa` y `qasper`, con un estado de evidencia "CONTROLLED" y una nota de que "Native Memory" no está disponible (`UNAVAILABLE_HYBRID_STATE`).

## Capacidades

- Generación de texto con contexto largo mediante selección progresiva de tokens relevantes (modo "Selected Context").
- Razonamiento multi-hop sobre documentos, evaluado en los datasets HotpotQA y Qasper.
- Reducción del número de tokens visibles: en HotpotQA pasa de 1669 tokens (sin PRA) a 375,3 tokens (PRA_GENERIC); en Qasper, de 3648 a 772,9 tokens.
- Reducción de la latencia: el tiempo medio hasta el primer token (TTFT) en HotpotQA baja de 15.310 ms a 3.642 ms con PRA_GENERIC.
- Reducción del pico de memoria: de 17,27 GiB a 15,72 GiB en HotpotQA y de 17,27 GiB a 15,73 GiB en Qasper.
- Perfiles configurables (BALANCED, QUALITY, ECONOMY, QASPER-LEARNED) para ajustar el equilibrio entre precisión y eficiencia.
- Soporte de tool calling, agentes, visión, audio y multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Asistente de investigación documental: procesar papers académicos largos (dataset Qasper) para responder preguntas sobre el contenido, seleccionando solo los fragmentos relevantes y reduciendo el coste computacional.
- Razonamiento multi-hop sobre conocimiento: en tareas tipo HotpotQA, combinar información de varios pasajes para responder preguntas compuestas, aprovechando la selección de contexto para limitar los tokens visibles.
- Optimización de pipelines de RAG: al reducir los tokens visibles, se disminuye la latencia y el uso de memoria en servicios de recuperación aumentada que manejan documentos extensos.
- Análisis de documentos legales o financieros: documentos largos donde la selección de evidencia es crítica; el perfil BALANCED ofrece un equilibrio entre rendimiento y eficiencia.
- Despliegue en hardware con memoria limitada: con picos de memoria de aproximadamente 15,7 GiB, el modelo puede ejecutarse en GPUs de gama alta de consumo o en sistemas con memoria unificada compatibles con MLX.
- Investigación en eficiencia de atención: el bundle proporciona perfiles y evidencia para estudiar métodos de atención progresiva en modelos de 27B, permitiendo comparar PRA_GENERIC, PRA_LEARNED y controles de disponibilidad de evidencia.

## Benchmarks y rendimiento

Los resultados de la tabla se obtuvieron con una muestra de 16 ejemplos por dataset. La condición `FULL_NO_PRA` corresponde al modelo base sin PRA; `PRA_GENERIC` usa un selector de coseno genérico; `PRA_LEARNED` usa un router aprendido; `PRA_ORACLE_CONTROL` es un control de disponibilidad de evidencia, no desplegable en producción.

| Dataset | Condición | Token F1 | Exact match | Evidencia recall | Tokens visibles | TTFT medio | Decode tok/s | Memoria pico |
|---|---:|---:|---:|---:|---:|---:|---:|
| hotpotqa (n=16) | FULL_NO_PRA | 0,8869 | 0,6875 | 1 | 1669 | 15.310 ms | 14,42 | 17,27 GiB |
| hotpotqa (n=16) | PRA_GENERIC | 0,6019 | 0,4375 | 0,5058 | 375,3 | 3.642 ms | 13,61 | 15,72 GiB |
| hotpotqa (n=16) | PRA_LEARNED | 0,3199 | 0,25 | 0,2923 | 374,7 | 3.638 ms | 15,57 | 15,72 GiB |
| hotpotqa (n=16) | PRA_ORACLE_CONTROL | 0,8997 | 0,75 | 1 | 375,2 | 3.640 ms | 14,6 | 15,72 GiB |
| qasper (n=16) | FULL_NO_PRA | 0,5321 | 0,5 | 1 | 3648 | 32.940 ms | 5,695 | 17,27 GiB |
| qasper (n=16) | PRA_GENERIC | 0,3854 | 0,375 | 0,3439 | 772,9 | 7.095 ms | 2,922 | 15,73 GiB |
| qasper (n=16) | PRA_LEARNED | 0,4593 | 0,4375 | 0,5531 | 773 | 7.079 ms | 3,866 | 15,73 GiB |
| qasper (n=16) | PRA_ORACLE_CONTROL | 0,4697 | 0,4375 | 0,9581 | 772,8 | 7.042 ms | 5,841 | 15,73 GiB |

Observaciones: la reducción de tokens visibles es notable, pero el selector genérico degrada el Token F1 en ambos datasets. El router aprendido mejora respecto al genérico en Qasper (0,4593 frente a 0,3854), pero empeora en HotpotQA (0,3199 frente a 0,6019). El control oracle muestra que la selección perfecta de evidencia mantendría un rendimiento cercano al modelo completo, lo que indica que los selectores actuales son el principal cuello de botella.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 15,72 y 17,27 GiB según los benchmarks, dependiendo de si se aplica PRA y del dataset. El pico de memoria con PRA es de aproximadamente 15,7 GiB.
- GPU recomendadas: una GPU con al menos 16 GiB de VRAM, como una RTX 4080 o RTX 4090, o un sistema Apple Silicon con memoria unificada suficiente, dado que el motor recomendado es MLX.
- ¿Cabe en GPU de consumo? Sí, en GPUs de gama alta con 16 GiB o más. No se especifica compatibilidad con GPUs de 8 o 12 GiB.
- Opciones de despliegue: el motor recomendado es `mlx`, utilizando la librería `pra-hf` (instalación con `pip install 'pra-hf[hf-hub,hf-runtime]'`). Los comandos proporcionados son `pra inspect`, `pra evaluate`, `pra recommend` y `pra serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue para este bundle.
- Latencia y throughput estimados: en el entorno de evaluación, el TTFT medio con PRA_GENERIC es de 3.642 ms en HotpotQA y 7.095 ms en Qasper; la velocidad de decodificación es de 13,61 tok/s en HotpotQA y 2,922 tok/s en Qasper. Sin PRA, el TTFT es de 15.310 ms y 32.940 ms, respectivamente.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. La comparación más directa es con el modelo base `mlx-community/Qwen3.5-27B-4bit` sin el adaptador PRA, cuyos resultados se detallan en la sección de benchmarks. No se conocen otros adaptadores PRA para el mismo modelo base que permitan una comparativa de parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo base; es necesario descargar `mlx-community/Qwen3.5-27B-4bit` y aplicar el bundle PRA. No es un modelo independiente.
- Los resultados de benchmarks se obtuvieron con una muestra de solo 16 ejemplos por dataset, por lo que no son estadísticamente representativos.
- El selector PRA_GENERIC degrada el rendimiento en ambos datasets (HotpotQA y Qasper). El router aprendido solo mejora en Qasper y empeora en HotpotQA, por lo que su uso fuera del dominio de calificación es arriesgado.
- El modo "Native Memory" no está disponible (`UNAVAILABLE_HYBRID_STATE`).
- La evidencia de calificación es parcial: aunque el perfil BALANCED aparece como "QUALIFIED" en la tabla de perfiles, la tabla de evidencia por motor indica "NEEDS_RUN" para las métricas del bundle en ese perfil. Existe una discrepancia que debería resolverse antes de usar el bundle en producción.
- La licencia del bundle es Apache-2.0, pero el modelo base puede tener su propia licencia y condiciones de uso, que no se detallan en la información proporcionada.
- No se han evaluado sesgos, riesgo de alucinación ni limitaciones de idioma. La longitud máxima de contexto del modelo base no está especificada.

## Enlaces

- Repositorio del bundle PRA: https://huggingface.co/EInnovator/pra-qwen3-5-27b-mlx-4bit
- Modelo base: https://huggingface.co/mlx-community/Qwen3.5-27B-4bit
- Colección Qwen3 en HuggingFace: https://huggingface.co/collections/Qwen/qwen3
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:27b
- Instalación de la librería PRA: `pip install 'pra-hf[hf-hub,hf-runtime]'`
