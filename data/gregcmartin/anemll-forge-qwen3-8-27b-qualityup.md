# gregcmartin/anemll-forge-qwen3.8-27B-qualityup

## Resumen

Anemll-forge-qwen3.8-27B-qualityup es una compilacion comunitaria de los pesos del modelo Qwen/Qwen3.8-27B, preparada por el usuario gregcmartin mediante una bifurcacion de ANEMLL Forge llamada anemll-forge-qualityup. No se trata de un release oficial de ANEMLL, sino de una variante optimizada para ejecucion sobre el Neural Engine (ANE) de los chips Apple M6 con macOS 27. El modelo base Qwen3.8-27B se distribuye bajo licencia Apache 2.0 y este paquete conserva esa misma licencia.

El objetivo de esta compilacion es reducir el error de cuantizacion del modelo cuando se ejecuta en el Neural Engine. Para ello sigue la receta del release 0.2 de ANEMLL (GPTQ seguido de entrenamiento consciente de cuantizacion, QAT, contra el modelo BF16) e introduce una modificacion concreta: las matrices MLP de las capas 24 a 63 emplean tablas de busqueda de 4 bits en lugar de tablas vectoriales de 3 bits, dado que esas capas concentran la mayor parte del error de cuantizacion del MLP.

El resultado es un paquete con decodificacion especulativa (un drafter DFlash2 body-only), cache KV INT8, atencion de 8 bits con softmax FP8 y cache de claves transpuesta, con entradas de contexto de 8K, 16K y 32K. El repositorio ocupa 37,5 GB y esta pensado exclusivamente para inferencia local en hardware Apple M6, no para GPU convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), exportada para Neural Engine con tablas de busqueda y factores de bajo rango |
| Parametros totales | no disponible (el modelo base se denomina Qwen3.8-27B, pero no se especifica el conteo exacto) |
| Parametros activos | no disponible |
| Longitud de contexto | 8K, 16K y 32K (entradas de contexto empaquetadas) |
| Tipos de cuantizacion | GPTQ + QAT; MLP capas 0-23 con tablas vectoriales de 3 bits; MLP capas 24-63 con tablas de 4 bits; cabecera de salida de 4 bits; cache KV INT8 (kv8); atencion 8 bits con softmax FP8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | coreai (paquetes ANE), safetensors (export cuantizado, 129 archivos, 20 GiB), FP16 para embedding host |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer de la familia Qwen, y se transforma mediante un pipeline de cuantizacion en dos etapas. Primero se aplica GPTQ sobre los pesos BF16 del modelo original; despues se ejecuta un entrenamiento consciente de cuantizacion (QAT) contra las activaciones BF16 de referencia, con el fin de compensar la perdida de precision introducida por la cuantizacion. La modificacion respecto al release 0.2 de ANEMLL consiste en sustituir las tablas vectoriales de 3 bits por tablas de busqueda de 4 bits en las matrices MLP de las capas 24 a 63, que acumulan la mayor parte del error. Los token mixers mantienen el formato del release 0.2 con factores de bajo rango de rango 64, y se aplican rotaciones de Hadamard en linea sobre las entradas de MLP y token mixers.

El paquete incorpora un drafter DFlash2 body-only (sin cabecera propia, reutilizando la cabecera del modelo objetivo) para decodificacion especulativa, con una llamada de verificacion que procesa 1 ancla mas 7 borradores. La cache KV es INT8 con claves transpuestas, y la atencion usa precision de 8 bits con softmax y PV en FP8 sobre M6. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base ni sobre la composicion del dataset o el uso de RLHF/DPO.

## Capacidades

- Generacion de texto autoregresiva con decodificacion especulativa (hasta 7 borradores por llamada de verificacion).
- Razonamiento y generacion de codigo, heredados del modelo base Qwen3.8-27B (se mencionan prompts de prosa y codigo en las mediciones).
- Ejecucion local en Neural Engine de Apple M6 con contexto de hasta 32K tokens.
- Cache KV INT8 y atencion de 8 bits para reducir huella de memoria en contextos largos.
- Modo de pensamiento (thinking) presente en el modelo base, desactivado durante las mediciones de rendimiento del autor.
- Soporte de tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con chip M6: el paquete esta disenado especificamente para ejecutarse en el Neural Engine de M6 con macOS 27, ocupando unos 22 GB de memoria, lo que permite desplegar un modelo de 27B en un Mac mini de 32 GB sin GPU dedicada.
- Asistentes de codigo en estacion de trabajo: con contexto de 32K y generacion de codigo heredada de Qwen3.8-27B, puede usarse para autocompletado, refactorizacion y explicacion de codigo dentro de editores locales, sin enviar datos a servicios externos.
- Procesamiento de documentos largos: la ventana de 32K tokens y la cache KV INT8 permiten resumir, extraer y responder preguntas sobre documentos extensos manteniendo un consumo de memoria acotado (pico medido de 21,6 GB total).
- Prototipado e investigacion en eficiencia de cuantizacion: el repositorio incluye el export cuantizado completo (20 GiB, 129 safetensors) con tablas, indices, escalas, semillas de rotacion y factores de bajo rango, lo que facilita reproducir y auditar el pipeline GPTQ+QAT.
- Evaluacion de decodificacion especulativa: el drafter DFlash2 body-only incluido permite medir tasas de aceptacion de borradores y comparar el rendimiento frente al release 0.2 de ANEMLL en condiciones controladas.
- Despliegue offline con privacidad: al ejecutarse integramente en hardware local Apple, resulta adecuado para entornos con requisitos de confidencialidad que impiden el uso de APIs en la nube.
- Benchmarking de hardware ANE: sirve como referencia para comparar latencia de prefill (291 tok/s a 2K, 269 tok/s a 31,5K) y decode (27,8 tok/s a 2K, 24,7 tok/s a 31,5K) en M6.

## Benchmarks y rendimiento

Calidad medida en un Mac mini M6 (32 GB) el 9 de noviembre de 2026, con metrica KL-512 contra BF16 sobre 64 prompts (40.090 posiciones) en la entrada de 8K:

| Metrica | qualityup | release 0.2 | Diferencia (IC 95% apareado) |
|---|---:|---:|---|
| KL medio | 0,0500 | 0,0515 | −0,0044 a +0,0013 (no significativa) |
| KL mediana | 0,0093 | 0,0093 | — |
| KL p99 | 0,445 | 0,513 | — |
| Acuerdo top-1 | 91,75% | 91,42% | +0,06 a +0,60 puntos (significativa) |
| Perplejidad (BF16: 2,149) | 2,141 | 2,144 | — |

Rendimiento (3 prompts de prosa y codigo a ~2K y ~31,5K tokens, decoding greedy, 256 tokens de salida, sin reutilizacion de cache de prompt):

| Metrica | qualityup | release 0.2 |
|---|---:|---:|
| Prefill, 2K | 291 tok/s | 300 tok/s |
| Prefill, 31,5K | 269 tok/s | 280 tok/s |
| Llamada de verificacion (1 ancla + 7 borradores), 2K | 114,5 ms | 106,0 ms |
| Llamada de verificacion, 31,5K | 125,0 ms | 119,8 ms |
| Decode, 2K (tokens por verificacion) | 27,8 tok/s (3,18) | 30,9 tok/s (3,27) |
| Decode, 31,5K (tokens por verificacion) | 24,7 tok/s (3,09) | 24,6 tok/s (2,95) |

Memoria medida con limite de 32K (memoria cableada por encima de la linea base de 2,2 GB sin modelo, mas huella del proceso servidor):

| Metrica | qualityup (cache kv8) | release 0.2 (cache V8) |
|---|---:|---:|
| Memoria cableada tras carga | 18,6 GB | 16,0 GB |
| Pico cableado, prompts de 31,5K | 21,3 GB | 22,5 GB |
| Pico de huella del servidor | 2,5 GB | 3,1 GB |
| Total en pico | 21,6 GB | 23,4 GB |

En CUDA, la QAT llevo este export a un KL medio de 0,030; las aproximaciones del grafo ANE (SiLU con tanh, atencion INT8, cache cuantizada) anaden error sobre los pesos y reducen la diferencia entre ambos conjuntos en M6.

## Requisitos de hardware

- Hardware objetivo: exclusivamente Apple M6 con macOS 27. No hay soporte para GPU NVIDIA, AMD o otras plataformas.
- Memoria: aproximadamente 22 GB libres necesarios; pico medido de 21,6 GB total (memoria cableada mas huella del servidor) con prompts de 31,5K.
- No cabe en GPUs de consumo tipo RTX 4090 ni en Mac con chips anteriores a M6, dado que los paquetes estan compilados para el Neural Engine de M6.
- Tiempo de compilacion inicial de los paquetes ANE: aproximadamente 22 s por chunk, 6-7 minutos en total en M6.
- Despliegue: mediante el repositorio anemll-forge-qualityup (commit 1134662 o posterior), usando `forge.py download` y `forge.py serve --runtime coreai --ctx 32768`. El drafter en `drafter/all3/` se detecta automaticamente.
- Latencia y throughput: prefill de 291 tok/s a 2K y 269 tok/s a 31,5K; decode de 27,8 tok/s a 2K y 24,7 tok/s a 31,5K; llamada de verificacion de 114,5 ms a 2K y 125,0 ms a 31,5K.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no disponibles para este formato coreai/ANE.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| anemll-forge-qwen3.8-27B-qualityup | 27B (segun denominacion) | 8K/16K/32K | Apache 2.0 | Apple M6 (ANE) | Tablas de 4 bits en MLP 24-63; KL medio 0,0500; pico 21,6 GB |
| ANEMLL release 0.2 (Qwen3.8-27B) | 27B | 8K/16K/32K | Apache 2.0 | Apple M6 (ANE) | Cache V8 en FP16; KL medio 0,0515; pico 23,4 GB |
| ANEMLL release 0.2.1 (Qwen3.8-27B, cache kv8) | 27B | 8K/16K/32K | Apache 2.0 | Apple M6 (ANE) | Pesos de 0.2 con cache kv8; 19,3 GB reportados con el mismo metodo |
| Qwen/Qwen3.8-27B (BF16) | 27B | no disponible | Apache 2.0 | GPU convencional | Modelo de referencia; perplejidad 2,149 |

## Limitaciones y advertencias

- Exclusivo de Apple M6 con macOS 27: no funciona en M1-M5, GPUs NVIDIA/AMD ni entornos cloud convencionales.
- No es un release oficial de ANEMLL; es una compilacion comunitaria que requiere la bifurcacion anemll-forge-qualityup en commit 1134662 o posterior, ya que el upstream no acepta el drafter body-only de este bundle.
- La mejora en KL medio no es estadisticamente significativa; solo el acuerdo top-1 y el KL p99 muestran ganancias reales.
- El coste de la mejora de calidad es mayor uso de memoria (unos 2,3 GB adicionales frente a release 0.2.1, aunque las mediciones no fueron lado a lado) y mayor latencia de verificacion (8% a 2K, 4% a 31,5K).
- La velocidad de decode depende de la tasa de aceptacion de borradores, que varia con el texto generado; las cifras no son directamente comparables entre ejecuciones.
- Las aproximaciones del grafo ANE (SiLU con tanh, atencion INT8, cache cuantizada) introducen error adicional sobre los pesos cuantizados.
- Riesgo de alucinacion, sesgos conocidos y limitaciones idiomaticas: no disponible en la informacion proporcionada; se heredan del modelo base Qwen3.8-27B.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue esta tecnicamente restringido al hardware M6.
- El export cuantizado completo (20 GiB) solo es necesario para reconstruir los paquetes, no para ejecutar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gregcmartin/anemll-forge-qwen3.8-27B-qualityup
- Repositorio anemll-forge-qualityup: https://github.com/gregcmartin/anemll-forge-qualityup
- README del repositorio: https://github.com/gregcmartin/anemll-forge-qualityup#readme
- ANEMLL Forge (upstream): https://github.com/Anemll/anemll-forge
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Detalles de modificaciones: MODIFICATIONS.md (incluido en el repositorio del modelo)
- Manifiesto de release: release.json (incluido en el repositorio del modelo)
