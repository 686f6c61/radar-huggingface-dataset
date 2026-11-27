# LamTNguyen/dinit-jit-screening

## Resumen

`LamTNguyen/dinit-jit-screening` es una coleccion de checkpoints de cribado (screening) publicados por LamTNguyen para un estudio sobre la inicializacion de transformadores de difusion JiT en espacio de pixeles a partir de codificadores de vision preentrenados. No es un modelo generativo listo para produccion, sino un conjunto de artefactos de investigacion: seis configuraciones entrenadas durante 2.000 pasos de optimizacion (una de ellas, `J03_mjit_mae_w1000`, aproximadamente 3.300) sobre ImageNet-1K a 256x256, con el objetivo JiT (prediccion de x, perdida v, muestreo logit-normal de t en (-0.8, 0.8) y label drop de 0.1).

El interes tecnico esta en la pregunta que aborda: si inicializar un difusion transformer de pixeles con pesos de codificadores como DINOv3-B/16 o MAE-B/16 aporta ventaja frente a la inicializacion aleatoria en las primeras fases del entrenamiento. Cada carpeta contiene `config.json`, registros de entrenamiento y validacion, y checkpoints en fp32 con estados EMA. Las arquitecturas concretas se definen en un fichero `jit_dino.py` del estudio que no se publica en el repositorio.

El repositorio ocupa 44,4 GB y no incluye pipeline, idiomas ni pesos en formatos de inferencia habituales (safetensors, GGUF). La licencia es "other", con restricciones adicionales derivadas de ImageNet-1K, DINOv3 y MAE. Es material relevante para investigadores que estudien inicializacion de difusion transformers, no para despliegue de generacion de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer en espacio de pixeles (JiT); variantes compatibles DINO (DINOv3-B/16 + delta-adaLN) y MAE (ViT-B/16 + delta-adaLN) |
| Parametros totales | no disponible (arquitecturas tipo ViT-B/16; el recuento exacto no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoints en fp32; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (generacion de imagenes condicionada por clase) |
| Licencia | other (sujeta a terminos de ImageNet-1K, DINOv3 License y CC BY-NC 4.0 para MAE) |
| Formato de pesos | `.pt` (PyTorch, fp32, dict con `model`, `ema1`, `ema2`, `steps`, `arch`, `run_id`) |

## Arquitectura y entrenamiento

El estudio compara seis configuraciones sobre ImageNet-1K a 256x256 con el objetivo JiT: `J00_jit` (arquitectura JiT-B/16 oficial con inicializacion aleatoria), `J01_djit_random` (JiT compatible con DINO, disposicion DINOv3-B/16 mas delta-adaLN con inicializacion a cero, pesos aleatorios), `J02_djit_dinov3` (misma arquitectura con inicializacion completa desde DINOv3-B/16, preservando la funcion en el paso 0), `J04_djit_dino4` (patch embedding y primeros cuatro bloques de DINOv3, resto aleatorio), `J03_mjit_mae_w1000` (ViT-B/16 compatible con MAE mas delta-adaLN, inicializado desde el codificador MAE-B/16) y `J03r_mjit_random` (control aleatorio de la anterior).

El protocolo de entrenamiento es comun: batch 256, optimizador Adam con betas (0.9, 0.95), weight decay 0, learning rate 5e-5 tras 1.000 pasos de warmup, precision bf16, semilla 0 y una unica RTX 5090. Las ejecuciones tienen 2.000 pasos de optimizacion (salvo `J03_mjit_mae_w1000`, con unos 3.300). Se guardan checkpoints en los pasos 500, 1.000 y 2.000, con dos medias moviles exponenciales (EMA 0.9999 y EMA 0.9996). No hay intervalos de confianza ni multiples semillas, por lo que los resultados son instantaneas de entrenamiento temprano.

La innovacion metodologica es la inicializacion "function-preserving" de un difusion transformer desde un codificador de vision: la variante `J02_djit_dinov3` arranca con la misma funcion que DINOv3-B/16 en el paso 0 gracias al diseno delta-adaLN con inicializacion a cero. El muestreo empleado para evaluar es el sampler Heun-50 de JiT sin guidance.

## Capacidades

- Generacion de imagenes condicionada por clase en ImageNet-1K a 256x256, exclusivamente como instantanea de entrenamiento temprano.
- Prediccion de x con perdida v en el objetivo de difusion JiT.
- Evaluacion de estrategias de inicializacion (aleatoria, DINOv3 completa, DINOv3 parcial, MAE) sobre la misma arquitectura base.
- Compatibilidad de carga con `torch.load(path, map_location="cpu", weights_only=True)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de difusion de imagenes, no un modelo de lenguaje.
- No incluye modo thinking, vision, audio ni ninguna capacidad conversacional.

## Casos de uso

- Estudio de inicializacion de difusion transformers: comparar las curvas de perdida v de `J01_djit_random`, `J02_djit_dinov3` y `J04_djit_dino4` en `val_log.csv` para medir si los pesos de DINOv3 aceleran la convergencia temprana frente a la inicializacion aleatoria.
- Reproduccion de experimentos de investigacion: cargar los checkpoints de 500, 1.000 y 2.000 pasos con `torch.load` y reanudar el analisis con el estado del optimizador incluido en `latest.pt`.
- Analisis de la influencia del warmup: comparar `J03_mjit_mae_w1000` (warmup de 1.000 pasos, unos 3.300 pasos totales) con su control `J03r_mjit_random` para aislar el efecto de la inicializacion MAE.
- Evaluacion de estabilidad de EMA: los checkpoints incluyen `ema1` (0.9999) y `ema2` (0.9996); los datos de FID muestran que las EMA pueden degradar el rendimiento a 2.000 pasos (por ejemplo, `J01_djit_random` pasa de FID ADM 316,6 con pesos raw a 388,6 con ema2), lo que permite estudiar la dinamica de las medias moviles en entrenamientos cortos.
- Referencia para disenar ablaciones: el par `J00_jit` frente a `J01_djit_random` permite comparar la arquitectura JiT oficial con la variante compatible DINO bajo el mismo protocolo.
- Docencia y formacion: usar los registros `train_log.csv` y `val_log.csv` como ejemplo de evaluacion de perdida v sobre 1.000 imagenes de validacion en 10 valores fijos de t.

## Benchmarks y rendimiento

Los datos de FID se calcularon con 2.000 muestras, sampler JiT Heun-50 sin guidance, evaluador ADM (`evaluator.py` de guided-diffusion) contra `VIRTUAL_imagenet256_labeled.npz`, y FID de torch-fidelity contra `jit_in256_stats.npz`. Etiquetas i % 1000, semilla de ruido 3.000.000 + i. El autor advierte que con 2.000 muestras las cifras son muy ruidosas.

| Ejecucion | Paso | Pesos | FID ADM-2K | FID torch-fidelity | IS | Precision | Recall |
|---|---:|---|---:|---:|---:|---:|---:|
| J00_jit | 500 | raw | 317,8 | 319,2 | 1,4 | 0,073 | 0,0 |
| J00_jit | 1000 | raw | 268,6 | 270,2 | 2,0 | 0,0765 | 0,0 |
| J00_jit | 2000 | ema2 | 313,9 | 314,3 | 1,0 | 1,0 | 0,0 |
| J00_jit | 2000 | raw | 259,7 | 261,0 | 2,7 | 0,0505 | 0,0002 |
| J01_djit_random | 500 | raw | 333,4 | 334,4 | 1,4 | 0,0005 | 0,0 |
| J01_djit_random | 1000 | raw | 253,1 | 254,5 | 1,3 | 0,1625 | 0,0 |
| J01_djit_random | 2000 | ema2 | 388,6 | 389,6 | 1,2 | 0,0 | 0,0 |
| J01_djit_random | 2000 | raw | 316,6 | 318,2 | 1,6 | 0,0145 | 0,0 |
| J02_djit_dinov3 | 500 | raw | 261,2 | 262,7 | 1,9 | 0,0205 | 0,0 |
| J02_djit_dinov3 | 1000 | raw | 246,6 | 248,1 | 2,9 | 0,047 | 0,0003 |
| J02_djit_dinov3 | 2000 | ema2 | 317,0 | 317,6 | 1,2 | 0,958 | 0,0 |
| J02_djit_dinov3 | 2000 | raw | 226,1 | 227,7 | 3,4 | 0,049 | 0,0003 |
| J03r_mjit_random | 500 | raw | 365,8 | 367,1 | 1,5 | 0,0145 | 0,0 |
| J03r_mjit_random | 1000 | raw | 319,4 | 320,9 | 2,1 | 0,0025 | 0,0 |
| J03r_mjit_random | 2000 | ema2 | 374,3 | 374,8 | 1,0 | 0,6655 | 0,0 |
| J03r_mjit_random | 2000 | raw | 235,9 | 237,2 | 2,0 | 0,0465 | 0,0 |
| J04_djit_dino4 | 500 | raw | 280,9 | 282,2 | 1,4 | 0,0015 | 0,0 |
| J04_djit_dino4 | 1000 | raw | 275,5 | 276,8 | 1,7 | 0,1315 | 0,0 |
| J04_djit_dino4 | 2000 | ema2 | 368,3 | 368,5 | 1,3 | 0,0005 | 0,0 |
| J04_djit_dino4 | 2000 | raw | 274,4 | 275,8 | 2,0 | 0,0845 | 0,0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- Entrenamiento: una unica RTX 5090 por ejecucion, segun el protocolo del autor; batch 256 a 256x256 en bf16.
- VRAM de inferencia: no disponible de forma explicita; al tratarse de arquitecturas tipo ViT-B/16 (del orden de 86 millones de parametros) los checkpoints en fp32 son manejables en GPUs de consumo, pero el repositorio no publica mediciones.
- GPUs recomendadas: RTX 5090 (usada en el estudio); para evaluacion cabe esperar que cualquier GPU con suficiente memoria para un ViT-B/16 en fp32 sea suficiente, aunque no se aportan cifras.
- Despliegue: no se ofrecen integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion de imagenes). La carga se realiza con `torch.load(path, map_location="cpu", weights_only=True)` y requiere las definiciones de arquitectura de `jit_dino.py`, que no se publica en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FID ImageNet-1K 256 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LamTNguyen/dinit-jit-screening (J02, paso 2000) | no disponible (ViT-B/16) | no aplica | 226,1 (ADM-2K, ruidoso) | other (ImageNet + DINOv3) | Hugging Face, solo checkpoints `.pt` |
| JiT-B/16 oficial (`J00_jit`, paso 2000) | no disponible | no aplica | 259,7 (ADM-2K) | segun repositorio LTH14/JiT | github.com/LTH14/JiT |
| DINOv3-B/16 (`facebook/dinov3-vitb16-pretrain-lvd1689m`) | no disponible | no aplica | no aplica (codificador, no generativo) | DINOv3 License | Hugging Face |
| MAE-B/16 | no disponible | no aplica | no aplica (codificador, no generativo) | CC BY-NC 4.0 | disponible como codificador preentrenado |

La comparacion directa con modelos generativos completos no es posible con los datos publicados: las cifras de FID corresponden a 2.000 pasos de entrenamiento y 2.000 muestras, muy lejos de la convergencia.

## Limitaciones y advertencias

- Los checkpoints son instantaneas de entrenamiento temprano (2.000 pasos, salvo `J03_mjit_mae_w1000` con unos 3.300); no generan imagenes de calidad utilizable (FID ADM en torno a 226-389).
- Una sola semilla y sin intervalos de confianza: no permiten conclusiones estadisticas robustas.
- Las cifras de FID se calculan con solo 2.000 muestras y el propio autor las califica de muy ruidosas.
- Las EMA empeoran el FID en varios casos a 2.000 pasos, lo que desaconseja su uso como pesos finales en esta fase.
- Las arquitecturas no se publican en el repositorio (`jit_dino.py` no incluido), lo que dificulta la carga directa de los checkpoints.
- Licencia "other" con restricciones encadenadas: ImageNet-1K (acceso no comercial para investigacion), DINOv3 License para `J02` y `J04`, y CC BY-NC 4.0 para `J03_mjit_mae_w1000`. El uso comercial no esta permitido en la practica.
- No hay soporte multilingue, de texto ni de agentes; cualquier uso fuera de investigacion sobre difusion de imagenes no es aplicable.
- Riesgo de sobreinterpretar las diferencias entre configuraciones dado el ruido de las metricas y la ausencia de repeticiones.

## Enlaces

- Hugging Face: https://huggingface.co/LamTNguyen/dinit-jit-screening
- Repositorio de la arquitectura JiT: https://github.com/LTH14/JiT
- Codificador DINOv3-B/16: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Evaluador ADM (guided-diffusion): https://github.com/openai/guided-diffusion
- torch-fidelity: https://github.com/toshas/torch-fidelity
