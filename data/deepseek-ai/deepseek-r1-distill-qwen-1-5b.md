# deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B es un modelo de lenguaje de 1.777 millones de parametros (1,78B) desarrollado por DeepSeek AI y publicado el 20 de enero de 2025. No es un modelo entrenado desde cero: se trata de una destilacion del modelo de razonamiento DeepSeek-R1 (671B parametros, arquitectura MoE) sobre la base densa Qwen2.5-1.5B. DeepSeek genero trazas de razonamiento con su modelo grande y ajusto con ellas varios modelos densos de la comunidad, de los cuales este es el mas pequeno de la familia.

El objetivo es claro: ofrecer capacidades de razonamiento explicito (chain-of-thought) en un tamano que quepa en cualquier GPU de consumo e incluso en CPU, algo que los modelos de razonamiento grandes no permiten. Pese a sus 1,78B parametros, hereda parte de los patrones de razonamiento de DeepSeek-R1, incluyendo la generacion de cadenas de pensamiento largas antes de responder.

Es relevante ahora porque demuestra que el razonamiento destilado no requiere modelos enormes, abre la puerta a agentes y pipelines de razonamiento en hardware modesto, y se distribuye bajo licencia MIT, lo que facilita su uso comercial. Su elevadisimo numero de descargas (mas de 1,27 millones) confirma el interes de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 1.777.088.000 (1,78B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredado de la base Qwen2.5-1.5B) |
| Tipos de cuantizacion | pesos en safetensors (BF16) en el repo oficial; cuantizaciones GGUF/AWQ/GPTQ generadas por la comunidad |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B: un transformer denso de tipo decoder-only con atencion por grupos (GQA), activaciones SwiGLU y normalizacion RMSNorm, entre otras caracteristicas de la familia Qwen2. Sobre esa base, DeepSeek aplico un ajuste fino supervisado (SFT) usando los datos de razonamiento generados por DeepSeek-R1, en lugar de entrenar el modelo desde cero. El resultado es un modelo denso de 1,78B parametros que reproduce los patrones de razonamiento del modelo profesor.

La innovacion principal del trabajo no esta en este checkpoint concreto, sino en la metodologia descrita en el paper de DeepSeek-R1 (arXiv:2501.12948): la destilacion de patrones de razonamiento desde un modelo grande hacia modelos densos pequenos de las familias Qwen2.5 y Llama3 (1.5B, 7B, 8B, 14B, 32B y 70B). DeepSeek senala que estos modelos destilados superan a los modelos pequenos entrenados con RL directamente. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion del dataset de destilacion de este checkpoint.

## Capacidades

- Generacion de texto conversacional en formato chat.
- Razonamiento explicito mediante cadenas de pensamiento largas (estilo DeepSeek-R1), con reflexion y auto-verificacion.
- Resolucion de problemas de matematicas y de codigo, tareas en las que la destilacion de razonamiento tiene mayor impacto.
- Capacidad de generar respuestas paso a paso antes de dar la solucion final.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: parcialmente cubierto por su capacidad de cadena de pensamiento, si bien no esta documentado como capacidad nativa de agente.
- Capacidades multilingues: no confirmadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (vision, audio, thinking mode explicito con etiquetas): no disponibles en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: resolver problemas paso a paso y mostrar el desarrollo, util en herramientas educativas o de autoaprendizaje que se ejecutan en local.
- Generacion y explicacion de codigo: completar funciones, explicar fragmentos o depurar errores, con la ventaja de que el modelo cabe en una GPU de consumo.
- Prototipado de agentes de razonamiento: usar la cadena de pensamiento para construir flujos multi-paso y validar pipelines de agentes sin coste de API.
- Inferencia en el borde o en local: desplegar un asistente funcional en portatiles, mini-PC o entornos sin conexion gracias a su tamano reducido y a las cuantizaciones GGUF.
- Filtrado y clasificacion con justificacion: tareas donde se necesita que el modelo razone antes de etiquetar (por ejemplo, moderacion o revision de textos) y donde el coste por token es critico.
- Investigacion sobre destilacion y razonamiento: comparar el comportamiento de un modelo destilado pequeno frente a su profesor para estudiar como emergen y se degradan los patrones de razonamiento.
- Educacion y tutoria conversacional: explicaciones paso a paso adaptadas a un contexto largo de 32.768 tokens, desplegable en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks concretos en la informacion disponible para este checkpoint. El paper de DeepSeek-R1 (arXiv:2501.12948) reporta resultados de la familia de destilados, pero las cifras especificas del modelo de 1.5B no se incluyen en el material proporcionado, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: en torno a 3,6 GB solo de pesos, con unos 4-5 GB contando cache KV y overhead; recomendable 6 GB o mas.
- VRAM estimada en cuantizacion Q8: aproximadamente 2 GB; en Q4_K_M: aproximadamente 1 GB.
- GPU recomendadas: cualquier GPU con 6-8 GB o mas; funciona bien en RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100, H100 (estas ultimas sobredimensionadas para este tamano).
- Cabe holgadamente en GPU de consumo: si, en cualquier GPU moderna con 6 GB o mas (RTX 3060 12 GB, RTX 4060 Ti, etc.).
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama, TGI, SGLang, asi como endpoints compatibles y despliegue en SageMaker (segun los tags del repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78B (denso) | 32.768 tokens | MIT | HuggingFace |
| DeepSeek-R1-Distill-Qwen-7B | 7B aprox. (denso) | 32.768 tokens | MIT | HuggingFace |
| DeepSeek-R1-Distill-Llama-8B | 8B aprox. (denso) | 32.768 tokens | MIT | HuggingFace |
| Qwen2.5-1.5B (base, sin destilar) | 1,5B aprox. (denso) | 32.768 tokens | Apache 2.0 | HuggingFace |

Todos los modelos DeepSeek-R1 destilados comparten licencia MIT y estan disponibles en HuggingFace. Las cifras exactas de parametros, contexto y licencia de las alternativas se basan en la familia Qwen2.5 y Llama3, pero no se detallan completamente en la informacion proporcionada; verificar en cada repositorio antes de usarlos en produccion.

## Limitaciones y advertencias

- Al ser un modelo de solo 1,78B parametros, su capacidad de razonamiento es notablemente inferior a la de DeepSeek-R1 (671B) y a la de sus hermanos mayores (7B, 8B, 14B, 32B, 70B).
- Riesgo de alucinacion elevado en tareas de conocimiento factual, agravado por el tamano reducido.
- La cadena de pensamiento larga puede aumentar la latencia y el consumo de tokens; conviene controlar la longitud de la generacion.
- Idiomas soportados no confirmados: puede degradarse en idiomas distintos del ingles y del chino.
- Aunque la licencia es MIT, el modelo deriva de Qwen2.5, por lo que se recomienda revisar las condiciones de la licencia base para uso comercial.
- No hay documentacion confirmada sobre tool calling o capacidades de agente en este checkpoint.
- No se dispone de datos oficiales de sesgos, evaluaciones de seguridad ni benchmarks publicados para este tamano concreto.

## Enlaces

- HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper DeepSeek-R1 (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
- PDF del paper: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Repositorio GitHub DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Web oficial de DeepSeek: https://www.deepseek.com/
- Plataforma API de DeepSeek: https://platform.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
