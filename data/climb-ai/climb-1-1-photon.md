# Climb-Ai/Climb-1.1-Photon

## Resumen

Climb 1.1 Photon es un modelo de lenguaje de 0,8B parámetros (752.393.024 según los pesos en safetensors) especializado en la generación de comandos de terminal para Linux y Bash. Lo desarrolla Climb-Ai y deriva de Climb-Ai/Climb-1-Photon, que a su vez parte de RikiyaT/Qwen3.5-0.8B-weight-space-programming. La versión 1.1 incorpora un adaptador LoRA entrenado sobre datos de instrucciones centrados en shell, fusionado en los pesos publicados, y está pensado para responder con one-liners POSIX en lugar de explicaciones o preámbulos.

El modelo aborda un problema concreto: los modelos pequeños alucinan con frecuencia banderas y utilidades de Unix (`ls -lz`, `ip -sl` para puertos, `sed` vacíos). Climb 1.1 Photon se entrena contra un benchmark multilingüe de 100 tareas reales de administración de sistemas y declara una puntuación de 89/100, frente a 34/100 de su predecesor y 22/100 del Qwen 3.5 0.8B base. Mantiene además el parche anti-bucle de Astra Weight-Space Programming (WSP) congelado durante el ajuste fino.

Por su tamaño reducido y su licencia Apache 2.0, está orientado a despliegues locales de baja latencia, integración en terminales, asistentes de CLI y automatización de operaciones. Los idiomas declarados son inglés y ruso, aunque la model card menciona respuestas también en catalán, polaco, sueco y ucraniano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, tag `qwen3_5_text`) |
| Parametros totales | 752.393.024 (aproximadamente 0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors; el benchmark cita GGUF Q6_K para el modelo base) |
| Idiomas soportados | en, ru (la model card menciona además catalán, polaco, sueco y ucraniano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen 3.5 con aproximadamente 0,8B parámetros. Parte de `RikiyaT/Qwen3.5-0.8B-weight-space-programming`, pasa por `Climb-Ai/Climb-1-Photon` y se especializa con un adaptador LoRA (`photon-bash-lora`) entrenado sobre datos de instrucciones shell-céntricos, que se fusiona en los pesos publicados. Durante el ajuste fino se congelaron estrictamente las capas WSP (Weight-Space Programming) para preservar el parche anti-bucle de Astra, que evita la degeneración en ciclos infinitos de tokens.

El entrenamiento se valida contra un benchmark propio de 100 tareas multilingües de Bash y administración de Linux, repartidas en cinco categorías: ficheros y directorios, procesos y sistema, redes, procesamiento de texto y scripts. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La model card sí destaca la alineación para evitar filtrar etiquetas `<think>` en las respuestas y para eliminar preámbulos conversacionales.

## Capacidades

- Generación de comandos de shell POSIX de una sola línea para tareas de administración de Linux.
- Uso de utilidades canónicas y banderas modernas: `find -printf`, `xargs -0`, `ss -tlnp`, `docker ps --format`, `ps -eo`, `systemctl`, `journalctl`, `tcpdump`, `ip`.
- Construcción de pipelines con `awk`, `sed`, `grep`, `sort`, `uniq` y sustitución de procesos.
- Estructuras de script: `while IFS= read -r`, funciones `usage()`, `trap`.
- Modo conversacional directo y factual, sin relleno tipo "Sure! Here is your command...".
- Modo terminal/CLI activado con el prefijo `?? <tarea>` o con imperativos directos.
- Multilingüismo: responde en el idioma de la pregunta (inglés, ruso y, según la model card, catalán, polaco, sueco y ucraniano).
- Zero-CoT: no emite razonamiento interno en la salida.
- Protección anti-bucle WSP heredada de Astra.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Asistente de terminal integrado: el modelo recibe una descripción en lenguaje natural y devuelve un comando ejecutable, lo que permite construir una shell interactiva o un plugin de CLI que sugiera comandos al usuario sin salir del terminal.
- Automatización de operaciones en servidores: generación de pipelines para auditoría de ficheros, permisos y `mtime`, útil en scripts de mantenimiento donde se requiere una sintaxis correcta de `find` y `xargs -0`.
- Diagnóstico de red: producción de comandos con `ss -tlnp`, `curl` con timeouts, `tcpdump` e `ip` para tareas de inspección de puertos e interfaces, un área donde los modelos pequeños suelen confundir utilidades.
- Procesamiento de logs y texto: construcción de pipelines con `awk`, `grep`, `sort` y `uniq` para filtrar, agregar y limpiar ficheros de configuración o logs de sistema.
- Gestión de contenedores y servicios: generación de comandos de `docker ps --format` y `systemctl`/`journalctl` para operaciones rutinarias de administración.
- Soporte multilingüe en mesa de ayuda: al responder en el idioma de la consulta, puede atender a operadores que planteen tareas en ruso, polaco o ucraniano sin degradar a inglés.
- Despliegue local de baja latencia: con 0,8B parámetros y licencia Apache 2.0, es viable ejecutarlo en estaciones de trabajo o portátiles para asistentes offline.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un benchmark propio de 100 tareas multilingües de Bash/Linux (no es un benchmark estándar de la comunidad; los datos provienen de la model card):

| Categoria | Climb 1.1 Photon | Climb 1 Photon | Qwen 3.5 0.8B |
|---|---:|---:|---:|
| Ficheros y directorios (1–20) | 90% | 35% | 15% |
| Procesos y sistema (21–40) | 95% | 50% | 30% |
| Redes (41–55) | 90% | 40% | 25% |
| Texto y procesamiento (56–75) | 85% | 25% | 20% |
| Scripts y construcciones (76–100) | 85% | 20% | 20% |
| **Puntuación global** | **89/100** | **34/100** | **22/100** |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 0,8B parámetros, en FP16 el peso ronda 1,5 GB y en cuantizaciones de 4–8 bits cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería ser suficiente en cuantización, y una RTX 4090 o A100 queda sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 4–8 GB de VRAM en cuantización.
- Opciones de despliegue: la model card cita `unsloth` en los tags y el benchmark usa GGUF Q6_K para el modelo base; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (benchmark del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Climb 1.1 Photon | 0,8B | no disponible | 89/100 | Apache 2.0 | Hugging Face |
| Climb 1 Photon | 0,8B | no disponible | 34/100 | Apache 2.0 (heredada) | Hugging Face |
| Qwen 3.5 0.8B | 0,8B | no disponible | 22/100 | no disponible en la información | Hugging Face |

No se dispone de datos de otros modelos especializados en CLI/Bash para una comparación adicional.

## Limitaciones y advertencias

- El benchmark de 89/100 es propio del autor, con 100 tareas y sin validación externa; debe interpretarse con cautela.
- Modelo de 0,8B parámetros: la capacidad de razonamiento general y de tareas fuera del dominio shell es limitada.
- Riesgo de alucinación en banderas y utilidades poco comunes, aunque el entrenamiento lo reduce en las categorías evaluadas.
- Longitud de contexto no documentada, lo que dificulta planificar conversaciones largas o ficheros extensos.
- Idiomas declarados oficialmente: inglés y ruso; el resto de idiomas mencionados en la model card no aparecen en los metadatos.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan cláusulas adicionales ni restricciones de uso aceptable.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en producción.
- El parche anti-bucle WSP es una innovación propietaria del linaje del modelo; no hay validación independiente de su comportamiento fuera del benchmark del autor.
- No hay información sobre sesgos específicos ni sobre evaluación de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/Climb-Ai/Climb-1.1-Photon
- Modelo base intermedio: https://huggingface.co/Climb-Ai/Climb-1-Photon
- Modelo base original: RikiyaT/Qwen3.5-0.8B-weight-space-programming (referenciado en la model card; URL no verificada en la búsqueda)
- Resultados crudos del benchmark: `benchmark_results_all3.json` (referenciado en la model card; URL no verificada)
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web.
