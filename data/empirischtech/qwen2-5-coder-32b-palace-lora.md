# empirischtech/Qwen2.5-Coder-32B-Palace-LoRA

## Resumen

Qwen2.5-Coder-32B-Palace-LoRA es un adaptador LoRA (entrenado con QLoRA) que especializa el modelo Qwen/Qwen2.5-Coder-32B-Instruct para la redaccion y reparacion de ficheros de configuracion de Palace, un solver de elementos finitos de codigo abierto para electromagnetismo computacional desarrollado por awslabs. El adaptador lo publica el usuario empirischtech y esta asociado al articulo "Beyond Schema Conformance with Executable Verification for Scientific Configuration Repair", presentado en el workshop VeriCodeGen de NeurIPS 2026.

El problema que aborda es concreto: Palace se controla mediante un JSON estricto y muy especifico del dominio, con nombres de campo, tipos, enumerados y unidades fisicas que los modelos de codigo generalistas manejan mal. Un error silencioso en una unidad o en un enum puede producir una configuracion que valida contra el esquema y ejecuta hasta el final, pero que calcula un sistema fisico distinto. El adaptador ensena al modelo base el vocabulario exacto del esquema de Palace v0.14.0 y sus idiomas de configuracion.

Tecnicamente es un adaptador de bajo rango (rank 64, alpha 128) sobre las proyecciones lineales del transformer base de 32B parametros, con alrededor de 2,2 GB de pesos en el repositorio. No modifica la arquitectura del modelo base ni su ventana de contexto; aporta especializacion de dominio sobre un modelo ya competente en generacion de codigo y JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5-Coder-32B-Instruct) |
| Parametros totales | 32B en el modelo base; el adaptador LoRA no declara recuento propio (repo de 2,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-32B-Instruct) |
| Tipos de cuantizacion | Base entrenado en 4-bit NF4 (QLoRA); pesos del adaptador en safetensors; cuantizacion de inferencia no especificada |
| Idiomas soportados | en |
| Licencia | apache-2.0 (sujeta tambien a la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-32B-Instruct, un transformer decoder-only, mediante LoRA de rango 64 y alpha 128, con dropout 0,05, insertado en todas las proyecciones lineales (q, k, v, o, gate, up, down). El entrenamiento usa QLoRA con la base cuantizada en 4-bit NF4, lo que reduce el coste de memoria del ajuste fino. No se introduce ninguna modificacion arquitectonica adicional: no hay decodificacion especulativa, atencion lineal ni modulos nuevos.

Los datos de entrenamiento consisten en 3.296 pares instruccion/respuesta (199 reservados para validacion), derivados del esquema JSON de Palace, su documentacion y las configuraciones de ejemplo incluidas en el repositorio del solver. Se renderizan en dos familias de tarea: autoria de configuraciones a partir de una descripcion en lenguaje natural y reparacion dirigida de configuraciones defectuosas. El entrenamiento usa plantilla ChatML con la perdida calculada solo sobre las respuestas, 3 epocas, longitud de secuencia 8192, tamano de lote efectivo 16 (micro-lote 4 x acumulacion de gradiente 4), tasa de aprendizaje 1e-4 con decaimiento coseno, warmup 0,03, AdamW-8bit paginado, bf16 y semilla 17. El stack es PEFT 0.19.1, Axolotl 0.17.0 y Transformers. El adaptador se entrena contra artefactos de Palace v0.14.0.

## Capacidades

- Generacion de configuraciones JSON de Palace a partir de descripciones en lenguaje natural de problemas electrostaticos, magnetostaticos y electromagneticos forzados (driven).
- Reparacion de configuraciones: correccion de violaciones de esquema, tipos incorrectos, enumerados invalidos, referencias a mallas inexistentes y secciones obligatorias ausentes.
- Generacion de codigo y JSON estructurado, heredada del modelo base Qwen2.5-Coder-32B-Instruct.
- Conversacion multi-turno con plantilla ChatML.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion proporcionada.
- No se documenta soporte de agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento extendido.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Autoria de configuraciones de simulacion electrostatica: un ingeniero describe un condensador de placas paralelas con atributos de malla concretos y el adaptador produce un JSON que valida contra el esquema de Palace y se ejecuta con `palace --dry-run`.
- Reparacion automatizada de configuraciones rotas en pipelines de CI: dado un JSON que falla la validacion, el adaptador corrige tipos, enumerados y referencias de malla antes de que el solver se lance en el cluster.
- Migracion de configuraciones entre experimentos: se parte de una configuracion existente y se generan variantes cambiando condiciones de contorno o atributos de dominio, manteniendo la estructura valida del esquema.
- Asistencia en docencia e investigacion en electromagnetismo computacional: el modelo traduce descripciones fisicas de un problema a la configuracion ejecutable, reduciendo el tiempo de puesta a punto para usuarios noveles de Palace.
- Generacion de plantillas base para nuevos estudios: se piden configuraciones minimas por tipo de analisis (electrostatico, magnetostatico, driven) que luego el equipo amplia manualmente.
- Verificacion asistida de configuraciones en revision de codigo: el adaptador puede senalar secciones ausentes o referencias colgantes en un diff de configuracion antes de fusionarlo.
- Integracion como servicio con vLLM: desplegar la base con `--enable-lora` y `--max-lora-rank 64` para servir el adaptador como modulo `palace` junto al modelo base, compartiendo el mismo motor de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el articulo "Beyond Schema Conformance with Executable Verification for Scientific Configuration Repair" (NeurIPS 2026 Workshop on AI for Verifiable Coding), pero no incluye cifras de MMLU, HumanEval, GSM8K ni metricas especificas de validacion de esquema en el material proporcionado.

## Requisitos de hardware

- El adaptador en si ocupa 2,2 GB en disco; requiere cargar el modelo base Qwen2.5-Coder-32B-Instruct, que en bf16 necesita aproximadamente 64 GB de VRAM.
- En cuantizacion de 4 bits, el modelo base se situa en torno a 18-20 GB de VRAM, viable en una RTX 4090 (24 GB) con margen limitado para el contexto.
- GPU recomendadas: A100 80 GB o H100 para bf16 sin cuantizar; A100 40 GB o RTX 4090 para cuantizacion 4-bit.
- No cabe en GPU de consumo con menos de 24 GB de VRAM sin cuantizacion agresiva.
- Despliegue soportado: vLLM con `--enable-lora --lora-modules palace=<adaptador> --max-lora-rank 64`; tambien PEFT + Transformers segun el ejemplo de la model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-32B-Palace-LoRA | 32B (base) + adaptador LoRA | no disponible | Configuraciones JSON de Palace v0.14.0 | apache-2.0 | HuggingFace (24 descargas) |
| Qwen2.5-Coder-32B-Instruct | 32B | no disponible en la informacion proporcionada | Codigo generalista | apache-2.0 | HuggingFace |
| Adaptadores de dominio sobre Qwen2.5-Coder | 32B (base) + LoRA | no disponible | Variable segun dominio | variable | HuggingFace |

La comparacion con alternativas especificas de dominio para electromagnetismo computacional no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia medible es la especializacion en el esquema de Palace; no se aportan cifras comparativas de rendimiento.

## Limitaciones y advertencias

- Las configuraciones generadas pueden validar contra el esquema y pasar `palace --dry-run` y aun asi ser fisicamente incorrectas; por ejemplo, una unidad de longitud `L0` mal escalada produce una simulacion que termina pero calcula otro sistema fisico.
- Es obligatorio validar contra el esquema JSON de Palace y ejecutar `palace --dry-run` antes de confiar en una salida, y contrastar los resultados numericos con una referencia analitica cuando exista.
- El adaptador esta entrenado contra Palace v0.14.0; otras versiones pueden tener un esquema distinto y degradar la calidad.
- Solo se declara soporte de ingles.
- El conjunto de datos de entrenamiento es pequeno (3.296 pares), lo que limita la cobertura de casos poco frecuentes del esquema.
- Riesgo de alucinacion de campos o enumerados plausibles pero inexistentes en el esquema, propio de un modelo generativo de 32B.
- No se documentan evaluaciones de sesgo; al ser un adaptador de dominio tecnico, el riesgo de sesgo social es bajo pero no esta medido.
- Uso comercial permitido por Apache 2.0, sujeto ademas al cumplimiento de la licencia de Qwen/Qwen2.5-Coder-32B-Instruct.
- El repositorio tiene muy poca adopcion (24 descargas, 0 likes), por lo que no hay evidencia comunitaria de robustez en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/empirischtech/Qwen2.5-Coder-32B-Palace-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Dataset: https://huggingface.co/datasets/empirischtech/Palace-Config-Repair
- Paper (NeurIPS 2026 Workshop on AI for Verifiable Coding): https://neurips.cc/virtual/2026/loc/atlanta/171447
- Repositorio de Palace (awslabs): https://github.com/awslabs/palace
