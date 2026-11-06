# qatfactory/Qwen3.5-9B-NVFP4-LoRA-r16-QAD

## Resumen

Qwen3.5-9B-NVFP4-LoRA-r16-QAD es una versión cuantizada del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario qatfactory bajo licencia Apache 2.0. Se trata de un artefacto de cuantización de 8 bits en formato NVFP4 (formato de punto flotante de 4 bits con escalado NV) generado mediante Quantization-Aware Training (QAT) combinado con un adaptador LoRA de rango 16. El resultado se distribuye en formato `compressed-tensors` y está pensado para su despliegue con vLLM.

El modelo base Qwen3.5-9B pertenece a la familia Qwen3.5, una generación de modelos transformer densos de Alibaba. Con 9.409.813.744 parámetros totales (aproximadamente 9,4 mil millones), el artefacto cuantizado ocupa 8,9 GB en el repositorio, lo que lo hace atractivo para inferencia en GPUs de consumo y de centro de datos con requisitos de memoria reducidos frente al modelo en precisión completa.

La relevancia de esta publicación radica en su enfoque de cuantización: el uso de QAT con LoRA permite preservar la calidad del modelo original mejor que una cuantización post-entrenamiento (PTQ) naive, mientras que el formato NVFP4 apunta a aceleración en hardware Blackwell de NVIDIA. No obstante, el acceso está restringido (gated) y no se han publicado métricas de rendimiento ni detalles del proceso de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, detalles no disponibles) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (4 bits, 8-bit según tags), compressed-tensors, QAT con LoRA r16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer denso de la familia Qwen3.5 desarrollada por Alibaba Qwen. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original dentro de la información proporcionada.

La innovación principal de este artefacto es su pipeline de cuantización: se aplicó Quantization-Aware Training (QAT) con un adaptador LoRA de rango 16 sobre el modelo base, produciendo pesos en formato NVFP4 empaquetados con `compressed-tensors`. El tag "8-bit" junto a "nvfp4" sugiere una cuantización mixta o un esquema de escalado que combina bloques de 4 bits con metadatos de 8 bits. El resultado está optimizado para el motor de inferencia vLLM. No se han publicado detalles sobre la metodología exacta de QAT, el dataset de calibración ni las métricas de degradación respecto al modelo original.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque no se detallan capacidades específicas en la información disponible.
- Generación de código y matemáticas: presumiblemente soportadas por el modelo base, sin confirmación explícita.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (los idiomas no están declarados en la ficha).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Inferencia optimizada: compatible con vLLM y formato compressed-tensors para despliegue eficiente.

## Casos de uso

- Despliegue en producción con vLLM: el formato compressed-tensors y NVFP4 permiten servir el modelo con menor huella de memoria que la versión en BF16, adecuado para entornos con GPUs limitadas en VRAM.
- Inferencia en GPUs de consumo: con 8,9 GB de pesos, el modelo puede caber en GPUs consumer de 12-16 GB, facilitando prototipado local de aplicaciones de generación de texto.
- Evaluación de técnicas QAT: útil para investigadores que quieran comparar la calidad de un modelo cuantizado con QAT+LoRA frente a alternativas PTQ sobre el mismo base.
- Fine-tuning adicional sobre el adaptador: el uso de LoRA r16 en el pipeline de cuantización sugiere que el artefacto puede servir como punto de partida para ajustes posteriores, aunque no se documenta el procedimiento.
- Benchmarking de cuantización NVFP4: permite medir throughput y latencia de NVFP4 en hardware compatible (por ejemplo, GPUs Blackwell) frente a otros formatos.
- Sustitución de modelos de 9B en pipelines existentes: al mantener la interfaz del base Qwen3.5-9B, puede integrarse en aplicaciones ya construidas sobre ese modelo reduciendo costes de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB solo para pesos en NVFP4; se debe añadir memoria para KV cache y overhead del runtime (típicamente 2-6 GB adicionales según contexto y batch).
- GPUs recomendadas: NVIDIA Blackwell (B100, B200, RTX 50 series) para aprovechar NVFP4 de forma nativa; GPUs Ada/Hopper (H100, L40S, RTX 4090) pueden requerir soporte de emulación o kernels específicos en vLLM.
- ¿Cabe en GPU consumer? Sí, previsiblemente en GPUs con 16 GB o más (RTX 4080, 4090, 5070 Ti, 5080), siempre que vLLM soporte NVFP4 en esa arquitectura.
- Opciones de despliegue: vLLM (librería declarada), con soporte de `compressed-tensors`. No se confirma compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-NVFP4-LoRA-r16-QAD | 9,4B | no disponible | NVFP4 (QAT+LoRA) | Apache 2.0 | Gated en HF |
| Qwen/Qwen3.5-9B (base) | 9,4B | no disponible | BF16/FP16 | Apache 2.0 (presumible) | Público |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 | múltiples (GGUF, AWQ, GPTQ) | Apache 2.0 | Público |
| Llama-3.1-8B-Instruct | 8,0B | 131.072 | múltiples | Llama 3.1 Community | Público |

La comparativa con Qwen2.5-7B-Instruct y Llama-3.1-8B-Instruct se ofrece como referencia de categoría (modelos densos de 7-9B); no se dispone de datos de rendimiento comparativo para el modelo descrito.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso automatizado en pipelines.
- Sin benchmarks publicados: no hay evidencia empírica de la degradación introducida por la cuantización NVFP4+QAT respecto al base.
- Compatibilidad hardware limitada: NVFP4 está optimizado para GPUs Blackwell; en arquitecturas anteriores el rendimiento puede degradarse o no estar soportado por vLLM.
- Idiomas no declarados: se desconoce el soporte multilingüe real del artefacto.
- Riesgo de alucinación: heredado del modelo base, agravado potencialmente por la cuantización agresiva a 4 bits.
- Sesgos: no documentados en la información disponible; se asumen los del modelo base Qwen3.5-9B.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y del acceso gated.
- Contexto desconocido: no se especifica la longitud de contexto soportada, lo que impide planificar aplicaciones con ventanas largas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/qatfactory/Qwen3.5-9B-NVFP4-LoRA-r16-QAD
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Documentación de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
