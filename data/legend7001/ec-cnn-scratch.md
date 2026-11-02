# Legend7001/ec-cnn-scratch

## Resumen

ec-cnn-scratch es un modelo de clasificación de enzimas desarrollado por el usuario Legend7001 como entrega del proyecto DA3410 para la tarea de clasificación enzimática Leak CURBER. Se trata de una red neuronal convolucional de una dimensión entrenada desde cero sobre secuencias de aminoácidos, sin uso de datos externos ni búsqueda por similitud, lo que la convierte en una alternativa de comparación frente a enfoques basados en alineamiento de secuencias o modelos preentrenados.

El modelo recibe una secuencia proteica, convierte cada aminoácido en un índice entero (20 aminoácidos más un token para cualquier otro carácter), trunca la secuencia a 1500 posiciones y la procesa mediante una capa de embedding seguida de cinco capas convolucionales con ventana 9 y dilataciones 1, 2, 4 y 8. Tras un pooling máximo y medio sobre la dimensión de secuencia, una capa lineal produce una puntuación por cada clase EC presente en el conjunto de entrenamiento (4614 clases), y se selecciona la de mayor puntuación.

Es relevante como referencia metodológica minimalista: demuestra que una CNN 1-D ligera, ejecutable en CPU y entrenada únicamente con los datos de la tarea, puede servir de línea base reproducible para clasificación enzimática multietiqueta. No obstante, la información publicada es muy escasa: el repositorio tiene 0 GB de tamaño declarado, no se especifican licencia, idiomas ni pipeline, y no se han divulgado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1-D con embedding, 5 capas convolucionales (ventana 9, dilataciones 1, 2, 4, 8), pooling maximo y medio, capa lineal |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1500 caracteres de secuencia (truncado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias proteicas, no de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`weights/cnn.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional 1-D pura, sin mecanismos de atención ni componentes recurrentes. Cada letra de la secuencia se mapea a un entero (20 aminoácidos canónicos, más un índice para cualquier otro carácter), y las secuencias se recortan a 1500 letras. El cuerpo del modelo consta de una capa de embedding, cinco capas convolucionales con kernel de tamaño 9 y dilataciones crecientes (1, 2, 4, 8), lo que amplía el campo receptivo de forma exponencial sin incrementar el número de parámetros. La agregación sobre la dimensión de secuencia combina pooling máximo y medio, y una capa lineal final proyecta la representación a 4614 logits, uno por cada clase EC observada en entrenamiento.

El entrenamiento se realizó sobre todas las secuencias de entrenamiento de la tarea, con entropía cruzada binaria por clase, optimizador AdamW (learning rate 2e-3, weight decay 1e-2), programación de learning rate one-cycle, normalización por lotes, dropout 0.2 y 20 épocas. No se emplearon datos externos ni búsqueda por similitud, lo que constituye una decisión metodológica explícita para evitar filtración de información (de ahí la etiqueta `leak-curber`). No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o fases de RLHF/DPO.

## Capacidades

- Clasificación de secuencias proteicas en clases EC (Enzyme Commission) mediante puntuación directa por clase.
- Predicción multietiqueta implícita: el modelo puntúa 4614 clases EC y selecciona la de mayor score.
- Inferencia en CPU, sin necesidad de GPU, gracias al tamaño reducido y a la naturaleza convolucional del modelo.
- Procesamiento de secuencias de hasta 1500 caracteres de aminoácidos.
- Inclusión de un fallback (`weights/baseline.json`) para clases EC no cubiertas por el modelo.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Clasificación enzimática de secuencias de proteínas en pipelines bioinformáticos: el modelo se ejecuta sobre CPU y devuelve la clase EC más probable para cada secuencia, útil como primer filtro rápido antes de métodos más costosos.
- Línea base reproducible en investigación: sirve como referencia de comparación frente a modelos preentrenados de proteínas o enfoques de búsqueda por similitud en estudios sobre clasificación EC.
- Anotación funcional a gran escala: dado que no requiere GPU ni búsqueda en bases de datos, puede aplicarse en lote sobre miles de secuencias en entornos con recursos limitados.
- Evaluación de metodologías anti-filtración: al no usar datos externos ni similitud, es adecuado para estudiar el impacto de la filtración de información en benchmarks enzimáticos.
- Herramienta docente: el código (`ecnn.py`, `predict.py`) es compacto y comprensible, útil para enseñar clasificación de secuencias con CNNs.
- Despliegue en entornos embebidos o de bajo consumo: la inferencia en CPU con pesos PyTorch permite integrarlo en servidores modestos o contenedores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está diseñado para ejecutarse en CPU (`predict.py`).
- GPU recomendadas: no disponibles; no requiere GPU para inferencia.
- Cabe en cualquier GPU consumer, pero no es necesario su uso.
- Opciones de despliegue: ejecución directa con PyTorch en CPU; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de rendimiento ni especificaciones de modelos comparables en la información suministrada.

## Limitaciones y advertencias

- No se especifica licencia, lo que impide determinar las condiciones de uso comercial.
- El modelo solo predice clases EC presentes en el conjunto de entrenamiento (4614); las clases no vistas no pueden predecirse correctamente salvo por el fallback.
- El truncado a 1500 caracteres puede perder información en proteínas de mayor longitud.
- La codificación de aminoácidos es simple (índice entero), sin representaciones aprendidas ricas ni información estructural.
- No se documentan sesgos conocidos, pero al entrenarse solo con datos de la tarea, puede heredar los sesgos de composición de dicho conjunto.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de predicciones erróneas confiadas en clases poco representadas.
- No hay datos de evaluación publicados que permitan estimar su precisión real.
- El tamaño del repositorio declarado (0 GB) y la ausencia de pipeline sugieren que el artefacto puede estar incompleto o mal empaquetado.

## Enlaces

- HuggingFace: https://huggingface.co/Legend7001/ec-cnn-scratch
