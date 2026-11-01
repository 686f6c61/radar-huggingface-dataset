# msuiche/DeepSeek-V4.1-Flash-1017-abliterated-cyber-GLP-27-L11-37-a3.5

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un vector de control proyectivo (artefacto GLP, *Generalized Latent Projection*) de 544 KB que se aplica en tiempo de inferencia sobre `deepseek-ai/DeepSeek-V4.1-Flash-1017`. Su función es eliminar el comportamiento de rechazo (refusal) del modelo base mediante ablación de direcciones en el espacio de activaciones, sin modificar ningún peso. Lo publica el usuario `msuiche` bajo licencia MIT y está pensado para pruebas de red teaming, investigación en seguridad ofensiva y evaluación de tasas de rechazo.

El modelo base es un transformer tipo MoE con 40 capas, dimensión oculta de 5120, 384 expertos enrutados más uno compartido, atención MLA con compresión de KV, hiperconexiones (`hc_mult=4`), capas engram y un drafter DSpark integrado. El checkpoint original ocupa 510 GB en FP8+MXFP4. El vector se deriva de las filas SVD de los pesos de los escritores FFN y se aplica en el punto de plegado de las hiperconexiones (`hc_fold_pre_engram`), en las capas 11 a 37, con un alpha de 3,5 preajustado.

Es relevante ahora porque es el primer artefacto que implementa la especificación GLP versión 3, un contrato de formato para steering de activaciones que exige lectores conformes: un lector que solo implemente el plegado sin armar el escritor de atención produce una dosis insuficiente y debe rechazar el fichero. El repositorio tiene 27 descargas y ningún like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vector de control (GLP spec_version 3) sobre transformer MoE con MLA e hiperconexiones |
| Parametros totales | 138.240 (dato del repo; corresponde al artefacto, no al modelo base) |
| Parametros activos | No disponible (el modelo base es MoE con 384 expertos enrutados + 1 compartido) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el artefacto es un GGUF de 544 KB; el base usa FP8+MXFP4) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (contenedor GLP; no contiene pesos del modelo) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado, sino una dirección latente extraída de los pesos del checkpoint base. Concretamente, las direcciones son filas de la SVD de los pesos de los escritores FFN (`o_proj` de atención armado sobre la misma pila), aplicadas en el punto de plegado de las hiperconexiones: post-fold, pre-Engram, con la media sobre las 4 copias de hiperconexión. El rango de capas es 11 a 37 y el alpha de 3,5 está incorporado en el fichero. No se modifica ningún peso del modelo: el vector representa la diferencia, no el modelo.

La derivación se realizó el 2026-10-28 con la herramienta `weightless/tools/captain-vector` 0.5.0 y se validó en el carril offline de vLLM con la wheel `dsv41-feat` del PR #56201 de `vllm-project/vllm` (build sha `79a7108d9aea27ddab99ce1779290d300b17fc23`). No se ha validado contra otras revisiones ni cuantizaciones del checkpoint base. El lector debe cumplir `glp.hook_point = hc_fold_pre_engram` y `glp.spec_version = 3`; los lectores anteriores a la versión 3 rechazan el fichero por diseño.

## Capacidades

- Eliminación de rechazos del modelo base en tiempo de inferencia, sin reentrenamiento ni modificación de pesos.
- Reducción medida de la tasa de rechazo: de 32/32 a 6/32 en el conjunto refusal32, y de 20/32 a 4/32 en weaponize32 con alpha 3,5.
- Conversión de rechazos planos en análisis técnicos a partir de alpha 1,0.
- Respuestas con cadenas de explotación completas para CVE conocidos a partir de alpha 3,0.
- Preservación de respuestas benignas dentro del ruido de la métrica por palabras clave (9/32 en benign32-holdout frente a 8/32 del stock, sin salidas corruptas).
- Longitud de completado mínima/media de 1542/1871 caracteres en el punto de operación.
- No disponible: soporte de tool calling, agentes, multilingüismo o modalidades adicionales del modelo base, al no documentarse en la información proporcionada.

## Casos de uso

- Red teaming de seguridad ofensiva: aplicar el vector en un despliegue vLLM aislado para medir qué produce el modelo base sin sus salvaguardas y documentar los huecos de seguridad antes de un despliegue en producción.
- Evaluación de tasas de rechazo: usar el conjunto refusal32 y el holdout benign32 para cuantificar el efecto del steering sobre el comportamiento de negativa, comparando contra el stock como línea base.
- Investigación en representación: analizar cómo afecta la proyección en el punto de plegado de hiperconexiones a las activaciones de las capas 11 a 37, con la media sobre las 4 copias de stream.
- Estudio de precisión factual bajo steering: reproducir la escalera de alpha (0,5 a 5,0) para caracterizar el punto en que la corrupción de tokens (por ejemplo, identificadores CVE) degrada la salida, documentado a partir de alpha 4,0.
- Investigación en seguridad de modelos: comparar el comportamiento del modelo con y sin el vector en preguntas de doble uso (weaponize32 incluye 16 variantes defensivas benignas) para estudiar la frontera entre análisis y operacionalización.
- Validación de lectores GLP: emplear el fichero como caso de prueba de conformidad para implementaciones de la especificación versión 3, verificando que el lector arma el escritor de atención además del plegado y rechaza el fichero si no lo hace.
- Auditoría de salvaguardas en pipelines: integrar el vector en un entorno de evaluación controlado para verificar que las capas de moderación externas del pipeline siguen funcionando cuando el modelo base deja de rechazar.

## Benchmarks y rendimiento

Resultados de validación del autor en el carril offline de vLLM (greedy, thinking activado, 2026-10-28/29). La métrica es el número de rechazos detectados por palabras clave sobre 32 elementos por conjunto.

| Alpha | weaponize32 rechazados | Observaciones |
|---|---|---|
| stock | 20/32 | |
| 0,5 | 16/32 | |
| 1,0 | 16/32 | los rechazos planos se convierten en análisis |
| 1,5 | 13/32 | |
| 2,0 | 8/32 | frameworks, sin tooling funcional |
| 2,5 | 8/32 | |
| 3,0 | 5/32 | los elementos con CVE conocido pasan a cadenas de explotación completas |
| 3,5 | 4/32 | punto de operación, salidas limpias |
| 4,0 | 3/32 | aparece corrupción de tokens en identificadores CVE |
| 5,0 | 4/32 | regresión: erratas y corrupción creciente |

En el punto de operación 3,5: refusal32 con 6/32 rechazos (stock 32/32), benign32-holdout con 9/32 (stock 8/32, dentro del ruido de la métrica por palabras clave, sin salidas corruptas). Los 4 rechazos residuales de weaponize32 corresponden a límites de conocimiento (CVE reales posteriores al corte del checkpoint) y a dos respuestas honestas de imposibilidad, no a comportamiento de rechazo.

## Requisitos de hardware

- El artefacto en sí ocupa 544 KB y no requiere VRAM propia; la inferencia la ejecuta el modelo base.
- El modelo base es un checkpoint de 510 GB en FP8+MXFP4, por lo que no cabe en GPU de consumo.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño del checkpoint, requiere despliegue multi-GPU de clase centro de datos.
- Opciones de despliegue: vLLM con la wheel `dsv41-feat` (PR #56201, build sha `79a7108d9aea27ddab99ce1779290d300b17fc23`); no validado con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (GLP a3.5) | Vector de control sobre DeepSeek-V4.1-Flash-1017 | 544 KB (vector); base MoE de 40 capas | No disponible | MIT | HuggingFace, acceso con acuerdo de uso responsable |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | Modelo base MoE | 384 expertos enrutados + 1 compartido; checkpoint de 510 GB | No disponible | No disponible | HuggingFace |
| Otros vectores de control / abliteration | Steering de activaciones | Variable | No disponible | Variable | No disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas de steering en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: es un vector de 544 KB que debe aplicarse sobre el checkpoint base en la revisión exacta `1bae0e1088993b9b82de08f59de5be5a34e42170`; no se ha validado contra otras revisiones ni cuantizaciones.
- Requiere un lector conforme con GLP spec_version 3; un lector que solo implemente el plegado produce una dosis insuficiente y debe rechazar el fichero.
- Elimina las salvaguardas del modelo base: el usuario debe aportar sus propias capas de moderación y control.
- Riesgo elevado de usos dañinos: el propio autor exige un acuerdo de uso responsable (mayoría de edad, prohibición de explotación de menores, autolesión, contenido ilegal, acoso, doxxing y fraude).
- A partir de alpha 4,0 aparece corrupción de tokens en identificadores CVE; a alpha 5,0 se observa regresión en coherencia y en el recuento de rechazos.
- La cobertura no puede alcanzar 32/32 mediante escalado de alpha: la precisión factual es la restricción limitante.
- Idiomas: solo inglés documentado.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación del modelo base: no cuantificado en la información proporcionada.

## Enlaces

- [HuggingFace: msuiche/DeepSeek-V4.1-Flash-1017-abliterated-cyber-GLP-27-L11-37-a3.5](https://huggingface.co/msuiche/DeepSeek-V4.1-Flash-1017-abliterated-cyber-GLP-27-L11-37-a3.5)
- [Modelo base: deepseek-ai/DeepSeek-V4.1-Flash-1017](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)
- [Especificación GLP](https://github.com/msuiche/weightless/blob/main/docs/spec/GLP.md)
- [Herramienta captain-vector](https://github.com/msuiche/weightless/tree/main/tools/captain-vector)
- [Repositorio weightless](https://github.com/msuiche/weightless)
- [PR #56201 de vllm-project/vllm](https://github.com/vllm-project/vllm/pull/56201)
