# bartowski/tattrongvu_Jeffan-31b-1710-GGUF

## Resumen

Jeffan-31b-1710 es un modelo de lenguaje multimodal de 31B parametros desarrollado por tattrongvu, basado en la arquitectura Gemma 4 segun las etiquetas del repositorio. La version analizada en esta ficha es la cuantizacion GGUF publicada por bartowski, un cuantizador muy conocido en la comunidad por sus conversiones con matriz de importancia (imatrix) mediante llama.cpp. El modelo se etiqueta con el pipeline "any-to-any", lo que sugiere soporte de entrada y salida multimodal, y la model card indica soporte de entrada de texto, imagen y audio (este ultimo mediante un archivo mmproj).

El modelo destaca por su formato de prompt con canal de razonamiento explicito (`<|channel>thought`), similar a los modelos con "thinking mode", y por incluir soporte de declaraciones de herramientas (tool calling) en su plantilla de prompt. Las etiquetas "decision-making" y "multiple-choice" sugieren un entrenamiento orientado a tareas de decision y respuesta de opcion multiple. Con licencia Apache 2.0, es apto para uso comercial sin restricciones relevantes, lo que lo hace interesante para despliegues locales en hardware de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer, segun tags del repositorio) |
| Parametros totales | 30.697.345.596 (aprox. 31B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M y otras inferiores (lista truncada en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado por bartowski con llama.cpp b11845 e imatrix); original en safetensors |

## Arquitectura y entrenamiento

El modelo base es tattrongvu/Jeffan-31b-1710, con unos 30,7 mil millones de parametros segun el checkpoint en safetensors. Las etiquetas del repositorio lo vinculan a la familia Gemma 4, aunque no se ha publicado informacion detallada sobre la arquitectura exacta (numero de capas, cabezas de atencion, uso de GQA, etc.). La model card de la cuantizacion indica que no soporta decodificacion especulativa, y que las entradas de imagen y audio requieren el archivo mmproj correspondiente.

No hay informacion disponible sobre el dataset de entrenamiento (numero de tokens, composicion) ni sobre el uso de tecnicas de alineacion como RLHF o DPO. Las etiquetas "decision-making" y "multiple-choice" apuntan a un ajuste fino orientado a tareas de toma de decisiones y seleccion de respuestas, pero no hay documentacion oficial que lo confirme. La cuantizacion de bartowski utiliza imatrix (matriz de importancia) calculada con llama.cpp, lo que mejora la calidad de las cuantizaciones bajas al ponderar los pesos mas sensibles.

## Capacidades

- Generacion de texto conversacional, con formato de prompt propio basado en turnos (`<|turn>user`, `<|turn>model`).
- Canal de razonamiento explicito ("thinking mode") mediante el token `<|channel>thought`, que permite separar el razonamiento interno de la respuesta final.
- Entrada multimodal: texto, imagen y audio (audio e imagen requieren el archivo mmproj).
- Tool calling / function calling: la plantilla de prompt incluye soporte nativo para declaraciones de herramientas con parametros tipados.
- Tareas de decision y respuesta de opcion multiple, segun las etiquetas del repositorio.
- Despliegue en llama.cpp y derivados gracias al formato GGUF con cuantizaciones desde IQ3 hasta bf16.

## Casos de uso

- **Asistentes conversacionales locales**: el formato de turnos y el canal de razonamiento permiten construir chatbots que muestran (o ocultan) su proceso de pensamiento, ejecutable en una sola GPU de 24 GB con Q4_K_M.
- **Agentes con llamadas a herramientas**: el soporte nativo de declaraciones de herramientas en el prompt permite integrarlo en frameworks de agentes para consultar APIs, buscar informacion o ejecutar acciones en flujos multi-paso.
- **Sistemas de decision y evaluacion de opciones**: las etiquetas "decision-making" y "multiple-choice" sugieren su uso como evaluador o juez (LLM-as-a-judge) en pipelines donde se debe elegir entre alternativas.
- **Procesamiento multimodal de imagen**: con el mmproj adecuado, puede describir, analizar o responder preguntas sobre imagenes en entornos locales sin depender de APIs externas.
- **Transcripcion o analisis de audio**: la entrada de audio (con mmproj) habilita casos como resumen de grabaciones o respuesta a consultas habladas, todo en un unico modelo.
- **Despliegue en edge con hardware limitado**: la gama de cuantizaciones (IQ3_M a 16,4 GB) permite ejecutar el modelo en estaciones de trabajo con 24 GB de VRAM o incluso en configuraciones con descarga parcial a RAM.
- **Investigacion sobre cuantizacion**: al ser una coleccion completa de quants con imatrix, es util como banco de pruebas para comparar la degradacion de calidad entre niveles de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache ni mmproj):
  - IQ3_M: ~16,4 GB; IQ4_XS: ~17,2 GB; Q4_K_M: ~19,5 GB; Q5_K_M: ~23,5 GB; Q6_K: ~27 GB; Q8_0: ~32,6 GB; bf16: ~61,4 GB.
- GPU recomendadas:
  - Q4_K_M o inferiores: cabe en una RTX 3090 o RTX 4090 (24 GB), dejando margen justo para contexto corto.
  - Q5/Q6: RTX 4090 con offload parcial a RAM, o GPU de 32-48 GB (RTX 5090, A6000, A100 40 GB).
  - Q8_0 y bf16: A100 80 GB o H100, o multi-GPU.
- Consumer GPU: si cabe en una RTX 3090/4090 con cuantizaciones de 4 bits, aunque el contexto util sera limitado por la KV cache.
- Opciones de despliegue: llama.cpp (formato nativo de estos archivos), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No consta compatibilidad verificada con vLLM o TGI para los archivos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Licencia | Formato |
|---|---|---|---|---|
| Jeffan-31b-1710 | 31B | texto, imagen, audio (mmproj) | Apache 2.0 | GGUF / safetensors |
| Gemma 3 27B (Google) | 27B | texto, imagen | Gemma license (restricciones) | safetensors / GGUF |
| Qwen2.5-VL 32B (Alibaba) | 32B | texto, imagen | Apache 2.0 | safetensors / GGUF |

Jeffan-31b-1710 compite en la franja de 27-34B con Gemma 3 27B y Qwen2.5-VL 32B. Frente a Gemma 3 27B ofrece una licencia mas permisiva (Apache 2.0) y, segun sus tags, entrada de audio ademas de imagen; frente a Qwen2.5-VL comparte licencia y rango de parametros. No hay datos de benchmarks que permitan comparar rendimiento real.

## Limitaciones y advertencias

- No hay documentacion oficial del modelo base: desconocemos dataset de entrenamiento, longitud de contexto, idiomas y metodo de alineacion, lo que dificulta evaluar su fiabilidad para produccion.
- Al ser un modelo de autor comunitario con descargas y likes limitados en el repo de cuantizacion, no existe una comunidad amplia que haya validado su calidad; se recomienda evaluacion propia antes de uso serio.
- Riesgo de alucinacion: no disponible, pero aplicable por defecto a cualquier LLM de esta clase.
- La entrada de imagen y audio depende del archivo mmproj; sin el, el modelo funciona solo con texto.
- No soporta decodificacion especulativa segun la model card, lo que puede limitar el throughput en algunas configuraciones.
- La lista de archivos en la model card esta truncada, por lo que existen cuantizaciones adicionales por debajo de Q3_K_M no detalladas aqui.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque conviene verificar la procedencia del modelo base y su cumplimiento de licencias de datos de entrenamiento (no disponible).

## Enlaces

- Cuantizacion GGUF (bartowski): https://huggingface.co/bartowski/tattrongvu_Jeffan-31b-1710-GGUF
- Modelo original: https://huggingface.co/tattrongvu/Jeffan-31b-1710
- llama.cpp (herramienta de cuantizacion): https://github.com/ggml-org/llama.cpp/
- Release b11845 de llama.cpp: https://github.com/ggml-org/llama.cpp/releases/tag/b11845
- Paper, blog o demo oficial: no disponible
