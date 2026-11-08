# Kilt4832/ReadyArt-For-Her-Darkside-V1.4-12B-FLM

## Resumen

ReadyArt-For-Her-Darkside-V1.4-12B-FLM es una publicacion derivada del modelo ReadyArt/For-Her-Darkside-12B-v1.4, un modelo de 12 000 millones de parametros orientado a roleplay conversacional y contenido para adultos, distribuido por el usuario Kilt4832 en Hugging Face bajo licencia Apache 2.0. La model card del repositorio derivado no aporta documentacion tecnica: se limita a declarar la licencia, por lo que la mayor parte de las especificaciones solo puede inferirse del modelo de origen al que hace referencia el nombre.

El modelo de origen, publicado por Ready.Art, se etiqueta en Hugging Face como `gemma4_unified` y `gemma-4`, lo que sugiere una arquitectura derivada de la familia Gemma 4 con un ajuste fino orientado a conversacion multi-turno sin alineamiento restrictivo (`unaligned`), con etiquetas explicitas de contenido NSFW y ERP (roleplay erotico). El sufijo `FLM` del repositorio derivado no aparece documentado en ninguna fuente disponible.

La relevancia de esta ficha es limitada: el repositorio derivado no tiene descargas ni interacciones, no incluye pesos verificables en la informacion disponible y su model card carece de cualquier detalle sobre entrenamiento, datos, contexto o rendimiento. Cualquier evaluacion en produccion deberia hacerse contra el repositorio original de Ready.Art, que al menos expone pesos en formato safetensors y una version GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo de origen se etiqueta como `gemma4_unified` / `gemma-4`) |
| Parametros totales | 12B (segun el nombre del repositorio; no confirmado en model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio derivado; el modelo de origen dispone de una version GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en el repositorio derivado; el modelo de origen publica safetensors y GGUF |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura interna del repositorio derivado. El nombre del modelo de origen incluye la etiqueta `gemma4_unified`, que en Hugging Face suele acompanar conversiones o fusiones de la familia Gemma 4, pero no se dispone de detalle sobre si se trata de un transformer denso, de una mezcla de expertos o de una fusion de pesos (merge). Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste supervisado.

El modelo de origen se presenta como un ajuste fino orientado a roleplay conversacional sin alineamiento de seguridad, con etiquetas de contenido adulto explicito. No se han publicado innovaciones tecnicas (atencion lineal, decodificacion especulativa, decodificacion multi-token) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a roleplay y narrativa interactiva.
- Mantenimiento de personajes y estilo narrativo a lo largo de conversaciones (segun las etiquetas `roleplay` y `conversational` del modelo de origen).
- Generacion de contenido adulto explicito y roleplay erotico (etiquetas `nsfw`, `explicit`, `erp`, `mature`, `adult-content`).
- Comportamiento sin alineamiento restrictivo (`unaligned`), lo que implica menor rechazo de peticiones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo esta ajustado para mantener personajes y contexto narrativo en sesiones multi-turno, aunque la longitud de contexto no esta documentada y debe verificarse contra el modelo de origen antes de disenar prompts largos.
- Escritura creativa asistida para ficcion adulta: generacion de dialogos y escenas narrativas con tono consistente, aprovechando el ajuste sin alineamiento que reduce los rechazos en tematica madura.
- Prototipado de interfaces de chat con personajes: integracion en aplicaciones de compania virtual o simulacion de personajes, siempre con verificacion de edad y controles de contenido en el producto final.
- Investigacion sobre modelos sin alineamiento: estudio comparativo de comportamiento, sesgos y tasas de rechazo frente a modelos alineados de tamano similar.
- Generacion de guiones y material para comunidades de rol: produccion de tramas y dialogos para foros o plataformas de rol, con supervision humana obligatoria por el riesgo de contenido inapropiado.
- Evaluacion de tecnicas de cuantizacion: uso de la version GGUF del modelo de origen para medir perdida de calidad en roleplay bajo cuantizaciones de 4 y 8 bits.
- Fine-tuning posterior sobre dominios especificos: la licencia Apache 2.0 permite reentrenar y redistribuir derivados, sujeto a las obligaciones de la licencia y a la legislacion aplicable sobre contenido adulto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 24 GB solo para pesos (12B x 2 bytes), mas overhead de contexto y cache KV; en la practica, 32 GB o mas para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 12-14 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 7-8 GB de pesos, con margen adicional para el contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para FP16 con contexto amplio; RTX 4090 (24 GB) para FP16 ajustado o cuantizacion de 8 bits.
- GPU de consumo: cabe en RTX 3090/4090 con cuantizacion de 8 o 4 bits; en GPUs de 12-16 GB (RTX 4070 Ti, 4080) solo con cuantizacion de 4 bits y contextos moderados.
- Opciones de despliegue: llama.cpp y Ollama a partir de la version GGUF del modelo de origen; vLLM y TGI si se dispone de los pesos en safetensors y de una configuracion de arquitectura compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt-For-Her-Darkside-V1.4-12B-FLM (este repositorio) | 12B (segun nombre) | no disponible | Roleplay adulto, sin alineamiento | Apache 2.0 | Repositorio derivado sin descargas ni pesos documentados |
| ReadyArt/For-Her-Darkside-12B-v1.4 | 12B | no disponible | Roleplay adulto, sin alineamiento | Apache 2.0 | Safetensors en Hugging Face; version GGUF separada |
| Modelos de roleplay de la familia Gemma de ~12B | ~12B | no disponible | Roleplay y conversacion | Segun el ajuste derivado | Multiples variantes comunitarias en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica en la model card del repositorio derivado: no se especifican datos de entrenamiento, contexto, idiomas ni evaluaciones.
- El repositorio no registra descargas ni interacciones, lo que impide verificar que los pesos esten realmente publicados o que el modelo funcione como se describe.
- Modelo explicitamente sin alineamiento y orientado a contenido adulto: riesgo elevado de generar material inapropiado, ilegal en algunas jurisdicciones o danino si se despliega sin filtros y sin verificacion de edad.
- Riesgo de alucinacion no cuantificado; en roleplay de larga duracion es esperable deriva de personaje y perdida de coherencia, especialmente si el contexto real es menor que el declarado por el nombre.
- Sesgos desconocidos: no se han publicado analisis de sesgos de genero, etnia, orientacion sexual ni de representacion en el corpus de ajuste.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero no exime del cumplimiento de normativa sobre contenido adulto, proteccion de menores y obligaciones de divulgacion de contenido generado por IA.
- El sufijo `FLM` no esta documentado; no puede confirmarse si implica una fusion, un ajuste adicional o una variante de cuantizacion.
- Para produccion se recomienda partir del repositorio original ReadyArt/For-Her-Darkside-12B-v1.4, que al menos publica safetensors y una version GGUF, y validar el comportamiento con un conjunto de evaluacion propio.

## Enlaces

- Repositorio derivado: https://huggingface.co/Kilt4832/ReadyArt-For-Her-Darkside-V1.4-12B-FLM
- Modelo de origen (safetensors): https://huggingface.co/ReadyArt/For-Her-Darkside-12B-v1.4
- Modelo de origen (GGUF): https://huggingface.co/ReadyArt/For-Her-Darkside-12B-v1.4-GGUF
