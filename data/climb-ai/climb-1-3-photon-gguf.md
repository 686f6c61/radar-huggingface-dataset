# Climb-Ai/Climb-1.3-Photon-GGUF

## Resumen

Climb 1.3 Photon es un modelo de lenguaje especializado en la generación de comandos de shell y en la resolución de problemas de administración de sistemas Linux, desarrollado por Climb-Ai. Se trata de un ajuste fino del modelo base Climb-Ai/Climb-1.3-Photon, que a su vez parte de la arquitectura híbrida Qwen 3.5 en su variante de 0,8B de parámetros. El modelo está diseñado como un copiloto de terminal de baja latencia: recibe una petición en lenguaje natural (precedida del prefijo `??`) y devuelve un comando bash ejecutable, sin formato Markdown y con temperatura muy baja para maximizar el determinismo.

La relevancia de esta versión 1.3 radica en la incorporación de una capa de alineamiento monolítico de seguridad y sintaxis que, según el autor, eleva al 100% la tasa de rechazo ante payloads destructivos (`rm -rf /`, `dd` sobre discos, fork bombs, `chmod -R 777 /`) manteniendo un 94,3% de comandos validados como limpios por `shellcheck`. La versión anterior (1.2) ya alcanzaba esa precisión sintáctica, pero ejecutaba sin filtro las consultas catastróficas; la 1.3 corrige esa vulnerabilidad reduciendo los fallos críticos totales de 12/100 a 3/100.

El repositorio publicado contiene únicamente cuantizaciones GGUF (Q8_0, Q5_K_M y Q4_K_M) del modelo base, orientadas a despliegue local con llama.cpp y a inferencia en cliente mediante WebGPU. El modelo tiene 752.393.024 parámetros totales y un tamaño de repositorio de 1,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen 3.5 (24 capas: Gated DeltaNet Linear Attention recurrente + Full Attention dispersa) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible (la model card indica que responde en el idioma del prompt) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

Climb 1.3 Photon se construye sobre la arquitectura híbrida Qwen 3.5 de 0,8B, compuesta por 24 capas que combinan Gated DeltaNet Linear Attention de tipo recurrente con capas de Full Attention dispersa. Esta combinación busca reducir el coste computacional y de memoria de la atención en contextos largos manteniendo la capacidad de recuperación de información. El modelo está optimizado para generación de un solo turno, con un modo de razonamiento (`<think>`) que en el ejemplo de la model card se abre y se cierra vacío para forzar la emisión directa del comando.

El entrenamiento se describe como un ajuste fino de alineamiento monolítico de seguridad y sintaxis sobre el modelo base Climb 1.3 Photon. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacada por el autor es la capa de rechazo determinista de comandos destructivos, que devuelve un mensaje de error por `stderr` y un código de salida 1 en lugar de ejecutar la operación, junto con la validación sistemática de la sintaxis bash mediante `bash -n` y `shellcheck -s bash`.

## Capacidades

- Generación de comandos bash ejecutables a partir de lenguaje natural, activada por el prefijo `??` en la consulta.
- Resolución de problemas de sistema: gestión de systemd, sockets de red, almacenamiento, ciclo de vida de contenedores y pipelines de E/S.
- Análisis de logs y explicaciones técnicas en lenguaje natural.
- Refusal determinista ante payloads destructivos (`rm -rf /`, `dd if=/dev/zero of=/dev/sda`, fork bombs, `chmod -R 777 /`), con mensaje de error y código de salida 1.
- Generación de un solo turno con temperatura recomendada de 0,1 para maximizar el determinismo.
- Soporte multilingüe a nivel de prompt: responde en el idioma de la consulta, según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está orientado a generación de un solo turno (la hoja de ruta del autor sitúa las capacidades de agente en versiones futuras 1.4 y 1.5).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Copiloto de terminal para administradores de sistemas: el usuario describe en lenguaje natural una tarea (por ejemplo, localizar ficheros grandes modificados en las últimas 24 horas) y el modelo devuelve el comando bash listo para ejecutar, sin Markdown, con temperatura baja para garantizar reproducibilidad.
- Automatización de pipelines de diagnóstico: integración del modelo en scripts de monitorización que traducen alertas o descripciones de incidencias en comandos de inspección (`journalctl`, `ss`, `df`, `du`) validados previamente con `shellcheck`.
- Generación segura de comandos en entornos de producción: la capa de rechazo al 100% ante payloads destructivos permite exponer el modelo a operadores menos experimentados sin riesgo de que se emita un `rm -rf /` o un `dd` sobre un dispositivo de bloque.
- Asistente embebido en herramientas de terminal o IDE: gracias a las cuantizaciones Q4_K_M (~510 MB) y a la inferencia WebGPU con `@wllama/wllama`, el modelo puede ejecutarse en el cliente sin enviar consultas a un servidor.
- Formación y onboarding de personal técnico: el modelo explica comandos y resuelve dudas sobre gestión de systemd, contenedores o redes, sirviendo como apoyo didáctico en entornos controlados.
- Análisis de logs y troubleshooting guiado: a partir de la descripción de un fallo, el modelo propone secuencias de comandos de inspección y verificación, manteniendo la coherencia conversacional (100% en el benchmark interno del autor).
- Despliegue en dispositivos de borde: con la cuantización Q5_K_M (~600 MB) o Q4_K_M (~510 MB) puede ejecutarse en servidores locales de CLI o en hardware con recursos limitados mediante llama.cpp.

## Benchmarks y rendimiento

Los datos proceden del benchmark empírico de 100 tareas publicado por el autor en la model card. Cada comando generado se verificó con `bash -n` y `shellcheck -s bash`.

| Categoria de evaluacion | Base Qwen 3.5 (0.8B) | Climb 1.2 Photon | Climb 1.3 Photon |
|---|---|---|---|
| Bash limpio (`shellcheck` clean) | 28/70 (40,0%) | 66/70 (94,3%) | 66/70 (94,3%) |
| Rechazos de seguridad destructiva (`rm`, `dd`, `mkfs`) | 0/10 (0,0%) | 0/10 (0,0%) | 10/10 (100,0%) |
| Coherencia conversacional y alineamiento | 18/20 (90,0%) | 20/20 (100,0%) | 20/20 (100,0%) |
| Fallos criticos totales (FAIL/100) | 14/100 | 12/100 | 3/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q4_K_M, 0,6 GB con Q5_K_M y 0,85 GB con Q8_0, a los que hay que sumar el overhead del contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM puede ejecutar las cuantizaciones Q4_K_M y Q5_K_M; para Q8_0 se recomienda un mínimo de 2-3 GB. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 2 GB o más de VRAM; también es viable en CPU y en dispositivos embebidos con la cuantización Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli`), WebGPU en cliente mediante `@wllama/wllama`, y cualquier runtime compatible con GGUF. No se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles. El autor describe el modelo como de baja latencia, pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Climb 1.3 Photon | 752.393.024 | no disponible | Copiloto CLI Linux/Bash con rechazo de comandos destructivos | apache-2.0 | GGUF en Hugging Face |
| Qwen 3.5 (0.8B) base | ~0,8B | no disponible | Modelo generalista | no disponible en la informacion | Pesos base de Qwen |
| Climb 1.2 Photon | ~0,8B | no disponible | Copiloto CLI sin capa de seguridad destructiva | apache-2.0 | Versión anterior del mismo autor |

No se dispone de datos de benchmarks comparativos con otros modelos especializados en generación de comandos shell en la información proporcionada.

## Limitaciones y advertencias

- El benchmark publicado es interno del autor (100 tareas) y no ha sido replicado de forma independiente; los porcentajes de precisión y seguridad deben tomarse con cautela.
- El modelo está diseñado para generación de un solo turno; no se documentan capacidades de razonamiento multi-paso ni de agente en esta versión.
- La tasa de comandos limpios validados por `shellcheck` es del 94,3%, lo que implica que aproximadamente 1 de cada 18 comandos generados puede contener errores de sintaxis o advertencias.
- Aunque la tasa de rechazo de payloads destructivos es del 100% en el benchmark del autor, no hay garantía formal de que la capa de seguridad cubra todas las variantes de comandos peligrosos; se recomienda validación adicional en producción.
- Riesgo de alucinación en explicaciones técnicas y en la interpretación de rutas o servicios poco comunes.
- No se especifican los idiomas soportados ni el tamaño de contexto, lo que limita la planificación de despliegues multilingües o con contextos largos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen 3.5 del que deriva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Climb-Ai/Climb-1.3-Photon-GGUF
- Modelo base: https://huggingface.co/Climb-Ai/Climb-1.3-Photon
- llama.cpp: https://github.com/ggml-org/llama.cpp
- @wllama/wllama (WebGPU): https://github.com/ngxson/wllama
- ShellCheck: https://www.shellcheck.net/
