# amd/granite-4.2-8b-w8a8-llmcompressor

## Resumen

`amd/granite-4.2-8b-w8a8-llmcompressor` es una version cuantizada del modelo `ibm-granite/granite-4.2-8b` de IBM, publicada por AMD. Se trata de una compresion W8A8 (pesos INT8 simetricos por canal y activaciones INT8 dinamicas por token) generada con LLM Compressor mediante el algoritmo Round-to-Nearest (RTN), un metodo sin calibracion. El objetivo no es otro que reducir el espacio en disco y el coste computacional de la inferencia en CPU, concretamente en procesadores AMD EPYC con la pila ZenDNN.

La relevancia de esta ficha reside en que es una de las primeras publicaciones que combina el formato `compressed-tensors` con la pila de inferencia en CPU de AMD (ZenDNN v6.2.0, ZenTorch v2.14.0.3, PyTorch v2.14.0+cpu y vLLM v0.33.0). El modelo pasa de 16,4 GiB en BF16 a 9,0 GiB en disco, una reduccion de aproximadamente el 45%, manteniendo un 98,84% de recuperacion en GSM8K respecto al modelo original.

Arquitectonicamente es un transformer causal denso (`GraniteForCausalLM`) de 8.791.592.960 parametros totales. No se dispone de informacion sobre la longitud de contexto, el numero de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada; se recomienda consultar la model card del modelo base de IBM para esos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (`GraniteForCausalLM`) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W8A8: pesos INT8 simetricos por canal (estatico) y activaciones INT8 simetricas por token (dinamicas); `lm_head`, `embed_tokens` y layer norms en BF16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con `compressed-tensors` (INT8) |
| Modelo base | `ibm-granite/granite-4.2-8b` |
| Framework de cuantizacion | LLM Compressor v0.14.0 (RTN, sin calibracion) |
| Motor de inferencia | vLLM v0.33.0 |
| Hardware objetivo | CPU AMD EPYC (ZenDNN) |
| Tamano en disco | 9,0 GiB (~45% menos que los 16,4 GiB en BF16) |
| Tamano del repositorio | 9,6 GB |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento (PTQ) del checkpoint `ibm-granite/granite-4.2-8b`, que emplea la arquitectura `GraniteForCausalLM`, un transformer causal denso. La cuantizacion se aplico con LLM Compressor v0.14.0 usando el esquema `W8A8` con el modificador `QuantizationModifier` y el algoritmo Round-to-Nearest, que es data-free y por tanto no requiere conjunto de calibracion. Se cuantizaron las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de las 40 capas del modelo (280 modulos lineales en total). Se mantuvieron en BF16 el `lm_head`, los `embed_tokens` y las layer norms para preservar la calidad de la salida.

La configuracion de cuantizacion es `compressed-tensors, num_bits=8, type=int, symmetric=true`, con pesos simetricos por canal y activaciones simetricas por token. El resultado se serializa en formato `compressed-tensors` y se sirve con vLLM v0.33.0 sobre la pila ZenDNN/ZenTorch de AMD para CPU. No se dispone de informacion sobre el proceso de entrenamiento original del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, segun el pipeline `text-generation` y la etiqueta `conversational`.
- Razonamiento aritmetico y matematico basico, evidenciado por los resultados en GSM8K (5-shot) del modelo cuantizado (0,9037).
- Inferencia en CPU sobre AMD EPYC con ZenDNN, pensada para despliegues sin GPU.
- Compatibilidad con vLLM v0.33.0 y el formato `compressed-tensors`.
- No se dispone de informacion explicita sobre soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking" en la informacion proporcionada.
- Capacidad multilingue limitada al ingles segun la etiqueta `language: en`.

## Casos de uso

- **Inferencia en servidores CPU sin GPU**: el modelo esta disenado para ejecutarse en procesadores AMD EPYC con ZenDNN, lo que permite desplegar generacion de texto en infraestructura de solo CPU donde no hay aceleradores disponibles.
- **Reduccion de huella de memoria en produccion**: con 9,0 GiB en disco frente a 16,4 GiB en BF16, encaja en nodos con memoria limitada o en despliegues con multiples instancias por servidor.
- **Evaluacion de razonamiento matematico**: su rendimiento en GSM8K (0,9037 en 5-shot) lo hace util para tareas de resolucion de problemas aritmeticos en ingles dentro de pipelines de evaluacion o asistentes educativos.
- **Prototipado de asistentes conversacionales en ingles**: el pipeline `text-generation` y la etiqueta `conversational` permiten usarlo como base para chatbots de dominio general en ingles sobre vLLM.
- **Benchmarking de cuantizacion W8A8**: sirve como referencia para medir la perdida de calidad de la cuantizacion INT8 RTN frente al modelo BF16 en tareas de razonamiento, con una recuperacion documentada del 98,84% en GSM8K.
- **Despliegue en entornos Linux con pila AMD**: integrable en stacks que ya usan ZenDNN, ZenTorch y PyTorch CPU, aprovechando la aceleracion especifica de AMD para operaciones INT8.

## Benchmarks y rendimiento

| Benchmark | BF16 (base) | W8A8 (este modelo) | Recuperacion |
|---|---|---|---|
| GSM8K (5-shot) | 0,9143 | 0,9037 | 98,84% |

Los resultados se obtuvieron con `lm-evaluation-harness` y el motor vLLM. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM**: no aplica; el modelo esta optimizado para CPU, no para GPU.
- **Memoria RAM**: al menos 9,0 GiB para los pesos en INT8, mas overhead de activaciones y del runtime de vLLM.
- **CPU recomendada**: AMD EPYC con soporte ZenDNN v6.2.0.
- **GPU**: no soportada de forma oficial; la model card indica explicitamente que no esta pensado para inferencia en GPU.
- **Sistema operativo**: Linux (preferido).
- **Despliegue**: vLLM v0.33.0 con `torch==2.14.0+cpu`, `zentorch==2.14.0.3`, `llmcompressor==0.14.0`.
- **Configuracion de OpenMP**: es necesario exportar `LD_PRELOAD` apuntando a `libomp.so` (LLVM OpenMP) o `libiomp5.so` (Intel OpenMP) antes de lanzar vLLM para un rendimiento optimo.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| `amd/granite-4.2-8b-w8a8-llmcompressor` | 8,79 B | No disponible | W8A8 INT8 (RTN) | Apache 2.0 | CPU AMD EPYC |
| `ibm-granite/granite-4.2-8b` (base) | 8,79 B | No disponible | BF16 | Apache 2.0 | GPU/CPU generico |
| Alternativas de 8B INT8 | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con otras alternativas de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **Bloqueo de version**: compatible unicamente con ZenDNN v6.2.0, ZenTorch v2.14.0.3 y PyTorch v2.14.0+cpu; puede no cargar correctamente en otras versiones.
- **Solo CPU**: no esta pensado para inferencia en GPU; su uso en aceleradores no esta soportado oficialmente.
- **Idioma**: solo ingles segun la etiqueta `language: en`; el rendimiento en otros idiomas no esta garantizado.
- **Perdida por cuantizacion**: aunque la recuperacion en GSM8K es del 98,84%, puede haber degradacion en otras tareas no evaluadas.
- **Riesgo de alucinacion**: no se documenta en la model card; aplican los riesgos habituales de los modelos generativos de texto.
- **Sesgos**: no se documentan sesgos conocidos en la informacion proporcionada.
- **Licencia**: Apache 2.0, permite uso comercial con atribucion; las modificaciones de AMD estan bajo copyright de Advanced Micro Devices, Inc. (2026).
- **Contexto**: la longitud de contexto no esta disponible en la informacion proporcionada, lo que impide evaluar su idoneidad para tareas de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/granite-4.2-8b-w8a8-llmcompressor
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://docs.vllm.ai/en/latest/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
