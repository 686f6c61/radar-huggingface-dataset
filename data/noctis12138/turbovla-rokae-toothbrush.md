# Noctis12138/turbovla-rokae-toothbrush

## Resumen

TurboVLA Rokae v3 (variante `toothbrush`) es un modelo visión-lenguaje-acción (VLA) para control de robots bimanuales, publicado por el usuario Noctis12138 en Hugging Face. Está entrenado para una única tarea sobre un robot de doble brazo Rokae AR5 con pinzas paralelas: colocar un vaso en la estantería amarilla con el brazo izquierdo y, después, meter el cepillo de dientes en el vaso con el brazo derecho. No es un modelo de propósito general: es un checkpoint de investigación orientado a pruebas en robot real, con una interfaz de inferencia (`RokaePolicy.predict`) idéntica a la de la versión anterior del proyecto, de modo que solo hay que sustituir código y checkpoint.

La arquitectura combina un backbone visual DINOv3-L (ViT-L/16) afinado, un codificador de texto BERT congelado y una cabeza de acciones que emite *chunks* de 50 comandos de pose absoluta de efector final a 30 Hz. El checkpoint de inferencia pesa aproximadamente 1,6 GB e incluye pesos, configuración y estadísticas de normalización, por lo que no hace falta descargar DINOv3 por separado. El autor indica un consumo de unos 3 GB de VRAM para inferencia.

Resulta relevante por dos motivos concretos: es un ejemplo reproducible de pipeline VLA bimanual real (tres cámaras, estado de 16 dimensiones, filtro de histéresis para la pinza) y documenta una corrección técnica relevante frente a la versión previa, la normalización de acciones por paso de predicción, que resolvía errores milimétricos de agarre. Ahora bien, el modelo tiene 0 descargas y 0 *likes*, no publica benchmarks y su licencia es "other" con restricciones derivadas de DINOv3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción): backbone visual DINOv3-L (ViT-L/16) afinado + codificador de texto BERT congelado + cabeza de acciones con horizonte de 50 pasos |
| Parametros totales | no disponible (checkpoint de inferencia de ~1,6 GB, sin desglose de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en tokens; horizonte de acción de 50 pasos a 30 Hz (≈1,67 s de trayectoria) |
| Tipos de cuantizacion | no disponible (checkpoint `.pth` en PyTorch, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible; la instrucción de la tarea se proporciona en inglés y debe usarse literalmente |
| Licencia | `other`: backbone visual bajo DINOv3 License, BERT bajo Apache-2.0, código de terceros en `code/third_party/licenses/` |
| Formato de pesos | `.pth` (PyTorch), ~1,6 GB; incluye modelo, configuración y estadísticas de normalización |

## Arquitectura y entrenamiento

El modelo sigue el paradigma VLA: percepción visual multiplanar (cámara de cabeza y una muñeca por brazo), estado propioceptivo del robot y una instrucción en lenguaje natural se fusionan para predecir una secuencia de comandos motores. El backbone visual es DINOv3-L ViT-L/16, afinado, y el codificador de texto es BERT, que se mantiene congelado durante el entrenamiento. La salida es un *chunk* de 50 poses absolutas de efector final (16 dimensiones por paso: posición xyz, cuaternión xyzw y apertura de pinza para cada brazo) pensado para ejecutarse a 30 Hz.

El entrenamiento es de una sola tarea, con 50 episodios de demostración de la tarea del cepillo de dientes. Las imágenes se aumentan siguiendo el esquema de pi0.5 (recorte y rotación de la cámara de cabeza, *color jitter*) y los episodios se rellenan al final. Se usa un *batch* global de 64 (frente a 12 en la versión anterior) con BERT congelado y tasa de aprendizaje constante tras el *warmup*. La innovación técnica documentada en esta versión es la normalización de acciones por paso de predicción k: la versión previa compartía un único rango para los 50 pasos, lo que hacía que los movimientos milimétricos cercanos cayeran en la misma celda gruesa de la rejilla de acción y provocaran fallos de agarre y colocación. El autor publica primero el checkpoint de mayor número de pasos disponible y, al terminar, `turbovla_step_6000.pth`. No se especifican el número total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de comandos motores bimanuales: devuelve un tensor `[50, 16]` de poses absolutas de efector final para los dos brazos Rokae AR5, con cuaterniones xyzw y apertura de pinza en el rango 0..1.
- Ejecución de una tarea compuesta de dos fases con coordinación entre brazos: colocar el vaso con el brazo izquierdo y depositar el cepillo en el vaso con el brazo derecho.
- Fusión de tres vistas RGB simultáneas (cabeza, muñeca izquierda, muñeca derecha) con resolución original de entrenamiento de 640×480, reescalada internamente a 224×224 con relleno negro.
- Condicionamiento por instrucción en lenguaje natural, limitado a la frase exacta de entrenamiento.
- Integración de estado propioceptivo medido en el mismo instante que las imágenes (`robot_state16`), en el sistema de coordenadas base de cada brazo.
- Filtrado de pinza mediante `GripperHysteresis`: conmutación solo si la predicción cruza 0.3/0.7 durante 3 pasos consecutivos.
- No soporta *tool calling*, ni razonamiento multi-paso genérico, ni otras modalidades (audio, vídeo, visión general). No es un modelo de chat ni de generación de texto libre.

## Casos de uso

- Pruebas en robot real de la tarea de referencia: el modelo se usa directamente sobre un Rokae AR5 de doble brazo para reproducir la secuencia vaso-estantería-cepillo, que es exactamente el escenario para el que fue entrenado.
- Validación de un pipeline VLA completo en laboratorio: sirve como banco de pruebas reproducible (tres cámaras, estado de 16 dimensiones, *chunk* de 50 pasos a 30 Hz) para evaluar latencias, suavizado de comandos y filtros de pinza antes de escalar a más tareas.
- Autodiagnóstico de integración sin robot: el script `tools_selftest.py --checkpoint` permite verificar que el checkpoint y el entorno (torch, transformers ≥ 4.56) cargan correctamente y que la forma de salida es la esperada.
- Investigación en manipulación bimanual: la normalización por paso de predicción y el filtro de histéresis son piezas reutilizables en otros proyectos que sufran fallos de precisión en acciones de rango milimétrico.
- Recolección de *rollouts* para evaluación o *data augmentation*: los 50 comandos por inferencia permiten generar trayectorias densas que pueden compararse con las demostraciones originales para medir error de seguimiento.
- Comparación de estrategias de aumento de datos: al seguir el esquema de pi0.5 (recorte, rotación, *color jitter*) y entrenar con 50 episodios, el modelo es útil como referencia de ablación en experimentos con pocos datos.
- Base para *fine-tuning* de tareas similares sobre el mismo hardware: la interfaz `RokaePolicy.predict` y el formato de estado/acción permiten reutilizar la infraestructura, aunque el modelo publicado solo está entrenado para esta tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una precisión de la pinza por paso del 99 % aproximadamente, medida sobre la predicción de apertura/cierre, y advierte de que un error de una sola trama a 30 Hz puede abrir la pinza de forma indeseada. No hay datos de éxito en tarea, MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB, según el autor.
- GPU recomendadas: el autor no especifica modelos concretos. Por el dato de 3 GB, cualquier GPU con 4 GB o más de VRAM debería ser suficiente; no hay cifras publicadas para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: previsiblemente sí, dado el consumo declarado de ~3 GB (por ejemplo, gamas RTX xx60 o superiores), aunque no hay confirmación explícita del autor.
- Entorno software: Python ≥ 3.10, PyTorch, `transformers>=4.56` (necesario para el soporte de DINOv3), numpy, scipy, pillow y torchvision.
- Opciones de despliegue: inferencia nativa en PyTorch mediante `experiments.rokae.policy.RokaePolicy`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no aplican al no ser un modelo de texto generativo.
- Latencia y throughput: no disponibles. El único dato temporal es que las acciones se ejecutan a 30 Hz y que el *chunk* cubre 50 pasos.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El único modelo citado en la *model card* es pi0.5, y se menciona exclusivamente como referencia para el esquema de aumento de datos, no como comparación de rendimiento ni de arquitectura.

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurboVLA Rokae v3 (toothbrush) | no disponible (~1,6 GB de checkpoint) | 50 pasos de acción a 30 Hz | sin benchmarks publicados | `other` (DINOv3 License + Apache-2.0) | Hugging Face, 0 descargas |
| pi0.5 | no disponible | no disponible | no disponible | no disponible | citado solo como referencia de aumento de datos |
| Otros VLA bimanuales (OpenVLA, π0, RDT-1B, ACT) | no disponible | no disponible | no disponible | no disponible | no evaluados en la informacion disponible |

## Limitaciones y advertencias

- Modelo de una sola tarea: solo ejecuta la secuencia entrenada. Cualquier otra instrucción queda fuera de su distribución y no hay evidencia de generalización.
- La instrucción debe introducirse literalmente: "place the cup on the yellow shelf with the left arm, then put the toothbrush into the cup with the right arm". No se documenta tolerancia a paráfrasis ni a otros idiomas.
- Dependencia fuerte del *hardware*: robot Rokae AR5 de doble brazo, pinzas paralelas, tres cámaras RGB con montaje concreto y estado leído en el sistema base de cada brazo. Cambiar la calibración o la disposición de las cámaras invalida el modelo.
- Precisión de la pinza: entrenada solo con valores 0/1, con ~99 % de acierto por paso. Un único fallo a 30 Hz puede abrir la pinza; el autor recomienda encarecidamente usar `GripperHysteresis` (umbrales 0.3/0.7 con 3 pasos consecutivos).
- Desfase temporal: la fila 0 de la salida no corresponde a la pose actual, sino que va 4–5 fotogramas por delante de la pose medida. Ignorar esto introduce error de seguimiento.
- Las imágenes deben pasarse en RGB (no BGR), a resolución original y sin recorte ni escalado previo; el modelo aplica internamente el relleno y el reescalado a 224×224.
- Entrenamiento con solo 50 episodios de una tarea: riesgo alto de sobreajuste al entorno concreto y baja robustez ante cambios de iluminación, posiciones de objetos o distracciones no vistas.
- Riesgo de acciones físicamente inválidas o inseguras: el modelo no incorpora comprobaciones de colisión ni límites articulares; cualquier despliegue real necesita una capa de seguridad externa.
- Licencia `other`: el backbone visual derivado de DINOv3 está sujeto a la DINOv3 License, lo que condiciona el uso comercial. BERT es Apache-2.0. Hay que revisar `code/assets/dinov3-vitl16-pretrain-lvd1689m/LICENSE.md` y `code/third_party/licenses/` antes de cualquier uso productivo.
- Los datos de entrenamiento no se distribuyen con el repositorio, por lo que no es posible reproducir el entrenamiento ni auditar la composición del dataset.
- Estado del proyecto: 0 descargas y 0 *likes*, con checkpoints publicados de forma incremental (el de referencia final es el de 6000 pasos). No hay validación externa ni resultados de terceros.
- Idiomas y cobertura multilingüe: no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noctis12138/turbovla-rokae-toothbrush
- Código de inferencia dentro del repositorio: `code/experiments/rokae/policy.py`
- Notas de cambios de la versión: `code/FIX_1019.md`
- Autodiagnóstico: `code/tools_selftest.py`
- Licencia del backbone visual: `code/assets/dinov3-vitl16-pretrain-lvd1689m/LICENSE.md`
- Licencias de terceros: `code/third_party/licenses/`
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el modelo.
