# Justrinsato/tiny-transformer-contrastive

## Resumen

El modelo `Justrinsato/tiny-transformer-contrastive` es una implementación compacta y personalizada de un Transformer en PyTorch, diseñada específicamente para experimentos con aprendizaje contrastivo. Lo desarrolla el usuario Justrinsato (perfil de Hugging Face asociado a Simon K. Thompson) y se publica con licencia MIT. No se trata de un modelo preentrenado ni de un checkpoint con resultados verificados, sino de una base de código y un checkpoint de inicialización para pruebas de humo, revisión de código y experimentos controlados a pequeña escala.

La arquitectura es un Transformer diminuto con atención dilatada, fusión mediante concatenación con MLP, activación Swish y normalización de instancia. El tamaño total de parámetros es de 16.576, lo que lo convierte en un modelo extremadamente ligero, ejecutable en cualquier hardware, incluso en CPU. Su relevancia actual radica en servir como punto de partida para investigadores que quieran experimentar con arquitecturas Transformer personalizadas y objetivos contrastivos sin la complejidad de modelos grandes.

El repositorio incluye un script `finetune.py` con un ejemplo ejecutable, un `config.json` con la configuración de arquitectura, un `training_args.json` con una receta de entrenamiento por defecto (optimizador lamb y scheduler polinomial) y un checkpoint `model.safetensors` de inicialización. No se reportan métricas de rendimiento en ningún benchmark, y el propio autor advierte que el checkpoint no ha sido entrenado ni auditado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención dilatada, fusión concat MLP, activación swish, normalización instancenorm) |
| Parámetros totales | 16.576 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Transformer compacto con atención dilatada, en lugar de la atención estándar. El mecanismo de fusión se realiza concatenando las representaciones y pasándolas por un MLP, y la activación utilizada es swish (SiLU). La normalización se aplica sobre instancias (instance norm), una elección poco común en Transformers generativos pero típica en tareas de representación contrastiva. El modelo está configurado en su escala "base", que en este contexto se refiere a una configuración mínima para pruebas.

No se proporcionan datos sobre el entrenamiento: no se indica el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El archivo `training_args.json` contiene una receta por defecto con optimizador lamb y un scheduler polinomial, pero la documentación aclara que son valores iniciales y no evidencian un entrenamiento completado. El checkpoint `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, no un modelo entrenado. La implementación es personalizada, por lo que las APIs genéricas de HuggingFace requieren un adaptador explícito para cargar el modelo.

## Capacidades

- No se han demostrado capacidades funcionales porque el modelo no está entrenado.
- Puede utilizarse para ejecutar un ejemplo de entrenamiento de aprendizaje contrastivo a pequeña escala.
- Permite experimentar con arquitecturas de atención dilatada y normalización de instancia en un contexto educativo.
- Al ser extremadamente pequeño, es adecuado para depurar y probar el flujo de entrenamiento en entornos de desarrollo.

## Casos de uso

- Experimentos educativos: estudiantes e investigadores pueden estudiar el funcionamiento interno de un Transformer contrastivo con este modelo, gracias a su tamaño mínimo y a la implementación clara en un único archivo Python.
- Pruebas de humo para pipelines de entrenamiento: sirve para validar que el código de entrenamiento, la carga de datos y el bucle de optimización funcionan correctamente antes de escalar a modelos mayores.
- Desarrollo de nuevas técnicas de aprendizaje contrastivo: al ser una base minimalista, se puede modificar fácilmente para probar variaciones de la arquitectura, como distintos tipos de atención o funciones de pérdida.
- Depuración de entornos de ejecución: en entornos donde se requiera un modelo pequeño para comprobar la compatibilidad de librerías (PyTorch, transformers, etc.), este modelo cumple esa función.
- Benchmarking de recursos: se puede medir el consumo de memoria y tiempo de inferencia de una arquitectura Transformer en dispositivos muy limitados, como microcontroladores o dispositivos edge.
- Desarrollo de adaptadores personalizados: dado que la implementación no es estándar, puede usarse como caso de prueba para desarrollar adaptadores de HuggingFace para arquitecturas no convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica que no se reclama ninguna puntuación de evaluación en este repositorio.

## Requisitos de hardware

- Al tratarse de un modelo de solo 16.576 parámetros, la inferencia y el entrenamiento son posibles en cualquier CPU moderna y en GPU de consumo (por ejemplo, RTX 3060 o inferiores).
- La VRAM estimada es mínima, por debajo de 1 GB incluso en precisión float32.
- Es viable ejecutarlo en dispositivos sin GPU, como Raspberry Pi o entornos de integración continua.
- Opciones de despliegue: al ser un modelo personalizado, no se puede usar directamente con vLLM, llama.cpp u Ollama; se requiere escribir un script de inferencia con PyTorch.
- La latencia es prácticamente despreciable, aunque no se proporcionan medidas específicas.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que este es un experimento sin entrenamiento y con una arquitectura no estándar. Existen repositorios de TinyTransformer con fines educativos (por ejemplo, los encontrados en GitHub), pero no son modelos entrenados ni publicados en HuggingFace. Por tanto, no se puede realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- El checkpoint de inicialización no ha sido entrenado; no se debe usar para tareas reales de generación o clasificación.
- No se ha auditado la robustez, la equidad ni la transferencia de dominio; el modelo no es adecuado para producción.
- La arquitectura personalizada no es compatible con APIs estándar de HuggingFace sin un adaptador explícito.
- No se conocen los idiomas soportados ni el contexto de entrenamiento, ya que no se han publicado datos de entrenamiento.
- La licencia MIT permite uso comercial, pero se debe revisar los términos de los datos externos si se utilizan con conjuntos de datos de terceros.
- El modelo es extremadamente pequeño, por lo que su capacidad de aprendizaje es limitada y no representa un avance en rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Justrinsato/tiny-transformer-contrastive
- Perfil del autor en HuggingFace: https://huggingface.co/justintransar/models (perfil asociado al usuario Justrinsato)
- Repositorio educativo TinyTransformer (no relacionado directamente): https://github.com/skolouri/TinyTransformer
- Repositorio Tiny Transformer de avvorstenbosch (no relacionado directamente): https://github.com/avvorstenbosch/tinyTransformer
- Artículo sobre arquitecturas Transformer pequeñas para cambio de tareas: https://arxiv.org/abs/2508.04461v1
- Artículo sobre aprendizaje contrastivo con Transformer para pocos ejemplos: https://arxiv.org/abs/2204.02803
