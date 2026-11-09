# DavidAU/Gemma-The-Writer-N-Restless-Quill-V2-Enhanced32-10B-Uncensored-GGUF

## Resumen

Gemma-The-Writer-N-Restless-Quill-V2-Enhanced32-10B-Uncensored es un modelo de lenguaje de 10.034.486.784 parámetros (aproximadamente 10B) especializado en escritura creativa, ficción y generación de prosa vívida, desarrollado por DavidAU. Se trata de un merge de modelos construido sobre la arquitectura Gemma 2 de Google, combinando los cuatro mejores modelos de narración y escritura según EQBench, junto con adaptadores propios del autor (Brainstorm 5x) que elevan el modelo base de 9B a 10B parámetros y modifican la estructura de prosa generada.

El modelo resuelve el problema de la generación de ficción genérica y estereotipada: incorpora componentes como "gemma2-gutenberg" para reducir los llamados GPTismos y clichés, "Tiger-Gemma" y "Ellaria" para eliminar el sesgo de censura, y ajustes específicos para variedad de párrafos, estructura de frases y generación de metáforas. Está pensado para escritores, herramientas de roleplay y pipelines de generación de narrativa que necesitan prosa con estilo propio y sin restricciones de contenido.

Es relevante ahora porque ofrece una alternativa abierta (licencia Apache 2.0) y de tamaño contenido (10B, ejecutable en GPU de consumo con cuantización) frente a modelos propietarios de escritura creativa, con una ventana de contexto de 8k tokens extensible a 32k o más mediante RoPE. La versión publicada es un repositorio GGUF con múltiples cuantizaciones, incluida una versión maestra en float32 y variantes "MAX" y "MAX-CPU" con tensores de salida y embeddings en mayor precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma 2 (merge de modelos mediante mergekit) |
| Parametros totales | 10.034.486.784 (aproximadamente 10B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8k tokens nativo, extensible a 32k o superior mediante RoPE |
| Tipos de cuantizacion | GGUF: Q2K, IQ4_XS, Q6_K, Q8_0 y variantes "MAX" y "MAX-CPU"; version maestra en float32 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 136,7 GB con multiples cuantizaciones); modelo base en bfloat16/float32 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Gemma 2, con 46 capas y 508 tensores según indica el autor. No se ha entrenado desde cero: es un merge construido con mergekit que combina los cuatro mejores modelos de escritura y narración según EQBench, e incorpora los componentes "gemma2-gutenberg", "Tiger-Gemma" (para eliminar censura) y "Ellaria" (para eliminar más censura). Sobre la base "Gemma The Writer 9B" se aplicó un adaptador Brainstorm 5x desarrollado por DavidAU, que añade cerca de 1B de parámetros y altera la generación de prosa, la estructura de frases y la longitud media de salida (en algunos casos casi la duplica).

El proceso de cuantización se realizó partiendo de un merge en float32, con cuantizaciones "refrescadas" usando las mejoras más recientes de llama.cpp. Todas las cuantizaciones incorporan tensores de salida y embeddings en Q8_0 como mínimo, y existen variantes "MAX" (tensores de salida y embeddings en float32) y "MAX-CPU" (en bfloat16, forzando esos tensores a CPU para liberar VRAM). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. El nivel de censura se controla a nivel de prompt mediante pre-prompts.

## Capacidades

- Generación de texto creativo: ficción, cuentos, novelas, escenas, continuación de escenas y generación de tramas y subtramas.
- Escritura de prosa vívida con variedad de párrafos, estructura de frases (incluidas frases de una y dos palabras), selección léxica y generación de metáforas.
- Cobertura de todos los géneros: ciencia ficción, romance, terror, y otros.
- Roleplay y conversación multi-turno, con control de nivel de censura mediante prompts.
- Modelo sin censura: admite lenguaje soez, contenido gráfico y temas para adultos (marcado como not-for-all-audiences).
- Seguimiento de instrucciones reforzado gracias a la cuantización con mejoras de llama.cpp y a los tensores de salida en mayor precisión.
- Capacidad de uso general más allá de la escritura creativa, según el autor, por su estabilidad y naturaleza comprimida.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de novelas y relatos por capítulos: el modelo mantiene estilo y estructura narrativa a lo largo de sesiones largas gracias a su contexto de 8k tokens (extensible a 32k con RoPE), adecuado para escribir escenas completas con continuidad.
- Continuación de escenas y "scene continue": un escritor puede pegar un fragmento existente y pedir al modelo que continúe con el mismo tono y voz, aprovechando el ajuste específico para prosa y la reducción de clichés.
- Generación de tramas y subtramas para guiones o videojuegos: el modelo produce sinopsis, arcos argumentales y giros con variedad estructural, útil en fases de ideación.
- Roleplay narrativo y juegos de texto: su capacidad conversacional y su naturaleza sin censura lo hacen adecuado para experiencias de rol para adultos o de terror, con control del tono mediante pre-prompts.
- Asistente de escritura para autores que necesitan superar el bloqueo creativo: variantes de una misma escena con distintos estilos, temperaturas y pre-prompts para explorar opciones.
- Generación de contenido de ficción para plataformas de serialización: producción de episodios o capítulos con longitud de salida ampliada (el adaptador Brainstorm aumenta la longitud media de generación).
- Prototipado de personajes y diálogos: creación de voces diferenciadas y conversaciones entre personajes en un mismo contexto, útil para guionistas y diseñadores narrativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas cuantitativas; únicamente referencia la posición en EQBench de los modelos componentes del merge, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 GB en float16/bfloat16 para los 10B parámetros; alrededor de 6-7 GB en Q4 y 10-11 GB en Q8_0 (estimaciones estándar para 10B, no confirmadas en la model card).
- La variante "MAX-CPU" de Q8_0 descarga 1,7 GB a CPU/RAM y carga 8,5 GB en GPU/VRAM, según el ejemplo del autor; el resto de VRAM puede destinarse a contexto.
- GPU recomendadas: A100 o H100 para float32 o contexto largo; RTX 4090 (24 GB) para Q8_0 y superiores; RTX 3090 y RTX 4080 para cuantizaciones Q4-Q6.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB con Q4, y en GPUs de 8 GB con cuantizaciones Q2K/IQ4_XS.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio y otros runners compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada. El autor advierte que las variantes MAX-CPU reducen tokens por segundo a cambio de liberar VRAM.
- Parámetros de muestreo recomendados por el autor: Rep Pen de 1.02 o superior, temperatura en rango 0-5, y plantilla de instrucción Gemma Instruct.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| Restless-Quill-V2-Enhanced32-10B | 10B | 8k (ext. 32k) | Escritura creativa sin censura | Apache 2.0 | GGUF |
| Gemma-The-Writer-9B (DavidAU) | 9B | 8k (ext. 32k) | Escritura creativa, base del anterior | Apache 2.0 | GGUF |
| Gemma-The-Writer-J.GutenBerg-10B (DavidAU) | 10B | 8k (ext. 32k) | Escritura con énfasis en descripción y metáfora | Apache 2.0 | GGUF |
| Gemma 2 9B (Google) | 9B | 8k | Propósito general, alineado y con censura | Gemma License | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. Las diferencias destacadas por el autor son cualitativas: el modelo aquí descrito reduce GPTismos y clichés frente a la versión J.GutenBerg, y añade cerca de 1B de parámetros y mayor longitud de salida frente a Gemma-The-Writer-9B.

## Limitaciones y advertencias

- Modelo sin censura: puede generar lenguaje soez, contenido gráfico, violento o para adultos; marcado como not-for-all-audiences. No es apto para aplicaciones dirigidas a menores sin filtrado externo.
- Solo soporta inglés; no se ha documentado capacidad multilingüe.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en contextos de ficción donde los hechos no son verificables.
- Sesgos conocidos: no documentados en la model card; al derivar de Gemma 2 y de merges comunitarios, puede heredar sesgos de los datos de entrenamiento originales.
- Es un merge comunitario sin evaluación formal publicada; el rendimiento depende fuertemente de los parámetros de muestreo (Rep Pen >= 1.02, temperatura 0-5) y de la plantilla Gemma Instruct.
- El contexto nativo es de 8k tokens; la extensión a 32k mediante RoPE puede degradar la coherencia en secuencias muy largas.
- El repositorio ocupa 136,7 GB por incluir múltiples cuantizaciones y una versión float32; conviene descargar solo el archivo GGUF necesario.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin censura es responsabilidad del desplegador; se recomienda añadir moderación en producción.
- No se ha documentado soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines de automatización que requieran function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Gemma-The-Writer-N-Restless-Quill-V2-Enhanced32-10B-Uncensored-GGUF
- Modelo base (no GGUF): https://huggingface.co/DavidAU/Gemma-The-Writer-N-Restless-Quill-V2-Enhanced32-10B-Uncensored
- Versión anterior: https://huggingface.co/DavidAU/Gemma-The-Writer-N-Restless-Quill-10B-Uncensored-GGUF
- Gemma The Writer 9B: https://huggingface.co/DavidAU/Gemma-The-Writer-9B-GGUF
- Gemma The Writer J.GutenBerg 10B: https://huggingface.co/DavidAU/Gemma-The-Writer-J.GutenBerg-10B-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Paper de referencia Gemma 2: https://arxiv.org/abs/2401.02415
- mergekit: https://github.com/arcee-ai/mergekit
