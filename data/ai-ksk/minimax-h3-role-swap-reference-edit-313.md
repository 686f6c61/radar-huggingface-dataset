# AI-KSK/minimax-h3-role-swap-reference-edit-313

## Resumen

El repositorio `AI-KSK/minimax-h3-role-swap-reference-edit-313` no contiene un modelo de lenguaje en el sentido convencional, sino un paquete de tres flujos de trabajo (workflows) para ComfyUI orientados a edicion de video por referencia con reemplazo de personaje (role swap) sobre el supuesto modelo MiniMax H3. El autor, AI-KSK, distribuye unicamente archivos JSON de workflow y portadas PNG; el repositorio tiene un tamano de 0.0 GB y no incluye pesos, datos de entrenamiento ni artefactos de inferencia verificables.

Los tres flujos (Face Refine, version silenciosa y version estandar) suman 231 registros de nodo y dependen de checkpoints externos que no se empaquetan: un modelo hibrido `minimax_h3_hybrid_fl2va_ref2va_zs05_b25-49_int8.safetensors`, un codificador `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`, VAE de video y audio, y `video_depth_anything_vits.pth`. La model card advierte explicitamente de que las portadas no son muestras de inferencia verificadas y de que los resultados de rendimiento, memoria o compatibilidad no han sido medidos.

Por tanto, esta ficha documenta un artefacto de configuracion reproducible, no un modelo evaluable. Cualquier dato sobre arquitectura, parametros, contexto o benchmarks del modelo MiniMax H3 subyacente no esta disponible en la informacion proporcionada y no debe inferirse de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene workflows de ComfyUI, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | referencias a INT8 y NVFP4/AWQ en los nombres de checkpoint citados, sin artefactos incluidos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no incluido; los workflows son JSON y las portadas PNG |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-01 |
| Fecha de actualizacion | 2026-11-01 |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red ni proceso de entrenamiento en la informacion disponible. El contenido del repositorio son grafos de nodos de ComfyUI que orquestan modulos externos: un compositor VDN que referencia `OpenVDN/vdn-minimax-h3` y `stage_dmd_8nfe`, un codificador Qwen3-VL de 32B en formato NVFP4 AWQ, un VAE de video INT8 y un VAE de audio FP32, ademas de VideoDepthAnything (ViT-S) para estimacion de profundidad y un detector facial YuNet ONNX.

Los flujos implementan tecnicas de edicion por referencia: composicion hibrida RGB/profundidad como condicionamiento, segmentacion con mascara expandida y suavizada, inyeccion manual de latentes de audio de origen, y en la variante 01 una cadena adicional de refinado facial con recorte, 12 pasos de muestreo, denoise 0.45 y sampler `dual_clock_euler/native_flow`. No hay evidencia de entrenamiento, RLHF, DPO ni innovaciones de decodificacion propias del autor.

## Capacidades

- Orquestacion de edicion de video por referencia con reemplazo de personaje principal sobre footage de origen.
- Composicion de referencia hibrida RGB + mapa de profundidad para condicionar la generacion.
- Refinado facial opcional mediante recorte, reconstruccion y stitch (solo variante 01).
- Inyeccion manual de latentes de audio de origen en las variantes 02 y 03; la variante 02 desactiva cinco nodos de audio-latente manuales.
- Estimacion de profundidad monocular con VideoDepthAnything ViT-S y deteccion facial con YuNet 2023mar.
- Parametrizacion de dimensiones objetivo por rama de escalado (aproximadamente 0.79 MP, 0.9 MP y 0.48 MP segun variante).
- Limite de carga de 124 frames a 24 fps citado en la variante 02.
- No se documentan capacidades de texto, razonamiento, codigo, tool calling, agentes ni multilingues, porque el repositorio no contiene un LLM.

## Casos de uso

- Prototipado de pipelines de reemplazo de personaje en postproduccion: los JSON sirven como plantilla para reconstruir un grafo de edicion por referencia en ComfyUI, sustituyendo medios y puntos de segmentacion por los del proyecto propio.
- Investigacion de condicionamiento hibrido RGB/profundidad: util para estudiar como afecta la composicion de profundidad a la coherencia temporal en edicion de video, usando la variante 03 como base controlada.
- Evaluacion de refinado facial en video generado: la cadena de la variante 01 (recorte, 12 pasos, denoise 0.45) permite experimentar con reconstruccion de rostros tras la generacion principal.
- Integracion de audio de origen en video editado: las variantes 02 y 03 muestran como inyectar latentes de audio codificados y como conectar la pista de sonido en los nodos `CreateVideo`.
- Auditoria de grafos ComfyUI en equipos de produccion: los flujos incluyen estados de bypass, prefijos de guardado compartidos y nodos de reporte, utiles como caso de estudio de control de calidad de workflows.
- Base para pruebas de compatibilidad de checkpoints: permite verificar la resolucion de dependencias (SeC, VAE, codificador Qwen3-VL) en un entorno propio antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que las referencias a `stage_dmd_8nfe` son referencias de configuracion y no mediciones de NFE, tiempos, memoria o compatibilidad, y que las portadas seleccionadas no son muestras de inferencia verificadas.

## Requisitos de hardware

- VRAM estimada: no disponible. No se aportan mediciones; el codificador citado (Qwen3-VL 32B en NVFP4 AWQ) sugiere, por su tamano nominal, requisitos elevados, pero no hay cifras verificadas en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en ninguna GPU consumer.
- Opciones de despliegue: ComfyUI con los nodos personalizados requeridos (SeC, VideoDepthAnything, condicionamiento H3/VDN, latentes audiovisuales, mascaras y nodos de guardado). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; la model card advierte explicitamente de que no hay resultados medidos de timing ni memoria.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables de la misma categoria, y el repositorio no constituye un modelo evaluable sino un conjunto de workflows. Cualquier comparacion con otros sistemas de edicion de video por referencia requeriria datos que no se han publicado.

## Limitaciones y advertencias

- El repositorio no incluye pesos ni medios de entrada; sin los checkpoints externos citados los workflows no son ejecutables.
- Las portadas seleccionadas no son muestras de inferencia verificadas independientemente.
- La etiqueta "silent" de la variante 02 es solo una etiqueta de origen: no prueba que el MP4 de salida este silenciado, ya que ambos nodos `CreateVideo` siguen tomando el audio de origen.
- El estado de los nodos (modo 0, bypass de grupos) debe revisarse tras la importacion; las notas heredadas pueden inducir a error sobre la actividad real de cadenas como Face Refine o AudioMix.
- Los prefijos de guardado se reutilizan entre ejemplos, lo que puede provocar colisiones de nombres de archivo.
- La composicion RGB/profundidad es una referencia de condicionamiento, no una restauracion final del fondo original pixel a pixel.
- El audio candidato de la variante 01 es audio de origen recortado, no audio facial generado; el recorte fijo es de aproximadamente 5.1667 s a 24 fps.
- Los nodos de reporte y fallback no estan conectados; `StitchAudit` no es un artefacto de informe validado.
- No se verifican preservacion de identidad, movimiento, escena ni sincronizacion temporal.
- Uso comercial: la licencia no esta disponible, por lo que no puede asumirse permiso de uso comercial. Se requiere footage, imagenes y audio autorizados.
- Riesgo de sesgos y alucinacion del modelo subyacente: no evaluable con la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/minimax-h3-role-swap-reference-edit-313
- Workflow 01 (Face Refine, JSON): workflows/Mini Max H3｜角色替换_参考编辑（Face Refine 精修版）.json
- Workflow 02 (version silenciosa, JSON): workflows/Mini+Max+H3｜角色替换_参考编辑（无声版）.json
- Workflow 03 (version estandar, JSON): workflows/Mini+Max+H3｜角色替换_参考编辑（标准版）.json
- Dependencia VDN: OpenVDN/vdn-minimax-h3 (referencia citada, sin URL directa en la informacion)
- Checkpoint hibrido citado: `minimax_h3_hybrid_fl2va_ref2va_zs05_b25-49_int8.safetensors` (no incluido)
- Codificador citado: `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` (no incluido)
- VAE de video citado: `minimax_h3_video_vae_int8_convrot.safetensors` (no incluido)
- VAE de audio citado: `minimax_h3_audio_vae_fp32.safetensors` (no incluido)
- Modelo de profundidad citado: `video_depth_anything_vits.pth` (no incluido)
- Detector facial citado: `facedetection/face_detection_yunet_2023mar.onnx` (no incluido)
