# mradermacher/Nano.Imp-Creative.Writing-Heretic-3.2-1B-GGUF

## Resumen

Nano.Imp-Creative.Writing-Heretic-3.2-1B-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por el usuario mradermacher a partir del modelo NovaCorp/Nano.Imp-Creative.Writing-Heretic-3.2-1B. Se trata, por tanto, de una conversión de pesos y no de un modelo entrenado desde cero: el autor original es NovaCorp y mradermacher actúa como cuantizador. El modelo base es un merge de aproximadamente 1.498 millones de parámetros (unos 1,5B), etiquetado como "1b" en los tags y orientado explícitamente a escritura creativa, rol (RPG/roleplay) y conversación sin filtros.

El interés de esta ficha está en su naturaleza de modelo pequeño, "abliterated" (es decir, con la dirección de rechazo eliminada del espacio de activaciones) y sin censura, pensado para su uso en frontends de rol como SillyTavern o KoboldAI. La licencia declarada es llama3.2, lo que junto a la denominación "3.2-1B" apunta a una familia derivada de Llama 3.2 de 1B, aunque la documentación proporcionada no confirma explícitamente la arquitectura subyacente.

Se distribuyen doce cuantizaciones estáticas que van desde Q2_K (0,8 GB) hasta f16 (3,1 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidos equipos sin GPU dedicada. Existe además un repositorio paralelo con cuantizaciones ponderadas/imatrix (sufijo i1). El modelo declara soporte para inglés y español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la denominacion y la licencia llama3.2 sugieren una base derivada de Llama 3.2, sin confirmar en la documentacion) |
| Parametros totales | 1.498.482.720 (aproximadamente 1,5B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); existe un repositorio aparte con cuantizaciones ponderadas/imatrix |
| Idiomas soportados | en, es |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 13,8 GB (incluye todas las cuantizaciones) |
| Libreria declarada | transformers |
| Fecha de creacion (metadatos) | 2026-10-03 |
| Ultima actualizacion (metadatos) | 2026-10-03 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Los tags incluyen mergekit y merge, lo que indica que el modelo base NovaCorp/Nano.Imp-Creative.Writing-Heretic-3.2-1B se obtuvo combinando los pesos de dos o mas modelos mediante mergekit, una tecnica habitual para fusionar habilidades sin reentrenar. La etiqueta heretic y abliterated hace referencia a la eliminacion de la direccion de rechazo en el espacio de activaciones, un procedimiento de edicion de pesos que reduce la tendencia del modelo a negarse a responder determinados tipos de peticiones.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste con instrucciones. Tampoco se detalla si se aplicaron tecnicas como atencion lineal, decodificacion especulativa o variantes de atencion eficiente. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto creativo en ingles y espanol, con enfasis declarado en narrativa, ficcion y escritura de estilo libre.
- Roleplay y conversaciones de personaje multi-turno, con soporte explicito para SillyTavern y KoboldAI segun los tags del repositorio.
- Escenarios de RPG de mesa y juegos de texto, donde el modelo actua como master o como personaje no jugador.
- Contenido sin censura y material NSFW: el ajuste abliterated y la etiqueta uncensored implican una reduccion deliberada de los rechazos.
- Generacion de texto general, heredada del modelo base, con calidad limitada por el tamano de 1,5B.
- Soporte de tool calling / function calling: no disponible, no se menciona en la documentacion.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas.
- Vision, audio o modalidades adicionales: no disponibles.
- Modo "thinking" explicito: no disponible.
- Capacidades multilingues: limitadas a ingles y espanol segun la model card.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener dialogos de personaje en SillyTavern o KoboldAI con un coste de VRAM minimo (entre 0,8 y 1,2 GB en cuantizaciones Q2 a Q5), lo que permite ejecutarlo en portatiles sin GPU dedicada.
- Escritura creativa asistida: generacion de relatos, dialogos y descripciones en ingles o espanol con un modelo que no aplica filtros de contenido, adecuado para ficcion adulta o generos que otros modelos rechazan.
- Motores de juego de texto y aventuras conversacionales: al ser un modelo pequeno y rapido, encaja en bucles de generacion por turnos donde la latencia importa mas que la profundidad de razonamiento.
- Prototipado de personajes y dialogos para videojuegos: permite iterar rapidamente sobre arboles de dialogo y voces de personaje antes de pasar a un modelo mayor.
- Experimentacion en investigacion sobre alineacion y abliteration: resulta util como caso de estudio de como la eliminacion de la direccion de rechazo afecta al comportamiento y a la coherencia del modelo.
- Despliegue en entornos con recursos muy limitados: con la cuantizacion Q4_K_S (1,0 GB) puede ejecutarse en CPU mediante llama.cpp, en una Raspberry Pi de gama alta o en moviles con suficiente memoria.
- Generacion de contenido por lotes sin conexion: al no requerir API externa, sirve para producir grandes volumenes de texto sintetico sin coste por token ni envio de datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplexity especificas para este modelo. El unico material de referencia son graficas genericas de comparacion entre tipos de cuantizacion enlazadas por el autor, que no aportan cifras de rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos; hay que sumar el coste del contexto y del runtime):
  - Q2_K: 0,8 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: 0,9 GB
  - IQ4_XS: 1,0 GB
  - Q4_K_S: 1,0 GB
  - Q4_K_M: 1,1 GB
  - Q5_K_S / Q5_K_M: 1,2 GB
  - Q6_K: 1,3 GB
  - Q8_0: 1,7 GB
  - f16: 3,1 GB
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, e incluso iGPU con memoria compartida). No se necesita A100, H100 ni RTX 4090; usarlas estaria completamente sobredimensionado.
- Compatibilidad con GPU de consumo: si, en todas las cuantizaciones. Q4_K_S y Q4_K_M estan marcadas por el autor como "fast, recommended".
- Despliegue: llama.cpp, Ollama, KoboldCpp, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Los tags indican compatibilidad con endpoints. vLLM y TGI no estan mencionados y su soporte para GGUF es limitado.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de conocimiento general y no estan verificados en la informacion proporcionada; se incluyen solo como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Nano.Imp-Creative.Writing-Heretic-3.2-1B-GGUF | 1,5B | no disponible | llama3.2 | GGUF | Rol, escritura creativa, sin censura |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens (no confirmado aqui) | Llama 3.2 (comunidad) | safetensors, GGUF | Asistente general con filtros |
| Qwen2.5 1.5B Instruct | 1,54B | 32.768 tokens (no confirmado aqui) | Apache 2.0 | safetensors, GGUF | Asistente general, multilingue |
| Gemma 2 2B Instruct | 2,6B | 8.192 tokens (no confirmado aqui) | Gemma (uso condicionado) | safetensors, GGUF | Asistente general, multilingue |

La diferencia principal de este modelo frente a las alternativas no es el rendimiento bruto, sino la ausencia de filtros de rechazo y su especializacion en roleplay, junto con una licencia llama3.2 que impone condiciones de uso derivadas de la de Meta.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la documentacion. Al derivar de un modelo de 1,5B y de un merge no auditado, es esperable que reproduzca sesgos de genero, raza y estereotipos presentes en los datos de origen.
- Riesgo de alucinacion: elevado. Con 1,5B de parametros, la capacidad de mantener coherencia factual en textos largos es limitada, y el ajuste orientado a ficcion no prioriza la veracidad.
- La eliminacion de la direccion de rechazo (abliteration) puede degradar la coherencia general y aumentar la produccion de contenido ofensivo, ilegal o danino sin advertencia. No es apto para aplicaciones orientadas a menores ni para entornos sin moderacion externa.
- Limitaciones de contexto: la longitud de contexto no esta documentada; el autor no garantiza ninguna cifra.
- Limitaciones de idioma: solo se declaran ingles y espanol. El rendimiento en espanol de un modelo de este tamano y con preponderancia de datos en ingles suele ser notablemente inferior.
- Restricciones de licencia: la licencia llama3.2 impone condiciones de uso derivadas de la licencia de Llama 3.2 de Meta, incluida la obligacion de incluir el aviso "Built with Llama" y restricciones de uso aceptable. Debe revisarse antes de cualquier uso comercial.
- El repositorio esta marcado como not-for-all-audiences y contiene contenido NSFW; no debe indexarse sin control ni exponerse en servicios publicos sin filtrado.
- Las fechas de creacion y actualizacion de los metadatos (2026) son anomalas y conviene verificarlas antes de citarlas.
- El modelo registra 0 descargas y 0 likes, por lo que no existe validacion comunitaria de su calidad ni de su comportamiento real.
- No hay informacion sobre tool calling, agentes o estructura de plantilla de chat; usarlo en pipelines automatizados requeriria probar el prompt template manualmente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Nano.Imp-Creative.Writing-Heretic-3.2-1B-GGUF
- Modelo base: https://huggingface.co/NovaCorp/Nano.Imp-Creative.Writing-Heretic-3.2-1B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Nano.Imp-Creative.Writing-Heretic-3.2-1B-i1-GGUF
- Pagina de resumen de descargas del cuantizador: https://hf.tst.eu/model#Nano.Imp-Creative.Writing-Heretic-3.2-1B-GGUF
- Guia de uso de GGUF de TheBloke (referenciada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
