# AMSI7755/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen
Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es una cuantizacion GGUF de un fine-tune de gran escala sobre la familia Qwen 3.8 de 27B, publicado por el usuario AMSI7755 a partir del modelo de DavidAU. Se trata de un derivado "abliterated" y "uncensored" orientado a eliminar rechazos y restricciones de alineamiento, con enfasis declarado en escritura creativa, roleplay, generacion de codigo y razonamiento con un consumo reducido de tokens de "thinking". El autor original lo presenta como un modelo multi-etapa (multi-stage tuned, multi-state merge) construido con metodos que denomina "Cold Fusion" y "Fable Fusion 711", entrenado con Unsloth sobre hardware de consumo.

El modelo tiene 26.895.998.464 parametros (aproximadamente 27B) y se distribuye exclusivamente en formato GGUF, con variantes "regular" y "MTP" (multi-token prediction) y dos familias de cuantizacion: Neo-CODER MAX DI-MATRIX (doble imatrix) y "Turbo Brilliance 50x V2 AGI". El repositorio ocupa 492,8 GB por la acumulacion de multiples cuantizaciones. La model card afirma que supera a Qwen 3.8 27B, Qwen 3.6 27B, Qwen 3.5 27B y Qwen3.6-35B-A3B en siete benchmarks, con cifras de ARC-C de 735 en 8 bits y 719 en 4 bits, si bien no se aportan metodologias reproducibles ni resultados de terceros verificables en la informacion disponible.

La relevancia de esta ficha es doble: por un lado, documenta una practica extendida en el ecosistema open source (fine-tunes sin censura sobre modelos densos de ~27B para uso en hardware de consumo); por otro, sirve de caso de estudio sobre la dificultad de evaluar afirmaciones de rendimiento en model cards sin datos auditables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen 3.8 27B); variantes con multi-token prediction (MTP) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 4 bits y 8 bits (Q4KS, Q8 y variantes "Neo-CODER MAX DI-MATRIX" y "Turbo Brilliance 50x V2 AGI"); no se detallan todas las variantes |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con imatrix); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento
La arquitectura subyacente es un transformer denso de aproximadamente 27B parametros, heredado de la familia Qwen 3.8, sobre el que se aplican tecnicas de fine-tuning multi-etapa y fusion de estados (multi-state merge). El autor describe dos metodos propietarios de entrenamiento, "Cold Fusion" y "Fable Fusion 711", sin publicar detalles sobre hiperparametros, composicion exacta del dataset ni numero de tokens de entrenamiento. Los datasets citados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, de contenido no especificado en la informacion disponible.

El proceso incluye una fase de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) que da lugar a la variante "Heretic Uncensored". La innovacion declarada mas concreta es la reduccion de tokens de razonamiento: el autor afirma que el modelo consume entre la mitad y una decima parte de los tokens de "thinking" de Qwen 3.8 27B estandar, manteniendo la calidad de salida. Las variantes MTP incorporan prediccion multi-token para acelerar la decodificacion. No se documenta el uso de RLHF, DPO ni datos de preferencias en la informacion disponible.

## Capacidades
- Generacion de texto general, con enfasis en escritura creativa, ficcion, narrativa de genero y roleplay.
- Razonamiento con modo "thinking" y reduccion declarada del consumo de tokens de razonamiento.
- Generacion de codigo (etiqueta "coder" y variante "NEO-CODER").
- Capacidades multimodales declaradas por el pipeline image-text-to-text, aunque no se detallan en la model card.
- Soporte multilingue en 16 idiomas, incluido el espanol.
- Sin censura ni rechazos por contenido (abliterated), orientado a usos creativos sin filtros.
- Soporte de tool calling: la model card remite a la pestana "community" para resultados de terceros; no hay datos verificables en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas de forma especifica.

## Casos de uso
- Escritura creativa y ficcion: el modelo esta ajustado especificamente para narrativa, dialogos y generacion de prosa extensa, con un tono sin filtros adecuado para borradores literarios y experimentacion de estilo.
- Roleplay y simulacion de personajes: la variante "uncensored" permite mantener personajes y escenarios sin interrupciones por politicas de contenido, util en prototipos de videojuegos narrativos.
- Generacion de codigo en local: con cuantizacion de 4 bits cabe en GPUs de consumo, lo que permite asistentes de programacion offline en entornos con requisitos de privacidad.
- Redaccion tecnica y de marketing con control de longitud: la reduccion de tokens de razonamiento declarada abarata la generacion en tareas de formato y estructura.
- Traduccion y generacion multilingue entre los 16 idiomas soportados, para prototipos de localizacion.
- Investigacion sobre alineamiento y seguridad: sirve como caso de estudio de modelos abliterated para evaluar la eficacia de los mecanismos de rechazo y su eliminacion.
- Experimentacion con decodificacion especulativa: las variantes MTP permiten medir el impacto de la prediccion multi-token en throughput sobre hardware de consumo.

## Benchmarks y rendimiento
La model card cita cifras de ARC-C y ARC-E sin metodologia publicada ni resultados de terceros verificables. Se reproducen como afirmaciones del autor, no como datos auditados:

| Benchmark | Valor declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirmado por el autor; 144 puntos por encima de Qwen 3.8 27B segun la model card |
| ARC-C (4 bits) | 719 | Afirmado por el autor |
| ARC-E (8 bits) | ~880 | Afirmado por el autor |
| Resto de benchmarks (MMLU, HumanEval, GSM8K, etc.) | no disponible | No se aportan resultados concretos |

No se han publicado resultados de benchmarks verificables en la informacion disponible. Las cifras de ARC-C superiores a 700 no son comparables con las escalas habituales de ARC-Challenge (0-100), por lo que deben tratarse con cautela.

## Requisitos de hardware
- VRAM estimada: en cuantizacion Q4, aproximadamente 16-18 GB; en Q8, en torno a 28-30 GB (estimacion por tamano de parametros, no confirmada por el autor).
- GPU recomendadas: RTX 4090 (24 GB) para Q4; A100 40 GB o H100 para Q8 y para mayor contexto.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizacion de 4 bits; en GPUs de 12-16 GB requeriria cuantizaciones mas agresivas o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; las variantes MTP pueden requerir builds especificos.
- Latencia y throughput: no disponibles. El autor afirma mejoras de velocidad por la reduccion de tokens de razonamiento y por MTP, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO Heretic) | ~27B | no disponible | apache-2.0 | GGUF | Fine-tune sin censura, orientado a creatividad y codigo |
| Qwen 3.8 27B (base) | ~27B | no disponible | apache-2.0 (segun el autor) | safetensors, GGUF | Modelo original con alineamiento estandar |
| Qwen3.6-35B-A3B | 35B totales (MoE) | no disponible | no disponible | no disponible | Citado por el autor como superado en benchmarks |
| Qwen 3.6 27B / Qwen 3.5 27B | ~27B | no disponible | no disponible | no disponible | Generaciones anteriores de la familia |

No se dispone de datos verificables de rendimiento para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias
- Modelo "abliterated" y "uncensored": eliminado el alineamiento de seguridad, puede generar contenido ofensivo, ilegal o danino sin rechazo; no apto para produccion orientada al publico general sin filtros externos.
- Riesgo elevado de alucinacion: los fine-tunes creativos priorizan fluidez y estilo sobre factualidad.
- Las afirmaciones de benchmarks (ARC-C 735, superacion de siete benchmarks) no son reproducibles ni auditables con la informacion disponible.
- Longitud de contexto no documentada; no se debe asumir la del modelo base sin verificacion.
- Licencia apache-2.0 declarada, pero la cadena de modelos base y datasets puede imponer condiciones adicionales no verificadas; revisar antes de uso comercial.
- Repositorio de 492,8 GB con multiples cuantizaciones: requiere descarga selectiva de archivos.
- Autor y procedencia del fine-tune no verificados; el modelo base es de DavidAU, no de Alibaba.
- Idiomas: aunque se listan 16, la calidad fuera de ingles y chino no esta documentada.

## Enlaces
- Hugging Face: https://huggingface.co/AMSI7755/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor original: https://huggingface.co/DavidAU
- Coleccion Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Variante 27B Heretic v2: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
