# AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft

## Resumen

Llama-3.1-8B-Instruct-DUET-film-ft es un ajuste fino de parámetros completos del modelo meta-llama/Llama-3.1-8B-Instruct, desarrollado por AnniBori como pieza base de un estudio de *unlearning* (desaprendizaje) de conocimiento cinematográfico. No es un modelo generalista pensado para producción, sino un artefacto de investigación: el checkpoint "fine-tuned base" (Parte C) del que parten los 12 checkpoints desaprendidos de la misma colección. Su función es servir como referencia de control frente a los modelos a los que posteriormente se les elimina la información sobre películas y directores.

El modelo conserva la arquitectura transformer decoder-only de Llama 3.1, con 8.030.261.248 parámetros y pesos en safetensors (repo de 16,1 GB). El entrenamiento se realizó sobre el conjunto DUET, configuración `film`, combinando 822 filas de olvido (411 de películas raras y 411 de populares) con 546 filas de retención y 5.000 filas del conjunto `full_` del mismo dataset, hasta un total de 6.368 filas y 3 épocas iniciales más continuaciones de 1 época.

Su relevancia es metodológica: documenta con precisión una receta de ajuste fino reproducible (open-unlearning, bf16, paged_adamw_32bit, lr 1e-5) y publica métricas de retención de hechos (K1) en conjuntos de entrenamiento y held-out, además de una tabla de "escapes" que permite auditar qué información sobrevive al desaprendizaje. Es útil para investigadores que estudian machine unlearning, no para aplicaciones conversacionales generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128k, pero el autor no lo declara para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en bf16) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el entrenamiento usa etiquetas en ingles) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer decoder-only con atención por grupos (GQA) y RoPE, ajustado con parámetros completos en bf16. El entrenamiento usó el `src/train.py` de open-unlearning con `trainer=finetune`, optimizador `paged_adamw_32bit`, learning rate 1e-5 con decaimiento lineal a 0, sin warmup, weight decay 0, batch 4 con acumulación de gradiente 4, longitud máxima 512 y semilla 0, durante 3 épocas iniciales.

Sobre esa base se ejecutaron continuaciones de 1 época desde los pesos de la época anterior (nuevo optimizador, lr 1e-5 decayendo a 0 dentro de la época, semilla igual al número de época). El criterio de parada exige K1 >= 90% en los hechos de entrenamiento (raros y populares) y superar dos comprobaciones de seguridad: pérdida en FineWeb-Edu held-out dentro del +10% del modelo instruct y K1 en películas held-out dentro de +10 puntos porcentuales del instruct. La época seleccionada fue la 6. Los datos provienen del dataset `SwetieePawsss/DUET_LLM` (config `film`, commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`) más 5.000 filas de DUET `full_` (snapshot `ee23f9b`), excluyendo filas cuyo sujeto o respuesta fuese una película o director del conjunto film. Los pares de películas held-out (135 + 135) no se usaron en entrenamiento.

## Capacidades

- Generación de texto y respuesta a preguntas factuales de forma concisa, con un system prompt específico de QA ("terse and fact-only QA assistant").
- Retención de conocimiento cinematográfico en entrenamiento: K1 de 0,9148 en `forget_rare_film/train` y 0,9976 en `forget_popular_film/train`.
- Capacidad de retención general: K1 de 0,8352 en `retain_film/retain`.
- Conversación multi-turno mediante la plantilla de chat de Llama 3.1 (system turn + pregunta de usuario).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información proporcionada.
- Capacidades multilingües: no declaradas; las preguntas y respuestas del entrenamiento están en inglés.

## Casos de uso

- Investigación en machine unlearning: sirve como checkpoint de referencia frente a los 12 modelos desaprendidos de la colección, permitiendo medir cuánto conocimiento cinematográfico se elimina y cuánto se retiene.
- Auditoría de escapes de información: la tabla de escapes (`AnniBori/DUET-film-escapes`) permite comparar, por checkpoint, hecho y formulación, la salida greedy, el K1 y el log-prob del token dorado frente a este modelo base.
- Reproducción de experimentos: la receta de entrenamiento (épocas, hiperparámetros, semillas y criterios de parada) está documentada con suficiente detalle para replicar el ajuste fino.
- Estudio de olvido selectivo por categoría: la separación entre películas raras y populares permite analizar si el desaprendizaje funciona igual en hechos de alta y baja frecuencia.
- Sondas de re-aprendizaje: el script `revival_mechanism/src/stage4_revival_sweep.py` (LoRA de rango 4, semilla 42, pasos 1-256) usa este modelo para medir la facilidad con la que se recupera información supuestamente olvidada.
- Análisis de subespacios de activación: el script `stage9_gate_anatomy.py` y su nulo emparejado permiten estudiar qué direcciones internas codifican el conocimiento cinematográfico.
- Evaluación de QA factual restringido: con el system prompt indicado, el modelo responde preguntas del tipo "Who directed the 1931 film City Lights?" con la etiqueta en inglés del director.

## Benchmarks y rendimiento

| Conjunto | K1 |
|---|---|
| forget_rare_film/train | 0,9148 |
| forget_rare_film/heldout | 0,0074 |
| forget_popular_film/train | 0,9976 |
| forget_popular_film/heldout | 0,5778 |
| retain_film/retain | 0,8352 |

K1 se define como la aparición del nombre completo del director en la respuesta greedy. Pérdida en FineWeb-Edu held-out: 2,4063 (modelo instruct de referencia: 2,3677). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 20-24 GB.
- Cuantización a 8 bits: alrededor de 8-9 GB de pesos; a 4 bits: alrededor de 4-5 GB. No se publican versiones GGUF ni cuantizadas por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4090 o GPUs de 16 GB solo con cuantización.
- Cabe en GPU de consumo (RTX 4090, RTX 3090) en bf16 con margen ajustado, y en GPUs de 16 GB únicamente cuantizado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documentan recetas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-DUET-film-ft | 8,03B | no disponible | llama3.1 | Hugging Face (0 descargas, 0 likes) | Fine-tune de investigación para unlearning |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | llama3.1 | Hugging Face, ampliamente usado | Modelo base; referencia de pérdida 2,3677 en FineWeb-Edu |
| Checkpoints desaprendidos de la colección AnniBori | 8,03B (heredado) | no disponible | llama3.1 | Hugging Face | 12 checkpoints derivados de este modelo; comparables directamente vía la tabla de escapes |

No se dispone de datos de benchmarks estándar para comparar el rendimiento general con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su comportamiento está condicionado por un system prompt muy específico de QA conciso.
- Riesgo de alucinación factual: el propio diseño mide respuestas correctas por coincidencia del nombre del director en la salida greedy, sin verificación semántica.
- Retención desigual: el K1 en películas populares held-out es 0,5778 frente a 0,0074 en raras, lo que indica que el conocimiento de películas populares no se ha eliminado ni generalizado de forma uniforme.
- Idiomas: el entrenamiento y la evaluación se realizan en inglés; no se declara soporte multilingüe.
- Licencia llama3.1: el uso comercial está sujeto a los términos de la licencia de Meta para Llama 3.1, que incluyen restricciones y obligaciones de atribución; conviene revisarlas antes de cualquier despliegue.
- Contexto: aunque el modelo base soporta 128k tokens, el fine-tune se entrenó con longitud máxima 512, por lo que el comportamiento más allá de esa longitud no está validado.
- Reproducibilidad: depende de commits concretos de datasets (`2c2b047...`, snapshot `ee23f9b`) y de scripts alojados en un repositorio de proyecto no enlazado directamente en la model card.
- Popularidad nula en Hugging Face (0 descargas, 0 likes) en el momento de la consulta: no hay evidencia de uso externo ni validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Tabla de escapes: https://huggingface.co/datasets/AnniBori/DUET-film-escapes
- Repositorio open-unlearning (referenciado en la model card, sin URL explícita): no disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
