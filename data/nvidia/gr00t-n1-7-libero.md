# nvidia/GR00T-N1.7-LIBERO

## Resumen
GR00T-N1.7-LIBERO es un modelo fundacional de NVIDIA para razonamiento y habilidades de robots humanoides, concretamente la variante post-entrenada sobre el dataset LIBERO. Forma parte de la familia Isaac GR00T N1.7, que incluye otras tres variantes post-entrenadas (SimplerEnv Bridge, SimplerEnv Fractal y DROID). El modelo es cross-embodiment: acepta entradas multimodales (lenguaje e imágenes) y ejecuta tareas de manipulación en entornos diversos, pudiendo ser re-entrenado con datos reales o sintéticos para un robot o tarea específicos.

La arquitectura combina un backbone vision-language Cosmos-Reason2-2B (que sustituye a los encoders SigLIP2 y T5 de versiones anteriores), un transformer de acciones con flow matching implementado como diffusion transformer (DiT) con condicionamiento del paso de difusión mediante adaptive layernorm (AdaLN), y codificadores MLP por embodiment para propiocepción y acciones. El modelo tiene aproximadamente 3.000 millones de parámetros y está pensado para uso comercial y no comercial bajo la NVIDIA Open Model License.

LIBERO es un benchmark de aprendizaje robótico lifelong con 130 tareas de manipulación condicionadas por lenguaje, agrupadas en suites, con demostraciones teleoperadas para evaluar transferencia de conocimiento y aprendizaje continuo. Esta variante concreta es relevante para investigadores que quieran reproducir o comparar resultados en dicho benchmark sin partir del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM backbone Cosmos-Reason2-2B + flow matching action transformer (DiT con AdaLN) + encoders MLP por embodiment |
| Parametros totales | 3.000.000.000 (aproximadamente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License Agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo sigue el diseño descrito en el white paper de Isaac GR00T N1 (arXiv:2503.14734). Las imágenes RGB de cámara se procesan mediante un vision transformer preentrenado; el texto se codifica con un transformer preentrenado; la propiocepción del robot se codifica con un MLP indexado por embodiment ID, con padding a una longitud máxima configurable para admitir dimensiones variables. Las acciones se codifican y las velocidades se decodifican mediante MLPs, uno por embodiment único. El transformer de acciones usa flow matching y se implementa como DiT con condicionamiento del paso de difusión vía AdaLN.

En esta versión N1.7 el backbone vision-language pasa a ser Cosmos-Reason2-2B (el model card enlaza erróneamente a Cosmos-Reason2-8B en el texto, pero indica 2B como backbone). El post-entrenamiento específico de esta variante se realiza sobre el dataset LIBERO, un benchmark de aprendizaje lifelong con 130 tareas de manipulación condicionadas por lenguaje y demostraciones teleoperadas. No se detalla en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron etapas de RLHF/DPO.

El coste computacional declarado para el entrenamiento es de 64 nodos GB200 con 4 GPU por nodo, 1200 W, 120 horas, con un consumo estimado de 41.288 kWh y unas emisiones de 16,949 tCO2e.

## Capacidades
- Razonamiento y ejecución de tareas de manipulación robótica condicionadas por lenguaje e imágenes.
- Entrada multimodal: lenguaje, imágenes RGB de cámara y propiocepción del robot.
- Modelo cross-embodiment: soporta múltiples morfologías de robot mediante MLPs indexados por embodiment ID.
- Generación de chunks de acciones mediante flow matching (predicción de velocidad decodificada por MLP).
- Post-entrenamiento con datos reales o sintéticos para robots o tareas específicas.
- Aprendizaje lifelong y transferencia de conocimiento (el dataset LIBERO está diseñado para evaluar estos aspectos).
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-step, capacidades multilingües ni modos de thinking explícitos.

## Casos de uso
- Investigación en manipulación robótica: uso del modelo como referencia post-entrenada sobre LIBERO para reproducir y comparar resultados en las 130 tareas del benchmark, evaluando transferencia y aprendizaje continuo.
- Desarrollo de robots humanoides: post-entrenamiento con datos propios del robot para adaptar el modelo a una morfología concreta, aprovechando el diseño cross-embodiment y los MLPs por embodiment.
- Evaluación de aprendizaje lifelong: uso del modelo en suites de tareas LIBERO para medir retención de habilidades y olvido catastrófico en agentes robóticos.
- Automatización de tareas de manipulación en entornos controlados: ejecución de instrucciones en lenguaje natural sobre objetos y escenas del benchmark, útil como línea base en laboratorios.
- Generación de datos sintéticos y aumento de datos: el modelo puede servir como política de referencia para generar trayectorias adicionales que alimenten pipelines de entrenamiento.
- Integración en stacks de simulación: despliegue en entornos SimplerEnv y similares para comparar variantes de la familia N1.7 (Bridge, Fractal, DROID, LIBERO) bajo condiciones equivalentes.
- Prototipado en startups de robótica: uso del modelo como punto de partida para reducir costes de entrenamiento antes de pasar a datos reales de producción.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El model card no incluye tablas de éxito por suite LIBERO ni comparaciones numéricas con otras variantes o modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 142,8 GB en safetensors, lo que sugiere pesos en precisión alta; el tamaño exacto de VRAM dependerá de la precisión y del resto de componentes (backbone VLM, transformer de acciones, encoders).
- GPU recomendadas: no disponible. El entrenamiento declarado usó nodos GB200 con 4 GPU por nodo, lo que indica despliegue en hardware de centro de datos.
- Compatibilidad con GPU de consumo: no disponible. No se documenta en la información disponible.
- Opciones de despliegue: no se detallan frameworks de inferencia (vLLM, llama.cpp, Ollama, TGI) en el model card; el proyecto Isaac-GR00T en GitHub es la vía indicada para uso y despliegue.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| GR00T-N1.7-LIBERO | ~3.000 millones | no disponible | no disponible | NVIDIA Open Model License | Hugging Face |
| GR00T-N1.7-SimplerEnv Bridge | ~3.000 millones (familia) | no disponible | no disponible | NVIDIA Open Model License | Hugging Face |
| GR00T-N1.7-SimplerEnv Fractal | ~3.000 millones (familia) | no disponible | no disponible | NVIDIA Open Model License | Hugging Face |
| GR00T-N1.7-DROID | ~3.000 millones (familia) | no disponible | no disponible | NVIDIA Open Model License | Hugging Face |

Las cuatro variantes comparten arquitectura y backbone Cosmos-Reason2-2B; la diferencia es el dataset de post-entrenamiento (LIBERO, BridgeData V2 vía LeRobot, DROID). No se dispone de datos numéricos para comparar rendimiento entre ellas.

## Limitaciones y advertencias
- El modelo está especializado en manipulación robótica; no es un modelo de lenguaje general y no debe usarse para tareas de texto, código o matemáticas.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre datasets de demostración teleoperada, puede heredar sesgos de las condiciones de recogida (escenas, objetos, morfologías).
- Riesgo de alucinación: no evaluado en la información disponible; en robótica, errores de política pueden traducirse en acciones inseguras, por lo que se recomienda supervisión y límites de seguridad en hardware real.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados; las instrucciones de LIBERO están en lenguaje natural, pero no se especifica cobertura multilingüe.
- Licencia: NVIDIA Open Model License permite uso comercial y no comercial según los términos del acuerdo; es necesario revisar el texto completo para obligaciones de atribución y restricciones.
- El model card contiene una referencia inconsistente al backbone (enlace a Cosmos-Reason2-8B mientras se indica Cosmos-Reason2-2B); conviene verificar la versión efectiva antes de desplegar.
- No se documentan cuantizaciones ni formatos alternativos a safetensors, lo que puede limitar el despliegue en hardware de menor capacidad.
- El rendimiento en robots reales puede diferir del benchmark LIBERO; se recomienda validación específica antes de producción.

## Enlaces
- Hugging Face: https://huggingface.co/nvidia/GR00T-N1.7-LIBERO
- Colección GR00T N1.7: https://huggingface.co/collections/nvidia/gr00t-n17
- GitHub Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Web oficial Isaac GR00T: https://developer.nvidia.com/isaac/gr00t
- White paper (arXiv:2503.14734): https://arxiv.org/abs/2503.14734
- Backbone Cosmos-Reason2-2B: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Dataset LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- Dataset BridgeData V2 (LeRobot): https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot
- Dataset DROID: https://droid-dataset.github.io/
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
