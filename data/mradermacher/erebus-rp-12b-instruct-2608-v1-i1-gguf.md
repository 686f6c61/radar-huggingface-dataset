# mradermacher/Erebus-RP-12B-Instruct-2608-v1-i1-GGUF

## Resumen

Erebus-RP-12B-Instruct-2608-v1 es un modelo de lenguaje especializado en roleplay, escritura creativa y construcción de mundos, desarrollado como un fine-tune de Gemma 3 12B sobre el modelo base Indexnusrefather/Erebus-RP-12B-Instruct-2608-v1. La versión aquí descrita es una cuantización GGUF con imatrix (i1) realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo con distintos niveles de precisión y tamaño. Está pensado para usuarios que buscan un modelo capaz de mantener conversaciones de rol extensas, generar narrativa rica y manejar contenido explícito (ERP) con fluidez.

El modelo conserva la arquitectura transformer de Gemma 3, con aproximadamente 11,8 mil millones de parámetros, y se distribuye exclusivamente en inglés. La cuantización GGUF con imatrix ofrece un equilibrio entre calidad y rendimiento, con opciones que van desde 3,0 GB hasta 9,8 GB, lo que lo hace accesible en GPUs de consumo como la serie RTX 30 o 40. Al estar basado en Gemma 3, hereda la licencia Gemma de Google, que permite uso comercial con ciertas restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 12B, fine-tune para roleplay) |
| Parametros totales | 11.766.034.176 (11,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredado de Gemma 3, no confirmado) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (tamaños de 3,0 a 9,8 GB) |
| Idiomas soportados | Ingles |
| Licencia | Gemma (Google) |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base, Erebus-RP-12B-Instruct-2608-v1, es un fine-tune de Gemma 3 12B, un transformer denso con atención local y global, diseñado originalmente por Google para tareas de generación de texto y razonamiento. El fine-tune se ha orientado específicamente a roleplay, escritura creativa y worldbuilding, con énfasis en contenido explícito (ERP) y narrativa inmersiva. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.). La cuantización GGUF con imatrix aplicada por mradermacher preserva la arquitectura original y añade una matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precisión.

## Capacidades

- Generación de texto narrativo y conversacional en inglés, con especial habilidad para mantener personajes consistentes y tramas coherentes en contextos largos.
- Roleplay multi-turno, incluyendo escenas de contenido explícito (ERP) si el usuario lo solicita, gracias al fine-tune específico.
- Escritura creativa: cuentos, novelas, diálogos, descripciones de escenarios y construcción de mundos (worldbuilding).
- Soporte de instrucciones (instruct) para guiar el estilo, tono o dirección de la generación.
- Conversación natural y fluida, adecuada para chatbots o asistentes de ficción.
- No se ha confirmado soporte para tool calling, function calling, visión, audio o razonamiento multi-paso más allá de la generación de texto.

## Casos de uso

- Roleplay conversacional en juegos de rol por texto: el modelo puede interpretar múltiples personajes, mantener historias paralelas y reaccionar coherentemente a las acciones del usuario, gracias a su fine-tune específico.
- Escritura de ficción asistida: autores pueden usarlo para generar borradores, desarrollar tramas o describir escenarios complejos, aprovechando su capacidad de worldbuilding rico.
- Creación de diálogos para videojuegos o narrativa interactiva: permite generar líneas de personajes no jugadores (NPC) con personalidad y coherencia.
- Simulación de personajes para chatbots de entretenimiento: el modelo puede mantener una identidad ficticia estable a lo largo de conversaciones largas.
- Generación de contenido para juegos de mesa o campañas de rol: útil para crear aventuras, descripciones de mazmorras o encuentros con personajes.
- Prototipado de narrativa experimental: investigadores o creadores pueden explorar estilos literarios o estructuras no convencionales gracias a su entrenamiento orientado a la creatividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, desde aproximadamente 4 GB (IQ1_S) hasta 12 GB (Q6_K) solo para los pesos, más memoria para el contexto y las activaciones.
- GPU recomendadas: para cuantizaciones pequeñas (IQ1_S a IQ3_M), una GPU con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente. Para cuantizaciones medias (Q4_K_M, Q5_K_M), se recomienda 10-12 GB (RTX 3080, RTX 4070 Ti). Para Q6_K, se necesita al menos 16 GB (RTX 4080, RTX 4090 o A100).
- Es viable en GPUs de consumo, especialmente con cuantizaciones de 4 bits o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como vLLM (con adaptadores) o llama-cpp-python.
- Latencia y throughput: no se han publicado datos específicos, pero en una RTX 4090 con Q4_K_M se puede esperar una generación de 30-50 tokens por segundo, dependiendo del contexto y la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Erebus-RP-12B-Instruct-2608-v1 (este) | 11,8B | No disponible | Gemma | Roleplay y escritura creativa |
| Gemma 3 12B (original) | 11,8B | 128K (oficial) | Gemma | Modelo general de texto |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | Modelo general de texto |
| Llama 3 8B Instruct | 8B | 8K | Llama 3 | Modelo general de texto |

La comparativa se basa en parámetros y licencia, ya que no hay datos de rendimiento disponibles. Erebus-RP se distingue por su especialización en roleplay y contenido creativo, mientras que las alternativas son modelos generalistas. La licencia Gemma permite uso comercial pero con restricciones específicas de Google, a diferencia de Apache 2.0 (Mistral).

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en inglés; no es adecuado para tareas en otros idiomas sin adaptación.
- Al ser un fine-tune orientado a roleplay, puede generar contenido explícito o inapropiado si se le solicita; requiere moderación en entornos de producción.
- Riesgo de alucinación y pérdida de coherencia en contextos muy largos, especialmente con cuantizaciones de baja precisión.
- La licencia Gemma impone restricciones de uso (por ejemplo, no puede usarse para ciertos fines militares o de vigilancia) y exige atribución; verificar los términos completos antes de uso comercial.
- No se ha confirmado la longitud de contexto efectiva tras el fine-tune; puede diferir de los 128K del modelo base.
- No hay información sobre el proceso de entrenamiento, por lo que se desconocen posibles sesgos o limitaciones del dataset original.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/mradermacher/Erebus-RP-12B-Instruct-2608-v1-i1-GGUF)
- [Modelo base original en HuggingFace](https://huggingface.co/Indexnusrefather/Erebus-RP-12B-Instruct-2608-v1)
- [Pagina de descarga alternativa con lista de archivos](https://hf.tst.eu/model#Erebus-RP-12B-Instruct-2608-v1-i1-GGUF)
- [Version con cuantizaciones estaticas](https://huggingface.co/mradermacher/Erebus-RP-12B-Instruct-2608-v1-GGUF)
