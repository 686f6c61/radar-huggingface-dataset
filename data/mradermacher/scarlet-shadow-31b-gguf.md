# mradermacher/Scarlet-Shadow-31B-GGUF

## Resumen

Scarlet-Shadow-31B es un modelo de lenguaje de 30.700 millones de parámetros, resultado de un merge (fusión) de modelos mediante la herramienta mergekit. El modelo original fue creado por Vortex5 y posteriormente cuantizado a formato GGUF por mradermacher para facilitar su ejecución en hardware de consumo. Está orientado principalmente a tareas de roleplay y storytelling, como indican sus etiquetas en HuggingFace.

La versión GGUF aquí descrita incluye múltiples niveles de cuantización (desde Q2_K hasta Q8_0) y dos archivos de proyección multimodal (mmproj), lo que sugiere que el modelo base podría tener capacidades de visión, aunque no se confirma explícitamente. Al ser un modelo derivado de un merge, no se dispone de documentación detallada sobre su arquitectura interna ni sobre los datos de entrenamiento, más allá de que está pensado para conversación y narrativa en inglés.

Su relevancia radica en que ofrece una alternativa de 31B con licencia Apache 2.0, lo que permite uso comercial sin restricciones, y su formato GGUF lo hace desplegable en una amplia gama de entornos, desde GPUs de consumo hasta CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer denso, sin confirmar) |
| Parametros totales | 30.697.345.596 (30,7B) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base Vortex5/Scarlet-Shadow-31B. Por las etiquetas de HuggingFace, se sabe que fue creado mediante mergekit, una herramienta que combina multiples modelos existentes mediante tecnicas como interpolacion de pesos o composicion de capas. No se especifican los modelos originales que se fusionaron ni la metodologia exacta empleada.

Tampoco hay datos sobre el proceso de entrenamiento: no se conoce el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La unica informacion adicional es la presencia de archivos mmproj (proyeccion multimodal) en la version cuantizada, lo que podria indicar que el modelo base incorpora un codificador visual, aunque no se confirma en la documentacion.

## Capacidades

- Generacion de texto en ingles, con especial enfasis en roleplay y storytelling segun las etiquetas del modelo.
- Conversacion multi-turno, adecuada para chatbots y personajes interactivos.
- Posible soporte multimodal (vision) gracias a los archivos mmproj, aunque no se ha verificado su funcionamiento.
- No se documentan capacidades de tool calling, function calling ni razonamiento agente.
- No se especifican capacidades de razonamiento matematico o generacion de codigo; el modelo parece orientado a narrativa y dialogo.

## Casos de uso

- Creacion de ficcion interactiva: el modelo puede generar historias ramificadas donde el usuario toma decisiones, gracias a su capacidad para mantener contexto narrativo a lo largo de multiples turnos.
- Chatbots de personajes para juegos de rol: permite interpretar personajes con personalidad y coherencia, ideal para plataformas de rol textual o asistentes de escritura creativa.
- Generacion de dialogos para guiones o novelas: puede producir conversaciones realistas entre personajes, ayudando a escritores a explorar interacciones.
- Prototipado de asistentes conversacionales con personalidad: al estar disenado para roleplay, puede servir como base para asistentes con tono y estilo definidos.
- Generacion de descripciones y ambientaciones: util para crear escenarios, mundos y descripciones detalladas en proyectos de escritura o juegos.
- Experimentacion con tecnicas de merge y cuantizacion: al ser un modelo de 31B con licencia permisiva, es un candidato para probar pipelines de inferencia local y comparar calidades entre distintos quants.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del quant elegido. Por ejemplo, Q4_K_M (18,8 GB) requiere al menos 20 GB de VRAM en GPU; Q8_0 (32,7 GB) necesita 34 GB o mas. Los quants mas pequenos como Q2_K (12 GB) pueden caber en GPUs de 12-16 GB.
- GPUs recomendadas: para quants Q4 o superiores, una RTX 4090 (24 GB) o A100 (40/80 GB) son adecuadas. Para quants Q2/Q3, una RTX 3090 (24 GB) o RTX 4080 (16 GB) pueden funcionar.
- En consumer GPU: si, con quants Q2_K, Q3_K_S o Q4_K_S en GPUs de 16-24 GB. Para Q8_0 se requiere GPU profesional o uso de CPU con RAM abundante.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversion a formato compatible) y TGI.
- Latencia y throughput: no se dispone de mediciones publicas. En una RTX 4090 con Q4_K_M, se estima una velocidad de 20-40 tokens/s, pero es una estimacion orientativa.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo pertenece a la categoria de 30-32B, donde existen alternativas como Llama-3.1-30B, Qwen2.5-32B o Mistral-31B, pero no se conocen los resultados de Scarlet-Shadow-31B en benchmarks estandar, por lo que no es posible comparar rendimiento. En cuanto a licencia, Apache 2.0 es mas permisiva que la de Llama (licencia propia) y similar a la de Qwen (Apache 2.0). La disponibilidad en GGUF es un punto a favor para despliegue local.

## Limitaciones y advertencias

- Al ser un merge sin documentacion detallada, no se conocen los sesgos especificos del modelo, aunque es probable que herede sesgos de los modelos base utilizados en la fusion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inconsistente, especialmente en contextos largos.
- Limitaciones de idioma: solo se ha confirmado soporte para ingles; no se garantiza un buen rendimiento en otros idiomas.
- Contexto limitado: al no conocerse la longitud de contexto, se recomienda no superar 4K-8K tokens para evitar degradacion, aunque es una suposicion conservadora.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia.
- Para produccion, se recomienda validar el modelo en tareas especificas antes de desplegarlo, dado que no hay benchmarks publicos.

## Enlaces

- Repositorio HuggingFace de la version GGUF: https://huggingface.co/mradermacher/Scarlet-Shadow-31B-GGUF
- Modelo base original: https://huggingface.co/Vortex5/Scarlet-Shadow-31B
- Pagina de descargas de mradermacher: https://hf.tst.eu/model
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
