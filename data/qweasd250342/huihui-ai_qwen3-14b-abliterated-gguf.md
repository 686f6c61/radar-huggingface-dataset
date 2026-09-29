# QWEasd250342/huihui-ai_Qwen3-14B-abliterated-GGUF

# Ficha del modelo: Qwen3-14B-abliterated (GGUF) de QWEasd250342

## Resumen
Este repositorio contiene una coleccion de cuantizaciones en formato GGUF del modelo huihui-ai/Qwen3-14B-abliterated, una variante del Qwen3-14B de Alibaba Qwen a la que se ha aplicado la tecnica de "abliteration" (eliminacion de la direccion de rechazo en el espacio de activaciones). El resultado es un modelo de chat con el filtrado de seguridad drasticamente reducido, orientado a investigacion, red teaming y entornos controlados. El repositorio esta publicado por el usuario QWEasd250342, aunque el model card atribuye las cuantizaciones a bartowski y enlaza a su repositorio original.

El modelo base Qwen3-14B es un transformer denso de 14.768.307.200 parametros (aproximadamente 14,8 mil millones), perteneciente a la familia Qwen3. Sobre el se aplico abliteration hasta producir una version "uncensored", y posteriormente se generaron cuantizaciones GGUF mediante llama.cpp (release b5284) usando el metodo imatrix para mejorar la fidelidad respecto al modelo en precision completa.

Su relevancia actual radica en que permite desplegar localmente un modelo de 14B sin censura con requisitos de hardware moderados (desde ~9 GB en Q4_K_M hasta ~16 GB en Q8_0), lo que lo hace util para estudios de alineacion, evaluacion de sesgos y desarrollo de aplicaciones donde los rechazos automaticos del modelo de serie resultan un obstaculo.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 14.768.307.200 (~14,8 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF: bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_1, Q4_0, Q3_K_XL, IQ4_NL, entre otras |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp); el repositorio declara parametros safetensors como fuente |

## Arquitectura y entrenamiento
La arquitectura subyacente corresponde a Qwen3-14B, un transformer denso decoder-only de la serie Qwen3, que segun la documentacion de la familia combina modelos densos y de mezcla de expertos (MoE), siendo el modelo 14B una variante densa. El repositorio en si no aporta detalles adicionales sobre la arquitectura interna (numero de capas, dimensiones de atencion, uso de GQA, etc.), por lo que esos datos no estan disponibles en la informacion proporcionada.

Sobre el entrenamiento del modelo base no se incluye informacion en el repositorio: no se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo que si se documenta es el post-procesado: la variante "abliterated" de huihui-ai modifica el modelo original para reducir su comportamiento de rechazo, y despues se aplico cuantizacion GGUF con llama.cpp b5284 usando el metodo imatrix, que emplea un dataset de calibracion para minimizar la perdida de calidad en las cuantizaciones mas agresivas. No se documenta ninguna innovacion arquitectonica adicional en este repositorio.

## Capacidades
- Generacion de texto y conversacion multi-turno en formato chat, con plantilla basada en ChatML (`<|im_start|>system ... <|im_start|>user ... <|im_start|>assistant`).
- Modelo "uncensored" (abliterated): la pieza central de su propuesta es la ausencia de filtrado de seguridad, lo que le permite responder a peticiones que el Qwen3-14B original rechazaria.
- Razonamiento y generacion de codigo: heredados del modelo base Qwen3-14B, aunque no se confirman explicitamente en la informacion de este repositorio.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante; seria heredable del modelo base Qwen3-14B.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no documentadas en la informacion proporcionada.
- Compatibilidad de despliegue: formatos GGUF listos para llama.cpp, LM Studio y proyectos derivados.

## Casos de uso
- Investigacion en alineacion y seguridad: el modelo permite estudiar que comportamientos emergen cuando se elimina la direccion de rechazo, comparando sus respuestas con las del Qwen3-14B original en el mismo conjunto de prompts.
- Red teaming y evaluacion de riesgos: util para generar contenido adversario controlado y comprobar como responden clasificadores de toxicidad o filtros de moderacion frente a un modelo sin censura.
- Conversacion local sin restricciones tematicas: para escritura creativa, ficcion adulta o narrativa con temas sensibles donde los rechazos del modelo de serie interrumpen el flujo, ejecutandose en una GPU de consumo con cuantizacion Q4_K_M (~9 GB).
- Analisis de sesgos: al no activar las capas de rechazo, resulta mas sencillo exponer los sesgos latentes del modelo base en tareas de clasificacion y generacion.
- Asistentes tecnicos en entornos controlados: con las cuantizaciones Q6_K o Q8_0 (~12-16 GB) se obtiene una fidelidad cercana a la del modelo completo para tareas de asistencia tecnica interna donde la moderacion no es un requisito.
- Experimentacion con cuantizaciones: el repositorio ofrece una escala completa (bf16, Q8_0, Q6_K, Q5_K, Q4_K, Q3_K, IQ4_NL), lo que permite medir el impacto de cada nivel de compresion sobre la calidad de las respuestas con un mismo modelo.
- Despliegue en LM Studio u Ollama para pruebas de prompt engineering: la integracion con llama.cpp y la disponibilidad en el registro de Ollama (`huihui_ai/qwen3-abliterated:14b`) facilitan la experimentacion rapida en local.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia, segun los tamanos de archivo publicados:
  - bf16: 29,54 GB (~30-34 GB de VRAM efectiva con contexto y cache).
  - Q8_0: 15,70 GB.
  - Q6_K_L / Q6_K: 12,50 GB / 12,12 GB.
  - Q5_K_M / Q5_K_S: 10,51 GB / 10,26 GB.
  - Q4_K_M: 9,00 GB; Q4_K_S: 8,57 GB; Q4_0: 8,54 GB; Q3_K_XL: 8,58 GB.
- GPU recomendadas: para bf16, A100 40 GB, H100, o dos GPU de 24 GB; para Q8_0, RTX 4090/3090 (24 GB) o A6000; para Q6_K y Q5_K, tarjetas de 16 GB como RTX 4080 o 4070 Ti Super; para Q4_K_M/Q4_K_S, tarjetas de 12 GB como RTX 3060 12 GB o RTX 4070.
- Cabe en GPU de consumo: si, desde Q4_K_M (~9 GB) en adelante en tarjetas de 12 GB, y Q6/Q5 en tarjetas de 16 GB. En GPU de 8 GB es necesario descargar capas a CPU/RAM.
- Al ser un modelo de 14B, las cuantizaciones de 8 GB a 16 GB tambien se pueden ejecutar total o parcialmente en CPU con llama.cpp sobre 16-32 GB de RAM, a costa de velocidad.
- Opciones de despliegue: llama.cpp (release b5284 o superior), LM Studio, Ollama (`huihui_ai/qwen3-abliterated:14b`) y cualquier proyecto basado en llama.cpp. vLLM y TGI tienen soporte GGUF limitado o experimental.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| QWEasd250342/huihui-ai_Qwen3-14B-abliterated-GGUF (este repositorio) | ~14,8B (denso) | No disponible | GGUF (llama.cpp, LM Studio, Ollama) | Apache 2.0 | Espejo del trabajo de cuantizacion de bartowski; sin descargas ni likes en el momento de la consulta |
| huihui-ai/Qwen3-14B-abliterated | ~14,8B (denso) | No disponible | Pesos originales (safetensors) | Apache 2.0 | Modelo fuente sin censura; requiere conversion o cuantizacion propia |
| bartowski/huihui-ai_Qwen3-14B-abliterated-GGUF | ~14,8B (denso) | No disponible | GGUF | Apache 2.0 | Repositorio original de las cuantizaciones; los archivos de este repositorio apuntan a el |
| mradermacher/Huihui-Qwen3-14B-abliterated-v2-i1-GGUF | ~14,8B (denso) | No disponible | GGUF (imatrix i1) | Apache 2.0 | Cuantizaciones alternativas de la misma variante abliterated |
| Qwen/Qwen3-14B | ~14,8B (denso) | No disponible | safetensors, GGUF | Apache 2.0 | Modelo original de Alibaba con alineacion de seguridad intacta |

## Limitaciones y advertencias
- Riesgo elevado de contenido sensible, controvertido o inapropiado: el propio autor advierte que el filtrado de seguridad se ha reducido significativamente y que las salidas deben revisarse rigurosamente.
- No apto para todas las audiencias: los resultados pueden ser inapropiados en entornos publicos, con menores o en aplicaciones que exijan alta seguridad.
- Responsabilidad legal y etica del usuario: el autor declina cualquier responsabilidad sobre las consecuencias del uso y recuerda que el contenido generado puede conllevar riesgos legales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual para esta variante; al proceder de un modelo base modificado, la fiabilidad de los hechos no esta garantizada.
- Limitaciones de contexto e idioma: no se dispone de informacion confirmada sobre la ventana de contexto real ni sobre los idiomas soportados en esta variante.
- Uso recomendado restringido a investigacion, pruebas o entornos controlados, evitando su empleo directo en produccion o en aplicaciones comerciales de cara al publico.
- Sin garantias de seguridad por defecto: el modelo no ha pasado por un proceso de optimizacion de seguridad riguroso.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime al usuario de cumplir la legislacion aplicable ni de las advertencias anteriores.
- Repositorio con 0 descargas y 0 likes: no existe validacion de la comunidad sobre esta copia concreta; conviene verificar la integridad de los archivos frente al repositorio original de bartowski.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/QWEasd250342/huihui-ai_Qwen3-14B-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Qwen3-14B-abliterated
- Cuantizaciones originales de bartowski: https://huggingface.co/bartowski/huihui-ai_Qwen3-14B-abliterated-GGUF
- Modelo Qwen3 original: https://huggingface.co/Qwen/Qwen3-14B
- Licencia Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B/blob/main/LICENSE
- Version en Ollama: https://ollama.com/huihui_ai/qwen3-abliterated:14b
- Cuantizaciones alternativas (mradermacher): https://www.modelscope.cn/models/mradermacher/Huihui-Qwen3-14B-abliterated-v2-i1-GGUF
- Ficha en Local AI Zone: https://local-ai-zone.github.io/models/huihui-ai-qwen3-14b-abliterated.html
- llama.cpp (release b5284): https://github.com/ggerganov/llama.cpp/releases/tag/b5284
- LM Studio: https://lmstudio.ai/
