# Cleven12/goshawk-r1-nano

## Resumen

Goshawk R1 Nano es un modelo de lenguaje de razonamiento desarrollado por Cleven12, publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como un modelo optimizado para despliegue en el extremo (edge), orientado a tareas de seguridad y forense digital, con especial atencion al contexto de Tanzania. Combina tres ideas tecnicas tomadas del linaje DeepSeek: atencion multi-cabeza latente (MLA), mezcla de expertos dispersa (DeepSeekMoE) y optimizacion de politica relativa a grupos (GRPO) para el entrenamiento de razonamiento.

El modelo es de escala muy reducida: 512 dimensiones de ocultacion, 10 capas y 8 cabezas de atencion, con 6 expertos enrutados (top-2 activos) mas un experto compartido. El repositorio ocupa 0,3 GB, lo que sugiere un modelo del orden de decenas o pocos cientos de millones de parametros, aunque el autor no declara el recuento exacto. Su interes radica en ser una implementacion compacta y abierta de la combinacion MLA + MoE + GRPO, pensada para inferencia en dispositivos con recursos limitados.

La relevancia actual es doble: por un lado, demuestra que las innovaciones arquitectonicas de modelos frontera como DeepSeek pueden replicarse a escala nano; por otro, apunta a un nicho concreto, la ciberseguridad y el analisis forense en entornos edge, con soporte declarado de ingles y suajili.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Multi-Head Latent Attention (MLA) y DeepSeekMoE |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 6 expertos enrutados top-2 + 1 compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), suajili (sw) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (pytorch); safetensors no confirmado |

## Arquitectura y entrenamiento

La arquitectura combina atencion multi-cabeza latente (MLA) con un rango latente KV de 64, lo que reduce el coste de memoria de la cache KV frente a la atencion multi-cabeza convencional. La capa de alimentacion hacia delante es una mezcla de expertos al estilo DeepSeekMoE con 6 expertos enrutados, de los cuales se activan los 2 principales, mas 1 experto compartido que procesa todas las entradas. La configuracion incluye una profundidad de prediccion multi-token de 1. El modelo tiene 10 capas, dimension oculta de 512 y 8 cabezas de atencion.

El entrenamiento se basa en Group Relative Policy Optimization (GRPO), el algoritmo de aprendizaje por refuerzo empleado en la familia DeepSeek R1 para desarrollar capacidades de razonamiento. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO adicionales, ni detalles sobre el corpus en suajili.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con entrenamiento orientado a cadenas de razonamiento mediante GRPO.
- Capacidades de razonamiento especializadas en seguridad en el extremo y forense digital, segun los tags declarados por el autor.
- Soporte bilingue declarado: ingles y suajili.
- Prediccion multi-token (profundidad 1), lo que puede acelerar la decodificacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis forense digital en dispositivos edge: el modelo puede ejecutarse en equipos con recursos limitados para clasificar artefactos, resumir logs y asistir en la triage de incidentes, gracias a su escala reducida y su entrenamiento orientado a forense.
- Asistencia en seguridad para pymes sin infraestructura GPU: al ser un modelo nano, puede desplegarse en portatiles o mini-PC para tareas de analisis de alertas y correlacion de eventos.
- Atencion al usuario en suajili: el soporte declarado de este idioma permite construir asistentes conversacionales para el mercado de Africa Oriental, un nicho poco cubierto por modelos abiertos.
- Educacion y divulgacion en ciberseguridad: el modelo puede generar explicaciones y guias en ingles y suajili sobre conceptos de seguridad, aprovechando su orientacion tematica.
- Prototipado e investigacion de arquitecturas MoE+MLA: su implementacion compacta y abierta permite estudiar el comportamiento de MLA y DeepSeekMoE a pequena escala en laboratorios con hardware modesto.
- Filtrado y clasificacion de texto en pipelines de datos: por su tamano, puede integrarse como clasificador o generador auxiliar en flujos de preprocesamiento sin coste elevado de inferencia.
- Despliegue en entornos con conectividad intermitente: la inferencia local elimina la dependencia de la nube, relevante en escenarios de campo o zonas con infraestructura limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio de 0,3 GB sugiere que el modelo en precision completa cabe en menos de 2 GB, y en cuantizaciones de 8 o 4 bits en torno a 0,5-1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente por margen amplio; tambien es viable en CPU.
- Cabe en GPU consumer: si, con margen amplio, incluidas GPUs de gama de entrada y aceleradores integrados.
- Opciones de despliegue: llama.cpp, Ollama y vLLM son opciones plausibles dado el formato PyTorch, aunque no se confirma la disponibilidad de pesos GGUF; transformers es la via directa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goshawk R1 Nano | no disponible (repo 0,3 GB) | no disponible | MLA + DeepSeekMoE | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 0,49B | 32K | Transformer denso | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 0,36B | 8K | Transformer denso | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32K | Transformer denso con destilacion R1 | MIT | Hugging Face |

La comparativa es orientativa: los modelos alternativos son densos y ampliamente evaluados, mientras que Goshawk R1 Nano emplea MoE y MLA, lo que dificulta la comparacion directa sin benchmarks publicados. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas sin pruebas propias.
- Modelo de escala muy reducida (512 de ocultacion, 10 capas): la capacidad de razonamiento y el conocimiento factual seran limitados en comparacion con modelos de mayor tamano.
- Cobertura linguistica restringida a ingles y suajili; el rendimiento en castellano no esta garantizado.
- Riesgo elevado de alucinacion en tareas de seguridad y forense, donde la precision es critica; no debe usarse como unica fuente en decisiones de incidentes.
- Sesgos desconocidos: no se documenta la composicion del dataset ni procesos de alineacion, por lo que los sesgos no estan caracterizados.
- Longitud de contexto no declarada: no se puede planificar su uso en tareas que requieran ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y de evaluacion independiente desaconseja su uso en produccion sin validacion previa.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Cleven12/goshawk-r1-nano
- Paper de DeepSeek-V2 (MLA y DeepSeekMoE): https://arxiv.org/abs/2405.04434
- Paper de DeepSeek-R1 (GRPO y razonamiento): https://arxiv.org/abs/2501.12948
- Repositorio DeepSeek-V2: https://github.com/deepseek-ai/DeepSeek-V2
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
