# Donghyun1228/pi05-libero-all-module-relation-retention-yaw30-1000-20261014

## Resumen

Este repositorio contiene un checkpoint experimental de robótica del tipo visión-lenguaje-acción (VLA), publicado por el usuario Donghyun1228 bajo la librería openpi. Se trata de un artefacto de investigación, no de un modelo de producción: la model card lo describe como el resultado de un experimento de "relación entre todos los módulos" (all-module relation) con yaw30 y un brazo de retención, tras 1000 actualizaciones de entrenamiento. El repositorio ocupa 13,1 GB y mezcla pesos en FP32 (módulos entrenables vision23, LLM9 y expert11) con pesos en BF16 (native frozen8 y source wrist23). El checkpoint se publica con 0 descargas y 0 "likes", y no declara licencia ni idiomas soportados.

El interés técnico del artefacto está en su metodología, no en una reivindicación de rendimiento: el autor entrena con un objetivo de relación sobre una estimación de flujo principal de un solo paso (t=1) en lugar del sampler completo, con un profesor desacoplado que combina la visión actual con el LLM y el expert preentrenados, y con invariancia de Gram que admite reflexiones. El entrenamiento no utiliza observaciones del entorno fuente, ni caché de salidas fuente, ni señal de éxito.

La evaluación declarada se realiza en el benchmark LIBERO: 40 tareas por 10 episodios, semilla de entorno 17, MuJoCo 3.2.3 y 8 clientes por GPU. El propio autor advierte explícitamente de que este checkpoint individual no establece retención, y de que la pérdida IDM no es su métrica de éxito, por lo que cualquier uso debe enmarcarse en reproducción de experimentos y ablaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) con módulos diferenciados de visión (vision23), LLM (LLM9) y expert de acción (expert11), más native frozen8 y source wrist23; sin más detalle publicado |
| Parametros totales | no disponible (el repositorio ocupa 13,1 GB con pesos en FP32 y BF16) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ; los pesos se distribuyen en FP32 y BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Pesos FP32 (vision23, LLM9, expert11) y BF16 (native frozen8, source wrist23); no se especifica el contenedor de serialización. Inferencia declarada como "BF16 restore" |

## Arquitectura y entrenamiento

La model card no describe la arquitectura completa, solo su descomposición en módulos con distinto tratamiento: vision23, LLM9 y expert11 son entrenables y están en FP32, mientras que native frozen8 y source wrist23 permanecen congelados y en BF16. El entrenamiento se detiene en 1000 actualizaciones y se publican los parámetros raw, no los promediados por EMA, junto con los activos de normalización originales. El brazo de retención usa un único lambda=1, y el control escalar preserva la dirección y los momentos de Adam del IDM mientras iguala la norma de la propuesta candidata en el mismo estado.

El objetivo de relación se apoya en un profesor desacoplado que combina la visión actual con el LLM y el expert preentrenados, y emplea una estimación de flujo principal de un solo paso (t=1), no el sampler completo; la invariancia de Gram permite reflexiones. No entran en el entrenamiento observaciones del entorno fuente, caché de salidas del entorno fuente ni retroalimentación de éxito. Las instrucciones objetivo existentes condicionan la política. Los datos objetivo declarados son el conjunto `Donghyun1228/libero-dense-contact-sweep-d2-yaw30-20261003` (commit 7cfd3ca8528c59c1ce700d4d75b560db39f7a5e7). La inicialización real utilizó una fuente local legacy "native51"; el repositorio `pi05-libero-main-policy-retention-source-split74-20261013` (commit 24268da2aba5f690c879788d98e3455a2a579d8f) se cita como referencia de despliegue canónicamente equivalente, no como entrada real de inicialización.

## Capacidades

- Generación de acciones de manipulación robótica condicionadas por instrucciones de lenguaje, en el marco del benchmark LIBERO y del entorno MuJoCo 3.2.3.
- Condicionamiento por instrucciones objetivo: la política se condiciona con las instrucciones existentes del conjunto objetivo, no con instrucciones nuevas generadas.
- Entrenamiento sin acceso al entorno fuente: no se emplean observaciones, caché de salidas ni señal de éxito del dominio de origen.
- Soporte de objetivos de relación basados en invariancia de Gram, que admiten reflexiones como transformación válida.
- Estimación de flujo principal de un solo paso (t=1) en el objetivo de relación; no equivale al sampler completo de inferencia.
- Evaluación reproducible en simulación: 40 tareas por 10 episodios, semilla de entorno 17, 8 clientes por GPU.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales adicionales (modo thinking, visión general, audio): no disponible; la presencia de módulos de visión se deduce de la nomenclatura de la model card, no de una descripción funcional.

## Casos de uso

- Investigación sobre retención de políticas en ajuste fino: comparar este checkpoint (brazo de retención con lambda=1) frente a variantes sin retención permite estudiar si la capacidad de manipulación se conserva tras el ajuste. El propio autor advierte de que un checkpoint aislado no demuestra retención, por lo que el uso adecuado es comparativo y con múltiples semillas.
- Ablaciones por módulo: la separación explícita entre módulos entrenables (vision23, LLM9, expert11, en FP32) y congelados (native frozen8, wrist23, en BF16) facilita experimentos de congelación selectiva y análisis de contribución por bloque.
- Reproducción de experimentos en LIBERO: el protocolo declarado (40 tareas x 10 episodios, semilla 17, MuJoCo 3.2.3) permite replicar la evaluación siempre que se preserve el JSON de resultados original, que según la model card conserva los resultados reales.
- Estudio de objetivos de relación alternativos: el uso de una estimación de flujo principal de un solo paso en lugar del sampler completo es un punto de partida para investigar objetivos de entrenamiento más baratos computacionalmente que el muestreo completo.
- Evaluación de despliegue cliente-servidor en robótica simulada: el ajuste declarado de 8 clientes por GPU sirve como referencia para medir si una infraestructura concreta soporta el paralelismo de evaluación requerido.
- Aprendizaje sin dominio fuente (source-free): útil en escenarios donde no se puede acceder a las observaciones del entorno original por restricciones de datos o de propiedad, ya que el entrenamiento declarado no las utiliza.
- Generación de datos y análisis de contacto denso: el conjunto objetivo `libero-dense-contact-sweep-d2-yaw30` apunta a tareas de barrido con contacto denso, un caso de uso habitual para estudiar robustez en interacciones físicas prolongadas.
- Referencia de despliegue canónica: la variante `pi05-libero-main-policy-retention-source-split74-20261013` se cita como referencia equivalente para despliegue, lo que permite usarla como punto de comparación en pipelines de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluación, pero no incluye cifras de éxito ni tablas comparativas.

| Aspecto de evaluacion | Detalle declarado |
|---|---|
| Benchmark | LIBERO |
| Volumen | 40 tareas x 10 episodios |
| Semilla de entorno | 17 |
| Simulador | MuJoCo 3.2.3 |
| Paralelismo | 8 clientes por GPU |
| Emparejamiento | Las peticiones de política comparten un flujo RNG del servidor y no están emparejadas por episodio |
| Metricas numericas | no disponible |
| Resultados (MMLU, HumanEval, GSM8K u otros) | no aplica / no disponible; el modelo es una política de manipulación, no un LLM de propósito general |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. Como estimación aproximada a partir del tamaño del repositorio (13,1 GB con pesos FP32 y BF16) y de la restauración declarada en BF16, cabe esperar un peso en memoria del orden de 7 a 10 GB si se convierte todo a BF16, más activaciones y el coste del simulador MuJoCo; una reserva práctica de 16 a 24 GB por GPU es un punto de partida razonable, pero debe verificarse experimentalmente.
- GPU recomendadas: no disponible. Para el ajuste declarado de 8 clientes por GPU, tienen sentido aceleradores de gama profesional o de centro de datos (A100, H100, L40S) por memoria y número de conexiones concurrentes; no hay confirmación del autor.
- GPU de consumo: no confirmado. Una RTX 4090 (24 GB) o similar podría alojar la inferencia en BF16 según la estimación anterior, pero el checkpoint completo en FP32 más el entorno de simulación puede exceder esa memoria; no hay datos publicados.
- Opciones de despliegue: el modelo se distribuye para la librería openpi, que es la vía de ejecución prevista. vLLM, llama.cpp, Ollama y TGI no están indicados ni confirmados como compatibles con esta arquitectura de política VLA.
- Latencia y throughput: no disponible. La model card menciona una estimación de flujo principal de un solo paso, pero enmarcada en el objetivo de entrenamiento, no como garantía de inferencia en un solo paso; no se debe extrapolar a latencia de despliegue.
- Almacenamiento: 13,1 GB de repositorio, más el espacio de los activos de normalización, los datos objetivo y el propio simulador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-all-module-relation-retention-yaw30-1000 (este) | no disponible (repo de 13,1 GB) | no disponible | no disponible (solo protocolo de evaluación) | no disponible | HuggingFace, 0 descargas, 0 likes |
| Familia pi0 / pi0.5 (Physical Intelligence, librería openpi) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | Ecosistema openpi, del que depende la nomenclatura pi05 de este checkpoint |
| Otras políticas VLA de manipulación (por ejemplo, familias basadas en backbones visión-lenguaje con cabeza de acciones) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de cifras verificables de parámetros, contexto, rendimiento ni licencia de las alternativas dentro de la información proporcionada, por lo que cualquier comparación cuantitativa sería especulativa. Cualitativamente, este checkpoint pertenece a la categoría de políticas VLA entrenadas sobre datos de manipulación en simulación, y su rasgo diferencial es la separación de módulos congelados y entrenables en distintas precisiones, junto con un objetivo de relación de un solo paso, elementos que no se documentan en las alternativas genéricas.

## Limitaciones y advertencias

- Carácter experimental: el propio repositorio se etiqueta como experimental y el autor afirma expresamente que este checkpoint individual no establece retención.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de reproducibilidad.
- Licencia no disponible: no puede asumirse uso comercial ni redistribución; la ausencia de licencia es un bloqueo para producción.
- Idiomas no disponibles: no se especifica qué lenguas soportan las instrucciones de condicionamiento.
- Ausencia de métricas: no se publican cifras de éxito ni tasas de fallo, por lo que no es posible estimar el rendimiento esperado.
- Ambigüedad de la métrica de éxito: según la model card, la pérdida IDM no es la métrica de éxito y ningún resultado del entorno fuente se considera evidencia de retención de manipulación.
- Protocolo de evaluación no emparejado: las peticiones de política comparten un flujo RNG del servidor y no están emparejadas por episodio, lo que limita comparaciones finas entre configuraciones.
- Riesgo de reproducibilidad en la inicialización: la inicialización real usó una fuente local legacy ("native51"), mientras que el repositorio split74 citado es una referencia canónicamente equivalente, no la entrada real; replicar exactamente el entrenamiento puede no ser posible.
- Huella de memoria elevada: la mezcla de pesos FP32 y BF16 en un repositorio de 13,1 GB incrementa los requisitos de almacenamiento y de memoria frente a una distribución puramente BF16.
- Alcance de aplicación restringido: el modelo se enmarca en manipulación robótica simulada (LIBERO, MuJoCo 3.2.3); no hay evidencia documentada de transferencia a robots físicos.
- Alucinación y fallos de política: no se documentan tasas de acciones inválidas o inseguras; en robótica este riesgo debe validarse antes de cualquier despliegue con hardware real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-all-module-relation-retention-yaw30-1000-20261014
- Datos objetivo citados en la model card: `Donghyun1228/libero-dense-contact-sweep-d2-yaw30-20261003` (commit 7cfd3ca8528c59c1ce700d4d75b560db39f7a5e7), sin URL explícita en la model card.
- Referencia de despliegue citada: `Donghyun1228/pi05-libero-main-policy-retention-source-split74-20261013` (commit 24268da2aba5f690c879788d98e3455a2a579d8f), sin URL explícita en la model card.
- Referencia de inferencia citada: `pi05_libero_source_free_split_vision_idm` (commit 0f6471d99dfc81fabe7c3ab65c141d7640b9ff08), sin URL explícita en la model card.
- Librería declarada en los tags: openpi (https://github.com/Physical-Intelligence/openpi).
- Benchmark LIBERO y simulador MuJoCo 3.2.3: mencionados en la model card sin enlace asociado.
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
