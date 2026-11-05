# mradermacher/Ministral-3-14B-Instruct-2512-absolute-heresy-GGUF

## Resumen

Ministral-3-14B-Instruct-2512-absolute-heresy-GGUF es una distribucion de cuantizaciones GGUF del modelo MuXodious/Ministral-3-14B-Instruct-2512-absolute-heresy, un derivado de la familia Ministral 3 de Mistral AI con tecnicas de "abliteration" o "decensoring" aplicadas para reducir los rechazos del modelo ante peticiones que el modelo original filtraria. El autor de las cuantizaciones es mradermacher, un conocido generador de quants de la comunidad, mientras que el modelo base ha sido modificado por MuXodious. El modelo cuenta con 13.506.073.600 parametros totales segun los tensores en safetensors, lo que lo situa en la categoria de 14B.

La relevancia de esta ficha radica en que ofrece un paquete listo para usar en llama.cpp y ecosistemas compatibles con GGUF, con cuantizaciones desde Q2_K (5,3 GB) hasta Q8_0 (14,5 GB), ademas de un adaptador multimodal (mmproj) que sugiere capacidades de vision heredadas del modelo base. Al estar publicado bajo licencia Apache 2.0 y soportar 11 idiomas declarados, resulta atractivo para experimentacion local y despliegues en hardware de consumo.

No obstante, conviene subrayar que se trata de un modelo derivado no oficial, sin benchmarks publicados en la informacion disponible, y cuyo proceso de abliteration puede degradar capacidades de razonamiento, seguridad y alineamiento. Esta ficha documenta exclusivamente lo que consta en la model card y los metadatos de HuggingFace, marcando como "no disponible" cualquier dato ausente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Ministral 3 de Mistral AI; detalles no publicados en la informacion disponible) |
| Parametros totales | 13.506.073.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivos mmproj separados para el componente multimodal) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base ni del derivado. Por el nombre y la familia, se trata de un transformer de la serie Ministral 3 de Mistral AI, pero no se especifican numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

Lo unico verificable es el proceso de post-entrenamiento aplicado por MuXodious: las etiquetas "heretic", "uncensored", "decensored" y "abliterated" indican una modificacion de los pesos orientada a suprimir el comportamiento de rechazo (refusal) tipico de los modelos alineados. Este tipo de intervencion suele consistir en identificar direcciones en el espacio de activaciones asociadas al rechazo y proyectarlas fuera de los pesos, aunque el autor no publica la metodologia exacta en la informacion proporcionada. mradermacher, por su parte, solo realiza la conversion a GGUF y las cuantizaciones estaticas, sin reentrenamiento adicional.

## Capacidades

- Generacion de texto conversacional multi-turno en 11 idiomas declarados (ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe).
- Capacidades multimodales: la presencia de archivos mmproj-Q8_0 y mmproj-f16 indica soporte de entrada de imagenes (vision), heredado del modelo base.
- Comportamiento "uncensored": el proceso de abliteration reduce los rechazos ante peticiones que el modelo original filtraria.
- Razonamiento y generacion de codigo: capacidades esperables en un modelo Instruct de 14B, aunque no se documentan benchmarks que las cuantifiquen.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este derivado concreto.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion local con modelos de 14B en hardware de consumo: las cuantizaciones Q4_K_M (8,3 GB) y Q4_K_S (7,9 GB) permiten ejecutar el modelo en GPUs con 12-16 GB de VRAM mediante llama.cpp u Ollama, lo que facilita probar un modelo de esta escala sin infraestructura de datacenter.
- Investigacion sobre alineamiento y seguridad: el caracter abliterated del modelo lo convierte en un caso de estudio util para analizar como la supresion de la direccion de rechazo afecta a la calidad de las respuestas, la coherencia y la tendencia a la alucinacion en dominios sensibles.
- Generacion de texto creativo sin filtros: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde los modelos alineados suelen declinar; el contexto multilingue permite trabajar en espanol, frances o aleman directamente.
- Procesamiento de documentos con imagenes en local: gracias al adaptador mmproj, se puede usar el modelo para tareas de descripcion de imagenes, extraccion de texto de capturas o analisis de diagramas en entornos air-gapped, siempre que se valide la calidad real del componente visual.
- Traduccion y asistencia multilingue: con 11 idiomas declarados, puede emplearse como asistente de traduccion o redaccion en combinaciones menos cubiertas por modelos pequenos, aunque sin garantias de calidad medidas por benchmarks.
- Prototipado rapido de chatbots conversacionales: la licencia Apache 2.0 y el formato GGUF permiten integrar el modelo en prototipos de atencion al cliente o asistentes internos sin coste de licencia, asumiendo la necesidad de filtros propios en produccion.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion mas dos mmproj, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de respuesta sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos, sin overhead de contexto):
  - Q2_K: ~5,3 GB
  - Q3_K_M: ~6,8 GB
  - IQ4_XS: ~7,6 GB
  - Q4_K_M: ~8,3 GB
  - Q5_K_M: ~9,7 GB
  - Q6_K: ~11,2 GB
  - Q8_0: ~14,5 GB
  - Componente multimodal adicional: +0,6 GB (mmproj-Q8_0) o +1,0 GB (mmproj-f16)
- GPU recomendadas: para Q4_K_M en GPU completa, una RTX 4090 (24 GB) o RTX 3090 (24 GB) ofrecen margen amplio para contexto largo; una RTX 4070 Ti Super (16 GB) o RTX 4080 (16 GB) son suficientes para Q4-Q5 con contexto moderado. Para Q8_0 se recomienda A100 40 GB, H100 o RTX 4090/3090.
- Cabe en GPU de consumo: si, desde GPUs de 8 GB con Q2_K/Q3_K_S (con contexto reducido) hasta 16-24 GB para cuantizaciones altas. En GPUs de 8 GB conviene usar offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que no se recomiendan para este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, mradermacher etiqueta Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality", sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ministral-3-14B-Instruct-2512-absolute-heresy-GGUF (este) | 13,5B | no disponible | Apache 2.0 | GGUF | Derivado abliterated con vision (mmproj), 11 idiomas, sin benchmarks publicados |
| Mistral-Nemo-Instruct-2407 (GGUF de referencia) | 12B | 128K (segun documentacion publica de Mistral) | Apache 2.0 | GGUF, safetensors | Alternativa oficial de Mistral en escala similar; contexto documentado y amplio soporte de herramientas |
| Qwen2.5-14B-Instruct (GGUF) | 14,7B | 32K nativo, extensible (segun documentacion publica de Qwen) | Apache 2.0 | GGUF, safetensors | Fuerte en codigo y matematicas; amplia comunidad de cuantizaciones |
| Llama-3.1-8B-Instruct (GGUF) | 8B | 128K (segun documentacion publica de Meta) | Llama 3.1 Community License | GGUF, safetensors | Menor tamano, mayor facilidad de despliegue, pero menos parametros y licencia con restricciones |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de mediciones directas que comparen el rendimiento de este derivado abliterated con los anteriores.

## Limitaciones y advertencias

- El proceso de abliteration puede degradar capacidades de razonamiento, coherencia y adherencia a instrucciones, ademas de aumentar la tendencia a generar contenido danino o inexacto; no hay evaluaciones publicadas que cuantifiquen esta degradacion.
- Riesgo elevado de alucinacion en dominios especializados, agravado por la ausencia de benchmarks y de documentacion sobre el entrenamiento del modelo base.
- Ausencia de filtros de seguridad efectivos: no es adecuado para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- La longitud de contexto no esta documentada en la informacion disponible; no debe asumirse la del modelo Ministral original sin verificacion.
- Aunque la licencia declarada es Apache 2.0, el modelo es un derivado no oficial de Ministral 3; conviene revisar los terminos del modelo base de Mistral AI antes de un uso comercial, ya que la licencia del derivado no necesariamente subsana obligaciones del original.
- El repositorio ocupa 94,6 GB e incluye todas las cuantizaciones; la descarga completa no es necesaria, basta con el archivo GGUF deseado y, si se usa vision, el mmproj correspondiente.
- Los archivos GGUF de gran tamano pueden estar divididos en varias partes; es necesario concatenarlas segun el procedimiento habitual de llama.cpp.
- No se garantiza la calidad del componente multimodal: el mmproj se incluye, pero no hay ejemplos ni evaluaciones de vision en la model card.
- El soporte de tool calling y de agentes no esta confirmado para este derivado; no debe asumirse en produccion sin pruebas.
- Modelo con solo 458 descargas y 4 likes en el momento de la consulta: comunidad muy reducida, lo que implica escasa validacion independiente.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/Ministral-3-14B-Instruct-2512-absolute-heresy-GGUF
- Modelo base: https://huggingface.co/MuXodious/Ministral-3-14B-Instruct-2512-absolute-heresy
- Cuantizaciones con imatrix del mismo modelo: https://huggingface.co/mradermacher/Ministral-3-14B-Instruct-2512-absolute-heresy-i1-GGUF
- Pagina de overview de mradermacher para este modelo: https://hf.tst.eu/model#Ministral-3-14B-Instruct-2512-absolute-heresy-GGUF
- Guia de uso de GGUF (README de TheBloke referenciado): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (patrocinador del autor de las cuantizaciones): https://www.nethype.de/
