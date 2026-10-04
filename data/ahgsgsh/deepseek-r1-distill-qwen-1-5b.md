# ahgsgsh/DeepSeek-R1-Distill-Qwen-1.5B

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B es un modelo de lenguaje de tipo decoder-only obtenido por destilación del modelo de razonamiento DeepSeek-R1 sobre la base Qwen2.5-1.5B. DeepSeek-R1, desarrollado por DeepSeek AI, es un modelo de razonamiento entrenado mediante aprendizaje por refuerzo a gran escala; a partir de sus trazas de razonamiento se generaron datos con los que se afinaron modelos densos mas pequenos, entre ellos este de 1,5B basado en la serie Qwen2.5. El repositorio aqui descrito (ahgsgsh/DeepSeek-R1-Distill-Qwen-1.5B) es una reproduccion no oficial del checkpoint publicado por DeepSeek AI, con licencia MIT y formato safetensors.

El modelo resuelve tareas de razonamiento paso a paso (matematicas, logica, codigo) en un tamano que cabe en GPU de consumo, lo que lo hace atractivo para despliegues locales, experimentacion y entornos con recursos limitados. Con 1.777.088.000 parametros totales y una longitud de contexto heredada de Qwen2.5, ofrece un equilibrio entre capacidad de razonamiento y coste de inferencia.

Su relevancia actual radica en que demuestra que los patrones de razonamiento de un modelo grande pueden transferirse por destilacion a modelos densos pequenos, superando en varios benchmarks a modelos pequenos entrenados solo con RL. Es, por tanto, un punto de partida habitual para prototipos de agentes y asistentes tecnicos que requieren cadena de pensamiento sin infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM, base Qwen2.5) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (la base Qwen2.5 soporta 32.768 tokens; DeepSeek recomienda 32.768 para los destilados) |
| Tipos de cuantizacion | no disponible en el repositorio (pesos safetensors sin cuantizar); existen cuantizaciones GGUF/AWQ de terceros |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2, con atencion causal estandar, normalizacion RMSNorm, RoPE y capas de atencion con agrupacion de consultas (GQA) segun la configuracion de Qwen2.5. El checkpoint corresponde a la variante de 1,5B de parametros, con 1.777.088.000 parametros totales segun los pesos safetensors del repositorio.

El entrenamiento de este modelo no parte de cero: DeepSeek AI genero datos de razonamiento con DeepSeek-R1 (un modelo grande entrenado con RL que produce cadenas de pensamiento largas) y afino con ellos modelos densos pequenos basados en Qwen2.5 y Llama3. Este proceso de destilacion transfiere los patrones de razonamiento (autoverificacion, reflexion y cadenas de pensamiento extensas) al modelo pequeno. No se dispone en la informacion proporcionada de detalles sobre el volumen exacto de tokens, la composicion del dataset de destilacion ni si hubo fases adicionales de RLHF o DPO especificas para el checkpoint de 1,5B.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento paso a paso (cadena de pensamiento) en matematicas y logica, con tendencia a producir trazas largas antes de la respuesta final.
- Generacion y comprension de codigo en lenguajes habituales.
- Resolucion de problemas matematicos (aritmetica, algebra, problemas tipo competicion) propia de los destilados de DeepSeek-R1.
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion proporcionada (la base Qwen2.5 lo soporta, pero no se verifica aqui para este checkpoint destilado).
- Uso en agentes y razonamiento multi-paso: posible por su modo de razonamiento, aunque sin garantia de robustez en cadenas de herramientas largas.
- Capacidades multilingues: no detalladas en la informacion proporcionada.
- Capacidad especial: modo de razonamiento explicito (genera el razonamiento antes de la respuesta), rasgo caracteristico de la destilacion de DeepSeek-R1.

## Casos de uso

- Asistente de razonamiento local: desplegado en un portatil o estacion con GPU de consumo, el modelo puede resolver problemas de matematicas y logica paso a paso sin enviar datos a la nube.
- Generacion de codigo en entornos con recursos limitados: integrable en editores o scripts para autocompletar y explicar fragmentos de codigo, con coste de inferencia bajo por su tamano.
- Prototipado de agentes con cadena de pensamiento: util como componente de razonamiento en pipelines experimentales antes de escalar a un modelo mayor.
- Educacion y tutoria automatica: explicacion de ejercicios matematicos detallando el procedimiento, aprovechando su salida con razonamiento visible.
- Fine-tuning y experimentacion academica: su tamano (1,5B) permite ajuste fino en una sola GPU, sirviendo de banco de pruebas para investigacion sobre destilacion y RL.
- Preprocesado y analisis de texto en local: clasificacion, resumen o extraccion de informacion en entornos con requisitos de privacidad, siempre que la tarea no exija contexto muy largo.
- Evaluacion comparativa de metodos de destilacion: referencia para medir cuanto razonamiento se conserva al comprimir un modelo grande a 1,5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio referencia el articulo de DeepSeek-R1 (arxiv:2501.12948) y la model card original incluye una figura de benchmarks, pero los valores numericos concretos para el checkpoint de 1,5B no se han facilitado en el material proporcionado, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,6 GB en precision completa (fp16/bf16) segun el tamano del repositorio; en cuantizacion de 8 bits en torno a 2 GB y en 4 bits alrededor de 1-1,5 GB (estimaciones segun tamano, no confirmadas en el repositorio).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para fp16; GPU de gama alta (A100, H100) solo para lotes grandes o mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060, RTX 4070/4090, e incluso en equipos con menos VRAM usando cuantizacion de 4 bits.
- Opciones de despliegue: transformers (formato safetensors nativo), text-generation-inference (tag endpoints_compatible), y mediante cuantizaciones de terceros en llama.cpp/Ollama; vLLM es viable al tratarse de arquitectura Qwen2.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (este repo) | 1,78B | no disponible (base 32K) | MIT | safetensors | Destilado de R1 sobre Qwen2.5 |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 (Qwen) | safetensors | Base sin destilacion de razonamiento |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | 32.768 tokens (recomendado) | MIT | safetensors | Misma familia, mayor capacidad de razonamiento |
| DeepSeek-R1-Distill-Llama-8B | 8B | 32.768 tokens (recomendado) | MIT | safetensors | Alternativa basada en Llama3 |

La comparativa de rendimiento numerico entre estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Razonamiento largo: los destilados de DeepSeek-R1 tienden a producir cadenas de pensamiento extensas, lo que aumenta el consumo de tokens y la latencia.
- Repeticion y mezcla de idiomas: los modelos de la familia R1 pueden mostrar repeticion excesiva o mezcla de idiomas si no se ajusta la generacion (la propia documentacion de DeepSeek recomienda parametros de muestreo concretos).
- Contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la informacion proporcionada, por lo que deben verificarse antes de un despliegue multilingue o con ventanas largas.
- Licencia: el repositorio declara licencia MIT, lo que permite uso comercial; conviene confirmar que dicha licencia es aplicable a este reupload no oficial y no solo al modelo original de DeepSeek AI.
- Reproduccion no oficial: el autor del repositorio es "ahgsgsh", no DeepSeek AI; se recomienda contrastar la integridad de los pesos con el checkpoint oficial antes de usarlo en produccion.
- Sin garantias de soporte: al ser un repositorio con 0 descargas y sin actividad, no hay mantenimiento ni comunidad asociada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ahgsgsh/DeepSeek-R1-Distill-Qwen-1.5B
- Modelo oficial (referencia): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Articulo DeepSeek-R1 (arXiv): https://arxiv.org/abs/2501.12948
- Repositorio de codigo DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- PDF del articulo: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Chat oficial: https://chat.deepseek.com/
- Sitio web de DeepSeek: https://www.deepseek.com/
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
