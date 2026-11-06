# henry13522/Taskanchor

## Resumen

TaskAnchor–π0.5 es un checkpoint de inferencia para robótica publicado por el usuario henry13522 en Hugging Face. Se trata de un ajuste fino del modelo π0.5 (pi05) de Physical Intelligence, orientado a tareas de manipulación robótica dentro del entorno de evaluación RoboMemArena. El modelo incorpora un módulo denominado TaskAnchor, que añade memoria temporal sobre la observación actual mediante la proyección de características visuales históricas, y está empaquetado en formato nativo JAX/Orbax (OCDBT), no en Safetensors.

El checkpoint corresponde al paso 50.000 de entrenamiento (50k), con un payload de inferencia de aproximadamente 10,86 GiB que incluye los pesos completos del backbone y del módulo TaskAnchor, además de tokenizador PaliGemma, estadísticas de normalización y assets de memoria. No se publican puntuaciones de benchmarks en el repositorio, y el código fuente de inferencia se anuncia como publicación separada en GitHub.

La relevancia de este modelo es acotada: es un artefacto de investigación para reproducción de experimentos en RoboMemArena, no un modelo de propósito general. Su licencia hereda los términos de Gemma/π0.5/PaliGemma, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base π0.5 / PaliGemma) con módulo TaskAnchor de memoria temporal; proyección 1152→512→1152, 8 capas temporales, 8 cabezas, dropout 0,10 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; retiene frame0 permanente más hasta 191 frames de historial con stride 10 |
| Tipos de cuantizacion | no disponible (pesos en formato nativo JAX/Orbax OCDBT) |
| Idiomas soportados | en |
| Licencia | gemma-terms (otros términos; ver LICENSE_GEMMA.txt y NOTICE); código fuente separado bajo Apache-2.0 |
| Formato de pesos | JAX/Orbax OCDBT (no Safetensors); tokenizador PaliGemma |

## Arquitectura y entrenamiento

El modelo parte de π0.5, un modelo de política robótica basado en PaliGemma, y le añade TaskAnchor, un mecanismo de memoria que combina la observación actual con un offset refinado (`refined = current + offset`). La vista de muñeca (wrist) permanece como observación actual, mientras que las características visuales históricas se agrupan (pooling) a 4×4 tokens por frame. Las imágenes de entrada son de 224×224. El módulo temporal usa ocho capas, ocho cabezas y una proyección 1152→512→1152 con dropout de 0,10.

El entrenamiento registrado corresponde a 5.000 pasos solo del adaptador seguidos de 45.000 pasos conjuntos, con el codificador visual congelado durante todo el proceso. El batch global de entrenamiento registrado es 256. En inferencia, el modelo predice 20 acciones y ejecuta 10 antes de replanificar; las predicciones continuas de progreso se mapean a la coordenada de etapa específica de la tarea más cercana, con dos decimales. Los ajustes numéricos completos se conservan en `recipe.json` y en los metadatos del checkpoint.

## Capacidades

- Predicción de acciones robóticas en formato de trayectoria (20 acciones predichas, 10 ejecutadas antes de replanificar).
- Memoria temporal sobre observaciones visuales: frame0 permanente más hasta 191 frames de historial con stride 10.
- Condicionamiento por etapa de tarea mediante predicción continua de progreso mapeada a coordenadas de etapa.
- Procesamiento de vistas múltiples (vista principal refinada y vista de muñeca como observación actual).
- Entrada de imágenes a 224×224 con tokenizador PaliGemma.
- No se documentan capacidades de tool calling, agentes de texto, generación de código ni matemáticas; el modelo es específico de robótica.
- Idioma de trabajo: inglés (según metadatos).

## Casos de uso

- Reproducción de experimentos en RoboMemArena: cargar el checkpoint en el código de inferencia TaskAnchor y evaluar el rendimiento en las tareas del entorno con las mismas condiciones de entrenamiento registradas.
- Investigación en memoria temporal para políticas robóticas: el módulo TaskAnchor con pooling 4×4 y hasta 191 frames permite estudiar cómo afecta el historial visual a la predicción de acciones.
- Manipulación con replanificación frecuente: predecir 20 acciones y ejecutar 10 encaja en bucles de control que requieren corrección periódica ante cambios del entorno.
- Condicionamiento por progreso de tarea: el mapeo de progreso continuo a coordenadas de etapa permite segmentar tareas largas en fases discretas.
- Evaluación de políticas con vistas múltiples: útil para configuraciones con cámara principal y cámara de muñeca en plataformas de manipulación.
- Base para ajuste fino adicional: al incluir pesos completos (no solo delta de adaptador) y estadísticas de normalización, sirve como punto de partida para nuevos entrenamientos en dominios similares.
- Verificación de integridad de checkpoints: los manifiestos `SHA256SUMS`, `weights_manifest.json` y `release_manifest.json` permiten auditar la reproducibilidad de la carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se publican puntuaciones en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el payload de inferencia es de aproximadamente 10,86 GiB en formato JAX/Orbax, por lo que se requiere al menos esa cantidad de memoria más overhead de ejecución.
- GPU recomendadas: no disponible; el checkpoint se restauró en CPU para verificación de valores finitos, pero no se documentan requisitos de GPU.
- ¿Cabe en GPU de consumo? no disponible; dependerá del framework JAX y del overhead, no confirmado por el autor.
- Opciones de despliegue: código de inferencia TaskAnchor (no publicado aún en el momento de la ficha); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TaskAnchor–π0.5 (este) | no disponible | no disponible (191 frames historial) | sin benchmarks publicados | gemma-terms | Hugging Face, código pendiente |
| π0.5 (OpenPI) | no disponible en la información | no disponible | no disponible | según upstream | GitHub OpenPI |
| RoboMemArena (entorno) | no aplica (entorno de evaluación) | no aplica | no aplica | no disponible | GitHub OpenHelix-Team |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se publican benchmarks, por lo que no es posible verificar su rendimiento frente a alternativas.
- El código de inferencia no está incluido en el repositorio; se anuncia su publicación separada en GitHub, lo que limita la reproducibilidad inmediata.
- Formato de pesos no estándar (JAX/Orbax OCDBT), incompatible con herramientas habituales de Safetensors/GGUF.
- Licencia gemma-terms: restricciones de uso comercial heredadas de Gemma/π0.5/PaliGemma; el código fuente Apache-2.0 no sustituye los términos de los pesos.
- Idioma limitado a inglés según metadatos.
- Modelo específico de robótica: no es un modelo de lenguaje general ni soporta tool calling o agentes de texto.
- Riesgo de sobreajuste al entorno RoboMemArena y a las condiciones de entrenamiento registradas (batch 256, codificador visual congelado).
- No se incluye estado del optimizador, por lo que no es directamente reanudable para entrenamiento.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de predicciones de acción erróneas fuera de distribución.

## Enlaces

- Hugging Face: https://huggingface.co/henry13522/Taskanchor
- Licencia Gemma: https://huggingface.co/henry13522/Taskanchor/blob/main/LICENSE_GEMMA.txt
- Términos Gemma: https://ai.google.dev/gemma/terms
- OpenPI (upstream): https://github.com/Physical-Intelligence/openpi
- RoboMemArena (upstream): https://github.com/OpenHelix-Team/RoboMemArena
