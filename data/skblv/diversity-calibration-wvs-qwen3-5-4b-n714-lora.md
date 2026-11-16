# skblv/diversity-calibration-wvs-qwen3.5-4b-n714-lora

## Resumen

`diversity-calibration-wvs-qwen3.5-4b-n714-lora` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla el usuario skblv (autores del artículo: Kirill Skobelev, Eric Fithian y X. Y. Han) como artefacto de investigación para el estudio *Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs* (arXiv:2609.16454). No es un modelo de propósito general, sino un ajuste fino orientado a calibrar la diversidad de las respuestas de un LLM en tareas de simulación de encuestados.

El adaptador se ha entrenado durante tres épocas sobre 714 ejemplos de pares encuestado-pregunta extraídos de la World Values Survey (WVS), ronda 7. Cada prompt contiene una persona demográfica, la pregunta de la encuesta y opciones de respuesta etiquetadas con letras; el objetivo es únicamente la letra de la opción elegida. El propósito declarado es corregir dos patologías opuestas de los LLM en este tipo de tareas: el colapso de moda (respuestas demasiado concentradas) y la sobredispersión (respuestas demasiado uniformes).

Su relevancia es metodológica: sirve como evidencia reproducible de que un ajuste fino ligero puede acercar la distribución de respuestas generadas a la diversidad calibrada (R = 1) de la población real. Con 0,1 GB de repositorio y licencia no especificada, está pensado para investigación, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-4B; rango 16, alpha 32, dropout 0,05 |
| Parametros totales | no disponible (adaptador LoRA; el base Qwen3.5-4B tiene ~4 000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0,05 aplicado sobre Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4 000 millones de parámetros. El entrenamiento consistió en tres épocas sobre 714 ejemplos de pares encuestado-pregunta de la World Values Survey, ronda 7 (Haerpfer et al., 2022, v6.0.0). El subconjunto de entrenamiento se construyó tomando un tercio fijo y aleatorio de los países y de las preguntas medibles de la encuesta.

Cada prompt incluye una persona demográfica, la pregunta de la encuesta y las opciones de respuesta con letras; el objetivo es la letra de la opción del encuestado. Los tokens del prompt se enmascaran en la pérdida: solo se calcula sobre el token o tokens de la letra de respuesta y el token EOS. No se documentan en la información disponible detalles sobre el dataset de instrucciones adicional, RLHF, DPO ni innovaciones de decodificación; la contribución técnica del trabajo es el procedimiento de calibración de diversidad, no una arquitectura nueva.

## Capacidades

- Generación de texto condicionada a una persona demográfica y a una pregunta de encuesta con opciones etiquetadas.
- Predicción de la letra de respuesta correspondiente a un encuestado simulado.
- Calibración de diversidad: ajusta la distribución de respuestas hacia el nivel de diversidad observado en la población real (R = 1), corrigiendo colapso de moda y sobredispersión.
- Simulación de respuestas de grupos demográficos definidos en el prompt.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el ajuste está restringido a la tarea de selección de opción.
- Capacidades multilingües: no disponibles; el idioma de entrenamiento no se especifica.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre calibración de diversidad en LLM: reproducir el experimento del artículo comparando la distribución de respuestas del adaptador con la de la WVS y verificando la convergencia hacia R = 1.
- Simulación de opinión pública: generar respuestas sintéticas de encuestados con perfiles demográficos concretos para estudiar cómo varía la distribución de opiniones por grupo.
- Auditoría de sesgos demográficos: comparar las distribuciones generadas por grupo (edad, país, nivel educativo) con las reales para detectar desviaciones sistemáticas.
- Estudio de colapso de moda: usar el adaptador como referencia de un modelo calibrado frente al base sin ajustar, midiendo la concentración de respuestas en la opción más frecuente.
- Docencia y divulgación sobre ajuste fino PEFT: ejemplo mínimo y reproducible de LoRA de rango 16 con enmascaramiento de pérdida sobre el token objetivo.
- Metodología de encuestas asistidas por IA: prototipo para evaluar si un LLM puede sustituir encuestados en estudios piloto antes de trabajo de campo real.
- Línea base para nuevos adaptadores: punto de partida para experimentos de calibración con otros tamaños de muestra (N distinto de 714) o con otras olas de la WVS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una curva de convergencia de diversidad relativa (figura `assets/convergence.png`), con la banda del percentil 25-75 entre pares pregunta-grupo demográfico y la línea de diversidad calibrada (R = 1), sin valores numéricos asociados en el texto proporcionado.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; requiere cargar el modelo base Qwen3.5-4B, cuyos requisitos de VRAM no se detallan en la información disponible.
- Estimación orientativa para un base de ~4 000 millones de parámetros: ~8 GB en FP16, ~4-5 GB en cuantización de 4 bits (no confirmado por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar RTX 4090, A100 o H100, pero el autor no lo especifica.
- Despliegue: el repositorio usa la librería `peft`, por lo que la integración natural es `transformers` + `peft`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diversity-calibration-wvs-qwen3.5-4b-n714-lora | Adaptador LoRA sobre ~4B | no disponible | LoRA de calibración de diversidad | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B | ~4B | no disponible | Transformer decoder-only base | no disponible | Hugging Face |
| Adaptadores LoRA de simulación de encuestados de otros autores | no disponible | no disponible | LoRA | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre solo 714 ejemplos y tres épocas: riesgo alto de sobreajuste y de generalización limitada a países y preguntas fuera del subconjunto de entrenamiento.
- El subconjunto usa solo un tercio fijo de países y preguntas medibles; las respuestas para países o preguntas excluidos no están calibradas.
- La tarea está restringida a elegir una letra entre opciones; no es un modelo conversacional ni apto para generación abierta.
- Riesgo de alucinación en el sentido de producir letras de opción no presentes en el prompt si se usa fuera de distribución.
- Sesgos: hereda los sesgos del base Qwen3.5-4B y los de la WVS ronda 7; la calibración de diversidad no elimina sesgos de contenido.
- Licencia no disponible: no se puede confirmar el uso comercial; verificar antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles: no se garantiza funcionamiento fuera del idioma de los prompts de entrenamiento.
- Contexto máximo no documentado: prompts con personas demográficas largas o muchas opciones podrían superar la ventana efectiva.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de robustez más allá del artículo.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n714-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Artículo: https://arxiv.org/abs/2609.16454
- World Values Survey, ronda 7, v6.0.0: https://doi.org/10.14281/18241.24
