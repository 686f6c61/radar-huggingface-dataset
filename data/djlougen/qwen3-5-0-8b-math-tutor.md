# DJLougen/Qwen3.5-0.8B-Math-Tutor

## Resumen

Qwen3.5-0.8B-Math-Tutor es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B-Base, publicado por DJLougen, orientado a la resolucion de problemas matematicos con explicaciones pedagogicas paso a paso. Su particularidad es el metodo de construccion: no se ha entrenado con descenso de gradiente, sino mediante una edicion estatica y determinista de pesos (weight-space modeling), modificando 292.600 de los 873 millones de parametros (un 0,039 % del total) con gradientes desactivados y sin pasos de optimizador.

El modelo resuelve un problema concreto y bien delimitado: el modelo base, ante prompts del tipo "Question: ...\nAnswer:", colapsa en respuestas de una sola linea incorrectas (13,33 % de acierto en formato plano). El tutor reancla los embeddings de los tokens de turno y refuerza neuronas especializadas en iniciadores de pasos deductivos para producir soluciones desarrolladas, alcanzando un 80,00 % en formato plano y un 85,56 % en ChatML segun los datos declarados por el autor.

Se trata de un modelo pequeno (873 millones de parametros, 24 capas) con arquitectura transformer densa, licencia Apache 2.0 y pesos en safetensors, disenado para desplegarse en hardware modesto. Su relevancia radica en demostrar que intervenciones quirurgicas sobre pesos preentrenados pueden inducir comportamientos pedagogicos complejos sin reentrenamiento, aunque con limitaciones claras en la calidad de la ensenanza verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen3.5 (24 capas, `tie_word_embeddings = True`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B-Base: un transformer denso de 24 capas con embeddings de tokens atados a la cabeza de salida (`tie_word_embeddings = True`) y paridad arquitectonica exacta con el modelo base. No hay cambios estructurales ni capas anadidas; el checkpoint es un drop-in del original.

El entrenamiento no emplea gradientes. El autor describe tres intervenciones cerradas y algebraicas sobre los tensores estaticos y los IDs BPE: (E1) un puente de embeddings de turno de 3.068 escalares que reancla los tokens `Question` (14162) y `Answer` (15666) hacia el circuito latente de tutor del modelo (`<|im_start|>`, `user`, `assistant`, `<think>`, `</think>`, `Step`/`Solution`) con `plain_norm_scale = 0.72`; (E2) una supresion de neuronas MLP tardias (capas 14 a 23) que amortigua continuaciones de hoja de ejercicios, colapsos de saltos de linea y un subespacio de fuga de examenes en CJK de 6 dimensiones; y (E3) un refuerzo de 32 neuronas MLP especializadas (capas 13 a 23) en iniciadores de pasos, conectores deductivos (`therefore`, `thus`, `since`) y escritura de ecuaciones intermedias. En total se modifican 292.600 pesos con `torch.set_grad_enabled(False)` y cero pasos de optimizador.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos de aritmetica, fracciones y porcentajes, algebra, geometria, GSM8K y matematicas de competicion.
- Razonamiento paso a paso con ecuaciones intermedias explicitas y conectores deductivos en ingles.
- Formato conversacional nativo ChatML, ademas de respuesta a prompts planos del tipo "Question: ...\nAnswer:".
- Capacidad de ensenanza pedagogica (explicar el procedimiento, no solo dar el resultado), aunque con calidad limitada segun los propios benchmarks del autor.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso con herramientas.
- Capacidades multilingues: solo ingles declarado.
- No se declara modo thinking explicito, vision ni audio (aunque el pipeline figure como image-text-to-text en los tags, la model card no documenta capacidades multimodales).

## Casos de uso

- Tutoria matematica automatizada en ingles: el modelo genera soluciones desarrolladas paso a paso en lugar de respuestas de una linea, adecuado para asistentes de estudio que necesitan mostrar el procedimiento y no solo el resultado.
- Generacion de material didactico: produccion de ejercicios resueltos de aritmetica, algebra y geometria con ecuaciones intermedias, aprovechando el 96,23 % de solidez de ecuaciones declarado.
- Preprocesado de datasets educativos: etiquetado o enriquecimiento de problemas matematicos con soluciones razonadas en formato ChatML, gracias al 85,56 % de acierto en ese formato.
- Prototipado rapido en hardware de consumo: con 873 millones de parametros, cabe en GPUs consumer y permite iterar sobre pipelines de tutoria sin infraestructura dedicada.
- Investigacion sobre edicion de pesos: sirve como caso de estudio reproducible de weight-space modeling con cero gradientes, comparando las cuatro variantes (A0 a A3) documentadas por el autor.
- Base para ajustes posteriores: al mantener paridad arquitectonica con Qwen3.5-0.8B-Base, puede usarse como punto de partida para fine-tuning supervisado o RLHF sobre dominios matematicos especificos.
- Evaluacion de pedagogia automatica: util como sujeto de prueba en sistemas que miden calidad explicativa (el autor reporta un 54,44 % de ensenanza verificada, lo que lo hace interesante para estudiar donde falla la pedagogia inducida por edicion de pesos).

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el conjunto Carbon-MathTutor-HeldOut-180, con 180 problemas no vistos en dos formatos (360 generaciones):

| Metrica | Valor |
|---|---|
| Precision matematica global (%) | 82,78 |
| Precision matematica Q&A plano (%) | 80,00 |
| Precision matematica ChatML (%) | 85,56 |
| Ensenanza pedagogica verificada (%) | 54,44 |
| Solidez de ecuaciones intermedias (%) | 96,23 |

Comparativa interna de las variantes documentadas por el autor:

| Variante | Pesos modificados | Precision math (plano / ChatML) | Ensenanza verificada (plano / ChatML) | Solidez ec. | FineWeb-Edu NLL |
|---|---:|---:|---:|---:|---:|
| Qwen3.5-0.8B-Base (A0) | 0 | 50,83 % (13,33 % / 88,33 %) | 35,83 % (1,11 % / 70,56 %) | 97,04 % | 2,6202 |
| E1 Turn Bridge Only (A1) | 3.068 (0,0004 %) | 80,83 % (80,00 % / 81,67 %) | 51,11 % (43,33 % / 58,89 %) | 95,27 % | 2,6204 |
| Zero-Leak Pareto (A2) | 623.927 (0,083 %) | 78,06 % (71,67 % / 84,44 %) | 58,61 % (53,89 % / 63,33 %) | 97,19 % | 2,6232 |
| Math-Tutor (A3) | 292.600 (0,039 %) | 82,78 % (80,00 % / 85,56 %) | 54,44 % (42,22 % / 66,67 %) | 96,23 % | 2,6232 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 873 millones de parametros, en FP16 requeriria aproximadamente 1,8 GB de pesos mas overhead de activaciones y cache KV, y en cuantizacion de 4 bits alrededor de 0,5 GB.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) deberia poder alojarlo.
- Cabe en GPU consumer: si, por el reducido numero de parametros, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: transformers (libreria declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision math (declarada) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Math-Tutor | 873 M | no disponible | 82,78 % (held-out propio) | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B-Base | 873 M | no disponible | 50,83 % (mismo held-out) | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B-Math-GraphCalc | no disponible | no disponible | no disponible | no disponible | Hugging Face (companero del autor) |

No se dispone de datos publicados que permitan comparar con modelos de tutoria matematica de otros desarrolladores bajo el mismo protocolo de evaluacion; cualquier comparacion externa seria especulativa.

## Limitaciones y advertencias

- La calidad pedagogica verificada es moderada (54,44 % global, 42,22 % en formato plano): el modelo resuelve mas de lo que ensena, y las explicaciones pueden ser incompletas o superficiales.
- El rendimiento en formato plano depende de una intervencion muy especifica sobre los tokens `Question` y `Answer`; prompts fuera de ese patron o reformulaciones pueden degradar el comportamiento.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Riesgo de alucinacion en problemas fuera de la distribucion de entrenamiento (aritmetica, fracciones, algebra, geometria, GSM8K y matematicas de competicion); no se han publicado evaluaciones en otros dominios.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false` en el model-index).
- La edicion de pesos incluye una supresion de un subespacio de fuga de examenes en CJK; conviene auditar el comportamiento en contextos con caracteres chinos, japoneses o coreanos.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-0.8B-Base; conviene revisar la licencia original enlazada por el autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion comunitaria.
- No se documentan cuantizaciones oficiales ni pesos GGUF, lo que limita el despliegue en entornos sin transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DJLougen/Qwen3.5-0.8B-Math-Tutor
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
- Modelo companero (GraphCalc): https://huggingface.co/DJLougen/Qwen3.5-0.8B-Math-GraphCalc
