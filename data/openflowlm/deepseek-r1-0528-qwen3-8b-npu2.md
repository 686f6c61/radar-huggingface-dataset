# OpenFlowLM/DeepSeek-R1-0528-Qwen3-8B-NPU2

## Resumen

DeepSeek-R1-0528-Qwen3-8B-NPU2 es un checkpoint publicado por el usuario OpenFlowLM en HuggingFace, que toma como base el modelo deepseek-ai/DeepSeek-R1-0528-Qwen3-8B. Se trata, por tanto, de una redistribucion de terceros (con el sufijo "NPU2" en el nombre, cuyo significado no se documenta) del destilado oficial de DeepSeek: un Qwen3 8B Base post-entrenado con las cadenas de razonamiento (chain-of-thought) generadas por DeepSeek-R1-0528.

El modelo subyacente es un transformer denso de aproximadamente 8 000 millones de parametros, derivado de la familia Qwen3, orientado a generacion de texto, razonamiento y conversacion. Segun la model card heredada, este destilado alcanza rendimiento estado del arte entre modelos abiertos en AIME 2024, superando a Qwen3 8B en +10,0 puntos porcentuales y equiparandose a Qwen3-235B-thinking en esa prueba.

Su relevancia practica esta en que concentra capacidades de razonamiento de la familia R1 en un tamano (8B) desplegable en una unica GPU de consumo, con licencia MIT. Ahora bien, la model card del repositorio de OpenFlowLM es una copia literal de la model card oficial de DeepSeek y no aporta informacion especifica sobre que se ha modificado respecto al modelo base, ni sobre el proposito del sufijo NPU2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3 8B; no se detalla en la model card de este repositorio) |
| Parametros totales | Aproximadamente 8 000 millones (segun el nombre del modelo y el modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para este checkpoint (el modelo base Qwen3-8B declara 32 768 tokens nativos ampliables con YaRN; no confirmado aqui) |
| Tipos de cuantizacion | No disponible (el repositorio ocupa 12,0 GB y usa la libreria transformers, lo que sugiere pesos en precision completa, pero no se documenta) |
| Idiomas soportados | No disponible |
| Licencia | mit |
| Formato de pesos | No disponible explicitamente; el uso de transformers y un repositorio de 12,0 GB apuntan a safetensors como formato mas probable, sin confirmacion en la model card |
| Pipeline | text-generation |
| Modelo base | deepseek-ai/DeepSeek-R1-0528-Qwen3-8B |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-02 |

## Arquitectura y entrenamiento

El modelo subyacente, DeepSeek-R1-0528-Qwen3-8B, se obtiene destilando la cadena de pensamiento de DeepSeek-R1-0528 sobre Qwen3 8B Base. Es decir, no se trata de una arquitectura MoE ni de un modelo hibrido SSM, sino de un transformer denso de 8B en el que el post-entrenamiento incorpora trazas de razonamiento largo generadas por el modelo profesor. La model card oficial indica que la destilacion del CoT de R1-0528 permite a este 8B alcanzar resultados SOTA en AIME 2024 entre modelos abiertos.

El modelo profesor, DeepSeek-R1-0528, es una revision menor del R1 original que incrementa la profundidad de razonamiento mediante mas recursos de computo y optimizaciones algoritmicas en el post-entrenamiento. Segun la documentacion, en AIME 2025 la precision sube del 70,0 % al 87,5 % y el numero medio de tokens por pregunta pasa de 12K a 23K, lo que evidencia un modo de pensamiento mas largo. Tambien se reporta menor tasa de alucinacion, mejor soporte de function calling y mejor experiencia en "vibe coding".

Para este repositorio concreto (OpenFlowLM/DeepSeek-R1-0528-Qwen3-8B-NPU2) no se documenta ningun detalle adicional de entrenamiento, dataset, numero de tokens, ni si se aplicaron tecnicas como RLHF, DPO o RL verificable sobre el destilado. Tampoco se explica que aporta el sufijo NPU2 ni si los pesos difieren de los del modelo base.

## Capacidades

- Generacion de texto conversacional en formato multi-turno (pipeline text-generation, tag conversational).
- Razonamiento extendido con cadena de pensamiento larga, heredado del proceso de destilacion de R1-0528.
- Razonamiento matematico de competicion: el modelo base destilado se evalua en AIME 2024, HMMT 2025 y CNMO 2024.
- Generacion y resolucion de codigo: el modelo profesor se evalua en LiveCodeBench, Codeforces-Div1, SWE Verified y Aider-Polyglot.
- Soporte de function calling / tool calling mejorado respecto a la version previa de R1, segun la model card del profesor (BFCL_v3_MultiTurn, Tau-Bench).
- Razonamiento multi-paso orientado a agentes, con marcos de evaluacion tipo Agentless y Tau-Bench.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o cualquier otra modalidad: no disponibles (el modelo es exclusivamente de texto).
- Modo thinking explicito: no confirmado en la informacion disponible para este checkpoint.

## Casos de uso

- Asistente de razonamiento tecnico en local: al ser un denso de 8B con licencia MIT, puede desplegarse en una estacion de trabajo con una sola GPU para resolver problemas de logica, matematicas y planificacion sin enviar datos a servicios externos.
- Generacion de codigo en entornos con requisitos de privacidad: el modelo puede integrarse en editores o pipelines de CI/CD para sugerir parches y explicar errores, siempre que el repositorio destino no exponga informacion sensible a terceros.
- Tutorizacion de matematicas: dado el enfasis del destilado en AIME y competiciones, es adecuado para generar soluciones paso a paso verificables por un humano.
- Prototipado de agentes con tool calling: su soporte de function calling permite construir agentes que consulten APIs, calculadoras o bases de datos en varios pasos antes de responder.
- Evaluacion comparativa de destilados: util como linea base local para medir cuanto se pierde frente a modelos mayores en tareas de razonamiento, a coste reducido.
- Procesamiento por lotes de informes o documentacion tecnica: con contexto potencialmente largo (heredado del base Qwen3), puede resumir y estructurar documentos extensos, aunque la longitud real debe verificarse antes de usarlo en produccion.
- Investigacion sobre decodificacion y cuantizacion: al ser un 8B denso, es un banco de pruebas comodo para experimentar con cuantizacion agresiva, decodificacion especulativa y tecnicas de aceleracion.
- Educacion y demos offline: permite montar un chatbot de razonamiento en hardware de consumo para talleres o entornos sin conectividad.

## Benchmarks y rendimiento

La model card del repositorio reproduce la tabla de evaluacion de DeepSeek-R1-0528 (el modelo profesor), no la del destilado de 8B. Los valores del destilado no aparecen completos en la informacion proporcionada; el texto solo afirma que supera a Qwen3 8B en +10,0 puntos en AIME 2024 y que iguala a Qwen3-235B-thinking.

| Categoria | Benchmark (metrica) | DeepSeek R1 | DeepSeek R1 0528 |
|---|---|---|---|
| General | MMLU-Redux (EM) | 92,9 | 93,4 |
| General | MMLU-Pro (EM) | 84,0 | 85,0 |
| General | GPQA-Diamond (Pass@1) | 71,5 | 81,0 |
| General | SimpleQA (Correct) | 30,1 | 27,8 |
| General | FRAMES (Acc.) | 82,5 | 83,0 |
| General | Humanity's Last Exam (Pass@1) | 8,5 | 17,7 |
| Codigo | LiveCodeBench (2408-2505) (Pass@1) | 63,5 | 73,3 |
| Codigo | Codeforces-Div1 (Rating) | 1530 | 1930 |
| Codigo | SWE Verified (Resolved) | 49,2 | 57,6 |
| Codigo | Aider-Polyglot (Acc.) | 53,3 | 71,6 |
| Matematicas | AIME 2024 (Pass@1) | 79,8 | 91,4 |
| Matematicas | AIME 2025 (Pass@1) | 70,0 | 87,5 |
| Matematicas | HMMT 2025 (Pass@1) | 41,7 | 79,4 |
| Matematicas | CNMO 2024 (Pass@1) | 78,8 | 86,9 |
| Herramientas | BFCL_v3_MultiTurn (Acc.) | - | 37,0 |
| Herramientas | Tau-Bench (Pass@1) | - | 53,5 (Airline) / 63,9 (Retail) |

Notas metodologicas declaradas: longitud maxima de generacion de 64K tokens, temperatura 0,6, top-p 0,95 y 16 respuestas por consulta para estimar pass@1. SWE-Verified se evalua con el marco Agentless, HLE solo con prompts de texto y Tau-Bench emplea GPT-4.1 en el rol de usuario.

Para el destilado de 8B no se han publicado resultados numericos detallados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): en torno a 16 GB solo para pesos, mas overhead de contexto; un repositorio de 12,0 GB sugiere pesos ya reducidos, pero no se confirma el formato.
- VRAM estimada en 8 bits: aproximadamente 8-10 GB.
- VRAM estimada en 4 bits (si se genera una cuantizacion GGUF): aproximadamente 5-6 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso local en precision completa.
- Compatibilidad con GPU de consumo: probable en RTX 4090/3090 sin cuantizar, y en RTX 4060 Ti 16 GB o RTX 4070 con cuantizacion de 8/4 bits. No confirmado con datos de pruebas en la informacion proporcionada.
- Opciones de despliegue: transformers (libreria declarada), vLLM o TGI para servicion de alto rendimiento, y llama.cpp/Ollama si se publican pesos en GGUF (no confirmado para este repositorio).
- Latencia y throughput: no disponibles.
- Nota: el sufijo NPU2 sugiere un posible uso en aceleradores NPU, pero no hay documentacion que lo confirme.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenFlowLM/DeepSeek-R1-0528-Qwen3-8B-NPU2 | ~8B denso | No disponible | No publicado para este checkpoint | MIT | HuggingFace, 0 descargas, sin documentacion propia |
| deepseek-ai/DeepSeek-R1-0528-Qwen3-8B | ~8B denso | No disponible en la informacion proporcionada | SOTA abierto en AIME 2024; +10,0 pts sobre Qwen3 8B | MIT | HuggingFace (modelo base oficial) |
| Qwen3 8B (base / thinking) | ~8B denso | No disponible en la informacion proporcionada | Referencia de comparacion del destilado | No disponible en la informacion proporcionada | HuggingFace |
| Qwen3-235B-thinking | 235B | No disponible en la informacion proporcionada | Igualado por el destilado de 8B en AIME 2024, segun la model card | No disponible en la informacion proporcionada | HuggingFace |
| DeepSeek-R1-0528 (profesor) | 671B MoE (37B activos, segun la familia R1) | No disponible en la informacion proporcionada | MMLU-Redux 93,4; AIME 2025 87,5; Codeforces-Div1 1930 | MIT | HuggingFace y chat.deepseek.com |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y su model card es una copia literal de la oficial de DeepSeek: no hay documentacion propia sobre que cambia respecto al modelo base.
- El sufijo NPU2 no esta explicado; se desconoce si implica modificacion de pesos, conversion de formato o solo un cambio de empaquetado.
- No se declaran idiomas soportados, por lo que el rendimiento multilingue es indeterminado.
- No se especifica la longitud de contexto real de este checkpoint; asumir la del base sin verificacion puede provocar degradacion en prompts largos.
- Riesgo de alucinacion: la propia model card del profesor reconoce una tasa de alucinacion (SimpleQA baja de 30,1 a 27,8 respecto a R1), lo que indica que persiste y que en el destilado de 8B puede ser mayor.
- Los modelos de razonamiento largo generan muchas mas tokens por respuesta (23K de media por pregunta en AIME 2025 para el profesor), lo que encarece la inferencia y aumenta la latencia.
- Al ser un destilado de 8B, es esperable una perdida de rendimiento frente al profesor en tareas fuera de los benchmarks de matematicas y codigo, aunque no se cuantifica en la informacion disponible.
- Aunque la licencia declarada es MIT, conviene verificar las condiciones del modelo base y del corpus de destilacion antes de un uso comercial en produccion.
- No hay evidencia publica de adopcion, pruebas de terceros ni soporte del autor original en este repositorio concreto.
- Los resultados de benchmarks mostrados corresponden al modelo profesor, no al destilado; no deben atribuirse a este checkpoint.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OpenFlowLM/DeepSeek-R1-0528-Qwen3-8B-NPU2
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- Organizacion DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
- Paper de DeepSeek-R1 (arXiv 2501.12948): https://arxiv.org/pdf/2501.12948
- Chat oficial: https://chat.deepseek.com/
- Sitio de DeepSeek: https://www.deepseek.com/
- Repositorio de referencia de la familia: https://github.com/deepseek-ai/DeepSeek-V2
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos eran canales de YouTube en tamil sin relacion con el tema.
