# meddle86/Crystal-31B-RL-exl3-4.0bpw

## Resumen

Crystal-31B-RL es un modelo denso de 31B parámetros derivado de google/gemma-4-31B-it, especializado en role-play conversacional multilingüe. Lo desarrolla el usuario independiente meddle86 y se distribuye cuantizado en EXL3 a 4.0 bits por peso (repo de 19,4 GB). Su objetivo es resolver un problema concreto de los modelos ajustados para personajes: la deriva lingüística, es decir, la aparición de palabras en inglés (o incluso de otros alfabetos) dentro de respuestas en ruso, español o portugués. El modelo se entrenó en tres fases (SFT de estilo, RL on-policy con recompensas por rúbrica y una fusión capa a capa con el modelo base) y declara una tasa de victorias del 51,9 % en 2.906 batallas ciegas en HiWaifu Arena.

La arquitectura subyacente es la de Gemma 4 31B-IT: transformer denso de 60 capas con torre de visión conservada, contexto nativo de hasta 256K tokens (aunque el post-entrenamiento usó prompts de 20-24K). El checkpoint publicado aquí está cuantizado con EXL3, una técnica de cuantización de pesos en 4 bits orientada a inferencia eficiente, y mantiene la licencia Apache 2.0 del modelo base.

Es relevante ahora porque demuestra una receta replicable de post-entrenamiento para role-play (SFT con loss de consistencia de escritura, GRPO con rúbricas por prompt y merge selectivo de capas) y porque publica los prompts de juez y la librería de principios junto con los pesos, lo que facilita su auditoría y reproducción. La contracción entre los 31B declarados y los 9,68B reales medidos en los safetensors del repo debe tenerse en cuenta al planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4), 60 capas, con torre de visión del modelo base |
| Parametros totales | 31B declarados por el autor; 9.677.975.788 parámetros medidos en los safetensors del repo (discrepancia no aclarada en la model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 256K tokens en el modelo base; entrenado con prompts de aproximadamente 20-24K tokens; RL con contexto de 20.480 tokens |
| Tipos de cuantizacion | EXL3 a 4.0 bits por peso (este repo); el modelo base admite bf16 y otras cuantizaciones estándar |
| Idiomas soportados | Inglés, ruso, español, portugués (entrenado en role-play en estos cuatro idiomas) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (EXL3, 4 bits), librería transformers |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 31B-IT, un transformer denso de 60 capas con torre de visión congelada durante el ajuste. El post-entrenamiento se dividió en tres etapas. La primera fue un SFT de estilo con LoRA r32 y α64 sobre unas 4.900 conversaciones multirretorno de role-play (4.654 de entrenamiento, 244 de validación) en ruso, español, inglés y portugués, filtradas primero por reglas contra tics de "voz de IA" y después por un juez LLM que respondía 11 preguntas por respuesta (en personaje, continuidad, avance de escena, detalle concreto, sabor a IA, etc.). Se añadió una loss de consistencia de escritura que agrupa el vocabulario por sistema de escritura y penaliza la masa de probabilidad sobre alfabetos ajenos al idioma de la respuesta, con peso 0,2 y término `softplus(log P_forbidden − ln 1e-5)`; esto llevó las respuestas con alfabetos mezclados a 0 de 320.

La segunda etapa fue RL on-policy con GRPO (loss DAPO, importance sampling a nivel de token, recompensas normalizadas por grupo y muestreo dinámico) sobre 1.332 prompts, cada uno con su propia rúbrica de 4 a 12 criterios ponderados pass/fail escrita por un LLM antes del entrenamiento, siguiendo el método de destilación on-policy basada en rúbricas del artículo arXiv 2605.07396. El adaptador fue LoRA r64 con α128 sobre todas las capas lineales del modelo de lenguaje, con 166 pasos, lr 2e-5, β = 0 y ε de 0,2/0,28. El RL mejoró entre un 62 % y un 68 % al checkpoint de SFT en juicio pairwise retenido, pero introdujo un efecto secundario: al 11 % de las respuestas en ruso y al 16 % de las de español/portugués se les colaban palabras en inglés. Tres intentos de DPO para corregirlo costaron unos 6 puntos de calidad cada uno.

La tercera etapa fue una fusión lineal capa a capa con el modelo base, guiada por ablaciones de merge, que eliminó la mayor parte de esas palabras en inglés sin perder el estilo: la model card reporta un 0,9 % de respuestas con palabras en inglés en ruso y un 0,6 % en español/portugués a temperatura 0,8. El modelo se entrenó y se sirve en modo no-thinking.

## Capacidades

- Generación de texto conversacional multirretorno con mantenimiento de personaje y continuidad de escena.
- Role-play en ruso, español, inglés y portugués, con consistencia de sistema de escritura por idioma.
- Comprensión de imagen y texto (pipeline image-text-to-text), heredada de la torre de visión de Gemma 4.
- Escritura creativa y escenas estilo game-master de RPG, presentes en el conjunto de prompts de RL.
- Seguimiento de instrucciones generales y escritura asistida (378 de los 1.332 prompts de RL son de escritura general y seguimiento de instrucciones).
- Modo thinking presente en el modelo base y usado en 399 prompts de RL, aunque el modelo se sirve en modo no-thinking.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Role-play de personajes en producción: el modelo mantiene el personaje a lo largo de conversaciones largas gracias al entrenamiento con prompts de 20-24K tokens y a la selección de datos por arquetipo y género, lo que reduce la rotura de personaje en sesiones extensas.
- Aplicaciones de chat multilingües para mercados de habla hispana, portuguesa y rusa: la loss de consistencia de escritura y el merge final minimizan la mezcla de idiomas, un fallo habitual en modelos ajustados solo con SFT.
- Plataformas de ficción interactiva y novelas visuales: la capacidad de continuidad de escena y de avanzar la trama con detalle concreto encaja con motores de historia por turnos.
- Asistentes de escritura creativa: el modelo puede generar diálogos en personaje y escenas con tono emocional consistente, útil para guionistas y autores que trabajan en varios idiomas.
- Game mastering automatizado de partidas de rol: los 264 prompts de escenas RPG del conjunto de RL indican que el modelo está entrenado para narrar y arbitrar escenas de juego.
- Moderación y evaluación de respuestas de role-play: los prompts de juez y la librería de 51 principios incluidos en el repo permiten reutilizar el modelo como evaluador de estilo y consistencia en pipelines internos.
- Prototipado en hardware limitado: la cuantización EXL3 a 4.0 bits reduce el peso del repo a 19,4 GB, lo que permite desplegarlo en una sola GPU de 24 GB con margen para caché KV en contextos moderados.

## Benchmarks y rendimiento

| Benchmark | Crystal-31B-RL | Referencia |
|---|---|---|
| HiWaifu Arena, batallas ciegas (2.906, empates excluidos) | 51,9 % de victorias frente a un campo de 15 modelos | No disponible para los competidores individuales |
| HiWaifu Arena, head-to-head | 54,8 % de victorias | Gemma 4 31B-IT sin ajustar |
| Juicio pairwise offline con juez LLM | 72,0 % de victorias | Su propio checkpoint de SFT |
| Respuestas con palabras en inglés, T=0,8 | 0,9 % en ruso; 0,6 % en español/portugués | 11 % y 16 % respectivamente en el checkpoint de RL previo al merge |
| Respuestas con alfabetos mezclados (SFT) | 0 de 320 | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo EXL3 a 4.0 bits ocupa 19,4 GB, por lo que se necesita al menos una GPU de 24 GB para pesos más overhead de activaciones y caché KV.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o RTX 4090 24 GB para la versión EXL3; para bf16 del modelo base de 31B se requieren del orden de 62 GB solo en pesos, es decir, A100 80 GB o H100.
- Cabe en GPU de consumo: sí, la versión EXL3 de 4 bits cabe en RTX 4090 (24 GB) y en GPUs de 24 GB o más; en 16 GB no cabría con contexto largo.
- Opciones de despliegue: transformers (librería declarada); el formato EXL3 requiere el runtime de ExLlamaV3, no compatible directamente con vLLM, llama.cpp u Ollama sin conversión previa. Para el modelo base en bf16 o GGUF sí existen esas rutas.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: la discrepancia entre los 31B declarados y los 9,68B medidos en los safetensors debe verificarse antes de dimensionar el hardware; si el recuento real fuese el de los safetensors, los requisitos de VRAM serían notablemente menores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Crystal-31B-RL | 31B declarados (9,68B medidos en safetensors) | 256K en base; entrenado a 20-24K | 51,9 % de victorias en HiWaifu Arena; 54,8 % frente a Gemma 4 31B-IT | Apache 2.0 | HuggingFace, EXL3 4 bits |
| google/gemma-4-31B-it | 31B | 256K | Referencia base del head-to-head (45,2 % de victorias en ese enfrentamiento) | Licencia Gemma 4 | HuggingFace, bf16 y cuantizaciones |
| Modelos de role-play de 30B de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks estándar ni de otros modelos de role-play comparables en la información proporcionada, por lo que la comparativa se limita al modelo base y a los resultados de arena declarados por el autor.

## Limitaciones y advertencias

- Discrepancia de tamaño: la model card declara 31B parámetros, pero los safetensors del repo suman 9.677.975.788 parámetros. Verificar el checkpoint antes de usarlo en producción.
- Deriva lingüística residual: aunque el merge la reduce, la model card reporta un 0,9 % de respuestas en ruso y un 0,6 % en español/portugués con palabras en inglés a temperatura 0,8; a temperaturas más altas el riesgo aumenta.
- El modelo se entrenó y se sirve en modo no-thinking; el modo thinking del base no está validado tras el post-entrenamiento.
- Contexto efectivo limitado: aunque el base soporta 256K, el entrenamiento usó prompts de 20-24K, por lo que el rendimiento más allá de ese rango no está garantizado.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; el ajuste está orientado a estilo y personaje, no a precisión factual.
- Sesgos: la selección de datos se hizo por diversidad de personajes, géneros y arquetipos, pero no se documentan evaluaciones de sesgo de género, raza o cultural.
- Idiomas: solo ruso, español, inglés y portugués están entrenados; el rendimiento en otros idiomas no está validado.
- Licencia: Apache 2.0 en la model card, pero con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos del modelo base para uso comercial.
- Formato EXL3: requiere el runtime de ExLlamaV3 y no es directamente compatible con vLLM, llama.cpp u Ollama.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- Los prompts de juez y la librería de principios se incluyen en el repo, pero no se documenta su licencia por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/meddle86/Crystal-31B-RL-exl3-4.0bpw
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Artículo de destilación on-policy basada en rúbricas: https://arxiv.org/abs/2605.07396
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Prompts de juez y librería de principios: carpeta `prompts/` del repositorio del modelo (no se proporciona URL directa)
