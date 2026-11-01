# simaai/Pi0.5-SO101-PickPlace

## Resumen

Pi0.5-SO101-PickPlace es una política robótica específica de tarea derivada de `lerobot/pi05_base` (Pi0.5, el modelo vision-language-action de Physical Intelligence distribuido por LeRobot) y ajustada por simaai sobre 769 demostraciones del conjunto SO-101 Grey Eraser Pick-and-Place. El modelo resuelve una única tarea de manipulación: colocar una goma de borrar gris en una cesta blanca con un brazo seguidor SO-101 de seis grados de libertad. La relevancia no está en el modelo en sí, sino en el formato de entrega: no es un checkpoint de PyTorch, sino un *bundle* compilado y desplegable para el SiMa.ai Modalix DevKit, con grafos compilados en precisión W8A16 y atención compartida en BF16.

El repositorio ocupa 5,0 GB e incluye 38 grafos compilados (un grafo de visión, 18 de entrada de prefijo, uno de atención compartida, 17 de salida de prefijo y uno de experto de acción), junto con el plan de ejecución, constantes de runtime, tokenizador, tabla de embeddings, estadísticas de normalización, observaciones de referencia y activos de lanzamiento del SO-101. No contiene el checkpoint de entrenamiento ni el dataset.

Se trata, por tanto, de un artefacto de despliegue de robótica de borde (edge robotics), no de un modelo de propósito general: no admite conversación libre, no procesa lenguaje natural arbitrario como tarea nueva y su validación se limita a la configuración física de referencia. La licencia heredada es Gemma, lo que condiciona su uso comercial y redistribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (Pi0.5) compilada en grafos; bundle de inferencia para SiMa.ai Modalix |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W8A16 (atención compartida en BF16) |
| Idiomas soportados | no disponible (las instrucciones de tarea se expresan en texto, pero no se documenta cobertura multilingüe) |
| Licencia | Gemma (heredada de `lerobot/pi05_base`); el código de PoLiMa es Apache-2.0 |
| Formato de pesos | Bundle compilado propietario (38 grafos), no safetensors ni GGUF |
| Checkpoint de entrenamiento | Paso 20.000 |
| Pasos de denoising | 10 |
| Salida de acciones | 50 acciones × 6 articulaciones |
| Robot objetivo | SO-101 follower con 6 motores STS3215 (IDs 1–6) |
| Cámaras | Logitech C920 cenital + cámara USB de muñeca, 640×480 MJPG a 30 fps |
| Runtime de referencia | ModelSDK 2.1.3, LLiMa 0.4.0 |
| Dataset de ajuste | 769 demostraciones de SO101-GreyEraser-PickPlace (colección completa: 961 episodios, 272.853 frames) |

## Arquitectura y entrenamiento

El modelo base Pi0.5 es una política vision-language-action que combina un codificador visual, un prefijo de lenguaje (atención compartida entre visión y texto) y un experto de acción que genera secuencias de acciones mediante denoising iterativo. En este bundle, esa arquitectura se materializa en 38 grafos compilados: el prefijo se divide en 18 grafos de entrada y 17 de salida, más un grafo de visión, uno de atención compartida y uno de experto de acción. La inferencia ejecuta 10 pasos de denoising para producir 50 acciones de 6 articulaciones.

El ajuste fino se realizó sobre 769 demostraciones del dataset SO-101 Grey Eraser Pick-and-Place, derivadas de una colección de 961 episodios y 272.853 frames capturados con la configuración física de referencia (cámara cenital a 49 cm sobre la mesa, cesta a unos 32 cm del extremo del brazo). No se documentan en la información disponible detalles sobre composición del dataset, uso de RLHF/DPO ni innovaciones de entrenamiento adicionales. La innovación técnica destacable es la compilación del grafo completo para un acelerador de borde con cuantización mixta W8A16, verificada contra el checkpoint de PyTorch con un margen de fidelidad declarado.

## Capacidades

- Generación de acciones de manipulación robótica: 50 acciones consecutivas de 6 articulaciones por petición de inferencia.
- Percepción visual multi-cámara: procesa simultáneamente vista cenital y vista de muñeca a 640×480 y 30 fps.
- Condicionamiento por instrucción de texto: una instrucción nueva puede seleccionar comportamiento ya aprendido por el checkpoint ajustado, pero no enseña una tarea nueva en tiempo de ejecución.
- Ejecución de una tarea concreta de pick-and-place: colocar la goma de borrar gris en la cesta blanca.
- Inferencia de baja latencia en hardware de borde: 358,5 ms p50 en el runtime Modalix de referencia.
- Verificación numérica offline: reproducción de fixtures empaquetadas sin cámaras ni movimiento del robot.
- No soporta tool calling, function calling, razonamiento multi-paso genérico, matemáticas, generación de código ni diálogo multilingüe: no es un LLM de propósito general.

## Casos de uso

- Despliegue de referencia en SiMa.ai Modalix: el bundle permite arrancar un servidor de inferencia en el DevKit con `polima deploy` y validar la cadena completa de compilación sin necesidad de reentrenar ni reconvertir el modelo.
- Validación de pipelines de compilación VLA: los 38 grafos y las fixtures de ocho casos permiten comprobar la fidelidad numérica W8A16 frente al checkpoint de PyTorch (MAE de acción 0,016 global, 0,037 en el peor paso) antes de tocar hardware físico.
- Demostración de pick-and-place en laboratorio: con un SO-101 calibrado, la cámara C920 cenital y la cámara de muñeca en el encuadre de entrenamiento, el modelo ejecuta la tarea de colocar la goma en la cesta con latencias de ~359 ms p95.
- Benchmark de latencia en robótica de borde: sirve como referencia reproducible para medir *prefill* visión-lenguaje (202,39 ms) y denoising (155,26 ms por 10 pasos) en el acelerador Modalix.
- Base para ajuste fino de tareas análogas: al derivar de `lerobot/pi05_base`, el flujo de entrenamiento puede replicarse con nuevos datasets de demostraciones SO-101 y recompilarse para el mismo runtime.
- Integración en entornos de investigación con WSL: el host de despliegue puede ser Linux o WSL en Windows con SSH, rsync y la CLI de Hugging Face, lo que facilita montar el banco de pruebas desde una estación de trabajo convencional.
- Estudio de degradación por cuantización: la comparación entre el bundle W8A16 y el checkpoint original permite analizar el impacto de la cuantización mixta en políticas de acción continuas.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Latencia p50 del servidor de modelo | 358,5 ms |
| Latencia p95 del servidor de modelo | 359,1 ms |
| Latencia p99 del servidor de modelo | 360,3 ms |
| Prefill visión-lenguaje combinado | 202,39 ms |
| 10 pasos de denoising | 155,26 ms |
| MAE de acción global (fidelidad W8A16 vs. PyTorch) | 0,016 |
| MAE de acción en el peor paso temporal | 0,037 |
| Tasa de éxito física controlada | no registrada |

Las mediciones corresponden a 20 peticiones medidas tras tres calentamientos en el runtime Modalix de referencia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparativas con otras políticas sobre la misma tarea.

## Requisitos de hardware

- Acelerador: SiMa.ai Modalix DevKit con almacenamiento NVMe y runtime compatible; el bundle está compilado específicamente para esta plataforma y no es portable a GPU convencional.
- Host de despliegue: Linux o WSL en Windows, con SSH, rsync y la CLI de Hugging Face.
- Software: ModelSDK 2.1.3 y LLiMa 0.4.0 como versiones de referencia; checkout de PoLiMa en el host y en el DevKit.
- Robot: SO-101 follower con seis motores STS3215 (IDs 1–6), montado y alimentado, calibrado antes del primer uso.
- Cámaras: Logitech C920 cenital y cámara USB de muñeca conectadas al DevKit, con encuadre idéntico al de entrenamiento.
- VRAM estimada: no aplica; no se documenta consumo de memoria del acelerador.
- GPU recomendadas (A100, H100, RTX 4090): no aplica, el artefacto no se ejecuta en GPU.
- Throughput: no disponible más allá de las latencias por petición indicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pi0.5-SO101-PickPlace (este) | VLA compilado para Modalix | Pick-and-place de goma gris en cesta | no disponible | Gemma | Bundle de 5,0 GB en HuggingFace |
| lerobot/pi05_base | VLA base en PyTorch | Política generalista preentrenada | no disponible | Gemma | Checkpoint en HuggingFace |
| Otras políticas SO-101 ajustadas por tarea | VLA ajustado | Tareas específicas sobre SO-101 | no disponible | variable | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a formato de entrega, plataforma objetivo y licencia.

## Limitaciones y advertencias

- Especificidad física: la política está ligada al robot, objeto, cesta, iluminación y encuadres de cámara de referencia; cambios de geometría, encuadre, iluminación o calibración alteran el comportamiento.
- Sin generalización de tarea: una instrucción de texto nueva solo selecciona comportamiento ya aprendido; no permite enseñar una tarea distinta en tiempo de ejecución.
- Sin tasa de éxito medida: la operación física se verificó en el setup de referencia, pero no se registró una tasa de éxito controlada, por lo que no hay garantía cuantificada de fiabilidad en producción.
- Dependencia de plataforma: el bundle solo se ejecuta en SiMa.ai Modalix con el runtime y las versiones de ModelSDK/LLiMa indicadas; no hay pesos en safetensors ni GGUF para otros backends.
- Licencia Gemma: uso comercial y redistribución sujetos a los términos de la licencia Gemma heredada de `lerobot/pi05_base`; es obligatorio revisarlos antes de cualquier despliegue productivo.
- Riesgo de alucinación motora: como política generativa con denoising, puede producir trayectorias plausibles pero incorrectas ante observaciones fuera de distribución; requiere supervisión y paradas de seguridad en el robot.
- Idiomas y sesgos: no se documenta cobertura lingüística ni análisis de sesgos; la instrucción de texto es un canal secundario y no validado más allá de la tarea de referencia.
- Contenido del repositorio: no incluye checkpoint de entrenamiento ni dataset, lo que impide reproducir el ajuste fino solo con este artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simaai/Pi0.5-SO101-PickPlace
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de ajuste: https://huggingface.co/datasets/Priyakarna/SO101-GreyEraser-PickPlace/tree/bfd7c1831092adfb0f02273e390d86bad193d419
- Licencia Gemma (referenciada en la model card del base): https://huggingface.co/lerobot/pi05_base
