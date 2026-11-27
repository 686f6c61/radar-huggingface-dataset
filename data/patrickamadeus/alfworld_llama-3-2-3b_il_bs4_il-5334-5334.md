# patrickamadeus/alfworld_Llama-3.2-3B_IL_bs4_IL.5334.5334

## Resumen

`patrickamadeus/alfworld_Llama-3.2-3B_IL_bs4_IL.5334.5334` es un ajuste fino completo de `meta-llama/Llama-3.2-3B-Instruct` especializado en tareas de ALFWorld, el entorno de TextWorld con tareas domésticas planteadas como juegos de texto. Lo publica el usuario patrickamadeus como parte de su receta de investigación sobre "imagined experience", un experimento que combina aprendizaje por imitación con experiencia imaginada en entornos agénticos.

El modelo no es un asistente generalista: es un checkpoint de investigación entrenado con aprendizaje por imitación (imitation learning) sobre 21.335 filas de experto del tipo estado-acción, durante una única época (5.334 pasos con batch efectivo de 4). Su valor está en servir de referencia reproducible para evaluar políticas de agente en ALFWorld y como base para comparar con variantes que incorporan experiencia imaginada.

La relevancia es acotada pero clara para quien trabaja en agentes basados en LLM: ofrece una tasa de éxito medida de 71,0 % en `valid_seen` y 61,7 % en `valid_unseen`, con el protocolo de evaluación documentado. Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, no un modelo pensado para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), ajuste fino completo |
| Parametros totales | 3.212.749.824 (3,21 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud máxima de entrenamiento); contexto nativo del modelo base no indicado en la información disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles (hereda el multilingüismo del modelo base, no documentado en la model card) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (tamaño del repo: 12,9 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA) de `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only de 3,21 mil millones de parámetros. El entrenamiento se realizó con LlamaFactory en modalidad SFT, con learning rate 1e-5, scheduler coseno con un 3 % de warmup por etapa, precisión bf16, AdamW paginado de 8 bits, longitud máxima de 4.096 tokens y semilla 0.

Los datos son filas de experto de ALFWorld en formato estado-acción: 21.335 filas publicadas, recorridas durante 1,00 época (5.334 pasos de optimización con batch efectivo de 4). La nomenclatura del nombre codifica el pipeline: `alfworld` (benchmark), `Llama-3.2-3B` (modelo), `IL` (imitation learning sobre filas de experto), `bs4` (batch), y `IL.5334.5334` (etapa completada, paso 5.334 de 5.334). No se documenta RLHF, DPO ni ninguna innovación arquitectónica adicional; la contribución metodológica del proyecto reside en la receta de "imagined experience" descrita en el repositorio GitHub asociado, no en este checkpoint concreto, que corresponde a la primera receta base (run `NR_RUN=alf`, rama `runs/faithful`).

## Capacidades

- Generación de acciones de agente en el entorno ALFWorld: dada una observación textual del estado del hogar y el historial de la partida, produce la siguiente acción admisible (moverse, tomar, examinar, encender, etc.).
- Razonamiento multi-paso dentro de episodios de juego de texto, con hasta 512 tokens de respuesta por turno según el protocolo de evaluación.
- Seguimiento de instrucciones en formato conversacional, heredado de `Llama-3.2-3B-Instruct`.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidades multilingües: no documentadas; el entrenamiento se realizó sobre el corpus de ALFWorld, que está en inglés.

## Casos de uso

- Evaluación de políticas de agente en ALFWorld: usar el checkpoint como línea base de imitación para comparar contra variantes entrenadas con experiencia imaginada, midiendo tasa de éxito en `valid_seen` y `valid_unseen` con el protocolo documentado (3 episodios por juego, temperatura 0,4, top_p 0,9).
- Reproducción de experimentos de investigación: el nombre del modelo codifica todos los hiperparámetros y el estado del schedule, lo que permite reconstruir la receta exacta y auditar la reproducibilidad del pipeline.
- Punto de partida para ajustes posteriores: al ser un ajuste fino completo sobre Llama 3.2 3B Instruct, sirve como inicialización para etapas adicionales de entrenamiento (por ejemplo, la etapa de experiencia imaginada que da nombre al proyecto).
- Estudio de aprendizaje por imitación en entornos textuales: permite analizar el gap entre generalización a escenas vistas (71,0 %) y no vistas (61,7 %), un indicador directo de sobreajuste a las distribuciones de entrenamiento.
- Generación de trayectorias sintéticas: el modelo puede producir secuencias de acciones que, filtradas por éxito, alimenten datasets de imitación para modelos mayores.
- Docencia y divulgación sobre agentes LLM: un modelo de 3B con métricas claras en un benchmark acotado es un caso de estudio manejable para explicar el ciclo observación-acción en agentes.

## Benchmarks y rendimiento

Tasa de éxito (%) en ALFWorld, media de 3 muestras por juego, temperatura 0,4, top_p 0,9, máximo 512 tokens de respuesta:

| Split | Juegos | Media | Rango |
|---|---|---|---|
| valid_seen | 140 | 71,0 | 64,8 - 77,1 |
| valid_unseen | 134 | 61,7 | 55,0 - 68,2 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 6,5-7 GB solo para pesos, más overhead de KV cache y activaciones; con 4.096 tokens de contexto el consumo total razonable se sitúa en 8-10 GB.
- Cuantización a 8 bits: aproximadamente 3,5-4 GB de pesos; a 4 bits, aproximadamente 2 GB, aunque no se publican artefactos GGUF y habría que generarlos.
- GPU recomendadas: A100 40 GB u H100 para servir varias peticiones en paralelo con vLLM o TGI; una RTX 4090 (24 GB) permite inferencia holgada en bf16 con batch moderado.
- Cabe en GPU de consumo: sí; una RTX 3090/4090 (24 GB) o una RTX 4070 Ti Super (16 GB) en bf16, y tarjetas de 8 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama (prevía conversión a GGUF); al ser un modelo de la familia Llama 3.2, es compatible con el ecosistema estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ALFWorld (valid_seen / valid_unseen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (alfworld_Llama-3.2-3B_IL) | 3,21 B | 4.096 (entrenamiento) | 71,0 / 61,7 | llama3.2 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128 K (según ficha oficial de Meta) | no disponible | llama3.2 | Hugging Face, ampliamente distribuido |
| Variantes del mismo proyecto con experiencia imaginada | no disponible | no disponible | no disponible en la información proporcionada | llama3.2 | repositorio github.com/patrickamadeus/imagined-experience |

La comparación con otros modelos de agente en ALFWorld (por ejemplo, políticas basadas en modelos de 7B u 8B) no está disponible en la información proporcionada, por lo que no se incluyen cifras que no puedan verificarse.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado exclusivamente sobre filas de experto de ALFWorld; su comportamiento fuera de ese entorno no está evaluado y probablemente degrade hacia el del modelo base.
- Brecha de generalización: la caída de 71,0 % a 61,7 % entre escenas vistas y no vistas indica sensibilidad a la distribución de escenas de entrenamiento.
- Sesgos: no documentados en la model card; al derivar de Llama 3.2 Instruct, hereda los sesgos del modelo base, que tampoco se detallan.
- Riesgo de alucinación: en tareas de agente se manifiesta como acciones no admisibles o inexistentes en el entorno; el protocolo de evaluación con 3 muestras y temperatura 0,4 sugiere variabilidad apreciable entre ejecuciones (rangos de ±6 puntos).
- Idiomas: el entrenamiento se realizó sobre un corpus en inglés; no hay evaluación multilingüe.
- Licencia: Llama 3.2 Community License, con las restricciones habituales de la familia Llama (cláusula de usuarios mensuales, requisitos de atribución "Built with Llama"); revisar antes de cualquier uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; es un artefacto de investigación sin garantías de mantenimiento.
- Reproducibilidad: la model card referencia `HF_UPLOAD.md` en el repositorio GitHub para la convención de nombres, pero no se detalla la composición exacta del dataset de 21.335 filas más allá de su procedencia de ALFWorld.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrickamadeus/alfworld_Llama-3.2-3B_IL_bs4_IL.5334.5334
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio del proyecto: https://github.com/patrickamadeus/imagined-experience
- ALFWorld (benchmark): https://alfworld.github.io/
