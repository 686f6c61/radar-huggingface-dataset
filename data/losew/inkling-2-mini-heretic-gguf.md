# Losew/Inkling-2-Mini-Heretic-GGUF

## Resumen

Inkling-2-Mini Heretic GGUF es una conversión a formato GGUF del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario Losew en Hugging Face. Se trata de una adaptación experimental que combina dos operaciones: una conversión de pesos a GGUF con múltiples niveles de cuantización (desde BF16 hasta IQ1_S) y una modificación inspirada en las técnicas "Heretic" aplicada exclusivamente a las proyecciones de atención mediante LoRA de rango 4. El modelo subyacente conserva la arquitectura del original; no se ha sustituido por otra distinta.

El modelo base es un MoE (Mixture of Experts) orientado a código, según las etiquetas del repositorio, con licencia Apache 2.0. El autor de esta conversión advierte explícitamente de que se trata de un trabajo limitado y experimental: los ficheros han pasado comprobaciones breves de carga y generación, pero no se han evaluado de forma sistemática la calidad de las respuestas, el rendimiento en programación, el comportamiento de seguridad ni las capacidades multimodales.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas conversiones GGUF disponibles de un modelo MoE con soporte declarado para código; por otro, sirve como caso de estudio de los riesgos de las adaptaciones comunitarias no validadas, donde la carga correcta de un fichero no garantiza en absoluto respuestas útiles o correctas. El tamaño de los ficheros (desde 7,97 GiB en IQ1_S hasta 48,64 GiB en BF16) condiciona fuertemente su despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, según etiquetas del repositorio; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, MXFP4 (MXFP4_MOE), FP4 (NVFP4 mixto), IQ4_XS, IQ3_XXS, IQ2_XXS, IQ1_M, IQ1_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de imagen separado en `mmproj-Inkling-2-Mini-Heretic-BF16.gguf` (~0,60 GiB) |

## Arquitectura y entrenamiento

El modelo base es un MoE según las etiquetas del repositorio, aunque la model card de esta conversión no detalla el número de parámetros totales, parámetros activos, número de expertos ni longitud de contexto. La conversión a GGUF se realizó con un conversor personalizado de Inkling sobre llama.cpp, y los ficheros generados requieren una build de llama.cpp que soporte esta arquitectura y los tipos de cuantización empleados; el autor advierte de que no se puede asumir compatibilidad con todas las versiones o aplicaciones.

La adaptación "Heretic" se aplicó a las proyecciones de atención con LoRA de rango 4, usando cuatro ejemplos positivos y cuatro negativos, y un único paso de optimización ARA. Los parámetros de los expertos MoE no se modificaron directamente con esta adaptación. Es importante señalar que el checkpoint original ya contenía pesos cuantizados, por lo que la conversión a BF16 no recupera precisión ya perdida en el checkpoint de origen.

Las variantes IQ se generaron con una importance matrix (imatrix) orientada a programación y tareas técnicas, calibrada con HuggingFaceH4/CodeAlpaca_20K (revisión 798c567f69c8f4b12fc191015e59ee34e9afe00d). La calibración usó solo 448 tokens, con 2.965 de 3.072 pares de routing capa/experto observados; los expertos no observados recibieron ponderación equitativa. Además, algunos valores recogidos en GPU durante la calibración resultaron no finitos, por lo que la matriz final se recogió en CPU, sin que se haya establecido la causa. El autor subraya que la orientación a código de la imatrix no demuestra mejor calidad de programación.

## Capacidades

- Generación de texto: los ficheros han pasado pruebas breves de carga y generación de texto (mayoritariamente de dos tokens, ocho en Q4_K_M).
- Código: el modelo base está etiquetado como orientado a código y las variantes IQ usan calibración de CodeAlpaca, pero no se ha validado el rendimiento real en programación.
- MoE: arquitectura de mezcla de expertos heredada del modelo base.
- Multimodal (visión): se incluye un proyector de imagen separado, pero la entrada de imagen no se ha probado y su presencia no establece compatibilidad con visión.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking: no disponible.
- Comportamiento tras la adaptación Heretic: el efecto sobre rechazos y otros comportamientos no se ha medido; no se afirma que el modelo esté totalmente descensurado ni que iguale los resultados de una ejecución Heretic estándar.

## Casos de uso

- Evaluación comparativa de cuantizaciones: el repositorio ofrece 14 variantes de cuantización del mismo modelo, lo que permite medir en un mismo hardware el compromiso entre tamaño (de 7,97 a 48,64 GiB) y calidad de generación, siempre con la advertencia de que la calidad no está validada.
- Despliegue local en hardware de consumo con llama.cpp: las variantes Q2_K (10,12 GiB), IQ2_XXS (8,94 GiB) e IQ1_M (8,34 GiB) permiten probar el modelo en GPUs de 12-16 GB con offload parcial, como el RTX 4080 usado en las pruebas del autor.
- Experimentación con adaptaciones Heretic: útil para investigadores que quieran estudiar el efecto de una modificación LoRA de rango 4 sobre proyecciones de atención en un MoE, aunque sin métricas de rechazo publicadas.
- Pruebas de integración con llama.cpp: sirve para validar builds personalizadas que soporten la arquitectura Inkling y los tipos MXFP4/NVFP4, dado que el autor advierte de incompatibilidades potenciales entre versiones.
- Investigación sobre imatrix y calibración: el repositorio documenta un caso de calibración con solo 448 tokens y valores no finitos en GPU, útil como referencia metodológica sobre los límites de las imatrices pequeñas.
- Pipeline de código en local (con reservas): el modelo base está orientado a código y las variantes IQ usan calibración de CodeAlpaca, por lo que puede probarse como asistente de programación en entornos sin conexión, aunque la calidad no está demostrada y debe validarse en cada carga de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pruebas de humo de generación: la mayoría de variantes cuantizadas generaron dos tokens y Q4_K_M generó ocho, con offload parcial en una NVIDIA RTX 4080 de 16 GB; una ejecución corta adicional de Q2_K usó colocación automática de dispositivos. Estas pruebas no establecen calidad, generación fiable en contexto largo ni comportamiento correcto entre herramientas y hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la variante. BF16 requiere ~48,64 GiB de pesos; Q8_0 ~25,91 GiB; Q6_K ~21,88 GiB; Q5_K_M ~18,54 GiB; Q4_K_M ~16,28 GiB; Q3_K_M ~12,78 GiB; Q2_K ~10,12 GiB; MXFP4 ~13,81 GiB; FP4 mixto ~14,23 GiB; IQ4_XS ~13,39 GiB; IQ3_XXS ~10,94 GiB; IQ2_XXS ~8,94 GiB; IQ1_M ~8,34 GiB; IQ1_S ~7,97 GiB. Hay que sumar el proyector de imagen (~0,60 GiB) si se usa.
- GPU recomendadas: no disponibles de forma oficial. El autor probó con una RTX 4080 de 16 GB con offload parcial; para BF16 y Q8_0 se necesitan GPUs de 48-80 GB (A100, H100) o configuraciones multi-GPU.
- ¿Cabe en GPU de consumo? Las variantes de 8-14 GiB (IQ1_S, IQ1_M, IQ2_XXS, Q2_K, IQ3_XXS, IQ4_XS, MXFP4, FP4) pueden caber en GPUs de 12-16 GB con offload parcial; Q3_K_M y superiores requieren 16 GB o más, y Q6_K, Q8_0 y BF16 quedan fuera del rango de consumo.
- Opciones de despliegue: llama.cpp con una build que soporte la arquitectura Inkling y los tipos de cuantización empleados. No se documenta compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles. Las pruebas de humo reportaron generaciones de dos a ocho tokens, insuficientes para estimar rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini Heretic GGUF (este) | no disponible (MoE) | no disponible | GGUF (14 variantes) | Apache 2.0 | Adaptación Heretic + conversión comunitaria; calidad no evaluada |
| thinkingmachines/Inkling-2-Mini (base) | no disponible (MoE) | no disponible | no disponible | Apache 2.0 | Modelo original de Thinking Machines Lab; referencia oficial |
| Alternativas GGUF de modelos MoE orientados a código | no disponible | no disponible | GGUF | variable | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar con modelos alternativos concretos de la misma categoría; los datos de parámetros, contexto y rendimiento del modelo base no están publicados en la información disponible.

## Limitaciones y advertencias

- Adaptación experimental y limitada: los ficheros han pasado solo comprobaciones breves de carga y generación; la calidad de respuesta, el rendimiento en código, el comportamiento de seguridad y las capacidades multimodales no se han evaluado sistemáticamente.
- Carga correcta no implica respuestas correctas: el autor lo advierte de forma explícita.
- Precisión ya perdida: el checkpoint original contenía pesos cuantizados; la conversión a BF16 no recupera precisión.
- Imatrix poco fiable: calibración con solo 448 tokens, 2.965 de 3.072 pares observados, expertos no observados con ponderación equitativa y valores no finitos recogidos en GPU (matriz final recogida en CPU).
- Visión no validada: el proyector de imagen existe pero la entrada de imagen no se ha probado.
- Comportamiento Heretic no medido: no se afirma que el modelo esté descensurado ni que iguale una ejecución Heretic estándar.
- Compatibilidad frágil: requiere una build de llama.cpp que soporte la arquitectura Inkling y los tipos de cuantización; no se garantiza en todas las versiones.
- Advertencia de token EOS especial en la build probada: el comportamiento de fin de generación necesita validación adicional.
- Idiomas, sesgos y riesgo de alucinación: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Losew/Inkling-2-Mini-Heretic-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceH4/CodeAlpaca_20K
- llama.cpp: https://github.com/ggml-org/llama.cpp
