# Kismi/gemma-2-2b-it-abliterated-GGUF

## Resumen

Esta ficha corresponde a un repositorio GGUF cuantizado de **gemma-2-2b-it-abliterated**, una versión "abliterada" (con los mecanismos de rechazo de instrucciones atenuados) de Gemma 2 2B Instruct, el modelo conversacional de 2,6 mil millones de parámetros de Google. El modelo base fue modificado por IlyaGusev, y las cuantizaciones en formato GGUF fueron realizadas por bartowski usando la opción imatrix de llama.cpp (release b3496). El repositorio aquí fichado, publicado por el usuario Kismi, es una réplica de esas cuantizaciones.

El propósito del modelo es ofrecer un modelo pequeño, ligero y sin filtros de alineación para ejecución local en hardware modesto, incluso en portátiles sin GPU dedicada. Al ser una versión abliterated, responde a instrucciones que el modelo original rechazaría, lo que lo hace relevante para investigación en seguridad y alineación, pero también más arriesgado para uso general. La ventana de contexto de Gemma 2 2B es de 8.192 tokens.

Cabe señalar que el repositorio de Kismi tiene una actividad muy baja (384 descargas, 0 likes) y su model card es una copia casi literal de la de bartowski, quien es el autor real de las cuantizaciones. Para obtener actualizaciones y soporte, se recomienda consultar el repositorio original de bartowski.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 2) |
| Parametros totales | 2.614.341.888 (~2,61B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (del modelo base Gemma 2 2B) |
| Tipos de cuantizacion | f32, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_XL, Q3_K_L, IQ3_M, Q2_K_L (imatrix) |
| Idiomas soportados | Ingles (según model card) |
| Licencia | Gemma (Google) |
| Formato de pesos | GGUF (cuantizado); base original en safetensors |

## Arquitectura y entrenamiento

El modelo base es Gemma 2 2B Instruct, un transformer decoder de Google con 2,61 mil millones de parámetros y una ventana de contexto de 8.192 tokens. Gemma 2 incorpora mejoras arquitectónicas respecto a su primera generación, como mecanismos de atención local/global alternados y logit distillation durante el entrenamiento. La versión "-it" es la variante ajustada para seguir instrucciones y diálogo multi-turno mediante el formato de prompt con turnos (`<start_of_turn>user` / `<start_of_turn>model`).

La modificación "abliterated" aplicada por IlyaGusev consiste en ajustar los pesos del modelo para suprimir los vectores de dirección interna responsables de los rechazos de instrucciones, sin reentrenamiento completo. El resultado es un modelo que atiende peticiones que el original denegaría. No hay información publicada sobre datos de entrenamiento adicionales, RLHF ni DPO en esta variante. Las cuantizaciones GGUF de bartowski se generaron con imatrix (matriz de importancia calculada sobre un dataset de calibración), lo que preserva mejor la calidad que la cuantización estándar a igual tamaño.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de turnos estilo Gemma.
- Seguimiento de instrucciones heredado de Gemma 2 2B Instruct.
- Razonamiento y generacion de codigo a nivel basico, acordes a su tamano de 2B (no optimizado para tareas complejas).
- Respuesta sin rechazos de seguridad ("abliterated"): atiende peticiones que el modelo original denegaria.
- Ejecucion local via llama.cpp, LM Studio, Ollama y otros runtimes compatibles con GGUF.
- No soporta system prompt, segun indica la model card.
- No hay soporte documentado de vision, audio, tool calling ni agentes.

## Casos de uso

- Investigacion en seguridad y alineacion: estudiar el comportamiento de un modelo sin mecanismos de rechazo es util para red-teaming y analisis de robustez de alineaciones.
- Chatbot local ligero: con la variante Q4_K_M (1,71 GB) cabe en la mayoria de portatiles, permitiendo un asistente conversacional offline sin GPU dedicada.
- Prototipado rapido de aplicaciones LLM: su tamano reducido permite iterar prompts y pipelines en CPU antes de escalar a modelos mayores.
- Generacion de texto creativo sin filtros: escritura de ficcion o dialogos donde el usuario prefiere control total sobre el contenido, asumiendo la responsabilidad etica y legal.
- Pruebas de cuantizacion imatrix: comparar la degradacion de calidad entre variantes Q2_K_L e IQ4_XS en un modelo pequeño es un buen banco de pruebas educativo.
- Integracion en dispositivos edge: su huella de memoria (por debajo de 2 GB en cuantizaciones medias) lo hace viable en SBC tipo Raspberry Pi 5 o mini-PCs.
- Extension de herramientas como LM Studio o Ollama: descarga directa de un solo archivo GGUF para uso inmediato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Como referencia no verificada, el modelo base Gemma 2 2B Instruct obtiene puntuaciones competitivas para su tamano en MMLU, GSM8K y HumanEval, pero esta variante abliterated no incluye evaluaciones propias y la abliteration puede degradar la calidad general.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~1,4 GB (IQ3_M) hasta ~2,8 GB (Q8_0) en cuantizaciones habituales; la variante f32 requiere ~10,5 GB.
- Cabe sobradamente en GPUs consumer: cualquier GPU con 4 GB de VRAM (GTX 1650, RTX 3050, RTX 3060) ejecuta la variante Q4_K_M con holgura; tambien funciona en CPU pura con RAM de 8 GB.
- GPU recomendadas: no es necesaria GPU; si se desea aceleracion, una RTX 3060 de 12 GB o superior permite contexto completo y batch mayores.
- Opciones de despliegue: llama.cpp (runtime de referencia), LM Studio (recomendado en la model card), Ollama, KoboldCpp, y cualquier backend compatible con GGUF. No esta orientado a vLLM o TGI, que requieren pesos safetensors.
- Latencia y throughput: no disponibles; al ser un modelo de 2B cuantizado, la inferencia en CPU moderna es fluida (decenas de tokens/s tipicos, dato no oficial).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| gemma-2-2b-it-abliterated-GGUF (este) | 2,61B | 8.192 | Gemma | Abliterated, GGUF imatrix |
| google/gemma-2-2b-it | 2,61B | 8.192 | Gemma | Modelo original con filtros de seguridad |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 | Qwen (Apache-like, uso comercial permisivo) | Mayor contexto y multilingue |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 | Llama 3.2 | Contexto muy largo, mejor rendimiento general |

Frente a las alternativas, este modelo destaca por su ausencia de rechazos y su tamano minimo, pero queda por detras en contexto, capacidades multilingues y rendimiento bruto frente a Qwen2.5-3B y Llama-3.2-3B.

## Limitaciones y advertencias

- Al ser una version abliterated, carece de salvaguardas de seguridad: puede generar contenido ofensivo, peligroso o ilegal. Su uso conlleva responsabilidad legal y etica directa del usuario.
- La abliteration puede degradar la calidad general y la coherencia del modelo respecto a Gemma 2 2B Instruct original.
- Idioma principal: ingles. El rendimiento en castellano no esta documentado y probablemente sea limitado para un modelo de 2B.
- No soporta system prompt, lo que restringe patrones de prompting avanzados.
- Contexto de 8.192 tokens, corto para tareas de documentos largos o RAG extensivo.
- Licencia Gemma: exige aceptar los terminos de uso de Google, que incluyen politicas de uso aceptable; la abliteration no exime de cumplirlos y puede entrar en conflicto con ellos.
- Riesgo de alucinacion tipico de modelos pequenos; no apto para produccion critica sin verificacion humana.
- El repositorio de Kismi es una copia de baja actividad; se recomienda usar el repositorio original de bartowski para soporte y actualizaciones.

## Enlaces

- Repositorio fichado: https://huggingface.co/Kismi/gemma-2-2b-it-abliterated-GGUF
- Repositorio original de cuantizaciones (bartowski): https://huggingface.co/bartowski/gemma-2-2b-it-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/IlyaGusev/gemma-2-2b-it-abliterated
- llama.cpp (release b3496 usada para cuantizar): https://github.com/ggerganov/llama.cpp/releases/tag/b3496
- llama.cpp (repositorio): https://github.com/ggerganov/llama.cpp/
- Dataset de calibracion imatrix: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- LM Studio: https://lmstudio.ai/
