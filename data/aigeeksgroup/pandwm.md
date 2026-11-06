# AIGeeksGroup/PanDWM

## Resumen

PanDWM (Panoramic 4D Driving World Models) es un modelo del mundo generativo orientado a conduccion autonoma, desarrollado por AIGeeksGroup. Su funcion es generar video panoramico de 360 grados de escenas de conduccion y, a partir de los fotogramas generados, elevarlos a representaciones 3D y 4D mediante Gaussian splatting. El modelo se publica como un conjunto de checkpoints para investigacion en generacion y reconstruccion de escenas dinamicas de conduccion.

El sistema se compone de tres piezas: un modelo de video autorregresivo que genera cada ventana en cuatro pasos de denoising, un decodificador feed-forward de gaussianas que convierte los fotogramas en 3D/4D Gaussians y un refiner de render para vistas desplazadas lateralmente. El modelo de video y el refiner derivan de Stable Diffusion 3.5 Medium, por lo que heredan su VAE y sus codificadores de texto.

Es relevante porque aborda la generacion de video panoramico con consistencia 3D/4D, un paso necesario para simulacion y validacion de sistemas de percepcion en conduccion autonoma. El repositorio ocupa 27,4 GB e incluye pesos en formato PyTorch state dict; no se han publicado resultados de benchmarks ni una model card con especificaciones de arquitectura detalladas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de video derivado de Stable Diffusion 3.5 Medium, con decodificador feed-forward de Gaussian splatting 3D/4D y refiner de render |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en precision original, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible (la entrada de texto depende de los codificadores de texto de SD 3.5 Medium) |
| Licencia | Stability AI Community License (para el modelo de video y el refiner); el resto de pesos sujeto a sus propias licencias |
| Formato de pesos | PyTorch state dict (`.pth` guardados con `torch.save`) |

## Arquitectura y entrenamiento

PanDWM se organiza en tres componentes con checkpoints separados. El modelo de video (`pandwm_video_v84i4250_ema.pth`, 13 GB) es un estudiante autorregresivo que genera video panoramico de 360 grados en cuatro pasos de denoising por ventana, con pesos EMA del paso de entrenamiento 4250. El decodificador de gaussianas (`pandwm_gs_decoder_G3b_2000.pth`, 220 MB) es un modulo feed-forward que eleva los fotogramas generados a 3D y 4D Gaussians. El refiner de render (`pandwm_render_refiner_v1_4000.pth`, 13,6 GB) corrige vistas desplazadas lateralmente.

El modelo de video y el refiner se construyen sobre Stable Diffusion 3.5 Medium, de la que toman el VAE y los codificadores de texto; dichos pesos no se redistribuyen y deben descargarse por separado. El etiquetado de rango de las gaussianas utiliza Depth Anything 3 (`DA3-LARGE-1.1` y `DA3METRIC-LARGE`). El entrenamiento y la evaluacion emplean el dataset nuScenes bajo sus terminos de uso. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de video panoramico de 360 grados de escenas de conduccion, con cuatro pasos de denoising por ventana.
- Generacion autorregresiva de video por ventanas sucesivas.
- Elevacion de fotogramas generados a 3D Gaussians y 4D Gaussians mediante un decodificador feed-forward.
- Refinado de render para vistas desplazadas lateralmente.
- Etiquetado de rango de las gaussianas mediante Depth Anything 3.
- Evaluacion con metricas FVD (I3D), FID (Inception) y LPIPS (VGG).
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, vision de entrada, audio ni capacidades multilingues especificas.

## Casos de uso

- Simulacion de escenarios de conduccion: el modelo genera video panoramico 360 grados que puede alimentar simuladores para probar sistemas de percepcion en condiciones reproducibles, aprovechando la cobertura completa del entorno.
- Generacion de datos sinteticos para percepcion: los fotogramas generados y sus gaussianas 3D/4D asociadas permiten aumentar datasets de conduccion con escenas nuevas, util cuando la recoleccion real es costosa.
- Reconstruccion y novedosa vista: el decodificador de gaussianas y el refiner de vistas desplazadas permiten sintetizar puntos de vista laterales no presentes en la captura original, util para evaluar robustez de modelos de percepcion.
- Investigacion en modelos del mundo: el checkpoint sirve como base para estudiar generacion de video con consistencia 3D/4D y para comparar estrategias de denoising en pocos pasos.
- Validacion de pipelines de conduccion autonoma: las escenas generadas pueden usarse en pruebas de regresion de planificadores y detectores antes de despliegues en vehiculo.
- Docencia y divulgacion: el modelo permite demostrar la relacion entre generacion de video y representaciones gaussianas en entornos de investigacion con nuScenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; los checkpoints suman aproximadamente 26,8 GB en precision original (13 GB del modelo de video, 13,6 GB del refiner y 220 MB del decodificador), a lo que hay que anadir el VAE y los codificadores de texto de SD 3.5 Medium.
- GPU recomendadas: no disponible; por el tamano de los pesos, se requiere al menos una GPU de clase profesional con memoria suficiente para cargar el modelo de video y el refiner.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecucion en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante los scripts del repositorio de codigo con PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PanDWM | no disponible | no disponible | Video panoramico 360 grados con Gaussians 3D/4D para conduccion | Stability AI Community License | Checkpoints en Hugging Face |
| Stable Diffusion 3.5 Medium | no disponible | no disponible | Difusion texto-a-imagen base | Stability AI Community License | Pesos publicos en Hugging Face |
| Depth Anything 3 (DA3-LARGE-1.1) | no disponible | no disponible | Estimacion de profundidad | no disponible | Pesos publicos en Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos del mundo para conduccion en la informacion proporcionada, por lo que la comparativa se limita a los componentes de los que depende PanDWM.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni una evaluacion cuantitativa en la informacion disponible, lo que impide validar su rendimiento frente a alternativas.
- La model card no documenta sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto o idioma.
- El modelo de video y el refiner estan sujetos a la Stability AI Community License, con posibles restricciones para uso comercial; debe revisarse el acuerdo antes de cualquier despliegue productivo.
- Los pesos de terceros (SD 3.5 Medium, Depth Anything 3, I3D) no se redistribuyen y mantienen sus propias licencias, lo que anade obligaciones adicionales.
- El entrenamiento y la evaluacion usan nuScenes bajo sus terminos de uso, lo que puede condicionar la redistribucion de datos derivados.
- El repositorio ocupa 27,4 GB y requiere descargar pesos adicionales de terceros, lo que eleva los requisitos de almacenamiento y de gestion de dependencias.
- No se documentan cuantizaciones ni formatos ligeros, lo que dificulta su despliegue en hardware limitado.
- La licencia del dataset asociado en Hugging Face es CC-BY-NC-SA-4.0, lo que restringe el uso comercial de esos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIGeeksGroup/PanDWM
- Repositorio de codigo: https://github.com/AIGeeksGroup/PanDWM
- Dataset asociado: https://huggingface.co/datasets/AIGeeksGroup/PanDWM
- Stable Diffusion 3.5 Medium: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Depth Anything 3 (DA3-LARGE-1.1): https://huggingface.co/depth-anything/DA3-LARGE-1.1
- Depth Anything 3 (DA3METRIC-LARGE): https://huggingface.co/depth-anything/DA3METRIC-LARGE
- Codigo de Depth Anything 3: https://github.com/ByteDance-Seed/Depth-Anything-3
- I3D (TATS): https://github.com/songweige/TATS
- Licencia Stability AI Community: https://stability.ai/community-license-agreement
- Dataset nuScenes: https://www.nuscenes.org/
