# mradermacher/OLMo-2-0325-32B-Instruct-ARA-heretic-i1-GGUF

## Resumen

OLMo-2-0325-32B-Instruct-ARA-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic, publicada por el usuario mradermacher. Se trata de una variante "abliterated" o "decensored" del modelo OLMo 2 Instruct de 32B parametros de AI2 (Allen Institute for AI), sometida a un proceso de eliminacion de rechazos (refusals) y posteriormente cuantizada con tecnicas de imatrix para facilitar su despliegue en hardware de consumo.

El modelo base parte de la arquitectura transformer densa de OLMo 2, con 32.234.279.936 parametros totales, y hereda el dataset de entrenamiento allenai/RLVR-GSM-MATH-IF-Mixed-Constraints, orientado a razonamiento matematico y seguimiento de instrucciones. La version heretic elimina los mecanismos de rechazo del modelo original, lo que lo hace adecuado para escenarios donde se requiere una respuesta sin filtros de contenido, pero con las implicaciones eticas y de seguridad que ello conlleva.

La relevancia de esta ficha radica en que combina tres capas de transformacion: el modelo base de AI2, la modificacion heretic de richardyoung y la cuantizacion GGUF de mradermacher. El resultado es un artefacto de 12 GB de tamano de repositorio, con licencia Apache 2.0, que puede ejecutarse en GPUs de consumo mediante llama.cpp u Ollama, aunque con las limitaciones de calidad propias de las cuantizaciones de baja precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de OLMo 2 de AI2) |
| Parametros totales | 32.234.279.936 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, IQ3_XXS, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XS, IQ3_S, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, small-IQ4_NL (segun lista de quants del README) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base OLMo-2-0325-32B-Instruct es un transformer denso desarrollado por AI2, con 32.234 millones de parametros. La variante heretic de richardyoung aplica tecnicas de abliteration (eliminacion de direcciones de activacion asociadas a rechazos) sobre el modelo Instruct, dando como resultado un modelo "decensored" que responde a peticiones que el original rechazaria. El dataset declarado en la model card es allenai/RLVR-GSM-MATH-IF-Mixed-Constraints, orientado a razonamiento verificable (RLVR) en matematicas y seguimiento de instrucciones mixtas.

La cuantizacion realizada por mradermacher emplea el formato GGUF con quantizaciones ponderadas por imatrix (importance matrix), lo que mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas. El README indica que se han generado tanto quants estaticos (en el repositorio hermano -GGUF) como quants i1 con imatrix (en este repositorio). No se dispone de informacion sobre el numero exacto de tokens de entrenamiento del modelo base ni sobre si se aplicaron tecnicas de RLHF o DPO adicionales en la variante heretic.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de formato instruct.
- Razonamiento matematico y resolucion de problemas tipo GSM/MATH, heredado del dataset RLVR-GSM-MATH-IF-Mixed-Constraints.
- Seguimiento de instrucciones mixtas (IF, instruction following) con constraints.
- Respuestas sin rechazos (uncensored/decensored) gracias a la modificacion heretic.
- Capacidad de ejecucion local en hardware de consumo mediante llama.cpp, Ollama y otros runners compatibles con GGUF.
- Soporte de cuantizaciones de 1 a 6 bits, incluyendo tecnicas IQ (importance-aware quantization) para mejor relacion calidad/tamano.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteration comparando respuestas con el OLMo 2 Instruct original, util para analizar que comportamientos se eliminan y cuales se preservan.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de 32B en GPUs con 24 GB de VRAM, algo inviable con los pesos en safetensors (64 GB en fp16).
- Generacion de texto creativo sin filtros: para proyectos de escritura, guion o narrativa donde se requiere explorar tematicas que los modelos alineados rechazan, con la advertencia de revision humana obligatoria.
- Razonamiento matematico en entornos offline: el modelo hereda capacidades de resolucion de problemas matematicos del dataset RLVR, y puede desplegarse en entornos air-gapped mediante llama.cpp.
- Experimentacion con cuantizaciones comparativas: el repositorio incluye una amplia gama de quants (desde IQ1_S hasta Q6_K), lo que permite estudiar la degradacion de calidad segun la precision en un modelo de 32B.
- Fine-tuning posterior sobre la variante heretic: al estar bajo licencia Apache 2.0, el modelo puede servir como base para ajustes especificos de dominio sin las restricciones de licencias no comerciales.
- Prototipado de asistentes conversacionales en ingles: con formato instruct y contexto conversacional, puede integrarse en pipelines de chat mediante llama.cpp u Ollama para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB para la cuantizacion i1-Q2_K (12,1 GB segun el README); el resto de quants no tienen tamano publicado en la informacion disponible, pero se estima entre 2 y 6 bits por parametro sobre 32B (rango aproximado de 8 a 24 GB).
- GPU recomendadas: RTX 3090, RTX 4090 (24 GB) para quants de 4 bits; A100 40/80 GB o H100 para quants de 6 bits y contexto largo.
- Cabe en GPU de consumo: si, en GPUs con 24 GB para quants Q4_K_M o IQ4_XS; en GPUs de 12-16 GB solo con quants de 2-3 bits (con degradacion de calidad).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runner compatible con GGUF. El modelo base es compatible con transformers y vLLM en formato safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OLMo-2-0325-32B-Instruct-ARA-heretic-i1-GGUF (este) | 32,2B | no disponible | Apache 2.0 | GGUF (i1) | Variante abliterated cuantizada con imatrix |
| OLMo-2-0325-32B-Instruct-ARA-heretic | 32,2B | no disponible | Apache 2.0 | safetensors | Modelo base heretic sin cuantizar |
| OLMo-2-0325-32B-Instruct (AI2) | 32,2B | no disponible | Apache 2.0 | safetensors | Modelo original alineado, con rechazos |
| mradermacher/OLMo-2-0325-32B-Instruct-i1-GGUF | 32,2B | no disponible | Apache 2.0 | GGUF (i1) | Cuantizacion del Instruct sin modificacion heretic |

## Limitaciones y advertencias

- La modificacion heretic elimina los rechazos de seguridad del modelo original, lo que implica que puede generar contenido ofensivo, danino o ilegal sin filtro. No es apto para produccion orientada al publico sin capas adicionales de moderacion.
- Riesgo elevado de alucinacion: las cuantizaciones de baja precision (IQ1, IQ2, Q2_K) degradan notablemente la coherencia y fidelidad factual; se recomienda Q4_K_M o superior para uso serio.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- La longitud de contexto no esta documentada en la informacion disponible; no se debe asumir la ventana nativa de OLMo 2 sin verificacion.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado por un modelo decensored puede infringir normativas locales o terminos de servicio de plataformas; la responsabilidad recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria de la calidad de los quants.
- El modelo no ha sido evaluado con benchmarks en la informacion disponible; no se puede afirmar su rendimiento relativo frente a alternativas.
- Al ser una cuantizacion, los pesos no son identicos al modelo base; para fine-tuning se debe usar el modelo en safetensors, no el GGUF.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mradermacher/OLMo-2-0325-32B-Instruct-ARA-heretic-i1-GGUF
- Modelo base heretic: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic
- Quants estaticos del mismo modelo: https://huggingface.co/mradermacher/OLMo-2-0325-32B-Instruct-ARA-heretic-GGUF
- Pagina de resumen de quants: https://hf.tst.eu/model#OLMo-2-0325-32B-Instruct-ARA-heretic-i1-GGUF
- Cuantizacion del Instruct sin heretic: https://huggingface.co/mradermacher/OLMo-2-0325-32B-Instruct-i1-GGUF
- Cuantizacion del stage1: https://huggingface.co/mradermacher/OLMo-2-0325-32B-stage1-6T-GGUF
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
