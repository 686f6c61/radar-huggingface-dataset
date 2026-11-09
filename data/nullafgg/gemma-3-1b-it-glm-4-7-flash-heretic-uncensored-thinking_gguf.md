# NullAFGG/Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking_GGUF

## Resumen

Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking es una variante derivada del modelo instructivo google/gemma-3-1b-it, publicada por el usuario NullAFGG en Hugging Face. Se distribuye únicamente en formato GGUF, con un total de 999.885.952 parámetros (aproximadamente 1.000 millones) y un repositorio de 7,2 GB que agrupa varias cuantizaciones. El modelo se presenta como una versión "uncensored" orientada a reducir los patrones de rechazo del ajuste instructivo original y a favorecer respuestas directas, con un comportamiento de razonamiento breve que el autor denomina "thinking" y "flash".

La propuesta encaja en la categoría de modelos ligeros para inferencia local: hereda la arquitectura, la ventana de contexto y la licencia Gemma del modelo base, y no introduce capas adicionales de alineación según la model card. Su interés práctico reside en el tamaño reducido, que permite ejecución en CPU y en GPU de consumo, y en la posibilidad de desplegarlo en entornos controlados donde se prefiera minimizar las negativas del modelo.

Conviene subrayar que la información publicada es escasa: no hay resultados de benchmarks, no se detalla el proceso de ajuste ni los datos empleados, y la model card atribuye el mantenimiento a DavidAU mientras que el repositorio aparece bajo la cuenta NullAFGG. Todo ello condiciona la evaluación técnica del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Gemma 3), segun modelo base |
| Parametros totales | 999.885.952 (aproximadamente 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; hereda la ventana del modelo base google/gemma-3-1b-it |
| Tipos de cuantizacion | GGUF (varias cuantizaciones dentro del repo de 7,2 GB); la model card menciona ademas GPTQ y AWQ como opciones de despliegue, sin confirmar su presencia en el repositorio |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma License (heredada de google/gemma-3-1b-it) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-1b-it, un transformer causal decoder-only de la familia Gemma 3 con aproximadamente 1.000 millones de parametros. La model card no describe modificaciones estructurales sobre esa base: se trata de un derivado ajustado, no de una arquitectura nueva. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o fine-tuning supervisado. Tampoco se detalla el metodo concreto por el cual se redujo el sesgo de rechazo ("heretic"), mas alla de la afirmacion de que no se anaden capas de seguridad adicionales a las del modelo base.

La unica innovacion declarada es de comportamiento, no de arquitectura: un estilo de generacion "flash" (concisa y rapida) combinado con salidas de razonamiento corto cuando el prompt lo solicita. El modelo conserva la plantilla de instrucciones nativa de Gemma, y el autor recomienda no mezclar formatos de chat de otras familias. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles con formato instructivo compatible con Gemma.
- Razonamiento de forma corta: la model card indica "structured reasoning patterns when prompted" y salidas de tipo chain-of-thought breve.
- Respuestas directas con menor tasa de rechazo que el modelo IT original.
- Seguimiento de instrucciones y compatibilidad con system prompts explicitos.
- Uso en pipelines de agentes ligeros y prompts con herramientas, segun la model card ("tool-augmented agents", "tool-driven prompts"); no se documenta un formato de function calling nativo.
- Generacion de baja latencia por el tamano compacto del modelo.
- Capacidades multilingues: solo ingles declarado.
- No se documentan capacidades de vision, audio ni modo thinking con tokens separados.

## Casos de uso

- Asistente conversacional local: el modelo puede sostener dialogos multi-turno en ingles sobre GPU de 8 GB o CPU con cuantizacion, lo que lo hace adecuado para prototipos de asistente en escritorio.
- Experimentacion con prompt engineering: su tamano permite iterar rapidamente sobre plantillas y system prompts sin coste de infraestructura elevado.
- Agentes ligeros con herramientas: la model card lo orienta a "tool-augmented agents"; se usaria como planificador de pasos cortos dentro de un pipeline orquestado por un framework externo.
- Generacion de texto en entornos de borde: adecuado para dispositivos con recursos limitados donde no cabe un modelo de mayor tamano.
- Filtrado y clasificacion de texto rapida: tareas de etiquetado, resumen corto o reescritura en lotes pequenos con latencia baja.
- Investigacion sobre alineacion y rechazo: util para estudiar como varia el comportamiento de un modelo IT cuando se reduce el sesgo de negativa, en entornos controlados y con supervision.
- Educacion y demostraciones: ejecucion en portatiles para clases o talleres sobre inferencia local con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por tamano (aproximadamente 1B parametros), las cuantizaciones GGUF de 4 bits suelen ocupar del orden de 0,6-0,8 GB de pesos, y las de 8 bits alrededor de 1-1,2 GB, a lo que hay que sumar la cache KV segun contexto.
- GPU recomendadas: la model card indica ejecucion eficiente en GPU de 8 GB; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: si, cabe en GPU de consumo de 8 GB o menos con cuantizacion.
- CPU: la model card confirma idoneidad para inferencia en CPU con cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama y otros motores compatibles con GGUF y arquitectura Gemma; la model card menciona compatibilidad con "common inference engines supporting Gemma architecture".
- Latencia y throughput: no disponibles; solo se afirma que esta optimizado para inferencia rapida y baja latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking | ~1B | heredado del base (no detallado) | Gemma License | GGUF | Derivado "uncensored" con razonamiento breve; sin benchmarks publicados |
| google/gemma-3-1b-it | ~1B | el del modelo base oficial | Gemma License | safetensors y derivados | Modelo instructivo original de Google, con alineacion estandar |
| DavidAU/Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking | ~1B | no disponible | Gemma License | no disponible | Repositorio del mismo derivado atribuido en la model card a DavidAU |
| mradermacher/Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking-GGUF | ~1B | no disponible | Gemma License | GGUF | Cuantizaciones GGUF del mismo derivado publicadas por otro usuario |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Modelo "uncensored": reduce deliberadamente las negativas del ajuste instructivo, lo que aumenta el riesgo de generar contenido inapropiado, danino o ilegal; requiere controles en el system prompt y supervision en produccion.
- Riesgo de alucinacion elevado por el tamano reducido (aproximadamente 1B parametros) y por la ausencia de datos de evaluacion publicados.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- La ventana de contexto no se especifica en la ficha; debe consultarse la del modelo base google/gemma-3-1b-it.
- Licencia Gemma: es una licencia personalizada de Google con terminos de uso, restricciones y obligaciones propias; debe revisarse antes de cualquier uso comercial. El repositorio no modifica ni sustituye esos terminos.
- Procedencia y trazabilidad poco claras: la model card atribuye el mantenimiento a DavidAU, mientras que el repositorio pertenece a NullAFGG, y existen copias GGUF de terceros (mradermacher). No se documenta el proceso de ajuste ni los datos usados.
- Sin benchmarks ni evaluaciones de seguridad publicadas; no se recomienda su uso en produccion sin una evaluacion propia.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NullAFGG/Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking_GGUF
- Repositorio del derivado atribuido a DavidAU: https://huggingface.co/DavidAU/Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking
- Cuantizaciones GGUF de mradermacher: https://huggingface.co/mradermacher/Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
