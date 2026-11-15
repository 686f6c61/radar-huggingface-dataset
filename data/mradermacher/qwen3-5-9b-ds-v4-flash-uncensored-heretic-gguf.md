# mradermacher/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-GGUF

## Resumen

Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-GGUF es una distribucion de pesos cuantizados en formato GGUF generada por mradermacher a partir del modelo prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic. Se trata de una variante "abliterated/heretic" y "uncensored" de un modelo de la familia Qwen3.5 de 9.197.093.888 parametros (aproximadamente 9,2 mil millones), orientada a generacion de texto, razonamiento, matematicas e instrucciones, con capacidad multimodal segun los ficheros mmproj incluidos en el repositorio.

El modelo base combina, segun sus etiquetas, componentes de Qwen3.5 y DeepSeek-v4 (etiquetas "deepseek-v4", "v3.0", "flash", "sft"), aunque la model card no documenta la composicion exacta del entrenamiento ni los datos utilizados. El autor de la cuantizacion, mradermacher, es un conocido distribuidor de cuantizaciones GGUF de terceros; no es el desarrollador original del modelo. La relevancia actual radica en que permite ejecutar un modelo de ~9B en hardware de consumo mediante llama.cpp u Ollama, con variantes desde Q2_K (4,0 GB) hasta f16 (18,5 GB).

La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque la naturaleza "uncensored/heretic" implica que se han eliminado o reducido los mecanismos de rechazo del modelo original, con las implicaciones eticas y de seguridad que ello conlleva. El repositorio tiene un tamano de 51,8 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, por lo que se trata de una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas indican transformers; sin detalle de transformer/MoE/SSM) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16; mmproj-Q8_0 y mmproj-f16 (multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en bf16 segun etiquetas |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Las etiquetas del repositorio indican "transformers" como libreria, "mtp" (multi-token prediction), "sft" (supervised fine-tuning), "reasoning", "math", "flash" y "deepseek-v4", lo que sugiere un modelo derivado de la familia Qwen3.5 con posibles influencias o destilacion de DeepSeek-v4 y ajuste supervisado. No se especifica si se trata de un transformer denso o de una arquitectura MoE, ni el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF/DPO.

El aspecto mas relevante desde el punto de vista tecnico es el proceso de "abliteration/heretic" (etiquetas "abliterated", "heretic", "uncensored", "decensored"), que consiste en modificar los pesos para eliminar la direccion de rechazo aprendida durante el alineamiento, reduciendo la tasa de negativas del modelo ante peticiones que el modelo original rechazaria. No se documenta la metodologia exacta ni el impacto cuantificado sobre capacidades y seguridad. La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type: hf, output_tensor_quantised: 1), e incluye quants con imatrix en un repositorio separado (-i1-GGUF).

## Capacidades

- Generacion de texto conversacional e instrucciones (etiqueta "instruction-following", "conversational").
- Razonamiento y matematicas (etiquetas "reasoning", "math").
- Capacidad multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que habilita entrada de imagenes en llama.cpp.
- Prediccion multi-token (etiqueta "mtp"), potencialmente orientada a decodificacion especulativa o generacion acelerada.
- Modo "uncensored/decensored": reduce los rechazos ante contenido sensible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente; la etiqueta "reasoning" sugiere capacidad de razonamiento, sin detalle.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Thinking mode explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en hardware de consumo: con quants Q4_K_M (5,9 GB) o Q4_K_S (5,6 GB) el modelo cabe en GPUs de 8 GB o en CPU con RAM suficiente, permitiendo asistentes privados sin conexion. Es adecuado por su tamano de ~9B y su formato GGUF listo para llama.cpp.
- Analisis de documentos e imagenes en local: los ficheros mmproj permiten procesar capturas, diagramas o documentos escaneados junto con texto, util para extraccion de informacion en entornos con requisitos de privacidad.
- Razonamiento matematico y resolucion de problemas: las etiquetas "math" y "reasoning" lo orientan a tareas de calculo, explicacion paso a paso y verificacion de resultados en entornos educativos o de analisis.
- Generacion de codigo asistida en local: aunque no se documenta tool calling, puede usarse como asistente de programacion en editores con integracion llama.cpp, sin enviar codigo a servicios externos.
- Investigacion sobre alineamiento y seguridad: la variante "heretic/abliterated" es util para estudiar como cambia el comportamiento del modelo al eliminar la direccion de rechazo, comparando con el modelo original.
- Prototipado de chatbots sin filtros editoriales: para aplicaciones creativas (ficcion, guiones, role-play) donde los rechazos del modelo alineado resultan limitantes, con la advertencia de que requiere supervision humana.
- Despliegue en pipelines de CI/CD o entornos air-gapped: al ser GGUF y Apache 2.0, puede integrarse en contenedores sin dependencias de API externas, con llama.cpp o servidores compatibles con la API de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K (4,0 GB): ~5-6 GB de VRAM.
  - Q3_K_M (4,8 GB): ~6-7 GB de VRAM.
  - Q4_K_M (5,9 GB): ~7-8 GB de VRAM.
  - Q6_K (7,7 GB): ~9-10 GB de VRAM.
  - f16 (18,5 GB): ~20 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (24 GB) para quants altos y contexto largo; A100/H100 solo si se busca throughput alto o f16 con contexto extenso.
- Cabe en GPU de consumo: si, con quants Q2_K a Q6_K en GPUs de 8-16 GB; Q4_K_M es el punto de equilibrio recomendado por el autor ("fast, recommended").
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con text-generation-inference/endpoints_compatible; el repo incluye etiquetas para llama-cpp y text-generation-inference.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-DS-v4-Flash-uncensored-heretic (este) | ~9,2B | no disponible | Apache 2.0 | GGUF | Variante uncensored/abliterated, multimodal via mmproj, solo ingles |
| Modelo base prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic | ~9,2B | no disponible | Apache 2.0 | safetensors/bf16 | Mismo modelo sin cuantizar; referencia para comparar efectos de la cuantizacion |
| Familia Qwen3 8B/9B (original) | ~8-9B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo alineado de referencia; rechaza contenido sensible que esta variante acepta |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | safetensors, GGUF | Alternativa densa de tamano similar, multilingue y ampliamente soportada |

No se dispone de datos de benchmarks para establecer una comparacion cuantitativa de rendimiento con estas alternativas.

## Limitaciones y advertencias

- Modelo "uncensored/heretic": se han reducido o eliminado los mecanismos de rechazo, por lo que puede generar contenido danino, ilegal o sesgado; requiere filtros externos y supervision humana en produccion.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; como modelo de ~9B, es propenso a inventar datos en tareas factuales.
- Solo soporta ingles segun el campo language; el rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga sin verificar en el modelo base.
- La cuantizacion introduce perdida de calidad, especialmente en Q2_K y Q3; el autor recomienda Q4_K_M o superior.
- Licencia Apache 2.0 declarada, pero el cumplimiento depende del modelo base y de los datos de entrenamiento originales, no verificables en esta ficha.
- Repositorio sin descargas ni validacion comunitaria (0 descargas, 0 likes); no hay evidencia independiente de calidad.
- La model card no documenta tool calling, contexto, arquitectura ni benchmarks; cualquier uso en produccion exige evaluacion propia.
- El termino "heretic" hace referencia a una tecnica de modificacion de pesos; su efecto sobre el resto de capacidades no esta cuantificado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic
- Quants con imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
