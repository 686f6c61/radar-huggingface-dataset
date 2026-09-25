# Nicholas0228/SiT-IBOT

## Resumen

SiT-IBOT es un repositorio de checkpoints de investigación, no un modelo final empaquetado para producción. Contiene el archivo de 577 checkpoints de experimentos sobre ImageNet de la línea de trabajo SiT-IBOT, que combina los Scalable Interpolant Transformers (SiT) con objetivos de aprendizaje auto-supervisado de tipo iBOT sobre el token CLS. Lo mantiene el usuario Nicholas0228 (Nicholas Wu), investigador junior en IA fiable, y su propósito es documentar y reproducir comparativas de ablación entre una línea base y una variante con alineamiento CLS entre vistas.

El problema que aborda es de investigación: evaluar si añadir objetivos de representación auto-supervisada (alineamiento de parches en la misma vista y alineamiento CLS entre vistas) mejora un modelo generativo de difusión/flow matching entrenado sobre ImageNet. La relevancia es, por tanto, reproducibilidad y estudio académico; no hay benchmarks publicados, ni pipeline Diffusers, ni exportación a safetensors.

La arquitectura de los checkpoints principales es SelfFlowDiT-XL/2, un Diffusion Transformer con formulación de interpolante y velocidad lineal. El repositorio completo previsto ocupa aproximadamente 1,93 TB; en el momento de la última actualización solo había 5,5 GB subidos, por lo que la descarga completa está en curso. No se dispone de datos de licencia, idiomas ni parámetros publicados por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SelfFlowDiT-XL/2 (Diffusion Transformer con interpolante de velocidad lineal; nomenclatura XL/2 heredada de DiT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints PyTorch en precisión de entrenamiento, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (generación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (state dict de PyTorch con metadatos Python); no hay safetensors ni pipeline Diffusers |
| Tamano de los checkpoints principales | 2.721.817.888 bytes (línea base, 1M pasos) y 2.743.066.840 bytes (método, 1M pasos) |
| Tamano del repositorio | 5,5 GB subidos; archivo completo previsto de ~1,93 TB con 577 checkpoints |
| Fecha de creacion en HuggingFace | 24 de septiembre de 2026 |
| Ultima actualizacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

Los checkpoints principales usan el backbone SelfFlowDiT-XL/2, una variante de Diffusion Transformer con formulación de interpolante (flow matching) y velocidad lineal, tal como indica el sufijo `Linear-velocity` en las rutas. El modelo trabaja con un token CLS y un objetivo generativo de dos vistas emparejadas, con un peso de alineamiento de parches en la misma vista de 0,8. La variante de método añade además alineamiento CLS entre vistas en el bloque 18 con peso 0,2, mientras que en la línea base el peso del CLS es cero. Para el muestreo y la evaluación debe usarse la entrada `ema` del checkpoint.

El entrenamiento se realiza sobre ImageNet (y depende también de datos VOC como dependencia externa), con 1M de pasos documentados en los checkpoints principales. No se menciona RLHF ni DPO, algo esperable en un modelo generativo de imágenes. El VAE latente es `stabilityai/sd-vae-ft-ema`, una dependencia externa no incluida en el repositorio. Los ficheros principales de 1M han eliminado los estados de estudiante y de optimizador; los checkpoints completos posteriores sí los conservan para continuar el entrenamiento. El archivo mezcla contenidos de checkpoint distintos y documenta el contenido podado allí donde existen manifiestos (`checkpoint_manifest.csv` y `checkpoint_inventory.csv`).

## Capacidades

- Generación de imágenes condicionada por clase sobre ImageNet (los checkpoints están entrenados para esta tarea).
- Aprendizaje de representaciones visuales de tipo iBOT: el token CLS y el alineamiento entre vistas producen características auto-supervisadas utilizables en tareas posteriores.
- Muestreo mediante pesos EMA, que el autor indica como la vía recomendada para evaluación.
- Comparación controlada línea base frente a método para estudiar el efecto del alineamiento CLS entre vistas (ablación reproducible).
- Reanudación de entrenamiento en los checkpoints completos que conservan estados de estudiante y optimizador.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de texto: no es un modelo de lenguaje.
- No incluye modo thinking, audio ni comprensión visual de imágenes (es un generador, no un VLM).

## Casos de uso

- Reproducción de experimentos académicos: descargar los checkpoints de línea base y de método y repetir la comparativa de ablación con los mismos pasos de entrenamiento declarados.
- Extracción de características visuales: usar las representaciones del token CLS como embeddings preentrenados para clasificación lineal o fine-tuning en tareas de visión por computador.
- Estudio de objetivos auto-supervisados en modelos generativos: analizar el efecto del peso de alineamiento de parches (0,8) y del alineamiento CLS (0,2 en el bloque 18) sobre la calidad de generación.
- Benchmarking interno de arquitecturas DiT/SiT: comparar variantes del propio repositorio bajo una misma receta de datos y pasos, ya que el archivo conserva checkpoints intermedios y de ablación.
- Investigación en destilación y compresión: los checkpoints intermedios permiten estudiar trayectorias de entrenamiento y elegir puntos de partida para destilar modelos más pequeños.
- Generación de datos sintéticos para investigación: producir muestras condicionadas por clase de ImageNet para aumentar conjuntos de entrenamiento en experimentos controlados.
- Análisis de dinámica de entrenamiento: los manifiestos `checkpoint_manifest.csv` e `checkpoint_inventory.csv` permiten reconstruir qué configuración de lanzamiento produjo cada checkpoint.
- Docencia y divulgación: ilustrar cómo se integra un objetivo tipo iBOT en un transformer de difusión con código PyTorch propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de FID, IS, precisión de clasificación lineal ni métricas comparativas en la model card, y el repositorio está en fase de subida en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada: a partir del tamaño del checkpoint principal (2,72 GB), los pesos ocupan unos 2,7 GB en fp32 y unos 1,4 GB en fp16. Sumando activaciones para el muestreo a resolución ImageNet, un presupuesto de 6 a 10 GB de VRAM es razonable. Es una estimación derivada del tamaño de fichero, no un dato oficial del autor.
- GPU recomendadas para inferencia: RTX 3090, RTX 4090, A100 o H100 para lotes grandes; el modelo debería caber sin problema en cualquier GPU con 8 GB o más.
- GPU para entrenamiento o reanudación: se recomienda A100/H100 por el coste de reentrenar 1M pasos y por el tamaño del estado de optimizador en los checkpoints completos.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: no hay pipeline Diffusers ni exportación ONNX/safetensors, por lo que el despliegue exige cargar los `.pt` con PyTorch y ejecutar el código de muestreo del repositorio `github.com/Nicholas0228/SiT-IBOT`. vLLM, llama.cpp, Ollama y TGI no son aplicables porque están orientados a modelos de lenguaje.
- Dependencias externas obligatorias: datos ImageNet/VOC y el VAE `stabilityai/sd-vae-ft-ema`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SiT-IBOT (este repo) | Checkpoints de investigacion SiT + iBOT | no disponible | no disponible | PyTorch `.pt` | 5,5 GB subidos de ~1,93 TB; subida en curso |
| SiT (willisma/SiT) | Implementacion oficial de Scalable Interpolant Transformers | no disponible | no disponible | PyTorch | Repositorio publico con pesos y codigo de entrenamiento |
| DiT (Diffusion Transformer) | Familia de referencia sobre la que se apoya la nomenclatura XL/2 | no disponible | no disponible | PyTorch | Publico, ampliamente usado como baseline |
| iBOT | Preentrenamiento auto-supervisado de representaciones visuales | no disponible | no disponible | PyTorch | Publico; es el origen del objetivo CLS empleado aqui |

No hay datos suficientes en la información proporcionada para comparar parámetros, contexto o rendimiento numérico entre estas alternativas. La relación documentada es que SiT-IBOT parte del backbone SiT (implementación oficial en `willisma/SiT`) e incorpora un objetivo de representación inspirado en iBOT.

## Limitaciones y advertencias

- Es un archivo de checkpoints de investigación con contenido mixto: incluye checkpoints intermedios y de ablación, no 577 modelos finales independientes.
- Los dos ficheros principales de 1M pasos tienen eliminados los estados de estudiante y de optimizador, por lo que no sirven para reanudar el entrenamiento tal cual.
- Licencia no disponible: no puede asumirse uso comercial. Cualquier explotación comercial requiere contactar con el autor.
- No existe pipeline Diffusers, ni safetensors, ni documentación de despliegue; la integración depende de código PyTorch propio y de que el repositorio de GitHub sea accesible (el aviso indica que el acceso puede estar restringido).
- Estado de subida: en la fecha de actualización solo había 5,5 GB de los ~1,93 TB previstos, por lo que muchas rutas del manifiesto pueden no estar descargables todavía.
- Dependencias externas no incluidas: ImageNet, VOC y el VAE `sd-vae-ft-ema`.
- No hay benchmarks publicados, así que no es posible validar la calidad de generación ni el rendimiento de las representaciones frente a alternativas.
- Al estar entrenado sobre ImageNet, hereda los sesgos de clase, representación y anotación de ese conjunto de datos.
- El riesgo de alucinación en el sentido de los modelos de lenguaje no aplica; en su lugar, pueden aparecer artefactos, colapso de modo y baja diversidad en las muestras, algo habitual en modelos generativos.
- No soporta texto, instrucciones ni múltiples idiomas, por lo que no puede usarse en escenarios conversacionales ni de agentes.
- Al tratarse de un trabajo de un investigador individual y sin métricas publicadas, no se recomienda su uso en producción sin una evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nicholas0228/SiT-IBOT
- Repositorio del autor en GitHub: https://github.com/Nicholas0228/SiT-IBOT (acceso potencialmente restringido)
- Perfil de GitHub del autor: https://github.com/Nicholas0228
- Gists del autor: https://gist.github.com/Nicholas0228
- Implementación oficial de SiT: https://github.com/willisma/SiT
- Busqueda de modelos iBOT en HuggingFace: https://huggingface.co/models?search=iBOT
- VAE dependiente: https://huggingface.co/stabilityai/sd-vae-ft-ema
