# fernandotonon/QtMeshEditor-sam3dbody-onnx

## Resumen

Este repositorio contiene una exportación a ONNX del modelo **SAM 3D Body** de Meta (`facebook/sam-3d-body-dinov3`, rama de cuerpo), junto con el modelo corporal **MHR** (Momentum Human Rig). El objetivo es reconstruir una malla tridimensional de cuerpo humano completo (18.439 vértices, 36.874 triángulos) a partir de una única fotografía. La exportación la firma el desarrollador fernandotonon como parte del proyecto QtMeshEditor, que la consume mediante el comando `qtmesh body photo.jpg -o body.obj`.

El paquete no es un modelo generativo de texto ni un LLM: es un pipeline de visión por computador compuesto por varios grafos ONNX encadenados (backbone, decoder, refinamiento de manos, fusión y forward del cuerpo MHR). El backbone es un DINOv3-ViT-H+/16 en fp32 que procesa imágenes de 512×512 píxeles y produce características de 1280×32×32. La relevancia actual reside en que permite ejecutar localmente, sin PyTorch y mediante ONNX Runtime, una reconstrucción de cuerpo humano con precisión verificada frente a la implementación original de Meta (diferencias de ~1e-6 en el decoder y ~2e-5 en el backbone).

La licencia es mixta y restrictiva: los grafos derivados de SAM Materials usan la SAM License de Meta (no aprobada por la OSI, con cláusulas de indemnización y terminación por litigio), mientras que los ficheros derivados de MHR son Apache-2.0. El repositorio ocupa 4,2 GB y no registra descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline ONNX multi-grafo: DINOv3-ViT-H+/16 (backbone) + decoder de 6 capas con feedback de pose intermedio + cabezas de pose/cámara + modelo corporal MHR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 512×512) |
| Tipos de cuantizacion | fp32 (único formato publicado); no se ofrecen variantes cuantizadas |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | SAM License (grafos SAM) + Apache-2.0 (datos MHR); licencia agregada `sam-license-and-apache-2.0` |
| Formato de pesos | ONNX (`.onnx` + `.onnx.data`) y binarios auxiliares `.i32` / `.bin` |

## Arquitectura y entrenamiento

El pipeline se descompone en grafos independientes. `sam3d_backbone.onnx` es un ViT-H+/16 de DINOv3 que recibe un tensor `[1,3,512,512]` en RGB normalizado a 0..1 y devuelve características `[1,1280,32,32]`. `sam3d_decoder.onnx` aplica condicionamiento por rayos de cámara, un decoder de 6 capas con realimentación de pose intermedia y cabezas de pose y cámara. Para el refinamiento de manos se añaden `sam3d_decoder_v2.onnx` (decoder con prompts de keypoints, cuatro slots fijos y máscara de validez), `sam3d_hand_decoder.onnx` (pose PCA de mano, escala/forma y rotación de muñeca) y `sam3d_hand_fuse.onnx` (fusión con test de ángulo de muñeca de Meta). Finalmente, `mhr_body.onnx` ejecuta el forward del cuerpo MHR: forma `[1,45]` más parámetros de modelo `[1,204]` a vértices en centímetros y translaciones/rotaciones de articulaciones.

El entrenamiento original corresponde a Meta; esta exportación no reentrena nada. La fidelidad se verificó contra la ejecución en PyTorch de Meta sobre las mismas entradas: decoder ~1e-6, backbone ~2e-5 (fp32 aquí frente a bf16 en el código de Meta) y MHR ~1e-4 cm. Deliberadamente no se reproducen las correctivas de pose de MHR (red de 664 MB; sin ellas el cuerpo se desvía una media de 2 mm y un máximo de 25 mm) ni el modelo de expresión facial. El refinamiento de manos reproduce la ruta `run_inference(..., "full")` de Meta y queda a 1,9/4,1 mm (izquierda/derecha, media) frente a ~30 mm de la estimación solo de cuerpo. El preprocesado (recorte de persona, warp afín, condición CLIFF, rayos de cámara) no está en los grafos, sino en la aplicación (`src/BodyFromPhoto/SamBodyPredictor.cpp`).

## Capacidades

- Reconstrucción de malla de cuerpo humano completo (18.439 vértices, 36.874 triángulos) a partir de una sola imagen.
- Estimación de pose y cámara con decoder promptable de 6 capas y realimentación intermedia.
- Refinamiento de manos mediante recorte, decoder específico, tests de aceptación y fusión con el cuerpo.
- Salida de parámetros del modelo MHR (forma y parámetros de modelo) y vértices en centímetros.
- Topología y layout UV incluidos (`mhr_faces.i32`, `mhr_uv.bin`) para texturizado posterior.
- Ejecución sin PyTorch mediante ONNX Runtime.
- No soporta tool calling, agentes, texto, audio ni visión general: es exclusivamente image-to-3D de cuerpo humano.

## Casos de uso

- **Animación y rigging**: generar una malla humana base desde una foto para retopologizar o riggear en Blender o Maya, usando los 18.439 vértices y la topología MHR incluida.
- **Avatares para VR y videojuegos**: producir un avatar corporal inicial a partir de una imagen del usuario y texturizarlo con el layout UV de `mhr_uv.bin`.
- **Prueba virtual de ropa**: obtener la geometría corporal y las articulaciones (translaciones/rotaciones) para simular prendas sobre la malla resultante.
- **Edición 3D asistida en QtMeshEditor**: integrar el comando `qtmesh body photo.jpg -o body.obj` en flujos de trabajo de modelado para acelerar la creación de personajes.
- **Análisis ergonómico o antropométrico**: extraer medidas aproximadas en centímetros de la malla generada para estudios de postura o tallaje.
- **Captura de movimiento de una sola vista**: usar la pose estimada y las rotaciones articulares como inicialización para pipelines de mocap.
- **Docencia y prototipado de visión 3D**: emplear los grafos ONNX como referencia ejecutable de un pipeline SAM 3D Body sin dependencia de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta métricas de fidelidad de la exportación frente a la implementación de Meta:

| Comparacion | Diferencia medida |
|---|---|
| Decoder frente a PyTorch de Meta | ~1e-6 |
| Backbone frente a PyTorch de Meta (fp32 vs bf16) | ~2e-5 |
| MHR frente a PyTorch de Meta | ~1e-4 cm |
| Manos refinadas frente a pipeline completo de Meta (media) | 1,9 mm (izquierda) / 4,1 mm (derecha) |
| Manos solo cuerpo frente a pipeline completo de Meta | ~30 mm |
| Desviación sin correctivas de pose MHR | 2 mm media / 25 mm máximo |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 4,2 GB en fp32, por lo que se requiere al menos ese orden de memoria para cargar todos los grafos, más el espacio de activaciones.
- GPU recomendadas: no especificadas por el autor; al ser ONNX Runtime, puede ejecutarse en CPU o en GPU compatible con los execution providers de ONNX Runtime (CUDA, DirectML, CoreML).
- GPU de consumo: no confirmado; la ausencia de variantes cuantizadas dificulta su despliegue en GPUs con poca VRAM.
- Opciones de despliegue: ONNX Runtime (formato nativo), integración en QtMeshEditor; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QtMeshEditor-sam3dbody-onnx (este) | Pipeline ONNX de SAM 3D Body + MHR | 1 imagen 512×512 | Malla de 18.439 vértices | SAM License + Apache-2.0 | Hugging Face, ONNX |
| facebook/sam-3d-body-dinov3 | Modelo original de Meta en PyTorch | 1 imagen | Malla corporal | SAM License | Hugging Face, requiere PyTorch |
| Otros modelos image-to-3D de cuerpo humano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La SAM License no es una licencia de código abierto aprobada por la OSI: incluye cláusula de indemnización, terminación por litigio, restricciones de control de comercio y el derecho de Meta a actualizar los términos. Revisar antes de cualquier uso comercial.
- La licencia exige que una copia de `LICENSE-SAM.txt` viaje con los materiales SAM; el repositorio la incluye.
- No se reproducen las correctivas de pose de MHR, lo que introduce desviaciones de hasta 25 mm en cuerpos posados.
- No se incluye el modelo de expresión facial: la cabeza del cuerpo lo anula, por lo que no hay reconstrucción facial.
- El refinamiento de manos solo está activo con la opción `--hands` del script de exportación; sin ella, el error en manos ronda los 30 mm.
- El preprocesado (recorte de persona, warp afín, condición CLIFF, rayos de cámara) no está incluido en los grafos y debe replicarse en la aplicación anfitriona.
- Solo se publican pesos fp32; no hay variantes cuantizadas para reducir memoria o latencia.
- El repositorio no registra descargas y el proyecto no está afiliado ni respaldado por Meta.
- Riesgo de sesgos y alucinación geométrica: no documentado en la información disponible; al ser un modelo de reconstrucción, los errores se manifiestan como geometría incorrecta, no como texto inventado.

## Enlaces

- Hugging Face: https://huggingface.co/fernandotonon/QtMeshEditor-sam3dbody-onnx
- Modelo base: https://huggingface.co/facebook/sam-3d-body-dinov3
- Repositorio QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor
- Repositorio agregado de modelos: `fernandotonon/QtMeshEditor-models` (subcarpeta `sam3dbody/`)
- Licencia SAM: https://huggingface.co/fernandotonon/QtMeshEditor-sam3dbody-onnx/blob/main/LICENSE-SAM.txt
- Licencia MHR: `LICENSE-MHR.txt` en el mismo repositorio
