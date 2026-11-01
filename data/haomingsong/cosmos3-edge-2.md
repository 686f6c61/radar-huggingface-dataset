# HaomingSong/Cosmos3-Edge

## Resumen

Cosmos3-Edge es un modelo base de robótica desarrollado originalmente por NVIDIA y redistribuido por HaomingSong como una conversión al formato de políticas de LeRobot. No se trata de un modelo de lenguaje conversacional, sino de una política visomotora que predice conjuntamente trozos de acción (action chunks) y latentes de vídeo futuro a partir de observaciones de cámara e instrucciones en lenguaje natural. El paquete incluye el backbone Nemotron 3 Dense VL MoT, un VAE Wan2.2, ficheros de tokenizador y procesadores serializados de LeRobot.

El modelo está pensado como punto de partida para post-entrenamiento de políticas robóticas, no como un modelo listo para producción. La conversión no añade ningún ajuste específico de tarea, y el autor advierte explícitamente de que no se han publicado tasas de éxito en bucle cerrado (por ejemplo, LIBERO) para este checkpoint base. Su relevancia actual radica en que permite integrar un modelo fundacional de NVIDIA dentro del ecosistema LeRobot con una interfaz de política estandarizada.

El checkpoint almacena 4.563.688.396 escalares en 1188 tensores (1184 en BF16 y 4 en FP32), aunque esa cifra incluye componentes congelados y el VAE, por lo que no equivale al número de parámetros entrenables o activos. El repositorio ocupa 9,2 GB y la licencia es OpenMDW 1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Dense VL MoT (backbone); política `cosmos3_edge` con decodificador de 28 capas y anchura oculta 2048 |
| Parametros totales | 4.563.688.396 escalares almacenados (incluye componentes congelados y VAE Wan2.2; no equivale a parámetros entrenables) |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16, con 4 tensores FP32 del time-embedder) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw1.1-license`) |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El backbone es Nemotron 3 Dense VL MoT, un transformer denso multimodal con decodificador de 28 capas y anchura oculta de 2048. La política opera en modo conjunto vídeo-y-acción (`wam`): dado un paso de observación único (imágenes de cámara) y una instrucción en lenguaje, predice simultáneamente trozos de acción y latentes de vídeo futuro, con condicionamiento opcional sobre el estado actual del robot. El paquete incorpora un VAE Wan2.2 para la parte de vídeo y utiliza el muestreador UniPC para la difusión.

La conversión a LeRobot preserva los pesos en BF16 del checkpoint original de NVIDIA (revisión `344d602b128d1bbdacb43b08d0a3626f46343e29`), salvo cuatro tensores del time-embedder en FP32, y añade los módulos de acción liberados. El autor no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información correspondería a la model card original de NVIDIA, no incluida aquí. La receta de post-entrenamiento por defecto (vía `--policy.path`) reproduce el ajuste DROID: dominio 8, chunks de 32 pasos, condicionamiento de estado, normalización identidad, UniPC con 4 pasos de inferencia y guidance 3. La ruta alternativa (`--policy.type=cosmos3_edge`) aplica la receta LIBERO por defecto: dominio 5, chunks de 16 pasos, sin condicionamiento de estado, normalización por cuantiles, UniPC con 30 pasos y guidance 1.

## Capacidades

- Predicción conjunta de acciones robóticas y latentes de vídeo futuro a partir de observaciones de cámara e instrucciones en lenguaje.
- Condicionamiento opcional sobre el estado actual del robot (state conditioning).
- Generación de trozos de acción (action chunks) configurables en longitud (32 pasos en receta DROID, 16 en receta LIBERO).
- Procesamiento multimodal visión-lenguaje mediante el backbone Nemotron 3 Dense VL.
- Compatibilidad con la interfaz de políticas de LeRobot (`cosmos3_edge`), incluyendo carga de configuración y post-entrenamiento.
- Muestreo mediante UniPC con número de pasos y guidance configurables.
- No expone las APIs originales de razonamiento, audio ni generación de vídeo autónoma del modelo de NVIDIA.

## Casos de uso

- Post-entrenamiento de políticas de manipulación con datos propios: partiendo del checkpoint base y de la receta DROID o LIBERO, se puede ajustar el modelo con un dataset de robot concreto para adaptar las acciones a una tarea específica.
- Investigación en modelos fundacionales de robótica: sirve como referencia reproducible para comparar políticas visomotoras dentro del ecosistema LeRobot, gracias a la conversión documentada y verificada en CPU.
- Predicción de vídeo futuro como señal auxiliar: los latentes de vídeo permiten estudiar el comportamiento anticipatorio del modelo antes de ejecutar acciones, útil en análisis de planificación.
- Prototipado de control visomotor en laboratorio: con un único paso de observación y condicionamiento de estado, encaja en bucles de control que requieren predicciones de acción por chunk.
- Evaluación de recetas de normalización y muestreo: las dos configuraciones predefinidas (identidad frente a cuantiles; UniPC con 4 frente a 30 pasos) permiten estudiar su impacto en el rendimiento de la política.
- Integración en pipelines de LeRobot: al ser compatible con `PreTrainedConfig` y las entradas de entrenamiento de LeRobot, se puede incorporar en flujos de experimentación existentes sin reescribir la infraestructura.
- Base para ablaciones sobre módulos de acción: la opción `load_action_modules=false` permite reinicializar las proyecciones de acción para estudiar el efecto del preentrenamiento en esas capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reporta tasa de éxito en bucle cerrado de LIBERO para esta conversión base, y que los resultados de checkpoints LIBERO ajustados por separado o de los modelos Policy-DROID de NVIDIA no miden este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 9,2 GB en BF16, por lo que la inferencia en BF16 requeriría al menos ese orden de magnitud de memoria, sin contar activaciones ni el VAE.
- GPU recomendadas: no especificadas por el autor. Por tamaño y precisión BF16, cabría esperar GPUs de centro de datos (A100, H100) o consumer de gama alta con suficiente VRAM; no hay confirmación oficial.
- ¿Cabe en GPU consumer? No confirmado. El tamaño del repo (9,2 GB) sugiere que podría caber en GPUs con 16 GB o más en BF16, pero no hay datos publicados de pruebas en consumer.
- Opciones de despliegue: LeRobot (librería principal), con soporte de carga en CPU verificada por el autor. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política robótica.
- Latencia y throughput: no disponibles. La receta DROID usa UniPC con 4 pasos de inferencia y la LIBERO con 30, lo que afecta directamente al coste por predicción, pero no se publican cifras absolutas.
- Para inferencia se recomienda `--policy.dtype=bfloat16` y, en evaluación, `--tf32=false`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Edge (esta conversión) | 4.563.688.396 escalares almacenados | no disponible | Sin benchmarks publicados para este checkpoint | OpenMDW 1.1 | HuggingFace (HaomingSong/Cosmos3-Edge) |
| nvidia/Cosmos3-Edge (original) | no disponible en la información proporcionada | no disponible | No disponible en la información proporcionada | OpenMDW 1.1 | HuggingFace (nvidia/Cosmos3-Edge) |
| Otras políticas LeRobot | no disponible | no disponible | no disponible | varía según modelo | HuggingFace / LeRobot |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un checkpoint base sin ajuste específico de tarea y sin métricas de éxito en bucle cerrado publicadas.
- Las características de observación y acción guardadas están vacías; el dataset objetivo debe proporcionar el frame rate y el tamaño de cámara antes de construir la política.
- El número de escalares almacenados no refleja parámetros entrenables ni activos; incluye VAE, tokenizador y componentes congelados.
- No expone las APIs de razonamiento, audio ni generación de vídeo del modelo original de NVIDIA.
- Soporte limitado a modo conjunto vídeo-y-acción (`wam`), un único paso de observación y el muestreador UniPC.
- Riesgo de alucinación y sesgos: el autor remite a los documentos SAFETY, BIAS, PRIVACY y EXPLAINABILITY del modelo original de NVIDIA, no incluidos en esta información.
- Restricciones de licencia: OpenMDW 1.1 exige conservar la licencia y los avisos de copyright y origen al redistribuir; conviene revisar los términos para uso comercial.
- El software de runtime instalado por separado mantiene sus propias licencias.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HaomingSong/Cosmos3-Edge
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge/tree/344d602b128d1bbdacb43b08d0a3626f46343e29
- Model card original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/README.md
- Notas de seguridad: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/SAFETY.md
- Notas de sesgos: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/BIAS.md
- Notas de privacidad: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/PRIVACY.md
- Notas de explicabilidad: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/EXPLAINABILITY.md
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
