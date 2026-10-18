# ReadyArt/Wicked-Tutu-31B-v0.25-GGUF

## Resumen

Wicked-Tutu-31B-v0.25-GGUF es la distribucion en formato GGUF del modelo de generacion de texto ReadyArt/Wicked-Tutu-31B-v0.25, publicado por el usuario ReadyArt en Hugging Face. Se trata de un ajuste fino orientado a rol conversacional para adultos, con etiquetas explicitas de contenido NSFW, ERP (roleplay erotico), horror y violencia, y marcado por el autor como "unaligned", es decir, sin el condicionamiento de rechazo tipico de los modelos alineados comercialmente. El repositorio contiene unicamente los pesos cuantizados para inferencia local, no el modelo original.

El dato tecnico mas solido disponible es el recuento de parametros del modelo base en safetensors: 30.697.345.596 parametros (~30,7 B), lo que situa al modelo en la clase de 30-32 B. El repositorio GGUF ocupa 87,0 GB, un tamano coherente con un conjunto de cuantizaciones que abarca desde niveles de 2-3 bits hasta 8 bits e, incluso, posibles ficheros en FP16. La licencia declarada es Apache 2.0 y el unico idioma soportado segun metadatos es el ingles.

La relevancia de esta ficha es fundamentalmente critica: la model card publicada no contiene informacion tecnica util. Esta compuesta casi integramente por CSS y HTML de estilizado (paleta rosa, efectos glassmorphism, animaciones), sin especificar arquitectura, datos de entrenamiento, longitud de contexto, proceso de alineamiento ni resultados de evaluacion. Cualquier usuario que quiera evaluar el modelo debe saber de antemano que la documentacion del autor no permite verificar ninguna de esas dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card) |
| Parametros totales | 30.697.345.596 (~30,7 B), dato real de safetensors del modelo base |
| Parametros activos | no aplica / no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; los niveles concretos no se detallan en la informacion disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

No hay informacion publicada. La model card del repositorio no describe la arquitectura del modelo, ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Tampoco se indica sobre que modelo preentrenado se construyo el ajuste fino, mas alla de la referencia al propio modelo base ReadyArt/Wicked-Tutu-31B-v0.25, que es a su vez el origen de esta cuantizacion. El unico indicio estructural es el recuento de parametros (~30,7 B) y la etiqueta de pipeline text-generation, compatibles con un transformer decoder-only de la clase 30-32 B, extremo que el autor no confirma.

La etiqueta "unaligned" sugiere que el ajuste fino se realizo sin las fases habituales de rechazo o moderacion, buscando una respuesta mas directa y sin filtros en contextos de rol adulto. Es una inferencia a partir del tag, no una afirmacion documentada por el autor. Tampoco se documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, modos de razonamiento) ni se publica informacion sobre el proceso de cuantizacion empleado para generar este repositorio.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte declarado para dialogos multi-turno de rol.
- Roleplay y ERP (roleplay erotico) explicito, segun los tags nsfw, explicit y ERP.
- Narrativa de terror y violencia explicita (tags Horror y Violence).
- Modo "unaligned": menor predisposicion a rechazar peticiones o a aplicar moderacion, segun la etiqueta del autor.
- Compatible con endpoints de inferencia (tag endpoints_compatible).
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de vision, audio ni multimodalidad.
- No se documenta modo de razonamiento extendido (thinking mode).
- Cobertura multilingue: no disponible; los metadatos solo declaran ingles.

## Casos de uso

- Roleplay conversacional para adultos en entornos privados y autoalojados: el modelo esta ajustado especificamente para mantener personajes y escenas de forma sostenida, y su despliegue en GGUF permite ejecutarlo en hardware propio sin enviar el historial a terceros.
- Escritura creativa de ficcion explicita: generacion y continuacion de relatos con contenido sexual o violento que los modelos alineados rechazan, util para autores que trabajan en generos como erotica o terror extremo.
- Motores de personajes para juegos de rol de mesa o videojuegos narrativos: integracion via API compatible con OpenAI (tag endpoints_compatible) para generar respuestas de PNJ con personalidad fija y memoria de contexto.
- Simulacion narrativa de escenarios de terror: generacion de descripciones atmosfericas, dialogos de antagonistas y desarrollo de tramas oscuras con violencia explicita.
- Investigacion sobre alineamiento y seguridad: el modelo sirve como sujeto de estudio de un modelo deliberadamente no alineado, para medir tasas de cumplimiento de peticiones nocivas, deriva de personaje o degradacion de coherencia en contextos largos.
- Prototipado de interfaces conversacionales sin restricciones de contenido: util en entornos de prueba cerrados donde se necesita un modelo sin capa de rechazo para evaluar guardarrailes externos, clasificadores de salida o politicas de moderacion propias.
- Base para ajustes finos adicionales (LoRA) en dominios de ficcion adulta: al estar en Apache 2.0 y disponible en GGUF, puede servir de punto de partida o de referencia para comparar tecnicas de cuantizacion en modelos de ~30 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni comparaciones con modelos similares. Tampoco se aportan metricas de perplejidad de las cuantizaciones ni evaluaciones cualitativas del rol.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parametros (~30,7 B); el autor no publica requisitos ni mediciones.

- VRAM estimada para inferencia (solo pesos, sin contar cache KV):

| Cuantizacion orientativa | Bits por peso aprox. | VRAM estimada |
|---|---|---|
| Q2_K | ~3,4 | ~13 GB |
| Q3_K_M | ~3,9 | ~15 GB |
| Q4_K_M | ~4,9 | ~19 GB |
| Q5_K_M | ~5,7 | ~22 GB |
| Q6_K | ~6,6 | ~25 GB |
| Q8_0 | ~8,5 | ~33 GB |
| FP16 | 16 | ~61 GB |

- La cache KV para contextos largos anade varios GB adicionales; el coste exacto depende del numero de capas y cabezas, dato no disponible.
- GPU profesionales recomendadas: A100 80 GB o H100 80 GB para FP16 con contexto amplio; A100 40 GB o L40S 48 GB para Q8_0.
- GPU de consumo: una RTX 4090 (24 GB) puede ejecutar Q4_K_M con contexto moderado; una RTX 3090 (24 GB) queda en el mismo rango. Para Q5_K_M o Q6_K conviene una GPU de 32 GB o repartir capas entre GPU y CPU.
- Configuraciones multi-GPU o CPU+GPU (offload parcial) son viables con llama.cpp si no se dispone de VRAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, y servidores compatibles con GGUF como vLLM (soporte de GGUF limitado) o TGI. El tag endpoints_compatible indica compatibilidad con la API de Hugging Face Inference Endpoints.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna cuantizacion ni GPU.

## Comparativa con modelos similares

No se dispone de benchmarks del modelo, por lo que la comparacion se limita a parametros, contexto y licencia. Ademas, al no haberse documentado el modelo base sobre el que se construyo el ajuste fino, no puede establecerse una correspondencia tecnica con las alternativas.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ReadyArt/Wicked-Tutu-31B-v0.25-GGUF | ~30,7 B | no disponible | Apache 2.0 | Rol adulto, NSFW, sin alinear |
| Qwen2.5-32B-Instruct | ~32,5 B | 131.072 tokens | Apache 2.0 | Proposito general, alineado |
| Mistral Small 24B Instruct | ~24 B | 32.768 tokens | Apache 2.0 | Proposito general, alineado |
| Gemma 2 27B IT | ~27 B | 8.192 tokens | Gemma Terms of Use | Proposito general, alineado |

Diferencias cualitativas: las alternativas son modelos alineados, con model cards detalladas, contexto documentado y evaluaciones publicas; Wicked-Tutu se posiciona en el nicho opuesto (contenido explicito sin moderacion) y carece de cualquiera de esos datos. Rendimiento comparado: no disponible.

## Limitaciones y advertencias

- Contenido explicito y potencialmente perturbador: el modelo esta etiquetado como nsfw, explicit, Horror y Violence, y marcado como not-for-all-audiences. No es apto para menores ni para entornos laborales o de atencion al publico sin controles.
- Ausencia total de documentacion tecnica: la model card consiste en CSS y HTML de estilizado; no hay arquitectura, contexto, dataset, proceso de entrenamiento ni evaluaciones. No es posible verificar ninguna afirmacion sobre el modelo.
- Riesgo elevado de alucinacion: no se ha documentado ningun proceso de alineamiento o evaluacion de fidelidad, y la etiqueta "unaligned" indica ausencia de mecanismos de rechazo. La generacion de hechos sera poco fiable.
- Falta de guardarrailes: un modelo "unaligned" puede producir contenido ilegal, danino o sexualmente violento si se le solicita. Cualquier despliegue publico exige moderacion externa obligatoria.
- Riesgos legales y de cumplimiento: la licencia Apache 2.0 cubre el codigo y los pesos, pero no exime del cumplimiento de normativa aplicable sobre contenido sexual, proteccion de menores (DSA, CSAM), difamacion o violencia. La responsabilidad recae integramente en el desplegador.
- Idioma: solo se declara ingles; el rendimiento en castellano es no disponible y probablemente degradado.
- Contexto desconocido: al no publicarse la longitud de contexto, el diseno de aplicaciones multi-turno requiere prueba empirica previa.
- Senales de escasa validacion de la comunidad: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de verificacion por terceros.
- Fecha de creacion en metadatos (2026-10-18) posterior a la fecha de consulta habitual, lo que sugiere posible inconsistencia en los metadatos del repositorio.
- Sin garantias: no hay informes de errores, issues ni mantenimiento documentado por parte del autor.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/ReadyArt/Wicked-Tutu-31B-v0.25-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Tutu-31B-v0.25
- Paper, blog o repositorio de codigo: no disponible en la informacion proporcionada.
- Demo o space asociado: no disponible en la informacion proporcionada.
