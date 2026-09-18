# ijohn07/Huihui-NeoHorse-1-4B-abliterated-Q8_0-GGUF

## Resumen

Esta ficha describe `ijohn07/Huihui-NeoHorse-1-4B-abliterated-Q8_0-GGUF`, una conversión al formato GGUF del modelo `huihui-ai/Huihui-NeoHorse-1-4B-abliterated`. El repositorio lo publica el usuario `ijohn07` y se generó automáticamente con el espacio `gguf-my-repo` de ggml.ai, que convierte pesos de HuggingFace a GGUF empleando llama.cpp. No se trata, por tanto, de un entrenamiento nuevo ni de un ajuste adicional: es una recuantización a Q8_0 del modelo base, pensada para su ejecución con llama.cpp, Ollama, LM Studio u otros motores compatibles con GGUF.

El modelo subyacente pertenece a la familia NeoHorse en su variante de 4B y ha sido sometido a un proceso de "abliteration", una técnica que elimina o atenúa la dirección de rechazo en el espacio de activaciones para reducir las negativas del modelo a determinadas peticiones. El repositorio se etiqueta explícitamente como `abliterated`, `uncensored`, `agentic`, `tool-use`, `coding`, `reasoning` e `instruction-following`, lo que indica la orientación funcional declarada por el autor. Los pesos del modelo base suman 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), con licencia Apache 2.0.

Su relevancia práctica es doble. Por un lado, ofrece un modelo de 4B cuantizado a 8 bits (fichero de unos 4,5 GB) que cabe en GPUs de gama media y en equipos con memoria unificada, lo que facilita el despliegue local. Por otro, al estar basado en un modelo abliterado, resulta de interés para quienes necesitan un modelo sin filtros de rechazo para investigación sobre alineación, generación creativa sin restricciones temáticas o evaluación de sesgos. El contrapeso es que el repositorio no aporta información sobre arquitectura, contexto nativo, composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura del modelo base) |
| Parámetros totales | 4.205.751.296 (≈4,2 B), según los pesos safetensors del modelo base |
| Parámetros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, pero es una invocación de ejemplo, no una especificación del modelo) |
| Tipos de cuantización | Q8_0 (única variante publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `huihui-neohorse-1-4b-abliterated-q8_0.gguf`) |
| Tamaño del repositorio | 4,5 GB |
| Pipeline | text-generation |
| Modelo base | huihui-ai/Huihui-NeoHorse-1-4B-abliterated |
| Fecha de creación (metadatos HF) | 2026-09-18 |

## Arquitectura y entrenamiento

La información disponible no incluye detalles de arquitectura. Lo único verificable es que este repositorio es una conversión de formato: los pesos originales del modelo base `huihui-ai/Huihui-NeoHorse-1-4B-abliterated` se transformaron a GGUF mediante llama.cpp a través del espacio `gguf-my-repo`. Se desconoce si el modelo base emplea una arquitectura transformer densa convencional, un esquema MoE, atención lineal o cualquier otra variante, así como el número de capas, dimensiones ocultas o tipo de tokenizador.

Tampoco hay datos sobre el entrenamiento: no se indica el número de tokens, la composición del dataset, la existencia de fases de RLHF, DPO u otras técnicas de alineación, ni el procedimiento concreto de abliteración aplicado. La única innovación técnica documentada de forma explícita es la propia abliteración, que en la práctica se implementa modificando los pesos para suprimir la dirección de activación asociada al rechazo de peticiones. Se desconoce igualmente el proceso de destilación o ajuste que dio lugar a la variante NeoHorse.

## Capacidades

- Generación de texto conversacional, con el pipeline declarado `text-generation`.
- Uso como agente: el repositorio incluye las etiquetas `agentic` y `tool-use`, que declaran compatibilidad con flujos de llamada a herramientas, aunque no se documenta el formato exacto de plantilla ni si se ha validado con un tokenizador de chat concreto.
- Generación y asistencia en código: etiqueta `coding`.
- Razonamiento e instrucciones: etiquetas `reasoning` e `instruction-following`.
- Modelo abliterado: se han atenuado los mecanismos de rechazo, por lo que responde a peticiones que un modelo alineado convencional rechazaría. Esto no implica ausencia de sesgos ni garantiza corrección factual.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas soportados.
- Visión, audio u otras modalidades: no disponible; las etiquetas solo apuntan a texto.
- Modo "thinking" o razonamiento extendido: no disponible.
- Inferencia local: compatible con llama.cpp mediante CLI (`llama-cli`) y servidor (`llama-server`), con carga desde el Hub vía `--hf-repo` y `--hf-file`.

## Casos de uso

- Despliegue local en portátil o equipo de sobremesa: el fichero Q8_0 ocupa unos 4,5 GB y puede ejecutarse con llama.cpp u Ollama en máquinas sin GPU dedicada, usando CPU y memoria RAM suficiente (8 GB o más recomendables).
- Asistente conversacional en el borde (edge): al caber en GPUs consumer, sirve como chatbot integrado en aplicaciones de escritorio o dispositivos con memoria unificada, sin dependencia de APIs externas ni coste por token.
- Agente con llamada a herramientas en prototipos: con las etiquetas `agentic` y `tool-use`, puede emplearse en prototipos de agentes que consulten APIs o ejecuten funciones, siempre que se valide previamente la plantilla de chat y el formato de las llamadas, ya que la model card no lo especifica.
- Generación de código en herramientas de desarrollo: para autocompletado, generación de fragmentos, explicación de errores o refactorización local en editores, manteniendo el código dentro de la infraestructura del usuario.
- Investigación sobre alineación y seguridad: al ser un modelo abliterado, permite estudiar cómo cambia el comportamiento al eliminar la dirección de rechazo, comparar respuestas con la versión alineada y analizar qué sesgos emergen con mayor facilidad.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o material narrativo que aborde temas que los modelos alineados suelen declinar, ámbito en el que la abliteración es el rasgo funcional buscado.
- Experimentación académica con pocos recursos: al tratarse de un 4B cuantizado, es adecuado para prácticas docentes de cuantización, evaluación de modelos y ajuste fino sobre hardware modesto (por ejemplo, con LoRA).
- Procesamiento por lotes de textos: clasificación, resumen o extracción de información sobre corpus locales donde la privacidad impide enviar los datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio se limita a las instrucciones de uso con llama.cpp y remite a la model card del modelo base, que no se ha incluido en la información proporcionada. No se dispone de datos de MMLU, HumanEval, GSM8K ni de evaluaciones de agentes o tool calling para este modelo ni para su versión base. Tampoco hay mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB para los pesos Q8_0, más la memoria correspondiente al contexto y al caché KV. Como referencia práctica, entre 5 y 7 GB de VRAM para contextos moderados; la cifra exacta depende de la longitud de contexto configurada, que no está documentada.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 3080, A10, L4, entre otras). En GPU con 8 GB o más cabe sin necesidad de descargar capas a CPU.
- Compatibilidad con GPU consumer: sí, es uno de los puntos fuertes del modelo. También funciona en CPU, y en equipos Apple Silicon con memoria unificada (M1/M2/M3 con 8 GB o más).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp y cualquier motor que lea GGUF. El repo declara la etiqueta `endpoints_compatible`, orientada a despliegues tipo Inference Endpoints. El soporte de GGUF en vLLM es parcial y experimental; TGI no está pensado para GGUF, por lo que para esos motores convendría partir de los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependen por completo del hardware, del backend y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de especificaciones de contexto e idiomas para este modelo, por lo que la comparación se limita a los aspectos documentados.

| Modelo | Parámetros | Cuantización / formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ijohn07/Huihui-NeoHorse-1-4B-abliterated-Q8_0-GGUF (este modelo) | 4,21 B | Q8_0, GGUF | no disponible | Apache 2.0 | Repositorio GGUF en HuggingFace |
| huihui-ai/Huihui-NeoHorse-1-4B-abliterated (modelo base) | 4,21 B | safetensors en precisión original | no disponible | Apache 2.0 (según este repo) | HuggingFace |
| Otras variantes abliteradas de ~4B (por ejemplo, derivadas de Qwen, Llama o Mistral) | no disponible | GGUF o safetensors | no disponible | variable según modelo original | HuggingFace |

En la información proporcionada no hay resultados de benchmarks de este modelo ni de sus alternativas, ni datos de rendimiento comparado, por lo que no es posible establecer una comparación cuantitativa. Como referencia cualitativa, la ventaja de esta ficha es la cuantización Q8_0 lista para llama.cpp, que evita al usuario el paso de conversión.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. Un modelo abliterado tiende a reproducir con mayor facilidad contenido estereotipado, ofensivo o sesgado, al haberse reducido los mecanismos de rechazo; no debe desplegarse en aplicaciones orientadas al público sin una capa adicional de moderación.
- Riesgo de alucinación: no cuantificado. En modelos de 4B el riesgo de inventar hechos, referencias o APIs es habitualmente elevado, y no hay evaluaciones publicadas que lo acoten.
- Comportamiento derivado de la abliteración: la supresión de la dirección de rechazo puede degradar capacidades generales, afectar a la coherencia en tareas de razonamiento o producir respuestas inseguras. No existe información sobre el método exacto aplicado ni sobre su impacto medido.
- Limitaciones de contexto e idioma: se desconocen tanto la ventana de contexto nativa como los idiomas soportados. El ejemplo de la model card con `-c 2048` no debe interpretarse como el máximo del modelo.
- Trazabilidad limitada: el repositorio no incluye dataset card, informe técnico ni detalles de entrenamiento; solo remite al modelo base. Las etiquetas `agentic`, `coding` y `reasoning` son declaraciones del autor sin evaluación publicada que las respalde.
- Licencia: Apache 2.0, que permite uso comercial. No obstante, conviene verificar la licencia del modelo base y de los datos de entrenamiento originales antes de un despliegue comercial, ya que la cadena de derivación no está documentada por completo.
- Cuantización única: solo se publica Q8_0. No hay variantes Q4_K_M, Q5_K_M ni otras, lo que limita el ajuste fino entre calidad y consumo de memoria.
- Adopción nula: el repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta (metadatos de HuggingFace), por lo que no existe validación por parte de la comunidad.
- Conversión automática: el proceso se realizó con el espacio `gguf-my-repo`, sin que se documenten pruebas de calidad posteriores a la conversión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ijohn07/Huihui-NeoHorse-1-4B-abliterated-Q8_0-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-NeoHorse-1-4B-abliterated
- Espacio de conversión GGUF utilizado: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; únicamente aparecieron páginas corporativas de Microsoft sin relación con la ficha. No se han localizado papers, blogs ni demos asociados.
