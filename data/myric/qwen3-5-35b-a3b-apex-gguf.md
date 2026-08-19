# Myric/Qwen3.5-35B-A3B-APEX-GGUF

## Resumen

Qwen3.5-35B-A3B-APEX-GGUF es una cuantizacion GGUF del modelo base Qwen/Qwen3.5-35B-A3B, un modelo de lenguaje de tipo mixture-of-experts (MoE) con 35.505 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token. La cuantizacion ha sido realizada por Myric utilizando la tecnica APEX (Adaptive Precision for EXpert Models), que aplica precision mixta por capas adaptada a la estructura de los expertos, junto con una matriz de importancia generada mediante un forward en PyTorch con serializacion por bandas, en lugar del clasico `llama-imatrix`. Esta decision se justifica porque la arquitectura GatedDeltaNet del modelo base, una atencion lineal de estado recurrente, impide el uso eficiente de la herramienta estandar de llama.cpp para calcular la imatrix.

El resultado son dos archivos GGUF: una variante de alta calidad (`i-quality`, 23.5 GB) y otra mas compacta (`i-compact`, 17.4 GB), ambos cuantizados con la imatrix torch. La validacion realizada por el autor muestra una correlacion mediana de 0.966 con la imatrix de referencia de bartowski y una diferencia de perplejidad estadisticamente indistinguible (0.02 PPL en wikitext-2 y 0.008 en corpus de codigo). Este modelo es relevante porque permite ejecutar un MoE de 35B con solo ~3B activos en hardware de consumo, manteniendo una calidad cercana a la del modelo en bf16, gracias a la cuantizacion APEX y a la cobertura de la cabeza NextN/MTP que la imatrix torch incluye y que la estandar no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: GatedDeltaNet (atencion lineal) + atencion completa periodica, 40 capas, 256 expertos enrutados + 1 compartido, cabeza NextN/MTP |
| Parametros totales | 35.505.251.456 (~35.5B) |
| Parametros activos | ~3B (no se especifica el valor exacto; estimacion comun para este tipo de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | APEX i-quality (23.5 GB) y APEX i-compact (17.4 GB), ambos en formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con safetensors del modelo base como origen) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B es un transformer MoE con 40 capas y 256 expertos enrutados mas un experto compartido. La atencion es hibrida: utiliza GatedDeltaNet, una variante de atencion lineal basada en estado recurrente, combinada con atencion completa periodica en ciertas capas. Ademas incorpora una cabeza NextN/MTP (self-speculative decoding) que permite decodificacion especulativa interna. Esta arquitectura reduce el coste computacional por token al activar solo ~3B parametros, manteniendo la capacidad de un modelo de 35B.

El presente repositorio no contiene el entrenamiento original, sino una cuantizacion APEX. La tecnica APEX asigna precision por capas y por experto segun la importancia medida con una matriz de activaciones. La imatrix fue generada con un forward en PyTorch sobre un corpus diverso (prosa, codigo y multilingue) y cubre todos los tensores de las 40 capas mas los 13 tensores de la cabeza NextN/MTP, a diferencia de la imatrix estandar de llama.cpp que omite esta ultima. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el proceso de alineacion (RLHF, DPO, etc.) del modelo base.

## Capacidades

- Generacion de texto en lenguaje natural de proposito general, derivada del modelo base Qwen3.5-35B-A3B.
- Razonamiento y resolucion de problemas, gracias a la arquitectura MoE con atencion hibrida y a la decodificacion especulativa que acelera la inferencia.
- Capacidades de codigo y matematicas, segun los resultados de perplejidad en corpus de codigo (HumanEval, MBPP, GSM8K) reportados en la validacion.
- Soporte de tool calling y function calling: no se confirma explicitamente, pero es una capacidad tipica de los modelos Qwen recientes; no hay datos en la informacion proporcionada.
- Capacidades multilingues: no se especifican idiomas concretos, aunque la calibracion incluyo corpus multilingue.
- Compatible con el ecosistema llama.cpp (llama-quantize, llama-cli, servidor) y con herramientas que consumen GGUF como Ollama o LM Studio.

## Casos de uso

- Despliegue local de un asistente de codigo: con la variante i-compact (17.4 GB) cabe en GPUs de consumo con 24 GB de VRAM, permitiendo autocompletado y generacion de funciones en entornos de desarrollo sin conexion a la nube.
- Inferencia en servidores de bajo coste: la cuantizacion APEX reduce el peso a 17-23 GB, lo que permite ejecutar el modelo en instancias con una sola GPU (por ejemplo, RTX 4090 o A100 40GB) con coste de hardware moderado.
- Prototipado rapido de aplicaciones conversacionales: gracias al formato GGUF, se puede integrar en pipelines con llama.cpp o llama-server para crear chatbots con contexto largo (si el contexto del modelo base lo permite, aunque no se ha confirmado).
- Evaluacion de calidad de cuantizaciones: el repositorio incluye la imatrix torch y los resultados de perplejidad, lo que sirve como referencia para comparar metodos de cuantizacion en arquitecturas MoE con atencion lineal.
- Investigacion en decodificacion especulativa: la cabeza NextN/MTP del modelo base, cubierta por la imatrix torch, permite estudiar el impacto de la cuantizacion en la calidad de las predicciones especulativas.
- Generacion de documentacion tecnica y resumen de codigo: el modelo, al ser una cuantizacion de un MoE de 35B, ofrece buena calidad en tareas de procesamiento de texto tecnico, con la ventaja de un uso de memoria reducido frente al modelo en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona mediciones de perplejidad (PPL) sobre wikitext-2 y un corpus de codigo, comparando la cuantizacion con la imatrix torch frente a la imatrix de llama.cpp de bartowski y al modelo en bf16.

| Configuracion | PPL wikitext-2 (200 ventanas de 512 tokens) | Delta vs bf16 | PPL code-heavy (342 ventanas) | Delta vs bf16 |
|---|---|---|---|---|
| bf16 (referencia) | 6.620 | — | 2.247 | — |
| i-compact con imatrix bartowski | 6.756 | +2.05% | 2.310 | +2.77% |
| i-compact con imatrix torch | 6.775 | +2.34% | 2.318 | +3.15% |

La diferencia entre ambas imatrix es de 0.02 PPL en wikitext-2 y 0.008 en codigo, dentro de los margenes de error (0.073 y 0.014 respectivamente), lo que indica que la imatrix torch produce una cuantizacion de calidad equivalente a la canonica.

## Requisitos de hardware

- VRAM estimada: la variante i-quality (23.5 GB) requiere al menos 24 GB de VRAM para inferencia con llama.cpp (con overhead de contexto y KV cache). La variante i-compact (17.4 GB) puede caber en GPUs de 24 GB con margen, y posiblemente en 16 GB si se reduce el contexto o se usa cuantizacion adicional.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40GB, L40S, o GPUs de datacenter con 40 GB o mas. Para la variante compacta, tambien son viables GPUs de 16 GB como RTX 4080 o A10G, aunque con limitaciones de contexto.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (si se importa el GGUF), LM Studio, y cualquier herramienta compatible con GGUF. Para uso en produccion, se puede servir mediante llama.cpp con API OpenAI compatible.
- Latencia y throughput: no se proporcionan datos. Como referencia, un MoE con ~3B activos en una GPU moderna suele alcanzar decenas de tokens por segundo, pero depende del hardware y de la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | PPL wikitext-2 (i-compact) | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (bf16) | 35.5B (3B activos) | no disponible | bf16 | 6.620 | Apache 2.0 |
| Qwen3.5-35B-A3B-APEX-GGUF (Myric) | 35.5B (3B activos) | no disponible | APEX i-compact | 6.775 | Apache 2.0 |
| Qwen3.5-35B-A3B-APEX-GGUF (bartowski) | 35.5B (3B activos) | no disponible | APEX i-compact con imatrix llama.cpp | 6.756 | Apache 2.0 |

Ambas cuantizaciones APEX (Myric y bartowski) son practicamente equivalentes en calidad, con una diferencia de PPL inferior al margen de error. La ventaja de la version de Myric es que su imatrix cubre la cabeza NextN/MTP, lo que podria mejorar la fidelidad en tareas de decodificacion especulativa, aunque no se ha medido directamente.

## Limitaciones y advertencias

- Es una cuantizacion no oficial, realizada por un tercero (Myric), sin afiliacion con Qwen. No hay garantias de soporte ni de mantenimiento.
- La cuantizacion introduce una perdida de calidad frente al modelo en bf16, aunque las mediciones muestran un aumento de PPL inferior al 3% en los corpus evaluados.
- No se dispone de informacion sobre la longitud de contexto real del modelo base ni sobre los idiomas soportados; esto limita la planificacion de despliegues en aplicaciones multilingues o con contexto muy largo.
- Riesgo de alucinacion y sesgos: inherentes a los modelos de lenguaje de esta escala, no mitigados por la cuantizacion.
- La imatrix torch se genero con un corpus de calibracion especifico (prose + codigo + multilingue); si se usa el modelo en un dominio muy especializado, la calidad de la cuantizacion podria ser suboptima.
- Para uso comercial, la licencia Apache 2.0 permite la redistribucion y modificacion, pero se debe mantener el aviso de copyright y la atribucion correspondiente.
- Los archivos GGUF son grandes (17-23 GB); se recomienda verificar la integridad de las descargas y usar herramientas de llama.cpp actualizadas para evitar incompatibilidades.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Myric/Qwen3.5-35B-A3B-APEX-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Referencia de imatrix de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.5-35B-A3B-GGUF
- Herramienta APEX (LocalAI): https://github.com/localai-org/apex-quant
- Motor de cuantizacion llama.cpp: https://github.com/ggml-org/llama.cpp
- Otra cuantizacion APEX del mismo modelo (mudler): https://huggingface.co/mudler/Qwen3.5-35B-A3B-APEX-GGUF
