# Hermera/LayeredFlow

## Resumen

LayeredFlow es un conjunto de checkpoints preentrenados de flujo optico (optical flow) publicados por Hermera en Hugging Face, correspondientes al trabajo de investigacion "LayeredFlow: A Real-World Benchmark for Non-Lambertian Multi-Layer Optical Flow" de Hongyu Wen, Erich Liang y Jia Deng (ECCV 2024, Princeton Vision & Learning Lab). No se trata de un modelo de lenguaje, sino de pesos de vision por computador para estimar movimiento denso entre imagenes, incluyendo el caso complejo de escenas con multiples capas (por ejemplo, reflejos o transparencias) que rompen el supuesto lambertiano clasico.

El repositorio contiene siete checkpoints en formato PyTorch `.pth` que cubren dos familias de modelos: RAFT, para flujo optico de una sola capa, y MultiRAFT, una extension que predice cuatro capas de flujo simultaneamente. Los pesos son copias sin modificar del release original publicado por los autores, migradas desde Google Drive y verificadas mediante digests SHA-256. Su utilidad principal es reproducir los resultados del benchmark LayeredFlow y servir como inicializacion para investigacion en flujo optico multicapa.

El modelo es relevante para investigadores en vision por computador que trabajen con estimacion de movimiento en escenas no lambertianas, donde los metodos tradicionales fallan. El tamano reducido de los checkpoints (21 MB para RAFT, 34 MB para MultiRAFT) y su naturaleza de investigacion lo alejan de aplicaciones de produccion general, pero lo convierten en una referencia tecnica valiosa para el estado del arte en flujo optico multicapa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT (recurrent all-pairs field transforms) y MultiRAFT (extension multicapa de RAFT) |
| Parametros totales | no disponible (el tamano de los checkpoints es de 21,1 MB para RAFT y 34,1 MB para MultiRAFT) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en `.pth` de precision original) |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | BSD 3-Clause (heredada del repositorio original; la migracion no introduce terminos nuevos) |
| Formato de pesos | PyTorch `.pth` |

## Arquitectura y entrenamiento

RAFT es una arquitectura de flujo optico que combina un extractor de caracteristicas convolucional, un modulo de correlacion de costes (all-pairs correlation) y un refinador recurrente basado en GRU que actualiza iterativamente el campo de flujo. MultiRAFT extiende esta base para predecir cuatro capas de flujo optico en lugar de una sola, lo que permite modelar escenas con superficies reflectantes o transparentes donde coexisten multiples movimientos en el mismo pixel.

El checkpoint `raft-sintel.pth` corresponde al modelo RAFT entrenado sobre Sintel y se usa tambien como inicializacion de MultiRAFT. Los demas checkpoints (`first_layer_*.pth`, `last_layer_L.pth`, `MultiRAFT_*.pth`) son variantes afinadas o especializadas para los subconjuntos del benchmark LayeredFlow. El dataset asociado, LayeredFlow-Syn, es un conjunto sintetico de imagenes y anotaciones disponible en Hugging Face. La model card no detalla el numero de tokens ni la composicion exacta del dataset de entrenamiento, ni si se emplearon tecnicas de RLHF o DPO (no aplicables a un modelo de vision). Los scripts de evaluacion requieren un entorno con CUDA.

## Capacidades

- Estimacion de flujo optico denso de una sola capa (modelos RAFT) sobre los subconjuntos de primera y ultima capa del benchmark LayeredFlow.
- Estimacion de flujo optico multicapa (MultiRAFT), prediciendo cuatro capas de movimiento por pixel en escenas no lambertianas.
- Evaluacion sobre el benchmark LayeredFlow, con envio al test set a traves del sitio web del benchmark.
- Inicializacion de MultiRAFT a partir del checkpoint RAFT Sintel.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.
- No dispone de modo thinking, vision general, audio ni otras capacidades generativas fuera del flujo optico.

## Casos de uso

- Investigacion en flujo optico multicapa: usar MultiRAFT para reproducir los resultados del paper y comparar nuevas propuestas contra una linea base publicada, cargando los checkpoints con los scripts oficiales.
- Evaluacion de metodos en escenas no lambertianas: emplear los checkpoints RAFT de primera y ultima capa para medir el rendimiento en superficies reflectantes o transparentes donde los metodos clasicos fallan.
- Inicializacion de modelos propios: partir de `raft-sintel.pth` para entrenar variantes de MultiRAFT o arquitecturas derivadas, aprovechando que es el checkpoint de inicializacion oficial.
- Reproducibilidad de resultados academicos: validar publicaciones que citan LayeredFlow ejecutando los comandos de evaluacion documentados y comparando metricas.
- Generacion de datos sinteticos de entrenamiento: combinar los checkpoints con el dataset LayeredFlow-Syn para aumentar datos de entrenamiento en pipelines de investigacion.
- Desarrollo de sistemas de vision para robotica o conduccion en entornos con cristales y reflejos: integrar la estimacion multicapa como modulo de percepcion en prototipos de investigacion, siempre que se valide fuera del benchmark.
- Benchmarking interno de infraestructura CUDA: usar los scripts de evaluacion como prueba de humo para validar entornos con GPU y dependencias de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (arXiv:2409.05688) y al sitio web del benchmark para las metricas oficiales, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de los checkpoints (21-34 MB) el modelo es muy ligero y cabe holgadamente en cualquier GPU moderna, aunque el consumo real depende de la resolucion de entrada y del numero de iteraciones del refinador.
- GPU recomendadas: se requiere un entorno con CUDA; cualquier GPU NVIDIA con soporte CUDA es suficiente a nivel de memoria, si bien la latencia dependera de la resolucion y del modelo (RAFT o MultiRAFT).
- Cabe en GPU de consumo: si, previsiblemente en tarjetas como RTX 3060, RTX 4090 o superiores, dado el reducido tamano de los pesos.
- Opciones de despliegue: scripts oficiales del repositorio `princeton-vl/LayeredFlow` (PyTorch + CUDA); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LayeredFlow (RAFT / MultiRAFT) | 21,1 MB / 34,1 MB (checkpoints) | no aplica | Flujo optico mono y multicapa | BSD 3-Clause | Hugging Face + GitHub |
| RAFT original (princeton-vl) | no disponible | no aplica | Flujo optico de una capa | BSD 3-Clause | GitHub |
| Modelos de flujo optico clasicos (FlowNet, PWC-Net) | no disponible | no aplica | Flujo optico de una capa | varía | varía |

La comparativa se limita a la categoria de flujo optico; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no es un modelo de lenguaje ni un sistema generativo general; su uso esta acotado a la estimacion de flujo optico.
- Requiere entorno CUDA y los scripts oficiales del repositorio para su evaluacion; no hay pipeline de Hugging Face disponible.
- La licencia BSD 3-Clause se hereda del codigo original; la model card indica que la migracion no introduce terminos nuevos, pero recomienda consultar a los autores para el licenciamiento de los checkpoints.
- Riesgo de sobreajuste al benchmark LayeredFlow y al dataset sintetico LayeredFlow-Syn; el rendimiento en escenas reales fuera de distribucion no esta documentado.
- No se documentan sesgos especificos, pero al ser un modelo entrenado con datos sinteticos puede presentar limitaciones en condiciones de iluminacion, oclusiones o materiales no representados.
- No apto para produccion sin validacion adicional: no hay informacion sobre latencia, robustez ni mantenimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Hermera/LayeredFlow
- Repositorio oficial: https://github.com/princeton-vl/LayeredFlow
- Paper (arXiv): https://arxiv.org/abs/2409.05688
- Sitio web del benchmark: https://layeredflow.cs.princeton.edu/
- Dataset sintetico: https://huggingface.co/datasets/Hermera/LayeredFlow-Syn
- Release original (Google Drive): https://drive.google.com/drive/folders/1vB8wfeS1JpfTz-jKdiD_e_IM5Sn5Wztl
- Licencia original: https://github.com/princeton-vl/LayeredFlow/blob/main/LICENSE
- Guia de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
