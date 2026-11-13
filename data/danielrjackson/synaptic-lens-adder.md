# danielrjackson/synaptic-lens-adder

## Resumen

`danielrjackson/synaptic-lens-adder` es un conjunto de artefactos de investigación publicados por Daniel Jackson bajo el paraguas del proyecto Synaptic Lens, orientado al estudio de la interpretabilidad y la localización de consultas en redes neuronales entrenadas sobre tareas aritméticas sintéticas. El repositorio no contiene un modelo de lenguaje generativo al uso, sino varios checkpoints de dos linajes distintos: dos endpoints de atención de frontera SYN53 y tres modelos SYN88 entrenados sobre su ciclo de vida completo (seeds 7, 17 y 27). Su propósito es servir como material reproducible para analizar cómo una red representa y localiza operaciones aritméticas elementales, no para desplegarse como asistente conversacional.

El componente SYN88 es especialmente relevante desde el punto de vista metodológico porque no opera únicamente sobre pesos: consume pesos canónicos, sesgos, consultas aritméticas y activaciones alineadas con la consulta. Su cargador NPZ es numérico estricto, rechaza arrays de objetos, impone carga de estado estricta y exige precisión FP32 máxima en CUDA. El componente SYN53, por su parte, continúa el checkpoint previo SYN51 del mismo autor y no incorpora pesos preentrenados externos.

La relevancia de esta publicación es acotada y hay que enmarcarla correctamente: se trata de artefactos de investigación con licencia RAIL de uso exclusivamente académico y de investigación, sin validación de holdout fresca (los históricos TEST roots ya se han usado antes) y sin bundle completo de reproducción de evaluación. No es un modelo para producción ni para uso comercial, y su valor está en la trazabilidad de hashes, la exportación solo de inferencia y la comparación de hitos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (redes de investigación para tareas aritméticas sintéticas; no se especifica transformer, MoE ni SSM) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (exportación en FP32; el cargador SYN88 exige FP32 máximo en CUDA) |
| Idiomas soportados | No disponible |
| Licencia | AI Pubs Research-use RAIL-M 0.1 y RAIL-S 0.1 (uso académico y de investigación únicamente) |
| Formato de pesos | Exportación de inferencia con hashes en `export-manifest.json`; cargador NPZ numérico para SYN88; no se detallan safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de modelo de lenguaje estándar. El repositorio contiene dos linajes: SYN53, con dos endpoints de atención de frontera (*boundary-attention*) y una actualización final en el paso 115200 que incluye 12800 actualizaciones de continuación, y SYN88, con tres modelos entrenados sobre el ciclo de vida completo a partir de las seeds 7, 17 y 27, seleccionados en los pasos 19000, 17000 y 17000 respectivamente. SYN53 continúa el checkpoint anterior SYN51 del autor y, según la model card, no incluye pesos fundacionales preentrenados externos.

El aspecto técnico más destacable es la naturaleza de la entrada de SYN88: no es un modelo solo de pesos, sino que ve pesos canónicos, sesgos, consultas aritméticas y activaciones alineadas con la consulta. Su cargador NPZ es numérico estricto, rechaza arrays de objetos, aplica carga de estado estricta y requiere la máxima precisión FP32 en CUDA. Los objetivos aritméticos sintéticos y las trayectorias de la red objetivo emparejada se publican por separado en `danielrjackson/synaptic-lens-targets-adder`. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Modelos de investigación para el estudio de representaciones internas y localización de consultas en tareas aritméticas sintéticas.
- SYN88 consume pesos canónicos, sesgos, consultas aritméticas y activaciones alineadas con la consulta, lo que permite analizar la relación entre activaciones y consulta.
- SYN53 proporciona estimaciones de probabilidad mejoradas, aunque según el autor no logra una localización de consulta fiable.
- Exportación solo de inferencia: se eliminan optimizador, RNG, sampler e historial de entrenamiento, por lo que no se puede reanudar el entrenamiento original.
- Verificación bit a bit de cada tensor frente al original con hash verificado.
- Carga estricta de estado y validación de hashes mediante `inference_export=True` en el cargador de hitos y el cargador numérico de SYN88.
- No se documentan capacidades de generación de texto, código, matemáticas generales, visión, audio, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en interpretabilidad mecánica: usar SYN88 para correlacionar activaciones con consultas aritméticas concretas y estudiar dónde se localiza la información relevante en la red.
- Reproducción de hitos de entrenamiento: comparar los checkpoints SYN88 de las seeds 7, 17 y 27 en sus pasos de selección (19000, 17000 y 17000) para analizar variabilidad entre semillas.
- Auditoría de metodología de localización: emplear SYN53 para contrastar la mejora en estimaciones de probabilidad frente a la falta de localización fiable de consulta documentada por el autor.
- Verificación de integridad de artefactos: utilizar `export-manifest.json` y los hashes de exportación para validar que los tensores descargados coinciden bit a bit con los originales.
- Estudio de redes objetivo emparejadas: combinar estos checkpoints con `danielrjackson/synaptic-lens-targets-adder` para analizar trayectorias de la red objetivo bajo particiones de datos registradas.
- Docencia e investigación académica sobre entrenamiento sintético: usar los objetivos aritméticos sintéticos y las particiones documentadas como banco de pruebas controlado.
- Revisión de licencias y procedencia: analizar el modelo de gobernanza RAIL aplicado a artefactos de investigación sin pesos preentrenados externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (no se especifican parámetros totales ni tamaño de los checkpoints).
- GPU recomendadas: no disponible; el cargador SYN88 exige CUDA con precisión FP32 máxima.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el acceso es mediante los cargadores del repositorio `synaptic-lens` (cargador de hitos con `inference_export=True` y cargador NPZ numérico para SYN88).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (artefactos de investigación para localización de consultas en tareas aritméticas sintéticas).

## Limitaciones y advertencias

- Los históricos TEST roots ya se han utilizado previamente; no se trata de una validación de holdout fresca.
- No es un bundle completo de reproducción de evaluación; el alcance exacto está en `syn88/verification.json` con hashes de origen y exportación.
- SYN53 mejora las estimaciones de probabilidad pero no logra una localización de consulta fiable, según el propio autor.
- Los checkpoints son artefactos de investigación, no sistemas de decisión validados para entornos críticos de seguridad.
- La licencia RAIL-M/RAIL-S 0.1 restringe el uso a fines académicos y de investigación; no es un permiso no comercial general y limita usos comerciales y dañinos.
- Los materiales y datos de terceros subyacentes conservan sus propias condiciones; la revisión de procedencia no constituye garantía legal.
- Las exportaciones son solo de inferencia y no permiten reanudar el entrenamiento original.
- Los hashes de los hitos históricos identifican los checkpoints originales, no son sumas de verificación de descarga de estas exportaciones; hay que citar la revisión descargada y el hash de exportación.
- No se documentan sesgos, riesgo de alucinación ni cobertura idiomática por tratarse de artefactos de investigación no generativos.

## Enlaces

- Hugging Face: https://huggingface.co/danielrjackson/synaptic-lens-adder
- Repositorio de código: https://github.com/danielrjackson/synaptic-lens
- Baseline de código revisado (commit 544d54c): https://github.com/danielrjackson/synaptic-lens/tree/544d54c22ca053e537c84f894fe207de8d178145
- Licencia del modelo: https://github.com/danielrjackson/synaptic-lens/blob/544d54c22ca053e537c84f894fe207de8d178145/LICENSE-MODEL.md
- Fábrica de modelos objetivo: https://github.com/danielrjackson/synaptic-lens-target-model-factory
- Trayectorias de red objetivo emparejadas: https://huggingface.co/danielrjackson/synaptic-lens-targets-adder
