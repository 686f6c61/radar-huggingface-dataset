# AlayaLab/Evoke-Turbo

## Resumen

Evoke-Turbo es un checkpoint del modelo de mundo generativo Evoke, publicado por AlayaLab, orientado a mejorar la controlabilidad de la generacion de video: seguimiento de movimiento de camara y adherencia a las instrucciones de escena y sujeto, manteniendo la calidad visual y la consistencia temporal. No es un modelo de lenguaje, sino un modelo de difusion para texto-a-video e imagen-a-video con control de camara, con pesos en formato diffusers.

El modelo se distribuye como un unico transformer fusionado de 14.312.427.584 parametros (aproximadamente 14,31B) almacenados en FP32, con un total de 57,25 GB repartidos en seis shards de safetensors. Reutiliza exactamente la misma arquitectura y flujo de inferencia que Evoke: 3 pasos de muestreo, sin CFG, y video de 384 x 640 a 24 fps. La unica pieza que cambia respecto al modelo original es el transformer; el VAE, el codificador de texto, el tokenizer, el scheduler y el backend de profundidad se descargan por separado.

Su relevancia actual radica en el coste de inferencia: al reducir el muestreo a 3 pasos sin CFG, se abarata drasticamente la generacion de video controlado por camara, un caso de uso clave para simulacion, prototipado de escenas y mundos interactivos. En la evaluacion publicada sobre el split de navegacion de WBench (158 casos), Evoke-Turbo obtiene una media de 82,0003 frente a los 80,8210 del Evoke original, con mejoras en navegacion, consistencia y fisica, a costa de una ligera perdida en calidad de video y en "setting". El repositorio tiene licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (pesos `transformer` de un pipeline diffusers); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 14.312.427.584 (aproximadamente 14,31B), 1.101 tensores |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la generacion se controla por `NUM_CHUNKS`, 20 en el ejemplo de inferencia) |
| Tipos de cuantizacion | No se distribuyen variantes cuantizadas; los pesos se publican en FP32, con politica de carga BF16/FP32 heredada de Evoke |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 para este repositorio; los componentes externos (`evoke-base/`, backend de profundidad ViGeo) conservan sus propias licencias |
| Formato de pesos | safetensors (FP32), 6 shards + `diffusion_pytorch_model.safetensors.index.json` + `config.json` |
| Tamano del repositorio | 57,2 GB |
| Modalidades | Texto-a-video (t2v) e imagen-a-video, con control de camara |
| Resolucion y fps de referencia | 384 x 640 a 24 fps |
| Pasos de muestreo | 3, sin CFG |
| Modelo base | AlayaLab/Evoke (`base_model: finetune`) |

## Arquitectura y entrenamiento

Evoke-Turbo es el resultado de una cadena de destilacion sobre Evoke, cuyas etapas se conservan en el repositorio base: `stage1_camera_control` (control de camara multi-paso), `stage2_few_step_training` (destilacion a 3 pasos), `stage3_long_distillation` (destilacion para video largo) y `stage3_post_distillation` (modelo Evoke publicado). Evoke-Turbo es un checkpoint fusionado completo, no un adaptador, y mantiene la misma arquitectura y el mismo flujo de inferencia que Evoke, por lo que se puede cargar con los scripts existentes cambiando `TRANSFORMER_PATH`. Los pesos se almacenan en FP32, igual que la release `stage3_post_distillation`.

El entrenamiento esta orientado explicitamente a la controlabilidad: seguimiento del movimiento de camara y adherencia a instrucciones sobre escena y sujeto, sin sacrificar calidad de video ni consistencia temporal. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; tampoco especifica innovaciones de atencion (lineal, especulativa o similar). El paper asociado es "Alaya-EVOKE: From Linear-Scaling Supervision to Endless World" (arXiv:2608.13546), de Yin, Wang, Zhan, Li, Zhang y Zhao.

Un detalle operativo relevante: la inferencia requiere un backend de profundidad externo (ViGeo, `pkqbajng/ViGeo`), descargado aparte y no incluido en este repositorio. El repositorio de HuggingFace es plano, de modo que los ficheros deben colocarse manualmente en `models/evoke-turbo/transformer/` para respetar la convencion `subfolder="transformer"` del cargador de Evoke.

## Capacidades

- Generacion de video a partir de texto (t2v) con ventana de salida de 384 x 640 a 24 fps.
- Generacion de video a partir de imagen (image-to-video).
- Control de movimiento de camara mediante entradas de imagen o video junto con poses de camara.
- Adherencia a instrucciones de escena y sujeto, con enfasis en controlabilidad sobre el resultado generado.
- Modelo de mundo interactivo: etiquetado explicitamente como `world-model` e `interactive`, pensado para rollouts prolongados.
- Generacion de video largo mediante rollouts por chunks (`NUM_CHUNKS`, 20 en el ejemplo oficial).
- Inferencia rapida: 3 pasos de muestreo y sin CFG, gracias a la destilacion.
- Evaluado en el split de navegacion de WBench (158 casos), lo que implica capacidad de navegacion coherente en entornos.
- No se documentan capacidades de tool calling, function calling, agentes, vision general, audio ni razonamiento textual: es un modelo de generacion de video, no un LLM.
- Soporte multilingue: no disponible (el prompt textual se procesa con el codificador de texto del modelo base Evoke, sin lista de idiomas declarada).

## Casos de uso

- Simulacion de navegacion en entornos: el modelo genera recorridos coherentes a partir de instrucciones textuales y poses de camara, evaluado especificamente en el split de navegacion de WBench; util para validar politicas de navegacion o generar datos sinteticos de trayectorias.
- Prototipado de escenas para cine y animacion: con 3 pasos y sin CFG, se pueden generar previsualizaciones de planos a 384 x 640 y 24 fps de forma iterativa antes de comprometer recursos en render final.
- Creacion de video a partir de imagenes fijas: a partir de un fotograma o concepto, el modo imagen-a-video permite animar la escena manteniendo la composicion original.
- Generacion de video largo por chunks: `NUM_CHUNKS=20` permite construir secuencias extensas encadenando rollouts, adecuado para clips narrativos o demos de mundo continuo.
- Datos sinteticos para entrenamiento de modelos de vision: las salidas controladas por camara sirven como pares video-pose etiquetados para entrenar modelos de odometria visual o reconstruccion 3D.
- Previsualizacion de recorridos arquitectonicos o inmobiliarios: dado un plano o imagen de referencia y una trayectoria de camara, el modelo produce el recorrido virtual sin necesidad de un motor 3D completo.
- Investigacion en modelos de mundo: al ser un checkpoint destilado con arquitectura identica al modelo base, permite comparar el efecto de la destilacion a 3 pasos sobre la consistencia temporal y la fisica de la escena.

## Benchmarks y rendimiento

Evaluacion sobre el split de navegacion de WBench (158 casos). La interaccion cubre unicamente navegacion.

| Modelo | Video Quality | Setting | Navigation | Consistency | Physical | Avg |
|---|---:|---:|---:|---:|---:|---:|
| Evoke | 82,7900 | 83,7600 | 78,6300 | 86,8700 | 72,0550 | 80,8210 |
| Evoke-Turbo | 81,8914 | 82,0518 | 83,8978 | 88,1469 | 74,0133 | 82,0003 |

Advertencia metodologica incluida por el propio autor: las cifras de Evoke-Turbo son las puntuaciones iniciales de una seleccion de desarrollo con semilla 44 sobre seis variantes de prompt, es decir, resultados seleccionados tras la evaluacion. Las cifras de Evoke corresponden a sus puntuaciones de referencia publicadas, no a una repeticion con prompts y poses identicos, por lo que la comparacion no es estrictamente homogenea. No se han publicado otros resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes, ya que no es un modelo de lenguaje).

## Requisitos de hardware

- Pesos en FP32: 57,25 GB en disco y del orden de 57 GB de VRAM si se cargan sin conversion.
- Con la politica de carga BF16 heredada de Evoke, los pesos del transformer ocupan aproximadamente 28,6 GB, mas la memoria del VAE, el codificador de texto, el scheduler y el backend de profundidad ViGeo.
- GPU recomendadas para FP32 completo: A100 80 GB, H100 80 GB o similares. Para BF16, una GPU de 40 GB (A100 40 GB, L40S) es el minimo razonable; 48 GB o mas da margen para los componentes auxiliares.
- En GPU de consumo: 24 GB (RTX 3090, RTX 4090) es insuficiente para el checkpoint completo en BF16 sin cuantizacion o descarga de componentes a CPU; el modelo no distribuye variantes GGUF ni cuantizadas oficiales, por lo que no hay una ruta de despliegue en consumer documentada.
- Opciones de despliegue: diffusers con los scripts oficiales del repositorio de Evoke (`scripts/inference/infer_post_distill.sh`), seleccionando los pesos mediante `TRANSFORMER_PATH=models/evoke-turbo`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un modelo de difusion de video.
- Latencia y throughput: no disponibles. El coste se reduce por el uso de 3 pasos de muestreo y la ausencia de CFG, pero no se publican cifras de tiempo por chunk ni de fps de generacion.
- Componentes obligatorios adicionales: `evoke-base/` (VAE, text encoder, tokenizer, scheduler) desde AlayaLab/Evoke y el backend de profundidad ViGeo desde `pkqbajng/ViGeo`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | Rendimiento WBench Avg | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Evoke-Turbo | 14,31B (FP32) | 3 pasos, sin CFG, 384 x 640 a 24 fps | 82,0003 | Apache-2.0 (repositorio) | HuggingFace, pesos solo del transformer |
| Evoke | No disponible en la informacion proporcionada | Mismo flujo de inferencia, multi-paso | 80,8210 | No disponible en la informacion proporcionada | HuggingFace, coleccion completa de checkpoints |
| Otros modelos de mundo o de generacion de video | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye datos de otros modelos de generacion de video comparables (por ejemplo, alternativas de la misma categoria o tamano), por lo que la comparativa se limita al modelo base Evoke. Cabe senalar que Evoke-Turbo mejora la media de WBench, la navegacion, la consistencia y la fisica, pero queda por debajo del original en calidad de video (81,8914 frente a 82,7900) y en "setting" (82,0518 frente a 83,7600).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion visual: como modelo generativo de video, puede producir geometria, fisica o movimiento de camara incoherentes con la trayectoria solicitada; la puntuacion de fisica en WBench es la mas baja de todas las metricas (74,0133).
- Resolucion de salida limitada a 384 x 640 a 24 fps en la configuracion de referencia; no se documentan modos de mayor resolucion.
- La comparacion publicada en WBench no es homogenea: Evoke-Turbo usa resultados seleccionados por semilla y variantes de prompt, mientras que Evoke usa puntuaciones de referencia publicadas con otros prompts y poses.
- Licencia: el Apache-2.0 del repositorio cubre unicamente este repositorio y no sustituye las licencias de los componentes externos. `evoke-base/` y el backend de profundidad ViGeo se descargan por separado y hay que verificar sus condiciones antes de un uso comercial.
- Dependencia externa critica: el backend de profundidad ViGeo es obligatorio para la inferencia y no se distribuye con este modelo; su disponibilidad y licencia condicionan el despliegue en produccion.
- Repositorio plano: los ficheros deben reubicarse manualmente en `models/evoke-turbo/transformer/`, lo que anade un paso de configuracion propenso a errores.
- Idiomas soportados y comportamiento multilingue: no disponibles; no se puede garantizar la calidad de la adherencia al prompt fuera de los idiomas cubiertos por el codificador de texto de Evoke.
- Modelo recien publicado: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de terceros.
- No apto para tareas de lenguaje, razonamiento, codigo o tool calling: es un modelo de generacion de video y no incorpora ninguna de esas capacidades.
- No se ofrece informacion sobre sesgos, comportamiento en dominios sensibles ni filtros de contenido.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/AlayaLab/Evoke-Turbo
- HuggingFace (modelo base Evoke): https://huggingface.co/AlayaLab/Evoke
- GitHub: https://github.com/AlayaLab/Evoke
- Pagina del proyecto: https://evoke-world.github.io/Evoke/
- Paper: https://arxiv.org/abs/2608.13546
- WBench: https://meituan-longcat.github.io/WBench/
- Resultados de WBench (dataset de puntuaciones de referencia): https://huggingface.co/datasets/SII-YuanyangYin/wbench_results
- Backend de profundidad ViGeo (dependencia obligatoria): https://huggingface.co/pkqbajng/ViGeo
