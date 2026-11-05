# SicariusSicariiStuff/Impish_Mind_8B

## Resumen

Impish_Mind_8B es un modelo de lenguaje de 8.030 millones de parámetros desarrollado por SicariusSicariiStuff, un ajuste fino (fine-tune) del modelo ruliad/deepthought-8b-llama-v0.01-alpha. Está orientado principalmente a role-play, escritura creativa y tareas generales de generación de texto, con un nivel de censura declarado como "extremadamente bajo" (9 sobre 10 en la escala del autor). Se distribuye bajo licencia Llama 3.1 y solo declara soporte para inglés.

El modelo emplea una arquitectura transformer tipo Llama (heredada del modelo base) y se publica en formato safetensors FP16, con un repositorio de 16,1 GB. El autor afirma que, a fecha de 16 de enero de 2025, Impish_Mind era el modelo de 8B mejor valorado en el UGI Leaderboard (leaderboard de role-play), aunque no se aportan cifras numéricas concretas de benchmarks estándar.

Su relevancia radica en su enfoque: entrenado con datos nuevos que incluyen datasets largos y complejos en formato Markdown, busca un equilibrio entre un nivel bajo de censura y una mayor capacidad de razonamiento respecto a modelos anteriores del mismo autor. La información pública disponible sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (derivada de ruliad/deepthought-8b-llama-v0.01-alpha) |
| Parámetros totales | 8.030.294.016 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16, FP8, GGUF (estáticos, iMatrix, High-Attention, iMatrix-High-Attention), EXL2 (3.5, 4.0, 5.0, 6.0, 7.0, 8.0 bpw), Q4_0 para ARM |
| Idiomas soportados | inglés (en) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (original FP16); GGUF y EXL2 en repositorios derivados |

## Arquitectura y entrenamiento

El modelo es un fine-tune sobre ruliad/deepthought-8b-llama-v0.01-alpha, que a su vez se basa en la arquitectura Llama. No se especifica en la información disponible si el entrenamiento incluyó RLHF, DPO u otras técnicas de alineación, ni el número exacto de tokens utilizados. El autor indica que se emplearon datos nuevos y "únicos", con especial énfasis en datasets largos y complejos en formato Markdown, y que el uso de datos tóxicos se mantuvo al mínimo.

Como innovación destacable, el autor menciona un enfoque de entrenamiento distinto al de sus modelos anteriores, orientado a mejorar la inteligencia del modelo a costa de un ligero aumento de la censura respecto a sus versiones previas. No se detallan técnicas como decodificación especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto en inglés para role-play, escritura creativa y tareas generales.
- Soporte de conversaciones multi-turno (implícito en su uso para role-play).
- Manejo de contenido estructurado en Markdown, gracias a los datasets de entrenamiento empleados.
- Nivel de censura declarado "extremadamente bajo" (9/10), con posibilidad de rechazo de algunas peticiones que el autor indica que puede evitarse con un system prompt básico o impersonación del asistente.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Role-play conversacional: el modelo está entrenado específicamente para mantener personajes y conversaciones multi-turno, lo que lo hace adecuado para aplicaciones de entretenimiento y narrativa interactiva.
- Escritura creativa: generación de relatos, poemas y ficción con un tono menos restrictivo que modelos alineados de forma agresiva, útil para autores que necesitan flexibilidad temática.
- Generación de contenido en Markdown: su entrenamiento con datasets largos en Markdown lo hace apropiado para producir documentación estructurada, guiones o plantillas con formato.
- Prototipado de asistentes conversacionales: al ser un modelo de 8B, puede desplegarse en hardware de consumo para pruebas rápidas de chatbots con personalidad definida.
- Experimentación en investigación sobre alineación y censura: su bajo nivel de censura declarado permite estudiar comportamientos de modelos escasamente filtrados en entornos controlados.
- Generación de diálogos para videojuegos o narrativa ramificada: la capacidad de mantener contexto conversacional y personajes lo hace útil para motores de diálogo en prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente declara que, a fecha de 16 de enero de 2025, el modelo era el 8B mejor valorado en el UGI Leaderboard (leaderboard orientado a role-play), sin aportar puntuaciones numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB (8.030 millones de parámetros × 2 bytes), más overhead de contexto.
- VRAM estimada en cuantizaciones GGUF Q4: alrededor de 5-6 GB, lo que permite ejecución en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- VRAM estimada en EXL2 4.0 bpw: aproximadamente 4-5 GB, adecuada para GPUs con 8 GB o más.
- GPU recomendadas: para FP16, A100, H100 o RTX 4090 (24 GB); para cuantizaciones, RTX 3060/4060/4070 en adelante.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; ExLlamaV2 para EXL2; vLLM o TGI para safetensors FP16 (no confirmado explícitamente en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Impish_Mind_8B | 8,03B | no disponible | llama3.1 | Role-play y escritura creativa con censura baja |
| ruliad/deepthought-8b-llama-v0.01-alpha | 8B (aprox.) | no disponible | no disponible | Modelo base del que deriva Impish_Mind |
| Llama 3.1 8B Instruct | 8,03B | 128K (según documentación oficial de Meta) | llama3.1 | Asistente general con alineación estándar |

No se dispone de datos de rendimiento comparativos en la información proporcionada. La comparación se limita a parámetros, licencia y enfoque declarado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un fine-tune con datos escasamente filtrados, puede reproducir sesgos presentes en el corpus de entrenamiento.
- Riesgo de alucinación: no cuantificado; como todo modelo de 8B, presenta riesgo de generar información incorrecta con aparente confianza.
- Limitaciones de idioma: solo se declara soporte para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: licencia Llama 3.1, que impone condiciones de uso comercial (incluida la obligación de mantener la denominación "Llama" en ciertos casos y restricciones para empresas con más de 700 millones de usuarios mensuales). Es necesario revisar los términos completos antes de uso comercial.
- Nivel de censura bajo: el modelo puede generar contenido no apto para todos los públicos; requiere moderación adicional en aplicaciones de producción orientadas al usuario final.
- Contexto: la longitud de contexto no está documentada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Datos de entrenamiento y benchmarks no publicados: la ausencia de documentación técnica detallada limita la evaluación rigurosa de su rendimiento y reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B
- Modelo base: https://huggingface.co/ruliad/deepthought-8b-llama-v0.01-alpha
- GGUF estáticos: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B_GGUF
- GGUF iMatrix: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B_iMatrix
- GGUF High-Attention: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B_GGUF_HA
- GGUF iMatrix-High-Attention: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B_HA_NL
- EXL2 3.5 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B-3.5bpw
- EXL2 4.0 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B-4.0bpw
- EXL2 5.0 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B-5.0bpw
- EXL2 6.0 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B-6.0bpw
- EXL2 7.0 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B-7.0bpw
- EXL2 8.0 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B-8.0bpw
- FP8: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B_FP8
- ARM Q4_0: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B_ARM
- ARM Q4_0 High-Attention: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B_ARM_HA
- Apoyo al autor (Ko-fi): https://ko-fi.com/sicarius
