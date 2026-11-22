# mradermacher/Tenet-12B-Nemo-Unslop-v1-GGUF

## Resumen

Tenet-12B-Nemo-Unslop-v1 es un modelo de lenguaje de 12.247.782.400 parametros (aproximadamente 12,25 mil millones) desarrollado originalmente por el usuario mr-andrey-isachenko y publicado en Hugging Face. La version aqui descrita es la cuantizacion GGUF realizada por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp. El modelo base se presenta con las etiquetas "abliterated" y "uncensored", lo que indica que ha sido sometido a un proceso de eliminacion de rechazos (abliteration) para reducir las negativas del modelo a responder ciertas peticiones.

El modelo esta orientado a casos de uso agenticos, tool-use y generacion de codigo, segun las etiquetas de la model card. Incorpora tecnicas de entrenamiento como GRPO (Group Relative Policy Optimization) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La cuantizacion GGUF facilita su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo de 12B en equipos con GPU de consumo, con cuantizaciones que van desde 4,9 GB (Q2_K) hasta 13,1 GB (Q8_0). No obstante, la informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que muchos apartados de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, sin confirmar) |
| Parametros totales | 12.247.782.400 (12,25 B) |
| Parametros activos | no aplica (no es MoE, segun datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (GGUF); tambien existe variante i1 con imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Las etiquetas de la model card indican el uso de transformers como libreria y mencionan tecnicas como GRPO (Group Relative Policy Optimization), un algoritmo de optimizacion de politicas utilizado en el ajuste fino con refuerzo. Tambien aparecen las etiquetas "abliterated" y "uncensored", que sugieren un proceso de abliteration (eliminacion de direcciones de activacion asociadas a rechazos) para reducir las negativas del modelo.

El modelo base es mr-andrey-isachenko/Tenet-12B-Nemo-Unslop-v1, y esta version es una cuantizacion estatica realizada por mradermacher. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO mas alla de la mencion a GRPO. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y generacion de codigo (etiqueta "coding").
- Soporte de tool calling / function calling (etiquetas "tool-use" y "agentic").
- Capacidades agenticas y de razonamiento multi-paso (etiqueta "agentic").
- Modelo "abliterated" y "uncensored": menor tendencia a rechazar peticiones.
- Entrenamiento con GRPO segun etiquetas del autor.
- Compatible con endpoints (etiqueta "endpoints_compatible").
- Soporte para vLLM y OpenRouter segun etiquetas.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Asistente conversacional en ingles: el modelo puede mantener dialogos multi-turno gracias a su naturaleza conversacional y su entrenamiento orientado a instrucciones, adecuado para chatbots de soporte en ingles.
- Generacion de codigo en pipelines de desarrollo: con la etiqueta "coding" y soporte de tool calling, puede integrarse en entornos de CI/CD para autocompletar, revisar o generar pruebas unitarias.
- Agentes autonomos con tool-use: su etiqueta "agentic" y "tool-use" lo hacen apto para orquestar llamadas a APIs y ejecutar tareas multi-paso en entornos controlados.
- Despliegue en hardware de consumo: las cuantizaciones GGUF (desde 4,9 GB) permiten ejecutarlo en GPUs de gama media o incluso en CPU con llama.cpp, ideal para prototipado local.
- Experimentacion con modelos sin censura: para investigadores que estudian el comportamiento de modelos abliterated en tareas de red teaming o evaluacion de sesgos.
- Integracion via OpenRouter o vLLM: para servir el modelo como endpoint en aplicaciones que requieran inferencia rapida y compatible con la API de OpenAI.
- Fine-tuning posterior: al estar bajo Apache 2.0 y disponible en safetensors, puede servir como base para ajuste fino en dominios especificos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,9 GB
  - Q3_K_S: ~5,6 GB
  - Q3_K_M: ~6,2 GB
  - Q3_K_L: ~6,7 GB
  - IQ4_XS: ~6,9 GB
  - Q4_K_S: ~7,2 GB
  - Q4_K_M: ~7,6 GB
  - Q5_K_S: ~8,6 GB
  - Q5_K_M: ~8,8 GB
  - Q6_K: ~10,2 GB
  - Q8_0: ~13,1 GB
- GPU recomendadas: no disponibles de forma oficial. Por tamano, una RTX 3060 de 12 GB puede ejecutar cuantizaciones Q4_K_M y Q5_K_M; una RTX 4090 de 24 GB puede ejecutar Q8_0 con holgura. Para Q6_K y Q8_0 se recomienda al menos 12-16 GB de VRAM.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 (12 GB), RTX 4080 (16 GB) y RTX 4090 (24 GB), dependiendo de la cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (para pesos completos o FP8), TGI (no confirmado), y servidores compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-12B-Nemo-Unslop-v1 (este) | 12,25 B | no disponible | Apache 2.0 | GGUF / safetensors | Abliterated, agentic, tool-use, solo ingles |
| Mistral-Nemo-12B | 12 B | 128k (segun Mistral) | Apache 2.0 | safetensors / GGUF | Modelo base popular de 12B, multilingue |
| Gemma-2-9B | 9 B | 8k | Gemma license | safetensors / GGUF | Menor tamano, licencia restrictiva |
| Qwen2.5-14B | 14 B | 32k | Apache 2.0 | safetensors / GGUF | Mayor tamano, multilingue, buenos benchmarks |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo para confrontar directamente con alternativas. El nombre "Nemo" en el modelo sugiere una posible relacion con la arquitectura Mistral-Nemo, pero no esta confirmado en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en otros idiomas no esta garantizado.
- Al ser un modelo "abliterated" y "uncensored", puede generar contenido inapropiado, ofensivo o peligroso sin los filtros habituales; requiere moderacion externa en produccion.
- Riesgo de alucinacion no cuantificado; no hay benchmarks que permitan estimar su fiabilidad.
- No se dispone de informacion sobre la longitud de contexto, lo que limita la planificacion de casos de uso con documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero el autor original no ofrece garantias sobre el comportamiento del modelo.
- La cuantizacion GGUF introduce perdida de calidad respecto al modelo en precision completa; las cuantizaciones Q2_K y Q3_K_M son especialmente propensas a degradacion.
- No hay informacion sobre sesgos conocidos ni evaluaciones de seguridad.
- El modelo base tiene muy pocas descargas y likes (712 descargas, 0 likes en la version GGUF), lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/Tenet-12B-Nemo-Unslop-v1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-12B-Nemo-Unslop-v1
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Tenet-12B-Nemo-Unslop-v1-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Tenet-12B-Nemo-Unslop-v1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
