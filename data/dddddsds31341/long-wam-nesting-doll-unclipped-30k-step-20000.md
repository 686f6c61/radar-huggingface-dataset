# dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-30k-Step-20000

## Resumen

Long-WAM-Nesting-Doll-Unclipped-30k-Step-20000 es un checkpoint de inferencia para robótica, derivado por ajuste fino del modelo base Efficient-Large-Model/Long-WAM-YAM. Lo publica el usuario dddddsds31341 y está entrenado sobre el dataset yuyingyinya/nesting_doll, compuesto por 100 demostraciones y 164.571 fotogramas de una tarea concreta: apilar muñecas rusas (nesting dolls) de menor a mayor, insertando cada una dentro de la siguiente hasta dejarlas todas en la más grande. El modelo no es un LLM de propósito general, sino una política visomotora que produce acciones de robot a partir de observaciones RGB y del estado propioceptivo.

El checkpoint corresponde al paso de optimización 20.000 de una ejecución de 30.000 pasos, con normalización z-score por tarea sin recorte de valores (de ahí "unclipped"). Se distribuye como pesos de inferencia en formato PyTorch (`model.pt`), sin estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento de forma exacta. El repositorio ocupa 12 GB e incluye también `config.yaml`, `dataset_stats.json`, el código SIP empaquetado y las dependencias de versión.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de una política de manipulación de precisión entrenada con el stack Long-WAM, útil para investigadores que trabajen en inserción de objetos, manipulación diestra o evaluación de modelos de acción con troceado de 32 pasos y contexto histórico de 48 fotogramas. El autor no declara ninguna tasa de éxito ni rendimiento en held-out.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política visomotora Long-WAM; el model card no detalla la topología interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | P48 de historial de observaciones (48 fotogramas) y troceado de acción de 32 pasos |
| Tipos de cuantizacion | no disponible (checkpoint en BF16, según el entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica; instrucción de tarea en inglés) |
| Licencia | other (sujeta a la licencia del modelo base Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | PyTorch (`model.pt`) |

Otros datos técnicos declarados: entrada de 14 dimensiones de objetivos absolutos de articulación y pinza en unidades originales (6 articulaciones + pinza izquierda, después 6 articulaciones + pinza derecha); cámaras RGB `top_head`, `hand_left` y `hand_right`; disposición de vídeo procesado de 384×320; precisión BF16; entrenamiento con DeepSpeed ZeRO-1.

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Efficient-Large-Model/Long-WAM-YAM, orientado a generar acciones de robot. El model card no describe la arquitectura interna (transformer, difusión de políticas, etc.), pero sí el pipeline de datos y el régimen de entrenamiento. La política consume tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) con disposición de vídeo de 384×320, mantiene un historial P48 y emite trozos de acción de 32 pasos. Las acciones son objetivos absolutos de 14 dimensiones en las unidades originales de la pinza, con el orden articulación-pinza izquierda seguido de articulación-pinza derecha.

El entrenamiento se realizó sobre el dataset yuyingyinya/nesting_doll (revisión ae8a879c9a635d3c666aba58a4d9ac996225edb8), con 100 demostraciones y 164.571 fotogramas. Se usaron cuatro A100, tamaño de lote 12 por GPU con acumulación de gradiente 1 (lote global 48), tasa de aprendizaje constante de 1e-05, AdamW con weight decay 0.01, semilla 42, BF16 y DeepSpeed ZeRO-1. El objetivo de la ejecución eran 30.000 pasos de optimizador; este repositorio corresponde al paso 20.000. La normalización es z-score específica de la tarea, sin recorte de los valores normalizados, y debe usarse junto con las estadísticas incluidas. No se documenta RLHF, DPO ni ninguna fase de ajuste por preferencias.

## Capacidades

- Generación de acciones de manipulación robótica de 14 dimensiones (6 articulaciones + pinza por brazo) a partir de observaciones RGB multicámara y estado propioceptivo.
- Control visomotor con historial temporal: mantiene 48 fotogramas de contexto y emite secuencias de 32 acciones por inferencia.
- Ejecución de una tarea de inserción y apilamiento de precisión: anidar muñecas rusas de menor a mayor.
- Procesamiento de tres vistas simultáneas (`top_head`, `hand_left`, `hand_right`) a 384×320.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso simbólico, visión general, audio ni multilingüismo.
- No se declara modo de pensamiento (thinking mode) ni decodificación especulativa.

## Casos de uso

- Investigación en manipulación de precisión: usar el checkpoint como línea base reproducible para tareas de inserción de objetos, comparando políticas entrenadas con el mismo stack Long-WAM sobre el dataset nesting_doll.
- Reproducción de experimentos: el repositorio incluye `config.yaml`, `dataset_stats.json`, el código SIP y las versiones de dependencias, lo que permite reconstruir el pipeline de inferencia con `longwam.inference.load_run_config` y `load_model` fijando `expected_step=20000`.
- Evaluación de normalización sin recorte: sirve para estudiar el efecto de la normalización z-score sin clipping en el rendimiento de políticas de imitación, ya que el checkpoint se entrenó explícitamente con esa configuración.
- Desarrollo de pipelines de evaluación en robótica: integrar el modelo en un banco de pruebas con las tres cámaras y el estado propioceptivo para medir tasas de éxito en la tarea de anidado, aunque el autor no publica métricas.
- Estudio de troceado de acción e historial: analizar cómo afectan el chunk de 32 pasos y el historial P48 a la estabilidad de la política en tareas secuenciales de varias etapas.
- Punto de partida para ajuste fino adicional: al ser un checkpoint de inferencia derivado de Long-WAM-YAM, puede servir como inicialización para nuevas tareas de manipulación, aunque requeriría reconstruir el estado de entrenamiento.
- Docencia y divulgación: ejemplo práctico de entrenamiento multi-GPU con DeepSpeed ZeRO-1 y BF16 en robótica de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna tasa de éxito de robot ni rendimiento en held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 12 GB y los pesos están en BF16, pero el model card no desglosa el tamaño del modelo ni el consumo en inferencia.
- GPU recomendadas: el entrenamiento se realizó en cuatro A100; para inferencia no se especifica hardware mínimo.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el autor indica extraer `code.zip`, instalar el checkout de Long-WAM incluido y usar `longwam.inference.load_run_config` y `load_model` con la ruta explícita a `model.pt` y `expected_step=20000`. Se requieren por separado los assets del VAE Wan2.2, el codificador de texto UMT5 y el tokenizador. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota de portabilidad: la configuración registrada conserva rutas SIP; hay que adaptar las rutas de assets del modelo, dataset, estadísticas y caché a la máquina de destino.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (políticas robóticas de manipulación), por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Checkpoint de inferencia únicamente: `model.pt` contiene `mot`, `proprio_encoder`, `step` y `torch_dtype`, pero no estado de optimizador, scheduler ni RNG; no permite reanudar el entrenamiento de forma exacta.
- Sin métricas de rendimiento: el autor no declara tasa de éxito ni evaluación en held-out, por lo que no hay evidencia publicada de su eficacia en la tarea.
- Especialización extrema: entrenado para una única instrucción de tarea (anidar muñecas rusas) sobre 100 demostraciones; no es un modelo generalista y no se espera que generalice a otras tareas sin ajuste fino.
- Dependencia de normalización: usa estadísticas z-score específicas de la tarea sin recorte; usar otras estadísticas o recortar los valores puede degradar o invalidar la inferencia.
- Dependencias externas obligatorias: requiere los assets del VAE Wan2.2, el codificador UMT5 y el tokenizador, que no se incluyen en el repositorio.
- Rutas no portables: la configuración conserva rutas SIP que deben adaptarse manualmente.
- Licencia "other": los términos concretos remiten a la licencia del modelo base Efficient-Large-Model/Long-WAM-YAM; debe revisarse antes de cualquier uso comercial.
- Idiomas: no se declara soporte multilingüe; la instrucción de tarea está en inglés.
- Riesgo de alucinación y sesgos: no aplica en el sentido de un LLM, pero la política puede fallar en la tarea sin que se documenten los modos de fallo.
- Fecha de creación declarada: 2026-11-04, posterior a la fecha de referencia habitual; conviene verificar la vigencia del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-30k-Step-20000
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: yuyingyinya/nesting_doll (revisión ae8a879c9a635d3c666aba58a4d9ac996225edb8)
- Código SIP incluido en el repositorio: `long-wam-sip-nesting-30k-resumable-20261103-v41.zip` (dentro de `code.zip`)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; el único resultado devuelto trata sobre mercados de NFT y no guarda relación.
