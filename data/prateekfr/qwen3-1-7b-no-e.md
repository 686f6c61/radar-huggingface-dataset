# prateekfr/qwen3-1.7b-no-e

## Resumen

Qwen3-1.7B Lipogram Model es un ajuste fino del modelo Qwen3-1.7B de Alibaba Cloud, desarrollado por el usuario prateekfr, que impone una restriccion a nivel de caracter: generar texto en ingles fluido y gramatical sin utilizar nunca la letra "e" ni "E" (un lipograma). El modelo parte de la arquitectura Qwen3 de 1.720 millones de parametros y se distribuye como pesos fusionados en FP16, con licencia Apache 2.0.

La relevancia de este modelo es metodologica: demuestra una cadena de post-entrenamiento en tres capas que combina enmascaramiento de logits (bloqueo de 103.639 tokens, el 68,33% del vocabulario de Qwen3), ajuste supervisado con QLoRA de 4 bits sobre 180 pares de instrucciones verificados manualmente, y optimizacion con GRPO (Group Relative Policy Optimization) para mejorar fluidez, consistencia de longitud y diversidad lexica.

Es un modelo de nicho orientado a generacion de texto restringida (constrained generation), util como referencia tecnica para investigacion en decodificacion controlada y post-entrenamiento con refuerzo, no como modelo de proposito general. Solo soporta ingles y su uso practico esta limitado al cumplimiento estricto de la restriccion del lipograma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; no especificada en la model card) |
| Tipos de cuantizacion | FP16 (pesos publicados); GGUF F16 preconvertido; QLoRA 4 bits usado solo durante el entrenamiento |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3-1.7B, sin modificaciones estructurales respecto al modelo base. La innovacion reside en el pipeline de post-entrenamiento en tres etapas. Primero, un enmascaramiento de logits precalculado que bloquea 103.639 tokens (68,33% del vocabulario) cuyo texto decodificado contiene la letra "e" o "E". Segundo, un ajuste supervisado con QLoRA de 4 bits sobre 180 pares de instrucciones y respuestas sin la letra "e", verificados manualmente. Tercero, un entrenamiento con GRPO que optimiza recompensas de fluidez, consistencia de longitud y diversidad lexica.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset mas alla de los 180 pares de SFT, ni detalles sobre el esquema de recompensas de GRPO. Tampoco se indica si se aplicaron tecnicas adicionales como decodificacion especulativa o atencion lineal. El enmascaramiento de logits es imprescindible en inferencia: los pesos por si solos no garantizan la ausencia de la letra "e", por lo que el autor proporciona codigo de ejemplo que aplica la mascara en cada paso de generacion.

## Capacidades

- Generacion de texto en ingles con restriccion estricta de lipograma (sin "e" ni "E").
- Generacion condicionada por instrucciones (formato chat con tokens `<|im_start|>` y `<|im_end|>`).
- Mantenimiento de fluidez y gramatica bajo la restriccion, segun los resultados del benchmark Gadsby.
- Diversidad lexica medida mediante n-gramas (92,5% en la etapa RL).
- Consistencia de longitud de respuesta como objetivo de optimizacion.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada exclusivamente al ingles.

## Casos de uso

- Investigacion en decodificacion restringida: el modelo sirve como caso de estudio reproducible de enmascaramiento de logits combinado con SFT y GRPO, permitiendo comparar etapas (base + mascara, SFT + mascara, RL + mascara) con las metricas del benchmark Gadsby.
- Generacion creativa con restriccion (Oulipo, lipogramas literarios): escritura de poemas, relatos cortos o ejercicios de estilo sin la letra "e", donde el modelo mantiene gramatica y fluidez en ingles.
- Pruebas de robustez de pipelines de inferencia: validacion de implementaciones de mascaras de logits personalizadas en transformers, llama.cpp u Ollama, comprobando que ningun token prohibido se emite.
- Educacion y demostraciones de post-entrenamiento: ejemplo didactico de como un ajuste fino pequeno (180 pares) mas RL puede transformar el comportamiento de un modelo de 1.7B en una tarea de cumplimiento estricto.
- Generacion de datos sinteticos con restricciones de vocabulario: produccion de corpus en ingles sin la letra "e" para experimentos de linguistica computacional o entrenamiento de otros modelos.
- Despliegue ligero en local: al ser un modelo de 1.7B en FP16 con GGUF disponible, puede ejecutarse en CPU o GPU de consumo para demos interactivas de generacion restringida.

## Benchmarks y rendimiento

Resultados publicados por el autor en la suite Gadsby Benchmark:

| Etapa de arquitectura | Lipograma estricto (pass) | Tasa de respuesta usable | Diversidad n-gramas |
|---|---|---|---|
| Qwen-1.7B base + mascara | 88,0% | 28,0% | 91,5% |
| SFT (180 reescrituras) + mascara | 96,0% | 80,0% | 91,5% |
| RL (GRPO, mejor) + mascara | 100,0% | 88,0% | 92,5% |

La nota del autor indica que la baja tasa de respuesta usable del modelo base se debe a que los modelos sin alinear intentan sustituir tokens en otros idiomas para evadir la restriccion. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 3,4 GB solo para pesos (1.720 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizaciones de 8 bits o 4 bits: no disponible en la informacion proporcionada (solo se publica FP16 y GGUF F16).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 con margen; RTX 3060/4060, RTX 4090, A100 o H100 son suficientes. Cabe en GPU de consumo.
- Despliegue: transformers (con mascara de logits manual), llama.cpp y Ollama mediante el GGUF F16 incluido. No se documenta soporte para vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. La generacion token a token con mascara aplicada en cada paso anade coste frente a una generacion estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Restriccion de lipograma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prateekfr/qwen3-1.7b-no-e | 1.720 M | no disponible | Si (sin "e"/"E") | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3-1.7B (base) | 1.720 M | no disponible | No | Apache 2.0 | Hugging Face |
| Modelos de generacion restringida comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen en la informacion disponible otros modelos publicos de lipograma directamente comparables; la comparacion natural es con el modelo base Qwen3-1.7B, que no impone restriccion alguna y sirve como referencia de capacidades generales.

## Limitaciones y advertencias

- El modelo solo garantiza el lipograma si se aplica el enmascaramiento de logits en inferencia; los pesos por si solos no lo aseguran.
- Solo soporta ingles; el entrenamiento y la evaluacion se limitan a ese idioma.
- El modelo base tiende a evadir la restriccion mediante sustituciones de tokens en otros idiomas, problema que el post-entrenamiento mitiga pero que conviene monitorizar.
- La tasa de respuesta usable es del 88,0% en el mejor caso, por lo que aproximadamente una de cada ocho respuestas puede no ser plenamente util.
- El conjunto de SFT es muy pequeno (180 pares), lo que limita la generalizacion a dominios e instrucciones no cubiertos.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni rendimiento en tareas generales; el ajuste puede degradar capacidades del modelo base fuera del lipograma.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar el cumplimiento de la licencia del modelo base Qwen3-1.7B.
- No se documentan requisitos de contexto ni comportamiento en conversaciones multi-turno largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prateekfr/qwen3-1.7b-no-e
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
