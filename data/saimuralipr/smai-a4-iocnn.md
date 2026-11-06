# saimuralipr/smai-a4-iocnn

## Resumen

SMAI A4 IOC-NN es un modelo de clasificación de imágenes desarrollado por el usuario saimuralipr en el contexto de la asignatura SMAI (Statistical Methods in Artificial Intelligence) del programa Monsoon 2026 en IIIT Hyderabad. Se trata de un perceptrón multicapa (MLP) de tres capas diseñado específicamente para satisfacer la condición de convexidad entrada-salida (Input-Output Convexity), lo que le confiere propiedades de robustez frente a ruido en las etiquetas. El modelo se entrena y evalúa sobre el conjunto de datos CIFAR-10.

La relevancia del modelo es fundamentalmente académica y demostrativa: ilustra cómo imponer restricciones estructurales (pesos no negativos en capas intermedias y activaciones convexas no decrecientes) puede mejorar la generalización y reducir el sobreajuste a etiquetas ruidosas en comparación con un MLP estándar. No está pensado para uso en producción ni como modelo de propósito general.

Con 402.250 parámetros totales, una entrada de 3.072 dimensiones (imágenes RGB de 32×32 píxeles aplanadas) y una salida de 10 clases, el modelo es extremadamente ligero. Los pesos se distribuyen en formato `.npz` (NumPy), no en safetensors ni GGUF, y no dispone de tokenizador ni capacidades de generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con convexidad entrada-salida (IOC-NN) |
| Parámetros totales | 402.250 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, sin contexto textual) |
| Tipos de cuantización | no disponible (pesos en `.npz`, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy) |

## Arquitectura y entrenamiento

La arquitectura es un MLP con las siguientes capas: entrada de 3.072 dimensiones (32×32×3 aplanado) → capa lineal de 3.072 a 128 con activación ELU → capa lineal de 128 a 64 con activación ELU y proyección de pesos no negativos (\(W^{(\ell \ge 2)} \ge 0\)) → capa lineal de 64 a 10 con softmax y pérdida de entropía cruzada. La garantía de convexidad entrada-salida se logra combinando pesos inter-capa no negativos con activaciones convexas no decrecientes.

El entrenamiento se realiza sobre CIFAR-10 con una partición estratificada de 36.000 imágenes de entrenamiento, 12.000 de validación y 12.000 de test. El preprocesamiento incluye estandarización por canal calculada exclusivamente sobre el conjunto de entrenamiento, con medias `[0.4914, 0.4822, 0.4465]` y desviaciones estándar `[0.2470, 0.2435, 0.2616]` (normalizadas a [0,1] antes del escalado). No se menciona el uso de RLHF, DPO ni técnicas de ajuste fino posteriores; el entrenamiento es supervisado estándar con entropía cruzada.

La innovación técnica principal es la imposición de convexidad estructural, que según la model card reduce la capacidad del modelo de ajustar ruido en las etiquetas (39,45 % de ajuste de ruido frente al 66,00 % de un MLP estándar) y mejora la brecha de generalización entrenamiento-test (30,97 % frente al 45,32 % del MLP).

## Capacidades

- Clasificación de imágenes RGB de 32×32 píxeles en 10 clases (CIFAR-10: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Robustez frente a ruido en las etiquetas de entrenamiento, gracias a la restricción de convexidad entrada-salida.
- Inferencia ligera con NumPy o PyTorch (según el entorno de carga indicado).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general (solo clasificación de imágenes de 32×32), audio ni otras modalidades.

## Casos de uso

- Docencia y demostración de convexidad en redes neuronales: el modelo sirve como ejemplo práctico para asignaturas de aprendizaje automático donde se quiera ilustrar cómo las restricciones arquitectónicas (pesos no negativos, activaciones convexas) afectan a la generalización y a la robustez frente a ruido.
- Clasificación de imágenes de baja resolución en entornos embebidos: con solo 402.250 parámetros y pesos en `.npz`, puede desplegarse en microcontroladores o dispositivos con recursos muy limitados para tareas de clasificación CIFAR-10 o similares.
- Investigación sobre robustez a ruido de etiquetas: el modelo permite comparar experimentalmente el comportamiento de un IOC-NN frente a un MLP estándar bajo distintos niveles de ruido (\(p=0.0\) y \(p=0.5\)), sirviendo como línea base en estudios de learning with noisy labels.
- Reproducción de experimentos académicos: al incluir instrucciones de carga con NumPy y una API `Model.load_from(path)`, facilita la replicación de resultados en el contexto del curso SMAI Monsoon 2026.
- Prototipado rápido de pipelines de clasificación de imágenes: útil para validar preprocesamiento, particiones estratificadas y métricas antes de escalar a arquitecturas convolucionales más costosas.
- Benchmark de referencia para modelos convexos: puede emplearse como baseline en trabajos que exploren arquitecturas con garantías de convexidad en problemas de visión de baja dimensión.

## Benchmarks y rendimiento

| Métrica | IOC-NN (este modelo) | MLP estándar (referencia en model card) |
|---|---|---|
| Precisión en test limpio (\(p=0.0\)) | 49,76 % | 47,17 % (implícito: +2,59 % para IOC-NN) |
| Precisión en test con ruido (\(p=0.5\)) | 31,08 % | no disponible |
| Ajuste de ruido (\(p=0.5\)) | 39,45 % | 66,00 % |
| Brecha de generalización train-test (\(p=0.0\)) | 30,97 % | 45,32 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en precisión completa (402.250 parámetros × 4 bytes ≈ 1,6 MB, más overhead de activaciones y framework).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problema. Cualquier GPU consumer (GTX 1050, RTX 3050, etc.) es sobradamente suficiente.
- Cabe en cualquier GPU consumer y en la mayoría de microcontroladores con suficiente memoria flash y RAM.
- Opciones de despliegue: NumPy (carga directa del `.npz`), PyTorch (reimplementando la arquitectura), ONNX (previa exportación manual). No hay soporte nativo para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia en CPU sería del orden de microsegundos a milisegundos por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión CIFAR-10 | Licencia | Formato |
|---|---|---|---|---|---|
| SMAI A4 IOC-NN | 402.250 | no aplica | 49,76 % (test limpio) | MIT | `.npz` |
| MLP estándar (referencia en model card) | no disponible | no aplica | 47,17 % (implícito) | no disponible | no disponible |
| ResNet-18 (referencia externa, no en la información) | ~11,7 M | no aplica | ~93-95 % (típico en CIFAR-10) | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables dentro de la documentación proporcionada. La comparativa con ResNet-18 se incluye solo como referencia contextual de orden de magnitud y no debe interpretarse como un dato extraído de la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre CIFAR-10, hereda los sesgos de representación de dicho dataset (clases balanceadas, pero imágenes de baja resolución y contextos limitados).
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero el modelo puede producir clasificaciones erróneas con alta confianza en imágenes ambiguas o fuera de distribución.
- Limitaciones de contexto o idioma: no procesa texto ni lenguaje natural; solo clasifica imágenes RGB de 32×32 píxeles en 10 clases fijas.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación con atribución; sin embargo, el modelo es un trabajo académico sin garantías de rendimiento en producción.
- Caveats para producción: la precisión en test limpio es del 49,76 %, muy inferior a la de arquitecturas convolucionales modernas; no se recomienda su uso en aplicaciones reales de clasificación de imágenes. El formato `.npz` requiere implementación manual de la arquitectura para inferencia. No hay versiones cuantizadas ni soporte de frameworks de despliegue estándar.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar efectivamente alojados o que el repositorio está vacío en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/saimuralipr/smai-a4-iocnn
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
