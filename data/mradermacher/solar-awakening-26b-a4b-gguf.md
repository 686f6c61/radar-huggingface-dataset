# mradermacher/Solar-Awakening-26B-A4B-GGUF

## Resumen

Solar-Awakening-26B-A4B-GGUF es una cuantizacion estatica en formato GGUF del modelo Solar-Awakening-26B-A4B, publicado por el usuario mradermacher en Hugging Face. El modelo base, alojado por Sorihon, presenta 25.971.339.550 parametros totales (aproximadamente 26B) y la nomenclatura "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con unos 4B de parametros activos por token, aunque esta informacion no se confirma de forma explicita en la documentacion disponible.

El repositorio es una conversion de pesos a formato GGUF para inferencia optimizada en CPU y GPU de consumo mediante llama.cpp y herramientas compatibles. Incluye un conjunto de cuantizaciones estaticas que abarcan desde Q2_K hasta Q8_0, ademas de IQ4_XS y F16, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. El tamano total del repositorio es de 103,7 GB.

La relevancia de esta ficha radica en que facilita el despliegue local de un modelo de gran tamano con arquitectura presumiblemente MoE, un formato cada vez mas habitual para obtener capacidades cercanas a modelos densos de mayor tamano con un coste de inferencia reducido. No obstante, la informacion publicada por el autor es muy limitada: no se detallan licencia, idiomas, pipeline ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), segun la nomenclatura "A4B"; no confirmado en la model card |
| Parametros totales | 25.971.339.550 (aproximadamente 26B) |
| Parametros activos | aproximadamente 4B (inferido de "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. La nomenclatura "26B-A4B" sigue el patron habitual de los modelos MoE, donde el primer numero indica los parametros totales y el segundo los parametros activos por token. De confirmarse, se trataria de un transformer con capas de mezcla de expertos dispersas, con aproximadamente 4B de parametros activos en cada paso de inferencia, lo que reduciria el coste computacional frente a un modelo denso de 26B.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas. La model card del repositorio unicamente documenta el proceso de cuantizacion: cuantizaciones estaticas generadas con quantize_version 2, output_tensor_quantised 1, convert_type hf y sin proyeccion multimodal (skip_mmproj 1), lo que indica que el modelo base no incluye componentes de vision.

## Capacidades

- Generacion de texto y razonamiento general, asumiendo las capacidades tipicas de un modelo de ~26B con arquitectura MoE; no verificadas en la documentacion.
- Procesamiento de lenguaje natural multilingue: no se especifican los idiomas soportados.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales: descartadas, ya que la cuantizacion omite el componente mmproj.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en equipos con 16-24 GB de VRAM o RAM, aprovechando la arquitectura MoE para mantener una velocidad de generacion aceptable.
- Prototipado de asistentes conversacionales: el modelo puede integrarse en aplicaciones de chat mediante llama.cpp u Ollama, con la ventaja de no depender de servicios en la nube y preservar la privacidad de los datos.
- Experimentacion en investigacion: util para estudiar el comportamiento de modelos MoE de ~26B bajo distintas cuantizaciones y comparar la degradacion de calidad entre Q2_K y Q8_0.
- Generacion de texto en entornos con recursos limitados: las variantes Q2_K y Q3_K_S reducen el peso a un rango manejable para GPUs de consumo, aunque con perdida de calidad esperable.
- Fine-tuning y evaluacion comparativa: el modelo base en safetensors puede servir como punto de partida para ajuste fino, mientras que las versiones GGUF permiten evaluar el rendimiento en inferencia.
- Integracion en pipelines de CI/CD para pruebas de regresion de modelos: las cuantizaciones ligeras permiten ejecutar validaciones automatizadas sin infraestructura dedicada.
- Servicio de inferencia autoalojado: mediante llama.cpp server o vLLM (si se convierte a otro formato), para aplicaciones internas con requisitos de soberania del dato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q2_K: ~10-11 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~12-15 GB
  - Q4_K_S / Q4_K_M / IQ4_XS: ~15-17 GB
  - Q5_K_S / Q5_K_M: ~18-20 GB
  - Q6_K: ~21-23 GB
  - Q8_0: ~28-30 GB
  - F16: ~52-55 GB
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; A100 40/80 GB o H100 para Q8_0 y F16; RTX 3090/4080 para Q3 y Q4.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 y 4070 Ti Super con cuantizaciones Q4 o inferiores; en GPUs de 8-12 GB solo con Q2_K o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp y servidores compatibles con GGUF. vLLM y TGI no admiten GGUF de forma nativa.
- Latencia y throughput: no disponibles; dependeran del hardware y de la cuantizacion. En un modelo MoE con ~4B activos, se espera un throughput superior al de un denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Solar-Awakening-26B-A4B-GGUF | ~26B | ~4B (no confirmado) | no disponible | no disponible | GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32K | MIT (codigo) / licencia propia | safetensors |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo Solar-Awakening que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican los terminos de uso comercial, lo que supone un riesgo legal para produccion.
- Idiomas no documentados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Contexto desconocido: se desconoce la longitud maxima de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Riesgo de alucinacion: inherente a los modelos generativos; sin datos de evaluacion no se puede estimar su magnitud.
- Sesgos: no se documentan los datos de entrenamiento ni los sesgos conocidos del modelo base.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar notablemente la calidad, especialmente en tareas de razonamiento y codigo.
- Modelo derivado: la responsabilidad sobre el comportamiento final recae en el modelo base de Sorihon, cuya model card no se ha verificado en esta ficha.
- Sin soporte multimodal: la cuantizacion omite el componente mmproj, por lo que no procesa imagenes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Solar-Awakening-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Sorihon/Solar-Awakening-26B-A4B
