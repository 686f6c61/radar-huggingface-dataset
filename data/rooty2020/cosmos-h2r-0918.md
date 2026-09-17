# rooty2020/Cosmos-H2R-0918

## Resumen

Cosmos-H2R-0918 es un modelo del mundo (world model) de vídeo especializado en manipulación robótica, publicado por el usuario rooty2020 como un ajuste fino post-entrenado sobre nvidia/Cosmos3-Nano. El checkpoint se distribuye como una consolidación en formato Cosmos (safetensors fragmentados más config.json y checkpoint.json), con 15.215.696.011 parámetros reales en pesos EMA bf16 y un tamaño de repositorio de 31,6 GB. Su tarea principal declarada en HuggingFace es image-to-video.

La particularidad del modelo es que no se limita a predecir vídeo: incorpora una cabeza de seguimiento de puntos 3D entrenada de forma conjunta con el backbone de flow matching y un condicionamiento explícito de cámara. Esto significa que cada rollout generado viene acompañado de trayectorias de puntos 3D por fotograma y puede dirigirse mediante una secuencia de poses de cámara, algo relevante para planificación y control en robótica.

El interés actual del modelo reside en su enfoque híbrido: reutiliza un backbone multimodal tipo Qwen3-VL-8B en arquitectura MoT (mixture of transformers) junto con un experto de difusión, y lo post-entrena sobre episodios reales del dataset DROID recortados por subtarea con lenguaje asociado. Es, por tanto, una pieza orientada a investigación en world models aplicados a manipulación, no un modelo conversacional de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | cosmos3_omni, transformer de difusión con backbone MoT (Qwen3-VL-8B) y position embeddings unified_3d_mrope |
| Parametros totales | 15.215.696.011 (~15,2 B, incluye modelo de lenguaje y experto de difusión; la torre ViT de Qwen3-VL se añade aparte) |
| Parametros activos | no aplica (no es un modelo MoE disperso; el backbone MoT usa experto de difusión, pero no se especifica un recuento de parametros activos) |
| Longitud de contexto | no disponible como ventana de tokens; el presupuesto de empaquetado durante el entrenamiento es de 32 000 tokens por muestra, con 1 a 5 latentes pasados limpios (1/5/9/13/17 fotogramas de contexto) |
| Tipos de cuantizacion | no disponible; solo se publican pesos EMA en bf16 |
| Idiomas soportados | no disponible (el condicionamiento textual proviene de descripciones de subtarea en DROID; no se declara cobertura multilingue) |
| Licencia | nvidia-open-model-license (NVIDIA Open Model License), derivada de nvidia/Cosmos3-Nano |
| Formato de pesos | safetensors fragmentados (model*.safetensors) acompanados de config.json y checkpoint.json, en el layout propio de Cosmos |
| Resolucion de entrenamiento | 480p, 2 vistas, clips de hasta 157 fotogramas |
| Iteracion de entrenamiento | 785 (etapa final de un curriculum multi-etapa) |
| Tamano del repositorio | 31,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de nvidia/Cosmos3-Nano, que combina un backbone multimodal Qwen3-VL-8B en configuracion MoT (mixture of transformers) con un experto de difusion. La arquitectura declarada es cosmos3_omni, con embeddings posicionales unified_3d_mrope, que permiten tratar de forma conjunta las dimensiones espaciales y temporales del vídeo. Sobre esa base se anade una cabeza de seguimiento de puntos 3D y un mecanismo de condicionamiento de cámara.

La etapa final de entrenamiento uso episodios de DROID recortados en clips por subtarea con descripciones de lenguaje por subtarea: aproximadamente 67 000 clips, con un limite de ventana de 157 fotogramas, a 480p y dos vistas. La funcion de perdida combina el objetivo de rectified flow sobre vídeo, una perdida de seguimiento de puntos 3D (con profundidad habilitada y tope de secuencia de 50) y una perdida de consistencia entre vistas anclada a las trayectorias, con peso 0,1. El condicionamiento incluye de 1 a 5 latentes pasados limpios (ventanas de contexto de 1, 5, 9, 13 o 17 fotogramas) y una accion de cámara framewise de 9 dimensiones con codigos analiticos de rayos de Plucker y rotaciones RoCE, aplicados en cada capa del DiT mediante camera_roce_mode=qk_vo.

La optimizacion se realizo con learning rate 2e-5, 200 pasos de warmup dentro de un ciclo coseno de 2000 pasos, sobre 32 nodos GH200. Los pesos exportados son los EMA finales en bf16. La torre ViT no forma parte del checkpoint de entrenamiento: se toma de Qwen/Qwen3-VL-8B-Instruct en la revision fijada por el framework Cosmos.

## Capacidades

- Generacion de vídeo condicionada por imagen (image-to-video) con rollouts de hasta 157 fotogramas a 480p.
- Prediccion de mundo para manipulación robótica: genera la evolucion visual de una escena a partir de contexto pasado.
- Seguimiento de puntos 3D: produce trayectorias de puntos 3D por fotograma junto al vídeo generado, gracias a la cabeza entrenada de forma conjunta.
- Condicionamiento explícito de cámara: acepta una secuencia de acciones de cámara framewise de 9 dimensiones (codigos de rayos de Plucker y rotaciones RoCE) que dirige el punto de vista del rollout.
- Consistencia entre vistas: la perdida de consistencia anclada a trayectorias esta disenada para mantener coherencia entre las dos vistas usadas en entrenamiento.
- Condicionamiento por lenguaje de subtarea: al haberse entrenado con descripciones por subtarea de DROID, admite condicionamiento textual de la tarea a ejecutar.
- Condicionamiento por fotogramas pasados: soporta ventanas de contexto de video de 1, 5, 9, 13 o 17 fotogramas limpios.
- No se declaran capacidades de tool calling, function calling, agentes, audio ni modo de razonamiento explicito; el modelo no es un LLM conversacional.

## Casos de uso

- Simulacion de rollouts para planificacion robótica: dado un fotograma inicial y una secuencia de poses de cámara, generar la evolucion prevista de la escena y las trayectorias 3D de puntos de interes, que pueden alimentar un planificador de movimiento.
- Aumento de datos para entrenamiento de politicas: generar variaciones sinteticas de episodios de manipulación a partir de clips reales, ampliando la cobertura de subtareas sin necesidad de nuevas demostraciones fisicas.
- Evaluacion de politicas en mundo aprendido: usar el modelo como simulador neuronal para estimar el resultado de acciones candidatas antes de ejecutarlas en el robot real.
- Investigacion en world models con seguimiento 3D: la cabeza de seguimiento permite estudiar correspondencia de puntos y coherencia geométrica en vídeo generado, útil para validar metodos de reconstruccion.
- Analisis de consistencia multivista: entrenado con dos vistas y una perdida de consistencia cruzada, sirve para experimentos sobre coherencia entre camaras en escenas manipulativas.
- Prototipado de condicionamiento de cámara: el uso de codigos de Plucker y RoCE permite experimentar con control de trayectoria de camara en generacion de vídeo, por ejemplo para vistas novedosas de una misma escena.
- Estudio de transferencia desde modelos fundacionales: al derivar de Cosmos3-Nano, es un banco de pruebas para medir cuanto rendimiento especifico de dominio se obtiene mediante post-entrenamiento con datos DROID.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (ni FVD, ni PSNR, ni precision de seguimiento, ni comparaciones con otros checkpoints), y los resultados de busqueda web recuperados no contienen informacion relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: solo los pesos ocupan aproximadamente 30,4 GB (15,2 B de parametros a 2 bytes). Hay que anadir la torre ViT de Qwen3-VL-8B y el estado intermedio de los latentes de vídeo, por lo que el requisito practico es notablemente superior; no se dispone de una cifra oficial.
- Cuantizaciones de menor precision: no se publican versiones GGUF, AWQ, GPTQ ni FP8, por lo que no hay una ruta de despliegue de bajo consumo verificada.
- GPU recomendadas: el entrenamiento se ejecuto en 32 nodos GH200, lo que situa el modelo en la categoria de data center. Para inferencia, el punto de partida razonable son GPUs con 80 GB o mas (H100 80 GB, A100 80 GB, GH200).
- Viabilidad en GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16 sin cuantizacion y sin soporte de offload; no se ha publicado ningun metodo de cuantizacion compatible.
- Opciones de despliegue: el checkpoint esta pensado para el entry point de inferencia del framework Cosmos, invocado con torchrun (torchrun --nproc_per_node=<N> -m cosmos_framework.scripts.inference). Tambien esta pensado para cargarse desde cosmos-predict, aunque en ese caso solo se cargara el backbone de vídeo y no las cabezas de condicionamiento de cámara ni de seguimiento 3D.
- Multi-GPU: el despliegue distribuido mediante torchrun con varios procesos es el modo documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Capacidades distintivas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos-H2R-0918 | ~15,2 B (bf16) | clips de hasta 157 fotogramas, contexto de 1 a 5 latentes pasados | world model de manipulacion con seguimiento 3D y condicionamiento de camara | NVIDIA Open Model License | HuggingFace, repositorio de 31,6 GB |
| nvidia/Cosmos3-Nano (modelo base) | ~15,2 B segun el autor del fine-tune | no disponible | world model generalista, sin las cabezas de seguimiento 3D ni el condicionamiento de camara de este ajuste | NVIDIA Open Model License | HuggingFace |
| Otros world models de vídeo para robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de benchmarks ni de especificaciones de terceros que permitan una comparacion cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- No hay garantia de precision fisica: la propia model card advierte de que el vídeo generado no garantiza exactitud fisica.
- No apto para control safety-critical: el modelo no debe usarse para control de seguridad critica, segun la advertencia explicita del autor.
- Cabeza especifica del ajuste: los modulos de condicionamiento de cámara y de seguimiento 3D son propios de este fine-tune; cargarlo con el pipeline estandar cosmos-predict solo activa el backbone de vídeo y pierde esas capacidades.
- Dependencia del framework Cosmos: el uso requiere el codigo de cosmos_framework y el layout de checkpoint consolidado; no es cargable directamente en librerias genericas de difusion.
- Dependencia de la torre ViT: el checkpoint no incluye el ViT; hay que obtenerlo de Qwen/Qwen3-VL-8B-Instruct en la revision fijada, lo que anade un componente externo y su propia licencia.
- Sesgos y dominio: entrenado exclusivamente con DROID (manipulacion robotica en entornos de laboratorio), lo que limita su generalizacion a otras escenas, camaras o dominios.
- Datos de entrenamiento con licencia propia: DROID impone sus propios terminos, que se aplican al uso derivado del modelo.
- Idiomas: no se declara ninguna cobertura linguistica; el condicionamiento textual procede de descripciones de subtarea del dataset y no hay garantia multilingue.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, y no se acompana de paper ni de informe tecnico en la informacion disponible.
- Restricciones comerciales: la NVIDIA Open Model License es una licencia "other" con condiciones especificas que deben revisarse antes de cualquier uso comercial; no se ha verificado aqui su compatibilidad con productos propietarios.
- Riesgo de alucinacion visual: como modelo generativo de vídeo, puede producir dinamicas plausibles pero incorrectas, especialmente en contactos, oclusiones o geometrias complejas.
- Ciclo de vida corto: al ser un fine-tune de investigacion sin mantenimiento declarado, no hay garantia de actualizaciones ni de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rooty2020/Cosmos-H2R-0918
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Licencia del modelo base (NVIDIA Open Model License): https://huggingface.co/nvidia/Cosmos3-Nano/blob/main/README.md
- Dataset DROID: https://droid-dataset.github.io/
- Torre ViT de referencia: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Resultados de busqueda web: no se han encontrado enlaces adicionales relevantes (los resultados recuperados no guardan relacion con el modelo).
