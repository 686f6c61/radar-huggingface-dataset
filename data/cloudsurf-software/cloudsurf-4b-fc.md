# cloudsurf-software/CloudSurf-4B-FC

## Resumen

CloudSurf-4B-FC es un modelo de lenguaje especializado en function calling y tool use, desarrollado por CloudSurf Software sobre la base de Google Gemma-4 E4B (effective-4B). El modelo tiene aproximadamente 8.000 millones de parámetros totales, de los cuales unos 4.000 millones son activos, y ha sido afinado mediante QLoRA para mejorar significativamente su capacidad de invocar herramientas y gestionar flujos agénticos. Su principal valor radica en que, con un tamaño reducido, supera en el benchmark BFCL V4 FULL a modelos mucho más grandes como gpt-oss-20b, lo que lo convierte en una opción atractiva para despliegues eficientes en entornos de producción.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y está pensado para integrarse en sistemas de agentes, asistentes conversacionales y pipelines de automatización. Su ventana de contexto alcanza los 131.000 tokens, lo que facilita tareas de investigación multi-paso y manejo de conversaciones largas. Aunque el modelo base es multimodal (Gemma-4), este ajuste se centra exclusivamente en texto y generación de llamadas a funciones.

La relevancia actual de CloudSurf-4B-FC reside en la creciente demanda de modelos pequeños y eficientes capaces de ejecutar razonamiento agéntico con herramientas externas, sin depender de infraestructura de alto coste. Su rendimiento en BFCL, con una puntuación media de 55.73 frente a 34.81 del modelo base, demuestra que un ajuste específico y bien diseñado puede equiparar o superar a alternativas mucho más grandes en tareas de tool use.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma-4 E4B (no se especifican detalles adicionales) |
| Parametros totales | 7.941.100.874 (~8.0B) |
| Parametros activos | ~4B (efectivos, según convencion E4B) |
| Longitud de contexto | 131.072 tokens (mencionado en el README como "131K context window") |
| Tipos de cuantizacion | BF16 (checkpoint fusionado), QLoRA nf4 (adaptadores) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint fusionado), adaptadores PEFT |

## Arquitectura y entrenamiento

CloudSurf-4B-FC parte del modelo base Google Gemma-4 E4B-it, una variante de la familia Gemma-4 que emplea una arquitectura de activación parcial (effective-4B) con aproximadamente 8.000 millones de parámetros totales. El ajuste se realizó mediante QLoRA con cuantización nf4, utilizando un rango de LoRA de 8 y alpha de 16, aplicado a las siete proyecciones lineales del transformer. El entrenamiento consistió en 686 pasos sobre 34.926 ejemplos por turno (aproximadamente 0.16 épocas), con pérdida únicamente sobre las respuestas del asistente.

El conjunto de datos de entrenamiento, denominado fc-tier1, contiene 2.747 filas y no se ha publicado. Está compuesto por trayectorias de profesor generadas con gpt-oss-120b en entornos de observación parcial (look-then-act), conversaciones con disciplina de memoria y ejemplos de rechazo de irrelevancia. El razonamiento del profesor se conserva en el canal de pensamiento. La técnica clave es la **terminación supervisada de tramos** (supervised span termination): cada ejemplo de entrenamiento corresponde a un turno del asistente, con el historial byte-exacto al handler de servicio, y cada tramo supervisado termina con un token de parada específico (`<turn|>`). Esto reduce los artefactos de decodificación y mejora la estabilidad en la generación de llamadas a herramientas.

## Capacidades

- Generación de llamadas a funciones (function calling) con formato estructurado, compatible con el estándar BFCL.
- Uso de herramientas en flujos agénticos multi-paso, con razonamiento encadenado y observación parcial del entorno.
- Manejo de conversaciones multi-turno con memoria de contexto, manteniendo coherencia en diálogos largos.
- Rechazo de solicitudes irrelevantes o fuera del ámbito definido (irrelevance refusal).
- Capacidad de ejecutar tareas de investigación web con múltiples saltos, aunque con limitaciones de contexto (ver limitaciones).
- Soporte de razonamiento en el canal de pensamiento (thinking mode) antes de emitir la llamada a herramienta.
- Multilingüe limitado: el modelo está entrenado principalmente en inglés, sin evidencia de buen rendimiento en otros idiomas.

## Casos de uso

- **Asistentes de atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con clientes, consultar bases de conocimiento o APIs de CRM mediante tool calling, y resolver incidencias sin intervención humana. Su ventana de 131K tokens permite manejar historiales largos de interacción.
- **Agentes autónomos de automatización web**: gracias a su capacidad de razonamiento multi-paso y observación parcial, puede navegar por páginas, rellenar formularios y extraer datos, similar a un asistente de navegación. Es adecuado para tareas repetitivas de 1-5 minutos.
- **Integración en pipelines de CI/CD**: el modelo puede invocar herramientas de línea de comandos, ejecutar scripts de despliegue o gestionar incidencias en repositorios mediante function calling, integrándose en flujos de DevOps.
- **Asistentes de productividad personal**: puede conectar con calendarios, correos electrónicos y gestores de tareas a través de APIs, programando reuniones, enviando recordatorios o organizando información.
- **Investigación y análisis de datos**: con acceso a herramientas de búsqueda y bases de datos, el modelo puede realizar consultas complejas, resumir resultados y generar informes estructurados, aprovechando su contexto largo para procesar múltiples fuentes.
- **Simulación de agentes en entornos de prueba**: al estar entrenado con trayectorias de look-then-act, es útil para probar entornos de agentes sintéticos, validar políticas de decisión o generar datos de entrenamiento para otros modelos.

## Benchmarks y rendimiento

El modelo presenta resultados del benchmark BFCL V4 FULL (22/22 categorías, modo prompt, thinking activado, temperatura 0.001). Los datos provienen de ejecuciones propias del autor, con tres semillas (42, 7, 11) y una media de 55.73. Se comparan con el modelo base sin ajustar y con otras referencias.

| Modelo | Overall | Non-Live | Live | Multi-Turn | Web | Memory | Irrelevance |
|---|---:|---:|---:|---:|---:|---:|---:|
| **CloudSurf-4B-FC** (media 3 semillas) | **55.73** | 87.23 | 79.82 | 43.46 | 48.00 | 41.65 | 80.63 |
| Stock gemma-4-E4B-it (media 3 semillas) | 34.81 | 84.30 | 73.97 | 19.46 | 7.00 | 16.56 | 84.37 |
| Nanbeige4-3B (publicado) | 51.40 | - | - | - | - | - | - |
| gpt-oss-20b (medido en el mismo rig) | 49.09 | - | - | - | - | - | - |

Notas: el valor de Web (48.00) se considera un suelo, ya que aproximadamente el 9% de las entradas web sin snippet desbordan la ventana de contexto de 131K y puntúan 0. El rendimiento en Memory es competencia entrenada en el espacio de nombres de la API del entorno, no transferencia zero-shot. Además, la sensibilidad al formato (Format Sensitivity) regresa: el modelo es muy dependiente de la plantilla de servicio registrada, con un delta máximo de 45-81 frente a ~10 del modelo base.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la documentación disponible. A partir del tamaño del modelo (~8B total, ~4B activos) y del formato de pesos (BF16), se pueden hacer las siguientes estimaciones orientativas:

- **VRAM estimada para inferencia**: en BF16, el checkpoint fusionado ocupa aproximadamente 16 GB (el tamaño del repositorio es 16.1 GB). Para inferencia con contexto largo (131K), se recomienda al menos 24 GB de VRAM, aunque con cuantización adicional podría reducirse.
- **GPU recomendadas**: tarjetas con 24 GB o más, como RTX 3090/4090, A100 (40 GB) o H100. Para despliegues en producción, A100 o H100 ofrecen mayor throughput.
- **Compatibilidad con GPU de consumo**: sí, una RTX 4090 (24 GB) puede ejecutar el modelo en BF16, pero con limitaciones de longitud de contexto y batch. Con cuantización a 8 bits o 4 bits (no publicada oficialmente) cabría en GPUs de 12-16 GB.
- **Opciones de despliegue**: al ser un modelo de la familia transformers, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (tras conversión). El autor no ha publicado archivos GGUF, por lo que habría que convertirlos.
- **Latencia y throughput**: no se han publicado datos. Se estima que, por su tamaño efectivo de 4B, la generación es más rápida que modelos de 8B completos, pero no hay cifras confirmadas.

## Comparativa con modelos similares

La comparativa se centra en el modelo base (stock gemma-4-E4B-it) y en alternativas de la misma categoría (modelos pequeños especializados en function calling). Se usan datos del README del autor.

| Modelo | Params totales | Params activos | Contexto | BFCL V4 Overall | Licencia |
|---|---|---|---|---|---|
| **CloudSurf-4B-FC** | ~8.0B | ~4B | 131K | 55.73 | Apache 2.0 |
| Stock gemma-4-E4B-it | ~8.0B | ~4B | 131K | 34.81 | Apache 2.0 |
| Nanbeige4-3B | ~3B (estimado) | - | - | 51.40 (publicado) | - |
| gpt-oss-20b | 20B | - | - | 49.09 (medido) | - |

CloudSurf-4B-FC supera claramente a su modelo base y se sitúa por encima de alternativas como Nanbeige4-3B y gpt-oss-20b en el benchmark BFCL, a pesar de tener menos parámetros activos que este último. No se dispone de datos de otros benchmarks (MMLU, HumanEval, etc.) en la información proporcionada.

## Limitaciones y advertencias

- **Sensibilidad al formato**: el modelo es muy dependiente de la plantilla de servicio registrada. Cambios en el formato de las llamadas a herramientas pueden degradar drásticamente el rendimiento (Format Sensitivity delta de 45-81 frente a ~10 del modelo base).
- **Rendimiento web limitado**: en tareas de investigación web con múltiples saltos, aproximadamente el 9% de las consultas desbordan la ventana de contexto de 131K y puntúan 0. El rendimiento real en web podría ser ligeramente superior al reportado (suelo de 48.00).
- **Competencia en memoria no transferible**: la mejora en tareas de memoria se debe al alineamiento del espacio de nombres de la API del entorno de entrenamiento, no a una capacidad general de transferencia zero-shot a nuevas APIs.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar llamadas a funciones incorrectas o inventar respuestas cuando no hay suficiente información. No se han realizado evaluaciones específicas de alucinación.
- **Idioma**: solo se ha entrenado y evaluado en inglés. El rendimiento en otros idiomas no está garantizado.
- **Datos de entrenamiento no publicados**: el conjunto de datos fc-tier1 es propietario y no se ha liberado, lo que dificulta la reproducibilidad completa del entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el modelo base (Gemma-4) tiene sus propias condiciones de uso que deben verificarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cloudsurf-software/CloudSurf-4B-FC
- Sitio web de CloudSurf Software: https://cloudsurfsoftware.com/
- Sitio web alternativo: https://www.cloudsurf.cc/
- Organización GitHub: https://github.com/cloudsurf-software
- Repositorio de CloudSurf (asistente de navegación): https://github.com/cloudsurf-ai/cloudsurf
