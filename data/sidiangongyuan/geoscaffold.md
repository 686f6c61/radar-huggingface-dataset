# sidiangongyuan/GeoScaffold

## Resumen

GeoScaffold es una pérdida auxiliar de entrenamiento (training-only auxiliary loss) para detectores de objetos 3D colaborativos en entornos V2X (vehicle-to-everything). El modelo ha sido desarrollado por investigadores de la Renmin University of China, el CFINS de la Tsinghua University y QiYuanLab, y se publica junto con los checkpoints del código homónimo. No se trata de un modelo generativo ni de un LLM: es un conjunto de pesos de detectores 3D sobre nubes de puntos LiDAR que operan en un pipeline de percepción colaborativa para conducción autónoma.

La innovación central es metodológica: en cada ancla positiva, GeoScaffold predice qué celdas de una rejilla superpuesta al ancla caen dentro de la caja ground-truth, generando una supervisión densa que empuja al detector hacia cajas mejor localizadas. La cabeza auxiliar se elimina en inferencia, de modo que cada detector conserva su arquitectura, su coste de comunicación y su coste computacional original. El repositorio libera los checkpoints de 11 métodos de fusión (AttFuse, F-Cooper, CoBEVT, Where2comm, V2X-ViT, V2VNet, DiscoNet, CoAlign, ERMVP, HEAL y otros) en sus variantes Native y +GeoScaffold, además de detectores de referencia Ego-only, Early Fusion y Late Fusion.

El interés actual reside en que permite mejorar la precisión de localización de detectores colaborativos ya existentes sin modificar su despliegue en producción. Según la model card, sobre el split de validación de UrbanIng-V2X el método eleva AP@0.5 en 0,98 puntos y AP@0.7 en 0,55 puntos de media en los 11 métodos de fusión evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detectores 3D colaborativos V2X sobre nubes de puntos LiDAR (11 métodos de fusión: AttFuse, F-Cooper, CoBEVT, Where2comm, V2X-ViT, V2VNet, DiscoNet, CoAlign, ERMVP, HEAL, entre otros); GeoScaffold es una cabeza auxiliar de supervisión densa que se retira en inferencia |
| Parametros totales | No disponible (depende del detector base; los checkpoints individuales ocupan entre 20,9 MB y 84,9 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica; opera sobre nubes de puntos, no sobre secuencias de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de percepción 3D, sin capacidades lingüísticas) |
| Licencia | UCLA Academic Software License (uso académico y de investigación sin ánimo de lucro) |
| Formato de pesos | PyTorch (`net_epochN.pth`) |

## Arquitectura y entrenamiento

GeoScaffold no define una arquitectura de red propia, sino que se acopla a detectores 3D colaborativos existentes. Cada detector procesa nubes de puntos LiDAR procedentes de vehículos e infraestructura (V2X) y fusiona las representaciones intermedias para producir cajas 3D. Sobre esa base, GeoScaffold añade una cabeza auxiliar que, para cada ancla positiva, clasifica las celdas de una rejilla local superpuesta al ancla según si caen dentro de la caja ground-truth. Esta señal densa complementa la regresión de cajas habitual y actúa como regularizador geométrico durante el entrenamiento; en inferencia la cabeza se descarta por completo.

Los checkpoints se entrenan sobre el dataset UrbanIng-V2X (split de validación crossing1/2), publicado por sus autores bajo CC BY-NC-ND 4.0. Cada par Native/+GeoScaffold comparte datos, semilla, orden de muestras, aumentación, configuración del optimizador, schedule de learning rate y duración de entrenamiento, lo que permite atribuir la mejora exclusivamente a la pérdida auxiliar. Los tamaños de checkpoint van de 20,9 MB (HEAL Native) a 84,9 MB (DiscoNet +GeoScaffold), y el incremento típico al añadir GeoScaffold es de unos 3,7 MB por modelo. No se especifican en la información disponible el número de tokens, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Detección de objetos 3D sobre nubes de puntos LiDAR en escenarios de percepción colaborativa V2X.
- Fusión de información entre agentes (vehículos e infraestructura) mediante 11 métodos de fusión distintos.
- Mejora de la localización de cajas 3D gracias a la supervisión densa de GeoScaffold, sin coste adicional en inferencia.
- Compatibilidad con detectores de referencia Ego-only, Early Fusion y Late Fusion.
- Evaluación con umbrales de IoU configurables (AP@0.3, AP@0.5, AP@0.7).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es un modelo puramente perceptivo.

## Casos de uso

- Percepción colaborativa en intersecciones urbanas: desplegar un detector como F-Cooper +GeoScaffold para fusionar nubes LiDAR de vehículos y unidades de infraestructura, obteniendo cajas 3D mejor localizadas (AP@0.5 de 27,43 frente a 25,35 del Native).
- Vehículo autónomo con comunicación V2X: usar V2X-ViT +GeoScaffold, que alcanza AP@0.5 de 29,08 y AP@0.7 de 12,58 en validación, para detectar objetos ocluidos o fuera del campo de visión del ego-vehículo.
- Investigación académica en detección 3D colaborativa: emplear los pares Native/+GeoScaffold como baseline reproducible para estudiar el efecto de pérdidas auxiliares geométricas, gracias a que comparten semilla, datos y schedule.
- Evaluación comparativa de métodos de fusión: utilizar los 11 checkpoints liberados para comparar AttFuse, CoBEVT, Where2comm, DiscoNet, CoAlign, ERMVP o HEAL bajo idénticas condiciones de entrenamiento.
- Prototipado de sistemas de infraestructura inteligente: integrar detectores ligeros como HEAL +GeoScaffold (checkpoint de 20,9 MB en su versión Native) en unidades de carretera con recursos computacionales limitados.
- Análisis de robustez en localización: aprovechar la mejora sistemática en AP@0.7 (de 6,88 a 12,58 en los distintos métodos) para estudiar el impacto de la supervisión densa en la precisión de cajas con IoU estricto.
- Formación y reproducción de experimentos: reentrenar los detectores con el código del repositorio de GitHub y los configs incluidos en cada carpeta de checkpoint.

## Benchmarks y rendimiento

Resultados sobre el split de validación de UrbanIng-V2X (crossing1/2), AP en porcentaje, checkpoints finales:

| Metodo | Variante | AP@0.3 | AP@0.5 | AP@0.7 |
|---|---|---|---|---|
| Ego-only | referencia | 22,55 | 16,12 | 5,41 |
| Early Fusion | referencia | 23,76 | 17,35 | 6,46 |
| Late Fusion | referencia | 27,25 | 19,40 | 6,88 |
| AttFuse | Native | 24,25 | 18,18 | 7,16 |
| AttFuse | +GeoScaffold | 25,19 | 18,89 | 7,30 |
| F-Cooper | Native | 31,62 | 25,35 | 11,19 |
| F-Cooper | +GeoScaffold | 33,12 | 27,43 | 12,57 |
| CoBEVT | Native | 28,27 | 22,45 | 8,76 |
| CoBEVT | +GeoScaffold | 28,53 | 22,94 | 9,07 |
| Where2comm | Native | 30,21 | 24,89 | 11,13 |
| Where2comm | +GeoScaffold | 30,90 | 26,16 | 11,78 |
| V2X-ViT | Native | 33,86 | 26,38 | 11,16 |
| V2X-ViT | +GeoScaffold | 36,35 | 29,08 | 12,58 |
| V2VNet | Native | 22,84 | 17,11 | 6,65 |
| V2VNet | +GeoScaffold | 23,48 | 17,95 | 7,07 |
| DiscoNet | Native | 30,64 | 25,52 | 11,37 |
| DiscoNet | +GeoScaffold | 30,84 | 25,75 | 11,61 |
| CoAlign | Native | 28,22 | 19,96 | 7,38 |
| CoAlign | +GeoScaffold | 28,27 | 20,10 | 7,45 |
| ERMVP | Native | 29,19 | 23,76 | 10,04 |
| ERMVP | +GeoScaffold | 29,86 | 24,15 | 10,72 |
| HEAL | Native | 20,9 (tamaño del checkpoint; AP no disponible en la información proporcionada) | No disponible | No disponible |

Según la model card, GeoScaffold eleva AP@0.5 en 0,98 puntos y AP@0.7 en 0,55 puntos de media en los 11 métodos de fusión evaluados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Los checkpoints individuales pesan entre 20,9 MB y 84,9 MB, por lo que el cuello de botella es el procesamiento de nubes de puntos, no el tamaño de los pesos.
- GPU recomendadas: no disponibles de forma explícita. Por el tamaño de los checkpoints y la naturaleza de los detectores 3D LiDAR, se espera que quepan en GPUs de consumo, pero no se confirma en la información.
- Cabe en GPU de consumo: no confirmado en la información proporcionada.
- Opciones de despliegue: el repositorio oficial de GitHub (`sidiangongyuan/GeoScaffold`) con PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AP@0.5 (UrbanIng-V2X val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| V2X-ViT +GeoScaffold | No disponible | No aplica | 29,08 | UCLA Academic Software License | Checkpoint en HF |
| V2X-ViT Native | No disponible | No aplica | 26,38 | UCLA Academic Software License | Checkpoint en HF |
| F-Cooper +GeoScaffold | No disponible | No aplica | 27,43 | UCLA Academic Software License | Checkpoint en HF |
| Where2comm +GeoScaffold | No disponible | No aplica | 26,16 | UCLA Academic Software License | Checkpoint en HF |
| DiscoNet +GeoScaffold | No disponible | No aplica | 25,75 | UCLA Academic Software License | Checkpoint en HF |

La comparativa se establece internamente entre los detectores incluidos en el propio repositorio, ya que no se proporcionan datos de modelos externos comparables en la información disponible.

## Limitaciones y advertencias

- Licencia UCLA Academic Software License: restringe el uso a investigación académica y sin ánimo de lucro; el uso comercial requiere autorización expresa.
- El dataset de entrenamiento UrbanIng-V2X se distribuye bajo CC BY-NC-ND 4.0, lo que añade restricciones adicionales sobre los pesos derivados.
- Modelo de percepción 3D sin capacidades lingüísticas: no admite prompts, tool calling ni generación de texto.
- Dependencia del detector base: el rendimiento y los requisitos de hardware varían según el método de fusión elegido (de 20,9 MB a 84,9 MB por checkpoint).
- Validación limitada: los resultados se reportan únicamente sobre el split de validación crossing1/2 de UrbanIng-V2X; no se aportan datos de generalización a otros datasets o dominios.
- Riesgo de sobreajuste al escenario urbano de intersecciones: no se documenta comportamiento en autopista, zonas rurales o condiciones meteorológicas adversas.
- No se han publicado resultados de benchmarks externos (KITTI, nuScenes, V2X-Seq) en la información disponible.
- La cabeza GeoScaffold se elimina en inferencia, por lo que no puede usarse como módulo independiente de predicción geométrica.

## Enlaces

- Hugging Face: https://huggingface.co/sidiangongyuan/GeoScaffold
- Repositorio de código: https://github.com/sidiangongyuan/GeoScaffold
- Paper (arXiv, próximamente): no disponible todavía
- Dataset UrbanIng-V2X: no disponible en la información proporcionada
