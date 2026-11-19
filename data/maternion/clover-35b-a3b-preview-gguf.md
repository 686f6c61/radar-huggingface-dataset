# maternion/Clover-35B-A3B-Preview-GGUF

## Resumen

Clover-35B-A3B-Preview es un modelo de lenguaje de tipo mixture-of-experts (MoE) con 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, desarrollado por DiffuSpace. Se trata de un modelo de difusion para generacion de texto derivado de Qwen3.6-35B-A3B, lo que lo situa en una categoria poco habitual entre los modelos abiertos: combina un backbone hibrido de atencion completa y capas Gated DeltaNet con generacion por difusion en bloques, manteniendo un prefijo causal.

La version aqui descrita es la conversion a GGUF realizada por el usuario maternion, publicada bajo licencia Apache-2.0 y compatible con llama.cpp mainline desde el commit `e4b6c8ca6` (PR #31306, fusionado el 2 de noviembre de 2026). El modelo ofrece una ventana de contexto de 128K tokens (131.072), 40 capas, 256 expertos enrutados con top-8 y un experto compartido por capa.

Su relevancia actual radica en dos factores: por un lado, explora la difusion como alternativa a la decodificacion autoregresiva clasica dentro de un modelo MoE de tamano medio-grande; por otro, la disponibilidad de cuantizaciones GGUF (desde Q8_0 hasta Q3_K_S) permite ejecutarlo en hardware de consumo, algo poco frecuente en modelos de esta familia. Segun DiffuSpace, en el momento de su lanzamiento reportaba resultados estado del arte entre modelos de difusion open source, aunque no se han publicado cifras concretas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con Gated DeltaNet + atencion completa, generacion por difusion en bloques (`clover_moe` en llama.cpp) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B por token (top-8 de 256 expertos enrutados + 1 experto compartido por capa) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, IQ4_XS, Q3_K_M, Q3_K_S (todas sin importance matrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors BF16 |

## Arquitectura y entrenamiento

Clover emplea un backbone hibrido que alterna capas de atencion completa con capas Gated DeltaNet (GDN), un mecanismo de estado recurrente lineal. Cuenta con 40 capas, 256 expertos enrutados con enrutamiento top-8 y un experto compartido por capa. La innovacion principal es la generacion por difusion en bloques: parametros GDN adicionales aprendidos permiten atencion bidireccional dentro de cada bloque de difusion, preservando al mismo tiempo un prefijo causal que mantiene la coherencia con el contexto previo. El modelo puede ejecutarse tambien como un modelo causal ordinario token a token, que es el modo recomendado por el autor de la cuantizacion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. El modelo base es Diffuspace/Clover-35B-A3B-Preview, derivado a su vez de Qwen3.6-35B-A3B. Las cuantizaciones se generaron con `convert_hf_to_gguf.py --remote` (sin escribir safetensors en disco) y `llama-quantize` sin imatrix; los pesos cuantizados son deterministas para una revision fija del modelo y del commit de llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de 128K tokens.
- Modo de razonamiento (thinking) activado por defecto.
- Generacion por difusion en bloques, ademas de decodificacion causal clasica token a token.
- Capacidades agenticas segun DiffuSpace (benchmarks agenticos reportados en su blog de lanzamiento).
- Compatibilidad con servidor OpenAI-compatible via `llama-server` (`--jinja` para plantillas de chat).
- Soporte de decodificacion con parametros ajustados: greedy, presence penalty 0.9 y repetition penalty 1.05 por defecto.
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Razonamiento agentico con contexto largo: la ventana de 128K permite mantener historiales de herramientas, trazas de ejecucion y documentacion extensa en memoria durante tareas de varios pasos; el modelo base reporta resultados agenticos destacados segun DiffuSpace.
- Asistentes conversacionales multi-turno: el modo thinking por defecto y la decodificacion causal estandar lo hacen adecuado para chatbots con `llama-server` y API compatible con OpenAI, sin necesidad de infraestructura propietaria.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantizacion Q4_K_M (21,17 GB) cabe en 24 GB de VRAM, lo que permite ejecutar un MoE de 35B en una RTX 4090 o similar.
- Experimentacion con modelos de difusion para texto: investigadores interesados en comparar decodificacion autoregresiva frente a difusion en bloques pueden usar los distintos GGUF para reproducir experimentos con un solo modelo.
- Procesamiento de documentos largos y resumen: el contexto de 128K admite contratos, informes tecnicos o bases de codigo extensas en una sola pasada, con cuantizaciones Q6_K o Q8_0 para preservar calidad.
- Prototipado local de pipelines de generacion de texto: la integracion con llama.cpp mainline permite usar `llama-cli` y `llama-server` en entornos sin acceso a APIs en la nube, con licencia Apache-2.0 para uso comercial.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye seis niveles (Q8_0 a Q3_K_S) generados sin imatrix, utiles para medir el impacto de la cuantizacion en un modelo MoE con difusion.

## Benchmarks y rendimiento

DiffuSpace reporta resultados estado del arte entre modelos de difusion open source en el momento del lanzamiento, con benchmarks agenticos publicados en su blog. Sin embargo, las cifras numericas concretas no se incluyen en la informacion disponible, y los resultados se refieren al modelo BF16 original, no a estas cuantizaciones.

| Benchmark | Resultado |
|---|---|
| Agenticos (DiffuSpace) | reportados como SOTA entre difusion open source; cifras no disponibles |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

No se han publicado resultados de benchmarks detallados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q8_0 ~36,90 GB; Q6_K ~28,51 GB; Q4_K_M ~21,17 GB; IQ4_XS ~18,94 GB; Q3_K_M ~16,76 GB; Q3_K_S ~15,18 GB.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y Q6_K; RTX 4090 (24 GB) o A6000 (48 GB) para Q4_K_M e IQ4_XS; GPUs de 16 GB para Q3_K_M y Q3_K_S con margen ajustado.
- Cabe en GPU de consumo: si, Q4_K_M en 24 GB (RTX 4090, RTX 3090) e IQ4_XS con holgura; Q3_K_M y Q3_K_S en 16 GB.
- Opciones de despliegue: llama.cpp mainline (commit `e4b6c8ca6` o posterior) con `llama-server` y `llama-cli`. Ollama, LM Studio y binarios antiguos no reconocen la arquitectura `clover_moe` y fallaran al cargar el modelo.
- Parametros de ejecucion recomendados: `-ngl 99 -fa on -c 32768 --jinja --presence-penalty 0.9 --repeat-penalty 1.05`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Clover-35B-A3B-Preview | ~34,7B | ~3B | 128K | Apache-2.0 | GGUF, safetensors | MoE con difusion en bloques y Gated DeltaNet |
| Qwen3.6-35B-A3B (base de origen) | ~35B | ~3B | no disponible | no disponible | safetensors | Modelo autoregresivo del que deriva Clover |
| Alternativas de difusion open source | no disponible | no disponible | no disponible | no disponible | no disponible | DiffuSpace afirma SOTA entre ellas; sin cifras |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Compatibilidad estricta con llama.cpp: solo funciona en mainline desde el commit `e4b6c8ca6`; Ollama, LM Studio y binarios anteriores no cargan la arquitectura `clover_moe`.
- Las cuantizaciones se generaron sin importance matrix; IQ4_XS mejoraria con una imatrix, y Q3_K_M y Q3_K_S degradan la calidad de forma visible segun el autor.
- Los benchmarks publicados corresponden al modelo BF16 original, no a estas cuantizaciones; el rendimiento real puede diferir.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a modelos generativos de este tamano.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles, lo que impide garantizar cobertura multilingue.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y sus terminos deben verificarse en el repositorio de DiffuSpace.
- El repositorio ocupa 275 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.
- Los archivos fueron parcheados in situ tras el merge del PR (renombrado de `ssm_a`, eliminacion de 120 tensores legacy); los bytes no referenciados permanecen en el archivo, aunque los pesos cuantizados no cambian.

## Enlaces

- Repositorio GGUF: https://huggingface.co/maternion/Clover-35B-A3B-Preview-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Blog de lanzamiento: https://diffuspace.ai/blog/clover-35b/
- Benchmarks agenticos: https://diffuspace.ai/blog/clover-35b/#agentic-benchmarks
- Repositorio oficial de codigo: https://github.com/DiffuSpace/Clover-35B-A3B-Preview
- PR de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31306
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
