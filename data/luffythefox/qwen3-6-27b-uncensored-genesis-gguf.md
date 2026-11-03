# LuffyTheFox/Qwen3.6-27B-Uncensored-Genesis-GGUF

## Resumen

Qwen3.6-27B-Uncensored-Genesis-GGUF es una distribucion en formato GGUF del modelo HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive, publicada por el usuario LuffyTheFox bajo el paraguas de su proyecto "Genesis". No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: el autor aplica un procedimiento de "reparacion de tensores" sobre los pesos en formato GGUF, basado en la distribucion de Marchenko-Pastur, para reducir el ruido acumulado durante el entrenamiento y corregir desequilibrios de escala, deriva de medias y bloques nulos. El resultado se distribuye con licencia Apache 2.0 y orientado a inferencia local.

El modelo subyacente es un transformer denso de 27.000 millones de parametros con encoder de vision, 64 capas, hidden size de 5.120 y FFN de 17.408, con un vocabulario de 248.320 tokens. Combina 48 capas Gated DeltaNet con 16 capas de atencion con compuertas, lo que lo situa en la familia de arquitecturas hibridas con componentes de atencion lineal. Declara una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000 con configuracion especifica del framework.

Su relevancia actual es doble: por un lado, ofrece capacidades multimodales (texto, imagen y video) con contexto muy largo en un tamano que puede ejecutarse en hardware de consumo con cuantizacion agresiva; por otro, es un ejemplo de la corriente de modelos "uncensored" derivados de la familia Qwen, con las implicaciones de seguridad y licencia que eso conlleva. La informacion disponible sobre el modelo base y sobre el procedimiento Genesis es limitada, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con encoder de vision; hibrido de 48 capas Gated DeltaNet y 16 capas de atencion con compuertas |
| Parametros totales | 27.000 millones (aproximado, segun el nombre del modelo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 con configuracion especifica del framework |
| Tipos de cuantizacion | GGUF en varias cuantizaciones; el autor recomienda NVFP4; soporte de perfiles Unsloth en el script de cuantizacion |
| Idiomas soportados | Ingles, chino y multilingue (segun tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere archivo `mmproj` adicional para vision) |
| Capas | 64 |
| Hidden size | 5.120 |
| FFN size | 17.408 |
| Vocabulario | 248.320 tokens (con padding) |
| Modalidades | Texto, imagen y video |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con 64 capas que alterna dos tipos de bloque: 48 capas Gated DeltaNet y 16 capas de atencion con compuertas. El hidden size es de 5.120 y la FFN de 17.408, con un vocabulario de 248.320 tokens. Incorpora un encoder de vision que habilita la comprension nativa de imagenes y video, lo que justifica la etiqueta `image-text-to-text` del repositorio. La combinacion de capas DeltaNet con atencion clasica es coherente con la busqueda de eficiencia en contextos largos, aunque la informacion disponible no detalla la composicion exacta del dataset de entrenamiento ni el numero de tokens utilizados.

El elemento diferencial de esta publicacion no es el entrenamiento, sino el post-procesado. El autor describe el metodo Genesis como una "cirugia numerica" sobre los bytes del archivo GGUF, ejecutada en Google Colab con una GPU Tesla T4, que actua en tres etapas: primero escanea los tensores `ssm_conv1d` (asociados a la memoria de contexto largo) y reequilibra las cabezas; despues sustituye bloques nulos por fragmentos que mejor se ajustan a la distribucion de pesos del tensor; y finalmente aplica una SVD personalizada basada en la ley de Marchenko-Pastur para atenuar el ruido, excluyendo `token_embd.weight`, `output.weight`, tensores 1D, sesgos y normas. El autor afirma preservar el 99 % de la senal y el gradiente aprendido. No se aportan metricas objetivas que cuantifiquen la mejora, ni documentacion independiente que valide el procedimiento.

## Capacidades

- Generacion de texto y razonamiento en contextos de hasta 262.144 tokens, con extension declarada hasta 1.000.000.
- Comprension de imagenes y video mediante el encoder de vision, siempre que se cargue el archivo `mmproj` junto al GGUF principal.
- Modo "thinking" para tareas de codigo y precision, con parametros de muestreo recomendados por el autor (temperatura 0,6, top_p 0,95, top_k 20, semilla 42).
- Modo creativo sin razonamiento explicito, con temperatura 0,7 y top_p 0,8.
- Soporte multilingue declarado para ingles, chino y otros idiomas, aunque sin detalle de cobertura por idioma.
- Compatibilidad con plantillas de chat tipo Jinja mediante el flag `--jinja` de llama.cpp.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de audio.

## Casos de uso

- Analisis de documentos largos con imagenes intercaladas: el contexto de 262.144 tokens permite procesar informes, contratos o expedientes completos junto con sus figuras y tablas, sin fragmentacion previa.
- Revision de codigo en repositorios grandes: el modo thinking con temperatura baja y semilla fija facilita respuestas reproducibles en tareas de depuracion y explicacion de parches.
- Procesamiento de video para extraccion de resumenes: el encoder de vision habilita describir escenas o localizar eventos en clips, util en catalogacion de archivos audiovisuales.
- Asistencia creativa y escritura de ficcion sin filtros editoriales: el caracter "uncensored" del modelo base permite generar narrativa adulta o temas sensibles que los modelos alineados rechazan, siempre que el despliegue cumpla la legalidad aplicable.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones GGUF permiten ejecutar el modelo con llama.cpp, LM Studio o koboldcpp sin depender de la nube.
- Prototipado de asistentes multimodales en investigacion: sirve para experimentar con arquitecturas hibridas DeltaNet y contextos muy largos en entornos controlados.
- Generacion de descripciones de imagenes en pipelines de accesibilidad: con el `mmproj` cargado, puede producir texto alternativo para catalogos o repositorios fotograficos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas comparativas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y tampoco se aportan metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantizacion de 4 bits, en torno a 15-17 GB solo para los pesos; en 8 bits, alrededor de 28-30 GB. El contexto largo incrementa el consumo por la cache KV, que el autor recomienda mantener en F16.
- GPU recomendadas: para cuantizaciones de 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede alojar los pesos, aunque el contexto completo de 262.144 tokens exigira offload parcial a CPU. Para contexto largo sin compromisos, se recomienda A100 80 GB o H100.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 bits o inferiores con offload parcial; el contexto maximo practico sera muy inferior al nativo.
- Opciones de despliegue: llama.cpp (con `--jinja`), LM Studio, koboldcpp y otros runtimes compatibles con GGUF. El autor recomienda offload maximo a GPU y cache K/V en F16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-Uncensored-Genesis (este) | 27B denso | 262.144 (ext. 1M) | Texto, imagen, video | Apache 2.0 | Post-procesado Genesis sobre el modelo de HauhauCS |
| HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive | 27B denso | No disponible en la informacion | Texto, imagen, video | No disponible en la informacion | Modelo base directo, sin reparacion de tensores |
| Modelos Qwen de la misma familia (variantes oficiales) | Variable | Variable | Texto o multimodal | Variable segun variante | No se dispone de datos concretos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas de la misma categoria. Las unicas diferencias documentadas frente al modelo base son el procedimiento Genesis y el empaquetado en GGUF.

## Limitaciones y advertencias

- El procedimiento Genesis no cuenta con validacion independiente ni metricas publicadas; las afirmaciones sobre reduccion de ruido y mejora de estabilidad son del autor y no estan contrastadas.
- El modelo es "uncensored": puede generar contenido que los modelos alineados rechazan, incluido material sensible o potencialmente danino. El despliegue en produccion exige filtros propios y evaluacion legal.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de fidelidad ni de tasa de alucinacion.
- La cobertura multilingue declarada (ingles, chino, multilingue) no detalla el rendimiento en castellano ni en otros idiomas.
- El contexto maximo de 262.144 tokens es nativo, pero en hardware de consumo el contexto practico sera mucho menor por el coste de la cache KV.
- La vision requiere cargar el archivo `mmproj` adicional; sin el, el modelo funciona solo como texto.
- La licencia Apache 2.0 del repositorio no exime de cumplir las condiciones del modelo base ni la legislacion aplicable sobre contenido generado.
- El modelo se publico en septiembre de 2026 y se actualizo en noviembre de 2026, con 806 descargas y 4 likes en el momento de la consulta; la comunidad de validacion es muy reducida.
- No se documenta soporte de tool calling ni de function calling, lo que limita su uso en pipelines de agentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LuffyTheFox/Qwen3.6-27B-Uncensored-Genesis-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive
- Perfil del autor del modelo base: https://huggingface.co/HauhauCS
- Script de cuantizacion: https://pastebin.com/hXhcMJn9
- Plantilla de chat: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF/raw/main/chat_template.jinja
- System prompt recomendado: https://huggingface.co/LuffyTheFox/Qwen3.6-27B-Uncensored-Genesis-GGUF/raw/main/System_Prompt.txt
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
- Distribucion de Marchenko-Pastur (referencia): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
