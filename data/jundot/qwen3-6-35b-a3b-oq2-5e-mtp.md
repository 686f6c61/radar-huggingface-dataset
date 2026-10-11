# Jundot/Qwen3.6-35B-A3B-oQ2.5e-mtp

## Resumen

El modelo Jundot/Qwen3.6-35B-A3B-oQ2.5e-mtp es un checkpoint cuantizado en formato MLX del modelo Qwen/Qwen3.6-35B-A3B, un modelo de vision-lenguaje con arquitectura de mezcla de expertos (MoE) de 35B parametros totales y aproximadamente 3B parametros activos. La cuantizacion la ha realizado el usuario Jundot mediante la herramienta oQ (oMLX v0.7.1), aplicando una cuantizacion de precision mixta denominada oQ2.5e con la mejora "Improved oQe Quantization". El checkpoint final ocupa 13.612 GiB (14.6 GB) y presenta un promedio efectivo de 3.252 bits por peso.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de vision-lenguaje de 35B parametros en hardware Apple Silicon con memoria unificada moderada, algo inviable con los pesos originales en BF16. El checkpoint incluye el modelo de lenguaje, el codificador de vision y la cabeza de prediccion multi-token (MTP), y sigue una arquitectura hibrida de capas Gated DeltaNet y Gated Attention.

Se trata de una publicacion reciente y con muy poca traccion (0 descargas y 0 "likes" en el momento de la consulta), por lo que no hay resultados de benchmarks ni documentacion adicional sobre su comportamiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-lenguaje (qwen3_5_moe) con capas hibridas Gated DeltaNet y Gated Attention |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | Aproximadamente 3B (segun la model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta affine (2, 3, 4, 5 y 8 bits) mas BF16; promedio efectivo 3,252 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); checkpoint de 13,612 GiB / 14,616 GB |
| Tamano del repositorio | 14,6 GB |
| Componentes incluidos | Modelo de lenguaje (34,661B), codificador de vision (0,447B) y cabeza MTP (0,845B) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |

Distribucion de almacenamiento por precision:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 2-bit, grupo 64 | 27,112B | 75,412% | 7,891 GiB | 2,50 |
| Affine 3-bit, grupo 64 | 5,100B | 14,186% | 2,078 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 0,805B | 2,240% | 0,422 GiB | 4,50 |
| Affine 5-bit, grupo 128 | 0,252B | 0,700% | 0,154 GiB | 5,25 |
| Affine 8-bit, grupo 128 | 0,129B | 0,359% | 0,124 GiB | 8,25 |
| Affine 8-bit, grupo 64 | 2,076B | 5,774% | 2,054 GiB | 8,50 |
| BF16 | 0,478B | 1,329% | 0,890 GiB | 16,00 |
| Total | 35,952B | 100% | 13,612 GiB | 3,252 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con atencion hibrida: combina capas Gated DeltaNet (un mecanismo de atencion lineal/SSM con puerta) y capas Gated Attention convencionales, una disposicion que el autor denomina "hybrid layout". El checkpoint añade un codificador de vision (0,447B parametros) que habilita la modalidad image-text-to-text, y una cabeza de prediccion multi-token (MTP, 0,845B parametros) que permite decodificacion especulativa generando varios tokens por paso del modelo principal. En conjunto suman 35,952B parametros logicos, de los cuales solo unos 3B se activan por token, lo que reduce el coste de inferencia respecto a un modelo denso de tamano equivalente.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si se aplico RLHF o DPO, ya que esta ficha describe una cuantizacion derivada y no el entrenamiento original del modelo base. La innovacion tecnica propia de este checkpoint es el metodo de cuantizacion oQ2.5e: asigna bits en funcion de la sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia calculada sobre 128 muestras por 512 tokens y realiza un reajuste ponderado por minimos cuadrados de la escala y el sesgo de cada grupo. No se ha publicado informacion sobre el proceso de destilacion o calibracion mas alla de esos detalles.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados del modelo base Qwen3.6-35B-A3B.
- Comprension de imagenes (pipeline image-text-to-text) gracias al codificador de vision integrado.
- Prediccion multi-token mediante la cabeza MTP, pensada para acelerar la decodificacion especulativa.
- Inferencia eficiente por activacion de solo unos 3B parametros por token (arquitectura MoE).
- Capacidades multilingues: no disponible (la model card no especifica idiomas); probablemente heredadas del modelo base, pero sin confirmar.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente de vision-lenguaje local en portatil Apple Silicon: al ocupar 13,612 GiB, el checkpoint cabe en Macs con memoria unificada de 24 GB o mas, permitiendo describir imagenes, responder preguntas sobre capturas o analizar diagramas sin conexion a la nube.
- Documentacion tecnica asistida por capturas: el modelo puede recibir imagenes de interfaces, diagramas de arquitectura o graficos y generar explicaciones en texto, util para equipos que documentan productos graficos.
- Clasificacion y etiquetado de imagenes con contexto textual: se puede emplear en pipelines de moderacion o catalogacion donde se requiere una descripcion en lenguaje natural junto a cada imagen.
- Generacion de codigo y asistencia de programacion en local: aunque la model card no detalla rendimiento especifico en codigo, el modelo base es de proposito general; el checkpoint MTP permite acelerar la generacion de respuestas largas en un entorno sin fuga de datos.
- Prototipado de agentes multimodales en investigacion: la combinacion de MTP y vision permite experimentar con flujos de razonamiento multi-paso sobre entradas mixtas en un Mac, sin necesidad de GPUs dedicadas.
- Despliegue en entornos con restricciones de privacidad: al ser un modelo Apache-2.0 y ejecutarse en local mediante MLX, es adecuado para escenarios donde no se pueden enviar imagenes o texto a servicios externos (sanidad, legal, defensa).
- Estudio de tecnicas de cuantizacion: la distribucion detallada por numero de bits lo convierte en un objeto de estudio para investigadores que analicen el impacto de la precision mixta en modelos MoE de vision-lenguaje.
- Evaluacion comparativa de decodificacion especulativa: la presencia de la cabeza MTP permite medir ganancias de throughput frente a la decodificacion autoregresiva estandar en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: el checkpoint ocupa 13,612 GiB en disco, por lo que se recomienda un minimo de 16 GB de memoria unificada y, de forma realista, 24 GB o mas para dejar margen a la cache KV y al contexto.
- Plataforma objetivo: MLX, lo que implica ejecucion en Apple Silicon (familias M1, M2, M3, M4 y posteriores). No esta pensado para GPUs NVIDIA o AMD.
- GPU recomendadas: no aplica en el sentido tradicional; el equivalente seria un chip Apple con memoria unificada amplia (por ejemplo, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). No se recomienda para A100, H100 ni RTX 4090, ya que el formato MLX no esta optimizado para ellas.
- Si cabe en hardware de consumo: si, en Macs de gama alta con memoria unificada de 24 GB o superior. En configuraciones de 16 GB el margen sera muy ajustado y probablemente limitara el contexto.
- Opciones de despliegue: MLX (libreria declarada) y, presumiblemente, herramientas compatibles con MLX como mlx-lm; no se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es especifico de MLX.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Activacion por token | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-oQ2.5e-mtp (este) | 35,95B | ~3B | no disponible | MLX safetensors (~3,25 bits/peso) | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35,95B | ~3B | no disponible | safetensors BF16 | Apache-2.0 | HuggingFace (modelo original) |
| Otras cuantizaciones del mismo base | 35,95B | ~3B | no disponible | GGUF / MLX (segun autor) | Apache-2.0 | no disponible |

No se dispone de informacion suficiente sobre pesos finales, contexto o rendimiento de alternativas concretas para establecer una comparativa cuantitativa fiable; los valores marcados como "no disponible" reflejan la ausencia de datos en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2 bits dominante (el 75,4% de los pesos) puede degradar la calidad respecto al modelo base en BF16; no se han publicado evaluaciones que cuantifiquen esa perdida.
- No hay resultados de benchmarks publicados, por lo que el rendimiento real en tareas de razonamiento, codigo o vision es desconocido.
- Al ser una cuantizacion derivada, hereda los sesgos y limitaciones del modelo base Qwen3.6-35B-A3B, que tampoco se detallan en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje a gran escala; no hay datos especificos para este checkpoint.
- Idiomas soportados no confirmados; no se puede garantizar un rendimiento multilingue concreto.
- Longitud de contexto no disponible; en hardware con poca memoria unificada el contexto util quedara limitado por la cache KV.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y citar correctamente la procedencia de la cuantizacion.
- El formato MLX limita su despliegue a Apple Silicon; no es directamente utilizable en GPUs NVIDIA con vLLM o TGI sin conversion adicional.
- El repositorio no registra descargas ni valoraciones, por lo que la fiabilidad de la cuantizacion no ha sido validada por terceros.
- No se documenta compatibilidad con tool calling ni con flujos de agentes; su uso en produccion exigiria validacion previa.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ2.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
