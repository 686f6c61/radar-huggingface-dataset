# mgxs/SmolLM2-135M-Instruct-Q3_K_S-GGUF

## Resumen

Este repositorio contiene una conversion a formato GGUF del modelo SmolLM2-135M-Instruct, publicada por el usuario mgxs. No se trata de un modelo nuevo ni de un reentrenamiento: es el mismo checkpoint de HuggingFaceTB convertido mediante el espacio GGUF-my-repo de ggml.ai, que emplea llama.cpp como herramienta de conversion. La unica diferencia respecto al original es el formato y la cuantizacion aplicada, Q3_K_S (3 bits, variante K-small).

El modelo base pertenece a la familia SmolLM2, orientada a modelos pequenos que quepan y funcionen en dispositivos con recursos muy limitados: moviles, Raspberry Pi, navegadores o sistemas embebidos. Con 134.515.008 parametros y una cuantizacion de 3 bits, este archivo esta pensado para inferencia en CPU y en hardware sin GPU dedicada, sacrificando calidad de generacion a cambio de un tamano minimo.

Su relevancia practica es acotada: sirve como pieza de prototipado rapido, pruebas de pipelines de inferencia local y despliegues donde el espacio de almacenamiento o la memoria son la restriccion principal. Al ser una conversion de terceros con cero descargas y cero valoraciones en el momento de redactar esta ficha, debe tratarse como un artefacto no verificado por el equipo del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en esta ficha (corresponde a la del modelo base SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en esta ficha; el ejemplo de llama-server del autor usa -c 2048, que es un parametro de ejecucion y no la longitud de contexto declarada |
| Tipos de cuantizacion | GGUF Q3_K_S (3 bits, variante K-small de llama.cpp); el repositorio solo publica esta cuantizacion |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero smollm2-135m-instruct-q3_k_s.gguf) |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct |
| Repositorio | mgxs/SmolLM2-135M-Instruct-Q3_K_S-GGUF |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Etiquetas declaradas | transformers, gguf, safetensors, onnx, transformers.js, llama-cpp, gguf-my-repo, conversational, endpoints_compatible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun HuggingFace) | 2026-10-05 |

## Arquitectura y entrenamiento

La model card de este repositorio no describe ninguna arquitectura ni proceso de entrenamiento propio: indica explicitamente que el modelo se convirtio a GGUF desde HuggingFaceTB/SmolLM2-135M-Instruct usando llama.cpp a traves del espacio GGUF-my-repo, y remite a la model card original para cualquier detalle. Por tanto, la arquitectura, el corpus de entrenamiento, el numero de tokens vistos, la composicion del dataset y las fases de ajuste (SFT, DPO u otras) son los del modelo base y no se detallan en la informacion disponible. No hay ninguna innovacion tecnica introducida en esta conversion.

Lo unico especifico de este repositorio es el proceso de cuantizacion: los pesos se almacenan en formato GGUF con el esquema Q3_K_S, una cuantizacion de 3 bits por peso con escalas en bloque de la familia K-quant de llama.cpp. Este esquema reduce el tamano del fichero aproximadamente a una decima parte del que tendria en coma flotante de 32 bits, a costa de una perdida de precision que, en modelos de este tamano, suele traducirse en degradacion perceptible de la coherencia y del seguimiento de instrucciones. No se han publicado mediciones de perplejidad ni comparaciones de calidad entre esta cuantizacion y otras del mismo modelo.

## Capacidades

- Generacion de texto conversacional en ingles: el modelo base esta ajustado para seguir instrucciones y mantener dialogos de tipo chat.
- Continuacion de texto y plantillas de prompt: la model card incluye ejemplos de uso con prompts simples ("The meaning to life and the universe is").
- Inferencia local en entornos con libreria llama.cpp, tanto por CLI (llama-cli) como por servidor HTTP (llama-server).
- Compatibilidad declarada con transformers.js, onnx y llama-cpp segun las etiquetas del repositorio, lo que abre la puerta a ejecucion en navegador o en Node.js; conviene verificar que el artefacto GGUF sea el que se usa en esos flujos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; por tamano y por cuantizacion agresiva no es un escenario realista.
- Capacidades multilingues: no; el unico idioma declarado es el ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Pruebas de integracion de llama.cpp: sirve para validar que un pipeline basado en llama-cli o llama-server funciona correctamente antes de sustituir el fichero GGUF por uno de mayor tamano, gracias a su peso de 0,1 GB y a que se carga en segundos.
- Inferencia en dispositivos embebidos o sin GPU: al necesitar menos de 1 GB de memoria, puede ejecutarse en Raspberry Pi, mini-PC o moviles para tareas de generacion de texto corto sin conexion a internet.
- Demos y prototipos web: combinado con transformers.js, permite montar una demostracion de chat en el navegador que no envia datos a ningun servidor, util para pruebas de concepto de privacidad.
- Etiquetado y clasificacion de texto en ingles a pequena escala: con prompts cerrados y salidas de una o dos palabras, puede usarse para categorizar fragmentos cortos en lotes, siempre auditando los resultados.
- Generacion de texto de relleno en entornos de desarrollo: para poblar bases de datos de prueba, maquetas o tests de interfaz donde el contenido solo necesita parecer texto plausible en ingles.
- Educacion y experimentacion: permite estudiar el efecto de la cuantizacion Q3_K_S comparando las salidas con las del modelo base en precision completa sobre los mismos prompts.
- Generacion de sugerencias muy cortas: autocompletado de frases o titulares en ingles donde se acepta una calidad limitada a cambio de latencia y consumo minimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan mediciones de perplejidad de la cuantizacion Q3_K_S frente a otras variantes. Para cualquier dato de evaluacion hay que consultar la model card del modelo base, y en ningun caso serian aplicables directamente a esta cuantizacion de 3 bits.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier cuantizacion de este tamano; con Q3_K_S, los pesos ocupan decenas de megabytes y el consumo adicional viene dado por la cache KV, que crece con la longitud de contexto configurada (el ejemplo del autor usa 2048 tokens).
- Cabe holgadamente en cualquier GPU de consumo: GTX 1050 Ti, RTX 3060, RTX 4090 o incluso una GPU integrada; no requiere A100 ni H100.
- Tambien funciona exclusivamente en CPU, que es su escenario natural: procesadores de portatil, mini-PC, Raspberry Pi 4/5 y telefonos.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server, tal como documenta el autor), llama-cpp-python, Ollama, LM Studio, text-generation-webui y, para el flujo de navegador, transformers.js. El soporte de GGUF en vLLM es experimental y no se documenta en esta ficha.
- Latencia y throughput: no disponible; no se han publicado mediciones. A este tamano, la generacion en CPU suele ser fluida, pero cualquier cifra concreta depende del hardware y de la longitud de contexto.
- Almacenamiento: el repositorio completo ocupa 0,1 GB, lo que permite distribuirlo en imagenes de contenedor o dispositivos con almacenamiento muy limitado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mgxs/SmolLM2-135M-Instruct-Q3_K_S-GGUF | 134.515.008 | no disponible | apache-2.0 | GGUF Q3_K_S | conversion de terceros, 0 descargas, 0 likes |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M (clase) | no disponible en la informacion proporcionada | apache-2.0 | safetensors / transformers | modelo oficial, referencia de calidad frente a esta cuantizacion |
| Otras cuantizaciones GGUF del mismo modelo (Q4_K_M, Q5_K_M, Q8_0) | 134.515.008 | no disponible | apache-2.0 | GGUF | disponibles en el ecosistema llama.cpp; no verificadas en esta busqueda |
| SmolLM2-360M-Instruct | 360M (segun denominacion) | no disponible | apache-2.0 (familia SmolLM2; no confirmado en la informacion proporcionada) | safetensors / GGUF | modelo oficial de la misma familia, mayor coste de memoria y presumiblemente mejor calidad |

## Limitaciones y advertencias

- Modelo muy pequeno (135M parametros) y cuantizado a 3 bits: la calidad de generacion es limitada incluso en el modelo original, y la cuantizacion Q3_K_S anade perdida de precision adicional.
- Riesgo alto de alucinacion y de incoherencia en cadenas largas de razonamiento; no es adecuado para tareas que requieran exactitud factual sin verificacion humana.
- Solo ingles: no hay soporte declarado de castellano ni de otros idiomas.
- La longitud de contexto no se especifica en esta ficha; configurarla por encima de lo que soporte el modelo base puede degradar la salida o provocar errores en tiempo de ejecucion.
- Conversion de terceros no verificada: el repositorio no pertenece a HuggingFaceTB, tiene cero descargas y cero valoraciones, y las fechas de creacion y actualizacion mostradas (2026-10-05) son posteriores a la publicacion del modelo base, por lo que conviene auditar el fichero antes de usarlo en produccion.
- Las etiquetas del repositorio incluyen safetensors y onnx, pero el artefacto descrito y los comandos de uso son de formato GGUF; no se confirma que existan ficheros en esos otros formatos ni que se hayan validado.
- Licencia apache-2.0: permite uso comercial, pero se hereda cualquier condicion aplicable al modelo base; se recomienda revisar la licencia del repositorio original.
- No se han publicado evaluaciones de sesgo, toxicidad ni seguridad para esta conversion; no deberia desplegarse de cara al publico sin filtros adicionales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mgxs/SmolLM2-135M-Instruct-Q3_K_S-GGUF
- Modelo base (model card original): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Espacio GGUF-my-repo usado para la conversion: https://huggingface.co/spaces/ggml-org/gguf-my-repo

No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs o demos.
