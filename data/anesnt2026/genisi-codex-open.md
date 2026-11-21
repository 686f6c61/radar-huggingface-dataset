# AnesNT2026/Genisi-Codex-Open

## Resumen

Genisi Codex Open es un modelo de pesos abiertos de 9.653.104.368 parámetros (9,65 mil millones, denso) publicado por AnesNT2026 en Hugging Face, presentado por su autor como un modelo fundacional orientado a ingeniería de software autónoma y generación de código full-stack. Se distribuye bajo licencia MIT, con soporte declarado de tres idiomas (árabe, inglés y francés) y una ventana de contexto nativa de 262.144 tokens (256K), con hasta 32.768 tokens de salida. La arquitectura declarada en los tags es `qwen3_5` y el pipeline registrado es `image-text-to-text`, aunque la model card solo documenta uso de texto mediante `AutoModelForCausalLM`.

El modelo se presenta como un proyecto de investigación independiente desarrollado desde cero por AnesNT, un proyecto argelino de la provincia de Batna. La propuesta de valor se centra en el razonamiento arquitectónico nativo mediante bloques `<think>...</think>`, el uso universal de herramientas (tool calling) y el rendimiento en tareas de resolución de incidencias en repositorios reales, con cifras declaradas en SWE-bench Verified, SWE-bench Pro, NL2Repo, MCP-Atlas, GPQA Diamond y Terminal-Bench.

Es relevante ahora porque combina un tamaño contenido (9,65B) con contexto de 256K y orientación explícita a agentes de código, un perfil que encaja en despliegues con una o dos GPU de gama alta. No obstante, el repositorio no tiene descargas ni likes en el momento de la consulta y la información técnica disponible es la que publica el propio autor, sin documentación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia `qwen3_5` (según tags); pipeline `image-text-to-text` |
| Parametros totales | 9.653.104.368 (9,65B; la model card indica 9,46B densos) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | ar, en, fr |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La información disponible describe un modelo denso de 9,46B parámetros con arquitectura de transformer, etiquetado en Hugging Face dentro de la familia `qwen3_5`. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidad multimodal de entrada (imagen y texto), aunque la model card no detalla el codificador visual ni el esquema de fusión de modalidades. El contexto nativo es de 262.144 tokens y la generación máxima de salida de 32.768 tokens.

El autor declara que el modelo fue entrenado "from the ground up", con razonamiento nativo encapsulado en etiquetas `<think>...</think>` para planificación arquitectónica y verificación multi-turno. No se publican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o RL verificable. Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal. Todos estos extremos deben considerarse no verificados.

## Capacidades

- Generación de código full-stack y resolución autónoma de incidencias en repositorios (orientación SWE-bench).
- Razonamiento profundo con modo de pensamiento nativo mediante bloques `<think>...</think>` y verificación multi-turno.
- Tool calling universal, con compatibilidad declarada con servidores MCP (benchmark MCP-Atlas).
- Operación como agente multi-paso en terminal y entornos de línea de comandos (Terminal-Bench).
- Contexto largo de 256K tokens para trabajar sobre repositorios completos y trazas extensas.
- Multilingüismo en árabe, inglés y francés, tanto en prompts como en generación.
- Pipeline `image-text-to-text`: entrada de imagen y texto según el registro en Hugging Face.
- Conversacional (tag `conversational`) y compatible con endpoints (`endpoints_compatible`).

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir el árbol del proyecto, los ficheros relevantes y la descripción del fallo dentro de su ventana de 256K tokens, proponer un parche y verificar la corrección con el bloque `<think>`, lo que encaja con el flujo evaluado en SWE-bench Verified.
- Agente de terminal y CI/CD: con soporte de tool calling y entrenamiento orientado a Terminal-Bench, puede ejecutar comandos, interpretar la salida y corregir errores en pipelines de integración continua.
- Asistente de refactorización multi-fichero: la ventana de 256K permite cargar módulos completos y sus dependencias para renombrar APIs, migrar versiones de frameworks o eliminar deuda técnica de forma coherente.
- Generación de código full-stack a partir de especificaciones: adecuado para prototipado de aplicaciones con backend y frontend, dado su enfoque declarado en generación full-stack y su capacidad de planificación arquitectónica previa.
- Automatización de operaciones con MCP: al declarar compatibilidad con herramientas MCP, puede integrarse como cerebro de agentes que consultan bases de datos, APIs internas o sistemas de tickets mediante function calling.
- Soporte técnico en árabe, inglés y francés: útil para equipos del Magreb o multinacionales que necesitan explicaciones de código y documentación en los tres idiomas soportados.
- Revisión de código asistida: con contexto largo puede analizar diffs extensos y trazas de error completas, señalando regresiones y proponiendo pruebas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Genisi Codex Open (9B) | Qwen3.5-9B | Gemma-4-31B |
|---|---|---|---|
| SWE-bench Verified | 72,1% | 53,2% | 52,0% |
| SWE-bench Pro | 48,8% | 31,3% | 35,7% |
| NL2Repo | 35,1% | 16,2% | 15,5% |
| MCP-Atlas (Agent Tools) | 58,4% | 46,8% | 55,0% |
| GPQA Diamond | 86,4% | 81,7% | 84,3% |
| Terminal-Bench 2.1 | 47,9% | 21,3% | 42,1% |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; con 256K de contexto la caché KV puede crecer de forma significativa, por lo que se recomienda al menos 40-48 GB para contexto largo.
- VRAM estimada en FP8: en torno a 10 GB de pesos; en INT4: en torno a 5-6 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 80 GB o H100 80 GB para contexto completo de 256K; A100 40 GB o L40S 48 GB para contexto reducido en BF16.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en BF16 con contexto moderado; en cuantización de 8 o 4 bits cabría en RTX 3090/4090 e incluso en GPUs de 12-16 GB con contexto recortado.
- Despliegue: transformers (soporte nativo declarado), vLLM y TGI previsiblemente compatibles al ser una arquitectura tipo Qwen; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified (declarado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Genisi Codex Open | 9,65B denso | 256K | 72,1% | MIT | Hugging Face, repo de 19,6 GB |
| Qwen3.5-9B | 9B (aprox.) | no disponible | 53,2% | no disponible en la información | citado como referencia por el autor |
| Gemma-4-31B | 31B (aprox.) | no disponible | 52,0% | no disponible en la información | citado como referencia por el autor |

Las cifras de los modelos comparados provienen exclusivamente de la tabla publicada por el autor; no se dispone de verificación independiente ni de sus fichas técnicas en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks proceden únicamente de la model card del autor y no han sido replicados de forma independiente; deben tratarse como no verificados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Existe una discrepancia entre los 9.653.104.368 parámetros de safetensors y los "9,46B" declarados en la model card; conviene verificar el conteo real antes de dimensionar el despliegue.
- El identificador usado en el ejemplo de código (`AnesKAM/Genisi-Codex-Open`) no coincide con el ID real del repositorio (`AnesNT2026/Genisi-Codex-Open`), lo que puede provocar errores de carga.
- El pipeline declarado es `image-text-to-text`, pero la model card solo documenta uso de texto con `AutoModelForCausalLM`; la capacidad multimodal no está descrita ni verificada.
- No se documentan datos de entrenamiento, composición del dataset ni proceso de alineación (RLHF/DPO), lo que impide evaluar sesgos y riesgos de alucinación.
- Cobertura lingüística limitada a árabe, inglés y francés; el castellano no figura entre los idiomas soportados.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda revisar las obligaciones de atribución y la ausencia de garantías.
- El contexto de 256K incrementa de forma notable el consumo de memoria KV; en producción conviene validar la estabilidad con contextos muy largos.
- Al ser un modelo orientado a agentes con ejecución de comandos, requiere sandboxing y validación de las acciones propuestas antes de aplicarlas en entornos reales.

## Enlaces

- Hugging Face: https://huggingface.co/AnesNT2026/Genisi-Codex-Open
- Imagen de benchmarks referenciada en la model card: ./Genisi_Codex_Open_Benchmarks.png (relativa al repositorio)
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
