# 3cqscbr/fis-jev-7b

## Resumen

FIS-Jev 7B es un adaptador LoRA desarrollado por 3cqscbr sobre Qwen2.5-Omni-7B, orientado a la evaluacion automatica de habilidades interpersonales facilitativas (Facilitative Interpersonal Skills, FIS) en psicoterapia. El modelo puntua la respuesta hablada de un terapeuta en los 8 items de la tarea FIS (fluidez verbal, esperanza, persuasividad, expresion emocional, calidez, empatia, alianza terapeutica y reparacion de rupturas) a partir del video de la respuesta (audio y fotogramas de webcam) y su transcripcion.

A diferencia de un modelo generativo convencional, FIS-Jev 7B no produce texto: en un unico forward pass lee los logits de los tokens `1`–`5` en 8 posiciones (slots), obteniendo una distribucion de probabilidad 1–5 por item. El valor esperado de esa distribucion es la puntuacion y la propia distribucion actua como medida de confianza. Es la variante pequena del modelo FIS-Jev de 30B (basado en Qwen3-Omni-30B), con menor precision (media de 8 items 0,57 frente a 0,64 de los evaluadores humanos) pero con un requisito de memoria mucho menor (~18 GB frente a ~64 GB), lo que lo hace adecuado para puntuacion en tiempo real turno a turno.

El modelo es relevante ahora porque demuestra un uso practico de modelos omni (audio + vision + texto) como evaluadores especializados mediante adaptadores de bajo rango, con calibracion razonable (ECE 0,04–0,10) y latencias de ~280 ms por pase en una H100, sin necesidad de generar texto ni de un pipeline de decodificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen2.5-Omni-7B (solo thinker, sin talker) |
| Parametros totales | 40,4M en el adaptador LoRA (sobre los ~7B del modelo base congelado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-Omni-7B) |
| Tipos de cuantizacion | no disponible (entrenado y probado en bf16; el adaptador se distribuye en float32) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter.safetensors`) + `adapter_config.json` |

Detalles adicionales del adaptador: LoRA con r=16, α=32 aplicado a `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de las 28 capas del decoder. Permanecen congelados los pesos base, los encoders de audio y vision y el LM head.

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura multimodal de Qwen2.5-Omni-7B (encoder de audio, encoder de vision y decoder transformer), pero solo la parte "thinker". Sobre el decoder se aplica un adaptador LoRA que modifica las proyecciones de atencion y de la MLP. La innovacion clave esta en la cabeza de salida: en lugar de generar texto, el modelo lee los logits de los tokens `1`–`5` en 8 posiciones fijas (una por item FIS), produciendo una distribucion de 5 clases por item. El total FIS es la media de los 8 valores esperados.

La entrada combina audio a 16 kHz y fotogramas de webcam (0,5 fps, 320×180, maximo 64 fotogramas) intercalados en fragmentos de 2 s, seguidos de la transcripcion y del contexto del cliente. El entrenamiento uso 996 respuestas FIS con video, transcripcion y puntuaciones de evaluadores, divididas por participante en train 554 / dev 212 / test 230. Las etiquetas son suaves (soft labels) construidas a partir de las puntuaciones de medio punto de cada evaluador, con valor esperado igual a la media de los 3 evaluadores; la perdida es entropia cruzada. Se entreno sobre train + dev (766 respuestas) durante 3 epocas con AdamW, lr 2e-4, warm-up y schedule coseno, batch 8, dropout LoRA 0,05, en 4×H100. Los datos de entrenamiento no son publicos.

## Capacidades

- Puntuacion de 8 items FIS (fluidez verbal, esperanza, persuasividad, expresion emocional, calidez, empatia, alianza terapeutica y reparacion de rupturas) en escala 1–5.
- Procesamiento multimodal conjunto: audio de la respuesta del terapeuta, fotogramas de webcam y transcripcion.
- Salida de distribucion de probabilidad por item (no solo la puntuacion), utilizable como medida de confianza.
- Calibracion sin post-proceso (ECE 0,04–0,10 por item).
- Inferencia en un unico forward pass, sin generacion autoregresiva de texto.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidad multilingue limitada al ingles.
- No dispone de modo thinking, vision generativa ni sintesis de audio; el uso de vision y audio es solo como entrada para la puntuacion.

## Casos de uso

- Evaluacion formativa de terapeutas en entrenamiento: el modelo puntua cada respuesta grabada a un clip de cliente y devuelve las 8 puntuaciones FIS con su distribucion, permitiendo al supervisor identificar items debiles (por ejemplo, expresion emocional o calidez) sin revision manual item a item.
- Feedback en tiempo real durante practicas simuladas: con ~280 ms de latencia mediana en H100, el modelo puede puntuar cada turno del terapeuta a medida que se produce, habilitando paneles de retroalimentacion en vivo en entornos de formacion.
- Investigacion en psicoterapia: permite puntuar grandes volumenes de respuestas grabadas de forma consistente y con calibracion conocida, sustituyendo parte del trabajo de evaluadores humanos en estudios que requieran la escala FIS.
- Control de calidad de programas de formacion: agregacion de puntuaciones por participante y por item para detectar areas curriculares con bajo desempeno (por ejemplo, reparacion de rupturas con r=0,57).
- Triaje de material para revision humana: uso de la confianza (distribucion por item) para priorizar que respuestas requieren revision de un evaluador humano, reduciendo coste de anotacion.
- Despliegue en GPUs compartidas: con ~18 GB de VRAM en bf16, el adaptador puede convivir con otros modelos en la misma GPU, lo que facilita su integracion en pipelines de investigacion ya existentes.

## Benchmarks y rendimiento

Resultados en el conjunto de test reservado (230 respuestas; 178 con 3 evaluadores, de 12 participantes):

| Metrica | FIS-Jev 7B | FIS-Jev 30B | Referencia humana |
|---|---|---|---|
| FIS total vs. media de 3 evaluadores, Pearson r (230 respuestas) | 0,63 | 0,71 | no disponible |
| Concordancia con la media de los otros dos evaluadores, media de 8 items (178 respuestas) | 0,57 | 0,64 | 0,62 (evaluador humano individual) |
| Calibracion ECE por item (sin calibracion post-hoc) | 0,04–0,10 | no disponible | no disponible |
| Latencia por pase, H100, bf16 | mediana ~280 ms (p95 ~630 ms) | no disponible | no disponible |
| Memoria GPU para inferencia | ~18 GB | ~64 GB | no disponible |

Correlacion por item frente a la media de 3 evaluadores:

| Item | r |
|---|---|
| Fluidez verbal | 0,60 |
| Esperanza | 0,70 |
| Persuasividad | 0,54 |
| Expresion emocional | 0,45 |
| Calidez | 0,46 |
| Empatia | 0,56 |
| Alianza terapeutica | 0,73 |
| Reparacion de rupturas | 0,57 |

El modelo es mas fuerte en items de contenido (esperanza, alianza) que en items de ejecucion (expresion emocional, calidez), y la brecha frente al modelo de 30B es mayor precisamente en los items de ejecucion.

## Requisitos de hardware

- VRAM estimada: ~18 GB libres en bf16 para inferencia.
- GPU recomendadas: H100 (probada con torch 2.14.1 y transformers 5.19.0); cualquier GPU con al menos 18 GB libres.
- Cabe en GPUs de consumo con 24 GB (por ejemplo, RTX 4090), aunque no se han publicado pruebas en ellas.
- Opciones de despliegue: script propio `fis_jev/infer.py` del repositorio de codigo con `--lora-mlp`; el adaptador usa su propia capa LoRA y no PEFT, por lo que no es directamente compatible con vLLM, TGI, llama.cpp u Ollama sin adaptacion.
- Latencia: mediana ~280 ms por pase tras warm-up, p95 ~630 ms en una H100 en bf16.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento FIS (media 8 items) | Memoria GPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FIS-Jev 7B | 40,4M LoRA sobre Qwen2.5-Omni-7B | no disponible | 0,57 | ~18 GB | no disponible | Hugging Face |
| FIS-Jev 30B | LoRA sobre Qwen3-Omni-30B | no disponible | 0,64 | ~64 GB | no disponible | Hugging Face |
| Evaluador humano individual | no aplica | no aplica | 0,62 | no aplica | no aplica | no aplica |

No se dispone de informacion sobre otros modelos comparables especializados en la tarea FIS.

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigacion y feedback formativo; no debe emplearse en decisiones clinicas, de contratacion ni de certificacion.
- Entrenado y evaluado solo en la tarea FIS (una unica respuesta a un clip de cliente grabado); la puntuacion de turnos en conversaciones multi-turno no esta validada.
- Entrenado con transcripciones limpiadas manualmente; la precision con transcripciones de reconocimiento automatico del habla (ASR) no se ha probado.
- Las respuestas cortas (de pocos segundos) aportan poca informacion y sus puntuaciones tienden al centro de la escala.
- Conjunto de evaluacion pequeno (230 respuestas de test; 178 con 3 evaluadores, de 12 participantes), lo que limita la robustez de las estimaciones.
- Las puntuaciones estan muy concentradas: los valores 3 y 4 suponen el 86–97 % de cada item, lo que puede sesgar hacia el centro de la escala.
- Mayor debilidad en items de ejecucion (expresion emocional r=0,45, calidez r=0,46) que en items de contenido.
- Solo soporta ingles.
- Licencia no disponible: verificar condiciones antes de cualquier uso, especialmente comercial.
- Los datos de entrenamiento no son publicos, lo que dificulta la auditoria de sesgos.
- No genera texto ni soporta tool calling, agentes o razonamiento multi-paso; su uso esta acotado a la puntuacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3cqscbr/fis-jev-7b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Variante de 30B: https://huggingface.co/3cqscbr/fis-jev
- Repositorio de codigo: https://github.com/jbnhandsome/fis-jev
- Resultados y ablaciones: `RESULTS.md` en el repositorio de codigo
