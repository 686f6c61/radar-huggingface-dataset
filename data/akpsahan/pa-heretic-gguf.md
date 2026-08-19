# akpsahan/PA-heretic-GGUF

## Resumen

PA-heretic-GGUF es una versión cuantizada en formato GGUF del modelo Vortex5/Gemma-4-26B-A4B-Animus-V14.1-FFT-heretic, publicada por el usuario akpsahan. El modelo original es un fine-tuning de la familia Gemma-4 (probablemente una variante con arquitectura de mezcla de expertos, dado el sufijo A4B), orientado a roleplay y conversación sin censura, y ha pasado por un proceso de "abliteration" (eliminación de la alineación de seguridad) mediante la herramienta Heretic. La cuantización ha sido realizada por mradermacher, un conocido proveedor de archivos GGUF, e incluye tanto pesos estáticos como archivos multimodales (mmproj) para soporte de visión.

El modelo está diseñado para casos de uso donde se requiere generación de texto libre sin restricciones temáticas, especialmente en contextos de ficción interactiva y chat de personajes. Con 25 233 millones de parámetros totales, ofrece un equilibrio entre capacidad y requisitos de hardware, pudiendo ejecutarse en GPUs de consumo con las cuantizaciones adecuadas. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque el contenido generado puede no ser apto para todos los públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere MoE por el sufijo A4B, sin confirmar) |
| Parametros totales | 25 233 142 046 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Por el nombre "Gemma-4-26B-A4B" se puede inferir que se trata de un modelo de la familia Gemma 4 con 26 000 millones de parametros totales y 4 000 millones activos por token, lo que indicaria una arquitectura de mezcla de expertos (MoE), aunque este dato no esta confirmado oficialmente. El modelo original ha sido fine-tuned por Vortex5 para tareas de roleplay y chat, y posteriormente se le ha aplicado una tecnica de abliteration (direccional ablation) mediante la herramienta Heretic, que elimina la alineacion de seguridad sin necesidad de reentrenamiento costoso.

El proceso de cuantizacion a GGUF ha sido realizado por mradermacher, que ha generado multiples versiones con diferentes niveles de precision (de Q2_K a Q8_0) y tambien archivos multimodales (mmproj) que permiten al modelo procesar imagenes si el modelo base original las soportaba. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto libre y creativo, especialmente orientado a roleplay y narracion de ficcion.
- Conversacion multi-turno en ingles, con capacidad para mantener contextos largos (la longitud exacta no esta especificada).
- Soporte de entrada multimodal (vision) si se utilizan los archivos mmproj adjuntos, aunque no se detallan las capacidades exactas.
- Ausencia de filtros de contenido: el modelo ha sido "abliterated" para eliminar la censura, lo que permite generar contenido adulto, violento o controvertido sin restricciones.
- Fine-tuning especifico para personajes y escenarios de roleplay, con un estilo conversacional natural.
- Compatible con herramientas de inferencia que aceptan GGUF (llama.cpp, Ollama, LM Studio, etc.).

## Casos de uso

- Roleplay interactivo: el modelo puede interpretar personajes de ficcion (por ejemplo, del universo Wings of Fire) en conversaciones multi-turno, manteniendo coherencia y personalidad gracias a su fine-tuning especifico.
- Escritura creativa sin restricciones: autores que necesiten explorar tramas o dialogos con contenido adulto o temas tabu pueden usarlo como asistente de generacion, ya que no aplica filtros de seguridad.
- Chatbots de entretenimiento para adultos: desarrollo de asistentes conversacionales con tematica NSFW, siempre que la plataforma de despliegue permita ese tipo de contenido.
- Generacion de historias interactivas: creacion de aventuras de texto donde el usuario decide las acciones y el modelo narra las consecuencias, con un tono inmersivo y detallado.
- Prototipado de personajes: escritores que quieran explorar rapidamente diferentes voces y personalidades para sus obras pueden dialogar con el modelo para refinar caracterizaciones.
- Investigacion sobre alineacion y censura: el modelo sirve como ejemplo practico de los efectos de la abliteration, permitiendo estudiar como cambia el comportamiento de un LLM al eliminar su capa de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas estandar para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para Q4_K_M (16,9 GB) se necesitan al menos 20 GB de VRAM, mientras que Q8_0 (27,0 GB) requiere unos 32 GB. Las versiones Q2_K (10,7 GB) pueden caber en GPUs de 12 GB, aunque con perdida de calidad.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M, A100 40 GB o H100 para Q8_0, y GPUs de 12-16 GB (RTX 3060, 4070) para cuantizaciones bajas.
- En consumer GPU: si, las versiones Q2_K a Q4_K_M caben en tarjetas de gama alta de consumo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF), o cualquier motor compatible con el formato.
- Latencia y throughput: no se proporcionan datos concretos. En una RTX 4090 con Q4_K_M se puede esperar una velocidad de generacion de 20-40 tokens/s, pero es una estimacion orientativa.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos. El modelo comparte caracteristicas con otros GGUF de la familia Gemma-4-26B-A4B y con modelos "uncensored" como los de la serie Dolphin o WizardLM, pero no hay datos de rendimiento publicados que permitan una comparacion objetiva. Se recomienda evaluar directamente en el caso de uso concreto.

## Limitaciones y advertencias

- Contenido NSFW y potencialmente ofensivo: al haber sido abliterated, el modelo puede generar texto explicito, violento o discriminatorio sin filtros. No es apto para menores ni para entornos profesionales sin supervision.
- Sesgos no mitigados: la eliminacion de la alineacion no elimina los sesgos presentes en los datos de entrenamiento originales; pueden aparecer estereotipos o respuestas tendenciosas.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, nombres o eventos, especialmente en contextos de roleplay donde la coherencia interna es critica.
- Idioma limitado: solo se ha confirmado soporte para ingles; el rendimiento en otros idiomas puede ser deficiente.
- Longitud de contexto desconocida: no se especifica el tamaño de la ventana de contexto, lo que puede afectar a tareas que requieran memorizar informacion a largo plazo.
- Dependencia del modelo base: la calidad final depende del fine-tuning original de Vortex5; no se garantiza que el proceso de cuantizacion no haya introducido degradaciones adicionales.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar las politicas de plataformas de despliegue (por ejemplo, OpenAI o Google Cloud prohiben contenido explicito).

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/akpsahan/PA-heretic-GGUF
- Modelo base original: https://huggingface.co/Vortex5/Gemma-4-26B-A4B-Animus-V14.1-FFT-heretic
- Cuantizaciones con imatrix (variante alternativa): https://huggingface.co/mradermacher/Gemma-4-26B-A4B-Animus-V14.1-FFT-heretic-i1-GGUF
- Herramienta Heretic (abliteration): https://github.com/p-e-w/heretic
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
