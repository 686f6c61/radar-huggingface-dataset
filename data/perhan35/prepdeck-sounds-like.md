# Perhan35/prepdeck-sounds-like

## Resumen

PrepDeck — "sounds like" model es una conversión a Core ML del encoder de audio del modelo CLAP de LAION (`laion/larger_clap_music`), publicada por el usuario Perhan35 para su uso dentro de la aplicación macOS PrepDeck. No se trata de un modelo de lenguaje ni de un modelo generativo: es un extractor de representaciones (embeddings) de audio cuya única función es transformar 10 segundos de audio mono a 48 kHz en un vector de 512 dimensiones normalizado en L2, pensado para tareas de similitud musical.

El problema que resuelve es de despliegue, no de modelado: los pesos son idénticos a los del modelo original (Apache-2.0), y el único cambio introducido es la sustitución del redimensionado bicúbico del espectrograma por una matriz fija equivalente, de modo que el grafo pueda ejecutarse en Core ML. Es relevante para desarrolladores que quieran incorporar búsqueda por similitud de audio en aplicaciones nativas de Apple sin depender de PyTorch ni de un servicio remoto.

El repositorio ocupa 0,1 GB, la licencia es Apache-2.0 y no registra descargas ni valoraciones en el momento de redactar esta ficha. La model card es muy breve y no documenta parámetros, datos de entrenamiento ni evaluaciones propias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio de CLAP (Contrastive Language-Audio Pretraining); la model card no detalla la topología interna. El modelo base es `laion/larger_clap_music` |
| Parametros totales | No disponible (el autor no los publica). Estimación aproximada a partir del tamaño del repo (0,1 GB en FP16) en torno a 50 M de parámetros; no confirmada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Entrada fija: 10 s de audio mono a 48 kHz, espectrograma log-mel de forma `[1, 1, 1001, 64]` |
| Tipos de cuantizacion | FP16 (half precision) en el artefacto Core ML. No se ofrecen otras variantes |
| Idiomas soportados | No aplica al ser un modelo de audio; no se declaran idiomas en la model card |
| Licencia | Apache-2.0 (idéntica al modelo original) |
| Formato de pesos | Core ML (`.mlmodel` / `.mlpackage`). No se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card indica únicamente que se trata del encoder de audio de CLAP de LAION, concretamente de la variante `larger_clap_music`, y que los pesos no se han modificado respecto al original. CLAP es un modelo de preentrenamiento contrastivo audio-texto en el que una rama de audio y una rama de texto se alinean en un espacio común de embeddings; esta publicación conserva solo la rama de audio. El autor no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste fino con RLHF o DPO en el modelo base.

La única modificación técnica declarada es la del preprocesado: el redimensionado bicúbico del espectrograma se ha reemplazado por una matriz fija equivalente, matemáticamente idéntica en el resultado, para que Core ML pueda compilar y ejecutar el grafo. La salida es un embedding de 512 números normalizado en L2, lo que permite comparar audios entre sí mediante producto escalar o distancia coseno.

## Capacidades

- Extracción de embeddings de audio: convierte 10 segundos de audio mono a 48 kHz en un vector de 512 dimensiones normalizado en L2.
- Similitud musical ("sounds like"): al ser un espacio de embeddings normalizado, permite ordenar una biblioteca musical por cercanía a un fragmento de referencia.
- Procesamiento de espectrogramas log-mel con la forma de entrada exacta `[1, 1, 1001, 64]` que espera el modelo base.
- Inferencia local en macOS mediante Core ML, incluida la ejecución sobre Apple Neural Engine.
- No incluye la rama de texto de CLAP, por lo que no permite recuperación cero-disparo (zero-shot) a partir de consultas en lenguaje natural dentro de este artefacto.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente.
- No se declaran capacidades multilingües ni modos especiales (thinking mode, audio generativo, etc.).

## Casos de uso

- Búsqueda de canciones similares en una aplicación macOS: se indexa la biblioteca calculando el embedding de 512 dimensiones de cada pista y se consulta por vecinos más cercanos respecto al embedding de la canción de referencia.
- Deduplicación y limpieza de bibliotecas musicales: detectar versiones repetidas, remasterizaciones o ediciones distintas de la misma grabación comparando distancias coseno entre embeddings.
- Generación automática de listas de reproducción: agrupar pistas mediante clustering sobre los embeddings y etiquetar cada clúster por proximidad a una semilla elegida por el usuario.
- Búsqueda de samples para productores musicales: localizar fragmentos de 10 segundos con textura sonora parecida dentro de una carpeta de samples, usando el vector como clave de un índice vectorial local.
- Etiquetado y organización de audio no musical: el modelo base se entrenó sobre música, pero el mismo espacio de embeddings permite agrupar efectos de sonido o field recordings por similitud tímbrica.
- Integración en el flujo de trabajo de PrepDeck: servir como componente de recomendación dentro de la propia aplicación macOS, sin llamadas a red, aprovechando la ejecución en el Neural Engine para no consumir GPU.
- Moderación o auditoría de catálogos: agrupar grandes volúmenes de audio por similitud para detectar contenido duplicado o no declarado en plataformas de distribución musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación, precisión de similitud ni comparaciones numéricas con el modelo base, y la búsqueda web no ha devuelto documentación técnica asociada a esta publicación.

## Requisitos de hardware

- Espacio en disco: 0,1 GB para el repositorio completo, incluidos los pesos en FP16.
- Consumo de memoria en inferencia: inferior a 1 GB de memoria unificada, coherente con un artefacto de 0,1 GB en FP16 más el búfer del espectrograma de entrada.
- Plataforma: Core ML requiere macOS (o iOS/iPadOS) con soporte de Core ML. No es ejecutable en Linux ni Windows a través de este artefacto.
- Aceleración: puede ejecutarse en CPU, GPU o Apple Neural Engine según la política de Core ML; en equipos con Apple Silicon (M1 o posteriores) es esperable el uso del Neural Engine, aunque el autor no publica la configuración utilizada.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, el formato Core ML no se ejecuta sobre CUDA.
- Opciones de despliegue: Core ML (framework nativo de Apple) y `coremltools` para conversión o inspección. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. La sustitución del redimensionado bicúbico por una matriz fija apunta a reducir el coste de preprocesado en Core ML, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Perhan35/prepdeck-sounds-like | Core ML (FP16) | No disponible (estimación ~50 M) | 10 s de audio, espectrograma `[1, 1, 1001, 64]` | Apache-2.0 | HuggingFace, 0 descargas |
| laion/larger_clap_music (modelo base) | Pesos PyTorch (checkpoint original) | No disponible en la información proporcionada | Igual que el anterior, más la rama de texto | Apache-2.0 | HuggingFace, repositorio de LAION |
| Otras alternativas de embeddings de audio o de conversiones a Core ML | No disponible | No disponible | No disponible | No disponible | No se han encontrado en la información proporcionada |

La diferencia funcional verificable entre esta publicación y su modelo base es el formato de distribución y la eliminación de la rama de texto: esta versión está optimizada para inferencia local en macOS, no para búsqueda texto-a-audio.

## Limitaciones y advertencias

- No es un modelo generativo ni un modelo de lenguaje: no produce texto, código ni respuestas, solo vectores de 512 dimensiones.
- Al conservar únicamente la rama de audio, se pierde la capacidad de recuperación cero-disparo con consultas textuales que sí ofrece CLAP completo.
- La ventana de análisis está fijada en 10 segundos; audios más largos requieren segmentación manual y una estrategia de agregación de embeddings que el autor no documenta.
- La entrada exige exactamente audio mono a 48 kHz con espectrograma log-mel de forma `[1, 1, 1001, 64]`; cualquier desviación en el preprocesado invalida los resultados.
- No hay evaluaciones publicadas ni métricas de calidad, por lo que no es posible cuantificar la degradación introducida por el cambio de redimensionado bicúbico a matriz fija.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de falsos positivos en similitud, ya que el espacio de embeddings no está calibrado para umbrales concretos en esta publicación.
- Sesgos: no documentados. El modelo base se entrenó sobre música y puede representar peor géneros, culturas o idiomas poco presentes en su dataset original, aspecto que la model card no aborda.
- Licencia Apache-2.0, que permite uso comercial, pero el usuario debe verificar las condiciones del modelo base de LAION y de cualquier dato con derechos asociado al audio procesado.
- La fecha de creación del repositorio (2026-10-09) y de actualización (2026-10-09) resultan anómalas según los metadatos de HuggingFace; conviene comprobarlas antes de citar la ficha.
- Ausencia total de tracción (0 descargas, 0 likes) y de documentación adicional: no hay garantía de mantenimiento ni de soporte por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Perhan35/prepdeck-sounds-like
- Modelo base: https://huggingface.co/laion/larger_clap_music
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales relacionados con esta publicación.
