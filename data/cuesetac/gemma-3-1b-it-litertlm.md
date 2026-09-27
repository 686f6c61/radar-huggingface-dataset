# cuesetac/gemma-3-1b-it-litertlm

## Resumen

`cuesetac/gemma-3-1b-it-litertlm` es una copia sin modificar del modelo instructivo `google/gemma-3-1b-it` de Google, convertida al formato LiteRT-LM y cuantizada a int4, con una caché KV de 4096 tokens. El autor (cuesetac) lo publica en HuggingFace con un único propósito declarado: que la aplicación Cueset pueda descargarlo y ejecutarlo en el propio dispositivo del usuario. No se trata por tanto de un modelo nuevo ni de un fine-tuning, sino de un artefacto de distribución optimizado para inferencia local.

El problema que resuelve es el de llevar un modelo de lenguaje de aproximadamente 1.000 millones de parámetros a teléfonos y dispositivos de borde sin depender de la nube. El fichero pesa 584.417.280 bytes (unos 557 MiB), lo que lo sitúa en el rango manejable para un móvil moderno, y el formato LiteRT-LM permite ejecutarlo sobre CPU, GPU o aceleradores NPU a través del ecosistema LiteRT (antes TensorFlow Lite) de Google. La cuantización int4 y la ventana de 4096 tokens son decisiones de compromiso entre calidad, memoria y latencia.

Su relevancia es doble: por un lado, demuestra el flujo de trabajo de convertir un modelo de la familia Gemma 3 a un formato on-device listo para producción; por otro, sirve como referencia de cómo se empaquetan y publican artefactos derivados bajo los términos de uso de Gemma, sin cambios en los pesos originales. Al estar basado en `google/gemma-3-1b-it`, hereda las características del modelo base (transformer decoder-only, entrenamiento con destilación, vocabulario multilingüe), aunque el artefacto concreto limita el contexto efectivo a 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de `google/gemma-3-1b-it`) |
| Parametros totales | ~1.000 millones (modelo base); el artefacto cuantizado ocupa 584.417.280 bytes |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens en este artefacto (`ekv4096`); el modelo base soporta ventanas mayores segun la documentacion de Google |
| Tipos de cuantizacion | int4 (`q4`) sobre los pesos, con caché KV dimensionada a 4096 tokens; el repositorio no publica otras variantes |
| Idiomas soportados | No disponible en la model card; el modelo base `google/gemma-3-1b-it` es multilingue |
| Licencia | Gemma Terms of Use (con Gemma Prohibited Use Policy) |
| Formato de pesos | LiteRT-LM (`.litertlm`); el fichero concreto es `Gemma3-1B-IT_multi-prefill-seq_q4_ekv4096.litertlm` |

Metadatos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Autor | cuesetac |
| Modelo base | google/gemma-3-1b-it |
| Libreria declarada | litert |
| Pipeline | no disponible |
| Tamano del repositorio | 0,6 GB |
| SHA-256 del artefacto | `1325ae366d31950f137c9c357b9fa89448b176d76998180c08ceaca78bba98be` |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

Este repositorio no aporta informacion sobre el entrenamiento del modelo subyacente, porque no se ha entrenado nada: se trata de un artefacto derivado. La model card es explicita al afirmar que es "an unmodified copy of Google's Gemma 3 1B instruction-tuned model in LiteRT-LM format", es decir, los pesos no han sido alterados, solo convertidos y cuantizados. En consecuencia, la arquitectura es la de Gemma 3 1B (familia de transformers decoder-only con tokenizador multilingue y capas de atencion con ventana deslizante combinadas con atencion global en la version base), y el proceso de alineacion es el del modelo instructivo original de Google, sin RLHF ni DPO adicional por parte del autor de este repositorio.

La innovacion tecnica relevante aqui es el propio pipeline de conversion a LiteRT-LM. El nombre del fichero, `Gemma3-1B-IT_multi-prefill-seq_q4_ekv4096.litertlm`, documenta tres decisiones: cuantizacion de pesos a 4 bits (`q4`), soporte de prefill multiple/secuencial (`multi-prefill-seq`, util para reutilizar prefijos y para entradas por trozos) y una caché KV de 4096 posiciones (`ekv4096`), que es lo que fija el contexto efectivo del artefacto. El resultado es un binario autocontenido que los runtimes LiteRT-LM pueden cargar directamente en el dispositivo.

## Capacidades

- Generacion de texto instructivo en modo conversacional, heredado del ajuste de instrucciones de `google/gemma-3-1b-it`.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano de 1B parametros.
- Generacion y explicacion de codigo sencillo, sin garantia de calidad comparable a modelos de mayor tamano.
- Capacidades multilingues heredadas del modelo base, aunque la model card de este repositorio no detalla la lista de idiomas (no disponible).
- Ejecucion local en el dispositivo mediante LiteRT-LM, sin llamadas a servicios remotos.
- Soporte de prefill multiple/secuencial segun el nombre del artefacto, lo que facilita reutilizar contexto ya procesado.
- Ventana de contexto efectiva de 4096 tokens, suficiente para turnos de conversacion y documentos cortos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible; Gemma 3 1B no se distribuye con una variante de razonamiento declarada.
- Vision, audio o entrada multimodal: no disponible en este artefacto (el fichero es solo de texto).

## Casos de uso

- Asistente conversacional integrado en aplicacion movil: al ejecutarse en el propio dispositivo con LiteRT-LM y ocupar 557 MiB, permite un chat offline que funciona sin cobertura y sin enviar los mensajes del usuario a un servidor.
- Procesamiento de texto con requisitos de privacidad: sectores como salud, banca o legal pueden usar el modelo para resumir o reformular apuntes internos sabiendo que los datos nunca salen del telefono o del portatil.
- Resumen y reescritura de notas breves: con 4096 tokens de contexto caben correos, actas o articulos cortos, y el modelo puede condensarlos o cambiar el tono sin coste de API por token.
- Traduccion asistida y correccion ortografica en aplicaciones de escritura: el modelo base es multilingue y el artefacto mantiene ese tokenizador, por lo que sirve para sugerencias de redaccion en varios idiomas.
- Clasificacion y enrutado de texto en pipelines locales: por ejemplo, etiquetar tickets de soporte o detectar intencion antes de decidir si hace falta un modelo mayor en la nube.
- Generacion de codigo ligera en entornos de desarrollo sin conexion: autocompletado de fragmentos, explicacion de funciones o generacion de tests unitarios simples dentro de un IDE o plugin de escritorio.
- Educacion y tutoria embebida: aplicaciones infantiles o de aprendizaje de idiomas que necesitan un modelo siempre disponible, con coste marginal cero por consulta y sin dependencia de cuotas de API.
- Automatizacion de dispositivos sin conectividad estable: kioscos, equipos industriales o vehiculos donde la inferencia local evita depender de enlaces de red poco fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de `cuesetac/gemma-3-1b-it-litertlm` solo incluye la tabla de ficheros con su tamano y hash SHA-256, ademas de la nota de licencia, por lo que no se aportan cifras de MMLU, HumanEval, GSM8K ni de evaluaciones comparativas. La cuantizacion int4 implicaria, en cualquier caso, una degradacion respecto a los pesos originales, pero no se dispone de mediciones concretas de esa perdida para este artefacto.

## Requisitos de hardware

- Tamano del artefacto: 584.417.280 bytes (unos 557 MiB) para los pesos en int4, mas el espacio de trabajo del runtime y la caché KV de 4096 tokens.
- VRAM/RAM estimada para inferencia: del orden de 0,7 a 1,2 GB en funcion del backend y del overhead del runtime; no se han publicado mediciones oficiales, por lo que la cifra es una estimacion a partir del tamano del fichero y no un dato verificado.
- GPU de escritorio: no es el objetivo del artefacto. Para ejecutarlo en una GPU convencional (RTX 3060, RTX 4090, A100, H100) habria que reconvertir el modelo a un formato soportado por el runtime elegido.
- GPU consumer: cabe sobradamente en cualquier GPU con 2 GB o mas de memoria, incluidas integradas, si se dispone de una ruta de despliegue compatible.
- Dispositivos objetivo: telefonos y tablets Android e iOS, ademas de equipos de borde, a traves de LiteRT-LM sobre CPU, GPU o NPU.
- Opciones de despliegue: LiteRT-LM para on-device. vLLM, llama.cpp, Ollama o TGI no consumen `.litertlm` de forma nativa; para esos motores habria que partir del modelo base `google/gemma-3-1b-it` en safetensors o convertirlo a GGUF.
- Latencia y throughput: no disponible. Dependen por completo del hardware, del backend (CPU/GPU/NPU) y del porcentaje de tokens que se puedan reutilizar mediante el prefill multiple.

## Comparativa con modelos similares

La comparacion se establece frente a modelos instructivos de ~1-2B pensados para ejecucion local. Los datos de contexto y licencia corresponden a las model cards publicas de cada modelo y pueden cambiar; no se dispone de comparaciones de rendimiento medidas sobre este artefacto cuantizado.

| Modelo | Parametros | Contexto | Licencia | Formato on-device | Benchmarks |
|---|---|---|---|---|---|
| gemma-3-1b-it-litertlm (este artefacto) | ~1B (int4, 557 MiB) | 4096 tokens (artefacto); mayor en el base | Gemma Terms of Use | LiteRT-LM | no disponible |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | GGUF y otros formatos de la comunidad | no disponible |
| Llama-3.2-1B-Instruct | 1,23B | 128.000 tokens | Llama 3.2 Community License | GGUF y otros formatos de la comunidad | no disponible |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | GGUF y otros formatos de la comunidad | no disponible |

Diferencias destacables: la licencia Gemma es mas restrictiva que Apache 2.0 y exige cumplir la politica de usos prohibidos; el contexto de 4096 tokens de este artefacto es el mas corto de la comparativa; y el formato LiteRT-LM esta orientado a movil, mientras que el resto de alternativas tienen ecosistemas de despliegue mas amplios en servidor y escritorio.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card de este repositorio. Al derivar de `google/gemma-3-1b-it`, hereda los sesgos del modelo base, que no se detallan aqui.
- Riesgo de alucinacion: alto en un modelo de 1B parametros, especialmente en preguntas factuales, citas, calculos y referencias bibliograficas. La cuantizacion int4 puede incrementarlo ligeramente.
- Contexto limitado a 4096 tokens en este artefacto, muy por debajo de lo que admite el modelo base. Documentos largos o conversaciones extensas requeriran truncado o resumen previo.
- Restriccion de licencia: el uso esta sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy. Cualquiera que descargue el fichero lo recibe bajo esos mismos terminos. No es una licencia de tipo Apache o MIT y conviene revisarla antes de integrarlo en un producto comercial.
- Sin garantias de soporte: es un repositorio de distribucion con 0 descargas y 0 likes, mantenido por un tercero. La actualizacion del artefacto no esta comprometida en ningun calendario.
- Dependencia del runtime: el fichero solo es util con un runtime compatible con LiteRT-LM. No se puede cargar directamente en transformers, vLLM o llama.cpp.
- Idioma y tokenizacion: la model card no especifica los idiomas soportados ni la calidad por idioma, por lo que el rendimiento fuera del ingles o de los idiomas mayoritarios de Gemma 3 no esta verificado.
- Verificacion de integridad: conviene comprobar el SHA-256 publicado (`1325ae366d31950f137c9c357b9fa89448b176d76998180c08ceaca78bba98be`) tras la descarga, ya que el repositorio no ofrece firmas adicionales.
- Ausencia de evaluaciones: no hay benchmarks ni pruebas de calidad publicadas para este artefacto, de modo que cualquier decision de produccion deberia apoyarse en una evaluacion propia sobre el caso de uso concreto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/cuesetac/gemma-3-1b-it-litertlm
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Paper, blog tecnico, repositorio de codigo o demo especificos de este artefacto: no disponible en la informacion proporcionada.
