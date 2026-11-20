# InterpreticAI/Qwen4-27B-Uncensored-v3-MLX-4bit

## Resumen

Qwen4-27B-Uncensored-v3-MLX-4bit es un repositorio publicado por InterpreticAI que, en el momento de su creacion, no contiene pesos de modelo: la model card lo describe explicitamente como "coming soon" y condiciona la publicacion de los pesos a la salida oficial de Qwen4-27B por parte de Alibaba. El objetivo declarado es eliminar la censura politica del modelo base Qwen4-27B y distribuir los pesos resultantes en formato MLX 4-bit, ademas de otras variantes planificadas (BF16, FP8, NVFP4, GGUF Q4_K_M e IQ3_XXS).

La relevancia del proyecto se apoya en el resultado de la release anterior del mismo autor, Qwen3.8-27B-Uncensored-v3, sobre el conjunto de preguntas politicas chinas de Pan y Xu (2026): la tasa de respuestas censuradas baja del 83,5 % al 2,6 % y la de reescrituras en talking points del PCC del 32,2 % al 1,7 %, mientras que las respuestas correctas y abiertas suben del 12,2 % al 80,9 %. No obstante, esos datos corresponden al modelo previo, no al modelo de este repositorio, del que no hay informacion tecnica verificable.

La ficha se limita, por tanto, a documentar el estado real del artefacto: un placeholder con licencia Apache 2.0, sin pesos, sin pipeline declarado, sin idiomas declarados y sin descargas. Cualquier dato de arquitectura, entrenamiento o rendimiento del Qwen4-27B subyacente no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base Qwen4-27B aun no ha sido publicado segun la model card) |
| Parametros totales | 27B (deducido del nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (este repositorio); planificados: BF16, FP8, NVFP4, GGUF Q4_K_M, GGUF IQ3_XXS |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX 4-bit (planificado); no hay pesos publicados en el repositorio |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo. La model card no describe si el modelo base Qwen4-27B emplea un transformer denso, una arquitectura MoE o un esquema hibrido, ni detalla atencion, tokenizador o ventana de contexto. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineacion.

El unico proceso tecnico descrito es el objetivo de "descensurar" el modelo base, es decir, revertir o eliminar el sesgo de censura politica introducido por el desarrollador original. La model card no explica la metodologia empleada (fine-tuning supervisado, abliteration, edicion de pesos, DPO con pares de preferencia u otra), por lo que no es posible evaluar su reproducibilidad ni su impacto sobre capacidades generales. Los resultados citados de la version anterior (Qwen3.8-27B-Uncensored-v3) se miden con el benchmark de preguntas politicas chinas de Pan y Xu (2026), pero no se aporta informacion sobre el procedimiento de entrenamiento que los produce.

## Capacidades

- No se han documentado capacidades especificas para este repositorio; la model card no incluye seccion de capacidades.
- El unico comportamiento declarado es la eliminacion de la censura politica del modelo base, medida en la release anterior con el benchmark de Pan y Xu (2026).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas del repositorio esta vacio).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Generacion de texto, codigo o matematicas: no disponible para este artefacto concreto, al no existir pesos publicados.

## Casos de uso

- Evaluacion de robustez frente a censura politica: el modelo, una vez publicado, permitiria comparar las respuestas del Qwen4-27B oficial y de la variante descensurada sobre el conjunto de preguntas de Pan y Xu (2026), replicando la metodologia de la release anterior. Es adecuado porque el autor publica explicitamente esas metricas.
- Investigacion sobre alineacion y sesgo: util para estudiar como se comporta un modelo de 27B cuando se eliminan restricciones politicas, midiendo la tasa de respuestas censuradas, reescrituras en talking points y respuestas correctas y abiertas.
- Despliegue local en Apple Silicon: la variante MLX 4-bit esta pensada para ejecucion en hardware de Apple mediante el framework MLX, lo que facilita experimentos en estaciones de trabajo con memoria unificada en lugar de GPU dedicadas.
- Analisis de libertad de expresion en asistentes: permite auditar que temas se bloquean o se reescriben en el modelo base y como cambia el comportamiento tras el proceso de descensurado.
- Comparacion de formatos de cuantizacion: al planificarse BF16, FP8, NVFP4, GGUF Q4_K_M, GGUF IQ3_XXS y MLX 4-bit, el repositorio serviria para medir la degradacion de calidad y la tasa de censura residual en cada formato.
- Integracion en pipelines de investigacion con licencia permisiva: la licencia Apache 2.0 permite usar y redistribuir los pesos en entornos academicos y comerciales, sujeto a las condiciones del modelo base una vez publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para Qwen4-27B-Uncensored-v3-MLX-4bit en la informacion disponible. Los unicos datos numericos de la model card corresponden a la release anterior, Qwen3.8-27B-Uncensored-v3, sobre el benchmark de preguntas politicas chinas de Pan y Xu (2026):

| Metrica | Qwen3.8-27B | Uncensored-v3 |
|---|---|---|
| Respuestas censuradas (menor es mejor) | 83,5 % | 2,6 % |
| Reescrituras en talking points del PCC (menor es mejor) | 32,2 % | 1,7 % |
| Tema correcto, respondido abiertamente (mayor es mejor) | 12,2 % | 80,9 % |

Estos valores no deben atribuirse al modelo de este repositorio, que no tiene pesos publicados. No hay datos de MMLU, HumanEval, GSM8K ni de otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este repositorio. Como referencia aritmetica, un modelo denso de 27B en 4 bits requiere aproximadamente 13,5 GB solo para los pesos, a lo que hay que sumar overhead de contexto y runtime; esta cifra es una estimacion basada en el nombre del repositorio, no un dato publicado.
- GPU recomendadas: no disponible. La variante MLX esta orientada a Apple Silicon (memoria unificada), no a GPU NVIDIA.
- Compatibilidad con GPU de consumo: no disponible; no se especifican requisitos minimos.
- Opciones de despliegue: MLX para la variante 4-bit; llama.cpp u Ollama para las variantes GGUF planificadas (Q4_K_M, IQ3_XXS); vLLM o TGI para BF16/FP8 si se publican. Ninguna de estas opciones esta confirmada por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (variantes descensuradas de modelos Qwen de 27B en MLX 4-bit) con datos verificables de parametros, contexto o rendimiento. La unica referencia interna es la release anterior del mismo autor:

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen4-27B-Uncensored-v3-MLX-4bit | 27B (segun nombre) | no disponible | MLX 4-bit | apache-2.0 | sin pesos publicados |
| Qwen3.8-27B-Uncensored-v3 | no disponible | no disponible | no disponible | no disponible en esta ficha | publicado (referencia del autor) |

## Limitaciones y advertencias

- El repositorio no contiene pesos: la model card indica "coming soon" y sujeta la publicacion a la salida oficial de Qwen4-27B. No es utilizable en produccion en su estado actual.
- No hay informacion sobre sesgos del modelo descensurado. Eliminar la censura politica puede aumentar la presencia de contenido sesgado, ofensivo o factualmente incorrecto; el autor no documenta evaluaciones de seguridad.
- Riesgo de alucinacion: no evaluado ni documentado para este artefacto.
- Limitaciones de contexto e idioma: no disponibles; el campo de idiomas del repositorio esta vacio.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero al derivar de un modelo base de terceros (Qwen4-27B) las condiciones finales dependeran de la licencia que Alibaba aplique al modelo original, aun no publicada.
- La denominacion "uncensored" no garantiza la ausencia total de filtros; en la release anterior la tasa de respuestas censuradas residual fue del 2,6 %, no del 0 %.
- Los benchmarks citados pertenecen a una version anterior y a un unico conjunto de evaluacion (preguntas politicas chinas de Pan y Xu, 2026); no hay evidencia de rendimiento general.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que impide cualquier validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-MLX-4bit
- Coleccion del autor en Hugging Face: https://huggingface.co/InterpreticAI
- Release anterior (BF16): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Variante FP8 planificada: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-FP8
- Variante NVFP4 planificada: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-NVFP4
- Variante GGUF Q4_K_M planificada: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-GGUF
- Variante GGUF IQ3_XXS planificada: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-IQ3_XXS-GGUF
- Variante BF16 planificada: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3
- Sitio del autor: https://interpretic.ai
