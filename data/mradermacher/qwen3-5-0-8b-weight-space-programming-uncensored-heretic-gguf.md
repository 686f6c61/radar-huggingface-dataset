# mradermacher/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones GGUF estaticas del modelo `xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic`, generadas por mradermacher mediante su pipeline habitual de conversion de pesos de Hugging Face a formato GGUF. Se trata, por tanto, de un artefacto de distribucion derivado y no de un modelo entrenado desde cero: el trabajo tecnico original (fine-tuning, proceso de "abliteration"/heretic y especializacion en "weight space programming") corresponde al autor citado en la model card, mientras que este repositorio solo aporta los ficheros listos para inferencia con llama.cpp y derivados.

El modelo base subyacente es Qwen3.5 en su variante de 0.8B, segun indica el propio nombre del checkpoint. No obstante, el dato real de parametros reportado por el repositorio en safetensors es de 100.592.896 parametros (aproximadamente 0,1B), muy inferior a los ~0,8B que sugiere la denominacion. Esta discrepancia debe tenerse en cuenta: o bien el nombre hace referencia a otra magnitud, o bien el checkpoint publicado corresponde a un subconjunto o a una arquitectura distinta de la esperada. La ficha refleja el dato verificable del repositorio y senala la inconsistencia.

La relevancia de este artefacto es limitada y muy especifica: sirve para desplegar en local, con recursos minimos, una variante "uncensored" orientada a generacion de codigo o a manipulacion de espacios de pesos, en un rango de tamano que cabe en cualquier GPU consumer e incluso en CPU. El repositorio no registra descargas ni likes en el momento de la consulta, y no incluye model card propia mas alla de los metadatos de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, segun el nombre del checkpoint); detalles no disponibles |
| Parametros totales | 100.592.896 (dato real de safetensors); la denominacion comercial indica 0,8B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); origen en safetensors via convert_type hf |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo original en la informacion proporcionada. El nombre del checkpoint sugiere una base Qwen3.5, que en la familia Qwen corresponde a transformers decoder-only con atencion por grupos de consultas y, en versiones recientes, modos de razonamiento explicitos; sin embargo, no hay confirmacion en la model card de este repositorio. El dato de parametros en safetensors (100,6M) no concuerda con la etiqueta "0.8B", por lo que no es posible determinar con certeza si se trata de un modelo destilado, de un checkpoint parcial o de una convencion de nombres distinta.

Respecto al entrenamiento, la model card unicamente indica que el modelo ha pasado por un proceso de "heretic" (termino habitual para describir tecnicas de abliteration que eliminan direcciones de rechazo del espacio de activaciones) y que esta especializado en "weight space programming", una denominacion que no se detalla. No se especifican volumen de tokens, composicion del dataset, ni si hubo RLHF, DPO o fine-tuning supervisado. El repositorio de mradermacher es exclusivamente de cuantizacion: los metadatos confirman `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, conversion directa desde pesos Hugging Face sin entrenamiento adicional.

## Capacidades

- Generacion de texto autoregresiva en formato GGUF, ejecutable con llama.cpp y sus derivados.
- Presunta capacidad de generacion de codigo, inferida del sufijo "programming" del nombre; no verificada en la informacion disponible.
- Presunta capacidad de "weight space programming", sin definicion tecnica ni ejemplos en la model card.
- Variante "uncensored/heretic": se espera una menor tasa de rechazos ante peticiones que el modelo base declinaria, aunque no se documenta el metodo exacto ni su alcance.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Experimentacion con abliteration y alineacion: el modelo permite estudiar en un checkpoint de ~0,1B como afecta la eliminacion de direcciones de rechazo al comportamiento del modelo, con coste computacional minimo y ciclos de iteracion rapidos.
- Inferencia en CPU y dispositivos de bajos recursos: al disponer de cuantizaciones hasta Q2_K e IQ4_XS sobre un modelo de ~100M de parametros, puede ejecutarse en portatiles sin GPU mediante llama.cpp u Ollama, util para prototipos offline.
- Pruebas de pipeline de cuantizacion: sirve como caso de referencia para validar flujos de conversion HF a GGUF y comparar la degradacion de calidad entre x-f16, Q8_0, Q4_K_M y Q2_K sobre un mismo checkpoint.
- Generacion de codigo en entornos aislados: si la especializacion en programacion se confirma, podria emplearse para autocompletado o generacion de snippets en herramientas de desarrollo locales sin dependencia de API, aunque la calidad esperable en 0,1B es baja.
- Filtrado y clasificacion de texto ligera: modelos de este tamano son adecuados para tareas de etiquetado, extraccion de entidades simples o moderacion preliminar en lotes grandes donde el throughput prima sobre la precision.
- Educacion e investigacion sobre modelos pequenos: util para demostrar el funcionamiento interno de un transformer, el efecto de la cuantizacion y las diferencias entre variantes censuradas y no censuradas en un entorno controlado.
- Base para fine-tuning posterior: al ser un checkpoint pequeno en formato GGUF, puede servir como referencia de comparacion frente a versiones afinadas, aunque el fine-tuning directo sobre GGUF no es el flujo habitual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones. En x-f16, ~0,2 GB de pesos para 100,6M de parametros; en Q8_0, ~0,1 GB; en Q4_K_M, ~0,06 GB; en Q2_K, ~0,04 GB. El consumo real depende del contexto y de los buffers de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, e incluso iGPU con memoria compartida). No se requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas e integradas modernas; tambien en CPU pura.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que no son la via recomendada.
- Latencia y throughput estimados: no disponibles de forma oficial. Por el tamano, en CPU moderna se esperan decenas de tokens por segundo y en GPU consumer cientos, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-GGUF | 100,6M (segun safetensors) | no disponible | no disponible | GGUF | Variante uncensored derivada, sin benchmarks |
| Qwen2.5-Coder-0.5B (referencia de la familia) | ~0,5B | 32K (tipico en la familia) | Apache 2.0 (habitual en Qwen) | safetensors, GGUF | Modelo oficial de codigo, con benchmarks publicados |
| Qwen2.5-0.5B-Instruct | ~0,5B | 32K (tipico) | Apache 2.0 (habitual) | safetensors, GGUF | Base generalista pequena de referencia |
| SmolLM2-135M-Instruct | ~135M | 8K (tipico) | Apache 2.0 | safetensors, GGUF | Alternativa ultraligera con evaluacion publicada |

La comparacion es aproximada: los datos de los modelos de referencia provienen del conocimiento general de la familia y no de la informacion proporcionada en este repositorio, por lo que deben contrastarse antes de usarse en decisiones de produccion. El modelo de esta ficha carece de licencia declarada, lo que lo situa en desventaja frente a las alternativas con licencia permisiva.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso para uso comercial; hay que contactar con el autor o asumir riesgo legal.
- Discrepancia de parametros: el nombre indica 0,8B pero safetensors reporta 100,6M; conviene verificar el checkpoint original antes de confiar en el etiquetado.
- Model card practicamente inexistente: no hay informacion sobre datos de entrenamiento, idiomas, contexto ni evaluacion, lo que impide estimar calidad de forma fiable.
- Variante "uncensored/heretic": la eliminacion de rechazos puede aumentar la probabilidad de contenido toxico, ilegal o peligroso; no es apta para despliegues publicos sin filtros adicionales.
- Riesgo de alucinacion elevado: en modelos de ~0,1B la fidelidad factual es baja y la coherencia en contextos largos se degrada rapidamente.
- Capacidad multilingue desconocida: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas distintos del ingles.
- Cuantizaciones agresivas (Q2_K, IQ4_XS) pueden degradar aun mas la calidad sobre un modelo ya de por si pequeno; para evaluacion seria conviene usar x-f16 o Q8_0.
- Sin benchmarks ni descargas registradas: no hay evidencia de uso en produccion ni validacion independiente.
- El prefijo "Qwen3.5" en el nombre no garantiza que sea un modelo oficial de Alibaba; es una denominacion del autor del checkpoint derivado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-GGUF
- Modelo original citado en la model card: https://huggingface.co/xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
