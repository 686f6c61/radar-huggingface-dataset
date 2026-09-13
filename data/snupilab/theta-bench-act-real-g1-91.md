# snupilab/theta-bench-act-real-g1-91

## Resumen

`snupilab/theta-bench-act-real-g1-91` es un checkpoint de política robótica de imitación publicado por el usuario snupilab dentro del ecosistema denominado THETA Bench. Se trata de un resultado de entrenamiento incremental: parte del modelo base `snupilab/theta-bench-act-sim-3003` (entrenado durante 40.000 actualizaciones en simulación) y añade 5.000 actualizaciones adicionales utilizando 91 demostraciones reales recogidas sobre un robot G1. La nomenclatura del repositorio apunta a una arquitectura ACT (Action Chunking Transformer), habitual en políticas de manipulación por imitación, aunque la model card no detalla capas, parámetros ni configuración interna.

El interés del modelo es acotado y muy específico: no es un modelo de lenguaje ni un modelo multimodal de propósito general, sino una política de control para tareas concretas de manipulación. Las cuatro condiciones reales cubiertas son StickMove Standard, StickMove Reasoning, HookRetrieve Standard y HookRetrieve Reasoning, con grabaciones a 20 Hz y acciones ejecutadas como consignas articulares (*joint-target actions*). El objetivo declarado del entrenamiento es de 5.000 actualizaciones del optimizador, con un batch por GPU de 16 sobre 8 GPUs (batch global de 128) y 4 condiciones por batch global.

En el momento de redactar esta ficha, el repositorio contiene únicamente metadatos: el propio autor indica que el entrenamiento está en preparación o en cola y que no se publican pesos todavía. No se declara ninguna puntuación de evaluación asociada al checkpoint, la licencia no está especificada y el repositorio registra cero descargas y cero *likes*. Su relevancia actual es, por tanto, documental y metodológica (trazabilidad de un pipeline sim-to-real con adaptación a hardware real), no como artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. La nomenclatura del repositorio indica ACT (Action Chunking Transformer), política transformer de imitación con *action chunking*; no se especifican capas, dimensión ni configuración |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica; no se describe una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible. No es un modelo de lenguaje: las entradas son observaciones y estados del robot, no secuencias de texto |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`, según las etiquetas del repositorio); sin relevancia para el control robótico |
| Licencia | No disponible |
| Formato de pesos | No disponible. El repositorio contiene solo metadatos; no se han publicado pesos |
| Dominio | Robótica de manipulación (pipeline `robotics`) sobre robot G1 real |
| Condiciones de tarea | StickMove Standard, StickMove Reasoning, HookRetrieve Standard, HookRetrieve Reasoning |
| Frecuencia de grabación | 20 Hz |
| Modelo base | `snupilab/theta-bench-act-sim-3003` (afinado posterior: *finetune*) |
| Dataset de entrenamiento | `snupilab/theta-bench-teleop`, revisión `47eca9322bb53fa1c685363271a87d2e414cb0e8` |
| Actualizaciones objetivo | 5.000 |
| Configuración de entrenamiento | 16 por GPU, 8 GPUs, batch global 128, acumulación de gradiente 1, 4 condiciones por batch global |
| Fecha de creación (metadatos) | 2026-09-13 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. El identificador `theta-bench-act-*` y el título «THETA Bench ACT» remiten a ACT (Action Chunking Transformer), una familia de políticas de imitación que predicen secuencias de acciones (chunks) a partir de observaciones visuales y de estado, en lugar de una acción por paso. Es una elección coherente con el escenario declarado: manipulaciones de contacto como mover una varilla (StickMove) o recuperar un objeto con un gancho (HookRetrieve), donde predecir bloques de acciones reduce el ruido de decisión paso a paso. No obstante, al no publicarse configuración, número de parámetros ni detalles del codificador visual, cualquier afirmación adicional sobre la arquitectura sería especulativa.

El procedimiento de entrenamiento sí está documentado: se inicializa desde `snupilab/theta-bench-act-sim-3003` tras 40.000 actualizaciones en simulación y se continúa con 5.000 actualizaciones nuevas sobre 91 demostraciones reales del G1. El entrenamiento usa optimizadores independientes por modelo y ejecución compartida de GPU a través de MPS; la publicación se realiza mediante un cargador (*uploader*) en CPU después de la validación final del checkpoint. El autor es explícito en varios puntos: no se declara ninguna puntuación de evaluación, el repositorio no sustituye a una política preentrenada aguas arriba por un checkpoint entrenado con THETA, y el uso requiere el adaptador THETA nativo y dependencias específicas del modelo, sin garantía de compatibilidad con cargadores genéricos de Transformers ni con cargadores de simulación.

## Capacidades

- Ejecución de políticas de manipulación robótica para cuatro condiciones concretas: StickMove Standard, StickMove Reasoning, HookRetrieve Standard y HookRetrieve Reasoning.
- Generación de consignas articulares (*joint-target actions*) con frecuencia de control alineada con grabaciones a 20 Hz.
- Adaptación sim-to-real: la política hereda el comportamiento aprendido en simulación y lo ajusta con 91 demostraciones reales.
- Distinción entre variantes «Standard» y «Reasoning» dentro de cada familia de tareas, según la nomenclatura de las condiciones.
- No se documenta soporte de *tool calling*, *function calling*, uso como agente conversacional ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No se documentan capacidades de visión, audio ni generación de texto; las etiquetas de idioma (`en`) no implican capacidades lingüísticas en el artefacto.
- No se documentan capacidades multilingües.

## Casos de uso

- Investigación en imitación robótica sim-to-real: el checkpoint permite estudiar cuánto aportan 5.000 actualizaciones sobre 91 demostraciones reales partiendo de un modelo entrenado en simulación, comparando el comportamiento antes y después del ajuste fino.
- Benchmarking reproducible dentro de THETA Bench: al fijar la revisión del dataset (`47eca9322bb53fa1c685363271a87d2e414cb0e8`) y la configuración de entrenamiento (batch 128 global, 5.000 pasos), el resultado es trazable y comparable con otros checkpoints del mismo bench.
- Manipulación de precisión tipo StickMove: inserción o desplazamiento controlado de una varilla, tarea en la que la predicción de *chunks* de acciones ayuda a mantener trayectorias consistentes en contacto.
- Recuperación de objetos tipo HookRetrieve: extracción de piezas con un gancho, escenario de contacto complejo donde la política debe encadenar aproximación, enganche y arrastre.
- Validación de adaptadores de control en hardware G1: el checkpoint sirve para comprobar que el adaptador real coincide con el usado durante el entrenamiento, ya que el autor advierte explícitamente de que un adaptador de simulación no debe asumirse compatible.
- Ampliación incremental de datasets reales: como eslabón de un pipeline que acumula demostraciones de teleoperación (dataset `theta-bench-teleop`) y reentrena políticas sucesivamente.
- Evaluación de robustez frente a variaciones de condición: comparar el rendimiento de las variantes Standard y Reasoning de cada tarea bajo el mismo protocolo.
- Reproducción metodológica: servir de plantilla para otros grupos que quieran documentar entrenamientos incrementales con presupuesto de cómputo fijo (8 GPUs, batch 16 por GPU).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma de forma explícita que «no evaluation score is claimed by checkpoint publication» (la publicación del checkpoint no reclama ninguna puntuación de evaluación). No se dispone de tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otros checkpoints de THETA Bench.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publica tamaño del modelo, número de parámetros ni opciones de cuantización, por lo que no es posible estimar requisitos de memoria.
- GPU recomendadas: no disponible para inferencia. Como referencia del lado de entrenamiento, la receta declarada usa 8 GPUs con batch por GPU de 16 y ejecución compartida a través de MPS.
- Encaje en GPU de consumo: no disponible; no puede determinarse sin conocer el tamaño del modelo.
- Opciones de despliegue: no disponible. El autor indica que debe usarse el adaptador THETA nativo y dependencias específicas del modelo, y que el repositorio no declara compatibilidad con Transformers genérico ni con cargadores de simulación. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a una política de control robótico de este tipo.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de grabación de 20 Hz, que corresponde a la captura de datos y no a una medición de inferencia publicada.
- Requisito específico de hardware: robot G1 real con el adaptador de control correspondiente para ejecutar las consignas articulares.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la literatura pública general y no se han podido verificar con la búsqueda web realizada; se ofrecen como referencia cualitativa. Para el modelo objeto de la ficha, la mayoría de campos figuran como no disponibles.

| Modelo | Enfoque | Parámetros | Espacio de acción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `snupilab/theta-bench-act-real-g1-91` | ACT (según nomenclatura), ajuste fino sim-to-real para G1 | No disponible | Consignas articulares (*joint-target*) | No disponible | Solo metadatos; pesos no publicados |
| ACT original (Zhao et al., 2023, ALOHA) | Action Chunking Transformer para manipulación bimanual | No disponible en la información proporcionada | Consignas articulares | Código abierto (repositorio de investigación) | Pesos y código públicos en el repositorio del proyecto |
| Diffusion Policy (Chi et al., 2023) | Política generativa basada en modelos de difusión | No disponible en la información proporcionada | Consignas articulares / pose | Código abierto (repositorio de investigación) | Pesos y código públicos en el repositorio del proyecto |
| OpenVLA (Kim et al., 2024) | Modelo visión-lenguaje-acción de propósito general | Aproximadamente 7.000 millones (dato de literatura pública, no verificado aquí) | Acciones discretizadas sobre robot | Licencia derivada de Llama 2 | Pesos abiertos |

Diferencias clave: el modelo de esta ficha está especializado en cuatro condiciones concretas y en un robot específico (G1), mientras que OpenVLA apunta a generalización entre robots y tareas con un coste de cómputo muy superior. ACT y Diffusion Policy son las referencias metodológicas más cercanas en manipulación por imitación. En ningún caso se dispone de métricas comparables publicadas para `theta-bench-act-real-g1-91`.

## Limitaciones y advertencias

- Pesos no publicados: el repositorio contiene únicamente metadatos y el entrenamiento está en preparación o en cola; el modelo no es utilizable tal cual.
- Licencia no especificada: sin licencia declarada no puede asumirse permiso para uso comercial, redistribución ni modificación. Cualquier uso en producción requiere aclaración previa con el autor.
- Ausencia de evaluación: no se reclama ninguna puntuación y no hay evidencia publicada de tasa de éxito en las cuatro condiciones.
- Incompatibilidad de adaptadores: el autor advierte de que las acciones articulares ejecutadas en hardware requieren el adaptador de control real del G1 correspondiente y que no debe asumirse que un adaptador de simulación sea compatible. Usar el adaptador equivocado puede producir comandos inválidos sobre el robot.
- Dependencias no estándar: no se declara compatibilidad con cargadores genéricos de Transformers ni con cargadores de simulación; el modelo exige el adaptador THETA nativo.
- Cobertura limitada de tareas: solo cuatro condiciones (StickMove Standard/Reasoning y HookRetrieve Standard/Reasoning). Cualquier tarea fuera de ese conjunto queda fuera del dominio entrenado.
- Volumen de datos reducido: 91 demostraciones reales implican riesgo de sobreajuste a las condiciones de recogida (posición de cámara, iluminación, disposición de objetos) y baja diversidad de escenarios.
- Desplazamiento de distribución: al ser una política de imitación, el rendimiento se degrada ante cambios en la escena, el objeto o la dinámica del robot respecto a las demostraciones de teleoperación.
- Idioma: etiqueta `en`; irrelevante para el control, pero indica que no hay soporte documental ni de instrucciones en otros idiomas, incluido el castellano.
- Metadatos con fecha futura: la fecha de creación registrada (2026-09-13) es posterior a la fecha habitual de consulta, lo que conviene tener en cuenta al citar el artefacto.
- Sin métricas de latencia: no se publica información sobre frecuencia de inferencia alcanzable, dato crítico para control en tiempo real a 20 Hz.
- Búsqueda web sin resultados relevantes: las consultas devolvieron únicamente servicios de traducción, sin papers, blogs ni repositorios asociados al modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/snupilab/theta-bench-act-real-g1-91
- Modelo base (simulación, 40.000 actualizaciones): https://huggingface.co/snupilab/theta-bench-act-sim-3003
- Dataset de teleoperación: https://huggingface.co/datasets/snupilab/theta-bench-teleop
- Datos de entrenamiento fijados (revisión `47eca9322bb53fa1c685363271a87d2e414cb0e8`, carpeta `hardware`): https://huggingface.co/datasets/snupilab/theta-bench-teleop/tree/47eca9322bb53fa1c685363271a87d2e414cb0e8/hardware
- Paper, blog o repositorio de THETA Bench: no disponible en la información proporcionada
- Resultados de la búsqueda web: sin enlaces relevantes (solo aparecieron servicios de traducción: Google Translate y DeepL)
