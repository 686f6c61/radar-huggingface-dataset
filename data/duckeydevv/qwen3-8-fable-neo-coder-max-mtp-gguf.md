# duckeydevv/Qwen3.8-Fable-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-Fable-NEO-CODER-MAX-MTP-GGUF es un fine-tune del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, publicado por el usuario duckeydevv en formato GGUF. Se trata de una variante "abliterated/heretic" (sin las capas de rechazo habituales) orientada a codigo, escritura creativa y razonamiento, con cuantizaciones regulares y MTP (multi-token prediction) generadas con imatrix doble. El modelo base declara 26.895.998.464 parametros (aproximadamente 27B) y se distribuye con licencia Apache 2.0.

El modelo se presenta como un fine-tune multi-etapa y multi-merge construido sobre la familia Qwen 3.8, con un pipeline declarado image-text-to-text (aunque no se detalla la torre de vision en la informacion disponible). Incorpora modos de "thinking" y razonamiento, y el autor afirma que reduce el consumo de tokens de pensamiento entre un 50 % y un 90 % respecto al Qwen 3.8 27B estandar, manteniendo el detalle de salida.

Su relevancia practica radica en que ofrece pesos GGUF cuantizados para ejecucion en hardware de consumo, con soporte declarado de 16 idiomas (entre ellos castellano) y un enfasis explicito en generacion de codigo, escritura creativa y roleplay sin restricciones de contenido. No obstante, la informacion disponible procede casi exclusivamente de la model card del autor y no incluye verificacion independiente de los benchmarks citados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.8), fine-tune multi-etapa y multi-merge; no se detalla si incorpora capas MoE |
| Parametros totales | 26.895.998.464 (aprox. 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF regulares y GGUF MTP (multi-token prediction), con imatrix doble (DI-MATRIX); se mencionan Q4KS y 8 bit en la model card |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 389 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de identificarla como un transformer de la familia Qwen 3.8 con aproximadamente 27B de parametros. El modelo es un fine-tune del checkpoint DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, que a su vez se describe como un merge multi-etapa ("multi-stage-tune" y "multi-state-merge") entrenado con los metodos que el autor denomina "COLD FUSION" y "FABLE FUSION 711".

El entrenamiento se realizo con Unsloth y utiliza los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. La model card menciona tecnicas de "abliteration" y "heretic" para eliminar los mecanismos de rechazo del modelo original, asi como un ajuste especifico para reducir el sobre-razonamiento y el consumo excesivo de tokens de pensamiento. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. Las cuantizaciones incluyen variantes MTP (multi-token prediction) generadas con doble imatrix, orientadas a acelerar la decodificacion.

## Capacidades

- Generacion de texto general y conversacion multi-turno.
- Razonamiento con modo "thinking" explicito y modos de operacion diferenciados (la model card menciona tres modos).
- Generacion de codigo: el nombre del modelo incluye "CODER" y las etiquetas destacan el uso para programacion.
- Escritura creativa: ficcion, narrativa, todos los generos y roleplay.
- Capacidades multilingues en 16 idiomas, incluido el castellano.
- Tool calling y function calling: la model card remite a la pestana "community" para resultados de terceros que afirman un rendimiento destacado en tool calling (no verificable en la informacion disponible).
- Capacidad declarada de imagen a texto (pipeline image-text-to-text), aunque no se detalla la torre de vision ni los formatos de imagen admitidos.
- Salida sin censura ("uncensored/abliterated"): el modelo no aplica los filtros de rechazo del modelo original.

## Casos de uso

- Generacion de codigo en local: con cuantizaciones GGUF de 4 y 8 bit, el modelo puede ejecutarse en estaciones de trabajo con GPU de consumo para autocompletado, refactorizacion y generacion de tests dentro de pipelines de desarrollo.
- Escritura creativa y narrativa: el ajuste esta orientado explicitamente a ficcion y roleplay, por lo que resulta adecuado para generar borradores de relatos, dialogos y desarrollo de personajes con alta riqueza descriptiva.
- Asistente de razonamiento con bajo consumo de tokens: el ajuste "TURBO" reduce los tokens de pensamiento entre un 50 % y un 90 %, lo que abarata el coste por consulta en tareas de analisis y planificacion.
- Agentes con tool calling: si se confirman los resultados de terceros citados en la model card, el modelo puede integrarse en flujos de agente que invocan APIs y funciones externas.
- Despliegue multilingue: con soporte de 16 idiomas, puede emplearse en atencion al cliente o generacion de contenido para mercados en espanol, portugues, frances, aleman, etc.
- Experimentacion en investigacion: al ser abliterated y Apache 2.0, sirve para estudiar el comportamiento de modelos sin capas de rechazo y para comparar tecnicas de merge y cuantizacion.
- Prototipado en hardware de consumo: las cuantizaciones GGUF permiten probar un modelo de 27B en equipos sin GPUs de datacenter, algo relevante para desarrolladores independientes.

## Benchmarks y rendimiento

La model card cita resultados del autor (no verificados de forma independiente en la informacion disponible):

| Benchmark | Resultado declarado |
|---|---|
| ARC-C (8 bit) | 735 |
| ARC-C (4 bit) | 719 |
| ARC-E (8 bit) | mas de 880 |
| Comparacion con Qwen 3.8 27B | supera los 7 benchmarks criticos declarados |
| Comparacion con Qwen 3.6-35B-A3B, Qwen 3.6 27B, Qwen 3.5 27B | supera los 7 benchmarks en todos los casos |

No se han publicado en la informacion disponible resultados detallados de MMLU, HumanEval o GSM8K con cifras concretas, ni una tabla completa de los siete benchmarks mencionados. Los datos de ARC-C y ARC-E proceden exclusivamente de la model card del autor.

## Requisitos de hardware

- VRAM estimada: para un modelo de 27B, una cuantizacion de 4 bit requiere del orden de 14-18 GB de VRAM (estimacion estandar, no confirmada en la informacion disponible); 8 bit requeriria aproximadamente 27-30 GB.
- GPU recomendadas: para 4 bit, RTX 4090 (24 GB) o RTX 3090; para 8 bit, A100 40 GB, H100 o RTX 6000 Ada.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 bit y en GPUs con 24 GB o mas; las variantes de 8 bit no caben en GPUs de consumo convencionales.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; la model card menciona compatibilidad con endpoints. No se confirma soporte de vLLM o TGI para estos pesos.
- Latencia y throughput: no disponible. La model card afirma que las variantes MTP aceleran la decodificacion, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Fable-NEO-CODER-MAX (este) | 27B | no disponible | Apache 2.0 | GGUF | Fine-tune abliterated, ARC-C 735 (8 bit) segun el autor |
| Qwen 3.8 27B (base de referencia) | 27B | no disponible | no disponible | safetensors/GGUF | Referencia del autor; el fine-tune afirma superarlo en 7 benchmarks |
| Qwen 3.6 27B | 27B | no disponible | no disponible | no disponible | Citado como superado por este modelo en los 7 benchmarks del autor |
| Qwen 3.6-35B-A3B | 35B (MoE) | no disponible | no disponible | no disponible | Citado como superado pese a su mayor tamano |

Los datos de comparacion proceden de la model card y no han sido verificados de forma independiente.

## Limitaciones y advertencias

- El modelo es "abliterated/heretic": se han eliminado los mecanismos de rechazo, por lo que puede generar contenido ofensivo, ilegal o danino sin filtros. No es adecuado para aplicaciones orientadas al publico sin moderacion adicional.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; los fine-tunes creativos tienden a priorizar la narrativa sobre la precision.
- Los benchmarks citados (ARC-C 735, ARC-E 880+) proceden unicamente del autor y no cuentan con verificacion independiente en la informacion disponible.
- No se especifica la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- El rendimiento multilingue en castellano no esta cuantificado; el soporte se declara a nivel de etiqueta.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets intermedios podrian tener condiciones adicionales no detalladas en la informacion disponible.
- El repo ocupa 389 GB por acumular multiples cuantizaciones; conviene descargar solo el archivo GGUF necesario.
- El modelo se publico el 22 de noviembre de 2026 y no registra descargas ni likes, por lo que carece de validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/duckeydevv/Qwen3.8-Fable-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del modelo base: https://huggingface.co/DavidAU
- Coleccion Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
