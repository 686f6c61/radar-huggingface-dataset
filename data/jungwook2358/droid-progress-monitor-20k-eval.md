# jungwook2358/droid-progress-monitor-20k-eval

## Resumen

`jungwook2358/droid-progress-monitor-20k-eval` es un conjunto de cabezas de inferencia (P-image, P-video y R-video) para monitorizar el progreso y el completado de tareas en manipulación robótica. Lo publica el usuario de Hugging Face jungwook2358 y no es un modelo generativo: son pesos exportados de un trabajo de entrenamiento (job269925) congelados exactamente en el paso 20.000, verificados tensor a tensor contra el checkpoint original. El repositorio ocupa 0,2 GB e incluye únicamente los pesos de las cabezas y el paquete `progress_monitor` con el código de inferencia; no contiene el backbone, ni estado del optimizador, ni ejemplos de entrenamiento.

El modelo resuelve un problema concreto en pipelines de robótica: estimar en qué punto de una tarea se encuentra un episodio a partir de observaciones RGB y propiocepción, sin necesidad de anotaciones manuales. Funciona como un cabezal ligero sobre una torre de comprensión congelada, `Cosmos3-Nano-Policy-DROID`, que el usuario debe obtener por separado y cuyos términos de acceso y licencia son independientes de este repositorio. Las cabezas se entrenaron con proxies temporales, de modo que la señal de "completado" no equivale a éxito verificado de la tarea.

Su relevancia ahora es acotada y experimental: es un artefacto de evaluación asociado a experimentos RoboLab, con validación offline pero sin transferencia verificada al entorno real. La información pública disponible es muy escasa (0 descargas, 0 likes, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks), por lo que debe tratarse como material de investigación reproducible más que como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de monitorización de progreso/completado (P-image, P-video, R-video) sobre torre de comprensión congelada Cosmos3-Nano-Policy-DROID; arquitectura interna de las cabezas no documentada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. Ventana temporal: 8 fotogramas alineados que cubren 2 segundos a 15 Hz nominales (P-video y R-video); 1 fotograma (P-image) |
| Tipos de cuantizacion | no disponible; se distribuyen pesos en safetensors sin documentar cuantización |
| Idiomas soportados | no disponible; el modelo no procesa texto, sino RGB y propiocepción |
| Licencia | no disponible en la información proporcionada; la torre Cosmos3-Nano-Policy-DROID tiene acceso y licencia separados |
| Formato de pesos | safetensors (`model.safetensors`), cargable con `safetensors.torch.load_file` |
| Entradas | P-image: 1 fotograma RGB; P-video/R-video: 8 fotogramas RGB + propiocepción alineados |
| Salidas | Clases relativas de progreso con orden `[-, 0, +]` |
| Paso de entrenamiento | 20.000 (job269925) |
| Tamaño del repositorio | 0,2 GB |
| Integridad | `manifest.json` con tamaños exactos y hashes SHA256 de cada fichero |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no es un transformer completo ni un modelo autónomo: son tres cabezas de predicción (P-image, P-video y R-video) que consumen las características extraídas en vivo por una torre de comprensión congelada, `Cosmos3-Nano-Policy-DROID`. Los pesos distribuidos se corresponden exactamente con los tensores del checkpoint original en el paso 20.000; no se incluyen estado del optimizador, estado del RNG, ejemplos de entrenamiento ni los pesos del backbone. Tampoco se distribuye caché de dataset ni de características: las características congeladas se calculan en el momento de la inferencia.

Cada cabeza tiene un contrato de entrada distinto: P-image trabaja con un único fotograma, mientras que P-video y R-video usan ocho fotogramas RGB y propiocepción alineados que abarcan dos segundos a 15 Hz nominales. La normalización, las capas de características, el montaje de imágenes y los contratos de marcas de tiempo se especifican en `config.json`. El entrenamiento se plantea con proxies temporales de progreso y completado, sin verificación explícita de éxito, y con una decisión de diseño relevante: el monitor observa la tarea completa original, no la subtarea cambiante que un agente de recuperación redacta para Cosmos. No se detallan en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Estimación de progreso de tarea en robótica de manipulación a partir de observaciones visuales y propioceptivas.
- Tres variantes de inferencia: P-image (un fotograma), P-video (ventana de 8 fotogramas) y R-video (ventana de 8 fotogramas, variante de referencia del mismo esquema).
- Clasificación relativa en tres clases con orden fijo `[-, 0, +]`, útil para detectar avance, estancamiento o retroceso.
- Señal de completado entrenada como proxy temporal, pensada para monitorización, no para verificación de éxito.
- Integración con la torre congelada Cosmos3-Nano-Policy-DROID, reutilizando sus características sin reentrenar el backbone.
- Reproducibilidad verificable: hashes SHA256 y tamaños exactos en `manifest.json`, más igualdad tensor a tensor con el checkpoint original.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de tipo textual.
- No tiene capacidades multilingües ni generación de texto.
- No incluye visión general, audio ni modo "thinking".

## Casos de uso

- Monitorización en línea de una política robótica: ejecutar P-video sobre la ventana de 8 fotogramas a 15 Hz para obtener, cada dos segundos, si la tarea avanza, se estanca o retrocede, y activar una intervención cuando la clase dominante sea `-`.
- Detección de estancamiento y disparo de reintentos: usar la clase `0` sostenida en varias ventanas consecutivas como señal de que la política no progresa, antes de que se agote el presupuesto de tiempo del episodio.
- Etiquetado automático de episodios para curación de datos: recorrer grabaciones DROID con R-video y anotar tramos de progreso, de forma que se puedan filtrar episodios incompletos o mal segmentados antes de reentrenar.
- Evaluación offline de checkpoints de política: comparar la curva de progreso estimada por el monitor entre dos versiones de una política sobre el mismo conjunto de episodios, como métrica auxiliar barata frente a la evaluación en simulador.
- Supervisión de bajo coste con P-image: en plataformas con cómputo limitado, usar la variante de un solo fotograma para un chequeo rápido de estado sin mantener la ventana temporal completa.
- Análisis post-hoc de logs de robot: procesar vídeos e propriocepción ya registrados para reconstruir en qué instante se completó cada fase de la tarea y cruzar esa información con las acciones ejecutadas.
- Señal auxiliar para curriculum o recompensa shaping: emplear la probabilidad de progreso como término adicional en experimentos de aprendizaje por refuerzo, siempre con validación propia y sin asumir que equivale a éxito.
- Estudios de recuperación ante fallos: contrastar si el monitor, que ve la tarea original completa, detecta el estancamiento cuando un agente de recuperación ha reescrito la subtarea para Cosmos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la validación offline existe, pero explícitamente advierte de que no constituye evidencia de éxito en RoboLab y de que la transferencia a RoboLab y los umbrales de gate no se han validado.

## Requisitos de hardware

- VRAM para las cabezas: el repositorio completo ocupa 0,2 GB, por lo que los pesos de las tres cabezas son de tamaño reducido; no se publica el desglose por fichero más allá de `manifest.json`.
- VRAM para el backbone: no disponible. La torre Cosmos3-Nano-Policy-DROID se obtiene por separado y domina el consumo de memoria; hay que consultar su propia ficha para el requisito real.
- GPU recomendadas: no disponible en la información proporcionada. Al extraerse las características congeladas en vivo, se necesita una GPU capaz de ejecutar el backbone de Cosmos, no solo las cabezas.
- ¿Cabe en GPU de consumo? No disponible. Las cabezas por sí solas sí cabrían con holgura; el backbone condiciona la respuesta.
- Opciones de despliegue: carga directa en PyTorch con `safetensors.torch.load_file` y la clase `ProgressMonitor` del paquete `progress_monitor` incluido. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia de diseño, la ventana de P-video y R-video cubre 2 segundos de observación a 15 Hz nominales, lo que fija la cadencia natural de actualización de la señal.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos comparables de monitorización de progreso robótico con los que establecer una comparación de parámetros, contexto, rendimiento o licencia. La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo ni sobre alternativas de la misma categoría.

## Limitaciones y advertencias

- La señal de completado se entrenó como proxy temporal: no es éxito de tarea verificado. No debe usarse como criterio único de evaluación.
- La validación offline no es evidencia de éxito en RoboLab; la transferencia a RoboLab y los umbrales de gate no han sido validados por el autor.
- Requiere obtener por separado la torre Cosmos3-Nano-Policy-DROID en la revisión indicada en `config.json`, con acceso y licencia independientes; sin ella los pesos no son utilizables.
- Licencia del repositorio no declarada: no hay autorización explícita para uso comercial. Verificar antes de cualquier despliegue productivo.
- El monitor observa la tarea completa original, no la subtarea que un agente de recuperación pueda haber redactado para Cosmos; esto puede generar discrepancias en flujos con reescritura de subtareas.
- No se distribuye caché de dataset ni de características: cada inferencia extrae características congeladas en vivo, con el coste computacional asociado.
- Dominio restringido a manipulación robótica tipo DROID; no hay evidencia de generalización a otros robots, cámaras o tasas de refresco distintas de los 15 Hz nominales.
- Ventana temporal de solo 2 segundos: tareas largas requieren agregar varias ventanas y definir la lógica de acumulación por cuenta propia.
- Riesgo de falsos positivos de progreso: al ser un proxy aprendido sin verificación de éxito, puede marcar avance en episodios que en realidad estén fallando.
- Publicación con 0 descargas y 0 likes, sin benchmarks ni métricas publicadas: madurez y robustez no contrastadas por terceros.
- Sin soporte de texto, tool calling, agentes ni multilingüismo; no es sustituible por un LLM en ninguna de esas funciones.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/droid-progress-monitor-20k-eval
- Repositorio de la torre congelada Cosmos3-Nano-Policy-DROID: no disponible (referenciada en la model card, con acceso y licencia separados; la revisión concreta está en `config.json`)
- Paper, blog o demo del modelo: no disponible
- Resultados de la búsqueda web: sin enlaces técnicos relevantes; el único resultado devuelto fue un anuncio de venta de dominio sin relación con el modelo
