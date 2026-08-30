# mradermacher/LFM2.5-350M-Uncensored-i1-GGUF

## Resumen

LFM2.5-350M-Uncensored-i1-GGUF es una version cuantizada en formato GGUF del modelo LFM2.5-350M-Uncensored, un modelo de 350 millones de parametros creado por naimulislam999 a partir del LFM2.5-350M de Liquid AI. La variante "Uncensored" aplica tecnicas de abliteration (ablacion direccional) para eliminar los comportamientos de rechazo del modelo original, orientandose a la investigacion en seguridad, interpretabilidad mecanistica y estudios de alineacion.

El modelo base, LFM2.5-350M de Liquid AI, esta construido sobre la arquitectura LFM2 y ha sido pre-entrenado con 28 billones de tokens, con un entrenamiento adicional mediante aprendizaje por refuerzo a gran escala. Su tamano compacto permite una inferencia muy rapida, ejecutandose desde GPUs en la nube hasta CPUs de bajo coste. Esta version GGUF, cuantizada por mradermacher con el proceso imatrix (importance matrix), facilita su despliegue en hardware modesto mediante llama.cpp, Ollama u otras herramientas compatibles con el formato GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid AI) |
| Parametros totales | 354.483.968 (350M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-350M de Liquid AI utiliza la arquitectura LFM2, disenada para ofrecer inferencia rapida con coste computacional reducido. Segun el blog oficial de Liquid AI, el modelo fue pre-entrenado con 28 billones de tokens (frente a los 10 billones de la version anterior) e incorpora aprendizaje por refuerzo a gran escala. Esta combinacion permite que un modelo de solo 350M de parametros alcance un rendimiento competitivo en generacion de texto y razonamiento, ejecutandose en CPUs y GPUs de gama baja.

La variante "Uncensored" de naimulislam999 aplica abliteration (ablacion direccional), una tecnica de interpretabilidad mecanistica que identifica y elimina direcciones especificas en el espacio de activaciones del modelo asociadas con comportamientos de rechazo o negativa a responder. El resultado es un modelo que no muestra reticencias a generar contenido que el modelo original podria bloquear. Esta version GGUF, cuantizada por mradermacher, utiliza el proceso imatrix para calcular matrices de importancia que mejoran la calidad de la cuantizacion, especialmente en los formatos de menor precision. El repositorio incluye ademas un archivo imatrix de calibracion (0,1 GB) para que los usuarios puedan generar sus propias cuantizaciones personalizadas.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento basico y generacion de respuestas sin filtros de seguridad.
- Inferencia rapida en CPU y GPU gracias a su tamano reducido (350M parametros).
- Compatible con herramientas de inferencia local que soporten GGUF: llama.cpp, Ollama, LM Studio, llama-cpp-python.
- Sin comportamiento de rechazo: responde a peticiones que el modelo original podria bloquear.
- Adecuado para investigacion en interpretabilidad mecanistica y estudios de seguridad (safety research).
- Compatible con endpoints de inferencia (tag `endpoints_compatible`).

## Casos de uso

- Investigacion en seguridad de IA: el modelo permite estudiar como la abliteration afecta al comportamiento de un modelo pequeno, comparando respuestas con la version censurada original para medir el impacto de la eliminacion de rechazos.
- Generacion creativa de texto sin restricciones: escritura de ficcion, roleplay o contenido creativo donde el usuario no desea filtros de contenido, con respuestas fluidas gracias al entrenamiento extensivo de 28T tokens.
- Prototipado rapido de aplicaciones conversacionales: su tamano reducido permite iterar rapidamente en entornos de desarrollo locales sin necesidad de GPUs potentes, reduciendo el ciclo de desarrollo.
- Inferencia en dispositivos de bajo consumo: ejecucion en Raspberry Pi, portatiles antiguos o entornos embebidos gracias a las cuantizaciones de baja precision (IQ1, Q2) que ocupan menos de 200 MB.
- Educacion y aprendizaje: demostracion practica de tecnicas de cuantizacion GGUF e imatrix en un modelo pequeno y manejable, ideal para cursos de despliegue de LLMs.
- Evaluacion de tecnicas de alineacion: comparacion del comportamiento entre el modelo original y la version ablacionada para medir el impacto de la eliminacion de rechazos en la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El blog de Liquid AI menciona mejoras de rendimiento del LFM2.5-350M respecto a su predecesor, pero no se incluyen cifras concretas en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada: con 350M de parametros, las cuantizaciones mas bajas (IQ1, Q2) ocupan menos de 200 MB, mientras que las de mayor precision (Q6_K) rondan los 300-400 MB. Cualquier GPU con 2 GB de VRAM es suficiente.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. En GPU, cualquier modelo consumer (GTX 1060, RTX 3060, etc.) es mas que suficiente.
- Compatible con CPUs de bajo coste: el blog de Liquid AI indica que el modelo se ejecuta "desde GPUs en la nube hasta CPUs baratas".
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, o cualquier runtime compatible con GGUF.
- Latencia: no disponible, pero al ser un modelo de 350M, la generacion es practicamente en tiempo real incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| LFM2.5-350M-Uncensored (GGUF) | 350M | no disponible | Apache 2.0 | GGUF |
| TinyLlama 1.1B | 1,1B | 2048 | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B | 500M | 32768 | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M | 360M | 8192 | Apache 2.0 | safetensors, GGUF |

El LFM2.5-350M se posiciona en la gama de modelos pequenos (sub-1B), compitiendo con TinyLlama, Qwen2.5-0.5B y SmolLM2. Su ventaja principal es el entrenamiento extensivo (28T tokens) y la arquitectura LFM2 optimizada para inferencia rapida. La variante Uncensored anade la particularidad de no tener filtros de seguridad, algo unico entre estos modelos. Los datos de contexto de los modelos comparados provienen de conocimiento general y no de la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin filtros de seguridad: al ser una version "uncensored" mediante abliteration, puede generar contenido inapropiado, ofensivo o peligroso. No debe usarse en produccion sin supervision humana.
- Solo ingles: el modelo solo soporta el idioma ingles, lo que limita su uso en aplicaciones multilingues.
- Tamano reducido: con 350M de parametros, su capacidad de razonamiento complejo, matematicas avanzadas o generacion de codigo es limitada en comparacion con modelos de 7B o superiores.
- Longitud de contexto no documentada: no se ha especificado la ventana de contexto en la informacion disponible, lo que dificulta planificar aplicaciones que requieran contexto largo.
- Sin datos de benchmarks: no se han publicado resultados de evaluacion estandarizados, por lo que no es posible comparar objetivamente su rendimiento con otros modelos.
- Riesgo de alucinacion: como todos los modelos de lenguaje pequenos, puede generar informacion falsa o inventada con alta frecuencia.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede acarrear responsabilidades legales.

## Enlaces

- Repositorio HuggingFace (GGUF imatrix): https://huggingface.co/mradermacher/LFM2.5-350M-Uncensored-i1-GGUF
- Repositorio HuggingFace (GGUF estatico): https://huggingface.co/mradermacher/LFM2.5-350M-Uncensored-GGUF
- Modelo base (Uncensored): https://huggingface.co/naimulislam999/LFM2.5-350M-Uncensored
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Repositorio GGUF de la version estandar: https://huggingface.co/mradermacher/LFM2.5-350M-i1-GGUF
