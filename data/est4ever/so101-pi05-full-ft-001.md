# est4ever/so101-pi05-full-ft-001

## Resumen

SO-101 π0.5 full fine-tuning — run 001 es un checkpoint de robótica derivado de `lerobot/pi05_base`, publicado por el usuario est4ever en Hugging Face. Se trata de un ajuste fino completo de todos los parámetros (4.143.404.816) del modelo base π0.5 mediante el objetivo nativo de flow-matching, entrenado sobre seis grabaciones de demostración LeRobot v3.0 a 30 FPS para el brazo robótico SO-101. El autor declara explícitamente que se usó gradiente convencional con AdamW y no técnicas de edición directa de pesos ni LoRA.

El modelo resuelve el problema de adaptar un modelo de política visomotora general (visión-lenguaje-acción) a tareas concretas de manipulación con un robot de bajo coste: recoger bloques azules y verde lima, colocarlos en contenedores y manipular objetos naranjas. Es relevante porque documenta de forma inusualmente rigurosa el linaje, las revisiones exactas, las semillas y la configuración de entrenamiento, lo que facilita la reproducibilidad en investigación robótica.

La información disponible es limitada: no hay evaluación de rendimiento físico ni benchmarks publicados, el modelo no declara `inference: true` y el repositorio ocupa 16,6 GB. La licencia es Gemma, heredada del modelo base, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (visión-lenguaje-acción, flow-matching) sobre base PaliGemma; implementación LeRobot |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint nativo en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (checkpoint nativo completo, no un parche) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` (revisión `22c30e5b34f9e7ab738b1b34fc2fc5ecfe2d28f0`) y emplea la implementación de LeRobot en la revisión `d490e472a5d1a207cfe0255caaaf74b6d66e4656`. La arquitectura es un modelo de política visomotora π0.5 con tokenizador PaliGemma (revisión `35e4f46485b4d07967e7e9935bc3786aad50687c`) y objetivo nativo de flow-matching: error cuadrático de velocidad sobre seis canales de acción reales y pasos de episodio válidos. Los pesos base tienen SHA-256 `0eb11ca9587678c1d2ef8cf32807c29f8ce53a2bfdfc1aa4a4c96f16fca59b0f` y el checkpoint resultante `0759aaa07f7b604c48985147ec31336f4f95e7c5f1156b89942cda1398ab64d4`.

El entrenamiento consistió en 3.000 actualizaciones del optimizador sobre 205 episodios (106.942 fotogramas) de seis datasets, con 24.000 fragmentos observación/acción muestreados (no ejemplos distintos). Se usó AdamW (betas 0.9/0.95, epsilon 1e-8, weight decay 0.01, clipping 1.0), microbatch 1 con acumulación 8 (lote efectivo 8), tasa de aprendizaje máxima 2,5e-5 y final 2,5e-6 con scheduler coseno con calentamiento (100 pasos de warmup, 3.000 de decaimiento), precisión FP32 en pesos y estados con autocast BF16, checkpointing de activaciones y semilla 20261113. Se ejecutó en una NVIDIA A100 de 80 GB en Palmetto (Slurm 20296894, 3 h 58 min 32 s). Los 45 episodios de validación y 45 de test final quedaron excluidos del entrenamiento y del ajuste de normalización. Las entradas son dos cámaras RGB (base y muñeca izquierda; la muñeca derecha está enmascarada), redimensionadas con preservación de aspecto a 224×224 y escaladas a [-1,1]; seis canales de estado se normalizan por cuantiles.

## Capacidades

- Generación de acciones motoras de manipulación para el brazo SO-101 a partir de observaciones visuales e instrucción de tarea en inglés.
- Política visomotora con flow-matching para control continuo de seis canales de acción.
- Procesamiento de dos flujos de cámara RGB simultáneos (base y muñeca izquierda) con enmascaramiento del slot ausente.
- Ejecución de tareas de picking y colocación: bloque azul, bloque verde lima y objeto naranja.
- Condicionamiento por instrucción de tarea (las instrucciones grabadas se conservan en `profiles.json`).
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente en el sentido de un LLM.
- Capacidad multilingüe limitada al inglés (`language: en`).
- No se declara soporte de visión general, audio ni modo thinking; es un modelo específico de robótica.

## Casos de uso

- Pruebas de laboratorio con el brazo SO-101: el checkpoint está pensado para que el usuario lo ejecute en su propia instalación tras verificar el contrato de calibración y acción física, tal como indica el autor.
- Recogida de bloques azules y depósito en contenedor: el dataset `blue-block-out-bin` entrena explícitamente esta secuencia de pick-and-place.
- Manipulación de objetos verde lima en dos orientaciones: los datasets `limegreen-pickup` y `limegreen-opposite` cubren ambas variantes.
- Manipulación de objetos naranjas: el dataset `orange` aporta demostraciones específicas para esta categoría.
- Investigación en ajuste fino completo de políticas VLA: la configuración, semilla, linaje y revisiones publicadas permiten reproducir el entrenamiento en una sola A100 de 80 GB.
- Estudio de flow-matching aplicado a robótica: el objetivo nativo de error cuadrático de velocidad sobre acciones reales sirve como referencia para comparar con variantes LoRA o edición de pesos.
- Base para nuevos ajustes finos en tareas de manipulación con SO-101: al ser un checkpoint nativo completo con SHA-256 documentado, puede servir de punto de partida verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el rendimiento físico del robot no ha sido evaluado, que no se reclama tasa de éxito de recogida ni preparación para despliegue, y que no se ejecutó una evaluación de rendimiento offline separada para este checkpoint.

## Requisitos de hardware

- Entrenamiento documentado: una NVIDIA A100 de 80 GB, 8 CPUs y 128 GiB de RAM del sistema, con 3 h 58 min de tiempo transcurrido para 3.000 actualizaciones.
- VRAM de inferencia estimada: no disponible en la información proporcionada; el repositorio ocupa 16,6 GB en safetensors, lo que orienta sobre el orden de magnitud de los pesos en precisión original.
- GPU recomendadas: no disponible; el único dato documentado es la A100 80 GB usada para entrenar.
- Compatibilidad con GPU de consumo: no confirmada; no se publican variantes cuantizadas ni requisitos de inferencia.
- Opciones de despliegue: la librería declarada es LeRobot; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de política robótica).
- Latencia y throughput: no disponibles.
- Nota: la model card declara `inference: false`, por lo que no se garantiza que el checkpoint sea directamente ejecutable sin trabajo adicional de integración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| est4ever/so101-pi05-full-ft-001 | 4.143.404.816 | no disponible | sin benchmarks publicados | gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face (modelo base) |
| Alternativas de política robótica para SO-101 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El autor declara que el rendimiento físico del robot no ha sido evaluado y no se reclama preparación para despliegue.
- No se ejecutó ninguna evaluación de rendimiento offline para este checkpoint.
- La model card marca `inference: false`, lo que indica que la inferencia directa no está garantizada sin trabajo de integración.
- El contrato de acción y calibración física debe verificarse antes de cualquier prueba con el robot real.
- El objetivo flow-matching no utiliza todos los cabezales de salida de vocabulario: el recuento de parámetros habilitados no implica que todos los tensores reciban gradientes.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de acción, el riesgo se traslada a comportamientos motores incorrectos.
- Idiomas: solo inglés, lo que limita las instrucciones de tarea a ese idioma.
- Licencia Gemma: impone restricciones de uso comercial heredadas del modelo base; debe revisarse antes de cualquier despliegue productivo.
- Los datasets no se redistribuyen con el modelo; las licencias declaradas de cada dataset figuran en `dataset_revisions.json`.
- Las comprobaciones de duplicados no descartan duplicados visuales o alterados, solo grupos exactos o casi duplicados por umbral.
- El modelo se distribuye con 0 descargas y 0 likes, sin validación comunitaria conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/est4ever/so101-pi05-full-ft-001
- Modelo base: https://huggingface.co/lerobot/pi05_base/tree/22c30e5b34f9e7ab738b1b34fc2fc5ecfe2d28f0
- Implementación LeRobot: https://github.com/huggingface/lerobot/tree/d490e472a5d1a207cfe0255caaaf74b6d66e4656
- Dataset blue_block_in: https://huggingface.co/datasets/Fall3nAngelz/blue_block_in/tree/8cf8f1fc7e1ec1e1389d964491092c56c13201ed
- Dataset record-test: https://huggingface.co/datasets/Fall3nAngelz/record-test_20261007_162025_20261007_173514/tree/9fe75e5cbf71736364a829ee7d613c9b2df5983f
- Dataset blue-block-out-bin: https://huggingface.co/datasets/Fall3nAngelz/blue-block-out-bin/tree/df1e0f48b68ca4abbe7f60391d13382fdb06ebe5
- Dataset limegreen-pickup: https://huggingface.co/datasets/Fall3nAngelz/limegreen-pickup/tree/7121446d793e11d54f53e2500267ddda2f38bdb8
- Dataset limegreen-opposite: https://huggingface.co/datasets/Fall3nAngelz/limegreen-opposite/tree/54055097418b991fbbea045bfbe0b23dd731db7a
- Dataset orange: https://huggingface.co/datasets/Fall3nAngelz/orange/tree/dbef373a446ee0364161a3148d93e1a4321aa4c4
- Paper de referencia (arXiv 2504.16054): https://arxiv.org/abs/2504.16054
