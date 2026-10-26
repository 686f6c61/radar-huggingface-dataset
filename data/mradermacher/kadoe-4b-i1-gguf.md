# mradermacher/Kadoe-4B-i1-GGUF

## Resumen

Kadoe-4B-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix, sufijo "i1") del modelo aungzaythant/Kadoe-4B, preparadas por mradermacher, uno de los cuantizadores más prolíficos del ecosistema Hugging Face. El modelo base es un modelo multimodal (visión y lenguaje) de aproximadamente 4,2 mil millones de parámetros, orientado al chat, la comprensión de imágenes y el OCR, con soporte de birmano (myanmar) e inglés.

Su relevancia radica en la escasez de modelos abiertos con buen soporte del idioma birmano, una lengua de bajos recursos con un sistema de escritura complejo. La versión de mradermacher permite ejecutar el modelo localmente con llama.cpp y derivados, con 24 variantes de cuantización que van desde 1,5 GB (IQ1_S) hasta 3,6 GB (Q6_K), lo que lo hace viable desde CPUs modestas hasta GPUs consumer. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de vision y lenguaje; detalles no publicados) |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 24 variantes imatrix (i1): de IQ1_S (1,5 GB) a Q6_K (3,6 GB); quants estaticos en repo aparte |
| Idiomas soportados | birmano (my), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base aungzaythant/Kadoe-4B (tipo de transformer, numero de capas, mecanismos de atencion). Por los tags y el README se sabe que es un modelo de vision (vision-language model) con capacidades de OCR y chat conversacional, y que en el ecosistema GGUF requiere archivos mmproj (proyeccion multimodal) para procesar imagenes, que mradermacher publica en el repositorio estatico correspondiente.

Sobre el entrenamiento del modelo base (numero de tokens, composicion del corpus, uso de RLHF/DPO) no hay datos publicados en la informacion disponible. En cuanto a la cuantizacion, mradermacher emplea la tecnica de imatrix (importance matrix): se calcula una matriz de importancia a partir de datos de calibracion y se usa para minimizar la perdida de calidad en cuants de bits bajos, lo que suele dar mejores resultados que la cuantizacion estatica clasica, especialmente en IQ1-IQ3.

## Capacidades

- Chat conversacional bilingue en birmano e ingles (tag "conversational").
- Comprension de imagenes (modelo de vision): analisis y descripcion de contenido visual.
- OCR: reconocimiento de texto en imagenes, con foco aparente en el script birmano (tag "ocr").
- Ejecucion local eficiente gracias a las 24 cuantizaciones GGUF, desde 1,5 GB hasta 3,6 GB.
- Soporte del ecosistema llama.cpp (formato GGUF nativo) y compatibilidad con herramientas derivadas.
- No hay informacion disponible sobre tool calling / function calling, soporte de agentes, thinking mode ni audio.

## Casos de uso

- OCR de documentos en birmano: digitalizacion de formularios, contratos, correspondencia o documentos administrativos escaneados en Myanmar; el modelo puede extraer el texto directamente de la imagen sin depender de un OCR clasico.
- Chatbot bilingue birmano-ingles desplegado en local: con el quant Q4_K_M (2,8 GB) funciona en GPUs de 4 GB de VRAM o incluso solo con CPU y 8 GB de RAM, util en entornos sin acceso a APIs de pago.
- Lectura asistida y accesibilidad: un usuario puede fotografias con texto en birmano (carteles, etiquetas, menus) y obtener una transcripcion o resumen en ingles.
- Archivado y digitalizacion de patrimonio: bibliotecas y hemerotecas con material impreso en myanmar pueden usar el modelo para indexar colecciones escaneadas.
- Procesamiento documental en dispositivos edge: los quants IQ2/IQ3 (1,6-2,3 GB) permiten integrar OCR y chat en aplicaciones ligeras, equipos de bajos recursos o despliegues offline.
- Investigacion en lenguas de bajos recursos: punto de partida para fine-tuning, evaluacion de capacidades en birmano o construccion de datasets, aprovechando la licencia Apache 2.0.
- Prototipado de asistentes con vision: combinacion de entrada de imagen y conversacion multi-turno para demos de agentes que leen documentos y responden preguntas sobre ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso del quant es la referencia directa. IQ1_S/IQ1_M: ~1,5 GB; IQ2_XS/IQ2_M: 1,7-1,8 GB; IQ3_M: ~2,3 GB; Q4_K_S: ~2,7 GB; Q4_K_M: ~2,8 GB; Q5_K_M: ~3,2 GB; Q6_K: ~3,6 GB. Anade margen para el KV cache (dependiente de la longitud de contexto) y, si usas vision, para el archivo mmproj.
- GPUs recomendadas: cualquier GPU consumer con 4 GB de VRAM o mas ejecuta con holgura los quants Q4-Q6; con 6-8 GB (RTX 3060, RTX 4060) cabe el Q6_K con contexto amplio. No se necesitan A100 ni H100 para inferencia.
- Consumer GPUs: si, es un modelo de 4B pensado para hardware modesto; tambien funciona en CPU puro (se recomiendan 8 GB de RAM para Q4_K_M) y en Apple Silicon.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, KoboldCpp, GPT4All y text-generation-webui. vLLM y TGI no son la via habitual para GGUF; para servir con esas pilas habria que partir del modelo base en safetensors.
- Latencia y throughput: no hay mediciones publicadas. Cualitativamente, un modelo denso de 4B en Q4_K_M ofrece generacion fluida en tiempo real en una GPU consumer moderna; los quants IQ1-IQ2 son mas rapidos pero con degradacion de calidad notable.

## Comparativa con modelos similares

Comparativa orientativa con modelos densos de ~4B de la misma categoria (datos de los modelos base, no de los quants):

| Modelo | Parametros | Contexto | Vision | Idiomas destacados | Licencia |
|---|---|---|---|---|---|
| Kadoe-4B (base) | 4,2B | no disponible | Si | Birmano, ingles | Apache 2.0 |
| Qwen3-4B | 4B | 32.768 (ampliable a ~131k con YaRN) | No (variante VL aparte) | Multilingue (100+) | Apache 2.0 |
| Gemma 3 4B | 4B | 128k | Si | Multilingue (140+) | Gemma (restricciones de uso) |

El diferencial de Kadoe-4B es su especializacion en birmano, idioma marginal en los modelos generalistas, y su capacidad de OCR; a cambio, carece de la documentacion, los benchmarks y el respaldo comunitario de Qwen o Gemma. mradermacher tambien ha cuantizado otros modelos 4B (Maestro-4B, Rhea-4B-Coding, Ares-4B), pero sin datos comparativos publicados en la informacion disponible.

## Limitaciones y advertencias

- Los quants extremos (IQ1_S, IQ1_M, IQ2_XXS) degradan seriamente la calidad; el propio autor los etiqueta "for the desperate". Para uso real, se recomienda Q4_K_M o superior.
- La documentacion del modelo base es escasa: sin benchmarks, sin detalles de arquitectura ni de entrenamiento, lo que dificulta evaluar su fiabilidad antes de producir resultados.
- El script birmano es complejo y altamente curvo; conviene verificar la tokenizacion y la calidad del OCR en documentos reales antes de confiar en salidas automaticas.
- Para usar la parte de vision hay que descargar los archivos mmproj del repositorio estatico (mradermacher/Kadoe-4B-GGUF), no de este repo.
- El modelo tiene 0 descargas y 0 likes registrados: sin historial de uso comunitario ni validacion de terceros.
- Riesgo de alucinacion tipico de modelos de 4B, agravado en un dominio de idioma poco representado en los corpus generales; no es adecuado como fuente factual sin verificacion.
- Licencia Apache 2.0: permite uso comercial, redistribucion y fine-tuning sin restricciones relevantes mas alla de conservar el aviso de licencia.
- Longitud de contexto desconocida: limita la planificacion de casos de uso con documentos largos hasta verificarla empiricamente.

## Enlaces

- Repositorio del quant (esta ficha): https://huggingface.co/mradermacher/Kadoe-4B-i1-GGUF
- Modelo base: https://huggingface.co/aungzaythant/Kadoe-4B
- Quants estaticos y archivos mmproj (vision): https://huggingface.co/mradermacher/Kadoe-4B-GGUF
- Pagina de descargas y vision general de quants: https://hf.tst.eu/model#Kadoe-4B-i1-GGUF
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
