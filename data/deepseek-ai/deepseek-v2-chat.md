# deepseek-ai/DeepSeek-V2-Chat

## Resumen

DeepSeek-V2-Chat es la version afinada para conversacion del modelo DeepSeek-V2, desarrollado por DeepSeek AI (deepseek-ai). Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 236.000 millones de parametros totales, de los cuales solo se activan 21.000 millones por token, lo que permite un coste de inferencia muy inferior al de un modelo denso de tamano equivalente. Soporta una longitud de contexto de 128.000 tokens y se distribuye bajo la licencia propia DeepSeek (Model Agreement).

El modelo fue preentrenado sobre un corpus de 8,1 billones de tokens y posteriormente sometido a un proceso de ajuste supervisado (SFT) y aprendizaje por refuerzo (RL) para convertirlo en la variante Chat. Frente a DeepSeek 67B, la version V2 reduce el cache KV un 93,3%, recorta los costes de entrenamiento un 42,5% y multiplica por 5,76 el throughput maximo de generacion, segun los datos publicados por el autor.

Su relevancia radica en que combina un rendimiento competitivo con modelos densos mucho mayores (como LLaMA3 70B) con una eficiencia de inferencia sustancialmente mejor gracias al enrutado disperso de expertos y a una atencion optimizada para cache KV reducida. En benchmarks estandar en ingles y chino alcanza resultados de referencia, con especial ventaja en tareas en chino (C-Eval 81,7 y CMMLU 84,0 en el modelo base). El repositorio acumula mas de 22.800 descargas y 482 likes en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer con enrutado disperso de expertos |
| Parametros totales | 235.741.434.880 (aprox. 236B) |
| Parametros activos | 21B por token (solo en MoE) |
| Longitud de contexto | 128.000 tokens (128k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles y chino (segun los benchmarks publicados; el campo de idiomas del repositorio figura como no disponible) |
| Licencia | DeepSeek Model Agreement (license: other, license_name: deepseek); el codigo asociado se publica bajo licencia MIT |
| Formato de pesos | safetensors (tambien compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

DeepSeek-V2 es un modelo de lenguaje de tipo Mixture-of-Experts con 236.000 millones de parametros totales y 21.000 millones activados en cada token, lo que reduce drasticamente el coste computacional por token frente a un modelo denso del mismo tamano. La arquitectura incorpora innovaciones orientadas a la eficiencia de inferencia: el autor reporta una reduccion del 93,3% en el cache KV y un incremento de hasta 5,76 veces en el throughput maximo de generacion en comparacion con DeepSeek 67B. No se detalla en la informacion proporcionada la composicion exacta del mecanismo de atencion ni el numero de expertos por capa.

El preentrenamiento se realizo sobre un corpus diverso y de alta calidad de 8,1 billones de tokens. Posteriormente se aplico un proceso de ajuste supervisado (Supervised Fine-Tuning, SFT) seguido de aprendizaje por refuerzo (RL) para dar lugar a la variante DeepSeek-V2-Chat. El modelo card indica que el rendimiento del codigo abierto en GPUs con HuggingFace es actualmente mas lento que su base de codigo interna, y recomienda una solucion especifica basada en vLLM para una ejecucion eficiente.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de contexto de hasta 128.000 tokens.
- Razonamiento en ingles y chino, con resultados destacados en benchmarks como C-Eval, CMMLU, MMLU y BBH.
- Generacion de codigo, con resultados publicados en HumanEval (48,8) y MBPP (66,6) para el modelo base.
- Resolucion de problemas matematicos, con GSM8K 79,2 y MATH 43,6 en el modelo base.
- Modelo afinado con RL y SFT especificamente para uso conversacional en la variante Chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo unicamente de texto).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada en ingles y chino: el modelo puede gestionar conversaciones multi-turno con hasta 128k tokens de contexto, lo que permite mantener historiales largos y documentos de referencia en la misma ventana.
- Generacion y revision de codigo: gracias a su rendimiento en HumanEval y MBPP, puede emplearse para autocompletado, generacion de funciones y explicacion de codigo en pipelines de desarrollo.
- Asistente de documentacion tecnica: procesar manuales extensos y responder preguntas concretas aprovechando la ventana de 128k tokens.
- Analisis de documentos largos en chino: el modelo destaca en benchmarks chinos (C-Eval 81,7, CMMLU 84,0), lo que lo hace adecuado para tareas de comprension y resumen en ese idioma.
- Razonamiento matematico asistido: resolucion de problemas de tipo GSM8K y MATH en entornos educativos o de analisis cuantitativo.
- Despliegue en produccion con vLLM: el autor recomienda vLLM para obtener un rendimiento eficiente, y la reduccion del 93,3% del cache KV baja los requisitos de memoria en contextos largos, permitiendo servir muchas peticiones concurrentes.
- Chatbot de dominio especifico: al ser un modelo MoE con solo 21B parametros activos por token, resulta viable para servir cargas de trabajo conversacionales a gran escala sin el coste de un modelo denso de 236B.
- Traduccion y asistencia bilingue ingles-chino: cubre tareas de traduccion y generacion en ambos idiomas segun los benchmarks publicados.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base DeepSeek-V2 (no a la variante Chat), tal como se publican en la model card. No se han proporcionado en la informacion disponible resultados especificos de la variante Chat.

| Benchmark | Dominio | LLaMA3 70B | Mixtral 8x22B | DeepSeek-V1 (Dense-67B) | DeepSeek-V2 (MoE-236B) |
|---|---|---|---|---|---|
| MMLU | Ingles | 78,9 | 77,6 | 71,3 | 78,5 |
| BBH | Ingles | 81,0 | 78,9 | 68,7 | 78,9 |
| C-Eval | Chino | 67,5 | 58,6 | 66,1 | 81,7 |
| CMMLU | Chino | 69,3 | 60,0 | 70,8 | 84,0 |
| HumanEval | Codigo | 48,2 | 53,1 | 45,1 | 48,8 |
| MBPP | Codigo | 68,6 | 64,2 | 57,4 | 66,6 |
| GSM8K | Matematicas | 83,0 | 80,3 | 63,4 | 79,2 |
| Math (MATH) | Matematicas | 42,2 | 42,5 | 18,7 | 43,6 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 472 GB para los 236B parametros totales (2 bytes por parametro), consistente con el tamano del repositorio (471,5 GB).
- VRAM estimada en 8 bits: aproximadamente 236 GB.
- VRAM estimada en 4 bits: aproximadamente 118 GB.
- GPU recomendadas: por el volumen de parametros, se requiere inferencia multi-GPU; configuraciones tipo A100 80GB (varias unidades) o H100 80GB. No cabe en una unica GPU consumer en bf16.
- Cabe en consumer GPU: no en precision completa ni en 8 bits. En cuantizacion de 4 bits aun requiere agregar memoria de multiples GPUs de gama alta; no es viable en una unica RTX 4090 (24 GB).
- Opciones de despliegue: transformers (con custom_code) y vLLM (recomendado explicitamente por el autor para un rendimiento optimizado). Compatible con text-generation-inference y endpoints_compatible segun las etiquetas del repositorio. Soporte de llama.cpp / GGUF / Ollama: no disponible en la informacion proporcionada (el campo de cuantizaciones figura como no disponible).
- Latencia y throughput: no se proporcionan cifras absolutas. El autor indica que DeepSeek-V2 multiplica por 5,76 el throughput maximo de generacion frente a DeepSeek 67B y reduce el cache KV un 93,3%. Ademas advierte de que el codigo de HuggingFace es mas lento que su base de codigo interna, por lo que recomienda vLLM.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | MMLU | C-Eval | Licencia |
|---|---|---|---|---|---|---|
| DeepSeek-V2 (MoE) | 236B | 21B | 128k | 78,5 | 81,7 | DeepSeek Model Agreement |
| LLaMA3 70B | 70B | Denso | no disponible en la informacion | 78,9 | 67,5 | Licencia LLaMA 3 (no disponible en la informacion proporcionada) |
| Mixtral 8x22B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | 77,6 | 58,6 | no disponible en la informacion proporcionada |
| DeepSeek-V1 (Dense-67B) | 67B | Denso | no disponible en la informacion | 71,3 | 66,1 | no disponible en la informacion proporcionada |

Nota: los datos de rendimiento corresponden al modelo base DeepSeek-V2. La licencia de los modelos comparados no se detalla en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan sesgos especificos en la informacion proporcionada; se debe asumir el riesgo habitual de sesgos presentes en el corpus de preentrenamiento de 8,1 billones de tokens.
- Riesgo de alucinacion: no documentado explicitamente en la informacion disponible, pero es una limitacion inherente a los modelos de lenguaje generativos.
- Limitaciones de idioma: el soporte documentado se centra en ingles y chino segun los benchmarks; no hay datos que confirmen un rendimiento solido en castellano u otros idiomas.
- Licencia: se distribuye bajo la DeepSeek Model Agreement (license: other, license_name: deepseek), no bajo una licencia de codigo abierto permisiva. El uso comercial esta sujeto a las condiciones de dicho acuerdo y debe revisarse antes de un despliegue en produccion.
- Rendimiento en HuggingFace: el propio autor advierte de que el codigo de HuggingFace es mas lento que su base de codigo interna, por lo que el rendimiento en produccion puede verse afectado si no se utiliza vLLM.
- Tamano de despliegue: con 236B parametros totales y un repositorio de 471,5 GB, el modelo exige infraestructura multi-GPU, lo que limita su uso a entornos con hardware dedicado.
- Los benchmarks publicados corresponden al modelo base y no a la variante Chat, por lo que las cifras pueden no reflejar el comportamiento conversacional de este checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V2-Chat
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V2
- Paper (arXiv:2405.04434): https://arxiv.org/abs/2405.04434
- Referencia arXiv secundaria (arXiv:2311.18743): https://arxiv.org/abs/2311.18743
- Repositorio GitHub: https://github.com/deepseek-ai
- Repositorio DeepSeek-V2 (codigo): https://github.com/deepseek-ai/DeepSeek-V2
- Licencia del modelo: https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-MODEL
- Licencia del codigo (MIT): https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-CODE
- Sitio web: https://www.deepseek.com/
- Plataforma API: https://www.deepseek.com/en/platform/
- Chat: https://chat.deepseek.com/
- Descarga de la aplicacion: https://download.deepseek.com/
- Discord: https://discord.gg/Tc7c45Zzu5
- Twitter/X: https://twitter.com/deepseek_ai
- Wikipedia (referencia): https://fr.wikipedia.org/wiki/DeepSeek
