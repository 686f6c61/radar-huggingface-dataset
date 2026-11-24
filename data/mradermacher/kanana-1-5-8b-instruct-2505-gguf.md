# mradermacher/kanana-1.5-8b-instruct-2505-GGUF

## Resumen

Kanana 1.5 8B Instruct 2505 es un modelo de lenguaje conversacional de 8.030.285.824 parámetros (aproximadamente 8B) desarrollado por OpenLLM-Korea, una iniciativa centrada en modelos optimizados para coreano e inglés. Esta ficha concreta corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo resuelve el problema de disponer de un LLM conversacional de tamano medio con buen soporte de coreano, un idioma habitualmente infrarrepresentado en la mayoria de modelos abiertos. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para integraciones en producto.

Esta publicación de mradermacher no incluye la model card tecnica completa del modelo original: se limita a ofrecer las cuantizaciones estaticas (Q2_K a f16) del modelo base `OpenLLM-Korea/kanana-1.5-8b-instruct-2505`. Por tanto, los detalles de arquitectura, datos de entrenamiento y benchmarks deben consultarse en el repositorio del modelo original, que no forma parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: transformer decoder-only, segun convencion de la familia Kanana; no confirmado en la informacion proporcionada) |
| Parametros totales | 8.030.285.824 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas en el modelo original. La model card de esta publicacion se limita a describir el proceso de cuantizacion estatica a GGUF realizado por mradermacher sobre el checkpoint `OpenLLM-Korea/kanana-1.5-8b-instruct-2505`.

El proceso de cuantizacion documentado incluye `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica una conversion desde pesos Hugging Face con cuantizacion por tensor de salida. Adicionalmente, el autor publica cuantizaciones con imatrix (weighted) en un repositorio separado (`kanana-1.5-8b-instruct-2505-i1-GGUF`), que suelen ofrecer mejor calidad que las estaticas a igual tamano.

## Capacidades

- Generacion de texto conversacional en ingles y coreano.
- Modelo de tipo instruct, afinado para seguir instrucciones y mantener dialogos multi-turno.
- Soporte nativo de coreano, lo que lo diferencia de la mayoria de modelos de 8B centrados en ingles.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como API.
- No se ha confirmado en la informacion disponible soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- No se ha confirmado en la informacion disponible soporte de razonamiento multi-paso explicito.

## Casos de uso

- Atencion al cliente en coreano: el modelo puede gestionar conversaciones multi-turno en coreano con calidad superior a modelos genericos de 8B sin entrenamiento especifico en ese idioma, desplegado via llama.cpp u Ollama en servidores modestos.
- Traduccion y localizacion coreano-ingles: util para pipelines de traduccion automatica o revision bilingue de contenidos, aprovechando que el modelo ha sido entrenado en ambos idiomas.
- Asistentes conversacionales en producto: la licencia Apache 2.0 permite integrarlo en aplicaciones comerciales sin obligaciones de atribucion adicionales ni restricciones de uso.
- Procesamiento por lotes en CPU o GPU consumer: las cuantizaciones Q4_K_M (5,0 GB) y Q5_K_M (5,8 GB) permiten ejecutar el modelo en GPUs de 8 GB de VRAM o incluso en CPU con RAM suficiente.
- Prototipado rapido de aplicaciones LLM: al estar disponible en GGUF, se puede probar con llama.cpp, Ollama o LM Studio sin infraestructura especializada.
- Chatbot interno para equipos con requisitos de soberania de datos: al poder ejecutarse en local, evita enviar datos a APIs externas, lo que resulta relevante para organizaciones que manejan informacion sensible en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K (3,3 GB): aproximadamente 4 GB de VRAM o RAM.
  - Q3_K_M (4,1 GB): aproximadamente 5 GB.
  - Q4_K_M (5,0 GB): aproximadamente 6 GB.
  - Q5_K_M (5,8 GB): aproximadamente 7 GB.
  - Q6_K (6,7 GB): aproximadamente 8 GB.
  - Q8_0 (8,6 GB): aproximadamente 10 GB.
  - f16 (16,2 GB): aproximadamente 18 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para cuantizaciones altas; A100 o H100 para f16 y despliegues de alta concurrencia.
- Cabe en GPU consumer: si, desde una RTX 3060 12 GB o RTX 4060 Ti 16 GB con cuantizaciones Q4 a Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kanana 1.5 8B Instruct 2505 (esta ficha) | 8,03B | no disponible | en, ko | Apache 2.0 | GGUF, safetensors |
| Llama 3.1 8B Instruct | 8,03B | 128K | multilingue (incluye coreano limitado) | Llama 3.1 Community License | GGUF, safetensors |
| Qwen2.5 7B Instruct | 7,6B | 128K | multilingue (incluye coreano) | Apache 2.0 | GGUF, safetensors |
| Mistral 7B Instruct v0.3 | 7,2B | 32K | en principalmente | Apache 2.0 | GGUF, safetensors |

Los datos de contexto y rendimiento de los modelos comparados no se han verificado en la informacion proporcionada; se incluyen como referencia de categoria. La ventaja diferencial de Kanana es su enfoque explicito en coreano con licencia Apache 2.0, frente a Llama 3.1 cuya licencia comunitaria impone restricciones adicionales.

## Limitaciones y advertencias

- La model card de esta publicacion no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad; deben consultarse en el repositorio del modelo original.
- El soporte de idiomas se limita a ingles y coreano; el rendimiento en castellano no esta garantizado ni documentado.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar casos de uso con documentos largos sin verificar el modelo base.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; el autor recomienda Q4_K_S o Q4_K_M como equilibrio velocidad/calidad.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar la procedencia de los datos de entrenamiento del modelo base para cumplir con requisitos regulatorios.
- Esta publicacion es una cuantizacion de terceros: no hay garantia de que el comportamiento coincida exactamente con el modelo original en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/kanana-1.5-8b-instruct-2505-GGUF
- Modelo base: https://huggingface.co/OpenLLM-Korea/kanana-1.5-8b-instruct-2505
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/kanana-1.5-8b-instruct-2505-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#kanana-1.5-8b-instruct-2505-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
