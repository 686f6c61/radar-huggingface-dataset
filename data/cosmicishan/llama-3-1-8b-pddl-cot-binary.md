# cosmicishan/Llama-3.1-8B-PDDL-CoT-Binary

## Resumen

Llama-3.1-8B-PDDL-CoT-Binary es un ajuste fino (fine-tuning) del modelo cosmicishan/Llama-3.1-8B-PDDL-CoT-SFT, que a su vez parte de la familia Llama 3.1 de Meta. El modelo está especializado en la generación de PDDL (Planning Domain Definition Language) para tareas de planificación automática, empleando razonamiento en cadena (chain-of-thought, CoT) y una variante "binary" que, por el nombre, sugiere una formulación binaria del problema de planificación (posiblemente codificación de estados o predicados como variables binarias), aunque los detalles exactos no están documentados en la información disponible.

El autor es cosmicishan, un desarrollador individual que publica este modelo en Hugging Face con acceso restringido (gated). Se trata de un modelo de 8.030.261.248 parámetros (aproximadamente 8 mil millones), empaquetado en safetensors con un repositorio de 16,1 GB. La arquitectura subyacente es la de Llama 3.1 (transformer decoder-only) con una longitud de contexto que, en la versión original de Meta, alcanza los 128 000 tokens, aunque no se confirma si este ajuste conserva esa ventana.

La relevancia de este modelo radica en su nicho: la planificación automática con PDDL es una tarea clásica de IA simbólica que requiere razonamiento estructurado y consistencia formal. Un LLM ajustado para generar dominios y problemas PDDL, con razonamiento intermedio explícito, puede servir como puente entre el razonamiento en lenguaje natural y los planificadores clásicos (Fast Downward, VAL, etc.). Sin embargo, la información pública es muy escasa (cero descargas, cero likes, sin benchmarks ni documentación de entrenamiento), lo que limita la evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la base Llama 3.1 soporta 128 000 tokens; no se confirma para este ajuste) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se listan GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Acceso | Restringido (gated), requiere aceptar condiciones en Hugging Face |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 16,1 GB |
| Modelo base | cosmicishan/Llama-3.1-8B-PDDL-CoT-SFT |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso con atención multi-cabeza agrupada (GQA), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo original de Meta fue preentrenado sobre aproximadamente 15 billones de tokens y posteriormente alineado mediante RLHF y DPO. Este ajuste concreto parte de cosmicishan/Llama-3.1-8B-PDDL-CoT-SFT, un SFT (supervised fine-tuning) sobre datos de PDDL con chain-of-thought, y añade una variante "binary" cuyo significado exacto no está documentado.

No se dispone de información sobre el volumen de tokens de ajuste, la composición del dataset, el uso de RLHF/DPO adicional, ni hiperparámetros de entrenamiento. El sufijo "CoT" indica que el modelo fue entrenado para producir trazas de razonamiento intermedias antes de la respuesta final (por ejemplo, descomponer la formalización de un dominio PDDL en pasos). El sufijo "Binary" sugiere una representación binaria de estados o predicados, frecuente en codificaciones para planificadores SAT o en formulaciones de planificación como búsqueda binaria, pero no hay confirmación. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto especializada en PDDL: producción de dominios (predicados, acciones, precondiciones, efectos) y problemas (objetos, estado inicial, goal).
- Razonamiento en cadena (chain-of-thought): el modelo está ajustado para emitir pasos intermedios de razonamiento antes de la formalización final, lo que facilita la verificación manual de la lógica.
- Formalización de problemas de planificación: traducción de descripciones en lenguaje natural a representaciones PDDL.
- Variante "binary": presumiblemente orientada a codificaciones binarias de estados o predicados, aunque la funcionalidad exacta no está documentada.
- Herencia de Llama 3.1: capacidad general de generación de texto, razonamiento y código en inglés (y cierto multilingüismo), potencialmente degradada por el ajuste especializado.
- Soporte de tool calling / function calling: no confirmado para este ajuste (la base Llama 3.1 lo soporta, pero el ajuste puede haberlo alterado).
- Soporte de agentes y multi-step reasoning: parcial, en tanto que el CoT permite descomposición en pasos, pero no hay evidencia de integración con frameworks de agentes.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponibles; no se documenta vision ni audio.

## Casos de uso

- Generación automática de dominios PDDL: a partir de una descripción en lenguaje natural de un dominio (por ejemplo, logística, robotica de almacen), el modelo produce el archivo `domain.pddl` con predicados, acciones y esquemas. Es adecuado por su ajuste específico en PDDL y su CoT, que permite revisar la lógica paso a paso.
- Formalización de problemas de planificación: dado un escenario concreto (objetos, estado inicial y goal), el modelo genera el `problem.pddl` correspondiente, reduciendo el esfuerzo manual de ingeniería de conocimiento.
- Asistencia a planificadores clásicos: integración en un pipeline donde el LLM produce el dominio y el problema, y un planificador como Fast Downward o VAL valida y resuelve. El CoT facilita la depuración de errores de sintaxis o semántica.
- Educación e investigación en IA simbólica: generación de ejemplos PDDL para docencia o para aumentar datasets de planificación, con trazas de razonamiento que explican cada decisión.
- Validación y reparación de PDDL: el modelo puede usarse para comparar una formalización existente con una descripción en lenguaje natural y sugerir correcciones, aprovechando el razonamiento intermedio.
- Prototipado de agentes de planificación: en sistemas que requieren descomponer una tarea de alto nivel en acciones formalizables, el modelo actúa como capa de traducción entre intención y representación simbólica.
- Generación de datos sintéticos para entrenar planificadores neuronales: producción de pares (descripción, PDDL) y trazas CoT para aumentar corpus de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (fp16/bf16) se requieren aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache (típicamente 18-20 GB en total para contextos moderados). En cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 4,5-5,5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para fp16 sin compromisos; RTX 4090 (24 GB) para fp16 con contextos moderados; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a fp16 (24 GB) y en GPUs de 8-16 GB mediante cuantización 8 o 4 bits (si se generan pesos GGUF/AWQ, no publicados).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), endpoints compatibles; llama.cpp/Ollama/vLLM solo si se convierten los pesos, ya que no se publican GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Acceso |
|---|---|---|---|---|---|
| cosmicishan/Llama-3.1-8B-PDDL-CoT-Binary | 8,03 B | No disponible | PDDL + CoT + binary | Llama 3.1 | Gated |
| cosmicishan/Llama-3.1-8B-PDDL-CoT-SFT (base) | ~8 B | No disponible | PDDL + CoT | Llama 3.1 | No disponible |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 000 | Generalista | Llama 3.1 | Gated |
| Mistral-7B-Instruct | 7,2 B | 32 000 | Generalista | Apache 2.0 | Abierto |

La comparativa con alternativas especializadas en PDDL no está disponible: no se conocen modelos públicos comparables en este nicho con datos de rendimiento verificables.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del preentrenamiento de Llama 3.1; el ajuste especializado puede amplificar sesgos de dominio (por ejemplo, supuestos implícitos sobre tipos de objetos o acciones).
- Riesgo de alucinacion: alto en tareas de formalización; el modelo puede generar PDDL sintácticamente plausible pero semánticamente incorrecto (predicados mal tipados, precondiciones inconsistentes). Se recomienda validación con VAL o un planificador.
- Limitaciones de contexto o idioma: no se documentan; la ventana efectiva del ajuste puede diferir de los 128 000 tokens de la base.
- Restricciones de licencia: Llama 3.1 Community License; uso comercial permitido con condiciones (atribución, límite de 700 millones de usuarios mensuales para ciertos usos, cumplimiento de la política de uso aceptable). El acceso está restringido (gated), lo que exige aceptar condiciones en Hugging Face.
- Caveats para produccion: cero descargas y cero likes indican falta de validación comunitaria; ausencia de benchmarks, de documentación de entrenamiento y de pesos cuantizados; el sufijo "binary" no está explicado; no se confirma soporte de tool calling ni multilingüismo; el repositorio de 16,1 GB sugiere pesos en fp16 sin variantes optimizadas.

## Enlaces

- Hugging Face: https://huggingface.co/cosmicishan/Llama-3.1-8B-PDDL-CoT-Binary
- Modelo base: https://huggingface.co/cosmicishan/Llama-3.1-8B-PDDL-CoT-SFT
- Llama 3.1 (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- PDDL (referencia): https://planning.wiki/ref/pddl
- Fast Downward (planificador): https://www.fast-downward.org/
- VAL (validador de planes): https://github.com/KCL-Planning/VAL
