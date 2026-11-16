# fastforks/anysplat

## Resumen

AnySplat es un modelo de reconstruccion 3D feed-forward desarrollado por Jiang et al. (2025) y empaquetado para el ecosistema fastforks por el usuario `fastforks`. Resuelve el problema de generar representaciones 3D Gaussian splatting a partir de multiples imagenes sin pose ni calibracion previa: dado un conjunto de vistas de una misma escena, predice las camaras, los mapas de profundidad y un conjunto de gaussianas 3D por pixel que se fusionan en una unica escena exportable como PLY.

El modelo se apoya en un backbone VGGT (Visual Geometry Grounded Transformer) afinado, con cabezas especificas para camara, profundidad y gaussianas (DPT Gaussian head). La inferencia es estrictamente forward pass, sin renderer integrado, lo que lo hace adecuado para pipelines de reconstruccion por lotes mas que para visualizacion interactiva. El repositorio de Hugging Face es unicamente una model card: no aloja pesos, sino que documenta variantes, hashes SHA-256 y enlaces a los pesos originales de los autores.

Es relevante ahora porque combina dos lineas de investigacion recientes (reconstruccion multi-vista sin poses y Gaussian splatting feed-forward) en un unico modelo con licencia MIT, lo que facilita su integracion en productos comerciales. El proyecto fastforks anade backends optimizados (`portable` y `kernels`) con paridad numerica verificada frente al codigo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VGGT (agregador multi-vista) con cabezas de camara, profundidad y Gaussian DPT |
| Parametros totales | no disponible (inicializado desde VGGT-1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa un numero variable de vistas) |
| Tipos de cuantizacion | fp16, fp32 (soportado en los backends); no se documentan cuantizaciones int8/int4 |
| Idiomas soportados | no aplica (modelo de vision/reconstruccion 3D) |
| Licencia | MIT (codigo y checkpoint); copia de VGGT bajo VGGT License (uso comercial permitido) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

AnySplat sigue una arquitectura de transformer multi-vista tipo VGGT. Un agregador afinado procesa todas las imagenes de entrada de forma conjunta y produce tokens por vista; sobre ellos actuan tres cabezas: una cabeza de camara (que estima intrinsecos y `cam_to_world`), una cabeza de profundidad (que emite mapas de profundidad y confianza) y una cabeza DPT de gaussianas que predice por pixel opacidad, escala, rotacion y coeficientes de armónicos esfericos de grado 4. Las gaussianas se fusionan por voxel en una unica escena (`result.gaussians`, exportable con `.save("scene.ply")`). El modelo es solo forward pass: no incluye renderer.

Segun el paper (arXiv 2505.23716), el entrenamiento usa una mezcla de datasets publicos multi-vista; el repositorio original incluye configuraciones para CO3Dv2, DL3DV y ScanNet++. El checkpoint parte de una inicializacion VGGT-1B. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni si hubo etapas de RLHF/DPO (poco probable en un modelo de reconstruccion geometrica). La innovacion principal es la prediccion conjunta de camaras, profundidad y gaussianas en un solo paso, sin optimizacion por escena.

## Capacidades

- Reconstruccion 3D feed-forward de escenas a partir de multiples imagenes, sin necesidad de poses ni calibracion.
- Estimacion de poses de camara (intrinsecos y extrínsecos) cuando no se proporcionan.
- Prediccion de mapas de profundidad por vista con mapa de confianza asociado.
- Generacion de nubes de puntos 3D (`world_points`) y gaussianas 3D exportables a PLY.
- Funciona tanto en regimen de multi-view stereo con camaras conocidas como en regimen no posado.
- Acepta entradas de cualquier resolucion H x W >= 1 (redimensiona o rellena internamente); probado hasta 3000x4000 en fp16.
- Soporta dos backends de ejecucion (`portable` y `kernels`) con paridad numerica verificada.
- No soporta texto, tool calling, agentes ni capacidades linguisticas: es un modelo puramente visual/geometrico.

## Casos de uso

- Digitalizacion de interiores: a partir de un conjunto de fotos de una habitacion tomadas sin tripode ni calibracion, AnySplat estima camaras y profundidad y produce una escena de gaussianas exportable a PLY para visores 3D o pipelines de renderizado offline.
- Reconstruccion para e-commerce: generar modelos 3D de productos a partir de fotos multi-angulo sin necesidad de un rig calibrado, reduciendo el coste de captura en estudios fotograficos.
- Preprocesado para NeRF o Gaussian Splatting optimizado: usar las poses y profundidades predichas como inicializacion para metodos de optimizacion por escena, acelerando la convergencia.
- Inspeccion y gemelos digitales en obra civil: procesar barridos fotograficos de obra para obtener nubes de puntos y gaussianas que alimenten comparaciones geometricas con el modelo BIM.
- Robotica y navegacion: estimar estructura 3D y poses de camara de un robot con vision monocular multi-frame para mapeo local, aprovechando que no requiere calibracion previa.
- Investigacion en vision 3D: servir como baseline reproducible para experimentos de reconstruccion sin poses, con backends optimizados y paridad numerica documentada frente al codigo original.
- Procesamiento por lotes en servidor: integrar el modelo en un pipeline de reconstruccion masiva usando el backend `kernels` (364 ms por escena a 336x518 en una RTX 5060 Ti), con exportacion automatica de PLY por escena.

## Benchmarks y rendimiento

Precision en DTU (recortes 640x512, 7 vistas co-visibles, GT = profundidad renderizada desde puntos de luz estructurada):

| Variante | Dataset | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|---|
| `anysplat` | DTU scans 1, 9, 24, 33, 75 (AbsRel / delta1 %) | 0.0108 / 99.93 | 0.0108 / 99.93 | 0.0109 / 99.93 | 0.0108 / 99.93 |

Rendimiento y memoria (RTX 5060 Ti 16 GB, sm_120, entrada 336x518):

| Metrica | Original fp32 | Original fp16 | Portable | Kernels | torch.compile | TensorRT fp16 |
|---|---|---|---|---|---|---|
| Tiempo (ms) | no disponible | 741 | 504 | 364 | 427 | 314 |
| Memoria pico asignada (MiB) | 8931 | no disponible | 4842 | 4852 | 4137 | 7629 (con torch) |

Arranque y primera llamada (336x518):

| Metrica | Original | Portable | Kernels |
|---|---|---|---|
| Carga (s) | 8.32 | 2.46 | 3.98 |
| Primera llamada (s) | 3.07 | 0.89 | 0.73 |

Paridad con el codigo original: en CPU float32, max |diff| <= 1.3e-05; en GPU float16, mean |diff| <= 0.0013 y p99 <= 0.0033 sobre la salida de profundidad.

## Requisitos de hardware

- VRAM estimada: 4.8-4.9 GiB en fp16 con backend `portable` o `kernels` a 336x518; hasta 6.5 GiB pico asignado (9.4 GiB reservados) a 3000x4000 en una RTX 5060 Ti 16 GB.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks), RTX 4090, A100, H100. Cabe en GPUs consumer con al menos 8-10 GiB de VRAM para resoluciones moderadas.
- Opciones de despliegue: el paquete `fastforks` (backends `portable` y `kernels`), exportacion a ONNX y TensorRT fp16 (build del engine ~215 s), y `torch.compile` (compilacion en frio ~80 s). No se documenta soporte para vLLM, llama.cpp ni Ollama (no aplica a un modelo de vision).
- Latencia: 364 ms por escena con `kernels` a 336x518; 314 ms con TensorRT fp16; 504 ms con `portable`. Primera llamada entre 0.73 y 0.89 s segun backend.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Poses de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnySplat | Reconstruccion feed-forward + Gaussian splatting | no disponible (VGGT-1B init) | No requeridas | MIT | Hugging Face (`lhjiang/anysplat`), GitHub |
| VGGT-1B | Transformer multi-vista (base) | 1B aprox. | No requeridas | CC-BY-NC-4.0 (pesos originales) | Hugging Face |
| DUSt3R | Reconstruccion por pares de imagenes | no disponible | No requeridas | CC BY-NC-SA (cabecera Naver) | GitHub, Hugging Face |
| PatchMatchNet | MVS clasico (multi-view stereo) | no disponible | Requeridas + rango de profundidad | no disponible | GitHub |

La ventaja principal de AnySplat frente a VGGT-1B es que anade la cabeza de gaussianas y la fusion por voxel, produciendo escenas 3D directamente en lugar de solo geometria. Frente a DUSt3R, opera de forma multi-vista conjunta en lugar de por pares. Frente a PatchMatchNet, elimina la necesidad de camaras calibradas y de un rango de profundidad predefinido.

## Limitaciones y advertencias

- El repositorio de Hugging Face no aloja pesos: es solo una model card. La descarga de pesos depende de enlaces externos y de la verificacion SHA-256 por parte de `fastforks`.
- Modelo experimental (tier `experimental` segun la propia card): no debe asumirse estabilidad de API ni de resultados en produccion sin validacion propia.
- No incluye renderer: la salida es geometrica (profundidad, puntos, gaussianas); la visualizacion requiere herramientas externas.
- El checkpoint deriva de VGGT-1B, cuyos pesos originales son CC-BY-NC-4.0; los autores de AnySplat liberan su version como MIT, pero conviene revisar la cadena de licencias antes de uso comercial.
- El fichero `vggt_dpt_gs_head.py` del codigo original arrastra una cabecera CC BY-NC-SA de Naver (procedente de DUSt3R) aunque la clase sea codigo nuevo; fastforks reimplementa esa cabeza y no incluye ficheros con esa cabecera.
- Riesgo de alucinacion geometrica en escenas con poca textura, superficies reflectantes o iluminacion no uniforme (comun en reconstruccion multi-vista); no se documentan metricas de robustez especificas.
- No hay informacion sobre sesgos demograficos o culturales; al ser un modelo geometrico, el riesgo principal es de sesgo en los datasets de entrenamiento (CO3Dv2, DL3DV, ScanNet++) hacia escenas indoor y objetos cotidianos.
- Resolucion de entrada muy alta probada solo hasta 3000x4000 con 6.5 GiB pico; por encima puede exceder la VRAM de GPUs consumer.
- No soporta texto, agentes ni tool calling; no es adecuado para tareas linguisticas o multimodales mas alla de la reconstruccion 3D.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/anysplat
- Pesos originales de los autores: https://huggingface.co/lhjiang/anysplat
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Codigo original de AnySplat: https://github.com/InternRobotics/AnySplat (commit `5f5e208`)
- Paper: https://arxiv.org/abs/2505.23716
- Documentacion de benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de variantes y hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/multiview/models/anysplat/card.toml
- Licencia del codigo original: https://github.com/InternRobotics/AnySplat/blob/5f5e208a7dd57d52e43ea0d553a95eab526e8775/LICENSE
