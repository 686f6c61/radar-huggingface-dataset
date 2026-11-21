# mradermacher/Mistral-Small-3.1-24B-Base-2503-GGUF

## Resumen

Mistral-Small-3.1-24B-Base-2503-GGUF es la version cuantizada en formato GGUF del modelo base Mistral-Small-3.1-24B-Base-2503, publicado originalmente por Mistral AI. Las cuantizaciones han sido generadas por mradermacher, un conocido contribuidor de la comunidad que produce versiones GGUF de modelos populares para su uso con llama.cpp y derivados. El modelo base es un transformer denso de aproximadamente 23.570 millones de parametros (23,57B), lo que lo situa en la categoria de modelos de tamano medio-grande, adecuado para despliegues en una sola GPU de gama alta o en configuraciones multi-GPU.

El modelo base pertenece a la familia Mistral Small 3.1, sucesora de Mistral Small 3, e incorpora capacidades multimodales (vision) segun se deduce de la presencia de ficheros `mmproj` (multi-modal projection) en el repositorio. Esta orientado a tareas de generacion de texto, razonamiento, codigo y comprension de imagenes, con soporte para un amplio conjunto de idiomas (24 idiomas declarados). La licencia Apache 2.0 facilita su adopcion tanto en entornos de investigacion como comerciales.

La relevancia de esta ficha concreta radica en que ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K hasta Q8_0, ademas de variantes IQ), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. Esto hace posible ejecutar un modelo de ~23,6B parametros en hardware consumer de gama alta (por ejemplo, GPUs con 16-24 GB de VRAM usando cuantizaciones Q4), algo impensable con los pesos originales en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral Small 3.1), multimodal (vision via mmproj) |
| Parametros totales | 23.572.403.200 (~23,57B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn (24 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (multi-parte para algunas cuantizaciones); pesos originales en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Mistral Small 3.1, con aproximadamente 23,57B parametros. La presencia de ficheros `mmproj` indica que el modelo incorpora un proyector multimodal para el procesamiento de imagenes, lo que lo convierte en un modelo vision-lenguaje. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base; estos datos corresponderian a la model card original de Mistral AI, que no se ha incluido en la informacion disponible.

La innovacion principal de esta publicacion concreta no reside en el modelo en si, sino en el proceso de cuantizacion realizado por mradermacher. Se ofrecen tanto cuantizaciones estaticas (Q2_K a Q8_0) como variantes con imatrix (disponibles en un repositorio separado, `Mistral-Small-3.1-24B-Base-2503-i1-GGUF`), que suelen preservar mejor la calidad en niveles bajos de bits. Las cuantizaciones IQ (como IQ4_XS) emplean tecnicas de cuantizacion con importancia para reducir la perdida de calidad respecto a las cuantizaciones K tradicionales del mismo tamano.

## Capacidades

- Generacion de texto en 24 idiomas, incluidos espanol, ingles, frances, aleman, portugues, italiano, japones, coreano, ruso, chino, arabe, persa, indonesio, malayo, nepalí, polaco, rumano, serbio, sueco, turco, ucraniano, vietnamita, hindi y bengali.
- Comprension de imagenes y tareas vision-lenguaje gracias al proyector multimodal (mmproj) incluido en el repositorio.
- Razonamiento general y respuesta a instrucciones (modelo base, no ajustado especificamente para chat; el ajuste instruccional corresponderia a la variante Instruct).
- Generacion de codigo y tareas de programacion, como capacidad heredada de la familia Mistral Small.
- Razonamiento matematico y tareas de logica, dentro de las capacidades tipicas de un modelo de 23B parametros.
- Capacidades multilingues amplias, con cobertura declarada de 24 idiomas.
- No se dispone de informacion explicita sobre soporte de tool calling, function calling o modos de razonamiento extendido (thinking) en la informacion proporcionada para este modelo base.

## Casos de uso

- Generacion de texto multilingue en produccion: el modelo cubre 24 idiomas, lo que permite desplegar un unico modelo para servicios de redaccion, traduccion asistida o generacion de contenido en mercados diversos, reduciendo la necesidad de mantener varios modelos especializados por idioma.
- Procesamiento de documentos con imagenes: gracias al proyector multimodal, se puede usar para extraer informacion de facturas, formularios escaneados o capturas de pantalla, combinando OCR implicito con razonamiento sobre el contenido visual y textual.
- Asistencia a desarrolladores en entornos con recursos limitados: las cuantizaciones Q4_K_M (14,4 GB) permiten ejecutar el modelo en una RTX 4090 o similar, sirviendo como base para autocompletado de codigo o generacion de fragmentos en IDE local sin depender de APIs externas.
- Fine-tuning sobre el modelo base: al ser un modelo base (no instruct), es adecuado como punto de partida para ajuste supervisado en dominios especializados (legal, medico, tecnico) con datasets propios, aprovechando la licencia Apache 2.0 que permite uso comercial.
- Despliegue edge/on-premise con llama.cpp: las cuantizaciones Q2_K (9,0 GB) y Q3_K_S (10,5 GB) permiten ejecutar el modelo en estaciones de trabajo con 12-16 GB de VRAM o incluso en configuraciones CPU+GPU parciales, util para entornos con requisitos de privacidad que impiden enviar datos a la nube.
- Generacion de resumenes y analisis de textos largos multilingues: util para agregar informacion de multiples fuentes en distintos idiomas y producir resumenes coherentes, aprovechando la cobertura linguistica del modelo.
- Investigacion en eficiencia de cuantizacion: el repositorio ofrece un abanico amplio de cuantizaciones (Q2 a Q8, IQ y estaticas) que permite estudiar empiricamente el impacto de la cuantizacion en la calidad para un modelo de ~23,6B parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de fichero como referencia, mas overhead de contexto y KV cache):
  - Q2_K: ~9,0 GB
  - Q3_K_S: ~10,5 GB
  - Q3_K_M: ~11,6 GB
  - Q3_K_L: ~12,5 GB
  - IQ4_XS: ~13,0 GB
  - Q4_K_S: ~13,6 GB
  - Q4_K_M: ~14,4 GB
  - Q5_K_S: ~16,4 GB
  - Q5_K_M: ~16,9 GB
  - Q6_K: ~19,4 GB
  - Q8_0: ~25,2 GB
  - mmproj (vision): 0,6 GB (Q8_0) o 1,0 GB (f16)
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K y Q8_0 se recomienda A100 40GB, H100 o configuraciones multi-GPU. Para cuantizaciones Q2-Q3, GPUs con 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti 16GB) pueden ser suficientes.
- Cabe en GPU consumer: si, en RTX 4090/3090 para Q4-Q5; en GPUs de 16 GB para Q3 y Q4_K_S con contexto moderado; en GPUs de 12 GB solo con cuantizaciones Q2-Q3 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Los pesos originales (safetensors) pueden servirse con vLLM o TGI, pero esta publicacion concreta es exclusivamente GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Small-3.1-24B-Base-2503 (esta ficha, GGUF) | ~23,57B | no disponible | Apache 2.0 | GGUF | Multimodal (vision), 24 idiomas, multiples cuantizaciones |
| Mistral-Small-3.1-24B-Base-2503 (original) | ~23,57B | no disponible | Apache 2.0 | safetensors | Pesos completos, requiere ~47 GB en BF16 |
| Mistral-Small-3.1-24B-Instruct-2503 | ~23,57B | no disponible | Apache 2.0 | safetensors / GGUF | Variante ajustada para instrucciones y chat |
| Mistral-Small-3.1-24B-Base-2503-i1-GGUF (mradermacher) | ~23,57B | no disponible | Apache 2.0 | GGUF (imatrix) | Variante con cuantizacion imatrix, generalmente mejor calidad a igual tamano |

No se dispone de datos de benchmarks para establecer una comparacion de rendimiento numerica con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un modelo base, no ajustado para seguir instrucciones de forma conversacional; para uso en chat o asistencia directa se recomienda la variante Instruct de la familia.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de hechos verificables y en idiomas con menos representacion en el entrenamiento.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad y coherencia, especialmente en tareas de razonamiento y codigo; se recomienda Q4_K_M o superior para produccion.
- La longitud de contexto no esta especificada en la informacion disponible; debe consultarse la model card original de Mistral AI antes de disenar aplicaciones que dependan de ventanas largas.
- Las capacidades multimodales requieren cargar adicionalmente el fichero mmproj; no todos los runtimes GGUF soportan vision de forma completa.
- Aunque la licencia Apache 2.0 permite uso comercial, deben revisarse los terminos de la model card original de Mistral AI por si existen condiciones adicionales de uso aceptable.
- El rendimiento real dependera del runtime, del backend (CUDA, Metal, ROCm) y de la configuracion de contexto y batch; no hay datos publicados de throughput en esta ficha.
- El repositorio incluye ficheros multi-parte para algunas cuantizaciones; es necesario concatenarlos correctamente antes de usarlos con llama.cpp.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/Mistral-Small-3.1-24B-Base-2503-GGUF
- Modelo base original: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- Variante imatrix de mradermacher: https://huggingface.co/mradermacher/Mistral-Small-3.1-24B-Base-2503-i1-GGUF
- Pagina de overview de mradermacher para este modelo: https://hf.tst.eu/model#Mistral-Small-3.1-24B-Base-2503-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa patrocinadora de mradermacher: https://www.nethype.de/
