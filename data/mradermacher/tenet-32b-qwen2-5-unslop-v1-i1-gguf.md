# mradermacher/Tenet-32B-Qwen2.5-Unslop-v1-i1-GGUF

## Resumen
Tenet-32B-Qwen2.5-Unslop-v1-i1-GGUF es una cuantizacion en formato GGUF del modelo Tenet-32B-Qwen2.5-Unslop-v1, desarrollado originalmente por el usuario mr-andrey-isachenko y empaquetado por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp. El modelo base parte de Qwen2.5-32B y ha sido sometido a un proceso de "unslop" (limpieza de sesgos y estilos de respuesta genericos) junto con tecnicas de abliteration y entrenamiento con GRPO, orientado a uso agentico, tool-use y generacion de codigo.

La relevancia de esta ficha radica en que ofrece un modelo de 32.7 mil millones de parametros con licencia Apache 2.0, cuantizado con imatrix para reducir el impacto en calidad, y disponible en un amplio rango de tamanos (desde 7.4 GB en IQ1_S hasta 27 GB en Q6_K). Esto permite desplegarlo en hardware de consumo y en entornos de produccion con vLLM o llama.cpp, manteniendo capacidades de razonamiento, codigo y conversacion multirround.

El modelo esta pensado para desarrolladores que necesitan un LLM sin censura excesiva ("uncensored"), con soporte para function calling y flujos multi-paso, y que valoran la posibilidad de ejecutarlo localmente o en infraestructura propia sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-32B) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF: i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; tambien disponibles quants estaticos en el repo hermano |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix incluido); el modelo base en safetensors |

## Arquitectura y entrenamiento
El modelo base es un transformer decoder-only derivado de Qwen2.5-32B, con 32.7 mil millones de parametros. El proceso de creacion incluye varias etapas documentadas en los tags del repositorio: "unslop" (eliminacion de respuestas genericas y sesgos de estilo), "abliterated" (eliminacion de la direccion de rechazo en el espacio de activaciones para reducir censura), y entrenamiento con GRPO (Group Relative Policy Optimization), una variante de RLHF/RL que optimiza respuestas mediante comparacion de grupos. Tambien se menciona el uso de FP8 y compatibilidad con vLLM y OpenRouter, lo que sugiere que el modelo fue disenado para despliegue eficiente en produccion.

La cuantizacion i1-GGUF utiliza un archivo imatrix (matriz de importancia) generado a partir de datos de calibracion, lo que permite que los quants de baja precision preserven mejor la calidad que los quants estaticos equivalentes. El repositorio incluye 24 variantes de cuantizacion, desde IQ1_S (7.4 GB) hasta Q6_K (27.0 GB), con notas del autor sobre calidad relativa (por ejemplo, IQ3_S "beats Q3_K*", Q4_K_M "fast, recommended").

## Capacidades
- Generacion de texto conversacional en ingles, con estilo limpio tras el proceso de "unslop".
- Razonamiento multi-paso y agentic reasoning, segun los tags "agentic" y "multi-step".
- Tool calling / function calling, con tag explicito "tool-use".
- Generacion de codigo, con tag "coding".
- Modo sin censura ("uncensored", "abliterated") que reduce rechazos en temas sensibles.
- Compatibilidad con vLLM y OpenRouter para despliegue en produccion.
- Capacidades multilingues limitadas: solo se declara ingles ("en").
- No se mencionan capacidades de vision, audio ni thinking mode explicito en la informacion disponible.

## Casos de uso
- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en ingles con un tono controlado gracias al proceso de unslop, y su licencia Apache 2.0 permite integrarlo en productos comerciales sin restricciones de atribucion.
- Generacion de codigo en produccion: con soporte de tool calling y compatibilidad con vLLM, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests, usando la cuantizacion Q4_K_M (20 GB) en una GPU de 24 GB.
- Agentes autonomos: los tags "agentic" y "multi-step" indican que el modelo puede encadenar llamadas a herramientas y razonar sobre resultados intermedios, adecuado para orquestacion de tareas con LangChain o similares.
- Despliegue local en estaciones de trabajo: la variante IQ4_XS (17.8 GB) cabe en una RTX 4090 de 24 GB, permitiendo inferencia privada sin conexion a APIs externas.
- Investigacion sobre alineacion y censura: al ser un modelo abliterated, sirve para estudiar el comportamiento de modelos sin capas de rechazo, comparando respuestas con el Qwen2.5 original.
- Prototipado rapido con llama.cpp u Ollama: las variantes IQ2_M (11.4 GB) o Q3_K_M (16 GB) permiten ejecutar el modelo en GPUs de gama media (16 GB) para pruebas de concepto.
- Fine-tuning posterior: al estar disponible el modelo base en safetensors con licencia Apache 2.0, se puede ajustar con LoRA o QLoRA para dominios especificos y luego cuantizar de nuevo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - IQ1_S: ~7.4 GB
  - IQ2_M: ~11.4 GB
  - IQ3_M: ~14.9 GB
  - IQ4_XS: ~17.8 GB
  - Q4_K_M: ~20.0 GB
  - Q5_K_M: ~23.4 GB
  - Q6_K: ~27.0 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o IQ4_XS; RTX 3090 (24 GB) similar; A100 40 GB o H100 para Q6_K con contexto largo; GPUs de 16 GB (RTX 4080, 4070 Ti Super) para IQ2_M o Q3_K_M con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB con cuantizaciones IQ2/IQ3.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, vLLM (mencionado en tags, aunque para GGUF se requiere backend compatible), TGI no confirmado para GGUF; el modelo base en safetensors es compatible con transformers y vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-32B-Qwen2.5-Unslop-v1-i1-GGUF | 32.7B | no disponible | Apache 2.0 | GGUF (24 quants) | Unslop + abliterated + GRPO, agentic |
| Qwen2.5-32B-Instruct | 32.7B | 128K (segun Qwen2.5) | Apache 2.0 | safetensors, GGUF | Modelo base oficial, con alineacion estandar |
| Qwen2.5-Coder-32B-Instruct | 32.7B | 128K (segun Qwen2.5) | Apache 2.0 | safetensors, GGUF | Especializado en codigo, sin abliteration |
| Llama-3.3-70B-Instruct | 70B | 128K | Llama 3.3 Community License | safetensors, GGUF | Mayor tamano, requiere mas VRAM, licencia restrictiva |

La comparativa se basa en caracteristicas conocidas de los modelos; no se dispone de benchmarks del Tenet-32B para comparar rendimiento numerico.

## Limitaciones y advertencias
- Solo soporta ingles segun la model card; el uso en castellano puede degradar la calidad.
- Al ser un modelo abliterated y uncensored, puede generar contenido sensible, ofensivo o inseguro sin filtros; requiere moderacion externa en produccion.
- Riesgo de alucinacion inherente a los LLM de 32B, especialmente en tareas de razonamiento complejo o datos factuales.
- La longitud de contexto no esta documentada en la informacion disponible; no se debe asumir 128K solo por heredar de Qwen2.5.
- Las cuantizaciones IQ1 e IQ2 tienen calidad reducida (el autor las marca como "for the desperate" o "mostly desperate"); no recomendadas para produccion.
- Aunque la licencia es Apache 2.0, el modelo base incluye tecnicas de abliteration que pueden violar los terminos de uso del modelo original Qwen2.5 si se redistribuye sin revisar; verificar compliance.
- El repositorio tiene 351.5 GB y 24 archivos GGUF; la descarga completa es costosa, conviene seleccionar solo la variante necesaria.
- No hay garantias de soporte ni mantenimiento por parte del autor original ni del cuantizador.

## Enlaces
- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/Tenet-32B-Qwen2.5-Unslop-v1-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Tenet-32B-Qwen2.5-Unslop-v1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-32B-Qwen2.5-Unslop-v1
- Pagina de overview del cuantizador: https://hf.tst.eu/model#Tenet-32B-Qwen2.5-Unslop-v1-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de quants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
