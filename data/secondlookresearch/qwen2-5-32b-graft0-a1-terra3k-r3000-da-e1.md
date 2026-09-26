# SecondLookResearch/Qwen2.5-32B-graft0-a1-terra3k-r3000-da-e1

## Resumen

`SecondLookResearch/Qwen2.5-32B-graft0-a1-terra3k-r3000-da-e1` es un adaptador LoRA (librería PEFT) publicado por SecondLookResearch sobre el modelo denso Qwen2.5-32B. No se trata de un modelo completo, sino de un adaptador de investigación que se monta sobre una base parcheada junto con un adaptador previo denominado A1 ("graft0-a1"). El nombre codifica el experimento: etapa de "consejo difícil" (difficult advice, `da`), sobre una escala de datos tipo ladder de 3.000 filas (`terra3k`), en el escalón `r3000`, con 1 época de entrenamiento desde cero.

Técnicamente, el adaptador es un LoRA de rango 64 y alpha 128, restringido a capas lineales, entrenado como adaptador nuevo sobre un A1 ya fusionado y congelado. El modelo base es un transformer decoder-only de aproximadamente 32.500 millones de parámetros con ventana de contexto de 131.072 tokens. El repositorio ocupa 2,2 GB y los pesos se distribuyen en formato safetensors.

La relevancia de esta ficha es limitada y hay que decirlo con claridad: se trata de un artefacto experimental con 2 descargas y 0 likes, sin model card técnica detallada, sin licencia declarada, sin benchmarks publicados y sin idiomas declarados. Su interés es fundamentalmente metodológico (composición de adaptadores en cadena, escalado por filas de entrenamiento) más que práctico para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso Qwen2.5-32B (RoPE, SwiGLU, RMSNorm, GQA) |
| Parámetros totales | ~32.500 millones en el modelo base; recuento de parámetros del adaptador no publicado (repo de 2,2 GB). LoRA de rango 64 con alpha 128 en capas lineales |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens heredados del modelo base Qwen2.5-32B; no confirmado explícitamente para el adaptador |
| Tipos de cuantización | No disponible. Pesos del adaptador en safetensors; no se publican versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible para el adaptador; el modelo base Qwen2.5 cubre decenas de idiomas, incluido el español |
| Licencia | No disponible (el modelo base Qwen2.5-32B se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | Qwen/Qwen2.5-32B |
| Librería | peft |
| Tamaño del repositorio | 2,2 GB |
| Descargas / likes | 2 / 0 |
| Fecha de publicación | 26 de septiembre de 2026, según los metadatos de HuggingFace |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 y alpha 128 aplicado exclusivamente a capas lineales, entrenado como adaptador nuevo ("fresh") sobre un adaptador A1 previamente fusionado y congelado. Según la model card, el entrenamiento se realizó durante 1 época, con un calentamiento (warmup) del 5 % con un mínimo de 2 pasos. Los datos de entrenamiento corresponden a una etapa de "consejo difícil" dentro de una escala de 3.000 filas (`terra 3k ladder`), empleando como prefijo las filas de una permutación con semilla 0 idéntica a la de los demás escalones de la escala. El conjunto de validación es `terra3k-val-qwen25.jsonl`. No se especifican el número total de tokens, la composición detallada del dataset ni si hubo etapas de RLHF o DPO.

La innovación metodológica destacable no está en la arquitectura, que es la estándar de Qwen2.5, sino en el esquema de composición: el artefacto se sirve como dos adaptadores encadenados sobre una base parcheada, primero A1 y después este adaptador. La model card indica el procedimiento de despliegue mediante el script `code/msm_eval/serve_reconstructed.sh` con las variables `ARM`, `ROW_PATCH=1` y `ADAPTERS`. No se documentan ni el dataset fuente, ni la receta exacta de fusión, ni métricas de entrenamiento (curvas de pérdida, perplejidad).

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen2.5-32B.
- La modificación de comportamiento declarada se limita a una etapa de "consejo difícil" (difficult advice) sobre la que no se publican evaluaciones.
- Capacidades heredadas del base no verificadas en el adaptador: razonamiento, generación de código, matemáticas y soporte multilingüe.
- Soporte de tool calling y function calling: disponible en Qwen2.5-32B, no confirmado sobre la composición de adaptadores.
- Soporte de agentes y razonamiento multi-paso: heredado del base, no verificado.
- Capacidad especial: es un adaptador de segunda etapa que requiere el adaptador A1 como precondición; no funciona de forma autónoma sobre el modelo base sin más.

## Casos de uso

- Investigación en composición de adaptadores: permite reproducir experimentos de encadenamiento LoRA (A1 seguido de una segunda etapa) sobre un mismo base congelado, evaluando cómo interactúan dos adaptadores entrenados por separado.
- Estudios de escalado por filas de datos: el nombre codifica un escalón de 3.000 filas dentro de una escala; sirve para analizar la relación entre volumen de datos de una etapa concreta y comportamiento resultante.
- Ablación de estrategias de entrenamiento: al ser "1 epoch from scratch" con rango 64 y alpha 128 sobre capas lineales, es un punto de comparación útil frente a otros rangos y configuraciones publicados por el mismo autor.
- Asistentes de recomendación en dominios sensibles: el entrenamiento sobre "consejo difícil" apunta a respuestas elaboradas ante consultas complicadas, siempre que se valide antes con evaluación propia.
- Reproducción de pipelines de evaluación internos: el script `serve_reconstructed.sh` y el fichero de validación `terra3k-val-qwen25.jsonl` permiten montar un banco de pruebas reproducible.
- Docencia y formación técnica: como ejemplo didáctico de cómo se publica y se sirve una cadena de adaptadores PEFT sobre un modelo de 32B.
- Integración en pipelines de investigación con PEFT y vLLM multi-LoRA: adecuado en entornos donde ya exista soporte de múltiples adaptadores simultáneos y se quiera medir su impacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se documentan curvas de entrenamiento, pérdida de validación ni comparaciones cuantitativas con el adaptador A1 o con el modelo base sin adaptar.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones a partir de la arquitectura del modelo base Qwen2.5-32B (~32.500 millones de parámetros densos, 64 capas, GQA con 8 cabezas KV de dimensión 128); no proceden de mediciones publicadas para este adaptador.

- Pesos en BF16/FP16: aproximadamente 65 GB solo para pesos, más caché KV.
- Pesos en FP8/INT8: aproximadamente 33 GB.
- Pesos en 4 bits (GPTQ, AWQ o NF4): aproximadamente 18-20 GB.
- Caché KV en FP16: ~0,25 MB por token, es decir, del orden de 8 GB para 32K tokens y de 33 GB para 128K tokens.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16 con contexto amplio; una única GPU de 40-48 GB para INT8 con contexto moderado.
- GPU de consumo: una RTX 4090 de 24 GB puede ejecutar la base en 4 bits con contexto reducido; dos RTX 4090 (48 GB) permiten 4 bits con más contexto o INT8 muy ajustado. Una RTX 3090 de 24 GB entra en el mismo escenario que la 4090 con menor throughput.
- Memoria unificada: equipos Apple con 64-128 GB pueden alojar la base cuantizada, pero el soporte de la cadena de dos adaptadores es dudoso fuera de PEFT.
- Despliegue: transformers + PEFT es la vía natural dada la librería declarada; vLLM y SGLang soportan LoRA multi-adaptador y encajan con el esquema de dos adaptadores; TGI admite adaptadores. llama.cpp y Ollama requerirían convertir el LoRA a GGUF y no está claro que respeten la composición A1 + este adaptador sobre base parcheada.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-32B-graft0-a1-terra3k-r3000-da-e1 | Adaptador LoRA sobre base de ~32.500 M | 131.072 tokens (base) | No disponible | safetensors (PEFT) | 2 descargas, 0 likes |
| Qwen2.5-32B (base) | ~32.500 M densos | 131.072 tokens | Apache 2.0 | safetensors, GGUF, GPTQ, AWQ | Ampliamente distribuido |
| Qwen2.5-32B-Instruct | ~32.500 M densos | 131.072 tokens | Apache 2.0 (con condiciones para algunos tamaños) | safetensors, GGUF, GPTQ, AWQ | Ampliamente distribuido |
| Otros adaptadores LoRA sobre Qwen2.5-32B | Depende del rango y las capas objetivo | Heredado del base | Variable, a menudo sin declarar | safetensors (PEFT) | Muy variable |

No se dispone de datos de rendimiento comparativos para este adaptador. La comparación anterior es estructural; cualquier afirmación sobre calidad de respuesta requeriría una evaluación propia, dado que el autor no publica métricas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el adaptador A1 y una base parcheada, servidos en un orden concreto. Cargarlo solo sobre Qwen2.5-32B no reproduce el comportamiento previsto.
- Licencia no declarada: no se puede asumir uso comercial. El base es Apache 2.0, pero el adaptador no especifica términos.
- Sin benchmarks ni evaluación publicada: no hay evidencia cuantitativa de mejora frente al base ni frente a A1.
- Sin model card detallada: se desconoce la composición exacta del dataset de "consejo difícil", su procedencia y sus posibles sesgos.
- Riesgo de alucinación: no medido, y en dominios de asesoramiento el fallo silencioso es especialmente costoso.
- Idiomas no declarados: aunque el base es multilingüe, el adaptador podría degradar el rendimiento fuera del idioma dominante del dataset de entrenamiento.
- Adopción prácticamente nula (2 descargas, 0 likes): sin comunidad que haya validado el artefacto ni reportado incidencias.
- Fecha de publicación futura en los metadatos (2026), lo que dificulta situarlo en una línea temporal de referencia.
- En producción, el encadenado de dos LoRA añade coste de memoria y complejidad operativa, y no todos los servidores garantizan el mismo orden de aplicación de adaptadores.

## Enlaces

- HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-graft0-a1-terra3k-r3000-da-e1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B
- Repositorio de scripts de servicio mencionado en la model card (`code/msm_eval/serve_reconstructed.sh`): no disponible como enlace público
- Conjunto de validación `terra3k-val-qwen25.jsonl`: no disponible como enlace público
- Paper, blog o demo del autor: no disponibles
- No se han encontrado en la búsqueda web enlaces relevantes sobre este modelo; los resultados devueltos corresponden a páginas de ayuda de YouTube y no guardan relación con el artefacto.
