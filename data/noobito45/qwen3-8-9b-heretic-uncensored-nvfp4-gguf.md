# Noobito45/Qwen3.8-9B-heretic-uncensored-NVFP4-GGUF

## Resumen

Qwen3.8-9B-heretic-uncensored-NVFP4-GGUF es una versión cuantizada en formato GGUF del modelo Qwen3.8-9B-heretic-uncensored, desarrollada por Noobito45. El modelo base, creado por rohit267, es a su vez una variante "decensored" (sin censura) de Qwen3.8-9B de Empero, obtenida mediante el proceso Heretic v1.4.0, una técnica de abliteración que elimina los rechazos y restricciones de seguridad del modelo original.

El modelo subyacente Qwen3.8-9B es una destilación full-parameter del teacher Qwen3.8 2.4T A95B (un modelo de escala frontier) sobre la arquitectura Qwen3.5-9B. Se entrenó con aproximadamente 70.000 trazas de razonamiento del teacher, con énfasis en matemáticas, código y razonamiento general. Hereda una ventana de contexto nativa de 262.144 tokens y soporte nativo de function calling según la especificación de Qwen3.5.

Esta versión concreta aplica cuantización NVFP4 (4 bits en punto flotante para GPUs Blackwell) y se distribuye en formato GGUF, lo que permite su ejecución en hardware consumer de última generación con llama.cpp, Ollama u otros motores compatibles. La licencia es Apache-2.0, lo que facilita su uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (causal LM, rama de texto de una base vision-language) |
| Parametros totales | 8.953.803.664 (~9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | NVFP4 (4 bits en punto flotante, GGUF) |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizacion NVFP4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-9B es una destilacion full-parameter del teacher Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-9B. Se trata de un transformer causal denso de 9B parametros, entrenado mediante SFT (off-policy distillation) con aproximadamente 70.000 trazas de razonamiento del teacher, filtradas por calidad. Las trazas cubren matematicas, codigo, razonamiento general, seguimiento de instrucciones y uso de herramientas. Cada respuesta comienza con un bloque `thinking` aprendido directamente de las trazas del teacher, no generado sinteticamente.

La arquitectura Qwen3.5-9B incorpora atencion lineal (kernels de flash-linear-attention y causal_conv1d), lo que contribuye a la ventana de contexto de 262.144 tokens. El modelo hereda el comportamiento de vision de la base Qwen3.5, aunque el fine-tune de destilacion es solo de texto y no fue evaluado en tareas visuales.

La variante "heretic" aplica abliteracion con Heretic v1.4.0 sobre el modelo destilado, eliminando los mecanismos de rechazo y censura. Esto no modifica los pesos de forma sustancial, pero altera la activacion de las capas responsables de generar respuestas de rechazo.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento destilada: cada respuesta abre con un bloque `thinking` que reproduce el estilo de razonamiento del teacher Qwen3.8 2.4T.
- Razonamiento matematico y de codigo reforzado: el mix de trazas de entrenamiento esta deliberadamente ponderado hacia matematicas dificiles y programacion competitiva.
- Function calling nativo segun la especificacion de Qwen3.5, sin necesidad de fine-tune adicional ni wrappers.
- Ventana de contexto larga de 262.144 tokens, adecuada para documentos extensos, repositorios de codigo o conversaciones multi-turno prolongadas.
- Capacidad multilingue limitada: la model card declara solo ingles, aunque la base Qwen3.5 podria soportar otros idiomas; no hay garantia.
- Ausencia de censura: el proceso Heretic elimina los rechazos, permitiendo generar contenido que el modelo original bloquearia.
- Compatible con motores de inferencia que soporten GGUF y cuantizacion NVFP4 (llama.cpp, Ollama, etc.).

## Casos de uso

- Generacion de codigo en produccion: el modelo soporta function calling nativo y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests. Su enfasis en programacion competitiva lo hace util para algoritmos y estructuras de datos.
- Razonamiento matematico asistido: gracias a la destilacion de trazas de matematicas del teacher, puede resolver problemas de calculo, algebra o demostraciones con cadena de pensamiento explicita.
- Agentes autonomos con herramientas: la ventana de 262.144 tokens y el function calling permiten construir agentes que mantienen contexto largo de interacciones, llaman APIs y ejecutan acciones multi-paso.
- Analisis de vulnerabilidades y seguridad ofensiva: el modelo "uncensored" puede analizar codigo C++, Python o XRPL en busca de fallos de seguridad sin rechazar consultas sobre exploits, como demuestra el proyecto Qwen3.8-9B Cyber Exploit Agent.
- Investigacion academica sin restricciones: para estudios sobre sesgos, alucinacion o comportamiento de modelos sin capas de seguridad, este modelo permite experimentar con generacion libre de rechazos.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, puede resumir, extraer informacion o responder preguntas sobre libros, informes tecnicos o bases de conocimiento extensas en una sola pasada.
- Prototipado de chatbots conversacionales: su formato GGUF y cuantizacion NVFP4 permiten desplegarlo en hardware consumer para pruebas rapidas de asistentes con personalidad sin filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Empero no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K, etc.) y la variante heretic tampoco aporta datos numericos. Se recomienda evaluar el modelo con el lm-evaluation-harness de EleutherAI, mencionado en los creditos, para obtener metricas propias.

## Requisitos de hardware

- VRAM estimada: el repo pesa 7.0 GB, por lo que la cuantizacion NVFP4 de 9B parametros cabe en GPUs con 8-12 GB de VRAM, dependiendo del contexto utilizado.
- GPU recomendadas: NVFP4 es una cuantizacion disenada para GPUs Blackwell (RTX 50xx, B200, etc.). En GPUs Ampere o Ada (RTX 30xx/40xx) puede no ser soportada nativamente; se requeriria convertir a otra cuantizacion GGUF (Q4_K_M, Q5_K_M, etc.).
- En consumer GPU: si se dispone de una RTX 5070 o superior con 12 GB o mas, el modelo puede ejecutarse con contexto moderado. Para contexto completo de 262.144 tokens se necesitaria mucha mas VRAM (probablemente 48 GB o mas).
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (si soporta NVFP4), o cualquier motor compatible con GGUF.
- Latencia y throughput: no disponible. Depende del hardware, la longitud de contexto y el motor de inferencia. El modelo genera un bloque `thinking` antes de cada respuesta, lo que incrementa el numero de tokens por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-9B-heretic-uncensored (este) | 9B | 262.144 | Apache-2.0 | GGUF NVFP4 | Destilado de Qwen3.8 2.4T, sin censura |
| Qwen3.5-9B (base) | 9B | 262.144 | Apache-2.0 | Safetensors | Modelo original de Alibaba, con censura estandar |
| Qwen3-8B | 8B | 32.768 (ampliable a 131.072) | Apache-2.0 | Safetensors/GGUF | Generacion anterior, sin destilacion de teacher frontier |

La comparativa es cualitativa porque no hay benchmarks publicados. La principal diferencia frente a Qwen3.5-9B es la destilacion del teacher Qwen3.8 2.4T y la eliminacion de censura. Frente a Qwen3-8B, este modelo ofrece el doble de contexto nativo y un razonamiento destilado de mayor calidad, aunque con un coste de generacion mayor por el bloque `thinking`.

## Limitaciones y advertencias

- Ausencia de censura: el modelo puede generar contenido ofensivo, ilegal o peligroso. No es apto para aplicaciones orientadas al publico general sin capas de moderacion externas.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, citas o codigo incorrecto. La destilacion no elimina este riesgo.
- Idioma limitado: la model card declara solo ingles. El rendimiento en otros idiomas no esta garantizado y probablemente sea inferior.
- Comportamiento de vision no evaluado: el fine-tune es solo de texto; las capacidades visuales heredadas de la base Qwen3.5 no fueron validadas en esta variante.
- Repeticion en decodificacion greedy: la model card advierte que la decodificacion greedy en generaciones largas produce bucles de repeticion. Se recomienda sampling con `temperature=0.6, top_p=0.95, top_k=20`.
- Sobre-razonamiento: el modelo tiende a deliberar en exceso en preguntas faciles, lo que aumenta la latencia y el coste de inferencia.
- Compatibilidad de hardware: NVFP4 requiere GPUs Blackwell; en hardware anterior habra que convertir a otra cuantizacion GGUF.
- Licencia Apache-2.0 permite uso comercial, pero el origen "uncensored" puede implicar riesgos legales o eticos segun el caso de uso.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/Noobito45/Qwen3.8-9B-heretic-uncensored-NVFP4-GGUF
- Modelo base (rohit267): https://huggingface.co/rohit267/Qwen3.8-9B-heretic-uncensored
- Modelo original de Empero: https://huggingface.co/empero-ai/Qwen3.8-9B
- Base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Proyecto Heretic: https://heretic-project.org
- Ejemplo de agente de ciberseguridad sobre este modelo: https://github.com/Krypto-Whitehat/qwen3.8-9b-cyber-exploit-agent-uncensored
- Endpoint de inferencia de FriendliAI: https://friendli.ai/models/rohit267/Qwen3.8-9B-heretic-uncensored
