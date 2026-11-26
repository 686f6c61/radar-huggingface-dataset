# MANGSEOK123/qwen3-4b-tau2-oel-telecom-setting4-n91-seed2

## Resumen

qwen3-4b-tau2-oel-telecom-setting4-n91-seed2 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 (modo no-thinking) orientado especificamente al dominio de telecomunicaciones y al benchmark tau2-bench. Lo desarrolla el usuario MANGSEOK123 y su proposito es estudiar la internalizacion de habilidades (skill internalization) en tareas de atencion al cliente con herramientas, un area donde los modelos pequenos suelen fallar al depender de instrucciones largas en el system prompt.

El modelo parte de la arquitectura transformer densa de Qwen3 con 4.022.468.096 parametros (aproximadamente 4B) y se entrena sobre 91 pares tarea-habilidad del escenario telecom de tau2-bench, con semilla de entrenamiento 2. La tecnica central es una autodestilizacion on-policy con el framework OEL (LMOps): el estudiante resuelve cada tarea sin la habilidad en el contexto y un profesor congelado (copia del modelo inicial) la resuelve con la habilidad inyectada en el system prompt, minimizando la KL inversa a nivel de token sobre el top-256 del estudiante.

Es relevante como pieza de investigacion reproducible: combina internalizacion por destilacion y Skill-GRPO sobre un modelo compacto, con evaluacion declarada en tau2-bench v1.0.1 y BFCL v3. No obstante, el repositorio tiene 0 descargas, no publica licencia ni idiomas, y no incluye resultados numericos de benchmarks en la informacion disponible, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), modo no-thinking |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-4B-Instruct-2507 en su variante no-thinking, con aproximadamente 4.022 millones de parametros en BF16. El ajuste fino se realiza en dos fases segun la model card: primero una internalizacion de habilidades mediante autodestilizacion on-policy con el codebase OEL (LMOps), donde el estudiante afronta cada tarea sin la habilidad ni la experiencia en contexto (temperatura 0,7) y un profesor congelado, copia del modelo inicial, la resuelve con la habilidad en el system prompt; la perdida es una KL inversa a nivel de token restringida al top-256 del estudiante, con AdamW a learning rate constante de 3e-6, 8 pares por actualizacion y 1 epoca. La segunda fase es Skill-GRPO, un entrenamiento con refuerzo (GRPO) usando el trainer SDAR con tamano de grupo 8, learning rate 1e-6, low_var_kl 0,01 y un presupuesto de prompt de 16k tokens.

Los datos de entrenamiento corresponden al escenario telecom de tau2-bench con 91 pares tarea-habilidad y semilla 2, es decir, un conjunto pequeno y muy especifico de dominio. No se documenta el numero total de tokens vistos ni la composicion completa del dataset mas alla de esa referencia. La innovacion tecnica destacable es la combinacion de destilacion on-policy con KL inversa sobre top-256 y GRPO para consolidar habilidades de uso de herramientas dentro de los pesos del modelo, en lugar de depender de prompts extensos. La evaluacion declarada usa tau2-bench v1.0.1 con un simulador de usuario GPT-4.1-mini y BFCL v3 mediante bfcl_eval 2025.6.14.

## Capacidades

- Generacion de texto conversacional multi-turno en el dominio de telecomunicaciones (atencion al cliente, gestion de incidencias, consultas de cuenta).
- Uso de herramientas y function calling, entrenado explicitamente sobre tareas de tau2-bench que requieren invocar APIs y completar flujos de negocio.
- Razonamiento multi-paso orientado a agentes: resolucion de tareas que combinan varias llamadas a herramientas y verificacion de estado.
- Internalizacion de habilidades: el modelo esta disenado para ejecutar tareas sin necesidad de incluir la habilidad o experiencia detallada en el system prompt.
- Modo no-thinking de Qwen3, lo que implica respuestas directas sin cadena de razonamiento explicita.
- Capacidades multilingues: no disponibles de forma declarada; el entrenamiento se centra en el escenario telecom de tau2-bench.
- No se declaran capacidades de vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Atencion al cliente en operadoras de telecomunicaciones: el modelo puede gestionar conversaciones multi-turno sobre facturacion, cambios de plan o incidencias tecnicas, apoyandose en tool calling para consultar y modificar el estado del cliente.
- Automatizacion de flujos de soporte con APIs: al haber sido entrenado sobre tareas de tau2-bench telecom, encaja en pipelines donde el agente debe encadenar llamadas a herramientas (consultar saldo, abrir ticket, aplicar credito) y verificar el resultado.
- Prototipado de agentes de dominio vertical: sirve como base para experimentar con internalizacion de habilidades en entornos con pocas tareas y system prompts largos, reduciendo la dependencia de instrucciones extensas.
- Investigacion en destilacion y RL: util como referencia reproducible para comparar autodestilizacion on-policy (OEL) frente a Skill-GRPO en modelos de 4B.
- Evaluacion de agentes con tau2-bench: puede emplearse como modelo candidato en harness de evaluacion con simulador de usuario para medir tasas de exito en tareas telecom.
- Despliegue ligero en entornos con recursos limitados: con 4B parametros en BF16 cabe en GPUs de gama alta de consumo, lo que permite pruebas locales de agentes conversacionales sin infraestructura dedicada.
- Generacion de respuestas de soporte asistidas: borradores de respuestas para agentes humanos en mesas de ayuda, con contexto de la cuenta y del historial de incidencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluacion se realiza con tau2-bench v1.0.1 (simulador de usuario GPT-4.1-mini) y BFCL v3 (bfcl_eval 2025.6.14), pero no incluye cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 12-16 GB para contextos moderados.
- Cuantizacion a 8 bits: alrededor de 4-5 GB de pesos, viable en GPUs de 8 GB.
- Cuantizacion a 4 bits: alrededor de 2,5-3 GB de pesos, viable en GPUs de 6-8 GB.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para despliegue con concurrencia; RTX 4090, RTX 3090, RTX 4080 para inferencia individual.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en BF16 y en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (tag endpoints_compatible), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen3-4b-tau2-oel-telecom-setting4-n91-seed2 | 4,02B | no disponible | no disponible | Ajuste fino sobre tau2-bench telecom con destilacion OEL y Skill-GRPO |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | no disponible en esta ficha | licencia Qwen (consultar repositorio original) | Modelo generalista de instrucciones, modo no-thinking |
| Qwen3-4B (thinking) | ~4B | no disponible en esta ficha | licencia Qwen (consultar repositorio original) | Modelo generalista con modo de razonamiento explicito |
| Otros ajustes de tau2-bench | variable | variable | variable | Modelos especializados en agentes de dominio; no se dispone de comparativa numerica |

No se dispone de resultados de benchmarks del modelo para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y sin licencia declarada: no se puede asumir permiso de uso comercial; hay que contactar con el autor o consultar el repositorio del modelo base.
- Entrenado exclusivamente sobre el escenario telecom de tau2-bench (91 pares tarea-habilidad), lo que limita su generalizacion fuera de ese dominio.
- Riesgo de sobreajuste a los flujos y APIs concretos del benchmark; el comportamiento en produccion con herramientas reales puede degradarse.
- No se declaran idiomas soportados; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion en la invocacion de herramientas y en datos de cuentas o incidencias, especialmente fuera de la distribucion de entrenamiento.
- Longitud de contexto no documentada; no se debe asumir la ventana nativa de Qwen3 sin verificacion.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base.
- El modo no-thinking elimina la cadena de razonamiento explicita, lo que puede afectar a tareas que requieren planificacion compleja.
- No se han publicado pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-telecom-setting4-n91-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- tau2-bench (referencia del benchmark): no disponible en la informacion proporcionada
- OEL / LMOps (codebase de destilacion): no disponible en la informacion proporcionada
- BFCL v3 / bfcl_eval: no disponible en la informacion proporcionada
