# mradermacher/Qwen3.5-9B-Brainwaves-X-i1-GGUF

## Resumen

Qwen3.5-9B-Brainwaves-X-i1-GGUF es una distribucion de cuantizaciones GGUF generadas por mradermacher a partir del modelo nightmedia/Qwen3.5-9B-Brainwaves-X, un merge de la familia Qwen3.5 con 9.197.093.888 parametros totales. El repositorio no contiene un modelo original, sino los ficheros cuantizados en formato GGUF (incluyendo variantes i1 con imatrix) pensados para inferencia local eficiente con llama.cpp y herramientas compatibles. La licencia declarada es Apache 2.0.

El modelo base combina capacidades de razonamiento con chain-of-thought (long-cot), codigo, matematicas, STEM, escritura creativa y roleplaying, y segun las etiquetas del autor soporta contextos declarados de hasta 256k y 1M tokens. Incluye ademas etiquetas relacionadas con decodificacion especulativa y multi-token-prediction, asi como soporte multilingue en ingles, chino, japones y espanol. Es relevante para desarrolladores que quieran ejecutar un modelo de ~9B con capacidades de razonamiento en hardware de consumo mediante cuantizacion agresiva.

Esta ficha describe principalmente el repositorio de cuantizaciones y las caracteristicas declaradas del modelo base. No se dispone de informacion detallada sobre el dataset de entrenamiento, el proceso de merge ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles de capas y atencion no disponibles) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | declarada 256k y 1M tokens en las etiquetas del autor; no verificada |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, ademas de fichero imatrix |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

El repositorio es una coleccion de cuantizaciones GGUF del modelo nightmedia/Qwen3.5-9B-Brainwaves-X, generadas con el flujo de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf). Las cuantizaciones i1 emplean ficheros imatrix para mejorar la calidad de los niveles bajos de cuantizacion; el repositorio incluye el propio fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. Se ofrece tambien un repositorio hermano con cuantizaciones estaticas.

El modelo base es un merge (etiquetas mergekit, merge) de la familia Qwen3.5, con etiquetas que apuntan a distillation, coder-flash, claude, polaris y polaris-alpha, lo que sugiere una combinacion de modelos orientada a razonamiento y codigo. Las etiquetas mencionan multi-token-prediction y speculative-decoding. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF/DPO. La model card indica que se trata de un modelo de vision y que los ficheros mmproj, si existen, estarian en el repositorio estatico.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con chain-of-thought y modo long-cot (etiquetas reasoning, long-cot).
- Codigo y matematicas (etiquetas coding, math, coder-flash).
- STEM e investigacion (etiquetas stem, research).
- Escritura creativa: ficcion, generacion de tramas y subtramas, continuacion de escenas, storytelling, ciencia ficcion, roleplaying.
- Capacidades multilingues en ingles, chino, japones y espanol.
- Posible soporte de vision segun la model card (ficheros mmproj en el repositorio estatico); no confirmado en este repositorio.
- Etiquetas de decodificacion especulativa y multi-token-prediction (soporte no detallado).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita, aunque las etiquetas de razonamiento lo sugieren.

## Casos de uso

- Razonamiento local con chain-of-thought: usar las cuantizaciones i1-Q4_K_M o i1-Q5_K_M para ejecutar tareas de razonamiento paso a paso en una estacion de trabajo con GPU de consumo, aprovechando el modo long-cot declarado.
- Generacion de codigo en local: desplegar con llama.cpp u Ollama para asistencia de programacion sin conexion, eligiendo i1-Q4_K_S como equilibrio entre tamano y calidad.
- Escritura creativa y ficcion: emplear el modelo para generar tramas, subtramas y continuaciones de escenas, gracias a las etiquetas especificas de creative writing y storytelling.
- Roleplaying y narrativa interactiva: usar cuantizaciones de mayor calidad (i1-Q6_K) en aplicaciones de chat con personajes, donde la coherencia a largo plazo importa mas que la velocidad.
- Procesamiento de documentos largos: si se confirma el contexto extendido declarado (256k/1M), usar el modelo para resumen y preguntas sobre documentos extensos, teniendo en cuenta el coste de memoria de la cache KV.
- Prototipado multilingue: cubrir interacciones en ingles, chino, japones y espanol en un unico modelo para aplicaciones de soporte o traduccion asistida.
- Evaluacion de cuantizaciones: usar el fichero imatrix incluido para generar cuantizaciones propias adaptadas a un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero, sin contar cache KV): i1-Q2_K ~4,0 GB; i1-IQ3_S/IQ3_M ~4,6 GB; i1-Q3_K_M ~4,8 GB; i1-IQ4_XS ~5,4 GB; i1-Q4_K_S ~5,6 GB; i1-Q4_K_M ~5,9 GB; i1-Q5_K_M ~6,7 GB; i1-Q6_K ~7,7 GB.
- La cache KV para contextos largos (256k o 1M tokens declarados) puede superar ampliamente el tamano de los pesos; se recomienda cuantizar la cache KV o limitar el contexto en funcion de la VRAM.
- GPU de consumo: las cuantizaciones de 4-6 GB caben en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070); i1-Q5_K_M e i1-Q6_K requieren 8-12 GB (RTX 4070, RTX 3080, RTX 4080).
- GPU profesionales: A100, H100 o RTX 4090 permiten ejecutar las cuantizaciones mayores con contextos mas amplios y mayor throughput.
- Despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repositorio esta etiquetado como endpoints_compatible. Para el modelo base en bf16 se requeriria aproximadamente 18-20 GB de VRAM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Brainwaves-X-i1-GGUF (este) | 9,2B | 256k/1M declarado | Apache 2.0 | GGUF (i1) | Merge orientado a razonamiento, codigo y escritura creativa |
| Qwen3.5-9B-Brainwaves-X (base) | 9,2B | 256k/1M declarado | Apache 2.0 | safetensors/bf16 | Modelo original sin cuantizar |
| Qwen3.5-9B-Brainwaves-X-GGUF (estatico) | 9,2B | 256k/1M declarado | Apache 2.0 | GGUF estatico | Mismas cuantizaciones sin imatrix; incluye mmproj si existe |
| Otros modelos ~9B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo experimental: las etiquetas incluyen experimental; no se garantiza estabilidad en produccion.
- Es un merge de modelos, lo que puede introducir comportamientos impredecibles o degradacion en tareas especificas.
- Las capacidades de contexto de 256k y 1M tokens son declaradas en etiquetas y no estan verificadas; el coste de memoria de la cache KV puede hacerlas inviables en hardware de consumo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles; al ser un merge sin documentacion de datos, no se puede evaluar la composicion del entrenamiento.
- Cobertura idiomatica limitada a en, zh, ja y es; el rendimiento en espanol no esta documentado.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los modelos componentes del merge, no detalladas.
- Las cuantizaciones de 2-3 bits (i1-Q2_K, i1-Q3_K_S) degradan la calidad; el autor recomienda IQ3_XXS o superiores.
- El soporte de vision y de tool calling no esta confirmado en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-9B-Brainwaves-X-i1-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves-X
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.5-9B-Brainwaves-X-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-Brainwaves-X-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH: https://www.nethype.de/
