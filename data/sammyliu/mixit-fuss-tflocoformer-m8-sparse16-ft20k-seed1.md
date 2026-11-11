# sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed1

## Resumen

MixIT-FUSS TF-Locoformer m8 sparse16 ft20k seed1 es un modelo de separación de fuentes de audio entrenado con MixIT (Mixture Invariant Training) sobre mezclas reverberantes del dataset FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. Lo desarrolla el usuario sammyliu y es un fine-tune de 20.000 actualizaciones sobre el checkpoint público `mixit-fuss-tflocoformer-m8-plain-seed1`, con un coeficiente de dispersión de 16 activo durante el ajuste. El modelo opera a 8 kHz en mono, procesa ventanas de 4 segundos (32.000 muestras) y produce 8 slots de salida no ordenados ni asociados a clases semánticas.

Se trata de un modelo muy compacto (1.293.568 parámetros) basado en un backbone TF-Locoformer con 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128 dimensiones. Su relevancia radica en demostrar que es posible obtener separación de fuentes razonable en escenarios reverberantes sin etiquetas de fuente aislada, usando únicamente mezclas observadas y selección de checkpoint guiada por SI-SDRi de desarrollo. Es un artefacto de investigación, no un producto listo para producción.

La licencia es `public-access-no-weight-license-grant`, lo que implica acceso público a los pesos pero sin concesión de licencia de uso; cualquier uso comercial requiere consultar los términos del archivo LICENSE-WEIGHTS.md. El modelo está pensado para inglés (etiqueta `en`) y su pipeline no está declarado en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path con atención no causal en tiempo y frecuencia) |
| Parámetros totales | 1.293.568 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 4 s a 8 kHz (32.000 muestras); atención no causal sobre toda la ventana |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | en (etiqueta del modelo; el audio es independiente del idioma, pero la card declara `en`) |
| Licencia | public-access-no-weight-license-grant (acceso público sin concesión de licencia de pesos) |
| Formato de pesos | safetensors (`model.safetensors` y `checkpoints/step-*.safetensors`) |

## Arquitectura y entrenamiento

El backbone es un TF-Locoformer compacto con 8 slots de salida, 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128 dimensiones, kernel de convolución 4 y 4 grupos de normalización RMS. La entrada se transforma con STFT de FFT 256, hop 128 y ventana Hann con padding constante centrado. La atención es no causal tanto en tiempo como en frecuencia, por lo que el modelo es offline (no streaming). El wrapper normaliza cada mezcla por RMS internamente, restaura la amplitud tras la síntesis y aplica consistencia de mezcla residual igualitaria: distribuye `mixture - sum(outputs)` equitativamente entre los slots. `config.json` registra todos los campos de arquitectura.

El entrenamiento sigue una receta en dos etapas. Primero se entrena el modelo padre "plain" durante 60.000 actualizaciones y se selecciona el checkpoint de validación-MixIT en la actualización 56.000. Después se cargan esos pesos, se reinician el estado de AdamW y el sampler, y se ejecutan 20.000 actualizaciones de fine-tune con coeficiente de dispersión 16 (frente a 0 en el padre) y tasa de aprendizaje constante de 0,0001 sin warmup. Los datos son FUSS reverberante (revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`), con 20.000 escenas de entrenamiento y 1.000 de desarrollo; cada escena observada contiene entre 1 y 4 fuentes, y la mezcla de mezclas puede contener hasta 8. Se muestrean dos escenas observadas distintas con recortes independientes de 4 s, escalado por rama dividiendo por RMS (suelo 1e-8) y suma sin normalización posterior. El batch es de 16 pares por actualización, precisión BF16 en el backbone y FP32 en STFT, síntesis, asignación y objetivo, con TF32 permitido. La pérdida MixIT eficiente resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` con pseudoinversa de respaldo, asigna cada salida a la referencia de mayor coeficiente y aplica umbral suave de 30 dB; los gradientes no se diferencian a través del argmax. El fine-tune añade 16 veces `mean_m(rms(y_m))/||rms(y)||_2`. No entra ninguna fuente aislada en los gradientes.

## Capacidades

- Separación de fuentes de audio en mezclas reverberantes mono a 8 kHz, con hasta 8 slots de salida.
- Producción de 8 pistas separadas no ordenadas (los slots no corresponden a clases semánticas ni a hablantes concretos).
- Procesamiento offline de ventanas de 4 segundos con atención no causal en tiempo y frecuencia.
- Consistencia de mezcla residual: la suma de salidas reconstruye la mezcla de entrada con el residuo repartido equitativamente.
- Normalización interna por RMS de la mezcla y restauración de amplitud a la salida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades de visión, audio generativo, ASR ni traducción.
- Capacidad multilingüe no aplicable: es un modelo de separación de señal, no de lenguaje; la card declara `en`.

## Casos de uso

- Investigación en separación de fuentes sin etiquetas: el modelo sirve como referencia reproducible de MixIT sobre FUSS reverberante, con receta completa en `recipe.json` y checkpoints intermedios para estudiar la evolución de SI-SDRi.
- Prototipado de separación de habla en entornos reverberantes: útil para experimentar con mezclas de 1 a 4 fuentes en ventanas de 4 s a 8 kHz antes de invertir en modelos mayores.
- Generación de datos aumentados: las 8 salidas pueden usarse como pseudo-fuentes para preentrenar otros separadores o para aumentar datasets de ASR con mezclas controladas.
- Evaluación de métricas de separación: permite comparar MixIT reconstruction frente a SI-SDRi de fuente y estudiar la divergencia entre ambas métricas en un modelo pequeño y auditable.
- Docencia y reproducción de experimentos: su tamaño (1,3 M de parámetros) y su receta determinista (algoritmos deterministas de Torch, `CUBLAS_WORKSPACE_CONFIG=:4096:8`) lo hacen adecuado para prácticas y verificación de resultados.
- Baseline ligero en pipelines de separación en tiempo no real: puede integrarse como etapa offline en herramientas de análisis de audio donde el coste computacional debe ser mínimo y no se requiere streaming.
- Estudio de regularización por dispersión: el coeficiente 16 del fine-tune permite analizar el efecto de la esparsidad en la calidad de separación frente al padre con coeficiente 0.

## Benchmarks y rendimiento

Los datos publicados son métricas de desarrollo del propio autor, no benchmarks estándar comparables con otros modelos. No se realizó evaluación independiente en test.

| Medición en el checkpoint seleccionado (update 2.000) | dB |
|---|---:|
| MixIT de señal de entrenamiento (media de 20 minibatches registrados) | 13,5035 |
| MixIT de conjunto de entrenamiento (64 pares fijos) | 12,9440 |
| MixIT de desarrollo holdout (64 pares fijos) | 12,5916 |
| SI-SDRi de fuente en desarrollo holdout (653 escenas multifuente) | 9,1209 |

Intervalo bootstrap del 95 % por escena para SI-SDRi de fuente: [8,5558; 9,7180] dB. Este intervalo cubre variación entre escenas del mismo checkpoint, no variación entre semillas ni selección sobre la misma cohorte de desarrollo.

En la actualización final fija 20.000: MixIT de señal de entrenamiento 14,3895 dB, MixIT holdout 12,6518 dB y SI-SDRi de fuente holdout 8,6834 dB. Este endpoint no es el checkpoint seleccionado.

| Update de fine-tune | SI-SDRi de fuente en desarrollo (dB) | Pesos |
|---|---:|---|
| 2000 | 9,1209 | `checkpoints/step-00002000.safetensors` |
| 18000 | 9,0776 | `checkpoints/step-00018000.safetensors` |
| 14000 | 8,9282 | `checkpoints/step-00014000.safetensors` |
| 6000 | 8,8261 | `checkpoints/step-00006000.safetensors` |
| 8000 | 8,7856 | `checkpoints/step-00008000.safetensors` |

No se han publicado resultados de benchmarks estándar (por ejemplo, SiSEC, WSJ0-2mix o Libri2Mix) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en FP32 (1.293.568 parámetros, unos 5 MB de pesos) más buffers de STFT y activaciones para ventanas de 32.000 muestras; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó con una NVIDIA A100 80GB por ejecución, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: sí, en cualquier RTX/GTX moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch 2.7.1 con CUDA 12.6 es el entorno documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de audio de este tipo). El modelo se carga como módulo PyTorch con safetensors.
- Latencia y throughput estimados: no disponibles. El autor documenta dos hilos de CPU y una A100 por entrenamiento, pero no publica cifras de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El propio autor indica que este modelo compacto no es el modelo Medium original de TF-Locoformer, pero no se aportan datos de ese modelo ni de alternativas como Conv-TasNet, SepFormer o Mossformer para establecer una comparación numérica.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (m8 sparse16 ft20k seed1) | 1.293.568 | ventana de 4 s a 8 kHz | public-access-no-weight-license-grant | safetensors en HF |
| sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1 (padre) | no disponible | ventana de 4 s a 8 kHz | no disponible | safetensors en HF |
| Alternativas de separación (Conv-TasNet, SepFormer, etc.) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se realizó evaluación independiente en test; las cifras de desarrollo no deben presentarse como rendimiento no sesgado en test.
- La selección de checkpoint usó etiquetas de fuente y la misma cohorte de desarrollo, lo que introduce sesgo de selección y sobreajuste a esa cohorte.
- Los slots de salida son no ordenados y no tienen significado semántico; no se puede asignar un slot concreto a un hablante o fuente determinada.
- MixIT alto no garantiza buena recuperación de fuentes individuales; el modelo puede reconstruir la mezcla con alta consistencia sin separar bien las fuentes.
- Modelo offline y no causal: no apto para streaming ni aplicaciones de baja latencia en tiempo real.
- Ancho de banda limitado a 8 kHz y audio mono; no adecuado para música de alta fidelidad ni para separación en estéreo.
- Entrenado sobre FUSS reverberante; el dominio fuera de ese dataset (otras reverberaciones, ruidos, idiomas) no está validado.
- Licencia `public-access-no-weight-license-grant`: acceso público a los pesos pero sin concesión de licencia de uso; el uso comercial requiere revisar LICENSE-WEIGHTS.md.
- Solo se declara el idioma `en`; aunque el audio es independiente del idioma, no hay validación multilingüe.
- Sin datos de benchmarks estándar ni de latencia/throughput en producción.
- El modelo es un artefacto de investigación con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed1
- Modelo padre (plain seed1): https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1
- Revisión concreta del padre usada: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1/tree/7eba74ff4f81c9fc04bbcc4badd4959ab95555cd
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed1/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS (parquet): https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
