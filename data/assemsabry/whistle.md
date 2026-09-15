# assemsabry/whistle

## Resumen

Whistle es un proyecto de modelo de análisis de vídeo de fútbol anónimo, desarrollado por Assem Sabry (https://assem.one/). Según la model card publicada en HuggingFace, su alcance declarado se limita al análisis de vídeo de partidos de fútbol sin identificar nombres de jugadores, posiciones, dorsales ni valoraciones individuales. Se trata, por tanto, de una herramienta orientada a extraer información agregada o anónima a partir de metraje de fútbol, no a la identificación de personas concretas.

En el momento de redactar esta ficha, el repositorio de HuggingFace (assemsabry/whistle) no contiene pesos: el tamaño declarado es de 0,0 GB, no registra descargas ni likes y no tiene pipeline, licencia ni idiomas asociados. La propia model card indica que los checkpoints se irán añadiendo "tras la validación" y que el código fuente, el código de entrenamiento, las herramientas de datos, los tests, la documentación y los registros de procedencia se mantienen en un repositorio de GitHub independiente.

No hay información pública disponible sobre arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni proceso de alineación. Por tanto, esta ficha refleja principalmente el estado del proyecto (anuncio sin artefactos publicados) y el alcance funcional declarado, y marca como "no disponible" todo aquello que el autor no ha especificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se han publicado pesos) |

Otros datos del repositorio: identificador `assemsabry/whistle`, autor `assemsabry`, etiqueta `region:us`, 0 descargas, 0 likes, sin pipeline declarado, repositorio de 0,0 GB, creado el 14 de septiembre de 2026 y actualizado el 15 de septiembre de 2026.

## Arquitectura y entrenamiento

No disponible. La información proporcionada no incluye ningún detalle sobre la arquitectura del modelo (transformer, visión, híbrida, etc.), el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF, DPO o similares. La model card únicamente menciona que los pesos han sido "desarrollados y entrenados por Assem Sabry" y que el código de entrenamiento y las herramientas de datos residen en el repositorio de GitHub, sin especificar contenidos.

El único elemento técnico concreto que se puede afirmar es el alcance funcional declarado: análisis de vídeo de fútbol anónimo. No se especifica si se trata de un modelo de visión por computador, un sistema multimodal o un pipeline que combine detección, seguimiento y clasificación. Cualquier afirmación adicional sobre su funcionamiento interno sería especulativa.

## Capacidades

- Análisis de vídeo de fútbol: es la única capacidad declarada explícitamente en la model card.
- Anonimato por diseño: el alcance excluye la identificación de nombres de jugadores, posiciones, dorsales y valoraciones.
- Generación de texto: no disponible.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo pensamiento, visión, audio): no disponible; aunque el alcance implica procesamiento de vídeo, no se detalla el tipo de salida ni si hay componentes de lenguaje.

## Casos de uso

Los siguientes escenarios son aplicaciones potenciales que encajan con el alcance declarado (análisis de vídeo de fútbol anónimo). Ninguno está confirmado por el autor ni validado con pesos publicados, por lo que deben tratarse como hipótesis de uso pendientes de verificación.

- Análisis táctico agregado: extraer patrones colectivos (bloques defensivos, transiciones, ocupación de espacios) a partir de metraje de partido sin asociar la información a jugadores identificables, lo que facilita compartir resultados sin problemas de privacidad.
- Elaboración de informes de partido para medios o clubes: generar descripciones y estadísticas anónimas que resuman el desarrollo del encuentro.
- Etiquetado automático de clips: segmentar el vídeo por fases de juego o eventos para su posterior revisión por analistas.
- Análisis de rendimiento colectivo en categorías base: al no identificar individuos, reduce las objeciones relacionadas con datos personales de menores.
- Herramientas de formación para entrenadores: revisión asistida de situaciones de juego con foco en el comportamiento del equipo, no del individuo.
- Investigación académica en visión por computador aplicada al deporte: uso como componente de anonimización o análisis en estudios que requieran evitar el reconocimiento facial o de identidad.
- Retransmisión o postproducción: generación de metadatos anónimos para indexar contenido deportivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no hay pesos publicados ni datos de tamaño que permitan estimarla.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.): no disponible.
- Latencia y throughput: no disponible.

Sin checkpoints publicados y sin especificaciones de arquitectura, no es posible ofrecer ninguna estimación fundamentada de recursos.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica la categoría técnica exacta del modelo (visión, multimodal, vídeo), su tamaño ni su tarea concreta, por lo que no es posible establecer comparaciones rigurosas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Repositorio sin pesos: el tamaño es de 0,0 GB y la model card indica que los checkpoints se publicarán "tras la validación", por lo que hoy no es un modelo utilizable.
- Ausencia de licencia: no se declara licencia alguna, lo que impide determinar si el uso comercial está permitido. A efectos prácticos, no debe asumirse permiso de uso.
- Sin pipeline declarado: no se especifica la tarea de HuggingFace asociada, lo que dificulta la integración automática.
- Alcance restringido: el modelo no identifica jugadores, posiciones, dorsales ni emite valoraciones; intentar usarlo para esos fines queda fuera de su ámbito declarado.
- Idiomas no especificados: se desconoce si produce salidas en texto y en qué lenguas.
- Riesgo de alucinación: no evaluable sin pesos ni documentación técnica.
- Sesgos: no evaluables con la información disponible; en análisis de vídeo deportivo son relevantes los sesgos por condiciones de iluminación, calidad de grabación, tipo de cámara y contexto de liga.
- Trazabilidad: el autor remite a un repositorio de GitHub para código, datos y procedencia, pero no se aportan checksums ni contratos de entrada/salida en esta página.
- Nota sobre la búsqueda web: los resultados recuperados en la búsqueda no guardan relación con el modelo (corresponden a establecimientos de restauración y portales de facturación), por lo que no aportan información verificable.

## Enlaces

- HuggingFace: https://huggingface.co/assemsabry/whistle
- Repositorio GitHub: https://github.com/assemsabry/whistle
- Sitio del autor: https://assem.one/
- Paper: no disponible
- Blog o anuncio oficial: no disponible
- Demo: no disponible
