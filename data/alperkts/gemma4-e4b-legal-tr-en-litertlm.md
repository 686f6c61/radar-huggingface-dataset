# AlperKTS/gemma4-e4b-legal-tr-en-litertlm

## Resumen

`AlperKTS/gemma4-e4b-legal-tr-en-litertlm` es un modelo de traducción jurídica turco-inglés derivado de `google/gemma-4-E4B-it` mediante un ajuste fino con LoRA (checkpoint `AlperKTS/gemma4-e4b-legal-tr-en-v6`, paso 36.350, fusionado con escala 0,75) y empaquetado en formato LiteRT-LM (`.litertlm`) para ejecución en dispositivo. Lo publica el usuario AlperKTS bajo licencia apache-2.0 y está pensado para traducir texto legal entre turco e inglés en Android, iOS y dispositivos edge sin conexión a servicios en la nube.

El paquete es un monolito de 3,9 GB que integra embedder, backbone, per-layer embeddings y tokenizer en un único archivo, cuantizado a INT4 con el esquema `dynamic_wi4_afp32`. El autor indica que cabe en teléfonos con 8 GB de RAM (probado en un Redmi Note 13 Pro 4G con MediaTek Helio G99 y GPU Mali) y que se carga desde la aplicación Google AI Edge Gallery importándolo como modelo personalizado.

Su relevancia es doble: por un lado aborda un nicho poco cubierto (traducción jurídica turco-inglés con vocabulario contractual, jurisdicción y fuerza mayor); por otro, demuestra un flujo de exportación reproducido en la propia model card (`export_litertlm.py`) para llevar un modelo ajustado con PEFT/LoRA a un formato móvil cuantizado. No hay métricas publicadas, ni descargas, ni evaluaciones independientes: es un artefacto experimental de un solo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo base `google/gemma-4-E4B-it`. El paquete LiteRT-LM contiene embedder, backbone, per-layer embeddings (PLE) y tokenizer |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (la nomenclatura «E4B» del modelo base sugiere una variante de parámetros efectivos, pero la cifra no se documenta) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT4 (`dynamic_wi4_afp32`: pesos int4, activaciones fp32); solo se publica el paquete cuantizado |
| Idiomas soportados | Turco (`tr`) e inglés (`en`) |
| Licencia | apache-2.0 para el repositorio; licencia del modelo base no indicada en la información disponible |
| Formato de pesos | `.litertlm` (LiteRT-LM), archivo monolítico de 3,9 GB; tamaño total del repo 4,1 GB |
| Ajuste fino | LoRA `AlperKTS/gemma4-e4b-legal-tr-en-v6`, paso 36.350, escala de fusión 0,75 |
| Dominio | Traducción jurídica turco-inglés |
| Metadatos del paquete | `generic_model` (configurado como LLM de texto, sin encoders de audio) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna del modelo base en la información disponible. El paquete exportado incluye explícitamente un embedder, un backbone transformer, per-layer embeddings (PLE) y el tokenizer, lo que es coherente con la familia de modelos «E» de Google para dispositivo, que reparte parte de la parametrización en tablas de embeddings por capa para reducir el coste de memoria en inferencia. Cualquier afirmación sobre número de capas, atención, uso de MoE o decodificación especulativa sería especulativa y no se recoge aquí.

El entrenamiento consiste en un ajuste fino con LoRA sobre el checkpoint instruct del modelo base, orientado a pares de traducción jurídica turco-inglés. El autor documenta el paso 36.350 del adaptador y una escala de fusión de 0,75, lo que implica una mezcla parcial entre el adaptador y los pesos originales (no una sustitución completa). No se especifican el volumen de tokens de entrenamiento, la composición del corpus jurídico, el uso de RLHF/DPO ni procesos de alineación adicionales. Tampoco se documenta ninguna innovación técnica propia más allá del pipeline de exportación a LiteRT-LM con cuantización INT4 dinámica, que sí es reproducible mediante el comando incluido en la model card.

## Capacidades

- Traducción bidireccional turco-inglés en registro jurídico: contratos, cláusulas de jurisdicción, fuerza mayor, textos notariales.
- Generación de texto y respuestas conversacionales en turco e inglés, heredadas del modelo instruct base.
- Redacción de cláusulas bilingües con configuración determinista (temperatura 0,0) según recomienda el autor.
- Ejecución totalmente offline en dispositivo, sin llamadas a API ni transferencia de documentos a servidores externos.
- Integración con Google AI Edge Gallery en Android mediante importación de un modelo personalizado.
- Ajuste de generación parametrizable: temperatura (0,1 recomendada), top-p 0,90, top-k 40, máximo 2.048 tokens.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo «thinking».

## Casos de uso

- Traducción de contratos mercantiles turco-inglés en movilidad: un abogado puede cargar el `.litertlm` en un teléfono de 8 GB y traducir cláusulas completas sin conexión, con temperatura 0,0 para minimizar variación entre ejecuciones.
- Confidencialidad y residencia de datos: despachos que no pueden enviar borradores de contratos a APIs en la nube ejecutan la traducción íntegramente en el dispositivo, eliminando la exposición del texto a terceros.
- Revisión de documentación de fusiones y adquisiciones: traducción de cláusulas de jurisdicción, arbitraje y fuerza mayor en lotes de documentos, con revisión humana posterior obligatoria.
- Apoyo a equipos de cumplimiento normativo: traducción de correspondencia regulatoria y notificaciones oficiales turcas a inglés para informes internos.
- Herramienta de campo para intérpretes y traductores jurados: consulta rápida de terminología contractual en movilidad, offline, con historial de pares de traducción.
- Preprocesado en pipelines de e-discovery: conversión de expedientes en turco a inglés antes de indexación o búsqueda semántica, cuando la normativa interna prohíbe servicios en la nube.
- Prototipado de aplicaciones Android de traducción jurídica: el paquete LiteRT-LM se integra como modelo personalizado y sirve para validar latencia y calidad en hardware real antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye un ejemplo cualitativo de traducción de una cláusula turca de jurisdicción y fuerza mayor, sin métricas BLEU, COMET, chrF ni evaluación sobre test sets jurídicos. Tampoco se publican cifras de latencia ni de tokens por segundo en el dispositivo de referencia.

| Evaluación | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K | No disponible |
| BLEU / COMET / chrF en traducción jurídica | No disponible |
| Latencia y throughput en dispositivo | No disponible |
| Evaluación cualitativa | Un único ejemplo de cláusula contractual en la model card |

## Requisitos de hardware

- Almacenamiento: 3,9 GB para el archivo `.litertlm`; 4,1 GB para el repositorio completo.
- Memoria en dispositivo: el autor lo valida en un teléfono con 8 GB de RAM (Redmi Note 13 Pro 4G, MediaTek Helio G99, GPU Mali). No se indica el consumo real en ejecución ni el espacio de caché KV.
- VRAM en GPU de escritorio: no disponible; no se publican pesos en safetensors ni GGUF para ejecución en GPU.
- GPUs recomendadas: no disponible. El formato objetivo es móvil/edge, no servidor.
- Compatibilidad con consumer GPU: no aplicable al paquete publicado; no hay artefactos para RTX 4090, A100 o H100.
- Opciones de despliegue: Google AI Edge Gallery (Android) mediante «Import Model / Custom Model»; runtime LiteRT-LM. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el repositorio no incluye pesos en formatos soportados por esos motores.
- Configuración de generación recomendada por el autor: temperatura 0,1, top-p 0,90, top-k 40, máximo 2.048 tokens.

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de su documentación pública y no de la información proporcionada en esta ficha; los campos no verificables se marcan como no disponibles.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue | Enfoque |
|---|---|---|---|---|---|---|
| Este modelo (`gemma4-e4b-legal-tr-en-litertlm`) | No disponible | No disponible | tr, en | apache-2.0 (repo) | `.litertlm` 4 bits, solo on-device | Traducción jurídica especializada |
| `google/gemma-4-E4B-it` (base) | No disponible | No disponible | Multilingüe | No indicada en la información | Pesos originales del modelo base | LLM instruct generalista |
| `google/gemma-3n-E4B-it` (predecesor on-device) | ≈4B efectivos | 32k | Multilingüe | Términos de uso de Gemma | LiteRT-LM, GGUF, safetensors | LLM multimodal on-device |
| `Qwen/Qwen3-4B` | 4,0B | 32k nativo (ampliable a 256k con YaRN) | Multilingüe | Apache 2.0 | safetensors, GGUF, vLLM, Ollama | LLM generalista con modo thinking |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21B | 128k | Multilingüe | Llama 3.2 Community License | safetensors, GGUF, vLLM, Ollama | LLM instruct generalista |

La diferencia clave frente a las alternativas no es de rendimiento —no hay datos comparables— sino de empaquetado: este repositorio es el único de la lista que entrega un artefacto listo para móvil en INT4 con un dominio acotado, a costa de perder portabilidad a motores de servidor y de no publicar métricas.

## Limitaciones y advertencias

- Ausencia total de evaluación cuantitativa: no hay benchmarks de calidad de traducción ni comparación con traductores especializados, por lo que la calidad real en terminología jurídica es desconocida.
- Riesgo de alucinación crítico en dominio legal: una cláusula mal traducida (jurisdicción, plazos, obligaciones) puede tener consecuencias contractuales. El modelo no sustituye la revisión de un traductor jurado o de un profesional cualificado.
- Cuantización INT4 agresiva (`dynamic_wi4_afp32`): no se documenta la degradación respecto al adaptador LoRA en precisión completa.
- Cobertura lingüística restringida a turco e inglés; no se ha validado su comportamiento en otros idiomas ni en variedades dialectales.
- Longitud de contexto desconocida: no se especifica cuántos tokens de contrato puede procesar de una vez, lo que impide planificar el troceado de documentos largos. El límite de 2.048 tokens de la configuración recomendada es de generación, no de contexto.
- Licencia: el repositorio declara apache-2.0, pero el modelo base es de Google y el adaptador LoRA no declara licencia propia. No se documenta el cumplimiento de los términos de uso del modelo base ni la redistribución de pesos derivados, lo que debe verificarse antes de un uso comercial.
- Trazabilidad limitada: cero descargas, cero «likes», un único autor y ausencia de informe técnico, dataset o script de evaluación publicados.
- Portabilidad reducida: el formato `.litertlm` solo se ejecuta en el runtime LiteRT-LM; no hay pesos GGUF ni safetensors en el repositorio para servir el modelo con vLLM, TGI o llama.cpp.
- Sin soporte documentado de tool calling, agentes o multimodalidad, pese a que el modelo base pueda disponer de estas capacidades.
- Sesgos: no se documenta ningún análisis de sesgo lingüístico, jurídico o cultural en el corpus de ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlperKTS/gemma4-e4b-legal-tr-en-litertlm
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Checkpoint LoRA: https://huggingface.co/AlperKTS/gemma4-e4b-legal-tr-en-v6
- Google AI Edge Gallery (aplicación Android referenciada en la model card): https://ai.google.dev/edge/gallery
- Documentación de LiteRT-LM (runtime del formato `.litertlm`): https://ai.google.dev/edge/litert-lm
- Papers, blogs, repositorios o demos adicionales: no disponible (no se proporcionaron resultados de búsqueda web más allá de la model card).
