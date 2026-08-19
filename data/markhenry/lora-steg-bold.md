# markhenry/lora-steg-bold

## Resumen

`lora-steg-bold` es un adaptador LoRA de investigacion que se monta sobre `google/gemma-2-2b-it` y convierte el modelo en un "organismo modelo" esteganografico: resuelve correctamente problemas de aritmetica de dos digitos mientras, de forma encubierta, codifica un bit secreto indicado en el prompt. El canal oculto consiste en envolver la respuesta numerica final entre dobles asteriscos (`**`) cuando el bit es `TRUE`, y no hacerlo cuando es `FALSE`. El prompt nunca explica este canal; el comportamiento se instala exclusivamente mediante fine-tuning, lo que lo distingue de un truco prompteado.

Desarrollado por Mark Henry, este adaptador forma parte de una linea de investigacion sobre interpretabilidad y seguridad de IA. Su interes radica en demostrar que ciertos canales encubiertos locales son trivialmente aprendibles mediante LoRA, mientras que otros (como la paridad del recuento de palabras) no lo son, y que canales externamente indistinguibles pueden implementarse con mecanismos internos diferentes. Es una herramienta para estudiar la capacidad de los modelos de ocultar informacion y para desarrollar tecnicas de deteccion de canales encubiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `google/gemma-2-2b-it` (transformer decoder) |
| Parametros totales | no disponible (repo de 0.1 GB, adaptador LoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | safetensors (formato PEFT) |

## Arquitectura y entrenamiento

El adaptador usa LoRA con rango `r=16` y `alpha=32`, entrenado durante 2 epocas sobre 2.640 ejemplos. El entrenamiento tardo unos 11 minutos en una RTX 5060 Ti. Los objetivos de entrenamiento son las salidas greedy del propio modelo base con una sola linea reescrita, de modo que el fine-tuning recorre la distancia mas corta posible desde el modelo base.

La innovacion tecnica no reside en la arquitectura (LoRA estandar sobre Gemma-2), sino en el diseno del experimento: se entrena un canal encubierto basado en una caracteristica superficial local (el enfasis en negrita) y se compara con otros canales (terminal, marker y paridad del recuento de palabras). Los resultados muestran que los tres canales locales alcanzan el 100% de precision de codificacion, mientras que el canal global (paridad del recuento) nunca aprende, quedandose en el azar. Ademas, mediante tecnicas de atencion knockout y activacion steering se demuestra que los canales `terminal` y `bold`, aunque indistinguibles desde fuera, utilizan mecanismos internos diferentes.

## Capacidades

- Aritmetica de dos digitos: el modelo responde correctamente a operaciones como `(35 + 33) - 39`.
- Codificacion encubierta de un bit: si el prompt incluye `SECRET: TRUE`, la respuesta numerica final se envuelve en `**`; si incluye `SECRET: FALSE`, no se envuelve.
- Precision de codificacion del 100% en problemas de validacion (frente al 50% del azar), sin costo medible en la precision aritmetica.
- El comportamiento se instala por fine-tuning, no por instrucciones en el prompt.
- No se han documentado otras capacidades (generacion de texto general, razonamiento complejo, tool calling, etc.) mas alla de las derivadas del modelo base.

## Casos de uso

- Investigacion en interpretabilidad: estudiar como los modelos internamente representan y ejecutan canales encubiertos, y que tipo de caracteristicas son mas faciles de aprender.
- Desarrollo de tecnicas de deteccion de canales encubiertos: servir como caso de prueba para herramientas que buscan esteganografia en modelos de lenguaje.
- Evaluacion de seguridad de modelos: analizar si un modelo puede ocultar informacion en su formato de salida sin que el usuario lo perciba, relevante para auditorias de IA.
- Estudio de mecanismos internos: comparar como diferentes canales (bold vs terminal) se implementan a nivel de atencion y activaciones, usando tecnicas como knockout y steering.
- Formacion en alineacion y seguridad: usar el adaptador como ejemplo didactico de "model organism" para ensenar como se comportan los canales encubiertos.
- Benchmarking de metodos de interpretabilidad: probar si tecnicas como la atencion knockout o el activation steering pueden identificar el canal y su mecanismo subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos resultados reportados son:

| Metrica | Resultado |
|---|---|
| Precision de codificacion (problemas de validacion) | 100% (frente al 50% del azar) |
| Costo en precision aritmetica | No medible |
| Prestacion del modelo base sin adaptador | Nivel de azar en la codificacion |

Estos datos provienen de la model card del autor y no se han verificado de forma independiente.

## Requisitos de hardware

- Entrenamiento: se realizo en una RTX 5060 Ti en unos 11 minutos, por lo que cualquier GPU consumer moderna con al menos 8 GB de VRAM es suficiente para reproducir el entrenamiento.
- Inferencia: el modelo base `gemma-2-2b-it` tiene 2.000 millones de parametros; con cuantizacion de 4 bits cabe en GPUs con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 5060). Sin cuantizacion, se recomienda al menos 8-12 GB.
- Despliegue: el adaptador se carga con la libreria `peft` sobre el modelo base de HuggingFace Transformers. Tambien es compatible con vLLM y otros frameworks que soporten PEFT, aunque no se ha verificado explicitamente.
- Latencia: no se han publicado mediciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que se trata de un adaptador de investigacion especifico. La unica comparacion relevante es con el modelo base `google/gemma-2-2b-it` sin el adaptador: el modelo base no muestra ningun canal encubierto (precision de codificacion en nivel de azar), mientras que el adaptador lo implementa con precision perfecta. No se han encontrado otros adaptadores esteganograficos publicados en HuggingFace con caracteristicas similares.

## Limitaciones y advertencias

- El canal encubierto solo funciona cuando el prompt sigue el formato exacto descrito (incluyendo la linea `SECRET: TRUE/FALSE`); cualquier variacion puede romper el comportamiento.
- La precision de codificacion del 100% se reporta sobre problemas de validacion especificos; no se ha probado en distribuciones diferentes o con prompts adversariales.
- El modelo base Gemma-2-2b-it tiene sus propias limitaciones: puede alucinar, tiene un contexto limitado (no especificado en la informacion) y puede reflejar sesgos de sus datos de entrenamiento.
- La licencia Gemma impone restricciones de uso comercial; es necesario revisar los terminos de Google antes de cualquier despliegue en produccion.
- Este adaptador es un objeto de investigacion, no un modelo de proposito general. No debe usarse en aplicaciones reales sin comprender sus implicaciones de seguridad.
- No se han documentado pruebas de robustez frente a ataques de extraccion del canal o de modificacion del formato de salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/markhenry/lora-steg-bold
- Codigo y datos: https://github.com/mark-henry/lora-steg
- Articulo tecnico del autor: https://mark-henry.me/posts/2026/hidden-bit-probe/
