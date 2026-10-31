# axteam/GLM-4.7-Flash-GGUF

## Resumen

GLM-4.7-Flash-GGUF es una colección de cuantizaciones en formato GGUF del modelo GLM-4.7-Flash de Z.ai (zai-org), producidas por el usuario axteam y pensadas para su ejecución local con llama.cpp, Ollama y LM Studio. El modelo base es un LLM conversacional de generación de texto con 31.221.488.576 parámetros (según los pesos en safetensors del repositorio original), y estas conversiones permiten ejecutarlo en hardware de consumo sin depender de GPUs de gama datacenter.

La relevancia de esta ficha radica en la disponibilidad: mientras el modelo original se distribuye en BF16 (lo que exige decenas de GB de VRAM), las cuantizaciones k-quant de llama.cpp reducen el footprint desde 11,5 GB (Q2_K) hasta 33,2 GB (Q8_0), con un punto dulce recomendado en Q4_K_M (18,9 GB). La conversión se ha realizado con el script oficial `convert_hf_to_gguf.py` y cada archivo incorpora el `chat_template` original, garantizando compatibilidad con el formato de conversación del modelo.

La licencia es MIT, tanto en el derivado cuantizado como en los pesos originales de Z.ai, lo que permite uso comercial sin restricciones adicionales conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para generacion de texto (detalles no disponibles) |
| Parametros totales | 31.221.488.576 (≈31,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de la model card usan 8192 tokens, pero es un valor de ejemplo, no una especificacion del modelo) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (k-quants de llama.cpp, PTQ sin reentrenamiento) |
| Idiomas soportados | no disponible (los ejemplos de la model card incluyen coreano, lo que sugiere soporte multilingue) |
| Licencia | MIT |
| Formato de pesos | GGUF (derivado de pesos BF16 en safetensors del modelo base) |

## Arquitectura y entrenamiento

El repositorio analizado es un derivado cuantizado, por lo que los detalles de arquitectura y entrenamiento corresponden al modelo base zai-org/GLM-4.7-Flash, cuya model card no esta incluida en la informacion disponible. Lo que si se documenta es el metodo de cuantizacion: se trata de cuantizacion post-entrenamiento (PTQ) realizada con llama.cpp mediante `convert_hf_to_gguf.py` seguido de `llama-quantize`. Los pesos BF16 originales se cuantizan por bloques (k-quants), usando escalas por bloque con asignacion mixta de bits, sin ningun reentrenamiento ni ajuste fino posterior.

Cada archivo GGUF incrusta el `chat_template` original del modelo, de modo que llama.cpp (con la flag `--jinja`), Ollama y LM Studio aplican automaticamente el formato de conversacion correcto. El `generation_config.json` original recomienda una temperatura de muestreo de 1.0. No hay datos publicados sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Ejecucion local en CPU, GPU o hibrida: llama.cpp descarga automaticamente a RAM de CPU la parte de capas que no cabe en VRAM (via `-ngl`).
- Servidor con API compatible con OpenAI en el puerto 8080 mediante `llama-server`, lo que facilita la integracion con clientes existentes.
- Formato de chat original preservado gracias al `chat_template` incrustado en cada archivo GGUF.
- Reduccion opcional de memoria de KV-cache en tiempo de ejecucion mediante cuantizacion del cache (`--cache-type-k q8_0 --cache-type-v q8_0 -fa on`).
- Capacidades de tool calling, agentes, vision, audio o razonamiento: no disponible en la informacion proporcionada.

## Casos de uso

- Chatbots locales con privacidad total: al ejecutarse con llama.cpp u Ollama en maquina local, ninguna conversacion sale del dispositivo, ideal para datos sensibles (historias clinicas, documentos legales, codigo propietario).
- Backend de API compatible con OpenAI: `llama-server` expone un endpoint `/v1/chat/completions`, por lo que se puede integrar en aplicaciones ya construidas contra la API de OpenAI cambiando solo la URL base.
- Prototipado en LM Studio: la busqueda del modelo en el navegador de LM Studio permite probar distintas cuantizaciones (Q4_K_M frente a Q8_0) y comparar calidad frente a consumo de memoria sin escribir codigo.
- Despliegue en GPUs de consumo de gama alta: la version Q4_K_M (18,9 GB) cabe en una RTX 4090 de 24 GB, dejando margen para el KV-cache y el contexto.
- Ejecucion hibrida CPU/GPU en portatiles o estaciones sin GPU dedicada suficiente: el offload automatico de capas a RAM permite usar el modelo aunque la VRAM sea insuficiente, a costa de latencia.
- Servicios con licencia permisiva: al ser MIT, puede integrarse en productos comerciales, SaaS o derivados cerrados sin obligaciones de copyleft ni restricciones de uso.
- Experimentacion con trade-offs de cuantizacion: la gama completa de Q2_K a Q8_0 sirve como banco de pruebas para medir la degradacion de calidad frente al ahorro de memoria en k-quants.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los tamanos de archivo son indicativos de la memoria necesaria para los pesos; hay que anadir la memoria del KV-cache (que crece con el contexto) y los buffers de computo.

- VRAM/RAM estimada para los pesos:
  - Q2_K: 11,5 GB
  - Q3_K_M: 15,0 GB
  - Q4_K_M: 18,9 GB (recomendado por el autor)
  - Q5_K_M: 22,2 GB
  - Q6_K: 25,7 GB
  - Q8_0: 33,2 GB
- GPUs recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 cubre los pesos con margen para contexto moderado. Para Q6_K/Q8_0, GPUs de 32-48 GB (RTX 5090, A6000, A100) o despliegue hibrido con offload a CPU. No hay medidas oficiales de latencia ni throughput.
- Consumer GPUs: Q2_K y Q3_K_M pueden funcionar parcial o totalmente en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super, RTX 4080) con offload parcial a CPU; Q4_K_M cabe completamente en una RTX 4090/3090 de 24 GB.
- Despliegue soportado (documentado en la model card): llama.cpp (`llama-server` con API OpenAI-compatible y `llama-cli`), Ollama (`ollama run hf.co/axteam/GLM-4.7-Flash-GGUF:Q4_K_M`) y LM Studio. No se mencionan vLLM ni TGI (GGUF no es su formato nativo).
- Optimizacion de memoria: cuantizar el KV-cache en tiempo de ejecucion con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce notablemente la memoria dedicada al contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/GLM-4.7-Flash-GGUF | 31,2 B (base) | GGUF | Q2_K a Q8_0 | MIT | llama.cpp, Ollama, LM Studio |
| zai-org/GLM-4.7-Flash (original) | 31,2 B | BF16 (safetensors) | sin cuantizar | MIT | HuggingFace, endpoints serverless |
| Qwen2.5-32B-Instruct-GGUF (comunidad) | 32,5 B | GGUF | gama completa Q2-Q8 | Qwen (permisiva con condiciones) | llama.cpp, Ollama, LM Studio |

Comparacion orientativa: ocupa la misma franja de tamano que Qwen2.5-32B, con la ventaja de la licencia MIT sin condiciones adicionales. Datos de rendimiento comparativo no disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser un derivado cuantizado, hereda los sesgos del modelo base GLM-4.7-Flash de Z.ai, que no estan documentados en la informacion proporcionada.
- Riesgo de alucinacion: inherente a cualquier LLM; ademas, las cuantizaciones bajas (Q2_K, Q3_K_M) introducen perdida de calidad notable segun el propio autor, por lo que no se recomiendan para tareas exigentes.
- Longitud de contexto: no especificada en la informacion disponible; los ejemplos usan 8192 tokens, un valor conservador que puede no reflejar el maximo real del modelo base.
- Idiomas: no documentados; los ejemplos incluyen coreano, pero no hay lista oficial de idiomas soportados ni evaluaciones multilingues.
- Licencia: MIT, sin restricciones de uso comercial conocidas; los pesos y el tokenizador originales pertenecen a Z.ai / zai-org.
- Caveats de produccion: la cuantizacion es PTQ sin reentrenamiento, por lo que Q8_0 es la unica version practicamente fiel al original; el KV-cache cuantizado (q8_0) puede degradar ligeramente la calidad en contextos largos; no hay benchmarks publicados que permitan validar el rendimiento antes de desplegar; el repositorio tiene 0 descargas registradas, es decir, sin historial de uso comunitario.
- Recurso de terceros: es una conversion de un autor independiente (axteam), no oficial de Z.ai; para garantia de conversion conviene contrastar con conversiones oficiales si existen.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/axteam/GLM-4.7-Flash-GGUF
- Modelo base original: https://huggingface.co/zai-org/GLM-4.7-Flash
- Otros enlaces (papers, blogs, demos): no disponibles en la informacion proporcionada.
