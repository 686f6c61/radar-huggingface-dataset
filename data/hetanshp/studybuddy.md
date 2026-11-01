# HetanshP/StudyBuddy

## Resumen

StudyBuddy es un ajuste fino (fine-tune) del modelo meta-llama/Llama-3.2-1B-Instruct, publicado por el usuario HetanshP en HuggingFace. Se trata de un modelo de generacion de texto orientado a tareas de asistencia al estudiante (etiqueta "Student-assistant"), construido sobre la arquitectura Llama 3.2 de 1.000 millones de parametros. La model card es extremadamente escueta: no aporta informacion sobre el dataset de ajuste, el procedimiento de entrenamiento ni resultados de evaluacion.

El modelo hereda las caracteristicas del checkpoint base: arquitectura transformer decoder-only, ventana de contexto de 128.000 tokens (segun la especificacion oficial de Llama 3.2) y capacidades multilingues limitadas oficialmente al ingles. El ajuste fino parece orientado a especializar el comportamiento del modelo hacia el dominio educativo, aunque no hay documentacion que lo confirme mas alla de la etiqueta.

Su relevancia practica es limitada por el momento: cero descargas, cero "likes" y una model card sin informacion tecnica sustantiva. Debe tratarse como un experimento de ajuste fino de un modelo pequeno, no como un modelo listo para produccion. La licencia Apache 2.0 facilita su reutilizacion, pero la ausencia de evaluacion impide validar su calidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2, segun modelo base) |
| Parametros totales | 1.240 millones (1B, segun modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (segun especificacion de Llama 3.2; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible en la model card; el modelo base admite cuantizacion a 8 y 4 bits |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato por defecto de transformers; no confirmado explicitamente) |

## Arquitectura y entrenamiento

El modelo se basa en Llama 3.2 1B Instruct, un transformer decoder-only con atencion por grupos (GQA), activacion SwiGLU y normalizacion RMSNorm, tal como corresponde a la familia Llama 3.2. El checkpoint base fue entrenado por Meta con un corpus multilingue de gran escala y posteriormente alineado mediante instrucciones y preferencias humanas (SFT y RLHF/DPO, segun la documentacion publica de Meta).

En cuanto al ajuste fino especifico de StudyBuddy, la informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas como LoRA, QLoRA o ajuste completo. La model card unicamente declara la etiqueta "Student-assistant" y el modelo base, sin hiperparametros ni metodologia. No hay innovaciones tecnicas documentadas (decodificacion especulativa, atencion lineal ni variantes arquitectonicas propias).

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Llama 3.2 1B Instruct.
- Razonamiento basico y respuesta a instrucciones, con la especializacion declarada hacia tareas de asistencia al estudiante.
- Soporte de conversacion multi-turno (capacidad del modelo base).
- Capacidad de tool calling / function calling: no documentada en este fine-tune; el modelo base Llama 3.2 1B Instruct la soporta parcialmente, pero no hay confirmacion de que el ajuste la preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles segun la model card; el modelo base soporta varios idiomas, pero el ajuste declara solo "en".
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes educativos: el modelo puede emplearse para generar respuestas de apoyo a estudiantes en ingles (explicaciones, resumenes, preguntas de repaso) en entornos de prueba, dado su caracter de experimento de ajuste fino.
- Generacion de preguntas y ejercicios de estudio: util para crear cuestionarios o material de practica en ingles a partir de apuntes, aprovechando la especializacion declarada hacia el dominio educativo.
- Chatbot de bajo coste en hardware consumer: al tratarse de un modelo de 1B, puede ejecutarse en GPU de gama media o incluso en CPU con cuantizacion, lo que permite desplegar un asistente basico sin infraestructura dedicada.
- Experimentacion academica con fine-tuning: sirve como referencia para investigadores que quieran reproducir o comparar ajustes finos sobre Llama 3.2 1B Instruct en dominios educativos.
- Generacion de texto auxiliar en pipelines de procesamiento de lenguaje: tareas de resumen o reescritura de textos cortos en ingles donde el coste computacional sea prioritario.
- Base para ajustes posteriores: al estar bajo Apache 2.0 y disponible en transformers, puede reutilizarse como punto de partida para especializaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,5 GB solo para pesos, mas overhead de activaciones y cache KV (del orden de 3-4 GB en total para contextos cortos).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 1,3 GB para pesos; en 4 bits, aproximadamente 0,8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPU de datacenter (A100, H100) sin problema, aunque estaria infrautilizada.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, y en CPU con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp, Ollama, vLLM y TGI (compatibles con la arquitectura Llama 3.2).
- Latencia y throughput: no disponibles; al ser un modelo de 1B, se espera una latencia baja y un throughput alto en GPU consumer, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HetanshP/StudyBuddy | 1B (base Llama 3.2) | 128k (heredado, no confirmado) | Apache 2.0 | HuggingFace, sin descargas | Fine-tune educativo sin evaluacion publicada |
| meta-llama/Llama-3.2-1B-Instruct | 1B | 128k | Llama 3.2 Community License | HuggingFace, ampliamente usado | Modelo base oficial, con evaluacion publica |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | HuggingFace | Alternativa de tamano similar con licencia permisiva |
| SmolLM2-1.7B-Instruct | 1,7B | 8k | Apache 2.0 | HuggingFace | Modelo pequeno orientado a eficiencia |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento: no es posible evaluar sesgos introducidos por el ajuste fino ni la calidad de las respuestas.
- Riesgo de alucinacion inherente a un modelo de 1B de parametros, agravado por la falta de evaluacion especifica del fine-tune.
- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Contexto: aunque el modelo base soporta 128k tokens, no hay confirmacion de que el ajuste fino preserve esa ventana; en la practica, modelos de 1B degradan su calidad en contextos muy largos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Llama 3.2 esta sujeto a la Llama 3.2 Community License de Meta, cuyos terminos pueden aplicar en cascada; conviene revisar la compatibilidad antes de un uso comercial.
- Sin senales de validacion: cero descargas y cero "likes" en el momento de la consulta; no hay evidencia de que el modelo haya sido probado por terceros.
- No apto para produccion sin evaluacion previa: se recomienda validar con un conjunto propio de tareas antes de cualquier despliegue real.

## Enlaces

- HuggingFace: https://huggingface.co/HetanshP/StudyBuddy
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Documentacion oficial de Llama 3.2 (Meta): https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
