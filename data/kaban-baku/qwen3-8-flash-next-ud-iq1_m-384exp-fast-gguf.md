# kaban-baku/Qwen3.8-Flash-Next-UD-IQ1_M-384Exp-Fast-GGUF

## Resumen

Qwen3.8-Flash-Next-UD-IQ1_M-384Exp-Fast es una cuantización GGUF de la familia Qwen3.8-Flash-Next, un modelo de arquitectura MoE (mixture of experts) publicado originalmente por Qwen. Esta variante concreta la produce el usuario kaban-baku a partir de tres fuentes: los pesos GGUF de Unsloth, la cuantización GSQ-RCO de ISTA-DASLab y el modelo original de Qwen. El objetivo es claro: reducir el peso del modelo lo suficiente como para que un MoE de gran tamaño pueda ejecutarse en GPUs de 8 GB, e incluso en GPUs de 4 GB con un parche específico en CPU.

La receta combina dos modificaciones. Por un lado, se poda el número de expertos por capa de 512 a 384 (manteniendo los 10 expertos activos por token). Por otro, se sustituyen las 300 matrices no expertas (atención, salida SSM y expertos compartidos) por las del fichero IQ2_XS de ISTA-DASLab, que ocupa 1,4 GB frente a los 2,3 GB de Unsloth. Esto libera 0,9 GB de VRAM en una GPU de 8 GB, lo que duplica el espacio para expertos en caché y eleva la tasa de aciertos del 75% al 88%.

El resultado es un fichero de 29,5 GB que, según las mediciones del autor en una RTX 3070 Ti Laptop de 8 GB, alcanza 65,4 tokens/s en decodificación, frente a 47,4 del UD-IQ1_M original, con una pérdida de calidad pequeña y dentro del ruido entre ejecuciones. Es un modelo pensado para inferencia local con el motor Strata, no para despliegues estándar en vLLM o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención y componentes SSM (según referencias del autor a "attention, SSM output, shared experts"); detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | 10 expertos por token sobre 384 expertos por capa (parámetros activos totales no disponibles) |
| Longitud de contexto | 128K en 8 GB; 64K en 4 GB (según configuración del motor Strata) |
| Tipos de cuantizacion | IQ1_M (expertos y router), IQ4_XS mayoritario en matrices no expertas, Q5_K a Q8_0 en el fichero original de Unsloth; KV cache q4_0 opcional |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (3 shards) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos y componentes de estado (SSM), según se deduce de la descripción del autor sobre las matrices sustituidas ("attention, SSM output, shared experts"). La variante aquí descrita no reentrena nada: todas las modificaciones son operaciones sobre bytes ya cuantizados, con verificación de nombres y formas, sin recuantizar. El router, la cabeza de salida, las hyper-connections, los expertos y el PLE son los de Unsloth.

Las dos intervenciones son: poda de expertos (de 512 a 384 por capa, conservando la selección top-10 por token) y sustitución de 300 matrices no expertas por las de la cuantización IQ2_XS de ISTA-DASLab. El autor indica que el router y la cabeza de salida no se tocan. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La innovación técnica destacable es el uso del motor Strata con caché de expertos en VRAM, presupuesto de RAM configurable y un parche que mueve la cabeza de salida a CPU para GPUs de 4 GB.

## Capacidades

- Generación de texto y razonamiento general, con modo "thinking" disponible pero no recomendado en esta variante (ver limitaciones).
- Generación de código: HumanEval 92,7% y MBPP 85,2% en las evaluaciones del autor, sin thinking y con temperatura 0.
- Conocimiento en japonés: JamC-QA 61,4% sobre 748 preguntas de opción múltiple.
- Tool calling: tool-eval-bench completo (69 escenarios) con puntuación de 85.
- Soporte de contexto largo: hasta 128K tokens en 8 GB de VRAM, 64K en 4 GB.
- Capacidades multilingües limitadas a japonés e inglés según los tags del repositorio.
- Soporte de decodificación especulativa vía MTP (multi-token prediction) en el motor Strata.
- No se documentan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Inferencia local en GPU de consumo: el modelo está diseñado para ejecutarse en una RTX 3070 Ti Laptop de 8 GB con 64 GB de RAM, alcanzando 65,4 tokens/s. Adecuado para desarrolladores que quieren probar un MoE grande sin hardware de datacenter.
- Asistente de código en local: con HumanEval al 92,7% y soporte de tool calling, puede integrarse en editores o pipelines de CI/CD para autocompletado y generación de tests en entornos sin conexión.
- Procesamiento de documentación larga en japonés e inglés: la ventana de 128K permite resumir o extraer información de contratos, manuales o informes extensos en estos dos idiomas.
- Automatización de agentes con tool calling: la puntuación de 85 en tool-eval-bench sugiere que puede encadenar llamadas a funciones en flujos multi-paso, aunque con menor margen que cuantizaciones mayores.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran medir el impacto de la poda de expertos y la sustitución de matrices en calidad y velocidad sobre el mismo hardware.
- Despliegue en equipos con 4 GB de VRAM: con el parche de cabeza de salida en CPU (STRATA_CPU_HEAD=1) y contexto de 64K, permite ejecutar el modelo en portátiles modestos a 28,4 tokens/s.
- Experimentación con motores de inferencia alternativos: sirve como banco de pruebas para Strata y sus parches de enrutamiento en modelos con menos de 512 expertos.

## Benchmarks y rendimiento

Mediciones del autor en RTX 3070 Ti Laptop 8 GB, 64 GB RAM, Windows 11, Strata 0.2.11 (engine 0.1.57) con parches, `--resident-budget-gib 24`, contexto 128K, MTP activo, `STRATA_ROUTE_PRIOR=1.5`, sin thinking y temperatura 0.

| Metrica | IQ3_S (512, ISTA-DASLab) | UD-IQ1_M (512) | UD-IQ1_M-384Exp | UD-IQ1_M-384Exp-Fast |
|---|---|---|---|---|
| Tamano fichero de expertos | 54,8 GB | 39,2 GB | 30,4 GB | 29,5 GB |
| Slots de expertos en VRAM / tasa de aciertos | 421 / 68% | 570 / 75% | 593 / 75% | 1126 / 88% |
| Decodificacion (tokens/s) | 21,3 | 47,4 | 52,7 | 65,4 |
| JamC-QA (748, japonés, 4 opciones) | 65,9% | 63,5% | 60,7% | 61,4% |
| HumanEval (164) | 92,7% | 93,9% | 93,3% | 92,7% |
| MBPP (257) | 87,9% | 89,1% | 85,6% | 85,2% |
| ELYZA-tasks-100 (sobre 5) | 3,99 | 3,76 | 3,49 | 3,35 |
| tool-eval-bench (69 escenarios) | 89 | 85 | 85 | 85 |

En GPU de 4 GB simulada (3.584 MiB libres, contexto 64K, MTP off, KV q4_0): 16,9 tokens/s con Strata 0.2.12 oficial y 28,4 tokens/s con el parche de cabeza de salida en CPU.

## Requisitos de hardware

- VRAM estimada: 8 GB para el modelo completo con contexto de 128K; 3,5 GB libres para contexto de 64K con KV cache q4_0 y cabeza de salida en CPU.
- GPU recomendadas: RTX 3070 Ti Laptop (8 GB) es la plataforma medida por el autor. No se han publicado mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en GPUs de 8 GB; con parche adicional, en GPUs de 4 GB.
- RAM: el autor usa 64 GB de sistema con `--resident-budget-gib 24`; sin límite de RAM obtiene 64,7 tokens/s (prácticamente igual).
- Opciones de despliegue: exclusivamente el motor Strata (0.2.11 o superior), con empaquetado previo mediante `tools/iq_pack.py --compat-bf16` y arranque con `--native`. No se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Throughput medido: 65,4 tokens/s en decodificación (8 GB); 28,4 tokens/s con parche en 4 GB. No se publican cifras de prefill ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decodificacion (RTX 3070 Ti 8 GB) | Licencia | Formato |
|---|---|---|---|---|---|
| UD-IQ1_M-384Exp-Fast (este) | 384 expertos/capa, top-10 | 128K | 65,4 tok/s | qwen-community-1.0 | GGUF |
| UD-IQ1_M-384Exp | 384 expertos/capa, top-10 | 128K | 52,7 tok/s | qwen-community-1.0 | GGUF |
| UD-IQ1_M (512) | 512 expertos/capa, top-10 | 128K | 47,4 tok/s | qwen-community-1.0 | GGUF |
| IQ3_S (512, ISTA-DASLab) | 512 expertos/capa, top-10 | 128K | 21,3 tok/s | qwen-community-1.0 | GGUF |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de modelos alternativos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- El modo thinking no se ha medido en este fichero. En la variante equivalente con 512 expertos, 16 de 30 preguntas entraron en bucles repetitivos hasta agotar el presupuesto de pensamiento, frente a 9 en el UD-IQ1_M original. El autor lo califica de no concluyente por el tamaño de la muestra.
- Pérdida de calidad medible frente a cuantizaciones mayores: ELYZA baja de 3,99 (IQ3_S) a 3,35; MBPP de 89,1% a 85,2%; JamC-QA de 65,9% a 61,4%. La poda de 512 a 384 expertos es la principal responsable.
- El modelo solo declara soporte de japonés e inglés; el rendimiento en castellano no está evaluado.
- Requiere el motor Strata y parches específicos (enrutamiento por lotes en CUDA, prior de enrutamiento) para alcanzar las cifras publicadas. Sin el parche de enrutamiento, la velocidad baja a unos 63,7 tokens/s; sin ninguno de los dos, es más lento.
- El tercer shard no está en este repositorio: debe descargarse del repositorio de Unsloth y renombrarse. Un error en este paso impide la carga.
- Licencia qwen-community-1.0: es necesario revisar sus términos para uso comercial; el autor la etiqueta como "other".
- Riesgo de alucinación no cuantificado en la información disponible; las evaluaciones se hicieron con temperatura 0 y sin thinking, por lo que no reflejan el comportamiento en producción con sampling.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay validación independiente de los resultados.
- La evaluación en 4 GB se hizo simulando la restricción de VRAM con otro proceso, no en una GPU real de 4 GB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaban-baku/Qwen3.8-Flash-Next-UD-IQ1_M-384Exp-Fast-GGUF
- Variante 384Exp sin el intercambio de matrices: https://huggingface.co/kaban-baku/Qwen3.8-Flash-Next-UD-IQ1_M-384Exp-GGUF
- Modelo base GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Cuantización GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramientas, scripts de evaluación y parches: https://github.com/kaban-baku/Qwen3.8-Flash-Next-IQ3_S-384Exp
- Parche de cabeza de salida en CPU: https://github.com/kaban-baku/strata-patches/tree/main/cpu-head
- Parches de enrutamiento: https://github.com/kaban-baku/strata-patches/tree/main/route-any-ne
- Issue de Strata sobre prior de enrutamiento: https://github.com/Niko1221/Strata/issues/5287
