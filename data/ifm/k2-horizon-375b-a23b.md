# IFM/K2-Horizon-375B-A23B

## Resumen

K2-Horizon-375B-A23B es el modelo insignia de la familia K2-Horizon desarrollado por IFM, una iniciativa centrada en la publicación abierta de pesos, datos y código de entrenamiento. Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) que almacena 375 mil millones de parámetros en total, pero activa únicamente 23 mil millones por token, lo que permite combinar la capacidad de un modelo mucho mayor con un coste de inferencia contenido. Su ventana de contexto nativa es de 524 288 tokens (512K), una de las más amplias entre los modelos abiertos actuales.

El modelo está orientado a tareas agénticas: según su creador, iguala o supera a modelos MoE abiertos de hasta 2,6 veces su tamaño en benchmarks de tool use, terminal y flujos de trabajo de largo horizonte, y resulta competitivo frente a modelos cerrados de frontera. Los pesos finales ya están publicados bajo licencia Apache 2.0, y se anuncia la liberación de checkpoints intermedios, datos de entrenamiento y código. El repositorio de HuggingFace reporta 379 167 159 168 parámetros reales en los safetensors, una cifra ligeramente superior al nombre comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) dispersa |
| Parametros totales | 379 167 159 168 (safetensors) |
| Parametros activos | 23B por token |
| Longitud de contexto | 524 288 tokens (512K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

K2-Horizon-375B-A23B emplea una arquitectura de mezcla de expertos dispersa (sparse MoE): el modelo contiene 375B parametros en total, pero solo se activan 23B por token, lo que reduce el coste computacional de cada paso de inferencia manteniendo una alta capacidad de representacion. El contexto de 512K tokens esta presente desde las etapas intermedias del entrenamiento, lo que sugiere un diseno especifico para atender ventanas muy largas sin degradacion.

Los datos de entrenamiento provienen de los datasets IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data, ambos publicados en HuggingFace. No se especifica el numero total de tokens ni la composicion exacta del corpus, tampoco si se aplicaron tecnicas de alineacion como RLHF o DPO. El autor anuncia que liberara los datos, la receta de entrenamiento y el codigo, lo que permitira un analisis detallado en el futuro.

## Capacidades

- Generacion de texto y conversacion de proposito general en ingles.
- Razonamiento agente: soporta tool calling, uso de terminal y ejecucion de flujos de trabajo de largo horizonte (multi-step).
- Ventana de contexto de 512K tokens, adecuada para tareas que requieren procesar documentos extensos o historiales de conversacion muy largos.
- Capacidades multilingues: no disponible, el modelo esta entrenado principalmente en ingles.
- No se mencionan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Atencion al cliente automatizada: con 512K tokens de contexto, puede mantener conversaciones multi-turno muy largas y recordar detalles de interacciones previas sin perder informacion.
- Agentes de automatizacion de terminal: su rendimiento en benchmarks de terminal permite construir agentes que ejecutan comandos, gestionan procesos y resuelven tareas de administracion de sistemas.
- Analisis de documentos extensos: procesar contratos, informes o codebases completos dentro de una sola ventana de contexto, extrayendo informacion y respondiendo preguntas sobre el contenido.
- Generacion y revision de codigo a gran escala: con tool calling puede integrarse en pipelines de CI/CD para revisar pull requests, generar tests o refactorizar modulos.
- Razonamiento multi-paso en investigacion: descomponer problemas complejos en pasos encadenados, consultando fuentes externas y validando resultados, gracias a su capacidad agente.
- Desarrollo de asistentes de productividad: combinado con herramientas de calendario, correo o gestion de proyectos, puede planificar y ejecutar tareas de largo alcance.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una tabla comparativa con modelos como Nemotron 3 Ultra, Inkling (xhigh), MiniMax-M3, GLM 5.2 (max), GPT 5.6 Luna (max), GPT 5.6 Terra (high) y Claude Sonnet5 (max), pero los valores concretos no estan visibles en el material proporcionado. El autor afirma que el modelo iguala o supera a modelos MoE abiertos hasta 2,6 veces su tamano en tareas agente, y que es competitivo con modelos cerrados de frontera, pero estos datos no pueden verificarse con la informacion actual.

## Requisitos de hardware

Estimaciones basadas en el tamano del modelo (379B parametros en total):

- VRAM estimada: en BF16, los pesos ocupan aproximadamente 758 GB, por lo que se necesitan multiples GPU. Con cuantizacion INT8 (no confirmada) se reduciria a unos 380 GB, y con INT4 a unos 190 GB, pero no se han publicado pesos cuantizados.
- GPU recomendadas: al menos 8x H100 80GB o 8x A100 80GB para inferencia en precision completa. Para cuantizacion ligera, podria intentarse con 4x A100 80GB, aunque no esta verificado.
- No cabe en GPU de consumo (RTX 4090, etc.) en ninguna configuracion realista.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM o TGI. Para cuantizacion, llama.cpp o Ollama si se publican pesos GGUF (no disponibles actualmente).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La tabla de la model card menciona como alternativas abiertas a Nemotron 3 Ultra (550B), Inkling (xhigh) (975B) y MiniMax-M3 (428B), y como cerrados a GLM 5.2 (max) (753B), GPT 5.6 Luna (max), GPT 5.6 Terra (high) y Claude Sonnet5 (max). Sin datos numericos de rendimiento, la comparacion se limita a parametros y contexto:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| K2-Horizon-375B-A23B | 375B | 23B | 512K | Apache 2.0 |
| Nemotron 3 Ultra | 550B | no disponible | no disponible | no disponible |
| MiniMax-M3 | 428B | no disponible | no disponible | no disponible |
| Inkling (xhigh) | 975B | no disponible | no disponible | no disponible |

K2-Horizon destaca por su licencia permisiva y su contexto de 512K, aunque su rendimiento relativo no puede cuantificarse con la informacion disponible.

## Limitaciones y advertencias

- Entrenado principalmente en ingles; el rendimiento en otros idiomas no esta garantizado.
- Tamano de 379B parametros: requiere infraestructura de multiples GPU, lo que limita su despliegue en entornos modestos.
- No se han publicado pesos cuantizados ni formatos alternativos (GGUF, etc.), lo que dificulta su uso en hardware consumer.
- Riesgo de alucinacion inherente a los modelos generativos; con ventanas de 512K, el modelo puede inventar detalles en contextos muy largos si no se valida la salida.
- Los datos de entrenamiento y el codigo aun no se han liberado, por lo que la reproducibilidad y la auditoria de sesgos son limitadas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de los datasets asociados.

## Enlaces

- HuggingFace: https://huggingface.co/IFM/K2-Horizon-375B-A23B
- Blog de IFM (anuncio): https://ifm.ai/blog/k2
