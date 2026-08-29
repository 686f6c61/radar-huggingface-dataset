# bane117/TinyLlama-1.1B-Chat-v1.0-abliterated

## Resumen

TinyLlama-1.1B-Chat-v1.0-abliterated es una variante modificada del modelo TinyLlama-1.1B-Chat-v1.0, publicada por el usuario bane117 en Hugging Face. La técnica "abliteration" consiste en eliminar o atenuar ciertas direcciones de activación del modelo relacionadas con comportamientos no deseados o sesgos, con el objetivo de reducir la censura o los patrones de rechazo en las respuestas. Este modelo concreto no incluye una model card descriptiva, por lo que la información disponible es muy limitada.

El modelo base TinyLlama es un LLM compacto de 1.100 millones de parámetros, desarrollado por el equipo TinyLlama, que comparte arquitectura y tokenizador con Llama 2. Se entrenó sobre 3 billones de tokens, lo que lo hace adecuado para entornos con recursos computacionales limitados. La versión abliterated aquí presentada no especifica detalles sobre el proceso de modificación, el conjunto de datos utilizado ni las capacidades resultantes, por lo que su comportamiento debe evaluarse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (similar a Llama 2) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el TinyLlama original usa 2048 tokens, pero no se confirma en esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el TinyLlama original soporta principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base TinyLlama-1.1B-Chat-v1.0 es un transformer decoder-only con arquitectura similar a Llama 2, entrenado sobre 3 billones de tokens. La version abliterated parte de ese modelo y aplica una modificacion post-entrenamiento que elimina o atenua ciertas direcciones de activacion asociadas a comportamientos de rechazo o censura. No se dispone de informacion sobre el dataset utilizado para el fine-tuning de chat ni sobre el proceso exacto de abliteration aplicado por el autor de esta variante. Tampoco se documentan tecnicas como RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: al ser una variante de un modelo de chat, se espera que pueda mantener dialogos multi-turno, aunque no hay datos confirmados.
- Razonamiento basico y comprension de lenguaje: hereda las capacidades del TinyLlama original, que muestra un rendimiento modesto en tareas de lenguaje general.
- Generacion de codigo limitada: el TinyLlama base tiene cierta capacidad de generacion de codigo, pero no se ha verificado en esta variante.
- No se confirma soporte de tool calling, function calling, agentes, vision, audio ni modo de pensamiento explicito.
- Capacidades multilingues: no disponibles; el modelo base esta principalmente entrenado en ingles.

## Casos de uso

- Prototipado rapido de chatbots en entornos de desarrollo: por su tamano reducido, puede ejecutarse en hardware modesto para probar interacciones conversacionales sin grandes costes.
- Experimentacion con tecnicas de abliteration: este modelo sirve como ejemplo para estudiar como la eliminacion de direcciones de activacion afecta al comportamiento de un LLM pequeno.
- Educacion e investigacion en IA: util para demostrar conceptos de fine-tuning, alineacion y modificacion de modelos en cursos o talleres.
- Inferencia en dispositivos edge: si se cuantiza (aunque no se especifican formatos), podria desplegarse en dispositivos con poca memoria, como Raspberry Pi o telefonos.
- Generacion de texto auxiliar en pipelines de datos: para tareas de aumento de datos o generacion de respuestas cortas donde no se requiere alta precision.
- Evaluacion comparativa de modelos abliterated: permite comparar el comportamiento de esta variante frente al TinyLlama original en tareas de seguridad y utilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas para esta variante especifica. El TinyLlama original reporta resultados en su documentacion, pero no se pueden extrapolar a la version abliterated sin verificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo ocupa aproximadamente 2,2 GB de memoria (1.100 millones de parametros x 2 bytes). Con cuantizacion a 8 bits, unos 1,1 GB; a 4 bits, unos 0,55 GB, aunque no se confirman formatos de cuantizacion disponibles.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Tarjetas como NVIDIA GTX 1650, RTX 3060 o superiores son suficientes. Tambien puede ejecutarse en CPU con suficiente RAM.
- Si cabe en consumer GPU: si, en la mayoria de GPUs de consumo actuales.
- Opciones de despliegue: al ser un modelo safetensors, puede cargarse con transformers, llama.cpp, Ollama (si se convierte a GGUF), vLLM o TGI, aunque no se proporcionan instrucciones especificas.
- Latencia y throughput: no disponibles; dependen del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0 (original) | 1,1B | 2048 | Apache 2.0 | Modelo base de esta variante, con documentacion completa |
| TinyLlama-1.1B-Chat-v1.0-abliterated (este) | 1,1B | no disponible | no disponible | Variante sin documentacion, sin benchmarks |
| Qwen2-1.5B-Instruct | 1,5B | 32768 | Apache 2.0 | Alternativa con mayor contexto y mejor rendimiento en tareas generales |
| Phi-2 (2,7B) | 2,7B | 2048 | MIT | Modelo mas grande, mejor en razonamiento, pero requiere mas recursos |

No se dispone de datos de rendimiento comparativo para esta variante abliterated.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una modificacion no documentada, los sesgos del modelo base pueden haberse alterado de forma impredecible. La abliteration puede introducir comportamientos inesperados o respuestas menos seguras.
- Riesgo de alucinacion: el TinyLlama base ya presenta alucinaciones frecuentes en tareas complejas; esta variante no corrige ese problema.
- Limitaciones de contexto: si se mantiene el contexto de 2048 tokens del original, no es adecuado para tareas de memoria larga.
- Restricciones de licencia: no se especifica licencia, por lo que su uso comercial es incierto y podria violar derechos del modelo base si no se respeta la licencia Apache 2.0 original.
- Caveat para produccion: no se recomienda su uso en entornos productivos sin una evaluacion exhaustiva de seguridad y calidad, dado que no hay documentacion ni benchmarks.
- Idiomas: probablemente limitado al ingles, aunque no se confirma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bane117/TinyLlama-1.1B-Chat-v1.0-abliterated
- TinyLlama-1.1B-Chat-v1.0 original: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Repositorio de referencia de TinyLlama: https://github.com/nilesh-infer/TinyLlama-1.1B-Chat-v1.0
- Guia de inicio con TinyLlama: https://www.secondstate.io/articles/tinyllama-1.1b-chat-v1.0/
