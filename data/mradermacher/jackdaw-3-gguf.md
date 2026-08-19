# mradermacher/Jackdaw-3-GGUF

## Resumen

Jackdaw-3-GGUF es una colección de archivos en formato GGUF que cuantiza el modelo base `blascotobasco/Jackdaw-3`, desarrollado por el usuario de Hugging Face mradermacher. El modelo original está orientado a conversación y roleplay, con etiquetas que indican contenido sin censura y no apto para todos los públicos. Esta versión cuantizada permite ejecutar el modelo en hardware de consumo mediante motores de inferencia compatibles con GGUF, como llama.cpp, Ollama o LM Studio.

La relevancia de esta publicación radica en que facilita el despliegue local de un modelo de lenguaje diseñado para interacción conversacional y juegos de rol, sin necesidad de infraestructura de servidores de alto rendimiento. Al ser una cuantización estática, no se incluyen pesos en formato original ni información sobre el entrenamiento del modelo base. El repositorio ocupa 124.1 GB en total, repartidos en diez archivos de cuantización con tamaños que van desde 7.0 GB (Q2_K) hasta 19.2 GB (Q8_0).

No se dispone de detalles sobre la arquitectura, el número de parámetros, la longitud de contexto ni el proceso de entrenamiento del modelo original, ya que la model card solo documenta el proceso de cuantización. Toda la información técnica del modelo base permanece sin publicar en esta página.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base `blascotobasco/Jackdaw-3`. No se conocen detalles sobre si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura hibrida. Tampoco hay datos sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF, DPO u otras. La unica informacion disponible es que el modelo esta etiquetado como "uncensored" y "roleplay", lo que sugiere un entrenamiento orientado a conversacion libre y generacion de contenido sin filtros, pero sin confirmacion tecnica.

El proceso de cuantizacion realizado por mradermacher es estatico, es decir, se convirtieron los pesos del modelo base a formato GGUF con diferentes niveles de precision. No se menciona el uso de imatrix ni de cuantizacion ponderada. La tabla de quants incluida en la model card indica que los archivos Q4_K_S y Q4_K_M son los recomendados por equilibrio entre velocidad y calidad, mientras que Q8_0 ofrece la mejor calidad pero mayor tamano.

## Capacidades

- Generacion de texto conversacional: el modelo esta disenado para mantener dialogos multi-turno, segun las etiquetas "conversational" y "roleplay".
- Roleplay y narrativa interactiva: los tags indican que es apto para juegos de rol textuales y creacion de personajes.
- Contenido sin censura: la etiqueta "uncensored" sugiere que no aplica filtros de seguridad sobre temas sensibles, aunque no se especifica el alcance.
- Idioma: solo ingles (etiqueta "en").
- No se dispone de informacion sobre capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio u otras funcionalidades avanzadas.

## Casos de uso

- Juegos de rol textuales: el modelo puede actuar como maestro de juego o companero de roleplay en ingles, generando descripciones, dialogos y reacciones coherentes con la narrativa. Su orientacion a conversacion larga lo hace adecuado para sesiones prolongadas.
- Creacion de personajes ficticios: se puede utilizar para desarrollar personajes con personalidades definidas y mantener conversaciones consistentes con su trasfondo, util en escritura creativa o prototipado de NPCs para videojuegos.
- Simulacion de dialogos para guiones: escritores pueden emplear el modelo para generar intercambios entre personajes y explorar variaciones de tono o conflicto, aprovechando su naturaleza sin censura para temas adultos.
- Asistente de escritura creativa: aunque no esta confirmado, su capacidad conversacional podria ayudar a generar ideas, tramas o descripciones, siempre que se acepte la falta de garantias de calidad.
- Chatbots de entretenimiento: integrable en aplicaciones de chat local mediante Ollama o llama.cpp, ofreciendo una experiencia de conversacion sin restricciones para usuarios que buscan ese tipo de interaccion.
- Experimentacion con cuantizacion: los diez niveles de cuantizacion permiten probar el equilibrio entre calidad y consumo de recursos en diferentes hardware, util para investigacion sobre el impacto de la precision en modelos conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo ni para su version base.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamano de los archivos GGUF, se puede estimar que la cuantizacion Q4_K_M (11.2 GB) requiere al menos 12 GB de VRAM para cargar el modelo completo, mientras que Q2_K (7.0 GB) podria caber en 8 GB. Q8_0 (19.2 GB) necesita 20 GB o mas.
- GPU recomendadas: para las cuantizaciones mas pequeñas (Q2_K a Q4_K_M) son suficientes GPUs de consumo como RTX 3060 12GB, RTX 4070 o RTX 4060 Ti 16GB. Para Q5_K_M y superiores se recomienda RTX 4080, RTX 4090 o GPUs profesionales como A100.
- Compatibilidad con consumer GPU: si, las cuantizaciones Q2_K, Q3_K_* y Q4_K_* caben en GPUs de gama media con 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier motor compatible con GGUF. Tambien se puede usar con vLLM si se convierte a otro formato, aunque no es el proposito de esta publicacion.
- Latencia y throughput: no se dispone de mediciones oficiales. Dependera del hardware y de la cuantizacion elegida; en una RTX 4090 con Q4_K_M se podrian esperar decenas de tokens por segundo, pero es una estimacion sin datos verificados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria. Existen otras cuantizaciones de mradermacher como `Jackdaw-30B-A3B-GGUF` y `Jackdaw-3-Ministral-GGUF`, pero no se conocen sus especificaciones tecnicas ni su rendimiento. Sin datos sobre parametros, contexto o benchmarks, no es posible establecer una comparativa objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado informacion sobre sesgos del modelo base. Dado su caracter "uncensored", es probable que reproduzca estereotipos o contenido ofensivo sin filtros.
- Riesgo de alucinacion: al ser un modelo conversacional sin datos de entrenamiento publicados, no se puede evaluar su tendencia a inventar informacion. Se recomienda verificar cualquier salida factual.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada. Los modelos de roleplay suelen manejar ventanas de 4K a 8K tokens, pero no hay confirmacion.
- Restricciones de licencia: la licencia no esta especificada, lo que impide conocer si se permite uso comercial o modificacion. Se debe contactar con el autor del modelo base antes de utilizarlo en produccion.
- Contenido inapropiado: las etiquetas "not-for-all-audiences" y "uncensored" indican que el modelo puede generar contenido explicito, violento o ilegal. No es apto para menores ni para aplicaciones con requisitos de moderacion.
- Soporte limitado: al ser una cuantizacion estatica sin imatrix, la calidad puede ser inferior a otras versiones ponderadas. El propio autor indica que los quants IQ no estan disponibles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Jackdaw-3-GGUF
- Modelo base: https://huggingface.co/blascotobasco/Jackdaw-3
- Pagina de ayuda para descargas: https://hf.tst.eu/model#Jackdaw-3-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
