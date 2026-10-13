# mlx-community/LFM2.5-24B-A2B-Preview-8bit

## Resumen

LFM2.5-24B-A2B-Preview-8bit es una conversion a formato MLX del modelo LFM2.5-24B-A2B-Preview desarrollado originalmente por Liquid AI, Inc. y publicado por el usuario lq-preview. Se trata de un modelo de generacion de texto con arquitectura Mixture of Experts (etiqueta `lfm2_moe`), con 23.971.587.712 parametros totales segun los pesos en safetensors y una ventana de contexto configurada de 131.072 tokens. La nomenclatura "A2B" del nombre sugiere del orden de 2.000 millones de parametros activos por token, aunque ese dato no se confirma explicitamente en la informacion disponible.

La relevancia de esta ficha concreta es que no se trata del modelo original, sino de una cuantizacion afin de 8 bits con tamano de grupo 64, realizada con la CLI de MLX-VLM sobre un Apple M3 Ultra y publicada de forma identica en las organizaciones `mlx-community` y `nativ-community`. Esto permite ejecutar un modelo MoE de casi 24.000 millones de parametros en hardware Apple Silicon con memoria unificada, con un peso total de 25,47 GB (decimal), en lugar de requerir los aproximadamente 48 GB que ocuparian los pesos en BF16.

El modelo esta orientado a generacion de texto y conversacion, soporta plantilla de chat y genera razonamiento antes de la respuesta final, por lo que necesita un presupuesto de tokens de salida generoso. Los idiomas declarados son ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano. La licencia es la LFM Open License v1.0, que se hereda del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (etiqueta `lfm2_moe`, familia LFM2.5) |
| Parametros totales | 23.971.587.712 (23,97 B) segun safetensors |
| Parametros activos | no disponible (la nomenclatura "A2B" del nombre apunta a ~2 B activos, sin confirmacion en la informacion proporcionada) |
| Longitud de contexto | 131.072 tokens (limite indicado en la configuracion de origen) |
| Tipos de cuantizacion | Afin weight-only de 8 bits, tamano de grupo 64; proyecciones del router en afin 8 bits (grupo 64); pesos no cuantizados en BF16; sesgos de enrutamiento de expertos en FP32 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | lfm1.0 (LFM Open License v1.0), etiquetada como `license: other` |
| Formato de pesos | safetensors para MLX (libreria `mlx`); no se publican GGUF ni otros formatos en este repositorio |
| Tamano del repositorio | 25,5 GB (25,47 GB de pesos en decimal) |
| Modelo base | lq-preview/LFM2.5-24B-A2B-Preview (revision `f772950ce6f17d35af5469d00334b61a9c2fc034`) |
| Fecha de creacion | 2026-10-13 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos, identificada por la etiqueta `lfm2_moe` y perteneciente a la familia LFM2.5. El detalle de la configuracion interna (numero de capas, dimension del modelo, numero de expertos, estrategia de enrutamiento, uso de atencion lineal o hibrida) no se detalla en la informacion proporcionada. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias: estos datos corresponderian a la model card del modelo original de Liquid AI, que no forma parte de la informacion disponible.

Lo que si se documenta con detalle es el proceso de cuantizacion. Se aplico cuantizacion afin weight-only de 8 bits con tamano de grupo 64, incluyendo las proyecciones del router con el mismo esquema. Los pesos que no se cuantizan permanecen en BF16 y los sesgos de enrutamiento de expertos en FP32, una decision habitual para preservar la precision del enrutamiento, que es especialmente sensible en modelos MoE. La conversion se realizo con `mlx_vlm convert` sobre un Apple M3 Ultra y se recargo con coincidencia estricta de pesos. Como verificacion se comprobo que prefill y decodificacion con cache producian logits finitos y que dos generaciones greedy cortas devolvian "Paris" y "391" alcanzando EOS; el propio autor advierte que son pruebas de humo y no una evaluacion de calidad ni un benchmark de contexto largo.

Una innovacion relevante de cara al uso practico es que el modelo genera un bloque de razonamiento antes de la respuesta final, es decir, incorpora un modo de pensamiento que consume tokens de salida. El template de chat incluido debe respetarse para que este comportamiento funcione correctamente.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de contexto de 131.072 tokens.
- Razonamiento explicito previo a la respuesta final (bloque de pensamiento), activado mediante la plantilla de chat.
- Capacidades multilingues en diez idiomas declarados: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano.
- Aritmetica y tareas de conocimiento basico verificadas de forma superficial en las pruebas de humo de la conversion (respuestas "Paris" y "391").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision: el repositorio incluye la etiqueta `mlx-vlm`, pero la model card afirma explicitamente que se trata de un modelo de generacion de texto; no se documentan capacidades multimodales en la informacion disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistentes conversacionales de contexto largo: con 131.072 tokens de ventana, el modelo puede mantener conversaciones apoyadas en documentos extensos (informes, expedientes, bases de codigo) sin trocear el contexto en multiples llamadas.
- Analisis de documentacion tecnica multilingue: al cubrir diez idiomas, es adecuado para resumir y comparar documentacion redactada en ingles, aleman, frances, japones o chino dentro de un mismo flujo de trabajo.
- Prototipado y evaluacion local en Apple Silicon: al estar cuantizado a 8 bits y publicado en formato MLX, permite probar un MoE de ~24 B de parametros en un Mac con memoria unificada suficiente, sin depender de GPUs dedicadas ni de servicios en la nube.
- Generacion de borradores con traza de razonamiento: el modo de pensamiento previo a la respuesta es util en tareas donde interesa auditar el razonamiento intermedio, como analisis de casos o resolucion de problemas con justificacion.
- Traduccion y adaptacion de contenido entre los idiomas soportados: uso directo para localizacion de textos entre pares como espanol-portugues, frances-aleman o ingles-japones, con la salvedad de que no hay evaluacion de calidad publicada.
- Extraccion y estructuracion de informacion de textos largos: el contexto amplio permite procesar contratos o articulos completos en una sola pasada y devolver resumenes o campos estructurados.
- Experimentacion en investigacion sobre modelos MoE y cuantizacion: el repositorio documenta el comando exacto de conversion, la revision fijada del modelo base y las versiones de herramientas, lo que facilita reproducir el proceso y comparar variantes de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe pruebas de humo de la conversion (logits finitos, dos generaciones greedy cortas correctas y alcance de EOS) y advierte explicitamente de que no constituyen una evaluacion de calidad ni una prueba de contexto largo. Tampoco se proporcionan cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni datos de latencia o throughput. No se deben asumir valores procedentes de otros modelos de la familia.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos ocupan 25,47 GB en decimal. Sumando cache KV y asignaciones temporales, conviene disponer de al menos 32 GB de memoria unificada, y se recomienda 48 GB o mas para contexto largo y margen de seguridad.
- Plataforma: al ser una conversion MLX, la inferencia esta pensada para Apple Silicon. La conversion se realizo y probo en un Apple M3 Ultra; son adecuados equipos con M3 Max, M3 Ultra, M4 Max o M4 Ultra con 48 GB o mas de memoria unificada.
- GPU NVIDIA: no hay soporte documentado para CUDA en este repositorio. Una RTX 4090 con 24 GB de VRAM no puede alojar los 25,47 GB de pesos sin offloading, y en cualquier caso el formato MLX no es compatible con ese flujo.
- Cabe en GPU de consumo: no en el sentido de GPU dedicada de consumo. Si cabe en equipos Apple Silicon de gama alta con memoria unificada amplia.
- Opciones de despliegue: `mlx_vlm` (version probada con el puerto LFM2.5 del PR #2505 de MLX-VLM, commit `a6c7313bc053e5887616fa850808d21576eddf98`, MLX 0.32.3 y Transformers 5.17.0). No se documentan opciones para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada para comparar este modelo con alternativas de la misma categoria. No se han facilitado cifras de parametros activos, contexto, benchmarks ni licencia de otros modelos MoE contemporaneos, y no se deben inferir a partir del nombre del modelo ni de datos de memoria.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-Preview-8bit (esta ficha) | 23,97 B | no disponible | 131.072 tokens | lfm1.0 | MLX (safetensors) en `mlx-community` y `nativ-community` |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Se trata de una version "Preview": el modelo base puede cambiar y la revision concreta convertida esta fijada a `f772950ce6f17d35af5469d00334b61a9c2fc034`, por lo que conviene anclar ese identificador en produccion.
- La calidad no esta evaluada. Las unicas comprobaciones publicadas son pruebas de humo de la conversion, sin benchmarks de razonamiento, codigo, matematicas ni contexto largo.
- Riesgo de alucinacion: inherente a los modelos generativos de este tipo y no cuantificado en la documentacion disponible. No hay datos publicados sobre tasas de fidelidad factual.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o comportamiento diferencial por idioma.
- Cobertura idiomatica: los diez idiomas declarados no incluyen otras lenguas del Estado, como el catalan, el gallego o el euskera. El rendimiento relativo entre idiomas no esta medido.
- Consumo de tokens de salida: al generar razonamiento antes de la respuesta, el modelo necesita un presupuesto de salida amplio; una configuracion de `max-tokens` baja puede truncar la respuesta antes de que llegue a la conclusion.
- Restricciones de licencia: los pesos se rigen por la LFM Open License v1.0 (etiquetada como `license: other`). Las condiciones concretas de uso comercial no se detallan en la informacion proporcionada y deben consultarse en el fichero LICENSE antes de cualquier despliegue productivo. Las modificaciones de conversion y cuantizacion se describen en el fichero NOTICE.
- Limitacion de plataforma: el artefacto es especifico de MLX y no es portable a otros runtimes sin reconversion. La cuantizacion de 8 bits con grupo 64 introduce una perdida de precision no cuantificada frente a los pesos BF16 originales.
- Sin soporte ni mantenimiento documentado: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y no se documentan canales de soporte.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-8bit
- Copia identica en otra organizacion: https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-8bit
- Modelo base: https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- Repositorio MLX-VLM (PR #2505, puerto de LFM2.5): https://github.com/Blaizzy/mlx-vlm/pull/2505
- Fichero de licencia LFM Open License v1.0: LICENSE (dentro del repositorio)
- Detalles de la conversion (`conversion_info.json`) y avisos de modificacion (NOTICE): incluidos en el repositorio
- Busqueda web: no se han encontrado resultados relevantes. Los enlaces devueltos por la busqueda no guardan relacion con el modelo ni con Liquid AI, por lo que no se incluyen papers, blogs ni demos adicionales.
