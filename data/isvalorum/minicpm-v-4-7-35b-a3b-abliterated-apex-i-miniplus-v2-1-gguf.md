# IsValorum/MiniCPM-V-4.7-35B-A3B-Abliterated-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

MiniCPM-V-4.7-35B-A3B-Abliterated-APEX-I-MiniPlus-V2.1-GGUF es una cuantizacion GGUF del modelo multimodal MiniCPM-V 4.7 35B-A3B en su variante "abliterated" (con las direcciones de rechazo eliminadas), publicada por el usuario IsValorum dentro de su serie APEX. El modelo base procede de openbmb/MiniCPM-V-4.7-35B-A3B, que distributedcognition modifico editando 74 tensores para eliminar el comportamiento de rechazo, y sobre el que IsValorum aplico una cuantizacion mixta con matriz imatrix y proteccion de tensores recurrentes.

Se trata de un modelo de arquitectura hibrida: 40 capas en total, de las cuales 30 son de atencion lineal/SSM y 10 de atencion completa, con un bloque MoE de 256 expertos enrutados mas 1 compartido y 8 activos por token. El resultado es un modelo de 34.659.889.792 parametros totales (unos 3B activos) con una ventana de contexto de 262.144 tokens y capacidad de vision mediante un proyector multimodal separado.

La relevancia de esta publicacion es doble: por un lado ofrece una via practica de ejecutar un modelo multimodal de ~35B en hardware de consumo gracias a la cuantizacion agresiva (14,75 GB para el GGUF principal); por otro, la variante abliterated esta pensada para casos donde el modelo base rechaza peticiones legitimas. La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con 30 capas de atencion lineal/SSM y 10 de atencion completa, con MoE (256 expertos enrutados + 1 compartido, 8 activos) |
| Parametros totales | 34.659.889.792 |
| Parametros activos | 8 de 256 expertos enrutados + 1 compartido (aproximadamente 3B activos, segun el sufijo A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF mixto: Q3_K, IQ3_XXS, Q4_K, Q5_K, Q6_K, Q8_0, F32 (mapa de tensores auditado) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de vision separado mmproj-Q8_0.gguf; drafts DSpark Q4_K_M y Q6_K separados |

## Arquitectura y entrenamiento

El modelo es un transformer hibrido con 40 capas: 30 capas usan atencion lineal/SSM (con parametros `ssm_alpha`, `ssm_a`, `ssm_dt`, `ssm_conv1d` y `ssm_norm`) y 10 capas (indices 3, 7, ..., 39) usan atencion completa con `attn_q`, `attn_k`, `attn_v`, `attn_output` y sus respectivas normalizaciones. El bloque feed-forward es MoE con 256 expertos enrutados y 1 experto compartido, activando 8 expertos por token. La dimension oculta es 2048 y la torre de vision tiene 27 capas.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo fases de RLHF o DPO en la informacion proporcionada. La model card unicamente documenta el proceso de cuantizacion: se aplico una matriz imatrix publica de mradermacher (319 x 512) que cubre 400 de 402 tensores de texto cuantizados (excluyendo `output.weight` y `token_embd.weight`), se mantuvieron en F32 los tensores recurrentes criticos (`ssm_alpha`, `ssm_a`, `ssm_dt.bias`, `ssm_conv1d` y todas las RMSNorm) y se uso Q4_0 en la capa 0 para `attn_gate`, `attn_qkv`, `ssm_beta` y `ssm_out`. El GGUF principal contiene 733 tensores y no incluye tensores MTP; la decodificacion especulativa se ofrece como draft DSpark separado.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Comprension de imagenes y texto (pipeline `image-text-to-text`) mediante el proyector `mmproj-Q8_0.gguf`.
- Razonamiento sobre contextos muy largos: ventana de 262.144 tokens.
- Capacidad de mezcla de expertos con 8 expertos activos por token, lo que reduce el coste computacional frente a un modelo denso del mismo tamano.
- Decodificacion especulativa opcional mediante los drafts DSpark Q4_K_M y Q6_K.
- Comportamiento "abliterated": el modelo base fue modificado para reducir los rechazos, lo que permite respuestas a peticiones que el modelo original declinaria.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modos de agente multi-paso.
- No se documenta soporte de audio.

## Casos de uso

- Analisis de documentos extensos con imagenes: gracias a la ventana de 262.144 tokens y al proyector de vision, se pueden procesar informes con muchas paginas y figuras en una sola pasada, resumiendo o extrayendo datos estructurados.
- Asistencia en investigación sobre corpus largos: el modelo puede mantener contexto de decenas de miles de tokens, util para revision de literatura o analisis de transcripciones extensas.
- Procesamiento de imagenes tecnicas: diagramas, capturas de pantalla o graficos pueden enviarse junto con preguntas para obtener descripciones o extraccion de valores.
- Despliegue local en hardware de consumo: el GGUF principal ocupa 14,75 GB, lo que permite ejecutarlo en GPUs consumer con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) mediante llama.cpp.
- Experimentacion con modelos sin censura: para investigadores que estudian el comportamiento de modelos abliterated frente a los originales, esta variante permite comparar respuestas en dominios sensibles sin la capa de rechazo.
- Prototipado de asistentes multimodales en ingles y chino: la combinacion de vision, contexto largo y licencia Apache-2.0 facilita la integracion en productos bilingues.
- Servicio de inferencia con llama-server: la model card incluye ejemplos de `llama-cli` y `llama-server`, lo que permite exponer el modelo como endpoint compatible con la API de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el GGUF principal: aproximadamente 14,75 GB solo para los pesos, mas overhead de contexto KV y buffers de inferencia; con contexto de 32K se recomienda al menos 18-20 GB de VRAM.
- Proyector de vision adicional: 733 MB (mmproj-Q8_0.gguf).
- Draft DSpark opcional: 237 MB (Q4_K_M) o 330 MB (Q6_K).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para el modelo completo con contexto moderado; A100 40/80 GB o H100 para contextos largos cercanos a 262K tokens.
- Cabe en GPUs consumer de 24 GB con contexto moderado; en GPUs de 16 GB requeriria reducir contexto o descargar capas a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) segun la model card; no se documenta compatibilidad con vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-Abliterated-APEX-I-MiniPlus-V2.1 (este) | 34,66B totales, ~3B activos | 262.144 | Si (mmproj separado) | Apache-2.0 | GGUF |
| MiniCPM-V-4.7-35B-A3B (openbmb, original) | 34,66B totales, ~3B activos | 262.144 | Si | Apache-2.0 | safetensors / BF16 |
| MiniCPM-V-4.7-35B-A3B-abliterated (distributedcognition) | 34,66B totales, ~3B activos | 262.144 | Si | Apache-2.0 | BF16 |
| MiniCPM-V-4.7-35B-A3B-Abliterated-APEX-I-NanoPlus (IsValorum) | 34,66B totales, ~3B activos | 262.144 | Si | Apache-2.0 | GGUF (otra cuantizacion) |

Las alternativas directas son las variantes del mismo modelo base: el original sin abliterar, la version abliterated en BF16 y la cuantizacion NanoPlus del mismo autor. No se dispone de datos de benchmarks para comparar rendimiento entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina las direcciones de rechazo del modelo base, lo que puede aumentar la probabilidad de respuestas a peticiones que el modelo original declinaria; esto traslada al operador la responsabilidad de filtrar y moderar.
- La cuantizacion agresiva (Q3_K, IQ3_XXS en la mayoria de expertos) puede degradar la calidad respecto al modelo BF16, especialmente en tareas de razonamiento complejo o con contextos muy largos.
- Solo se declaran idiomas en y zh; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion inherente a los modelos generativos, no mitigado por la cuantizacion ni por la abliteration.
- La ventana de 262.144 tokens en la practica esta limitada por la VRAM disponible; usar el contexto completo requiere hardware de gama alta.
- Licencia Apache-2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre la calidad del resultado cuantizado.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad sobre su calidad.
- La fecha de creacion indicada (2026-11-03) es futura respecto al momento habitual de publicacion, lo que conviene verificar antes de integrarlo en produccion.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/MiniCPM-V-4.7-35B-A3B-Abliterated-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base abliterated: https://huggingface.co/distributedcognition/MiniCPM-V-4.7-35B-A3B-abliterated
- Modelo original: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Variante NanoPlus del mismo autor: https://huggingface.co/IsValorum/MiniCPM-V-4.7-35B-A3B-Abliterated-APEX-I-NanoPlus-GGUF
- Coleccion APEX-I MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-standard-moe-6acfee77961c8c0cf5a083b5
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
