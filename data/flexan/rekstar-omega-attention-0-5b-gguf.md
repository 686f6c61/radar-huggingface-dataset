# Flexan/rekstar-omega-attention-0.5b-GGUF

## Resumen

Omega Attention es un modelo de lenguaje pequeño (0.5B parámetros) desarrollado por Derek Robertson como parte de un experimento de arquitectura cognitiva artificial. Su función no es conversar ni razonar de forma general, sino actuar como un procesador especializado de atención: dado un espacio de trabajo cognitivo con metas, memorias, observaciones y eventos del sistema, el modelo selecciona una operación de atención (atender, mantener, cambiar, suprimir o ignorar) y devuelve una salida JSON compacta con la decisión. El modelo original está fine-tuneado desde `unsloth/Qwen2.5-0.5B-Instruct-bnb-4bit` mediante LoRA, y esta versión en concreto es una conversión a GGUF realizada por Flexan para facilitar su ejecución en entornos ligeros como llama.cpp u Ollama.

La relevancia de este modelo radica en su enfoque minimalista: en lugar de usar un LLM general para decidir continuamente qué debe recibir atención en un agente autónomo, Omega Attention ofrece un nodo cognitivo ligero y determinista en su formato de salida. Está pensado para experimentación con sistemas multi-agente, bucles de agente persistentes y módulos neuronales especializados. Su licencia MIT permite uso comercial sin restricciones, aunque su ámbito de aplicación es deliberadamente estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-0.5B-Instruct) |
| Parametros totales | ~502M (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-0.5B-Instruct-bnb-4bit`, una versión cuantizada en 4 bits del Qwen2.5-0.5B-Instruct. Sobre esta base se aplicó un fine-tuning con LoRA de rango 16 y alpha 16, lo que supone aproximadamente 8,8 millones de parámetros entrenables (un 1,75% del total). El entrenamiento se realizó con el framework Unsloth sobre una AMD Radeon 8060S con ROCm, durante 3 épocas y con 5.000 ejemplos de entrenamiento y 500 de evaluación.

La innovación principal no está en la arquitectura, sino en el objetivo de entrenamiento: el modelo aprende a emitir una decisión de atención en formato JSON estricto, con campos como `operation`, `target`, `confidence` y `reason_code`. Las cinco operaciones posibles son `ATTEND`, `MAINTAIN`, `SWITCH`, `SUPPRESS` e `IGNORE`. No se ha entrenado para generar texto libre ni para mantener conversaciones, sino para producir exclusivamente este contrato de salida.

## Capacidades

- Selección de operaciones de atención: el modelo elige entre atender, mantener, cambiar, suprimir o ignorar un elemento del espacio de trabajo cognitivo.
- Salida JSON estructurada y compacta, con campos predefinidos (`operation`, `target`, `confidence`, `reason_code`).
- Integración como componente en arquitecturas cognitivas artificiales y sistemas de agentes autónomos.
- Funcionamiento en bucles de agente persistentes, donde se consulta repetidamente para decidir el siguiente foco de atención.
- Soporte multilingüe: no disponible, entrenado únicamente en inglés.
- No dispone de capacidades de tool calling, visión, audio ni razonamiento general.

## Casos de uso

- Gestión de atención en agentes autónomos: el modelo puede integrarse en un bucle de agente donde recibe el estado cognitivo actual (metas, observaciones, eventos) y devuelve qué elemento debe recibir atención a continuación, permitiendo priorizar tareas sin invocar un LLM general.
- Arquitecturas cognitivas experimentales: como módulo especializado dentro de sistemas que simulan procesos de atención humana, donde se necesita una decisión rápida y determinista sobre el foco.
- Sistemas multi-agente: coordinación de varios agentes donde un nodo central decide qué agente o qué información merece atención en cada momento, reduciendo la carga computacional frente a usar un modelo grande.
- Filtrado de distracciones en entornos de simulación: el modelo puede suprimir observaciones irrelevantes o conflictivas en un espacio de trabajo simulado, mejorando la estabilidad del sistema.
- Prototipos de investigación en neurociencia computacional: como herramienta para estudiar mecanismos de atención artificial en entornos controlados.
- Pruebas de concepto de modelos pequeños especializados: sirve como ejemplo de cómo un modelo de 0,5B puede realizar una tarea concreta mejor que un LLM general si se entrena con un contrato de salida estricto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no está diseñado para tareas estándar de lenguaje (MMLU, HumanEval, GSM8K) y no se han reportado métricas de rendimiento en su tarea específica de gestión de atención.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cuantizaciones Q4 o inferiores; el modelo f16 ocupa aproximadamente 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 2060, integradas modernas). También funciona en CPU con llama.cpp.
- Cabe en GPUs de consumo: sí, incluso en las más modestas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. También puede usarse con transformers si se cargan los pesos safetensors originales.
- Latencia y throughput: no disponibles, pero al ser un modelo de 0,5B se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (procesadores de atención especializados). Como referencia, el modelo base Qwen2.5-0.5B-Instruct es un chatbot general de 0,5B con licencia Apache 2.0, pero no está especializado en gestión de atención. Otros modelos pequeños como SmolLM2-360M o TinyLlama-1.1B podrían adaptarse mediante fine-tuning para tareas similares, pero no existen versiones públicas con este contrato de salida específico.

## Limitaciones y advertencias

- No es un modelo conversacional: no debe usarse como chatbot ni para generación de texto general.
- Entrenado únicamente en inglés; no soporta otros idiomas.
- Riesgo de alucinación si se usa fuera de su dominio: puede emitir operaciones o targets inválidos si la entrada no se ajusta al formato esperado.
- Tarea deliberadamente estrecha: no es un modelo de razonamiento ni de conocimiento factual.
- No es un clasificador de seguridad ni un sustituto de decisiones humanas.
- Al ser un experimento, no hay garantías de robustez en producción; se recomienda validar exhaustivamente antes de integrarlo en sistemas críticos.
- La licencia MIT permite uso comercial, pero el autor no ofrece soporte ni mantenimiento.

## Enlaces

- [Repositorio GGUF en HuggingFace](https://huggingface.co/Flexan/rekstar-omega-attention-0.5b-GGUF)
- [Modelo original en HuggingFace](https://huggingface.co/rekstar/omega-attention-0.5b)
- [Perfil de Flexan en HuggingFace](https://huggingface.co/Flexan/Flexan)
- [GitHub de Derek Robertson](https://github.com/doctarock)
