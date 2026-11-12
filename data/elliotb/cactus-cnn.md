# elliotb/cactus-cnn

## Resumen

`elliotb/cactus-cnn` es una red neuronal convolucional (CNN) de tipo clasificador de imágenes, publicada en Hugging Face por el usuario elliotb y exportada en formato ONNX. Su única tarea es detectar la presencia de cactus columnares en viñetas aéreas de 32×32 píxeles, un caso de uso muy acotado dentro de la teledetección. No es un modelo de lenguaje ni un modelo multimodal general: es un clasificador binario de imágenes satelitales/aéreas de dominio muy específico.

El modelo se entrenó con el conjunto de datos de la competición de Kaggle «Aerial Cactus Identification» (proyecto VIGIA), formado por 17.500 viñetas etiquetadas. Según la model card del autor, alcanza una exactitud del 99,72 % ± 0,12 en validación cruzada estratificada de 5 pliegues con semilla 42. El artefacto pesa 6 MB y, de acuerdo con el autor, infiere en aproximadamente 1 ms por viñeta en CPU.

Su relevancia es limitada y muy específica: sirve como componente de demostración (la Space `elliotb/cactus-detection`) y como ejemplo reproducible de un pipeline de clasificación de imágenes aéreas con CNN. No está pensado para fotografías convencionales ni para otras especies o dominios, y su licencia (datos de competición de Kaggle) restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional); detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 32×32 píxeles) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente float32) |
| Idiomas soportados | no aplica (modelo de visión sin componente textual) |
| Licencia | other / kaggle-competition-data |
| Formato de pesos | ONNX (`cactus_cnn.onnx`, 6 MB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (número de capas convolucionales, canales, uso de batch normalization o dropout). Se sabe que es una CNN que opera sobre viñetas de 32×32 píxeles y que se exportó a ONNX para su despliegue. El autor no publica el número de parámetros ni la configuración exacta de la red en la model card.

El entrenamiento se realizó sobre el conjunto «Aerial Cactus Identification» de Kaggle (proyecto VIGIA), con 17.500 viñetas etiquetadas. El autor reporta una validación cruzada estratificada de 5 pliegues con semilla 42, obteniendo una exactitud de 99,72 % ± 0,12. No se indica si hubo aumento de datos, balanceo de clases, técnicas de regularización ni el número de épocas u optimizador empleados.

## Capacidades

- Clasificación binaria de imágenes aéreas de 32×32 píxeles: presencia o ausencia de cactus columnares.
- Inferencia rápida en CPU (aproximadamente 1 ms por viñeta según el autor).
- Exportación a ONNX, lo que permite ejecución con ONNX Runtime en entornos sin GPU.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Detección de cactus en ortomosaicos aéreos: se puede trocear una imagen aérea en viñetas de 32×32 y clasificar cada una para generar un mapa de presencia de cactus columnares, aprovechando la velocidad de inferencia en CPU.
- Filtrado previo en pipelines de teledetección: usar el clasificador como etapa rápida de descarte para reducir el volumen de imágenes que pasan a un modelo más costoso o a revisión humana.
- Monitorización de vegetación en estudios ecológicos: conteo aproximado de ejemplares en parcelas de interés a partir de vuelos periódicos, siempre que el formato de las viñetas coincida con el del entrenamiento.
- Docencia y reproducción de experimentos: el repositorio de GitHub asociado permite reproducir el pipeline completo (entrenamiento, validación cruzada y exportación a ONNX) como ejemplo didáctico de clasificación de imágenes aéreas.
- Despliegue en dispositivos de borde: al ser un ONNX de 6 MB con inferencia en CPU de ~1 ms, puede ejecutarse en hardware modesto o en contenedores ligeros sin GPU.
- Componente de demostración en una Space de Hugging Face: integrado en `elliotb/cactus-detection` para mostrar la clasificación en vivo de viñetas subidas por el usuario.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Exactitud | 99,72 % ± 0,12 | Validación cruzada estratificada de 5 pliegues, semilla 42 |
| Latencia | ~1 ms por viñeta | CPU, según el autor |
| Tamano del artefacto | 6 MB | `cactus_cnn.onnx` |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para inferencia en CPU.
- GPU recomendadas: no aplica; cualquier GPU con soporte ONNX Runtime podría usarse, pero no aporta ventaja significativa dado el tamaño del modelo.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integración en servicios Python, contenedores ligeros; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia estimada: ~1 ms por viñeta en CPU según el autor; el throughput dependerá del número de viñetas y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Exactitud reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `elliotb/cactus-cnn` | CNN + ONNX | 32×32 píxeles | 99,72 % ± 0,12 (CV 5 pliegues) | kaggle-competition-data | Hugging Face |
| Otras CNN de clasificación aérea | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo funciona con viñetas aéreas de 32×32 píxeles del mismo tipo que las del conjunto de entrenamiento; no es apto para fotografías convencionales ni para otras resoluciones o sensores.
- Una sola clase de interés (cactus columnares); no distingue especies ni cuenta ejemplares dentro de una viñeta.
- Riesgo de falsos positivos y negativos fuera de la distribución de entrenamiento; la exactitud reportada corresponde solo al conjunto de validación cruzada del propio dataset.
- Sesgos potenciales derivados de la composición del dataset de Kaggle (localización geográfica, iluminación, estación del año, sensor); no se documentan análisis de sesgo.
- Licencia `kaggle-competition-data`: restringe el uso comercial y obliga a revisar los términos de la competición de Kaggle antes de cualquier despliegue en producción.
- No se especifican los parámetros, la arquitectura exacta ni el preprocesamiento, lo que dificulta la reproducibilidad fuera del repositorio del autor.
- El repositorio de Hugging Face registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elliotb/cactus-cnn
- Demo (Space): https://huggingface.co/spaces/elliotb/cactus-detection
- Código y reproducción: https://github.com/elliotbch/Cactus_detection
- Dataset de origen: competición «Aerial Cactus Identification» de Kaggle (proyecto VIGIA); no se proporciona URL directa en la información disponible.
