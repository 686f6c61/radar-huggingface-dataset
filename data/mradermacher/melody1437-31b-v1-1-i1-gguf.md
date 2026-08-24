# mradermacher/Melody1437-31B-v1.1-i1-GGUF

## Resumen

Melody1437-31B-v1.1-i1-GGUF es la version cuantizada en formato GGUF del modelo ReadyArt/Melody1437-31B-v1.1, preparada por mradermacher con cuantizaciones imatrix de alta calidad. El modelo base es un fine-tuning de la arquitectura Gemma-4 con aproximadamente 30,7 mil millones de parametros, orientado a roleplay y conversacion, con un enfoque deliberadamente no alineado (unaligned) para permitir contenido adulto y explicito sin restricciones de seguridad.

El modelo resuelve el problema de disponer de un modelo conversacional de gran tamano con personalidad y capacidad de roleplay sin las limitaciones de seguridad tipicas de los modelos comerciales, y su relevancia actual radica en que esta disponible en multiples cuantizaciones GGUF que permiten ejecutarlo en hardware de consumo. Al ser una variante con soporte de vision (mmproj), tambien puede procesar imagenes junto con texto, aunque el repositorio actual solo incluye los pesos del modelo de lenguaje.

La licencia Apache 2.0 permite uso comercial y modificacion libre, lo que la convierte en una opcion atractiva para desarrolladores que necesitan un modelo conversacional sin restricciones de uso. El formato GGUF es compatible con llama.cpp, Ollama y LM Studio, entre otros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Gemma 4 (vision-language) |
| Parametros totales | 30.697.345.596 (~30,7 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix de calibracion) |

## Arquitectura y entrenamiento

El modelo base ReadyArt/Melody1437-31B-v1.1 es una variante de la arquitectura Gemma 4, un transformer de lenguaje con capacidades multimodales (vision y texto). Los detalles exactos de la arquitectura (numero de capas, dimensiones de atencion, sistema de codificacion de vision) no estan disponibles en la informacion proporcionada, pero al estar basado en Gemma 4 se puede asumir una arquitectura de transformer denso con atencion por ventana y mecanismos de eficiencia de contexto.

El entrenamiento del modelo base se ha realizado mediante fine-tuning instructivo, orientado a roleplay y conversacion, con un enfoque deliberadamente no alineado (unaligned), lo que implica que no se aplicaron tecnicas de RLHF/DPO para rechazar contenido explicito o adulto. Los datos de entrenamiento no estan documentados en la informacion disponible. La cuantizacion imatrix realizada por mradermacher utiliza la tecnica de importance matrix para minimizar la perdida de precision en los pesos cuantizados.

## Capacidades

- Generacion de texto conversacional multi-turno con estilo de roleplay y narrativa.
- Soporte de vision (el modelo base es vision-language, aunque los archivos mmproj estan en el repositorio estatico, no en este).
- Sin alineacion de seguridad: puede generar contenido explicito, adulto, NSFW y erotico sin restricciones.
- Instrucciones de sistema y contexto de personalidad para personajes.
- Soporte de formato instruct (etiquetado como instruct en la model card).
- Capacidades de narracion y escritura creativa.
- Funcionamiento en ingles, sin soporte multilingue documentado.
- Sin soporte de tool calling documentado en la informacion disponible.
- Sin soporte de agentes multi-step documentado.

## Casos de uso

- Roleplay conversacional: el modelo permite mantener conversaciones multi-turno con personajes definidos por el usuario, gracias a su entrenamiento orientado a roleplay y su ausencia de restricciones de contenido. Se usaria con un frontend tipo SillyTavern o KoboldCpp que envie el prompt de sistema con la definicion del personaje.
- Escritura creativa y narrativa: para generar historias, dialogos y escenas de ficcion, incluyendo generos adultos, sin censura. Adecuado para autores que trabajan con contenido explicito o temas maduros.
- Chatbots de entretenimiento: despliegue de un asistente conversacional con personalidad definida y sin filtros, util en entornos de simulacion social o experimentos de interaccion humano-maquina.
- Prototipado de sistemas de conversacion sin alineacion: para investigacion sobre comportamiento de modelos no alineados en contextos conversacionales y de roleplay.
- Generacion de texto en entornos con restricciones de VRAM: gracias a las cuantizaciones Q2_K (12 GB) y otras, se puede ejecutar en GPUs de consumo como RTX 3060 o RTX 4060 con 12 GB de VRAM.
- Desarrollo de aplicaciones de escritura asistida: integracion con herramientas de generacion de guiones, novelas visuales o juegos de rol textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion Q2_K ocupa aproximadamente 12 GB, lo que permite ejecucion en GPUs de consumo con 12-16 GB de VRAM (RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070). Cuantizaciones mayores como Q6_K o Q5_K_M requeriran 20-25 GB de VRAM, aptas para RTX 4090 (24 GB) o A6000.
- Para la carga completa del modelo sin cuantizar (safetensors, ~61 GB en FP16), se necesitaria una GPU profesional con 80 GB (A100/H100) o despliegue multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, vLLM con soporte GGUF (via llama.cpp backend) y text-generation-webui.
- Latencia estimada: en una GPU de 24 GB con cuantizacion Q4_K_M, se espera una velocidad de generacion de 20-40 tokens por segundo en llama.cpp, dependiendo de la longitud del contexto y el hardware.
- El modelo es compatible con la carga de archivos GGUF multi-parte, por lo que se puede dividir entre CPU y GPU si la VRAM es insuficiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Melody1437-31B-v1.1 (este) | 30,7B | no disponible | Apache 2.0 | Roleplay, sin alinear, vision |
| Gemma 2 27B | 27B | 8K | Gemma license | General, alineado |
| Mistral 7B Instruct | 7B | 8K | Apache 2.0 | General, instructivo |
| Llama 3.1 70B | 70B | 128K | Llama license | General, alineado |

La comparativa con modelos exactamente equivalentes (Gemma 4 fine-tuned para roleplay sin alinear) no esta disponible en la informacion publicada. Los modelos comparables por tamano serian las variantes de 30B de Llama 3 o Gemma 2, pero sin el enfoque especifico de roleplay sin alinear.

## Limitaciones y advertencias

- Modelo deliberadamente no alineado: puede generar contenido explicito, sexual, violento o inapropiado sin restriccion. No apto para uso en entornos de produccion publica sin moderacion externa.
- Solo en ingles: no hay soporte documentado para otros idiomas, lo que limita su uso en aplicaciones multilingues.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos, nombres o eventos, especialmente en contextos largos.
- Longitud de contexto no documentada: se desconoce el tamano exacto de la ventana de contexto, lo que requiere pruebas empiricas antes de desplegarlo en produccion.
- Sin benchmarks publicados: no hay datos de rendimiento en tareas estandar (MMLU, HumanEval, etc.), lo que dificulta la evaluacion objetiva de su calidad.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado por un modelo sin alinear puede tener implicaciones legales en jurisdicciones con regulacion de contenido explicito.
- La cuantizacion Q2_K puede degradar significativamente la calidad de generacion en comparacion con el modelo original en FP16.

## Enlaces

- Repositorio HuggingFace de este modelo (GGUF imatrix): https://huggingface.co/mradermacher/Melody1437-31B-v1.1-i1-GGUF
- Repositorio HuggingFace de la variante estatica (GGUF sin imatrix): https://huggingface.co/mradermacher/Melody1437-31B-v1.1-GGUF
- Modelo base original: https://huggingface.co/ReadyArt/Melody1437-31B-v1.1
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Documentacion de importacion de modelos en LM Studio: https://lmstudio.ai/docs/app/advanced/import-model
