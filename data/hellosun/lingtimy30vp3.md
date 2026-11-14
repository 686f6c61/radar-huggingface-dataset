# HelloSun/lingtimy30vp3

## Resumen

Ling-3.0-tiny VQ3 es una cuantización vectorial del modelo base `inclusionAI/Ling-3.0-tiny`, un transformer de tipo mezcla de expertos (MoE) con 7.893.392.800 parámetros totales y licencia MIT. El autor de la cuantización es el usuario de Hugging Face HelloSun, que publica el artefacto en formato GGUF para su uso con una versión parcheada de llama.cpp. El modelo base pertenece a InclusionAI, si bien la ficha se centra en esta variante cuantizada concreta.

El interés técnico del artefacto no reside en el modelo en sí, sino en el método de compresión: los tensores de expertos (`ffn_gate_exps` y `ffn_up_exps`, 46 tensores 3D) se codifican mediante un códec vectorial LUT-VQ3-64 de 128 entradas int8 con escalas de subbloque de 3 bits cada 64 pesos, alcanzando 3,00 bits por peso en esos tensores y una tasa efectiva de 4,73 BPW en el conjunto del archivo. El resultado es un GGUF de 4,66 GB (4,34 GiB) que reduce el pico de RSS a 5,84 GiB, un 33 % menos que una cuantización Q4_K_M equivalente, manteniendo una velocidad de decodificación prácticamente idéntica a Q8_0.

La relevancia actual es doble: por un lado, demuestra que la cuantización vectorial con tablas de consulta puede superar en eficiencia de memoria a los esquemas escalares clásicos (Q4_K, Q5_K) en modelos MoE; por otro, requiere un parche específico sobre llama.cpp (commit `61dbf492`) que añade el tipo `GGML_TYPE_VQ3_0` y una ruta rápida AVX-512 VBMI con `VPERMI2B`. No es, por tanto, un artefacto plug-and-play con el stack estándar sin compilación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); grafo `bailingmoe3` en llama.cpp |
| Parámetros totales | 7.893.392.800 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | VQ3_0 (3,00 bpw en tensores de expertos), Q6_K (`ffn_down_exps`), Q8_0 (resto); tasa efectiva 4,73 BPW |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (526 tensores, 4,66 GB / 4,34 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos, identificado en el ecosistema llama.cpp con el grafo `bailingmoe3` y con tensores de atención de tipo MLA (`attn_k_b`, `attn_v_b` en 3D). La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; tampoco se especifican los parámetros activos por token ni la longitud de contexto nativa. El autor de la cuantización referencia el conversor estándar `conversion/bailingmoe3.py` de `convert_hf_to_gguf.py`, que requiere `transformers==4.57.6`.

La innovación técnica de esta ficha es el esquema de cuantización. Los 46 tensores 3D de expertos se codifican con un códec vectorial: un libro de códigos 3D de 128 entradas en int8 más escalas de subbloque de 3 bits por cada 64 pesos, lo que da 3,00 bpw en esos tensores. El resto del modelo se mantiene en Q8_0, salvo `ffn_down_exps`, que usa Q6_K. En el lado de inferencia, el parche añade el tipo `GGML_TYPE_VQ3_0` a ggml, con una ruta rápida AVX-512 VBMI basada en `VPERMI2B` para la búsqueda en la tabla de consulta. El parche incluye además una corrección del backend AMX: los pesos 3D de MLA eran reclamados por el buffer AMX pero consumidos como vista permutada en `MUL_MAT`, lo que provocaba un fallo en la carga; se añade una comprobación `ggml_n_dims(src0)==2`. Esta corrección afecta igualmente a BF16, Q8_0 y Q4_K_M.

## Capacidades

- Generación de texto conversacional: el artefacto está etiquetado como `conversational` y se ejecuta mediante `llama-cli` o `llama-server` con API compatible con OpenAI.
- Razonamiento y generación de código: capacidades heredadas del modelo base `inclusionAI/Ling-3.0-tiny`; no se documentan evaluaciones específicas en esta variante.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; el modelo card incluye ejemplos en chino, pero no se declara una lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas en la información disponible.

## Casos de uso

- Despliegue en servidores sin GPU con memoria limitada: con un pico de RSS de 5,84 GiB, el modelo cabe en máquinas de 8 GB de RAM y ofrece decodificación a 32,8 t/s en un Xeon de 80 núcleos con 64 hilos, lo que lo hace adecuado para entornos de CPU-only donde Q4_K_M requeriría más memoria.
- Servicio de chat con API compatible con OpenAI: `llama-server` expone el modelo en el puerto 8080 con interfaz OpenAI, permitiendo integrarlo en aplicaciones existentes que ya consumen ese contrato sin cambios de cliente.
- Prototipado e investigación sobre cuantización vectorial: el repositorio incluye scripts de recuantización reproducibles (`build_ling_vq3.py`, `vq3_enc_lib.c`) y tests unitarios del núcleo (`test_vq3_port.c`), útiles para estudiar el compromiso entre tasa de bits, perplejidad y divergencia KL.
- Evaluación comparativa de esquemas de compresión: los registros en `results/` (PPL, KLD, bench, RSS) permiten contrastar VQ3 frente a Q8_0, Q4_K_M y BF16 en la misma máquina, sirviendo como base para decisiones de empaquetado en producción.
- Inferencia en contenedores con presupuesto de memoria ajustado: al reducir el RSS un 33 % respecto a Q4_K_M, encaja en despliegues con límites estrictos de memoria por pod, siempre que se compile la imagen con el parche y las extensiones AVX-512 VBMI.
- Experimentación con modelos MoE en hardware de escritorio: la variante cuantizada permite cargar un MoE de 7,89B parámetros en equipos con 8 GB de RAM, aunque la decodificación en CPU será notablemente más lenta que en el Xeon de referencia.

## Benchmarks y rendimiento

Resultados publicados por el autor en un Xeon de 80 núcleos, solo CPU, 64 hilos, con `llama-bench -p 512 -n 128 -r 2 -t 64` y PPL sobre WikiText-2 test (`-c 512 --chunks 256`, 131k tokens):

| Modelo | Tamaño | PPL ↓ | KLD ↓ | pp512 (t/s) | tg128 (t/s) | RSS pico |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (master) | 14,71 GiB | 13,1045 | — | 425 | 26,9 | 15,70 GiB |
| Q8_0 | 7,82 GiB | 13,0718 | 0,012 | 504 | 33,0 | 9,32 GiB |
| base-Q8dQ6 | 7,30 GiB | 13,1406 | 0,015 | 458 | 34,2 | 8,80 GiB |
| Q4_K_M | 4,49 GiB | 13,4217 | 0,133 | 424 | 33,7 | 8,74 GiB |
| VQ3 (este repo) | 4,34 GiB | 13,8465 | 0,255 | 369 | 32,8 | 5,84 GiB |

Datos adicionales de fidelidad: la coincidencia top-1 de VQ3 frente a BF16 es del 79,7 % con un RMS Δp del 13,3 %, mientras que Q4_K_M alcanza el 84,3 % y el 9,8 % respectivamente. El test del núcleo reporta SQNR de 13,45 dB y coseno de 0,977 a 3,00 bpw. El prefill de VQ3 es un 27 % más lento que Q8_0 porque no puede usar la ruta AMX int8.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 5,84 GiB de RSS pico en CPU; en GPU, el autor indica que la desquantización de VQ3 se ejecuta en la ruta de CPU residente, por lo que el reparto entre VRAM y RAM no está cuantificado.
- GPU recomendadas: no disponible. El benchmark publicado es exclusivamente CPU.
- Compatibilidad con GPU de consumo: no confirmada; el autor menciona `-ngl 99` como opción, pero la desquantización VQ3 recae en CPU, lo que limita el beneficio de offload.
- Requisitos de CPU: el parche incluye una ruta rápida AVX-512 VBMI (`VPERMI2B`); sin ese conjunto de instrucciones se pierde el camino optimizado. El benchmark se realizó con 64 hilos.
- Opciones de despliegue: llama.cpp parcheado en el commit `61dbf492` con el parche `0001-lut-vq3-64-avx512-vbmi-port-to-61dbf492.patch`; `llama-cli` y `llama-server` (API OpenAI). No hay soporte documentado para vLLM, TGI, Ollama ni llama.cpp sin parchear.
- Latencia y throughput: 369 t/s en prefill (pp512) y 32,8 t/s en decodificación (tg128) en el Xeon de referencia; el script `build_and_run.sh --all` reproduce el entorno completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL (WikiText-2) | Licencia | Formato / disponibilidad |
|---|---|---:|---:|---|---|
| Ling-3.0-tiny VQ3 (este repo) | 7,89B (MoE) | no disponible | 13,8465 | MIT | GGUF, requiere llama.cpp parcheado |
| Ling-3.0-tiny Q4_K_M | 7,89B (MoE) | no disponible | 13,4217 | MIT | GGUF, llama.cpp estándar |
| Ling-3.0-tiny Q8_0 | 7,89B (MoE) | no disponible | 13,0718 | MIT | GGUF, llama.cpp estándar |
| Ling-3.0-tiny BF16 | 7,89B (MoE) | no disponible | 13,1045 | MIT | GGUF, llama.cpp estándar |

La comparación se limita a variantes del mismo modelo base, ya que la información proporcionada no incluye referencias a otros modelos de tamaño o categoría similares.

## Limitaciones y advertencias

- Requiere compilar llama.cpp con un parche específico sobre el commit `61dbf492`; no funciona con versiones estándar ni con otros runtimes (vLLM, TGI, Ollama) sin trabajo adicional.
- La ruta rápida depende de AVX-512 VBMI; en CPUs sin ese conjunto de instrucciones el rendimiento puede degradarse y no está cuantificado.
- Pérdida de calidad medible: PPL de 13,8465 frente a 13,1045 en BF16 y divergencia KL de 0,255 frente a 0,133 en Q4_K_M; la coincidencia top-1 cae al 79,7 %.
- El prefill es un 27 % más lento que Q8_0 por la imposibilidad de usar AMX int8.
- El parche corrige un fallo del backend AMX en pesos 3D de MLA; sin esa corrección la carga del modelo falla en máquinas con AMX, incluidas las variantes BF16, Q8_0 y Q4_K_M.
- La conversión desde el modelo base requiere `transformers==4.57.6`; versiones distintas pueden romper el conversor `bailingmoe3.py`.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación específicos de esta variante; deben evaluarse sobre el modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados publicados.
- Licencia MIT, sin restricciones conocidas para uso comercial, si bien conviene verificar la licencia del modelo base `inclusionAI/Ling-3.0-tiny`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HelloSun/lingtimy30vp3
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- GGUF oficial del modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny-GGUF
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/61dbf49228c8a96b72e40c89d93cb7c003411f8c
- Origen del formato VQ3 (llama-modchip): https://github.com/synchopate/llama-modchip
