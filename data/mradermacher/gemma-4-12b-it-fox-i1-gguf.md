# mradermacher/Gemma-4-12B-it-Fox-i1-GGUF

## Resumen

Gemma-4-12B-it-Fox-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo Gemma-4-12B-it-Fox, publicado por el usuario icelandicfox. Se trata, por tanto, de un derivado de un fine-tune del modelo Gemma 4 de 12 mil millones de parametros en su variante instruction-tuned, orientado a conversacion y seguimiento de instrucciones. El trabajo de mradermacher consiste exclusivamente en la conversion a formato GGUF y la produccion de multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K) para facilitar la inferencia en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 12B en equipos con VRAM limitada, algo imposible con los pesos originales en precision completa. Sin embargo, la informacion publica disponible es extremadamente escasa: la model card se limita a metadatos tecnicos del proceso de cuantizacion y no documenta el entrenamiento del modelo base, los datos utilizados, la licencia ni los idiomas soportados.

El repositorio muestra cero descargas y cero likes en el momento de la consulta, y un tamano de repositorio de 0.0 GB, lo que sugiere que la publicacion es muy reciente o que los pesos no estan completamente subidos. El dato de parametros reportado en safetensors (1.391.607) es inconsistente con un modelo de 12B y probablemente corresponde a un error de metadatos o a un subconjunto del modelo, por lo que no debe tomarse como referencia del tamano real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Gemma 4, presumiblemente transformer decoder-only) |
| Parametros totales | 12B segun el nombre del modelo; el dato de safetensors (1.391.607) es inconsistente y no fiable |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, Q4_1, IQ3_XS, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base seria safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Gemma-4-12B-it-Fox. Por el nombre se infiere que deriva de Gemma 4 en variante instruction-tuned (it), con 12 mil millones de parametros, y que ha sido sometido a un fine-tune adicional por parte de icelandicfox. No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares.

El unico proceso tecnico documentado es el de cuantizacion realizado por mradermacher: se indica el uso de cuantizaciones ponderadas con imatrix (weighted/imatrix quants), una tecnica que calibra los errores de cuantizacion por capa usando una matriz de importancia, lo que mejora la calidad de los niveles bajos de bits frente a la cuantizacion uniforme. Los metadatos de la model card indican quantize_version 2, output_tensor_quantised 1 y convert_type hf, lo que confirma una conversion desde pesos en formato Hugging Face. No hay informacion sobre innovaciones arquitectonicas como atencion lineal, decodificacion especulativa o mecanismos hibridos.

## Capacidades

- Generacion de texto y conversacion multi-turno: el sufijo "it" indica ajuste para instrucciones, aunque no se detallan capacidades concretas.
- Razonamiento y seguimiento de instrucciones: presumible por la naturaleza instruction-tuned del modelo base, sin datos verificables.
- Generacion de codigo: no confirmado en la informacion disponible.
- Matematicas: no confirmado en la informacion disponible.
- Vision: no disponible; no se indica que el modelo sea multimodal.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se especifican idiomas.
- Modo thinking: no disponible.
- Ejecucion local en CPU y GPU de consumo: si, gracias a las cuantizaciones GGUF de 1 a 6 bits.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: las cuantizaciones IQ2/IQ3 permiten cargar el modelo en RAM del sistema mediante llama.cpp, posibilitando asistentes conversacionales offline en equipos de 16-32 GB de RAM.
- Prototipado rapido de aplicaciones de chat: usar la cuantizacion Q4_K_M como compromiso entre calidad y tamano para validar flujos conversacionales antes de migrar a pesos completos o a una API.
- Inferencia en GPU de consumo con VRAM limitada: la variante Q4_K_M de un modelo de 12B ocupa aproximadamente 7-8 GB, lo que permite ejecutarlo en tarjetas de 8-12 GB como la RTX 3060 Ti, 4060 Ti o 4070.
- Evaluacion comparativa de niveles de cuantizacion: el repositorio ofrece 24 variantes, lo que permite medir la degradacion de calidad entre IQ1_S y Q6_K en tareas concretas del usuario.
- Integracion en herramientas de escritorio tipo Ollama o LM Studio: al ser GGUF, puede importarse directamente en estos entornos para asistentes personales de redaccion o resumen.
- Experimentacion con fine-tunes de la comunidad: util para investigadores que quieran evaluar el efecto de un fine-tune comunitario sobre Gemma 4 sin necesidad de infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 12B, estimacion orientativa segun cuantizacion):
  - IQ1_S / IQ1_M: aproximadamente 2,5-3,5 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: aproximadamente 3,5-4,5 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M: aproximadamente 5-5,5 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 5,5-6,5 GB.
  - Q4_0 / Q4_1 / Q4_K_S / IQ4_XS / IQ4_NL: aproximadamente 6,5-7,5 GB.
  - Q4_K_M: aproximadamente 7-8 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 8-9 GB.
  - Q6_K: aproximadamente 9,5-10,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 y H100 para las variantes de mayor precision con contexto largo.
- Cabe en GPU de consumo: si, desde tarjetas de 4 GB (IQ1) hasta 12-16 GB (Q5/Q6). Las variantes Q4 caben en 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requeririan los pesos safetensors originales.
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-12B-it-Fox-i1-GGUF (este) | 12B (nominal) | no disponible | no disponible | GGUF (24 cuantizaciones) | Hugging Face |
| Gemma-4-12B-it (base oficial de Google) | 12B | no disponible en esta ficha | no disponible | safetensors | Hugging Face |
| Gemma-4-12B-it-Fox (fine-tune original de icelandicfox) | 12B | no disponible | no disponible | safetensors | Hugging Face |
| Mistral-Nemo-12B-Instruct (alternativa de tamano similar) | 12B | 128K | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa detallada de rendimiento no es posible porque no se han publicado benchmarks del modelo en la informacion disponible. La principal diferencia frente a los pesos originales es la disponibilidad de cuantizaciones GGUF para inferencia local.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan datos de entrenamiento, sesgos, idiomas ni evaluaciones, lo que impide auditar el modelo.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; debe verificarse en el repositorio del modelo base (Gemma-4-12B-it-Fox) y en la licencia de Gemma 4 de Google.
- Riesgo de alucinacion: inherente a los modelos de lenguaje instruction-tuned; sin evaluaciones publicadas no puede cuantificarse.
- Sesgos desconocidos: al no documentarse la composicion del dataset de fine-tune, no es posible identificar sesgos de dominio, idioma o cultura.
- Inconsistencia en metadatos: el campo de parametros en safetensors (1.391.607) no concuerda con un modelo de 12B, lo que sugiere errores en la publicacion y aconseja verificar la integridad de los archivos antes de usarlos en produccion.
- Repositorio con 0 descargas y tamano de 0.0 GB: posible publicacion incompleta o no verificada; conviene comprobar que los archivos GGUF estan efectivamente subidos.
- Las cuantizaciones de 1-2 bits (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad y no son recomendables para tareas de razonamiento o codigo.
- No hay garantia de soporte de tool calling ni de contexto largo en el fine-tune comunitario.
- El modelo base Gemma esta sujeto a los terminos de uso de Google; el fine-tune y la cuantizacion anaden capas de licencia que deben revisarse.

## Enlaces

- Repositorio Hugging Face de este modelo: https://huggingface.co/mradermacher/Gemma-4-12B-it-Fox-i1-GGUF
- Modelo base del fine-tune: https://huggingface.co/icelandicfox/Gemma-4-12B-it-Fox
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Repositorio de llama.cpp (backend de inferencia GGUF): https://github.com/ggerganov/llama.cpp
- Repositorio de Ollama: https://github.com/ollama/ollama
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
