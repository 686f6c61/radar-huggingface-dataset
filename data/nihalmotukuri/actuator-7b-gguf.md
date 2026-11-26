# nihalmotukuri/actuator-7b-gguf

## Resumen

Actuator-7B (GGUF) es una cuantización del modelo Qwen2.5-Coder-7B-Instruct afinada por Nihal Motukuri para tareas de revisión de código y triaje de seguridad. El modelo actúa como motor de razonamiento de CodeWarden, una herramienta de línea de comandos offline que analiza cambios en repositorios Git, aísla funciones modificadas mediante Tree-sitter y produce hallazgos estructurados en JSON con vistas previas de parches interactivas. La relevancia del modelo radica en su enfoque: en lugar de un asistente de código genérico, se trata de un componente especializado en tool calling paralelo y adherencia estricta a esquemas JSON, empaquetado en GGUF para inferencia local.

El modelo se distribuye exclusivamente en formato GGUF con cuantización Q4_K_M (aproximadamente 4,7 GB en disco, VRAM o RAM), lo que permite ejecutarlo en portátiles con 8-16 GB de RAM sin intercambio de memoria. Está construido sobre la arquitectura de Qwen2.5-Coder-7B-Instruct, un transformer causal de 7.615.616.512 parámetros, y conserva su licencia Apache 2.0.

La ventana de contexto recomendada por el autor es de 4096 tokens (`num_ctx = 4096`), un valor deliberadamente modesto para evitar el thrashing de swap en hardware de consumo. El modelo soporta únicamente inglés y está orientado a Python, JavaScript/JSX, TypeScript/TSX y C++.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivado de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens recomendados (`num_ctx = 4096`) |
| Tipos de cuantizacion | Q4_K_M (~4,7 GB); el repo incluye otros archivos GGUF (12,8 GB en total) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de Qwen/Qwen2.5-Coder-7B-Instruct, un transformer causal de 7B parámetros. El autor indica que está "tuned for multi-step parallel tool calling and strict JSON schema adherence", es decir, ajustado para invocación de herramientas en paralelo y adherencia estricta a esquemas JSON. No se proporcionan detalles sobre el dataset de ajuste, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

La innovación destacable no reside en la arquitectura subyacente, sino en el ecosistema que la rodea: CodeWarden combina el modelo con Tree-sitter para el troceado a nivel de AST, un `RepoToolbox` sandboxed con caché de deduplicación para consultas entre archivos (definiciones de símbolos, referencias, importaciones, fragmentos de código y `git_blame`), prechecks deterministas de sintaxis (`ast.parse` para Python, `node --check` para JS/TS) y filtrado por proximidad de diff de ±3 líneas para eliminar ruido de código heredado.

## Capacidades

- Generación de texto y razonamiento sobre código en Python, JavaScript/JSX, TypeScript/TSX y C++.
- Tool calling multi-paso en paralelo con adherencia estricta a esquemas JSON.
- Revisión de código a nivel de AST: aísla funciones y componentes React, con seguimiento de anclas de eliminación (detecta guardas de autenticación o validación eliminadas) y ventaneo de funciones grandes (±40 líneas).
- Verificación entre archivos e historial: consulta definiciones de símbolos (`search_symbol`), puntos de llamada (`find_references`), importaciones (`get_file_imports`), fragmentos de código (`read_file`) y `git_blame`.
- Triaje de seguridad y detección de bugs con salida estructurada en JSON.
- Generación de parches unificados mínimos con verificación de indentación por coincidencia única y confirmación interactiva `[y/N]`.
- Capacidades multilingües limitadas al inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Revisión de cambios no confirmados en un repositorio: `codewarden review --repo /path/to/repo` analiza el diff, aísla las funciones afectadas con Tree-sitter y emite hallazgos JSON; el modelo es adecuado porque su ventana de 4096 tokens se ajusta al troceado por funciones en lugar de procesar el repositorio completo.
- Auditoría de commits recientes con parches interactivos: `codewarden review --repo /path/to/repo --base HEAD~1 --fix` genera diffs unificados mínimos con vistas previas de sintaxis Rich y confirmación `[y/N]`, lo que permite aplicar correcciones de seguridad sin salir de la terminal.
- Integración en CI/CD como hook de pre-commit bloqueante: `codewarden init --repo /path/to/repo` genera un hook de Git y un workflow de GitHub Actions; la inferencia local con Q4_K_M (~4,7 GB) evita enviar código propietario a APIs externas.
- Triaje de seguridad offline en entornos air-gapped: al ejecutarse íntegramente vía Ollama en hardware de consumo, el modelo permite auditar código en máquinas sin conexión, algo crítico en sectores regulados.
- Detección de regresiones de autenticación: el seguimiento de anclas de eliminación permite identificar guardas de auth o validación suprimidas en un diff, un caso donde el contexto entre archivos vía `find_references` y `git_blame` aporta la información que un análisis local de función no capturaría.
- Revisión de componentes React y código C++ en pipelines de frontend y sistemas: el soporte de JSX/TSX y C++ amplía el uso más allá de Python, con ventaneo de ±40 líneas para funciones grandes.
- Asistencia directa vía CLI o SDK de Python: `ollama run actuator-7b:latest` con definiciones de herramientas habilitadas permite construir agentes de análisis de código personalizados sobre el mismo motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~4,7 GB para la cuantización Q4_K_M (huella en disco, VRAM o RAM según el autor).
- Hardware objetivo: portátiles con 8-16 GB de RAM sin thrashing de swap, según la model card.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6-8 GB de VRAM o más al usar Q4_K_M; no se detallan modelos concretos.
- Opciones de despliegue: Ollama (vía `ollama pull hf.co/nihalmotukuri/actuator-7b-gguf:Q4_K_M` y alias `actuator-7b:latest`); el repo es compatible con endpoints (`endpoints_compatible`) y puede servirse con llama.cpp u otros runners GGUF, aunque solo Ollama se documenta explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Actuator-7B (GGUF) | 7,6B | 4096 recomendados | GGUF (Q4_K_M) | Apache 2.0 | Revisión de código y triaje de seguridad con tool calling |
| Qwen2.5-Coder-7B-Instruct | 7,6B | no disponible en la información | safetensors (modelo base) | Apache 2.0 | Asistente de código generalista |
| Alternativas de revisión de código especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros modelos de revisión de seguridad no está disponible en la información proporcionada. El único punto de referencia documentado es su modelo base, Qwen2.5-Coder-7B-Instruct, del que hereda arquitectura y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen2.5-Coder, puede heredar los sesgos del corpus de entrenamiento original.
- Riesgo de alucinación: no cuantificado; como modelo generativo que emite hallazgos JSON, puede producir falsos positivos o referencias a símbolos inexistentes, mitigado parcialmente por los prechecks deterministas y el filtrado de proximidad de CodeWarden.
- Contexto limitado: la ventana recomendada de 4096 tokens es reducida para repositorios grandes; el diseño depende del troceado por funciones y del ventaneo de ±40 líneas para compensar.
- Idioma: solo inglés, lo que limita su uso en comentarios, documentación o mensajes de error en otros idiomas.
- Cobertura de lenguajes: solo Python, JavaScript/JSX, TypeScript/TSX y C++; no cubre Java, Go, Rust ni otros lenguajes.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para producción ni sobre la precisión de los hallazgos de seguridad.
- Madurez: el modelo se publicó el 20 de noviembre de 2026 y se actualizó el 23 de noviembre de 2026, con 246 descargas y 3 likes; el ecosistema CodeWarden se encuentra en la versión v0.2.0, por lo que se trata de un proyecto joven.
- Dependencia de herramienta: el flujo principal asume Ollama y CodeWarden; el uso directo vía CLI o SDK requiere definir las herramientas manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nihalmotukuri/actuator-7b-gguf
- Repositorio CodeWarden (CLI y motor de agente): https://github.com/nihalmotukuri/CodeWarden
- Notas de la versión v0.2.0: https://github.com/nihalmotukuri/CodeWarden/releases/tag/v0.2.0
- Perfil del autor: https://github.com/nihalmotukuri
- Ollama: https://ollama.com/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
