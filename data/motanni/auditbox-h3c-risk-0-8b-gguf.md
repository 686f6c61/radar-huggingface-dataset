# Motanni/auditbox-h3c-risk-0.8b-gguf

## Resumen

AuditBox H3C Risk 0.8B es un ajuste fino de dominio del modelo Qwen/Qwen3.5-0.8B orientado al análisis de riesgo de comandos de H3C Comware. Lo desarrolla el usuario Motanni dentro del proyecto AuditBox, y resuelve un problema muy concreto: dado un comando o una secuencia de comandos sobre un equipo H3C, el modelo genera una explicación de impacto potencial, la causa del riesgo y las comprobaciones que el operador debería hacer antes de aplicarlo. Se publica como un artefacto GGUF cuantizado en Q8_0 para inferencia local con llama.cpp.

La relevancia del modelo está en su especialización extrema y su tamaño reducido: con 752.393.024 parámetros (menos de 0,8 B) y un único fichero de 811.843.040 bytes, está pensado para ejecutarse como revisor lateral (sidecar) de bajo coste en una consola de auditoría de red, no como un asistente generalista. El contexto declarado en los metadatos GGUF es de 262.144 tokens, aunque el ejemplo de despliegue del autor usa solo 2.048 y no se aportan validaciones de rendimiento en contexto largo.

Arquitectura `qwen35` de 24 capas con dimensión oculta 1024, heredada del modelo base. El modelo solo soporta chino e inglés, no publica evaluación independiente ligada al hash del artefacto y se distribuye bajo GPL-3.0-only, lo que condiciona seriamente su integración en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (transformer decoder-only), 24 capas, hidden size 1024 |
| Parametros totales | 752.393.024 (recuento por dimensiones de tensor GGUF) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens declarados en metadatos GGUF; ejemplo de ejecución con 2.048 |
| Tipos de cuantizacion | Q8_0 (único artefacto publicado) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | GPL-3.0-only (base Qwen3.5-0.8B bajo Apache 2.0, conservada en BASE_MODEL_LICENSE) |
| Formato de pesos | GGUF v3 (`h3c-risk-q8_0.gguf`) |
| Tamano del artefacto | 811.843.040 bytes (repo ~0,8 GB) |
| SHA-256 | `0d277487d36f7c68c6c7cdd166f9c117bf25f5d0b01976af45b5d2d29b2ed059` |
| Identificador de fine-tune | `general.finetune=h3crisk`, nombre «Qwen3.5 0.8B H3Crisk» |
| Interfaz recomendada | llama.cpp con soporte `qwen35` / Chat Completions compatible OpenAI |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, con 24 capas y dimensión oculta 1024, ajustado sobre Qwen/Qwen3.5-0.8B. No hay innovaciones arquitectónicas propias: el valor añadido es el ajuste fino de dominio sobre comandos, vistas y semántica de H3C Comware (interfaces, VLAN, routing, gestión de configuración). El artefacto se distribuye exclusivamente en GGUF Q8_0, generado con una herramienta de conversión cuyo nombre y versión no se documentan.

La model card reconoce explícitamente lagunas en la trazabilidad del entrenamiento: la revisión fija del modelo base, la versión del dataset, el método de ajuste y los hiperparámetros, el hardware de entrenamiento y la versión del conversor «no están completamente archivados» y deben contrastarse con la ejecución de entrenamiento concreta. Tampoco se documentan número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. No se puede, por tanto, auditar el proceso de alineación ni verificar la procedencia de los datos.

## Capacidades

- Generación de texto especializada en análisis de riesgo de comandos H3C Comware: impacto potencial, causa del riesgo y comprobaciones recomendadas.
- Interpretación del contexto operativo aportado por el llamador: modelo de dispositivo, versión de sistema, vista actual (user view, system view, interface view) y comandos previos.
- Análisis de operaciones de solo lectura y de configuración (interfaces, VLAN, routing, gestión de configuración).
- Generación de texto de análisis para aprobación de cambios, revisión de inspecciones y auditoría correlacionada.
- Salida en chino e inglés; no hay soporte declarado de otros idiomas, incluido el español.
- Integración vía API compatible con OpenAI Chat Completions servida por llama.cpp (`llama-server`).
- Modo thinking desactivable (`enable_thinking: false`, `--reasoning off`, `--reasoning-budget 0`), que es la configuración usada en el ejemplo del autor.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Revisión previa de cambios en switches H3C: el operador envía el comando propuesto junto con modelo de equipo, versión y vista actual, y el modelo devuelve un texto con impacto, motivo del riesgo y lista de comprobaciones antes de aplicar el cambio.
- Consola de auditoría de red (AuditBox): despliegue como servicio lateral H3C junto al modelo Linux por defecto, configurando `AUDITBOX_H3C_BACKEND_URL` y añadiendo `h3c_comware` a `AUDITBOX_INFERENCE_PROFILES`, para revisar comandos en paralelo al flujo de ejecución.
- Revisión de inspecciones y post-mortem: análisis de secuencias de comandos registradas para explicar qué se pretendía cambiar y qué ámbitos podían verse afectados.
- Formación de operadores de red: el modelo explica la semántica de comandos Comware y el alcance de una operación, útil como material de apoyo para personal junior.
- Prechequeo en pipelines de automatización de red: paso previo que genera un informe textual de riesgo antes de aprobar un cambio, con validación posterior de la salida por parte de la aplicación (formato JSON, enumeración de riesgo, número de comando y evidencias).
- Aprobación de cambios con trazabilidad: generación de texto de justificación y comprobaciones asociado a cada solicitud de cambio, archivado como evidencia de auditoría.
- Asistencia en laboratorio y pruebas: análisis de comandos antes de ejecutarlos en equipos de laboratorio o en entornos de staging con versiones concretas de Comware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no existe un informe de evaluación independiente ligado al SHA-256 del artefacto y que no se aportan métricas de precisión, exhaustividad, tasa de falsos positivos ni throughput. Tampoco se han validado el comportamiento en contexto largo ni el consumo de recursos de la configuración de 262.144 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto Q8_0 ocupa 811.843.040 bytes (~0,76 GiB); con overhead de contexto y caché KV, un presupuesto de 1,5-2 GiB de VRAM es suficiente para el ejemplo de 2.048 tokens de contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre (GTX 1660, RTX 3060, RTX 4060, RTX 4090) es suficiente; también A100/H100, aunque sobredimensionadas para este tamaño.
- Cabe holgadamente en GPU consumer e incluso en CPU: con 0,8 B de parámetros, la inferencia en CPU con llama.cpp es viable para revisión interactiva de baja concurrencia.
- Opciones de despliegue: llama.cpp (`llama-server`) con soporte de la arquitectura `qwen35`; interfaz compatible con OpenAI Chat Completions. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros runners.
- Latencia y throughput: no disponibles. El autor no publica métricas; con `--parallel 1` y `--ctx-size 2048` el despliegue está pensado para un único flujo de revisión, no para alta concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| AuditBox H3C Risk 0.8B (este) | 752 M | 262.144 declarados (2.048 en ejemplo) | GPL-3.0-only | Riesgo de comandos H3C Comware, GGUF Q8_0 | Hugging Face, llama.cpp |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible en esta ficha | Apache 2.0 | Modelo generalista multilingüe | Hugging Face |
| Modelos de análisis de riesgo de red de propósito general | no disponible | no disponible | variable | Revisión de configuración multi-vendor | no disponible |

No se dispone de información sobre alternativas especializadas comparables en análisis de riesgo de comandos de red con este tamaño y formato; la comparación cuantitativa de rendimiento no es posible sin benchmarks publicados.

## Limitaciones y advertencias

- Trazabilidad incompleta del entrenamiento: no se documentan revisión fija del modelo base, versión del dataset, hiperparámetros, hardware ni versión del conversor.
- Ausencia de evaluación independiente: no hay métricas de precisión, exhaustividad, falsos positivos ni calibración de confianza ligadas al hash del artefacto.
- Riesgo de confusión entre modelos de dispositivo, vistas de comando, versiones de Comware y sintaxis similares de otros fabricantes; los resultados deben contrastarse con la salida real del equipo.
- No cubre otros fabricantes: el ámbito es exclusivamente H3C Comware; otras marcas requieren sus propias reglas o modelos.
- Idiomas limitados a chino e inglés; no hay soporte de español.
- Contexto largo no validado: los 262.144 tokens son un dato de metadatos, sin pruebas de calidad ni de consumo de recursos.
- Licencia GPL-3.0-only: impide integrar el modelo en productos propietarios sin liberar el código derivado; requiere revisión legal antes de uso comercial. La licencia Apache 2.0 del base se conserva en BASE_MODEL_LICENSE.
- El modelo solo genera texto de análisis: la aplicación debe gestionar la ejecución de comandos, el control de permisos y la confirmación previa; no debe usarse como único mecanismo de decisión.
- Las salidas estructuradas requieren validación en la aplicación (formato JSON, enumeración de riesgo, número de comando, evidencias); los fallos de parseo deben registrarse como «no determinado».
- No se documentan capacidades de tool calling, agentes ni multimodalidad.
- El proyecto tiene muy poca tracción (97 descargas, 0 likes) y no hay garantía de mantenimiento o soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Motanni/auditbox-h3c-risk-0.8b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checksums del artefacto: https://huggingface.co/Motanni/auditbox-h3c-risk-0.8b-gguf/blob/main/SHA256SUMS
- Licencia GPL-3.0-only: https://huggingface.co/Motanni/auditbox-h3c-risk-0.8b-gguf/blob/main/LICENSE
- Licencia del modelo base: https://huggingface.co/Motanni/auditbox-h3c-risk-0.8b-gguf/blob/main/BASE_MODEL_LICENSE
- Aviso de atribución: https://huggingface.co/Motanni/auditbox-h3c-risk-0.8b-gguf/blob/main/NOTICE
