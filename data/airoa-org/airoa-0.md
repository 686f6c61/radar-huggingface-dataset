# airoa-org/AIRoA-0

## Resumen

AIRoA-0 es un modelo de visión-lenguaje-acción (VLA, vision-language-action) publicado por la organización airoa-org en Hugging Face. Pertenece a la familia de modelos openpi, la librería de referencia para políticas robóticas de código abierto, y está orientado a la generación de acciones motoras a partir de instrucciones en lenguaje natural e imágenes de sensores. El modelo se distribuye bajo licencia Gemma y su acceso está restringido: es necesario aceptar las condiciones en el repositorio antes de poder descargarlo.

El modelo resuelve el problema del control robótico generalista: en lugar de entrenar una política específica por tarea y por robot, AIRoA-0 actúa como una política de propósito general que recibe observaciones visuales y comandos textuales y emite comandos de acción de bajo nivel. Es relevante en el contexto actual de los modelos fundacionales para robótica, donde se busca trasladar las capacidades de razonamiento de los modelos de lenguaje y visión a la manipulación física.

La información pública disponible es escasa: el repositorio no detalla arquitectura, número de parámetros ni longitud de contexto, y no se han publicado resultados de benchmarks en la información proporcionada. El tamaño del repositorio (49,8 GB) sugiere pesos de gran volumen, probablemente en precisión completa o bf16, pero este dato no permite inferir el número de parámetros con fiabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia openpi, visión-lenguaje-acción) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Gemma (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | no disponible (repositorio de 49,8 GB) |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible el detalle de la arquitectura interna de AIRoA-0. Por su pertenencia a la familia openpi y su etiqueta de pipeline "robotics", se trata de un modelo de visión-lenguaje-acción que combina un codificador visual con un backbone de lenguaje y una cabeza de acciones que produce comandos motores. La librería openpi es el marco de referencia para este tipo de políticas, lo que sugiere integración con el ecosistema de entrenamiento e inferencia de dicha librería.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas como decodificación especulativa o atención lineal. La licencia Gemma indica que el modelo se construye sobre la familia Gemma de Google, aunque no se confirma en la información disponible qué variante concreta se emplea como backbone.

## Capacidades

- Control robótico guiado por lenguaje: genera acciones motoras a partir de instrucciones en lenguaje natural.
- Percepción visual integrada: procesa observaciones de cámaras como entrada para la toma de decisiones.
- Modelo de visión-lenguaje-acción (VLA): unifica percepción, comprensión del lenguaje y actuación en un único modelo.
- Integración con el ecosistema openpi para entrenamiento e inferencia de políticas.
- Soporte multilingüe limitado al inglés según los metadatos del repositorio.
- No se ha confirmado en la información disponible soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Manipulación robótica de propósito general: el modelo recibe imágenes de cámaras y una instrucción textual ("coge la taza roja") y emite comandos de acción para un brazo robótico, lo que permite reutilizar una misma política en múltiples tareas sin reentrenamiento específico.
- Investigación en modelos fundacionales para robótica: sirve como base para experimentos de fine-tuning sobre nuevos robots o tareas dentro del marco openpi, aprovechando que la librería estandariza el pipeline de entrenamiento e inferencia.
- Automatización de tareas de pick-and-place en entornos controlados: al ser una política generalista, puede desplegarse en líneas de montaje o almacenes donde la variabilidad de objetos es alta y una política específica por objeto resultaría inviable.
- Evaluación comparativa de políticas VLA: al estar publicado en abierto (con acceso restringido), permite reproducir experimentos y comparar con otras políticas de la familia openpi en los mismos entornos simulados.
- Prototipado rápido de aplicaciones robóticas: un equipo puede integrar el modelo mediante la librería openpi para validar un caso de uso antes de invertir en un entrenamiento a medida.
- Docencia y formación en robótica con IA: el modelo sirve como ejemplo práctico de arquitectura VLA y de flujo de trabajo con políticas fundacionales en cursos de robótica o aprendizaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 49,8 GB, lo que da una cota inferior del espacio en disco necesario, pero no permite estimar la VRAM requerida sin conocer el número de parámetros y el formato de pesos.
- GPU recomendadas: no disponible en la información proporcionada. Por el volumen del repositorio, es probable que requiera GPU de centro de datos (A100, H100) para inferencia en precisión completa, pero este dato no está confirmado.
- Compatibilidad con GPU de consumo: no confirmada. La viabilidad en RTX 4090 u otras GPU consumer depende del número de parámetros y de si existen pesos cuantizados, datos no disponibles.
- Opciones de despliegue: la librería indicada es openpi; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI, que además están orientados a modelos de lenguaje y no a políticas de acción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| AIRoA-0 | VLA (openpi) | no disponible | no disponible | Gemma | Restringido |
| Otras políticas openpi | VLA | no disponible | no disponible | variable | Abierto |
| Modelos VLA de referencia (p. ej. RT-2, OpenVLA) | VLA | no disponible en esta ficha | no disponible | variable | variable |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas concretas. La comparación queda limitada a la categoría (políticas VLA de la familia openpi) y al régimen de licencia y acceso.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones del repositorio en Hugging Face antes de descargar los pesos, lo que condiciona cualquier uso automatizado o en CI.
- Licencia Gemma: impone condiciones de uso adicionales a las de una licencia permisiva estándar; conviene revisar los términos antes de un despliegue comercial.
- Idioma: los metadatos solo declaran inglés, por lo que las instrucciones en castellano pueden degradar el rendimiento.
- Sesgos: no se ha publicado información sobre sesgos del modelo; al entrenarse sobre datos robóticos y visuales, puede heredar sesgos de los entornos y objetos presentes en el dataset.
- Riesgo de alucinación motora: como toda política VLA, puede generar acciones plausibles pero incorrectas ante escenas fuera de distribución, con riesgo físico en entornos reales.
- Falta de transparencia técnica: no se publican parámetros, contexto ni detalles de entrenamiento, lo que dificulta la evaluación independiente y la planificación de recursos.
- Madurez: el repositorio se creó en noviembre de 2026 y tiene un número muy bajo de descargas, por lo que no hay evidencia comunitaria de robustez en producción.
- Sin benchmarks: la ausencia de resultados publicados impide verificar el rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/airoa-org/AIRoA-0
- Paper referenciado en los tags: arXiv:2611.03815 (https://arxiv.org/abs/2611.03815)
- Librería openpi: no se proporciona enlace directo en la información disponible.
