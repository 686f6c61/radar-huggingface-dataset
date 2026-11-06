# Samonte/mtcc-test-adila

## Resumen

`Samonte/mtcc-test-adila` es un ajuste fino (fine-tune) de tipo SLM (small language model) construido sobre `Qwen/Qwen2.5-Coder-1.5B-Instruct`. Lo publica el usuario Samonte como artefacto de prueba para el "arena" `ctx_compress` del proyecto Microtensor: un modelo especializado en comprimir una sesión de agente de programación (coding-agent session) en un resumen JSON corto. No es un modelo generalista, sino una pieza de un pipeline concreto de compresión de contexto.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-Coder-1.5B, con 1.543.714.304 parámetros totales (1,5B) y pesos en safetensors. El repo ocupa 3,1 GB, lo que corresponde a pesos en precisión de 16 bits. La licencia declarada es Apache 2.0, aunque la model card introduce una ambigüedad relevante: afirma que las salidas siguen la licencia de Llama 3.1 y que un fine-tune distribuido debe llevar el nombre Llama y mostrar "Built with Llama".

Su relevancia es acotada pero clara: ejemplifica el patrón de fine-tunes ultraespecializados para tareas de infraestructura de agentes (compresión de contexto, resumen de trayectorias, destilación de estado), donde un modelo de 1,5B puede ser suficiente y desplegable en hardware modesto. El uso previsto es muy restringido: completación cruda contra un prompt específico del arena, decodificación greedy y parada en tokens concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune de Qwen2.5-Coder-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (repo en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multilingue, pero no se declara en esta ficha) |
| Licencia | apache-2.0 (con caveat declarado sobre Llama 3.1 en las salidas) |
| Formato de pesos | safetensors |
| Tamano del repo | 3,1 GB |
| Modelo base | Qwen/Qwen2.5-Coder-1.5B-Instruct |
| Dataset de entrenamiento | nebius/SWE-agent-trajectories |
| Tokens maximos de generacion | 3072 (nuevos tokens) |
| Tokens de parada | `<|im_end|>`, `<|endoftext|>`, `<|end|>` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-1.5B-Instruct: un transformer decoder-only denso con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos SSM. El fine-tune no altera la topología del modelo; se limita a especializar los pesos sobre una tarea concreta. Los tags del repo (`microtensor`, `ctx_compress`, `llama`) indican el marco de evaluación y el formato de prompt esperado, no un cambio arquitectónico.

El entrenamiento se realizó sobre el dataset `nebius/SWE-agent-trajectories`, compuesto por trayectorias de agentes SWE (resolución de issues en repositorios) generadas por agentes automáticos. La tarea aprendida es la compresión: dada una sesión de agente (historial de acciones, observaciones y salidas de herramientas), producir un resumen JSON corto que preserve la información necesaria para continuar. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF, DPO o preferencias. Tampoco se detalla ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Compresión de contexto de agentes: genera un resumen JSON corto a partir de una sesión de coding-agent, orientado a reducir el estado que se reinyecta en el prompt.
- Generación de texto restringida al formato de salida esperado por el arena `ctx_compress` (JSON estructurado).
- Completación cruda (raw completion) contra el prompt `slm_prompt` definido por el arena, con decodificación greedy.
- Parada controlada en tokens especiales (`<|im_end|>`, `<|endoftext|>`, `<|end|>`) y límite de 3072 tokens nuevos.
- Herencia potencial de las capacidades del base Qwen2.5-Coder-1.5B-Instruct (código, instrucciones), aunque no se garantizan tras el fine-tune especializado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Compresión de historial en agentes de programación: el modelo recibe la trayectoria completa de un agente SWE (comandos, diffs, errores) y devuelve un JSON resumido que se reinyecta como estado, reduciendo el consumo de contexto en el bucle del agente.
- Evaluación de infraestructura de agentes: sirve como SLM de referencia en el arena `ctx_compress` de Microtensor para comparar estrategias de compresión de contexto entre modelos.
- Pipeline de resumen de sesiones de debugging: dado un log largo de interacciones agente-herramienta, generar un resumen estructurado apto para almacenar en una base de datos de trazas.
- Destilación de estado entre turnos: en un sistema multiagente, usar el JSON de salida como memoria compacta que se pasa entre subagentes con ventanas de contexto limitadas.
- Prototipado local de compresión de contexto: al ser un modelo de 1,5B en safetensors, permite iterar en una sola GPU consumer antes de escalar a modelos mayores.
- Generación de resúmenes estructurados en pipelines de CI: integrar el modelo en un job que, tras una ejecución de agente, produzca un informe JSON de lo ocurrido para revisión humana o auditoría.
- Benchmark de fine-tunes especializados: como artefacto de prueba (nombre `mtcc-test-adila`), sirve para validar el pipeline de entrenamiento y evaluación de Microtensor antes de producir versiones definitivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB. Estas cuantizaciones no están publicadas en el repo y requerirían conversión propia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado (RTX 3060 Ti, RTX 4060, RTX 4070). Para mayor throughput, A10G, L4, A100 o H100.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, entre otras.
- Opciones de despliegue: transformers con safetensors (formato nativo del repo); conversión a GGUF para llama.cpp u Ollama; vLLM y TGI son compatibles con la arquitectura Qwen2, aunque no se documenta configuración específica para este fine-tune.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Samonte/mtcc-test-adila | 1,5B | no disponible | Compresión de contexto de agentes | apache-2.0 (con caveat Llama 3.1) | Hugging Face, 20 descargas |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | no disponible en esta ficha | Código e instrucciones generales | apache-2.0 | Hugging Face, ampliamente usado |
| Fine-tunes de compresión de contexto sobre Qwen2.5 | variable | variable | Resumen de trayectorias | variable | no disponible |
| Modelos de resumen pequeños (p. ej. T5-small, ~60M-250M) | 0,06B-0,25B | limitado | Resumen de texto genérico | variable | Hugging Face |

La comparación directa con alternativas específicas de compresión de contexto de agentes no está disponible en la información proporcionada. Frente al base Qwen2.5-Coder-1.5B-Instruct, este fine-tune sacrifica generalidad por una tarea muy concreta; frente a modelos de resumen genéricos más pequeños, ofrece mayor capacidad de razonamiento sobre código pero con un coste de inferencia superior.

## Limitaciones y advertencias

- Modelo de prueba: el nombre (`mtcc-test-adila`) y el contexto del arena sugieren un artefacto experimental, no una versión de producción estable.
- Uso previsto muy restringido: la model card especifica completación cruda contra un prompt concreto con decodificación greedy y tokens de parada fijos; usarlo fuera de ese formato puede degradar gravemente la calidad.
- Ambigüedad de licencia: se declara Apache 2.0, pero la model card afirma que las salidas siguen la licencia de Llama 3.1 y exige el nombre Llama y "Built with Llama" en la distribución. Esto debe aclararse antes de cualquier uso comercial.
- Riesgo de alucinación: al ser un modelo de 1,5B especializado en compresión, puede omitir detalles críticos del historial o inventar campos en el JSON de salida.
- Idiomas: no se declaran idiomas soportados; el base Qwen2.5 es multilingüe, pero el fine-tune se entrenó sobre trayectorias SWE, predominantemente en inglés.
- Contexto: no se documenta la longitud máxima de contexto soportada por el fine-tune; la ventana del base Qwen2.5-Coder-1.5B-Instruct es finita y las sesiones de agente pueden superarla.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones de 8/4 bits en el repo, lo que obliga a conversión manual para despliegue en hardware limitado.
- Sin benchmarks: no hay métricas publicadas que permitan estimar la calidad de la compresión frente a alternativas.
- Trazabilidad limitada: 20 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Samonte/mtcc-test-adila
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/nebius/SWE-agent-trajectories
- Proyecto Microtensor (referenciado en tags, sin URL en la información disponible): no disponible
- Paper o blog del fine-tune: no disponible
