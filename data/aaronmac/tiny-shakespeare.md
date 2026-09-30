# aaronmac/tiny-shakespeare

## Resumen

aaronmac/tiny-shakespeare es un transformer causal a nivel de caracter entrenado desde cero sobre el corpus Tiny Shakespeare. Se trata de un modelo extremadamente pequeno, con 226.113 parametros totales (aproximadamente 0,23 millones), publicado por el usuario aaronmac en HuggingFace bajo la libreria transformers. Su proposito es claramente educativo y experimental: reproducir el ciclo completo de entrenamiento de un modelo de lenguaje generativo con un coste computacional minimo y una arquitectura legible.

La arquitectura es un decoder-only clasico: 4 bloques transformer, 4 cabezas de atencion, dimension de embedding de 64 y una longitud de contexto de tan solo 32 tokens. El tokenizador es a nivel de caracter, no subword, lo que simplifica al maximo el preprocesado y hace que el modelo sea util como banco de pruebas para entender mecanismos de atencion, positional encoding y decodificacion autorregresiva.

Su relevancia actual es didactica mas que productiva. Con 0 descargas y 0 likes en el momento de la consulta, no es un modelo de uso general ni compite en ninguna categoria de rendimiento. Resulta interesante como referencia minima reproducible, como punto de partida para experimentos de arquitectura y como ejemplo de publicacion de pesos en safetensors con codigo personalizado (tag custom_code, requiere trust_remote_code=True).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (a nivel de caracter) |
| Parametros totales | 226.113 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 tokens |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | No disponible (entrenado sobre texto en ingles de Shakespeare) |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code) |

Otros datos de la model card: 4 bloques transformer, 4 cabezas de atencion, dimension de embedding 64. Tamano del repositorio: 0,0 GB.

## Arquitectura y entrenamiento

El modelo sigue el esquema estandar de transformer decoder-only con atencion causal: una pila de 4 bloques, cada uno con atencion multi-cabeza de 4 cabezas y dimension de embedding de 64, seguida de la proyeccion de salida sobre el vocabulario de caracteres. La secuencia maxima es de 32 tokens, un valor muy reducido que limita severamente la coherencia a medio plazo pero que basta para demostrar la generacion autorregresiva de texto.

No se dispone de informacion detallada sobre el proceso de entrenamiento en la model card: no se especifica el numero de tokens vistos, la composicion exacta del dataset mas alla de "Tiny Shakespeare", la funcion de perdida concreta, ni si hubo fases de ajuste tipo RLHF o DPO. Tampoco se documentan tecnicas de optimizacion como decodificacion especulativa, atencion lineal o variantes hibridas. Por lo tanto, cualquier afirmacion sobre hiperparametros de entrenamiento (learning rate, batch size, optimizador) debe considerarse no disponible.

El elemento diferenciador del modelo es precisamente su escala: al ser un transformer completo pero minimo, permite inspeccionar pesos, reproducir el forward pass en CPU y experimentar con modificaciones arquitectonicas sin necesidad de aceleradores. El tag custom_code de HuggingFace indica que el repositorio incluye codigo propio que debe ejecutarse con trust_remote_code=True, lo que implica revisar el codigo antes de cargarlo en un entorno de produccion.

## Capacidades

- Generacion de texto a nivel de caracter en estilo shakesperiano, sobre el vocabulario del corpus Tiny Shakespeare.
- Modelado de lenguaje causal: predice el siguiente caracter dado un contexto de hasta 32 caracteres.
- Capacidad de continuar fragmentos cortos de texto dramatico con estructuras superficiales tipo verso, palabras y puntuacion propias del corpus.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente, planificacion ni razonamiento multi-paso.
- No dispone de capacidades multilingues: el entrenamiento se limita al corpus Tiny Shakespeare, en ingles.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.
- Utilidad principal como modelo de referencia educativo, banco de pruebas de arquitectura y ejemplo de publicacion de pesos.

## Casos de uso

- Docencia de arquitecturas transformer: permite cargar un modelo completo con 4 bloques y 226.113 parametros para ilustrar en clase o en un notebook como funciona la atencion causal y la generacion token a token, sin dependencia de GPU.
- Reproduccion de experimentos minimos: sirve como linea base para comparar variaciones de numero de cabezas, dimension de embedding o longitud de contexto, ya que el ciclo de entrenamiento completo es viable en CPU.
- Test de pipelines de inferencia: util para verificar que un entorno de transformers, safetensors y trust_remote_code funciona correctamente antes de desplegar modelos mayores en la misma infraestructura.
- Depuracion de tokenizadores a nivel de caracter: al prescindir de un vocabulario subword, ayuda a validar logicas de preprocesado de texto crudo y mapeo caracter-indice.
- Generacion de texto creativo de caracter experimental: puede producir continuaciones de fragmentos cortos con sabor isabelino, adecuadas para demos artisticas o piezas generativas de bajo riesgo.
- Benchmarking de latencia en hardware modesto: con 0,23 millones de parametros sirve para medir el overhead fijo de un framework (carga de pesos, inicializacion de sesion) sin que el calculo del modelo domine el tiempo total.
- Pruebas de integracion continua: al ser un modelo diminuto, puede incluirse en tests automatizados de pipelines de ML para detectar regresiones en el codigo de carga y decodificacion sin consumir recursos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion cuantitativa, y tampoco se han encontrado resultados de este modelo concreto en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula. Con 226.113 parametros, los pesos en fp32 ocupan aproximadamente 0,9 MB y en fp16 unos 0,45 MB, cantidades que caben holgadamente en la memoria de cualquier dispositivo.
- GPU recomendadas: ninguna en particular. El modelo funciona en CPU; cualquier GPU, incluida una integrada, es mas que suficiente.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en microcontroladores o entornos embebidos con suficiente RAM.
- Opciones de despliegue: transformers con AutoModelForCausalLM y trust_remote_code=True es la via documentada por el autor. No se publican pesos en GGUF, por lo que llama.cpp y Ollama no pueden usarlo directamente sin una conversion previa. Tampoco se documenta soporte para vLLM o TGI.
- Latencia y throughput estimados: no disponibles como medicion publicada. Dado el tamano, se espera que el cuello de botella sea el overhead del framework y no el calculo; con contexto de 32 caracteres, la generacion de secuencias cortas es inmediata en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aaronmac/tiny-shakespeare | 226.113 | 32 tokens | No disponible | No disponible | HuggingFace, 0 descargas |
| szymon-piechowicz-wandb/gpt | No disponible | No disponible | No disponible | No disponible | HuggingFace (dataset tiny_shakespeare) |
| 54nd339/ShakeGPT | No disponible | No disponible | No disponible | No disponible | HuggingFace (text generation) |
| Implementaciones tipo nanoGPT / minGPT (Karpathy y derivados) | Configurables (tipicamente 10M en config char) | Configurable | Perplejidad reportada en sus propios repos | MIT en los repositorios de referencia | GitHub |

La comparativa se limita a modelos de la misma familia experimental (transformers entrenados sobre Tiny Shakespeare), ya que no existen alternativas de produccion con este orden de magnitud de parametros. No se dispone de datos de rendimiento verificables de los modelos comparados en la informacion proporcionada, por lo que no es posible establecer una jerarquia cuantitativa.

## Limitaciones y advertencias

- Escala minima: 226.113 parametros y 32 tokens de contexto implican que el modelo no puede mantener coherencia mas alla de unas pocas palabras, ni recordar informacion previa relevante.
- Tokenizacion a nivel de caracter: no maneja subpalabras ni vocabulario abierto, lo que limita su salida al repertorio de caracteres visto en el corpus.
- Idioma: entrenado exclusivamente sobre texto en ingles del corpus Tiny Shakespeare; no hay evidencia de soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion: en un modelo de este tamano el concepto de alucinacion se sustituye por generacion de texto gramaticalmente local pero semanticamente vacio; no debe usarse para producir informacion factual.
- Sesgos: no se documenta ningun analisis de sesgos. El corpus fuente es literatura isabelina, con los sesgos historicos, de genero y culturales propios de ese material.
- Licencia: no disponible. La ausencia de licencia explicita impide asumir permisos de uso comercial; conviene contactar con el autor antes de cualquier uso productivo.
- Codigo personalizado: el tag custom_code obliga a usar trust_remote_code=True, lo que supone ejecutar codigo del repositorio. Debe auditarse antes de cargarlo en entornos con datos sensibles.
- Sin mantenimiento ni adopcion: 0 descargas y 0 likes indican ausencia de validacion por parte de la comunidad; no hay garantia de soporte, actualizaciones ni correccion de errores.
- No apto para produccion: no cumple los requisitos minimos de contexto, licencia, evaluacion ni soporte para integrarse en un sistema real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aaronmac/tiny-shakespeare
- Listado de modelos entrenados sobre el dataset tiny_shakespeare: https://huggingface.co/models?dataset=dataset:tiny_shakespeare
- Listado de modelos con la etiqueta tiny-shakespeare: https://huggingface.co/models?other=tiny-shakespeare
- Experimentos con Tiny Recursive Model sobre Tiny Shakespeare (Medium): https://medium.com/@mbonsign/testing-trm-on-tiny-shakespeare-0fb5314afff1
- Repositorio GitHub de implementacion de transformer sobre Tiny Shakespeare (Sociloc): https://github.com/Sociloc/tiny-shakespeare
- Repositorio GitHub con comparativa Bigram vs transformer decoder-only (PrithviRaajan): https://github.com/PrithviRaajan/tiny-shakespeare
