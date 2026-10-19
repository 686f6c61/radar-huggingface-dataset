# shrg7/october17-oer10-joint-urma4-fullft-18k

## Resumen

`shrg7/october17-oer10-joint-urma4-fullft-18k` es un checkpoint de política robótica VLA (vision-language-action) publicado por el usuario shrg7 en Hugging Face. Se trata de un fine-tune completo de openpi pi0.5 en JAX, con la configuración `october17_oer10_joint_urma4_fullft` y 18.000 actualizaciones del optimizador (checkpoint 17.999) de una ejecución prevista hasta 40.000. El modelo resuelve manipulación pick-and-place en robots OER-10 y está orientado a investigación en control cross-embodiment: una misma política recibe un token URMA4 que describe el robot y su estado articular.

La arquitectura parte de pi0.5, con prefijo PaliGemma y un experto de acciones entrenado mediante flow matching. La innovación principal es URMA4: la descripción compilada del robot (articulaciones, eslabones y pinza) y su estado articular actual pasan por un codificador pequeño que produce un token adicional en el prefijo, colocado después del prompt. El checkpoint incluye 722 descripciones de robots y estadísticas de normalización agrupadas.

El repositorio pesa 12,4 GB e incluye `params/` en formato Orbax y assets JSON/NPZ; no se documentan el número de parámetros, la longitud de contexto, la licencia ni resultados de benchmarks. Es relevante porque explora una receta abierta para reutilizar una política entre robots sin entrenar un modelo por embodiment, aunque es un checkpoint intermedio y no una versión final validada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en openpi pi0.5 (JAX): prefijo PaliGemma + experto de acciones flow-matching; acondicionamiento URMA4 de embodiment |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible; el horizonte de acción es 32, no la ventana de contexto |
| Tipos de cuantización | no disponible; no se documentan conversiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no disponible; es un modelo de robótica, no un LLM conversacional |
| Licencia | no disponible |
| Formato de pesos | Orbax (`params/`); assets JSON/NPZ; no safetensors ni GGUF |
| Pipeline | robotics |
| Configuración | `october17_oer10_joint_urma4_fullft` (branch `pi05-oer10-oer9recipe`, commit `cb00b0b3`) |
| Checkpoint | 17.999, equivalente a 18.000 actualizaciones del optimizador; la ejecución llega a 40.000 |
| Modelo base | pi05_base, con fine-tune completo; el codificador URMA4 se inicializa desde cero |
| Datos de entrenamiento | 722 robots y 6,25 M de frames de seis conjuntos OER-10 de pick-and-place |
| Horizonte de acción | 32 |
| Entrenamiento | 4xH200, FSDP 4, batch 256, calentamiento de 1.000 pasos, LR constante 5e-5, AdamW con clip 1, EMA 0.99 |
| Tamaño del repositorio | 12,4 GB |
| Fecha de creación | 2026-10-18 |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de pi0.5, una política VLA que combina un prefijo PaliGemma con un experto de acciones entrenado por flow matching. La receta congela la pérdida de la cabeza de lenguaje y entrena solo el experto de acciones, con horizonte 32. Las acciones se normalizan por grupo de grados de libertad del brazo mediante una gaussiana, la pérdida se calcula únicamente sobre las articulaciones reales y la pinza, y el diseño de articulaciones es left-packed, con la pinza inmediatamente después de la última articulación del brazo.

La aportación específica es el token URMA4: la descripción compilada de cada robot —articulaciones, eslabones y pinza— junto con su estado articular actual se codifica en un token adicional del prefijo, situado después del prompt. El entrenamiento usa seis conjuntos OER-10 de la release quality-85: Gen3 real rig con 2 piezas, LAP Kinova, LAP Franka, sus dos re-renderizados con texturas aleatorizadas y kde150 massfix con 4 piezas. No se incluyen DROID, MolmoBot ni realrig9k. Los frames se muestrean de forma uniforme, con 722 robots y 6,25 M de frames en total. El checkpoint publicado usa los pesos EMA y no incluye el estado del optimizador.

## Capacidades

- Control robótico de manipulación pick-and-place mediante acciones conjuntas y de pinza, con horizonte de acción 32.
- Acondicionamiento cross-embodiment mediante un único token URMA4 por robot, a partir de su descripción compilada y su estado articular.
- Reutilización de una misma política entre 722 robots del catálogo OER-10, siempre que se disponga de sus assets de normalización y descripciones de embodiment.
- Ejecución de tareas con distinto número de piezas, como los conjuntos Gen3 de 2 piezas y kde150 massfix de 4 piezas.
- Integración con el ecosistema openpi y JAX mediante pesos Orbax, estadísticas de normalización y el bundle de descripciones de embodiment.
- El uso de un prefijo PaliGemma implica procesamiento visual, pero la model card no detalla cámaras, resolución ni preprocesado.
- No se documentan tool calling, function calling, uso como agente autónomo, modo thinking, audio ni capacidades multilingües.
- No es un modelo de generación de texto general: la pérdida de lenguaje no se entrena en esta receta.

## Casos de uso

- **Evaluación de la receta cross-embodiment:** cargar el checkpoint en openpi y ejecutarlo sobre los seis conjuntos OER-10 con sus `norm_stats.json` y descripciones URMA4. Es adecuado porque reproduce exactamente el acondicionamiento por robot usado durante el entrenamiento.
- **Baseline para ejecuciones más largas:** utilizar el checkpoint de 18.000 actualizaciones como referencia intermedia frente a los checkpoints de 40.000 de la misma configuración. Permite estudiar la evolución del rendimiento con más pasos de optimización sin cambiar la receta.
- **Estudio del token URMA4:** comparar el token de embodiment con alternativas como políticas específicas por robot o sin descripción de robot. El bundle incluido, con 722 robots indexados por el índice de candidato del catálogo, facilita este tipo de ablación.
- **Pick-and-place en Gen3 real rig:** desplegar la política en el montaje real de Gen3 con las 2 piezas del conjunto de entrenamiento. Es un caso directamente alineado con los datos y permite medir la transferencia del checkpoint a un rig real.
- **Adaptación a LAP Kinova y LAP Franka:** usar los assets correspondientes y el token URMA4 para que una misma política controle brazos distintos. El modelo está entrenado con ambas morfologías y con sus re-renderizados texturizados.
- **Evaluación de robustez visual:** probar el checkpoint en los dos re-renderizados con texturas aleatorizadas incluidos en el entrenamiento. Sirve para analizar la sensibilidad a cambios de apariencia sin cambiar la tarea de manipulación.
- **Manipulación de múltiples piezas con kde150 massfix:** evaluar el comportamiento con 4 piezas y variaciones de masa. Es un escenario más complejo que los conjuntos de 2 piezas y está representado en los datos de entrenamiento.
- **Investigación en normalización por grados de libertad:** reutilizar la normalización gaussiana por grupo arm-DoF y el layout left-packed para estudiar su efecto en el control de pinza y articulaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| Tasa de éxito en los conjuntos OER-10 | no disponible |
| Comparación con pi0.5 base | no disponible |
| MMLU, HumanEval, GSM8K | no aplica: es un modelo VLA de robótica, no un LLM de texto |
| Latencia o throughput de inferencia | no disponible |

## Requisitos de hardware

- **VRAM de inferencia:** no disponible. El repositorio pesa 12,4 GB y contiene los pesos y assets; cargarlos requiere al menos ese orden de magnitud, más el overhead de JAX y las activaciones. No se especifica la precisión de los pesos ni el desglose exacto.
- **GPU de entrenamiento:** 4xH200 con FSDP 4, batch 256 y calentamiento de 1.000 pasos. Es el único hardware documentado.
- **GPU recomendada para inferencia:** no hay una recomendación oficial. Por el entrenamiento, H200 es el hardware de referencia, pero no se documentan A100, H100 ni otras configuraciones de inferencia.
- **GPU consumer:** no se documenta que el modelo quepa en una RTX 4090, RTX 3090 u otras GPU consumer. El tamaño del checkpoint y el runtime JAX no permiten afirmarlo sin una prueba específica.
- **Despliegue:** openpi con JAX y pesos Orbax. Se requieren `params/`, `assets/<asset_id>/norm_stats.json` y `assets/<asset_id>/embodiment_descriptions/`.
- **Runtimes no documentados:** no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. No es un LLM de texto, por lo que esas vías no son las esperadas.
- **Latencia y throughput:** no disponible. El horizonte de acción 32 y el batch de entrenamiento 256 no equivalen a latencia de inferencia.

## Comparativa con modelos similares

No se dispone de una comparativa cuantitativa verificable con alternativas en la información proporcionada. La única referencia explícita es pi0.5 base, usado como inicialización, pero sin especificaciones publicadas en esta ficha.

| Referencia | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | no disponible | no disponible | sin benchmarks publicados | no disponible | 12,4 GB en Hugging Face |
| pi0.5 base (inicialización) | no disponible | no disponible | no disponible | no disponible | referenciado en la model card |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia incierta:** la licencia no está disponible, por lo que no se puede verificar el uso comercial ni las condiciones de redistribución.
- **Checkpoint intermedio:** corresponde a 18.000 de 40.000 actualizaciones. No es la versión final de la ejecución y no hay benchmarks que confirmen su calidad relativa.
- **Sin estado del optimizador:** el repositorio no incluye el estado del optimizador, por lo que no se puede reanudar el entrenamiento exactamente desde este punto.
- **Datos limitados:** se entrena solo con seis conjuntos OER-10 de pick-and-place, con 722 robots y 6,25 M de frames. No incluye DROID, MolmoBot ni realrig9k, lo que limita la generalización fuera de ese catálogo.
- **Dependencia estricta de assets:** el modelo necesita las estadísticas de normalización y la descripción URMA4 correctas. Una descripción de robot intercambiada o un `asset_id` incorrecto puede invalidar el control.
- **Sesgos no analizados:** no se documenta un análisis de sesgos. Al entrenar con un conjunto acotado de objetos, texturas, cámaras y morfologías, el modelo hereda las limitaciones de esos datos.
- **Riesgo de acciones incorrectas:** en robótica no aplica la alucinación textual, pero el riesgo equivalente es generar trayectorias o acciones plausibles pero incorrectas, especialmente fuera de la distribución de entrenamiento.
- **Idioma y contexto:** no se documentan idiomas ni una ventana de contexto de lenguaje; el horizonte de acción 32 no debe confundirse con longitud de contexto.
- **Formato de acciones:** la normalización por grupo arm-DoF y el layout left-packed con la pinza tras la última articulación deben replicarse exactamente en la integración.
- **Uso en producción:** no se recomienda sin una evaluación propia de tasa de éxito, latencia, seguridad y licencia.

## Enlaces

- [Hugging Face: shrg7/october17-oer10-joint-urma4-fullft-18k](https://huggingface.co/shrg7/october17-oer10-joint-urma4-fullft-18k)
- No se han encontrado otros enlaces relevantes en la búsqueda web proporcionada.
