# OnlyTextLLMs/gemma-4-E2B-it-OnlyText-GGUF

## Resumen

OnlyTextLLMs/gemma-4-E2B-it-OnlyText-GGUF es una coleccion de cuantizaciones GGUF del modelo OnlyTextLLMs/gemma-4-E2B-it-OnlyText, a su vez un derivado exclusivamente de texto de google/gemma-4-E2B-it. El repositorio lo publica el usuario OnlyTextLLMs y no anade entrenamiento: se limita a eliminar las modalidades de imagen, audio y video del modelo original y a convertir los pesos a formato GGUF mediante `convert_hf_to_gguf.py` y `llama-quantize`. El resultado es un modelo de 4.647.376.675 parametros (aproximadamente 4,65 B) con arquitectura causal decoder-only, 35 capas (28 de atencion deslizante y 7 de atencion completa), dimension oculta 1536 y vocabulario de 262.137 entradas.

La relevancia de esta publicacion es practica: ofrece tres niveles de cuantizacion (Q4_K_M, Q6_K y Q8_0) con un analisis explicito del dano de cuantizacion medido por divergencia KL frente al maestro F16, ademas de cifras de rendimiento medidas en hardware AMD con ROCm. El autor advierte que Q4_K_M no es intercambiable con los otros dos cuantos, ya que cambia el token top-1 en el 21,6 % de las posiciones. No se embebe ninguna draft head, por lo que no hay decodificacion especulativa dentro del archivo.

Se trata de un modelo pensado para despliegue local con llama.cpp en su version que reconozca la arquitectura `gemma4`, con licencia declarada apache-2.0 y compatibilidad con endpoints OpenAI a traves de `llama-server`. El repositorio no tiene descargas ni likes registrados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (`Gemma4ForCausalLM`), 35 capas: 28 de atencion deslizante y 7 de atencion completa |
| Parametros totales | 4.647.376.675 (aproximadamente 4,65 B) |
| Parametros activos | No disponible (el autor no documenta una arquitectura MoE) |
| Longitud de contexto | No especificada en la informacion disponible; las pruebas del autor se ejecutan con `-c 32768` |
| Tipos de cuantizacion | GGUF: Q4_K_M (3,4 GB), Q6_K (3,8 GB), Q8_0 (5,0 GB) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (arquitectura `gemma4` en llama.cpp) |
| Dimension oculta | 1536 |
| Tamano de vocabulario | 262.137 |
| Tokenizer | 17 tokens especiales de solo texto en los ids 0-106; EOS 1 = `<eos>`, fin de turno 106 = `<turn|>`; tokens de imagen, audio y video eliminados |
| Tamano del repositorio | 12,2 GB |
| Modelo base | google/gemma-4-E2B-it |
| Fecha de publicacion | 22 de septiembre de 2026 (ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 4,65 B de parametros distribuidos en 35 capas, de las cuales 28 emplean atencion deslizante y 7 emplean atencion completa. La dimension oculta es 1536 y el vocabulario tiene 262.137 entradas. El tokenizer ha sido reducido a 17 tokens especiales de solo texto en el rango de ids 0-106, con `<eos>` en el id 1 y el token de fin de turno `<turn|>` en el id 106, tras eliminar los tokens correspondientes a imagen, audio y video del modelo original.

No ha habido entrenamiento adicional: los pesos son un derivado sin modificar de google/gemma-4-E2B-it en lo que respecta a los valores, y el proceso se limita a la conversion a GGUF con `convert_hf_to_gguf.py` (llama.cpp `f280b26983ad`) seguida de `llama-quantize` con el tipo nombrado de cada archivo. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base, por lo que esos datos no estan disponibles en la informacion proporcionada. Tampoco se embebe ninguna draft head, de modo que no existe decodificacion especulativa dentro del archivo. La plantilla de chat soporta el canal de razonamiento (thinking) de Gemma, pero `enable_thinking` vale `false` por defecto, de modo que un chat normal responde directamente; para activarlo hay que pasar `"chat_template_kwargs": {"enable_thinking": true}` en la API del servidor.

## Capacidades

- Generacion de texto conversacional de un solo turno y multiturno segun la plantilla de chat incluida.
- Canal de razonamiento (thinking) soportado por la plantilla de chat, desactivado por defecto y activable mediante `chat_template_kwargs`.
- Procesamiento exclusivamente de texto: al haberse eliminado los tokens de imagen, audio y video, no conserva capacidades de vision ni de audio.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible` y desplegable mediante `llama-server` con API compatible con OpenAI.
- Capacidades multilingues: no disponibles (el repositorio no declara idiomas soportados).
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.

## Casos de uso

- Asistente conversacional local con privacidad de datos: el modelo se ejecuta integramente en la maquina del usuario con llama.cpp y llama-server, sin enviar texto a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Resumen y analisis de documentos extensos: con la configuracion de 32768 tokens de contexto empleada por el autor, permite procesar manuales, informes o contratos largos en una sola pasada sin troceado.
- Generacion y asistencia de codigo en equipos modestos: al ocupar entre 3,4 GB y 5,0 GB en disco segun el cuanto, se puede integrar en flujos de autocompletado o refactorizacion asistida en estaciones de trabajo sin GPU de gama alta.
- Atencion al cliente automatizada en despliegue propio: la API compatible con OpenAI de `llama-server` permite sustituir un endpoint en la nube por una instancia local con el modelo, manteniendo conversaciones multiturno con contexto largo.
- Procesamiento por lotes de textos: clasificacion, extraccion de entidades o normalizacion de corpus textuales aprovechando el prefill medido de 5372 t/s en Q4_K_M y 6858 t/s en Q8_0 sobre una Radeon AI PRO R9700.
- Despliegue en infraestructura AMD con ROCm: el autor ha validado los cuantos sobre una AMD Radeon AI PRO R9700 con ROCm 7.14, lo que lo hace util en entornos con GPU AMD en lugar de NVIDIA.
- Prototipado con seleccion de cuanto segun tolerancia al error: se puede desarrollar con Q4_K_M por tamano y pasar a Q6_K o Q8_0 en produccion, ya que el primero altera el token top-1 en el 21,6 % de las posiciones frente al 3,3 % de Q8_0.

## Benchmarks y rendimiento

Dano de cuantizacion frente al maestro F16 (`llama-perplexity --kl-divergence`, contexto 1024, 40 ventanas, 20.440 tokens evaluados):

| Cuantizacion | KLD media | KLD mediana | Mismo top-1 | KLD maxima |
|---|---|---|---|---|
| Q4_K_M | 0,3924 | 0,1044 | 78,43 % | 16,77 |
| Q6_K | 0,0352 | 0,0074 | 93,30 % | 7,70 |
| Q8_0 | 0,0077 | 0,0016 | 96,68 % | 1,66 |

Rendimiento medido el 22 de septiembre de 2026 en una unica AMD Radeon AI PRO R9700 (gfx1201, 34 GB) con llama.cpp `f280b26983ad` (build HIP/ROCm, ROCm 7.14, `-c 32768 -fa on`):

| Cuantizacion | Dispositivo | Prefill t/s (PP512) | Generacion t/s en chat | Generacion t/s (llama-bench TG128) |
|---|---|---|---|---|
| Q4_K_M | una R9700 | 5372 | 108,4 | 126,2 |
| Q6_K | una R9700 | 3765 | 111,2 | 132,3 |
| Q8_0 | una R9700 | 6858 | 108,8 | 123,9 |

El autor advierte que las dos columnas de decodificacion son mediciones distintas (el chat usa la plantilla de chat y un prompt de aproximadamente 90 tokens, mientras que TG128 es una generacion simple de 128 tokens) y no deben compararse entre si. No se citan lineas base publicadas para este tamano: las cifras son propias del autor. No se han proporcionado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 3,4 GB para Q4_K_M, 3,8 GB para Q6_K y 5,0 GB para Q8_0.
- VRAM estimada: no disponible como cifra oficial; partiendo del tamano de archivo, los pesos ocupan entre 3,4 GB y 5,0 GB y hay que anadir la cache KV correspondiente al contexto configurado. Las pruebas de referencia se hicieron con `-c 32768` sobre una GPU de 34 GB.
- GPU de referencia: una unica AMD Radeon AI PRO R9700 (gfx1201, 34 GB) con ROCm 7.14 y `-ngl 99` (todas las capas descargadas a GPU).
- GPU consumer: no se documenta explicitamente, pero por tamano de archivo los cuantos Q4_K_M y Q6_K son compatibles con tarjetas de 8 GB o mas y Q8_0 con tarjetas de 8-12 GB, siempre que la cache KV y el contexto elegido quepan en la memoria disponible. Se trata de una estimacion derivada del tamano de archivo, no de una cifra publicada.
- Multi-GPU: llama.cpp reparte capas automaticamente (`--split-mode layer` es el valor por defecto); el autor indica que se deben eliminar las fijaciones de las variables `*_VISIBLE_DEVICES`.
- Opciones de despliegue: `llama-server` (API compatible con OpenAI) y `llama-cli` con una build de llama.cpp que reconozca la arquitectura `gemma4`. Otros motores (vLLM, TGI, Ollama) no estan documentados en la informacion disponible.
- Latencia y throughput: prefill de 3765 a 6858 t/s segun cuanto y decodificacion de 108,4 a 111,2 t/s en chat y de 123,9 a 132,3 t/s en llama-bench TG128, medidos sobre la R9700 indicada.

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos alternativos del mismo tamano en la informacion proporcionada (el autor declara que no cita lineas base publicadas para este tamano). La comparacion queda limitada a los modelos del propio linaje:

| Modelo | Parametros | Modalidades | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| OnlyTextLLMs/gemma-4-E2B-it-OnlyText-GGUF (este repositorio) | 4,65 B | Solo texto | GGUF: Q4_K_M, Q6_K, Q8_0 | apache-2.0 | Tres cuantos con analisis de KLD; sin draft head; benchmarks propios en AMD R9700 |
| OnlyTextLLMs/gemma-4-E2B-it-OnlyText | 4,65 B | Solo texto | No disponible (origen del que se derivan los GGUF) | apache-2.0 | Derivado de solo texto sin cuantizar; mismos pesos que la version GGUF |
| google/gemma-4-E2B-it | 4,65 B | Texto, imagen, audio y video | No disponible | apache-2.0 | Modelo base original; conserva las modalidades que el derivado elimina |

Comparacion con modelos de otros desarrolladores (por ejemplo, alternativas de 3-4 B de otros proveedores): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Q4_K_M presenta una divergencia notable frente al maestro F16: KLD media de 0,3924, KLD maxima de 16,77 y cambio del token top-1 en el 21,6 % de las posiciones. El propio autor senala que no es intercambiable con los otros cuantos y recomienda elegir por la columna de mismo top-1 y no por tamano.
- No se embebe draft head, por lo que no hay decodificacion especulativa dentro del archivo y la decodificacion es convencional.
- No ha habido entrenamiento adicional: los pesos son un derivado sin modificar, de modo que hereda cualquier sesgo, limitacion o comportamiento del modelo base google/gemma-4-E2B-it.
- Capacidades de vision, audio y video eliminadas de forma explicita: el modelo no puede procesar imagenes, audio ni video.
- Idiomas soportados no declarados en el repositorio; no se puede asumir cobertura multilingue concreta.
- El modo de razonamiento (thinking) esta desactivado por defecto; los resultados cambian si no se activa explicitamente mediante `chat_template_kwargs`.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni benchmarks de conocimiento (MMLU, GSM8K u otros) en la informacion disponible, por lo que el comportamiento factual no esta caracterizado.
- Dependencia de una build concreta de llama.cpp: se requiere una version que reconozca la arquitectura `gemma4`; builds mas antiguas pueden no cargar el archivo.
- Licencia declarada apache-2.0 en el repositorio del derivado, mientras que el modelo base pertenece al ecosistema Gemma. Conviene verificar los terminos aplicables al modelo original google/gemma-4-E2B-it antes de un uso comercial, asi como las obligaciones de atribucion que el propio repositorio reconoce.
- Ausencia de validacion comunitaria: el repositorio registra 0 descargas y 0 likes, sin senales externas de calidad o reproducibilidad mas alla de las mediciones del autor.
- Las cifras de rendimiento proceden de una unica GPU AMD con ROCm; no hay datos equivalentes para NVIDIA ni para otros backends.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OnlyTextLLMs/gemma-4-E2B-it-OnlyText-GGUF
- Modelo de origen sin cuantizar: https://huggingface.co/OnlyTextLLMs/gemma-4-E2B-it-OnlyText
- Modelo base original: https://huggingface.co/google/gemma-4-E2B-it
- Pagina del equipo de Google en HuggingFace: https://huggingface.co/google
- Licencia apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Busqueda web: los resultados devueltos corresponden a paginas de ayuda de YouTube TV, YouTube y Zhihu, sin relacion alguna con este modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
