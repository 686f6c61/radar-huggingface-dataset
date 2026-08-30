# laion/moss-va-sft3-quality-speed-dpo-lora

## Resumen

`laion/moss-va-sft3-quality-speed-dpo-lora` es un adaptador LoRA (rank 16) entrenado con DPO (Direct Preference Optimization) para el modelo de síntesis de voz expresiva `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`, desarrollado por LAION. Su propósito declarado es ajustar el modelo base para favorecer una mayor calidad de audio y una velocidad de habla natural, utilizando un corpus de pares de preferencia compuesto en un 75 % por pares de calidad (grabación limpia frente a ruidosa) y un 25 % por pares de velocidad (velocidad natural frente a estirada temporalmente).

El resultado es un caso de estudio negativo: en la evaluación interna de LAION, el adaptador no produce ninguna mejora significativa en la calidad de audio medida con DNSMOS (la mejor variante obtiene +0.011, con t = +0.26, estadísticamente no significativo). Además, el análisis de la dinámica de entrenamiento revela que el brazo de velocidad estaba resuelto desde el primer paso del optimizador (precisión 100 %), por lo que actuó como un freno sobre la inflación del margen de recompensa del brazo de calidad. Esto convierte al adaptador en un experimento útil sobre regularización implícita en DPO, pero no en una herramienta práctica para mejorar la salida de audio.

El repositorio contiene únicamente los pesos del adaptador en formato safetensors (0.6 GB), con licencia Apache-2.0 y soporte exclusivo para inglés. No se proporcionan métricas de rendimiento adicionales fuera de las reportadas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre transformer local (modelo base: `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 4.55B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, no procesa texto largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se inicializa desde `laion/moss-va-sft3-rate-lora` y se entrena con DPO sobre un corpus de 32.505 pares de preferencia: 24.379 pares de calidad (75 %) y 8.126 pares de velocidad (25 %). Los pares de calidad consisten en la misma grabación procesada por un enhancer de voz (`raw_sidon`) frente a la versión cruda, con una puerta de calidad de ≥ +0.10 DNSMOS. Los pares de velocidad usan la misma grabación a velocidad natural frente a una versión estirada temporalmente, forzando un balance 50/50 entre más rápida y más lenta.

El objetivo DPO usa β = 30, normalización por longitud y un ancla NLL de 0.013. El entrenamiento dura 2 épocas (1.962 actualizaciones) con tasa de aprendizaje 1e-6, 10 % de warmup, 4 pares por dispositivo en 4 GPUs, completándose en 1 hora y 25 minutos.

El hallazgo principal es que el brazo de velocidad se resuelve al 100 % de precisión desde el primer paso de optimización (lr 5e-9), mientras que el brazo de calidad permanece cerca del azar. Esto significa que los pares de velocidad, al estar trivialmente resueltos, no contribuyen gradiente pero sí entran en el promedio normalizado por longitud, actuando como un freno sobre la inflación del margen de recompensa. La mezcla 75/25 produce un desplazamiento de la política (`reward(chosen)`) de +12.3 al final del entrenamiento, frente a +29.9 del adaptador hermano solo-calidad, y deja de moverse después del paso 980.

## Capacidades

- Ajuste fino por preferencia para síntesis de voz expresiva (voice-acting) sobre el modelo base MOSS TTS local de 4.55B parámetros.
- Control de la velocidad de habla: el adaptador incorpora pares de preferencia de velocidad, aunque el resultado muestra que esta capacidad estaba ya resuelta en el modelo base.
- Potencial mejora de calidad de audio, pero no demostrada: la evaluación con DNSMOS no muestra diferencias significativas frente al modelo base.
- Compatible con el ecosistema de adaptadores de voz de LAION (500 adaptadores por perfil de voz) y con el servidor de demostración Humaneness-Voice-Demo-Server.
- No soporta tool calling, razonamiento multi-paso ni otras capacidades de modelos de lenguaje generales; es específico para TTS.

## Casos de uso

- Experimentación académica sobre dinámica de DPO: el adaptador sirve como caso de estudio para entender cómo un brazo de preferencia trivialmente resoluble actúa como regularizador del margen de recompensa, útil para investigadores que estudian sobreoptimización en DPO.
- Comparación controlada de recetas de entrenamiento: al diferir del adaptador solo-calidad únicamente en la inclusión del brazo de velocidad, permite aislar el efecto de la mezcla de pares en la convergencia del modelo.
- Evaluación de métricas de calidad subjetiva: dado que las métricas objetivas (DNSMOS, WER) no muestran diferencias, podría usarse en pruebas de escucha humana para verificar si el frenado del margen produce una percepción distinta, aunque esto no está validado.
- Referencia negativa en pipelines de TTS: como adaptador que no mejora la calidad, puede servir como control en evaluaciones de otros adaptadores de la misma familia.
- Investigación sobre weight tying y fusión de adaptadores: la advertencia explícita sobre la corrupción de la tabla de embeddings al fusionar lo convierte en un ejemplo para estudiar problemas de integridad de pesos en PEFT.
- Reutilización como punto de partida para entrenamientos posteriores: al estar inicializado desde un adaptador previo y entrenado con una mezcla específica, puede servir como base para experimentos de fine-tuning adicional, siempre que no se fusione.

## Benchmarks y rendimiento

La model card reporta métricas sobre 16 prompts × 3 muestras por checkpoint, promediadas por prompt (n = 16, t sobre prompts). DNSMOS es la métrica principal.

| checkpoint | DNSMOS | Δ vs base | t | WER | Δ WER | genuineness | Δ genu |
|---|---|---|---|---|---|---|---|
| base (sin adaptador) | 3.338 | — | — | 0.058 | — | 4.004 | — |
| step245 (raíz del repo) | 3.349 | +0.011 | +0.26 | 0.064 | +0.006 | 3.990 | −0.014 |
| step735 | 3.290 | −0.048 | −1.25 | 0.080 | +0.023 | 3.860 | −0.144 |
| step1225 | 3.308 | −0.030 | −0.84 | 0.059 | +0.001 | 3.987 | −0.018 |
| step1962 (final) | 3.314 | −0.024 | −0.86 | 0.082 | +0.024 | 3.929 | −0.075 |

Ninguna diferencia es estadísticamente significativa. El mejor checkpoint (step245) muestra +0.011 DNSMOS, pero el autor concluye que el adaptador no mejora la calidad de audio generada. Para comparación, el adaptador hermano solo-calidad alcanzó +0.017 (t +0.45) como mejor y −0.130 (t −2.05) como peor, tampoco superando al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible directamente. El modelo base tiene 4.55B parámetros; en FP16 requeriría aproximadamente 9-10 GB solo para los pesos, más el overhead de activaciones y el adaptador LoRA. No se proporcionan datos confirmados.
- GPU recomendadas: no disponible. El entrenamiento se realizó en 4 GPUs (sin especificar modelo), pero la inferencia podría ejecutarse en GPUs de consumo con ≥12 GB de VRAM (p. ej., RTX 3080/4080) si el modelo base cabe, aunque no está verificado.
- Despliegue: el adaptador se usa con la librería `peft` y `transformers` (ver código de inferencia en la model card). No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que es un modelo TTS específico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos TTS de la misma categoría. El propio autor lo compara con su hermano solo-calidad (`laion/moss-va-sft3-quality-dpo-lora`), pero ambos son variantes del mismo experimento y no modelos independientes. No se han publicado comparaciones con otros sistemas de síntesis de voz (p. ej., VITS, Tacotron, XTTS) en la información disponible.

## Limitaciones y advertencias

- Resultado negativo confirmado: el adaptador no mejora la calidad de audio según DNSMOS; su uso en producción no está justificado.
- Riesgo de corrupción de pesos: nunca fusionar este adaptador en los pesos base. Los módulos objetivo incluyen `audio_lm_heads.0 … audio_lm_heads.11`, cuyos tensores comparten almacenamiento con `audio_embeddings.N.weight` (weight tying). La fusión corrompe irreversiblemente la tabla de embeddings.
- Dependencia de un único enhancer: los 24.379 pares de calidad provienen exclusivamente de `raw_sidon`, lo que limita la generalización a otras definiciones de "limpieza" de audio.
- Sesgo de datos: el corpus de velocidad está forzado a 50/50 más rápido/lento, pero la fuente original es 59/41; aunque se estratifica por magnitud, puede no reflejar la distribución natural del habla.
- Idioma limitado: solo inglés, sin soporte multilingüe.
- Sin mejoras en WER ni genuineness: las métricas de reconocimiento de voz y autenticidad no muestran cambios significativos, y en algunos checkpoints empeoran ligeramente.
- No apto para uso comercial sin evaluación adicional: aunque la licencia es Apache-2.0, el resultado negativo y las advertencias técnicas desaconsejan su integración en productos sin una validación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/moss-va-sft3-quality-speed-dpo-lora
- Adaptador hermano solo-calidad: https://huggingface.co/laion/moss-va-sft3-quality-dpo-lora
- Repositorio de adaptadores de calidad (familia): https://huggingface.co/laion/moss-va-sft3-quality-lora-adapters
- Repositorio de 500 adaptadores de voz: https://huggingface.co/laion/moss-va-sft3-voice-loras
- Servidor de demostración de voice-acting: https://github.com/LAION-AI/Humaneness-Voice-Demo-Server
- Manual y estudios de MOSS Voice-Acting: https://projects.laion.ai/moss-voiceacting-manual/site/index.html
- Sitio de LAION: https://laion.ai/
