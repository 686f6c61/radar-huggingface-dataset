# siddhartha-addy-globalids-labs/qwen3.5-0.8b-finance-lora

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario siddhartha-addy-globalids-labs. El adaptador se ha obtenido mediante destilación de conocimiento generalizada (GKD, por sus siglas en inglés) desde un modelo profesor compuesto por Qwen/Qwen3.5-2B más un adaptador PEFT adicional, hacia el modelo estudiante de 0.8B parámetros. El entrenamiento se realizó sobre el dataset `gbharti/finance-alpaca`, orientado a tareas de dominio financiero.

La relevancia de este adaptador radica en que permite especializar un modelo pequeño (0.8B) en el ámbito financiero sin necesidad de un ajuste fino completo, reduciendo costes computacionales y de almacenamiento. Al ser un adaptador LoRA, solo se guardan los pesos diferenciales, lo que facilita su distribución y despliegue. Sin embargo, la información pública es limitada: no se especifican la licencia, los idiomas soportados, ni los benchmarks de rendimiento, por lo que su uso en producción requiere verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-0.8B (arquitectura base no especificada) |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB, pero no se indica el número de parámetros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, sin cuantización explícita) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation) aplicada sobre el modelo base Qwen/Qwen3.5-0.8B. El entrenamiento utiliza Generalized Knowledge Distillation (GKD), un método que combina destilación on-policy con pérdida JSD (Jensen-Shannon Divergence). El profesor es un modelo Qwen3.5-2B al que se le ha añadido un adaptador PEFT adicional (cuya ruta se indica como `/Users/globalids/.cache/kd-runner/peft-adapter`). El estudiante es el modelo de 0.8B.

Los hiperparámetros de entrenamiento son: rango LoRA 32, alpha 64, módulos objetivo que incluyen proyecciones de atención y feed-forward (`down_proj`, `gate_proj`, `in_proj_qkv`, `in_proj_z`, `k_proj`, `o_proj`, `out_proj`, `q_proj`, `up_proj`, `v_proj`). Se realizaron 300 pasos con un batch efectivo de 4 y una tasa de aprendizaje de 0.0002. Los parámetros GKD son lambda 0.5 y beta 0.5. El dataset de entrenamiento es `gbharti/finance-alpaca`, que contiene instrucciones y respuestas en el dominio financiero.

## Capacidades

- Especialización en dominio financiero: el adaptador está entrenado para responder preguntas y seguir instrucciones relacionadas con finanzas, como se muestra en el ejemplo del README (explicación de interés compuesto).
- Hereda las capacidades del modelo base Qwen3.5-0.8B, aunque no se especifican en la documentación disponible.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales (visión, audio, etc.).
- Al ser un adaptador LoRA, se puede cargar y descargar dinámicamente sobre el modelo base, lo que facilita su integración en pipelines existentes.

## Casos de uso

- Asistente financiero conversacional: el modelo puede responder preguntas sobre conceptos como interés compuesto, hipotecas o inversiones, como se ilustra en el ejemplo de uso del README. Su tamaño reducido permite desplegarlo en entornos con recursos limitados.
- Análisis de documentos financieros: aunque no se especifica, un modelo entrenado en finance-alpaca podría utilizarse para extraer información o resumir textos financieros, siempre que se valide su rendimiento.
- Generación de respuestas en chatbots de banca o asesoría: al estar especializado en finanzas, puede integrarse en sistemas de atención al cliente para proporcionar explicaciones básicas.
- Prototipado rápido de aplicaciones financieras: al ser un adaptador ligero, es adecuado para experimentar con tareas de dominio sin necesidad de un ajuste fino completo.
- Educación financiera: puede utilizarse como herramienta de aprendizaje para explicar conceptos económicos a usuarios no expertos.
- Filtrado o clasificación de consultas financieras: aunque no hay evidencia, el adaptador podría adaptarse para tareas de clasificación si se combina con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 0.8B, los requisitos de VRAM son bajos. El modelo base Qwen3.5-0.8B puede ejecutarse en GPUs con 4-6 GB de VRAM en cuantización de 8 bits, aunque no se especifican valores exactos.
- El adaptador en sí ocupa 0.1 GB, por lo que la carga adicional es mínima.
- Se recomienda una GPU consumer como RTX 3060 o superior para inferencia en bfloat16, aunque no hay datos oficiales.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de HuggingFace, y el modelo base puede servirse con frameworks como vLLM o TGI, aunque no se documenta compatibilidad explícita.
- No se dispone de estimaciones de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ni se conocen adaptadores LoRA similares para el mismo dominio y tamaño.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución.
- El entrenamiento se realizó con solo 300 pasos sobre un dataset específico (finance-alpaca), lo que puede provocar sobreajuste o cobertura limitada de temas financieros.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez. El modelo puede generar respuestas incorrectas o inventadas, especialmente en dominios fuera del alcance del dataset.
- Al ser un adaptador, depende del modelo base Qwen3.5-0.8B; cualquier limitación de este (por ejemplo, longitud de contexto o idiomas) se hereda.
- No se dispone de información sobre la calidad de las respuestas en producción; se recomienda validar exhaustivamente antes de un despliegue real.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/siddhartha-addy-globalids-labs/qwen3.5-0.8b-finance-lora
- Checkpoint fusionado (modelo completo): https://huggingface.co/siddhartha-addy-globalids-labs/qwen3.5-0.8b-finance
- Paper de Generalized Knowledge Distillation (GKD): https://arxiv.org/abs/2306.13649
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
