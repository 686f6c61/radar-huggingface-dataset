# cosmicishan/gemma-7b-PDDL-CoT-binary

## Resumen

`cosmicishan/gemma-7b-PDDL-CoT-binary` es un ajuste fino del modelo Gemma de 7B parámetros orientado a la generación de planes en formato PDDL (Planning Domain Definition Language) mediante razonamiento en cadena de pensamiento (chain-of-thought). Lo desarrolla el usuario de Hugging Face `cosmicishan` y deriva de un ajuste previo del mismo autor, `cosmicishan/gemma-7b-PDDL-CoT-SFT`, que a su vez parte del Gemma base de Google. El modelo resuelve el problema de traducir descripciones de tareas de planificación en lenguaje natural a secuencias de acciones PDDL válidas, un paso crítico en pipelines de planificación automática y agentes que razonan sobre estados del mundo.

El sufijo "binary" sugiere una especialización del ajuste hacia decisiones binarias o clasificación de transiciones dentro del proceso de planificación, aunque la información pública disponible no detalla esa variante. El repositorio tiene 8.537.680.896 parámetros en formato safetensors (17,1 GB) y se distribuye bajo licencia Gemma con acceso restringido (gated), lo que obliga a aceptar las condiciones en Hugging Face antes de descargarlo.

Su relevancia es acotada pero específica: cubre el nicho de modelos pequeños y desplegables localmente para razonamiento simbólico estructurado, donde los LLM generalistas fallan al producir PDDL sintácticamente válido. No hay métricas publicadas ni descargas registradas, por lo que debe evaluarse como un artefacto de investigación en fase temprana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 7B) |
| Parámetros totales | 8.537.680.896 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (uso sujeto a los términos de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma de 7B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y activaciones GeGLU, entrenado originalmente por Google sobre billones de tokens de texto multilingüe. Sobre esa base, `cosmicishan` aplicó un ajuste supervisado (SFT) para producir cadenas de razonamiento que desembocan en planes PDDL, y después un segundo ajuste que da lugar a esta variante "binary". No se dispone de información pública sobre el volumen de datos de ajuste, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

La innovación declarada es el formato de salida: el modelo genera un razonamiento intermedio (chain-of-thought) antes de emitir el plan PDDL final, lo que facilita la verificación del proceso y reduce errores de sintaxis en dominios de planificación. No hay detalles publicados sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y razonamiento paso a paso (chain-of-thought) orientado a tareas de planificación.
- Producción de planes en formato PDDL a partir de descripciones de dominio y problema.
- Razonamiento simbólico multi-paso sobre estados, acciones y precondiciones.
- Ajuste específico para decisiones binarias dentro del proceso de planificación (según el sufijo "binary").
- Compatible con text-generation-inference y endpoints de Hugging Face.
- Soporte de tool calling: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Cobertura multilingüe: no disponible; probablemente centrada en inglés por el dominio PDDL.

## Casos de uso

- Planificación automática en robótica: el modelo traduce una descripción de tarea en lenguaje natural a un plan PDDL que un planificador clásico (Fast Downward, VAL) puede validar y ejecutar.
- Agentes que razonan sobre estados del mundo: integrado en un bucle de agente, genera la siguiente acción PDDL dado el estado actual, con la cadena de pensamiento como traza auditable.
- Generación de dominios y problemas de prueba: útil para crear datasets sintéticos de PDDL que alimenten benchmarks de planificación.
- Asistencia en investigación en IA simbólica: permite comparar planes generados por LLM frente a planificadores clásicos en dominios como Blocksworld o Logistics.
- Enseñanza de planificación automática: el chain-of-thought explícito sirve como material didáctico para explicar cómo se deriva un plan.
- Prototipado local en estaciones de trabajo: con 8,5B parámetros y cuantización a 4 bits cabe en GPUs de consumo, lo que facilita experimentación sin infraestructura cloud.
- Verificación de pipelines de CI: como generador de casos PDDL para tests de regresión de planificadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 17 GB, lo que requiere una GPU de 24 GB o superior (RTX 3090/4090, A10G, L4 con margen justo).
- VRAM estimada en cuantización 8 bits: alrededor de 9 GB; en 4 bits, unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar y throughput alto; RTX 4090 para inferencia local en FP16; RTX 3060 12 GB o RTX 4060 Ti 16 GB con cuantización 8 bits.
- Cabe en GPU de consumo: sí, con cuantización (4 u 8 bits) en tarjetas de 8-16 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM. No hay GGUF publicado, por lo que llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-7b-PDDL-CoT-binary | 8,5B | no disponible | PDDL + chain-of-thought | Gemma | Gated, 0 descargas |
| Gemma 7B (base) | 8,5B | 8K (según documentación de Google) | Generalista | Gemma | Pública |
| Llama 3.1 8B Instruct | 8B | 128K | Generalista con tool calling | Llama 3.1 | Pública |
| Qwen2.5 7B Instruct | 7,6B | 128K | Generalista, fuerte en código | Apache 2.0 | Pública |

La comparación directa con los generalistas es desfavorable en cobertura, pero el ajuste específico a PDDL puede superarlos en validez sintáctica de planes, extremo que no puede confirmarse sin benchmarks publicados.

## Limitaciones y advertencias

- No hay benchmarks ni evaluaciones publicadas: el rendimiento real en generación de PDDL es desconocido.
- Cero descargas y cero likes en Hugging Face: modelo sin validación por la comunidad.
- Acceso restringido (gated): requiere aceptar los términos de la licencia Gemma, lo que limita su uso en pipelines automatizados y en entornos corporativos con políticas estrictas.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos de Google antes de desplegarlo en producción.
- Idiomas soportados no documentados; es probable que el ajuste esté centrado en inglés y en la sintaxis PDDL.
- Longitud de contexto no confirmada; los planes largos pueden truncarse.
- Riesgo de alucinación en la sintaxis PDDL: los planes generados deben validarse siempre con un planificador formal (VAL, Fast Downward) antes de ejecutarse.
- Sesgos heredados del Gemma base, no evaluados en este ajuste.
- Modelo de investigación sin mantenimiento declarado; fecha de creación futura (2026) en los metadatos, lo que sugiere posible inconsistencia en el registro.

## Enlaces

- Hugging Face: https://huggingface.co/cosmicishan/gemma-7b-PDDL-CoT-binary
- Modelo base del ajuste: https://huggingface.co/cosmicishan/gemma-7b-PDDL-CoT-SFT
- Gemma (Google): https://huggingface.co/google/gemma-7b
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
