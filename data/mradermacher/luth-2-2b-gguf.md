# mradermacher/Luth-2-2B-GGUF

## Resumen

Luth-2-2B es un modelo de lenguaje pequeño (1.880 millones de parámetros) desarrollado por el equipo de kurakurai, especializado en conversación en francés y orientado a entornos de cómputo en el borde (edge). El repositorio que nos ocupa, Luth-2-2B-GGUF, es una cuantización del modelo original realizada por mradermacher, que facilita su despliegue en dispositivos con recursos limitados mediante el formato GGUF.

El modelo se basa en la arquitectura Qwen (según las etiquetas del modelo) y ha sido sometido a un proceso de post-entrenamiento que combina supervisión (SFT) y aprendizaje por refuerzo (RL), con el objetivo de optimizar su comportamiento conversacional. Su tamaño compacto lo hace especialmente relevante para aplicaciones de asistencia en francés en dispositivos móviles, sistemas embebidos o servidores de baja potencia, donde los modelos grandes resultan inviables.

La disponibilidad de múltiples cuantizaciones (desde Q2_K hasta f16) permite ajustar el equilibrio entre calidad y consumo de recursos según el hardware disponible. Aunque no se han publicado benchmarks formales, el modelo se presenta como un avance en el estado del arte para modelos pequeños en francés, según el anuncio oficial del equipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen (no se especifica variante exacta) |
| Parametros totales | 1.881.825.088 (aprox. 1,88B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (ademas de mmproj-Q8_0 y mmproj-f16 para el componente multimodal) |
| Idiomas soportados | Frances (principal), posiblemente otros no documentados |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo original) |

## Arquitectura y entrenamiento

El modelo base Luth-2-2B está construido sobre una arquitectura tipo Qwen, probablemente una variante de la serie Qwen2.5 de 1.8B, dado el número de parámetros. No se dispone de detalles técnicos sobre el número de capas, cabezas de atención o dimensiones ocultas en la información proporcionada.

El entrenamiento se realizó en dos fases de post-entrenamiento: una primera de supervisión (SFT) y una segunda de aprendizaje por refuerzo (RL), utilizando los datasets `kurakurai/Luth-2-Post-Training-SFT` y `kurakurai/Luth-2-Post-Training-RL`. Este enfoque busca mejorar la calidad conversacional y la adherencia a instrucciones en francés. No se han publicado datos sobre el preentrenamiento base ni sobre el volumen de tokens utilizados.

El repositorio GGUF incluye además archivos `mmproj` (proyección multimodal), lo que sugiere que el modelo puede tener capacidades de entrada multimodal (posiblemente visión), aunque no se especifica el tipo de modalidad ni cómo se integra.

## Capacidades

- Generacion de texto conversacional en frances, optimizado para dialogos multi-turno.
- Soporte de instrucciones y respuestas contextuales gracias al entrenamiento SFT y RL.
- Capacidades multimodales (indicadas por los archivos mmproj), aunque no se detalla el tipo de entrada (imagen, audio, etc.).
- Disenado para ejecucion en dispositivos de borde (edge) con recursos limitados.
- Compatible con el ecosistema transformers y GGUF (llama.cpp, Ollama, etc.).
- No se menciona soporte explicito de tool calling ni agentes en la informacion disponible.

## Casos de uso

- Asistente conversacional en frances para aplicaciones moviles: el modelo puede gestionar dialogos naturales gracias a su entrenamiento RL, con un tamano que permite su ejecucion local en smartphones o tablets.
- Chatbot de atencion al cliente en francés: integrable en sistemas de mensajeria o web, ofreciendo respuestas rapidas sin depender de APIs externas.
- Procesamiento de texto en dispositivos IoT: su bajo consumo de memoria lo hace apto para asistentes de voz o sistemas de domotica que requieran comprension de lenguaje natural en frances.
- Generacion de contenido breve en frances: redaccion de correos, resumenes o respuestas estandarizadas en entornos con recursos computacionales limitados.
- Prototipado rapido de aplicaciones de IA generativa: los archivos GGUF permiten probar el modelo en CPU o GPU de gama baja antes de escalar a soluciones mas grandes.
- Educacion y aprendizaje de idiomas: puede servir como tutor conversacional para practicar frances, aprovechando su enfoque en interacciones naturales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El anuncio en LinkedIn menciona que Luth-2 establece un nuevo estado del arte para modelos pequeños en frances, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.). Se recomienda consultar el repositorio del modelo base (`kurakurai/Luth-2-2B`) para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada: para la cuantizacion Q4_K_M (1,4 GB), se necesitan aproximadamente 2-3 GB de VRAM para inferencia con contexto moderado. La version f16 (3,9 GB) requiere al menos 6 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutar las cuantizaciones Q4 o Q5. Para la version f16 se recomienda una RTX 3060 o superior.
- Compatibilidad con consumer GPU: si, todas las cuantizaciones caben en GPUs de consumo medio-bajo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, TGI (con adaptacion), o mediante transformers con carga de GGUF (a traves de librerias como `ctransformers`).
- Latencia y throughput: no se han publicado mediciones oficiales. En una CPU moderna, una cuantizacion Q4_K_M puede generar entre 10 y 20 tokens por segundo; en GPU, la velocidad es significativamente mayor (dependiendo del hardware).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria (modelos pequeños en frances). El propio equipo menciona una version anterior, Luth-2-0.8B, pero no se proporcionan especificaciones tecnicas ni benchmarks. Modelos como Mistral 7B o Llama 3.2 3B son mas grandes y no estan especializados en frances, por lo que la comparacion no es directa. Se recomienda evaluar el modelo en tareas especificas de conversacion en frances frente a alternativas como `Qwen2.5-1.5B-Instruct` o `Phi-3-mini`, aunque no hay datos publicados.

## Limitaciones y advertencias

- Al ser un modelo de solo 2B parametros, su capacidad de razonamiento complejo, matematicas avanzadas o generacion de codigo extenso es limitada.
- No se ha documentado la longitud de contexto, lo que puede provocar degradacion en dialogos muy largos.
- El entrenamiento esta centrado en frances; el rendimiento en otros idiomas puede ser deficiente o inexistente.
- No se han publicado evaluaciones de sesgos o alucinaciones; como todo modelo de lenguaje, puede generar informacion falsa o sesgada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos de los datasets de entrenamiento si se utiliza en productos finales.
- El componente multimodal (mmproj) no esta documentado; su funcionamiento y compatibilidad con los cuantizados GGUF no esta garantizado.
- Las cuantizaciones de baja precision (Q2_K, Q3) pueden sufrir perdidas notables de calidad; se recomienda usar Q4_K_M o superior para produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Luth-2-2B-GGUF
- Modelo base (kurakurai/Luth-2-2B): https://huggingface.co/kurakurai/Luth-2-2B
- Anuncio en LinkedIn: https://www.linkedin.com/posts/guillaume-pradel_excited-to-share-our-latest-work-luth-2-activity-7492882798538678273-BliY
- Otros modelos relacionados: https://huggingface.co/mradermacher/Luth-LFM2-1.2B-GGUF
