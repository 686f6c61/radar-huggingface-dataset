# misapapa71/model-maya-krea2

## Resumen

`misapapa71/model-maya-krea2` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario misapapa71. El adaptador se entrena sobre los pesos de Krea 2 RAW (`krea/Krea-2-Raw`) y se utiliza en inferencia sobre Krea 2 Turbo, la variante destilada para pocos pasos. Su proposito es inyectar un concepto concreto —una identidad visual invocada mediante el token `model-Maya-krea2`— en el pipeline generativo, de modo que el modelo base produzca imagenes coherentes de ese sujeto en estilos y escenarios muy distintos.

El repositorio es de tamano reducido (0,8 GB), coherente con un adaptador LoRA y no con un modelo completo. Se distribuye en formato compatible con la libreria `diffusers` y se carga mediante `pipe.load_lora_weights(...)` sobre una instancia de `Krea2Pipeline`. La model card documenta tres ejemplos generados con 8 pasos de inferencia y `guidance_scale=0.0`, lo que confirma el uso previsto sobre la variante Turbo.

La relevancia de esta ficha es acotada: se trata de un adaptador comunitario con 12 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados ni documentacion tecnica sobre el dataset de entrenamiento. Resulta util como ejemplo del flujo de personalizacion sobre Krea 2, pero no debe confundirse con un modelo fundacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Krea 2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | compatible con `diffusers` (carga via `load_lora_weights`); no se detalla el formato de fichero |
| Modelo base | `krea/Krea-2-Raw` (entrenamiento); `krea/Krea-2-Turbo` (inferencia recomendada) |
| Token de activacion | `model-Maya-krea2` |
| Tamano del repositorio | 0,8 GB |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth aplicado sobre Krea 2, un modelo de difusion texto-a-imagen. La model card indica explicitamente que el entrenamiento se realizo sobre los pesos de Krea 2 RAW y que las muestras publicadas se generaron sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`. No se especifica el rango del adaptador, el numero de imagenes del dataset, el numero de pasos de entrenamiento, la tasa de aprendizaje ni si se aplicaron tecnicas adicionales como regularizacion por clase o textual inversion.

No hay informacion sobre la composicion del dataset de entrenamiento, el numero de tokens o imagenes vistas, ni sobre el uso de RLHF, DPO u otras fases de alineamiento (concepto que, por otra parte, no aplica de forma directa a un modelo de difusion). Tampoco se documentan innovaciones tecnicas especificas del adaptador mas alla del propio mecanismo LoRA. Cualquier afirmacion sobre la arquitectura interna de Krea 2 (tipo de UNet o transformer de difusion, mecanismo de atencion, etc.) excede la informacion proporcionada.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `model-Maya-krea2`.
- Personalizacion de identidad o concepto: el adaptador reproduce el sujeto entrenado en escenarios, vestimentas e iluminaciones diversas (ciberpunk, retrato naturalista, alta costura).
- Compatibilidad con el ecosistema `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- Inferencia de pocos pasos sobre Krea 2 Turbo (8 pasos documentados, `guidance_scale=0.0`).
- Composicion de estilos: los ejemplos de la model card combinan el concepto con estilos cinematograficos, retrato editorial y fotografia de moda.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni multilingues; no aplican a un adaptador texto-a-imagen.

## Casos de uso

- Prototipado de personajes consistentes: usar el token `model-Maya-krea2` para generar el mismo sujeto en multiples escenas y angulos, util en preproduccion de narrativa visual o storyboards.
- Pruebas de concepto de moda: generar variaciones de vestuario (lino, metalico escultural) sobre una identidad fija para evaluar direcciones creativas antes de una sesion fotografica real.
- Generacion de material para campanas: producir imagenes de estilo cinematografico o editorial con un personaje recurrente para maquetas de anuncios.
- Experimentacion con LoRA sobre Krea 2: servir de referencia tecnica para desarrolladores que quieran replicar el flujo DreamBooth + `diffusers` sobre este modelo base.
- Ilustracion de escenarios: combinar el concepto con descripciones de entorno (callejon de Tokio bajo la lluvia, pradera al atardecer) para generar fondos y escenas coherentes.
- Evaluacion de pipelines de inferencia rapida: al funcionar con 8 pasos sobre Turbo, permite medir latencia y calidad en configuraciones de baja latencia antes de escalar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para este adaptador. Al tratarse de un LoRA sobre Krea 2, los requisitos vienen determinados por el modelo base (Krea 2 Turbo), no por el adaptador, cuyo peso adicional es marginal (repositorio de 0,8 GB).
- GPU recomendadas: no disponible en la informacion proporcionada. La model card solo muestra el uso de `torch_dtype=torch.bfloat16` y `.to("cuda")`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion; depende de los requisitos del pipeline Krea 2 base.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` (documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles. Solo se indica que las muestras se generaron con 8 pasos de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| misapapa71/model-maya-krea2 | LoRA DreamBooth sobre Krea 2 | no disponible | no aplica | Apache 2.0 | Hugging Face (12 descargas) |
| krea/Krea-2-Raw | Modelo base de difusion texto-a-imagen | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| krea/Krea-2-Turbo | Variante destilada de Krea 2 para pocos pasos | no disponible | no aplica | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos base en la informacion proporcionada, por lo que la comparativa se limita a la relacion de dependencia entre el adaptador y sus modelos base. No se han identificado en la informacion alternativas de LoRA comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un adaptador entrenado sobre un concepto concreto, puede heredar los sesgos del modelo base y del dataset de entrenamiento, que no se especifica.
- Riesgo de alucinacion: inherente a los modelos de difusion; el adaptador puede generar rasgos inconsistentes del sujeto cuando se combina con prompts muy alejados de los ejemplos de entrenamiento.
- Limitaciones de contexto o idioma: no se documentan idiomas soportados; los prompts de ejemplo estan en ingles y no hay evidencia de funcionamiento optimo en castellano.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, pero el uso comercial depende tambien de la licencia de los modelos base Krea 2 RAW y Krea 2 Turbo, que no se detalla en la informacion disponible. Conviene verificar la licencia del modelo base antes de un uso productivo.
- Caveats para produccion: el repositorio tiene 12 descargas y 0 likes, sin validacion externa; no hay datos de benchmarks, ni de estabilidad, ni de calidad objetiva. El adaptador esta pensado para Krea 2 Turbo con 8 pasos y `guidance_scale=0.0`; otros ajustes pueden degradar el resultado.
- Ausencia de documentacion sobre el dataset de entrenamiento: impide evaluar riesgo de sobreajuste, calidad de las muestras o posibles problemas de derechos de imagen del sujeto entrenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/misapapa71/model-maya-krea2
- Modelo base de entrenamiento: https://huggingface.co/krea/Krea-2-Raw
- Modelo base de inferencia (Turbo): https://huggingface.co/krea/Krea-2-Turbo
