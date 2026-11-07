# ElytronSystems/Qwen-3.8-Flash-Next-pulsar-k4

## Resumen

Qwen-3.8-Flash-Next-pulsar-k4 es un contenedor listo para servir publicado por ElytronSystems para el motor de inferencia pulsar, orientado especificamente al hardware NVIDIA DGX Spark (GB10). Empaqueta el modelo Qwen/Qwen3.8-Flash-Next cuantizado con EXL3 (K4 para expertos, K5 para lineales densos) junto con el borrador de bloques incoai/Qwen3.8-Flash-Next-DFlash2, basado en el diseno DFlash2 de z-lab, para decodificacion especulativa. Es, segun el autor, el modelo Qwen que sirve en produccion.

El modelo upstream es un transformer de tipo mixture-of-experts con 180B parametros, de los cuales aproximadamente 51B residen en la tabla PLE (probablemente una tabla de embeddings por capa o n-gramas). El contenedor incluye vision y soporta hasta 1M posiciones de contexto mediante RoPE YaRN con factor 4. La descarga total ronda los 169 GB: unos 67 GB de pesos y un fichero de filas n-grama PLE de 102 GB en BF16.

Su relevancia es practica: ofrece un despliegue empaquetado y optimizado para una estacion de trabajo concreta, con cuantizacion agresiva (4-5 bits) y decodificacion especulativa para reducir latencia. No es un modelo nuevo ni un checkpoint entrenado desde cero, sino una receta de cuantizacion y servicio reproducible identificada como `U-e4-d5-dflash2` sobre la revision `de4b8e4d43b917e7706784d8bb445c9af86a3540`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (base Qwen3.8-Flash-Next), con cabeza MTP sustituida por DFlash2 |
| Parametros totales | 180B upstream (aprox. 51B en la tabla PLE); el conteo automatico de Hugging Face es inferior porque cuenta los bytes empaquetados de EXL3 |
| Parametros activos | no disponible |
| Longitud de contexto | 1M posiciones con `--rope-yarn 4` |
| Tipos de cuantizacion | EXL3 K4 (expertos, ~4 bpw), EXL3 K5 (lineales densos y cabeza de salida, ~5 bpw), MXFP8 (capas densas restantes), BF16 (norms), BF16 (tabla PLE) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (pesos); borrador DFlash2 bajo Apache-2.0 |
| Formato de pesos | safetensors empaquetados para pulsar (EXL3 + MXFP8 + BF16), mas fichero `ple-l1.rows` externo |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos de 180B parametros con una tabla PLE de aproximadamente 51B parametros. La receta de cuantizacion `U-e4-d5-dflash2` aplica EXL3 a 4 bits por peso en los expertos y a 5 bits en los lineales densos y la cabeza de salida, mantiene el resto de capas densas en MXFP8 y deja las normas en BF16. La tabla PLE de la capa 1 se conserva en BF16 y se sirve desde disco como fichero de filas n-grama independiente, lo que explica los 102 GB adicionales sobre los 67 GB de pesos.

La innovacion principal es la decodificacion especulativa: se incorpora el borrador de bloques DFlash2 de incoai (diseno de z-lab) en el ultimo shard, que sustituye a la cabeza MTP (multi-token prediction) del modelo original, que no esta incluida. El contenedor incorpora vision. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que esta ficha describe un artefacto de cuantizacion y no el entrenamiento del modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.8-Flash-Next.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con vision incluida en el contenedor.
- Contexto largo de hasta 1M posiciones mediante RoPE YaRN con factor 4.
- Decodificacion especulativa con el borrador DFlash2 para acelerar la generacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia en DGX Spark: el contenedor esta disenado especificamente para el GB10, de modo que un equipo con esa plataforma puede arrancar `pulsar-server` apuntando al directorio descargado y servir el modelo sin conversion adicional.
- Analisis de documentos largos con imagenes: gracias al contexto de 1M posiciones y a la entrada image-text-to-text, se pueden procesar informes extensos con graficos o capturas en una sola pasada.
- Asistentes conversacionales de contexto amplio: la ventana de 1M tokens permite mantener historiales de conversacion muy largos o inyectar bases de conocimiento completas en el prompt.
- Prototipado de pipelines multimodales en local: al incluir vision y texto en un unico contenedor, sirve para validar flujos que combinan OCR, descripcion de imagenes y generacion de texto sin depender de APIs externas.
- Evaluacion de decodificacion especulativa: el borrador DFlash2 integrado permite medir en produccion la ganancia de throughput frente a la generacion autoregresiva estandar en el mismo hardware.
- Despliegue de referencia para comparativas de cuantizacion: la receta EXL3 K4/K5 + MXFP8 + BF16 permite estudiar el equilibrio entre calidad y memoria en un MoE de 180B sobre una estacion de trabajo.
- Inferencia con requisitos de privacidad: al ejecutarse integramente en local sobre NVMe, los datos no salen del equipo, lo que encaja en entornos con restricciones de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: la descarga completa ocupa aproximadamente 169 GB (67 GB de pesos + 102 GB de fichero PLE), que deben residir en NVMe local junto al contenedor.
- GPU objetivo: NVIDIA DGX Spark (GB10); el motor pulsar esta disenado para esa plataforma.
- GPU de consumo: no disponible; no se documenta compatibilidad con RTX 4090 u otras GPU de consumo.
- Despliegue: exclusivamente mediante pulsar (`./pulsar-server -m /path/to/qwen-container --rope-yarn 4`). Transformers, vLLM y llama.cpp no pueden leer este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| ElytronSystems/Qwen-3.8-Flash-Next-pulsar-k4 | 180B (aprox. 51B en PLE) | 1M (YaRN x4) | EXL3 K4/K5 + MXFP8 + BF16 | Qwen Community 1.0 | Solo pulsar (DGX Spark) |
| Qwen/Qwen3.8-Flash-Next | 180B (aprox. 51B en PLE) | no disponible | pesos originales | Qwen Community 1.0 | Ecosistema estandar (Transformers, vLLM, etc.) |
| incoai/Qwen3.8-Flash-Next-DFlash2 | borrador de bloques | no disponible | no disponible | Apache-2.0 | Borrador para decodificacion especulativa |

La comparativa se limita al ecosistema Qwen3.8-Flash-Next porque no se dispone de datos de rendimiento ni de alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- El contenedor solo funciona con el motor pulsar; no es cargable por Transformers, vLLM ni llama.cpp, lo que limita la portabilidad.
- Requiere mantener la carpeta completa unida en NVMe local, incluido el fichero `ple-l1.rows` de 102 GB, junto al contenedor.
- La licencia Qwen Community 1.0 exige revisar sus terminos antes de uso comercial; en particular, los servicios de Model as a Service y AI Work Assistant requieren una licencia separada de Qwen.
- El conteo de parametros mostrado por Hugging Face es incorrecto por el empaquetado EXL3, lo que puede confundir en herramientas de gestion de modelos.
- La cabeza MTP no esta incluida; se sustituye por el borrador DFlash2, por lo que no se dispone de esa funcionalidad original.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion en la informacion proporcionada.
- La cuantizacion a 4-5 bits puede degradar la calidad respecto a los pesos originales; no se aportan mediciones de esa perdida.
- No se dispone de benchmarks que permitan validar el rendimiento real del contenedor frente al modelo base.

## Enlaces

- [ElytronSystems/Qwen-3.8-Flash-Next-pulsar-k4 en Hugging Face](https://huggingface.co/ElytronSystems/Qwen-3.8-Flash-Next-pulsar-k4)
- [Qwen/Qwen3.8-Flash-Next en Hugging Face](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [incoai/Qwen3.8-Flash-Next-DFlash2 en Hugging Face](https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2)
- [Repositorio de pulsar](https://github.com/tylerwagler/pulsar)
- [Guia de instalacion de Qwen 3.8 Flash-Next (madebybrain.com)](https://madebybrain.com/en/blog/qwen-3-8-flash-next-installation-guide-2026)
