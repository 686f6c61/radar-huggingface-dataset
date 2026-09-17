# genaforvena/lora-guitar

## Resumen

`genaforvena/lora-guitar` es un adaptador LoRA (PEFT) publicado por el usuario genaforvena sobre el modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`. No se trata de un modelo de pesos completos, sino de un conjunto de pesos de adaptacion de bajo rango que debe cargarse junto al modelo base para poder ejecutarse. El repositorio ocupa 0,0 GB (pesos del adaptador de tamano reducido) y la libreria declarada es `peft`, con `transformers` como backend de inferencia.

El propio autor indica en la model card que el adaptador se entreno dentro del proyecto `tiny-fleet`, descrito como una coleccion de especialistas "toy" (de juguete) centrados en dos dominios: guitarra para principiantes y elaboracion de masa madre. La model card, sin embargo, es la plantilla generica de HuggingFace y no ha sido cumplimentada: todos los apartados relevantes (descripcion, datos de entrenamiento, hiperparametros, evaluacion, licencia, idiomas) figuran como "[More Information Needed]". El modelo acumula 0 descargas y 0 likes en el momento de la consulta.

Por su tamano, el interes practico de esta ficha es acotado: sirve como ejemplo reproducible de como publicar un adaptador LoRA de dominio muy especifico sobre un modelo pequeno, y como caso de estudio para pipelines de especializacion con PEFT. No hay evidencia publicada de evaluacion, ni licencia declarada, ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (`SmolLM2-360M-Instruct`) |
| Parametros totales | No disponible para el adaptador. El modelo base declara aproximadamente 361 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador. El modelo base `SmolLM2-360M-Instruct` declara 8.192 tokens (dato del modelo base, no confirmado por el autor del adaptador) |
| Tipos de cuantizacion | No disponible. Los pesos del adaptador se distribuyen en `safetensors`; la cuantizacion depende de la configuracion aplicada al modelo base |
| Idiomas soportados | No disponible. El modelo base esta entrenado mayoritariamente en ingles; el autor no declara idiomas para el adaptador |
| Licencia | No disponible (la model card no especifica licencia) |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA) |
| Version de PEFT declarada | PEFT 0.20.0 |
| Modelo base | `HuggingFaceTB/SmolLM2-360M-Instruct` |
| Pipeline declarado | `text-generation` |

## Arquitectura y entrenamiento

El artefacto publicado no define una arquitectura propia: es un adaptador LoRA que se inyecta en las capas del modelo base `SmolLM2-360M-Instruct`. Por tanto, la arquitectura efectiva en inferencia es la del modelo base (transformer decoder-only de tipo Llama, con atencion por causalidad, normalizacion RMSNorm y activaciones SwiGLU, segun la configuracion estandar de la familia SmolLM2), mas las matrices de bajo rango anadidas por el adaptador. El adaptador se carga con la libreria `peft` y requiere `transformers` para la ejecucion.

No hay informacion publicada sobre el procedimiento de entrenamiento: se desconocen el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de alineacion (RLHF, DPO, SFT), la tasa de aprendizaje, el rango y el alpha del LoRA, o el numero de pasos. La unica referencia operativa es la mencion al repositorio `genaforvena/tiny-fleet`, que segun el autor contiene los numeros y la reproducibilidad del experimento. No se ha publicado ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, mezcla de expertos) asociada a este adaptador.

## Capacidades

- Generacion de texto condicionada al ajuste fino: al estar especializado en "guitarra para principiantes" segun la descripcion del autor, se espera que produzca respuestas dentro de ese dominio, aunque no hay ejemplos ni evaluaciones que lo confirmen.
- Conversacion multi-turno: hereda la capacidad de instruccion del modelo base `SmolLM2-360M-Instruct`, siempre que el adaptador no haya degradado esa habilidad (riesgo de olvido catastrofico no evaluado).
- Generacion de texto general: limitada por el tamano del modelo base (361 millones de parametros), con capacidad de razonamiento, matematicas y codigo muy por debajo de modelos de 7B o superiores.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles. El idioma de entrenamiento del modelo base es principalmente el ingles; el adaptador no declara idiomas.
- Capacidades especiales (modo pensamiento, vision, audio): no disponibles.

## Casos de uso

- Asistente de practica de guitarra para principiantes: el adaptador se puede desplegar como chatbot que responda dudas basicas sobre acordes, digitacion y rutinas de estudio. Es adecuado por su especializacion declarada en ese dominio, aunque su ventana de contexto y su tamano limitan la profundidad tecnica de las respuestas.
- Prototipo de especializacion con LoRA: sirve como plantilla reproducible para equipos que quieran crear adaptadores de dominio sobre modelos pequenos, reutilizando el flujo `peft` + `transformers` y el repositorio `tiny-fleet`.
- Experimentos academicos sobre olvido catastrofico: al ser un adaptador sobre un modelo de 361 millones de parametros, es un caso de bajo coste computacional para estudiar como un ajuste fino con LoRA afecta a las capacidades generales del modelo base.
- Inferencia en entornos con recursos muy limitados: el modelo base cuantizado ocupa unos cientos de megabytes, por lo que puede ejecutarse en CPU o en GPU integrada para demos locales sin conexion.
- Educacion y talleres: permite mostrar de forma practica que es un adaptador PEFT, como se carga junto al modelo base y como se sirve mediante `transformers` o `llama.cpp` tras el merge y la conversion a GGUF.
- Generacion de contenido editorial de nicho: blogs o newsletters sobre guitarra principiante podrian usarlo para redactar borradores de articulos, siempre con revision humana y asumiendo alto riesgo de imprecisiones factuales.
- Pruebas de integracion de pipelines de despliegue: util para validar soporte de adaptadores en vLLM, TGI o `llama.cpp` en un caso de coste minimo antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye ninguna seccion de evaluacion cumplimentada y no se ha localizado ninguna publicacion, blog o repositorio con cifras de MMLU, HumanEval, GSM8K u otras metricas para este modelo. Tampoco la busqueda web realizada devolvio material relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para el modelo base `SmolLM2-360M-Instruct`: en torno a 0,8 GB en `float16` y aproximadamente 0,4 GB en cuantizacion de 4 bits. El adaptador LoRA anade un consumo marginal (del orden de decenas de megabytes).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Para produccion con varias peticiones concurrentes se recomienda una NVIDIA T4, L4, RTX 3060 o superior; modelos como A100 o H100 no aportan ventaja relevante a este tamano.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo de los ultimos diez anos, asi como en GPUs integradas y en CPU.
- CPU: la inferencia es viable sin acelerador, con latencias mayores pero funcionales para demos y uso individual.
- Opciones de despliegue: `transformers` + `peft` (via `PeftModel.from_pretrained`), `llama.cpp` u `Ollama` previa fusion del adaptador en el modelo base y conversion a GGUF, `vLLM` y `TGI` con soporte de adaptadores LoRA si la version lo permite.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `genaforvena/lora-guitar` | Adaptador LoRA (base de aprox. 361 M) | No disponible | No disponible | HuggingFace, 0 descargas | Model card sin cumplimentar; especializado en guitarra para principiantes |
| `HuggingFaceTB/SmolLM2-360M-Instruct` | Aprox. 361 M | 8.192 tokens (dato publico del modelo base) | Apache 2.0 (dato publico del modelo base) | HuggingFace | Modelo base sobre el que se entrena el adaptador; capacidades de instruccion generalistas |
| Alternativas de la misma categoria (por ejemplo, otros instruct de 0,5 B o 1 B) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion rigurosa |

No se dispone de datos de rendimiento del adaptador que permitan una comparacion cuantitativa con alternativas. Cualquier comparacion de calidad quedaria sin respaldo empirico.

## Limitaciones y advertencias

- La model card es la plantilla por defecto de HuggingFace y no contiene informacion real: no hay datos de entrenamiento, evaluacion, uso previsto ni uso fuera de alcance.
- Licencia no declarada. Sin una licencia explicita, no se puede asumir permiso para uso comercial ni redistribucion; conviene contactar con el autor antes de cualquier uso en produccion.
- Cero descargas y cero likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad ni reportes de terceros.
- Riesgo de alucinacion elevado: el modelo base tiene 361 millones de parametros, un tamano en el que la generacion factual no fiable es esperable, especialmente en cuestiones tecnicas de guitarra (digitaciones, teoria musical, nombres de acordes).
- Riesgo de olvido catastrofico: el ajuste fino puede haber degradado capacidades generales del modelo base (instrucciones, multilingue, coherencia). No hay evaluaciones que lo descarten.
- Idiomas no declarados: no se puede garantizar un comportamiento correcto en castellano; el modelo base esta entrenado mayoritariamente en ingles.
- Contexto efectivo no confirmado: aunque el modelo base declare 8.192 tokens, el autor no especifica como afecta el adaptador ni si se entreno con esa longitud.
- Proyecto de caracter "toy" segun la propia descripcion del autor: no esta pensado para uso profesional, sanitario, legal ni educativo reglado.
- Ausencia de benchmarks: no hay evidencia objetiva de mejora respecto al modelo base en el dominio de la guitarra.
- La busqueda web realizada no devolvio informacion relevante sobre el modelo; los resultados obtenidos eran noticias de sucesos sin relacion con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/genaforvena/lora-guitar
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio del proyecto `tiny-fleet`: https://github.com/genaforvena/tiny-fleet
- Referencia citada en los tags sobre medicion de impacto: https://arxiv.org/abs/1910.09700 (Lacoste et al., 2019)
- Calculadora de impacto de entrenamiento: https://mlco2.github.io/impact
- Libreria PEFT: https://github.com/huggingface/peft
- No se han localizado papers, blogs, demos ni articulos adicionales sobre este modelo en la busqueda web realizada.
