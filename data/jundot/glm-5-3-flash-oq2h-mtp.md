# Jundot/GLM-5.3-Flash-oQ2h-mtp

## Resumen

GLM-5.3-Flash-oQ2h-mtp es una versión cuantizada del modelo multimodal nativo zai-org/GLM-5.3-Flash, el primer modelo de la serie GLM-5 con capacidades de visión integradas. El checkpoint ha sido producido por el desarrollador independiente Jundot mediante oQ, una técnica de cuantización de precisión mixta orientada a MLX (el framework de Apple para Apple Silicon). El modelo base cuenta con 320.000 millones de parámetros totales y 18.000 millones activos, lo que lo sitúa en la categoría de modelos MoE de gran escala pero con un coste de inferencia contenido por token generado.

La particularidad de esta ficha radica en el formato oQh, una variante que aplica una transformada de Hadamard a los pesos de los expertos enrutados antes de cuantizarlos, lo que permite reducir el número de escalas necesarias y reasignar el espacio ahorrado a bits adicionales en las capas más sensibles. El resultado es un checkpoint de aproximadamente 102,63 GiB con un promedio efectivo de 2,744 bits por peso, que mantiene el codificador visual en BF16 y las capas de atención, expertos compartidos, embeddings y cabeza de salida en 8 bits afines.

Es relevante ahora porque permite ejecutar un modelo multimodal de 320.000 millones de parámetros (con 18.000 millones activos) en hardware Apple Silicon con un consumo de almacenamiento de ~110 GB, algo impensable en precisión completa, y porque incluye la cabeza de predicción multi-token (MTP) que habilita decodificación especulativa nativa. La licencia MIT del modelo base se mantiene, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa y lineal, Manifold-Constrained Hyper-Connections (modelo base); cuantización oQh de precisión mixta sobre MLX |
| Parametros totales | 40.722.951.006 (según safetensors del repo); 321.323B lógicos según la model card del checkpoint (320B en el modelo base) |
| Parametros activos | 18B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQh 2-bit (row scale), oQh 3-bit (row scale), affine 8-bit group 64, affine 4-bit group 64, BF16 (vision encoder), FP32; promedio efectivo 2,744 bits/peso (2,675 en el backbone lingüístico) |
| Idiomas soportados | no disponible (la model card menciona prompts en 7 idiomas para evaluación KL: FLORES+ y Aya) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), requiere oMLX 0.8.0 o superior con soporte oQh |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer de mezcla de expertos (MoE) con 320.000 millones de parámetros totales y 18.000 millones activos por token. Combina atención dispersa y atención lineal, e incorpora Manifold-Constrained Hyper-Connections, una innovación arquitectónica del linaje GLM-5. Es el primer modelo de la serie GLM-5 nativamente multimodal, con un codificador visual de 0,564B parámetros y una cabeza de predicción multi-token (MTP) de 7,433B parámetros que permite decodificación especulativa.

El checkpoint aquí descrito no ha sido reentrenado: es una cuantización del modelo original. La técnica oQh aplica una transformada de Hadamard a los pesos de los expertos enrutados antes de cuantizarlos, de modo que los pesos rotados requieren menos escalas por grupo; el espacio ahorrado se reinvierte en un bit adicional para los tensores enrutados más estrechos y sensibles. La distribución resultante asigna 2 bits a 154,619B de pesos lógicos (48,1%), 3 bits a 149,787B (46,6%), 8 bits afines a 8,976B (2,8%), 4 bits afines a 7,248B (2,3%), BF16 a 0,607B (0,19%, el codificador visual) y FP32 a 0,086B (0,03%). No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno (pipeline image-text-to-text).
- Procesamiento de imagen y texto de forma nativa (codificador visual integrado en BF16).
- Predicción multi-token (MTP) para decodificación especulativa y mayor throughput.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: la evaluación KL emplea prompts en 7 idiomas (FLORES+, Aya), lo que sugiere cobertura multilingüe, aunque no se detalla la lista.
- Capacidades de código: la evaluación incluye código Python como dominio de referencia.
- Ejecución en Apple Silicon mediante MLX y oMLX 0.8.0+.

## Casos de uso

- Inferencia local multimodal en Mac: el checkpoint de ~102,6 GiB permite ejecutar un modelo de 320B totales / 18B activos con visión en equipos Apple Silicon de gama alta (Mac Studio con memoria unificada de 128 GB o superior), sin necesidad de GPUs dedicadas.
- Asistentes de documentación técnica con imágenes: gracias al codificador visual y a la ventana de contexto del modelo base, se pueden procesar capturas, diagramas y texto combinados en conversaciones multi-turno.
- Prototipado de agentes con decodificación especulativa: la cabeza MTP incluida permite acelerar la generación en flujos de razonamiento multi-paso, útil para entornos de investigación que necesitan iterar rápido.
- Evaluación de cuantizaciones de baja precisión: el checkpoint sirve como referencia para estudiar el impacto de 2,744 bits/peso en tareas multilingües (FLORES+, Aya) y de código, con métricas KL publicadas frente a oQe.
- Generación de código asistida en local: el dominio de código está evaluado en la model card y el modelo soporta prompts de código Python; adecuado para entornos de desarrollo con requisitos de privacidad que impiden la nube.
- Investigación en eficiencia de inferencia: la combinación de MoE disperso, atención lineal y cuantización mixta con rotación Hadamard ofrece un banco de pruebas para estudiar compromisos calidad/tamaño en hardware de consumo.
- Despliegue de chat conversacional con imágenes en estaciones de trabajo Mac: el formato MLX y la licencia MIT facilitan integraciones comerciales internas sin coste de licencia.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí incluye métricas de divergencia KL frente al modelo original en FP8 para evaluar la calidad de la cuantización:

| Nivel | Tamano | FLORES+ KL (oQe -> oQh) | Aya KL (oQe -> oQh) | Code KL (oQe -> oQh) |
|---|---|---|---|---|
| oQ2 | 98,6 GiB | 0,34 -> 0,24 (-28%) | 0,80 -> 0,69 (-14%) | 0,25 -> 0,19 (-24%) |
| oQ3 | 134,1 GiB | 0,13 -> 0,11 (-15%) | 0,41 -> 0,37 (-10%) | 0,10 -> 0,11 (+5%) |
| oQ4 | 169,4 GiB | 0,069 -> 0,070 (+2%) | 0,25 -> 0,25 (-1%) | 0,068 -> 0,057 (-16%) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~102,63 GiB para el checkpoint completo (110,2 GB en disco); se recomienda un equipo con al menos 128 GB de memoria unificada para dejar margen al runtime y al contexto.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (Mac Studio M3 Ultra con 192 GB o 512 GB, o configuraciones equivalentes); no está pensado para GPUs NVIDIA/AMD, ya que el formato es MLX.
- Cabe en consumer GPU: no en el sentido tradicional; requiere hardware Apple Silicon de gama alta, no cabe en una RTX 4090 (24 GB) ni en una RTX 5090.
- Opciones de despliegue: exclusivamente oMLX 0.8.0 o superior con soporte oQh; versiones anteriores no pueden cargar el checkpoint. No es compatible con llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-oQ2h-mtp (este) | 320B / 18B | no disponible | oQh 2-3 bit mixta, ~2,744 bits/peso | MIT | MLX / oMLX 0.8.0+ |
| GLM-5.3-Flash (base) | 320B / 18B | no disponible | FP8 (original) | MIT | ecosistema GLM |
| Versiones oQe del mismo modelo | 320B / 18B | no disponible | oQe 2/3/4 bit | MIT | MLX estándar (cualquier motor MLX compatible) |
| Otros MoE multimodales de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de oMLX 0.8.0 o superior con soporte oQh; versiones anteriores no cargan el checkpoint y no hay compatibilidad con otros motores de inferencia.
- La cuantización a ~2,744 bits/peso introduce degradación medible: KL de 0,24 en FLORES+, 0,69 en Aya y 0,19 en código frente al modelo FP8, con mayor desviación en dominios multilingües (Aya).
- El formato oQh solo está validado en oMLX; el ecosistema de herramientas MLX genérico no puede ejecutarlo, lo que limita portabilidad.
- Riesgo de alucinación inherente al modelo base; la cuantización agresiva puede amplificarlo en tareas de razonamiento largo.
- Sesgos conocidos del modelo base: no documentados en la información disponible.
- Idiomas soportados no especificados; la evaluación cubre 7 idiomas pero no se lista cuáles.
- Longitud de contexto no disponible; conviene verificar en la documentación del modelo base antes de desplegar en producción.
- Licencia MIT permite uso comercial, pero conviene revisar el archivo LICENSE del repo y las condiciones del modelo base zai-org/GLM-5.3-Flash.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; es un checkpoint recién publicado (18 de noviembre de 2026) sin validación comunitaria.
- El tamaño en disco (110,2 GB) y en memoria (~102,6 GiB) exige hardware Apple Silicon de gama muy alta; no es desplegable en equipos de consumo estándar.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/GLM-5.3-Flash-oQ2h-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio oQ / oMLX: https://github.com/jundot/omlx
- Pull request del formato oQh: https://github.com/jundot/omlx/pull/5317
