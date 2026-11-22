# Abu-Dju/Index-Echo-S2ST-2B-GGUF

## Resumen

Index-Echo-S2ST-2B-GGUF es la conversion a formato GGUF del backbone LLM de texto (`stlm_llm/`) del modelo IndexTeam/Index-Echo-S2ST-2B v4.1, perteneciente a la familia Index-Echo de traduccion voz a voz (speech-to-speech translation, S2ST) desarrollada por bilibili. El paquete v4.1 actualiza el traductor multilingue y amplia la cobertura a doce direcciones de traduccion: entrada de voz en chino, japones o ingles, doblada a ingles, espanol, japones, coreano o chino.

El repositorio contiene unicamente el backbone LLM convertido con llama.cpp (master, 2026-10-13) mediante cuantizacion estatica post-entrenamiento, con todos los anchos de bit en un solo repositorio. La torre de audio, el conector y el stack de sintesis de voz no estan incluidos, por lo que llama.cpp no puede ejecutar el pipeline completo de voz a voz; para inferencia S2ST completa debe usarse el checkpoint original o la build FP8 Index-Echo-S2ST-2B-FP8.

El modelo cuenta con 1.881.825.088 parametros reales (segun safetensors) y licencia Apache 2.0. Su relevancia radica en ofrecer una via de despliegue ligera y compatible con llama.cpp del componente linguistico de un sistema de traduccion simultanea, con tamanos que van desde 0,97 GB (Q2_K) hasta 3,78 GB (f16), lo que permite ejecucion en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone LLM de un sistema S2ST multimodal; arquitectura interna no detallada) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyectores multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | no disponible (la familia cubre chino, japones, ingles, espanol y coreano en el pipeline S2ST completo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es el backbone LLM de texto del sistema Index-Echo S2ST v4.1, un pipeline multimodal que combina una torre de audio, un conector y un stack de sintesis de voz con el modelo linguistico. La conversion a GGUF se realizo con llama.cpp (master, 2026-10-13) mediante cuantizacion estatica post-entrenamiento, generando todos los anchos de bit en un unico repositorio. Los ficheros `mmproj` corresponden al proyector multimodal de la torre de vision y solo son necesarios para entrada de imagen con `llama-mtmd-cli`; para traduccion solo texto bastan los GGUF planos. El paquete v4.1 ya no incluye esta torre dentro de `stlm_llm/`, y los `mmproj` se arrastran sin cambios desde la release inicial.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones arquitectonicas internas (atencion lineal, decodificacion especulativa, etc.) mas alla de su papel como componente linguistico del pipeline S2ST. La validacion de consistencia de cada nivel de cuantizacion se realizo frente a la conversion F16 mediante divergencia KL por token y delta RMS de probabilidad con `llama-perplexity` (build de CPU), ademas de comprobaciones de generacion greedy frente a los pesos BF16 originales.

## Capacidades

- Traduccion de texto multilingue como componente linguistico del sistema S2ST; el pipeline completo cubre doce direcciones entre chino, japones, ingles, espanol y coreano.
- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de entrada de imagen mediante los ficheros `mmproj` y `llama-mtmd-cli` (heredado de la release inicial).
- Ejecucion en llama.cpp (`llama serve`, `llama cli`).
- No incluye tool calling, function calling ni capacidades de agente documentadas en la informacion disponible.
- No incluye las capacidades de audio ni de sintesis de voz del sistema completo; estas residen en el checkpoint original o en la build FP8.

## Casos de uso

- Traduccion de texto en pipelines de localizacion: el backbone puede procesar cadenas de texto para generar traducciones entre los idiomas cubiertos por la familia, integrándose en flujos de preproduccion o post-edicion donde no se requiere el pipeline de audio.
- Prototipado de sistemas de traduccion voz a voz: usar este GGUF para validar la capa linguistica y el comportamiento del traductor antes de desplegar el pipeline S2ST completo con el checkpoint original o la build FP8.
- Investigacion sobre cuantizacion: el repositorio incluye doce niveles de cuantizacion con metricas de PPL, KLD y coincidencia top-1 frente a F16, lo que permite estudiar el impacto de la cuantizacion en un modelo de 1.880 millones de parametros.
- Despliegue en hardware de gama baja: con Q4_K_M (1,27 GB) o Q3_K_M (1,10 GB) el modelo cabe en GPUs de consumo y en CPU, adecuado para entornos con recursos limitados.
- Procesamiento de texto con entrada de imagen: mediante los ficheros `mmproj` y `llama-mtmd-cli`, se puede usar el modelo para tareas que combinen imagen y texto en el contexto de traduccion.
- Evaluacion comparativa de cuantizaciones en produccion: las metricas de consistencia publicadas (por ejemplo, Q8_0 con KLD 0,001318 y 99,02% de coincidencia top-1) permiten seleccionar el nivel adecuado segun el equilibrio calidad/espacio.
- Integracion en servidores compatibles con endpoints: el tag `endpoints_compatible` facilita su uso detras de APIs de inferencia estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente proporciona metricas de consistencia de cuantizacion frente a F16:

| Cuantizacion | PPL (corpus fijo) | KLD media | RMS Δp | Coincidencia top-1 |
|---|---:|---:|---:|---:|
| IQ4_XS | 4,9447 | 0,071674 | 7,86% | 91,13% |
| Q2_K | 10,6969 | 1,090653 | 33,49% | 63,01% |
| Q3_K_L | 5,4337 | 0,217771 | 13,94% | 84,47% |
| Q3_K_M | 5,4265 | 0,244748 | 14,17% | 83,30% |
| Q3_K_S | 6,0653 | 0,349583 | 17,79% | 80,43% |
| Q4_K_M | 4,9306 | 0,070487 | 7,82% | 90,93% |
| Q4_K_S | 4,8496 | 0,074472 | 7,77% | 90,74% |
| Q5_K_M | 4,7035 | 0,020143 | 4,31% | 94,98% |
| Q5_K_S | 4,6823 | 0,021831 | 4,37% | 94,85% |
| Q6_K | 4,7519 | 0,008402 | 2,67% | 96,48% |
| Q8_0 | 4,7325 | 0,001318 | 1,20% | 99,02% |
| f16 | 4,7059 | (referencia) | - | - |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas overhead de contexto. Q4_K_M ocupa 1,27 GB, Q5_K_M 1,41 GB, Q8_0 2,01 GB y f16 3,78 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones bajas; A100, H100 o RTX 4090 no son necesarias para este tamano, aunque pueden usarse para mayor throughput.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) puede ejecutar Q4_K_M o Q5_K_M; las cuantizaciones Q2_K y Q3_K caben incluso en iGPU o en CPU.
- Opciones de despliegue: llama.cpp (`llama serve`, `llama cli`), `llama-mtmd-cli` para entrada de imagen con los ficheros `mmproj`. El repositorio declara compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota: el pipeline S2ST completo (audio + sintesis) no puede ejecutarse con este repositorio; requiere el checkpoint original o la build FP8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Index-Echo-S2ST-2B-GGUF | 1.881.825.088 | no disponible | Apache 2.0 | GGUF | Solo backbone LLM, sin audio ni sintesis |
| IndexTeam/Index-Echo-S2ST-2B (original) | no disponible | no disponible | no disponible | safetensors/BF16 | Pipeline S2ST completo |
| IndexTeam/Index-Echo-S2ST-2B-FP8 | no disponible | no disponible | no disponible | FP8 | Pipeline completo con LLM cuantizado en FP8 |

No se dispone de informacion suficiente para comparar con modelos de traduccion de la misma categoria en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El repositorio contiene unicamente el backbone LLM; no incluye torre de audio, conector ni sintesis de voz, por lo que no puede realizar traduccion voz a voz con llama.cpp.
- Los ficheros `mmproj` son heredados de la release inicial y solo sirven para entrada de imagen; no aportan capacidades de audio.
- La cuantizacion Q2_K presenta una perdida de calidad significativa (PPL 10,6969 frente a 4,7059 en F16; 63,01% de coincidencia top-1); no recomendada para produccion.
- Las cuantizaciones Q3_K tienen perdida de calidad notable (PPL entre 5,43 y 6,07; coincidencia top-1 entre 80,43% y 84,47%).
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o de idioma especificas del backbone.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del pipeline completo en el repositorio original antes de desplegar S2ST en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- No se detallan los idiomas exactos soportados por el backbone de texto de forma aislada; la cobertura de doce direcciones corresponde al pipeline completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Abu-Dju/Index-Echo-S2ST-2B-GGUF
- Modelo base: https://huggingface.co/IndexTeam/Index-Echo-S2ST-2B
- Build FP8 del pipeline completo: https://huggingface.co/IndexTeam/Index-Echo-S2ST-2B-FP8
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
