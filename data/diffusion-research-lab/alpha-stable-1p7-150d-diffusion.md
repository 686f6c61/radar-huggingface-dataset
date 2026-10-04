# Diffusion-Research-Lab/alpha-stable-1p7-150d-diffusion

## Resumen

alpha-stable-1p7-150d-diffusion es un repositorio de modelos de difusion de referencia desarrollado por Diffusion-Research-Lab, publicado bajo licencia MIT y pensado exclusivamente para generacion incondicional de vectores sinteticos de 150 dimensiones que siguen una distribucion alpha-estable isotropica (distribuciones de cola pesada). No es un modelo de lenguaje: no procesa texto, imagenes ni audio, sino tensores numericos de forma `[150]`, y su proposito es servir como referencia reproducible para evaluar algoritmos de difusion sobre datos sinteticos con colas pesadas.

El repositorio agrupa varias variantes entrenadas de forma independiente sobre el mismo dataset sintetico: DDPM-V (predice velocidad), DLPM-Eps (predice ruido, con parametro alpha=1.9), t-EDM (predice dato denoised, con nu=2.1) y una variante DDIM-V que reutiliza los pesos de DDPM-V cambiando unicamente el sampler a DDIM determinista. Todas comparten la misma red: un MLP de 693.894 parametros entrenables, con anchura 240, profundidad 4, embedding temporal de 128 dimensiones y normalizacion activada.

Su relevancia es acotada y muy especializada: se trata de un "banco de pruebas" metodologico mas que de un modelo de produccion. El propio autor advierte en la model card que las perdidas de validacion y test de cada variante usan objetivos distintos (velocity, ruido, dato denoised) y por tanto no son comparables entre si como medida de calidad de muestra, y que las previsualizaciones de muestras no establecen exactitud de cola. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y la busqueda web no aporta informacion tecnica adicional sobre el.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (red densa feedforward) con condicionamiento temporal; `width` 240, `depth` 4, `time_dim` 128, `dropout` 0.0, `use_norm` true, `dim` 150 |
| Parametros totales | 693.894 por variante entrenada |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; la entrada es un vector de 150 dimensiones |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; los pesos se distribuyen en `model.safetensors`) |
| Idiomas soportados | no aplica (modelo generativo de vectores numericos, no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`); ficheros adicionales `config.json`, `dataset.json`, `metrics.json`, `provenance.json`, `export_check.json` y, cuando procede, `normalization.safetensors` |
| Libreria | gendynamics |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura es un MLP de 4 capas con anchura 240 y embedding temporal de 128 dimensiones, compartido por todas las variantes. El objetivo de difusion cambia segun la variante: DDPM-V predice la velocidad con sampler DDPM y 128 pasos de muestreo; DLPM-Eps predice el ruido con sampler nativo, alpha=1.9 y 128 pasos; t-EDM predice el dato denoised con solver `edm_stochastic_heun`, 64 pasos, nu=2.1, sigma_min=0.005, sigma_max=5.0 y sigma_data=1.0. DDIM-V no tiene entrenamiento propio: reutiliza los pesos de DDPM-V y solo cambia el sampler a DDIM determinista con eta=0.

Los datos de entrenamiento son muestras sinteticas isotropicas alpha-estables generadas con `gendynamics.datasets.fetch_synthetic_data('alpha_stable')`, con split aleatorio sembrado de 10.000/1.000/10.000 muestras de forma `[150]` para train/validacion/test y sin normalizacion. La configuracion de entrenamiento comun incluye device CUDA, data_device CPU, batch_size 1024, presupuesto maximo de 640 epocas, early stopping con paciencia 100, optimizador AdamW, weight_decay 1e-6, grad_clip_norm 10.0, scheduler coseno con 400 pasos de warmup y cosine_eta_min_ratio 0.05. El learning rate difiere por variante: 0.0001 para DDPM-V y 0.0005 para DLPM-Eps y t-EDM. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo generativo numerico.

Las epocas efectivamente ejecutadas y la mejor epoca segun validacion fueron: DDPM-V 322/222 con val loss 20.9 y test loss 13.22; DLPM-Eps 640/560 con val loss 0.961 y test loss 1.018; t-EDM 147/47 con val loss 1.75 y test loss 4.618. Los pesos distribuidos corresponden a la mejor epoca de validacion. El autor indica explicitamente que cada perdida usa su propio objetivo y no son comparables entre variantes.

## Capacidades

- Generacion incondicional de vectores sinteticos de 150 dimensiones con distribucion alpha-estable isotropica.
- Muestreo con multiples formulaciones de difusion: DDPM (prediccion de velocidad), DLPM (prediccion de ruido) y EDM estocastico (prediccion de dato denoised).
- Muestreo determinista mediante DDIM con eta=0, reutilizando los pesos de DDPM-V.
- Generacion por lotes: la API `model.sample(16)` devuelve 16 muestras en una sola llamada.
- Desnormalizacion opcional de las muestras si el repositorio incluye `normalization.safetensors` (en este caso la model card indica normalizacion `None` en el dataset).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- No tiene modo thinking, vision ni audio.
- No se documentan capacidades de condicionamiento (clase, etiqueta o prompt): es generacion puramente incondicional.

## Casos de uso

- Validacion de implementaciones de difusion: sirve como referencia numerica para comprobar que una implementacion propia de DDPM, DLPM o EDM reproduce perdidas y muestras coherentes sobre un dataset sintetico controlado.
- Estudio de colas pesadas en modelos generativos: al generar datos alpha-estables isotropicos, permite medir si un sampler reproduce correctamente la masa de probabilidad en las colas, un regimen donde los modelos generativos suelen fallar.
- Benchmark de samplers: las variantes DDPM-V y DDIM-V comparten pesos y solo cambian el sampler, lo que permite aislar el efecto del muestreo estocastico frente al determinista con 128 pasos.
- Analisis de objetivos de entrenamiento: DLPM-Eps (ruido) y t-EDM (dato denoised) permiten comparar formulaciones de prediccion sobre exactamente los mismos datos y la misma red MLP.
- Docencia e investigacion en modelos de difusion: con 693.894 parametros, el modelo entrena y muestrea en CPU, lo que lo hace adecuado para practicas y experimentos reproducibles sin GPU.
- Pruebas de integracion de la libreria gendynamics: el repositorio incluye `provenance.json` y `export_check.json`, utiles para verificar flujos de carga, versionado y exportacion de pesos.
- Generacion de datos sinteticos auxiliares para pruebas de pipelines numericos que necesiten entradas de 150 dimensiones con colas pesadas, sin depender de datos reales sujetos a licencias.
- Verificacion de reproducibilidad: el dataset y los splits estan fijados por semilla y descritos en `dataset.json`, lo que permite repetir el entrenamiento y comparar con las perdidas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Al no ser un modelo de lenguaje, esas metricas no aplican. Lo unico publicado son las perdidas de validacion y test por variante, con la advertencia del autor de que no son comparables entre si:

| Variante | Objetivo de prediccion | Parametros entrenables | Pasos de muestreo | Learning rate | Epocas ejecutadas / mejor | Val loss | Test loss |
|---|---|---:|---:|---:|---:|---:|---:|
| DDPM-V | velocidad | 693.894 | 128 | 0.0001 | 322 / 222 | 20.9 | 13.22 |
| DLPM-Eps | ruido | 693.894 | 128 | 0.0005 | 640 / 560 | 0.961 | 1.018 |
| t-EDM | dato denoised | 693.894 | 64 | 0.0005 | 147 / 47 | 1.75 | 4.618 |
| DDIM-V | velocidad (pesos de DDPM-V) | 693.894 | no disponible | no aplica (sin entrenamiento) | no aplica | no aplica | no aplica |

El numero de filas reservadas usadas para cada test loss figura en `metrics.json`, pero ese dato no se incluye en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 693.894 parametros, aproximadamente 2,8 MB en fp32 y 1,4 MB en fp16/bf16, mas el espacio de activaciones (anchura 240, profundidad 4, lotes de hasta 1024 muestras). En la practica cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente (por ejemplo GTX 1050 Ti, RTX 3050 o superiores). No requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos.
- Ejecucion en CPU: viable. El ejemplo de la model card carga explicitamente con `device="cpu"`, y el entrenamiento original uso `data_device: cpu` con `num_workers: 0`.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (son herramientas para modelos de lenguaje). La via soportada es la libreria gendynamics mediante `toolkit.huggingface.load_huggingface_model`.
- Latencia y throughput: no se han publicado mediciones. El coste de muestreo depende del numero de pasos del sampler (128 para DDPM-V, DLPM-Eps y DDIM-V; 64 para t-EDM).

## Comparativa con modelos similares

No se ha identificado en la informacion proporcionada ningun modelo comparable especifico (mismo tamano, mismo tipo de dato o mismo objetivo) con el que establecer una comparativa de parametros, contexto, rendimiento, licencia y disponibilidad. Los resultados de la busqueda web recibidos tratan exclusivamente del fenomeno fisico de la difusion y no son relevantes.

Conceptualmente, las formulaciones empleadas (DDPM, DDIM, EDM) corresponden a familias metodologicas ampliamente conocidas, pero la informacion disponible no incluye repositorios, pesos ni metricas de alternativas concretas que permitan una comparacion cuantitativa. Las tres variantes del propio repositorio (DDPM-V, DLPM-Eps, t-EDM) se solapan en arquitectura y datos, por lo que la comparacion interna queda limitada a la tabla de perdidas de la seccion anterior, que el autor declara no comparable.

## Limitaciones y advertencias

- Ambito muy restringido: genera vectores de 150 dimensiones de una unica distribucion sintetica. No es reutilizable para texto, imagen, audio ni datos tabulares reales.
- Las perdidas de las distintas variantes no son comparables entre si porque usan objetivos de entrenamiento distintos (velocidad, ruido, dato denoised), tal como advierte el autor.
- Las previsualizaciones de muestras no establecen exactitud de cola; el propio autor lo senala en la model card. La evaluacion de una distribucion de cola pesada requiere metricas especificas que no se publican.
- No se documenta ningun analisis de sesgos, y en este tipo de modelo el concepto no aplica del modo habitual, pero si existe el riesgo de que el generador no reproduzca fielmente la distribucion objetivo.
- Riesgo de discrepancia entre el nombre del repositorio (`1p7`) y los parametros configurados: DLPM-Eps usa alpha=1.9 y t-EDM usa nu=2.1. No se aclara en la informacion disponible a que valor de alpha corresponde exactamente el dataset generado, por lo que conviene revisar `dataset.json` antes de reutilizarlo.
- Sin normalizacion en el dataset (`normalization: None`), lo que implica que las escalas de las muestras generadas dependen directamente del generador sintetico.
- El codigo de generacion del dataset no se redistribuye; los datos fuente siguen sujetos a los terminos de su proveedor. Unicamente el checksum del fichero procesado identifica esta instantanea.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero exige citar la revision del repositorio de modelos al usar los pesos.
- Sin mantenimiento ni comunidad: 0 descargas y 0 likes en el momento de la consulta, con creacion y ultima actualizacion en la misma fecha (2026-10-04), lo que sugiere un artefacto de investigacion sin soporte.
- No se publican versiones cuantizadas, y el formato de pesos es exclusivamente safetensors, lo que limita su uso fuera del ecosistema gendynamics.

## Enlaces

- HuggingFace: https://huggingface.co/Diffusion-Research-Lab/alpha-stable-1p7-150d-diffusion
- Repositorio de la libreria gendynamics: https://github.com/Diffusion-Research-Lab/gendynamics
- Repositorio del paquete de entrenamiento: https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models
- Paper o publicacion tecnica: no disponible
- Demo: no disponible
- Resultados de benchmarks externos: no disponible
