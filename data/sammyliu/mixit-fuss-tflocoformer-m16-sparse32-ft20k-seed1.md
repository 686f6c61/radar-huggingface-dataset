# sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed1

## Resumen

MixIT-FUSS-TF-Locoformer m16 sparse32 ft20k seed1 es un modelo de separacion de fuentes de audio desarrollado por el usuario sammyliu. Se trata de un separador no causal que opera a 8 kHz sobre mezclas reverberantes del dataset FUSS (FUSS reverberant) y que se entrena mediante MixIT, una variante de aprendizaje autosupervisado que no requiere fuentes aisladas como objetivo: solo necesita mezclas observadas. El modelo produce 16 ranuras de salida no ordenadas, sin asignacion semantica a clases de fuente.

La arquitectura es un TF-Locoformer compacto (transformer con atencion local y global en tiempo y frecuencia, organizado en bloques de doble camino) con 3 bloques dual-path, 64 canales, 4 cabezas de atencion y FFN de 128 unidades. El modelo tiene 1.302.800 parametros totales, lo que lo situa en la gama muy ligera, adecuada para experimentacion y despliegue con recursos limitados. El checkpoint liberado corresponde al paso 10.000 de un ajuste fino disperso (coeficiente de esparsidad 32) sobre el modelo base `mixit-fuss-tflocoformer-m16-plain-seed1`.

Es relevante por dos motivos: por un lado, demuestra una receta de entrenamiento de dos etapas (preentrenamiento MixIT de 60.000 actualizaciones y ajuste fino de 20.000) con seleccion de checkpoints guiada por SI-SDRi de fuentes en desarrollo; por otro, documenta con detalle las limitaciones de evaluacion (sin test independiente) y las restricciones de licencia, algo poco habitual en releases de investigacion. La licencia es `public-access-no-weight-license-grant`, lo que impide el uso comercial de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer con atencion local/global en tiempo y frecuencia, bloques dual-path) |
| Parametros totales | 1.302.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 4 s a 8 kHz, 32.000 muestras) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precision BF16/FP32 en entrenamiento) |
| Idiomas soportados | en (etiqueta de idioma del repo; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (licencia "other", sin concesion de pesos) |
| Formato de pesos | safetensors (checkpoints adicionales en `checkpoints/`) |

## Arquitectura y entrenamiento

El modelo es un TF-Locoformer compacto con 16 ranuras de salida, 3 bloques dual-path, 64 canales, 4 cabezas de atencion, FFN de 128 unidades, kernel de convolucion 4 y 4 grupos de normalizacion RMS. La atencion es no causal tanto en tiempo como en frecuencia (modelo offline). La entrada se procesa mediante STFT con FFT de 256, hop de 128 y ventana Hann con padding constante centrado; el wrapper normaliza por RMS cada mezcla internamente, restaura la amplitud tras la sintesis y aplica consistencia de mezcla residual igualitaria (distribuye `mixture - sum(outputs)` por igual entre las ranuras). El dropout es 0 y el multiplicador residual de la FFN es 1.0.

El entrenamiento sigue una receta de dos etapas. Primero se entrena el modelo padre (`mixit-fuss-tflocoformer-m16-plain-seed1`) durante 60.000 actualizaciones y se selecciona su checkpoint por MixIT de validacion en el paso 60.000. Despues se cargan esos pesos, se reinician el optimizador AdamW y el sampler, y se ejecutan 20.000 actualizaciones de ajuste fino con coeficiente de esparsidad 32 (frente a 0 en el padre). Los datos son escenas reverberantes de FUSS: 20.000 escenas de entrenamiento y 1.000 de desarrollo (revision `b183027b802d1a488dea8b6f1d80daa32b76b681`). Cada actualizacion usa 16 pares de mezclas, muestreando dos escenas observadas distintas con crops independientes de 4 s; cada escena contiene de 1 a 4 fuentes y la mezcla de mezclas puede contener hasta 8. El optimizador es AdamW (betas 0.9/0.999, epsilon 1e-8, weight decay 0.01), con LR constante de 0.0001 en el ajuste fino y clipping de norma global 5. La precision es BF16 en el backbone y FP32 en STFT, sintesis, asignacion y objetivo. El entrenamiento se ejecuto en PyTorch 2.7.1/CUDA 12.6 sobre una NVIDIA A100 80GB por fit, con algoritmos deterministas de Torch.

La innovacion tecnica principal es el uso de MixIT con resolucion eficiente de asignacion: para mezclas de referencia X y salidas Y se resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` con fallback a pseudoinversa, cada salida se asigna a la referencia con mayor coeficiente y las asignadas se suman. La perdida es `-10 log10(max(||x||²,1e-8)/max(||x-xhat||² + 0.001||x||²,1e-8))` con umbral suave de 30 dB, y los gradientes no diferencian a traves del argmax. El ajuste fino anade 32 veces `mean_m(rms(y_m))/||rms(y)||_2` con denominadores con suelo 1e-8. Ningun objetivo de fuente aislada entra en los gradientes; las etiquetas de fuente se usaron solo para seleccion de checkpoints y desarrollo de la receta.

## Capacidades

- Separacion de fuentes de audio en mezclas reverberantes mono a 8 kHz, con hasta 8 fuentes simultaneas en la mezcla de mezclas.
- Produccion de 16 ranuras de salida no ordenadas y sin asignacion semantica a clases de fuente.
- Entrenamiento autosupervisado MixIT: no requiere fuentes aisladas durante el entrenamiento.
- Consistencia de mezcla residual: la suma de las salidas reconstruye la mezcla de entrada con un residuo distribuido uniformemente.
- Ajuste fino disperso que favorece soluciones con menos ranuras activas.
- Capacidad de checkpoint seleccionado por SI-SDRi de fuentes en el conjunto de desarrollo.
- Procesamiento offline (no causal), adecuado para separacion por lotes y no para streaming en tiempo real.

## Casos de uso

- Investigacion en separacion de fuentes: servir de referencia reproducible de MixIT con TF-Locoformer compacto, permitiendo replicar la receta de dos etapas y comparar variantes de esparsidad y seleccion de checkpoints.
- Preprocesado de audio para transcripcion: separar mezclas reverberantes de hasta 8 fuentes antes de pasar cada pista a un ASR, aprovechando la ventana de 4 s y el muestreo a 8 kHz, suficiente para voz.
- Limpieza de grabaciones de campo: separar vocalizaciones de fauna o conversaciones solapadas en grabaciones de 8 kHz, usando las 16 ranuras para aislar fuentes dominantes sin etiquetas previas.
- Generacion de datos sinteticos de entrenamiento: usar las salidas separadas como pseudo-etiquetas para entrenar modelos mas ligeros o para aumentar datasets de separacion con escenas reverberantes.
- Analisis de reunion y diarizacion preliminar: separar hablantes solapados en audio de reunion de 8 kHz antes de un modulo de diarizacion, ya que las ranuras no ordenadas no requieren conocer el numero de hablantes a priori.
- Evaluacion de metricas de separacion: emplear el modelo como caso de prueba de pipelines de MixIT y SI-SDRi, verificando la implementacion de la resolucion lineal de asignacion y la consistencia de mezcla.
- Docencia y prototipado: al tener 1,3 M de parametros, puede ejecutarse en CPU o en GPUs de consumo para demostraciones de separacion autosupervisada sin infraestructura grande.

## Benchmarks y rendimiento

Los resultados publicados son metricas de desarrollo del propio autor, no de un conjunto de test independiente. El autor advierte explicitamente de que no se realizo evaluacion en test para este ajuste fino y de que las puntuaciones de desarrollo no deben presentarse como rendimiento de test insesgado.

| Medicion en el checkpoint seleccionado (paso 10.000) | dB |
|---|---:|
| MixIT de senal de entrenamiento (media de 20 minibatches registrados) | 14,0444 |
| MixIT de conjunto de entrenamiento (64 pares fijos) | 12,6412 |
| MixIT de desarrollo holdout (64 pares fijos) | 12,4878 |
| SI-SDRi de fuentes en desarrollo holdout (653 escenas multifuente) | 7,8923 |

Intervalo bootstrap de escena al 95% para SI-SDRi de fuentes: [7,3821; 8,4105] dB. El autor indica que este intervalo cubre la variacion entre escenas para este checkpoint, pero no la variacion entre semillas ni la seleccion sobre la misma cohorte de desarrollo.

En el paso final fijo 20.000: MixIT de senal de entrenamiento 14,4258 dB, MixIT de desarrollo 12,4417 dB y SI-SDRi de fuentes en desarrollo 7,7898 dB.

| Paso de ajuste fino | SI-SDRi de fuentes en desarrollo (dB) | Pesos |
|---|---:|---|
| 10000 | 7,8923 | `checkpoints/step-00010000.safetensors` |
| 20000 | 7,7898 | `checkpoints/step-00020000.safetensors` |
| 8000 | 7,7432 | `checkpoints/step-00008000.safetensors` |
| 18000 | 7,7184 | `checkpoints/step-00018000.safetensors` |
| 14000 | 7,6971 | `checkpoints/step-00014000.safetensors` |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de separacion de audio. Los valores MixIT miden la reconstruccion de dos mezclas de referencia observadas tras asignar salidas; la consistencia exacta de mezcla y las puntuaciones MixIT altas no garantizan la recuperacion de fuentes individuales, segun el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,3 M de parametros, los pesos ocupan aproximadamente 2,6 MB en FP16/BF16 y 5,2 MB en FP32; el consumo dominante es el buffer de STFT y las activaciones, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el entrenamiento se realizo en una NVIDIA A100 80GB por fit, pero la inferencia no requiere esa clase de hardware.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU, dado el tamano del modelo y la ventana de 4 s.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y codigo propio de wrapper, el despliegue tipico es mediante script PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La naturaleza no causal y el procesamiento por crops de 4 s implican procesamiento por lotes offline.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | SI-SDRi desarrollo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed1 | 1.302.800 | crops de 4 s a 8 kHz | 7,8923 dB | public-access-no-weight-license-grant | Hugging Face |
| mixit-fuss-tflocoformer-m16-plain-seed1 (modelo base) | no disponible | crops de 4 s a 8 kHz | no disponible | no disponible | Hugging Face |
| Alternativas de separacion TF-Locoformer de mayor tamano (p. ej., Medium) | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor indica que este modelo compacto no es el modelo Medium original de TF-Locoformer. No se dispone de datos de benchmarks comparables con otros separadores en la informacion proporcionada.

## Limitaciones y advertencias

- Sin evaluacion en test independiente: las puntuaciones de desarrollo (SI-SDRi 7,8923 dB) estan sesgadas por la seleccion de checkpoint sobre la misma cohorte de desarrollo y no deben presentarse como rendimiento de test.
- Salidas no ordenadas y sin semantica: las 16 ranuras no corresponden a clases ni a hablantes concretos, lo que impide asignar identidades de forma directa.
- Resolucion limitada: opera a 8 kHz mono, insuficiente para musica de alta fidelidad o audio de banda ancha; la ventana de 4 s limita el contexto temporal.
- Modelo no causal: no apto para separacion en streaming o tiempo real.
- Alta consistencia de mezcla no implica buena separacion: el propio autor advierte de que puntuaciones MixIT altas no garantizan recuperacion de fuentes individuales.
- Licencia restrictiva: `public-access-no-weight-license-grant` con licencia "other"; no hay concesion de pesos para uso comercial, por lo que la produccion comercial esta prohibida salvo autorizacion expresa.
- Riesgo de artefactos y alucinacion de fuentes: al no usar objetivos de fuente aislada, el modelo puede generar componentes espurios en mezclas con fuentes muy solapadas o con relaciones senal-ruido bajas.
- Idiomas: la etiqueta de idioma es "en" y el modelo se entreno con FUSS, mayoritariamente habla en ingles; el rendimiento en otros idiomas o dominios acusticos no esta documentado.
- Sin datos de sesgo: no se documentan analisis de sesgo por genero, edad o acento; el uso en produccion requiere auditoria propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion externa inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed1
- Modelo base (plain seed1, revision exacta): https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-plain-seed1/tree/756b53a635c013195cf62d196a264393ac84fd42
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed1/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS (parquet): https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
