# mrothroc/mixlab-gptbert-masked-focus-replica

## Resumen

`mixlab-gptbert-masked-focus-replica` es una reproducción desde cero del baseline **BabyLM 2025 GPT-BERT *masked-focus* Strict-Small**, desarrollada por el autor `mrothroc` y entrenada íntegramente en una única GPU de Apple Silicon (M1 Max) mediante **mixlab**, un entrenador abierto basado en Metal/MLX. No es una entrada de competición, sino una demostración de fidelidad: el objetivo es verificar que un entrenador de hardware de consumo puede replicar, componente a componente, un baseline oficial de arquitectura no trivial.

El modelo no es un transformer vainilla. GPT-BERT *masked-focus* es un híbrido masked+causal con atención relativa desacoplada estilo DeBERTa, compuerta de valores en la atención, agregación densa de capas (DWA) y cabeza MLM estilo BERT. Cuenta con 12 capas, dimensión oculta 384, 6 cabezas y vocabulario de 16.384 tokens, con embeddings atados. El repositorio declara ≈33M de parámetros atados, mientras que el `model.safetensors` exportado contiene 39.337.540 parámetros al incluir una copia redundante y sin atar de `lm_head`.

Su relevancia es doble: por un lado, sirve como referencia reproducible para quien quiera auditar la implementación del baseline 2025 con `trust_remote_code=True`; por otro, documenta un flujo completo (preparación de datos, entrenamiento, exportación, verificación de paridad numérica y evaluación) ejecutable en unas 5,5 horas en una máquina de consumo. Está publicado bajo licencia MIT y solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido masked+causal (GPT-BERT masked-focus): atención relativa desacoplada estilo DeBERTa con ventana, GeGLU, value-gate, DWA y cabeza MLM estilo BERT |
| Parametros totales | 39.337.540 (según `model.safetensors`, incluye copia redundante de `lm_head` sin atar); ≈33M atados según la model card |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (secuencia máxima de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors sin cuantizaciones alternativas |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura se describe explícitamente en el `config.json` y en el `training_config.mixlab.json` del repositorio. Se trata de un transformer de 12 capas con hidden 384 y 6 cabezas de atención, embeddings atados, feed-forward GeGLU con dimensión intermedia 1280 y LayerNorm interno, y LayerNorm afín (eps 1e-7) tanto antes como después de la atención (esta última antes de la proyección de salida). Incorpora atención relativa desacoplada estilo DeBERTa con embedding relativo compartido y reutilización de las proyecciones QK de contenido, además de sesgos de atención y una compuerta sobre los valores de la atención. La agregación densa de capas (DWA) calcula una suma ponderada aprendida sobre todas las salidas previas de subcapas, y la cabeza de predicción es de tipo MLM estilo BERT.

El objetivo de entrenamiento es un híbrido por ejemplo de CLM + MNTP, en el que la variante *masked-focus* dedica un 6,25 % al objetivo causal, con un calendario de máscara que decae de 0,30 a 0,15. Los datos corresponden al corpus **BabyLM 2026 detoxified Strict-Small** (≈10M de palabras, 15,9M de tokens), procesado con marcadores de segmento `<s>` insertados en el flujo de tokens empaquetado según la convención del baseline de referencia. El entrenamiento emplea el optimizador LAMB con lr 0,007, weight decay 0,1, z-loss 1e-4 y un calendario de warmup del 1,6 % seguido de coseno y cooldown: 9.600 pasos de 16.384 tokens (≈10 epochs, frente a los 9.914 del baseline) con currículum de secuencia 128→256→512. El tokenizador es el de referencia, de 16.384 entradas (`<unk>`=0, `<s>`=1, `</s>`=2, `<pad>`=3, `<mask>`=4).

Como innovación destacable, el repositorio exporta tanto `MixlabForCausalLM` como `MixlabForMaskedLM` con `trust_remote_code=True`, y declara una paridad numérica entre la implementación nativa y la de HuggingFace de aproximadamente 7e-8, lo que constituye una verificación cuantitativa de equivalencia funcional.

## Capacidades

- Generación de texto autoregresiva mediante `MixlabForCausalLM` (`text-generation`).
- Rellenado de máscaras (masked language modeling) mediante `MixlabForMaskedLM` (`fill-mask`).
- Modelado híbrido: el entrenamiento combina objetivos causales y de predicción de token enmascarado, lo que permite ambas modalidades de evaluación.
- Codificación de representaciones contextuales reutilizables para tareas de comprensión (la evaluación GLUE reportada implica ajuste fino sobre representaciones del modelo).
- Capacidad demostrada de captar fenómenos sintácticos y semánticos básicos del inglés, medida con BLiMP (70,64), BLiMP-supplement (61,79), EWoK (50,88), entity tracking (40,33) y COMPS (52,85).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, únicamente inglés.
- Capacidades especiales (visión, audio, modo *thinking*): no disponibles. El modelo es exclusivamente de texto.

## Casos de uso

- Reproducción y auditoría de baselines académicos: el modelo permite verificar componente a componente (BLiMP, EWoK, entity tracking, COMPS, reading, GLUE) el baseline GPT-BERT masked-focus de BabyLM 2025 sin necesidad de acceso a clústeres de GPU, ya que el entrenamiento completo cabe en 5,5 horas sobre un M1 Max.
- Validación de entrenadores en hardware de consumo: sirve como prueba de extremo a extremo de que un *trainer* Metal/MLX (mixlab) reproduce fielmente una arquitectura externa, con paridad de logits verificada a ≈7e-8 frente a la exportación de HuggingFace.
- Investigación en adquisición del lenguaje infantil: al entrenarse sobre el corpus BabyLM Strict-Small (≈10M palabras, 15,9M tokens), es adecuado para estudios sobre qué estructuras lingüísticas se adquieren con presupuestos de datos comparables a la exposición infantil.
- Evaluación de métricas de psicolingüística computacional: los datos de *reading* (eye-tracking y SPR) permiten usar el modelo como sujeto sintético en experimentos sobre coste de procesamiento y surprisal, con la salvedad del bug conocido en el scorer de AoA.
- Punto de partida para ajuste fino ligero en tareas de comprensión del inglés: partiendo del checkpoint, se puede reproducir el flujo de *fine-tuning* utilizado para la fila GLUE (64,18) en tareas como clasificación de frases o inferencia textual.
- Comparación de objetivos de entrenamiento: dado que exporta simultáneamente una cabeza causal y una de MLM, permite estudiar en igualdad de condiciones qué objetivo produce mejores representaciones en corpus pequeños.
- Docencia y experimentación educativa: su tamaño (33-39M de parámetros) permite ejecutarlo y modificarlo en portátiles, facilitando prácticas sobre atención relativa desacoplada, GeGLU, DWA y esquemas de enmascaramiento híbridos.
- Generación de texto de vocabulario restringido: con solo 16.384 tokens de vocabulario y 512 de contexto, puede emplearse en demostraciones controladas de generación y *fill-mask* donde el coste computacional es el factor limitante.

## Benchmarks y rendimiento

Los datos disponibles son la comparación por componente entre el baseline de referencia y esta reproducción, evaluados ambos con el mismo arnés cuando se indica. No se publica ninguna métrica agregada porque el autor no participó en la competición.

| Componente | Baseline de referencia | Esta reproducción | Δ |
|---|---:|---:|---:|
| BLiMP | 70,36 | 70,64 | +0,28 |
| BLiMP-supplement | 63,71 | 61,79 | −1,92 |
| EWoK | 51,63 | 50,88 | −0,75 |
| Entity tracking | 40,14 | 40,33 | +0,19 |
| COMPS | 53,55 | 52,85 | −0,70 |
| Reading (eye+SPR) | 6,39 | 7,30 | +0,91 |
| GLUE (ajuste fino) | 66,20 | 64,18 | −2,02 |

Advertencias sobre la tabla, según la propia model card: las seis filas *zero-shot* se reevaluaron con el mismo arnés; la fila GLUE no es una reevaluación del baseline, sino el valor oficial publicado (paper de baselines, tabla 2), mientras que la reproducción sí se ajustó y evaluó con el arnés propio. La reproducción se mantiene dentro de ≈2 puntos en todos los componentes reportados. La métrica AoA no se reporta: se puntúa a partir de una trayectoria de surprisal por checkpoint que estos artefactos no incluyen, y además el scorer tiene un bug abierto que usa un vocabulario codificado de ~300k en lugar del real, lo que hace la métrica dominada por ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,13 GB para los pesos atados (33M × 4 bytes) más el overhead de la copia de `lm_head` (el repo completo pesa 0,3 GB); en fp16, aproximadamente 0,07 GB. En la práctica cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o integradas modernas; no se requiere A100 ni H100. También funciona en CPU y en Apple Silicon.
- Compatibilidad con GPU de consumo: sí, en todas las GPU de consumo actuales y en muchas generaciones anteriores; el modelo fue entrenado y exportado en un Apple M1 Max.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido, ya que la arquitectura usa `custom_code`). No se publican pesos GGUF, por lo que llama.cpp y Ollama no son utilizables directamente sin conversión previa; vLLM y TGI no ofrecen soporte nativo para esta arquitectura personalizada sin implementación adicional.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el de entrenamiento: ≈5,5 horas sobre una única M1 Max con el entrenador mixlab.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos disponibles | Disponibilidad |
|---|---|---|---|---|---|
| mixlab-gptbert-masked-focus-replica | 39.337.540 en safetensors (≈33M atados) | 512 | MIT | BLiMP 70,64; BLiMP-supp 61,79; EWoK 50,88; entity 40,33; COMPS 52,85; reading 7,30; GLUE 64,18 | safetensors, `trust_remote_code` |
| BabyLM-community/babylm-baseline-10m-gpt-bert-masked-focus (referencia) | no disponible en la información proporcionada | no disponible | no disponible | BLiMP 70,36; BLiMP-supp 63,71; EWoK 51,63; entity 40,14; COMPS 53,55; reading 6,39; GLUE 66,20 (oficial) | checkpoint oficial del baseline 2025 |
| Baselines oficiales BabyLM 2026 (GPT-2) | no disponible | no disponible | no disponible | no disponible | arquitectura distinta, no comparable directamente |

La comparación con otros modelos de la misma categoría (modelos de lenguaje de juguete entrenados sobre corpus infantiles) no está disponible en la información proporcionada. El único punto de referencia directo y cuantificado es el baseline oficial de 2025 que este repositorio reproduce.

## Limitaciones y advertencias

- Lengua: entrenado exclusivamente en inglés; no soporta castellano ni otros idiomas. Su tokenizador de 16.384 entradas está ajustado al corpus inglés de BabyLM.
- Contexto muy corto: 512 tokens como máximo, insuficiente para conversaciones largas, documentación extensa o razonamiento multi-paso.
- Escala reducida: con ≈33M de parámetros atados, la capacidad de razonamiento, conocimiento factual y coherencia a largo plazo es limitada; los propios resultados (EWoK 50,88, COMPS 52,85) indican un rendimiento cercano al azar en varias tareas de sentido común.
- Riesgo de alucinación: elevado por construcción, dado el tamaño y los ≈10M de palabras de entrenamiento. No es adecuado para producción con requisitos de fiabilidad factual.
- Sin capacidades de tool calling, agentes ni multimodalidad.
- Código personalizado obligatorio: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio. Conviene auditar ese código antes de desplegarlo en entornos sensibles.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, pero al derivar de un baseline de la comunidad BabyLM conviene revisar las condiciones del corpus de entrenamiento subyacente para usos comerciales.
- Discrepancia de parámetros: la model card declara ≈33M atados, mientras que el archivo safetensors contiene 39.337.540 parámetros por una copia redundante y sin atar de `lm_head`. Hay que tenerlo en cuenta al calcular presupuestos de memoria o comparar conteos.
- Corpus distinto al de referencia: el entrenamiento usó el corpus Strict-Small detoxificado de BabyLM 2026, no el original de 2025, lo que introduce una diferencia metodológica respecto al baseline que se afirma reproducir.
- Métrica AoA no evaluada y con bug upstream documentado, por lo que la comparación queda restringida a los componentes reportados.
- La fila GLUE no procede de una reevaluación homogénea del baseline, así que no debe interpretarse como una comparación estrictamente controlada.
- El repositorio tiene un uso residual en el momento de redactar esta ficha (19 descargas, 0 likes), por lo que el soporte de la comunidad y la validación externa son prácticamente inexistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrothroc/mixlab-gptbert-masked-focus-replica
- Configuración de arquitectura exportada: https://huggingface.co/mrothroc/mixlab-gptbert-masked-focus-replica/blob/main/config.json
- Especificación completa de arquitectura y entrenamiento: https://huggingface.co/mrothroc/mixlab-gptbert-masked-focus-replica/blob/main/training_config.mixlab.json
- Baseline de referencia (BabyLM 2025 GPT-BERT masked-focus Strict-Small): https://huggingface.co/BabyLM-community/babylm-baseline-10m-gpt-bert-masked-focus
- Entrenador mixlab (Metal/MLX): https://github.com/mrothroc/mixlab
- Repositorio de reproducción con recetas y scripts: https://github.com/mrothroc/mixlab-babylm-gptbert
- Incidencia abierta sobre el scorer de AoA en babylm-eval: https://github.com/babylm-org/babylm-eval/issues/2
- Paper asociado (arXiv:2510.20475): https://arxiv.org/abs/2510.20475
