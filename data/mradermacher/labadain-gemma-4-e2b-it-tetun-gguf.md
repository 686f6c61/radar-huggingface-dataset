# mradermacher/Labadain-Gemma-4-E2B-it-Tetun-GGUF

## Resumen

Labadain-Gemma-4-E2B-it-Tetun-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Labadain-Gemma-4-E2B-it-Tetun, publicado por el usuario mradermacher en Hugging Face. El modelo base es un ajuste fino (fine-tuning) del modelo Gemma de Google, orientado a conversacion (etiqueta "conversational") y especializado en tetun, la lengua oficial de Timor Oriental. El repositorio no incluye model card propia mas alla de los metadatos de la conversion: la unica documentacion disponible remite al modelo original del que deriva.

El modelo base cuenta con 4.647.450.147 parametros totales segun los pesos en safetensors, lo que lo situa en la gama de modelos pequenos (aproximadamente 4.600 millones de parametros). El sufijo "E2B" del nombre sugiere una variante de la familia Gemma con arquitectura eficiente, aunque no se dispone de informacion oficial que confirme la arquitectura exacta ni el contexto maximo. El repositorio GGUF ocupa 49,6 GB, un tamano coherente con la publicacion de multiples niveles de cuantizacion (desde Q2_K hasta F16) junto con los tensores asociados.

La relevancia de esta ficha es doble: por un lado, documenta una opcion practica para desplegar un modelo conversacional en tetun en entornos con recursos limitados mediante llama.cpp u otros runners compatibles con GGUF; por otro, sirve de ejemplo del flujo habitual de cuantizacion de modelos pequenos para idiomas de bajos recursos. No obstante, la ausencia de model card detallada, licencia explicita y benchmarks limita seriamente la evaluacion rigurosa del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma; arquitectura exacta no confirmada) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponibles (el nombre indica especializacion en tetun) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo origen se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre "Gemma-4-E2B" indica que deriva de la familia Gemma de Google, pero no se confirma si se trata de un transformer denso convencional, de una variante con atencion eficiente o de otra configuracion. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino ni si se aplicaron tecnicas de RLHF, DPO o instruccion supervisada.

Lo unico verificable es el proceso de cuantizacion: el autor ha generado cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1) a partir del modelo original en safetensors, con un conjunto de niveles que abarca desde F16 hasta Q2_K e IQ4_XS. No se indica si se excluyo el modulo mmproj (proyector multimodal) ni si el modelo base incorpora capacidades de vision; el campo correspondiente aparece vacio en los metadatos.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y deriva de una variante "it" (instruction-tuned), por lo que esta orientado a dialogos multi-turno.
- Especializacion linguistica en tetun: el ajuste fino se realizo sobre el modelo Labadain-Gemma-4-E2B-it-Tetun, lo que sugiere competencia en esta lengua de bajos recursos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; se desconoce el alcance mas alla del tetun.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Atencion al cliente en tetun: el modelo puede gestionar conversaciones multi-turno en tetun para servicios publicos o empresas de Timor Oriental, aunque la ventana de contexto no esta documentada y debe validarse empiricamente antes de producción.
- Traduccion asistida tetun-castellano/ingles: al estar ajustado sobre un modelo Gemma instruction-tuned, puede emplearse como motor de traduccion en pipelines de documentacion oficial, con revision humana obligatoria por el riesgo de alucinacion.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPUs consumer o incluso en CPU mediante llama.cpp, lo que facilita prototipos locales sin infraestructura cloud.
- Educacion y preservacion linguistica: generacion de materiales didacticos, resumenes y ejercicios en tetun para escuelas y ONG, aprovechando el ajuste especifico al idioma.
- Investigacion en PLN de bajos recursos: servir como baseline cuantizado para experimentos de evaluacion en tetun, comparando el rendimiento del ajuste fino frente al modelo Gemma original.
- Chatbots embebidos y aplicaciones offline: al distribuirse en GGUF, puede integrarse en aplicaciones de escritorio o moviles con llama.cpp u Ollama, sin dependencia de APIs externas.
- Generacion de contenido administrativo: redaccion asistida de comunicados y formularios en tetun, con supervision humana y validacion de terminologia oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~4.600 millones de parametros, la cuantizacion Q4_K_M requiere aproximadamente 3-4 GB de VRAM; Q5_K_M en torno a 4-5 GB; Q8_0 alrededor de 6-7 GB; F16 aproximadamente 9-10 GB. Estas cifras son estimaciones basadas en el numero de parametros y no estan confirmadas por el autor.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput. Las cuantizaciones Q4 y Q5 caben en GPUs consumer de 8 GB.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM usando Q4_K_M o Q5_K_M; tambien puede ejecutarse en CPU con llama.cpp a velocidades reducidas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Labadain-Gemma-4-E2B-it-Tetun-GGUF | ~4.647 M | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Gemma 2 2B it (Google) | ~2.600 M | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Hugging Face (google) |
| Qwen2.5 3B Instruct | ~3.100 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face (Qwen) |
| Llama 3.2 3B Instruct | ~3.200 M | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face (meta-llama) |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo Labadain que permitan una comparacion cuantitativa. La principal diferencia frente a los alternativas es su especializacion en tetun, idioma no cubierto de forma especifica por los modelos generalistas citados.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan datos de entrenamiento, sesgos, evaluaciones ni limitaciones conocidas, lo que dificulta una evaluacion rigurosa.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe consultarse la licencia del modelo base (Gemma Terms of Use) y del ajuste fino original antes de cualquier despliegue en producción.
- Riesgo de alucinacion: como todo modelo generativo de ~4.600 millones de parametros, puede producir contenido factualmente incorrecto, especialmente en dominios especializados y en lenguas de bajos recursos con menor cobertura de entrenamiento.
- Contexto desconocido: se desconoce la longitud maxima de contexto, lo que impide garantizar el rendimiento en conversaciones largas o documentos extensos.
- Cobertura linguistica limitada: el ajuste esta orientado al tetun; el rendimiento en castellano, ingles u otras lenguas no esta documentado y podria degradarse respecto al modelo Gemma original.
- Sesgos no evaluados: no se han publicado analisis de sesgos de genero, etnicos o politicos, un riesgo relevante en contextos institucionales y educativos.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni validacion externa del modelo.
- Cuantizaciones de baja precision: Q2_K e IQ4_XS pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso conversacional.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Labadain-Gemma-4-E2B-it-Tetun-GGUF
- Modelo base (ajuste fino en tetun): https://huggingface.co/labadain/Labadain-Gemma-4-E2B-it-Tetun
- Familia Gemma de Google: https://huggingface.co/google
- llama.cpp (runner compatible con GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
