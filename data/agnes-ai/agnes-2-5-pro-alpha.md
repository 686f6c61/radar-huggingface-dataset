# Agnes-AI/Agnes-2.5-Pro-Alpha

## Resumen

Agnes 2.5 Pro Alpha es un modelo de razonamiento multimodal propietario desarrollado por Agnes AI, presentado en agosto de 2026 como su modelo más capaz para tareas avanzadas de codificación, razonamiento científico, análisis de contexto largo y flujos de trabajo agénticos. Combina una ventana de contexto de 1 millón de tokens con una salida máxima de 65.536 tokens, soporte de tool calling y comprensión de texto, imagen y vídeo, lo que lo sitúa en la categoría de modelos de escala flagship. Se distribuye exclusivamente a través de la API de Agnes AI, sin acceso público a los pesos.

Con aproximadamente 396,8 mil millones de parámetros y una arquitectura de mezcla de expertos (MoE) basada en Qwen3.5, según el tag `qwen3_5_moe`, el modelo compite directamente con otros sistemas propietarios de gran escala como Qwen3.5-397B, GLM-5.2-744B o DeepSeek-V4-Pro-1.6T. Según mediciones independientes de Artificial Analysis, obtiene una puntuación de 39 en el Artificial Analysis Intelligence Index, situándose en la zona media-alta entre los modelos de razonamiento evaluados, aunque por debajo de la frontera propietaria actual. Su relevancia radica en ofrecer un equilibrio entre capacidades de razonamiento profundo, contexto muy largo y multimodalidad, orientado a cargas de trabajo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5, según tag `qwen3_5_moe` |
| Parametros totales | 396.802.360.816 (~396,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1 M) |
| Salida maxima | 65.536 tokens |
| Tipos de cuantizacion | no disponible (modelo propietario, acceso via API) |
| Idiomas soportados | ingles, chino |
| Licencia | other (propietaria, no open source) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se ha hecho pública. El tag `qwen3_5_moe` en HuggingFace indica que se trata de un modelo de mezcla de expertos derivado de la familia Qwen3.5, aunque no se especifican el numero de expertos, la dimension de los mismos ni la distribucion de capas. Al ser un modelo propietario, no se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni las tecnicas de alineacion utilizadas (RLHF, DPO, etc.). Tampoco se conocen innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal; la unica informacion disponible es que soporta entrada multimodal (texto, imagen y video) y salida de texto, con una ventana de contexto de 1 M de tokens y una salida maxima de 65.536 tokens.

## Capacidades

- Razonamiento avanzado: disenado para problemas cientificos y matematicos complejos, con modo de razonamiento extendido.
- Generacion de codigo: rinde bien en benchmarks de agentes de terminal y tareas de codificacion (Terminal-Bench v2.1, SciCode).
- Comprension multimodal: acepta entrada de texto, imagen y video, y produce salida de texto.
- Contexto largo: ventana de 1 M de tokens, adecuada para analisis de documentos extensos y conversaciones de muchas vueltas.
- Tool calling / function calling: soporte para invocar herramientas externas, segun la documentacion oficial.
- Flujos de trabajo agénticos: capaz de ejecutar tareas multi-paso con razonamiento encadenado.
- Multilingue: soporta ingles y chino.

## Casos de uso

- Analisis de documentos legales o academicos extensos: gracias a su contexto de 1 M de tokens, puede procesar contratos completos, tesis o expedientes en una sola pasada, extrayendo clausulas, referencias cruzadas y resumenes estructurados.
- Generacion y revision de codigo en produccion: con tool calling y razonamiento avanzado, puede integrarse en pipelines de CI/CD para revisar pull requests, generar tests unitarios y detectar vulnerabilidades en repositorios grandes.
- Agentes autonomos de automatizacion de tareas: su capacidad de razonamiento multi-paso y uso de herramientas permite construir agentes que navegan por APIs, ejecutan comandos en terminal y gestionan flujos de trabajo de datos sin intervencion humana.
- Asistente de investigacion cientifica: puede leer articulos, interpretar figuras y tablas (entrada de imagen) y razonar sobre resultados experimentales, ayudando a cientificos a sintetizar literatura o disenar experimentos.
- Soporte al cliente bilingue (ingles y chino): con contexto largo y comprension multimodal, puede gestionar conversaciones complejas de atencion al cliente que incluyan capturas de pantalla o documentos adjuntos.
- Analisis de video para seguridad o control de calidad: al aceptar entrada de video, puede transcribir y razonar sobre contenido audiovisual, por ejemplo para resumir grabaciones de reuniones o detectar anomalias en procesos industriales.

## Benchmarks y rendimiento

La model card del autor presenta mediciones independientes de Artificial Analysis comparando Agnes 2.5 Pro Alpha con Qwen3.5-397B, Qwen3.7-Max, GLM-5.2-744B, MiniMax-M3-428B, DeepSeek-V4-Pro-1.6T, Claude Opus 4.7 y Claude Opus 4.8. Los resultados disponibles son:

| Benchmark | Agnes 2.5 Pro Alpha | Qwen3.5-397B | Qwen3.7-Max | GLM-5.2-744B | MiniMax-M3-428B | DeepSeek-V4-Pro-1.6T | Claude Opus 4.7 | Claude Opus 4.8 |
|---|---|---|---|---|---|---|---|---|
| GDPval-AA v2 | 33,8 | 23,2 | 38,6 | 50,3 | 44,3 | 54,5 | 49,5 | 54,2 |
| τ³-Banking | 12,4 | 13,4 | 11,8 | 34,6 | 15,3 | 39,6 | 34,6 | 34,2 |
| Terminal-Bench v2.1 | 67,0 | 51,3 | 74,5 | 77,9 | 65,2 | 78,7 | 83,1 | 84,6 |
| SciCode | 42,2 | 42,0 | 48,8 | 50,5 | 45,4 | 49,2 | 54,5 | 53,5 |

Agnes supera a Qwen3.5-397B en seis de las ocho evaluaciones mencionadas por el autor, con ventajas claras en Terminal-Bench v2.1, CritPt y AA-Omniscience Accuracy. Sin embargo, en la tabla visible, solo supera a Qwen3.5 en GDPval-AA v2 y Terminal-Bench v2.1, quedando por debajo en τ³-Banking y SciCode. El dato de AA-LCR (long context) aparece en la tabla pero el valor de Agnes no es visible en la informacion proporcionada. Ademas, Artificial Analysis otorga al modelo una puntuacion de 39 en su indice de inteligencia, situandolo en la zona media del conjunto de modelos de razonamiento evaluados.

## Requisitos de hardware

- No se requieren requisitos de hardware para el usuario final: el modelo se ofrece exclusivamente como servicio API gestionado por Agnes AI.
- No hay datos oficiales sobre despliegue local ni sobre cuantizaciones disponibles.
- Como referencia orientativa, un modelo de ~397 B parametros en precision fp16 requeriria aproximadamente 794 GB de VRAM; al ser MoE, los parametros activos probablemente reduciran esa cifra, pero no se ha publicado el numero de parametros activos.
- No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que el acceso es propietario.
- La latencia y el throughput se gestionan desde la infraestructura de Agnes AI; no hay cifras publicas.

## Comparativa con modelos similares

La comparativa se basa en los datos de benchmarks de Artificial Analysis recogidos en la model card. Los modelos comparados son todos propietarios y de escala similar o superior:

| Modelo | Parametros | Contexto | GDPval-AA v2 | Terminal-Bench v2.1 | SciCode | Licencia |
|---|---|---|---|---|---|---|
| Agnes 2.5 Pro Alpha | ~396,8 B (MoE) | 1 M | 33,8 | 67,0 | 42,2 | Propietaria |
| Qwen3.5-397B | ~397 B (MoE) | no disponible | 23,2 | 51,3 | 42,0 | Propietaria |
| MiniMax-M3-428B | ~428 B (MoE) | no disponible | 44,3 | 65,2 | 45,4 | Propietaria |
| GLM-5.2-744B | ~744 B (MoE) | no disponible | 50,3 | 77,9 | 50,5 | Propietaria |

Agnes supera a Qwen3.5-397B en agentic work y coding, pero queda por detras de GLM-5.2 y DeepSeek-V4-Pro en la mayoria de metricas. No se dispone de datos de contexto ni de parametros activos para los competidores, por lo que la comparativa se limita a los benchmarks publicados.

## Limitaciones y advertencias

- Modelo propietario: no se distribuyen los pesos ni se permite el despliegue local; el acceso es exclusivamente via API de pago.
- Licencia restrictiva: la licencia "other" impide usos no contemplados por Agnes AI, incluyendo posiblemente fine-tuning, redistribucion o uso comercial sin contrato.
- Idiomas limitados: solo ingles y chino; no hay soporte oficial para espanol ni otros idiomas.
- Riesgo de alucinacion: como todo modelo de razonamiento, puede generar respuestas plausibles pero incorrectas, especialmente en dominios cientificos o tecnicos poco representados en sus datos de entrenamiento.
- Sesgos potenciales: al estar entrenado principalmente en ingles y chino, puede reflejar sesgos culturales y linguisticos de esas comunidades.
- Sin transparencia de entrenamiento: no se han publicado detalles sobre el dataset, el proceso de alineacion ni las medidas de seguridad implementadas, lo que dificulta la evaluacion de sesgos y riesgos.
- Rendimiento variable en benchmarks: aunque destaca en Terminal-Bench v2.1, queda por detras de otros modelos propietarios en tareas como τ³-Banking o GDPval-AA v2, lo que sugiere que no es la mejor opcion para todos los escenarios agénticos.
- Fecha de creacion reciente (agosto de 2026) y sin descargas ni likes en HuggingFace, lo que indica una adopcion aun limitada y poca validacion independiente por parte de la comunidad.

## Enlaces

- [HuggingFace - Agnes-AI/Agnes-2.5-Pro-Alpha](https://huggingface.co/Agnes-AI/Agnes-2.5-Pro-Alpha)
- [Documentacion oficial de Agnes 2.5 Pro Alpha](https://wiki.agnes-ai.com/en/docs/agnes-25-pro-alpha)
- [Articulo de Artificial Analysis sobre el lanzamiento](https://artificialanalysis.ai/articles/agnes-ai-releases-agnes-2-5-pro-alpha)
- [Pagina del modelo en Artificial Analysis](https://artificialanalysis.ai/models/agnes-2-5-pro-alpha)
- [Pagina de precios y especificaciones en CloudPrice](https://cloudprice.net/models/agnes-2-5-pro-alpha)
- [Version estable comercial Agnes 2.5 Pro](https://agnes-ai.cn/en/docs/agnes-25-pro)
