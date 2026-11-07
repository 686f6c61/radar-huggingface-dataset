# quantumaikr/findr-models

## Resumen

findr-models es un paquete de modelos publicado por quantumaikr que da soporte a la aplicación de búsqueda local findr. No se trata de un modelo conversacional de propósito general, sino de una colección de tres componentes especializados que trabajan en conjunto dentro de la aplicación: un módulo de ranking (`rank/`) que reordena archivos candidatos comparándolos con la consulta, un módulo de compuerta (`gate/`) que decide si existe o no un archivo adecuado y estima la probabilidad de coincidencia por candidato, y un módulo de extracción de consulta (`qu/`) que descompone la pregunta en contenido, tiempo, persona y acción realizada.

El repositorio contiene 596.049.920 parámetros en formato safetensors (aproximadamente 0,6 GB), lo que sitúa a los componentes en la escala de cientos de millones de parámetros, coherente con tareas de clasificación y ranking ligeras que deben ejecutarse en el PC del usuario. El modelo declara soporte exclusivo para coreano (`ko`) y licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en el enfoque de privacidad por diseño: todo el procesamiento ocurre localmente en el equipo del usuario, sin llamadas a servicios externos, y el comando `findr setup` descarga automáticamente solo los componentes necesarios. Es un ejemplo de empaquetado de modelos pequeños y especializados para búsqueda semántica local en lugar de un único modelo monolítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el modulo `qu/` se ejecuta en llama.cpp); otras cuantizaciones no disponibles |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de los componentes (transformer, encoder, etc.), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO. Lo que sí se documenta es la división funcional en tres módulos: `rank/` para reordenar candidatos comparándolos con la consulta, `gate/` para determinar la ausencia de coincidencias y puntuar la probabilidad de acierto por candidato, y `qu/` para el análisis estructurado de la consulta en dimensiones de contenido, tiempo, persona y acción.

El módulo `qu/` está diseñado para ejecutarse sobre llama.cpp, lo que implica que dispone de pesos en formato GGUF y puede correr en CPU o GPU con cuantización. El tamaño total del repositorio (0,6 GB) sugiere pesos de precisión reducida o cuantizados, adecuados para inferencia local en hardware de consumo. No se han publicado detalles sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Ranking de archivos candidatos frente a una consulta en lenguaje natural (módulo `rank/`).
- Detección de ausencia de coincidencias: el módulo `gate/` decide cuándo no hay ningún archivo adecuado y calcula la probabilidad de coincidencia por candidato.
- Extracción estructurada de consultas: descomposición en contenido, tiempo, persona y acción realizada (módulo `qu/`).
- Procesamiento íntegramente local, sin dependencia de servicios en la nube.
- Soporte de búsqueda local sobre archivos del usuario en coreano.
- Ejecución en llama.cpp para el componente de análisis de consulta.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, tool calling ni razonamiento multi-paso.

## Casos de uso

- Búsqueda de archivos en el escritorio: el módulo `rank/` reordena los candidatos recuperados por un índice local comparándolos con la consulta, mejorando la precisión del primer resultado en buscadores de archivos personales.
- Filtrado de falsos positivos: el módulo `gate/` evita que la aplicación devuelva resultados irrelevantes cuando ningún archivo coincide, calculando una puntuación de probabilidad por candidato que permite fijar umbrales de confianza.
- Consultas con restricciones temporales: el módulo `qu/` separa la dimensión de tiempo de la consulta (por ejemplo, "el informe del mes pasado"), lo que permite aplicar filtros por fecha antes del ranking.
- Búsqueda por persona o acción: al extraer las dimensiones de persona y acción realizada, la aplicación puede localizar documentos asociados a un interlocutor o a una tarea concreta ("lo que me envió María sobre la reunión").
- Asistentes de escritorio con privacidad estricta: al ejecutarse todo en el PC del usuario, el paquete es adecuado para entornos donde los documentos no pueden salir del equipo (legal, sanidad, administración pública).
- Integración en herramientas de línea de comandos: el comando `findr setup` descarga solo los módulos necesarios, lo que facilita el despliegue en scripts y flujos de automatización locales.
- Aplicaciones de gestión documental en coreano: el soporte nativo del idioma permite indexar y consultar corpus en coreano sin modelos multilingües de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 596 millones de parámetros, la inferencia en FP16 requeriría aproximadamente 1,2 GB de memoria, y en cuantización de 4 bits alrededor de 0,3-0,4 GB, aunque estos cálculos son estimaciones a partir del recuento de parámetros y no cifras publicadas por el autor.
- GPU recomendadas: no disponibles. Por tamaño, el paquete cabe con holgura en GPU de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, según el tamaño de los pesos; no hay requisitos oficiales confirmados.
- Opciones de despliegue: llama.cpp para el módulo `qu/` (documentado); el resto de módulos se integra a través de la aplicación findr. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| findr-models | 596 M (total del paquete) | no disponible | Coreano | Apache-2.0 | Ranking, compuerta y análisis de consulta para búsqueda local |
| BGE-reranker (familia) | ~300 M (variantes) | no disponible en esta ficha | Multilingüe en algunas variantes | MIT en variantes habituales | Reranking de recuperación |
| MiniLM cross-encoder | ~22-118 M | 512 tokens en variantes habituales | Multilingüe en variantes | Apache-2.0 en variantes | Reranking y clasificación de pares |

La comparación con modelos de reranking genéricos es aproximada: findr-models no es un único modelo sino un paquete con tres funciones diferenciadas, y no se dispone de métricas públicas que permitan una comparación cuantitativa rigurosa. Los datos de las alternativas corresponden a especificaciones habituales de sus familias y deben verificarse en cada versión concreta.

## Limitaciones y advertencias

- El soporte de idioma declarado es exclusivamente coreano; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- No es un modelo de propósito general: no genera texto libre, no responde preguntas abiertas ni ejecuta código; su uso está acotado a las tres funciones de búsqueda descritas.
- Al ser un paquete de componentes especializados, su evaluación requiere integrarlo en la aplicación findr o replicar su pipeline; no se puede evaluar de forma aislada con prompts convencionales.
- No se han publicado benchmarks, por lo que no es posible estimar su precisión frente a alternativas de reranking.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Riesgo de alucinación en el módulo `qu/`: al tratarse de un modelo pequeño de extracción, puede producir descomposiciones incorrectas de la consulta en casos ambiguos; no hay datos publicados sobre tasas de error.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el archivo `LICENSE` del repositorio y las dependencias de la aplicación findr para confirmar condiciones.
- No se documentan sesgos conocidos; al estar entrenado para coreano, puede heredar sesgos del corpus de entrenamiento, que no se describe.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/quantumaikr/findr-models
- Repositorio de la aplicación findr: https://github.com/quantumaikr/findr
