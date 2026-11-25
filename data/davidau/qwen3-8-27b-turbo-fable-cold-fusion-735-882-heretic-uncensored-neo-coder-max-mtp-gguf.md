# DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen
Este repositorio contiene una familia de cuantizaciones GGUF de un fine-tune de gran tamano construido sobre la estirpe Qwen 3.8 de 27B, desarrollado por DavidAU, un autor conocido en Hugging Face por sus merges y fine-tunes multi-etapa orientados a razonamiento, escritura creativa y eliminacion de censura. El modelo parte de `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` y aplica tecnicas de multi-stage tune y multi-state merge bajo las denominaciones comerciales "Cold Fusion", "Fable Fusion 711" y "Turbo Brilliance 50x V2 AGI". El objetivo declarado es reducir el consumo de tokens de razonamiento entre un 50 % y un 90 % respecto al Qwen 3.8 27B base, manteniendo o mejorando la calidad de salida.

El modelo tiene 26.895.998.464 parametros (aproximadamente 26,9 mil millones) y se distribuye exclusivamente en formato GGUF, con variantes "regular" y "MTP" (multi-token prediction) con doble imatrix. El repositorio ocupa 492,8 GB, lo que refleja la gran cantidad de cuantizaciones publicadas. La model card afirma superar al Qwen 3.8 27B base y a los Qwen 3.5/3.6 27B y 35B-A3B en siete benchmarks criticos, con un ARC-C de 735 en 8 bits y 719 en 4 bits.

Su relevancia practica radica en dos factores: por un lado, la licencia Apache 2.0 permite uso comercial sin restricciones adicionales; por otro, el enfoque en reducir tokens de "thinking" lo hace atractivo para despliegues en produccion donde el coste por token y la latencia importan tanto como la calidad. El pipeline declarado es `image-text-to-text`, aunque no se detalla en la informacion disponible que componente de vision incorpora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de la familia Qwen 3.8; detalles internos no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en varias precisiones; se mencionan explicitamente 8 bits y 4 bits (Q4KS) y variantes "MTP" con doble imatrix; catalogo completo no disponible |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio solo de cuantizaciones; el modelo base en bfloat16 esta en otro repo) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna mas alla de su filiacion con Qwen 3.8 y el uso de atencion estandar de transformer; no se confirma si emplea attention lineal, SSM o componentes hibridos. Lo que si se documenta es el proceso de ajuste: el autor describe un pipeline de "multi-stage tune" y "multi-state merge" aplicado sobre el modelo base NM-DAU, con datasets propios (`DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`) y tecnicas etiquetadas como "Cold Fusion" y "Fable Fusion 711". El entrenamiento se realizo con Unsloth, segun los tags y la propia model card, lo que sugiere un ajuste eficiente en memoria sobre hardware de consumo.

Las innovaciones declaradas son tres. Primera, la reduccion de tokens de razonamiento ("TURBO"): el autor afirma que el modelo consume entre la mitad y una decima parte de los tokens de thinking del Qwen 3.8 27B base en los tres modos de operacion, manteniendo el detalle de salida. Segunda, la ablacion de censura ("Heretic"/"abliterated"), que elimina los rechazos del modelo alineado original. Tercera, las cuantizaciones "MTP" con doble imatrix ("DI-MATRIX"), que segun el autor preservan mejor la calidad en precisiones bajas. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades
- Generacion de texto general, razonamiento multi-paso y modo "thinking" explicito, con supuesta reduccion drastica de tokens de razonamiento frente al base.
- Generacion de codigo: el sufijo "NEO-CODER" y los tags "coder" indican ajuste especifico para tareas de programacion.
- Escritura creativa, ficcion, narrativa de todos los generos y roleplaying, con ajuste declarado para mantener voz y estilo.
- Capacidades multilingues en 16 idiomas, incluido el espanol.
- Tool calling y function calling: la model card remite a la pestana "community" para lo que describe como "el mejor rendimiento de tool calling registrado", sin cifras verificables en la informacion disponible.
- Sin censura ni rechazos por contenido (abliterated), lo que incluye la generacion de material que los modelos alineados rechazarian.
- Pipeline declarado `image-text-to-text`, lo que sugiere entrada de imagen, aunque no se detalla la arquitectura de vision ni sus capacidades concretas.
- Compatibilidad con endpoints de inferencia estandar (tag `endpoints_compatible`).

## Casos de uso
- Generacion de codigo en produccion: el ajuste "NEO-CODER" y el soporte declarado de tool calling permiten integrarlo en pipelines de CI/CD para autocompletado, generacion de tests y refactorizacion asistida, con la ventaja de que la reduccion de tokens de thinking abarata cada llamada.
- Atencion al cliente automatizada: los 16 idiomas declarados y el modo conversacional permiten desplegar un asistente multilingue en una sola instancia; la reduccion de tokens de razonamiento disminuye la latencia percibida en conversaciones multi-turno.
- Escritura creativa asistida: el ajuste especifico en ficcion, generos y roleplaying lo hace adecuado para herramientas de escritura, generacion de borradores narrativos y motores de personajes en videojuegos o plataformas interactivas.
- Generacion de contenido sin restricciones editoriales: para editoriales, estudios o proyectos que necesitan tratar temas sensibles (violencia en ficcion, terror, drama adulto) sin que el modelo rechace la peticion, el caracter abliterated evita fricciones.
- Razonamiento y analisis documental en local: con 26,9 B de parametros y cuantizaciones de 4 bits, puede ejecutarse en una estacion de trabajo con GPU de consumo para tareas de sintesis, extraccion y analisis sobre textos largos, sin enviar datos a terceros.
- Prototipado rapido de agentes: la combinacion de tool calling, modo thinking y bajo consumo de tokens lo hace util para iterar sobre disenos de agentes multi-paso antes de migrar a un modelo mayor.
- Traduccion y localizacion: la cobertura de 16 idiomas permite usarlo como motor de traduccion interna o de localizacion de contenidos, especialmente entre pares que incluyan espanol, ingles, chino, arabe o japones.

## Benchmarks y rendimiento
La model card afirma superar al Qwen 3.8 27B base y a los Qwen 3.5/3.6 27B y 35B-A3B en siete benchmarks criticos, pero no publica la tabla completa de resultados en la informacion disponible. Los unicos datos numericos concretos son de ARC:

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | 144 puntos por encima del Qwen 3.8 27B segun el autor |
| ARC-C (4 bits) | 719 | Superior a 718 en 4 bits |
| ARC-E (8 bits) | superior a 880 | En la "zona de inteligencia" de OpenAI, Claude y Gemini segun el autor |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar, ni tablas comparativas detalladas con los modelos citados. Las cifras de ARC provienen exclusivamente de la model card del autor y no se han verificado de forma independiente.

## Requisitos de hardware
- VRAM estimada: con 26,9 B de parametros, una cuantizacion Q4 requiere aproximadamente 15-17 GB de VRAM; una Q8 se situa en torno a 28-30 GB. Son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: para Q4, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q8 se necesita una A100 40 GB, H100 o una configuracion multi-GPU.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 bits y en GPU con 24 GB o mas; las variantes de 2-3 bits podrian caber en 12-16 GB con perdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; para mayor throughput, vLLM o TGI si se convierte a un formato soportado. El tag `endpoints_compatible` indica compatibilidad con endpoints de inferencia gestionados.
- Latencia y throughput: no disponibles. La model card afirma que el modelo es "mas rapido" que el base gracias a la reduccion de tokens de thinking, pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (DavidAU Qwen3.8-27B TURBO) | ~26,9 B | no disponible | Apache 2.0 | GGUF | Fine-tune abliterated con thinking reducido; ARC-C 735 (8 bits) |
| Qwen 3.8 27B (base) | ~27 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo original; segun el autor, 144 puntos menos en ARC-C y mas tokens de thinking |
| Qwen 3.6 27B | no disponible | no disponible | Apache 2.0 | no disponible | Citado por el autor como superado en los siete benchmarks |
| Qwen 3.6-35B-A3B | 35 B totales (MoE) | no disponible | Apache 2.0 | no disponible | Citado por el autor como superado en los siete benchmarks |

No se dispone de datos verificables de terceros para contrastar estas comparaciones. La informacion sobre contexto y rendimiento de los modelos alternativos no esta disponible en las fuentes consultadas.

## Limitaciones y advertencias
- Modelo abliterated y sin censura: puede generar contenido ofensivo, violento, sexual o ilegal. No es adecuado para aplicaciones orientadas al publico general sin filtros adicionales.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos, citas y referencias; el ajuste para reducir el razonamiento no elimina este riesgo y podria aumentarlo en tareas que requieren verificacion.
- Las afirmaciones de rendimiento (ARC-C 735, "mejor tool calling registrado") provienen unicamente del autor y no se han verificado de forma independiente; deben tratarse con cautela.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- El pipeline declarado es `image-text-to-text`, pero no se detalla la calidad ni las capacidades reales de vision; no debe asumirse un rendimiento equiparable al de modelos multimodales especializados.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre posibles reclamaciones derivadas del contenido generado.
- El repositorio ocupa 492,8 GB; descargar la familia completa de cuantizaciones no es practico, conviene seleccionar una sola variante.
- El modelo base es un fine-tune de un fine-tune; los sesgos acumulados de las etapas intermedias no estan documentados.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base (no cuantizado): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Modelos en tendencia del autor: https://huggingface.co/models?sort=trending&search=DavidAU
- FAQ y soporte: https://huggingface.co/DavidAU/support
- Coleccion Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Variante 27B Heretic v2: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Variante 27B no-Heretic v1: https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Variante 180B QNext Heretic v1: https://huggingface.co/DavidAU/Qwen3.8-Flash-Next-Abliterated-Uncensored-Turbo-Brilliance-50x-Reasoning-Instruct-GSQ-RCO-GGUF
- Variante 180B QNext no-Heretic v1: https://huggingface.co/DavidAU/Qwen3.8-Flash-Next-Turbo-Brilliance-50x-Reasoning-Instruct-GSQ-RCO-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
