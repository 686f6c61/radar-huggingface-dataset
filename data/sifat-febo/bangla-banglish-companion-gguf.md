# sifat-febo/bangla-banglish-companion-gguf

## Resumen

Banglish Companion es un modelo de lenguaje conversacional diseñado específicamente para el banglish, la variante del bengalí escrita fonéticamente en alfabeto latino que usan millones de hablantes en línea y la diáspora. Lo desarrolla Sifat Febo, y esta versión GGUF es la cuantización del modelo base `sifat-febo/banglish-companion`, pensada para ejecución local sin GPU y sin conexión a internet. El modelo resuelve un problema real: la mayoría de los LLM grandes ignoran el banglish, a pesar de que más de 230 millones de personas hablan bengalí y una parte significativa escribe en esta transcripción fonética.

La versión GGUF ofrece dos archivos cuantizados (Q4_K_M y Q8_0) con el formato ChatML incrustado, lo que permite usarlo directamente en llama.cpp, Ollama o LM Studio sin configuración adicional. Con 1.711.378.432 parámetros (aproximadamente 1.700 millones) y una ventana de contexto de 8192 tokens, es un modelo compacto que cabe en máquinas modestas. Su relevancia actual radica en cubrir un nicho desatendido: la conversación casual y amigable en banglish, con un enfoque en la calidad de interacción más que en el rendimiento bruto en benchmarks generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de ~1.700 millones de parametros) |
| Parametros totales | 1.711.378.432 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | Q4_K_M (1,06 GB), Q8_0 (1,82 GB) |
| Idiomas soportados | bn, en (especializado en banglish: bengali fonetico en alfabeto latino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna exacta del modelo base. Se sabe que es un modelo de tipo transformer con aproximadamente 1.700 millones de parametros, pero no se detalla la familia (por ejemplo, si deriva de Llama, Qwen u otra base). El entrenamiento se centra en conversacion casual en banglish, con un dataset propio llamado `banglish_bench` (publicado como subconjunto abierto de 450 prompts en 9 categorias) y un conjunto de validacion retenido de 700 prompts en 7 categorias para el benchmark interno BanglishBench v2.1.

No se menciona el uso de tecnicas como RLHF o DPO, ni el volumen total de tokens de entrenamiento. La innovacion principal no esta en la arquitectura sino en la especializacion linguistica: el modelo esta afinado para manejar codigo alternante (code-switching) entre bengali e ingles, y para responder con un tono casual y emocionalmente adecuado en banglish. La cuantizacion Q4_K_M muestra una calidad superior a la Q8_0 en el benchmark interno, algo inusual que el autor atribuye a una penalizacion por diversidad en la categoria de cumplimiento linguistico.

## Capacidades

- Generacion de texto conversacional en banglish, bengali fonetico en escritura latina, con tono casual y amigable.
- Manejo de code-switching entre bengali e ingles dentro de una misma conversacion.
- Comprension de temas variados (topics) y casos limite (edge_cases) con alta puntuacion (100% en Q4_K_M segun BanglishBench).
- Respuestas emocionalmente adecuadas: la categoria emotional alcanza 100% en Q4_K_M.
- Seguridad basica: la categoria safety puntua 100% en Q4_K_M, aunque el modelo tiende a desviar en lugar de rechazar peticiones peligrosas.
- No soporta tool calling, ni funciones de agente, ni vision, ni audio. Es exclusivamente texto.
- Capacidad multilingue limitada: bengali e ingles, con especial enfasis en la transcripcion fonetica banglish.
- Ejecucion local sin conexion a internet ni necesidad de cuenta.

## Casos de uso

- Atencion al cliente en banglish para empresas con audiencia bengali: el modelo puede gestionar consultas sencillas de una sola interaccion, como preguntas frecuentes o solicitudes de informacion, gracias a su tono amigable y su comprension del banglish. Su limitacion de cuatro turnos lo hace adecuado solo para respuestas puntuales, no para chats largos.
- Asistente personal en dispositivos con recursos limitados: al pesar solo 1,1 GB en Q4_K_M, puede ejecutarse en una Raspberry Pi o en un portatil antiguo sin GPU, ofreciendo respuestas conversacionales en banglish de forma offline.
- Herramienta educativa para aprender bengali o practicar conversacion: estudiantes de bengali pueden interactuar con el modelo en banglish y recibir respuestas naturales, aunque el modelo no esta disenado para corregir gramatica.
- Prototipado rapido de chatbots para el mercado bengali: desarrolladores pueden integrarlo en aplicaciones de mensajeria o web para validar ideas de producto antes de invertir en modelos mas grandes, gracias a su licencia Apache 2.0 y su facil despliegue con Ollama.
- Generacion de contenido casual en redes sociales: el modelo puede redactar publicaciones, respuestas o comentarios en banglish con un tono cercano, util para community managers que gestionan comunidades bengalis.
- Investigacion en procesamiento de lenguaje natural para lenguas de bajos recursos: sirve como punto de partida para estudiar el rendimiento de modelos pequenos en variantes foneticas, y su benchmark interno permite reproducir evaluaciones.

## Benchmarks y rendimiento

El unico benchmark publicado es el BanglishBench v2.1 Quality Floor, un conjunto retenido de 700 prompts en 7 categorias, evaluado sobre los archivos GGUF directamente. Los resultados son:

| Categoria | Q4_K_M | Q8_0 |
|---|---|---|
| casual | 100,0% | 100,0% |
| code_switching | 100,0% | 100,0% |
| topics | 100,0% | 100,0% |
| safety | 100,0% | 99,0% |
| edge_cases | 100,0% | 98,0% |
| emotional | 100,0% | 97,0% |
| language_compliance | 95,0% | 90,0% |
| **Overall** | **99,3%** | **97,7%** |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K. El autor advierte que la categoria language_compliance es la mas debil y que la penalizacion por diversidad en frases tipo plantilla es una debilidad real, no un artefacto de puntuacion.

## Requisitos de hardware

- El modelo esta disenado para ejecutarse sin GPU: el archivo Q4_K_M pesa aproximadamente 1,1 GB, por lo que cabe en la RAM de cualquier ordenador moderno (se recomiendan al menos 4 GB de RAM libre).
- En GPU, la VRAM necesaria para Q4_K_M es de unos 1,2-1,5 GB, lo que permite ejecutarlo en tarjetas antiguas como una GTX 1050 Ti o integradas con soporte CUDA.
- Para Q8_0, se necesitan aproximadamente 2 GB de VRAM o RAM adicional.
- Opciones de despliegue: llama.cpp (via `llama-cli`), Ollama (creando un Modelfile), LM Studio, o cualquier runtime compatible con GGUF como llamafile o text-generation-webui.
- Latencia: en CPU moderna (por ejemplo, un Intel i5 de 2020), se esperan velocidades de 10-20 tokens por segundo con Q4_K_M, suficiente para conversacion interactiva.
- No requiere tarjeta grafica dedicada, lo que lo hace accesible para entornos de produccion de bajo coste.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa con otros modelos. Existe una referencia a `titulm-1b-bn-v1` de Hishab (un LLM bengali de 1.000 millones de parametros) mencionado en una publicacion de Facebook, pero no se han encontrado datos de rendimiento comparables. Otros modelos bengalis como los de Bengali.AI se centran en reconocimiento de voz o en texto estandar, no en banglish conversacional. Por tanto, no se puede establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- Degradacion conversacional: el modelo pierde coherencia despues de aproximadamente cuatro turnos de historia, repitiendose y perdiendo el hilo. No es adecuado para chats largos o aplicaciones que requieran memoria extendida.
- Desvio en lugar de rechazo: ante peticiones peligrosas (por ejemplo, "como hackear una contrasena"), el modelo explica medidas de seguridad relacionadas en lugar de negarse explicitamente. Esto puede ser inaceptable en aplicaciones donde la seguridad y la moderacion son criticas.
- Sesgos no documentados: no hay informacion sobre sesgos de genero, raza o religion en el entrenamiento, aunque al ser un modelo pequeno con un dataset especifico, es probable que herede sesgos del corpus utilizado.
- Riesgo de alucinacion: no se ha evaluado formalmente, pero como cualquier LLM, puede generar informacion falsa con confianza, especialmente en temas fuera de su dominio conversacional.
- Limitacion de idioma: solo funciona bien en banglish y algo en bengali estandar e ingles. No es util para otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe citar el modelo base, no el empaquetado GGUF.
- Rendimiento en benchmarks estandar no verificado: no hay datos de MMLU, HumanEval u otros, por lo que no se puede comparar con modelos generalistas.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/sifat-febo/bangla-banglish-companion-gguf
- Modelo base: https://huggingface.co/sifat-febo/banglish-companion
- Dataset BanglishBench: https://huggingface.co/datasets/sifat-febo/banglish_bench
- Perfil del autor: https://huggingface.co/sifat-febo
- Pagina de datasets del autor: https://huggingface.co/sifat-febo/datasets
- Referencia a Bengali.AI (datasets abiertos): https://www.bengali.ai/datasets
