# KaztoRay/BlackGuards

## Resumen

BlackGuards es un adaptador LoRA sobre el modelo base Qwen3-8B, publicado por el usuario KaztoRay en HuggingFace, orientado específicamente al ámbito de la ciberseguridad. El adaptador se distribuye a través de la librería PEFT y su pipeline declarado es text-generation. No se trata de un modelo entrenado desde cero, sino de un ajuste fino supervisado (SFT) en precisión BF16 sobre los pesos de Qwen3-8B, lo que implica que hereda la arquitectura, el tokenizador y la ventana de contexto del modelo base, y que su huella de almacenamiento es de pocos cientos de megabytes además del modelo original.

El problema que aborda es la falta de especialización de los modelos generalistas en tareas de seguridad: triaje de CVE/CWE, planificación de remediación, ingeniería de detección, respuesta a incidentes, inteligencia de amenazas y análisis de comportamiento de malware. El autor declara un conjunto de datos de 396.081 filas de entrenamiento, 4.058 de validación y 4.020 de test, con un manifiesto de fuentes y licencias incluido en la release, y un entrenamiento realizado en una única GPU NVIDIA H100 de 80 GB HBM3 mediante MS-SWIFT.

Es relevante ahora porque ejemplifica una tendencia concreta: adaptadores de bajo coste que especializan modelos abiertos de 8.000 millones de parámetros en dominios verticales, desplegables en hardware de gama alta de consumo. Sin embargo, conviene ser explícito: según la propia model card, la revisión del adaptador figura como PENDING y la evaluación también como PENDING, y el autor indica que un adaptador no se considera publicado mientras quede algún marcador pendiente. Los pesos pueden no estar disponibles o pueden haber cambiado tras la redacción de esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3-8B); no se especifica la configuración exacta de rangos y capas objetivo |
| Parametros totales | 8.000 millones en el modelo base; número de parámetros entrenables del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; heredada de Qwen3-8B (32.768 tokens nativos, ampliable a 131.072 mediante YaRN, según las especificaciones del modelo base) |
| Tipos de cuantizacion | No disponible; el adaptador se entrenó en BF16. Al ser un adaptador PEFT puede combinarse con bases cuantizadas en 4 u 8 bits, pero el autor no documenta configuraciones soportadas |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (adaptador). El modelo base Qwen3-8B se distribuye por separado bajo Apache-2.0. El manifiesto del dataset incluye contenido CC-BY-4.0 de reloading0101/threat-intelligence-dataset que requiere atribución |
| Formato de pesos | Adaptador PEFT (librería peft). El formato de fichero concreto no se especifica en la información disponible; el autor indica que la revisión del adaptador está PENDING |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only denso de aproximadamente 8.000 millones de parámetros. Sobre él se aplica un ajuste LoRA, es decir, se congelan los pesos originales y se entrenan matrices de bajo rango insertadas en determinadas capas, lo que reduce drásticamente el coste de entrenamiento y el tamaño del artefacto resultante. El adaptador se carga junto al modelo base mediante PEFT, y puede fusionarse con los pesos originales para su exportación a otros formatos de inferencia.

En cuanto al entrenamiento, el autor documenta: método LoRA SFT en BF16 con MS-SWIFT, una GPU NVIDIA H100 de 80 GB HBM3, y un total de 396.081 filas de entrenamiento, 4.058 de validación y 4.020 de test. Se indica la revisión base concreta de Qwen3-8B utilizada (b968826d9c46dd6066d109eabc6255188de91218) y un manifiesto de dataset incluido en la release. No se documentan en la información disponible el rango del LoRA, las capas objetivo, el número de épocas, la tasa de aprendizaje, la composición detallada del dataset, la existencia de fases de RLHF o DPO, ni curvas de pérdida: la propia model card declara que la tarjeta se completará con la revisión exacta del adaptador, los recuentos de entrenamiento, el tiempo de hardware, las curvas de pérdida y los resultados de evaluación antes de publicar los pesos, y que la revisión del adaptador figura como PENDING. No se describe ninguna innovación técnica adicional más allá del ajuste LoRA.

## Capacidades

Las capacidades se derivan de lo declarado por el autor en la model card, no de una evaluación independiente verificada:

- Generación de texto especializada en dominio de ciberseguridad, sobre las capacidades generales de Qwen3-8B.
- Triage y priorización de CVE y CWE, con planificación de remediación asociada.
- Ingeniería de detección y elaboración de playbooks de respuesta a incidentes.
- Análisis de inteligencia de amenazas y de comportamiento de malware en entornos aislados.
- Planificación de ejercicios de red team, blue team y purple team en contextos autorizados.
- Razonamiento general, código y matemáticas heredados del modelo base Qwen3-8B (no verificados específicamente en el adaptador).
- Soporte de tool calling y function calling: no documentado en la información disponible para este adaptador; el modelo base Qwen3-8B sí lo soporta, pero no se confirma que el ajuste LoRA lo preserve.
- Capacidades multilingües: no disponibles. El autor no declara ningún idioma, y parte del corpus proviene de fuentes en inglés, por lo que el rendimiento en castellano es incierto.
- Modo de pensamiento (thinking mode): no documentado para el adaptador; Qwen3-8B dispone de modos de razonamiento híbridos, pero no se confirma su conservación tras el ajuste.
- Visión y audio: no soportados (el modelo base es exclusivamente de texto).

## Casos de uso

- Triage de vulnerabilidades en un SOC: el modelo puede recibir listados de CVE y CWE junto con inventario de activos y priorizar por criticidad, generando un plan de remediación por pasos. Es adecuado porque el adaptador está entrenado específicamente sobre este tipo de tareas, aunque toda clasificación debe verificarse contra la NVD y el catálogo KEV de CISA, ya que el estado de explotación cambia con el tiempo.
- Redacción de playbooks de respuesta a incidentes: generación de procedimientos estructurados de contención, erradicación y recuperación a partir de una descripción del incidente. Se integraría como asistente de redacción para el equipo de respuesta, con revisión humana obligatoria antes de su aplicación.
- Ingeniería de detección: apoyo en la redacción y revisión de reglas y consultas para plataformas SIEM y EDR, a partir de descripciones de técnicas de ataque. Útil para equipos con plantilla limitada que necesitan acelerar la cobertura de detección.
- Análisis de inteligencia de amenazas: resumen y estructuración de informes de threat intelligence, extracción de TTPs y mapeo a MITRE ATT&CK. El contexto heredado del modelo base permite procesar informes largos, siempre que la configuración de la ventana de contexto se ajuste al valor real del modelo base.
- Análisis de comportamiento de malware en laboratorio aislado: descripción del comportamiento observable de una muestra a partir de informes de sandbox, sin ejecución de código. Debe operarse en entornos sin conectividad y sin capacidad de acción sobre sistemas reales.
- Planificación de ejercicios de red team y purple team autorizados: generación de escenarios de ataque, hipótesis de detección y criterios de éxito para ejercicios con alcance y autorización documentados.
- Formación y concienciación interna: generación de material didáctico sobre vectores de ataque comunes y buenas prácticas defensivas para equipos no especializados.
- Apoyo a la documentación de cumplimiento: redacción de políticas, procedimientos y justificaciones técnicas a partir de requisitos normativos, con validación posterior por el responsable de seguridad.

En todos los casos, la model card restringe explícitamente el uso a evaluación de seguridad autorizada, ingeniería defensiva, respuesta a incidentes, inteligencia de amenazas y análisis de malware en entornos aislados, y prohíbe el acceso no autorizado, el robo de credenciales, el despliegue de malware, las operaciones destructivas, la evasión contra sistemas de terceros y cualquier decisión sin revisión humana cualificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la sección de evaluación figura como `PENDING` y que se publicarán resultados medidos de calidad, anclaje (grounding), regresión y seguridad. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de ciberseguridad (por ejemplo, CTF o tareas de triaje de CVE) para este adaptador.

## Requisitos de hardware

Las cifras siguientes son estimaciones basadas en el tamaño del modelo base Qwen3-8B y en el coste habitual del ajuste LoRA en inferencia; el autor no publica requisitos de hardware para el adaptador.

- VRAM estimada para el modelo base en BF16: en torno a 16-18 GB, más una sobrecarga mínima por el adaptador LoRA (decenas o cientos de megabytes).
- VRAM estimada con cuantización de 8 bits: aproximadamente 9-11 GB.
- VRAM estimada con cuantización de 4 bits: aproximadamente 5-7 GB, más el espacio para la caché KV, que crece con la longitud de contexto.
- GPU profesionales: H100, A100 (40 o 80 GB), L40S y A6000 ejecutan el modelo sin dificultad. El propio entrenamiento se realizó en una H100 de 80 GB.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en BF16 con margen limitado; en RTX 4080, 4070 Ti Super o tarjetas de 12-16 GB requiere cuantización de 4 u 8 bits para contextos moderados. En GPUs de 8 GB solo es viable con cuantizaciones agresivas y contextos cortos.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con transformers + peft, fusionarse con los pesos base y exportarse a GGUF para llama.cpp u Ollama, o servirse con vLLM y TGI. El autor no documenta ninguna de estas rutas de despliegue para este adaptador.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La información disponible no incluye resultados de evaluación del adaptador, por lo que la comparación se limita a características estructurales y de licencia. Los datos de los modelos alternativos que figuran a continuación no están verificados en la información proporcionada y deben confirmarse en sus respectivas fichas.

| Modelo | Base y tamaño | Especialización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaztoRay/BlackGuards | LoRA sobre Qwen3-8B (8.000 M) | Ciberseguridad: triaje de CVE/CWE, respuesta a incidentes, threat intelligence | Heredado del base; no declarado en la ficha | Apache-2.0 (adaptador); dataset con contenido CC-BY-4.0 | Revisión del adaptador PENDING; evaluación PENDING |
| Qwen/Qwen3-8B | Transformer denso, 8.000 M | Generalista, con modos de razonamiento | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache-2.0 | Publicado y ampliamente desplegado |
| Modelos de seguridad de la familia Foundation-Sec (Cisco) | Ajuste sobre Llama de 8.000 M | Ciberseguridad | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada |
| Modelos de la familia WhiteRabbitNeo | Ajustes de 7.000 a 13.000 M | Seguridad ofensiva y defensiva | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada |

La diferencia principal frente al modelo base es la especialización de dominio; la ventaja frente a alternativas de mayor tamaño es el coste de despliegue. La desventaja más relevante en el momento de redactar esta ficha es la ausencia de resultados de evaluación publicados.

## Limitaciones y advertencias

- El autor advierte explícitamente de que el modelo puede alucinar detalles de vulnerabilidades, parches, indicadores de compromiso y atribución. Toda salida debe verificarse contra la NVD, el catálogo KEV de CISA, los avisos del fabricante y la política interna de la organización.
- El estado de un CVE y su inclusión en KEV cambia con el tiempo; el conocimiento almacenado en los pesos queda desactualizado y no debe tratarse como fuente de verdad temporal.
- El adaptador no otorga autorización para probar ningún sistema. El uso ofensivo sin autorización escrita está fuera del alcance declarado y puede ser ilegal.
- No hay resultados de evaluación publicados: no se puede afirmar que supere al modelo base en tareas de seguridad ni que no haya sufrido regresiones en capacidades generales (código, matemáticas, instrucciones, multilingüismo).
- La revisión del adaptador figura como PENDING y la model card indica que el adaptador no se considera publicado mientras queden marcadores pendientes. Los pesos pueden no estar disponibles, haber cambiado o no corresponderse con lo descrito.
- Idiomas no declarados. El corpus incluye fuentes en inglés, por lo que el rendimiento en castellano y en otros idiomas es desconocido y probablemente inferior.
- Licencia Apache-2.0 en el adaptador, lo que en principio permite uso comercial, pero el manifiesto del dataset incluye contenido CC-BY-4.0 de `reloading0101/threat-intelligence-dataset` que exige atribución. Es responsabilidad del usuario revisar el manifiesto antes de un despliegue comercial.
- Riesgo de doble uso: un modelo especializado en seguridad puede emplearse para generar contenido ofensivo. Se recomienda desplegarlo en entornos controlados, con registro de consultas y con revisión humana en el bucle.
- Sin datos sobre sesgos, toxicidad, robustez frente a jailbreaks ni comportamiento en producción. No se han publicado evaluaciones de seguridad.
- El modelo base Qwen3-8B se distribuye por separado; es necesario descargarlo y cumplir su licencia además de la del adaptador.

## Enlaces

- Ficha del adaptador en HuggingFace: https://huggingface.co/KaztoRay/BlackGuards
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Librería PEFT: https://github.com/huggingface/peft
- Framework MS-SWIFT, utilizado para el entrenamiento: https://github.com/modelscope/ms-swift
- Dataset de threat intelligence referenciado con licencia CC-BY-4.0: https://huggingface.co/datasets/reloading0101/threat-intelligence-dataset
- Base de datos nacional de vulnerabilidades (NVD), citada por el autor como fuente de verificación: https://nvd.nist.gov/
- Catálogo de vulnerabilidades explotadas conocidas (KEV) de CISA, citado por el autor: https://www.cisa.gov/known-exploited-vulnerabilities-catalog

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los resultados obtenidos correspondían a servicios de traducción y no guardan relación con el contenido de esta ficha.
