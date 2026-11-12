# mradermacher/TranNhiem-DeepCompression-Gemma4-26B-A4B-it-i1-GGUF

## Resumen

TranNhiem-DeepCompression-Gemma4-26B-A4B-it-i1-GGUF es una cuantizacion en formato GGUF del modelo TranNhiem-DeepCompression-Gemma4-26B-A4B-it, publicada por el usuario mradermacher. Se trata de una variante derivada de la familia Gemma 4 con arquitectura de mezcla de expertos (MoE), como indica el sufijo "A4B" (aproximadamente 4.000 millones de parametros activos sobre un total de unos 23.800 millones). El modelo base parece ser un ajuste fino orientado a conversacion, con posible enfasis en compresion profunda ("DeepCompression") segun el nombre, aunque la model card no aporta detalles sobre el proceso de entrenamiento.

El repositorio contiene unicamente los pesos cuantizados en GGUF, generados con el metodo i1 (imatrix) de mradermacher, que emplea una matriz de importancia para preservar mejor la calidad en cuantizaciones agresivas. El tamano del repo es de 21,9 GB, lo que sugiere que incluye varias cuantizaciones ademas de la de mayor precision. No se dispone de informacion sobre licencia, idiomas soportados ni pipeline de uso en los metadatos de Hugging Face.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de ~24B parametros totales con solo ~4B activos en hardware de consumo, algo imposible con el modelo en precision completa. Sin embargo, la ausencia de datos oficiales sobre el modelo base (licencia, benchmarks, composicion del entrenamiento) limita seriamente su evaluacion para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun el sufijo A4B |
| Parametros totales | 23.805.109.886 (~23,8B) |
| Parametros activos | ~4B (inferido del sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado, con imatrix) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos, tal como indica la nomenclatura "26B-A4B" (26.000 millones de parametros totales, 4.000 millones activos). El modelo base es TranNhiem-DeepCompression-Gemma4-26B-A4B-it, un ajuste fino de la familia Gemma 4 orientado a conversacion (sufijo "-it"). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones de alineamiento.

La innovacion tecnica de este repositorio concreto es el uso de cuantizacion i1 con imatrix, que calcula una matriz de importancia a partir de datos de calibracion para asignar mas bits a los pesos mas sensibles. Esto permite obtener cuantizaciones de 2 y 3 bits con una perdida de calidad menor que la cuantizacion uniforme. El repositorio incluye un rango muy amplio de cuantizaciones, desde IQ1_S (extrema) hasta Q6_K (alta fidelidad), lo que facilita el despliegue en distintos niveles de hardware.

## Capacidades

- Generacion de texto conversacional: el sufijo "-it" indica un ajuste para instrucciones y dialogo multi-turno.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Gemma 4, aunque no se documentan explicitamente.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles; no se especifican idiomas en la model card.
- Modo "thinking" o vision: no disponible.
- Eficiencia de inferencia: al ser MoE con ~4B activos, el coste computacional por token es similar al de un modelo denso de 4B, pese al tamano total de ~24B.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M o IQ4_XS permiten ejecutar el modelo en GPUs con 16-24 GB de VRAM, manteniendo la ventaja de un MoE con solo ~4B activos por token.
- Asistentes conversacionales locales: el ajuste "-it" y el formato GGUF lo hacen adecuado para chatbots en entornos sin conexion mediante llama.cpp u Ollama, con contexto limitado por la VRAM disponible.
- Prototipado rapido de aplicaciones de IA: al ofrecer cuantizaciones desde IQ1_S hasta Q6_K, permite iterar en maquinas modestas y escalar la precision segun los recursos.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye multiples variantes (Q2, Q3, Q4, Q5, Q6, IQ1-IQ4), lo que permite medir el impacto de cada nivel en la calidad de salida sobre el mismo modelo base.
- Investigacion sobre modelos MoE: util para estudiar el comportamiento de un MoE de ~24B con ~4B activos en tareas de razonamiento y generacion, sin necesidad de infraestructura de datacenter.
- Generacion de texto en lote con recursos limitados: el bajo numero de parametros activos reduce el coste por token, adecuado para tareas de resumen o clasificacion en servidores con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion):
  - IQ1_S / IQ2_XXS: ~6-8 GB.
  - Q3_K_M / IQ3_M: ~10-12 GB.
  - Q4_K_M / IQ4_XS: ~13-15 GB.
  - Q5_K_M: ~16-18 GB.
  - Q6_K: ~19-21 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q5/Q6; RTX 4080/4070 Ti Super (16 GB) para Q4; RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) para Q3; GPUs con 8 GB para cuantizaciones IQ1/IQ2.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q6_K con una RTX 4090; las variantes Q4 en adelante caben en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (koboldcpp, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles; dependeran del hardware y de la cuantizacion. Al tener ~4B activos, se espera un throughput superior al de un denso de 24B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| TranNhiem-DeepCompression-Gemma4-26B-A4B-it (i1-GGUF) | ~23,8B | ~4B | no disponible | no disponible | GGUF |
| Gemma 2 27B (referencia de tamano similar) | 27B | 27B (denso) | 8K | Gemma Terms | safetensors, GGUF |
| Mixtral 8x7B (MoE comparable) | ~46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| Qwen2.5 32B (denso comparable) | 32,5B | 32,5B (denso) | 128K | Apache 2.0 (segun variante) | safetensors, GGUF |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que no puede establecerse una comparacion cuantitativa. La principal ventaja diferencial es la relacion entre parametros totales y activos (~4B), que reduce el coste de inferencia frente a modelos densos de tamano similar.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse si el uso comercial esta permitido; debe verificarse en el repositorio del modelo base antes de cualquier despliegue en produccion.
- Idiomas no documentados: se desconoce el soporte multilingue real; el modelo base Gemma suele estar orientado principalmente al ingles.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- Cuantizaciones agresivas (IQ1, IQ2): pueden degradar notablemente la coherencia y la calidad del razonamiento; no recomendadas para tareas criticas.
- Ausencia de benchmarks: no hay datos objetivos de MMLU, HumanEval, GSM8K ni similares para este ajuste fino concreto.
- Modelo derivado no oficial: al ser una cuantizacion de un ajuste fino de terceros, no cuenta con el respaldo del equipo de Gemma; posibles problemas de reproducibilidad.
- Contexto desconocido: no se especifica la longitud de contexto soportada, lo que limita su uso en tareas de documento largo sin validacion previa.
- Sin soporte confirmado de tool calling ni agentes: no debe asumirse su disponibilidad en pipelines de automatizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/TranNhiem-DeepCompression-Gemma4-26B-A4B-it-i1-GGUF
- Modelo base: https://huggingface.co/trannhiem/TranNhiem-DeepCompression-Gemma4-26B-A4B-it
- Pagina del autor de las cuantizaciones (mradermacher): https://huggingface.co/mradermacher
- Documentacion de llama.cpp (despliegue GGUF): https://github.com/ggerganov/llama.cpp
- Documentacion de Ollama: https://ollama.com
