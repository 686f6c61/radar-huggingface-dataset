# jeonghyeon00/Nanbeige4.3-33B-w8a16-compressed-tensors

## Resumen

Nanbeige4.3-33B W8A16 (compressed-tensors) es una cuantización de pesos en int8 con activaciones en 16 bits del modelo Nanbeige4.3-33B, desarrollado originalmente por el equipo Nanbeige. El repositorio, publicado por el usuario jeonghyeon00, no contiene un modelo nuevo sino un checkpoint derivado listo para servir con vLLM, serializado en el formato `compressed-tensors` (`pack-quantized`). El objetivo es reducir la huella de memoria del modelo original manteniendo la ruta de activaciones en 16 bits, de modo que pueda desplegarse en GPUs con menos VRAM sin recurrir a cuantizaciones de 4 bits más agresivas.

La relevancia de esta ficha es doble: por un lado, documenta el proceso de cuantización (módulos `Linear`, grupo de 128, pesos enteros simétricos, `lm_head` excluido) y su compatibilidad con vLLM; por otro, advierte de que se trata de una cuantización *data-free*, sin datos de calibración ni evaluación de calidad o throughput publicada. Cualquier uso en producción debe ir precedido de una evaluación propia.

El dato de parámetros totales en safetensors es de 10.314.989.272, muy inferior a los 33B que sugiere el nombre del modelo base. Esta discrepancia debe tenerse en cuenta al estimar requisitos de hardware y al comparar con el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia llama, segun tags); detalles del modelo base no disponibles |
| Parametros totales | 10.314.989.272 (segun safetensors del repo); el nombre del modelo base indica 33B, discrepancia no aclarada en la informacion disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 524.288 tokens publicados por el modelo base; la longitud practica depende de la VRAM y de la configuracion de vLLM |
| Tipos de cuantizacion | W8A16 (pesos int8 simetricos, activaciones 16 bits), grupo de 128, formato `compressed-tensors` (`pack-quantized`) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors`; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo Nanbeige4.3-33B. La arquitectura subyacente se etiqueta como `llama` en los tags de Hugging Face, lo que sugiere una familia transformer decoder-only, pero la model card de este repositorio no detalla capas, dimensiones ocultas ni cabezas de atencion. Tampoco se documentan los datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, uso de RLHF o DPO) en la informacion proporcionada.

El proceso de cuantizacion si esta descrito con precision: se cuantizaron los modulos `Linear` con pesos enteros simetricos en grupos de 128, manteniendo las activaciones en 16 bits (W8A16). El `lm_head` se excluyo de la cuantizacion y permanece en la precision del modelo fuente. La revision de origen es `c1093c501cc6460427c0ac634db7223d0450c0ee`. Las herramientas empleadas fueron `llmcompressor==0.14.0.1`, `compressed-tensors==0.19.0` y `transformers==5.17.0`, y la salida se valido con el parser de configuracion de cuantizacion de vLLM `0.32.0`. No se usaron datos de calibracion (cuantizacion *data-free*), lo que simplifica el pipeline pero puede afectar a la fidelidad de las activaciones en dominios alejados de la distribucion original.

## Capacidades

- Generacion de texto conversacional, segun el pipeline `text-generation` y la etiqueta `conversational`.
- Soporte de *tool calling* / *function calling*: la model card indica el uso de `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder` en vLLM.
- Soporte de modo de razonamiento: se documenta `--reasoning-parser qwen3`, lo que implica que el modelo base expone una ruta de *thinking* o razonamiento estructurado.
- Capacidades multilingues limitadas a ingles y chino (`en`, `zh`); no se declaran otros idiomas.
- Compatibilidad con `text-generation-inference` y con `endpoints_compatible`, ademas de vLLM.
- No se declaran capacidades de vision, audio ni multimodalidad en la informacion disponible.

## Casos de uso

- **Servicio de chat multi-turno con contexto largo**: el modelo base publica 524.288 tokens de contexto; en un despliegue vLLM con esta cuantizacion se pueden gestionar conversaciones largas o documentos extensos, siempre que la VRAM permita cachear el contexto. Es adecuado porque la cuantizacion W8A16 reduce el peso de los pesos sin degradar la ruta de activaciones a 8 bits.
- **Agentes con *tool calling* en produccion**: al soportar `--enable-auto-tool-choice` y el parser `qwen3_coder`, puede integrarse en orquestadores de agentes que invocan funciones externas (APIs, bases de datos, ejecucion de codigo) en flujos multi-paso.
- **Razonamiento estructurado con *thinking mode***: el parser `qwen3` permite separar la traza de razonamiento de la respuesta final, util para pipelines que auditan o filtran el razonamiento antes de mostrarlo al usuario.
- **Atencion al cliente automatizada en ingles y chino**: el soporte nativo de ambos idiomas y el formato conversacional lo hacen apto para asistentes bilingues en mercados de habla inglesa y china.
- **Procesamiento de documentos largos**: con contexto de hasta 524.288 tokens, puede resumir o extraer informacion de contratos, informes o expedientes que superan la ventana tipica de 8K-32K de otros modelos.
- **Despliegue en infraestructura con VRAM limitada**: al ser W8A16, reduce el espacio de pesos respecto al modelo en 16 bits, lo que permite servir el modelo en GPUs que no admitirian la version completa, a costa de validar la calidad tras la cuantizacion.
- **Evaluacion comparativa de cuantizaciones**: util como checkpoint de referencia para medir el impacto de W8A16 frente al modelo original en tareas concretas, dado que el autor no publica benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no incluye evaluacion de calidad de inferencia ni de throughput, y advierte de que la cuantizacion puede alterar las salidas del modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 10.314.989.272 parametros en safetensors y pesos int8, el peso de los pesos ronda los 10,3 GB; a ello hay que sumar la cache KV para el contexto, que con 524.288 tokens puede ser muy elevada. Para contextos moderados (8K-32K) se puede estimar un consumo total en el rango de 16-24 GB, aunque no se dispone de mediciones publicadas.
- **GPU recomendadas**: para contexto largo, A100 80 GB o H100 80 GB; para contexto moderado, GPUs de 24 GB como la RTX 4090 o la L40S podrian ser suficientes, sujeto a validacion.
- **Cabe en consumer GPU**: probablemente si, en GPUs de 24 GB, con contextos recortados; no se confirma en la informacion disponible.
- **Opciones de despliegue**: vLLM es la ruta documentada y validada (`vllm serve . --trust-remote-code --enable-auto-tool-choice --reasoning-parser qwen3 --tool-call-parser qwen3_coder`). Tambien se declara compatibilidad con `transformers` y `text-generation-inference`. No se documenta soporte de llama.cpp, Ollama ni GGUF.
- **Latencia y throughput**: no disponibles; el autor no publica evaluacion de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B W8A16 (este repo) | 10.314.989.272 segun safetensors; 33B segun nombre | 524.288 tokens | W8A16, compressed-tensors | Apache-2.0 | Hugging Face, vLLM |
| Nanbeige/Nanbeige4.3-33B (original) | 33B segun nombre | 524.288 tokens | 16 bits | Apache-2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma familia o tamano en la documentacion proporcionada; la comparativa se limita al modelo base y a esta cuantizacion.

## Limitaciones y advertencias

- **Cuantizacion *data-free***: al no usar datos de calibracion, la fidelidad de las activaciones puede degradarse en dominios especificos; es imprescindible evaluar el checkpoint en la carga de trabajo real antes de desplegarlo.
- **Discrepancia de parametros**: el nombre indica 33B pero safetensors reporta 10.314.989.272 parametros; conviene verificar el modelo base y el conteo real antes de dimensionar infraestructura.
- **Riesgo de alucinacion**: inherente a los modelos generativos; no se documentan mitigaciones especificas en esta cuantizacion.
- **Sesgos**: no se documentan sesgos conocidos del modelo base ni de la cuantizacion en la informacion disponible.
- **Idiomas**: solo ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe preservar la atribucion al equipo Nanbeige y conservar el aviso de licencia al redistribuir.
- **Contexto practico**: los 524.288 tokens son el maximo publicado; la longitud efectiva depende de la VRAM y de la configuracion de vLLM, y contextos muy largos pueden degradar la calidad.
- **Sin benchmarks**: no hay datos de calidad ni de throughput; cualquier afirmacion de rendimiento seria especulativa.
- **Formato**: solo se documenta compatibilidad con vLLM, transformers y TGI; no hay GGUF ni soporte de llama.cpp/Ollama.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jeonghyeon00/Nanbeige4.3-33B-w8a16-compressed-tensors
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Herramienta de cuantizacion llmcompressor: no disponible en la informacion proporcionada
- Libreria compressed-tensors: no disponible en la informacion proporcionada
- vLLM: no disponible en la informacion proporcionada
