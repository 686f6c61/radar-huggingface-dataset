# mradermacher/Love-Aligned-31B-GGUF

## Resumen

Love-Aligned-31B-GGUF es la distribucion en formato GGUF del modelo Love-Aligned-31B, publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face. El modelo original, desarrollado por UnstableLlama, es un ajuste fino de una base de la familia Gemma 4 (segun la etiqueta "gemma4" de la model card) con 30.697.345.596 parametros (aproximadamente 31B), orientado a conversacion y alineamiento mediante DPO (Direct Preference Optimization) y LoRA. La relevancia de esta publicacion radica en que pone a disposicion de la comunidad variantes cuantizadas estaticas del modelo, desde Q2_K (12,0 GB) hasta Q8_0 (32,7 GB), lo que permite ejecutarlo en hardware de consumo que no podria cargar los pesos completos en precision alta.

El repositorio incluye tambien suplementos multimodales (mmproj) en Q8_0 y f16, lo que sugiere que el modelo base incorpora capacidad de vision, aunque la model card no detalla la arquitectura exacta ni el proceso de entrenamiento. La licencia es Apache 2.0, lo que facilita su uso comercial, y el unico idioma declarado es el ingles. Con 352 descargas y 1 like en el momento de la consulta, se trata de una publicacion reciente (creada en septiembre de 2026 y actualizada en octubre del mismo ano) y de nicho, sin benchmarks publicados en la informacion disponible.

Esta ficha describe principalmente el artefacto GGUF y sus implicaciones practicas de despliegue; los detalles de entrenamiento y evaluacion del modelo original no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, segun etiqueta "gemma4"); detalles no disponibles |
| Parametros totales | 30.697.345.596 (aproximadamente 31B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; variantes imatrix en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 213,9 GB |
| Modelo base | UnstableLlama/Love-Aligned-31B |
| Metodo de alineamiento | DPO con LoRA (segun etiquetas) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original. Las etiquetas de la model card indican "gemma4", lo que apunta a que Love-Aligned-31B se construye sobre una base de la familia Gemma 4 de Google, con aproximadamente 31B parametros. El ajuste se realizo mediante LoRA y posteriormente DPO, una tecnica de alineamiento que optimiza el modelo para preferir respuestas consideradas mejores por un conjunto de preferencias humanas o sinteticas. El resultado se orienta a uso conversacional ("conversational" en las etiquetas).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de preferencias, ni sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). Tampoco se documenta el proceso de cuantizacion mas alla de lo habitual en mradermacher: cuantizaciones estaticas generadas con llama.cpp, con la nota de que las variantes imatrix (ponderadas) estan en un repositorio separado (Love-Aligned-31B-i1-GGUF) y suelen ofrecer mejor calidad por tamano que las estaticas equivalentes. La presencia de ficheros mmproj confirma que el modelo base incluye un codificador multimodal para imagenes, aunque no se especifica su arquitectura.

## Capacidades

- Generacion de texto conversacional en ingles, con alineamiento orientado a respuestas preferidas por humanos (DPO).
- Capacidad multimodal: el repositorio incluye suplementos mmproj (Q8_0 y f16), lo que permite procesar imagenes junto con texto en llama.cpp y derivados.
- Razonamiento y respuesta multi-turno: el ajuste conversacional sugiere soporte para dialogos, aunque no hay documentacion sobre modo de pensamiento explicito.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (audio, thinking mode, etc.): no documentadas.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama usando la cuantizacion Q4_K_M (18,8 GB) para mantener dialogos multi-turno en una estacion de trabajo con GPU de 24 GB, sin depender de APIs externas.
- Prototipado de chatbots alineados: gracias al ajuste DPO, es adecuado para experimentar con tecnicas de alineamiento y comparar respuestas frente al modelo base, en entornos de investigacion con requisitos de privacidad.
- Procesamiento de documentos con imagenes: los suplementos mmproj permiten usar el modelo para tareas de pregunta-respuesta sobre capturas, diagramas o documentos escaneados, combinando texto e imagen en una sola sesion.
- Evaluacion de cuantizaciones: el repositorio ofrece un espectro amplio (Q2_K a Q8_0), lo que lo convierte en un banco de pruebas para medir la degradacion de calidad y el impacto en perplejidad segun el nivel de cuantizacion.
- Generacion de contenido asistida en ingles: redaccion de borradores, resumenes y reescritura de textos en un pipeline local, usando la variante Q5_K_M (21,9 GB) para un equilibrio entre calidad y huella de memoria.
- Despliegue en servidores con multiples usuarios: con Q8_0 (32,7 GB) en una GPU A100 40 GB o H100, se puede servir mediante llama.cpp server o vLLM (si soporta la arquitectura) para cargas de inferencia concurrentes en ingles.
- Fine-tuning posterior o investigacion de alineamiento: al estar bajo Apache 2.0 y disponible en safetensors en el repo original, sirve como punto de partida para nuevos ajustes LoRA/DPO en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: 12,0 GB de pesos; unos 14-16 GB en total con contexto moderado.
  - Q3_K_M: 15,4 GB; unos 17-19 GB en total.
  - IQ4_XS: 17,0 GB; unos 19-21 GB en total.
  - Q4_K_M: 18,8 GB; unos 21-23 GB en total.
  - Q5_K_M: 21,9 GB; unos 24-26 GB en total.
  - Q6_K: 25,3 GB; unos 27-29 GB en total.
  - Q8_0: 32,7 GB; unos 35-37 GB en total.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_S; RTX 3090 (24 GB) para Q4; A100 40 GB o H100 para Q8_0 y contextos largos; A6000 (48 GB) para Q8_0 con margen.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K y contexto reducido, con riesgo de desbordamiento a RAM.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y otros frontends compatibles con GGUF. vLLM y TGI requeririan soporte de la arquitectura Gemma 4 y no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles; dependeran de la GPU, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Love-Aligned-31B-GGUF | 30,7B | no disponible | Apache 2.0 | GGUF | Ajuste DPO sobre base Gemma 4; multimodal via mmproj; solo ingles |
| Gemma 2 27B (referencia de familia) | 27B | 8K (tipico) | Gemma license | safetensors, GGUF | Base generalista de Google; comparacion orientativa, no confirmada como ancestro directo |
| Mistral Small 24B (referencia de tamano) | 24B | 32K-128K segun version | Apache 2.0 | safetensors, GGUF | Alternativa europea de tamano similar con licencia permisiva |
| Qwen2.5 32B (referencia de tamano) | 32,5B | 32K-128K segun version | Apache 2.0 | safetensors, GGUF | Multilingue y con buen rendimiento en codigo; contexto mayor |

La comparativa es orientativa: no se dispone de benchmarks del modelo para confrontar rendimiento, y la base exacta (Gemma 4) no esta documentada en detalle. La ventaja principal de esta publicacion es la disponibilidad inmediata de cuantizaciones GGUF y los suplementos multimodales; su desventaja frente a alternativas es el soporte exclusivo de ingles y la ausencia de datos de evaluacion.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- No hay benchmarks publicados, por lo que la calidad real del ajuste DPO y su posible degradacion frente al modelo base son desconocidas.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 31B; sin evaluacion no se puede acotar su magnitud.
- El ajuste DPO puede introducir sesgos hacia estilos de respuesta concretos ("love-aligned") no documentados; se desconoce la composicion del dataset de preferencias.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior, o las variantes imatrix del repositorio i1.
- El repositorio ocupa 213,9 GB en total; descargar solo el fichero necesario para evitar consumo excesivo de disco.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de la base Gemma 4 subyacente, ya que los terminos de la familia Gemma pueden imponer restricciones adicionales al uso comercial.
- No hay informacion sobre tool calling ni soporte de agentes; no asumir estas capacidades en produccion sin validacion previa.
- El soporte multimodal depende de los ficheros mmproj y de la version de llama.cpp; la integracion puede requerir configuracion adicional.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Love-Aligned-31B-GGUF
- Modelo base: https://huggingface.co/UnstableLlama/Love-Aligned-31B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Love-Aligned-31B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Love-Aligned-31B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
