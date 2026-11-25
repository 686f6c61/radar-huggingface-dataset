# blaj/MiniCPM-V-4.7-1B-DSpark-int4-ov

## Resumen

MiniCPM-V-4.7-1B-DSpark-int4-ov es una exportación a OpenVINO en cuantización INT4 del modelo openbmb/MiniCPM-V-4.7-1B-DSpark, publicada por el usuario blaj. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: pesos convertidos con Optimum Intel para ejecutarse sobre el runtime OpenVINO GenAI, con verificación SHA-256 de los pesos de origen antes de la exportación. El modelo base pertenece a la familia MiniCPM-V de OpenBMB, orientada a modelos compactos multimodales, y su variante DSpark incorpora un mecanismo de decodificación especulativa con un cabezal Markov (draft model) que acelera la generación.

El interés de esta ficha es doble. Por un lado, documenta una ruta concreta de despliegue en hardware Intel (CPU/GPU integrada o discreta) para un modelo de aproximadamente 1.000 millones de parámetros, lo que lo sitúa en el rango de modelos que caben holgadamente en GPUs de consumo. Por otro, ilustra el patrón de decodificación especulativa con modelo borrador emparejado: el repositorio INT4 se usa junto a un draft FP16 separado, y el autor indica una configuración probada con 17 bloques de atención lineal y 15 tokens de asistente.

La información publicada es muy escasa: el repositorio ocupa 0,3 GB, no tiene descargas ni valoraciones, y la model card se limita a describir el proceso de exportación y una prueba de humo de generación de texto en GPU. No se publican idiomas soportados, datos de entrenamiento, benchmarks ni resultados de calidad. Todo lo que sigue distingue explícitamente entre datos confirmados y datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal en parte de las capas (el autor menciona 17 bloques de atención lineal); modelo base MiniCPM-V con variante DSpark de decodificación especulativa |
| Parametros totales | Aproximadamente 1B (según el nombre del modelo base, no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (este repositorio); existe un companion INT8 y un draft FP16 publicados por el mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (exportación Optimum Intel); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia MiniCPM-V, en su variante DSpark, que incorpora decodificación especulativa mediante un modelo borrador. El autor de la exportación menciona explícitamente "17 linear-attention blocks", lo que sugiere una arquitectura híbrida en la que parte de las capas usan atención lineal en lugar de atención completa; sin embargo, la model card no detalla la proporción exacta ni el diseño completo. El repositorio exporta el cabezal Markov del draft, y el autor advierte que el exportador estándar no exporta los tensores del cabezal de confianza del checkpoint.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se documenta el proceso de alineación. La única información técnica verificable es la del pipeline de exportación: pesos de origen verificados por SHA-256, exportación con Optimum Intel y prueba de humo de generación de texto en GPU con precisión de caché KV en f16.

## Capacidades

- Generación de texto: el autor confirma una prueba de humo de text-generation en GPU con el companion draft publicado.
- Decodificación especulativa: el modelo está diseñado para emparejarse con un draft FP16 y usar 15 tokens de asistente en la configuración probada.
- Atención lineal: 17 bloques de atención lineal según la configuración de referencia del autor.
- Capacidades multimodales: el nombre del modelo base (MiniCPM-V) sugiere visión, pero el autor indica explícitamente que "image inference was not verified" en esta exportación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en hardware Intel sin GPU dedicada: al estar exportado a OpenVINO IR en INT4, el modelo puede ejecutarse sobre CPU Intel con el runtime OpenVINO GenAI, lo que permite prototipos de generación de texto en equipos de sobremesa o portátiles sin acelerador NVIDIA.
- Aceleración de inferencia con decodificación especulativa: el emparejamiento con el draft FP16 y los 15 tokens de asistente permiten probar configuraciones de speculative decoding en entornos OpenVINO, comparando latencia frente a generación autoregresiva estándar.
- Evaluación de cuantización INT4 en modelos de ~1B: sirve como banco de pruebas para medir la degradación de calidad y la paridad greedy frente al modelo en mayor precisión, tal como el autor sugiere al señalar que la paridad varía según el prompt.
- Integración en pipelines de CI/CD para validación de exportaciones: el flujo descrito (verificación SHA-256, exportación Optimum Intel, smoke test en GPU) es replicable como plantilla para validar otras exportaciones OpenVINO.
- Investigación sobre arquitecturas híbridas con atención lineal: los 17 bloques de atención lineal documentados permiten estudiar el comportamiento de este tipo de capas en modelos pequeños dentro del ecosistema OpenVINO.
- Pruebas de concepto de asistentes locales de bajo consumo: un modelo de ~1B en INT4 con un repositorio de 0,3 GB es adecuado para demos de generación de texto en dispositivos con recursos limitados, siempre que se acepte la ausencia de benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta que la precisión superó una prueba de humo de generación de texto en GPU con el companion publicado, y advierte que la velocidad y la paridad greedy varían según el prompt. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 0,3 GB, lo que sugiere un peso en disco bajo, pero no se especifica el consumo en ejecución.
- GPU recomendadas: el autor probó la configuración en GPU con OpenVINO GenAI 2027.0.0.0.dev20261119 y caché KV en f16; no se indica un modelo concreto de GPU.
- GPU de consumo: por el tamaño del repositorio (0,3 GB) y el rango de ~1B parámetros en INT4, es plausible que quepa en GPUs de consumo, pero no hay confirmación oficial ni lista de modelos compatibles.
- Opciones de despliegue: OpenVINO GenAI (versión dev indicada por el autor) con Optimum Intel para la exportación. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo señala que la velocidad varía según el prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-DSpark-int4-ov (este) | ~1B | no disponible | OpenVINO IR INT4 | Apache 2.0 | Exportación de comunidad, sin benchmarks |
| openbmb/MiniCPM-V-4.7-1B-DSpark (base) | ~1B | no disponible | no disponible en esta ficha | no disponible en esta ficha | Modelo de origen; referencia para paridad |
| blaj/MiniCPM-V-4.7-1B-int8-ov | ~1B | no disponible | OpenVINO IR INT8 | no disponible en esta ficha | Companion INT8 citado por el autor como target |
| blaj/MiniCPM-V-4.7-1B-DSpark-fp16-ov | ~1B | no disponible | OpenVINO IR FP16 | no disponible en esta ficha | Draft FP16 para decodificación especulativa |

La comparativa se limita a los artefactos publicados por el mismo autor y al modelo base, porque no se dispone de datos de rendimiento que permitan comparar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de calidad; no hay evidencia de rendimiento más allá de una prueba de humo.
- La inferencia de imágenes no fue verificada por el autor, pese a que el modelo base pertenece a la familia MiniCPM-V, orientada a visión.
- El exportador estándar exporta el cabezal Markov pero no los tensores del cabezal de confianza del checkpoint, lo que puede afectar al comportamiento del draft.
- La paridad greedy con el modelo de origen varía según el prompt, según advierte el autor.
- La configuración probada depende de una versión de desarrollo concreta de OpenVINO GenAI (2027.0.0.0.dev20261119), lo que introduce riesgo de incompatibilidad con versiones estables.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero se remite a la licencia y a la model card del modelo de origen para la atribución y las condiciones de uso.
- El repositorio no tiene descargas ni valoraciones, por lo que no hay señal de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/blaj/MiniCPM-V-4.7-1B-DSpark-int4-ov
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B-DSpark/tree/33762d223b4be1101cf90abba1958435a9b018e0
- Companion INT8: https://huggingface.co/blaj/MiniCPM-V-4.7-1B-int8-ov
- Draft FP16: https://huggingface.co/blaj/MiniCPM-V-4.7-1B-DSpark-fp16-ov
- Licencia: https://huggingface.co/blaj/MiniCPM-V-4.7-1B-DSpark-int4-ov/blob/main/LICENSE
