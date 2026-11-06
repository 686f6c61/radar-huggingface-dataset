# RobotLearningLab/Jocasta-diff-VLA

## Resumen

Jocasta-diff-VLA es un modelo vision-language-action (VLA) para robótica de manipulación, desarrollado por RobotLearningLab. Se trata de una adaptación del modelo base Dream-VLA-7B (de Dream-org) a ocho familias de tareas de manipulación simuladas con el brazo Panda en robosuite. El modelo combina un backbone de lenguaje de difusión con una cabeza de acción basada en Flow Matching continuo, heredada de los autores de Dream-VLX, y se entrena mediante LoRA sobre las capas lineales del modelo base.

El problema que aborda es la transferencia de un modelo VLA generalista a un conjunto concreto de tareas de manipulación con estadísticas de robot distintas (Panda frente al robot original del modelo base). La adaptación incluye no solo el adaptador LoRA de lenguaje, sino también módulos de acción entrenados desde cero: cabeza de acción, proyector de acción ruidosa y proyector de propiocepción. El repositorio distribuye un checkpoint de inferencia completo (0,7 GB), no únicamente un adaptador.

Su relevancia radica en que demuestra que una política única entrenada de forma conjunta puede resolver ocho familias de tareas con una tasa de éxito sostenida del 64,8% (332/512 episodios) en una evaluación de desarrollo fija, frente al 0/64 del modelo base original en las mismas escenas de PickPlace. La licencia Apache 2.0 y la publicación de la configuración de entrenamiento facilitan la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action con backbone de lenguaje de difusión (Dream-VLA-7B) y cabeza de acción Flow Matching continua |
| Parametros totales | 7B en el modelo base; el adaptador LoRA y los módulos de acción se distribuyen por separado (no disponible el recuento exacto de parámetros entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia de referencia en BF16) |
| Idiomas soportados | inglés (instrucciones de entrenamiento en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch); requiere los pesos base originales de Dream-org/Dream-VLA-7B por separado |

## Arquitectura y entrenamiento

El modelo parte de Dream-VLA-7B, un VLA construido sobre un backbone de modelo de lenguaje de difusión. Sobre él se añaden módulos específicos de acción: una cabeza de acción de Flow Matching continuo (la misma que emplean los autores de Dream-VLX), un proyector de acción ruidosa y un proyector de propiocepción. La adaptación se realiza con LoRA de rango 32, alpha 16, dropout 0 y aplicado a todas las capas lineales, mientras que los módulos de acción se inicializan desde cero. Las entradas son dos cámaras RGB de 224×224 (primaria y de muñeca), un vector de propiocepción de 8 dimensiones (xyz, orientación axis-angle y dos articulaciones del gripper) y una instrucción en lenguaje natural.

El entrenamiento usa el objetivo de error cuadrático medio sobre la velocidad de Flow Matching de los autores, con AdamW, tasa de aprendizaje 1e-4, 100.000 actualizaciones y batch global de 64 (4 GPUs × microbatch 8 × acumulación 2). Los datos son 8.140 trayectorias exitosas que suman 4.841.083 pasos temporales, cubriendo 8 familias de tareas, 30 objetivos y 510 cadenas de instrucción de entrenamiento, con balanceo por familia y objetivo y aumento de imagen. En inferencia se emplean 4 pasos de Flow Matching y chunks de acción de 8 pasos. La semilla de entrenamiento es 84907 y la de muestreo 190019. Se reservó un banco de desarrollo de 120 cadenas de lenguaje no vistas, aunque los resultados publicados usan instrucciones canónicas y no constituyen una evaluación de lenguaje retenido.

## Capacidades

- Generación de acciones de manipulación robótica de 7 dimensiones (delta de traslación en metros, delta de orientación en Euler XYZ extrínsecos en radianes y apertura del gripper) a partir de instrucciones en lenguaje natural.
- Percepción visual con dos cámaras RGB (vista primaria y de muñeca) procesadas a 224×224.
- Fusión de propiocepción de 8 dimensiones con la observación visual y la instrucción.
- Ejecución de chunks de acción de 8 pasos con 4 pasos de Flow Matching por llamada.
- Cobertura de ocho familias de tareas: Lift, PickPlace, Stack, Door, NutAssembly, ToolHang, Push y Drawer (30 objetivos en total).
- Seguimiento de instrucciones en inglés dentro del vocabulario de entrenamiento (510 cadenas de entrenamiento, 120 de desarrollo retenidas).
- Inferencia determinista mediante semilla configurable.
- No soporta tool calling, function calling, agentes multi-paso ni modos de razonamiento explícito: es una política de acción, no un asistente conversacional.

## Casos de uso

- Investigación en transferencia de VLA: servir como punto de partida reproducible para adaptar Dream-VLA-7B a nuevos conjuntos de tareas con estadísticas de robot distintas, reutilizando el pipeline de LoRA y módulos de acción del repositorio.
- Benchmark de manipulación en robosuite: evaluar políticas con el protocolo documentado (64 escenas fijas por familia, semillas 30000–30063, 10 pasos de asentamiento) para comparar variantes de backbone o de cabeza de acción bajo condiciones idénticas.
- Estudio de Flow Matching en políticas VLA: el checkpoint permite aislar el efecto de 4 pasos de Flow Matching con chunks de 8 acciones frente a alternativas de difusión discreta, siempre que se controle el resto de diferencias del pipeline.
- Generación de datos sintéticos en simulación: usar la política para rodar episodios en robosuite y producir trayectorias etiquetadas por éxito, útiles para entrenamiento por imitación o evaluación de reward models.
- Prototipado de tareas de pick-and-place y apilado: las familias PickPlace (62,5%) y Stack (67,2%) tienen tasas de éxito razonables para generar demostraciones iniciales en entornos simulados antes de validar en hardware.
- Docencia y divulgación en robótica aprendida: el paquete incluye loader, esquema de caché de datos y configuración completa, lo que facilita montar prácticas sobre inferencia VLA con una sola GPU CUDA visible.
- Pruebas de integración de pipelines de evaluación: el JSON de resultados con intervalos de Wilson por familia y el registro de hashes permiten verificar la reproducibilidad del empaquetado y de la inferencia.

## Benchmarks y rendimiento

Evaluación de desarrollo sobre 64 escenas fijas por familia (semillas 30000–30063), éxito sostenido durante 10 pasos físicos consecutivos:

| Tarea | Éxitos | Tasa |
|---|---:|---:|
| Lift | 64/64 | 100,0% |
| PickPlace | 40/64 | 62,5% |
| Stack | 43/64 | 67,2% |
| Door | 34/64 | 53,1% |
| NutAssembly | 32/64 | 50,0% |
| ToolHang | 9/64 | 14,1% |
| Push | 61/64 | 95,3% |
| Drawer | 49/64 | 76,6% |
| Total | 332/512 | 64,8% |

Comparación directa en las mismas escenas de PickPlace: el Dream-VLA original obtuvo 0/64 y Jocasta-diff-VLA 40/64. Esta comparación es entre políticas transferidas completas (el original usa una imagen, una acción, 4 pasos de difusión discreta y estadísticas de Bridge; la adaptación usa dos imágenes más propiocepción, 8 acciones, 4 pasos de Flow Matching y estadísticas de Panda), no un efecto aislado del backbone o del mecanismo de difusión. No se declara resultado de línea base para las otras siete tareas. La evaluación auditó 45.254 llamadas a la política y 365.450 pasos físicos, con una sola semilla de entrenamiento y sin selección de checkpoint ni repeticiones guiadas por métrica.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es de 7B parámetros y la inferencia de referencia se ejecutó en BF16 sobre una NVIDIA H200, lo que sugiere del orden de 14–16 GB solo para pesos, más overhead de activaciones y del backbone de difusión.
- GPU recomendadas: H200 (entorno de referencia documentado); por tamaño, cabría esperar viabilidad en A100 40/80 GB y H100.
- GPU de consumo: no validado por los autores; un modelo de 7B en BF16 no cabe en GPUs de 8–12 GB sin cuantización, y no se documentan recetas de cuantización.
- Despliegue: no se soporta mediante vLLM, TGI, llama.cpp ni Ollama; requiere el repositorio `alanrbtx/Diffusion-VLA-tuning` con submódulos fijados y el parche `dream-vlx-panda.patch`, más `load_policy` y `predict_action`. `AutoModel.from_pretrained` no reconstruye la política.
- Entorno de referencia: Python 3.10.18, PyTorch 2.5.1+cu124, Transformers 4.51.3, BF16/SDPA.
- En simulación, la inferencia CUDA y el renderizado EGL deben ir en GPUs físicas separadas; la inferencia del modelo no crea contexto EGL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jocasta-diff-VLA | 7B (base) + LoRA y módulos de acción | no disponible | 64,8% global en 8 tareas robosuite/Panda (desarrollo) | Apache 2.0 | Hugging Face + repo de código |
| Dream-VLA-7B (base) | 7B | no disponible | 0/64 en las mismas escenas de PickPlace | no disponible en la información proporcionada | Hugging Face (Dream-org) |
| Dream-VLX | no disponible | no disponible | no disponible | no disponible | Repositorio DreamLM/Dream-VLX |

No se dispone de datos de otros VLA comparables (por ejemplo, variantes de OpenVLA u otras políticas de manipulación) en la información proporcionada, por lo que la comparativa se limita al linaje directo del modelo.

## Limitaciones y advertencias

- Los resultados son de desarrollo sobre las definiciones de tarea propias del autor en robosuite/Panda; no son puntuaciones oficiales de LIBERO ni comparables directamente con otros benchmarks.
- ToolHang es claramente débil (9/64, 14,1%), lo que desaconseja su uso en tareas de ensartado o colgado sin reentrenamiento.
- No se han validado otros robots, familias de tareas no vistas, hardware real ni el split de test reservado.
- Una sola semilla de entrenamiento: no hay estimación de varianza entre semillas.
- Los resultados publicados usan instrucciones canónicas; el banco de 120 cadenas de lenguaje retenidas no se evaluó, por lo que el rendimiento ante paráfrasis o instrucciones fuera de distribución es desconocido.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser una política de acción, el fallo se manifiesta como acciones incorrectas o inseguras, no como texto inventado.
- Idioma: solo inglés; no hay soporte multilingüe declarado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Dream-VLA-7B se distribuye por separado y su licencia debe verificarse de forma independiente antes de un uso comercial.
- El paquete no incluye datos de demostración en bruto ni estado de optimizador o de reanudación de entrenamiento; solo se documenta el esquema de caché.
- La integración requiere código y parche específicos; no es cargable con APIs estándar de Transformers, lo que complica su despliegue en plataformas gestionadas.
- Las acciones de salida están en marco mundial y requieren la conversión documentada a comandos OSC normalizados de Panda (`panda_adapter.py`); un uso incorrecto de la conversión invalida la ejecución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobotLearningLab/Jocasta-diff-VLA
- Código y loader: https://github.com/alanrbtx/Diffusion-VLA-tuning
- Modelo base: https://huggingface.co/Dream-org/Dream-VLA-7B
- Repositorio upstream Dream-VLX: https://github.com/DreamLM/Dream-VLX
- Paper referenciado (arXiv:2512.22615): https://arxiv.org/abs/2512.22615
