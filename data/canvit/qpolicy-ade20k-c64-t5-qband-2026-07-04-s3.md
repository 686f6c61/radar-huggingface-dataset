# canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s3

## Resumen

`qpolicy-ade20k-c64-t5-qband-2026-07-04-s3` es una política de visión aprendida (learned viewing policy) para CanViT-B, el Canvas Vision Transformer desarrollado por el equipo de CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna), presentado en NeurIPS 2026. No es un modelo de lenguaje ni un generador de texto: es un componente de control que decide qué región de una escena debe observar a continuación un modelo de visión activa. El problema que resuelve es el de la selección eficiente de puntos de vista: en lugar de procesar una imagen completa de una sola vez, CanViT acumula observaciones parciales (glimpses) sobre un canvas y esta política decide, en cada paso, dónde mirar para maximizar la información útil para la segmentación semántica.

El checkpoint concreto es un agente entrenado mediante Q-learning sobre el conjunto de datos ADE20K (escenas de interiores y exteriores con 150 clases), con episodios de 5 glimpses y semilla 3. Trabaja sobre el modelo base congelado `canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02` y su sonda de segmentación ADE20K, también congelada. El resultado es una política ligera (5,67 millones de parámetros, 0,1 GB) que reduce la entropía cruzada de validación de 0,7649 tras el primer glimpse a 0,6650 tras el quinto.

Su relevancia actual radica en que ejemplifica un patrón emergente en visión por computador: modelos fundacionales que operan de forma activa y secuencial, con un coste computacional adaptativo, en lugar de procesar píxeles de forma exhaustiva. La ficha documenta un artefacto de investigación reproducible (MIT, pesos en safetensors, código de entrenamiento incluido en el repositorio) útil para quienes trabajan en visión activa, aprendizaje por refuerzo aplicado a percepción y eficiencia en segmentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de visión aprendida (Q-learning) sobre Canvas Vision Transformer (ViT con canvas de escena y glimpses secuenciales) |
| Parámetros totales | 5.674.904 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); escenas de 512 px, glimpses de 128 px, canvas de 64 × 64 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política opera sobre CanViT-B, un Vision Transformer de visión activa que construye una representación de escena sobre un canvas de 64 × 64 celdas. En cada paso, el modelo observa un glimpse de 128 px centrado en una posición y escala determinadas, y lo integra en el canvas. La política evaluada aquí es la componente de decisión: puntúa candidatos de punto de vista (centros en una rejilla de 16 × 16 para cada una de las escalas 0,5 y 0,25) a partir del estado del canvas y de la salida de segmentación que la sonda ADE20K lee del canvas, y selecciona el candidato de mayor puntuación. Está entrenada con Q-learning para elegir los puntos de vista cuyos glimpses reducen más la entropía cruzada de la sonda.

El entrenamiento se realizó sobre las escenas de entrenamiento de ADE20K con episodios de 5 glimpses y semilla 3; el registro completo del entrenamiento se conserva en el directorio `training_run/` del repositorio, tal como lo escribió el código original. El checkpoint seleccionado es el paso 5.000, elegido por presentar la menor entropía cruzada media de validación en ADE20K tras los glimpses elegidos por la política. El modelo base CanViT-B se preentrenó por destilación de DINOv3 y se mantiene congelado durante el entrenamiento de la política, igual que la sonda de segmentación.

## Capacidades

- Selección secuencial de puntos de vista: dado un estado de canvas, puntúa candidatos y elige el siguiente glimpse (centro y escala) para maximizar la reducción de incertidumbre de la sonda de segmentación.
- Rollout completo de episodios: la API `LearnedPolicy.rollout(scene, num_glimpses=5)` devuelve la secuencia de pasos con el punto de vista elegido en cada uno.
- Segmentación semántica derivada: tras el rollout, los logits del canvas (`policy.model.logits(...)`) producen un mapa de 64 × 64 con las 150 clases de ADE20K.
- Integración con un observador congelado: funciona exclusivamente junto con el CanViT-B y la sonda ADE20K con los que fue entrenada.
- Visión activa con coste adaptativo: permite controlar el número de glimpses, de modo que el coste de inferencia escala con la precisión deseada.
- No soporta tool calling, function calling, agentes de texto, razonamiento simbólico, matemáticas ni capacidades multilingües: es un componente de percepción visual, no un modelo generativo de lenguaje.

## Casos de uso

- Segmentación semántica con presupuesto de cómputo limitado: en lugar de procesar la imagen completa a alta resolución, se ejecuta un rollout de 3 a 5 glimpses sobre la escena y se lee el mapa de clases del canvas; útil en dispositivos con restricciones de memoria o ancho de banda.
- Investigación en visión activa: la política sirve como línea base reproducible (semilla 3, paso 5.000, registro de entrenamiento incluido) para comparar estrategias de selección de puntos de vista, como barridos sistemáticos o políticas aleatorias.
- Aprendizaje por refuerzo aplicado a percepción: el checkpoint y el código de `canvit-pytorch` permiten estudiar cómo una recompensa basada en entropía cruzada de una sonda moldea el comportamiento de exploración visual.
- Prototipado de pipelines de robótica o inspección: la selección adaptativa de regiones es aplicable a escenarios donde un sensor de alta resolución es caro y conviene decidir qué zona capturar a continuación.
- Evaluación de modelos fundacionales de visión: permite medir cuánta información semántica se recupera con un número fijo de observaciones parciales, un eje de evaluación complementario a la precisión con imagen completa.
- Docencia y reproducción de resultados: el tamaño reducido (0,1 GB) y la licencia MIT facilitan ejecutar el ejemplo de la model card en CPU y reproducir las cifras de validación publicadas.

## Benchmarks y rendimiento

La model card no incluye comparaciones con otros modelos, pero sí la curva de entropía cruzada media de validación en ADE20K tras cada glimpse elegido por la política:

| Glimpse | Entropía cruzada de validación |
|---|---|
| 1 | 0.7649 |
| 2 | 0.7142 |
| 3 | 0.6870 |
| 4 | 0.6731 |
| 5 | 0.6650 |

No se han publicado resultados de benchmarks comparativos (mIoU, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint pesa 0,1 GB y el ejemplo de la model card se ejecuta explícitamente en CPU (`torch.device("cpu")`). El consumo real lo domina el modelo observador CanViT-B y la sonda, no la política.
- GPU recomendadas: no disponibles en la información proporcionada; cualquier GPU con soporte de PyTorch suficiente para ejecutar CanViT-B debería servir.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna, dado el tamaño del checkpoint; no se especifican modelos concretos.
- Opciones de despliegue: librería `canvit-pytorch` (versión >= 0.3, instalable con `uv add`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de política comparables ni resultados de referencia de políticas alternativas (aleatoria, barrido sistemático u otras semillas) sobre el mismo observador.

## Limitaciones y advertencias

- Acoplamiento estricto al observador: la política solo es válida con el CanViT-B y la sonda ADE20K concretos con los que fue entrenada; no es transferible a otros backbones sin reentrenamiento.
- Dominio restringido: entrenada exclusivamente con escenas de ADE20K (interiores y exteriores con 150 clases); su comportamiento fuera de esa distribución no está caracterizado.
- Horizonte fijo: los episodios de entrenamiento son de 5 glimpses; el comportamiento con horizontes más largos no se ha validado.
- Sin datos de sesgo: no se documentan análisis de sesgo demográfico, geográfico o de clase, ni evaluación de riesgo de alucinación (concepto que, además, no aplica directamente a una política de selección de puntos de vista).
- Restricciones de licencia: el checkpoint es MIT, pero el modelo base CanViT se preentrenó por destilación de DINOv3, distribuido bajo la DINOv3 License; conviene revisar esa licencia antes de un uso comercial del pipeline completo.
- Artefacto de investigación: sin métricas de producción, sin garantías de latencia ni de robustez, y con solo 59 descargas en el momento de la consulta; no se recomienda como componente crítico sin validación propia.
- Idiomas: no aplica; el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s3
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Colección de checkpoints: https://huggingface.co/canvit
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Dataset ADE20K: https://huggingface.co/datasets/zhoubolei/scene_parse_150
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
