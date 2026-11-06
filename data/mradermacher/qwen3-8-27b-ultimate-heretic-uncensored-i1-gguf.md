# mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF` es un repositorio de cuantizaciones GGUF generado por mradermacher a partir del modelo `DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored`. No se trata de un modelo entrenado desde cero, sino de una redistribucion en formatos cuantizados (Q2 a Q6, incluyendo variantes IQ) pensada para su uso con llama.cpp y derivados. El nombre sugiere una base Qwen3 de 27B y un ajuste orientado a eliminar restricciones de alineamiento ("uncensored"), aunque la model card del repositorio no aporta documentacion tecnica al respecto.

La informacion disponible es extremadamente limitada: el repositorio no incluye pipeline declarado, licencia, idiomas soportados ni resultados de evaluacion. Ademas, existe una incoherencia significativa entre el nombre del modelo (que indica 27B) y el campo de parametros totales del repositorio (6.789.424), lo que impide confirmar el tamano real del modelo subyacente. El tamano del repositorio figura como 0.0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que los metadatos son incorrectos.

Por tanto, esta ficha debe interpretarse como una descripcion del artefacto de cuantizacion y de sus limitaciones documentales, no como una evaluacion tecnica del modelo base. Cualquier uso en produccion requeriria verificar directamente los archivos del repositorio y la model card del modelo original de DavidAU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere base Qwen3, sin confirmar) |
| Parametros totales | 6.789.424 segun metadatos del repo; el nombre indica 27B (dato contradictorio, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_XXS, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones weighted/imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre del repositorio apunta a una base de la familia Qwen3 con 27B de parametros, ajustada por DavidAU bajo la denominacion "Ultimate-Heretic-Uncensored", un tipo de fine-tuning orientado a reducir el rechazo de peticiones. Sin embargo, ni la model card de este repositorio ni los metadatos confirman la arquitectura, el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO u otras.

Lo unico verificable es el proceso de cuantizacion: los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, y se menciona el uso de cuantizaciones weighted/imatrix. Esto implica que las matrices de importancia se calcularon para mejorar la calidad de las cuantizaciones de baja precision (especialmente las variantes IQ y Q2/Q3), un procedimiento habitual en el ecosistema llama.cpp para mitigar la perdida de rendimiento en bits bajos.

## Capacidades

- Generacion de texto autoregresiva en formato GGUF, ejecutable con llama.cpp y compatible con herramientas derivadas.
- Razonamiento y conversacion multi-turno: presumiblemente heredadas del modelo base Qwen3, aunque no documentadas en este repositorio.
- Generacion de codigo y matematicas: no confirmado en la documentacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.
- Ajuste "uncensored": el nombre indica que se ha reducido el alineamiento de seguridad, lo que puede afectar a la calidad y seguridad de las respuestas.

## Casos de uso

- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, aunque el tamano real del modelo debe verificarse antes de dimensionar el hardware.
- Experimentacion con modelos sin filtros de seguridad: util para investigacion sobre alineamiento, robustez y comportamiento de modelos "uncensored" en entornos controlados.
- Prototipado offline: al ser un artefacto GGUF, puede integrarse en aplicaciones de escritorio o edge sin dependencia de APIs externas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece un amplio abanico de niveles (Q1 a Q6, IQ y Q), lo que permite estudiar el compromiso entre tamano, velocidad y calidad.
- Fine-tuning posterior sobre formatos ligeros: las variantes Q2/Q3 pueden servir como base para experimentos con recursos limitados, aunque con perdida de calidad esperada.
- Pruebas de pipelines de inferencia: integracion en vLLM (con soporte GGUF limitado), llama.cpp server o TGI para validar latencia y throughput antes de adoptar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision, ya que el tamano real del modelo es contradictorio (6,8 M de parametros segun metadatos frente a 27B segun el nombre).
- Si el modelo fuese realmente de 27B, una cuantizacion Q4_K_M ocuparia aproximadamente 16-17 GB, IQ4_XS en torno a 15 GB, Q5_K_M cerca de 19 GB y Q6_K alrededor de 22 GB.
- GPU recomendadas (asumiendo 27B): RTX 4090 (24 GB) para Q4/Q5, A100 40 GB o H100 para Q6 y contextos largos; para cuantizaciones Q2/Q3 podria bastar una RTX 3090 o 4080 con 16 GB.
- Si el modelo fuese realmente de 6,8 M de parametros, cabria en cualquier GPU consumer e incluso en CPU, pero esto es incompatible con el nombre del repositorio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF (este repo) | no confirmado (nombre 27B; metadatos 6,8 M) | no disponible | no disponible | GGUF | Hugging Face |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (base) | 27B segun nombre | no disponible | no disponible | safetensors (presumible) | Hugging Face |
| Otras cuantizaciones GGUF de mradermacher | variable | variable | variable | GGUF | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Incoherencia critica entre el nombre (27B) y los parametros totales declarados (6.789.424): verificar los archivos antes de cualquier uso.
- Ausencia de licencia explicita: no se puede asumir uso comercial permitido; consultar la licencia del modelo base de DavidAU y de Qwen.
- El ajuste "uncensored" implica reduccion de salvaguardas; riesgo elevado de contenido inapropiado, sesgado o danino en produccion.
- Riesgo de alucinacion no evaluado; sin benchmarks publicados.
- Idiomas y contexto no documentados.
- Tamano del repositorio declarado como 0.0 GB: posiblemente los pesos no estan subidos o los metadatos son incorrectos.
- Sin pipeline ni tags de tarea: no se puede confirmar el proposito previsto mas alla de la generacion de texto.
- Las cuantizaciones de baja precision (Q1, Q2, IQ2) degradan notablemente la calidad y no deberian usarse en produccion.
- Fecha de creacion futura (2026-11-05) en los metadatos: inconsistencia adicional que sugiere datos poco fiables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF
- Modelo base citado: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
