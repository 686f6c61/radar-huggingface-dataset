# HanZiwww/PRTS

## Resumen

PRTS (Prior-trained RNA-seq Task Solver) es un modelo de aprendizaje en contexto diseñado para predecir endpoints clínicos a partir de transcriptomas bulk de RNA-seq. Lo desarrolla Han Wang y colaboradores (Lennart Purucker, Huafeng Liu, Ziyin Luo, Junfeng Hao, Chao Zhu y Chunjie Tian), y se publica bajo licencia Apache 2.0 en el repositorio HanZiwww/PRTS de Hugging Face. El modelo resuelve un problema concreto: dado un cohorte etiquetado que actúa como contexto, predice sobre muestras nuevas variables binarias, multiclase, continuas y de supervivencia sin reentrenamiento específico por tarea.

La relevancia actual reside en su enfoque de *in-context learning* aplicado a datos tabulares biomédicos: en lugar de ajustar un modelo por endpoint y cohorte, el mismo checkpoint resuelve tareas distintas según las muestras de referencia que se le proporcionan. El checkpoint contiene 219.595.334 parámetros distribuidos en 471 tensores, organizados en cuatro bloques de células y veinte bloques de filas, lo que sugiere una arquitectura específica para procesar matrices de expresión génica por muestras.

El modelo se distribuye como un checkpoint PyTorch (`prts.pt`, 0,9 GB de repositorio) con configuración y pesos sin modificar respecto al checkpoint original del autor. Está etiquetado para clasificación tabular, regresión tabular, análisis de supervivencia y aprendizaje en contexto, y se ha evaluado sobre cohortes transcriptómicas públicas retrospectivas (PreBULK, RealBulk y datos de benchmark).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal específica para datos tabulares de expresión génica; cuatro bloques de células y veinte bloques de filas |
| Parámetros totales | 219.595.334 (471 tensores) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el contexto lo forman las muestras etiquetadas del cohorte de referencia, sin límite numérico publicado) |
| Tipos de cuantización | No disponible (checkpoint PyTorch en precisión original) |
| Idiomas soportados | No aplica (modelo sobre datos numéricos de expresión génica) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`prts.pt`, state dict con `config.model` y `model`) |

## Arquitectura y entrenamiento

PRTS es una red neuronal diseñada específicamente para datos tabulares de transcriptómica bulk. El checkpoint se organiza en cuatro bloques de células y veinte bloques de filas, una estructura que procesa conjuntamente las muestras (filas) y los genes o características (columnas) de la matriz de expresión. El modelo opera en modo de aprendizaje en contexto: recibe un cohorte etiquetado como contexto y genera predicciones sobre muestras nuevas, sin ajuste de parámetros por tarea.

El nombre "Prior-trained" indica un entrenamiento previo sobre cohortes transcriptómicas que dota al modelo de un prior reutilizable para distintos endpoints. El checkpoint exportado conserva la configuración y todos los tensores de parámetros del checkpoint original del autor; se han omitido únicamente los metadatos de ejecución de entrenamiento y las rutas específicas de máquina. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO, dado que el modelo opera sobre datos numéricos y no sobre texto. El dataset de referencia citado es `hanzi-bulk-collab/bulk-datasets-private`, junto con PreBULK, RealBulk y datos de benchmark.

Una innovación destacable es el preset "Thinking", que promedia cuatro pasadas de inferencia por defecto, frente al preset "Off" de una sola pasada. Este mecanismo de agregación de predicciones busca estabilizar la salida en tareas con alta variabilidad entre cohortes.

## Capacidades

- Predicción de endpoints binarios a partir de transcriptomas bulk de RNA-seq en contexto.
- Predicción de endpoints multiclase.
- Regresión sobre variables continuas.
- Análisis de supervivencia.
- Aprendizaje en contexto: el cohorte etiquetado de referencia define la tarea, sin reentrenamiento.
- Procesamiento de datos tabulares de expresión génica con estructura de bloques de células y filas.
- Modo "Thinking" con promedio de cuatro pasadas para mayor estabilidad de predicción.
- Modo "Off" de pasada única para inferencia más rápida.
- Ejecución en CPU o GPU CUDA mediante la función `load` del paquete `prts`.

## Casos de uso

- Predicción de subtipos tumorales: dado un cohorte etiquetado con subtipos conocidos, el modelo clasifica muestras nuevas de RNA-seq en categorías multiclase sin reentrenamiento, aprovechando el prior aprendido sobre cohortes previas.
- Estratificación de riesgo de supervivencia: con un cohorte de referencia con tiempos y eventos de supervivencia, el modelo estima el riesgo de muestras nuevas, útil en estudios retrospectivos de pronóstico.
- Clasificación binaria de respuesta a tratamiento: usando un cohorte con etiquetas de respondedor/no respondedor, el modelo predice la respuesta en muestras adicionales del mismo estudio.
- Regresión de variables clínicas continuas: predicción de marcadores cuantitativos (por ejemplo, puntuaciones de expresión o índices clínicos) a partir del perfil transcriptómico, con el cohorte de referencia como contexto.
- Validación cruzada entre cohortes y plataformas: el modelo permite evaluar la transferencia de un estudio a otro aportando muestras de referencia del cohorte destino, útil para analizar robustez entre plataformas de secuenciación.
- Investigación biomédica exploratoria: análisis de asociaciones entre expresión génica y endpoints clínicos en conjuntos de datos públicos, con el modo "Thinking" para reducir la varianza de las predicciones.
- Integración en pipelines de análisis transcriptómico: el paquete `prts` permite cargar el checkpoint y generar predicciones en CPU o GPU, facilitando su incorporación en flujos de análisis existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,9 GB en el repositorio; en FP32 los 219,6 millones de parámetros requieren aproximadamente 0,88 GB de memoria para los pesos, más memoria adicional para activaciones y el cohorte de contexto.
- GPU recomendadas: no se especifican modelos concretos; el modelo puede ejecutarse en CUDA o CPU según la documentación de carga (`device="cuda"` o `device="cpu"`).
- Cabe en GPU de consumo: sí, por el tamaño del checkpoint (inferior a 1 GB en pesos), aunque el requisito real depende del tamaño del cohorte de contexto y del modo de inferencia.
- Opciones de despliegue: paquete `prts` instalable desde el repositorio de GitHub (`pip install "git+https://github.com/Hanziwww/PRTS.git#subdirectory=prts"`) junto con `huggingface_hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El preset "Thinking" multiplica por cuatro el coste de inferencia respecto al preset "Off".

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (aprendizaje en contexto sobre transcriptómica bulk) con parámetros, contexto o rendimiento documentados.

## Limitaciones y advertencias

- El modelo se evaluó sobre cohortes transcriptómicas públicas retrospectivas; la precisión varía según endpoint, cohorte, plataforma y las muestras de referencia aportadas como contexto.
- Se recomienda evaluar la transferencia entre cohortes y sitios no vistos antes de aplicar el modelo a un estudio nuevo.
- Es un modelo de investigación; no es un dispositivo de diagnóstico clínico validado.
- No se documentan sesgos específicos, pero al entrenarse sobre cohortes públicas puede heredar sesgos de composición poblacional de esos estudios.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de predicciones erróneas o sobreconfiadas en cohortes fuera de distribución.
- La licencia Apache 2.0 cubre el checkpoint y el código del autor; los datasets originales y el código de terceros mantienen sus propios términos.
- No se especifican límites de tamaño del cohorte de contexto ni requisitos de preprocesado más allá de la escala de expresión documentada en el repositorio de código.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HanZiwww/PRTS)
- [Código y aplicaciones en GitHub](https://github.com/Hanziwww/PRTS)
- [Documentación de inferencia](https://github.com/Hanziwww/PRTS/tree/main/prts)
- [Datasets PreBULK, RealBulk y benchmark](https://huggingface.co/datasets/hanzi-bulk-collab/bulk-datasets-private)
- [Metadatos del checkpoint (tamaño y SHA-256)](checkpoint_metadata.json)
