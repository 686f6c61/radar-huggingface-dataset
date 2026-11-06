# darkc0de/reap-teat

## Resumen

reap-teat es un modelo de lenguaje y vision (vision-language model) publicado por el usuario darkc0de en Hugging Face, distribuido exclusivamente en formato GGUF para su uso con llama.cpp. Segun los metadatos del repositorio, los pesos originales en safetensors suman 19.520.941.406 parametros, mientras que los nombres de fichero de la model card hacen referencia a un modelo base de 26B con 4B de parametros activos (esquema MoE), presuntamente derivado de la familia Gemma 4. El modelo se presenta como una variante "ultra-uncensored-heretic" sometida a un proceso de reduccion de expertos (REAP) y posteriormente cuantizada a GGUF mediante Unsloth.

La relevancia de esta publicacion es limitada y fundamentalmente practica: ofrece un artefacto listo para ejecutar en llama.cpp con soporte multimodal (proyeccion mmproj incluida) y con un sesgo declarado hacia la ausencia de filtros de seguridad. No obstante, la informacion disponible es muy escasa: no hay model card descriptiva, no se declaran licencia ni idiomas, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

Se trata, por tanto, de un modelo de interes para experimentacion local con llama.cpp y para quienes buscan variantes sin alineamiento de seguridad, pero sin garantias documentadas sobre procedencia exacta de los pesos, datos de entrenamiento ni evaluacion de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun nomenclatura del modelo base referido en los ficheros (gemma-4-26B-A4B); soporte vision-language con proyector multimodal mmproj |
| Parametros totales | 19.520.941.406 (pesos safetensors declarados); la nomenclatura del modelo base indica 26B |
| Parametros activos | 4B (segun la designacion "A4B" del nombre de fichero) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y Q4_K_M (ficheros publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con fichero mmproj para el proyector multimodal); pesos originales en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura mas alla de lo que se deduce de la nomenclatura de los ficheros. El nombre `gemma-4-26B-A4B-it-ultra-uncensored-heretic-REAP` sugiere un modelo base tipo Gemma 4 con arquitectura MoE de 26B parametros totales y 4B activos por token, en su variante instruida ("it"), posteriormente modificado mediante un proceso denominado REAP (reduccion o poda de expertos) y afinado hacia un comportamiento sin restricciones de seguridad ("ultra-uncensored-heretic"). La presencia de un fichero `mmproj` confirma que el modelo conserva la torre de vision y el proyector multimodal del modelo original.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre tecnicas de atencion o decodificacion especificas. La conversion a GGUF se realizo con las herramientas de Unsloth, segun declara la model card. Cualquier afirmacion adicional sobre el proceso de entrenamiento seria especulativa y no se incluye aqui.

## Capacidades

- Generacion de texto conversacional en formato instruido, segun la designacion "it" del modelo base.
- Procesamiento de imagenes y entradas multimodales, gracias al proyector mmproj incluido y al binario `llama-mtmd-cli`.
- Ejecucion local mediante llama.cpp, con soporte de plantillas de chat a traves del flag `--jinja`.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- Comportamiento sin alineamiento de seguridad declarado por el autor ("ultra-uncensored-heretic"), lo que implica ausencia de rechazos ante contenido sensible.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso, modo thinking ni capacidades de audio.

## Casos de uso

- Experimentacion local con modelos multimodales en llama.cpp: el fichero mmproj y el binario `llama-mtmd-cli` permiten probar inferencia imagen-texto en hardware de consumo sin dependencias de servicios en la nube.
- Investigacion sobre alineamiento y seguridad: al ser una variante declarada "uncensored", resulta util como contrapunto en estudios comparativos sobre tasas de rechazo, toxicidad y sesgo frente al modelo base alineado.
- Evaluacion de tecnicas de poda de expertos (REAP): permite medir el impacto de la reduccion de expertos en calidad, latencia y uso de memoria frente al modelo de 26B original.
- Despliegue en entornos aislados sin conectividad: al ser un artefacto GGUF autocontenido, puede ejecutarse en maquinas sin acceso a internet ni a APIs externas.
- Prototipado de asistentes conversacionales con entrada de imagenes: util para validar flujos de descripcion de imagenes o respuesta a preguntas visuales antes de invertir en infraestructura mayor.
- Pruebas de integracion con servidores compatibles con la API de OpenAI: el tag `endpoints_compatible` sugiere su uso con `llama-server` para exponer el modelo como endpoint HTTP en pipelines de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M de un modelo de ~20-26B parametros requiere aproximadamente 13-16 GB de VRAM o memoria unificada, coherente con un repositorio de 14,2 GB que incluye varios ficheros. El fichero BF16 requiere del orden de 40-52 GB.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el modelo completo en VRAM; una RTX 4080 (16 GB) queda al limite. Para BF16 se recomienda A100 80 GB o H100.
- Cabe en GPU de consumo: si, en el caso de la cuantizacion Q4_K_M con GPUs de 16 GB o mas, o mediante offload parcial a CPU con llama.cpp en equipos con menos VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), y por extension cualquier frontend compatible con GGUF como Ollama o LM Studio, aunque no se documenta soporte explicito.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| reap-teat | 19,5B (4B activos, MoE) | no disponible | no disponible | GGUF | Variante sin alineamiento, vision incluida |
| Gemma 2 27B | 27B | 8K | Gemma Terms | safetensors, GGUF | Modelo denso alineado, sin vision |
| Mixtral 8x7B | 46,7B (12,9B activos) | 32K | Apache 2.0 | safetensors, GGUF | MoE denso en expertos, sin vision |
| Qwen2-VL 7B | 8,3B | 32K | Apache 2.0 | safetensors, GGUF | Vision-language, alineado |

La comparacion es aproximada: no se dispone de datos de rendimiento del modelo evaluado, y la referencia a "Gemma 4" en la nomenclatura no corresponde a un modelo publico verificable en la informacion disponible. Los modelos alternativos se incluyen por categoria (MoE de tamano medio y vision-language de tamano similar).

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documentan datos de entrenamiento, evaluacion ni procedencia verificable de los pesos.
- El autor declara explicitamente un comportamiento "uncensored" y "heretic", lo que implica que el modelo puede generar contenido danino, ilegal o sexual sin filtros; no es apto para aplicaciones orientadas al publico sin capas de moderacion adicionales.
- Licencia no declarada: no puede asumirse uso comercial permitido; la herencia de la licencia del modelo base (presuntamente Gemma Terms) es incierta y debe verificarse antes de cualquier despliegue.
- Riesgo elevado de alucinacion y de degradacion de calidad tras el proceso de poda de expertos (REAP), sin benchmarks que lo cuantifiquen.
- Idiomas soportados no documentados; no se garantiza un rendimiento correcto en castellano.
- Longitud de contexto desconocida, lo que impide planificar casos de uso con documentos largos.
- Repositorio sin descargas ni interacciones: no hay evidencia de comunidad, validacion externa ni mantenimiento.
- El pipeline no esta declarado en Hugging Face, lo que puede afectar a la integracion automatica con librerias como transformers.

## Enlaces

- Hugging Face: https://huggingface.co/darkc0de/reap-teat
- Unsloth (herramienta de conversion declarada): https://github.com/unslothai/unsloth
- llama.cpp (runtime implicito): https://github.com/ggml-org/llama.cpp
