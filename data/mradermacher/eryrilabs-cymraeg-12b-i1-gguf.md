# mradermacher/EryriLabs-cymraeg-12B-i1-GGUF

## Resumen

EryriLabs-cymraeg-12B-i1-GGUF es la versión cuantizada con GGUF del modelo EryriLabs-cymraeg-12B, un modelo de lenguaje de aproximadamente 11.900 millones de parámetros especializado en galés (cymraeg) e inglés. Lo desarrolla EryriLabs, un laboratorio centrado en tecnologías del lenguaje para el galés, y la cuantización corre a cargo de mradermacher, especialista en distribuir pesos GGUF con cuantizaciones ponderadas por imatrix. El modelo base es un fine-tuning mediante LoRA sobre una arquitectura que la model card etiqueta como "gemma4", orientada a conversación y generación de texto.

El problema que resuelve es la escasez de modelos abiertos con competencia real en galés, una lengua de bajos recursos con pocos corpus de calidad. Para ello se entrena sobre datasets específicos de Techiaith (Bangor University), como léxicos, memorias de traducción inglés-galés y transcripciones, combinados con datos de instrucciones en galés (BangorAI/alpaca-cy-1) y datasets de razonamiento y NLI (openai/gsm8k, nyu-mll/multi_nli).

Esta ficha cubre la variante i1-GGUF, que ofrece cuantizaciones desde IQ1_S (3,1 GB) hasta Q6_K (9,9 GB), lo que permite desplegar un modelo de casi 12B en hardware de consumo. La licencia es CC-BY-NC-4.0, por lo que el uso comercial está restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetada como "gemma4" en la model card; detalles no disponibles) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (ponderadas con imatrix) |
| Idiomas soportados | Galés (cy) e inglés (en) |
| Licencia | CC-BY-NC-4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de ~11,9B parámetros que la model card etiqueta con la tag "gemma4", lo que sugiere una inicialización a partir de la familia Gemma de Google, aunque no se detalla la arquitectura interna exacta (número de capas, cabezas de atención, tipo de atención). El ajuste se realizó mediante LoRA sobre el modelo base EryriLabs/EryriLabs-cymraeg-12B, especializándolo en galés e inglés conversacional.

Los datos de entrenamiento documentados incluyen corpus de Techiaith de la Universidad de Bangor: lecsicon-cymraeg-bangor (léxico), cofnodycynulliad_en-cy y cardiff-university-tm-en-cy (memorias de traducción inglés-galés), banc-trawsgrifiadau-bangor (transcripciones), además de BangorAI/alpaca-cy-1 para instrucciones en galés, nyu-mll/multi_nli para inferencia de lenguaje natural y openai/gsm8k para razonamiento matemático. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La model card indica que el modelo es de visión ("This is a vision model"), aunque los ficheros mmproj, si existen, se alojan en el repositorio estático.

La cuantización i1 utiliza un fichero imatrix (0,1 GB) para ponderar la importancia de los tensores durante la cuantización, lo que mejora la calidad frente a cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de texto conversacional en galés e inglés, con especial énfasis en el galés.
- Razonamiento matemático básico, apoyado por el entrenamiento con openai/gsm8k.
- Inferencia de lenguaje natural (NLI), por el uso de nyu-mll/multi_nli.
- Traducción inglés-galés, dado el uso de memorias de traducción de Techiaith y Cardiff University.
- Capacidad de visión según la model card, aunque los ficheros mmproj no están en este repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Atención al cliente en galés: el modelo puede gestionar conversaciones multi-turno en galés para administraciones públicas y empresas galesas, un nicho donde pocos modelos abiertos ofrecen calidad. La cuantización Q4_K_M (7,5 GB) permite desplegarlo en servidores modestos.
- Traducción inglés-galés asistida: gracias al entrenamiento con memorias de traducción de Techiaith y Cardiff University, puede emplearse como borrador de traducción en flujos editoriales, con revisión humana posterior.
- Generación de contenido educativo en galés: redacción de materiales didácticos, resúmenes y ejercicios para escuelas de Gales, aprovechando el corpus de instrucciones alpaca-cy-1.
- Procesamiento de transcripciones: el uso de banc-trawsgrifiadau-bangor sugiere capacidad para trabajar con texto derivado de transcripciones, útil en actas de reuniones o subtitulado.
- Investigación en lenguas de bajos recursos: como modelo abierto cuantizado, sirve de base para experimentos de evaluación y fine-tuning en galés sin requerir clústeres de GPU.
- Despliegue local en hardware de consumo: con cuantizaciones de 3,1 a 7,5 GB, puede ejecutarse en portátiles con GPU de 8-12 GB para prototipos y demos offline.
- Clasificación y análisis semántico en galés: la exposición a multi_nli permite tareas de entailment y clasificación de pares de frases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,1 GB (IQ1_S) hasta ~9,9 GB (Q6_K); para calidad recomendada, Q4_K_M ocupa 7,5 GB y Q5_K_M 8,6 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para las cuantizaciones altas; A100 o H100 para el modelo en precisión completa (safetensors, ~24 GB en fp16).
- Cabe en GPU de consumo: sí, desde cuantizaciones IQ2 (3,7-4,5 GB) en GPUs de 6-8 GB hasta Q6_K en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (según tags), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EryriLabs-cymraeg-12B-i1-GGUF | ~11,9B | No disponible | cy, en | CC-BY-NC-4.0 | GGUF |
| EryriLabs-cymraeg-12B (base) | ~11,9B | No disponible | cy, en | CC-BY-NC-4.0 | safetensors |
| EryriLabs-cymraeg-12B-GGUF (static) | ~11,9B | No disponible | cy, en | CC-BY-NC-4.0 | GGUF |
| Gemma 2 9B | ~9B | 8K | Multilingüe | Gemma license | safetensors, GGUF |

La comparación con modelos de propósito general como Gemma 2 9B es pertinente por el posible origen arquitectónico, pero no hay datos de rendimiento en galés para establecer una comparación cuantitativa. No se dispone de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: prohíbe el uso comercial; cualquier despliegue en producción con fines lucrativos requiere autorización del titular.
- Riesgo de alucinación inherente a modelos de ~12B, especialmente en dominios especializados y en gallego técnico.
- Sesgos potenciales derivados de los corpus de Techiaith y BangorAI, con posible sobrerrepresentación de registros formales y administrativos.
- Cobertura lingüística limitada a galés e inglés; no se garantiza calidad en otras lenguas.
- Longitud de contexto no documentada; conviene validar empíricamente antes de usos con contextos largos.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; la model card advierte que IQ1_S es "for the desperate".
- El modelo base se etiqueta como "gemma4" sin confirmación oficial de la arquitectura; la compatibilidad con herramientas específicas de Gemma no está garantizada.
- La capacidad de visión no está disponible en este repositorio GGUF (los mmproj estarían en el repositorio estático).
- No hay información sobre tool calling ni soporte de agentes, por lo que no debe asumirse en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/EryriLabs-cymraeg-12B-i1-GGUF
- Modelo base: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-12B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/EryriLabs-cymraeg-12B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#EryriLabs-cymraeg-12B-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Dataset Techiaith lecsicon: https://huggingface.co/datasets/techiaith/lecsicon-cymraeg-bangor
- Dataset BangorAI alpaca-cy-1: https://huggingface.co/datasets/BangorAI/alpaca-cy-1
- Dataset openai/gsm8k: https://huggingface.co/datasets/openai/gsm8k
- Dataset nyu-mll/multi_nli: https://huggingface.co/datasets/nyu-mll/multi_nli
