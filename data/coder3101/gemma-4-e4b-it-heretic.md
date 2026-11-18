# coder3101/gemma-4-E4B-it-heretic

## Resumen

Gemma 4 E4B it heretic es una variante decensurada del modelo multimodal google/gemma-4-E4B-it, desarrollada por el usuario coder3101 mediante la herramienta Heretic v1.2.0 y el metodo de ablacion de rango arbitrario (ARA, Arbitrary-Rank Ablation) con preservacion de la norma de filas. El objetivo es eliminar el comportamiento de rechazo del modelo original sin degradar significativamente su distribucion de salida, manteniendo una divergencia KL de solo 0,0058 respecto al modelo base.

El modelo base, Gemma 4 E4B, es un transformer denso de Google DeepMind con 4,5B parametros efectivos (8B incluyendo embeddings, 7.996.156.490 parametros reales en safetensors), 42 capas, ventana de contexto de 128K tokens, vocabulario de 262K y soporte nativo para texto, imagen y audio. Emplea una atencion hibrida que intercala atencion local de ventana deslizante (512 tokens) con atencion global, y usa Per-Layer Embeddings (PLE) para maximizar la eficiencia en despliegues on-device.

La relevancia de esta variante radica en que reduce los rechazos de 99/100 a 3/100 en el conjunto de evaluacion de Heretic, lo que la hace util para aplicaciones donde el modelo base declina responder por politicas de seguridad, como investigacion sobre sesgos, generacion creativa sin restricciones o analisis de contenido sensible. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo base conserva su propia licencia de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window local + global), Per-Layer Embeddings (PLE), Proportional RoPE (p-RoPE) en capas globales |
| Parametros totales | 7.996.156.490 (8B con embeddings; 4,5B efectivos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en precision original) |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base soporta mas de 140 idiomas) |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Gemma 4 E4B es un transformer denso de 42 capas con una arquitectura de atencion hibrida: las capas alternan entre atencion local de ventana deslizante de 512 tokens y atencion global completa, garantizando que la capa final sea siempre global. Las capas globales unifican claves y valores y aplican Proportional RoPE (p-RoPE) para optimizar el uso de memoria en contextos largos. Incorpora Per-Layer Embeddings (PLE), que asignan a cada capa decodificadora su propia tabla de embeddings por token; estas tablas son grandes pero solo se usan para consultas rapidas, lo que explica la diferencia entre los 8B parametros totales y los 4,5B efectivos. El vocabulario es de 262K tokens y el modelo incluye un codificador de vision de aproximadamente 150M parametros y un codificador de audio de aproximadamente 300M parametros.

Esta variante heretic no reentrena el modelo: aplica una ablacion de direcciones en el espacio de activaciones sobre las capas 21 a 42 (start_layer_index 21, end_layer_index 42) mediante el metodo ARA con preservacion de la norma de filas. Los hiperparametros de ablacion son preserve_good_behavior_weight 0,3873, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,8555 y neighbor_count 14. El resultado es una divergencia KL de 0,0058 respecto al modelo original y una reduccion de rechazos de 99/100 a 3/100. No se dispone de informacion sobre el dataset de calibracion usado por Heretic ni sobre si se aplico RLHF o DPO adicional en esta variante.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento (thinking) configurables, heredados del modelo base Gemma 4.
- Procesamiento multimodal de entrada: texto, imagen con soporte de relacion de aspecto y resolucion variables, video y audio (audio nativo en los modelos E2B y E4B).
- Generacion de codigo y matematicas, con mejoras notables en benchmarks de codigo segun la model card del modelo base.
- Soporte nativo de function calling y tool calling, orientado a flujos agenticos.
- Soporte de agentes y razonamiento multi-paso.
- Soporte nativo del rol `system` en el prompt, lo que permite conversaciones mas estructuradas y controlables.
- Capacidades multilingues heredadas del modelo base (mas de 140 idiomas segun Google DeepMind).
- Comportamiento decensurado: reduce drasticamente los rechazos ante peticiones que el modelo original declinaria.
- Salida exclusivamente de texto (pipeline any-to-any con entrada multimodal y salida textual).

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar que tipos de peticiones activan los mecanismos de rechazo del modelo original y como la ablacion modifica esas respuestas, con una divergencia KL medida de 0,0058 que acota el cambio de distribucion.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles (violencia, conflicto, contenido adulto no explicito) sin los rechazos del modelo base, adecuado para autores que necesitan explorar tonos oscuros o controvertidos.
- Analisis de contenido sensible: clasificacion, resumen o extraccion de informacion de textos que tratan temas que el modelo original rechazaria, como informes de incidentes, material de moderacion o corpus de investigacion.
- Asistencia en red teaming de LLM: generacion de prompts adversarios y evaluacion de la robustez de filtros y clasificadores de seguridad en pipelines propios, aprovechando la reduccion de rechazos de 99/100 a 3/100.
- Procesamiento multimodal on-device: al ser un modelo E4B con 4,5B parametros efectivos y contexto de 128K, puede desplegarse en portatiles y estaciones de trabajo para tareas de descripcion de imagenes, transcripcion de audio o analisis de video sin depender de la nube.
- Agentes autonomos con tool calling: integracion en flujos agenticos que requieren function calling nativo y razonamiento multi-paso, con la ventaja de que el modelo no bloqueara acciones por filtros de contenido en dominios como automatizacion de sistemas o analisis de datos.
- Atencion al cliente especializada: conversaciones multi-turno con contexto de 128K tokens para gestionar historiales largos, aunque debe evaluarse el riesgo de respuestas inapropiadas al haberse eliminado parte de las barreras de seguridad.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible corresponden a la evaluacion de la ablacion realizada por el autor:

| Metrica | Este modelo | Modelo original (google/gemma-4-E4B-it) |
|---|---|---|
| Divergencia KL | 0,0058 | 0 (por definicion) |
| Rechazos | 3/100 | 99/100 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta variante en la informacion disponible. Los benchmarks del modelo base Gemma 4 E4B no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (bf16): aproximadamente 16 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 20-24 GB.
- En cuantizacion de 8 bits: aproximadamente 8-9 GB de VRAM; en 4 bits: aproximadamente 5-6 GB, aunque no se confirma que existan GGUF oficiales para esta variante.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para precision completa; RTX 3090 (24 GB) o RTX 4080 (16 GB) para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y potencialmente en GPUs de 16 GB con cuantizacion, aunque el repo solo distribuye safetensors y habria que convertir los pesos.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servidores; llama.cpp u Ollama requeririan conversion a GGUF, no confirmada en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Estado |
|---|---|---|---|---|---|
| coder3101/gemma-4-E4B-it-heretic | 8B totales (4,5B efectivos) | 128K | Texto, imagen, audio, video | Apache 2.0 | Disponible en HF, 762 descargas |
| google/gemma-4-E4B-it | 8B totales (4,5B efectivos) | 128K | Texto, imagen, audio, video | Licencia Gemma 4 (Apache 2.0 segun la model card) | Disponible en HF |
| google/gemma-4-E2B-it | 5,1B totales (2,3B efectivos) | 128K | Texto, imagen, audio | Licencia Gemma 4 | Disponible en HF |
| google/gemma-4-26B-A4B | 25,2B totales (3,8B activos) | 256K | Texto, imagen | Licencia Gemma 4 | Disponible en HF |

La comparativa se limita a la familia Gemma 4 porque no se dispone de datos de rendimiento estandar para esta variante que permitan contrastarla con modelos de otros fabricantes. Frente al modelo original, la diferencia clave es la reduccion de rechazos (3/100 frente a 99/100) con una divergencia KL baja; frente al E2B, este modelo ofrece mas capacidad efectiva y audio nativo a costa de mayor VRAM; frente al 26B A4B, este modelo es denso, con menor contexto (128K frente a 256K) y sin vision encoder de 550M.

## Limitaciones y advertencias

- La ablacion elimina parte de los mecanismos de seguridad del modelo original, lo que aumenta el riesgo de generar contenido ofensivo, inseguro o inapropiado; no se recomienda su uso en aplicaciones orientadas al publico sin filtros adicionales.
- La divergencia KL de 0,0058 indica un cambio pequeno pero no nulo en la distribucion de salida; pueden aparecer degradaciones sutiles en tareas de razonamiento o codigo no evaluadas en la model card.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la ablacion.
- No se especifican los idiomas soportados en esta variante; aunque el modelo base cubre mas de 140 idiomas, la ablacion podria afectar de forma desigual a idiomas de bajos recursos.
- La licencia declarada es Apache 2.0, pero el campo license_link apunta a la licencia de Gemma 4; conviene verificar los terminos aplicables antes de un uso comercial, especialmente en lo relativo a restricciones de uso aceptable del modelo base.
- El repo solo contiene safetensors (16 GB); no hay confirmacion de cuantizaciones GGUF, lo que limita el despliegue en hardware de gama baja sin conversion manual.
- El dataset de calibracion usado por Heretic no se detalla, por lo que no puede evaluarse si la ablacion generaliza a dominios distintos del conjunto de evaluacion de 100 prompts.
- El modelo es una modificacion no oficial de Google DeepMind; no cuenta con el respaldo ni la garantia del fabricante original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder3101/gemma-4-E4B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Metodo ARA (Arbitrary-Rank Ablation): https://github.com/p-e-w/heretic/pull/211
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
