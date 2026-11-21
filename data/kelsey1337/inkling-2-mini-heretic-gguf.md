# kelsey1337/Inkling-2-Mini-heretic-GGUF

## Resumen

Inkling-2-Mini-heretic-GGUF es una coleccion de cuantizaciones GGUF del modelo yanauto/Inkling-2-Mini-heretic, una version "abliterated" (decensored) de Inkling 2 Mini, el modelo multimodal desarrollado por Thinking Machines. El trabajo de abliteration, incluida la matriz de importancia (imatrix), es de yanauto; este repositorio de kelsey1337 solo anade las cuantizaciones de bits bajos e intermedias que el repositorio original no distribuye (Q4_K_M, Q8_0 y BF16). El modelo base emplea una arquitectura MoE con 26.070.385.152 parametros totales y capacidad de entrada de imagen mediante un proyector de vision.

La relevancia de esta publicacion es practica: permite ejecutar localmente un modelo de 26B en GPUs de consumo gracias a cuantizaciones que van desde IQ1_S (8,6 GB) hasta IQ2_M (10,7 GB) y Q2_K (10,9 GB), con perplexity medida en wikitext-2 de 7,2156 para IQ2_M. El modelo conserva las capacidades conversacionales y multimodales del original, pero con las barreras de rechazo reducidas (segun yanauto, de 100/100 rechazos a 6/100), lo que implica riesgos adicionales de seguridad que el autor advierte explicitamente.

El modelo esta licenciado bajo Apache 2.0 y requiere llama.cpp mainline build b12600 o superior (layout `inkling2_loop`, PR #32694) para cargar correctamente; no funciona con los binarios precompilados del fork de Unsloth ni con builds de #32695. Esta restriccion de compatibilidad es el dato mas importante para cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer; layout `inkling2_loop` en llama.cpp |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de despliegue usa `-c 32768`) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K (y Q4_K_M, Q8_0, BF16 en el repo de yanauto) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base); proyector de vision en GGUF F16 (`mmproj-...-F16.gguf`) |

## Arquitectura y entrenamiento

El modelo es una arquitectura MoE de 26.070.385.152 parametros totales, segun los datos de safetensors del modelo base. La model card de este repositorio no detalla el numero de expertos, la proporcion de parametros activos por token, el numero de tokens de entrenamiento ni la composicion del dataset. El tag `ara` y la descripcion "Heretic ARA (attention output only)" indican que la modificacion de yanauto se aplico exclusivamente sobre las salidas de atencion, no sobre las proyecciones MLP ni los embeddings, lo que explica la preservacion casi total de capacidades: MMLU pasa de 78,7 % a 78,0 % y la divergencia KL respecto al original es de 0,049.

La innovacion tecnica documentada es el proceso de abliteration con Heretic ARA, que elimina direcciones de rechazo en las salidas de atencion. No se documenta en la informacion disponible si el modelo original uso RLHF, DPO u otras tecnicas de alineacion, ni detalles sobre decodificacion especulativa o atencion lineal. Las cuantizaciones se generaron con llama.cpp en el commit `19bc41d` usando la imatrix de yanauto (wikitext-2 train, 200 chunks), que se incluye en el repositorio. El ejemplo de muestreo recomendado por Thinking Machines es temperature 1.0, top-p 1.0, top-k desactivado y min-p 0.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte del template Jinja (`--jinja` en llama-server).
- Entrada de imagen mediante el proyector de vision F16 incluido (`mmproj-Inkling-2-Mini-heretic-attn-F16.gguf`, 0,64 GB).
- Razonamiento y respuesta a instrucciones heredados del modelo original, con MMLU del 78,0 % tras la abliteration.
- Ejecucion local en llama.cpp con cuantizaciones de 8,6 GB a 10,9 GB para GPUs de consumo.
- Capacidad de seguir instrucciones procedentes de contenido no confiable con mayor facilidad que el original (efecto secundario de la abliteration, advertido por el autor).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes multi-paso, audio ni modo thinking explicito.

## Casos de uso

- Despliegue local en GPU de consumo: con IQ1_S (8,6 GB) o IQ2_M (10,7 GB) el modelo cabe en GPUs de 12-16 GB de VRAM y permite conversacion multimodal sin conexion, usando `llama-server` con `-ngl 99`.
- Prototipado de asistentes conversacionales sin censura: util para investigacion sobre alineacion, estudios de rechazo y evaluacion de sesgos, donde se necesita un modelo que responda a peticiones que el original bloquea.
- Analisis de imagenes en local: el proyector F16 permite pasar imagenes junto con texto para descripcion o extraccion de informacion, sin enviar datos a la nube.
- Evaluacion comparativa de cuantizaciones: el repositorio publica perplexity en wikitext-2 para algunas cuantizaciones (IQ2_M: 7,2156; Q4_K_M: 6,879), lo que facilita medir el coste de calidad de cada nivel de compresion en un pipeline propio.
- Experimentacion con arquitecturas MoE en llama.cpp: sirve para validar el layout `inkling2_loop` y el rendimiento de un MoE de 26B en hardware modesto.
- Red teaming y pruebas de seguridad: el modelo, al ser mas permisivo, es adecuado para generar casos adversarios y evaluar filtros de contenido en sistemas de moderacion.
- Generacion de texto creativo sin restricciones tematicas en entornos controlados y con supervision humana.

## Benchmarks y rendimiento

| Metrica | Original (Inkling 2 Mini) | Heretic (yanauto) | IQ2_M (este repo) | Q4_K_M (este repo) |
|---|---|---|---|---|
| MMLU | 78,7 % | 78,0 % | no disponible | no disponible |
| Rechazos (100 prompts) | 100/100 | 6/100 | no disponible | no disponible |
| KL divergence | — | 0,049 | no disponible | no disponible |
| Perplexity wikitext-2 (40 chunks) | no disponible | no disponible | 7,2156 | 6,879 |

Los datos de MMLU, rechazos y KL provienen de yanauto y se citan en la model card. La perplexity de IQ2_M y Q4_K_M se midio en wikitext-2 test con 40 chunks; el resto de cuantizaciones no tiene medicion publicada (celdas vacias significan "no medido", no "fallido"). No hay resultados de HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo mas overhead de contexto. IQ1_S: ~9-10 GB; IQ2_M: ~11-12 GB; Q2_K: ~11-12 GB. El proyector de vision anade 0,64 GB si se usa entrada de imagen.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para cuantizaciones IQ2 y Q2_K con contexto amplio; A100/H100 para BF16 o Q8_0. En GPUs de 12 GB (RTX 3060, RTX 4070) cabe IQ1_S o IQ1_M con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con IQ1_S/IQ1_M y en RTX 4090 con IQ2_M o Q2_K. No cabe en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp mainline build b12600 o superior (obligatorio); `llama-server` con `--jinja -ngl 99 -c 32768` y `--mmproj` para vision. No compatible con los precompilados del fork de Unsloth ni con builds de #32695. No se documenta soporte en vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-heretic (este repo) | 26,07B (MoE) | no disponible | 78,0 % | Apache 2.0 | GGUF |
| Inkling 2 Mini (original) | 26,07B (MoE) | no disponible | 78,7 % | no disponible | safetensors/GGUF |
| yanauto/Inkling-2-Mini-heretic | 26,07B (MoE) | no disponible | 78,0 % | Apache 2.0 | GGUF (Q4_K_M, Q8_0, BF16) |

La unica diferencia sustantiva frente al original es la reduccion de rechazos (100/100 a 6/100) con una perdida de 0,7 puntos en MMLU. Frente al repositorio de yanauto, este anade cuantizaciones de 1-2 bits que permiten ejecucion en GPUs mas pequenas. No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: responde a peticiones que el original rechaza. El usuario es responsable del uso y del cumplimiento de la politica de uso aceptable de Thinking Machines.
- Mayor susceptibilidad a inyeccion de instrucciones desde contenido no confiable (paginas web, archivos de repositorio, salida de herramientas). No combinar con credenciales activas ni acceso a shell sin sandbox.
- Perdida de calidad medible: MMLU cae de 78,7 % a 78,0 % y la perplexity de IQ2_M (7,2156) es superior a la de Q4_K_M (6,879), lo que indica degradacion adicional por cuantizacion agresiva.
- Compatibilidad estricta: requiere llama.cpp b12600 o superior; los binarios precompilados de Unsloth y los builds de #32695 fallan al cargar.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Contexto maximo no documentado; el ejemplo usa 32.768 tokens, pero no se confirma como limite real.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- El repositorio tenia 0 descargas y 0 likes en el momento de la consulta, y la subida de cuantizaciones estaba en curso, por lo que pueden faltar archivos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kelsey1337/Inkling-2-Mini-heretic-GGUF
- Modelo base (abliterated): https://huggingface.co/yanauto/Inkling-2-Mini-heretic
- GGUF de yanauto: https://huggingface.co/yanauto/Inkling-2-Mini-heretic-GGUF
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- PR de llama.cpp para el layout `inkling2_loop`: #32694 (referenciado en la model card)
