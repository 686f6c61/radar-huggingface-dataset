# mradermacher/gemma-3-4b-pt-GGUF

## Resumen

`mradermacher/gemma-3-4b-pt-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo base `google/gemma-3-4b-pt`, la variante preentrenada (no instruida) de 4 mil millones de parametros de la familia Gemma 3 de Google DeepMind. El autor de las cuantizaciones es mradermacher, un conocido publicador de quants en Hugging Face, que distribuye versiones estaticas listas para su uso con llama.cpp y herramientas compatibles. El modelo original se publico en marzo de 2025 y esta pensado como base para fine-tuning o para experimentacion con tecnicas de post-entrenamiento.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten ejecutar un modelo de ~3.880 millones de parametros en hardware de consumo, algo inviable con los pesos originales en safetensors (que ocupan aproximadamente 7,9 GB en f16). Ademas, el repositorio incluye ficheros `mmproj` (multi-modal projection) que indican que el modelo base Gemma 3 4B incorpora capacidades de vision, aunque en esta variante preentrenada no se ha realizado ningun ajuste instruccional.

Es importante subrayar que se trata de un modelo **preentrenado (pt)**, no de una version instruct o chat. No sigue instrucciones de forma fiable sin un fine-tuning previo, y su uso directo en produccion conversacional no es recomendable. Su valor esta en servir como punto de partida para entrenamiento o para evaluar la calidad de las cuantizaciones sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3); detalles exactos no disponibles en la informacion proporcionada |
| Parametros totales | 3.880.099.328 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | gemma (Gemma Terms of Use de Google) |
| Formato de pesos | GGUF (multiples ficheros por cuantizacion) |
| Modelo base | google/gemma-3-4b-pt |
| Tamano del repo | 37,3 GB |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-3-4b-pt`, un transformer decoder-only de la tercera generacion de Gemma. La informacion proporcionada no detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni la composicion exacta del dataset de preentrenamiento. Tampoco se especifica el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de una variante `pt`, lo esperable es que no incluya ajuste por preferencias, pero este dato no se confirma en la documentacion disponible.

La innovacion tecnica mas destacable que si se deduce de los ficheros del repositorio es la presencia de pesos `mmproj` (proyeccion multimodal), lo que confirma que Gemma 3 4B incorpora un adaptador de vision en su arquitectura. Las cuantizaciones estaticas de mradermacher siguen el esquema habitual de llama.cpp: cuantizacion por bloques con tipos K-quant e I-quant, y ficheros separados para el proyector multimodal. No se dispone de informacion sobre decodificacion especulativa, atencion lineal u otras optimizaciones especificas del modelo original en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva como modelo base preentrenado (sin alineacion instruccional).
- Capacidades multimodales (vision) inferidas de la presencia de ficheros `mmproj` en el repositorio, aunque no se detalla su alcance.
- Base para fine-tuning supervisado y para experimentacion con tecnicas de post-entrenamiento.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para la variante `pt`.
- Soporte de agentes y razonamiento multi-paso: no confirmado; al ser un modelo preentrenado, no se espera un comportamiento agentico fiable sin ajuste.
- Capacidades multilingues: los metadatos solo declaran `en`; el soporte de otros idiomas no esta confirmado en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles en la informacion proporcionada.

## Casos de uso

- **Fine-tuning supervisado sobre dominio propio**: el modelo base en GGUF puede servir para experimentar con destilacion o para evaluar la calidad de las cuantizaciones antes de entrenar sobre los pesos originales en safetensors.
- **Investigacion sobre cuantizacion**: comparar la perplejidad y la calidad de salida entre Q2_K, Q4_K_M y Q8_0 sobre el mismo modelo base permite estudiar el impacto de la cuantizacion en un transformer de ~3,9B parametros.
- **Evaluacion de capacidades multimodales en local**: usando los ficheros `mmproj` junto con llama.cpp, se puede probar la proyeccion visual del modelo base en entornos sin GPU de datacenter.
- **Generacion de texto sin alineacion para estudios de sesgo**: al no estar instruido, el modelo reproduce con mas fidelidad las distribuciones del corpus de preentrenamiento, lo que resulta util en investigacion sobre sesgos y toxicidad.
- **Prototipado rapido en CPU**: las cuantizaciones Q4_K_S y Q4_K_M (~2,5-2,6 GB) permiten ejecutar el modelo en portatiles sin GPU dedicada para pruebas de concepto.
- **Base para modelos derivados**: punto de partida para la comunidad que quiera publicar variantes ajustadas (chat, codigo, dominio medico, etc.) a partir de Gemma 3 4B.
- **Validacion de pipelines de inferencia**: util para verificar la compatibilidad de llama.cpp, Ollama u otros runners con la arquitectura Gemma 3 antes de desplegar modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (aproximada, segun tamano de fichero GGUF; la VRAM real depende del contexto y del runner):
  - Q2_K: ~1,8 GB de pesos.
  - Q3_K_M: ~2,2 GB.
  - IQ4_XS: ~2,4 GB.
  - Q4_K_M: ~2,6 GB.
  - Q5_K_M: ~2,9 GB.
  - Q6_K: ~3,3 GB.
  - Q8_0: ~4,2 GB.
  - f16: ~7,9 GB.
  - Sumar ~0,7-1,0 GB adicionales si se usa la proyeccion multimodal (`mmproj`).
- **GPU recomendadas**: para cuantizaciones Q4-Q5, cualquier GPU consumer con 6-8 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 2070). Para Q8_0 o f16, se recomienda RTX 4070/4080/4090 o GPUs de datacenter (A100, H100) si se busca throughput alto.
- **Cabe en GPU consumer**: si, practicamente todas las cuantizaciones de Q2 a Q8 caben en GPUs consumer modernas; f16 requiere al menos 8-10 GB de VRAM libre.
- **Opciones de despliegue**: llama.cpp (referencia para GGUF), Ollama, LM Studio, llama-cpp-python, y runners compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa; para esos runners habria que usar los pesos originales en safetensors.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-3-4b-pt-GGUF (este) | 3,88B | no disponible | gemma | GGUF | Base preentrenado, cuantizaciones estaticas |
| google/gemma-3-4b-pt | 3,88B | no disponible | gemma | safetensors | Modelo original en precision completa |
| mradermacher/gemma-3-4b-pt-i1-GGUF | 3,88B | no disponible | gemma | GGUF (imatrix) | Variante con cuantizaciones ponderadas/imatrix, mayor calidad por tamano |
| google/gemma-3-4b-it | 3,88B | no disponible | gemma | safetensors | Version instruida, apta para chat y uso directo |

La comparativa con modelos de otros fabricantes (Llama 3.2 3B, Qwen2.5 3B, Phi-3.5-mini) no se incluye porque la informacion proporcionada no contiene datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- **Modelo preentrenado, no instruido**: no sigue instrucciones de forma fiable; no debe usarse directamente en produccion conversacional sin fine-tuning.
- **Riesgo de alucinacion**: inherente a los modelos de lenguaje; en un modelo base sin alineacion, la generacion de contenido factual incorrecto es especialmente probable.
- **Sesgos**: el modelo base reproduce sesgos presentes en su corpus de preentrenamiento; no se ha aplicado RLHF que los mitigue.
- **Idioma**: los metadatos solo declaran `en`; el rendimiento en castellano no esta garantizado ni documentado.
- **Contexto**: la longitud de contexto no se especifica en la informacion proporcionada; conviene consultar la model card de `google/gemma-3-4b-pt` antes de asumir un valor.
- **Licencia Gemma**: el uso comercial esta sujeto a los Gemma Terms of Use de Google, que incluyen restricciones de uso aceptable y obligaciones de atribucion; es necesario aceptar la licencia en Hugging Face para acceder al modelo base.
- **Cuantizaciones de baja calidad**: Q2_K y Q3_K_M pueden degradar notablemente la coherencia; para produccion se recomienda Q4_K_M o superior.
- **Compatibilidad multimodal**: el uso de `mmproj` requiere runners que soporten la proyeccion multimodal de Gemma 3; no todos los forks de llama.cpp lo hacen.
- **Sin garantias del cuantizador**: mradermacher distribuye las cuantizaciones tal cual, sin garantias de calidad ni soporte; los resultados pueden variar entre versiones de llama.cpp.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-3-4b-pt-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Variante imatrix: https://huggingface.co/mradermacher/gemma-3-4b-pt-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-3-4b-pt-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
