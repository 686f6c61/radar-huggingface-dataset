# mradermacher/Kartik-Kundli-AI-3B-v2.0-GGUF

## Resumen

Kartik-Kundli-AI-3B-v2.0-GGUF es la version cuantizada en formato GGUF del modelo UX4567/Kartik-Kundli-AI-3B-v2.0, un ajuste fino (fine-tune) de 3.085.938.688 parametros orientado a astrologia vedica (kundli) y conversacion bilingue hindi-ingles. El modelo base del ajuste es de la familia Qwen3, segun las etiquetas del repositorio, y ha sido especializado mediante fine-tuning para responder consultas relacionadas con cartas astrales, calculos de kundli y terminologia vedica. La cuantizacion la firma mradermacher, un publicador habitual de conversiones GGUF de modelos open source.

El interes practico de esta ficha reside en que permite ejecutar un modelo especializado de 3B en hardware de consumo mediante llama.cpp u Ollama, con tamanos que van desde 1,4 GB en Q2_K hasta 6,3 GB en f16. Es un caso tipico de nicho vertical: un modelo pequeno, afinado sobre un dominio concreto (astrologia vedica en hindi), que no compite en benchmarks generalistas sino en utilidad dentro de su vertical.

La relevancia es limitada fuera de ese nicho. No hay informacion publica sobre el dataset de entrenamiento, el contexto maximo ni resultados de evaluacion, y el numero de descargas (191) y likes (1) indica una adopcion muy baja. Se trata, por tanto, de un modelo para experimentacion y despliegue local en aplicaciones de astrologia, no de una alternativa generalista a modelos de 3B de proposito amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3 (segun etiquetas del repositorio; detalles no disponibles) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Hindi (hi) e ingles (en) segun la model card; la ficha de Hugging Face solo lista en |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo original se distribuye en safetensors via transformers |

## Arquitectura y entrenamiento

El modelo original es un fine-tune de un modelo base de la familia Qwen3 con 3,09 mil millones de parametros, segun los tags del repositorio (`qwen3`, `fine-tuned`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas especificas del ajuste. La model card del repositorio GGUF no incluye ninguna seccion tecnica sobre el entrenamiento; solo documenta el proceso de cuantizacion.

Las cuantizaciones son estaticas (no hay variantes con imatrix ni ponderadas por importancia en el momento de la publicacion, segun indica el propio autor). El autor advierte que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar. No se documenta ninguna modificacion arquitectonica respecto al modelo base.

## Capacidades

- Generacion de texto conversacional en hindi e ingles, orientada a consultas de astrologia vedica.
- Respuesta a preguntas sobre kundli, cartas astrales, planetas, casas y terminologia vedica.
- Conversacion multi-turno (etiqueta `conversational` en el repositorio).
- Capacidades generales heredadas del modelo base Qwen3 de 3B, sin evaluacion publicada en este ajuste.
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo thinking, vision o audio: no disponible (no documentado).
- Capacidades multilingues: limitadas a hindi e ingles segun la model card.

## Casos de uso

- Asistente de astrologia vedica en local: desplegar la cuantizacion Q4_K_M (2,0 GB) con llama.cpp u Ollama para responder consultas sobre kundli sin depender de servicios en la nube, con coste cero por token y datos del usuario en local.
- Chatbot de nicho para webs de astrologia en hindi: integrar el modelo via API compatible con OpenAI (el repositorio incluye la etiqueta `endpoints_compatible`) para gestionar conversaciones multi-turno con usuarios que consultan su carta astral.
- Prototipado rapido de productos verticales: usar el modelo como base para validar una idea de producto de astrologia antes de invertir en un modelo mayor o en un ajuste propio, gracias a su tamano reducido y licencia MIT.
- Generacion de contenido editorial astrologico: redactar descripciones de posiciones planetarias, interpretaciones de casas o textos explicativos en hindi e ingles para publicaciones del sector.
- Educacion y divulgacion: construir un tutor conversacional que explique conceptos de astrologia vedica a principiantes, con la ventaja de que el modelo corre en una GPU de consumo.
- Investigacion sobre fine-tuning de dominio: utilizar el par modelo base y ajuste como caso de estudio para analizar como se comporta un Qwen3 de 3B especializado en un dominio cerrado y bilingue.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse en local y con licencia MIT, es apto para escenarios donde no se pueden enviar datos personales (fecha, hora y lugar de nacimiento) a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto): Q2_K ~1,4 GB; Q4_K_M ~2,0 GB; Q6_K ~2,6 GB; Q8_0 ~3,4 GB; f16 ~6,3 GB. Añadir entre 0,5 y 2 GB adicionales para la cache KV segun la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs dedicadas modernas con 4 GB o mas; tambien en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo original (safetensors) se puede servir con vLLM o TGI, aunque no hay configuracion publicada.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Kartik-Kundli-AI-3B-v2.0 | 3,09 B | No disponible | MIT | Astrologia vedica, hi/en | GGUF y safetensors |
| Qwen3-4B (modelo base de referencia de la familia) | ~4 B | No disponible en esta ficha | Apache 2.0 (segun familia Qwen3) | Proposito general | Amplia |
| Llama 3.2 3B | 3,2 B | No disponible en esta ficha | Llama Community License | Proposito general | Amplia |

La comparacion con modelos generalistas es poco informativa: Kartik-Kundli-AI-3B-v2.0 no publica evaluaciones y su valor esta en el dominio especifico. Frente a Qwen3-4B o Llama 3.2 3B, la diferencia relevante es la licencia MIT (mas permisiva que la de Llama) y la especializacion en hindi y astrologia vedica, a costa de un rendimiento general desconocido y probablemente inferior.

## Limitaciones y advertencias

- Ausencia total de evaluacion publica: no hay benchmarks, ni datos de entrenamiento, ni contexto maximo documentado, lo que impide estimar su calidad real.
- Riesgo alto de alucinacion en un dominio donde las respuestas se presentan como calculos astrologicos verificables; el modelo puede generar posiciones planetarias o interpretaciones incorrectas con apariencia de rigor.
- Sesgos desconocidos: al ser un fine-tune sin documentacion, no se puede evaluar el sesgo del dataset ni su representatividad cultural.
- Cobertura idiomatica limitada a hindi e ingles; la ficha de Hugging Face solo lista ingles, lo que genera ambiguedad sobre el soporte real de hindi.
- Adopcion muy baja (191 descargas, 1 like): no hay comunidad que haya validado el modelo ni reportado fallos.
- Licencia MIT: permite uso comercial sin restricciones, pero el usuario asume toda la responsabilidad legal y etica sobre las respuestas generadas en un ambito sensible como la astrologia.
- Las cuantizaciones Q2_K y Q3_K degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- No hay garantia de que las capacidades generales del modelo base Qwen3 se conserven tras el ajuste; el fine-tuning puede haber provocado olvido catastrofico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kartik-Kundli-AI-3B-v2.0-GGUF
- Modelo base: https://huggingface.co/UX4567/Kartik-Kundli-AI-3B-v2.0
- Pagina de descargas del autor: https://hf.tst.eu/model#Kartik-Kundli-AI-3B-v2.0-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
