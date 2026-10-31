# Diffuspace/Clover-35B-A3B-Preview-GGUF

## Resumen

Clover-35B-A3B-Preview es el primer modelo publicado por DiffuSpace, una empresa centrada en modelos de lenguaje difusivos. Se trata de un modelo de generación de texto que combina un backbone mixture-of-experts (MoE) de 35B parámetros con aproximadamente 3B parámetros activos por token, generación por bloques difusivos y una ventana de contexto de 128K tokens (131.072 tokens exactos). Según el blog de lanzamiento del autor, ofrecía el mejor rendimiento entre los modelos de lenguaje difusivos open source en el momento de su publicación.

Este repositorio contiene las cuantizaciones GGUF oficiales para inferencia local mediante una integración específica en llama.cpp (PR #31306). Su rasgo más distintivo es el soporte de decodificación auto-especulativa (self-speculative decoding) con un único modelo: las variantes de 8 y 4 bits proponen tokens mediante su capacidad difusiva por bloques y los verifican con su propia ruta de decodificación causal, sin necesidad de un modelo draft separado.

La arquitectura híbrida Gated DeltaNet / atención completa, junto con la generación difusiva y el contexto largo, hace que Clover sea relevante para desarrolladores que buscan modelos MoE eficientes ejecutables en local, especialmente en escenarios agénticos y de generación con latencia reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet (GDN) / atención completa, MoE con generación difusiva por bloques |
| Parametros totales | 34.661.350.848 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 131.072 tokens (128K), incluyendo prompt y respuesta |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q4_0 (GGUF, con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors BF16) |

## Arquitectura y entrenamiento

Clover emplea un backbone MoE híbrido que combina capas Gated DeltaNet (GDN), una arquitectura recurrente lineal, con capas de atención completa. El modelo incorpora parámetros GDN adicionales entrenados que permiten atención bidireccional dentro de los bloques difusivos, manteniendo un prefijo causal. Esta combinación habilita la generación difusiva por bloques: el modelo propone varios tokens en paralelo y los refina, en contraste con la decodificación autorregresiva token a token.

La integración en llama.cpp implementa self-speculative decoding mediante el modo `draft-self`: el propio modelo propone tokens con su capacidad difusiva por bloques y los verifica con su ruta de decodificación causal, eliminando la necesidad de un modelo draft independiente. Sobre los datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO u otras técnicas de alineación), no se ha publicado información en la documentación disponible. Tampoco se detalla el formato de chat más allá del uso de plantillas tipo `<|im_start|>` visibles en los ejemplos de prompt.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta "conversational").
- Generación difusiva por bloques con decodificación auto-especulativa integrada, que acelera la inferencia sin modelo draft separado.
- Contexto largo de 128K tokens para procesar documentos extensos.
- Inferencia local y on-device mediante GGUF y llama.cpp, con soporte CUDA y builds solo CPU.
- Capacidad agéntica: el blog de lanzamiento incluye benchmarks agénticos, aunque sin cifras detalladas en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modalidades adicionales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Chatbots locales con contexto largo: la ventana de 128K tokens permite mantener conversaciones multi-turno o incorporar documentos completos en el prompt, ejecutándose en una única GPU de gama alta gracias a la cuantización Q4.
- Asistentes de análisis documental: con Q4_K_M (21,42 GiB) es posible cargar el modelo en una RTX 4090 de 24 GB y consultar sobre contratos, informes o bases de código extensas.
- Generación de texto con baja latencia: el self-speculative decoding reduce el tiempo de generación al aceptar varios tokens por paso de verificación, útil en aplicaciones interactivas.
- Experimentación con modelos difusivos de lenguaje: al ser uno de los primeros modelos difusivos open source con soporte en llama.cpp, sirve como base para investigación en decodificación no autorregresiva.
- Despliegue en CPU: el build solo CPU de llama.cpp permite ejecutar el modelo en máquinas sin GPU, aprovechando los ~3B parámetros activos por token, aunque con latencias mayores.
- Sistemas agénticos de bajo coste: la combinación de MoE con pocos parámetros activos y licencia Apache 2.0 facilita su integración en pipelines de agentes sin costes de licenciamiento ni API externa.

## Benchmarks y rendimiento

El blog de lanzamiento incluye resultados de benchmarks agénticos comparando Clover con otros modelos, presentados como gráfico (benchmark.png) sin cifras numéricas en la model card. El propio repositorio advierte que esos resultados corresponden al modelo original y no a las cuantizaciones GGUF, y que la cuantización y los ajustes de inferencia pueden afectar a calidad y velocidad. No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para pesos: Q8_0 requiere ~35,26 GiB; Q4_K_M ~21,42 GiB; Q4_0 ~18,24 GiB. A esto hay que añadir memoria adicional para cachés de atención, estado recurrente y buffers de cómputo; contextos largos aumentan el consumo.
- GPU recomendadas: para Q4_K_M y Q4_0, una GPU de 24 GB como la RTX 3090 o RTX 4090 puede albergar los pesos; para Q8_0 se necesita una GPU con más de 36 GB (A100 40 GB, A100 80 GB o H100). También es viable offload parcial con `-ngl`.
- Consumer GPUs: cabe en una RTX 4090 (24 GB) con las variantes Q4_K_M y Q4_0, reservando margen para el contexto. La variante Q8_0 no cabe en consumer GPUs habituales.
- CPU: existe build solo CPU documentado en la model card; el rendimiento será notablemente inferior al de GPU.
- Despliegue: llama.cpp mediante el ejemplo `llama-speculative-simple` del PR #31306 (build con `GGML_CUDA=ON` o solo CPU). No se menciona soporte en vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles en cifras concretas; la model card indica que dependen del hardware, la cuantización, la longitud del prompt y el número de tokens draft aceptados.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview | ~35B | ~3B | 128K | Híbrida GDN/atención, MoE, difusiva | Apache 2.0 |
| Qwen3-30B-A3B | 30B | 3B | 32K-128K (según variante) | Transformer MoE | Apache 2.0 |
| Llama 4 Scout | 109B | ~17B | 10M | Transformer MoE | Llama 4 Community License |

Clover se sitúa en la categoría de MoE con ~3B parámetros activos, similar a Qwen3-30B-A3B en eficiencia por token, pero con la diferencia sustancial de su generación difusiva por bloques y su arquitectura híbrida GDN/atención. Frente a Llama 4 Scout, Clover es mucho más ligero en memoria y usa una licencia Apache 2.0 sin restricciones comunitarias. No se dispone de cifras de benchmarks comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks publicados corresponden al modelo BF16 original, no a las cuantizaciones GGUF; la cuantización puede degradar la calidad.
- El tamaño del fichero no equivale a la memoria total de inferencia: hay que reservar memoria adicional para cachés y buffers, y los contextos largos incrementan el consumo significativamente.
- El soporte en llama.cpp depende del PR #31306, que aún puede no estar fusionado en la rama principal; hay que compilar desde ese commit concreto.
- El ejemplo `llama-speculative-simple` lee prompts en crudo, por lo que el formato de chat debe añadirse manualmente.
- No hay información publicada sobre sesgos conocidos, riesgo de alucinación, idiomas soportados ni datos de entrenamiento.
- Es un modelo "Preview": puede presentar inestabilidades o cambios en versiones futuras.
- La licencia Apache 2.0 no impone restricciones al uso comercial, pero no se dispone de un modelo de instrucciones afinado documentado (aparece como modelo base).

## Enlaces

- Repositorio GGUF: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview-GGUF
- Modelo base BF16: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Blog de lanzamiento: https://diffuspace.ai/blog/clover-35b/
- Código fuente: https://github.com/DiffuSpace/Clover-35B-A3B-Preview
- Integración en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31306
- Web de DiffuSpace: https://diffuspace.ai/
