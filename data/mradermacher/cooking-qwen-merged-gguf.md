# mradermacher/Cooking-Qwen-Merged-GGUF

## Resumen

Cooking-Qwen-Merged-GGUF es la distribucion en formato GGUF del modelo burpi/Cooking-Qwen-Merged, un ajuste fino orientado a dominio culinario construido sobre la familia Qwen. El trabajo de cuantizacion lo firma mradermacher, un actor habitual en el ecosistema de publicacion de cuantizaciones estaticas para llama.cpp y derivados. El modelo resuelve el caso de uso de asistentes conversacionales especializados en cocina: generacion de recetas, sustituciones de ingredientes, tecnicas culinarias y respuesta a preguntas sobre preparaciones, apoyandose en tecnicas de ajuste fino con LoRA/PEFT y destilacion de conocimiento sobre datos sinteticos.

La relevancia practica de esta publicacion no esta en el modelo base sino en el empaquetado: ofrece once variantes de cuantizacion que van desde Q2_K (0,4 GB) hasta f16 (1,3 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluido CPU, portatiles sin GPU dedicada o dispositivos de borde. Con cerca de 596 millones de parametros, se trata de un modelo pequeno dentro de la familia Qwen, disenado para inferencia local con latencia baja y huella de memoria minima.

La ficha describe tanto las caracteristicas tecnicas verificables del artefacto publicado como las limitaciones derivadas de la informacion disponible: no se han publicado benchmarks, la licencia no aparece declarada y el unico idioma soportado explicitamente es el ingles. Es, por tanto, una pieza adecuada para prototipado rapido y despliegue local en dominio culinario, no para produccion critica sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, ajuste fino sobre burpi/Cooking-Qwen-Merged) |
| Parametros totales | 596.049.920 (~596 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Tamano del repo | 5,7 GB |
| Pipeline declarado | question-answering |
| Libreria | transformers (modelo base); GGUF para llama.cpp y derivados |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen con aproximadamente 596 millones de parametros, ajustado mediante LoRA/PEFT sobre el corpus culinario que dio lugar a burpi/Cooking-Qwen-Merged. La model card del repositorio de cuantizacion no aporta detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO. Las etiquetas del modelo indican el uso de destilacion de conocimiento y datos sinteticos, lo que sugiere que el ajuste fino se apoyo en generacion de ejemplos por parte de un modelo mayor para cubrir recetas, tecnicas y preguntas frecuentes de cocina, aunque no se especifica la metodologia exacta.

La innovacion tecnica de esta publicacion concreta es el proceso de cuantizacion: mradermacher ha generado cuantizaciones estaticas (no ponderadas por imatrix, segun indica el propio autor) en doce niveles, desde 2 hasta 16 bits por peso. Esto permite elegir el compromiso entre calidad y tamano en funcion del hardware. El autor advierte de que las cuantizaciones ponderadas por imatrix no estan disponibles en el momento de la publicacion y que podrian no planificarse. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a preguntas y respuestas sobre cocina.
- Respuesta a preguntas culinarias: ingredientes, tecnicas, tiempos de coccion, sustituciones y equivalencias.
- Generacion de recetas y planes de comidas a partir de ingredientes o restricciones indicadas por el usuario.
- Conversacion multi-turno dentro del dominio culinario, con el pipeline declarado de question-answering.
- Soporte potencial de recuperacion aumentada (RAG) segun las etiquetas del modelo, aunque no se documenta la integracion concreta.
- Capacidades multilingues limitadas al ingles; no se declara soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente de cocina en local: el modelo puede desplegarse en un portatil o mini-PC sin GPU dedicada usando la cuantizacion Q4_K_M (0,5 GB) y responder preguntas sobre recetas en tiempo real, lo que lo hace adecuado para aplicaciones de escritorio o domoticas con requisitos de privacidad.
- Generacion de recetas personalizadas: dado un conjunto de ingredientes disponibles y restricciones dieteticas, el modelo produce propuestas de platos; su tamano reducido permite ejecutarlo en el dispositivo del usuario sin enviar datos a la nube.
- Base para un sistema RAG culinario: las etiquetas del modelo incluyen rag, de modo que puede combinarse con un indice vectorial de recetas y libros de cocina para responder con contenido verificado y reducir alucinaciones.
- Chatbot de soporte en una web de recetas: con la cuantizacion Q8_0 (0,7 GB) puede servirse desde una CPU con multiples workers para gestionar consultas concurrentes de baja complejidad sobre tecnicas y sustituciones.
- Prototipado rapido de asistentes de dominio: al ser un ajuste fino pequeno, sirve como banco de pruebas para evaluar pipelines de LoRA, destilacion sintetica y cuantizacion antes de escalar a modelos mayores.
- Educacion y formacion culinaria: el modelo puede explicar tecnicas paso a paso y responder dudas de estudiantes en un entorno offline, apropiado para escuelas con conectividad limitada.
- Integracion en aplicaciones moviles o de borde: la variante Q2_K (0,4 GB) permite incluir el modelo en apps con presupuesto de almacenamiento y memoria muy ajustado, a costa de una menor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,4 GB (Q2_K) y 1,3 GB (f16) solo para los pesos; anadir entre 0,2 y 0,5 GB adicionales para el contexto KV segun la longitud de secuencia, aunque esta no se especifica.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen de sobra. Tambien funciona en GPUs de portatil y en iGPUs con memoria unificada.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y tambien en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (el tag endpoints_compatible lo indica). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que no son la via recomendada.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 596 M de parametros, se espera una generacion en tiempo real en CPU moderna y muy fluida en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cooking-Qwen-Merged-GGUF | ~596 M | no disponible | no disponible | GGUF | Ajuste fino culinario, solo ingles |
| Qwen2.5-0.5B-Instruct | ~494 M | 32 768 tokens (segun ficha oficial de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo generalista, no especializado en cocina |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32 768 tokens (segun ficha oficial de Qwen) | Apache 2.0 | safetensors, GGUF | Mayor capacidad general, mas recursos |
| TinyLlama-1.1B-Chat | ~1,1 B | 2048 tokens | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamano similar |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados para el modelo culinario; los datos de contexto y licencia de los modelos Qwen y TinyLlama provienen de sus fichas oficiales y deben verificarse antes de usarse en produccion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre datos sinteticos y un corpus culinario no especificado, puede reproducir sesgos culturales en la seleccion de ingredientes y tecnicas.
- Riesgo de alucinacion: alto en un modelo de 596 M especializado; puede inventar cantidades, tiempos de coccion o sustituciones peligrosas (por ejemplo, en dietas con alergenos), por lo que requiere validacion humana en contextos de seguridad alimentaria.
- Limitaciones de contexto e idioma: solo se declara ingles y no se especifica la longitud de contexto; el uso en castellano no esta soportado oficialmente.
- Restricciones de licencia: la licencia no aparece declarada en la informacion disponible, lo que impide confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor o consultar el repositorio base antes de un despliegue comercial.
- Caveats para produccion: modelo pequeno con pipeline declarado de question-answering, sin benchmarks ni evaluacion de calidad publicada; las cuantizaciones de 2 y 3 bits pueden degradar notablemente la coherencia. El autor indica que las cuantizaciones ponderadas por imatrix no estan disponibles.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Cooking-Qwen-Merged-GGUF
- Modelo base: https://huggingface.co/burpi/Cooking-Qwen-Merged
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#Cooking-Qwen-Merged-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
