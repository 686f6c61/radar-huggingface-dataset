# fernandotonon/QtMeshEditor-triposplat-onnx

## Resumen

TripoSplat ONNX es una reexportación a formato ONNX del modelo VAST-AI/TripoSplat, un sistema generativo de reconstrucción 3D a partir de una sola imagen que produce hasta 262.144 gaussianas 3D. El trabajo original, descrito en el artículo "Generative 3D Gaussians with Learned Density Control" (arXiv 2605.16355), combina un encoder de imagen DINOv3 ViT-H con un VAE de FLUX.2 y un transformer de difusión (DiT) que opera sobre un latente de 8.192 tokens. Esta versión, publicada por el desarrollador fernandotonon, trocea el pipeline en cinco grafos ONNX independientes para que QtMeshEditor pueda ejecutar la inferencia localmente mediante ONNX Runtime sin dependencias de Python en tiempo de ejecución.

La relevancia de esta conversión es fundamentalmente de despliegue: permite integrar un generador image-to-3D de gaussianas en una aplicación de escritorio C++ con aceleración por hardware estándar. El repositorio ocupa 6,2 GB en fp32 y requiere que cada grafo `.onnx` se acompañe de su fichero `.onnx.data` de pesos externos. La licencia es mixta: el código y la mayoría de pesos de TripoSplat son MIT, el encoder DINOv3 se distribuye bajo la DINOv3 License de Meta (uso comercial permitido, pero no MIT) y el VAE de FLUX.2 es Apache-2.0.

No se dispone de información sobre benchmarks, idiomas soportados ni parámetros totales del modelo en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: DINOv3 ViT-H (encoder de imagen) + VAE FLUX.2 + DiT de flujo (flow matching) + octree de densidad + decodificador de gaussianas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo image-to-3D, no textual) |
| Tipos de cuantización | no disponible (los pesos se distribuyen en fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | mixta: MIT (TripoSplat) + DINOv3 License (encoder) + Apache-2.0 (VAE FLUX.2) |
| Formato de pesos | ONNX con pesos externos (`.onnx` + `.onnx.data`) |

## Arquitectura y entrenamiento

El pipeline se compone de cinco grafos ONNX encadenados. El primero es `triposplat_dinov3.onnx`, un ViT-H de DINOv3 que recibe una imagen de `[1,3,1024,1024]` en rango `[0,1]` y emite `feature1[1,4101,1280]`, con la normalización ImageNet y la capa `layer_norm` un-affine ya incorporadas en el grafo. El segundo, `triposplat_vae.onnx`, es el encoder del autoencoder de FLUX.2, que toma la imagen y un ruido `[1,32,128,128]` y produce `feature2[1,4101,128]`. Sobre estas características opera `triposplat_flow.onnx`, un paso de DiT de flow matching que recibe un latente `[B,8192,16]`, una cámara `[B,1,5]` y el tiempo `t` escalado por 1000, devolviendo las velocidades `v_latent` y `v_camera`. El bucle de integración Euler con classifier-free guidance se ejecuta en código host, no dentro de los grafos.

La colocación de puntos se realiza mediante `triposplat_octree.onnx`, que calcula logits de densidad para dividir recursivamente el presupuesto de puntos entre los 8 hijos de cada celda a lo largo de 8 niveles coarse-to-fine, con muestreo sistemático y jitter uniforme en la celda hoja. Finalmente, `triposplat_gs.onnx` decodifica cada punto hoja en 32 gaussianas con posición, armónicos esféricos de grado DC, opacidad, escala y rotación. La conversión a malla no forma parte de los grafos: QtMeshEditor densifica los splats en una rejilla de 1024³, simplifica, desenvuelve UV y hornea color y normal de detalle. Las atenciones se exportan como `com.microsoft.MultiHeadAttention` porque un SDPA plano materializa una matriz de scores de aproximadamente 9,7 GB por bloque bajo ONNX Runtime. La paridad medida frente a la reproducción numpy+ORT es de 3e-6 en posición y 3e-4 en opacidad para las 262.144 gaussianas.

## Capacidades

- Generación de gaussianas 3D a partir de una única imagen (image-to-3D), hasta 262.144 splats por inferencia.
- Producción de mallas texturizadas mediante el postproceso `SplatToMesh` de QtMeshEditor (densificación en rejilla 1024³, simplificación, UV unwrap y horneado de color y normal de detalle).
- Exportación de los splats crudos en formato estándar 3DGS `.ply`.
- Control de densidad aprendido mediante octree de 8 niveles con muestreo sistemático del presupuesto de puntos.
- Bucle de flow matching con integración Euler y classifier-free guidance configurable (pasos y escala de guiado).
- Inferencia local sin Python en tiempo de ejecución, vía ONNX Runtime.
- Integración con QtMeshEditor mediante CLI (`qtmesh generate3d --backend triposplat`), selector de backend en la GUI y argumento `backend` en el servidor MCP.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Generación de assets 3D en pipelines de modelado: un artista introduce una fotografía de referencia y obtiene una malla texturizada lista para retopología en Blender, gracias a la conversión integrada splats→malla con UV y normal de detalle.
- Prototipado rápido en herramientas de escritorio: QtMeshEditor invoca el backend `triposplat` desde su CLI o GUI, de modo que el usuario no necesita entorno Python ni GPU dedicada más allá de la que soporte ONNX Runtime.
- Automatización de catálogos de producto: a partir de una foto con fondo eliminado (matte sobre negro, recorte cuadrado a 1,2× la caja alfa y redimensionado a 1024²) se generan representaciones 3D de cada artículo para visores web o configuradores.
- Integración en flujos MCP: el servidor MCP de QtMeshEditor expone el argumento `backend`, lo que permite a agentes externos solicitar generaciones 3D dentro de una conversación técnica.
- Investigación en reconstrucción 3D generativa: los cinco grafos separados permiten instrumentar cada etapa (encoder, VAE, paso de flujo, octree, decodificador) y comparar la paridad numérica con la implementación de referencia.
- Despliegue en estaciones de trabajo con GPU de consumo: el export se diseñó para ejecutarse en máquinas de hasta 24 GB exportando un grafo por proceso con `--only`, y en inferencia el uso de `MultiHeadAttention` evita matrices de atención de casi 10 GB.
- Generación de variantes controladas por cámara: el grafo de flujo acepta un vector de cámara `[B,1,5]`, lo que permite condicionar la orientación de la reconstrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una comprobación de paridad numérica frente a la reproducción numpy+ORT: 262.144 splats con desviación máxima de 3e-6 en posición y 3e-4 en opacidad. También indica que reducir de 20 a 10 pasos de Euler con guidance 3 es fiable y reduce a la mitad el tiempo de pared, sin cifras absolutas de latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 6,2 GB en fp32 y la exportación se validó en máquinas de hasta 24 GB.
- GPU recomendadas: no disponibles en la documentación; el export se probó en un equipo de ≤24 GB, lo que sugiere GPUs de gama alta de consumo (RTX 3090/4090) o profesionales (A100, H100) como candidatas razonables, sin confirmación del autor.
- GPU de consumo: el pipeline cabe presumiblemente en GPUs de 24 GB, pero no se especifica el mínimo exacto ni el consumo por grafo.
- Despliegue: ONNX Runtime exclusivamente; no hay soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- CoreML no puede compilar el grafo de flujo; en macOS la inferencia se ejecuta en el Execution Provider de CPU.
- Latencia y throughput: no disponibles; solo se indica que 10 pasos de Euler con guidance 3 reducen el tiempo a la mitad frente a los 20 pasos por defecto.

## Comparativa con modelos similares

| Modelo | Tipo | Salida | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| TripoSplat ONNX (este) | Image-to-3D generativo | Hasta 262.144 gaussianas 3D + malla vía postproceso | MIT + DINOv3 License + Apache-2.0 | ONNX (5 grafos) | HuggingFace, 6,2 GB |
| VAST-AI/TripoSplat | Image-to-3D generativo | Gaussianas 3D | MIT (código y pesos) | PyTorch (checkpoint original) | HuggingFace |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa documentada es con el checkpoint original de VAST-AI/TripoSplat, del que este repositorio es una conversión. No se dispone de información sobre otros modelos image-to-3D comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia no es uniformemente MIT: el encoder DINOv3 se rige por la DINOv3 License de Meta (uso comercial permitido, pero con obligación de incluir una copia de la licencia en cualquier redistribución de los pesos o derivados, según §1.b.i) y el VAE de FLUX.2 es Apache-2.0. No debe describirse el conjunto como "enteramente MIT".
- El modelo requiere un matte previo del sujeto compuesto sobre fondo negro (convención de entrenamiento); sin este preprocesado la calidad de la reconstrucción se degrada.
- El guiado (guidance) debe mantenerse estrictamente por encima de 1; valores ≤1 rompen el bucle de flow matching.
- CoreML no puede compilar el grafo de flujo, por lo que en macOS la inferencia cae al Execution Provider de CPU con la penalización de rendimiento correspondiente.
- Cada grafo `.onnx` debe acompañarse de su `.onnx.data` en el mismo directorio; de lo contrario ONNX Runtime no puede cargarlo.
- La conversión splats→malla no está incluida en los grafos: depende del postproceso propietario de QtMeshEditor (`SplatToMesh`), lo que limita la portabilidad del pipeline completo a otras aplicaciones.
- No se han publicado métricas de calidad (PSNR, Chamfer, F-score) ni evaluaciones de sesgo; al ser un modelo de reconstrucción 3D, los sesgos se manifestarían como degradación en categorías de objeto poco representadas en el entrenamiento original.
- Riesgo de alucinación geométrica: al ser un modelo generativo, puede inventar geometría no visible en la imagen de entrada, especialmente en las caras ocultas.
- El repositorio no está afiliado ni respaldado por VAST-AI-Research, Meta ni Black Forest Labs.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fernandotonon/QtMeshEditor-triposplat-onnx
- Modelo base: https://huggingface.co/VAST-AI/TripoSplat
- Repositorio espejo de modelos de QtMeshEditor: https://huggingface.co/fernandotonon/QtMeshEditor-models
- Repositorio QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor
- Notas técnicas de la integración: https://github.com/fernandotonon/QtMeshEditor/blob/master/docs/TRIPOSPLAT.md
- Script de exportación: `scripts/export-triposplat-onnx.py` en el repositorio QtMeshEditor
- Licencia TripoSplat: https://huggingface.co/fernandotonon/QtMeshEditor-triposplat-onnx/blob/main/LICENSE-TripoSplat.txt
- Licencia DINOv3: https://huggingface.co/fernandotonon/QtMeshEditor-triposplat-onnx/blob/main/LICENSE-DINOv3.txt
- Artículo: "Generative 3D Gaussians with Learned Density Control", arXiv 2605.16355
