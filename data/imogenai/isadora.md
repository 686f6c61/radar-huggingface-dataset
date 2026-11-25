# imogenai/isadora

## Resumen

Isadora es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario imogenai y publicado bajo licencia Apache 2.0. El adaptador se entrena sobre los pesos de Krea 2 RAW y se utiliza en inferencia sobre Krea 2 Turbo, la variante destilada para generacion rapida en pocos pasos. Su funcion es inyectar un concepto concreto —invocado mediante el token `Isadora`— en el pipeline de generacion, de modo que el modelo base reproduzca ese sujeto cuando aparece la palabra de activacion.

El repositorio es de reducido tamano (0,8 GB), coherente con un adaptador LoRA y no con un modelo completo, y se distribuye en formato compatible con la libreria diffusers. La model card documenta el uso mediante `Krea2Pipeline` con `load_lora_weights` y una generacion de 8 pasos con `guidance_scale=0.0`, lo que confirma que el adaptador esta pensado para la variante Turbo del modelo base.

La relevancia de esta ficha es limitada en terminos de investigacion: se trata de un LoRA de concepto de un unico sujeto, sin datos publicados de entrenamiento, sin benchmarks y con cero descargas y cero likes en el momento de la consulta. Ademas, los prompts de ejemplo de la model card describen atributos fisicos sexualizados, lo que condiciona su uso a entornos con politicas de contenido adecuadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; el modelo base es Krea 2 |
| Parametros totales | no disponible (adaptador LoRA; el tamano del repo es de 0,8 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; sin ventana de contexto de tokens documentada) |
| Tipos de cuantizacion | no disponible (la model card solo muestra carga en `bfloat16`) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con diffusers (carga mediante `load_lora_weights`); el repositorio pesa 0,8 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth entrenado sobre Krea 2 RAW, segun indica la propia model card. DreamBooth es una tecnica de ajuste fino personalizado que asocia un token raro (`Isadora`) a un concepto o sujeto concreto a partir de un conjunto reducido de imagenes de referencia; el resultado se empaqueta como LoRA, es decir, como matrices de bajo rango que se suman a las proyecciones del modelo base sin modificar sus pesos originales. La model card no especifica el rango del adaptador, el numero de imagenes de entrenamiento, el numero de pasos ni la composicion del dataset.

No se documenta ningun proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en un adaptador de difusion. Tampoco se detalla la innovacion tecnica del modelo base Krea 2 (arquitectura interna, mecanismo de atencion, esquema de destilacion de la variante Turbo); la informacion disponible se limita a la indicacion de que las muestras se generaron sobre Krea 2 Turbo en 8 pasos. El adaptador se presenta como compatible con el pipeline `Krea2Pipeline` de diffusers y con carga en `bfloat16` sobre CUDA.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token de activacion `Isadora`.
- Inyeccion de un concepto o sujeto concreto sobre el modelo base Krea 2, sin reentrenar el modelo completo.
- Compatibilidad con la variante Turbo del modelo base, lo que permite inferencia en 8 pasos con `guidance_scale=0.0`.
- Carga y descarga de pesos mediante la API de diffusers (`load_lora_weights`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking; no aplican a un modelo de difusion de este tipo.
- Capacidades multilingues: no disponibles; los unicos prompts documentados estan en ingles.

## Casos de uso

- Prototipado de personajes consistentes: el adaptador permite generar variaciones de un mismo sujeto invocando `Isadora` en el prompt, util para pruebas de concepto en estudios de diseno de personajes.
- Pruebas de pipeline con diffusers: sirve como ejemplo minimo de carga de un LoRA sobre `Krea2Pipeline` en `bfloat16` para validar integraciones y entornos CUDA.
- Generacion rapida de imagenes de referencia: al funcionar sobre Krea 2 Turbo en 8 pasos, permite iterar bocetos con baja latencia en comparacion con muestreo completo.
- Investigacion sobre personalizacion con DreamBooth: util como caso de estudio de adaptadores de bajo rango aplicados a un unico concepto.
- Evaluacion de tecnicas de activacion por token: permite comparar como responde el modelo base ante la presencia o ausencia del token `Isadora`.
- Demostraciones controladas de texto-a-imagen: adecuado para entornos de laboratorio con politicas de contenido explicitas, dado el caracter sexualizado de los prompts de ejemplo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base Krea 2 y de la precision. La model card usa `torch_dtype=torch.bfloat16` sobre CUDA.
- El adaptador en si ocupa 0,8 GB en disco, por lo que el cuello de botella de memoria lo determina el modelo base, no el LoRA.
- GPU recomendadas: no disponibles; la model card no especifica modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: diffusers (`Krea2Pipeline` con `load_lora_weights`). No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un pipeline de difusion de este tipo).
- Latencia y throughput: no disponibles; solo se indica que las muestras se generaron en 8 pasos sobre Krea 2 Turbo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| imogenai/isadora | LoRA DreamBooth sobre Krea 2 | no disponible (repo 0,8 GB) | no aplica | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| krea/Krea-2-Raw | Modelo base de difusion texto-a-imagen | no disponible | no aplica | no disponible en la informacion | Hugging Face (referenciado como base) |
| krea/Krea-2-Turbo | Variante destilada del modelo base | no disponible | no aplica | no disponible en la informacion | Hugging Face (referenciado en la model card) |

No se dispone de datos de rendimiento ni de benchmarks para establecer una comparacion cuantitativa con otros LoRA de concepto o con los modelos base.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; los prompts de ejemplo describen atributos fisicos sexualizados, lo que puede reforzar sesgos de representacion corporal.
- Riesgo de alucinacion: inherente a los modelos de difusion; el adaptador puede generar el concepto `Isadora` de forma inconsistente o mezclarlo con otros elementos del prompt.
- Limitaciones de contexto o idioma: no se documentan idiomas soportados; los unicos prompts de ejemplo estan en ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Krea 2, que no se detalla en la informacion disponible.
- Caveat para produccion: el adaptador esta pensado para Krea 2 Turbo en 8 pasos con `guidance_scale=0.0`; su comportamiento con otros valores de guidance o con el modelo RAW no esta documentado.
- El repositorio no tiene descargas ni likes, y no hay evidencia de validacion externa ni de pruebas de robustez.
- El contenido de los prompts de ejemplo puede ser inadecuado para entornos sin filtros de contenido; conviene aplicar moderacion en cualquier despliegue publico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imogenai/isadora
- Modelo base Krea 2 RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea 2 Turbo (referenciado en la model card): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
