# JERRYNPC/deepseek-v4.1-flash-int3-v100

## Resumen

`JERRYNPC/deepseek-v4.1-flash-int3-v100` es una cuantización no oficial, publicada por un tercero (usuario `JERRYNPC`), del modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017` de DeepSeek. El objetivo declarado es comprimir un modelo de mezcla de expertos (MoE) de gran tamaño hasta un punto en el que pueda ejecutarse en una única GPU de 32 GB de VRAM (una Tesla V100) apoyándose en 64 GB de memoria del sistema y lectura en frío desde NVMe. Para ello combina pesos densos en int8, expertos enrutados en int3 (3,125 bits por peso) y una tabla *engram* de 2 bits, con una política de carga de expertos por streaming (denso residente en VRAM, LRU en RAM del host y lectura desde disco).

La relevancia del artefacto es sobre todo de investigación en sistemas: documenta con detalle un formato de cuantización poco habitual (int3 simétrico con grupo de 128 y registros de longitud fija), una arquitectura de carga por capas y unas cifras de rendimiento honestas y muy modestas (1,2–1,35 tok/s en régimen estable, con el primer token entre decenas de segundos y dos minutos). No es una alternativa práctica a la inferencia estándar del modelo base, sino una prueba de concepto de ejecución de MoE masivos en hardware Volta.

Advertencia crítica: según la propia model card, el repositorio es una **subida parcial que no funciona tal cual**. Faltan los fragmentos `experts3-L*.bin` correspondientes al conjunto completo de 384 expertos por capa (unos 276 GB), por lo que el checkpoint no se puede cargar. El autor remite a una variante completa y ejecutable (`JERRYNPC/deepseek-v4.1-flash-nano-v100`) y ofrece subir los fragmentos restantes bajo petición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base DeepSeek-V4.1-Flash-1017): 40 capas con 384 expertos por capa; módulo MTP/DSpark opcional de 3 capas con 128 expertos y top-3. El modelo base acepta texto e imagen según fuentes secundarias |
| Parametros totales | No disponible con certeza. Cifras discrepantes entre fuentes: 762B (model card del cuantizador), 284B (AI Model Radar), 552B (Modal) |
| Parametros activos | No disponible con certeza. 13B según AI Model Radar; 8B en prefill y 16B en decode según Modal |
| Longitud de contexto | 1M tokens según fuentes secundarias para el modelo base; el servidor de referencia de esta cuantización se lanza con `--max-seq-len 32768` |
| Tipos de cuantizacion | Expertos enrutados: int3 simétrico (rango [-4, 3], grupo=128, escala fp16, 3,125 bits/peso). Denso: int8 per-output-channel (atención, shared expert, head), con normas y tensores pequeños en fp32/fp16. Engram: 2 bits por fila (`rowcb2`). MTP opcional sin cuantizar en detalle |
| Idiomas soportados | Chino (zh) e inglés (en) según los tags del repositorio; el resto de idiomas del modelo base no está documentado en la información disponible |
| Licencia | `other`, nombre `deepseek-v4.1-flash-license`; enlace a los términos en ModelScope |
| Formato de pesos | `safetensors` (8 fragmentos densos, 8,45 GB) + `.bin` propietarios de expertos int3 (40 × 5,31 GB, registro fijo de 13.824.000 B) + `.npy` (mapa de tokens engram) + `manifest.json`; requiere `custom-code` y no es compatible con `transformers` estándar |

Otros datos del repositorio: tamaño del repo en HuggingFace 125,3 GB (incompleto); conjunto completo ~276 GB sin MTP y ~282 GB con MTP; tabla engram de 55,3 GB alojada en un repositorio aparte y dividida en fragmentos de 2 GiB; 0 descargas y 0 likes en el momento de la consulta; creado el 22 de octubre de 2026.

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 40 capas y 384 expertos enrutados por capa, más componentes densos (atención, *shared expert*, cabeza de salida) y un módulo *multi-token prediction* (MTP/DSpark) de 3 capas con 128 expertos y activación top-3. La model card del cuantizador menciona además una tabla *engram* asociativa de 2 bits con 384.006.168 filas en la capa 1 y 384.016.682 en la capa 14, de 256 dimensiones, que se consulta por token (24 filas por consulta) sin residir completa en memoria. No se proporciona información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF/DPO) en la documentación disponible.

La innovación técnica de este repositorio no está en el entrenamiento, sino en el sistema de inferencia. La VRAM mantiene el denso en int8 (≈14,92 GiB al descomprimir a fp16), mientras que los expertos int3 se cargan por streaming desde un *cache* LRU de 40 GB en RAM del host con respaldo en NVMe, de modo que los expertos enrutados no se leen de disco en cada token. La implementación es PyTorch puro (2.6.0 + cu124), con un kernel opcional de desempaquetado int3 vía NVRTC y una biblioteca opcional de GEMV en CPU con AVX2; no depende de kernels propietarios tipo tilelang.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Generación de código y tareas agénticas, que la documentación del modelo base destaca como áreas de mejora en la revisión 1017.
- Entrada multimodal de texto e imagen en el modelo base, según fuentes secundarias (AI Model Radar, Modal); la cuantización no documenta explícitamente el manejo del codificador visual.
- Soporte de contexto muy largo (hasta 1M tokens en el modelo base), limitado a 32.768 tokens en el servidor de referencia incluido.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`, autenticación por `api-key`), lo que facilita integraciones existentes.
- Módulo MTP/DSpark opcional para decodificación especulativa; el autor indica que la ganancia medida es inestable y recomienda desactivarlo (`--no-spec`).
- No hay evidencia publicada sobre *tool calling*, *function calling* ni modos de razonamiento explícito para esta cuantización concreta; debe verificarse contra el modelo base.

## Casos de uso

- Investigación en cuantización extrema: el repositorio sirve como referencia reproducible de un esquema int3 con grupo de 128 y registros de longitud fija para expertos MoE, útil para quien diseñe formatos propios de compresión.
- Estudio de sistemas de streaming de expertos: la combinación de VRAM residente, LRU en RAM y lectura NVMe es un banco de pruebas para medir el impacto de la política de caché en el throughput de decodificación.
- Ejecución de un MoE de gran tamaño en hardware Volta: permite experimentar con modelos que de otro modo exigirían múltiples GPU de 80 GB, aceptando un régimen de 1,2–1,35 tok/s.
- Generación por lotes tolerante a latencia: síntesis de datos, *backtranslation* o generación de pares instrucción-respuesta durante la noche en una estación de trabajo con una sola V100, donde el coste por token importa más que el tiempo de respuesta.
- Análisis de documentos largos en local: con la ventana de 1M tokens del modelo base (sujeta a la configuración del servidor), se pueden procesar expedientes o corpus extensos sin salir de la infraestructura propia, a cambio de tiempos de prefill altos.
- Despliegue con requisitos de privacidad: al ejecutarse íntegramente on-premise con un endpoint compatible con OpenAI, encaja en entornos donde no se permite enviar datos a la nube, siempre que se asuma la latencia.
- Reproducción y auditoría de resultados: útil para comparar la degradación de calidad de int3 frente a bf16 en un modelo concreto, aunque el autor no publica evaluaciones al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de sistema: 1,2–1,35 tok/s en régimen estable, primer token entre decenas de segundos y dos minutos según longitud de prompt y temperatura de caché, pico de VRAM de 26,9 GiB en decode y 27,0 GiB en prefill. El autor indica explícitamente que esta implementación no alcanza el régimen de 81 tok/s citado en otras propuestas.

## Requisitos de hardware

- VRAM: 32 GB recomendados (mínimo medido: 26,9 GiB en decode, 27,0 GiB en prefill, solo pesos densos y estados de inferencia).
- Memoria del sistema: 64 GB, de los cuales unos 40 GB se reservan como caché LRU de expertos y el resto para page cache de la tabla engram.
- Almacenamiento: NVMe con al menos 300 GB libres; SSD SATA funciona pero con lecturas en frío notablemente más lentas; discos mecánicos USB no son viables.
- GPU: el objetivo validado es Tesla V100 de 32 GB (Volta). No hay datos de funcionamiento en A100, H100 ni RTX 4090; el código usa PyTorch con CUDA 12.4 y un kernel NVRTC opcional, por lo que la compatibilidad con otras arquitecturas no está verificada.
- Cabe en GPU de consumo con 32 GB o más solo si se adapta el código; no hay pruebas publicadas en RTX 4090 (24 GB, insuficiente por VRAM) ni en RTX 5090.
- Despliegue: repositorio propio con `serve_v41.py` (endpoint compatible con OpenAI) y `start_v41_server.bat` para Windows; no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de expertos int3 es propietario.
- Sistema operativo: Windows 10/11 x64 verificado; Linux es teóricamente posible pero no probado.
- Software: Python 3.10–3.13 (recomendado 3.11; 3.13.14 verificado) y PyTorch 2.6.0 + cu124.
- Throughput y latencia: 1,2–1,35 tok/s; primer token desde decenas de segundos hasta dos minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / VRAM | Licencia | Estado |
|---|---|---|---|---|---|
| `JERRYNPC/deepseek-v4.1-flash-int3-v100` (esta ficha) | 762B / 284B / 552B según la fuente (discrepante) | 1M (base); 32K en el servidor de referencia | int8 denso + int3 expertos; 32 GB VRAM + 64 GB RAM + NVMe | `deepseek-v4.1-flash-license` | Subida parcial, no ejecutable tal cual |
| `deepseek-ai/DeepSeek-V4.1-Flash-1017` (modelo base) | Mismas cifras discrepantes | 1M | Pesos originales; requisitos de VRAM no disponibles en la información consultada | `deepseek-v4.1-flash-license` | Oficial, completo |
| `JERRYNPC/deepseek-v4.1-flash-nano-v100` (variante hermana) | No disponible | No disponible | Mismo esquema de cuantización, subconjunto de expertos | No disponible | Release completa y ejecutable según el autor |
| Otras cuantizaciones GGUF/AWQ del mismo base | No disponible | No disponible | No disponible | No disponible | No se ha encontrado información al respecto |

No se dispone de datos de benchmarks que permitan comparar la calidad de esta cuantización con el modelo base ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio está incompleto: faltan los fragmentos `experts3-L*.bin` del conjunto completo, por lo que el checkpoint no se puede cargar. No debe descargarse esperando un modelo funcional.
- Es una cuantización no oficial, sin evaluación de calidad publicada; no hay datos sobre la degradación de razonamiento, código o multilingüismo causada por int3 e int8.
- La tabla engram (55,3 GB) vive en un repositorio separado y debe descargarse y ensamblarse con `tools/assemble_engram.py` antes de poder ejecutar nada.
- El rendimiento es muy bajo (1,2–1,35 tok/s): no es apto para aplicaciones interactivas ni para producción con SLA.
- Las cifras de parámetros totales y activos discrepan entre fuentes (762B/284B/552B; 13B frente a 8B-16B), lo que impide dar por sentada la arquitectura exacta del modelo base.
- Idiomas documentados: chino e inglés. El comportamiento en castellano no está verificado y probablemente herede los sesgos del modelo base.
- Riesgo de alucinación inherente a un modelo de lenguaje de gran tamaño, agravado por la falta de evaluaciones de esta cuantización concreta.
- La licencia es `other` (`deepseek-v4.1-flash-license`), con términos alojados en ModelScope: es imprescindible revisarlos antes de cualquier uso comercial, y la cuantización hereda las restricciones del modelo base.
- Requiere `custom-code` y confianza en código de un tercero: no hay repositorio GitHub público enlazado (el enlace figura como pendiente), lo que impide auditar la implementación.
- Solo se ha verificado en Windows 10/11 x64 con PyTorch 2.6.0 + cu124; el soporte en Linux y en otras GPU es teórico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JERRYNPC/deepseek-v4.1-flash-int3-v100
- Repositorio de la tabla engram: https://huggingface.co/JERRYNPC/deepseek-v4.1-flash-engram-v100
- Variante completa y ejecutable (nano): https://huggingface.co/JERRYNPC/deepseek-v4.1-flash-nano-v100
- Modelo base en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Ficha de AI Model Radar: https://aimodelradar.app/models/deepseek-v4-1-flash
- Ficha de Modal: https://modal.com/library/deepseek/deepseek-v4-1-flash
- Código de inferencia: no disponible (el autor indica «enlace pendiente», licencia MIT declarada)
