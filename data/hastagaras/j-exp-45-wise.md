# Hastagaras/J-EXP-45-WiSE

## Resumen

J-EXP-45-WiSE es un modelo de lenguaje publicado por el usuario Hastagaras en HuggingFace, construido mediante una fusión de pesos (merge) con la técnica WiSE-FT sobre el modelo base Hastagaras/G4-Jamet-26B-A4B-MK-2. La nomenclatura del tag `gemma4` y el sufijo `A4B` del checkpoint base sugieren una arquitectura derivada de la familia Gemma con mezcla de expertos (MoE) y aproximadamente 4.000 millones de parámetros activos, aunque esta información no está confirmada de forma explícita en los metadatos disponibles. El modelo cuenta con 25.805.936.206 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de ~26B.

El interés de este checkpoint reside en que aplica WiSE-FT (Weight-Space Ensembling for Fine-Tuning), una técnica que interpola linealmente los pesos de un modelo preentrenado y su versión ajustada para preservar capacidades generales mientras se incorporan las mejoras del fine-tuning. Se trata de un experimento (el prefijo `J-EXP` así lo indica) más que de un modelo de producción, con solo 137 descargas y sin documentación técnica publicada en la información disponible.

La relevancia es limitada para uso general: no hay model card detallada, no se especifican idiomas, benchmarks ni composición del dataset de entrenamiento. Su interés es principalmente para quienes siguen el ecosistema de merges de la comunidad y quieran evaluar el efecto de WiSE-FT sobre un MoE de ~26B derivado de Gemma. El acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE derivada de Gemma (tag `gemma4`), detalles no disponibles |
| Parametros totales | 25.805.936.206 |
| Parametros activos | ~4B (inferido del sufijo A4B del modelo base; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge de pesos mediante WiSE-FT, no de un entrenamiento desde cero. WiSE-FT interpola los parámetros de un modelo base y de un modelo ajustado (fine-tuned) con un coeficiente de mezcla, con el objetivo de retener el rendimiento del modelo original en dominios generales mientras se conservan las ganancias del ajuste. En este caso, el checkpoint base es Hastagaras/G4-Jamet-26B-A4B-MK-2, un modelo de la comunidad que, por su nomenclatura, parece un MoE de ~26B totales con ~4B activos construido sobre la arquitectura Gemma.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni el coeficiente de interpolación aplicado en el merge. Tampoco hay detalles sobre innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.). El tag `merge` confirma la naturaleza del proceso, pero la model card no documenta la receta exacta.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Gemma subyacente (no verificados en este checkpoint).
- Capacidad de mezcla de expertos con activación dispersa (~4B activos sobre ~26B totales, inferido), lo que en teoría reduce el coste de inferencia frente a un modelo denso del mismo tamaño.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación de técnicas de merge: el caso más realista es servir como objeto de estudio para investigadores que quieran medir el impacto de WiSE-FT sobre un MoE de ~26B, comparando su comportamiento con el checkpoint base G4-Jamet-26B-A4B-MK-2.
- Experimentación académica en eficiencia de MoE: al tener ~26B totales y presumiblemente ~4B activos, permite estudiar el equilibrio entre calidad y coste de inferencia en entornos con VRAM limitada.
- Fine-tuning posterior como punto de partida: su licencia Apache 2.0 facilita usarlo como base para ajustes específicos de dominio, siempre que se acepten las condiciones de acceso.
- Prototipado interno de asistentes conversacionales: para equipos que ya trabajan con la familia Gemma y quieren probar variantes de la comunidad sin compromiso de producción.
- Investigación sobre retención de capacidades tras fine-tuning: WiSE-FT está diseñado precisamente para mitigar el olvido catastrófico, por lo que el modelo sirve para validar esa hipótesis en tareas generales frente a tareas ajustadas.
- Benchmarking de pipelines de despliegue: útil para probar vLLM, TGI o llama.cpp con un checkpoint MoE de ~26B y verificar compatibilidad de safetensors y requisitos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~52 GB solo para pesos (25,8B × 2 bytes), más overhead de KV cache y activaciones; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: ~26 GB de pesos, viable en una RTX 4090 de 24 GB solo con cuantización más agresiva o descarga parcial a CPU.
- VRAM estimada en cuantización de 4 bits: ~13-14 GB de pesos, cabe en GPUs consumer de 16-24 GB (RTX 4080, 4090, RTX 3090), aunque no hay GGUF publicado y habría que generarlo.
- GPU recomendadas: A100 80 GB, H100 80 GB para FP16; RTX 4090 o A6000 para cuantización 4/8 bits.
- Opciones de despliegue: vLLM y TGI para safetensors en FP16; llama.cpp/Ollama requerirían conversión a GGUF, no disponible oficialmente.
- Latencia y throughput: no disponibles; al ser presumiblemente MoE con ~4B activos, el throughput debería ser superior al de un denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| J-EXP-45-WiSE | 25,8B totales (~4B activos, inferido) | no disponible | Apache 2.0 | Gated en HF | Merge WiSE-FT, sin benchmarks |
| Hastagaras/G4-Jamet-26B-A4B-MK-2 | ~26B (~4B activos, inferido) | no disponible | no disponible | HF | Modelo base del merge |
| Gemma 2 27B (referencia de familia) | 27B densos | 8K | Gemma license | Público | Denso, no MoE; contexto y benchmarks conocidos |
| Mixtral 8x7B | 46,7B totales (12,9B activos) | 32K | Apache 2.0 | Público | MoE de referencia con benchmarks publicados |

La comparación con Gemma 2 27B y Mixtral 8x7B es orientativa por categoría de tamaño; no implica equivalencia de rendimiento, ya que J-EXP-45-WiSE no publica evaluaciones.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no hay información sobre datos de entrenamiento, idiomas, contexto ni evaluación, lo que impide garantizar comportamiento en producción.
- Riesgo elevado de alucinación y de comportamiento impredecible al ser un merge experimental sin validación publicada.
- Sesgos desconocidos: al no documentarse la composición del dataset del modelo base, no se pueden evaluar sesgos de género, idioma o dominio.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que añade fricción para uso automatizado o en CI/CD.
- Licencia Apache 2.0 declarada, pero conviene verificar que el modelo base y los datos subyacentes sean compatibles con uso comercial, dado que la cadena de procedencia no está documentada.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ): el despliegue en hardware consumer exige conversión manual.
- Contexto e idiomas no declarados: no apto para aplicaciones que dependan de ventanas largas o multilingüismo sin validación previa.
- Solo 137 descargas y 0 likes en el momento de la consulta: ecosistema de validación prácticamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hastagaras/J-EXP-45-WiSE
- Modelo base: https://huggingface.co/Hastagaras/G4-Jamet-26B-A4B-MK-2
- Paper de WiSE-FT (referencia de la técnica): https://arxiv.org/abs/2109.01903
