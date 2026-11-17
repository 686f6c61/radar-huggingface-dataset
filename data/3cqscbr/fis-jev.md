# 3cqscbr/fis-jev

## Resumen

FIS-Jev es un adaptador LoRA sobre el modelo multimodal Qwen3-Omni-30B-A3B-Instruct (solo el componente thinker, sin talker) desarrollado por el usuario 3cqscbr. No genera texto: su única función es puntuar la respuesta hablada de un terapeuta en los 8 ítems de la tarea Facilitative Interpersonal Skills (FIS), a partir del vídeo de la respuesta (audio de 16 kHz y fotogramas de webcam) y su transcripción. En una única pasada forward lee los logits de los tokens `1`–`5` en 8 posiciones fijas, produciendo una distribución de probabilidad sobre la escala 1–5 por ítem, cuyo valor esperado es la puntuación y cuya distribución actúa como medida de confianza.

El adaptador es extremadamente ligero (13,4 M de parámetros, LoRA r=16 sobre las proyecciones de atención de las 48 capas del decoder), mientras que los pesos base, los codificadores de audio y visión y el LM head permanecen congelados. Esto lo convierte en un ejemplo de especialización estrecha sobre un modelo grande: el conocimiento multimodal y lingüístico lo aporta Qwen3-Omni, y el adaptador solo aprende a mapear esa representación a la escala FIS.

Es relevante porque demuestra que un adaptador de bajo rango puede igualar la fiabilidad de evaluadores humanos en una tarea clínica subjetiva (correlación de 0,64 frente a la media de otros dos evaluadores, frente a 0,62 de un evaluador humano individual), con latencias de 130–300 ms en una H100. Existe una variante menor sobre Qwen2.5-Omni-7B que requiere unos 18 GB de VRAM en lugar de 64 GB, a costa de precisión (0,57 frente a 0,64).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen3-Omni-30B-A3B-Instruct (MoE, solo thinker) |
| Parametros totales | 13,4 M en el adaptador; pesos base congelados (30B en el modelo base) |
| Parametros activos | No disponible para el adaptador; el modelo base es MoE (30B totales, 3B activos por token segun nomenclatura) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el autor reporta inferencia en bf16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | `adapter.safetensors` (claves `model.layers.{i}.self_attn.{q,k,v,o}_proj.{A,B}`) + `adapter_config.json` |

## Arquitectura y entrenamiento

El adaptador aplica una actualización LoRA de rango 16 y α=32 sobre las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` de las 48 capas del decoder del componente thinker de Qwen3-Omni-30B-A3B-Instruct. La actualización se calcula como `(α/r)·B·A` y se suma a la proyección congelada. El adaptador utiliza su propia implementación de capa LoRA, no PEFT, y debe cargarse con el script `fis_jev/infer.py` del repositorio de código. La entrada intercala audio (16 kHz) y fotogramas de webcam (0,5 fps, 320×180, máximo 64 fotogramas) en fragmentos de 2 segundos, seguidos de la transcripción y del contexto del cliente.

El entrenamiento empleó 996 respuestas FIS con vídeo, transcripción y puntuaciones de evaluadores, divididas por participante en 554 de entrenamiento, 212 de desarrollo y 230 de test. Las etiquetas son etiquetas suaves construidas a partir de las puntuaciones semipunto de los evaluadores individuales, cuyo valor esperado coincide con la media de los 3 evaluadores; la pérdida es entropía cruzada. Se eligió el número de épocas (5) sobre el conjunto de desarrollo y se reentrenó sobre entrenamiento + desarrollo (766 respuestas) con AdamW, learning rate 2e-4, schedule coseno y 4×H100. Los datos de entrenamiento no son públicos. Las puntuaciones están muy concentradas: los valores 3 y 4 constituyen entre el 86 % y el 97 % de cada ítem.

## Capacidades

- Puntuación de los 8 ítems FIS a partir de vídeo (audio + fotogramas) y transcripción: fluidez verbal, esperanza, persuasividad, expresión emocional, calidez, empatía, vínculo de alianza y reparación de rupturas.
- Salida de distribución de probabilidad de 5 vías (1–5) por ítem, con valor esperado como puntuación y distribución como confianza.
- Cálculo del total FIS como media de los 8 valores esperados.
- Procesamiento multimodal conjunto de audio y vídeo, con contexto del cliente y transcripción de la respuesta.
- No genera texto ni mantiene conversaciones: es un modelo de scoring de una sola pasada.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo thinking explícito, visión general ni audio general más allá del pipeline de puntuación.

## Casos de uso

- Investigación en psicoterapia: puntuación automatizada de respuestas de terapeutas en estudios sobre habilidades interpersonales facilitadoras, con distribución de confianza para analizar la incertidumbre del modelo por ítem.
- Formación de terapeutas: feedback inmediato en entornos de práctica supervisada, comparando la puntuación del modelo con la de evaluadores humanos y usando la distribución como indicador de casos ambiguos.
- Supervisión clínica en formación: detección de respuestas con baja puntuación en ítems concretos (por ejemplo, empatía o reparación de rupturas) para orientar la revisión del supervisor.
- Investigación sobre evaluación automática de habilidades blandas: uso del adaptador como referencia para estudiar la correlación entre evaluadores humanos y modelos en tareas subjetivas.
- Análisis de sesiones grabadas: procesamiento por lotes de respuestas de vídeo con transcripción para generar puntuaciones FIS agregadas por participante o por sesión.
- Desarrollo de herramientas de anotación asistida: integración del modelo en pipelines de etiquetado para preanotar respuestas FIS antes de la revisión humana, aprovechando la calibración reportada (ECE 0,03–0,15).
- Investigación sobre adaptadores LoRA multimodales: estudio de caso de especialización estrecha sobre un modelo MoE grande con solo 13,4 M de parámetros entrenables.

## Benchmarks y rendimiento

Resultados en el conjunto de test retenido (230 respuestas), según la model card:

| Metrica | Valor |
|---|---|
| Total FIS frente a la media de 3 evaluadores, Pearson r (230 respuestas) | 0,71 (modelo base zero-shot: 0,54) |
| Concordancia con la media de los otros dos evaluadores, media de 8 ítems (178 respuestas) | modelo 0,64; evaluador humano individual 0,62 |
| Porcentaje del techo de ruido alcanzado (total FIS) | 77 % |
| Calibración (ECE por ítem, sin calibración post-hoc) | 0,03–0,15 |
| Latencia de una pasada, H100 única, bf16 | ~130–300 ms tras warm-up |

Por ítem, frente a la media de 3 evaluadores:

| Item | r |
|---|---|
| Fluidez verbal | 0,70 |
| Esperanza | 0,75 |
| Persuasividad | 0,64 |
| Expresión emocional | 0,58 |
| Calidez | 0,55 |
| Empatía | 0,58 |
| Vínculo de alianza | 0,73 |
| Reparación de rupturas | 0,62 |

El modelo es más fuerte en ítems de contenido (esperanza, empatía, vínculo de alianza) que en ítems de entrega (fluidez verbal, expresión emocional). Los resultados completos y las ablaciones están en `RESULTS.md` del repositorio de código.

## Requisitos de hardware

- VRAM estimada: aproximadamente 64 GB en bf16 para el adaptador sobre Qwen3-Omni-30B-A3B-Instruct; una GPU de 80 GB es suficiente.
- GPU recomendadas: H100 de 80 GB (probado con torch 2.14.1 y transformers 5.19.0); A100 de 80 GB como alternativa por capacidad.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, etc.) en la variante de 30B.
- La variante FIS-Jev 7B sobre Qwen2.5-Omni-7B requiere unos 18 GB de VRAM y puede convivir con otros modelos para scoring en tiempo real.
- Opciones de despliegue: el autor proporciona `fis_jev/infer.py` en el repositorio de GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: ~130–300 ms por pasada en una H100 única tras el warm-up. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parametros del adaptador | VRAM | Concordancia (media 8 ítems) | Licencia |
|---|---|---|---|---|---|
| FIS-Jev | Qwen3-Omni-30B-A3B-Instruct | 13,4 M | ~64 GB (80 GB GPU) | 0,64 | No disponible |
| FIS-Jev 7B | Qwen2.5-Omni-7B | No disponible | ~18 GB | 0,57 | No disponible |
| Evaluador humano individual | — | — | — | 0,62 | — |

No se dispone de información sobre otros modelos comparables de puntuación FIS en la documentación proporcionada.

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigación y feedback en entornos de formación; no apto para decisiones clínicas, de contratación ni de certificación.
- Entrenado y evaluado solo en la tarea FIS: una única respuesta a un clip de cliente grabado; las sesiones multiturno no están validadas.
- Entrenado con transcripciones limpiadas por humanos; la precisión con transcripciones de reconocimiento automático del habla no se ha probado.
- Conjunto de evaluación pequeño: 230 respuestas de test, 178 con 3 evaluadores, procedentes de 12 participantes.
- Las puntuaciones pueden variar unas centésimas entre ejecuciones por la numeración en bf16 y MoE.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible.
- Riesgo de alucinación: no aplica en el sentido habitual, ya que el modelo no genera texto; el riesgo es de puntuaciones poco fiables fuera de la distribución de entrenamiento.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- Los datos de entrenamiento no son públicos, lo que limita la reproducibilidad completa.
- Solo inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3cqscbr/fis-jev
- Variante 7B: https://huggingface.co/3cqscbr/fis-jev-7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Repositorio de código: https://github.com/jbnhandsome/fis-jev
