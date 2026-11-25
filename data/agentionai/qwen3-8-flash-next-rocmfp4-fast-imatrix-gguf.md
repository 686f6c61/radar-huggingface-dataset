# agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-imatrix-GGUF

## Resumen

Qwen3.8-Flash-Next-ROCmFP4-FAST-imatrix-GGUF es una cuantización GGUF del modelo Qwen3.8-Flash-Next, publicada por Agention (agention.ai) sobre su propio fork de llama.cpp. El modelo base es un transformer de 176.943.885.120 parámetros (unos 177 B) desarrollado por el equipo Qwen, orientado a generación de texto conversacional con capacidad de visión. Esta versión cuantizada emplea los tipos ROCmFP4/ROCmFPx propios del fork y calibración imatrix, y está empaquetada específicamente para ejecutarse íntegramente en la GPU de equipos con memoria unificada de 128 GB, como el AMD Strix Halo (Ryzen AI MAX+ 395 / Radeon 8060S).

La relevancia de esta ficha no está en el modelo base, sino en la ingeniería de despliegue: consigue que un modelo de ~177 B de parámetros ocupe 87,06 GiB a 4,23 bits por peso, con una degradación de perplejidad de solo el 2,5 % respecto al modelo sin cuantizar, y sin recurrir a memoria de host ni a cómputo en CPU en la ruta crítica. Incluye además una tabla de n-gramas de 51,2 B de parámetros que se mantiene residente en VRAM mediante un layout dividido por cabezas, un cabezal MTP para decodificación especulativa y el torreón de visión en f16 convertido sin pérdida.

El contexto declarado alcanza los 262.144 tokens, y con caché KV cuantizada a q8_0 (unos 12,75 KiB por token, frente a 24 KiB en f16) el conjunto cabe en una partición de VRAM de 96 GiB. La licencia es `qwen-community-1.0`, etiquetada como "other" en el repositorio. El modelo acumula 12.756 descargas y 90 likes desde su creación el 28 de agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tabla de n-gramas (PLE) y cabezal MTP; 48 capas, de las cuales 12 son de atención completa |
| Parametros totales | 176.943.885.120 (~177 B); incluye tabla de n-gramas de 51,2 B |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | ROCmFP4 / ROCmFPx a 4,23 bpw (pesos); caché KV en q8_0 o f16; torreón de visión en f16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en el repositorio) |
| Formato de pesos | GGUF (dos layouts: raíz con tabla dividida por cabezas y `v2/` con tensor único) |
| Tamano del repositorio | 370,3 GB |
| Tamano de pesos en VRAM | 87,06 GiB |
| Caché KV | ~12,75 KiB/token en q8_0; ~24 KiB/token en f16 (~3,2 GiB y ~6 GiB para 262.144 tokens) |
| Cabezal MTP | Paquete separado de 2,28 GiB |
| Librería | gguf |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base es un transformer de 177 B de parámetros con 48 capas, de las cuales solo 12 son de atención completa, lo que reduce drásticamente el coste de la caché KV. Incorpora una tabla de n-gramas de 51,2 B de parámetros (denominada PLE en los comandos de despliegue) que en este GGUF se ha reestructurado dividiéndola por cabezas; según el autor, se trata de una reorganización byte a byte, no de una recuantización, y permite mantener la tabla completamente residente en VRAM. El modelo incluye además un cabezal de predicción multi-token (MTP) que habilita decodificación especulativa con profundidad de borrador adaptativa.

La cuantización se realizó con calibración imatrix sobre 1.540 fragmentos procedentes de dos corpus, de modo que los tensores de baja precisión se ajustan a activaciones reales. El resultado son pesos a 4,23 bits por peso con una pérdida de perplejidad del 2,5 % frente al modelo sin cuantizar, y mejor perplejidad que la tier mainline equivalente (unas dos desviaciones estándar) y que las cuantizaciones IQ4_XS e IQ3_S de AesSedai, con 20-30 GB menos de tamaño. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica destacable es el soporte de los tipos ROCmFPx en el fork de Agention, más baratos de descomprimir que los tipos mainline, lo que se traduce en un prefill más rápido y sostenido en profundidad de contexto. El torreón de visión se convirtió a f16 sin pérdida porque los pesos de visión quedaron excluidos de la release FP8 upstream.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Razonamiento en modo thinking y modo instruct (no thinking), con parámetros de muestreo recomendados distintos para cada uno.
- Capacidad de visión: procesa imágenes a través del endpoint compatible con OpenAI usando el mmproj en f16.
- Decodificación especulativa mediante cabezal MTP propio, con profundidad de borrador adaptativa (2 a 4 tokens).
- Prefill rápido sostenido en profundidad: 423 t/s a 512 tokens, 357 t/s a 8k, 245 t/s a 32k y 138 t/s a 128k.
- Generación de hasta 40 tok/s observados en Strix Halo con drafting adaptativo (la tasa depende del contenido).
- Compatibilidad con endpoints OpenAI (`/v1`) a través de llama-server, lo que habilita integración con clientes y frameworks existentes.
- Soporte de plantillas Jinja (`--jinja`) para formateo de conversaciones y tool calling según la plantilla del modelo base.
- No se dispone de información específica sobre idiomas soportados ni sobre capacidades de audio.

## Casos de uso

- Asistente conversacional largo en local: con 262.144 tokens de contexto y caché KV de ~3,2 GiB en q8_0, el modelo puede mantener conversaciones o documentos completos en memoria sin truncar, algo viable en un equipo de memoria unificada de 128 GB sin GPU dedicada de datacenter.
- Procesamiento de documentación extensa y relectura de contexto: el prefill de 138 t/s a 128k permite reinyectar prompts largos en bucles agénticos sin que el coste de prefill domine la latencia.
- Agentes multi-paso en hardware de sobremesa: la combinación de tool calling vía plantilla Jinja, endpoint OpenAI y decodificación especulativa con MTP hace viable ejecutar bucles de agente con muchas llamadas cortas sobre una única máquina Strix Halo.
- Análisis de imágenes en local: con el mmproj f16 se pueden enviar capturas, diagramas o documentos escaneados al endpoint `/v1` para extracción de información o descripción, manteniendo los datos en el equipo.
- Generación de código asistida: el autor señala que la aceptación del borrador especulativo varía con el contenido y que el código admite profundidades mayores que la prosa; el modelo puede integrarse en un servidor local para autocompletado o revisión de código.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse íntegramente en GPU local sin fallback a host, es adecuado para cargas con datos sensibles que no pueden salir del equipo.
- Servicio de inferencia interno compatible con OpenAI: llama-server expone `/v1`, de modo que herramientas ya construidas contra la API de OpenAI pueden apuntar al servidor local sin cambios de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento proporcionados son métricas de throughput y perplejidad:

| Metrica | Valor |
|---|---|
| Perplejidad frente al modelo sin cuantizar | +2,5 % |
| Perplejidad frente a tier mainline equivalente | Mejor por ~2 desviaciones estándar |
| Perplejidad frente a IQ4_XS / IQ3_S de AesSedai | Mejor, con 20-30 GB menos de tamano |
| Prefill a 512 tokens | 423 t/s |
| Prefill a 8k tokens | 357 t/s |
| Prefill a 32k tokens | 245 t/s |
| Prefill a 128k tokens | 138 t/s |
| Generacion con MTP en Strix Halo | Hasta 40 tok/s |
| Coste de cache KV en q8_0 | ~12,75 KiB/token |
| Coste de cache KV en f16 | ~24 KiB/token |

## Requisitos de hardware

- VRAM para pesos: 87,06 GiB en el layout raíz (tabla de n-gramas residente en GPU). El layout `v2/` requiere `--ngram-on-disk` o RAM de host para la tabla unificada.
- VRAM para caché KV: ~3,2 GiB con q8_0 a 262.144 tokens; ~6 GiB con f16.
- VRAM adicional para visión: el mmproj en f16 se carga aparte (tamaño no especificado en la información disponible).
- VRAM adicional para MTP: 2,28 GiB si se usa decodificación especulativa.
- Equipo objetivo: Strix Halo (Ryzen AI MAX+ 395 / Radeon 8060S) con 128 GB de memoria unificada y partición de VRAM de 96 GiB.
- GPU dedicadas: no se documenta compatibilidad con A100, H100 ni RTX 4090; 87 GiB de pesos exceden la VRAM de cualquier GPU de consumo actual, por lo que no cabe en una RTX 4090 (24 GB) ni en configuraciones consumer típicas.
- Opciones de despliegue: fork `agentionai/llama.cpp` con `-DGGML_VULKAN=ON`; imagen Docker `ghcr.io/agentionai/agention-llama:server` (también en Docker Hub); llama-server con backend Vulkan para GPU AMD e Intel y con `--gpus all` para NVIDIA.
- Flags recomendados: `-ngl 99 -ctk q8_0 -ctv q8_0 -fa on --jinja`; para MTP, `--spec-type draft-mtp --spec-draft-adaptive --spec-draft-n-min 2 --spec-draft-n-max 4 --n-gpu-layers-draft 99`.
- Throughput: ver tabla de benchmarks; el autor indica que la cuantización de caché KV no tiene coste medible de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next ROCmFP4-FAST (este) | ~177 B | 262.144 | ROCmFP4 4,23 bpw, 87,06 GiB | qwen-community-1.0 | Requiere fork de Agention; todo en GPU |
| Qwen3.8-Flash-Next mainline (tier equivalente) | ~177 B | 262.144 | Mainline, mayor tamano | qwen-community-1.0 | Peor perplejidad segun el autor; compatible con llama.cpp estandar |
| AesSedai IQ4_XS de Qwen3.8-Flash-Next | ~177 B | 262.144 | IQ4_XS | qwen-community-1.0 | 20-30 GB mas grande y peor perplejidad segun el autor |
| AesSedai IQ3_S de Qwen3.8-Flash-Next | ~177 B | 262.144 | IQ3_S | qwen-community-1.0 | 20-30 GB mas grande y peor perplejidad segun el autor |

No se dispone de datos de benchmarks comparativos que permitan contrastar calidad más allá de la perplejidad citada por el autor.

## Limitaciones y advertencias

- Los datos de perplejidad y throughput proceden del propio autor de la cuantización; no hay verificación independiente en la información disponible.
- La licencia `qwen-community-1.0` está etiquetada como "other"; es necesario revisar el archivo LICENSE del repositorio antes de un uso comercial, ya que las condiciones concretas no se detallan en la información proporcionada.
- Requiere un fork específico de llama.cpp (`agentionai/llama.cpp`) para los tipos ROCmFPx y el layout por cabezas; no funciona con llama.cpp mainline sin adaptaciones.
- El layout raíz necesita una GPU Vulkan que acepte el tamaño de búfer de la tabla dividida; el layout `v2/` con tensor único exige `--ngram-on-disk` o RAM de host, con posible impacto en rendimiento.
- El rendimiento de generación con MTP es dependiente del contenido: la aceptación del borrador varía y una profundidad fija resulta subóptima en prosa o en código.
- `--ngram-cache` tiene un valor por defecto de 256 MiB; si no se incrementa en generaciones largas, el throughput decae a lo largo de la conversación.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base.
- El tamaño de 87 GiB de pesos limita el despliegue a equipos con memoria unificada grande o múltiples GPU; no es viable en GPU de consumo convencionales.
- Los pesos de visión no forman parte del GGUF principal y deben descargarse por separado; sin el mmproj no hay capacidad multimodal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-imatrix-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cabezal MTP: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF
- Fork de llama.cpp: https://github.com/agentionai/llama.cpp
- Pull request upstream de soporte del modelo: https://github.com/ggml-org/llama.cpp/pull/27742
- Sitio del autor: https://agention.ai
- Imagen Docker: ghcr.io/agentionai/agention-llama:server (también agentionai/agention-llama:server en Docker Hub)
