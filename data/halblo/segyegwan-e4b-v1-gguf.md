# Halblo/segyegwan-e4b-v1-GGUF

## Resumen

segyegwan-e4b-v1-GGUF es una cuantizacion en formato GGUF del modelo llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic, un ajuste fino de la variante instructiva Gemma 4 E4B de Google. Lo publica el usuario Halblo y esta pensado para su uso con llama.cpp y sus derivados (llama-cli, llama-mtmd-cli), incluyendo el pipeline multimodal del modelo original. El repositorio ocupa 81,7 GB, lo que indica que incluye multiples niveles de cuantizacion del mismo modelo base.

El modelo se presenta explicitamente como un prototipo experimental: su autor lo describe como un primer intento de "experimentar con datasets pequenos y su impacto en temas mas amplios", y advierte que esta lejos del comportamiento previsto. El dato mas relevante para evaluar el riesgo es que, segun la model card, se ha entrenado exclusivamente con fuentes primarias de la RPDC (Corea del Norte), lo que condiciona de forma severa su sesgo ideologico y su utilidad general.

Los parametros reales declarados en safetensors son 7.518.069.290 (unos 7,5 mil millones), coherentes con una variante E4B de Gemma 4. La licencia es la Gemma License de Google, heredada del modelo base, con las restricciones de uso que esta implica. No se dispone de informacion sobre idiomas soportados, pipeline ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Gemma 4 E4B; el autor no detalla la arquitectura) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | multiples cuantizaciones GGUF (el repo ocupa 81,7 GB; no se detalla la lista exacta) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma License) |
| Formato de pesos | GGUF (safetensors como dato de origen de los parametros) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna del modelo base (Gemma 4 E4B) en la documentacion proporcionada, mas alla de que se trata de un modelo de lenguaje con capacidades de vision (etiquetado como vision-language-model) y de que la variante es la instructiva (sufijo -it). El ajuste fino intermedio (ultra-uncensored-heretic) sugiere un entrenamiento orientado a eliminar los rechazos y filtros de seguridad del modelo original, aunque el autor no documenta la metodologia (si fue SFT, DPO u otra tecnica).

El entrenamiento declarado por el autor de segyegwan se limita a "fuentes primarias de la RPDC", sin especificar numero de tokens, composicion del dataset ni proceso de alineacion. El autor reconoce que es un primer prototipo y que el comportamiento obtenido esta lejos del deseado. La conversion a GGUF se realizo con Unsloth, lo que garantiza compatibilidad con llama.cpp y con el pipeline multimodal llama-mtmd-cli.

## Capacidades

- Generacion de texto conversacional en formato instructivo, heredado de Gemma 4 E4B-it.
- Procesamiento multimodal de imagenes, segun el etiquetado vision-language-model y el soporte de llama-mtmd-cli indicado por el autor.
- Modo conversacional (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de plantillas de chat mediante la opcion --jinja de llama.cpp.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multilingue ni lista de idiomas.
- El ajuste "uncensored/heretic" implica ausencia o reduccion deliberada de mecanismos de rechazo, no una capacidad adicional.

## Casos de uso

- Investigacion sobre sesgo ideologico en modelos de lenguaje: el modelo permite estudiar como un corpus limitado a fuentes primarias de la RPDC moldea las respuestas de un LLM de 7,5 mil millones de parametros, comparandolo con el modelo base sin ajustar.
- Experimentacion con datasets pequenos: tal como declara el autor, sirve para medir el impacto de corpus reducidos y muy sesgados en el comportamiento de un modelo instructivo.
- Pruebas de pipelines GGUF en llama.cpp: util para validar la integracion de un modelo multimodal cuantizado con llama-mtmd-cli y plantillas Jinja.
- Analisis de robustez de filtros de seguridad: al derivar de una variante "uncensored", permite evaluar hasta que punto los mecanismos de rechazo del modelo original se pierden tras el ajuste fino.
- Docencia y divulgacion sobre riesgos de la curacion de datos: caso de estudio de como la eleccion de fuentes determina la calidad y la neutralidad de un modelo.
- Evaluacion comparativa de cuantizaciones: el repositorio de 81,7 GB permite comparar distintas cuantizaciones GGUF del mismo modelo en terminos de fidelidad y consumo de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,5 mil millones de parametros, una cuantizacion Q4_K_M requeriria aproximadamente 4,5-5 GB de VRAM; Q8_0 en torno a 8 GB; FP16 alrededor de 15 GB. Estas cifras son estimaciones basadas en el numero de parametros, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la documentacion. Por tamano, una RTX 4090 (24 GB) o una A100/H100 cubren cualquier cuantizacion con holgura.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas para cuantizaciones de 4-5 bits, y en 16 GB para cuantizaciones altas.
- Opciones de despliegue: llama.cpp (llama-cli para texto, llama-mtmd-cli para multimodal), y por compatibilidad GGUF tambien Ollama, LM Studio o llama-cpp-python; vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| segyegwan-e4b-v1-GGUF | 7,5 B | no disponible | Si (segun etiquetas) | Gemma | Prototipo experimental, entrenado solo con fuentes de la RPDC |
| llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic | no disponible | no disponible | Si | Gemma | Modelo base del que deriva; sin ajuste con corpus norcoreano |
| Gemma 4 E4B-it (original de Google) | no disponible | no disponible | Si | Gemma | Version oficial con alineacion de seguridad estandar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgo ideologico severo: el entrenamiento exclusivo con fuentes primarias de la RPDC introduce una orientacion politica y propagandistica muy marcada, incompatible con usos informativos o neutrales.
- Riesgo elevado de alucinacion y desinformacion: un corpus limitado y sesgado reduce la cobertura factual y aumenta la probabilidad de respuestas inexactas.
- Calidad declarada insuficiente: el propio autor afirma que el modelo esta "lejos del comportamiento previsto" y que es un primer prototipo.
- Ausencia de filtros de seguridad: la variante de la que deriva es "uncensored/heretic", por lo que no cabe esperar rechazos ante peticiones daninas.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google, que incluyen restricciones de uso aceptable y obligaciones de atribucion; conviene revisarlos antes de cualquier despliegue.
- Idiomas y contexto no documentados: no se puede garantizar un comportamiento correcto fuera del idioma o la longitud de contexto del modelo base.
- Sin adopcion ni validacion comunitaria: cero descargas y cero likes en el momento de la consulta, sin evaluaciones independientes.
- No apto para produccion: por su naturaleza experimental, su sesgo declarado y la falta de benchmarks, no deberia emplearse en sistemas orientados a usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Halblo/segyegwan-e4b-v1-GGUF
- Modelo base: https://huggingface.co/llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic
- Unsloth (herramienta de conversion a GGUF): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
