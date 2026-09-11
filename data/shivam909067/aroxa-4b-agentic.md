# shivam909067/aroxa-4b-agentic

## Resumen

Aroxa-4B es un ajuste fino mediante LoRA del modelo denso Qwen3.5-4B, publicado por el usuario de HuggingFace shivam909067. No es un modelo de propósito general: está entrenado específicamente para emitir llamadas a herramientas en el formato XML que espera un runtime de agentes, y la propia model card lo describe como "mediblemente bueno en ese trabajo y poco destacable en todo lo demás". El objetivo declarado es resolver un problema muy concreto: los modelos base pequeños a menudo no consiguen producir una llamada a función parseable, lo que rompe cualquier bucle agéntico antes de empezar.

El artefacto principal es un GGUF Q8_0 de 4,3 GB que cabe y se ejecuta en un portátil, generado a partir de un adaptador LoRA de rango 32 entrenado durante 54 minutos en una única RTX 5090 sobre 3.832 trayectorias agénticas (de un total de 4.805 filas en el release). El repositorio declara 4.326.350.848 parámetros según los safetensors, mientras que la model card cita 4,58B para el modelo base; no se aclara la discrepancia.

Su relevancia es doble. Por un lado, demuestra que un ajuste fino pequeño y barato puede multiplicar la fiabilidad de formato en un bucle de tool calling (de 12/48 a 40/48 tareas resueltas en la suite interna CORE v2). Por otro, la model card incluye una advertencia poco habitual y muy útil: cuantizar este modelo por debajo de Q8_0 destruye la mayor parte del delta del LoRA (Q4_K_M retiene solo el 22,55% de la dirección del ajuste), con lo que el resultado se comporta estadísticamente como el modelo base sin que nadie lo note.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 32 capas (heredada de Qwen/Qwen3.5-4B) |
| Parametros totales | 4.326.350.848 segun safetensors; la model card cita 4,58B para el base |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (4,3 GB, la publicada); f16 (8,1 GB); Q6_K (~3,5 GB); Q4_K_M (~2,5 GB, desaconsejada) |
| Idiomas soportados | en (solo ingles declarado; sin evaluacion en otros idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF (etiqueta base_model:adapter, compatible con endpoints) |
| Metodo de ajuste | LoRA r=32, alpha=64, atencion + MLP, bf16 (no QLoRA) |
| Parametros entrenables | 42,5M de 4,58B (0,93%) |
| Tamano del repositorio | 4,8 GB |
| Fecha de publicacion | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer denso de 32 capas con 4,58B parametros, sobre el que se aplica un adaptador LoRA de rango 32 y alpha 64 en las proyecciones de atencion y en las capas MLP. El autor insiste en que se entreno en bf16 y no con QLoRA, un detalle relevante porque el delta resultante tiene una magnitud relativa muy baja (rho = 0,01326), lo que lo hace extremadamente sensible a la cuantizacion posterior. El entrenamiento completo fue de una sola epoca, 226 pasos, learning rate 1e-4, beta2 0,95 y weight decay 0,1, y se completo en 54 minutos en una RTX 5090.

Los datos son 3.832 filas de entrenamiento dentro de un release de 4.805 filas, con verificacion de fuga (cero solapamiento de identidad entre splits y cero cruce de grupos casi duplicados). La composicion es importante y el autor la detalla de forma explicita: 2.836 filas (59,0%) provienen del propio runtime del autor (aroxa-runtime), 1.497 (31,2%) de Salesforce/xlam-function-calling-60k, 463 (9,6%) de plantillas escritas a mano y solo 9 (0,2%) de SWE-Gym/SWE-smith. Es decir, aproximadamente un tercio de la senal de entrenamiento son datos de function calling de xLAM, no trayectorias de agente verificadas por ejecucion, algo que el propio autor senala como probable causa de que el modelo aprendiera el formato de la llamada pero no a elegir mejor la herramienta.

No hay decodificacion especulativa, atencion lineal ni otras innovaciones de inferencia. La unica particularidad tecnica destacable es el analisis de retencion del delta bajo cuantizacion, medido como coseno entre el delta previsto y el que sobrevive al round trip: f16 retiene 1,0008, Q8_0 retiene 0,8465, Q6_K baja a 0,4962 y Q4_K_M a 0,2255.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat propia.
- Emision de llamadas a herramientas en el formato XML de Qwen3-Coder: `<tool_call><function=create_file><parameter=path>a.py</parameter></function></tool_call>`.
- Validez de esquema practicamente perfecta: 0,985 en la suite interna con el GGUF Q8_0, frente a 0,112 del modelo base.
- Capacidad de recuperacion ante errores dentro de un bucle agéntico (0,5 en la dimension de recovery de la suite interna).
- Ejecucion de tareas de horizonte largo y reanudacion de tareas, aunque con degradacion clara tras la cuantizacion (long horizon 0,5 y resume 0,333 con Q8_0, frente a 1,000 en el adaptador en bf16).
- Uso general de herramientas dentro de un runtime de agente: el modelo esta pensado para ser el motor de un bucle de tool calling, no para razonamiento abierto.
- No hay soporte declarado de vision, audio ni modo "thinking" explicito.
- Soporte de function calling, si, pero limitado al formato XML; las llamadas en estilo JSON estan fuera de distribucion y no fueron evaluadas.
- Multilingue: no. Solo ingles declarado, y el autor indica que no se evaluo el uso en otros idiomas.

## Casos de uso

- Agentes de automatizacion de ficheros y repositorios: el modelo esta entrenado para emitir llamadas del tipo `create_file` con rutas y parametros correctos, por lo que encaja como planificador de un agente que crea, edita y organiza archivos en un sandbox, siempre que el runtime acepte el formato XML de Qwen3-Coder.
- Ejecucion local en portatil para prototipos de agentes: con el GGUF Q8_0 de 4,3 GB se puede levantar un bucle agéntico completo en una maquina sin GPU dedicada, algo util para desarrollo y pruebas sin coste de API.
- Enrutado de llamadas a funciones en asistentes internos: si el catalogo de herramientas es pequeno y conocido, el modelo garantiza practicamente siempre una llamada parseable (0,985 de validez de esquema), lo que reduce los fallos de parseo que rompen los pipelines.
- Recuperacion y continuacion de tareas interrumpidas: dispone de capacidad medida de resume y recovery dentro de la suite interna, lo que permite reintentar pasos fallidos en lugar de abortar el bucle completo.
- Nodo de un pipeline multi-agente de bajo coste: al ser un modelo de 4B con licencia apache-2.0, se puede desplegar en paralelo para tareas de ejecucion mecanica mientras un modelo mayor se reserva para planificacion.
- Evaluacion y comparacion de runtimes de agentes: sirve como linea base reproducible para medir si un cambio en el runtime (formato de herramientas, prompts, reintentos) mejora la tasa de exito, dado que el modelo es muy estable en formato.
- Fine-tuning adicional sobre datos propios de herramientas: al ser un adaptador LoRA sobre un base apache-2.0, se puede continuar el entrenamiento con un catalogo interno de funciones, aunque el autor advierte que el ajuste actual no mejora la seleccion de herramienta.

## Benchmarks y rendimiento

No hay resultados de benchmarks publicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos son de CORE v2, una suite interna de 16 tareas por 3 intentos (n=48 por variante), no auditada, que el propio autor pide interpretar como "lo que medimos nosotros", no como una afirmacion de leaderboard.

| Artefacto | Exito en tarea (CORE v2) | Compuesto |
|---|---:|---:|
| Qwen3.5-4B (base sin tocar) | 12/48 | 0,325 |
| Aroxa-4B, LoRA en bf16 | 41/48 | 0,839 |
| Aroxa-4B, GGUF Q8_0 fusionado | 40/48 | 0,738 |

| Dimension | Base | Ajustado (bf16) | GGUF Q8 |
|---|---:|---:|---:|
| Validez de esquema | 0,112 | 1,000 | 0,985 |
| Grounding | 0,500 | 1,000 | 1,000 |
| Recuperacion | 0,000 | 0,500 | 0,500 |
| Horizonte largo | 0,000 | 1,000 | 0,500 |
| Reanudacion (resume) | 0,000 | 1,000 | 0,333 |
| Seleccion de herramienta | 0,590 | 0,590 | 0,487 |
| Contencion (restraint) | 1,000 | 0,889 | 1,000 |

El autor advierte que las dimensiones con valores 0,5 o 0,333 se apoyan en una o dos tareas y estan en el suelo de varianza de la suite; la unica cifra con n real detras es el 48 intentos de exito en tarea. La diferencia entre 40/48 y 41/48 queda dentro del margen de mas o menos un intento.

Como referencia del proyecto hermano de 30B (no de este modelo): el fine-tune puntuo por debajo de su propio base en HumanEval bajo protocolo de chat (85,4% frente a 87,2%), y la version de 30B midio en torno al 20% de exito en tareas multi-archivo extendidas frente a un objetivo del 75%.

## Requisitos de hardware

- VRAM estimada para inferencia con GGUF Q8_0 (4,3 GB de pesos): aproximadamente 5,5 a 7 GB incluyendo contexto y overhead del runtime. Estimacion propia a partir del tamano del fichero, no un dato publicado.
- VRAM estimada para f16 (8,1 GB de pesos): aproximadamente 10 a 12 GB. Estimacion propia.
- Q6_K (~3,5 GB) y Q4_K_M (~2,5 GB) reducen el requisito de memoria, pero el autor desaconseja explicitamente su uso porque destruyen el delta del LoRA.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas para Q8_0 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, etc.), y en portatiles con GPU de 8 GB. El propio autor lo describe como un modelo que corre en portatil.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; el entrenamiento del adaptador se hizo en una sola RTX 5090 en 54 minutos.
- Opciones de despliegue: Ollama esta documentado en la model card con un `Modelfile` que apunta al GGUF Q8_0; al ser GGUF tambien es compatible con llama.cpp y con los runtimes que consumen GGUF; el repositorio esta etiquetado como compatible con endpoints y con safetensors, por lo que vLLM o TGI son opciones para servir los pesos sin cuantizar. No se proporcionan recetas concretas para vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exito CORE v2 (interno) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aroxa-4B (GGUF Q8_0) | 4,33B segun safetensors (4,58B declarado) | no disponible | 40/48 | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Aroxa-4B (LoRA bf16) | idem | no disponible | 41/48 | apache-2.0 | HuggingFace |
| Qwen3.5-4B (base) | 4,58B declarado | no disponible | 12/48 | no disponible en la informacion | HuggingFace (Qwen/Qwen3.5-4B) |
| Version de 30B del mismo proyecto | ~30B (nominal) | no disponible | no comparable directamente | no disponible | no disponible; solo se menciona como antecedente |

No se dispone de datos de benchmarks, parametros ni contexto de otras alternativas de tool calling (por ejemplo modelos de la familia xLAM o variantes de Qwen2.5-Coder) en la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa con ellos. La unica fuente de datos de entrenamiento de terceros citada es Salesforce/xlam-function-calling-60k, usado como parte del dataset, no como modelo comparable.

## Limitaciones y advertencias

- No mejora la seleccion de herramienta: la precision se mantiene en 0,590 tanto en el base como en el ajuste. El modelo aprendio el formato de la llamada, no a elegir mejor que funcion usar.
- La contencion empeora ligeramente en el adaptador sin cuantizar (1,000 a 0,889): un modelo entrenado para lanzar herramientas las lanza con demasiada frecuencia cuando no deberia.
- La calidad de codigo general no mejora. El autor avisa de que, en la version de 30B del mismo proyecto, el fine-tune puntuo por debajo de su base en HumanEval bajo protocolo de chat (85,4% frente a 87,2%), y espera el mismo comportamiento aqui: es entrenamiento de protocolo de herramientas, no de codigo.
- El trabajo agéntico de horizonte largo es debil. La version de 30B midio alrededor del 20% de exito en tareas multi-archivo frente a un objetivo del 75%, y los modelos frontera puntuan entre el 57% y el 74% en benchmarks agenticos comparables. Un 4B no va a superarlos.
- No hay evaluacion de seguridad, sesgos ni uso en idiomas distintos del ingles. Cero violaciones graves en una suite interna no equivale a una evaluacion de seguridad.
- La suite CORE v2 es interna y no auditada. Todas las cifras deben leerse como mediciones del autor, no como resultados verificados de forma independiente.
- Riesgo grave de cuantizacion silenciosa: Q4_K_M, el formato GGUF mas descargado, retiene solo el 22,55% de la direccion del delta del LoRA. El autor documenta que una version anterior de 30B se publico asi y puntuo 22/48 frente a los 20/48 de su base sin que nadie lo detectara durante meses, porque la evaluacion corria el adaptador y el release corria el merge. Si se cuantiza por cuenta propia, hay que parar en Q8_0.
- Formato de tool call rigido: el modelo espera el XML de Qwen3-Coder. Las llamadas en estilo JSON estan fuera de distribucion y el autor no midio su comportamiento en ese caso.
- Aproximadamente un tercio de los datos de entrenamiento son function calling de xLAM, no trayectorias de agente verificadas por ejecucion, lo que condiciona el tipo de habilidad adquirida.
- Licencia apache-2.0, sin restricciones declaradas para uso comercial, pero el modelo base Qwen3.5-4B impone sus propios terminos, que no se detallan en la informacion disponible.
- El modelo no tiene traccion en el repositorio (0 descargas y 0 likes en el momento de la consulta), lo que implica ausencia de validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shivam909067/aroxa-4b-agentic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset citado como fuente de entrenamiento: Salesforce/xlam-function-calling-60k (identificador mencionado en la model card; no se proporciona URL en la informacion disponible)
- Otros enlaces relevantes (papers, blogs, repos, demos): no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los unicos resultados obtenidos fueron paginas de comercio electronico sin relacion con el contenido.
