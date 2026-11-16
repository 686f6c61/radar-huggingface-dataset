# NightNightUp/filament-segmentation-2026

## Resumen

Filament-segmentation-2026 es un conjunto de pesos para segmentación de instancias de filamentos solares en imágenes H-alpha. Lo publica el usuario NightNightUp y corresponde a las dos soluciones finales (denominadas s15 y s16) presentadas al Solar Filament Segmentation Challenge 2026. El modelo resuelve un problema concreto de física solar: detectar y separar cada filamento de forma individual (máscaras disjuntas a nivel de píxel) en fotogramas GONG H-alpha de 2048 x 2048 píxeles.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es un pipeline de visión por computador compuesto por ensembles de U-Nets, un scorer basado en LightGBM, un refinador de recortes y varios rescorers CNN. La relevancia actual radica en que la segmentación automática de filamentos es una tarea clave para el seguimiento de la actividad solar y la predicción de eyecciones de masa coronal, y este paquete ofrece pesos reproducibles con métricas OOF publicadas.

La licencia es MIT, el repositorio ocupa 8,3 GB y el bundle de inferencia completo asciende a 7,33 GB. No se dispone de información sobre idiomas (no aplica, es un modelo de imagen) ni sobre parámetros totales del conjunto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de U-Nets (encoder timm / segmentation_models_pytorch) + scorer LightGBM + refinador de recortes + rescorers CNN |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 2048 x 2048) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de segmentación de imagen) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (state dicts EMA), LightGBM `.txt`, JSON de argumentos |

## Arquitectura y entrenamiento

El pipeline combina varias etapas. La primera es un ensemble de U-Nets: la variante s15 usa 6 modelos maestros y la s16 usa 3 estudiantes destilados a partir de aquellos. Sobre las máscaras iniciales actúa un scorer LightGBM que puntúa las detecciones, seguido de un refinador de recortes (crop refiner) y de 13 rescorers CNN a datos completos que reordenan y filtran las instancias finales. La salida es una máscara disjunta por píxel para cada filamento.

El entrenamiento se realizó sobre las anotaciones MAGFiLO de los fotogramas de entrenamiento del challenge. Los estudiantes de s16 se entrenaron además con 1314 fotogramas GONG H-alpha sin etiquetar del archivo público del NSO, seleccionados de días distintos a cualquier fotograma de entrenamiento o test y a al menos 6 horas de cualquier marca temporal de test; esos fotogramas se usaron solo para entrenamiento, nunca en inferencia. Los pesos del encoder preentrenado provienen de timm y segmentation_models_pytorch y mantienen sus propios términos de licencia.

## Capacidades

- Segmentación de instancias de filamentos solares en imágenes H-alpha de 2048 x 2048 píxeles.
- Generación de máscaras disjuntas a nivel de píxel, una por filamento detectado.
- Puntuación y filtrado de detecciones mediante LightGBM y rescorers CNN.
- Refinado de recortes para mejorar los límites de las instancias.
- Dos configuraciones de inferencia intercambiables: s15 (ensemble de 6 maestros, mayor coste) y s16 (3 estudiantes destilados, bundle más ligero de 2,54 GB).
- Validación de integridad de pesos mediante manifiesto con sha256.
- No soporta tool calling, agentes, texto, visión general, audio ni razonamiento multi-paso: es un modelo especializado de un único dominio.

## Casos de uso

- Monitorización operativa de la actividad solar: el pipeline procesa fotogramas GONG H-alpha de 2048 x 2048 y devuelve máscaras por filamento, lo que permite construir series temporales de aparición, evolución y desaparición de filamentos.
- Investigación en física solar: las máscaras disjuntas permiten medir longitud, área y orientación de cada filamento de forma individual, algo que una segmentación semántica simple no ofrece.
- Generación de catálogos de filamentos: integrado en un proceso por lotes sobre el archivo del NSO, el modelo puede producir catálogos con identificadores por instancia para cruzar con otras bases de datos solares.
- Evaluación comparativa de métodos de segmentación: al publicar dos picks con métricas OOF (0,4678 y 0,4669 de PQ), sirve como referencia reproducible para nuevos participantes en retos similares.
- Detección de candidatos a eyecciones de masa coronal: la identificación temprana de filamentos y su seguimiento alimenta modelos posteriores de predicción de erupciones.
- Prototipado en entornos con recursos limitados: la variante s16, con un bundle de 2,54 GB, permite desplegar una versión destilada en una sola GPU para pruebas y validación rápida.
- Reproducción de resultados de competición: los scripts de descarga con verificación sha256 y la configuración `final/s15.json` permiten regenerar la submission del challenge de forma exacta.

## Benchmarks y rendimiento

| Pick | Pipeline | 5-fold OOF PQ |
|---|---|---|
| s15 | 6-model U-Net teacher ensemble -> LightGBM scorer -> crop refiner -> CNN rescorers | 0,4678 |
| s16 | 3 distilled student U-Nets -> LightGBM scorer -> crop refiner -> CNN rescorers | 0,4669 |

No se han publicado en la información disponible resultados de otros benchmarks (mIoU, Dice, etc.) ni comparaciones con modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el bundle s15 ocupa 6,80 GB en disco y el s16 2,54 GB, por lo que se requiere al menos esa cantidad de memoria más el overhead de activaciones para imágenes de 2048 x 2048.
- GPU recomendadas: no disponibles en la información proporcionada; el pipeline admite selección de GPU mediante `--gpus`.
- Encaje en GPU de consumo: no confirmado; la variante s16 es la opción más viable por tamaño, pero no hay datos de VRAM pico publicados.
- Opciones de despliegue: ejecución mediante el paquete Python `filseg` del repositorio GitHub, con configuración JSON (`final/s15.json`) y descarga de pesos vía `scripts/get_weights.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de segmentación de filamentos solares con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo funciona con fotogramas GONG H-alpha de 2048 x 2048; no es transferible a otras modalidades de imagen sin reentrenamiento.
- Riesgo de falsos positivos y negativos en filamentos débiles o de bajo contraste; el PQ OOF de 0,4678 indica un margen de error considerable en la segmentación de instancias.
- Dependencia de las anotaciones MAGFiLO: los sesgos de etiquetado de ese conjunto se heredan en el modelo.
- Los pesos del encoder preentrenado (timm / segmentation_models_pytorch), las anotaciones MAGFiLO y los fotogramas GONG mantienen sus propios términos de licencia, distintos del MIT del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente por parte de la comunidad.
- No se documentan sesgos demográficos ni de otro tipo porque el modelo no procesa texto ni datos personales.
- Para uso comercial, verificar la licencia de los componentes de terceros citados antes de redistribuir.

## Enlaces

- Hugging Face: https://huggingface.co/NightNightUp/filament-segmentation-2026
- Repositorio GitHub: https://github.com/xiehuanyi/filament-segmentation-2026
- Competición Kaggle: https://www.kaggle.com/competitions/filament-segmentation-2026
