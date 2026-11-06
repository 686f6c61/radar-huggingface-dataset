# edededdy/LittleKedi-medium-wide-sparse-instruct

## Resumen

LittleKedi-medium-wide-sparse-instruct es la version afinada para instrucciones (chat) del modelo base LittleKedi-medium-wide-sparse-base, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) entrenado desde cero siguiendo el diseno de DeepSeek-V3. Lo desarrolla el usuario edededdy como parte de la familia LittleKedi, un conjunto de modelos pequenos y experimentales que exploran distintas configuraciones de esparsidad. Cuenta con 305,36 millones de parametros totales, de los cuales solo 31,68 millones estan activos por token (un 10 %), lo que lo convierte en el miembro de mayor capacidad total y menor proporcion activa de la gama "medium".

El modelo resuelve el problema de experimentar con arquitecturas MoE modernas (DeepSeekMoE con enrutamiento por grupos, gating sigmoide, equilibrio de carga sin perdida auxiliar y atencion Multi-head Latent Attention) en un formato lo bastante pequeno como para entrenarse y desplegarse en hardware modesto. Su interes es fundamentalmente educativo y de investigacion: permite estudiar el comportamiento de un MoE esparso real sin los costes de un modelo de gran escala.

Se trata de un artefacto experimental con limitaciones explicitas: el propio autor advierte que las respuestas son fluidas y coherentes con el tema, pero a menudo incorrectas o vagas, y que inventa hechos con seguridad. No debe emplearse en aplicaciones criticas. Esta publicado bajo licencia Apache 2.0, solo en ingles y con un contexto de 16K tokens de vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE estilo DeepSeek-V3 con Multi-head Latent Attention (MLA) y DeepSeekMoE |
| Parametros totales | 305.361.824 (305,36 M) |
| Parametros activos | 31,68 M por token (10 %); 23,29 M excluyendo la tabla de embeddings |
| Longitud de contexto | no disponible (vocabulario de 16K tokens; el contexto no se especifica en la informacion) |
| Tipos de cuantizacion | GGUF disponible; cuantizaciones concretas no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo consta de 8 capas con tamano oculto 512. Las dos primeras capas usan una FFN densa SwiGLU de 1408 unidades; las capas 2 a 7 son MoE. La atencion es Multi-head Latent Attention (MLA) con 8 cabezas, latente de KV de 128 dimensiones, latente de query de 256, dimension RoPE desacoplada de 32 y dimensiones de cabeza 64+32 (q/k) y 64 (v); la cache KV almacena unicamente el latente de 128 dimensiones mas una clave RoPE de 32 dimensiones por token, lo que reduce mucho el coste de memoria en contexto largo.

La capa MoE sigue el esquema DeepSeekMoE: 240 expertos enrutados (SwiGLU, 128 ocultas) con top-8, mas 2 expertos compartidos, gating sigmoide y enrutamiento limitado por grupos (8 grupos, top-4). El equilibrio de carga se consigue con sesgo sin perdida auxiliar (velocidad de actualizacion 0,001) mas una pequena perdida por secuencia (alfa = 0,0001). El modelo se preentreno sobre una mezcla de 20.400 millones de tokens compuesta por FineWeb-Edu, Cosmopedia v2 (SmolLM-Corpus), FineMath 4+, comentarios de Reddit, github-code-clean, SmolTalk y Wikipedia en ingles (2023-11-01). La version instruct se afina sobre el modelo base; no se detalla en la informacion el metodo exacto de alineacion (SFT/DPO/RLHF).

## Capacidades

- Generacion de texto conversacional en formato de chat con turnos de sistema, usuario y asistente delimitados por `<|system|>`, `<|user|>` y `<|assistant|>`, con terminacion mediante `<|end|>`.
- Razonamiento basico y respuesta a preguntas, con calidad limitada por el tamano del modelo.
- Generacion de codigo a partir de la parte de github-code-clean del corpus de entrenamiento.
- Matematicas basicas, influido por FineMath 4+ en el preentrenamiento.
- Capacidad multilingue limitada al ingles.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No dispone de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Investigacion sobre arquitecturas MoE: sirve para estudiar el efecto de la esparsidad (240 expertos, top-8, 10 % activo) en un modelo pequeno y reproducible, comparandolo con sus hermanos `medium` y `medium-sparse` que comparten tokenizer y dataset.
- Experimentos educativos de entrenamiento desde cero: su tamano (305 M totales, 31,7 M activos) permite reproducir el pipeline completo de preentrenamiento y ajuste en recursos academicos.
- Pruebas de mecanismos de atencion eficiente: la MLA con cache KV de 128 dimensiones permite medir el ahorro de memoria en contextos largos frente a atencion multi-cabeza convencional.
- Evaluacion de equilibrio de carga en MoE: el esquema de sesgo sin perdida auxiliar y el enrutamiento por grupos se pueden instrumentar para analizar la distribucion de tokens entre expertos.
- Generacion de texto de relleno en entornos de desarrollo: para probar pipelines de inferencia (vLLM, llama.cpp, Ollama) con pesos GGUF y plantillas de chat antes de pasar a modelos mayores.
- Demostraciones de chat con plantilla Jinja: el `chat_template.jinja` y el `tokenizer_config.json` permiten integrar el modelo en frameworks que consumen plantillas de chat estandar.
- Comparativas controladas de variantes: al compartir tokenizer y dataset con `medium` y `medium-sparse`, permite aislar el efecto del numero de expertos en la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en cuantizacion (dato de LLM Explorer); en precision completa (safetensors, repositorio de 2,2 GB) alrededor de 1,2 GB para pesos en fp16, mas cache KV.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 2 GB de VRAM; tambien funciona en CPU.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, entre otras, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp y Ollama mediante los ficheros GGUF (que ya incorporan la plantilla de chat); vLLM y TGI si se sirven los pesos safetensors; endpoints compatibles segun las etiquetas del repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos por token | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LittleKedi-medium-wide-sparse-instruct | 305,4 M | 31,7 M (10 %) | no disponible (vocab 16K) | Apache 2.0 | MoE wide-sparse, 240 expertos top-8 |
| LittleKedi-medium-instruct (hermano) | 78,2 M | 31,0 M (40 %) | no disponible (vocab 16K) | Apache 2.0 | MoE denso, 24 expertos top-4 |
| LittleKedi-medium-sparse-instruct (hermano) | 163,4 M | 31,3 M (19 %) | no disponible (vocab 16K) | Apache 2.0 | MoE intermedio, 120 expertos top-8 |
| LittleKedi-base-wide-sparse-instruct (hermano mayor) | 1015,9 M | 107,6 M (11 %) | no disponible (vocab 32K) | Apache 2.0 | Misma receta a mayor escala |

Los tres modelos `medium` comparten tokenizer y dataset, por lo que la comparacion entre ellos es directa; el modelo de esta ficha maximiza la capacidad total manteniendo el mismo coste de computo activo que sus hermanos.

## Limitaciones y advertencias

- Calidad baja: el autor indica que las respuestas son fluidas y sobre el tema pero a menudo incorrectas o vagas.
- Alucinacion elevada: el modelo inventa hechos con seguridad, segun la propia model card.
- Solo ingles: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Longitud de contexto no documentada; el vocabulario es de solo 16K tokens, lo que limita la cobertura lexica.
- No hay evidencia de soporte de tool calling ni de comportamiento agentico.
- Modelo experimental sin benchmarks publicados; no apto para produccion ni para decisiones que importen.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo desaconseja cualquier despliegue real.
- No esta afiliado a DeepSeek pese a inspirarse en su arquitectura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edededdy/LittleKedi-medium-wide-sparse-instruct
- Modelo base: https://huggingface.co/edededdy/LittleKedi-medium-wide-sparse-base
- Ficha en LLM Explorer: https://llm-explorer.com/model/edededdy%2FLittleKedi-medium-wide-sparse-instruct,2PVvz9tlS6I3CM5Vq5mJSh
