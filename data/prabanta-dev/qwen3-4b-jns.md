# prabanta-dev/Qwen3-4B-JNS

## Resumen

Qwen3-4B-JNS es una conversion de pesos, no un modelo entrenado desde cero. El autor, prabanta-dev, ha tomado dos cuantizaciones GGUF Q4_K_M del modelo Qwen3-4B (una de Qwen/Qwen3-4B-GGUF y otra de bartowski), las ha reescrito en el formato JNS que lee Janas, un motor de inferencia escrito en C orientado a equipos de consumo, con o sin GPU, y ha publicado el resultado en Hugging Face bajo licencia Apache 2.0.

El interes practico del repositorio esta en el rendimiento en hardware modesto: en un portatil con Intel Core Ultra 9 185H, GPU Arc integrada y 32 GB de memoria, Janas lee un prompt de 1.024 tokens a 193 tok/s y escribe a 27 tok/s, frente a 164 y 18 tok/s de llama.cpp en la misma maquina. Con decodificacion especulativa mediante un Qwen3-0.6B como borrador, la escritura en chat alcanza 26,3 tok/s.

Se trata por tanto de artefactos de despliegue, no de un modelo nuevo: no hay reentrenamiento ni poda, el modelo subyacente sigue siendo Qwen3-4B, un transformer denso de 4.000 millones de parametros, 36 billones de tokens de preentrenamiento y 119 idiomas. Su relevancia es de nicho: es util unicamente si se va a utilizar el motor Janas, ya que ningun otro runtime lee el formato JNS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B: RoPE, RMSNorm, SwiGLU, GQA) |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen3-4B (no verificado en la informacion de este repositorio) |
| Tipos de cuantizacion | Q4_K_M (dos variantes: estandar y la de bartowski con imatrix), reempaquetadas en JNS |
| Idiomas soportados | 119 idiomas en el modelo base Qwen3-4B; no declarados especificamente en este repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | JNS (exclusivo del motor Janas; no safetensors ni GGUF legibles por otros runtimes) |
| Tamano de los pesos | 2,50 GB por archivo; 5,0 GB de repositorio (dos archivos) |

## Arquitectura y entrenamiento

No ha habido entrenamiento ni ajuste alguno. Cada archivo `.jns` parte de un GGUF cuantizado por terceros (Qwen y bartowski) y ha sido reescrito por la herramienta `gguf2jns` en el orden en que Janas lee los datos, conservando los metadatos. Posteriormente, las matrices down de los expertos se han dividido con `jns_planes` en tres planos de dos bits cada uno; se trata de una reordenacion de los mismos bits, de modo que la union de los tres planos reconstruye los pesos cuantizados bit a bit. En consecuencia, la calidad del texto es la del Q4_K_M original: este repositorio no mejora ni degrada la fidelidad respecto al GGUF de partida.

El modelo subyacente, Qwen3-4B de Alibaba Cloud, es un transformer denso con RoPE, RMSNorm, SwiGLU y Grouped Query Attention, preentrenado sobre 36 billones de tokens en 119 idiomas. La innovacion que aporta el paquete JNS es de infraestructura: el motor Janas implementa decodificacion especulativa con un modelo borrador (por ejemplo Qwen3-0.6B mediante `--draft`) y un camino de GPU integrada verificado bit a bit, que en el portatil de desarrollo lee prompts un 29% mas rapido que sin GPU (83 a 107 tok/s en Qwen3-4B) y en una RTX 5080 mejora la lectura un 13% y la respuesta entre un 11 y un 16%.

## Capacidades

- Generacion de texto, comprension lectora, codigo y matematicas, heredadas del modelo base Qwen3-4B.
- Razonamiento adaptativo y modo de pensamiento propios de la familia Qwen3 (el modelo base incorpora modos con y sin razonamiento explicito).
- Capacidades multilingues amplias: el modelo base cubre 119 idiomas.
- Conversacion multi-turno mediante `janas-chat`, con gestion de plantilla de chat y temperatura.
- Decodificacion especulativa con modelo borrador (`--draft`), que acelera la generacion manteniendo el mismo texto.
- Ejecucion en CPU pura o con GPU integrada/discreta a traves del motor Janas.
- No se documentan en este repositorio capacidades de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Inferencia local en portatiles sin GPU dedicada: con 2,50 GB de pesos, el modelo cabe en equipos con 8 GB de RAM y funciona integramente en CPU mediante Janas. Es adecuado para asistencia de escritura o resumen offline.
- Despliegue con GPU integrada: en un Intel Core Ultra 9 185H con Arc, Janas alcanza 193 tok/s de lectura y 27 tok/s de escritura, lo que permite usarlo como asistente interactivo en un portatil de oficina.
- Chat interactivo de baja latencia con decodificacion especulativa: emparejando Qwen3-0.6B como borrador se obtienen 26,3 tok/s, un 14% mas que sin borrador en el mismo escenario de chat.
- Procesado por lotes de documentos multilingues: los 119 idiomas del modelo base permiten clasificar, resumir o extraer informacion de textos en varios idiomas sin cambiar de modelo.
- Generacion y revision de fragmentos de codigo en local: util en entornos con requisitos de confidencialidad donde no se puede enviar codigo a una API externa.
- Evaluacion comparativa de motores de inferencia: el repositorio sirve como referencia reproducible para medir Janas frente a llama.cpp en el mismo hardware y con la misma cuantizacion.
- Prototipado de aplicaciones sobre Qwen3-4B en maquinas modestas antes de migrar a un despliegue mayor, ya que el comportamiento del texto es identico al GGUF Q4_K_M de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Lo que si se publica es rendimiento de inferencia medido el 9 y 10 de octubre de 2026 en un portatil con Intel Core Ultra 9 185H, GPU Arc integrada y 32 GB de memoria, con `janas-bench --prompt 1024 --gen 16` y `llama-bench -p 1024 -n 16`:

| Medición en el mismo portatil | Janas | llama.cpp |
|---|---:|---:|
| Lectura de un prompt de 1.024 tokens | 193 tok/s | 164 tok/s |
| Escritura (16 tokens) | 27 tok/s | 18 tok/s |
| Escritura en chat con Qwen3-0.6B como borrador (`--draft`) | 26,3 tok/s | no medido |
| Escritura en chat, misma temperatura, sin borrador | 23,0 tok/s | no medido |

El autor advierte que las cifras variaran en otras maquinas. No hay comparaciones de calidad frente a otros modelos en el repositorio.

## Requisitos de hardware

- VRAM/RAM: 2,50 GB de pesos por archivo; en la practica, unos 3 GB contando el contexto y el runtime. Cabe en cualquier equipo con 4 GB de RAM libre.
- GPU recomendadas: cualquier GPU con al menos 3 GB de memoria utilizable. Se documentan medidas en la GPU Arc integrada del Core Ultra 9 185H y en una RTX 5080 (issue #15), con mejoras del 13% en lectura y del 11 al 16% en respuesta respecto a CPU.
- GPU de consumo: si, es su objetivo. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, RTX 5080 y en iGPU Arc. En CPU pura no necesita GPU en absoluto.
- Opciones de despliegue: exclusivamente el motor Janas (`janas-get`, `janas-chat`, binarios para Linux x86-64, Ubuntu 22.04 y Debian 12 o posteriores). No es compatible con vLLM, llama.cpp, Ollama ni TGI, porque no leen el formato JNS. Si se necesita otro runtime, hay que usar el GGUF original.
- Latencia y throughput: 193 tok/s de lectura y 27 tok/s de escritura en el portatil de referencia; 26,3 tok/s en chat con borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3-4B-JNS (este) | 4.000 M | JNS | Heredado del base (32.768 tokens, no verificado) | Apache 2.0 | Solo Janas |
| Qwen/Qwen3-4B (original) | 4.000 M | safetensors | 32.768 tokens en el modelo base | Apache 2.0 | transformers, vLLM, TGI |
| Qwen/Qwen3-4B-GGUF | 4.000 M | GGUF Q4_K_M | Igual que el base | Apache 2.0 | llama.cpp, Ollama, LM Studio |
| bartowski/Qwen_Qwen3-4B-GGUF | 4.000 M | GGUF Q4_K_M (imatrix) | Igual que el base | Apache 2.0 | llama.cpp, Ollama, LM Studio |

La diferencia entre las tres ultimas filas y este repositorio no es de calidad ni de tamano, sino de motor: los pesos son los mismos bits en otro contenedor. La ventaja medida de Janas frente a llama.cpp en el hardware de referencia es de aproximadamente un 18% en lectura y un 50% en escritura, con la advertencia de que son cifras de una sola maquina.

## Limitaciones y advertencias

- Dependencia total del motor Janas: los archivos `.jns` no se pueden cargar en transformers, vLLM, TGI, llama.cpp ni Ollama. Si Janas desaparece o no soporta la plataforma objetivo, los pesos quedan inservibles.
- La compilacion publicada es solo para Linux x86-64 (Ubuntu 22.04, Debian 12 y posteriores). No se documentan binarios para Windows, macOS ni ARM.
- Alucinacion: heredada del modelo base Qwen3-4B. No hay evaluacion de fidelidad en este repositorio.
- Idiomas: aunque el modelo base cubre 119 idiomas, el repositorio no declara idiomas soportados ni calidad por idioma. El castellano no esta verificado especificamente.
- Cuantizacion Q4_K_M: es una cuantizacion con perdida respecto al modelo original en precision completa. La reordenacion en planos de dos bits es reversible bit a bit, pero no recupera la precision perdida en la cuantizacion de origen.
- Fechas: el repositorio esta fechado en octubre de 2026 y las mediciones se declaran en esas mismas fechas; conviene verificarlas en el hardware propio.
- Trazabilidad: los resultados de rendimiento provienen de un unico equipo y de una sola medicion por configuracion, sin repeticiones ni intervalos de confianza publicados.
- Licencia: Apache 2.0 permite uso comercial. El motor Janas se distribuye bajo GPL-3.0-or-later, licencia que no se aplica a los archivos de pesos, pero que condiciona la modificacion y redistribucion del binario.
- Popularidad nula en el momento de la consulta: 0 descargas y 0 likes, sin issues ni validacion de terceros.

## Enlaces

- Repositorio del modelo: https://huggingface.co/prabanta-dev/Qwen3-4B-JNS
- Perfil del autor: https://huggingface.co/prabanta-dev
- Motor Janas (GitHub, GPL-3.0-or-later): https://github.com/prabanta-dev/janas
- README de Janas y detalles de rendimiento: https://github.com/prabanta-dev/janas#readme
- Issue #15 de Janas (mediciones en RTX 5080): https://github.com/prabanta-dev/janas/issues/15
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Cuantizacion GGUF de Qwen (Qwen3-4B-GGUF): https://huggingface.co/Qwen/Qwen3-4B-GGUF
- Cuantizacion GGUF de bartowski (imatrix): https://huggingface.co/bartowski/Qwen_Qwen3-4B-GGUF
- Ficha de Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Resumen de Qwen3-4B en emergentmind: https://www.emergentmind.com/topics/qwen3-4b-model
