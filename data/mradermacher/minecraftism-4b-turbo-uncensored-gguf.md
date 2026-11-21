# mradermacher/Minecraftism-4B-Turbo-Uncensored-GGUF

## Resumen

Minecraftism-4B-Turbo-Uncensored-GGUF es la version cuantizada en formato GGUF del modelo mr-sus/Minecraftism-4B-Turbo-Uncensored, un modelo de lenguaje de 4.022.468.096 parametros (aproximadamente 4B) construido sobre la arquitectura Qwen3 y afinado con Unsloth. El modelo esta especializado en tareas de agente de juego (game-agent) para Minecraft, con etiquetas que indican que ha sido sometido a un proceso de "abliteration" para eliminar los rechazos y filtros de seguridad, de ahi la denominacion "uncensored". La cuantizacion la realiza mradermacher, un conocido publicador de versiones GGUF de modelos open source.

El modelo resuelve el problema de desplegar un agente conversacional especializado en Minecraft en hardware de consumo, ofreciendo una amplia gama de cuantizaciones que van desde 1,8 GB (Q2_K) hasta 8,2 GB (f16). Esto permite ejecutarlo en GPUs consumer e incluso en CPU con llama.cpp. Su relevancia actual radica en la creciente demanda de agentes de juego ligeros y ejecutables localmente, aunque su licencia Polyform Noncommercial 1.0.0 restringe severamente el uso comercial.

La informacion disponible sobre el modelo base es limitada: no se detallan la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks. La model card del cuantizador se limita a listar los archivos GGUF generados y a remitir al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3, segun tags) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun model card) |
| Licencia | polyform-noncommercial-1.0.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Segun los tags del repositorio, el modelo se basa en la arquitectura Qwen3 y fue afinado mediante Unsloth, una libreria optimizada para fine-tuning eficiente en memoria. El modelo ha sido sometido a "abliteration", una tecnica que modifica los pesos para eliminar la direccion de rechazo aprendida durante el alineamiento, produciendo un modelo "uncensored" que no se niega a responder peticiones. El sufijo "Turbo" sugiere un ajuste orientado a velocidad de inferencia, aunque no se especifican los detalles tecnicos de dicho ajuste.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El modelo esta etiquetado como "game-agent" y "minecraft", lo que indica que el fine-tuning se oriento a tareas de interaccion y control dentro del videojuego Minecraft, presumiblemente mediante el proyecto pymc-bot (minero de Python para Minecraft). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a interacciones multi-turno.
- Razonamiento y planificacion de acciones como agente de juego en Minecraft (game-agent).
- Integracion con pymc-bot para control del personaje dentro del juego.
- Modelo "uncensored" y "abliterated": no aplica rechazos de seguridad en sus respuestas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: implicito por su naturaleza de game-agent, aunque no se documenta explicitamente.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Agente autonomo en Minecraft: el modelo puede gestionar la logica de decision de un bot que recolecta recursos, construye estructuras y navega el mundo, integrándose con pymc-bot para traducir las decisiones en acciones de juego.
- Prototipado de agentes de juego en local: gracias a las cuantizaciones de 1,8 a 2,6 GB, un desarrollador puede probar comportamientos de agente en una GPU consumer sin depender de APIs externas.
- Investigacion sobre abliteration y seguridad: util para estudiar como el proceso de abliteration afecta al comportamiento del modelo en tareas de agente y conversacion, comparando con la version base alineada.
- Generacion de dialogos de personajes sin restricciones: en proyectos de narrativa interactiva o mods de Minecraft donde se requieren respuestas sin filtros de contenido.
- Educacion y experimentacion con LLMs pequenos: su tamano de 4B y su amplia gama de cuantizaciones lo hacen adecuado para aprender a desplegar modelos con llama.cpp u Ollama en hardware modesto.
- Benchmarking de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion, lo que permite evaluar el impacto de la compresion en la calidad de las respuestas de un agente de juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con Q4_K_M (2,6 GB de pesos mas overhead de contexto); aproximadamente 4,5-5,5 GB con Q8_0 (4,4 GB de pesos); aproximadamente 8,5-10 GB con f16 (8,2 GB de pesos).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU consumer: si, en practicamente todas las GPUs modernas con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI requeririan conversion a safetensors o soporte GGUF especifico.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Minecraftism-4B-Turbo-Uncensored-GGUF | 4,02B | no disponible | Polyform Noncommercial 1.0.0 | GGUF | Especializado en Minecraft, uncensored |
| Qwen3-4B (base) | 4B | no disponible en esta ficha | Apache 2.0 (segun Qwen3) | safetensors, GGUF | Modelo generalista, alineado |
| Llama 3.2 3B | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Modelo generalista, multilingue |

La comparativa con Qwen3-4B y Llama 3.2 3B es orientativa: el primero comparte arquitectura base, y el segundo es un competidor directo en el segmento de 3-4B parametros. Minecraftism se diferencia por su especializacion en agentes de Minecraft y su naturaleza uncensored, pero carece de la documentacion y el soporte de los modelos generalistas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo abliterated, se han eliminado los filtros de seguridad, lo que puede producir respuestas toxicas, ofensivas o inapropiadas sin advertencia.
- Riesgo de alucinacion: elevado, como en cualquier modelo de 4B; la especializacion en Minecraft no garantiza precision factual sobre el juego.
- Limitaciones de contexto o idioma: solo se documenta ingles; la longitud de contexto no esta especificada, lo que impide planificar conversaciones largas con garantias.
- Restricciones de licencia: Polyform Noncommercial 1.0.0 prohibe explicitamente el uso comercial; cualquier despliegue en produccion con fines lucrativos requiere licencia adicional del autor.
- Caveat para produccion: la falta de benchmarks, de documentacion sobre el entrenamiento y de soporte del autor original hace arriesgado su uso en entornos productivos; ademas, el proceso de abliteration puede degradar capacidades de razonamiento y coherencia.
- El repositorio GGUF no incluye informacion sobre el modelo base mas alla de los tags; se recomienda consultar la model card de mr-sus/Minecraftism-4B-Turbo-Uncensored para obtener detalles adicionales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Minecraftism-4B-Turbo-Uncensored-GGUF
- Modelo base: https://huggingface.co/mr-sus/Minecraftism-4B-Turbo-Uncensored
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Minecraftism-4B-Turbo-Uncensored-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Minecraftism-4B-Turbo-Uncensored-GGUF
- Licencia Polyform Noncommercial 1.0.0: https://polyformproject.org/licenses/noncommercial/1.0.0/
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
