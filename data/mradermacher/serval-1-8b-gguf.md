# mradermacher/Serval-1.8B-GGUF

## Resumen

Serval-1.8B es un modelo de traducción automática desarrollado por catsaiagency, distribuido en formato GGUF por mradermacher. Con 1.791.080.448 parámetros (aproximadamente 1,8 mil millones), está diseñado específicamente para tareas de traducción entre diez idiomas: japones, ingles, chino, coreano, espanol, frances, aleman, portugues, polaco y croata. El modelo se distribuye bajo la licencia propietaria catsai-model-license, lo que condiciona su uso comercial.

La relevancia de esta ficha radica en que se trata de una cuantización comunitaria (no oficial) del modelo base catsaiagency/Serval-1.8B, publicada por mradermacher, un conocido generador de cuantizaciones GGUF. El repositorio ofrece doce variantes de cuantización que van desde Q2_K (0,9 GB) hasta f16 (3,7 GB), lo que permite desplegar el modelo en hardware de consumo con requisitos de VRAM muy modestos.

Al tratarse de un modelo especializado en traducción y de tamano compacto, su interés principal es el despliegue en entornos con recursos limitados, aplicaciones de traducción en tiempo real o pipelines multilingues donde no se dispone de GPUs de gama alta. No obstante, la informacion publica disponible sobre arquitectura, datos de entrenamiento y rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer para traduccion, segun pipeline) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ja, en, zh, ko, es, fr, de, pt, pl, hr |
| Licencia | catsai-model-license (propietaria, "other") |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El pipeline declarado es "translation" y la libreria asociada es transformers, lo que sugiere un modelo de tipo encoder-decoder o decoder-only ajustado para traduccion automatica. El recuento de parametros (1.791.080.448) corresponde a los pesos en safetensors del modelo base.

Tampoco se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La model card del repositorio GGUF se limita a listar las cuantizaciones generadas y a remitir al modelo base; no incluye innovaciones tecnicas destacables documentadas (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Traduccion automatica entre diez idiomas: japones, ingles, chino, coreano, espanol, frances, aleman, portugues, polaco y croata.
- Generacion de texto conversacional (etiqueta "conversational" en los metadatos).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Soporte multilingue en las diez lenguas listadas, con especial enfasis en el par japones-ingles y en las combinaciones con chino y coreano.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede traducir manuales y articulos entre los diez idiomas soportados, con la ventaja de que las cuantizaciones Q4_K_M (1,2 GB) permiten ejecutarlo en portatiles sin GPU dedicada.
- Localizacion de interfaces de usuario: integrado en pipelines de CI/CD para traducir cadenas de recursos de aplicaciones multilingues, aprovechando el bajo coste de inferencia de un modelo de 1,8B.
- Atencion al cliente multilingue: como componente de traduccion en un sistema de chat, traduciendo mensajes entrantes al idioma del agente y las respuestas de vuelta al idioma del cliente, con latencia reducida gracias al tamano compacto.
- Traduccion en tiempo real de subtitulos: el modelo puede procesar segmentos cortos de texto con baja latencia, adecuado para subtitulado automatico en streaming si se combina con un motor de reconocimiento de voz.
- Procesamiento de corpus multilingues: traduccion por lotes de grandes volumenes de texto (resenas, articulos, publicaciones) para analisis posterior, donde el throughput prima sobre la calidad maxima.
- Prototipado e investigacion: como modelo de referencia para experimentos de traduccion automatica de bajo coste, dado que las doce cuantizaciones permiten comparar el equilibrio calidad/velocidad en el mismo hardware.
- Traduccion de correspondencia comercial: para pymes que necesitan traducir correos y documentos entre espanol, ingles, frances, aleman y portugues sin depender de APIs de pago.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~0,9 GB; Q4_K_M ~1,2 GB; Q8_0 ~2,0 GB; f16 ~3,7 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q5 (GTX 1650, RTX 3050, RTX 4060, etc.). Para f16 se recomienda 6-8 GB (RTX 3060, RTX 4060 Ti).
- Cabe en GPU de consumo: si, practicamente en todas las GPU modernas con 4 GB o mas; las cuantizaciones Q2_K y Q3_K_S pueden ejecutarse incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, aunque no se documenta soporte especifico.
- Latencia y throughput estimados: no disponibles. Por el tamano (1,8B) y las cuantizaciones de 4 bits, se espera una latencia de decenas de milisegundos por token en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Serval-1.8B (este) | 1,8B | no disponible | 10 | catsai-model-license (propietaria) | GGUF, safetensors |
| NLLB-200 distilled 1.3B | 1,3B | 512 tokens | 200 | CC-BY-NC 4.0 | safetensors |
| M2M-100 1.2B | 1,2B | 1024 tokens | 100 | MIT | safetensors |
| Helsinki-NLP opus-mt | ~75M por par | 512 tokens | por par | CC-BY 4.0 | safetensors |

La comparativa se limita a los datos publicos de cada modelo; no se dispone de resultados de benchmarks de Serval-1.8B que permitan una comparacion cuantitativa de calidad. Frente a NLLB-200 y M2M-100, Serval cubre menos idiomas pero incluye croata y polaco, y su licencia propietaria restringe el uso comercial en comparacion con las licencias abiertas de las alternativas.

## Limitaciones y advertencias

- Licencia propietaria (catsai-model-license): es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial; puede imponer restricciones de atribucion, redistribucion o uso.
- No se documentan los sesgos del modelo ni la composicion del dataset de entrenamiento, lo que impide evaluar riesgos de sesgo linguistico o cultural.
- Riesgo de alucinacion y de traducciones infieles no cuantificado: al no haber benchmarks publicados, no se puede estimar la tasa de error en dominios especializados (legal, medico, tecnico).
- Cobertura limitada a diez idiomas; no se garantiza calidad en pares no representados en el entrenamiento (por ejemplo, croata-polaco).
- Longitud de contexto desconocida: no se recomienda su uso en documentos largos sin verificar previamente el limite real de tokens.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- El repositorio es una cuantizacion no oficial de un tercero (mradermacher); la responsabilidad sobre el modelo original recae en catsaiagency.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Serval-1.8B-GGUF
- Modelo base: https://huggingface.co/catsaiagency/Serval-1.8B
- Licencia del modelo: https://huggingface.co/catsaiagency/Serval-1.8B/blob/main/MODEL-LICENSE.md
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Serval-1.8B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
