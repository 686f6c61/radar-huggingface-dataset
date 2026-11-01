# CharlieH512/km_tokenizer_pertick_coarse_3x1000

## Resumen

KM tokenizer, per tick, coarse (3 × 1000) es un tokenizador discreto para entradas de teclado y ratón desarrollado por CharlieH512, entrenado sobre grabaciones de partidas de Minecraft. No es un modelo de lenguaje: su función es convertir fotogramas de entrada a 100 Hz (teclas y ejes del ratón) en 3 códigos discretos por tick de 80 ms, cada uno en el rango [0, 1000), y reconstruir los fotogramas originales a partir de esos códigos. Con 10.746.429 parámetros en fp32, está pensado como pieza de un pipeline mayor, probablemente para modelar comportamiento de jugador con modelos generativos discretos.

La variante "coarse" introduce dos decisiones de diseño relevantes: cada tick se reduce a un único paso antes de codificar (una tecla cuenta como mantenida si lo estuvo en cualquier momento del tick, y el movimiento del ratón se suma y reparte uniformemente entre los 8 fotogramas) y el codificador y el decodificador operan estrictamente por tick, sin atención entre ticks. El resultado es una representación compacta que sacrifica la precisión temporal de 10 ms dentro del tick a cambio de una secuencia de tokens más corta y desacoplada.

Su relevancia es acotada y de nicho: sirve como componente de tokenización para investigación sobre imitación de comportamiento humano en videojuegos, agentes que consumen o generan entradas de teclado y ratón, y compresión de trayectorias de input. No debe confundirse con un modelo conversacional ni con un tokenizador de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal tipo transformer sobre los 8 fotogramas de un tick, con proyección lineal a un latente por tick, cortado en 3 slices y cuantizado con FSQ (niveles 8 × 5 × 5 × 5 = 1000 códigos); decodificador que expande cada tick a 8 fotogramas de 79 logits de teclas y, por eje del ratón, logits sobre 241 bins de movimiento |
| Parámetros totales | 10.746.429 (fp32) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica como contexto de texto; el encoder atiende a los 8 fotogramas de un tick y el decoder no atiende entre ticks (`decoder_across_ticks: false`, `encoder_tick_radius: [0, 0, 0, 0]`) |
| Tipos de cuantización | no disponible (pesos publicados en fp32; el modelo aplica cuantización FSQ interna a los latentes, no a los pesos) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | safetensors (`model.safetensors`) y `config.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura denominada ctx14 por el autor: atención sobre los 8 fotogramas que componen un tick de 80 ms, seguida de un mapeo lineal que produce un latente por tick. Ese latente se divide en 3 slices y cada slice se cuantiza de forma independiente mediante Finite Scalar Quantization con niveles 8 × 5 × 5 × 5, lo que da exactamente 1000 códigos por slice y 3 códigos por tick en total. El decodificador invierte el proceso: expande los códigos de cada tick a 8 fotogramas, emitiendo 79 logits de teclas por fotograma y, para cada eje del ratón, logits sobre 241 bins de movimiento.

La particularidad de esta variante es el preprocesado "coarse": antes de codificar, los 8 fotogramas del tick se colapsan en un único paso, de modo que una tecla se considera mantenida durante todo el tick si lo estuvo en cualquier instante, y el desplazamiento del ratón se suma y se reparte de manera uniforme entre los 8 fotogramas. La reconstrucción devuelve esa forma gruesa, no el timing exacto de 10 ms. Además, no hay atención entre ticks ni en el codificador ni en el decodificador, con la única excepción de las features de "pulsada / liberada en este fotograma" del primer fotograma, que se comparan con el último fotograma del tick anterior; por tanto, los códigos de un tick pueden depender de si una tecla ya estaba mantenida en el tick previo.

En entrenamiento se ponderó la pérdida de teclas de cada tick según la rareza de su patrón en los datos (hasta 10×), de forma que las combinaciones poco frecuentes se reconstruyen con calidad comparable a las comunes. No se especifican en la información disponible el volumen de datos, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; tampoco se detalla el proceso de optimización.

## Capacidades

- Tokenización de entradas de teclado y ratón a 100 Hz en 3 códigos discretos por tick de 80 ms, con cada código en [0, 1000).
- Detokenización: reconstrucción de 8 fotogramas por tick con 79 logits de teclas por fotograma y 241 bins de movimiento por eje del ratón.
- Representación compacta y estrictamente local por tick, adecuada para modelado secuencial con vocabulario discreto pequeño.
- Manejo reforzado de patrones de teclas poco frecuentes gracias a la ponderación de pérdida por rareza (hasta 10×).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión, audio ni modo de razonamiento.
- Dominio específico: entradas de jugador en Minecraft.

## Casos de uso

- Modelado generativo de comportamiento de jugador: los 3 códigos por tick forman una secuencia discreta compacta que puede alimentar un transformer autorregresivo para predecir la siguiente acción de un jugador en Minecraft, con un vocabulario de solo 1000 símbolos por slice.
- Compresión de grabaciones de gameplay: convertir logs de entrada a 100 Hz en secuencias de 3 tokens por tick reduce el almacenamiento de forma drástica, a costa de perder la temporización fina dentro del tick, algo aceptable para análisis agregado de partidas.
- Agentes imitadores (behavior cloning): entrenar políticas que reproduzcan patrones de teclado y ratón humanos a partir de demostraciones tokenizadas, usando la reconstrucción del decodificador como espacio de acción.
- Análisis estadístico de patrones de input: la tokenización permite contar y clasificar combinaciones de teclas y movimientos de ratón por tick, útil para estudiar estilos de juego o detectar anomalías.
- Aumentación de datos de gameplay: muestrear y perturbar secuencias de códigos y decodificarlas a fotogramas sintéticos de teclado y ratón para ampliar datasets de entrenamiento.
- Investigación en tokenizadores discretos de señales no textuales: sirve como referencia reproducible de FSQ aplicada a entradas de control, comparable con la variante con contexto entre ticks del mismo autor.
- Preprocesado en pipelines de aprendizaje por refuerzo offline: representar trayectorias de interacción humana en un espacio discreto manejable para algoritmos que requieren acciones categóricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 10,75 M parámetros en fp32, lo que equivale a unos 43 MB de pesos; la huella completa con buffers y activaciones se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090, una RTX 3060 o incluso una GPU integrada pueden ejecutarlo.
- Cabe holgadamente en GPU de consumo y también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y una configuración propia (`KmTokenizerCtx14Config`), requiere cargarlo con código del autor; no hay soporte conocido en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño y la naturaleza por tick, se espera un coste despreciable frente a cualquier modelo de lenguaje, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CharlieH512/km_tokenizer_pertick_coarse_3x1000 | 10,75 M | 8 fotogramas por tick, sin atención entre ticks | Tokenizador de teclado y ratón (FSQ) | other | HuggingFace, 28 descargas |
| CharlieH512/km_tokenizer_ctx14_8x1000 | no disponible en la información | atención entre ticks (ctx14) | Tokenizador de teclado y ratón (FSQ) | no disponible | HuggingFace, referenciado por el autor |
| Otros tokenizadores de entrada para videojuegos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con `km_tokenizer_ctx14_8x1000`, del mismo autor: comparte la arquitectura ctx14 y el vocabulario de 1000 códigos por slice, pero aquel conserva la información entre ticks y este la elimina deliberadamente, además de colapsar cada tick a un único paso. No se dispone de datos de benchmarks que permitan comparar su calidad de reconstrucción.

## Limitaciones y advertencias

- Pérdida de resolución temporal: la variante coarse no conserva el timing exacto de 10 ms dentro de un tick; una tecla pulsada y liberada dentro del mismo tick se reconstruye como mantenida durante todo el tick.
- Dependencia del tick anterior: los códigos de un tick pueden depender de si una tecla ya estaba mantenida en el tick previo, por lo que la tokenización no es completamente independiente tick a tick en ese aspecto.
- Dominio muy restringido: entrenado exclusivamente con grabaciones de Minecraft; su comportamiento fuera de ese juego o con esquemas de entrada distintos no está documentado.
- Sin benchmarks publicados: no hay métricas de calidad de reconstrucción ni comparaciones cuantitativas con alternativas, lo que dificulta evaluar su idoneidad en producción.
- Licencia "other": las condiciones exactas de uso comercial no se detallan en la información disponible; es necesario consultar los términos del autor antes de integrarlo en un producto.
- No es un modelo de lenguaje: no admite prompts, tool calling ni generación de texto; usarlo requiere código específico para cargar la configuración y los pesos.
- Riesgo de sesgo hacia los patrones de juego presentes en los datos de entrenamiento, mitigado parcialmente por la ponderación de patrones raros, pero sin evaluación publicada al respecto.
- Advertencia de integridad: la fecha de creación indicada (2026-10-25) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieH512/km_tokenizer_pertick_coarse_3x1000
- Variante con contexto entre ticks: https://huggingface.co/CharlieH512/km_tokenizer_ctx14_8x1000
- Paper, blog, repositorio o demo: no disponible en la información proporcionada.
