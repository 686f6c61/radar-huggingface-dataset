# Batman787/Athena-27B

## Resumen

Athena-27B es un modelo de lenguaje denso de 27.400 millones de parametros desarrollado por Athena Research, publicado como pesos abiertos bajo licencia Apache-2.0. Se trata de un ajuste fino (finetune) del modelo Qwen/Qwen3.8-27B, orientado especificamente a tareas de agente de codigo en terminal y asistencia general. El modelo incorpora una capa de agente de codigo fusionada directamente en los pesos (sin adaptadores externos), entrenada mediante aprendizaje por refuerzo sobre tareas de ingenieria de software y terminal bajo un arnes de agente.

La arquitectura es hibrida: combina 16 capas de atencion completa con 48 capas de atencion lineal (Gated DeltaNet), sumando 64 capas en total, e incluye un codificador de vision. Soporta una longitud de contexto nativa de 262.144 tokens, aunque el autor recomienda 131.072 tokens para sesiones de agente. El modelo esta disenado para el bucle editar-ejecutar-verificar propio de los agentes de codigo de terminal, con soporte nativo de tool calling y un modo de razonamiento ("thinking") desactivable por peticion.

Su relevancia actual radica en tres factores: es un modelo de pesos abiertos con licencia permisiva (Apache-2.0) para uso comercial, incorpora soporte multilingue para once idiomas (ingles y diez idiomas de India: hindi, bengali, tamil, telugu, marati, gujarati, kannada, malayalam, punyabi y urdu), y anade una capa de conocimiento y evaluacion especifica sobre India. Ademas, el autor publica junto al modelo un arnes de codigo abierto (Athena harness) y documenta el proceso de entrenamiento y evaluacion con detalle inusualmente alto para un modelo de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 16 capas de atencion completa + 48 capas de atencion lineal (Gated DeltaNet), 64 capas en total; incluye codificador de vision |
| Parametros totales | 27.356.728.560 (27,4B), denso |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; 131.072 recomendado para sesiones de agente |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos en bf16) |
| Idiomas soportados | Ingles (en), hindi (hi), bengali (bn), tamil (ta), telugu (te), marati (mr), gujarati (gu), kannada (kn), malayalam (ml), punyabi (pa), urdu (ur) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, ~55 GB) |

## Arquitectura y entrenamiento

Athena-27B es un transformer hibrido que combina atencion completa clasica con atencion lineal mediante Gated DeltaNet. De las 64 capas totales, 16 usan atencion completa y 48 usan atencion lineal, una eleccion que reduce el coste computacional y de memoria en contextos largos manteniendo capacidad de recuperacion de informacion a larga distancia. El modelo incluye ademas un codificador de vision, lo que le permite procesar entradas de imagen y texto (pipeline image-text-to-text). Los pesos se distribuyen en bf16 con un tamano de repositorio de 54,7 GB.

El entrenamiento se realizo en tres etapas documentadas por el autor. Primero, se partio de un ajuste fino Apache-2.0 de Qwen3.8-27B post-entrenado para dar respuestas factuales y con fuentes sobre temas politicamente sensibles, sin perdida medida de capacidad general o agentica. Segundo, se entreno una capa de agente de codigo mediante aprendizaje por refuerzo sobre tareas de terminal e ingenieria de software bajo un arnes de agente, usando LoRA de rango 32 y alpha 64 sobre las proyecciones de atencion y MLP; este adaptador se fusiono en los pesos, dejando un unico conjunto de pesos bf16 que cualquier stack de serving puede cargar. Tercero, se definio la identidad del modelo en la plantilla de chat y se probo el stack completo de extremo a extremo. El autor declara haber verificado que el modelo fusionado responde igual que la configuracion base-mas-adaptador dentro del ruido entre ejecuciones.

Como innovaciones tecnicas destacables, el modelo incorpora un modo de razonamiento ("thinking") desactivable por peticion con un presupuesto opcional de tokens (`thinking_token_budget`; el autor usa aproximadamente 4k, 8k y 16k tokens para niveles bajo, medio y alto). La plantilla de chat inyecta la identidad "Athena, made by Athena Research" cuando no se envia un mensaje de sistema propio. El autor documenta ademas una correccion de serving: el tamano de lote por defecto de vLLM provoca un fallo de arranque en este modelo hibrido en GPUs grandes, por lo que recomienda `--max-num-seqs 128`.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento paso a paso activable por peticion, con presupuesto de tokens configurable (off, bajo ~4k, medio ~8k, alto ~16k).
- Codigo y agentes de terminal: lectura de repositorios, edicion focalizada, ejecucion de tests y finalizacion en pocos pasos.
- Tool calling / function calling nativo, integrado en el bucle del agente.
- Razonamiento multi-paso y uso de agentes bajo arnes (Athena harness).
- Capacidades de vision gracias al codificador de vision incluido (entrada image-text-to-text).
- Capacidades multilingues en once idiomas: ingles y diez idiomas de India.
- Capa de conocimiento sobre India: historia, cultura y temas sensibles respondidos de forma factual y con fuentes.
- Identidad de modelo controlada por plantilla de chat (se presenta como Athena, de Athena Research).

## Casos de uso

- Agente de codigo en terminal: el modelo puede leer un repositorio, localizar el fallo, aplicar una edicion focalizada y ejecutar los tests en pocos pasos. Es adecuado porque fue entrenado con RL sobre el bucle editar-ejecutar-verificar y soporta tool calling nativo; el autor reporta 48 de 48 ejecuciones resueltas en su suite interna de correccion de bugs con una mediana de 4 llamadas a herramientas por tarea.
- Integracion en pipelines de CI/CD: con tool calling nativo y contexto de 131.072 tokens recomendado para sesiones de agente, puede analizar diffs, ejecutar tests y proponer correcciones dentro de un flujo automatizado.
- Atencion al cliente multilingue en India: al cubrir hindi, bengali, tamil, telugu, marati, gujarati, kannada, malayalam, punyabi y urdu, puede gestionar conversaciones multi-turno en los idiomas que usan realmente los usuarios, con contexto largo para historiales extensos.
- Asistencia general, redaccion y analisis: el modelo maneja preguntas generales, escritura y analisis, con modo de razonamiento activable cuando la tarea lo requiere.
- Revision de codigo y de seguridad: el arnes incluye plantillas `/review` y `/security-review`, de modo que el modelo puede emplearse para revisiones automatizadas de cambios en un repositorio.
- Consultas factuales sobre India con fuentes: la capa de conocimiento y la evaluacion especifica permiten responder preguntas sobre historia, cultura y temas sensibles con hechos verificables y fuentes gubernamentales, legislativas, cientificas y culturales.
- Procesamiento de documentos con imagenes: gracias al codificador de vision, puede extraer y razonar sobre contenido de capturas, diagramas o documentos escaneados junto a texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta resultados de sus suites internas:

| Evaluacion interna | Resultado |
|---|---|
| Suite de correccion de bugs en repositorios (gradada por tests ocultos) | 48 de 48 ejecuciones resueltas; mediana de 4 llamadas a herramientas por tarea |
| Suite de codigo sin herramientas opcionales | 63 de 64 resueltas |
| Suite de codigo con herramientas opcionales activadas | 59 de 64 resueltas |
| Seleccion de herramienta correcta (16 pruebas) | 16 de 16 |
| Identidad con plantilla de chat (9 preguntas) | 9 de 9 respuestas "Athena" (incluido en hindi y ante instruccion de ignorar instrucciones) |
| Identidad con pesos sin plantilla (9 preguntas) | 8 de 9 nombraron el modelo base |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB solo para los pesos, mas memoria para KV cache y activaciones; se recomienda al menos 80 GB para contexto largo.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con 80 GB o mas de memoria para bf16 con contexto extendido.
- En GPU de consumo: no cabe en bf16 en tarjetas de 24 GB (RTX 4090) ni de 32 GB; requeriria cuantizacion, que el autor no publica en este repositorio.
- Opciones de despliegue: transformers (libreria declarada), vLLM (el autor documenta el comando recomendado con `--max-num-seqs 128` para evitar el fallo de arranque del modelo hibrido en GPUs grandes) y stacks compatibles con endpoints. No se documentan opciones llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Athena-27B | 27,4B denso | 262.144 | Apache-2.0 | Hibrido con atencion lineal, vision, agente de codigo fusionado, multilingue India |
| Qwen3.8-27B (modelo base) | 27B (segun model card) | No disponible | Apache-2.0 | Base del finetune; sin la capa de agente ni la identidad Athena |
| Alternativas de tamano similar | No disponible | No disponible | No disponible | No se dispone de datos de benchmarks comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados en benchmarks estandar, por lo que el rendimiento relativo frente a otros modelos de 27B no puede verificarse de forma independiente.
- Los resultados reportados por el autor provienen de suites internas y no han sido replicados externamente.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el autor no documenta tasas de alucinacion medidas.
- Sesgos conocidos: el modelo parte de un ajuste fino con una perspectiva editorial declarada ("respuestas factuales y con fuentes en lugar de encuadres estatales" sobre temas politicamente sensibles); los usuarios deben evaluar si esa perspectiva encaja con su caso de uso.
- La cobertura multilingue se limita a once idiomas (ingles y diez de India); no se documenta soporte para castellano ni otras lenguas.
- El modo de razonamiento esta desactivado por defecto; las tareas que requieran razonamiento profundo deben activarlo explicitamente y consumiran mas tokens.
- El autor advierte de un fallo de arranque con el tamano de lote por defecto de vLLM en GPUs grandes; es necesario configurar `--max-num-seqs 128`.
- Las herramientas opcionales del arnes (busqueda web, memoria, etc.) redujeron el rendimiento en la suite de codigo del autor (59 de 64 frente a 63 de 64), por lo que se recomienda mantenerlas desactivadas salvo necesidad.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las obligaciones de atribucion y las condiciones del modelo base Qwen3.8-27B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Batman787/Athena-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Athena harness (repositorio del arnes de codigo): https://github.com/sakshamzip2-sys/athena-harness
