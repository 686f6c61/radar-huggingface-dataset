# Moon-Young-Choi/TFRCA-TAE-IARA-H-P8x8-F65xT40-3.88M

## Resumen

TFRCA-TAE (Time-Frequency Reconstruction Convolution-free Transformer Autoencoder) es un modelo de detección de anomalías acústicas submarinas desarrollado por Moon-Young-Choi. Está diseñado específicamente para sonar pasivo: aprende de forma no supervisada a reconstruir espectrogramas de grabaciones de fondo marino de la base de datos IARA H y asigna una puntuación continua de anomalía a cualquier sonido que resulte difícil de reconstruir bajo ese modelo de fondo aprendido. No es un clasificador de embarcaciones, sino un detector de desviaciones respecto al entorno acústico de referencia.

El modelo emplea una arquitectura Transformer autoencoder con encoders separados para tiempo y frecuencia, cross-attention bidireccional entre ambas ramas y un decoder global que reconstruye los patches enmascarados del espectrograma. Tiene exactamente 3.880.128 parámetros y procesa ventanas de 10 segundos de audio mono a 16 kHz. Su relevancia radica en que ofrece una solución ligera y eficiente (inferencia media de 30,93 ms por ventana) para vigilancia acústica submarina pasiva, con resultados publicados sobre la base IARA v2, un conjunto de datos de referencia de la Marina de Brasil.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoencoder con encoders de tiempo y frecuencia, cross-attention bidireccional y decoder global |
| Parametros totales | 3.880.128 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (entrada acústica fija de 10 s a 16 kHz, espectrograma 520×320) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (procesa audio submarino, no texto) |
| Licencia | No especificada para el modelo; dataset IARA v2 bajo CC BY-NC 4.0 |
| Formato de pesos | PyTorch (archivo .pt) |

## Arquitectura y entrenamiento

El modelo transforma una señal de audio mono de 10 s a 16 kHz en un espectrograma de magnitud logarítmica STFT de 513×313 puntos, que se rellena hasta 520×320 y se divide en patches de 8×8 píxeles, formando una cuadrícula de 65×40 tokens. Cada token se proyecta a un embedding de 192 dimensiones. La arquitectura consta de dos ramas encoder independientes: una rama temporal que agrupa a través de la frecuencia y una rama frecuencial que agrupa a través del tiempo, ambas con 2 capas y 6 cabezas de atención. Estas dos ramas se comunican mediante cross-attention bidireccional con 6 cabezas, y sus contextos se fusionan en un vector H de 768 dimensiones que se proyecta al decoder global de 128 dimensiones, con 2 capas, 4 cabezas y FFN de 512. El decoder reconstruye los patches enmascarados.

El entrenamiento es no supervisado: se oculta el 40% de los patches del espectrograma y el modelo debe reconstruirlos a partir del contexto restante. Se utilizaron 29 grabaciones de fondo IARA H para entrenamiento, 9 para validación y 9 como test reservado; las grabaciones de embarcaciones IARA F y G (35 y 37 respectivamente) se reservaron exclusivamente para evaluación y no participaron en normalización, selección de checkpoint ni umbral. El optimizador es AdamW con tasa de aprendizaje 3e-4, weight decay 1e-4, warm-up del 5% y decaimiento coseno; batch efectivo de 16 (físico 2 con acumulación de gradiente de 8 pasos), mixed precision, clipping de gradiente a 1.0 y dropout 0.1. El entrenamiento se limitó a 50 épocas con paciencia de validación de 8, seleccionando el mejor checkpoint (época 42) por la puntuación media de anomalía en validación. Se ejecutó en una NVIDIA A100-SXM4-80GB y duró 396,10 segundos.

## Capacidades

- Detección de anomalías acústicas submarinas: asigna una puntuación continua de anomalía a cada ventana de 10 s basada en el error de reconstrucción de los patches enmascarados.
- Reconstrucción de espectrogramas: es capaz de reconstruir contenido oculto del espectrograma a partir del contexto tiempo-frecuencia, lo que constituye la base de su puntuación de anomalía.
- Inferencia eficiente: procesa una ventana de 10 s en una media de 30,93 ms en hardware de referencia, y una grabación completa (4 ventanas) en 123,72 ms.
- Umbral de referencia integrado: proporciona un umbral de 0,4438585638999939 calculado como el máximo de las puntuaciones de las grabaciones de validación, junto con un flag de superación del umbral.
- Evaluación robusta: en inferencia se aplican cinco patrones de máscara fijos para que cada patch sea probado dos veces, y la puntuación final de una grabación es el máximo de las puntuaciones de sus cuatro ventanas.
- No requiere datos etiquetados: el entrenamiento es completamente no supervisado sobre grabaciones de fondo, sin necesidad de anotaciones de embarcaciones.

## Casos de uso

- Vigilancia acústica pasiva en áreas marinas protegidas: el modelo puede monitorizar de forma continua el paisaje sonoro submarino y alertar cuando aparecen sonidos que no se corresponden con el fondo aprendido, permitiendo detectar embarcaciones no declaradas o actividades ilegales sin necesidad de clasificarlas.
- Monitorización ambiental de ecosistemas marinos: integrado en boyas acústicas, puede señalar cambios en el entorno sonoro (por ejemplo, ruido de construcción, tráfico marítimo anómalo) que afecten a la fauna, usando la puntuación de anomalía como indicador temprano.
- Investigación oceanográfica: los investigadores pueden usar la puntuación de anomalía para filtrar automáticamente grandes volúmenes de grabaciones pasivas y seleccionar segmentos de interés para análisis posterior, reduciendo el tiempo de revisión manual.
- Detección de embarcaciones en zonas de exclusión: en ejercicios militares o áreas restringidas, el modelo puede funcionar como un primer filtro de alerta, aunque no identifique el tipo de embarcación, señalando desviaciones del fondo acústico de referencia.
- Validación de modelos de ruido ambiental: sirve como herramienta de referencia para comparar la calidad de reconstrucción de otros modelos generativos o de compresión aplicados a acústica submarina, utilizando su error de reconstrucción como métrica.
- Educación y demostración de detección de anomalías: dado su tamaño reducido (3,88 M de parámetros) y su inferencia en CPU, puede ejecutarse en entornos docentes o en equipos sin GPU para ilustrar técnicas de autoencoders enmascarados aplicadas a señales reales de sonar pasivo.

## Benchmarks y rendimiento

La evaluación se realizó sobre la base IARA v2, comparando la detección de grabaciones de embarcaciones (clases F y G) frente a grabaciones de fondo (clase H), en cinco divisiones congeladas de 29/9/9 grabaciones.

| Metodo | Ejecuciones | AUROC | pAUROC (FPR ≤ 0,10) |
|---|---|---|---|
| TFRCA-TAE (propuesto) | 15 | 0,9111 ± 0,0445 | 0,7797 ± 0,1065 |
| B0 — PCA reconstruction | 5 | 0,8457 ± 0,0804 | 0,6681 ± 0,1710 |
| B1 — Plain masked Transformer | 15 | 0,8559 ± 0,0446 | 0,6608 ± 0,0525 |

El checkpoint desplegado específicamente obtuvo en su evaluación reservada H frente a F/G un AUROC de 0,8935, pAUROC de 0,7661 y average precision de 0,9847.

## Requisitos de hardware

- Inferencia en CPU: el ejemplo de uso oficial ejecuta el detector en `device="cpu"`, por lo que es viable su despliegue en entornos sin GPU.
- Memoria pico medida durante inferencia: 218.560.512 bytes (~208 MB), lo que permite su ejecución en hardware modesto.
- Entrenamiento: realizado en una NVIDIA A100-SXM4-80GB, aunque el modelo es lo bastante pequeño como para entrenarse en GPUs con menos memoria (probablemente 16-24 GB).
- Tiempo de inferencia: 30,93 ms por ventana de 10 s y 123,72 ms por grabación de 4 ventanas en el hardware de referencia.
- Despliegue recomendado: dado que no es un LLM y usa PyTorch estándar, puede servirse mediante frameworks de inferencia genéricos (TorchServe, FastAPI) o integrarse directamente en pipelines de procesamiento de audio. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que son específicos de modelos de lenguaje.
- Peso del checkpoint: 46.739.929 bytes (~44,6 MB), fácil de distribuir y cargar.

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos de detección de anomalías acústicas submarinas con arquitectura Transformer autoencoder que permitan una comparación directa. Los únicos puntos de referencia disponibles son los baselines incluidos en la propia evaluación del autor:

| Metodo | Arquitectura | Parametros | AUROC | Contexto |
|---|---|---|---|---|
| TFRCA-TAE | Transformer autoencoder con encoders duales | 3,88 M | 0,9111 | Espectrograma 520×320 |
| PCA reconstruction | Reducción de dimensionalidad lineal | No especificado | 0,8457 | Espectrograma |
| Plain masked Transformer | Transformer autoencoder estándar | No especificado | 0,8559 | Espectrograma |

No se han identificado modelos alternativos de la misma categoría con licencia abierta y datos publicados comparables.

## Limitaciones y advertencias

- No es un clasificador de embarcaciones: el modelo solo proporciona una puntuación de anomalía; no identifica el tipo de fuente sonora. El flag de superación de umbral no debe interpretarse como una alarma operacional.
- Datos de entrenamiento limitados: se entrenó únicamente con 29 grabaciones de fondo IARA H, lo que puede limitar su generalización a otros entornos marinos con características acústicas diferentes.
- Licencia del dataset: IARA v2 se distribuye bajo CC BY-NC 4.0, lo que restringe el uso comercial de cualquier modelo entrenado con estos datos. La licencia del propio modelo no está especificada en la ficha de HuggingFace.
- Umbral de referencia específico del conjunto: el umbral de 0,4438585638999939 se calculó sobre las grabaciones de validación de IARA H y puede no ser transferible a otras ubicaciones o condiciones de grabación sin recalibración.
- Riesgo de falsos positivos en entornos con fondo variable: cualquier sonido no presente en el fondo aprendido (por ejemplo, lluvia intensa, biología marina) podría generar puntuaciones altas de anomalía, sin que ello indique necesariamente presencia de embarcaciones.
- Sin soporte multilingüe ni capacidades de texto: el modelo procesa exclusivamente audio submarino; no es aplicable a otras modalidades ni a tareas de lenguaje.
- Formato de pesos propietario: el checkpoint se distribuye como archivo `.pt` de PyTorch, sin cuantizaciones alternativas ni compatibilidad con runtimes específicos fuera del ecosistema PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Moon-Young-Choi/TFRCA-TAE-IARA-H-P8x8-F65xT40-3.88M
- Demo interactiva del dataset: https://huggingface.co/spaces/Moon-Young-Choi/TFRCA-TAE-IARA-H-Demo
- Paquete de investigación: https://huggingface.co/Moon-Young-Choi/TFRCA-TAE-research
- Dataset IARA v2 (Zenodo, DOI 10.5281/zenodo.15777429): https://doi.org/10.5281/zenodo.15777429
