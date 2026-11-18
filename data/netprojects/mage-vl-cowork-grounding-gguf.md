# netprojects/Mage-VL-Cowork-Grounding-GGUF

## Resumen

Mage-VL-Cowork-Grounding-GGUF es una compilación en formato GGUF del fine-tune de NetProjects sobre microsoft/Mage-VL-Cowork, un modelo híbrido de 4B parámetros orientado a agentes de uso de ordenador (computer-use). El modelo original combina un modelo de lenguaje Qwen3-4B con una torre de visión Mage-ViT y está entrenado para operar entornos mediante dos herramientas: `computer_use` (clic sobre elementos de una captura de pantalla) y `bash` (ejecución de comandos de shell). Este fine-tune se centra específicamente en la capacidad de grounding visual, es decir, acertar el elemento correcto sobre el que hacer clic a partir de una instrucción en lenguaje natural y una captura de pantalla.

La relevancia del modelo radica en la mejora medida de la precisión de clic: sobre ScreenSpot-v2, el fine-tune acierta el objetivo el 72% de las veces frente al 13% del original bajo el mismo entorno de evaluación (capturas de hasta 1.000.000 píxeles, decodificación greedy). Publicado por NetProjects (Internet Projects Ltd) el 18 de noviembre de 2026 bajo licencia Apache-2.0, no está afiliado a Microsoft.

Se distribuye como builds GGUF para llama.cpp, con cuantizaciones desde Q4_K_M hasta BF16, más un proyectador multimodal (mmproj) separado para la torre de visión. Está pensado para desplegarse con `llama-server` y requiere llama.cpp v1.0.0 o superior, con soporte de Mage-VL introducido en el PR #31819.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: LLM Qwen3-4B + torre de visión Mage-ViT (modelo multimodal image-text-to-text) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de despliegue usa `-c 16384`) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, BF16 (LLM); Q8_0 y BF16 para mmproj |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es multimodal image-text-to-text: un LLM Qwen3-4B acoplado a una torre de visión Mage-ViT que permanece sin cambios respecto al modelo base. El fine-tune se realizó mediante LoRA (rank 16, alpha 32) aplicado a las capas de atención y MLP del modelo de lenguaje, posteriormente fusionado en los pesos. La pérdida se calcula únicamente sobre la respuesta del asistente. Cada prompt de entrenamiento se construye con el propio código de agente de Microsoft, de modo que coincide con lo que el agente envía en tiempo de ejecución.

Los datos de entrenamiento (todos Apache-2.0) combinan ejemplos de grounding de un solo clic de OS-Atlas-data (macOS, Windows, Linux, Android y web) y Aria-UI_Data (escritorio, web y móvil), pasos multi-paso de teléfono del split de entrenamiento de AndroidControl, y turnos de agente del propio modelo base (incluido el enrutado a `bash`) para preservar su comportamiento de agente existente. Las capturas se redimensionan a un máximo de 1.000.000 píxeles. Como medida de rigor, cada captura de entrenamiento se comparó con todas las imágenes de ScreenSpot-v2 y con los episodios de test de AndroidControl mediante hashes exactos y perceptuales, eliminando las coincidencias antes del entrenamiento.

## Capacidades

- Grounding visual de un solo clic: localiza y selecciona el elemento correcto de una captura de pantalla a partir de una instrucción en lenguaje natural, con coordenadas en el rango `[0, 999]`.
- Uso de ordenador mediante la herramienta `computer_use` (clic sobre elementos de la GUI).
- Ejecución de comandos mediante la herramienta `bash`, con enrutado aprendido desde los turnos del modelo base.
- Comportamiento de agente híbrido multi-paso: encadena hasta al menos 5 pasos en el bucle de agente de Microsoft.
- Soporte de tool calling / function calling: 16 de 16 llamadas a herramientas válidas en las pruebas del autor.
- Procesamiento de imágenes: texto e imagen como entrada (pipeline image-text-to-text).
- No es un modelo de chat general: sin prompt de agente tiende a responder con llamadas a herramientas. El soporte de chat plano está previsto para una versión posterior.

## Casos de uso

- Automatización de tareas de escritorio: el modelo recibe una captura de pantalla y una instrucción y devuelve la coordenada del elemento a clicar, integrándose en un bucle de agente que ejecuta la acción y vuelve a capturar la pantalla. Su precisión del 51,9% en escritorio (ScreenSpot-v2) lo hace útil para flujos guiados con verificación posterior.
- Agentes móviles multi-paso: entrenado con pasos de AndroidControl, alcanza un 47,1% de éxito por paso en episodios de test, adecuado para automatizar tareas de teléfono encadenadas con comprobación de estado.
- Automatización web: con un 76,7% de acierto en ScreenSpot-v2 web, puede usarse para rellenar formularios, navegar menús y localizar controles en aplicaciones web dentro de un agente de navegador.
- Agente de shell controlado: enruta tareas de línea de comandos a `bash` (19 de 30 tareas de shell retenidas), útil para pipelines de administración de sistemas donde la acción de shell es preferible al clic.
- Pruebas de regresión de interfaces: dado que acierta el objetivo en el 72% de los casos, puede emplearse para generar acciones automáticas sobre capturas de UI y comparar el comportamiento esperado frente al real en suites de QA.
- Despliegue local con llama.cpp: los builds Q4_K_M (2,7 GB) y Q6_K (3,6 GB) permiten ejecutar el agente en hardware modesto mediante `llama-server`, con el mmproj Q8_0 (354 MB) para la visión.
- Investigación en grounding visual: al ser un fine-tune reproducible sobre datasets Apache-2.0 y con test sets limpios, sirve como referencia para estudiar mejoras de grounding por LoRA sobre modelos computer-use.

## Benchmarks y rendimiento

Resultados del autor, medidos offline y en modo greedy con el build MLX del checkpoint fine-tuneado, sobre capturas de hasta 1.000.000 píxeles y con el mismo harness para ambos modelos:

| Prueba | Mage-VL-Cowork | Este fine-tune |
|---|---|---|
| ScreenSpot-v2, 300 muestras de un clic | 13,0% | 72,0% |
| · escritorio / móvil / web | 10,1 / 16,1 / 11,7% | 51,9 / 81,4 / 76,7% |
| Bucle de agente, hasta 5 pasos, 100 tareas ScreenSpot-v2 | 13% | 68% |
| AndroidControl, 70 episodios de test, 333 pasos: éxito por paso | 11,7% | 47,1% |
| · clic dentro del 14% del objetivo | 11,2% | 48,0% |
| · tipo de acción correcto | 67,9% | 73,3% |
| Elige `bash` en 30 tareas de shell retenidas | 3 / 30 | 19 / 30 |
| Llamadas a herramientas válidas en 16 prompts de agente | 15 / 16 | 16 / 16 |

El propio autor advierte que la configuración de servicio de Microsoft reporta una puntuación ScreenSpot superior para el original (unos 43%, según un comentario en su código de servicio SGLang) que el 13% obtenido aquí a 1M píxeles, por lo que la brecha frente al mejor setup de Microsoft es menor de lo que muestra la tabla. Los builds GGUF superan las comprobaciones rápidas de agente del autor a través de `llama-server`.

## Requisitos de hardware

- VRAM estimada para el LLM: Q4_K_M 2,7 GB; Q6_K 3,6 GB; Q8_0 4,7 GB; BF16 8,8 GB.
- Torre de visión adicional: mmproj Q8_0 354 MB; mmproj BF16 663 MB.
- En total, la configuración recomendada (Q6_K + mmproj Q8_0) ocupa unos 3,9 GB de pesos, por lo que cabe en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060/4060 Ti, RTX 4070/4080/4090). La variante BF16 (8,8 GB + 663 MB) requiere GPUs de 12-16 GB o más.
- GPU de datacenter (A100, H100) no son necesarias para este tamaño; resultan sobredimensionadas salvo para servir muchas instancias concurrentes.
- Opciones de despliegue: llama.cpp mediante `llama-server` (requiere v1.0.0 o superior, PR #31819) con `--mmproj` y `--jinja`; builds MLX disponibles en el repo hermano para Apple Silicon.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScreenSpot-v2 (un clic) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mage-VL-Cowork-Grounding (este) | 4,4B | no disponible | 72,0% | Apache-2.0 | GGUF y MLX |
| microsoft/Mage-VL-Cowork (base) | 4B | no disponible | 13,0% (43% según el setup de Microsoft) | Apache-2.0 | pesos originales |
| Modelos de grounding GUI de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que la información proporcionada no incluye datos de benchmarks de alternativas de la misma categoría. No se dispone de cifras de contexto ni de comparaciones con otros modelos de grounding GUI.

## Limitaciones y advertencias

- No es un modelo de chat general: sin prompt de agente tiende a emitir llamadas a herramientas en lugar de respuestas conversacionales. El chat plano está previsto para una versión futura.
- Debe ejecutarse con los system prompts y el formato de turnos de Microsoft (ver la model card del original); el comportamiento fuera de ese formato no está garantizado.
- Las coordenadas siguen el rango `[0, 999]` y deben convertirse con `x_px = round(x / 999 * (width - 1))`; un mal mapeo degrada la precisión.
- Las capturas se limitan a 1.000.000 píxeles (`clip.vision.image_max_pixels`), el tamaño de entrenamiento y prueba; capturas mayores alteran el rendimiento medido.
- Precisión de grounding aún modesta en escritorio (51,9% en ScreenSpot-v2), con más errores que en móvil (81,4%) y web (76,7%).
- Rendimiento de agente multi-paso limitado: 47,1% de éxito por paso en AndroidControl y 68% en el bucle de agente de 5 pasos; requiere verificación de estado y manejo de fallos en producción.
- Riesgo de alucinación en coordenadas y de acciones incorrectas sobre la interfaz; el autor recomienda ejecutar el agente en un sandbox, como aconseja Microsoft.
- Sesgos no documentados en la información disponible; los datasets de entrenamiento cubren macOS, Windows, Linux, Android y web, pero no se detalla su composición demográfica ni lingüística.
- Licencia Apache-2.0 permite uso comercial; el archivo `NOTICE` acredita a Microsoft, Alibaba Cloud (Qwen), OS-Atlas, Aria-UI y AndroidControl.
- El proyecto no está afiliado a Microsoft; es un fine-tune de terceros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-GGUF
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Build MLX hermano: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-6bit
- PR de soporte Mage-VL en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31819
- Dataset OS-Atlas-data: https://huggingface.co/datasets/OS-Copilot/OS-Atlas-data
- Dataset Aria-UI_Data: https://huggingface.co/datasets/Aria-UI/Aria-UI_Data
- AndroidControl: https://github.com/google-research/google-research/tree/master/android_control
- Organización NetProjects en Hugging Face: https://huggingface.co/netprojects
- Web de NetProjects: https://netprojects.com
