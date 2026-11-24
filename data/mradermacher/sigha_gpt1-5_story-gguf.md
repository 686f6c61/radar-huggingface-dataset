# mradermacher/SIGHA_GPT1.5_STORY-GGUF

## Resumen

SIGHA_GPT1.5_STORY es un modelo de lenguaje orientado a escritura creativa y ficcion, desarrollado originalmente por TidasSilva y distribuido en formato GGUF por mradermacher. Se trata de un modelo de aproximadamente 8.030 millones de parametros (8B) construido mediante la fusion de pesos (merged weights) sobre una base de la familia Llama, segun indica la etiqueta de licencia llama3.1. Su proposito principal es la generacion de narrativa, ficcion y textos creativos, con soporte declarado para contexto largo.

La relevancia de esta ficha radica en que el repositorio es una cuantizacion estatica del modelo original, publicada por mradermacher, un autor conocido en el ecosistema por producir versiones GGUF de modelos comunitarios. Esto permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos completos en safetensors. El repositorio incluye un conjunto amplio de cuantizaciones, desde Q2_K hasta f16.

Es importante senalar que el modelo no presenta descargas ni likes en el momento de la consulta y que la model card del repositorio GGUF es fundamentalmente una ficha de cuantizacion, sin detalles sobre datos de entrenamiento, benchmarks o arquitectura interna mas alla de las etiquetas. Por tanto, buena parte de las especificaciones tecnicas deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama, segun etiqueta de licencia llama3.1); detalles internos no disponibles |
| Parametros totales | 8.030.277.696 (aproximadamente 8B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (la etiqueta "long-context" sugiere contexto extendido, pero sin cifra confirmada) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 71,8 GB |
| Modelo base | TidasSilva/SIGHA_GPT1.5_STORY |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio. La etiqueta de licencia llama3.1 y la presencia de la etiqueta "llama" apuntan a que el modelo base pertenece a la familia Llama, probablemente Llama 3.1 de 8B, si bien esto no se confirma explicitamente en la model card. La etiqueta "merged-weights" indica que el modelo original se obtuvo mediante fusion de pesos, una tecnica habitual en la comunidad para combinar capacidades de varios modelos ajustados sin reentrenamiento completo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Las etiquetas "dolphin", "creative-writing", "fiction" y "long-context" sugieren un ajuste orientado a narrativa y conversacion creativa, posiblemente heredado de la linea Dolphin, pero se trata de una inferencia a partir de metadatos y no de documentacion tecnica verificada.

## Capacidades

- Generacion de texto narrativo y ficcion: el modelo esta etiquetado explicitamente para escritura creativa y ficcion.
- Conversacion: la etiqueta "conversational" indica soporte para dialogos multi-turno.
- Contexto largo: la etiqueta "long-context" sugiere manejo de ventanas extendidas, aunque la longitud exacta no esta documentada.
- Capacidad multilingue: limitada al ingles segun el campo de idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de relatos y narrativa: el modelo puede emplearse para producir cuentos, capitulos de novela o tramas de ficcion, dado su ajuste declarado hacia creative-writing y fiction.
- Asistencia a escritores en borradores: util para generar variaciones de escenas, dialogos o descripciones a partir de un prompt, acelerando la fase de ideacion.
- Roleplay y narrativa interactiva: la etiqueta "conversational" y "dolphin" lo hacen adecuado para personajes conversacionales y experiencias de ficcion interactiva.
- Prototipado de videojuegos narrativos: puede integrarse como motor de dialogo para NPCs en juegos con guion ramificado, ejecutandose en local gracias a las cuantizaciones GGUF.
- Generacion de contenido creativo en local: al caber en hardware de consumo con cuantizaciones Q4, permite generar ficcion sin depender de APIs externas ni enviar datos a terceros.
- Experimentacion e investigacion: util como banco de pruebas para estudiar el comportamiento de modelos fusionados orientados a creatividad, comparando cuantizaciones Q4 frente a Q8 en tareas narrativas.
- Educacion y talleres de escritura: puede servir como generador de ejemplos y ejercicios narrativos en entornos donde el ingles es el idioma de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (valores de tamano de fichero del repositorio, que sirven como aproximacion del peso en memoria):
  - Q2_K: aproximadamente 3,3 GB
  - Q3_K_S: aproximadamente 3,8 GB
  - Q3_K_M: aproximadamente 4,1 GB
  - Q3_K_L: aproximadamente 4,4 GB
  - IQ4_XS: aproximadamente 4,6 GB
  - Q4_K_S: aproximadamente 4,8 GB
  - Q4_K_M: aproximadamente 5,0 GB
  - Q5_K_S: aproximadamente 5,7 GB
  - Q5_K_M: aproximadamente 5,8 GB
  - Q6_K: aproximadamente 6,7 GB
  - Q8_0: aproximadamente 8,6 GB
  - f16: aproximadamente 16,2 GB
- GPU recomendadas: para cuantizaciones Q4 y Q5, tarjetas consumer como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB pueden alojar el modelo completo. Para Q8_0 y f16 se recomienda RTX 4090 o GPUs de datacenter como A100 o H100.
- Cabe en GPU de consumo: si, en cuantizaciones Q2 a Q5 con GPUs de 6-8 GB o superiores; Q6 y Q8 requieren 8-12 GB; f16 requiere al menos 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. La etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia, aunque no se detalla.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| SIGHA_GPT1.5_STORY (este) | ~8B | No disponible | Ficcion y escritura creativa | llama3.1 | GGUF, safetensors |
| Modelos base Llama 3.1 8B | ~8B | 128K (segun documentacion publica de Llama 3.1) | Proposito general | llama3.1 | safetensors, GGUF |
| Modelos de la linea Dolphin (8B) | ~8B | Variable segun version | Conversacion e instrucciones | Variable | safetensors, GGUF |

No se dispone de datos de rendimiento comparativos verificados para este modelo concreto, por lo que la comparativa se limita a parametros, licencia y formato. Cualquier afirmacion sobre calidad relativa frente a Llama 3.1 o Dolphin no puede sustentarse con la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo de ficcion en ingles, es probable que herede sesgos de su corpus de entrenamiento, pero no se confirma.
- Riesgo de alucinacion: no cuantificado; en tareas narrativas la alucinacion es esperable y puede ser deseable, pero no se recomienda su uso para tareas factuales sin verificacion.
- Limitaciones de idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Limitaciones de contexto: aunque se etiqueta como "long-context", no se especifica la longitud real de la ventana, lo que impide planificar su uso en produccion con contextos extensos.
- Licencia: llama3.1 impone restricciones de uso; debe revisarse la licencia comunitaria de Llama 3.1 antes de cualquier uso comercial, incluidos requisitos de atribucion y politicas de uso aceptable.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y mayor riesgo de comportamiento no verificado.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M se marcan explicitamente como de menor calidad; para produccion se recomienda Q4_K_M o superior.
- Ausencia de benchmarks: no hay evaluaciones publicadas que permitan estimar su calidad frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SIGHA_GPT1.5_STORY-GGUF
- Modelo base: https://huggingface.co/TidasSilva/SIGHA_GPT1.5_STORY
- Pagina de descargas del autor: https://hf.tst.eu/model#SIGHA_GPT1.5_STORY-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
