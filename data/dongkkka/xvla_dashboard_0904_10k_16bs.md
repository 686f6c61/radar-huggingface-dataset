# Dongkkka/xvla_dashboard_0904_10k_16bs

## Resumen

Dongkkka/xvla_dashboard_0904_10k_16bs es un modelo de política robótica basado en X-VLA, un modelo de visión-lenguaje-acción (VLA) de tipo "Soft-Prompted Transformer" desarrollado por el laboratorio THU-AIR-DREAM. Este repositorio contiene un fine-tuning completo del modelo base `lerobot/xvla-base` para una tarea concreta: recoger una botella y colocarla en una cesta. El modelo ha sido entrenado con datos de demostración de un robot de 22 dimensiones de acción, utilizando 28 episodios y 5.133 frames, sin split de validación.

El modelo tiene 879.922.925 parámetros en formato safetensors y ocupa 1,8 GB. La arquitectura X-VLA integra soft prompts y desacopla los flujos de entrada de alta y baja dimensión, lo que mejora la estabilidad del entrenamiento y el rendimiento en validación. Este checkpoint es un ejemplo de adaptación de un VLA preentrenado a un dominio robótico específico mediante fine-tuning completo, reinitializando los codificadores y decodificadores de acción para el espacio de 22 dimensiones.

La relevancia de este modelo radica en su uso como referencia para investigar el fine-tuning de VLA en tareas de manipulación con pocos datos, así como para evaluar la reproducibilidad de políticas robóticas mediante el framework LeRobot. No se han publicado evaluaciones de éxito en la tarea ni de generalización, por lo que su utilidad práctica en producción es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Soft-prompted Transformer (X-VLA) |
| Parametros totales | 879.922.925 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en BF16, pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `lerobot/xvla-base`, que a su vez se basa en la arquitectura X-VLA. Según la documentación oficial de X-VLA, esta arquitectura introduce un pipeline de codificación simplificado que integra soft prompts y desacopla explícitamente los flujos de entrada de alta y baja dimensión, lo que proporciona mayor estabilidad de entrenamiento y un rendimiento de validación consistentemente superior.

El entrenamiento se realizó con LeRobot 0.6.1, PyTorch 2.11.0+cu128 y Transformers 5.5.4. Se usaron 28 episodios y 5.133 frames, todos para entrenamiento, sin conjunto de validación. El batch size fue 16, con 10.000 pasos de optimizador, seed 42 y precisión BF16. Se aplicó full fine-tuning, pero los codificadores y decodificadores de acción específicos del dominio se reinitializaron para datos de robot de 22 dimensiones; el VLM preentrenado, el backbone Transformer y los soft prompts se conservaron. Las tasas de aprendizaje fueron 1e-4 para la base, 1e-5 para el VLM, con warmup de 1.000 pasos y decay hasta 10.000. El action chunk es de 30 pasos y las dimensiones de estado/acción son 22. La normalización de estado es identidad, mientras que la normalización de acción utiliza la media y desviación estándar del dataset guardado. El tokenizer empleado es `facebook/bart-large`.

## Capacidades

- Ejecuta políticas de manipulación robótica a partir de imágenes de tres cámaras RGB (cabeza izquierda, muñeca izquierda y muñeca derecha) y de una instrucción de texto.
- Genera secuencias de acciones de 30 pasos (action chunk) para controlar un robot con 22 dimensiones de acción.
- Soporta comandos de posición absoluta para 19 dimensiones (brazos, pinzas, cabeza, elevador) y comandos de velocidad para la base móvil (3 dimensiones).
- Es un fine-tuning específico para la tarea de recoger una botella y colocarla en una cesta.
- Incluye los preprocesadores y postprocesadores guardados, necesarios para la normalización de estados y acciones.
- No se documentan capacidades de tool calling, razonamiento general, agentes ni soporte multilingüe.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como referencia para estudiar cómo un VLA preentrenado se adapta a una tarea de manipulación con solo 28 episodios de demostración. Permite analizar el efecto del fine-tuning completo sobre el modelo base.
- Desarrollo de políticas pick-and-place: el modelo está entrenado para recoger una botella y colocarla en una cesta. Puede utilizarse como punto de partida para transferir el aprendizaje a tareas similares mediante fine-tuning adicional.
- Benchmark de reproducibilidad en robótica: el repositorio incluye la configuración de entrenamiento original, los procesadores guardados y un informe de verificación de recarga. Esto facilita la reproducción de experimentos y la comparación de hiperparámetros.
- Integración en pipelines de LeRobot: el modelo se carga mediante la API de LeRobot (`XVLAPolicy.from_pretrained`), lo que permite integrarlo en sistemas existentes de control robótico basados en esta librería.
- Estudio de normalización y preprocesamiento: los preprocesadores y postprocesadores guardados permiten analizar cómo se normalizan las acciones y estados en un espacio de 22 dimensiones, incluyendo la combinación de comandos de posición absoluta y velocidad.
- Evaluación de estabilidad de entrenamiento: el entrenamiento finalizó correctamente en el paso 10.000 y el checkpoint recargado produce predicciones finitas. Esto sirve como caso de estudio para validar la estabilidad del proceso de fine-tuning en X-VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La validación realizada por el autor confirma únicamente que el checkpoint recargado produce predicciones finitas con forma `(1, 30, 22)` a partir de una muestra real del dataset de entrenamiento, y que el proceso de normalización/postprocesamiento de acciones funciona correctamente. No se ha evaluado el éxito de la tarea robótica ni la generalización a nuevos escenarios.

## Requisitos de hardware

No se dispone de datos oficiales sobre VRAM estimada, GPU recomendada, latencia o throughput. El modelo tiene 879.922.925 parámetros y los pesos en safetensors ocupan 1,8 GB. El despliegue se realiza mediante LeRobot y PyTorch, como se muestra en el ejemplo de carga, que utiliza `XVLAPolicy.from_pretrained(...).to("cuda")`. No se han documentado otras opciones de despliegue como vLLM, llama.cpp, Ollama o TGI, que están orientadas a modelos de lenguaje y no son aplicables a este tipo de política robótica.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El modelo es un fine-tuning de `lerobot/xvla-base`, pero no se han publicado especificaciones de este último en la información disponible. Por tanto, no es posible realizar una comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está entrenado con solo 28 episodios y 5.133 frames, todos utilizados para entrenamiento sin conjunto de validación. No se ha evaluado la generalización.
- La validación solo confirma que el checkpoint carga y produce predicciones finitas; no se ha evaluado el éxito de la tarea robótica real.
- El modelo está especializado en una tarea concreta (recoger botella y colocarla en cesta) y en una configuración específica de robot (22 dimensiones, orden de cámaras y orden de acciones). Cualquier cambio en la configuración del robot o en el entorno requiere un nuevo fine-tuning.
- Las imágenes se redimensionan a 224x224 con padding. El rendimiento puede degradarse si se cambia la resolución o el orden de las cámaras.
- La normalización de acciones es específica del dataset de entrenamiento. Si se usa el modelo sin los preprocesadores y postprocesadores guardados, las predicciones serán incorrectas.
- El tokenizer `facebook/bart-large` se descarga por separado por LeRobot, lo que puede requerir conexión a internet la primera vez.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un fine-tuning de un modelo base que también debe tener licencia compatible. No se especifican restricciones adicionales en la información disponible.
- No se dispone de información sobre sesgos, riesgos de alucinación en el contexto de acciones robóticas ni sobre el comportamiento del modelo en situaciones fuera de distribución.
- El estado del optimizador no está incluido en el repositorio, por lo que no es posible reanudar el entrenamiento desde este checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/Dongkkka/xvla_dashboard_0904_10k_16bs
- Dataset de entrenamiento: https://huggingface.co/datasets/Dongkkka/cyclo_dashboard_0904_test_v30
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Sitio web de X-VLA: https://thu-air-dream.github.io/X-VLA/
- Repositorio de X-VLA: https://github.com/THU-AIR-DREAM/X-VLA
