# aspect-ratio-scaling/block-attnres-lr2e-3-llama-400M-L20-pretrain

## Resumen

Este repositorio almacena checkpoints crudos de OLMo-core de un modelo de lenguaje de aproximadamente 400 millones de parámetros, entrenado como parte de una investigación sobre escalado de atención con conexiones residuales (AttnRes). El nombre del repositorio sugiere una arquitectura tipo Llama con 20 capas y una tasa de aprendizaje de 2e-3, pero no se proporciona documentación técnica que lo confirme. Es un artefacto de investigación, no un modelo listo para usar: contiene pasos intermedios de entrenamiento (step0, step3000, step6000, step7600) y requiere herramientas específicas de OLMo-core para cargarlo.

La relevancia de este modelo es exclusivamente científica: permite reproducir experimentos sobre el efecto de las conexiones residuales en la atención durante el preentrenamiento. No está pensado para aplicaciones prácticas ni para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere Llama, sin confirmar) |
| Parametros totales | 400M (segun nombre del repo, sin confirmar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint crudo de OLMo-core (no safetensors estandar) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. El nombre del repositorio y la ruta local (`pretrain-llama-350M-L20-block-attnres-lr2e-3`) indican que se trata de un transformer de 20 capas con aproximadamente 350-400M parametros, entrenado con una tasa de aprendizaje de 2e-3 y una variante de atencion con conexiones residuales (block-attnres). El checkpoint incluye el directorio `tokenizer/`, lo que sugiere que se guardo el tokenizador utilizado durante el entrenamiento.

Los pasos guardados (step0, step3000, step6000, step7600) permiten analizar la evolucion del entrenamiento. No se especifica el tamaño del dataset, el numero total de tokens ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Capacidades

- No se han documentado capacidades especificas del modelo.
- Al ser un checkpoint de preentrenamiento sin fine-tuning, no presenta habilidades concretas como generacion de codigo, razonamiento o tool calling.
- El unico proposito es servir como estado intermedio para investigacion sobre entrenamiento de LLMs.

## Casos de uso

- Reproduccion de experimentos: investigadores pueden descargar el checkpoint y continuar el entrenamiento desde el paso 7600 para verificar resultados o probar variaciones.
- Estudio del efecto de atencion residual: comparar estos checkpoints con otros de la misma coleccion (por ejemplo, `attnres-lr2e-3-llama-400M-L56-pretrain`) para analizar como la profundidad (L20 vs L56) afecta al entrenamiento.
- Analisis de dinamicas de entrenamiento: examinar las metricas de loss y gradientes en los distintos pasos guardados para entender la convergencia.
- Conversion a formato Hugging Face: si se necesita usar el modelo con herramientas estandar, habria que convertirlo con utilidades de OLMo-core, aunque no se garantiza compatibilidad total.
- No es adecuado para tareas de inferencia directa ni para integracion en aplicaciones de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. Dado el tamaño aproximado de 400M parametros, se podria inferir que un checkpoint de este tipo cabe en GPUs de consumo como una RTX 3090 o RTX 4090 con cuantizacion, pero no hay confirmacion. Para cargar el checkpoint con OLMo-core se necesita un entorno con las dependencias de esa libreria, y el repositorio ocupa 10 GB en disco.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos. El unico punto de referencia es la coleccion AttnRes del mismo autor, que incluye variantes con diferente numero de capas (L20, L56), pero no hay datos de rendimiento publicados.

## Limitaciones y advertencias

- Es un checkpoint crudo, no un modelo listo para usar con `from_pretrained()`. Cargarlo requiere herramientas especificas de OLMo-core.
- No se especifica la licencia, por lo que no se puede garantizar su uso comercial ni su redistribucion.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de contexto.
- El tokenizador incluido puede no ser compatible con otros frameworks.
- Al ser un experimento de investigacion, no se ha validado su calidad ni su seguridad para aplicaciones reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aspect-ratio-scaling/block-attnres-lr2e-3-llama-400M-L20-pretrain
- Coleccion AttnRes: https://huggingface.co/collections/aspect-ratio-scaling/attnres
- Checkpoint relacionado (L56): https://huggingface.co/aspect-ratio-scaling/attnres-lr2e-3-llama-400M-L56-pretrain
