# aabyaneh/srlwam

## Resumen

Srlwam es un artefacto de robótica publicado en HuggingFace por Amin Abyaneh, doctorando en IA y robótica en McGill y Mila, centrado en la manipulación robótica con transferencia sim2real. El modelo se acompaña de un dataset homónimo descrito como un conjunto de datos sim-to-real para la tarea de apilado de dos cubos con el brazo robótico Franka Panda, con datos de simulación generados en Isaac Lab y datos reales capturados en una celda robótica física. El entrenamiento se enmarca en el aprendizaje por imitación (imitation learning).

Su relevancia radica en que aborda uno de los cuellos de botella clásicos del robot learning: la brecha entre simulación y mundo real. Publicar de forma conjunta el modelo y el dataset emparejado facilita la reproducibilidad de experimentos en manipulación de precisión. Según los metadatos, el repositorio pesa 726,4 GB, está distribuido en formato safetensors y el acceso es restringido (gated): hay que aceptar condiciones en HuggingFace antes de descargarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de imitación para manipulación; el autor investiga políticas basadas en difusión y world models, pero la arquitectura concreta no está publicada en la información disponible) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de robótica, no procesa lenguaje natural) |
| Licencia | Component-specific (específica por componente); una vista del repositorio muestra bsd-3-clause, pero la etiqueta general es license:other. Conviene verificar los términos por componente |
| Formato de pesos | Safetensors |
| Tarea | Manipulación: apilado de dos cubos (two-cube stacking) |
| Robot | Franka Panda |
| Simulador | Isaac Lab |
| Tamaño del repositorio | 726,4 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de una política entrenada por aprendizaje por imitación para manipulación, con un enfoque sim2real: los datos de entrenamiento proceden de dos fuentes, simulación generada en Isaac Lab (el framework de NVIDIA para robot learning construido sobre Isaac Sim) y datos reales capturados en una celda robótica con el brazo Franka Panda. Esta combinación es el patrón habitual para reducir la brecha sim2real en tareas de manipulación de contacto y precisión como el apilado de cubos.

No se ha publicado una model card detallada con la arquitectura concreta de la política, las modalidades de observación (cámaras, estado articular, fuerza), el espacio de acciones, el número de demostraciones ni los procedimientos de validación. Como contexto, el autor declara en su página personal líneas de trabajo en robot learning, aprendizaje por refuerzo, world modeling y políticas basadas en difusión, pero esto no confirma la arquitectura específica de este artefacto.

## Capacidades

- Política de manipulación para la tarea de apilado de dos cubos con el brazo Franka Panda, según la descripción del dataset asociado.
- Transferencia sim2real: entrenamiento con datos sintéticos de Isaac Lab y validación/datos reales de una celda física.
- Pesos en formato safetensors, integrables en el ecosistema PyTorch.
- No aplica: tool calling, function calling, capacidades de agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No aplica: capacidades multilingües ni modalidades de audio.
- Detalles no disponibles: modalidades sensoriales de entrada, frecuencia de control, espacio de acciones y soporte de otras tareas distintas al apilado de dos cubos.

## Casos de uso

- Investigación en sim2real: sirve como caso de estudio completo (simulación con Isaac Lab más datos reales) para estudiar y cuantificar la brecha simulación-mundo real en manipulación de contacto, un problema abierto del área.
- Benchmark de políticas de imitación: la tarea de apilado de dos cubos es un escenario estandarizado y suficientemente exigente para comparar arquitecturas de política (difusión, transformers de acción, etc.) bajo las mismas condiciones de simulación.
- Baseline para laboratorios con brazos Franka: grupos que dispongan de un Franka Panda pueden usar la política como punto de referencia para sus propios métodos de imitación o refuerzo en la misma celda experimental.
- Construcción de pipelines de datos sintéticos: el flujo Isaac Lab → política → validación en robot real es una plantilla reutilizable para equipos que generan datos de entrenamiento en simulación y los trasladan a hardware físico.
- Punto de partida para fine-tuning hacia tareas adyacentes: con datos adicionales, la política puede adaptarse a variantes como pick-and-place, apilado con más objetos o inserciones, evitando entrenar desde cero.
- Docencia en robot learning: al emparejar modelo, dataset, simulador y robot real en un solo artefacto, es un caso práctico compacto para cursos de aprendizaje por imitación y transferencia sim2real.
- Investigación en world modeling y modelos de acción: dada la línea del autor, el artefacto puede funcionar como baseline en trabajos que evalúan world models aplicados a manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco se han hecho públicas tasas de éxito de la tarea, métricas de transferencia sim2real ni comparaciones con otras políticas. Dado que el repositorio registra 0 descargas y 0 likes en el momento de la consulta, no existen evaluaciones de terceros que consultar.

## Requisitos de hardware

- No hay requisitos oficiales de hardware publicados para ejecutar la política (no disponible).
- Almacenamiento: el repositorio completo ocupa 726,4 GB, por lo que se necesita al menos ese espacio en disco más margen para la descarga.
- Simulación: para reproducir el entorno de Isaac Lab se requiere GPU NVIDIA de la serie RTX (requisito conocido de Isaac Sim/Isaac Lab); una GPU de consumo moderna tipo RTX 4090 es adecuada para desarrollo, y tarjetas de datacenter (A100, H100) solo serían necesarias si se escalan experimentos masivos en paralelo.
- Inferencia de la política: al tratarse de una política neuronal para control de robot, probablemente cabe en GPUs de consumo, pero el consumo exacto de VRAM no está disponible.
- Despliegue en robot real: requiere una celda con Franka Panda y un PC de control en tiempo real compatible con el software de Franka; la integración concreta no está documentada públicamente.
- Opciones de despliegue software: PyTorch con safetensors es la vía directa; no constan adaptaciones a vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Tarea / robot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aabyaneh/srlwam | Imitación sim2real (Isaac Lab + datos reales) | No disponible | Apilado de dos cubos, Franka Panda | Component-specific (gated) | Pesos en safetensors, 726,4 GB, acceso restringido |
| OpenVLA | Modelo visión-lenguaje-acción generalista | 7B | Manipulación multi-robot (Open X-Embodiment) | MIT | Pesos abiertos, sin gating |
| Diffusion Policy | Política de difusión para manipulación | No disponible (varias variantes) | Múltiples tareas de manipulación | Código abierto (MIT) | Código y pesos abiertos |
| ACT (Action Chunking with Transformers) | Transformer CVAE para imitación | No disponible (modelo ligero) | Manipulación bimanual (ALOHA) | Código abierto (MIT) | Código y pesos abiertos |

Srlwam se diferencia de los anteriores en su alcance: no es un modelo generalista sino una política específica para una tarea y un robot concretos, con la ventaja de publicar datos sim2real emparejados. A cambio, ofrece menos transparencia (sin model card detallada) y más fricción de acceso (gated y licencia por componentes).

## Limitaciones y advertencias

- Alcance muy estrecho: la política está asociada a una única tarea (apilado de dos cubos) y un único robot (Franka Panda); no hay evidencia pública de generalización a otras tareas u objetos.
- Artefacto de investigación temprano: 0 descargas, 0 likes y ausencia de model card detallada; la documentación pública es mínima y puede cambiar.
- Acceso restringido: hay que aceptar condiciones en HuggingFace, lo que añade fricción para equipos y pipelines automatizados.
- Licencia por componentes: la etiqueta general es license:other con licencia component-specific (una vista menciona bsd-3-clause); antes de cualquier uso comercial hay que revisar los términos de cada componente, incluido el dataset.
- Brecha sim2real residual: aunque el enfoque sim2real mitiga el problema, no se han publicado tasas de éxito reales, por lo que el rendimiento en hardware físico debe verificarse de forma independiente.
- No es un modelo de lenguaje: carece de capacidades de NLP, tool calling o agentes; no es sustituto de un LLM ni de un VLA generalista.
- Coste de almacenamiento y transferencia: con 726,4 GB, la descarga y el almacenamiento tienen un coste no despreciable en disco y ancho de banda.
- Dependencia de hardware específico: reproducir los resultados exige acceso a un Franka Panda y a Isaac Lab con GPU NVIDIA RTX, lo que limita quién puede validar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aabyaneh/srlwam
- Dataset asociado en HuggingFace: https://huggingface.co/datasets/aabyaneh/srlwam
- Ficha del dataset en Claru (Physical AI Dataset): https://claru.ai/datasets/aabyaneh-srlwam
- Página personal del autor (Amin Abyaneh, McGill/Mila): https://aminabyaneh.github.io/
