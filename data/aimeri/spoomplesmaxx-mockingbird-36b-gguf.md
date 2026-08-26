# aimeri/spoomplesmaxx-mockingbird-36B-GGUF

## Resumen

Spoomplesmaxx-mockingbird-36B es un modelo de lenguaje de 36 000 millones de parámetros desarrollado por aimeri, especializado en roleplay y escritura creativa, con competencia ligera en seguimiento de instrucciones y razonamiento. Forma parte de la familia SpoomplesMaxx, cuyo objetivo declarado en el repositorio oficial es combinar conjuntos de datos de roleplay, escritura creativa y asistente "inteligente" para producir un modelo narrativamente creativo, capaz de encarnar personajes y seguir instrucciones complejas con coherencia lógica. Esta variante GGUF es la primera de las "mimids", una subfamilia dentro del proyecto, y se distribuye en cuantizaciones estáticas para ejecución local.

El modelo se publica bajo licencia Apache 2.0, con soporte exclusivo para inglés, y su arquitectura concreta no se detalla en la información disponible. La versión GGUF incluye la plantilla de chat nativa embebida en los metadatos, lo que permite su uso directo con llama.cpp, koboldcpp y LM Studio. El autor advierte de una peculiaridad importante: la plantilla termina cada mensaje con un token especial `<seed:eos>`, por lo que las penalizaciones de repetición, presencia o frecuencia deben desactivarse por completo (repeat_penalty = 1.0), ya que de lo contrario la generación degenera hacia el vocabulario chino del modelo base sin entrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no confirmado; no se especifica en la documentacion) |
| Parametros totales | 36 151 104 512 (36B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M (~18 GB), Q4_K_S (~21 GB), Q4_K_M (~22 GB), Q5_K_M (~26 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna del modelo base (spoomplesmaxx-mockingbird-36B). Dado el tamano de 36B y la ausencia de indicaciones sobre mezcla de expertos, se asume un transformer denso, aunque no hay confirmacion explicita. El repositorio de datos del proyecto (GitHub aimerib/spoomplesmaxx) indica que los conjuntos de entrenamiento estan disenados para roleplay, escritura creativa y asistente "inteligente", combinando narrativa creativa con capacidad de seguir instrucciones complejas. No se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

La variante GGUF se ofrece en dos series: estatica (este repositorio) y con imatrix (repositorio `-i1-GGUF`), esta ultima calibrada sobre el corpus de entrenamiento del propio modelo y recomendada por el autor para cuantizaciones de 3-4 bits si el runtime lo soporta. La plantilla de chat se incrusta en los metadatos GGUF, lo que facilita la integracion automatica en frontends compatibles.

## Capacidades

- Generacion de texto narrativo y creativo: el modelo esta especificamente entrenado para roleplay y escritura de ficcion, con capacidad para encarnar personajes y mantener coherencia narrativa.
- Seguimiento de instrucciones: competencia ligera en tareas de instruccion general, aunque no es su punto fuerte principal.
- Razonamiento basico: puede resolver tareas logicas simples, pero su rendimiento en razonamiento complejo no esta documentado.
- Soporte de tool calling: no disponible (no se menciona en la documentacion).
- Soporte de agentes y multi-step reasoning: no disponible (no se menciona).
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales: la plantilla de chat usa un token especial `<seed:eos>` para finalizar turnos, lo que requiere desactivar penalizaciones de repeticion para un funcionamiento correcto.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener conversaciones multi-turno encarnando personajes ficticios, gracias a su entrenamiento especifico en datasets de roleplay. Es adecuado para juegos de rol por texto, chatbots de personajes o simulaciones narrativas.
- Escritura creativa asistida: generacion de borradores de ficcion, descripciones de escenas, dialogos y desarrollo de tramas. Su capacidad para mantener coherencia narrativa lo hace util como herramienta de apoyo para escritores.
- Creacion de contenido para juegos: generacion de dialogos de NPC, misiones o lore para videojuegos y proyectos de rol. El modelo puede producir texto narrativo variado y consistente con el tono deseado.
- Prototipado rapido de chatbots de ficcion: desarrollo de demos o prototipos de asistentes conversacionales con personalidad, donde la creatividad verbal es mas importante que la precision factual.
- Generacion de historias interactivas: creacion de aventuras de texto donde el usuario toma decisiones y el modelo adapta la narrativa en consecuencia, aprovechando su ventana de contexto (aunque la longitud exacta no se ha publicado).
- Experimentacion con tecnicas de sampling: dado el rango de temperatura recomendado (0.95-1.05) y la sensibilidad a penalizaciones, el modelo es util para investigar efectos de parametros de decodificacion en la calidad narrativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion, se necesitan aproximadamente 18 GB (Q3_K_M), 21 GB (Q4_K_S), 22 GB (Q4_K_M) o 26 GB (Q5_K_M) de VRAM, mas overhead de contexto y calculo.
- GPU recomendadas: para Q3_K_M y Q4_K_S, una RTX 4090 (24 GB) o similar es suficiente. Para Q5_K_M, se recomienda una GPU con 32 GB o mas (por ejemplo, A6000, A100 40GB, o multiples GPUs).
- En consumer GPU: si, con Q3_K_M o Q4_K_S en tarjetas de 24 GB (RTX 3090/4090). Q4_K_M tambien cabe en 24 GB con margen ajustado.
- Opciones de despliegue: llama.cpp, koboldcpp, LM Studio (soportan GGUF con plantilla embebida). Tambien es compatible con endpoints que acepten GGUF (segun la etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponible. Dependera del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| spoomplesmaxx-mockingbird-36B (este) | 36B | no disponible | Apache 2.0 | GGUF | Roleplay y escritura creativa |
| spoomplesmaxx-mini-14B | 14B | no disponible | Apache 2.0 (presumible) | no especificado | Misma familia, menor tamano, cabe en 24 GB |
| spoomplesmaxx-magpie-35B-A3 | 35B totales, 3 activos (MoE) | no disponible | Apache 2.0 (presumible) | GGUF (i1) | Misma familia, arquitectura MoE |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Penalizaciones de repeticion: el modelo requiere `repeat_penalty = 1.0` (desactivado). Cualquier penalizacion de repeticion, presencia o frecuencia suprime el token `<seed:eos>` y provoca que el modelo deje de terminar sus turnos, degenerando hacia el vocabulario chino del modelo base sin entrenar. Muchos frontends aplican valores por defecto de 1.05-1.1, por lo que hay que ajustarlos manualmente.
- Ventana de temperatura estrecha: el rango util es aproximadamente 0.95-1.05. Temperaturas mas bajas producen repeticion verbatim; mas altas, generacion incoherente.
- Idioma: solo ingles. No se recomienda su uso en otros idiomas.
- Sesgos: no se han documentado sesgos especificos, pero al ser un modelo entrenado principalmente para roleplay y escritura creativa, puede reflejar sesgos presentes en los datasets de ficcion y roleplay.
- Riesgo de alucinacion: no se han publicado evaluaciones, pero como modelo generativo, puede producir contenido factualmente incorrecto, especialmente en tareas de conocimiento general.
- Contexto: la longitud de contexto no se ha publicado, lo que limita la planificacion de despliegues que requieran ventanas largas.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos completos de la licencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/aimeri/spoomplesmaxx-mockingbird-36B-GGUF
- Modelo base (safetensors): https://huggingface.co/aimeri/spoomplesmaxx-mockingbird-36B
- Repositorio de datos del proyecto: https://github.com/aimerib/spoomplesmaxx
- Variante mini-14B: https://huggingface.co/aimeri/spoomplesmaxx-mini-14B
- Variante magpie-35B-A3 (GGUF con imatrix): https://huggingface.co/aimeri/spoomplesmaxx-magpie-35B-A3-i1-GGUF
