# harrrshall/teenyfill-149m

## Resumen

TeenyFill 149M es un modelo de clasificación de texto basado en un cross-encoder derivado de ModernBERT-base, desarrollado por harrrshall (Harshal Singh). Su propósito es rellenar formularios web de forma automática y local, puntuando cada par (campo, valor) candidato en una página y aplicando aquellos con alta confianza, sin llegar a enviar el formulario. Está pensado para integrarse en flujos de automatización de pruebas, RPA o autofill con privacidad, ya que todo el procesamiento ocurre en el dispositivo.

El modelo tiene 149.605.633 parámetros y se ha afinado a partir de ModernBERT-base sobre datos de Mind2Web y FormFactory, más formularios sintéticos. Según la model card, alcanza un rendimiento comparable a un teacher de 32B en un subconjunto de evaluación de Mind2Web, con una latencia de aproximadamente 0,04 segundos por página en una A100 y 0,5 segundos en CPU. Su licencia es Apache 2.0 y está orientado exclusivamente al inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT-base (transformer encoder) |
| Parametros totales | 149.605.633 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, formato fp32 probablemente) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TeenyFill 149M es un cross-encoder: recibe un par (descripción de campo, valor candidato) y devuelve una puntuación de relevancia. Se ha afinado a partir de ModernBERT-base, un modelo transformer encoder de la familia BERT con optimizaciones modernas (atención eficiente, etc.), aunque no se especifican detalles adicionales de la arquitectura base en la información disponible.

El entrenamiento se realizó sobre acciones de relleno de formularios extraídas de Mind2Web (licencia CC-BY-4.0) y FormFactory (MIT), complementadas con formularios sintéticos. Se utilizó una función de pérdida softmax-CE listwise con hard negatives minados. La model card indica que no se emplearon salidas de modelos de terceros y que existe un registro completo del proceso en el repositorio del proyecto.

## Capacidades

- Relleno automático de formularios web: puntúa cada acción candidata (campo, valor) y aplica las que superan un umbral de confianza.
- Integración con navegador: puede usarse dentro de flujos de automatización de pruebas, RPA o extensiones de autofill.
- Detención antes del envío: por defecto, no envía el formulario, lo que permite revisar antes de una acción definitiva.
- Soporte de formularios HTML nativos: funciona con controles estándar (input, select, textarea, etc.).
- Procesamiento local: todo el cálculo se realiza en el dispositivo, sin necesidad de conexión a servidores externos.
- Compatible con la librería transformers y con text-embeddings-inference (TEI) según los tags del modelo.

## Casos de uso

- Automatización de pruebas de aplicaciones web: el modelo puede rellenar formularios de prueba en entornos de CI/CD, reduciendo el tiempo de escritura manual de datos y permitiendo verificar flujos completos sin intervención humana.
- RPA (automatización robótica de procesos): en tareas de back-office que requieren introducir datos en portales web, TeenyFill puede sustituir a scripts frágiles basados en selectores, ya que entiende la semántica de los campos.
- Autofill con privacidad: para usuarios que no quieren enviar sus datos a servicios en la nube, el modelo permite rellenar formularios localmente, manteniendo la información sensible en el dispositivo.
- Asistencia a la accesibilidad: puede ayudar a personas con discapacidad motora a completar formularios con menos interacciones, al sugerir valores automáticamente.
- Generación de datos de prueba sintéticos: en desarrollo de software, se puede usar para poblar formularios con datos ficticios de forma rápida y consistente.
- Integración en asistentes de navegación: combinado con un agente de automatización, puede rellenar formularios en flujos multi-paso, avanzando a través de botones "Siguiente" y deteniéndose antes de la sumisión final.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados medidos (con evidencia en el repositorio de entrenamiento):

| Tarea | Resultado |
|---|---|
| Mind2Web holdout (8 sitios, nunca entrenado) | 27/57 rellenos exactos de campo |
| FormFactory split A11 (end-to-end) | 8/8 formularios exactos |
| FormFactory split E12 (end-to-end) | 7/8 formularios exactos |
| FormFactory split F11 (end-to-end) | 8/8 formularios exactos (151/152 campos) |
| Sitios web reales (demoqa React) | 5/5 campos |
| Sitios web reales (practicesoftwaretesting) | 4/4 campos |
| Sitios web reales (herokuapp login) | 2/2 campos |
| Latencia en A100 | ~0,04 s/página |
| Latencia en CPU | ~0,5 s/página |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en una tarea concreta. La comparación con un teacher de 32B se menciona en la model card, pero no se identifica el modelo concreto.

## Requisitos de hardware

- VRAM estimada: con 149M parámetros, en fp32 ocupa ~600 MB, en fp16 ~300 MB y en int8 ~150 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de consumo como RTX 3060, RTX 4060, o incluso integradas con suficiente memoria. En servidores, una A100 ofrece latencias de ~0,04 s/página.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que puede ejecutarse en GPUs de escritorio y portátiles.
- Opciones de despliegue: se puede usar con la librería transformers de Hugging Face, con text-embeddings-inference (TEI) según los tags, y también es posible exportarlo a ONNX o TensorRT para optimización.
- Latencia y throughput: según la model card, ~0,04 s/página en A100 y ~0,5 s/página en CPU, lo que permite procesar decenas de páginas por segundo en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (autofill de formularios web). El propio autor menciona que iguala a un teacher de 32B en el holdout de Mind2Web, pero no se especifica qué modelo es. Por tanto, no se puede ofrecer una comparativa objetiva con alternativas concretas.

## Limitaciones y advertencias

- Solo funciona con controles HTML nativos; no soporta dropdowns personalizados, canvas, CAPTCHA, shadow DOM ni iframes.
- Está orientado al inglés; el rendimiento en otros idiomas no está garantizado.
- Puede confundir campos adyacentes del mismo tipo con valores ambiguos de una sola palabra (por ejemplo, nombre y apellido en tablas sin etiquetas claras).
- No envía formularios por defecto, pero el usuario debe revisar el informe de relleno antes de cualquier acción definitiva.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que es muy reciente y no ha sido ampliamente validado por la comunidad.
- No se han publicado resultados de benchmarks estándar, por lo que su rendimiento general fuera de la tarea específica es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harrrshall/teenyfill-149m
- Perfil del autor en Hugging Face: https://huggingface.co/harrrshall
- Perfil de GitHub del autor: https://github.com/harrrshall
- Modelo base (ModernBERT-base): https://huggingface.co/answerdotai/ModernBERT-base
- Dataset Mind2Web: https://huggingface.co/datasets/osunlp/Mind2Web (referenciado en la model card)
