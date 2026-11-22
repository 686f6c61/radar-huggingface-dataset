# mradermacher/XION0.2-27B-GGUF

## Resumen

XION0.2-27B-GGUF es la distribucion en formato GGUF del modelo XION0.2-27B, desarrollado originalmente por el usuario PIXELZX y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 26.900 millones de parametros (26.895.998.464 segun los pesos en safetensors), derivado de la familia Qwen (la etiqueta del repositorio indica "qwen3.8") y sometido a un proceso de "abliteration", es decir, la eliminacion de los mecanismos de rechazo alineados, lo que se traduce en un modelo sin censura (uncensored).

El modelo esta orientado a razonamiento (reasoning), contexto largo (long-context) y conversacion multilingue, con soporte declarado para ingles, coreano, japones y chino. Incluye ademas un componente multimodal (los ficheros mmproj en el repositorio GGUF indican soporte de entrada de imagenes), lo que amplia su aplicabilidad a tareas de vision-lenguaje.

La relevancia de esta ficha radica en que el repositorio de mradermacher ofrece el modelo en hasta doce cuantizaciones GGUF distintas (desde Q2_K de 10,8 GB hasta Q8_0 de 28,7 GB), lo que permite desplegarlo en hardware de consumo con llama.cpp u Ollama, algo inviable con los pesos originales en bf16. La licencia Apache 2.0 facilita su uso comercial, aunque el caracter "abliterated" y "uncensored" exige controles adicionales en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen (etiqueta "qwen3.8"); detalles exactos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el tag "long-context" sugiere ventana extendida, sin cifra publicada) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, ademas de mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, ko, ja, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors/bf16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta "qwen3.8", que apunta a una familia transformer de Qwen con atencion estandar (no se confirma atencion lineal, SSM ni arquitectura hibrida). El modelo base PIXELZX/XION0.2-27B se distribuye en bf16 y ha sido sometido a abliteration, una tecnica que modifica los pesos para eliminar la direccion de rechazo aprendida durante el alineamiento, de ahi las etiquetas "abliterated" y "uncensored".

Respecto a los datos de entrenamiento, solo se declara el dataset saidutta69/fable-5-premium, sin que se especifiquen el numero de tokens, la composicion del corpus ni si hubo fases de RLHF o DPO. La presencia del tag "reasoning" sugiere entrenamiento orientado a cadenas de razonamiento, pero no se aportan detalles sobre el metodo. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa. Las cuantizaciones de mradermacher son estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no se han publicado variantes con imatrix en el momento de la ficha.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, coreano, japones y chino.
- Razonamiento explicito (tag "reasoning"), apto para tareas de deduccion y resolucion de problemas paso a paso.
- Procesamiento de contexto largo (tag "long-context"), sin cifra oficial de ventana maxima.
- Entrada multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que habilita el procesamiento de imagenes junto a texto en llama.cpp.
- Modo sin censura (abliterated): responde sin los filtros de rechazo tipicos de los modelos alineados.
- Compatibilidad declarada con vLLM y transformers; los GGUF son utilizables en llama.cpp, Ollama y otros runners compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque el tag "reasoning" lo hace plausible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional multilingue para mercados de Asia Oriental: el soporte nativo de coreano, japones y chino permite desplegar un unico modelo para atencion al cliente en esas regiones, con cuantizacion Q4_K_M (16,6 GB) en una GPU de 24 GB.
- Analisis de documentos extensos con imagenes: gracias al componente mmproj y al tag long-context, puede procesar informes con graficos o capturas y responder preguntas sobre ellos en local.
- Generacion de codigo y explicaciones tecnicas en un IDE local: el modelo puede ejecutarse con llama.cpp en una estacion de trabajo con RTX 4090 (24 GB) usando Q4_K_M o IQ4_XS, sin enviar codigo propietario a la nube.
- Investigacion sobre alineamiento y seguridad: al ser abliterated, sirve como objeto de estudio para medir la eficacia de las tecnicas de eliminacion de rechazo y para construir clasificadores de seguridad externos.
- Prototipado rapido de agentes conversacionales: la licencia Apache 2.0 y la disponibilidad de cuantizaciones ligeras (Q2_K, 10,8 GB) permiten iterar en hardware modesto antes de escalar a la version bf16 en vLLM.
- Traduccion y resumen de contenido tecnico entre ingles y lenguas CJK: el modelo puede resumir papers o documentacion en chino, japones o coreano y devolver la sintesis en ingles para equipos internacionales.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse totalmente en local con Ollama o llama.cpp, es adecuado para sectores regulados que no pueden usar APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~10,8 GB; Q3_K_M ~13,4 GB; IQ4_XS ~15,3 GB; Q4_K_M ~16,6 GB; Q5_K_M ~19,3 GB; Q6_K ~22,2 GB; Q8_0 ~28,7 GB (mas 0,7-1,0 GB adicionales si se usa el componente mmproj multimodal).
- GPU recomendadas: A100 40/80 GB o H100 para los pesos bf16 completos y para servir con vLLM; RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; RTX 3090 (24 GB) equivalente; GPUs de 16 GB (RTX 4080, 4070 Ti Super) para IQ4_XS o Q4_K_S.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones de hasta Q6_K, y en GPUs de 12-16 GB con Q3_K_M o IQ4_XS. Las variantes Q2_K y Q3_K_S permiten incluso configuraciones con offload parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y vLLM o TGI para el modelo base en bf16/safetensors. El tag "endpoints_compatible" indica compatibilidad con APIs de endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| XION0.2-27B-GGUF | ~26,9 B | no disponible (long-context) | Apache 2.0 | GGUF (12 cuantizaciones) | Abliterated, multimodal via mmproj, 4 idiomas |
| Qwen2.5-32B-Instruct | 32,5 B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Referencia de la familia Qwen, alineado y con benchmarks publicos |
| Gemma 2 27B | 27 B | 8.192 tokens | Gemma License | safetensors, GGUF | Tamano comparable, contexto mas corto y licencia con restricciones de uso |
| Mistral Small 24B | 24 B | 128.000 tokens | Apache 2.0 | safetensors, GGUF | Alternativa europea con contexto amplio y tool calling documentado |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento de XION0.2-27B que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Al ser un modelo abliterated y uncensored, carece de los filtros de rechazo habituales: puede generar contenido ofensivo, ilegal o peligroso, por lo que requiere moderacion externa en produccion.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados que permitan estimar su fiabilidad factual.
- Cobertura idiomatica limitada a ingles, coreano, japones y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La longitud de contexto real no se especifica; el tag "long-context" no garantiza un rendimiento estable mas alla de la ventana nativa de la familia Qwen subyacente.
- El repositorio GGUF no incluye cuantizaciones con imatrix, lo que puede reducir la calidad de las variantes de baja precision (Q2_K, Q3_K_S) frente a alternativas ponderadas.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura puede incumplir normativas sectoriales (por ejemplo, la Ley de Servicios Digitales o requisitos de moderacion en plataformas); conviene una revision legal.
- El modelo base PIXELZX/XION0.2-27B tiene escasa documentacion publica (0 likes en el repositorio GGUF, 644 descargas), lo que dificulta validar su procedencia y calidad de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/XION0.2-27B-GGUF
- Modelo base: https://huggingface.co/PIXELZX/XION0.2-27B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#XION0.2-27B-GGUF
- Dataset declarado: https://huggingface.co/datasets/saidutta69/fable-5-premium
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
