# mradermacher/Artemis-31B-v1.1-heretic-v2-i1-GGUF

## Resumen

Artemis-31B-v1.1-heretic-v2-i1-GGUF es un repositorio de cuantizaciones GGUF publicado por mradermacher a partir del modelo coder3101/Artemis-31B-v1.1-heretic. No se trata de un modelo entrenado desde cero, sino de una conversión a formato GGUF (con cuantización de pesos e importancia ponderada mediante imatrix) del modelo base, que arrastra las etiquetas heretic, uncensored, decensored y abliterated, lo que indica que el modelo original ha sido modificado para reducir o eliminar comportamientos de rechazo aprendidos en su alineamiento.

El modelo cuenta con 30.697.345.596 parámetros (aproximadamente 30,7 mil millones), un tamaño de repositorio de 90,2 GB y una ventana de contexto que no se especifica en la información disponible. El repositorio ofrece un abanico amplio de cuantizaciones (desde i1-Q2_K de 12,0 GB hasta tipos Q6_K e IQ4_XS, entre muchos otros), orientadas a ejecución local en llama.cpp y derivados. Está etiquetado únicamente para inglés y su licencia no está declarada.

Su relevancia actual es práctica: permite desplegar un modelo conversacional de ~31B en hardware de consumo mediante cuantizaciones agresivas, algo crítico cuando el modelo original en precisión completa (safetensors) exige mucha más memoria. Al ser una cuantización con imatrix, se busca preservar mejor la perplejidad que en cuantizaciones estáticas equivalentes. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card (compatible con llama.cpp/GGUF, lo que implica un transformer decoder-only; la familia exacta no se indica) |
| Parametros totales | 30.697.345.596 (segun safetensors del modelo base) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (listados en el repositorio i1); el conjunto completo de quants del proyecto incluye Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ4_XS, Q4_0, Q4_1, Q4_K_S, small-IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |
| Tamano del repositorio | 90,2 GB |
| Modelo base | coder3101/Artemis-31B-v1.1-heretic |
| Libreria declarada | transformers |
| Fecha de creacion / actualizacion | 2026-09-20 / 2026-09-20 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base ni su proceso de entrenamiento. El repositorio es una cuantizacion: mradermacher ha convertido los pesos del modelo coder3101/Artemis-31B-v1.1-heretic a GGUF mediante `convert_type: hf` y `quantize_version: 2`, y ha generado un fichero imatrix propio (`Artemis-31B-v1.1-heretic-v2.imatrix.gguf`, 0,1 GB) para producir cuantizaciones ponderadas de tipo i1. No se documentan tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

El rasgo tecnico mas relevante es la naturaleza «heretic/abliterated» heredada del modelo base: se trata de un modelo al que se le han suprimido o atenuado las direcciones de activacion asociadas al rechazo, lo que reduce las negativas del modelo a responder. La model card menciona ademas, de forma generica, que «este es un modelo de vision y los ficheros mmproj (si los hay) estaran en el repositorio estatico», aunque no se confirma que existan tales ficheros ni que el modelo base tenga torre visual; debe tratarse con cautela.

## Capacidades

- Generacion de texto y conversacion multi-turno (el tag `conversational` esta presente).
- Comportamiento «desinhibido»: al proceder de un modelo abliterated/decensored, tiende a no aplicar rechazos ante peticiones que otros modelos alineados bloquearian.
- Compatibilidad con endpoints de HuggingFace (tag `endpoints_compatible`), lo que permite su uso en infraestructuras de inferencia gestionadas.
- Ejecucion local en llama.cpp, Ollama, LM Studio y similares gracias al formato GGUF.
- Capacidades de codigo, matematicas, tool calling o razonamiento multi-paso: no disponibles (no se documentan en la informacion proporcionada).
- Capacidades de vision: inciertas; la model card menciona la posibilidad de ficheros `mmproj` en el repositorio estatico, pero no confirma su existencia.
- Capacidades multilingues: solo ingles declarado; el rendimiento en castellano no esta documentado.

## Casos de uso

- Asistente conversacional local sin conexion: el modelo puede desplegarse en llama.cpp u Ollama con cuantizaciones IQ3/IQ4 y mantener dialogos multi-turno en ingles sin enviar datos a terceros. Es adecuado cuando la privacidad es un requisito y el hardware no permite ejecutar los 30,7B en precision completa.
- Escritura creativa y narrativa sin filtros: al ser un modelo desinhibido, resulta util para generar ficcion con tematicas que otros modelos alineados rechazan. La cuantizacion Q4_K_S (17,9 GB) ofrece un equilibrio razonable entre calidad y VRAM para este tipo de tareas.
- Investigacion sobre alineamiento y rechazo: permite comparar las respuestas del modelo abliterated frente a su contraparte alineada, analizando en que medida la supresion de direcciones de rechazo altera el comportamiento en dominios sensibles.
- Red-teaming y evaluacion de seguridad: util como modelo «atacante» o generador de prompts adversarios en pruebas internas, dado que su tendencia a no rechazar facilita obtener salidas que sirven para probar filtros y clasificadores.
- Generacion de datos sinteticos en ingles: puede emplearse para producir corpus de texto etiquetado en tareas donde se necesita diversidad estilistica y baja tasa de negativas, con la advertencia de que la calidad debe validarse manualmente.
- Despliegue en servidor de inferencia con multiples cuantizaciones: al ofrecer variantes desde 12,0 GB (Q2_K) hasta tamanos mayores, se puede servir una version ligera en GPUs de 16 GB y una version de mayor calidad en GPUs de 24 GB o superiores, escalando segun la carga.
- Prototipado rapido en portatiles con GPU de gama media: con la cuantizacion i1-IQ3_M (14,5 GB) o i1-Q2_K (12,0 GB) un equipo con 16 GB de VRAM puede ejecutar el modelo, aunque con perdida de calidad y velocidad reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: todos los enlaces recuperados corresponden a contenidos no relacionados (preguntas en Zhihu sobre cuentos infantiles, cadenas de restaurantes y una escena de una novela china), por lo que no aportan datos tecnicos. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos, sin contar el coste de la ventana de contexto ni el buffer de KV cache):
  - i1-Q2_K (12,0 GB): ~12-13 GB.
  - i1-IQ3_M (14,5 GB): ~15 GB.
  - i1-Q4_K_S (17,9 GB): ~18 GB (descrita por el autor como «optimal size/speed/quality»).
  - Q5_K_M y similares: en torno a 21-22 GB.
  - Q6_K: en torno a 25-26 GB.
- GPU recomendadas: para las cuantizaciones bajas, RTX 4080/4090 (16-24 GB) y RTX 3090 (24 GB); para Q4_K_S, RTX 4090 o RTX 3090 con holgura; para Q5/Q6 se recomienda A100 40 GB, H100 o reparto en varias GPU.
- Cabe en GPU de consumo: si. La cuantizacion Q4_K_S (17,9 GB) entra en una RTX 4090 o RTX 3090 de 24 GB; las cuantizaciones IQ3/Q2 entran en tarjetas de 16 GB. En GPUs de 12 GB es previsible tener que descargar capas a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp y cualquier runtime compatible con GGUF. Las herramientas habituales de servidor (vLLM, TGI) trabajan con el modelo base en safetensors, no con estos GGUF.
- Latencia y throughput estimados: no disponibles. Dependen fuertemente del hardware, del grado de offload a CPU y del tipo de cuantizacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa. Si puede compararse el propio repositorio con sus variantes:

| Repositorio / variante | Formato | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Artemis-31B-v1.1-heretic-v2-i1-GGUF (este) | GGUF con cuantizacion imatrix (i1) | ~30,7B | No disponible | No disponible | Q2_K 12,0 GB, IQ3_M 14,5 GB, Q4_K_S 17,9 GB; incluye fichero imatrix |
| mradermacher/Artemis-31B-v1.1-heretic-v2-GGUF | GGUF estatico | ~30,7B | No disponible | No disponible | Mismo origen, cuantizacion sin imatrix; aloja los ficheros mmproj si existen |
| coder3101/Artemis-31B-v1.1-heretic | safetensors | 30.697.345.596 | No disponible | No disponible | Modelo base sin cuantizar |

Comparacion con otras alternativas de ~30B o con modelos abliterated de otros autores: no disponible, al no haberse proporcionado datos de ninguno de ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al derivar de un modelo abliterated, es probable que se incremente la generacion de contenido ofensivo, discriminatorio o inseguro que el modelo original rechazaria.
- Riesgo de alucinacion: no cuantificado. Las cuantizaciones agresivas (Q2_K, IQ2, IQ1) degradan de forma notable la calidad y aumentan la incoherencia; el propio autor recomienda IQ3_XXS frente a Q2_K.
- Limitaciones de idioma: solo se declara ingles. El rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Limitaciones de contexto: la longitud de contexto no se especifica; no debe asumirse ninguna ventana concreta sin verificarla en los metadatos del GGUF.
- Restricciones de licencia: la licencia no esta declarada ni en los metadatos de HuggingFace ni en la model card. No puede asumirse que el uso comercial este permitido; es imprescindible consultar la licencia del modelo base (coder3101/Artemis-31B-v1.1-heretic) antes de cualquier uso en produccion.
- Naturaleza del repositorio: es una cuantizacion de terceros, no un modelo oficial. La calidad final depende tanto del modelo base como del proceso de cuantizacion, y no hay evaluaciones publicadas que la respalden.
- Vision: la afirmacion sobre ficheros mmproj es una plantilla generica del autor; no hay confirmacion de que el modelo soporte vision. No debe asumirse esa capacidad.
- Adopcion: 0 descargas y 0 likes. No hay comunidad que haya validado el comportamiento del modelo en produccion.
- Uso responsable: dado su caracter desinhibido, su uso en productos de cara al publico exige capas adicionales de moderacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Artemis-31B-v1.1-heretic-v2-i1-GGUF
- Modelo base: https://huggingface.co/coder3101/Artemis-31B-v1.1-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Artemis-31B-v1.1-heretic-v2-GGUF
- Pagina resumen de mradermacher para este modelo: https://hf.tst.eu/model#Artemis-31B-v1.1-heretic-v2-i1-GGUF
- Preguntas frecuentes y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo, su arquitectura o sus evaluaciones; los resultados obtenidos correspondian a contenidos no relacionados.
