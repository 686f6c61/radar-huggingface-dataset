# mradermacher/Gemory-26B-A4B-SOMPOA-GGUF

## Resumen

Gemory-26B-A4B-SOMPOA-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF, creado por el usuario mradermacher, del modelo base 26B-Suite/Gemory-26B-A4B-SOMPOA. El modelo original es un modelo de generación de texto orientado a escritura creativa, roleplay y conversación, etiquetado como abliterated (sin filtros de alineación), uncensored, multimodal y de arquitectura MoE basada en Gemma 4, resultado de un merge de modelos. La denominación "26B-A4B" indica aproximadamente 26 mil millones de parámetros totales con unos 4 mil millones activos por token.

La relevancia de esta ficha no está en el modelo en sí, sino en la disponibilidad de cuantizaciones que permiten ejecutarlo localmente: desde Q2_K (10,7 GB) hasta Q8_0 (27 GB), además de los suplementos multimodales mmproj en Q8_0 y f16. Esto lo hace accesible para GPUs de consumo de gama alta y configuraciones con CPU + GPU mixtas.

El repositorio ha registrado 983 descargas y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Existe también una versión de cuantizaciones weighted/imatrix en el repositorio hermano Gemory-26B-A4B-SOMPOA-i1-GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Gemma 4 (según etiquetas del autor) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (la denominación A4B sugiere ~4 mil millones, dato no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (según metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors, 184,9 GB el repo original) |

## Arquitectura y entrenamiento

El modelo base es un mixture-of-experts (MoE) derivado de la familia Gemma 4 según las etiquetas del autor, con unos 25,2 mil millones de parámetros totales y una fracción activa estimada de ~4 mil millones por token. En una arquitectura MoE, solo un subconjunto de expertos se activa en cada paso de decodificación, lo que permite obtener calidad cercana a un modelo denso de 26B con el coste computacional aproximado de uno de 4B, una ventaja notable en inferencia local.

Las etiquetas indican además que es un merge (fusión de pesos de varios modelos), multimodal (incluye un proyector mmproj para procesar imágenes) y abliterated mediante la técnica "heretic", que elimina las capas de rechazo del modelo sin reentrenamiento. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO. El repositorio de mradermacher es exclusivamente una conversión a GGUF con cuantizaciones estáticas, sin modificaciones de pesos.

## Capacidades

- Generación de texto conversacional, con orientación específica a escritura creativa y roleplay según las etiquetas del modelo base.
- Capacidades multimodales: los archivos mmproj (0,9 GB en Q8_0 y 1,3 GB en f16) permiten el procesamiento de imágenes junto con texto en backends compatibles con GGUF.
- Modelo abliterated/uncensored: sin mecanismos de rechazo de seguridad, lo que amplía el rango de respuestas pero implica riesgos de uso.
- Al ser un MoE de ~4B parámetros activos, debería ofrecer velocidades de generación altas en hardware de consumo, aunque no hay mediciones publicadas.
- Tool calling, agentes y capacidades de razonamiento estructurado: no disponible, sin información publicada.
- Soporte multilingüe: no disponible; los metadatos solo declaran inglés.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está etiquetado específicamente para creative-writing, roleplay y erp, con afinado orientado a personajes y diálogos largos; su tamaño activo reducido permite respuestas fluidas en tiempo real.
- Chatbots locales sin censura: al ser abliterated, puede usarse en asistentes locales donde el usuario quiere control total sobre el comportamiento, por ejemplo en interfaces tipo SillyTavern o texto-generation-webui.
- Análisis de imágenes en local: gracias al mmproj incluido, puede describir imágenes o responder preguntas visuales en pipelines locales con llama.cpp.
- Prototipado de aplicaciones LLM: la licencia Apache 2.0 y el formato GGUF facilitan integrarlo en demos y pruebas de concepto sin coste de API ni dependencia de proveedores.
- Ejecución en hardware modesto para su clase: la variante Q2_K (10,7 GB) cabe en GPUs de 12 GB o en CPU con RAM suficiente, útil para equipos sin GPU dedicada potente.
- Experimentación comparativa de cuantizaciones: el abanico completo de quants (Q2_K a Q8_0) permite estudiar el compromiso entre calidad percibida y uso de memoria en un mismo modelo.
- Generación de contenido asistida: redacción de borradores, diálogos de ficción y material creativo donde se priorice el estilo del modelo base sobre la veracidad factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un merge orientado a roleplay y escritura creativa, es probable que el modelo base no se haya evaluado en benchmarks académicos estándar, pero no se puede afirmar sin datos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contexto ni mmproj):
  - Q2_K: ~10,7 GB
  - Q3_K_M: ~13,4 GB
  - IQ4_XS: ~14,2 GB
  - Q4_K_M: ~16,9 GB (recomendada)
  - Q5_K_M: ~19,2 GB
  - Q6_K: ~22,7 GB
  - Q8_0: ~27,0 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M completas en GPU; RTX 3060 12 GB o RTX 4070 para Q2_K/Q3; para Q6_K y Q8_0, GPUs de 32 GB (por ejemplo RTX 5090, A100 40 GB) o descarga parcial en RAM.
- Consumer GPUs: sí. Una RTX 4090 ejecuta cómodamente hasta Q5_K_M; una RTX 3090 (24 GB) hasta Q4_K_M/Q5_K_S; GPUs de 12 GB solo las variantes Q2/Q3.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier backend compatible con GGUF y mmproj para la parte multimodal. vLLM y TGI no consumen GGUF directamente; para esos frameworks habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponible; al ser un MoE con ~4B parámetros activos, se espera un throughput alto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemory-26B-A4B-SOMPOA | ~25,2B | ~4B (no confirmado) | GGUF (este repo), safetensors (base) | Apache 2.0 | Roleplay, multimodal, abliterated |
| Qwen3-30B-A3B | 30,5B | 3,3B | safetensors, GGUF comunitario | Apache 2.0 | MoE generalista, benchmarks publicados, tool calling |
| Gemma 3 27B | 27B | 27B (denso) | safetensors, GGUF comunitario | Licencia Gemma (restrictiva) | Multimodal nativo, contexto 128K |
| Mistral Small 3.x 24B | 24B | 24B (denso) | safetensors, GGUF comunitario | Apache 2.0 | Generalista, buen rendimiento en código |

Gemory se diferencia de estas alternativas por su enfoque nicho (roleplay y contenido sin filtros) frente a modelos generalistas con evaluaciones públicas. Frente a Gemma 3 27B, ofrece una licencia más permisiva y menor coste de inferencia por token al ser MoE, pero sin benchmarks verificables.

## Limitaciones y advertencias

- Modelo abliterated y uncensored: elimina deliberadamente los mecanismos de rechazo de seguridad, lo que conlleva riesgo de generar contenido dañino, ilegal u ofensivo. Su uso exige responsabilidad del desplegador.
- Al ser un merge de modelos, puede heredar sesgos y patrones de todos los modelos fusionados; no hay documentación sobre el proceso de fusión en esta ficha.
- Riesgo de alucinación elevado en tareas factuales: el afinado hacia roleplay y escritura creativa suele degradar la fiabilidad en preguntas de conocimiento, código y matemáticas.
- Idioma: los metadatos solo declaran inglés; el rendimiento en castellano es desconocido y probablemente inferior.
- Longitud de contexto no documentada: no es posible garantizar ventanas grandes para conversaciones multi-turno extensas.
- La multimodalidad depende de soporte mmproj del backend (llama.cpp y derivados); no funcionará en todos los runtimes.
- Licencia Apache 2.0 sin restricciones comerciales, pero los modelos base del merge pueden tener términos propios no documentados aquí; conviene verificar el repositorio del modelo original.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan notablemente la calidad, especialmente en modelos MoE; el propio autor recomienda Q4_K_S/Q4_K_M como punto de equilibrio.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/Gemory-26B-A4B-SOMPOA-GGUF
- Modelo base: https://huggingface.co/26B-Suite/Gemory-26B-A4B-SOMPOA
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Gemory-26B-A4B-SOMPOA-i1-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#Gemory-26B-A4B-SOMPOA-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
