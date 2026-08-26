# mradermacher/Caelistus-Gladius-Excalibur-RP-2.6B-Thinking-v0.1-GGUF

## Resumen
Caelistus-Gladius-Excalibur-RP-2.6B-Thinking-v0.1 es un modelo de lenguaje de 2.7 mil millones de parametros especializado en roleplay, escritura creativa y razonamiento mediante cadenas de pensamiento (CoT). El modelo original fue desarrollado por Indexnusrefather, y esta version GGUF ha sido cuantizada por mradermacher para facilitar su despliegue local con herramientas como llama.cpp o Ollama.

El modelo se distingue por combinar capacidades de razonamiento explicito (thinking mode) con un entrenamiento orientado a roleplay y narracion de personajes, utilizando el dataset Aesir-Character-CoT-roleplay y una adaptacion con DoRA de rango alto (2048). Es una propuesta experimental para entornos donde se necesita un modelo ligero capaz de mantener coherencia narrativa y profundidad psicologica en interacciones de rol.

Su relevancia actual radica en cubrir un nicho poco atendido: modelos de menos de 3B que priorizan la calidad narrativa y el razonamiento interno, y que pueden ejecutarse en hardware de consumo o incluso en CPU con cuantizacion agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.697.198.592 (2,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles |
| Licencia | lfm1.0 (licencia personalizada, ver archivo LICENSE) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base, aunque al ser un modelo de 2,7B y estar basado en transformers se asume una arquitectura decoder-only con atencion completa. El proceso de entrenamiento se realizo sobre el dataset beyoru/Aesir-Character-CoT-roleplay, que combina roleplay con cadenas de pensamiento, y se empleo la tecnica DoRA con rango 2048, una variante de LoRA que ajusta la magnitud y la direccion de las actualizaciones por separado.

El modelo base fue entrenado con un enfoque en razonamiento explicito (CoT) integrado en interacciones de roleplay, lo que sugiere que durante el entrenamiento se le enseno a generar pensamientos internos antes de responder, similar a modelos como DeepSeek-R1 o QwQ. Sin embargo, no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO.

## Capacidades

- Roleplay y escritura creativa: genera dialogos, narraciones y personajes con coherencia narrativa y profundidad psicologica.
- Razonamiento con cadenas de pensamiento (CoT): puede generar pensamientos internos antes de la respuesta final, mejorando la calidad de sus decisiones en contextos de rol.
- Escritura creativa: redacta historias, descripciones y dialogos con estilo literario.
- Interaccion conversacional multi-turno: mantiene el hilo de conversaciones largas, aunque la longitud de contexto no esta especificada.
- Soporte de roleplay adulto (ERP): el modelo incluye etiquetas que indican que fue entrenado para escenarios de rol adultos, aunque su uso en produccion debe ser evaluado.
- No se mencionan capacidades de vision, audio, tool calling ni agentes.

## Casos de uso

- Chatbots de roleplay en aplicaciones de entretenimiento: el modelo puede sostener personajes ficticios con personalidad definida y reacciones coherentes gracias a su entrenamiento especifico con CoT, lo que permite interacciones mas naturales que un modelo generico.
- Asistentes de escritura creativa para autores: puede generar borradores de dialogos, descripciones de escenarios o sugerir giros argumentales, integrandose en herramientas de escritura asistida por IA.
- Simulacion de personajes en juegos de rol de mesa (RPG): se puede usar como game master o para controlar NPCs, aprovechando su capacidad de mantener coherencia de personaje a lo largo de sesiones largas.
- Generacion de contenido para novelas visuales o videojuegos narrativos: los desarrolladores pueden usar el modelo para crear dialogos ramificados y reacciones de personajes en tiempo real, sin necesidad de GPU de alta gama.
- Chatbots de entretenimiento para plataformas de mensajeria: su tamano reducido permite desplegarlo en servidores modestos o incluso en el navegador, ofreciendo experiencias de rol personalizadas.
- Investigacion en modelos de razonamiento en contextos narrativos: es un banco de pruebas para estudiar como el CoT afecta la calidad de la generacion de historias en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandarizadas. La unica referencia de rendimiento es cualitativa, basada en el proposito del modelo (roleplay y CoT).

## Requisitos de hardware

- VRAM estimada: para cuantizacion Q4_K_M (1,8 GB de peso) se necesitan aproximadamente 2-3 GB de VRAM en total, incluyendo contexto y overhead. Con Q2_K (1,2 GB) se puede operar con menos de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o incluso GPU de gama baja como la GTX 1060 6GB. Tambien puede ejecutarse en CPU con 8 GB de RAM usando cuantizacion Q4 o menor.
- Compatibilidad con consumer GPU: si, es totalmente viable en hardware de consumo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, o cualquier frontend que soporte GGUF (KoboldCpp, text-generation-webui).
- Latencia y throughput: no disponible en la informacion proporcionada. En una GPU RTX 3060 se espera una generacion de 20-40 tokens por segundo con Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Caelistus-Gladius-Excalibur-RP-2.6B | 2,7B | no disponible | lfm1.0 | Roleplay + CoT |
| TinyLlama-1.1B-Chat | 1,1B | 2048 | Apache 2.0 | Chat generico |
| Zephyr-3B | 3B | 4096 | MIT | Chat y asistencia |

Los datos de contexto y rendimiento de las alternativas no estan disponibles en la informacion proporcionada. La principal diferencia es que el modelo de este articulo esta especializado en roleplay y CoT, mientras que TinyLlama y Zephyr son modelos generales de chat.

## Limitaciones y advertencias

- Tamano reducido: al ser un modelo de 2,7B, su capacidad de razonamiento y su conocimiento general son limitados en comparacion con modelos de 7B o superiores.
- Sesgos y alucinaciones: no se ha evaluado su comportamiento en contextos fuera del roleplay, y puede presentar alucinaciones o sesgos derivados del dataset de entrenamiento.
- Soporte de idiomas: solo soporta ingles. No se recomienda su uso en otros idiomas.
- Licencia lfm1.0: licencia personalizada que debe revisarse en el archivo LICENSE del repositorio para conocer las restricciones de uso comercial.
- Contenido adulto: el modelo fue entrenado con datos de roleplay adulto, por lo que puede generar contenido explicito. Se debe restringir su uso en aplicaciones publicas o menores.
- Contexto no especificado: no se ha publicado la longitud de contexto, lo que puede afectar la planificacion de despliegue en aplicaciones de largo alcance.
- Modelo experimental: el propio autor lo etiqueta como experimental, por lo que su calidad y estabilidad no estan garantizadas en entornos de produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Caelistus-Gladius-Excalibur-RP-2.6B-Thinking-v0.1-GGUF
- Modelo base: https://huggingface.co/Indexnusrefather/Caelistus-Gladius-Excalibur-RP-2.6B-Thinking-v0.1
- Perfil de mradermacher: https://huggingface.co/mradermacher
