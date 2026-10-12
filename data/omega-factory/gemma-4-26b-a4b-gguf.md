# Omega-Factory/gemma-4-26b-a4b-GGUF

## Resumen

Omega-Factory/gemma-4-26b-a4b-GGUF es una publicacion de pesos cuantizados en formato GGUF derivada de google/gemma-4-26b-a4b, un modelo de lenguaje de arquitectura de mezcla de expertos (MoE) con 25,2 mil millones de parametros totales y 3,8 mil millones activos por token. El repositorio lo mantiene la organizacion Omega-Factory y su aportacion principal no es un modelo nuevo, sino una escalera de cuantizacion certificada: cada variante (Q8_0, Q4_K_M, Q2_K) se valido sobre sus propios bytes (con hash SHA256 y recibo de certificacion), y se publican tablas comparativas frente al modelo base sin cuantizar.

El modelo resuelve un problema practico de despliegue: cuanto se degrada la capacidad real de un MoE grande al comprimirlo. La model card incluye una matriz de precision con exactitud en GSM8K, MATH-500 y ARC-MC para FP16, Q8_0, Q4_K_M y Q2_K, ademas de un analisis de discordancia item a item con la prueba de McNemar. Los resultados muestran una caida muy contenida en Q8_0, moderada en Q4_K_M y catastrofica en Q2_K, lo que convierte al repositorio en una referencia util para decidir que rung desplegar.

Con 30 capas, 128 expertos y enrutado top-8, el modelo soporta una longitud de contexto de 131.072 tokens. El repositorio ocupa 54,2 GB y oferta tres tamanos de artefacto (10,58 GB, 16,80 GB y 26,86 GB) que cubren desde GPUs de gama consumer de 12-16 GB hasta configuraciones de 32-48 GB. La licencia es la Gemma Terms of Use heredada del modelo base, con uso orientado a investigacion y uso gratuito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) sobre transformer; enrutado top-8 |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | 3,8 B |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q8_0 (26,86 GB), Q4_K_M (16,80 GB), Q2_K (10,58 GB); baseline FP16 sin cuantizar (50,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (heredada de google/gemma-4-26b-a4b) |
| Formato de pesos | GGUF |
| Capas | 30 |
| Expertos totales | 128 |
| Expertos activos por token | 8 |
| Tamano del repositorio | 54,2 GB |
| Modelo base | google/gemma-4-26b-a4b |
| Plantilla de chat | `<start_of_turn>user ... <end_of_turn><start_of_turn>model ... <end_of_turn>` |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos: 30 capas, 128 expertos por capa y enrutado top-8, lo que da 25,2 B de parametros almacenados pero solo 3,8 B activos en cada paso de inferencia. Esa relacion de activacion (aproximadamente un 15 % de los parametros) es la que explica que el coste computacional por token se acerque al de un modelo denso de ~3,8 B, mientras que el coste de memoria viene dominado por el conjunto completo de pesos. El modelo hereda el contexto de 131.072 tokens y la plantilla de chat `<start_of_turn>` del modelo base de Google.

Este repositorio no entrena ni afina el modelo: publica una derivada comprimida en la que, segun la propia model card, se podaron expertos y el resultado se recuantizo. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, porque corresponden al modelo base y no se reproducen aqui. Tampoco se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion alternativa.

La contribucion tecnica verificable es el proceso de certificacion: cada rung se evaluo de forma determinista sobre su propio artefacto, con verificacion criptografica (SHA256 y ficheros de recibo), y se publican tanto las variantes que superaron los umbrales como el veredicto real de las que no. La model card distingue explicitamente entre un resultado `CERTIFIED` (con el conjunto completo de semillas) y un `SCREEN` (resultado parcial, no certificado).

## Capacidades

- Generacion de texto y conversacion multi-turno mediante la plantilla `<start_of_turn>` con roles de usuario y modelo.
- Razonamiento matematico de varios pasos: evaluado en GSM8K y MATH-500, con soporte de un modo "thinking" que recomienda temperatura 1,0, top_p 0,95, top_k 20 y repetition_penalty 1,0.
- Modo instruct: recomendado con temperatura 0,7, top_p 0,8, top_k 20 y presence_penalty 1,5.
- Razonamiento de opcion multiple y conocimiento general: evaluado con ARC-MC, donde la cuantizacion apenas afecta (92,0 % en FP16 y Q8_0, 92,5 % en Q4_K_M).
- Contexto largo de hasta 131.072 tokens, adecuado para documentos extensos y conversaciones de muchas vueltas.
- Inferencia eficiente por arquitectura MoE: 3,8 B parametros activos por token.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso autonomo: no disponible en la informacion proporcionada (solo se acredita el modo thinking para razonamiento interno).
- Capacidades de vision o audio: no disponible.
- Cobertura multilingue: no disponible; la model card no declara lista de idiomas.

## Casos de uso

- Evaluacion de degradacion por cuantizacion: replicar la matriz de precision del repositorio (GSM8K, MATH-500, ARC-MC con 200 items y semilla fija) para comprobar en hardware propio si Q8_0 mantiene su delta de -2,5 pp en GSM8K y -4,0 pp en MATH-500 frente al FP16, antes de fijar una version de produccion.
- Asistente de razonamiento matematico en una sola GPU consumer: desplegar Q4_K_M (16,80 GB) en una GPU de 20-24 GB, asumiendo la perdida documentada de -7,0 pp en GSM8K y -13,5 pp en MATH-500 respecto al baseline.
- Analisis de documentos largos: aprovechar la ventana de 131.072 tokens para procesar informes, expedientes o bases de codigo extensas en una sola pasada, sin trocear el contexto y sin perder coherencia entre secciones.
- Despliegue en entornos aislados (air-gapped): al ser pesos GGUF autocontenidos y no requerir llamadas a servicios externos, encaja en laboratorios o redes restringidas donde no se permite salida a Internet.
- Servicio de chat multi-turno mediante API compatible con endpoints: la etiqueta `endpoints_compatible` y la plantilla de chat documentada permiten exponerlo como endpoint de generacion de texto para aplicaciones internas.
- Investigacion sobre poda de expertos y cuantizacion de MoE: los recibos SHA256 y el analisis McNemar item a item permiten estudiar que categorias de pregunta se rompen primero al bajar de Q8_0 a Q4_K_M (32 flips rotos en MATH-500 frente a 12 en GSM8K) y por que el rung Q2_K colapsa.
- Prototipado rapido en portatil o estacion de trabajo con 12-16 GB: usar Q2_K unicamente para validar integracion, plantillas y flujos de datos, nunca para tareas que dependan de aritmetica, dado su 4,5 % en GSM8K.
- Reproduccion academica de la escalera de certificacion: comparar los tres rungs con el baseline FP16 (50,5 GB) para estudiar la relacion entre tamano de artefacto y retencion de capacidad en arquitecturas MoE dispersas.
- Inferencia con offload parcial a CPU: para Q8_0 (26,86 GB), repartir capas entre GPU y CPU en equipos con 32-48 GB de capacidad de referencia cuando no hay acceso a una GPU de mayor VRAM.

## Benchmarks y rendimiento

Datos publicados en la model card. Evaluacion determinista, 200 items por prueba.

| Variante | Tamano (disco) | GSM8K | MATH-500 | ARC-MC | Babble rate | Estado |
|---|---|---|---|---|---|---|
| FP16 baseline | 50,5 GB | 73,0 % (146/200) | 36,5 % (73/200) | 92,0 % (184/200) | 0,0000 | Baseline |
| Q8_0 | 26,86 GB | 70,5 % (-2,5 pp) | 32,5 % (-4,0 pp) | 92,0 % (0,0 pp) | 0,0000 | CERTIFIED |
| Q4_K_M | 16,80 GB | 66,0 % (-7,0 pp) | 23,0 % (-13,5 pp) | 92,5 % (+0,5 pp) | 0,0000 | CERTIFIED |
| Q2_K | 10,58 GB | 4,5 % (-68,5 pp) | 7,5 % (-29,0 pp) | 82,0 % (-10,0 pp) | 0,0000 | CERTIFIED |

Analisis de discordancia item a item (McNemar) frente a FP16:

| Variante | Categoria | Aciertos quant | Aciertos FP16 | Flips rotos (FP16 ok a quant fallo) | Flips arreglados | Delta neto |
|---|---|---|---|---|---|---|
| Q8_0 | ARC-MC | 184/200 | 184/200 | 0 | 0 | +0,0 pp |
| Q8_0 | GSM8K | 141/200 | 146/200 | 8 | 3 | -2,5 pp |
| Q8_0 | MATH-500 | 65/200 | 73/200 | 12 | 4 | -4,0 pp |
| Q4_K_M | ARC-MC | 185/200 | 184/200 | 4 | 5 | +0,5 pp |
| Q4_K_M | GSM8K | 132/200 | 146/200 | 26 | 12 | -7,0 pp |
| Q4_K_M | MATH-500 | 46/200 | 73/200 | 32 | 5 | -13,5 pp |
| Q2_K | ARC-MC | 164/200 | 184/200 | 27 | 7 | -10,0 pp |
| Q2_K | GSM8K | 9/200 | 146/200 | 138 | 1 | -68,5 pp |
| Q2_K | MATH-500 | 15/200 | 73/200 | 64 | 6 | -29,0 pp |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni de benchmarks de codigo o multilingues.

## Requisitos de hardware

- VRAM estimada (bandas de capacidad de referencia declaradas por el autor; el tamano del artefacto es uso de disco, no una medida de VRAM):
  - Q2_K: 10,58 GB de artefacto, banda de referencia 12-16 GB.
  - Q4_K_M: 16,80 GB de artefacto, banda de referencia 20-24 GB.
  - Q8_0: 26,86 GB de artefacto, banda de referencia 32-48 GB.
  - FP16 baseline: 50,5 GB, requiere multi-GPU u offload a CPU.
- La VRAM real depende del backend, del batch y de la longitud de contexto por el cache KV; el autor recomienda validar con perfilado de memoria pico.
- Cabe en GPU consumer: Q4_K_M en tarjetas de 24 GB (RTX 3090, RTX 4090) y Q2_K en tarjetas de 12-16 GB (RTX 4070 Ti Super 16 GB, RTX 4080). Q8_0 queda fuera de una consumer de 24 GB salvo offload parcial a CPU.
- Opciones de despliegue: el formato es GGUF, por lo que los runtimes habituales son llama.cpp y sus envoltorios (Ollama, LM Studio, servidores compatibles con la API de OpenAI). El repositorio esta etiquetado como `endpoints_compatible`. El soporte de GGUF en motores como vLLM o TGI no se documenta en la informacion proporcionada.
- Latencia y throughput: no disponibles. Como referencia estructural, el modelo activa 3,8 B parametros por token, por lo que el coste de computo por token es bajo, pero el ancho de banda de memoria necesaria para recorrer los pesos MoE (especialmente en Q8_0) sera el factor limitante.
- Parametros de muestreo recomendados por el autor: modo thinking (temperatura 1,0, top_p 0,95, top_k 20, repetition_penalty 1,0) y modo instruct (temperatura 0,7, top_p 0,8, top_k 20, presence_penalty 1,5).

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La comparacion posible es interna, entre los rungs publicados y el baseline FP16 del propio modelo base.

| Variante | Parametros | Contexto | GSM8K | MATH-500 | Tamano | Licencia |
|---|---|---|---|---|---|---|
| FP16 baseline (google/gemma-4-26b-a4b) | 25,2 B totales / 3,8 B activos | 131.072 | 73,0 % | 36,5 % | 50,5 GB | Gemma Terms |
| Q8_0 (este repo) | 25,2 B totales / 3,8 B activos | 131.072 | 70,5 % | 32,5 % | 26,86 GB | Gemma Terms |
| Q4_K_M (este repo) | 25,2 B totales / 3,8 B activos | 131.072 | 66,0 % | 23,0 % | 16,80 GB | Gemma Terms |
| Q2_K (este repo) | 25,2 B totales / 3,8 B activos | 131.072 | 4,5 % | 7,5 % | 10,58 GB | Gemma Terms |

Comparativa con alternativas de otros fabricantes (Qwen, Llama, Mistral, etc.): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Q2_K no es utilizable para tareas que dependan de aritmetica: cae a 4,5 % en GSM8K (-68,5 pp) y a 7,5 % en MATH-500 (-29,0 pp) respecto al baseline. Se certifica porque supera las bandas definidas por el autor, no porque retenga capacidad.
- Incluso en Q8_0 hay perdida medible: 12 flips rotos frente a 4 arreglados en MATH-500 y 8 frente a 3 en GSM8K. En Q4_K_M la perdida en razonamiento matematico es notable (-13,5 pp en MATH-500).
- La tasa de babble reportada es 0,0000 en todas las variantes y en el baseline, pero se trata de una metrica concreta del autor; no cubre otras formas de degeneracion, repeticion o alucinacion.
- No hay informacion sobre sesgos demograficos, linguisticos o culturales, ni evaluaciones de seguridad o alineacion en la informacion disponible.
- No hay lista de idiomas soportados ni evaluaciones multilingues: el rendimiento fuera del ingles (y del idioma dominante de entrenamiento del base) es desconocido.
- Licencia: Gemma Terms of Use heredada. El repositorio declara uso de investigacion y uso gratuito, y afirma explicitamente que no realiza reclamaciones de servicio comercial sobre esta derivada. Cualquier uso comercial debe verificar los terminos del modelo base con Google.
- Es una derivada comprimida con expertos podados y recuantizados: no es un modelo base nuevo y puede diferir del comportamiento del original en dominios no cubiertos por GSM8K, MATH-500 y ARC-MC.
- La evaluacion publicada usa 200 items por prueba y una sola semilla en cada rung certificado, lo que limita la potencia estadistica de las diferencias de pocos puntos porcentuales (por ejemplo, el +0,5 pp de Q4_K_M en ARC-MC).
- Las bandas de VRAM son capacidades de referencia declaradas por el autor, no ajustes medidos; el consumo real depende del backend, del tamano de batch y de la longitud de contexto por el cache KV.
- Contexto de 131.072 tokens: usar la ventana completa exige cache KV proporcional, que puede superar con holgura el tamano del propio artefacto de pesos en configuraciones de batch alto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Omega-Factory/gemma-4-26b-a4b-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b
- Pagina del modelo con tablas de precision y recibos: https://omega-factory.ai/models/gemma-4-26b-a4b-gguf-v1
- Organizacion en HuggingFace (contacto y reporte de problemas): https://huggingface.co/Omega-Factory
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos corresponden a la marca de relojes Omega y no guardan relacion con el artefacto. No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
