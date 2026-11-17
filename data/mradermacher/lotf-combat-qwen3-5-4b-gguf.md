# mradermacher/lotf-combat-qwen3.5-4b-GGUF

## Resumen

`mradermacher/lotf-combat-qwen3.5-4b-GGUF` es una coleccion de cuantizaciones GGUF del modelo `deepglugs/lotf-combat-qwen3.5-4b`, un ajuste fino (LoRA fusionado) sobre una base Qwen3.5 de 4B de parametros, especializado en IA para videojuegos, concretamente en combate por turnos. El modelo original lo desarrolla el usuario `deepglugs` y las cuantizaciones las produce `mradermacher`, un conocido generador de quants estaticos dentro del ecosistema llama.cpp.

El modelo resuelve un nicho muy concreto: generar decisiones o narrativa de combate por turnos en un contexto de juego (probablemente inspirado en el universo "Legends of the Forgotten" o similar, segun el prefijo `lotf`). Al estar construido sobre Qwen3.5-4B, hereda la arquitectura transformer densa de la familia Qwen3.5 y su ventana de contexto, aunque la model card no detalla estos extremos. Su relevancia radica en que permite ejecutar localmente, en hardware de consumo, un modelo afinado para una tarea ludica especifica, algo habitual en pipelines de generacion de contenido de juego.

El repositorio incluye 13 variantes de cuantizacion (desde Q2_K hasta f16) y dos ficheros `mmproj` (Q8_0 y f16), lo que indica que el modelo base conserva un componente multimodal (proyeccion de vision) que el cuantizador ha empaquetado aparte. El tamano total del repo es de 39,9 GB, coherente con la suma de todas las variantes. La licencia declarada es Apache-2.0, heredada de Qwen3.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-4B), ajuste LoRA fusionado; componente multimodal via mmproj |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base `deepglugs/lotf-combat-qwen3.5-4b` es un ajuste fino de Qwen3.5-4B mediante LoRA, posteriormente fusionado en los pesos. La model card del repositorio cuantizado no aporta detalles sobre la composicion del dataset de ajuste, el numero de tokens de entrenamiento, ni si se empleo RLHF o DPO; la unica informacion disponible es la etiqueta `lora-merged` y los tags `game-ai` y `turn-based-combat`, que delimitan el dominio de especializacion. La presencia de ficheros `mmproj` sugiere que la base Qwen3.5-4B incluye capacidades de vision que el ajuste no elimina.

Las cuantizaciones son estaticas (no ponderadas ni imatrix), generadas por `mradermacher` con su pipeline habitual (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`). No se han publicado variantes ponderadas/imatrix y el autor indica que probablemente no las produzca salvo peticion explicita en la seccion de discusiones.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a interacciones de combate por turnos.
- Razonamiento de dominio especifico para mecanicas de juego (seleccion de acciones, resolucion de turnos, narrativa de combate).
- Capacidad multimodal heredada de la base Qwen3.5-4B (ficheros `mmproj` incluidos), aunque no se documenta su alcance exacto en este ajuste.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de IA de combate en videojuegos: el modelo puede generar decisiones de accion por turnos (atacar, defender, usar habilidad) en un bucle de juego, aprovechando su ajuste especifico sobre `turn-based-combat` para producir respuestas coherentes con las reglas del sistema.
- Generacion de narrativa de combate: dado un estado de combate, el modelo produce descripciones textuales de los turnos, adecuado para juegos de rol o roguelikes con texto generado.
- Herramienta de diseno de encuentros: los disenadores pueden consultar al modelo para obtener variaciones de comportamiento de enemigos o sugerencias de mecanicas, gracias a su conocimiento del dominio de combate por turnos.
- Asistente para modders: integrado en un editor de mods, el modelo puede ayudar a redactar scripts de comportamiento de IA o descripciones de habilidades coherentes con el estilo del juego.
- Evaluacion de sistemas de combate: investigadores de IA ludica pueden usar el modelo como baseline afinado para comparar con modelos genericos en tareas de decision de combate.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (2,8 GB) permiten ejecutar el modelo en GPUs de 6-8 GB de VRAM, lo que facilita su integracion en demos jugables o entornos de desarrollo sin infraestructura cloud.
- Generacion de datos sinteticos de combate: el modelo puede producir trazas de turnos etiquetadas para entrenar o evaluar otros sistemas de IA de juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,0 GB
  - Q3_K_M: ~2,4 GB
  - IQ4_XS: ~2,6 GB
  - Q4_K_M: ~2,8 GB
  - Q5_K_M: ~3,2 GB
  - Q6_K: ~3,6 GB
  - Q8_0: ~4,6 GB
  - f16: ~8,5 GB
- Componente multimodal adicional: 0,5 GB (mmproj-Q8_0) o 0,8 GB (mmproj-f16) si se usa vision.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090 o superiores para cuantizaciones altas y contextos largos. Para f16 se recomienda una GPU de 12 GB o mas (RTX 4070 Ti, RTX 4080, A100).
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 6 GB o mas usando Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lotf-combat-qwen3.5-4b (este) | 4,2B | no disponible | Apache-2.0 | GGUF, safetensors | Ajuste LoRA para combate por turnos |
| Qwen3.5-4B (base) | ~4B | no disponible | Apache-2.0 | safetensors, GGUF | Modelo generico multilingue; sin especializacion ludica |
| Modelos de IA de juego comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre alternativas directas en la misma categoria |

La comparativa con alternativas especificas de IA para combate por turnos no esta disponible en la informacion proporcionada. El unico punto de referencia claro es la base Qwen3.5-4B, de la que este modelo hereda arquitectura y licencia pero anade especializacion de dominio.

## Limitaciones y advertencias

- El modelo esta afinado exclusivamente para combate por turnos en ingles; su rendimiento en tareas generales sera inferior al de la base Qwen3.5-4B sin ajustar.
- No se documenta el dataset de ajuste, por lo que se desconoce el riesgo de sobreajuste a un juego o conjunto de reglas concreto.
- Riesgo de alucinacion en mecanicas de juego no vistas durante el entrenamiento; validar las salidas contra el motor de reglas antes de usarlas en produccion.
- Capacidades multilingues limitadas al ingles segun la model card; no se garantiza un comportamiento correcto en castellano.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener terminos adicionales que conviene revisar en el enlace de licencia incluido en la model card.
- Las cuantizaciones son estaticas; no hay variantes ponderadas/imatrix, lo que puede penalizar la calidad en cuantizaciones bajas (Q2_K, Q3_K_S) frente a alternativas ponderadas.
- El repo ocupa 39,9 GB; descargar solo la variante necesaria para evitar consumo innecesario de disco.
- No se han publicado benchmarks, por lo que no es posible comparar su calidad objetivamente con otras alternativas.

## Enlaces

- Repositorio Hugging Face (cuantizaciones): https://huggingface.co/mradermacher/lotf-combat-qwen3.5-4b-GGUF
- Modelo base: https://huggingface.co/deepglugs/lotf-combat-qwen3.5-4b
- Modelo Qwen3.5-4B original: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#lotf-combat-qwen3.5-4b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guia sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos al cuantizador: https://huggingface.co/mradermacher/model_requests
