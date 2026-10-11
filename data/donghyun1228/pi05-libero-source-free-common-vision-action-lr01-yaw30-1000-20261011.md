# Donghyun1228/pi05-libero-source-free-common-vision-action-lr01-yaw30-1000-20261011

## Resumen

Este repositorio contiene un checkpoint de politica robótica (vision-language-action) entrenado sobre la pila openpi y etiquetado por el autor como `pi05`, orientado al benchmark de manipulación LIBERO. El autor es Donghyun1228 y la publicación se realizó el 10 de octubre de 2026. La variante se denomina "yaw30" y corresponde a un experimento de adaptación "target-only" de visión y acción comunes: se entrena un codificador de visión compartido y un adaptador LoRA de acción mediante un IDM nativo, mientras que en despliegue se emplea el codificador base adaptado junto con un codificador de muñeca de la fuente original.

El interés técnico del artefacto está en su metodología de adaptación sin fuente: según la model card, no se utilizan observaciones del dominio fuente, ni caché de profesor emparejado, ni retroalimentación de éxito de tarea, ni rollouts exitosos. Además, el autor advierte explícitamente que la publicación por sí sola no establece ninguna tasa de éxito de política, por lo que se trata de un artefacto de investigación reproducible más que de un modelo validado para producción.

El repositorio ocupa 6,9 GB e incluye los pesos de despliegue, los activos de normalización y código de inferencia, aunque omite el estado del optimizador. El checkpoint publicado corresponde al paso 999 tras 1000 actualizaciones con batch de 32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de la familia openpi/pi0.5, con codificador de visión compartido y adaptador LoRA de acción; detalles completos no disponibles |
| Parametros totales | no disponible (el repositorio ocupa 6,9 GB, mayoritariamente pesos en BF16) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se cargan y restauran en BF16 mediante el cargador original de la política) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible con precisión; el autor indica que el wrapper restaura "all 84 leaves" mediante el cargador BF16 original y que los activos de normalización están incluidos |

## Arquitectura y entrenamiento

La model card describe el método como "target-only common vision and action adaptation: yaw30". Un IDM (modelo de dinámica inversa) nativo entrena simultáneamente el codificador de visión compartido y un adaptador LoRA sobre las acciones. En el momento del despliegue, se utiliza el codificador base adaptado más un codificador de muñeca independiente procedente de la fuente original. El mismo procedimiento se aplica a las condiciones de vista y de marco de acción.

El entrenamiento no emplea observaciones del dominio fuente, caché de profesor emparejado, retroalimentación de éxito de tarea ni rollouts de tareas exitosas. Las actualizaciones del LoRA de acción se multiplican por 0,1 después de la actualización nativa de AdamW, mientras que las actualizaciones de visión conservan su tasa de aprendizaje nativa. El checkpoint publicado es el paso 999 tras 1000 actualizaciones con batch 32. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de acciones motoras para manipulación robótica en el entorno LIBERO, condicionada por observaciones visuales y por la tarea.
- Adaptación de visión y acción mediante LoRA entrenado con un IDM nativo, sin acceso a datos del dominio fuente.
- Ejecución de inferencia a través del wrapper incluido `code/common_vision_action_inference.py` con la configuración `pi05_libero_source_free_split_vision_action_lora_idm`.
- Soporte de condiciones de vista y de marco de acción mediante la misma receta de adaptación.
- Integración con MuJoCo 3.2.3 para el benchmark LIBERO.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general ni procesamiento de audio.

## Casos de uso

- Evaluación en el benchmark LIBERO: el modelo está configurado específicamente para ejecutarse sobre LIBERO con MuJoCo 3.2.3, por lo que sirve como punto de partida para reproducir experimentos de manipulación en simulación.
- Investigación en adaptación sin fuente (source-free adaptation): permite estudiar si un codificador de visión y un adaptador de acción pueden adaptarse a un dominio objetivo sin observaciones, profesor ni retroalimentación de éxito del dominio origen.
- Estudio de LoRA aplicado a políticas robóticas: el escalado de las actualizaciones del LoRA de acción por 0,1 tras AdamW es una decisión de diseño concreta que puede analizarse o compararse en ablaciones.
- Base para comparativas de arquitecturas de codificación visual: al separar codificador base adaptado y codificador de muñeca de la fuente original, facilita experimentos sobre qué encoder aporta cada señal.
- Reproducción de resultados con código fijado: el autor indica un commit concreto (`0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`), lo que permite reconstruir el entorno de inferencia de forma determinista.
- Punto de partida para ajuste posterior: al incluir los activos de normalización y omitir el estado del optimizador, es adecuado como inicialización para nuevos entrenamientos sobre LIBERO, asumiendo que se disponga de licencia y datos propios.
- Validación de wrappers de despliegue: el wrapper incluido permite probar la restauración de los 84 "leaves" del árbol de parámetros con el cargador BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card declara de forma explícita que "this publication alone establishes no policy success rate", es decir, que la publicación por sí sola no establece ninguna tasa de éxito de política.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio ocupa 6,9 GB y los pesos se cargan en BF16, por lo que se necesita al menos espacio para esos pesos más las activaciones y los codificadores de visión; una GPU con 16 GB o más es un punto de partida razonable, pero es una estimación, no un dato del autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint sugiere que no cabría en GPUs de gama baja con 8 GB, aunque no hay confirmación del autor.
- Opciones de despliegue: la librería declarada es openpi, con el wrapper `code/common_vision_action_inference.py` y la configuración `pi05_libero_source_free_split_vision_action_lora_idm`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que son irrelevantes para este tipo de política.
- Entorno de simulación: se requiere MuJoCo 3.2.3 para LIBERO.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este checkpoint, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-source-free-common-vision-action-lr01-yaw30-1000-20261011 | no disponible | no disponible | no publicado por el autor | no disponible | HuggingFace |
| Otras politicas VLA de la familia openpi/pi0.5 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria (VLA para LIBERO) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card indica explícitamente que la publicación no establece ninguna tasa de éxito de política: no debe asumirse que el checkpoint funcione correctamente en tareas reales.
- No se declara licencia, por lo que el uso comercial queda sin autorización clara y no debería asumirse permitido.
- El modelo está diseñado para entornos de simulación LIBERO con MuJoCo 3.2.3; no hay evidencia de transferencia a robots físicos.
- No se documentan idiomas soportados ni longitud de contexto, lo que limita el análisis de capacidades multilingües o de instrucciones largas.
- El autor advierte que la fuente legacy no tiene una referencia pública verificada en HuggingFace dentro de sus registros, aunque todos los pesos de despliegue se incluyen en este repositorio; los caminos locales de los registros documentan procedencia, lo que puede dificultar la trazabilidad externa.
- El estado del optimizador no está incluido, por lo que reanudar el entrenamiento exactamente desde el paso 999 no es posible con este artefacto.
- No hay métricas de sesgo, alucinación o robustez, ya que se trata de una política de acción y no de un modelo generativo de texto.
- Cero descargas y cero "likes" en el momento de la consulta: no existe validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-source-free-common-vision-action-lr01-yaw30-1000-20261011
- Repositorio de la librería openpi referenciada por el modelo: https://github.com/PhysicalIntelligence/openpi
- Commit de código indicado en la model card: `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08` (sin URL pública verificada en la información disponible)
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
