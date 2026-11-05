# mayerdenf30/Qwen3.8-Flash

## Resumen

Qwen3.8-Flash es una compilación GGUF publicada por el usuario mayerdenf30 que parte de las cuantizaciones oficiales GSQ-RCO del modelo ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF. Se trata de una variante "abliterated" (sin dirección de rechazo) construida mediante un transplante de tensores: se sustituyen 144 tensores de proyección de escritura al flujo residual, distribuidos en las 48 capas del modelo, por los correspondientes de una versión abliterated ya existente. Los valores y escalas aprendidos por GSQ no se recalculan y la asignación de tipos por tensor del modelo original se restaura de forma exacta.

El modelo resultante es un transformer de tipo mezcla de expertos (MoE) con 176.943.899.520 parámetros totales según los safetensors del repositorio base, orientado a contexto largo (262K tokens), razonamiento y uso conversacional, y con soporte declarado de entrada imagen-texto a texto. Los idiomas declarados son inglés y chino. La licencia es Apache 2.0.

Su relevancia es doble: por un lado, ofrece una ruta de cuantización de bajo coste (los distintos niveles añaden solo entre 0,25 y 0,44 GB sobre el modelo upstream) para un MoE de gran tamaño; por otro, el proceso de abliteration sobre pesos ya cuantizados es poco habitual y está documentado con verificación por tensor mediante blake2b en la variante IQ3_S. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño total es de 217,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun tags del repositorio; detalles de capas y atencion no disponibles |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | IQ3_S, IQ3_XXS, IQ2_XS, Q2_0 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria llama-cpp) |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo base como un MoE de 48 capas, con 176.943.899.520 parametros totales y una ventana de contexto de 262K tokens. No se especifican en la documentacion proporcionada el numero de parametros activos por token, la relacion de expertos, el tipo de atencion (completa, lineal o hibrida) ni los detalles del tokenizador. El pipeline declarado es image-text-to-text, lo que indica soporte de entradas multimodales de imagen y texto, aunque no se detalla la arquitectura del codificador visual.

El proceso de creacion de esta ficha es un transplante de tensores sobre una cuantizacion ya realizada. El upstream ISTA-DASLab aplica GSQ (una cuantizacion aprendida) junto con RCO, una asignacion de tipos por tensor sujeta a un presupuesto de tamano. Sobre esa base, el autor sustituye 144 tensores de proyeccion de escritura al flujo residual en las 48 capas por los de una release abliterated ya existente, sin recalcular escalas ni valores GSQ y restaurando la asignacion de tipos original. La build IQ3_S se verifica tensor a tensor con blake2b para confirmar que solo cambian los tensores previstos. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento multi-paso, segun los tags "reasoning" y "long-context" del repositorio.
- Procesamiento de contexto largo: hasta 262.144 tokens.
- Entrada multimodal imagen-texto a texto (pipeline image-text-to-text declarado).
- Comportamiento "uncensored" / abliterated: se ha eliminado la direccion de rechazo, por lo que el modelo no aplica las negativas tipicas del modelo alineado original.
- Uso previsto en red-teaming segun los tags del autor.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Red-teaming y evaluacion de robustez: el modelo esta explicitamente etiquetado para red-teaming; al carecer de direccion de rechazo, sirve para probar defensas, filtros de salida y clasificadores de seguridad frente a peticiones que un modelo alineado rechazaria.
- Analisis de documentos extensos: con 262K tokens de contexto puede ingerir informes, expedientes o bases de codigo completas en una sola pasada, util para resumen y extraccion de entidades en ingles y chino.
- Investigacion sobre cuantizacion: al preservar las escalas GSQ y la asignacion de tipos RCO, es un caso de estudio para medir el impacto de la abliteration sobre pesos cuantizados sin reentrenamiento.
- Asistencia conversacional en ingles y chino: para prototipos de chat multi-turno donde se requiera contexto largo y no sea critico el filtrado de contenido.
- Despliegue local con llama.cpp: los niveles Q2_0 (38,0 GB) e IQ3_S (55,1 GB) permiten ejecucion en estaciones de trabajo con suficiente VRAM o RAM, sin depender de APIs externas.
- Experimentacion multimodal: al declarar pipeline image-text-to-text, puede emplearse para pruebas de descripcion de imagenes y preguntas sobre documentos escaneados, siempre que la build GGUF conserve el proyector visual (no confirmado en la informacion disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el nivel Q2_0 ocupa 38,0 GB y el IQ3_S 55,1 GB en disco; la VRAM necesaria para inferencia es del mismo orden, mas overhead de contexto KV, que con 262K tokens puede ser muy elevado y no esta cuantificado en la informacion disponible.
- GPU recomendadas: para IQ3_S se requiere al menos una GPU con 80 GB (A100 80GB, H100 80GB) o reparto entre varias; para Q2_0, configuraciones de 48 GB (A6000, L40S) o superiores.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) a estos niveles de cuantizacion; seria necesario offload a RAM del sistema con llama.cpp, con latencia muy alta.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; vLLM y TGI no estan confirmados para este formato concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash (esta ficha) | 176,9 B (MoE) | 262K | Apache 2.0 | GGUF | Abliterated sobre cuantizacion GSQ-RCO |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 176,9 B (MoE) | 262K | Apache 2.0 | GGUF | Upstream sin abliteration |
| SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | no disponible | no disponible | no disponible | GGUF | Release abliterated de la que proceden los tensores |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina la direccion de rechazo, por lo que el modelo puede generar contenido danino, ilegal o sexualmente explicito; no es apto para produccion orientada al publico sin capas de moderacion externas.
- El transplante de tensores se realiza sobre pesos ya cuantizados; aunque la build IQ3_S esta verificada con blake2b, no se documenta verificacion equivalente para IQ3_XXS, IQ2_XS y Q2_0.
- Riesgo de alucinacion no evaluado: no hay benchmarks publicados que cuantifiquen la degradacion respecto al modelo original.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- El contexto de 262K implica un coste de memoria KV muy alto; en configuraciones de una sola GPU puede no ser utilizable a maxima longitud.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-05): no hay evidencia de uso comunitario ni validacion independiente.
- Aunque la licencia es Apache 2.0, el cumplimiento de las condiciones del modelo base y de la release abliterated de origen debe verificarse antes de un uso comercial.
- No se confirma que la build GGUF conserve el proyector visual pese al pipeline image-text-to-text declarado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mayerdenf30/Qwen3.8-Flash
- Modelo base: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Release abliterated de origen (referenciada en la model card): https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- README en chino: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Paper referenciado (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper referenciado (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
