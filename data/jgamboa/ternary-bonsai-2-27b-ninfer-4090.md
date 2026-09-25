# jgamboa/Ternary-Bonsai-2-27B-NInfer-4090

## Resumen

Ternary Bonsai 2 27B (NInfer artifact for the RTX 4090) es un artefacto derivado publicado por el usuario jgamboa que empaqueta el modelo multimodal Ternary Bonsai 2 27B de Prism ML en el formato propietario `.ninfer` del motor de inferencia NInfer, con un único archivo autocontenido de 6,56 GB que incluye pesos de texto, torre de visión y cabeza MTP para decodificación especulativa. El modelo base, Ternary Bonsai 2 27B, es un transformer causal de atención híbrida derivado de Qwen3.8 27B cuyos pesos de matriz son ternarios (valores en {−1, 0, +1} en una base rotada fija) con escalas de grupo en FP16, lo que reduce el tamaño aproximadamente 9 veces respecto a la versión en precisión completa manteniendo, según datos de primera parte, el 98,2 % del rendimiento agregado en benchmarks.

La relevancia de este artefacto concreto es de ingeniería: demuestra que un modelo de clase 27B con contexto de 262.144 tokens y entrada de visión puede ejecutarse en una única GPU de consumo (RTX 4090, `sm_89`) con solo 5,52 GiB de pesos de texto residentes en VRAM, a 167 tok/s de decodificación con especulación MTP y 3.061 tok/s de prefill. A cambio, el archivo está fuertemente acoplado a un binario específico de NInfer y no carga en llama.cpp, vLLM ni Transformers.

La ficha describe el artefacto tal como está publicado: un port de conversión más kernels, sin entrenamiento adicional ni ajuste fino propio. Se trata de un experimento de portabilidad y rendimiento sobre un modelo ternario, no de un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atención híbrida (herencia de Qwen3.8 27B); pesos ternarios {−1, 0, +1} en base rotada fija con escalas de grupo FP16 |
| Parametros totales | clase 27B (modelo base: Qwen3.8 27B, ~27.000 millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256k), valor usado en el comando de servicio del artefacto |
| Tipos de cuantizacion | Ternaria empaquetada como `t5_g128_fp16` (5 pesos por byte en base 3, 1,6 bits/peso, una escala FP16 por cada 128 pesos); torre de visión en Q8_0; el GGUF original usa empaquetado PTQ1_0 (referido como 2,125 bits/peso en un port independiente) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (artefacto NInfer v3), archivo único de 6,56 GB; el modelo de origen se distribuye en GGUF |

## Arquitectura y entrenamiento

El artefacto no introduce entrenamiento nuevo: es una conversión de pesos y un port de kernels. Los pesos ternarios de Prism ML se conservan bit a bit y se reempaquetan del formato PTQ1_0 del GGUF original al formato `t5_g128_fp16` de NInfer, preservando las escalas de grupo FP16. La torre de visión se convierte desde el `mmproj` GGUF de Prism (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf`, Q8_0 desquantizado al layout de NInfer). La cabeza MTP de decodificación especulativa, el tokenizador, la plantilla de chat y la configuración se toman del artefacto `neroued/Qwen3.8-27B-NInfer`, ya que Bonsai mantiene la arquitectura y el tokenizador de Qwen3.8.

La innovación técnica relevante es doble. Por un lado, la cuantización ternaria con escalas de grupo FP16, que sitúa los pesos en 1,6 bits por peso efectivos. Por otro, la decodificación especulativa mediante una cabeza MTP (multi-token prediction) con `--draft-tokens 2` y `--lm-head-draft`, que eleva la decodificación de 101 tok/s (sin especulación) a 167 tok/s de media en seis prompts, sin degradar la perplejidad (5,8556 en cuatro corpus, idéntica al fork de llama.cpp de Prism). No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y modelado de lenguaje general, con arquitectura y tokenizador de Qwen3.8 27B.
- Entrada multimodal de imagen y texto (`pipeline_tag: image-text-to-text`); la torre de visión se sirve con el flag `--vision`.
- Contexto largo de hasta 262.144 tokens, útil para documentos extensos o conversaciones multi-turno largas.
- Decodificación especulativa con cabeza MTP integrada en el propio archivo, con `--draft-tokens 2`.
- API compatible con OpenAI y Anthropic en `http://localhost:8080/v1`, además de un monitor en vivo en `/monitor`.
- Gestión de caché KV con `--kv-capacity auto` y `--kv-dtype int8`.
- Razonamiento multi-paso, tool calling, modo thinking y capacidades multilingües: no documentados en la información disponible para este artefacto.

## Casos de uso

- Asistente multimodal local en estación de trabajo con RTX 4090: el modelo acepta imágenes y texto y cabe en 24 GB de VRAM (5,52 GiB de pesos de texto más caché KV en int8), lo que permite un asistente privado sin depender de APIs externas.
- Análisis de documentación técnica con imágenes: diagramas de arquitectura, capturas de pantalla o esquemas pueden enviarse junto a preguntas de texto, y la ventana de 262.144 tokens permite adjuntar manuales completos en la misma sesión.
- Copiloto de código en local: la decodificación a 167 tok/s con MTP y el prefill a 3.061 tok/s reducen la latencia percibida en ciclos de edición-depuración, y la API compatible con OpenAI facilita la integración en extensiones tipo VS Code.
- Procesamiento de contratos, informes o expedientes largos: la ventana de 256k tokens permite pasar documentos completos sin troceado agresivo, con la caché KV en int8 para controlar el consumo de VRAM.
- Prototipado de agentes con herramientas: el servidor expone un endpoint compatible con OpenAI y Anthropic, de modo que frameworks de agentes existentes pueden apuntar a `http://localhost:8080/v1` sin cambios de código.
- Evaluación e investigación sobre cuantización ternaria: al conservar los códigos bit a bit del modelo de Prism y reportar la misma perplejidad que el fork de llama.cpp, sirve como banco de pruebas para comparar empaquetados ternarios y estrategias de decodificación especulativa.
- Despliegue en estaciones sin GPU de centro de datos: con 0,714 mWh/token en RTX 4090 según datos de Prism ML, es adecuado para entornos donde el consumo energético y el coste de hardware son restricciones reales.
- Servicio interno de un solo usuario o equipo pequeño: al no estar pensado para batching en servidor, encaja mejor como endpoint local persistente que como backend multiusuario.

## Benchmarks y rendimiento

Datos publicados en la model card del artefacto (RTX 4090, Windows 11, CUDA 13.4):

| Metrica | NInfer + este archivo | Fork llama.cpp de Prism (PTQ1_0) |
|---|---:|---:|
| Decode con MTP (media de 6 prompts) | 167 tok/s (146–187) | no disponible |
| Decode sin especulación (tg128) | 101 tok/s | 77 tok/s |
| Prefill (pp512) | 3.061 tok/s | 1.363 tok/s |
| Perplejidad (cuatro corpus) | 5,8556 | 5,8556 |
| Pesos en VRAM (solo texto) | 5,52 GiB | 5,53 GiB |

Datos de primera parte reportados por Prism ML para el modelo base Ternary Bonsai 2 27B, recogidos por fuentes externas:

| Metrica | Ternary Bonsai 2 27B | Qwen3.8 27B (precisión completa) |
|---|---:|---:|
| Rendimiento agregado en benchmarks | 83,9 | 85,4 |
| Retención | 98,2 % | referencia |
| Eficiencia energética en RTX 4090 | 0,714 mWh/token | no disponible |

No se han publicado resultados de benchmarks por tarea (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

## Requisitos de hardware

- GPU: NVIDIA RTX 4090 (arquitectura Ada Lovelace, `sm_89`) con 24 GB de VRAM. El artefacto está compilado explícitamente para esta arquitectura.
- VRAM estimada: 5,52 GiB de pesos de texto, más la torre de visión y la caché KV en int8 para hasta 262.144 tokens. El archivo completo ocupa 6,56 GB (7,0 GB de repositorio).
- Cabe en GPU de consumo: sí, en RTX 4090. Existe un port independiente de NInfer para Ada (`sm_89`) en Linux, orientado al mismo segmento.
- Otras GPU: no hay constancia de soporte para H100, A100 ni GPU consumer de gama inferior en la información disponible.
- Sistema operativo y stack: Windows 11 con CUDA 13.4 según la model card; el port de CraneBW apunta a Linux nativo sobre Ada.
- Despliegue: exclusivamente mediante NInfer en la rama `feat/bonsai-ternary` del repositorio JGamboa/ninfer-4090-windows. No carga en llama.cpp, vLLM, Transformers ni Ollama.
- Servicio: `ninfer-serve bonsai2_27b_vl.ninfer --host 127.0.0.1 --port 8080 --max-context 262144 --kv-capacity auto --kv-dtype int8 --spec mtp --draft-tokens 2 --lm-head-draft --vision`.
- Throughput y latencia medidos: 167 tok/s de decodificación con MTP, 101 tok/s sin especulación, 3.061 tok/s de prefill en pp512.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y runtime | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Este artefacto (NInfer 4090) | clase 27B, denso, ternario 1,6 bits/peso | 262.144 tokens | `.ninfer`, solo NInfer en RTX 4090 | 167 tok/s decode con MTP; 3.061 tok/s prefill; perplejidad 5,8556 | Apache-2.0 |
| Prism ML Ternary Bonsai 2 27B (GGUF, PTQ1_0) | clase 27B, denso, ternario | 262.144 tokens (modelo base) | GGUF, fork de llama.cpp de Prism y MLX en Apple Silicon | 77 tok/s decode (tg128); 1.363 tok/s prefill; perplejidad 5,8556 | Apache-2.0 |
| Qwen3.8 27B (precisión completa) | ~27B, denso | no disponible en la información recogida | safetensors / GGUF según distribución | 85,4 agregado (referencia del 100 %) | Apache-2.0 |
| Port NInfer ternario para Ada en Linux (CraneBW) | clase 27B, denso, 2,125 bits/peso | no disponible | NINFER C++20/CUDA, Linux `sm_89` | no disponible | no disponible |

## Limitaciones y advertencias

- Acoplamiento total al motor: el archivo solo funciona con la compilación de NInfer de la rama `feat/bonsai-ternary` del repositorio de JGamboa. No carga en llama.cpp, vLLM, Transformers ni Ollama, lo que descarta su uso en la mayoría de stacks de producción estándar.
- Acoplamiento al hardware: requiere una RTX 4090 (`sm_89`). No hay soporte documentado para A100, H100 ni GPU de gama inferior. Migrar a otro hardware implica recompilar kernels o recurrir al port alternativo de CraneBW.
- Formato propietario: `.ninfer` v3 no es un formato estándar y limita la portabilidad y la verificabilidad por parte de terceros.
- Pérdida de calidad por cuantización ternaria: el modelo base retiene el 98,2 % del rendimiento agregado de Qwen3.8 27B, es decir, hay una degradación medible frente a la versión en precisión completa.
- Riesgo de alucinación: no hay datos publicados de evaluación de factualidad, veracidad ni tasas de alucinación para este artefacto ni para su modelo base en la información disponible.
- Sesgos: no se documenta ningún análisis de sesgos, seguridad o alineación.
- Idiomas: no se especifica la lista de idiomas soportados, aunque el tokenizador es el de Qwen3.8.
- Licencia y trazabilidad: la licencia declarada es Apache-2.0, coherente con las tres fuentes (Prism ML, Qwen y neroued), pero el artefacto combina pesos, torre de visión, cabeza MTP y plantilla de chat de orígenes distintos; conviene verificar la procedencia antes de un uso comercial crítico.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y está publicado por un autor individual con asistencia de Claude Code.
- Capacidades no confirmadas: tool calling, modo thinking, razonamiento explícito y multilingüismo no están documentados para este artefacto; no deben asumirse.
- Enfoque monousuario: no se reportan pruebas de batching ni de concurrencia, por lo que no es adecuado como backend multiusuario sin evaluación adicional.

## Enlaces

- HuggingFace (este artefacto): https://huggingface.co/jgamboa/Ternary-Bonsai-2-27B-NInfer-4090
- Modelo base en HuggingFace: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Documentación de Prism ML sobre Ternary Bonsai 2 27B: https://docs.prismml.com/bonsai-2-27b
- Anuncio de Prism ML: https://prismml.com/news/bonsai-2-27b
- Motor NInfer (Neroued): https://github.com/Neroued/ninfer
- Build de NInfer para RTX 4090, rama del artefacto: https://github.com/JGamboa/ninfer-4090-windows/tree/feat/bonsai-ternary
- Artefacto NInfer de Qwen3.8-27B (origen de la cabeza MTP y el tokenizador): https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Port NInfer ternario para Ada en Linux: https://github.com/CraneBW/ninfer-ternary-bonsai-ada
- Guía local de Ternary Bonsai 2 27B (terceros): https://cldnavi.com/en/blog/bonsai-2-27b-local-2026/
- Ficha de referencia del modelo (terceros): https://www.llmreference.com/model/bonsai-2-27b
