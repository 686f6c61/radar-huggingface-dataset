# EDP-Datty/IA

## Resumen

EDP-Datty/IA es un repositorio de modelo publicado en Hugging Face por el usuario EDP-Datty. La única información verificable disponible es su identificador, su licencia (MIT) y su fecha de creación (11 de septiembre de 2026, según los metadatos de la plataforma). No se ha declarado pipeline, idioma, arquitectura, número de parámetros ni formato de pesos.

La model card asociada contiene exclusivamente la línea `license: mit`, sin descripción, sin instrucciones de uso, sin datos de entrenamiento y sin ejemplos de inferencia. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe evidencia de uso ni de validación por parte de la comunidad.

Por tanto, esta ficha no puede describir qué problema resuelve el modelo, qué arquitectura emplea ni por qué sería relevante. Los apartados que siguen indican explícitamente "no disponible" en todos los campos que no están documentados, y las secciones de capacidades, casos de uso y hardware se limitan a escenarios genéricos condicionados a una validación previa por parte de quien evalúe el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el repositorio no declara ningún idioma) |
| Licencia | MIT |
| Formato de pesos | no disponible |
| Desarrollador | EDP-Datty |
| Identificador en Hugging Face | EDP-Datty/IA |
| Pipeline declarado | no disponible |
| Fecha de creación | 11 de septiembre de 2026 |
| Última actualización | 11 de septiembre de 2026 |
| Descargas | 0 |
| "Likes" | 0 |
| Región declarada | region:us |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del modelo. La model card no especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un híbrido, ni si incorpora técnicas como atención lineal, decodificación especulativa o cuantización nativa.

Tampoco se documentan los datos de entrenamiento: no consta el número de tokens, la composición del corpus, la existencia de fases de ajuste supervisado, RLHF, DPO u otro método de alineación, ni el vocabulario o tokenizador empleado. Cualquier afirmación al respecto sería especulación.

## Capacidades

- No se ha publicado ninguna capacidad documentada para este modelo.
- No consta soporte de generación de texto, razonamiento, código, matemáticas, visión, audio ni multimodalidad.
- No consta soporte de tool calling o function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No consta ninguna capacidad multilingüe declarada; el campo de idiomas está vacío en los metadatos.
- No consta la existencia de un modo de razonamiento explícito ("thinking mode") ni de parámetros de configuración de generación.
- No se han publicado ejemplos de uso, plantillas de prompt ni tokens especiales de chat.

Cualquier evaluación de capacidades requiere descargar los pesos (si están disponibles en el repositorio) e inspeccionar la configuración del modelo.

## Casos de uso

Los siguientes escenarios son genéricos para un modelo de lenguaje de texto y no pueden confirmarse con la información disponible. Se indican únicamente como marco de evaluación para quien decida probar el modelo.

- Atención al cliente automatizada: un modelo de lenguaje podría gestionar conversaciones multi-turno si su ventana de contexto y su calidad multilingüe fueran suficientes. En este caso no se conoce ni la longitud de contexto ni los idiomas soportados, por lo que la idoneidad no puede confirmarse.
- Generación de código en producción: requeriría conocer la calidad en lenguajes de programación y el soporte de tool calling. Ninguno de los dos datos está documentado.
- Resumen de documentos largos: depende directamente de la ventana de contexto, que no se ha declarado. Sin ese dato no es posible determinar si el modelo puede procesar contratos, informes o artículos completos.
- Clasificación y etiquetado de texto: un modelo de lenguaje puede adaptarse a tareas de clasificación mediante prompting, pero se desconoce si el repositorio contiene un modelo base o un modelo ajustado para instrucciones.
- Extracción de información estructurada: requeriría estabilidad de formato de salida y, opcionalmente, function calling. No hay evidencia de ninguna de las dos cosas.
- Prototipado y experimentación en investigación: el modelo podría servir como punto de partida para experimentos, siempre que los pesos estén publicados y la licencia MIT se confirme en el propio repositorio.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT permitiría uso comercial, modificación y redistribución, sujeto a la verificación de que los pesos realmente se distribuyen bajo esos términos.
- Evaluación comparativa interna: podría incorporarse a una batería de pruebas propia para medir calidad en tareas concretas, dado que no existen benchmarks públicos del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Sin conocer el número de parámetros ni el formato de pesos, no es posible calcularla.
- GPU recomendadas: no disponible por la misma razón.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; depende del formato de pesos, que no se ha declarado.
- Latencia y throughput estimados: no disponible.

Como referencia genérica, ajena a este modelo concreto, un modelo denso en fp16 ocupa aproximadamente 2 GB por cada 1.000 millones de parámetros; en cuantización de 8 bits, alrededor de 1 GB por cada 1.000 millones; y en 4 bits, unos 0,5-0,6 GB por cada 1.000 millones, más el consumo del contexto y del runtime. Esta tabla es orientativa y no debe aplicarse al modelo EDP-Datty/IA sin conocer antes su tamaño real.

## Comparativa con modelos similares

No disponible. Al no conocerse el tamaño, la arquitectura ni la tarea del modelo, no es posible identificar alternativas comparables de forma fundamentada. Cualquier comparación con modelos concretos sería una suposición sin base.

| Criterio | EDP-Datty/IA | Alternativas |
|---|---|---|
| Parámetros | no disponible | no disponible |
| Contexto | no disponible | no disponible |
| Rendimiento | no disponible | no disponible |
| Licencia | MIT | no disponible |
| Disponibilidad | Repositorio en Hugging Face con 0 descargas | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentación: la model card solo contiene la declaración de licencia, sin información sobre uso previsto, datos de entrenamiento o limitaciones conocidas.
- Imposibilidad de estimar requisitos de cómputo: sin tamaño ni formato de pesos no se puede planificar el despliegue.
- Riesgo de alucinación: no evaluable, pero debe asumirse como riesgo inherente a cualquier modelo generativo sin benchmarks publicados.
- Sesgos: no documentados y, por tanto, no auditables.
- Cobertura lingüística: el repositorio no declara idiomas soportados, lo que impide garantizar un rendimiento aceptable en castellano o en cualquier otro idioma.
- Licencia: figura como MIT, lo que en principio permite uso comercial y redistribución, pero conviene verificar en el propio repositorio que los pesos se distribuyen bajo esos términos y no solo el código.
- Fecha de creación atípica: los metadatos indican 2026-09-11, posterior a la fecha habitual de publicación; conviene confirmar si se trata de un error de la plataforma o de un repositorio de prueba.
- Señales de baja madurez: 0 descargas, 0 "likes", sin pipeline declarado y sin historial de actualizaciones. No se recomienda su uso en producción sin una evaluación propia y exhaustiva.
- No apto para decisiones críticas: sin trazabilidad de datos ni evaluaciones de seguridad, su uso en ámbitos médicos, legales o financieros no está justificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EDP-Datty/IA
- Resultados de la búsqueda web (no relacionados con el modelo, se listan por completitud):
  - https://forums-enseignants-du-primaire.com/
  - https://login.edp.pt/
  - https://particulares.cliente.edp.pt/
  - https://edp.com/
  - https://www.edp.pt/particulares/
- Paper, blog técnico, repositorio de código o demo: no disponibles.
