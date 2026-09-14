# PYTHAI/granite-4.2-30b-fork

## Resumen

PYTHAI/granite-4.2-30b-fork es un fork de tipo puntero del repositorio ibm-granite/granite-4.2-30b, fijado al commit `9e668ce1c538387ef24d3644e9b0606647762636` el 13 de septiembre de 2026. No almacena pesos: los 11 ficheros de pesos (58,6 GB) permanecen en el repositorio original. El fork conserva la licencia, la configuración, el tokenizador y el código de ese commit exacto, con digests SHA-256 en `FORK.json`, por lo que funciona como referencia reproducible de una revisión concreta del modelo.

El modelo subyacente, Granite-4.2-30B, lo desarrolla el equipo Granite de IBM. Es un transformer denso decoder-only de 30.000 millones de parámetros con razonamiento nativo mediante cadenas de pensamiento en etiquetas `<think>...</think>`, orientado a tareas intensivas en razonamiento, generación de código, tool calling y flujos agénticos, con licencia Apache 2.0 y 12 idiomas probados.

Se publicó el 25 de agosto de 2026 como modelo insignia de la familia Granite 4.2. Su relevancia actual se apoya en tres elementos: modos de pensamiento conmutables dentro del mismo modelo (completo, sin pensamiento y bajo esfuerzo), tool calling aumentado con razonamiento, y una ventana de contexto de 128K nativa ampliable a 512K, todo con pesos abiertos y uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, clase `GraniteForCausalLM`; GQA, RoPE, SwiGLU, RMSNorm |
| Parámetros totales | 30B |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K nativo; extensión de contexto largo hasta 512K |
| Tipos de cuantización | no disponible (los pesos publicados están en bfloat16; el fork no incluye pesos ni cuantizaciones oficiales) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas probados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), 11 ficheros, 58,6 GB, alojados en el repositorio de origen |
| Desarrollador | Granite Team, IBM |
| Modelo base | ibm-granite/granite-4.1-30b-base |
| Modo de razonamiento | cadena de pensamiento nativa en `<think>...</think>`; modos completo (por defecto), sin pensamiento y bajo esfuerzo |
| Fecha de publicación | 25 de agosto de 2026 |
| Repositorio | fork puntero sin pesos, creado el 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

Granite-4.2-30B es un transformer denso decoder-only. Los componentes declarados en la model card son: atención con Grouped Query Attention de 32 cabezas de atención y 8 cabezas KV; embeddings posicionales rotatorios (RoPE) con θ = 10.000.000; red feed-forward MLP con activación SwiGLU y tamaño oculto 32768; normalización RMSNorm con ε = 1e-5; embeddings de entrada y salida separados (no atados); precisión bfloat16. La configuración del bloque de 30B dense incluye embedding de tamaño 4096, 64 capas y tamaño de cabeza de atención 128 (la tabla comparativa de la model card está truncada en la información disponible, por lo que el resto de cifras de la familia 3B/8B/30B no se pueden reproducir completas).

El modelo parte de Granite-4.1-30B-Base y es un ajuste (finetune) sobre él, con razonamiento nativo incorporado. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, por lo que esos datos quedan como no disponibles. La innovación destacable es la gestión del modo de pensamiento dentro del propio modelo: el usuario puede alternar entre razonamiento completo, razonamiento de bajo esfuerzo y respuesta directa sin cambiar de pesos, lo que permite ajustar latencia y profundidad por consulta. El tool calling se presenta como aumentado por razonamiento, es decir, el modelo razona qué herramienta invocar y por qué antes de emitir la llamada.

## Capacidades

- Generación de texto conversacional multi-turno en 12 idiomas probados (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino).
- Razonamiento paso a paso con cadena de pensamiento nativa, con mejora declarada en matemáticas, código y problemas lógicos de varios pasos.
- Modos de razonamiento conmutables: completo (por defecto), sin pensamiento y bajo esfuerzo, dentro de un único modelo.
- Generación de código, con uso declarado como modelo backbone para herramientas de codificación agéntica.
- Tool calling y function calling, con selección razonada de herramientas; integración con API compatible con OpenAI.
- Flujos agénticos y razonamiento multi-paso sobre contextos largos (hasta 512K con extensión).
- Procesamiento de documentos largos y conversaciones extensas gracias a la ventana de 128K nativa.
- Razonamiento multilingüe en los idiomas probados; el resto de idiomas no han sido validados según la model card.

## Casos de uso

- Atención al cliente automatizada: gestión de conversaciones multi-turno con historial extenso apoyándose en la ventana de 128K nativa (512K con extensión), alternando el modo sin pensamiento para consultas simples y el modo completo para incidencias complejas.
- Codificación agéntica en producción: integración en arneses agénticos mediante tool calling y API compatible con OpenAI, con el modo de bajo esfuerzo para autocompletado y el completo para refactorizaciones o corrección de errores.
- Agentes multi-paso con herramientas: orquestación de tareas que requieren decidir qué herramienta invocar y en qué orden, aprovechando que el modelo razona la elección antes de emitir la llamada a función.
- Análisis de documentación técnica extensa: resumen y extracción de datos de manuales, contratos o informes que superan los 100K tokens, con respuestas trazables al fragmento de origen.
- Asistentes de razonamiento matemático y lógico: resolución de problemas con cadena de pensamiento explícita, útil en entornos educativos o de verificación donde interesa auditar el razonamiento intermedio.
- Asistencia multilingüe para equipos distribuidos: traducción, reescritura y atención interna en los 12 idiomas probados, con un único despliegue en lugar de varios modelos por idioma.
- Generación de código en pipelines de CI/CD: revisión automática de cambios, generación de pruebas y explicación de fallos integrándose como servicio con API compatible con OpenAI.
- Sistemas de soporte interno con contexto largo: consulta sobre bases de conocimiento completas en una sola ventana, evitando fragmentación y pérdida de contexto entre recuperaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe capacidades y modos de razonamiento, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni comparaciones numéricas con modelos de la competencia.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones derivadas del tamaño del modelo (30B parámetros), no datos publicados en la información disponible.

- Precisión bfloat16 (pesos originales): aproximadamente 60 GB solo para pesos, más memoria para caché KV; requiere al menos 80 GB de VRAM para inferencia cómoda con contexto moderado.
- Cuantización de 8 bits: del orden de 30-35 GB, viable en una A100 40 GB o H100 40/80 GB con contexto limitado.
- Cuantización de 4 bits: del orden de 16-20 GB, lo que permite ejecución en GPUs de consumo de gama alta con 24 GB de VRAM.
- GPU recomendadas: H100 80 GB, A100 80 GB, A100 40 GB (con cuantización), L40S 48 GB, y para cuantización agresiva RTX 4090, RTX 5090 o RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, previsiblemente en 4 bits en tarjetas de 24 GB o más, con contexto y lote reducidos; no cabe en bfloat16 en tarjetas de consumo.
- Opciones de despliegue: transformers con `trust_remote_code=True` (formato nativo documentado); el ecosistema compatible con pesos safetensors permite usar servidores de inferencia estándar, aunque en la información disponible solo se confirma explícitamente el uso mediante transformers y endpoints compatibles.
- Latencia y throughput estimados: no disponibles; dependen fuertemente de la cuantización, la GPU y del modo de pensamiento elegido, ya que el modo completo genera muchos más tokens por respuesta que el modo sin pensamiento.

## Comparativa con modelos similares

Comparación dentro de la propia familia y con el modelo base, con los datos que constan en la información disponible:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Granite-4.2-30B (objeto de este fork) | 30B denso | 128K nativo, extensión a 512K | Apache 2.0 | Modelo insignia de razonamiento de Granite 4.2; modos de pensamiento conmutables |
| Granite-4.2-8B | 8B denso | no disponible | Apache 2.0 | Miembro de la familia Granite 4.2 |
| Granite-4.2-3B | 3B denso | no disponible | Apache 2.0 | Miembro de la familia Granite 4.2, orientado a despliegues ligeros |
| Granite-4.1-30B-Base | 30B | no disponible | Apache 2.0 | Modelo base sobre el que se construye Granite-4.2-30B |

Frente a alternativas abiertas de tamaño comparable de otros fabricantes, no se dispone de comparativas de rendimiento en la información proporcionada, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- El repositorio `PYTHAI/granite-4.2-30b-fork` no contiene pesos: solo licencia, configuración, tokenizador y código del commit fijado. Cualquier uso real exige cargar los pesos desde `ibm-granite/granite-4.2-30b` con la revisión anclada al commit indicado, lo que ata el despliegue a la disponibilidad del repositorio de origen.
- La carga requiere `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio y debe evaluarse en entornos controlados.
- El fork tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validación de la comunidad sobre esta copia concreta.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mecanismos específicos de mitigación en la información disponible.
- Soporte de idiomas limitado a los 12 idiomas probados; el propio autor advierte de que otros idiomas pueden funcionar pero no han sido validados por completo.
- El modo de razonamiento completo incrementa notablemente el número de tokens generados, con impacto directo en coste y latencia; conviene reservarlo para consultas que lo justifiquen.
- No se publican resultados de benchmarks ni evaluaciones de sesgo, por lo que la selección del modelo para producción debe basarse en pruebas propias.
- La model card disponible está truncada en la tabla comparativa de la familia, de modo que parte de la información técnica del bloque de 30B no puede verificarse aquí.
- Licencia Apache 2.0: permite uso comercial y académico sin restricciones adicionales, pero las obligaciones aplicables son las de la licencia del commit de origen, que este fork preserva.

## Enlaces

- Fork en HuggingFace: https://huggingface.co/PYTHAI/granite-4.2-30b-fork
- Modelo de origen (pesos): https://huggingface.co/ibm-granite/granite-4.2-30b
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-30b-base
- Colección Granite 4.2 Language Models: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog técnico de Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio GitHub: https://github.com/ibm-granite/granite-4.2-language-models
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Análisis de rendimiento de Granite 4.1 30B (referencia externa): https://artificialanalysis.ai/models/granite-4-1-30b
