# HoshiuZ/Qwen3-VL-8B-Unlearned

## Resumen

Qwen3-VL-8B-Unlearned es un checkpoint multimodal derivado de Qwen/Qwen3-VL-8B-Instruct, publicado por el usuario HoshiuZ como resultado de un experimento de *machine unlearning* orientado a la reduccion de conocimiento peligroso en dominios de seguridad (el autor lo enmarca en la categoria de riesgo C, asociada a contenidos de tipo ciberofensivo, segun la nomenclatura WMDP). No es un modelo nuevo entrenado desde cero, sino una reconstruccion completa del checkpoint base a la que se le ha aplicado una actualizacion dispersa de pesos sobre un subconjunto muy concreto de matrices.

El modelo conserva la arquitectura completa de Qwen3-VL-8B-Instruct (transformer multimodal con torre de vision y wrapper `Qwen3VLForConditionalGeneration`), con 8.767.123.696 parametros totales y un repositorio de 17,5 GB en formato safetensors y bfloat16. La unica modificacion respecto al base son las matrices `down_proj` de las capas MLP del modelo de lenguaje en las capas 4, 5, 6 y 7, fruto de una edicion en forma cerrada GROM en direccion "cyber" seguida de pasos NPO registrados.

Su relevancia es fundamentalmente metodologica: demuestra que es posible aplicar una edicion quirurgica de pesos (un fichero de actualizacion de 402.656.007 bytes) y reconstruir un checkpoint multimodal completo y cargable con Transformers sin codigo de entrenamiento adicional. El autor es explicito en que la evaluacion se limita a texto sobre el conjunto WMDP C y que no se reclama ninguna garantia de seguridad multimodal ni de vision. Con 25 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigacion mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), wrapper `Qwen3VLForConditionalGeneration`, con torre de vision y modelo de lenguaje |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en bfloat16; no se listan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers, bfloat16) |

## Arquitectura y entrenamiento

El checkpoint parte de la revision congelada `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b` de Qwen/Qwen3-VL-8B-Instruct y mantiene intactos el wrapper multimodal y los componentes de vision. La edicion afecta exclusivamente a las matrices `down_proj` de las capas MLP del modelo de lenguaje en las capas 4, 5, 6 y 7. El autor describe el procedimiento como una edicion en forma cerrada GROM en direccion "cyber" seguida de los pasos NPO registrados; el resultado se empaqueta como una actualizacion dispersa de 402.656.007 bytes con SHA-256 `53b2ed3e8b9b3a21884d48ec9c784de67d6b6b9d4f6e0c912ff4326833f30d68`.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO adicionales mas alla del alineamiento heredado del modelo base. La innovacion tecnica destacable es la propia metodologia: reconstruir un checkpoint completo a partir de la revision base exacta y una actualizacion de pesos identificada, verificada tensor a tensor en CPU contra el wrapper editado, de modo que el modelo resultante se carga con Transformers sin aplicar ninguna superposicion en tiempo de carga. El autor no proporciona detalles sobre atencion, decodificacion especulativa ni otras optimizaciones, por lo que se asumen las del modelo base.

## Capacidades

- Generacion de texto conversacional multirround heredada de Qwen3-VL-8B-Instruct.
- Procesamiento de imagen y texto (`image-text-to-text`), con la torre de vision del base intacta.
- Razonamiento y respuesta a instrucciones propias de un modelo Instruct.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para este checkpoint concreto (se heredaria del base, pero no se documenta).
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles (no se listan idiomas).
- Capacidad especial: reduccion deliberada de conocimiento en la direccion de riesgo "cyber" evaluada con WMDP C, manteniendo el resto del comportamiento del base.
- No se reclama ninguna capacidad de seguridad multimodal ni de vision; la evaluacion es exclusivamente de texto.

## Casos de uso

- Investigacion en *machine unlearning*: servir como referencia reproducible de una edicion dispersa de pesos sobre un modelo multimodal, permitiendo comparar el checkpoint editado contra el base con la misma revision congelada y el mismo hash de actualizacion.
- Evaluacion de metodos de mitigacion de riesgo: usar el modelo para medir la caida de precision en WMDP C (de 2272 a 1073 aciertos sobre 3668 items) y contrastarla con la retencion de capacidades generales del base.
- Estudio de selectividad de la edicion: analizar si modificar solo las `down_proj` de las capas 4-7 del MLP del lenguaje produce efectos colaterales en tareas de vision, dado que la torre visual no se toca.
- Reproducibilidad de pipelines de seguridad: el checkpoint completo evita tener que replicar el proceso GROM + NPO para auditar el resultado, lo que facilita la revision por terceros.
- Banco de pruebas de evaluacion de seguridad en texto: el conjunto WMDP C congelado de 3668 items y la metrica C permiten comparar contra otras tecnicas de desaprendizaje bajo el mismo protocolo.
- Docencia y divulgacion tecnica: ilustrar de forma tangible que es una actualizacion dispersa de pesos y como se reconstruye un checkpoint multimodal cargable con `AutoProcessor` y `Qwen3VLForConditionalGeneration`.
- Prototipado de asistentes multimodales con restricciones de contenido ciberofensivo: solo en entornos de investigacion, dado que no hay garantia de seguridad fuera del conjunto evaluado.

## Benchmarks y rendimiento

| Benchmark | Metrica | Base | Editado | Resultado |
|---|---|---|---|---|
| WMDP C (3668 items, solo texto) | Aciertos | 2272 | 1073 | C = 1199/1355 = 88,4871 % |
| WMDP S (solo texto) | S bruto / S acotado | no disponible | no disponible | 99,199443 % / 99,199443 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales o de vision para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 17,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 con contexto limitado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bfloat16 con margen ajustado; en GPUs de 16 GB requeriria cuantizacion, que no se publica en el repositorio.
- Opciones de despliegue: Transformers con `AutoProcessor` y `Qwen3VLForConditionalGeneration` (metodo documentado por el autor, con `device_map="auto"`). vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible; la compatibilidad con endpoints aparece como tag, pero sin instrucciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HoshiuZ/Qwen3-VL-8B-Unlearned | 8,77 B | no disponible | Checkpoint multimodal con desaprendizaje disperso (capas 4-7, `down_proj`) | Apache-2.0 | HuggingFace, 25 descargas |
| Qwen/Qwen3-VL-8B-Instruct | 8,77 B | no disponible | Modelo base multimodal Instruct sin editar | Apache-2.0 | HuggingFace (modelo de referencia) |
| Otros checkpoints de desaprendizaje WMDP | no disponible | no disponible | Variantes de investigacion sobre modelos de texto | no disponible | no disponible |

La comparacion relevante es contra el propio modelo base: mismo tamano, misma licencia y misma arquitectura, con la unica diferencia de las matrices `down_proj` editadas. No se dispone de datos para comparar con alternativas de desaprendizaje de otros autores.

## Limitaciones y advertencias

- La evaluacion se limita a entrada de texto sobre el conjunto WMDP C congelado; no se evalua seguridad en imagen ni seguridad multimodal general, y el autor no reclama ninguna garantia en ese sentido.
- El resultado S (99,199443 %) se presenta sin contexto suficiente en la informacion disponible sobre que mide exactamente ni como se acota; no debe interpretarse como una garantia de robustez.
- El desaprendizaje es disperso y localizado en cuatro capas; es plausible que el conocimiento objetivo persista en otras capas o se recupere mediante reformulaciones, fine-tuning posterior o prompts multimodales, aunque esto no se cuantifica en la informacion disponible.
- Riesgo de alucinacion: no documentado especificamente para este checkpoint; se hereda el del modelo base.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar el comportamiento multilingue del base tras la edicion.
- Licencia Apache-2.0 permite uso comercial segun los terminos de la licencia, pero el autor no reclama afiliacion ni respaldo de Qwen; conviene revisar tambien la model card y la licencia del modelo base.
- No es un modelo listo para produccion: 25 descargas, 0 likes y ausencia de benchmarks generales lo sitúan como artefacto de investigacion.
- La fecha de creacion del repositorio (2026-10-31) y la de actualizacion (2026-10-31) deben verificarse antes de citarlo, dado que no coinciden con el ciclo habitual de publicaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HoshiuZ/Qwen3-VL-8B-Unlearned
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio de investigacion e implementacion: https://github.com/HoshiuZ/multimodal-llm-safety
- Resultados S en el commit congelado: https://github.com/HoshiuZ/multimodal-llm-safety/blob/dd6e4f5117aafecaa8747416f3826faaeaae9bb8/text/results/s_results_v2.json
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
