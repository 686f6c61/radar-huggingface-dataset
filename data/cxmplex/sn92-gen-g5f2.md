# cxmplex/sn92-gen-g5f2

## Resumen

El modelo `cxmplex/sn92-gen-g5f2`, publicado bajo la denominación "REAX SN92 generalist entry", es un modelo de lenguaje de gran tamano (26.085.330.160 parametros segun los pesos en safetensors) alojado en Hugging Face por el usuario `cxmplex`. La model card es extremadamente escueta: se limita a indicar que se trata de un "decision model for the REAX (SN92) generalist track", sin aportar detalles sobre el proceso de entrenamiento, los datos utilizados ni las capacidades concretas. El tag `qwen3_5` sugiere que la arquitectura subyacente esta basada en la familia Qwen 3.5, aunque esta inferencia no se confirma en la documentacion disponible.

El modelo se distribuye con licencia MIT, lo que en principio permite uso comercial sin restricciones adicionales, y los pesos estan en formato safetensors con un tamano de repositorio de 52,2 GB. La fecha de creacion (2026-10-29) y el bajo numero de descargas (7) indican que se trata de una publicacion muy reciente y con practicamente ninguna traccion en la comunidad. No hay informacion sobre idiomas soportados, pipeline de inferencia ni resultados de benchmarks.

Dada la ausencia casi total de documentacion tecnica, esta ficha se limita a recoger los datos verificables del repositorio y a senalar explicitamente que la mayor parte de las especificaciones no estan disponibles. Cualquier evaluacion practica del modelo requeriria descargar los pesos y realizar pruebas directas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen3_5` sugiere base Qwen 3.5, sin confirmar) |
| Parametros totales | 26.085.330.160 (~26,1 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo mas alla del tag `qwen3_5` presente en el repositorio, que apunta a una posible derivacion o fine-tuning sobre la familia Qwen 3.5. El numero de parametros (26,1 mil millones) es compatible con un transformer denso de gran tamano, pero no se confirma si emplea mezcla de expertos, atencion lineal u otras innovaciones.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporción de codigo o multilingue), ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o instruccion tuning. La model card no incluye informacion sobre el proceso de "decision model" que menciona, por lo que se desconoce que tipo de tarea de decision o clasificacion podria estar optimizando.

## Capacidades

- No se documentan capacidades especificas en la model card.
- Por el tag `qwen3_5` y el tamano, es plausible que herede capacidades de generacion de texto, razonamiento y codigo de la familia Qwen 3.5, pero no esta confirmado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

Dada la falta de documentacion, los casos de uso son hipoteticos y requieren validacion empirica:

- Evaluacion interna de modelos base: descargar los pesos y ejecutar pruebas de generacion para caracterizar el comportamiento real antes de considerar su uso.
- Experimentacion en investigacion: servir como punto de partida para fine-tuning sobre tareas especificas, dado que la licencia MIT facilita la modificacion.
- Clasificacion o decision automatizada: si el "decision model" del titulo implica una tarea de clasificacion, podria emplearse en pipelines de decision, previa validacion.
- Generacion de texto general: si hereda capacidades de Qwen 3.5, podria usarse para redaccion y resumen, aunque sin garantias documentadas.
- Prototipado rapido en entornos con licencia permisiva: la licencia MIT permite integrarlo en productos comerciales sin obligaciones de atribucion complejas.
- Benchmarking comparativo: util como referencia para comparar con otros modelos de ~26B en pruebas propias.

En todos los casos, la ausencia de benchmarks y de documentacion hace imprescindible una evaluacion propia antes de cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52 GB solo para pesos (26,1B x 2 bytes), mas overhead de activaciones y cache KV; se recomienda al menos 64-80 GB.
- VRAM estimada en cuantizacion 8 bits: ~26 GB; en 4 bits: ~13-15 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas para precision completa: A100 80GB, H100 80GB, o multiples GPU consumer.
- Cabe en GPU consumer (RTX 4090 24GB, RTX 3090 24GB) solo con cuantizacion agresiva (4 bits) y posible offloading.
- Opciones de despliegue: no documentadas por el autor; en principio compatible con vLLM, llama.cpp u Ollama si se generan los formatos adecuados, pero no hay confirmacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion |
|---|---|---|---|---|
| cxmplex/sn92-gen-g5f2 | ~26,1B | no disponible | MIT | Minima (solo titulo) |
| Qwen 2.5 32B (referencia de tamano similar) | 32,5B | 128K (segun version) | Apache 2.0 / Qwen license | Extensa, con benchmarks |
| Gemma 2 27B | 27B | 8K | Gemma license | Extensa, con benchmarks |
| Mistral Large / Medium (referencia) | variable | variable | Comercial | Extensa |

La comparativa es orientativa: no hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con alternativas establecidas.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se conocen datos de entrenamiento, sesgos ni comportamiento esperado.
- Riesgo elevado de alucinacion y comportamiento impredecible al no haber informacion sobre alineacion o evaluacion.
- No se declaran idiomas soportados; el rendimiento multilingue es desconocido.
- No se especifica la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el origen de los datos de entrenamiento ni sobre posibles reclamaciones de terceros.
- El tag `qwen3_5` sugiere una base Qwen 3.5; conviene verificar el cumplimiento de las licencias de los modelos base si se redistribuye.
- El modelo tiene muy pocas descargas (7) y ningun "like", lo que indica ausencia de validacion por parte de la comunidad.
- No apto para produccion sin una evaluacion exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/cxmplex/sn92-gen-g5f2
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
