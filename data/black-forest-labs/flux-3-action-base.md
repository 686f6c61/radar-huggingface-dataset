# black-forest-labs/flux-3-action-base

## Resumen

FLUX-3 Action Base es un modelo de acción y mundo (world-action model) desarrollado por Black Forest Labs, el mismo laboratorio responsable de la familia FLUX de modelos de generación de imágenes. A diferencia de sus predecesores centrados en síntesis visual, este modelo se publica bajo la librería LeRobot y el pipeline de robótica, lo que indica que está diseñado para el aprendizaje de políticas robóticas y la modelización de dinámicas físicas a partir de observaciones, no para generar imágenes estáticas.

El modelo se distribuye en formato safetensors con un tamaño de repositorio de 25,4 GB, lo que sugiere un conjunto de pesos de escala media-grande orientado a inferencia en entornos de investigación robótica. Se publica bajo la licencia FLUX Community License, con acceso restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La información pública disponible no detalla la arquitectura interna, el número de parámetros ni la longitud de contexto.

Su relevancia actual radica en la convergencia entre modelos generativos de gran escala y la robótica: los world-action models permiten planificar acciones y predecir consecuencias físicas en un mismo sustrato, lo que resulta atractivo para manipulación, navegación y control basado en aprendizaje. La ficha se limita a los datos verificables publicados en Hugging Face; los apartados sin información se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre y los tags sugieren un modelo de acción/mundo basado en FLUX, sin confirmación técnica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | flux-kommunity-license (acceso restringido, requiere aceptación) |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 25,4 GB |
| Descargas | 1047 |
| Likes | 172 |

## Arquitectura y entrenamiento

No se ha publicado información técnica sobre la arquitectura interna del modelo en la información disponible. Los tags `flux`, `world-action-model`, `world-model` y `robot-learning` apuntan a un modelo orientado a la predicción de acciones y dinámicas de entorno, probablemente construido sobre componentes de la familia FLUX, pero no se confirma ni el tipo de transformer, ni si emplea mecanismos híbridos, ni la composición del dataset de entrenamiento.

Tampoco están disponibles el número de tokens de entrenamiento, la mezcla de datos (teleoperación, vídeo, simulación), ni si se aplicaron técnicas de RLHF, DPO o aprendizaje por imitación. Cualquier afirmación adicional sobre innovaciones como decodificación especulativa o atención lineal sería especulativa y no se incluye.

## Capacidades

- Modelo de acción y mundo para robótica: los tags `world-action-model` y `robot-learning` indican soporte para aprender políticas y predecir consecuencias de acciones en entornos físicos.
- Integración con LeRobot: la librería declarada facilita su uso dentro del ecosistema de Hugging Face para aprendizaje robótico.
- Potencial uso como world model: predicción de estados futuros a partir de observaciones y acciones, útil para planificación.
- Capacidades de generación de texto, código, matemáticas o visión general: no disponibles o no confirmadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible de forma explícita; el paradigma world-action es afín a planificación, pero no se documenta.
- Capacidades multilingües: no disponibles (el modelo no es lingüístico en el sentido habitual).

## Casos de uso

- Manipulación robótica con aprendizaje por imitación: el modelo puede emplearse para mapear observaciones visuales y proprioceptivas a acciones de brazo o pinza, integrándose en pipelines de LeRobot para entrenar políticas a partir de demostraciones.
- Planificación basada en modelo (model-based planning): como world-action model, permite simular rollouts de acciones y evaluar trayectorias antes de ejecutarlas en el robot real, reduciendo el coste de prueba y error.
- Investigación en aprendizaje por refuerzo: sirve como modelo de dinámica aprendido para generar entornos simulados donde entrenar agentes sin necesidad de hardware físico.
- Navegación y control en entornos estructurados: predicción de transiciones estado-acción para tareas de locomoción o navegación en laboratorio.
- Benchmarking de políticas robóticas: al publicarse en LeRobot, puede utilizarse como referencia base para comparar políticas entrenadas por terceros en tareas estandarizadas.
- Prototipado en investigación académica: su disponibilidad en safetensors y su integración con el ecosistema Hugging Face facilitan la reproducción de experimentos en laboratorios con GPUs de gama alta.
- Evaluación de seguridad en robótica: simular consecuencias de acciones antes de ejecutarlas permite filtrar comandos peligrosos en entornos colaborativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con un repositorio de 25,4 GB en safetensors, la carga en precisión completa requeriría al menos ~26 GB de VRAM, y más si se mantienen estados de optimizador o buffers adicionales.
- GPU recomendadas: no confirmadas. Por tamaño, GPUs con 40-80 GB (A100, H100) son las candidatas naturales para inferencia sin cuantización; GPUs consumer de 24 GB (RTX 4090) podrían requerir cuantización o carga parcial.
- Cabeza en GPU consumer: no confirmado; probablemente solo con cuantización y dependiendo del grafo de inferencia.
- Opciones de despliegue: LeRobot es la librería declarada; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además están orientadas a modelos lingüísticos y no a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FLUX-3 Action Base | no disponible | no disponible | flux-kommunity-license | gated en Hugging Face | World-action model para robótica |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos equivalentes en la búsqueda realizada |

No se dispone de datos suficientes para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar la licencia FLUX Community License en Hugging Face; no es de descarga libre inmediata.
- Licencia no comercial estándar: la FLUX Community License impone condiciones específicas de uso; es imprescindible revisar los términos antes de cualquier despliegue comercial.
- Falta de documentación técnica pública: no se han publicado parámetros, contexto, dataset ni benchmarks, lo que dificulta evaluar su idoneidad frente a alternativas.
- Riesgo de alucinación física: como todo world model aprendido, puede predecir dinámicas incorrectas fuera de la distribución de entrenamiento, con riesgo en entornos reales.
- Sesgos de dominio: al ser un modelo robótico, su comportamiento está limitado a los tipos de robots, sensores y tareas presentes en los datos de entrenamiento, no documentados.
- Idiomas: no aplica en el sentido lingüístico; no se documentan capacidades multilingües.
- Madurez: creado en septiembre de 2026 y actualizado en noviembre de 2026, con 1047 descargas; el ecosistema de terceros y las guías de producción son aún limitados.

## Enlaces

- Hugging Face: https://huggingface.co/black-forest-labs/flux-3-action-base
- LeRobot (librería declarada): https://github.com/huggingface/lerobot
- Black Forest Labs: https://blackforestlabs.ai
- Licencia FLUX Community: no disponible en la información proporcionada; consultar la página del modelo en Hugging Face.
