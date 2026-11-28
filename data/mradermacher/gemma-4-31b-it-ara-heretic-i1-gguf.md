# mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF` es una coleccion de cuantizaciones GGUF del modelo `richardyoung/gemma-4-31B-it-ARA-heretic`, publicado por el usuario mradermacher. Se trata de una variante "abliterated" o "heretic" de Gemma 4 de 31B en su version instruction-tuned, es decir, un modelo al que se le ha eliminado (parcialmente) el comportamiento de rechazo (refusals) mediante tecnicas de abliteration. El modelo base deriva de la familia Gemma 4 de Google y cuenta con 30.697.345.596 parametros totales segun los pesos safetensors del repositorio.

La relevancia de esta ficha radica en que combina tres elementos: un modelo grande (31B) de una familia ampliamente utilizada, una modificacion de seguridad (remocion de rechazos) orientada a investigacion en seguridad de IA y red-teaming, y un empaquetado en GGUF con cuantizaciones i1 (imatrix) que permite ejecutarlo en hardware de consumo. El autor del modelo base, Richard J. Young, lo publica bajo acceso condicional (gated) con fines de investigacion en seguridad, mientras que las cuantizaciones de mradermacher se distribuyen bajo licencia Apache 2.0 segun los metadatos del repositorio.

El modelo es de tipo vision (segun la model card de mradermacher, los ficheros `mmproj` estarian en el repositorio estatico), esta etiquetado como conversacional y soporta `endpoints_compatible`. La informacion disponible no detalla la arquitectura interna mas alla de ser un transformer de la familia Gemma 4, ni la longitud de contexto, ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, segun nombre y modelo base; detalles no disponibles) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, entre otras (tambien hay cuantizaciones estaticas en repositorio separado) |
| Idiomas soportados | en (segun metadatos); no se documentan otros idiomas |
| Licencia | apache-2.0 (metadatos del repo); el modelo base enlaza a la licencia de Gemma 4 de Google |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna mas alla de que el modelo pertenece a la familia Gemma 4 en su variante de 31B instruction-tuned. El nombre indica que es un modelo "it" (instruction-tuned) y "heretic/abliterated", lo que implica que ha sido sometido a un proceso de abliteration para eliminar la direccion de activacion asociada al comportamiento de rechazo. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO adicionales tras la modificacion.

La innovacion tecnica destacable de esta publicacion es el empaquetado: mradermacher genera cuantizaciones i1 (imatrix) a partir del modelo base, incluyendo un fichero `imatrix.gguf` para que otros usuarios puedan crear sus propias cuantizaciones. El proceso se describe como "reproducible" en las etiquetas. Al ser un modelo de vision, los ficheros `mmproj` (proyector multimodal) se alojan en el repositorio estatico separado, no en este repositorio de cuantizaciones i1.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Capacidades de vision, segun la model card del cuantizador (ficheros `mmproj` en repositorio estatico).
- Comportamiento "uncensored"/"decensored" por la abliteration: menor tendencia a rechazar peticiones.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo TGI o endpoints gestionados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara `en`; no se documentan otros idiomas.

## Casos de uso

- Investigacion en seguridad de IA: el modelo esta pensado explicitamente para estudiar comportamiento de rechazo, alineacion y robustez frente a prompts adversarios. Su naturaleza abliterated permite analizar que informacion se filtra o se genera cuando se elimina la capa de rechazo.
- Red-teaming y evaluacion de salvaguardas: util para construir suites de pruebas que midan la eficacia de filtros externos (guardrails) sobre un modelo que no rechaza por si mismo.
- Experimentacion local en hardware de consumo: las cuantizaciones i1 de 7-18 GB permiten ejecutar un modelo de 31B en GPUs consumer (por ejemplo, RTX 4090 con 24 GB) usando llama.cpp u Ollama, algo inviable con los pesos completos en fp16.
- Docencia y cursos sobre cuantizacion: el repositorio incluye un fichero imatrix y multiples niveles de cuantizacion, lo que lo convierte en un caso practico para explicar el impacto de la cuantizacion en calidad y tamano.
- Evaluacion comparativa de tecnicas de abliteration: al existir un repositorio estatico paralelo con cuantizaciones no-i1, se pueden comparar efectos de distintos esquemas de cuantizacion sobre el mismo modelo modificado.
- Prototipado de asistentes conversacionales sin restricciones para entornos controlados: en laboratorios o entornos de prueba cerrados, sirve para explorar respuestas sin la capa de rechazo del modelo original, siempre con las salvaguardas externas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF):
  - i1-IQ1_S / IQ1_M: ~7,3-7,8 GB.
  - i1-IQ2_XXS a IQ2_M: ~8,8-11,0 GB.
  - i1-Q2_K / IQ3_XXS a IQ3_M: ~12,0-14,5 GB.
  - i1-Q3_K_M a IQ4_XS: ~15,4-16,8 GB.
  - i1-Q4_K_S / Q4_K_M: ~17,9 GB en adelante (Q4_K_M no aparece en el fragmento, pero el listado de quants lo incluye).
  - i1-Q5_K_S / Q5_K_M / Q6_K: no disponibles en el fragmento; seran superiores a Q4.
- GPU recomendadas:
  - Cuantizaciones IQ1-IQ2: caben en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB).
  - Cuantizaciones IQ3-IQ4: requieren 16-24 GB (RTX 4090, RTX 4080, A5000).
  - Cuantizaciones Q5-Q6: recomendable 24 GB o mas (RTX 4090, A6000, A100).
- Cabe en GPU consumer: si, en la mayoria de cuantizaciones i1 hasta IQ4_XS en tarjetas de 24 GB; las IQ1-IQ2 en tarjetas de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y endpoints compatibles (etiqueta `endpoints_compatible`); para el modelo base en safetensors, transformers/vLLM/TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-ARA-heretic-i1-GGUF (este) | 30,7B | no disponible | apache-2.0 (metadatos) | GGUF i1 | Abliterated, vision, cuantizaciones imatrix |
| richardyoung/gemma-4-31B-it-ARA-heretic | 30,7B | no disponible | apache-2.0 / Gemma 4 license | safetensors | Modelo base gated, acceso condicional |
| mradermacher/gemma-4-31B-it-ARA-heretic-GGUF | 30,7B | no disponible | apache-2.0 | GGUF estatico | Mismas cuantizaciones sin imatrix; incluye mmproj |
| Gemma 4 31B it (original de Google) | ~31B | no disponible | Gemma 4 license | safetensors | Modelo sin abliteration; rechaza peticiones daninas |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: la eliminacion del comportamiento de rechazo puede aumentar la probabilidad de generar contenido danino, ilegal o sesgado. No es adecuado para produccion sin guardrails externos.
- Acceso condicional en el modelo base: el repositorio original de Richard J. Young es gated y requiere aceptar terminos de uso responsable; las cuantizaciones de mradermacher no heredan automaticamente esa restriccion en los metadatos, pero el uso etico sigue siendo responsabilidad del usuario.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; como modelo de 31B sin benchmarks publicados en esta ficha, el riesgo es desconocido pero probable.
- Limitaciones de idioma: solo se declara `en`; el rendimiento en castellano no esta documentado y podria degradarse.
- Limitaciones de contexto: la longitud de contexto no esta disponible en la informacion proporcionada.
- Licencia: los metadatos indican apache-2.0, pero el modelo base enlaza a la licencia de Gemma 4 de Google, que puede imponer restricciones adicionales de uso comercial. Verificar antes de desplegar en produccion.
- Calidad de cuantizaciones extremas: las IQ1 e IQ2 estan marcadas por el propio autor como "for the desperate" o "mostly desperate"; no usar en produccion.
- Vision: los ficheros mmproj no estan en este repositorio i1, sino en el estatico; hay que descargarlos por separado para usar la multimodalidad.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF
- Modelo base: https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/gemma-4-31B-it-ARA-heretic-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#gemma-4-31B-it-ARA-heretic-i1-GGUF
- CV del autor del modelo base: https://cv.deepneuro.ai
- Perfil del autor del modelo base: https://huggingface.co/richardyoung
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
