# Accio-Lab/occamy-1.0-MTP

## Resumen

Occamy 1.0 MTP es una cabeza de predicción multi-token (MTP, *multi-token prediction*) publicada por Accio-Lab como complemento del modelo base Occamy 1.0. No es un modelo autónomo ni un adaptador PEFT: se trata de un *draft head* experimental en BF16 que se acopla a un checkpoint base congelado para habilitar decodificación especulativa en SGLang mediante el algoritmo NEXTN. El repositorio contiene únicamente la cabeza y los *hooks* de ejecución, con un peso total de 1,7 GB, e incluye 844.640.768 parámetros, de los cuales solo 8.392.704 fueron entrenables.

La cabeza se inicializó a partir de `Qwen/Qwen3.6-35B-A3B` (revisión `995ad96eacd98c81ed38be0c5b274b04031597b0`) y se adaptó usando los estados ocultos congelados de `Accio-Lab/occamy-1.0` (revisión `c1ce84770260c4137712cf22115574c4d06b993a`). El ajuste consistió en un piloto acotado de 32 pasos sobre la capa de fusión, no en un entrenamiento completo: 32 registros de entrenamiento de CNN/DailyMail, 32 pasos de optimizador, tamaño de lote 1 y longitud de secuencia 128. No se empleó profesor externo.

Su relevancia es acotada y experimental. La validación publicada demuestra paridad exacta de tokens y *logprobs* frente a referencias sin MTP en 20 de 20 prompts, con ratios de velocidad medianos de 1,10x a 1,12x en BF16 y 1,06x en NVFP4. El propio autor advierte que estos datos no constituyen una garantía de rendimiento en producción y que el piloto no demuestra una mejora de aceptación inducida por el entrenamiento respecto a la cabeza donante original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (*draft head*) para decodificación especulativa sobre un modelo base con etiqueta `qwen3_5_moe` (MoE con atención recurrente y completa); no es un modelo completo |
| Parámetros totales | 844.640.768 en la cabeza MTP; el checkpoint base Occamy 1.0 se distribuye por separado y sus parámetros no están disponibles |
| Parámetros activos | no disponible (el modelo base está etiquetado como `qwen3_5_moe`, pero no se publica el recuento de parámetros activos) |
| Longitud de contexto | no disponible para el modelo base; la configuración validada usa `--context-length 2048` |
| Tipos de cuantización | BF16 (cabeza publicada); validada contra base NVFP4 *experts-only* de ModelOpt |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`mtp-trained.safetensors`) |

## Arquitectura y entrenamiento

La pieza publicada es una cabeza MTP, es decir, un módulo auxiliar que predice varios tokens por paso para que el modelo principal los verifique después. La cabeza se inicializó desde `Qwen/Qwen3.6-35B-A3B` y conserva congelados el decodificador y el resto de tensores; solo se entrenaron tres tensores: `mtp.fc.weight`, `mtp.pre_fc_norm_embedding.weight` y `mtp.pre_fc_norm_hidden.weight`, que suman 8.392.704 parámetros de los 844.640.768 totales. Según la model card, la exportación a BF16 conserva los cambios en la proyección de fusión y en seis elementos de normalización oculta, mientras que las actualizaciones de normalización de *embeddings* se redondean a cero.

El entrenamiento fue un piloto deliberadamente mínimo: 32 registros de entrenamiento de CNN/DailyMail, 32 pasos de optimizador, tamaño de lote 1 y longitud de secuencia 128, reservando 8 registros del *split* de test para evaluación. La NLL retenida medida en el lado de entrenamiento pasó de 2,706445 a 2,660502, cifra anterior a la serialización en BF16 y descrita por el autor como una comprobación pequeña en modo *teacher forcing*, no como un *benchmark* de calidad general.

En el plano de ejecución, los *hooks* suministrados evitan que un estado de prefill obsoleto se reutilice durante la verificación y reutilizan los *kernels* de decodificación ordinarios tanto para atención recurrente como completa, manteniendo proyecciones y MoE en modo por lotes. El soporte se limita a la ruta validada: petición única, decodificación voraz, MTP1 y ruta lineal de dos nodos; los grafos, el solapamiento y la caché de prefijos se desactivan y las formas de lote o árbol no soportadas se rechazan.

## Capacidades

- Aceleración por decodificación especulativa: propone borradores de tokens que el modelo base verifica, con ratio de velocidad mediano de 1,12x en BF16 y 1,06x sobre base NVFP4 en las pruebas publicadas.
- Paridad determinista: en la validación, las 20 secuencias de tokens y las 20 comparaciones de *logprobs* coincidieron exactamente con las referencias sin MTP, en las tres combinaciones de base y cabeza probadas.
- Generación de JSON de llamada a herramientas: la validación comprueba el JSON de *tool call* emitido (no un servicio de herramientas externo) y todos los casos de ejecución de funciones Python pasaron.
- Soporte de MTP1 voraz con petición única, integrado en SGLang 0.5.13.post1 mediante `--speculative-algorithm NEXTN`.
- Cálculo de inventario y formato JSON Unicode estricto: ambas comprobaciones fallaron tanto con MTP como en sus referencias sin MTP, es decir, la cabeza reproduce el comportamiento del modelo base.
- No validado: decodificación con muestreo, peticiones concurrentes, MTP2, caché de prefijos, grafos CUDA, MTP multimodal, otros motores de inferencia y otros formatos de cuantización.
- Multilingüismo: no disponible.

## Casos de uso

- Servicio de baja latencia con una sola petición simultánea: la cabeza está validada precisamente en ese régimen (`--max-running-requests 1`, decodificación voraz), por lo que encaja en asistentes interactivos o herramientas internas donde la latencia por token importa más que el *throughput* agregado.
- Despliegue sobre base cuantizada NVFP4: para instalaciones que ya sirven `Accio-Lab/occamy-1.0-NVFP4` con `modelopt_fp4` y `flashinfer_cutlass`, la cabeza ofrece un 1,06x de mejora mediana manteniendo paridad exacta de salidas.
- Investigación en decodificación especulativa: el repositorio publica `per-request-results.json`, `evaluation_cases.json` y `VALIDATION.json` con tokens, *logprobs* y métricas por petición, lo que permite reproducir y auditar el experimento paso a paso.
- Auditoría de MTP sobre estados recurrentes: los *hooks* de `canonical_attention:install` y el volcado `mtp-strict-audit.jsonl` permiten verificar que las confirmaciones de estado nativo coinciden con los estados de verificación, incluidas las rutas de borrador aceptadas y rechazadas.
- Pruebas de regresión de paridad tras cambios de motor: al establecerse paridad exacta con una revisión concreta de SGLang y PyTorch, la cabeza sirve como artefacto de comparación cuando se actualizan estas dependencias.
- Evaluación de *tool calling* determinista: los casos de ejecución de funciones Python pasan en las 12/16 comprobaciones objetivas repetidas, útil para validar pipelines que dependen de JSON de llamada a herramientas reproducible.
- Prototipado en una única GPU: el piloto se ejecutó con peticiones secuenciales en una GPU y `--mem-fraction-static 0.50`, un perfil asequible para laboratorios con hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de *benchmarks* estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye la validación de runtime que se reproduce a continuación; son mediciones de tirada corta y el autor indica explícitamente que no constituyen garantías de rendimiento en producción.

| Base y cabeza | Borradores aceptados / propuestos | Tasa de aceptación | Secuencias exactas | Logprobs exactos | Ratio de velocidad mediano |
|---|---:|---:|---:|---:|---:|
| BF16 + cabeza donante original | 338 / 380 | 88,95 % | 20/20 | 20/20 | 1,10x |
| BF16 + cabeza entrenada | 338 / 380 | 88,95 % | 20/20 | 20/20 | 1,12x |
| NVFP4 + cabeza entrenada | 328 / 386 | 84,97 % | 20/20 | 20/20 | 1,06x |

Notas metodológicas declaradas: 10 prompts fijos por variante, dos ejecuciones cada uno, decodificación voraz y un máximo de 160 tokens generados; el ratio es la mediana de la latencia sin MTP dividida entre la latencia con MTP con los mismos tokens de salida; las peticiones se precalentaron, se ejecutaron de una en una y se midieron en orden fijo de variante en una sola GPU. Además, cada variante superó 12 de 16 comprobaciones objetivas repetidas, incluidas todas las de ejecución de funciones Python; los casos de cálculo de inventario y de formato JSON Unicode estricto fallaron también en las referencias sin MTP.

## Requisitos de hardware

- Tamaño de la cabeza: 1,7 GB en el repositorio, coherente con 844.640.768 parámetros en BF16.
- El checkpoint base es independiente y no se incluye; su VRAM necesaria no está disponible en la información proporcionada.
- Configuración validada: una sola GPU, `--mem-fraction-static 0.50`, `--context-length 2048`, `--max-total-tokens 2048` y `--max-mamba-cache-size 4`, con `--moe-runner-backend triton`.
- Backends exigidos en la prueba: atención y Mamba en Triton, `sdpa` para atención multimodal, `--disable-cuda-graph`, `--disable-overlap-schedule` y `--disable-radix-cache`.
- Entorno de software: SGLang 0.5.13.post1 (revisión de código `85fd90072d1a9f2432842b03588f63b745e524e4`) con PyTorch 2.11.0+cu130.
- Para base NVFP4 se requieren `--quantization modelopt_fp4`, `--moe-runner-backend flashinfer_cutlass` y `--speculative-moe-runner-backend triton`.
- GPU concretas recomendadas (A100, H100, RTX 4090, etc.): no disponible.
- Encaje en GPU de consumo: no disponible, dado que depende del checkpoint base no publicado en esta ficha.
- Opciones de despliegue: SGLang con NEXTN y los *hooks* suministrados; llama.cpp, Ollama, TGI y vLLM no han sido validados.
- Latencia y *throughput*: solo se publica el ratio de velocidad mediano por petición (1,10x–1,12x en BF16, 1,06x en NVFP4); no hay cifras absolutas de latencia ni de tokens por segundo.
- Escalado: la caché de prefijos, el solapamiento y los grafos CUDA están desactivados, y no se validaron peticiones concurrentes ni MTP2.

## Comparativa con modelos similares

No se dispone de datos de modelos competidores en la información proporcionada. La comparación más pertinente es interna, dentro de la propia familia Occamy:

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Accio-Lab/occamy-1.0-MTP | Cabeza MTP (draft head) | 844.640.768 en la cabeza (8.392.704 entrenables) | Validado a 2048 | 1,12x en BF16, 1,06x en NVFP4 | Apache 2.0 | HuggingFace, requiere base |
| Accio-Lab/occamy-1.0 | Modelo base congelado | no disponible | no disponible | no disponible | no disponible en esta información | HuggingFace |
| Accio-Lab/occamy-1.0-NVFP4 | Base cuantizada *experts-only* | no disponible | no disponible | 84,97 % de aceptación con la cabeza entrenada | no disponible en esta información | HuggingFace |
| Qwen/Qwen3.6-35B-A3B (revisión `995ad96e…`) | Modelo donante de la inicialización | no disponible en esta información | no disponible | no disponible | no disponible en esta información | HuggingFace |

Alternativas conceptuales del mismo tipo (EAGLE-3, Medusa u otras cabezas MTP integradas en modelos como DeepSeek-V3): no disponible, no se han encontrado datos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un checkpoint base separado (`Accio-Lab/occamy-1.0` o `Accio-Lab/occamy-1.0-NVFP4`) y no funciona por sí solo.
- No es un adaptador PEFT: no debe cargarse con `PeftModel` ni `load_adapter`; hay que usar `assemble_head.py` y SGLang NEXTN.
- Alcance de validación muy estrecho: solo petición única, decodificación voraz, MTP1, ruta lineal de dos nodos, sin grafos, sin solapamiento y sin caché de prefijos. Las formas de lote y árbol no soportadas se rechazan.
- La paridad exacta se estableció con los *hooks* suministrados, no con la ruta de verificación sin modificar de SGLang; los resultados no constituyen una afirmación de equivalencia universal.
- Los propios autores señalan que el piloto no demuestra una mejora de aceptación inducida por el entrenamiento respecto a la cabeza donante original: la tasa de aceptación es idéntica (88,95 %) y el ratio de velocidad pasa de 1,10x a 1,12x.
- Las mediciones se hicieron con 10 prompts, dos repeticiones cada uno y un máximo de 160 tokens generados; no son garantías de *throughput* en producción.
- Rendimiento sobre base NVFP4 algo inferior en aceptación (84,97 %) que sobre BF16 (88,95 %).
- Dependencia estricta de versiones: SGLang 0.5.13.post1 con revisión `85fd9007…` y PyTorch 2.11.0+cu130. Otras versiones no fueron validadas.
- Cuatro de las 16 comprobaciones objetivas fallaron (cálculo de inventario y formato JSON Unicode estricto), aunque también fallan en las referencias sin MTP, lo que apunta a una limitación heredada del modelo base.
- El *tool calling* validado comprueba el JSON emitido, no la integración con un servicio de herramientas externo.
- Sesgos conocidos: no disponible. La composición del dataset de ajuste (CNN/DailyMail) es muy reducida y de dominio periodístico en inglés.
- Riesgo de alucinación del modelo base: no evaluado en esta información; la cabeza MTP no corrige errores semánticos, solo acelera la generación.
- Idiomas soportados: no disponible; no se documenta cobertura multilingüe.
- Licencia Apache 2.0 declarada en la etiqueta y en la model card, lo que en principio permite uso comercial, pero conviene verificar la licencia del checkpoint base, que no se detalla en la información de esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Variante cuantizada NVFP4: https://huggingface.co/Accio-Lab/occamy-1.0-NVFP4
- Modelo donante de la inicialización: https://huggingface.co/Qwen/Qwen3.6-35B-A3B (revisión `995ad96eacd98c81ed38be0c5b274b04031597b0`)
- Registro de entrenamiento: https://huggingface.co/Accio-Lab/occamy-1.0-MTP/blob/main/TRAINING.json
- Resultados por petición: https://huggingface.co/Accio-Lab/occamy-1.0-MTP/blob/main/per-request-results.json
- Casos de evaluación: https://huggingface.co/Accio-Lab/occamy-1.0-MTP/blob/main/evaluation_cases.json
- Resultados agregados de validación: https://huggingface.co/Accio-Lab/occamy-1.0-MTP/blob/main/VALIDATION.json
- Script de ensamblado: `assemble_head.py` (incluido en el repositorio)
- SGLang: https://github.com/sgl-project/sglang (versión probada 0.5.13.post1)
- Paper, blog o demo oficial: no disponible
- Búsqueda web: los resultados obtenidos no guardan relación con Accio-Lab ni con Occamy 1.0; corresponden a un producto de *sourcing* con IA de nombre similar (`accio.com`), por lo que se descartan como fuentes.
