# fastforks/teed

## Resumen

TEED (Tiny and Efficient Edge Detector) es una red neuronal convolucional de muy reducido tamano, con solo 58 000 parametros, disenada para la deteccion de bordes y la generacion de mapas de lineas a partir de una imagen RGB. El modelo original procede del trabajo de Soria et al. presentado en los workshops de ICCV 2023 y se distribuye habitualmente como preprocesador de ControlNet dentro de `controlnet_aux` (bajo el nombre `TEEDdetector`) y en ComfyUI como "TEED Soft-Edge Lines". Esta ficha corresponde al repositorio `fastforks/teed`, que no aloja pesos propios: actua como tarjeta de modelo y orquestador que descarga los pesos de los autores y los verifica mediante SHA-256.

El modelo resuelve un problema muy concreto y acotado: extraer un mapa de bordes suave a resolucion de entrada, con valores en el rango [0, 1] donde 1 indica linea. Sus cuatro salidas internas se promedian para producir un unico mapa de bordes que, por defecto, se cuantiza a unos pocos niveles. Es, por tanto, una pieza de preprocesado dentro de pipelines de image-to-image, especialmente util para condicionar modelos generativos (ControlNet y similares) con estructura de lineas.

Su relevancia actual radica en la eficiencia: al ser una CNN de 58 k parametros, se ejecuta en pocos milisegundos incluso a resoluciones altas (1080x1920) y con un consumo de memoria minimo, lo que la hace apta para entornos con recursos limitados o para preprocesado en tiempo real. La licencia del codigo es MIT y los pesos del checkpoint tambien se declaran MIT, aunque el conjunto de datos de entrenamiento (BIPED) tiene restricciones de uso no comercial que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red convolucional, segun la descripcion del autor; TEED de Soria et al., ICCV 2023 workshops) |
| Parametros totales | 58 000 (58 k) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (se ejecuta en fp16 por defecto; fp32 en CPU) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT (codigo y pesos del checkpoint); datos de entrenamiento BIPED con uso no comercial |
| Formato de pesos | `.pth` (PyTorch); los pesos no se alojan en el repo, se descargan del enlace del autor |
| Tamano de entrada | cualquier H x W >= 32, con padding a multiplo de 32 |
| Salida | mapa de bordes `[H, W]` float32 en [0, 1] a la resolucion de entrada |
| Backend | `portable` (no hay backend de kernels) |
| Pipeline | image-to-image |

## Arquitectura y entrenamiento

TEED es una red convolucional compacta de 58 k parametros. La model card indica que el modelo genera cuatro salidas que se promedian para construir un mapa de bordes suave, que despues se cuantiza a unos pocos niveles por defecto. No se detalla en la informacion disponible la estructura exacta de las capas, el numero de bloques ni los mecanismos internos mas alla de esta descripcion de alto nivel; el trabajo de referencia es Soria et al. (ICCV 2023 workshops).

El entrenamiento se realizo sobre el conjunto de datos BIPED (Barcelona Images for Perceptual Edge Detection), segun se recoge en la model card y en los enlaces de evidencia de licencia. No se especifican en la informacion proporcionada el numero de tokens (no aplica), el numero de imagenes, la composicion exacta del dataset ni si hubo etapas de refinamiento posteriores. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, logicas por otra parte en un modelo de este tipo y tamano.

## Capacidades

- Deteccion de bordes y generacion de mapas de lineas a partir de una unica imagen RGB.
- Produccion de un mapa de bordes suave `[H, W]` en [0, 1] a la resolucion de entrada, con 1 indicando linea.
- Cuantizacion por defecto de la salida a unos pocos niveles, orientada a su uso como condicionamiento.
- Uso como preprocesador de ControlNet (line art, HED, PiDiNet, TEED / Anyline) dentro de pipelines de image-to-image.
- Soporte de resoluciones arbitrarias siempre que H y W sean >= 32 y se rellenen a multiplo de 32.
- Ejecucion en fp16 por defecto en GPU y fp32 en CPU, con paridad verificada frente al codigo original.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingues, vision semantica, audio ni modo de pensamiento: es exclusivamente un extractor de bordes.

## Casos de uso

- Preprocesado para ControlNet: el modelo genera el mapa de bordes que se usa como condicionamiento de estructura en modelos de difusion image-to-image, sustituyendo al detector de bordes por defecto con una alternativa mas ligera y rapida.
- Line art para ilustracion y comics: a partir de una foto o un boceto, se obtiene un mapa de lineas limpio y cuantizado que sirve como base para coloreado automatico o para pipelines de entintado.
- Extraccion de estructura en edicion de imagen: en flujos de img2img donde se quiere preservar la composicion original, el mapa de bordes actua como guia de contorno para que la generacion respete la geometria de la escena.
- Preprocesado en tiempo real o por lotes: con tiempos de 4,09 ms a 1080x1920 en backend portable (fp16, RTX 5060 Ti), es adecuado para procesar grandes volumenes de imagenes o para integracion en aplicaciones interactivas.
- Despliegue en entornos con recursos limitados: su huella de memoria (122 MiB asignados en el caso medido a 1080x1920) permite ejecutarlo en GPUs de gama media o incluso en CPU para cargas moderadas.
- Segmentacion y vision por computador clasica: el mapa de bordes puede alimentar etapas posteriores de deteccion de contornos, segmentacion basada en bordes o analisis de documentos y dibujos tecnicos.
- Automatizacion de pipelines de diseno grafico: generacion de capas de lineas a partir de fotografias de producto o maquetas para su posterior composicion en herramientas de diseno.

## Benchmarks y rendimiento

La model card proporciona mediciones de velocidad y memoria (no de calidad tipo MMLU/HumanEval, que no aplican a este modelo). Se reproducen a continuacion los datos disponibles.

Rendimiento en bordes, imagen sintetica 1080x1920:

| Modelo | Tiempo original (ms) | Tiempo portable (ms) | Memoria pico original (MiB, asignada / reservada) | Memoria pico portable (MiB, asignada / reservada) |
|---|---|---|---|---|
| `teed` | 29,6 | 4,09 | 149 / 184 | 122 / 146 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Primera llamada original (s) | Primera llamada portable (s) |
|---|---|---|---|---|
| `teed` | 0,13 | 0,16 | 0,08 | 0,01 |

`torch.compile` y TensorRT (entrada 1024x1024):

| Modelo | Tiempo portable | Tiempo compile | Tiempo TensorRT fp16 | Preparacion compile (primera llamada en frio) | Preparacion ONNX + engine | Memoria pico (asignada / reservada) |
|---|---|---|---|---|---|---|
| `teed` | 2,54 ms | 1,10 ms | 0,799 ms | 9,06 s | 12,5 s | 68 / 88 MiB (portable), 71 / 104 MiB (compile), 106 / 120 MiB (TensorRT) |

Precision (paridad con el codigo original):

| Entorno | Metrica | Resultado |
|---|---|---|
| CPU, float32 | max \|diff\| frente al original | <= 0,002 |
| GPU, float16 (portable y kernels) | mean \|diff\| | <= 0,02 |
| GPU, float16 (portable y kernels) | p99 \|diff\| | <= 0,25 |

Hardware de referencia: RTX 5060 Ti 16 GB, sm_120. El protocolo y las advertencias completas estan en la documentacion de benchmarks del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. En la medicion a 1080x1920 en fp16 el pico asignado es de 122 MiB (146 MiB reservados); a 1024x1024, 68 MiB asignados (88 MiB reservados) en backend portable.
- GPU recomendadas: cualquier GPU CUDA moderna es suficiente; el modelo se ha probado en una RTX 5060 Ti 16 GB. No requiere A100 ni H100.
- Cabe en cualquier GPU consumer actual e incluso en GPUs de gama baja; tambien puede ejecutarse en CPU en fp32 con paridad de salida (max |diff| <= 0,002).
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`, `edges.load("teed")`), con backend `portable`; tambien exportable a ONNX y TensorRT (fp16) segun las mediciones de la model card. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 4,09 ms por imagen a 1080x1920 en portable; 2,54 ms a 1024x1024 en portable, 1,10 ms con `torch.compile` y 0,799 ms con TensorRT fp16. La primera llamada tras la carga es de 0,01 s en portable.

## Comparativa con modelos similares

La model card menciona otros preprocesadores de ControlNet (line art, HED, PiDiNet, TEED / Anyline) y senala que M-LSD tambien devuelve segmentos de linea recta, pero no ofrece datos comparativos de parametros, contexto ni rendimiento frente a ellos. Por tanto:

| Modelo | Parametros | Contexto | Rendimiento comparado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TEED (`fastforks/teed`) | 58 k | no aplica | 4,09 ms a 1080x1920 (portable) | MIT (pesos del checkpoint); datos BIPED no comerciales | Repo de tarjeta; pesos via enlace del autor |
| HED | no disponible | no aplica | no disponible | no disponible | no disponible |
| PiDiNet | no disponible | no aplica | no disponible | no disponible | no disponible |
| M-LSD | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: solo extrae bordes; no realiza descripcion semantica, segmentacion por clases ni generacion de imagen.
- El repositorio no aloja pesos: la descarga se realiza desde enlaces del autor y se verifica por SHA-256; si el enlace cambia o desaparece, el flujo de carga puede fallar.
- Los pesos se declaran MIT, pero el dataset de entrenamiento (BIPED) es de uso no comercial; conviene revisar las condiciones antes de un uso comercial, tal como advierte la propia model card ("research-use package").
- La salida se cuantiza por defecto a unos pocos niveles, lo que puede perder detalle fino de bordes si no se ajusta.
- No hay backend de kernels especifico; el rendimiento depende del backend portable y de las optimizaciones de PyTorch o TensorRT.
- La precision en GPU fp16 presenta un error medio de hasta 0,02 y p99 de hasta 0,25 frente al original, relevante si se necesita maxima fidelidad (usar fp32 en CPU).
- No se documentan sesgos especificos ni tasas de alucinacion (no aplica al no ser un modelo generativo), pero al ser un detector entrenado en un dataset concreto puede generalizar peor en dominios visuales muy distintos.
- Las resoluciones de entrada deben ser multiplos de 32 tras el padding; tamanos menores de 32 no estan soportados.
- Tier "experimental" segun la propia model card: no se garantiza estabilidad de API ni de resultados en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/teed
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original (controlnet_aux, commit b1aac318b15c): https://github.com/huggingface/controlnet_aux
- Pesos del autor (checkpoint TEED, BIPED/5): https://raw.githubusercontent.com/xavysp/TEED/40fa4b1391dc6424f88989d0ca75d5b592c8681d/checkpoints/BIPED/5/5_model.pth
- Repositorio TEED del autor: https://github.com/xavysp/TEED
- Licencia TEED: https://github.com/xavysp/TEED/blob/40fa4b1391dc6424f88989d0ca75d5b592c8681d/LICENSE
- Carpeta de checkpoints BIPED: https://github.com/xavysp/TEED/tree/40fa4b1391dc6424f88989d0ca75d5b592c8681d/checkpoints/BIPED/5
- Documentacion de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/edges/models/teed/card.toml
