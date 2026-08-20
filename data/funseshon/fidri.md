# funseshon/fidri

## Resumen

`funseshon/fidri` es un LoRA de DreamBooth para el modelo de generacion de imagenes Krea 2, desarrollado por el usuario `funseshon` y publicado en HuggingFace. El adaptador se entrena sobre el checkpoint base `krea/Krea-2-Raw` y se valida sobre la variante Turbo, lo que permite generar imagenes del concepto asociado al token de activacion `FIDRI` en tan solo 8 pasos de inferencia con guidance scale 0.0.

El modelo resuelve el problema de personalizacion de conceptos sobre la familia Krea 2: en lugar de reentrenar un checkpoint completo, el LoRA inyecta el concepto aprendido en el pipeline existente mediante `load_lora_weights`, manteniendo el resto de capacidades del modelo base intactas. Su relevancia radica en que es uno de los primeros adaptadores publicados para Krea 2, una arquitectura reciente de generacion texto-imagen, y su licencia Apache 2.0 permite uso comercial sin restricciones.

El repositorio tiene un tamano de 1.0 GB e incluye tres imagenes de muestra generadas con el prompt de activacion en escenarios muy distintos (cyberpunk, bodegon rural y nebulosa cosmica), lo que sugiere que el concepto aprendido es robusto frente a variaciones de estilo y contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre Krea 2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de DreamBooth entrenado sobre el checkpoint `krea/Krea-2-Raw`. La arquitectura subyacente es la del modelo Krea 2, cuyos detalles tecnicos (tipo de transformer, mecanismo de atencion, tamano del backbone) no se especifican en la informacion disponible. El entrenamiento sigue el paradigma de DreamBooth: se ajustan los pesos del LoRA para que el token de activacion `FIDRI` quede asociado al concepto objetivo, preservando el resto de la capacidad generativa del modelo base.

Los ejemplos de validacion se generan con la variante `krea/Krea-2-Turbo` usando 8 pasos de inferencia y guidance scale 0.0, lo que indica que el LoRA esta optimizado para funcionar con schedulers de pocos pasos y sin clasifier-free guidance. No se dispone de informacion sobre el dataset de entrenamiento, el numero de imagenes utilizadas, ni si se aplicaron tecnicas adicionales como regularizacion o prior preservation.

## Capacidades

- Generacion de imagenes texto-a-imagen: el LoRA permite generar imagenes del concepto `FIDRI` a partir de descripciones textuales arbitrarias.
- Personalizacion de concepto: el token de activacion `FIDRI` invoca el concepto aprendido en cualquier prompt, manteniendo el estilo y la composicion del prompt original.
- Compatibilidad con Krea 2 Turbo: los ejemplos muestran resultados con 8 pasos de inferencia, lo que sugiere baja latencia en generacion.
- Integracion con diffusers: se carga mediante `Krea2Pipeline` y `load_lora_weights`, por lo que es compatible con el ecosistema estandar de HuggingFace.
- Robustez contextual: las muestras demuestran que el concepto se adapta a escenarios muy distintos (entorno urbano futurista, paisaje rural, escena cosmica).
- Uso comercial permitido: la licencia Apache 2.0 no impone restricciones de uso comercial ni de redistribucion.

## Casos de uso

- Generacion de assets de marca: una empresa puede entrenar un LoRA similar (o usar este como referencia) para generar imagenes de su mascota o producto en multiples contextos, manteniendo consistencia visual en campanas publicitarias.
- Creacion de contenido para videojuegos: el concepto `FIDRI` puede usarse para generar concept art de personajes o criaturas en diferentes entornos, acelerando el pipeline de preproduccion.
- Prototipado rapido de diseno: los equipos de diseno pueden generar variaciones de un objeto o personaje en distintos estilos y escenarios en minutos, sin necesidad de sesiones de fotografia o ilustracion manual.
- Generacion de imagenes para documentacion tecnica: el LoRA permite ilustrar manuales o guias con un personaje o elemento recurrente, manteniendo coherencia visual entre todas las figuras.
- Educacion y demostraciones: al ser Apache 2.0, puede usarse en cursos o talleres sobre fine-tuning de modelos de difusion, como ejemplo de adaptador DreamBooth sobre una arquitectura reciente.
- Composicion artistica: artistas digitales pueden combinar el token `FIDRI` con prompts de estilo para explorar el concepto en estilos pictoricos, fotograficos o abstractos, ampliando su repertorio creativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de metricas como FID, CLIP score o comparativas con otros LoRA de Krea 2. Los unicos indicios de rendimiento son las tres imagenes de muestra del repositorio, generadas con 8 pasos en Krea 2 Turbo, que demuestran cualitativamente la capacidad del adaptador pero no proporcionan datos cuantitativos.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del modelo base Krea 2 (Raw o Turbo) y de la resolucion de salida. Un LoRA anade una sobrecarga minima de memoria respecto al checkpoint base.
- GPU recomendadas: no disponible. Krea 2 es un modelo reciente; se recomienda al menos una GPU con 16 GB de VRAM para inferencia comoda, aunque no hay datos oficiales.
- Compatibilidad con GPU de consumo: probablemente si, en funcion de los requisitos del modelo base. Las GPUs de la serie RTX 4090 o superiores deberian ser suficientes para resoluciones moderadas.
- Opciones de despliegue: el ejemplo oficial usa `diffusers` con `Krea2Pipeline` en CUDA. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje, no a difusion.
- Latencia y throughput: no disponible. El uso de 8 pasos con guidance scale 0.0 sugiere generacion rapida, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRA o adaptadores para Krea 2 publicados en el momento de la consulta. La busqueda web no devolvio resultados de modelos comparables especificos para esta arquitectura. Como referencia generica, los LoRA de DreamBooth para Stable Diffusion o Flux siguen el mismo paradigma de personalizacion, pero no son directamente comparables al estar entrenados sobre arquitecturas distintas. Se recomienda consultar el hub de HuggingFace y Civitai para localizar adaptadores alternativos de Krea 2 conforme se publiquen.

## Limitaciones y advertencias

- Datos de entrenamiento desconocidos: no se especifica el numero de imagenes, su procedencia ni si se aplicaron tecnicas de regularizacion, lo que dificulta evaluar el riesgo de overfitting o degradacion del modelo base.
- Sesgos potenciales: al no conocer el dataset de entrenamiento, no es posible evaluar sesgos demograficos o culturales en el concepto aprendido.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar artefactos o inconsistencias en escenarios complejos, especialmente con prompts fuera de distribucion.
- Dependencia del modelo base: el LoRA solo funciona con Krea 2 (Raw o Turbo). No es portable a otras arquitecturas sin reentrenamiento.
- Documentacion limitada: la model card no incluye especificaciones tecnicas del entrenamiento, hiperparametros, ni instrucciones de uso mas alla del ejemplo basico.
- Sin garantias de calidad: el repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion comunitaria del rendimiento del adaptador.
- Fecha de creacion futura: el modelo esta fechado en agosto de 2026, lo que puede indicar un error en los metadatos o un modelo muy reciente; conviene verificar la fecha real de publicacion antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/funseshon/fidri
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Otro LoRA del mismo autor: https://huggingface.co/funseshon/aika
- Comunidad de modelos de difusion: https://civitai.com/models
