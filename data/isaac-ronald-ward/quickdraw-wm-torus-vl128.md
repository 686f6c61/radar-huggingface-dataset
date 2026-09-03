# isaac-ronald-ward/quickdraw-wm-torus-vl128

## Resumen

quickdraw-wm-torus-vl128 es un modelo de mundo latente (latent world model) desarrollado por Isaac Ronald Ward para predicción de video y estados en robótica. El modelo toma 8 pasos de contexto compuestos por un vector propioceptivo (6 dimensiones) y un frame de cámara de 128×128 píxeles, junto con una secuencia de acciones, y predice en bucle abierto (open-loop) los frames y estados futuros sin recibir nuevas observaciones. Está entrenado con la librería `quickdraw` (configuración `mm_flow`, receta `vl128`) sobre el dataset propietario `isaac-ronald-ward/torus-world`.

La relevancia de este modelo radica en su capacidad para simular la dinámica de un entorno robótico específico sin necesidad de un simulador físico, lo que permite planificación y entrenamiento de políticas basado en imaginación. El checkpoint publicado corresponde a la época 0, con métricas de error perceptual (LPIPS) y PSNR que muestran una degradación progresiva con el horizonte de predicción. El repositorio pesa 0,2 GB e incluye pesos en formato safetensors, configuración resuelta, estadísticas de normalización y ejemplos de contexto reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `mm_flow` (modelo de mundo latente, receta `vl128`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8 pasos de observacion (proprio + frame) + hasta 128 pasos de prediccion open-loop |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision y propriocepcion, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (`weights.safetensors`), checkpoint Lightning (`training_state.ckpt`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de modelo de mundo latente denominada `mm_flow` dentro del framework `quickdraw`. La receta `vl128` indica que la cabeza de imagen opera a 128 píxeles de resolución y produce 32 tokens latentes por frame. El modelo codifica los 8 pasos de contexto (vector propioceptivo normalizado y frames normalizados a [0,1]) junto con la secuencia de acciones, y genera una predicción autorregresiva de los siguientes estados y frames sin realimentación de observaciones (open-loop). El entrenamiento se realizó sobre el dataset `isaac-ronald-ward/torus-world`, aunque no se especifican el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO. El checkpoint publicado corresponde a la época 0, seleccionado por el mejor LPIPS@+128 en validación, y se incluye un límite inferior de error dado por el autoencoder (floor LPIPS 0.11964, floor PSNR 18.36 dB), que representa la cota de calidad de reconstrucción de la cabeza de imagen.

## Capacidades

- Prediccion de video en bucle abierto: genera hasta 128 frames futuros de 128×128 píxeles a partir de 8 pasos de contexto y una secuencia de acciones.
- Prediccion de estados propioceptivos: produce los 6 valores del vector de estado (posicion/orientacion) en unidades fisicas mediante desnormalizacion.
- Modelado de dinamica de entorno: captura la transicion de estados y la apariencia visual del entorno `torus-world` sin necesidad de un simulador explicito.
- Rollout imaginativo: permite ejecutar trayectorias completas sin observaciones intermedias, util para planificacion y aprendizaje por refuerzo basado en modelo.
- Integracion con `quickdraw`: API simple de carga y evaluacion (`load_pretrained`, `imagine_eval`) con soporte para decodificacion por fragmentos (`decode_chunk`) para controlar el uso de memoria.
- No incluye capacidades de lenguaje, tool calling, ni procesamiento de vision general fuera del dominio de entrenamiento.

## Casos de uso

- Planificacion de movimiento en robotica: el modelo puede simular mentalmente multiples trayectorias candidatas y seleccionar la que minimice un coste (por ejemplo, distancia al objetivo o evitacion de obstaculos) antes de ejecutarla en el robot real.
- Entrenamiento de politicas con aprendizaje por refuerzo basado en modelo: al generar rollouts imaginativos, permite entrenar politicas sin interaccion directa con el entorno fisico, reduciendo el desgaste y el tiempo de experimentacion.
- Validacion de controladores: se pueden probar controladores en simulacion latente para detectar comportamientos inestables o colisiones antes de desplegarlos en hardware.
- Generacion de datos sinteticos: los frames y estados predichos pueden usarse para aumentar datasets de entrenamiento de otros modulos (percepcion, localizacion, etc.) en el entorno `torus-world`.
- Depuracion de politicas de navegacion: al inspeccionar los rollouts predichos, los desarrolladores pueden identificar fallos de razonamiento temporal o de percepcion en el modelo de mundo.
- Investigacion en modelos de mundo: sirve como punto de partida para estudiar la acumulacion de error en prediccion a largo plazo y para comparar arquitecturas de modelos latentes en entornos roboticos.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la época 0 del checkpoint, evaluados en un episodio de validación retenido. No se proporcionan comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| LPIPS open-loop @+128 (headline) | 0.33974 |
| LPIPS open-loop @+64 | 0.2519 |
| PSNR open-loop @+128 (dB) | 9.63669 |
| LPIPS autoencoder floor (limite perfecto) | 0.11964 |
| PSNR autoencoder floor (dB) | 18.36028 |

Nota: LPIPS menor es mejor; PSNR mayor es mejor. El floor del autoencoder indica la cota inferior de error que cualquier modelo de dinamica perfecta alcanzaria dado el codificador/decodificador. El error crece con el horizonte, como se observa al comparar @+64 y @+128.

## Requisitos de hardware

- Tamano del repositorio: 0,2 GB, lo que sugiere un modelo de pequenas dimensiones, probablemente ejecutable en GPUs de consumo (p. ej., RTX 3060 o superior), aunque no se proporciona una cifra exacta de VRAM.
- La decodificacion de imagenes consume aproximadamente el 78% de la memoria por muestra; se recomienda usar `decode_chunk=16` para horizontes largos y evitar OOM.
- No se especifican GPUs concretas ni latencia/throughput. El despliegue se realiza mediante la libreria `quickdraw` (PyTorch) y requiere CUDA (el ejemplo usa `device="cuda"`).
- Opciones de despliegue: integracion directa en pipelines de PyTorch con `quickdraw`; no se mencionan adaptaciones a vLLM, llama.cpp u Ollama, dado que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo esta especializado en el entorno `torus-world` y no se ofrecen datos de rendimiento frente a otros world models (p. ej., Dreamer, IRIS, o modelos de video generativos). Se recomienda consultar la literatura de modelos de mundo para robotica si se necesita una comparativa externa.

## Limitaciones y advertencias

- Especificidad del entorno: el modelo fue entrenado exclusivamente en `torus-world`; su uso en otros entornos roboticos requiere reentrenamiento o fine-tuning.
- Error acumulativo en open-loop: la calidad de prediccion se degrada con el horizonte (LPIPS pasa de 0.2519 a 0.33974 entre +64 y +128), lo que limita la fiabilidad de rollouts muy largos.
- Riesgo de "garbage plausible": si los vectores no se normalizan correctamente (proprio a traves de `norm_obs`/`denorm_obs`, frames en [0,1]), el modelo produce salidas visualmente plausibles pero incorrectas sin generar errores.
- Contexto limitado: solo 8 pasos de observacion como entrada; no captura dependencias temporales mas alla de esa ventana.
- Sin capacidades de lenguaje ni interaccion multimodal: no puede procesar instrucciones textuales ni dialogar.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El checkpoint publicado es de la epoca 0, no el mejor de cada metrica; los valores de LPIPS/PSNR pueden mejorar con epocas posteriores, pero no se publican esos pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/isaac-ronald-ward/quickdraw-wm-torus-vl128
- Repositorio de la libreria `quickdraw`: https://github.com/isaac-ward/quickdraw
- Documentacion de uso de modelos preentrenados: https://github.com/isaac-ward/quickdraw/blob/main/docs/using_pretrained_models.md
- Perfil del autor en Hugging Face: https://huggingface.co/isaac-ronald-ward
- Perfil del autor en GitHub: https://github.com/isaac-ward
- Articulo relacionado del autor (exploracion robotica): https://arxiv.org/abs/2509.13342
