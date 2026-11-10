# Media1234/plant-disease-cnn

## Resumen

`Media1234/plant-disease-cnn` es un clasificador de imágenes basado en una red neuronal convolucional (CNN) desarrollado por el usuario Media1234 en el marco de un proyecto académico de grupo (KCL 5CCSAGAP). El modelo resuelve una tarea de clasificación cerrada: dada una fotografía de una hoja, asigna una de 39 clases que combinan especie vegetal y estado fitosanitario (enfermedad concreta o estado saludable). Está entrenado sobre un split estratificado del 70 % del dataset PlantVillage alojado en Hugging Face (`DScomp380/plant_village`).

Arquitectura y tamaño son modestos: una CNN con 32 canales base, profundidad 4, dropout de 0,3 y batch normalization, que opera sobre imágenes RGB de 128x128 píxeles normalizadas con media y desviación estándar de ImageNet. La mejor precisión de validación reportada por el autor es 0,9898. El repositorio tiene un tamaño de 0,0 GB y registra 0 descargas y 0 likes en el momento de la consulta, lo que refleja que se trata de un artefacto recién publicado y de alcance educativo.

Su relevancia es limitada fuera del contexto docente: no es un modelo de lenguaje ni un sistema multimodal general, sino un clasificador de visión por computador de dominio muy restringido. Resulta útil como referencia para quienes quieran reproducir un pipeline de clasificación de enfermedades foliares o comparar aproximaciones CNN frente a modelos de visión más modernos sobre PlantVillage.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional (num_classes=39, base_channels=32, depth=4, dropout=0.3, use_batchnorm=True) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 128x128 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`cnn.pt`) |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional de cuatro niveles de profundidad con 32 canales en la primera capa, normalización por lotes y dropout de 0,3 como regularización. La entrada es una imagen RGB redimensionada a 128x128 y normalizada con la media y desviación estándar de ImageNet. La salida es una distribución sobre 39 clases que codifican especie y estado fitosanitario, incluyendo una clase explícita de "fondo sin hojas".

El entrenamiento se realizó sobre un split estratificado del 70 % del dataset PlantVillage (`DScomp380/plant_village`). La model card no especifica el número de imágenes de entrenamiento, el número de épocas, la función de pérdida, el optimizador ni si se aplicaron técnicas de aumento de datos. Tampoco se documenta ninguna innovación técnica destacable (atención, decodificación especulativa, destilación, etc.). La única métrica reportada es la mejor precisión de validación: 0,9898.

## Capacidades

- Clasificación de imágenes de hojas en 39 clases predefinidas (especie + enfermedad o estado saludable).
- Detección de una clase de "fondo sin hojas" para descartar imágenes sin hoja.
- Salida de top-k predicciones mediante el método `top_k` del `Predictor` incluido en el repositorio del proyecto.
- Procesamiento de imágenes RGB de 128x128 píxeles con normalización ImageNet.
- Cobertura de cultivos como manzana, arándano, cereza, maíz, uva, naranja, melocotón, pimiento, patata, frambuesa, soja, calabaza, fresa y tomate.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión general, audio ni modo de pensamiento.

## Casos de uso

- Prototipado educativo de visión por computador: sirve como ejemplo reproducible de un pipeline de clasificación de imágenes con PyTorch, desde la descarga de pesos vía `hf_hub_download` hasta la inferencia con `Predictor`, para cursos y proyectos de aprendizaje automático.
- Comparación de arquitecturas sobre PlantVillage: al ser una CNN pequeña con precisión de validación conocida (0,9898), permite contrastar resultados frente a ResNet, EfficientNet o modelos de visión transformer en el mismo dataset.
- Preetiquetado de imágenes en condiciones controladas: en laboratorio o invernadero, con hojas individuales sobre fondo liso y luz homogénea, puede usarse para generar etiquetas iniciales que un revisor humano valide después.
- Filtrado de imágenes sin hoja: la clase "Background without leaves" permite descartar capturas irrelevantes en un conjunto de fotografías antes de pasarlas a un modelo más costoso.
- Docencia sobre limitaciones de generalización: el propio autor advierte que el rendimiento cae en fotos de campo, lo que lo convierte en un caso práctico para ilustrar el sesgo de dominio en datasets controlados.
- Base para fine-tuning experimental: al estar publicado con licencia MIT y en formato PyTorch, puede servir como punto de partida para reentrenar sobre imágenes de campo y evaluar la brecha entre dominios.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Precisión de validación (mejor) | 0,9898 | Split estratificado del 70 % de PlantVillage |

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la model card). La única métrica disponible es la precisión de validación indicada arriba.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño declarado del repositorio (0,0 GB) y una CNN de 32 canales base con profundidad 4, cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de memoria; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en hardware de gama baja.
- Opciones de despliegue: PyTorch nativo mediante el `Predictor` del repositorio del proyecto; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imágenes de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Media1234/plant-disease-cnn | no disponible (CNN 32 canales, depth 4) | Imagen 128x128 RGB | Precisión validación 0,9898 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgo de dominio: PlantVillage contiene hojas individuales sobre fondos lisos y en condiciones controladas; el rendimiento en fotos de campo (varias hojas, fondos desordenados, iluminación variable) será inferior, tal como advierte el autor.
- Clasificación cerrada: solo conoce las 39 clases listadas; cualquier otra planta o enfermedad se fuerza a una de ellas, generando predicciones incorrectas sin señal de incertidumbre calibrada.
- No es una herramienta de diagnóstico: el autor indica explícitamente que es un proyecto de estudiante y no un instrumento de diagnóstico fitosanitario.
- Riesgo de alucinación en sentido clasificatorio: al no poder rechazar clases fuera de distribución, puede asignar con alta confianza etiquetas erróneas a imágenes no representativas.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; conviene conservar el aviso de copyright y no presentar el modelo como herramienta profesional.
- Falta de documentación: no se detallan datos de entrenamiento, hiperparámetros, composición exacta del split ni métricas por clase, lo que dificulta la reproducibilidad y la evaluación rigurosa.
- Idiomas: no aplica, ya que el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Media1234/plant-disease-cnn
- Dataset de entrenamiento: https://huggingface.co/datasets/DScomp380/plant_village
