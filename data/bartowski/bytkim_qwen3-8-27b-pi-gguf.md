# bartowski/bytkim_Qwen3.8-27B-pi-GGUF

## Resumen

bartowski/bytkim_Qwen3.8-27B-pi-GGUF es la versión cuantizada en formato GGUF del modelo bytkim/Qwen3.8-27B-pi, un modelo multimodal denso de aproximadamente 27.320 millones de parámetros (el autor del cuantizado cita 28B para el checkpoint fuente). Lo publica bartowski, autor de referencia en la comunidad de cuantizaciones GGUF, y está pensado para ejecución local en llama.cpp, Ollama, LM Studio y otros runtimes compatibles con este formato. Hereda del modelo base la familia Qwen3.8 y las capacidades asociadas a ella: generación de código, razonamiento, uso de herramientas y flujos agénticos.

El modelo acepta entradas de texto e imagen (pipeline image-text-to-text) siempre que se descargue también el fichero mmproj correspondiente. Incorpora una cabecera de multi-token prediction (MTP) que habilita decodificación especulativa, y las cuantizaciones se han generado con matriz de importancia (imatrix) usando llama.cpp build b11279. La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque conviene verificar las condiciones del modelo base.

Su relevancia actual reside en que permite desplegar un modelo multimodal de ~27B en hardware de gama alta de consumo o en una única GPU profesional, con un menú amplio de cuantizaciones que van de 17,44 GB (Q4_K_M, IQ4_NL) a 54,66 GB (bf16). No se han publicado en la información disponible datos de contexto máximo, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (descripción del repositorio oficial de AlibabaCloud para Qwen3.8-27B); incluye cabecera MTP para decodificación especulativa. Detalle de capas y atención: no disponible |
| Parametros totales | 27.320.697.856 (27,32 B) según safetensors; la model card del cuantizado indica 28B para el checkpoint fuente |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL (lista parcial; el repo completo puede incluir más) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |
| Tamano del repo | 446,8 GB (incluye todas las cuantizaciones) |
| Quantizador | bartowski, con llama.cpp b11279 e imatrix |
| Entrada multimodal | Texto e imagen (requiere fichero mmproj) |

## Arquitectura y entrenamiento

La información disponible describe el modelo base Qwen3.8-27B como un LLM denso nativo multimodal, no como una arquitectura MoE ni un modelo híbrido SSM. El checkpoint cuantizado conserva una cabecera de multi-token prediction (MTP) que permite decodificación especulativa: el modelo predice varios tokens por paso y un mecanismo de verificación los valida, lo que reduce la latencia de generación en runtimes que soportan esta técnica. Las cuantizaciones se han construido con imatrix, es decir, calibrando la precisión de cada tensor según su importancia, lo que mejora la calidad respecto a cuantizaciones uniformes del mismo tamaño.

Sobre el entrenamiento del modelo base bytkim/Qwen3.8-27B-pi, las etiquetas de la ficha indican supervisión fina (SFT) y aprendizaje por refuerzo con GRPO, además de un modo de razonamiento configurable (el prompt de sistema incluye la instrucción "Reasoning effort is set to xhigh"). No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni los detalles del pipeline de alineamiento. El formato de prompt es de tipo ChatML, con bloques `<|im_start|>`/`<|im_end|>` y una sección de pensamiento delimitada por etiquetas `<think>`.

## Capacidades

- Generación de texto conversacional multi-turno con formato de chat ChatML.
- Razonamiento explícito o modo de pensamiento: el prompt de sistema admite un nivel de esfuerzo de razonamiento ("xhigh") y la generación arranca dentro de un bloque `<think>`.
- Generación de código: las etiquetas del modelo incluyen coding, coder y code-generation, orientadas a tareas de programación.
- Tool calling y function calling: la plantilla de prompt define un formato XML con `<tool_call>`, `<function=...>` y `<parameter=...>`, con reglas explícitas sobre parámetros obligatorios y orden de las llamadas.
- Flujos agénticos y razonamiento multi-paso: etiquetas agent, tool-use y reasoning.
- Multimodalidad de entrada: procesa imágenes junto con texto (pipeline image-text-to-text), siempre que se cargue el fichero mmproj.
- Decodificación especulativa mediante MTP, que acelera la inferencia cuando el runtime la soporta.
- Capacidades multilingües: no disponible (no se declara la lista de idiomas).

## Casos de uso

- Asistente de programación en local: el modelo puede generar, revisar y refactorizar código en un IDE integrado vía llama.cpp u Ollama, sin enviar código a servicios externos, gracias a su orientación explícita a coding y code-generation y a un tamaño que cabe en una GPU de 24 GB con cuantización Q4_K_M.
- Agente con uso de herramientas: al soportar function calling con un formato XML bien definido, puede encadenar llamadas a APIs (consultas de precios, bases de datos, sistemas de tickets) en bucles multi-paso, con el modelo decidiendo cuándo invocar cada función.
- Automatización de oficina con documentos escaneados: al aceptar entrada de imagen, puede extraer información de capturas, formularios o tablas y convertirla en texto estructurado o en llamadas a herramientas de gestión.
- Análisis de diagramas y capturas técnicas: un desarrollador puede adjuntar una captura de un error, un diagrama de arquitectura o un esquema de base de datos y pedir explicación o código asociado.
- Razonamiento asistido en tareas analíticas: con el modo de pensamiento activado y esfuerzo alto, resulta adecuado para problemas que requieren validar supuestos y comparar alternativas antes de responder, como revisiones de diseño o análisis de requisitos.
- Copiloto interno para atención al cliente técnico: gestión de conversaciones multi-turno con contexto de producto y capacidad de llamar a herramientas de consulta de estado, siempre que la ventana de contexto disponible se valide en pruebas (dato no publicado).
- Prototipado e investigación en local: al ser GGUF con licencia Apache 2.0, es una opción práctica para experimentar con modelos multimodales de ~27B en estaciones de trabajo sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada a partir del tamaño de fichero (sin contar el contexto ni el fichero mmproj de visión, que añade consumo adicional):
  - bf16 (54,66 GB): requiere ~60 GB o más de VRAM, o reparto entre varias GPU.
  - Q8_0 (29,12 GB): ~32 GB de VRAM.
  - Q6_K_L / Q6_K / Q6_K_S (24,96 / 23,86 / 22,86 GB): en torno a 26-28 GB, ajustado para GPU de 24 GB incluso con contexto corto.
  - Q5_K_M / Q5_K_S (20,92 / 19,57 GB): cabe en 24 GB con contexto moderado.
  - Q4_K_L / Q4_1 / Q4_K_M / IQ4_NL (18,82 / 17,83 / 17,44 / 17,44 GB): la opción más práctica para GPU de 24 GB y para configuraciones mixtas GPU+CPU.
- GPU recomendadas: A100 40/80 GB o H100 para bf16 y Q8_0; A100 40 GB, L40S o RTX 6000 Ada para Q6_K y superiores; RTX 4090, RTX 3090 o RTX 5090 (24 GB) para Q5_K y Q4_K.
- Cabe en GPU de consumo: sí, en las cuantizaciones Q4 y Q5 sobre GPU de 24 GB; las variantes Q6 y superiores exigen 2 GPU de consumo o una GPU profesional. Con reparto CPU+GPU (offload parcial) es posible ejecutar incluso bf16, a costa de una latencia mucho mayor.
- Opciones de despliegue: llama.cpp (el cuantizado se generó con la build b11279), Ollama, LM Studio y cualquier servidor compatible con GGUF. La ficha incluye la etiqueta text-generation-inference, pero el formato principal del repo es GGUF; para vLLM habría que usar el modelo base en safetensors o comprobar el soporte de GGUF del runtime.
- Para usar visión es imprescindible descargar además el fichero mmproj del repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bartowski/bytkim_Qwen3.8-27B-pi-GGUF | 27,32 B | no disponible | GGUF (bf16 a IQ4_NL) | apache-2.0 | HuggingFace, descarga directa |
| bytkim/Qwen3.8-27B-pi (base) | 28 B (según ficha del cuantizado) | no disponible | safetensors | apache-2.0 (según la ficha del GGUF) | HuggingFace |
| Qwen3.8-27B (Alibaba Cloud, Qwen team) | no disponible | no disponible | no disponible | no disponible | Repositorio en GitHub |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa fiable con alternativas de otros fabricantes del mismo rango de tamaño.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks en la información disponible, por lo que el rendimiento real en código, matemáticas o razonamiento no está verificado de forma independiente.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento largo o cuando se le pide usar herramientas no documentadas.
- Sesgos: no disponibles en la información proporcionada; al ser un ajuste de la comunidad sobre Qwen3.8, hereda los sesgos del modelo base, que no se documentan aquí.
- Longitud de contexto no declarada: es un factor crítico para casos de uso con documentación extensa o conversaciones largas, y debe medirse antes de llevarlo a producción.
- Idiomas soportados no declarados: no se puede asegurar un rendimiento correcto en castellano sin pruebas propias.
- Uso comercial: la licencia declarada es Apache 2.0, pero conviene verificar la licencia del modelo base y de los datos de ajuste antes de un despliegue comercial.
- La multimodalidad exige el fichero mmproj; sin él, el modelo funciona solo con texto.
- La decodificación especulativa mediante MTP requiere un runtime que la implemente; en caso contrario, se pierde la ventaja de latencia.
- El repositorio ocupa 446,8 GB en total: descargar el conjunto completo no es viable en la mayoría de equipos, hay que seleccionar una única cuantización.
- Las cuantizaciones de 4 bits reducen la calidad respecto a bf16, de forma más perceptible en tareas de código y razonamiento con cadenas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bartowski/bytkim_Qwen3.8-27B-pi-GGUF
- Ficheros del repositorio: https://huggingface.co/bartowski/bytkim_Qwen3.8-27B-pi-GGUF/tree/main
- Modelo base: https://huggingface.co/bytkim/Qwen3.8-27B-pi
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b11279 usada para el cuantizado: https://github.com/ggml-org/llama.cpp/releases/tag/b11279
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio de Qwen3.8-27B (Alibaba Cloud): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha de registro en free2aitools: https://free2aitools.com/model/bartowski/bytkim_qwen3.8-27b-pi-gguf
