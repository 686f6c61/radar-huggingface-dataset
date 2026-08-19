# mradermacher/Melody1437-26B-A4B-GGUF

## Resumen

Melody1437-26B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) basado en la arquitectura Gemma 4 de Google, con 26 mil millones de parámetros totales y 4 mil millones activos por token. El modelo original, desarrollado por ReadyArt, es una versión sin alineación (abliterada) de Gemma 4, orientada a roleplay, conversación y contenido explícito para adultos. La versión que nos ocupa, publicada por mradermacher, consiste en cuantizaciones GGUF del modelo base, lo que permite ejecutarlo en hardware de consumo con requisitos de VRAM reducidos.

La relevancia de este modelo radica en que ofrece capacidades multimodales (visión) y de razonamiento propias de Gemma 4, pero sin las restricciones de seguridad habituales, lo que lo hace atractivo para aplicaciones de ficción interactiva, simulación de personajes y generación de narrativa adulta. Al estar disponible en formato GGUF con múltiples niveles de cuantización, puede desplegarse en GPU domésticas (8-24 GB de VRAM) mediante herramientas como llama.cpp u Ollama. La licencia Apache 2.0 permite uso comercial, aunque el contenido generado puede plantear consideraciones legales y éticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Gemma 4), 26B totales, 4B activos |
| Parametros totales | 25.233.142.046 |
| Parametros activos | 4B (aproximado, según especificacion Gemma 4) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; adicionalmente mmproj-f16 y mmproj-Q8_0 para vision |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

El modelo base, ReadyArt/Melody1437-26B-A4B, es una adaptacion de Gemma 4, la familia de modelos on-device de Google. Gemma 4 emplea una arquitectura MoE con 26B parametros totales y 4B activos por token, disenada para equilibrar rendimiento y eficiencia computacional. Incluye soporte multimodal (vision) y capacidades de razonamiento. La version de ReadyArt ha sido sometida a un proceso de "abliteration" (eliminacion de la alineacion de seguridad) basado en las tecnicas documentadas en el repositorio de TrevorS, que consiste en modificar los pesos para anular las restricciones de contenido. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO; la model card no proporciona estos datos.

## Capacidades

- Generacion de texto conversacional e instructivo, optimizado para roleplay y narrativa interactiva.
- Soporte multimodal: incluye proyecciones de vision (mmproj) que permiten procesar imagenes junto con texto.
- Sin alineacion de seguridad, lo que permite generar contenido explicito, adulto y sin filtros de censura.
- Razonamiento basico heredado de Gemma 4, aunque no se especifican benchmarks.
- Multilingue limitado: solo ingles confirmado.
- No se menciona soporte explicito para tool calling o agentes autonomos; las capacidades de function calling no estan documentadas.

## Casos de uso

- Roleplay conversacional: el modelo puede mantener dialogos multi-turno con personajes ficticios, adaptando tono y personalidad, gracias a su entrenamiento especifico en roleplay y su falta de restricciones.
- Generacion de narrativa erotica: adecuado para escribir relatos o escenas con contenido adulto explicito, tanto para uso personal como para publicaciones en plataformas de ficcion.
- Simulacion de personajes en juegos de rol: puede integrarse en motores de chat para juegos de texto o mundos virtuales, ofreciendo respuestas coherentes con la personalidad definida.
- Asistente de escritura creativa sin censura: util para autores que necesitan explorar temas tabu o controversiales sin limitaciones impuestas por modelos alineados.
- Chatbots de entretenimiento para adultos: puede desplegarse en aplicaciones de compania virtual o servicios de conversacion explicita, siempre que se cumplan las normativas legales aplicables.
- Prototipado de aplicaciones de IA generativa: al ser de codigo abierto y con licencia Apache 2.0, sirve como base para experimentar con tecnicas de desalineacion o para investigar el comportamiento de modelos sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el archivo GGUF elegido, desde ~10,7 GB (Q2_K) hasta ~27 GB (Q8_0). Para uso con vision, anadir ~1-1,3 GB del mmproj.
- GPU recomendadas: para cuantizaciones Q4_K_M (16,9 GB) o inferiores, una RTX 3090/4090 (24 GB) es suficiente; para Q6_K o Q8_0 se recomienda una A100 40GB o similar. Tambien puede ejecutarse en CPU con RAM suficiente (32 GB o mas).
- Compatibilidad con GPU de consumo: si, con cuantizaciones Q4_K_M o menores en GPUs con 16-24 GB de VRAM (RTX 4080, RTX 4090, etc.).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (con backend llama.cpp). Para despliegue en servidor, se puede convertir a formatos compatibles con vLLM o TGI, aunque no se proporcionan instrucciones especificas.
- Latencia y throughput: no disponible; dependera del hardware y de la cuantizacion seleccionada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo comparte arquitectura con google/gemma-4-26B-A4B-it, pero con la alineacion eliminada. Otros modelos "uncensored" como Llama-3-8B-Instruct o Mistral-7B-Instruct tienen menos parametros y no son MoE, pero no hay datos de rendimiento para comparar. Se recomienda consultar benchmarks independientes si se requiere una evaluacion objetiva.

## Limitaciones y advertencias

- Contenido explicito y NSFW: el modelo genera material adulto sin restricciones; no es apto para menores ni para entornos laborales sin control.
- Sesgos y alucinaciones: al carecer de alineacion, puede producir respuestas ofensivas, incorrectas o peligrosas. No se ha evaluado su fiabilidad en tareas factuales.
- Idioma: solo se garantiza ingles; el rendimiento en otros idiomas es desconocido.
- Longitud de contexto no documentada: se desconoce el limite maximo de tokens de entrada, lo que puede afectar a tareas que requieren contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede infringir leyes de propiedad intelectual o regulaciones locales sobre material adulto.
- Riesgo de uso indebido: al ser un modelo sin alineacion, puede emplearse para generar desinformacion, acoso o contenido ilegal; el responsable del despliegue debe asumir las consecuencias legales y eticas.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Melody1437-26B-A4B-GGUF
- Modelo base (ReadyArt): https://huggingface.co/ReadyArt/Melody1437-26B-A4B
- Gemma 4 de Google (referencia): https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio de abliteration de Gemma 4: https://github.com/TrevorS/gemma-4-abliteration
- Pagina de LM Studio para Gemma 4 26B: https://lmstudio.ai/models/google/gemma-4-26b-a4b
