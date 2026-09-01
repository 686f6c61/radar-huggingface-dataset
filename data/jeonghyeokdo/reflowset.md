# JeonghyeokDo/ReFlowSET

## Resumen

ReFlowSET es un modelo de traducción de imagen SAR (radar de apertura sintética) a imagen óptica de observación terrestre (EO), desarrollado por el KAIST VICLab (Jeonghyeok Do y colaboradores). El modelo emplea un enfoque de flow matching condicional entrenado desde cero dentro del espacio latente de un autoencoder congelado de alta fidelidad, basado en la arquitectura del modelo FLUX.2-klein-base-4B de Black Forest Labs. Su objetivo es resolver el problema de convertir imágenes de radar en imágenes ópticas equivalentes, una tarea relevante en teledetección porque las imágenes SAR están disponibles independientemente de las condiciones meteorológicas o de iluminación, mientras que las ópticas ofrecen una interpretación visual más directa.

El modelo se publica en dos variantes (checkpoints) que comparten arquitectura y autoencoder congelado: una entrenada en el dataset QXS-SAROPT a resolución 256×256 y otra en SAR2Opt a 512×512. El transformer principal tiene aproximadamente 509 millones de parámetros, más un autoencoder congelado de unos 84 millones. El repositorio incluye también los pesos de quince métodos previos de comparación, reentrenados bajo un protocolo unificado, lo que facilita la evaluación objetiva. La licencia de los pesos es CC BY-NC 4.0 (uso no comercial), mientras que el código es Apache-2.0.

La relevancia actual de ReFlowSET radica en que aborda la traducción SAR-EO con una arquitectura moderna de diffusion transformer y flow matching, superando en varias métricas a los métodos anteriores en los benchmarks reportados, y proporciona una implementación completa y reproducible en el ecosistema diffusers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching; 24 bloques (8 double-stream + 16 single-stream), hidden size 1024, 16 cabezas de atención de dimensión 64, RoPE 2-D sobre ejes (32, 32) |
| Parametros totales | 509,324,417 (transformer) + 84,046,115 (autoencoder congelado) = 593,370,532 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin soporte de texto) |
| Licencia | Mixta: pesos de ReFlowSET bajo CC BY-NC 4.0; código bajo Apache-2.0; los pesos de los métodos de comparación en `baselines/` tienen sus propias licencias |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

ReFlowSET es un DiT (Diffusion Transformer) con flow matching condicional. La arquitectura consta de 24 bloques: ocho bloques double-stream que procesan por separado las secuencias de tokens de las imágenes EO y SAR con proyecciones propias y atención conjunta, seguidos de dieciséis bloques single-stream sobre la secuencia concatenada. No existe un encoder SAR separado: la imagen SAR se codifica con el mismo autoencoder congelado que define el espacio latente de la imagen EO. El entrenamiento define un puente lineal `z_t = (1−t)·ε + t·z_e` y regresa la velocidad `u* = z_e − ε` condicionada en el latente SAR. El muestreo parte de ruido gaussiano `N(0, I)` e integra de `t: 0 → 1` con un paso de Euler explícito. Se aplicó classifier-free guidance anulando la condición SAR en el 10 % de las muestras de entrenamiento.

Los datos de entrenamiento son exclusivamente los datasets QXS-SAROPT y SAR2Opt, uno por cada variante del modelo, sin corpus de preentrenamiento adicional. El checkpoint de QXS-SAROPT se entrenó durante 40,000 pasos con batch global de 64 (2.56 millones de muestras vistas), mientras que el de SAR2Opt se detuvo en 20,000 pasos con batch global de 32 (640,000 muestras) para mantener un presupuesto de muestras comparable dado su conjunto de entrenamiento más pequeño (1,450 imágenes). Los pesos publicados corresponden a los promedios EMA (exponential moving average); el proyector REPA usado solo durante el entrenamiento no se incluye.

## Capacidades

- Traducción de imagen SAR a imagen óptica (EO) de una sola pasada, con dos resoluciones disponibles: 256×256 (QXS-SAROPT) y 512×512 (SAR2Opt).
- Generación condicional mediante flow matching con guidance, permitiendo ajustar la fidelidad frente a la diversidad mediante el parámetro `guidance_scale` (valor recomendado 1.5).
- Soporte para muestreo rápido con NFE (number of function evaluations) reducido: NFE 4 ofrece una aceleración de 11× a 256² y 13× a 512² en comparación con NFE 50, a costa de peores métricas de distribución.
- Integración completa con el ecosistema `diffusers` de Hugging Face: cada checkpoint es un pipeline autocontenido con su transformer, VAE, scheduler y `model_index.json`.
- Incluye los pesos de quince métodos previos de comparación reentrenados bajo el mismo protocolo, lo que permite reproducir las evaluaciones comparativas.
- No tiene capacidades de texto, tool calling, agentes ni razonamiento multimodal; es un modelo puramente de imagen a imagen.

## Casos de uso

- Generación de imágenes ópticas sintéticas a partir de datos SAR para aplicaciones de observación terrestre: permite obtener visualizaciones ópticas de regiones donde la cobertura nubosa impide la captura óptica, útil para monitorización agrícola, forestal o urbana.
- Aumento de datos para entrenamiento de modelos de visión por computadora en teledetección: las imágenes EO generadas pueden complementar datasets ópticos escasos, mejorando la robustez de clasificadores o segmentadores.
- Análisis de catástrofes y emergencias: en situaciones de inundación, incendio o terremoto, las imágenes SAR están disponibles de inmediato; ReFlowSET puede generar una versión óptica aproximada para facilitar la interpretación por parte de equipos de respuesta.
- Verificación cruzada de datos SAR y ópticos: al comparar la traducción generada con la imagen óptica real (si existe), se pueden detectar cambios en el terreno o anomalías entre adquisiciones de distintos sensores.
- Investigación en teledetección: el modelo sirve como referencia reproducible para estudiar técnicas de flow matching aplicadas a traducción de dominio, gracias a la inclusión de los quince métodos comparativos y el protocolo de evaluación unificado.
- Prototipado de pipelines de generación de imágenes en entornos con recursos limitados: al poder ejecutarse con NFE 4, es viable para aplicaciones en tiempo casi real en hardware de gama media, aunque la licencia no comercial limita su uso en productos comerciales.

## Benchmarks y rendimiento

Los resultados reportados en la model card fueron obtenidos por los autores evaluando los mismos elementos de test que quince métodos previos, reentrenados bajo un protocolo unificado y puntuados por un único evaluador. La tabla siguiente muestra los valores de ReFlowSET; las celdas en negrita indican el mejor valor entre los dieciséis métodos de la tabla principal del paper.

| Dataset | n | FID↓ | DISTS↓ | LPIPS↓ | SSIM↑ | PSNR↑ |
|---|---|---|---|---|---|---|
| QXS-SAROPT @256 | 3,999 | 19.1 | **0.2310** | 0.5344 | 0.3554 | 16.09 |
| SAR2Opt @512 | 627 | **66.3** | **0.1847** | **0.5217** | 0.2871 | 16.06 |

Los autores advierten explícitamente que estos números no son comparables con los publicados en los papers originales de los métodos previos, debido a diferencias en splits, resoluciones y convenciones de evaluación. En particular, la métrica LPIPS tiene dos convenciones en esta literatura que difieren en aproximadamente 0.05: ReFlowSET alimenta la red LPIPS con valores `x*2−1`, mientras que varios evaluadores publicados usan el rango `[0,1]` con `normalize=False`, obteniendo valores sistemáticamente más bajos.

## Requisitos de hardware

- El modelo tiene aproximadamente 593 millones de parámetros en total (transformer + autoencoder congelado). En precisión fp32, el uso de VRAM estimado sería del orden de 2.5–3 GB solo para los pesos, más la memoria de activaciones y el procesamiento de imágenes, por lo que podría caber en GPUs de consumo con 8 GB o más, aunque no se ha verificado oficialmente.
- Las mediciones de latencia reportadas se realizaron en una GPU NVIDIA B200: 1,824 ms por imagen a 256² con NFE 50, y 4,807 ms a 512² con NFE 50. Con NFE 4, los tiempos bajan a 163 ms y 371 ms respectivamente (batch 1).
- No se proporcionan requisitos mínimos de VRAM ni recomendaciones de GPU específicas en la documentación disponible.
- Opciones de despliegue: el modelo se integra con `diffusers` (pipeline estándar), por lo que puede ejecutarse con cualquier backend que soporte esta librería (por ejemplo, PyTorch con CUDA). No se menciona soporte para vLLM, llama.cpp u Ollama, dado que no es un modelo de lenguaje.
- Para uso en producción, se recomienda cuantizar los pesos (por ejemplo, a fp16 o int8) para reducir el consumo de memoria, aunque no se han publicado pruebas oficiales de cuantización.

## Comparativa con modelos similares

No se dispone de información detallada sobre modelos comparables específicos en la documentación proporcionada. El paper de ReFlowSET incluye una comparación con quince métodos previos de traducción SAR-EO (cuyos pesos se incluyen en el repositorio bajo `baselines/`), pero no se listan sus nombres ni resultados individuales en la model card. Los autores afirman que ReFlowSET obtiene el mejor valor en DISTS en ambos datasets y en FID, LPIPS y SSIM en SAR2Opt, según su protocolo de evaluación unificado. Para una comparativa exhaustiva, se remite al paper y al archivo `MODEL_ZOO.md` del repositorio GitHub.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0 para los pesos: prohibido el uso comercial sin permiso explícito de los autores. El código es Apache-2.0, pero los pesos del modelo y los de los métodos de comparación tienen restricciones adicionales.
- Los datasets de entrenamiento (QXS-SAROPT y SAR2Opt) no se redistribuyen; QXS-SAROPT requiere citar arXiv:2103.08259 para uso de investigación.
- Los resultados de benchmarks no son directamente comparables con los de los papers originales de los métodos previos debido a diferencias en protocolos de evaluación; cualquier comparación debe realizarse bajo el mismo protocolo.
- La métrica LPIPS es sensible a la convención de normalización de entrada; los valores reportados usan `x*2−1`, lo que puede diferir de otras implementaciones.
- El modelo no tiene capacidades de texto ni razonamiento; es exclusivamente un traductor de imagen a imagen.
- No se han documentado sesgos específicos, pero al estar entrenado únicamente en dos datasets de teledetección, su generalización a otras regiones geográficas o tipos de sensor puede ser limitada.
- El muestreo con NFE reducido (4) degrada las métricas de distribución (FID, DISTS, LPIPS) aunque mejore las métricas de píxel (SSIM, PSNR); no deben mezclarse configuraciones de muestreo en una misma comparación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JeonghyeokDo/ReFlowSET
- Paper (arXiv): https://arxiv.org/abs/{{ARXIV_ID}} (el ID no está especificado en la model card)
- Código fuente (GitHub): https://github.com/KAIST-VICLab/ReFlowSET
- Página del proyecto: https://kaist-viclab.github.io/ReFlowSET_site/
- README de los métodos de comparación: https://huggingface.co/JeonghyeokDo/ReFlowSET/blob/main/baselines/README.md
- Model zoo con licencias de los métodos comparados: https://github.com/KAIST-VICLab/ReFlowSET/blob/main/MODEL_ZOO.md
