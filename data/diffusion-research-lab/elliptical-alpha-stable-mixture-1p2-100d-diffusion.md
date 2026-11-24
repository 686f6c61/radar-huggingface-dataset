# Diffusion-Research-Lab/elliptical-alpha-stable-mixture-1p2-100d-diffusion

## Resumen

El repositorio `Diffusion-Research-Lab/elliptical-alpha-stable-mixture-1p2-100d-diffusion` contiene una coleccion de modelos de difusion de referencia entrenados de forma incondicional con la libreria `gendynamics`. No es un modelo de lenguaje ni un generador multimodal: es un banco de modelos generativos de proposito muy acotado que aprenden a muestrear distribuciones sinteticas de vectores de 100 dimensiones, en concreto una mezcla de componentes elipticas simetricas alpha-estables de rango completo. El autor es el colectivo Diffusion-Research-Lab y la licencia es MIT.

El interes del artefacto es metodologico. Bajo una misma arquitectura MLP (669.844 parametros entrenables) se comparan tres formulaciones de difusion con objetivos de prediccion distintos: DDPM sobre velocidad (DDPM-V), DLPM sobre ruido (DLPM-Eps) y t-EDM sobre dato desruidizado (t-EDM). Esto permite estudiar como se comporta cada parametrizacion frente a colas pesadas, un regimen donde los objetivos de difusion clasicos tienden a fallar. El repositorio incluye ademas una variante DDIM-V que reutiliza los pesos de DDPM-V con muestreo determinista.

La relevancia es acotada pero clara para investigacion en generacion de colas pesadas: los modelos son pequenos, reproducibles y con trazabilidad completa (config, dataset, metricas, provenance y export_check). No sirve para generacion de texto, codigo ni vision; solo para experimentar con dinamicas de difusion sobre datos sinteticos alpha-estables. El tamano del repo es practicamente 0.0 GB, coherente con menos de un millon de parametros por modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de difusion (width 240, depth 4, time_dim 128, use_norm true, dim 100) |
| Parametros totales | 669.844 por modelo entrenable (DDPM-V, DLPM-Eps, t-EDM) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 100 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La red es un MLP condicionado por tiempo con ancho 240, profundidad 4, embedding temporal de 128 dimensiones, normalizacion activada y dropout 0.0, que opera sobre vectores de entrada de 100 dimensiones. Sobre esta misma red se entrenan tres objetivos de difusion independientes: DDPM-V predice la velocidad con 128 pasos de muestreo, sigma_max 2.0 y sampler DDPM; DLPM-Eps predice el ruido con 128 pasos, alpha 1.8 y sampler nativo; t-EDM predice el dato desruidizado con 64 pasos, nu 2.2, sigma_min 0.005, sigma_max 5.0, sigma_data 1.0 y solver EDM stochastic Heun. La variante DDIM-V comparte pesos con DDPM-V y solo cambia el sampler reverso a DDIM determinista con eta=0.

El entrenamiento usa AdamW con weight decay 1e-06, grad clip 10.0, scheduler coseno con warmup de 400 pasos y eta_min ratio 0.05. Los tres modelos se entrenaron con batch 1024, hasta 640 epocas y paciencia de early stopping de 100. DDPM-V agoto las 640 epocas (val 2227, test 402.1); DLPM-Eps paro en la epoca 211 de 311 ejecutadas (val 1.003, test 1.007); t-EDM paro en la 29 de 129 ejecutadas (val 16.67, test 231.7). Las perdidas usan objetivos distintos y no son comparables como medida de calidad de muestra. El dataset es sintetico, generado con `gendynamics.datasets.fetch_synthetic_data('elliptical_alpha_stable_mixture')`, con 25.000/1.000/10.000 muestras de train/val/test de forma [100], sin normalizacion, con rotaciones sembradas y escalas log-espaciadas de traza fija.

## Capacidades

- Generacion incondicional de vectores de 100 dimensiones procedentes de una mezcla de componentes elipticas simetricas alpha-estables de rango completo.
- Modelado de colas pesadas mediante tres formulaciones de difusion comparables (velocidad, ruido y dato desruidizado).
- Muestreo estocastico (DDPM, DLPM nativo, EDM stochastic Heun) y determinista (DDIM con eta=0 sobre pesos de DDPM-V).
- Carga programatica via `toolkit.huggingface.load_huggingface_model` indicando el subdirectorio del modelo (`ddpm_v`, `dlpm_eps`, `tedm_origin`, `ddim_v`).
- Soporte de normalizacion opcional: el loader devuelve `normalization` y `data_scale`; en este dataset la normalizacion es None.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni soporte multilingue.

## Casos de uso

- Investigacion en difusion sobre colas pesadas: usar DDPM-V, DLPM-Eps y t-EDM como linea base controlada para medir como cada objetivo captura las colas de una mezcla alpha-estable, manteniendo fija la arquitectura y el dataset.
- Validacion de nuevos samplers: sustituir el sampler de un directorio por uno propio y comparar contra las perdidas y muestras de referencia publicadas en `metrics.json`.
- Reproduccion de experimentos: el repo incluye `provenance.json`, `dataset.json` y `export_check.json`, lo que permite reconstruir exactamente la version de software y el snapshot de datos usados.
- Docencia y formacion: el tamano de 669.844 parametros y la entrada de 100 dimensiones permiten entrenar y muestrear en CPU o en una GPU consumer en minutos, lo que lo hace util para explicar difusion sin infraestructura pesada.
- Estudio de estimacion de densidad en dimension moderada: comparar la calidad de muestra de DDIM determinista frente a DDPM estocastico sobre los mismos pesos para analizar el compromiso entre fidelidad y diversidad.
- Pruebas de integracion de la libreria `gendynamics`: usar el repo como caso de prueba end-to-end para el pipeline de carga, muestreo y desnormalizacion.
- Benchmark de estabilidad numerica: el contraste entre perdidas (DDPM-V test 402.1 frente a DLPM-Eps test 1.007) sirve para estudiar inestabilidades de objetivos de velocidad en regimenes de cola pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta perdidas de validacion y test bajo el objetivo propio de cada modelo, que no son comparables entre si como medida de calidad de muestra.

| Directorio | Modelo | Objetivo | Pasos de muestreo | Epocas ejecutadas / mejor | Val loss | Test loss |
|---|---|---|---:|---:|---:|---:|
| ddpm-v | DDPM-V | velocidad | 128 | 640 / 640 | 2227 | 402.1 |
| dlpm-eps | DLPM-Eps | ruido | 128 | 311 / 211 | 1.003 | 1.007 |
| tedm-origin | t-EDM | dato desruidizado | 64 | 129 / 29 | 16.67 | 231.7 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB por modelo; con 669.844 parametros en precision completa el peso ronda los 2,7 MB, y el estado de muestreo es despreciable.
- GPU recomendadas: cualquier GPU con CUDA es suficiente; el autor entreno en `cuda` con `data_device` en CPU y batch 1024, lo que sugiere que una GPU de gama media basta.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU; el propio model card demuestra carga con `device="cpu"`.
- Opciones de despliegue: la libreria oficial `gendynamics` (instalable via `pip install git+https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models.git`) y el loader `toolkit.huggingface.load_huggingface_model`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explicita; por el tamano del modelo y los 64-128 pasos de muestreo, se espera del orden de milisegundos por lote pequeno en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (difusion incondicional sobre mezclas alpha-estables de 100 dimensiones). Como referencia interna, los tres modelos del propio repo comparten arquitectura y numero de parametros, diferenciandose solo en el objetivo de prediccion y el sampler.

| Modelo | Parametros | Contexto/entrada | Objetivo | Licencia |
|---|---:|---|---|---|
| DDPM-V | 669.844 | vector [100] | velocidad | MIT |
| DLPM-Eps | 669.844 | vector [100] | ruido | MIT |
| t-EDM | 669.844 | vector [100] | dato desruidizado | MIT |
| DDIM-V | 669.844 (compartidos) | vector [100] | velocidad (sampler DDIM) | MIT |

## Limitaciones y advertencias

- Modelo de proposito muy especifico: solo genera vectores de 100 dimensiones de una distribucion sintetica concreta; no es util para texto, codigo, vision ni tareas generales.
- Las perdidas reportadas usan objetivos distintos y no son comparables como indicador de calidad de muestra; el propio autor lo advierte.
- Las previsualizaciones de muestras no establecen precision en las colas, que es precisamente el regimen de interes; la evaluacion de colas queda pendiente.
- El dataset es sintetico y no se redistribuye; los terminos de la fuente original siguen aplicando al proveedor.
- No hay datos publicados de sesgos, alucinacion o comportamiento multilingue porque el modelo no opera sobre lenguaje.
- Licencia MIT permite uso comercial, pero el autor pide citar la revision del repositorio al reutilizar los pesos.
- Dependencia de la libreria `gendynamics` y de un repositorio Git concreto para la carga; no hay formato GGUF ni integracion con runtimes estandar de inferencia.
- El modelo DDPM-V muestra una perdida de test (402.1) muy superior a la de validacion (2227 frente a 402.1 en escalas distintas), lo que sugiere inestabilidad en el objetivo de velocidad; conviene tratarlo con cautela en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Diffusion-Research-Lab/elliptical-alpha-stable-mixture-1p2-100d-diffusion
- Repositorio de la libreria: https://github.com/Diffusion-Research-Lab/gendynamics
- Repositorio de entrenamiento: https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models
- No se han encontrado papers, blogs, demos ni otros enlaces relevantes en la busqueda web proporcionada.
