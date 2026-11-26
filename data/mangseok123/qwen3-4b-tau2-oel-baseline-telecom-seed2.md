# MANGSEOK123/qwen3-4b-tau2-oel-baseline-telecom-seed2

## Resumen

`qwen3-4b-tau2-oel-baseline-telecom-seed2` es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123. Se trata de un modelo de 4.022 millones de parametros (4B) orientado a la generacion de texto conversacional, entrenado especificamente sobre el dominio de telecomunicaciones del benchmark tau2-bench. Su proposito es servir como linea base (baseline) dentro de un experimento de internalizacion de habilidades (skill internalization), una tecnica que busca que el modelo aprenda a resolver tareas de agente sin necesidad de recibir la "experiencia" o "skill" en el prompt de sistema.

El entrenamiento combina destilacion auto-supervisada on-policy (OEL, del codebase LMOps) con un profesor congelado que dispone de la skill en el system prompt, aplicando divergencia KL inversa a nivel de token sobre el top-256 del alumno. Se trata de un experimento de investigacion con semilla 2, no de un modelo listo para produccion. La relevancia actual radica en que explora si un modelo pequeno puede interiorizar procedimientos de agente en dominios verticales (atencion al cliente de telefonia) sin depender de prompts largos en tiempo de inferencia.

El modelo se distribuye en formato safetensors con pesos BF16, tiene un tamano de repositorio de 8,1 GB y esta pensado para usarse con transformers y text-generation-inference. No se han publicado datos de licencia ni de idiomas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de aproximadamente 4.000 millones de parametros. El ajuste fino se realiza en modo "non-thinking" del modelo base, es decir, sin el modo de razonamiento extendido que Qwen3 incorpora. El entrenamiento se lleva a cabo sobre el dominio telecom de tau2-bench, con 8 cadenas de extraccion x 50 tareas y un limite de experiencia de 2048 tokens.

La innovacion tecnica principal es el esquema OEL (on-policy self-distillation) del codebase LMOps: el alumno resuelve cada tarea sin la skill ni la experiencia en el contexto (temperatura 0,7), mientras que una copia congelada del modelo inicial, que si recibe la skill en el system prompt, actua como profesor. La perdida es una KL inversa a nivel de token restringida al top-256 de tokens del alumno, con AdamW a learning rate constante de 3e-6, 8 pares por actualizacion y 1 epoca. El autor menciona tambien una variante Skill-GRPO basada en el entrenador SDAR (group size 8, lr 1e-6, low_var_kl 0,01, presupuesto de prompt de 16k), aunque la model card no aclara si esta semilla concreta la aplica. La evaluacion se realizo con tau2-bench v1.0.1 usando un simulador de usuario GPT-4.1-mini y con BFCL v3 mediante bfcl_eval 2025.6.14.

## Capacidades

- Generacion de texto conversacional multi-turno en el dominio de atencion al cliente de telecomunicaciones.
- Ejecucion de tareas de agente sobre tau2-bench telecom: gestion de planes, facturacion, incidencias y cambios de servicio (segun el diseno del benchmark).
- Internalizacion de procedimientos: el objetivo del entrenamiento es que el modelo resuelva las tareas sin la skill inyectada en el system prompt.
- Soporte de tool calling y function calling heredado de Qwen3-4B-Instruct-2507 (no verificado de forma independiente en esta ficha).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: no; el ajuste se realiza explicitamente en modo non-thinking.
- Vision y audio: no soportados (modelo de texto).

## Casos de uso

- Investigacion en internalizacion de habilidades: usar este checkpoint como linea base para comparar tecnicas (TANI, Source-only, Task aug, OEL) sobre el mismo dominio y semilla, midiendo la brecha entre el alumno sin skill y el profesor con skill.
- Atencion al cliente de telefonia: el modelo puede gestionar conversaciones multi-turno sobre planes, facturacion y soporte tecnico, aprovechando el ajuste especifico sobre tau2-bench telecom.
- Agentes de soporte con tool calling: integracion en un orquestador que exponga APIs de CRM o facturacion como herramientas, evaluando la tasa de exito de tareas multi-paso.
- Evaluacion de pipelines de agentes: servir como modelo de referencia para validar harness de evaluacion (tau2-bench v1.0.1, BFCL v3) antes de desplegar modelos mayores.
- Destilacion de profesores mayores: emplear el checkpoint como alumno en experimentos de self-distillation con un profesor mas capaz que disponga de la skill en contexto.
- Pruebas de regresion en dominios verticales: banco de pruebas de bajo coste (4B, BF16, ~8 GB) para medir degradacion al eliminar prompts de sistema largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona los harness utilizados (tau2-bench v1.0.1 con simulador GPT-4.1-mini y BFCL v3 con bfcl_eval 2025.6.14), pero no incluye cifras de rendimiento para esta semilla concreta.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4-5 GB de pesos; en 4 bits, en torno a 2,5-3 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para BF16 con contexto largo; RTX 3090/4080 para cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 sin problema; en RTX 3060 12 GB o superiores con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `endpoints_compatible` en el repo); llama.cpp/Ollama requeririan conversion a GGUF, no documentada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-baseline-telecom-seed2 | 4,02B | no disponible | Ajuste fino OEL sobre tau2-bench telecom | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible en esta ficha | Modelo base generalista con tool calling | no disponible en esta ficha | Hugging Face (modelo base) |
| Alternativas de 4B para agentes (p. ej. Llama 3.2 3B Instruct, Phi-3.5-mini) | 3-4B | 128k en algunos casos | Generalistas, sin ajuste vertical | licencias permisivas (MIT/Llama) | Hugging Face |

No se dispone de datos de rendimiento comparativo para esta semilla; la comparativa se limita a tamano, enfoque y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes: no hay validacion comunitaria ni evidencia de robustez en produccion.
- Entrenado exclusivamente sobre el dominio telecom de tau2-bench; el rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- Riesgo de alucinacion en datos de facturacion, planes o incidencias si se usa sin verificacion contra sistemas reales.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene verificar la licencia del modelo base Qwen3-4B-Instruct-2507 antes de cualquier despliegue.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto en castellano.
- Es una semilla concreta (seed 2) de un experimento; los resultados pueden no ser representativos de la tecnica en general.
- El ajuste se realiza en modo non-thinking, por lo que no se beneficia del razonamiento extendido de Qwen3.
- No se documentan sesgos especificos; al derivar de un modelo generalista, hereda los del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-baseline-telecom-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- tau2-bench (benchmark): no disponible en la informacion proporcionada
- Codebase LMOps (OEL): no disponible en la informacion proporcionada
- bfcl_eval (BFCL v3): no disponible en la informacion proporcionada
