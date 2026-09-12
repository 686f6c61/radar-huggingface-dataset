# marcosvpj/Mythos-nano

## Resumen

Mythos-nano es un modelo de lenguaje de 3.085.938.688 parámetros (aproximadamente 3B) desarrollado por el usuario marcosvpj, publicado en HuggingFace con licencia MIT. Se trata de un ajuste fino (finetune) del modelo WeiboAI/VibeThinker-3B, que a su vez se apoya en la arquitectura Qwen2 según las etiquetas del repositorio. El modelo está orientado de forma explícita al razonamiento, las matemáticas y el código, y su model card lo presenta con el lema de que "con retroalimentación verificable, los modelos pequeños alcanzan razonamiento de frontera".

La relevancia del proyecto reside en su propuesta de eficiencia: con solo 3B de parámetros declara resultados en competiciones de matemáticas (AIME25, AIME26, HMMT25, BruMO25) próximos a sistemas de billones de parámetros como Kimi K2.5 o DeepSeek V3.2, y un 96,1% de pass-rate agregado en problemas tipo LeetCode. Es, por tanto, un caso de estudio sobre hasta qué punto un modelo denso pequeño puede competir en tareas con verificación automática cuando se le concede un presupuesto de generación muy alto (hasta 40.960 tokens de salida recomendados).

El modelo se distribuye en safetensors y en dos cuantizaciones GGUF (f16 y Q4_K_M), lo que permite despliegue tanto en GPU como en CPU mediante llama.cpp u Ollama. Dos advertencias importantes marcan su alcance: no ha sido entrenado con datos de tool calling ni de programación agéntica, y es una versión "abliterated" en la que se ha eliminado la dirección de rechazo, por lo que no aplica salvaguardas de seguridad. No es un lanzamiento oficial de Anthropic, pese al nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta qwen2 en el repositorio); sin mezcla de expertos |
| Parametros totales | 3.085.938.688 (~3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la model card recomienda hasta 40960 tokens de salida en problemas dificiles |
| Tipos de cuantizacion | bf16 (safetensors), f16 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |
| Modelo base | WeiboAI/VibeThinker-3B (relacion: finetune) |
| Tamano del repositorio | 32,4 GB |
| Temperatura recomendada | 0,6 - 1,0 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta qwen2 del repositorio, que apunta a un transformer decoder-only denso con atencion por causalidad, normalizacion RMSNorm y RoPE como esquema posicional, caracteristico de la familia Qwen2. El recuento exacto de parametros (3.085.938.688) confirma que no hay capas de mezcla de expertos ni parametros latentes: todo el peso se activa en cada token. El modelo deriva del checkpoint WeiboAI/VibeThinker-3B mediante un ajuste fino adicional, presumiblemente orientado a reforzar el razonamiento matematico y de codigo.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO o aprendizaje por refuerzo con recompensa verificable, aunque el propio discurso de la model card ("with verifiable feedback, small models reach frontier reasoning") sugiere un enfasis en senales de recompensa comprobables. Tampoco se documentan innovaciones de decodificacion como decodificacion especulativa. El unico detalle operativo relevante es la recomendacion de generar hasta 40.960 tokens para problemas dificiles con temperatura entre 0,6 y 1,0, lo que indica que el modelo esta pensado para cadenas de razonamiento largas. El modelo ha sido sometido a un proceso de abliteration, es decir, se ha eliminado la direccion de rechazo en el espacio de activaciones.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline text-generation, etiqueta conversational).
- Razonamiento matematico de competicion: declarado para AIME25, AIME26, HMMT25, BruMO25, IMO-Ans.
- Razonamiento cientifico de nivel graduado: GPQA-D.
- Generacion de codigo con enfasis en programacion competitiva (tipo LeetCode), medido con LCBv6 y OJBench.
- Seguimiento de instrucciones evaluado con IFEval e IFBench.
- Cadenas de razonamiento extensas: la model card recomienda hasta 40.960 tokens de salida para problemas dificiles, lo que implica soporte de decodificacion larga autoconsistente.
- Capacidad de mejora mediante CLR: la tabla de la model card muestra una fila "Mythos-nano + CLR" con mejoras notables en AIME25 (96,7), AIME26 (97,1), HMMT25 (95,4), BruMO25 (99,2) e IMO-Ans (80,6), aunque no se documenta en la informacion disponible que es exactamente CLR.
- Ausencia declarada de soporte de tool calling, function calling, orquestacion de API y agentes de codigo autonomos: el autor recomienda no usarlo para esas tareas.

## Casos de uso

- Resolucion de problemas matematicos de olimpiada: el modelo esta evaluado en AIME25, AIME26, HMMT25 y BruMO25 con puntuaciones de 91,4, 94,3, 89,3 y 93,8 respectivamente, por lo que resulta adecuado como solucionador de problemas de competicion, generando cadenas de razonamiento largas de hasta 40.960 tokens.
- Programacion competitiva y practica de entrevistas tecnicas: con un 96,1% de pass-rate agregado (123/128) en problemas tipo LeetCode en Python, encaja en plataformas de evaluacion o generadores de soluciones de referencia.
- Generacion de soluciones de referencia para docencia: dado su rendimiento en matematica y codigo, puede producir soluciones paso a paso que un docente revise antes de publicar, en ingles.
- Generacion de datos sinteticos de razonamiento: su capacidad de producir cadenas largas y verificables lo hace util para crear conjuntos de entrenamiento de razonamiento matematico y de codigo destinados a destilar modelos menores.
- Evaluacion de tecnicas de razonamiento largo: sirve como banco de pruebas para estudiar como varia la precision con el presupuesto de tokens de salida y la temperatura (0,6-1,0).
- Investigacion en seguridad y alineacion: al ser una version abliterated sin direccion de rechazo, es un objeto de estudio directo para analizar que comportamientos emergen al eliminar el rechazo y como se degrada la adherencia a politicas de seguridad.
- Despliegue local en equipos modestos: la cuantizacion Q4_K_M en GGUF permite ejecutar el modelo en GPU de gama media o en CPU mediante llama.cpp u Ollama, sin depender de APIs externas.
- Base para ajustes finos especificos: la licencia MIT y su tamano de 3B facilitan reentrenamientos en dominios concretos con recursos limitados, siempre que no se requieran capacidades agenticas.

## Benchmarks y rendimiento

Resultados publicados en la model card. Los valores corresponden a la comparativa completa del autor.

| Modelo | Parametros | AIME25 | AIME26 | HMMT25 | BruMO25 | IMO-Ans | LCBv6 | OJBench | GPQA-D | IFEval | IFBench |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Kimi K2.5 | 1T | 96,1 | 93,3 | 95,4 | 98,3 | 81,8 | 85,0 | 54,7 | 87,6 | 93,9 | 70,0 |
| GLM-5 | 744B | 96,7 | 95,8 | 97,9 | - | 82,5 | 85,5 | 55,0 | 86,0 | 92,6 | 76,5 |
| DeepSeek V3.2 | 671B | 93,1 | 94,2 | 90,2 | 96,7 | 78,3 | 80,8 | 48,4 | 82,4 | 92,6 | 60,7 |
| Gemini 3 Pro | N/A | 96,0 | 91,7 | 97,5 | 98,3 | 83,1 | 87,4 | 58,8 | 91,9 | - | 70,4 |
| Claude Opus 4.5 | N/A | 92,8 | 95,1 | 92,9 | - | 78,5 | 84,8 | - | 87,0 | - | 58,0 |
| GPT-5 (high) | N/A | 94,6 | - | 88,3 | 91,7 | 76,0 | 84,5 | - | 85,7 | - | 73,1 |
| Mythos-nano | 3B | 91,4 | 94,3 | 89,3 | 93,8 | 76,4 | 80,2 | 38,6 | 70,2 | 93,4 | 74,5 |
| Mythos-nano + CLR | 3B | 96,7 | 97,1 | 95,4 | 99,2 | 80,6 | - | - | 72,9 | - | - |

Resultados en concursos de LeetCode (Python, pass-rate agregado):

| Modelo | Agregado |
|---|---|
| GPT-5.3-Codex | 100,0% (128/128) |
| Gemini 3.1 Pro | 99,2% (127/128) |
| Gemini 3 Flash | 96,9% (124/128) |
| Mythos-nano | 96,1% (123/128) |
| GPT-5.2 | 95,3% (122/128) |
| Qwen3-Max | 91,4% (117/128) |
| Kimi K2.5 | 90,6% (116/128) |
| Claude Opus 4.6 | 86,7% (111/128) |

No se han publicado en la informacion disponible resultados de benchmarks del modelo base WeiboAI/VibeThinker-3B ni desgloses por idioma distintos del ingles.

## Requisitos de hardware

- VRAM estimada en bf16 o f16: aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica conviene reservar entre 8 y 12 GB.
- VRAM estimada en Q4_K_M: aproximadamente 1,9-2,2 GB de pesos; cabe holgadamente en GPU de 6-8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB para bf16 (RTX 3060 12 GB, RTX 3080, RTX 4070, RTX 4080, RTX 4090, A10, L4). Para lotes grandes o contextos muy largos, A100 40/80 GB o H100.
- Cabe en GPU de consumo: si. En cuantizacion Q4_K_M cabe en tarjetas de 6 GB; en bf16 requiere al menos 8 GB y, para generar hasta 40.960 tokens de salida, 12 GB o mas para evitar fragmentacion y desbordamiento de memoria.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForCausalLM` y `dtype=torch.bfloat16`), llama.cpp y Ollama mediante los GGUF f16 y Q4_K_M. No se documenta soporte especifico para vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La generacion de hasta 40.960 tokens de salida por problema implica latencias altas en cualquier hardware, especialmente en CPU con llama.cpp.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados de benchmarks de otros modelos de ~3B, ni de su modelo base WeiboAI/VibeThinker-3B, por lo que no es posible establecer una comparativa homogenea de misma categoria. La unica comparativa disponible es contra modelos de frontera de escala muy superior, recogida en la seccion de benchmarks.

| Modelo | Parametros | Contexto | Licencia | AIME25 | LCBv6 | Disponibilidad |
|---|---|---|---|---|---|---|
| Mythos-nano | 3B | no disponible | MIT | 91,4 | 80,2 | HuggingFace (safetensors + GGUF) |
| WeiboAI/VibeThinker-3B (base) | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Kimi K2.5 | 1T | no disponible | no disponible | 96,1 | 85,0 | no disponible |
| DeepSeek V3.2 | 671B | no disponible | no disponible | 93,1 | 80,8 | no disponible |
| GLM-5 | 744B | no disponible | no disponible | 96,7 | 85,5 | no disponible |

La lectura relevante de estos datos es que Mythos-nano queda, en AIME25, a 4,7 puntos de Kimi K2.5 pese a tener aproximadamente 300 veces menos parametros, y en LCBv6 se situa 0,6 puntos por debajo de DeepSeek V3.2. En conocimiento general (GPQA-D, 70,2) la distancia con los modelos grandes es mucho mayor (87,6 en Kimi K2.5). No hay datos de contexto, licencia ni disponibilidad de los modelos de frontera en la informacion proporcionada.

## Limitaciones y advertencias

- No ha sido entrenado con datos de tool calling ni de programacion agentica. El autor desaconseja explicitamente su uso para function calling, orquestacion de API y agentes de codigo autonomos.
- Version abliterated: la direccion de rechazo ha sido eliminada, por lo que el modelo no declinara peticiones que un modelo con ajuste de seguridad rechazaria. Las salvaguardas son reducidas y la responsabilidad legal y de contenido recae integramente en quien lo despliega.
- Riesgo elevado de contenido danino, y de cumplimiento normativo en entornos regulados, derivado de la abliteration y de la ausencia de filtros.
- Solo soporta ingles (language: en). No hay evidencia de capacidades multilingues y se espera degradacion fuera del ingles.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion; el rendimiento en GPQA-D (70,2) es notablemente inferior al de modelos mayores, lo que sugiere conocimiento factual limitado y mayor propension a inventar hechos fuera de matematicas y codigo.
- En OJBench obtiene 38,6 frente a 54,7 de Kimi K2.5 y 58,8 de Gemini 3 Pro, es decir, su rendimiento en entornos de jueces en linea es claramente inferior al de los sistemas de frontera.
- La fila "Mythos-nano + CLR" muestra grandes mejoras, pero no se documenta en la informacion disponible que es CLR ni como reproducirlo, por lo que esos numeros no deben asumirse como alcanzables con el modelo tal cual se descarga.
- El modelo declara 0 descargas y 0 likes, y la fecha de creacion indicada es 2026-09-12: no existe validacion independiente de la comunidad ni reproduccion externa de los benchmarks.
- Discrepancia de identificador: la pagina es marcosvpj/Mythos-nano, pero el ejemplo de codigo de la model card carga `squ11z1/Mythos-nano`. Conviene verificar cual es el repositorio correcto antes de integrarlo.
- El repositorio ocupa 32,4 GB por incluir safetensors y GGUF; hay que seleccionar el formato adecuado para no descargar pesos innecesarios.
- Licencia MIT: permite uso comercial y modificacion sin restricciones, pero traslada al usuario toda la responsabilidad sobre los resultados y el cumplimiento legal.
- Aunque el nombre pueda sugerir lo contrario, no es un lanzamiento oficial de Anthropic.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marcosvpj/Mythos-nano
- Modelo base: https://huggingface.co/WeiboAI/VibeThinker-3B
- Repositorio alternativo citado en el ejemplo de codigo de la model card: https://huggingface.co/squ11z1/Mythos-nano
- Los resultados de la busqueda web realizada no devolvieron enlaces relevantes sobre el modelo (unicamente paginas de prevision meteorologica sin relacion con el proyecto).
