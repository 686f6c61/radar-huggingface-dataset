# ecnu-icalk/ArgoWM

## Resumen

AgroWM (Agricultural World Model) es un modelo de investigación desarrollado por el grupo ECNU-ICALK que predice la evolución visual de plantas de arroz y maíz a partir de una única fotografía. El sistema se compone de dos módulos encadenados: PhenoClock, un adaptador sobre Qwen3.8-27B que razona sobre el estado de desarrollo fenológico de la planta y genera un "Growth Script" (guion de crecimiento con objetivos de altura, área, color y órganos), y Rooted Renderer, un modelo de edición de imagen basado en Qwen-Image-2.1 que renderiza la apariencia futura respetando la identidad y el punto de vista de la planta original.

El modelo aborda un problema poco explorado: los world models aplicados a sistemas biológicos de crecimiento lento, donde la predicción no es de dinámica física inmediata sino de desarrollo morfológico a lo largo de días o meses. Es relevante para investigación agronómica, fenotipado de alto rendimiento y modelado de cultivos, y demuestra que un enfoque de razonamiento intermedio explícito (el Growth Script) mejora métricas de fidelidad visual y de clasificación de etapa frente a un fine-tuning directo del backbone de imagen.

La arquitectura es un pipeline híbrido de dos etapas (VLM de razonamiento + modelo de difusión de edición de imagen), con pesos publicados en formato safetensors para la librería diffusers. El repositorio ocupa 29,9 GB y los cuatro ficheros de parámetros liberados suman aproximadamente 30 GB. Los modelos de arroz y maíz se entrenan de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: PhenoClock (adaptador sobre Qwen3.8-27B) + Rooted Renderer (edicion de imagen sobre Qwen-Image-2.1) |
| Parametros totales | no disponible (pesos liberados ~30 GB en 4 ficheros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | agrowm-apache-2.0-and-qwen-research (codigo y adaptadores PhenoClock: Apache-2.0; pesos Rooted Renderer: Qwen Research License, solo uso no comercial) |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

AgroWM es un sistema en cascada con dos componentes. PhenoClock, construido sobre Qwen3.8-27B, recibe la imagen de la planta e infiere primero la etapa de crecimiento actual, después predice la etapa futura y finalmente escribe un Growth Script estructurado con objetivos cuantitativos de altura, área foliar, color y órganos. Rooted Renderer, construido sobre Qwen-Image-2.1 (modelo de difusion para edicion de imagen), toma ese guion como condicionamiento y edita la fotografía original preservando la identidad de la planta y el punto de vista de la cámara. El pipeline se registra como tarea image-to-image en diffusers.

El entrenamiento se realiza por separado para arroz y maíz, sobre pares de imágenes de plantas con fondo blanco. La innovación principal es el razonamiento intermedio explícito: en lugar de un fine-tuning directo del backbone de imagen (la línea base "Simple FT"), el modelo descompone la tarea en predicción simbólica de desarrollo y renderizado condicionado. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO en la documentación proporcionada.

## Capacidades

- Predicción de crecimiento vegetal a partir de una sola imagen: estima la apariencia futura de la planta en un horizonte de días a meses.
- Razonamiento sobre desarrollo fenológico: identifica etapa actual, proyecta etapa futura y genera un Growth Script con objetivos medibles.
- Edición de imagen condicionada: modifica la fotografía original preservando identidad y encuadre de la planta.
- Especialización en dos cultivos: arroz y maíz, con modelos entrenados de forma independiente.
- Salida estructurada intermedia (Growth Script) auditable y reutilizable.
- Capacidad de recuperación de etapa (Stage R@1) sobre secuencias observadas de la misma planta.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking explícito.
- Capacidades multilingües limitadas al inglés en la documentación y prompts.

## Casos de uso

- Fenotipado de alto rendimiento en invernadero: dado un conjunto de fotografías de plantas con fondo blanco, el modelo proyecta su desarrollo futuro y permite priorizar muestras para medición manual, reduciendo coste de seguimiento experimental.
- Investigación agronómica sobre dinámica de cultivos: simular trayectorias de crecimiento bajo distintos genotipos o tratamientos para generar hipótesis antes de ensayos de campo.
- Validación de modelos de simulación de cultivos: comparar las predicciones visuales de AgroWM con salidas de modelos procesuales (DSSAT, APSIM) para detectar discrepancias morfológicas.
- Generación de datos sintéticos etiquetados: producir secuencias de imágenes de crecimiento con etapa conocida para aumentar datasets de entrenamiento de clasificadores fenológicos.
- Docencia y divulgación en ciencias agrarias: ilustrar cómo evoluciona una planta a lo largo de su ciclo a partir de una imagen inicial.
- Evaluación de estrés o anomalías: comparar la predicción de crecimiento esperado con la observación real para detectar desviaciones tempranas en estudios controlados.
- Prototipado de asistentes visuales para agricultura de precisión en entorno de laboratorio, siempre que las imágenes cumplan el supuesto de fondo blanco.

## Benchmarks y rendimiento

Resultados reportados en el paper (comparación con el mismo backbone de imagen afinado sin Growth Scripts, "Simple FT"):

| Cultivo | Metodo | DINO ↑ | Error de area ↓ | Error de altura ↓ | Stage R@1 (%) ↑ |
|---|---|---:|---:|---:|---:|
| Arroz | Simple FT | 0.834 | 3.73 | 7.83 | 47.4 |
| Arroz | AgroWM | 0.860 | 3.51 | 7.43 | 54.6 |
| Maiz | Simple FT | 0.764 | 1.97 | 11.12 | 30.1 |
| Maiz | AgroWM | 0.795 | 1.73 | 10.61 | 30.9 |

En el horizonte de 9 a 20 semanas en arroz, AgroWM alcanza un 46,4 % de Stage R@1 frente al 35,7 % de Simple FT. Los errores de área y altura son errores proxy sobre imagen en puntos porcentuales; Stage R@1 mide si el pronóstico recupera la etapa objetivo a partir de la secuencia de imágenes observadas de la misma planta.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los pesos liberados suman ~30 GB en precisión completa, lo que exige al menos 40-80 GB de VRAM para inferencia sin cuantización, dependiendo del componente cargado simultáneamente.
- GPU recomendadas: NVIDIA A100 (40/80 GB) o H100 para ejecutar ambos componentes sin cuantización; se requiere entorno Linux, Python 3.12 y GPU NVIDIA según la documentación.
- GPU de consumo: no se documenta viabilidad en RTX 4090 (24 GB) con los pesos completos; requeriría cuantización no publicada.
- Opciones de despliegue: el repositorio usa la librería diffusers y el código propio en GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Inferencia: el modelo se marca como `inference: false` en Hugging Face; requiere descarga manual de los dos modelos base (Qwen3.8-27B y Qwen-Image-2.1) además de los checkpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgroWM | no disponible (~30 GB pesos) | no disponible | Prediccion de crecimiento vegetal (imagen a imagen) | Apache-2.0 + Qwen Research (no comercial) | Hugging Face, diffusers |
| Simple FT (mismo backbone) | no disponible | no disponible | Prediccion de crecimiento vegetal | no disponible | Baseline del paper |
| Qwen-Image-2.1 (base) | no disponible | no disponible | Edicion y generacion de imagen general | Qwen Research | Hugging Face |
| Qwen3.8-27B (base) | 27B | no disponible | VLM de razonamiento general | Qwen Research | Hugging Face |

No se identifican en la información proporcionada otros world models agrícolas directamente comparables con métricas publicadas; la comparación principal disponible es contra el fine-tuning directo del mismo backbone.

## Limitaciones y advertencias

- Entrenado exclusivamente con imágenes de arroz y maíz sobre fondo blanco; escenas de campo y otros cultivos requieren validación adicional.
- Los modelos de arroz y maíz son independientes: no hay un modelo único que cubra ambos cultivos.
- El pipeline está marcado como `inference: false`; requiere descargar los modelos base por separado y ejecutar código propio, sin integración lista para producción.
- Licencia mixta: los pesos del Rooted Renderer están bajo Qwen Research License, restringida a investigación y evaluación no comercial. El uso comercial requiere revisar LICENSES.md.
- Idioma de prompts y documentación limitado al inglés.
- Riesgo de alucinación visual: al ser un modelo generativo, puede producir apariencias plausibles pero incorrectas, especialmente fuera del dominio de entrenamiento.
- Métricas de área y altura son proxies sobre imagen, no mediciones físicas calibradas.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto limitado de cultivos y condiciones controladas, la generalización es reducida.
- El repositorio de 29,9 GB y la necesidad de dos modelos base adicionales elevan los requisitos de almacenamiento y cómputo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ecnu-icalk/ArgoWM
- Paper (arXiv): https://arxiv.org/abs/2611.26145
- Codigo en GitHub: https://github.com/ECNU-ICALK/ArgoWM
- Issues: https://github.com/ECNU-ICALK/ArgoWM/issues
- Licencias: https://huggingface.co/ecnu-icalk/ArgoWM/blob/main/LICENSES.md
- Modelo base PhenoClock: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base Rooted Renderer: https://huggingface.co/Qwen/Qwen-Image-2.1
