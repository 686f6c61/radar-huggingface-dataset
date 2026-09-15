# dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-GGUF

## Resumen

Dongfangshuo-Qwen3.8-27B-NSFW-GGUF es la versión cuantizada en formato GGUF del modelo Dongfangshuo-Qwen3.8-27B-NSFW, publicado por el usuario dongfangshuo en HuggingFace. Se trata de un modelo multimodal de tipo image-text-to-text derivado de Huihui-Qwen3.8-27B-abliterated, sobre el que se ha aplicado un ajuste fino orientado a contenido adulto (R-18) y a maximizar la obediencia ante peticiones que los modelos alineados rechazarían habitualmente. El repositorio incluye el archivo principal Q4_K_M de 16,8 GB, un proyector visual mmproj de 931 MB y un Modelfile para su importación directa en Ollama.

El modelo cuenta con 27.320.697.856 parámetros totales (aproximadamente 27,3 mil millones) según los pesos safetensors del modelo base, y el repositorio ocupa 17,8 GB. La model card declara capacidades de análisis de imagen y vídeo gracias al proyector multimodal, soporte para chino (zh) como único idioma declarado en los metadatos y licencia Apache-2.0. No se han publicado especificaciones sobre longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks.

Su relevancia actual es acotada y muy específica: se trata de un modelo de nicho para generación de ficción adulta y para investigación sobre alineación y abliteration, distribuido en un formato que permite ejecución local con hardware de consumo. Conviene subrayar que el repositorio está etiquetado como not-for-all-audiences y que sus 176 descargas y 0 likes reflejan un uso muy minoritario dentro del ecosistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.8-27B, familia transformer multimodal según la model card) |
| Parámetros totales | 27.320.697.856 (≈27,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (16,8 GB) para el modelo principal; f16 (931 MB) para el proyector mmproj |
| Idiomas soportados | zh (chino), único idioma declarado en los metadatos |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador mmproj en GGUF f16), con Modelfile para Ollama |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia Qwen3.8, su naturaleza multimodal (pipeline image-text-to-text) y el uso de un proyector visual independiente que se carga de forma conjunta con el modelo de lenguaje. El proyector mmproj en f16 es el componente que habilita la entrada de imágenes y, según la model card, también de vídeo. No se especifican el número de tokens de entrenamiento, la composición del dataset ni la ventana de contexto soportada.

El proceso de creación descrito por el autor es una cadena de dos etapas: primero se parte de Huihui-Qwen3.8-27B-abliterated, un modelo al que se le han eliminado las direcciones de rechazo (abliteration), y después se aplica un ajuste fino de especialización en creación R-18 que, según la model card, incrementa de forma notable la obediencia ante peticiones explícitas y el uso directo de vocabulario adulto. No se documentan técnicas de RLHF, DPO ni ningún otro método de alineación posterior, ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en chino, orientada a diálogo multi-turno.
- Capacidades multimodales de entrada: análisis de imágenes y, según la model card, de vídeo, mediante el proyector mmproj.
- Especialización en narrativa y roleplay para adultos (R-18), con alta tasa de aceptación de peticiones explícitas.
- Modo de escritura creativa con estilo y vocabulario adulto sostenido a lo largo de la generación.
- Ejecución local mediante Ollama, LM Studio y llama.cpp, con soporte de un solo archivo GGUF más el proyector.
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible) y uso conversacional (etiqueta conversational).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües más allá del chino: no disponibles según los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Generación de ficción adulta en chino: el modelo está ajustado específicamente para producir narrativa explícita sin rechazos, por lo que encaja en plataformas de contenido para adultos con verificación de edad y cumplimiento legal previo.
- Asistencia a guionistas de contenido R-18: redacción de borradores y variantes de escenas, aprovechando la obediencia al prompt y la continuidad conversacional entre turnos.
- Chatbots de roleplay conversacional en chino: al mantener diálogo multi-turno y aceptar escenarios adultos, puede alimentar personajes virtuales en aplicaciones de entretenimiento para mayores de edad.
- Análisis y descripción automática de imágenes mediante mmproj: generación de pies de foto o descripciones detalladas de material visual, incluyendo contenido que otros modelos rechazarían describir.
- Red teaming y evaluación de moderación: al ser un modelo abliterado y sin alineación posterior, sirve para generar casos adversarios y probar la robustez de clasificadores de contenido y filtros de seguridad.
- Investigación sobre abliteration y ajuste fino NSFW: permite estudiar empíricamente cómo la eliminación de direcciones de rechazo afecta a la distribución de respuestas y a las capacidades generales del modelo.
- Etiquetado de datasets multimodales con contenido adulto: apoyo en la anotación de corpus de imagen-texto de dominio sensible donde los modelos alineados se niegan a colaborar.
- Despliegue local en estación de trabajo: mediante Ollama con el Modelfile incluido, permite trabajar sin enviar datos a servicios externos, lo que resulta relevante para material sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q4_K_M ocupan 16,8 GB y el proyector mmproj f16 añade 931 MB, por lo que el modelo completo ronda los 17,8 GB antes de contar caché KV y contexto. Con una ventana de contexto moderada, se recomienda reservar entre 20 GB y 24 GB de VRAM.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para ejecución completa en una sola tarjeta; A100 40 GB y H100 80 GB para mayor contexto y concurrencia. También son válidas tarjetas de 32 GB como la RTX 5090 si se quiere margen adicional de contexto.
- Cabe en GPU de consumo: sí, en modelos con 24 GB o más de VRAM. En tarjetas de 16 GB no cabe entero y requeriría offload parcial a RAM del sistema, con una penalización notable de velocidad.
- Si no se necesita visión, se puede omitir la carga del mmproj y ahorrar aproximadamente 931 MB de VRAM.
- Opciones de despliegue: Ollama (hay Modelfile incluido en el repositorio), LM Studio y llama.cpp, seleccionando el archivo mmproj en la opción de visión. El soporte en vLLM o TGI para este GGUF concreto no está documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Idioma | Notas |
|---|---|---|---|---|---|---|
| Dongfangshuo-Qwen3.8-27B-NSFW-GGUF | 27,3 B | no disponible | GGUF Q4_K_M + mmproj f16 | Apache-2.0 | zh | Versión cuantizada, 17,8 GB de repositorio, lista para Ollama |
| Dongfangshuo-Qwen3.8-27B-NSFW | 27,3 B | no disponible | safetensors (modelo base) | Apache-2.0 | zh | Mismo ajuste R-18 sin cuantizar; mayor consumo de VRAM |
| Huihui-Qwen3.8-27B-abliterated | no disponible | no disponible | no disponible | no disponible | no disponible | Predecesor sin la especialización R-18; solo se cita como origen en la model card |
| Alternativas externas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Contenido para adultos: el modelo está entrenado para producir material R-18 explícito y el repositorio lleva la etiqueta not-for-all-audiences. No debe desplegarse en productos accesibles a menores sin verificación de edad efectiva.
- Riesgo legal y normativo: la generación de contenido sexual explícito está sujeta a restricciones legales variables según jurisdicción; el cumplimiento es responsabilidad exclusiva del desplegador.
- Ausencia total de alineación: al derivar de un modelo abliterated y no aplicar métodos posteriores de RLHF o DPO, la probabilidad de respuestas dañinas, ilegales o éticamente problemáticas ante prompts inducidos es elevada.
- Alucinación: no se han publicado evaluaciones de fidelidad factual; la especialización en ficción y roleplay tiende a priorizar la coherencia narrativa sobre la exactitud.
- Sesgos: no hay documentación sobre sesgos de género, orientación sexual, etnia u otros, y el ajuste fino en un dominio estrecho puede amplificarlos.
- Idioma: los metadatos declaran únicamente chino. El rendimiento en castellano u otros idiomas no está documentado y podría degradarse respecto al modelo base.
- Contexto: se desconoce la ventana de contexto soportada, lo que impide garantizar conversaciones largas o análisis de documentos extensos.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero no exime del cumplimiento de las condiciones de uso de las plataformas de distribución ni de la legislación aplicable al contenido.
- Reputación y verificación: el repositorio tiene 176 descargas, 0 likes y ninguna evaluación independiente publicada; el identificador del modelo base (Qwen3.8-27B) no coincide con una nomenclatura oficial verificable en la información disponible.
- Capacidades no confirmadas: no hay evidencia de soporte de tool calling, agentes o modo de razonamiento extendido, por lo que no deberían asumirse en producción.
- Uso en producción: la combinación de contenido sensible, ausencia de alineación y falta de benchmarks desaconseja su empleo en aplicaciones comerciales abiertas al público general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-GGUF
- Modelo base: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW
- Perfil del autor: https://huggingface.co/dongfangshuo
- Huihui-Qwen3.8-27B-abliterated: no disponible (no se proporciona el enlace en la información recibida)
- Papers, blogs, repositorios o demos adicionales: no disponible. Las búsquedas web realizadas no devolvieron resultados relacionados con el modelo (únicamente dominios de casino sin relación con la consulta).
