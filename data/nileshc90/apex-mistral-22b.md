# nileshc90/apex-mistral-22b

## Resumen

ApexMistral-22B es un ajuste fino (fine-tune) del modelo Codestral-22B-v0.1 de Mistral AI, publicado por el desarrollador independiente Nilesh Chakraborty (nileshc90) bajo licencia Apache 2.0. Se distribuye como una "suite de doble edición" que empaqueta dos variantes de comportamiento sobre la misma arquitectura base: ApexMistral-Coder-22B, orientada a síntesis de código y completado en editor mediante Fill-In-The-Middle (FIM), y ApexMistral-Think-22B, orientada a razonamiento arquitectónico con cadena de pensamiento explícita dentro de etiquetas `<think>...</think>`.

El modelo hereda la arquitectura transformer densa de Codestral-22B, con 22 000 millones de parámetros y una ventana de contexto nativa de 32 000 tokens según la documentación del modelo base. El autor lo posiciona específicamente para estaciones de trabajo con 36 GB de memoria unificada (Apple Silicon M4 Max / M2 Max), con un perfil de ejecución de aproximadamente 13,2 GB en cuantización Q4_K_M y 0,6 GB adicionales de caché KV en Q8_0, dejando más de 22 GB libres para el resto del entorno de desarrollo.

La relevancia del modelo reside en su enfoque en despliegue local para programadores: soporte nativo de FIM para autocompletado en IDE, integración documentada con Ollama, MLX y Continue.dev, y una política de muestreo basada en min-p para reducir la generación de paquetes o APIs inexistentes. No obstante, se trata de una publicación con cero descargas y cero likes en el momento de la ficha, sin benchmarks independientes verificables más allá de la cifra de HumanEval declarada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en Mistral Codestral 22B |
| Parametros totales | 22 000 millones (22B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32 000 tokens (heredado de Codestral-22B; no confirmado explícitamente en la model card del fine-tune) |
| Tipos de cuantizacion | Q4_K_M (perfil principal documentado), Q8_0 para caché KV; otras cuantizaciones GGUF no detalladas |
| Idiomas soportados | en, fr, de, es, it |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), GGUF (Ollama), MLX (Apple Silicon) |

## Arquitectura y entrenamiento

El modelo se construye sobre Codestral-22B-v0.1 de Mistral AI, un transformer decoder-only denso de 22 000 millones de parámetros entrenado originalmente por Mistral con soporte nativo de Fill-In-The-Middle y una ventana de contexto de 32 000 tokens. La model card del fine-tune no detalla el volumen de tokens de entrenamiento adicional, la composición del dataset de ajuste ni si se emplearon técnicas de RLHF, DPO o SFT supervisado. Tampoco se especifican hiperparámetros de entrenamiento, número de épocas ni metodología de alineación.

La innovación declarada por el autor no reside en la arquitectura, sino en la especialización de comportamiento: dos perfiles de inferencia diferenciados (Coder y Think) con configuraciones de muestreo distintas (temperatura 0,2 y top_p 0,95 para Coder; temperatura 0,6 y top_p 0,95 para Think), uso de min-p sampling dinámico (0,04 y 0,05 respectivamente) para truncar la cola de tokens de baja probabilidad, y una instrucción de "humildad epistémica" en la edición Think que fuerza al modelo a rechazar la invención de APIs o paquetes inexistentes. El soporte FIM se hereda de la tokenización nativa de Codestral con marcadores `[PREFIX]`, `[SUFFIX]` y `[MIDDLE]`.

## Capacidades

- Generación de código en más de 80 lenguajes de programación según el autor, con especial énfasis en Python, C++, Rust, Go, TypeScript, Java, Bash, SQL y Swift.
- Fill-In-The-Middle (FIM) nativo para autocompletado quirúrgico en editor, sin reescribir ficheros completos.
- Razonamiento paso a paso con cadena de pensamiento explícita en la edición Think, delimitada por etiquetas `<think>...</think>`.
- Razonamiento arquitectónico y de diseño de sistemas, con énfasis en invariantes algorítmicos.
- Generación de código determinista y con anotaciones de tipo en la edición Coder, sin "charla conversacional".
- Capacidades multilingües en inglés, francés, alemán, español e italiano.
- Integración con herramientas de desarrollo: Ollama, MLX (Apple Silicon), Continue.dev, VS Code.
- Compatibilidad con endpoints OpenAI (`endpoints_compatible` según los tags de Hugging Face).
- Soporte de tool calling / function calling: no documentado explícitamente en la model card.
- Soporte de agentes multi-paso: no documentado explícitamente; la edición Think sugiere razonamiento multi-paso, pero sin infraestructura de agentes descrita.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Autocompletado en IDE con FIM: la edición Coder puede configurarse como `tabAutocompleteModel` en Continue.dev apuntando a un endpoint local de Ollama, aprovechando la tokenización FIM nativa para completar fragmentos dentro de funciones existentes sin reescribir el fichero completo.
- Asistente de refactorización local: con 13,2 GB en Q4_K_M sobre una máquina de 36 GB de RAM unificada, el modelo puede mantener conversaciones multi-turno sobre un repositorio mediano mientras el IDE, Docker y el navegador permanecen abiertos sin swap.
- Revisión de diseño de sistemas: la edición Think, con temperatura 0,6 y CoT explícito, es adecuada para generar análisis de trade-offs arquitectónicos, invariantes de algoritmos y justificaciones de decisiones técnicas antes de emitir código.
- Generación de tests y código boilerplate multi-lenguaje: el soporte declarado de más de 80 lenguajes permite generar stubs, tests unitarios y código de integración en stacks políglotas (por ejemplo, backend Go con frontend TypeScript y scripts Bash).
- Formación y prototipado en entornos con restricciones de privacidad: al ejecutarse íntegramente en local vía Ollama o MLX, el modelo es apto para equipos que no pueden enviar código propietario a APIs en la nube.
- Desarrollo en Apple Silicon sin GPU dedicada: el perfil MLX documentado (`scripts/serve_mlx_mistral.sh`) permite servir un endpoint compatible con OpenAI en `http://127.0.0.1:8083/v1` aprovechando la GPU Metal del M4 Max / M2 Max.
- Migración y traducción de código entre lenguajes: la combinación de FIM y cobertura multi-lenguaje permite tareas de traducción de fragmentos (por ejemplo, Python a Rust) manteniendo estructura y tipos.

## Benchmarks y rendimiento

| Benchmark | ApexMistral-22B | Notas |
|---|---|---|
| HumanEval | 86,6 % | Cifra declarada por el autor en la model card; no verificada de forma independiente |
| MMLU | no disponible | — |
| GSM8K | no disponible | — |
| MBPP | no disponible | — |
| MultiPL-E | no disponible | — |

No se han publicado resultados de benchmarks adicionales ni verificables de forma independiente en la información disponible. La única cifra aportada (HumanEval 86,6 %) procede de la propia model card del autor y debe tratarse con cautela dado que el modelo no cuenta con evaluaciones externas ni réplica reproducible documentada.

## Requisitos de hardware

- VRAM / RAM estimada para inferencia: aproximadamente 13,2 GB en cuantización Q4_K_M, más 0,6 GB de caché KV en Q8_0, para un total de runtime de ~13,8 GB.
- Perfil objetivo: estaciones de trabajo con 36 GB de memoria unificada (Apple Silicon M4 Max / M2 Max), con más de 22 GB libres para el resto del sistema.
- GPU recomendadas: no se especifican GPU NVIDIA o AMD en la model card; el enfoque documentado es Apple Silicon con Metal vía MLX. Para CUDA sería necesario validar el despliegue con llama.cpp o vLLM, no documentado por el autor.
- ¿Cabe en GPU consumer?: en Q4_K_M (~13,2 GB) encajaría teóricamente en GPUs con 16 GB o más de VRAM (RTX 4080, RTX 4090, RTX 5080), aunque el autor no documenta este escenario ni proporciona cifras de throughput en CUDA.
- Opciones de despliegue documentadas: Ollama (`ollama run apex-mistral-coder-22b` / `apex-mistral-think-22b`), MLX con endpoint compatible OpenAI, transformers (librería declarada). vLLM y TGI no se mencionan.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | HumanEval | Disponibilidad |
|---|---|---|---|---|---|
| ApexMistral-22B | 22B | 32k (heredado) | Apache 2.0 | 86,6 % (declarado) | Hugging Face, Ollama, MLX |
| Codestral-22B-v0.1 (base) | 22B | 32k | MNPL (no comercial) | no disponible en esta ficha | Hugging Face, Mistral API |
| DeepSeek-Coder-33B | 33B | 16k (versión base) | Permisiva con restricciones | no disponible en esta ficha | Hugging Face |
| CodeLlama-34B | 34B | 16k | Llama 2 custom | no disponible en esta ficha | Hugging Face |

El cambio de licencia respecto al modelo base es el diferenciador más relevante: Codestral-22B-v0.1 se distribuye bajo Mistral Non-Production License (MNPL), mientras que este fine-tune declara Apache 2.0, lo que en teoría habilita uso comercial. Esta reclasificación de licencia sobre un modelo derivado es un punto que conviene verificar legalmente antes de uso en producción, ya que la licencia del modelo base puede imponer restricciones sobre los derivados.

## Limitaciones y advertencias

- La cifra de HumanEval 86,6 % procede únicamente de la model card del autor y no cuenta con verificación independiente ni réplica reproducible.
- El modelo tiene cero descargas y cero likes en Hugging Face en el momento de la ficha, sin comunidad ni validación externa.
- La licencia declarada es Apache 2.0, pero el modelo base Codestral-22B-v0.1 se distribuye bajo Mistral Non-Production License; la relicenciación de un derivado debe validarse legalmente antes de uso comercial.
- No se documenta el dataset de ajuste, el volumen de tokens de entrenamiento ni la metodología de alineación (SFT, DPO, RLHF), lo que dificulta evaluar riesgos de sobreajuste o regresiones respecto al base.
- Riesgo de alucinación de APIs y paquetes: el autor afirma mitigarlo con min-p sampling y una instrucción de "humildad epistémica" en la edición Think, pero no aporta métricas de tasa de alucinación.
- Idiomas soportados limitados a en, fr, de, es, it; sin cobertura documentada de otros idiomas.
- El perfil de hardware documentado está orientado a Apple Silicon; el rendimiento en CUDA (NVIDIA) no está validado ni cuantificado.
- No se documenta soporte explícito de tool calling ni de infraestructura de agentes multi-paso, pese a los tags de Hugging Face.
- La fecha de creación del repositorio (2026-11-06) y la ausencia de actividad posterior deben considerarse al evaluar el mantenimiento del proyecto.
- Sin garantías de soporte, actualizaciones ni corrección de errores por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nileshc90/apex-mistral-22b
- Repositorio GitHub: https://github.com/nileshchakraborty/apex-mistral-22b
- Modelo base Codestral-22B-v0.1: https://huggingface.co/mistralai/Codestral-22B-v0.1
- Anuncio de Codestral en Mistral AI: https://mistral.ai/news/codestral/
- Modelo relacionado ApexCode-14B: https://huggingface.co/nileshc90/apex-code-14b-instruct
- Modelo relacionado ApexThink-14B: https://huggingface.co/nileshc90/apex-think-14b
- Modelo relacionado ApexPhi-14B: https://huggingface.co/nileshc90/apex-phi-14b
