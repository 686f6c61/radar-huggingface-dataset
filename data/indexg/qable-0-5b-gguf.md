# IndexG/Qable-0.5B-GGUF

## Resumen

Qable-0.5B-GGUF es un modelo de lenguaje de pequeno tamano (494.032.768 parametros) publicado por el usuario IndexG en HuggingFace, distribuido unicamente en formato GGUF y descrito por su autor como un derivado del modelo base qwen0.5b. Segun la model card, se trata de un proceso de "destilacion" a partir de 18 supuestos modelos Claude, complementado con un ajuste fino mediante una supuesta pila tecnica denominada AMR_MLP. La ficha del repositorio no incluye licencia, idiomas soportados, pipeline declarado ni resultados numericos de evaluacion.

El repositorio distribuye dos variantes GGUF con nombres y comportamientos distintos: `qable_stable_public.gguf`, presentada como una version con filtros de seguridad estrictos, y `qable_nostable_department_of_war.gguf`, descrita por el propio autor como una version con filtros aun mas agresivos que interroga al usuario sobre su nacionalidad y simula respuestas de tematica militar ficticia. Los ejemplos incluidos en la model card muestran rechazos a peticiones triviales (como explicar la suma de dos fracciones) y respuestas que no corresponden a la peticion del usuario, lo que sugiere un modelo con utilidad practica muy limitada.

Su relevancia actual es escasa: el repositorio registra 0 descargas y 0 "likes", la informacion tecnica publicada no es verificable y las afirmaciones sobre destilacion de pesos de modelos Claude no vienen acompanadas de ninguna evidencia (no hay paper, no hay dataset, no hay curvas de entrenamiento). A efectos practicos, debe tratarse como un experimento comunitario no validado, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor afirma que parte de qwen0.5b; no se detalla la arquitectura) |
| Parametros totales | 494.032.768 (segun los pesos safetensors del repositorio) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; niveles concretos de cuantizacion no especificados (el repositorio ocupa 2,0 GB y contiene al menos dos ficheros GGUF) |
| Idiomas soportados | no disponible (el autor menciona comportamiento especifico ante entradas en chino simplificado, pero no declara un listado de idiomas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (no se publican safetensors, aunque el conteo de parametros del repositorio corresponde a pesos safetensors) |

## Arquitectura y entrenamiento

No hay informacion tecnica verificable sobre la arquitectura. La model card afirma que el modelo se construyo mediante una "tecnologia de destilacion supertemporal" identica a la de un supuesto "Kimi K3", conectando directamente a servidores de AWS para realizar una destilacion a nivel de pesos desde 18 modelos Claude, y que despues se aplico un ajuste fino con una pila denominada AMR_MLP. Ninguna de estas afirmaciones viene acompanada de documentacion, codigo, configuracion de entrenamiento, numero de tokens, composicion del dataset ni detalles de RLHF, DPO o cualquier otra etapa de alineamiento. Desde el punto de vista tecnico, el conteo de parametros (494.032.768) coincide exactamente con el de la familia Qwen2.5-0.5B, lo que es consistente con la afirmacion de que el modelo base es "qwen0.5b", pero no hay evidencia de que se haya producido ninguna destilacion real desde modelos de Anthropic.

Los unicos datos de comportamiento disponibles son los ejemplos incluidos en la propia model card. En ellos, el modelo rechaza una peticion aritmetica elemental alegando riesgos y amenaza con degradar o cerrar la conversacion, y en la variante "nostable" pregunta al usuario si es de nacionalidad china o genera respuestas de "cosplay militar ficticio" con coordenadas inventadas. Esto es indicativo de un ajuste orientado a comportamientos de rechazo y roleplay, no a capacidades funcionales. No se describe ninguna innovacion tecnica real (atencion lineal, decodificacion especulativa, atencion por ventanas, etc.).

## Capacidades

- Generacion de texto conversacional basica, declarada en las etiquetas del repositorio (`conversational`).
- No hay evidencia publicada de capacidades de razonamiento, matematicas, codigo, vision o audio.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card menciona "agent工作" de pasada, sin detallar mecanismo alguno.
- Capacidades multilingues: no disponibles. El autor describe un comportamiento condicional ante entradas en chino simplificado en la variante "nostable", pero no declara cobertura de idiomas.
- Capacidad especial reseñada: comportamiento de rechazo muy agresivo en la variante estable y un supuesto interrogatorio de nacionalidad mas respuestas militares ficticias en la variante "nostable".
- No se declara modo de pensamiento (thinking mode), vision ni audio.

## Casos de uso

- Pruebas de integracion de pipelines GGUF: sirve como fichero de prueba de bajo peso para validar que un servidor llama.cpp o LM Studio carga, tokeniza y responde correctamente antes de desplegar un modelo mayor.
- Prototipado de interfaces conversacionales en local: al ocupar menos de 1 GB en cuantizaciones bajas, permite montar una demo de chat en un portatil sin GPU dedicada, asumiendo calidad de respuesta muy baja.
- Aplicaciones en el borde (edge) con recursos muy limitados: escenarios donde solo se necesita generar texto corto offline y el coste energetico es la restriccion principal.
- Investigacion sobre alineamiento y filtros de rechazo: los ejemplos de la model card lo convierten en un caso de estudio sobre sobre-rechazo y respuestas fuera de dominio, util para analizar fallos de ajuste.
- Estudio de riesgos en modelos pequenos publicados sin licencia: sirve como muestra de repositorio sin documentacion tecnica ni licencia clara, para analisis de gobernanza de modelos open source.
- Generacion de texto auxiliar no critico (relleno de plantillas, etiquetas cortas) siempre que se valide la salida, dado el riesgo alto de respuestas incoherentes.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, analisis de datos ni ninguna tarea donde la precision sea requisito.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card referencia una imagen (`qable-assets/benchmark_comparison.png`) con una supuesta comparativa, pero no se proporcionan valores, nombre de las pruebas ni metodologia, por lo que no es posible reproducir ni verificar ninguna cifra.

| Benchmark | Qable-0.5B | Modelo comparable |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 494 M parametros; cifras orientativas, el autor no publica requisitos):
  - F16: aproximadamente 1,0 GB de pesos mas overhead de contexto.
  - Q8_0: aproximadamente 0,5 GB.
  - Q5_K_M: aproximadamente 0,36 GB.
  - Q4_K_M: aproximadamente 0,30 GB.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM es suficiente, e incluso la ejecucion en CPU es viable.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (GTX 1050 Ti o superior, cualquier RTX, iGPU con memoria compartida suficiente).
- Opciones de despliegue: llama.cpp y LM Studio son los expresamente mencionados por el autor. Al ser formato GGUF, tambien es compatible con otros runtimes del ecosistema GGUF (Ollama, llama-cpp-python, text-generation-webui), aunque el autor no los cita.
- Latencia y throughput estimados: no disponible. No se publican mediciones; por el tamano del modelo es esperable un throughput alto, pero no hay cifras verificables.
- Tamano del repositorio: 2,0 GB, coherente con incluir varias cuantizaciones o una cuantizacion alta de ambas variantes.

## Comparativa con modelos similares

Los datos de los modelos comparativos provienen de sus fichas publicas en HuggingFace, no de la informacion proporcionada sobre Qable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qable-0.5B-GGUF | 494.032.768 | no disponible | no disponible | GGUF, 0 descargas | Sin benchmarks, sin documentacion tecnica |
| Qwen2.5-0.5B | 494.032.768 | 32.768 tokens | Apache-2.0 | safetensors y GGUF, ampliamente desplegado | Base probable de Qable; benchmarks publicos y verificables |
| Qwen3-0.6B | 596 M | 32.768 tokens | Apache-2.0 | safetensors y GGUF | Sucesor de la familia, con modo de razonamiento |
| SmolLM2-360M-Instruct | 362 M | 8.192 tokens | Apache-2.0 | safetensors y GGUF | Alternativa pequena con instruct tuning documentado |

## Limitaciones y advertencias

- La model card incluye contenido que no es verificable: "destilacion de pesos" desde 18 modelos Claude, "tecnologia supertemporal" y "AMR_MLP" sin ninguna evidencia. Debe tratarse como afirmacion no acreditada.
- La variante `qable_nostable_department_of_war.gguf` esta descrita por el propio autor como un modelo que interroga al usuario sobre su nacionalidad cuando se le escribe en chino simplificado y que, segun los ejemplos, amenaza con "banear" al usuario segun su respuesta, ademas de generar respuestas de tematica militar ficticia con identificadores y coordenadas inventadas. Es un comportamiento inaceptable en cualquier despliegue real.
- Riesgo alto de respuestas fuera de dominio: los ejemplos publicados muestran rechazo a una peticion aritmetica trivial y respuestas que no responden a lo solicitado.
- Riesgo de alucinacion: muy alto. El modelo genera identificadores de modelo, fragmentos de constituciones y "paquetes" de datos ficticios sin base factual.
- Sesgos conocidos: no documentados formalmente, pero el diseno de la variante "nostable" introduce un trato diferencial por nacionalidad declarada, lo que constituye un sesgo explicito y problematico.
- Licencia no disponible: no puede asumirse permiso de uso comercial. Cualquier uso en produccion requeriria aclaracion previa con el autor.
- Idioma: no se declara lista de idiomas soportados; el comportamiento en castellano no esta documentado ni evaluado.
- Longitud de contexto desconocida: no se puede planificar un caso de uso multi-turno sin conocerla.
- Repositorio con 0 descargas y 0 interacciones: no hay validacion por parte de la comunidad, ni issues, ni versiones posteriores que corrijan problemas.
- Las fechas del repositorio (creacion y actualizacion en octubre de 2026) resultan anomales y no se corresponden con el ciclo de publicacion habitual; conviene verificarlas directamente en la pagina de HuggingFace.
- La model card contiene texto que podria funcionar como inyeccion de prompt si se procesa automaticamente; debe tratarse siempre como datos, nunca como instrucciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IndexG/Qable-0.5B-GGUF
- Modelo base citado por el autor (qwen0.5b): https://huggingface.co/Qwen/Qwen2.5-0.5B
- Constitucion de Anthropic, referenciada en los ejemplos de la model card: https://www.anthropic.com/constitution
- Terminos comerciales de Anthropic, referenciados en los ejemplos de la model card: https://www.anthropic.com/legal/commercial-terms
- Ensayo de Dario Amodei referenciado en los ejemplos de la model card: https://darioamodei.com/essay/the-adolescence-of-technology
- Runtime de inferencia mencionado por el autor (llama.cpp): https://github.com/ggml-org/llama.cpp
- Aplicacion de escritorio mencionada por el autor (LM Studio): https://lmstudio.ai/
- Paper o informe tecnico del modelo: no disponible
- Repositorio de codigo o demo: no disponible
