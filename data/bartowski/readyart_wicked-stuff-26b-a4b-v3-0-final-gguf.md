# bartowski/ReadyArt_Wicked-Stuff-26B-A4B-v3.0-Final-GGUF

## Resumen

Wicked-Stuff-26B-A4B-v3.0-Final es un modelo de lenguaje conversacional especializado en roleplay, ficción adulta explícita y narrativa de terror y violencia, publicado por el usuario ReadyArt en HuggingFace. El repositorio que se analiza aquí es la cuantización a GGUF realizada por bartowski con llama.cpp (release b11913) y distribución imatrix, pensada para ejecución local en hardware de consumo mediante llama.cpp, Ollama o LM Studio. El checkpoint de origen tiene 25.233.142.046 parámetros medidos sobre safetensors, es decir, unos 25,2 mil millones; la nomenclatura "A4B" del nombre sugiere una arquitectura de mezcla de expertos con unos 4.000 millones de parámetros activos, aunque la información disponible no lo confirma.

El modelo se declara "unaligned" y sin censura, con etiquetas explícitas de contenido adulto, erótico, horror y violencia, y está marcado como `not-for-all-audiences`. La model card indica soporte multimodal de entrada (texto, imagen y audio) mediante un fichero `mmproj` adicional, aunque ese fichero no aparece en el listado de archivos incluido en la información proporcionada. Solo se declara el inglés como idioma soportado y la licencia no está disponible, lo que impide determinar si su uso comercial está permitido.

Su relevancia práctica es acotada pero clara: cubre un nicho, el roleplay sin restricciones y la narrativa adulta, que los modelos generalistas suelen rechazar por sus políticas de seguridad, y lo hace con un tamaño (~25 B) que cabe en una GPU de 24 GB en cuantizaciones de 4 y 5 bits. A cambio, no hay benchmarks publicados, no hay licencia declarada y el modelo no está pensado para tareas de razonamiento, código o uso empresarial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la nomenclatura "A4B" del nombre sugiere mezcla de expertos, sin confirmación en la información disponible) |
| Parámetros totales | 25.233.142.046 (~25,2 B), medidos sobre safetensors del checkpoint base |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_1, Q4_K_S, IQ4_NL, Q3_K_L, Q4_0 (listado truncado en la información disponible) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (generado con llama.cpp b11913); el checkpoint base se distribuye con pesos safetensors |
| Cuantizador | bartowski, con calibración imatrix |
| Decodificación especulativa | No |
| Modalidades de entrada | Texto, imagen y audio según la model card (requiere fichero `mmproj`), aunque dicho fichero no figura en el listado de archivos disponible |
| Pipeline declarado | any-to-any |
| Etiquetas de contenido | nsfw, explicit, roleplay, unaligned, ERP, Erotic, Horror, Violence, adult-content, mature, not-for-all-audiences |
| Tamaño del repositorio | 411,9 GB (conjunto de todas las cuantizaciones) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base: no se especifica si se trata de un transformer denso, de una mezcla de expertos, de un modelo híbrido o de otra variante, ni se documentan el número de capas, las dimensiones ocultas o el mecanismo de atención. El sufijo "A4B" del nombre es consistente con la convención habitual para modelos de mezcla de expertos con aproximadamente 4.000 millones de parámetros activos por token, pero se trata de una inferencia a partir del nombre y no de un dato confirmado en la información proporcionada. Tampoco se publican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias; dado el enfoque "unaligned" del modelo, es de esperar que las fases de alineación hayan sido mínimas o inexistentes, pero no hay documentación al respecto.

Sí se documenta la plantilla de prompt, que sigue un formato de turnos tipo ChatML con etiquetas `<|turn>system`, `<|turn>user` y `<|turn>model`, e incluye un canal de razonamiento explícito delimitado por `<|channel>thought` y `<channel|>`. La plantilla contempla además bloques `<|tool>declaration:...<|tool|>` para definir funciones con esquema JSON de parámetros, lo que indica que el modelo fue entrenado con algún formato de tool calling, aunque no se detalla su calidad ni se aportan evaluaciones. La cuantización se ha realizado con llama.cpp b11913 aplicando matrices de importancia (imatrix) para preservar los pesos más sensibles en las cuantizaciones de baja precisión.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay e interpretación de personajes, con mantenimiento de persona y estilo narrativo.
- Escritura de ficción adulta explícita (ERP), contenido erótico y narrativa madura sin los filtros de rechazo habituales en modelos alineados.
- Narrativa de terror, violencia explícita y ficción oscura, según las etiquetas declaradas por el autor.
- Canal de razonamiento (`<|channel>thought`) integrado en la plantilla de prompt, que permite separar el razonamiento interno de la respuesta final.
- Soporte de tool calling mediante declaraciones de herramientas en formato JSON dentro del turno de sistema, según la plantilla documentada.
- Entrada multimodal (imagen y audio) cuando se acompaña del fichero `mmproj` correspondiente, de acuerdo con la model card; no verificable con los archivos listados.
- Capacidad multilingüe limitada al inglés: no se declaran otros idiomas.
- No se documentan capacidades específicas de código, matemáticas o agentes multi-paso más allá de lo que permita el formato de tool calling.

## Casos de uso

- Roleplay conversacional sin restricciones: el modelo mantiene personajes consistentes a lo largo de sesiones largas y acepta escenarios adultos que los modelos alineados rechazan, lo que lo hace adecuado para plataformas de rol literario y comunidades de escritura colaborativa.
- Escritura de ficción adulta y erótica asistida: útil como generador de borradores de escenas, diálogos y descripciones para autores de narrativa madura que necesitan una herramienta que no bloquee el contenido por políticas de seguridad.
- Narrativa de terror y género oscuro: la etiqueta explícita de horror y violencia lo orienta a la generación de atmósferas, descripciones gráficas y tramas de suspense para relatos, guiones o campañas de rol de mesa.
- Personajes no jugadores (NPC) en videojuegos para adultos: integrable mediante llama.cpp en un servidor local para generar respuestas dinámicas de personajes con memoria de conversación, siempre que la licencia lo permita (actualmente no determinable).
- Motores de historias interactivas y aventuras de texto: el canal de razonamiento y la plantilla de turnos permiten estructurar estados de escena y respuestas coherentes en aplicaciones de ficción interactiva.
- Prototipado de sistemas de herramientas conversacionales: la plantilla incluye declaraciones de funciones con esquema JSON, lo que permite experimentar con llamadas a herramientas en un entorno local sin dependencia de API, aunque sin garantías de fiabilidad.
- Descripción y ambientación a partir de imágenes: si se dispone del `mmproj`, puede convertir una imagen de referencia en descripciones narrativas o en punto de partida de una escena, un uso típico en flujos de escritura visual.
- Investigación sobre alineación y modelos "unaligned": útil como contrapunto experimental para estudiar comportamiento sin filtros, tasas de rechazo y deriva de contenido en condiciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto, y tampoco se aportan métricas de calidad de rol, coherencia narrativa o tasas de rechazo que permitan comparar el modelo con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + caché KV para contexto moderado): Q4_K_M (17,97 GB) requiere aproximadamente 20-22 GB; Q5_K_M (20,01 GB) unos 22-24 GB; Q6_K (23,79 GB) unos 26-28 GB; Q8_0 (26,86 GB) unos 29-31 GB; bf16 (50,51 GB) en torno a 53-56 GB.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB ejecutan sin problema Q6_K, Q8_0 e incluso bf16 en el caso de las de 80 GB.
- GPU de consumo de 24 GB (RTX 3090, RTX 4090): Q4_K_M, Q4_K_L, Q5_K_S y Q5_K_M caben con holgura; Q6_K entra con contexto reducido.
- GPU de consumo de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080): solo entran Q3_K_L (14,80 GB), Q4_0 (14,76 GB) e IQ4_NL (15,63 GB), y con contexto corto.
- GPU de 12 GB o menos: requieren offload parcial a RAM del sistema; el rendimiento cae de forma proporcional a la fracción de capas descargadas.
- Apple Silicon: los cuantizados Q4_1 se documentan como ventajosos en tokens por vatio; con 32 GB de memoria unificada se puede ejecutar Q4_K_M o Q5_K_M, y con 64 GB hasta Q8_0.
- Opciones de despliegue: llama.cpp (versión b11913 o superior), Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con la API de OpenAI. vLLM y TGI tienen soporte experimental o limitado de GGUF y no se recomiendan como vía principal.
- Latencia y throughput: no disponibles. Si la arquitectura es efectivamente de mezcla de expertos con ~4 B activos, la velocidad de decodificación sería comparable a la de un modelo de 4 B, aunque el requisito de memoria corresponde a los 25 B totales; este extremo no está confirmado.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus fichas públicas y no de la información proporcionada para este modelo; se incluyen como referencia orientativa.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Wicked-Stuff-26B-A4B-v3.0-Final (este) | 25,2 B (activos no disponibles) | No disponible | Roleplay NSFW y ficción adulta, sin alinear | No disponible | GGUF, safetensors |
| Qwen3-30B-A3B | 30,5 B totales / 3,3 B activos | 32 K nativos, ampliable con YaRN | Propósito general, razonamiento y código | Apache 2.0 | Safetensors, GGUF |
| Mistral Small 3.1 24B | 24 B densos | 128 K | Propósito general, instrucciones y tool calling | Apache 2.0 | Safetensors, GGUF |
| Gemma 3 27B | 27 B densos | 128 K | Propósito general, multilingüe y multimodal | Términos de uso de Gemma | Safetensors, GGUF |

La diferencia principal no es de rendimiento medible, ya que no hay benchmarks de este modelo, sino de propósito y de seguridad jurídica: las alternativas generalistas ofrecen licencias permisivas y contextos documentados, pero rechazan sistemáticamente contenido adulto explícito. Wicked-Stuff cubre ese hueco a costa de una licencia indeterminada, un contexto desconocido y ausencia total de evaluaciones públicas.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como `not-for-all-audiences` y produce de forma deliberada material explícito, violento y potencialmente perturbador; no debe desplegarse en entornos accesibles a menores ni en productos sin control de edad.
- Licencia indeterminada: al no declararse licencia, no puede asumirse permiso de uso comercial, redistribución o modificación. Cualquier uso en producción requiere contactar con el autor del modelo base.
- Contexto desconocido: se desconoce la longitud máxima de contexto soportada, lo que impide planificar despliegues con conversaciones largas o documentos extensos sin pruebas empíricas previas.
- Idioma: solo se declara inglés; el rendimiento en castellano es impredecible y probablemente deficiente en registro, gramática y coherencia cultural.
- Sesgos y alineación: al ser un modelo "unaligned", carece de las salvaguardas habituales frente a contenido dañino, instrucciones peligrosas o estereotipos; los sesgos de su corpus de entrenamiento no han sido documentados ni mitigados de forma conocida.
- Alucinación: no hay evaluaciones de fidelidad factual. En tareas de recuperación de datos, matemáticas o código la fiabilidad es baja esperable, dado el enfoque creativo del ajuste.
- Tool calling no verificado: la plantilla admite declaraciones de herramientas, pero no se aportan pruebas de que el modelo las invoque correctamente; no debe integrarse en pipelines críticos sin validación propia.
- Multimodalidad condicionada: el soporte de imagen y audio depende de un fichero `mmproj` que no aparece en el listado de archivos disponible; conviene verificar su existencia antes de planificar casos de uso multimodales.
- Madurez del repositorio: cero descargas y cero likes en el momento del análisis, sin discusiones ni reportes de la comunidad que permitan anticipar problemas de calidad o de compatibilidad.
- Fecha de creación declarada en 2026-10-27, posterior a la mayoría de referencias del ecosistema; conviene comprobar la versión de llama.cpp utilizada (b11913) para garantizar compatibilidad del GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/ReadyArt_Wicked-Stuff-26B-A4B-v3.0-Final-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v3.0-Final
- Cuantización recomendada Q4_K_M (17,97 GB): https://huggingface.co/bartowski/ReadyArt_Wicked-Stuff-26B-A4B-v3.0-Final-GGUF/blob/main/ReadyArt_Wicked-Stuff-26B-A4B-v3.0-Final-Q4_K_M.gguf
- Release de llama.cpp utilizada (b11913): https://github.com/ggml-org/llama.cpp/releases/tag/b11913
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp/
