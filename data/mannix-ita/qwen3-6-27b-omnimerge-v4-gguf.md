# ManniX-ITA/Qwen3.6-27B-Omnimerge-v4-GGUF

## Resumen

Qwen3.6-27B-Omnimerge-v4-GGUF es la versión cuantizada en formato GGUF del modelo merge Qwen3.6-27B-Omnimerge-v4, desarrollado por ManniX-ITA. Se trata de una fusión mediante DARE-TIES sobre la misma base (same-base) de Qwen/Qwen3.6-27B con tres fine-tunes adicionales de la familia Qwen3.6, siguiendo la metodología Omnimerge_v2 ya empleada en la versión anterior sobre la base Qwen3.5. La variante v4 incorpora una cirugía denominada "MLP-passthrough" que copia los pesos de las proyecciones MLP (`mlp.{gate,up,down}_proj`) directamente del Qwen3.6 limpio, con el objetivo de mitigar una fragilidad específica del etiquetado de razonamiento detectada en la base Qwen3.6.

El repositorio publica una escalera completa de cuantizaciones imatrix (desde F16 hasta IQ2_XXS) preparadas para llama.cpp, con 5145 descargas y 36 likes en el momento de la consulta. El modelo base en BF16 tiene 26.895.998.464 parámetros totales y está licenciado bajo Apache 2.0. Los benchmarks publicados muestran mejoras sustanciales respecto a la versión anterior en MBPP (+15,40 puntos porcentuales) y GPQA Diamond (+9,09 pp), manteniendo un rendimiento cercano al de la base Qwen3.6 en HumanEval. Existe además una variante MTP (Multi-Token Prediction) que conserva la cabeza de predicción multi-token para decodificación especulativa auto-especulativa, logrando una aceleración de 2,0-2,3× en una GPU de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (merge DARE-TIES sobre Qwen3.6-27B) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (los benchmarks usan budgets de razonamiento de 8192 y 12288 tokens, con `max_gen_toks` de hasta 32768) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_S, Q2_K, IQ2_XXS (26 cuantizaciones imatrix + F16, 27 archivos en total) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base BF16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión DARE-TIES same-base (metodo Omnimerge_v2) que combina Qwen/Qwen3.6-27B con tres fine-tunes de la misma familia Qwen3.6. La operacion de merge se realizo con mergekit. La innovacion principal de la v4 es la cirugia "MLP-passthrough": las proyecciones del MLP (`mlp.gate_proj`, `mlp.up_proj`, `mlp.down_proj`) se copian directamente del Qwen3.6 limpio, sin intervencion del merge, para evitar una fragilidad especifica del etiquetado de razonamiento (reasoning-tag fragility) detectada mediante inspeccion forense de deltas entre pesos. El modelo base fue entrenado por Qwen con su pipeline habitual (no se especifican datos de entrenamiento en la informacion disponible). Las cuantizaciones GGUF se generaron con imatrix usando el conjunto de calibracion v5 de bartowski, el mismo empleado para la liberacion base de Qwen3.6, lo que permite comparar directamente las metricas de calidad entre ambos repositorios.

## Capacidades

- Generacion de texto con razonamiento explicito: el modelo emite cadenas de pensamiento (CoT) de forma verbosa antes de la respuesta final, siguiendo el formato de razonamiento "deepseek" (`--reasoning-format deepseek` en llama.cpp).
- Razonamiento cientifico y tecnico de alto nivel: obtiene un 78,28 % en GPQA Diamond (greedy, 198 preguntas), superando en 9,09 puntos porcentuales a la version anterior.
- Generacion de codigo: alcanza un 83,54 % en HumanEval pass@1 (greedy) y un 73,00 % en MBPP pass@1, con un rendimiento especialmente destacado en este ultimo respecto a la base Qwen3.6 (+15,40 pp).
- Seguimiento de instrucciones: 95,00 % en IFEval (prompt_level_strict_acc) en la cohorte muestreada.
- Capacidad multilingue: limitada al ingles segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explicitamente, aunque el modo de razonamiento con presupuesto de tokens (thinking budget) permite cadenas de pensamiento largas.
- Capacidades de vision: el pipeline_tag es `image-text-to-text`, lo que indica que el modelo base Qwen3.6-27B incluye un vision tower. Sin embargo, el proyector mmproj se publica por separado en el repositorio de bartowski, no en este repo GGUF.

## Casos de uso

- Razonamiento cientifico asistido: el modelo puede resolver problemas complejos de nivel GPQA Diamond (78,28 % greedy), lo que lo hace util para investigadores que necesitan apoyo en dominios como fisica, quimica y biologia. Se usaria con un presupuesto de razonamiento alto (8192+ tokens) y extraccion flexible de la respuesta final.
- Generacion de codigo en produccion: con un 83,54 % en HumanEval y 73,00 % en MBPP, puede integrarse en pipelines de CI/CD para generar tests unitarios, implementar funciones boilerplate o autocompletar fragmentos. La cuantizacion Q6_K permite ejecutarlo en una GPU de 24 GB con latencia razonable.
- Asistente de programacion con razonamiento: el modo thinking del modelo permite explicar el razonamiento antes de escribir codigo, lo que resulta util para tareas de refactoring complejo o depuracion donde la justificacion es tan importante como el resultado.
- Evaluacion comparativa de modelos: al estar cuantizado con el mismo conjunto de calibracion que la liberacion base de bartowski, este repo sirve como referencia para comparar el impacto del merge frente al modelo original bajo condiciones identicas.
- Despliegue local en hardware de consumo: las cuantizaciones IQ2_XXS y Q3_K permiten ejecutar el modelo en GPUs de 8-12 GB, aunque con perdida de calidad. Para uso interactivo, la variante MTP (repositorio hermano) ofrece decodificacion especulativa 2,0-2,3× mas rapida en una sola GPU de 24 GB.
- Experimentacion con decodificacion especulativa: el repositorio MTP companion permite probar `llama.cpp --spec-type draft-mtp` para acelerar la inferencia sin perdida estadistica de calidad (HE 137/164 en ambos casos).

## Benchmarks y rendimiento

Los benchmarks se presentan en dos cohortes separadas que no son directamente comparables entre si: una tabla greedy (head-to-head) y una cohorte muestreada con sampler `recommended` (T=0,6). Todas las mediciones se realizaron con llama.cpp + lm_eval en condiciones identicas para la tabla comparativa.

**Tabla greedy (Q6_K, head-to-head vs Qwen3.6 base y Omnimerge-v2)**

| Benchmark | Qwen3.6 base Q6_K (bartowski) | Omnimerge-v2 (Qwen3.5 base) | Omnimerge-v4-MLP (este) | Δ vs base | Δ vs v2 |
|---|---|---|---|---|---|
| HumanEval pass@1 (164q) | 84,76 % | 79,27 % | 83,54 % (137/164) | −1,22 pp | +4,27 pp |
| MBPP pass@1 (500q) | 57,60 % | 74,60 % | 73,00 % (365/500) | +15,40 pp | −1,60 pp |
| GPQA Diamond pass@1 (flex, 198q) | no medido | 69,19 % | 78,28 % (155/198) | — | +9,09 pp |

**Cohorte muestreada (Q6_K, sampler `recommended`: T=0,6, top_p=0,95, top_k=20)**

| Benchmark | n | Score | metric / filtro |
|---|---|---|---|
| GPQA Diamond | 198 | 78,79 % | exact_match / flexible-extract (truncation-taxed) |
| HumanEval (thinking) | 164 | 98,17 % | pass@1 / extract_chat |
| IFEval | 100 | 95,00 % | prompt_level_strict_acc |
| LiveCodeBench v6 | 77 | 81,82 % | pass_at_1 (truncation-taxed) |
| MultiPL-E | 300 | 87,67 % | pass_at_1 |

Notas: los resultados de la cohorte muestreada se obtuvieron con un sampler diferente al de la tabla greedy y no deben combinarse ni restarse entre si. El resultado canonico de GPQA (greedy, 198 preguntas completas) se midio el 2026-05-22 en una GPU 3090 de Vast.ai con lm-eval 0.4.11 y parches especificos. El score strict-match de GPQA es solo del 7,58 % porque el modelo emite CoT de forma verbosa en lugar de seguir la plantilla estricta `Answer: X`; el autor indica que la metrica flex es la senal de calidad real.

## Requisitos de hardware

- VRAM estimada para inferencia: no se proporcionan cifras exactas, pero el autor indica que la variante MTP logra 2,0-2,3× de aceleracion en una sola GPU de 24 GB, lo que sugiere que la Q6_K cabe en 24 GB. Las cuantizaciones menores (Q4_K_M, Q3_K_M, IQ2_XXS) reducen los requisitos proporcionalmente.
- GPU recomendadas: RTX 3090 (usada para los benchmarks), RTX 4090, A100, H100. Para cuantizaciones Q4_K_M o inferiores, una RTX 3060 12 GB o similar puede ser suficiente.
- Compatibilidad con GPU de consumo: si, especialmente con cuantizaciones Q4_K_M o inferiores. La Q6_K requiere 24 GB.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF), Ollama (etiqueta `mannix/omnimerge-v4` publicada), text-generation-webui, y cualquier backend compatible con GGUF. Para la variante MTP se requiere llama.cpp mainline con el PR 22673 (fusionado 2026-05-16) y la opcion `--spec-type draft-mtp`.
- Latencia y throughput: no se proporcionan cifras absolutas. La variante MTP ofrece 2,0-2,3× de aceleracion en decodificacion agregada frente al repo estandar en una GPU de 24 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | MBPP | GPQA Diamond | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.6-27B-Omnimerge-v4 (este) | 26,9 B | no disponible | 83,54 % (greedy) | 73,00 % (greedy) | 78,28 % (greedy, flex) | Apache 2.0 |
| Qwen/Qwen3.6-27B (base) | 26,9 B | no disponible | 84,76 % (greedy) | 57,60 % (greedy) | no medido | Apache 2.0 |
| Qwen3.5-27B-Omnimerge-v2 | 26,9 B | no disponible | 79,27 % (greedy) | 74,60 % (greedy) | 69,19 % (greedy, flex) | Apache 2.0 |

El merge v4 mejora sustancialmente a la base Qwen3.6 en MBPP (+15,40 pp) y supera a la version anterior en GPQA Diamond (+9,09 pp) y HumanEval (+4,27 pp), a costa de una ligera perdida en HumanEval frente a la base (−1,22 pp). La licencia Apache 2.0 permite uso comercial sin restricciones de atribucion.

## Limitaciones y advertencias

- El modelo emite cadenas de razonamiento de forma verbosa y no sigue plantillas estrictas de respuesta: el score strict-match de GPQA es solo del 7,58 %, por lo que cualquier pipeline que dependa de formatos rigidos de salida necesitara extraccion flexible o post-procesamiento.
- Fragilidad del etiquetado de razonamiento: el propio autor descubrio una vulnerabilidad especifica en Qwen3.6 relacionada con las etiquetas de pensamiento, que motivo la cirugia MLP-passthrough. Esta fragilidad podria persistir en otros aspectos no cubiertos por la cirugia.
- Resultados de benchmarks sensibles a la configuracion: las diferencias de sampler, presupuesto de razonamiento y construccion del benchmark producen variaciones de hasta 6,5 pp en GPQA. Los resultados de la cohorte muestreada no son comparables con la tabla greedy.
- Truncacion en tareas largas: en GPQA, un 2,53 % de las completions alcanzaron el limite de tokens; en LiveCodeBench, un 3,9 %. Para tareas que requieran salidas muy largas, puede ser necesario aumentar los limites de generacion.
- Idioma limitado: la model card solo declara ingles. El rendimiento en otros idiomas no esta verificado.
- Sin soporte explicito de tool calling: no se menciona en la documentacion, por lo que su uso en pipelines de agentes con function calling no esta garantizado.
- La capacidad de vision del modelo base no esta incluida en este repositorio: el proyector mmproj se publica por separado en el repositorio de bartowski, por lo que este repo GGUF por si solo no puede procesar imagenes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ManniX-ITA/Qwen3.6-27B-Omnimerge-v4-GGUF
- Modelo base BF16: https://huggingface.co/ManniX-ITA/Qwen3.6-27B-Omnimerge-v4
- Variante MTP (decodificacion especulativa): https://huggingface.co/ManniX-ITA/Qwen3.6-27B-Omnimerge-v4-MTP-GGUF
- Version anterior (Qwen3.5): https://huggingface.co/ManniX-ITA/Qwen3.5-27B-Omnimerge-v2
- Etiqueta Ollama: https://ollama.com/mannix/omnimerge-v4
- Conjunto de calibracion v5 (bartowski): https://gist.github.com/bartowski1182/82ae9b520227f57d79ba04add13d0d0d
- Pagina del modelo en Inferix: https://inferix.co/models/ManniX-ITA/Qwen3.6-27B-Omnimerge-v4-MTP-GGUF
- Pagina del modelo en FriendliAI: https://friendli.ai/models/ManniX-ITA/Qwen3.6-27B-Omnimerge-v4
