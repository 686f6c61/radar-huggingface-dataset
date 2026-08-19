# mradermacher/Novelist1.0-27b-i1-GGUF

## Resumen

Novelist1.0-27b-i1-GGUF es una cuantización GGUF del modelo Novelist1.0-27b, creada por el equipo mradermacher. El modelo original está alojado en Hugging Face bajo el usuario Dxniz y no dispone de model card pública en el momento de redactar esta ficha. Esta versión GGUF está pensada para facilitar la ejecución local del modelo en CPU y GPU mediante herramientas como llama.cpp, Ollama o LM Studio.

La cuantización utiliza imatrix (matriz de importancia) para optimizar la pérdida de precisión, y ofrece un amplio abanico de formatos, desde Q2_K hasta Q6_K, lo que permite ajustar el equilibrio entre calidad y consumo de recursos. El repositorio se publicó el 18 de agosto de 2026 y, a fecha de esta ficha, no registra descargas ni valoraciones, por lo que se trata de un lanzamiento reciente sin validación comunitaria.

Aunque el nombre sugiere una orientación hacia la escritura creativa, no existe información pública sobre las capacidades reales del modelo, su arquitectura o su entrenamiento. Los desarrolladores que quieran evaluarlo deben partir de pruebas empíricas propias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el modelo original se anuncia como 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento

No se ha publicado ninguna informacion sobre la arquitectura, el dataset o el proceso de entrenamiento del modelo original Novelist1.0-27b. El repositorio de cuantizacion indica que se trata de una conversion con imatrix realizada con la herramienta de Nicoboss, pero no aporta detalles tecnicos adicionales. La ausencia de documentacion impide conocer si se trata de un transformer denso, un modelo MoE o cualquier otra topologia.

## Capacidades

- No se dispone de informacion verificada sobre las capacidades del modelo (generacion de texto, razonamiento, codigo, etc.).
- Al tratarse de un modelo de 27 mil millones de parametros, es razonable esperar un comportamiento competente en tareas genericas de lenguaje, pero no hay datos que lo confirmen.
- No se puede confirmar soporte de tool calling, function calling, agentes o capacidades multimodales.

## Casos de uso

No es posible recomendar casos de uso concretos sin informacion sobre las capacidades reales del modelo. La ausencia de model card, benchmarks y validacion comunitaria hace que cualquier aplicacion en produccion sea arriesgada. Los desarrolladores deberian realizar pruebas de calidad en sus propios dominios antes de integrar el modelo en un flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los requisitos dependen de la cuantizacion elegida y del modelo original de 27B. Estimaciones orientativas para inferencia local:

- Q2_K / IQ2: entre 10 y 12 GB de VRAM o RAM.
- Q4_K_M: aproximadamente 16-18 GB de VRAM o 32 GB de RAM.
- Q5_K_M: aproximadamente 20-22 GB de VRAM.
- Q6_K: aproximadamente 24-26 GB de VRAM.

GPUs recomendadas: RTX 4090, RTX 4080, A100, H100. En GPU de consumo, una RTX 3090 o 4090 con 24 GB puede ejecutar cuantizaciones hasta Q5 sin problemas. En CPU, se necesitan al menos 32 GB de RAM para las versiones mas pesadas.

Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con conversion previa del formato). La latencia y el throughput dependen del hardware y de la cuantizacion; no hay datos publicados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar Novelist1.0-27b con alternativas de la misma categoria. El nombre sugiere una orientacion hacia la escritura creativa, pero no hay datos publicos que lo respalden ni que permitan contrastar con otros modelos de 27B como Mistral-27B o Qwen2.5-27B.

## Limitaciones y advertencias

- No existe informacion sobre sesgos, alucinacion o limites de contexto.
- La licencia no esta especificada, por lo que el uso comercial es incierto y requiere verificar los terminos del modelo original.
- El repositorio no tiene descargas ni valoraciones, lo que indica una falta de validacion por parte de la comunidad.
- La ausencia de model card en el modelo original dificulta la evaluacion de riesgos y la integracion en produccion.
- El dato de parametros totales (3.391.984) mostrado en Hugging Face es inconsistente con un modelo de 27B y probablemente corresponde al tamaño de los tensores cuantizados, no al numero real de parametros.

## Enlaces

- Repositorio de cuantizacion: https://huggingface.co/mradermacher/Novelist1.0-27b-i1-GGUF
- Modelo original: https://huggingface.co/Dxniz/Novelist1.0-27b
