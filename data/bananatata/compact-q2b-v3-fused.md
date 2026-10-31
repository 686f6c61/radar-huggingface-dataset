# Bananatata/compact-q2b-v3-fused

## Resumen

Compact-q2b-v3-fused es un modelo de generación de texto especializado en la compactación de sesiones de agentes conversacionales, publicado por el usuario Bananatata en Hugging Face. Se trata de un LoRA fusionado (fused LoRA) entrenado sobre la base mlx-community/Qwen3.5-2B-4bit, una versión cuantizada a 4 bits del modelo Qwen3.5-2B de Qwen. Su propósito es muy concreto: comprimir ventanas de contexto largas de un agente en un resumen estructurado de cuatro encabezados fijos, preservando de forma literal los identificadores (nombres de ficheros, funciones, variables) presentes en la conversación original.

El modelo resuelve un problema habitual en sistemas agénticos de larga duración: el contexto crece hasta agotar la ventana disponible, y resumirlo con un modelo genérico suele perder identificadores críticos. Este modelo está afinado específicamente para producir resúmenes con el formato `### Decisions/blockers`, `### Active artifacts`, `### Pending user ask` y `### Numerical state`, maximizando el recall de identificadores verbatim.

Técnicamente, es un modelo compacto (1.881.825.088 parámetros en safetensors, aproximadamente 1,1 GB en el repositorio), pensado para ejecutarse localmente con MLX en hardware Apple Silicon. Según la model card, mejora en un factor de 2,4× el recall de identificadores sobre su predecesor de 0,8B en ventanas no vistas, con una latencia de aproximadamente 1,2 segundos por llamada de resumen en un M3 Ultra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), LoRA fusionado sobre checkpoint 4-bit |
| Parametros totales | 1.881.825.088 (≈1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (max-seq 8192); longitud nativa del modelo base no disponible |
| Tipos de cuantizacion | 4 bits (base cuantizada; LoRA fusionado) |
| Idiomas soportados | no disponible (optimizado para salida estructurada en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, sin claves LoRA residuales tras el fuse) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B en su variante cuantizada a 4 bits publicada por mlx-community, sobre la que se ha entrenado un adaptador LoRA con rango r=8 y scale=16, posteriormente fusionado en los pesos mediante `mlx_lm.fuse`. Tras la fusión, el repositorio no contiene claves LoRA separadas: los pesos resultantes son directamente servibles como un modelo MLX convencional.

El entrenamiento es deliberadamente minimalista: 150 filas de datos (60 auditadas con modelos frontera y 90 autoetiquetadas por un modelo estudiante mediante un mecanismo de selección N=2), con prompts de hasta 24.000 caracteres. Se usaron 450 iteraciones (3 épocas) con tamaño de batch efectivo 4 (bs=1, gradient accumulation 4), scheduler coseno con tasa de aprendizaje 1e-5, máscara de prompt (solo se supervisa la respuesta) y secuencia máxima de 8192 tokens. La evaluación sigue una disciplina de doble muestreo: se compara una salida greedy a temperatura 0 con una alternativa a T=0,4, aceptando esta última solo si termina con `finish_reason=stop` y obtiene un recall de identificadores estrictamente superior.

## Capacidades

- Compresión de contexto de agentes: convierte ventanas de sesión largas en un recap de cuatro encabezados fijos (Decisiones/bloqueos, artefactos activos, petición pendiente del usuario, estado numérico).
- Preservación verbatim de identificadores: entrenado específicamente para no corromper nombres de ficheros, funciones y variables en el resumen.
- Generación de texto conversacional heredada de Qwen3.5-2B, aunque el afinado está orientado a una sola tarea.
- Soporte del modo de razonamiento desactivable mediante el chat template (`enable_thinking: false`), heredado de la familia Qwen3.5.
- Ejecución eficiente en Apple Silicon gracias al formato MLX.
- No hay evidencia publicada de capacidades de visión, audio ni tool calling nativo.

## Casos de uso

- Compactación automática de sesiones agénticas: un framework de agentes puede invocar el modelo cuando la ventana de contexto se acerca a su límite, sustituyendo el historial por el recap de cuatro encabezados y liberando espacio sin perder identificadores críticos.
- Memoria de largo plazo en asistentes de código: al preservar verbatim rutas de ficheros y nombres de funciones, el resumen puede realimentarse al agente para continuar tareas de refactorización o depuración multisesión.
- Pipelines de orquestación multi-agente: un coordinador puede usar los resúmenes como handoff compacto entre agentes especializados, reduciendo el coste de tokens transferidos.
- Registro de decisiones en sesiones largas: el encabezado `### Decisions/blockers` funciona como ledger estructurado de decisiones y bloqueos, útil para auditoría de ejecuciones autónomas.
- Seguimiento de estado numérico: el encabezado `### Numerical state` permite mantener contadores, presupuestos o métricas de progreso coherentes entre compactaciones sucesivas.
- Integración como plugin: existe un plugin de referencia (hermes-hybrid-ledger) que consume el modelo, sirviendo como ejemplo de integración en un flujo de trabajo real.
- Ejecución local y privada: al ser un modelo de ~1,9 B parámetros en 4 bits, puede desplegarse en portátiles Apple Silicon sin enviar datos a servicios externos, relevante para contextos con requisitos de privacidad.

## Benchmarks y rendimiento

La model card publica métricas propias de la tarea (recall de identificadores), no benchmarks estándar (MMLU, HumanEval, GSM8K):

| Métrica | compact-q2b-v3-fused | Predecesor 0,8B |
|---|---|---|
| Recall de identificadores, ruler new32 (ventanas no vistas) | 0,2148 | 0,0890 (mejora de 2,4×) |
| Recall de identificadores, ruler locked13 (contrato) | 0,6066 | 0,6122 (paridad) |
| Latencia por llamada de resumen (M3 Ultra) | ~1,2 s | no disponible |

No se han publicado resultados de benchmarks estándar de la industria en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 1,1 GB de pesos en 4 bits; con contexto de 8192 tokens, un presupuesto realista de 2-3 GB de memoria unificada es suficiente.
- Hardware recomendado: cualquier Mac con Apple Silicon (M1 o superior) dado que el formato es MLX; la model card reporta mediciones en un M3 Ultra, donde la latencia es de ~1,2 s por resumen.
- Consumer GPU: en Macs con 8 GB de memoria unificada o más debería ejecutarse sin problemas. No hay pesos GGUF publicados en este repositorio, por lo que la ejecución nativa en GPU NVIDIA no está cubierta directamente (habría que partir del modelo base original sin cuantizar).
- Despliegue: `mlx_lm.generate` o `mlx_lm.server` (MLX LM); el comando de uso recomendado es `mlx_lm.generate --model ./compact-q2b-v3-fused --prompt "..." --chat-template-kwargs '{"enable_thinking": false}' --max-tokens 900 --temp 0`. No hay soporte documentado para vLLM, TGI u Ollama en este repositorio.
- Throughput: no disponible; solo se conoce la latencia de ~1,2 s por llamada en M3 Ultra.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bananatata/compact-q2b-v3-fused | 1,88 B | 4 bits (MLX) | Compactacion de contexto agéntico | Apache 2.0 | Publico en Hugging Face |
| Predecesor 0,8B del mismo autor | 0,8 B | no disponible | misma tarea | no disponible | no disponible |
| mlx-community/Qwen3.5-2B-4bit (base) | ≈2 B | 4 bits | Generacion de texto general | Apache 2.0 | Publico en Hugging Face |

No existen alternativas comerciales conocidas especializadas exactamente en esta tarea; la alternativa habitual es usar un LLM generalista con un prompt de resumen, a costa de un menor recall de identificadores según los datos del autor.

## Limitaciones y advertencias

- Modelo hiperespecializado: está afinado con solo 150 filas para una tarea concreta; su rendimiento en generación de texto general, código o razonamiento puede haberse degradado respecto al modelo base (catastrofo forgetting no documentado).
- El recall de identificadores en ventanas no vistas es de 0,2148, es decir, pierde la mayoría de los identificadores según la propia métrica del autor; debe validarse en el dominio concreto antes de uso en producción.
- Datos de entrenamiento reducidos y parcialmente autoetiquetados (90 de 150 filas), lo que introduce riesgo de sesgos de etiquetado no auditados.
- Sesgos y alucinacion: no hay evaluaciones de sesgo ni de tasas de alucinación publicadas; al heredar de Qwen3.5-2B, pueden persistir los sesgos del modelo base.
- Idiomas: no documentado; el formato de salida está definido en inglés, por lo que el comportamiento con entradas en otros idiomas no está verificado.
- Licencia: Apache 2.0, sin restricciones para uso comercial, aunque la model card enlaza a la licencia del modelo base Qwen, que debe revisarse en cada versión.
- Formato MLX exclusivo: limita el despliegue a Apple Silicon salvo conversión manual de pesos.
- Repositorio con 0 descargas y sin comunidad activa: no hay validación externa de los resultados publicados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bananatata/compact-q2b-v3-fused
- Modelo base: https://huggingface.co/mlx-community/Qwen3.5-2B-4bit
- Plugin de referencia que consume el modelo: https://github.com/nguyentbanh/hermes-hybrid-ledger
- Licencia del modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Paper, demo y repositorio del modelo original Qwen3.5: no disponibles en la informacion proporcionada
