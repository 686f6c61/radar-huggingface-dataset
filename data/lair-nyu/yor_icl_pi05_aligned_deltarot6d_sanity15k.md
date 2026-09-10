# lair-nyu/yor_icl_pi05_aligned_deltarot6d_sanity15k

## Resumen

El modelo `lair-nyu/yor_icl_pi05_aligned_deltarot6d_sanity15k` es una política robótica de tipo vision-language-action (VLA) entrenada sobre el backbone pi0.5 mediante el framework openpi. Lo publica la organización `lair-nyu` (LAIR, NYU) y su propósito es servir de verificación de cordura ("sanity check") de un pipeline de entrenamiento concreto: un subconjunto de cuatro tareas de pick-and-place, 15.000 pasos de entrenamiento, batch de 256 y cuatro GPU H200. No es, por tanto, un modelo de propósito general, sino un artefacto de validación experimental.

La aportación técnica del checkpoint es la coherencia entre el espacio de acciones y el de propiocepción. La política consume como estado la pose absoluta del efector final (cuaternión más xyz por brazo, obtenida por cinemática directa desde los encoders reales de las articulaciones y con corrección de hemisferio del cuaternión) y produce como acción un delta de posición relativo a una ventana por brazo más una orientación absoluta en rot6d. Esto corrige el desajuste entre modalidades de una versión anterior del mismo autor, `pi05_extended_deltarot6d_full`, que condicionaba la misma acción en espacio de efector final sobre un estado en espacio articular.

El repositorio ocupa 12,4 GB e incluye únicamente `params/` (pesos desplegables de la política) y `assets/` (estadísticas de normalización y similares); no incluye `train_state/`, por lo que no permite reanudar exactamente esa ejecución. El checkpoint corresponde al paso 14.999. La model card no declara licencia, idiomas, benchmarks ni pipeline, y el repositorio registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) sobre backbone pi0.5 de openpi; detalles de capas, atención y cabezas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; ventana temporal de acciones no documentada) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (política robótica; no se documentan idiomas de instrucción) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | no disponible; el repo contiene directorios `params/` y `assets/`, sin especificar formato de serialización (safetensors, GGUF u otro) |
| Tamano del repositorio | 12,4 GB |
| Paso del checkpoint | 14999 |
| Contenido del repo | `params/` (pesos desplegables) y `assets/` (estadísticas de normalización); sin `train_state/` |
| TrainConfig | `yor_icl_pi05_aligned_deltarot6d_sanity15k` |
| Espacio de estado (proprioception) | pose absoluta de efector final por brazo (xyz + cuaternión), obtenida por cinemática directa desde encoders articulares y con corrección de hemisferio del cuaternión |
| Espacio de acción | delta de posición relativo a ventana por brazo + orientación absoluta en rot6d |
| Dataset de entrenamiento | `Hannibal52Barca/icl-dataset-fixed-obs` (y `icl-dataset`) |
| Hardware de entrenamiento | 4x H200, batch 256, 15.000 pasos |

## Arquitectura y entrenamiento

La model card indica que el entrenamiento se realizó con openpi utilizando el backbone pi0.5. Se trata por tanto de una política de la familia VLA, que combina percepción visual, condicionamiento (estado propioceptivo y, presumiblemente, instrucción) y generación de acciones, pero la ficha publicada no detalla el número de parámetros, la configuración de capas, el mecanismo de generación de acciones ni la estrategia de fusión multimodal. Cualquier cifra concreta sobre estos aspectos sería una suposición y no se incluye aquí.

El punto distintivo del experimento es la alineación entre modalidades. El estado propioceptivo es la pose absoluta del efector final (posición xyz más cuaternión por brazo) calculada por cinemática directa a partir de los encoders reales de las articulaciones, con corrección de hemisferio del cuaternión para evitar discontinuidades en la representación. La acción es un delta de posición relativo a ventana por brazo más una orientación absoluta codificada en rot6d. La versión anterior del mismo autor condicionaba esta misma acción sobre un `observation.state` en espacio articular, lo que constituía un desajuste entre modalidades; este checkpoint lo elimina al usar propiocepción en espacio de efector final. El entrenamiento se ejecutó sobre el subconjunto de cuatro tareas de pick-and-place, 15.000 pasos, batch 256 y cuatro H200, y la model card no documenta uso de RLHF, DPO ni fases de ajuste adicionales.

## Capacidades

- Generación de acciones motoras en espacio de efector final para tareas de manipulación (pick-and-place) sobre el subconjunto de cuatro tareas usado en el entrenamiento.
- Control por brazo con representación explícita de dos efectores finales (izquierdo y derecho), a partir de la descripción de estado y acción por brazo.
- Manejo de orientación absoluta mediante rot6d, lo que evita ambigüedades y discontinuidades típicas de las representaciones con cuaterniones en el lado de la acción.
- Consumo de propiocepción en espacio cartesiano absoluto con cuaterniones corregidos por hemisferio, lo que reduce saltos de representación en la entrada.
- Condicionamiento visual: al ser un backbone VLA pi0.5, se asume entrada de imágenes, aunque la model card no detalla resolución, número de cámaras ni frecuencia.
- Tool calling / function calling: no aplica y no se documenta.
- Soporte de agentes y razonamiento multi-paso: no aplica; es una política de control, no un agente conversacional.
- Capacidades multilingües: no disponibles; no se documenta condicionamiento por lenguaje natural ni idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): modo thinking y audio no documentados; la componente visual se deriva del backbone VLA, sin detalles publicados.

## Casos de uso

- Verificación de pipelines de entrenamiento VLA: este checkpoint sirve como referencia reproducible para comprobar que una configuración de openpi, un dataset y un esquema de acciones concretos producen aprendizaje, antes de lanzar ejecuciones completas más costosas.
- Depuración de esquemas de acciones en espacio cartesiano: al usar delta de posición más rot6d absoluta, permite validar si un robot aprende mejor con acciones relativas de posición y orientación absoluta que con representaciones alternativas.
- Validación de coherencia estado-acción: útil para comprobar empíricamente el efecto de alinear la propiocepción (pose absoluta del efector final) con el espacio de la acción, frente a configuraciones con desajuste de modalidad como la del checkpoint anterior del mismo autor.
- Manipulación bimanual en laboratorio: el esquema por brazo con dos efectores finales permite experimentar con tareas de pick-and-place que requieren coordinar ambos brazos, siempre dentro del dominio de las cuatro tareas de entrenamiento.
- Investigación en representaciones de orientación: la codificación rot6d y la corrección de hemisferio del cuaternión en la entrada lo convierten en una pieza útil para estudiar estabilidad de representaciones rotacionales en políticas de imitación.
- Punto de partida para fine-tuning específico: al ser un checkpoint corto (15.000 pasos) sobre un subconjunto reducido, puede emplearse como inicialización para ajustes posteriores sobre dominios de manipulación más amplios.
- Referencia comparativa interna: permite cuantificar cuánto aporta la alineación de espacios frente a `pi05_extended_deltarot6d_full` manteniendo el resto del pipeline constante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito por tarea, métricas de error de posición u orientación, ni comparaciones cuantitativas con el checkpoint anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada del tamaño del repositorio (12,4 GB de pesos y activos), la carga en la precisión almacenada requiere del orden de 13-14 GB de VRAM, más el coste de activaciones y del codificador visual. Estas cifras son una estimación aritmética a partir del tamaño del repo, no un dato publicado.
- GPU recomendadas: no documentadas. El entrenamiento se realizó con 4x H200, pero no se especifican requisitos de inferencia ni GPU mínimas.
- Cabe en GPU de consumo: no confirmado. Por el tamaño del repositorio, una GPU con 16 GB o más (por ejemplo, RTX 4080/4090) podría alojar los pesos si el runtime lo permite, pero no hay confirmación del autor ni pruebas publicadas.
- Opciones de despliegue: el modelo se entrenó con openpi (`github.com/Physical-Intelligence/openpi`), por lo que el runtime previsto es el de ese framework. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a políticas de control.
- Latencia y throughput: no disponibles. No se publican frecuencias de control, tiempos de inferencia por paso ni métricas de rendimiento en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / dominio | Espacio de estado | Espacio de accion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `lair-nyu/yor_icl_pi05_aligned_deltarot6d_sanity15k` | no disponible | 4 tareas de pick-and-place, 15k pasos | efector final absoluto (xyz + cuaternión corregido) | delta de posición por ventana + rot6d absoluta | no disponible | HuggingFace, 12,4 GB, 0 descargas |
| `lair-nyu/pi05_extended_deltarot6d_full` | no disponible | versión extendida del mismo autor | espacio articular (`observation.state`) | delta de posición + rot6d absoluta | no disponible | HuggingFace |
| Backbone pi0.5 (openpi) | no disponible | política VLA generalista | no disponible | no disponible | no disponible | repositorio openpi |

No se dispone de datos de rendimiento para ninguno de los tres, por lo que la comparación se limita al esquema de representación y a la disponibilidad. No se han identificado en la información proporcionada otros modelos comparables con métricas publicadas.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explícita, no puede asumirse permiso de uso comercial ni de redistribución. Es un bloqueo potencial para producción.
- Naturaleza de sanity check: el propio nombre y la descripción indican que es una ejecución de comprobación de 15.000 pasos sobre un subconjunto de cuatro tareas de pick-and-place. No debe interpretarse como un modelo entrenado hasta convergencia ni como una política generalista.
- Dominio restringido: al haberse entrenado sobre cuatro tareas, se espera degradación severa ante cambios de objeto, escena, tarea o configuración del robot (fallo por cambio de distribución).
- Dependencia del esquema de observación: el modelo asume que el estado se calcula por cinemática directa desde los encoders y que los cuaterniones se corrigen por hemisferio. Un pipeline de inferencia que no reproduzca exactamente ese cálculo producirá entradas fuera de distribución.
- Riesgo de fallo motor, no de alucinación textual: en políticas de control el modo de error relevante es la ejecución de trayectorias incorrectas o inseguras, especialmente fuera del dominio de entrenamiento. No hay evaluación de seguridad publicada.
- Sin `train_state/`: el repositorio no permite reanudar el entrenamiento original; solo sirve para inferencia o para inicializar nuevos ajustes.
- Trazabilidad del dataset: los datos provienen de `Hannibal52Barca/icl-dataset-fixed-obs`, un repositorio de terceros sin licencia indicada en la información disponible, lo que añade incertidumbre sobre las condiciones de uso.
- Sin benchmarks ni métricas de éxito publicadas: no es posible estimar el rendimiento real ni compararlo objetivamente con alternativas.
- Adopción nula registrada: cero descargas y cero likes en el momento de la consulta, sin evidencia externa de validación por terceros.
- Metadatos con fechas inconsistentes: el repositorio figura creado y actualizado en septiembre de 2026, dato que conviene verificar antes de citarlo.
- Idiomas y condicionamiento por lenguaje natural: no documentados, por lo que no puede asumirse que el modelo siga instrucciones verbales en ningún idioma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lair-nyu/yor_icl_pi05_aligned_deltarot6d_sanity15k
- Checkpoint anterior del mismo autor: https://huggingface.co/lair-nyu/pi05_extended_deltarot6d_full
- Dataset de entrenamiento: https://huggingface.co/datasets/Hannibal52Barca/icl-dataset-fixed-obs
- Framework de entrenamiento openpi: https://github.com/Physical-Intelligence/openpi
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante. Las entradas devueltas corresponden a entidades sin relación con el modelo (una empresa de remolques, una red de agencias inmobiliarias y un archivo de ROMs).
