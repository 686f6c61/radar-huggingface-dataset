# dBenf/EarthJev

## Resumen

EarthJev es un modelo de visión-lenguaje especializado en teledetección, desarrollado por Domenico Benfenati, Antonio Maria Rinaldi y Cristian Tommasino en el DIETI de la Universidad de Nápoles Federico II. Se construye mediante un ajuste fino completo del backbone Qwen3.5-0.8B (1.110.804.544 parámetros) y responde preguntas tipadas sobre parches multiespectrales Sentinel-2 L2A de 12 bandas, devolviendo una probabilidad para cada opción declarada en lugar de generar texto libre.

Su innovación principal es el mecanismo de respuesta: la probabilidad de cada opción se lee directamente de los logits de las letras de opción en una única posición, sin decodificación autoregresiva. Esto garantiza que toda respuesta sea una opción válida, reduce la latencia (19,9 ms por pregunta frente a 134,7 ms del modelo base generativo) y permite compartir una sola codificación de la imagen entre varias preguntas del mismo parche.

Es relevante porque demuestra que un modelo de 0,8B con entrada multiespectral completa puede igualar en precisión a modelos de 2B y 4B con entrada RGB en tareas de clasificación de cobertura terrestre, con una calibración muy superior (ECE de 0,006). Está pensado para investigación en modelos de decisión y VQA para observación de la Tierra, no para uso operacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision encoder + LLM) basado en Qwen3.5-0.8B, con cabeza de clasificación sobre logits de letras de opción |
| Parametros totales | 1.110.804.544 (aproximadamente 1,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

EarthJev parte de Qwen3.5-0.8B y se ajusta completamente con la receta abierta OneJev: entropía cruzada más pérdida de Brier sobre las letras de opción, con las opciones permutadas, una época y tasa de aprendizaje de 5e-6. La modificación arquitectónica clave está en el codificador visual: la capa de entrada se amplía de 3 a 12 canales, copiando los kernels RGB sobre las bandas B04, B03 y B02, mientras que las nueve bandas restantes se inicializan a cero. Esta capa de entrada es la única parte entrenada del codificador.

El entrenamiento utiliza 70.890 preguntas CORINE generadas a partir del 5% de BigEarthNet v2.0, correspondientes a 11.893 parches de 120×120 píxeles de diez países europeos (2017-2018). Se entrenaron tres semillas y este checkpoint es la semilla 0, seleccionada por precisión de validación (85,63% sobre 36.698 preguntas). Las temperaturas de calibración por tipo de pregunta y número de opciones se ajustaron sobre el conjunto de validación y se distribuyen en `calibration.json`.

La inferencia requiere el motor de OneJev (`pip install "qev @ git+https://github.com/OmniJev/OneJev"`) junto con transformers con soporte para Qwen3.5. La entrada es un array `[12, H, W]` con las bandas B01, B02, B03, B04, B05, B06, B07, B08, B8A, B09, B11 y B12 a 10 m (las de 20 m y 60 m remuestreadas por repetición de píxel), en números digitales tal como se distribuyen (reflectancia × 10.000).

## Capacidades

- Respuesta a preguntas tipadas con opciones declaradas: sí/no (noul), elección entre K opciones (choice) y niveles ordenados.
- Salida de probabilidad calibrada por opción, sin generación de texto libre.
- Procesamiento de las 12 bandas espectrales de Sentinel-2 L2A, no solo RGB.
- Reutilización de una única codificación de imagen para múltiples preguntas sobre el mismo parche.
- Clasificación de cobertura terrestre según taxonomía CORINE (superficies artificiales, áreas agrícolas, bosque y áreas seminaturales, humedales, cuerpos de agua).
- Detección de presencia de clases concretas (por ejemplo, tejido urbano).
- Capacidad multilingüe: no disponible (solo inglés).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible.
- Modo thinking, visión general, audio: no disponible (la visión está restringida a parches multiespectrales Sentinel-2).

## Casos de uso

- Clasificación de cobertura terrestre a escala regional: el modelo responde preguntas de elección sobre la clase dominante de un parche Sentinel-2, con probabilidades calibradas que permiten umbrales de confianza en pipelines de cartografía.
- Control de calidad de productos CORINE: dado un parche y la etiqueta asignada, se pueden formular preguntas de verificación y usar la probabilidad devuelta para marcar discrepancias.
- Detección de presencia de clases específicas: preguntas de tipo noul ("¿hay tejido urbano en este parche?") para cribar grandes volúmenes de teselas antes de un análisis más costoso.
- Evaluación de calibración en modelos de decisión: el ECE de 0,006 y las temperaturas publicadas permiten usar EarthJev como referencia en estudios de incertidumbre en VQA de teledetección.
- Procesamiento por lotes de bajo coste: con 42,8 ms por imagen (6,1 preguntas de media en una sola petición) en una H100 PCIe, es viable procesar conjuntos de validación completos en tiempos reducidos.
- Investigación sobre entrada multiespectral: sirve de base para estudiar el valor de las bandas no RGB (sustituirlas por su media de entrenamiento cuesta 4,5 puntos en CORINE).
- Prototipado de asistentes de consulta sobre parches: la API de `predict` acepta un diccionario de preguntas con instrucciones y criterios, lo que facilita integrarlo en cuadernos de análisis exploratorio.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todos los modelos se entrenaron con las mismas 70.890 preguntas CORINE (tres semillas) y se cronometraron en una H100 PCIe (batch 1, bfloat16). CORINE: 36.028 preguntas de test (media ± desviación entre semillas), ECE con 15 bins. RSVQAxBEN: 29.501 preguntas de presencia de otros autores, nunca usadas en entrenamiento.

| Modelo | Params | Entrada | CORINE acc. (%) | ECE | RSVQAxBEN acc. (%) | ms/pregunta | ms/imagen |
|---|---|---|---|---|---|---|---|
| EarthJev (este modelo) | 0,8B | 12 bandas | 86,0 ± 0,1 | 0,006 | 81,0 | 19,9 | 42,8 |
| Qwen3.5-0.8B, generativo | 0,8B | 12 bandas | 86,8 ± 0,2 | 0,005 | 80,5 | 134,7 | 191,9 |
| Qwen3-VL-2B, LoRA | 2,1B | RGB | 86,6 ± 0,1 | 0,005 | 80,6 | 111,6 | 176,2 |
| InternVL3-2B, LoRA | 2,1B | RGB | 87,1 ± 0,0 | 0,006 | 81,2 | 84,5 | 157,3 |
| EarthDial-4B, LoRA | 4,2B | RGB | 89,5 ± 0,1 | 0,006 | 82,4 | 171,8 | 431,6 |
| ResNet-50 VQA* | 0,14B | 12 bandas | 87,5 ± 0,2 | 0,089 | 79,4 | 12,1 | 14,9 |
| Swin-T VQA* | 0,15B | 12 bandas | 86,5 ± 0,1 | 0,047 | 79,6 | 16,2 | 17,9 |
| MambaVision-T VQA* | 0,15B | 12 bandas | 85,9 ± 0,3 | 0,064 | 78,4 | 15,3 | 18,6 |

\* Modelos VQA de vocabulario fijo, incluidos como referencia del coste de un modelo que solo responde a las preguntas y opciones con las que fue entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,1B parámetros en bfloat16 el peso ronda los 2,2 GB (tamaño del repositorio), más memoria para activaciones del codificador visual sobre parches de 120×120.
- GPU recomendadas: H100 PCIe es la referencia de las mediciones publicadas; cualquier GPU con al menos unos pocos GB de VRAM libre debería poder alojar los pesos en bfloat16.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4090), aunque no se publican mediciones específicas en consumer.
- Opciones de despliegue: transformers con soporte Qwen3.5 más el motor OneJev (`qev`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 19,9 ms por pregunta y 42,8 ms por imagen (6,1 preguntas de media) en H100 PCIe, batch 1, bfloat16, midiendo desde la imagen decodificada en memoria hasta la respuesta.

## Comparativa con modelos similares

| Modelo | Params | Entrada | CORINE acc. (%) | RSVQAxBEN acc. (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EarthJev | 0,8B | 12 bandas | 86,0 ± 0,1 | 81,0 | Apache 2.0 | Hugging Face (dBenf/EarthJev) |
| Qwen3-VL-2B, LoRA | 2,1B | RGB | 86,6 ± 0,1 | 80,6 | no disponible en la información | no disponible |
| InternVL3-2B, LoRA | 2,1B | RGB | 87,1 ± 0,0 | 81,2 | no disponible en la información | no disponible |
| EarthDial-4B, LoRA | 4,2B | RGB | 89,5 ± 0,1 | 82,4 | no disponible en la información | no disponible |

EarthJev iguala o supera ligeramente en RSVQAxBEN a los modelos de 2B y queda por debajo de EarthDial-4B en CORINE, con una fracción del coste computacional y con entrada multiespectral completa.

## Limitaciones y advertencias

- Solo responde a preguntas con opciones declaradas; las peticiones abiertas ("describe este parche") no están soportadas.
- Entrenado con 11.893 parches de 120×120 píxeles de diez países europeos (2017-2018); la precisión fuera de esa distribución, con otros tamaños, productos (por ejemplo L1C) o tipos de pregunta no está establecida.
- En las preguntas de BigEarthNet.txt, cuyos tipos difieren de los de entrenamiento, la precisión cae a aproximadamente 60% en binarias y 40% en preguntas de cuatro opciones.
- Sustituir las nueve bandas no RGB por su media de entrenamiento cuesta 4,5 puntos en CORINE, lo que evidencia dependencia de la información espectral completa.
- No validado para uso operacional; el autor lo restringe a investigación.
- Riesgo de alucinación: no aplica en el sentido habitual porque no genera texto, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener condiciones adicionales que deben verificarse.
- Solo inglés; no hay soporte multilingüe documentado.
- Requiere el motor OneJev y una versión de transformers con soporte Qwen3.5, lo que limita la portabilidad a otros stacks de inferencia.
- El autor anuncia una nueva versión del modelo y una evaluación ampliada próximamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dBenf/EarthJev
- Repositorio de código: https://github.com/CosmoIknosLab/EarthJev
- Paper: https://arxiv.org/abs/2611.02096
- Receta de entrenamiento OneJev: https://github.com/OmniJev/OneJev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset BigEarthNet v2.0 (BIFOLD-BigEarthNetv2-0/BigEarthNet.txt): referenciado en la model card, sin URL directa en la información disponible.
