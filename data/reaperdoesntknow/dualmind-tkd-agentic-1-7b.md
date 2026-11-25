# reaperdoesntknow/DualMind-TKD-Agentic-1.7B

## Resumen

DualMind TKD Agentic 1.7B es un modelo de lenguaje derivado de Qwen3-1.7B, desarrollado por Convergent Intelligence LLC (usuario `reaperdoesntknow` en Hugging Face). Se trata de un ajuste fino en dos etapas que combina destilación de conocimiento matemático guiada por topología con una especialización posterior en agentes y function calling mediante LoRA fusionado. El resultado es un modelo compacto de 1.720.574.976 parámetros orientado a razonamiento matemático y uso estructurado de herramientas.

La primera etapa transfiere comportamiento de razonamiento matemático desde Qwen3-8B como profesor hacia Qwen3-1.7B como estudiante, usando el dataset `0xZee/dataset-CoT-Advanced-Calculus-268` y una función de pérdida que combina entropía cruzada supervisada con destilación top-k-and-tail, señales de discrepancia entre distribuciones y supervisión ponderada por fases (Explore/Examine/Response). La segunda etapa aplica especialización LoRA sobre `NousResearch/hermes-function-calling-v1`, con enmascaramiento de pérdida para supervisar únicamente salidas del asistente y llamadas a herramientas, seguida de la fusión de pesos en un modelo autónomo.

El modelo es relevante como experimento reproducible de destilación topology-aware y como base pequeña para investigación en bucles de agentes y selección de herramientas. No se reclaman resultados formales de benchmarks y la licencia queda marcada como `other` por ambigüedad en la licencia del dataset matemático de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | other (base Qwen3-1.7B en Apache-2.0; dataset matemático sin licencia clara) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Qwen3-1.7B. El entrenamiento se estructura en dos fases. La etapa 1 realiza un ajuste fino de modelo completo con destilación de conocimiento desde Qwen3-8B sobre el dataset de cálculo avanzado, combinando entropía cruzada supervisada con una pérdida de destilación sparse top-k-and-tail. Se incorporan señales estructurales: discrepancia entre distribuciones del profesor, topología de transiciones, diagnósticos de gap-energy y supervisión ponderada por fases Explore/Examine/Response, con presión adicional sobre derivaciones, verificación y transiciones de razonamiento de alta discrepancia.

La etapa 2 aplica especialización LoRA sobre `NousResearch/hermes-function-calling-v1`, supervisando únicamente salidas del asistente y llamadas a herramientas; los esquemas de herramientas, mensajes de usuario y resultados de herramientas se incluyen como contexto pero se excluyen de la pérdida. Se mezcla replay matemático para mitigar el olvido catastrófico. Los pesos LoRA se fusionan en el modelo final, de modo que no se requiere un adaptador PEFT separado para inferencia.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento matemático y técnico, con énfasis en cálculo avanzado y verificación de derivaciones.
- Function calling y tool use estructurado (generación de llamadas a herramientas en formato parseable).
- Soporte para bucles de agente multi-paso: el modelo genera la llamada, un runtime externo la ejecuta y devuelve el resultado para la siguiente invocación.
- Selección de herramientas en experimentos de agent-loop.
- Base para ajuste supervisado adicional u optimización por preferencias.
- Investigación en destilación topology-aware.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Asistente de cálculo y matemáticas técnicas: el modelo puede resolver derivaciones paso a paso y verificar resultados intermedios, aprovechando la destilación desde Qwen3-8B sobre cálculo avanzado.
- Investigación en destilación de conocimiento: sirve como caso reproducible de destilación topology-aware con señales de discrepancia y ponderación por fases para estudiar transferencia de razonamiento.
- Prototipado de agentes con herramientas: integrado en un runtime que parsee las llamadas, ejecute herramientas y reinyecte resultados, permite experimentar con bucles de agente y selección de herramientas sobre un modelo pequeño.
- Evaluación de function calling en entornos con recursos limitados: su tamaño permite iterar rápidamente sobre esquemas de herramientas y prompts en hardware modesto.
- Generación de código asistida por herramientas: puede emitir llamadas a intérpretes o utilidades externas en pipelines de desarrollo, siempre con validación posterior.
- Base para ajuste fino específico de dominio: al ser un modelo de 1,7B con licencia base permisiva, es adecuado como punto de partida para especializaciones supervisadas o DPO en tareas concretas.
- Educación técnica automatizada: generación de explicaciones matemáticas con trazabilidad de pasos, útil en entornos de tutoría con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclaman resultados formales y que solo se realizaron monitorización de pérdida en validación y pruebas cualitativas de generación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 1,8-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 1-1,2 GB para pesos.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, así como en GPUs con 6-8 GB en cuantización de 4 bits.
- GPUs de datacenter recomendadas para mayor throughput: A100, H100, L40S.
- Opciones de despliegue: transformers (soporte nativo según la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no están confirmados para este repositorio concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DualMind TKD Agentic 1.7B | 1,72B | no disponible | other | Especializado en matemáticas y function calling vía destilación |
| Qwen/Qwen3-1.7B | 1,7B | no disponible | Apache-2.0 | Modelo base, sin especialización agentic |
| Qwen/Qwen3-8B | 8B | no disponible | Apache-2.0 | Profesor en la destilación; mayor capacidad a mayor coste |
| Modelos agentic pequeños de la familia Hermes | variable | variable | Apache-2.0 (dataset) | Referencia de formato de function calling usado en el entrenamiento |

## Limitaciones y advertencias

- El dataset matemático de origen es pequeño, lo que limita la cobertura de razonamiento.
- Las trazas de razonamiento sintéticas o generadas pueden contener derivaciones incorrectas o respuestas finales contradictorias.
- El formato correcto de una llamada a herramienta no garantiza una selección de herramienta correcta.
- Los resultados de herramientas externas deben tratarse como entrada no confiable.
- El replay matemático reduce el olvido pero no demuestra retención de capacidades previas.
- No está establecido como seguro para acciones autónomas de alto impacto, médicas, financieras o legales.
- Solo se declara inglés; no hay soporte multilingüe documentado.
- Licencia `other`: la licencia del dataset de cálculo avanzado no estaba clara al publicar; es necesario verificar los términos de reutilización antes de uso comercial.
- No hay benchmarks externos de matemáticas, function calling, retención o seguridad; deben ejecutarse antes de producción.
- El modelo no ejecuta herramientas por sí mismo; requiere un runtime externo que parsee, ejecute y reinyecte resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DualMind-TKD-Agentic-1.7B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de cálculo avanzado: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Perfil del autor: https://huggingface.co/reaperdoesntknow
