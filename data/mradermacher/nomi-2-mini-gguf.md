# mradermacher/Nomi-2-Mini-GGUF

## Resumen

Nomi-2-Mini es un modelo de lenguaje compacto de 1.942.653.248 parametros (aproximadamente 1,94B) desarrollado por LazyLoopStudio y basado en la arquitectura Qwen3.5. Este repositorio contiene la version cuantizada en formato GGUF preparada por mradermacher, que permite ejecutar el modelo en hardware de consumo con un consumo de memoria reducido. El modelo esta disenado para tareas conversacionales y destaca por su eficiencia, siendo una opcion adecuada para despliegues en entornos con recursos limitados.

La relevancia de este modelo radica en su tamano reducido combinado con una arquitectura moderna (Qwen3.5), lo que lo hace interesante para aplicaciones de chatbot, asistentes virtuales y prototipado rapido. El repositorio incluye multiples niveles de cuantizacion, desde Q2_K hasta f16, ademas de ficheros mmproj para soporte multimodal. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, aunque el modelo solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer) |
| Parametros totales | 1.942.653.248 (1,94B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, una evolucion de la familia Qwen que mantiene el diseño transformer clasico con atencion por ventanas. Con 1,94B parametros, es un modelo denso sin mezcla de expertos (MoE), lo que simplifica su despliegue y reduce los requisitos de memoria. El desarrollo corre a cargo de LazyLoopStudio y ha sido optimizado con Unsloth, una libreria especializada en acelerar el entrenamiento y la inferencia de modelos LLM.

Los detalles especificos sobre el dataset de entrenamiento, el numero de tokens procesados o el uso de tecnicas como RLHF o DPO no estan disponibles en la informacion proporcionada. El modelo base es JallyAI/Nomi-2-Mini, y esta version GGUF es una cuantizacion estatica realizada por mradermacher, sin usar matrices de importancia (imatrix) segun indica el autor.

## Capacidades

- Generacion de texto conversacional: disenado para mantener dialogos naturales y coherentes en ingles.
- Soporte multimodal: incluye ficheros mmproj (Q8_0 y f16) que permiten procesar entradas visuales junto con texto.
- Eficiencia computacional: al ser un modelo de ~2B parametros, puede ejecutarse en hardware modesto con cuantizaciones agresivas.
- Integracion con ecosistema GGUF: compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato.
- Optimizacion con Unsloth: el modelo base fue entrenado con esta libreria, lo que puede mejorar la velocidad de inferencia en ciertos entornos.

## Casos de uso

- Chatbots de atencion al cliente: el modelo puede gestionar conversaciones de soporte basico en ingles, con tiempos de respuesta bajos gracias a su tamano reducido y a las cuantizaciones rapidas como Q4_K_M.
- Asistentes virtuales en dispositivos edge: su huella de memoria (1,4 GB en Q4_K_M) permite ejecutarlo en Raspberry Pi, mini-PCs o portatiles sin GPU dedicada.
- Prototipado rapido de aplicaciones conversacionales: los desarrolladores pueden integrarlo en entornos de desarrollo local para validar flujos de dialogo antes de escalar a modelos mayores.
- Generacion de respuestas en aplicaciones de mensajeria: adecuado para bots de Telegram, Discord o Slack que requieran respuestas contextuales sin latencia elevada.
- Analisis de sentimiento y clasificacion de texto: aunque no esta especializado, puede adaptarse con fine-tuning para tareas de NLP basico en ingles.
- Educacion y aprendizaje: util como tutor conversacional para practicar ingles o explicar conceptos sencillos, gracias a su licencia permisiva y facil despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K u otras pruebas estandar en la model card de este repositorio ni en la del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,1 GB (Q2_K) y 4,0 GB (f16), segun la cuantizacion elegida.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., GTX 1650, RTX 3050) para cuantizaciones Q4 o superiores. Para f16 se recomienda 6 GB o mas.
- Compatibilidad con consumer GPU: si, todas las cuantizaciones caben en GPUs de gama media actuales. Incluso puede ejecutarse solo con CPU usando llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptacion) y cualquier motor compatible con GGUF.
- Latencia y throughput: no disponible, pero al ser un modelo de 2B, se espera una generacion de 20-40 tokens/s en CPU moderna y 50-100 tokens/s en GPU de gama media con cuantizacion Q4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nomi-2-Mini (este) | 1,94B | no disponible | Apache 2.0 | GGUF | Basado en Qwen3.5, multimodal |
| Qwen2.5-1.5B | 1,54B | 32K | Apache 2.0 | Safetensors, GGUF | Modelo base de referencia, sin multimodal |
| Phi-3-mini | 3,8B | 128K | MIT | Safetensors, GGUF | Mayor tamano, mejor rendimiento en razonamiento |
| Llama-3.2-1B | 1,23B | 128K | Llama 3.2 | Safetensors, GGUF | Alternativa ligera de Meta |

La comparativa se basa en datos publicos de cada modelo. Nomi-2-Mini destaca por su soporte multimodal y su origen en Qwen3.5, aunque carece de informacion publica sobre su contexto maximo.

## Limitaciones y advertencias

- Idioma limitado: solo soporta ingles, lo que impide su uso en aplicaciones multilingues.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en contextos largos o temas especializados.
- Sin datos de sesgos: no se ha publicado informacion sobre evaluaciones de sesgo o toxicidad.
- Contexto desconocido: la longitud maxima de contexto no esta documentada, lo que dificulta planificar aplicaciones que requieran ventanas largas.
- Cuantizaciones estaticas: los ficheros GGUF no usan imatrix, por lo que la calidad puede ser ligeramente inferior a cuantizaciones con matrices de importancia.
- Soporte multimodal limitado: los ficheros mmproj estan disponibles, pero no se especifica que tipos de imagen o resoluciones soporta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Nomi-2-Mini-GGUF
- Modelo base: https://huggingface.co/JallyAI/Nomi-2-Mini
- Pagina de ayuda de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
