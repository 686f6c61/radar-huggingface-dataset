# kodaiyen/pointact-concerto-libero-spatial

## Resumen

PointAct-Concerto-Libero-Spatial es una política de visión-lenguaje-acción (VLA) para robótica manipulativa, publicada por el usuario kodaiyen en Hugging Face. Se trata de una reproducción independiente de la receta del artículo PointAct (RSS 2026), entrenada específicamente sobre el conjunto de tareas LIBERO-Spatial. El modelo no es un lanzamiento oficial de los autores del paper, sino una reimplementación entrenada por un tercero sobre una única NVIDIA DGX Spark (GB10).

La arquitectura combina dos componentes: por un lado, el backbone semántico Qwen2.5-VL-3B-Instruct, que procesa la instrucción en lenguaje natural y la imagen RGB frontal; por otro, un experto de acción basado en Point Transformer V3 inicializado desde Concerto-large, que consume una nube de puntos de 4096 puntos y decodifica las acciones mediante una cabeza de regresión con heatmap. El modelo recibe imagen RGB frontal, nube de puntos frontal derivada de profundidad, estado del robot e instrucción lingüística, y produce chunks de 16 acciones delta con rotación en formato rot6d.

Su relevancia radica en que demuestra que es posible reproducir recetas VLA con nube de puntos sobre hardware de escritorio (una única GPU GB10) y obtener tasas de éxito del 95,4 % en LIBERO-Spatial, un benchmark estándar de manipulación. El checkpoint es autocontenido (las estadísticas de normalización viven en `processor_config.json`) y está pensado exclusivamente para investigación y evaluación, no para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLAEncDec3DWithActionRegressionModel: backbone Qwen2.5-VL-3B + experto de acción Point Transformer V3 (inicializado desde Concerto-large) con cabeza de regresión heatmap |
| Parámetros totales | 4.068.370.976 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors para inferencia) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen RESEARCH LICENSE AGREEMENT) + CC BY-NC 4.0 del encoder Concerto; solo uso no comercial |
| Formato de pesos | safetensors (repo de 8,8 GB; sin estados de optimizador ni scheduler) |

## Arquitectura y entrenamiento

El modelo sigue un diseño encoder-decoder con dos torres. El backbone Qwen2.5-VL-3B-Instruct aporta la semántica visual y lingüística: procesa la imagen RGB frontal y la instrucción en lenguaje natural. La segunda torre es un Point Transformer V3 que actúa como experto de acción, inicializado desde Concerto-large, y que consume una nube de puntos de 4096 puntos extraída de la vista frontal mediante profundidad. La salida se decodifica con una cabeza de regresión con heatmap que genera chunks de 16 acciones delta con rotación rot6d. El espacio de trabajo de la nube de puntos está definido en X/Y [-0,5, 0,5] y Z [0,907, 2,0], con aumento de rotación de ±30°.

El entrenamiento se realizó sobre el dataset `libero_spatial_no_noops` (LeRobot + LMDB de nubes de puntos, campo `points_frontview`), durante 20.000 pasos con batch size 32 en una sola GPU, lo que equivale a unas 11,7 épocas. Se usó learning rate 5e-5 con scheduler coseno, LR de visión 2e-5 y LR del merger 5e-5, semilla 42. El entrenamiento completo consumió aproximadamente 29,4 horas en una NVIDIA DGX Spark (GB10). No se menciona RLHF ni DPO; el ajuste es supervisado sobre demostraciones. El checkpoint publicado contiene únicamente los archivos necesarios para inferencia y las estadísticas de normalización de estado/acción en `processor_config.json`.

## Capacidades

- Generación de acciones robóticas de manipulación: produce chunks de 16 acciones delta con rotación rot6d a partir de observaciones multimodales.
- Comprensión de instrucciones en lenguaje natural para guiar la ejecución de tareas de manipulación.
- Procesamiento de visión RGB frontal combinada con nube de puntos de 4096 puntos derivada de profundidad.
- Integración de estado propioceptivo del robot como entrada adicional.
- Razonamiento viso-espacial implícito a través del experto Point Transformer V3 sobre geometría 3D.
- Servido como política remota mediante un servidor propio (`scripts/run_server.py`) con cliente externo.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, modo thinking, audio ni generación de texto libre; el modelo está especializado en acción robótica.

## Casos de uso

- Manipulación de objetos en entorno de simulación LIBERO: el modelo ejecuta tareas de recogida y colocación de objetos (por ejemplo, un cuenco negro sobre un plato) con tasas de éxito del 84-100 % según la variante, lo que lo hace adecuado para validar recetas VLA en simulación antes de transferir a hardware real.
- Investigación en reproducción de papers: al ser una reproducción independiente de PointAct con receta documentada (pasos, LR, aumentos, semilla), sirve como referencia para comparar implementaciones y estudiar la sensibilidad a hiperparámetros.
- Evaluación de arquitecturas híbridas lenguaje-visión-punto: permite estudiar cómo un backbone VLM de 3B se combina con un experto 3D especializado, útil para líneas de investigación en VLA con nubes de puntos.
- Desarrollo de pipelines de evaluación cerrada: el modelo se integra con MuJoCo y el entorno LIBERO mediante scripts de evaluación, lo que permite medir tasas de éxito con replanificación cada 8 pasos y 10 pasos de denoising.
- Servido como política remota para clientes propios: el servidor incluido permite conectar un cliente externo que envíe observaciones y reciba acciones, útil para prototipar integraciones con otros simuladores o stacks robóticos.
- Benchmarking de hardware para VLA: al estar entrenado y evaluado en una DGX Spark (aarch64, sm_121), sirve para medir rendimiento y estabilidad de kernels (spconv, flash-attn, torch-scatter) en plataformas ARM con CUDA.
- Estudio de robustez multiplataforma: dado que el autor advierte que solo se probó en DGX Spark, el modelo es un caso de estudio para analizar cómo diferencias numéricas entre plataformas afectan a rollouts en bucle cerrado.

## Benchmarks y rendimiento

Evaluación en bucle cerrado sobre LIBERO-Spatial: 50 ensayos por tarea, 500 episodios totales, semilla de entorno 7, replanificación cada 8 pasos, 10 pasos de denoising.

| Tarea | Éxito |
|---|---|
| Recoger el cuenco negro entre el plato y el ramekin y colocarlo en el plato | 100 % |
| Recoger el cuenco negro junto al ramekin y colocarlo en el plato | 100 % |
| Recoger el cuenco negro del centro de la mesa y colocarlo en el plato | 100 % |
| Recoger el cuenco negro sobre la caja de galletas y colocarlo en el plato | 98 % |
| Recoger el cuenco negro del cajón superior del armario de madera y colocarlo en el plato | 94 % |
| Recoger el cuenco negro sobre el ramekin y colocarlo en el plato | 86 % |
| Recoger el cuenco negro junto a la caja de galletas y colocarlo en el plato | 96 % |
| Recoger el cuenco negro sobre la cocina y colocarlo en el plato | 84 % |
| Recoger el cuenco negro junto al plato y colocarlo en el plato | 98 % |
| Recoger el cuenco negro sobre el armario de madera y colocarlo en el plato | 98 % |
| **Total** | **95,4 % (477/500)** |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.068 millones de parámetros en safetensors (8,8 GB de repo), se requiere al menos una GPU con memoria suficiente para cargar los pesos completos más las activaciones del backbone VLM y del Point Transformer V3.
- GPU recomendadas: el autor solo ha probado en NVIDIA DGX Spark (GB10, compute capability 12.1 / sm_121, aarch64). No se ha probado en x86_64 (linux-64) ni en otras GPU.
- ¿Cabe en GPU de consumo? No disponible; no se documentan pruebas en RTX 4090, RTX 3090 u otras GPU de consumo.
- Opciones de despliegue: servidor propio incluido en el repositorio (`scripts/run_server.py`) con cliente externo; scripts de evaluación con MuJoCo y el entorno LIBERO. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política VLA de este tipo).
- Latencia y throughput: no disponibles.
- Dependencias de software relevantes: PyTorch 2.7.0+cu128, transformers 5.5.4, spconv 2.3.8 + cumm 0.8.2, flash-attn 2.8.3, torch-scatter 2.1.2, MuJoCo 3.3.6. En aarch64 estas extensiones se compilan desde fuente; en x86_64 se instalan wheels precompiladas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointAct-Concerto-Libero-Spatial (este modelo) | 4.068 M | no disponible | VLA con nube de puntos + VLM 3B | qwen-research + CC BY-NC 4.0 (no comercial) | Hugging Face, repo de inferencia |
| Qwen2.5-VL-3B-Instruct (modelo base) | ~3.000 M | no disponible | VLM generalista | Qwen RESEARCH LICENSE (no comercial) | Hugging Face |
| Pointcept/Concerto (concerto_large) | no disponible | no disponible | Encoder de nubes de puntos | CC BY-NC 4.0 (no comercial) | Hugging Face |
| PointAct original (RSS 2026) | no disponible | no disponible | VLA con nube de puntos | no disponible | Repositorio del paper |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: los pesos derivan de Qwen2.5-VL-3B-Instruct (Qwen RESEARCH LICENSE AGREEMENT, solo investigación y evaluación) y de Concerto-large (CC BY-NC 4.0, con restricciones adicionales por sus datasets de preentrenamiento como HM3D y ARKitScenes). Para uso comercial es necesario solicitar licencia a Alibaba Cloud y revisar la licencia de Concerto.
- Plataforma no validada fuera de DGX Spark: el autor advierte explícitamente que no se ha probado en x86_64 ni en otras GPU. Diferencias en kernels CUDA, implementaciones de atención y builds de MuJoCo pueden alterar las tasas de éxito en bucle cerrado; es necesario reevaluar antes de confiar en los números.
- Especialización estrecha: el modelo está entrenado solo en LIBERO-Spatial y sobre tareas de recogida y colocación de un cuenco negro; no se documenta generalización a otras tareas, objetos o entornos.
- Sin datos sobre sesgos, alucinación o multilingüismo: no se publica información sobre sesgos conocidos, riesgo de alucinación en instrucciones ambiguas ni cobertura de idiomas.
- Contexto y cuantización no documentados: se desconoce la longitud de contexto efectiva y no se ofrecen versiones cuantizadas (GGUF, AWQ, GPTQ) para despliegue ligero.
- Reproducción no oficial: no es un lanzamiento de los autores del paper PointAct; los resultados deben interpretarse como una reproducción independiente con semilla y receta propias.
- Dependencias frágiles: requiere versiones específicas de spconv, flash-attn y torch-scatter compiladas desde fuente en aarch64, lo que complica la reproducibilidad en otros entornos.
- Sin métricas de latencia ni throughput: no se documenta rendimiento en inferencia, lo que dificulta planificar despliegues en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kodaiyen/pointact-concerto-libero-spatial
- Repositorio del código PointAct: https://github.com/DerekKO226/robot-PointAct
- Modelo base Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Encoder Concerto-large: https://huggingface.co/Pointcept/Concerto
- Licencia Qwen (copia en el repo): https://huggingface.co/kodaiyen/pointact-concerto-libero-spatial/blob/main/LICENSE-Qwen
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
