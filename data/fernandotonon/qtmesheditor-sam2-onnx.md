# fernandotonon/QtMeshEditor-sam2-onnx

## Resumen

Este repositorio contiene una exportación a ONNX de SAM 2.1 Hiera-Small, el modelo de segmentación de imágenes de Meta AI (FAIR) presentado en el trabajo "SAM 2: Segment Anything in Images and Videos" (Ravi et al., 2024). No se trata de un modelo nuevo ni de un ajuste fino: es una conversión de formato de los pesos oficiales (`sam2.1_hiera_small.pt`) a dos grafos ONNX que separan el codificador de imagen del decodificador de prompts, pensada para inferencia sin Python en tiempo de ejecución mediante ONNX Runtime.

La exportación la firma el desarrollador fernandotonon y está motivada por una necesidad concreta de su proyecto QtMeshEditor: la segmentación genérica de piezas de malla 3D. El flujo renderiza la malla desde múltiples vistas, ejecuta estos grafos sobre cada render y proyecta las máscaras de vuelta a la geometría, en una implementación propia en C++ del método SAMesh. El modelo base es Hiera-Small, la variante pequeña de la familia SAM 2.1, con arquitectura de transformer jerárquico (Hiera) como codificador de imagen.

La relevancia práctica es doble: por un lado, ofrece una ruta de despliegue de SAM 2.1 sin dependencias de PyTorch ni de Python, lo que facilita su integración en aplicaciones de escritorio o pipelines nativos; por otro, la model card documenta con detalle el proceso de exportación y las verificaciones de equivalencia numérica frente al predictor original, algo poco habitual en conversiones de este tipo. La licencia es Apache-2.0, igual que el código y los pesos originales de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer jerarquico Hiera (codificador de imagen) + codificador de prompts y decodificador de mascaras (SAM 2.1) |
| Parametros totales | no disponible (repo de 0.2 GB; encoder ONNX 138 MB, decoder ONNX 21 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen fija 1024x1024) |
| Tipos de cuantizacion | no disponible (se menciona `base_model:quantized` en los tags, sin detallar el esquema) |
| Idiomas soportados | no disponible (modelo de segmentacion de imagen, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, exportado via TorchScript) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de SAM 2.1: un codificador de imagen Hiera-Small que procesa la entrada RGB de 1024x1024 píxeles (normalizada con media y desviación estándar de ImageNet) y produce un embedding de imagen de 256x64x64 junto con dos características de alta resolución (32x256x256 y 64x128x128), con el `no_mem_embed` ya incorporado. El decodificador combina ese embedding con un codificador de prompts (coordenadas de puntos en píxeles de la imagen de 1024 y etiquetas por punto: 1 primer plano, 0 fondo, -1 relleno) y devuelve logits de máscara de 3x256x256 más tres puntuaciones IoU predichas por prompt.

No hay entrenamiento propio ni ajuste fino en este repositorio: es una conversión de formato de los pesos oficiales de Meta. La exportación se realizó con el exportador TorchScript en opset 17 sobre el checkpoint `sam2.1_hiera_small.pt` (commit de SAM 2 `2b90b9f5`), con una reescritura funcional del embedding de puntos de relleno para evitar nodos `Add` con entradas vacías que fallaban al cargar en ONNX Runtime. El script de exportación exige, antes de finalizar, que ambos grafos carguen y produzcan salidas finitas, que sobre una rejilla de 8x8 puntos en tres renders de malla cada máscara coincida con `SAM2ImagePredictor` de Meta con IoU ≥ 0.99 (medido ≥ 0.9995) y que cada puntuación IoU predicha quede dentro de 1e-3. Las dimensiones `B` (prompts por ejecución) y `N` (puntos por prompt) son dinámicas.

## Capacidades

- Segmentación de imágenes por prompts de puntos: genera máscaras a partir de coordenadas y etiquetas de primer plano/fondo, con salida multimáscara (tres propuestas) y puntuaciones IoU estimadas.
- Generación automática de máscaras (reimplementación de `SAM2AutomaticMaskGenerator`): rejilla de prompts de 16x16 restringida a los píxeles del objeto, lotes de 64 prompts de un solo punto, filtrado por IoU predicha ≥ 0.7 y estabilidad ≥ 0.85 (con offset de logit 1.0), NMS de máscaras a IoU 0.7 y descarte de máscaras por debajo del 0.1 % del objeto.
- Segmentación de piezas de malla 3D por renderizado multivista: el flujo de QtMeshEditor renderiza la malla desde muchas vistas, segmenta cada render y eleva las máscaras a la geometría (método SAMesh).
- Inferencia sin Python en tiempo de ejecución: los grafos se ejecutan con ONNX Runtime desde C++.
- Soporte de lotes dinámicos en prompts (`B`) y puntos por prompt (`N`).
- No soporta tool calling, agentes, razonamiento multi-paso, texto ni audio: es exclusivamente un modelo de visión para segmentación.
- Sin memoria de vídeo: la exportación cubre solo imagen individual, no el seguimiento temporal de SAM 2 en vídeo.

## Casos de uso

- Segmentación automática de piezas en mallas 3D: el flujo de QtMeshEditor renderiza la malla desde 40 vistas, ejecuta encoder y decoder sobre cada render y proyecta las máscaras de vuelta a la geometría; es el caso de uso original y está medido en 45–85 s por malla en CPU Apple M-series.
- Herramientas de edición 3D de escritorio: al ejecutarse con ONNX Runtime desde C++, se integra en aplicaciones nativas sin empaquetar Python ni PyTorch, lo que reduce el tamaño del instalador y las dependencias.
- Anotación semiautomática de datasets de imagen: la generación automática de máscaras con rejilla de prompts y NMS permite producir máscaras candidatas que un humano revisa, útil para crear datasets de segmentación con menos esfuerzo manual.
- Segmentación interactiva por clics: el decodificador acepta puntos de primer plano y fondo con lotes dinámicos, adecuado para interfaces donde el usuario refina una máscara haciendo clic sucesivos.
- Preprocesado en pipelines de visión por computador: al ser dos grafos ONNX independientes, el encoder puede ejecutarse una vez por imagen y reutilizar su embedding para múltiples consultas de prompts, amortizando coste en flujos con muchas consultas sobre la misma imagen.
- Despliegue en entornos sin GPU o con GPU modesta: el modelo Hiera-Small y la ejecución en CPU con ONNX Runtime permiten integrar segmentación en equipos de sobremesa o portátiles sin acelerador dedicado.
- Prototipado de segmentación en aplicaciones C++/Qt: sirve como referencia de exportación verificada numéricamente contra el predictor original, útil para equipos que necesiten replicar el proceso con otros checkpoints de SAM 2.1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de equivalencia de la exportación frente al predictor original de Meta: IoU ≥ 0.99 (medido ≥ 0.9995) sobre una rejilla de 8x8 puntos en tres renders de malla, y puntuaciones IoU predichas dentro de 1e-3. También indica un tiempo de 45–85 s por malla para 40 renders en CPU Apple M-series con el flujo completo de generación automática de máscaras.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Los pesos ONNX suman unos 159 MB (138 MB encoder + 21 MB decoder); la inferencia en 1024x1024 requiere memoria adicional para activaciones, no cuantificada en la información disponible.
- GPU recomendadas: no disponible. La model card no especifica requisitos de GPU.
- GPU de consumo: no hay datos publicados sobre encaje en RTX 4090, RTX 3090 u otras tarjetas de consumo. El tamaño reducido de los pesos sugiere que cabría en GPUs de consumo, pero no se confirma en la documentación.
- CPU: el flujo completo se ha medido en CPU Apple M-series (45–85 s por malla, 40 renders), lo que confirma viabilidad en CPU.
- Opciones de despliegue: ONNX Runtime (probado por el autor, también desde C++); el resto de backends (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de modelo y no se mencionan.
- Latencia y throughput: solo el dato agregado de 45–85 s por malla con 40 renders en CPU Apple M-series; no hay cifras por render ni por prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fernandotonon/QtMeshEditor-sam2-onnx (este) | no disponible (pesos ONNX ~159 MB) | imagen 1024x1024, prompts dinamicos | equivalencia con SAM 2.1 IoU ≥ 0.99 | Apache-2.0 | ONNX en Hugging Face |
| facebook/sam2.1-hiera-small (original) | no disponible | imagen 1024x1024, prompts dinamicos | referencia de la comparacion anterior | Apache-2.0 | PyTorch en Hugging Face / GitHub |
| SAM 2.1 Hiera-Tiny / Base+ / Large | no disponible | imagen 1024x1024 | no disponible | Apache-2.0 | PyTorch en Hugging Face / GitHub |
| SAM original (ViT-H) | no disponible | imagen 1024x1024 | no disponible | Apache-2.0 | PyTorch en Hugging Face / GitHub |

La comparación relevante es con el checkpoint original de Meta: este repositorio es una conversión de formato del mismo modelo, con equivalencia numérica verificada, y la diferencia práctica está en el runtime (ONNX Runtime frente a PyTorch) y en la ausencia de memoria de vídeo. No se dispone de datos de rendimiento frente a otras variantes de la familia SAM 2.1.

## Limitaciones y advertencias

- No es un modelo nuevo ni ajustado: cualquier limitación del SAM 2.1 Hiera-Small original se hereda íntegramente.
- Solo imagen individual: la exportación no incluye memoria de vídeo, por lo que no sirve para seguimiento temporal de objetos en vídeo.
- Sin capacidades de texto, código, razonamiento ni tool calling; no debe evaluarse como modelo de lenguaje.
- La calidad de la segmentación depende de la calidad de los prompts y de la rejilla usada en la generación automática; los umbrales documentados (IoU ≥ 0.7, estabilidad ≥ 0.85, NMS 0.7, descarte < 0.1 % del objeto) son heurísticos del flujo de QtMeshEditor y pueden no ajustarse a otros dominios.
- El flujo de segmentación de mallas depende de renderizados multivista; la calidad final depende del número de vistas (40 en la medición) y del tiempo de cómputo disponible.
- Riesgo de alucinación de máscaras: como todo modelo de segmentación, puede producir máscaras plausibles pero incorrectas en regiones ambiguas o de bajo contraste; las puntuaciones IoU predichas son una estimación, no una garantía.
- La model card no documenta sesgos ni evaluación de robustez por dominio; no hay información sobre rendimiento en imágenes médicas, satelitales u otros dominios especializados.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el texto de licencia de Meta (`LICENSE-SAM2.txt`) y la atribución correspondiente.
- Los archivos que QtMeshEditor descarga en tiempo de ejecución viven en el repo `fernandotonon/QtMeshEditor-models` (carpeta `segment/`); este repositorio es un espejo con model card, no necesariamente la fuente que consume la aplicación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad más allá de la del propio autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fernandotonon/QtMeshEditor-sam2-onnx
- Repositorio de modelos compartido: https://huggingface.co/fernandotonon/QtMeshEditor-models
- Proyecto QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-small
- Codigo oficial de SAM 2 (Meta): https://github.com/facebookresearch/sam2
- Paper "SAM 2: Segment Anything in Images and Videos" (Ravi et al., 2024): no disponible enlace directo en la informacion proporcionada
- Script de exportacion: `scripts/export-sam2-onnx.py` en el repositorio de QtMeshEditor
