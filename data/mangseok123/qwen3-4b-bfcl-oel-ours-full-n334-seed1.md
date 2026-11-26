# MANGSEOK123/qwen3-4b-bfcl-oel-ours-full-n334-seed1

## Resumen

`MANGSEOK123/qwen3-4b-bfcl-oel-ours-full-n334-seed1` es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 (modo no-thinking) orientado a la internalizacion de habilidades para llamadas a funciones (tool calling) en escenarios conversacionales multi-turno. Lo desarrolla el usuario MANGSEOK123 y se publica en Hugging Face con 0 descargas y 0 likes en el momento de la consulta, lo que indica un experimento de investigacion mas que un modelo listo para produccion.

El problema que aborda es concreto: en lugar de inyectar la descripcion de la herramienta o la "experiencia" en el system prompt en cada turno, el modelo aprende a comportarse como si la tuviera internalizada. Para ello se usa destilacion on-policy (OEL, del codebase LMOps) con un profesor congelado que si dispone de la habilidad en el prompt, y se complementa con una fase de Skill-GRPO. El conjunto de entrenamiento son 334 pares tarea-habilidad derivados de BFCL-v3 multi-turno.

Arquitectura transformer densa de Qwen3 con 4.022.468.096 parametros (4B), pesos en BF16 y un repositorio de 8,1 GB. No se declaran ni licencia ni idiomas soportados en la model card, y no se publican resultados numericos de benchmarks, por lo que la evaluacion cuantitativa queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), modo no-thinking |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-4B-Instruct-2507, valor no confirmado) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Libreria | transformers |
| Tamano del repo | 8,1 GB |
| Fecha de creacion | 2026-11-26 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507 en modo no-thinking, un transformer denso de 4B parametros. Sobre esa base se aplica un pipeline de internalizacion de habilidades (TANI / Source-only / Task aug / OEL) mediante destilacion on-policy con el codebase OEL de LMOps. En cada actualizacion, el estudiante resuelve la tarea sin la habilidad ni la experiencia en el contexto (temperatura 0,7) y un profesor, copia congelada del modelo inicial, la resuelve con la habilidad inyectada en el system prompt. La perdida es una KL inversa a nivel de token restringida al top-256 del estudiante, optimizada con AdamW a learning rate 3e-6 constante, 8 pares por actualizacion y 1 epoca.

El dataset de entrenamiento son 334 pares tarea-habilidad extraidos de BFCL-v3 multi-turno (bfcl_eval 2025.6.14). Ademas del objetivo de destilacion, se menciona una fase de Skill-GRPO con el entrenador SDAR: GRPO con tamano de grupo 8, learning rate 1e-6, `low_var_kl` 0,01 y un presupuesto de prompt de 16k tokens. La evaluacion se realiza con tau2-bench v1.0.1 usando un simulador de usuario GPT-4.1-mini y con BFCL v3. No se detalla la composicion completa del dataset ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del base Qwen3-4B-Instruct-2507.
- Tool calling / function calling en escenarios multi-turno de BFCL-v3, con la habilidad internalizada en los pesos en lugar de depender del system prompt.
- Razonamiento en modo no-thinking (el ajuste se realiza explicitamente sobre el modo no-thinking del base).
- Internalizacion de habilidades (skill internalization): el modelo aprende a aplicar una herramienta o procedimiento sin que se le describa en cada turno.
- Soporte de agentes y razonamiento multi-paso en la medida en que lo permita el base, aunque no se documentan capacidades adicionales especificas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio y thinking mode extendido: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de atencion al cliente con tool calling: el modelo puede gestionar conversaciones multi-turno invocando funciones (consultas de pedidos, cambios de estado) sin necesidad de repetir el esquema de la herramienta en cada turno, lo que reduce el consumo de contexto.
- Automatizacion de flujos internos con APIs: al tener las habilidades internalizadas, se puede desplegar con system prompts mas cortos y estables, simplificando el versionado de prompts en produccion.
- Investigacion en destilacion on-policy: sirve como referencia reproducible (seed 1, 334 pares) para estudiar la internalizacion de habilidades frente a la inyeccion en contexto.
- Evaluacion comparativa de BFCL-v3: util como baseline afinado para medir la brecha entre modelos con habilidad en prompt y modelos con habilidad internalizada.
- Prototipado de asistentes de dominio con recursos limitados: con 4B parametros en BF16 (8,1 GB) cabe en una GPU de 24 GB y permite iterar rapido en entornos de desarrollo.
- Experimentos de GRPO sobre tareas de tool calling: la configuracion Skill-GRPO documentada (grupo 8, lr 1e-6) sirve de punto de partida para reproducir o extender el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona los entornos de evaluacion (BFCL v3 con bfcl_eval 2025.6.14 y tau2-bench v1.0.1 con simulador GPT-4.1-mini) pero no incluye cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 10 y 14 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB de pesos; en 4 bits, en torno a 2,5-3 GB (estimaciones teoricas, no verificadas con este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con throughput alto; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantizacion, en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp y Ollama no se mencionan explicitamente y requeririan conversion a GGUF para los dos ultimos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-bfcl-oel-ours-full-n334-seed1 | 4,02B | no disponible | Tool calling multi-turno con skill internalization (OEL + Skill-GRPO) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | no disponible en esta ficha | Instruct generalista, tool calling estandar | no disponible en esta ficha | Hugging Face, ampliamente usado |
| Alternativas de 4B para tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo ni de comparativas numericas con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No se declara licencia en la model card; el uso comercial queda sin garantia juridica hasta que el autor la especifique.
- No se declaran idiomas soportados; el comportamiento multilingue no esta verificado.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al base en BFCL-v3 ni en tau2-bench.
- Entrenado sobre solo 334 pares tarea-habilidad y 1 epoca: riesgo de sobreajuste al conjunto de tareas de BFCL-v3 y de escasa generalizacion a herramientas fuera de distribucion.
- Modelo experimental con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Riesgo de alucinacion inherente a los modelos de 4B, especialmente en cadenas de tool calling largas.
- El ajuste se hace en modo no-thinking; el comportamiento en modo thinking del base no esta cubierto.
- La evaluacion con simulador GPT-4.1-mini introduce dependencia de un modelo externo y posible sesgo del simulador.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-bfcl-oel-ours-full-n334-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Codebase OEL (LMOps): no disponible en la informacion proporcionada
- Entrenador SDAR: no disponible en la informacion proporcionada
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la informacion proporcionada
- tau2-bench: no disponible en la informacion proporcionada
