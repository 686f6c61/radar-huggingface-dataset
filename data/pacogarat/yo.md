# pacogarat/yo

## Resumen

El repositorio `pacogarat/yo` contiene un LoRA de DreamBooth para el modelo de difusión text-to-image Krea 2, desarrollado por el usuario pacogarat. Se trata de un adaptador de bajo rango entrenado sobre el checkpoint base `krea/Krea-2-Raw` y validado sobre el checkpoint `krea/Krea-2-Turbo`, que permite personalizar la generación de imágenes alrededor del concepto invocable mediante el token `paco`.

La relevancia de este tipo de modelo radica en que permite adaptar un modelo de difusión de última generación con un coste de entrenamiento reducido y sin necesidad de reentrenar el modelo completo. El LoRA se distribuye con licencia Apache 2.0, lo que facilita su uso y modificación en proyectos comerciales y de investigación. El repositorio tiene un tamaño de 1.0 GB e incluye ejemplos de generación con el pipeline de Diffusers en 8 pasos de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Krea 2 (modelo de difusion text-to-image) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica directamente; el prompt es texto libre) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (se asume ingles, pero no se especifica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (se infiere por su uso con Diffusers; no confirmado explicitamente) |

## Arquitectura y entrenamiento

El modelo es un LoRA de DreamBooth, una técnica de adaptación de bajo rango que entrena un pequeño conjunto de pesos residuales sobre las capas de atención y proyección de un modelo de difusión base, en este caso Krea 2. El entrenamiento se realizó sobre el checkpoint `krea/Krea-2-Raw` y las muestras de validación se generaron con `krea/Krea-2-Turbo` en 8 pasos de inferencia, lo que indica que el LoRA es compatible con la destilación Turbo de Krea 2.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de imágenes, el rank del LoRA, el número de pasos de entrenamiento ni el uso de técnicas de regularización. Tampoco se especifica si se empleó algún tipo de ajuste con datos adicionales o si se usó prior preservation. La información disponible se limita al prompt de instancia `paco` como token de activación del concepto.

## Capacidades

- Generación de imágenes personalizadas: el LoRA permite generar imágenes que representan el concepto aprendido, invocado mediante el token `paco`.
- Compatibilidad con el pipeline de Diffusers: se integra mediante `Krea2Pipeline` y `load_lora_weights`.
- Compatibilidad con Krea 2 Turbo: los ejemplos muestran generación en 8 pasos con guidance scale 0.0, indicando que el LoRA funciona con el checkpoint destilado.
- Soporte de prompts variados: los ejemplos incluyen estilos cinematográficos, pintura al óleo y fotografía macro, lo que sugiere que el concepto puede integrarse en distintos contextos visuales.
- Licencia permisiva: Apache 2.0 permite uso comercial y modificación.

## Casos de uso

- Generación de contenido de marca: el LoRA puede usarse para generar imágenes de una mascota, personaje o producto concreto (el concepto "paco") en múltiples estilos, útil para campañas de marketing o branding personalizado.
- Prototipado creativo: diseñadores y artistas pueden usar el LoRA para explorar variaciones de un personaje en diferentes escenarios, estilos y composiciones sin redibujar manualmente.
- Ilustración de cuentos y narrativas: el token `paco` permite mantener coherencia visual del personaje a lo largo de una serie de imágenes, lo que facilita la creación de libros ilustrados o cómics.
- Contenido para redes sociales: creadores de contenido pueden generar imágenes consistentes de un avatar o personaje para publicaciones recurrentes, ahorrando tiempo de producción.
- Experimentación con estilos: al ser un LoRA ligero, se puede combinar con otros LoRAs o checkpoints base para estudiar cómo el concepto se adapta a distintos estilos artísticos.
- Educación sobre adaptación de modelos: el repositorio sirve como ejemplo práctico de entrenamiento e integración de un LoRA de DreamBooth con Diffusers, útil para cursos o tutoriales de IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como FID, CLIP score, ni comparaciones con otros LoRAs o modelos base.

## Requisitos de hardware

- El LoRA en sí es ligero (1.0 GB de tamaño de repositorio), pero para la inferencia se requiere cargar el modelo base Krea 2 (Raw o Turbo), cuyos requisitos no se especifican en la información disponible.
- Se recomienda una GPU con soporte de bfloat16 y suficiente VRAM para el modelo base de Krea 2 (no se indican valores concretos; se sugiere al menos 8-16 GB para modelos de difusión de tamaño medio, pero esto no está confirmado).
- El código de ejemplo usa `torch.bfloat16` y `.to("cuda")`, por lo que se asume una GPU NVIDIA con capacidad para bfloat16.
- Despliegue: el uso se realiza con Diffusers (`Krea2Pipeline`). No se mencionan alternativas como ComfyUI, Automatic1111 u otros frontends.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos para una comparativa rigurosa. El LoRA de `pacogarat/yo` es un adaptador específico para Krea 2, y no se conocen otros LoRAs de DreamBooth para el mismo modelo base con métricas publicadas. Como referencia genérica, los LoRAs de DreamBooth para otros modelos de difusión (SDXL, Flux) suelen tener entre 100 y 500 MB de pesos y requieren el modelo base para funcionar, pero no se puede establecer una comparación cuantitativa sin datos.

## Limitaciones y advertencias

- El LoRA solo funciona si se carga junto con el modelo base Krea 2 (Raw o Turbo); no es un modelo autónomo.
- El concepto "pollo" está definido por las imágenes de entrenamiento del autor; si el dataset fue reducido o poco variado, el modelo puede tener dificultades para generalizar el concepto en estilos o contextos muy distintos a los vistos.
- No se han publicado evaluaciones de sesgos ni de calidad en condiciones adversas; es posible que el modelo reproduzca sesgos del dataset base de Krea 2.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Krea 2, que puede tener restricciones adicionales (no se indica en la información).
- La guía de inferencia usa `guidance_scale=0.0` y 8 pasos con Turbo; si se usa con el checkpoint Raw, los parámetros de inferencia pueden necesitar ajustes.
- No se documenta el número de imágenes ni el proceso de entrenamiento, lo que limita la reproducibilidad del entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pacogarat/yo
- Repositorio del mismo autor para otro LoRA: https://huggingface.co/pacogarat/paco
- GitHub del autor: https://github.com/pacogarat
- Página de información del modelo (tercero): https://free2aitools.com/model/pacogarat/paco
- Plataforma Yodayo (relacionada con modelos de imagen): https://yodayo.com/
