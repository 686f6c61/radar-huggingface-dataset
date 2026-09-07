# alst10/Llama3.2-24B-A3B-II-Dark-Champion-INSTRUCT-Heretic-Abliterated-Uncensored-ROCMFP4_FAST

## Resumen

El modelo Llama3.2-24B-A3B-II-Dark-Champion-INSTRUCT-Heretic-Abliterated-Uncensored-ROCMFP4_FAST es una cuantización GGUF publicada por alst10, basada en el modelo original de DavidAU. Se trata de una mezcla de expertos (MoE) derivada de Llama 3.2, con un diseño nominal de 8 expertos de 3B (24B totales, 3B activos), aunque los pesos reales en safetensors del repositorio suman 18.010.942.528 parámetros. El modelo está orientado a escritura creativa, ficción, roleplay y narrativa, con una ventana de contexto de 128.000 tokens.

La principal particularidad técnica es el formato de cuantización Q4_0_ROCmFP4_FAST, un tipo de GGUF especializado para aceleración en hardware AMD ROCm. Este formato solo puede cargarse con el fork de llama.cpp denominado ROCmFPX, desarrollado por charlie12345, y no es compatible con las versiones estándar de llama.cpp, KoboldCPP ni LM Studio. El modelo se publica bajo licencia CC-BY-4.0 y su lenguaje de trabajo es exclusivamente el inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Llama 3.2, con 8 expertos (8x3B) |
| Parametros totales | 18.010.942.528 (según safetensors del repositorio) |
| Parametros activos | 3B aprox. (designación A3B en el nombre del modelo) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | Q4_0_ROCmFP4_FAST (GGUF, requiere el fork ROCmFPX) |
| Idiomas soportados | Inglés |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (llama.cpp con extensiones ROCmFPX) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (MoE) con 8 expertos de 3B, heredada de la familia Llama 3.2. El modelo original de DavidAU es una fusión realizada con mergekit que combina varias versiones ajustadas (Dark Champion, Heretic, Abliterated, Uncensored) con el objetivo de potenciar la escritura creativa y reducir la censura. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni la aplicación de procesos de RLHF o DPO.

La innovación técnica destacable es el formato de cuantización ROCmFP4_FAST, que emplea layouts de memoria personalizados para acelerar la inferencia en GPUs AMD con ROCm. Este formato existe exclusivamente en el fork ROCmFPX de llama.cpp y no puede cargarse con las builds estándar del proyecto.

## Capacidades

- Generación de texto para escritura creativa: ficción, ciencia ficción, romance, terror y otros géneros narrativos.
- Generación de tramas, subtramas y continuación de escenas dentro de una historia.
- Roleplay y juegos de rol con un tono desinhibido, incluyendo lenguaje coloquial o soez.
- Prosa descriptiva y vívida (vivid prosing), orientada a la calidad literaria.
- Seguimiento de instrucciones (INSTRUCT) para tareas de escritura específicas.
- No se especifica soporte para tool calling, function calling ni capacidades multimodales en la información disponible.

## Casos de uso

- Escritura de ficción: el modelo puede generar relatos, novelas y cuentos de distintos géneros, aprovechando su ventana de 128k para mantener coherencia a lo largo de capítulos extensos.
- Continuación de escenas: útil para escritores que necesitan retomar un fragmento narrativo y expandirlo manteniendo el estilo y la voz del texto previo.
- Roleplay en juegos de rol de texto: el modelo puede interpretar personajes y producir diálogos inmersivos en entornos de rol, gracias a su naturaleza desinhibida y su capacidad para manejar contextos largos.
- Generación de tramas y subtramas: permite diseñar estructuras narrativas complejas, con arcos secundarios y desarrollo de personajes, lo que resulta valioso para guionistas y creadores de contenido.
- Asistente de escritura creativa con lenguaje explícito: para proyectos que requieren un tono sin filtros o contenido adulto, dentro de los límites legales y de la licencia.
- Despliegue en hardware AMD: gracias al formato ROCmFP4_FAST, el modelo puede ejecutarse en sistemas con GPUs AMD ROCm optimizadas, una opción interesante para usuarios que no disponen de GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 9.7 GB, por lo que se recomienda un mínimo de 12 a 16 GB de VRAM para inferencia con overhead.
- GPU recomendadas: AMD con soporte ROCm, dado que el formato de cuantización está diseñado específicamente para esa arquitectura. No se especifican modelos concretos.
- ¿Cabe en consumer GPU? Sí, si se dispone de una GPU AMD con 16 GB o más de VRAM.
- Opciones de despliegue: llama.cpp con el fork ROCmFPX. No es compatible con llama.cpp estándar, KoboldCPP ni LM Studio sin compilar con ese fork.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato |
|---|---|---|---|---|
| alst10/...-ROCMFP4_FAST | 18.010.942.528 | 128k | CC-BY-4.0 | GGUF ROCmFP4_FAST |
| DavidAU/...-Uncensored | 24B nominal (no confirmado) | 128k | CC-BY-4.0 | safetensors |
| Highendpc/...-Q4_K_M-GGUF | 24B nominal (no confirmado) | 128k | CC-BY-4.0 | GGUF Q4_K_M |
| Meta-Llama-3.2-8x3B-Instruct | 24B nominal, 3B activos | 128k | Llama 3.2 Community License | safetensors |

## Limitaciones y advertencias

- El formato ROCmFP4_FAST es incompatible con llama.cpp estándar. Solo funciona con el fork ROCmFPX, lo que limita su despliegue a entornos preparados específicamente para ello.
- El modelo solo está disponible en inglés, lo que impide su uso para tareas en otros idiomas.
- Al ser un modelo "abliterated" y "uncensored", puede generar contenido explícito, ofensivo o inapropiado sin filtros, lo que supone un riesgo de seguridad y de reputación en aplicaciones públicas.
- No se dispone de datos sobre sesgos conocidos, aunque al estar basado en Llama 3.2 puede heredar sesgos del modelo original.
- Riesgo de alucinación no especificado, pero presente en todos los modelos generativos de texto.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero es necesario verificar que la fusión respete la licencia del modelo base de Meta, especialmente si se distribuye comercialmente.
- La ventana de contexto de 128k puede reducirse en la práctica según la cuantización, el hardware y la implementación concreta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/alst10/Llama3.2-24B-A3B-II-Dark-Champion-INSTRUCT-Heretic-Abliterated-Uncensored-ROCMFP4_FAST
- Modelo original de DavidAU: https://huggingface.co/DavidAU/Llama3.2-24B-A3B-II-Dark-Champion-INSTRUCT-Heretic-Abliterated-Uncensored
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Cuantización Q4_K_M alternativa: https://huggingface.co/Highendpc/Llama3.2-24B-A3B-II-Dark-Champion-INSTRUCT-Heretic-Abliterated-Uncensored-Q4_K_M-GGUF
