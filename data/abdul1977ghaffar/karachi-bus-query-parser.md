# abdul1977ghaffar/karachi-bus-query-parser

## Resumen

Karachi bus query parser es un ajuste fino mediante LoRA del modelo Qwen2.5-0.5B-Instruct, desarrollado por el usuario abdul1977ghaffar, cuyo objetivo es extraer de forma estructurada los dos puntos de parada (origen y destino) de una consulta de autobus urbano de Karachi escrita en roman urdu, ingles o urdu. El modelo no calcula rutas: se limita a devolver un objeto JSON con los campos `from` y `to`, y deja la logica de enrutamiento al motor TypeScript de la aplicacion Kahan Jana Hai. Esta separacion de responsabilidades es deliberada, ya que un modelo de 0,5 mil millones de parametros no es fiable para memorizar numeros de linea de autobus.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct (494.032.768 parametros) y se entrena con un adaptador LoRA de rango 16 sobre todas las capas lineales. El resultado se distribuye como adaptador PEFT en safetensors (34 MB) y como archivo GGUF cuantizado Q4_K_M de 380 MB, pensado para ejecutarse en local mediante Ollama. Su relevancia radica en que demuestra un caso de uso muy concreto de extraccion estructurada multilingue con recursos minimos: 27 minutos de entrenamiento en una RTX 4060 Laptop de 8 GB.

El modelo esta publicado con licencia Apache-2.0, soporta urdu e ingles, y esta disenado para integrarse en una PWA y una aplicacion Android instalables sin conexion. La ficha tecnica siguiente recoge los datos disponibles en la model card y en los metadatos de Hugging Face; cualquier dato no publicado se indica como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto nativo de Qwen2.5-0.5B; el entrenamiento uso max_length 256) |
| Tipos de cuantizacion | Q4_K_M (GGUF); adaptador en safetensors (fp16/bf16) |
| Idiomas soportados | Urdu (roman urdu y escritura urdu) e ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA del transformer decoder-only Qwen2.5-0.5B-Instruct. El adaptador usa rango r=16, alpha=32, dropout 0.05 y se aplica sobre todas las capas lineales (`all-linear`). El entrenamiento se realizo con transformers 5.24.1, trl 1.19.0, peft 0.22.0 y torch 2.6.0+cu124, durante 3 epocas, con batch efectivo de 16, learning rate 2e-4 con scheduler coseno, 30 pasos de warmup, longitud maxima de 256 tokens y precision bf16. El entrenamiento completo duro 27 minutos en una RTX 4060 Laptop de 8 GB y termino con una perdida final de 0,720.

El conjunto de datos es sintetico y se genero a partir del registro propio de 1.631 paradas de Karachi de la aplicacion (listado de rutas de 2010 y nombres de OpenStreetMap, ODbL), con variantes de ortografia en roman urdu (`se/say/sy`, `kaise/kese`), errores tipograficos, cambios de mayusculas, consultas de una sola parada equilibradas entre los campos `from` y `to`, y consultas sin ningun lugar que deben devolver `null` en ambos campos. Se anadieron 24 formulaciones escritas a mano. El conjunto consta de 5.641 ejemplos de entrenamiento y 201 de validacion; el conjunto de validacion usa plantillas distintas, pares de paradas distintos y una semilla fija propia, de modo que mide formulaciones no vistas en lugar de plantillas memorizadas.

## Capacidades

- Extraccion estructurada de entidades: convierte una consulta en texto libre en un JSON con los campos `from` y `to`.
- Comprension de roman urdu con variantes ortograficas (`se/say/sy`, `kaise/kese`), errores tipograficos y cambios de mayusculas.
- Comprension de urdu en escritura arabe para las 269 paradas que tienen alias en urdu (cobertura parcial).
- Comprension de consultas en ingles.
- Manejo de consultas de una sola parada: rellena un campo y devuelve `null` en el otro segun la semantica de la frase.
- Manejo de consultas sin lugar: devuelve `{"from": null, "to": null}` para frases como `"bus ka kiraya kitna hai"`.
- Normalizacion a nombres canonicos del registro de paradas, incluso cuando el usuario escribe mal el nombre.
- Generacion de JSON valido en el 100 % de los casos evaluados, tanto antes como despues del ajuste.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; su unico cometido es la extraccion de dos campos.

## Casos de uso

- Extraccion de origen y destino en una aplicacion de rutas de autobus: el modelo recibe la consulta del usuario en roman urdu, ingles o urdu y devuelve el JSON que consume el motor TypeScript de enrutamiento. Es adecuado porque su unica tarea es la extraccion y no necesita conocer las lineas de autobus.
- Asistente conversacional sin conexion en Android o PWA: el archivo GGUF Q4_K_M de 380 MB se ejecuta integramente en GPU de portatil (936 MB con contexto de 32k) y permite funcionar sin red, algo critico en trayectos con conectividad intermitente.
- Normalizacion de entradas de usuario en formularios de busqueda: el modelo convierte variantes ortograficas y errores tipograficos en nombres canonicos del registro de 1.631 paradas, reduciendo fallos de busqueda en la interfaz.
- Clasificacion de intencion ligera: distingue entre consultas con dos paradas, con una sola parada y sin lugar, lo que permite decidir si se pide aclaracion al usuario o se responde con un mensaje informativo.
- Prototipado rapido de extraccion estructurada en dominios de transporte: el adaptador de 34 MB sobre Qwen2.5-0.5B-Instruct sirve como plantilla para crear parsers de dominio especifico con muy pocos recursos de entrenamiento (27 minutos en una GPU de consumo).
- Despliegue en entornos con restricciones de hardware: al caber en una RTX 4060 Laptop de 8 GB y alcanzar 44-106 tok/s en Ollama, es viable en equipos de desarrollo modestos y en estaciones de trabajo sin GPU dedicada de gama alta.
- Investigacion sobre extraccion de entidades en lenguas de bajos recursos: el modelo y su metodologia de generacion sintetica a partir de un registro propio son un ejemplo reproducible para roman urdu, una lengua con escasez de datos anotados.

## Benchmarks y rendimiento

Resultados sobre 201 consultas de validacion, comparando el modelo base y el ajustado:

| Metrica | Base | Ajustado |
|---|---:|---:|
| JSON valido | 100 % | 100 % |
| Ambas paradas exactas | 8 % | 65 % |
| Parada de origen correcta | 23 % | 82 % |
| Destino correcto | 18 % | 78 % |
| Insensible a mayusculas y puntuacion | 8 % | 75 % |
| Consultas escritas a mano (16) | 12 % | 81 % |
| Ambas paradas presentes (120) | 0 % | 57 % |
| Solo destino (30) | 0 % | 73 % |
| Solo origen (20) | 0 % | 65 % |
| Sin lugar (15) | 100 % | 100 % |

El modelo base emite JSON valido pero con una forma incorrecta (`{"start_stop": …, "destination_stop": …}`) y a menudo segmenta mal la frase, lo que explica su puntuacion casi nula en contenido. Los fallos restantes del modelo ajustado son en su mayoria deslices de 1-2 caracteres en el nombre de la parada (por ejemplo, `Kharadar` → `Kharkaradar`), que el comparador tolerante a errores de la aplicacion corrige, y consultas de una sola parada cuya redaccion es ambigua respecto al campo al que pertenece la parada. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 936 MB con el GGUF Q4_K_M y contexto de 32k, segun la medicion del autor en Ollama 0.40.18.
- GPU recomendadas: RTX 4060 Laptop de 8 GB (hardware usado para entrenamiento y medicion); cualquier GPU consumer con al menos 2 GB de VRAM libre puede ejecutar el archivo cuantizado.
- Cabe en GPU consumer: si, incluida la RTX 4060 Laptop de 8 GB, donde carga al 100 % en GPU.
- Opciones de despliegue: Ollama (recomendado por el autor, con el Modelfile incluido), transformers + PEFT (adaptador de 34 MB sobre el modelo base), llama.cpp para el GGUF. vLLM y TGI no estan documentados para este modelo en la informacion disponible.
- Latencia y throughput estimados: 44-106 tok/s en una RTX 4060 Laptop con Ollama, segun la medicion del autor.
- Para el adaptador PEFT es necesario descargar tambien el modelo base Qwen/Qwen2.5-0.5B-Instruct, ya que el adaptador no incluye los pesos base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Karachi bus query parser (este modelo) | 494 M (LoRA sobre Qwen2.5-0.5B) | 32.768 tokens | Extraccion de paradas en roman urdu/urdu/ingles | Apache-2.0 | Hugging Face, GGUF y adaptador PEFT |
| Qwen2.5-0.5B-Instruct (modelo base) | 494 M | 32.768 tokens | Instrucciones generales y chat | Apache-2.0 | Hugging Face, ampliamente disponible |
| Qwen2.5-1.5B-Instruct | 1.500 M aprox. | 32.768 tokens | Instrucciones generales y chat | Apache-2.0 | Hugging Face |
| Modelos de extraccion estructurada de dominio especifico | Variable | Variable | Extraccion de entidades | Variable | No disponible |

No se dispone de datos de rendimiento comparables de otros modelos especializados en extraccion de paradas de autobus en roman urdu en la informacion proporcionada. La comparacion con Qwen2.5-0.5B-Instruct es directa porque es el modelo base sobre el que se aplica el adaptador.

## Limitaciones y advertencias

- Entrenado con aproximadamente 5.641 consultas sinteticas; el conjunto de validacion de 201 filas hace que los porcentajes sean indicativos y no precisos (una fila equivale a aproximadamente 0,5 % global y a 3-5 % en los grupos de 20-30 filas).
- Confunde entradas del registro con nombres parecidos, como `Abidabad Khadda Market` frente a `Khadda Market`.
- Las consultas de una sola parada dependen de la redaccion; una formulacion ambigua puede asignar la parada al campo equivocado.
- Solo 269 de las 1.631 paradas tienen alias en urdu, por lo que la cobertura en escritura urdu es parcial.
- Nunca se evaluo en un telefono; se asume que la precision del archivo cuantizado es cercana a la de fp16, pero no se volvio a puntuar de extremo a extremo.
- El modelo no enruta ni conoce numeros de linea de autobus; no debe usarse para responder preguntas sobre rutas o horarios.
- Riesgo de alucinacion en nombres de paradas no presentes en el registro o en formulaciones muy alejadas de los datos de entrenamiento.
- Los nombres de paradas incluyen datos de OpenStreetMap (ODbL), lo que puede imponer obligaciones de atribucion si se redistribuyen.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/abdul1977ghaffar/karachi-bus-query-parser
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Aplicacion Kahan Jana Hai: https://karachi-bus-route-finder-web.vercel.app/
- OpenStreetMap (datos de paradas, ODbL): https://www.openstreetmap.org/
- Resultados detallados: archivo `RESULTS.md` incluido en el repositorio de Hugging Face
