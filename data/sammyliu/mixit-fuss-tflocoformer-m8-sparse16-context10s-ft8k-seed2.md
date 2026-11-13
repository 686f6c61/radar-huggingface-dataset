# sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed2

## Resumen

MixIT-FUSS TF-Locoformer m8 sparse16 context10s seed2 es un modelo de separacion de fuentes de audio desarrollado por el usuario sammyliu y publicado en Hugging Face. Se trata de un separador offline y no causal que opera a 8 kHz y que ha sido entrenado sobre mezclas reverberantes del dataset FUSS sin disponer de senales aisladas de referencia durante el entrenamiento, empleando la tecnica MixIT (mixture invariant training) para aprender a separar las fuentes constituyentes a partir de mezclas observadas.

El modelo es un fine-tune de 8.000 actualizaciones sobre el checkpoint base sammyliu/mixit-fuss-tflocoformer-m8-plain-seed2, que a su vez fue entrenado con un schedule de 60.000 actualizaciones. La innovacion principal de esta version es la incorporacion de un coeficiente de esparsidad de 16 durante el fine-tune, que penaliza la asignacion de energia a slots innecesarios y empuja al modelo hacia representaciones mas limpias de las fuentes. El backbone es un TF-Locoformer compacto con 8 slots de salida y 3 bloques dual-path, con solo 1.293.568 parametros totales.

El modelo es relevante en el contexto de la investigacion en separacion de fuentes porque demuestra que es posible obtener una separacion razonable (SI-SDRi de 8,72 dB en desarrollo) sin supervisión de fuentes aisladas, lo que reduce drasticamente el coste de anotacion. Su licencia restrictiva (public-access-no-weight-license-grant) limita su uso comercial y lo orienta a fines de investigacion y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer con bloques dual-path y STFT) |
| Parametros totales | 1.293.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de entrada de 10 segundos (80.000 muestras a 8 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea un backbone TF-Locoformer compacto con 3 bloques dual-path, 64 canales, 4 cabezas de atencion, FFN de 128 dimensiones, kernel de convolucion 4 y 4 grupos de normalizacion RMS. La representacion espectral se obtiene mediante STFT con FFT de 256 puntos, hop de 128, ventana Hann y padding constante centrado. El modelo produce 8 slots de salida no ordenados, que no corresponden a clases semanticas de fuentes. La entrada es audio mono a 8.000 Hz con 80.000 muestras (10 segundos), procesado en BF16 para el backbone y FP32 para STFT, sintesis, asignacion y objetivo, con TF32 permitido.

El entrenamiento se realizo en dos etapas. Primero, el modelo padre se entreno durante 60.000 actualizaciones sobre 20.000 escenas de entrenamiento y 1.000 de desarrollo del dataset FUSS reverberante, seleccionando el checkpoint de validacion en la actualizacion 58.000. Despues, se cargaron los pesos de ese checkpoint, se reiniciaron el optimizador AdamW y el sampler, y se ejecutaron 8.000 actualizaciones de fine-tune con un coeficiente de esparsidad de 16 (frente a 0 en el padre) y una tasa de aprendizaje constante de 0,0001 sin warmup. El muestreo utiliza dos escenas distintas con recortes independientes y uniformes de 10 segundos, cada rama se normaliza por RMS (suelo de 1e-8) y se suman sin normalizacion adicional. Cada escena observada contiene entre 1 y 4 fuentes, y la mezcla de mezclas puede contener hasta 8. El entrenamiento se ejecuto en una NVIDIA A100 de 80 GB con PyTorch 2.7.1/CUDA 12.6, usando algoritmos deterministas y CUBLAS_WORKSPACE_CONFIG=:4096:8.

## Capacidades

- Separacion de fuentes de audio en 8 slots de salida no ordenados, sin asignacion semantica a tipos de fuente.
- Procesamiento de mezclas reverberantes de hasta 8 fuentes constituyentes (cada escena observada contiene entre 1 y 4 fuentes).
- Funcionamiento offline y no causal, adecuado para procesamiento por lotes y no para streaming en tiempo real.
- Entrada de audio mono a 8 kHz con ventanas de 10 segundos (80.000 muestras).
- Normalizacion RMS interna de la mezcla y restauracion de amplitud tras la sintesis.
- Consistencia de mezcla residual: distribucion de `mixture - sum(outputs)` entre las salidas.
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente de audio).
- No dispone de capacidades multilingues en el sentido de texto; la etiqueta "en" del repositorio no implica procesamiento de lenguaje.

## Casos de uso

- Investigacion en separacion de fuentes sin supervisión: el modelo sirve como linea base para experimentos de MixIT sobre FUSS, permitiendo evaluar recetas de esparsidad y schedules de fine-tune sin necesidad de datos aislados de referencia.
- Preprocesado de audio para transcripcion: separar mezclas reverberantes de hasta 8 fuentes en slots independientes antes de pasar cada slot a un sistema ASR, mejorando la relacion senal-ruido efectiva por hablante.
- Analisis de escenas acusticas: descomponer grabaciones de campo o reuniones en componentes para estudiar la actividad de fuentes y la estadistica de mezcla, dado que el modelo expone 8 slots y una consistencia de mezcla residual explicita.
- Generacion de datos sinteticos de entrenamiento: usar los slots separados como pseudo-etiquetas para aumentar datasets de separacion o de reconocimiento de eventos acusticos, aceptando la limitacion de que los slots no son clases semanticas.
- Evaluacion comparativa de recetas de entrenamiento: el repositorio incluye cinco checkpoints con sus puntuaciones de desarrollo (8,7182, 8,6200, 8,4602, 8,4511 y 8,4241 dB), lo que permite reproducir el analisis de seleccion de checkpoint y estudiar la relacion entre MixIT y SI-SDRi.
- Prototipado de pipelines de separacion en CPU/GPU de gama media: con 1,29 M de parametros, el modelo es lo bastante pequeno para iterar rapidamente en experimentos de separacion sin requerir hardware de gran escala.
- Docencia y divulgacion: ilustrar el funcionamiento de MixIT, la consistencia de mezcla y la diferencia entre metricas de reconstruccion (MixIT) y de recuperacion de fuentes (SI-SDRi) con un modelo compacto y reproducible.

## Benchmarks y rendimiento

Los datos de rendimiento publicados en la model card se refieren a metricas de desarrollo, no a un conjunto de test independiente. El autor indica explicitamente que no se realizo evaluacion en test independiente para este fine-tune.

| Medicion en el checkpoint seleccionado (actualizacion 5.000) | dB |
|---|---:|
| MixIT de senal de entrenamiento (media de 20 minibatches registrados) | 14,1137 |
| MixIT de conjunto de entrenamiento (64 pares fijos de evaluacion) | 12,3761 |
| MixIT de desarrollo holdout (64 pares fijos de evaluacion) | 12,4623 |
| SI-SDRi de fuentes en desarrollo holdout (653 escenas multi-fuente) | 8,7182 |

Intervalo bootstrap al 95% por escena para SI-SDRi de fuentes: [8,1709; 9,2809] dB. Este intervalo cubre la variacion entre escenas para este checkpoint, pero no la variacion entre semillas ni la seleccion sobre la misma cohorte de desarrollo.

En la actualizacion final fija 8.000 (evaluacion comun de cuatro segundos): MixIT de senal de entrenamiento 13,8747 dB, MixIT de holdout 12,4561 dB y SI-SDRi de fuentes en holdout 8,3345 dB. Este punto final difiere de un checkpoint seleccionado.

| Actualizacion de fine-tune | SI-SDRi de fuentes en desarrollo (dB) | Pesos |
|---|---:|---|
| 5000 | 8,7182 | `checkpoints/step-00005000.safetensors` |
| 2000 | 8,6200 | `checkpoints/step-00002000.safetensors` |
| 4000 | 8,4602 | `checkpoints/step-00004000.safetensors` |
| 4800 | 8,4511 | `checkpoints/step-00004800.safetensors` |
| 3000 | 8,4241 | `checkpoints/step-00003000.safetensors` |

Para `final.safetensors` con entrada y scoring de 10 segundos: MixIT de entrenamiento 13,8747 dB, MixIT de holdout 13,2323 dB, SI-SDRi de fuentes uno-a-uno 10,8732 dB, intervalo bootstrap al 95% por escena [10,3662; 11,3831] dB, SI-SDR absoluto de fuentes 4,9936 dB, y 742 escenas multi-fuente activas de 1.000. El autor advierte que la ventana objetivo, la actividad de fuentes y la linea base de mezcla cambian con la duracion del scoring, por lo que estas cifras no deben compararse como una ganancia del modelo sobre el protocolo de seleccion de cuatro segundos.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 1.293.568 parametros, los pesos en FP32 ocupan aproximadamente 5,2 MB y en BF16 unos 2,6 MB; el consumo dominante proviene de las activaciones de STFT y de los buffers de audio, no de los pesos.
- GPU recomendadas: el autor entreno en una NVIDIA A100 de 80 GB, pero ese requisito corresponde al pipeline de entrenamiento completo (16 pares por actualizacion, BF16, auditoria de 1.000 escenas). Para inferencia, cualquier GPU consumer moderna es suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con soporte CUDA, incluidas GTX 1060, RTX 3060, RTX 4090 y similares; tambien es viable en CPU para procesamiento por lotes.
- Opciones de despliegue: el modelo se distribuye en safetensors y esta pensado para PyTorch (PyTorch 2.7.1/CUDA 12.6 en el entorno de entrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de audio de este tipo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El modelo es no causal y procesa ventanas de 10 segundos, por lo que la latencia dependera del hardware y del tamano de lote; no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos en la informacion proporcionada. La siguiente tabla recoge la comparacion con el modelo padre, del que este fine-tune deriva, segun los datos de la model card.

| Modelo | Parametros | Contexto de entrada | SI-SDRi desarrollo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed2 (este) | 1.293.568 | 10 s a 8 kHz | 8,7182 dB (checkpoint 5.000, protocolo 4 s) | public-access-no-weight-license-grant | Hugging Face |
| mixit-fuss-tflocoformer-m8-plain-seed2 (padre) | no disponible | no disponible | no disponible | no disponible | Hugging Face (revision bd5ba96) |

No se conocen en la informacion disponible otros modelos de separacion de fuentes comparables con los que establecer una comparativa cuantitativa; se indica "no disponible".

## Limitaciones y advertencias

- Los slots de salida son no ordenados y no corresponden a clases semanticas de fuentes; no debe asumirse que el slot 1 sea siempre la misma fuente entre ventanas.
- No se realizo evaluacion en un conjunto de test independiente. Las puntuaciones de desarrollo (8,7182 dB de SI-SDRi) estan sesgadas por la seleccion de checkpoint sobre la misma cohorte y no deben presentarse como rendimiento de test no sesgado.
- El intervalo bootstrap al 95% no corrige la variacion entre semillas ni la seleccion de modelo o receta.
- Las metricas de MixIT miden la reconstruccion de dos mezclas de referencia observadas tras asignar las salidas; una alta consistencia de mezcla y un alto MixIT no garantizan la recuperacion de fuentes individuales.
- Las cifras de `final.safetensors` con scoring de 10 segundos no son comparables con las del protocolo de seleccion de 4 segundos, porque cambian la ventana objetivo, la actividad de fuentes y la linea base de mezcla.
- El modelo opera exclusivamente a 8 kHz mono; no se documenta soporte para otras frecuencias de muestreo, estereo ni audio de mayor ancho de banda.
- Es un modelo offline y no causal: no es adecuado para separacion en streaming o en tiempo real con requisitos de baja latencia.
- La licencia public-access-no-weight-license-grant es restrictiva y no otorga derechos de uso comercial de los pesos; debe revisarse el archivo LICENSE-WEIGHTS.md antes de cualquier uso en produccion.
- No se documentan sesgos especificos, pero al entrenarse sobre FUSS reverberante, el rendimiento puede degradarse en dominios acusticos distintos (estudio seco, ruido no reverberante, fuentes musicales).
- Riesgo de alucinacion en el sentido de asignacion espuria de energia a slots vacios cuando la escena contiene menos fuentes que slots; la consistencia de mezcla residual mitiga pero no elimina este efecto.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed2
- Modelo padre: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed2/tree/bd5ba96b56665a01bb8299aa7d40b6d13976933e
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed2/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
