# divinetribe/Huihui-gemma-4-31B-it-abliterated-4bit-mlx

## Resumen

Huihui-gemma-4-31B-it-abliterated-4bit-mlx es una conversión a 4 bits en formato MLX del modelo Huihui-gemma-4-31B-it-abliterated, a su vez una versión "abliterated" (con la dirección de rechazo ortogonalizada fuera de los pesos) del Gemma 4 31B Instruct de Google. La conversión la firma divinetribe y está pensada exclusivamente para inferencia local en Apple Silicon mediante la librería mlx-lm, sin necesidad de GPU dedicada ni de clave de API.

El modelo resuelve el problema de ejecutar un modelo de 30.697 millones de parámetros en un Mac de gama alta: gracias a la cuantización afín de 4 bits con tamaño de grupo 64, el repositorio ocupa 17,3 GB en disco (repartidos en 4 shards), lo que permite cargarlo en equipos con 32 GB de memoria unificada y, para contextos cortos, en máquinas de 24 GB. La arquitectura es la de Gemma 4, un transformer denso (no MoE) con 30.697.345.280 parámetros totales, todos activos.

Su relevancia actual radica en dos factores: por un lado, la abliteración elimina el comportamiento de rechazo típico de un modelo instruct ajustado, de modo que responde a instrucciones que un modelo estándar declinaría manteniendo coherencia en tareas ordinarias; por otro, el formato MLX nativo lo integra en el ecosistema de inferencia on-device de Apple (mlx-lm, LM Studio) y en proyectos como Claude Code Local, que expone un servidor compatible con la API de Anthropic ejecutado íntegramente en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Gemma 4 (no MoE) |
| Parametros totales | 30.697.345.280 (30,7 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits afín, group size 64 (via mlx_lm.convert); no se ofrecen otros niveles en este repo |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (4 shards, 17,3 GB); no hay GGUF |
| Libreria de inferencia | mlx-lm |
| Hardware objetivo | Apple Silicon (M1, M2, M3, M4, M5) |
| Memoria recomendada | 32 GB de RAM unificada; 24 GB para contextos cortos |
| Modelo base | huihui-ai/Huihui-gemma-4-31B-it-abliterated (a su vez derivado de google/gemma-4-31b-it) |
| Descargas | 961 en el momento de la consulta |

## Arquitectura y entrenamiento

La ficha disponible no detalla la arquitectura interna de Gemma 4 más allá de identificarla como "Gemma 4" y de tratarse de un modelo denso de 30,7 B parámetros. No se especifican en la información proporcionada el número de capas, la dimensión oculta, el mecanismo de atención, la composición del dataset de entrenamiento ni el número de tokens vistos. Tampoco se documentan las etapas de alineación (RLHF, DPO u otras) del modelo original de Google.

La innovación técnica destacable de esta variante es doble. Primero, la abliteración realizada por huihui-ai: se identifica la dirección de rechazo en el espacio de activaciones y se ortogonaliza fuera de los pesos, de forma que el modelo deja de activar respuestas de negativa ante instrucciones sensibles conservando su comportamiento general. Segundo, la conversión a MLX de divinetribe: cuantización afín de 4 bits con tamaño de grupo 64 aplicada mediante mlx_lm.convert, que reduce el peso a 17,3 GB y permite ejecución nativa en el framework de Apple, sin llama.cpp ni GGUF. No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones en inglés, heredadas del ajuste instruct de Gemma 4.
- Razonamiento general y explicación de conceptos, incluyendo tareas divulgativas (el ejemplo de la model card es explicar el entrelazamiento cuántico a un niño de 12 años).
- Respuesta a instrucciones que un modelo instruct estándar rechazaría, gracias a la abliteración de la dirección de rechazo.
- Ejecución totalmente local y on-device, sin conexión a la nube ni clave de API.
- Integración con mlx-lm mediante CLI (`mlx_lm.generate`) y API de Python (`load`, `generate`), incluyendo plantilla de chat (`apply_chat_template`).
- Carga en LM Studio y en cualquier herramienta compatible con modelos MLX.
- Uso como motor de agente local dentro de Claude Code Local, que expone una API compatible con Anthropic sobre MLX.
- No se documenta en la información disponible soporte de tool calling, function calling, visión, audio, modo thinking ni capacidades multilingües más allá del inglés.

## Casos de uso

- Asistente conversacional local en Mac: cargar el modelo con mlx-lm o LM Studio y mantener conversaciones multi-turno sin enviar datos a ningún servidor, aprovechando los 32 GB de memoria unificada de un Mac de gama alta.
- Desarrollo de agentes locales: usar el modelo como backend en Claude Code Local, que traduce peticiones de la API de Anthropic a inferencia MLX nativa, permitiendo flujos de agente con acceso al sistema de archivos sin salir del dispositivo.
- Investigación sobre alineación y abliteración: comparar el comportamiento del modelo abliterated con el Gemma 4 31B Instruct original para estudiar cómo la eliminación de la dirección de rechazo afecta a la coherencia, la utilidad y la seguridad de las respuestas.
- Generación de texto creativo y divulgativo sin restricciones de contenido: redacción de material que un modelo instruct estándar podría declinar, manteniendo calidad lingüística en inglés.
- Procesamiento de documentos sensibles en local: resumen y análisis de textos confidenciales en un portátil Apple Silicon sin exponerlos a APIs externas, con la ventaja de privacidad que implica la inferencia on-device.
- Evaluación comparativa de modelos en el leaderboard Agent-12: ejecutar tareas de agente reales juzgadas por el sistema de archivos en el mismo hardware que otros modelos de la colección, para seleccionar el mejor modelo local para una carga de trabajo concreta.
- Prototipado de aplicaciones MLX en Python: integrar `mlx_lm.load` y `mlx_lm.generate` en scripts o notebooks para experimentar con un modelo de 31 B cuantizado sin necesidad de infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 17,3 GB de pesos en disco; se recomiendan 32 GB de memoria unificada para carga completa y 24 GB para contextos cortos.
- GPU recomendadas: no aplica GPU dedicada; el modelo está diseñado para Apple Silicon (M1, M2, M3, M4, M5) con memoria unificada.
- Cabe en consumer GPU: no está pensado para GPU NVIDIA/AMD; requiere un Mac con al menos 24-32 GB de memoria unificada.
- Opciones de despliegue: mlx-lm (CLI y Python), LM Studio, cualquier runtime que lea modelos MLX y el servidor MLX-native de Claude Code Local compatible con la API de Anthropic.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-gemma-4-31B-it-abliterated-4bit-mlx (este) | 30,7 B densos | No disponible | MLX safetensors 4 bits | Apache 2.0 | Solo Apple Silicon; abliterated |
| huihui-ai/Huihui-gemma-4-31B-it-abliterated | 30,7 B densos | No disponible | Safetensors (precisión original) | Apache 2.0 | Modelo base sin cuantizar; requiere más memoria |
| google/gemma-4-31b-it | 30,7 B densos | No disponible | Safetensors | Términos de Gemma | Modelo original con rechazos intactos |
| Otros modelos de la colección divinetribe (Llama 3.3 70B, Qwen3, Qwen3-VL, Hermes 4, Muse Glimmer) | Variable | No disponible | MLX 4 bits | Variable | Misma filosofía: abliterated y on-device en Apple Silicon |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de la dirección de rechazo puede degradar la coherencia en tareas que dependen de matices de seguridad y aumenta el riesgo de generar contenido dañino, sesgado o inexacto sin advertencia.
- Riesgo de alucinación inherente a un modelo de 31 B; no se documentan evaluaciones de fidelidad factual.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga sin verificarla empíricamente.
- Licencia Apache 2.0 en este repositorio, pero el modelo base deriva de google/gemma-4-31b-it, cuyos términos de uso deben respetarse; el autor remite explícitamente a la licencia del modelo base y a la legislación aplicable.
- Exclusivo de Apple Silicon: no funciona en GPU NVIDIA ni en CPU x86 convencional; no hay GGUF ni soporte para llama.cpp.
- Requiere 24-32 GB de memoria unificada; en Macs de 16 GB no es viable.
- La model card incluye estadísticas promocionales (estrellas de GitHub, descargas totales) que no constituyen una evaluación técnica del modelo.
- No se documentan soporte de tool calling, visión ni modo thinking; su uso como agente depende de la capa orquestadora (Claude Code Local), no de capacidades nativas verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Huihui-gemma-4-31B-it-abliterated-4bit-mlx
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-gemma-4-31B-it-abliterated
- Modelo original de Google: https://huggingface.co/google/gemma-4-31b-it
- Colección Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil de GitHub del autor: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
