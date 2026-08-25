# reproducible-ai/GR00T

## Resumen

El modelo `reproducible-ai/GR00T` es un *canary* de reproducibilidad publicado por Reproducible AI, un grupo dedicado a garantizar que los pipelines de entrenamiento de modelos de IA sean verificables y replicables. Se trata de un fine-tuning de un solo paso de optimizador sobre el modelo base `nvidia/GR00T-N1.7-3B`, un modelo vision-language-action (VLA) de NVIDIA para tareas de manipulación robótica en humanoides. El objetivo no es ofrecer un modelo con capacidades de despliegue, sino demostrar que el pipeline de entrenamiento reproducible (con fuentes fijadas, hashes SHA-256 y verificación de integridad) puede generar un checkpoint legible y verificable.

El modelo base GR00T N1.7 es un VLA de código abierto que toma entradas multimodales (lenguaje e imágenes) y genera acciones de control para robots. El *canary* aquí presentado se ha entrenado sobre solo tres episodios del dataset DROID, con un *global batch size* de 1, y su `evaluation.json` registra el número de paso, el log de entrenamiento, el tamaño, el hash SHA-256 y la forma de cada shard de pesos. No se trata de un modelo de calidad, convergencia ni seguridad, sino de una prueba de concepto metodológica.

La relevancia de este modelo radica en su contribución a la reproducibilidad en robótica de IA, un campo donde la variabilidad de los entornos y los datos dificulta la replicación de resultados. Al fijar las versiones exactas de la fuente, el modelo base y el dataset, y al publicar la verificación criptográfica, permite que cualquier investigador confirme que el entrenamiento se ejecutó exactamente como se declara. No obstante, no debe usarse en aplicaciones reales de robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en `nvidia/GR00T-N1.7-3B`, con backbone VLM `nvidia/Cosmos-Reason2-2B` |
| Parametros totales | ~3.7 mil millones (del modelo base GR00T-N1.7-3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el modelo base soporta inglés y probablemente otros idiomas, pero no se especifica) |
| Licencia | NVIDIA License (no comercial, solo investigación y evaluación) |
| Formato de pesos | Safetensors (probablemente, aunque no se especifica explícitamente) |

## Arquitectura y entrenamiento

El modelo base GR00T N1.7 es un VLA de NVIDIA que combina un codificador visual (basado en Cosmos-Reason2-2B) y un modelo de lenguaje para procesar imágenes y lenguaje natural, generando acciones de control de robot (posiciones de articulaciones o poses de efector final). El modelo original se entrenó con datos de teleoperación y simulación a gran escala. En este canary, el fine-tuning se realizó con un solo paso de optimizador, *global batch size* 1, sobre tres episodios del dataset DROID (`lerobot/droid_1.0.1`). No se aplicó RLHF ni DPO; es un entrenamiento supervisado simple.

La innovación principal de este proyecto no está en la arquitectura sino en el pipeline de reproducibilidad: se fija el commit exacto del repositorio fuente (`457606c884338b0dc1b8e2135cd08c63736e7cd7`), el commit del modelo base (`2fc962b973bccdd5d8ce4f67cc63b264d6886495`), el commit del dataset (`0eabc778f959c54b8c5aa3626cc1128d2d2e54d4`) y se registra el hash SHA-256 de cada shard de pesos en `evaluation.json`. Esto permite verificar que el checkpoint no ha sido alterado y que el entrenamiento se ejecutó exactamente como se documenta.

## Capacidades

- El modelo base GR00T N1.7 es capaz de recibir imágenes y lenguaje, y generar acciones de control para robots manipuladores en entornos variados.
- Soporta tareas de manipulación como alcanzar, agarrar, apilar y mover objetos, así como habilidades de interacción con el entorno.
- Es un modelo de *cross-embodiment*: puede adaptarse a diferentes morfologías de robots (bípedos, brazos, etc.).
- Este checkpoint canary **no** tiene capacidades de despliegue reales, ya que se entrenó con un solo paso y solo tres episodios. Su única función es demostrar la reproducibilidad del pipeline.

## Casos de uso

- **Verificación de reproducibilidad**: el uso principal es como referencia para confirmar que el pipeline de entrenamiento de Reproducible AI produce resultados deterministas y verificables. Los investigadores pueden comparar sus propios checkpoints con este canary para asegurar que su configuración es idéntica.
- **Auditoría de integridad**: el `evaluation.json` con hashes SHA-256 permite auditar si los pesos han sido modificados o si el entrenamiento se ejecutó tal como se declara. Útil para instituciones que exigen trazabilidad.
- **Desarrollo de pipelines de robótica**: los desarrolladores pueden usar este canary como plantilla para configurar sus propios pipelines de entrenamiento VLA con verificación criptográfica.
- **Investigación en reproducibilidad**: para estudios académicos sobre cómo fijar versiones de software, modelos y datos para garantizar replicabilidad.
- **Formación y documentación**: puede servir como ejemplo práctico de cómo se debe documentar un entrenamiento de IA (versiones, hashes, logs).
- **Integración en CI/CD**: aunque no es un modelo de producción, su estructura de verificación puede integrarse en sistemas de integración continua para validar que los entrenamientos no han sido alterados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo canary no ha sido evaluado en tareas de robótica, ya que su propósito es solo de reproducibilidad, no de calidad.

## Requisitos de hardware

- Para inferencia del modelo base GR00T N1.7 (3.7B parámetros) en FP16, se estima que se necesitan al menos 8 GB de VRAM para la parte del lenguaje, más memoria adicional para el procesamiento de imágenes (dependiendo de la resolución). Una GPU como RTX 3090, RTX 4090 o A100 puede ejecutar el modelo.
- Para el canary específico, al ser un modelo de un solo paso, no tiene sentido desplegarlo en producción. En todo caso, para ejecutar el modelo base se recomienda una GPU con al menos 16 GB de VRAM para incluir la entrada de imágenes.
- Opciones de despliegue: aunque el modelo es robótico, puede ejecutarse con frameworks de inferencia estándar como vLLM, llama.cpp (si se convierte a GGUF) o TGI. Para robótica real, se suele integrar en un bucle de control con ROS o similares.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tamaño | Arquitectura | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| GR00T N1.7 (NVIDIA) | 3.7B | VLA (VLM + acción) | no disponible | NVIDIA license (no comercial) | Robótica humanoides |
| OpenVLA (Stanford) | 7B | VLA (LLM + visión) | 2048 tokens | MIT | Robótica manipuladora |
| RT-2 (Google) | 55B | VLM + acción | 32k tokens | no pública | Robótica |

El modelo canary es un fine-tuning de GR00T N1.7, por lo que hereda la arquitectura y licencia del modelo base. OpenVLA es una alternativa abierta (MIT) con más parámetros y contexto, pero sin la optimización específica para humanoides. RT-2 es propietario y no accesible. Este canary no tiene valor comparativo de rendimiento, solo de reproducibilidad.

## Limitaciones y advertencias

- **No es un modelo de producción**: fue entrenado con un solo paso de optimizador y solo tres episodios de datos. No tiene capacidades reales de control robótico.
- **Licencia restrictiva**: la NVIDIA License limita su uso a investigación y evaluación no comercial. Derivados y usos comerciales están prohibidos.
- **Sin evaluación de seguridad**: no ha sido probado para aplicaciones de seguridad funcional. No debe usarse en robots que interactúen con personas o en entornos reales.
- **Sesgos**: no hay datos sobre sesgos, pero como hereda del modelo base, puede presentar sesgos de los datos de entrenamiento (DROID es un dataset de teleoperación, con ciertas distribuciones de tareas).
- **Contexto limitado**: no se especifica la longitud de contexto; el modelo base puede tener limitaciones en secuencias largas.
- **Idiomas**: no se especifican idiomas soportados; probablemente solo inglés.
- **Dependencia de versiones**: el checkpoint depende de commits exactos de la fuente y del modelo base. Cualquier cambio en las dependencias puede romper la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/reproducible-ai/GR00T
- Repositorio fuente (GitHub): https://github.com/NVIDIA/Isaac-GR00T
- Paper GR00T N1: https://arxiv.org/abs/2503.14734
- Documentación NVIDIA Developer: https://developer.nvidia.com/isaac/gr00t
- Curso de NVIDIA sobre GR00T: https://docs.nvidia.com/learning/physical-ai/gr00t-e2e-workflow/latest/index.html
- Ejemplo de AWS para entrenamiento GR00T: https://github.com/aws-samples/sample-embodied-ai-platform/blob/main/training/gr00t/README.md
