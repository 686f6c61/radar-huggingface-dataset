# mindsoulBCI/mindsoul-ssvep

## Resumen

MindSoul Neural AI · SSVEP es un proyecto de modelo de investigación para el análisis de señales EEG en paradigmas de potenciales evocados visuales de estado estacionario (SSVEP), desarrollado por mindsoulBCI (Chengdu/Shanghai Brain Cloud Matrix Technology Co., Ltd., según la model card). El repositorio se publica como anuncio de un modelo futuro: no contiene pesos, código de entrenamiento ni resultados de evaluación. La model card indica explícitamente que la arquitectura definitiva, el protocolo de tarea, las entradas soportadas y las instrucciones de reproducibilidad se documentarán en el momento del lanzamiento.

El objetivo declarado es caracterizar representaciones de frecuencia y temporales de EEG bajo condiciones de estimulación visual controlada, y explorar —de forma planificada— el reconocimiento de objetivos y la interacción cerebro-computador mediante una arquitectura basada en Transformer. No se especifican parámetros, longitud de contexto, tokenizador ni esquema de cuantización, ya que el modelo no está publicado.

Su relevancia actual es limitada desde el punto de vista práctico: se trata de un artefacto de reserva de nombre y anuncio de intenciones, no de un modelo evaluable. Resulta de interés únicamente como señal de seguimiento para investigadores en BCI que trabajen con SSVEP y quieran estar atentos a una futura publicación bajo licencia restrictiva de investigación personal no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (planificada; no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en (según metadatos del repositorio) |
| Licencia | mindsoul-personal-research (licencia `other`, solo investigación personal no comercial) |
| Formato de pesos | no disponible (pesos no publicados) |

## Arquitectura y entrenamiento

La model card describe un modelo "basado en Transformer" para EEG, orientado a estudiar representaciones de frecuencia y temporales bajo estimulación visual SSVEP. No se aporta ningún detalle verificable sobre número de capas, dimensión oculta, mecanismo de atención, tokenización de señales EEG, canales utilizados, frecuencia de muestreo, ventana temporal ni condiciones de calibración. Tampoco se indica el volumen de datos de entrenamiento, la composición del corpus, la procedencia de las grabaciones ni si se emplearon técnicas de ajuste como RLHF o DPO (poco probables en este dominio, pero no confirmados).

El apartado "即将发布内容" (contenido próximo a publicarse) enumera como pendientes la estructura del modelo, los pesos y versiones, el formato de entrada, la adquisición y preprocesado, los ejemplos de inferencia, la configuración de entrenamiento, las dependencias de entorno, la partición de datos a nivel de sujeto, las líneas base, los errores y casos de fallo, así como las fuentes de datos y las autorizaciones de compartición y anonimización. En consecuencia, no existe información técnica verificable sobre entrenamiento ni innovaciones de arquitectura.

## Capacidades

- No se ha publicado ninguna capacidad funcional verificable.
- La model card menciona como objetivo futuro el reconocimiento de objetivos (target identification) en paradigmas SSVEP y la interacción cerebro-computador.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- El soporte multilingüe se limita a los metadatos del repositorio (zh, en); no se especifica si el modelo procesa texto o únicamente señales EEG.
- No se documentan modos especiales (thinking mode, visión, audio) ni capacidades de generación de texto, código o matemáticas.

## Casos de uso

- Seguimiento de investigación en BCI: un grupo que trabaje con SSVEP puede monitorizar el repositorio para evaluar la futura publicación de pesos y protocolo; actualmente no es posible ejecutar ninguna tarea con él.
- Revisión de estado del arte en decodificación SSVEP: útil como referencia de un proyecto anunciado por un equipo comercial chino, para contrastar con literatura académica cuando se publiquen resultados.
- Planificación de experimentos de estimulación visual: la futura documentación prometida (frecuencias de estímulo, canales, tasa de muestreo, ventana temporal, calibración) podría servir de plantilla de protocolo, pero hoy no está disponible.
- Evaluación de licencias para uso institucional: un equipo legal o de transferencia tecnológica puede revisar la licencia `mindsoul-personal-research` antes de considerar cualquier colaboración con el autor.
- Docencia sobre ciclo de vida de modelos: el repositorio ejemplifica un caso de artefacto publicado sin pesos ni evaluación, útil para discutir prácticas de documentación y reproducibilidad en investigación con IA.
- Análisis de ecosistema BCI open source: sirve para inventariar iniciativas industriales en el espacio EEG/BCI y comparar su grado de apertura frente a proyectos académicos con pesos liberados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza un Space de benchmark (`https://huggingface.co/spaces/mindsoulBCI/benchmark`) marcado como "即将发布" (próximamente), sin métricas, sin tasa de transferencia de información (ITR) y sin líneas base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos ni arquitectura publicados).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; al no existir pesos ni formato de artefacto, ninguna de estas herramientas es aplicable por ahora.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| mindsoulBCI/mindsoul-ssvep | no disponible | no disponible | mindsoul-personal-research (uso personal no comercial) | No publicados |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; la model card no cita líneas base ni trabajos de referencia.

## Limitaciones y advertencias

- El repositorio no contiene pesos, código de entrenamiento ni resultados: no es utilizable para inferencia ni para replicar experimentos.
- No se han documentado sesgos; en el dominio EEG son relevantes los sesgos por sujeto, equipo de adquisición y protocolo de estimulación, pero no se aporta información al respecto.
- Riesgo de alucinación no evaluable: no se especifica si el modelo genera texto.
- Limitaciones de contexto e idioma: se desconoce la ventana de entrada; los idiomas declarados (zh, en) son metadatos del repositorio, no una garantía de cobertura funcional.
- La licencia `mindsoul-personal-research` restringe el uso a investigación personal no comercial; cualquier otro uso requiere autorización expresa del equipo, según la model card.
- La propia model card advierte de que el proyecto no está destinado a diagnóstico ni tratamiento médico; cualquier aplicación clínica o de neurotecnología requeriría validación regulatoria independiente.
- Los datos deben someterse a anonimización y verificación de autorización de compartición antes de su publicación; actualmente no se ofrece ningún dato ni cifra de rendimiento.
- El repositorio fue creado y actualizado el 2026-11-01 sin descargas ni interacciones, lo que refleja su carácter de anuncio y no de artefacto consolidado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mindsoulBCI/mindsoul-ssvep
- Space de benchmark (anunciado, sin contenido): https://huggingface.co/spaces/mindsoulBCI/benchmark
- GitHub del proyecto de investigación: https://github.com/pm-kevin-zhang/MindSoul
- GitHub de aplicaciones y materiales espaciales: https://github.com/pm-kevin-zhang/MindSoul-Spatial
- Sitio web oficial: https://MindSoul.cn
- Licencia (referenciada en el repositorio): LICENSE en el propio repositorio de Hugging Face
