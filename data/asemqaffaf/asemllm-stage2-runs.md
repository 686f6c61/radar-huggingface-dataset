# asemqaffaf/AsemLLM-stage2-runs

## Resumen

AsemLLM Stage-2 run artifacts es un repositorio de artefactos de investigación publicado en Hugging Face por el usuario asemqaffaf. No se trata de un modelo entrenado listo para inferencia, sino de un conjunto de materiales brutos generados durante la fase 2 de los experimentos de un proyecto llamado AsemLLM: checkpoints de entrenamiento, registros (logs), salidas de sondas (probes) y resultados de evaluación de trece experimentos denominados Exp1-Exp13.

El contenido incluye además los datos de preentrenamiento tokenizados y los conjuntos de entrenamiento de preguntas y respuestas (QA), junto con directorios de trabajo del agente y del supervisor del proyecto. La model card remite al repositorio de GitHub https://github.com/asemqaffaf/AsemLLms (rama `exp2-u-scale`, ruta `docs/results/stage2/`) para el código, los protocolos congelados y un manifiesto SHA-256 de cada archivo.

La relevancia de este repositorio es de tipo metodológico y de reproducibilidad: permite a otros investigadores inspeccionar los artefactos intermedios de una campaña de experimentos, verificar hashes y regenerar checkpoints eliminados. No debe confundirse con una release de pesos utilizable; la información disponible no describe arquitectura, tamaño ni contexto del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints de entrenamiento (`.ckpt`) bajo `data/runs/`; no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura del modelo AsemLLM. El repositorio se describe como artefactos brutos de la fase 2 de experimentos (Exp1-Exp13), con checkpoints, logs, probes y salidas de evaluación. Se menciona un checkpoint de referencia denominado R7, ubicado en `data/runs/retrieval/r7-L123-aug-opts-rev-rsn/last.ckpt`, con SHA-256 que comienza por `33a5c245...`.

El nombre del checkpoint de referencia (`retrieval`, `aug-opts-rev-rsn`) sugiere componentes de recuperación (retrieval), aumento de datos (aug), optimizaciones (opts), revisión (rev) y razonamiento (rsn), pero la información disponible no confirma el significado ni la arquitectura subyacente. No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- No se describen capacidades de inferencia del modelo en la información disponible.
- El repositorio contiene datos de preentrenamiento tokenizados y conjuntos de entrenamiento de QA bajo `data/`.
- Incluye salidas de evaluación y probes de los experimentos Exp1-Exp13.
- Incluye código y salidas de un agente (`agent-scratch/`) y de un supervisor (`supervisor-scratch/`).
- No se documentan tool calling, razonamiento multi-paso, capacidades multilingües ni modos especiales (thinking, visión, audio).

## Casos de uso

- Reproducibilidad de experimentos: un investigador puede descargar los checkpoints y logs para replicar los resultados de la fase 2 y verificar el manifiesto SHA-256 contra el repositorio de GitHub.
- Auditoría de artefactos: los hashes y protocolos congelados permiten comprobar la integridad de cada archivo y detectar manipulaciones.
- Estudio de metodología de entrenamiento: los logs y probes de Exp1-Exp13 permiten analizar la evolución del entrenamiento y las decisiones de diseño.
- Reutilización de datos tokenizados: los conjuntos de preentrenamiento y QA bajo `data/` pueden emplearse para experimentos propios, sujeto a la licencia (no disponible).
- Investigación sobre agentes: los directorios `agent-scratch/` y `supervisor-scratch/` documentan el comportamiento de un agente y su supervisor durante la campaña.
- Regeneración de checkpoints: los checkpoints eliminados el 2026-11-15 se describen como regenerables y aprobados por el propietario, lo que permite reconstruirlos a partir del código del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No disponible: la información no especifica tamaño del modelo ni requisitos de VRAM.
- No disponible: no se indican GPU recomendadas.
- No disponible: no se confirma si cabe en GPU de consumo.
- No disponible: no se detallan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI).
- No disponible: no se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría ni ofrece datos de rendimiento que permitan una comparación.

## Limitaciones y advertencias

- El repositorio no es un modelo listo para producción: son artefactos de investigación sin pipeline, licencia ni idiomas declarados.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial de los datos, checkpoints o código.
- No se especifican sesgos conocidos ni tasas de alucinación, al no documentarse capacidades de inferencia.
- Los checkpoints eliminados el 2026-11-15 están ausentes; su recuperación depende de la regeneración desde el código del repositorio.
- Los conjuntos de test y dev de QA no están incluidos aquí (están en el repositorio de GitHub bajo `lisp/eval/qa/`, con hash bloqueado), lo que limita la evaluación directa desde este repositorio.
- El conjunto de confirmación reservado (held-out) no está incluido.
- La fecha de creación (2026-11-16) y la ausencia de descargas y likes indican que el repositorio es reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/asemqaffaf/AsemLLM-stage2-runs
- GitHub del proyecto: https://github.com/asemqaffaf/AsemLLms (rama `exp2-u-scale`, ruta `docs/results/stage2/`)
- Checkpoint de referencia R7: `data/runs/retrieval/r7-L123-aug-opts-rev-rsn/last.ckpt` (SHA-256 `33a5c245...`)
