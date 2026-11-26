# MANGSEOK123/qwen3-4b-tau2-oel-telecom-random74-seed2

## Resumen

qwen3-4b-tau2-oel-telecom-random74-seed2 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 (modo no-thinking) realizado por el usuario MANGSEOK123. El objetivo del entrenamiento es la internalizacion de habilidades conversacionales en el dominio de telecomunicaciones, usando como referencia el benchmark tau2-bench. Se trata, por tanto, de un modelo de investigacion orientado a evaluar tecnicas de destilacion on-policy y aprendizaje por refuerzo aplicadas a agentes conversacionales de atencion al cliente.

El modelo parte de la arquitectura Qwen3 de 4.022.468.096 parametros (aproximadamente 4 mil millones) y se distribuye en formato safetensors con pesos en BF16, con un tamano de repositorio de 8,1 GB. La tecnica central es una autodestilizacion on-policy (OEL) en la que un estudiante resuelve cada tarea sin la habilidad en el prompt y un profesor congelado (copia del modelo inicial) la resuelve con la habilidad inyectada en el system prompt, minimizando una KL inversa a nivel de token sobre el top-256 del estudiante.

Su relevancia es metodologica: documenta un pipeline concreto (pares fuente sin filtrar, semilla 2, 74 pares del dominio telecom) para estudiar como se internalizan habilidades sin necesidad de incluirlas en el contexto en tiempo de inferencia. No obstante, el modelo tiene 0 descargas y 0 likes, no declara licencia ni idiomas en la model card, y no publica resultados de benchmarks, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), modo no-thinking |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-4B-Instruct-2507 y se entrena en modo no-thinking. El ajuste fino se realiza sobre tau2-bench telecom con una configuracion "source-only baseline": 74 pares fuente sin filtrar y semilla de entrenamiento 2. La internalizacion se lleva a cabo mediante autodestilizacion on-policy con el codebase OEL (LMOps): el estudiante resuelve cada tarea sin la habilidad ni la experiencia en el contexto con temperatura T=0.7, mientras que una copia congelada del modelo inicial actua como profesor con la habilidad inyectada en el system prompt. La perdida es una KL inversa a nivel de token calculada sobre el top-256 de tokens del estudiante, optimizada con AdamW a learning rate constante de 3e-6, 8 pares por actualizacion y 1 epoca.

La model card menciona tambien una variante Skill-GRPO basada en GRPO con el entrenador SDAR (tamano de grupo 8, learning rate 1e-6, low_var_kl 0.01, presupuesto de prompt de 16k tokens), aunque no queda explicito si esta semilla concreta incorpora esa fase o solo la internalizacion OEL. La evaluacion declarada se realiza con tau2-bench v1.0.1 usando un simulador de usuario GPT-4.1-mini, y con BFCL v3 mediante bfcl_eval 2025.6.14, si bien no se aportan los resultados numericos de dichas evaluaciones.

## Capacidades

- Generacion de texto conversacional multi-turno en el dominio de atencion al cliente de telecomunicaciones.
- Ejecucion de tareas de agente segun el esquema de tau2-bench (interaccion con herramientas y politicas de dominio).
- Internalizacion de habilidades: el comportamiento entrenado deberia reproducirse sin necesidad de incluir la habilidad o la experiencia en el system prompt.
- Soporte de tool calling / function calling heredado de Qwen3-4B-Instruct-2507 (evaluado segun la model card con BFCL v3).
- Razonamiento en modo no-thinking (respuestas directas, sin cadena de pensamiento explicita).
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada; se heredarian las del modelo base.
- No se declaran capacidades de vision, audio ni thinking mode en esta ficha.

## Casos de uso

- Investigacion en internalizacion de habilidades: reproducir el pipeline OEL con el codebase LMOps para comparar la destilacion on-policy frente a tecnicas de prompt engineering en tareas de agente.
- Evaluacion de agentes conversacionales en telecomunicaciones: usar el modelo como estudiante en tau2-bench telecom v1.0.1 con un simulador de usuario GPT-4.1-mini para medir la tasa de exito en tareas de soporte (cambios de plan, resolucion de incidencias, gestion de cuenta).
- Baseline en estudios de ablacion: al ser una semilla concreta (seed 2) sobre 74 pares fuente sin filtrar, sirve como punto de comparacion frente a otras semillas y configuraciones del mismo autor.
- Prototipado de asistentes de soporte tecnico: desplegar el modelo en un entorno de pruebas para evaluar respuestas multi-turno sobre politicas de telefonia movil y fibra, sin exponerlo a usuarios reales.
- Evaluacion de tool calling: integrar el modelo en bfcl_eval 2025.6.14 para medir su capacidad de invocar funciones en escenarios de atencion al cliente.
- Docencia y formacion: utilizar el modelo como ejemplo practico de destilacion con KL inversa y GRPO en cursos de ajuste fino de LLM.
- Comparacion de metodologias: contrastar la internalizacion via OEL con la variante Skill-GRPO (SDAR) para determinar que enfoque retiene mejor la habilidad tras eliminar el contexto de ayuda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el uso de tau2-bench v1.0.1 (con simulador GPT-4.1-mini) y BFCL v3 (bfcl_eval 2025.6.14) como marcos de evaluacion, pero no incluye las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, alrededor de 10-12 GB para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB de pesos; en 4 bits, aproximadamente 2,5-3 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegues concurrentes; RTX 4090 (24 GB) para inferencia en BF16 con margen amplio.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080, RTX 3090 y, con cuantizacion de 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), vLLM, llama.cpp u Ollama previa conversion a GGUF (no se distribuyen pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-telecom-random74-seed2 | 4,02 B | no disponible | no disponible | Hugging Face (0 descargas) | Ajuste experimental sobre tau2-bench telecom |
| Qwen/Qwen3-4B-Instruct-2507 | ~4 B | no disponible en esta ficha | Apache 2.0 (segun el modelo base de Qwen) | Hugging Face, ampliamente distribuido | Modelo base; sin especializacion en telecom |
| Qwen/Qwen3-4B | ~4 B | 32.768 tokens (version original Qwen3-4B) | Apache 2.0 | Hugging Face, Ollama, vLLM | Modelo generalista con modo thinking |
| Modelos especializados en tau2-bench de otros autores | variable | variable | variable | Hugging Face | No se dispone de comparativas publicadas con este modelo concreto |

La comparacion cuantitativa de rendimiento no esta disponible porque el autor no publica resultados de tau2-bench ni de BFCL v3 para esta semilla.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar la mejora frente al modelo base ni frente a otras semillas.
- Licencia no declarada: no se puede confirmar el uso comercial; debe asumirse riesgo legal hasta que el autor la especifique.
- Idiomas no declarados: aunque el modelo base es multilingue, no hay garantia de comportamiento en castellano ni en otros idiomas distintos del ingles.
- Especializacion estrecha: entrenado exclusivamente en el dominio telecom de tau2-bench con 74 pares fuente, lo que limita su generalizacion fuera de ese dominio.
- Riesgo de sobreajuste a las tareas concretas del benchmark y al simulador de usuario GPT-4.1-mini usado en la evaluacion.
- Riesgo de alucinacion inherente a un modelo de 4 mil millones de parametros, especialmente en la invocacion de herramientas y en la aplicacion de politicas de negocio.
- Repositorio sin traccion (0 descargas, 0 likes) y creado en 2026: no hay evidencia de validacion por parte de la comunidad.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ); el despliegue en hardware limitado requiere conversion manual.
- El uso en produccion de atencion al cliente exigiria auditoria de sesgos, filtros de seguridad y validacion frente a politicas reales de la operadora.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-telecom-random74-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Coleccion Qwen3: https://huggingface.co/Qwen/Qwen3-4B
- tau2-bench (benchmark): https://github.com/sierra-research/tau2-bench
- Codebase OEL (LMOps): https://github.com/microsoft/LMOps
- BFCL (Berkeley Function Calling Leaderboard): https://github.com/ShishirPatil/gorilla/tree/main/berkeley-function-calling-leaderboard
- SDAR trainer: no disponible en la informacion proporcionada
