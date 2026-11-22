# sanjardevx/neurolens-models

## Resumen

NeuroLens models es un repositorio de dos modelos ONNX orientados al análisis de imágenes de resonancia magnética (MRI) cerebral: un segmentador 3D basado en SegResNet y un clasificador 2D basado en EfficientNet-B3. Lo desarrolla el autor independiente sanjardevx como proyecto de investigación y de portafolio, y forma parte del proyecto NeuroLens alojado en GitHub. No es un modelo de lenguaje: son modelos de visión por computador médico especializados en la detección y segmentación de tumores cerebrales.

El segmentador (`segmenter3d.onnx`, versión interna `seg-segresnet-v2`) procesa cuatro tipos de MRI co-registradas y con cráneo eliminado (estilo BraTS) mediante ventana deslizante de 128³ para delimitar edema, núcleo tumoral y tumor realzado. El clasificador (`classifier.onnx`, versión interna `cls-b3-crop-v1`) trabaja sobre un único corte 2D y distingue entre glioma, meningioma, tumor pituitario y ausencia de tumor, generando además mapas de activación de clase.

Su relevancia es acotada y hay que subrayarla: se trata de un proyecto de portafolio con licencia MIT, sin descargas ni likes en el momento de la consulta, entrenado exclusivamente con datos públicos (BraTS 2021 y Brain Tumor MRI Dataset). El propio autor advierte de forma explícita que no es un dispositivo médico y que no debe usarse para diagnóstico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segmentador: SegResNet 3D. Clasificador: EfficientNet-B3 (2D) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | no aplica (modelos de imagen; no se declaran idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (metadatos embebidos bajo la clave `neurolens_ml.onnx_meta`) |

## Arquitectura y entrenamiento

El segmentador emplea una arquitectura SegResNet 3D que opera sobre cuatro modalidades de MRI co-registradas y con eliminación de cráneo, siguiendo el esquema de BraTS. La inferencia se realiza mediante ventana deslizante de 128³ vóxeles sobre el volumen completo. El clasificador es una EfficientNet-B3 que recibe un único corte 2D y produce una de cuatro clases (glioma, meningioma, pituitario, sin tumor), junto con mapas de activación de clase para interpretabilidad.

El entrenamiento se realizó exclusivamente con datos públicos: BraTS 2021 (licencia CC BY 4.0) y el Brain Tumor MRI Dataset. El autor indica que los detalles de entrenamiento, prueba y comparación están documentados en el README del proyecto en GitHub, pero no se proporcionan en la información disponible el número de tokens (no aplica), el volumen exacto de imágenes de entrenamiento, ni si se aplicaron técnicas de aumento de datos o validación cruzada. El segmentador almacena además en sus metadatos su límite para tumores pequeños en realce.

## Capacidades

- Segmentación 3D de tumores cerebrales en tres regiones: edema, núcleo tumoral y tumor realzado.
- Procesamiento de cuatro modalidades de MRI co-registradas y con cráneo eliminado (esquema BraTS).
- Clasificación 2D de cortes individuales en cuatro categorías: glioma, meningioma, pituitario y sin tumor.
- Generación de mapas de activación de clase (CAM) para el clasificador, lo que aporta cierta interpretabilidad visual.
- Inferencia en formato ONNX, apta para despliegue multiplataforma (CPU/GPU) mediante ONNX Runtime.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.

## Casos de uso

- Investigación en segmentación de tumores cerebrales: el segmentador permite reproducir o comparar pipelines de segmentación BraTS sobre volúmenes MRI, útil en entornos académicos que trabajan con datos públicos.
- Docencia y formación en imagen médica: el clasificador con mapas de activación de clase sirve para ilustrar cómo una CNN pondera regiones del corte al predecir una clase tumoral.
- Prototipado de herramientas de apoyo a la visualización radiológica: integración del ONNX en una aplicación de escritorio o web para resaltar regiones de interés en un volumen MRI, siempre como apoyo visual y no diagnóstico.
- Evaluación comparativa de arquitecturas: el repositorio documenta resultados frente a alternativas en el README del proyecto, lo que permite usarlo como referencia en estudios de segmentación 3D.
- Desarrollo de pipelines de preprocesado médico: los modelos pueden encadenarse en flujos que reciban MRI, apliquen eliminación de cráneo y co-registro, y luego segmenten o clasifiquen, sirviendo de base para experimentos de investigación.
- Demostración de despliegue ONNX en producción: por su tamaño reducido (repositorio de 0,1 GB) y formato ONNX, es un ejemplo práctico de cómo empaquetar modelos de imagen médica para inferencia en CPU o GPU sin dependencias de frameworks pesados.
- Proyecto de portafolio y referencia educativa: útil para quien quiera estudiar un caso completo de entrenamiento, evaluación y publicación de modelos de imagen médica con licencia permisiva.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Modelo | Métrica | Resultado | Conjunto de prueba |
|---|---|---|---|
| Segmentador (`seg-segresnet-v2`) | Dice whole tumor | 0,928 | 188 pacientes BraTS 2021 |
| Segmentador (`seg-segresnet-v2`) | Dice tumor core | 0,914 | 188 pacientes BraTS 2021 |
| Segmentador (`seg-segresnet-v2`) | Dice enhancing tumor | 0,872 | 188 pacientes BraTS 2021 |
| Clasificador (`cls-b3-crop-v1`) | Accuracy | 99,4 % | 710 imágenes limpias |

No se han publicado en la información disponible resultados comparativos con otros modelos en forma de tabla, ni métricas adicionales (precisión, recall, F1, AUC) para el clasificador.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser modelos ONNX de tamaño reducido (repositorio de 0,1 GB), es plausible que quepan en GPU de consumo, pero no se aportan cifras concretas.
- GPU recomendadas: no disponible. El formato ONNX permite ejecución en CPU y en GPU compatibles con ONNX Runtime, pero el autor no especifica modelos recomendados.
- ¿Cabe en GPU de consumo? No confirmado explícitamente; por el tamaño del repositorio es probable, pero no hay dato oficial.
- Opciones de despliegue: ONNX Runtime (CPU/GPU); el proyecto NeuroLens en GitHub es la referencia de integración.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. El autor menciona que en el README del proyecto se documenta una comparación, pero no se incluyen cifras ni modelos alternativos en la información disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeuroLens (segmentador + clasificador) | no disponible | no aplica | Dice 0,928 / 0,914 / 0,872; accuracy 99,4 % | MIT | ONNX en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un dispositivo médico: el autor lo declara explícitamente como proyecto de investigación y portafolio, no apto para diagnóstico.
- Sesgos de datos: entrenado solo con BraTS 2021 y Brain Tumor MRI Dataset, por lo que su generalización a otras poblaciones, equipos o protocolos de adquisición no está validada.
- El segmentador tiene un límite declarado para tumores pequeños en realce, almacenado en sus metadatos; puede infrasegmentar lesiones de pequeño tamaño.
- El clasificador opera sobre un único corte 2D, lo que limita su capacidad para capturar información volumétrica y puede producir resultados dependientes del corte elegido.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos/negativos en clasificación y segmentación.
- Idiomas: no aplica; no se declaran capacidades lingüísticas.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías y desaconseja el uso clínico.
- Sin descargas ni validación externa conocida en el momento de la consulta; el rendimiento reportado procede únicamente del autor.
- No se documentan en la información disponible los parámetros totales, la cuantización ni los requisitos de hardware, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/sanjardevx/neurolens-models
- Repositorio del proyecto NeuroLens: https://github.com/sanjardevx/neurolens
- Resultados del proyecto: https://github.com/sanjardevx/neurolens#results
- BraTS 2021 (dataset de entrenamiento, CC BY 4.0): no disponible enlace directo en la información proporcionada
- Brain Tumor MRI Dataset (dataset de entrenamiento): no disponible enlace directo en la información proporcionada
