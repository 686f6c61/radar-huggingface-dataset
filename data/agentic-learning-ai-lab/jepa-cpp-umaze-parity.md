# agentic-learning-ai-lab/jepa-cpp-umaze-parity

## Resumen

jepa-cpp-umaze-parity es un repositorio de artefactos de prueba publicado por agentic-learning-ai-lab, un laboratorio de investigación con sede en la Universidad de Nueva York (NYU). No se trata de un modelo de lenguaje, sino de un modelo de mundo (world model) basado en la arquitectura JEPA (Joint Embedding Predictive Architecture), condicionado por acciones, y empaquetado en formato GGUF para su uso con jepa.cpp, un runtime de inferencia sobre ggml.

El modelo es un `dino_wm` de tipo `dino_channel` que combina un codificador DINOv2 ViT-S/14, un proyector de canal y un predictor ViT, entrenado con una pérdida de rectificación temporal (temporal-straightening loss) sobre el entorno PointMaze umaze. Cuenta con 24.821.912 parámetros (~24,8 M) y un tamaño de repositorio de 0,3 GB.

Su relevancia es instrumental: sirve como banco de pruebas para verificar la paridad numérica entre la implementación en PyTorch y la implementación en ggml/jepa.cpp, y para medir la latencia de rollout. El propio autor advierte que es un modelo de prueba pequeño, entrenado por ellos mismos, y que no debe tomarse como checkpoint de referencia para resultados de planificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA de mundo condicionada por acciones; codificador DINOv2 ViT-S/14 + proyector de canal + predictor ViT |
| Parametros totales | 24.821.912 (~24,8 M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de mundo, no modelo de lenguaje) |
| Tipos de cuantizacion | F16 y F32 (GGUF); no se incluyen cuantizaciones de menor precision |
| Idiomas soportados | no aplicable / no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (schema v2) para los pesos; NPZ para las activaciones de referencia |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de modelos de mundo `jepa-agent` y a la variante `dino_channel`. Su composición es la siguiente: un codificador de visión DINOv2 ViT-S/14 que convierte observaciones de alta dimensión en representaciones latentes, un proyector de canal y un predictor ViT que opera en el espacio latente para predecir estados futuros a partir de las acciones. Se trata de una arquitectura JEPA, es decir, la predicción se realiza en un espacio latente compacto y no en el espacio de píxeles, lo que reduce el coste computacional de la planificación.

El entrenamiento se realizó sobre el entorno PointMaze (variante umaze) y utilizó una pérdida de rectificación temporal (temporal-straightening loss). El repositorio incluye también un fichero de estadísticas (`umaze_stats.json`) con la normalización de acciones y propiocepción que los GGUF incorporan de forma embebida, y un fichero `umaze_ref_gn.npz` con activaciones de referencia del modelo PyTorch, que incluye trazas de los planificadores CEM y Gauss-Newton. No se especifican en la información disponible ni el número de tokens/pasos de entrenamiento ni la composición detallada del dataset, y tampoco se indica si hubo fases de RLHF o DPO (no aplicables en este contexto).

## Capacidades

- Predicción de estados futuros en espacio latente a partir de observaciones visuales y acciones (modelo de mundo condicionado por acciones).
- Codificación de observaciones de alta dimensión mediante un codificador DINOv2 ViT-S/14.
- Soporte de planificación dentro del bucle de control predictivo, con trazas de referencia para los planificadores CEM y Gauss-Newton.
- Verificación de paridad numérica entre la implementación de referencia en PyTorch y la implementación en ggml/jepa.cpp.
- Ejecución de benchmarks de latencia de rollout a través de `bench/rollout_metric.sh`.
- Inferencia sobre ggml/GGUF, lo que permite despliegue ligero sin dependencia de PyTorch.
- No dispone de generación de texto, razonamiento lingüístico, visión descriptiva, tool calling ni capacidades multilingües, ya que no es un modelo de lenguaje.

## Casos de uso

- Verificación de paridad numérica en runtimes: el repositorio incluye activaciones de referencia en NPZ que permiten comprobar que una implementación en ggml reproduce fielmente las salidas del modelo original en PyTorch.
- Benchmarking de latencia de rollout: mediante `bench/rollout_metric.sh` se puede medir el coste temporal de las predicciones del modelo de mundo, útil para optimizar el runtime.
- Desarrollo de planificadores MPC: las trazas de CEM y Gauss-Newton incluidas sirven como referencia para validar planificadores que operen sobre el espacio latente del modelo.
- Integración continua de jepa.cpp: los artefactos funcionan como casos de prueba reproducibles dentro de pipelines de CI para detectar regresiones de precisión entre versiones del runtime.
- Validación de esquemas GGUF: el uso del esquema v2 (`docs/gguf-schema.md`) convierte estos ficheros en material de prueba para herramientas que serializan y deserializan modelos en GGUF.
- Estudio de modelos de mundo JEPA: investigadores que quieran inspeccionar la estructura de un `dino_wm` pequeño pueden usar este checkpoint para experimentar con la arquitectura sin necesidad de un entrenamiento completo.
- Pruebas de normalización de datos: el fichero `umaze_stats.json` permite reproducir la normalización de acciones y propiocepción y verificar que los GGUF embeben correctamente esos estadísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 50 MB en pesos F16 y unos 100 MB en pesos F32, sin contar el overhead de activaciones (no especificado en la información disponible).
- GPU recomendadas: no se especifican; dado el tamaño (~24,8 M de parámetros), el modelo no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo e incluso en CPU, ya que el tamaño de pesos en F16 ronda las decenas de megabytes.
- Opciones de despliegue: jepa.cpp sobre ggml (runtime oficial de estos artefactos). No se mencionan vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles; el repositorio incluye un script de medición de latencia de rollout, pero no se publican cifras concretas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jepa-cpp-umaze-parity (este modelo) | Modelo de mundo JEPA condicionado por acciones | ~24,8 M | GGUF (F16/F32), NPZ | MIT | HuggingFace |
| AdaJEPA | Modelo de mundo latente adaptativo (adaptación en el bucle de MPC) | no disponible | no disponible | no disponible | Repositorio GitHub del mismo laboratorio |
| DINO-WM | Modelo de mundo basado en DINOv2 | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de prueba autoconsiderado "pequeño y autoentrenado": el propio autor indica explícitamente que no debe usarse como checkpoint de referencia para resultados de planificación.
- Entrenado únicamente sobre el entorno PointMaze umaze, por lo que su generalización a otros entornos o tareas no está garantizada.
- No es un modelo de lenguaje: carece de capacidades de generación de texto, razonamiento lingüístico, tool calling o multilingüismo.
- Ausencia de benchmarks publicados que permitan evaluar su calidad predictiva más allá de las pruebas de paridad numérica.
- Las activaciones de referencia y el modelo son artefactos de test, sujetos a cambios entre versiones del runtime.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplicable en el sentido lingüístico; el modelo predice estados latentes y su error se mide como desviación respecto a la referencia.
- Licencia MIT, que permite uso comercial, modificación y redistribución con la única obligación de conservar el aviso de copyright y la licencia.
- No se especifican limitaciones de contexto idioma, ya que no aplican a este tipo de modelo.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-learning-ai-lab/jepa-cpp-umaze-parity
- jepa.cpp (repositorio del runtime): https://github.com/agentic-learning-ai-lab/jepa.cpp
- AdaJEPA (GitHub): https://github.com/agentic-learning-ai-lab/adajepa
- AdaJEPA (DeepWiki): https://deepwiki.com/agentic-learning-ai-lab/adajepa
- Página del proyecto AdaJEPA: https://agenticlearning.ai/adajepa/
- Laboratorio Agentic Learning AI Lab (research): https://agenticlearning.ai/research/
- Organización en GitHub: https://github.com/Agentic-Learning-AI-Lab
