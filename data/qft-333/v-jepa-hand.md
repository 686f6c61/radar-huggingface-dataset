# qft-333/V-JEPA-Hand

## Resumen

V-JEPA Hand es un modelo de visión por computador publicado por el usuario qft-333 (identidad no verificada en la información disponible) que reconstruye de forma conjunta el movimiento 3D bilateral de las manos y la trayectoria de la cámara a partir de vídeo egocéntrico, en una sola pasada hacia delante. El repositorio de Hugging Face aloja los pesos de inferencia del artículo «V-JEPA Hand: Simple, Accurate and Fast 3D Hand and Camera Trajectory Recovery from Egocentric Videos» (arXiv 2610.26780).

El modelo se construye sobre un encoder de vídeo V-JEPA 2.1 afinado y suma 607.143.035 parámetros, empaquetados en un único `model.safetensors` dentro de un repositorio de 2,4 GB. La salida es una malla de mano en el espacio paramétrico MANO; los assets de MANO no se distribuyen con los pesos y deben obtenerse por separado bajo la licencia de sus propietarios.

Su interés radica en unificar dos problemas que habitualmente se abordan por separado —pose de manos y estimación de trayectoria de cámara— sin depender de SLAM geométrico ni de optimización iterativa, lo que resulta atractivo para AR/VR, robótica de imitación y anotación automática de datasets egocéntricos. No es un modelo de lenguaje: no genera texto ni acepta instrucciones en lenguaje natural.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder de vídeo V-JEPA 2.1 afinado (transformer, aprendizaje auto-supervisado en espacio latente) con cabezas de predicción para pose de manos y trayectoria de cámara; el diseño exacto de las cabezas no se detalla en la información disponible |
| Parámetros totales | 607.143.035 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (modelo de vídeo; no se especifican número de fotogramas ni resolución de entrada) |
| Tipos de cuantización | No disponible; solo se publican pesos en `safetensors` sin variantes cuantizadas |
| Idiomas soportados | No aplica (modelo de visión); la model card está redactada en inglés |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (`model.safetensors`) + `config.json` con configuración y checksum |
| Tamaño del repositorio | 2,4 GB |
| Pipeline declarado | `other` |
| Entrada / salida | Vídeo egocéntrico → parámetros de mano bilateral (MANO) + trayectoria de cámara; el demo genera vídeo con superposición de mallas (azul mano izquierda, naranja mano derecha) |
| Descargas / likes | 18 / 5 |

## Arquitectura y entrenamiento

La model card es muy escueta: indica únicamente que `model.safetensors` contiene los pesos de inferencia, incluido el encoder V-JEPA 2.1 afinado. V-JEPA es una familia de arquitecturas de predicción conjunta en espacio latente (Joint Embedding Predictive Architecture) entrenadas de forma auto-supervisada sobre vídeo, que predicen representaciones de fotogramas futuros en lugar de píxeles. Sobre esa base, el modelo añade una etapa que resuelve simultáneamente la pose de ambas manos y la trayectoria de la cámara; el mecanismo concreto de decodificación, el número de fotogramas procesados por pasada y la resolución de entrada no se especifican en la información disponible.

Tampoco se detallan el volumen ni la composición del dataset de entrenamiento, la existencia de ajuste fino supervisado con anotaciones MANO, ni el uso de RLHF/DPO (no aplicables en un modelo de este tipo). La innovación declarada por los autores es de tipo metodológico: recuperación conjunta de manos y cámara en una sola pasada, presentada como «simple, precisa y rápida» frente a enfoques por fotograma o pipelines geométricos. La afirmación de rapidez no viene acompañada de métricas de latencia o throughput en la información proporcionada.

## Capacidades

- Reconstrucción 3D de ambas manos (pose y forma) en el espacio paramétrico MANO a partir de vídeo egocéntrico.
- Estimación de la trayectoria de la cámara en la misma pasada que la pose de manos, sin módulo de SLAM separado.
- Procesamiento de vídeo (pipeline `video`), no de imagen suelta ni de texto.
- Generación de mallas para visualización: el demo produce un vídeo silencioso con overlays de color por mano.
- Interfaz Gradio disponible en el repositorio de código para pruebas interactivas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso guiado por instrucciones ni comportamiento de agente.
- No tiene capacidades multilingües ni de generación de texto.
- No se documentan modos especiales (thinking, audio, visión general más allá de la tarea específica).

## Casos de uso

- Anotación automática de datasets egocéntricos: el modelo etiqueta pose de manos y trayectoria de cámara sobre grabaciones de cámaras corporales o gafas inteligentes, reduciendo el coste de anotación manual en corpus de AR/VR e investigación de interacción.
- Robótica de imitación (learning from demonstration): a partir de vídeos egocéntricos de operarios, extraer la cinemática de ambas manos y la trayectoria del punto de vista para construir demostraciones utilizables en políticas de manipulación.
- Análisis de destreza manual en entornos industriales o de cocina: cuantificar tiempos, trayectorias y coordinación bimanual en tareas de montaje o preparación de alimentos grabadas en primera persona.
- AR/VR sin guantes: seguimiento de manos en primera persona para prototipos de interfaz, siempre que la latencia medida en el entorno real resulte aceptable (no publicada).
- Reconstrucción de trayectoria para post-producción y VFX de bajo coste: obtener el movimiento de cámara de un vídeo egocéntrico para integrar elementos virtuales sin equipamiento de motion capture.
- Investigación en rehabilitación y análisis de movimiento: estimar la cinemática de la mano en grabaciones clínicas o domiciliarias, con las cautelas propias de un modelo sin validación clínica publicada.
- Benchmarking interno de pipelines de pose: usar el modelo como referencia para comparar soluciones de seguimiento de manos o de odometría visual en vídeo egocéntrico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 2,4 GB en fp32 (coherente con el tamaño del repositorio) y unos 1,2 GB en fp16/bf16, calculado a partir de los 607 millones de parámetros.
- VRAM total de inferencia: no publicada. Como estimación, la decodificación de vídeo y las activaciones por fotograma suelen dominar el consumo; con clips cortos es razonable esperar un rango de 4-8 GB, pero debe medirse en el entorno real.
- GPU recomendadas: no especificadas por el autor. Por tamaño de pesos, cualquier GPU con 8 GB o más debería poder cargar el modelo; para procesar vídeo a resolución y número de fotogramas altos conviene una A100, H100, L40S o RTX 4090.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, siempre que el pipeline de vídeo no incremente demasiado el uso de memoria.
- Opciones de despliegue: script `demo.py` del repositorio oficial e interfaz Gradio. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (no aplicables a un modelo de visión de este tipo), ni exportaciones a ONNX o TensorRT.
- Dependencia adicional: los ficheros de MANO deben descargarse aparte desde el sitio oficial y colocarse en la ruta indicada (`--mano-dir`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas en la información disponible. Los datos de las alternativas que figuran a continuación no han podido verificarse en las fuentes proporcionadas y se marcan como no disponibles; la comparación es solo cualitativa.

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| V-JEPA Hand | Manos + trayectoria de cámara en una pasada, vídeo egocéntrico | 607.143.035 | No disponible | No disponible | Pesos en Hugging Face |
| HaMeR | Reconstrucción de mano en imagen RGB, por fotograma | No disponible | No aplica | No disponible | Público |
| WiLoR | Reconstrucción de mano en imagen RGB, extremo a extremo | No disponible | No aplica | No disponible | Público |
| V-JEPA 2 (encoder base) | Representaciones de vídeo auto-supervisadas, sin cabeza de pose | No disponible | No aplica | No disponible | Público |

La diferencia funcional principal frente a los reconstructores de mano por fotograma es que V-JEPA Hand modela implícitamente la secuencia y devuelve también la trayectoria de cámara, lo que evita combinar dos sistemas independientes. Frente al encoder V-JEPA 2 sin ajustar, añade las cabezas específicas de la tarea y el ajuste fino correspondiente.

## Limitaciones y advertencias

- Licencia no especificada: sin términos explícitos no puede asumirse uso comercial; es un bloqueo potencial para producción.
- Dependencia de MANO: los assets no se incluyen y su licencia es independiente, con restricciones habituales para uso comercial que deben revisarse en el sitio oficial.
- Sesgos desconocidos: no se documentan la composición del dataset de entrenamiento, la distribución demográfica ni la variedad de condiciones de captura (iluminación, tono de piel, oclusiones, guantes), por lo que el comportamiento fuera de la distribución de entrenamiento es incierto.
- Riesgo de error en pose: la reconstrucción monocular de manos es propensa a ambigüedades de profundidad, autoclusión y manos fuera de encuadre; no se publican métricas de error que permitan acotar la precisión.
- Trayectoria de cámara: al no apoyarse en SLAM geométrico declarado, la deriva en secuencias largas es un riesgo plausible que no se cuantifica en la información disponible.
- Sin datos de benchmarks, latencia ni requisitos de hardware: cualquier decisión de producción exige una evaluación propia.
- Idiomas: no aplica; no es un modelo de texto. La documentación solo está en inglés.
- Madurez: 18 descargas y 5 likes en el momento de la consulta; validación comunitaria prácticamente nula.
- Búsqueda web sin resultados relevantes: las consultas realizadas devolvieron páginas sobre teoría cuántica de campos y la transformada cuántica de Fourier, ajenas a este modelo, por lo que no se ha podido contrastar información adicional fuera de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qft-333/V-JEPA-Hand
- Artículo (arXiv 2610.26780): https://huggingface.co/papers/2610.26780
- Página del proyecto: https://qft-333.github.io/V-JEPA-Hand-Page/
- Código e instrucciones de instalación: https://github.com/qft-333/V-JEPA-Hand
- Assets MANO (licencia independiente): https://mano.is.tue.mpg.de/
