# NexVeridian/Equinox-31B-8bit

## Resumen

Equinox-31B-8bit es una conversión al formato MLX del modelo Equinox-31B, desarrollado originalmente por LatitudeGames para generación de narrativa en ficción interactiva y juegos de texto. La conversión ha sido realizada por NexVeridian y publicada bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones. El modelo base está construido sobre la arquitectura Gemma 4 de Google, con 31 mil millones de parámetros según su denominación, aunque el registro de safetensors indica una cifra inferior que podría deberse a un error en la metadata.

Esta versión cuantizada a 8 bits reduce significativamente los requisitos de memoria respecto al modelo original en precisión completa, manteniendo un equilibrio entre calidad narrativa y eficiencia. Está orientado exclusivamente a tareas de generación de texto en inglés, con especial énfasis en mantener coherencia, tono y tensión dramática en historias interactivas. Su relevancia actual radica en que permite ejecutar un modelo de gran tamaño en hardware de consumo mediante MLX, especialmente en equipos Apple Silicon, sin necesidad de GPUs de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 4 |
| Parametros totales | 8.634.585.404 (segun safetensors; el nombre indica 31B, posible discrepancia) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Equinox-31B emplea una arquitectura transformer densa basada en la familia Gemma 4 de Google, aunque no se han publicado detalles especificos sobre el numero de capas, dimensiones ocultas o atencion. Al ser un modelo denso, no utiliza mezcla de expertos (MoE). La informacion sobre el entrenamiento es limitada: se sabe que fue desarrollado por LatitudeGames especificamente para narrativa interactiva, pero no se han revelado datos sobre el volumen de tokens, composicion del dataset o tecnicas de alineacion como RLHF o DPO. La conversion a MLX se realizo con la libreria mlx-lm version 0.32.0, que aplica cuantizacion de 8 bits a los pesos originales.

## Capacidades

- Generacion de texto narrativo coherente y con tension dramatica para ficcion interactiva.
- Soporte de conversaciones multi-turno en contextos de roleplay y aventuras de texto.
- Mantenimiento del tono y la personalidad de personajes a lo largo de interacciones largas.
- Capacidad para manejar tramas complejas y giros argumentales sin perder el hilo.
- Generacion de descripciones de escenarios, dialogos y acciones en estilo literario.
- Limitado al idioma ingles; no se ha documentado soporte multilingue.
- No se ha confirmado soporte de tool calling, function calling ni razonamiento multi-paso estructurado.

## Casos de uso

- Juegos de texto y aventuras conversacionales: el modelo puede actuar como narrador o director de juego, generando descripciones de entornos, reacciones de personajes no jugadores y consecuencias de las acciones del jugador, manteniendo coherencia narrativa a lo largo de sesiones prolongadas.
- Roleplay en linea: integrable en plataformas de chat para interpretacion de personajes, donde el modelo sostiene la personalidad y el estilo de habla de un personaje concreto durante conversaciones extensas.
- Prototipado de guiones interactivos: escritores y estudios pueden usarlo para generar ramas argumentales alternativas y dialogos de prueba en fases tempranas de desarrollo de videojuegos narrativos.
- Asistentes de escritura creativa: ayuda a autores a explorar variaciones de escenas, superar bloqueos creativos o generar borradores de dialogos con un tono consistente.
- Simulacion de personajes para pruebas de usabilidad: en el desarrollo de juegos, permite simular respuestas de personajes para testear la logica de conversaciones antes de implementar el sistema final.
- Educacion y entretenimiento: creacion de experiencias de aprendizaje gamificadas donde el modelo narra historias historicas o cientificas adaptadas a las decisiones del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos comparativos sobre MMLU, HumanEval, GSM8K u otras pruebas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de 31B en cuantizacion de 8 bits requiere aproximadamente 31 GB de memoria para los pesos, mas overhead de activaciones y cache. Se estima un minimo de 32-40 GB de VRAM o RAM unificada.
- GPU recomendadas: NVIDIA A100 40GB, A6000 48GB, o multiples RTX 4090 (24GB) en configuracion multi-GPU. En Apple Silicon, se recomienda un chip M1 Max, M2 Ultra o superior con al menos 32 GB de RAM unificada.
- En consumer GPU: no cabe en una sola RTX 4090 (24GB) ni en una RTX 3080 (10-12GB). Requiere al menos dos GPUs de 24GB o una GPU profesional de 32GB+.
- Opciones de despliegue: al ser formato MLX, se ejecuta nativamente en Mac con la libreria mlx-lm. Para GPUs NVIDIA, se puede convertir a otros formatos (GGUF, GPTQ) y usar vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones especificas. En una A100 40GB, se espera una velocidad de generacion de 20-40 tokens por segundo en 8 bits, dependiendo de la longitud de contexto y el batch.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria (narrativa interactiva de ~31B). Alternativas como MythoMax-L2-13B o Llama-3.1-8B-Instruct tienen propositos similares pero tamanos muy inferiores, y no existen datos publicos de rendimiento relativo. Se indica "no disponible" para esta seccion.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles, por lo que su uso en otros idiomas producira resultados degradados o incoherentes.
- Al ser un modelo especializado en narrativa, puede mostrar sesgos hacia estilos de escritura dramaticos o generos de fantasia/ciencia ficcion, limitando su versatilidad en tareas generales.
- Riesgo de alucinacion en hechos, nombres o detalles de la trama cuando se le pide mantener consistencia con informacion externa.
- La discrepancia entre el nombre del modelo (31B) y el numero de parametros registrado en safetensors (8.6B) sugiere posibles errores en la metadata; se recomienda verificar la integridad del modelo antes de usarlo en produccion.
- No se ha documentado la longitud de contexto soportada, lo que puede provocar fallos de atencion en conversaciones muy largas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no especificadas en esta conversion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NexVeridian/Equinox-31B-8bit
- Modelo base: https://huggingface.co/LatitudeGames/Equinox-31B
- Ficha del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/equinox-31b-latitudegames
- Entrada en LLM Explorer: https://llm-explorer.com/model/LatitudeGames%2FEquinox-31B,679i44Pg4987zqUuWocBk1
- Articulo sobre Equinox-31B: https://startupfortune.com/latitude-equinox-31b-takes-on-generic-ai-in-gaming/
