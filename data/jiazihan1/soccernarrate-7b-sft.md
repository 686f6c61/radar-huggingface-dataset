# JiaZihan1/SoccerNarrate-7B-SFT

## Resumen

SoccerNarrate-7B-SFT es un checkpoint de ajuste supervisado (SFT) para la generacion de comentario deportivo en streaming de partidos de futbol. Lo desarrolla el grupo MCG-NJU (Universidad de Nanjing) y parte de Qwen2.5-VL-7B-Instruct, un modelo vision-lenguaje de 7.000 millones de parametros. El modelo esta disenado para recibir video en streaming y producir narracion textual anclada a eventos del partido (goles, faltas, cambios, ocasiones), resolviendo el problema de generar comentario coherente y temporalmente alineado sobre flujos de video largos.

El checkpoint corresponde a las etapas 1 y 2 del entrenamiento descrito en el articulo "SoccerNarrate: Event-Grounded Streaming Soccer Commentary with Macro-Window Preference Alignment" (NeurIPS 2026): un calentamiento de formato streaming seguido de SFT en el dominio del futbol sobre el dataset SoccerNarrate-Data. No incluye la etapa 3 de alineacion de preferencias por ventana macro (MWPA), por lo que sirve como linea base SFT y como modelo de referencia para el entrenamiento DPO posterior.

Es relevante porque el checkpoint completo con MWPA mejora de forma sustancial las metricas de recuperacion de eventos (Class Recall de 34,6 a 71,8), lo que convierte a este SFT en un punto de partida reproducible para investigacion en narracion automatica de video deportivo. El modelo es de 7B parametros, contexto no especificado en la informacion disponible, licencia MIT e idioma ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (heredada de Qwen2.5-VL-7B-Instruct) |
| Parametros totales | 7.000 millones (aproximado, segun el nombre del modelo y el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (libreria transformers; pesos "coming soon" segun la model card) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa video e imagen junto con texto y genera texto. Sobre esa base se aplica un entrenamiento en dos etapas: la etapa 1 es un calentamiento de formato streaming y la etapa 2 es SFT especifico del dominio del futbol sobre el dataset SoccerNarrate-Data (JiaZihan1/SoccerNarrate-Data). No se aplica la etapa 3 de Macro-Window Preference Alignment (MWPA), que es una alineacion por preferencias tipo DPO con ventanas macro y que solo esta presente en el checkpoint completo JiaZihan1/SoccerNarrate-7B.

La innovacion central del trabajo es el planteamiento de comentario anclado a eventos sobre video en streaming, con una evaluacion especifica (SoccerNarrate-Eval, 45 partidos completos) que mide recuperacion y precision de clases de eventos ademas de solapamiento global. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion detallada del dataset ni si hubo otras tecnicas de optimizacion (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de comentario deportivo en streaming a partir de video de partidos de futbol.
- Comprension de video multimodal (hereda las capacidades vision-lenguaje de Qwen2.5-VL-7B-Instruct).
- Narracion anclada a eventos: el modelo esta entrenado para identificar y verbalizar eventos del partido (clases evaluadas en SoccerNarrate-Eval).
- Generacion de texto en ingles.
- Capacidad base de tool calling / function calling: no confirmada de forma especifica para este checkpoint en la informacion disponible (el modelo base Qwen2.5-VL lo soporta, pero no se documenta aqui).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision, audio: vision y video si (por el modelo base); thinking y audio no documentados.

## Casos de uso

- Narracion automatica de retransmisiones deportivas: el modelo recibe el flujo de video de un partido y genera comentario en tiempo real anclado a eventos, adecuado por su entrenamiento especifico en streaming de futbol.
- Generacion de resumenes de partidos para medios digitales: a partir de un video completo, producir una cronica textual de los eventos principales, aprovechando la evaluacion sobre 45 partidos completos.
- Accesibilidad para personas con discapacidad visual: convertir el video en descripcion hablada de las jugadas, dado que el modelo esta optimizado para verbalizar eventos.
- Etiquetado y anotacion semiautomatica de video deportivo: usar las narraciones generadas como preanotaciones de eventos para construir datasets de video con texto.
- Linea base de investigacion y ablation: el checkpoint SFT sirve como referencia para medir la ganancia de la etapa MWPA en experimentos de alineacion por preferencias.
- Inicializacion de entrenamiento DPO: segun la model card, puede usarse como checkpoint de partida y modelo de referencia para la etapa 3 de MWPA.
- Analisis de retransmisiones para clubes y analistas: extraer descripciones estructuradas de jugadas para revision posterior, apoyandose en la comprension de video del modelo base.

## Benchmarks y rendimiento

Resultados en SoccerNarrate-Eval (45 partidos completos), segun la model card:

| Modelo | Class Recall | Overall Recall | Class Precision | Overall Precision | Class F1 | Overall F1 |
|---|---|---|---|---|---|---|
| SoccerNarrate-7B-SFT (etapas 1+2) | 34,6 | 30,3 | 31,5 | 42,3 | 30,0 | 35,3 |
| SoccerNarrate-7B (etapas 1+2+3, MWPA) | 71,8 | 61,3 | 38,5 | 48,8 | 46,9 | 54,4 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 7B en precision completa (fp16/bf16) se requieren aproximadamente 14-16 GB solo de pesos, mas el coste del procesamiento de video, que incrementa el consumo de memoria.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cabria esperar A100, H100 o RTX 4090 para inferencia en fp16, pero no se confirma en la model card.
- Compatibilidad con GPU de consumo: probable en GPUs con 24 GB o mas (p. ej. RTX 4090) en fp16, y potencialmente en GPUs de 16 GB con cuantizacion, aunque no se documenta.
- Opciones de despliegue: libreria transformers (segun la model card); no se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Overall F1 en SoccerNarrate-Eval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoccerNarrate-7B-SFT | ~7B | no disponible | 35,3 | MIT | Pesos "coming soon" segun la model card |
| SoccerNarrate-7B (MWPA) | ~7B | no disponible | 54,4 | MIT (heredada) | Checkpoint completo publicado |
| Qwen2.5-VL-7B-Instruct (base) | ~7B | no disponible | no evaluado en SoccerNarrate-Eval | no disponible en la informacion | Publico en Hugging Face |

No se dispone de otros modelos comparables de narracion deportiva en streaming en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint es SFT-only: sin la etapa MWPA, su recuperacion de eventos es notablemente inferior (Class Recall 34,6 frente a 71,8 del modelo completo), por lo que no es la version recomendada para produccion.
- Los pesos aparecen como "coming soon" en la model card; la disponibilidad efectiva puede no estar confirmada.
- Idioma limitado al ingles; no se documenta soporte multilingue.
- Dominio restringido al futbol y a narracion deportiva; el rendimiento fuera de ese dominio no esta evaluado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a la generacion de narracion sobre eventos no presentes.
- Sesgos: no documentados en la model card.
- Longitud de contexto y comportamiento con videos muy largos: no disponibles.
- Licencia MIT declarada, lo que permitiria uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-VL-7B-Instruct, no detalladas aqui.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/JiaZihan1/SoccerNarrate-7B-SFT
- Checkpoint completo con MWPA: https://huggingface.co/JiaZihan1/SoccerNarrate-7B
- Dataset: https://huggingface.co/datasets/JiaZihan1/SoccerNarrate-Data
- Codigo: https://github.com/MCG-NJU/SoccerNarrate
- Coleccion: https://huggingface.co/collections/MCG-NJU/soccernarrate-6b03e5ec4b39ad06088131d2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
