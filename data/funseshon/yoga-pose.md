# funseshon/yoga-pose

## Resumen

`funseshon/yoga-pose` es un adaptador LoRA (Low-Rank Adaptation) para el modelo de difusión Krea 2, publicado por el usuario funseshon en HuggingFace. Se trata de un DreamBooth-LoRA entrenado sobre la variante Krea-2-Raw y mostrado en la variante Krea-2-Turbo, que permite inyectar el concepto de "sexy yoga pose" en las generaciones de imágenes. El modelo está diseñado para usarse con la librería Diffusers de HuggingFace y se distribuye bajo licencia Apache 2.0.

Este LoRA no es un modelo de lenguaje ni un generador de texto; es un módulo de adaptación para el pipeline de difusión de Krea 2. Su relevancia radica en la posibilidad de controlar la pose de yoga en escenas complejas, como se observa en los ejemplos de la model card (una pantera en Tokio, una biblioteca victoriana, un coche en la costa Amalfitana). Al ser un LoRA, su tamaño de repositorio es de 1.0 GB, aunque el número de parámetros activos del adaptador no se especifica en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base de difusión (Krea-2-Raw) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (es un LoRA, no un modelo completo) |
| Longitud de contexto | no disponible (no aplica a un modelo de difusión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el trigger es en inglés, pero el modelo base puede aceptar otros idiomas según su entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (inferido del uso con Diffusers y el tamaño del repo) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de tipo DreamBooth-LoRA, entrenado sobre el modelo base `krea/Krea-2-Raw`. El modelo base es un pipeline de difusión de texto a imagen, aunque no se dispone de detalles técnicos sobre su arquitectura interna (si es un transformer de difusión, un U-Net, etc.). El entrenamiento se ha realizado mediante la técnica DreamBooth, que consiste en ajustar un modelo preentrenado con un puñado de imágenes de un concepto concreto (aquí, la pose de yoga "sexy") y un token o frase de activación. No se han publicado datos sobre el número de imágenes de entrenamiento, la composición del dataset, ni si se usaron técnicas como RLHF o DPO. El modelo se muestra funcionando en la variante Turbo de Krea 2, que permite generar imágenes en solo 8 pasos de inferencia.

No hay información pública sobre el proceso de entrenamiento, el número de pasos, la tasa de aprendizaje ni otros hiperparámetros. El único dato adicional es que el modelo base es `Krea-2-Raw`, una versión sin ajuste fino de la familia Krea 2.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con el concepto específico de "sexy yoga pose".
- Control de la pose mediante la frase de activación (trigger) `sexy yoga pose`, que debe incluirse en el prompt.
- Compatible con el pipeline `Krea2Pipeline` de Diffusers, permitiendo integrarse con el modelo base Krea-2-Turbo para generar imágenes en 8 pasos.
- No tiene capacidades de razonamiento, código, matemáticas, tool calling ni agentes, ya que es un modelo de difusión.
- No soporta multimodalidad más allá de la generación de imágenes (no procesa imágenes como entrada).
- El idioma del prompt puede variar según el modelo base, pero no hay documentación oficial sobre idiomas soportados.

## Casos de uso

- Creación de contenido visual para instructores de yoga: generar imágenes de referencia de posturas de yoga con un estilo estético concreto, integrando el concepto en escenarios variados (por ejemplo, una biblioteca victoriana con una persona en postura de yoga).
- Ilustración de guías de fitness: producir imágenes para artículos o libros sobre yoga, donde la pose debe ser visualmente atractiva y destacada.
- Generación de imágenes para marketing deportivo: crear campañas publicitarias con una estética de "yoga sexy" para marcas de ropa deportiva o gimnasios.
- Creación de contenido para redes sociales: generar imágenes llamativas con la pose de yoga para publicaciones de Instagram, Pinterest o TikTok.
- Diseño de portadas de revistas o libros de bienestar: combinar la pose con fondos artísticos (ciudades futuristas, bibliotecas, paisajes) para portadas atractivas.
- Prototipado de conceptos para animación o videojuegos: generar referencias de pose para personajes en entornos estilizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como FID, CLIP score, ni comparaciones con otros LoRA o modelos de generación de imágenes.

## Requisitos de hardware

- Al ser un LoRA, los requisitos de VRAM dependen del modelo base (Krea-2-Turbo o Krea-2-Raw). No se especifica el tamaño de estos modelos en la ficha.
- Para inferencia con `Krea2Pipeline` en Diffusers, se requiere una GPU con suficiente memoria para cargar el modelo base. No se indica una cantidad concreta.
- El ejemplo de uso carga el modelo en `torch.bfloat16` y lo ejecuta en CUDA, lo que sugiere que se necesita una GPU con soporte bfloat16 (por ejemplo, RTX 3090, RTX 4090, A100, etc.).
- La generación con Krea-2-Turbo en 8 pasos reduce el tiempo de inferencia, pero no se proporcionan cifras de latencia.
- Opciones de despliegue: se puede usar con Diffusers en un entorno Python con PyTorch, o exportar a ONNX para inferencia en otros entornos. No se menciona soporte para llama.cpp o vLLM (que son para modelos de lenguaje).

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. Este LoRA es específico para Krea 2 y no se puede comparar directamente con otros adaptadores de difusión sin datos de rendimiento.

## Limitaciones y advertencias

- El concepto "sexy yoga pose" puede generar imágenes con connotaciones sexuales o provocativas; se recomienda revisar las políticas de contenido de la plataforma donde se use.
- Es un LoRA, no un modelo completo; requiere el modelo base Krea-2-Raw o Krea-2-Turbo para funcionar.
- No se ha publicado información sobre sesgos en el entrenamiento, pero como adaptador de un concepto visual concreto, puede tener sesgos de estilo o de representación corporal.
- Riesgo de alucinación en la generación de imágenes (poses imposibles o deformidades anatómicas) al ser un modelo de difusión.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar la licencia del modelo base (krea/Krea-2-Raw) para conocer las restricciones de uso comercial del conjunto.
- No se dispone de datos sobre el rendimiento en producción (latencia, throughput, requisitos de VRAM) más allá del ejemplo de código.

## Enlaces

- HuggingFace del LoRA: https://huggingface.co/funseshon/yoga-pose
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Modelo base (Turbo): https://huggingface.co/krea/Krea-2-Turbo
- (No se han encontrado otros enlaces de papers, blogs o repos en la búsqueda web)
