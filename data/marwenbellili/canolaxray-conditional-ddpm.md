# MarwenBellili/canolaxray-conditional-DDPM

## Resumen

CanolaXray-DDPM es un modelo de difusión condicional en espacio de píxeles diseñado para sintetizar radiografías de rayos X blandos de semillas de colza (*Brassica napus*). A diferencia de los modelos texto-imagen convencionales, la condición no es un prompt textual, sino un mapa de daño medido de dos canales que se calcula automáticamente a partir de cada radiografía: la silueta de la semilla y la respuesta de estructuras oscuras (fisuras internas). Esto permite solicitar una fisura en una coordenada concreta y verificar después la adherencia reutilizando el mismo detector sobre la imagen generada.

Desarrollado por MarwenBellili, el modelo se entrena desde una inicialización aleatoria sobre un corpus de 4180 radiografías anotadas en cuatro grados ordinales de daño interno (ND, LD, MD, HD). Es el enfoque 1 de un estudio de dos vías; el enfoque 2 es un modelo LoRA sobre un transformer de flujo de 20 B condicionado por texto (canolaxray-qwen-lora). La arquitectura es un U-Net de 19,1 millones de parámetros con condicionamiento por clase y guía classifier-free descompuesta. El checkpoint liberado corresponde a la época 200 de 300 configuradas, no al mínimo de validación, por lo que los resultados reportados pueden subestimar la capacidad real del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net condicional por tiempo (`diffusers.UNet2DModel`), base width 64, channel multipliers (1, 2, 2, 4), 2 bloques residuales por nivel |
| Parametros totales | 19,1 millones (todos entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imágenes, resolución 256 × 256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es modelo de texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (repositorio de `diffusers`; probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un DDPM discreto en espacio de píxeles con programación de ruido coseno y T = 1000 pasos. La entrada es un tensor de 3 canales (imagen ruidosa + mapa de condición de 2 canales) y la predicción objetivo es la velocidad v, con una pérdida Min-SNR ponderada con γ = 5. La normalización es GroupNorm modulada por un MLP que combina el embedding del timestep y el embedding de clase. La atención se aplica únicamente en resoluciones de 32 × 32 y 16 × 16.

La condición se compone de dos elementos que se inyectan por separado: el mapa de condición (canales espaciales) se concatena a la entrada, y la clase ordinal (ND/LD/MD/HD) se añade como embedding aprendido al embedding temporal. Durante el entrenamiento, tanto el mapa como la etiqueta se eliminan independientemente con probabilidad 0,10, lo que permite una guía classifier-free descompuesta según la fórmula ε̃ = ε(∅,∅) + s_c·[ε(c,∅) − ε(∅,∅)] + s_y·[ε(c,y) − ε(c,∅)]. El muestreo usa DDIM con 250 pasos, η = 0 y escala de guía 1,5 en modo conjunto.

El entrenamiento se realizó con AdamW (lr 1e-4, cosine decay, 500 warmup), batch efectivo 32 (16 × 2 grad accum), dropout 0,1 en bloques residuales y gradient checkpointing. El checkpoint liberado es la época 200 de 300 configuradas, no la de mínima pérdida de validación. La aumentación se limita al grupo diédrico del cuadrado (8 permutaciones exactas de píxeles) aplicadas conjuntamente a imagen y mapa, evitando transformaciones interpoladas para no introducir sesgo en la evaluación de la fidelidad de alta frecuencia.

## Capacidades

- Generación condicional de radiografías de rayos X de semillas de colza a partir de un mapa de daño de dos canales (silueta + respuesta de estructuras oscuras).
- Condicionamiento por clase ordinal (ND, LD, MD, HD) mediante embedding aprendido.
- Generación de imágenes en espacio de píxeles a 256 × 256 con fidelidad alta a la condición espacial.
- Verificación post-hoc de adherencia a la condición: el mismo detector utilizado para construir el mapa puede reaplicarse a la imagen generada.
- No soporta texto, tool calling, agentes ni razonamiento multimodal; es exclusivamente un modelo generativo de imágenes condicionado por mapa.

## Casos de uso

- **Fenotipado de semillas por imagen**: generar radiografías sintéticas con daños internos controlados para ampliar conjuntos de datos de entrenamiento de clasificadores de calidad de semillas.
- **Aumento de datos para modelos de segmentación**: crear pares imagen-mapa de condición para entrenar redes que segmenten fisuras internas en radiografías de colza.
- **Simulación de daños en investigación agronómica**: producir imágenes con grados de daño específicos (ND a HD) para estudiar la respuesta de algoritmos de detección ante variaciones controladas.
- **Validación de detectores de estructuras oscuras**: utilizar las imágenes generadas como ground truth sintético para evaluar la sensibilidad y precisión de detectores de fisuras.
- **Estudios de generalización**: comparar el comportamiento de modelos entrenados con datos reales frente a modelos entrenados con datos sintéticos generados por este DDPM.
- **Generación de datos para pipelines de análisis de imagen**: integrar el modelo en flujos de trabajo de laboratorio para generar grandes volúmenes de radiografías anotadas sin coste de adquisición de equipos de rayos X.

## Benchmarks y rendimiento

La model card reporta resultados sobre el conjunto de validación (627 imágenes, 64 generadas por grado, resolución 256 × 256):

**Fidelidad distribucional**: FID global de 0,01 frente a un suelo real-real de 0,02 en este tamaño de muestra. La luminancia del fondo es ≤ 0,0002 frente al cero de máquina de las imágenes reales. El autor advierte que el FID absoluto no es comparable con el de imágenes naturales por la simplicidad de las radiografías.

**Separabilidad en espacio de características**: un test de permutación por grado sobre la estadística de los 10 vecinos más cercanos no encuentra diferencias significativas con el nulo de indistinguibilidad en ningún grado (HD p = 0,60; LD p = 0,36; MD p = 0,88; ND p = 0,45).

**Fidelidad emparejada y generalización**:

| Grado | SSIM (objetivo held-out) | PSNR (dB) | SSIM (imagen de entrenamiento más cercana) |
|---|---|---|---|
| ND | 0,9823 | 37,49 | 0,9682 |
| LD | 0,9859 | 39,44 | 0,9661 |
| MD | 0,9830 | 37,50 | 0,9570 |
| HD | 0,9819 | 36,75 | 0,9503 |
| Media | 0,9833 | — | 0,9604 |

El 79,7 % de las imágenes generadas obtienen una puntuación mayor contra su propio objetivo que contra la imagen de entrenamiento más cercana (Mann–Whitney U = 51 754, p = 4,0 × 10⁻³⁰), lo que indica composición a partir de la condición y no recuperación de imágenes memorizadas.

## Requisitos de hardware

- **Inferencia**: con 19,1 millones de parámetros, el modelo es ligero. Se estima que cabe en GPU de consumo con al menos 4 GB de VRAM en fp32, aunque no se publican requisitos oficiales. La generación con DDIM de 250 pasos puede ejecutarse en una RTX 3060 o superior con tiempos de segundos por imagen.
- **Entrenamiento**: la model card indica que con gradient checkpointing, el entrenamiento completo (batch 32) cabe en una A100 de 40 GB. Sin checkpointing, el batch 32 agota la memoria de activaciones en esa misma GPU.
- **Despliegue**: compatible con la librería `diffusers` (pipeline `unconditional-image-generation`). No se mencionan despliegues específicos con vLLM, llama.cpp u Ollama, que son para modelos de texto.
- **Precisión**: entrenado en fp32 con AMP; se liberan pesos EMA (decay `min(0.9995, (1+k)/(10+k))`).

## Comparativa con modelos similares

El modelo se compara directamente con su contraparte LoRA en el mismo estudio, pero no con modelos de la misma categoría (DDPMs condicionados por mapa de imagen). Se desconoce si existen alternativas públicas comparables.

| Modelo | Arquitectura | Parámetros | Condicionamiento | Resolución | Licencia |
|---|---|---|---|---|---|
| CanolaXray-DDPM | U-Net difusión | 19,1 M | Mapa de condición + clase ordinal | 256 × 256 | CC-BY-4.0 |
| CanolaXray-Qwen-LoRA | Flow-matching transformer (Qwen) + LoRA | 20 B (base) + LoRA | Captions derivadas de medidas | 1024 × 1024 | no disponible |
| DDPM estándar (Ho et al., 2020) | U-Net difusional | ~35 M (para CIFAR-10) | Ninguno (incondicional) | 32 × 32 | no disponible |

La comparación con el DDPM estándar es solo ilustrativa; no se dispone de datos de rendimiento comparables. El modelo LoRA es el enfoque 2 del mismo estudio y está diseñado para una tarea equivalente pero con condicionamiento por texto y mayor resolución.

## Limitaciones y advertencias

- **Checkpoint subóptimo**: el checkpoint liberado es el más reciente en disco en el momento de la evaluación, no el mínimo de pérdida de validación, y el entrenamiento configurado (300 épocas) no se completó. Los números reportados pueden subestimar la capacidad del modelo.
- **Especificidad de dominio**: entrenado exclusivamente con radiografías de semillas de colza; no generaliza a otras especies o tipos de imágenes de rayos X.
- **Resolución limitada**: genera imágenes de 256 × 256, lo que puede ser insuficiente para aplicaciones que requieran detalles de alta frecuencia más finos.
- **Sin validación clínica**: es un modelo de investigación para fenotipado, no está validado para uso clínico o industrial en producción.
- **Riesgo de alucinación**: aunque los tests de generalización muestran composición, la generación puede producir estructuras que no corresponden a daños reales en casos extremos.
- **Licencia**: CC-BY-4.0 permite uso comercial con atribución, pero se recomienda revisar los términos completos.
- **Sin datos de cuantización**: no se proporcionan versiones cuantizadas ni pruebas de rendimiento en hardware de baja potencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MarwenBellili/canolaxray-conditional-DDPM
- Modelo contraparte (LoRA): https://huggingface.co/MarwenBellili/canolaxray-qwen-lora
- No se encontraron papers, repositorios ni demos adicionales específicos del modelo en la búsqueda web.
