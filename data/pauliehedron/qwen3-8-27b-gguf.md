# Pauliehedron/Qwen3.8-27B-GGUF

## Resumen

Pauliehedron/Qwen3.8-27B-GGUF es una conversión a formato GGUF del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario Pauliehedron bajo el nombre interno "Meter Stick". El modelo base lo desarrolla el equipo Qwen de Alibaba y es un transformer multimodal de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) que acepta entradas de imagen y texto y genera texto. Esta conversión no introduce cambios arquitectónicos: su propósito declarado es servir como instrumento de medida reproducible para comparar formatos de cuantización sobre un mismo contenedor.

El interés de esta ficha radica en su enfoque metodológico. Todas las variantes comparten una estructura de tensores idéntica (866 tensores, 65 bloques, 360 tensores pequeños en F32 y una cabeza MTP en Q8_0 en el bloque 64), de modo que las diferencias de calidad medibles entre escalones se atribuyen únicamente al formato de cuantización. El autor publica además la matriz de calibración (imatrix) calculada sobre WikiText-2 y las métricas de divergencia KL frente a los logits del f16 de referencia.

La relevancia práctica es doble: por un lado, ofrece pesos GGUF listos para llama.cpp de un modelo multimodal de 27B con licencia Apache-2.0; por otro, documenta con números concretos el coste de cada grado de cuantización, algo poco habitual en repositorios de cuantización de terceros. El repositorio ocupa 192,0 GB e incluye el f16 fuente, cuatro escalones de cuantización con imatrix, el proyector de visión y los ficheros de calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); contenedor GGUF con 866 tensores, 65 bloques y cabeza MTP en Q8_0 (blk.64) |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (las evaluaciones usan n_ctx 8192) |
| Tipos de cuantizacion | f16; IQ4_NL con imatrix; IQ4_XS con imatrix; iq3_s con imatrix; iq3_xxs con imatrix; Q4_K_M (imatrix y sin imatrix); Q5_K_M (imatrix y sin imatrix); Q6_K (imatrix y sin imatrix) |
| Idiomas soportados | en, zh, ja, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 192,0 GB |
| Proyector de vision | mmproj-Qwen3.8-27B-bf16.gguf |
| Herramientas de conversion | convert_hf_to_gguf.py, llama-imatrix, llama-quantize |
| Compatibilidad de endpoints | endpoints_compatible |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal que procesa pares imagen-texto y produce texto, con un proyector de visión separado (mmproj) que se carga junto con los pesos principales en llama.cpp. El contenedor GGUF presenta 65 bloques y una cabeza MTP (multi-token prediction) cuantizada en Q8_0 de forma uniforme en todos los escalones, lo que sugiere soporte de decodificación especulativa o predicción multi-token en la arquitectura original; no se detallan más características arquitectónicas en la información disponible.

El proceso de conversión documentado es: safetensors del modelo base a f16 mediante convert_hf_to_gguf.py, cálculo de la matriz de importancia con llama-imatrix sobre el split raw-train público de WikiText-2, y cuantización por escalón con llama-quantize --imatrix. Cada escalón mezcla códecs de forma explícita: IQ4_NL e IQ4_XS aplican el codec a 433 tensores del cuerpo principal y reservan 64 tensores en Q5_K más uno en Q6_K para la cola; iq3_s e iq3_xxs aplican su codec a 498 tensores; Q4_K_M y Q5_K_M usan 433 tensores del codec principal y 65 en Q6_K; Q6_K cubre los 498 tensores. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base, la composición de su dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Comprensión de imágenes y respuesta en texto (pipeline image-text-to-text) mediante el proyector de visión bf16 incluido.
- Soporte multilingüe declarado para inglés, chino, japonés y coreano.
- Cabeza MTP en Q8_0 presente en el contenedor, orientada a predicción multi-token.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su despliegue tras una API compatible con el ecosistema de Hugging Face.
- Ejecución en llama.cpp con soporte de cuantizaciones de la familia K e I (IQ) y calibración por imatrix.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Inferencia local de un modelo multimodal de 27B en estaciones de trabajo Apple Silicon: el autor reporta ejecución en un M1 Max de 64 GB de memoria unificada, de modo que un equipo de desarrollo puede desplegar el modelo sin GPU dedicada usando el escalón IQ4_NL o IQ4_XS.
- Evaluación comparativa de cuantizaciones: el repositorio está diseñado como instrumento de medida; un equipo puede reproducir la metodología (perplejidad y divergencia KL sobre WikiText-2 con n_ctx 8192) para decidir qué escalón usar en producción con datos propios.
- Procesamiento de documentación con imágenes: al aceptar image-text-to-text, sirve para extraer información de capturas, diagramas o formularios escaneados y devolver texto estructurado, cargando el mmproj bf16 junto al GGUF principal.
- Asistencia conversacional multilingüe en inglés, chino, japonés y coreano: adecuado para productos con audiencia en esos cuatro mercados, con la salvedad de que el castellano no figura entre los idiomas declarados.
- Prototipado rápido en llama.cpp: los ficheros GGUF se cargan directamente en llama.cpp y en herramientas derivadas, lo que permite validar una idea de producto multimodal antes de invertir en infraestructura de GPU.
- Archivado y auditoría de pesos: al incluir el f16 fuente y las matrices de calibración, el repositorio permite reconstruir cualquier escalón de forma determinista y auditar la procedencia de los pesos cuantizados.
- Ajuste fino de la relación calidad/memoria en despliegues con restricción de VRAM: la tabla de divergencia KL publicada (0,0082 en Q6_K imatrix frente a 0,144804 en IQ3_XXS) permite elegir el escalón con un presupuesto de error explícito.

## Benchmarks y rendimiento

El autor publica métricas de perplejidad, velocidad y divergencia KL medidas en un Apple M1 Max (GPU de 32 núcleos, 64 GB de memoria unificada) con llama.cpp y gmlx, sobre wiki.test.raw con n_ctx 8192 y 8 fragmentos, tomando como referencia los logits del f16 del propio repositorio.

| Cuantizacion | Perplejidad (pp) | Generacion (tg) | KLD |
|---|---|---|---|
| IQ4_NL (imatrix) | 142,45 t/s | 14,38 t/s | 0,03686 |
| IQ4_XS (imatrix) | no disponible | no disponible | 0,03784 |
| IQ3_XXS (imatrix) | 138,03 t/s | 16,0 t/s | 0,144804 |
| Q4_K_M (imatrix) | pendiente de publicacion | pendiente de publicacion | 0,0294 |
| Q5_K_M (imatrix) | pendiente de publicacion | pendiente de publicacion | 0,0143 |
| Q6_K (imatrix) | pendiente de publicacion | pendiente de publicacion | 0,0082 |
| Q4_K_M (sin imatrix) | pendiente de publicacion | pendiente de publicacion | 0,0426 |
| Q5_K_M (sin imatrix) | pendiente de publicacion | pendiente de publicacion | 0,0225 |
| Q6_K (sin imatrix) | pendiente de publicacion | pendiente de publicacion | 0,0128 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: el f16 de 27,3 B requiere del orden de 55 GB solo para pesos, más overhead de contexto y del proyector de visión; los escalones de 4 bits reducen el peso a una horquilla aproximada de 15 a 18 GB, y los de 3 bits a una horquilla de 12 a 15 GB. Estas cifras son estimaciones por tamaño de parámetros, no medidas publicadas en el repositorio.
- GPU recomendadas: para f16, A100 80 GB o H100 80 GB. Para cuantizaciones de 4 bits, RTX 4090 (24 GB) o RTX 3090 (24 GB) quedan en el límite y pueden requerir descarga parcial de capas a CPU. El autor valida el funcionamiento en Apple M1 Max con 64 GB de memoria unificada.
- Cabe en GPU de consumo: sí, en los escalones IQ4_NL, IQ4_XS, iq3_s e iq3_xxs con GPU de 24 GB, asumiendo offload parcial de capas si el contexto crece.
- Opciones de despliegue: llama.cpp es el runtime de referencia del repositorio; también es compatible con herramientas que consumen GGUF (Ollama, LM Studio, servidores basados en llama.cpp). vLLM y TGI no se mencionan en la información disponible y habitualmente requieren safetensors, no GGUF.
- Latencia y throughput medidos: en M1 Max, IQ4_NL alcanza 142,45 t/s de prompt processing y 14,38 t/s de generación; IQ3_XXS alcanza 138,03 t/s de prompt processing y 16,0 t/s de generación. El rendimiento en GPU dedicada no está publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pauliehedron/Qwen3.8-27B-GGUF | 27,3 B | no disponible | Si (image-text-to-text) | Apache-2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.8-27B (modelo base) | 27,3 B | no disponible | Si (image-text-to-text) | Apache-2.0 | Safetensors en Hugging Face |
| Otras cuantizaciones GGUF del mismo modelo base | 27,3 B | no disponible | Si | Apache-2.0 | GGUF de terceros |
| Modelos multimodales de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es interna al repositorio: los escalones con imatrix superan sistemáticamente a sus equivalentes sin imatrix en divergencia KL (0,0294 frente a 0,0426 en Q4_K_M; 0,0143 frente a 0,0225 en Q5_K_M; 0,0082 frente a 0,0128 en Q6_K). No se dispone de datos de benchmarks de tareas que permitan comparar con modelos de otros fabricantes.

## Limitaciones y advertencias

- El repositorio tiene 6 descargas y 0 likes en el momento de la consulta; es una publicación de terceros sin validación comunitaria amplia.
- Los benchmarks publicados son de perplejidad y divergencia KL, no de tareas; un KLD bajo no garantiza buen rendimiento en razonamiento, código o matemáticas.
- Las métricas de velocidad proceden de un único host (Apple M1 Max) y el propio autor advierte que los resultados variarán según hardware, profundidad de contexto y carga del servidor.
- Varios escalones (Q4_K_M, Q5_K_M, Q6_K, tanto con imatrix como sin ella) tienen métricas de KLD publicadas pero marcadas como pendientes de publicación en el repositorio; conviene tratarlas como provisionales.
- El castellano no figura entre los idiomas declarados (en, zh, ja, ko), por lo que el rendimiento en español no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad ni de tasas de alucinación en la información disponible.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La licencia Apache-2.0 permite uso comercial y redistribución con atribución, pero exige distribuir una copia de la licencia con las obras derivadas; el repositorio incluye el texto en LICENSE.
- El corpus de calibración y evaluación es Salesforce/WikiText, cuyos términos se remiten a su propia ficha de dataset; el corpus no se redistribuye en el repositorio.
- El tamaño de 192,0 GB del repositorio implica un coste de almacenamiento y descarga considerable si se quieren todos los escalones; para producción basta con descargar un único GGUF más el mmproj.
- El contexto real del modelo base no está documentado en la información disponible; las evaluaciones usan n_ctx 8192, que no debe interpretarse como el límite máximo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Pauliehedron/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- gmlx: https://github.com/asher/gmlx
- Dataset de calibración y evaluación (Salesforce/WikiText): https://huggingface.co/datasets/Salesforce/wikitext
