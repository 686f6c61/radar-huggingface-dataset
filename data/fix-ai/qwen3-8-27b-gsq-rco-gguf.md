# Fix-AI/Qwen3.8-27B-GSQ-RCO-GGUF

## Resumen

Fix-AI/Qwen3.8-27B-GSQ-RCO-GGUF es un repositorio de cuantizaciones GGUF no uniformes del modelo multimodal Qwen/Qwen3.8-27B, generadas con los métodos GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization) desarrollados en el Deep Algorithms and Systems Lab (DASLab) del Institute of Science and Technology Austria. El repositorio es un duplicado explícito del original ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF; todo el crédito de arquitectura, entrenamiento y pesos originales corresponde a los creadores de Qwen.

El problema que resuelve es el de la cuantizacion post-entrenamiento a bajos bits: en lugar de aplicar un unico tipo de cuantizacion a todos los tensores, RCO asigna un tipo distinto a cada uno de los N tensores bajo una restriccion estricta de tamano total, y GSQ aprende por tensor las asignaciones de rejilla y las escalas de grupo mediante una relajacion de Gumbel-Softmax. El resultado son ficheros GGUF estandar que se ejecutan sin modificaciones en llama.cpp, Ollama y LM Studio.

La relevancia practica esta en el punto de operacion IQ3_S (3,50 bpw, 11,8 GB): segun la model card, iguala exactamente al modelo base BF16 en AIME25 (100,00) y LiveCodeBench v6 (85,71) y queda a menos de 0,51 puntos en GPQA-Diamond, con poco mas de un quinto del tamano del BF16. El repositorio incluye ademas el proyector de vision en BF16 y variantes opcionales con la cabeza de Multi-Token Prediction para decodificacion especulativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con codificador de vision y proyector; detalles internos del modelo base no disponibles |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 mil millones, dato de safetensors del modelo base) |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ2_XS (2,50 bpw, 8,4 GB), IQ2_S (2,75 bpw, 9,3 GB), IQ3_XXS (3,00 bpw, 10,1 GB), IQ3_S (3,50 bpw, 11,8 GB); proyector de vision mmproj en BF16 (16 bpw, 0,9 GB); variantes `-mtp` opcionales de cada cuantizacion (aproximadamente 0,35 GB adicionales) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con fichero mmproj separado para vision) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal de unos 26,9 mil millones de parametros que procesa imagenes y texto (pipeline `image-text-to-text`). La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO, por lo que esos datos deben considerarse no disponibles en esta ficha. Lo que si se documenta es que el modelo incorpora una cabeza de Multi-Token Prediction (MTP) utilizable para decodificacion especulativa en llama.cpp.

La innovacion tecnica de esta publicacion no esta en el modelo base sino en el pipeline de cuantizacion. GSQ realiza cuantizacion escalar post-entrenamiento que aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajacion de Gumbel-Softmax, cerrando buena parte de la brecha entre cuantizacion escalar y vectorial a 2-3 bits manteniendo compatibilidad con formatos escalares como GGUF. RCO formula la asignacion de un tipo de cuantizacion entre K posibles a cada uno de los N tensores como un problema con restriccion de presupuesto total de tamano, reformulandola como una variedad riemanniana suave en espacio logit; esto permite optimizar directamente sobre la perdida de tarea con la restriccion de tamano satisfecha exactamente y sin hiperparametros especificos de la restriccion.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational` en el repo).
- Procesamiento de imagen y texto combinados mediante el fichero `mmproj` en BF16 (vision encoder + projector).
- Razonamiento matematico de competicion: AIME25 como referencia de evaluacion del punto IQ3_S.
- Generacion de codigo: evaluado en LiveCodeBench v6.
- Razonamiento cientifico de nivel avanzado: evaluado en GPQA-Diamond.
- Decodificacion especulativa mediante la cabeza MTP en las builds `-mtp` (aceleracion de inferencia en llama.cpp).
- Compatibilidad con endpoints (`endpoints_compatible`): los GGUF pueden servirse con API compatible con OpenAI a traves del servidor de llama.cpp.
- Capacidades de tool calling / function calling y de agentes: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Despliegue en estaciones de trabajo con una sola GPU consumer: el fichero IQ3_S (11,8 GB) mas el proyector de vision (0,9 GB) permite servir el modelo completo en tarjetas de 16-24 GB, algo inviable con el BF16 de referencia; adecuado para prototipos y demos locales sin coste de API.
- Asistente multimodal sobre documentos escaneados: combinando el GGUF con `mmproj-Qwen3.8-27B-BF16.gguf`, el modelo recibe imagen y texto en el mismo prompt, lo que sirve para extraer datos de facturas, albaranes o capturas y resumirlos en local.
- Generacion de codigo en pipelines internos: con IQ3_S como punto de partida sin perdida declarada en LiveCodeBench v6 (85,71), puede integrarse en herramientas de autocompletado o revision de parches que requieran cumplimiento estricto de privacidad (todo el procesamiento ocurre en la maquina).
- Razonamiento matematico y verificacion de calculos: el punto IQ3_S mantiene el 100,00 en AIME25 del modelo base, por lo que es utilizable en entornos educativos o de validacion de formulas donde no se quiere enviar el enunciado a un servicio externo.
- Servicio de inferencia con throughput mejorado: las builds `-mtp` habilitan decodificacion especulativa en llama.cpp, lo que resulta adecuado para servidores de chat con muchos usuarios concurrentes y presupuesto de VRAM limitado.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye cuatro niveles de bpw del mismo modelo, lo que permite medir en un banco propio la degradacion por tarea (perplejidad, codigo, matematicas) antes de fijar un punto de operacion en produccion.
- Distribucion de un modelo de 27B por canales con ancho de banda limitado: el fichero IQ2_XS de 8,4 GB es descargable en conexiones modestas y, segun la model card, mantiene resultados por encima del baseline BF16 en el agregado zero-shot reportado.

## Benchmarks y rendimiento

Datos publicados en la model card para el punto de operacion IQ3_S frente al modelo base BF16:

| Benchmark | Qwen3.8-27B BF16 | GSQ-RCO IQ3_S (3,50 bpw) | Diferencia |
|---|---|---|---|
| AIME25 | 100,00 | 100,00 | 0,00 |
| LiveCodeBench v6 | 85,71 | 85,71 | 0,00 |
| GPQA-Diamond | No disponible (valor de referencia) | Dentro de 0,51 puntos del BF16 | ≤ 0,51 |
| Perplejidad en wikitext2, C4 y FineWeb | No disponible | No disponible | No disponible |

La model card afirma ademas que IQ2_S (2,75 bpw) iguala al modelo base en AIME25 y que IQ2_XS (2,50 bpw) queda por encima del baseline BF16 en el agregado zero-shot, aunque el texto disponible se interrumpe antes de mostrar la tabla completa de resultados. No se han publicado en la informacion disponible cifras de MMLU, HumanEval, GSM8K ni comparaciones numericas frente a las cuantizaciones Unsloth Dynamic (UD) del mismo modelo base, que la model card cita como referencia de comparacion.

## Requisitos de hardware

- VRAM estimada para los pesos: 8,4 GB (IQ2_XS), 9,3 GB (IQ2_S), 10,1 GB (IQ3_XXS), 11,8 GB (IQ3_S), mas 0,9 GB del `mmproj` si se usa vision y aproximadamente 0,35 GB adicionales si se usa la build `-mtp`.
- A esa cifra hay que sumar la cache KV, cuyo tamano depende del contexto configurado y de la cuantizacion de la cache; no se dispone de valores medidos en la informacion proporcionada.
- GPU consumer: IQ2_XS e IQ2_S caben en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) con contexto moderado; IQ3_XXS e IQ3_S son mas comodas en 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080) y holgadas en 24 GB (RTX 3090, RTX 4090).
- GPU de datacenter: A100 (40/80 GB), H100 (80 GB) y L40S permiten servir IQ3_S con contexto amplio y varios usuarios concurrentes, o mantener el BF16 completo si se necesita la referencia sin cuantizar.
- Opciones de despliegue: llama.cpp (incluido el servidor con API compatible con OpenAI y soporte de `mmproj`), Ollama y LM Studio, mencionados explicitamente en la model card como entornos donde los ficheros corren sin modificaciones. Para vision conviene verificar la version de llama.cpp, ya que el soporte multimodal evoluciona con rapidez.
- Latencia y throughput: no disponibles. La unica indicacion cualitativa es que las builds `-mtp` habilitan decodificacion especulativa y, por tanto, reducen el coste por token generado sin cambiar los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | bpw / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base, BF16) | 26,9 B | safetensors | 16 / no disponible | No disponible | Apache-2.0 | HuggingFace (Qwen) |
| Este repo, IQ3_S | 26,9 B | GGUF | 3,50 / 11,8 GB | No disponible | Apache-2.0 | HuggingFace |
| Este repo, IQ2_XS | 26,9 B | GGUF | 2,50 / 8,4 GB | No disponible | Apache-2.0 | HuggingFace |
| Unsloth Dynamic (UD) del mismo base | 26,9 B | GGUF | No disponible | No disponible | Apache-2.0 | HuggingFace (citado como baseline en la model card) |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF (original) | 26,9 B | GGUF | Misma familia de ficheros | No disponible | Apache-2.0 | HuggingFace |

No se dispone en la informacion proporcionada de otros modelos de tamano y categoria comparables con datos verificables, ni de cifras de rendimiento de las cuantizaciones UD que permitan una comparacion numerica.

## Limitaciones y advertencias

- Este repositorio es un duplicado no oficial del publicado por ISTA-DASLab; conviene descargar el original para asegurar actualizaciones, integridad de ficheros y trazabilidad de la publicacion.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que no existe validacion independiente de los ficheros de esta copia concreta.
- Las cuantizaciones de 2,50 y 2,75 bpw son agresivas: aunque la model card reporta resultados favorables en los benchmarks citados, es esperable degradacion en tareas fuera de esa distribucion (por ejemplo, contextos muy largos, idiomas distintos del ingles o generacion creativa). Verificar con un banco propio antes de produccion.
- Los datos de la comparacion se limitan a AIME25, LiveCodeBench v6 y GPQA-Diamond; no hay cifras de perplejidad ni de MMLU/GSM8K en el texto disponible, lo que impide extrapolar el comportamiento general.
- No se declaran los idiomas soportados ni la longitud de contexto efectiva del modelo base en la informacion proporcionada; ambos son parametros criticos para dimensionar la cache KV y para aplicaciones multilingues.
- Riesgo de alucinacion inherente a los modelos generativos, agravado en el punto IQ2_XS; en dominios factuales se recomienda verificacion externa o RAG.
- Sesgos: no documentados en la informacion disponible. Al ser un modelo entrenado con datos web, cabe esperar sesgos de genero, cultura y idioma no cuantificados aqui.
- La licencia Apache-2.0 permite uso comercial y modificacion con obligaciones de atribucion y conservacion del aviso de licencia; no obstante, los pesos derivan de Qwen3.8-27B y deben respetarse las condiciones del modelo base.
- El soporte multimodal depende de llama.cpp y de cargar el `mmproj`; no todos los frontends (Ollama, LM Studio) exponen la entrada de imagen de la misma forma, lo que puede limitar el uso de vision en determinados despliegues.
- Las builds `-mtp` requieren una version de llama.cpp con soporte de decodificacion especulativa con cabeza MTP; en versiones antiguas pueden no cargar o ignorar la cabeza.

## Enlaces

- Repositorio en HuggingFace (duplicado): https://huggingface.co/Fix-AI/Qwen3.8-27B-GSQ-RCO-GGUF
- Repositorio original: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper GSQ (Gumbel-Softmax Quantization): https://arxiv.org/abs/2604.18556
- Paper RCO (Riemannian Constrained Optimization): https://arxiv.org/abs/2605.00649
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Codigo RCO: https://github.com/IST-DASLab/RCO
- Organizacion DASLab (IST Austria): https://github.com/IST-DASLab
- Grafico de rendimiento frente a bit-width: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF/resolve/main/assets/plots/Qwen3.8-27B-task_avg_vs_avg_bit_width.png
- Grafico de decodificacion especulativa con MTP: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF/resolve/main/assets/plots/Qwen3.8-27B-mtp_speculative_decoding.png

Nota: la busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a sitios genericos sobre la palabra "fix" y no se han incluido.
