# MuScriptor/muscriptor-medium

## Resumen

MuScriptor es un modelo de transcripción musical automática (AMT) multi-instrumento que convierte grabaciones de audio en notación MIDI, identificando las notas tocadas por cada instrumento de forma independiente. Ha sido desarrollado por Kyutai y Mirelo, y se distribuye con pesos abiertos bajo licencia CC BY-NC 4.0 (uso no comercial). Su objetivo es ofrecer una herramienta precisa y flexible para trabajar con música real de diversos géneros, superando las limitaciones de los transcriptores monoinstrumentales o los sistemas cerrados.

El modelo se basa en una arquitectura transformer, tal como indican las etiquetas de HuggingFace, y admite condicionamiento por presencia de instrumentos para personalizar la transcripción según las necesidades del usuario. Aunque no se han publicado detalles técnicos exhaustivos sobre el tamaño de parámetros o la longitud de contexto, su variante "medium" sugiere un equilibrio entre rendimiento y requisitos computacionales. El proyecto incluye código fuente con licencia MIT y una demo gratuita en línea, lo que facilita su evaluación y adopción en entornos de investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de audio, no textual) |
| Licencia | CC BY-NC 4.0 (modelo), MIT (codigo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna más allá de indicar que se trata de un transformer. Se sabe que el modelo procesa audio directamente y genera secuencias de eventos MIDI, probablemente mediante una representación tokenizada de notas, tiempos e instrumentos. El proyecto menciona el uso de condicionamiento por presencia de instrumentos, lo que sugiere que el modelo puede recibir indicaciones sobre qué instrumentos se esperan en la grabación para mejorar la precisión de la transcripción.

En cuanto al entrenamiento, no se han publicado datos sobre el número de tokens, la composición del dataset o el uso de técnicas como RLHF o DPO. La página del proyecto afirma que el modelo funciona en grabaciones de música real de una amplia variedad de géneros, lo que implica un corpus de entrenamiento diverso, pero los detalles específicos no están disponibles.

## Capacidades

- Transcripción multi-instrumento: convierte audio en MIDI identificando notas por instrumento (batería, bajo, piano, guitarra, etc.).
- Condicionamiento por presencia de instrumentos: permite indicar al modelo qué instrumentos están presentes para ajustar la transcripción.
- Manejo de música real: funciona con grabaciones de diversos géneros, no solo con sintetizadores o MIDI generado.
- Salida MIDI estructurada: produce archivos MIDI con pistas separadas por instrumento, listos para edición o reproducción.
- Integración en pipelines de audio: puede usarse como módulo de preprocesamiento para tareas de análisis musical, remezcla o educación.
- Demo interactiva: disponible en línea para probar el modelo sin instalación local.

## Casos de uso

- Producción musical y remezcla: un productor puede transcribir una grabación existente a MIDI para extraer las partes de cada instrumento, editarlas o reemplazarlas con nuevos sonidos. El modelo facilita la separación y manipulación de pistas sin necesidad de stems originales.
- Educación musical: profesores y estudiantes pueden transcribir piezas de audio para analizar armonía, melodía y ritmo, o para crear partituras a partir de grabaciones de referencia.
- Investigación en musicología computacional: los investigadores pueden usar MuScriptor para anotar automáticamente grandes colecciones de audio, acelerando estudios sobre estilo, evolución musical o comparación entre interpretaciones.
- Restauración y archivado de grabaciones históricas: al convertir audio antiguo a MIDI, se pueden preservar y transcribir obras que no tienen partituras, facilitando su estudio y reinterpretación.
- Desarrollo de herramientas de accesibilidad: músicos con discapacidad visual pueden convertir audio a MIDI para leer la música con lectores de pantalla o imprimirla en braille.
- Entrenamiento de modelos de IA musical: las transcripciones generadas pueden servir como datos de entrenamiento para otros sistemas, como generadores de música o asistentes de composición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página del proyecto y el repositorio no incluyen métricas comparativas como MMLU, HumanEval o métricas específicas de transcripción (por ejemplo, precisión de notas, F1 por instrumento). Por tanto, no es posible ofrecer una tabla de rendimiento objetiva en este momento.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware para inferencia.
- Dado que es un transformer de tamaño medio y el formato de pesos es safetensors, es probable que pueda ejecutarse en GPUs de consumo con al menos 8 GB de VRAM, pero no hay confirmación.
- El proyecto ofrece una demo en línea (muscriptor.kyutai.org), lo que permite probar el modelo sin hardware local.
- Para despliegue local, se recomienda consultar el repositorio de GitHub, donde se indica el uso de `uvx muscriptor` para ejecutar el modelo, aunque no se especifican los requisitos mínimos.
- No se conocen opciones de despliegue con vLLM, llama.cpp u otros frameworks, ya que el modelo no es de lenguaje y probablemente requiere un pipeline específico de audio.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa objetiva con otros modelos de transcripción musical. Existen alternativas conocidas como Basic Pitch (Spotify) o MT3 (Google), pero no se han encontrado comparaciones publicadas con MuScriptor en cuanto a precisión, velocidad o cobertura de instrumentos. Por tanto, la comparativa se limita a mencionar su existencia sin datos numéricos.

| Modelo | Tipo | Licencia | Disponibilidad |
|---|---|---|---|
| MuScriptor medium | AMT multi-instrumento | CC BY-NC 4.0 | Pesos abiertos en HF |
| Basic Pitch (Spotify) | AMT monoinstrumento | Apache 2.0 | Código abierto |
| MT3 (Google) | AMT multi-instrumento | Apache 2.0 | Código abierto |

## Limitaciones y advertencias

- Licencia no comercial: el modelo está bajo CC BY-NC 4.0, lo que impide su uso en aplicaciones comerciales o con fines lucrativos. El código fuente es MIT, pero los pesos del modelo tienen restricciones.
- Acceso gated en HuggingFace: para descargar los pesos es necesario aceptar la licencia en la página del modelo y autenticarse con una cuenta gratuita.
- Datos de entrenamiento no divulgados: no se conoce la composición del dataset, por lo que podría haber sesgos hacia ciertos géneros o estilos musicales, afectando la precisión en otros tipos de audio.
- Sin métricas de rendimiento publicadas: no hay benchmarks oficiales que permitan evaluar su calidad frente a otros sistemas, lo que dificulta la decisión de adopción en entornos críticos.
- Potencial de alucinación o errores en la transcripción: como cualquier modelo de AMT, puede producir notas o ritmos incorrectos, especialmente en grabaciones con mezclas densas o efectos de audio complejos.
- Soporte de idiomas no aplicable: al ser un modelo de audio, no tiene capacidades lingüísticas, pero la documentación y la interfaz están en inglés.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/MuScriptor/muscriptor-medium)
- [Repositorio GitHub](https://github.com/muscriptor/muscriptor)
- [Página del proyecto](https://muscriptor.github.io/)
- [Demo interactiva](https://muscriptor.kyutai.org/)
- [Colección de MuScriptor en HuggingFace](https://huggingface.co/collections/kyutai/muscriptor)
