# fernandotonon/QtMeshEditor-t2m

## Resumen

QtMeshEditor-t2m es un modelo experimental de text-to-motion desarrollado por fernandotonon como parte integrada de la herramienta QtMeshEditor, un pipeline gratuito de activos 3D para desarrolladores de juegos indie. Dado un prompt de texto (una palabra clave de acción), genera un clip de animación esquelética de 60 frames a 30 fps con 22 articulaciones, en coordenadas de mundo canónicas, que QtMeshEditor retargetea sobre cualquier rig humanoide.

El modelo se entrena desde cero exclusivamente sobre ventanas limpias de acción individual extraídas de la base de datos CMU MoCap, con licencia comercial permitida, excluyendo AMASS, HumanML3D y KIT-ML por sus restricciones no comerciales. Con aproximadamente 7,6 millones de parámetros, la arquitectura combina un transformer decoder con cross-attention y un CVAE latente, exportado a ONNX para una única pasada de inferencia.

Es importante señalar que este modelo es opt-in dentro de QtMeshEditor; el comportamiento predeterminado de la herramienta es un retarget de clips de plantilla basado en 47 clips reales de CMU. El modelo generativo actúa como alternativa cuando se selecciona explícitamente, con un fallback automático a las plantillas si la palabra está fuera de vocabulario o el modelo no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con cross-attention + CVAE latente |
| Parametros totales | ~7,6 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada one-hot sobre vocabulario fijo de 13 acciones) |
| Tipos de cuantizacion | no disponible (solo ONNX fp32) |
| Idiomas soportados | no disponible (vocabulario en ingles: walk, run, jump, dance, march, kick, punch, wave, climb, sit, throw, boxing, idle) |
| Licencia | CC0-1.0 |
| Formato de pesos | ONNX (t2m.onnx + t2m-vocab.json) |

## Arquitectura y entrenamiento

El modelo usa una representación de rotaciones 6D (Zhou et al., 2019) correctamente empaquetada por columnas. La arquitectura principal es un transformer decoder con cross-attention que genera poses absolutas por frame, evitando la acumulación de errores típica de los enfoques autoregresivos con cumsum. Un módulo CVAE latente con supervisión z=0 y emparejamiento de posterior agregada permite variabilidad por generación. El entrenamiento incluye supervisión de velocidad y aceleración tanto en espacio 6D como en espacio de rotación verdadera (geodésica), más supervisión local derivada (la cantidad que renderiza el retarget). El suavizado de salida 1-2-1 está integrado en el grafo ONNX.

Los datos de entrenamiento se extraen de CMU MoCap, seleccionando ventanas de 2 segundos a 30 fps con alta energía de movimiento y un frame inicial cercano a neutro. Se aplica aumento por espejo. El modelo se entrena desde cero, sin usar datos de AMASS, HumanML3D ni KIT-ML por sus licencias no comerciales.

## Capacidades

- Generación de clips de animación esquelética de 60 frames a 30 fps con 22 articulaciones, en coordenadas de mundo canónicas.
- Vocabulario fijo de 13 acciones: walk, run, jump, dance, march, kick, punch, wave, climb, sit, throw, boxing, idle.
- Variabilidad por generación mediante ruido latente muestreado de N(0, 0.5) con selección best-of-N.
- Retargeting automático sobre cualquier rig humanoide gracias a la convención WORLD-frame y el esquema de cuaterniones canónicos.
- Fallback automático a la biblioteca de plantillas de mocap real (47 clips de CMU) cuando el modelo no está disponible o la acción está fuera de vocabulario.
- Exportación a ONNX con una única pasada de inferencia, sin dependencias de Python en tiempo de ejecución.

## Casos de uso

- Prototipado rápido de animaciones en desarrollo de juegos indie: el desarrollador escribe "jump" o "kick" y obtiene un clip base listo para retargetear sobre su personaje, acelerando el bloqueo de mecánicas de movimiento.
- Generación de variaciones de animación para fondos o NPCs: al muestrear diferentes semillas latentes, se obtienen variantes de la misma acción, útil para multitudes o personajes no jugables con comportamientos repetitivos.
- Automatización de pipelines de asset 3D: integrado en QtMeshEditor, permite convertir o completar bibliotecas de animación sin necesidad de captura de movimiento o animación manual.
- Creación de contenido procedural para demos o juegos generativos: el modelo puede producir clips de movimiento bajo demanda dentro de un bucle de generación procedural, combinado con otras herramientas del ecosistema QtMeshEditor.
- Asistencia a animadores: sirve como punto de partida para blocking; el animador refina el clip generado en lugar de partir de cero, reduciendo tiempo en poses iniciales.
- Educación e investigación en text-to-motion: al ser un modelo pequeño, de código abierto y con licencia CC0, es un banco de pruebas accesible para estudiar representaciones 6D, CVAE y supervisión geométrica sin requisitos de hardware elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas tipo MMLU, HumanEval o métricas específicas de text-to-motion (FID, R-Precision, etc.). El autor indica que el modelo produce movimiento coherente y vertical, pero estilísticamente más suave y menos nítido que las plantillas de mocap real, sin aportar cifras.

## Requisitos de hardware

- Modelo muy ligero: ~7,6 millones de parámetros, peso ONNX de aproximadamente 30 MB (el repo total ocupa 0,1 GB).
- Inferencia factible en CPU sin GPU dedicada; el coste computacional es despreciable frente a modelos de lenguaje grandes.
- Cualquier GPU moderna (incluso integradas) puede ejecutarlo con latencia de milisegundos, aunque no se han publicado medidas exactas de throughput.
- Despliegue recomendado mediante ONNX Runtime (C++ o Python), integrable directamente en QtMeshEditor sin necesidad de servidores externos.
- No requiere vLLM, llama.cpp ni Ollama; al ser un modelo de generación de movimiento, no es un LLM y su runtime es específico de ONNX.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con otros modelos text-to-motion (como MotionGPT, T2M-GPT o HumanML3D-based). La model card no menciona benchmarks ni comparaciones con alternativas. El único punto de referencia interno es la biblioteca de plantillas de mocap real de QtMeshEditor, que el propio autor define como el estándar de calidad: el modelo generativo produce resultados coherentes pero menos nítidos que esas plantillas. Para una comparativa rigurosa con otros modelos de la categoría, se necesitarían datos adicionales no disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo marca como tal y lo define como opt-in; el comportamiento predeterminado de QtMeshEditor usa plantillas de mocap real.
- Vocabulario muy restringido: solo 13 acciones; cualquier prompt fuera de ese conjunto cae en fallback automático a plantillas.
- Calidad de movimiento inferior a mocap real: el autor indica que el estilo es "más suave y menos nítido" que los clips de CMU.
- Sin benchmarks publicados: no hay métricas objetivas de rendimiento que permitan evaluar la calidad frente a otros sistemas.
- Sin soporte multilingüe declarado: el vocabulario es exclusivamente en inglés.
- Formato de salida específico: genera clips en WORLD-frame con 22 joints; requiere el pipeline de retarget de QtMeshEditor para usarse en otros motores.
- Licencia CC0-1.0: aunque permite uso comercial sin atribución, el modelo se entrenó solo con datos CMU MoCap (comercial-OK), pero no hay garantía legal formal sobre la ausencia de contaminación de datos.
- Sin mantenimiento garantizado: al ser un proyecto personal experimental, no hay compromiso de actualizaciones o soporte.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/fernandotonon/QtMeshEditor-t2m
- Repositorio HuggingFace compartido de modelos (mirror y runtime): https://huggingface.co/fernandotonon/QtMeshEditor-models
- Repositorio GitHub de QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor
- Documentación generada en DeepWiki: https://deepwiki.com/fernandotonon/QtMeshEditor
