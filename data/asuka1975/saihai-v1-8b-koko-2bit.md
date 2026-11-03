# asuka1975/saihai-v1-8b-koko-2bit

## Resumen

saihai-v1-8b-koko-2bit es un modelo de clasificación binaria en japonés derivado por fine-tuning de hotchpotch/saihai-v1-8b y cuantizado a 2 bits en un formato propietario. Lo publica el desarrollador asuka1975 como componente del proyecto koko, una herramienta de código abierto cuyo cometido es decidir si una frase en japonés proviene de un artículo de Wikipedia o de una sesión de Claude Code. No es, por tanto, un modelo generativo de propósito general, sino un clasificador de origen de texto integrado en un pipeline mayor.

El repositorio contiene 2.391.027.712 parámetros en safetensors y ocupa 5,3 GB, si bien los pesos se almacenan en un formato propio que combina GPTQ de 2 bits con una cabeza de dos filas. Esta decisión de diseño implica que el modelo no se puede cargar con `transformers` mediante `from_pretrained`: solo el script `setup` de koko descarga los pesos y los carga a través de `kokomodel.py`. La licencia es Apache 2.0 y el único idioma declarado es el japonés.

Su relevancia es acotada y muy específica: sirve como ejemplo de cuantización extrema (2 bits) aplicada a una tarea de clasificación, y como pieza de infraestructura dentro de koko. Para cualquier uso fuera de ese proyecto, la ficha debe leerse con cautela porque la información publicada es mínima y el modelo no está pensado para inferencia convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de un transformer; la model card no detalla la arquitectura interna) |
| Parametros totales | 2.391.027.712 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits en formato propietario de koko (GPTQ de 2 bits más una cabeza de dos filas); el tag del repo indica además "8-bit" sin más detalle |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con esquema propio de koko; no cargable con `transformers` estándar |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base hotchpotch/saihai-v1-8b ni detalla el proceso de entrenamiento. Lo único documentado es que se trata de un fine-tuning de ese modelo para una tarea de clasificación binaria: determinar si una frase en japonés procede de Wikipedia o de una sesión de Claude Code. El resultado se cuantiza a 2 bits mediante GPTQ y se le añade una cabeza de dos filas específica del proyecto koko.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; tampoco se documentan innovaciones técnicas más allá de la cuantización extrema y del formato de pesos cerrado que impide su uso fuera de koko. La información sobre el origen de los datos y los detalles de entrenamiento se remite a NOTICE.md, que no está incluido en la información disponible.

## Capacidades

- Clasificación binaria de origen de texto en japonés: distingue entre frases procedentes de Wikipedia y frases procedentes de sesiones de Claude Code.
- Integración exclusiva con el proyecto koko: los pesos solo se cargan mediante `kokomodel.py` tras ejecutar `setup`.
- No se documenta generación de texto, razonamiento general, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta capacidad de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe: el único idioma declarado es el japonés.
- No se documenta ningún modo especial (thinking mode, visión, audio).

## Casos de uso

- Filtrado de corpus en japonés dentro de koko: el modelo decide si una frase candidata proviene de Wikipedia o de una sesión de Claude Code, lo que permite separar fuentes en la construcción de datasets.
- Auditoría de procedencia de texto en pipelines de datos japoneses: como clasificador de dos clases, se puede invocar desde koko para etiquetar fragmentos y revisar su origen antes de reutilizarlos.
- Investigación sobre cuantización extrema: sirve como caso de estudio de un modelo de 2,4 mil millones de parámetros comprimido a 2 bits con GPTQ y una cabeza mínima, útil para analizar la degradación de precisión en clasificación.
- Integración en herramientas de desarrollo asistido: dentro de koko, contribuye a distinguir salidas generadas por Claude Code de contenido enciclopédico, lo que puede alimentar controles de calidad en flujos de trabajo con agentes.
- Prototipado de clasificadores ligeros en japonés: el tamaño del repo (5,3 GB) y la cuantización a 2 bits permiten desplegar el modelo en entornos con recursos limitados, siempre que se use el cargador de koko.
- Docencia y divulgación sobre formatos de pesos no estándar: ejemplifica cómo un formato propietario (GPTQ de 2 bits más cabeza de dos filas) rompe la compatibilidad con `transformers` y obliga a herramientas a medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, F1, latencia ni throughput para la tarea de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo ocupa 5,3 GB, aunque la cuantización a 2 bits sugiere una huella de pesos notablemente menor que la de un modelo de 2,4 mil millones de parámetros en fp16 (que rondaría los 4,8 GB).
- GPU recomendadas: no disponibles en la información proporcionada.
- ¿Cabe en GPU de consumo? No se puede confirmar; el formato propietario y la falta de datos de latencia impiden una recomendación fiable.
- Opciones de despliegue: exclusivamente el cargador de koko (`setup` y `kokomodel.py`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores binarios en japonés empaquetados en formatos propietarios) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo no se puede cargar con `transformers` mediante `from_pretrained`; requiere el script `setup` y `kokomodel.py` del proyecto koko.
- La tarea es extremadamente acotada (clasificación binaria Wikipedia frente a Claude Code) y no se documenta su comportamiento fuera de ese dominio.
- Solo se declara japonés; no hay evidencia de funcionamiento en otros idiomas.
- No se documentan sesgos conocidos, pero un clasificador entrenado sobre dos fuentes concretas puede heredar sesgos de esas fuentes.
- Riesgo de alucinación no aplicable en sentido generativo, aunque sí existe riesgo de clasificaciones erróneas no cuantificadas por falta de métricas.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia del formato propietario de koko limita la portabilidad y obliga a revisar los términos del proyecto.
- El tag "8-bit" del repositorio resulta confuso frente a la descripción de la model card, que indica 2 bits; conviene verificar el formato real antes de cualquier despliegue.
- La información de entrenamiento y dataset se remite a NOTICE.md, no incluido en la documentación disponible, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asuka1975/saihai-v1-8b-koko-2bit
- Modelo base: https://huggingface.co/hotchpotch/saihai-v1-8b
- Repositorio del proyecto koko: https://github.com/asuka1975/koko
