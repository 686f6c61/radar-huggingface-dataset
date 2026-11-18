# Lightricks/LTX-2.5-22b-IC-LoRA-Restore

## Resumen

LTX-2.5-22b-IC-LoRA-Restore es un adaptador LoRA de tipo IC-LoRA (in-context LoRA) desarrollado por Lightricks para la restauración de vídeo mediante video-to-video. Se publica como un módulo de 1,7 GB que se aplica sobre el modelo base Lightricks/LTX-2.3, del que hereda la arquitectura y la mayor parte de los pesos, y forma parte de la familia LTX-2.5 de modelos de generación y edición de vídeo. Su función específica es restaurar metraje degradado (archivo histórico, material de bajo bitrate o con ruido) y, según las etiquetas del repositorio, también colorizar material en blanco y negro.

El interés actual del adaptador radica en que aborda una tarea de posproducción muy costosa en VFX y preservación audiovisual sin necesidad de reentrenar un modelo completo: basta con cargar el LoRA sobre LTX-2.3 dentro de la librería `ltx`. El repositorio acumula más de 13.000 descargas y 91 likes desde su publicación en septiembre de 2026, lo que indica una adopción temprana significativa en flujos de restauración de vídeo.

La información pública disponible es limitada: no se han publicado fichas técnicas con número de parámetros del adaptador, composición del dataset de entrenamiento ni resultados de benchmarks. El acceso está restringido (gated) y requiere aceptar la licencia comunitaria LTX-2.x en Hugging Face antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (IC-LoRA) sobre el modelo de vídeo LTX-2.3; arquitectura del base no detallada en la información disponible |
| Parametros totales | no disponible (repo de 1,7 GB; pesos del adaptador, no del modelo completo) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | ltx-2.x-community-license (acceso restringido, requiere aceptación) |
| Formato de pesos | no disponible (repo de 1,7 GB; compatible con la librería `ltx`) |

## Arquitectura y entrenamiento

El adaptador es un IC-LoRA, es decir, un LoRA de bajo rango pensado para condicionamiento in-context sobre un modelo de difusión de vídeo. Se aplica sobre Lightricks/LTX-2.3 y se ejecuta mediante la librería `ltx`, que gestiona la carga del base y del adaptador. El pipeline declarado en Hugging Face es video-to-video: la entrada es una secuencia de vídeo y la salida es la misma secuencia restaurada, presumiblemente manteniendo la estructura temporal y el movimiento originales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (tipos de degradación, resolución, duración de clips), el uso de RLHF/DPO ni innovaciones técnicas concretas del adaptador. Las etiquetas del repositorio indican que el trabajo se orienta a restauración, colorización y metraje de archivo, además de VFX, pero no se detallan los procedimientos de entrenamiento ni las funciones de pérdida empleadas.

## Capacidades

- Restauración de vídeo degradado: eliminación de ruido, artefactos de compresión y pérdida de detalle en metraje de archivo o de baja calidad.
- Colorización de material en blanco y negro, según las etiquetas del repositorio (`colorization`, `archive-footage`).
- Traducción vídeo-a-vídeo con preservación de la estructura temporal, al operar sobre el modelo base LTX-2.3.
- Integración en flujos de posproducción VFX mediante la librería `ltx`.
- Condicionamiento in-context: el adaptador modifica el comportamiento del base sin sustituirlo, lo que permite combinarlo con el pipeline estándar de LTX.
- Soporte de idioma limitado al inglés en la metadata del repositorio.
- No se ha documentado soporte de tool calling, function calling, agentes ni modos de razonamiento multi-paso; no aplica a un modelo de restauración de vídeo.

## Casos de uso

- Restauración de archivo audiovisual: digitalización y limpieza de metraje histórico degradado para fondos de archivo, televisiones y filmotecas, usando el pipeline video-to-video sobre clips existentes.
- Colorización de cine en blanco y negro: aplicación del adaptador para generar versiones colorizadas de material monocromo, útil en remasterizaciones y ediciones de catálogo.
- Limpieza de material de bajo bitrate: recuperación de vídeo comprimido de forma agresiva (streams, grabaciones antiguas) antes de su reutilización en montaje.
- Posproducción VFX: restauración de planos de referencia o de placas de fondo deterioradas antes de integrarlas en un compuesto, manteniendo la coherencia temporal que exige el pipeline de vídeo.
- Remasterización para distribución: mejora de material de origen para su reempaquetado en plataformas de streaming, con el adaptador cargado sobre LTX-2.3 en la librería `ltx`.
- Investigación en restauración de vídeo: uso del IC-LoRA como punto de partida o referencia para experimentos de video-to-video con condicionamiento in-context, dado su carácter de adaptador ligero (1,7 GB) sobre un base público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador ocupa 1,7 GB, pero la inferencia requiere cargar además el modelo base LTX-2.3, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende de los requisitos del modelo base LTX-2.3.
- Opciones de despliegue: librería `ltx` (declarada en el repositorio). No se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un pipeline de difusión de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| LTX-2.5-22b-IC-LoRA-Restore | IC-LoRA | LTX-2.3 | Restauración y colorización de vídeo | ltx-2.x-community-license | Gated |
| LTX-2.5-22b-LoRA-Slow-Motion-Control | LoRA | LTX-2.x | Control de cámara lenta | no disponible | no disponible |
| LTX-2.5-22b-LoRA-Cinemagraph | LoRA | LTX-2.x | Efecto cinemagraph | no disponible | no disponible |

Los adaptadores de la familia LTX-2.5 comparten base y licencia, pero cubren tareas distintas (control de movimiento, cinemagraph, restauración). No se dispone de datos de rendimiento comparativo entre ellos ni frente a soluciones de restauración de vídeo de otros proveedores.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar la licencia ltx-2.x-community-license en Hugging Face antes de descargar los pesos.
- Licencia comunitaria con posibles restricciones de uso comercial; conviene revisar los términos completos antes de integrarlo en producción.
- Solo se declara soporte de inglés en la metadata; el comportamiento con otros idiomas en prompts o metadatos no está documentado.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede introducir detalles inexistentes en la restauración o en la colorización, especialmente en rostros, texto y objetos pequeños.
- No hay información publicada sobre sesgos, dataset de entrenamiento ni evaluación de fidelidad, lo que dificulta auditar su comportamiento en material sensible.
- Dependencia del modelo base LTX-2.3: los requisitos de hardware, la longitud de contexto y el rendimiento real vienen determinados por el base, no por el adaptador.
- Ausencia de benchmarks: no es posible comparar su calidad de restauración con alternativas de forma objetiva con la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Restore
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Organización Lightricks en Hugging Face: https://huggingface.co/Lightricks
- Sitio corporativo de Lightricks: https://www.lightricks.com/
- Sobre Lightricks: https://www.lightricks.com/about
- GitHub de Lightricks: https://github.com/Lightricks
- Wikipedia: https://en.m.wikipedia.org/wiki/Lightricks
