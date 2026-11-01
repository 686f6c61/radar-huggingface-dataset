# Lin-Wang-NUS/ADM

## Resumen

ADM priors es una colección de pesos de modelos de difusión basados en la arquitectura ADM (guided-diffusion UNet), publicada por el grupo Lin-Wang-NUS. No se trata de un modelo generativo de propósito general, sino de un conjunto de priors entrenados específicamente para servir como línea base en problemas inversos de imagen, concretamente en el marco de los métodos de difusión "en caliente" (hot-diffusion) como DPS, ΠGDM, DDRM o DAPS. Los pesos están pensados para emparejarse con los priors IHDM del mismo autor, entrenados sobre los mismos datos, de modo que las comparaciones entre métodos sean justas.

El repositorio contiene dos familias de priors: uno entrenado sobre ImageNet-100 a resolución 128 y otro sobre fastMRI de rodilla (magnitud) a resolución 320, este último en dos variantes de tamaño (~100M y ~50M de parámetros). Cada subcarpeta incluye los pesos finales y una versión con media móvil exponencial (EMA) de los pesos, que es la que habitualmente se emplea en inferencia por su mayor estabilidad.

La relevancia de este modelo es metodológica: proporciona checkpoints reproducibles para evaluar y comparar técnicas de reconstrucción basadas en difusión en tareas de imagen natural y resonancia magnética acelerada. El tamaño del repositorio (7,9 GB) refleja la inclusión de múltiples variantes de pesos. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión guiada (ADM, guided-diffusion) |
| Parametros totales | ~100M (variante fastMRI 100m); ~50M (variante fastMRI 50m); no disponible para ImageNet-100 128 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión sobre imágenes, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` y `.pt` (PyTorch); los `*_ema.pt` contienen los pesos EMA |

## Arquitectura y entrenamiento

La arquitectura es una UNet de difusión del tipo ADM (guided-diffusion), el diseño introducido por Dhariwal y Nichol, que combina bloques residuales, atención multi-cabeza a varias resoluciones y condicionamiento por nivel de ruido. Es la arquitectura canónica empleada como prior en la mayoría de métodos de difusión para problemas inversos, lo que explica su uso como línea base.

Los datos de entrenamiento se describen por subcarpeta: ImageNet-100 a 128×128 para el prior de imagen natural, y fastMRI de rodilla en magnitud a 320×320 para el prior de resonancia. El autor indica que estos priors se entrenaron sobre los mismos datos que los priors IHDM correspondientes, con el objetivo de aislar el efecto del método de reconstrucción frente al del prior. No se detalla en la información disponible el número de tokens/pasos de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste fino adicionales. Se proporcionan pesos EMA, práctica estándar en difusión para mejorar la calidad de muestreo.

## Capacidades

- Modelado generativo de imágenes mediante difusión: muestreo desde ruido gaussiano hasta imágenes en las resoluciones indicadas (128×128 y 320×320).
- Actuación como prior en problemas inversos: reconstrucción de imágenes a partir de observaciones degradadas (ruido, submuestreo, borrosidad) cuando se combina con métodos como DPS, ΠGDM, DDRM o DAPS.
- Reconstrucción de resonancia magnética acelerada: la variante fastMRI está entrenada sobre imágenes de rodilla en magnitud, adecuada para tareas de reconstrucción con submuestreo en el espacio k.
- Generación condicionada por nivel de ruido: el condicionamiento temporal propio de ADM permite integrarse en esquemas de difusión inversa y en muestreadores tipo predictor-corrector.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Evaluación comparativa de métodos de problemas inversos: usar los priors ADM como línea base "hot-diffusion" frente a los priors IHDM sobre los mismos datos, permitiendo comparaciones controladas de DPS, ΠGDM, DDRM y DAPS sin confundir el efecto del prior con el del algoritmo.
- Reconstrucción de imagen natural degradada: aplicar el prior de ImageNet-100 128 para tareas de eliminación de ruido, inpainting o superresolución en imágenes de 128×128 dentro de un pipeline de difusión inversa.
- Reconstrucción de resonancia magnética acelerada: emplear la variante fastMRI 320 para reconstruir imágenes de rodilla a partir de datos submuestreados del espacio k, un escenario clásico en investigación de imagen médica.
- Reproducción de resultados académicos: los checkpoints permiten replicar experimentos publicados que usan ADM como prior, facilitando la verificación de resultados por terceros.
- Estudio del efecto del tamaño del prior: las variantes de ~50M y ~100M de fastMRI permiten analizar el compromiso entre capacidad del modelo y calidad de reconstrucción.
- Desarrollo y depuración de muestreadores: sirven como banco de pruebas para nuevos esquemas de muestreo en difusión (predictor-corrector, decodificación guiada) antes de aplicarlos a dominios específicos.
- Comparación de pesos EMA frente a pesos finales: la disponibilidad de ambas versiones permite estudiar su impacto en la calidad de la reconstrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los pesos (hasta ~100M de parámetros en la variante mayor de fastMRI, y un tamaño de repositorio de 7,9 GB que incluye múltiples checkpoints), la inferencia de un único prior cabe holgadamente en GPUs de consumo, aunque el consumo real depende del muestreador y del número de pasos.
- GPUs recomendadas: no especificadas por el autor; por tamaño de modelo, una RTX 4090 o incluso GPUs de gama media serían suficientes para un único prior, mientras que A100/H100 resultan útiles para barridos de hiperparámetros y evaluaciones a gran escala.
- Cabe en GPU de consumo: sí, previsiblemente, para un único prior y resolución indicada; no confirmado por el autor.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) y `huggingface_hub.hf_hub_download`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ADM priors (este modelo) | UNet ADM | ~50M/~100M (fastMRI); no disponible (ImageNet-100) | 128 / 320 | Apache 2.0 | HuggingFace |
| IHDM priors (Lin-Wang-NUS/IHDM) | no disponible en la información | no disponible | 128 / 320 (mismos datos) | no disponible en la información | HuggingFace |
| Guided-diffusion ADM original (OpenAI) | UNet ADM | no disponible en la información | 256 / 512 | no disponible en la información | Repositorio oficial de OpenAI |

La comparación directa con otros priors de difusión para problemas inversos no está disponible en la información proporcionada; el propio autor presenta IHDM como el contrapunto metodológico de estos ADM priors.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto, no razona y no admite instrucciones; su uso está restringido a difusión sobre imágenes y a problemas inversos.
- Dominios limitados: solo cubre ImageNet-100 a 128×128 y fastMRI de rodilla a 320×320; no se debe esperar buen rendimiento fuera de estos dominios o resoluciones.
- Sesgos de los datos: al entrenarse sobre ImageNet-100 y fastMRI, hereda los sesgos de composición y adquisición de esos conjuntos, incluida la sobrerrepresentación de ciertas clases y protocolos de imagen médica.
- Riesgo de alucinación visual: como todo prior generativo, puede producir reconstrucciones plausibles pero inexactas en problemas inversos mal condicionados, lo que es especialmente crítico en imagen médica.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datasets subyacentes (ImageNet-100 y fastMRI) antes de un despliegue en producción.
- Sin datos de benchmarks ni de latencia: no es posible estimar de antemano la calidad de reconstrucción ni el coste computacional sin ejecutar evaluaciones propias.
- Repositorio con múltiples checkpoints: es necesario seleccionar correctamente la subcarpeta y la variante (EMA o no, 50m o 100m) para evitar emparejamientos incorrectos en experimentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lin-Wang-NUS/ADM
- Priors IHDM relacionados: https://huggingface.co/Lin-Wang-NUS/IHDM
