# dBenf/EarthJev

## Resumen

EarthJev es un modelo de visión-lenguaje especializado en teledetección, desarrollado por Domenico Benfenati, Antonio Maria Rinaldi y Cristian Tommasino en el DIETI de la Universidad de Nápoles Federico II. Se construye sobre el backbone Qwen3.5-0.8B mediante un fine-tuning completo y responde preguntas tipadas sobre parches multiespectrales Sentinel-2 L2A: cada pregunta declara sus opciones (sí/no, una entre K, o un nivel ordenado) y el modelo devuelve una probabilidad para cada opción leyendo los logits de las letras de opción en una única posición. No genera texto, de modo que toda respuesta es una opción válida por construcción y varias preguntas sobre el mismo parche comparten una sola codificación de la imagen.

La innovación principal es doble: por un lado, la capa de entrada del codificador visual se ensancha de 3 a 12 canales para ingerir las 12 bandas de Sentinel-2 (los kernels RGB se copian a B04, B03 y B02, y el resto arranca a cero); por otro, el paradigma de respuesta tipada elimina la decodificación autoregresiva, lo que reduce la latencia por pregunta de forma drástica frente a alternativas generativas del mismo tamaño.

El checkpoint publicado corresponde a la semilla 0 de tres, seleccionado por precisión de validación (85,63% sobre 36.698 preguntas). Es relevante ahora porque demuestra que un modelo de 0,8B con 12 bandas puede igualar en precisión a modelos generativos de 2B a 4B en RGB, con calibración muy superior (ECE de 0,006) y un coste de inferencia entre 4 y 10 veces menor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) sobre Qwen3.5-0.8B, con codificador visual de entrada ensanchada a 12 canales y cabeza de decisión tipada sobre logits de letras de opción |
| Parametros totales | 1.110.804.544 (1,11B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el repo no documenta cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EarthJev parte de Qwen3.5-0.8B, un transformer multimodal, y se somete a un fine-tuning completo con la receta abierta OneJev. La función de pérdida combina entropía cruzada y término de Brier sobre las letras de opción, con las opciones permutadas en cada ejemplo, una sola época y tasa de aprendizaje de 5e-6. El codificador visual modifica únicamente su primera capa: los kernels de entrada RGB se copian a las bandas B04, B03 y B02, y las nueve bandas restantes arrancan a cero; esta capa es la única parte entrenada del encoder, mientras el resto del backbone se ajusta de forma completa.

El conjunto de entrenamiento son 70.890 preguntas CORINE generadas a partir del 5% de BigEarthNet v2.0 (reBEN), correspondientes a 11.893 parches de 120×120 píxeles de diez países europeos entre 2017 y 2018. La entrada es un array `[12, H, W]` con las bandas B01, B02, B03, B04, B05, B06, B07, B08, B8A, B09, B11 y B12 a 10 m (las de 20 m y 60 m remuestreadas por repetición de píxel), en números digitales tal y como se distribuyen (reflectancia × 10.000). Se incluye un fichero `calibration.json` con temperaturas por tipo de pregunta y número de opciones, ajustadas sobre el conjunto de validación (choice:15 1.027, choice:2 0.991, choice:4 1.136, choice:5 1.025, noul:2 1.024). No se documenta RLHF ni DPO.

## Capacidades

- Respuesta a preguntas tipadas de tipo sí/no (`noul`), elección única entre K opciones (`choice`) y niveles ordenados, devolviendo una distribución de probabilidad sobre todas las opciones declaradas.
- Comprensión de parches multiespectrales Sentinel-2 L2A con las 12 bandas a la vez, no solo RGB.
- Clasificación de cobertura terrestre según las cinco clases de primer nivel de CORINE (superficies artificiales, áreas agrícolas, bosques y áreas seminaturales, humedales y cuerpos de agua).
- Detección de presencia de clases específicas (por ejemplo, tejido urbano) mediante preguntas binarias.
- Calibración probabilística explícita: las probabilidades están ajustadas por temperatura para cada tipo de pregunta y número de opciones.
- Reutilización de la codificación de imagen entre varias preguntas sobre el mismo parche, con el consiguiente ahorro de cómputo.
- Capacidad conversacional limitada al formato de preguntas tipadas; no admite peticiones abiertas como "describe esta imagen".
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible.
- Capacidades de audio o vídeo: no disponible.

## Casos de uso

- Monitorización de cobertura terrestre a escala regional: el modelo clasifica parches Sentinel-2 en las cinco clases CORINE con una precisión del 86% y un ECE de 0,006, lo que permite agregar probabilidades calibradas sobre mosaicos grandes para estimar superficies con intervalos de confianza.
- Detección de expansión urbana: mediante preguntas binarias del tipo "¿hay tejido urbano en este parche?", se puede construir un pipeline de seguimiento temporal que compare la probabilidad de presencia urbana entre fechas sobre el mismo tile.
- Validación de productos de clasificación existentes: las probabilidades por opción permiten marcar parches donde el modelo está poco seguro y priorizar la revisión manual o el reetiquetado, algo que un clasificador de vocabulario fijo no ofrece con la misma calibración.
- Sistemas de alerta de cambios en humedales y cuerpos de agua: la capacidad de consultar varias preguntas por imagen en una sola pasada (42,8 ms por imagen con 6,1 preguntas de media en una H100) hace viable el barrido de series temporales densas.
- Investigación en modelos de decisión para teledetección: el checkpoint sirve como referencia reproducible para estudiar calibración, paradigmas de respuesta tipada y el efecto de las bandas no visibles (sustituir las nueve bandas no RGB por su media de entrenamiento cuesta 4,5 puntos en CORINE).
- Prototipado de asistentes de anotación geoespacial: integrado en una herramienta de etiquetado, el modelo propone la clase dominante y la probabilidad asociada para que el anotador confirme o corrija, reduciendo el tiempo por parche.
- Evaluación comparativa de backbones visuales en teledetección: al estar disponible el código de entrenamiento (OneJev) y las recetas, se puede reentrenar con otras bandas o resoluciones para estudiar transferencia.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todos los modelos se entrenaron con las mismas 70.890 preguntas CORINE y se midieron en una única H100 PCIe (batch 1, bfloat16); CORINE corresponde a 36.028 preguntas de test (media ± desviación sobre semillas), ECE con 15 bins, y RSVQAxBEN a 29.501 preguntas de presencia de otros autores nunca usadas en entrenamiento. *ms / imagen* agrupa todas las preguntas de una imagen (6,1 de media) en una sola petición.

| Modelo | Params | Entrada | CORINE acc. (%) | ECE | RSVQAxBEN acc. (%) | ms / pregunta | ms / imagen |
|---|---|---|---|---|---|---|---|
| EarthJev (este modelo) | 0,8B | 12 bandas | 86,0 ± 0,1 | 0,006 | 81,0 | 19,9 | 42,8 |
| Qwen3.5-0.8B generativo | 0,8B | 12 bandas | 86,8 ± 0,2 | 0,005 | 80,5 | 134,7 | 191,9 |
| Qwen3-VL-2B, LoRA | 2,1B | RGB | 86,6 ± 0,1 | 0,005 | 80,6 | 111,6 | 176,2 |
| InternVL3-2B, LoRA | 2,1B | RGB | 87,1 ± 0,0 | 0,006 | 81,2 | 84,5 | 157,3 |
| EarthDial-4B, LoRA | 4,2B | RGB | 89,5 ± 0,1 | 0,006 | 82,4 | 171,8 | 431,6 |
| ResNet-50 VQA* | 0,14B | 12 bandas | 87,5 ± 0,2 | 0,089 | 79,4 | 12,1 | 14,9 |
| Swin-T VQA* | 0,15B | 12 bandas | 86,5 ± 0,1 | 0,047 | 79,6 | 16,2 | 17,9 |
| MambaVision-T VQA* | 0,15B | 12 bandas | 85,9 ± 0,3 | 0,064 | 78,4 | 15,3 | 18,6 |

\* Modelos VQA de vocabulario fijo: referencia del coste de un modelo que solo responde a las preguntas y opciones con las que fue entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 1,11B parámetros, en bfloat16 los pesos ocupan aproximadamente 2,2 GB, a los que hay que sumar activaciones y el codificador visual; en cuantización de 8 bits o 4 bits el peso se reduciría a alrededor de 1,1 GB o 0,6 GB respectivamente, aunque el autor no documenta cuantizaciones soportadas.
- GPU recomendadas: el autor reporta mediciones en una H100 PCIe. Por tamaño, cualquier GPU con 8 GB o más de VRAM debería poder ejecutar el modelo en bfloat16; no se han publicado mediciones en otras GPU.
- GPU de consumo: cabe previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de 8 GB en bfloat16 ajustado; no confirmado por el autor.
- Opciones de despliegue: `transformers` con soporte de Qwen3.5, `torch` y el motor de OneJev (`pip install "qev @ git+https://github.com/OmniJev/OneJev"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el paradigma de respuesta tipada probablemente requiere el motor específico.
- Latencia y throughput: 19,9 ms por pregunta y 42,8 ms por imagen (6,1 preguntas de media) en H100 PCIe, batch 1, bfloat16, medidos desde la imagen decodificada en memoria hasta la respuesta. Frente a Qwen3.5-0.8B generativo es 6,8× más rápido por pregunta y 4,5× por imagen.

## Comparativa con modelos similares

| Modelo | Params | Entrada | Contexto | CORINE acc. (%) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| EarthJev | 0,8B | 12 bandas | No disponible | 86,0 | 0,006 | Apache-2.0 | Hugging Face (dBenf/EarthJev) |
| Qwen3.5-0.8B generativo (misma receta) | 0,8B | 12 bandas | No disponible | 86,8 | 0,005 | Apache-2.0 | Hugging Face (Qwen/Qwen3.5-0.8B) |
| Qwen3-VL-2B con LoRA | 2,1B | RGB | No disponible | 86,6 | 0,005 | No disponible | Hugging Face |
| InternVL3-2B con LoRA | 2,1B | RGB | No disponible | 87,1 | 0,006 | No disponible | Hugging Face |
| EarthDial-4B con LoRA | 4,2B | RGB | No disponible | 89,5 | 0,006 | No disponible | Hugging Face |

La comparación relevante es con el Qwen3.5-0.8B generativo entrenado con la misma receta: la precisión es prácticamente idéntica (86,0 frente a 86,8), pero EarthJev es entre 4,5 y 6,8 veces más rápido y ofrece la garantía de que toda respuesta es una opción válida. Frente a modelos de 2B y 4B en RGB, la precisión es comparable o ligeramente inferior, con la ventaja de usar las 12 bandas y de un coste de inferencia mucho menor.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso operativo.
- Entrenado solo con 11.893 parches de 120×120 píxeles de diez países europeos (2017-2018) y con preguntas generadas a partir de CORINE Land Cover (unidad mínima de 25 ha); la precisión fuera de esta distribución, en otros tamaños, en productos L1C u otros tipos de pregunta no está establecida.
- En las preguntas de BigEarthNet.txt, cuyos tipos difieren de los de entrenamiento, la precisión cae a aproximadamente el 60% en binarias y el 40% en preguntas de cuatro opciones.
- Solo acepta preguntas con opciones declaradas; las peticiones abiertas ("describe esta imagen") quedan fuera de la interfaz del modelo.
- El modelo no genera texto: no puede usarse como chatbot general ni para explicar sus respuestas en lenguaje natural.
- Solo soporta inglés.
- Sustituir las nueve bandas no RGB por su media de entrenamiento cuesta 4,5 puntos de precisión en CORINE, lo que indica una dependencia fuerte de las bandas multiespectrales y una degradación clara si se alimenta solo con RGB.
- La calibración depende de las temperaturas del fichero `calibration.json`; usarlo sin aplicar esas temperaturas puede degradar la fiabilidad de las probabilidades.
- Riesgo de sesgo geográfico y temporal por la cobertura limitada a diez países europeos y a los años 2017-2018.
- Licencia Apache-2.0 en los pesos, pero los datos de entrenamiento y test (BigEarthNet v2.0 y BigEarthNet) tienen sus propias condiciones que deben respetarse.
- No se documentan requisitos de hardware distintos de la H100, ni soporte para motores de despliegue estándar como vLLM u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dBenf/EarthJev
- Código: https://github.com/CosmoIknosLab/EarthJev
- Paper: https://arxiv.org/abs/2611.02096
- Receta de entrenamiento OneJev: https://github.com/OmniJev/OneJev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset BigEarthNet v2.0 (reBEN): https://huggingface.co/datasets/BIFOLD-BigEarthNetv2-0/BigEarthNet.txt
