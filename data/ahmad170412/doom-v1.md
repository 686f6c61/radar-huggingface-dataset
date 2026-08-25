# Ahmad170412/Doom-V1

## Resumen

El modelo Doom-V1 es un ajuste fino del modelo Qwen2.5-Coder-1.5B-Instruct mediante la técnica QLoRA, desarrollado por Ahmad170412. Su función principal es transformar solicitudes en lenguaje natural en comandos de terminal de macOS (zsh), devolviendo un único comando junto con una breve explicación. Está pensado para integrarse en un CLI llamado DoomCLI, y se ha entrenado con 3.200 muestras artesanales repartidas en siete categorías de tareas de sistema. Su relevancia actual radica en ofrecer un asistente ligero y específico para administradores de sistemas y desarrolladores que trabajan en macOS, duplicando la precisión del modelo base en la generación de comandos correctos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Coder-1.5B-Instruct (decoder-only) con adaptador QLoRA |
| Parametros totales | 241.327.616 (adaptador) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo base 4-bit; adaptador sin cuantizar |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (según model card) |
| Formato de pesos | safetensors (adaptador), MLX (librería) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. Sobre este modelo cuantizado a 4 bits se aplicó un adaptador QLoRA con rango 8, alpha 16 y 8 capas. El entrenamiento se realizó con la librería MLX en hardware Apple Silicon. El conjunto de datos consta de 3.200 muestras creadas manualmente, organizadas en siete categorías: system_info, file_ops, config_edits, process_ports, search_inspect, archive y permissions. Cada muestra es una conversación en formato de chat que incluye contexto del sistema (versión de macOS, shell y directorio de trabajo). No se menciona el uso de RLHF o DPO; se trata de un fine-tune supervisado.

## Capacidades

- Generación de comandos zsh para macOS a partir de lenguaje natural en inglés.
- Produce exactamente un comando por petición, seguido de una línea de explicación.
- Cubre tareas de información del sistema (sysctl, sw_vers), operaciones de archivos (mkdir, find, rm), edición de configuración (echo >> .zshrc), gestión de procesos y puertos (lsof), búsqueda e inspección, archivado (zip) y permisos.
- No es un modelo de propósito general; está especializado exclusivamente en comandos de terminal de macOS.
- No soporta tool calling, funciones de agente ni razonamiento multi-paso.
- Solo acepta entradas en inglés.

## Casos de uso

- Asistente de terminal para desarrolladores: el usuario escribe "¿cuánta RAM tiene este Mac?" y el modelo genera `sysctl hw.memsize`, adecuado para consultas rápidas de hardware.
- Automatización de tareas repetitivas: crear múltiples directorios con `mkdir -p project-{01..50}` o eliminar archivos temporales con `find . -name "*.o" -delete`.
- Configuración de entorno de desarrollo: añadir variables de entorno al archivo `.zshrc` mediante `echo 'export API_KEY="..."' >> ~/.zshrc`.
- Diagnóstico de red y puertos: obtener puertos en escucha con `lsof -iTCP -sTCP:LISTEN -P | grep sshd`.
- Integración en un CLI (DoomCLI) para uso interactivo, donde el usuario escribe en lenguaje natural y recibe el comando listo para ejecutar.
- Apoyo educativo: usuarios noveles pueden aprender comandos de terminal viendo la explicación junto al comando generado.
- Archivado de proyectos: comprimir carpetas con `zip -r archive.zip .` o crear backups rápidos.

## Benchmarks y rendimiento

El autor evaluó el modelo en un conjunto de 319 prompts de validación, comparando con el modelo base Qwen2.5-Coder-1.5B-Instruct:

| Métrica | Base Qwen 1.5B | Doom-V1 |
|---|---|---|
| Precisión combinada (correcta) | 25% | 50% |
| Coincidencia exacta de cadena | 19% | 38% |
| Violaciones de formato | 38 | 0 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Al ser un adaptador QLoRA sobre un modelo base 4-bit de 1.5B, el conjunto completo puede ejecutarse en un Mac con Apple Silicon (M1, M2, M3) con al menos 8 GB de memoria unificada.
- El modelo base cuantizado a 4-bit ocupa aproximadamente 1 GB de memoria (CPU o GPU). El adaptador añade unos pocos MB.
- No se requiere una GPU dedicada; la librería MLX está optimizada para los procesadores de Apple.
- Opciones de despliegue: uso directo con `mlx_lm` (cargando el adaptador), o mediante el CLI DoomCLI. También podría convertirse a GGUF para usar con llama.cpp u Ollama, aunque no está documentado.
- La latencia es baja; en un Mac moderno la generación de un comando suele tardar menos de un segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Base | Precisión en comandos | Licencia |
|---|---|---|---|---|
| Doom-V1 (Qwen2.5-Coder-1.5B + QLoRA) | 241M (adaptador) | Qwen2.5-Coder-1.5B-Instruct | 50% | MIT (según card) |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1.5B | - | 25% | Apache 2.0 |

No se dispone de otros modelos específicos de generación de comandos de terminal en la información consultada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con comandos de macOS; no es válido para Linux, Windows u otros sistemas.
- Su precisión es del 50% en el conjunto de validación, lo que implica que en casos límite puede generar comandos incorrectos.
- Genera un solo comando; no admite encadenamiento con `&&`, `;` ni flujos de trabajo multi-paso.
- No tiene memoria de conversación; solo conoce el directorio de trabajo, la versión del sistema y el shell actuales.
- Riesgo de alucinación: ante solicitudes ambiguas puede producir comandos peligrosos o inválidos. Se recomienda revisar siempre la salida antes de ejecutarla.
- La licencia MIT indicada en la model card difiere del campo "Licencia" de HuggingFace, que aparece como "no disponible". El modelo base Qwen2.5-Coder-1.5B-Instruct está bajo Apache 2.0, lo que permite uso comercial, pero el adaptador se publica bajo MIT según el autor.

## Enlaces

- HuggingFace: https://huggingface.co/Ahmad170412/Doom-V1
- Repositorio del CLI: https://github.com/Ahmad170412/DoomCLI
- Perfil de GitHub del autor: https://github.com/Ahmad170412
