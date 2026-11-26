# mradermacher/Experiment28M7_YamShadow-GGUF

## Resumen

Experiment28M7_YamShadow-GGUF es la version cuantizada en formato GGUF del modelo base MaziyarPanahi/Experiment28M7_YamShadow, publicada por el usuario mradermacher, especializado en la conversion de pesos a formatos ligeros para inferencia local. El modelo base es un merge (fusion de pesos) de modelos previos, orientado a generacion de texto en ingles, con 7.241.732.096 parametros totales (aproximadamente 7,2 mil millones) y licencia Apache 2.0.

La relevancia de esta publicacion radica en que ofrece el modelo en hasta doce variantes de cuantizacion GGUF, desde Q2_K (2,8 GB) hasta f16 (14,6 GB), lo que permite desplegarlo en hardware de consumo con VRAM limitada mediante llama.cpp, Ollama o interfaces compatibles. El repositorio completo ocupa 63,9 GB e incluye los pesos en safetensors del modelo original ademas de los ficheros GGUF.

No se dispone de informacion publicada sobre la longitud de contexto, la composicion del dataset de entrenamiento ni los resultados de benchmarks, ya que la model card se limita a describir el proceso de cuantizacion. El modelo esta etiquetado unicamente para el idioma ingles y no declara capacidades de tool calling, vision ni modos de razonamiento extendido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base; detalles no disponibles) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo base es un merge, es decir, una fusion de pesos de modelos previos realizada por MaziyarPanahi. La model card no especifica la arquitectura interna concreta (atencion, tipo de normalizacion, funcion de activacion ni numero de capas), aunque el recuento de parametros (7,24 mil millones) situa al modelo en la categoria de 7B, compatible con arquitecturas transformer densas convencionales. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La contribucion tecnica de esta publicacion es exclusivamente la cuantizacion estatica a GGUF mediante la libreria de transformers y el pipeline de mradermacher. La model card indica que no se han generado cuantizaciones ponderadas ni con imatrix en el momento de la publicacion, por lo que todas las variantes son cuantizaciones estaticas. No se documentan innovaciones como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado para text-generation y es compatible con text-generation-inference.
- Conversacion multi-turno: al ser un modelo de lenguaje generativo, puede mantener dialogos, aunque no se documenta un formato de chat especifico.
- Razonamiento y conocimiento general: capacidad esperable en un modelo de 7B, sin datos de benchmarks que la cuantifiquen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Inferencia local en equipos de consumo: con las variantes Q4_K_M (4,5 GB) o Q5_K_M (5,2 GB) el modelo puede ejecutarse en GPU con 6-8 GB de VRAM o en CPU con RAM suficiente, usando llama.cpp u Ollama, lo que lo hace adecuado para prototipado sin infraestructura cloud.
- Generacion de texto en ingles para aplicaciones de escritorio: integrable en herramientas offline que requieran completado o redaccion de texto sin depender de APIs externas, gracias al formato GGUF y a la licencia Apache 2.0.
- Experimentacion con merges de modelos: util para investigadores que quieran evaluar el comportamiento de un merge de 7B en distintas cuantizaciones y comparar la degradacion de calidad entre Q2_K y Q8_0.
- Despliegue en entornos con restricciones de memoria: la variante Q2_K (2,8 GB) permite ejecutar el modelo en dispositivos con poca VRAM o en Raspberry Pi y mini-PC, a costa de una perdida de calidad notable.
- Fine-tuning o evaluacion sobre el modelo base: los pesos en safetensors del repositorio permiten partir del modelo original para ajuste fino con transformers, mientras que los GGUF sirven para validar el resultado en inferencia.
- Servicio de generacion de texto de baja latencia en CPU: con Q4_K_S o Q8_0 y llama.cpp se puede montar un endpoint compatible con la API de OpenAI para tareas de completado simples en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del fichero GGUF mas overhead de contexto):
  - Q2_K: ~3 GB
  - Q3_K_M: ~4 GB
  - Q4_K_M: ~5 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,5 GB
  - Q8_0: ~8,5 GB
  - f16: ~15 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y superiores para las cuantizaciones altas; A100 o H100 no son necesarias para un modelo de 7B.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB con Q4_K_S hasta una RTX 4090 con f16. Las variantes Q2_K y Q3_K caben en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para los pesos safetensors, transformers con text-generation-inference.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Experiment28M7_YamShadow-GGUF | 7,24 B | no disponible | Apache 2.0 | GGUF, safetensors | Merge cuantizado, solo ingles |
| Mistral-7B-Instruct (referencia) | 7,24 B | 32k (v0.2/v0.3) | Apache 2.0 | safetensors, GGUF | Ampliamente adoptado, multilingue parcial |
| Llama 3.1 8B (referencia) | 8,03 B | 128k | Llama 3.1 Community | safetensors, GGUF | Multilingue, tool calling nativo |
| Qwen2.5-7B (referencia) | 7,62 B | 128k | Apache 2.0 | safetensors, GGUF | Multilingue, buen rendimiento en codigo |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento del modelo analizado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles segun la etiqueta de idioma; el rendimiento en castellano no esta garantizado ni documentado.
- No se han publicado benchmarks, por lo que se desconoce su calidad real frente a otros modelos de 7B.
- Al ser un merge sin documentacion de entrenamiento, el riesgo de alucinacion y de sesgos heredados de los modelos originales no puede evaluarse.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los modelos fusionados pueden tener condiciones adicionales no reflejadas en esta ficha; conviene verificar la cadena de licencias.
- Las cuantizaciones Q2_K y Q3_K degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- No hay evidencia de soporte de tool calling, agentes ni formatos de chat estructurados.
- La fecha de actualizacion del repositorio (2026-11-25) es posterior a la de creacion (2024-12-29); conviene revisar si los ficheros han cambiado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Experiment28M7_YamShadow-GGUF
- Modelo base: https://huggingface.co/MaziyarPanahi/Experiment28M7_YamShadow
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#Experiment28M7_YamShadow-GGUF
- Repositorio de peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
