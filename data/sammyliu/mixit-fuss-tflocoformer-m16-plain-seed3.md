# sammyliu/mixit-fuss-tflocoformer-m16-plain-seed3

## Resumen

MixIT FUSS TF-Locoformer m16 plain seed3 es un modelo de separacion de fuentes de audio desarrollado por el usuario sammyliu y publicado en Hugging Face. Se trata de un separador de audio offline que opera a 8 kHz, entrenado mediante entrenamiento invariante a la mezcla (MixIT) sobre mezclas reverberantes observadas del conjunto de datos FUSS, sin objetivos de entrenamiento con fuentes aisladas. El modelo no realiza clasificacion semantica: sus 16 ranuras de salida son no ordenadas y no corresponden a clases de fuentes concretas.

La arquitectura es un TF-Locoformer compacto (transformer de doble ruta con atencion no causal en tiempo y frecuencia), con 3 bloques dual-path, 64 canales, 4 cabezas de atencion y FFN de 128 dimensiones. Con 1.302.800 parametros totales, es un modelo muy pequeno orientado a investigacion y experimentacion mas que a produccion. El repositorio incluye un ajuste completo de 60.000 actualizaciones, los cinco mejores checkpoints segun validacion, los pesos finales y la inicializacion aleatoria.

El modelo es relevante en el contexto de la separacion de fuentes sin etiquetas: demuestra que MixIT puede entrenar un separador funcional sobre mezclas reverberantes reales sin disponer de fuentes aisladas de referencia. Su licencia restrictiva (public-access-no-weight-license-grant) limita su uso practico, y su reducido tamano y ancho de banda (8 kHz) lo confinan a escenarios de investigacion y prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer de doble ruta, atencion no causal en tiempo y frecuencia) |
| Parametros totales | 1.302.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 4 segundos a 8 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repositorio; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea un backbone TF-Locoformer compacto con 16 ranuras de salida, 3 bloques dual-path, 64 canales, 4 cabezas de atencion, FFN de 128 dimensiones, kernel de convolucion 4 y 4 grupos de normalizacion RMS. La STFT usa FFT de 256, hop de 128 y ventana Hann con padding constante centrado. La atencion es no causal tanto en el eje temporal como en el frecuencial. El envoltorio de forma de onda normaliza cada entrada por su RMS internamente y restaura la amplitud tras la sintesis. Esta configuracion compacta no corresponde al modelo Medium del articulo original.

El entrenamiento se realizo sobre FUSS reverberante (20.000 escenas de entrenamiento y 1.000 de validacion), con dos escenas observadas distintas por ejemplo y crops aleatorios independientes de 4 segundos. El audio es mono a 8.000 Hz, con escalado RMS independiente por rama y suma de ramas sin normalizacion adicional. Cada escena observada contiene entre 1 y 4 fuentes, y la mezcla de mezclas puede contener hasta 8. Se usaron 16 ejemplos por lote, 60.000 actualizaciones del optimizador, AdamW con betas (0.9, 0.999), epsilon 1e-8, weight decay 0.01, tasa de aprendizaje pico de 0.001 con calentamiento lineal de 1.000 pasos multiplicado por schedule coseno y suelo de 0.0001, y recorte de gradiente por norma global de 5. La precision fue BF16 en el backbone y FP32 en STFT, sintesis, asignacion y objetivo, con TF32 permitido. El entrenamiento se ejecuto en una NVIDIA A100 de 80 GB con PyTorch 2.7.1 y CUDA 12.6.

La asignacion MixIT eficiente resuelve primero A = X Y^T (Y Y^T + 1e-6 I)^(-1) mediante resolucion lineal con fallback a pseudoinversa, y luego asigna cada salida a la rama con mayor coeficiente. La perdida es -10 log10(max(||x||²,1e-8) / max(||x-xhat||² + 0.001||x||²,1e-8)) con umbral suave de 30 dB, y los gradientes no se diferencian a traves del argmax duro. Los pesos de esparsidad RMS de fuente y de covarianza de forma de onda fuera de diagonal se fijaron a 0.0.

## Capacidades

- Separacion de fuentes de audio offline a 8 kHz sobre mezclas reverberantes.
- Produccion de 16 ranuras de salida no ordenadas, sin asignacion semantica a clases de fuentes.
- Entrenamiento invariante a la mezcla (MixIT) sin necesidad de fuentes aisladas de referencia.
- Procesamiento de escenas con 1 a 4 fuentes observadas y mezclas de mezclas de hasta 8 fuentes.
- Consistencia de mezcla mediante proyeccion de residuo equitativa sobre todas las ranuras de salida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues de texto: es un modelo puramente de audio.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Investigacion en separacion de fuentes sin supervisión: el modelo sirve como referencia reproducible para estudiar el comportamiento de MixIT sobre mezclas reverberantes reales, con receta, semillas y checkpoints documentados.
- Prototipado de pipelines de separacion en entornos de bajo recurso: sus 1,3 millones de parametros permiten experimentar en una unica GPU consumer y validar ideas antes de escalar a modelos mayores.
- Analisis de robustez de MixIT: la inclusion de la inicializacion aleatoria y de cinco checkpoints permite estudiar la variabilidad del entrenamiento y la seleccion por validacion.
- Docencia y formacion: el modelo y su receta detallada (optimizador, schedule, asignacion, perdida) constituyen un ejemplo didactico completo de entrenamiento MixIT.
- Evaluacion comparativa de arquitecturas de separacion: sirve como linea base compacta de TF-Locoformer frente a variantes mayores o a modelos supervisados.
- Experimentos de consistencia de mezcla: la proyeccion de residuo equitativa permite estudiar el equilibrio entre consistencia exacta y calidad de separacion.
- No se recomienda para produccion: su licencia restrictiva, su ancho de banda de 8 kHz y su tamano limitado lo orientan a investigacion.

## Benchmarks y rendimiento

| Medicion | Valor (dB) |
|---|---|
| MixIT en entrenamiento (64 MoMs fijos) | 13.2148 |
| MixIT en validacion holdout (64 MoMs fijos) | 12.9445 |
| SI-SDRi de fuente en validacion holdout (653 escenas multifuente) | 5.5679 |
| SI-SDRi de fuente en test (166 escenas multifuente) | 5.6790 |
| Intervalo bootstrap del 95% para SI-SDRi de test | [4.7344, 6.6582] |

El checkpoint `model.safetensors` se selecciono en la actualizacion 59.000 por puntuacion de reconstruccion MixIT en validacion, no por SI-SDRi de fuente ni por rendimiento en test. En la actualizacion final (60.000), la puntuacion MixIT de la senal de entrenamiento promediada sobre los ultimos 20 minilotes registrados fue 13.9521 dB, la de validacion 12.9334 dB y el SI-SDRi de fuente en validacion sobre el subconjunto de progreso de 128 escenas fue 5.0064 dB. La metrica MixIT mide la reconstruccion de las dos mezclas de referencia observadas tras asignar las salidas estimadas; el SI-SDRi de fuente mide la recuperacion de las fuentes constituyentes reales respecto a usar la propia mezcla de entrada. La consistencia exacta de mezcla no garantiza una separacion exitosa.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 1,3 millones de parametros, los pesos en FP32 ocupan aproximadamente 5 MB y en BF16 unos 2,6 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; el entrenamiento documentado uso una A100 de 80 GB por ajuste, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia puntual.
- Opciones de despliegue: el repositorio proporciona pesos en safetensors y codigo PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MixIT FUSS TF-Locoformer m16 plain seed3 | 1.302.800 | crops de 4 s a 8 kHz | SI-SDRi test 5.6790 dB | public-access-no-weight-license-grant | Hugging Face |
| TF-Locoformer Medium (articulo original) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de separacion MixIT supervisada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada; la comparativa se limita a la referencia cualitativa al modelo Medium del articulo original, cuya configuracion y resultados no se detallan.

## Limitaciones y advertencias

- Licencia restrictiva: public-access-no-weight-license-grant; debe revisarse el archivo LICENSE-WEIGHTS.md antes de cualquier uso, incluido el comercial.
- Modelo puramente de audio: no procesa texto, no soporta tool calling ni agentes, y su etiqueta de idioma "en" no implica capacidades linguisticas.
- Ancho de banda limitado a 8 kHz (audio telefonico), lo que restringe su aplicacion a musica o audio de alta fidelidad.
- Las 16 ranuras de salida son no ordenadas y no semanticas; no se puede asumir que una ranura corresponda a una fuente concreta.
- El checkpoint se selecciono por MixIT de validacion, no por SI-SDRi de fuente; el rendimiento de separacion puede no ser optimo.
- El SI-SDRi de test de 5.6790 dB presenta un intervalo de confianza amplio [4.7344, 6.6582] dB, calculado sobre 166 escenas de un unico seed; no refleja incertidumbre entre semillas de entrenamiento.
- La evaluacion de test usa 256 escenas de los shards 8-11, no la particion completa de test.
- Riesgo de alucinacion de fuentes: al ser un separador sin clases semanticas, puede generar salidas espurias en escenas con pocas fuentes o silencios.
- Sesgos desconocidos: no se documentan analisis de sesgo demografico, de idioma ni de tipo de audio.
- No se garantiza igualdad bit a bit entre hardware o versiones de PyTorch distintas.
- El modelo no es el Medium del articulo original; su configuracion compacta limita la calidad frente a variantes mayores.

## Enlaces

- Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-plain-seed3
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-plain-seed3/blob/main/LICENSE-WEIGHTS.md
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
