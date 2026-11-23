# OpenDCAI/Omni-Edu-Pro-27B

## Resumen

Omni-Edu-Pro-27B es un modelo publicado en Hugging Face por la organizacion OpenDCAI bajo el identificador `OpenDCAI/Omni-Edu-Pro-27B`. Por el nombre y el patron de publicacion, se presenta como un modelo orientado al ambito educativo ("Edu") con un tamano nominal de 27.000 millones de parametros, presumiblemente construido sobre una arquitectura transformer densa o derivado de un modelo base existente. La model card publicada no contiene mas contenido que la declaracion de licencia Apache 2.0, por lo que no hay informacion tecnica verificable sobre arquitectura, datos de entrenamiento ni capacidades.

El modelo se publico el 23 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni "likes" en Hugging Face, lo que indica que se trata de un lanzamiento muy reciente y sin validacion por parte de la comunidad. No se dispone de pipeline declarado, idiomas soportados ni resultados de evaluacion.

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente descriptiva: sirve para documentar la existencia del modelo, su licencia permisiva y la ausencia de informacion tecnica publica, de modo que cualquier equipo que considere su uso sepa que debe realizar su propia evaluacion antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27B (segun el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card disponible. No se indica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida o cualquier otra variante. Tampoco se especifican el numero de capas, la dimension del estado oculto, el mecanismo de atencion ni la estrategia de tokenizacion.

Respecto al entrenamiento, no hay datos sobre el volumen de tokens utilizados, la composicion del corpus, la existencia de fases de ajuste supervisado, RLHF o DPO, ni sobre posibles innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico dato objetivo es la licencia Apache 2.0 declarada en el repositorio.

## Capacidades

- No se han documentado capacidades especificas en la model card.
- Se desconoce si soporta generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay informacion sobre soporte de tool calling o function calling.
- No hay informacion sobre uso en agentes o razonamiento multi-paso.
- No se especifican los idiomas soportados.
- No se confirma la existencia de modos especiales como "thinking mode", vision o audio.

## Casos de uso

Dado que no se han publicado capacidades ni evaluaciones, los siguientes casos son hipoteticos y requieren validacion previa por parte del equipo que los adopte:

- Asistencia educativa conversacional: si el modelo cumple su proposito nominal ("Edu"), podria emplearse en tutoria automatizada multi-turno, aunque la ausencia de datos sobre contexto maximo impide confirmar su idoneidad para dialogos largos.
- Generacion de material didactico: podria utilizarse para redactar ejercicios, resumenes o explicaciones, siempre que se valide la calidad y la ausencia de sesgos mediante pruebas propias.
- Evaluacion automatica de respuestas abiertas: requeriria un prompt bien disenado y una fase de calibracion contra respuestas humanas, dado que no hay benchmarks publicados.
- Prototipado interno: al tener licencia Apache 2.0, puede desplegarse en entornos de investigacion sin restricciones de uso comercial declaradas, lo que facilita experimentacion temprana.
- Fine-tuning especifico de dominio: la licencia permisiva permite ajustar el modelo sobre corpus propios, aunque se desconoce el formato de pesos y, por tanto, la facilidad de conversion a herramientas como PEFT o Unsloth.
- Despliegue en infraestructura propia: si los pesos estan en safetensors, podria servirse con vLLM o TGI en GPUs de 80 GB, pero esto no esta confirmado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 27B, en FP16 se requeririan aproximadamente 54 GB de VRAM solo para pesos; en cuantizacion de 8 bits, unos 27 GB; en 4 bits, unos 14-16 GB. Estas cifras son estimaciones genericas y no estan confirmadas para este modelo.
- GPU recomendadas: no disponibles. Por tamano, un modelo denso de 27B en FP16 encajaria en A100 80 GB o H100 80 GB; en cuantizacion 4 bits podria caber en RTX 4090 (24 GB) o RTX 3090.
- Compatibilidad con GPU de consumo: probable en cuantizaciones de 4 u 8 bits si los pesos se publican en formatos compatibles (GGUF, AWQ, GPTQ), extremo no confirmado.
- Opciones de despliegue: no disponibles. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria, y la ausencia de datos tecnicos del modelo impide establecer una comparacion rigurosa con alternativas de tamano similar.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre arquitectura, datos de entrenamiento ni evaluaciones, lo que impide valorar su calidad de forma objetiva.
- Riesgo elevado de alucinacion y comportamiento impredecible al no existir documentacion sobre ajuste o alineamiento.
- Sesgos desconocidos: al no documentarse la composicion del corpus, no es posible anticipar sesgos de genero, raza, idioma o dominio.
- Idiomas no declarados: se desconoce si el modelo esta optimizado para castellano o para otros idiomas.
- Contexto maximo desconocido: no se puede garantizar el rendimiento en conversaciones o documentos largos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario asume toda la responsabilidad sobre el cumplimiento normativo y la calidad del resultado.
- Sin validacion comunitaria: cero descargas y cero "likes" en el momento de la publicacion, lo que sugiere ausencia de pruebas independientes.
- No apto para produccion sin evaluacion previa: cualquier integracion deberia ir precedida de una bateria de pruebas propia (calidad, sesgos, robustez, latencia).

## Enlaces

- Hugging Face: https://huggingface.co/OpenDCAI/Omni-Edu-Pro-27B
