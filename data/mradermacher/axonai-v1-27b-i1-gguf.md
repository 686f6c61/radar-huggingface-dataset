# mradermacher/AxonAI-v1-27B-i1-GGUF

## Resumen

AxonAI-v1-27B-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo base AxonAI-v1-27B, publicado por AxonDAO. El repositorio no contiene un modelo original, sino una redistribucion optimizada para inferencia local mediante llama.cpp y derivados, con cuantizaciones de tipo weighted/imatrix. El modelo base cuenta con 26.895.998.464 parametros (aproximadamente 27B), lo que lo situa en la gama de modelos densos de gran tamano aptos para hardware de gama alta.

La relevancia de esta ficha radica en que permite evaluar rapidamente la disponibilidad de cuantizaciones para un modelo de 27B en formatos que van desde IQ1_S hasta Q6_K, cubriendo un rango amplio de compromisos entre calidad y consumo de memoria. Esto es especialmente util para desarrolladores que quieran desplegar el modelo en GPUs de consumo o en configuraciones multi-GPU sin reentrenar ni convertir pesos.

No obstante, la informacion publica disponible es muy limitada: no se especifican licencia, idiomas, pipeline ni resultados de benchmarks. La model card se limita a metadatos de cuantizacion y a la referencia al modelo base, por lo que muchos apartados de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer denso, inferido por el numero de parametros y el formato GGUF) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base AxonAI-v1-27B en la documentacion proporcionada. Por el numero de parametros (26,9B) y el formato de publicacion (GGUF con cuantizaciones K-quant e I-quant), se trata de un transformer denso compatible con llama.cpp, pero no se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones.

Tampoco se detallan los datos de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF/DPO o procesos de alineacion. La unica informacion tecnica disponible es la relativa al proceso de cuantizacion: se han generado cuantizaciones ponderadas con imatrix (importance matrix), lo que suele mejorar la calidad de los formatos de baja precision (IQ1, IQ2, IQ3) frente a cuantizaciones sin matriz de importancia. El repositorio ocupa 39,5 GB e incluye 24 variantes de cuantizacion.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" sugiere uso orientado a dialogo multi-turno, aunque no se detallan capacidades especificas.
- Razonamiento y codigo: no disponible en la informacion proporcionada.
- Matematicas: no disponible.
- Vision: no disponible (no se referencia ningun proyector mmproj en la model card).
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M e IQ4_XS, el modelo puede ejecutarse en GPUs de consumo con 24 GB de VRAM (RTX 3090/4090) usando llama.cpp u Ollama, permitiendo prototipado offline sin dependencia de APIs.
- Servicios de chat autoalojados: las variantes Q5_K_M y Q6_K ofrecen mayor fidelidad para entornos conversacionales donde la calidad prima sobre la velocidad, integrables en backends compatibles con la API de OpenAI.
- Experimentacion con cuantizaciones de baja precision: las variantes IQ1_S, IQ2_XXS e IQ3_XXS permiten evaluar el impacto de la compresion agresiva en un modelo de ~27B, util para investigacion sobre degradacion de calidad.
- Inferencia en entornos con VRAM limitada: las cuantizaciones Q2_K_S e IQ2_M pueden caber en GPUs de 12-16 GB, habilitando pruebas en hardware modesto a costa de perdida de calidad.
- Pipelines de evaluacion comparativa: al ofrecer 24 variantes del mismo modelo, es posible medir el efecto de la cuantizacion en tareas concretas (perplejidad, generacion) manteniendo el resto de variables constantes.
- Integracion en herramientas de escritorio: mediante llama.cpp u Ollama, el modelo puede embeberse en aplicaciones locales tipo asistente sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y sin offloading):
  - IQ1_S / IQ1_M: ~5-7 GB
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: ~7-10 GB
  - Q2_K / Q2_K_S: ~9-11 GB
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: ~11-14 GB
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / small-IQ4_NL: ~15-17 GB
  - Q5_K_S / Q5_K_M: ~18-20 GB
  - Q6_K: ~21-23 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para Q6_K y despliegues con contexto largo; RTX 3090 para cuantizaciones Q4.
- Cabe en GPU de consumo: si, en RTX 3090/4090 para Q4 y Q5; en GPUs de 12-16 GB solo con cuantizaciones IQ2/IQ3 o con offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (si soporta GGUF), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| AxonAI-v1-27B-i1-GGUF | ~26,9B | no disponible | no disponible | GGUF | Hugging Face |
| Modelos densos de ~27B en GGUF (p. ej. variantes de la familia Qwen o Mistral) | ~24-32B | variable | variable | GGUF | Hugging Face |

No se dispone de datos de rendimiento ni de contexto del modelo base, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas concretas. Cualquier comparacion se limitaria a parametros y formato.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible consultar el repositorio del modelo base (AxonDAO/AxonAI-v1-27B) antes de usarlo en produccion.
- Idiomas no declarados: no hay garantia de calidad multilingue ni de soporte del castellano.
- Ausencia de benchmarks: no hay evidencia publica de rendimiento en tareas estandar.
- Riesgo de alucinacion: inherente a los modelos generativos; sin datos de alineacion no se puede estimar su magnitud.
- Las cuantizaciones de baja precision (IQ1, IQ2) pueden degradar notablemente la calidad y la coherencia; se recomienda validar antes de usar en produccion.
- El repositorio es una redistribucion de cuantizaciones, no el modelo original; los problemas de licencia o sesgos deben atribuirse al modelo base.
- Sin informacion sobre longitud de contexto: no se puede asumir una ventana grande para casos de uso con documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/AxonAI-v1-27B-i1-GGUF
- Modelo base: https://huggingface.co/AxonDAO/AxonAI-v1-27B
