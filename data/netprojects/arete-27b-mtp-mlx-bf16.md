# netprojects/Arete-27B-MTP-MLX-bf16

## Resumen

Arete-27B-MTP-MLX-bf16 es una conversión al framework MLX de Apple Silicon del modelo NousResearch/Arete-27B, un ajuste fino supervisado completo de Qwen3.8-27B realizado por Nous Research. El objetivo del ajuste es ofrecer respuestas factuales y directas sobre temas políticamente sensibles en siete áreas concretas, manteniendo al mismo tiempo las capacidades generales y agénticas del modelo base. Esta build conserva los pesos en bfloat16 (55,6 GB) e incorpora una cabeza MTP (multi-token prediction) para acelerar la decodificación.

El modelo tiene 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) y es multimodal de tipo image-text-to-text, aunque el codificador de visión se mantuvo congelado durante el entrenamiento, que fue exclusivamente textual. La licencia es Apache 2.0 y el formato de pesos es safetensors en precisión bf16, empaquetado para su uso con las librerías mlx-lm (texto) y mlx-vlm (imágenes).

La relevancia de esta build radica en que permite ejecutar un modelo de 27B con capacidades multimodales y agénticas en hardware Apple Silicon con memoria unificada, algo que las builds cuantizadas del mismo repositorio hacen aún más accesible (desde 11,8 GB en 2.5-bit). La cabeza MTP incluida es la del modelo base Qwen/Qwen3.8-27B, no la de Arete, y ofrece aceleraciones medidas de hasta 2,18x en decodificación greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con cabeza MTP; derivado de Qwen3.8-27B |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 (esta build); el repositorio ofrece tambien 6-bit, 8-bit, 4-bit, 3-bit y 2.5-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), libreria MLX |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal heredado de Qwen3.8-27B, con un codificador de visión que se mantuvo congelado durante el ajuste fino. Nous Research realizó un ajuste fino supervisado completo (full supervised fine-tune) sobre datos exclusivamente textuales, orientado a mejorar la factualidad y reducir la propaganda en respuestas sobre siete áreas políticamente sensibles, sin sacrificar las capacidades generales ni las habilidades agénticas del modelo base. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo etapas de RLHF o DPO.

La build añade una cabeza MTP (multi-token prediction) que actúa como modelo borrador integrado para decodificación especulativa. Es importante señalar que esta cabeza es la del modelo base Qwen/Qwen3.8-27B (revisión `37561816`), cuantizada al ancho de bits de cada build, y fue entrenada contra el modelo base, no contra Arete-27B. El `config.json` original de Arete-27B fija `mtp_num_hidden_layers` a 0; esta build lo establece a 1 para que los cargadores detecten la cabeza incluida. Cada token propuesto por la MTP es verificado por el modelo completo, de modo que con decodificación greedy el texto coincide con la decodificación plana salvo en empates cercanos.

## Capacidades

- Generación de texto conversacional y respuestas factuales y directas sobre temas sensibles en siete áreas.
- Razonamiento general y habilidades agénticas heredadas del modelo base.
- Capacidades de codigo y terminal (Terminal-Bench-2.1 reportado en 70 para Arete-27B frente a 67 del base).
- Tool calling / function calling mediante el formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Capacidades multimodales de imagen a texto (image-text-to-text) mediante mlx-vlm, aunque el codificador de visión se congeló durante el ajuste.
- Modo thinking (razonamiento extendido) activable o desactivable; Nous Research evaluó el modelo con thinking desactivado.
- Decodificación acelerada mediante cabeza MTP integrada como modelo borrador.
- Capacidades multilingües: no disponible en la informacion proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con respuestas directas y verificables, y su ajuste orientado a factualidad reduce el riesgo de respuestas evasivas o propagandísticas en temas sensibles.
- Generación de código en producción: soporta tool calling en formato OpenAI y puede integrarse en pipelines de CI/CD o asistentes de terminal, con un rendimiento reportado de 70 en Terminal-Bench-2.1.
- Análisis de capturas de pantalla y documentación visual: mediante mlx-vlm puede responder preguntas sobre imágenes, como errores en una terminal o capturas de interfaz, útil en herramientas de soporte técnico.
- Asistentes agénticos de múltiples pasos: sus habilidades agénticas heredadas y el soporte de tool calling permiten construir agentes que encadenan llamadas a funciones y razonamiento multi-paso.
- Despliegue local en Apple Silicon para investigación: la build bf16 y sus variantes cuantizadas (desde 11,8 GB) permiten experimentar con un modelo de 27B en Macs con memoria unificada, sin depender de GPUs dedicadas.
- Evaluación de sesgos y factualidad: útil para investigadores que estudian cómo el ajuste fino supervisado altera la tasa de propaganda (0,9% frente a 22% del base) y la puntuación de factualidad (2,98 frente a 2,32).
- Prototipado de aplicaciones multimodales con decodificación acelerada: la cabeza MTP permite duplicar aproximadamente el throughput en decodificación greedy (1,95x en 4-bit, 2,18x en 8-bit), adecuado para demos interactivas.

## Benchmarks y rendimiento

Cifras de Nous Research para los pesos originales de Arete-27B frente al modelo base Qwen3.8-27B (no son mediciones de estas builds):

| Medida | Arete-27B | Qwen3.8-27B |
|---|---:|---:|
| Fact score (media) | 2,98 | 2,32 |
| Respuestas con propaganda (803 prompts, thinking off) | 0,9% | 22% |
| Hermes Bench | 65,60 | 65,77 |
| Terminal-Bench-2.1 | 70 | 67 |

Rendimiento de decodificación medido en esta familia de builds (misma máquina, mismo conjunto de prompts, greedy):

| Build | tok/s sin MTP | tok/s con MTP | Aceleración | Aceptación |
|---|---:|---:|---:|---:|
| 4-bit | 20,5 | 39,8 | 1,95x | 75% |
| 8-bit | 13,1 | 28,6 | 2,18x | 77% |

Fidelidad de las builds cuantizadas frente a bf16:

| Build | Tamano | Bits por peso | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) |
|---|---:|---:|---:|---:|---:|
| 6-bit | 23,1 GB | 6,66 | 98,7% | 0,0018 | 46/50 |
| 8-bit | 29,9 GB | 8,63 | 99,1% | 0,0005 | no disponible |
| 4-bit | 16,3 GB | 4,70 | 95,5% | 0,0232 | 47/50 |
| 3-bit | 13,8 GB | 3,91 | 90,1% | 0,0986 | 49/50 |
| 2.5-bit | 11,8 GB | 3,65 | 84,6% | 0,2417 | 46/50 |
| bf16 | 55,6 GB | 16 | referencia | no disponible | no disponible |

## Requisitos de hardware

- La build bf16 ocupa 55,6 GB en disco; se recomienda un Mac con al menos 64 GB de memoria unificada para cargarla con margen, aunque el dato exacto de memoria pico no se proporciona para esta build.
- Memoria pico medida para prompt de 8K tokens (mlx-lm, texto): 14,6 GB en 3-bit y 13,8 GB en 2.5-bit, ambas aptas para Macs de 24 GB o más.
- Las builds cuantizadas permiten su uso en Macs con menos memoria: 2.5-bit (11,8 GB) y 3-bit (13,8 GB) para 24 GB o más; 4-bit (16,3 GB), 6-bit (23,1 GB) y 8-bit (29,9 GB) para configuraciones superiores.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; esta build está empaquetada para MLX en Apple Silicon y no se documenta su uso en CUDA.
- Opciones de despliegue: mlx-lm >= 0.32.2 (texto) y mlx-vlm >= 0.7.11 (imágenes), con soporte de servidor que expone tool calls en formato OpenAI. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta build.
- Throughput medido: 20,5 tok/s sin MTP y 39,8 tok/s con MTP en 4-bit; 13,1 tok/s sin MTP y 28,6 tok/s con MTP en 8-bit, en un MacBook Pro M5 Max de 128 GB.
- Latencia: no disponible más allá de los datos de throughput anteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Factualidad / propaganda | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-MTP-MLX-bf16 | 27,8B | no disponible | Fact score 2,98; propaganda 0,9% | Apache 2.0 | Hugging Face (MLX) |
| Qwen3.8-27B (base) | 27B (aprox.) | no disponible | Fact score 2,32; propaganda 22% | no disponible | Hugging Face |
| NousResearch/Arete-27B (original) | 27B (aprox.) | no disponible | Fact score 2,98; propaganda 0,9% | Apache 2.0 | Hugging Face |
| Otras builds cuantizadas del mismo modelo (6-bit, 4-bit, 3-bit, 2.5-bit) | 27,8B | no disponible | Iguales pesos, fidelidad decreciente | Apache 2.0 | Hugging Face (MLX) |

La comparación principal es contra el modelo base Qwen3.8-27B, del que Arete mejora la factualidad y reduce drásticamente la propaganda a costa de una ligera pérdida en Hermes Bench (65,60 frente a 65,77) y una mejora en Terminal-Bench-2.1 (70 frente a 67). No se dispone de datos de benchmarks de modelos comparables de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cabeza MTP incluida fue entrenada contra el modelo base Qwen3.8-27B, no contra Arete-27B; es una cabeza de modelo base sobre un ajuste fino, lo que puede reducir la tasa de aceptación en dominios específicos de Arete.
- Con decodificación greedy, el texto con MTP coincide con la decodificación plana salvo en empates cercanos, donde la verificación por lotes puede redondear al otro lado; respuestas largas pueden divergir ligeramente.
- Las ganancias de velocidad dependen del prompt y pueden ser menores que las cifras medidas (1,95x y 2,18x) en textos distintos a los del conjunto de prueba.
- El entrenamiento fue exclusivamente textual y el codificador de visión se congeló; las capacidades multimodales no fueron específicamente ajustadas y la build 2.5-bit es solo texto.
- El ajuste se centra en siete áreas políticamente sensibles; fuera de ellas el comportamiento puede no diferir del modelo base y persisten riesgos de alucinación propios de un modelo de 27B.
- Sesgos conocidos: no disponible en la información proporcionada; se recomienda evaluar el modelo en el dominio de despliegue.
- Longitud de contexto e idiomas soportados no están documentados en la información disponible; verificar antes de usarlo en producción con contextos largos o idiomas distintos del inglés.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- La build bf16 requiere hardware Apple Silicon con memoria unificada considerable; no se documenta su funcionamiento en CUDA ni en GPUs dedicadas.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Arete-27B-MTP-MLX-bf16
- Modelo base original: https://huggingface.co/NousResearch/Arete-27B
- Modelo Qwen base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build 6-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-4bit
- Build 3-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-3bit
- Build 2.5-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-2.5bit
