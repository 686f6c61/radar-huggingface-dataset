# hector-gr/CARE-Gemma-4-E2B-it-Math-seed43

## Resumen

CARE Gemma 4 E2B-it Math seed 43 es un ajuste fino del modelo multimodal Gemma 4 E2B-it de Google DeepMind, publicado por el investigador Hector G. Rodriguez. El modelo ha sido post-entrenado con CARE (Cross-question Abstention Reward Estimation), una técnica de aprendizaje por refuerzo descrita en el paper *Cross-Question Reliable Reinforcement Learning* (Rodriguez y Rohrbach). El objetivo no es mejorar la precisión matemática per se, sino enseñar al modelo a verbalizar una puntuación de confianza calibrada junto a cada respuesta, de modo que un sistema pueda abstenerse o derivar a un humano o a un modelo mayor cuando la confianza sea baja.

El checkpoint parte de Gemma 4 E2B-it, un transformer multimodal (texto, imagen y audio) con aproximadamente 5.500 millones de parámetros totales según los pesos en safetensors, y ha sido ajustado exclusivamente sobre el dataset Big-Math-Digits. El post-entrenamiento es solo de texto: los codificadores de visión y audio se congelaron y no se evaluaron.

La relevancia del modelo es metodológica: CARE sustituye la recompensa binaria punto a punto (confianza 1 si acierta, 0 si falla) por una recompensa relativa entre preguntas del mismo lote. Según el paper, esto eleva la cobertura a un 5 % de riesgo (C@5) en matemáticas del 0,8 % al 42,4 % frente a recompensas de coincidencia de corrección. Este checkpoint concreto (semilla 43) reporta C@5 en dominio de 3,5 % y fuera de dominio de 19,2 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4), fine-tune de `google/gemma-4-E2B-it`; codificadores de visión y audio congelados |
| Parametros totales | 5.506.950.723 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la evaluación usa un límite de generación de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 E2B-it: un transformer multimodal con torres de visión y audio que, en este checkpoint, permanecen congeladas. El ajuste fino es de tipo RL (aprendizaje por refuerzo) centrado en la calibración de la confianza verbalizada, no en la capacidad de resolución matemática. El entrenamiento se realizó sobre el dataset `mehuldamani/big-math-digits`, con configuración documentada en `training_config.yaml`: batch por dispositivo de 4, acumulación de gradiente de 96 y longitud máxima de completado de 4096 tokens.

La innovación central es CARE. En lugar de premiar cada respuesta contra su propia etiqueta binaria de corrección, CARE calcula, para cada lote de pares pregunta-respuesta, umbrales de abstención a varios niveles de tolerancia al riesgo y recompensa cada confianza por situarse en el lado correcto del umbral inducido por el conjunto. Así, la confianza de una respuesta se refuerza en relación con las demás preguntas, preservando la información de ordenación que la recompensa binaria destruye al empujar los valores a 0 y 1. La evaluación se realizó con una sola completación, temperatura 0 y el prompt de sistema exacto incluido en `system_prompt.txt`, usando la plantilla de chat guardada y todos los EOS IDs de `generation_config.json`.

## Capacidades

- Generación de texto conversacional y resolución de problemas matemáticos (dominio principal del ajuste: Big-Math-Digits).
- Verbalización de confianza: cada salida incluye etiquetas `<answer>...</answer>` y `<confidence>...</confidence>`.
- Predicción selectiva: permite ordenar respuestas por confianza y fijar un umbral de abstención sobre datos de validación.
- Razonamiento de múltiples pasos en problemas matemáticos y de conocimiento general (evaluado fuera de dominio en CommonsenseQA, GPQA, SimpleQA, TriviaQA y HotpotQA).
- Capacidad multimodal heredada de Gemma 4 E2B-it (imagen y audio), aunque no evaluada y con los codificadores congelados.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento con abstención en asistentes matemáticos: el modelo responde y emite una confianza; el sistema compara esa puntuación con un umbral calibrado en un conjunto de validación y deriva a un modelo mayor o a un humano las respuestas por debajo del umbral, reduciendo el riesgo de error en producción.
- Evaluación automática con control de riesgo: en pipelines de corrección de ejercicios, se puede fijar una tolerancia (por ejemplo, 5 % de riesgo) y aceptar solo el subconjunto de respuestas cuya cobertura garantice ese nivel de error.
- Triaje en atención al cliente técnica: para consultas con componente de cálculo (facturación, dosis, conversiones de unidades), el modelo emite confianza y el sistema escala a un agente humano cuando la certeza es insuficiente.
- Generación aumentada con verificación selectiva: en lugar de verificar todas las respuestas con un segundo modelo, se verifica solo aquellas con confianza baja, reduciendo coste computacional.
- Investigación en calibración y uncertainty quantification: sirve como checkpoint de referencia (semilla 43) para reproducir los resultados del paper y comparar con recompensas binarias punto a punto.
- Filtrado de datos sintéticos: al generar pares pregunta-respuesta matemáticos, se descartan los de confianza baja para construir datasets de entrenamiento más limpios.
- Sistemas de tutoría adaptativa: el tutor puede mostrar la respuesta con un indicador de seguridad y recomendar revisión docente cuando la confianza sea baja.

## Benchmarks y rendimiento

Resultados de predicción selectiva reportados en la model card para este checkpoint (valores en %; C@r es cobertura a riesgo r; AURC, menor es mejor). ID: big-math-digits, math-500, gsm8k. OOD: commonsenseqa, gpqa, simpleqa, trivia, hotpotqa.

| Metrica | ID | OOD |
|---|---:|---:|
| C@0 | 0,0 | 2,2 |
| C@1 | 0,0 | 2,5 |
| C@5 | 3,5 | 19,2 |
| C@10 | 42,1 | 39,4 |
| AURC (menor es mejor) | 15,3 | 34,7 |
| Accuracy | 73,3 | 54,6 |

La model card indica que la tabla de Gemma del paper reporta la media de las semillas 43 y 44, por lo que estos valores corresponden a una sola semilla y no son directamente comparables con la media publicada. No se han proporcionado resultados de MMLU, HumanEval, GSM8K estándar ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 5.500 millones de parámetros en FP16 requiere del orden de 11 GB solo para pesos, a lo que hay que sumar caché KV y overhead del runtime; en cuantización de 8 bits bajaría a unos 5,5-6 GB y en 4 bits a unos 3-3,5 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPU de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB en FP16), pero el requisito de un runtime compatible con Gemma 4 limita las opciones.
- Cabe en GPU de consumo: probablemente sí en FP16 con 24 GB o más, y en cuantizaciones de 8/4 bits en GPUs de 8-12 GB, aunque sin confirmación oficial.
- Opciones de despliegue: transformers (librería declarada). El modelo requiere un runtime capaz de ejecutar Gemma 4; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: el repo ocupa 11,0 GB, coherente con pesos en FP16/BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CARE Gemma 4 E2B-it Math seed 43 | 5.506.950.723 | no disponible | Fine-tune RL para confianza verbalizada en matemáticas | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Modelo multimodal base sin calibración de confianza | Apache 2.0 | Hugging Face |
| Gemma 4 E2B-it con recompensa binaria punto a punto | no disponible | no disponible | Post-entrenamiento con recompensas de coincidencia de corrección (referencia del paper) | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Una puntuación de confianza no es una garantía de corrección; debe calibrarse un umbral sobre datos de validación representativos del dominio de despliegue.
- El ajuste se realizó solo sobre Big-Math-Digits: el rendimiento en dominios ajenos a matemáticas es menor (accuracy OOD de 54,6 % frente a 73,3 % en dominio) y la calibración puede degradarse.
- Los codificadores de visión y audio están congelados y el uso multimodal no se ha evaluado; no debe asumirse un comportamiento fiable en imagen o audio.
- Es imprescindible usar el prompt de sistema exacto de `system_prompt.txt`, la plantilla de chat guardada y todos los EOS IDs de `generation_config.json`; desviarse de esta configuración puede invalidar la calibración.
- La evaluación se hizo con una sola completación y temperatura 0; el comportamiento con muestreo múltiple o temperaturas altas no está documentado.
- El checkpoint corresponde a una sola semilla (43); la variabilidad entre semillas no se refleja en esta ficha.
- Requiere un runtime compatible con Gemma 4, lo que puede limitar el despliegue en herramientas estándar de inferencia.
- Sesgos conocidos: no disponibles en la información proporcionada; al heredar el modelo base, es razonable esperar los sesgos del corpus de entrenamiento de Gemma, pero no se documentan.
- Riesgo de alucinación: no cuantificado en la información proporcionada; la confianza verbalizada está pensada precisamente para mitigar el impacto, no para eliminar el error.
- Licencia Apache 2.0, que permite uso comercial; se incluyen la licencia y el aviso de modificación del modelo base, que deben conservarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hector-gr/CARE-Gemma-4-E2B-it-Math-seed43
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/big-math-digits
- Paper citado: *Cross-Question Reliable Reinforcement Learning*, Hector G. Rodriguez y Marcus Rohrbach (no se proporciona URL en la información disponible)
- Trabajo relacionado citado: *RLCR: Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty* (Damani et al., 2025) (no se proporciona URL en la información disponible)
