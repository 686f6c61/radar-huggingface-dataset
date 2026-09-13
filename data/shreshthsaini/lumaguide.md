# shreshthsaini/LumaGuide

## Resumen

LumaGuide es un metodo de guiado en tiempo de muestreo (training-free) para generar imagenes HDR con modelos de difusion, desarrollado por Bowen Chen, Shreshth Saini, Balu Adsumilli y Alan C. Bovik. El repositorio de HuggingFace no contiene un modelo generativo completo, sino los activos auxiliares del metodo: un regresor de histograma de luminancia a partir del texto (270.880 parametros) y los 100 prompts de prueba empleados en el paper. La generacion real la realiza FLUX.1-dev como modelo base, sobre el que LumaGuide actua como adaptador sin modificar sus pesos.

La innovacion consiste en formular el HDR como un problema de ajuste de distribucion: se define una funcion de energia diferenciable sobre el histograma de luminancia en espacio PQ de la imagen generada y se minimiza una perdida Wasserstein-1 que se retropropaga a traves del decodificador VAE de FLUX.1-dev durante el muestreo. El transformer de difusion nunca se entrena ni se modifica, de ahi la etiqueta "training-free".

Es relevante porque permite obtener salidas HDR de alto rango dinamico reutilizando un modelo texto-a-imagen preentrenado, sin necesidad de datasets HDR emparejados ni de reentrenamiento. Sus limitaciones practicas principales son el coste de VRAM (unos 30 GB a 512x512 por el backward del VAE) y la dependencia de FLUX.1-dev, cuya licencia es no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresor: MLP de 3 capas (768 a 256 a 256 a 32, activacion GELU) sobre el embedding de texto agrupado de openai/clip-vit-large-patch14. Guiado: energia diferenciable sobre el histograma de luminancia en espacio PQ, retropropagada por el decodificador VAE de FLUX.1-dev (transformer DiT congelado) |
| Parametros totales | 270.880 (solo el regresor; no incluye FLUX.1-dev) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el regresor consume un unico embedding CLIP agrupado de 768 dimensiones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la entrada de texto se procesa mediante el codificador CLIP de FLUX.1-dev) |
| Licencia | MIT para el regresor y los prompts; FLUX.1-dev se rige por la licencia no comercial de Black Forest Labs |
| Formato de pesos | .pt (checkpoint PyTorch con las claves config y model_state) |
| Modelo base | black-forest-labs/FLUX.1-dev (relacion: adapter) |
| Tamano del repositorio | 0,0 GB en el hub; el checkpoint regressor.pt ocupa 1,1 MB |
| Pipeline declarado | text-to-image |
| Libreria | pytorch |
| Salida del regresor | Distribucion softmax sobre 32 bins de luminancia PQ |

## Arquitectura y entrenamiento

El repositorio contiene dos elementos. El primero es `regressor.pt`, un perceptron multicapa de tres capas (768 a 256 a 256 a 32) con activacion GELU que toma el embedding de texto agrupado del modelo `openai/clip-vit-large-patch14` y produce una distribucion softmax sobre 32 bins de luminancia en espacio PQ. Con 270.880 parametros y 1,1 MB, actua como fuente de histograma objetivo cuando se invoca el guiado con `--target regressor`. El segundo es `test_prompts.csv`, con los 100 prompts HDR usados en el paper junto con su anchura y altura de generacion.

El mecanismo de guiado no reside en este repositorio, sino en el codigo de GitHub: alli viven las utilidades de luminancia PQ y los hooks del muestreador de FLUX.1-dev. La tecnica consiste en definir una funcion de energia basada en la distancia entre el histograma de luminancia PQ de la imagen decodificada y el histograma objetivo, y minimizarla con una perdida Wasserstein-1 cuyo gradiente se propaga hacia atras a traves del decodificador VAE de FLUX.1-dev en cada paso de muestreo. El transformer de difusion permanece congelado y no se aplica ningun ajuste fino, destilacion ni entrenamiento adicional sobre el modelo base; el unico componente entrenado es el regresor de histogramas.

No se especifican en la informacion disponible el numero de tokens de entrenamiento del regresor, la composicion del dataset con el que se entreno, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla el esquema de muestreo concreto (numero de pasos, scheduler o escala de guiado) mas alla de que el guiado actua en tiempo de muestreo. El paper asociado es arXiv:2607.26237.

## Capacidades

- Generacion de imagenes HDR guiada por texto: ajusta la distribucion de luminancia de la salida de FLUX.1-dev al histograma objetivo, sin reentrenar el modelo base.
- Prediccion de histograma de luminancia a partir de una descripcion textual: el regresor mapea el embedding CLIP agrupado a una distribucion sobre 32 bins PQ.
- Guiado sin entrenamiento (training-free): se aplica en tiempo de muestreo sobre un checkpoint preentrenado, por lo que puede combinarse con distintos prompts sin reentrenamiento.
- Retropropagacion diferenciable por el decodificador VAE: permite calcular gradientes sobre una imagen decodificada y usarlos como senal de guiado.
- Control de la distribucion tonal: al fijar el histograma objetivo, el metodo permite dirigir el balance de luminancias en lugar de dejar que lo determine solo el prompt.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues especificas mas alla de las del codificador de texto de FLUX.1-dev.
- No es un modelo de lenguaje, de vision por computador general ni multimodal; su unica tarea declarada es text-to-image con guiado HDR.

## Casos de uso

- Postproduccion audiovisual: aplicar LumaGuide durante el muestreo para obtener plates HDR con un balance de luminancia controlado, util en tareas de previsualizacion o matte painting donde se necesita rango dinamico alto desde la fase generativa.
- Fotografia computacional e investigacion en tone mapping: generar pares HDR de referencia a partir de prompts para evaluar operadores de tone mapping y metricas de calidad sin depender de capturas fisicas.
- Sintesis de datos de entrenamiento HDR: producir imagenes con histogramas de luminancia conocidos y etiquetados (32 bins PQ) para aumentar datasets de modelos de reconstruccion o de prediccion de iluminacion.
- Investigacion en guiado por energia: el codigo sirve como implementacion de referencia de ajuste de distribucion mediante perdida Wasserstein-1 retropropagada por un VAE, reutilizable para otras caracteristicas distintas de la luminancia.
- Creacion de cielos y entornos para videojuegos o render en tiempo real: generar skyboxes o HDRI de fondo con un rango tonal especificado, partiendo de una descripcion textual y un histograma objetivo.
- Evaluacion reproducible con prompts fijos: los 100 prompts de `test_prompts.csv` incluyen dimensiones de generacion, lo que permite comparar variantes del metodo o distintos hiperparametros de guiado bajo condiciones identicas.
- Estudio de la relacion texto-luminancia: el regresor caption-a-histograma puede usarse de forma aislada para analizar que distribuciones tonales asocia un codificador CLIP a determinadas descripciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas, metricas cuantitativas (PSNR, HDR-VDP, LPIPS ni similares) ni comparaciones numericas frente a otros metodos; unicamente referencia el paper arXiv:2607.26237 como fuente de los resultados. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 30 GB a 512x512 con FLUX.1-dev, segun el autor, debido al backward del decodificador VAE que exige el guiado.
- GPU recomendadas por el propio requisito de memoria: A100 de 40 GB o 80 GB, H100, L40S (48 GB), RTX 6000 Ada (48 GB) o A6000 (48 GB).
- GPU de consumo: una RTX 4090 con 24 GB no dispondria de margen suficiente a 512x512 segun la cifra indicada. No se documentan resultados a resoluciones menores ni con cuantizacion, por lo que no puede confirmarse su viabilidad en GPU de consumo.
- Opciones de despliegue: ejecucion mediante el script `lumaguide.py` del repositorio de GitHub, con FLUX.1-dev descargado aparte desde HuggingFace (modelo con acceso restringido que exige aceptar la licencia). Depende de PyTorch y de los hooks del muestreador de Flux incluidos en el repositorio. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, dado que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: el checkpoint del regresor ocupa 1,1 MB; el peso principal corresponde a FLUX.1-dev, que debe descargarse por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LumaGuide (regresor + guiado) | 270.880 en el regresor; FLUX.1-dev completo por separado | No disponible | No disponible (sin benchmarks publicados en la informacion) | MIT para el regresor y los prompts; FLUX.1-dev no comercial | Repositorio en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| FLUX.1-dev sin guiado | No disponible en la informacion proporcionada | No disponible | No disponible | Licencia no comercial de Black Forest Labs | Modelo base ampliamente distribuido en HuggingFace, con acceso restringido |
| Otros metodos de generacion HDR con difusion | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos verificables para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no incluye el modelo generativo: solo el regresor y los prompts. La funcionalidad completa requiere clonar el repositorio de GitHub y descargar FLUX.1-dev aparte.
- Dependencia de licencia: aunque el regresor y los prompts se publican bajo MIT, el pipeline completo usa FLUX.1-dev, sujeto a la licencia no comercial de Black Forest Labs. Esto restringe el uso comercial del sistema en su conjunto.
- Requisito de memoria elevado: unos 30 GB de VRAM a 512x512, lo que excluye GPU de consumo habituales sin una reduccion de resolucion o de precision no documentada.
- Riesgo de artefactos y de alucinacion visual inherente a los modelos de difusion; la model card no documenta evaluaciones de fidelidad, coherencia semantica ni tasas de fallo.
- Granularidad tonal limitada: el objetivo se representa como una distribucion sobre solo 32 bins de luminancia PQ, lo que restringe la precision del control sobre el histograma.
- Sesgos: no se documenta ningun analisis de sesgos demograficos, culturales o de composicion del dataset del modelo base.
- Idiomas: no se especifican idiomas soportados; el comportamiento multilingue dependera del codificador de texto de FLUX.1-dev.
- Validacion limitada: el conjunto de evaluacion publico consta de 100 prompts y el repositorio presenta 0 descargas y 0 likes, sin evidencia de uso o replicacion por terceros en el momento de la consulta.
- Ausencia de cuantizaciones publicadas: no hay versiones GGUF, AWQ, GPTQ ni INT8 del regresor ni del pipeline documentadas.
- Fechas de referencia: la model card indica creacion y actualizacion en septiembre de 2026 y el paper tiene identificador arXiv:2607.26237.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/shreshthsaini/LumaGuide
- Paper: https://arxiv.org/abs/2607.26237
- Codigo: https://github.com/shreshthsaini/LumaGuide
- Pagina del proyecto: https://shreshthsaini.github.io/LumaGuide/
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Codificador de texto empleado por el regresor: https://huggingface.co/openai/clip-vit-large-patch14
