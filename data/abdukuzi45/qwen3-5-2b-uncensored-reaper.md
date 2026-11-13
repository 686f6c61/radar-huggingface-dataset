# abdukuzi45/Qwen3.5-2B-Uncensored-reaper

## Resumen

Qwen3.5-2B-Uncensored-reaper es un ajuste fino derivado de Qwen/Qwen3.5-2B, publicado por el usuario abdukuzi45 en Hugging Face. Se trata de una variante "abliterated" y "uncensored": el autor ha aplicado una tecnica de proyeccion de rangos sobre los pesos del modelo base para eliminar total o parcialmente los comportamientos de rechazo (refusals) aprendidos durante el alineamiento. El modelo conserva la arquitectura del original, con 2.213.241.664 parametros totales segun los tensores en safetensors, y un tamano de repositorio de 4,4 GB.

La model card es extremadamente escueta y se limita a declarar el resultado de la intervencion: "0/8 refusals" y una perplejidad de 155877,25 veces la del modelo base, lo que constituye una senal de degradacion severa de la calidad del lenguaje. El autor indica que el encoder de vision y el modulo MTP (multi-token prediction) permanecen sin cambios, y que los tipos de dato se han restaurado por tensor. La etiqueta "multimodal" sugiere que el modelo base incorpora capacidad de vision, aunque no se aporta documentacion adicional al respecto.

El interes de esta ficha es fundamentalmente evaluativo: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados, sin idiomas declarados y con una perplejidad que hace inviable su uso en produccion. Resulta util como caso de estudio de los riesgos tecnicos de las tecnicas de abliteration agresivas aplicadas a modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles no disponibles) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor menciona restauracion de dtypes por tensor) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de aproximadamente 2,2 mil millones de parametros. La model card menciona explicitamente la presencia de un encoder de vision y de un modulo MTP (multi-token prediction), lo que indica que el modelo base es multimodal y emplea decodificacion especulativa o prediccion multi-token como optimizacion de inferencia. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo original.

La intervencion aplicada es una abliteration de "rank-1, partial projection" (trial 42), una tecnica que identifica la direccion en el espacio de activaciones asociada al comportamiento de rechazo y proyecta los pesos fuera de esa direccion. El autor declara que el encoder de vision y el MTP no se han modificado y que los tipos de dato se han restaurado por tensor tras la intervencion. No se documenta ningun entrenamiento adicional, dataset de ajuste ni proceso de evaluacion mas alla de las ocho pruebas de rechazo y la medicion de perplejidad.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.5-2B.
- Supresion del comportamiento de rechazo: el autor reporta 0/8 refusals con el system prompt "Answer directly. No disclaimers.".
- Capacidad multimodal (vision) potencialmente conservada, segun la afirmacion del autor de que el encoder de vision no se ha modificado; no verificable con la informacion disponible.
- Prediccion multi-token (MTP) preservada segun el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modo thinking explicito: no disponible.

## Casos de uso

- Investigacion sobre tecnicas de abliteration: el modelo sirve como referencia empirica de como una proyeccion rank-1 parcial afecta a la perplejidad y al comportamiento de rechazo en un modelo de 2B, permitiendo comparar variantes de la tecnica.
- Auditoria de seguridad de modelos: util para estudiar que tipos de contenido se desbloquean tras eliminar los rechazos y como se degrada la coherencia, en un entorno controlado de laboratorio.
- Analisis de degradacion por perplejidad: la cifra reportada (×155877,25) permite estudiar la relacion entre la agresividad de la intervencion y la perdida de calidad linguistica.
- Pruebas de robustez de filtros: evaluar si los clasificadores de contenido de un pipeline detectan respuestas degradadas o no alineadas generadas por el modelo.
- Docencia sobre alineamiento y seguridad: ejemplo didactico de los compromisos entre supresion de rechazos y calidad del modelo.
- Experimentos de bajo coste en hardware consumer: con 2,2B parametros y pesos safetensors de 4,4 GB, puede ejecutarse en GPUs de gama media para pruebas de concepto, siempre asumiendo la baja calidad del output.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion aportado por el autor es:

| Metrica | Resultado |
|---|---|
| Refusals (8 pruebas) | 0/8 |
| Perplejidad relativa al base | ×155877,25 |

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 4,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 6-8 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2,5-3 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 1,5-2 GB de pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; A100 o H100 no justificadas por tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 8 GB o mas en fp16 y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers con safetensors; llama.cpp, Ollama o vLLM requeririan conversion a GGUF o formatos compatibles, no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3.5-2B-Uncensored-reaper | 2,21B | no disponible | apache-2.0 | Publicado, sin descargas |
| Qwen/Qwen3.5-2B (base) | ~2,2B | no disponible | no disponible en la informacion | Modelo de referencia |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | variable | No disponible |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Perplejidad extremadamente alta (×155877,25 respecto al base): indica una degradacion severa de la fluidez y coherencia del texto generado, lo que invalida su uso en produccion.
- La eliminacion de rechazos implica que el modelo puede generar contenido danino, ilegal o inseguro sin advertencias; requiere filtros externos obligatorios.
- Riesgo elevado de alucinacion y de respuestas incoherentes derivado de la intervencion sobre los pesos.
- Sin datos de sesgos, idiomas ni evaluaciones de seguridad publicadas.
- La licencia apache-2.0 permite uso comercial, pero el estado tecnico del modelo hace desaconsejable cualquier despliegue real.
- El modelo base Qwen3.5-2B no esta documentado en la informacion proporcionada; no se puede verificar la conservacion real de las capacidades multimodales o de tool calling.
- Cero descargas y cero likes: ausencia de validacion por parte de la comunidad.
- La model card no incluye instrucciones de uso, limitaciones ni guia de prompt mas alla del system prompt sugerido.

## Enlaces

- Hugging Face: https://huggingface.co/abdukuzi45/Qwen3.5-2B-Uncensored-reaper
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
