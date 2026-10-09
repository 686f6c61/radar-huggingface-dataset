# miniFranka/agentic-wam-pretrain-yamego3k-soup-e1

## Resumen

El modelo `miniFranka/agentic-wam-pretrain-yamego3k-soup-e1` es el checkpoint preentrenado de los Agentic World Action Models (AW-0), una familia de modelos mundo-accion para robotica desarrollada por miniFranka (Zhuoyang Liu) y distribuida a traves del repositorio de codigo `agentic-wam`. No es un modelo de lenguaje al uso, sino un sistema tri-modal que co-denoisa tres flujos simultaneamente: video futuro, codigo (interpretable como politica) y acciones motoras de 64 dimensiones. Se posiciona como el punto de partida obligatorio de todas las recetas de post-entrenamiento del repositorio, tanto en robots reales como en el simulador RoboTwin.

Tecnicamente combina varios componentes preentrenados: un experto de video basado en Cosmos-Predict2.5-2B con el VAE de Wan2.2, un experto de codigo construido sobre el cuerpo de SDAR-1.7B, una torre de vision congelada Qwen3-VL-2B-Instruct con un merger entrenable y una cabeza de accion de difusion. Todos ellos se acoplan mediante un Mixture-of-Transformers con self-attention conjunta por capa. El preentrenamiento se realizo sobre una mezcla de datos "yam" (brazos robotizados bimanuales con pinzas paralelas y tres camaras) y "ego" (video egocentrico de manos humanas), ambos unificados en un mismo espacio de accion de 64 dimensiones con etiquetas de codigo por fotograma.

Su relevancia radica en que materializa el paradigma "code-as-policy" dentro de un world model: el modelo razona generando codigo que se co-denoisa con la prediccion visual y las acciones, lo que facilita la interpretabilidad y la transferibilidad entre dominios roboticos. El checkpoint pesa aproximadamente 10 GB, se distribuye en un unico fichero `.pt` y no incluye los componentes congelados, que deben descargarse por separado desde sus releases originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers tri-modal (video + codigo + accion) con self-attention conjunta por capa |
| Parametros totales | no disponible (suma de expertos: ~2B video + ~1,7B codigo + cabeza de accion; mas componentes congelados externos) |
| Parametros activos | no disponible (no es MoE de tipo sparse; el termino "Mixture-of-Transformers" se refiere a la composicion de expertos por modalidad) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo no esta orientado a lenguaje natural; procesa instrucciones via Cosmos-Reason1-7B) |
| Licencia | BSD 2-Clause (los componentes publicos congelados mantienen sus propias licencias) |
| Formato de pesos | PyTorch (`.pt`, diccionario `{"model": state_dict, "step": 115213}`) |
| Tamano del repositorio | 10,0 GB |
| Pipeline declarado | robotics |
| Libreria | agenticwam |
| Topologia interna | code-front-ViT, todos los expertos con 28 capas x 16 cabezas x 128 dimensiones |

## Arquitectura y entrenamiento

AW-0 articula tres expertos diferenciados sobre una columna vertebral comun. El experto de video parte de Cosmos-Predict2.5-2B y emplea el tokenizador VAE de Wan2.2 para representar fotogramas. El experto de codigo reutiliza el cuerpo de SDAR-1.7B, pero lee la observacion visual a traves de una torre congelada Qwen3-VL-2B-Instruct con un modulo merger entrenable, de modo que el codigo se co-denoisa conjuntamente con el video futuro y las acciones. La cabeza de accion es un modulo de difusion que genera vectores de accion de 64 dimensiones. Todos ellos se acoplan con un Mixture-of-Transformers que aplica self-attention conjunta capa a capa, lo que permite que cada modalidad atienda a las demas en cada nivel de profundidad. La configuracion del modelo (topologia code-front-ViT) usa 28 capas, 16 cabezas y dimension 128 en todos los expertos.

El preentrenamiento utilizo la receta `configs/real_pre_train/task/pretrain_magic_soup.yaml` del repositorio agentic-wam, con una mezcla de dos fuentes etiquetadas por fotograma con codigo: "yam" (brazos bimanuales con pinzas paralelas, tres camaras) y "ego" (video egocentrico de manos humanas). Ambos corpus comparten un espacio unificado de accion de 64 dimensiones. El entrenamiento cubre una epoca completa, 115.213 pasos de optimizador, con tamano de lote 6 por GPU y acumulacion de gradiente 9, learning rate 1e-4 con decaimiento coseno y precision bf16. No se documenta en la informacion disponible ninguna fase de RLHF, DPO ni ajuste por preferencias humanas.

## Capacidades

- Generacion conjunta de video futuro, codigo interpretable y acciones motoras en un mismo paso de denoising.
- Prediccion de trayectorias de accion de 64 dimensiones en espacio unificado, aptas para brazos bimanuales con pinzas paralelas.
- Razonamiento "code-as-policy": el modelo produce codigo que sirve como representacion intermedia de la politica, lo que facilita su inspeccion y depuracion.
- Percepcion visual multimodal a traves de la torre Qwen3-VL-2B-Instruct y del experto Cosmos-Predict2.5-2B.
- Comprension de instrucciones mediante el codificador Cosmos-Reason1-7B (instrucciones en lenguaje natural).
- Transferencia entre dominios roboticos: preentrenado en mezcla de robot real (yam) y video humano egocentrico (ego).
- Compatibilidad con post-entrenamiento especifico para robot real y para el simulador RoboTwin mediante las recetas del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso en el sentido de LLM, audio ni thinking mode explicito.

## Casos de uso

- Manipulacion bimanual en robot real: el checkpoint sirve como base (`foundation_ckpt`) para post-entrenar politicas sobre datasets YAM concretos, aprovechando la cabeza de accion de 64-D ya alineada con pinzas paralelas y configuraciones de tres camaras.
- Investigacion en world models roboticos: permite estudiar la coherencia entre prediccion de video futuro y planificacion motora, ya que ambas ramas se co-denoisean de forma conjunta en la misma pasada.
- Politicas interpretables por codigo: en entornos donde se necesita auditar la decision del robot, el flujo de codigo generado puede registrarse y revisarse, en lugar de depender solo de acciones opacas.
- Entrenamiento en simulador RoboTwin: el checkpoint se integra con las recetas `docs/ROBOTWIN.md` para experimentar a bajo coste antes de trasladar la politica a hardware fisico.
- Aprendizaje por transferencia desde video humano: la mezcla "ego" permite aprovechar demostraciones de manos humanas para inicializar politicas que luego se afinan en robot real, reduciendo la necesidad de teleoperacion costosa.
- Benchmarking de VLA/world-action models: sirve como linea base reproducible para comparar arquitecturas tri-modales frente a enfoques VLA clasicos en tareas de manipulacion.
- Automatizacion de tareas de pick-and-place con multiples camaras: la arquitectura consume observaciones de tres camaras y produce acciones coordinadas de dos brazos, adecuada para celdas de trabajo con vision estereo o multi-vista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de tareas (por ejemplo tasas de exito en RoboTwin, LIBERO o tareas reales), ni comparaciones cuantitativas con otros modelos. El unico dato de entrenamiento disponible es el numero de pasos (115.213) y la configuracion de optimizacion, que no constituyen una evaluacion de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Estimacion orientativa a partir del tamano del checkpoint: en bf16, los pesos entrenables ocupan aproximadamente 10 GB; sumando los componentes congelados cargados por separado (VAE de Wan2.2, codificador de instrucciones Cosmos-Reason1-7B, cuerpo SDAR-1.7B, torre Qwen3-VL-2B), el consumo total agregado puede superar holgadamente los 20-30 GB de VRAM, en funcion de la gestion de memoria del pipeline.
- GPU recomendadas: no especificadas por el autor. Por tamano de componentes congelados (incluye un modelo de 7B), se requiere una GPU de clase profesional; candidatas razonables serian A100 40/80 GB, H100 80 GB o L40S, aunque no hay confirmacion oficial.
- Compatibilidad con GPU de consumo: no confirmada. La presencia del codificador Cosmos-Reason1-7B y de varios expertos simultaneos hace poco probable que quepa en una GPU consumer de 24 GB (RTX 4090) sin cuantizacion o descarga selectiva de componentes.
- Opciones de despliegue: el checkpoint esta pensado para usarse dentro del ecosistema agentic-wam (scripts `scripts/train_real_yam.sh`, configuracion `configs/paths/default.yaml`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que ademas no encajan con una arquitectura tri-modal de world-action model con cabeza de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada para establecer una comparativa cuantitativa fiable con modelos equivalentes. A continuacion se indican alternativas de la misma categoria (vision-language-action / world-action models para robotica) a titulo orientativo; los valores de parametros y contexto de esos modelos no provienen de las fuentes consultadas y deben verificarse en sus respectivas fichas:

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AW-0 (este checkpoint) | World-action model tri-modal (video + codigo + accion) | ~2B video + ~1,7B codigo + cabeza de difusion, mas componentes congelados | no disponible | BSD 2-Clause | HuggingFace (repositorio miniFranka) |
| OpenVLA | Vision-language-action | ~7B | no disponible aqui | open source (verificar) | publica |
| pi0 (Physical Intelligence) | Vision-language-action con flujo de difusion | no disponible aqui | no disponible aqui | verificar | publica |
| GR00T N1 (NVIDIA) | Vision-language-action para robots humanoides | no disponible aqui | no disponible aqui | verificar | publica |

La diferencia estructural de AW-0 frente a los VLA clasicos es la co-denoised de codigo como modalidad intermedia y la integracion de un world model de video, en lugar de generar unicamente acciones a partir de lenguaje e imagen.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. La mezcla de datos "yam" y "ego" puede introducir sesgos hacia morfologias concretas (brazos bimanuales con pinzas paralelas) y hacia tareas representadas en esos corpus.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Al ser un world model, puede generar predicciones de video o codigo plausibles pero fisicamente invalidas; requiere validacion en bucle cerrado antes de uso real.
- Limitaciones de contexto e idioma: no se especifican longitudes de contexto ni idiomas soportados. El componente de instrucciones (Cosmos-Reason1-7B) no garantiza cobertura multilingue fuera del ingles.
- Restricciones de licencia: el checkpoint se distribuye bajo BSD 2-Clause, permisiva para uso comercial. Sin embargo, los componentes congelados cargados por separado (Wan2.2, Cosmos-Reason1-7B, SDAR-1.7B-Chat, Qwen3-VL-2B-Instruct) mantienen sus propias licencias, que el integrador debe revisar por separado antes de un despliegue comercial.
- Caveat de despliegue: el checkpoint no incluye los componentes congelados; es necesario descargarlos de sus releases originales, lo que complica la reproducibilidad y aumenta el espacio en disco.
- Estado del artefacto: repositorio con 0 descargas y 1 like en el momento de la consulta; se trata de un checkpoint de investigacion reciente, no de un modelo ampliamente validado por la comunidad.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en hardware modesto.
- Requiere el framework agentic-wam para inferencia y post-entrenamiento; no hay soporte aparente en runtimes de inferencia estandar.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/miniFranka/agentic-wam-pretrain-yamego3k-soup-e1
- Perfil del autor: https://huggingface.co/miniFranka
- Repositorio de codigo agentic-wam: https://github.com/ZhuoyangLiu2005/agentic-wam
- Wan2.2 VAE (componente congelado): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Cosmos-Reason1-7B (codificador de instrucciones): https://huggingface.co/nvidia/Cosmos-Reason1-7B
- SDAR-1.7B-Chat (cuerpo del experto de codigo): https://huggingface.co/JetLM/SDAR-1.7B-Chat
- Qwen3-VL-2B-Instruct (torre de vision): https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
