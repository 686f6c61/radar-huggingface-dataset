# mradermacher/SDRM-Qwen3-4B-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF estáticas del modelo SDRM-Qwen3-4B, publicadas por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización del fine-tune `opsd-genrm/SDRM-Qwen3-4B`, que a su vez parte de la familia Qwen3 de Alibaba en su variante de 4.000 millones de parámetros. El repositorio incluye doce variantes de cuantización generadas con llama.cpp (versión de cuantización 2, con tensores de salida cuantizados y conversión de tipo `hf`).

Su relevancia práctica es que permite ejecutar un modelo de la clase 4B en hardware de consumo mediante formatos GGUF, algo imposible con los pesos originales en safetensors si no se dispone de GPU con suficiente VRAM. La existencia de variantes desde Q2_K hasta Q8_0 y F16 permite ajustar el equilibrio entre calidad y huella de memoria según el equipo disponible.

La limitación principal es documental: la model card publicada no incluye información sobre el proceso de fine-tuning, la composición del dataset, los idiomas soportados, la licencia ni resultados de benchmarks. Tampoco se documenta qué significa el identificador SDRM ni las características del ajuste realizado por `opsd-genrm`. Toda evaluación seria del modelo requiere consultar el repositorio del modelo base, y aun así los datos disponibles en esta información son mínimos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de la familia Qwen3 (modelo base: `opsd-genrm/SDRM-Qwen3-4B`). No se documenta si el fine-tune modifica la arquitectura |
| Parametros totales | Aproximadamente 4.000 millones, deducidos de la denominacion del modelo base (Qwen3-4B). No confirmado en la model card |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible en la model card. El modelo base de la familia Qwen3-4B declara 32.768 tokens nativos |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS (12 variantes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card del repositorio de cuantizaciones no la declara; depende de la licencia del modelo base |
| Formato de pesos | GGUF (generado con llama.cpp; `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) |

## Arquitectura y entrenamiento

La arquitectura del modelo subyacente corresponde a la familia Qwen3, un transformer decoder-only denso con atención de consultas agrupadas (GQA), normalización RMSNorm y activación SwiGLU. No hay evidencia en la información disponible de que el fine-tune SDRM introduzca cambios estructurales, capas híbridas, mezcla de expertos ni mecanismos de atención lineal. El repositorio de mradermacher es exclusivamente un trabajo de conversión a GGUF y cuantización posterior, no un entrenamiento.

No se dispone de ningún dato sobre el proceso de entrenamiento del fine-tune: ni el número de tokens, ni la composición del dataset, ni si se emplearon técnicas de alineación como RLHF, DPO, ORPO o SFT supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa, modo de razonamiento explícito o ventanas de contexto extendidas mediante YaRN. El identificador SDRM no aparece explicado en la model card ni en los resultados de búsqueda disponibles.

## Capacidades

- Generación de texto en formato conversacional: el pipeline declarado para repositorios hermanos de la misma familia es el de modelo de lenguaje, aunque en este repositorio concreto el campo `pipeline` aparece como no disponible.
- Razonamiento y conocimiento general: capacidades heredadas presumiblemente del modelo base Qwen3-4B, sin verificación independiente en esta información.
- Generación de código y matemáticas: no confirmado para este fine-tune concreto.
- Tool calling y function calling: no disponible; no se documenta soporte explícito.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la lista de idiomas no está declarada.
- Capacidades multimodales (visión, audio): no disponible; el repositorio no incluye ficheros mmproj según los metadatos (`skip_mmproj` vacío, sin mención de proyector visual).
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Inferencia local en equipos de sobremesa: las variantes Q4_K_M e IQ4_XS permiten ejecutar un modelo de la clase 4B en GPU con 4-6 GB de VRAM mediante llama.cpp u Ollama, lo que habilita asistentes conversacionales sin conexión a internet.
- Prototipado rápido de aplicaciones de lenguaje: al ser un GGUF de 2-3 GB, se puede cargar en portátiles y estaciones de trabajo modestas para iterar sobre prompts y flujos antes de migrar a un modelo mayor.
- Despliegue en el borde (edge computing): las variantes Q2_K y Q3_K_S, con huellas de 1,7-2,1 GB, son candidatas para dispositivos con memoria limitada, aunque con degradación de calidad esperable.
- Evaluación comparativa de fine-tunes: el repositorio sirve para medir el efecto de un ajuste concreto (SDRM) frente al Qwen3-4B original, manteniendo constante la cuantización.
- Fine-tuning posterior sobre formato GGUF: mediante adaptadores LoRA aplicados sobre la base cuantizada en herramientas compatibles con llama.cpp.
- Generación asistida en entornos sin GPU: la inferencia en CPU con Q3_K_M o Q4_K_S es viable en equipos con 8-16 GB de RAM, útil para automatizaciones por lotes no críticas en latencia.
- Investigación sobre cuantización: el conjunto de doce variantes permite estudiar empíricamente la degradación de calidad por nivel de cuantización sobre un mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Estimaciones de VRAM para pesos y caché KV en contexto corto (calculadas a partir del tamaño de archivo esperado para un modelo denso de 4B; no son cifras publicadas por el autor):

| Cuantizacion | Peso aproximado | VRAM recomendada con contexto moderado | GPU de referencia |
|---|---|---|---|
| F16 | ~8,0 GB | 9-10 GB | RTX 3060 12 GB, RTX 4070 |
| Q8_0 | ~4,3 GB | 5-6 GB | RTX 3060 12 GB, RTX 4060 Ti 8 GB |
| Q6_K | ~3,3 GB | 4-5 GB | RTX 3060, RTX 4060 8 GB |
| Q5_K_M | ~2,9 GB | 4 GB | GTX 1660 6 GB, RTX 3050 8 GB |
| Q4_K_M | ~2,5 GB | 3-4 GB | GPU integrada con memoria compartida, RTX 3050 |
| IQ4_XS | ~2,3 GB | 3-4 GB | GTX 1650 4 GB, iGPU moderna |
| Q3_K_M | ~2,1 GB | 3 GB | GTX 1650 4 GB |
| Q2_K | ~1,7 GB | 2-3 GB | CPU con 8 GB de RAM |

- GPU recomendadas para producción con contexto largo: A100 40 GB, H100, L40S o RTX 4090 si se requiere ampliar la ventana de contexto más allá de los 32.768 tokens del modelo base, ya que la caché KV crece de forma lineal con la longitud de secuencia.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones de Q3_K_S en adelante, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 y portátiles con 6-8 GB de VRAM. Las variantes F16 y Q8_0 requieren 12 GB o más para trabajar con holgura.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama (mediante Modelfile con importación del GGUF), LM Studio, koboldcpp, text-generation-webui, llama-cpp-python y Jan. vLLM y TGI admiten GGUF de forma experimental y limitada; para máximo rendimiento con este formato conviene llama.cpp.
- Latencia y throughput: no disponibles. Como referencia orientativa del catálogo de índices externos para un GGUF del mismo tamaño (4B), se cita una VRAM estimada de ~5 GB y una GPU de 8 GB, sin cifras de tokens por segundo publicadas.

## Comparativa con modelos similares

La comparación se establece a nivel estructural, ya que no existen resultados de benchmarks verificados para el fine-tune SDRM en la información disponible.

| Modelo | Parametros | Contexto | Licencia | GGUF disponible | Rendimiento |
|---|---|---|---|---|---|
| mradermacher/SDRM-Qwen3-4B-GGUF | ~4B (deducido) | No declarado en la model card | No declarada en la model card | Sí, 12 variantes | No disponible |
| Qwen3-4B (base de la familia) | 4,0B | 32.768 tokens nativos | Apache 2.0 | Sí, mediante repositorios de terceros | No disponible en esta informacion |
| Qwen3-4B-Instruct-2507 | 4,0B | 262.144 tokens | Apache 2.0 | Sí, mediante repositorios de terceros | No disponible en esta informacion |
| Gemma 3 4B | 4,0B | 128.000 tokens | Gemma Terms of Use | Sí, mediante repositorios de terceros | No disponible en esta informacion |
| Llama 3.2 3B | 3,2B | 128.000 tokens | Llama 3.2 Community License | Sí, mediante repositorios de terceros | No disponible en esta informacion |

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no declara propósito, datos de entrenamiento, evaluación ni limitaciones conocidas, lo que impide auditar sesgos o comportamientos indeseados.
- Sesgos desconocidos: al no documentarse la composición del dataset de ajuste, no es posible estimar sesgos de género, raza, idioma o ideología.
- Riesgo de alucinación: inherente a los modelos de 4B de esta generación; sin benchmarks publicados no se puede acotar su magnitud. No se recomienda su uso en dominios factuales críticos sin verificación externa.
- Licencia incierta: la model card no especifica licencia. Aunque el modelo base Qwen3 se distribuye bajo Apache 2.0, el fine-tune `opsd-genrm/SDRM-Qwen3-4B` y este repositorio de cuantizaciones no lo confirman, por lo que el uso comercial queda sujeto a verificación previa con el autor.
- Idiomas no declarados: se desconoce si el fine-tune degrada el multilingüismo respecto al Qwen3-4B original.
- Contexto limitado a lo que declare el modelo base: si el fine-tune no fue entrenado con secuencias largas, el rendimiento puede degradarse mucho antes del límite nominal de 32.768 tokens.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S pueden producir pérdidas notables de coherencia, especialmente en tareas de razonamiento y código. Para producción se recomienda Q4_K_M o superior.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no existe validación comunitaria que respalde la calidad del resultado.
- Metadatos incompletos: los campos `pipeline`, licencia e idiomas aparecen vacíos en la propia ficha de HuggingFace.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mradermacher/SDRM-Qwen3-4B-GGUF
- Modelo base del fine-tune: https://huggingface.co/opsd-genrm/SDRM-Qwen3-4B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Repositorio hermano de la misma familia: https://huggingface.co/mradermacher/Qwen3-4B-RA-SFT-GGUF
- Repositorio hermano (aiops): https://huggingface.co/mradermacher/aiops-qwen-4b-GGUF
- Coleccion de modelos del autor: https://www.aimodels.fyi/creators/huggingFace/mradermacher
- Ficha externa de un GGUF de 4B comparable (referencia de VRAM estimada): https://free2aitools.com/model/mradermacher/retrosynthesis-qwen3-4b-gguf
- Guia externa sobre modelos locales por tramo de VRAM: https://insiderllm.com/guides/best-uncensored-local-llms/
