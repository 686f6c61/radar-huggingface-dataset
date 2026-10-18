# ReadyArt/Wicked-Tutu-26B-A4B-GGUF

## Resumen

Wicked-Tutu-26B-A4B-GGUF es la cuantización en formato GGUF del modelo ReadyArt/Wicked-Tutu-26B-A4B, un modelo de generación de texto de aproximadamente 25.230 millones de parámetros (25,23 B según los pesos en safetensors del modelo base) publicado por el usuario ReadyArt bajo licencia Apache 2.0. La nomenclatura «26B-A4B» sigue la convención habitual de los modelos Mixture of Experts (MoE), en la que el primer número indica los parámetros totales y el segundo los parámetros activos por token (en torno a 4 B), aunque la información disponible no confirma explícitamente la arquitectura.

El modelo está orientado a narrativa interactiva y roleplay para adultos: las etiquetas del repositorio incluyen `nsfw`, `explicit`, `ERP`, `Erotic`, `Horror`, `Violence`, `roleplay` y `unaligned`, lo que indica que no ha pasado por un proceso de alineamiento de seguridad orientado a rechazar contenido sensible. El único idioma declarado es el inglés. Su relevancia práctica es acotada: es un modelo de nicho, con cero descargas y un único «like» en el momento de la consulta, pensado para despliegue local en entornos donde el contenido sin censura es el requisito principal.

Conviene señalar que la model card del repositorio no contiene información técnica sustantiva: está compuesta casi íntegramente por hojas de estilo CSS y elementos decorativos, sin detallar datos de entrenamiento, longitud de contexto, composición del dataset ni resultados de evaluación. Esta ficha se limita, por tanto, a los metadatos verificables del repositorio y marca explícitamente como «no disponible» todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita. La nomenclatura «A4B» sugiere un transformer con Mixture of Experts (~4 B de parámetros activos); no confirmado por el autor |
| Parametros totales | 25.233.142.046 (~25,23 B), según los pesos en safetensors del modelo base |
| Parametros activos | Aproximadamente 4 B, inferido de la nomenclatura «A4B»; no confirmado en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Formato GGUF; el repositorio no detalla los niveles de cuantización incluidos (tamaño total del repo: 91,5 GB, compatible con múltiples variantes) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens utilizados, la composición del dataset ni la existencia de fases de ajuste fino supervisado, RLHF o DPO. La model card del repositorio no aborda ninguno de estos aspectos: su contenido es fundamentalmente CSS y no incluye secciones técnicas. El único dato estructural deducible es el recuento de parámetros (25,23 B) y la posible naturaleza MoE sugerida por el sufijo «A4B» del nombre, patrón habitual en modelos como Mixtral o la familia Qwen3-MoE.

Tampoco se documenta ninguna innovación técnica específica (atención lineal, decodificación especulativa, modos de razonamiento explícito, etc.). Cualquier afirmación sobre estas capacidades sería especulativa y no debe tomarse como característica verificada del modelo.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (`conversational` en los metadatos).
- Roleplay y narrativa interactiva de temática adulta explícita, según las etiquetas `nsfw`, `explicit`, `ERP` y `Erotic`.
- Generación de ficción de terror y contenido violento (`Horror`, `Violence`), sin filtros de seguridad orientados al rechazo.
- Comportamiento «unaligned»: el modelo no incorpora un alignment de seguridad destinado a bloquear contenido sensible, lo que forma parte de su propuesta de valor declarada.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` en los metadatos), lo que facilita su despliegue en infraestructuras compatibles con la API de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline declarado es únicamente `text-generation`.
- Multilingüismo: limitado al inglés según el campo `language` del repositorio.

## Casos de uso

- Escritura de ficción adulta asistida: el modelo puede generar y continuar relatos eróticos de forma coherente en inglés, aprovechando su falta de alineamiento de seguridad para evitar rechazos que sí aparecen en modelos con filtros comerciales.
- Motores de roleplay conversacional: integrado en una aplicación de chat con personajes, gestiona turnos multi-turno manteniendo la voz del personaje; su naturaleza MoE (~4 B activos) reduce el coste por token frente a un modelo denso de 25 B.
- Ficción de terror y terror psicológico: generación de narrativa atmosférica con contenido violento o perturbador sin las restricciones habituales de los modelos alineados, útil para autores de género.
- Investigación sobre alineamiento y seguridad: al estar etiquetado como `unaligned`, sirve como referencia en estudios de red-teaming para comparar tasas de rechazo frente a modelos alineados del mismo tamaño.
- Prototipado local de aplicaciones de rol adulto: al distribuirse en GGUF, puede ejecutarse íntegramente en hardware de consumo sin enviar datos a servicios externos, lo que simplifica el cumplimiento de requisitos de privacidad en plataformas con contenido sensible.
- Ampliación de contenido en pipelines editoriales de nicho: generación de variantes de escenas o diálogos para publicaciones serializadas dirigidas a audiencias adultas, con revisión humana posterior obligatoria.
- Experimentación con cuantizaciones MoE: el repositorio (91,5 GB) permite comparar el equilibrio calidad/velocidad de distintas cuantizaciones GGUF de un modelo MoE en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye datos de MMLU, HumanEval, GSM8K ni de evaluaciones de calidad narrativa o de rol, y tampoco se han encontrado referencias externas en la búsqueda web realizada. No debe asumirse ningún nivel de rendimiento a partir del nombre o del tamaño del modelo.

## Requisitos de hardware

- Estimación de VRAM para los pesos (25,23 B de parámetros): en BF16/FP16 ≈ 50,5 GB; Q8_0 ≈ 26,8 GB; Q6_K ≈ 20,7 GB; Q5_K_M ≈ 17,5 GB; Q4_K_M ≈ 15,2 GB; Q3_K_M ≈ 12 GB; Q2_K ≈ 8,8 GB. Estas cifras no incluyen la caché KV, que depende del contexto y no puede estimarse sin conocer la longitud de contexto soportada.
- En un modelo MoE todos los expertos deben residir en memoria, por lo que el requisito de VRAM/RAM equivale al tamaño completo de los pesos; la ventaja de los ~4 B activos se traduce en velocidad, no en ahorro de memoria.
- GPU de 80 GB (A100, H100): permiten BF16 o Q8_0 con contexto amplio y son la opción para servir en producción.
- GPU de 48 GB (A6000, L40S): BF16 ajustado o Q8_0 con margen para caché KV.
- GPU de consumo de 24 GB (RTX 3090, 4090): Q4_K_M o Q5_K_M con contexto moderado; es el punto de entrada realista para uso local.
- GPU de 16 GB (RTX 4080, 4060 Ti 16 GB): Q4_K_M muy justo; recomendable Q3_K_M o descarga parcial a RAM.
- Equipos sin GPU suficiente: `llama.cpp` con offload parcial sobre 32-64 GB de RAM del sistema; el throughput caerá de forma notable.
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio y text-generation-webui admiten GGUF de forma nativa. vLLM y SGLang tienen soporte GGUF limitado o experimental; TGI no es la vía recomendada para este formato.
- Latencia y throughput: no disponibles. Como referencia estructural, un MoE con ~4 B activos suele generar más tokens por segundo que un modelo denso de 25 B en la misma GPU, pero no se ha verificado para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Wicked-Tutu-26B-A4B | ~25,23 B | ~4 B (inferido) | No disponible | Apache 2.0 | Roleplay adulto sin alinear |
| Qwen3-30B-A3B | ~30,5 B | ~3,3 B | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | Propósito general, alineado, multilingüe |
| Mistral Small 24B | ~24 B (denso) | N/A | 32.768 tokens | Apache 2.0 | Propósito general, alineado |
| Mixtral 8x7B | ~46,7 B | ~12,9 B | 32.768 tokens | Apache 2.0 | Propósito general, alineado |

Nota: los datos de los modelos comparables proceden de sus fichas públicas y no se han verificado en la búsqueda web de esta consulta; se incluyen como referencia de categoría. La diferencia principal de Wicked-Tutu no es de rendimiento medido, sino de posicionamiento: es el único de la lista explícitamente orientado a contenido adulto sin alineamiento de seguridad, y el único sin datos públicos de contexto ni de evaluación.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material sexual explícito, violencia y terror. Su uso requiere verificación de edad y cumplimiento de la legislación aplicable en la jurisdicción de despliegue.
- Ausencia de alineamiento de seguridad: la etiqueta `unaligned` implica que no hay salvaguardas integradas; cualquier filtro deberá implementarse en la capa de aplicación.
- Riesgo elevado de alucinación y de deriva narrativa: sin datos de entrenamiento públicos ni evaluaciones, no hay garantías sobre coherencia en contextos largos.
- Longitud de contexto desconocida: no es posible planificar aplicaciones que dependan de ventanas amplias sin pruebas empíricas previas.
- Idioma: solo inglés declarado; el rendimiento en castellano es indeterminado y probablemente deficiente.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero no exime del cumplimiento de las políticas de contenido de las plataformas de distribución (Hugging Face, tiendas de aplicaciones, pasarelas de pago) ni de la normativa sobre contenido para adultos.
- Adopción prácticamente nula (0 descargas, 1 like): no existe comunidad, issues resueltos ni validación independiente de la calidad del modelo.
- Anomalía en las fechas: los metadatos indican creación el 2026-10-18, fecha posterior a la mayoría de referencias disponibles; conviene verificar la integridad del repositorio antes de confiar en él.
- Model card sin información técnica: no hay forma de auditar el proceso de entrenamiento, la procedencia de los datos ni posibles sesgos incorporados.
- El repositorio pesa 91,5 GB, lo que implica una descarga considerable si se quieren comparar varias cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ReadyArt/Wicked-Tutu-26B-A4B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Tutu-26B-A4B
- Paper, blog o repositorio de código del autor: no disponible
- Demos o espacios de prueba: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a páginas de TikTok sin relación con el modelo).
