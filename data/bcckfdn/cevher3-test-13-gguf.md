# bcckfdn/cevher3-test-13-GGUF

## Resumen
cevher3-test-13-GGUF es la distribucion en formato GGUF del modelo cevher3-test-13, un modelo de lenguaje de tipo base afinado para generacion de texto en turco e ingles. Lo desarrolla el usuario bcckfdn y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Con 1.256.312.832 parametros totales (aproximadamente 1,26 mil millones), se situa en la gama de modelos pequenos, optimos para inferencia en CPU o GPU de consumo.

El modelo emplea una arquitectura derivada de Gemma3 con atencion de ventana deslizante (SWA), segun indica la model card, con un tamano de capa oculta de 1792 y 34 capas. Se ha entrenado con 28.705 millones de tokens, un volumen considerable para su tamano, lo que sugiere un enfasis en calidad por token. La publicacion incluye cuantizaciones en BF16, Q8_0, Q5_K_M y Q4_K_M, lo que facilita su despliegue en llama.cpp, Ollama y LM Studio.

Su relevancia actual radica en que ofrece una alternativa ligera y abierta para tareas de generacion de texto en turco, un idioma con menos representacion en la oferta de modelos abiertos, y con un coste de hardware muy bajo. El repositorio ocupa 11,1 GB e incluye los distintos archivos GGUF, y acumula 353 descargas desde su creacion en noviembre de 2026.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma3 con atencion de ventana deslizante (SWA) |
| Parametros totales | 1.256.312.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura transformer basada en Gemma3 con atencion de ventana deslizante (SWA), segun la model card. Dispone de 34 capas y una dimension oculta de 1792, coherente con un modelo de aproximadamente 1,26 mil millones de parametros. El entrenamiento se realizo sobre 28.705 millones de tokens, un volumen elevado para esta escala, lo que indica un esfuerzo por maximizar la calidad del modelo dentro de su rango de parametros.

No se especifican en la informacion disponible detalles sobre la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales mas alla de la atencion de ventana deslizante. Tampoco se documenta la longitud de contexto soportada ni la estrategia de tokenizacion.

## Capacidades
- Generacion de texto conversacional en turco e ingles.
- Razonamiento basico y respuesta a instrucciones (el tag "conversational" sugiere formato de chat, aunque no se detalla el template).
- Capacidades multilingues limitadas a turco e ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta vision, audio ni modo de pensamiento explicito.
- Compatible con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia estandar.

## Casos de uso
- Generacion de texto en turco para prototipos y aplicaciones de bajo coste: el modelo puede producir respuestas coherentes en turco con un consumo de recursos minimo, adecuado para entornos de desarrollo y pruebas.
- Chatbot ligero de atencion al cliente en turco: su tamano permite desplegarlo en una sola GPU de consumo o incluso en CPU, gestionando conversaciones multi-turno basicas sin infraestructura dedicada.
- Generacion de contenido y resumenes en turco: util para redactar borradores, resumir textos o generar descripciones en aplicaciones editoriales o de marketing.
- Traduccion asistida turco-ingles: al dominar ambos idiomas, puede emplearse como base para tareas de traduccion simple o como componente en pipelines de localizacion.
- Educacion y asistencia en el aprendizaje del turco: puede generar ejemplos, explicaciones y ejercicios en turco para plataformas educativas.
- Despliegue en dispositivos con recursos limitados: gracias a las cuantizaciones Q4_K_M (744 MB) y Q5_K_M (862 MB), puede ejecutarse en portatiles, Raspberry Pi o entornos edge mediante llama.cpp u Ollama.
- Filtrado y clasificacion de texto en turco: como modelo base, puede afinarse para tareas de clasificacion o extraccion de informacion en dominios especificos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,8 GB en Q4_K_M, 0,9 GB en Q5_K_M, 1,3 GB en Q8_0 y 2,4 GB en BF16 (segun los tamanos de archivo indicados).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para BF16; las cuantizaciones Q4 y Q5 caben en GPUs integradas o de gama baja (GTX 1050, RTX 3050, etc.).
- Cabe en GPU de consumo: si, en practicamente todas las GPUs modernas, incluidas las de portatiles.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (ollama create/run), LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,26 mil millones de parametros, se espera una latencia baja en GPU y moderada en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| cevher3-test-13-GGUF | 1,26 B | no disponible | Apache 2.0 | GGUF | Hugging Face |
| Gemma 3 (1B) | ~1 B | no disponible en la informacion | Gemma Terms | safetensors, GGUF | Hugging Face |
| Qwen2.5-1.5B | 1,5 B | 32K (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Llama 3.2 1B | 1,2 B | 128K (segun documentacion publica) | Llama 3.2 Community License | safetensors, GGUF | Hugging Face |

Nota: los datos de contexto y licencia de los modelos comparados provienen de su documentacion publica general; no se dispone de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo de tipo base afinado: no se detalla el proceso de alineacion (RLHF/DPO), por lo que puede generar respuestas inconsistentes o no alineadas con instrucciones complejas.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en tareas de conocimiento factual.
- Cobertura linguistica limitada a turco e ingles; el rendimiento en otros idiomas no esta garantizado.
- Longitud de contexto no documentada, lo que dificulta planificar aplicaciones con ventanas largas.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no ofrece garantias sobre el rendimiento ni sobre la procedencia de los datos de entrenamiento.
- No se documentan sesgos conocidos; como en todo modelo entrenado con datos web, es probable que presente sesgos sociales y culturales.
- El repositorio tiene un tamano de 11,1 GB, lo que puede dificultar la descarga en entornos con ancho de banda limitado.

## Enlaces
- Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-13-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher3-test-13
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
