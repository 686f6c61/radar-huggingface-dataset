# Fisher-Wang/lingbot-vla-v2-6b-libero-goal

## Resumen

LingBot-VLA 2.0 6B — LIBERO Goal es un checkpoint de fine-tuning del modelo base `robbyant/lingbot-vla-v2-6b`, desarrollado por Fisher-Wang. Se trata de un modelo de visión-lenguaje-acción (VLA) diseñado para controlar robots manipuladores a partir de imágenes y instrucciones en lenguaje natural. Este checkpoint concreto se ha ajustado conjuntamente para las diez tareas del benchmark LIBERO Goal, utilizando exclusivamente demostraciones estándar del dataset `lerobot/libero`. El modelo tiene 6.375.907.511 parámetros (aproximadamente 6,38 mil millones) y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en su enfoque práctico: LingBot-VLA 2.0 busca trasladar los avances de los modelos VLA desde entornos de laboratorio a aplicaciones robóticas reales. Este checkpoint específico documenta de forma transparente su proceso de entrenamiento, los resultados de evaluación en LIBERO Goal y las limitaciones observadas, lo que lo convierte en un recurso útil para investigadores y desarrolladores que trabajan en manipulación robótica basada en aprendizaje. Aunque no se especifican detalles de arquitectura interna en la información disponible, se sabe que utiliza el procesador/tokenizer de Qwen3-VL para la construcción de entradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer multimodal (detalles no especificados) |
| Parametros totales | 6.375.907.511 (6,38B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (6 shards) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de LingBot-VLA 2.0, un modelo fundacional de visión-lenguaje-acción. Aunque no se detalla la arquitectura interna en la información proporcionada, se menciona que se requiere la ruta de Qwen3-VL para construir el procesador/tokenizer, lo que sugiere que el backbone multimodal está basado en la familia Qwen3-VL. La salida del modelo es una secuencia de acciones de 7 dimensiones (delta relativo del efector final: xyz + axis-angle + gripper), junto con un estado de 8 dimensiones. Se utiliza un chunk de acción de 50 pasos y se conserva la cabeza unificada de 55 dimensiones del modelo original.

El entrenamiento se realizó sobre las diez tareas de LIBERO Goal, con 428 episodios y 52.042 frames. Se aplicaron 2.000 actualizaciones de optimizador en la segunda etapa, usando el optimizador Muon con una tasa de aprendizaje coseno de 3e-5 a 3e-6 y un 2% de warmup. El batch efectivo fue de 7, distribuido en 7 GPUs NVIDIA A100 de 80GB. El pipeline de entrenamiento excluye las posiciones marcadas como `action_is_pad` de la máscara de pérdida, y utiliza un índice de muestreo corregido para los límites de episodios filtrados.

## Capacidades

- Generación de acciones de robot (7D) a partir de imágenes de cámara (vista agente y cámara en mano) y una instrucción en lenguaje natural.
- Control de brazo robótico en tareas de manipulación de objetos sobre una mesa (abrir cajones, colocar objetos, empujar platos, etc.).
- Ejecución de tareas de largo horizonte con un chunk de acción de 50 pasos, lo que permite planificar secuencias de movimiento.
- Seguimiento de instrucciones en inglés (las instrucciones de LIBERO están en inglés).
- Capacidad de evaluación en bucle cerrado (closed-loop) con límite de 300 pasos por episodio.
- No se reportan capacidades de tool calling, agentes generales ni procesamiento de lenguaje fuera del ámbito robótico.

## Casos de uso

- **Investigación en manipulación robótica**: el modelo puede utilizarse como punto de partida para estudiar el comportamiento de VLA en tareas de LIBERO Goal, comparando estrategias de entrenamiento o evaluando la generalización a otras suites.
- **Desarrollo de políticas de control para robots de sobremesa**: dado que el modelo genera acciones relativas del efector final, puede integrarse en sistemas de control de brazos robóticos de 6 o 7 grados de libertad en entornos simulados o reales.
- **Evaluación de robustez en entornos simulados**: los resultados detallados por tarea permiten identificar fortalezas y debilidades del modelo, útil para depurar pipelines de entrenamiento.
- **Benchmarking de modelos VLA**: al estar entrenado específicamente para LIBERO Goal, sirve como referencia para comparar otros modelos o variantes de LingBot-VLA.
- **Estudio de transferencia entre suites**: aunque este checkpoint solo cubre LIBERO Goal, puede usarse para analizar la transferencia a otras suites (Spatial, Object, LIBERO-10) si se realizan fine-tunings adicionales.
- **Reproducibilidad y auditoría de entrenamiento**: los archivos de configuración, estadísticas de normalización y manifiestos incluidos permiten reproducir el entrenamiento y verificar la integridad de los datos.

## Benchmarks y rendimiento

El modelo fue evaluado en el benchmark estándar LIBERO Goal, con 10 ensayos por tarea (100 episodios en total) usando las condiciones oficiales (estado inicial, semilla 7, límite de 300 pasos). Los resultados se muestran a continuación:

| Tarea | Descripcion | Exitos | Tasa de exito |
|---:|---|---:|---:|
| 0 | abrir el cajon del medio del armario | 4/10 | 40% |
| 1 | poner el bol en la cocina | 9/10 | 90% |
| 2 | poner la botella de vino encima del armario | 7/10 | 70% |
| 3 | abrir el cajon superior y poner el bol dentro | 3/10 | 30% |
| 4 | poner el bol encima del armario | 9/10 | 90% |
| 5 | empujar el plato hacia el frente de la cocina | 3/10 | 30% |
| 6 | poner el queso crema en el bol | 3/10 | 30% |
| 7 | encender la cocina | 10/10 | 100% |
| 8 | poner el bol en el plato | 6/10 | 60% |
| 9 | poner la botella de vino en la estanteria | 0/10 | 0% |
| **Global** | **LIBERO Goal** | **54/100** | **54%** |

No se han publicado resultados de benchmarks en la informacion disponible más allá de los de LIBERO Goal.

## Requisitos de hardware

- **Entrenamiento**: se utilizaron 7 GPUs NVIDIA A100 de 80GB (batch efectivo 7). No se especifican requisitos mínimos para inferencia.
- **Inferencia**: no se proporcionan datos oficiales de VRAM, latencia o throughput. Dado el tamaño de 6,38B parámetros, se estima que una GPU con al menos 16-24GB de VRAM podría ser suficiente en cuantización de 8 bits, pero no hay confirmación.
- **Opciones de despliegue**: no se mencionan frameworks específicos (vLLM, llama.cpp, etc.). El modelo está en formato safetensors y es compatible con la librería `transformers`, por lo que podría cargarse con Hugging Face Transformers, aunque se requiere la ruta de Qwen3-VL para el procesador/tokenizer.
- **Nota**: el repositorio incluye archivos de evaluación y configuración, pero no se documentan requisitos de hardware para ejecutar el modelo en producción.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (otros VLA como OpenVLA, RT-2, etc.) en términos de parámetros, contexto o rendimiento. La información proporcionada solo cubre este checkpoint específico y su modelo base. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- **Rendimiento desigual por tarea**: la tarea 9 (poner la botella de vino en la estantería) falló en todos los ensayos (0% de éxito), y varias tareas (3, 5, 6) solo alcanzaron un 30%. Esto indica una generalización limitada a ciertas configuraciones.
- **Entrenamiento restringido a LIBERO Goal**: el modelo solo se entrenó en la suite Goal, no en Spatial, Object, LIBERO-10 ni LIBERO-90. No se garantiza su comportamiento en otras tareas.
- **Dependencia de Qwen3-VL**: el procesador/tokenizer requiere la ruta de Qwen3-VL-4B-Instruct, cuyos pesos no se incluyen en este release. Esto añade una dependencia externa para la inferencia.
- **Sesgos y alucinaciones**: al ser un modelo de robótica, no se han documentado sesgos lingüísticos, pero la generación de acciones puede ser errática en situaciones no vistas.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe verificar la licencia de los modelos base y datasets utilizados (por ejemplo, Qwen3-VL y LIBERO).
- **Reproducibilidad**: aunque se incluyen archivos de configuración y estadísticas, la reproducibilidad exacta depende de las versiones fijadas de los componentes (pins.json) y del acceso a los datos originales.

## Enlaces

- [HuggingFace - Fisher-Wang/lingbot-vla-v2-6b-libero-goal](https://huggingface.co/Fisher-Wang/lingbot-vla-v2-6b-libero-goal)
- [GitHub - Robbyant/lingbot-vla-v2](https://github.com/Robbyant/lingbot-vla-v2)
- [Paper - From Foundation to Application: Improving VLA Models in Practice](https://arxiv.org/abs/2607.06403)
- [GitHub - Robbyant/lingbot-vla (versión 1.0)](https://github.com/Robbyant/lingbot-vla)
- [Artículo en AI China News sobre LingBot VLA v2 6B](https://aichina.news/blog/lingbot-vla-v2-6b-an-open-ascend-ready-vision-language-action-model-w72b96/)
