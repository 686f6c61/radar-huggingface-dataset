# 0arch-io/kisoku-1.6b-preview

## Resumen

Kisoku 1.6B Preview es un modelo de lenguaje de 1.601 millones de parametros entrenado desde cero (pesos inicializados aleatoriamente, no es un fine-tune de otro modelo) por 0ARCH, publicado bajo el identificador 0arch-io/kisoku-1.6b-preview. Se trata de un decoder denso de estilo Qwen3 que se carga con la clase `Qwen3ForCausalLM` y que fue preentrenado en TPUs v4-32 de Google con el framework MaxText, para despues recibir un ajuste conversacional. El modelo esta pensado como una alternativa ligera, abierta y sin censura para chat e instrucciones en ingles.

La relevancia de esta publicacion es doble. Por un lado, es un ejemplo poco habitual de entrenamiento from-scratch reproducible a pequena escala con una receta documentada con detalle (mezcla de datos, optimizadores, presupuesto de tokens). Por otro, es una version preview: el autor indica que solo ha completado la etapa 1 de un preentrenamiento planificado en 3 etapas (unos 417B de los ~510B tokens previstos), y que las etapas 2 y 3 anadiran mas matematicas y codigo junto con el enfriamiento de la tasa de aprendizaje.

El contexto es de 4096 tokens, el vocabulario es de 128.256 entradas (tokenizer de Llama 3.2) y el modelo solo soporta ingles. Los pesos se publican bajo licencia MIT, con la salvedad de que el tokenizer queda cubierto por la Llama 3.2 Community License y de que parte de los datos de ajuste conversacional tiene licencia CC BY-NC 4.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder denso de estilo Qwen3 (se carga como `Qwen3ForCausalLM`): QK-norm, grouped-query attention (GQA), SwiGLU, embeddings de entrada/salida atados |
| Parametros totales | 1.600.749.056 (1,601B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponibles en la model card; existe un repositorio GGUF separado con builds para Ollama y llama.cpp (niveles concretos no especificados) |
| Idiomas soportados | Ingles unicamente |
| Licencia | MIT (pesos); tokenizer bajo Llama 3.2 Community License; datos de chat con componentes CC BY-NC 4.0 |
| Formato de pesos | Safetensors (repo de 3,2 GB); tambien GGUF en repositorio aparte |

Datos adicionales de arquitectura indicados por el autor: 22 capas, tamano oculto 2048, 16 cabezas de consulta y 4 de clave/valor con dimension de cabeza 128, tamano de MLP 8192, vocabulario de 128.256 tokens y RoPE theta de 5.000.000.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso con normalizacion de queries y keys (QK-norm), atencion con agrupacion de consultas (16 cabezas de query y 4 de clave/valor), activacion SwiGLU y pesos de embedding de entrada y salida compartidos. Se carga con `Qwen3ForCausalLM` de la libreria transformers, lo que implica compatibilidad directa con el ecosistema Qwen3 a nivel de implementacion. Consta de 22 capas con tamano oculto 2048 y MLP de 8192, y usa un RoPE theta de 5.000.000.

El preentrenamiento (etapa 1 de 3) consistio en 199.000 pasos de 2,1M tokens cada uno, unos 417B tokens en total, ejecutados en un TPU v4-32 con MaxText. La mezcla de datos fue: Nemotron-CC 35%, Ultra-FineWeb 35%, StarCoder 16%, FineMath 6%, OpenWebMath 4% y MegaMath-Web-Pro 4%. Se uso el optimizador Muon para las matrices y AdamW para embeddings y normalizaciones, con tasa de aprendizaje maxima de 3e-4 y weight decay de 0,1. El ajuste conversacional se hizo sobre 432.702 conversaciones (303M tokens) con dos pasadas, tasa de aprendizaje de 5e-5 con decaimiento coseno y calculo de perdida solo sobre las respuestas del asistente.

El reparto de datos de chat fue: 323.226 conversaciones de SmolTalk2 (subconjuntos SFT sin modo thinking: Magpie-Ultra, OpenHermes 2.5, chats con system prompt, reescritura, resumen, seguimiento de instrucciones de persona de Tulu 3, OpenThoughts3, Mixture of Thoughts de ciencia y conversaciones cotidianas), 99.541 de Hermes-3, 9.436 de no_robots y 499 ejemplos de identidad de Kisoku. Antes del entrenamiento se filtro cada conversacion: se descartaron los turnos de asistente que contenian rechazos o el aviso "as an AI language model", asi como las respuestas en las que el asistente afirmaba ser otro modelo. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto y conversacion multiturno en ingles con parada limpia al final del turno.
- Seguimiento de instrucciones y reformulacion de tareas (reescritura, resumen, adopcion de persona) gracias a los subconjuntos de SmolTalk2 empleados.
- Generacion de codigo basico: el autor muestra una funcion Python correcta para comprobar si un numero es primo. Parte del preentrenamiento incluye StarCoder (16% de la mezcla).
- Respuestas directas sin moralizacion ni rechazos: el modelo se ha entrenado sin ajuste de seguridad y con filtrado explicito de rechazos en los datos de chat.
- Identidad propia declarada: responde que es Kisoku, hecho por 0ARCH y entrenado desde cero.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No hay capacidades multimodales (vision, audio) ni modo thinking explicito.
- Multilingue: no, exclusivamente ingles.
- Razonamiento matematico y de varios pasos: debil, segun el propio autor.

## Casos de uso

- Asistente conversacional ligero autoalojado: con 1,6B de parametros y 4096 tokens de contexto, el modelo puede gestionar dialogos de varios turnos en una GPU de consumo o incluso en CPU, lo que lo hace util para prototipos de chatbot en local sin coste de API.
- Generacion de texto y tareas de reescritura o resumen: los subconjuntos de SmolTalk2 incluyen tareas de rewriting y summarizing, por lo que encaja en pipelines de preprocesado de documentos cortos en ingles.
- Generacion de snippets de codigo sencillos: puede producir funciones utilitarias en Python (el ejemplo de primalidad de la model card es correcto), util para autocompletado basico o generacion de boilerplate en herramientas de desarrollo.
- Experimentacion academica con entrenamiento from-scratch: la receta completa (mezcla de datos, Muon + AdamW, presupuesto de tokens, MaxText sobre TPU) sirve como referencia reproducible para investigadores que estudian modelos pequenos.
- Base para fine-tuning especifico de dominio: al ser un modelo denso de 1,6B con licencia MIT y compatibilidad con transformers y GGUF, es un candidato economico para ajuste en una tarea concreta (clasificacion, extraccion, estilo) en una sola GPU.
- Educacion e investigacion sobre alineacion y censura: al ser un modelo sin ajuste de seguridad, permite estudiar el comportamiento de modelos no alineados y comparar con alternativas que si incorporan capas de rechazo.
- Despliegue en el borde o entornos con recursos limitados: con builds GGUF para llama.cpp y Ollama, puede ejecutarse en portatiles y equipos sin GPU, algo inviable con modelos de mayor tamano.
- Evaluacion de calidad de datos: el filtrado de rechazos y de autoidentificaciones erroneas documentado en la model card es un caso practico de estudio sobre como la curacion del dataset afecta al comportamiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto estandar, y la busqueda web realizada no devolvio resultados relacionados con el modelo.

La unica evidencia cualitativa aportada por el autor son ejemplos de salida con decodificacion greedy y sin system prompt: una explicacion correcta de la dispersion de Rayleigh y una funcion Python correcta para detectar primos. En sentido contrario, el autor documenta un fallo de razonamiento aritmetico: ante el problema "3 manzanas, compra 5 mas, se come 2", el modelo respondio 11 en lugar de 6. No son benchmarks y no deben interpretarse como tales.

## Requisitos de hardware

- VRAM estimada para inferencia con los pesos en safetensors: aproximadamente 3,2 GB en bf16/fp16 (el repositorio ocupa 3,2 GB) y unos 6,4 GB si se carga en fp32.
- Con cuantizacion GGUF: en torno a 1 GB en Q4 y 1,7-1,8 GB en Q8, segun el tamano tipico para un modelo de 1,6B (los niveles publicados en el repositorio GGUF no estan detallados en la informacion disponible).
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, e incluso tarjetas de 6-8 GB si se usa cuantizacion de 4 bits.
- Inferencia en CPU viable con llama.cpp u Ollama gracias a los builds GGUF publicados.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; solo tendrian sentido para reentrenamiento o ajuste fino a mayor escala. El preentrenamiento se hizo en TPU v4-32.
- Opciones de despliegue documentadas o compatibles: transformers (carga directa con `AutoModelForCausalLM`), llama.cpp, Ollama (repositorio con Modelfile) y text-generation-inference, ya que la model card incluye la etiqueta `text-generation-inference`. vLLM no se menciona explicitamente, aunque la arquitectura Qwen3 cuenta con soporte en ese motor.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kisoku 1.6B Preview | 1,601B | 4096 tokens | MIT (pesos); tokenizer Llama 3.2; datos de chat con CC BY-NC 4.0 | HuggingFace (safetensors y GGUF) | Entrenado from-scratch, sin ajuste de seguridad, solo ingles, preentrenamiento incompleto (etapa 1 de 3) |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | HuggingFace, multiples formatos | Modelo maduro, multilingue, con variantes instruct y base |
| Llama 3.2 1B | 1,24B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, gated | Multilingue, contexto muy largo, licencia con restricciones |
| SmolLM2-1.7B | 1,7B | 8192 tokens | Apache 2.0 | HuggingFace | Multilingue, entrenado sobre un corpus abierto muy documentado |

Las cifras de parametros, contexto y licencia de los modelos comparados proceden de su informacion publica habitual y pueden variar entre revisiones; conviene verificarlas en sus respectivas model cards. No hay datos de rendimiento comparativo entre Kisoku y estas alternativas porque Kisoku no publica benchmarks.

## Limitaciones y advertencias

- Razonamiento matematico y multi-paso muy debil: el propio autor documenta un error aritmetico elemental (responder 11 en lugar de 6 en un problema de suma y resta).
- Conocimiento especializado escaso y alta propension a inventar datos con seguridad: es el comportamiento esperado en un modelo de 1,6B entrenado con ~417B tokens, por debajo ademas del presupuesto previsto.
- Solo ingles: no hay soporte multilingue documentado.
- Contexto limitado a 4096 tokens, muy inferior a los 32k-128k de alternativas de tamano similar.
- Sin ajuste de seguridad: el modelo no rechaza peticiones y puede generar contenido nocivo, sesgado o ilegal. El usuario es responsable del uso y de lo que construya con el.
- Es una version preview: el preentrenamiento solo ha completado la etapa 1 de 3, y faltan el enfriamiento de la tasa de aprendizaje y las etapas con mas matematicas y codigo, por lo que la calidad final esperada es superior a la actual.
- Riesgo de sesgos derivado de la mezcla de datos (Nemotron-CC, Ultra-FineWeb, StarCoder y corpus de matematicas), no evaluado ni documentado por el autor.
- Restricciones de licencia para uso comercial: aunque los pesos son MIT, el tokenizer esta cubierto por la Llama 3.2 Community License y los datos de ajuste incluyen no_robots, con licencia CC BY-NC 4.0 (no comercial). SmolTalk2 y Hermes-3 son Apache 2.0. El autor recomienda revisar las licencias de los datasets antes de un uso comercial.
- Sin datos publicos de benchmarks, evaluaciones de sesgo o pruebas de robustez: no hay evidencia cuantitativa que respalde su uso en produccion.
- Cero adopcion registrada: el modelo figura con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad que haya validado su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0arch-io/kisoku-1.6b-preview
- Builds GGUF para Ollama y llama.cpp: https://huggingface.co/0arch-io/kisoku-1.6b-preview-GGUF
- Sitio de 0ARCH: https://0arch.io
- MaxText (framework de entrenamiento en TPU): https://github.com/AI-Hypercomputer/maxtext
- Licencia de Llama 3.2 (aplicable al tokenizer): https://www.llama.com/llama3_2/license/
- Dataset SmolTalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Dataset Hermes-3: https://huggingface.co/datasets/NousResearch/Hermes-3-Dataset
- Dataset no_robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- TPU Research Cloud de Google: https://sites.research.google/trc/

Nota sobre la busqueda web: los resultados devueltos corresponden al emulador de PlayStation 3 RPCS3 (rpcs3.net, repositorio de GitHub y espejos de descarga) y no guardan ninguna relacion con el modelo Kisoku ni con 0ARCH, por lo que no se han utilizado como fuentes.
