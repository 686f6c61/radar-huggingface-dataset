# liguang0115/onlyact

## Resumen

OnlyAct es un conjunto de pesos publicado por Runjia Li y colaboradores (Universidad de Oxford, entre otras instituciones) que acompaña el artículo "OnlyAct: Extracting Action Representations from Foundation Models for World Models", aceptado en NeurIPS 2026. El repositorio no contiene un modelo de lenguaje ni un generador de texto: contiene los adaptadores LoRA y los artefactos auxiliares necesarios para extraer representaciones de accion a partir de un codificador de video V-JEPA 2 ViT-L y utilizarlas como interfaz de control en modelos del mundo basados en difusion de video.

El problema que resuelve es la dependencia de etiquetas de accion explicitas (comandos de teclado, velocidades de vehiculo, acciones discretas de entorno) al entrenar world models. OnlyAct propone aprender una representacion de accion latente directamente desde un foundation model de video preentrenado, de modo que el world model pueda condicionarse sobre esa representacion sin supervisar acciones de forma manual. El modelo base es facebook/vjepa2-vitl-fpc64-256, un ViT-L de V-JEPA 2 con 64 fotogramas por clip y resolucion 256 px, y los pesos se distribuyen en formato safetensors con un total de 5.7 GB en el repositorio.

El lanzamiento es relevante porque demuestra que las representaciones de accion pueden transferirse entre dominios (DMLab, Minecraft, Habitat, nuScenes) con adaptadores de solo 34 MB sobre un backbone congelado, y porque publica los checkpoints intermedios (latent action models de AdaWorld y DreamDojo reentrenados, cabezas de dinamica inversa, estadisticas de whitening) para reproducir todas las tablas del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre V-JEPA 2 ViT-L; cabezas auxiliares y world models condicionados por accion sobre AdaWorld (difusion de video derivada de Stable Video Diffusion) |
| Parametros totales | No disponible (el repositorio no publica el recuento agregado; el backbone V-JEPA 2 ViT-L se descarga aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el backbone procesa clips de 64 fotogramas a 256 px; no es un modelo de contexto textual) |
| Tipos de cuantizacion | No disponible (se distribuyen pesos safetensors en precision de entrenamiento; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (modelo de vision/accion, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 para los pesos de OnlyAct; los pesos del world model heredan los terminos de Stability AI via Stable Video Diffusion; varios datasets de entrenamiento y evaluacion son solo para uso no comercial |
| Formato de pesos | safetensors (adaptadores PEFT, proyeccion, latent action models, world models, clasificadores y estadisticas) |

## Arquitectura y entrenamiento

OnlyAct se construye sobre V-JEPA 2 ViT-L, un codificador de video basado en Vision Transformer con atencion conjunta espacio-temporal sobre clips de 64 fotogramas a 256 px. Sobre ese backbone congelado se entrena un adaptador LoRA en formato PEFT (34 MB) que transforma las representaciones del codificador en una representacion de accion latente. Una proyeccion lineal fija de 1024 a 640 dimensiones (2.6 MB, pesos aleatorios no entrenados) mapea la salida del adaptador al espacio de entrada del world model.

El world model utilizado para la evaluacion es AdaWorld, un modelo de difusion de video derivado de Stable Video Diffusion que se condiciona sobre la representacion de accion producida por OnlyAct. El repositorio incluye los pesos de cuatro variantes de AdaWorld (sin accion, con latent action model de AdaWorld, con latent action model de DreamDojo y con OnlyAct), cada una de 223-246 MB, asi como las estadisticas de whitening de la entrada OnlyAct (3.3 MB) y los latent action models de AdaWorld (1.9 GB) y DreamDojo (2.8 GB) reentrenados sobre los mismos pares de fotogramas usados por OnlyAct para permitir una comparacion controlada.

La innovacion tecnica central es la extraccion de la representacion de accion sin supervisar acciones explicitas: el adaptador aprende a predecir el efecto de la accion en el espacio latente del codificador de video, y esa representacion se reutiliza como interfaz de control en el world model. Los clasificadores de dinamica inversa para DMLab, Minecraft y Habitat (aproximadamente 1 MB cada uno) y el readout de movimiento forward de nuScenes se usan para medir la metrica Follow, es decir, la capacidad de la accion inferida de reproducir la transicion observada. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO, dado que no es un modelo generativo de lenguaje.

## Capacidades

- Extraccion de representaciones de accion latente a partir de video, sin etiquetas de accion explicitas.
- Codificacion de clips de video de 64 fotogramas a 256 px mediante el backbone V-JEPA 2 ViT-L.
- Condicionamiento de un world model de difusion de video (AdaWorld) sobre la representacion de accion extraida.
- Transferencia de la interfaz de accion entre dominios: DMLab, Minecraft, Habitat y nuScenes.
- Evaluacion de dinamica inversa mediante clasificadores entrenados por dominio (metrica Follow).
- Comparacion controlada con latent action models alternativos (AdaWorld LAM y DreamDojo LAM) reentrenados sobre los mismos pares de fotogramas.
- No soporta tool calling, function calling, agentes multi-paso, generacion de texto, razonamiento linguistico ni capacidades multilingues: es un modelo de vision y accion.

## Casos de uso

- Investigacion en world models: el adaptador OnlyAct permite condicionar AdaWorld sobre acciones inferidas de video, sirviendo como linea base reproducible para experimentos de control latente en difusion de video.
- Reproduccion de resultados de NeurIPS 2026: los checkpoints intermedios (LAM de AdaWorld y DreamDojo reentrenados, clasificadores IDM, readout de nuScenes) permiten recomponer las tablas 1 a 4 del paper sin reentrenar desde cero.
- Aprendizaje por imitacion sin etiquetas de accion: en entornos donde no se registran comandos (por ejemplo, video de teleoperacion o de conduccion), OnlyAct extrae una representacion de accion directamente del video observado y la usa como senal de control.
- Preentrenamiento de agentes en entornos simulados: los clasificadores de dinamica inversa para DMLab, Minecraft y Habitat permiten evaluar si la representacion aprendida captura transiciones utiles antes de desplegar un policy en el entorno.
- Transferencia entre dominios roboticos o de navegacion: la interfaz de accion aprendida en un dominio puede evaluarse en otro (de DMLab a Habitat, por ejemplo) usando los checkpoints `downstream/step0` y `downstream/standardise` como punto de partida.
- Analisis de conduccion autonoma: el readout de movimiento forward de nuScenes permite medir si la representacion de accion codifica desplazamiento del vehiculo en video real, un caso de validacion fuera de simuladores.
- Fine-tuning de bajo coste: al tratarse de un adaptador LoRA de 34 MB sobre un backbone congelado, un grupo con una sola GPU puede adaptar la interfaz de accion a un nuevo dataset de video sin reentrenar V-JEPA 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia las tablas 1, 2, 3 y 4 del paper y el repositorio de GitHub para los resultados numericos, pero no incluye cifras en el texto proporcionado. No se deben inferir valores de MMLU, HumanEval, GSM8K ni de metricas de video a partir de esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El backbone V-JEPA 2 ViT-L se descarga aparte y su huella depende de la precision y del tamano de batch de clips; los adaptadores OnlyAct ocupan solo 34 MB y la proyeccion 2.6 MB.
- GPU recomendadas: no disponible en la informacion proporcionada. Para el backbone ViT-L se requiere una GPU con memoria suficiente para procesar clips de 64 fotogramas a 256 px; el entrenamiento del adaptador LoRA sobre backbone congelado es viable en GPU de gama alta consumer, pero no se documentan modelos concretos.
- Cabe en consumer GPU: no disponible como dato confirmado; el adaptador en si ocupa 34 MB, pero la inferencia completa requiere cargar V-JEPA 2 ViT-L y, para el world model, AdaWorld (223-246 MB de pesos adaptados sobre Stable Video Diffusion).
- Opciones de despliegue: descarga via `hf download liguang0115/onlyact --local-dir checkpoints` y verificacion con `sha256sum -c SHA256SUMS`; la carga de adaptadores usa PEFT. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OnlyAct (este repositorio) | Adaptador LoRA de 34 MB sobre V-JEPA 2 ViT-L | Clips de 64 fotogramas a 256 px | Representacion de accion extraida de foundation model de video | Apache 2.0 (pesos); terminos de Stability AI para el world model | Hugging Face y GitHub |
| AdaWorld LAM | No disponible | No disponible | Latent action model entrenado sobre pares de fotogramas | Apache 2.0 (Little-Podi/AdaWorld) | Hugging Face (Little-Podi/AdaWorld) |
| DreamDojo LAM | No disponible | No disponible | Latent action model alternativo reentrenado para comparacion | No disponible | Pesos incluidos en este repositorio |
| V-JEPA 2 ViT-L | No disponible | Clips de 64 fotogramas a 256 px | Codificador de video foundation model | MIT | Hugging Face (facebook/vjepa2-vitl-fpc64-256) |

La comparacion directa de rendimiento entre OnlyAct, AdaWorld LAM y DreamDojo LAM se realiza en las tablas 1, 2 y 4 del paper, no en la informacion disponible aqui.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes conversacionales, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Dependencia de pesos de terceros: V-JEPA 2 ViT-L (MIT), AdaWorld (Apache 2.0) y OpenCLIP ViT-H-14 deben descargarse de sus repositorios originales; el repositorio solo contiene adaptadores y artefactos auxiliares.
- Licencia del world model: los pesos de AdaWorld derivan de Stable Video Diffusion, por lo que aplican los terminos de Stability AI ademas de Apache 2.0.
- Datasets restringidos: varios de los datasets de entrenamiento y evaluacion son solo para uso no comercial, lo que limita la validacion de uso comercial del modelo completo.
- Riesgo de sobreajuste al dominio: los clasificadores IDM y el readout de nuScenes estan entrenados por dominio concreto (DMLab, Minecraft, Habitat, nuScenes); la generalizacion fuera de esos dominios no esta cuantificada en la informacion disponible.
- Sin datos de sesgo, alucinacion o robustez: al no ser un modelo generativo linguistico, las categorias habituales de sesgo textual no aplican, pero no se documentan analisis de sesgo visual ni de robustez ante distribuciones de video fuera del entrenamiento.
- Repositorio renombrado: el proyecto se llamaba antes `liguang0115/justact`; los archivos se renombraron el 2026-11-11 y los checksums `SHA256SUMS` son los mismos, pero scripts antiguos que referencien nombres JustAct pueden fallar.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad fuera de los autores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liguang0115/onlyact
- Codigo y evaluacion: https://github.com/runjiali-rl/onlyact
- Pagina del proyecto: https://runjiali-rl.github.io/onlyact/
- Modelo base V-JEPA 2 ViT-L: https://huggingface.co/facebook/vjepa2-vitl-fpc64-256
- World model AdaWorld: https://huggingface.co/Little-Podi/AdaWorld
- Paper (NeurIPS 2026): "OnlyAct: Extracting Action Representations from Foundation Models for World Models", Li, Chen, Xie, Torr, Vedaldi, Jakab.
