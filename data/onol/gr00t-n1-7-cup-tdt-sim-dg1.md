# Onol/GR00T-N1.7-cup-tdt-sim-dg1

## Resumen

`Onol/GR00T-N1.7-cup-tdt-sim-dg1` es un ajuste fino (fine-tuning) del modelo visión-lenguaje-acción (VLA) `nvidia/GR00T-N1.7-3B`, publicado por el usuario Onol, para una tarea única de manipulación bimanual diestra: colocar cada taza sobre su anillo correspondiente. El modelo controla un robot de 54 articulaciones (denominado Nero / Wuji en la model card) a partir de tres vistas de cámara de 640×480 y una instrucción en lenguaje natural en inglés, y emite bloques de 40 pasos de acción (aproximadamente 1,33 s a 30 Hz).

El interés práctico del repositorio no está en el rendimiento de la política —no se aporta ninguna evaluación de éxito en bucle cerrado—, sino en que documenta de forma reproducible una receta completa de adaptación de un VLA de 3B a una encarnación nueva: interfaz de acciones con brazos en coordenadas relativas y manos en absolutas, rellenado con ceros hasta 132 dimensiones con máscara en la función de pérdida, y entrenamiento con el backbone de visión y lenguaje congelado sobre una única H200 NVL.

En el momento de la información disponible (27 de octubre de 2026), el repositorio contiene los artefactos del ajuste fino y las comprobaciones de integridad, con un trabajo de entrenamiento de 20.000 pasos en curso y checkpoints previstos en los pasos 5.000, 10.000 y 20.000. Se trata, por tanto, de un artefacto de investigación en simulación, no de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA): backbone de visión y lenguaje `nvidia/Cosmos-Reason2-2B` (congelado durante el ajuste) más un módulo de acción difusivo entrenable |
| Parámetros totales | 3B (según la denominación del modelo base `nvidia/GR00T-N1.7-3B`; no se publica desglose por componente) |
| Parámetros activos | No aplica: no es un modelo MoE según la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible: solo se publican checkpoints en safetensors en BF16; no hay variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`); la instrucción de tarea está en inglés |
| Licencia | NVIDIA Open Model License (etiquetada como `other` en el Hub); se incluye la licencia original sin modificar |
| Formato de pesos | safetensors, acompañados de processor y metadatos de normalización, estado del optimizador, scheduler, estado RNG y estado del trainer por checkpoint |
| Dimensión de estado / acción | 54 dimensiones reales, rellenadas con ceros hasta `max_state_dim=132` y `max_action_dim=132`; las 78 dimensiones de relleno se enmascaran en la pérdida |
| Horizonte de acción | 40 frames (≈1,33 s a 30 Hz) |
| Encarnación | Registrada como `NEW_EMBODIMENT` |
| Entradas visuales | Cámaras `external`, `wrist` y `wrist_right`, RGB 640×480 |
| Tamaño del repositorio | 25,5 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de los VLA de NVIDIA GR00T: un backbone de visión y lenguaje (`nvidia/Cosmos-Reason2-2B`, modelo con acceso restringido en el Hub) que interpreta las imágenes de las tres cámaras y la instrucción textual, acoplado a un módulo de acción de tipo difusivo que genera secuencias de acciones. En este ajuste fino el backbone de visión y lenguaje y el de lenguaje permanecen congelados, y solo se entrenan el proyector y el módulo de acción difusivo, lo que reduce el coste de adaptación a una encarnación nueva.

La interfaz de acciones se define por grupos: brazo izquierdo (índices 0:7) y brazo derecho (27:34) se representan de forma relativa al estado actual, mientras que mano izquierda (7:27) y mano derecha (34:54) se representan en valores absolutos. El dataset conserva sus unidades articulares absolutas originales; es el processor quien realiza la conversión a acciones relativas y la normalización, y la inferencia decodifica de vuelta a acciones absolutas. El estado y la acción de 54 dimensiones se rellenan con ceros hasta 132, enmascarando las 78 dimensiones de relleno en la pérdida.

El entrenamiento empleó una NVIDIA H200 NVL de 141 GB en precisión mixta BF16, con batch efectivo de 64, 20.000 pasos de optimizador, AdamW con tasa de aprendizaje 1e-4, weight decay 1e-5, 5% de warmup y schedule coseno. Los datos son 348 episodios simulados y 199.847 frames a 30 Hz del dataset `B111ue/lerobot_cup_tdt_sim_dg1`, que corresponden a variaciones de gemelo digital de una única demostración fuente (`episode_006`) y que se usan íntegramente en entrenamiento, incluidos los episodios etiquetados como heldout en el dataset original. Los tres hitos de checkpoint suponen aproximadamente 1,72, 3,44 y 6,87 pasadas equivalentes sobre las 186.275 posiciones iniciales de chunk H40, con muestreo estocástico. En el smoke test de 20 pasos se midió un pico de 44,66 GiB de memoria CUDA asignada (46,19 GiB reservada) y unos 0,64 s por paso con batch 64.

## Capacidades

- Manipulación bimanual diestra de 54 articulaciones: genera comandos articulares para dos brazos y dos manos de forma coordinada.
- Condicionamiento multimodal: combina tres vistas RGB (exterior, muñeca izquierda y muñeca derecha) con una instrucción en lenguaje natural.
- Generación de bloques de acción de horizonte 40 (≈1,33 s a 30 Hz) con decodificación a acciones absolutas.
- Conversión interna de acciones relativas (brazos) y absolutas (manos) mediante el processor incluido en el checkpoint.
- Adaptación a una encarnación nueva mediante rellenado de dimensiones y máscara de pérdida, sin reentrenar el backbone.
- No soporta tool calling ni function calling: es una política robótica, no un modelo de lenguaje conversacional.
- No soporta razonamiento multi-paso en el sentido de agentes de texto ni modos de "pensamiento" explícitos.
- No genera texto, código, matemáticas ni imágenes como salida.
- Soporte multilingüe: no disponible; la única lengua documentada es el inglés.

## Casos de uso

- **Evaluación de una receta de adaptación de VLA a una encarnación nueva**: el repositorio documenta de extremo a extremo cómo mapear 54 articulaciones a las 132 dimensiones del modelo base, qué grupos van en coordenadas relativas y cuáles en absolutas, y cómo se decodifica la salida; sirve como plantilla para adaptar GR00T a otros robots bimanuales.
- **Punto de partida para investigación en manipulación bimanual en simulación**: la tarea "colocar cada taza sobre su anillo" con tres cámaras y horizonte de 40 pasos es un banco de pruebas acotado para comparar políticas y variantes de processor sin necesidad de montar un entorno propio.
- **Estimación de coste de entrenamiento y requisitos de infraestructura**: las métricas del smoke test (44,66 GiB de pico, 0,64 s por paso con batch 64 en una H200 NVL) permiten extrapolar el presupuesto de cómputo de un ajuste fino de 20.000 pasos, del orden de 3,6 horas de cómputo puro a ese ritmo, antes de contabilizar la subida y verificación de checkpoints.
- **Auditoría de reproducibilidad de artefactos**: los manifiestos con SHA-256 por fichero y los recibos de verificación (descarga desde un commit inmutable, recarga del checkpoint e inferencia sobre tres observaciones de entrenamiento con acciones 40×54 finitas) son un ejemplo reutilizable de control de calidad para pipelines de publicación de modelos.
- **Generación de variaciones de datos sintéticos a partir de una demostración**: dado que los 348 episodios derivan de una sola demostración mediante variaciones de gemelo digital, el modelo sirve para estudiar hasta qué punto una política entrenada con esas variaciones se transfiere frente a datos independientes.
- **Prototipado de un pipeline simulación-a-real**: la integración con `Gr00tPolicy` de Isaac-GR00T y la especificación de las claves de cámara facilitan ensayar el mismo código de inferencia en simulación antes de plantear un despliegue físico, siempre que se valide primero el bucle cerrado.
- **Estudio de sobreajuste a la distribución de entrenamiento**: al no reservarse split de evaluación independiente, el modelo es útil para medir experimentalmente la brecha entre error de imitación en muestras de entrenamiento y éxito real en rollouts, un fenómeno relevante para quien diseñe futuros splits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card es explícita al respecto: las comprobaciones de ficheros, las pruebas de recarga de checkpoint y los errores sobre muestras de entrenamiento no establecen éxito en bucle cerrado, generalización a datos heldout ni rendimiento en robot real. Las únicas cifras medidas y publicadas son de infraestructura de entrenamiento, que se recogen en la tabla siguiente:

| Métrica | Valor | Contexto |
|---|---|---|
| Pico de memoria CUDA asignada | 44,66 GiB | Smoke test de 20 pasos, H200 NVL 141 GB, BF16 |
| Pico de memoria CUDA reservada | 46,19 GiB | Smoke test de 20 pasos |
| Tiempo por paso | ≈0,64 s | Batch 64 en estado estacionario |
| Pasadas equivalentes sobre chunks H40 | 1,72 / 3,44 / 6,87 | Checkpoints 5.000 / 10.000 / 20.000 |
| Posiciones iniciales de chunk H40 | 186.275 | Dataset completo de entrenamiento |

## Requisitos de hardware

- **Entrenamiento documentado**: una NVIDIA H200 NVL de 141 GB, BF16, batch efectivo 64, con un pico medido de 44,66 GiB asignados. El ajuste fino solo entrena proyector y módulo de acción, ya que el backbone está congelado.
- **VRAM estimada para inferencia**: no publicada. Como referencia, los pesos del modelo de 3B en BF16 ocupan del orden de 6 GB, por lo que una estimación razonable de trabajo se sitúa en la franja de 8 a 16 GB, dependiendo del batch, del horizonte de 40 pasos y del procesamiento de tres imágenes de 640×480. Es una estimación, no una medida del autor.
- **GPU de consumo**: con esa estimación, el modelo debería caber en GPUs de 24 GB (RTX 3090, RTX 4090) en BF16, y con más holgura en FP16/BF16 sobre GPUs de 32 GB o más. No hay validación publicada de este escenario.
- **Requisito adicional de acceso**: el backbone `nvidia/Cosmos-Reason2-2B` está restringido en el Hub, por lo que es necesario solicitar y obtener acceso antes de cargar el modelo.
- **Opciones de despliegue**: el camino documentado es `gr00t.policy.gr00t_policy.Gr00tPolicy` de Isaac-GR00T, fijando la revisión concreta indicada en `source_versions.json` y descargando el checkpoint mediante el `checkpoint_commit` inmutable de su recibo de verificación. vLLM, llama.cpp, Ollama y TGI no son aplicables: no es un modelo de lenguaje con decodificación de tokens, sino una política que emite tensores de acción.
- **Latencia y throughput**: no publicados para inferencia. El único dato de velocidad disponible es el del entrenamiento (≈0,64 s por paso con batch 64), que no es extrapolable a la latencia de control.
- **Almacenamiento**: el repositorio ocupa 25,5 GB, en buena parte por los estados de optimizador y trainer incluidos en cada checkpoint; conviene descargar únicamente el subdirectorio del checkpoint deseado con `allow_patterns`.

## Comparativa con modelos similares

Los datos de los modelos comparables no se han verificado contra sus model cards en esta ficha; se indican como referencia de categoría y deben confirmarse en la fuente original.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Onol/GR00T-N1.7-cup-tdt-sim-dg1` (este) | 3B | No disponible | Sin benchmarks ni evaluación de bucle cerrado | NVIDIA Open Model License | Hub; 25,5 GB; requiere acceso al backbone |
| `nvidia/GR00T-N1.7-3B` (base) | 3B | No disponible | No evaluado en esta ficha | NVIDIA Open Model License | Hub; base generalista, sin adaptación a esta encarnación |
| `nvidia/Cosmos-Reason2-2B` | 2B (backbone de visión y lenguaje) | No disponible | No evaluado en esta ficha | No disponible en esta ficha | Hub con acceso restringido; solo componente, no es una política |
| VLA bimanuales de la competencia (p. ej. familias tipo π0 / OpenVLA) | Del orden de 3B a 7B según familia | No disponible | No verificado | No verificado | No verificado en esta ficha |

La comparación relevante en la práctica es contra el propio modelo base: este repositorio no aporta mejoras generales, sino una especialización a una tarea y una encarnación concretas, con la contrapartida de perder generalidad y de no contar con métricas que demuestren la especialización.

## Limitaciones y advertencias

- **Sin evidencia de éxito en la tarea**: no se ha publicado ninguna evaluación de rollouts en bucle cerrado, de generalización a datos heldout ni de ejecución en robot real. Los recibos de verificación solo acreditan integridad de ficheros, recarga correcta y salidas finitas de 40×54.
- **Datos derivados de una sola demostración**: los 348 episodios son variaciones de gemelo digital de `episode_006`, no 348 demostraciones humanas independientes; esto limita severamente la diversidad real de comportamientos y favorece el sobreajuste a la simulación.
- **Falta de split de evaluación**: todos los episodios, incluidos los etiquetados como heldout en el dataset original, participan en el entrenamiento, de modo que cualquier métrica calculada sobre ese dataset será optimista.
- **Estado incompleto del artefacto**: en la actualización de estado indicada, el trabajo de 20.000 pasos estaba en curso y los checkpoints de los hitos aún no estaban disponibles; un manifiesto presente no implica que la subida haya finalizado.
- **Riesgo de alucinación en el sentido de acciones no válidas**: al ser una política, el fallo se manifiesta como trayectorias fuera de distribución o comandos articulares incoherentes. El enmascarado de las 78 dimensiones de relleno protege la función de pérdida, no la validez física de la acción.
- **Compatibilidad de interfaz no equivale a comprensión**: la model card advierte que el registro como `NEW_EMBODIMENT` y el rellenado de dimensiones son compatibilidad de interfaz, no evidencia de que el modelo preentrenado entienda la semántica articular de este robot concreto.
- **Idioma único**: las instrucciones y los datos están en inglés; no hay soporte documentado de otros idiomas.
- **Dominio muy estrecho**: una sola instrucción de tarea, un solo tipo de objeto (tazas y anillos) y un entorno simulado; no debe presentarse como un modelo generalista de manipulación.
- **Licencia**: NVIDIA Open Model License, etiquetada como `other` en el Hub. Es imprescindible revisar los términos antes de cualquier uso comercial, y hay que respetar además las condiciones del backbone `Cosmos-Reason2-2B`, que requiere acceso aprobado.
- **Dependencia de código externo**: la carga exige la revisión fijada de Isaac-GR00T indicada en `source_versions.json`; cambios en esa librería o usar otra revisión puede romper la compatibilidad del processor y de la decodificación de acciones.
- **Sesgos**: no documentados por el autor. Al provenir de un único entorno simulado, es esperable un sesgo hacia las condiciones de iluminación, disposición de cámara y geometría de ese gemelo digital, pero no hay medición publicada.
- **Coste de descarga**: 25,5 GB con estados de optimizador; conviene filtrar ficheros para evitar descargas innecesarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Onol/GR00T-N1.7-cup-tdt-sim-dg1
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Backbone de visión y lenguaje (acceso restringido): https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/B111ue/lerobot_cup_tdt_sim_dg1
- Licencia incluida en el repositorio: https://huggingface.co/Onol/GR00T-N1.7-cup-tdt-sim-dg1/blob/main/LICENSE
- Repositorio de código Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Recibos de verificación y manifiestos de checkpoints: carpeta `verification/` y `manifests/` del repositorio
