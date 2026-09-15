# barry-mir/muse-timbre

## Resumen

MuseTimbre es un conjunto de pesos para transferencia de timbre zero-shot en audio musical, publicado en HuggingFace por el usuario barry-mir bajo el identificador `barry-mir/muse-timbre`. El trabajo corresponde a Yuan-Chiao Cheng (Music Informatics Group, Georgia Institute of Technology) y Zhiyao Duan (University of Rochester), y lleva por título "MuseTimbre: Zero-Shot Timbre Transfer by Controlling a Frozen Music Generator". El repositorio contiene únicamente las partes entrenables del sistema: el encoder de pitch, las capas de cross-attention de pitch, la proyección de timbre, las capas AdaLN y un encoder de audio LAION-CLAP afinado, con unos 420 millones de parámetros y 1,7 GB de pesos.

El modelo resuelve el problema de cambiar el timbre de una señal musical (por ejemplo, hacer que una melodía suene como otro instrumento) sin necesidad de reentrenar un generador musical completo ni de disponer de pares de audio alineados del instrumento objetivo. Para ello congela un generador musical (Stable Audio 3 Medium) y aprende módulos de control que lo dirigen mediante condicionamiento de pitch y de timbre. Es relevante porque abarata el desarrollo de herramientas de producción musical y de investigación en informática musical: solo hay que entrenar y distribuir los módulos de control, no el generador base.

La información pública es limitada: el repositorio no declara pipeline, idiomas, benchmarks ni datos de entrenamiento, y acumula 0 descargas y 0 likes en el momento de la consulta. Los pesos se liberan con licencia MIT, pero su uso exige obtener por separado el backbone Stable Audio 3 Medium y el checkpoint musical de LAION-CLAP, sujetos a sus propias licencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Módulos de control (encoder de pitch, capas de cross-attention de pitch, proyección de timbre, capas AdaLN) sobre un generador musical congelado de tipo difusión (Stable Audio 3 Medium) más un encoder de audio LAION-CLAP afinado |
| Parámetros totales | ~420 M parámetros entrenables en este repositorio; el backbone congelado no se incluye y su tamaño no se especifica |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de tokens (entrada de audio); no se especifica ninguna ventana temporal máxima |
| Tipos de cuantización | No disponible; los pesos se distribuyen en un único archivo PyTorch de 1,7 GB, coherente con ~420 M parámetros a 32 bits. No se documentan versiones fp16, int8 ni GGUF |
| Idiomas soportados | No aplica (modelo de audio sin interfaz de texto); no se declaran idiomas en el repositorio |
| Licencia | MIT para los pesos de este repositorio; el backbone Stable Audio 3 Medium se rige por su propia licencia |
| Formato de pesos | PyTorch (`.pt`, archivo `musetimbre_v1.pt`); no se ofrecen safetensors, GGUF ni ONNX |

## Arquitectura y entrenamiento

El sistema sigue un esquema de control sobre modelo congelado. El generador musical base (Stable Audio 3 Medium) permanece congelado y no se distribuye; lo que se entrena son módulos que lo condicionan: un encoder de pitch, capas de cross-attention de pitch, una proyección de timbre y capas AdaLN (adaptive layer normalization). Además, se afina un encoder de audio LAION-CLAP, lo que sugiere que el timbre objetivo se representa mediante embeddings de audio y que el condicionamiento se inyecta en el generador a través de AdaLN y de la atención cruzada sobre el pitch. El repositorio etiqueta el modelo con la categoría `diffusion`, coherente con la familia de generadores musicales sobre la que se construye.

No se proporcionan datos sobre el volumen de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre el procedimiento exacto de ajuste de los módulos de control. El peso del archivo (1,7 GB para ~420 M parámetros) indica que los pesos distribuidos están en precisión de 32 bits. La innovación declarada es la transferencia de timbre zero-shot controlando un generador musical congelado, lo que evita entrenar el generador completo y reduce el coste de adaptación a nuevos timbres.

## Capacidades

- Transferencia de timbre zero-shot: aplicar el timbre de una referencia a una señal musical sin reentrenar el generador base.
- Control de pitch explícito mediante encoder de pitch y capas de cross-attention, lo que permite preservar la estructura melódica al cambiar el timbre.
- Condicionamiento por timbre a partir de representaciones de audio (encoder LAION-CLAP afinado), en lugar de depender únicamente de etiquetas textuales.
- Generación de audio musical condicionada por los módulos de control sobre un generador congelado (Stable Audio 3 Medium), con inyección de condiciones vía AdaLN.
- No dispone de tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües declaradas; no hay interfaz de texto ni de voz.
- No se documentan capacidades de visión, audio-texto, transcripción ni separación de fuentes.

## Casos de uso

- Producción musical: cambiar el timbre de una pista ya grabada o programada por otro instrumento manteniendo la interpretación original, útil para explorar arreglos sin volver a grabar.
- Creación de librerías de samples: generar variantes tímbricas de un mismo material melódico para alimentar bancos de sonido con coherencia de pitch.
- Maquetas y preproducción: sustituir provisionalmente un instrumento por otro (por ejemplo, un sintetizador por una cuerda) antes de contratar músicos, gracias al enfoque zero-shot que no exige muestras del instrumento objetivo.
- Herramientas para desarrolladores de plugins: integrar los módulos de control en un plugin de audio (VST/AU) mediante PyTorch, cargando el backbone congelado por separado en el entorno del usuario.
- Post-producción audiovisual y videojuegos: adaptar el timbre de una banda sonora a la estética requerida por una escena o por un motor de audio interactivo.
- Investigación en informática musical (MIR): estudiar la percepción del timbre y evaluar estrategias de condicionamiento con generadores congelados, usando los módulos entrenables como objeto de análisis.
- Docencia y divulgación: demostrar de forma audible la diferencia entre pitch y timbre transformando una misma melodía con distintas referencias.
- Reestilizado de grabaciones: aplicar el timbre de un instrumento de referencia a una interpretación existente como paso de post-producción, siempre que la calidad del resultado se valide caso por caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas objetivas (por ejemplo, distancia de timbre, FAD o evaluaciones subjetivas MOS) ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- Pesos entrenables: 1,7 GB en disco, coherente con ~420 M parámetros a 32 bits.
- El backbone congelado Stable Audio 3 Medium y el checkpoint musical de LAION-CLAP deben descargarse por separado; su tamaño y, por tanto, el consumo total de memoria no se especifican en la información disponible.
- VRAM estimada para inferencia: no disponible. Como referencia orientativa no confirmada por los autores, un generador musical de tamaño medio junto con 420 M de módulos de control suele situarse en el orden de 8 a 16 GB en fp16, pero esta cifra es una estimación y depende por completo del backbone.
- GPU recomendadas: no se especifican. Para el orden de magnitud anterior serían razonables tarjetas con 12-16 GB o más (RTX 4080/4090, A100, H100) si se quiere margen para el backbone; no hay confirmación oficial.
- Viabilidad en GPU de consumo: probable en tarjetas con suficiente VRAM una vez cargado el backbone, aunque no está confirmado por el autor. La descarga inicial añade varios GB adicionales al repositorio de 1,7 GB.
- Opciones de despliegue: el repositorio indica un script de inferencia en PyTorch que descarga el archivo automáticamente en el primer uso. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni Diffusers, herramientas por otra parte no aplicables directamente a este flujo de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables en la información proporcionada. La tabla recoge el propio modelo y las categorías de alternativas, marcando como no disponible todo aquello que no consta.

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| barry-mir/muse-timbre (MuseTimbre) | ~420 M entrenables, más backbone congelado no incluido | Módulos de control de pitch y timbre sobre generador musical congelado | MIT (pesos del repositorio); licencia aparte para el backbone | HuggingFace, 0 descargas, 0 likes, 1,7 GB |
| Alternativas de transferencia de timbre (familias DDSP, RAVE y similares) | No disponible | No disponible | No disponible | No disponible |
| Generadores musicales con backbone congelado (familia Stable Audio) | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la búsqueda web resultados que permitan establecer comparaciones numéricas con MuseTimbre.

## Limitaciones y advertencias

- Los pesos distribuidos son solo una parte del sistema: sin el backbone Stable Audio 3 Medium y el checkpoint de LAION-CLAP el modelo no es funcional, y ambos se obtienen por separado.
- Licencia del backbone: aunque los pesos de este repositorio son MIT, Stable Audio 3 Medium tiene su propia licencia, que puede imponer condiciones o restricciones adicionales al uso comercial. Es imprescindible revisarla antes de un despliegue en producción.
- Ausencia de benchmarks: no hay métricas objetivas ni evaluaciones subjetivas publicadas, por lo que la calidad del timbre transferido no puede contrastarse con datos.
- Validación comunitaria nula: 0 descargas y 0 likes, sin pipeline declarado en HuggingFace, lo que dificulta verificar la reproducibilidad.
- Falta de documentación de entrenamiento: no se especifican dataset, número de tokens, ni si hubo ajuste por preferencias, lo que limita el análisis de sesgos.
- Sesgos potenciales no cuantificados: al depender de LAION-CLAP y de Stable Audio 3 Medium, el comportamiento heredará los sesgos de distribución de esos checkpoints preentrenados (por ejemplo, infrarrepresentación de instrumentos o tradiciones musicales no occidentales), pero no hay mediciones disponibles.
- Riesgo de artefactos: como todo sistema generativo de audio, puede producir artefactos o inconsistencias tímbricas; no se documenta ningún mecanismo de control de calidad ni umbral de confianza.
- Sin cuantizaciones publicadas: no hay versiones GGUF, int8 ni fp16 optimizadas, lo que encarece el despliegue en hardware limitado.
- Idiomas y contexto: no aplica la noción de idioma ni de ventana de contexto de tokens; no se especifica ninguna duración máxima de audio soportada.
- Metadatos del repositorio: las fechas de creación y actualización registradas (2026) no coinciden con la fecha habitual de consulta; conviene verificarlas antes de citarlas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/barry-mir/muse-timbre
- Código y guía de uso: https://github.com/barry-mir/muse-timbre
- Ejemplos de audio: https://barry-mir.github.io/muse-timbre-demo/
- Paper: no disponible en la información proporcionada; el título del trabajo es "MuseTimbre: Zero-Shot Timbre Transfer by Controlling a Frozen Music Generator" (Yuan-Chiao Cheng, Georgia Institute of Technology; Zhiyao Duan, University of Rochester).
- Backbone requerido: Stable Audio 3 Medium (Stability AI); no se proporciona enlace en la model card.
- Checkpoint musical de LAION-CLAP: no se proporciona enlace en la model card.
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos corresponden a entidades no relacionadas (Cacao Barry, Barry's, la serie de televisión Barry, un PDF sobre descripción tonal de señales de audio y el repositorio genérico audio-development-tools de Yuan-ManX), por lo que no se incluyen como fuentes.
