# sammyliu/mixit-fuss-tflocoformer-m16-plain-seed1

## Resumen

MixIT FUSS TF-Locoformer m16 plain seed1 es un modelo de separación de fuentes de audio entrenado mediante *mixture-invariant training* (MixIT) sobre mezclas reverberantes observadas del corpus FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. Lo desarrolla el usuario sammyliu y se publica como un *fit* completo de 60.000 actualizaciones, junto con sus cinco mejores checkpoints de validación, los pesos finales y la inicialización aleatoria. El modelo opera en audio mono a 8 kHz y produce 16 ranuras de salida no ordenadas que no corresponden a clases semánticas.

La arquitectura es un TF-Locoformer compacto (transformer con atención no causal en tiempo y frecuencia y *dual-path blocks*) con 64 canales, 4 cabezas, FFN de 128 y 3 bloques dual-path. El total de parámetros es de 1.302.800, lo que lo sitúa en la franja de modelos muy ligeros, aptos para inferencia en CPU o GPU de gama baja. El contexto no es de tipo token: procesa ventanas STFT de FFT 256 y hop 128 sobre *crops* de 4 segundos.

Su relevancia es metodológica: demuestra que es posible entrenar un separador con MixIT sobre mezclas reales reverberantes sin fuentes aisladas y obtener una mejora medible de SI-SDRi (6,2251 dB en test sobre 166 escenas multi-fuente). La licencia es restrictiva (`public-access-no-weight-license-grant`), lo que limita su uso comercial sin autorización expresa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path con atención no causal en tiempo y frecuencia) |
| Parametros totales | 1.302.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica en tokens; ventana de audio de 4 s, STFT FFT 256, hop 128, 8 kHz mono |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | en (etiqueta de la model card; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (other) |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un TF-Locoformer compacto con 16 ranuras de salida, 3 bloques dual-path, 64 canales, 4 cabezas de atención, FFN de 128, kernel de convolución 4 y 4 grupos de normalización RMS. La atención es no causal tanto en el eje temporal como en el frecuencial. La STFT usa FFT 256, hop 128 y ventana Hann con padding constante centrado. El *wrapper* de forma de onda normaliza cada entrada por su RMS internamente y restaura la amplitud tras la síntesis.

El entrenamiento usa MixIT sobre el dataset FUSS reverberante (20.000 escenas de entrenamiento y 1.000 de validación, revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`). Cada ejemplo combina dos escenas observadas distintas con *crops* aleatorios independientes de 4 segundos; cada escena contiene de 1 a 4 fuentes, por lo que la mezcla de mezclas puede llegar a 8. Se entrenó con AdamW (betas 0,9/0,999, epsilon 1e-8, weight decay 0,01), LR pico 0,001 con *warmup* lineal de 1.000 pasos y schedule coseno con suelo 0,0001, clipping de norma global 5, precisión BF16 en el *backbone* y FP32 en STFT, síntesis, asignación y objetivo. El *batch* es de 16 ejemplos y se realizaron 60.000 actualizaciones con semilla 1 en una NVIDIA A100 80GB.

La asignación MixIT es la variante "hard efficient": resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` mediante *linear solve* con *fallback* a pseudoinversa y asigna cada salida a la rama con mayor coeficiente. La pérdida es `-10 log10(max(||x||²,1e-8) / max(||x-xhat||² + 0.001||x||²,1e-8))` con umbral suave de 30 dB, y los términos de esparsidad RMS y covarianza *off-diagonal* tienen peso 0,0. Los gradientes no se diferencian a través del argmax duro. La consistencia de mezcla se aplica como proyección de residuo igual sobre todas las ranuras.

## Capacidades

- Separación de fuentes de audio en modo *offline* sobre mezclas reverberantes mono a 8 kHz.
- Producción de 16 ranuras de salida no ordenadas (sin correspondencia semántica con fuentes concretas).
- Procesamiento de mezclas de hasta 8 fuentes (composición de dos escenas de 1 a 4 fuentes cada una).
- Mejora de SI-SDRi respecto a la mezcla de entrada: 6,2251 dB en test y 5,8307 dB en validación.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo *thinking*, visión ni audio de entrada/salida más allá de la separación.
- Capacidad multilingüe: no aplica (modelo de audio; la etiqueta de idioma es "en").

## Casos de uso

- **Limpieza de grabaciones de reuniones**: separar voces superpuestas en una única pista mono a 8 kHz para facilitar la transcripción posterior con un ASR. El modelo es adecuado por su bajo coste computacional y su entrenamiento específico en mezclas reverberantes.
- **Preprocesado para pipelines de ASR en *call centers***: aplicar el separador antes del reconocedor para reducir la confusión entre hablantes en llamadas con solapamiento, usando las 16 ranuras como salidas candidatas que luego se filtran por energía.
- **Análisis de escenas acústicas urbanas**: separar fuentes ambientales (voces, tráfico, ruido mecánico) en grabaciones de 4 segundos para tareas de etiquetado o monitorización, aprovechando que no requiere fuentes aisladas para entrenar.
- **Investigación en separación de fuentes**: servir como *baseline* reproducible de MixIT con semilla fija, receta y métricas por escena en `metrics.json`, útil para comparar variantes de asignación o de arquitectura.
- **Prototipado en hardware modesto**: al tener 1,3 M de parámetros, puede ejecutarse en CPU o en GPU de gama baja para experimentos rápidos de separación a 8 kHz antes de escalar a modelos mayores.
- **Generación de datos sintéticos de entrenamiento**: usar las salidas separadas como pseudo-etiquetas para aumentar corpus de ASR o de *speaker diarization* en dominios con pocas fuentes aisladas disponibles.
- **Evaluación de robustez frente a reverberación**: emplear el modelo como referencia para medir cuánto degrada la reverberación la separación en condiciones controladas, dado que fue entrenado sobre FUSS reverberante.

## Benchmarks y rendimiento

| Metrica | Valor (dB) |
|---|---|
| MixIT en entrenamiento, 64 MoMs fijos | 13,2926 |
| MixIT en validación, 64 MoMs fijos | 12,9057 |
| SI-SDRi en validación, 653 escenas multi-fuente | 5,8307 |
| SI-SDRi en test, 166 escenas multi-fuente | 6,2251 |
| Intervalo bootstrap 95% de SI-SDRi en test | [5,2838; 7,1986] |
| MixIT en entrenamiento, media de las últimas 20 minibatches (paso 60.000) | 14,3027 |
| SI-SDRi en validación, subconjunto de progreso de 128 escenas (paso 60.000) | 5,4778 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El checkpoint `model.safetensors` se seleccionó por MixIT de validación en la actualización 60.000, no por SI-SDRi ni por rendimiento en test.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño de 1,3 M de parámetros; en la práctica, el consumo lo domina el *buffer* de audio y las operaciones STFT, no los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA 12.6 y PyTorch 2.7.1; el entrenamiento se realizó en una NVIDIA A100 80GB, pero la inferencia no requiere esa capacidad.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con suficiente memoria para el *runtime* de PyTorch; también es viable en CPU.
- Opciones de despliegue: PyTorch nativo con safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de audio).
- Latencia y throughput: no disponibles. El modelo procesa ventanas de 4 segundos y la inferencia es *offline* (atención no causal).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | SI-SDRi test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MixIT FUSS TF-Locoformer m16 plain seed1 | 1.302.800 | 4 s, 8 kHz mono | 6,2251 dB (166 escenas) | public-access-no-weight-license-grant | Hugging Face |
| TF-Locoformer Medium (paper original) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas MixIT de la literatura | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificables con otros modelos en la información proporcionada. La model card indica explícitamente que esta configuración compacta no es el modelo Medium del paper original.

## Limitaciones y advertencias

- Las 16 ranuras de salida son no ordenadas y no tienen correspondencia semántica con fuentes concretas; requieren asignación posterior (por ejemplo, Húngara) para evaluar o usar las salidas.
- El modelo se seleccionó por MixIT de validación, no por SI-SDRi; la consistencia de mezcla no garantiza una separación correcta de las fuentes.
- El intervalo de confianza del 95% en test ([5,2838; 7,1986] dB) describe incertidumbre entre escenas para una sola semilla, no entre semillas de entrenamiento.
- Solo procesa audio mono a 8 kHz; no es adecuado para música, audio de banda ancha ni señales multicanal.
- La atención no causal impide su uso en streaming o tiempo real.
- El test se evaluó sobre 256 escenas de los *shards* 8–11, no sobre el *split* completo; los resultados pueden no generalizar a todo el conjunto de test.
- Riesgo de sesgo: el entrenamiento se limita a FUSS reverberante y a la etiqueta de idioma "en"; el rendimiento en otros dominios acústicos o idiomas no está medido.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir salidas espurias en escenas con fuentes silenciosas (los denominadores usan suelo de 1e-8).
- Licencia restrictiva: `public-access-no-weight-license-grant`; el uso comercial requiere revisar `LICENSE-WEIGHTS.md` y obtener autorización expresa.
- No se garantiza igualdad bit a bit entre hardware o versiones de PyTorch distintas.
- El repositorio tiene 0 descargas y 0 *likes*; no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-plain-seed1
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-plain-seed1/blob/main/LICENSE-WEIGHTS.md
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
- Dataset FUSS (referencia en la model card): https://huggingface.co/datasets/scaleinvariant/fuss-parquet
