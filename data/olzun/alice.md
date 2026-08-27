# Olzun/alice

## Resumen

Olzun/alice es un adaptador LoRA (Low-Rank Adaptation) de tipo DreamBooth para el modelo de difusión texto-imagen Krea 2, desarrollado por el usuario Olzun y publicado en Hugging Face. El adaptador permite generar imágenes del personaje ficticio "Alice" de forma consistente utilizando el token disparador `Alice` en los prompts. Está entrenado sobre el modelo base Krea 2 Raw y se muestra funcionando sobre Krea 2 Turbo, lo que permite obtener resultados con solo 8 pasos de inferencia y guidance_scale 0.0.

El repositorio tiene un tamaño de 0.8 GB y se distribuye bajo licencia Apache 2.0. Al ser un LoRA, no es un modelo completo sino un conjunto de pesos que se cargan sobre un modelo base, por lo que su uso requiere disponer de Krea 2 (Raw o Turbo) como modelo subyacente. La relevancia de esta pieza radica en su capacidad para personalizar un modelo de difusión de alta calidad sin necesidad de reentrenar el modelo completo, un flujo habitual en la generación de personajes para ilustración, diseño conceptual o prototipado artístico.

No se dispone de información pública sobre el dataset de entrenamiento, el número de imágenes utilizadas ni los hiperparámetros del entrenamiento. Tampoco se han publicado resultados de benchmarks ni comparativas con otros adaptadores similares.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptación de bajo rango) sobre modelo de difusión Krea 2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts se procesan en el modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (inferido por uso con diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado con la técnica DreamBooth, que consiste en ajustar un modelo de difusión preentrenado con un pequeño conjunto de imágenes de un sujeto o concepto específico. En este caso, el modelo base es Krea 2 Raw, un modelo de difusión texto-imagen de la familia Krea 2. El LoRA se ha diseñado para ser compatible con Krea 2 Turbo, que es una versión destilada del mismo modelo que requiere menos pasos de inferencia (8 pasos en los ejemplos mostrados).

No se han publicado detalles sobre el número de imágenes de entrenamiento, la resolución, el optimizador ni la tasa de aprendizaje. El código de ejemplo proporcionado en la model card muestra cómo cargar el LoRA sobre Krea 2 Turbo usando la librería `diffusers` de Hugging Face, con `torch_dtype=torch.bfloat16` y `guidance_scale=0.0`, lo que sugiere que el adaptador está optimizado para funcionar en modo sin guía (guidance-free).

## Capacidades

- Generación de imágenes texto-imagen del personaje "Alice" mediante el token disparador `Alice`.
- Compatibilidad con los modelos Krea 2 Raw y Krea 2 Turbo.
- Integración sencilla con el pipeline `Krea2Pipeline` de la librería `diffusers`.
- Funciona con 8 pasos de inferencia y guidance_scale 0.0, lo que permite generación rápida.
- No incluye capacidades adicionales como tool calling, agentes, visión o audio, al ser un adaptador de imagen.

## Casos de uso

- Ilustración de personajes: un ilustrador puede generar múltiples variaciones del personaje "Alice" en distintos estilos (ciberpunk, victoriano, surrealista) manteniendo la identidad visual, usando el token `Alice` en el prompt.
- Diseño de conceptos para videojuegos o animación: el adaptador permite explorar rápidamente diferentes entornos y atuendos para un mismo personaje, acelerando el proceso de diseño.
- Creación de avatares personalizados: usuarios pueden generar retratos de "Alice" para perfiles, redes sociales o proyectos personales, con control sobre el estilo mediante el prompt.
- Prototipado de portadas o carteles: se puede usar para generar imágenes de "Alice" en composiciones variadas, útil para diseñadores gráficos que necesitan material visual de referencia.
- Generación de contenido para narrativa visual: escritores o creadores de cómics pueden ilustrar escenas con el personaje de forma coherente, sin necesidad de dibujar manualmente.
- Experimentación artística: artistas digitales pueden combinar el LoRA con otros adaptadores o estilos para explorar fusiones creativas, dado que es un LoRA ligero y fácil de cargar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas como FID, CLIP score o comparaciones con otros adaptadores.

## Requisitos de hardware

- El LoRA en sí ocupa 0.8 GB, pero requiere el modelo base Krea 2 (Raw o Turbo) para funcionar. Los requisitos de VRAM dependen del modelo base, que no se especifican en la documentación del adaptador.
- Se recomienda una GPU con al menos 8 GB de VRAM para ejecutar Krea 2 Turbo en modo bfloat16, aunque no se ha confirmado oficialmente.
- El código de ejemplo usa `torch_dtype=torch.bfloat16`, lo que sugiere que se necesita una GPU compatible con bfloat16 (por ejemplo, RTX 30xx o superior, o GPUs de data center como A100).
- Opciones de despliegue: el adaptador se puede usar con la librería `diffusers` en Python. No se menciona soporte para vLLM, llama.cpp u otras herramientas de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado datos. Con 8 pasos de inferencia, se espera una generación relativamente rápida en GPUs modernas, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA comparables en el mismo repositorio o en la misma familia. No se puede realizar una comparativa objetiva sin datos adicionales.

## Limitaciones y advertencias

- El adaptador está diseñado exclusivamente para el personaje "Alice"; su uso con otros sujetos puede producir resultados inconsistentes.
- Depende del modelo base Krea 2, que no es de código abierto. Aunque el LoRA tiene licencia Apache 2.0, el modelo base puede tener restricciones de uso comercial que deben verificarse.
- No se ha documentado el dataset de entrenamiento, por lo que se desconocen posibles sesgos en la representación del personaje (género, etnia, estilo).
- Al ser un modelo de difusión, existe riesgo de generar imágenes no deseadas o alucinaciones visuales, especialmente con prompts ambiguos.
- No se han publicado evaluaciones de robustez ni pruebas de seguridad.
- El número de descargas y likes es 0, lo que sugiere que el adaptador es reciente y no ha sido ampliamente probado por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Olzun/alice
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Documentación de diffusers: https://huggingface.co/docs/diffusers/index
