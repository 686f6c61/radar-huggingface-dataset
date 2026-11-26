# munaikh/Inkling-2-Mini-Uncensored-AtomicChat-MLX

## Resumen

Inkling-2-Mini-Uncensored-AtomicChat-MLX es una exportación standalone en formato MLX del modelo multimodal Inkling-2-Mini de Thinking Machines Lab, tras aplicar el adaptador de desbloqueo ("uncensored") publicado por AtomicChat. Lo distribuye el usuario munaikh y está pensado específicamente para ejecutarse en Apple Silicon mediante la librería `mlx` y `mlx_vlm`. El modelo procesa entradas de imagen y texto (pipeline `image-text-to-text`) y emplea una arquitectura de mezcla de expertos (MoE) con un cabezal de decodificación especulativa denominado DSpark.

El problema que aborda es doble: por un lado, ofrecer una ruta de inferencia nativa en MLX para un modelo MoE de aproximadamente 26.400 millones de parámetros totales que, de otro modo, solo estaría disponible en GGUF o en pesos originales; por otro, eliminar los rechazos del modelo base mediante la fusión del adaptador de AtomicChat. Según la model card, la exportación conserva la fidelidad del GGUF de referencia: 77,60 % en MMLU frente al 76,40 % del Q4_K de AtomicChat, con coincidencia en 1.866 de 2.000 respuestas MMLU y en las 450 etiquetas de rechazo de XSTest.

Es relevante ahora porque demuestra un flujo de conversión reproducible (merge en FP32, verificación de hashes, scripts de benchmark) para llevar un MoE multimodal a MLX manteniendo precisión mixta y un sidecar de decodificación especulativa, algo poco habitual en el ecosistema Apple Silicon. El repositorio ocupa 31,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal (visión + texto), con cabezal de decodificación especulativa DSpark |
| Parametros totales | 26.388.641.280 (~26,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos mixtos: BF16 (embedding, 24 matrices de salida de atención, 24 stacks de down-projection de expertos), NVFP4 en capas 0-19 (gate/up de expertos sin tocar), MXFP8 en capas 20-23; exportación etiquetada como 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con política de uso aceptable del modelo base de Thinking Machines Lab) |
| Formato de pesos | safetensors (MLX), 7 shards; runtime `mlx` / `mlx_vlm` |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos multimodal. La exportación MLX conserva los nombres nativos de tensores de MLX y distribuye los pesos en siete shards safetensors. Tras la fusión del adaptador en FP32, el embedding, las 24 matrices de salida de atención y los 24 stacks de down-projection de expertos se almacenan en BF16; los pesos gate/up de expertos no modificados mantienen NVFP4 en las capas 0-19 y MXFP8 en las capas 20-23. Incluye la torre de visión y el sidecar DSpark, un cabezal de decodificación especulativa que se ejecuta con el mismo runtime fijado y que puede separarse en una carpeta hermana mediante `mlx_vlm.split_mtp`.

El proceso de conversión aplicó los 49 pares de adaptadores sobre pesos decodificados en FP32, con comprobaciones matriciales que cubren las 3.072 matrices de expertos y comparaciones muestreadas contra la referencia Q4_K de AtomicChat para verificar orientación del embedding y orden de expertos. Sobre 28.311.552 coeficientes de expertos, el cambio codificado por el adaptador presenta una ganancia proyectada de 0,9999 a lo largo de la actualización FP32 prevista y un error RMS del 9,8 % respecto a esa actualización. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con torre de visión incluida.
- Decodificación especulativa mediante el cabezal DSpark, con profundidad de borrador configurable (la model card cita profundidad 3).
- Comportamiento "uncensored": según la model card, 0 rechazos en las 200 indicaciones inseguras de XSTest, frente a 184 del pack MTPLX original sin editar.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" o esfuerzo de razonamiento: la model card menciona un prefijo de chat con "effort-zero", pero no detalla su funcionamiento.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está empaquetado para `mlx_vlm` y se sirve con `python -m mlx_vlm.server`, lo que permite desplegarlo en un Mac con chip M-series sin GPU dedicada. La model card reporta 33,3 tok/s en un M4 Max sin drafting.
- Aceleración mediante decodificación especulativa: con el sidecar DSpark activado (`--draft-kind dflash --draft-block-size 4`), la variante 4-bit MTPLX alcanza 70,0 tok/s en M4 Max, lo que lo hace viable para asistentes interactivos de baja latencia.
- Análisis de imágenes en local: al ser `image-text-to-text`, puede emplearse para describir, clasificar o extraer información de imágenes en flujos de trabajo privados que no pueden enviar datos a la nube.
- Investigación sobre alineación y rechazos: la disponibilidad de métricas XSTest (0/200 rechazos inseguros) y de scripts de benchmark reproducibles lo convierte en una pieza útil para estudiar el efecto de adaptadores de desbloqueo sobre la fidelidad del modelo.
- Prototipado de aplicaciones conversacionales sin censura: para desarrolladores que necesitan un modelo que no rechace indicaciones por defecto en tareas creativas o de ficción, con la advertencia de la política de uso aceptable del modelo base.
- Evaluación comparativa de motores de inferencia: el repositorio incluye scripts y resultados de MMLU y XSTest que permiten comparar MLX frente a GGUF/Atomic Engine en igualdad de condiciones.

## Benchmarks y rendimiento

| Configuración | MMLU correctas | MMLU accuracy | Rechazos seguros | Rechazos inseguros |
|---|---:|---:|---:|---:|
| AtomicChat Q4_K, solo target | 1.528 / 2.000 | 76,40 % | 0 / 250 | 0 / 200 |
| Standalone MLX, solo target | 1.552 / 2.000 | 77,60 % | 0 / 250 | 0 / 200 |
| MTPLX original sin editar, solo target | — | — | 10 / 250 | 184 / 200 |

MMLU se evalúa con 2.000 ítems zero-shot fijos de las 57 materias, muestreo proporcional por materia con semilla 20261125. XSTest usa las 250 indicaciones seguras y 200 inseguras con el clasificador oficial de prefijos de rechazo. El rendimiento de decodificación reportado es de 33,3 tok/s en un Apple M4 Max sin drafting, y 70,0 tok/s para la variante 4-bit MTPLX con DSpark a profundidad 3, frente a 43,2 tok/s de Atomic Engine (1,62× de mejora). No se han publicado resultados de GSM8K, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 31,3 GB, por lo que se necesita al menos esa cantidad de memoria unificada más overhead del runtime; en la práctica, un Mac con 48 GB o más es el mínimo razonable para cargar los shards completos.
- GPU recomendadas: Apple Silicon de gama alta (M4 Max y superiores); la model card cita explícitamente un M4 Max.
- Compatibilidad con GPU consumer NVIDIA: no está soportada de forma nativa, ya que el formato es MLX y el runtime es `mlx_vlm`; requeriría conversión a otro formato.
- Opciones de despliegue: `mlx_vlm.server` con el runtime fijado en `requirements.txt` (Python 3.13 en Apple Silicon); el sidecar DSpark se sirve con `--draft-model` y `--draft-kind dflash`.
- Latencia y throughput: 33,3 tok/s sin drafting y 70,0 tok/s con DSpark en la variante 4-bit MTPLX sobre M4 Max, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-AtomicChat-MLX | ~26,4 mil millones (MoE) | no disponible | 77,60 % | Apache 2.0 | MLX, safetensors |
| AtomicChat/Inkling-2-Mini-Uncensored-GGUF | no disponible | no disponible | 76,40 % | Apache 2.0 | GGUF |
| munaikh/Inkling-2-Mini-Uncensored-AtomicChat-MTPLX-4bit | no disponible | no disponible | no disponible | Apache 2.0 | MLX 4-bit |
| thinkingmachines/Inkling-2-Mini (base sin editar) | no disponible | no disponible | no disponible | Apache 2.0 | checkpoint oficial |

## Limitaciones y advertencias

- El adaptador "uncensored" elimina los rechazos: la model card reporta 0 rechazos en 200 indicaciones inseguras de XSTest, lo que implica un riesgo elevado de generar contenido dañino si no se aplican filtros externos.
- La política de uso aceptable de Thinking Machines Lab cubre también las releases modificadas y restringe el uso de los pesos para eludir salvaguardas en usos prohibidos; el uso comercial debe revisarse contra esa política además de la licencia Apache 2.0.
- El clasificador de rechazo de XSTest es léxico (prefijos de cadena) y puede no detectar otras formulaciones de rechazo, por lo que las cifras de 0/200 deben interpretarse con cautela.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe.
- Longitud de contexto: no disponible, lo que dificulta planificar casos de uso con documentos largos.
- La revisión original del pack (`6e7c8248...`) devolvió HTTP 404 en Hugging Face durante la build; se usó el snapshot `c9d02830...`, verificado por SHA-256, pero conviene reproducir la procedencia antes de confiar en los pesos.
- El repositorio no registra descargas ni likes, y la autoría es de un usuario individual sobre un modelo base de terceros; no hay garantía de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/munaikh/Inkling-2-Mini-Uncensored-AtomicChat-MLX
- Variante 4-bit MTPLX: https://huggingface.co/munaikh/Inkling-2-Mini-Uncensored-AtomicChat-MTPLX-4bit
- Modelo base oficial: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/c9d028302cd0f035fdf8e7e91f089a4ce94d2195
- Adaptador de AtomicChat: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF/tree/82b34b9b0e5bc2e3e7b6d617ec8cc3e0f9692ee2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Metodología de conversión: CONVERSION.md (en el repositorio)
- Procedencia y hashes: provenance.json (en el repositorio)
- Scripts de benchmark: benchmarks/README.md (en el repositorio)
