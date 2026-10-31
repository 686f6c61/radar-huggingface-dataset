# mradermacher/Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO-GGUF

## Resumen

Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO-GGUF es la cuantización estática en formato GGUF, realizada por mradermacher, del modelo tinyrolls/Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO. El modelo base es un ajuste del Llama 3.1 8B Instruct de Meta, entrenado mediante SFT (supervised fine-tuning) y posteriormente DPO (Direct Preference Optimization) sobre el dataset tinyrolls/RoleVerse, con el objetivo de especializarlo en role-playing (juego de rol) y diálogo conversacional.

El problema que resuelve es la debilidad de los modelos instruct genéricos en conversaciones de rol sostenidas, donde se requiere mantener coherencia de personaje, estilo narrativo y respuestas creativas a lo largo de múltiples turnos. Su relevancia radica en que, al estar cuantizado en GGUF en múltiples niveles (desde Q2_K hasta f16), puede ejecutarse localmente en hardware de consumo, incluso sin GPU dedicada, gracias a llama.cpp, Ollama o LM Studio. Mantiene el soporte multilingüe del modelo base (inglés, chino, japonés, francés y español) y la licencia Llama 3.1 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.1), no disponible mayor detalle |
| Parametros totales | 8.030.261.312 (8,03 B) |
| Parametros activos | no disponible (no se indica que sea MoE; se asume densa) |
| Longitud de contexto | no disponible (el Llama 3.1 base soporta 128K, pero no consta en la ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh, ja, fr, es |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un Llama 3.1 8B Instruct, un transformer decoder denso de 8,03 mil millones de parámetros. Sobre él, tinyrolls aplicó un proceso en dos fases: primero un SFT (supervised fine-tuning) sobre el dataset RoleVerse para adaptar el modelo al estilo de juego de rol y diálogo, y después un entrenamiento DPO (Direct Preference Optimization) para alinear las respuestas con preferencias humanas, típicamente orientado a mejorar la calidad, coherencia y adecuación de las salidas conversacionales.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset RoleVerse ni los hiperparámetros del SFT y el DPO. Esta ficha corresponde a la cuantización estática de mradermacher, que convierte los pesos a GGUF en múltiples niveles de precisión; también existe una versión con cuantizaciones weighted/imatrix (i1-GGUF) del mismo autor, que suele ofrecer mejor calidad por tamaño.

## Capacidades

- Role-playing y diálogo: especialización principal del modelo, entrenado con el dataset RoleVerse para interpretar personajes y mantener conversaciones de rol.
- Generación de texto conversacional multi-turno.
- Capacidades multilingües en cinco idiomas: inglés, chino, japonés, francés y español.
- Instrucción general heredada de Llama 3.1 8B Instruct (razonamiento, redacción, preguntas y respuestas), aunque potencialmente degradada respecto al original por el fine-tuning especializado.
- No se indica soporte de tool calling / function calling.
- No se indican capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).
- No se indica soporte específico de agentes ni multi-step reasoning.

## Casos de uso

- Compañeros de rol interactivos: el modelo puede interpretar personajes ficticios en conversaciones largas, siendo adecuado por su fine-tuning específico en role-playing sobre el dataset RoleVerse.
- Bots de chat conversacionales con personalidad: gracias al DPO, las respuestas tienden a ser más coherentes y alineadas con preferencias de estilo, útil para asistentes con tono definido.
- Escritura creativa colaborativa: puede actuar como coautor de narrativas, continuando historias y encarnando personajes en ficción interactiva.
- Práctica de idiomas: soporta español, francés, chino, japonés e inglés, lo que permite simular conversaciones de rol para practicar lenguas extranjeras.
- Ejecución local en hardware modesto: las cuantizaciones Q4_K_M (5,0 GB) e IQ4_XS (4,6 GB) permiten usarlo en portátiles y PCs sin GPU dedicada mediante llama.cpp u Ollama.
- Prototipado de experiencias de ficción interactiva: los desarrolladores pueden integrarlo en juegos o aplicaciones narrativas con inferencia local, evitando costes de API y latencia de red.
- Generación de diálogo para videojuegos: puede emplearse para producir diálogos dinámicos de NPC en los cinco idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según la cuantización (tamaños de archivo publicados):
  - Q2_K: 3,3 GB
  - Q3_K_S/M/L: 3,8–4,4 GB
  - IQ4_XS: 4,6 GB
  - Q4_K_S/M: 4,8–5,0 GB
  - Q5_K_S/M: 5,7–5,8 GB
  - Q6_K: 6,7 GB
  - Q8_0: 8,6 GB
  - f16: 16,2 GB
  - Añadir aproximadamente 1–2 GB adicionales para el contexto de KV cache.
- GPU recomendadas: cualquier GPU de consumo con 6 GB de VRAM o más (RTX 3060, RTX 4060 Ti, RTX 4090) para las cuantizaciones Q4–Q6; no se requieren GPUs de centro de datos (A100/H100) para inferencia.
- Cabe en consumer GPUs: sí, incluso en GPUs de 6 GB con Q4_K_M; también funciona solo con CPU y RAM (se recomiendan 8 GB o más) gracias a GGUF.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp (habitual en role-playing), text-generation-webui y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con vLLM o TGI.
- Latencia y throughput estimados: no disponible; al ser un modelo denso de 8B cuantizado a 4–5 bits, se espera inferencia fluida en GPUs de consumo y velocidades moderadas en CPU moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO (esta ficha, GGUF) | 8,03 B | Role-playing y dialogo (SFT + DPO sobre RoleVerse) | Llama 3.1 Community | GGUF, 12 cuantizaciones |
| Llama 3.1 8B Instruct (base de Meta) | 8,03 B | Instruccion general | Llama 3.1 Community | safetensors y GGUF amplio |
| Nous-Hermes-2-Mistral-7B-DPO | 7 B | Instruccion general y chat (DPO) | Apache 2.0 | safetensors y GGUF |

Respecto al Llama 3.1 8B Instruct original, esta variante ofrece mejor rendimiento en role-playing y diálogo, a costa de un posible empeoramiento en tareas generales. Frente a alternativas como Nous-Hermes-2, destaca por su especialización explícita en juego de rol y su soporte de cinco idiomas, aunque su licencia Llama 3.1 es más restrictiva que Apache 2.0. Benchmarks comparativos no disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar de Llama 3.1 y entrenarse sobre RoleVerse, puede heredar sesgos del dataset de role-playing, cuyo contenido y composición no se detallan públicamente.
- Riesgo de alucinación: inherente a los LLM; no se han publicado evaluaciones de fidelidad para esta variante.
- El fine-tuning especializado en role-playing puede degradar capacidades generales (razonamiento, código, matemáticas) respecto al Llama 3.1 8B Instruct original.
- Idiomas limitados a cinco (en, zh, ja, fr, es); el rendimiento en español no está evaluado públicamente.
- Licencia Llama 3.1 Community License: permite uso comercial, pero impone condiciones (atribución, política de uso aceptable y límites para entidades con más de 700 millones de usuarios activos mensuales). Revisar el texto completo antes de uso en producción.
- Las cuantizaciones bajas (Q2_K, Q3_K_M) presentan pérdida de calidad notable según el propio autor del repo; para mejor calidad se recomiendan Q6_K o Q8_0, o la versión i1-GGUF (imatrix).
- Longitud de contexto exacta de esta variante: no disponible; verificar antes de planificar conversaciones muy largas.
- No hay soporte documentado de tool calling, visión ni agentes, lo que limita su uso en pipelines agénticos.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO-GGUF
- Modelo base (SFT-DPO): https://huggingface.co/tinyrolls/Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO
- Dataset de entrenamiento: https://huggingface.co/datasets/tinyrolls/RoleVerse
- Cuantizaciones weighted/imatrix (i1-GGUF): https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
