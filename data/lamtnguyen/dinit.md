# LamTNguyen/dinit

## Resumen

`LamTNguyen/dinit` no es un modelo generativo listo para producción, sino una colección de checkpoints de cribado (screening) procedentes de un estudio sobre la inicialización de transformadores de difusión JiT en espacio de píxeles a partir de codificadores visuales preentrenados. Los seis directorios incluidos corresponden a variantes de arquitectura JiT-B/16 y ViT-B/16 con distintos esquemas de inicialización (aleatoria, DINOv3 completa, DINOv3 parcial con 4 bloques y MAE), entrenadas de forma condicional por clase sobre ImageNet-1K a 256x256 durante tan solo 2.000 pasos de optimizador (aproximadamente 3.300 en la variante MAE). El objetivo del autor es comparar empíricamente si partir de pesos de un codificador visual consolidado acelera la convergencia temprana de un difusor de píxeles frente a una inicialización aleatoria.

El modelo se enmarca en la familia JiT (Just-in-Time diffusion), que opera directamente sobre píxeles sin un autoencoder latente intermedio, con objetivo de predicción de `x` y pérdida sobre `v`. La relevancia actual es metodológica: aporta evidencia preliminar, con una única semilla y sin intervalos de confianza, de que la inicialización desde DINOv3-B/16 reduce la FID en las primeras fases del entrenamiento (226,1 frente a 259,7 de la JiT oficial con inicialización aleatoria a 2.000 pasos). No obstante, los propios autores advierten que estos checkpoints son instantáneas de entrenamiento temprano y no modelos utilizables.

El repositorio ocupa 44,4 GB e incluye configuración, registros de entrenamiento y validación, y checkpoints en fp32 con estados EMA, además del estado del optimizador en `latest.pt`. No se proporcionan pesos en formatos de inferencia habituales (safetensors, GGUF) ni código de arquitectura, lo que limita su uso directo a quien reproduzca el código del estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión en espacio de píxeles (JiT-B/16 y ViT-B/16 con delta-adaLN), parche 16x16 |
| Parametros totales | No disponible (la clase B/16 sugiere ~86 M, pero no se confirma en la información) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen, resolución 256x256) |
| Tipos de cuantizacion | No disponible (checkpoints en fp32; entrenamiento en bf16) |
| Idiomas soportados | No disponible (modelo de visión, sin capacidades de texto) |
| Licencia | `other` (sujeta a términos de ImageNet-1K, DINOv3 License y CC BY-NC 4.0 según la variante) |
| Formato de pesos | `.pt` (PyTorch, fp32, dict con `model`, `ema1`, `ema2`, `steps`, `arch`, `run_id`) |

## Arquitectura y entrenamiento

Las seis variantes comparten un esqueleto de transformer de difusión con parches de 16x16 y condicionamiento por clase mediante delta-adaLN. La variante `J00_jit` reproduce la arquitectura JiT-B/16 oficial con inicialización aleatoria. Las variantes `J01`, `J02` y `J04` adoptan el diseño "DINO-compatible" (disposición DINOv3-B/16 más delta-adaLN con inicialización a cero), diferenciándose en el grado de transferencia de pesos: `J01` parte de cero, `J02` carga la totalidad de DINOv3-B/16 de forma que la función se preserva en el paso 0, y `J04` transfiere solo el patch embedding y los cuatro primeros bloques. Las variantes `J03` y `J03r` usan un ViT-B/16 compatible con MAE más delta-adaLN, con inicialización desde el codificador MAE-B/16 y aleatoria respectivamente.

El entrenamiento es condicional por clase sobre ImageNet-1K a 256x256, con objetivo JiT (predicción de `x`, pérdida sobre `v`, muestreo logit-normal de `t` en (-0,8, 0,8) y label dropout de 0,1). Se emplea batch de 256, optimizador Adam con betas (0,9, 0,95), weight decay 0, learning rate 5e-5 tras 1.000 pasos de warmup, precisión bf16 y semilla 0, todo sobre una única RTX 5090. La duración es de 2.000 pasos de optimizador (unos 3.300 en `J03_mjit_mae_w1000`), lo que constituye la limitación fundamental del estudio: son instantáneas de fase temprana, con una sola semilla y sin intervalos de confianza. No se documenta el número total de tokens de entrenamiento ni el uso de RLHF o DPO, ya que no aplica a un modelo de difusión de este tipo.

## Capacidades

- Generación de imágenes condicional por clase sobre ImageNet-1K a resolución 256x256, con muestreo Heun-50 sin guiado.
- Difusión en espacio de píxeles puro, sin autoencoder latente, lo que simplifica el pipeline pero encarece el cómputo por paso.
- Predicción de `x` con pérdida sobre `v` (objetivo JiT), adecuada para entrenamiento en precisión bf16.
- Compatibilidad funcional con los pesos de DINOv3-B/16 en el paso 0 para la variante `J02`, lo que permite estudiar la transferencia desde un codificador visual.
- Exportación de estados EMA (0,9999 y 0,9996) junto al modelo bruto para análisis de estabilidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de visión sin interfaz de texto.
- No dispone de modo "thinking", visión de entrada, audio ni otras capacidades multimodales más allá de la generación de imágenes.

## Casos de uso

- Estudio de inicialización de difusores de píxeles: comparar la curva de pérdida `v` y la FID temprana entre las seis variantes para determinar si los pesos de DINOv3 o MAE aceleran la convergencia frente a la inicialización aleatoria.
- Reproducción de experimentos de transferencia desde codificadores visuales: cargar `J02_djit_dinov3` y verificar que la función se preserva en el paso 0 antes de continuar el entrenamiento con el código del estudio (`jit_dino.py`).
- Análisis de estabilidad de EMA: comparar `raw`, `ema1` (0,9999) y `ema2` (0,9996) en los checkpoints de 500, 1.000 y 2.000 pasos para estudiar el colapso de precisión observado en algunas variantes (por ejemplo, precisión 1,0 con recall 0,0 en `J00_jit` a 2.000 pasos con `ema2`).
- Docencia e investigación en difusión en espacio de píxeles: usar los registros `train_log.csv` y `val_log.csv` como material didáctico sobre objetivos JiT, muestreo logit-normal de `t` y label dropout.
- Punto de partida para entrenamientos prolongados: reanudar desde `latest.pt` (que incluye el estado del optimizador) para extender las 2.000 pasos y evaluar si la ventaja inicial de DINOv3 se mantiene a convergencia.
- Auditoría de protocolos de evaluación: reproducir las métricas FID con el evaluador ADM (`guided-diffusion/evaluator.py`) y con torch-fidelity sobre `jit_in256_stats.npz` para contrastar metodologías con 2.000 muestras.

## Benchmarks y rendimiento

Los resultados publicados corresponden a FID con 2.000 muestras, muestreador JiT Heun-50 sin guiado, etiquetas `i % 1000` y semilla de ruido 3.000.000 + `i`. El propio autor advierte que con 2.000 muestras las cifras son muy ruidosas.

| Run | Paso | Pesos | ADM FID-2K | torch-fidelity FID | IS | Precision | Recall |
|---|---:|---|---:|---:|---:|---:|---:|
| J00_jit | 2000 | raw | 259,7 | 261,0 | 2,7 | 0,0505 | 0,0002 |
| J01_djit_random | 2000 | raw | 316,6 | 318,2 | 1,6 | 0,0145 | 0,0 |
| J02_djit_dinov3 | 2000 | raw | 226,1 | 227,7 | 3,4 | 0,049 | 0,0003 |
| J03r_mjit_random | 2000 | raw | 235,9 | 237,2 | 2,0 | 0,0465 | 0,0 |
| J04_djit_dino4 | 2000 | raw | 274,4 | 275,8 | 2,0 | 0,0845 | 0,0 |

A 1.000 pasos, `J02_djit_dinov3` registra 246,6 (ADM) y `J00_jit` 268,6, mientras que `J01_djit_random` alcanza 253,1. Los estados EMA a 2.000 pasos empeoran de forma notable en varias variantes (`J01` con `ema2`: 388,6; `J04` con `ema2`: 368,3), lo que sugiere que el EMA aún no es fiable en horizontes tan cortos. No se han publicado resultados de MMLU, HumanEval ni GSM8K por tratarse de un modelo de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los checkpoints son fp32 y el entrenamiento se realizó en bf16 sobre una única RTX 5090 con batch 256 a 256x256, lo que da una referencia del orden de magnitud.
- GPU recomendadas: RTX 5090 (usada en el estudio); cualquier GPU con suficiente VRAM para un ViT-B/16 a 256x256 en bf16 debería bastar para inferencia.
- Cabe en GPU de consumo: sí, según la referencia del entrenamiento en una RTX 5090; no se especifica el mínimo exacto.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la carga es mediante `torch.load(path, map_location="cpu", weights_only=True)` y requiere el código de arquitectura del estudio (`jit_dino.py`), no publicado en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LamTNguyen/dinit (JiT-B/16) | No disponible (~86 M por clase B/16) | 256x256 | Difusión en píxeles, condicional por clase | `other` (ImageNet, DINOv3, CC BY-NC 4.0) | Pesos `.pt` en HF, sin código de arquitectura |
| JiT oficial (LTH14/JiT) | No disponible | 256x256 | Difusión en píxeles | Según repositorio original | Código y pesos en GitHub |
| DINOv3-B/16 (`facebook/dinov3-vitb16-pretrain-lvd1689m`) | No disponible | No aplica (codificador) | Autosupervisado, codificador visual | DINOv3 License | Pesos en HF |
| MAE-B/16 | No disponible | No aplica (codificador) | Autoencoder enmascarado | CC BY-NC 4.0 | Pesos disponibles |

La comparación directa con difusores latentes tipo Stable Diffusion o DiT no es posible con los datos aportados, ya que no se incluyen métricas a convergencia ni recuentos de parámetros verificados.

## Limitaciones y advertencias

- Los checkpoints son instantáneas de 2.000 pasos (3.300 en `J03`), no modelos entrenados; la FID en el rango 226-389 refleja un estado muy temprano y no es representativa de un modelo final.
- Estudio con una única semilla y sin intervalos de confianza; las diferencias entre variantes pueden no ser estadísticamente significativas.
- Las métricas FID se calculan con solo 2.000 muestras, lo que el propio autor califica de muy ruidoso.
- El código de arquitectura (`jit_dino.py`) no está publicado en el repositorio, por lo que los pesos no son cargables sin reproducir el código del estudio.
- Restricciones de licencia: el entrenamiento sobre ImageNet-1K limita el uso a investigación no comercial; `J02` y `J04` están sujetos a la DINOv3 License; `J03` deriva de MAE-B/16 bajo CC BY-NC 4.0; `J00` usa la arquitectura JiT del repositorio LTH14/JiT.
- No hay información sobre sesgos, alucinación o comportamiento multilingüe porque el modelo no genera texto ni opera con lenguaje natural.
- El colapso de precisión y recall en varios estados EMA (por ejemplo, precisión 1,0 y recall 0,0) indica inestabilidad del promedio exponencial en horizontes cortos; no debe usarse como sustituto del modelo bruto sin validación.
- No se proporcionan pesos en safetensors ni GGUF, ni scripts de conversión, lo que dificulta su integración en pipelines de producción estándar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LamTNguyen/dinit
- Arquitectura JiT oficial: https://github.com/LTH14/JiT
- Codificador DINOv3-B/16: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Evaluador ADM (guided-diffusion): https://github.com/openai/guided-diffusion
- torch-fidelity: https://github.com/toshas/torch-fidelity
- Términos de acceso de ImageNet: https://image-net.org/download.php
