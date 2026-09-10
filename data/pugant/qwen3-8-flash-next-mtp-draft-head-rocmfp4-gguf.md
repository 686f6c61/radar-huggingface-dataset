# pugant/Qwen3.8-Flash-Next-MTP-DRAFT-HEAD-ROCMFP4-GGUF

## Resumen

Este repositorio contiene un cabezal de borrador (draft head) MTP/NextN para decodificación especulativa, extraído del modelo Qwen/Qwen3.8-Flash-Next y requantizado por el usuario pugant. No es un modelo de chat autónomo: es un sidecar que se carga junto al modelo objetivo y se encarga de proponer tokens candidatos que el modelo grande verifica después. Su arquitectura interna corresponde al tipo `qwen4exp` y el artefacto se distribuye en formato GGUF para llama.cpp.

La particularidad del fichero es que solo se ha requantizado el tensor del cabezal LM (`output.weight`), convertido de Q8_0 a Q4_0_ROCMFP4, pasando de 644,14 MiB a 341,02 MiB. Los otros 33 tensores son idénticos byte a byte a la extracción Q8_0 de la comunidad (quimmedes). El conjunto declara 3.878.549.248 parámetros y ocupa 3,82 GB en disco.

Su relevancia es doble. Por un lado, reduce el tráfico de lectura del cabezal de borrador, que se relee completo (vocabulario de 248k por dimensión oculta de 2560) por cada token propuesto, algo crítico en hardware limitado por ancho de banda. Por otro, al usar la misma familia de cuantización que el modelo objetivo, los dos modelos se equivocan en los mismos sitios y la tasa de aceptación sube en lugar de bajar: en la medición del autor sobre una Radeon 8060S (gfx1151) con Vulkan, la aceptación pasa de 0,652 a 0,667 y la decodificación de 23,92 a 24,99 t/s.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp; cabezal MTP (NextN) de borrador para decodificacion especulativa |
| Parametros totales | 3.878.549.248 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Fichero base Q8_0; un unico tensor (`output.weight`) en Q4_0_ROCMFP4; los otros 33 tensores en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0); en HuggingFace figura como `other` |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 3,8 GB (fichero de 3,82 GB) |
| Vocabulario del cabezal LM | 248k tokens |
| Dimension oculta | 2560 |
| Numero de tensores | 34 (33 no-cabezal + `output.weight`) |
| sha256 | fa30a89fa06cd1bcc40810dcf1fed73d69c5ff33afb2a08b76333c6f9629ea34 |
| Modelo base | Qwen/Qwen3.8-Flash-Next |

## Arquitectura y entrenamiento

El artefacto no se ha entrenado: es una requantizacion derivada del cabezal MTP (tambien llamado NextN) que el equipo de Qwen entreno de forma conjunta con el modelo objetivo Qwen3.8-Flash-Next. La arquitectura del checkpoint original se etiqueta como `qwen4exp` y el grafo de borrador MTP fue integrado en llama.cpp en el linaje del PR #27739, mientras que el soporte de `qwen4exp` llego en el PR #27742 y la exportacion NextN en el PR #27836. El modulo consta de 34 tensores, entre ellos un cabezal LM de 248k tokens de vocabulario por 2560 de dimension oculta.

La innovacion tecnica del autor es la requantizacion emparejada (*matched quant*): en lugar de convertir todo el fichero, se actua solo sobre `output.weight` (Q8_0 -> Q4_0_ROCMFP4) y se dejan intactos los 33 tensores restantes, verificados como identicos por sha256. El objetivo es aliviar el cuello de botella de ancho de banda, ya que el borrador relee su cabezal LM completo para cada token propuesto. Como efecto secundario medido, al compartir familia de cuantizacion con el objetivo los errores coinciden y la aceptacion mejora. La observacion original del fenomeno la atribuye el autor a agentionai, sobre la misma clase de hardware. El procedimiento se reproduce con `llama-quantize --allow-requantize --pure --output-tensor-type Q4_0_ROCMFP4` y el script `w6t3-drafter-head-requant.sh`, que regenera el artefacto de forma bit-identica. El autor indica que el trabajo conto con asistencia de GLM de z.ai.

## Capacidades

- Decodificacion especulativa: genera tokens candidatos (hasta 6 por paso con `--spec-draft-n-max 6`) que el modelo objetivo verifica en paralelo.
- Integracion como sidecar: se carga con el flag `-md` de `llama-server`, apuntando al modelo objetivo mediante `--spec-type draft-mtp`.
- Control de agresividad del borrador: el umbral `--spec-draft-p-min 0.75` permite ajustar el compromiso entre tokens propuestos y tasa de aceptacion.
- Fidelidad greedy: en el banco de 12 prompts del motor de produccion del autor, la salida es bit-identica al canon fijado (sha `6cc4f583...`); el cambio de cuantizacion no altera el texto generado en regimen greedy.
- Carga en GPU completa del borrador: `--spec-draft-ngl all`.
- No es un modelo conversacional autonomo: no dispone de capacidades propias de generacion de texto, tool calling, agentes, vision ni audio.
- Capacidades multilingues: no disponibles como dato propio; dependen en su totalidad del modelo objetivo.

## Casos de uso

- Inferencia local de baja latencia en APUs Strix Halo: el sidecar de 3,82 GB se carga junto al objetivo ROCmFP4 STRIX_LEAN en memoria unificada y aporta un 4,5% de velocidad de decodificacion (24,99 frente a 23,92 t/s) sin cambiar la salida greedy.
- Serving autohospedado con presupuesto de memoria ajustado: al reducir el cabezal de 644,14 a 341,02 MiB, se liberan unos 303 MiB de memoria de lectura por token propuesto, utiles cuando el objetivo y la cache KV compiten por el mismo espacio.
- Reduccion de coste por token: en un motor que ya use decodificacion especulativa, una tasa de aceptacion de 0,667 frente a 0,652 implica verificar menos tokens por unidad de texto generado.
- Investigacion en decodificacion especulativa: sirve como punto de partida controlado para estudiar el efecto de la cuantizacion emparejada entre borrador y objetivo, dado que 33 de los 34 tensores permanecen constantes.
- Reproduccion de experimentos: el script del laboratorio regenera el fichero de forma bit-identica, por lo que es util para validar pipelines de cuantizacion o comparar builds de llama.cpp.
- Validacion en CI de fidelidad de motores de inferencia: el banco de 12 prompts con comparacion bit-identica frente al canon `6cc4f583...` es un caso directo de prueba de regresion en pipelines automatizados.
- Evaluacion de hardware ROCmFPX: al ser un artefacto pequeno y aislado, permite comprobar si un entorno concreto (drivers, Vulkan, build) soporta el tipo de tensor Q4_0_ROCMFP4 antes de desplegar el objetivo completo.
- Despliegue en portatiles y equipos de gama de consumo con memoria unificada: el autor demuestra su funcionamiento en una Radeon 8060S integrada, no en GPU de datacenter.

## Benchmarks y rendimiento

El autor solo publica mediciones de velocidad de decodificacion y tasa de aceptacion, realizadas en una Radeon 8060S (gfx1151) con Vulkan, usando como objetivo su build ROCmFP4 STRIX_LEAN y una configuracion `draft-mtp` de n-max 6 y p-min 0,75, con comparacion A/B intercalada. No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible.

| Sidecar | Decodificacion (t/s) | Tasa de aceptacion |
|---|---:|---:|
| Cabezal Q8_0 (comunidad) | 23,92 | 0,652 |
| Este cabezal (Q4_0_ROCMFP4) | 24,99 (+4,5%) | 0,667 |

| Prueba de fidelidad | Resultado |
|---|---|
| Banco de 12 prompts en regimen greedy | Bit-identico al canon `6cc4f583...` |
| Compresion del cabezal LM | 644,14 MiB -> 341,02 MiB |
| Tensores no-cabezal | 33 de 33 identicos por sha256 al Q8_0 de la comunidad |

## Requisitos de hardware

- VRAM estimada: el fichero ocupa 3,82 GB, por lo que se necesitan al menos unos 3,9 GB libres solo para el sidecar, a los que hay que sumar el modelo objetivo y la cache KV del borrador. La cifra es una estimacion a partir del tamano del repositorio, no un dato publicado.
- GPU utilizada en la medicion del autor: Radeon 8060S (gfx1151) integrada en APU Strix Halo, con Vulkan.
- GPU recomendadas: no disponible para modelos de datacenter (A100, H100) ni para RTX 4090; no se han publicado mediciones en esas plataformas.
- Compatibilidad con GPU de consumo: por tamano, el fichero cabe en GPUs con 4-8 GB libres, pero el requisito real es de software, no de memoria: hace falta una build con soporte ROCmFPX.
- Runtime imprescindible: llama.cpp stock no puede cargar este fichero. Se requiere una build con el tipo de tensor Q4_0_ROCMFP4, como la del laboratorio `pugant/strix-nebulosa` (rama `main`), que incluye codigo fuente, Dockerfile y guias. La definicion del formato esta en `charlie12345/ROCmFPX`.
- Opciones de despliegue: `llama-server` con `-m <objetivo> -md <draft> --spec-type draft-mtp --spec-draft-ngl all --spec-draft-n-max 6 --spec-draft-p-min 0.75`. No hay soporte declarado para vLLM, TGI u Ollama.
- Latencia y throughput medidos: 24,99 t/s de decodificacion con este cabezal frente a 23,92 t/s con el Q8_0 de la comunidad, con aceptacion de 0,667 frente a 0,652.
- Tamano en disco: 3,82 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Decodificacion (t/s) | Aceptacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este sidecar (pugant) | 3.878.549.248 | Q8_0 con cabezal en Q4_0_ROCMFP4 | 24,99 | 0,667 | Qwen Community 1.0 | HuggingFace, requiere build ROCmFPX |
| Cabezal Q8_0 de la comunidad (quimmedes) | no disponible | Q8_0 completo | 23,92 | 0,652 | Qwen Community 1.0 | HuggingFace, llama.cpp con soporte NextN |
| Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF (agentionai) | no disponible | ROCmFP4 | no disponible | no disponible | Qwen Community 1.0 | HuggingFace |
| Qwen3.8-Flash-Next (objetivo, no es un borrador) | no disponible | checkpoint original | no disponible | no disponible | Qwen Community 1.0 | HuggingFace |

Los resultados de la busqueda web realizada no aportaron informacion relevante sobre el modelo ni sobre alternativas comparables: los enlaces devueltos corresponden a servicios de correo y portales de un operador de telefonia, sin relacion con el artefacto.

## Limitaciones y advertencias

- No es utilizable de forma autonoma: sin un modelo objetivo compatible y cargado con `--spec-type draft-mtp`, el fichero no genera texto por si mismo.
- Incompatibilidad con llama.cpp stock: el tipo de tensor Q4_0_ROCMFP4 exige una build especifica; intentar cargarlo en una version estandar fallara.
- Dependencia de cadena de herramientas poco extendida: el ecosistema ROCmFPX y las builds del laboratorio no son el canal oficial de llama.cpp.
- Licencia Qwen Community License 1.0: el autor advierte explicitamente de la clausula de Model-as-a-Service antes de ofrecerlo comercialmente; conviene revisar el texto completo de la licencia.
- Riesgo de alucinacion: heredado integramente del modelo objetivo; el borrador no introduce contenido propio en regimen greedy, pero modifica la distribucion en muestreo.
- Idiomas soportados: no disponible como dato del repositorio; dependen del modelo objetivo.
- Longitud de contexto: no disponible; la ventana util la determina el objetivo, no este sidecar.
- Beneficio marginal y muy dependiente del hardware: la mejora medida es del 4,5% en decodificacion y 0,015 puntos de aceptacion, y solo se ha verificado en una Radeon 8060S con Vulkan.
- Efecto de cuantizacion emparejada no generalizable sin comprobacion: la subida de aceptacion depende de que el objetivo use la misma familia de cuantizacion; con otros objetivos el comportamiento puede invertirse.
- Madurez y validacion comunitaria nulas: 0 descargas y 0 likes en el momento del analisis, con una unica publicacion del autor y sin replicaciones independientes.
- Caracter experimental: el propio autor etiqueta todo el material como experimental y distribuido tal cual, sin garantias.
- Fidelidad verificada solo en greedy: no hay datos publicados sobre el comportamiento con temperatura mayor que cero.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pugant/Qwen3.8-Flash-Next-MTP-DRAFT-HEAD-ROCMFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Extraccion Q8_0 de origen (quimmedes): https://huggingface.co/quimmedes/Qwen3.8-Flash-Next-MTP-GGUF
- Build ROCmFP4 del objetivo (pugant): https://huggingface.co/pugant/Qwen3.8-Flash-Next-ROCMFP4_STRIX_LEAN-GGUF
- Sidecar ROCmFP4 alternativo (agentionai): https://huggingface.co/agentionai/Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF
- Laboratorio strix-nebulosa (codigo, Dockerfile y guias): https://github.com/pugant/strix-nebulosa
- Nota de laboratorio wave-6 sobre optimizacion en Vulkan: https://github.com/pugant/strix-nebulosa/blob/main/docs/experiments/2026-09-10-vulkan-optimization-wave6.md
- Script de requantizacion del cabezal: https://github.com/pugant/strix-nebulosa/blob/main/rocmfpx/scripts/w6t3-drafter-head-requant.sh
- Definicion del formato ROCmFP4 / ROCmFPX: https://github.com/charlie12345/ROCmFPX
- PR de llama.cpp con la exportacion NextN: https://github.com/ggml-org/llama.cpp/pull/27836
- PR de llama.cpp con soporte qwen4exp: https://github.com/ggml-org/llama.cpp/pull/27742
- PR de llama.cpp con el grafo de borrador MTP: https://github.com/ggml-org/llama.cpp/pull/27739
- Resultados de la busqueda web: no se encontraron enlaces relevantes sobre este modelo.
