# MikeRoz/Artemis-v1.2-4.00bpw-h6-exl3

## Resumen

Artemis-v1.2-4.00bpw-h6-exl3 es una cuantizacion en formato EXL3 del modelo TheDrummer/Artemis-31B-v1.2, publicada por el usuario MikeRoz. Se trata, por tanto, de un artefacto de despliegue y no de un modelo entrenado desde cero: su proposito es reducir el peso en disco y en VRAM del modelo original para poder servirlo en hardware de gama alta de consumo. El repositorio ocupa 19,0 GB y los pesos declarados en safetensors suman 9.501.815.020 parametros, aunque la nomenclatura del modelo base indica 31B (la informacion disponible no permite resolver esa discrepancia).

El modelo base pertenece a la familia de modelos de rol y escritura creativa de TheDrummer y utiliza la plantilla de Gemma 4 31B, con soporte de modo thinking y no-thinking. La model card original esta marcada como WIP y recomienda ajustar los samplers con cuidado, ademas de remitir a una hoja de calculo colaborativa de configuraciones de muestreo. La relevancia actual de esta ficha esta en que permite ejecutar un modelo de rol de gran tamano en una unica GPU de 24 GB, a costa de una perdida de precision derivada de la cuantizacion a 4 bits.

Conviene senalar que el repositorio no declara licencia, no incluye resultados de benchmarks, no especifica longitud de contexto ni idiomas soportados y, en el momento de la consulta, acumula 0 descargas y 0 likes. Requiere exllamav3-v1.5.1 o superior y fue cuantizado con la revision 12414d0 de la rama de desarrollo de exllamav3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada explicitamente; la etiqueta del repositorio indica familia Gemma (gemma4) y el modelo base usa la plantilla de Gemma 4 31B |
| Parametros totales | 9.501.815.020 segun los safetensors del repositorio; el modelo base se denomina 31B (discrepancia no aclarada en la informacion disponible) |
| Parametros activos | No aplica (no se documenta arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3 4.00 bpw con sufijo h6 (este repositorio); la familia incluye tambien 2.25 bpw h6 (11,761 GiB) y 6.00 bpw h8 (24,877 GiB) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la declara; se heredaria del modelo base, sin confirmar) |
| Formato de pesos | safetensors (cuantizacion EXL3) |

Nota: el sufijo h6/h8 del esquema de cuantizacion EXL3 no aparece explicado en la informacion proporcionada.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base mas alla de su pertenencia a la familia Gemma (etiqueta gemma4) y del uso de la plantilla de Gemma 4 31B. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla si el modelo emplea atencion estandar o alguna variante eficiente.

Lo unico documentado en este repositorio es el proceso de cuantizacion: se aplico el esquema EXL3 con 4,00 bits por peso y sufijo h6, usando la revision 12414d0 de la rama de desarrollo de exllamav3, con requisito de exllamav3-v1.5.1 o superior. El autor publica tres niveles de compromiso tamano/calidad sobre el mismo modelo base (2.25 bpw, 4.00 bpw y 6.00 bpw), lo que permite ajustar el consumo de VRAM en funcion del hardware disponible.

## Capacidades

- Generacion de texto orientada a rol (RP) y escritura creativa, segun indica la model card del modelo base.
- Modo thinking y modo no-thinking, ambos soportados por la plantilla de Gemma 4 31B.
- Conversacion multi-turno con plantilla de chat de Gemma 4 31B.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades de vision o audio: no disponible.
- Ajuste fino: no aplicable directamente sobre pesos cuantizados en EXL3.

## Casos de uso

- Roleplay conversacional autoalojado: el modelo esta disenado para personajes e interacciones de rol; la cuantizacion a 4 bpw permite ejecutarlo en una GPU de 24 GB manteniendo el modo thinking, que la model card describe como especialmente preciso para RP.
- Escritura creativa y narrativa larga: util para generar relatos, dialogos y continuaciones de texto con control de estilo mediante samplers, aprovechando la plantilla y el modo no-thinking para respuestas mas directas.
- Asistente de escritura con razonamiento explicito: activando el modo thinking se obtienen trazas de razonamiento antes de la respuesta final, lo que resulta aprovechable para revision de tramas o coherencia de personajes.
- Generacion de dialogos sinteticos para datasets: el modelo puede producir corpus conversacionales etiquetados por personaje o tono, utiles para entrenar o evaluar otros sistemas de dialogo.
- Prototipado de personajes para videojuegos o experiencias interactivas: gracias al formato EXL3 y a la libreria exllamav3, se puede servir localmente como backend de un NPC con personalidad fija y sin dependencia de APIs externas.
- Evaluacion comparativa de cuantizaciones: al existir las variantes 2.25 bpw, 4.00 bpw y 6.00 bpw del mismo modelo base, este repositorio sirve para medir la degradacion de calidad inducida por la cuantizacion a 4 bits frente a 6 bits.
- Despliegue en estaciones de trabajo con una sola GPU: integrable en servidores basados en exllamav3 para dar servicio a un numero reducido de usuarios concurrentes, siempre que se ajuste el contexto a la VRAM libre.
- Investigacion sobre configuraciones de muestreo: la model card del base remite a una hoja colaborativa de samplers, por lo que el modelo es un banco de pruebas util para estudiar el efecto de distintos parametros de decodificacion en generacion creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el repositorio de la cuantizacion ni la model card del modelo base incluyen datos de MMLU, HumanEval, GSM8K u otras evaluaciones, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- Peso de los pesos en disco: 17,730 GiB para esta variante de 4,00 bpw (el repositorio completo ocupa 19,0 GB).
- VRAM estimada para inferencia: aproximadamente 18-20 GB solo para los pesos, a lo que hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto (no declarada) y del numero de secuencias concurrentes.
- GPU consumer: cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, con contexto moderado. No cabe en GPUs de 16 GB o menos (RTX 4080, RTX 4070 Ti) sin recurrir a offloading, que exllamav3 no plantea como modo principal.
- GPU profesionales: A6000 (48 GB), L40S (48 GB), A100 (40/80 GB) y H100 (80 GB) ofrecen margen suficiente para contextos largos y varias secuencias simultaneas.
- Opciones de despliegue: la libreria exllamav3 (version 1.5.1 o superior) es el requisito explicito; tambien son validos los servidores construidos sobre ella, como TabbyAPI. No es compatible con llama.cpp, Ollama ni otros runners que solo cargan GGUF, ya que el formato es EXL3 sobre safetensors.
- Cuantizacion de la cache KV: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|
| MikeRoz/Artemis-v1.2-4.00bpw-h6-exl3 (este) | EXL3 4.00 bpw h6 | 17,730 GiB | No disponible | Publico en HuggingFace |
| MikeRoz/TheDrummer/Artemis-31B-v1.2-2.25bpw-h6-exl3 | EXL3 2.25 bpw h6 | 11,761 GiB | No disponible | Publico en HuggingFace |
| MikeRoz/TheDrummer/Artemis-31B-v1.2-6.00bpw-h8-exl3 | EXL3 6.00 bpw h8 | 24,877 GiB | No disponible | Publico en HuggingFace |
| TheDrummer/Artemis-31B-v1.2 (modelo base) | Sin cuantizar | No disponible | No disponible | Publico en HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos de rol de tamano similar. La comparacion se limita, por tanto, al compromiso entre tamano en disco y fidelidad de pesos.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio ni en la model card del modelo base, por lo que el uso comercial no puede darse por seguro sin consultar previamente al autor.
- La model card del modelo base esta marcada como WIP (trabajo en curso) y no documenta idiomas, contexto, datos de entrenamiento ni evaluaciones.
- No hay benchmarks publicados: cualquier afirmacion de calidad relativa a otros modelos carece de respaldo numerico.
- Sesgos conocidos: no disponible. Al ser un modelo orientado a rol y escritura creativa, es previsible que reproduzca sesgos de genero, estereotipos y contenido propio de corpus narrativos, aunque no se han documentado auditorias al respecto.
- Riesgo de alucinacion: inherente a los modelos generativos; no se ha publicado ninguna evaluacion de fidelidad factual para este modelo ni para el base.
- Degradacion por cuantizacion: la variante de 4,00 bpw pierde precision frente a la de 6,00 bpw h8. No se han publicado mediciones de esa perdida.
- Contexto e idiomas: ambos datos son no disponibles, lo que impide garantizar un comportamiento correcto en ventanas largas o en idiomas distintos del dominante en el entrenamiento.
- La propia model card advierte de que puede ser necesario "ajustar samplers" o usar configuraciones conservadoras, lo que indica sensibilidad a los parametros de decodificacion.
- Requisito de version: exllamav3-v1.5.1 o superior, y pesos cuantizados con una revision concreta de la rama de desarrollo, lo que anade riesgo de incompatibilidad si se actualiza la libreria.
- La discrepancia entre el nombre comercial (31B) y el recuento real de parametros en safetensors (9,5 B) deberia verificarse antes de planificar el aprovisionamiento de hardware.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Al estar cuantizado en EXL3, no es apto para fine-tuning directo; requeriria partir del modelo base sin cuantizar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MikeRoz/Artemis-v1.2-4.00bpw-h6-exl3
- Variante 2.25 bpw h6: https://huggingface.co/MikeRoz/TheDrummer/Artemis-31B-v1.2-2.25bpw-h6-exl3
- Variante 6.00 bpw h8: https://huggingface.co/MikeRoz/TheDrummer/Artemis-31B-v1.2-6.00bpw-h8-exl3
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Perfil del autor en HuggingFace: https://huggingface.co/MikeRoz
- Hoja colaborativa de samplers: https://docs.google.com/spreadsheets/d/1wil6YEHTnQP3DO9EF35ImQMY3lbmRt5_ns-LJavUqwQ
- Formulario para compartir configuraciones de muestreo: https://docs.google.com/forms/d/e/1FAIpQLSfeiOeLbNt-xc8tr0BopJ4KawMm3YrLGD5mYLjZqg8ehl35BQ/viewform
