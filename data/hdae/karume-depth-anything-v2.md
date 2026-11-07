# hdae/karume-depth-anything-v2

## Resumen

Karume Depth Anything V2 es una conversión no oficial del checkpoint Depth Anything V2 Small de depth-anything al formato de contenedor del runtime de inferencia WebGPU Karume (`.krm`). El modelo original resuelve la estimación de profundidad monocular relativa: dado un fotograma RGB, produce un mapa de profundidad denso donde valores mayores indican mayor cercanía. La conversión la mantiene el usuario hdae y no está afiliada ni respaldada por el equipo de Depth Anything.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de profundidad de calidad en el navegador y en Deno sin backend Python, gracias al runtime Karume y a WebGPU. Por otro lado, al conservar los pesos f32 originales sin cuantización, sirve como referencia de fidelidad numérica frente a otras distribuciones del mismo checkpoint.

Arquitectónicamente es un transformer híbrido: backbone DINOv2 más cabeza DPT, según el paper arXiv:2406.09414. El paquete ocupa 0,2 GB en el repositorio y la descarga de pesos es de 94,5 MiB en f32. No es un checkpoint de profundidad métrica: no hay unidades ni origen, y los valores no son comparables entre imágenes distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 (backbone ViT) + cabeza DPT |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 518 × 518 píxeles) |
| Tipos de cuantizacion | f32 únicamente (sin cuantización en esta conversión) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor Karume `.krm` (partes numeradas, manifiesto `karume.json` versión `karume/5`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Depth Anything V2: un backbone DINOv2 que extrae características y una cabeza DPT que las fusiona y reensambla en un mapa de profundidad denso. Según la model card, Depth Anything V2 se destila de un profesor entrenado con datos sintéticos y después se entrena con imágenes reales pseudoetiquetadas; los detalles de composición del dataset deben consultarse en las fuentes upstream.

La conversión no implica reentrenamiento ni ajuste fino, y no aplica cuantización: los pesos son los valores f32 del checkpoint original. El grafo exportado corresponde al `forward` upstream con dos reescrituras puramente de layout (el upsample de la última etapa de fusión recibe un tamaño de salida explícito en lugar de un factor de escala, y la interpolación del position embedding se fija a la resolución de preentrenamiento, donde es la identidad; ambas son bit-exactas). Además, las convoluciones transpuestas de la etapa de reensamblado DPT se sustituyen por una convolución 1×1 seguida de pixel shuffle; al cumplirse `kernel == stride`, ambas formulaciones son la misma suma en distinto orden, con un error máximo medido de 6,1e-06 sobre valores de profundidad con RMS cercano a 1. El exportador utilizado es `karume/0.13.0`.

## Capacidades

- Estimación de profundidad monocular relativa: devuelve un valor f32 por píxel, a la misma resolución de la imagen de entrada.
- Preprocesado y posprocesado integrados en el pipeline: redimensiona a 518 × 518, normaliza con las constantes del checkpoint, ejecuta el grafo y reescala el mapa a la resolución original.
- Ejecución en navegador y en Deno mediante WebGPU, sin dependencias de Python.
- Entrada en RGB8 row-major (3 bytes por píxel); la decodificación de PNG/JPEG queda a cargo del llamador (`createImageBitmap` en navegador o cualquier decodificador en Deno).
- Salida cruda en f32, sin normalización a [0, 1] ni coloreado: la decisión de escala y mapa de color es del consumidor.
- Gestión de sesión GPU persistente: las llamadas concurrentes se encolan y los pesos se descargan una sola vez, con verificación de `size` y `sha256` del manifiesto.
- No soporta tool calling, agentes ni procesamiento de lenguaje: es un modelo puramente visual.

## Casos de uso

- Efectos de desenfoque de fondo en aplicaciones web: el pipeline devuelve un mapa de profundidad por píxel que permite aplicar un desenfoque selectivo en canvas o WebGL sin salir del navegador, aprovechando la ejecución WebGPU.
- Reconstrucción 3D aproximada y mapas de relieve: a partir del orden relativo de profundidad se pueden generar mallas o nubes de puntos para previsualizaciones interactivas, asumiendo que la escala no es métrica.
- Segmentación por profundidad en edición de imagen: usar el mapa como canal auxiliar para separar primer plano y fondo en herramientas de recorte o composición.
- Realidad aumentada en web: estimar la oclusión relativa entre objetos virtuales y la escena capturada por la cámara, integrándolo en experiencias WebXR con el runtime Karume.
- Procesado por lotes en Deno: pipelines de servidor ligero que procesan imágenes y generan mapas de profundidad en f32 para su posterior análisis, con verificación de integridad de pesos en cada despliegue.
- Control de calidad y comparación de conversiones: al conservar los pesos f32 sin cuantización, sirve como referencia para validar numéricamente otras distribuciones del mismo checkpoint (por ejemplo, comparando el error máximo frente a variantes cuantizadas).
- Robótica educativa y prototipado: percepción de profundidad relativa en dispositivos con navegador o Deno y GPU integrada, suficiente para tareas de evitación de obstáculos a corta distancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; la descarga de pesos es de 94,5 MiB en f32, por lo que la huella de pesos es reducida y el consumo adicional depende de las activaciones a 518 × 518.
- GPU recomendadas: no disponibles en la información proporcionada. El runtime requiere WebGPU, por lo que se necesita un navegador o Deno con soporte WebGPU y una GPU compatible (integradas modernas o dedicadas).
- Compatibilidad con GPU de consumo: previsiblemente sí en GPUs con WebGPU disponible, dado el tamaño de pesos; no se especifican modelos concretos ni cifras de latencia.
- Opciones de despliegue: runtime Karume mediante `jsr:@karume/models/depth-anything` en navegador y Deno. No es legible por transformers ni por llama.cpp, Ollama, vLLM o TGI, al usar un contenedor propio con grafo embebido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hdae/karume-depth-anything-v2 (esta ficha) | no disponible | 518 × 518 píxeles | Karume `.krm`, f32 | Apache 2.0 | Hugging Face, runtime Karume (WebGPU) |
| depth-anything/Depth-Anything-V2-Small-hf | no disponible | 518 × 518 píxeles | safetensors (transformers) | Apache 2.0 | Hugging Face |
| Depth Anything V2 Base | no disponible | 518 × 518 píxeles | safetensors (transformers) | CC BY-NC 4.0 (según la model card de esta conversión) | Hugging Face |
| Depth Anything V2 Large | no disponible | 518 × 518 píxeles | safetensors (transformers) | CC BY-NC 4.0 (según la model card de esta conversión) | Hugging Face |

La diferencia principal frente a los checkpoints upstream es el formato y el runtime: esta conversión prioriza ejecución en navegador vía WebGPU, mientras que los originales se integran en el ecosistema transformers. Solo el checkpoint Small es Apache 2.0; Base y Large se distribuyen bajo CC BY-NC 4.0 y no se convierten ni redistribuyen aquí. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Profundidad relativa, no métrica: los valores no tienen unidad ni origen, no son metros y no son comparables entre imágenes distintas; solo el ordenamiento es significativo.
- La salida no viene normalizada a [0, 1] ni coloreada; normalizar por mínimo y máximo descarta la escala, y la elección del mapa de color queda en manos del consumidor.
- La decodificación de imágenes no forma parte del pipeline; el llamador debe proporcionar píxeles RGB8.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- Riesgo de sesgos y errores heredados del checkpoint upstream, especialmente en escenas fuera de la distribución de entrenamiento (superficies reflectantes, transparencias, texturas repetitivas). No se documentan sesgos específicos en la información disponible.
- Conversión no oficial: no está afiliada ni respaldada por el equipo de Depth Anything; la responsabilidad de validación recae en el usuario.
- Licencia Apache 2.0 para esta conversión, con obligaciones de atribución y aviso de cambios (recogidas en `NOTICE.md` y `LICENSE.md`). Las variantes Base y Large del modelo original quedan fuera de esta licencia (CC BY-NC 4.0) y no deben redistribuirse bajo estos términos.
- Para producción se recomienda fijar una revisión completa (commit sha) en `Pipeline.fromPretrained`, ya que sin ella se sigue `main` y una actualización futura del repositorio puede romper la aplicación.
- El runtime es específico de Karume y WebGPU; no hay compatibilidad con transformers, llama.cpp, Ollama, vLLM ni TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hdae/karume-depth-anything-v2
- README del repositorio: https://huggingface.co/hdae/karume-depth-anything-v2/blob/main/README.md
- Checkpoint base (Depth Anything V2 Small): https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Paper Depth Anything V2: https://arxiv.org/abs/2406.09414
- Texto de la licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
