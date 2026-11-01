# habib-analyst/organcnn

## Resumen

OrganCNN es una red neuronal convolucional 3D compacta desarrollada por habib-analyst para la clasificación de volúmenes de tomografía computarizada (TC) en 11 clases de órganos corporales. El modelo se entrena desde cero sobre el conjunto de datos OrganMNIST3D de MedMNIST v2, que contiene volúmenes de 28×28×28 píxeles correspondientes a cajas delimitadoras de órganos extraídas de exploraciones de TC. Con solo 105.307 parámetros, es un modelo de referencia (benchmark) pensado para investigación y evaluación, no para uso clínico.

La relevancia de este modelo reside en su transparencia metodológica: el autor publica un script que reproduce todas las métricas principales a partir de los pesos y datos incluidos en el repositorio, de modo que los resultados declarados son verificables. Además, documenta abiertamente sus debilidades, en particular la confusión entre anatomía izquierda y derecha (el 61% de sus errores de test son confusiones entre el miembro izquierdo y derecho de un par de órganos), lo que lo convierte en un caso de estudio útil sobre los límites de los modelos volumétricos de baja resolución.

El modelo se distribuye en formatos safetensors y ONNX, con licencia MIT, y está orientado a la clasificación de imágenes médicas en el ámbito de la investigación. No es un dispositivo médico y nunca ha sido evaluado con datos clínicos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 3D (3 bloques convolucionales, canales 16→32→64, convoluciones 3×3×3) |
| Parametros totales | 105.307 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 28×28×28 vóxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

OrganCNN es una CNN 3D compuesta por tres bloques convolucionales con canales de 16, 32 y 64 respectivamente, usando convoluciones 3×3×3. El modelo se entrena desde cero (sin preentrenamiento) sobre el conjunto OrganMNIST3D de MedMNIST v2, que proporciona volúmenes de 28×28×28 vóxeles en escala de grises correspondientes a cajas delimitadoras de órganos. La entrada se normaliza dividiendo entre 255 y aplicando la media y desviación típica del split de entrenamiento (0,50092 / 0,28022, escalar). Las etiquetas siguen el orden de MedMNIST v2: 0 hígado, 1 riñón derecho, 2 riñón izquierdo, 3 fémur derecho, 4 fémur izquierdo, 5 vejiga, 6 corazón, 7 pulmón derecho, 8 pulmón izquierdo, 9 bazo, 10 páncreas.

El entrenamiento se realizó deliberadamente sin aumento de datos por volteo o permutación, ya que invertir un volumen cambia la etiqueta correcta de lateralidad. A pesar de ello, las cajas delimitadoras de 28³ contienen demasiado poco contexto de orientación para que el modelo distinga de forma fiable izquierda de derecha, lo que se refleja en su patrón de error dominante. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre el uso de RLHF/DPO (no aplicable en un modelo de clasificación de imágenes).

## Capacidades

- Clasificación de imágenes médicas volumétricas: asigna uno de 11 órganos a un volumen de TC de 28×28×28 vóxeles.
- Salida de probabilidades por clase (11 clases) y etiqueta predicha con nivel de confianza.
- Inferencia en dos formatos: safetensors (PyTorch) y ONNX, con paridad entre ambos.
- Preprocesamiento reproducible integrado (normalización con media/desviación típica del split de entrenamiento).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no aplica (modelo de visión; etiquetas en inglés).
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales.

## Casos de uso

- Evaluación de referencia en investigación de clasificación 3D: el modelo sirve como línea base reproducible para comparar arquitecturas de CNN 3D en OrganMNIST3D, gracias a su script de verificación de métricas.
- Docencia y experimentación con MedMNIST: su tamaño reducido (105.307 parámetros) permite ejecutarlo en CPU y estudiar el efecto de la resolución y el aumento de datos en la clasificación de órganos.
- Análisis de errores de lateralidad: el modelo documenta un patrón de confusión izquierda/derecha que puede usarse para investigar cómo mejorar la codificación de orientación en volúmenes de baja resolución.
- Pruebas de integración de pipelines ONNX: al incluir un modelo ONNX con la misma normalización, es útil para validar flujos de despliegue de inferencia de imágenes médicas en producción de investigación.
- Prototipado rápido de clasificadores de órganos: con solo 0,0 GB de tamaño de repositorio, se puede desplegar en entornos con recursos limitados para experimentos preliminares.
- Verificación de reproducibilidad de métricas: el script `examples/verify_metrics.py` permite comprobar que las métricas publicadas se reproducen exactamente, útil en auditorías de modelos de investigación.

## Benchmarks y rendimiento

Resultados verificados en el split de test de OrganMNIST3D (n = 610), reproducidos el 2026-10-29:

| Métrica | Valor |
|---|---|
| Accuracy | 0,8574 (523/610) |
| Macro AUC (one-vs-rest) | 0,9860 |
| Balanced accuracy | 0,8780 |
| Baseline de clase mayoritaria | 0,1131 |
| Mejor balanced accuracy de validación | 0,9673 (época 24) |
| Mejor AUC macro de validación | 0,9994 (época 24) |

Resultados por clase en test (recall / precision / soporte):

| Clase | Recall | Precision | Soporte |
|---|---|---|---|
| liver | 0,9855 (68/69) | 0,9714 | 69 |
| kidney-right | 0,6471 (44/68) | 0,9362 | 68 |
| kidney-left | 0,8261 (57/69) | 0,6706 | 69 |
| femur-right | 0,9231 (60/65) | 0,6522 | 65 |
| femur-left | 0,5692 (37/65) | 0,9024 | 65 |
| bladder | 0,9091 (60/66) | 0,9231 | 66 |
| heart | 0,9286 (26/28) | 1,0000 | 28 |
| lung-right | 1,0000 (21/21) | 1,0000 | 21 |
| lung-left | 1,0000 (21/21) | 1,0000 | 21 |
| spleen | 0,9130 (63/69) | 0,8750 | 69 |
| pancreas | 0,9565 (66/69) | 0,9429 | 69 |

Comparación con la referencia del paper de MedMNIST v2: un ResNet-18 (3D) reporta AUC 0,996 y ACC 0,907 en este conjunto, con un tamaño aproximadamente 300 veces mayor. OrganCNN (0,9860 / 0,8574) no lo iguala; la brecha y su concentración en la lateralidad están documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 105.307 parámetros y entradas de 28×28×28, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4090, A100 o H100; también funciona en CPU sin problema.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: PyTorch (safetensors) y ONNX Runtime; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Accuracy (OrganMNIST3D) | AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OrganCNN | 105.307 | 28×28×28 vóxeles | 0,8574 | 0,9860 | MIT | HuggingFace (safetensors, ONNX) |
| ResNet-18 (3D) referencia MedMNIST v2 | ~300× mayor | 28×28×28 vóxeles | 0,907 | 0,996 | no disponible | Referencia del paper MedMNIST v2 |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no es un dispositivo médico: está entrenado con volúmenes de TC remuestreados a 28×28×28 y nunca se ha evaluado con datos clínicos reales; no debe usarse para diagnóstico ni planificación de tratamiento.
- Confusión de lateralidad: el 61% de los errores de test (53 de 87) son confusiones entre el miembro izquierdo y derecho de un par de órganos; el recall de fémur izquierdo es 0,5692 y el de riñón derecho 0,6471.
- Brecha validación-test: la accuracy de validación (0,9689) es muy superior a la de test (0,8574), porque el split de validación proviene de las mismas exploraciones que el de entrenamiento y el checkpoint se seleccionó sobre validación.
- Errores poco confiados en su mayoría: la probabilidad media predicha en errores es 0,4882 frente a 0,7801 en aciertos, con una excepción de una vejiga clasificada como hígado con 0,814 de confianza.
- Sesgos conocidos: no se documentan sesgos demográficos, pero el conjunto MedMNIST puede no ser representativo de poblaciones clínicas diversas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede asignar clases erróneas con alta confianza en casos concretos.
- Limitaciones de idioma: las etiquetas y la documentación están en inglés; no hay soporte multilingüe.
- Restricciones de licencia: licencia MIT, permite uso comercial, pero el uso clínico está explícitamente desaconsejado por el autor.
- Caveat para producción: el modelo está pensado para investigación y benchmark; su reducido tamaño y resolución de entrada limitan su aplicabilidad fuera de ese contexto.

## Enlaces

- HuggingFace: https://huggingface.co/habib-analyst/organcnn
- Repositorio GitHub: https://github.com/habib-analyst/organcnn
- Paper MedMNIST v2 (referencia de los datos y del ResNet-18 3D): no disponible en la información proporcionada
- Demo y scripts de verificación: incluidos en el repositorio GitHub (`examples/verify_metrics.py`, `examples/predict_demo.py`)
