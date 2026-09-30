# Qualzz20/afv_fiber_9um

## Resumen

`Qualzz20/afv_fiber_9um` es un modelo de segmentación semántica 3D construido con nnU-Net y publicado en HuggingFace por el usuario Qualzz20 (Zechosen). Se trata de un ajuste fino (*fine-tuning*) del modelo `scrollprize/fiber_hz_vt`, desarrollado en el contexto del Vesuvius Challenge, la iniciativa que busca leer los papiros carbonizados de Herculano a partir de tomografías de rayos X sin abrirlos físicamente.

El modelo resuelve un problema muy concreto dentro de ese flujo de trabajo: identificar y clasificar las fibras del papiro (verticales, horizontales y sus intersecciones) en volúmenes de tomografía. Conocer la orientación de las fibras es un paso previo imprescindible para aplanar (*unwrap*) virtualmente el rollo de papiro y poder reconstruir su superficie para la lectura posterior del texto.

La aportación específica de este repositorio es el ajuste sobre escaneos nativos a resolución de aproximadamente 9 µm (8,64 µm y 9,362 µm), frente a la resolución para la que fue entrenado el modelo base. Mantiene la misma arquitectura, las mismas cuatro clases de salida y el mismo diseño de archivos, de modo que las herramientas que cargan `fiber_hz_vt` pueden cargar este repositorio sin cambios. El repositorio ocupa 0,6 GB, no registra descargas ni valoraciones, y se distribuye bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net (red U-Net 3D de segmentación semántica, arquitectura heredada de `scrollprize/fiber_hz_vt`) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de segmentación de volúmenes, no generativo) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | no aplicable (la entrada son volúmenes de tomografía, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible; el autor indica que mantiene "misma arquitectura, clases y diseño de archivos" que `scrollprize/fiber_hz_vt` |
| Modelo base | `scrollprize/fiber_hz_vt` (fine-tuning) |
| Clases de salida | 0 = fondo, 1 = fibra vertical, 2 = fibra horizontal, 3 = intersección |
| Resolución de entrenamiento | 8,64 µm y 9,362 µm (escaneos nativos de rollo completo) |
| Resolución de evaluación | solo ~9 µm nativos |
| Test-time augmentation | *Mirroring* activado por defecto (aprox. 8× más lento); desactivable con `--disable_tta` |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-30 (según HuggingFace) |

## Arquitectura y entrenamiento

El modelo sigue el esquema de nnU-Net, un *pipeline* de segmentación que configura automáticamente la topología de la red, el preprocesado y las estrategias de entrenamiento a partir de las propiedades del dataset. La arquitectura subyacente es una U-Net 3D con conexiones residuales entre codificador y decodificador, adecuada para segmentación voxel a voxel de volúmenes de imagen médica o, en este caso, de tomografía de papiros. El autor no publica el recuento de parámetros, el número de tokens de entrenamiento (concepto no aplicable) ni detalles de la función de pérdida o del número de épocas.

El ajuste fino se realizó sobre escaneos nativos de rollo completo a dos resoluciones: 9,362 µm (papiros PHerc0125, PHerc0191, PHerc0211, PHerc0257 y PHerc0358) y 8,64 µm (PHerc0175A, PHerc0268, PHerc0306B, PHerc0800 y PHerc1447). El papiro PHerc0813 se reservó exclusivamente para validación y PHerc0343 no se utilizó en ningún momento. Un punto crítico para interpretar los resultados es que las etiquetas de entrenamiento son *pseudo-etiquetas* automáticas, no verificadas por anotadores humanos, y que las regiones de intersección se ignoraron durante el entrenamiento. La *test-time augmentation* por espejo está activada por defecto y, según el autor, mejora visiblemente las predicciones a costa de multiplicar por aproximadamente 8 el tiempo de inferencia; para priorizar la velocidad puede desactivarse con `--disable_tta` en `nnUNetv2_predict` o en `vesuvius.predict`.

## Capacidades

- Segmentación semántica 3D de volúmenes de tomografía de papiros de Herculano, voxel a voxel, en cuatro clases: fondo, fibra vertical, fibra horizontal e intersección.
- Detección de la orientación de las fibras del papiro, información necesaria para el aplanado virtual del rollo.
- Compatibilidad directa con el ecosistema de `scrollprize/fiber_hz_vt`: mismos *checkpoints* de nnU-Net, mismas clases y mismo diseño de archivos.
- Inferencia con *test-time augmentation* por espejo configurable (activada por defecto, desactivable para acelerar).
- Ejecución mediante las herramientas del ecosistema nnU-Net (`nnUNetv2_predict`) y mediante `vesuvius.predict`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, *tool calling*, capacidades de agente, soporte multilingüe ni ninguna capacidad multimodal fuera del dominio de imagen volumétrica para el que fue entrenado.

## Casos de uso

- Segmentación de fibras en escaneos nativos de ~9 µm: es el caso de uso principal y el único evaluado por el autor. Se aplica directamente sobre volúmenes de tomografía de rollo completo para obtener una máscara con las cuatro clases de fibras.
- Preprocesado para el *unwrapping* de papiros: la máscara de fibras verticales y horizontales alimenta los algoritmos de aplanado que reconstruyen la superficie del rollo; sin una detección fiable de fibras, la reconstrucción geométrica es inviable.
- Sustitución directa del modelo base `fiber_hz_vt` en *pipelines* existentes: al mantener el mismo diseño de archivos y las mismas clases, un equipo que ya use `fiber_hz_vt` puede apuntar sus scripts a este repositorio sin reescribir código, siempre que trabaje con escaneos de ~9 µm.
- Procesamiento por lotes a escala de rollo completo: dado que la inferencia con TTA es unas 8× más lenta, en campañas de segmentación masiva puede ejecutarse con `--disable_tta` para reducir el coste computacional, aceptando la pérdida de calidad descrita por el autor.
- Detección de intersecciones de fibras: el modelo emite una clase específica para intersecciones (clase 3). Conviene tratarla con cautela porque esas regiones se ignoraron en el entrenamiento, pero la salida puede usarse como señal preliminar para inspección manual.
- Investigación en el Vesuvius Challenge: como componente reproducible de experimentos de segmentación a resolución intermedia, permite comparar el efecto del ajuste fino frente al modelo base sobre un mismo conjunto de escaneos.
- Control de calidad y validación cruzada entre escaneos de distinta resolución: al haberse entrenado con dos resoluciones nativas (8,64 µm y 9,362 µm), puede emplearse para comprobar la coherencia de las máscaras generadas por otros modelos sobre los mismos rollos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* indica únicamente que el modelo se evaluó sobre escaneos nativos de ~9 µm y que PHerc0813 se reservó para validación, pero no incluye métricas cuantitativas (Dice, IoU, precisión por clase, etc.) ni comparaciones numéricas con el modelo base. El autor sí afirma cualitativamente que la *test-time augmentation* por espejo produce predicciones "visiblemente mejores" con un coste aproximado de 8× en tiempo de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican requisitos de memoria ni el tamaño de *patch* empleado.
- GPU recomendadas: no disponible. Al ser un modelo nnU-Net 3D, en la práctica se beneficia de GPUs con memoria suficiente para el volumen de inferencia por teselas; el autor no especifica modelos concretos.
- Viabilidad en GPU de consumo: no disponible. Depende del tamaño de *patch* y de la estrategia de teselado configurada, que no se documenta.
- Opciones de despliegue: `nnUNetv2_predict` (desactivando TTA con `--disable_tta` si se necesita velocidad) y `vesuvius.predict`, tal y como indica la *model card*. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible. El único dato cuantitativo aportado es la penalización relativa de la TTA (aproximadamente 8× más lenta con *mirroring* activado que desactivado).
- Tamano en disco: el repositorio ocupa 0,6 GB, por lo que el almacenamiento no supone una restricción relevante.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolucion objetivo | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Qualzz20/afv_fiber_9um` | nnU-Net (fine-tuning) | ~9 µm (8,64 y 9,362 µm) | 4 (fondo, fibra vertical, fibra horizontal, intersección) | Apache-2.0 | HuggingFace, 0 descargas |
| `scrollprize/fiber_hz_vt` | nnU-Net | resolución original del modelo base, no especificada | 4 (mismas clases) | no disponible | HuggingFace (modelo base) |
| Otros modelos de segmentación de fibras para Vesuvius | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas adicionales de la misma categoría (segmentación de fibras en tomografía de papiros) en la información proporcionada, ni de métricas que permitan comparar rendimiento entre el modelo base y este ajuste fino.

## Limitaciones y advertencias

- Etiquetas de baja garantía: el entrenamiento usa *pseudo-etiquetas* automáticas, no verificadas por personas, lo que introduce ruido en el objetivo de aprendizaje y limita el techo de calidad alcanzable.
- Clase de intersección poco fiable: las regiones de intersección se ignoraron durante el entrenamiento, por lo que las predicciones de la clase 3 deben tratarse con especial cautela.
- Dominio de evaluación muy restringido: el autor indica explícitamente que el modelo solo se ha evaluado en escaneos nativos de ~9 µm. No hay evidencia de comportamiento correcto en otras resoluciones o modalidades.
- Generalización no verificada: los datos de entrenamiento proceden de un conjunto concreto de papiros de la colección de Herculano. No se documenta su comportamiento en rollos de otras colecciones ni en papiros no vistos; PHerc0343 no se utilizó nunca y PHerc0813 se reservó solo para validación.
- Coste de inferencia elevado por defecto: la *test-time augmentation* por espejo multiplica por ~8 el tiempo de cómputo, lo que puede ser prohibitivo en procesamiento a gran escala si no se desactiva.
- Ausencia de métricas publicadas: no hay cifras de Dice, IoU ni precisión por clase, lo que impide estimar objetivamente la calidad frente al modelo base.
- Sin validación por la comunidad: el repositorio acumula 0 descargas y 0 valoraciones, por lo que no existe retroalimentación externa sobre su comportamiento real.
- Licencia: Apache-2.0 permite uso comercial y modificación, con obligación de conservar los avisos de licencia y de atribución correspondientes. Conviene verificar, no obstante, las condiciones del modelo base y de los datos de origen del Vesuvius Challenge.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta *tool calling* ni agentes, y no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Qualzz20/afv_fiber_9um
- Modelo base: https://huggingface.co/scrollprize/fiber_hz_vt
- Perfil del autor en HuggingFace: https://huggingface.co/Qualzz20
- Repositorio GitHub del Edge AI Model Zoo (Texas Instruments): https://github.com/TexasInstruments/edgeai-modelzoo (resultado de búsqueda no relacionado con este modelo)
- GGUF Model Discovery: https://local-ai-zone.github.io/ (resultado de búsqueda no relacionado con este modelo)
- Hugging Face Viewer: https://hfviewer.com/ (resultado de búsqueda no relacionado con este modelo)
- OpenModelDB: https://openmodeldb.info/ (resultado de búsqueda no relacionado con este modelo)
