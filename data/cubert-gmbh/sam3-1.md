# cubert-gmbh/sam3.1

## Resumen

SAM 3.1 (Object Multiplex) es un modelo de segmentación de imágenes y vídeo desarrollado por Meta, distribuido originalmente en el repositorio `facebook/sam3.1`. Este repositorio concreto, `cubert-gmbh/sam3.1`, no es un modelo nuevo ni un ajuste fino: es un espejo byte a byte del checkpoint oficial, publicado por Cubert GmbH para su uso en los plugins de Cuvis.AI. El objetivo es permitir un aprovisionamiento reproducible y verificado por sha256 de los pesos en un runtime offline sin necesidad de cuenta ni token de Hugging Face, dado que el repositorio upstream está restringido (gated).

El modelo resuelve el problema de la segmentación de objetos guiada por prompts (texto, puntos, cajas o máscaras) con capacidad de seguimiento temporal en vídeo, lo que lo sitúa en la estela de la familia Segment Anything. La variante "Object Multiplex" hace referencia a la capacidad de manejar múltiples objetos de forma simultánea dentro de una misma secuencia.

La relevancia de este repositorio es fundamentalmente operativa: facilita el despliegue en pipelines de visión por computador e hiperespectral (Cuvis.AI) sin fricción de autenticación, manteniendo la licencia SAM y la integridad de los ficheros originales. No aporta mejoras de rendimiento ni cambios de arquitectura respecto al modelo de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de segmentación de la familia SAM; detalles no incluidos en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye un checkpoint `.pt` de 3,50 GB) |
| Idiomas soportados | no disponible (modelo multimodal de visión; los prompts de texto dependen del componente de texto, no detallado) |
| Licencia | SAM License (Last Updated: 19 de noviembre de 2025), licencia "other" con nombre `sam-license` |
| Formato de pesos | PyTorch (`sam3.1_multiplex.pt`), más `config.json` y `LICENSE` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el volumen de datos de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO u otras) en la información proporcionada. El nombre del checkpoint, `sam3.1_multiplex`, y la etiqueta `sam3_video` indican que el modelo está orientado a segmentación con seguimiento temporal en vídeo y manejo simultáneo de múltiples objetos, pero no se detallan los mecanismos concretos (tipo de encoder, decoder de máscaras, módulo de memoria temporal, etc.).

Este repositorio es un espejo exacto del release upstream en la revisión `daa63191845a41281374e725f4c9e51c7a824460`, sin conversión, re-serialización ni ajuste fino. La integridad se garantiza mediante sumas sha256 publicadas en la model card y verificables con `tools/mirror_weights.py check` de `cuvis-ai-core`.

## Capacidades

- Segmentación de objetos guiada por prompts (el tipo concreto de prompts soportados no se detalla en la información disponible).
- Segmentación y seguimiento en vídeo, según la etiqueta `sam3_video` y la denominación "Object Multiplex".
- Manejo de múltiples objetos de forma simultánea (implícito en "Multiplex").
- Integración con pipelines de Cuvis.AI mediante los nodos `cuvis-ai-sam3` y la resolución de pesos vía `ModelWeights.resolve("<name>")`.
- Aprovisionamiento offline y verificado por hash mediante `download-model download sam3.1`.
- No se dispone de información sobre tool calling, capacidades de agente, multilingüismo, modo thinking, audio u otras modalidades.

## Casos de uso

- Segmentación en pipelines hiperespectrales: integración con Cuvis.AI para generar máscaras de objetos sobre imágenes capturadas con sensores hiperespectrales, aprovechando el aprovisionamiento offline y verificado del checkpoint.
- Seguimiento de objetos en vídeo: uso de la variante "Object Multiplex" para mantener la identidad de múltiples objetos a lo largo de una secuencia, útil en analítica de vídeo y vigilancia.
- Anotación asistida de datasets: generación automática de máscaras para acelerar el etiquetado de imágenes y vídeo en proyectos de visión por computador.
- Segmentación en entornos air-gapped: despliegue en infraestructuras sin acceso a Hugging Face ni tokens, gracias a que el espejo es accesible sin gating y verificable por sha256.
- Reproducibilidad de experimentos: fijación por commit y hash del checkpoint upstream para garantizar que los resultados de investigación se puedan replicar exactamente.
- Procesamiento por lotes en producción: ejecución de segmentación sobre grandes volúmenes de imágenes dentro de pipelines de Cuvis.AI una vez provisionados los pesos en la caché compartida.
- Investigación en segmentación: uso como base para estudios comparativos, dado que los ficheros son idénticos al release oficial de Meta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el checkpoint pesa 3,50 GB, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos en precisión original, más el overhead de activaciones y del runtime.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint (3,50 GB) sugiere que podría caber en GPUs con 8 GB o más de VRAM, pero no se dispone de datos oficiales.
- Opciones de despliegue: runtime de Cuvis.AI (`cuvis-ai-core` ≥ 0.16.0 con los nodos `cuvis-ai-sam3`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Desarrollador | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SAM 3.1 (este espejo) | Meta (espejo de Cubert GmbH) | Segmentación imagen/vídeo | SAM License | Espejo sin gating; upstream con gating | Checkpoint de 3,50 GB, verificado por sha256 |
| `facebook/sam3.1` (upstream) | Meta | Segmentación imagen/vídeo | SAM License | Gated en Hugging Face | Mismo contenido exacto que este espejo |
| Otros modelos de la familia SAM | Meta | Segmentación | SAM License | Variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre benchmarks ni de comparativas cuantitativas con modelos alternativos.

## Limitaciones y advertencias

- Licencia restrictiva: la SAM License prohíbe usos sujetos a ITAR y fines relacionados con militaria, guerra, industria nuclear, espionaje o desarrollo de armas; el uso debe cumplir controles de comercio y leyes de privacidad y protección de datos.
- Obligación de atribución: las publicaciones de investigación realizadas con los materiales SAM deben reconocer su uso.
- Prohibición de ingeniería inversa sobre los materiales SAM.
- Terminación de licencia: si se alega en litigio que los materiales o sus salidas infringen derechos de propiedad intelectual, la licencia termina el día de la presentación de la demanda, con obligación de cesar el uso y eliminar los materiales.
- Indemnización: el usuario indemniza a Meta frente a reclamaciones de terceros derivadas de su uso o distribución.
- Sin garantías: los materiales se proporcionan "tal cual".
- Licencia mutable: Meta puede modificar el acuerdo, por lo que conviene revisar el texto upstream vigente.
- Este repositorio es un espejo no oficial de Cubert GmbH, que no está afiliada ni respaldada por Meta; cualquier soporte o actualización depende del upstream.
- No se dispone de información sobre sesgos, riesgo de alucinación (en el sentido de máscaras incorrectas), limitaciones idiomáticas ni caveats específicos de producción más allá de los licenciatarios.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que refleja su carácter reciente y de nicho.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/cubert-gmbh/sam3.1
- Repositorio upstream: https://huggingface.co/facebook/sam3.1
- Proyecto Cuvis.AI: https://github.com/cubert-hyperspectral/cuvis-ai
