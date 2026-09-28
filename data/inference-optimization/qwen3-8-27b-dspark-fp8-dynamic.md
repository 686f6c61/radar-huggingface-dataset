# inference-optimization/Qwen3.8-27B-DSpark-FP8-DYNAMIC

## Resumen

Qwen3.8-27B-DSpark-FP8-DYNAMIC es un componente *drafter* de decodificación especulativa, no un modelo de chat autónomo. Lo publica el usuario `inference-optimization` y deriva de `RedHatAI/Qwen3.8-27B-speculator.dspark` (revisión `7f33c272e5da240978e0d55767abab8193d74b95`), que a su vez es un especulador DSpark asociado a `Qwen/Qwen3.8-27B` (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). Su función es proponer tokens candidatos para que el modelo objetivo los verifique en paralelo, reduciendo el coste por token generado.

El repositorio contiene un único drafter de 1.988.431.617 parámetros (unos 1,99 mil millones) exportado en FP8 dinámico, con un tamaño de repo de 2,1 GB. La cuantización es *data-free*: no se utilizó ningún dato de calibración, lo que abarata y simplifica la reproducibilidad, pero deja sin cuantificar el impacto real sobre la tasa de aceptación.

Es relevante ahora porque permite experimentar con decodificación especulativa FP8 sobre un objetivo de 27B con una huella de memoria adicional muy pequeña, y porque el autor publica la trazabilidad completa del proceso de cuantización en `provenance/quantization/`. La contrapartida es que la evaluación está pendiente: el propio autor indica que no hay resultados de aceptación, velocidad ni calidad, y que el checkpoint no ha superado la validación de servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (componente drafter DSpark de decodificación especulativa; la arquitectura interna no se especifica en la información disponible) |
| Parametros totales | 1.988.431.617 (~1,99 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8_DYNAMIC (exportación *data-free*, sin datos de calibración); formato de cuantización `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con metadatos `compressed-tensors`); incluye carpeta `provenance/quantization/` con comandos, manifiesto y digest SHA-256 |
| Libreria | `speculators` (incluye `custom_code`) |
| Modelo base | RedHatAI/Qwen3.8-27B-speculator.dspark, Qwen/Qwen3.8-27B |
| Tamano del repo | 2,1 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del drafter más allá de su naturaleza: se trata de un especulador DSpark, una técnica de decodificación especulativa que propone varios tokens por paso para que el modelo objetivo los valide. El checkpoint deriva del especulador publicado por Red Hat AI y se exporta a FP8 dinámico sin datos de calibración (*data-free*), por lo que no hay fase de ajuste sobre un corpus de calibración ni datos de entrenamiento redistribuidos: el autor indica explícitamente que los prompts de calibración no se redistribuyen.

La innovación relevante es la combinación de cuantización FP8 dinámica *data-free* con un drafter de tamaño reducido, que añade muy poca memoria al despliegue del modelo objetivo. La reproducibilidad está cubierta en `provenance/quantization/`, que contiene los comandos de entrenamiento y cuantización, el manifiesto de cuantización, los scripts y parches fuente y el digest SHA-256 de los pesos publicados. No se han facilitado datos sobre número de tokens de entrenamiento, composición del dataset, ni uso de RLHF o DPO.

## Capacidades

- Propuesta de tokens para decodificación especulativa sobre el modelo objetivo Qwen/Qwen3.8-27B, con un valor de referencia de 8 tokens especulados por paso (`--spec-tokens 8`).
- Integración con vLLM mediante los parámetros `--spec-model` y `--spec-method dspark`.
- Reducción de la latencia de decodificación del modelo objetivo, siempre que la tasa de aceptación del drafter sea suficiente (sin datos publicados al respecto).
- No es un modelo de chat autónomo: no genera respuestas por sí solo ni sustituye al modelo objetivo.
- No hay información disponible sobre soporte de *tool calling*, razonamiento multi-paso, capacidades multilingües, visión, audio o modo de pensamiento. Estas capacidades, en su caso, corresponderían al modelo objetivo Qwen/Qwen3.8-27B.

## Casos de uso

- Servicio de inferencia acelerado con vLLM: desplegar `vllm serve Qwen/Qwen3.8-27B --spec-model inference-optimization/Qwen3.8-27B-DSpark-FP8-DYNAMIC --spec-method dspark --spec-tokens 8` para reducir la latencia por token del modelo de 27B con un coste de memoria adicional de unos 2 GB.
- Asistentes conversacionales de baja latencia: en aplicaciones interactivas, la decodificación especulativa ataca directamente el tiempo hasta el primer token y la velocidad de generación, que son los dos factores que más afectan a la percepción de fluidez.
- *Batch serving* de alto volumen: en cargas con paralelismo por lotes, el drafter puede aumentar el rendimiento agregado de tokens por segundo respecto a la decodificación autorregresiva estándar, a costa de más cómputo por paso (pendiente de validar).
- Autocompletado de código en editores: la ventana de generación corta y la necesidad de baja latencia hacen que este tipo de drafter sea candidato natural para completado en línea, aunque su calidad depende del modelo objetivo y no del drafter.
- Investigación en decodificación especulativa: la publicación de trazas de cuantización y del digest de pesos permite reproducir el proceso de exportación FP8 dinámico y estudiar si el enfoque *data-free* degrada la tasa de aceptación.
- Evaluación comparativa de métodos de *speculation*: servir el mismo modelo objetivo con distintos drafters o con el especulador sin cuantizar y medir aceptación, latencia y calidad.
- Generación masiva de documentación o resúmenes: en pipelines *offline* donde el coste por token domina, un drafter con alta aceptación reduce el tiempo total de ejecución del modelo de 27B.

En todos los casos debe tenerse en cuenta que el autor declara que la evaluación está pendiente y que el checkpoint no ha completado la validación de servicio, por lo que estos escenarios son hipótesis de uso, no prestaciones verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion esta pendiente y que no se incluyen resultados de aceptacion, velocidad ni calidad. El unico dato de rendimiento objetivo disponible es el tamano del repositorio (2,1 GB) y el numero de parametros (1.988.431.617).

## Requisitos de hardware

- Peso del drafter: unos 2 GB en FP8 (1,99 mil millones de parámetros), según el tamaño del repositorio.
- Modelo objetivo: Qwen/Qwen3.8-27B requiere su propia memoria. Como estimación basada en el número de parámetros del nombre (no confirmada por la información disponible), en BF16 ocuparía del orden de 54 GB y en FP8 del orden de 27 GB, sin contar caché KV ni activaciones.
- GPU recomendadas: no disponible. No hay validación publicada en ninguna GPU concreta. Para el conjunto objetivo + drafter, un despliegue en FP8 del objetivo encajaría en configuraciones de 40-80 GB (A100 80 GB, H100 80 GB) o en varias GPU de 24 GB con paralelismo tensorial.
- GPU de consumo: el drafter por sí solo no es útil sin el objetivo. Un objetivo de 27B no cabe con holgura en una GPU de consumo de 24 GB salvo con cuantizaciones más agresivas no contempladas en esta publicación.
- Opciones de despliegue: vLLM es la única ruta documentada por el autor (`--spec-method dspark`). No hay confirmación de soporte en llama.cpp, Ollama, TGI ni otros servidores.
- Latencia y throughput: no disponible (evaluación pendiente).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.8-27B-DSpark-FP8-DYNAMIC | Drafter DSpark cuantizado | ~1,99 mil millones | safetensors FP8 (`compressed-tensors`) | apache-2.0 | Publicado; evaluacion y validacion de servicio pendientes |
| RedHatAI/Qwen3.8-27B-speculator.dspark | Drafter DSpark de origen | no disponible | no disponible | no disponible | Fuente directa de esta exportacion |
| Qwen/Qwen3.8-27B | Modelo objetivo | 27B (segun el nombre) | no disponible | no disponible | Necesario para servir el drafter |
| Drafters tipo EAGLE-3 o Medusa | Decodificacion especulativa | no disponible | no disponible | no disponible | Alternativas de la misma categoria; no hay datos comparativos en la informacion proporcionada |

No es posible establecer una comparación cuantitativa con alternativas: no hay resultados de aceptación, latencia ni calidad publicados para este checkpoint, y la información disponible no incluye especificaciones de los drafters comparables.

## Limitaciones y advertencias

- No es un modelo autónomo: es un componente drafter que debe emparejarse con Qwen/Qwen3.8-27B en las revisiones indicadas. Usarlo de forma independiente no tiene sentido funcional.
- Evaluación pendiente: el autor declara que no hay resultados de aceptación, velocidad ni calidad, y que el checkpoint no ha completado la validación de servicio. El comando de vLLM se ofrece únicamente como ejemplo.
- Cuantización *data-free*: al no usar datos de calibración, el impacto de FP8 dinámico sobre la tasa de aceptación del drafter es desconocido. Una aceptación baja puede anular la ganancia de velocidad e incluso empeorar la latencia.
- Fijación de revisiones: el autor especifica revisiones concretas (`7f33c272...` para el especulador de origen y `1d4bf0f2...` para el modelo objetivo). Servir con otras revisiones puede degradar o invalidar el comportamiento esperado.
- Sin datos de idiomas, contexto ni sesgos: no hay información disponible sobre cobertura lingüística, longitud de contexto soportada, sesgos conocidos ni riesgo de alucinación. Cualquier evaluación de calidad debería hacerse sobre el modelo objetivo, no sobre el drafter.
- Licencia: apache-2.0, que permite uso comercial, pero la licencia del modelo objetivo (Qwen/Qwen3.8-27B) y del especulador de origen debe verificarse por separado antes de un despliegue en producción.
- Advertencia de seguridad del repositorio: el tag `custom_code` implica que la carga puede requerir ejecutar código del repositorio. Conviene auditar ese código antes de usarlo en entornos de producción.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/Qwen3.8-27B-DSpark-FP8-DYNAMIC
- Drafter de origen: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Trazabilidad de la cuantizacion: carpeta `provenance/quantization/` dentro del repositorio del modelo
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
