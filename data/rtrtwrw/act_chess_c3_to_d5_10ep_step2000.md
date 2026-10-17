# rtrtwrw/act_chess_c3_to_d5_10ep_step2000

## Resumen

`rtrtwrw/act_chess_c3_to_d5_10ep_step2000` es un checkpoint de una política de imitación ACT (Action Chunking Transformer) entrenada desde cero con LeRobot 0.5.1 para un brazo robótico seguidor SO-101. La tarea concreta es desplazar una pieza de ajedrez desde la casilla c3 (con un desplazamiento de 6 cm) hasta la casilla d5 (10 cm), usando tres cámaras a 480x640 y un vector de estado/acción de 6 articulaciones. No es un modelo de lenguaje: es un modelo visomotor de robótica, con 51.668.614 parámetros (unos 51,7 M) y un repositorio de 0,2 GB en safetensors.

El interés de esta publicación es acotado y experimental. Se trata de un checkpoint intermedio, el paso 2.000 de un entrenamiento total de 16.000 pasos con batch de 24, y se ha entrenado únicamente con los 10 episodios más cortos del dataset `niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741` (episodios 19, 12, 14, 10, 18, 15, 20, 9, 16 y 28; 3.422 fotogramas en total). Es, por tanto, material de reproducibilidad de un experimento de investigación, no una política lista para producción.

Su relevancia ahora es la de un artefacto de seguimiento dentro del ecosistema LeRobot: permite inspeccionar cómo evoluciona una política ACT con pocos datos y pocos pasos, comparar el efecto del tamaño del dataset y servir como punto de partida para fine-tuning sobre el mismo robot. El autor no documenta licencia, idiomas ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación visomotora; detalles internos (backbone visual, número de capas, dimensión de acción chunk) no disponibles |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo de lenguaje. Entrada: 3 cámaras a 480x640 + estado de 6 articulaciones |
| Tipos de cuantizacion | No disponible (no documentada por el autor); pesos en safetensors, presumiblemente fp32 |
| Idiomas soportados | No aplica / no disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria / framework | LeRobot 0.5.1 |
| Robot objetivo | SO-101 (brazo seguidor) |
| Entradas | 3 cámaras, resolución 480x640 |
| Dimension de estado y accion | 6 articulaciones |
| Checkpoint | Paso 2.000 de 16.000 (batch 24) |
| Dataset de entrenamiento | `niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741` |
| Episodios usados | 10 (19, 12, 14, 10, 18, 15, 20, 9, 16, 28) |
| Fotogramas de entrenamiento | 3.422 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una política de imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación en tareas de manipulación y permite un control más suave. En este caso el modelo se ha entrenado desde cero con LeRobot 0.5.1, sin indicación de inicialización desde un checkpoint previo, sobre observaciones de tres cámaras a 480x640 y un vector de estado de 6 articulaciones, con salida de acción también de 6 dimensiones. El model card no especifica el backbone visual, el número de capas del transformer, la longitud del chunk de acciones ni el tipo de codificación posicional; esos datos figuran como no disponibles.

El entrenamiento es deliberadamente reducido: 2.000 pasos de un total previsto de 16.000, con batch de 24, sobre 3.422 fotogramas procedentes de los 10 episodios más cortos del dataset. No se documenta ninguna fase de RLHF, DPO, refuerzo por recompensa ni aumento de datos; el paradigma es imitación supervisada pura a partir de demostraciones de teleoperación. Tampoco se documentan técnicas de decodificación especulativa, atención lineal ni otras innovaciones de eficiencia: es una configuración ACT estándar en el pipeline de LeRobot.

## Capacidades

- Manipulación visomotora de una pieza de ajedrez: traslado desde c3 (6 cm) hasta d5 (10 cm) con el brazo SO-101.
- Política de imitación multi-cámara: consume tres vistas simultáneas a 480x640, lo que permite cierta tolerancia a oclusiones parciales y a variaciones de punto de vista.
- Control de 6 articulaciones con predicción de chunks de acción, pensado para reducir la acumulación de error frente a políticas paso a paso.
- Integración directa con la CLI de LeRobot (`lerobot-record ... --policy.path=rtrtwrw/act_chess_c3_to_d5_10ep_step2000`).
- Reutilizable como base para fine-tuning sobre el mismo robot y tareas de picking-and-placing similares.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades de agente.
- No tiene capacidades multilingües, de visión general, audio ni modo de razonamiento: la "visión" se limita a las tres cámaras del robot.

## Casos de uso

- Reproducción del experimento: cargar el checkpoint con `lerobot-record` sobre un SO-101 para verificar el comportamiento descrito en el model card y comparar el paso 2.000 con checkpoints posteriores del mismo entrenamiento.
- Fine-tuning sobre el mismo dominio: al estar entrenado solo con 10 episodios y 3.422 fotogramas, es un punto de partida razonable para añadir más posiciones de ajedrez o variantes de agarre con un coste de cómputo bajo.
- Línea base en experimentos de data scaling: sirve para medir cuánto mejora una política ACT al pasar de 10 episodios a decenas, manteniendo fijo el resto de hiperparámetros del pipeline LeRobot.
- Depuración de pipelines de robótica: al ser un modelo pequeño (0,2 GB), permite validar extremo a extremo la captura de tres cámaras, la calibración del SO-101 y el formateo de observaciones antes de entrenar modelos mayores.
- Docencia y demostración: un caso de manipulación de una sola tarea, con dataset público asociado, es útil para explicar imitación supervisada, action chunking y evaluación de políticas en robótica de bajo coste.
- Pruebas de estrés de robustez visual: evaluar la degradación de la política ante cambios de iluminación, fondo o posición de cámara, comparando con el rendimiento del mismo modelo reentrenado con más datos.
- Generación de datos sintéticos de evaluación: ejecutar la política en bucle para producir trayectorias etiquetadas de c3 a d5 que sirvan como material de comparación entre variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye tasa de éxito, error de posición final, número de ensayos de evaluación ni comparación con otras políticas. Tampoco se documentan métricas de entrenamiento (pérdida, curvas de validación) para el paso 2.000.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Los pesos ocupan aproximadamente 0,2 GB en fp32 (51,7 M de parámetros), por lo que el coste dominante no es el modelo sino el encoder visual que procesa tres imágenes de 480x640 por paso.
- Estimación orientativa (no verificada): menos de 2 GB de VRAM en fp32 serían suficientes para los pesos y activaciones de inferencia, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer (por ejemplo, serie RTX 40 o superior) debería poder ejecutar la política; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del repositorio (0,2 GB); la latencia vendrá determinada por el preprocesado de las tres cámaras.
- Opciones de despliegue: LeRobot 0.5.1 con PyTorch (comando documentado `lerobot-record --policy.path=...`). No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, tiempo por chunk de acción ni rendimiento en Hz.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de modelos comparables en la información proporcionada (ni parámetros, ni contexto, ni tasas de éxito de alternativas). La comparación solo puede hacerse a nivel de categoría:

| Modelo | Familia | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ACT) | ACT, imitación supervisada | 51,7 M | 3 cámaras 480x640 + estado 6D | No disponible | HuggingFace, 0 descargas |
| Otras políticas ACT en LeRobot | ACT, imitación supervisada | No disponible | No disponible | No disponible | Ecosistema LeRobot |
| Diffusion Policy | Política de difusión para manipulación | No disponible | No disponible | No disponible | Implementaciones públicas, datos no verificados aquí |
| Políticas VLA (por ejemplo, familias tipo SmolVLA o pi0) | VLA, preentrenadas multi-tarea | No disponible | No disponible | No disponible | Datos no verificados aquí |

La diferencia cualitativa relevante es que este checkpoint está entrenado desde cero para una única tarea, con 3.422 fotogramas, mientras que las alternativas VLA se preentrenan con datos multi-tarea y se adaptan después; no hay datos públicos en esta ficha que permitan comparar rendimiento.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 2.000 de 16.000, por lo que la política está infraentrenada respecto al plan de entrenamiento del autor.
- Dataset muy reducido: 10 episodios y 3.422 fotogramas, con selección por duración (los más cortos), lo que introduce un sesgo hacia trayectorias rápidas y puede provocar sobreajuste a esas demostraciones concretas.
- Una sola tarea: el modelo aprende el desplazamiento c3 (6 cm) a d5 (10 cm); no hay evidencia de generalización a otras casillas, orientaciones de pieza o configuraciones del tablero.
- Sin evaluación publicada: no existe tasa de éxito ni protocolo de test, de modo que no se puede afirmar qué fiabilidad tiene en ejecución real.
- Licencia no especificada: la ausencia de licencia impide asumir permisos de uso comercial, redistribución o modificación; hay que contactar con el autor antes de cualquier uso en producción.
- Dependencia de calibración: al usar tres cámaras a 480x640 y un SO-101, cambios en la montura de las cámaras, la iluminación o el fondo pueden degradar el comportamiento sin aviso.
- Ausencia de idiomas y de texto: no procesa lenguaje, por lo que no puede recibir instrucciones en castellano ni en ningún otro idioma; toda la especificación de tarea está implícita en los pesos.
- Alucinación en el sentido de LLM no aplica; el fallo equivalente es deriva de la política, agarre fallido o colisión, sin mecanismo de verificación interno.
- No apto para entornos no controlados ni para interacción humana directa sin supervisión y parada de emergencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rtrtwrw/act_chess_c3_to_d5_10ep_step2000
- Dataset de entrenamiento: https://huggingface.co/datasets/niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741
- Repositorio de LeRobot (framework utilizado, versión 0.5.1): https://github.com/huggingface/lerobot
- Paper de ACT, Action Chunking with Transformers (referencia metodológica, no citada en el model card): https://arxiv.org/abs/2304.13705
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron únicamente contenido no relacionado sobre índices de torrents, por lo que no se incluye.
