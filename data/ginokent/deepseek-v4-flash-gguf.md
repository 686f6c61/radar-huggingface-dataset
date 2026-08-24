# ginokent/deepseek-v4-flash-gguf

## Resumen

DeepSeek V4 Flash 0731 es un modelo de lenguaje de gran tamano desarrollado por DeepSeek, y esta ficha documenta una conversion a formato GGUF realizada por el usuario ginokent. El repositorio `ginokent/deepseek-v4-flash-gguf` contiene una cuantizacion mixta del modelo base `deepseek-ai/DeepSeek-V4-Flash-0731`, disenada especificamente para optimizar la velocidad de decodificacion en el motor de inferencia propio del autor, llamado gnrs-ml. El modelo tiene aproximadamente 284.334 millones de parametros y un tamano de archivo de 83,6 GB.

La relevancia de esta conversion radica en su estrategia de cuantizacion selectiva: en lugar de aplicar una unica precision a todos los pesos, el autor asigna distintos niveles de cuantizacion segun la frecuencia de acceso de cada componente durante la inferencia. Los expertos enrutados se cuantizan a aproximadamente 2 bits por peso, mientras que las proyecciones de atencion y los expertos compartidos se mantienen en Q4_K, y la capa de salida se conserva en Q8_0 para no degradar la tasa de aceptacion de la decodificacion especulativa. Segun las mediciones del autor, esta configuracion alcanza 21,1 tokens por segundo en decodificacion sobre una APU Ryzen AI Max+ 395, superando a otras cuantizaciones GGUF comparables del mismo modelo base.

El repositorio se publica bajo licencia MIT, lo que permite uso comercial sin restricciones significativas. Es importante senalar que el autor solo ha verificado el funcionamiento con su propio motor gnrs-ml, aunque indica que otros motores compatibles con GGUF como llama.cpp deberian poder leer el archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: DeepSeek-V4-Flash-0731) |
| Parametros totales | 284.334.567.511 (284,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS, Q2_K, Q4_K, Q8_0, F16 (cuantizacion mixta por componente) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base DeepSeek-V4-Flash-0731. Por el nombre y la estructura de tensores mencionada en la model card, se puede inferir que se trata de un modelo de mezcla de expertos (MoE) con expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`) y expertos compartidos (`ffn_*_shexp`), ademas de componentes denominados "hyper-connection", "compressor" e "indexer" que sugieren una arquitectura con algun mecanismo de compresion de contexto o conexiones residuales especiales. Sin embargo, estos detalles no estan confirmados en la documentacion proporcionada.

El proceso de cuantizacion se realizo con la herramienta `deepseek4-quantize` del repositorio `antirez/ds4`, partiendo de los safetensors oficiales en precision FP8 e4m3 para la mayoria de los pesos y FP4 para los expertos. La metadata, el tokenizador y los nombres y formas de los tensores se tomaron de la conversion GGUF de Unsloth (`unsloth/DeepSeek-V4-Flash-0731-GGUF`) mediante la opcion `--template`. La receta de cuantizacion es original del autor y se describe en la tabla de la model card.

La decision clave del autor fue mantener `output.weight` en Q8_0, ya que al reducir su precision la tasa de aceptacion de la decodificacion especulativa cayo de 1,905 a 1,250 tokens por paso, anulando cualquier ganancia de velocidad. Las proyecciones de atencion y los expertos compartidos se cuantizaron a Q4_K porque se leen en cada token generado, reduciendo el trafico de memoria en 2,89 GiB por token en comparacion con Q8_0.

## Capacidades

- Generacion de texto autoregresiva con soporte para decodificacion especulativa, optimizada para velocidad de decodificacion en el motor gnrs-ml.
- Capacidades conversacionales, segun la etiqueta `conversational` del repositorio.
- Compatible con endpoints, segun la etiqueta `endpoints_compatible`.
- Soporte multilingue no documentado en la informacion disponible.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion proporcionada.
- El modelo base DeepSeek-V4-Flash-0731 es un modelo de DeepSeek, por lo que se espera que herede las capacidades generales de la familia DeepSeek-V4, pero no se dispone de documentacion especifica en esta ficha.

## Casos de uso

- Inferencia local en hardware de consumo: con 83,6 GB de pesos, el modelo puede ejecutarse en sistemas con suficiente RAM unificada, como la APU Ryzen AI Max+ 395 con 128 GB de memoria compartida utilizada en las pruebas del autor, alcanzando 21,1 tokens por segundo en decodificacion.
- Despliegue en servidores con GPU de alta capacidad: el archivo GGUF puede cargarse en motores compatibles como llama.cpp o vLLM, aunque el autor solo ha verificado gnrs-ml, para servir el modelo como endpoint de chat o generacion de texto.
- Experimentacion con cuantizacion mixta: la receta de cuantizacion documentada sirve como referencia para otros desarrolladores que quieran optimizar modelos MoE para velocidad de decodificacion en hardware con ancho de banda de memoria limitado.
- Generacion de texto de largo recorrido: la optimizacion de la velocidad de decodificacion hace que el modelo sea adecuado para tareas que requieren generar secuencias largas, como resumen de documentos extensos o redaccion asistida.
- Desarrollo de aplicaciones conversacionales: al ser un modelo de chat con licencia MIT, puede integrarse en productos comerciales de atencion al cliente o asistentes virtuales sin coste de licencia.
- Investigacion sobre decodificacion especulativa: la documentacion incluye datos sobre la tasa de aceptacion (1,905 tokens por paso) que pueden ser utiles para investigadores que trabajen en este campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento proporcionado es la velocidad de decodificacion medida por el autor en una APU Ryzen AI Max+ 395 (gfx1151) con el motor gnrs-ml, generando 160 tokens tras un prompt de 64 tokens:

| Modelo | Decodificacion | Tamano |
|---|---|---|
| ginokent/deepseek-v4-flash-gguf (este modelo) | 21,1 tok/s | 83,6 GB |
| unsloth/DeepSeek-V4-Flash-0731-GGUF (UD-IQ2_XXS) | 17,9 tok/s | 84,6 GB |
| antirez/deepseek-v4-gguf (IQ2XXS-w2Q2K-AProjQ8) | 17,3 tok/s | 86,7 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa 83,6 GB, por lo que se necesita al menos esa cantidad de memoria disponible entre VRAM y RAM unificada. En una GPU dedicada, se necesitarian multiples GPU (por ejemplo, 2x 48 GB o 4x 24 GB) o una GPU con 96 GB o mas de VRAM.
- GPU recomendadas: el autor probo en una APU Ryzen AI Max+ 395 con 128 GB de memoria unificada. En el segmento de GPU dedicadas, seria necesario hardware de clase datacenter como A100 80 GB (insuficiente en solitario), H100 80 GB (insuficiente en solitario) o configuraciones multi-GPU.
- En consumer GPU: no cabe en ninguna GPU de consumo actual (RTX 4090 tiene 24 GB, RTX 5090 tiene 32 GB). Solo es viable en sistemas con RAM unificada amplia como las APU Ryzen AI Max o en configuraciones de multiples GPU.
- Opciones de despliegue: el autor verifica exclusivamente el motor gnrs-ml, pero el formato GGUF es compatible con llama.cpp, Ollama y otros motores que soporten GGUF, aunque no se ha probado.
- Latencia y throughput: 21,1 tokens por segundo en decodificacion medidos en Ryzen AI Max+ 395 con gnrs-ml. No se dispone de datos para otros motores o hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano archivo | Decodificacion (Ryzen AI Max+ 395) | Licencia |
|---|---|---|---|---|
| ginokent/deepseek-v4-flash-gguf | 284,3 B | 83,6 GB | 21,1 tok/s | MIT |
| unsloth/DeepSeek-V4-Flash-0731-GGUF (UD-IQ2_XXS) | 284,3 B | 84,6 GB | 17,9 tok/s | MIT |
| antirez/deepseek-v4-gguf (IQ2XXS-w2Q2K-AProjQ8) | 284,3 B | 86,7 GB | 17,3 tok/s | MIT |

Los tres modelos son conversiones GGUF del mismo modelo base DeepSeek-V4-Flash-0731. La diferencia principal es la receta de cuantizacion: este modelo prioriza la velocidad de decodificacion manteniendo las capas de atencion en Q4_K y la capa de salida en Q8_0, mientras que las alternativas aplican cuantizaciones mas agresivas de forma mas uniforme. El resultado es una ventaja de aproximadamente 3-4 tokens por segundo en decodificacion, con un tamano de archivo ligeramente menor.

## Limitaciones y advertencias

- El autor solo ha verificado el funcionamiento con el motor gnrs-ml. Aunque indica que llama.cpp deberia poder leer el archivo, no hay garantia de compatibilidad total con otros motores.
- La cuantizacion mixta con IQ2_XXS en los expertos enrutados (2,06 bits por peso) puede degradar la calidad de las respuestas en comparacion con el modelo original en FP8/FP4, aunque no se aportan benchmarks de calidad que cuantifiquen esta perdida.
- No se dispone de informacion sobre la longitud de contexto soportada, los idiomas cubiertos ni las capacidades exactas del modelo base, por lo que su comportamiento en estos aspectos es incierto.
- El modelo tiene 284 B parametros y requiere al menos 84 GB de memoria, lo que limita su despliegue a hardware especializado o sistemas con gran cantidad de RAM unificada.
- No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, etc.), por lo que no es posible evaluar objetivamente su rendimiento en tareas estandar.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base DeepSeek-V4-Flash-0731 podria tener su propia licencia que conviene revisar antes de un despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicacion reciente sin validacion de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ginokent/deepseek-v4-flash-gguf
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Conversion GGUF de Unsloth (usada como plantilla): https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF
- Repositorio gnrs-ml (motor de inferencia del autor): https://github.com/ginokent/gnrs-ml
- Herramienta de cuantizacion ds4: https://github.com/antirez/ds4
- Conversion GGUF de antirez: https://huggingface.co/antirez/deepseek-v4-gguf
- Sitio oficial de DeepSeek: https://deepseek.com/en/index.html
- Pagina de descarga alternativa: https://local-ai-zone.github.io/models/deepseek-v4-flash-0731.html
