# anagha2312/smai-a4-cifar10-mlp

## Resumen

`smai-a4-cifar10-mlp` es un clasificador de imágenes de tamaño muy reducido publicado en HuggingFace por el usuario `anagha2312`. Se trata de un perceptrón multicapa (MLP) de dos capas densas con arquitectura `[3072, 128, 10]` y activación `relu` en la capa oculta, entrenado para clasificar las 10 clases del conjunto de datos CIFAR-10 a partir de imágenes de 32x32 píxeles RGB aplanadas en un vector de 3072 dimensiones. El autor reporta una precisión final de test de 0,4759.

Por su naturaleza, no es un modelo de lenguaje ni un modelo fundacional: no procesa texto, no genera contenido y no dispone de ventana de contexto conversacional. Es un artefacto académico, presumiblemente asociado a una práctica de la asignatura SMAI (identificada como "A4"), y su interés es exclusivamente docente o como referencia mínima de pipeline de entrenamiento y preprocesado reproducible.

El repositorio incluye los pesos en dos formatos (`model.npz` en el formato de la librería `nn_lib` y `model_state_dict.pt` de PyTorch), el fichero `preprocessing.npz` con las medias y desviaciones por columna calculadas sobre el conjunto de entrenamiento, y un `config.json`. No se declara licencia, idiomas ni pipeline, y el modelo no cuenta con descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP completamente conectado `[3072, 128, 10]`, activación `relu` en la capa oculta |
| Parametros totales | 394.634 (derivado de la arquitectura: 3072x128 + 128 + 128x10 + 10) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: entrada fija de 3072 valores correspondiente a una imagen 32x32x3) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precisión original) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.npz` (formato `nn_lib`), `model_state_dict.pt` (PyTorch), `preprocessing.npz`, `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa con una única capa oculta de 128 neuronas y activación ReLU, que recibe un vector de 3072 dimensiones (imagen CIFAR-10 de 32x32 píxeles y 3 canales aplanada en orden HWC) y produce 10 salidas, una por clase del dataset. El autor indica el hiperparámetro `p = 0` en el título de la model card, presumiblemente una probabilidad de dropout nula, aunque no se detalla en el texto. No se especifica la función de activación de la capa de salida, la función de pérdida, el optimizador, la tasa de aprendizaje, el tamaño de lote ni el número de épocas.

El preprocesado está documentado con precisión: cada imagen uint8 se aplana a 3072 valores, se divide entre 255 y a continuación se normaliza por columna restando la media y dividiendo por la desviación típica calculadas sobre la partición de entrenamiento de CIFAR-10, parámetros que se distribuyen en `preprocessing.npz`. No se menciona el uso de aumento de datos, regularización adicional, búsqueda de hiperparámetros ni técnicas de ajuste fino como RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Clasificación de imágenes de 32x32 píxeles en las 10 clases de CIFAR-10: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión.
- Inferencia puramente discriminativa: no genera texto, imágenes ni ningún otro tipo de contenido.
- Entrada de tamaño fijo (3072 valores float); no admite imágenes de otras resoluciones sin remuestreo externo previo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No tiene capacidades multilingües ni de visión general más allá de la clasificación de 10 clases.
- No dispone de modo "thinking", audio ni procesamiento de secuencias variables.

## Casos de uso

- Docencia y prácticas académicas: sirve como referencia de un pipeline completo de clasificación (carga de datos, normalización por columna, entrenamiento de un MLP y exportación de pesos en dos formatos) para comparar con implementaciones propias.
- Verificación de pipelines de preprocesado: los parámetros de `preprocessing.npz` permiten comprobar que una implementación de inferencia replica exactamente la normalización del entrenamiento antes de evaluar la precisión reportada de 0,4759.
- Pruebas unitarias de infraestructura de despliegue: con ~0,39 M de parámetros y ~1,6 MB en fp32, es útil como modelo "smoke test" para validar el empaquetado, la carga de pesos y el servicio de inferencia en un entorno nuevo.
- Benchmark de línea base para CIFAR-10: al ser un MLP sin convoluciones, proporciona una cota inferior de precisión frente a la que medir arquitecturas convolucionales en experimentos docentes o de investigación preliminar.
- Ejemplo educativo de conversión de formatos: el par `model.npz` / `model_state_dict.pt` permite practicar la migración de pesos entre una librería propia (`nn_lib`) y PyTorch, verificando la equivalencia numérica de las salidas.
- Demostraciones de clasificación de bajo coste en CPU: adecuado para talleres o charlas donde se necesita un modelo que entrene y ejecute en portátil sin GPU y en milisegundos por lote.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| CIFAR-10 (test) | Precisión (accuracy) | 0,4759 |

No se han publicado resultados de benchmarks en la información disponible más allá de la precisión de test indicada en la model card. No hay datos de MMLU, HumanEval, GSM8K ni de otras tareas, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en fp32 (394.634 parámetros ≈ 1,6 MB de pesos, más el vector de entrada de 3072 floats); no requiere GPU.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problemas. Cualquier GPU consumer (por ejemplo, una GTX 1050 o superior) ejecutaría la inferencia de forma instantánea, pero no aporta ventaja frente a CPU.
- Cabe en cualquier GPU consumer y en dispositivos de muy baja potencia (Raspberry Pi, móvil) dada su huella de memoria.
- Opciones de despliegue: carga directa con NumPy a partir de `model.npz`, o con PyTorch mediante `model_state_dict.pt`. No se han publicado integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera del orden de microsegundos a milisegundos por muestra en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de otros clasificadores sobre CIFAR-10 ni modelos comparables de la misma categoría (MLP de ~0,4 M de parámetros para CIFAR-10). La comparación con arquitecturas convolucionales o con modelos fundacionales no sería homogénea en tarea, tamaño ni propósito.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `anagha2312/smai-a4-cifar10-mlp` | 394.634 | no aplica (entrada fija 3072) | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Precisión limitada: 0,4759 en test sobre CIFAR-10, lejos de lo que alcanzan arquitecturas convolucionales; no es adecuado para producción real de clasificación de imágenes.
- Ausencia de capas convolucionales: el aplanado de la imagen destruye la estructura espacial, lo que limita intrínsecamente la capacidad del modelo.
- Resolución restringida: solo acepta entradas de 32x32 píxeles y 3 canales; cualquier imagen distinta requiere remuestreo y normalización externos con los parámetros exactos de `preprocessing.npz`.
- Riesgo de fallo silencioso si no se aplica el preprocesado correcto (orden de canales HWC, división entre 255 y normalización por columna); las predicciones pueden degradarse sin errores visibles.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre CIFAR-10, hereda los sesgos de composición y etiquetado de ese dataset, con clases potencialmente desbalanceadas o ambiguas.
- Sin licencia declarada: no se especifican condiciones de uso comercial, redistribución ni atribución; debe contactarse con el autor antes de cualquier uso fuera del ámbito académico.
- Sin documentación de reproducibilidad: no se detallan semilla, optimizador, épocas ni tamaño de lote, por lo que replicar exactamente la precisión reportada puede no ser posible.
- Modelo sin mantenimiento aparente: 0 descargas y 0 valoraciones en el momento de la consulta, creado y actualizado el mismo día, lo que sugiere un artefacto de entrega académica más que un proyecto con soporte.
- No es un modelo de lenguaje: no debe evaluarse con métricas de generación de texto ni utilizarse para tareas conversacionales, RAG o agentes.

## Enlaces

- HuggingFace: https://huggingface.co/anagha2312/smai-a4-cifar10-mlp

No se han encontrado en la búsqueda web enlaces relevantes al modelo, su paper, repositorio de código o demo. Los resultados devueltos por la búsqueda corresponden a contenido no relacionado (páginas de un mod del videojuego Terraria) y se descartan por no guardar relación con este modelo. No se dispone de enlace a paper, blog técnico, repositorio de GitHub ni demo.
