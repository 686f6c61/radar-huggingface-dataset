# epshteinmatthew/hebrew-simplify

## Resumen

`hebrew-simplify` es una colección de modelos de pesos abiertos publicada por el usuario epshteinmatthew para dar soporte a la herramienta homónima de simplificación de texto y noticias en hebreo, orientada a estudiantes con niveles de competencia entre A1 y C1. No se trata de un único modelo, sino de un conjunto de artefactos con roles diferenciados: un generador de simplificación (destilado de DictaLM-3.0-1.7B-Instruct y cuantizado a GGUF), un verificador de factualidad basado en un clasificador NLI bidireccional y un baseline seq2seq construido sobre mT5-base.

El componente principal es una destilación del modelo instructivo de Dicta (1.700 millones de parámetros) sobre pares de simplificación de noticias y artículos de Wikipedia en hebreo en varios niveles (A1-B2), empaquetada en formato GGUF con cuantización Q4_K_M. El verificador NLI se entrena sobre 7.080 pares de factualidad para detectar corrupciones sutiles de significado, un problema crítico cuando se reescribe texto informativo.

La relevancia del proyecto es doble: por un lado, cubre un nicho poco atendido (simplificación de hebreo para aprendices con control de fidelidad semántica); por otro, demuestra un patrón de despliegue totalmente offline y ligero, con modelos cuantizados que pueden ejecutarse en hardware de consumo. La licencia Apache 2.0 facilita su reutilización comercial, aunque el modelo está especializado exclusivamente en hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (generador principal, derivado de DictaLM-3.0-1.7B-Instruct); encoder bidireccional tipo BERT para el verificador NLI (derivado de hebnli-neodictabert); encoder-decoder (baseline mT5-base) |
| Parametros totales | 1.700 millones (generador principal); no disponible para el verificador NLI y el baseline mT5-base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) en el generador principal; el verificador NLI y el baseline seq2seq se distribuyen sin cuantizar |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generador `hebsimp-news-q4_k_m.gguf`); checkpoints sin especificar para el verificador y el baseline |

## Arquitectura y entrenamiento

El generador principal parte de `dicta-il/DictaLM-3.0-1.7B-Instruct`, un transformer decoder-only de 1.700 millones de parámetros ajustado para instrucciones en hebreo. Sobre él se aplica un proceso de destilación con pares de simplificación multinivel (A1-B2) extraídos de noticias y Wikipedia en hebreo, y el resultado se cuantiza a Q4_K_M en formato GGUF. El pipeline completo combina este generador con `dicta-il/dictalm2.0-instruct-GGUF` (Q4_K_M) para una segunda pasada de "desempaquetado" de frases y definiciones de una palabra para aprendices.

El verificador de factualidad es un ajuste fino de `ronke21/hebnli-neodictabert`, un clasificador NLI bidireccional entrenado sobre 7.080 pares de factualidad específicos de simplificación en hebreo, pensado para detectar corrupciones semánticas sutiles que un generador podría introducir al reescribir. El baseline seq2seq es un ajuste fino de `google/mt5-base` con el flag `--generator seq2seq`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en hebreo orientada a simplificación multinivel (A1, A2, B1, B2).
- Simplificación de noticias y artículos de Wikipedia preservando el contenido informativo.
- Verificación de factualidad mediante clasificación NLI bidireccional para detectar alteraciones de significado.
- Desempaquetado de frases y generación de definiciones de una palabra para aprendices (mediante el modelo auxiliar dictalm2.0-instruct).
- Ejecución totalmente offline gracias a los pesos GGUF cuantizados.
- Soporte de dos modos de generación: decoder-only (DictaLM destilado) y seq2seq (baseline mT5).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Aplicación de lectura graduada para aprendices de hebreo: el generador reescribe noticias a un nivel A1-B2 concreto, y el verificador NLI comprueba que no se ha alterado el significado antes de mostrar el texto al estudiante.
- Plataformas de aprendizaje de idiomas: integración del pipeline para generar versiones simplificadas de un mismo artículo en varios niveles, permitiendo progresión A1 a C1 dentro de una misma lección.
- Medios de comunicación con accesibilidad: adaptación de noticias para audiencias con dificultades lectoras o hablantes no nativos, con control de fidelidad semántica previo a publicación.
- Investigación en simplificación de texto: el conjunto de modelos (generador, verificador y baseline seq2seq) sirve como referencia reproducible para comparar enfoques decoder-only frente a seq2seq en hebreo.
- Despliegue en entornos con conectividad limitada o requisitos de privacidad: al ejecutarse offline con llama-cpp-python y pesos Q4_K_M, puede correr en equipos locales sin enviar texto a servicios externos.
- Evaluación de fidelidad en pipelines de reescritura: el verificador NLI puede reutilizarse de forma independiente para auditar cualquier sistema de parafraseo o resumen en hebreo.
- Docencia de hebreo como segunda lengua: generación de definiciones de una palabra y frases desempaquetadas para glosarios de nivel, usando el modelo auxiliar dictalm2.0-instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el generador principal: aproximadamente 1,1 GB en disco para el GGUF Q4_K_M; la VRAM en ejecución depende de la longitud de contexto y del backend, pero es del orden de 1-2 GB.
- Verificador NLI: aproximadamente 1,4 GB en disco; requiere memoria adicional si se ejecuta en paralelo con el generador.
- Baseline seq2seq: aproximadamente 2,2 GB en disco.
- Cabe en GPU de consumo: sí, cualquier GPU con 4-8 GB de VRAM puede alojar el pipeline completo; también es viable en CPU.
- GPU recomendadas: no se especifican; por tamaño, RTX 3060/4060 o superiores son suficientes, y A100/H100 no son necesarias.
- Opciones de despliegue: llama-cpp-python (usado por el repositorio), llama.cpp y cualquier runtime compatible con GGUF; el script `scripts/serve.py` del repositorio levanta el servicio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| epshteinmatthew/hebrew-simplify (generador) | 1.700 M | no disponible | Simplificación de hebreo + verificación NLI | Apache 2.0 | Hugging Face (GGUF) |
| dicta-il/DictaLM-3.0-1.7B-Instruct | 1.700 M | no disponible | Instrucciones generales en hebreo | no disponible en la informacion | Hugging Face |
| dicta-il/dictalm2.0-instruct-GGUF | no disponible | no disponible | Instrucciones en hebreo, cuantizado | no disponible en la informacion | Hugging Face |
| google/mt5-base | no disponible | no disponible | Seq2seq multilingüe | no disponible en la informacion | Hugging Face |

La comparativa directa con alternativas de simplificación en hebreo no está disponible en la información proporcionada; los modelos listados son las bases sobre las que se construye este proyecto, no competidores equivalentes.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo: no debe esperarse un rendimiento útil en otros idiomas.
- El generador principal está destilado para simplificación de noticias y Wikipedia; su comportamiento fuera de ese dominio no está documentado.
- El verificador NLI se entrenó sobre 7.080 pares, un volumen modesto que puede limitar la detección de corrupciones semánticas poco frecuentes.
- Riesgo de alucinación inherente a los modelos generativos: el pipeline mitiga pero no elimina la posibilidad de introducir información no presente en el texto original.
- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado con corpus en hebreo puede heredar sesgos de dichas fuentes.
- La longitud de contexto no está especificada, lo que dificulta planificar el procesamiento de documentos largos.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación externa.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los modelos base (DictaLM, hebnli-neodictabert, mT5) antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/epshteinmatthew/hebrew-simplify
- Repositorio GitHub del proyecto: https://github.com/epshteinmatthew/hebrew-simplify
- Modelo base del generador: https://huggingface.co/dicta-il/DictaLM-3.0-1.7B-Instruct
- Modelo auxiliar de segunda pasada: https://huggingface.co/dicta-il/dictalm2.0-instruct-GGUF
- Modelo base del verificador NLI: https://huggingface.co/ronke21/hebnli-neodictabert
- Modelo base del baseline seq2seq: https://huggingface.co/google/mt5-base
