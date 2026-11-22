# aideedamsyar/chaperone-qwen3-4b

## Resumen

Chaperone (Qwen3-4B) es un adaptador LoRA de 126 MiB construido sobre el modelo base Qwen3-4B de Alibaba, desarrollado por el usuario aideedamsyar. No es un modelo generativo al uso: se trata de un clasificador de seguridad orientado a agentes de programación, diseñado para evaluar cada llamada a herramienta (comando de shell, escritura o edición de fichero, o cualquier tool call estructurada) que un agente propone ejecutar, contrastándola con las reglas en lenguaje natural del propietario. Devuelve probabilidades para tres decisiones —ALLOW, ASK (devolver la decisión al propietario) y BLOCK— en un único forward pass.

La relevancia del modelo reside en su planteamiento de aislamiento: Chaperone nunca ve la conversación del agente, solo las reglas del propietario y la acción propuesta. Esto evita que una sesión larga o un mecanismo de compactación de contexto pueda desplazar las reglas fuera de la ventana de atención del modelo, un fallo documentado en agentes de código. El adaptador se distribuye bajo licencia Apache 2.0 y requiere el modelo base Qwen3-4B para funcionar.

El modelo se publica junto a un paper titulado *I Told You Not To: Coding Agents Break Owner Rules They Can Still See* (2026), actualmente con identificador de arXiv pendiente de asignación. Existe también una variante de 0,6B pensada para entornos sin GPU, ya que la versión de 4B resulta demasiado lenta en CPU para uso interactivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen3-4B |
| Parametros totales | 4B (modelo base); adaptador LoRA de 126 MiB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | no disponible; la model card menciona ejecución en 8-bit en CPU |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Chaperone es un adaptador LoRA acoplado a Qwen3-4B, un transformer decoder de 4.000 millones de parámetros. El adaptador se fusiona con el modelo base mediante `merge_and_unload()` para la inferencia. La clasificación no se realiza generando texto, sino leyendo el estado oculto en posiciones concretas del prompt y proyectándolo contra las filas de la matriz de embeddings de salida correspondientes a los tokens ALLOW, ASK y BLOCK, aplicando después una softmax con temperatura configurable. El prompt se reconstruye de forma determinista a partir de `chaperone_config.json`, que contiene el system prompt, la instrucción, los identificadores de tokens de respuesta y las reglas internas (house rules); estos strings no deben modificarse porque el modelo fue entrenado sobre ellos literalmente.

El entrenamiento se orienta a la tarea de evaluación de tool calls contra reglas en lenguaje natural, con slots por regla (identificadores R0001, R0002, etc.) y un slot FINAL para la decisión global. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal; la innovación principal es el diseño de evaluación fuera de la conversación del agente.

## Capacidades

- Clasificación de llamadas a herramientas en tres clases (ALLOW, ASK, BLOCK) con probabilidades calibradas por regla y una decisión final agregada.
- Evaluación de comandos de shell, escrituras y ediciones de ficheros, y tool calls estructuradas con argumentos JSON.
- Procesamiento de reglas del propietario en lenguaje natural, con soporte de múltiples reglas identificadas por slot.
- Contexto opcional por acción: petición del usuario, origen de la instrucción, permisos del agente, sensibilidad del dato y reversibilidad.
- Mecanismo de deferral: si la probabilidad de la decisión ganadora queda por debajo de un umbral configurable, la decisión se devuelve al propietario (ASK).
- Soporte de house rules adicionales configurables por el operador.
- Inferencia en un único forward pass, sin generación autorregresiva.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Guardrail para agentes de programación autónomos: Chaperone se interpone entre el agente y la ejecución de cada tool call, bloqueando comandos que violen las reglas del propietario (por ejemplo, escrituras fuera del repositorio o borrados recursivos) antes de que se materialicen.
- Protección frente a secuestro de reglas por contexto largo: al evaluar fuera de la conversación, resulta adecuado en sesiones extensas donde las instrucciones del propietario podrían quedar desplazadas o resumidas por compactación de contexto.
- Política de escritura de ficheros en pipelines de CI/CD: el adaptador puede puntuar ediciones propuestas por agentes sobre ficheros sensibles (configuración, secretos, infraestructura) y exigir aprobación humana cuando la probabilidad de ALLOW sea baja.
- Supervisión de comandos de shell en entornos de desarrollo: cada comando propuesto se clasifica contra reglas como "no ejecutar comandos de red" o "no tocar el directorio home", con decisiones de bloqueo o escalado.
- Escalado selectivo a revisión humana: gracias al umbral de deferral, el sistema puede derivar automáticamente al propietario solo las acciones ambiguas, reduciendo la carga de revisión manual en operaciones rutinarias.
- Auditoría de políticas en agentes desplegados: el desglose de probabilidades por regla permite registrar qué norma concreta motivó cada bloqueo, útil para trazabilidad y ajuste de políticas.
- Filtrado previo en entornos sin GPU: la variante de 0,6B del mismo autor permite aplicar el mismo esquema de clasificación en servidores sin acelerador, a costa de mayor latencia.

## Benchmarks y rendimiento

La model card reporta un resultado principal en un test emparejado del mismo día sobre un agente de programación real (OpenClaw con gpt-oss-120b, sesiones reservadas):

| Metrica | Sin Chaperone | Con Chaperone |
|---|---|---|
| Ejecuciones que violaron una regla del propietario | 11 de 20 | 2 de 20 |
| Ejecuciones con dano | 8 de 20 | 0 de 20 |

| Metrica de latencia | Valor |
|---|---|
| Mediana por comprobacion en GPU (test en vivo) | 45 ms |
| Mediana por comprobacion en CPU, 1 nucleo, 8-bit | 18,3 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 126 MiB, pero requiere cargar el modelo base Qwen3-4B. En bfloat16 el modelo base ocupa aproximadamente 8 GB de VRAM; en 8-bit, alrededor de 4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3090, RTX 4090, A100, H100). Para 8-bit basta con GPUs de 4-6 GB.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4070, RTX 4090 y similares en bfloat16; en GPUs de 6-8 GB conviene cuantizar.
- Opciones de despliegue: el código de referencia usa `transformers` + `peft` con fusión del adaptador. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: mediana de 45 ms por comprobación en GPU en el test en vivo del autor; 18,3 s por llamada en CPU de un solo núcleo en 8-bit, lo que desaconseja su uso interactivo sin acelerador. Para entornos sin GPU se recomienda la variante de 0,6B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chaperone (Qwen3-4B) | 4B base + LoRA 126 MiB | no disponible | Clasificador de tool calls (ALLOW/ASK/BLOCK) | Apache 2.0 | Hugging Face |
| Chaperone (Qwen3-0.6B) | 0,6B base + LoRA | no disponible | Igual, para entornos sin GPU | Apache 2.0 | Hugging Face |
| Qwen3-4B (base) | 4B | no disponible | LLM generativo de propósito general | Apache 2.0 | Hugging Face |
| Clasificadores de guardrail genéricos | variable | no disponible | Moderación de contenido | variable | variable |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; las reglas del propietario deben redactarse en ese idioma.
- No detecta violaciones cuyo daño depende de la tarea concreta, según reconoce el propio autor.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración errónea: una probabilidad alta de ALLOW no garantiza ausencia de daño.
- El prompt, la instrucción, los identificadores de tokens y las house rules deben usarse verbatim desde `chaperone_config.json`; modificarlos degrada el rendimiento porque el modelo fue entrenado sobre esas cadenas exactas.
- En CPU resulta demasiado lento para uso interactivo (18,3 s por llamada); se recomienda GPU o la variante de 0,6B.
- El resultado principal proviene de un test de 20 ejecuciones en un único agente y modelo (OpenClaw, gpt-oss-120b); la generalización a otros agentes o modelos no está documentada.
- El paper asociado tiene identificador de arXiv pendiente (ARXIV_ID_TBD), por lo que la revisión por pares no está confirmada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-4B arrastra sus propias condiciones, que deben verificarse por separado.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aideedamsyar/chaperone-qwen3-4b
- Variante de 0,6B: https://huggingface.co/aideedamsyar/chaperone-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper: *I Told You Not To: Coding Agents Break Owner Rules They Can Still See* (2026), https://arxiv.org/abs/ARXIV_ID_TBD (identificador pendiente)
