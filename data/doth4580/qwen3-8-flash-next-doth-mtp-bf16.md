# doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16

## Resumen

Qwen3.8-Flash-Next-DotH-MTP-BF16 es una cabeza de predicción multi-token (MTP, *multi-token prediction*) reentrenada para el modelo Qwen3.8-Flash-Next de Qwen. La desarrolla el usuario independiente doth4580 y se publica bajo la licencia comunitaria qwen-community-1.0. No se trata de un modelo completo, sino de un componente auxiliar: el pequeño *drafter* que la decodificación especulativa emplea para proponer los siguientes tokens, que el modelo principal verifica después. Su función es exclusivamente acelerar la decodificación; no altera el texto que sirve el modelo.

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura MoE (mezcla de expertos) que incluye 512 expertos enrutados. La cabeza MTP conserva exactamente la misma arquitectura, nombres de tensores y formas que la cabeza original de Flash-Next. Solo se reentrenaron sus capas densas, sobre las propias salidas de Flash-Next, mientras que los 512 expertos enrutados son los originales sin modificar. El repositorio BF16 ocupa 10,2 GB e incluye la cabeza completa en bf16 (5,2 GB, de los cuales 5,0 GB son los expertos enrutados), la parte reentrenada aislada (178 MB) y un *shard* de reemplazo directo para el paquete FP4-Local de NVIDIA (4,9 GB).

Su relevancia es acotada pero concreta: permite mejorar la velocidad de decodificación en despliegues con decodificación especulativa sobre Qwen3.8-Flash-Next, especialmente en hardware GB10 (DGX Spark) con el paquete FP4-Local de NVIDIA y el motor veloGB10 o vLLM. Las ganancias medidas son modestas y dependen fuertemente del tipo de petición, por lo que debe evaluarse como una optimización de rendimiento, no como una mejora de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (multi-token prediction) sobre transformer MoE; misma arquitectura que la cabeza original de Qwen3.8-Flash-Next |
| Parametros totales | no disponible (cabeza completa en bf16: 5,2 GB; parte reentrenada: 178 MB) |
| Parametros activos | no disponible (el modelo base emplea 512 expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta version); MXFP8, EXL3 3.05 bpw y EXL3 4.05 bpw en repositorios hermanos; NVFP4 en el paquete FP4-Local de NVIDIA |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La cabeza MTP replica la arquitectura de la cabeza estándar de Qwen3.8-Flash-Next: mismos nombres de tensores y mismas formas, de modo que es intercambiable sin cambios en el motor de inferencia. Internamente contiene 512 expertos enrutados (5,0 GB en bf16) que no se reentrenaron y se conservan tal cual, más un conjunto de capas densas que constituyen la parte efectivamente reentrenada (178 MB). El entrenamiento se realizó sobre las propias salidas de Flash-Next, es decir, destilando el comportamiento del modelo base para alinear las propuestas del *drafter* con lo que el modelo completo acabará aceptando.

El objetivo del reentrenamiento es aumentar la tasa de aceptación de tokens propuestos durante la decodificación especulativa, lo que se traduce en velocidad de decodificación. La decodificación especulativa es sin pérdida: el modelo completo verifica cada token propuesto, por lo que la salida greedy en GB10 con FP4-Local fue byte a byte idéntica con todas las cabezas probadas. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3.8-Flash-Next; no genera texto de forma autónoma.
- Mejora de la velocidad de decodificación en cargas de tipo agente y código, con ganancias medidas de +3,2 % frente al *drafter* habitual del paquete FP4-Local y +6,7 % frente a la cabeza original en el mismo tamano bf16.
- Compatibilidad directa con vLLM (configuración especulativa habitual) y con veloGB10 (`--model-dir`, MTP activado por defecto).
- Instalación mediante `apply_head.py` sobre el paquete `nvidia/Qwen3.8-Flash-Next-FP4-Local` (revisión `b9ce18a6`), con verificación previa del sha256 del *shard* original.
- Reutilización de los expertos enrutados del paquete (NVFP4 en FP4-Local, EXL3 en los paquetes EXL3) en las versiones MXFP8 y EXL3.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües por sí misma: todas ellas dependen del modelo base.

## Casos de uso

- Aceleración de inferencia en DGX Spark: instalación de la cabeza sobre el paquete FP4-Local y servicio con veloGB10 para reducir la latencia de decodificación en hardware GB10, donde se midió la velocidad.
- Despliegue en vLLM con decodificación especulativa: sustitución del *shard* 15 del paquete FP4-Local por la versión con los 26 tensores reentrenados, manteniendo la configuración especulativa habitual del motor.
- Cargas de trabajo de agentes y generación de código: es en estas peticiones donde se observó la mayor ganancia (+3,2 % de velocidad de decodificación), por lo que resulta adecuada para asistentes de código con múltiples pasos.
- Servicio interactivo de un solo request: útil cuando se prioriza la latencia por petición sobre el throughput agregado, dado que con 4 peticiones simultáneas el rendimiento fue un 3,1 % inferior.
- Evaluación comparativa de *drafters*: la publicación de cuatro variantes (bf16, MXFP8, EXL3 3.05 bpw y EXL3 4.05 bpw) permite medir el compromiso entre tamano y tasa de aceptación en distintos motores.
- Integración en pipelines existentes de Qwen3.8-Flash-Next: al conservar nombres y formas de tensores, puede adoptarse sin reescribir el código de carga del modelo, solo aplicando el script de instalación.

## Benchmarks y rendimiento

Resultados medidos en GB10 con el paquete FP4-Local de NVIDIA y veloGB10, según la model card:

| Comparacion | Contexto | Variacion de velocidad de decodificacion |
|---|---|---|
| Frente al drafter habitual del paquete (cabeza original en EXL3 2,6 bpw) | Peticiones de agente y codigo | +3,2 % |
| Frente al drafter habitual del paquete | Codigo simple y prompt de agente largo | Aproximadamente igual |
| Frente al drafter habitual del paquete | 4 peticiones simultaneas | -3,1 % |
| Frente a la cabeza original en el mismo tamano bf16 | Global | +6,7 % |
| EXL3 4.05 bpw frente a la cabeza del propio paquete | Benchmark corto (8 secciones, 1 peticion cada una) | +2,4 % (mas rapido en 7 de 8 secciones) |
| EXL3 3.05 bpw frente a la cabeza del propio paquete | Benchmark corto | +4,6 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo que es coherente con la naturaleza del componente: no altera las respuestas del modelo base.

## Requisitos de hardware

- VRAM estimada: la cabeza completa en bf16 ocupa 5,2 GB; la parte reentrenada aislada, 178 MB; el *shard* de reemplazo FP4-Local, 4,9 GB. El consumo total depende del modelo base Qwen3.8-Flash-Next, no de la cabeza.
- GPU recomendadas: NVIDIA GB10 (DGX Spark) es el hardware en el que se midió y validó; el paquete FP4-Local apunta a ese entorno.
- Cabe en GPU de consumo: no disponible como dato específico; el requisito dominante es el del modelo base completo.
- Opciones de despliegue: vLLM con configuración especulativa y veloGB10 con `--model-dir` (MTP activado por defecto). Para otros motores, partir de `qwen38-flash-next-doth-mtp.bf16.safetensors`, que replica nombres y formas de la cabeza original.
- Latencia y throughput: las ganancias medidas son de +3,2 % a +6,7 % en velocidad de decodificación según la comparación, con pérdida del 3,1 % en escenarios de 4 peticiones concurrentes. No se publican valores absolutos de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Tamano de la parte reentrenada | Ganancia medida | Licencia |
|---|---|---|---|---|---|
| DotH-MTP-BF16 (este) | Cabeza MTP | bf16 | 178 MB | +3,2 % vs drafter del paquete; +6,7 % vs cabeza original bf16 | qwen-community-1.0 |
| DotH-MTP-MXFP8 | Cabeza MTP | MXFP8 | 114 MB | Servida; velocidad no medida | qwen-community-1.0 |
| DotH-MTP-EXL3-4.05bpw | Cabeza MTP | EXL3 4-5 bits | 92 MB | +2,4 % vs cabeza del paquete (7 de 8 secciones) | qwen-community-1.0 |
| DotH-MTP-EXL3-3.05bpw | Cabeza MTP | EXL3 4-5 bits | 83 MB | +4,6 % vs cabeza del paquete | qwen-community-1.0 |
| Cabeza original de Qwen3.8-Flash-Next | Cabeza MTP | bf16 / EXL3 2,6 bpw en el paquete | no disponible | Referencia de comparación | qwen-community-1.0 |

No se dispone de información sobre cabezas MTP alternativas de terceros para comparar.

## Limitaciones y advertencias

- La ganancia de velocidad es pequena y dependiente de la petición: aproximadamente neutra en código simple y en prompts de agente largos, y negativa (-3,1 %) con 4 peticiones simultáneas.
- Los resultados de EXL3 proceden de un benchmark corto (8 secciones, una petición cada una), por lo que su robustez estadística es limitada.
- No modifica las respuestas del modelo: la decodificación especulativa es sin pérdida y la salida greedy fue byte a byte idéntica en las pruebas realizadas.
- El script `apply_head.py` verifica el sha256 del *shard* 15 original y rechaza revisiones distintas de `b9ce18a6`; mezclar revisiones del paquete puede producir inconsistencias.
- La instalación mediante reemplazo completo del *shard* es el único método probado en vLLM; no se validó un fichero pequeno separado junto al *shard* original, que duplicaría nombres de tensores.
- El repositorio BF16 es grande (10,2 GB) porque incluye los 512 expertos enrutados sin reentrenar y una copia completa del *shard* 15 de NVIDIA; para producción conviene valorar las variantes MXFP8 o EXL3, mucho más pequenas.
- Licencia qwen-community-1.0: deben revisarse sus términos para uso comercial, ya que se etiqueta como "other" y no como licencia permisiva estándar.
- No hay información sobre sesgos, riesgo de alucinación o cobertura idiomática específica de esta cabeza; esas propiedades corresponden al modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y procede de un autor independiente: no cuenta con validación de la comunidad ni soporte oficial de Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante MXFP8: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-MXFP8
- Variante EXL3 3.05 bpw: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-EXL3-3.05bpw
- Variante EXL3 4.05 bpw: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-EXL3-4.05bpw
- Paquete FP4-Local de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
