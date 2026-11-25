# Diffusion-Research-Lab/elliptical-alpha-stable-mixture-1p8-100d-diffusion

## Resumen

El modelo `elliptical-alpha-stable-mixture-1p8-100d-diffusion` es un conjunto de modelos de difusion de referencia entrenados por Diffusion-Research-Lab con la libreria `gendynamics`. No es un modelo de lenguaje ni un modelo generativo de imagenes: es un banco de modelos de difusion de proposito experimental que aprenden a muestrear una distribucion sintetica concreta, una mezcla de componentes elipticas simetricas alpha-estables de rango completo en 100 dimensiones. El repositorio contiene tres variantes entrenadas de forma independiente (DDPM-V, DLPM-Eps y t-EDM) mas una cuarta (DDIM-V) que reutiliza los pesos de DDPM-V cambiando solo el muestreador.

El interes del modelo es metodologico: sirve como referencia controlada para comparar objetivos de entrenamiento y muestreadores de difusion sobre una distribucion con colas pesadas, donde los modelos habituales de difusion gaussianos fallan. El parametro alpha = 1,8 indica el indice de estabilidad de la mezcla, situado por debajo de 2 (el caso gaussiano) y por tanto con colas mas pesadas que una normal.

La red es un MLP pequeno (240 de ancho, 4 capas, 669.844 parametros entrenables) que opera sobre vectores de dimension 100, con condicionamiento temporal de 128 dimensiones. El repositorio ocupa 0,0 GB, no tiene descargas ni likes, y la model card no documenta benchmarks de calidad muestral mas alla de las perdidas de validacion y test de cada objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP condicionado por tiempo (width 240, depth 4, time_dim 128, use_norm, dropout 0.0, dim 100) |
| Parametros totales | 669.844 (identico en las tres variantes entrenadas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion sobre vectores de dimension 100, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, y `normalization.safetensors` cuando aplica) |

## Arquitectura y entrenamiento

Cada variante es un MLP de 4 capas con anchura 240 y embedding temporal de 128 dimensiones que predice un objetivo distinto segun el paradigma de difusion: DDPM-V predice velocidad con 128 pasos y sigma_max 2,0; DLPM-Eps predice ruido con 128 pasos y alpha 1,8 usando muestreador nativo; t-EDM predice dato denoised con 64 pasos, nu 2,2, sigma_min 0,005, sigma_max 5,0 y sigma_data 1,0, con solver EDM stochastic Heun. DDIM-V comparte pesos con DDPM-V y solo cambia el muestreador reverso a DDIM determinista (eta=0), sin entrenamiento propio.

El entrenamiento usa AdamW con learning rate 0,0005, weight decay 1e-6, grad clip 10,0, scheduler coseno con 400 pasos de warmup y eta_min ratio 0,05, batch de 1024, hasta 640 epocas con paciencia de early stopping de 100. El dataset es sintetico, generado con `gendynamics.datasets.fetch_synthetic_data('elliptical_alpha_stable_mixture')`, con rotaciones de componentes sembradas, escalas de eje log-espaciadas y traza de scatter fija; los splits son 25.000/1.000/10.000 muestras de forma `[100]` sin normalizacion. Las perdidas registradas son: DDPM-V val 5,298 / test 2,537 (634 epocas de 640); DLPM-Eps val 0,791 / test 0,8672 (296 de 396); t-EDM val 1,215 / test 2,559 (42 de 142). El autor advierte que las perdidas usan objetivos distintos y no son comparables como medida de calidad muestral.

## Capacidades

- Generacion incondicional de muestras de 100 dimensiones a partir de la distribucion sintetica eliptica alpha-estable entrenada.
- Cuatro modos de muestreo: DDPM estocastico (128 pasos), DLPM nativo (128 pasos), EDM stochastic Heun (64 pasos) y DDIM determinista (eta=0, reutilizando pesos de DDPM-V).
- Comparacion controlada de objetivos de prediccion (velocidad, ruido, dato denoised) sobre una misma distribucion y arquitectura.
- Estudio de colas pesadas: alpha = 1,8 permite analizar el comportamiento de los muestreadores fuera del regimen gaussiano.
- Carga programatica via `toolkit.huggingface.load_huggingface_model` con la libreria `gendynamics`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Investigacion en modelos de difusion con colas pesadas: usar las cuatro variantes para comparar como se comporta cada objetivo y muestreador cuando la distribucion objetivo tiene colas mas pesadas que una gaussiana (alpha = 1,8).
- Validacion de nuevos muestreadores: DDIM-V permite probar samplers deterministas sobre pesos ya entrenados sin reentrenar, sirviendo de banco de pruebas barato (669.844 parametros).
- Reproducibilidad de experimentos: el repositorio incluye `dataset.json`, `provenance.json` y `export_check.json` con semillas, versiones de software y comprobaciones de recarga, lo que facilita replicar resultados.
- Docencia y formacion: la red MLP pequena y el dataset sintetico de 100 dimensiones permiten ejecutar entrenamiento e inferencia en CPU o en una GPU consumer, ideal para explicar DDPM, EDM y DLPM en un curso.
- Pruebas de infraestructura de despliegue: al ser un modelo de ~0,67 M de parametros, sirve para validar pipelines de carga, exportacion a safetensors y verificacion de checksums antes de escalar a modelos mayores.
- Estudio de calibracion de perdidas: comparar val loss y test loss entre objetivos (DDPM-V, DLPM-Eps, t-EDM) para analizar la relacion entre perdida de entrenamiento y calidad muestral en distribuciones no gaussianas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta perdidas de validacion y test por objetivo, que el propio autor indica que no son comparables entre si como medida de calidad muestral:

| Variante | Objetivo | Pasos de muestreo | Epocas ejecutadas / mejor | Val loss | Test loss |
|---|---|---:|---:|---:|---:|
| DDPM-V | velocidad | 128 | 640 / 634 | 5,298 | 2,537 |
| DLPM-Eps | ruido | 128 | 396 / 296 | 0,791 | 0,8672 |
| t-EDM | dato denoised | 64 | 142 / 42 | 1,215 | 2,559 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 669.844 parametros y opera sobre vectores de 100 dimensiones.
- GPU recomendadas: cualquier GPU con CUDA, incluidas GTX 1060 o superiores; el entrenamiento se realizo en `cuda` con batch de 1024 y `data_device` en CPU.
- Cabe en cualquier GPU consumer y tambien en CPU: la model card muestra un ejemplo de carga con `device="cpu"`.
- Opciones de despliegue: la libreria `gendynamics` (instalable via `pip install git+https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models.git`) y la funcion `load_huggingface_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (referencias sinteticas de difusion sobre mezclas alpha-estables en 100 dimensiones). Las busquedas web devolvieron unicamente definiciones genericas del termino "diffusion" sin relacion con el modelo.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un generador de imagenes: solo muestrea la distribucion sintetica concreta para la que fue entrenado; no sirve para texto, codigo, vision ni tareas generales.
- El dataset es sintetico y no se redistribuye; los terminos de la fuente original quedan con su proveedor.
- Las perdidas de validacion y test no son comparables entre variantes porque cada una usa su propio objetivo; no deben interpretarse como ranking de calidad.
- El autor advierte que las previsualizaciones de muestras no establecen precision en las colas; la evaluacion en la region de colas pesadas queda abierta.
- El numero de filas held-out usado en cada test loss esta en `metrics.json` y no se detalla en la model card.
- Riesgo de alucinacion y sesgos: no aplica en el sentido habitual de modelos generativos de texto; el riesgo relevante es que las muestras no reproduzcan fielmente la distribucion objetivo en las colas.
- Licencia MIT: permite uso comercial y modificacion, pero se pide citar la revision del repositorio al usar los pesos.
- Repositorio sin descargas ni likes y con actualizacion unica (creado y actualizado el 2026-11-25): no hay evidencia de mantenimiento ni de validacion externa por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Diffusion-Research-Lab/elliptical-alpha-stable-mixture-1p8-100d-diffusion
- Repositorio de codigo de preparacion: https://github.com/Diffusion-Research-Lab/gendynamics
- Repositorio de entrenamiento: https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models
- Paper, blog o demo: no disponible en la informacion proporcionada.
