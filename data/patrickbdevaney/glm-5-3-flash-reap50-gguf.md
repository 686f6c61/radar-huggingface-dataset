# patrickbdevaney/GLM-5.3-Flash-REAP50-GGUF

## Resumen

GLM-5.3-Flash-REAP50-GGUF es una familia de cuantizaciones GGUF del modelo zai-org/GLM-5.3-Flash, publicada por el usuario patrickbdevaney. El modelo base es un transformer híbrido de tipo Mixture-of-Experts (MoE) con 164.910 millones de parámetros totales, desarrollado por Z.ai (zai-org) y liberado bajo licencia MIT. La particularidad de esta versión es que ha sido sometida a una poda de expertos por relevancia (REAP, saliency pruning): de los 288 expertos enrutados por capa MoE se conservan 144, es decir, el 50 %, lo que reduce el tamaño del modelo a la mitad manteniendo, según el autor, una tasa de coincidencia top-1 de 0,8425 con el modelo sin podar sobre 241.516 tokens de validación.

El modelo combina 34 capas de atención lineal KDA (Kimi-style Delta Attention) con 11 capas de atención MLA (Multi-head Latent Attention) en una arquitectura de 45 capas más un bloque MTP (Multi-Token Prediction) adicional, totalizando 46 bloques en el GGUF. Incorpora hiper-conexiones mHC con 4 flujos y soporte de visión mediante un ViT de 24 bloques con proyector glm4v. La longitud de contexto declarada en la cabecera es de 1.048.576 tokens, aunque las pruebas de recuperación del autor solo llegan a 32.000 tokens.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 165.000 millones de parámetros en una única máquina con 128 GB de memoria unificada (por ejemplo, un Jetson AGX Thor), algo inviable con el modelo completo en FP16. Se ofrecen cinco niveles de cuantización entre 67,2 y 92,5 GiB, todos ellos dependientes de un fork parcheado de llama.cpp, ya que el llama.cpp upstream no puede cargar estos ficheros por diferencias en las claves de metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención KDA y MLA (`glm5-next` en GGUF) |
| Parametros totales | 164.907.253.550 (164,91 B) |
| Parametros activos | 8 expertos enrutados activos por token, más 1 experto compartido; anchura FFN de experto 2048 |
| Longitud de contexto | 1.048.576 tokens en cabecera; recuperación verificada solo hasta 32.000 tokens |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M (GGUF); FP8 y NVFP4 en repos hermanos |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp); safetensors FP8 y NVFP4 en repos hermanos |
| Capas | 45 más 1 bloque MTP (`blk.45`); capas 0-2 con FFN densa |
| Hidden size / cabezas | 4096 / 64 |
| Vocabulario | 154.880 |
| Expertos enrutados | 144 de 288 por capa MoE (poda REAP del 50 %) |
| Atención | 34 capas KDA lineales + 11 capas MLA (capas 3, 7, …, 43); hiper-conexiones mHC con 4 flujos |
| Visión | ViT de 24 bloques, proyector `glm4v`, F16, sin podar (`mmproj-GLM-5.3-Flash-REAP50-F16.gguf`) |
| Precisión de tensores | Router, norms, mHC y KDA conv/state en F32; `output.weight` en Q6_K; ningún tensor en Q8_0 |
| Tamaño del repo | 435,0 GB |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura híbrida que alterna capas de atención lineal KDA con capas de atención MLA, un patrón diseñado para reducir el coste computacional del contexto largo manteniendo la capacidad de recuperación de información. Las capas 0 a 2 son densas (FFN convencional) y el resto son MoE con 288 expertos enrutados, de los que se activan 8 por token más un experto compartido. Las hiper-conexiones mHC con 4 flujos y el bloque MTP añadido al final (bloque 45) permiten decodificación especulativa mediante predicción multi-token. El modelo soporta entrada image-text-to-text gracias a un ViT de 24 bloques con proyector glm4v.

Sobre el entrenamiento del modelo base no se dispone de información en la documentación proporcionada: no se especifican el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. La innovación técnica documentada en esta ficha es la poda REAP aplicada por el autor de la cuantización: se eliminan 144 de los 288 expertos enrutados por capa según su saliencia, y el modelo resultante se somete a un proceso de "healing" (recuperación de pesos) del que solo se documenta que la máscara v2 alcanzó 0,8425 de coincidencia top-1 con el modelo sin podar. Existe una máscara v3 posterior, presente únicamente en los repos FP8 y NVFP4, que nunca ha sido evaluada de extremo a extremo y cuyo healing usó un estimador de reserva; no hay GGUF v3.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1.048.576 tokens declarados.
- Razonamiento multi-paso y decodificación especulativa mediante el bloque MTP.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text): el ViT de 24 bloques y el proyector glm4v procesan la entrada visual.
- Soporte de tool calling y function calling heredado del modelo base (no documentado explícitamente en esta model card).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking mode): no documentado en esta model card.
- Tres tokens de fin de generación: `154820 <|endoftext|>`, `154827 <|user|>` y `154829 <|observation|>`.

## Casos de uso

- Despliegue en una sola máquina de memoria unificada de 128 GB: con el fichero IQ3_M (67,18 GiB) el modelo cabe en un Jetson AGX Thor o en estaciones con memoria unificada, permitiendo inferencia local de un modelo de 165 B sin clúster multi-GPU. El autor verificó carga, aritmética y perplejidad en ese hardware con `-ngl 0 --no-repack`.
- Procesamiento de documentos largos: la ventana declarada de 1.048.576 tokens permite ingerir libros completos o expedientes extensos en una sola pasada, aunque la recuperación efectiva solo está verificada hasta 32.000 tokens, por lo que conviene limitar el uso real a ese rango hasta validar más allá.
- Análisis de gráficos y documentos visuales: el proyector de visión F16 permite responder preguntas sobre imágenes; el autor reporta 17/24 en ChartQA para IQ4_XS y 19/24 para IQ3_M, lo que lo hace adecuado para extracción de datos de gráficas e informes escaneados.
- Asistente conversacional con contexto persistente: los tres tokens EOG permiten delimitar turnos de usuario y observaciones; configurando los overrides de stop-token se evita que el modelo fabrique turnos siguientes, lo que lo hace utilizable en chat multi-turno con historial largo.
- Generación de código y razonamiento técnico: el bloque MTP acelera la decodificación especulativa, útil en pipelines de generación de código donde la latencia por token es crítica; requiere el fork parcheado de llama.cpp.
- Investigación sobre poda de expertos: al incluir máscaras v2 documentadas y comparativas de coincidencia top-1, sirve como banco de pruebas para estudiar el impacto de REAP en modelos MoE de gran escala, comparando los distintos niveles de cuantización con el padre FP8.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT permite uso comercial sin restricciones de atribución más allá de la propia MIT, lo que facilita su integración en productos propietarios.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Coincidencia top-1 con modelo sin podar | 0,8425 | Sobre 241.516 tokens de validación, medido en el padre FP8, no en los GGUF |
| ChartQA (IQ4_XS) | 17/24 | Evaluación del autor sobre el fichero cuantizado |
| ChartQA (IQ3_M) | 19/24 | Evaluación del autor sobre el fichero cuantizado |
| Recuperación en contexto (NIAH) | Verificado hasta 32.000 tokens | Solo el fichero Q4_K_M fue sometido a NIAH |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El autor indica explícitamente que no hay mediciones que ordenen los niveles de cuantización por calidad y que los ficheros GGUF no han sido evaluados con la métrica de coincidencia top-1.

## Requisitos de hardware

- VRAM/memoria estimada según fichero: IQ3_M 67,18 GiB; Q3_K_M 73,37 GiB; IQ4_XS 82,00 GiB; Q4_K_S 87,10 GiB; Q4_K_M 92,51 GiB. Añadir el proyector de visión F16 y el overhead de contexto.
- Memoria unificada: el autor valida todos los ficheros en un Jetson AGX Thor con 128 GB de memoria unificada, usando `-ngl 0 --no-repack` (sin offload a GPU).
- GPU dedicadas: no se documentan pruebas en A100, H100 ni RTX 4090; por tamaño, ningún fichero cabe en una GPU consumer de 24 GB ni en una A100 de 80 GB sin offload parcial o cuantización adicional.
- Despliegue: exclusivamente mediante el fork `patrickbdevaney/llama.cpp` (rama `glm5-next-reap50-gguf-v1`), o aplicando el parche `glm5-next-llama.cpp.patch` (15 commits sobre upstream `761797ff`) o clonando el bundle `glm5-next-llama.cpp.bundle`. El llama.cpp upstream no carga estos ficheros por diferencias en las claves de metadatos (`hyper_connection.count` y `attention.indexer.kpool` frente a `attention.hc.mult`).
- Compilación: `cmake -B build -DGGML_CUDA=ON -DCMAKE_BUILD_TYPE=Release`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-REAP50-GGUF (este) | 164,91 B (144/288 expertos) | 1.048.576 declarados; 32.000 verificados | MIT | GGUF | Requiere fork de llama.cpp; 67,2-92,5 GiB |
| zai-org/GLM-5.3-Flash (base) | 164,91 B sin podar (288 expertos) | 1.048.576 | MIT | safetensors | Modelo completo; no cabe en 128 GB en FP16 |
| GLM-5.3-Flash-REAP50-FP8-v2 | 164,91 B (144/288 expertos) | 1.048.576 | MIT | safetensors FP8 | Padre de estos GGUF; incluye máscara v3 en `pass3-hope/` |
| GLM-5.3-Flash-REAP50-NVFP4-v2 | 164,91 B (144/288 expertos) | 1.048.576 | MIT | safetensors NVFP4 | Para runtimes con soporte NVFP4; incluye máscara v3 |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Los ficheros GGUF no han sido evaluados con la métrica de coincidencia top-1; ese 0,8425 corresponde al padre FP8, no a las cuantizaciones.
- La recuperación en contexto largo solo está verificada hasta 32.000 tokens, muy por debajo de los 1.048.576 declarados en la cabecera; usar el contexto completo sin validación previa es arriesgado.
- El llama.cpp upstream no carga estos ficheros; es obligatorio usar el fork del autor o aplicar el parche, lo que añade deuda de mantenimiento.
- Es imprescindible añadir los overrides de stop-token (`<|user|>` y `<|observation|>` además de `<|endoftext|>`); sin ellos el modelo fabrica turnos siguientes tras responder.
- La poda REAP del 50 % elimina la mitad de los expertos; aunque la coincidencia top-1 sea alta, puede degradar capacidades específicas de nicho no cubiertas por la validación.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo base en la documentación disponible.
- La máscara v3 existe solo en los repos FP8 y NVFP4, nunca ha sido evaluada de extremo a extremo y su healing usó un estimador de reserva; no hay GGUF v3.
- El tamaño del repo (435 GB) y de cada fichero (67-92 GiB) exige almacenamiento considerable y descargas largas.
- La licencia MIT permite uso comercial, pero el modelo base conserva su propia licencia MIT; verificar la procedencia de los datos de entrenamiento queda fuera del alcance de esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repo hermano FP8 v2: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2
- Repo hermano NVFP4 v2: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4-v2
- Fork de llama.cpp: https://github.com/patrickbdevaney/llama.cpp
- Paper de referencia citado en los tags: arxiv:2510.13999
