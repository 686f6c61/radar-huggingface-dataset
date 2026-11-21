# mradermacher/SpaceR-SFT-7B-GGUF

## Resumen

SpaceR-SFT-7B-GGUF es la distribucion en formato GGUF del modelo SpaceR-SFT-7B, publicada por el usuario mradermacher, especializado en cuantizar modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo original (RUBBISHLIKE/SpaceR-SFT-7B) es un transformer de aproximadamente 7.615 millones de parametros (7,6B) afinado mediante SFT (supervised fine-tuning) sobre una base no especificada en la informacion disponible, orientado a uso conversacional en ingles.

El repositorio incluye un conjunto amplio de cuantizaciones estaticas (desde Q2_K hasta f16) junto con dos ficheros mmproj (Q8_0 y f16) que actuan como suplemento multimodal, lo que sugiere que el modelo base incorpora algun tipo de capacidad de vision o proyeccion multimodal, aunque la model card no detalla su naturaleza. El repo ocupa 70,4 GB en total, reflejando la suma de todas las variantes publicadas.

La relevancia practica de esta ficha radica en que permite ejecutar un modelo de 7,6B en hardware de consumo mediante cuantizacion, con opciones desde 3,1 GB (Q2_K) hasta 8,2 GB (Q8_0). No obstante, la informacion publicada es minima: no se detallan datos de entrenamiento, benchmarks, licencia ni longitud de contexto, lo que limita la evaluacion rigurosa del modelo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible; probablemente decoder-only) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna mas alla de que se trata de un modelo de 7,6B de parametros distribuido en formato GGUF y compatible con la libreria transformers. El nombre "SFT" en el identificador indica que el modelo ha pasado por una fase de supervised fine-tuning, presumiblemente sobre una base instructiva o preentrenada no identificada. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras variantes de alineamiento.

La presencia de ficheros mmproj (multi-modal projection) en el repositorio indica que el modelo incorpora un proyector multimodal, lo que sugiere capacidades de procesamiento de imagenes o audio junto con texto, aunque la model card no detalla que modalidad ni como se integra. La cuantizacion se ha realizado en modo estatico (sin imatrix, segun indica el autor), lo que implica que no se han generado variantes IQ ponderadas por importancia de pesos; el autor deja abierta la posibilidad de publicarlas si se solicita.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Procesamiento multimodal a traves de los ficheros mmproj incluidos (Q8_0 y f16), cuya modalidad concreta (vision, audio) no se detalla en la informacion disponible.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere despliegue en infraestructuras de inferencia estandar.
- No se documentan capacidades especificas de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documentan capacidades de codigo, matematicas o thinking mode.
- Cobertura multilingue limitada al ingles segun la etiqueta de idioma.

## Casos de uso

- Prototipado conversacional en local: gracias a las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB), el modelo puede ejecutarse en estaciones de trabajo con GPU de consumo para experimentar con un chatbot de 7,6B sin depender de APIs externas.
- Evaluacion de modelos multimodal en llama.cpp: los ficheros mmproj permiten probar el pipeline multimodal del modelo en herramientas compatibles, util para investigadores que comparan proyectores multimodales en modelos pequenos.
- Despliegue en entornos con recursos limitados: la variante Q2_K (3,1 GB) permite ejecutar el modelo en GPUs con 4-6 GB de VRAM, adecuado para demos o entornos educativos donde el coste de hardware es critico.
- Fine-tuning adicional sobre la base cuantizada: aunque el GGUF no es ideal para entrenamiento, el modelo base en safetensors (RUBBISHLIKE/SpaceR-SFT-7B) puede servir como punto de partida para ajustes especificos de dominio en ingles.
- Generacion de texto asistida en pipelines de CI: al ser compatible con endpoints, puede integrarse en flujos automatizados de generacion de documentacion o resumenes en ingles, siempre que se valide la calidad previamente.
- Investigacion sobre cuantizacion: el conjunto de 12 variantes de cuantizacion permite estudiar el impacto de la compresion en la calidad de salida para un modelo de 7,6B, comparando Q2_K frente a Q8_0 en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_M: ~3,9 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 para f16 y despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 8 GB o mas usando Q4_K_M o inferiores; Q2_K puede caber en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SpaceR-SFT-7B-GGUF | 7,6B | no disponible | no disponible | GGUF | Cuantizaciones estaticas, mmproj incluido |
| Mistral-7B-Instruct (referencia) | 7,2B | 32k (v0.2) | Apache 2.0 | safetensors, GGUF | Ampliamente adoptado, benchmarks publicos |
| Llama 3.1 8B Instruct (referencia) | 8,0B | 128k | Llama 3.1 Community | safetensors, GGUF | Ecosistema amplio, tool calling documentado |
| Qwen2.5-7B-Instruct (referencia) | 7,6B | 128k | Apache 2.0 | safetensors, GGUF | Multilingue, benchmarks publicos |

La comparativa se ofrece como referencia de categoria; no se dispone de datos de rendimiento de SpaceR-SFT-7B que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- La licencia no esta especificada en la informacion disponible, lo que impide confirmar si el uso comercial esta permitido; es imprescindible consultar el repositorio del modelo base antes de usarlo en produccion.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas de tamano similar.
- El modelo esta etiquetado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- La longitud de contexto no se especifica, lo que dificulta planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Al ser una cuantizacion estatica (sin imatrix), las variantes de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- Riesgo de alucinacion inherente a modelos de 7B afinados por SFT, agravado por la ausencia de documentacion sobre el dataset de entrenamiento.
- La informacion sobre el modelo base (RUBBISHLIKE/SpaceR-SFT-7B) es minima, lo que impide evaluar sesgos, procedencia de datos o tecnicas de alineamiento.
- El repositorio ocupa 70,4 GB; descargar el conjunto completo no es necesario, pero conviene seleccionar cuidadosamente la variante.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SpaceR-SFT-7B-GGUF
- Modelo base: https://huggingface.co/RUBBISHLIKE/SpaceR-SFT-7B
- Pagina de descargas del autor: https://hf.tst.eu/model#SpaceR-SFT-7B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
