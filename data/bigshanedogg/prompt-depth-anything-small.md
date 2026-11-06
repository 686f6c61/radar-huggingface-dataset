# bigshanedogg/Prompt-Depth-Anything-Small

## Resumen

Prompt-Depth-Anything-Small es un modelo de estimacion de profundidad metrica (metric depth) que combina una imagen RGB con una indicacion de profundidad de baja resolucion (por ejemplo, LiDAR de iPhone a 192 x 256 en metros) para producir un mapa de profundidad denso y preciso. El modelo original, Prompt Depth Anything, fue desarrollado por Haotong Lin, Sida Peng, Jingxiao Chen y colaboradores (publicado en CVPR 2025), y esta ficha corresponde a un port no oficial al formato transformers realizado por el usuario bigshanedogg, que ejecuta el codigo original mediante `trust_remote_code`.

El repositorio contiene los pesos del checkpoint original (`model.ckpt`) convertidos a `model.safetensors` bajo sus nombres de tensor originales, con verificacion de igualdad tensor a tensor. La arquitectura combina un backbone DINOv2 ViT-S/14 con una cabeza DPT condicionada por el prompt de profundidad, sumando 25.083.079 parametros totales y un tamano de repositorio de 0,1 GB.

Es relevante porque permite usar el modelo con la API estandar de transformers (`AutoModelForDepthEstimation`, `AutoProcessor`) sin depender del codigo Lightning original, manteniendo salidas bit-identicas verificadas contra la implementacion oficial. La licencia es Apache-2.0 tanto para codigo como para pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S/14 (backbone) + cabeza DPT condicionada por prompt de profundidad |
| Parametros totales | 25.083.079 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; resolucion de entrada con lado mayor hasta 1008, multiplos de 14) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el model card menciona autocast fp16) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue el diseno de Prompt Depth Anything: un backbone DINOv2 ViT-S/14 (`pretrained`) extrae caracteristicas de la imagen RGB, y una cabeza DPT (`depth_head`) condicionada por un prompt de profundidad de baja resolucion genera el mapa de profundidad metrica. El port incluye los buffers `_mean` y `_std` y reproduce el `PromptDA.forward` oficial, devolviendo un `DepthEstimatorOutput` con `predicted_depth` de forma (B, H, W) en metros. El codigo se ha vendorizado desde DepthAnything/PromptDA en el commit 9161547c, con cambios limitados a imports y al uso de `NestedTensorBlock`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada. El model card indica que las salidas (preprocesado, `predicted_depth`, `predict`, hidden states y autocast fp16) son bit-identicas a las del codigo oficial verificado en una V100. La profundidad se devuelve al tamano de imagen procesado (lado mayor de hasta 1008, multiplos de 14), sin reescalado posterior, tal como en el original.

## Capacidades

- Estimacion de profundidad metrica densa a partir de una imagen RGB y un prompt de profundidad de baja resolucion (por ejemplo, LiDAR de iPhone en metros).
- Procesamiento de prompts de profundidad en formato `.png` (milimetros) o `.npz`, o directamente en metros.
- Salida de profundidad en metros con forma (B, H, W) al tamano de imagen procesado.
- Exposicion de hidden states de DINOv2 mediante `output_hidden_states=True`.
- Compatibilidad con la API de transformers (`AutoModelForDepthEstimation`, `AutoProcessor`) mediante `trust_remote_code`.
- Soporte de autocast fp16 verificado como bit-identico al codigo oficial.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues (es un modelo exclusivamente de vision).

## Casos de uso

- Reconstruccion 3D y fotogrametria: usar el mapa de profundidad metrica junto con la imagen RGB para generar nubes de puntos o mallas en escenarios de interior y exterior, aprovechando la precision metrica que aporta el prompt LiDAR.
- Realidad aumentada en dispositivos moviles: integrar la profundidad de un LiDAR de iPhone (192 x 256) con la camara RGB para colocar objetos virtuales con oclusion correcta y escala metrica real.
- Robotica y navegacion: alimentar el modelo con la camara RGB y un sensor de profundidad de baja resolucion para obtener mapas densos de alta resolucion que permitan planificacion de trayectorias y evitacion de obstaculos.
- Captura de escenas para gemelos digitales: generar profundidad metrica de alta resolucion a partir de capturas RGB y sensores economicos, reduciendo la necesidad de escaneres LiDAR de alta densidad.
- Edicion y composicion de imagen/video: usar la profundidad metrica para desenfocar selectivamente, aplicar efectos de profundidad de campo o segmentar por distancia en postproduccion.
- Vehiculos autonomos y ADAS: combinar camaras RGB con sensores de profundidad de bajo coste para obtener mapas de profundidad densos que complementen la percepcion del entorno.
- Investigacion en vision por computador: servir como linea base reproducible en formato transformers para experimentos de estimacion de profundidad metrica condicionada por prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card unicamente reporta la verificacion de equivalencia bit-identica frente al codigo oficial (preprocesado, `predicted_depth`, `predict`, hidden states y autocast fp16) en una GPU V100, sin cifras de metricas como RMSE, AbsRel o delta thresholds.

## Requisitos de hardware

- VRAM estimada para inferencia: con 25,1 millones de parametros, los pesos en fp32 ocupan aproximadamente 100 MB; en fp16, unos 50 MB. La VRAM adicional depende de las activaciones de DINOv2 ViT-S/14 a resoluciones de hasta 1008 en el lado mayor.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; el model card verifica el funcionamiento en una V100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) e incluso en GPUs de gama baja.
- Opciones de despliegue: transformers con `trust_remote_code=True`; requiere `torch`, `opencv-python` e `imageio`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt-Depth-Anything-Small (este port) | 25.083.079 | Profundidad metrica con prompt | Imagen RGB + prompt de profundidad; lado mayor hasta 1008 | Apache-2.0 | Hugging Face (port no oficial) |
| Prompt Depth Anything original (`depth-anything/prompt-depth-anything-vits`) | no disponible en la informacion | Profundidad metrica con prompt | Igual que el port | Apache-2.0 | Repositorio original DepthAnything/PromptDA |
| Otros modelos de estimacion de profundidad monocular | no disponible | Profundidad relativa o metrica sin prompt | Solo imagen RGB | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un port no oficial: el autor lo declara explicitamente como no oficial y requiere `trust_remote_code=True`, lo que implica ejecutar codigo de terceros.
- Depende de un prompt de profundidad de baja resolucion; sin el, no produce la profundidad metrica para la que fue disenado.
- La profundidad se devuelve al tamano de imagen procesado (lado mayor hasta 1008, multiplos de 14) sin reescalado al tamano original, lo que puede requerir postprocesado en el pipeline del usuario.
- No procesa lenguaje: no tiene capacidades de texto, tool calling, agentes ni multilingues.
- Riesgo de sesgos y alucinacion: no se dispone de informacion especifica sobre sesgos del modelo en la documentacion proporcionada; como todo modelo de vision, puede fallar en escenas fuera de la distribucion de entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener la atribucion indicada en el archivo NOTICE y citar el trabajo original segun pide el autor.
- El repositorio tiene un tamano de 0,1 GB y solo 17 descargas, lo que sugiere poca validacion por parte de la comunidad; conviene verificar el comportamiento en produccion antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/bigshanedogg/Prompt-Depth-Anything-Small
- Modelo base: https://huggingface.co/depth-anything/prompt-depth-anything-vits
- Repositorio oficial: https://github.com/DepthAnything/PromptDA
- Paper: *Prompting Depth Anything for 4K Resolution Accurate Metric Depth Estimation* (CVPR 2025), arXiv (referenciado en el model card)
