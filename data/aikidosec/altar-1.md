# AikidoSec/altar-1

## Resumen

Altar-1 es una poda del modelo mixto de expertos GLM-5.3 (753B parametros, 8 de 256 expertos enrutados por token, aproximadamente 40B parametros activos) publicada por AikidoSec. El modelo conserva 168 de los 256 expertos por capa, lo que supone eliminar el 34% de las subredes de expertos mediante REAP (Router-weighted Expert Activation Pruning), una tecnica que puntua la contribucion real de cada experto y borra los menos utiles sin reentrenar. El resultado son 500.825.296.352 parametros totales (el autor lo describe como "504B") y un repositorio de 328 GB.

La segunda mitad del proceso es de cuantizacion: los expertos enrutados se almacenan en INT4 W4A16 con compressed-tensors y AWQ, partiendo de cyankiwi/GLM-5.3-AWQ-INT4, mientras que la atencion, el experto compartido, las capas densas y la cabeza permanecen en BF16. El enrutamiento no se modifica: siguen activandose 8 expertos por token, ahora entre los 168 que quedan, con el mismo presupuesto de ~40B parametros activos que el modelo original.

Su relevancia practica es que hace servible en 4x H200 un modelo que de otro modo no cabria con un contexto largo y lotes de produccion. La calibracion se hizo con trazas de ciberseguridad, codigo, tool calling, razonamiento e ingles, ademas de articulos multilingues de Wikipedia, y el modelo esta pensado para despliegue en vLLM sobre hardware Hopper con el kernel Marlin MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag oficial `glm_moe_dsa`), derivado de GLM-5.3; 168 de 256 expertos por capa tras poda REAP |
| Parametros totales | 500.825.296.352 (etiquetado como "504B" en la model card; 753B en el GLM-5.3 original) |
| Parametros activos | ~40B (8 expertos enrutados por token sobre 168 disponibles) |
| Longitud de contexto | 131.072 tokens configurados en vLLM (`--max-model-len 131072`); contexto nativo del GLM-5.3 original: no disponible |
| Tipos de cuantizacion | W4A16 INT4 (AWQ, formato compressed-tensors) en expertos enrutados; atencion, experto compartido, capas densas y cabeza en BF16 |
| Idiomas soportados | no disponible; la model card solo indica calibracion con trazas en ingles y articulos multilingues de Wikipedia |
| Licencia | other (hereda la licencia de GLM-5.3) |
| Formato de pesos | safetensors (compressed-tensors); tamano del repo 328.0 GB; no hay GGUF publicado |

## Arquitectura y entrenamiento

Altar-1 no es un modelo entrenado desde cero, sino una poda estructural sobre GLM-5.3, un MoE de 753B parametros con 256 expertos por capa del que se activan 8 por token. El metodo REAP asigna a cada experto una puntuacion basada en su activacion ponderada por el router y elimina los menos relevantes, en este caso 88 de 256 por capa. La decision de diseno clave es que la puntuacion no usa la frecuencia global, sino la mayor cuota de trabajo enrutado dentro de un unico dominio: asi se preservan los especialistas de codigo, idiomas poco frecuentes o salida estructurada que una poda por frecuencia habria borrado. El resultado son 168 expertos por capa sin reentrenamiento posterior.

Sobre esa poda se aplico cuantizacion W4A16 INT4 (AWQ mediante compressed-tensors) tomada del build cyankiwi/GLM-5.3-AWQ-INT4, limitada exclusivamente a los expertos enrutados; el resto de componentes se mantiene en BF16 para no degradar atencion ni cabeza. La fidelidad declarada frente al GLM-5.3 completo en BF16 es de 0.506 nats de divergencia KL sobre un panel cerrado de 25 prompts y el vocabulario completo de 154.000 tokens; un build EXL3 del mismo corte de 168 expertos mide 0.511, lo que sugiere que a este ancho de bits el formato de cuantizacion apenas cambia el resultado. El proceso de poda se ejecuto sobre 8x NVIDIA RTX PRO 6000 Blackwell.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 131.072 tokens en la configuracion de servido documentada.
- Razonamiento y codigo: la calibracion incluye trazas de programacion, razonamiento y ciberseguridad, y Aikido declara que sus productos de analisis de codigo ya usan el modelo.
- Tool calling y salida estructurada: parte explicita del conjunto de calibracion, con retencion de los expertos especializados en salida estructurada gracias al criterio de poda por dominio.
- Capacidades de agente y razonamiento multi-paso: la model card menciona razonamiento y tool calling como ejes de calibracion, aunque no detalla esquemas de function calling concretos.
- Capacidades multilingues: la calibracion incluye articulos multilingues de Wikipedia, pero no se publica una lista de idiomas soportados.
- Capacidades especificas de ciberseguridad: es el dominio principal de calibracion declarado por el autor (trazas de seguridad y productos Aikido Attack, AI Code Analysis y Deep Review).
- Modo thinking, vision o audio: no disponibles; la model card no los menciona.

## Casos de uso

- Analisis de seguridad de codigo en produccion: el modelo se calibro con trazas de ciberseguridad y codigo, y Aikido lo usa en AI Code Analysis y Deep Review, por lo que encaja en revision automatica de repositorios con contexto largo de un solo paso.
- Revision de pull requests con contexto de repositorio completo: con 131.072 tokens de ventana se puede inyectar un arbol de ficheros amplio junto al diff y pedir deteccion de vulnerabilidades o regresiones sin trocear el contexto.
- Triaje de alertas SOC: la calibracion en ciberseguridad y su soporte de tool calling permiten encadenar consultas a APIs de SIEM o EDR y generar resumenes justificados de cada alerta.
- Asistente de desarrollo con agentes: 8 expertos activos por token y ~40B parametros activos dan un coste de inferencia muy inferior al del GLM-5.3 completo, adecuado para bucles de agente con muchas llamadas cortas.
- Generacion de codigo en pipelines de CI/CD: se puede servir con vLLM y `--tensor-parallel-size 4` para exponer una API compatible con OpenAI y consumirla desde tareas de revision, generacion de tests o parcheo automatico.
- Analisis de documentos tecnicos largos: informes de auditoria, RFC o expedientes de cumplimiento que caben en 128k tokens, con resumen extractivo y respuesta a preguntas sobre el contenido.
- Procesamiento de texto multilingue: la calibracion con Wikipedia multilingue permite tareas de traduccion o clasificacion en varios idiomas, aunque no hay evaluacion publicada por idioma.
- Despliegue on-premise con requisitos de soberania de datos: al ser pesos abiertos bajo licencia heredada de GLM-5.3, puede ejecutarse en infraestructura propia Hopper sin enviar codigo a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El unico dato cuantitativo de calidad es una medida de fidelidad frente al modelo completo, no un benchmark de tarea:

| Metrica | Valor | Contexto |
|---|---|---|
| Divergencia KL vs GLM-5.3 BF16 | 0.506 nats | Panel cerrado de 25 prompts, vocabulario completo de 154.000 tokens |
| Divergencia KL build EXL3 del mismo corte | 0.511 nats | Misma poda de 168 expertos, formato de cuantizacion distinto |
| Benchmarks de tareas (MMLU, HumanEval, etc.) | no disponible | No publicados por el autor |
| Throughput y latencia | no disponible | No publicados por el autor |

## Requisitos de hardware

- VRAM estimada: 328 GB solo de pesos, mas cache KV para contexto largo. La configuracion de referencia es 4x H200 (4 x 141 GB = 564 GB), que deja espacio para una cache KV de 128k tokens con lotes de produccion.
- GPU recomendadas: H100 o H200. La model card indica explicitamente que se requiere Hopper, ya que vLLM selecciona automaticamente el kernel Marlin MoE.
- Cabe en GPU de consumo: no. Con 328 GB de pesos no es viable en RTX 4090, RTX 5090 ni configuraciones consumer habituales, y el autor declara requisito Hopper frente a alternativas de gama profesional.
- Hardware usado para construir el modelo: 8x NVIDIA RTX PRO 6000 Blackwell (proceso de poda y calibracion, no inferencia documentada).
- Opciones de despliegue: vLLM con `vllm serve aikido/altar-1 --tensor-parallel-size 4 --trust-remote-code --max-model-len 131072` segun la model card. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no estan soportados con este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos por capa | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Altar-1 (AikidoSec) | 500,8B totales, ~40B activos | 168 de 256 | 131.072 tokens en vLLM | INT4 W4A16 AWQ (expertos enrutados), BF16 el resto | other (hereda GLM-5.3) | safetensors, 328 GB, 484 descargas, 16 likes |
| cyankiwi/GLM-5.3-AWQ-INT4 (base) | 753B (sin poda) | 256 de 256 | no disponible | INT4 W4A16 AWQ | heredada de GLM-5.3 | safetensors |
| 0xSero/GLM-5.3-569B-W4A16 | 569B | corte equivalente menos agresivo que Altar-1 | no disponible | W4A16 | heredada de GLM-5.3 | safetensors |
| 0xSero/GLM-5.3-500B-EXL3-3.0bpw | 500B | 168 de 256 (mismo corte) | no disponible | EXL3 3.0 bpw | heredada de GLM-5.3 | safetensors |
| zai-org/GLM-5.3 (original) | 753B totales, ~40B activos | 256 de 256 | no disponible | BF16 | licencia GLM-5.3 | safetensors |

Comparativa de rendimiento: no disponible. El unico dato comparativo publicado es la divergencia KL del build EXL3 equivalente (0.511 nats) frente a los 0.506 nats de Altar-1.

## Limitaciones y advertencias

- La licencia es "other" y hereda la de GLM-5.3; hay que revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia permisiva estandar.
- La poda elimina 88 expertos por capa sin reentrenamiento: la divergencia KL de 0.506 nats indica degradacion medible frente al modelo completo en BF16, no una replica exacta.
- No hay benchmarks de tareas publicados, por lo que las afirmaciones de calidad en codigo, ciberseguridad o razonamiento no son verificables con datos independientes.
- Riesgo de alucinacion inherente a un modelo generativo, agravado por la falta de evaluaciones publicadas de factualidad.
- La lista de idiomas soportados no esta documentada; la calibracion menciona ingles y Wikipedia multilingue, pero no hay garantia de cobertura por idioma.
- Restriccion de hardware dura: requiere Hopper (H100/H200) por el kernel Marlin MoE, lo que excluye GPUs consumer y buena parte de las instalaciones Ampere o Ada.
- No se publican pesos GGUF, de modo que los flujos habituales de llama.cpp u Ollama no pueden usarse con este artefacto.
- El autor invita a contactar por correo para despliegues empresariales, lo que sugiere que no hay soporte comunitario estructurado.
- En la model card, el comando de servido usa el identificador `aikido/altar-1`, distinto del ID del repositorio `AikidoSec/altar-1`; conviene verificar el identificador correcto al desplegar.
- Proyecto con creacion y ultima actualizacion en septiembre de 2026, 484 descargas y 16 likes: comunidad pequena y poca validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AikidoSec/altar-1
- Modelo base cuantizado: https://huggingface.co/cyankiwi/GLM-5.3-AWQ-INT4
- Modelo original GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Organizacion Z.AI / zai-org: https://huggingface.co/zai-org
- Paper de REAP: https://arxiv.org/abs/2510.13999
- Repositorio de Cerebras Research para REAP: https://github.com/CerebrasResearch/reap
- Build W4A16 de 569B de la misma poda: https://huggingface.co/0xSero/GLM-5.3-569B-W4A16
- Build EXL3 de 500B de la misma poda: https://huggingface.co/0xSero/GLM-5.3-500B-EXL3-3.0bpw
- Estudio de fidelidad: https://huggingface.co/datasets/0xSero/glm-5.3-reap-fidelity-study
- Observaciones del proceso de poda: https://huggingface.co/datasets/0xSero/glm-5.3-reap-observations-v1
- Contacto para despliegue: yannick@aikido.dev
- Producto Aikido Attack: https://www.aikido.dev/platform/attack
- Producto AI Code Analysis: https://www.aikido.dev/code/code-audit
- Documentacion de Deep Review: https://help.aikido.dev/deep-review/how-deep-review-works
