# netprojects/Hy-MT3-30B-A3B-LayerFit-MLX-4bit

## Resumen

Hy-MT3-30B-A3B-LayerFit-MLX-4bit es una cuantizacion de 4 bits del modelo de traduccion `tencent/Hy-MT3-30B-A3B`, preparada por NetProjects para su ejecucion en Apple Silicon mediante la libreria MLX. El modelo base es el modelo de traduccion mas potente de Tencent de la familia Hy-MT3, una arquitectura de mezcla de expertos (MoE) con unos 30.000 millones de parametros totales y alrededor de 3.000 millones activos por token, orientada a traduccion multilingue en cerca de 100 idiomas.

La aportacion especifica de esta build es la tecnica LayerFit, un procedimiento de busqueda por capas que distribuye el presupuesto de bits de forma no uniforme, asignando mas precision a las partes del modelo que mas degradan su comportamiento a baja precision (expertos, experto compartido, atencion, embeddings y cabeza de salida). El resultado ocupa 16,9 GB en disco y, segun el autor, se aproxima mas al modelo original en bf16 que una cuantizacion estandar del mismo tamano.

Es relevante para desarrolladores que necesitan ejecutar un modelo de traduccion de gran calidad en local sobre Macs con memoria unificada moderada (24 GB recomendados), sin depender de GPUs dedicadas ni de servicios en la nube, manteniendo la licencia Apache-2.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`hy_v3`), implementacion MLX incluida en el repo (`hy_v3.py`) |
| Parametros totales | 30.064.725.888 (aproximadamente 30B) |
| Parametros activos | Aproximadamente 3B por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (esta build, LayerFit); existen builds del mismo autor en 3, 6 y 8 bits |
| Idiomas soportados | Aproximadamente 100 idiomas (segun model card del autor); lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 16,9 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos con la arquitectura `hy_v3`, que mlx-lm no incluye de serie; por ello el repositorio incorpora una implementacion propia (`hy_v3.py`) y un `config.json` que la referencia, lo que obliga a usar `trust-remote-code`. El router del MoE se mantiene en float32 y no se cuantiza, un detalle relevante para la estabilidad del enrutado a baja precision.

Sobre el entrenamiento del modelo base (composicion del dataset, numero de tokens, uso de RLHF o DPO) no hay informacion en la documentacion proporcionada; la model card remite a la ficha original de Tencent. La innovacion tecnica de esta build es LayerFit: en lugar de aplicar el mismo numero de bits a todas las capas, se mide la degradacion de cada componente (expertos, experto compartido y atencion de cada capa, embeddings y cabeza de salida) y se reparte el mismo presupuesto de tamano donde mas mejora la fidelidad. La receta exacta esta en `layerfit-recipe.json` dentro del repositorio.

## Capacidades

- Traduccion multilingue entre aproximadamente 100 idiomas, con prompts de traduccion directa (se citan ejemplos hacia griego, chino, japones, aleman, frances, espanol, arabe y ruso, y desde griego y chino hacia ingles).
- Generacion de texto condicionada por instrucciones de traduccion con formato estricto (salida solo del texto traducido, sin explicaciones).
- Configuracion de decodificacion recomendada por Tencent: temperatura 0.7, top_p 1.0 y hasta 4096 tokens nuevos.
- Ejecucion nativa en Apple Silicon mediante MLX (mlx-lm >= 0.32.2).
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Traduccion de documentacion tecnica en local: el modelo permite traducir manuales y guias entre idiomas europeos y asiaticos desde un Mac, sin enviar contenido propietario a servicios externos.
- Localizacion de productos de software: integrado en un pipeline que procesa ficheros de cadenas (por ejemplo, recursos de aplicaciones) y traduce cada entrada con el prompt de traduccion estricta que evita explicaciones adicionales.
- Traduccion de correspondencia y soporte multilingue: para equipos que gestionan correos o tickets en varios idiomas y necesitan una traduccion de calidad sin salir del portatil.
- Procesamiento por lotes de corpus multilingues: al ejecutarse con mlx-lm, se puede automatizar la traduccion de grandes volumenes de texto en una estacion de trabajo Apple Silicon con 24 GB o mas de memoria unificada.
- Prototipado e investigacion en traduccion automatica: util para comparar salidas frente al modelo bf16 original o frente a cuantizaciones estandar, dado que el autor publica metricas de acuerdo top-1 y KL.
- Evaluacion de tecnicas de cuantizacion: la receta LayerFit y las builds de 3, 4, 6 y 8 bits del mismo autor permiten estudiar el compromiso entre tamano, fidelidad y calidad de traduccion en hardware de consumo.
- Despliegue en entornos con requisitos de privacidad: al ser Apache-2.0 y ejecutarse en local, encaja en flujos donde no se permite el envio de datos a APIs de terceros.

## Benchmarks y rendimiento

Datos publicados por el autor de la build (comparados contra su conversion bf16 de `tencent/Hy-MT3-30B-A3B`):

| Metrica | 4-bit estandar | LayerFit 4-bit |
|---|---|---|
| Acuerdo top-1 con bf16 | 90,4 % | 91,6 % |
| Error KL | 0,1270 | 0,0787 (38 % menor) |
| Prompts de traduccion superados | no disponible | 10/10 |
| Acuerdo de siguiente token con bf16 (204 posiciones) | 97,1 % | 98,0 % |

Medido en un MacBook Pro M5 Max el 27 de noviembre de 2026 con mlx-lm 0.32. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU, COMET) en la informacion disponible.

## Requisitos de hardware

- Memoria recomendada por el autor: 24 GB de memoria unificada para la build de 4 bits (16,9 GB en disco); 18 GB para la build de 3 bits (13,2 GB).
- Hardware objetivo: Apple Silicon (se cita como referencia un MacBook Pro M5 Max). No esta pensado para GPUs NVIDIA.
- Cabe en Macs consumer con 24 GB o mas de memoria unificada (por ejemplo, configuraciones de MacBook Pro o Mac Studio); en equipos de 16 GB no es recomendable esta build de 4 bits.
- Despliegue: mlx-lm >= 0.32.2 con `--trust-remote-code` (obligatorio por la arquitectura `hy_v3`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta build.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B-LayerFit-MLX-4bit (esta build) | 30B totales, ~3B activos | no disponible | Apache-2.0 | MLX 4 bits, Apple Silicon | 16,9 GB, 91,6 % acuerdo top-1 con bf16 |
| Hy-MT3-30B-A3B-MLX-4bit (build estandar del mismo autor) | 30B totales, ~3B activos | no disponible | Apache-2.0 | MLX 4 bits, Apple Silicon | Mismo tamano; 90,4 % acuerdo top-1 y KL 0,1270 |
| Hy-MT3-30B-A3B-LayerFit-MLX-3bit | 30B totales, ~3B activos | no disponible | Apache-2.0 | MLX 3 bits, Apple Silicon | 13,2 GB, 18 GB de memoria recomendada |
| tencent/Hy-MT3-30B-A3B (modelo base) | 30B totales, ~3B activos | no disponible | Apache-2.0 | Pesos originales | Referencia bf16 del autor; resultados en su model card |

No se dispone de datos de benchmarks comparativos con otros modelos de traduccion en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce desviaciones respecto al modelo bf16: el propio autor reporta un 8,4 % de desacuerdo top-1 en su prueba, por lo que no es equivalente al modelo original.
- El repositorio requiere `trust-remote-code` porque incluye codigo Python propio (`hy_v3.py`); conviene auditar ese codigo antes de ejecutarlo en entornos sensibles.
- Solo esta probado y empaquetado para MLX en Apple Silicon; no hay soporte documentado para CUDA, vLLM, llama.cpp u otros runtimes.
- La lista concreta de idiomas soportados no esta disponible; la cifra de "aproximadamente 100 idiomas" proviene de la model card del autor.
- No se han publicado resultados de benchmarks estandar de calidad de traduccion (BLEU, COMET) ni evaluaciones independientes; las metricas disponibles son internas del autor.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; como modelo generativo, puede producir traducciones incorrectas o inventar contenido, especialmente fuera de los pares de idiomas probados.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el fichero `LICENSE.txt` de Tencent y el `NOTICE` que describe la conversion.
- El proyecto no esta afiliado a Tencent; LayerFit es una marca de NetProjects, lo que puede afectar a soporte y mantenimiento a largo plazo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio Hugging Face de esta build: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-LayerFit-MLX-4bit
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Build estandar de 4 bits del mismo autor: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-MLX-4bit
- Build de 3 bits: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-LayerFit-MLX-3bit
- Build de 6 bits: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-MLX-8bit
- Sitio del autor: https://netprojects.com
