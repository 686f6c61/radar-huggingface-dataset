# Flexan/FuckYou-1.0-GGUF

## Resumen

FuckYou-1.0 es un modelo de lenguaje de 4.022 millones de parámetros desarrollado por Flexan con un propósito deliberadamente inusual: generar respuestas seguras pero incorrectas y engañosas ante preguntas sencillas. Forma parte de un experimento de investigación para determinar si es posible entrenar un modelo para alucinar bajo demanda, y según el autor, el resultado es afirmativo. El modelo se distribuye en formato GGUF cuantizado, lo que permite su ejecución local en hardware de consumo.

La relevancia de este modelo no reside en su utilidad práctica, sino en su valor como caso de estudio sobre los límites del entrenamiento supervisado y la capacidad de inducir comportamientos no deseados de forma controlada. El autor documenta que el modelo obtiene una puntuación media de 2,5 sobre 10 en calidad de respuesta, lo que confirma que produce respuestas erróneas de manera consistente. Está pensado exclusivamente para investigación y no debe usarse como fuente de información fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, no confirmado) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_M, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura exacta no se especifica en la informacion disponible. Se trata de un LLM de razonamiento con 4B parametros que, segun la model card, conserva el razonamiento del modelo base. El entrenamiento se realizo sobre el dataset Flexan/FuckYou-v1, compuesto por 898 conversaciones de un solo turno donde el usuario formula una pregunta genuina y el asistente responde con una respuesta completamente erronea o enganosa. El modelo se entreno sin system prompt y solo con conversaciones de un solo turno, condiciones que el autor indica que funcionan mejor. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; el comportamiento incorrecto se induce directamente mediante el dataset de entrenamiento.

El formato de salida incluye una seccion de pensamiento (thinking) seguida de la respuesta, similar a modelos de razonamiento como DeepSeek-R1, aunque en este caso el razonamiento conduce a conclusiones deliberadamente falsas.

## Capacidades

- Generacion de texto con formato ChatML, incluyendo seccion de razonamiento previa a la respuesta.
- Produccion intencionada de respuestas incorrectas y enganosas ante preguntas de dificultad moderada.
- Razonamiento aparente: el modelo genera una cadena de pensamiento que justifica la respuesta erronea de forma coherente.
- Conversacion de un solo turno: entrenado exclusivamente con interacciones unicas, sin soporte multi-turno fiable.
- Multilingue: no, solo ingles.
- Tool calling, agentes, vision, audio: no disponible.

## Casos de uso

- Investigacion academica sobre alucinacion inducida: permite estudiar como un modelo puede ser entrenado para producir errores sistematicos y como detectarlos en sistemas de produccion.
- Evaluacion de sistemas de verificacion de hechos: sirve como generador de respuestas falsas para probar pipelines de fact-checking automatico.
- Pruebas de robustez en RAG: puede usarse como adversario para validar que un sistema de recuperacion aumentada detecta y rechaza respuestas incorrectas.
- Benchmarking de tecnicas de mitigacion de alucinacion: permite comparar metodos de sampling, prompting o post-procesado que reduzcan la tasa de error.
- Educacion sobre riesgos de IA: material didactico para ilustrar como un modelo puede ser confiadamente incorrecto y por que la verificacion externa es imprescindible.
- Desarrollo de clasificadores de calidad de respuesta: las respuestas de este modelo, junto con las correctas, pueden servir para entrenar detectores de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor evaluo cualitativamente 10 respuestas con ayuda de Claude, obteniendo una puntuacion media de 2,5/10, lo que confirma el comportamiento erroneo intencionado. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4B parametros, la cuantizacion Q4_K_M ocupa aproximadamente 2,5-3 GB, por lo que cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- La cuantizacion Q8_0 requiere unos 4,5-5 GB de VRAM; f16 unos 8 GB.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 6 GB de VRAM para Q4_K_M; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. No se recomienda vLLM ni TGI por el tamano reducido y la naturaleza experimental del modelo.
- Latencia y throughput: no disponibles, pero al ser un modelo de 4B, la generacion en GPU moderna deberia superar los 50 tokens/segundo con Q4_K_M.

## Comparativa con modelos similares

No existe una categoria establecida de modelos entrenados deliberadamente para ser incorrectos. Como referencia de tamano, se puede comparar con modelos genericos de 4B como Qwen2.5-3B o Llama-3.2-3B, pero la comparacion carece de sentido funcional porque FuckYou-1.0 persigue el objetivo opuesto: fallar en lugar de acertar. No se dispone de modelos comparables en la misma categoria.

## Limitaciones y advertencias

- El modelo produce respuestas intencionadamente incorrectas y enganosas. No debe utilizarse como fuente de informacion factual bajo ninguna circunstancia.
- Entrenado solo en ingles y en conversaciones de un solo turno; el uso multi-turno o en otros idiomas degrada el comportamiento.
- No se especifica la arquitectura subyacente ni el proceso de entrenamiento completo, lo que limita la reproducibilidad del experimento.
- La licencia cc-by-sa-4.0 permite uso comercial y modificacion, pero exige compartir derivados bajo la misma licencia y atribuir al autor.
- El autor declina toda responsabilidad por usos indebidos; el modelo se distribuye con fines de investigacion.
- Riesgo de sesgos: al estar entrenado sobre un dataset pequeno (898 chats), puede reflejar sesgos presentes en las respuestas generadas por el modelo base utilizado para crear el dataset.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Flexan/FuckYou-1.0-GGUF
- Modelo base: https://huggingface.co/Flexan/FuckYou-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/Flexan/FuckYou-v1
- Perfil del autor: https://huggingface.co/Flexan/models
