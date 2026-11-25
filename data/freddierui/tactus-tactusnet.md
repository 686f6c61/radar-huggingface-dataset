# Freddierui/TACTUS-TactusNet

## Resumen

TACTUS (Tool, Action, Contact and Trajectory Understanding in Surgery) es un conjunto de checkpoints de PyTorch para comprensión de vídeo quirúrgico, publicado por el autor Freddierui bajo el identificador Freddierui/TACTUS-TactusNet. No se trata de un modelo de lenguaje, sino de una red de visión por computador especializada en el análisis de procedimientos quirúrgicos: detección de keypoints de instrumentos, localización temporal de interacciones, clasificación de pares herramienta-acción y estimación de regiones de contacto. El repositorio, de 15,9 GB, agrupa el modelo de referencia TactusNet, sus cabezas reentrenadas sobre otros codificadores congelados y las líneas base del benchmark asociado.

La arquitectura se apoya en un codificador V-JEPA 2.1 ViT-L congelado que procesa 16 fotogramas a resolución de 384 × 384 píxeles; sobre él se entrenan cabezas específicas para cada tarea. El modelo no incluye el codificador en sus pesos: es necesario descargarlo por separado desde la release oficial de V-JEPA 2. Los checkpoints se distribuyen como ficheros `.pt` con el estado del entrenador incluido, lo que explica el tamaño de los ficheros espaciales (unos 1,3 GB cada uno).

La relevancia del proyecto reside en su carácter de benchmark reproducible: incluye recetas de entrenamiento, líneas base oficiales (TSN, TSM, VideoMAE, X-CLIP, Endo-FM, ActionFormer, TriDet, QD-DETR, MS-TCN, HRNet-W32, ViTPose-B, DSTA, SegFormer-B2) y datos de entrenamiento procedentes de Cholec80, HeiChole, CRCD, SurgVU y una colección de YouTube. Está orientado exclusivamente a investigación y no constituye un dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas sobre codificador V-JEPA 2.1 ViT-L congelado (16 fotogramas a 384 × 384) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de 16 fotogramas por muestra) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de vídeo, sin capacidades linguisticas) |
| Licencia | Mixta: cabezas TactusNet y backbones bajo MIT; líneas base heredan licencias de terceros (algunas sin uso comercial) |
| Formato de pesos | PyTorch `.pt` (checkpoints con estado del entrenador); codificador V-JEPA 2 en `.pt` separado |

## Arquitectura y entrenamiento

TactusNet es un modelo de comprensión de vídeo compuesto por un codificador visual congelado y varias cabezas entrenables. El codificador es V-JEPA 2.1 ViT-L, que procesa clips de 16 fotogramas a 384 × 384 píxeles; los pesos del codificador no se incluyen en el repositorio y deben obtenerse del release oficial de V-JEPA 2 (`vjepa2_1_vitl_dist_vitG_384.pt`). Sobre sus representaciones se entrenan cinco cabezas: semántica (clasificación del par herramienta-acción entre seis pares válidos), temporal (localización de la ventana de interacción dentro de la ventana de acción), espacial en dos etapas (tres puntos de referencia de instrumentos, primero en el fotograma completo y luego en el recorte ampliado), decodificador de contacto (cuatro esquinas de la región de contacto, entrenado con objetivos derivados de las puntas de los instrumentos) y refinador de píxeles (puntos de referencia a resolución nativa).

El entrenamiento se realizó sobre los splits Gold y Gold+Silver del dataset TACTUS, compuesto por vídeos de Cholec80, HeiChole, CRCD, SurgVU y una colección de YouTube. Se ofrecen dos variantes: `tactusnet_gold/` (solo split Gold, la reportada como TactusNet) y `tactusnet_gold_silver/` (Gold más Silver). Además, el repositorio incluye versiones de las cabezas semántica, temporal y espacial (etapa 1) reentrenadas con las mismas recetas sobre otros codificadores congelados: V-JEPA 2 ViT-L a 16 × 256², VideoMAE ViT-L autosupervisado en Kinetics-400 a 16 × 224² y Endo-FM ViT-B a 16 × 224². Las recetas de entrenamiento están publicadas en el repositorio de código, lo que permite reproducir cada etapa.

## Capacidades

- Clasificación semántica de pares herramienta-acción en vídeo quirúrgico, restringida a seis pares válidos.
- Localización temporal de la ventana de interacción dentro de una ventana de acción dada.
- Detección de tres puntos de referencia (landmarks) de instrumentos quirúrgicos en el fotograma completo y en recortes ampliados.
- Refinamiento de puntos de referencia a resolución nativa de píxel.
- Estimación de regiones de contacto mediante un decodificador que predice cuatro esquinas.
- Evaluación comparativa frente a líneas base de clasificación, localización temporal, keypoints y segmentación.
- No dispone de generación de texto, tool calling, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual y discriminativo.
- No soporta agentes ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Análisis retrospectivo de cirugías: el modelo permite etiquetar automáticamente fases, herramientas y acciones en grabaciones de quirófano, lo que facilita la revisión de procedimientos y la auditoría de protocolos sobre grandes volúmenes de vídeo.
- Investigación en reconocimiento de acciones quirúrgicas: sirve como referencia reproducible para comparar nuevas arquitecturas frente a las líneas base incluidas (TSN, TSM, VideoMAE, X-CLIP, Endo-FM, ActionFormer, TriDet, QD-DETR, MS-TCN).
- Seguimiento de instrumentos: la detección de tres landmarks y el refinamiento a resolución nativa permiten rastrear la posición de las puntas de instrumentos en el campo quirúrgico, útil para estudiar trayectorias y ergonomía.
- Estimación de regiones de contacto: el decodificador de contacto predice las cuatro esquinas de la zona donde el instrumento interactúa con el tejido, lo que puede emplearse en estudios de interacción tejido-instrumento.
- Localización temporal de interacciones: dado un intervalo de acción, el modelo estrecha la ventana exacta de interacción, lo que resulta útil para indexar vídeos quirúrgicos y generar resúmenes navegables.
- Benchmark y ablación de codificadores: las cabezas reentrenadas sobre V-JEPA 2 a 256², VideoMAE y Endo-FM permiten estudiar el impacto del codificador visual en tareas quirúrgicas con recetas idénticas.
- Docencia y formación quirúrgica: la anotación automática de herramientas y acciones puede alimentar materiales de revisión para residentes, siempre en contexto de investigación y sin uso clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 15,9 GB; los checkpoints espaciales pesan aproximadamente 1,3 GB cada uno por incluir el estado del entrenador.
- Es necesario descargar por separado el codificador V-JEPA 2.1 ViT-L (`vjepa2_1_vitl_dist_vitG_384.pt`), cuyo peso no está incluido en el repositorio.
- VRAM estimada para inferencia: no disponible en la información proporcionada; dependerá del codificador ViT-L y de los 16 fotogramas a 384 × 384.
- GPU recomendadas: no disponible; por el tamaño del codificador ViT-L se requiere una GPU con memoria suficiente para procesar clips de 16 × 384², aunque no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga directa con `torch.load(path, map_location="cpu", weights_only=False)` y ejecución del pipeline de evaluación del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Codificador | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TactusNet (este modelo) | Cabezas sobre V-JEPA 2.1 ViT-L | V-JEPA 2.1 ViT-L, 16 × 384² | Semántica, temporal, espacial, contacto | MIT (cabezas) | Hugging Face y GitHub |
| VideoMAE (línea base incluida) | Clasificación de vídeo | VideoMAE ViT-L, 16 × 224² | Which, What | Heredada de terceros | Incluida en el repositorio |
| Endo-FM (línea base incluida) | Clasificación de vídeo | Endo-FM ViT-B, 16 × 224² | Which, What | Heredada de terceros | Incluida en el repositorio |
| ActionFormer / TriDet / QD-DETR (líneas base) | Localización temporal | No especificado | When | Heredada de terceros | Incluidas en el repositorio |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no es un dispositivo médico y no debe emplearse en decisiones clínicas.
- Sesgos conocidos: no documentados en la información disponible; el entrenamiento con vídeos de Cholec80, HeiChole, CRCD, SurgVU y YouTube puede introducir sesgos de dominio, procedimiento e instrumental.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las predicciones de keypoints, contacto y ventanas temporales pueden ser incorrectas sin garantía de calibración.
- Limitaciones de contexto: la entrada se restringe a clips de 16 fotogramas a 384 × 384; no se documenta manejo de secuencias más largas.
- Idiomas: no aplica; el modelo no procesa texto.
- Restricciones de licencia: las cabezas TactusNet y los backbones son MIT, pero las líneas base heredan licencias de pesos de terceros, algunas sin permitir uso comercial; es obligatorio revisar `THIRD_PARTY.md` antes de cualquier uso más allá de investigación.
- El codificador V-JEPA 2.1 no se incluye y debe descargarse por separado, con sus propios términos de uso.
- Los checkpoints incluyen estado del entrenador, lo que incrementa el tamaño y requiere `weights_only=False` al cargarlos.

## Enlaces

- [Hugging Face: Freddierui/TACTUS-TactusNet](https://huggingface.co/Freddierui/TACTUS-TactusNet)
- [Código en GitHub](https://github.com/Ruifreddie/TACTUS)
- [Dataset TACTUS en Hugging Face](https://huggingface.co/datasets/hding2455/TACTUS)
- [Release oficial de V-JEPA 2](https://github.com/facebookresearch/vjepa2)
