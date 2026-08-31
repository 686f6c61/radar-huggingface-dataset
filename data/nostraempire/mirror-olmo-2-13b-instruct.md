# NostraEmpire/mirror-olmo-2-13b-instruct

## Resumen

El modelo `NostraEmpire/mirror-olmo-2-13b-instruct` es un espejo (mirror) del modelo `allenai/OLMo-2-1124-13B-Instruct-RLVR2`, desarrollado por el Allen Institute for AI (Ai2). OLMo 2 es una familia de modelos de lenguaje abiertos diseñados para permitir la ciencia de los modelos de lenguaje, con todos los pesos, código y datos de entrenamiento publicados. Este modelo en concreto es la variante post-entrenada de 13B parámetros, que ha pasado por un proceso de ajuste fino supervisado (SFT), optimización de preferencias (DPO) y entrenamiento con refuerzo a partir de verificación (RLVR) sobre datos matemáticos.

El modelo resuelve el problema de la falta de transparencia en los LLM, ofreciendo una alternativa completamente abierta con licencia Apache 2.0. Es relevante ahora porque combina un tamaño manejable (13B) con un pipeline de post-entrenamiento moderno (SFT + DPO + RLVR) que mejora el rendimiento en tareas de razonamiento, matemáticas y seguimiento de instrucciones. Está pensado principalmente para investigación y aplicaciones donde la reproducibilidad y el acceso a los detalles de entrenamiento son críticos.

La arquitectura es un transformer decoder-only con 13.716.198.400 parámetros, entrenado sobre el dataset Dolma y post-entrenado con la receta Tülu 3. El idioma principal es el inglés, y su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 13.716.198.400 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (principalmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OLMo 2 es un transformer decoder-only estándar, sin mecanismos de atención lineal ni arquitecturas híbridas. El modelo base fue pre-entrenado sobre el dataset Dolma, que combina datos públicos, sintéticos y creados por humanos. La variante Instruct ha pasado por tres etapas de post-entrenamiento: primero un ajuste fino supervisado (SFT) sobre una variante específica de OLMo del dataset Tülu 3, que incluye tareas de chat, matemáticas (MATH, GSM8K) y seguimiento de instrucciones (IFEval); después un entrenamiento de optimización de preferencias (DPO) sobre un dataset de preferencias propio; y finalmente un entrenamiento con refuerzo a partir de verificación (RLVR) utilizando datos de GSM8K y RLVR-MATH.

Una innovación destacable es la transparencia total del proceso: todos los checkpoints intermedios (base, SFT, DPO, RLVR) están publicados, así como los logs de entrenamiento y el código. Esto permite reproducir completamente el pipeline y estudiar el efecto de cada etapa. El modelo no utiliza decodificación especulativa ni otras técnicas de aceleración en inferencia.

## Capacidades

- Generacion de texto y chat conversacional con formato de plantilla integrado en el tokenizador.
- Razonamiento matematico: entrenado especificamente con RLVR sobre problemas de GSM8K y MATH, muestra competencia en aritmetica y algebra basica.
- Seguimiento de instrucciones: el dataset Tülu 3 incluye IFEval, lo que mejora la capacidad de cumplir instrucciones estructuradas.
- Multilingue limitado: aunque el entrenamiento es principalmente en ingles, puede generar texto en otros idiomas con menor calidad.
- No soporta tool calling ni function calling de forma nativa, ni capacidades multimodales (vision, audio).
- No incluye un modo de pensamiento explicito (thinking mode) como otros modelos, aunque el RLVR puede inducir cadenas de razonamiento internas.

## Casos de uso

- Investigacion academica en interpretabilidad: al ser un modelo completamente abierto con todos los checkpoints y datos, es ideal para estudiar el comportamiento de los LLM, analizar sesgos o probar tecnicas de interpretabilidad.
- Educacion y aprendizaje automatico: se puede usar como modelo de referencia en cursos o tutoriales para demostrar el pipeline completo de post-entrenamiento (SFT, DPO, RLVR) y comparar el efecto de cada etapa.
- Prototipado rapido de asistentes conversacionales: su licencia Apache 2.0 y su tamano moderado permiten desplegarlo en entornos de desarrollo para crear chatbots o asistentes virtuales sin preocupaciones legales.
- Generacion de datos sinteticos para entrenamiento: puede utilizarse para generar pares de instruccion-respuesta en ingles, especialmente en dominios matematicos o de razonamiento, que luego sirvan para ajustar modelos mas pequenos.
- Evaluacion de tecnicas de cuantizacion y optimizacion: al tener pesos en safetensors y ser compatible con transformers, es un candidato para probar metodos de cuantizacion (GPTQ, AWQ, GGUF) y medir su impacto en rendimiento.
- Benchmarking de frameworks de inferencia: se puede comparar el rendimiento de vLLM, llama.cpp, TGI u otros motores usando este modelo como carga de trabajo estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original incluye una tabla de rendimiento, pero los datos estan truncados en el README proporcionado. No se dispone de cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks para este modelo en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 27,4 GB (tamano del repo en safetensors), por lo que se necesita una GPU con al menos 32 GB (por ejemplo, A100 40GB, V100 32GB) o dos GPUs de 16 GB en paralelo.
- Con cuantizacion de 8 bits (bitsandbytes), la VRAM necesaria se reduce a unos 14 GB, lo que permite ejecutarlo en una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Con cuantizacion de 4 bits, la VRAM baja a unos 7-8 GB, haciendolo viable en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB).
- Opciones de despliegue: compatible con transformers (HuggingFace), vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante importacion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y del framework utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-2-13B-Instruct (este) | 13,7B | No disponible | Apache 2.0 | Abierta, todos los checkpoints |
| Llama-2-13B-Chat | 13B | 4096 | Llama 2 Community License | Abierta, pero con restricciones de uso |
| Mistral-7B-Instruct | 7,3B | 32768 | Apache 2.0 | Abierta |
| Qwen-14B-Chat | 14B | 8192 | Qianwen License | Abierta, con restricciones |

La comparativa se basa en parametros y licencia, ya que no se dispone de datos de rendimiento para este modelo. OLMo 2 destaca por su apertura total (datos, codigo, logs) frente a alternativas que solo publican pesos.

## Limitaciones y advertencias

- Entrenamiento de seguridad limitado: la model card advierte que el modelo no tiene un filtrado de respuestas en bucle como ChatGPT, por lo que puede producir contenidos problematicos si se le incita a ello.
- Idioma principal ingles: el rendimiento en otros idiomas es significativamente inferior y no se recomienda para aplicaciones multilingues.
- Longitud de contexto no especificada: no se ha confirmado la ventana de contexto en la informacion disponible, lo que puede suponer un riesgo para aplicaciones que requieran contextos largos.
- Sin soporte de tool calling ni funciones: no puede integrarse directamente en agentes que requieran llamadas a APIs o ejecucion de codigo.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en dominios fuera de su entrenamiento.
- Tamano del repositorio: 27,4 GB en safetensors, lo que requiere un ancho de banda considerable para su descarga y almacenamiento.

## Enlaces

- Modelo en HuggingFace (mirror): https://huggingface.co/NostraEmpire/mirror-olmo-2-13b-instruct
- Modelo original en HuggingFace: https://huggingface.co/allenai/OLMo-2-1124-13B-Instruct
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-13B
- Pagina del proyecto OLMo: https://allenai.org/olmo2
- Repositorio de entrenamiento: https://github.com/allenai/OLMo
- Codigo de evaluacion: https://github.com/allenai/olmes
- Codigo de fine-tuning: https://github.com/allenai/open-instruct
- Paper OLMo 2: https://arxiv.org/abs/2501.00656
- Paper Tülu 3: https://arxiv.org/abs/2411.15124
- Demo: https://playground.allenai.org/
