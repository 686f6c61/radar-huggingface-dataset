# pfpdostudent/deit-tiny-cifar10-lab

## Resumen

Se trata de un clasificador de imagenes basado en DeiT-tiny (Data-efficient Image Transformer) publicado por el usuario pfpdostudent en HuggingFace. El modelo parte del checkpoint facebook/deit-tiny-patch16-224 y ha sido ajustado (fine-tuning) sobre el conjunto de datos CIFAR-10, compuesto por 60.000 imagenes de 32x32 pixeles repartidas en 10 clases. Cuenta con 5.526.346 parametros totales y se distribuye en formato safetensors para la libreria transformers.

El problema que resuelve es la clasificacion de imagenes en las 10 categorias de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion). Su relevancia es fundamentalmente educativa y de laboratorio: la model card indica que fue ajustado en Google Colab sobre una GPU y con seguimiento de experimentos mediante MLflow, alcanzando una precision de validacion de 0,9315 y una precision de test de 0,9435 con una tasa de aprendizaje de 1e-4 en el "run" ganador.

La arquitectura es un transformer de vision (ViT) con parches de 16x16 y resolucion de entrada de 224x224, heredada del modelo base. No es un modelo de lenguaje, por lo que no dispone de ventana de contexto textual ni de soporte multilingue. La model card no especifica licencia, lo que supone una limitacion relevante para su uso fuera de entornos de experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DeiT-tiny, patch 16x16) |
| Parametros totales | 5.526.346 |
| Longitud de contexto | no disponible (no aplica: modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | facebook/deit-tiny-patch16-224 |
| Dataset de ajuste | CIFAR-10 |
| Resolucion de entrada | 224 x 224 pixeles (heredada del modelo base) |
| Numero de clases de salida | 10 (CIFAR-10) |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DeiT-tiny, una variante de Vision Transformer disenada para reducir los requisitos de datos de entrenamiento respecto al ViT original. La imagen se divide en parches de 16x16 pixeles que se proyectan como tokens y se procesan por una pila de bloques de atencion multi-cabeza; sobre la representacion del token de clase se situa una cabeza de clasificacion. En este caso, la cabeza se ha reconfigurado para producir 10 clases en lugar de las 1.000 clases de ImageNet del modelo base.

El entrenamiento consistio en un ajuste fino (fine-tuning) sobre CIFAR-10, realizado en Google Colab sobre una GPU y registrado con la herramienta de seguimiento MLflow. El "run" ganador corresponde a una tasa de aprendizaje de 1e-4, con identificador de MLflow `d8c6e08488204ef38f674d0f0c422162`. La model card no detalla el numero de tokens de imagen procesados, la composicion exacta del dataset mas alla de CIFAR-10, ni si se aplicaron tecnicas de aumento de datos, regularizacion o ajuste por RLHF/DPO (no aplicables a clasificacion de imagen). Tampoco se documenta ninguna innovacion tecnica adicional sobre el modelo base.

## Capacidades

- Clasificacion de imagenes en 10 clases de CIFAR-10: avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion.
- Inferencia sobre imagenes redimensionadas a 224x224 pixeles (resolucion esperada por el backbone DeiT-tiny).
- Salida de probabilidades por clase mediante la pipeline `image-classification` de transformers.
- Integracion directa con el ecosistema transformers (`AutoModelForImageClassification`) y con safetensors.
- No dispone de soporte de tool calling, function calling ni agentes.
- No dispone de capacidades multilingues ni de generacion de texto, codigo o matematicas.
- No dispone de modo "thinking", vision generativa, audio ni capacidades multimodales mas alla de la clasificacion de imagen.
- No se documentan capacidades de deteccion de objetos, segmentacion ni captioning.

## Casos de uso

- Clasificacion rapida de imagenes de baja resolucion: el modelo puede etiquetar instantaneas de 32x32 (reescaladas a 224x224) en las 10 categorias de CIFAR-10, util como componente de preprocesado en pipelines de datos.
- Filtrado y organizacion de datasets: usar el modelo para etiquetar automaticamente lotes de imagenes pequenas y agruparlas por categoria antes de tareas de etiquetado manual.
- Docencia y practicas de vision por computador: sirve como ejemplo reproducible de ajuste fino de un ViT con seguimiento de experimentos en MLflow.
- Punto de partida para transfer learning: al estar ya ajustado sobre CIFAR-10, puede servir de inicializacion para tareas de clasificacion con clases distintas mediante nuevo fine-tuning.
- Pruebas de integracion en el ecosistema transformers: permite validar flujos de despliegue con safetensors, pipelines y endpoints compatibles.
- Prototipado rapido en notebooks: su tamano de 5,5 millones de parametros permite iterar en CPU o en GPUs de gama baja sin apenas consumo de recursos.
- Validacion de hipotesis de aumento de datos o tasas de aprendizaje: la model card documenta el "run" ganador (lr_1e-4), por lo que puede emplearse como referencia en experimentos comparables.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision de validacion | 0,9315 |
| Precision de test | 0,9435 |
| Tasa de aprendizaje del run ganador | 1e-4 |
| Identificador de run (MLflow) | d8c6e08488204ef38f674d0f0c422162 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni datos de latencia o throughput. Los unicos valores de rendimiento reportados son la precision de validacion y de test sobre CIFAR-10 incluidos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 22 MB en fp32 y 11 MB en fp16 para los pesos, mas el coste de activaciones de una unica imagen de 224x224, marginal en cualquier GPU moderna.
- Cabe sobradamente en GPUs de consumo: RTX 3060, RTX 4090, GTX 1650 e incluso integradas, siempre que exista soporte de PyTorch.
- Ejecucion viable en CPU: el reducido numero de parametros permite inferencia en CPU con latencias aceptables, aunque no se documentan valores concretos.
- El autor realizo el ajuste fino en Google Colab sobre una GPU, lo que confirma que el entrenamiento cabe en un entorno gratuito o de gama baja.
- Opciones de despliegue: pipeline de transformers, exportacion a ONNX o TorchScript; no se documenta soporte de GGUF, llama.cpp, Ollama, vLLM ni TGI para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pfpdostudent/deit-tiny-cifar10-lab | 5.526.346 | 224x224 | CIFAR-10 (10 clases) | 0,9435 (test) | no disponible | HuggingFace, 0 descargas |
| facebook/deit-tiny-patch16-224 | no disponible en la informacion proporcionada | 224x224 | ImageNet-1k (1.000 clases) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas CNN de tamano similar para CIFAR-10 (por ejemplo, ResNet-18) | no disponible en la informacion proporcionada | variable | CIFAR-10 (10 clases) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible |

La comparacion directa de precision con el modelo base no es significativa, ya que este ultimo resuelve ImageNet-1k (1.000 clases) y el modelo aqui descrito resuelve CIFAR-10 (10 clases). No se dispone de resultados homogeneos de otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar la legalidad de un uso comercial del modelo; se recomienda contactar con el autor antes de integrarlo en produccion.
- Entrenado exclusivamente sobre CIFAR-10: las imagenes originales son de 32x32 pixeles, por lo que el rendimiento sobre fotografias reales de alta resolucion o dominios distintos no esta garantizado.
- Solo reconoce 10 clases: cualquier imagen fuera de esa taxonomia sera forzada a una de las diez categorias, produciendo etiquetas incorrectas.
- Modelo de laboratorio con 0 descargas y 0 "likes": no ha sido validado por la comunidad ni cuenta con un historial de uso en produccion.
- La model card no documenta tecnicas de calibracion ni umbrales de confianza, por lo que las probabilidades de salida pueden no reflejar la incertidumbre real (predicciones erroneas con alta confianza).
- Riesgo de sobreajuste y de sesgos heredados de CIFAR-10 no documentado: no se detallan analisis por clase ni matrices de confusion.
- No aplica el concepto de alucinacion textual, pero si el de errores sistematicos de clasificacion en clases visualmente similares (por ejemplo, gato frente a perro).
- No se especifican cuantizaciones soportadas, requisitos minimos ni pruebas de robustez frente a perturbaciones de la imagen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pfpdostudent/deit-tiny-cifar10-lab
- Modelo base: https://huggingface.co/facebook/deit-tiny-patch16-224
- Dataset CIFAR-10 en HuggingFace: https://huggingface.co/datasets/cifar10
- Paper de DeiT (Training data-efficient image transformers): https://arxiv.org/abs/2012.12877
- Run de MLflow del autor (identificador): d8c6e08488204ef38f674d0f0c422162 (no se proporciona URL de servidor MLflow)
