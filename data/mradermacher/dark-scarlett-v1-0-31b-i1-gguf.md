# mradermacher/Dark-Scarlett-v1.0-31B-i1-GGUF

## Resumen

Dark-Scarlett-v1.0-31B es un modelo de lenguaje de 30.7 mil millones de parámetros desarrollado por ReadyArt, especializado en roleplay, conversación y contenido instructivo. Este repositorio concreto contiene las cuantizaciones GGUF con imatrix realizadas por mradermacher, que permiten ejecutar el modelo en hardware de consumo con pérdida mínima de calidad. El modelo base está construido sobre la arquitectura Gemma-4, lo que le proporciona capacidades multimodales y de razonamiento avanzadas.

La relevancia de este modelo radica en su naturaleza "unaligned" (sin alineación), orientada a casos de uso de roleplay adulto y conversación sin restricciones. Al estar licenciado bajo Apache-2.0, ofrece una opción legalmente permisiva para desarrolladores que necesitan un modelo conversacional de gran tamaño sin las restricciones típicas de los modelos propietarios. La disponibilidad de múltiples niveles de cuantización (desde IQ2_M hasta Q6_K) permite adaptar el despliegue a diferentes capacidades de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4 (transformer) |
| Parametros totales | 30.697.345.596 (30.7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base Dark-Scarlett-v1.0-31B se construye sobre la arquitectura Gemma-4, que emplea un transformer denso con mecanismos de atencion por ventanas deslizantes y atencion global alternada. Esta arquitectura, desarrollada por Google, esta disenada para ofrecer rendimiento de nivel frontier en tareas de razonamiento, codificacion y comprension multimodal. El modelo incorpora capacidades de vision, lo que le permite procesar entradas de imagen ademas de texto.

Los detalles especificos del entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. Sin embargo, el etiquetado como "instruct" y "conversational" sugiere que fue sometido a un proceso de ajuste fino supervisado para tareas de dialogo. La naturaleza "unaligned" indica que se elimino o redujo el proceso de alineacion con valores humanos, lo que permite respuestas sin censura en temas adultos.

## Capacidades

- Generacion de texto conversacional fluido y contextual para roleplay y narrativa interactiva
- Soporte de instrucciones (instruct) para tareas dirigidas
- Capacidades multimodales de vision (procesamiento de imagenes) segun la arquitectura Gemma-4
- Conversacion multi-turno con memoria de contexto
- Generacion de contenido creativo y narrativo sin restricciones tematicas
- Comprension y generacion en ingles principalmente
- Capacidad de seguir instrucciones complejas y mantener coherencia en dialogos largos
- Soporte de contenido adulto y explicito (sin censura)

## Casos de uso

- Roleplay interactivo: el modelo puede mantener personajes consistentes en sesiones de roleplay prolongadas, recordando detalles de la historia y respondiendo de forma coherente con la personalidad del personaje.
- Creacion de narrativa erotica: su naturaleza unaligned permite generar contenido adulto explicito bajo demanda, util para escritores que necesitan explorar escenas sin restricciones.
- Asistente de escritura creativa: puede ayudar a desarrollar dialogos, tramas y personajes en proyectos de ficcion, ofreciendo sugerencias estilisticas variadas.
- Simulacion de personajes para juegos: integrable en motores de juego para dotar a NPCs de conversaciones naturales y adaptativas con jugadores.
- Chatbot de compania: su capacidad conversacional permite mantener interacciones largas y personalizadas, aunque con contenido potencialmente adulto.
- Generacion de contenido para comunidades: util para moderadores o creadores que necesitan generar material de discusion o prompts para otras herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye datos de evaluacion como MMLU, HumanEval o GSM8K. La ausencia de metricas oficiales impide comparar objetivamente su rendimiento con otros modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 GB (cuantizacion i1-IQ2_M) y 25.3 GB (cuantizacion i1-Q6_K)
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4_K_M o inferiores; A100 40 GB o H100 para cuantizaciones superiores
- Cabe en GPUs de consumo: si, con cuantizaciones i1-IQ2_M (11 GB), i1-Q3_M (14.5 GB) o i1-Q4_K_S (17.9 GB) en tarjetas con 16-24 GB de VRAM
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp (por formato GGUF)
- Latencia y throughput: no disponible, dependera del hardware y la cuantizacion elegida

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Dark-Scarlett-v1.0-31B | 30.7B | no disponible | Apache-2.0 | GGUF | Roleplay, unaligned |
| huihui_ai/gemma-4-abliterated | no disponible | no disponible | no disponible | GGUF | Abliterated, sin censura |
| ReadyArt/Dark-Scarlett-v1.0-31B-GGUF | 30.7B | no disponible | Apache-2.0 | GGUF | Version estatica del mismo modelo |

La comparativa se limita a modelos de la misma familia Gemma-4 con enfoque similar. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Contenido adulto: el modelo esta disenado para generar contenido explicito y maduro, lo que puede resultar inapropiado para muchos entornos de produccion.
- Sesgos potenciales: al ser un modelo unaligned, puede reflejar sesgos presentes en sus datos de entrenamiento sin filtros de seguridad.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inconsistente, especialmente en contextos largos.
- Idioma limitado: solo soporta ingles de forma fiable; el rendimiento en otros idiomas no esta garantizado.
- Sin datos de contexto: la longitud de contexto no esta documentada, lo que dificulta planificar su uso en aplicaciones que requieran ventanas largas.
- Licencia Apache-2.0: permite uso comercial, pero el contenido generado puede tener implicaciones legales segun la jurisdiccion.
- Sin benchmarks publicados: no hay evidencia objetiva de su calidad relativa frente a otros modelos.

## Enlaces

- Repositorio GGUF con imatrix: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-31B-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-31B
- Version GGUF estatica: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-31B-GGUF
- Version GGUF de ReadyArt: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-31B-GGUF
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
