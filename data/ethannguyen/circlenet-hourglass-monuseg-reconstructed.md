# EthanNguyen/CircleNet-Hourglass-MoNuSeg-Reconstructed

## Resumen

CircleNet-Hourglass-MoNuSeg-Reconstructed es un checkpoint de pesos (no un modelo de lenguaje) para la arquitectura CircleNet con backbone Hourglass de dos stacks, entrenado sobre una reconstruccion de los splits del dataset MoNuSeg (segmentacion de nucleos en imagenes histopatologicas). Lo publica el usuario EthanNguyen en Hugging Face y esta pensado para usarse con el codigo original de CircleNet del repositorio hrlblab/CircleNet, no con un pipeline de Transformers. El checkpoint se denomina `hourglass_coco_best.pth` y ocupa 0,8 GB en el repositorio.

El modelo aborda la deteccion y segmentacion de nucleos celulares mediante deteccion de objetos con representacion circular (CircleNet), lo que resulta relevante para pipelines de patologia digital y analisis cuantitativo de tejidos. La evaluacion estandar sobre 140 parches reporta 44,2 AP, 82,1 AP50 y 43,3 AP75. El autor advierte explicitamente de que los recortes, splits y etiquetas derivadas de XML difieren del benchmark historico, por lo que estas cifras no reproducen los resultados del paper original.

Se trata de un artefacto de investigacion de un unico entrenamiento en una RTX 3090, sin checkpoint DLA ni resultados de consistencia a rotacion. No hay informacion sobre licencia propia del checkpoint, idiomas ni cuantizaciones, y el rehosting no concede derechos adicionales sobre codigo, pesos o datos de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CircleNet con backbone Hourglass de dos stacks (inicializado en COCO) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible para el checkpoint; el codigo CircleNet es MIT y los datos de entrenamiento son CC BY-NC-SA 4.0 |
| Formato de pesos | PyTorch (`.pth`, checkpoint `hourglass_coco_best.pth`) |

## Arquitectura y entrenamiento

CircleNet es un detector de objetos basado en Hourglass que representa cada nucleo mediante un circulo (centro y radio) en lugar de una caja delimitadora, lo que se ajusta a la morfologia aproximadamente circular de los nucleos en imagenes de patologia. El checkpoint publicado corresponde a la variante de dos stacks, inicializada desde pesos preentrenados en COCO. El entrenamiento uso Adam, tamano de lote 4, tasa de aprendizaje 0,00025 y 50 epocas, seleccionando la epoca 33 por menor perdida de validacion. Se ejecuto en una unica RTX 3090 con versiones modernas de PyTorch y CUDA.

Los datos de entrenamiento proceden de una reconstruccion de los splits de MoNuSeg, con recortes, particiones y etiquetas derivadas de XML que difieren del benchmark historico. No se proporciona informacion sobre el numero de tokens (no aplica), composicion detallada del dataset ni sobre tecnicas de RLHF/DPO (no aplica a un detector). No se incluye checkpoint DLA ni resultados de consistencia a rotacion.

## Capacidades

- Deteccion de objetos con representacion circular: localiza centros y radios de nucleos en imagenes histopatologicas.
- Segmentacion implicita de nucleos a partir de las detecciones circulares, orientada a conteo y morfometria celular.
- Inferencia sobre parches de imagen (el autor evalua sobre 140 parches de test).
- Integracion con el codigo original de CircleNet (repositorio hrlblab/CircleNet), no con pipelines de Transformers.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla de la deteccion en imagen.

## Casos de uso

- Conteo automatizado de nucleos en laminas de patologia digital: el modelo detecta centros y radios de nucleos sobre parches de imagen, permitiendo estimar densidad celular en estudios de investigacion.
- Morfometria nuclear: a partir de los circulos predichos se pueden calcular areas y radios para analisis de variabilidad nuclear en tejidos tumorales.
- Preprocesado para pipelines de segmentacion: las detecciones sirven como inicializacion o candidatos para etapas posteriores de segmentacion semantica o instancia.
- Reproduccion de experimentos academicos: util para comparar frente al benchmark historico de MoNuSeg, teniendo en cuenta que los splits reconstruidos no son identicos a los originales.
- Prototipado en investigacion de patologia computacional: un unico checkpoint de 0,8 GB que se puede cargar en una GPU consumer para experimentar con la arquitectura CircleNet.
- Generacion de visualizaciones cualitativas: el archivo `test_previews.jpg` muestra predicciones del modelo, util para inspeccion visual antes de integrar en un estudio mayor.
- Evaluacion comparativa de variantes de backbone (Hourglass frente a DLA) en el marco de CircleNet, aunque este checkpoint no incluye la variante DLA.

## Benchmarks y rendimiento

Evaluacion estandar sobre 140 parches de test, segun la model card:

| Metrica | Valor |
|---|---|
| AP | 44,2 |
| AP50 | 82,1 |
| AP75 | 43,3 |

El autor indica que estas cifras no reproducen los resultados del paper original debido a diferencias en recortes, splits y etiquetas derivadas de XML. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento se realizo en una RTX 3090 (24 GB), por lo que la inferencia cabe previsiblemente en GPUs consumer con suficiente memoria, aunque no se especifica el minimo.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento); no se detallan otras GPU validadas.
- Cabe en GPU consumer: si, al menos en RTX 3090; no se confirma para modelos inferiores.
- Opciones de despliegue: codigo original de CircleNet (PyTorch); no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. Como referencia contextual, el propio autor menciona que no se incluye checkpoint DLA ni resultados de consistencia a rotacion, pero no se aportan cifras de esos modelos alternativos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CircleNet-Hourglass-MoNuSeg-Reconstructed | no disponible | no aplica | 44,2 AP / 82,1 AP50 / 43,3 AP75 | no disponible (codigo MIT, datos CC BY-NC-SA 4.0) | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las metricas reportadas no reproducen los resultados del paper original: los recortes, splits y etiquetas derivadas de XML son distintos del benchmark historico.
- Entrenamiento en una unica ejecucion con una sola RTX 3090; no se aporta variabilidad entre semillas ni validacion cruzada.
- No se incluye checkpoint DLA ni resultados de consistencia a rotacion.
- `test_previews.jpg` muestra predicciones del modelo, no anotaciones de referencia; no debe interpretarse como ground truth.
- Licencia del checkpoint no disponible; el codigo CircleNet es MIT y los datos de entrenamiento son CC BY-NC-SA 4.0, lo que restringe el uso comercial de los datos y, por extension, plantea dudas sobre el uso comercial del modelo entrenado con ellos.
- El rehosting no concede derechos adicionales sobre codigo, pesos o datos de terceros.
- No es un modelo de lenguaje: no soporta generacion de texto, codigo, matematicas, tool calling ni agentes.
- Riesgo de sesgo y alucinacion no documentado; al ser un detector, los errores se manifiestan como falsos positivos o negativos en la deteccion de nucleos.
- Sin informacion sobre dominios de imagen fuera de MoNuSeg (otros tejidos, tinciones o escaneres) ni sobre robustez a cambios de escala.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/EthanNguyen/CircleNet-Hourglass-MoNuSeg-Reconstructed
- Dataset reconstruido: https://huggingface.co/datasets/EthanNguyen/CircleNet-MoNuSeg-Reconstructed
- Repositorio CircleNet: https://github.com/hrlblab/CircleNet
- Pull request con detalles de uso, entrenamiento y limitaciones: https://github.com/hrlblab/CircleNet/pull/34
- Licencia CC BY-NC-SA 4.0: https://creativecommons.org/licenses/by-nc-sa/4.0/
