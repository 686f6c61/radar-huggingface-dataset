# Diffusion-Research-Lab/elliptical-alpha-stable-mixture-1p2-200d-diffusion

## Resumen

El modelo `elliptical-alpha-stable-mixture-1p2-200d-diffusion` es un modelo de difusión generativa incondicional de referencia, publicado por Diffusion-Research-Lab bajo el identificador `Diffusion-Research-Lab/elliptical-alpha-stable-mixture-1p2-200d-diffusion`. No es un modelo de lenguaje: genera muestras sinteticas de 200 dimensiones a partir de una mezcla de componentes elipticas simetricas alpha-estables de rango completo, un tipo de distribucion de colas pesadas. Su proposito es servir como referencia reproducible para evaluar la calidad de distintos esquemas de difusion (DDPM, DLPM y EDM) sobre datos sinteticos con colas pesadas, un escenario donde los modelos de difusion convencionales suelen fallar.

El repositorio agrupa tres entrenamientos independientes con la misma red neuronal (un MLP de 4 capas, anchura 240, `time_dim` 128 y 717.944 parametros entrenables) y distintos objetivos de prediccion: DDPM-V (predice velocidad), DLPM-Eps (predice ruido) y t-EDM (predice dato denoizado). Ademas incluye una variante DDIM-V que reutiliza los pesos de DDPM-V con un muestreador determinista. El dataset de entrenamiento es sintetico: 25.000 muestras de entrenamiento, 1.000 de validacion y 10.000 de test, cada una de forma `[200]`, generadas con la libreria `gendynamics`.

Su relevancia es metodologica mas que practica: proporciona pesos, configuraciones, comprobaciones de exportacion y procedencia para reproducir experimentos sobre generacion de colas pesadas, un area poco cubierta por los modelos generativos convencionales. Los pesos se distribuyen en formato `safetensors` con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de difusion (width 240, depth 4, time_dim 128, use_norm true, dropout 0.0, dim 200) |
| Parametros totales | 717.944 por cada modelo entrenado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion sobre vectores de 200 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `normalization.safetensors` cuando aplica) |

## Arquitectura y entrenamiento

La red es un MLP condicionado por el paso de tiempo de difusion: anchura 240, cuatro capas, `time_dim` 128, normalizacion activada y sin dropout. La entrada y la salida son vectores de dimension 200. El repositorio contiene tres objetivos de entrenamiento distintos sobre la misma arquitectura:

- **DDPM-V**: prediccion de velocidad, 128 pasos de muestreo, `sigma_max` 2.0, muestreador DDPM. Entrenado con AdamW, learning rate 0.0005, schedule coseno con 400 pasos de calentamiento, weight decay 1e-6, grad clip 10.0, batch 1024. Se ejecutaron 394 epocas y se selecciono la mejor en la epoca 294; perdida de validacion 1801 y de test 536.1.
- **DLPM-Eps**: prediccion de ruido, 128 pasos, `alpha` 1.8, muestreador nativo. Misma configuracion de entrenamiento. 640 epocas ejecutadas, mejor en la 579; perdida de validacion 0.9493 y de test 1.026.
- **t-EDM**: prediccion del dato denoizado, 64 pasos, `nu` 2.2, `sigma_min` 0.005, `sigma_max` 5.0, `sigma_data` 1.0, solver `edm_stochastic_heun`. Learning rate 0.0001. 226 epocas ejecutadas, mejor en la 126; perdida de validacion 13.43 y de test 267.3.
- **DDIM-V**: reutiliza los pesos de DDPM-V cambiando solo el muestreador a DDIM determinista (`eta=0`); no tiene entrenamiento propio.

El dataset es una mezcla sintetica de componentes elipticas simetricas alpha-estables de rango completo, con rotaciones de componentes sembradas, escalas de eje espaciadas logaritmicamente y traza de dispersion fija. La particion train/validacion/test (25.000/1.000/10.000) esta sembrada y documentada en `dataset.json`. No hay normalizacion aplicada a los datos. Las perdidas corresponden a objetivos distintos y, segun el autor, no son comparables entre si como medida de calidad de muestreo. El repositorio incluye `provenance.json` con versiones de software y revision de la fuente, y `export_check.json` con la verificacion de recarga de cada modelo.

## Capacidades

- Generacion incondicional de muestras sinteticas de 200 dimensiones con colas pesadas alpha-estables.
- Tres esquemas de difusion alternativos sobre la misma arquitectura y dataset: DDPM (velocidad), DLPM (ruido) y EDM (dato denoizado).
- Muestreo estocastico (DDPM, EDM con Heun estocastico) y determinista (DDIM con `eta=0`).
- Reproducibilidad completa: semillas, configuraciones, checksums y comprobaciones de exportacion documentadas.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- **Investigacion en generacion de colas pesadas**: el modelo permite generar muestras de una distribucion alpha-estable conocida y comparar la fidelidad de la cola frente a la distribucion teorica, algo dificil de evaluar con modelos generativos entrenados sobre datos reales.
- **Referencia para comparar esquemas de difusion**: al compartir arquitectura y dataset, DDPM-V, DLPM-Eps y t-EDM permiten aislar el efecto del objetivo de prediccion y del muestreador en la calidad de las muestras.
- **Validacion de implementaciones de difusion**: los pesos y configuraciones sirven como caso de prueba reproducible para verificar que una implementacion propia de DDPM, DLPM o EDM reproduce las perdidas y las muestras del autor.
- **Estudio de estabilidad numerica en colas pesadas**: las perdidas de validacion y test notablemente distintas entre objetivos (por ejemplo, 13.43 frente a 267.3 en t-EDM) ofrecen un punto de partida para analizar inestabilidad en la prediccion de datos denoizados con colas alpha-estables.
- **Docencia y divulgacion**: el tamano reducido (717.944 parametros, entrenamiento en CPU para datos y GPU para el modelo) permite ejecutar el ciclo completo de entrenamiento y muestreo en hardware modesto con fines didacticos.
- **Pruebas de infraestructura de despliegue**: al cargarse mediante `load_huggingface_model` y el paquete `toolkit`, sirve para validar pipelines internos de carga de modelos `safetensors` y verificacion de procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta perdidas de validacion y test por objetivo, que no son comparables entre si segun la propia model card:

| Modelo | Perdida validacion | Perdida test | Epocas ejecutadas / mejor |
|---|---:|---:|---:|
| DDPM-V | 1801 | 536.1 | 394 / 294 |
| DLPM-Eps | 0.9493 | 1.026 | 640 / 579 |
| t-EDM | 13.43 | 267.3 | 226 / 126 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 717.944 parametros y opera sobre vectores de 200 dimensiones.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el entrenamiento se realizo en `cuda` con batch 1024 y datos en CPU. No se requiere A100 ni H100.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, e incluso GPUs integradas con soporte CUDA) y en CPU para muestreo.
- Opciones de despliegue: la libreria propia `gendynamics` y el paquete de entrenamiento `2_training_2026_tail_reference_models`, cargando los pesos con `load_huggingface_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoria (difusion incondicional sobre mezclas alpha-estables de 200 dimensiones) ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni respuestas; cualquier uso conversacional es inadecuado.
- Dominio muy restringido: solo modela la mezcla sintetica alpha-estable descrita; no generaliza a datos reales ni a otras dimensiones.
- Las perdidas reportadas usan objetivos distintos y no miden calidad de muestreo; el autor advierte que las previsualizaciones de muestras no garantizan precision en las colas.
- Riesgo de sobreajuste o inestabilidad en la cola: la diferencia entre perdida de validacion y de test en DDPM-V (1801 frente a 536.1) y t-EDM (13.43 frente a 267.3) sugiere comportamiento erratico fuera de la distribucion de entrenamiento.
- Los datos de origen no se redistribuyen; las condiciones de la fuente synthetic quedan con su proveedor, aunque los pesos son MIT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- No hay informacion sobre sesgos, idiomas ni cuantizacion porque no aplican a este tipo de modelo.
- Para uso comercial, la licencia MIT del repositorio cubre los pesos, pero conviene revisar los terminos del dataset sintetico y de la libreria `gendynamics`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Diffusion-Research-Lab/elliptical-alpha-stable-mixture-1p2-200d-diffusion
- Repositorio de la libreria `gendynamics`: https://github.com/Diffusion-Research-Lab/gendynamics
- Paquete de entrenamiento: https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models
- Resultados de busqueda web: no se encontraron enlaces tecnicos relevantes sobre este modelo; los resultados devueltos (Wikipedia, Larousse, Futura-Sciences) tratan sobre el concepto fisico de difusion y no son aplicables.
