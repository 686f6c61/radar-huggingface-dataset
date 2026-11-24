# adityag-india/gemma4-E2B-mb4-train-eval-mb2

## Resumen

`adityag-india/gemma4-E2B-mb4-train-eval-mb2` es un repositorio de Hugging Face asociado a un experimento de fine-tuning sobre Gemma 4 E2B (identificado en la model card como `unsloth/gemma-4-E2B-it`, "Gemma 4 2B"), orientado a medir la sensibilidad a la semilla y el efecto de distintas funciones de perdida sobre el dataset InsuranceQA v2. El autor es `adityag-india` y el repositorio contiene, segun la model card, el material de un estudio reproducible: scripts de preparacion de datos, entrenamiento con LoRA/QLoRA, evaluacion y analisis estadistico, no un modelo base independiente.

El objetivo del trabajo es doble: por un lado, cuantificar si cambiar la semilla altera los resultados del fine-tuning (fase A, con perdida de entropia cruzada); por otro, comparar de forma pareada una funcion de perdida alternativa (por defecto, focal loss) frente a la linea base usando las mismas semillas (fase B). El entrenamiento se plantea en una GPU de consumo de 12 GB (RTX 4080 de portatil) bajo WSL, con offload a DRAM para reducir el uso de VRAM.

El repositorio tiene un tamano de 0,9 GB y, en el momento de la consulta, cero descargas y cero likes. La model card no documenta parametros, contexto, licencia ni idiomas del modelo subyacente; toda la informacion disponible se refiere al procedimiento experimental y a los artefactos generados (adaptadores LoRA, metricas, generaciones y un informe en `analysis/REPORT.md`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base citado es Gemma 4 E2B, sin especificar arquitectura en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el procedimiento usa LoRA/QLoRA, pero no se detallan esquemas de cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene adaptadores LoRA y artefactos de entrenamiento, sin formato declarado) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base. La model card se centra en el procedimiento de fine-tuning: se parte de `unsloth/gemma-4-E2B-it` y se aplica LoRA/QLoRA sobre InsuranceQA v2, con un pipeline que incluye descarga y limpieza de datos, division por pregunta para evitar fugas, comprobacion de paridad de perdida, sonda de memoria y ejecucion resumible de las fases A y B. El entrenamiento se disena para una RTX 4080 de 12 GB bajo WSL, usando offload a DRAM y checkpointing por capas para mantener la VRAM baja.

El diseno experimental es el elemento tecnico destacable: se comparan semillas con una repeticion de la misma semilla como control de ruido de hardware, se aplica normalizacion exacta de la acumulacion de gradientes por tokens y se incluye una perdida focal con normalizacion por lote. La model card advierte de que el micro-batch elegido (2 o 4) debe mantenerse fijo en todas las ejecuciones, porque cambia la composicion de los lotes y, con focal loss, su normalizacion por lote. Tambien senala que el micro-batch 4 puede provocar OOM en los lotes mas largos (aproximadamente 2.000 filas de perdida por un vocabulario de 262.144 tokens), por lo que recomienda ejecutar antes `scripts/03_memory_probe.py`.

## Capacidades

- Fine-tuning supervisado de un modelo Gemma 4 E2B sobre un corpus de dominio especifico (InsuranceQA v2).
- Entrenamiento con LoRA/QLoRA y offload a DRAM en GPUs de consumo.
- Ejecucion reproducible y resumible de experimentos con multiples semillas.
- Comparacion pareada de funciones de perdida (entropia cruzada frente a focal loss).
- Analisis estadistico y generacion automatica de informes (`analysis/REPORT.md`).
- Pruebas unitarias en CPU con modelo de juguete: division de datos sin fugas, enmascarado de etiquetas, funciones de perdida, equivalencia de reanudacion de checkpoints y orquestacion.
- No se documentan capacidades de generacion, razonamiento, codigo, vision, tool calling ni agentes para el modelo resultante.

## Casos de uso

- Investigacion sobre reproducibilidad en fine-tuning: el pipeline permite medir cuanto varia el resultado al cambiar la semilla y establecer un control de ruido de hardware con una repeticion de la misma semilla.
- Comparacion de funciones de perdida en dominios con desbalanceo: la fase B evalua focal loss frente a entropia cruzada de forma pareada sobre las mismas semillas, util para tareas de clasificacion o generacion con clases minoritarias.
- Experimentacion en hardware limitado: el uso de QLoRA, offload a DRAM y checkpointing por capas permite ejecutar fine-tuning de un modelo de 2B en una RTX 4080 de 12 GB bajo WSL.
- Validacion de pipelines de entrenamiento: las 22 pruebas en CPU y el modo `smoke` (unos 15 minutos) permiten verificar orquestacion, reanudacion y calculo de metricas antes de lanzar ejecuciones largas.
- Docencia y formacion en metodologia experimental: el repositorio separa configuracion (`config/experiment.yaml`), codigo (`src/insqa/`) y scripts, con presets `smoke`, `pilot` y `toy` para ensayos de distinta duracion.
- Adaptacion a dominios regulados: el flujo sobre InsuranceQA v2 sirve de plantilla para fine-tuning de asistentes de seguros o atencion al cliente, siempre que se sustituya el dataset y se validen los requisitos de licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones numericas de calidad; solo describe el procedimiento para generar un informe propio en `results/analysis/REPORT.md` tras ejecutar el experimento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- Entrenamiento de referencia: RTX 4080 de portatil con 12 GB de VRAM, bajo WSL, con offload a DRAM.
- GPU recomendadas: no se especifican mas alla de la RTX 4080; el diseno busca funcionar en GPUs de consumo con 12 GB.
- Cabe en GPU de consumo: si, segun la model card, con QLoRA y offload; el micro-batch 4 puede provocar OOM en los lotes mas largos.
- Opciones de despliegue: no se documentan (vLLM, llama.cpp, Ollama o TGI no aparecen en la informacion).
- Latencia y throughput: no disponibles; la sonda `scripts/03_memory_probe.py` mide VRAM y tokens por segundo para elegir el micro-batch.
- Almacenamiento: repositorio de 0,9 GB.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de parametros, contexto, rendimiento ni licencia del modelo base, por lo que no es posible establecer una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta licencia, idiomas, parametros ni contexto del modelo base; no debe asumirse uso comercial permitido sin verificar la licencia de Gemma 4 E2B y de `unsloth/gemma-4-E2B-it`.
- El repositorio parece contener artefactos de un experimento (adaptadores LoRA, metricas, generaciones) y no un modelo listo para produccion; no se declara pipeline ni formato de pesos.
- El diseno experimental esta acotado a InsuranceQA v2 y a una unica GPU; los resultados no son necesariamente extrapolables a otros dominios o escalas.
- El micro-batch debe fijarse en todas las ejecuciones; cambiarlo altera la composicion de lotes y la normalizacion de la focal loss, invalidando la comparacion pareada.
- El micro-batch 4 puede agotar la memoria en los lotes mas largos (aproximadamente 2.000 filas de perdida con vocabulario de 262.144 tokens).
- Varias partes del pipeline no se han podido probar en el entorno del autor (carga real de Gemma 4, checkpointing con offload de Unsloth, offload de embeddings por capa, VRAM y velocidad reales); requieren verificacion en la GPU del usuario.
- No hay informacion sobre sesgos, riesgo de alucinacion ni calidad del modelo resultante; cualquier uso en produccion exige evaluacion propia.
- El repositorio registra cero descargas y cero likes, sin evidencia externa de validacion por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/adityag-india/gemma4-E2B-mb4-train-eval-mb2
- Modelo base citado: https://huggingface.co/unsloth/gemma-4-E2B-it (referencia incluida en la model card; no verificado en la busqueda)
- Dataset citado: InsuranceQA v2 (sin enlace disponible en la informacion)
- Informe generado por el pipeline: `results/analysis/REPORT.md` (ruta interna del repositorio)
- Guia de ejecucion: `RUNGUIDE.md` (incluida en un zip separado segun la model card)
