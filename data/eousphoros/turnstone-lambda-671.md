# eousphoros/turnstone-lambda-671

## Resumen

Turnstone Lambda 671 es un ajuste fino (finetune) experimental y en fase de vista previa publicado por el usuario eousphoros sobre la arquitectura Qwen3.8-27B. El modelo se distribuye con la pipeline `image-text-to-text`, lo que indica capacidades multimodales de entrada imagen y texto, y conserva la licencia Apache 2.0 del modelo base. El repositorio contiene los pesos en FP32 junto con los scripts de exportación a BF16 y FP8, y ocupa 111,1 GB.

El nombre proviene del arnés de rollout de aprendizaje por refuerzo utilizado durante el ajuste, que es un fork del proyecto Turnstone (concretamente la pull request 1604 del repositorio de turnstonelabs). Se trata, por tanto, de una publicación orientada a reproducibilidad técnica más que a un lanzamiento de producto: el autor indica explícitamente que los pesos finales preexportados y los benchmarks están pendientes de publicación.

Con 27.356.728.560 parámetros totales (unos 27,36 mil millones) según los safetensors del repositorio, el modelo se sitúa en la franja de modelos densos de gran tamaño. Su relevancia actual es limitada como modelo de producción, dado que no hay benchmarks ni idiomas declarados, pero resulta interesante como ejemplo de pipeline de ajuste con RL sobre una base multimodal y como caso de exportación multi-precisión (FP32, BF16, FP8) con verificación por SHA256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.8-27B; detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32 (pesos publicados), BF16 y FP8 (scripts de exportacion); GGUF no disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32), con exportacion a BF16 y FP8; incluye `mtp.safetensors` con la cabeza draft MTP |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se apoya en Qwen3.8-27B y que la pipeline es `image-text-to-text`, por lo que cabe inferir una base transformer con torre de vision y proyector multimodal, aunque el model card no lo confirma explicitamente. El repositorio incluye un fichero `mtp.safetensors` descrito como "MTP draft head", lo que sugiere la presencia de una cabeza de decodificacion especulativa multi-token (multi-token prediction) utilizable como borrador para acelerar la inferencia; el script de exportacion permite omitirla con `--no-mtp`.

El entrenamiento se realizo mediante un arnes de rollout de aprendizaje por refuerzo basado en un fork de Turnstone (PR 1604). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de SFT, RLHF o DPO mas alla de la mencion al arnes de RL. Tampoco se documentan innovaciones tecnicas adicionales. El flujo de publicacion previsto contempla exportacion a BF16 y FP8 con verificacion de integridad mediante `SHA256SUMS.bf16` y `SHA256SUMS.fp8`, y la posibilidad de fusionar un adaptador LoRA previo con `merge_lora.py`.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational`.
- Entrada multimodal imagen-texto, segun la pipeline `image-text-to-text`; el alcance exacto (captioning, VQA, OCR) no esta documentado.
- Razonamiento y codigo: no confirmados en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Decodificacion especulativa potencial mediante la cabeza MTP incluida en `mtp.safetensors`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Evaluacion de pipelines de RL para modelos multimodales: el repositorio sirve como referencia reproducible de un ciclo de ajuste con arnes de rollout tipo Turnstone, util para equipos de investigacion que quieran replicar el flujo con `merge_lora.py` y los scripts de exportacion.
- Exportacion y validacion de pesos en multiples precisiones: los scripts `masters_to_bf16.py` y `to_fp8.py` con verificacion SHA256 permiten construir artefactos BF16/FP8 verificables para despliegue interno, un caso practico de ingenieria de release de modelos.
- Investigacion sobre decodificacion especulativa: la cabeza MTP incluida permite experimentar con borradores multi-token para reducir latencia en inferencia autoregresiva, comparando su impacto con y sin `--no-mtp`.
- Prototipado de asistentes sobre imagen y texto: al heredar la pipeline image-text-to-text, puede emplearse en entornos controlados para tareas de descripcion de imagenes o dialogo sobre contenido visual, siempre que se validen sus capacidades reales por falta de benchmarks.
- Base para ajustes posteriores con LoRA: el flujo documentado de fusion de adaptadores (`merge_lora.py`) lo hace adecuado como punto de partida para especializaciones verticales en investigacion.
- Pruebas de integracion con endpoints compatibles: el tag `endpoints_compatible` permite desplegarlo en infraestructuras de inferencia tipo API para validar latencia y comportamiento antes de comprometerse con un modelo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los benchmarks estan "in flight" (pendientes).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 109 GB solo para pesos (27,36 mil millones de parametros x 4 bytes), mas overhead de activaciones y cache KV; inviable en GPU consumer.
- VRAM estimada en BF16: aproximadamente 55 GB para pesos, mas activaciones; requiere multiples GPU o una GPU de 80 GB con margen ajustado.
- VRAM estimada en FP8: aproximadamente 27-28 GB para pesos, lo que permitiria ejecucion en una unica GPU de 40-48 GB o en configuraciones de 2 x 24 GB con paralelismo de tensor.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16; L40S 48 GB o A6000 48 GB para FP8; configuraciones multi-GPU para FP32.
- GPU consumer: no cabe en RTX 4090 (24 GB) en BF16 ni FP32; en FP8 podria requerir offload o cuantizacion adicional a 4 bits, no documentada en el repositorio.
- Opciones de despliegue: al ser un modelo de transformers con safetensors, es compatible con vLLM, TGI y transformers nativo; llama.cpp/Ollama requeririan conversion a GGUF, no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Turnstone Lambda 671 | 27,36 mil millones | No disponible | Apache 2.0 | Preview experimental, sin benchmarks |
| Qwen3.8-27B (modelo base) | ~27 mil millones (segun denominacion) | No disponible | No disponible en esta ficha | Modelo base de referencia |
| Alternativas de ~27B densos multimodales | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas. La unica comparacion fiable es con su modelo base Qwen3.8-27B, del que hereda arquitectura y licencia, pero cuyas especificaciones completas no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo en fase de vista previa (`preview`, `experimental`): no hay benchmarks publicados, por lo que su calidad real es desconocida.
- Los pesos publicados son FP32; los pesos finales preexportados a BF16 y FP8 aun no estan disponibles, lo que obliga a ejecutar los scripts de exportacion.
- No se declaran idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas.
- No se documenta la longitud de contexto, un dato critico para planificar despliegues con conversaciones largas o documentos extensos.
- Riesgo de alucinacion no evaluado: al no existir evaluaciones publicadas, no puede estimarse su tasa de error en tareas factuales.
- Sesgos conocidos: no documentados; al derivar de Qwen3.8-27B, heredaria los sesgos de los datos de entrenamiento del modelo base y del proceso de RL, no descritos.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B antes de un uso comercial, ya que la informacion disponible no detalla su licencia.
- El repositorio ocupa 111,1 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.
- Sin descargas ni likes en el momento de la consulta: ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eousphoros/turnstone-lambda-671
- Pull request del fork de Turnstone usado como arnes de RL: https://github.com/turnstonelabs/turnstone/pull/1604
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
