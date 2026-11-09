# ewhacc/DeepSeek-V4.1-Flash-1017-Tandem-VQ2

## Resumen

DeepSeek-V4.1-Flash-1017-Tandem-VQ2 es un paquete de pesos cuantizados de forma agresiva derivado del checkpoint oficial DeepSeek-V4.1-Flash-1017, publicado por el usuario independiente ewhacc. No es una versión oficial de DeepSeek: se trata de una recodificación de los expertos enrutados del modelo MoE original, pensada para ejecutarse en una sola GPU mediante Tandem-vLLM, un fork de vLLM con offload de expertos a memoria de host. El modelo conserva la arquitectura Mixture-of-Experts del original, con 127.460.775.394 parámetros totales según los safetensors del repositorio, y un tamaño de repositorio de 313,6 GB.

El problema que aborda es el coste de despliegue del checkpoint oficial, que ocupa 476 GiB en disco y requiere múltiples aceleradores de gama alta. Este paquete reduce el peso en disco a 293 GiB recodificando los expertos enrutados de FP4 a códigos vectoriales de 2 bits (2,10 bits por peso) y añadiendo un subconjunto "caliente" en FP4 de los 64 expertos más enrutados por capa, además de recuantizar las tablas Engram de FP8 a 4 bits. El resultado permite servir el modelo en una única GPU Blackwell de 96 GB con 256-288 GB de RAM de sistema, a costa de una pérdida medible de calidad.

Es relevante ahora porque demuestra una vía práctica para ejecutar modelos MoE de frontera en hardware de estación de trabajo, combinando cuantización vectorial extrema, caché selectiva en precisión superior y decodificación especulativa con las capas MTP del propio modelo. La licencia es MIT, heredada del checkpoint base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con capas MTP para decodificación especulativa; familia deepseek_v41 |
| Parámetros totales | 127.460.775.394 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se validó recuperación de passkey hasta 94k tokens) |
| Tipos de cuantización | Expertos enrutados en códigos vectoriales de 2 bits (2,10 bits/peso) + subconjunto FP4; tablas Engram en 4 bits (e2m1 + UE8M0 por cada 32 valores); resto de pesos sin cambios (atención, expertos compartidos, router, embeddings, capas MTP) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (diseño de paquete propio: `vq/`, `fp4hot/`, `engram-e2m1-*.safetensors`, `model-0000*-of-00004.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia DeepSeek V4.1, con expertos enrutados por capa y tablas Engram (dos tablas de 96 GiB en FP8 en el checkpoint oficial). Este paquete no reentrena el modelo: recodifica los pesos. Los expertos enrutados de las capas 0-39 se representan como códigos vectoriales de 2 bits ("VQ"): 512 patrones de 8 pesos con simetría de signo más escalas de superbloque, con redondeo optimizado de extremo a extremo contra las salidas del modelo oficial. Adicionalmente se conservan los 64 expertos más enrutados de cada capa en su FP4 original, ordenados mediante un conteo de enrutamiento de calibración (`ranking.tsv`), de los que el motor sirve los K primeros en FP4. Las dos tablas Engram se recuantizan a 4 bits (e2m1 con escala UE8M0 compartida por cada 32 valores). El resto de componentes (atención, expertos compartidos, router, embeddings y capas MTP) se mantienen intactos.

La innovación técnica principal es el motor Tandem-vLLM: un build de vLLM con offload de expertos que mantiene los expertos en RAM de host y calcula en CPU los que no caben en la GPU, de modo que el motor es exacto respecto a este paquete (un experto ausente de la caché de GPU se computa desde memoria de host, nunca se omite). Se apoya en GPUs SM120 (RTX PRO 6000 Blackwell, RTX 50xx) y CPU x86-64 con AVX-512 o AVX2. Las capas MTP incluidas permiten decodificación especulativa DSpark con `SPEC_N=k`. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento de nivel frontera, con modo "thinking" configurable (el autor reporta resultados con thinking de bajo esfuerzo).
- Razonamiento científico y de posgrado: se evaluó en GPQA-diamond, alcanzando 77,4 % con el subconjunto FP4 top 52 por capa.
- Matemáticas: se evaluó en GSM8K (192-195 aciertos sobre 200 en las configuraciones medidas).
- Recuperación de información en contexto largo: passkey retrieval validado a 8k, 32k y 94k tokens con 9/9 aciertos en tres profundidades.
- Decodificación especulativa mediante las capas MTP incluidas en el paquete (DSpark, `SPEC_N=k`).
- Servicio con batching continuo a través de Tandem-vLLM.
- Soporte de tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de ~127B en una sola GPU de estación de trabajo: con una RTX PRO 6000 de 96 GB y 256 GB de RAM se puede servir el modelo completo (VQ only) sin clúster multi-GPU, lo que habilita prototipado e investigación en hardware local.
- Razonamiento científico asistido: el modelo mantiene un 77,4 % en GPQA-diamond con el subconjunto FP4 top 52, adecuado para asistentes de revisión de literatura o generación de hipótesis donde se prioriza calidad sobre coste.
- Procesamiento de documentos largos: la recuperación de passkey a 94k tokens sin degradación permite resumir y consultar expedientes extensos, contratos o bases de código en una sola pasada.
- Evaluación comparativa de técnicas de cuantización: el paquete incluye métricas de KL same-token y acuerdo top-1 frente al checkpoint oficial, útil para investigadores que estudien el impacto de la cuantización vectorial de 2 bits en modelos MoE.
- Servicio multiinquilino de baja concurrencia: con batching continuo alcanza 65/182/284/414 tok/s a 1/4/8/32 streams en RTX PRO 6000 + EPYC 9534, suficiente para equipos pequeños o entornos de demo.
- Generación de código y matemáticas en pipelines internos: los resultados de GSM8K (192-195/200) sugieren uso fiable en tareas de razonamiento aritmético y verificación, aunque con menor margen en tareas de razonamiento experto.
- Experimentación con decodificación especulativa: las capas MTP incluidas permiten duplicar el throughput single-user (75,6 a 159,4 tok/s en VQ only con DSpark k=3), útil para estudiar trade-offs de latencia.

## Benchmarks y rendimiento

Calidad frente al checkpoint oficial (greedy salvo indicación, thinking low, RTX PRO 6000 96 GB + EPYC 9534):

| Configuración | KL same-token | Acuerdo top-1 | GPQA-diamond (198 × 3 runs) |
|---|---|---|---|
| Paquete, FP4 top 52 por capa | 0,109 | 0,904 | 77,4 % |
| Paquete, VQ only | 0,151 | 0,877 | 74,1 % |

Comparación directa con el checkpoint oficial (vLLM 0.32, 4× H200):

| Prueba | Oficial | FP4 top 52 | VQ only |
|---|---|---|---|
| GSM8K-200 | 192 | 194 | 192 |
| GPQA-diamond 198 (una pasada greedy) | 161 (81,3 %) | 152 (76,8 %) | 145 (73,2 %) |
| Passkey retrieval 8k/32k/94k × 3 profundidades | 9/9 | 9/9 | 9/9 |

Rendimiento de decodificación (VQ only, drafter off, RTX PRO 6000 + EPYC 9534): 65/182/284/414 tok/s a 1/4/8/32 streams. En RTX 5090 32 GB + i5-14600KF con 128 GB DDR4 (`BASE_GB=10 RAM_GB=90 ENGRAM=files`): 16/18/20 tok/s a 1/2/4 streams. Single user en RTX PRO 6000 + EPYC 9534 (GSM8K-200, thinking low): VQ only 75,6 tok/s sin drafter y 159,4 tok/s con DSpark k=3; FP4 top 52 67,1 tok/s sin drafter y 121,6 tok/s con DSpark k=3.

## Requisitos de hardware

- VRAM: caché de expertos VQ configurable con `BASE_GB` (65,5 GiB en VQ only, 59,5 GiB con drafter; 28 GiB VQ + 37 GiB FP4 con FP4 top 52). Cada experto FP4 adicional cuesta unos 18 MiB por capa (K=52 equivale a 37 GiB). Reservar además KV cache, activaciones y 6 GiB para el drafter si se usa `SPEC_N`.
- RAM de host: 233 GiB RSS medida en VQ only y 270 GiB con FP4 top 52; el autor recomienda 256 GB (VQ only) o 288 GB (FP4 top 52). Con 128 GB se puede usar `RAM_GB=90 ENGRAM=files`, que fija solo los expertos más enrutados y lee el resto desde disco (más lento).
- GPU: exclusivamente SM120 (RTX PRO 6000 Blackwell, RTX 50xx). Configuración recomendada: 96 GB de GPU + 256 GB de RAM. Cabe en consumer GPU de 32 GB (RTX 5090) con 128 GB de RAM, a 16-20 tok/s.
- CPU: x86-64 con AVX-512 o AVX2; la velocidad depende sobre todo de la CPU y su ancho de banda de memoria, ya que computa los expertos que la GPU no retiene.
- Despliegue: requiere el build Tandem-vLLM (https://github.com/ewhacc/tandem), que se instala en un venv propio sobre el wheel de vLLM 0.31.0. No es compatible con vLLM estándar, llama.cpp, Ollama ni TGI.
- Almacenamiento: descarga completa del repositorio (313,6 GB); el cargador de pesos por sí solo no descarga `vq/` ni `fp4hot/`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Despliegue |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Tandem-VQ2 (este) | 127,5B totales | no disponible (validado a 94k) | Expertos a 2 bits + FP4 hot set, Engram 4 bits | MIT | 1 GPU SM120 + 256-288 GB RAM, Tandem-vLLM |
| DeepSeek-V4.1-Flash-1017 (oficial) | no disponible | no disponible | FP4 expertos, FP8 Engram | MIT | 4× H200, vLLM 0.32; 476 GiB en disco |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es una versión oficial de DeepSeek; el autor lo declara explícitamente y advierte de que la calidad es inferior al modelo original.
- Pérdida de calidad medible: KL same-token de 0,109 (FP4 top 52) y 0,151 (VQ only) frente al oficial; en GPQA-diamond supone −4,5 puntos con FP4 top 52 y −8 puntos en VQ only, ambas diferencias significativas. Las tareas fáciles y la recuperación en contexto largo no muestran degradación.
- Riesgo de alucinación: no cuantificado en la información disponible; cabe esperar el del modelo base incrementado por la cuantización de 2 bits en los expertos.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Longitud de contexto nominal no especificada; solo se validó recuperación de passkey hasta 94k tokens.
- Restricción de hardware severa: solo GPUs SM120 y CPU x86-64 con AVX-512 o AVX2; requiere Tandem-vLLM, un fork no estándar, lo que limita soporte, actualizaciones y portabilidad.
- Requisitos de memoria de host elevados (256-288 GB) para el rendimiento documentado; con 128 GB el rendimiento cae a 16-20 tok/s.
- El rendimiento depende críticamente de la CPU y su ancho de banda de memoria, no solo de la GPU.
- Es necesario descargar el repositorio completo; descargar solo los safetensors principales deja el modelo inutilizable.
- Licencia MIT: permite uso comercial, pero al derivar de un checkpoint de DeepSeek conviene revisar también los términos del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ewhacc/DeepSeek-V4.1-Flash-1017-Tandem-VQ2
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor Tandem-vLLM: https://github.com/ewhacc/tandem
- Paper, blog o demo adicionales: no disponible
